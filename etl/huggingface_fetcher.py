"""Fetch and transform HuggingFace model data for database insertion."""

import re
from typing import Any, Dict, List, Optional
from huggingface_client import HuggingFaceClient
from huggingface_cache import HuggingFaceCache
from logger import get_logger

logger = get_logger(__name__)


class HuggingFaceFetcher:
    """Fetch and transform HuggingFace data for the ETL pipeline."""

    def __init__(self, api_key: Optional[str] = None, cache_ttl: int = 3600):
        """
        Initialize the fetcher.

        Args:
            api_key: HuggingFace API key
            cache_ttl: Cache time-to-live in seconds
        """
        self.client = HuggingFaceClient(api_key=api_key)
        self.cache = HuggingFaceCache(ttl_seconds=cache_ttl)
        logger.info("Initialized HuggingFace fetcher")

    def fetch_model_metadata(self, model_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch and transform model metadata from HuggingFace.

        Args:
            model_id: HuggingFace model ID

        Returns:
            Transformed model data dict or None if error
        """
        # Try cache first
        cached_data = self.cache.get("model_info", {"model_id": model_id})
        if cached_data:
            return cached_data

        # Fetch from API
        model_info = self.client.get_model_info(model_id)
        if not model_info:
            return None

        # Transform data
        transformed = self._transform_model_info(model_info)

        # Cache the result
        self.cache.set("model_info", {"model_id": model_id}, transformed)

        return transformed

    def _transform_model_info(self, model_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform HuggingFace model info to database schema.

        Args:
            model_info: Raw model info from HuggingFace

        Returns:
            Transformed data dict
        """
        # Extract organization from model ID
        model_id = model_info.modelId
        organization = model_id.split("/")[0] if "/" in model_id else "Unknown"

        # Extract parameters from model card or tags
        parameters = self._extract_parameters(model_info)

        # Extract release date
        release_date = self._extract_release_date(model_info)

        return {
            "name": model_info.modelId,
            "description": model_info.cardData.get("description", "")[:500] if model_info.cardData else "",
            "parameters": parameters,
            "release_date": release_date,
            "organization": organization,
            "huggingface_id": model_id,
            "likes": model_info.likes,
            "downloads": model_info.downloads,
        }

    def _extract_parameters(self, model_info: Dict[str, Any]) -> Optional[int]:
        """Extract model parameters from tags or model card."""
        # Try to extract from tags
        tags = model_info.cardData.get("tags", []) if model_info.cardData else []
        for tag in tags:
            if "B" in tag and any(char.isdigit() for char in tag):
                # Extract number from tag like "7B", "13B", "70B"
                match = re.search(r"(\d+)B", tag)
                if match:
                    return int(match.group(1)) * 1_000_000_000

        # Try to extract from model ID
        model_id = model_info.modelId.lower()
        match = re.search(r"(\d+)b", model_id)
        if match:
            return int(match.group(1)) * 1_000_000_000

        return None

    def _extract_release_date(self, model_info: Dict[str, Any]) -> Optional[str]:
        """Extract release date from model info."""
        # HuggingFace doesn't always provide release date
        # This would need to be implemented based on available data
        return None

    def fetch_benchmark_results(self, model_id: str) -> List[Dict[str, Any]]:
        """
        Fetch benchmark results for a model from HuggingFace.

        Args:
            model_id: HuggingFace model ID

        Returns:
            List of benchmark result dicts
        """
        # Try cache first
        cached_data = self.cache.get("benchmark_results", {"model_id": model_id})
        if cached_data:
            return cached_data

        # Fetch model card to extract benchmark results
        model_card = self.client.get_model_card(model_id)
        if not model_card:
            return []

        # Extract benchmark results from model card
        results = self._extract_benchmark_results(model_card, model_id)

        # Cache the result
        self.cache.set("benchmark_results", {"model_id": model_id}, results)

        return results

    def _extract_benchmark_results(
        self, model_card: str, model_id: str
    ) -> List[Dict[str, Any]]:
        """
        Extract benchmark results from model card text.

        Args:
            model_card: Model card content
            model_id: HuggingFace model ID

        Returns:
            List of benchmark result dicts
        """
        results = []

        # This is a simplified implementation
        # In production, this would parse the model card more thoroughly
        # to extract benchmark scores from tables, JSON, etc.

        # Example: Look for MMLU scores
        mmlu_match = re.search(r"MMLU[:\s]+(\d+\.?\d*)", model_card, re.IGNORECASE)
        if mmlu_match:
            results.append({
                "model_id": model_id,
                "benchmark_id": "mmlu",
                "score": float(mmlu_match.group(1)),
                "source": "HuggingFace",
            })

        # Example: Look for HumanEval scores
        humaneval_match = re.search(r"HumanEval[:\s]+(\d+\.?\d*)", model_card, re.IGNORECASE)
        if humaneval_match:
            results.append({
                "model_id": model_id,
                "benchmark_id": "humaneval",
                "score": float(humaneval_match.group(1)),
                "source": "HuggingFace",
            })

        logger.info(f"Extracted {len(results)} benchmark results for {model_id}")
        return results

    def fetch_popular_models(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch popular models from HuggingFace.

        Args:
            limit: Maximum number of models to fetch

        Returns:
            List of transformed model data dicts
        """
        # Try cache first
        cached_data = self.cache.get("popular_models", {"limit": limit})
        if cached_data:
            return cached_data

        # Fetch from API
        models = self.client.list_models(limit=limit, sort="downloads")

        # Transform each model
        transformed_models = []
        for model in models:
            model_data = self._transform_model_info(model)
            transformed_models.append(model_data)

        # Cache the result
        self.cache.set("popular_models", {"limit": limit}, transformed_models)

        logger.info(f"Fetched {len(transformed_models)} popular models")
        return transformed_models
