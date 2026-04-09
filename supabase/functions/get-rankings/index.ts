import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("category_id");

    if (!categoryId) {
      return new Response(JSON.stringify({ error: "category_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: models } = await supabase
      .from("models")
      .select("id, name, category_id, benchmark_results(score, benchmark_id)")
      .eq("category_id", categoryId);

    const rankings = models?.map((model: any) => {
      const avgScore = model.benchmark_results?.length > 0
        ? model.benchmark_results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / model.benchmark_results.length
        : 0;

      return {
        id: model.id,
        name: model.name,
        average_score: avgScore,
        result_count: model.benchmark_results?.length || 0,
      };
    }).sort((a: any, b: any) => b.average_score - a.average_score) || [];

    return new Response(JSON.stringify(rankings), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
