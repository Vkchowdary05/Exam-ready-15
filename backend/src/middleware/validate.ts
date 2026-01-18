// src/middleware/validate.ts
// Request validation middleware using Zod

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError, ErrorTypes } from '../utils/apiResponse';

/**
 * Validation targets
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Create a validation middleware for a Zod schema
 */
export function validate(
    schema: ZodSchema,
    target: ValidationTarget = 'body'
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = req[target];
            const validatedData = await schema.parseAsync(dataToValidate);

            // Replace the original data with validated/transformed data
            req[target] = validatedData;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string> = {};

                for (const issue of error.errors) {
                    const path = issue.path.join('.');
                    errors[path] = issue.message;
                }

                return sendError(
                    res,
                    ErrorTypes.VALIDATION_ERROR,
                    'Validation failed',
                    400,
                    { errors }
                );
            }

            next(error);
        }
    };
}

/**
 * Validate request body
 */
export function validateBody(schema: ZodSchema) {
    return validate(schema, 'body');
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
    return validate(schema, 'query');
}

/**
 * Validate URL parameters
 */
export function validateParams(schema: ZodSchema) {
    return validate(schema, 'params');
}

export default { validate, validateBody, validateQuery, validateParams };
