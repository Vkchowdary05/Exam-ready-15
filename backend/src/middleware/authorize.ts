// src/middleware/authorize.ts
// Role-based authorization middleware

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError, ErrorTypes } from '../utils/apiResponse';

type Role = 'user' | 'admin' | 'moderator';

/**
 * Authorize middleware - checks if user has required role(s)
 */
export function authorize(...allowedRoles: Role[]) {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void | Response => {
        // Check if user is authenticated
        if (!req.user) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'Authentication required.',
                401
            );
        }

        // Check if user has required role
        if (!allowedRoles.includes(req.user.role as Role)) {
            return sendError(
                res,
                ErrorTypes.AUTHORIZATION_ERROR,
                'You do not have permission to perform this action.',
                403
            );
        }

        next();
    };
}

/**
 * Check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Check if user is admin or moderator
 */
export const isAdminOrModerator = authorize('admin', 'moderator');

export default { authorize, isAdmin, isAdminOrModerator };
