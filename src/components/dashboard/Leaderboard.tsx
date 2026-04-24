"use client";

import { useState, useEffect } from "react";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Filter } from "@/components/ui/Filter";
import type { Model, Organization, Category } from "@/types";

type LeaderboardCategory = "overall" | "intelligence" | "speed" | "value";
type SortField = keyof LeaderboardRow;

interface LeaderboardRow extends Model {
  rank: number;
}

interface LeaderboardProps {
  models: Model[];
  organizations: Organization[];
  categories: Category[];
}

export function Leaderboard({ models, organizations, categories }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>("overall");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Model>("overall_score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minParameters, setMinParameters] = useState<number | null>(null);
  const [maxParameters, setMaxParameters] = useState<number | null>(null);

  const itemsPerPage = 20;

  // Get score field based on active tab
  const getScoreField = (tab: LeaderboardCategory): keyof Model => {
    switch (tab) {
      case "overall":
        return "overall_score";
      case "intelligence":
        return "intelligence_score";
      case "speed":
        return "speed_score";
      case "value":
        return "value_score";
    }
  };

  // Filter models
  const filteredModels = models.filter((model) => {
    if (selectedOrganization && model.organization_id !== selectedOrganization)
      return false;
    if (selectedCategory && model.category_id !== selectedCategory) return false;
    if (minParameters !== null && (model.parameters || 0) < minParameters)
      return false;
    if (maxParameters !== null && (model.parameters || 0) > maxParameters)
      return false;
    return true;
  });

  // Sort models
  const sortedModels = [...filteredModels].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedModels.length / itemsPerPage);
  const paginatedModels = sortedModels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add rank to each model for display
  const leaderboardRows: LeaderboardRow[] = paginatedModels.map((model, index) => ({
    ...model,
    rank: (currentPage - 1) * itemsPerPage + index + 1,
  }));

  // Handle tab change
  const handleTabChange = (tab: LeaderboardCategory) => {
    setActiveTab(tab);
    setSortField(getScoreField(tab));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field: keyof Model) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number): string => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  // Get score field label
  const getScoreLabel = (tab: LeaderboardCategory): string => {
    switch (tab) {
      case "overall":
        return "Overall";
      case "intelligence":
        return "Intelligence";
      case "speed":
        return "Speed";
      case "value":
        return "Value";
    }
  };

  const columns: {
    key: keyof LeaderboardRow;
    header: string;
    render: (value: any, row: LeaderboardRow) => React.ReactNode;
  }[] = [
    {
      key: "rank",
      header: "Rank",
      render: (value: number) => (
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "name",
      header: "Model",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "organization",
      header: "Organization",
      render: (value: Organization) => value?.name || "-",
    },
    {
      key: "category",
      header: "Category",
      render: (value: Category) => value?.name || "-",
    },
    {
      key: "parameters",
      header: "Parameters",
      render: (value: number) =>
        value ? `${(value / 1e9).toFixed(1)}B` : "-",
    },
    {
      key: getScoreField(activeTab),
      header: getScoreLabel(activeTab),
      render: (value: number) => value?.toFixed(1) || "-",
    },
    {
      key: "github_stars",
      header: "Stars",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      key: "hf_downloads",
      header: "Downloads",
      render: (value: number) => value?.toLocaleString() || "-",
    },
  ];

  const organizationOptions = organizations.map((org) => ({
    value: org.id,
    label: org.name,
  }));

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        {(["overall", "intelligence", "speed", "value"] as LeaderboardCategory[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Filter
          label="Organization"
          options={organizationOptions}
          selectedValue={selectedOrganization}
          onFilterChange={setSelectedOrganization}
        />
        <Filter
          label="Category"
          options={categoryOptions}
          selectedValue={selectedCategory}
          onFilterChange={setSelectedCategory}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Min Parameters (B):</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={minParameters || ""}
            onChange={(e) =>
              setMinParameters(
                e.target.value ? parseFloat(e.target.value) * 1e9 : null
              )
            }
            className="border rounded px-2 py-1 text-sm w-24"
            placeholder="Any"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Max Parameters (B):</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={maxParameters ? maxParameters / 1e9 : ""}
            onChange={(e) =>
              setMaxParameters(
                e.target.value ? parseFloat(e.target.value) * 1e9 : null
              )
            }
            className="border rounded px-2 py-1 text-sm w-24"
            placeholder="Any"
          />
        </div>
      </div>

      {/* Table */}
      <Table<LeaderboardRow>
        data={leaderboardRows}
        columns={columns}
        emptyMessage="No models found"
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
