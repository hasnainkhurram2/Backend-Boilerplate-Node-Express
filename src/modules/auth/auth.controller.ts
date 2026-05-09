import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/utils/api-response.util';
import type { AuthenticatedRequest } from '@/shared/types';
import type { RegisterDto, LoginDto, RefreshDto } from './auth.types';
import * as AuthService from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.register(req.body as RegisterDto);
    ApiResponse.created(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.login(req.body as LoginDto);
    ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshDto;
    const tokens = await AuthService.refreshTokens(refreshToken);
    ApiResponse.success(res, tokens, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    await AuthService.logout(sub);
    ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = req.user as { googleId: string; email: string; name: string };
    const result = await AuthService.findOrCreateOAuthUser(profile);
    ApiResponse.success(res, result, 'OAuth login successful');
  } catch (err) {
    next(err);
  }
}
