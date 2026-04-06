import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes",
    desc: "Ideal para comenzar",
    icon: Zap,
    features: ["5 análisis por mes", "Score de compatibilidad", "Recomendaciones básicas", "Historial de análisis"],
    cta: "Comenzar Gratis",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$4.990",
    period: "/mes",
    desc: "Para búsqueda activa",
    icon: Zap,
    features: ["20 análisis por mes", "Score detallado", "Recomendaciones avanzadas", "Ofertas compatibles", "Soporte prioritario"],
    cta: "Elegir Premium",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$9.990",
    period: "/mes",
    desc: "Máxima preparación",
    icon: Crown,
    features: ["Análisis ilimitados", "Preguntas de entrevista IA", "Plan de mejora de CV", "Ofertas compatibles premium", "Coach virtual", "Soporte 24/7"],
    cta: "Elegir Elite",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "$49.990",
    period: "/mes",
    desc: "Para equipos de RRHH",
    icon: Building2,
    features: ["Panel de empresa", "Publicar ofertas", "Ver candidatos compatibles", "Analytics avanzados", "API acceso", "Soporte dedicado", "Onboarding personalizado"],
    cta: "Contactar Ventas",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <div className="py-16">
      <div className="container">
        <div className="mb-14 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Planes y Precios</h1>
          <p className="mt-3 text-muted-foreground">Elige el plan perfecto para tu búsqueda laboral</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
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
                  Popular
                </div>
              )}
              <plan.icon className="mb-3 h-6 w-6 text-accent" />
              <h3 className="font-display text-xl font-bold text-card-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.desc}</p>
              <div className="my-4">
                <span className="font-display text-3xl font-bold text-card-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
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
                  className={`w-full ${
                    plan.highlight
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : ""
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
