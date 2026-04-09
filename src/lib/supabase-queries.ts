/** Supabase query functions for fetching data */

import { supabase } from "./supabase";
import type { Model, Benchmark, BenchmarkResult, Organization, Category } from "@/types";

export async function getModels(): Promise<Model[]> {
  const { data, error } = await supabase
    .from("models")
    .select(`
      *,
      organization:organizations(*),
      category:categories(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Model[];
}

export async function getBenchmarks(): Promise<Benchmark[]> {
  const { data, error } = await supabase
    .from("benchmarks")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Benchmark[];
}

export async function getBenchmarkResults(): Promise<BenchmarkResult[]> {
  const { data, error } = await supabase
    .from("benchmark_results")
    .select(`
      *,
      model:models(*),
      benchmark:benchmarks(*)
    `)
    .order("score", { ascending: false });

  if (error) throw error;
  return data as BenchmarkResult[];
}

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Organization[];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function getModelById(id: string): Promise<Model | null> {
  const { data, error } = await supabase
    .from("models")
    .select(`
      *,
      organization:organizations(*),
      category:categories(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data as Model;
}

export async function getModelsByOrganization(organizationId: string): Promise<Model[]> {
  const { data, error } = await supabase
    .from("models")
    .select(`
      *,
      organization:organizations(*),
      category:categories(*)
    `)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Model[];
}

export async function getModelsByCategory(categoryId: string): Promise<Model[]> {
  const { data, error } = await supabase
    .from("models")
    .select(`
      *,
      organization:organizations(*),
      category:categories(*)
    `)
    .eq("category_id", categoryId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Model[];
}
