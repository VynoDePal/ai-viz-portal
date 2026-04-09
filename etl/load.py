"""Data loading utilities for ETL pipeline."""

import pandas as pd
from typing import List, Dict, Any
from supabase import Client

from .logger import logger


def load_organizations(df: pd.DataFrame, supabase_client: Client) -> int:
    """Load organizations into database.

    Args:
        df: DataFrame containing organization data
        supabase_client: Supabase client

    Returns:
        Number of rows loaded
    """
    logger.info(f"Loading {len(df)} organizations")

    # Convert DataFrame to list of dictionaries
    records = df.to_dict("records")

    # Filter out existing organizations
    existing_names = set()
    response = supabase_client.table("organizations").select("name").execute()
    existing_names = {row["name"] for row in response.data}

    new_records = [r for r in records if r["name"] not in existing_names]

    if not new_records:
        logger.info("No new organizations to load")
        return 0

    # Load new organizations
    try:
        response = supabase_client.table("organizations").insert(new_records).execute()
        loaded_count = len(response.data)
        logger.info(f"Successfully loaded {loaded_count} organizations")
        return loaded_count
    except Exception as e:
        logger.error(f"Error loading organizations: {e}")
        raise


def load_categories(df: pd.DataFrame, supabase_client: Client) -> int:
    """Load categories into database.

    Args:
        df: DataFrame containing category data
        supabase_client: Supabase client

    Returns:
        Number of rows loaded
    """
    logger.info(f"Loading {len(df)} categories")

    # Convert DataFrame to list of dictionaries
    records = df.to_dict("records")

    # Filter out existing categories
    existing_names = set()
    response = supabase_client.table("categories").select("name").execute()
    existing_names = {row["name"] for row in response.data}

    new_records = [r for r in records if r["name"] not in existing_names]

    if not new_records:
        logger.info("No new categories to load")
        return 0

    # Load new categories
    try:
        response = supabase_client.table("categories").insert(new_records).execute()
        loaded_count = len(response.data)
        logger.info(f"Successfully loaded {loaded_count} categories")
        return loaded_count
    except Exception as e:
        logger.error(f"Error loading categories: {e}")
        raise


def load_models(df: pd.DataFrame, supabase_client: Client) -> int:
    """Load models into database.

    Args:
        df: DataFrame containing model data
        supabase_client: Supabase client

    Returns:
        Number of rows loaded
    """
    logger.info(f"Loading {len(df)} models")

    # Convert DataFrame to list of dictionaries
    records = df.to_dict("records")

    # Filter out existing models
    existing_models = set()
    response = supabase_client.table("models").select("name, organization_id").execute()
    existing_models = {(row["name"], row.get("organization_id")) for row in response.data}

    new_records = []
    for r in records:
        key = (r["name"], r.get("organization_id"))
        if key not in existing_models:
            new_records.append(r)

    if not new_records:
        logger.info("No new models to load")
        return 0

    # Load new models
    try:
        response = supabase_client.table("models").insert(new_records).execute()
        loaded_count = len(response.data)
        logger.info(f"Successfully loaded {loaded_count} models")
        return loaded_count
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise


def load_benchmarks(df: pd.DataFrame, supabase_client: Client) -> int:
    """Load benchmarks into database.

    Args:
        df: DataFrame containing benchmark data
        supabase_client: Supabase client

    Returns:
        Number of rows loaded
    """
    logger.info(f"Loading {len(df)} benchmarks")

    # Convert DataFrame to list of dictionaries
    records = df.to_dict("records")

    # Filter out existing benchmarks
    existing_names = set()
    response = supabase_client.table("benchmarks").select("name").execute()
    existing_names = {row["name"] for row in response.data}

    new_records = [r for r in records if r["name"] not in existing_names]

    if not new_records:
        logger.info("No new benchmarks to load")
        return 0

    # Load new benchmarks
    try:
        response = supabase_client.table("benchmarks").insert(new_records).execute()
        loaded_count = len(response.data)
        logger.info(f"Successfully loaded {loaded_count} benchmarks")
        return loaded_count
    except Exception as e:
        logger.error(f"Error loading benchmarks: {e}")
        raise


def load_results(df: pd.DataFrame, supabase_client: Client) -> int:
    """Load benchmark results into database.

    Args:
        df: DataFrame containing result data
        supabase_client: Supabase client

    Returns:
        Number of rows loaded
    """
    logger.info(f"Loading {len(df)} benchmark results")

    # Convert DataFrame to list of dictionaries
    records = df.to_dict("records")

    # Filter out existing results
    existing_results = set()
    response = supabase_client.table("benchmark_results").select(
        "model_id", "benchmark_id", "date_recorded"
    ).execute()
    existing_results = {
        (row["model_id"], row["benchmark_id"], str(row["date_recorded"])) for row in response.data
    }

    new_records = []
    for r in records:
        key = (r["model_id"], r["benchmark_id"], str(r.get("date_recorded")))
        if key not in existing_results:
            new_records.append(r)

    if not new_records:
        logger.info("No new benchmark results to load")
        return 0

    # Load new results
    try:
        response = supabase_client.table("benchmark_results").insert(new_records).execute()
        loaded_count = len(response.data)
        logger.info(f"Successfully loaded {loaded_count} benchmark results")
        return loaded_count
    except Exception as e:
        logger.error(f"Error loading benchmark results: {e}")
        raise
