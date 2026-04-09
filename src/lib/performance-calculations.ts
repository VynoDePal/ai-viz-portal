/**
 * Calculate API cost per 1K tokens based on model parameters
 * @param parameters - Model parameter count in billions
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Cost in USD per 1K tokens
 */
export function calculateCostPer1KTokens(
  parameters: number,
  inputTokens: number,
  outputTokens: number
): number {
  // Simplified cost calculation based on model size
  // In a real implementation, this would use actual API pricing
  const baseCostPer1K = parameters * 0.001; // $0.001 per 1K tokens per billion parameters
  const totalTokens = inputTokens + outputTokens;
  const totalCost = (totalTokens / 1000) * baseCostPer1K;
  return parseFloat(totalCost.toFixed(4));
}

/**
 * Calculate cost efficiency score
 * @param score - Benchmark score
 * @param costPer1KTokens - Cost per 1K tokens
 * @returns Cost efficiency score (higher is better)
 */
export function calculateCostEfficiencyScore(
  score: number,
  costPer1KTokens: number
): number {
  if (costPer1KTokens === 0) return 0;
  const efficiency = score / costPer1KTokens;
  return parseFloat(efficiency.toFixed(4));
}

/**
 * Calculate average latency from measurements
 * @param latencies - Array of latency measurements in ms
 * @returns Average latency in ms
 */
export function calculateAverageLatency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  const sum = latencies.reduce((a, b) => a + b, 0);
  return Math.round(sum / latencies.length);
}

/**
 * Calculate throughput in requests per second
 * @param requestCount - Number of requests
 * @param durationSeconds - Duration in seconds
 * @returns Throughput in requests per second
 */
export function calculateThroughput(
  requestCount: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  const throughput = requestCount / durationSeconds;
  return parseFloat(throughput.toFixed(2));
}
