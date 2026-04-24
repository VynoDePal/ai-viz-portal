import { describe, it, expect, beforeEach } from "vitest";
import {
  generateCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  getCSRFToken,
  refreshCSRFToken,
  revokeCSRFToken,
  cleanupExpiredTokens,
  generateCSRFCookie,
  validateCSRFCookie,
  extractCSRFTokenFromRequest,
  requiresCSRFProtection,
  getCSRFConfig,
  setCSRFConfig,
  type CSRFConfig,
} from "@/lib/csrfUtils";

describe("CSRF Protection", () => {
  beforeEach(() => {
    // Clean up tokens before each test
    cleanupExpiredTokens();
  });

  describe("generateCSRFToken", () => {
    it("should generate a token with default length", () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(32);
    });

    it("should generate a token with custom length", () => {
      const token = generateCSRFToken({ tokenLength: 16 });
      expect(token).toHaveLength(16);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("createCSRFToken", () => {
    it("should create a CSRF token with expiration", () => {
      const sessionId = "test-session";
      const csrfToken = createCSRFToken(sessionId);
      expect(csrfToken.token).toBeDefined();
      expect(csrfToken.expiresAt).toBeInstanceOf(Date);
      expect(csrfToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should create a token with custom expiration", () => {
      const sessionId = "test-session";
      const csrfToken = createCSRFToken(sessionId, { tokenExpiration: 1000 });
      const expirationTime = csrfToken.expiresAt.getTime();
      const expectedExpiration = Date.now() + 1000;
      expect(expirationTime).toBeGreaterThanOrEqual(expectedExpiration - 100);
      expect(expirationTime).toBeLessThanOrEqual(expectedExpiration + 100);
    });
  });

  describe("validateCSRFToken", () => {
    it("should validate a valid token", () => {
      const sessionId = "test-session";
      const csrfToken = createCSRFToken(sessionId);
      const isValid = validateCSRFToken(sessionId, csrfToken.token);
      expect(isValid).toBe(true);
    });

    it("should reject an invalid token", () => {
      const sessionId = "test-session";
      createCSRFToken(sessionId);
      const isValid = validateCSRFToken(sessionId, "invalid-token");
      expect(isValid).toBe(false);
    });

    it("should reject a token for non-existent session", () => {
      const isValid = validateCSRFToken("non-existent", "any-token");
      expect(isValid).toBe(false);
    });

    it("should reject an expired token", () => {
      const sessionId = "test-session";
      const csrfToken = createCSRFToken(sessionId, { tokenExpiration: -1000 });
      const isValid = validateCSRFToken(sessionId, csrfToken.token);
      expect(isValid).toBe(false);
    });
  });

  describe("getCSRFToken", () => {
    it("should retrieve a valid token", () => {
      const sessionId = "test-session";
      const createdToken = createCSRFToken(sessionId);
      const retrievedToken = getCSRFToken(sessionId);
      expect(retrievedToken).toBeDefined();
      expect(retrievedToken?.token).toBe(createdToken.token);
    });

    it("should return null for non-existent session", () => {
      const token = getCSRFToken("non-existent");
      expect(token).toBeNull();
    });

    it("should return null for expired token", () => {
      const sessionId = "test-session";
      createCSRFToken(sessionId, { tokenExpiration: -1000 });
      const token = getCSRFToken(sessionId);
      expect(token).toBeNull();
    });
  });

  describe("refreshCSRFToken", () => {
    it("should refresh a token", () => {
      const sessionId = "test-session";
      const oldToken = createCSRFToken(sessionId);
      const newToken = refreshCSRFToken(sessionId);
      expect(newToken.token).not.toBe(oldToken.token);
      expect(newToken.expiresAt.getTime()).toBeGreaterThan(oldToken.expiresAt.getTime());
    });
  });

  describe("revokeCSRFToken", () => {
    it("should revoke a token", () => {
      const sessionId = "test-session";
      createCSRFToken(sessionId);
      revokeCSRFToken(sessionId);
      const token = getCSRFToken(sessionId);
      expect(token).toBeNull();
    });
  });

  describe("cleanupExpiredTokens", () => {
    it("should remove expired tokens", () => {
      const session1 = "session-1";
      const session2 = "session-2";
      createCSRFToken(session1, { tokenExpiration: -1000 });
      createCSRFToken(session2, { tokenExpiration: 3600000 });
      
      cleanupExpiredTokens();
      
      expect(getCSRFToken(session1)).toBeNull();
      expect(getCSRFToken(session2)).not.toBeNull();
    });
  });

  describe("generateCSRFCookie", () => {
    it("should generate a cookie value", () => {
      const token = "test-token";
      const cookieValue = generateCSRFCookie(token);
      expect(cookieValue).toBe(token);
    });
  });

  describe("validateCSRFCookie", () => {
    it("should validate a matching cookie", () => {
      const token = "test-token";
      const cookieValue = generateCSRFCookie(token);
      const isValid = validateCSRFCookie(cookieValue, token);
      expect(isValid).toBe(true);
    });

    it("should reject a non-matching cookie", () => {
      const token = "test-token";
      const cookieValue = "different-token";
      const isValid = validateCSRFCookie(cookieValue, token);
      expect(isValid).toBe(false);
    });
  });

  describe("extractCSRFTokenFromRequest", () => {
    it("should extract token from header", () => {
      const headers = new Headers();
      headers.set("x-csrf-token", "test-token");
      const token = extractCSRFTokenFromRequest(headers);
      expect(token).toBe("test-token");
    });

    it("should return null when token is missing", () => {
      const headers = new Headers();
      const token = extractCSRFTokenFromRequest(headers);
      expect(token).toBeNull();
    });

    it("should use custom header name", () => {
      const headers = new Headers();
      headers.set("x-custom-csrf", "test-token");
      const token = extractCSRFTokenFromRequest(headers, { headerName: "x-custom-csrf" });
      expect(token).toBe("test-token");
    });
  });

  describe("requiresCSRFProtection", () => {
    it("should require protection for POST", () => {
      expect(requiresCSRFProtection("POST")).toBe(true);
    });

    it("should require protection for PUT", () => {
      expect(requiresCSRFProtection("PUT")).toBe(true);
    });

    it("should require protection for PATCH", () => {
      expect(requiresCSRFProtection("PATCH")).toBe(true);
    });

    it("should require protection for DELETE", () => {
      expect(requiresCSRFProtection("DELETE")).toBe(true);
    });

    it("should not require protection for GET", () => {
      expect(requiresCSRFProtection("GET")).toBe(false);
    });

    it("should not require protection for HEAD", () => {
      expect(requiresCSRFProtection("HEAD")).toBe(false);
    });

    it("should not require protection for OPTIONS", () => {
      expect(requiresCSRFProtection("OPTIONS")).toBe(false);
    });

    it("should handle case-insensitive method names", () => {
      expect(requiresCSRFProtection("post")).toBe(true);
      expect(requiresCSRFProtection("Post")).toBe(true);
    });
  });

  describe("getCSRFConfig", () => {
    it("should return default configuration", () => {
      const config = getCSRFConfig();
      expect(config.tokenLength).toBe(32);
      expect(config.tokenExpiration).toBe(3600000);
      expect(config.cookieName).toBe("csrf_token");
      expect(config.headerName).toBe("x-csrf-token");
    });
  });

  describe("setCSRFConfig", () => {
    it("should update configuration", () => {
      setCSRFConfig({ tokenLength: 16 });
      const config = getCSRFConfig();
      expect(config.tokenLength).toBe(16);
    });

    it("should preserve default values for unset properties", () => {
      setCSRFConfig({ tokenLength: 16 });
      const config = getCSRFConfig();
      expect(config.tokenExpiration).toBe(3600000);
      expect(config.cookieName).toBe("csrf_token");
    });
  });
});
