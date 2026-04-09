"use client";

import { useCallback } from "react";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Model } from "@/types";

interface UseModelsRealtimeOptions {
  onModelChange?: (models: Model[]) => void;
  enabled?: boolean;
}

export function useModelsRealtime({
  onModelChange,
  enabled = true,
}: UseModelsRealtimeOptions) {
  const { isConnected, error, reconnect } = useRealtimeSubscription({
    table: "models",
    event: "*",
    enabled,
    onInsert: (payload) => {
      console.log("New model inserted:", payload);
      // Trigger refresh or update state
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
  };
}
