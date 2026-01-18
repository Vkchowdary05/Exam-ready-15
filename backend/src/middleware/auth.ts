// src/middleware/auth.ts
// Authentication middleware

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthenticatedRequest } from '../types';
import { sendError, ErrorTypes } from '../utils/apiResponse';
import { env } from '../config/env';

interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Authenticate middleware - verifies JWT token and attaches user to request
 */
export async function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'Authentication required. Please provide a valid token.',
                401
            );
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'Authentication required. Please provide a valid token.',
                401
            );
        }

        // Verify token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        } catch (error) {
            if ((error as Error).name === 'TokenExpiredError') {
                return sendError(
                    res,
                    ErrorTypes.TOKEN_EXPIRED,
                    'Your session has expired. Please log in again.',
                    401
                );
            }
            return sendError(
                res,
                ErrorTypes.INVALID_TOKEN,
                'Invalid authentication token.',
                401
            );
        }

        // Find user by ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'User not found. Please log in again.',
                401
            );
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return sendError(
            res,
            ErrorTypes.INTERNAL_ERROR,
            'Authentication failed. Please try again.',
            500
        );
    }
}

/**
 * Optional auth middleware - attaches user if token is present but doesn't require it
 */
export async function optionalAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
            const user = await User.findById(decoded.userId);

            if (user) {
                req.user = user;
            }
        } catch {
            // Token invalid but that's okay for optional auth
        }

        next();
    } catch (error) {
        next();
    }
}

export default { authenticate, optionalAuth };
