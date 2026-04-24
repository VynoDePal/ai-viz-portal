import { describe, it, expect } from "vitest";
import {
  predictLinearTrend,
  predictMovingAverage,
  predictExponentialSmoothing,
  calculateAccuracyMetrics,
} from "@/lib/predictionUtils";
import { type TimeSeriesDataPoint } from "@/lib/timeSeriesUtils";

describe("Prediction Utilities", () => {
  const sampleData: TimeSeriesDataPoint[] = [
    { date: new Date("2024-01-01"), value: 10 },
    { date: new Date("2024-01-02"), value: 15 },
    { date: new Date("2024-01-03"), value: 20 },
    { date: new Date("2024-01-04"), value: 25 },
    { date: new Date("2024-01-05"), value: 30 },
  ];

  describe("predictLinearTrend", () => {
    it("should predict linear trend", () => {
      const result = predictLinearTrend(sampleData, 5);
      expect(result.predicted).toHaveLength(5);
      expect(result.confidenceInterval.lower).toHaveLength(5);
      expect(result.confidenceInterval.upper).toHaveLength(5);
      expect(result.accuracy).toHaveProperty("mae");
      expect(result.accuracy).toHaveProperty("mse");
      expect(result.accuracy).toHaveProperty("rmse");
      expect(result.accuracy).toHaveProperty("r2");
    });

    it("should handle insufficient data", () => {
      const result = predictLinearTrend([{ date: new Date(), value: 10 }], 5);
      expect(result.predicted).toHaveLength(0);
    });
  });

  describe("predictMovingAverage", () => {
    it("should predict using moving average", () => {
      const result = predictMovingAverage(sampleData, 5, 3);
      expect(result.predicted).toHaveLength(5);
      expect(result.confidenceInterval.lower).toHaveLength(5);
      expect(result.confidenceInterval.upper).toHaveLength(5);
    });

    it("should handle insufficient data for window", () => {
      const result = predictMovingAverage([{ date: new Date(), value: 10 }], 5, 5);
      expect(result.predicted).toHaveLength(0);
    });
  });

  describe("predictExponentialSmoothing", () => {
    it("should predict using exponential smoothing", () => {
      const result = predictExponentialSmoothing(sampleData, 5, 0.3);
      expect(result.predicted).toHaveLength(5);
      expect(result.confidenceInterval.lower).toHaveLength(5);
      expect(result.confidenceInterval.upper).toHaveLength(5);
    });

    it("should handle insufficient data", () => {
      const result = predictExponentialSmoothing([{ date: new Date(), value: 10 }], 5);
      expect(result.predicted).toHaveLength(0);
    });
  });

  describe("calculateAccuracyMetrics", () => {
    it("should calculate accuracy metrics", () => {
      const actual = sampleData;
      const predicted = sampleData.map((d) => ({ ...d, value: d.value + 1 }));
      const result = calculateAccuracyMetrics(actual, predicted);
      expect(result.mae).toBe(1);
      expect(result.mse).toBe(1);
      expect(result.rmse).toBe(1);
      expect(result.r2).toBeDefined();
    });

    it("should handle mismatched data lengths", () => {
      const result = calculateAccuracyMetrics(sampleData, []);
      expect(result.mae).toBe(0);
    });

    it("should handle empty data", () => {
      const result = calculateAccuracyMetrics([], []);
      expect(result.mae).toBe(0);
    });
  });
});

describe("Prediction Chart Component", () => {
  it("PredictionChart component should exist", () => {
    const PredictionChart = require("@/components/visualization/PredictionChart");
    expect(PredictionChart).toBeTruthy();
  });
});
