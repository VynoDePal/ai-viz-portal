/**
 * Calculate Intelligence Score (weighted average of benchmark performance)
 * @param benchmarkScores - Array of benchmark scores
 * @param weights - Array of weights for each benchmark (default equal weights)
 * @returns Intelligence score (0-100)
 */
export function calculateIntelligenceScore(
  benchmarkScores: number[],
  weights?: number[]
): number {
  if (benchmarkScores.length === 0) return 0;

  const defaultWeights = Array(benchmarkScores.length).fill(1);
  const usedWeights = weights || defaultWeights;

  const totalWeight = usedWeights.reduce((sum, weight) => sum + weight, 0);
  const weightedSum = benchmarkScores.reduce(
    (sum, score, index) => sum + score * usedWeights[index],
    0
  );

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate Speed Score (combined latency and throughput metrics)
 * @param latencyMs - Average latency in milliseconds
 * @param throughputRps - Throughput in requests per second
 * @returns Speed score (0-100)
 */
export function calculateSpeedScore(
  latencyMs: number,
  throughputRps: number
): number {
  if (latencyMs <= 0 && throughputRps <= 0) return 0;

  // Normalize latency: lower is better (inverse relationship)
  // Base on 1000ms as reference (1000ms = 0 points, 0ms = 50 points)
  const latencyScore = Math.max(0, 50 - (latencyMs / 1000) * 50);

  // Normalize throughput: higher is better
  // Base on 100 RPS as reference (100 RPS = 50 points, 0 RPS = 0 points)
  const throughputScore = Math.min(50, (throughputRps / 100) * 50);

  const totalScore = latencyScore + throughputScore;
  return Math.min(100, Math.max(0, totalScore));
}

/**
 * Calculate Value Score (cost efficiency ratio)
 * @param benchmarkScore - Average benchmark score
 * @param costPer1KTokens - Cost per 1K tokens in USD
 * @returns Value score (0-100)
 */
export function calculateValueScore(
  benchmarkScore: number,
  costPer1KTokens: number
): number {
  if (costPer1KTokens <= 0) return 0;

  // Value = score / cost (higher is better)
  // Normalize to 0-100 scale
  const valueRatio = benchmarkScore / costPer1KTokens;
  
  // Base on 1000 as reference (value ratio of 1000 = 100 points)
  const score = Math.min(100, (valueRatio / 1000) * 100);
  return Math.max(0, score);
}

/**
 * Calculate Overall Score (weighted combination of all three scores)
 * @param intelligenceScore - Intelligence score (0-100)
 * @param speedScore - Speed score (0-100)
 * @param valueScore - Value score (0-100)
 * @param weights - Weights for each score (default: 40% Intelligence, 30% Speed, 30% Value)
 * @returns Overall score (0-100)
 */
export function calculateOverallScore(
  intelligenceScore: number,
  speedScore: number,
  valueScore: number,
  weights?: { intelligence: number; speed: number; value: number }
): number {
  const defaultWeights = { intelligence: 0.4, speed: 0.3, value: 0.3 };
  const usedWeights = weights || defaultWeights;

  const totalScore =
    intelligenceScore * usedWeights.intelligence +
    speedScore * usedWeights.speed +
    valueScore * usedWeights.value;

  return Math.min(100, Math.max(0, totalScore));
}

/**
 * Calculate all composite scores for a model
 * @param benchmarkScores - Array of benchmark scores
 * @param latencyMs - Average latency in milliseconds
 * @param throughputRps - Throughput in requests per second
 * @param costPer1KTokens - Cost per 1K tokens in USD
 * @param weights - Optional weights for calculations
 * @returns Object with all composite scores
 */
export function calculateAllCompositeScores(
  benchmarkScores: number[],
  latencyMs: number,
  throughputRps: number,
  costPer1KTokens: number,
  weights?: {
    benchmarkWeights?: number[];
    scoreWeights?: { intelligence: number; speed: number; value: number };
  }
) {
  const avgBenchmarkScore =
    benchmarkScores.length > 0
      ? benchmarkScores.reduce((sum, score) => sum + score, 0) /
        benchmarkScores.length
      : 0;

  const intelligenceScore = calculateIntelligenceScore(
    benchmarkScores,
    weights?.benchmarkWeights
  );
  const speedScore = calculateSpeedScore(latencyMs, throughputRps);
  const valueScore = calculateValueScore(avgBenchmarkScore, costPer1KTokens);
  const overallScore = calculateOverallScore(
    intelligenceScore,
    speedScore,
    valueScore,
    weights?.scoreWeights
  );

  return {
    intelligenceScore: parseFloat(intelligenceScore.toFixed(2)),
    speedScore: parseFloat(speedScore.toFixed(2)),
    valueScore: parseFloat(valueScore.toFixed(2)),
    overallScore: parseFloat(overallScore.toFixed(2)),
  };
}
