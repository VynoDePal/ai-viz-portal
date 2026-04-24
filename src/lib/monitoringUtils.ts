/**
 * Monitoring utilities for application health and performance tracking
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  unit?: string;
}

export interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    name: string;
    status: "pass" | "fail";
    responseTime?: number;
    message?: string;
  }[];
  timestamp: Date;
}

/**
 * Record performance metric
 */
export function recordMetric(name: string, value: number, unit?: string): PerformanceMetric {
  return {
    name,
    value,
    timestamp: new Date(),
    unit,
  };
}

/**
 * Record error metric
 */
export function recordError(
  message: string,
  severity: ErrorMetric["severity"] = "medium",
  context?: Record<string, any>
): ErrorMetric {
  return {
    message,
    timestamp: new Date(),
    severity,
    context,
  };
}

/**
 * Calculate average of metrics
 */
export function calculateAverageMetrics(metrics: PerformanceMetric[]): number {
  if (metrics.length === 0) return 0;
  return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
}

/**
 * Filter metrics by time range
 */
export function filterMetricsByTime(
  metrics: PerformanceMetric[],
  hours: number
): PerformanceMetric[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return metrics.filter((m) => m.timestamp >= cutoff);
}

/**
 * Calculate error rate
 */
export function calculateErrorRate(errors: ErrorMetric[], totalRequests: number): number {
  if (totalRequests === 0) return 0;
  return (errors.length / totalRequests) * 100;
}

/**
 * Get error severity distribution
 */
export function getErrorSeverityDistribution(errors: ErrorMetric[]): Record<ErrorMetric["severity"], number> {
  return errors.reduce((acc, error) => {
    acc[error.severity] = (acc[error.severity] || 0) + 1;
    return acc;
  }, {} as Record<ErrorMetric["severity"], number>);
}

/**
 * Perform health check
 */
export async function performHealthCheck(checks: Array<{
  name: string;
  check: () => Promise<{ status: "pass" | "fail"; responseTime?: number; message?: string }>;
}>): Promise<HealthCheck> {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        const result = await check.check();
        return {
          name: check.name,
          ...result,
        };
      } catch (error) {
        return {
          name: check.name,
          status: "fail" as const,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  const failedChecks = results.filter((r) => r.status === "fail");
  let status: HealthCheck["status"] = "healthy";

  if (failedChecks.length === results.length) {
    status = "unhealthy";
  } else if (failedChecks.length > 0) {
    status = "degraded";
  }

  return {
    status,
    checks: results,
    timestamp: new Date(),
  };
}
