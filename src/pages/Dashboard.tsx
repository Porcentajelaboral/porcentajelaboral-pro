import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Clock, TrendingUp, FileText, ArrowRight, Zap, Briefcase, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePreviewPlan } from "@/hooks/usePreviewPlan";

const PLAN_LIMITS: Record<string, number> = { gratis: 5, premium: 20, elite: 999999, enterprise: 999999 };

interface RecentAnalysis {
  id: string;
  porcentaje: number | null;
  nivel: string | null;
  fecha: string | null;
  oferta_texto: string | null;
}

const MOCK_RECENT: RecentAnalysis[] = [
  { id: "demo-1", porcentaje: 85, nivel: "Muy Alto", fecha: new Date().toISOString(), oferta_texto: "Desarrollador Full Stack Senior - React, Node.js, PostgreSQL" },
  { id: "demo-2", porcentaje: 72, nivel: "Alto", fecha: new Date(Date.now() - 86400000).toISOString(), oferta_texto: "Ingeniero de Software - Python, AWS, Docker, Kubernetes" },
  { id: "demo-3", porcentaje: 58, nivel: "Medio", fecha: new Date(Date.now() - 172800000).toISOString(), oferta_texto: "Data Analyst - SQL, Power BI, Excel, estadística avanzada" },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { previewPlan } = usePreviewPlan();
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);

  const plan = previewPlan || profile?.plan_tipo || "gratis";
  const used = previewPlan ? 7 : (profile?.analisis_usados || 0);
  const limit = PLAN_LIMITS[plan] || 5;
  const remaining = Math.max(0, limit - used);
  const userName = previewPlan ? "Admin (Vista Previa)" : (user?.user_metadata?.full_name || "Usuario");

  useEffect(() => {
    if (previewPlan) {
      setRecent(MOCK_RECENT);
      return;
    }
    if (!user) return;
    supabase
      .from("analisis")
      .select("id, porcentaje, nivel, fecha, oferta_texto")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecent(data || []));
  }, [user, previewPlan]);

  const stats = [
    { label: "Análisis realizados", value: String(used), icon: FileText, color: "text-accent" },
    { label: "Análisis restantes", value: plan === "elite" || plan === "enterprise" ? "∞" : String(remaining), icon: Clock, color: "text-muted-foreground" },
    { label: "Plan actual", value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: TrendingUp, color: "text-accent" },
  ];

  const isPremiumPlus = ["premium", "elite", "enterprise"].includes(plan);

  return (
    <div className="container py-8">
      {previewPlan && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-center text-sm font-medium text-accent flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" />
          Vista previa: Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} — <Link to="/admin" className="underline">Volver al panel</Link>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">¡Hola, {userName}! 👋</h1>
          <p className="text-muted-foreground">Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} — {plan === "elite" || plan === "enterprise" ? "análisis ilimitados" : `${remaining} análisis restantes este mes`}</p>
        </div>
        <div className="flex gap-2">
          <Link to={previewPlan ? `/analisis?preview_plan=${previewPlan}` : "/analisis"}>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Upload className="h-4 w-4" /> Nuevo Análisis
            </Button>
          </Link>
          {isPremiumPlus && (
            <Link to={previewPlan ? `/ofertas?preview_plan=${previewPlan}` : "/ofertas"}>
              <Button variant="outline" className="gap-2">
                <Briefcase className="h-4 w-4" /> Ofertas Compatibles
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-card-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Premium banner for free users */}
      {plan === "gratis" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-accent" />
              <div>
                <p className="font-display font-semibold text-card-foreground">Desbloquea todo el potencial</p>
                <p className="text-sm text-muted-foreground">Análisis completo, recomendaciones avanzadas y más con Premium</p>
              </div>
            </div>
            <Link to="/precios">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Ver planes</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Plan features info */}
      {previewPlan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-card-foreground mb-3">
            Funcionalidades del Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <FeatureItem enabled>{plan === "elite" || plan === "enterprise" ? "Análisis ilimitados" : `${PLAN_LIMITS[plan]} análisis/mes`}</FeatureItem>
            <FeatureItem enabled>Porcentaje de compatibilidad</FeatureItem>
            <FeatureItem enabled>Nivel de match por colores</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Habilidades que coinciden</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Brechas detectadas</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Recomendaciones detalladas</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Keywords faltantes</FeatureItem>
            <FeatureItem enabled={["elite", "enterprise"].includes(plan)}>Preguntas de entrevista</FeatureItem>
            <FeatureItem enabled={["elite", "enterprise"].includes(plan)}>Plan de mejora del CV</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Job Matching con IA</FeatureItem>
            <FeatureItem enabled={isPremiumPlus}>Extracción de ofertas por URL</FeatureItem>
            <FeatureItem enabled={plan === "enterprise"}>Soporte prioritario</FeatureItem>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/analisis?preview_plan=${previewPlan}`}>
              <Button size="sm" variant="outline" className="gap-1">
                <FileText className="h-3.5 w-3.5" /> Ver página de Análisis
              </Button>
            </Link>
            <Link to={`/resultados?preview_plan=${previewPlan}`}>
              <Button size="sm" variant="outline" className="gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Ver Resultados
              </Button>
            </Link>
            {isPremiumPlus && (
              <Link to={`/ofertas?preview_plan=${previewPlan}`}>
                <Button size="sm" variant="outline" className="gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Ver Job Matching
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Recent analyses */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Análisis Recientes</h2>
          {!previewPlan && (
            <Link to="/historial" className="text-sm text-accent hover:underline flex items-center gap-1">
              Ver historial completo <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="divide-y">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Aún no tienes análisis. ¡Comienza ahora!</p>
              <Link to="/analisis">
                <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">Hacer mi primer análisis</Button>
              </Link>
            </div>
          ) : (
            recent.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground line-clamp-1">
                    {a.oferta_texto?.substring(0, 60) || "Análisis"}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.fecha ? new Date(a.fecha).toLocaleDateString("es-CL") : ""}
                  </p>
                </div>
                <div className="w-24 hidden sm:block">
                  <Progress value={a.porcentaje || 0} className="h-2" />
                </div>
                <span className={`font-display font-bold ${(a.porcentaje || 0) >= 70 ? "text-accent" : (a.porcentaje || 0) >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                  {a.porcentaje}%
                </span>
                <Link to={previewPlan ? `/resultados?preview_plan=${previewPlan}` : `/resultados?id=${a.id}`}>
                  <Button variant="outline" size="sm">Ver detalle</Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${enabled ? "text-card-foreground" : "text-muted-foreground line-through"}`}>
      <span className={`h-2 w-2 rounded-full ${enabled ? "bg-accent" : "bg-muted-foreground/30"}`} />
      {children}
    </div>
  );
}
