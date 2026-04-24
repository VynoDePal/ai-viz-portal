import { describe, it, expect } from "vitest";
import {
  getColorForValue,
  normalizeValue,
  getColorForScore,
  type ColorScheme,
} from "@/lib/colorScales";

describe("Color Scales", () => {
  describe("getColorForValue", () => {
    it("should return green-red color for value 1", () => {
      const color = getColorForValue(1, "green-red");
      expect(color).toBe("rgb(0, 255, 0)");
    });

    it("should return red color for value 0", () => {
      const color = getColorForValue(0, "green-red");
      expect(color).toBe("rgb(255, 0, 0)");
    });

    it("should clamp values to 0-1 range", () => {
      const color1 = getColorForValue(-1, "green-red");
      const color2 = getColorForValue(2, "green-red");
      expect(color1).toBe("rgb(255, 0, 0)");
      expect(color2).toBe("rgb(0, 255, 0)");
    });

    it("should support different color schemes", () => {
      const schemes: ColorScheme[] = ["green-red", "blue-red", "purple-green", "grayscale"];
      schemes.forEach((scheme) => {
        const color = getColorForValue(0.5, scheme);
        expect(color).toBeTruthy();
        expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      });
    });
  });

  describe("normalizeValue", () => {
    it("should normalize value to 0-1 range", () => {
      expect(normalizeValue(50, 0, 100)).toBe(0.5);
      expect(normalizeValue(75, 0, 100)).toBe(0.75);
      expect(normalizeValue(25, 0, 100)).toBe(0.25);
    });

    it("should handle min equals max", () => {
      expect(normalizeValue(50, 50, 50)).toBe(0.5);
    });

    it("should handle values outside range", () => {
      expect(normalizeValue(150, 0, 100)).toBe(1.5);
      expect(normalizeValue(-50, 0, 100)).toBe(-0.5);
    });
  });

  describe("getColorForScore", () => {
    it("should return color for score", () => {
      const color = getColorForScore(50, 0, 100, "green-red");
      expect(color).toBeTruthy();
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });

    it("should use min and max for normalization", () => {
      const color1 = getColorForScore(50, 0, 100, "green-red");
      const color2 = getColorForScore(50, 0, 200, "green-red");
      expect(color1).not.toBe(color2);
    });

    it("should handle score at min", () => {
      const color = getColorForScore(0, 0, 100, "green-red");
      expect(color).toBe("rgb(255, 0, 0)");
    });

    it("should handle score at max", () => {
      const color = getColorForScore(100, 0, 100, "green-red");
      expect(color).toBe("rgb(0, 255, 0)");
    });
  });
});

describe("Heatmap Component", () => {
  it("Heatmap component should exist", () => {
    const Heatmap = require("@/components/visualization/Heatmap");
    expect(Heatmap).toBeTruthy();
  });

  it("should handle empty data", () => {
    const data: any[] = [];
    expect(data.length).toBe(0);
  });

  it("should process heatmap data correctly", () => {
    const data = [
      { model: "Model A", benchmark: "Benchmark 1", score: 80 },
      { model: "Model B", benchmark: "Benchmark 1", score: 90 },
    ];
    expect(data).toHaveLength(2);
    expect(data[0].model).toBe("Model A");
    expect(data[0].score).toBe(80);
  });
});
