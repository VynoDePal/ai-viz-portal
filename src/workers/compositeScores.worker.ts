/**
 * Web Worker for calculating composite scores
 * This worker calculates intelligence, speed, value, and overall scores for models
 */

interface ModelWithScores {
  id: string;
  name: string;
  benchmark_results?: Array<{
    score: number;
    benchmark?: {
      type: string;
      name: string;
    };
  }>;
  parameters?: number;
  cost_per_1k_tokens?: number;
}

interface ModelWithCompositeScores extends ModelWithScores {
  intelligence_score?: number;
  speed_score?: number;
  value_score?: number;
  overall_score?: number;
}

export function calculateCompositeScores(models: ModelWithScores[]): ModelWithCompositeScores[] {
  return models.map((model) => {
    const results = model.benchmark_results || [];
    
    // Intelligence score: average of reasoning benchmarks
    const reasoningResults = results.filter(
      (r) => r.benchmark?.type === "reasoning" || r.benchmark?.name?.toLowerCase().includes("reasoning")
    );
    const intelligenceScore = reasoningResults.length > 0
      ? reasoningResults.reduce((sum, r) => sum + (r.score || 0), 0) / reasoningResults.length
      : undefined;

    // Speed score: average of speed benchmarks
    const speedResults = results.filter(
      (r) => r.benchmark?.type === "speed" || r.benchmark?.name?.toLowerCase().includes("speed")
    );
    const speedScore = speedResults.length > 0
      ? speedResults.reduce((sum, r) => sum + (r.score || 0), 0) / speedResults.length
      : undefined;

    // Value score: based on cost and performance
    const valueScore = model.cost_per_1k_tokens && model.parameters
      ? (intelligenceScore || speedScore || 0) / (model.cost_per_1k_tokens * Math.log10(model.parameters + 1))
      : undefined;

    // Overall score: weighted average
    const overallScore =
      intelligenceScore && speedScore && valueScore
        ? intelligenceScore * 0.4 + speedScore * 0.3 + valueScore * 0.3
        : intelligenceScore || speedScore || valueScore;

    return {
      ...model,
      intelligence_score: intelligenceScore,
      speed_score: speedScore,
      value_score: valueScore,
      overall_score: overallScore,
    };
  });
}

// Worker message handler
self.onmessage = (e: MessageEvent) => {
  try {
    const { models } = e.data;
    const result = calculateCompositeScores(models);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
