import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BarChart3, CreditCard, FileText, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  plan_tipo: string | null;
  analisis_usados: number | null;
  es_empresa: boolean | null;
  empresa_nombre: string | null;
  fecha_registro: string | null;
  cv_en_pool: boolean | null;
  autoriza_contacto: boolean | null;
  nombre: string | null;
  email: string | null;
}

interface AnalisisRecord {
  id: string;
  user_id: string;
  porcentaje: number | null;
  nivel: string | null;
  fecha: string | null;
}

interface Suscripcion {
  id: string;
  user_id: string;
  plan: string | null;
  activa: boolean | null;
  monto_clp: number | null;
  fecha_inicio: string | null;
  fecha_renovacion: string | null;
  flow_id: string | null;
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisRecord[]>([]);
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions" | "analyses">("overview");

  useEffect(() => {
    if (!adminLoading && !authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, aRes, sRes] = await Promise.all([
      supabase.from("Perfiles").select("*"),
      supabase.from("analisis").select("id, user_id, porcentaje, nivel, fecha"),
      supabase.from("suscripciones").select("*"),
    ]);
    setProfiles(pRes.data || []);
    setAnalisis(aRes.data || []);
    setSuscripciones(sRes.data || []);
    setLoading(false);
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    const { error } = await supabase
      .from("Perfiles")
      .update({ plan_tipo: newPlan, analisis_usados: 0 })
      .eq("user_id", userId);
    if (error) {
      toast.error("Error actualizando plan");
    } else {
      toast.success("Plan actualizado");
      fetchAll();
    }
  };

  const toggleSubscription = async (subId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("suscripciones")
      .update({ activa: !currentActive })
      .eq("id", subId);
    if (error) {
      toast.error("Error actualizando suscripción");
    } else {
      toast.success(`Suscripción ${!currentActive ? "activada" : "desactivada"}`);
      fetchAll();
    }
  };

  if (adminLoading || authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Stats
  const totalUsers = profiles.length;
  const totalAnalysis = analisis.length;
  const activeSubs = suscripciones.filter((s) => s.activa).length;
  const revenue = suscripciones.filter((s) => s.activa).reduce((acc, s) => acc + (s.monto_clp || 0), 0);
  const planCounts = profiles.reduce((acc, p) => {
    const plan = p.plan_tipo || "gratis";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getUserAnalysisCount = (userId: string) => analisis.filter((a) => a.user_id === userId).length;
  const getUserSub = (userId: string) => suscripciones.find((s) => s.user_id === userId && s.activa);

  const planColor = (plan: string | null) => {
    switch (plan) {
      case "premium": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "elite": return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "enterprise": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="py-8">
      <div className="container max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-accent" />
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestión completa de usuarios, suscripciones y análisis</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-accent/10 p-3"><Users className="h-6 w-6 text-accent" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios</p>
                <p className="font-display text-2xl font-bold text-card-foreground">{totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-blue-500/10 p-3"><BarChart3 className="h-6 w-6 text-blue-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Análisis totales</p>
                <p className="font-display text-2xl font-bold text-card-foreground">{totalAnalysis}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-purple-500/10 p-3"><CreditCard className="h-6 w-6 text-purple-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Suscripciones activas</p>
                <p className="font-display text-2xl font-bold text-card-foreground">{activeSubs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-accent/10 p-3"><FileText className="h-6 w-6 text-accent" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos mensuales</p>
                <p className="font-display text-2xl font-bold text-card-foreground">${revenue.toLocaleString("es-CL")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(planCounts).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-2 rounded-lg border p-3">
                  <Badge className={planColor(plan)}>{plan}</Badge>
                  <span className="font-display text-xl font-bold text-card-foreground">{count}</span>
                  <span className="text-sm text-muted-foreground">usuarios</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Preview Buttons */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Vista previa de Dashboard por Plan</CardTitle>
            <p className="text-sm text-muted-foreground">Accede al dashboard simulando cada plan para ver las funcionalidades visibles</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {["gratis", "premium", "elite", "enterprise"].map((planKey) => (
                <Button
                  key={planKey}
                  variant="outline"
                  className={`gap-2 ${planColor(planKey)}`}
                  onClick={() => navigate(`/resultados?preview_plan=${planKey}`)}
                >
                  <FileText className="h-4 w-4" />
                  Ver como {planKey.charAt(0).toUpperCase() + planKey.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {(["users", "subscriptions", "analyses"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-accent text-accent-foreground" : ""}
            >
              {tab === "users" ? "Usuarios" : tab === "subscriptions" ? "Suscripciones" : "Análisis"}
            </Button>
          ))}
        </div>

        {/* Users table */}
        {activeTab === "users" && (
          <Card className="shadow-card">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Tipo</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Análisis</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Pool CV</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Registro</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Cambiar Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium text-card-foreground">{p.nombre || p.user_id.slice(0, 8) + "…"}</div>
                        <div className="text-xs text-muted-foreground">{p.email || "Sin email"}</div>
                        {p.empresa_nombre && <div className="text-xs text-muted-foreground">{p.empresa_nombre}</div>}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{p.es_empresa ? "Empresa" : "Candidato"}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={planColor(p.plan_tipo)}>{p.plan_tipo || "gratis"}</Badge>
                      </td>
                      <td className="p-3 text-card-foreground">
                        {p.analisis_usados || 0} usados / {getUserAnalysisCount(p.user_id)} total
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{p.cv_en_pool ? "Sí" : "No"}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString("es-CL") : "—"}
                      </td>
                      <td className="p-3">
                        <Select
                          value={p.plan_tipo || "gratis"}
                          onValueChange={(val) => updateUserPlan(p.user_id, val)}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gratis">Gratis</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions table */}
        {activeTab === "subscriptions" && (
          <Card className="shadow-card">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Monto</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Estado</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Inicio</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Renovación</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Flow ID</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {suscripciones.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium text-card-foreground">{s.user_id.slice(0, 8)}…</td>
                      <td className="p-3"><Badge className={planColor(s.plan)}>{s.plan || "—"}</Badge></td>
                      <td className="p-3 text-card-foreground">${(s.monto_clp || 0).toLocaleString("es-CL")}</td>
                      <td className="p-3">
                        <Badge variant={s.activa ? "default" : "outline"} className={s.activa ? "bg-accent text-accent-foreground" : ""}>
                          {s.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString("es-CL") : "—"}</td>
                      <td className="p-3 text-muted-foreground">{s.fecha_renovacion ? new Date(s.fecha_renovacion).toLocaleDateString("es-CL") : "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{s.flow_id?.slice(0, 15) || "—"}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => toggleSubscription(s.id, !!s.activa)}>
                          {s.activa ? "Desactivar" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {suscripciones.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No hay suscripciones registradas</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Analyses table */}
        {activeTab === "analyses" && (
          <Card className="shadow-card">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Porcentaje</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Nivel</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {analisis.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium text-card-foreground">{a.user_id.slice(0, 8)}…</td>
                      <td className="p-3">
                        <span className="font-display text-lg font-bold text-card-foreground">{a.porcentaje ?? 0}%</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{a.nivel || "—"}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {a.fecha ? new Date(a.fecha).toLocaleDateString("es-CL") : "—"}
                      </td>
                    </tr>
                  ))}
                  {analisis.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No hay análisis registrados</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
