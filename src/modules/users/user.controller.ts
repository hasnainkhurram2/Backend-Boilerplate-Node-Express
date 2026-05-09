import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/shared/utils/api-response.util';
import type { AuthenticatedRequest } from '@/shared/types';
import type { UpdateUserDto } from './user.types';
import * as UserService from './user.service';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const user = await UserService.getUserById(sub);
    ApiResponse.success(res, user, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await UserService.getUserById(req.params['id'] as string);
    ApiResponse.success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { data, meta } = await UserService.listUsers(req.query);
    ApiResponse.success(res, data, 'Users retrieved', 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sub } = (req as AuthenticatedRequest).user;
    const user = await UserService.updateUser(sub, req.body as UpdateUserDto);
    ApiResponse.success(res, user, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await UserService.deleteUser(req.params['id'] as string);
    ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}
