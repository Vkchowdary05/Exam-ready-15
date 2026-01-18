// src/controllers/notificationController.ts
// Notification management controller

import { Response } from 'express';
import { Notification } from '../models';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError, sendPaginatedSuccess, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get user notifications
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, totalCount] = await Promise.all([
            Notification.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Notification.countDocuments({ userId: req.user._id }),
        ]);

        return sendPaginatedSuccess(res, notifications, totalCount, Number(page), Number(limit));
    }
);

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Notification not found', 404);
        }

        return sendSuccess(res, notification);
    }
);

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });

        return sendSuccess(res, null, 'All notifications marked as read');
    }
);

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId: req.user._id,
        });

        if (!notification) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Notification not found', 404);
        }

        return sendSuccess(res, null, 'Notification deleted');
    }
);

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false,
        });

        return sendSuccess(res, { count });
    }
);

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
};
