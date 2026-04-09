"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { benchmarkResultSchema, type BenchmarkResultFormData } from "@/lib/validation";
import { insertBenchmarkResult } from "@/lib/supabase-mutations";
import { getModels, getBenchmarks } from "@/lib/supabase-queries";
import type { Model, Benchmark } from "@/types";

interface MetricImportFormProps {
  onSuccess?: () => void;
}

export function MetricImportForm({ onSuccess }: MetricImportFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BenchmarkResultFormData>({
    resolver: zodResolver(benchmarkResultSchema),
  });

  const onSubmit = async (data: BenchmarkResultFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await insertBenchmarkResult(data);

      if (result.success) {
        setSuccess(true);
        reset();
        onSuccess?.();
      } else {
        setError(result.error || "Failed to import metric");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Metric imported successfully!
          </div>
        )}

        <div>
          <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
            Model
          </label>
          <select
            id="model_id"
            {...register("model_id")}
            className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">Select a model</option>
            {/* This would be populated with actual models */}
            <option value="placeholder">GPT-4 (placeholder)</option>
            <option value="placeholder2">Claude 3 Opus (placeholder)</option>
          </select>
          {errors.model_id && (
            <p className="mt-1 text-sm text-red-600">{errors.model_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="benchmark_id" className="block text-sm font-medium text-gray-700">
            Benchmark
          </label>
          <select
            id="benchmark_id"
            {...register("benchmark_id")}
            className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">Select a benchmark</option>
            <option value="placeholder">MMLU (placeholder)</option>
            <option value="placeholder2">HumanEval (placeholder)</option>
          </select>
          {errors.benchmark_id && (
            <p className="mt-1 text-sm text-red-600">{errors.benchmark_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700">
            Score
          </label>
          <input
            id="score"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register("score", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="0.00"
          />
          {errors.score && (
            <p className="mt-1 text-sm text-red-600">{errors.score.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date_recorded" className="block text-sm font-medium text-gray-700">
            Date Recorded
          </label>
          <input
            id="date_recorded"
            type="date"
            {...register("date_recorded")}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          {errors.date_recorded && (
            <p className="mt-1 text-sm text-red-600">{errors.date_recorded.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <input
            id="source"
            type="text"
            {...register("source")}
            className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="e.g., OpenAI, Anthropic, etc."
          />
          {errors.source && (
            <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importing..." : "Import Metric"}
          </button>
        </div>
      </form>
    </div>
  );
}
