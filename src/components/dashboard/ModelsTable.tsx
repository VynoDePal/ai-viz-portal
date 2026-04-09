"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Filter } from "@/components/ui/Filter";
import type { Model, Organization, Category } from "@/types";

interface ModelsTableProps {
  models: Model[];
  organizations: Organization[];
  categories: Category[];
}

export function ModelsTable({ models, organizations, categories }: ModelsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Model>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Filter models
  const filteredModels = models.filter((model) => {
    if (selectedOrganization && model.organization_id !== selectedOrganization) return false;
    if (selectedCategory && model.category_id !== selectedCategory) return false;
    return true;
  });

  // Sort models
  const sortedModels = [...filteredModels].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

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

  const handleSort = (column: keyof Model) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "name" as keyof Model,
      header: "Model Name",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "organization" as keyof Model,
      header: "Organization",
      render: (value: Organization) => value?.name || "-",
    },
    {
      key: "category" as keyof Model,
      header: "Category",
      render: (value: Category) => value?.name || "-",
    },
    {
      key: "parameters" as keyof Model,
      header: "Parameters",
      render: (value: number) =>
        value ? `${(value / 1e9).toFixed(1)}B` : "-",
    },
    {
      key: "release_date" as keyof Model,
      header: "Release Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "github_stars" as keyof Model,
      header: "GitHub Stars",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      key: "hf_downloads" as keyof Model,
      header: "HF Downloads",
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
    <div className="space-y-4">
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
      </div>

      <Table
        data={paginatedModels}
        columns={columns}
        emptyMessage="No models found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
