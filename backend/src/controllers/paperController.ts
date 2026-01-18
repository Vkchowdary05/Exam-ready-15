// src/controllers/paperController.ts
// Paper management controller

import { Request, Response } from 'express';
import multer from 'multer';
import { Paper, User, Notification } from '../models';
import { AuthenticatedRequest, ExamType } from '../types';
import { sendSuccess, sendError, sendPaginatedSuccess, ErrorTypes } from '../utils/apiResponse';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { uploadFile, deleteFile } from '../services/uploadService';
import { extractTextFromImage } from '../services/ocrService';
import { extractMetadataFromText } from '../services/aiService';
import { incrementTopicsForPaper, decrementTopicsForPaper } from '../services/topicService';
import { checkAndUnlockBadges, awardCredits } from '../services/badgeService';
import { logger } from '../utils/logger';

// Multer configuration for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    },
});

/**
 * Upload paper and process with OCR + AI
 * POST /api/papers/upload
 */
export const uploadPaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        if (!req.file) {
            return sendError(res, ErrorTypes.VALIDATION_ERROR, 'Please upload an image file', 400);
        }

        const startTime = Date.now();

        try {
            // Upload to storage
            const { url: imageUrl, publicId } = await uploadFile(req.file, 'papers');

            // OCR extraction
            const { text: ocrText, confidence: ocrConfidence } = await extractTextFromImage(req.file.buffer);

            if (!ocrText || ocrText.trim().length < 50) {
                return sendError(
                    res,
                    ErrorTypes.EXTERNAL_API_ERROR,
                    'Could not extract enough text from the image. Please upload a clearer image.',
                    400
                );
            }

            // AI metadata extraction
            const aiResult = await extractMetadataFromText(ocrText);

            const processingTime = Date.now() - startTime;

            // Create temporary paper record
            const tempPaper = new Paper({
                uploadedBy: req.user._id,
                originalImage: imageUrl,
                college: aiResult.metadata.college,
                subject: aiResult.metadata.subject,
                semester: aiResult.metadata.semester,
                branch: aiResult.metadata.branch,
                examType: aiResult.metadata.examType,
                year: aiResult.metadata.year,
                month: aiResult.metadata.month,
                formattedText: aiResult.formattedText,
                metadata: {
                    ocrConfidence,
                    processingTime,
                    extractionMethod: 'google-vision-grok3',
                },
                verified: false,
            });

            await tempPaper.save();

            logger.info(`Paper uploaded and processed in ${processingTime}ms`);

            return sendSuccess(
                res,
                {
                    paperId: tempPaper._id,
                    originalImage: imageUrl,
                    metadata: {
                        ...aiResult.metadata,
                        confidence: {
                            college: aiResult.metadata.confidence,
                            subject: aiResult.metadata.confidence,
                            semester: aiResult.metadata.confidence,
                            branch: aiResult.metadata.confidence,
                            examType: aiResult.metadata.confidence,
                            year: aiResult.metadata.confidence,
                            month: aiResult.metadata.confidence,
                        },
                    },
                    formattedText: aiResult.formattedText,
                    processingTime,
                },
                'Paper uploaded and processed successfully',
                201
            );
        } catch (error) {
            logger.error('Paper upload error:', error);
            throw new ApiError(
                'Failed to process paper. Please try again.',
                500,
                ErrorTypes.EXTERNAL_API_ERROR
            );
        }
    }
);

/**
 * Confirm and save paper after user review
 * POST /api/papers/:id/confirm
 */
