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

// ---------- GetOnBoard (API oficial) ----------
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

// ---------- Trabajando.com (JSON API) ----------
async function fetchTrabajando(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      // Try their search API endpoint
      const url = `https://www.trabajando.cl/api/ofertas/buscar?texto=${encodeURIComponent(keyword)}&pais=1&limit=10`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json, text/html, */*",
          "Accept-Language": "es-CL,es;q=0.9",
        },
      });
      if (!resp.ok) {
        // Fallback: try HTML page and extract JSON-LD or structured data
        const htmlResp = await fetch(`https://www.trabajando.cl/trabajo-empleo/q-${encodeURIComponent(keyword)}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html",
          },
        });
        if (!htmlResp.ok) continue;
        const html = await htmlResp.text();
        
        // Try JSON-LD
        const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let jsonMatch;
        while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
          try {
            const ld = JSON.parse(jsonMatch[1]);
            const items = ld.itemListElement || (Array.isArray(ld) ? ld : [ld]);
            for (const item of items) {
              const posting = item.item || item;
              if (posting["@type"] !== "JobPosting" && !posting.title) continue;
              const jobUrl = posting.url || posting.sameAs || "";
              if (!jobUrl || seenUrls.has(jobUrl)) continue;
              seenUrls.add(jobUrl);
              jobs.push({
                title: posting.title || "Sin título",
                company: posting.hiringOrganization?.name || "Empresa",
                location: posting.jobLocation?.address?.addressLocality || "Chile",
                modality: "hybrid",
                url: jobUrl,
                published_at: posting.datePosted || null,
                source: "Trabajando",
                description_snippet: (posting.description || "").substring(0, 300).replace(/<[^>]*>/g, ""),
              });
            }
          } catch { /* skip invalid JSON-LD */ }
        }
        
        // Fallback: broad regex for links with job titles
        if (jobs.filter(j => j.source === "Trabajando").length === 0) {
          const titlePattern = /<a[^>]*href="([^"]*(?:empleo|oferta|trabajo)[^"]*)"[^>]*>\s*(?:<[^>]*>)*\s*([^<]{5,80})/gi;
          let m;
          while ((m = titlePattern.exec(html)) !== null && jobs.length < 10) {
            const href = m[1].startsWith("http") ? m[1] : `https://www.trabajando.cl${m[1]}`;
            if (seenUrls.has(href)) continue;
            seenUrls.add(href);
            const title = m[2].replace(/<[^>]*>/g, "").trim();
            if (title.length < 5) continue;
            jobs.push({
              title,
              company: "Ver en Trabajando",
              location: "Chile",
              modality: "hybrid",
              url: href,
              published_at: null,
              source: "Trabajando",
              description_snippet: "",
            });
          }
        }
        continue;
      }

      // JSON API success path
      const data = await resp.json();
      const ofertas = data.ofertas || data.data || data.results || (Array.isArray(data) ? data : []);
      for (const oferta of ofertas) {
        const jobUrl = oferta.url || oferta.link || "";
        if (!jobUrl || seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        jobs.push({
          title: oferta.titulo || oferta.title || "Sin título",
          company: oferta.empresa || oferta.company || "Empresa",
          location: oferta.ubicacion || oferta.location || "Chile",
          modality: "hybrid",
          url: jobUrl.startsWith("http") ? jobUrl : `https://www.trabajando.cl${jobUrl}`,
          published_at: oferta.fecha || null,
          source: "Trabajando",
          description_snippet: (oferta.descripcion || oferta.description || "").substring(0, 300),
        });
      }
    } catch (e) {
      console.error(`Trabajando error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Computrabajo (HTML + JSON-LD) ----------
async function fetchComputrabajo(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const searchUrl = `https://www.computrabajo.cl/trabajo-de-${encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, "-"))}`;
      const resp = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "es-CL,es;q=0.9",
        },
      });
      if (!resp.ok) continue;
      const html = await resp.text();

      // Try JSON-LD
      const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let jsonMatch;
      while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
        try {
          const ld = JSON.parse(jsonMatch[1]);
          const items = ld.itemListElement || (Array.isArray(ld) ? ld : [ld]);
          for (const item of items) {
            const posting = item.item || item;
            if (posting["@type"] !== "JobPosting" && !posting.title) continue;
            const jobUrl = posting.url || "";
            if (!jobUrl || seenUrls.has(jobUrl)) continue;
            seenUrls.add(jobUrl);
            jobs.push({
              title: posting.title || "Sin título",
              company: posting.hiringOrganization?.name || "Ver en Computrabajo",
              location: posting.jobLocation?.address?.addressLocality || "Chile",
              modality: "hybrid",
              url: jobUrl,
              published_at: posting.datePosted || null,
              source: "Computrabajo",
              description_snippet: (posting.description || "").substring(0, 300).replace(/<[^>]*>/g, ""),
            });
          }
        } catch { /* skip */ }
      }

      // Fallback: parse title links
      if (jobs.filter(j => j.source === "Computrabajo").length === 0) {
        const pattern = /<a[^>]*href="(\/ofertas-de-trabajo\/[^"]+)"[^>]*>\s*(?:<[^>]*>)*\s*([^<]{5,100})/gi;
        let m;
        while ((m = pattern.exec(html)) !== null) {
          const jobUrl = `https://www.computrabajo.cl${m[1]}`;
          if (seenUrls.has(jobUrl)) continue;
          seenUrls.add(jobUrl);
          const title = m[2].replace(/<[^>]*>/g, "").trim();
          if (title.length < 5) continue;
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
      }
    } catch (e) {
      console.error(`Computrabajo error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- ScraperAPI helper ----------
async function fetchWithScraperAPI(targetUrl: string): Promise<string | null> {
  const apiKey = Deno.env.get("SCRAPER_API_KEY");
  if (!apiKey) {
    console.error("SCRAPER_API_KEY not configured");
    return null;
  }
  try {
    const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=true&country_code=cl`;
    const resp = await fetch(scraperUrl, { headers: { Accept: "text/html" } });
    if (!resp.ok) {
      console.error(`ScraperAPI error ${resp.status} for ${targetUrl}`);
      return null;
    }
    return await resp.text();
  } catch (e) {
    console.error(`ScraperAPI fetch error for ${targetUrl}:`, e);
    return null;
  }
}

