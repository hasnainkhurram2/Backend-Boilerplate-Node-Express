import { Router } from 'express';
import passport from 'passport';
import { authRateLimiter } from '@/shared/middleware/rate-limiter.middleware';
import { validate } from '@/shared/middleware/validate.middleware';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.types';
import * as AuthController from './auth.controller';

const router = Router();

// Local auth
router.post('/register', authRateLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/refresh', validate({ body: refreshSchema }), AuthController.refresh);
router.post('/logout', authMiddleware(), AuthController.logout);

// Google OAuth2 — only mounted when GOOGLE_CLIENT_ID is set
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login', session: false }),
  AuthController.googleCallback,
);

export default router;
