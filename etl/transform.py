"""Data transformation utilities for ETL pipeline."""

import pandas as pd
from typing import Dict, Optional
from supabase import Client

from .logger import logger


def normalize_model_data(
    df: pd.DataFrame,
    supabase_client: Optional[Client] = None,
) -> pd.DataFrame:
    """Normalize model data to match database schema.

    Args:
        df: DataFrame containing model data
        supabase_client: Supabase client for mapping organization IDs

    Returns:
        Normalized DataFrame
    """
    logger.info("Normalizing model data")

    # Rename columns to match database schema
    column_mapping = {
        "organization": "organization_name",
        "category": "category_name",
    }
    df = df.rename(columns=column_mapping)

    # Convert parameter count to integer
    if "parameters" in df.columns:
        df["parameters"] = pd.to_numeric(df["parameters"], errors="coerce").astype("Int64")

    # Convert release date to datetime
    if "release_date" in df.columns:
        df["release_date"] = pd.to_datetime(df["release_date"], errors="coerce")

    logger.info(f"Model data normalized. {len(df)} rows")

    return df


def normalize_benchmark_data(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize benchmark data to match database schema.

    Args:
        df: DataFrame containing benchmark data

    Returns:
        Normalized DataFrame
    """
    logger.info("Normalizing benchmark data")

    # No specific transformations needed for benchmarks
    # Just ensure data types are correct

    logger.info(f"Benchmark data normalized. {len(df)} rows")

    return df


def normalize_result_data(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize benchmark result data to match database schema.

    Args:
        df: DataFrame containing result data

    Returns:
        Normalized DataFrame
    """
    logger.info("Normalizing result data")

    # Rename columns to match database schema
    column_mapping = {
        "model_name": "model_name",
        "benchmark_name": "benchmark_name",
    }
    df = df.rename(columns=column_mapping)

    # Convert score to numeric
    if "score" in df.columns:
        df["score"] = pd.to_numeric(df["score"], errors="coerce")

    # Convert date to datetime
    if "date_recorded" in df.columns:
        df["date_recorded"] = pd.to_datetime(df["date_recorded"], errors="coerce")

    logger.info(f"Result data normalized. {len(df)} rows")

    return df


def map_organization_names(df: pd.DataFrame, supabase_client: Client) -> pd.DataFrame:
    """Map organization names to IDs.

    Args:
        df: DataFrame with organization_name column
        supabase_client: Supabase client

    Returns:
        DataFrame with organization_id column added
    """
    logger.info("Mapping organization names to IDs")

    if "organization_name" not in df.columns:
        return df

    # Fetch all organizations from database
    response = supabase_client.table("organizations").select("id, name").execute()
    org_map = {row["name"]: row["id"] for row in response.data}

    # Map names to IDs
    df["organization_id"] = df["organization_name"].map(org_map)

    # Log unmapped organizations
    unmapped = df[df["organization_id"].isna()]["organization_name"].unique()
    if len(unmapped) > 0:
        logger.warning(f"Unmapped organizations: {unmapped}")

    logger.info(f"Mapped {len(df) - df['organization_id'].isna().sum()} organizations")

    return df


def map_category_names(df: pd.DataFrame, supabase_client: Client) -> pd.DataFrame:
    """Map category names to IDs.

    Args:
        df: DataFrame with category_name column
        supabase_client: Supabase client

    Returns:
        DataFrame with category_id column added
    """
    logger.info("Mapping category names to IDs")

    if "category_name" not in df.columns:
        return df

    # Fetch all categories from database
    response = supabase_client.table("categories").select("id, name").execute()
    cat_map = {row["name"]: row["id"] for row in response.data}

    # Map names to IDs
    df["category_id"] = df["category_name"].map(cat_map)

    # Log unmapped categories
    unmapped = df[df["category_id"].isna()]["category_name"].unique()
    if len(unmapped) > 0:
        logger.warning(f"Unmapped categories: {unmapped}")

    logger.info(f"Mapped {len(df) - df['category_id'].isna().sum()} categories")

    return df


def map_model_names(df: pd.DataFrame, supabase_client: Client) -> pd.DataFrame:
    """Map model names to IDs.

    Args:
        df: DataFrame with model_name column
        supabase_client: Supabase client

    Returns:
        DataFrame with model_id column added
    """
    logger.info("Mapping model names to IDs")

    if "model_name" not in df.columns:
        return df

    # Fetch all models from database
    response = supabase_client.table("models").select("id, name").execute()
    model_map = {row["name"]: row["id"] for row in response.data}

    # Map names to IDs
    df["model_id"] = df["model_name"].map(model_map)

    # Log unmapped models
    unmapped = df[df["model_id"].isna()]["model_name"].unique()
    if len(unmapped) > 0:
        logger.warning(f"Unmapped models: {unmapped}")

    logger.info(f"Mapped {len(df) - df['model_id'].isna().sum()} models")

    return df


def map_benchmark_names(df: pd.DataFrame, supabase_client: Client) -> pd.DataFrame:
    """Map benchmark names to IDs.

    Args:
        df: DataFrame with benchmark_name column
        supabase_client: Supabase client

    Returns:
        DataFrame with benchmark_id column added
    """
    logger.info("Mapping benchmark names to IDs")

    if "benchmark_name" not in df.columns:
        return df

    # Fetch all benchmarks from database
    response = supabase_client.table("benchmarks").select("id, name").execute()
    benchmark_map = {row["name"]: row["id"] for row in response.data}

    # Map names to IDs
    df["benchmark_id"] = df["benchmark_name"].map(benchmark_map)

    # Log unmapped benchmarks
    unmapped = df[df["benchmark_id"].isna()]["benchmark_name"].unique()
    if len(unmapped) > 0:
        logger.warning(f"Unmapped benchmarks: {unmapped}")

    logger.info(f"Mapped {len(df) - df['benchmark_id'].isna().sum()} benchmarks")

    return df
