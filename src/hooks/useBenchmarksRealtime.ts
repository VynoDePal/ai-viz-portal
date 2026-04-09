"use client";

import { useCallback } from "react";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Benchmark } from "@/types";

interface UseBenchmarksRealtimeOptions {
  onBenchmarkChange?: (benchmarks: Benchmark[]) => void;
  enabled?: boolean;
}

export function useBenchmarksRealtime({
  onBenchmarkChange,
  enabled = true,
}: UseBenchmarksRealtimeOptions) {
  const { isConnected, error, reconnect } = useRealtimeSubscription({
    table: "benchmarks",
    event: "*",
    enabled,
    onInsert: (payload) => {
      console.log("New benchmark inserted:", payload);
      onBenchmarkChange?.([]);
    },
    onUpdate: (payload) => {
      console.log("Benchmark updated:", payload);
      onBenchmarkChange?.([]);
    },
    onDelete: (payload) => {
      console.log("Benchmark deleted:", payload);
      onBenchmarkChange?.([]);
    },
  });

  return {
    isConnected,
    error,
    reconnect,
  };
}
