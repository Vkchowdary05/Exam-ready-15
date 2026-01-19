// src/config/env.ts
// Environment configuration and validation

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
    // Server
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';

    // Database
    MONGODB_URI: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;

    // Frontend
    FRONTEND_URL: string;

    // Google Cloud Vision
    GOOGLE_VISION_API_KEY?: string;

    // Grok API (legacy)
    GROK_API_KEY?: string;
    GROK_API_URL: string;

    // OpenRouter API
    OPENROUTER_API_KEY?: string;

    // Groq API (Fast Inference)
    GROQ_API_KEY?: string;

    // Gemini API (Google AI) - Deprecated
    GEMINI_API_KEY?: string;

    // Cloudinary
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;

    // Email
    SENDGRID_API_KEY?: string;
    EMAIL_FROM: string;

    // OCR Service
    OCR_SERVICE_URL: string;

    // Development flags
    USE_MOCK_OCR: boolean;
    USE_MOCK_AI: boolean;
    SKIP_EMAIL_VERIFICATION?: boolean;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function getEnvVarOptional(key: string): string | undefined {
    return process.env[key];
}

function getEnvVarBool(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
}

function getEnvVarNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
}

export const env: EnvConfig = {
    // Server
    PORT: getEnvVarNumber('PORT', 5000),
    NODE_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['NODE_ENV']),

    // Database
    MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/exam-ready'),

    // JWT
    JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),

    // Frontend
    FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

    // Google Cloud Vision
    GOOGLE_VISION_API_KEY: getEnvVarOptional('GOOGLE_VISION_API_KEY'),

    // Grok API (legacy)
    GROK_API_KEY: getEnvVarOptional('GROK_API_KEY'),
    GROK_API_URL: getEnvVar('GROK_API_URL', 'https://api.x.ai/v1/chat/completions'),

    // OpenRouter API
    OPENROUTER_API_KEY: getEnvVarOptional('OPENROUTER_API_KEY'),

    // Groq API
    GROQ_API_KEY: getEnvVarOptional('GROQ_API_KEY'),

    // Gemini API (Google AI)
    GEMINI_API_KEY: getEnvVarOptional('GEMINI_API_KEY'),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: getEnvVarOptional('CLOUDINARY_CLOUD_NAME'),
    CLOUDINARY_API_KEY: getEnvVarOptional('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: getEnvVarOptional('CLOUDINARY_API_SECRET'),

    // Email
    SENDGRID_API_KEY: getEnvVarOptional('SENDGRID_API_KEY'),
    EMAIL_FROM: getEnvVar('EMAIL_FROM', 'noreply@examready.com'),

    // OCR Service
    OCR_SERVICE_URL: getEnvVar('OCR_SERVICE_URL', 'http://localhost:5001'),

    // Development flags
    USE_MOCK_OCR: getEnvVarBool('USE_MOCK_OCR', false),
    USE_MOCK_AI: getEnvVarBool('USE_MOCK_AI', false),
    SKIP_EMAIL_VERIFICATION: getEnvVarBool('SKIP_EMAIL_VERIFICATION', false),
};

// Validate required variables in production
if (env.NODE_ENV === 'production') {
    const requiredInProduction = [
        'MONGODB_URI',
        'JWT_SECRET',
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_SECRET',
        'GROQ_API_KEY',
    ];

    for (const key of requiredInProduction) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable for production: ${key}`);
        }
    }

    // Warn if using dev secret in production
    if (env.JWT_SECRET === 'dev-secret-change-in-production') {
        throw new Error('Please set a secure JWT_SECRET for production');
    }
}

export default env;
