import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratis", monthly: 0, icon: Zap, highlight: false,
    features: ["5 análisis por mes", "% básico de compatibilidad", "1 recomendación"],
    cta: "Comenzar gratis",
  },
  {
    name: "Premium", monthly: 4990, icon: Zap, highlight: true,
    features: ["20 análisis por mes", "Análisis completo", "Job matching top 10", "Exportar PDF"],
    cta: "Suscribirse",
  },
  {
    name: "Elite", monthly: 9990, icon: Crown, highlight: false,
    features: ["Análisis ilimitados", "Todo Premium", "Plan de mejora CV", "10 preguntas de entrevista", "Job matching top 20"],
    cta: "Suscribirse",
  },
  {
    name: "Enterprise", monthly: 49990, icon: Building2, highlight: false,
    features: ["Todo Elite", "Panel empresa", "Subir ofertas laborales", "Ver candidatos compatibles", "Multi-usuario hasta 5"],
    cta: "Contactar",
  },
];

function formatPrice(price: number) {
  if (price === 0) return "$0";
  return `$${price.toLocaleString("es-CL")}`;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Planes y Precios</h1>
          <p className="mt-3 text-muted-foreground">Elige el plan perfecto para tu búsqueda laboral</p>
        </div>

        {/* Toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Mensual</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-7 w-14 rounded-full transition-colors ${annual ? "bg-accent" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">-33%</span>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const price = annual ? Math.round(plan.monthly * 12 * 0.67 / 12) : plan.monthly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-xl border p-6 transition-all ${
                  plan.highlight
                    ? "border-accent bg-card shadow-elevated ring-2 ring-accent/20"
                    : "bg-card shadow-card hover:shadow-elevated"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                    Más popular
                  </div>
                )}
                <plan.icon className="mb-3 h-6 w-6 text-accent" />
                <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
                <div className="my-4">
                  <span className="font-display text-3xl font-bold text-card-foreground">{formatPrice(price)}</span>
                  <span className="text-sm text-muted-foreground"> CLP/mes</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/registro">
                  <Button
                    className={`w-full ${plan.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
