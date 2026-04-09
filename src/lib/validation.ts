/** Validation schemas using Zod */

import { z } from "zod";

export const benchmarkResultSchema = z.object({
  model_id: z.string().uuid("Invalid model ID"),
  benchmark_id: z.string().uuid("Invalid benchmark ID"),
  score: z.number().min(0).max(100, "Score must be between 0 and 100"),
  date_recorded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  source: z.string().min(1, "Source is required").max(255, "Source is too long"),
});

export type BenchmarkResultFormData = z.infer<typeof benchmarkResultSchema>;

export const validateBenchmarkResult = (data: unknown) => {
  return benchmarkResultSchema.safeParse(data);
};
