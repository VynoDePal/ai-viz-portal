"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
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
  type HealthCheck,
} from "@/lib/monitoringUtils";

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [errors, setErrors] = useState<ErrorMetric[]>([]);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    // Simulate metrics collection
    const interval = setInterval(() => {
      const loadMetric = recordMetric("page_load", Math.random() * 1000 + 500, "ms");
      const responseMetric = recordMetric("api_response", Math.random() * 200 + 50, "ms");
      setMetrics((prev) => [...prev, loadMetric, responseMetric]);
      setTotalRequests((prev) => prev + 1);

      // Simulate occasional errors
      if (Math.random() < 0.05) {
        const error = recordError("API timeout", "medium", { endpoint: "/api/models" });
        setErrors((prev) => [...prev, error]);
      }
    }, 5000);

    // Perform health check
    performHealthCheck([
      {
        name: "Database",
        check: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { status: "pass" as const, responseTime: 100 };
        },
      },
      {
        name: "API",
        check: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return { status: "pass" as const, responseTime: 50 };
        },
      },
      {
        name: "Cache",
        check: async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          return { status: "pass" as const, responseTime: 30 };
        },
      },
    ]).then((result) => setHealthCheck(result));

    return () => clearInterval(interval);
  }, []);

  const recentMetrics = filterMetricsByTime(metrics, 1);
  const avgLoadTime = calculateAverageMetrics(
    recentMetrics.filter((m) => m.name === "page_load")
  );
  const avgResponseTime = calculateAverageMetrics(
    recentMetrics.filter((m) => m.name === "api_response")
  );
  const errorRate = calculateErrorRate(errors, totalRequests);
  const errorSeverity = getErrorSeverityDistribution(errors);

  const getStatusColor = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-400";
      case "degraded":
        return "text-yellow-600 dark:text-yellow-400";
      case "unhealthy":
        return "text-red-600 dark:text-red-400";
    }
  };

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </h2>
        {healthCheck && (
          <div className="flex items-center gap-3">
            <span className={getStatusColor(healthCheck.status)}>
              {getStatusIcon(healthCheck.status)}
            </span>
            <span className={`text-lg font-medium ${getStatusColor(healthCheck.status)}`}>
              {healthCheck.status.charAt(0).toUpperCase() + healthCheck.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last checked: {healthCheck.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}
        {healthCheck && (
          <div className="mt-4 space-y-2">
            {healthCheck.checks.map((check) => (
              <div key={check.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{check.name}</span>
                <div className="flex items-center gap-2">
                  {check.responseTime && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {check.responseTime}ms
                    </span>
                  )}
                  <span
                    className={
                      check.status === "pass"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {check.status === "pass" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Avg Page Load
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {avgLoadTime.toFixed(0)}ms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Avg API Response
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {avgResponseTime.toFixed(0)}ms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Error Rate
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {errorRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Error Severity Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Error Severity Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {errorSeverity.low || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {errorSeverity.medium || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {errorSeverity.high || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {errorSeverity.critical || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Errors
        </h2>
        {errors.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No errors recorded</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errors.slice(-10).reverse().map((error, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 ${
                    error.severity === "critical"
                      ? "text-red-600 dark:text-red-400"
                      : error.severity === "high"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {error.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {error.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
