"""Main ETL pipeline script."""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional
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
from .huggingface_fetcher import HuggingFaceFetcher
from .pdf_extractor import PDFExtractor
from .ocr_processor import OCRProcessor
from .benchmark_parser import BenchmarkParser


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


def run_huggingface_fetch(model_id: Optional[str] = None, limit: int = 50, supabase_client=None) -> None:
    """Fetch data from HuggingFace and load into database.

    Args:
        model_id: Specific model ID to fetch (optional)
        limit: Maximum number of popular models to fetch
        supabase_client: Supabase client
    """
    logger.info("Starting HuggingFace data fetch")

    try:
        # Initialize fetcher
        api_key = os.getenv("HF_API_KEY")
        fetcher = HuggingFaceFetcher(api_key=api_key)

        if model_id:
            # Fetch specific model
            logger.info(f"Fetching data for model: {model_id}")
            model_data = fetcher.fetch_model_metadata(model_id)
            if model_data:
                # Load into database (implementation would go here)
                logger.info(f"Successfully fetched data for {model_id}")
            else:
                logger.error(f"Failed to fetch data for {model_id}")
        else:
            # Fetch popular models
            logger.info(f"Fetching {limit} popular models")
            models = fetcher.fetch_popular_models(limit=limit)
            logger.info(f"Successfully fetched {len(models)} models")

            # Load into database (implementation would go here)
            for model in models:
                logger.info(f"Model: {model.get('name')}")

        logger.info("HuggingFace fetch completed successfully")

    except Exception as e:
        logger.error(f"HuggingFace fetch failed: {e}")
        sys.exit(1)


def run_pdf_ocr_processing(pdf_path: str, output_path: Optional[str] = None, use_ocr: bool = False) -> None:
    """Process PDF file to extract benchmark data.

    Args:
        pdf_path: Path to PDF file
        output_path: Path to output file for manual review (optional)
        use_ocr: Whether to use OCR for scanned PDFs
    """
    logger.info(f"Starting PDF/OCR processing for {pdf_path}")

    try:
        # Initialize processors
        pdf_extractor = PDFExtractor()
        benchmark_parser = BenchmarkParser()

        # Check if PDF is scanned
        is_scanned = pdf_extractor.is_scanned_pdf(pdf_path)

        if is_scanned and use_ocr:
            logger.info("PDF appears to be scanned, using OCR")
            ocr_processor = OCRProcessor()

            if not ocr_processor.check_tesseract_available():
                logger.error("Tesseract OCR not available")
                sys.exit(1)

            text = ocr_processor.perform_ocr(pdf_path)
        else:
            logger.info("Extracting text from PDF")
            text = pdf_extractor.extract_text(pdf_path)

        if not text:
            logger.error("Failed to extract text from PDF")
            sys.exit(1)

        # Parse benchmark data
        logger.info("Parsing benchmark data")
        model_scores = benchmark_parser.parse_model_scores(text)

        # Extract tables
        tables = pdf_extractor.extract_tables(pdf_path)
        if tables:
            table_data = benchmark_parser.parse_benchmark_tables(tables)
            model_scores.extend(table_data)

        # Extract metadata
        metadata = benchmark_parser.extract_metadata(text)

        logger.info(f"Extracted {len(model_scores)} benchmark entries")
        logger.info(f"Metadata: {metadata}")

        # Export for manual review if output path provided
        if output_path:
            benchmark_parser.export_for_review(model_scores, output_path)
            logger.info(f"Data exported to {output_path} for manual review")

        logger.info("PDF/OCR processing completed successfully")

    except Exception as e:
        logger.error(f"PDF/OCR processing failed: {e}")
        sys.exit(1)


def main():
    """Main entry point for ETL pipeline."""
    parser = argparse.ArgumentParser(description="ETL pipeline for AI model benchmark data")
    parser.add_argument("--input", help="Path to input file (Excel or CSV)")
    parser.add_argument("--huggingface", action="store_true", help="Fetch data from HuggingFace")
    parser.add_argument("--model-id", help="Specific HuggingFace model ID to fetch")
    parser.add_argument("--limit", type=int, default=50, help="Maximum models to fetch from HuggingFace")
    parser.add_argument("--pdf", help="Path to PDF file for benchmark extraction")
    parser.add_argument("--output", help="Path to output file for manual review")
    parser.add_argument("--use-ocr", action="store_true", help="Use OCR for scanned PDFs")
    args = parser.parse_args()

    # Load environment variables
    load_dotenv()

    # Run appropriate pipeline
    if args.huggingface:
        # Get Supabase credentials
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not supabase_url or not supabase_key:
            logger.error("Missing Supabase credentials in environment variables")
            sys.exit(1)

        supabase_client = create_client(supabase_url, supabase_key)
        run_huggingface_fetch(args.model_id, args.limit, supabase_client)
    elif args.pdf:
        run_pdf_ocr_processing(args.pdf, args.output, args.use_ocr)
    elif args.input:
        # Get Supabase credentials
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not supabase_url or not supabase_key:
            logger.error("Missing Supabase credentials in environment variables")
            sys.exit(1)

        supabase_client = create_client(supabase_url, supabase_key)
        run_etl_pipeline(args.input, supabase_client)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
