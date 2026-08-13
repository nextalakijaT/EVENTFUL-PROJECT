import { redisClient } from '../config/redis';

const DEFAULT_TTL_SECONDS = 60;

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redisClient.get(key);
  if (!cached) return null;
  return JSON.parse(cached) as T;
}

export async function setCache(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function deleteCache(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}