// src/services/aiService.ts
// AI service for metadata extraction (Gemini or mock)

import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ExamType, IQuestion } from '../types';

export interface AIExtractionResult {
    metadata: {
        college: string;
        subject: string;
        semester: string;
        branch: string;
        examType: ExamType;
        year: number;
        month: string;
        confidence: number;
    };
    formattedText: {
        partA: IQuestion[];
        partB: IQuestion[];
    };
}

/**
 * Extract metadata and format questions from OCR text
 */
export async function extractMetadataFromText(ocrText: string): Promise<AIExtractionResult> {
    if (env.USE_MOCK_AI || !env.GEMINI_API_KEY) {
        return mockAIExtraction(ocrText);
    }

    return geminiAIExtraction(ocrText);
}

/**
 * Mock AI extraction for development
 */
function mockAIExtraction(ocrText: string): AIExtractionResult {
    logger.info('Using mock AI service');

    // Try to extract some info from the text
    const currentYear = new Date().getFullYear();

    return {
        metadata: {
            college: 'Engineering College',
            subject: 'Data Structures and Algorithms',
            semester: '3',
            branch: 'Computer Science Engineering',
            examType: 'semester',
            year: currentYear,
            month: 'May',
            confidence: 0.85,
        },
        formattedText: {
            partA: [
                { questionNumber: 1, question: 'Define an algorithm and list its properties.', marks: 2, topic: 'Introduction to Algorithms' },
                { questionNumber: 2, question: 'What is time complexity? Give examples.', marks: 2, topic: 'Algorithm Analysis' },
                { questionNumber: 3, question: 'Explain the difference between stack and queue.', marks: 2, topic: 'Linear Data Structures' },
                { questionNumber: 4, question: 'What is a binary search tree?', marks: 2, topic: 'Trees' },
                { questionNumber: 5, question: 'Define graph and its types.', marks: 2, topic: 'Graph Theory' },
                { questionNumber: 6, question: 'What is hashing?', marks: 2, topic: 'Hashing' },
                { questionNumber: 7, question: 'Explain recursion with an example.', marks: 2, topic: 'Recursion' },
                { questionNumber: 8, question: 'What is a linked list?', marks: 2, topic: 'Linked Lists' },
                { questionNumber: 9, question: 'Define sorting. Name any two sorting algorithms.', marks: 2, topic: 'Sorting Algorithms' },
                { questionNumber: 10, question: 'What is dynamic programming?', marks: 2, topic: 'Dynamic Programming' },
            ],
            partB: [
                { questionNumber: 11, question: 'Explain the different asymptotic notations used in algorithm analysis.', marks: 16, topic: 'Algorithm Analysis' },
                { questionNumber: 12, question: 'Implement a stack using arrays and explain all operations.', marks: 16, topic: 'Stacks' },
                { questionNumber: 13, question: 'Explain different tree traversal techniques with examples.', marks: 16, topic: 'Tree Traversals' },
                { questionNumber: 14, question: 'Explain Dijkstra\'s shortest path algorithm.', marks: 16, topic: 'Graph Algorithms' },
                { questionNumber: 15, question: 'Explain merge sort algorithm with time complexity analysis.', marks: 16, topic: 'Sorting Algorithms' },
            ],
        },
    };
}

/**
 * Real AI extraction using Google Gemini API
 */
async function geminiAIExtraction(ocrText: string): Promise<AIExtractionResult> {
    const prompt = `Extract and format the following examination paper text.

Identify:
- College name
- Subject
- Semester (as a number like "1", "2", etc.)
- Branch/Department
- Exam type (one of: "semester", "midterm1", "midterm2")
- Year (as a 4-digit number)
- Month

Format questions into:
- Part-A: Short answer questions (typically 1-2 marks)
- Part-B: Long answer questions (typically 10+ marks)

For each question, identify the topic it belongs to.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "metadata": {
    "college": "string",
    "subject": "string",
    "semester": "string",
    "branch": "string",
    "examType": "semester" | "midterm1" | "midterm2",
    "year": number,
    "month": "string",
    "confidence": number (0-1)
  },
  "formattedText": {
    "partA": [
      { "questionNumber": number, "question": "string", "marks": number, "topic": "string" }
    ],
    "partB": [
      { "questionNumber": number, "question": "string", "marks": number, "topic": "string" }
    ]
  }
}

Here is the examination paper text:

${ocrText}`;

    try {
        logger.info('Calling Gemini API for metadata extraction...');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 4000,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json() as {
            candidates?: Array<{
                content?: {
                    parts?: Array<{ text?: string }>;
                };
            }>;
        };

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const content = data.candidates[0].content.parts?.[0]?.text || '';

            // Try to parse JSON from the response
            // Remove markdown code blocks if present
            let jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                logger.info('Gemini AI extraction successful');
                return result as AIExtractionResult;
            }
        }

        throw new Error('Failed to parse Gemini response');
    } catch (error) {
        logger.error('AI extraction error:', error);
        // Fall back to mock on error
        return mockAIExtraction(ocrText);
    }
}

/**
 * Generate a prompt for studying topics
 */
export function generateStudyPrompt(
    part: 'A' | 'B',
    examType: ExamType,
    topics: string[]
): string {
    const isSemester = examType === 'semester';

    if (part === 'A') {
        return JSON.stringify({
            instruction: 'Prepare short answers for the following topics',
            format: 'Question-Answer format',
            topics,
            constraints: {
                minWords: 20,
                maxWords: 50,
                includeExample: true,
                includeDefinition: true,
            },
        }, null, 2);
    }

    // Part B
    if (isSemester) {
        return JSON.stringify({
            instruction: 'Prepare detailed answers for the following topics',
            format: 'Long answer format with sections',
            topics,
            constraints: {
                wordCount: 400,
                includeDiagrams: true,
                includeExamples: true,
                totalPages: 6,
                sections: ['Introduction', 'Explanation', 'Example', 'Diagram', 'Conclusion'],
            },
        }, null, 2);
    }

    // Midterm Part B
    return JSON.stringify({
        instruction: 'Prepare medium-length answers for the following topics',
        format: 'Structured answer format',
        topics,
        constraints: {
            wordCount: 250,
            includeDiagram: true,
            includeExample: true,
        },
    }, null, 2);
}

export default {
    extractMetadataFromText,
    generateStudyPrompt,
};
