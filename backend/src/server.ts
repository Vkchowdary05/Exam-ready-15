// src/server.ts
// Server entry point

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
    try {
        // Connect to database
        await connectDatabase();

        // Create Express app
        const app = createApp();

        // Start server
        const server = app.listen(env.PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
            logger.info(`📝 Environment: ${env.NODE_ENV}`);
            logger.info(`🔗 Frontend URL: ${env.FRONTEND_URL}`);

            if (env.USE_MOCK_OCR) {
                logger.warn('⚠️  Using mock OCR service (set USE_MOCK_OCR=false for real OCR)');
            }
            if (env.USE_MOCK_AI) {
                logger.warn('⚠️  Using mock AI service (set USE_MOCK_AI=false for real AI)');
            }
            if (env.SKIP_EMAIL_VERIFICATION) {
                logger.warn('⚠️  Email verification is disabled (set SKIP_EMAIL_VERIFICATION=false for production)');
            }
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
