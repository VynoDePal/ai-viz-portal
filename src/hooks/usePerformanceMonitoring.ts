"use client";

import { useEffect, useRef } from "react";
import { recordMetric, type PerformanceMetric } from "@/lib/monitoringUtils";

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  onMetric?: (metric: PerformanceMetric) => void;
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const { enabled = true, onMetric } = options;
  const metricsRef = useRef<PerformanceMetric[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Monitor page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
          const firstContentfulPaint = navEntry.responseStart - navEntry.fetchStart;

          const metric = recordMetric("page_load", loadTime, "ms");
          metricsRef.current.push(metric);
          onMetric?.(metric);

          const metric2 = recordMetric("dom_content_loaded", domContentLoaded, "ms");
          metricsRef.current.push(metric2);
          onMetric?.(metric2);

          const metric3 = recordMetric("first_contentful_paint", firstContentfulPaint, "ms");
          metricsRef.current.push(metric3);
          onMetric?.(metric3);
        } else if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          const metric = recordMetric(`resource_${resourceEntry.name}`, loadTime, "ms");
          metricsRef.current.push(metric);
          onMetric?.(metric);
        }
      }
    });

    observer.observe({ entryTypes: ["navigation", "resource"] });

    return () => {
      observer.disconnect();
    };
  }, [enabled, onMetric]);

  const recordCustomMetric = (name: string, value: number, unit?: string) => {
    if (!enabled) return;
    const metric = recordMetric(name, value, unit);
    metricsRef.current.push(metric);
    onMetric?.(metric);
  };

  const getMetrics = () => metricsRef.current;
  const clearMetrics = () => {
    metricsRef.current = [];
  };

  return {
    recordCustomMetric,
    getMetrics,
    clearMetrics,
  };
}
