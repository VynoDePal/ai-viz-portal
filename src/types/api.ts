/**
 * API types for public REST API
 */

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: APIMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface APIMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface APIKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface APIUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: Date;
  responseTime?: number;
}

export interface APIRateLimit {
  limit: number;
  remaining: number;
  reset: Date;
}

export interface ModelFilters {
  name?: string;
  benchmark?: string;
  minScore?: number;
  maxScore?: number;
  sortBy?: "name" | "score" | "date";
  sortOrder?: "asc" | "desc";
}

export interface ModelComparisonRequest {
  modelIds: string[];
  benchmark?: string;
}
