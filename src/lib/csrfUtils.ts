/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */

export interface CSRFToken {
  token: string;
  expiresAt: Date;
}

export interface CSRFConfig {
  tokenLength?: number;
  tokenExpiration?: number; // in milliseconds
  cookieName?: string;
  headerName?: string;
}

const DEFAULT_CONFIG: CSRFConfig = {
  tokenLength: 32,
  tokenExpiration: 3600000, // 1 hour
  cookieName: "csrf_token",
  headerName: "x-csrf-token",
};

// In-memory token store (for development)
// In production, use Redis or database
const tokenStore = new Map<string, CSRFToken>();

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(config: CSRFConfig = DEFAULT_CONFIG): string {
  const { tokenLength = 32 } = config;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  
  for (let i = 0; i < tokenLength; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
}

/**
 * Create a CSRF token with expiration
 */
export function createCSRFToken(sessionId: string, config: CSRFConfig = DEFAULT_CONFIG): CSRFToken {
  const { tokenExpiration = 3600000 } = config;
  const token = generateCSRFToken(config);
  const expiresAt = new Date(Date.now() + tokenExpiration);
  
  const csrfToken: CSRFToken = { token, expiresAt };
  tokenStore.set(sessionId, csrfToken);
  
  return csrfToken;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(
  sessionId: string,
  providedToken: string,
  config: CSRFConfig = DEFAULT_CONFIG
): boolean {
  const { cookieName = "csrf_token", headerName = "x-csrf-token" } = config;
  
  const storedToken = tokenStore.get(sessionId);
  
  if (!storedToken) {
    return false;
  }
  
  // Check if token has expired
  if (new Date() > storedToken.expiresAt) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  // Compare tokens
  return storedToken.token === providedToken;
}

/**
 * Get CSRF token for a session
 */
export function getCSRFToken(sessionId: string): CSRFToken | null {
  const token = tokenStore.get(sessionId);
  
  if (!token) {
    return null;
  }
  
  // Check if token has expired
  if (new Date() > token.expiresAt) {
    tokenStore.delete(sessionId);
    return null;
  }
  
  return token;
}

/**
 * Refresh CSRF token
 */
export function refreshCSRFToken(sessionId: string, config: CSRFConfig = DEFAULT_CONFIG): CSRFToken {
  // Remove old token
  tokenStore.delete(sessionId);
  
  // Create new token
  return createCSRFToken(sessionId, config);
}

/**
 * Revoke CSRF token
 */
export function revokeCSRFToken(sessionId: string): void {
  tokenStore.delete(sessionId);
}

/**
 * Clean up expired tokens
 */
export function cleanupExpiredTokens(): void {
  const now = new Date();
  
  for (const [sessionId, token] of tokenStore.entries()) {
    if (now > token.expiresAt) {
      tokenStore.delete(sessionId);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredTokens, 300000);
}

/**
 * Generate CSRF cookie value (double-submit pattern)
 */
export function generateCSRFCookie(token: string): string {
  // In production, this should be signed or encrypted
  return token;
}

/**
 * Validate CSRF cookie value
 */
export function validateCSRFCookie(cookieValue: string, token: string): boolean {
  // In production, verify signature or decrypt
  return cookieValue === token;
}

/**
 * Extract CSRF token from request
 */
export function extractCSRFTokenFromRequest(
  headers: Headers,
  config: CSRFConfig = DEFAULT_CONFIG
): string | null {
  const { headerName = "x-csrf-token" } = config;
  
  // Check header
  const headerToken = headers.get(headerName);
  if (headerToken) {
    return headerToken;
  }
  
  // Check body (for form submissions)
  // This would be handled in the middleware
  
  return null;
}

/**
 * Check if request requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const csrfProtectedMethods = ["POST", "PUT", "PATCH", "DELETE"];
  return csrfProtectedMethods.includes(method.toUpperCase());
}

/**
 * Get CSRF configuration
 */
export function getCSRFConfig(): CSRFConfig {
  return DEFAULT_CONFIG;
}

/**
 * Set CSRF configuration
 */
export function setCSRFConfig(config: Partial<CSRFConfig>): void {
  Object.assign(DEFAULT_CONFIG, config);
}
