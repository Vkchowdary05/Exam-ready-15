// src/middleware/rateLimiter.ts
// Rate limiting middleware

import rateLimit from 'express-rate-limit';
import { sendError, ErrorTypes } from '../utils/apiResponse';

/**
 * General rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        sendError(
            res,
            ErrorTypes.RATE_LIMIT_ERROR,
            'Too many requests. Please try again later.',
            429
        );
    },
});

/**
 * Auth rate limiter - 50 requests per 15 minutes (increased for development)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased from 5 for development
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        sendError(
            res,
            ErrorTypes.RATE_LIMIT_ERROR,
            'Too many authentication attempts. Please try again in 15 minutes.',
            429
        );
    },
    skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Upload rate limiter - 10 uploads per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Upload limit reached, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        sendError(
            res,
            ErrorTypes.RATE_LIMIT_ERROR,
            'Upload limit reached. You can upload up to 10 papers per hour.',
            429
        );
    },
});

/**
 * Strict limiter for sensitive endpoints - 3 requests per 15 minutes
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: 'Too many attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        sendError(
            res,
            ErrorTypes.RATE_LIMIT_ERROR,
            'Too many attempts. Please try again in 15 minutes.',
            429
        );
    },
});

export default { generalLimiter, authLimiter, uploadLimiter, strictLimiter };
