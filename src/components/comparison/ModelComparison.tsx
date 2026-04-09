"use client";

import { useState, useEffect } from "react";
import { ModelSelector } from "./ModelSelector";
import { ComparisonTable } from "./ComparisonTable";
import { exportToCSV, exportToJSON } from "@/lib/comparison-export";
import type { Model, BenchmarkResult } from "@/types";

interface ModelComparisonProps {
  models: Model[];
  results: BenchmarkResult[];
}

export function ModelComparison({ models, results }: ModelComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedModels = models.filter((m) => selectedIds.includes(m.id));
  const selectedResults = results.filter((r) => selectedIds.includes(r.model_id));

  const handleExport = (format: "csv" | "json") => {
    const data = {
      models: selectedModels,
      results: selectedResults,
    };

    if (format === "csv") {
      exportToCSV(data);
    } else {
      exportToJSON(data);
    }
  };

  return (
    <div className="space-y-6">
      <ModelSelector
        models={models}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        maxSelection={5}
      />

      {selectedIds.length >= 2 && (
        <ComparisonTable
          models={selectedModels}
          results={selectedResults}
          onExport={handleExport}
        />
      )}

      {selectedIds.length === 1 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Select at least 2 models to compare
        </p>
      )}
    </div>
  );
}
