# API Reference

This document provides detailed information about the AI Viz Portal public REST API.

## Base URL

- Production: `https://ai-viz-portal.com/api/v1`
- Staging: `https://staging.ai-viz-portal.com/api/v1`

## Authentication

All API endpoints require authentication using a Bearer token. Include your API key in the Authorization header:

```
Authorization: Bearer aivp_your_api_key_here
```

### Obtaining an API Key

1. Sign in to the platform
2. Navigate to Settings > API Keys
3. Click "Generate New API Key"
4. Copy the API key and store it securely

## Rate Limiting

API requests are rate limited to 1000 requests per hour per API key. The rate limit headers are included in each response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1713974400
```

## Endpoints

### Models

#### List Models

Get a list of AI models with optional filters.

**Endpoint:** `GET /models`

**Query Parameters:**
- `name` (string, optional): Filter by model name
- `benchmark` (string, optional): Filter by benchmark
- `minScore` (number, optional): Minimum score
- `maxScore` (number, optional): Maximum score
- `sortBy` (string, optional): Sort field (name, score, date)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "GPT-4",
      "score": 95.5,
      "benchmark": "MMLU"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Get Model Details

Get detailed information about a specific model.

**Endpoint:** `GET /models/{id}`

**Path Parameters:**
- `id` (string, required): Model ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "GPT-4",
    "score": 95.5,
    "benchmark": "MMLU",
    "description": "..."
  }
}
```

### Benchmarks

#### List Benchmarks

Get a list of available benchmarks.

**Endpoint:** `GET /benchmarks`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "MMLU",
      "description": "Massive Multitask Language Understanding"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Rankings

#### Get Rankings

Get model rankings for a specific benchmark.

**Endpoint:** `GET /rankings`

**Query Parameters:**
- `benchmark` (string, optional): Benchmark name (default: MMLU)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "modelId": "1",
      "modelName": "GPT-4",
      "score": 95.5,
      "benchmark": "MMLU"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Compare

#### Compare Models

Compare multiple models against each other.

**Endpoint:** `POST /compare`

**Request Body:**
```json
{
  "modelIds": ["1", "2"],
  "benchmark": "MMLU"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "1",
        "name": "GPT-4",
        "score": 95.5
      },
      {
        "id": "2",
        "name": "Claude 3",
        "score": 94.2
      }
    ],
    "benchmark": "MMLU",
    "comparison": {
      "difference": 1.3,
      "winner": "1"
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: The request is malformed or missing required parameters
- `UNAUTHORIZED`: Authentication failed or missing
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available in the repository at `openapi.json`.

You can also view the interactive API documentation using Swagger UI or Redoc.

## SDKs

### JavaScript/TypeScript

```typescript
import { AIVizPortalClient } from '@aiviz-portal/sdk';

const client = new AIVizPortalClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://ai-viz-portal.com/api/v1'
});

const models = await client.models.list();
const model = await client.models.get('1');
const comparison = await client.compare(['1', '2'], 'MMLU');
```

### Python

```python
from aiviz_portal import AIVizPortalClient

client = AIVizPortalClient(
    api_key='your-api-key',
    base_url='https://ai-viz-portal.com/api/v1'
)

models = client.models.list()
model = client.models.get('1')
comparison = client.compare(['1', '2'], 'MMLU')
```

## Changelog

### v1.0.0 (2024-04-24)

- Initial release
- Models endpoint
- Benchmarks endpoint
- Rankings endpoint
- Compare endpoint
