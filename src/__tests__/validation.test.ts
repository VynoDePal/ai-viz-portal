import { describe, it, expect } from "vitest";
import {
  benchmarkResultSchema,
  validateBenchmarkResult,
  type BenchmarkResultFormData,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("benchmarkResultSchema", () => {
    it("validates correct data", () => {
      const data: BenchmarkResultFormData = {
        model_id: "550e8400-e29b-41d4-a716-446655440000",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: 86.4,
        date_recorded: "2024-01-01",
        source: "OpenAI",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(true);
    });

    it("rejects invalid model ID", () => {
      const data = {
        model_id: "invalid-uuid",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: 86.4,
        date_recorded: "2024-01-01",
        source: "OpenAI",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(false);
    });

    it("rejects score below 0", () => {
      const data = {
        model_id: "550e8400-e29b-41d4-a716-446655440000",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: -1,
        date_recorded: "2024-01-01",
        source: "OpenAI",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(false);
    });

    it("rejects score above 100", () => {
      const data = {
        model_id: "550e8400-e29b-41d4-a716-446655440000",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: 101,
        date_recorded: "2024-01-01",
        source: "OpenAI",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const data = {
        model_id: "550e8400-e29b-41d4-a716-446655440000",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: 86.4,
        date_recorded: "01-01-2024",
        source: "OpenAI",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(false);
    });

    it("rejects empty source", () => {
      const data = {
        model_id: "550e8400-e29b-41d4-a716-446655440000",
        benchmark_id: "550e8400-e29b-41d4-a716-446655440001",
        score: 86.4,
        date_recorded: "2024-01-01",
        source: "",
      };

      const result = validateBenchmarkResult(data);

      expect(result.success).toBe(false);
    });
  });
});
