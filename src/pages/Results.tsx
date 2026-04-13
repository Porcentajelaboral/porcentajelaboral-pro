import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Download, Lightbulb, Lock, HelpCircle, FileEdit, ExternalLink, Copy, MapPin, Building2, Monitor, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JOB_SOURCES, SourceBadge } from "@/components/JobSourceBadge";

interface AnalysisData {
  porcentaje: number | null;
  nivel: string | null;
  resumen_ejecutivo: string | null;
  habilidades_match: string | null;
  brechas: string | null;
  recomendaciones: string | null;
  keywords_faltan: string | null;
  preguntas_entrev: string | null;
  plan_mejora_cv: string | null;
  oferta_url: string | null;
  oferta_titulo: string | null;
  oferta_empresa: string | null;
  oferta_ubicacion: string | null;
  oferta_modalidad: string | null;
  oferta_salario: string | null;
  fuente_oferta: string | null;
}

function LockedOverlay({ title }: { title: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/90 backdrop-blur-sm">
        <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="font-display font-semibold text-card-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">Desbloquea el análisis completo</p>
        <Link to="/precios">
          <Button size="sm" className="mt-3 bg-accent text-accent-foreground hover:bg-accent/90">Ver planes Premium</Button>
        </Link>
      </div>
      <div className="rounded-xl border bg-card p-6 opacity-20 shadow-card"><div className="h-32" /></div>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "hsl(213, 52%, 24%)" : score >= 70 ? "hsl(145, 100%, 39%)" : score >= 50 ? "hsl(45, 100%, 50%)" : "hsl(0, 84%, 60%)";
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="60" fill="none" stroke="hsl(210, 20%, 90%)" strokeWidth="8" />
        <motion.circle cx="64" cy="64" r="60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span className="font-display text-4xl font-bold text-card-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}%
        </motion.span>
      </div>
    </div>
  );
}

