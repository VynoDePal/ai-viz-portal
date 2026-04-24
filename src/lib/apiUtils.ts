/**
 * API utilities for authentication, rate limiting, and key management
 */

import { APIKey, APIUsage, APIRateLimit } from "@/types/api";

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const prefix = "aivp_";
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${randomPart}`;
}

/**
 * Validate API key format
 */
export function validateApiKey(key: string): boolean {
  return /^aivp_[a-f0-9]{64}$/.test(key);
}

/**
 * Hash API key for storage
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create API key
 */
export function createApiKey(userId: string, name: string, permissions: string[]): APIKey {
  return {
    id: crypto.randomUUID(),
    key: generateApiKey(),
    name,
    userId,
    permissions,
    rateLimit: 1000, // requests per hour
    createdAt: new Date(),
    isActive: true,
  };
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 3600000, maxRequests: number = 1000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): { allowed: boolean; limit: number; remaining: number; reset: Date } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];

    // Filter out old requests outside the window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    const allowed = timestamps.length < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - timestamps.length);
    const reset = new Date(now + this.windowMs);

    if (allowed) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
    }

    return {
      allowed,
      limit: this.maxRequests,
      remaining,
      reset,
    };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Authenticate API request
 */
export function authenticateRequest(
  authorization: string | null,
  validKeys: Map<string, APIKey>
): { authenticated: boolean; apiKey?: APIKey; error?: string } {
  if (!authorization) {
    return { authenticated: false, error: "Missing authorization header" };
  }

  const [scheme, key] = authorization.split(" ");

  if (scheme !== "Bearer") {
    return { authenticated: false, error: "Invalid authorization scheme" };
  }

  if (!key || !validateApiKey(key)) {
    return { authenticated: false, error: "Invalid API key format" };
  }

  const apiKey = Array.from(validKeys.values()).find((k) => k.key === key);

  if (!apiKey) {
    return { authenticated: false, error: "Invalid API key" };
  }

  if (!apiKey.isActive) {
    return { authenticated: false, error: "API key is inactive" };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { authenticated: false, error: "API key has expired" };
  }

  return { authenticated: true, apiKey };
}

/**
 * Log API usage
 */
export function logUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime?: number
): APIUsage {
  return {
    id: crypto.randomUUID(),
    apiKeyId,
    endpoint,
    method,
    statusCode,
    timestamp: new Date(),
    responseTime,
  };
}

/**
 * Get API usage statistics
 */
export function getUsageStats(
  usage: APIUsage[],
  apiKeyId: string,
  hours: number = 24
): {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  endpoints: Record<string, number>;
} {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const filtered = usage.filter(
    (u) => u.apiKeyId === apiKeyId && u.timestamp >= cutoff
  );

  const totalRequests = filtered.length;
  const successfulRequests = filtered.filter((u) => u.statusCode < 400).length;
  const failedRequests = filtered.filter((u) => u.statusCode >= 400).length;

  const responseTimes = filtered
    .map((u) => u.responseTime)
    .filter((rt): rt is number => rt !== undefined);
  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;

  const endpoints = filtered.reduce((acc, u) => {
    acc[u.endpoint] = (acc[u.endpoint] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime,
    endpoints,
  };
}
