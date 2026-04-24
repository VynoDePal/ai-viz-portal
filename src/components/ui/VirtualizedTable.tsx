"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
  }[];
  rowHeight?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  height?: string;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 56,
  onRowClick,
  emptyMessage = "No data available",
  height = "600px",
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={columns.length} style={{ height: virtualizer.getTotalSize() }} className="p-0">
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = data[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        className={`flex items-center px-6 py-4 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer ${
                          virtualRow.index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((column) => (
                          <div
                            key={String(column.key)}
                            className="flex-1"
                            style={{ width: column.width }}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : String(row[column.key])}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
