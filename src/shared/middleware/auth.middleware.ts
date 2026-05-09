import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import { verifyAccessToken } from '@/shared/utils/jwt.util';
import type { AuthenticatedRequest, JwtPayload, Role } from '@/shared/types';

/**
 * JWT authentication middleware with optional role guard.
 *
 * Usage:
 *   router.get('/protected', authMiddleware(), handler)
 *   router.get('/admin-only', authMiddleware([Role.ADMIN]), handler)
 */
export function authMiddleware(allowedRoles?: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Missing or malformed Authorization header'));
    }

    const token = authHeader.slice(7);

    let payload: JwtPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  };
}
