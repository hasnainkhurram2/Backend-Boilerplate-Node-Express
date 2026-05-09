import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/shared/errors/AppError';
import { ApiResponse } from '@/shared/utils/api-response.util';
import { logger } from '@/shared/utils/logger.util';
import { env } from '@/config';

export function notFoundHandler(req: Request, res: Response): void {
  ApiResponse.error(res, `Route ${req.method} ${req.path} not found`, 404);
}

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error', { err });
    }
    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errors,
      env.NODE_ENV !== 'production' ? err.stack : undefined,
    );
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors as Record<string, string[]>;
    ApiResponse.error(res, 'Validation failed', 422, fieldErrors);
    return;
  }

  logger.error('Unhandled error', { err });
  ApiResponse.error(
    res,
    'Internal Server Error',
    500,
    undefined,
    env.NODE_ENV !== 'production' && err instanceof Error ? err.stack : undefined,
  );
}
