// src/controllers/topicController.ts
// Topic management controller

import { Request, Response } from 'express';
import { AuthenticatedRequest, ExamType } from '../types';
import { sendSuccess, sendError, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { getTopics } from '../services/topicService';
import { generateStudyPrompt } from '../services/aiService';

/**
 * Get topics with filters
 * GET /api/topics
 */
export const searchTopics = asyncHandler(async (req: Request, res: Response) => {
    const { college, subject, semester, branch, examType, part } = req.query;

    if (!college || !subject || !semester || !branch || !examType) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Missing required parameters: college, subject, semester, branch, examType',
            400
        );
    }

    const result = await getTopics(
        college as string,
        subject as string,
        semester as string,
        branch as string,
        examType as ExamType,
        part as 'A' | 'B' | undefined
    );

    return sendSuccess(res, result);
});

/**
 * Generate study prompt
 * POST /api/topics/prompt
 */
export const getStudyPrompt = asyncHandler(async (req: Request, res: Response) => {
    const { part, examType, topics } = req.body;

    if (!part || !examType || !topics || !Array.isArray(topics) || topics.length === 0) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Missing required parameters: part, examType, topics',
            400
        );
    }

    const prompt = generateStudyPrompt(
        part as 'A' | 'B',
        examType as ExamType,
        topics as string[]
    );

    return sendSuccess(res, { prompt });
});

export default {
    searchTopics,
    getStudyPrompt,
};
