import { describe, it, expect } from "vitest";
import {
  recordMetric,
  recordError,
  calculateAverageMetrics,
  filterMetricsByTime,
  calculateErrorRate,
  getErrorSeverityDistribution,
  performHealthCheck,
  type PerformanceMetric,
  type ErrorMetric,
} from "@/lib/monitoringUtils";

describe("Monitoring Utilities", () => {
  describe("recordMetric", () => {
    it("should record a metric", () => {
      const metric = recordMetric("test", 100, "ms");
      expect(metric.name).toBe("test");
      expect(metric.value).toBe(100);
      expect(metric.unit).toBe("ms");
      expect(metric.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("recordError", () => {
    it("should record an error", () => {
      const error = recordError("Test error", "medium");
      expect(error.message).toBe("Test error");
      expect(error.severity).toBe("medium");
      expect(error.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("calculateAverageMetrics", () => {
    it("should calculate average of metrics", () => {
      const metrics: PerformanceMetric[] = [
        { name: "test", value: 10, timestamp: new Date() },
        { name: "test", value: 20, timestamp: new Date() },
        { name: "test", value: 30, timestamp: new Date() },
      ];
      const average = calculateAverageMetrics(metrics);
      expect(average).toBe(20);
    });

    it("should handle empty metrics", () => {
      const average = calculateAverageMetrics([]);
      expect(average).toBe(0);
    });
  });

  describe("filterMetricsByTime", () => {
    it("should filter metrics by time range", () => {
      const now = new Date();
      const metrics: PerformanceMetric[] = [
        { name: "test", value: 10, timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        { name: "test", value: 20, timestamp: new Date(now.getTime() - 30 * 60 * 1000) },
        { name: "test", value: 30, timestamp: new Date() },
      ];
      const filtered = filterMetricsByTime(metrics, 1);
      expect(filtered).toHaveLength(2);
    });
  });

  describe("calculateErrorRate", () => {
    it("should calculate error rate", () => {
      const errors: ErrorMetric[] = [
        { message: "Error 1", timestamp: new Date(), severity: "medium" },
        { message: "Error 2", timestamp: new Date(), severity: "medium" },
      ];
      const errorRate = calculateErrorRate(errors, 100);
      expect(errorRate).toBe(2);
    });

    it("should handle zero total requests", () => {
      const errorRate = calculateErrorRate([], 0);
      expect(errorRate).toBe(0);
    });
  });

  describe("getErrorSeverityDistribution", () => {
    it("should get error severity distribution", () => {
      const errors: ErrorMetric[] = [
        { message: "Error 1", timestamp: new Date(), severity: "low" },
        { message: "Error 2", timestamp: new Date(), severity: "medium" },
        { message: "Error 3", timestamp: new Date(), severity: "medium" },
        { message: "Error 4", timestamp: new Date(), severity: "high" },
      ];
      const distribution = getErrorSeverityDistribution(errors);
      expect(distribution.low).toBe(1);
      expect(distribution.medium).toBe(2);
      expect(distribution.high).toBe(1);
    });
  });

  describe("performHealthCheck", () => {
    it("should perform health check with passing checks", async () => {
      const healthCheck = await performHealthCheck([
        {
          name: "Test",
          check: async () => ({ status: "pass" as const }),
        },
      ]);
      expect(healthCheck.status).toBe("healthy");
      expect(healthCheck.checks).toHaveLength(1);
    });

    it("should perform health check with failing checks", async () => {
      const healthCheck = await performHealthCheck([
        {
          name: "Test",
          check: async () => ({ status: "fail" as const }),
        },
      ]);
      expect(healthCheck.status).toBe("unhealthy");
    });

    it("should handle errors in health checks", async () => {
      const healthCheck = await performHealthCheck([
        {
          name: "Test",
          check: async () => {
            throw new Error("Test error");
          },
        },
      ]);
      expect(healthCheck.status).toBe("unhealthy");
      expect(healthCheck.checks[0].status).toBe("fail");
    });
  });
});

describe("Monitoring Components", () => {
  it("MonitoringDashboard component should exist", () => {
    const MonitoringDashboard = require("@/components/monitoring/MonitoringDashboard");
    expect(MonitoringDashboard).toBeTruthy();
  });

  it("usePerformanceMonitoring hook should exist", () => {
    const usePerformanceMonitoring = require("@/hooks/usePerformanceMonitoring");
    expect(usePerformanceMonitoring).toBeTruthy();
  });
});
