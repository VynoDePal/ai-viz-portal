import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: models } = await supabase
      .from("models")
      .select("id, huggingface_model");

    if (!models || models.length === 0) {
      return new Response(JSON.stringify({ message: "No models found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const updates = [];

    for (const model of models) {
      if (model.huggingface_model) {
        const hfUrl = `https://huggingface.co/api/models/${model.huggingface_model}`;

        const response = await fetch(hfUrl, {
          headers: {
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          updates.push({
            id: model.id,
            hf_downloads: data.downloads || 0,
          });
        }
      }
    }

    for (const update of updates) {
      await supabase
        .from("models")
        .update({
          hf_downloads: update.hf_downloads,
          metrics_last_updated: new Date().toISOString(),
        })
        .eq("id", update.id);
    }

    return new Response(JSON.stringify({ 
      message: "Updated HF downloads for models",
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
