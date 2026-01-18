// src/routes/topics.ts
// Topic routes

import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { searchTopics, getTopTopicsHandler, getStudyPrompt } from '../controllers/topicController';

const router = Router();

// Public routes
router.get('/top', optionalAuth, getTopTopicsHandler);
router.get('/', optionalAuth, searchTopics);
router.post('/prompt', getStudyPrompt);

export default router;
