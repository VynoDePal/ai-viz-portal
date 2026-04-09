import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const benchmarkId = url.searchParams.get("benchmark_id");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!benchmarkId) {
      return new Response(JSON.stringify({ error: "benchmark_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: results } = await supabase
      .from("benchmark_results")
      .select("*, models(*)")
      .eq("benchmark_id", benchmarkId)
      .order("score", { ascending: false })
      .limit(limit);

    return new Response(JSON.stringify(results || []), {
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
