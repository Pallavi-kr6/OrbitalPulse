import { Redis } from "@upstash/redis";
import { env } from "@/config/env";

const memoryCache = new Map<string, { value: string; expiresAt: number }>();
const redisClient = env.REDIS_URL && env.REDIS_TOKEN ? new Redis({ url: env.REDIS_URL, token: env.REDIS_TOKEN }) : null;

function getFallbackValue<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

function setFallbackValue<T>(key: string, value: T, ttl: number) {
  const expiresAt = Date.now() + ttl * 1_000;
  memoryCache.set(key, { value: JSON.stringify(value), expiresAt });
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) {
    return getFallbackValue<T>(key);
  }

  try {
    const value = await redisClient.get<string>(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    return getFallbackValue<T>(key);
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const stringValue = JSON.stringify(value);
  if (!redisClient) {
    setFallbackValue(key, value, ttlSeconds);
    return;
  }

  try {
    await redisClient.set(key, stringValue, { ex: ttlSeconds });
  } catch (error) {
    setFallbackValue(key, value, ttlSeconds);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redisClient) {
    memoryCache.delete(key);
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    memoryCache.delete(key);
  }
}

export async function memoize<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached) return cached;
  const value = await loader();
  await setCache(key, value, ttlSeconds);
  return value;
}
