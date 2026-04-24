import { describe, it, expect, beforeEach } from "vitest";
import {
  validateString,
  validateNumber,
  validateEmail,
  validateUUID,
  sanitizeString,
  validateStringArray,
  validateObject,
  detectSQLInjection,
  validateSQLIdentifier,
} from "@/lib/inputValidation";
import {
  sanitizeFilter,
  sanitizeQueryOptions,
  validateSupabaseQuery,
  containsRawSQL,
  sanitizeUserInput,
  validateQueryComplexity,
} from "@/lib/querySanitization";
import {
  logSecurityEvent,
  auditSupabaseQuery,
  getAuditLog,
  getAuditLogByType,
  getAuditLogBySeverity,
  getSecurityStatistics,
  performSecurityAudit,
  cleanupOldAuditLogs,
} from "@/lib/securityAudit";

describe("Input Validation", () => {
  beforeEach(() => {
    cleanupOldAuditLogs();
  });

  describe("validateString", () => {
    it("should validate valid string", () => {
      const result = validateString("test", { minLength: 1, maxLength: 10 });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("test");
    });

    it("should reject string too short", () => {
      const result = validateString("t", { minLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be at least 5 characters");
    });

    it("should reject string too long", () => {
      const result = validateString("test", { maxLength: 2 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be at most 2 characters");
    });

    it("should reject non-string input", () => {
      const result = validateString(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be a string");
    });
  });

  describe("validateNumber", () => {
    it("should validate valid number", () => {
      const result = validateNumber(5, { min: 0, max: 10 });
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe(5);
    });

    it("should reject number below minimum", () => {
      const result = validateNumber(-1, { min: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be at least 0");
    });

    it("should reject number above maximum", () => {
      const result = validateNumber(11, { max: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be at most 10");
    });

    it("should reject non-integer when integer required", () => {
      const result = validateNumber(5.5, { integer: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be an integer");
    });

    it("should reject non-number input", () => {
      const result = validateNumber("5");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input must be a valid number");
    });
  });

  describe("validateEmail", () => {
    it("should validate valid email", () => {
      const result = validateEmail("test@example.com");
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = validateEmail("invalid-email");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateUUID", () => {
    it("should validate valid UUID", () => {
      const result = validateUUID("550e8400-e29b-41d4-a716-446655440000");
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = validateUUID("not-a-uuid");
      expect(result.isValid).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    it("should remove SQL injection patterns", () => {
      const input = "'; DROP TABLE models; --";
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain("DROP");
      expect(sanitized).not.toContain("--");
    });

    it("should remove SQL keywords", () => {
      const input = "SELECT * FROM users";
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain("SELECT");
      expect(sanitized).not.toContain("FROM");
    });
  });

  describe("detectSQLInjection", () => {
    it("should detect SQL injection patterns", () => {
      expect(detectSQLInjection("'; DROP TABLE; --")).toBe(true);
      expect(detectSQLInjection("1=1 OR")).toBe(true);
      expect(detectSQLInjection("normal text")).toBe(false);
    });
  });

  describe("validateSQLIdentifier", () => {
    it("should validate valid identifier", () => {
      const result = validateSQLIdentifier("valid_name");
      expect(result.isValid).toBe(true);
    });

    it("should reject SQL keyword", () => {
      const result = validateSQLIdentifier("SELECT");
      expect(result.isValid).toBe(false);
    });

    it("should reject invalid characters", () => {
      const result = validateSQLIdentifier("invalid-name");
      expect(result.isValid).toBe(false);
    });
  });
});

describe("Query Sanitization", () => {
  describe("sanitizeFilter", () => {
    it("should sanitize safe filter", () => {
      const filter = { name: "test", score: 95 };
      const result = sanitizeFilter(filter);
      expect(result.isSafe).toBe(true);
      expect(result.sanitized).toEqual(filter);
    });

    it("should detect SQL injection in filter", () => {
      const filter = { name: "'; DROP TABLE; --" };
      const result = sanitizeFilter(filter);
      expect(result.isSafe).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("sanitizeQueryOptions", () => {
    it("should sanitize safe options", () => {
      const options = {
        select: ["name", "score"],
        filters: { name: "test" },
        orderBy: { column: "score", ascending: false },
        limit: 10,
      };
      const result = sanitizeQueryOptions(options);
      expect(result.isSafe).toBe(true);
    });

    it("should detect SQL injection in select", () => {
      const options = {
        select: "'; DROP TABLE; --",
      };
      const result = sanitizeQueryOptions(options);
      expect(result.isSafe).toBe(false);
    });

    it("should limit maximum limit", () => {
      const options = { limit: 2000 };
      const result = sanitizeQueryOptions(options);
      expect(result.sanitized.limit).toBe(1000);
    });
  });

  describe("validateSupabaseQuery", () => {
    it("should validate safe query", () => {
      const query = {
        table: "models",
        operation: "select" as const,
        filters: { name: "test" },
      };
      const result = validateSupabaseQuery(query);
      expect(result.isSafe).toBe(true);
    });

    it("should detect SQL injection in table name", () => {
      const query = {
        table: "'; DROP TABLE; --",
        operation: "select" as const,
      };
      const result = validateSupabaseQuery(query);
      expect(result.isSafe).toBe(false);
    });
  });

  describe("containsRawSQL", () => {
    it("should detect raw SQL patterns", () => {
      expect(containsRawSQL("SELECT * FROM users")).toBe(true);
      expect(containsRawSQL("INSERT INTO users")).toBe(true);
      expect(containsRawSQL("normal text")).toBe(false);
    });
  });

  describe("sanitizeUserInput", () => {
    it("should sanitize string input", () => {
      const result = sanitizeUserInput("'; DROP TABLE; --");
      expect(result).not.toContain("'");
      expect(result).not.toContain("DROP");
    });

    it("should sanitize array input", () => {
      const input = ["'; DROP TABLE; --", "normal"];
      const result = sanitizeUserInput(input);
      expect(result[0]).not.toContain("'");
      expect(result[1]).toBe("normal");
    });

    it("should sanitize object input", () => {
      const input = { name: "'; DROP TABLE; --", score: 95 };
      const result = sanitizeUserInput(input);
      expect(result.name).not.toContain("'");
      expect(result.score).toBe(95);
    });
  });

  describe("validateQueryComplexity", () => {
    it("should validate simple query", () => {
      const query = { filters: { name: "test" } };
      const result = validateQueryComplexity(query);
      expect(result.isSafe).toBe(true);
    });

    it("should reject query with too many filters", () => {
      const filters: Record<string, any> = {};
      for (let i = 0; i < 15; i++) {
        filters[`filter${i}`] = `value${i}`;
      }
      const result = validateQueryComplexity({ filters }, 10);
      expect(result.isSafe).toBe(false);
    });
  });
});

describe("Security Audit", () => {
  beforeEach(() => {
    cleanupOldAuditLogs();
  });

  describe("logSecurityEvent", () => {
    it("should log security event", () => {
      const event = logSecurityEvent({
        type: "query",
        severity: "info",
        message: "Test event",
      });
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("auditSupabaseQuery", () => {
    it("should pass safe query", () => {
      const query = {
        table: "models",
        operation: "select" as const,
        filters: { name: "test" },
      };
      const result = auditSupabaseQuery(query);
      expect(result.isSafe).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should fail unsafe query", () => {
      const query = {
        table: "'; DROP TABLE; --",
        operation: "select" as const,
      };
      const result = auditSupabaseQuery(query);
      expect(result.isSafe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("getAuditLog", () => {
    it("should return audit log", () => {
      logSecurityEvent({
        type: "query",
        severity: "info",
        message: "Test event 1",
      });
      logSecurityEvent({
        type: "query",
        severity: "warning",
        message: "Test event 2",
      });
      const log = getAuditLog();
      expect(log.length).toBeGreaterThanOrEqual(2);
    });

    it("should limit results", () => {
      for (let i = 0; i < 10; i++) {
        logSecurityEvent({
          type: "query",
          severity: "info",
          message: `Test event ${i}`,
        });
      }
      const log = getAuditLog(5);
      expect(log.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getAuditLogByType", () => {
    it("should filter by type", () => {
      logSecurityEvent({
        type: "query",
        severity: "info",
        message: "Query event",
      });
      logSecurityEvent({
        type: "validation",
        severity: "info",
        message: "Validation event",
      });
      const queryLogs = getAuditLogByType("query");
      expect(queryLogs.every((log) => log.type === "query")).toBe(true);
    });
  });

  describe("getAuditLogBySeverity", () => {
    it("should filter by severity", () => {
      logSecurityEvent({
        type: "query",
        severity: "critical",
        message: "Critical event",
      });
      logSecurityEvent({
        type: "query",
        severity: "info",
        message: "Info event",
      });
      const criticalLogs = getAuditLogBySeverity("critical");
      expect(criticalLogs.every((log) => log.severity === "critical")).toBe(true);
    });
  });

  describe("getSecurityStatistics", () => {
    it("should return statistics", () => {
      logSecurityEvent({
        type: "query",
        severity: "info",
        message: "Safe query",
      });
      logSecurityEvent({
        type: "query",
        severity: "error",
        message: "Unsafe query",
      });
      const stats = getSecurityStatistics();
      expect(stats.totalQueries).toBe(2);
      expect(stats.safeQueries).toBe(1);
      expect(stats.unsafeQueries).toBe(1);
    });
  });

  describe("performSecurityAudit", () => {
    it("should return audit results", () => {
      const audit = performSecurityAudit();
      expect(audit.overallScore).toBeGreaterThanOrEqual(0);
      expect(audit.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(audit.issues)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);
    });
  });
});
