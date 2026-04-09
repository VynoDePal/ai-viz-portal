"""Tests for data validation module."""

import pytest
import pandas as pd

from etl.validate import (
    validate_required_fields,
    validate_data_types,
    check_duplicates,
    validate_model_data,
    validate_benchmark_data,
    validate_result_data,
    clean_data,
    ValidationError,
)


def test_validate_required_fields_success():
    """Test validation with all required fields present."""
    df = pd.DataFrame({"name": ["GPT-4", "Claude"], "description": ["Model 1", "Model 2"]})
    validate_required_fields(df, ["name"])
    # Should not raise exception


def test_validate_required_fields_missing():
    """Test validation with missing required fields."""
    df = pd.DataFrame({"description": ["Model 1", "Model 2"]})
    with pytest.raises(ValidationError):
        validate_required_fields(df, ["name"])


def test_validate_data_types():
    """Test data type validation."""
    df = pd.DataFrame({
        "name": ["GPT-4"],
        "parameters": [1760000000000],
    })
    schema = {"name": "str", "parameters": "int"}
    validate_data_types(df, schema)
    # Should not raise exception


def test_check_duplicates_no_duplicates():
    """Test duplicate check with no duplicates."""
    df = pd.DataFrame({
        "name": ["GPT-4", "Claude"],
        "organization": ["OpenAI", "Anthropic"],
    })
    check_duplicates(df, ["name"])
    # Should not raise exception


def test_check_duplicates_with_duplicates():
    """Test duplicate check with duplicates."""
    df = pd.DataFrame({
        "name": ["GPT-4", "GPT-4"],
        "organization": ["OpenAI", "OpenAI"],
    })
    with pytest.raises(ValidationError):
        check_duplicates(df, ["name"])


def test_validate_model_data():
    """Test model data validation."""
    df = pd.DataFrame({
        "name": ["GPT-4"],
        "parameters": [1760000000000],
    })
    validate_model_data(df)
    # Should not raise exception


def test_validate_benchmark_data():
    """Test benchmark data validation."""
    df = pd.DataFrame({
        "name": ["MMLU"],
        "description": ["Massive Multitask Language Understanding"],
    })
    validate_benchmark_data(df)
    # Should not raise exception


def test_validate_result_data():
    """Test result data validation."""
    df = pd.DataFrame({
        "model_name": ["GPT-4"],
        "benchmark_name": ["MMLU"],
        "score": [86.4],
    })
    validate_result_data(df)
    # Should not raise exception


def test_clean_data():
    """Test data cleaning."""
    df = pd.DataFrame({
        "name": ["  GPT-4  ", "  Claude  "],
        "description": ["Model 1", "Model 2"],
    })
    cleaned = clean_data(df)
    assert cleaned["name"].iloc[0] == "GPT-4"
    assert cleaned["name"].iloc[1] == "Claude"
