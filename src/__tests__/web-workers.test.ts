import { describe, it, expect } from "vitest";
import {
  calculateCompositeScores,
} from "@/workers/compositeScores.worker";
import {
  calculateRanking,
} from "@/workers/ranking.worker";
import {
  calculateStatistics,
} from "@/workers/statistics.worker";

describe("Web Workers - Composite Scores", () => {
  it("should calculate composite scores for models", () => {
    const models = [
      {
        id: "1",
        name: "Model A",
        benchmark_results: [
          { score: 90, benchmark: { type: "reasoning", name: "MMLU" } },
          { score: 85, benchmark: { type: "speed", name: "Speed Test" } },
        ],
        parameters: 7e9,
        cost_per_1k_tokens: 0.001,
      },
    ];
    const result = calculateCompositeScores(models);
    expect(result).toHaveLength(1);
    expect(result[0].intelligence_score).toBeGreaterThan(0);
    expect(result[0].speed_score).toBeGreaterThan(0);
  });

  it("should handle models without benchmark results", () => {
    const models = [{ id: "1", name: "Model A", benchmark_results: [] }];
    const result = calculateCompositeScores(models);
    expect(result).toHaveLength(1);
    expect(result[0].intelligence_score).toBeUndefined();
  });
});

describe("Web Workers - Ranking", () => {
  it("should calculate ranking for models", () => {
    const models = [
      { id: "1", name: "Model A", overall_score: 80 },
      { id: "2", name: "Model B", overall_score: 90 },
      { id: "3", name: "Model C", overall_score: 85 },
    ];
    const result = calculateRanking(models, "overall_score", "desc");
    expect(result).toHaveLength(3);
    expect(result[0].rank).toBe(1);
    expect(result[0].overall_score).toBe(90);
    expect(result[1].rank).toBe(2);
    expect(result[1].overall_score).toBe(85);
  });

  it("should handle ascending sort", () => {
    const models = [
      { id: "1", name: "Model A", overall_score: 80 },
      { id: "2", name: "Model B", overall_score: 90 },
    ];
    const result = calculateRanking(models, "overall_score", "asc");
    expect(result[0].rank).toBe(1);
    expect(result[0].overall_score).toBe(80);
  });
});

describe("Web Workers - Statistics", () => {
  it("should calculate statistics for values", () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateStatistics(values);
    expect(result.count).toBe(5);
    expect(result.mean).toBe(3);
    expect(result.median).toBe(3);
    expect(result.min).toBe(1);
    expect(result.max).toBe(5);
  });

  it("should handle empty array", () => {
    const values: number[] = [];
    const result = calculateStatistics(values);
    expect(result.count).toBe(0);
    expect(result.mean).toBe(0);
  });

  it("should calculate standard deviation correctly", () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateStatistics(values);
    expect(result.standardDeviation).toBeCloseTo(1.414, 2);
  });
});
