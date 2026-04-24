"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: (index: number) => number;
  emptyMessage?: string;
  height?: string;
  overscan?: number;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  estimateSize = () => 80,
  emptyMessage = "No items available",
  height = "600px",
  overscan = 5,
}: VirtualizedListProps<T>) {
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
    estimateSize,
    overscan,
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
