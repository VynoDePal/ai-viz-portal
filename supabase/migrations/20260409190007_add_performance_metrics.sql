-- Add api_cost_per_1k_tokens column to benchmark_results table
ALTER TABLE benchmark_results ADD COLUMN IF NOT EXISTS api_cost_per_1k_tokens DECIMAL(10, 4) DEFAULT 0;

-- Add latency_ms column to benchmark_results table
ALTER TABLE benchmark_results ADD COLUMN IF NOT EXISTS latency_ms INTEGER DEFAULT 0;

-- Add throughput_rps column to benchmark_results table
ALTER TABLE benchmark_results ADD COLUMN IF NOT EXISTS throughput_rps DECIMAL(10, 2) DEFAULT 0;

-- Add cost_efficiency_score column to benchmark_results table
ALTER TABLE benchmark_results ADD COLUMN IF NOT EXISTS cost_efficiency_score DECIMAL(10, 4) DEFAULT 0;
