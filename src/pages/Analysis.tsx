import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FileText, Briefcase, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLAN_LIMITS: Record<string, number> = {
  gratis: 5,
  premium: 20,
  elite: 999999,
  enterprise: 999999,
};

export default function Analysis() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);

  const plan = profile?.plan_tipo || "gratis";
  const used = profile?.analisis_usados || 0;
  const limit = PLAN_LIMITS[plan] || 5;
  const remaining = Math.max(0, limit - used);
  const isLimitReached = remaining <= 0 && plan !== "elite" && plan !== "enterprise";

  const handleAnalyze = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para analizar");
      navigate("/login");
      return;
    }
    if (isLimitReached) return;

    setLoading(true);
    try {
      // Create analysis record (AI processing would happen via edge function)
      const mockScore = Math.floor(Math.random() * 40) + 55;
      const nivel = mockScore >= 85 ? "Muy Alto" : mockScore >= 70 ? "Alto" : mockScore >= 50 ? "Medio" : "Bajo";

      const { data, error } = await supabase.from("analisis").insert({
        user_id: user.id,
        cv_texto: cvText,
        oferta_texto: jobText,
        porcentaje: mockScore,
        nivel,
        resumen_ejecutivo: `Tu perfil tiene un ${mockScore}% de compatibilidad con esta oferta laboral.`,
        habilidades_match: "React, TypeScript, Trabajo en equipo, Comunicación",
        brechas: "Python, Liderazgo de equipos, Cloud computing",
        recomendaciones: "1. Agrega proyectos específicos\n2. Incluye certificaciones cloud\n3. Destaca logros cuantificables\n4. Mejora sección de habilidades blandas\n5. Agrega idiomas con nivel certificado",
        keywords_faltan: "Python, AWS, Docker, Kubernetes, CI/CD",
        preguntas_entrev: "1. ¿Cuéntame sobre un proyecto desafiante?\n2. ¿Cómo manejas conflictos en equipo?\n3. ¿Experiencia con metodologías ágiles?\n4. ¿Cómo priorizas tareas?\n5. ¿Conoces herramientas de CI/CD?\n6. ¿Experiencia con cloud?\n7. ¿Cómo te mantienes actualizado?\n8. ¿Qué te motiva?\n9. ¿Dónde te ves en 5 años?\n10. ¿Por qué esta empresa?",
        plan_mejora_cv: "Experiencia: Agregar métricas y logros\nHabilidades: Incluir Python y cloud\nEducación: Agregar certificaciones\nIdiomas: Especificar niveles\nProyectos: Destacar trabajo en equipo",
      }).select("id").single();

      if (error) throw error;

      // Update usage count
      await supabase.from("Perfiles").update({
        analisis_usados: used + 1,
      }).eq("user_id", user.id);

      await refreshProfile();
      navigate(`/resultados?id=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al analizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Analiza tu compatibilidad laboral</h1>
        <p className="mt-2 text-muted-foreground">Pega tu CV y la oferta laboral para obtener tu porcentaje de match</p>
        {user && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">Te quedan</span>
            <span className={`font-display font-bold ${remaining <= 1 ? "text-destructive" : "text-accent"}`}>
              {plan === "elite" || plan === "enterprise" ? "∞" : remaining}
            </span>
            <span className="text-muted-foreground">análisis este mes</span>
          </div>
        )}
      </div>

      {isLimitReached ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-8 text-center shadow-card">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold text-card-foreground">Has alcanzado tu límite mensual</h2>
          <p className="mt-2 text-muted-foreground">Actualiza tu plan para seguir analizando tu compatibilidad laboral.</p>
          <Link to="/precios">
            <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Ver planes</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <Label className="font-display text-lg font-semibold">Tu CV</Label>
              </div>
              <Textarea
                placeholder="Pega aquí el contenido de tu CV..."
                className="min-h-[250px] resize-none"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
              />
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" /> Subir PDF
                </Button>
                <span className="text-xs text-muted-foreground">o pega el texto directamente</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                <Label className="font-display text-lg font-semibold">Oferta Laboral</Label>
              </div>
              <Textarea
                placeholder="Pega aquí la descripción del trabajo..."
                className="min-h-[250px] resize-none"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
              />
              <p className="mt-3 text-xs text-muted-foreground">Copia la descripción completa del puesto</p>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-10 text-base font-semibold"
              disabled={!cvText || !jobText || loading}
              onClick={handleAnalyze}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                  Analizando...
                </span>
              ) : (
                <>Analizar compatibilidad <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
