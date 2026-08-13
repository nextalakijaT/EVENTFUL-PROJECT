import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { env } from '../config/env';

// during tests, skip the Redis-backed store entirely — falls back to
// express-rate-limit's default in-memory store, which needs no Redis connection
const useRedisStore = env.nodeEnv !== 'test';

function buildStore(prefix: string) {
  if (!useRedisStore) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) =>
      redisClient.call(args[0], ...args.slice(1)) as Promise<any>,
    prefix,
  });
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
  store: buildStore('rl:auth:'),
});

export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment requests, please slow down' },
  store: buildStore('rl:payment:'),
});

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore('rl:general:'),
});