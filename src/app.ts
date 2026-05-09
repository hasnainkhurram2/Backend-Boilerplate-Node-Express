import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';

import { env } from '@/config';
import { httpLogger } from '@/shared/middleware/logger.middleware';
import { globalRateLimiter } from '@/shared/middleware/rate-limiter.middleware';
import { notFoundHandler, globalErrorHandler } from '@/shared/middleware/error.middleware';
import { initPassport } from '@/modules/auth/auth.passport';
import rootRouter from '@/routes';

export function createApp(): Application {
  const app = express();

  // Trust proxy (important when behind Nginx, load balancers, etc.)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP logging
  app.use(httpLogger);

  // Global rate limiter
  app.use(globalRateLimiter);

  // Passport (stateless — no sessions)
  initPassport();
  app.use(passport.initialize());

  // API routes
  app.use(env.API_PREFIX, rootRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}
