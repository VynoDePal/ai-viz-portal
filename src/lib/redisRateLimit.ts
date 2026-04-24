/**
 * Redis-based rate limiting utilities
 */

import { getRedisClient } from "./redisCache";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for Redis keys
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    // If Redis is not available, allow all requests
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      limit: config.maxRequests,
    };
  }

  const keyPrefix = config.keyPrefix || "ratelimit";
  const key = `${keyPrefix}:${identifier}`;
  const windowStart = Date.now();
  const windowEnd = windowStart + config.windowMs;

  try {
    // Get current count
    const current = await redis.get(key);
    const count = current ? parseInt(current as string, 10) : 0;

    if (count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: new Date(windowEnd),
        limit: config.maxRequests,
      };
    }

    // Increment counter
    const newCount = count + 1;
    await redis.set(key, newCount, { px: config.windowMs });

    return {
      success: true,
      remaining: config.maxRequests - newCount,
      resetTime: new Date(windowEnd),
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow the request
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(windowEnd),
      limit: config.maxRequests,
    };
  }
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string, keyPrefix: string = "ratelimit"): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `${keyPrefix}:${identifier}`;
    await redis.del(key);
  } catch (error) {
    console.error("Error resetting rate limit:", error);
  }
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<{ count: number; remaining: number; resetTime: Date }> {
  const redis = getRedisClient();
  if (!redis) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }

  const keyPrefix = config.keyPrefix || "ratelimit";
  const key = `${keyPrefix}:${identifier}`;

  try {
    const current = await redis.get(key);
    const count = current ? parseInt(current as string, 10) : 0;
    const windowEnd = Date.now() + config.windowMs;

    return {
      count,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime: new Date(windowEnd),
    };
  } catch (error) {
    console.error("Error getting rate limit status:", error);
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Sliding window rate limit (more accurate)
 */
export async function checkSlidingWindowRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      limit: config.maxRequests,
    };
  }

  const keyPrefix = config.keyPrefix || "ratelimit";
  const key = `${keyPrefix}:sliding:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current entries
    const count = await redis.zcard(key);

    if (count >= config.maxRequests) {
      // Rate limit exceeded
      const oldestEntry = await redis.zrange(key, 0, 0);
      const resetTime = oldestEntry.length > 0 ? new Date(parseInt(oldestEntry[0] as string, 10) + config.windowMs) : new Date(now + config.windowMs);

      return {
        success: false,
        remaining: 0,
        resetTime,
        limit: config.maxRequests,
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: now.toString() });
    await redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      success: true,
      remaining: config.maxRequests - count - 1,
      resetTime: new Date(now + config.windowMs),
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error("Error checking sliding window rate limit:", error);
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(now + config.windowMs),
      limit: config.maxRequests,
    };
  }
}

/**
 * Token bucket rate limit (for burst traffic)
 */
export async function checkTokenBucketRateLimit(
  identifier: string,
  config: RateLimitConfig & { refillRate: number } // refillRate in tokens per second
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      limit: config.maxRequests,
    };
  }

  const keyPrefix = config.keyPrefix || "ratelimit";
  const key = `${keyPrefix}:tokenbucket:${identifier}`;
  const now = Date.now();

  try {
    // Get current bucket state
    const current = await redis.get(key);
    
    let tokens: number;
    let lastRefill: number;

    if (current) {
      const state = JSON.parse(current as string);
      tokens = state.tokens;
      lastRefill = state.lastRefill;
      
      // Refill tokens
      const timePassed = (now - lastRefill) / 1000; // in seconds
      const tokensToAdd = timePassed * config.refillRate;
      tokens = Math.min(config.maxRequests, tokens + tokensToAdd);
    } else {
      tokens = config.maxRequests;
      lastRefill = now;
    }

    if (tokens < 1) {
      // Rate limit exceeded
      const timeToRefill = (1 - tokens) / config.refillRate;
      return {
        success: false,
        remaining: 0,
        resetTime: new Date(now + timeToRefill * 1000),
        limit: config.maxRequests,
      };
    }

    // Consume one token
    tokens -= 1;
    
    // Update bucket state
    await redis.set(
      key,
      JSON.stringify({ tokens, lastRefill: now }),
      { px: config.windowMs }
    );

    return {
      success: true,
      remaining: Math.floor(tokens),
      resetTime: new Date(now + config.windowMs),
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error("Error checking token bucket rate limit:", error);
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: new Date(now + config.windowMs),
      limit: config.maxRequests,
    };
  }
}
