/** GitHub API client functions for fetching repository metrics */

export interface RepositoryMetrics {
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  size: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface RepositoryActivity {
  total_commits: number;
  recent_commits: number;
  last_commit_date: string;
}

export interface Contributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface CommitStats {
  total: number;
  additions: number;
  deletions: number;
}

/**
 * Fetch repository metrics from GitHub
 */
export async function getRepositoryMetrics(
  owner: string,
  repo: string,
  token?: string
): Promise<RepositoryMetrics | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.watchers_count || 0,
      open_issues: data.open_issues_count || 0,
      size: data.size || 0,
      language: data.language || "Unknown",
      created_at: data.created_at || "",
      updated_at: data.updated_at || "",
    };
  } catch (error) {
    console.error("Error fetching repository metrics:", error);
    return null;
  }
}

/**
 * Fetch repository activity (commits)
 */
export async function getRepositoryActivity(
  owner: string,
  repo: string,
  token?: string
): Promise<RepositoryActivity | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Get recent commits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${thirtyDaysAgo.toISOString()}`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const commits = await response.json();
    const recentCommits = Array.isArray(commits) ? commits.length : 0;

    return {
      total_commits: 0, // Would need stats API for total
      recent_commits: recentCommits,
      last_commit_date: recentCommits > 0 ? commits[0]?.commit?.committer?.date || "" : "",
    };
  } catch (error) {
    console.error("Error fetching repository activity:", error);
    return null;
  }
}

/**
 * Fetch repository contributors
 */
export async function getContributors(
  owner: string,
  repo: string,
  token?: string
): Promise<Contributor[] | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data.map((contrib) => ({
          login: contrib.login,
          contributions: contrib.contributions,
          avatar_url: contrib.avatar_url,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return null;
  }
}

/**
 * Fetch commit statistics
 */
export async function getCommitStats(
  owner: string,
  repo: string,
  token?: string
): Promise<CommitStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return null;
    }

    let total = 0;
    let additions = 0;
    let deletions = 0;

    data.forEach((contributor) => {
      if (contributor.weeks) {
        contributor.weeks.forEach((week: any) => {
          total += week.c || 0;
          additions += week.a || 0;
          deletions += week.d || 0;
        });
      }
    });

    return {
      total,
      additions,
      deletions,
    };
  } catch (error) {
    console.error("Error fetching commit stats:", error);
    return null;
  }
}
