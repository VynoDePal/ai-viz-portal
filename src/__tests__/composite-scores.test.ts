import { describe, it, expect } from "vitest";
import {
  calculateIntelligenceScore,
  calculateSpeedScore,
  calculateValueScore,
  calculateOverallScore,
  calculateAllCompositeScores,
} from "@/lib/composite-scores";

describe("Composite Scores", () => {
  describe("calculateIntelligenceScore", () => {
    it("calculates intelligence score with equal weights", () => {
      const scores = [80, 90, 85];
      const score = calculateIntelligenceScore(scores);
      expect(score).toBeCloseTo(85, 2);
    });

    it("calculates intelligence score with custom weights", () => {
      const scores = [80, 90, 85];
      const weights = [2, 1, 1];
      const score = calculateIntelligenceScore(scores, weights);
      expect(score).toBeCloseTo(83.75, 2);
    });

    it("handles empty array", () => {
      const score = calculateIntelligenceScore([]);
      expect(score).toBe(0);
    });

    it("clamps score to 0-100 range", () => {
      const score = calculateIntelligenceScore([150]);
      expect(score).toBe(100);
    });
  });

  describe("calculateSpeedScore", () => {
    it("calculates speed score with good latency and throughput", () => {
      const score = calculateSpeedScore(100, 50);
      expect(score).toBeCloseTo(75, 2);
    });

    it("calculates speed score with poor latency", () => {
      const score = calculateSpeedScore(2000, 50);
      expect(score).toBeCloseTo(25, 2);
    });

    it("calculates speed score with zero metrics", () => {
      const score = calculateSpeedScore(0, 0);
      expect(score).toBe(0);
    });

    it("clamps score to 0-100 range", () => {
      const score = calculateSpeedScore(0, 200);
      expect(score).toBe(100);
    });
  });

  describe("calculateValueScore", () => {
    it("calculates value score correctly", () => {
      const score = calculateValueScore(90, 0.001);
      expect(score).toBeCloseTo(90, 2);
    });

    it("handles zero cost", () => {
      const score = calculateValueScore(90, 0);
      expect(score).toBe(0);
    });

    it("clamps score to 0-100 range", () => {
      const score = calculateValueScore(1000, 0.0001);
      expect(score).toBe(100);
    });
  });

  describe("calculateOverallScore", () => {
    it("calculates overall score with default weights", () => {
      const score = calculateOverallScore(80, 70, 90);
      expect(score).toBeCloseTo(80, 2);
    });

    it("calculates overall score with custom weights", () => {
      const score = calculateOverallScore(80, 70, 90, {
        intelligence: 0.5,
        speed: 0.25,
        value: 0.25,
      });
      expect(score).toBeCloseTo(80, 2);
    });

    it("clamps score to 0-100 range", () => {
      const score = calculateOverallScore(150, 150, 150);
      expect(score).toBe(100);
    });
  });

  describe("calculateAllCompositeScores", () => {
    it("calculates all composite scores correctly", () => {
      const scores = calculateAllCompositeScores(
        [80, 90, 85],
        100,
        50,
        0.001
      );

      expect(scores.intelligenceScore).toBeCloseTo(85, 2);
      expect(scores.speedScore).toBeCloseTo(75, 2);
      expect(scores.valueScore).toBeCloseTo(85, 2);
      expect(scores.overallScore).toBeGreaterThan(0);
      expect(scores.overallScore).toBeLessThanOrEqual(100);
    });

    it("handles empty benchmark scores", () => {
      const scores = calculateAllCompositeScores([], 100, 50, 0.001);
      expect(scores.intelligenceScore).toBe(0);
    });

    it("applies custom weights correctly", () => {
      const scores = calculateAllCompositeScores(
        [80, 90, 85],
        100,
        50,
        0.001,
        {
          benchmarkWeights: [2, 1, 1],
          scoreWeights: { intelligence: 0.5, speed: 0.25, value: 0.25 },
        }
      );

      expect(scores.intelligenceScore).toBeCloseTo(83.75, 2);
    });
  });
});
