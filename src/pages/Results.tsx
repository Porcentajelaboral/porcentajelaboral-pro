import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Download, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const matchScore = 78;

const strengths = [
  "Experiencia en React y TypeScript coincide con requisitos",
  "Nivel de inglés avanzado solicitado",
  "Experiencia en metodologías ágiles",
];
const gaps = [
  "Falta experiencia en Python (requisito deseable)",
  "No menciona liderazgo de equipos",
];
const tips = [
  "Agrega proyectos específicos que demuestren trabajo en equipo",
  "Incluye certificaciones en cloud computing",
  "Destaca logros cuantificables en tus experiencias anteriores",
];

export default function Results() {
  return (
    <div className="container max-w-3xl py-8">
      <Link to="/analisis" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Volver al análisis
      </Link>

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 rounded-xl border bg-card p-8 text-center shadow-elevated"
      >
        <p className="text-sm font-medium text-muted-foreground">Tu porcentaje de compatibilidad</p>
        <div className="my-4 font-display text-7xl font-bold text-accent">{matchScore}%</div>
        <Progress value={matchScore} className="mx-auto h-3 max-w-xs" />
        <p className="mt-4 text-muted-foreground">
          {matchScore >= 70 ? "¡Excelente! Tienes alta compatibilidad con esta oferta." : "Hay oportunidades de mejora para este puesto."}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Strengths */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
            <CheckCircle className="h-5 w-5 text-accent" /> Fortalezas
          </h3>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
            <XCircle className="h-5 w-5 text-destructive" /> Brechas
          </h3>
          <ul className="space-y-2">
            {gaps.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" /> {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
            <Lightbulb className="h-5 w-5 text-accent" /> Sugerencias para mejorar
          </h3>
          <ul className="space-y-2">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Descargar Reporte</Button>
        <Link to="/analisis">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">Nuevo Análisis</Button>
        </Link>
      </div>
    </div>
  );
}
