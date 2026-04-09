import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: models } = await supabase
      .from("models")
      .select("id, github_repo");

    if (!models || models.length === 0) {
      return new Response(JSON.stringify({ message: "No models found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const updates = [];

    for (const model of models) {
      if (model.github_repo) {
        const [owner, repo] = model.github_repo.split("/");
        const githubUrl = `https://api.github.com/repos/${owner}/${repo}`;

        const response = await fetch(githubUrl, {
          headers: {
            "User-Agent": "AI-Viz-Portal",
            "Accept": "application/vnd.github.v3+json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          updates.push({
            id: model.id,
            github_stars: data.stargazers_count || 0,
          });
        }
      }
    }

    for (const update of updates) {
      await supabase
        .from("models")
        .update({
          github_stars: update.github_stars,
          metrics_last_updated: new Date().toISOString(),
        })
        .eq("id", update.id);
    }

    return new Response(JSON.stringify({ 
      message: "Updated GitHub stars for models",
      updated: updates.length,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
