import { useState, useCallback } from "react";
import { createCursor, parseCursor, type CursorInfo } from "@/lib/cursor-pagination";

interface UseCursorPaginationOptions<T> {
  fetchData: (cursor?: string, limit?: number) => Promise<T[]>;
  initialLimit?: number;
}

interface UseCursorPaginationReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentCursor?: string;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  reset: () => void;
}

export function useCursorPagination<T extends { id: string; created_at: string }>({
  fetchData,
  initialLimit = 10,
}: UseCursorPaginationOptions<T>): UseCursorPaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cursors, setCursors] = useState<string[]>([]);
  const [cursorIndex, setCursorIndex] = useState(0);

  const fetchPage = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchData(cursor, initialLimit);
        setData(result);
        
        if (result.length > 0) {
          const newCursor = createCursor(result[result.length - 1]);
          setCursors((prev) => {
            const newCursors = [...prev];
            if (cursor === undefined) {
              newCursors[0] = newCursor;
            } else {
              const currentIndex = prev.indexOf(cursor);
              newCursors[currentIndex + 1] = newCursor;
            }
            return newCursors;
          });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, initialLimit]
  );

  const nextPage = useCallback(async () => {
    if (cursors[cursorIndex]) {
      setCursorIndex((prev) => prev + 1);
      await fetchPage(cursors[cursorIndex]);
    }
  }, [cursors, cursorIndex, fetchPage]);

  const previousPage = useCallback(async () => {
    if (cursorIndex > 0) {
      setCursorIndex((prev) => prev - 1);
      const previousCursor = cursorIndex > 1 ? cursors[cursorIndex - 2] : undefined;
      await fetchPage(previousCursor);
    }
  }, [cursorIndex, cursors, fetchPage]);

  const reset = useCallback(() => {
    setData([]);
    setCursors([]);
    setCursorIndex(0);
    setError(null);
    fetchPage();
  }, [fetchPage]);

  const hasNextPage = cursors[cursorIndex] !== undefined;
  const hasPreviousPage = cursorIndex > 0;
  const currentCursor = cursorIndex > 0 ? cursors[cursorIndex - 1] : undefined;

  return {
    data,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    currentCursor,
    nextPage,
    previousPage,
    reset,
  };
}
