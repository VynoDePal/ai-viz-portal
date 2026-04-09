"use client";

import { useState } from "react";
import type { Model, BenchmarkResult } from "@/types";

interface ComparisonTableProps {
  models: Model[];
  results: BenchmarkResult[];
  onExport: (format: "csv" | "json") => void;
}

export function ComparisonTable({ models, results, onExport }: ComparisonTableProps) {
  const [sortBy, setSortBy] = useState<"score" | "parameters" | "date">("score");

  // Get unique benchmarks
  const benchmarks = Array.from(
    new Set(results.map((r) => r.benchmark?.name).filter((name): name is string => Boolean(name)))
  );

  // Find best score for each benchmark
  const bestScores = new Map<string, number>();
  benchmarks.forEach((benchmark) => {
    const benchmarkResults = results.filter((r) => r.benchmark?.name === benchmark);
    const scores = benchmarkResults.map((r) => r.score).filter((s): s is number => s !== undefined);
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    bestScores.set(benchmark, maxScore);
  });

  // Get results for each model
  const getModelResults = (modelId: string) => {
    return results.filter((r) => r.model_id === modelId);
  };

  const getModelScore = (modelId: string, benchmark: string) => {
    const result = results.find(
      (r) => r.model_id === modelId && r.benchmark?.name === benchmark
    );
    return result?.score ?? null;
  };

  const isBestScore = (modelId: string, benchmark: string) => {
    const score = getModelScore(modelId, benchmark);
    const best = bestScores.get(benchmark);
    return score !== null && score !== undefined && score === best;
  };

  const handleSort = (field: "score" | "parameters" | "date") => {
    setSortBy(field);
  };

  if (models.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Select models to compare
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Model Comparison
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onExport("csv")}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Export CSV
          </button>
          <button
            onClick={() => onExport("json")}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Metric
              </th>
              {models.map((model) => (
                <th
                  key={model.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {model.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {/* Parameters row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                Parameters (B)
              </td>
              {models.map((model) => (
                <td
                  key={model.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {model.parameters ? `${model.parameters}B` : "N/A"}
                </td>
              ))}
            </tr>

            {/* Release date row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                Release Date
              </td>
              {models.map((model) => (
                <td
                  key={model.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {model.release_date
                    ? new Date(model.release_date).toLocaleDateString()
                    : "N/A"}
                </td>
              ))}
            </tr>

            {/* Organization row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                Organization
              </td>
              {models.map((model) => (
                <td
                  key={model.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {model.organization?.name || "N/A"}
                </td>
              ))}
            </tr>

            {/* Category row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                Category
              </td>
              {models.map((model) => (
                <td
                  key={model.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {model.category?.name || "N/A"}
                </td>
              ))}
            </tr>

            {/* Benchmark scores rows */}
            {benchmarks.map((benchmark) => (
              <tr key={benchmark}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {benchmark}
                </td>
                {models.map((model) => {
                  const score = getModelScore(model.id, benchmark);
                  const isBest = isBestScore(model.id, benchmark);
                  return (
                    <td
                      key={model.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isBest
                          ? "font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {score !== null ? score.toFixed(2) : "N/A"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
