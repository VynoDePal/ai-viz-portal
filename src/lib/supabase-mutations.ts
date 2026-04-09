/** Supabase mutation functions for data insertion and updates */

import { supabase } from "./supabase";
import type { BenchmarkResultFormData } from "./validation";

export async function insertBenchmarkResult(
  data: BenchmarkResultFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Check for duplicate result
    const { data: existing } = await supabase
      .from("benchmark_results")
      .select("id")
      .eq("model_id", data.model_id)
      .eq("benchmark_id", data.benchmark_id)
      .eq("date_recorded", data.date_recorded)
      .single();

    if (existing) {
      return {
        success: false,
        error: "A result already exists for this model, benchmark, and date",
      };
    }

    // Insert new result
    const { data: result, error } = await supabase
      .from("benchmark_results")
      .insert(data)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertBenchmarkResult(
  data: BenchmarkResultFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const { data: result, error } = await supabase
      .from("benchmark_results")
      .upsert(data, {
        onConflict: "model_id,benchmark_id,date_recorded",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkDuplicateResult(
  modelId: string,
  benchmarkId: string,
  dateRecorded: string
): Promise<boolean> {
  const { data } = await supabase
    .from("benchmark_results")
    .select("id")
    .eq("model_id", modelId)
    .eq("benchmark_id", benchmarkId)
    .eq("date_recorded", dateRecorded)
    .single();

  return !!data;
}
