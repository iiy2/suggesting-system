import { createClient } from 'redis';
import logger from '../utils/logger.js';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis max retries reached');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err: Error) => logger.error('Redis Client Error:', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('reconnecting', () => logger.warn('Redis Client Reconnecting'));

export type RedisClient = typeof redisClient;