export const confirmPaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const { college, subject, semester, branch, examType, year, month, formattedText } = req.body;

        // Find paper
        const paper = await Paper.findById(id);
        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Verify ownership
        if (paper.uploadedBy.toString() !== req.user._id.toString()) {
            return sendError(res, ErrorTypes.AUTHORIZATION_ERROR, 'Not authorized', 403);
        }

        // Duplicate check removed - allowing multiple papers with same metadata

        // Update paper with confirmed data
        paper.college = college;
        paper.subject = subject;
        paper.semester = semester;
        paper.branch = branch;
        paper.examType = examType as ExamType;
        paper.year = year;
        paper.month = month;
        paper.formattedText = formattedText;
        paper.verified = false; // Will be verified by admin later

        await paper.save();

        // Increment topic counts
        await incrementTopicsForPaper(
            paper._id,
            college,
            subject,
            semester,
            branch,
            examType as ExamType,
            formattedText.partA || [],
            formattedText.partB || []
        );

        // Award credits (10 for upload)
        await awardCredits(req.user._id, 10, 'Paper upload');

        // Check for new badges
        const newBadges = await checkAndUnlockBadges(req.user._id);

        // Get updated user
        const updatedUser = await User.findById(req.user._id);

        return sendSuccess(
            res,
            {
                paper: paper.toJSON(),
                creditsEarned: 10,
                badgesUnlocked: newBadges,
                totalCredits: updatedUser?.credits || 0,
            },
            'Paper saved successfully! You earned 10 credits.'
        );
    }
);

/**
 * Search papers with filters
 * GET /api/papers
 */
export const searchPapers = asyncHandler(async (req: Request, res: Response) => {
    const {
        'college[]': colleges,
        'subject[]': subjects,
        'semester[]': semesters,
        'branch[]': branches,
        'examType[]': examTypes,
        yearStart,
        yearEnd,
        sortBy = 'recent',
        page = 1,
        pageSize = 20,
        recommended,
    } = req.query;

    // Build query
    const query: any = {};

    if (colleges && Array.isArray(colleges) && colleges.length > 0) {
        query.college = { $in: (colleges as string[]).map((c) => new RegExp(c, 'i')) };
    }
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        query.subject = { $in: (subjects as string[]).map((s) => new RegExp(s, 'i')) };
    }
    if (semesters && Array.isArray(semesters) && semesters.length > 0) {
        query.semester = { $in: semesters };
    }
    if (branches && Array.isArray(branches) && branches.length > 0) {
        query.branch = { $in: (branches as string[]).map((b) => new RegExp(b, 'i')) };
    }
    if (examTypes && Array.isArray(examTypes) && examTypes.length > 0) {
        query.examType = { $in: examTypes };
    }
    if (yearStart || yearEnd) {
        query.year = {};
        if (yearStart) query.year.$gte = Number(yearStart);
        if (yearEnd) query.year.$lte = Number(yearEnd);
    }

    // Sorting
    let sort: any = { createdAt: -1 };
    switch (sortBy) {
        case 'liked':
            sort = { likes: -1, createdAt: -1 };
            break;
        case 'verified':
            sort = { verified: -1, createdAt: -1 };
            break;
        case 'oldest':
            sort = { createdAt: 1 };
            break;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Math.min(Number(pageSize), 100);

    // Execute query
    const [papers, totalCount] = await Promise.all([
        Paper.find(query)
            .populate('uploadedBy', 'name profilePicture badges')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Paper.countDocuments(query),
    ]);

    return sendPaginatedSuccess(res, papers, totalCount, Number(page), limit);
});

/**
 * Get paper by ID
 * GET /api/papers/:id
 */
export const getPaperById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const paper = await Paper.findById(id).populate('uploadedBy', 'name profilePicture badges college');

    if (!paper) {
        return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
    }

    // Increment view count
    paper.viewCount += 1;
    await paper.save();

    return sendSuccess(res, paper);
});

/**
 * Update paper
 * PUT /api/papers/:id
 */
export const updatePaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const paper = await Paper.findById(id);

        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Check authorization
        const isOwner = paper.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

        if (!isOwner && !isAdmin) {
            return sendError(res, ErrorTypes.AUTHORIZATION_ERROR, 'Not authorized to update this paper', 403);
        }

        // Update fields
        const { college, subject, semester, branch, examType, year, month } = req.body;
        if (college) paper.college = college;
        if (subject) paper.subject = subject;
        if (semester) paper.semester = semester;
        if (branch) paper.branch = branch;
        if (examType) paper.examType = examType;
        if (year) paper.year = year;
        if (month) paper.month = month;

        await paper.save();

        return sendSuccess(res, paper, 'Paper updated successfully');
    }
);

/**
 * Delete paper
 * DELETE /api/papers/:id
 */
