import crypto from 'crypto';

/**
 * Crypto Utilities
 * Helper functions for cryptographic operations
 */

/**
 * Generate a random token
 * @param bytes Number of bytes for the token (default: 32)
 * @returns Hex string token
 */
export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a token
 * @param token Token to hash
 * @returns Hashed token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a password reset token and its hash
 * @returns Object with token and hashedToken
 */
export const generatePasswordResetToken = (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  return { token, hashedToken, expiresAt };
};


