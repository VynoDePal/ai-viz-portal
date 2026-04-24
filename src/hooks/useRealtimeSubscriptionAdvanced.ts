"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface SubscriptionAnalytics {
  totalEvents: number;
  insertEvents: number;
  updateEvents: number;
  deleteEvents: number;
  connectionErrors: number;
  reconnectionAttempts: number;
  lastEventTime: Date | null;
}

interface UseRealtimeSubscriptionAdvancedOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
  batchDelay?: number; // Delay in ms for batching updates
  enableReconnection?: boolean; // Enable automatic reconnection
  maxReconnectionAttempts?: number; // Max reconnection attempts
  reconnectionBackoffBase?: number; // Base delay for exponential backoff in ms
  enableHealthCheck?: boolean; // Enable connection health monitoring
  healthCheckInterval?: number; // Health check interval in ms
}

export function useRealtimeSubscriptionAdvanced({
  table,
  filter,
  event = "*",
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
  batchDelay = 100, // Default 100ms batching delay
  enableReconnection = true,
  maxReconnectionAttempts = 5,
  reconnectionBackoffBase = 1000, // Default 1s base delay
  enableHealthCheck = true,
  healthCheckInterval = 30000, // Default 30s health check
}: UseRealtimeSubscriptionAdvancedOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics>({
    totalEvents: 0,
    insertEvents: 0,
    updateEvents: 0,
    deleteEvents: 0,
    connectionErrors: 0,
    reconnectionAttempts: 0,
    lastEventTime: null,
  });
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectionAttemptsRef = useRef(0);
  const pendingUpdatesRef = useRef<RealtimePostgresChangesPayload<any>[]>([]);

  const processBatchedUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length === 0) return;

    const updates = [...pendingUpdatesRef.current];
    pendingUpdatesRef.current = [];

    updates.forEach((payload) => {
      switch (payload.eventType) {
        case "INSERT":
          onInsert?.(payload);
          break;
        case "UPDATE":
          onUpdate?.(payload);
          break;
        case "DELETE":
          onDelete?.(payload);
          break;
      }
    });
  }, [onInsert, onUpdate, onDelete]);

  const handlePayload = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    setAnalytics((prev) => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
      insertEvents: prev.insertEvents + (payload.eventType === "INSERT" ? 1 : 0),
      updateEvents: prev.updateEvents + (payload.eventType === "UPDATE" ? 1 : 0),
      deleteEvents: prev.deleteEvents + (payload.eventType === "DELETE" ? 1 : 0),
      lastEventTime: new Date(),
    }));

    // Add to batch
    pendingUpdatesRef.current.push(payload);

    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // Set new timeout for batch processing
    batchTimeoutRef.current = setTimeout(() => {
      processBatchedUpdates();
    }, batchDelay);
  }, [batchDelay, processBatchedUpdates]);

  const performHealthCheck = useCallback(() => {
    if (!channelRef.current || !isConnected) return;

    // Send a ping to check connection health
    // This is a simplified health check - in production you might want more sophisticated checks
    const healthCheck = async () => {
      try {
        // Simulate health check by checking if channel is still subscribed
        if (channelRef.current) {
          const state = channelRef.current.state;
          if (state !== "joined") {
            throw new Error(`Channel not in joined state: ${state}`);
          }
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setError(err as Error);
        if (enableReconnection) {
          reconnect();
        }
      }
    };

    healthCheck();
  }, [isConnected, enableReconnection]);

  const reconnect = useCallback(() => {
    if (reconnectionAttemptsRef.current >= maxReconnectionAttempts) {
      setError(new Error("Max reconnection attempts reached"));
      return;
    }

    reconnectionAttemptsRef.current++;
    
    setAnalytics((prev) => ({
      ...prev,
      reconnectionAttempts: prev.reconnectionAttempts + 1,
    }));

    // Exponential backoff
    const backoffDelay = reconnectionBackoffBase * Math.pow(2, reconnectionAttemptsRef.current - 1);

    if (reconnectionTimeoutRef.current) {
      clearTimeout(reconnectionTimeoutRef.current);
    }

    reconnectionTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
      setError(null);
    }, backoffDelay);
  }, [maxReconnectionAttempts, reconnectionBackoffBase]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = supabase
      .channel(`${table}_changes_advanced`)
      .on(
        "postgres_changes",
        {
          event: event as any,
          schema: "public",
          table,
          filter,
        },
        handlePayload
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setError(null);
          reconnectionAttemptsRef.current = 0;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
          setError(new Error(`Realtime connection error: ${status}`));
          setAnalytics((prev) => ({
            ...prev,
            connectionErrors: prev.connectionErrors + 1,
          }));
          
          if (enableReconnection) {
            reconnect();
          }
        }
      });

    channelRef.current = channel;

    // Start health check if enabled
    if (enableHealthCheck && healthCheckInterval > 0) {
      healthCheckTimeoutRef.current = setInterval(performHealthCheck, healthCheckInterval);
    }

    return () => {
      // Clear batch timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      // Clear reconnection timeout
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current);
      }
      
      // Clear health check interval
      if (healthCheckTimeoutRef.current) {
        clearInterval(healthCheckTimeoutRef.current);
      }

      // Process any pending updates
      processBatchedUpdates();

      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, event, handlePayload, enabled, enableReconnection, enableHealthCheck, healthCheckInterval, processBatchedUpdates, reconnect]);

  const forceReconnect = useCallback(() => {
    reconnectionAttemptsRef.current = 0;
    reconnect();
  }, [reconnect]);

  return {
    isConnected,
    error,
    reconnect: forceReconnect,
    analytics,
  };
}
