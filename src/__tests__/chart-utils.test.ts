import { describe, it, expect } from "vitest";
import {
  transformDataForLineChart,
  transformDataForBarChart,
  getOrganizationColors,
  getTopModelsByScore,
} from "@/lib/chart-utils";
import type { BenchmarkResult, Model } from "@/types";

describe("Chart Utils", () => {
  describe("transformDataForLineChart", () => {
    it("transforms benchmark results into line chart data", () => {
      const results: BenchmarkResult[] = [
        {
          id: "1",
          model_id: "m1",
          benchmark_id: "b1",
          score: 86.4,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "GPT-4" as any, id: "m1" } as any,
          benchmark: { name: "MMLU", id: "b1" } as any,
        },
        {
          id: "2",
          model_id: "m2",
          benchmark_id: "b1",
          score: 86.8,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Claude", id: "m2" } as any,
          benchmark: { name: "MMLU", id: "b1" } as any,
        },
      ];

      const models: Model[] = [
        { name: "GPT-4", id: "m1" } as Model,
        { name: "Claude", id: "m2" } as Model,
      ];

      const data = transformDataForLineChart(results, models);

      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("MMLU");
      expect(data[0]["GPT-4"]).toBe(86.4);
      expect(data[0]["Claude"]).toBe(86.8);
    });

    it("handles missing scores", () => {
      const results: BenchmarkResult[] = [
        {
          id: "1",
          model_id: "m1",
          benchmark_id: "b1",
          score: undefined,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "GPT-4", id: "m1" } as any,
          benchmark: { name: "MMLU", id: "b1" } as any,
        },
      ];

      const models: Model[] = [{ name: "GPT-4", id: "m1" } as Model];

      const data = transformDataForLineChart(results, models);

      expect(data[0]["GPT-4"]).toBe(0);
    });
  });

  describe("transformDataForBarChart", () => {
    it("transforms benchmark results into bar chart data", () => {
      const results: BenchmarkResult[] = [
        {
          id: "1",
          model_id: "m1",
          benchmark_id: "b1",
          score: 86.4,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: {
            name: "GPT-4",
            id: "m1",
            organization: { name: "OpenAI" } as any,
          } as any,
          benchmark: { name: "MMLU", id: "b1" } as any,
        },
      ];

      const data = transformDataForBarChart(results, "MMLU");

      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("GPT-4");
      expect(data[0].score).toBe(86.4);
      expect(data[0].organization).toBe("OpenAI");
    });

    it("filters by benchmark name", () => {
      const results: BenchmarkResult[] = [
        {
          id: "1",
          model_id: "m1",
          benchmark_id: "b1",
          score: 86.4,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "GPT-4", id: "m1" } as any,
          benchmark: { name: "MMLU", id: "b1" } as any,
        },
        {
          id: "2",
          model_id: "m2",
          benchmark_id: "b2",
          score: 67.0,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Claude", id: "m2" } as any,
          benchmark: { name: "HumanEval", id: "b2" } as any,
        },
      ];

      const data = transformDataForBarChart(results, "MMLU");

      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("GPT-4");
    });
  });

  describe("getOrganizationColors", () => {
    it("assigns colors to organizations", () => {
      const organizations = ["OpenAI", "Anthropic", "Meta"];

      const colors = getOrganizationColors(organizations);

      expect(colors["OpenAI"]).toBeDefined();
      expect(colors["Anthropic"]).toBeDefined();
      expect(colors["Meta"]).toBeDefined();
    });

    it("reuses colors for more than 7 organizations", () => {
      const organizations = ["Org1", "Org2", "Org3", "Org4", "Org5", "Org6", "Org7", "Org8"];

      const colors = getOrganizationColors(organizations);

      expect(colors["Org1"]).toBe(colors["Org8"]);
    });
  });

  describe("getTopModelsByScore", () => {
    it("returns top N models by average score", () => {
      const results: BenchmarkResult[] = [
        {
          id: "1",
          model_id: "m1",
          benchmark_id: "b1",
          score: 90,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Model A", id: "m1" } as any,
        },
        {
          id: "2",
          model_id: "m2",
          benchmark_id: "b1",
          score: 80,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Model B", id: "m2" } as any,
        },
        {
          id: "3",
          model_id: "m1",
          benchmark_id: "b2",
          score: 85,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Model A", id: "m1" } as any,
        },
        {
          id: "4",
          model_id: "m2",
          benchmark_id: "b2",
          score: 75,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          model: { name: "Model B", id: "m2" } as any,
        },
      ];

      const topModels = getTopModelsByScore(results, 2);

      expect(topModels).toHaveLength(2);
      expect(topModels[0].name).toBe("Model A");
      expect(topModels[1].name).toBe("Model B");
    });
  });
});
