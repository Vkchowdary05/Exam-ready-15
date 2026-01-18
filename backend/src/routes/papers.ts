// src/routes/papers.ts
// Paper routes

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { uploadLimiter } from '../middleware/rateLimiter';
import {
    confirmPaperSchema,
    updatePaperSchema,
    reportPaperSchema,
} from '../validators/paperValidators';
import {
    upload,
    uploadPaper,
    confirmPaper,
    searchPapers,
    getPaperById,
    updatePaper,
    deletePaper,
    likePaper,
    reportPaper,
    getRelatedPapers,
    getMyUploads,
} from '../controllers/paperController';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, searchPapers);
router.get('/my-uploads', authenticate, getMyUploads);
router.get('/:id', optionalAuth, getPaperById);
router.get('/:id/related', getRelatedPapers);

// Protected routes
router.post('/upload', authenticate, uploadLimiter, upload.single('file'), uploadPaper);
router.post('/:id/confirm', authenticate, validateBody(confirmPaperSchema), confirmPaper);
router.put('/:id', authenticate, validateBody(updatePaperSchema), updatePaper);
router.delete('/:id', authenticate, deletePaper);
router.post('/:id/like', authenticate, likePaper);
router.post('/:id/report', authenticate, validateBody(reportPaperSchema), reportPaper);

export default router;
