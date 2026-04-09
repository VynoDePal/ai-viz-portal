import { getModels, getBenchmarks, getBenchmarkResults, getOrganizations, getCategories } from "@/lib/supabase-queries";
import { ModelsTable } from "@/components/dashboard/ModelsTable";
import { BenchmarksTable } from "@/components/dashboard/BenchmarksTable";
import { ResultsTable } from "@/components/dashboard/ResultsTable";

export default async function DashboardPage() {
  const [models, benchmarks, results, organizations, categories] = await Promise.all([
    getModels(),
    getBenchmarks(),
    getBenchmarkResults(),
    getOrganizations(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Model Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View and compare AI model benchmark performance metrics
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Models</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <ModelsTable models={models} organizations={organizations} categories={categories} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Benchmarks</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <BenchmarksTable benchmarks={benchmarks} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Benchmark Results</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <ResultsTable results={results} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
