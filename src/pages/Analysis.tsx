import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Upload, FileText, Briefcase, ArrowRight, Lock, LinkIcon, Loader2, X, Eye, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLAN_LIMITS: Record<string, number> = {
  gratis: 5,
  premium: 20,
  elite: 999999,
  enterprise: 999999,
};

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  linkedin: { label: "LinkedIn", color: "bg-[#0A66C2] text-white", icon: "in" },
  indeed: { label: "Indeed", color: "bg-[#2164F3] text-white", icon: "iD" },
  trabajando: { label: "Trabajando.com", color: "bg-[#FF6B00] text-white", icon: "Tr" },
  computrabajo: { label: "CompuTrabajo", color: "bg-[#1B9B4B] text-white", icon: "CT" },
  laborum: { label: "Laborum", color: "bg-[#E31937] text-white", icon: "La" },
  chiletrabajos: { label: "ChileTrabajos", color: "bg-[#003DA5] text-white", icon: "Ch" },
  bne: { label: "BNE", color: "bg-[#003DA5] text-white", icon: "BN" },
  otro: { label: "Portal de empleo", color: "bg-muted text-muted-foreground", icon: "🔗" },
};

function detectSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("indeed")) return "indeed";
    if (hostname.includes("trabajando")) return "trabajando";
    if (hostname.includes("computrabajo")) return "computrabajo";
    if (hostname.includes("laborum")) return "laborum";
    if (hostname.includes("chiletrabajos")) return "chiletrabajos";
    if (hostname.includes("bne") || hostname.includes("bolsanacionalempleo")) return "bne";
  } catch {}
  return "otro";
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

