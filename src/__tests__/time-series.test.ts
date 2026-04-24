import { describe, it, expect } from "vitest";
import {
  filterByDateRange,
  groupByInterval,
  calculateTrendLine,
  calculateMovingAverage,
  calculatePercentageChange,
  detectOutliers,
  type TimeSeriesDataPoint,
} from "@/lib/timeSeriesUtils";

describe("Time Series Utilities", () => {
  const sampleData: TimeSeriesDataPoint[] = [
    { date: new Date("2024-01-01"), value: 10 },
    { date: new Date("2024-01-02"), value: 15 },
    { date: new Date("2024-01-03"), value: 20 },
    { date: new Date("2024-01-04"), value: 25 },
    { date: new Date("2024-01-05"), value: 30 },
  ];

  describe("filterByDateRange", () => {
    it("should filter data by date range", () => {
      const startDate = new Date("2024-01-02");
      const endDate = new Date("2024-01-04");
      const result = filterByDateRange(sampleData, startDate, endDate);
      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(15);
      expect(result[2].value).toBe(25);
    });

    it("should handle empty data", () => {
      const result = filterByDateRange([], new Date(), new Date());
      expect(result).toHaveLength(0);
    });
  });

  describe("groupByInterval", () => {
    it("should group data by day", () => {
      const result = groupByInterval(sampleData, "day");
      expect(result).toHaveLength(5);
    });

    it("should group data by month", () => {
      const result = groupByInterval(sampleData, "month");
      expect(result).toHaveLength(1);
    });

    it("should handle empty data", () => {
      const result = groupByInterval([], "day");
      expect(result).toHaveLength(0);
    });
  });

  describe("calculateTrendLine", () => {
    it("should calculate trend line", () => {
      const result = calculateTrendLine(sampleData);
      expect(result).toHaveProperty("slope");
      expect(result).toHaveProperty("intercept");
      expect(result).toHaveProperty("r2");
      expect(result.slope).toBeGreaterThan(0);
    });

    it("should handle insufficient data", () => {
      const result = calculateTrendLine([{ date: new Date(), value: 10 }]);
      expect(result.slope).toBe(0);
    });
  });

  describe("calculateMovingAverage", () => {
    it("should calculate moving average", () => {
      const result = calculateMovingAverage(sampleData, 3);
      expect(result).toHaveLength(5);
      expect(result[2].value).toBeCloseTo(15, 1);
    });

    it("should handle window size of 1", () => {
      const result = calculateMovingAverage(sampleData, 1);
      expect(result).toEqual(sampleData);
    });

    it("should handle empty data", () => {
      const result = calculateMovingAverage([], 3);
      expect(result).toHaveLength(0);
    });
  });

  describe("calculatePercentageChange", () => {
    it("should calculate percentage change", () => {
      const result = calculatePercentageChange(sampleData);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(50); // (15-10)/10 * 100
    });

    it("should handle single data point", () => {
      const result = calculatePercentageChange([{ date: new Date(), value: 10 }]);
      expect(result).toEqual([0]);
    });
  });

  describe("detectOutliers", () => {
    it("should detect outliers using IQR method", () => {
      const dataWithOutlier = [
        ...sampleData,
        { date: new Date("2024-01-06"), value: 100 }, // outlier
      ];
      const result = detectOutliers(dataWithOutlier);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(100);
    });

    it("should handle insufficient data", () => {
      const result = detectOutliers([{ date: new Date(), value: 10 }]);
      expect(result).toHaveLength(0);
    });
  });
});

describe("Trend Chart Components", () => {
  it("TrendChart component should exist", () => {
    const TrendChart = require("@/components/visualization/TrendChart");
    expect(TrendChart).toBeTruthy();
  });

  it("DateRangeSelector component should exist", () => {
    const DateRangeSelector = require("@/components/visualization/DateRangeSelector");
    expect(DateRangeSelector).toBeTruthy();
  });

  it("TrendAnnotations component should exist", () => {
    const TrendAnnotations = require("@/components/visualization/TrendAnnotations");
    expect(TrendAnnotations).toBeTruthy();
  });
});
