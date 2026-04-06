import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Clock, TrendingUp, FileText, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PLAN_LIMITS: Record<string, number> = { gratis: 5, premium: 20, elite: 999999, enterprise: 999999 };

interface RecentAnalysis {
  id: string;
  porcentaje: number | null;
  nivel: string | null;
  fecha: string | null;
  oferta_texto: string | null;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);

  const plan = profile?.plan_tipo || "gratis";
  const used = profile?.analisis_usados || 0;
  const limit = PLAN_LIMITS[plan] || 5;
  const remaining = Math.max(0, limit - used);
  const userName = user?.user_metadata?.full_name || "Usuario";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analisis")
      .select("id, porcentaje, nivel, fecha, oferta_texto")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecent(data || []));
  }, [user]);

  const stats = [
    { label: "Análisis realizados", value: String(used), icon: FileText, color: "text-accent" },
    { label: "Análisis restantes", value: plan === "elite" || plan === "enterprise" ? "∞" : String(remaining), icon: Clock, color: "text-muted-foreground" },
    { label: "Plan actual", value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">¡Hola, {userName}! 👋</h1>
          <p className="text-muted-foreground">Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} — {plan === "elite" || plan === "enterprise" ? "análisis ilimitados" : `${remaining} análisis restantes este mes`}</p>
        </div>
        <Link to="/analisis">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Upload className="h-4 w-4" /> Nuevo Análisis
          </Button>
        </Link>
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

      {/* Recent analyses */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Análisis Recientes</h2>
          <Link to="/historial" className="text-sm text-accent hover:underline flex items-center gap-1">
            Ver historial completo <ArrowRight className="h-3 w-3" />
          </Link>
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
                <Link to={`/resultados?id=${a.id}`}>
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
