// src/controllers/authController.ts
// Authentication controller

import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models';
import { AuthenticatedRequest, IUserDocument } from '../types';
import { sendSuccess, sendError, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, college, branch, semester } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return sendError(
            res,
            ErrorTypes.DUPLICATE_ERROR,
            'An account with this email already exists.',
            409
        );
    }

    // Create user (auto-verified, no email verification needed)
    const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        college,
        branch,
        semester,
        emailVerified: true, // Auto-verify all users
    });

    await user.save();

    // Generate token and return immediately
    const token = user.generateAuthToken();
    return sendSuccess(
        res,
        {
            token,
            user: user.toJSON(),
        },
        'Registration successful!',
        201
    );
});

/**
 * Verify email with OTP
 * POST /api/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    // Find user with verification fields
    const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+emailVerificationToken +emailVerificationExpires'
    );

    if (!user) {
        return sendError(
            res,
            ErrorTypes.NOT_FOUND,
            'No account found with this email.',
            404
        );
    }

    if (user.emailVerified) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Email is already verified.',
            400
        );
    }

    // Check OTP
    if (user.emailVerificationToken !== otp) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Invalid verification code.',
            400
        );
    }

    // Check expiry
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Verification code has expired. Please request a new one.',
            400
        );
    }

    // Mark as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate JWT
    const token = user.generateAuthToken();

    return sendSuccess(
        res,
        {
            token,
            user: user.toJSON(),
        },
        'Email verified successfully!'
    );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return sendError(
            res,
            ErrorTypes.INVALID_CREDENTIALS,
            'Invalid email or password.',
            401
        );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return sendError(
            res,
            ErrorTypes.INVALID_CREDENTIALS,
            'Invalid email or password.',
            401
        );
    }

    // Generate token
    const token = user.generateAuthToken();

    return sendSuccess(res, {
        token,
        user: user.toJSON(),
    });
});

/**
 * Forgot password - request reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
        return sendSuccess(
            res,
            null,
            'If an account exists with this email, you will receive a password reset link.'
        );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Log reset token in development
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    // TODO: Send reset email

    return sendSuccess(
        res,
        null,
        'If an account exists with this email, you will receive a password reset link.'
    );
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
        return sendError(
            res,
            ErrorTypes.INVALID_TOKEN,
            'Invalid or expired reset token.',
            400
        );
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful. You can now log in.');
});

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'Authentication required.',
                401
            );
        }

        const token = req.user.generateAuthToken();

        return sendSuccess(res, { token });
    }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(
                res,
                ErrorTypes.AUTHENTICATION_ERROR,
                'Authentication required.',
                401
            );
        }

        return sendSuccess(res, { user: req.user.toJSON() });
    }
);

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return sendSuccess(
            res,
            null,
            'If an account exists with this email, a new verification code will be sent.'
        );
    }

    if (user.emailVerified) {
        return sendError(
            res,
            ErrorTypes.VALIDATION_ERROR,
            'Email is already verified.',
            400
        );
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationToken();
    await user.save();

    logger.info(`New verification OTP for ${email}: ${otp}`);
    // TODO: Send verification email

    return sendSuccess(
        res,
        null,
        'A new verification code has been sent to your email.'
    );
});

export default {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    refreshToken,
    getMe,
    resendVerification,
};
