// Database type definitions matching the Supabase schema

export interface Organization {
  id: string;
  name: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  name: string;
  organization_id?: string;
  category_id?: string;
  parameters?: number;
  release_date?: string;
  description?: string;
  github_url?: string;
  huggingface_url?: string;
  github_repo?: string;
  huggingface_model?: string;
  github_stars?: number;
  hf_downloads?: number;
  metrics_last_updated?: string;
  intelligence_score?: number;
  speed_score?: number;
  value_score?: number;
  overall_score?: number;
  scores_last_updated?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  category?: Category;
}

export interface Benchmark {
  id: string;
  name: string;
  description?: string;
  type?: string;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface BenchmarkResult {
  id: string;
  model_id: string;
  benchmark_id: string;
  score?: number;
  date_recorded?: string;
  source?: string;
  api_cost_per_1k_tokens?: number;
  latency_ms?: number;
  throughput_rps?: number;
  cost_efficiency_score?: number;
  created_at: string;
  updated_at: string;
  model?: Model;
  benchmark?: Benchmark;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
