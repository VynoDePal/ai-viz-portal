"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  filter,
  event = "*",
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: event as any,
          schema: "public",
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
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
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setError(null);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
          setError(new Error(`Realtime connection error: ${status}`));
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, event, onInsert, onUpdate, onDelete, enabled]);

  const reconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setIsConnected(false);
    setError(null);
  };

  return {
    isConnected,
    error,
    reconnect,
  };
}
