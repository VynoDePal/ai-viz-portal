"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import type { BenchmarkResult } from "@/types";

interface ResultsTableProps {
  results: BenchmarkResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof BenchmarkResult>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const itemsPerPage = 10;

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof BenchmarkResult) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "model" as keyof BenchmarkResult,
      header: "Model",
      render: (value: { name: string }) => value?.name || "-",
    },
    {
      key: "benchmark" as keyof BenchmarkResult,
      header: "Benchmark",
      render: (value: { name: string }) => value?.name || "-",
    },
    {
      key: "score" as keyof BenchmarkResult,
      header: "Score",
      render: (value: number) => value?.toFixed(2) || "-",
    },
    {
      key: "date_recorded" as keyof BenchmarkResult,
      header: "Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "source" as keyof BenchmarkResult,
      header: "Source",
      render: (value: string) => value || "-",
    },
    {
      key: "api_cost_per_1k_tokens" as keyof BenchmarkResult,
      header: "Cost/1K Tokens ($)",
      render: (value: number) => value?.toFixed(4) || "-",
    },
    {
      key: "latency_ms" as keyof BenchmarkResult,
      header: "Latency (ms)",
      render: (value: number) => value?.toLocaleString() || "-",
    },
    {
      key: "throughput_rps" as keyof BenchmarkResult,
      header: "Throughput (RPS)",
      render: (value: number) => value?.toFixed(2) || "-",
    },
    {
      key: "cost_efficiency_score" as keyof BenchmarkResult,
      header: "Cost Efficiency",
      render: (value: number) => value?.toFixed(4) || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        data={paginatedResults}
        columns={columns}
        emptyMessage="No results found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
