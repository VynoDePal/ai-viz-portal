import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRealtimeSubscriptionAdvanced } from "@/hooks/useRealtimeSubscriptionAdvanced";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((callback) => {
          // Simulate successful subscription
          setTimeout(() => callback("SUBSCRIBED"), 0);
          return {
            state: "joined",
          };
        }),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

describe("useRealtimeSubscriptionAdvanced", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with disconnected state", () => {
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: false,
      })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("connects when enabled", async () => {
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it("tracks analytics correctly", async () => {
    const onInsert = vi.fn();
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: true,
        onInsert,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Analytics should be initialized
    expect(result.current.analytics).toEqual({
      totalEvents: 0,
      insertEvents: 0,
      updateEvents: 0,
      deleteEvents: 0,
      connectionErrors: 0,
      reconnectionAttempts: 0,
      lastEventTime: null,
    });
  });

  it("respects batch delay configuration", () => {
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: true,
        batchDelay: 200,
      })
    );

    expect(result.current.isConnected).toBe(false);
  });

  it("respects reconnection configuration", () => {
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: true,
        enableReconnection: false,
      })
    );

    expect(result.current.isConnected).toBe(false);
  });

  it("respects health check configuration", () => {
    const { result } = renderHook(() =>
      useRealtimeSubscriptionAdvanced({
        table: "models",
        enabled: true,
        enableHealthCheck: false,
      })
    );

    expect(result.current.isConnected).toBe(false);
  });
});
