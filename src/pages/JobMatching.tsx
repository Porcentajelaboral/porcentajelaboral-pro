import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, ExternalLink, Lock, Loader2, SearchX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchedJob {
  title: string;
  company: string;
  location: string;
  modality: string;
  compatibility: number;
  reason: string;
  url: string;
  published_at: string | null;
}

const ALLOWED_PLANS = ["premium", "elite", "enterprise"];

export default function JobMatching() {
  const { user, profile, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const plan = profile?.plan_tipo || "gratis";
  const hasAccess = ALLOWED_PLANS.includes(plan);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sesión no válida");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-matching`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Demasiadas solicitudes. Intenta en unos segundos.");
        } else if (response.status === 402) {
          toast.error("Créditos de IA agotados. Agrega fondos en tu workspace.");
        } else {
          toast.error(result.error || "Error al buscar ofertas");
        }
        return;
      }

      setJobs(result.jobs || []);
      if (result.jobs?.length === 0) {
        toast.info(result.message || "No se encontraron ofertas compatibles");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al buscar ofertas");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  if (authLoading) {
    return (
      <div className="container max-w-4xl py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl py-16 text-center">
        <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Inicia sesión</h1>
        <p className="mt-2 text-muted-foreground">Debes iniciar sesión para ver ofertas compatibles.</p>
        <Link to="/login">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-4xl py-16 text-center">
        <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Función Premium</h1>
        <p className="mt-2 text-muted-foreground">
          El matching de ofertas está disponible para planes Premium, Elite y Enterprise.
        </p>
        <Link to="/precios">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Ver planes</Button>
        </Link>
      </div>
    );
  }

  const modalityLabel = (m: string) => {
    if (m === "remote" || m === "fully_remote") return "Remoto";
    if (m === "hybrid") return "Híbrido";
    if (m === "in_office") return "Presencial";
    return m || "—";
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-accent" /> Ofertas Compatibles
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ofertas reales de GetOnBoard rankeadas por IA según tu último análisis
          </p>
        </div>
        <Button
          onClick={fetchJobs}
          disabled={loading}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Buscar ofertas
            </>
          )}
        </Button>
      </div>

      {!searched && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-12 text-center shadow-card"
        >
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-accent" />
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            Encuentra ofertas compatibles con tu perfil
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Haz clic en "Buscar ofertas" para analizar empleos reales de GetOnBoard usando las keywords de tu último análisis.
          </p>
        </motion.div>
      )}

      {searched && jobs.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-12 text-center shadow-card"
        >
          <SearchX className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            No se encontraron ofertas
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta realizar un nuevo análisis con un CV más detallado para mejorar los resultados.
          </p>
        </motion.div>
      )}

      <div className="space-y-4">
        {jobs.map((job, i) => (
          <motion.div
            key={`${job.title}-${job.company}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-card-foreground truncate">{job.title}</h3>
                  <Badge variant="secondary">{modalityLabel(job.modality)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{job.reason}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <span
                    className={`font-display text-2xl font-bold ${
                      job.compatibility >= 80
                        ? "text-accent"
                        : job.compatibility >= 60
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {job.compatibility}%
                  </span>
                  <Progress value={job.compatibility} className="mt-1 h-1.5 w-20" />
                </div>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1">
                    Postular <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
