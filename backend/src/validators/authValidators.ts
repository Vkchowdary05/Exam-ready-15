// src/validators/authValidators.ts
// Zod schemas for authentication request validation

import { z } from 'zod';

// Password validation regex (1 uppercase, 1 number, 1 special character, min 8 chars)
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Register request validation
 */
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least 1 uppercase letter, 1 number, and 1 special character'
        ),
    college: z
        .string()
        .min(2, 'College name must be at least 2 characters')
        .max(200, 'College name cannot exceed 200 characters')
        .trim(),
    branch: z
        .string()
        .min(2, 'Branch must be at least 2 characters')
        .max(100, 'Branch cannot exceed 100 characters')
        .trim(),
    semester: z
        .string()
        .min(1, 'Semester is required')
        .max(20, 'Semester cannot exceed 20 characters')
        .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request validation
 */
export const loginSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Email verification request validation
 */
export const verifyEmailSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    otp: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Forgot password request validation
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request validation
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least 1 uppercase letter, 1 number, and 1 special character'
        ),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password request validation
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least 1 uppercase letter, 1 number, and 1 special character'
        ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export default {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
};
