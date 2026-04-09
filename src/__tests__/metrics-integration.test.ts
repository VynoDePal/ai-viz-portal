import { describe, it, expect, vi } from "vitest";

describe("Metrics Integration", () => {
  const projectId = "zhofaxmmywbjbofetfla";
  const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

  it("fetch-github-stars should update GitHub stars", async () => {
    const response = await fetch(`${baseUrl}/fetch-github-stars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("updated");
  });

  it("fetch-hf-downloads should update HF downloads", async () => {
    const response = await fetch(`${baseUrl}/fetch-hf-downloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("updated");
  });
});
