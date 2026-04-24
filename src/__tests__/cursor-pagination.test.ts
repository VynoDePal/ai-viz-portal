import { describe, it, expect } from "vitest";
import {
  encodeCursor,
  decodeCursor,
  createCursor,
  parseCursor,
  buildPaginationParams,
} from "@/lib/cursor-pagination";

describe("Cursor Pagination Utilities", () => {
  describe("encodeCursor", () => {
    it("should encode cursor info to base64", () => {
      const cursorInfo = { id: "test-id", timestamp: "2024-01-01T00:00:00Z" };
      const encoded = encodeCursor(cursorInfo);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe("string");
    });

    it("should encode different cursor info to different strings", () => {
      const cursorInfo1 = { id: "id-1", timestamp: "2024-01-01T00:00:00Z" };
      const cursorInfo2 = { id: "id-2", timestamp: "2024-01-01T00:00:00Z" };
      const encoded1 = encodeCursor(cursorInfo1);
      const encoded2 = encodeCursor(cursorInfo2);
      expect(encoded1).not.toBe(encoded2);
    });
  });

  describe("decodeCursor", () => {
    it("should decode cursor info from base64", () => {
      const cursorInfo = { id: "test-id", timestamp: "2024-01-01T00:00:00Z" };
      const encoded = encodeCursor(cursorInfo);
      const decoded = decodeCursor(encoded);
      expect(decoded).toEqual(cursorInfo);
    });

    it("should return null for invalid cursor", () => {
      const decoded = decodeCursor("invalid-cursor");
      expect(decoded).toBeNull();
    });
  });

  describe("createCursor", () => {
    it("should create cursor from item", () => {
      const item = { id: "test-id", created_at: "2024-01-01T00:00:00Z" };
      const cursor = createCursor(item);
      expect(cursor).toBeTruthy();
      expect(typeof cursor).toBe("string");
    });

    it("should create decodable cursor", () => {
      const item = { id: "test-id", created_at: "2024-01-01T00:00:00Z" };
      const cursor = createCursor(item);
      const decoded = decodeCursor(cursor);
      expect(decoded).toEqual({
        id: item.id,
        timestamp: item.created_at,
      });
    });
  });

  describe("parseCursor", () => {
    it("should parse cursor to cursor info", () => {
      const cursorInfo = { id: "test-id", timestamp: "2024-01-01T00:00:00Z" };
      const encoded = encodeCursor(cursorInfo);
      const parsed = parseCursor(encoded);
      expect(parsed).toEqual(cursorInfo);
    });

    it("should return null for invalid cursor", () => {
      const parsed = parseCursor("invalid-cursor");
      expect(parsed).toBeNull();
    });
  });

  describe("buildPaginationParams", () => {
    it("should build pagination params with cursor", () => {
      const params = buildPaginationParams("test-cursor", 10);
      expect(params).toEqual({
        cursor: "test-cursor",
        limit: 10,
      });
    });

    it("should build pagination params without cursor", () => {
      const params = buildPaginationParams(undefined, 10);
      expect(params).toEqual({
        cursor: undefined,
        limit: 10,
      });
    });

    it("should use default limit if not provided", () => {
      const params = buildPaginationParams();
      expect(params).toEqual({
        cursor: undefined,
        limit: 10,
      });
    });

    it("should use custom limit", () => {
      const params = buildPaginationParams("test-cursor", 20);
      expect(params.limit).toBe(20);
    });
  });
});
