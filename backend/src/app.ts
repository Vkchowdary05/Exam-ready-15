// src/app.ts
// Express application setup

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// Import routes
import routes from './routes';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
    const app = express();

    // Trust proxy (for rate limiting behind reverse proxy)
    app.set('trust proxy', 1);

    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    // CORS configuration - allow multiple origins for development and production
    const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ];

    // Check if origin is a Vercel deployment for this project
    const isVercelOrigin = (origin: string): boolean => {
        if (!origin) return false;
        // Allow all Vercel preview and production deployments
        return origin.includes('.vercel.app') &&
            (origin.includes('exam-ready') ||
                origin.includes('venakata-kartheek') ||
                origin.includes('vkchowdary'));
    };

    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin) || isVercelOrigin(origin)) {
                return callback(null, true);
            }
            logger.warn(`CORS blocked origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Sanitize MongoDB queries
    app.use(mongoSanitize());

    // Rate limiting
    app.use(generalLimiter);

    // Request logging
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info(
                `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
            );
        });
        next();
    });

    // Health check endpoint (for keep-alive services like UptimeRobot)
    app.get('/health', (req, res) => {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: env.NODE_ENV,
                uptime: Math.floor(uptime),
                version: '1.0.0',
                memory: {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                },
            },
        });
    });

    // API routes
    app.use('/api', routes);

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
}

export default createApp;
