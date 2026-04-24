-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_models_org_cat ON models(organization_id, category_id);
CREATE INDEX IF NOT EXISTS idx_results_model_benchmark ON benchmark_results(model_id, benchmark_id);
CREATE INDEX IF NOT EXISTS idx_results_benchmark_score ON benchmark_results(benchmark_id, score DESC);

-- Partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_models_active ON models(organization_id, category_id) WHERE parameters IS NOT NULL AND parameters > 0;
CREATE INDEX IF NOT EXISTS idx_results_with_score ON benchmark_results(model_id, score DESC) WHERE score IS NOT NULL;

-- Expression indexes for calculated fields
CREATE INDEX IF NOT EXISTS idx_models_params_billions ON models((parameters / 1e9)) WHERE parameters IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_name_lower ON models(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_benchmarks_name_lower ON benchmarks(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_orgs_name_lower ON organizations(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_cats_name_lower ON categories(LOWER(name));

-- GIN indexes for text search
CREATE INDEX IF NOT EXISTS idx_models_name_trgm ON models USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_models_desc_trgm ON models USING gin(description gin_trgm_ops) WHERE description IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_benchmarks_name_trgm ON benchmarks USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_benchmarks_desc_trgm ON benchmarks USING gin(description gin_trgm_ops) WHERE description IS NOT NULL;

-- BRIN indexes for time-series data
CREATE INDEX IF NOT EXISTS idx_models_created_brin ON models USING brin(created_at);
CREATE INDEX IF NOT EXISTS idx_benchmarks_created_brin ON benchmarks USING brin(created_at);
CREATE INDEX IF NOT EXISTS idx_results_created_brin ON benchmark_results USING brin(created_at);
CREATE INDEX IF NOT EXISTS idx_results_date_brin ON benchmark_results USING brin(date_recorded) WHERE date_recorded IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_brin ON notifications USING brin(created_at);

-- Index for composite scores
CREATE INDEX IF NOT EXISTS idx_models_intelligence_score ON models(intelligence_score DESC) WHERE intelligence_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_speed_score ON models(speed_score DESC) WHERE speed_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_value_score ON models(value_score DESC) WHERE value_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_overall_score ON models(overall_score DESC) WHERE overall_score IS NOT NULL;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON models(category_id, overall_score DESC) WHERE overall_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leaderboard_org ON models(organization_id, overall_score DESC) WHERE overall_score IS NOT NULL;
