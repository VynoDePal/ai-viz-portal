/** Utility functions for transforming data for Recharts */

import type { BenchmarkResult, Model, Benchmark } from "@/types";

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface LineChartData {
  benchmark: string;
  [key: string]: string | number | undefined;
}

/**
 * Transform benchmark results into line chart data format.
 * Each benchmark becomes a data point, with models as series.
 */
export function transformDataForLineChart(
  results: BenchmarkResult[],
  models: Model[]
): ChartDataPoint[] {
  const benchmarkNames = [...new Set(results.map((r) => r.benchmark?.name || ""))].filter(Boolean);

  return benchmarkNames.map((benchmarkName) => {
    const dataPoint: ChartDataPoint = { name: benchmarkName };

    models.forEach((model) => {
      const result = results.find(
        (r) => r.benchmark?.name === benchmarkName && r.model?.name === model.name
      );
      dataPoint[model.name] = result?.score || 0;
    });

    return dataPoint;
  });
}

/**
 * Transform benchmark results into bar chart data format for a specific benchmark.
 * Each model becomes a bar with its score.
 */
export function transformDataForBarChart(
  results: BenchmarkResult[],
  benchmarkName: string
): ChartDataPoint[] {
  const benchmarkResults = results.filter(
    (r) => r.benchmark?.name === benchmarkName
  );

  return benchmarkResults
    .filter((r) => r.model?.name && r.score !== null && r.score !== undefined)
    .map((r) => ({
      name: r.model?.name || "",
      score: r.score || 0,
      organization: r.model?.organization?.name || "",
    }));
}

/**
 * Get unique organization colors for charts.
 */
export function getOrganizationColors(organizations: string[]): Record<string, string> {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ];

  const colorMap: Record<string, string> = {};
  organizations.forEach((org, index) => {
    colorMap[org] = colors[index % colors.length];
  });

  return colorMap;
}

/**
 * Get top N models by average score across all benchmarks.
 */
export function getTopModelsByScore(
  results: BenchmarkResult[],
  n: number = 5
): Model[] {
  const modelScores = new Map<string, { total: number; count: number; model: Model }>();

  results.forEach((r) => {
    if (r.model && r.score !== null && r.score !== undefined) {
      const existing = modelScores.get(r.model.name);
      if (existing) {
        existing.total += r.score;
        existing.count += 1;
      } else {
        modelScores.set(r.model.name, {
          total: r.score,
          count: 1,
          model: r.model,
        });
      }
    }
  });

  return Array.from(modelScores.values())
    .map((m) => ({ ...m.model, avgScore: m.total / m.count }))
    .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
    .slice(0, n);
}
