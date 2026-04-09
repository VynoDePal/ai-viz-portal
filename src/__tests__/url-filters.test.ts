import { describe, it, expect } from "vitest";
import {
  serializeFilters,
  deserializeFilters,
  FilterState,
} from "@/lib/url-filters";

describe("URL Filters", () => {
  describe("serializeFilters", () => {
    it("serializes multi-select filters", () => {
      const filters: FilterState = {
        organizations: ["OpenAI", "Anthropic"],
      };
      const params = serializeFilters(filters);
      expect(params.getAll("organizations")).toEqual(["OpenAI", "Anthropic"]);
    });

    it("serializes range filters", () => {
      const filters: FilterState = {
        parameters: [7, 70],
      };
      const params = serializeFilters(filters);
      expect(params.get("parameters_min")).toBe("7");
      expect(params.get("parameters_max")).toBe("70");
    });

    it("serializes search filter", () => {
      const filters: FilterState = {
        search: "GPT-4",
      };
      const params = serializeFilters(filters);
      expect(params.get("search")).toBe("GPT-4");
    });

    it("handles empty filters", () => {
      const filters: FilterState = {};
      const params = serializeFilters(filters);
      expect(params.toString()).toBe("");
    });
  });

  describe("deserializeFilters", () => {
    it("deserializes multi-select filters", () => {
      const params = new URLSearchParams();
      params.append("organizations", "OpenAI");
      params.append("organizations", "Anthropic");
      
      const filters = deserializeFilters(params);
      expect(filters.organizations).toEqual(["OpenAI", "Anthropic"]);
    });

    it("deserializes range filters", () => {
      const params = new URLSearchParams();
      params.set("parameters_min", "7");
      params.set("parameters_max", "70");
      
      const filters = deserializeFilters(params);
      expect(filters.parameters).toEqual([7, 70]);
    });

    it("deserializes search filter", () => {
      const params = new URLSearchParams();
      params.set("search", "GPT-4");
      
      const filters = deserializeFilters(params);
      expect(filters.search).toBe("GPT-4");
    });

    it("handles empty parameters", () => {
      const params = new URLSearchParams();
      const filters = deserializeFilters(params);
      expect(filters).toEqual({});
    });
  });
});
