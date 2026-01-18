// src/controllers/statsController.ts
// Statistics controller

import { Request, Response } from 'express';
import { User, Paper, TopicCount } from '../models';
import { sendSuccess, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get platform overview statistics
 * GET /api/stats
 */
export const getPlatformStats = asyncHandler(async (req: Request, res: Response) => {
    const [totalUsers, totalPapers, collegesResult, topicsResult] = await Promise.all([
        User.countDocuments(),
        Paper.countDocuments(),
        Paper.distinct('college'),
        TopicCount.aggregate([
            { $unwind: '$topics' },
            { $count: 'total' },
        ]),
    ]);

    return sendSuccess(res, {
        totalUsers,
        totalPapers,
        totalColleges: collegesResult.length,
        totalTopics: topicsResult[0]?.total || 0,
    });
});

/**
 * Get unique colleges
 * GET /api/stats/colleges
 */
export const getColleges = asyncHandler(async (req: Request, res: Response) => {
    const colleges = await Paper.distinct('college');
    return sendSuccess(res, colleges.sort());
});

/**
 * Get unique subjects
 * GET /api/stats/subjects
 */
export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
    const { college } = req.query;

    let query = {};
    if (college) {
        query = { college: { $regex: new RegExp(college as string, 'i') } };
    }

    const subjects = await Paper.distinct('subject', query);
    return sendSuccess(res, subjects.sort());
});

/**
 * Get unique branches
 * GET /api/stats/branches
 */
export const getBranches = asyncHandler(async (req: Request, res: Response) => {
    const { college } = req.query;

    let query = {};
    if (college) {
        query = { college: { $regex: new RegExp(college as string, 'i') } };
    }

    const branches = await Paper.distinct('branch', query);
    return sendSuccess(res, branches.sort());
});

/**
 * Get unique semesters
 * GET /api/stats/semesters
 */
export const getSemesters = asyncHandler(async (req: Request, res: Response) => {
    const { college, branch } = req.query;

    let query: any = {};
    if (college) {
        query.college = { $regex: new RegExp(college as string, 'i') };
    }
    if (branch) {
        query.branch = { $regex: new RegExp(branch as string, 'i') };
    }

    const semesters = await Paper.distinct('semester', query);
    return sendSuccess(res, semesters.sort());
});

/**
 * Get trending topics and papers
 * GET /api/stats/trending
 */
export const getTrending = asyncHandler(async (req: Request, res: Response) => {
    const { period = 'week' } = req.query;

    const daysAgo = period === 'month' ? 30 : 7;
    const dateLimit = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Get trending papers
    const trendingPapers = await Paper.find({ createdAt: { $gte: dateLimit } })
        .sort({ likes: -1, viewCount: -1 })
        .limit(10)
        .populate('uploadedBy', 'name profilePicture');

    // Get most viewed subjects
    const trendingSubjects = await Paper.aggregate([
        { $match: { createdAt: { $gte: dateLimit } } },
        { $group: { _id: '$subject', views: { $sum: '$viewCount' }, papers: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
    ]);

    return sendSuccess(res, {
        papers: trendingPapers,
        subjects: trendingSubjects,
    });
});

export default {
    getPlatformStats,
    getColleges,
    getSubjects,
    getBranches,
    getSemesters,
    getTrending,
};
