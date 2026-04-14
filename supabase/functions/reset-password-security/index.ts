import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, respuesta_1, respuesta_2, new_password } = await req.json();

    if (!email || !respuesta_1 || !respuesta_2 || !new_password) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new_password.length < 8) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 8 caracteres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find((u) => u.email === email.toLowerCase().trim());
    if (!user) {
      return new Response(JSON.stringify({ error: "No se encontró una cuenta con ese correo" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch security questions
    const { data: secData, error: secError } = await supabaseAdmin
      .from("preguntas_seguridad")
      .select("respuesta_1, respuesta_2")
      .eq("user_id", user.id)
      .maybeSingle();

    if (secError) throw secError;

    if (!secData) {
      return new Response(JSON.stringify({ error: "Esta cuenta no tiene preguntas de seguridad configuradas" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compare answers (case-insensitive, trimmed)
    const normalize = (s: string) => s.toLowerCase().trim();
    if (
      normalize(respuesta_1) !== normalize(secData.respuesta_1) ||
      normalize(respuesta_2) !== normalize(secData.respuesta_2)
    ) {
      return new Response(JSON.stringify({ error: "Las respuestas de seguridad no son correctas" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: new_password,
    });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, message: "Contraseña actualizada exitosamente" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in reset-password-security:", err);
    return new Response(JSON.stringify({ error: err.message || "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
