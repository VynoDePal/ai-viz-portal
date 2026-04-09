import { describe, it, expect } from "vitest";
import {
  calculateCostPer1KTokens,
  calculateCostEfficiencyScore,
  calculateAverageLatency,
  calculateThroughput,
} from "@/lib/performance-calculations";

describe("Performance Calculations", () => {
  describe("calculateCostPer1KTokens", () => {
    it("calculates cost correctly", () => {
      const cost = calculateCostPer1KTokens(7, 1000, 500);
      expect(cost).toBeCloseTo(0.0015, 4);
    });

    it("handles zero tokens", () => {
      const cost = calculateCostPer1KTokens(7, 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe("calculateCostEfficiencyScore", () => {
    it("calculates efficiency score correctly", () => {
      const score = calculateCostEfficiencyScore(90, 0.0015);
      expect(score).toBeCloseTo(60000, 4);
    });

    it("handles zero cost", () => {
      const score = calculateCostEfficiencyScore(90, 0);
      expect(score).toBe(0);
    });
  });

  describe("calculateAverageLatency", () => {
    it("calculates average latency correctly", () => {
      const latencies = [100, 150, 200, 175];
      const avg = calculateAverageLatency(latencies);
      expect(avg).toBe(156);
    });

    it("handles empty array", () => {
      const avg = calculateAverageLatency([]);
      expect(avg).toBe(0);
    });
  });

  describe("calculateThroughput", () => {
    it("calculates throughput correctly", () => {
      const throughput = calculateThroughput(100, 10);
      expect(throughput).toBe(10);
    });

    it("handles zero duration", () => {
      const throughput = calculateThroughput(100, 0);
      expect(throughput).toBe(0);
    });
  });
});
