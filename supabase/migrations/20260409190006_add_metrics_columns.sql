-- Add github_stars column to models table
ALTER TABLE models ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0;

-- Add hf_downloads column to models table
ALTER TABLE models ADD COLUMN IF NOT EXISTS hf_downloads INTEGER DEFAULT 0;

-- Add last_updated column for metrics
ALTER TABLE models ADD COLUMN IF NOT EXISTS metrics_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();
