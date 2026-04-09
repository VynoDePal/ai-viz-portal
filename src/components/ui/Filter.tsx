"use client";

import { X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterProps {
  label: string;
  options: FilterOption[];
  selectedValue: string | null;
  onFilterChange: (value: string | null) => void;
}

export function Filter({ label, options, selectedValue, onFilterChange }: FilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      <div className="relative">
        <select
          value={selectedValue || ""}
          onChange={(e) => onFilterChange(e.target.value || null)}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {selectedValue && (
        <button
          onClick={() => onFilterChange(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
