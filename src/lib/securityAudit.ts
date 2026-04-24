/**
 * Security audit utilities for SQL injection prevention
 */

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  type: "query" | "validation" | "sanitization";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  details?: Record<string, any>;
  location?: string;
}

const auditLog: SecurityAuditLog[] = [];

/**
 * Log security event
 */
export function logSecurityEvent(event: Omit<SecurityAuditLog, "id" | "timestamp">): SecurityAuditLog {
  const logEntry: SecurityAuditLog = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  auditLog.push(logEntry);

  // Keep only last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[SECURITY AUDIT] ${event.type.toUpperCase()}: ${event.message}`, event.details);
  }

  return logEntry;
}

/**
 * Audit Supabase query for security issues
 */
export function auditSupabaseQuery(query: {
  table: string;
  operation: "select" | "insert" | "update" | "delete";
  data?: Record<string, any>;
  filters?: Record<string, any>;
  location?: string;
}): { isSafe: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for raw SQL in table name
  if (containsRawSQL(query.table)) {
    issues.push("Table name contains raw SQL pattern");
    logSecurityEvent({
      type: "query",
      severity: "critical",
      message: "Raw SQL detected in table name",
      details: { table: query.table },
      location: query.location,
    });
  }

  // Check for raw SQL in data
  if (query.data) {
    const dataIssues = checkForRawSQL(query.data, "data");
    issues.push(...dataIssues);
  }

  // Check for raw SQL in filters
  if (query.filters) {
    const filterIssues = checkForRawSQL(query.filters, "filters");
    issues.push(...filterIssues);
  }

  if (issues.length > 0) {
    logSecurityEvent({
      type: "query",
      severity: "error",
      message: "Security issues detected in query",
      details: { issues, query },
      location: query.location,
    });
  } else {
    logSecurityEvent({
      type: "query",
      severity: "info",
      message: "Query passed security audit",
      details: { table: query.table, operation: query.operation },
      location: query.location,
    });
  }

  return {
    isSafe: issues.length === 0,
    issues,
  };
}

/**
 * Check object for raw SQL patterns
 */
function checkForRawSQL(obj: any, prefix: string = ""): string[] {
  const issues: string[] = [];

  if (typeof obj === "string") {
    if (containsRawSQL(obj)) {
      issues.push(`${prefix}: contains raw SQL pattern`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      issues.push(...checkForRawSQL(item, `${prefix}[${index}]`));
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      issues.push(...checkForRawSQL(value, `${prefix}.${key}`));
    });
  }

  return issues;
}

/**
 * Check if string contains raw SQL
 */
function containsRawSQL(input: string): boolean {
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
    /'[^']*OR[^']*'/i,
    /'[^']*AND[^']*'/i,
    /--/,
    /\/\*/,
    /\*\//,
  ];

  return rawSQLPatterns.some((pattern) => pattern.test(input));
}

/**
 * Get audit log
 */
export function getAuditLog(limit: number = 100): SecurityAuditLog[] {
  return auditLog.slice(-limit);
}

/**
 * Get audit log by type
 */
export function getAuditLogByType(type: SecurityAuditLog["type"], limit: number = 100): SecurityAuditLog[] {
  return auditLog.filter((entry) => entry.type === type).slice(-limit);
}

/**
 * Get audit log by severity
 */
export function getAuditLogBySeverity(severity: SecurityAuditLog["severity"], limit: number = 100): SecurityAuditLog[] {
  return auditLog.filter((entry) => entry.severity === severity).slice(-limit);
}

/**
 * Get security statistics
 */
export function getSecurityStatistics(): {
  totalQueries: number;
  safeQueries: number;
  unsafeQueries: number;
  criticalIssues: number;
  warnings: number;
} {
  const queryLogs = getAuditLogByType("query");
  const totalQueries = queryLogs.length;
  const safeQueries = queryLogs.filter((log) => log.severity === "info").length;
  const unsafeQueries = totalQueries - safeQueries;
  const criticalIssues = getAuditLogBySeverity("critical").length;
  const warnings = getAuditLogBySeverity("warning").length;

  return {
    totalQueries,
    safeQueries,
    unsafeQueries,
    criticalIssues,
    warnings,
  };
}

/**
 * Clear old audit logs (older than 7 days)
 */
export function cleanupOldAuditLogs(): void {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  for (let i = auditLog.length - 1; i >= 0; i--) {
    if (auditLog[i].timestamp.getTime() < sevenDaysAgo) {
      auditLog.splice(i, 1);
    }
  }
}

// Run cleanup every day
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldAuditLogs, 86400000);
}

/**
 * Perform comprehensive security audit
 */
export function performSecurityAudit(): {
  overallScore: number;
  issues: string[];
  recommendations: string[];
} {
  const stats = getSecurityStatistics();
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Calculate safety score
  const safetyScore = stats.totalQueries > 0 ? (stats.safeQueries / stats.totalQueries) * 100 : 100;

  if (stats.unsafeQueries > 0) {
    issues.push(`${stats.unsafeQueries} queries failed security audit`);
    recommendations.push("Review and fix unsafe queries immediately");
  }

  if (stats.criticalIssues > 0) {
    issues.push(`${stats.criticalIssues} critical security issues detected`);
    recommendations.push("Investigate critical issues immediately");
  }

  if (stats.warnings > 10) {
    issues.push(`${stats.warnings} security warnings in the last period`);
    recommendations.push("Review security warnings regularly");
  }

  if (safetyScore < 90) {
    recommendations.push("Improve query validation and sanitization");
  }

  return {
    overallScore: Math.round(safetyScore),
    issues,
    recommendations,
  };
}
