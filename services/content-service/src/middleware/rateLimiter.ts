import rateLimit from 'express-rate-limit';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

// Create a rate limiter using Redis store
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: {
      async increment(key: string): Promise<{ totalHits: number; resetTime: Date | undefined }> {
        try {
          const current = await redisClient.incr(key);

          if (current === 1) {
            await redisClient.expire(key, Math.ceil(options.windowMs / 1000));
          }

          const ttl = await redisClient.ttl(key);
          const resetTime = ttl > 0 ? new Date(Date.now() + ttl * 1000) : undefined;

          return {
            totalHits: current,
            resetTime
          };
        } catch (error) {
          logger.error('Rate limiter Redis error:', error);
          // Fallback to allowing the request if Redis fails
          return {
            totalHits: 0,
            resetTime: undefined
          };
        }
      },

      async decrement(key: string): Promise<void> {
        try {
          await redisClient.decr(key);
        } catch (error) {
          logger.error('Rate limiter decrement error:', error);
        }
      },

      async resetKey(key: string): Promise<void> {
        try {
          await redisClient.del(key);
        } catch (error) {
          logger.error('Rate limiter reset error:', error);
        }
      }
    }
  });
};

// General API rate limiter (100 requests per 15 minutes)
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

// Strict rate limiter for content creation (10 requests per hour)
export const createContentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many content creation requests, please try again later'
});
