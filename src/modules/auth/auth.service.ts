import { AppError } from '@/shared/errors/AppError';
import { hashPassword, comparePassword } from '@/shared/utils/password.util';
import { signTokenPair, verifyRefreshToken, msUntilExpiry } from '@/shared/utils/jwt.util';
import { getRedisClient } from '@/infrastructure/redis/client';
import { Role } from '@/shared/types';
import * as UserRepository from '@/modules/users/user.repository';
import type { RegisterDto, LoginDto, AuthResponse, AuthTokens } from './auth.types';

const REFRESH_TOKEN_PREFIX = 'refresh_token:';

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const redis = getRedisClient();
  const ttlMs = msUntilExpiry(token);
  const ttlSec = Math.floor(ttlMs / 1000);
  if (ttlSec > 0) {
    await redis.set(`${REFRESH_TOKEN_PREFIX}${userId}`, token, 'EX', ttlSec);
  }
}

async function invalidateRefreshToken(userId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
}

async function getStoredRefreshToken(userId: string): Promise<string | null> {
  const redis = getRedisClient();
  return redis.get(`${REFRESH_TOKEN_PREFIX}${userId}`);
}

function buildTokenPayload(user: { id: string; email: string; role: Role }) {
  return { sub: user.id, email: user.email, role: user.role };
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await UserRepository.findUserByEmail(dto.email);
  if (existing) throw AppError.conflict('An account with this email already exists');

  const password = await hashPassword(dto.password);
  const user = await UserRepository.createUser({ ...dto, password, role: Role.USER });

  const payload = buildTokenPayload(user);
  const tokens = signTokenPair(payload);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, tokens };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const userWithPwd = await UserRepository.findUserByEmail(dto.email, true);
  if (!userWithPwd) throw AppError.unauthorized('Invalid email or password');

  const isMatch = await comparePassword(dto.password, userWithPwd.password);
  if (!isMatch) throw AppError.unauthorized('Invalid email or password');

  const payload = buildTokenPayload(userWithPwd);
  const tokens = signTokenPair(payload);
  await storeRefreshToken(userWithPwd.id, tokens.refreshToken);

  return {
    user: {
      id: userWithPwd.id,
      name: userWithPwd.name,
      email: userWithPwd.email,
      role: userWithPwd.role,
    },
    tokens,
  };
}

export async function refreshTokens(incomingRefreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await getStoredRefreshToken(payload.sub);
  if (!stored || stored !== incomingRefreshToken) {
    throw AppError.unauthorized('Refresh token has been revoked');
  }

  const tokens = signTokenPair({ sub: payload.sub, email: payload.email, role: payload.role });
  await storeRefreshToken(payload.sub, tokens.refreshToken);
  return tokens;
}

export async function logout(userId: string): Promise<void> {
  await invalidateRefreshToken(userId);
}

export async function findOrCreateOAuthUser(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<AuthResponse> {
  let user = await UserRepository.findUserByGoogleId(profile.googleId);

  if (!user) {
    const existing = await UserRepository.findUserByEmail(profile.email);
    if (existing) throw AppError.conflict('An account with this email already exists');

    const created = await UserRepository.createUser({
      name: profile.name,
      email: profile.email,
      password: '',
      role: Role.USER,
    });

    user = await UserRepository.findUserByEmail(created.email);
    if (!user) throw AppError.internal('Failed to create OAuth user');
  }

  const payload = buildTokenPayload(user);
  const tokens = signTokenPair(payload);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tokens,
  };
}
