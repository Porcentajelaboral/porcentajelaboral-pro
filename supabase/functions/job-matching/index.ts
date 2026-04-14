import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JobResult {
  title: string;
  company: string;
  location: string;
  modality: string;
  url: string;
  published_at: string | null;
  source: string;
  description_snippet: string;
}

// ---------- GetOnBoard ----------
async function fetchGetOnBoard(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenIds = new Set<string>();

  for (const keyword of keywords) {
    try {
      const url = `https://www.getonbrd.com/api/v0/search/jobs?query=${encodeURIComponent(keyword)}&per_page=10`;
      const resp = await fetch(url, { headers: { Accept: "application/json" } });
      if (!resp.ok) continue;
      const json = await resp.json();
      for (const job of json.data || []) {
        const id = String(job.id || job.attributes?.id || "");
        if (!id || seenIds.has(id)) continue;
        seenIds.add(id);
        const attrs = job.attributes || job;
        const companyAttrs = attrs.company?.data?.attributes || {};
        jobs.push({
          title: attrs.title || "Sin título",
          company: companyAttrs.name || attrs.company_name || "Empresa",
          location: attrs.remote ? "Remoto" : (attrs.country || "Chile"),
          modality: attrs.modality || (attrs.remote ? "remote" : "hybrid"),
          url: attrs.public_url || attrs.url || `https://www.getonbrd.com/jobs/${attrs.id}`,
          published_at: attrs.published_at || null,
          source: "GetOnBoard",
          description_snippet: (attrs.description_headline || attrs.description || "").substring(0, 300),
        });
      }
    } catch (e) {
      console.error(`GetOnBoard error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Trabajando.com (scrape search page) ----------
async function fetchTrabajando(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const url = `https://www.trabajando.cl/trabajo-empleo/q-${encodeURIComponent(keyword)}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PorcentajeLaboralBot/1.0)",
          Accept: "text/html",
        },
      });
      if (!resp.ok) continue;
      const html = await resp.text();

      // Parse job listings from HTML using regex patterns
      const jobPattern = /<a[^>]*href="(\/empleo\/[^"]+)"[^>]*>[\s\S]*?<h2[^>]*>(.*?)<\/h2>[\s\S]*?<span[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/span>/gi;
      let match;
      while ((match = jobPattern.exec(html)) !== null) {
        const jobUrl = `https://www.trabajando.cl${match[1]}`;
        if (seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        jobs.push({
          title: match[2].replace(/<[^>]*>/g, "").trim(),
          company: match[3].replace(/<[^>]*>/g, "").trim(),
          location: "Chile",
          modality: "hybrid",
          url: jobUrl,
          published_at: null,
          source: "Trabajando",
          description_snippet: "",
        });
      }
    } catch (e) {
      console.error(`Trabajando error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Computrabajo ----------
async function fetchComputrabajo(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const url = `https://www.computrabajo.cl/trabajo-de-${encodeURIComponent(keyword.replace(/\s+/g, "-"))}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PorcentajeLaboralBot/1.0)",
          Accept: "text/html",
        },
      });
      if (!resp.ok) continue;
      const html = await resp.text();

      // Parse listings
      const listingPattern = /<a[^>]*href="(\/ofertas-de-trabajo\/[^"]+)"[^>]*class="[^"]*js-o-link[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = listingPattern.exec(html)) !== null) {
        const jobUrl = `https://www.computrabajo.cl${match[1]}`;
        if (seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        const title = match[2].replace(/<[^>]*>/g, "").trim();
        if (!title) continue;
        jobs.push({
          title,
          company: "Ver en Computrabajo",
          location: "Chile",
          modality: "hybrid",
          url: jobUrl,
          published_at: null,
          source: "Computrabajo",
          description_snippet: "",
        });
      }
    } catch (e) {
      console.error(`Computrabajo error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Indeed ----------
async function fetchIndeed(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const url = `https://cl.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=Chile&limit=10`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PorcentajeLaboralBot/1.0)",
          Accept: "text/html",
        },
      });
      if (!resp.ok) continue;
      const html = await resp.text();

      // Parse job cards
      const cardPattern = /<a[^>]*id="job_([^"]+)"[^>]*href="([^"]*)"[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/gi;
      let match;
      while ((match = cardPattern.exec(html)) !== null) {
        const jobUrl = match[2].startsWith("http") ? match[2] : `https://cl.indeed.com${match[2]}`;
        if (seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        jobs.push({
          title: match[3].replace(/<[^>]*>/g, "").trim(),
          company: "Ver en Indeed",
          location: "Chile",
          modality: "hybrid",
          url: jobUrl,
          published_at: null,
          source: "Indeed",
          description_snippet: "",
        });
      }
    } catch (e) {
      console.error(`Indeed error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Laborum ----------
async function fetchLaborum(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const url = `https://www.laborum.cl/empleos-busqueda-${encodeURIComponent(keyword.replace(/\s+/g, "-"))}.html`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PorcentajeLaboralBot/1.0)",
          Accept: "text/html",
        },
      });
      if (!resp.ok) continue;
      const html = await resp.text();

      const listingPattern = /<a[^>]*href="(\/empleos\/[^"]+)"[^>]*>[\s\S]*?<h2[^>]*>(.*?)<\/h2>/gi;
      let match;
      while ((match = listingPattern.exec(html)) !== null) {
        const jobUrl = `https://www.laborum.cl${match[1]}`;
        if (seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        jobs.push({
          title: match[2].replace(/<[^>]*>/g, "").trim(),
          company: "Ver en Laborum",
          location: "Chile",
          modality: "hybrid",
          url: jobUrl,
          published_at: null,
          source: "Laborum",
          description_snippet: "",
        });
      }
    } catch (e) {
      console.error(`Laborum error for "${keyword}":`, e);
    }
  }
  return jobs;
}

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

    // Fix: use getUser instead of getClaims
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

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
      .select("cv_texto, habilidades_match, keywords_faltan, oferta_titulo")
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
    const titleKw = (lastAnalysis.oferta_titulo || "").split(/[\s,]+/).filter((w: string) => w.length > 3);
    const allKeywords = [...new Set([...skills, ...missingKw, ...titleKw])].slice(0, 5);

    if (allKeywords.length === 0) {
      return new Response(JSON.stringify({ error: "No se encontraron keywords en tu último análisis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Searching jobs with keywords:", allKeywords);

    // Fetch jobs from ALL portals in parallel
    const [getOnBoardJobs, trabajandoJobs, computrabajoJobs, indeedJobs, laborumJobs] = await Promise.all([
      fetchGetOnBoard(allKeywords),
      fetchTrabajando(allKeywords),
      fetchComputrabajo(allKeywords),
      fetchIndeed(allKeywords),
      fetchLaborum(allKeywords),
    ]);

    const allJobs: JobResult[] = [
      ...getOnBoardJobs,
      ...trabajandoJobs,
      ...computrabajoJobs,
      ...indeedJobs,
      ...laborumJobs,
    ];

    console.log(`Found jobs: GetOnBoard=${getOnBoardJobs.length}, Trabajando=${trabajandoJobs.length}, Computrabajo=${computrabajoJobs.length}, Indeed=${indeedJobs.length}, Laborum=${laborumJobs.length}`);

    if (allJobs.length === 0) {
      return new Response(JSON.stringify({ jobs: [], message: "No se encontraron ofertas compatibles." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build job summaries for AI ranking
    const jobSummaries = allJobs.slice(0, 40).map((job, i) => {
      return `[${i}] Título: ${job.title} | Empresa: ${job.company} | Portal: ${job.source} | Ubicación: ${job.location} | Desc: ${job.description_snippet.substring(0, 150)}`;
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
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        modality: job.modality,
        compatibility: rank.compatibilidad,
        reason: rank.razon,
        url: job.url,
        published_at: job.published_at,
        source: job.source,
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
