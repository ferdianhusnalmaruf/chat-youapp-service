import { logger } from '@/utils/logger';
import Redis from 'ioredis';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl, { lazyConnect: true });

    redis.on('error', (error) => {
      logger.error({ error }, 'Redis connection error');
    });

    redis.on('connect', () => {
      logger.info(`Connected to Redis at ${redisUrl}`);
    });

    redis.on('close', () => {
      logger.info('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }
  return redis;
};

export const connectRedis = async (): Promise<void> => {
  const client = await getRedisClient();
  if (client.status === 'ready' || client.status === 'connecting') {
    return;
  }
  await client.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redis) {
    return;
  }
  await redis.quit();
  redis = null;
};
