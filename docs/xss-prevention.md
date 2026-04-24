# XSS Prevention Guide

This guide provides best practices for preventing Cross-Site Scripting (XSS) attacks in the AI Viz Portal.

## Overview

Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. This guide explains how to prevent XSS attacks using Content Security Policy (CSP) and DOMPurify sanitization.

## Key Principles

1. **Never trust user input** - Always sanitize and validate user-generated content
2. **Use CSP headers** - Content Security Policy provides an additional layer of protection
3. **Sanitize HTML** - Use DOMPurify to sanitize HTML content
4. **Use safe rendering components** - Use SafeHtml components for rendering user content
5. **Encode output** - Always encode data when rendering to HTML
6. **Regular testing** - Regularly test for XSS vulnerabilities

## Content Security Policy (CSP)

CSP is already configured in `next.config.ts` to provide XSS protection:

```typescript
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
}
```

## Using DOMPurify

DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.

### Sanitizing HTML

```typescript
import { sanitizeHtml, sanitizeHtmlStrict } from '@/lib/sanitizeUtils';

// Default sanitization (allows common formatting tags)
const safeHtml = sanitizeHtml(userInput);

// Strict sanitization (only allows basic formatting)
const strictSafeHtml = sanitizeHtmlStrict(userInput);
```

### Sanitizing URLs

```typescript
import { sanitizeUrl } from '@/lib/sanitizeUtils';

const safeUrl = sanitizeUrl(userInputUrl);

// This will block javascript:, data:, and other dangerous protocols
```

### Sanitizing Text

```typescript
import { sanitizeText } from '@/lib/sanitizeUtils';

// Removes all HTML and escapes special characters
const safeText = sanitizeText(userInput);
```

### Detecting XSS Patterns

```typescript
import { detectXSS } from '@/lib/sanitizeUtils';

if (detectXSS(userInput)) {
  console.warn('XSS pattern detected');
  // Take appropriate action
}
```

## Safe Rendering Components

Use the SafeHtml components for rendering user-generated content.

### SafeHtml Component

```typescript
import { SafeHtml } from '@/components/ui/SafeHtml';

// Render sanitized HTML
<SafeHtml html={userContent} />

// Render with strict sanitization
<SafeHtml html={userContent} strict={true} />

// Render with custom class
<SafeHtml html={userContent} className="custom-class" />
```

### SafeHtmlText Component

```typescript
import { SafeHtmlText } from '@/components/ui/SafeHtml';

// Render text only (no HTML)
<SafeHtmlText text={userText} />
```

### SafeHtmlLink Component

```typescript
import { SafeHtmlLink } from '@/components/ui/SafeHtml';

// Render safe link
<SafeHtmlLink url={userUrl} text={linkText} />

// Render external link with security attributes
<SafeHtmlLink url={userUrl} text={linkText} external={true} />
```

### SafeHtmlImage Component

```typescript
import { SafeHtmlImage } from '@/components/ui/SafeHtml';

// Render safe image
<SafeHtmlImage src={imageUrl} alt={imageAlt} />
```

## Best Practices

### 1. Always Sanitize User Input

Never render user input without sanitization.

```typescript
// ✅ Correct
import { SafeHtml } from '@/components/ui/SafeHtml';

<SafeHtml html={userContent} />

// ❌ Incorrect
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

### 2. Use SafeHtml Components

Use the provided SafeHtml components for rendering user content.

```typescript
// ✅ Correct
<SafeHtml html={userContent} />

// ❌ Incorrect
<div>{userContent}</div>
```

### 3. Sanitize URLs

Always sanitize URLs before using them in links or images.

```typescript
// ✅ Correct
import { sanitizeUrl } from '@/lib/sanitizeUtils';

const safeUrl = sanitizeUrl(userUrl);
<a href={safeUrl}>Link</a>

// ❌ Incorrect
<a href={userUrl}>Link</a>
```

### 4. Escape Text Content

When rendering text that may contain HTML entities, escape them.

```typescript
// ✅ Correct
import { SafeHtmlText } from '@/components/ui/SafeHtml';

