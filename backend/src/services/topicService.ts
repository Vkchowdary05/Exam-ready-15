// src/services/topicService.ts
// Topic counting and management service

import { Types } from 'mongoose';
import stringSimilarity from 'string-similarity';
import { TopicCount, Paper } from '../models';
import { IQuestion, ExamType, ITopicEntry } from '../types';
import { logger } from '../utils/logger';

const SIMILARITY_THRESHOLD = 0.85;

/**
 * Normalize topic name for comparison
 */
function normalizeTopic(topic: string): string {
    return topic.trim().toLowerCase().replace(/[^\w\s]/g, '');
}

/**
 * Find similar topic in existing topics
 */
function findSimilarTopic(topicName: string, existingTopics: ITopicEntry[]): ITopicEntry | null {
    const normalized = normalizeTopic(topicName);

    for (const existing of existingTopics) {
        const existingNormalized = normalizeTopic(existing.name);

        // Exact match
        if (normalized === existingNormalized) {
            return existing;
        }

        // Fuzzy match
        const similarity = stringSimilarity.compareTwoStrings(normalized, existingNormalized);
        if (similarity >= SIMILARITY_THRESHOLD) {
            return existing;
        }
    }

    return null;
}

/**
 * Increment topic counts for a paper
 */
export async function incrementTopicsForPaper(
    paperId: Types.ObjectId,
    college: string,
    subject: string,
    semester: string,
    branch: string,
    examType: ExamType,
    partAQuestions: IQuestion[],
    partBQuestions: IQuestion[]
): Promise<void> {
    // Process Part A topics
    await processPartTopics(
        paperId,
        college,
        subject,
        semester,
        branch,
        examType,
        'A',
        partAQuestions.map((q) => q.topic).filter(Boolean)
    );

    // Process Part B topics
    await processPartTopics(
        paperId,
        college,
        subject,
        semester,
        branch,
        examType,
        'B',
        partBQuestions.map((q) => q.topic).filter(Boolean)
    );
}

/**
 * Process topics for a specific part
 */
async function processPartTopics(
    paperId: Types.ObjectId,
    college: string,
    subject: string,
    semester: string,
    branch: string,
    examType: ExamType,
    part: 'A' | 'B',
    topics: string[]
): Promise<void> {
    if (topics.length === 0) return;

    // Find or create TopicCount document
    let topicCount = await TopicCount.findOne({
        college: { $regex: new RegExp(`^${college}$`, 'i') },
        subject: { $regex: new RegExp(`^${subject}$`, 'i') },
        semester,
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        examType,
        part,
    });

    if (!topicCount) {
        topicCount = new TopicCount({
            college,
            subject,
            semester,
            branch,
            examType,
            part,
            topics: [],
        });
    }

    // Process each topic
    for (const topic of topics) {
        if (!topic || topic.trim() === '') continue;

        const similarTopic = findSimilarTopic(topic, topicCount.topics);

        if (similarTopic) {
            // Increment existing topic
            similarTopic.count += 1;
            similarTopic.lastOccurred = new Date();
            if (!similarTopic.papers.some((p) => p.equals(paperId))) {
                similarTopic.papers.push(paperId);
            }
        } else {
            // Add new topic
            topicCount.topics.push({
                name: topic.trim(),
                count: 1,
                lastOccurred: new Date(),
                papers: [paperId],
            });
        }
    }

    await topicCount.save();
    logger.info(`Updated topics for ${subject} Part ${part}`);
}

/**
 * Get topics for a specific filter combination
 */
export async function getTopics(
    college: string,
    subject: string,
    semester: string,
    branch: string,
    examType: ExamType,
    part?: 'A' | 'B'
): Promise<{ partA: { topics: ITopicEntry[]; total: number }; partB: { topics: ITopicEntry[]; total: number } }> {
    const baseQuery = {
        college: { $regex: new RegExp(`^${college}$`, 'i') },
        subject: { $regex: new RegExp(`^${subject}$`, 'i') },
        semester,
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        examType,
    };

    // Determine limits based on exam type
    const isExamSemester = examType === 'semester';
    const partALimit = isExamSemester ? 40 : 25;
    const partBLimit = isExamSemester ? 25 : 10;

    let partATopics: ITopicEntry[] = [];
    let partBTopics: ITopicEntry[] = [];
    let partATotal = 0;
    let partBTotal = 0;

    if (!part || part === 'A') {
        const partADoc = await TopicCount.findOne({ ...baseQuery, part: 'A' });
        if (partADoc) {
            partATotal = partADoc.topics.length;
            partATopics = [...partADoc.topics]
                .sort((a, b) => b.count - a.count)
                .slice(0, partALimit);
        }
    }

    if (!part || part === 'B') {
        const partBDoc = await TopicCount.findOne({ ...baseQuery, part: 'B' });
        if (partBDoc) {
            partBTotal = partBDoc.topics.length;
            partBTopics = [...partBDoc.topics]
                .sort((a, b) => b.count - a.count)
                .slice(0, partBLimit);
        }
    }

    return {
        partA: { topics: partATopics, total: partATotal },
        partB: { topics: partBTopics, total: partBTotal },
    };
}

/**
 * Decrement topic counts when a paper is deleted
 */
