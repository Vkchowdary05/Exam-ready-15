// src/controllers/adminController.ts
// Admin management controller

import { Response } from 'express';
import { User, Paper, Notification } from '../models';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError, sendPaginatedSuccess, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { awardCredits, checkAndUnlockBadges } from '../services/badgeService';
import { deleteFile } from '../services/uploadService';
import { decrementTopicsForPaper } from '../services/topicService';
import { logger } from '../utils/logger';

/**
 * Get flagged papers
 * GET /api/admin/papers/flagged
 */
export const getFlaggedPapers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [papers, totalCount] = await Promise.all([
            Paper.find({ flagged: true })
                .populate('uploadedBy', 'name email profilePicture')
                .populate('flags.reportedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Paper.countDocuments({ flagged: true }),
        ]);

        return sendPaginatedSuccess(res, papers, totalCount, Number(page), Number(limit));
    }
);

/**
 * Verify paper
 * PUT /api/admin/papers/:id/verify
 */
export const verifyPaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const { verified } = req.body;

        const paper = await Paper.findById(id);
        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        paper.verified = verified;
        paper.verifiedBy = verified ? req.user._id : undefined;
        paper.flagged = false;
        paper.flags = [];

        await paper.save();

        // Award bonus credits if verified
        if (verified) {
            await awardCredits(paper.uploadedBy, 5, 'Paper verified');
            await checkAndUnlockBadges(paper.uploadedBy);

            // Notify uploader
            await Notification.create({
                userId: paper.uploadedBy,
                type: 'verification',
                title: 'Your paper has been verified!',
                message: `Your ${paper.subject} paper has been verified by a moderator. You earned 5 bonus credits!`,
                data: { paperId: paper._id },
            });
        }

        return sendSuccess(res, paper, verified ? 'Paper verified' : 'Paper verification removed');
    }
);

/**
 * Admin delete paper
 * DELETE /api/admin/papers/:id
 */
export const adminDeletePaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const { reason } = req.body;

        const paper = await Paper.findById(id);
        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Delete image
        try {
            const publicId = paper.originalImage.split('/').slice(-2).join('/').split('.')[0];
            await deleteFile(publicId);
        } catch (error) {
            logger.error('Error deleting image:', error);
        }

        // Decrement topic counts
        await decrementTopicsForPaper(paper._id);

        // Notify uploader
        await Notification.create({
            userId: paper.uploadedBy,
            type: 'system',
            title: 'Your paper has been removed',
            message: reason || 'Your paper has been removed by a moderator.',
            data: { subject: paper.subject },
        });

        await Paper.findByIdAndDelete(id);

        return sendSuccess(res, null, 'Paper deleted by admin');
    }
);

/**
 * Get all users (admin panel)
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { search, role, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            query.role = role;
        }

        const [users, totalCount] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            User.countDocuments(query),
        ]);

        return sendPaginatedSuccess(res, users, totalCount, Number(page), Number(limit));
    }
);

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'moderator', 'admin'].includes(role)) {
            return sendError(res, ErrorTypes.VALIDATION_ERROR, 'Invalid role', 400);
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'User not found', 404);
        }

        // Notify user of role change
        await Notification.create({
            userId: user._id,
            type: 'system',
            title: 'Your account role has been updated',
            message: `Your role has been changed to ${role}.`,
        });

        return sendSuccess(res, user, 'User role updated');
    }
);

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
export const getAdminStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalPapers,
            verifiedPapers,
            flaggedPapers,
            activeToday,
            newUsersThisWeek,
        ] = await Promise.all([
            User.countDocuments(),
            Paper.countDocuments(),
            Paper.countDocuments({ verified: true }),
            Paper.countDocuments({ flagged: true }),
            User.countDocuments({ updatedAt: { $gte: today } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
        ]);

        return sendSuccess(res, {
            totalUsers,
            totalPapers,
            verifiedPapers,
            flaggedPapers,
            activeToday,
            newUsersThisWeek,
        });
    }
);

export default {
    getFlaggedPapers,
    verifyPaper,
    adminDeletePaper,
    getUsers,
    updateUserRole,
    getAdminStats,
};
