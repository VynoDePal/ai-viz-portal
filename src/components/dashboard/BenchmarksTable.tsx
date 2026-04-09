"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import type { Benchmark } from "@/types";

interface BenchmarksTableProps {
  benchmarks: Benchmark[];
}

export function BenchmarksTable({ benchmarks }: BenchmarksTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Benchmark>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const itemsPerPage = 10;

  // Sort benchmarks
  const sortedBenchmarks = [...benchmarks].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedBenchmarks.length / itemsPerPage);
  const paginatedBenchmarks = sortedBenchmarks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof Benchmark) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "name" as keyof Benchmark,
      header: "Benchmark Name",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "description" as keyof Benchmark,
      header: "Description",
      render: (value: string) => value || "-",
    },
    {
      key: "type" as keyof Benchmark,
      header: "Type",
      render: (value: string) => value || "-",
    },
    {
      key: "unit" as keyof Benchmark,
      header: "Unit",
      render: (value: string) => value || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        data={paginatedBenchmarks}
        columns={columns}
        emptyMessage="No benchmarks found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
