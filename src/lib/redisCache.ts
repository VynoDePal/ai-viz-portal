/**
 * Redis caching utilities using Upstash Redis
 */

import { Redis } from "@upstash/redis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

let redisClient: Redis | null = null;
let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  hitRate: 0,
};

/**
 * Initialize Redis client
 */
export function initializeRedis(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn("Upstash Redis credentials not found. Caching will be disabled.");
    return new Redis({
      url: "",
      token: "",
    });
  }

  redisClient = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return redisClient;
}

/**
 * Get Redis client
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
}

/**
 * Set cache value
 */
export async function setCache(
  key: string,
  value: any,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const serialized = JSON.stringify(value);
    
    if (options.ttl) {
      await redis.set(key, serialized, { ex: options.ttl });
    } else {
      await redis.set(key, serialized);
    }

    // Store tags for invalidation
    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await redis.sadd(`tag:${tag}`, key);
      }
    }
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

/**
 * Get cache value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    
    if (value) {
      cacheStats.hits++;
      return JSON.parse(value as string) as T;
    } else {
      cacheStats.misses++;
      return null;
    }
  } catch (error) {
    console.error("Error getting cache:", error);
    cacheStats.misses++;
    return null;
  }
}

/**
 * Delete cache value
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error deleting cache:", error);
  }
}

/**
 * Invalidate cache by tags
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.smembers(`tag:${tag}`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    await redis.del(`tag:${tag}`);
  } catch (error) {
    console.error("Error invalidating cache by tag:", error);
  }
}

/**
 * Invalidate multiple cache keys
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.flushdb();
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Get or set cache (cache-aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  factory: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await getCache<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  const value = await factory();
  await setCache(key, value, options);
  
  return value;
}

/**
 * Cache API response
 */
export async function cacheApiResponse<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = { ttl: 300 } // 5 minutes default
): Promise<T> {
  return getOrSetCache(key, fetcher, options);
}

/**
 * Cache database query result
 */
export async function cacheQueryResult<T>(
  key: string,
  query: () => Promise<T>,
  options: CacheOptions = { ttl: 600 } // 10 minutes default
): Promise<T> {
  return getOrSetCache(key, query, options);
}

/**
 * Cache session data
 */
export async function cacheSession(
  sessionId: string,
  data: any,
  options: CacheOptions = { ttl: 3600 } // 1 hour default
): Promise<void> {
  const key = `session:${sessionId}`;
  await setCache(key, data, options);
}

/**
 * Get session data
 */
export async function getSession(sessionId: string): Promise<any | null> {
  const key = `session:${sessionId}`;
  return getCache(key);
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const key = `session:${sessionId}`;
  await deleteCache(key);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const total = cacheStats.hits + cacheStats.misses;
  cacheStats.hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0;
  
  return { ...cacheStats };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
  };
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis not available:", error);
    return false;
  }
}

/**
 * Get Redis info
 * Note: Upstash Redis doesn't support the INFO command, so this returns basic availability status
 */
export async function getRedisInfo(): Promise<Record<string, any> | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const available = await isRedisAvailable();
    return {
      available,
      client: "upstash",
    };
  } catch (error) {
    console.error("Error getting Redis info:", error);
    return null;
  }
}

/**
 * Warm up cache with common data
 */
export async function warmUpCache(entries: Array<{ key: string; factory: () => Promise<any>; options?: CacheOptions }>): Promise<void> {
  const promises = entries.map(async (entry) => {
    try {
      const value = await entry.factory();
      await setCache(entry.key, value, entry.options);
    } catch (error) {
      console.error(`Error warming up cache for key ${entry.key}:`, error);
    }
  });
  
  await Promise.all(promises);
}
