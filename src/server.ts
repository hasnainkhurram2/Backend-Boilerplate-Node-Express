import 'reflect-metadata';
import { createApp } from './app';
import { env } from '@/config';
import { connectPostgres, disconnectPostgres } from '@/infrastructure/postgres/data-source';
import { connectMongo, disconnectMongo } from '@/infrastructure/mongo/connection';
import { connectRedis, disconnectRedis } from '@/infrastructure/redis/client';
import { logger } from '@/shared/utils/logger.util';

async function bootstrap(): Promise<void> {
  // Connect to all configured databases
  await Promise.all([connectPostgres(), connectMongo(), connectRedis()]);

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      void (async () => {
        await Promise.all([disconnectPostgres(), disconnectMongo(), disconnectRedis()]);
        logger.info('All connections closed. Goodbye.');
        process.exit(0);
      })();
    });

    // Force exit after 10 seconds if server hasn't closed
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err });
    shutdown('uncaughtException');
  });
}

void bootstrap();
