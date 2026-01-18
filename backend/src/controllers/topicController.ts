// src/controllers/topicController.ts
// Topic management controller

import { Request, Response } from 'express';
import { AuthenticatedRequest, ExamType } from '../types';
import { sendSuccess, sendError, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { getTopics, getTopTopics } from '../services/topicService';
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
 * Get top topics (Top 40 Part A, Top 20 Part B)
 * GET /api/topics/top
 */
export const getTopTopicsHandler = asyncHandler(async (req: Request, res: Response) => {
    const { college, subject, semester, examType } = req.query;

    if (!college || !subject || !semester || !examType) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Missing required parameters: college, subject, semester, examType',
            400
        );
    }

    const result = await getTopTopics(
        college as string,
        subject as string,
        semester as string,
        examType as ExamType
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
    getTopTopicsHandler,
    getStudyPrompt,
};
