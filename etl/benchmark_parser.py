"""Benchmark data parsing module for extracted PDF text."""

import re
from typing import List, Dict, Any, Optional
from logger import get_logger

logger = get_logger(__name__)


class BenchmarkParser:
    """Parse benchmark data from extracted text."""

    def __init__(self):
        """Initialize the benchmark parser."""
        self.model_patterns = [
            r"(GPT-\d+(\.\d+)?)",
            r"(Claude\s*\d+(\.\d+)?)",
            r"(Llama\s*\d+(\.\d+)?)",
            r"(Gemini\s*(Pro|Ultra)?)",
            r"(PaLM\s*\d)",
            r"(Flan-\w+)",
            r"(T5-\w+)",
            r"(BERT-(base|large|small))",
        ]
        self.benchmark_patterns = [
            r"(MMLU)",
            r"(HumanEval)",
            r"(GSM8K)",
            r"(HellaSwag)",
            r"(PIQA)",
            r"(ARC-(easy|challenge))",
            r"(Winogrande)",
            r"(TriviaQA)",
        ]

        logger.info("Initialized benchmark parser")

    def parse_model_scores(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse model names and scores from text.

        Args:
            text: Extracted text from PDF

        Returns:
            List of dicts with model_name, score, benchmark
        """
        results = []

        # Pattern for model names with scores
        # Examples: "GPT-4: 86.4%", "Claude 3 Opus 86.8%"
        score_pattern = r"([A-Za-z0-9\s\-\.]+)\s*[:]\s*(\d+\.?\d*)%?"

        matches = re.finditer(score_pattern, text, re.IGNORECASE)

        for match in matches:
            model_name = match.group(1).strip()
            score = float(match.group(2))

            # Try to identify benchmark from context
            benchmark = self._identify_benchmark(text, match.start())

            results.append({
                "model_name": model_name,
                "score": score,
                "benchmark": benchmark,
                "needs_review": True,  # Mark for manual review
            })

        logger.info(f"Parsed {len(results)} model-score pairs")
        return results

    def parse_benchmark_tables(self, tables: List[List[List[str]]]) -> List[Dict[str, Any]]:
        """
        Parse benchmark data from extracted tables.

        Args:
            tables: List of tables from PDF

        Returns:
            List of dicts with model_name, score, benchmark
        """
        results = []

        for table in tables:
            if not table or len(table) < 2:
                continue

            # Try to identify header row
            header = table[0]
            model_col = self._find_column(header, ["model", "name"])
            score_col = self._find_column(header, ["score", "accuracy", "performance"])
            benchmark_col = self._find_column(header, ["benchmark", "task"])

            if model_col is not None and score_col is not None:
                # Parse data rows
                for row in table[1:]:
                    if len(row) > max(model_col, score_col):
                        model_name = row[model_col]
                        score_str = row[score_col]

                        # Extract score from string
                        score_match = re.search(r"(\d+\.?\d*)", str(score_str))
                        if score_match:
                            score = float(score_match.group(1))

                            benchmark = None
                            if benchmark_col is not None and benchmark_col < len(row):
                                benchmark = row[benchmark_col]

                            results.append({
                                "model_name": model_name,
                                "score": score,
                                "benchmark": benchmark,
                                "needs_review": True,
                            })

        logger.info(f"Parsed {len(results)} entries from tables")
        return results

    def _identify_benchmark(self, text: str, position: int) -> Optional[str]:
        """
        Identify benchmark name from text context.

        Args:
            text: Full text
            position: Position of the match

        Returns:
            Benchmark name or None
        """
        # Look for benchmark names in surrounding text
        context_start = max(0, position - 200)
        context_end = min(len(text), position + 200)
        context = text[context_start:context_end]

        for pattern in self.benchmark_patterns:
            match = re.search(pattern, context, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _find_column(self, header: List[str], keywords: List[str]) -> Optional[int]:
        """
        Find column index by keywords.

        Args:
            header: Header row
            keywords: List of keywords to search for

        Returns:
            Column index or None
        """
        for i, cell in enumerate(header):
            cell_lower = str(cell).lower()
            for keyword in keywords:
                if keyword.lower() in cell_lower:
                    return i
        return None

    def extract_metadata(self, text: str) -> Dict[str, Any]:
        """
        Extract metadata from paper text.

        Args:
            text: Extracted text from PDF

        Returns:
            Dictionary with metadata
        """
        metadata = {}

        # Extract paper title (usually first line or after "Title:")
        lines = text.split("\n")
        if lines:
            metadata["title"] = lines[0].strip()

        # Extract authors (look for "Authors:" or common patterns)
        author_pattern = r"(?:Authors?[:]\s*)(.+?)(?:\n|$)"
        author_match = re.search(author_pattern, text, re.IGNORECASE)
        if author_match:
            metadata["authors"] = author_match.group(1).strip()

        # Extract publication date
        date_pattern = r"(?:Date|Published)[:]\s*(\d{4}[-/]\d{2}[-/]\d{2})"
        date_match = re.search(date_pattern, text, re.IGNORECASE)
        if date_match:
            metadata["publication_date"] = date_match.group(1)

        # Extract arXiv ID
        arxiv_pattern = r"arXiv[:]\s*(\d{4}\.\d{4,5})"
        arxiv_match = re.search(arxiv_pattern, text)
        if arxiv_match:
            metadata["arxiv_id"] = arxiv_match.group(1)

        logger.info(f"Extracted metadata: {metadata}")
        return metadata

    def export_for_review(self, data: List[Dict[str, Any]], output_path: str) -> None:
        """
        Export parsed data for manual review.

        Args:
            data: Parsed data
            output_path: Path to output file (CSV or JSON)
        """
        import json
        import csv

        if output_path.endswith(".json"):
            with open(output_path, "w") as f:
                json.dump(data, f, indent=2)
        elif output_path.endswith(".csv"):
            if data:
                with open(output_path, "w", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)

        logger.info(f"Exported {len(data)} entries to {output_path}")

    def import_reviewed_data(self, input_path: str) -> List[Dict[str, Any]]:
        """
        Import manually reviewed data.

        Args:
            input_path: Path to reviewed data file (CSV or JSON)

        Returns:
            List of reviewed data
        """
        import json
        import csv

        if input_path.endswith(".json"):
            with open(input_path, "r") as f:
                data = json.load(f)
        elif input_path.endswith(".csv"):
            data = []
            with open(input_path, "r", newline="") as f:
                reader = csv.DictReader(f)
                data = list(reader)
        else:
            logger.error(f"Unsupported file format: {input_path}")
            return []

        logger.info(f"Imported {len(data)} reviewed entries from {input_path}")
        return data
