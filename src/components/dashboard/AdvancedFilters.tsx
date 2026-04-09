"use client";

import { useState, useEffect } from "react";
import { MultiSelectFilter } from "@/components/filters/MultiSelectFilter";
import { RangeFilter } from "@/components/filters/RangeFilter";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterPresets } from "@/components/filters/FilterPresets";
import { FilterState, updateURL, loadFiltersFromURL } from "@/lib/url-filters";

interface AdvancedFiltersProps {
  organizations: string[];
  categories: string[];
  onFilterChange: (filters: FilterState) => void;
}

export function AdvancedFilters({ organizations, categories, onFilterChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = loadFiltersFromURL();
    setFilters(urlFilters);
    onFilterChange(urlFilters);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateURL(filters);
    onFilterChange(filters);
  }, [filters]);

  const handleOrganizationsChange = (selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      organizations: selected.length > 0 ? selected : undefined,
    }));
  };

  const handleCategoriesChange = (selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      categories: selected.length > 0 ? selected : undefined,
    }));
  };

  const handleParametersChange = (value: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      parameters: value,
    }));
  };

  const handleScoresChange = (value: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      scores: value,
    }));
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      search: query.length > 0 ? query : undefined,
    }));
  };

  const handleLoadPreset = (presetFilters: FilterState) => {
    setFilters(presetFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
        <div className="flex gap-2">
          <FilterPresets currentFilters={filters} onLoadPreset={handleLoadPreset} />
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          placeholder="Search models..."
          onSearch={handleSearch}
          suggestions={organizations}
        />

        <MultiSelectFilter
          label="Organizations"
          options={organizations}
          selected={filters.organizations || []}
          onChange={handleOrganizationsChange}
          placeholder="Select organizations"
        />

        <MultiSelectFilter
          label="Categories"
          options={categories}
          selected={filters.categories || []}
          onChange={handleCategoriesChange}
          placeholder="Select categories"
        />

        <RangeFilter
          label="Model Parameters (B)"
          min={0}
          max={100}
          value={filters.parameters || [0, 100]}
          onChange={handleParametersChange}
          step={1}
          unit="B"
        />

        <RangeFilter
          label="Benchmark Score"
          min={0}
          max={100}
          value={filters.scores || [0, 100]}
          onChange={handleScoresChange}
          step={0.1}
          unit="%"
        />
      </div>
    </div>
  );
}
