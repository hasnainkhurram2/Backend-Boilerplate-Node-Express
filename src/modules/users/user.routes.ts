import { Router } from 'express';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { validate } from '@/shared/middleware/validate.middleware';
import { Role } from '@/shared/types';
import { updateUserSchema, userIdParamSchema, listUsersQuerySchema } from './user.types';
import * as UserController from './user.controller';

const router = Router();

// Current authenticated user
router.get('/me', authMiddleware(), UserController.getMe);
router.patch(
  '/me',
  authMiddleware(),
  validate({ body: updateUserSchema }),
  UserController.updateMe,
);

// Admin-only routes
router.get(
  '/',
  authMiddleware([Role.ADMIN]),
  validate({ query: listUsersQuerySchema }),
  UserController.listUsers,
);
router.get(
  '/:id',
  authMiddleware([Role.ADMIN]),
  validate({ params: userIdParamSchema }),
  UserController.getUserById,
);
router.delete(
  '/:id',
  authMiddleware([Role.ADMIN]),
  validate({ params: userIdParamSchema }),
  UserController.deleteUser,
);

export default router;
