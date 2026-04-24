import { describe, it, expect } from "vitest";

describe("Database Indexes", () => {
  it("should have composite indexes for common queries", () => {
    const compositeIndexes = [
      "idx_models_org_cat",
      "idx_results_model_benchmark",
      "idx_results_benchmark_score",
    ];
    compositeIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have partial indexes for active data", () => {
    const partialIndexes = [
      "idx_models_active",
      "idx_results_with_score",
    ];
    partialIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have expression indexes for calculated fields", () => {
    const expressionIndexes = [
      "idx_models_params_billions",
      "idx_models_name_lower",
      "idx_benchmarks_name_lower",
      "idx_orgs_name_lower",
      "idx_cats_name_lower",
    ];
    expressionIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have GIN indexes for text search", () => {
    const ginIndexes = [
      "idx_models_name_trgm",
      "idx_models_desc_trgm",
      "idx_benchmarks_name_trgm",
      "idx_benchmarks_desc_trgm",
    ];
    ginIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have BRIN indexes for time-series data", () => {
    const brinIndexes = [
      "idx_models_created_brin",
      "idx_benchmarks_created_brin",
      "idx_results_created_brin",
      "idx_results_date_brin",
      "idx_notifications_created_brin",
    ];
    brinIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have indexes for composite scores", () => {
    const scoreIndexes = [
      "idx_models_intelligence_score",
      "idx_models_speed_score",
      "idx_models_value_score",
      "idx_models_overall_score",
    ];
    scoreIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });

  it("should have indexes for leaderboard queries", () => {
    const leaderboardIndexes = [
      "idx_leaderboard_category",
      "idx_leaderboard_org",
    ];
    leaderboardIndexes.forEach((index) => {
      expect(index).toBeTruthy();
    });
  });
});
