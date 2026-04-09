"""OCR processing module for scanned PDFs."""

import pytesseract
from pdf2image import convert_from_path
from pathlib import Path
from typing import Optional, List
from logger import get_logger

logger = get_logger(__name__)


class OCRProcessor:
    """Process scanned PDFs using OCR."""

    def __init__(self, tesseract_path: Optional[str] = None):
        """
        Initialize the OCR processor.

        Args:
            tesseract_path: Path to Tesseract executable (optional)
        """
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

        logger.info("Initialized OCR processor")

    def perform_ocr(self, pdf_path: str, first_page: int = 1, last_page: Optional[int] = None) -> Optional[str]:
        """
        Perform OCR on a PDF file.

        Args:
            pdf_path: Path to the PDF file
            first_page: First page to process (1-indexed)
            last_page: Last page to process (optional, processes all if None)

        Returns:
            OCR text or None if error
        """
        try:
            logger.info(f"Starting OCR for {pdf_path}")

            # Convert PDF to images
            images = convert_from_path(
                pdf_path,
                first_page=first_page,
                last_page=last_page,
                dpi=300,
            )

            # Perform OCR on each image
            text = ""
            for i, image in enumerate(images):
                page_num = first_page + i
                page_text = pytesseract.image_to_string(image)
                text += f"--- Page {page_num} ---\n{page_text}\n"
                logger.info(f"OCR completed for page {page_num}")

            logger.info(f"OCR completed for {len(images)} pages")
            return text
        except Exception as e:
            logger.error(f"Error performing OCR on {pdf_path}: {e}")
            return None

    def perform_ocr_on_page(self, pdf_path: str, page_number: int) -> Optional[str]:
        """
        Perform OCR on a specific page.

        Args:
            pdf_path: Path to the PDF file
            page_number: Page number (1-indexed)

        Returns:
            OCR text for the page or None if error
        """
        try:
            logger.info(f"Starting OCR for page {page_number} of {pdf_path}")

            images = convert_from_path(pdf_path, first_page=page_number, last_page=page_number, dpi=300)

            if not images:
                logger.error(f"No images extracted for page {page_number}")
                return None

            text = pytesseract.image_to_string(images[0])
            logger.info(f"OCR completed for page {page_number}")

            return text
        except Exception as e:
            logger.error(f"Error performing OCR on page {page_number}: {e}")
            return None

    def check_tesseract_available(self) -> bool:
        """
        Check if Tesseract OCR is available.

        Returns:
            True if Tesseract is available
        """
        try:
            pytesseract.get_tesseract_version()
            logger.info("Tesseract OCR is available")
            return True
        except Exception as e:
            logger.error(f"Tesseract OCR not available: {e}")
            return False
