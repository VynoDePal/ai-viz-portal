"""Simple file-based caching mechanism for HuggingFace API responses."""

import json
import os
import time
from pathlib import Path
from typing import Any, Optional
from logger import get_logger

logger = get_logger(__name__)


class HuggingFaceCache:
    """Simple file-based cache with TTL for HuggingFace API responses."""

    def __init__(self, cache_dir: str = ".cache/huggingface", ttl_seconds: int = 3600):
        """
        Initialize the cache.

        Args:
            cache_dir: Directory to store cache files
            ttl_seconds: Time-to-live for cache entries in seconds (default: 1 hour)
        """
        self.cache_dir = Path(cache_dir)
        self.ttl_seconds = ttl_seconds
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Initialized HuggingFace cache at {self.cache_dir} with TTL {ttl_seconds}s")

    def _get_cache_key(self, endpoint: str, params: dict) -> str:
        """Generate a cache key from endpoint and parameters."""
        import hashlib

        key_string = f"{endpoint}:{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(key_string.encode()).hexdigest()

    def _get_cache_path(self, cache_key: str) -> Path:
        """Get the file path for a cache key."""
        return self.cache_dir / f"{cache_key}.json"

    def get(self, endpoint: str, params: dict) -> Optional[Any]:
        """
        Get cached data if available and not expired.

        Args:
            endpoint: API endpoint
            params: Request parameters

        Returns:
            Cached data if available and not expired, None otherwise
        """
        cache_key = self._get_cache_key(endpoint, params)
        cache_path = self._get_cache_path(cache_key)

        if not cache_path.exists():
            return None

        try:
            with open(cache_path, "r") as f:
                cache_data = json.load(f)

            # Check if cache entry is expired
            if time.time() - cache_data["timestamp"] > self.ttl_seconds:
                logger.info(f"Cache entry expired for {endpoint}")
                cache_path.unlink()
                return None

            logger.info(f"Cache hit for {endpoint}")
            return cache_data["data"]
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error reading cache file: {e}")
            cache_path.unlink(missing_ok=True)
            return None

    def set(self, endpoint: str, params: dict, data: Any) -> None:
        """
        Store data in cache.

        Args:
            endpoint: API endpoint
            params: Request parameters
            data: Data to cache
        """
        cache_key = self._get_cache_key(endpoint, params)
        cache_path = self._get_cache_path(cache_key)

        cache_data = {
            "timestamp": time.time(),
            "data": data,
        }

        try:
            with open(cache_path, "w") as f:
                json.dump(cache_data, f)
            logger.info(f"Cached data for {endpoint}")
        except IOError as e:
            logger.error(f"Error writing to cache file: {e}")

    def clear(self) -> None:
        """Clear all cached data."""
        for cache_file in self.cache_dir.glob("*.json"):
            cache_file.unlink()
        logger.info("Cleared all cache entries")

    def clear_expired(self) -> None:
        """Clear expired cache entries."""
        current_time = time.time()
        cleared = 0

        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, "r") as f:
                    cache_data = json.load(f)

                if current_time - cache_data["timestamp"] > self.ttl_seconds:
                    cache_file.unlink()
                    cleared += 1
            except (json.JSONDecodeError, KeyError):
                cache_file.unlink(missing_ok=True)
                cleared += 1

        logger.info(f"Cleared {cleared} expired cache entries")
