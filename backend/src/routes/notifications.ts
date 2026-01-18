// src/routes/notifications.ts
// Notification routes

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
