-- Create materialized view for model rankings by category
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_model_rankings_by_category AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  m.id as model_id,
  m.name as model_name,
  m.organization_id,
  AVG(br.score) as avg_score,
  COUNT(br.id) as benchmark_count,
  MAX(br.score) as max_score,
  MIN(br.score) as min_score
FROM categories c
LEFT JOIN models m ON c.id = m.category_id
LEFT JOIN benchmark_results br ON m.id = br.model_id
GROUP BY c.id, c.name, m.id, m.name, m.organization_id
ORDER BY c.name, avg_score DESC;

-- Create materialized view for benchmark summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_benchmark_summaries AS
SELECT 
  b.id as benchmark_id,
  b.name as benchmark_name,
  b.type as benchmark_type,
  COUNT(br.id) as model_count,
  AVG(br.score) as avg_score,
  MAX(br.score) as max_score,
  MIN(br.score) as min_score,
  STDDEV(br.score) as score_stddev
FROM benchmarks b
LEFT JOIN benchmark_results br ON b.id = br.benchmark_id
GROUP BY b.id, b.name, b.type
ORDER BY b.name;

-- Create materialized view for aggregated statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_aggregated_statistics AS
SELECT 
  (SELECT COUNT(*) FROM models) as total_models,
  (SELECT COUNT(*) FROM benchmarks) as total_benchmarks,
  (SELECT COUNT(*) FROM benchmark_results) as total_results,
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT AVG(br.score) FROM benchmark_results br) as avg_score_all,
  (SELECT MAX(br.score) FROM benchmark_results br) as max_score_all,
  (SELECT MIN(br.score) FROM benchmark_results br) as min_score_all;

-- Create materialized view for leaderboard snapshot
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_leaderboard_snapshot AS
SELECT 
  m.id as model_id,
  m.name as model_name,
  o.name as organization_name,
  c.name as category_name,
  AVG(br.score) as avg_score,
  COUNT(br.id) as benchmark_count,
  m.github_stars,
  m.hf_downloads,
  ROW_NUMBER() OVER (ORDER BY AVG(br.score) DESC) as rank
FROM models m
LEFT JOIN organizations o ON m.organization_id = o.id
LEFT JOIN categories c ON m.category_id = c.id
LEFT JOIN benchmark_results br ON m.id = br.model_id
GROUP BY m.id, m.name, o.name, c.name, m.github_stars, m.hf_downloads
HAVING COUNT(br.id) > 0
ORDER BY avg_score DESC;

-- Create unique indexes for materialized views
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_model_rankings_unique ON mv_model_rankings_by_category (category_id, model_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_benchmark_summaries_unique ON mv_benchmark_summaries (benchmark_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_aggregated_stats_unique ON mv_aggregated_statistics ((1));
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_leaderboard_unique ON mv_leaderboard_snapshot (model_id);

-- Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_model_rankings_by_category;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_benchmark_summaries;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_aggregated_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_leaderboard_snapshot;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic refresh on data changes
CREATE OR REPLACE FUNCTION trigger_refresh_materialized_views()
RETURNS trigger AS $$
BEGIN
  -- Schedule refresh (in production, use a job queue or cron job)
  PERFORM pg_notify('materialized_views_refresh', TG_TABLE_NAME || ':' || TG_OP);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to relevant tables
DROP TRIGGER IF EXISTS trigger_models_refresh ON models;
CREATE TRIGGER trigger_models_refresh
  AFTER INSERT OR UPDATE OR DELETE ON models
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_materialized_views();

DROP TRIGGER IF EXISTS trigger_benchmarks_refresh ON benchmarks;
CREATE TRIGGER trigger_benchmarks_refresh
  AFTER INSERT OR UPDATE OR DELETE ON benchmarks
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_materialized_views();

DROP TRIGGER IF EXISTS trigger_benchmark_results_refresh ON benchmark_results;
CREATE TRIGGER trigger_benchmark_results_refresh
  AFTER INSERT OR UPDATE OR DELETE ON benchmark_results
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_materialized_views();

DROP TRIGGER IF EXISTS trigger_categories_refresh ON categories;
CREATE TRIGGER trigger_categories_refresh
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_materialized_views();