function parseJobPostingsFromHtml(html: string, source: string, baseUrl: string, seenUrls: Set<string>): JobResult[] {
  const jobs: JobResult[] = [];

  // 1. JSON-LD
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let jsonMatch;
  while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const ld = JSON.parse(jsonMatch[1]);
      const items = ld.itemListElement || (Array.isArray(ld) ? ld : [ld]);
      for (const item of items) {
        const posting = item.item || item;
        if (posting["@type"] !== "JobPosting" && !posting.title) continue;
        const jobUrl = posting.url || "";
        if (!jobUrl || seenUrls.has(jobUrl)) continue;
        seenUrls.add(jobUrl);
        jobs.push({
          title: posting.title || "Sin título",
          company: posting.hiringOrganization?.name || `Ver en ${source}`,
          location: posting.jobLocation?.address?.addressLocality || "Chile",
          modality: "hybrid",
          url: jobUrl,
          published_at: posting.datePosted || null,
          source,
          description_snippet: (posting.description || "").substring(0, 300).replace(/<[^>]*>/g, ""),
        });
      }
    } catch { /* skip */ }
  }

  return jobs;
}

// ---------- Indeed (via ScraperAPI) ----------
async function fetchIndeed(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 2)) {
    try {
      const targetUrl = `https://cl.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=Chile&limit=10`;
      const html = await fetchWithScraperAPI(targetUrl);
      if (!html) continue;

      // JSON-LD first
      const ldJobs = parseJobPostingsFromHtml(html, "Indeed", "https://cl.indeed.com", seenUrls);
      jobs.push(...ldJobs);

      // Fallback: mosaic provider data
      if (ldJobs.length === 0) {
        const mosaicPattern = /window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{[\s\S]*?\});/;
        const mosaicMatch = mosaicPattern.exec(html);
        if (mosaicMatch) {
          try {
            const mosaicData = JSON.parse(mosaicMatch[1]);
            const results = mosaicData.metaData?.mosaicProviderJobCardsModel?.results || [];
            for (const r of results) {
              const jobUrl = `https://cl.indeed.com/viewjob?jk=${r.jobkey}`;
              if (seenUrls.has(jobUrl)) continue;
              seenUrls.add(jobUrl);
              jobs.push({
                title: r.title || "Sin título",
                company: r.company || "Ver en Indeed",
                location: r.formattedLocation || "Chile",
                modality: "hybrid",
                url: jobUrl,
                published_at: null,
                source: "Indeed",
                description_snippet: (r.snippet || "").substring(0, 300).replace(/<[^>]*>/g, ""),
              });
            }
          } catch { /* skip */ }
        }
      }

      // Fallback: title links
      if (jobs.filter(j => j.source === "Indeed").length === 0) {
        const titlePattern = /<h2[^>]*class="[^"]*jobTitle[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/gi;
        let m;
        while ((m = titlePattern.exec(html)) !== null) {
          const href = m[1].startsWith("http") ? m[1] : `https://cl.indeed.com${m[1]}`;
          if (seenUrls.has(href)) continue;
          seenUrls.add(href);
          jobs.push({
            title: m[2].replace(/<[^>]*>/g, "").trim(),
            company: "Ver en Indeed",
            location: "Chile",
            modality: "hybrid",
            url: href,
            published_at: null,
            source: "Indeed",
            description_snippet: "",
          });
        }
      }
    } catch (e) {
      console.error(`Indeed error for "${keyword}":`, e);
    }
  }
  return jobs;
}

