import { describe, it, expect, vi } from "vitest";
import { exportToCSV, exportToJSON } from "@/lib/comparison-export";
import type { Model, BenchmarkResult } from "@/types";

describe("Comparison Export", () => {
  const mockModels: Model[] = [
    {
      id: "1",
      name: "GPT-4",
      parameters: 1760,
      release_date: "2023-03-14",
      organization: { id: "1", name: "OpenAI", created_at: "", updated_at: "" },
      category: { id: "1", name: "LLM", created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
    },
    {
      id: "2",
      name: "Claude 3",
      parameters: 200,
      release_date: "2024-03-04",
      organization: { id: "2", name: "Anthropic", created_at: "", updated_at: "" },
      category: { id: "1", name: "LLM", created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
    },
  ];

  const mockResults: BenchmarkResult[] = [
    {
      id: "1",
      model_id: "1",
      benchmark_id: "1",
      score: 92.5,
      benchmark: { id: "1", name: "MMLU", created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
    },
    {
      id: "2",
      model_id: "2",
      benchmark_id: "1",
      score: 88.3,
      benchmark: { id: "1", name: "MMLU", created_at: "", updated_at: "" },
      created_at: "",
      updated_at: "",
    },
  ];

  it("should export data to CSV", () => {
    const data = { models: mockModels, results: mockResults };
    
    // Mock the downloadFile function
    const mockDownloadFile = vi.fn();
    (global as any).downloadFile = mockDownloadFile;
    
    exportToCSV(data);
    
    expect(mockDownloadFile).toHaveBeenCalled();
    const csvContent = mockDownloadFile.mock.calls[0][0];
    expect(csvContent).toContain("Metric,GPT-4,Claude 3");
    expect(csvContent).toContain("Parameters (B),1760B,200B");
    expect(csvContent).toContain("Organization,OpenAI,Anthropic");
  });

  it("should export data to JSON", () => {
    const data = { models: mockModels, results: mockResults };
    
    // Mock the downloadFile function
    const mockDownloadFile = vi.fn();
    (global as any).downloadFile = mockDownloadFile;
    
    exportToJSON(data);
    
    expect(mockDownloadFile).toHaveBeenCalled();
    const jsonContent = JSON.parse(mockDownloadFile.mock.calls[0][0]);
    expect(jsonContent.models).toHaveLength(2);
    expect(jsonContent.models[0].name).toBe("GPT-4");
    expect(jsonContent.benchmarks).toHaveLength(1);
    expect(jsonContent.benchmarks[0].name).toBe("MMLU");
  });
});
