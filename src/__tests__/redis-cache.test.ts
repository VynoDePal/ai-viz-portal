import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  initializeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  invalidateCacheByTag,
  invalidateCache,
  clearCache,
  getOrSetCache,
  cacheApiResponse,
  cacheQueryResult,
  cacheSession,
  getSession,
  deleteSession,
  getCacheStats,
  resetCacheStats,
  isRedisAvailable,
  getRedisInfo,
  warmUpCache,
} from "@/lib/redisCache";

// Mock Upstash Redis
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    set: vi.fn().mockResolvedValue("OK"),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
    sadd: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    flushdb: vi.fn().mockResolvedValue("OK"),
    ping: vi.fn().mockResolvedValue("PONG"),
    expire: vi.fn().mockResolvedValue(1),
  })),
}));

describe("Redis Cache", () => {
  beforeEach(() => {
    // Reset cache stats before each test
    resetCacheStats();
    vi.clearAllMocks();
  });

  describe("initializeRedis", () => {
    it("should initialize Redis client with credentials", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis = initializeRedis();
      expect(redis).toBeDefined();
    });

    it("should return client if already initialized", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis1 = initializeRedis();
      const redis2 = getRedisClient();
      expect(redis1).toBe(redis2);
    });
  });

  describe("setCache", () => {
    it("should set cache value", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await setCache("test-key", { data: "test" });
      const redis = getRedisClient();
      expect(redis?.set).toHaveBeenCalled();
    });

    it("should set cache with TTL", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await setCache("test-key", { data: "test" }, { ttl: 300 });
      const redis = getRedisClient();
      expect(redis?.set).toHaveBeenCalled();
    });
  });

  describe("getCache", () => {
    it("should get cache value", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis = getRedisClient();
      (redis?.get as any).mockResolvedValueOnce(JSON.stringify({ data: "test" }));

      const value = await getCache("test-key");
      expect(value).toEqual({ data: "test" });
    });

    it("should return null for cache miss", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const value = await getCache("non-existent-key");
      expect(value).toBeNull();
    });
  });

  describe("deleteCache", () => {
    it("should delete cache value", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await deleteCache("test-key");
      const redis = getRedisClient();
      expect(redis?.del).toHaveBeenCalled();
    });
  });

  describe("invalidateCacheByTag", () => {
    it("should invalidate cache by tag", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis = getRedisClient();
      (redis?.smembers as any).mockResolvedValueOnce(["key1", "key2"]);

      await invalidateCacheByTag("test-tag");
      expect(redis?.del).toHaveBeenCalled();
    });
  });

  describe("getOrSetCache", () => {
    it("should get cached value if exists", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis = getRedisClient();
      (redis?.get as any).mockResolvedValueOnce(JSON.stringify({ data: "cached" }));

      const value = await getOrSetCache("test-key", async () => ({ data: "new" }));
      expect(value).toEqual({ data: "cached" });
    });

    it("should set and return new value if cache miss", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const value = await getOrSetCache("test-key", async () => ({ data: "new" }));
      expect(value).toEqual({ data: "new" });
    });
  });

  describe("cacheApiResponse", () => {
    it("should cache API response", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const fetcher = async () => ({ data: "api-response" });
      const value = await cacheApiResponse("api-key", fetcher);
      expect(value).toEqual({ data: "api-response" });
    });
  });

  describe("cacheSession", () => {
    it("should cache session data", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await cacheSession("session-123", { userId: 1 });
      const redis = getRedisClient();
      expect(redis?.set).toHaveBeenCalled();
    });
  });

  describe("getSession", () => {
    it("should get session data", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const redis = getRedisClient();
      (redis?.get as any).mockResolvedValueOnce(JSON.stringify({ userId: 1 }));

      const session = await getSession("session-123");
      expect(session).toEqual({ userId: 1 });
    });
  });

  describe("deleteSession", () => {
    it("should delete session", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      await deleteSession("session-123");
      const redis = getRedisClient();
      expect(redis?.del).toHaveBeenCalled();
    });
  });

  describe("getCacheStats", () => {
    it("should return cache statistics", () => {
      const stats = getCacheStats();
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(stats).toHaveProperty("hitRate");
    });
  });

  describe("resetCacheStats", () => {
    it("should reset cache statistics", () => {
      resetCacheStats();
      const stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe("isRedisAvailable", () => {
    it("should check Redis availability", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const available = await isRedisAvailable();
      expect(available).toBe(true);
    });
  });

  describe("getRedisInfo", () => {
    it("should get Redis info", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const info = await getRedisInfo();
      expect(info).toBeDefined();
      expect(info?.available).toBe(true);
    });
  });

  describe("warmUpCache", () => {
    it("should warm up cache with entries", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const entries = [
        {
          key: "key1",
          factory: async () => ({ data: "value1" }),
        },
        {
          key: "key2",
          factory: async () => ({ data: "value2" }),
        },
      ];

      await warmUpCache(entries);
      const redis = getRedisClient();
      expect(redis?.set).toHaveBeenCalled();
    });
  });
});
