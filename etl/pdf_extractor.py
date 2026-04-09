"""PDF extraction module for benchmark papers."""

import pdfplumber
from pathlib import Path
from typing import Optional, List, Dict, Any
from logger import get_logger

logger = get_logger(__name__)


class PDFExtractor:
    """Extract text and tables from PDF files."""

    def __init__(self):
        """Initialize the PDF extractor."""
        logger.info("Initialized PDF extractor")

    def extract_text(self, pdf_path: str) -> Optional[str]:
        """
        Extract text from a PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Extracted text or None if error
        """
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

            logger.info(f"Extracted {len(text)} characters from {pdf_path}")
            return text
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {e}")
            return None

    def extract_tables(self, pdf_path: str) -> List[List[List[str]]]:
        """
        Extract tables from a PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of tables (each table is a list of rows, each row is a list of cells)
        """
        try:
            tables = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)

            logger.info(f"Extracted {len(tables)} tables from {pdf_path}")
            return tables
        except Exception as e:
            logger.error(f"Error extracting tables from {pdf_path}: {e}")
            return []

    def is_scanned_pdf(self, pdf_path: str, threshold: int = 100) -> bool:
        """
        Determine if a PDF is scanned (has little text).

        Args:
            pdf_path: Path to the PDF file
            threshold: Minimum character count to consider PDF not scanned

        Returns:
            True if PDF appears to be scanned
        """
        try:
            text = self.extract_text(pdf_path)
            if text is None:
                return True

            # Count non-whitespace characters
            char_count = len(text.replace(" ", "").replace("\n", ""))
            is_scanned = char_count < threshold

            logger.info(f"PDF {pdf_path} char count: {char_count}, scanned: {is_scanned}")
            return is_scanned
        except Exception as e:
            logger.error(f"Error checking if PDF is scanned: {e}")
            return True

    def extract_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract metadata from PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with metadata
        """
        try:
            metadata = {}
            with pdfplumber.open(pdf_path) as pdf:
                metadata["page_count"] = len(pdf.pages)
                if pdf.metadata:
                    metadata["author"] = pdf.metadata.get("Author", "")
                    metadata["title"] = pdf.metadata.get("Title", "")
                    metadata["creator"] = pdf.metadata.get("Creator", "")
                    metadata["producer"] = pdf.metadata.get("Producer", "")

            logger.info(f"Extracted metadata from {pdf_path}")
            return metadata
        except Exception as e:
            logger.error(f"Error extracting metadata from {pdf_path}: {e}")
            return {}

    def extract_page_text(self, pdf_path: str, page_number: int) -> Optional[str]:
        """
        Extract text from a specific page.

        Args:
            pdf_path: Path to the PDF file
            page_number: Page number (0-indexed)

        Returns:
            Text from the page or None if error
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                if page_number >= len(pdf.pages):
                    logger.error(f"Page {page_number} out of range for {pdf_path}")
                    return None

                page = pdf.pages[page_number]
                text = page.extract_text()

            logger.info(f"Extracted text from page {page_number} of {pdf_path}")
            return text
        except Exception as e:
            logger.error(f"Error extracting text from page {page_number}: {e}")
            return None
