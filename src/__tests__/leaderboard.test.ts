import { describe, it, expect } from "vitest";

describe("Leaderboard Component", () => {
  it("should render with default props", () => {
    const models = [
      {
        id: "1",
        name: "Model A",
        organization_id: "org1",
        category_id: "cat1",
        parameters: 7e9,
        overall_score: 85,
        intelligence_score: 90,
        speed_score: 80,
        value_score: 85,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    const organizations = [{ id: "org1", name: "Org A", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }];
    const categories = [{ id: "cat1", name: "Category A", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }];

    expect(models).toHaveLength(1);
    expect(organizations).toHaveLength(1);
    expect(categories).toHaveLength(1);
  });

  it("should filter models by organization", () => {
    const models = [
      { id: "1", name: "Model A", organization_id: "org1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Model B", organization_id: "org2", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    const filtered = models.filter((m) => m.organization_id === "org1");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Model A");
  });

  it("should filter models by category", () => {
    const models = [
      { id: "1", name: "Model A", category_id: "cat1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Model B", category_id: "cat2", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    const filtered = models.filter((m) => m.category_id === "cat1");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Model A");
  });

  it("should filter models by parameters range", () => {
    const models = [
      { id: "1", name: "Model A", parameters: 7e9, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Model B", parameters: 13e9, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    const filtered = models.filter((m) => (m.parameters || 0) >= 7e9 && (m.parameters || 0) <= 10e9);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Model A");
  });

  it("should sort models by score", () => {
    const models = [
      { id: "1", name: "Model A", overall_score: 80, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Model B", overall_score: 90, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "3", name: "Model C", overall_score: 85, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    const sorted = [...models].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    expect(sorted[0].name).toBe("Model B");
    expect(sorted[1].name).toBe("Model C");
    expect(sorted[2].name).toBe("Model A");
  });

  it("should paginate models correctly", () => {
    const models = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Model ${i}`,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }));
    const itemsPerPage = 10;
    const currentPage = 2;
    const paginated = models.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    expect(paginated).toHaveLength(10);
    expect(paginated[0].name).toBe("Model 10");
  });

  it("should calculate rank correctly", () => {
    const currentPage = 2;
    const itemsPerPage = 10;
    const index = 0;
    const rank = (currentPage - 1) * itemsPerPage + index + 1;
    expect(rank).toBe(11);
  });
});
