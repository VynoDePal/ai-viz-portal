"use client";

import { useState, useEffect } from "react";
import { getModels, getBenchmarks, getBenchmarkResults, getOrganizations, getCategories } from "@/lib/supabase-queries";
import { ModelsTable } from "@/components/dashboard/ModelsTable";
import { BenchmarksTable } from "@/components/dashboard/BenchmarksTable";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { AdvancedFilters } from "@/components/dashboard/AdvancedFilters";
import { ModelComparison } from "@/components/comparison/ModelComparison";
import { LineChart } from "@/components/visualization/LineChart";
import { BarChart } from "@/components/visualization/BarChart";
import { ChartContainer } from "@/components/visualization/ChartContainer";
import { RepositoryMetrics } from "@/components/github/RepositoryMetrics";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { useModelsRealtime } from "@/hooks/useModelsRealtime";
import { useBenchmarksRealtime } from "@/hooks/useBenchmarksRealtime";
import type { Model, Benchmark, BenchmarkResult, Organization, Category } from "@/types";
import {
  transformDataForLineChart,
  transformDataForBarChart,
  getOrganizationColors,
  getTopModelsByScore,
} from "@/lib/chart-utils";

export default function DashboardPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modelsData, benchmarksData, resultsData, organizationsData, categoriesData] = await Promise.all([
          getModels(),
          getBenchmarks(),
          getBenchmarkResults(),
          getOrganizations(),
          getCategories(),
        ]);
        setModels(modelsData);
        setBenchmarks(benchmarksData);
        setResults(resultsData);
        setOrganizations(organizationsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const modelsRealtime = useModelsRealtime({
    onModelChange: () => {
      // Refresh data when models change
      fetchData();
    },
  });

  const benchmarksRealtime = useBenchmarksRealtime({
    onBenchmarkChange: () => {
      // Refresh data when benchmarks change
      fetchData();
    },
  });

  const handleRefresh = () => {
    modelsRealtime.reconnect();
    benchmarksRealtime.reconnect();
  };

  const fetchData = async () => {
    try {
      const [modelsData, benchmarksData, resultsData, organizationsData, categoriesData] = await Promise.all([
        getModels(),
        getBenchmarks(),
        getBenchmarkResults(),
        getOrganizations(),
        getCategories(),
      ]);
      setModels(modelsData);
      setBenchmarks(benchmarksData);
      setResults(resultsData);
      setOrganizations(organizationsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const topModels = getTopModelsByScore(results, 5);
  const lineChartData = transformDataForLineChart(results, topModels);
  const organizationNames = organizations.map((org) => org.name);
  const orgColors = getOrganizationColors(organizationNames);

  const firstBenchmark = benchmarks[0];
  const barChartData = firstBenchmark
    ? transformDataForBarChart(results, firstBenchmark.name)
    : [];

  const modelNames = topModels.map((m) => m.name);
  const categoryNames = categories.map((cat) => cat.name);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Model Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and compare AI model benchmark performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus
              isConnected={modelsRealtime.isConnected && benchmarksRealtime.isConnected}
              error={modelsRealtime.error || benchmarksRealtime.error}
              onReconnect={handleRefresh}
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Advanced Filters</h2>
            <AdvancedFilters
              organizations={organizationNames}
              categories={categoryNames}
              onFilterChange={(filters) => {
                // Handle filter changes - this would typically filter the data
                console.log("Filters changed:", filters);
              }}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">GitHub Metrics</h2>
            <RepositoryMetrics owner="VynoDePal" repo="ai-viz-portal" />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Visualizations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Model Performance Trends"
                description="Top 5 models across all benchmarks"
              >
                <LineChart
                  data={lineChartData}
                  lines={modelNames}
                  colors={orgColors}
                />
              </ChartContainer>

              <ChartContainer
                title={`${firstBenchmark?.name || "Benchmark"} Comparison`}
                description={`Comparison of models on ${firstBenchmark?.name || "benchmark"}`}
              >
                <BarChart
                  data={barChartData}
                  dataKey="score"
                  colors={orgColors}
                />
              </ChartContainer>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Models</h2>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
              <ModelsTable models={models} organizations={organizations} categories={categories} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Benchmarks</h2>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
              <BenchmarksTable benchmarks={benchmarks} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Benchmark Results</h2>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
              <ResultsTable results={results} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Model Comparison</h2>
            <ModelComparison models={models} results={results} />
          </section>
        </div>
      </div>
    </div>
  );
}
