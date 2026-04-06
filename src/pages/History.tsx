import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Analysis {
  id: string;
  porcentaje: number | null;
  nivel: string | null;
  fecha: string | null;
  oferta_texto: string | null;
}

const PAGE_SIZE = 10;

function NivelBadge({ nivel }: { nivel: string }) {
  const styles: Record<string, string> = {
    "Bajo": "bg-destructive/10 text-destructive",
    "Medio": "bg-yellow-500/10 text-yellow-600",
    "Alto": "bg-accent/10 text-accent",
    "Muy Alto": "bg-primary/10 text-primary",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[nivel] || styles["Medio"]}`}>{nivel}</span>;
}

export default function History() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"fecha" | "porcentaje">("fecha");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    supabase
      .from("analisis")
      .select("id, porcentaje, nivel, fecha, oferta_texto", { count: "exact" })
      .eq("user_id", user.id)
      .order(sortBy, { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setAnalyses(data || []);
        setTotal(count || 0);
        setLoading(false);
      });
  }, [user, page, sortBy]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" /> Historial de Análisis
          </h1>
          <p className="text-muted-foreground">{total} análisis realizados</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="rounded-lg border bg-card px-3 py-1.5 text-sm text-card-foreground"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as "fecha" | "porcentaje"); setPage(0); }}
          >
            <option value="fecha">Ordenar por fecha</option>
            <option value="porcentaje">Ordenar por %</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : analyses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tienes análisis aún.
            <Link to="/analisis"><Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 block mx-auto">Hacer mi primer análisis</Button></Link>
          </div>
        ) : (
          <div className="divide-y">
            {analyses.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground line-clamp-1">
                    {a.oferta_texto?.substring(0, 80) || "Análisis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.fecha ? new Date(a.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : ""}
                  </p>
                </div>
                <NivelBadge nivel={a.nivel || "Medio"} />
                <span className={`font-display font-bold ${(a.porcentaje || 0) >= 70 ? "text-accent" : (a.porcentaje || 0) >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                  {a.porcentaje}%
                </span>
                <Link to={`/resultados?id=${a.id}`}>
                  <Button variant="outline" size="sm">Ver detalle</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
