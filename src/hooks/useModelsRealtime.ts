"use client";

import { useCallback } from "react";
import { useRealtimeSubscriptionAdvanced } from "./useRealtimeSubscriptionAdvanced";
import type { Model } from "@/types";

interface UseModelsRealtimeOptions {
  onModelChange?: (models: Model[]) => void;
  enabled?: boolean;
  batchDelay?: number;
  enableReconnection?: boolean;
  enableHealthCheck?: boolean;
}

export function useModelsRealtime({
  onModelChange,
  enabled = true,
  batchDelay = 100,
  enableReconnection = true,
  enableHealthCheck = true,
}: UseModelsRealtimeOptions) {
  const { isConnected, error, reconnect, analytics } = useRealtimeSubscriptionAdvanced({
    table: "models",
    event: "*",
    enabled,
    batchDelay,
    enableReconnection,
    enableHealthCheck,
    onInsert: (payload) => {
      console.log("New model inserted:", payload);
      onModelChange?.([]);
    },
    onUpdate: (payload) => {
      console.log("Model updated:", payload);
      onModelChange?.([]);
    },
    onDelete: (payload) => {
      console.log("Model deleted:", payload);
      onModelChange?.([]);
    },
  });

  return {
    isConnected,
    error,
    reconnect,
    analytics,
  };
}
