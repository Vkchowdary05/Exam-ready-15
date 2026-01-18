// src/routes/admin.ts
// Admin routes

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize, isAdmin, isAdminOrModerator } from '../middleware/authorize';
import {
    getFlaggedPapers,
    verifyPaper,
    adminDeletePaper,
    getUsers,
    updateUserRole,
    getAdminStats,
} from '../controllers/adminController';

const router = Router();

// All routes require authentication and admin/moderator role
router.use(authenticate);

// Admin/Moderator routes
router.get('/papers/flagged', isAdminOrModerator, getFlaggedPapers);
router.put('/papers/:id/verify', isAdminOrModerator, verifyPaper);
router.get('/stats', isAdminOrModerator, getAdminStats);

// Admin-only routes
router.delete('/papers/:id', isAdmin, adminDeletePaper);
router.get('/users', isAdmin, getUsers);
router.put('/users/:id/role', isAdmin, updateUserRole);

export default router;
