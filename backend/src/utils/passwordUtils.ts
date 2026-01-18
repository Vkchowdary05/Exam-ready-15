// src/utils/passwordUtils.ts
// Password hashing and comparison utilities

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
    candidatePassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
}

export default { hashPassword, comparePassword };
