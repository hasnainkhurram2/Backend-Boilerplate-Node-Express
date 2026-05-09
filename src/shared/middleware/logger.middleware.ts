import morgan from 'morgan';
import { Request, Response } from 'express';
import { logger } from '@/shared/utils/logger.util';
import { env } from '@/config';

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const httpLogger = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream,
  skip: (_req: Request, res: Response) =>
    env.NODE_ENV === 'test' || res.statusCode < 400,
});