const LOADER_MESSAGES = [
  "Extrayendo información de la oferta...",
  "Leyendo los requisitos del cargo...",
  "Comparando con tu CV...",
];

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
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
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("paste");
  const [loaderStep, setLoaderStep] = useState(0);
  const [detectedSource, setDetectedSource] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = previewPlan || profile?.plan_tipo || "gratis";
  const used = previewPlan ? 3 : (profile?.analisis_usados || 0);
  const limit = PLAN_LIMITS[plan] || 5;
  const remaining = Math.max(0, limit - used);
  const isLimitReached = !previewPlan && remaining <= 0 && plan !== "elite" && plan !== "enterprise";

  // Detect source when URL changes
  useEffect(() => {
    if (jobUrl.trim()) {
      if (isValidUrl(jobUrl.trim())) {
        setDetectedSource(detectSourceFromUrl(jobUrl.trim()));
        setUrlError(null);
      } else {
        setDetectedSource(null);
        setUrlError("Ingresa una URL válida (debe comenzar con http:// o https://)");
      }
    } else {
      setDetectedSource(null);
      setUrlError(null);
    }
  }, [jobUrl]);

  // Loader message rotation
  useEffect(() => {
    if (!loading || activeTab !== "link") return;
    const interval = setInterval(() => {
      setLoaderStep((prev) => Math.min(prev + 1, LOADER_MESSAGES.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, activeTab]);

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

  const handleAnalyzePaste = async () => {
    if (previewPlan) {
      toast.success("Vista previa: redirigiendo a resultados simulados");
      navigate(`/resultados?preview_plan=${previewPlan}`);
      return;
    }
    if (!user) { toast.error("Debes iniciar sesión para analizar"); navigate("/login"); return; }
    if (isLimitReached) return;
    if (!cvText.trim() || !jobText.trim()) { toast.error("Completa ambos campos"); return; }

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
      if (!response.ok) throw new Error(result.error || "Error al analizar");
      await refreshProfile();
      navigate(`/resultados?id=${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al analizar");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLink = async () => {
    if (previewPlan) {
      toast.success("Vista previa: redirigiendo a resultados simulados");
      navigate(`/resultados?preview_plan=${previewPlan}`);
      return;
    }
    if (!user) { toast.error("Debes iniciar sesión"); navigate("/login"); return; }
    if (isLimitReached) return;
    if (!cvText.trim()) { toast.error("Ingresa tu CV"); return; }
    if (!isValidUrl(jobUrl.trim())) { setUrlError("Ingresa una URL válida"); return; }

    setLoading(true);
    setLoaderStep(0);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sesión no válida");

      // Step 1: Scrape
      const scrapeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-job-offer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ url: jobUrl.trim() }),
        }
      );

      const scrapeResult = await scrapeResponse.json();

      if (!scrapeResponse.ok) {
        if (scrapeResult.error === "linkedin_blocked") {
          toast.error("LinkedIn requiere que pegues el texto manualmente por sus políticas de privacidad", {
            action: {
              label: "Pegar texto",
              onClick: () => setActiveTab("paste"),
            },
          });
          setLoading(false);
          return;
        }
        throw new Error(scrapeResult.error || "Error al extraer la oferta");
      }

      if (!scrapeResult.texto_completo?.trim()) {
        toast.error("No pudimos leer esta oferta automáticamente. ¿Quieres pegar el texto manualmente?", {
          action: {
            label: "Pegar texto",
            onClick: () => setActiveTab("paste"),
          },
        });
        setLoading(false);
        return;
      }

      // Step 2: Analyze with the extracted text
      const analyzeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-cv`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            cvText,
            jobText: scrapeResult.texto_completo,
            plan,
            ofertaMeta: {
              url: jobUrl.trim(),
              titulo: scrapeResult.titulo,
              empresa: scrapeResult.empresa,
              ubicacion: scrapeResult.ubicacion,
              modalidad: scrapeResult.modalidad,
              salario: scrapeResult.salario,
              fuente: scrapeResult.fuente,
            },
          }),
        }
      );

      const analyzeResult = await analyzeResponse.json();
      if (!analyzeResponse.ok) throw new Error(analyzeResult.error || "Error al analizar");

      await refreshProfile();
      navigate(`/resultados?id=${analyzeResult.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al analizar");
    } finally {
      setLoading(false);
    }
  };

  const sourceInfo = detectedSource ? SOURCE_CONFIG[detectedSource] : null;

  // CV Section (shared between both modes)
  const cvSection = (
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
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
        <Button variant="outline" size="sm" className="gap-2" disabled={pdfLoading} onClick={() => fileInputRef.current?.click()}>
          {pdfLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : <><Upload className="h-4 w-4" /> Subir PDF</>}
        </Button>
        <span className="text-xs text-muted-foreground">o pega el texto directamente</span>
      </div>
    </motion.div>
  );

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

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && activeTab === "link" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="rounded-2xl border bg-card p-10 shadow-elevated text-center max-w-md">
              <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-accent" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loaderStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-display text-lg font-semibold text-card-foreground"
                >
                  {LOADER_MESSAGES[loaderStep]}
                </motion.p>
              </AnimatePresence>
              <div className="mt-4 flex justify-center gap-1.5">
                {LOADER_MESSAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-colors ${i <= loaderStep ? "bg-accent" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mx-auto mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="paste" className="gap-2">
              <FileText className="h-4 w-4" /> Pegar oferta
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <LinkIcon className="h-4 w-4" /> Analizar por link
            </TabsTrigger>
          </TabsList>

          {/* MODE 1: Paste */}
          <TabsContent value="paste">
            <div className="grid gap-6 md:grid-cols-2">
              {cvSection}
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
                disabled={!cvText.trim() || !jobText.trim() || loading}
                onClick={handleAnalyzePaste}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analizando...
                  </span>
                ) : (
                  <>Analizar compatibilidad <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* MODE 2: Link */}
          <TabsContent value="link">
            <div className="grid gap-6 md:grid-cols-2">
              {cvSection}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-accent" />
                  <Label className="font-display text-lg font-semibold">Link de la oferta</Label>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder="Pega aquí el link de LinkedIn, Indeed, Trabajando.com..."
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      className={`pr-12 ${urlError ? "border-destructive" : ""}`}
                    />
                    {sourceInfo && (
                      <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold ${sourceInfo.color}`}>
                        {sourceInfo.icon === "🔗" ? <Globe className="h-3 w-3" /> : sourceInfo.icon}
                      </div>
                    )}
                  </div>

                  {urlError && (
                    <p className="text-xs text-destructive">{urlError}</p>
                  )}

                  {sourceInfo && !urlError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2"
                    >
                      <div className={`flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${sourceInfo.color}`}>
                        {sourceInfo.icon === "🔗" ? <Globe className="h-3 w-3" /> : sourceInfo.icon}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Detectado: <strong className="text-card-foreground">{sourceInfo.label}</strong>
                      </span>
                    </motion.div>
                  )}

                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
                    <ExternalLink className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Pega el link directo de la oferta laboral y nosotros extraemos toda la información automáticamente
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {["LinkedIn", "Indeed", "Trabajando", "CompuTrabajo"].map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                      ))}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">y más...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-10 text-base font-semibold"
                disabled={!cvText.trim() || !jobUrl.trim() || !!urlError || loading}
                onClick={handleAnalyzeLink}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Extrayendo y analizando...
                  </span>
                ) : (
                  <>Extraer y Analizar <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
