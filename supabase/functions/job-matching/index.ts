import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Get user profile to check plan
    const { data: profile } = await supabase
      .from("Perfiles")
      .select("plan_tipo")
      .eq("user_id", userId)
      .single();

    const plan = profile?.plan_tipo || "gratis";
    const allowedPlans = ["premium", "elite", "enterprise"];
    if (!allowedPlans.includes(plan)) {
      return new Response(JSON.stringify({ error: "Esta función requiere plan Premium o superior" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get last analysis
    const { data: lastAnalysis } = await supabase
      .from("analisis")
      .select("cv_texto, habilidades_match, keywords_faltan")
      .eq("user_id", userId)
      .order("fecha", { ascending: false })
      .limit(1)
      .single();

    if (!lastAnalysis) {
      return new Response(JSON.stringify({ error: "No tienes análisis previos. Realiza un análisis primero." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract keywords from skills and missing keywords
    const skills = (lastAnalysis.habilidades_match || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const missingKw = (lastAnalysis.keywords_faltan || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const allKeywords = [...new Set([...skills, ...missingKw])].slice(0, 5);

    if (allKeywords.length === 0) {
      return new Response(JSON.stringify({ error: "No se encontraron keywords en tu último análisis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch jobs from GetOnBoard for each keyword
    const allJobs: any[] = [];
    const seenIds = new Set<string>();

    for (const keyword of allKeywords) {
      try {
        const url = `https://www.getonbrd.com/api/v0/search/jobs?query=${encodeURIComponent(keyword)}&per_page=10`;
        const resp = await fetch(url, {
          headers: { "Accept": "application/json" },
        });
        if (resp.ok) {
          const json = await resp.json();
          const jobs = json.data || [];
          for (const job of jobs) {
            const id = job.id || job.attributes?.id;
            if (id && !seenIds.has(String(id))) {
              seenIds.add(String(id));
              allJobs.push(job);
            }
          }
        }
      } catch (e) {
        console.error(`Error fetching jobs for keyword "${keyword}":`, e);
      }
    }

    if (allJobs.length === 0) {
      return new Response(JSON.stringify({ jobs: [], message: "No se encontraron ofertas compatibles." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build job summaries for AI ranking
    const jobSummaries = allJobs.slice(0, 30).map((job, i) => {
      const attrs = job.attributes || job;
      return `[${i}] Título: ${attrs.title || "N/A"} | Empresa: ${attrs.company?.data?.attributes?.name || attrs.company_name || "N/A"} | Descripción: ${(attrs.description_headline || attrs.description || "").substring(0, 200)}`;
    }).join("\n");

    const cvSummary = (lastAnalysis.cv_texto || "").substring(0, 2000);
    const maxJobs = plan === "elite" || plan === "enterprise" ? 20 : 10;

    // Use AI to rank jobs
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un experto en recursos humanos del mercado chileno. Analiza las ofertas laborales y rankéalas por compatibilidad con el CV del candidato. Responde ÚNICAMENTE con JSON válido: un array de objetos con campos "index" (número del trabajo), "compatibilidad" (0-100), "razon" (string breve explicando por qué es compatible). Ordena de mayor a menor compatibilidad. Devuelve máximo ${maxJobs} resultados. No incluyas markdown ni backticks.`,
          },
          {
            role: "user",
            content: `CV del candidato (resumen):\n${cvSummary}\n\nOfertas encontradas:\n${jobSummaries}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    let content = (aiData.choices?.[0]?.message?.content || "").trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const rankings = JSON.parse(content);

    // Build response with ranked jobs
    const rankedJobs = rankings.slice(0, maxJobs).map((rank: any) => {
      const job = allJobs[rank.index];
      if (!job) return null;
      const attrs = job.attributes || job;
      const companyAttrs = attrs.company?.data?.attributes || {};
      return {
        title: attrs.title || "Sin título",
        company: companyAttrs.name || attrs.company_name || "Empresa",
        location: attrs.remote ? "Remoto" : (attrs.country || "Chile"),
        modality: attrs.modality || (attrs.remote ? "remote" : "hybrid"),
        compatibility: rank.compatibilidad,
        reason: rank.razon,
        url: attrs.public_url || attrs.url || `https://www.getonbrd.com/jobs/${attrs.id}`,
        published_at: attrs.published_at || null,
      };
    }).filter(Boolean);

    return new Response(JSON.stringify({ jobs: rankedJobs }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-matching error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