<SafeHtmlText text={userText} />

// ❌ Incorrect
<div>{userText}</div>
```

### 5. Validate Input

Validate input before processing it.

```typescript
// ✅ Correct
import { detectXSS } from '@/lib/sanitizeUtils';

if (detectXSS(userInput)) {
  throw new Error('Invalid input');
}

const safeContent = sanitizeHtml(userInput);

// ❌ Incorrect
const safeContent = sanitizeHtml(userInput); // No validation
```

### 6. Use Strict Mode for Untrusted Content

Use strict sanitization for content from untrusted sources.

```typescript
// ✅ Correct
<SafeHtml html={untrustedContent} strict={true} />

// ❌ Incorrect
<SafeHtml html={untrustedContent} />
```

## Common XSS Vectors

### Script Tags

```typescript
// ❌ Dangerous
const input = "<script>alert('XSS')</script>";

// ✅ Safe
const safe = sanitizeHtml(input); // Removes script tag
```

### Event Handlers

```typescript
// ❌ Dangerous
const input = '<div onclick="alert(\'XSS\')">Click</div>';

// ✅ Safe
const safe = sanitizeHtml(input); // Removes onclick
```

### JavaScript Protocol

```typescript
// ❌ Dangerous
const input = '<a href="javascript:alert(\'XSS\')">Click</a>';

// ✅ Safe
const safe = sanitizeHtml(input); // Removes javascript:
```

### Data URLs

```typescript
// ❌ Dangerous
const input = '<img src="data:text/html,<script>alert(\'XSS\')</script>">';

// ✅ Safe
const safe = sanitizeHtml(input); // Removes data: URL
```

### Expression in CSS

```typescript
// ❌ Dangerous
const input = '<div style="xss:expression(alert(\'XSS\'))">';

// ✅ Safe
const safe = sanitizeHtml(input); // Removes expression
```

## Testing

Regularly test your application for XSS vulnerabilities.

### Unit Tests

```typescript
import { sanitizeHtml } from '@/lib/sanitizeUtils';

describe('XSS Prevention', () => {
  it('should remove script tags', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert(\'XSS\')">Click</div>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });
});
```

### Manual Testing

1. **Test with common XSS payloads**:
   - `<script>alert('XSS')</script>`
   - `<img src=x onerror=alert('XSS')>`
   - `<svg onload=alert('XSS')>`
   - `<iframe src="javascript:alert('XSS')"></iframe>`

2. **Test with encoded payloads**:
   - `<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('XSS')>`
   - `<IMG SRC=x onerror=&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>`

3. **Test with browser developer tools**:
   - Use browser extensions like XSSer
   - Test with OWASP XSSer
   - Use automated security scanners

## Monitoring

Monitor for XSS attempts and suspicious activity.

```typescript
import { detectXSS, logSecurityEvent } from '@/lib/securityAudit';

function handleUserInput(input: string) {
  if (detectXSS(input)) {
    logSecurityEvent({
      type: 'validation',
      severity: 'warning',
      message: 'XSS pattern detected in user input',
      details: { input }
    });
    throw new Error('Invalid input');
  }
  return sanitizeHtml(input);
}
```

## Configuration

### Default Allowed Tags

The default sanitization allows these HTML tags:
- `p`, `br`, `strong`, `em`, `u` - Text formatting
- `ul`, `ol`, `li` - Lists
- `a` - Links
- `h1`-`h6` - Headings
- `blockquote` - Block quotes
- `code`, `pre` - Code blocks
- `span`, `div` - Containers

### Default Allowed Attributes

The default sanitization allows these attributes:
- `href` - Link URLs
- `title` - Tooltips
- `target` - Link target
- `rel` - Link relationship
- `class` - CSS classes

### Custom Configuration

You can customize the sanitization options:

```typescript
import { sanitizeHtml, type SanitizeOptions } from '@/lib/sanitizeUtils';

const customOptions: SanitizeOptions = {
  ALLOWED_TAGS: ['p', 'strong', 'em'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
};

const safeHtml = sanitizeHtml(userInput, customOptions);
```

## Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)
