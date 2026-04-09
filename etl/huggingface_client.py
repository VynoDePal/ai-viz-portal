"""HuggingFace API client with error handling and rate limit management."""

import time
import os
from typing import Any, Optional
from huggingface_hub import HfApi, InferenceClient
from logger import get_logger

logger = get_logger(__name__)


class HuggingFaceClient:
    """Client for interacting with HuggingFace API."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the HuggingFace client.

        Args:
            api_key: HuggingFace API key (optional, reads from HF_API_KEY env var if not provided)
        """
        self.api_key = api_key or os.getenv("HF_API_KEY")
        self.hf_api = HfApi(token=self.api_key)
        self.rate_limit_delay = 1.0  # Delay between requests in seconds
        logger.info("Initialized HuggingFace client")

    def _handle_rate_limit(self, response: Any) -> None:
        """
        Handle rate limiting by adding delays.

        Args:
            response: API response
        """
        if hasattr(response, "status_code") and response.status_code == 429:
            logger.warning("Rate limit hit, increasing delay")
            self.rate_limit_delay *= 2
            time.sleep(self.rate_limit_delay)

        # Reset delay after successful request
        self.rate_limit_delay = max(1.0, self.rate_limit_delay * 0.9)

    def get_model_info(self, model_id: str) -> Optional[dict]:
        """
        Get information about a model from HuggingFace.

        Args:
            model_id: HuggingFace model ID (e.g., "openai/gpt-4")

        Returns:
            Model information dict or None if error
        """
        try:
            time.sleep(self.rate_limit_delay)
            model_info = self.hf_api.model_info(model_id)
            logger.info(f"Successfully fetched info for model {model_id}")
            return model_info
        except Exception as e:
            logger.error(f"Error fetching model info for {model_id}: {e}")
            return None

    def get_model_card(self, model_id: str) -> Optional[str]:
        """
        Get the model card (README) from HuggingFace.

        Args:
            model_id: HuggingFace model ID

        Returns:
            Model card content or None if error
        """
        try:
            time.sleep(self.rate_limit_delay)
            model_card = self.hf_api.model_info(model_id).card_data
            logger.info(f"Successfully fetched model card for {model_id}")
            return model_card
        except Exception as e:
            logger.error(f"Error fetching model card for {model_id}: {e}")
            return None

    def list_models(
        self,
        task: Optional[str] = None,
        limit: int = 100,
        sort: str = "downloads",
    ) -> list:
        """
        List models from HuggingFace.

        Args:
            task: Filter by task (e.g., "text-generation")
            limit: Maximum number of models to return
            sort: Sort order (downloads, likes, etc.)

        Returns:
            List of model info dicts
        """
        try:
            time.sleep(self.rate_limit_delay)
            models = self.hf_api.list_models(
                task=task,
                limit=limit,
                sort=sort,
            )
            logger.info(f"Successfully listed {len(models)} models")
            return models
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []

    def search_models(self, query: str, limit: int = 50) -> list:
        """
        Search for models on HuggingFace.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of matching models
        """
        try:
            time.sleep(self.rate_limit_delay)
            models = self.hf_api.list_models(search=query, limit=limit)
            logger.info(f"Found {len(models)} models for query '{query}'")
            return models
        except Exception as e:
            logger.error(f"Error searching models: {e}")
            return []

    def get_model_likes(self, model_id: str) -> Optional[int]:
        """
        Get the number of likes for a model.

        Args:
            model_id: HuggingFace model ID

        Returns:
            Number of likes or None if error
        """
        try:
            time.sleep(self.rate_limit_delay)
            model_info = self.hf_api.model_info(model_id)
            likes = model_info.likes
            logger.info(f"Model {model_id} has {likes} likes")
            return likes
        except Exception as e:
            logger.error(f"Error fetching likes for {model_id}: {e}")
            return None

    def get_model_downloads(self, model_id: str) -> Optional[int]:
        """
        Get the number of downloads for a model.

        Args:
            model_id: HuggingFace model ID

        Returns:
            Number of downloads or None if error
        """
        try:
            time.sleep(self.rate_limit_delay)
            model_info = self.hf_api.model_info(model_id)
            downloads = model_info.downloads
            logger.info(f"Model {model_id} has {downloads} downloads")
            return downloads
        except Exception as e:
            logger.error(f"Error fetching downloads for {model_id}: {e}")
            return None
