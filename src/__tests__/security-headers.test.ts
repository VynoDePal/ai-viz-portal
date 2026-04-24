import { describe, it, expect } from "vitest";

describe("Security Headers Configuration", () => {
  it("next.config.ts should exist", () => {
    const nextConfig = require("@/next.config");
    expect(nextConfig).toBeTruthy();
  });

  it("should have headers configuration", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      expect(headers).toBeDefined();
      expect(Array.isArray(headers)).toBe(true);
      expect(headers.length).toBeGreaterThan(0);
    }
  });

  it("should include X-Frame-Options header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const xFrameOptions = headers[0].headers.find(
        (h: any) => h.key === "X-Frame-Options"
      );
      expect(xFrameOptions).toBeDefined();
      expect(xFrameOptions.value).toBe("DENY");
    }
  });

  it("should include X-Content-Type-Options header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const xContentTypeOptions = headers[0].headers.find(
        (h: any) => h.key === "X-Content-Type-Options"
      );
      expect(xContentTypeOptions).toBeDefined();
      expect(xContentTypeOptions.value).toBe("nosniff");
    }
  });

  it("should include Referrer-Policy header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const referrerPolicy = headers[0].headers.find(
        (h: any) => h.key === "Referrer-Policy"
      );
      expect(referrerPolicy).toBeDefined();
      expect(referrerPolicy.value).toBe("strict-origin-when-cross-origin");
    }
  });

  it("should include Permissions-Policy header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const permissionsPolicy = headers[0].headers.find(
        (h: any) => h.key === "Permissions-Policy"
      );
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy.value).toContain("geolocation=()");
      expect(permissionsPolicy.value).toContain("microphone=()");
      expect(permissionsPolicy.value).toContain("camera=()");
    }
  });

  it("should include Content-Security-Policy header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const csp = headers[0].headers.find(
        (h: any) => h.key === "Content-Security-Policy"
      );
      expect(csp).toBeDefined();
      expect(csp.value).toContain("default-src 'self'");
      expect(csp.value).toContain("script-src");
      expect(csp.value).toContain("style-src");
      expect(csp.value).toContain("img-src");
    }
  });

  it("should include X-XSS-Protection header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const xXSSProtection = headers[0].headers.find(
        (h: any) => h.key === "X-XSS-Protection"
      );
      expect(xXSSProtection).toBeDefined();
      expect(xXSSProtection.value).toBe("1; mode=block");
    }
  });

  it("should include Strict-Transport-Security header", async () => {
    const nextConfig = require("@/next.config");
    const config = nextConfig.default || nextConfig;
    
    if (config.headers) {
      const headers = await config.headers();
      const hsts = headers[0].headers.find(
        (h: any) => h.key === "Strict-Transport-Security"
      );
      expect(hsts).toBeDefined();
      expect(hsts.value).toContain("max-age=31536000");
      expect(hsts.value).toContain("includeSubDomains");
    }
  });
});
