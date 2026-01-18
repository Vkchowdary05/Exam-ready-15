// src/models/Paper.ts
// Paper model for exam papers

import mongoose, { Schema, Model } from 'mongoose';
import { IPaperDocument, IQuestion, IFlag, ExamType } from '../types';

// Question sub-schema
const questionSchema = new Schema<IQuestion>(
    {
        questionNumber: { type: Number, required: true },
        question: { type: String, required: true },
        marks: { type: Number, required: true },
        topic: { type: String, required: true },
    },
    { _id: false }
);

// Flag sub-schema (for reporting)
const flagSchema = new Schema<IFlag>(
    {
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reason: {
            type: String,
            enum: ['incorrect_metadata', 'poor_quality', 'duplicate', 'inappropriate', 'spam'],
            required: true,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

// Paper schema
const paperSchema = new Schema<IPaperDocument>(
    {
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        college: {
            type: String,
            required: [true, 'College is required'],
            trim: true,
            index: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            index: true,
        },
        semester: {
            type: String,
            required: [true, 'Semester is required'],
            trim: true,
            index: true,
        },
        branch: {
            type: String,
            required: [true, 'Branch is required'],
            trim: true,
            index: true,
        },
        examType: {
            type: String,
            enum: ['semester', 'midterm1', 'midterm2'],
            required: [true, 'Exam type is required'],
            index: true,
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1990, 'Year must be after 1990'],
            max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
            index: true,
        },
        month: {
            type: String,
            required: [true, 'Month is required'],
            trim: true,
        },
        originalImage: {
            type: String,
            required: [true, 'Original image URL is required'],
        },
        formattedText: {
            partA: {
                type: [questionSchema],
                default: [],
            },
            partB: {
                type: [questionSchema],
                default: [],
            },
        },
        metadata: {
            ocrConfidence: {
                type: Number,
                min: 0,
                max: 1,
            },
            processingTime: {
                type: Number, // milliseconds
            },
            extractionMethod: {
                type: String,
                default: 'google-vision-grok3',
            },
        },
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
        likedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        viewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        flagged: {
            type: Boolean,
            default: false,
        },
        flags: {
            type: [flagSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Compound indexes for efficient queries
paperSchema.index(
    {
        college: 1,
        subject: 1,
        semester: 1,
        branch: 1,
        examType: 1,
        year: 1,
    },
    { name: 'duplicate_detection' }
);

paperSchema.index({ uploadedBy: 1, createdAt: -1 }, { name: 'user_uploads' });
paperSchema.index({ likes: -1 }, { name: 'popularity' });
paperSchema.index({ createdAt: -1 }, { name: 'recent' });
paperSchema.index({ flagged: 1, createdAt: -1 }, { name: 'flagged_papers' });

// Text index for search
paperSchema.index(
    { college: 'text', subject: 'text', branch: 'text' },
    { name: 'text_search' }
);

// Static method: Check for duplicate paper
paperSchema.statics.checkDuplicate = async function (
    college: string,
    subject: string,
    semester: string,
    branch: string,
    examType: ExamType,
    year: number
): Promise<IPaperDocument | null> {
    return this.findOne({
        college: { $regex: new RegExp(`^${college}$`, 'i') },
        subject: { $regex: new RegExp(`^${subject}$`, 'i') },
        semester,
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        examType,
        year,
    });
};

// Create and export model
const Paper: Model<IPaperDocument> = mongoose.model<IPaperDocument>('Paper', paperSchema);

export default Paper;
