# Database Schema

## Tables

### Organizations
Stores organizations that create AI models.

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL, UNIQUE)
- `website` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Categories
Categories for AI models (LLM, Code, Vision, etc.).

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL, UNIQUE)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Models
AI model information.

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL)
- `organization_id` (UUID, FK to organizations)
- `category_id` (UUID, FK to categories)
- `parameters` (BIGINT) - Model parameter count
- `release_date` (DATE)
- `description` (TEXT)
- `github_url` (TEXT)
- `huggingface_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_models_name` on `name`
- `idx_models_organization` on `organization_id`
- `idx_models_category` on `category_id`
- `idx_models_release_date` on `release_date`

### Benchmarks
Benchmark definitions (MMLU, HumanEval, etc.).

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL, UNIQUE)
- `description` (TEXT)
- `type` (TEXT)
- `unit` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Benchmark Results
Benchmark scores for models.

**Columns:**
- `id` (UUID, PK)
- `model_id` (UUID, FK to models)
- `benchmark_id` (UUID, FK to benchmarks)
- `score` (NUMERIC)
- `date_recorded` (DATE)
- `source` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_benchmark_results_model` on `model_id`
- `idx_benchmark_results_benchmark` on `benchmark_id`
- `idx_benchmark_results_score` on `score`

### User Profiles
User profile information.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Row Level Security (RLS)

All tables have public read access policies:
- `Public can view organizations`
- `Public can view categories`
- `Public can view models`
- `Public can view benchmarks`
- `Public can view benchmark_results`

User profiles have user-specific access:
- `Users can view own profile`
- `Users can insert own profile`
- `Users can update own profile`
