import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeHtmlStrict,
  sanitizeUrl,
  sanitizeText,
  detectXSS,
  sanitizeUserInput,
  sanitizeAttribute,
  sanitizeJSON,
} from "@/lib/sanitizeUtils";

describe("XSS Prevention", () => {
  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeHtml(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("onclick");
    });

    it("should allow safe HTML tags", () => {
      const input = "<p>Safe <strong>content</strong></p>";
      const result = sanitizeHtml(input);
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
    });

    it("should remove javascript: protocol", () => {
      const input = '<a href="javascript:alert(\'xss\')">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("javascript:");
    });
  });

  describe("sanitizeHtmlStrict", () => {
    it("should only allow basic formatting", () => {
      const input = "<p><a href='http://example.com'>Link</a></p>";
      const result = sanitizeHtmlStrict(input);
      expect(result).toContain("<p>");
      expect(result).not.toContain("<a>");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow http URLs", () => {
      const result = sanitizeUrl("http://example.com");
      expect(result).toBe("http://example.com");
    });

    it("should allow https URLs", () => {
      const result = sanitizeUrl("https://example.com");
      expect(result).toBe("https://example.com");
    });

    it("should block javascript: URLs", () => {
      const result = sanitizeUrl("javascript:alert('xss')");
      expect(result).toBe("");
    });

    it("should block data: URLs", () => {
      const result = sanitizeUrl("data:text/html,<script>alert('xss')</script>");
      expect(result).toBe("");
    });

    it("should allow relative URLs", () => {
      const result = sanitizeUrl("/path/to/page");
      expect(result).toBe("/path/to/page");
    });

    it("should allow mailto: URLs", () => {
      const result = sanitizeUrl("mailto:test@example.com");
      expect(result).toBe("mailto:test@example.com");
    });
  });

  describe("sanitizeText", () => {
    it("should escape HTML entities", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeText(input);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).not.toContain("<script>");
    });
  });

  describe("detectXSS", () => {
    it("should detect script tags", () => {
      expect(detectXSS("<script>alert('xss')</script>")).toBe(true);
    });

    it("should detect javascript: protocol", () => {
      expect(detectXSS("javascript:alert('xss')")).toBe(true);
    });

    it("should detect event handlers", () => {
      expect(detectXSS("onclick='alert(\"xss\")'")).toBe(true);
    });

    it("should detect iframe tags", () => {
      expect(detectXSS("<iframe src='evil.com'></iframe>")).toBe(true);
    });

    it("should detect eval() calls", () => {
      expect(detectXSS("eval('malicious code')")).toBe(true);
    });

    it("should not detect safe content", () => {
      expect(detectXSS("Safe content without XSS")).toBe(false);
    });
  });

  describe("sanitizeUserInput", () => {
    it("should sanitize HTML input", () => {
      const input = "<p>Safe content</p>";
      const result = sanitizeUserInput(input);
      expect(result).toContain("<p>");
    });

    it("should remove XSS patterns", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeUserInput(input);
      expect(result).not.toContain("<script>");
    });
  });

  describe("sanitizeAttribute", () => {
    it("should escape quotes", () => {
      const input = 'value"with"quotes';
      const result = sanitizeAttribute(input);
      expect(result).toContain("&quot;");
      expect(result).not.toContain('"');
    });

    it("should escape angle brackets", () => {
      const input = "value<brackets>";
      const result = sanitizeAttribute(input);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });

    it("should escape ampersands", () => {
      const input = "value&test";
      const result = sanitizeAttribute(input);
      expect(result).toContain("&amp;");
      expect(result).not.toContain("&");
    });
  });

  describe("sanitizeJSON", () => {
    it("should sanitize string values", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeJSON(input);
      expect(result).toContain("&lt;");
      expect(result).not.toContain("<script>");
    });

    it("should sanitize array values", () => {
      const input = ["<script>alert('xss')</script>", "safe"];
      const result = sanitizeJSON(input);
      expect(result[0]).toContain("&lt;");
      expect(result[1]).toBe("safe");
    });

    it("should sanitize object values", () => {
      const input = { key: "<script>alert('xss')</script>" };
      const result = sanitizeJSON(input);
      expect(result.key).toContain("&lt;");
    });

    it("should preserve non-string values", () => {
      const input = { number: 42, boolean: true, null: null };
      const result = sanitizeJSON(input);
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.null).toBe(null);
    });
  });

  describe("Common XSS payloads", () => {
    it("should block classic XSS", () => {
      const payload = "<IMG SRC=\"javascript:alert('XSS');\">";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("javascript:");
    });

    it("should block XSS with quotes", () => {
      const payload = "<IMG SRC=javascript:alert('XSS')>";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("javascript:");
    });

    it("should block XSS without semicolon", () => {
      const payload = "<IMG SRC=javascript:alert('XSS')>";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("javascript:");
    });

    it("should block XSS with encoded characters", () => {
      const payload = "<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('XSS')>";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("alert");
    });

    it("should block XSS with expression", () => {
      const payload = "<IMG STYLE=\"xss:expression(alert('XSS'))\">";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("expression");
    });

    it("should block XSS with style attribute", () => {
      const payload = "<DIV STYLE=\"background-image: url(javascript:alert('XSS'))\">";
      const result = sanitizeHtml(payload);
      expect(result).not.toContain("javascript:");
    });
  });
});
