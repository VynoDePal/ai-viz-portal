import { describe, it, expect } from "vitest";
import {
  getRepositoryMetrics,
  getRepositoryActivity,
  getContributors,
  getCommitStats,
} from "@/lib/github-api";

describe("GitHub API", () => {
  describe("getRepositoryMetrics", () => {
    it("returns null when API call fails", async () => {
      // Mock invalid repository
      const result = await getRepositoryMetrics("invalid", "invalid-repo");
      expect(result).toBeNull();
    });
  });

  describe("getRepositoryActivity", () => {
    it("returns null when API call fails", async () => {
      const result = await getRepositoryActivity("invalid", "invalid-repo");
      expect(result).toBeNull();
    });
  });

  describe("getContributors", () => {
    it("returns null when API call fails", async () => {
      const result = await getContributors("invalid", "invalid-repo");
      expect(result).toBeNull();
    });
  });

  describe("getCommitStats", () => {
    it("returns null when API call fails", async () => {
      const result = await getCommitStats("invalid", "invalid-repo");
      expect(result).toBeNull();
    });
  });
});
