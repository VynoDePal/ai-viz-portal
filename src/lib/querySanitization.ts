/**
 * Query sanitization utilities for SQL injection prevention
 */

import { detectSQLInjection, sanitizeString } from "./inputValidation";

export interface QuerySanitizationResult {
  isSafe: boolean;
  sanitized?: any;
  warnings: string[];
}

/**
 * Sanitize Supabase query filter
 */
export function sanitizeFilter(
  filter: Record<string, any>
): QuerySanitizationResult {
  const warnings: string[] = [];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(filter)) {
    // Check for SQL injection in key
    if (detectSQLInjection(key)) {
      warnings.push(`Potential SQL injection detected in filter key: ${key}`);
      continue;
    }

    // Sanitize string values
    if (typeof value === "string") {
      if (detectSQLInjection(value)) {
        warnings.push(`Potential SQL injection detected in filter value for key: ${key}`);
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) => {
        if (typeof v === "string" && detectSQLInjection(v)) {
          warnings.push(`Potential SQL injection detected in array value for key: ${key}`);
          return sanitizeString(v);
        }
        return v;
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      const nestedResult = sanitizeFilter(value);
      warnings.push(...nestedResult.warnings.map((w) => `${key}.${w}`));
      sanitized[key] = nestedResult.sanitized;
    } else {
      sanitized[key] = value;
    }
  }

  return {
    isSafe: warnings.length === 0,
    sanitized: warnings.length === 0 ? filter : sanitized,
    warnings,
  };
}

/**
 * Sanitize Supabase query options
 */
export function sanitizeQueryOptions(options: {
  select?: string | string[];
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}): QuerySanitizationResult {
  const warnings: string[] = [];
  const sanitized: any = {};

  if (options.select) {
    if (typeof options.select === "string") {
      if (detectSQLInjection(options.select)) {
        warnings.push("Potential SQL injection detected in select clause");
        sanitized.select = sanitizeString(options.select);
      } else {
        sanitized.select = options.select;
      }
    } else if (Array.isArray(options.select)) {
      sanitized.select = options.select.map((col) => {
        if (detectSQLInjection(col)) {
          warnings.push(`Potential SQL injection detected in select column: ${col}`);
          return sanitizeString(col);
        }
        return col;
      });
    }
  }

  if (options.filters) {
    const filterResult = sanitizeFilter(options.filters);
    warnings.push(...filterResult.warnings);
    sanitized.filters = filterResult.sanitized;
  }

  if (options.orderBy) {
    if (detectSQLInjection(options.orderBy.column)) {
      warnings.push("Potential SQL injection detected in order by column");
      sanitized.orderBy = {
        ...options.orderBy,
        column: sanitizeString(options.orderBy.column),
      };
    } else {
      sanitized.orderBy = options.orderBy;
    }
  }

  if (options.limit !== undefined) {
    if (typeof options.limit !== "number" || options.limit < 0) {
      warnings.push("Invalid limit value");
    } else {
      sanitized.limit = Math.min(options.limit, 1000); // Max limit
    }
  }

  if (options.offset !== undefined) {
    if (typeof options.offset !== "number" || options.offset < 0) {
      warnings.push("Invalid offset value");
    } else {
      sanitized.offset = options.offset;
    }
  }

  return {
    isSafe: warnings.length === 0,
    sanitized: warnings.length === 0 ? options : sanitized,
    warnings,
  };
}

/**
 * Validate Supabase query is safe (uses parameterized queries)
 */
export function validateSupabaseQuery(query: {
  table: string;
  operation: "select" | "insert" | "update" | "delete";
  data?: Record<string, any>;
  filters?: Record<string, any>;
}): QuerySanitizationResult {
  const warnings: string[] = [];

  // Check table name
  if (detectSQLInjection(query.table)) {
    warnings.push("Potential SQL injection detected in table name");
  }

  // Check data for insert/update operations
  if ((query.operation === "insert" || query.operation === "update") && query.data) {
    const dataResult = sanitizeFilter(query.data);
    warnings.push(...dataResult.warnings.map((w) => `data.${w}`));
  }

  // Check filters
  if (query.filters) {
    const filterResult = sanitizeFilter(query.filters);
    warnings.push(...filterResult.warnings.map((w) => `filters.${w}`));
  }

  return {
    isSafe: warnings.length === 0,
    warnings,
  };
}

/**
 * Check if a string contains raw SQL (indicates unsafe query)
 */
export function containsRawSQL(input: string): boolean {
  const rawSQLPatterns = [
    /SELECT\s+\*?\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+\w+\s+SET/i,
    /DELETE\s+FROM/i,
    /DROP\s+TABLE/i,
    /CREATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
    /EXEC\s*\(/i,
    /EXECUTE\s*\(/i,
    /sp_/i,
    /xp_/i,
  ];

  return rawSQLPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize user input before using in database queries
 */
export function sanitizeUserInput(input: any): any {
  if (typeof input === "string") {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeUserInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate query doesn't exceed complexity limits
 */
export function validateQueryComplexity(
  query: {
    filters?: Record<string, any>;
    joins?: string[];
    subqueries?: number;
  },
  maxFilters: number = 10,
  maxJoins: number = 5,
  maxSubqueries: number = 3
): QuerySanitizationResult {
  const warnings: string[] = [];

  if (query.filters) {
    const filterCount = Object.keys(query.filters).length;
    if (filterCount > maxFilters) {
      warnings.push(`Query has too many filters (${filterCount} > ${maxFilters})`);
    }
  }

  if (query.joins) {
    if (query.joins.length > maxJoins) {
      warnings.push(`Query has too many joins (${query.joins.length} > ${maxJoins})`);
    }
  }

  if (query.subqueries !== undefined && query.subqueries > maxSubqueries) {
    warnings.push(`Query has too many subqueries (${query.subqueries} > ${maxSubqueries})`);
  }

  return {
    isSafe: warnings.length === 0,
    warnings,
  };
}
