import Redis from 'ioredis';
import { env } from '@/config';
import { logger } from '@/shared/utils/logger.util';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD ?? undefined,
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.error('Redis: max retry attempts reached');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error', { err }));
  redisClient.on('close', () => logger.warn('Redis connection closed'));

  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
