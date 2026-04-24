/**
 * Web Worker for calculating statistics
 * This worker calculates mean, median, standard deviation, and other statistics
 */

export function calculateStatistics(values: number[]) {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      variance: 0,
      sum: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Median
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  // Variance and standard deviation
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    count: values.length,
    mean,
    median,
    min,
    max,
    standardDeviation,
    variance,
    sum,
  };
}

// Worker message handler
self.onmessage = (e: MessageEvent) => {
  try {
    const { values } = e.data;
    const result = calculateStatistics(values);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
