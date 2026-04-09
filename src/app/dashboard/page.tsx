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
import {
  transformDataForLineChart,
  transformDataForBarChart,
  getOrganizationColors,
  getTopModelsByScore,
} from "@/lib/chart-utils";

export default async function DashboardPage() {
  const [models, benchmarks, results, organizations, categories] = await Promise.all([
    getModels(),
    getBenchmarks(),
    getBenchmarkResults(),
    getOrganizations(),
    getCategories(),
  ]);

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
          <ThemeToggle />
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
