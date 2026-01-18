// src/validators/userValidators.ts
// Zod schemas for user request validation

import { z } from 'zod';

/**
 * Update profile validation
 */
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim()
        .optional(),
    bio: z
        .string()
        .max(200, 'Bio cannot exceed 200 characters')
        .optional(),
    college: z
        .string()
        .min(2, 'College name must be at least 2 characters')
        .max(200, 'College name cannot exceed 200 characters')
        .trim()
        .optional(),
    branch: z
        .string()
        .min(2, 'Branch must be at least 2 characters')
        .max(100, 'Branch cannot exceed 100 characters')
        .trim()
        .optional(),
    semester: z
        .string()
        .min(1, 'Semester is required')
        .max(20, 'Semester cannot exceed 20 characters')
        .trim()
        .optional(),
    socialLinks: z
        .object({
            linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
            github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
            twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
        })
        .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Update settings validation
 */
export const updateSettingsSchema = z.object({
    theme: z
        .enum(['simple', 'modern', 'tech', 'nerdy'])
        .optional(),
    preferences: z
        .object({
            notifications: z
                .object({
                    email: z.boolean().optional(),
                    newPapers: z.boolean().optional(),
                    likes: z.boolean().optional(),
                    badges: z.boolean().optional(),
                })
                .optional(),
        })
        .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export default {
    updateProfileSchema,
    updateSettingsSchema,
};
