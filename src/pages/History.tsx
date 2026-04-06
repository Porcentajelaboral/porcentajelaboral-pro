import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const history = [
  { id: 1, role: "Desarrollador Full Stack", company: "TechCorp Chile", match: 85, date: "2024-03-15", status: "Alto" },
  { id: 2, role: "Product Manager", company: "StartupHub", match: 62, date: "2024-03-14", status: "Medio" },
  { id: 3, role: "Diseñador UX/UI", company: "DesignCo", match: 45, date: "2024-03-12", status: "Bajo" },
  { id: 4, role: "Data Analyst", company: "DataPro", match: 91, date: "2024-03-10", status: "Alto" },
  { id: 5, role: "DevOps Engineer", company: "CloudNet", match: 73, date: "2024-03-08", status: "Alto" },
];

function statusVariant(status: string) {
  if (status === "Alto") return "default";
  if (status === "Medio") return "secondary";
  return "destructive";
}

export default function History() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-3">
        <Clock className="h-6 w-6 text-accent" />
        <h1 className="font-display text-2xl font-bold text-foreground">Historial de Análisis</h1>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="divide-y">
          {history.map((h) => (
            <Link to="/resultados" key={h.id} className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/50">
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{h.role}</p>
                <p className="text-sm text-muted-foreground">{h.company} · {h.date}</p>
              </div>
              <div className="hidden w-28 sm:block">
                <Progress value={h.match} className="h-2" />
              </div>
              <span className={`font-display font-bold min-w-[3rem] text-right ${h.match >= 70 ? "text-accent" : h.match >= 50 ? "text-yellow-500" : "text-destructive"}`}>
                {h.match}%
              </span>
              <Badge variant={statusVariant(h.status) as any}>{h.status}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
