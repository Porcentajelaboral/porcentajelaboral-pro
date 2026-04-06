import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Clock, Briefcase, TrendingUp, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Análisis realizados", value: "3", icon: FileText, color: "text-accent" },
  { label: "Match promedio", value: "72%", icon: TrendingUp, color: "text-accent" },
  { label: "Análisis restantes", value: "2", icon: Clock, color: "text-muted-foreground" },
  { label: "Ofertas compatibles", value: "8", icon: Briefcase, color: "text-accent" },
];

const recentAnalyses = [
  { role: "Desarrollador Full Stack", company: "TechCorp Chile", match: 85, date: "Hoy" },
  { role: "Product Manager", company: "StartupHub", match: 62, date: "Ayer" },
  { role: "Diseñador UX/UI", company: "DesignCo", match: 45, date: "Hace 3 días" },
];

export default function Dashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">¡Hola, Juan! 👋</h1>
          <p className="text-muted-foreground">Plan Gratis — 2 análisis restantes este mes</p>
        </div>
        <Link to="/analisis">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Upload className="h-4 w-4" /> Nuevo Análisis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Análisis Recientes</h2>
          <Link to="/historial" className="text-sm text-accent hover:underline flex items-center gap-1">
            Ver todo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y">
          {recentAnalyses.map((a) => (
            <div key={a.role} className="flex items-center gap-4 p-5">
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{a.role}</p>
                <p className="text-sm text-muted-foreground">{a.company}</p>
              </div>
              <div className="w-32 hidden sm:block">
                <Progress value={a.match} className="h-2" />
              </div>
              <span className={`font-display font-bold ${a.match >= 70 ? "text-accent" : a.match >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                {a.match}%
              </span>
              <span className="text-xs text-muted-foreground hidden md:block">{a.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
