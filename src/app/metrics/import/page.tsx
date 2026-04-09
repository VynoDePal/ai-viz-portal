import { MetricImportForm } from "@/components/metrics/MetricImportForm";
import Link from "next/link";

export default function MetricImportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import Benchmark Metrics</h1>
          <p className="mt-2 text-gray-600">
            Manually import benchmark results for models (MMLU, HumanEval, etc.)
          </p>
        </div>

        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <MetricImportForm onSuccess={() => {/* Refresh logic */}} />
        </div>
      </div>
    </div>
  );
}
