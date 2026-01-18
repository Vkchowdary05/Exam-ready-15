// src/routes/auth.ts
// Authentication routes

import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter';
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../validators/authValidators';
import {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    refreshToken,
    getMe,
    resendVerification,
} from '../controllers/authController';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/verify-email', authLimiter, validateBody(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', strictLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', strictLimiter, validateBody(resetPasswordSchema), resetPassword);
router.post('/resend-verification', strictLimiter, validateBody(forgotPasswordSchema), resendVerification);

// Protected routes
router.post('/refresh', authenticate, refreshToken);
router.get('/me', authenticate, getMe);

export default router;
