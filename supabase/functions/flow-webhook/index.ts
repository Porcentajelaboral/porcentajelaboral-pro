import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const PLAN_MAP: Record<string, string> = {
  premium: "premium",
  elite: "elite",
  enterprise: "enterprise",
};

async function verifySignature(params: Record<string, string>, signature: string, secretKey: string): Promise<boolean> {
  const sorted = Object.keys(params).filter(k => k !== "s").sort();
  const toSign = sorted.map((k) => `${k}${params[k]}`).join("");
  const encoder = new TextEncoder();
  const key = encoder.encode(secretKey);
  const data = encoder.encode(toSign);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const computed = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return computed === signature;
}

Deno.serve(async (req) => {
  try {
    const FLOW_API_KEY = Deno.env.get("FLOW_API_KEY");
    const FLOW_SECRET_KEY = Deno.env.get("FLOW_SECRET_KEY");
    if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
      throw new Error("Flow.cl keys not configured");
    }

    // Flow sends webhook as POST with token
    const body = await req.text();
    const urlParams = new URLSearchParams(body);
    const token = urlParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    // Get payment status from Flow
    const statusParams: Record<string, string> = {
      apiKey: FLOW_API_KEY,
      token,
    };

    const sorted = Object.keys(statusParams).sort();
    const toSign = sorted.map((k) => `${k}${statusParams[k]}`).join("");
    const encoder = new TextEncoder();
    const key = encoder.encode(FLOW_SECRET_KEY);
    const data = encoder.encode(toSign);
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const signature = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

    statusParams.s = signature;

    const statusRes = await fetch(
      `https://www.flow.cl/api/payment/getStatus?${new URLSearchParams(statusParams).toString()}`,
      { method: "GET" }
    );

    const paymentData = await statusRes.json();
    console.log("Flow payment status:", paymentData);

    if (paymentData.status === 2) {
      // Payment confirmed
      const commerceOrder = paymentData.commerceOrder;

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Find the pending subscription
      const { data: sub } = await adminClient
        .from("suscripciones")
        .select("*")
        .eq("flow_id", commerceOrder)
        .eq("activa", false)
        .maybeSingle();

      if (sub) {
        // Activate subscription
        const renovacion = new Date();
        renovacion.setMonth(renovacion.getMonth() + 1);

        await adminClient
          .from("suscripciones")
          .update({
            activa: true,
            fecha_inicio: new Date().toISOString(),
            fecha_renovacion: renovacion.toISOString(),
            flow_id: paymentData.flowOrder?.toString() || commerceOrder,
          })
          .eq("id", sub.id);

        // Update user profile plan
        await adminClient
          .from("Perfiles")
          .update({
            plan_tipo: sub.plan,
            analisis_usados: 0,
            mes_control: new Date().getMonth() + 1,
          })
          .eq("user_id", sub.user_id);

        console.log(`Subscription activated for user ${sub.user_id}, plan: ${sub.plan}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
});
