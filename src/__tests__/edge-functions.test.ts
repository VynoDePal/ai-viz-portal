import { describe, it, expect } from "vitest";

describe("Supabase Edge Functions", () => {
  const projectId = "zhofaxmmywbjbofetfla";
  const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

  it("get-statistics should return statistics", async () => {
    const response = await fetch(`${baseUrl}/get-statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("total_models");
    expect(data).toHaveProperty("total_benchmarks");
    expect(data).toHaveProperty("total_results");
  });

  it("get-top-models should require benchmark_id parameter", async () => {
    const response = await fetch(`${baseUrl}/get-top-models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("get-rankings should require category_id parameter", async () => {
    const response = await fetch(`${baseUrl}/get-rankings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });
});
