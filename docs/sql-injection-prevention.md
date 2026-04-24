# SQL Injection Prevention Guide

This guide provides best practices for preventing SQL injection in the AI Viz Portal.

## Overview

SQL injection is a code injection technique that might destroy your database. This guide explains how to prevent SQL injection attacks in our application using Supabase client and custom validation utilities.

## Key Principles

1. **Always use parameterized queries** - Supabase client automatically handles parameterization
2. **Validate all user input** - Use the input validation utilities
3. **Sanitize query data** - Use the query sanitization utilities
4. **Audit queries regularly** - Use the security audit utilities
5. **Never use raw SQL** - Avoid raw SQL queries entirely

## Using Supabase Client

Supabase client automatically provides protection against SQL injection through parameterized queries.

### Correct Usage

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Correct - Uses parameterized queries
const { data, error } = await supabase
  .from('models')
  .select('*')
  .eq('id', modelId);

// ✅ Correct - Uses parameterized queries
const { data, error } = await supabase
  .from('models')
  .insert({ name: modelName, score: modelScore });
```

### Incorrect Usage

```typescript
// ❌ Incorrect - Never use raw SQL
const query = `SELECT * FROM models WHERE id = '${modelId}'`;
const { data, error } = await supabase.rpc('execute_sql', { query });

// ❌ Incorrect - Never concatenate user input
const query = `SELECT * FROM models WHERE name LIKE '%${userInput}%'`;
```

## Input Validation

Use the input validation utilities to validate all user input before using it in database queries.

### Validating Strings

```typescript
import { validateString, sanitizeString } from '@/lib/inputValidation';

const result = validateString(userInput, {
  minLength: 1,
  maxLength: 255,
  pattern: /^[a-zA-Z0-9\s-]+$/
});

if (!result.isValid) {
  throw new Error(`Invalid input: ${result.errors.join(', ')}`);
}

const sanitized = sanitizeString(result.sanitized);
```

### Validating Numbers

```typescript
import { validateNumber } from '@/lib/inputValidation';

const result = validateNumber(userInput, {
  min: 0,
  max: 100,
  integer: true
});

if (!result.isValid) {
  throw new Error(`Invalid number: ${result.errors.join(', ')}`);
}
```

### Validating Emails

```typescript
import { validateEmail } from '@/lib/inputValidation';

const result = validateEmail(userEmail);

if (!result.isValid) {
  throw new Error('Invalid email address');
}
```

### Validating UUIDs

```typescript
import { validateUUID } from '@/lib/inputValidation';

const result = validateUUID(modelId);

if (!result.isValid) {
  throw new Error('Invalid UUID format');
}
```

## Query Sanitization

Use the query sanitization utilities to sanitize query options before executing them.

### Sanitizing Filters

```typescript
import { sanitizeFilter } from '@/lib/querySanitization';

const filter = {
  name: userInput,
  score: userScore
};

const result = sanitizeFilter(filter);

if (!result.isSafe) {
  console.warn('Sanitization warnings:', result.warnings);
}

const { data, error } = await supabase
  .from('models')
  .select('*')
  .filter(result.sanitized);
```

### Sanitizing Query Options

```typescript
import { sanitizeQueryOptions } from '@/lib/querySanitization';

const options = {
  select: ['name', 'score'],
  filters: { name: userInput },
  orderBy: { column: 'score', ascending: false },
  limit: 10
};

const result = sanitizeQueryOptions(options);

if (!result.isSafe) {
  console.warn('Sanitization warnings:', result.warnings);
}

const { data, error } = await supabase
  .from('models')
  .select(result.sanitized.select)
  .match(result.sanitized.filters)
  .order(result.sanitized.orderBy.column, { ascending: result.sanitized.orderBy.ascending })
  .limit(result.sanitized.limit);
```

## Security Auditing

Use the security audit utilities to audit queries for security issues.

### Auditing a Query

```typescript
import { auditSupabaseQuery } from '@/lib/securityAudit';

const query = {
  table: 'models',
  operation: 'select',
  filters: { name: userInput },
  location: 'src/app/models/page.tsx'
};

const audit = auditSupabaseQuery(query);

if (!audit.isSafe) {
  console.error('Security issues:', audit.issues);
  throw new Error('Query failed security audit');
}

// Execute query
const { data, error } = await supabase
  .from(query.table)
  .select('*')
  .match(query.filters);
```

### Getting Security Statistics

```typescript
import { getSecurityStatistics } from '@/lib/securityAudit';

const stats = getSecurityStatistics();

