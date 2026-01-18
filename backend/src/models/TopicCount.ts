// src/models/TopicCount.ts
// TopicCount model for tracking topic frequencies

import mongoose, { Schema, Model } from 'mongoose';
import { ITopicCountDocument, ITopicEntry, ExamType } from '../types';

// Topic entry sub-schema
const topicEntrySchema = new Schema<ITopicEntry>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        count: {
            type: Number,
            default: 1,
            min: 0,
        },
        lastOccurred: {
            type: Date,
            default: Date.now,
        },
        papers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Paper',
            },
        ],
    },
    { _id: false }
);

// TopicCount schema
const topicCountSchema = new Schema<ITopicCountDocument>(
    {
        college: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        semester: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        branch: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        examType: {
            type: String,
            enum: ['semester', 'midterm1', 'midterm2'],
            required: true,
            index: true,
        },
        part: {
            type: String,
            enum: ['A', 'B'],
            required: true,
        },
        topics: {
            type: [topicEntrySchema],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Compound unique index for deduplication
topicCountSchema.index(
    {
        college: 1,
        subject: 1,
        semester: 1,
        branch: 1,
        examType: 1,
        part: 1,
    },
    { unique: true, name: 'unique_topic_group' }
);

// Index for sorting topics by count
topicCountSchema.index({ 'topics.count': -1 }, { name: 'topic_frequency' });

// Method: Increment topic count or add new topic
topicCountSchema.methods.incrementTopic = function (
    topicName: string,
    paperId: mongoose.Types.ObjectId
): void {
    const normalizedName = topicName.trim().toLowerCase();

    // Find existing topic (case-insensitive)
    const existingTopic = this.topics.find(
        (t: ITopicEntry) => t.name.toLowerCase() === normalizedName
    );

    if (existingTopic) {
        existingTopic.count += 1;
        existingTopic.lastOccurred = new Date();
        if (!existingTopic.papers.includes(paperId)) {
            existingTopic.papers.push(paperId);
        }
    } else {
        // Add new topic with original casing
        this.topics.push({
            name: topicName.trim(),
            count: 1,
            lastOccurred: new Date(),
            papers: [paperId],
        });
    }
};

// Method: Get top topics sorted by count
topicCountSchema.methods.getTopTopics = function (limit: number): ITopicEntry[] {
    return [...this.topics]
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

// Create and export model
const TopicCount: Model<ITopicCountDocument> = mongoose.model<ITopicCountDocument>(
    'TopicCount',
    topicCountSchema
);

export default TopicCount;
