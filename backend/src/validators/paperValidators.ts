// src/validators/paperValidators.ts
// Zod schemas for paper request validation

import { z } from 'zod';

/**
 * Paper confirm validation (after OCR/AI processing)
 */
export const confirmPaperSchema = z.object({
    imageUrl: z.string().url('Invalid image URL').optional(),
    college: z
        .string()
        .min(2, 'College name must be at least 2 characters')
        .max(200, 'College name cannot exceed 200 characters')
        .trim(),
    subject: z
        .string()
        .min(2, 'Subject must be at least 2 characters')
        .max(200, 'Subject cannot exceed 200 characters')
        .trim(),
    semester: z
        .string()
        .min(1, 'Semester is required')
        .max(20, 'Semester cannot exceed 20 characters')
        .trim(),
    branch: z
        .string()
        .min(2, 'Branch must be at least 2 characters')
        .max(100, 'Branch cannot exceed 100 characters')
        .trim(),
    examType: z.enum(['semester', 'midterm1', 'midterm2'], {
        errorMap: () => ({ message: 'Invalid exam type' }),
    }),
    year: z
        .number()
        .min(1990, 'Year must be after 1990')
        .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    month: z
        .string()
        .min(1, 'Month is required')
        .trim(),
    formattedText: z.object({
        partA: z.array(
            z.object({
                questionNumber: z.number(),
                question: z.string(),
                marks: z.number(),
                topic: z.string(),
            })
        ).optional().default([]),
        partB: z.array(
            z.object({
                questionNumber: z.number(),
                question: z.string(),
                marks: z.number(),
                topic: z.string(),
            })
        ).optional().default([]),
    }).optional().default({ partA: [], partB: [] }),
    metadata: z
        .object({
            ocrConfidence: z.number().optional(),
            processingTime: z.number().optional(),
        })
        .optional(),
});

export type ConfirmPaperInput = z.infer<typeof confirmPaperSchema>;

/**
 * Paper update validation
 */
export const updatePaperSchema = z.object({
    college: z.string().min(2).max(200).trim().optional(),
    subject: z.string().min(2).max(200).trim().optional(),
    semester: z.string().min(1).max(20).trim().optional(),
    branch: z.string().min(2).max(100).trim().optional(),
    examType: z.enum(['semester', 'midterm1', 'midterm2']).optional(),
    year: z.number().min(1990).max(new Date().getFullYear() + 1).optional(),
    month: z.string().min(1).trim().optional(),
});

export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;

/**
 * Paper search query validation
 */
export const searchPapersSchema = z.object({
    'college[]': z.array(z.string()).optional(),
    'subject[]': z.array(z.string()).optional(),
    'semester[]': z.array(z.string()).optional(),
    'branch[]': z.array(z.string()).optional(),
    'examType[]': z.array(z.string()).optional(),
    yearStart: z.coerce.number().optional(),
    yearEnd: z.coerce.number().optional(),
    sortBy: z.enum(['recent', 'liked', 'verified', 'oldest']).optional(),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(20),
    recommended: z.string().transform(v => v === 'true').optional(),
});

export type SearchPapersInput = z.infer<typeof searchPapersSchema>;

/**
 * Report paper validation
 */
export const reportPaperSchema = z.object({
    reason: z.enum(
        ['incorrect_metadata', 'poor_quality', 'duplicate', 'inappropriate', 'spam'],
        { errorMap: () => ({ message: 'Invalid report reason' }) }
    ),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type ReportPaperInput = z.infer<typeof reportPaperSchema>;

export default {
    confirmPaperSchema,
    updatePaperSchema,
    searchPapersSchema,
    reportPaperSchema,
};
