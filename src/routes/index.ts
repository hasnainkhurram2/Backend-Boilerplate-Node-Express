import { Router, Request, Response } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/users/user.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
