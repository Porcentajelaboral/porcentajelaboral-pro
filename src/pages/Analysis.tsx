import { useState, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Upload, FileText, Briefcase, ArrowRight, Lock, LinkIcon, Loader2, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

export default function Analysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewPlan = searchParams.get("preview_plan");
  const { user, profile, refreshProfile } = useAuth();
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = previewPlan || profile?.plan_tipo || "gratis";
  const used = previewPlan ? 3 : (profile?.analisis_usados || 0);
  const limit = PLAN_LIMITS[plan] || 5;
  const remaining = Math.max(0, limit - used);
  const isLimitReached = !previewPlan && remaining <= 0 && plan !== "elite" && plan !== "enterprise";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { validatePdfFile } = await import("@/lib/validation");
    const validationError = validatePdfFile(file);
    if (validationError) {
      toast.error(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPdfLoading(true);
    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        toast.error("No se pudo extraer texto del PDF. Intenta pegar el texto manualmente.");
        return;
      }
      setCvText(text);
      setPdfFileName(file.name);
      toast.success("PDF procesado correctamente");
    } catch (err) {
      console.error("PDF extraction error:", err);
      toast.error("Error al procesar el PDF. Intenta pegar el texto manualmente.");
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearPdf = () => {
    setCvText("");
    setPdfFileName(null);
  };

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Ingresa una URL válida");
      return;
    }

    setUrlLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sesión no válida");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-job-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ url: jobUrl }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al obtener la oferta");
      }

      if (!result.text?.trim()) {
        toast.error("No se pudo extraer contenido de la URL. Intenta pegar el texto manualmente.");
        return;
      }

      setJobText(result.text);
      toast.success("Oferta laboral extraída correctamente");
    } catch (err: any) {
      console.error("URL fetch error:", err);
      toast.error(err.message || "Error al obtener la oferta desde la URL");
    } finally {
      setUrlLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (previewPlan) {
      toast.success("Vista previa: redirigiendo a resultados simulados");
      navigate(`/resultados?preview_plan=${previewPlan}`);
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para analizar");
      navigate("/login");
      return;
    }
    if (isLimitReached) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sesión no válida");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-cv`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ cvText, jobText, plan }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al analizar");
      }

      await refreshProfile();
      navigate(`/resultados?id=${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al analizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {previewPlan && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-center text-sm font-medium text-accent flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" />
          Vista previa: Plan {plan.charAt(0).toUpperCase() + plan.slice(1)} — <Link to="/admin" className="underline">Volver al panel</Link>
          {" | "}
          <Link to={`/dashboard?preview_plan=${previewPlan}`} className="underline">Dashboard</Link>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Analiza tu compatibilidad laboral</h1>
        <p className="mt-2 text-muted-foreground">Pega tu CV y la oferta laboral para obtener tu porcentaje de match</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
          <span className="text-muted-foreground">Te quedan</span>
          <span className={`font-display font-bold ${remaining <= 1 ? "text-destructive" : "text-accent"}`}>
            {plan === "elite" || plan === "enterprise" ? "∞" : remaining}
          </span>
          <span className="text-muted-foreground">análisis este mes</span>
        </div>
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
            {/* CV Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <Label className="font-display text-lg font-semibold">Tu CV</Label>
              </div>

              {pdfFileName && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="flex-1 truncate text-card-foreground">{pdfFileName}</span>
                  <button onClick={handleClearPdf} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Textarea
                placeholder="Pega aquí el contenido de tu CV..."
                className="min-h-[250px] resize-none"
                value={cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  if (pdfFileName) setPdfFileName(null);
                }}
              />

              <div className="mt-3 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={pdfLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {pdfLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Subir PDF</>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">o pega el texto directamente</span>
              </div>
            </motion.div>

            {/* Job Section */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-accent" />
                  <Label className="font-display text-lg font-semibold">Oferta Laboral</Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setUseUrlMode(!useUrlMode)}
                >
                  {useUrlMode ? (
                    <><FileText className="h-3.5 w-3.5" /> Pegar texto</>
                  ) : (
                    <><LinkIcon className="h-3.5 w-3.5" /> Usar URL</>
                  )}
                </Button>
              </div>

              {useUrlMode && (
                <div className="mb-3 flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com/oferta-laboral"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={urlLoading || !jobUrl.trim()}
                    onClick={handleFetchUrl}
                    className="gap-1 whitespace-nowrap"
                  >
                    {urlLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Cargando</>
                    ) : (
                      <>Extraer</>
                    )}
                  </Button>
                </div>
              )}

              <Textarea
                placeholder="Pega aquí la descripción del trabajo..."
                className="min-h-[250px] resize-none"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                {useUrlMode
                  ? "Pega el link de la oferta y haz clic en Extraer, o escribe el texto directamente"
                  : "Copia la descripción completa del puesto"}
              </p>
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
