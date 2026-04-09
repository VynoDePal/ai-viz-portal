// Placeholder for TypeScript type definitions
// This will be expanded as the project grows

export interface Model {
  id: string;
  name: string;
  organization: string;
  parameters: number;
  releaseDate: string;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
}

export interface BenchmarkResult {
  id: string;
  modelId: string;
  benchmarkId: string;
  score: number;
}
