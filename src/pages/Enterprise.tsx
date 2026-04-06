import { motion } from "framer-motion";
import { Building2, Users, BarChart3, Briefcase, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const activeJobs = [
  { title: "Desarrollador Full Stack", applicants: 24, avgMatch: 72, status: "Activa" },
  { title: "Product Manager Senior", applicants: 18, avgMatch: 65, status: "Activa" },
  { title: "Diseñador UX/UI", applicants: 31, avgMatch: 78, status: "Activa" },
];

const topCandidates = [
  { name: "María González", role: "Dev Full Stack", match: 95 },
  { name: "Carlos Muñoz", role: "Dev Full Stack", match: 88 },
  { name: "Ana Contreras", role: "Product Manager", match: 84 },
];

export default function Enterprise() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" /> Panel Empresa
          </h1>
          <p className="text-muted-foreground">TechCorp Chile — Plan Enterprise</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Plus className="h-4 w-4" /> Nueva Oferta
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Ofertas activas", value: "3", icon: Briefcase },
          { label: "Total candidatos", value: "73", icon: Users },
          { label: "Match promedio", value: "72%", icon: BarChart3 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-card-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Jobs */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Ofertas Activas</h2>
          </div>
          <div className="divide-y">
            {activeJobs.map((job) => (
              <div key={job.title} className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.applicants} candidatos · Match prom. {job.avgMatch}%</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" /> Ver
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Candidates */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Top Candidatos</h2>
          </div>
          <div className="divide-y">
            {topCandidates.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-display font-bold text-accent">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.role}</p>
                </div>
                <div className="text-center">
                  <span className="font-display font-bold text-accent">{c.match}%</span>
                  <Progress value={c.match} className="mt-1 h-1.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
