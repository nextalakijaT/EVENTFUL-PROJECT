import Redis from 'ioredis';
import { env } from './env';

export const redisClient = new Redis(env.redisUrl);

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));