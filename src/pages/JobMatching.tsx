import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const jobs = [
  { id: 1, title: "Desarrollador Frontend React", company: "TechCorp", location: "Santiago", salary: "$1.800.000 - $2.500.000", match: 92, type: "Remoto", posted: "Hace 2 días" },
  { id: 2, title: "Full Stack Developer", company: "StartupHub", location: "Providencia", salary: "$2.000.000 - $3.000.000", match: 85, type: "Híbrido", posted: "Hace 3 días" },
  { id: 3, title: "Software Engineer", company: "CloudNet", location: "Las Condes", salary: "$2.200.000 - $3.200.000", match: 78, type: "Presencial", posted: "Hace 5 días" },
  { id: 4, title: "React Native Developer", company: "AppFactory", location: "Ñuñoa", salary: "$1.600.000 - $2.200.000", match: 71, type: "Remoto", posted: "Hace 1 semana" },
  { id: 5, title: "Tech Lead Frontend", company: "DataPro", location: "Vitacura", salary: "$3.000.000 - $4.000.000", match: 65, type: "Híbrido", posted: "Hace 1 semana" },
];

export default function JobMatching() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-accent" /> Ofertas Compatibles
        </h1>
        <p className="mt-2 text-muted-foreground">Ofertas laborales ordenadas por compatibilidad con tu perfil</p>
      </div>

      <div className="space-y-4">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-card-foreground">{job.title}</h3>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.posted}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className={`font-display text-2xl font-bold ${job.match >= 80 ? "text-accent" : job.match >= 60 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {job.match}%
                  </span>
                  <Progress value={job.match} className="mt-1 h-1.5 w-20" />
                </div>
                <Link to="/analisis">
                  <Button size="sm" variant="outline" className="gap-1">
                    Ver <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
