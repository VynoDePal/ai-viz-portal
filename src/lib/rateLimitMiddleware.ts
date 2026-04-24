/**
 * Rate limiting middleware for DDoS protection
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export interface DDoSDetectionConfig {
  threshold: number;
  windowMs: number;
  blockDuration: number;
}

// In-memory rate limit store (for development)
// In production, use Redis with Upstash
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const blockedIPs = new Map<string, { blockedUntil: number; reason: string }>();

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  const blocked = blockedIPs.get(ip);
  if (!blocked) return false;

  if (Date.now() > blocked.blockedUntil) {
    blockedIPs.delete(ip);
    return false;
  }

  return true;
}

/**
 * Block an IP address
 */
export function blockIP(ip: string, reason: string, duration: number): void {
  blockedIPs.set(ip, {
    blockedUntil: Date.now() + duration,
    reason,
  });
}

/**
 * Get rate limit status for a key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < windowStart) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = remaining > 0;

  if (success) {
    entry.count++;
  }

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: new Date(entry.resetTime),
  };
}

/**
 * Detect potential DDoS attack
 */
export function detectDDoS(
  ip: string,
  config: DDoSDetectionConfig
): { isAttack: boolean; blockIP?: boolean } {
  const key = `ddos:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < windowStart) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  const isAttack = entry.count > config.threshold;

  if (isAttack) {
    blockIP(ip, "DDoS attack detected", config.blockDuration);
    return { isAttack: true, blockIP: true };
  }

  return { isAttack: false, blockIP: false };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Clean up expired entries
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now - windowMs) {
      rateLimitStore.delete(key);
    }
  }

  for (const [ip, blocked] of blockedIPs.entries()) {
    if (blocked.blockedUntil < now) {
      blockedIPs.delete(ip);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 60000);
}

// Default configurations
export const IP_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

export const USER_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 1000, // 1000 requests per minute
};

export const DDOS_DETECTION: DDoSDetectionConfig = {
  threshold: 200, // 200 requests per minute triggers DDoS detection
  windowMs: 60000, // 1 minute window
  blockDuration: 3600000, // 1 hour block
};