export const deletePaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const paper = await Paper.findById(id);

        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Check authorization
        const isOwner = paper.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return sendError(res, ErrorTypes.AUTHORIZATION_ERROR, 'Not authorized to delete this paper', 403);
        }

        // Delete image from storage
        try {
            const publicId = paper.originalImage.split('/').slice(-2).join('/').split('.')[0];
            await deleteFile(publicId);
        } catch (error) {
            logger.error('Error deleting image:', error);
        }

        // Decrement topic counts
        await decrementTopicsForPaper(paper._id);

        // Delete paper
        await Paper.findByIdAndDelete(id);

        return sendSuccess(res, null, 'Paper deleted successfully');
    }
);

/**
 * Like/unlike paper
 * POST /api/papers/:id/like
 */
export const likePaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const paper = await Paper.findById(id);

        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        const userId = req.user._id;
        const alreadyLiked = paper.likedBy.some((u) => u.toString() === userId.toString());

        if (alreadyLiked) {
            // Unlike
            paper.likedBy = paper.likedBy.filter((u) => u.toString() !== userId.toString());
            paper.likes = Math.max(0, paper.likes - 1);
        } else {
            // Like
            paper.likedBy.push(userId);
            paper.likes += 1;

            // Award credit to paper owner (if not self-like)
            if (paper.uploadedBy.toString() !== userId.toString()) {
                await awardCredits(paper.uploadedBy, 1, 'Paper liked');

                // Check badges for paper owner
                await checkAndUnlockBadges(paper.uploadedBy);

                // Send notification to owner
                await Notification.create({
                    userId: paper.uploadedBy,
                    type: 'like',
                    title: 'Your paper received a like!',
                    message: `${req.user.name} liked your ${paper.subject} paper.`,
                    data: { paperId: paper._id, likerId: userId },
                });
            }
        }

        await paper.save();

        return sendSuccess(res, {
            liked: !alreadyLiked,
            likes: paper.likes,
        });
    }
);

/**
 * Report paper
 * POST /api/papers/:id/report
 */
export const reportPaper = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const { id } = req.params;
        const { reason, description } = req.body;

        const paper = await Paper.findById(id);

        if (!paper) {
            return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
        }

        // Check if already reported by this user
        const alreadyReported = paper.flags.some(
            (f) => f.reportedBy.toString() === req.user!._id.toString()
        );

        if (alreadyReported) {
            return sendError(res, ErrorTypes.DUPLICATE_ERROR, 'You have already reported this paper', 400);
        }

        // Add flag
        paper.flags.push({
            reportedBy: req.user._id,
            reason,
            description,
            createdAt: new Date(),
        });
        paper.flagged = true;

        await paper.save();

        return sendSuccess(res, null, 'Paper reported. Thank you for helping maintain quality.');
    }
);

/**
 * Get related papers
 * GET /api/papers/:id/related
 */
export const getRelatedPapers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const paper = await Paper.findById(id);

    if (!paper) {
        return sendError(res, ErrorTypes.NOT_FOUND, 'Paper not found', 404);
    }

    // Find papers with same subject but different year
    const relatedPapers = await Paper.find({
        _id: { $ne: paper._id },
        subject: { $regex: new RegExp(`^${paper.subject}$`, 'i') },
        semester: paper.semester,
        branch: { $regex: new RegExp(`^${paper.branch}$`, 'i') },
    })
        .populate('uploadedBy', 'name profilePicture')
        .sort({ year: -1 })
        .limit(10);

    return sendSuccess(res, relatedPapers);
});

/**
 * Get user's uploaded papers
 * GET /api/papers/my-uploads
 */
export const getMyUploads = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return sendError(res, ErrorTypes.AUTHENTICATION_ERROR, 'Authentication required', 401);
        }

        const papers = await Paper.find({ uploadedBy: req.user._id })
            .populate('uploadedBy', 'name profilePicture')
            .sort({ createdAt: -1 });

        return sendSuccess(res, papers);
    }
);

export default {
    upload,
    uploadPaper,
    confirmPaper,
    searchPapers,
    getPaperById,
    updatePaper,
    deletePaper,
    likePaper,
    reportPaper,
    getRelatedPapers,
    getMyUploads,
};
