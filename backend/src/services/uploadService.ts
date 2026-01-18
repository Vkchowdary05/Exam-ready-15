// src/services/uploadService.ts
// File upload service (local storage with Cloudinary option)

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Check if Cloudinary is configured
const useCloudinary = !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
);

// Cloudinary setup (only if configured)
let cloudinary: any = null;
if (useCloudinary) {
    try {
        // Dynamic import to avoid errors if not installed
        cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET,
        });
        logger.info('Cloudinary configured successfully');
    } catch (error) {
        logger.warn('Cloudinary not available, using local storage');
    }
}

// Local upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload file to storage (Cloudinary or local)
 */
export async function uploadFile(
    file: Express.Multer.File,
    folder: string = 'papers'
): Promise<{ url: string; publicId: string }> {
    if (useCloudinary && cloudinary) {
        return uploadToCloudinary(file, folder);
    }
    return uploadToLocal(file, folder);
}

/**
 * Upload to Cloudinary
 */
async function uploadToCloudinary(
    file: Express.Multer.File,
    folder: string
): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `exam-ready/${folder}`,
                resource_type: 'auto',
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            },
            (error: any, result: any) => {
                if (error) {
                    logger.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            }
        );

        uploadStream.end(file.buffer);
    });
}

/**
 * Upload to local storage
 */
async function uploadToLocal(
    file: Express.Multer.File,
    folder: string
): Promise<{ url: string; publicId: string }> {
    const folderPath = path.join(UPLOAD_DIR, folder);

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(folderPath, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    const publicId = `${folder}/${filename}`;
    const url = `/uploads/${folder}/${filename}`;

    logger.info(`File uploaded locally: ${filePath}`);

    return { url, publicId };
}

/**
 * Delete file from storage
 */
export async function deleteFile(publicId: string): Promise<void> {
    if (useCloudinary && cloudinary) {
        try {
            await cloudinary.uploader.destroy(publicId);
            logger.info(`Deleted from Cloudinary: ${publicId}`);
        } catch (error) {
            logger.error('Cloudinary delete error:', error);
        }
    } else {
        // Local file deletion
        const filePath = path.join(UPLOAD_DIR, publicId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted local file: ${filePath}`);
        }
    }
}

export default {
    uploadFile,
    deleteFile,
};
