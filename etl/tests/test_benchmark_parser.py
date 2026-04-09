"""Unit tests for benchmark parser module."""

import pytest
from benchmark_parser import BenchmarkParser


@pytest.fixture
def parser():
    """Create a benchmark parser instance."""
    return BenchmarkParser()


def test_parse_model_scores(parser):
    """Test parsing model scores from text."""
    text = "GPT-4: 86.4% on MMLU, Claude 3 Opus: 86.8% on HumanEval"
    results = parser.parse_model_scores(text)

    assert len(results) == 2
    assert results[0]["model_name"] == "GPT-4"
    assert results[0]["score"] == 86.4
    assert results[1]["model_name"] == "Claude 3 Opus"
    assert results[1]["score"] == 86.8


def test_parse_model_scores_with_benchmark(parser):
    """Test parsing with benchmark identification."""
    text = "GPT-4: 86.4% on MMLU benchmark"
    results = parser.parse_model_scores(text)

    assert len(results) == 1
    assert results[0]["model_name"] == "GPT-4"
    assert results[0]["score"] == 86.4
    assert results[0]["benchmark"] == "MMLU"


def test_parse_benchmark_tables(parser):
    """Test parsing benchmark tables."""
    tables = [
        [
            ["Model", "Score", "Benchmark"],
            ["GPT-4", "86.4", "MMLU"],
            ["Claude 3", "86.8", "HumanEval"],
        ]
    ]

    results = parser.parse_benchmark_tables(tables)

    assert len(results) == 2
    assert results[0]["model_name"] == "GPT-4"
    assert results[0]["score"] == 86.4
    assert results[0]["benchmark"] == "MMLU"


def test_extract_metadata(parser):
    """Test extracting metadata from paper text."""
    text = """Title: AI Benchmark Results
Authors: John Doe, Jane Smith
Date: 2024-01-15
arXiv: 2401.12345

This paper presents benchmark results..."""

    metadata = parser.extract_metadata(text)

    assert metadata["title"] == "Title: AI Benchmark Results"
    assert metadata["authors"] == "John Doe, Jane Smith"
    assert metadata["publication_date"] == "2024-01-15"
    assert metadata["arxiv_id"] == "2401.12345"


def test_export_for_review(parser, tmp_path):
    """Test exporting data for manual review."""
    data = [
        {"model_name": "GPT-4", "score": 86.4, "benchmark": "MMLU", "needs_review": True},
    ]

    output_path = tmp_path / "review.json"
    parser.export_for_review(data, str(output_path))

    assert output_path.exists()
