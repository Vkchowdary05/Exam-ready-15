// src/utils/apiResponse.ts
// Consistent API response format utilities

import { Response } from 'express';
import { IApiResponse, IPaginatedResponse } from '../types';

/**
 * Send a success response
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
): Response {
    const response: IApiResponse<T> = {
        success: true,
        data,
        message,
    };
    return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response
 */
export function sendPaginatedSuccess<T>(
    res: Response,
    items: T[],
    totalCount: number,
    page: number,
    pageSize: number,
    message?: string
): Response {
    const paginatedData: IPaginatedResponse<T> = {
        data: items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    const response: IApiResponse<IPaginatedResponse<T>> = {
        success: true,
        data: paginatedData,
        message,
    };
    return res.status(200).json(response);
}

/**
 * Send an error response
 */
export function sendError(
    res: Response,
    error: string,
    message: string,
    statusCode: number = 400,
    details?: Record<string, unknown>
): Response {
    const response: IApiResponse = {
        success: false,
        error,
        message,
        details,
    };
    return res.status(statusCode).json(response);
}

/**
 * Error types for consistent error codes
 */
export const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

export default { sendSuccess, sendPaginatedSuccess, sendError, ErrorTypes };
