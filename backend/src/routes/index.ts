// src/routes/index.ts
// Route aggregator - mounts all API routes

import { Router } from 'express';

import authRoutes from './auth';
import userRoutes from './users';
import paperRoutes from './papers';
import topicRoutes from './topics';
import notificationRoutes from './notifications';
import statsRoutes from './stats';
import adminRoutes from './admin';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/papers', paperRoutes);
router.use('/topics', topicRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);
router.use('/admin', adminRoutes);

export default router;
