import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * JWT Token Utilities
 * Helper functions for generating and verifying JWT tokens
 */

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRE: string = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_REFRESH_EXPIRE: string = process.env.JWT_REFRESH_EXPIRE || '30d';

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
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRE,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRE,
  };

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

