import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * JWT Token Utilities
 * Helper functions for generating and verifying JWT tokens
 */

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRE_RAW: string = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_REFRESH_EXPIRE_RAW: string = process.env.JWT_REFRESH_EXPIRE || '30d';

// Convert duration like "15m", "1h", "7d" to seconds for type safety
const toSeconds = (val: string): number => {
  const match = /^([0-9]+)\s*([smhd])$/.exec(val.trim());
  if (!match) {
    const asNum = Number(val);
    return Number.isFinite(asNum) ? asNum : 3600; // default 1h
  }
  const num = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 3600;
  }
};

const JWT_EXPIRE = toSeconds(JWT_EXPIRE_RAW);
const JWT_REFRESH_EXPIRE = toSeconds(JWT_REFRESH_EXPIRE_RAW);

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate Access Token
 */
export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: String((user as any)._id),
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = { expiresIn: JWT_EXPIRE };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: String((user as any)._id),
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRE };

  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

