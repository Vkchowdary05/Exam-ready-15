// src/models/User.ts
// User model with authentication methods

import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserDocument, IBadge, IPreferences } from '../types';
import { env } from '../config/env';

// Badge sub-schema
const badgeSchema = new Schema<IBadge>(
    {
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        icon: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Social links sub-schema
const socialLinksSchema = new Schema(
    {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
    },
    { _id: false }
);

// Notification preferences sub-schema
const notificationPreferencesSchema = new Schema(
    {
        email: { type: Boolean, default: true },
        newPapers: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        badges: { type: Boolean, default: true },
    },
    { _id: false }
);

// Preferences sub-schema
const preferencesSchema = new Schema<IPreferences>(
    {
        notifications: { type: notificationPreferencesSchema, default: () => ({}) },
    },
    { _id: false }
);

// User schema
const userSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password by default in queries
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        college: {
            type: String,
            required: [true, 'College is required'],
            trim: true,
            index: true,
        },
        branch: {
            type: String,
            required: [true, 'Branch is required'],
            trim: true,
        },
        semester: {
            type: String,
            required: [true, 'Semester is required'],
            trim: true,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio cannot exceed 200 characters'],
            default: '',
        },
        socialLinks: {
            type: socialLinksSchema,
            default: () => ({}),
        },
        credits: {
            type: Number,
            default: 0,
            min: 0,
        },
        badges: {
            type: [badgeSchema],
            default: [],
        },
        theme: {
            type: String,
            enum: ['simple', 'modern', 'tech', 'nerdy'],
            default: 'modern',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            select: false,
        },
        emailVerificationExpires: {
            type: Date,
            select: false,
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        preferences: {
            type: preferencesSchema,
            default: () => ({}),
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
        },
        bookmarks: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Paper',
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete (ret as any).password;
                delete (ret as any).emailVerificationToken;
                delete (ret as any).emailVerificationExpires;
                delete (ret as any).passwordResetToken;
                delete (ret as any).passwordResetExpires;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ college: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method: Compare password
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method: Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
    return jwt.sign(
        {
            userId: this._id.toString(),
            email: this.email,
            role: this.role,
        },
        env.JWT_SECRET as jwt.Secret,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
};

// Method: Generate email verification token (6-digit OTP)
userSchema.methods.generateEmailVerificationToken = function (): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationToken = otp;
    this.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Create and export model
const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);

export default User;
