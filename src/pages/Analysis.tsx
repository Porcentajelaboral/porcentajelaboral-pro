import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Analysis() {
  const navigate = useNavigate();
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/resultados");
    }, 2000);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Analizar Compatibilidad</h1>
        <p className="mt-2 text-muted-foreground">Pega tu CV y la oferta laboral para obtener tu porcentaje de match</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <Label className="font-display text-lg font-semibold">Tu CV</Label>
          </div>
          <Textarea
            placeholder="Pega aquí el contenido de tu CV o currículum..."
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
            placeholder="Pega aquí la descripción de la oferta de trabajo..."
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
            <>Analizar Compatibilidad <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
