"""Data extraction from Excel and CSV files."""

import pandas as pd
from pathlib import Path
from typing import Dict, Optional

from .logger import logger


def read_excel_file(file_path: str) -> Dict[str, pd.DataFrame]:
    """Read Excel file with multiple sheets.

    Args:
        file_path: Path to Excel file

    Returns:
        Dictionary mapping sheet names to DataFrames

    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file is not a valid Excel file
    """
    logger.info(f"Reading Excel file: {file_path}")

    if not Path(file_path).exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        # Read all sheets
        excel_data = pd.read_excel(file_path, sheet_name=None)
        logger.info(f"Successfully read {len(excel_data)} sheets from Excel file")
        return excel_data
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        raise ValueError(f"Invalid Excel file: {e}")


def read_csv_file(file_path: str) -> pd.DataFrame:
    """Read CSV file.

    Args:
        file_path: Path to CSV file

    Returns:
        DataFrame containing CSV data

    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file is not a valid CSV file
    """
    logger.info(f"Reading CSV file: {file_path}")

    if not Path(file_path).exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        df = pd.read_csv(file_path)
        logger.info(f"Successfully read CSV file with {len(df)} rows")
        return df
    except Exception as e:
        logger.error(f"Error reading CSV file: {e}")
        raise ValueError(f"Invalid CSV file: {e}")


def extract_data(file_path: str) -> Dict[str, pd.DataFrame]:
    """Extract data from file (auto-detect format).

    Args:
        file_path: Path to data file

    Returns:
        Dictionary mapping sheet names (for Excel) or 'data' (for CSV) to DataFrames

    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file format is not supported
    """
    file_ext = Path(file_path).suffix.lower()

    if file_ext in [".xlsx", ".xls"]:
        return read_excel_file(file_path)
    elif file_ext == ".csv":
        return {"data": read_csv_file(file_path)}
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")


def extract_sheet(excel_data: Dict[str, pd.DataFrame], sheet_name: str) -> Optional[pd.DataFrame]:
    """Extract specific sheet from Excel data.

    Args:
        excel_data: Dictionary of sheet names to DataFrames
        sheet_name: Name of sheet to extract

    Returns:
        DataFrame for requested sheet, or None if sheet doesn't exist
    """
    if sheet_name in excel_data:
        logger.info(f"Extracting sheet: {sheet_name}")
        return excel_data[sheet_name]
    else:
        logger.warning(f"Sheet not found: {sheet_name}")
        return None
