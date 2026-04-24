# Redis Caching Configuration

This document outlines the configuration and usage of Upstash Redis for caching and rate limiting in the AI Viz Portal.

## Overview

Upstash Redis is used as a distributed caching layer and rate limiting mechanism to improve application performance and protect against abuse.

## Prerequisites

1. **Upstash Account**: Create an account at [https://upstash.com](https://upstash.com)
2. **Redis Instance**: Create a Redis database in Upstash
3. **Environment Variables**: Configure the following environment variables

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Getting Upstash Credentials

1. Go to [Upstash Console](https://console.upstash.com)
2. Select your Redis database
3. Copy the **REST API URL** and **REST API Token**
4. Add them to your environment variables

## Installation

The Redis client is already installed via `@upstash/redis` package.

```bash
npm install @upstash/redis
```

## Usage

### Basic Caching

```typescript
import { setCache, getCache, deleteCache } from "@/lib/redisCache";

// Set a value in cache
await setCache("user:123", { name: "John", email: "john@example.com" }, { ttl: 3600 });

// Get a value from cache
const user = await getCache("user:123");

// Delete a value from cache
await deleteCache("user:123");
```

### Cache-Aside Pattern

```typescript
import { getOrSetCache } from "@/lib/redisCache";

const user = await getOrSetCache(
  "user:123",
  async () => {
    // Fetch from database if not in cache
    return await fetchUserFromDatabase(123);
  },
  { ttl: 3600 }
);
```

### API Response Caching

```typescript
import { cacheApiResponse } from "@/lib/redisCache";

const data = await cacheApiResponse(
  "api:models:list",
  async () => {
    const response = await fetch("https://api.example.com/models");
    return response.json();
  },
  { ttl: 300 } // 5 minutes
);
```

### Session Storage

```typescript
import { cacheSession, getSession, deleteSession } from "@/lib/redisCache";

// Store session
await cacheSession("session-123", { userId: 1, role: "admin" });

// Retrieve session
const session = await getSession("session-123");

// Delete session
await deleteSession("session-123");
```

### Cache Invalidation by Tags

```typescript
import { setCache, invalidateCacheByTag } from "@/lib/redisCache";

// Set cache with tags
await setCache("model:456", modelData, {
  ttl: 3600,
  tags: ["models", "model:456"],
});

// Invalidate all caches with a specific tag
await invalidateCacheByTag("models");
```

## Rate Limiting

### Basic Rate Limiting

```typescript
import { checkRateLimit } from "@/lib/redisRateLimit";

const result = await checkRateLimit("user:123", {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

if (!result.success) {
  return new Response("Rate limit exceeded", { status: 429 });
}
```

### Sliding Window Rate Limiting

More accurate rate limiting using a sliding window:

```typescript
import { checkSlidingWindowRateLimit } from "@/lib/redisRateLimit";

const result = await checkSlidingWindowRateLimit("user:123", {
  windowMs: 60000,
  maxRequests: 100,
});
```

### Token Bucket Rate Limiting

For burst traffic scenarios:

```typescript
import { checkTokenBucketRateLimit } from "@/lib/redisRateLimit";

const result = await checkTokenBucketRateLimit("user:123", {
  windowMs: 60000,
  maxRequests: 100,
  refillRate: 1.67, // 100 tokens per minute
});
```

## Monitoring

### Get Cache Statistics

```typescript
import { getCacheStats } from "@/lib/redisCache";

const stats = getCacheStats();
console.log(`Hit rate: ${stats.hitRate}%`);
console.log(`Hits: ${stats.hits}`);
console.log(`Misses: ${stats.misses}`);
```

### Get Redis Health

```typescript
import { getRedisHealth } from "@/lib/redisMonitoring";

const health = await getRedisHealth();
console.log(`Status: ${health.status}`);
console.log(`Recommendations: ${health.recommendations}`);
```

### Get Performance Report

```typescript
import { getPerformanceReport } from "@/lib/redisMonitoring";

const report = await getPerformanceReport();
console.log(`Current metrics:`, report.current);
console.log(`Health status:`, report.health);
console.log(`Trends:`, report.trends);
console.log(`Recommendations:`, report.recommendations);
```

## Best Practices

### TTL Configuration

- **API Responses**: 5-15 minutes (300-900s)
- **Database Queries**: 10-30 minutes (600-1800s)
- **Session Data**: 1-24 hours (3600-86400s)
- **Static Data**: 1-7 days (86400-604800s)

### Cache Key Naming

Use consistent and descriptive cache keys:

```
user:{userId}
model:{modelId}
api:{endpoint}:{params}
session:{sessionId}
tag:{tagName}
```

### Cache Invalidation

- Use tags for related data
- Invalidate cache on data updates
- Implement cache warming for frequently accessed data
- Monitor cache hit rates

### Rate Limiting

- Use different limits for different user tiers
- Implement exponential backoff for rate-limited clients
- Monitor rate limit violations
- Use sliding window for accurate limiting

## Troubleshooting

### Redis Connection Issues

If Redis is not available, the application will:
- Log a warning message
- Allow all requests to proceed (fail-open)
- Continue to function without caching

### High Cache Miss Rate

If cache hit rate is below 50%:
- Review TTL configuration
- Check cache key consistency
- Monitor data access patterns
- Consider cache warming

### Rate Limit Errors

If rate limiting is too aggressive:
- Review rate limit configuration
- Check time window settings
- Monitor user behavior patterns
- Adjust limits based on usage

## Performance Considerations

### Memory Usage

Monitor Redis memory usage:
- Set appropriate TTL values
- Use cache invalidation strategies
- Monitor memory consumption
- Clean up unused keys

### Latency

Upstash Redis has low latency (~1-2ms), but:
- Network latency can affect performance
- Use appropriate caching strategies
- Monitor response times
- Consider edge caching for global applications

### Scalability

Upstash Redis is fully managed and scales automatically:
- No manual scaling required
- Handles high throughput
- Provides high availability
- Automatic failover

## Security

### Authentication

- Keep REST tokens secure
- Use environment variables
- Rotate tokens regularly
- Monitor access logs

### Data Privacy

- Encrypt sensitive data before caching
- Use appropriate TTL for sensitive data
- Follow GDPR compliance
- Implement data retention policies

### Network Security

- Use HTTPS connections
- Configure IP allowlists if needed
- Monitor network traffic
- Use VPC peering for private networks

## Monitoring and Alerts

Set up monitoring for:
- Cache hit rates (target: > 70%)
- Redis availability (target: 99.9%)
- Response times (target: < 10ms)
- Memory usage (target: < 80%)
- Rate limit violations

## Related Documentation

- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Rate Limiting Strategies](https://upstash.com/docs/redis/sdks/ratelimit)
- [Caching Best Practices](https://upstash.com/docs/guides/caching)
