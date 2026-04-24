"use client";

import { useCallback } from "react";
import { useRealtimeSubscriptionAdvanced } from "./useRealtimeSubscriptionAdvanced";
import type { Benchmark } from "@/types";

interface UseBenchmarksRealtimeOptions {
  onBenchmarkChange?: (benchmarks: Benchmark[]) => void;
  enabled?: boolean;
  batchDelay?: number;
  enableReconnection?: boolean;
  enableHealthCheck?: boolean;
}

export function useBenchmarksRealtime({
  onBenchmarkChange,
  enabled = true,
  batchDelay = 100,
  enableReconnection = true,
  enableHealthCheck = true,
}: UseBenchmarksRealtimeOptions) {
  const { isConnected, error, reconnect, analytics } = useRealtimeSubscriptionAdvanced({
    table: "benchmarks",
    event: "*",
    enabled,
    batchDelay,
    enableReconnection,
    enableHealthCheck,
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
    analytics,
  };
}
