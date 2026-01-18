// src/types/index.ts
// TypeScript interfaces for the backend

import { Document, Types } from 'mongoose';

// ============================================
// USER TYPES
// ============================================

export interface IBadge {
    badgeId: string;
    name: string;
    icon: string;
    unlockedAt: Date;
}

export interface ISocialLinks {
    linkedin?: string;
    github?: string;
    twitter?: string;
}

export interface INotificationPreferences {
    email: boolean;
    newPapers: boolean;
    likes: boolean;
    badges: boolean;
}

export interface IPreferences {
    notifications: INotificationPreferences;
}

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    password: string;
    name: string;
    college: string;
    branch: string;
    semester: string;
    profilePicture?: string;
    bio?: string;
    socialLinks?: ISocialLinks;
    credits: number;
    badges: IBadge[];
    theme: 'simple' | 'modern' | 'tech' | 'nerdy';
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    preferences: IPreferences;
    role: 'user' | 'admin' | 'moderator';
    bookmarks: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
    _id: Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
    generateEmailVerificationToken(): string;
}

// ============================================
// PAPER TYPES
// ============================================

export type ExamType = 'semester' | 'midterm1' | 'midterm2';

export interface IQuestion {
    questionNumber: number;
    question: string;
    marks: number;
    topic: string;
}

export interface IFormattedText {
    partA: IQuestion[];
    partB: IQuestion[];
}

export interface IPaperMetadata {
    ocrConfidence?: number;
    processingTime?: number;
    extractionMethod: string;
}

export interface IFlag {
    reportedBy: Types.ObjectId;
    reason: 'incorrect_metadata' | 'poor_quality' | 'duplicate' | 'inappropriate' | 'spam';
    description?: string;
    createdAt: Date;
}

export interface IPaper {
    _id: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    college: string;
    subject: string;
    semester: string;
    branch: string;
    examType: ExamType;
    year: number;
    month: string;
    originalImage: string;
    formattedText: IFormattedText;
    metadata: IPaperMetadata;
    likes: number;
    likedBy: Types.ObjectId[];
    viewCount: number;
    verified: boolean;
    verifiedBy?: Types.ObjectId;
    flagged: boolean;
    flags: IFlag[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IPaperDocument extends IPaper, Document {
    _id: Types.ObjectId;
}

// ============================================
// TOPIC TYPES
// ============================================

export interface ITopicEntry {
    name: string;
    count: number;
    lastOccurred: Date;
    papers: Types.ObjectId[];
}

export interface ITopicCount {
    _id: Types.ObjectId;
    college: string;
    subject: string;
    semester: string;
    branch: string;
    examType: ExamType;
    part: 'A' | 'B';
    topics: ITopicEntry[];
    updatedAt: Date;
}

export interface ITopicCountDocument extends ITopicCount, Document {
    _id: Types.ObjectId;
    incrementTopic(topicName: string, paperId: Types.ObjectId): void;
    getTopTopics(limit: number): ITopicEntry[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'like' | 'badge' | 'newPaper' | 'system' | 'verification';

export interface INotification {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, unknown>;
    createdAt: Date;
}

export interface INotificationDocument extends INotification, Document {
    _id: Types.ObjectId;
}

// ============================================
// SEARCH HISTORY TYPES
// ============================================

export interface ISearchFilters {
    college?: string[];
    subject?: string[];
    semester?: string[];
    branch?: string[];
    examType?: string[];
    yearRange?: {
        from?: number;
        to?: number;
    };
}

export interface ISearchHistory {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    filters: ISearchFilters;
    resultCount: number;
    createdAt: Date;
}

export interface ISearchHistoryDocument extends ISearchHistory, Document {
    _id: Types.ObjectId;
}

// ============================================
// API TYPES
// ============================================

export interface IApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: Record<string, unknown>;
}

export interface IPaginatedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IRegisterData {
    name: string;
    email: string;
    password: string;
    college: string;
    branch: string;
    semester: string;
}

export interface IAuthResponse {
    user: Omit<IUser, 'password'>;
    token: string;
}

// ============================================
// OCR/AI TYPES
// ============================================

export interface IOCRMetadata {
    college: string;
    subject: string;
    semester: string;
    branch: string;
    examType: ExamType;
    year: number;
    month: string;
    confidence: number;
}

export interface IOCRResult {
    paperId: string;
    metadata: IOCRMetadata;
    formattedText: IFormattedText;
    originalImage: string;
    processingTime: number;
}

// ============================================
// REQUEST TYPES (Express extensions)
// ============================================

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: IUserDocument;
}

// ============================================
// BADGE DEFINITIONS
// ============================================

export const BADGE_DEFINITIONS = [
    { id: 'bronze_contributor', name: 'Bronze Contributor', icon: '🥉', requiredLikes: 10 },
    { id: 'silver_scholar', name: 'Silver Scholar', icon: '🥈', requiredLikes: 50 },
    { id: 'gold_guru', name: 'Gold Guru', icon: '🥇', requiredLikes: 100 },
    { id: 'platinum_professor', name: 'Platinum Professor', icon: '💎', requiredLikes: 250 },
    { id: 'diamond_master', name: 'Diamond Master', icon: '💠', requiredLikes: 500 },
    { id: 'legend', name: 'Legend', icon: '🏆', requiredLikes: 1000 },
    { id: 'quality_contributor', name: 'Quality Contributor', icon: '✅', requiredVerifiedPapers: 10 },
] as const;

export type BadgeId = typeof BADGE_DEFINITIONS[number]['id'];
