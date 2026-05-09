import jwt from 'jsonwebtoken';
import { env } from '@/config';
import type { JwtPayload } from '@/shared/types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

/** Milliseconds until a JWT string expires. Returns 0 if already expired. */
export function msUntilExpiry(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return 0;
  return Math.max(0, decoded.exp * 1000 - Date.now());
}
