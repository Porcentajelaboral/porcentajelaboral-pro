import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Briefcase, Users, TrendingUp, Plus, Mail, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Oferta {
  id: string;
  titulo: number | null;
  descripcion: string | null;
  fecha_publicacion: string | null;
  activa: boolean | null;
  total_candidatos: number | null;
}

interface Candidato {
  id: string;
  candidato_id: string | null;
  porcentaje_match: number | null;
  resumen_ia: string | null;
  candidato_acepta: boolean | null;
}

export default function Enterprise() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [selectedOferta, setSelectedOferta] = useState<string | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);

  useEffect(() => {
    if (!authLoading && !profile?.es_empresa) {
      navigate("/dashboard");
      return;
    }
    if (user) {
      supabase.from("ofertas_laborales").select("*").eq("empresa_id", user.id).order("fecha_publicacion", { ascending: false })
        .then(({ data }) => setOfertas(data || []));
    }
  }, [user, profile, authLoading]);

  const viewCandidatos = async (ofertaId: string) => {
    setSelectedOferta(ofertaId);
    setLoadingCandidatos(true);
    const { data } = await supabase.from("match_candidatos").select("*").eq("oferta_id", ofertaId).order("porcentaje_match", { ascending: false });
    setCandidatos(data || []);
    setLoadingCandidatos(false);
  };

  const totalOfertas = ofertas.length;
  const totalCandidatos = ofertas.reduce((sum, o) => sum + (o.total_candidatos || 0), 0);
  const avgMatch = candidatos.length > 0 ? Math.round(candidatos.reduce((s, c) => s + (c.porcentaje_match || 0), 0) / candidatos.length) : 0;

  const stats = [
    { label: "Ofertas publicadas", value: String(totalOfertas), icon: Briefcase, color: "text-accent" },
    { label: "Candidatos analizados", value: String(totalCandidatos), icon: Users, color: "text-accent" },
    { label: "Match promedio", value: `${avgMatch}%`, icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-accent" /> Panel Empresa
          </h1>
          <p className="text-muted-foreground">{profile?.empresa_nombre || "Mi Empresa"}</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={() => toast.info("Próximamente: publicar ofertas")}>
          <Plus className="h-4 w-4" /> Publicar nueva oferta
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-card-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b p-5">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Ofertas Activas</h2>
        </div>
        <div className="divide-y">
          {ofertas.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No tienes ofertas publicadas aún.</div>
          ) : (
            ofertas.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{o.descripcion?.substring(0, 50) || "Oferta"}</p>
                  <p className="text-sm text-muted-foreground">{o.fecha_publicacion ? new Date(o.fecha_publicacion).toLocaleDateString("es-CL") : ""}</p>
                </div>
                <span className="text-sm text-muted-foreground">{o.total_candidatos || 0} candidatos</span>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => viewCandidatos(o.id)}>
                  <Eye className="h-4 w-4" /> Ver candidatos
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedOferta && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-xl border bg-card shadow-card">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Candidatos Compatibles</h2>
          </div>
          {loadingCandidatos ? (
            <div className="p-8 text-center text-muted-foreground">Cargando candidatos...</div>
          ) : candidatos.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay candidatos para esta oferta.</div>
          ) : (
            <div className="divide-y">
              {candidatos.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-5">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{c.resumen_ia || "Sin resumen disponible"}</p>
                  </div>
                  <span className={`font-display font-bold ${(c.porcentaje_match || 0) >= 70 ? "text-accent" : "text-yellow-500"}`}>
                    {c.porcentaje_match}%
                  </span>
                  {c.candidato_acepta && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("Contacto enviado al candidato")}>
                      <Mail className="h-4 w-4" /> Contactar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
