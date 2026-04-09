"""Main ETL pipeline script."""

import argparse
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

from .extract import extract_data, extract_sheet
from .transform import (
    normalize_model_data,
    normalize_benchmark_data,
    normalize_result_data,
    map_organization_names,
    map_category_names,
    map_model_names,
    map_benchmark_names,
)
from .validate import (
    validate_model_data,
    validate_benchmark_data,
    validate_result_data,
    clean_data,
    ValidationError,
)
from .load import (
    load_organizations,
    load_categories,
    load_models,
    load_benchmarks,
    load_results,
)
from .logger import logger


def run_etl_pipeline(file_path: str, supabase_client) -> None:
    """Run the complete ETL pipeline.

    Args:
        file_path: Path to input file (Excel or CSV)
        supabase_client: Supabase client
    """
    logger.info("Starting ETL pipeline")

    try:
        # Extract data
        data = extract_data(file_path)

        # Process organizations sheet if present
        if "organizations" in data:
            logger.info("Processing organizations")
            df_org = clean_data(data["organizations"])
            validate_required_fields(df_org, ["name"])
            loaded = load_organizations(df_org, supabase_client)
            logger.info(f"Loaded {loaded} organizations")

        # Process categories sheet if present
        if "categories" in data:
            logger.info("Processing categories")
            df_cat = clean_data(data["categories"])
            validate_required_fields(df_cat, ["name"])
            loaded = load_categories(df_cat, supabase_client)
            logger.info(f"Loaded {loaded} categories")

        # Process models sheet if present
        if "models" in data:
            logger.info("Processing models")
            df_models = clean_data(data["models"])
            validate_model_data(df_models)
            df_models = normalize_model_data(df_models, supabase_client)
            df_models = map_organization_names(df_models, supabase_client)
            df_models = map_category_names(df_models, supabase_client)
            loaded = load_models(df_models, supabase_client)
            logger.info(f"Loaded {loaded} models")

        # Process benchmarks sheet if present
        if "benchmarks" in data:
            logger.info("Processing benchmarks")
            df_benchmarks = clean_data(data["benchmarks"])
            validate_benchmark_data(df_benchmarks)
            df_benchmarks = normalize_benchmark_data(df_benchmarks)
            loaded = load_benchmarks(df_benchmarks, supabase_client)
            logger.info(f"Loaded {loaded} benchmarks")

        # Process results sheet if present
        if "results" in data:
            logger.info("Processing benchmark results")
            df_results = clean_data(data["results"])
            validate_result_data(df_results)
            df_results = normalize_result_data(df_results)
            df_results = map_model_names(df_results, supabase_client)
            df_results = map_benchmark_names(df_results, supabase_client)
            loaded = load_results(df_results, supabase_client)
            logger.info(f"Loaded {loaded} benchmark results")

        logger.info("ETL pipeline completed successfully")

    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"ETL pipeline failed: {e}")
        sys.exit(1)


def main():
    """Main entry point for ETL pipeline."""
    parser = argparse.ArgumentParser(description="ETL pipeline for AI model benchmark data")
    parser.add_argument("--input", required=True, help="Path to input file (Excel or CSV)")
    args = parser.parse_args()

    # Load environment variables
    load_dotenv()

    # Get Supabase credentials
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        logger.error("Missing Supabase credentials in environment variables")
        sys.exit(1)

    # Create Supabase client
    supabase_client = create_client(supabase_url, supabase_key)

    # Run ETL pipeline
    run_etl_pipeline(args.input, supabase_client)


if __name__ == "__main__":
    main()
