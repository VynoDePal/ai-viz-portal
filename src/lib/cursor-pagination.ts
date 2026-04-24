/**
 * Cursor-based pagination utilities
 */

export interface CursorInfo {
  id: string;
  timestamp: string;
}

/**
 * Encode cursor information to a base64 string
 * @param cursorInfo - Cursor information to encode
 * @returns Encoded cursor string
 */
export function encodeCursor(cursorInfo: CursorInfo): string {
  const cursorString = JSON.stringify(cursorInfo);
  return Buffer.from(cursorString).toString("base64");
}

/**
 * Decode cursor string to cursor information
 * @param cursor - Encoded cursor string
 * @returns Decoded cursor information or null if invalid
 */
export function decodeCursor(cursor: string): CursorInfo | null {
  try {
    const cursorString = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(cursorString) as CursorInfo;
  } catch (error) {
    console.error("Error decoding cursor:", error);
    return null;
  }
}

/**
 * Create cursor from an item
 * @param item - Item with id and created_at timestamp
 * @returns Encoded cursor string
 */
export function createCursor(item: { id: string; created_at: string }): string {
  return encodeCursor({
    id: item.id,
    timestamp: item.created_at,
  });
}

/**
 * Parse cursor to get the ID and timestamp
 * @param cursor - Encoded cursor string
 * @returns Cursor information or null
 */
export function parseCursor(cursor: string): CursorInfo | null {
  return decodeCursor(cursor);
}

/**
 * Build pagination parameters from cursor
 * @param cursor - Optional cursor string
 * @param limit - Number of items per page
 * @returns Pagination parameters
 */
export function buildPaginationParams(
  cursor?: string,
  limit: number = 10
): {
  cursor?: string;
  limit: number;
} {
  return {
    cursor,
    limit,
  };
}
