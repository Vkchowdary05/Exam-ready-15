// src/config/database.ts
// MongoDB connection setup using Mongoose

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
    try {
        const options: mongoose.ConnectOptions = {
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 5,

            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,

            // Keep alive
            heartbeatFrequencyMS: 10000,
        };

        await mongoose.connect(env.MONGODB_URI, options);

        logger.info('✅ Connected to MongoDB successfully');

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected successfully');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed due to app termination');
                process.exit(0);
            } catch (error) {
                logger.error('Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
    } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
    }
}

export default { connectDatabase, disconnectDatabase };
