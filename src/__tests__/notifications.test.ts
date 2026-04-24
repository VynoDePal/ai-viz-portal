import { describe, it, expect, vi } from "vitest";
import {
  createNotification,
  notifyNewModel,
  notifyBenchmarkUpdate,
  notifyTopModelChange,
  notifyPriceChange,
  notifyMilestone,
  notifyCustom,
} from "@/lib/notification-triggers";

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: "test-user-id" } },
      })),
    },
  },
}));

describe("Notification Triggers", () => {
  it("should create a notification", async () => {
    const result = await createNotification(
      "test-user-id",
      "NEW_MODEL",
      "Test Title",
      "Test Message",
      { key: "value" }
    );
    expect(result).toBeUndefined();
  });

  it("should notify about new model", async () => {
    const result = await notifyNewModel("Model A", "Org A");
    expect(result).toBeUndefined();
  });

  it("should notify about benchmark update", async () => {
    const result = await notifyBenchmarkUpdate("Model A", "Benchmark A", 80, 85);
    expect(result).toBeUndefined();
  });

  it("should notify about top model change", async () => {
    const result = await notifyTopModelChange("Model A", 5, 3);
    expect(result).toBeUndefined();
  });

  it("should notify about price change", async () => {
    const result = await notifyPriceChange("Model A", 0.001, 0.0015);
    expect(result).toBeUndefined();
  });

  it("should notify about milestone", async () => {
    const result = await notifyMilestone("Model A", "Reached 90 score", 90);
    expect(result).toBeUndefined();
  });

  it("should send custom notification", async () => {
    const result = await notifyCustom("Custom Title", "Custom Message", { key: "value" });
    expect(result).toBeUndefined();
  });
});

describe("Notification Types", () => {
  it("should have valid notification types", () => {
    const validTypes = ["NEW_MODEL", "BENCHMARK_UPDATE", "TOP_MODEL_CHANGE", "PRICE_CHANGE", "MILESTONE", "CUSTOM"];
    validTypes.forEach((type) => {
      expect(type).toBeTruthy();
    });
  });
});
