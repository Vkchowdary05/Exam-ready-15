// src/services/badgeService.ts
// Badge unlock logic

import { Types } from 'mongoose';
import { User, Paper, Notification } from '../models';
import { BADGE_DEFINITIONS, IBadge, IUserDocument } from '../types';
import { logger } from '../utils/logger';

/**
 * Check and unlock badges for a user based on their stats
 * Returns array of newly unlocked badges
 */
export async function checkAndUnlockBadges(userId: Types.ObjectId): Promise<IBadge[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get user's total likes across all their papers
    const totalLikesResult = await Paper.aggregate([
        { $match: { uploadedBy: userId } },
        { $group: { _id: null, totalLikes: { $sum: '$likes' } } },
    ]);
    const totalLikes = totalLikesResult[0]?.totalLikes || 0;

    // Get verified papers count
    const verifiedPapersCount = await Paper.countDocuments({
        uploadedBy: userId,
        verified: true,
    });

    const newBadges: IBadge[] = [];
    const existingBadgeIds = user.badges.map((b) => b.badgeId);

    // Check each badge definition
    for (const badgeDef of BADGE_DEFINITIONS) {
        // Skip if already unlocked
        if (existingBadgeIds.includes(badgeDef.id)) continue;

        let shouldUnlock = false;

        // Check like-based badges
        if ('requiredLikes' in badgeDef && totalLikes >= badgeDef.requiredLikes) {
            shouldUnlock = true;
        }

        // Check verified papers badges
        if ('requiredVerifiedPapers' in badgeDef && verifiedPapersCount >= badgeDef.requiredVerifiedPapers) {
            shouldUnlock = true;
        }

        if (shouldUnlock) {
            const newBadge: IBadge = {
                badgeId: badgeDef.id,
                name: badgeDef.name,
                icon: badgeDef.icon,
                unlockedAt: new Date(),
            };
            newBadges.push(newBadge);
        }
    }

    // Add new badges to user
    if (newBadges.length > 0) {
        user.badges.push(...newBadges);
        await user.save();

        // Create notifications for each new badge
        for (const badge of newBadges) {
            await Notification.create({
                userId,
                type: 'badge',
                title: `Badge Unlocked: ${badge.name}`,
                message: `Congratulations! You've unlocked the ${badge.name} badge!`,
                data: { badgeId: badge.badgeId, icon: badge.icon },
            });
        }

        logger.info(`User ${userId} unlocked ${newBadges.length} new badge(s)`);
    }

    return newBadges;
}

/**
 * Award credits to a user
 */
export async function awardCredits(
    userId: Types.ObjectId,
    amount: number,
    reason: string
): Promise<number> {
    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: amount } },
        { new: true }
    );

    if (user) {
        logger.info(`Awarded ${amount} credits to user ${userId} for: ${reason}`);
        return user.credits;
    }

    return 0;
}

/**
 * Get badge definitions (for frontend display)
 */
export function getBadgeDefinitions() {
    return BADGE_DEFINITIONS;
}

export default {
    checkAndUnlockBadges,
    awardCredits,
    getBadgeDefinitions,
};
