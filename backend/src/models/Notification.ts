// src/models/Notification.ts
// Notification model for user notifications

import mongoose, { Schema, Model } from 'mongoose';
import { INotificationDocument, NotificationType } from '../types';

// Notification schema
const notificationSchema = new Schema<INotificationDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['like', 'badge', 'newPaper', 'system', 'verification'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        read: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete (ret as any).__v;
                delete (ret as any).updatedAt;
                return ret;
            },
        },
    }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_notifications' });
notificationSchema.index({ userId: 1, read: 1 }, { name: 'unread_notifications' });

// Auto-delete old notifications (older than 30 days)
notificationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60, name: 'auto_delete_old' }
);

// Create and export model
const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>(
    'Notification',
    notificationSchema
);

export default Notification;
