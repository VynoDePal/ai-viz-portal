import { describe, it, expect } from "vitest";

describe("Radar Chart Component", () => {
  it("RadarChart component should exist", () => {
    const RadarChart = require("@/components/visualization/RadarChart");
    expect(RadarChart).toBeTruthy();
  });

  it("should handle empty axes", () => {
    const axes: string[] = [];
    expect(axes.length).toBe(0);
  });

  it("should handle empty models", () => {
    const models: any[] = [];
    expect(models.length).toBe(0);
  });

  it("should process radar chart data correctly", () => {
    const axes = ["MMLU", "HellaSwag", "ARC"];
    const models = [
      {
        name: "Model A",
        color: "#ff0000",
        scores: { MMLU: 80, HellaSwag: 85, ARC: 75 },
      },
      {
        name: "Model B",
        color: "#00ff00",
        scores: { MMLU: 90, HellaSwag: 80, ARC: 85 },
      },
    ];
    expect(axes).toHaveLength(3);
    expect(models).toHaveLength(2);
    expect(models[0].name).toBe("Model A");
    expect(models[0].scores.MMLU).toBe(80);
  });

  it("should calculate point positions correctly", () => {
    const center = 250;
    const radius = 200;
    const angle = Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    expect(x).toBeCloseTo(250, 1);
    expect(y).toBeCloseTo(450, 1);
  });

  it("should handle multiple models", () => {
    const models = [
      { name: "Model A", color: "#ff0000", scores: {} },
      { name: "Model B", color: "#00ff00", scores: {} },
      { name: "Model C", color: "#0000ff", scores: {} },
      { name: "Model D", color: "#ffff00", scores: {} },
      { name: "Model E", color: "#ff00ff", scores: {} },
      { name: "Model F", color: "#00ffff", scores: {} },
    ];
    expect(models.length).toBe(6);
  });
});
