/**
 * XSS prevention utilities using DOMPurify
 */

import DOMPurify from "isomorphic-dompurify";

export interface SanitizeOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  ALLOW_UNKNOWN_PROTOCOLS?: boolean;
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
}

/**
 * Default sanitization options for user-generated content
 */
const DEFAULT_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
    "span",
    "div",
  ],
  ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ADD_ATTR: ["target"],
};

/**
 * Strict sanitization options for untrusted content
 */
const STRICT_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u"],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = DEFAULT_OPTIONS): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, options);
}

/**
 * Sanitize HTML with strict options
 */
export function sanitizeHtmlStrict(html: string): string {
  return sanitizeHtml(html, STRICT_OPTIONS);
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  // Allow only http, https, and relative URLs
  const allowedProtocols = ["http:", "https:", "/", "#", "?", "mailto:", "tel:"];
  
  // Check if URL starts with allowed protocol
  const hasAllowedProtocol = allowedProtocols.some((protocol) =>
    url.toLowerCase().startsWith(protocol)
  );

  if (!hasAllowedProtocol) {
    return "";
  }

  // Remove javascript: protocol
  if (url.toLowerCase().startsWith("javascript:")) {
    return "";
  }

  return DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text content (remove all HTML)
 */
export function sanitizeText(text: string): string {
  if (!text) return "";

  const tempDiv = document.createElement("div");
  tempDiv.textContent = text;
  return tempDiv.innerHTML;
}

/**
 * Check if string contains XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<button/i,
    /document\./i,
    /window\./i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  // First check for XSS patterns
  if (detectXSS(input)) {
    console.warn("XSS pattern detected in user input");
    return sanitizeText(input);
  }

  // Sanitize as HTML
  return sanitizeHtml(input);
}

/**
 * Sanitize attribute value
 */
export function sanitizeAttribute(value: string): string {
  if (!value) return "";

  return value
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");
}

/**
 * Sanitize JSON data for safe rendering
 */
export function sanitizeJSON(data: any): any {
  if (typeof data === "string") {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeJSON);
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Configure DOMPurify with custom hooks
 */
export function configureDOMPurify(): void {
  DOMPurify.addHook("uponSanitizeAttribute", (node, data, config) => {
    // Prevent data-* attributes unless explicitly allowed
    if (data.attrName?.startsWith("data-") && !config.ALLOW_DATA_ATTR) {
      node.removeAttribute(data.attrName!);
      return;
    }

    // Sanitize href attributes
    if (data.attrName === "href" && data.attrValue) {
      data.attrValue = sanitizeUrl(data.attrValue);
    }

    // Prevent on* event handlers
    if (data.attrName?.startsWith("on")) {
      node.removeAttribute(data.attrName!);
    }
  });

  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    // Prevent script tags
    if (data.tagName === "script") {
      node.parentNode?.removeChild(node);
      return;
    }

    // Prevent iframe tags
    if (data.tagName === "iframe") {
      node.parentNode?.removeChild(node);
      return;
    }

    // Prevent object tags
    if (data.tagName === "object") {
      node.parentNode?.removeChild(node);
      return;
    }
  });
}

// Initialize DOMPurify hooks
if (typeof window !== "undefined") {
  configureDOMPurify();
}
