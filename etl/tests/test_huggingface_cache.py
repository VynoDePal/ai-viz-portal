"""Unit tests for HuggingFace cache module."""

import pytest
import time
import json
from pathlib import Path
from huggingface_cache import HuggingFaceCache


@pytest.fixture
def cache(tmp_path):
    """Create a temporary cache instance."""
    cache_dir = tmp_path / "cache"
    return HuggingFaceCache(cache_dir=str(cache_dir), ttl_seconds=1)


def test_cache_initialization(cache):
    """Test that cache initializes correctly."""
    assert cache.cache_dir.exists()
    assert cache.ttl_seconds == 1


def test_cache_set_and_get(cache):
    """Test setting and getting cached data."""
    endpoint = "test_endpoint"
    params = {"key": "value"}
    data = {"result": "test_data"}

    cache.set(endpoint, params, data)
    cached = cache.get(endpoint, params)

    assert cached == data


def test_cache_miss(cache):
    """Test cache miss returns None."""
    result = cache.get("nonexistent", {"key": "value"})
    assert result is None


def test_cache_expiration(cache):
    """Test that cache entries expire after TTL."""
    endpoint = "test_endpoint"
    params = {"key": "value"}
    data = {"result": "test_data"}

    cache.set(endpoint, params, data)
    time.sleep(1.1)  # Wait for TTL to expire

    result = cache.get(endpoint, params)
    assert result is None


def test_cache_clear(cache):
    """Test clearing all cache entries."""
    cache.set("endpoint1", {"key": "value1"}, {"data": 1})
    cache.set("endpoint2", {"key": "value2"}, {"data": 2})

    cache.clear()

    assert cache.get("endpoint1", {"key": "value1"}) is None
    assert cache.get("endpoint2", {"key": "value2"}) is None


def test_cache_clear_expired(cache):
    """Test clearing expired cache entries only."""
    cache.set("endpoint1", {"key": "value1"}, {"data": 1})
    time.sleep(1.1)
    cache.set("endpoint2", {"key": "value2"}, {"data": 2})

    cache.clear_expired()

    assert cache.get("endpoint1", {"key": "value1"}) is None
    assert cache.get("endpoint2", {"key": "value2"}) == {"data": 2}


def test_cache_key_generation(cache):
    """Test that cache keys are generated correctly."""
    key1 = cache._get_cache_key("endpoint", {"key": "value"})
    key2 = cache._get_cache_key("endpoint", {"key": "value"})
    key3 = cache._get_cache_key("endpoint", {"key": "different"})

    assert key1 == key2
    assert key1 != key3
