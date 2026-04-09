import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: models } = await supabase.from("models").select("id");
    const { data: benchmarks } = await supabase.from("benchmarks").select("id");
    const { data: results } = await supabase.from("benchmark_results").select("id");

    const statistics = {
      total_models: models?.length || 0,
      total_benchmarks: benchmarks?.length || 0,
      total_results: results?.length || 0,
    };

    return new Response(JSON.stringify(statistics), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
