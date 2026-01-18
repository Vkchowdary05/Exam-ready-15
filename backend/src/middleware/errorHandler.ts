// src/middleware/errorHandler.ts
// Global error handling middleware

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';
import { sendError, ErrorTypes } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode: number;
    errorType: string;
    details?: Record<string, unknown>;

    constructor(
        message: string,
        statusCode: number = 400,
        errorType: string = ErrorTypes.INTERNAL_ERROR,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorType = errorType;
        this.details = details;
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Convert Zod validation errors to readable format
 */
function formatZodErrors(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const issue of error.errors) {
        const path = issue.path.join('.');
        formatted[path] = issue.message;
    }
    return formatted;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): Response {
    // Log the error
    logger.error(`${req.method} ${req.path} - ${err.message}`, {
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Validation failed',
            400,
            { errors: formatZodErrors(err) }
        );
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        return sendError(
            res,
            err.errorType,
            err.message,
            err.statusCode,
            err.details
        );
    }

    // Handle MongoDB duplicate key error
    if (err instanceof MongoError && (err as any).code === 11000) {
        const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
        return sendError(
            res,
            ErrorTypes.DUPLICATE_ERROR,
            `A record with this ${field} already exists`,
            409
        );
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(
            res,
            ErrorTypes.INVALID_TOKEN,
            'Invalid authentication token',
            401
        );
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(
            res,
            ErrorTypes.TOKEN_EXPIRED,
            'Authentication token has expired',
            401
        );
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Validation failed',
            400,
            { errors: (err as any).errors }
        );
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Invalid ID format',
            400
        );
    }

    // Default to internal server error
    const message = env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message;

    return sendError(
        res,
        ErrorTypes.INTERNAL_ERROR,
        message,
        500
    );
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): Response {
    return sendError(
        res,
        ErrorTypes.NOT_FOUND,
        `Route ${req.method} ${req.path} not found`,
        404
    );
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export default { errorHandler, notFoundHandler, asyncHandler, ApiError };