function NivelBadge({ nivel }: { nivel: string }) {
  const styles: Record<string, string> = {
    "Bajo": "bg-destructive/10 text-destructive border-destructive/30",
    "Medio": "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    "Alto": "bg-accent/10 text-accent border-accent/30",
    "Muy Alto": "bg-primary/10 text-primary border-primary/30",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${styles[nivel] || styles["Medio"]}`}>{nivel}</span>;
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("id");
  const previewPlan = searchParams.get("preview_plan");
  const { profile } = useAuth();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  const plan = previewPlan || profile?.plan_tipo || "gratis";
  const isPremiumPlus = ["premium", "elite", "enterprise"].includes(plan);
  const isElitePlus = ["elite", "enterprise"].includes(plan);

  useEffect(() => {
    if (previewPlan && !analysisId) {
      setData({
        porcentaje: 78, nivel: "Alto",
        resumen_ejecutivo: "Este es un ejemplo de vista previa del plan " + previewPlan.charAt(0).toUpperCase() + previewPlan.slice(1) + ".",
        habilidades_match: "React, TypeScript, Node.js, SQL, Git",
        brechas: "Docker, Kubernetes, CI/CD",
        recomendaciones: "Agregar experiencia con contenedores\nObtener certificación cloud\nMejorar sección de logros cuantificables",
        keywords_faltan: "microservicios, agile, scrum",
        preguntas_entrev: "¿Cómo manejas la priorización?\n¿Cuál fue tu mayor desafío técnico?\n¿Cómo trabajas en equipo remoto?",
        plan_mejora_cv: "Agregar sección de proyectos destacados\nCuantificar logros con métricas\nIncluir certificaciones relevantes",
        oferta_url: null, oferta_titulo: null, oferta_empresa: null,
        oferta_ubicacion: null, oferta_modalidad: null, oferta_salario: null, fuente_oferta: null,
      });
      setLoading(false);
      return;
    }
    if (!analysisId) { setLoading(false); return; }
    supabase.from("analisis").select("*").eq("id", analysisId).single().then(({ data: d }) => {
      setData(d as any);
      setLoading(false);
    });
  }, [analysisId, previewPlan]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado al portapapeles");
  };

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Cargando resultados...</div>;
  if (!data) return <div className="container py-20 text-center text-muted-foreground">No se encontró el análisis.</div>;

  const skills = data.habilidades_match?.split(", ") || [];
  const gaps = data.brechas?.split(", ") || [];
  const recs = data.recomendaciones?.split("\n").filter(Boolean) || [];
  const keywords = data.keywords_faltan?.split(", ") || [];
  const questions = data.preguntas_entrev?.split("\n").filter(Boolean) || [];
  const cvPlan = data.plan_mejora_cv?.split("\n").filter(Boolean) || [];

  const hasJobMeta = data.oferta_url || data.oferta_titulo;
  const sourceInfo = data.fuente_oferta ? JOB_SOURCES[data.fuente_oferta] || JOB_SOURCES.otro : null;

  return (
    <div className="container max-w-3xl py-8">
      {previewPlan && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-center text-sm font-medium text-accent flex items-center justify-center gap-2">
          👁️ Vista previa: Plan {previewPlan.charAt(0).toUpperCase() + previewPlan.slice(1)} — <Link to="/admin" className="underline">Volver al panel</Link>
          {" | "}
          <Link to={`/dashboard?preview_plan=${previewPlan}`} className="underline">Dashboard</Link>
          {" | "}
          <Link to={`/analisis?preview_plan=${previewPlan}`} className="underline">Análisis</Link>
        </div>
      )}
      <Link to={previewPlan ? `/dashboard?preview_plan=${previewPlan}` : "/analisis"} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> {previewPlan ? "Volver al dashboard" : "Volver al análisis"}
      </Link>

      {/* Job Offer Card (only if from URL) */}
      {hasJobMeta && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start gap-4">
            {data.fuente_oferta && (
              <SourceBadge sourceKey={data.fuente_oferta} size="lg" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-bold text-card-foreground line-clamp-2">
                {data.oferta_titulo || "Oferta laboral"}
              </h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {data.oferta_empresa && (
                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{data.oferta_empresa}</span>
                )}
                {data.oferta_ubicacion && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{data.oferta_ubicacion}</span>
                )}
                {data.oferta_modalidad && (
                  <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" />{data.oferta_modalidad}</span>
                )}
                {data.oferta_salario && (
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{data.oferta_salario}</span>
                )}
              </div>
              {sourceInfo && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  Fuente: {sourceInfo.label}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Score */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 rounded-xl border bg-card p-8 text-center shadow-elevated">
        <p className="text-sm font-medium text-muted-foreground">Tu porcentaje de compatibilidad</p>
        <div className="my-4"><ScoreCircle score={data.porcentaje || 0} /></div>
        <NivelBadge nivel={data.nivel || "Medio"} />
        <p className="mt-4 text-muted-foreground">{data.resumen_ejecutivo}</p>
      </motion.div>

      <div className="space-y-6">
        {isPremiumPlus ? (
          <>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <CheckCircle className="h-5 w-5 text-accent" /> Habilidades que coinciden
              </h3>
              <ul className="space-y-2">
                {skills.map((s) => <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {s}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <AlertTriangle className="h-5 w-5 text-yellow-500" /> Brechas detectadas
              </h3>
              <ul className="space-y-2">
                {gaps.map((g) => <li key={g} className="flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" /> {g}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <Lightbulb className="h-5 w-5 text-accent" /> Recomendaciones
              </h3>
              <ul className="space-y-2">
                {recs.map((r) => <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {r}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <XCircle className="h-5 w-5 text-destructive" /> Keywords faltantes en tu CV
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((k) => <span key={k} className="rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs text-destructive">{k}</span>)}
              </div>
            </div>
          </>
        ) : (
          <>
            <LockedOverlay title="Habilidades y brechas" />
            <LockedOverlay title="Recomendaciones detalladas" />
          </>
        )}

        {isElitePlus ? (
          <>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <HelpCircle className="h-5 w-5 text-accent" /> Preguntas de entrevista personalizadas
              </h3>
              <ul className="space-y-2">
                {questions.map((q) => <li key={q} className="flex items-start gap-2 text-sm text-muted-foreground"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {q}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
                <FileEdit className="h-5 w-5 text-accent" /> Plan de mejora del CV
              </h3>
              <ul className="space-y-2">
                {cvPlan.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground"><FileEdit className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}</li>)}
              </ul>
            </div>
          </>
        ) : (
          <>
            <LockedOverlay title="Preguntas de entrevista" />
            <LockedOverlay title="Plan de mejora del CV" />
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {data.oferta_url && (
          <a href={data.oferta_url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto gap-2">
              <ExternalLink className="h-4 w-4" /> Postular ahora
            </Button>
          </a>
        )}
        <Button variant="outline" className="gap-2" onClick={handleShare}>
          <Copy className="h-4 w-4" /> Compartir análisis
        </Button>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Descargar Reporte</Button>
        <Link to="/analisis">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">Nuevo Análisis</Button>
        </Link>
      </div>
    </div>
  );
}