export async function decrementTopicsForPaper(paperId: Types.ObjectId): Promise<void> {
    const paper = await Paper.findById(paperId);
    if (!paper) return;

    const allTopics = [
        ...(paper.formattedText.partA?.map((q) => ({ topic: q.topic, part: 'A' as const })) || []),
        ...(paper.formattedText.partB?.map((q) => ({ topic: q.topic, part: 'B' as const })) || []),
    ];

    for (const { topic, part } of allTopics) {
        if (!topic) continue;

        const topicCount = await TopicCount.findOne({
            college: paper.college,
            subject: paper.subject,
            semester: paper.semester,
            branch: paper.branch,
            examType: paper.examType,
            part,
        });

        if (topicCount) {
            const existingTopic = topicCount.topics.find(
                (t) => normalizeTopic(t.name) === normalizeTopic(topic)
            );

            if (existingTopic) {
                existingTopic.count = Math.max(0, existingTopic.count - 1);
                existingTopic.papers = existingTopic.papers.filter((p) => !p.equals(paperId));

                // Remove topic if count is 0
                if (existingTopic.count === 0) {
                    topicCount.topics = topicCount.topics.filter(
                        (t) => normalizeTopic(t.name) !== normalizeTopic(topic)
                    );
                }

                await topicCount.save();
            }
        }
    }
}

/**
 * Get top topics for a specific filter combination
 * Returns Top 40 Part A topics and Top 20 Part B topics sorted by count
 */
export async function getTopTopics(
    college: string,
    subject: string,
    semester: string,
    examType: ExamType
): Promise<{ partA: { topics: ITopicEntry[]; total: number }; partB: { topics: ITopicEntry[]; total: number } }> {
    const baseQuery = {
        college: { $regex: new RegExp(`^${college}$`, 'i') },
        subject: { $regex: new RegExp(`^${subject}$`, 'i') },
        semester,
        examType,
    };

    // Fixed limits: Top 40 for Part A, Top 20 for Part B
    const PART_A_LIMIT = 40;
    const PART_B_LIMIT = 20;

    let partATopics: ITopicEntry[] = [];
    let partBTopics: ITopicEntry[] = [];
    let partATotal = 0;
    let partBTotal = 0;

    // Get Part A topics - aggregate from all branches
    const partADocs = await TopicCount.find({ ...baseQuery, part: 'A' }).lean();
    if (partADocs.length > 0) {
        // Merge topics from all branches
        const topicMap = new Map<string, ITopicEntry>();
        for (const doc of partADocs) {
            for (const topic of doc.topics) {
                if (topic.count === 0) continue; // Skip zero-count topics
                const normalized = topic.name.toLowerCase().trim();
                const topicData = topic as ITopicEntry; // Type assertion since lean() returns plain objects

                if (topicMap.has(normalized)) {
                    const existing = topicMap.get(normalized)!;
                    existing.count += topicData.count;
                    // Use Set to ensure unique paper IDs strings
                    const allPapers = new Set([...existing.papers.map(p => p.toString()), ...topicData.papers.map(p => p.toString())]);
                    existing.papers = Array.from(allPapers).map(id => new Types.ObjectId(id));

                    if (new Date(topicData.lastOccurred) > new Date(existing.lastOccurred)) {
                        existing.lastOccurred = topicData.lastOccurred;
                    }
                } else {
                    topicMap.set(normalized, {
                        name: topicData.name,
                        count: topicData.count,
                        lastOccurred: topicData.lastOccurred,
                        papers: topicData.papers
                    });
                }
            }
        }
        partATotal = topicMap.size;
        partATopics = [...topicMap.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, PART_A_LIMIT);
    }

    // Get Part B topics - aggregate from all branches
    const partBDocs = await TopicCount.find({ ...baseQuery, part: 'B' }).lean();
    if (partBDocs.length > 0) {
        const topicMap = new Map<string, ITopicEntry>();
        for (const doc of partBDocs) {
            for (const topic of doc.topics) {
                if (topic.count === 0) continue; // Skip zero-count topics
                const normalized = topic.name.toLowerCase().trim();
                const topicData = topic as ITopicEntry;

                if (topicMap.has(normalized)) {
                    const existing = topicMap.get(normalized)!;
                    existing.count += topicData.count;
                    const allPapers = new Set([...existing.papers.map(p => p.toString()), ...topicData.papers.map(p => p.toString())]);
                    existing.papers = Array.from(allPapers).map(id => new Types.ObjectId(id));

                    if (new Date(topicData.lastOccurred) > new Date(existing.lastOccurred)) {
                        existing.lastOccurred = topicData.lastOccurred;
                    }
                } else {
                    topicMap.set(normalized, {
                        name: topicData.name,
                        count: topicData.count,
                        lastOccurred: topicData.lastOccurred,
                        papers: topicData.papers
                    });
                }
            }
        }
        partBTotal = topicMap.size;
        partBTopics = [...topicMap.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, PART_B_LIMIT);
    }

    return {
        partA: { topics: partATopics, total: partATotal },
        partB: { topics: partBTopics, total: partBTotal },
    };
}

export default {
    incrementTopicsForPaper,
    getTopics,
    getTopTopics,
    decrementTopicsForPaper,
};
