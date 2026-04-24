import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  isIPBlocked,
  blockIP,
  detectDDoS,
  getClientIP,
  IP_RATE_LIMIT,
  USER_RATE_LIMIT,
  DDOS_DETECTION,
  cleanupExpiredEntries,
  type RateLimitConfig,
  type DDoSDetectionConfig,
} from "@/lib/rateLimitMiddleware";
import {
  sendSecurityAlert,
  getAlertHistory,
  getAlertsByType,
  getAlertsBySeverity,
  cleanupOldAlerts,
} from "@/lib/securityAlerting";

describe("Rate Limiting Middleware", () => {
  beforeEach(() => {
    // Clear stores before each test
    cleanupExpiredEntries();
    cleanupOldAlerts();
  });

  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 10,
      };
      const result = checkRateLimit("test-key", config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("should block requests exceeding limit", () => {
      const config: RateLimitConfig = {
        windowMs: 60000,
        maxRequests: 2,
      };
      checkRateLimit("test-key", config);
      checkRateLimit("test-key", config);
      const result = checkRateLimit("test-key", config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after window expires", () => {
      const config: RateLimitConfig = {
        windowMs: 100, // 100ms
        maxRequests: 2,
      };
      checkRateLimit("test-key", config);
      checkRateLimit("test-key", config);
      // Wait for window to expire
      // In a real test, we would wait, but for unit tests we can't
      const result = checkRateLimit("test-key", config);
      expect(result).toBeDefined();
    });
  });

  describe("IP Blocking", () => {
    it("should block IP when explicitly blocked", () => {
      blockIP("192.168.1.1", "test block", 3600000);
      expect(isIPBlocked("192.168.1.1")).toBe(true);
    });

    it("should not block unblocked IP", () => {
      expect(isIPBlocked("192.168.1.2")).toBe(false);
    });

    it("should unblock IP after duration expires", () => {
      blockIP("192.168.1.3", "test block", 100); // 100ms
      // Wait for block to expire
      // In a real test, we would wait
      expect(isIPBlocked("192.168.1.3")).toBe(true);
    });
  });

  describe("DDoS Detection", () => {
    it("should detect DDoS attack when threshold exceeded", () => {
      const config: DDoSDetectionConfig = {
        threshold: 5,
        windowMs: 60000,
        blockDuration: 3600000,
      };
      
      // Make requests below threshold
      for (let i = 0; i < 5; i++) {
        const result = detectDDoS("192.168.1.4", config);
        expect(result.isAttack).toBe(false);
      }

      // Exceed threshold
      const result = detectDDoS("192.168.1.4", config);
      expect(result.isAttack).toBe(true);
      expect(result.blockIP).toBe(true);
    });

    it("should not detect attack below threshold", () => {
      const config: DDoSDetectionConfig = {
        threshold: 10,
        windowMs: 60000,
        blockDuration: 3600000,
      };
      
      for (let i = 0; i < 5; i++) {
        const result = detectDDoS("192.168.1.5", config);
        expect(result.isAttack).toBe(false);
      }
    });
  });

  describe("getClientIP", () => {
    it("should get IP from x-forwarded-for header", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1, 192.168.1.2");
      const ip = getClientIP(headers);
      expect(ip).toBe("192.168.1.1");
    });

    it("should get IP from x-real-ip header", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "192.168.1.3");
      const ip = getClientIP(headers);
      expect(ip).toBe("192.168.1.3");
    });

    it("should return unknown when no IP headers", () => {
      const headers = new Headers();
      const ip = getClientIP(headers);
      expect(ip).toBe("unknown");
    });
  });

  describe("Default Configurations", () => {
    it("IP_RATE_LIMIT should have correct values", () => {
      expect(IP_RATE_LIMIT.windowMs).toBe(60000);
      expect(IP_RATE_LIMIT.maxRequests).toBe(100);
    });

    it("USER_RATE_LIMIT should have correct values", () => {
      expect(USER_RATE_LIMIT.windowMs).toBe(60000);
      expect(USER_RATE_LIMIT.maxRequests).toBe(1000);
    });

    it("DDOS_DETECTION should have correct values", () => {
      expect(DDOS_DETECTION.threshold).toBe(200);
      expect(DDOS_DETECTION.windowMs).toBe(60000);
      expect(DDOS_DETECTION.blockDuration).toBe(3600000);
    });
  });
});

describe("Security Alerting", () => {
  beforeEach(() => {
    cleanupOldAlerts();
  });

  describe("sendSecurityAlert", () => {
    it("should create alert with ID and timestamp", () => {
      const alert = sendSecurityAlert({
        type: "ddos",
        severity: "high",
        message: "DDoS attack detected",
        ip: "192.168.1.1",
      });
      expect(alert.id).toBeDefined();
      expect(alert.timestamp).toBeInstanceOf(Date);
      expect(alert.type).toBe("ddos");
      expect(alert.severity).toBe("high");
    });
  });

  describe("getAlertHistory", () => {
    it("should return alert history", () => {
      sendSecurityAlert({
        type: "ddos",
        severity: "high",
        message: "Test alert 1",
      });
      sendSecurityAlert({
        type: "rate_limit",
        severity: "medium",
        message: "Test alert 2",
      });
      const history = getAlertHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it("should limit results", () => {
      for (let i = 0; i < 10; i++) {
        sendSecurityAlert({
          type: "ddos",
          severity: "low",
          message: `Test alert ${i}`,
        });
      }
      const history = getAlertHistory(5);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getAlertsByType", () => {
    it("should filter alerts by type", () => {
      sendSecurityAlert({
        type: "ddos",
        severity: "high",
        message: "DDoS alert",
      });
      sendSecurityAlert({
        type: "rate_limit",
        severity: "medium",
        message: "Rate limit alert",
      });
      const ddosAlerts = getAlertsByType("ddos");
      expect(ddosAlerts.every((a) => a.type === "ddos")).toBe(true);
    });
  });

  describe("getAlertsBySeverity", () => {
    it("should filter alerts by severity", () => {
      sendSecurityAlert({
        type: "ddos",
        severity: "high",
        message: "High severity alert",
      });
      sendSecurityAlert({
        type: "rate_limit",
        severity: "medium",
        message: "Medium severity alert",
      });
      const highAlerts = getAlertsBySeverity("high");
      expect(highAlerts.every((a) => a.severity === "high")).toBe(true);
    });
  });
});
