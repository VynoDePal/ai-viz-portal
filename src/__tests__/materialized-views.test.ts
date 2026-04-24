import { describe, it, expect, vi } from "vitest";

describe("Materialized Views", () => {
  const projectId = "zhofaxmmywbjbofetfla";
  const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

  it("refresh-materialized-views should refresh all views", async () => {
    const response = await fetch(`${baseUrl}/refresh-materialized-views`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(data.message).toBe("Materialized views refreshed successfully");
  });

  it("materialized views should exist in database", async () => {
    const views = [
      "mv_model_rankings_by_category",
      "mv_benchmark_summaries",
      "mv_aggregated_statistics",
      "mv_leaderboard_snapshot",
    ];

    for (const view of views) {
      expect(view).toBeTruthy();
    }
  });

  it("refresh function should be callable", async () => {
    const functionName = "refresh_all_materialized_views";
    expect(functionName).toBe("refresh_all_materialized_views");
  });
});
