const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function detectSource(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes("linkedin")) return "linkedin";
  if (hostname.includes("indeed")) return "indeed";
  if (hostname.includes("trabajando")) return "trabajando";
  if (hostname.includes("computrabajo")) return "computrabajo";
  if (hostname.includes("laborum")) return "laborum";
  if (hostname.includes("bne") || hostname.includes("bolsanacionalempleo")) return "bne";
  if (hostname.includes("chiletrabajos")) return "chiletrabajos";
  return "otro";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL es requerida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "URL inválida. Debe comenzar con http:// o https://" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fuente = detectSource(url);
    console.log("Scraping job offer from:", fuente, parsedUrl.href);

    // Fetch the page HTML
    const pageResponse = await fetch(parsedUrl.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!pageResponse.ok) {
      if (fuente === "linkedin") {
        return new Response(
          JSON.stringify({ 
            error: "linkedin_blocked",
            message: "LinkedIn requiere que pegues el texto manualmente por sus políticas de privacidad" 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `No se pudo acceder a la página (${pageResponse.status})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await pageResponse.text();

    // Check if LinkedIn blocked us
    if (fuente === "linkedin" && (html.includes("authwall") || html.includes("sign in") && html.length < 5000)) {
      return new Response(
        JSON.stringify({ 
          error: "linkedin_blocked",
          message: "LinkedIn requiere que pegues el texto manualmente por sus políticas de privacidad" 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Strip HTML tags for text extraction
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Use AI with tool calling to extract structured job data
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
            content: `Eres un extractor de ofertas laborales chilenas. Extrae la información estructurada de la oferta laboral del texto proporcionado. Siempre responde llamando la función extract_job_offer.`,
          },
          {
            role: "user",
            content: `Extrae la información de esta oferta laboral:\n\n${textContent.slice(0, 15000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_job_offer",
              description: "Extrae la información estructurada de una oferta laboral",
              parameters: {
                type: "object",
                properties: {
                  titulo: { type: "string", description: "Título del puesto/cargo" },
                  empresa: { type: "string", description: "Nombre de la empresa" },
                  ubicacion: { type: "string", description: "Ciudad o ubicación del trabajo" },
                  modalidad: { type: "string", description: "Presencial, Remoto, Híbrido" },
                  descripcion: { type: "string", description: "Descripción del puesto" },
                  requisitos: { type: "string", description: "Requisitos y habilidades requeridas" },
                  beneficios: { type: "string", description: "Beneficios ofrecidos" },
                  salario: { type: "string", description: "Rango salarial si se menciona" },
                  texto_completo: { type: "string", description: "Todo el contenido relevante de la oferta como texto corrido para análisis" },
                },
                required: ["titulo", "texto_completo"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_job_offer" } },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI extraction failed, status:", aiResponse.status);
      // Fallback: return raw text
      return new Response(
        JSON.stringify({ 
          titulo: "",
          empresa: "",
          ubicacion: "",
          modalidad: "",
          descripcion: "",
          requisitos: "",
          beneficios: "",
          salario: "",
          texto_completo: textContent.slice(0, 5000),
          fuente,
          extraction_failed: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    
    let extracted: any = {};
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        extracted = JSON.parse(toolCall.function.arguments);
      } catch {
        // If tool calling didn't work, try content
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          extracted = { texto_completo: content };
        }
      }
    } else {
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        extracted = { texto_completo: content };
      }
    }

    console.log("Job offer extracted successfully from", fuente);

    return new Response(
      JSON.stringify({
        titulo: extracted.titulo || "",
        empresa: extracted.empresa || "",
        ubicacion: extracted.ubicacion || "",
        modalidad: extracted.modalidad || "",
        descripcion: extracted.descripcion || "",
        requisitos: extracted.requisitos || "",
        beneficios: extracted.beneficios || "",
        salario: extracted.salario || "",
        texto_completo: extracted.texto_completo || textContent.slice(0, 5000),
        fuente,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-job-offer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error al procesar la URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
