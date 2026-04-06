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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { cvText, jobText, plan } = await req.json();
    if (!cvText || !jobText) {
      return new Response(JSON.stringify({ error: "CV and job description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isElite = plan === "elite" || plan === "enterprise";

    const systemPrompt = `Eres un experto en recursos humanos del mercado laboral chileno. Analiza la compatibilidad entre el CV y la oferta laboral proporcionada. Responde ÚNICAMENTE con JSON válido con estos campos:
- porcentaje_compatibilidad: número entre 0 y 100
- nivel: uno de "Bajo", "Medio", "Alto", "Muy Alto"
- habilidades_coinciden: array de strings con habilidades que coinciden
- brechas_detectadas: array de strings con brechas identificadas
- recomendaciones: array de exactamente 5 strings con recomendaciones
- keywords_faltantes: array de strings con keywords que faltan en el CV
- resumen_ejecutivo: string con un resumen ejecutivo de la compatibilidad
${isElite ? '- preguntas_entrevista: array de exactamente 10 strings con preguntas de entrevista relevantes\n- plan_mejora_cv: objeto con claves "experiencia", "habilidades", "educacion", "idiomas", "proyectos" y valores string con sugerencias de mejora' : ""}

No incluyas markdown, backticks ni texto adicional. Solo el JSON.`;

    const userPrompt = `CV del candidato:\n${cvText}\n\nOferta laboral:\n${jobText}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    // Parse JSON - handle potential markdown wrapping
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(cleanContent);

    // Build plan_mejora string
    let planMejora = "";
    if (analysis.plan_mejora_cv && typeof analysis.plan_mejora_cv === "object") {
      planMejora = Object.entries(analysis.plan_mejora_cv)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    }

    // Save to database using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error: dbError } = await supabaseAdmin.from("analisis").insert({
      user_id: user.id,
      cv_texto: cvText,
      oferta_texto: jobText,
      porcentaje: analysis.porcentaje_compatibilidad,
      nivel: analysis.nivel,
      resumen_ejecutivo: analysis.resumen_ejecutivo,
      habilidades_match: (analysis.habilidades_coinciden || []).join(", "),
      brechas: (analysis.brechas_detectadas || []).join(", "),
      recomendaciones: (analysis.recomendaciones || []).join("\n"),
      keywords_faltan: (analysis.keywords_faltantes || []).join(", "),
      preguntas_entrev: (analysis.preguntas_entrevista || []).join("\n"),
      plan_mejora_cv: planMejora,
    }).select("id").single();

    if (dbError) throw dbError;

    // Update usage count
    await supabaseAdmin.from("Perfiles").update({
      analisis_usados: supabase.rpc ? undefined : undefined,
    }).eq("user_id", user.id);

    // Increment analisis_usados
    const { data: profile } = await supabaseAdmin
      .from("Perfiles")
      .select("analisis_usados")
      .eq("user_id", user.id)
      .single();

    await supabaseAdmin.from("Perfiles").update({
      analisis_usados: (profile?.analisis_usados || 0) + 1,
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-cv error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
