/**
 * Input validation utilities for SQL injection prevention
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * Validate string input
 */
export function validateString(
  input: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowedChars?: string;
  } = {}
): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "string") {
    errors.push("Input must be a string");
    return { isValid: false, errors };
  }

  const { minLength, maxLength, pattern, allowedChars } = options;

  if (minLength !== undefined && input.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters`);
  }

  if (maxLength !== undefined && input.length > maxLength) {
    errors.push(`Input must be at most ${maxLength} characters`);
  }

  if (pattern && !pattern.test(input)) {
    errors.push("Input does not match required pattern");
  }

  if (allowedChars) {
    for (const char of input) {
      if (!allowedChars.includes(char)) {
        errors.push(`Input contains invalid character: ${char}`);
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? input : undefined,
  };
}

/**
 * Validate number input
 */
export function validateNumber(
  input: unknown,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "number" || isNaN(input)) {
    errors.push("Input must be a valid number");
    return { isValid: false, errors };
  }

  const { min, max, integer } = options;

  if (min !== undefined && input < min) {
    errors.push(`Input must be at least ${min}`);
  }

  if (max !== undefined && input > max) {
    errors.push(`Input must be at most ${max}`);
  }

  if (integer && !Number.isInteger(input)) {
    errors.push("Input must be an integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? input : undefined,
  };
}

/**
 * Validate email input
 */
export function validateEmail(input: unknown): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(input, {
    pattern: emailPattern,
    maxLength: 255,
  });
}

/**
 * Validate UUID input
 */
export function validateUUID(input: unknown): ValidationResult {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return validateString(input, {
    pattern: uuidPattern,
  });
}

/**
 * Sanitize string input to prevent SQL injection
 */
export function sanitizeString(input: string): string {
  // Remove potential SQL injection patterns
  return input
    .replace(/['";\\]/g, "") // Remove quotes and backslashes
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, "") // Remove SQL keywords
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove SQL block comments
    .replace(/\*\//g, "") // Remove SQL block comments
    .trim();
}

/**
 * Validate and sanitize array of strings
 */
export function validateStringArray(
  inputs: unknown[],
  options?: Parameters<typeof validateString>[1]
): ValidationResult {
  const errors: string[] = [];
  const sanitized: string[] = [];

  if (!Array.isArray(inputs)) {
    errors.push("Input must be an array");
    return { isValid: false, errors };
  }

  for (let i = 0; i < inputs.length; i++) {
    const result = validateString(inputs[i], options);
    if (!result.isValid) {
      errors.push(`Index ${i}: ${result.errors.join(", ")}`);
    } else {
      sanitized.push(sanitizeString(result.sanitized));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

/**
 * Validate object with schema
 */
export function validateObject(
  input: unknown,
  schema: Record<string, (value: unknown) => ValidationResult>
): ValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};

  if (typeof input !== "object" || input === null) {
    errors.push("Input must be an object");
    return { isValid: false, errors };
  }

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator((input as any)[key]);
    if (!result.isValid) {
      errors.push(`${key}: ${result.errors.join(", ")}`);
    } else {
      sanitized[key] = result.sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

/**
 * Check for SQL injection patterns in string
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /['";\\]/,
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/i,
    /--/,
    /\/\*/,
    /\*\//,
    /\bOR\b.*=.*=/i,
    /\bAND\b.*=.*=/i,
    /\bWHERE\b.*1=1/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize SQL identifier (table name, column name)
 */
export function validateSQLIdentifier(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "string") {
    errors.push("Identifier must be a string");
    return { isValid: false, errors };
  }

  // SQL identifiers should only contain alphanumeric characters and underscores
  const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!identifierPattern.test(input)) {
    errors.push("Invalid SQL identifier format");
  }

  // Check for SQL keywords
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "EXEC",
    "UNION",
    "WHERE",
    "FROM",
    "JOIN",
    "AND",
    "OR",
    "NOT",
    "IN",
    "LIKE",
    "BETWEEN",
  ];

  if (sqlKeywords.includes(input.toUpperCase())) {
    errors.push("Identifier cannot be a SQL keyword");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? input : undefined,
  };
}
