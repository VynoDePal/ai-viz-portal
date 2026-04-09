"use client";

import { useEffect, useState } from "react";
import type {
  RepositoryMetrics,
  RepositoryActivity,
  Contributor,
  CommitStats,
} from "@/lib/github-api";

interface RepositoryMetricsProps {
  owner: string;
  repo: string;
}

export function RepositoryMetrics({ owner, repo }: RepositoryMetricsProps) {
  const [metrics, setMetrics] = useState<RepositoryMetrics | null>(null);
  const [activity, setActivity] = useState<RepositoryActivity | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [stats, setStats] = useState<CommitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/github/metrics?owner=${owner}&repo=${repo}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();
        setMetrics(data.metrics);
        setActivity(data.activity);
        setContributors(data.contributors || []);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {owner}/{repo} Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Stars" value={metrics.stars} icon="⭐" />
        <MetricCard label="Forks" value={metrics.forks} icon="🍴" />
        <MetricCard label="Watchers" value={metrics.watchers} icon="👀" />
        <MetricCard label="Open Issues" value={metrics.open_issues} icon="🐛" />
      </div>

      {activity && (
        <div className="border-t pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Activity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Recent Commits (30 days)</p>
              <p className="text-2xl font-semibold">{activity.recent_commits}</p>
            </div>
            {activity.last_commit_date && (
              <div>
                <p className="text-sm text-gray-500">Last Commit</p>
                <p className="text-sm font-medium">
                  {new Date(activity.last_commit_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="border-t pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Commit Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-semibold">{stats.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Additions</p>
              <p className="text-xl font-semibold text-green-600">
                +{stats.additions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deletions</p>
              <p className="text-xl font-semibold text-red-600">
                -{stats.deletions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {contributors.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Top Contributors ({contributors.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {contributors.slice(0, 10).map((contributor) => (
              <div
                key={contributor.login}
                className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium">{contributor.login}</span>
                <span className="text-xs text-gray-500">
                  {contributor.contributions}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