console.log(`Total queries: ${stats.totalQueries}`);
console.log(`Safe queries: ${stats.safeQueries}`);
console.log(`Unsafe queries: ${stats.unsafeQueries}`);
console.log(`Critical issues: ${stats.criticalIssues}`);
```

### Performing Comprehensive Audit

```typescript
import { performSecurityAudit } from '@/lib/securityAudit';

const audit = performSecurityAudit();

console.log(`Overall security score: ${audit.overallScore}%`);

if (audit.issues.length > 0) {
  console.error('Security issues:', audit.issues);
}

if (audit.recommendations.length > 0) {
  console.warn('Recommendations:', audit.recommendations);
}
```

## Best Practices

### 1. Always Validate Input

Never trust user input. Always validate it before using it in database queries.

```typescript
// ✅ Correct
const result = validateUUID(modelId);
if (!result.isValid) {
  throw new Error('Invalid model ID');
}

const { data, error } = await supabase
  .from('models')
  .select('*')
  .eq('id', result.sanitized);

// ❌ Incorrect
const { data, error } = await supabase
  .from('models')
  .select('*')
  .eq('id', modelId); // No validation
```

### 2. Use Supabase Client Methods

Always use Supabase client methods instead of raw SQL.

```typescript
// ✅ Correct
const { data, error } = await supabase
  .from('models')
  .select('*')
  .eq('name', modelName);

// ❌ Incorrect
const query = `SELECT * FROM models WHERE name = '${modelName}'`;
const { data, error } = await supabase.rpc('execute_sql', { query });
```

### 3. Sanitize Query Options

Sanitize query options before using them.

```typescript
// ✅ Correct
const result = sanitizeQueryOptions(options);
const { data, error } = await supabase
  .from('models')
  .select(result.sanitized.select)
  .match(result.sanitized.filters);

// ❌ Incorrect
const { data, error } = await supabase
  .from('models')
  .select(options.select)
  .match(options.filters);
```

### 4. Audit Queries Regularly

Regularly audit queries to ensure they meet security standards.

```typescript
// ✅ Correct
const audit = auditSupabaseQuery(query);
if (!audit.isSafe) {
  throw new Error('Query failed security audit');
}

const { data, error } = await supabase
  .from(query.table)
  .select('*');

// ❌ Incorrect
const { data, error } = await supabase
  .from('models')
  .select('*');
// No audit
```

### 5. Limit Query Complexity

Limit the complexity of queries to prevent performance issues and potential attacks.

```typescript
// ✅ Correct
const result = validateQueryComplexity({
  filters: userFilters,
  maxFilters: 10
});

if (!result.isSafe) {
  throw new Error('Query too complex');
}

// ❌ Incorrect
const { data, error } = await supabase
  .from('models')
  .select('*')
  .match(complexUserFilters); // No complexity validation
```

## Common Pitfalls

### 1. String Concatenation

Never concatenate user input into SQL queries.

```typescript
// ❌ Incorrect
const query = `SELECT * FROM models WHERE name = '${userInput}'`;
```

### 2. Dynamic Table Names

Never use user input as table names directly.

```typescript
// ❌ Incorrect
const { data, error } = await supabase
  .from(userInput) // Unsafe
  .select('*');

// ✅ Correct
const validTables = ['models', 'benchmarks', 'rankings'];
if (!validTables.includes(userInput)) {
  throw new Error('Invalid table name');
}
const { data, error } = await supabase
  .from(userInput)
  .select('*');
```

### 3. Ignoring Validation Results

Never ignore validation results.

```typescript
// ❌ Incorrect
const result = validateString(userInput);
// Ignoring result.isValid

// ✅ Correct
const result = validateString(userInput);
if (!result.isValid) {
  throw new Error('Invalid input');
}
```

## Testing

Always test your code for SQL injection vulnerabilities.

### Unit Tests

```typescript
import { validateString, detectSQLInjection } from '@/lib/inputValidation';

describe('SQL Injection Prevention', () => {
  it('should detect SQL injection in input', () => {
    const maliciousInput = "'; DROP TABLE models; --";
    expect(detectSQLInjection(maliciousInput)).toBe(true);
  });

  it('should sanitize malicious input', () => {
    const maliciousInput = "'; DROP TABLE models; --";
    const sanitized = sanitizeString(maliciousInput);
    expect(sanitized).not.toContain("'");
    expect(sanitized).not.toContain("DROP");
  });
});
```

## Monitoring

Regularly monitor the security audit logs for suspicious activity.

```typescript
import { getAuditLogBySeverity } from '@/lib/securityAudit';

// Check for critical issues
const criticalIssues = getAuditLogBySeverity('critical');

if (criticalIssues.length > 0) {
  console.error('Critical security issues detected:', criticalIssues);
  // Send alert to security team
}
```

## Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