// ---------- Laborum (via ScraperAPI) ----------
async function fetchLaborum(keywords: string[]): Promise<JobResult[]> {
  const jobs: JobResult[] = [];
  const seenUrls = new Set<string>();

  for (const keyword of keywords.slice(0, 2)) {
    try {
      const targetUrl = `https://www.laborum.cl/empleos-busqueda-${encodeURIComponent(keyword.replace(/\s+/g, "-"))}.html`;
      const html = await fetchWithScraperAPI(targetUrl);
      if (!html) continue;

      // JSON-LD first
      const ldJobs = parseJobPostingsFromHtml(html, "Laborum", "https://www.laborum.cl", seenUrls);
      jobs.push(...ldJobs);

      // Fallback: Laborum/Bumeran API
      if (ldJobs.length === 0) {
        try {
          const apiHtml = await fetchWithScraperAPI(`https://www.laborum.cl/api/avisos?q=${encodeURIComponent(keyword)}&limit=10`);
          if (apiHtml) {
            try {
              const apiData = JSON.parse(apiHtml);
              const avisos = apiData.content || apiData.avisos || (Array.isArray(apiData) ? apiData : []);
              for (const aviso of avisos) {
                const jobUrl = aviso.url || aviso.link || "";
                if (!jobUrl || seenUrls.has(jobUrl)) continue;
                seenUrls.add(jobUrl);
                jobs.push({
                  title: aviso.titulo || aviso.title || "Sin título",
                  company: aviso.empresa || aviso.company || "Ver en Laborum",
                  location: aviso.ubicacion || aviso.location || "Chile",
                  modality: "hybrid",
                  url: jobUrl.startsWith("http") ? jobUrl : `https://www.laborum.cl${jobUrl}`,
                  published_at: aviso.fechaPublicacion || null,
                  source: "Laborum",
                  description_snippet: "",
                });
              }
            } catch { /* not JSON */ }
          }
        } catch { /* skip API fallback */ }
      }

      // Last resort: link patterns
      if (jobs.filter(j => j.source === "Laborum").length === 0) {
        const pattern = /<a[^>]*href="(\/empleos\/[^"]+)"[^>]*>[\s\S]*?(?:<h2[^>]*>|<span[^>]*class="[^"]*titulo[^"]*"[^>]*>)(.*?)(?:<\/h2>|<\/span>)/gi;
        let m;
        while ((m = pattern.exec(html)) !== null) {
          const jobUrl = `https://www.laborum.cl${m[1]}`;
          if (seenUrls.has(jobUrl)) continue;
          seenUrls.add(jobUrl);
          const title = m[2].replace(/<[^>]*>/g, "").trim();
          if (title.length < 5) continue;
          jobs.push({
            title,
            company: "Ver en Laborum",
            location: "Chile",
            modality: "hybrid",
            url: jobUrl,
            published_at: null,
            source: "Laborum",
            description_snippet: "",
          });
        }
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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

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

    const jobSummaries = allJobs.slice(0, 40).map((job, i) => {
      return `[${i}] Título: ${job.title} | Empresa: ${job.company} | Portal: ${job.source} | Ubicación: ${job.location} | Desc: ${job.description_snippet.substring(0, 150)}`;
    }).join("\n");

    const cvSummary = (lastAnalysis.cv_texto || "").substring(0, 2000);
    const maxJobs = plan === "elite" || plan === "enterprise" ? 20 : 10;

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
