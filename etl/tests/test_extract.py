"""Tests for data extraction module."""

import pytest
import pandas as pd
from pathlib import Path
import tempfile
import os

from etl.extract import read_csv_file, extract_data
from etl.validate import ValidationError


def test_read_csv_file():
    """Test reading CSV file."""
    # Create temporary CSV file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("name,description\n")
        f.write("MMLU,Massive Multitask Language Understanding\n")
        f.write("HumanEval,Python coding problems\n")
        temp_file = f.name

    try:
        df = read_csv_file(temp_file)
        assert len(df) == 2
        assert "name" in df.columns
        assert "description" in df.columns
    finally:
        os.unlink(temp_file)


def test_read_csv_file_not_found():
    """Test reading non-existent CSV file."""
    with pytest.raises(FileNotFoundError):
        read_csv_file("nonexistent.csv")


def test_extract_data_csv():
    """Test extracting data from CSV file."""
    # Create temporary CSV file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("name,description\n")
        f.write("MMLU,Massive Multitask Language Understanding\n")
        temp_file = f.name

    try:
        data = extract_data(temp_file)
        assert "data" in data
        assert len(data["data"]) == 1
    finally:
        os.unlink(temp_file)


def test_extract_data_unsupported_format():
    """Test extracting data from unsupported file format."""
    with pytest.raises(ValueError):
        extract_data("test.txt")
