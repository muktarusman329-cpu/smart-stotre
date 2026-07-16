import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function disconnectRedis() {
  if (redis.isOpen) {
    await redis.disconnect();
  }
}

// Cache helpers
export async function getCache(key: string) {
  try {
    await connectRedis();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds?: number) {
  try {
    await connectRedis();
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setEx(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCache(key: string) {
  try {
    await connectRedis();
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

export async function invalidatePattern(pattern: string) {
  try {
    await connectRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return keys.length;
  } catch (error) {
    console.error('Redis invalidate pattern error:', error);
    return 0;
  }
}
