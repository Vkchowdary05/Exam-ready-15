// src/routes/users.ts
// User routes

import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, updateSettingsSchema } from '../validators/userValidators';
import { changePasswordSchema } from '../validators/authValidators';
import {
    getProfile,
    updateProfile,
    updateSettings,
    uploadProfilePicture,
    getStats,
    getLeaderboard,
    changePassword,
    addBookmark,
    removeBookmark,
    getBookmarks,
} from '../controllers/userController';

const router = Router();

// Multer for profile picture upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    },
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);
router.post('/profile-picture', upload.single('image'), uploadProfilePicture);

// Settings
router.put('/settings', validateBody(updateSettingsSchema), updateSettings);

// Stats and leaderboard
router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);

// Password
router.put('/change-password', validateBody(changePasswordSchema), changePassword);

// Bookmarks
router.post('/bookmark/:paperId', addBookmark);
router.delete('/bookmark/:paperId', removeBookmark);
router.get('/bookmarks', getBookmarks);

export default router;
