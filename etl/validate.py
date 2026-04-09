"""Data validation utilities for ETL pipeline."""

import pandas as pd
from typing import List, Dict, Any, Optional
from supabase import Client

from .logger import logger


class ValidationError(Exception):
    """Custom exception for validation errors."""

    pass


def validate_required_fields(df: pd.DataFrame, required_fields: List[str]) -> None:
    """Validate that required fields are present in DataFrame.

    Args:
        df: DataFrame to validate
        required_fields: List of required field names

    Raises:
        ValidationError: If required fields are missing
    """
    missing_fields = [field for field in required_fields if field not in df.columns]

    if missing_fields:
        error_msg = f"Missing required fields: {missing_fields}"
        logger.error(error_msg)
        raise ValidationError(error_msg)

    logger.info(f"All required fields present: {required_fields}")


def validate_data_types(df: pd.DataFrame, schema: Dict[str, str]) -> None:
    """Validate data types according to schema.

    Args:
        df: DataFrame to validate
        schema: Dictionary mapping field names to expected types
                ('str', 'int', 'float', 'date')

    Raises:
        ValidationError: If data types don't match schema
    """
    for field, expected_type in schema.items():
        if field not in df.columns:
            continue

        if expected_type == "str":
            if not df[field].dtype == "object":
                error_msg = f"Field '{field}' should be string type"
                logger.error(error_msg)
                raise ValidationError(error_msg)
        elif expected_type == "int":
            if not pd.api.types.is_integer_dtype(df[field]):
                error_msg = f"Field '{field}' should be integer type"
                logger.error(error_msg)
                raise ValidationError(error_msg)
        elif expected_type == "float":
            if not pd.api.types.is_numeric_dtype(df[field]):
                error_msg = f"Field '{field}' should be numeric type"
                logger.error(error_msg)
                raise ValidationError(error_msg)

    logger.info("Data types validated successfully")


def validate_foreign_keys(
    df: pd.DataFrame,
    supabase_client: Client,
    table: str,
    foreign_key_field: str,
    id_field: str = "id",
) -> None:
    """Validate that foreign key references exist in database.

    Args:
        df: DataFrame to validate
        supabase_client: Supabase client
        table: Table name to check
        foreign_key_field: Field name containing foreign key
        id_field: ID field name in referenced table

    Raises:
        ValidationError: If foreign key references don't exist
    """
    # Fetch all valid IDs from referenced table
    response = supabase_client.table(table).select(id_field).execute()
    valid_ids = {row[id_field] for row in response.data}

    # Check each foreign key
    invalid_refs = df[~df[foreign_key_field].isin(valid_ids)][foreign_key_field].unique()

    if len(invalid_refs) > 0:
        error_msg = f"Invalid foreign key references in '{foreign_key_field}': {invalid_refs}"
        logger.error(error_msg)
        raise ValidationError(error_msg)

    logger.info(f"Foreign key '{foreign_key_field}' validated successfully")


def check_duplicates(df: pd.DataFrame, key_columns: List[str]) -> None:
    """Check for duplicate rows based on key columns.

    Args:
        df: DataFrame to check
        key_columns: List of columns to use as key

    Raises:
        ValidationError: If duplicates found
    """
    duplicates = df.duplicated(subset=key_columns, keep=False)

    if duplicates.any():
        duplicate_rows = df[duplicates]
        error_msg = f"Found {len(duplicate_rows)} duplicate rows based on {key_columns}"
        logger.error(error_msg)
        raise ValidationError(error_msg)

    logger.info(f"No duplicates found based on {key_columns}")


def validate_model_data(df: pd.DataFrame) -> None:
    """Validate model data.

    Args:
        df: DataFrame containing model data

    Raises:
        ValidationError: If validation fails
    """
    required_fields = ["name"]
    validate_required_fields(df, required_fields)

    schema = {
        "name": "str",
        "parameters": "int",
    }
    validate_data_types(df, schema)

    logger.info("Model data validated successfully")


def validate_benchmark_data(df: pd.DataFrame) -> None:
    """Validate benchmark data.

    Args:
        df: DataFrame containing benchmark data

    Raises:
        ValidationError: If validation fails
    """
    required_fields = ["name"]
    validate_required_fields(df, required_fields)

    logger.info("Benchmark data validated successfully")


def validate_result_data(df: pd.DataFrame) -> None:
    """Validate benchmark result data.

    Args:
        df: DataFrame containing result data

    Raises:
        ValidationError: If validation fails
    """
    required_fields = ["model_name", "benchmark_name", "score"]
    validate_required_fields(df, required_fields)

    schema = {
        "score": "float",
    }
    validate_data_types(df, schema)

    logger.info("Result data validated successfully")


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean DataFrame by handling missing values and trimming strings.

    Args:
        df: DataFrame to clean

    Returns:
        Cleaned DataFrame
    """
    logger.info("Cleaning data")

    # Trim string columns
    string_cols = df.select_dtypes(include=["object"]).columns
    df[string_cols] = df[string_cols].apply(lambda x: x.str.strip() if x.dtype == "object" else x)

    # Remove rows with all NaN values
    df = df.dropna(how="all")

    logger.info(f"Data cleaned. {len(df)} rows remaining")

    return df
