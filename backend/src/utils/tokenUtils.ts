// src/utils/tokenUtils.ts
// JWT token generation and verification utilities

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { env } from '../config/env';

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET as jwt.Secret,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Generate a random verification code (6 digits)
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage (for reset tokens)
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate expiry date for verification token (10 minutes)
 */
export function getVerificationExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000);
}

/**
 * Generate expiry date for reset token (1 hour)
 */
export function getResetExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000);
}

export default {
    generateToken,
    verifyToken,
    generateVerificationCode,
    generateResetToken,
    hashToken,
    getVerificationExpiry,
    getResetExpiry,
};
