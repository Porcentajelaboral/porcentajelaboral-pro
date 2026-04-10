import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FLOW_API_URL = "https://www.flow.cl/api";

// Flow.cl plan mapping
const PLAN_MAP: Record<string, { amount: number; name: string }> = {
  premium: { amount: 4990, name: "Premium" },
  elite: { amount: 9990, name: "Elite" },
  enterprise: { amount: 49990, name: "Enterprise" },
};

function generateFlowSignature(params: Record<string, string>, secretKey: string): string {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}${params[k]}`).join("");
  const encoder = new TextEncoder();
  const key = encoder.encode(secretKey);
  const data = encoder.encode(toSign);

  // HMAC-SHA256 using Web Crypto
  return crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((cryptoKey) => crypto.subtle.sign("HMAC", cryptoKey, data))
    .then((sig) =>
      Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    ) as unknown as string;
}

async function signParams(params: Record<string, string>, secretKey: string): Promise<string> {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}${params[k]}`).join("");
  const encoder = new TextEncoder();
  const key = encoder.encode(secretKey);
  const data = encoder.encode(toSign);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const FLOW_API_KEY = Deno.env.get("FLOW_API_KEY");
    const FLOW_SECRET_KEY = Deno.env.get("FLOW_SECRET_KEY");
    if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
      throw new Error("Flow.cl API keys not configured");
    }

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    const { plan, billing } = await req.json();
    if (!plan || !PLAN_MAP[plan]) {
      return new Response(JSON.stringify({ error: "Plan inválido" }), { status: 400, headers: corsHeaders });
    }

    const planInfo = PLAN_MAP[plan];
    const isAnnual = billing === "annual";
    const amount = isAnnual ? Math.round(planInfo.amount * 12 * 0.67) : planInfo.amount;
    const periodLabel = isAnnual ? "Anual" : "Mensual";

    const shortId = userId.replace(/-/g, "").slice(0, 12);
    const commerceOrder = `sub_${shortId}_${Date.now()}`;

    const params: Record<string, string> = {
      apiKey: FLOW_API_KEY,
      commerceOrder,
      subject: `Suscripción ${planInfo.name} ${periodLabel} - PorcentajeLaboral`,
      currency: "CLP",
      amount: amount.toString(),
      email: userEmail,
      urlConfirmation: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flow-webhook`,
      urlReturn: `${req.headers.get("origin") || "https://porcentajelaboral.com"}/dashboard?payment=success`,
    };

    const signature = await signParams(params, FLOW_SECRET_KEY);
    params.s = signature;

    // Call Flow.cl API
    const formData = new URLSearchParams(params);
    const flowRes = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const flowData = await flowRes.json();

    if (!flowRes.ok || !flowData.url || !flowData.token) {
      console.error("Flow.cl error:", flowData);
      throw new Error(`Flow.cl API error: ${JSON.stringify(flowData)}`);
    }

    // Store pending subscription info for webhook
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient.from("suscripciones").insert({
      user_id: userId,
      plan: plan,
      monto_clp: amount,
      flow_id: commerceOrder,
      activa: false,
      fecha_inicio: new Date().toISOString(),
    });

    const paymentUrl = `${flowData.url}?token=${flowData.token}`;

    return new Response(JSON.stringify({ url: paymentUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
