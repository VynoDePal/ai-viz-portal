/**
 * Web Worker for calculating rankings
 * This worker calculates ranks for models based on a specified field
 */

interface ModelWithRank {
  id: string;
  [key: string]: any;
}

interface RankedModel extends ModelWithRank {
  rank: number;
}

export function calculateRanking(
  models: ModelWithRank[],
  sortField: string,
  sortDirection: "asc" | "desc" = "desc"
): RankedModel[] {
  // Sort models
  const sorted = [...models].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Add rank to each model
  return sorted.map((model, index) => ({
    ...model,
    rank: index + 1,
  }));
}

// Worker message handler
self.onmessage = (e: MessageEvent) => {
  try {
    const { models, sortField, sortDirection } = e.data;
    const result = calculateRanking(models, sortField, sortDirection);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
