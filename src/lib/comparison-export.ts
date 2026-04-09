/** Export utilities for model comparison data */

import type { Model, BenchmarkResult } from "@/types";

interface ComparisonData {
  models: Model[];
  results: BenchmarkResult[];
}

/**
 * Export comparison data to CSV format
 */
export function exportToCSV(data: ComparisonData): void {
  const { models, results } = data;
  const benchmarks = Array.from(new Set(results.map((r) => r.benchmark?.name).filter((name): name is string => Boolean(name))));

  // Create CSV header
  const header = ["Metric", ...models.map((m) => m.name)];

  // Create rows
  const rows: string[][] = [];

  // Add metadata rows
  rows.push(["Parameters (B)", ...models.map((m) => m.parameters ? `${m.parameters}B` : "N/A")]);
  rows.push(["Release Date", ...models.map((m) => m.release_date ? new Date(m.release_date).toLocaleDateString() : "N/A")]);
  rows.push(["Organization", ...models.map((m) => m.organization?.name || "N/A")]);
  rows.push(["Category", ...models.map((m) => m.category?.name || "N/A")]);

  // Add benchmark score rows
  benchmarks.forEach((benchmark) => {
    const scores = models.map((model) => {
      const result = results.find(
        (r) => r.model_id === model.id && r.benchmark?.name === benchmark
      );
      return result?.score ?? "N/A";
    });
    rows.push([benchmark, ...scores.map((s) => String(s))]);
  });

  // Convert to CSV string
  const csvContent = [header, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  // Download file
  downloadFile(csvContent, "comparison.csv", "text/csv");
}

/**
 * Export comparison data to JSON format
 */
export function exportToJSON(data: ComparisonData): void {
  const { models, results } = data;
  const benchmarks = Array.from(new Set(results.map((r) => r.benchmark?.name).filter((name): name is string => Boolean(name))));

  // Create comparison object
  const comparison: any = {
    models: models.map((model) => ({
      id: model.id,
      name: model.name,
      parameters: model.parameters,
      release_date: model.release_date,
      organization: model.organization?.name,
      category: model.category?.name,
    })),
    benchmarks: benchmarks.map((benchmark) => {
      const benchmarkResults: any = {
        name: benchmark,
      };
      models.forEach((model) => {
        const result = results.find(
          (r) => r.model_id === model.id && r.benchmark?.name === benchmark
        );
        benchmarkResults[model.name] = result?.score ?? null;
      });
      return benchmarkResults;
    }),
  };

  // Download file
  downloadFile(JSON.stringify(comparison, null, 2), "comparison.json", "application/json");
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
