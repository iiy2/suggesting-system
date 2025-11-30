import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { redisClient } from '../config/redis.js';

// Create a custom store using Redis
class RedisStore {
  private prefix: string;
  private client: typeof redisClient;

  constructor(options: { prefix?: string }) {
    this.prefix = options.prefix || 'rl:';
    this.client = redisClient;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const prefixedKey = this.prefix + key;
    const current = await this.client.incr(prefixedKey);

    if (current === 1) {
      await this.client.expire(prefixedKey, 60); // 60 seconds window
    }

    return {
      totalHits: current,
      resetTime: new Date(Date.now() + 60000)
    };
  }

  async decrement(key: string): Promise<void> {
    const prefixedKey = this.prefix + key;
    await this.client.decr(prefixedKey);
  }

  async resetKey(key: string): Promise<void> {
    const prefixedKey = this.prefix + key;
    await this.client.del(prefixedKey);
  }
}

// Global rate limiter
export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ prefix: 'rl:global:' }) as any
});

// Login rate limiter - more strict
export const loginRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  skipSuccessfulRequests: true,
  store: new RedisStore({ prefix: 'rl:login:' }) as any
});

// Registration rate limiter
export const registerRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    success: false,
    message: 'Too many accounts created, please try again later'
  },
  store: new RedisStore({ prefix: 'rl:register:' }) as any
});
