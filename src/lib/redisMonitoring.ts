/**
 * Redis monitoring utilities
 */

import { getRedisClient, getCacheStats, isRedisAvailable } from "./redisCache";

export interface RedisMetrics {
  available: boolean;
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  connectionStatus: "connected" | "disconnected" | "error";
  lastCheck: Date;
}

export interface RedisHealth {
  status: "healthy" | "degraded" | "unhealthy";
  metrics: RedisMetrics;
  recommendations: string[];
}

let monitoringHistory: RedisMetrics[] = [];
const MAX_HISTORY_SIZE = 100;

/**
 * Get current Redis metrics
 */
export async function getRedisMetrics(): Promise<RedisMetrics> {
  const available = await isRedisAvailable();
  const cacheStats = getCacheStats();
  const connectionStatus = available ? "connected" : "disconnected";

  const metrics: RedisMetrics = {
    available,
    cacheStats,
    connectionStatus,
    lastCheck: new Date(),
  };

  // Add to history
  monitoringHistory.push(metrics);
  
  // Limit history size
  if (monitoringHistory.length > MAX_HISTORY_SIZE) {
    monitoringHistory.shift();
  }

  return metrics;
}

/**
 * Get Redis health status
 */
export async function getRedisHealth(): Promise<RedisHealth> {
  const metrics = await getRedisMetrics();
  const recommendations: string[] = [];
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";

  // Check availability
  if (!metrics.available) {
    status = "unhealthy";
    recommendations.push("Redis is not available. Check connection credentials and network.");
  }

  // Check hit rate
  if (metrics.cacheStats.hitRate < 50 && metrics.cacheStats.hits + metrics.cacheStats.misses > 100) {
    status = status === "healthy" ? "degraded" : status;
    recommendations.push("Cache hit rate is below 50%. Consider increasing TTL or caching more data.");
  }

  // Check connection status
  if (metrics.connectionStatus === "error") {
    status = "unhealthy";
    recommendations.push("Redis connection error. Check logs for details.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Redis is operating normally.");
  }

  return {
    status,
    metrics,
    recommendations,
  };
}

/**
 * Get monitoring history
 */
export function getMonitoringHistory(limit: number = 100): RedisMetrics[] {
  return monitoringHistory.slice(-limit);
}

/**
 * Get average cache hit rate over time period
 */
export function getAverageHitRate(minutes: number = 60): number {
  const cutoffTime = Date.now() - minutes * 60 * 1000;
  const recentMetrics = monitoringHistory.filter(
    (m) => m.lastCheck.getTime() > cutoffTime
  );

  if (recentMetrics.length === 0) return 0;

  const totalHitRate = recentMetrics.reduce(
    (sum, m) => sum + m.cacheStats.hitRate,
    0
  );

  return totalHitRate / recentMetrics.length;
}

/**
 * Check if Redis performance is degrading
 */
export function isPerformanceDegrading(): boolean {
  if (monitoringHistory.length < 10) return false;

  const recent = monitoringHistory.slice(-10);
  const older = monitoringHistory.slice(-20, -10);

  const recentAvgHitRate =
    recent.reduce((sum, m) => sum + m.cacheStats.hitRate, 0) / recent.length;
  const olderAvgHitRate =
    older.reduce((sum, m) => sum + m.cacheStats.hitRate, 0) / older.length;

  // Performance is degrading if hit rate dropped by more than 10%
  return recentAvgHitRate < olderAvgHitRate * 0.9;
}

/**
 * Get Redis performance report
 */
export async function getPerformanceReport(): Promise<{
  current: RedisMetrics;
  health: RedisHealth;
  trends: {
    hitRateTrend: "improving" | "stable" | "degrading";
    availabilityTrend: "stable" | "unstable";
  };
  recommendations: string[];
}> {
  const current = await getRedisMetrics();
  const health = await getRedisHealth();
  
  const hitRateTrend = isPerformanceDegrading() ? "degrading" : 
    monitoringHistory.length >= 10 ? "stable" : "improving";
  
  const recentAvailability = monitoringHistory.slice(-10);
  const availabilityTrend = recentAvailability.every((m) => m.available) ? "stable" : "unstable";

  const recommendations = health.recommendations;

  if (hitRateTrend === "degrading") {
    recommendations.push("Cache performance is degrading. Review caching strategy.");
  }

  if (availabilityTrend === "unstable") {
    recommendations.push("Redis availability is unstable. Check network connectivity.");
  }

  return {
    current,
    health,
    trends: {
      hitRateTrend,
      availabilityTrend,
    },
    recommendations,
  };
}

/**
 * Reset monitoring history
 */
export function resetMonitoringHistory(): void {
  monitoringHistory = [];
}

/**
 * Clean up old monitoring history
 */
export function cleanupOldMonitoringHistory(maxAge: number = 24 * 60 * 60 * 1000): void {
  const cutoffTime = Date.now() - maxAge;
  monitoringHistory = monitoringHistory.filter(
    (m) => m.lastCheck.getTime() > cutoffTime
  );
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldMonitoringHistory, 3600000);
}
