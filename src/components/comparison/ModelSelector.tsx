"use client";

import { useState } from "react";
import type { Model } from "@/types";

interface ModelSelectorProps {
  models: Model[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelection?: number;
}

export function ModelSelector({
  models,
  selectedIds,
  onSelectionChange,
  maxSelection = 5,
}: ModelSelectorProps) {
  const toggleModel = (modelId: string) => {
    if (selectedIds.includes(modelId)) {
      onSelectionChange(selectedIds.filter((id) => id !== modelId));
    } else {
      if (selectedIds.length >= maxSelection) {
        return; // Don't add if already at max
      }
      onSelectionChange([...selectedIds, modelId]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const selectedCount = selectedIds.length;
  const canAddMore = selectedCount < maxSelection;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Select Models to Compare
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCount}/{maxSelection} selected
          </span>
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {!canAddMore && (
        <p className="text-sm text-amber-600 mb-4">
          Maximum {maxSelection} models can be compared at once
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = selectedIds.includes(model.id);
          return (
            <label
              key={model.id}
              className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${!canAddMore && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleModel(model.id)}
                disabled={!canAddMore && !isSelected}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                {model.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
