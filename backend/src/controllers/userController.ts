// src/controllers/userController.ts
// User management controller

import { Response } from 'express';
import { User, Paper, Notification } from '../models';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError, sendPaginatedSuccess, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadFile, deleteFile } from '../services/uploadService';
import { checkAndUnlockBadges } from '../services/badgeService';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        return sendSuccess(res, req.user.toJSON());
    }
);

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { name, bio, college, branch, semester, socialLinks } = req.body;

        // Update fields
        if (name) req.user.name = name;
        if (bio !== undefined) req.user.bio = bio;
        if (college) req.user.college = college;
        if (branch) req.user.branch = branch;
        if (semester) req.user.semester = semester;
        if (socialLinks) {
            req.user.socialLinks = {
                ...req.user.socialLinks,
                ...socialLinks,
            };
        }

        await req.user.save();

        return sendSuccess(res, req.user.toJSON(), 'Profile updated successfully');
    }
);

/**
 * Update user settings
 * PUT /api/users/settings
 */
export const updateSettings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { theme, preferences } = req.body;

        if (theme) req.user.theme = theme;
        if (preferences) {
            req.user.preferences = {
                ...req.user.preferences,
                ...preferences,
            };
        }

        await req.user.save();

        return sendSuccess(res, req.user.toJSON(), 'Settings updated successfully');
    }
);

/**
 * Upload profile picture
 * POST /api/users/profile-picture
 */
export const uploadProfilePicture = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        if (!req.file) {
            return sendError(res, ErrorTypes.VALIDATION_ERROR, 'Please upload an image', 400);
        }

        // Delete old profile picture if exists
        if (req.user.profilePicture) {
            try {
                const oldPublicId = req.user.profilePicture.split('/').slice(-2).join('/').split('.')[0];
                await deleteFile(oldPublicId);
            } catch (error) {
                // Ignore delete errors
            }
        }

        // Upload new image
        const { url } = await uploadFile(req.file, 'profile-pictures');
        req.user.profilePicture = url;
        await req.user.save();

        return sendSuccess(res, { profilePicture: url }, 'Profile picture updated');
    }
);

/**
 * Get user statistics
 * GET /api/users/stats
 */
export const getStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        // Get total uploads
        const totalUploads = await Paper.countDocuments({ uploadedBy: req.user._id });

        // Get total likes received
        const likesResult = await Paper.aggregate([
            { $match: { uploadedBy: req.user._id } },
            { $group: { _id: null, totalLikes: { $sum: '$likes' }, totalViews: { $sum: '$viewCount' } } },
        ]);

        const totalLikes = likesResult[0]?.totalLikes || 0;
        const totalViews = likesResult[0]?.totalViews || 0;

        // Get user rank (by total likes)
        const rankResult = await Paper.aggregate([
            { $group: { _id: '$uploadedBy', totalLikes: { $sum: '$likes' } } },
            { $sort: { totalLikes: -1 } },
        ]);

        const userRankIndex = rankResult.findIndex(
            (r) => r._id.toString() === req.user!._id.toString()
        );
        const rank = userRankIndex === -1 ? rankResult.length + 1 : userRankIndex + 1;

        return sendSuccess(res, {
            totalUploads,
            totalLikes,
            totalViews,
            badgeCount: req.user.badges.length,
            rank,
            credits: req.user.credits,
            badges: req.user.badges,
        });
    }
);

/**
 * Get leaderboard
 * GET /api/users/leaderboard
 */
export const getLeaderboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { filter = 'global', period = 'all', college, subject, page = 1, limit = 20 } = req.query;

        // Build date filter
        let dateFilter = {};
        if (period === 'week') {
            dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
        } else if (period === 'month') {
            dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
        }

        // Build match filter
        let matchFilter: any = { ...dateFilter };
        if (filter === 'college' && college) {
            matchFilter.college = { $regex: new RegExp(college as string, 'i') };
        }

        // Aggregate leaderboard
        const leaderboard = await Paper.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$uploadedBy',
                    totalLikes: { $sum: '$likes' },
                    totalUploads: { $sum: 1 },
                },
            },
            { $sort: { totalLikes: -1 } },
            { $skip: ((page as number) - 1) * (limit as number) },
            { $limit: limit as number },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    user: {
                        _id: '$user._id',
                        name: '$user.name',
                        profilePicture: '$user.profilePicture',
                        college: '$user.college',
                    },
                    totalLikes: 1,
                    totalUploads: 1,
                    badges: '$user.badges',
                },
            },
        ]);

        // Add rank numbers
        const startRank = ((page as number) - 1) * (limit as number) + 1;
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: startRank + index,
            ...entry,
        }));

        return sendSuccess(res, rankedLeaderboard);
    }
);

/**
 * Change password
 * PUT /api/users/change-password
 */
export const changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'User not found', 404);
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return sendError(res, ErrorTypes.INVALID_CREDENTIALS, 'Current password is incorrect', 400);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return sendSuccess(res, null, 'Password changed successfully');
    }
);

/**
 * Add bookmark
 * POST /api/users/bookmark/:paperId
 */
export const addBookmark = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { paperId } = req.params;

        // Check if paper exists
        const paper = await Paper.findById(paperId);
        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Check if already bookmarked
        if (req.user.bookmarks.some((b) => b.toString() === paperId)) {
            return sendError(res, ErrorTypes.DUPLICATE_ERROR, 'Paper already bookmarked', 400);
        }

        req.user.bookmarks.push(paper._id);
        await req.user.save();

        return sendSuccess(res, null, 'Paper bookmarked');
    }
);

/**
 * Remove bookmark
 * DELETE /api/users/bookmark/:paperId
 */
export const removeBookmark = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { paperId } = req.params;

        req.user.bookmarks = req.user.bookmarks.filter((b) => b.toString() !== paperId);
        await req.user.save();

        return sendSuccess(res, null, 'Bookmark removed');
    }
);

/**
 * Get bookmarks
 * GET /api/users/bookmarks
 */
export const getBookmarks = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const papers = await Paper.find({ _id: { $in: req.user.bookmarks } })
            .populate('uploadedBy', 'name profilePicture')
            .sort({ createdAt: -1 });

        return sendSuccess(res, papers);
    }
);

export default {
    getProfile,
    updateProfile,
    updateSettings,
    uploadProfilePicture,
    getStats,
    getLeaderboard,
    changePassword,
    addBookmark,
    removeBookmark,
    getBookmarks,
};
