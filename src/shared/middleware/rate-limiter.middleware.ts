import rateLimit from 'express-rate-limit';
import { env } from '@/config';
import { ApiResponse } from '@/shared/utils/api-response.util';
import { Request, Response } from 'express';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponse.error(res, 'Too many requests, please try again later.', 429);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponse.error(res, 'Too many authentication attempts, please try again later.', 429);
  },
});
