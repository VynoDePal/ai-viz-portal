import { NextRequest, NextResponse } from "next/server";
import {
  getRepositoryMetrics,
  getRepositoryActivity,
  getContributors,
  getCommitStats,
} from "@/lib/github-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing owner or repo parameter" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;

    // Fetch all metrics in parallel
    const [metrics, activity, contributors, stats] = await Promise.all([
      getRepositoryMetrics(owner, repo, token),
      getRepositoryActivity(owner, repo, token),
      getContributors(owner, repo, token),
      getCommitStats(owner, repo, token),
    ]);

    return NextResponse.json({
      metrics,
      activity,
      contributors,
      stats,
    });
  } catch (error) {
    console.error("Error fetching GitHub metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub metrics" },
      { status: 500 }
    );
  }
}
