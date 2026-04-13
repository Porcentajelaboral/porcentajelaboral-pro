import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Upload, FileText, Percent, Check, Star, Quote, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Upload, step: "1", title: "Sube tu CV", desc: "Pega el contenido de tu currículum o carga un archivo PDF." },
  { icon: FileText, step: "2", title: "Pega la oferta", desc: "Copia la descripción completa del puesto al que quieres postular." },
  { icon: Percent, step: "3", title: "Recibe tu %", desc: "Obtén tu porcentaje de compatibilidad con recomendaciones personalizadas." },
];

const plans = [
  {
    name: "Gratis", price: "$0", period: "/mes", icon: Zap, highlight: false,
    features: ["5 análisis por mes", "% básico de compatibilidad", "1 recomendación"],
    cta: "Comenzar gratis", link: "/registro",
  },
  {
    name: "Premium", price: "$4.990", period: " CLP/mes", icon: Zap, highlight: true,
    features: ["20 análisis por mes", "Análisis completo", "Job matching top 10", "Exportar PDF"],
    cta: "Suscribirse", link: "/registro",
  },
  {
    name: "Elite", price: "$9.990", period: " CLP/mes", icon: Crown, highlight: false,
    features: ["Análisis ilimitados", "Todo Premium", "Plan de mejora CV", "10 preguntas de entrevista", "Job matching top 20"],
    cta: "Suscribirse", link: "/registro",
  },
  {
    name: "Enterprise", price: "$29.990", period: " CLP/mes", icon: Building2, highlight: false,
    features: ["Todo Elite", "Panel empresa", "Subir ofertas laborales", "Ver candidatos compatibles", "Multi-usuario hasta 5"],
    cta: "Contactar", link: "/registro",
  },
];

const testimonials = [
  {
    name: "Carolina Muñoz",
    role: "Ingeniera de Software, Santiago",
    text: "Gracias a PorcentajeLaboral pude optimizar mi CV y conseguí un 92% de match con mi trabajo actual. ¡Lo recomiendo totalmente!",
    rating: 5,
  },
  {
    name: "Felipe Contreras",
    role: "Product Manager, Valparaíso",
    text: "La herramienta me mostró exactamente qué habilidades me faltaban. Después de mejorar mi CV, me llamaron a 3 entrevistas en una semana.",
    rating: 5,
  },
  {
    name: "María José Soto",
    role: "Analista de Datos, Concepción",
    text: "Como reclutadora, uso el plan Enterprise para filtrar candidatos. Ahorramos un 60% del tiempo en la selección inicial.",
    rating: 5,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(145,100%,39%,0.08),transparent_60%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <BarChart3 className="h-4 w-4" /> Potenciado por IA
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl">
              Descubre qué tan compatible{" "}
              <span className="text-gradient">eres con tu trabajo ideal</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70">
              Analiza tu CV con IA en segundos. Obtén un score detallado y mejora tus oportunidades de conseguir el empleo ideal.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/analisis">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base font-semibold shadow-lg">
                  Analizar gratis
                </Button>
              </Link>
              <Link to="/precios">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground px-8 bg-accent">
                  Ver planes
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/50">5 análisis gratis al mes — Sin tarjeta de crédito</p>
          </motion.div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section className="py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">¿Cómo funciona?</h2>
            <p className="mt-3 text-muted-foreground">Tres simples pasos para maximizar tus oportunidades laborales</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative rounded-xl border bg-card p-8 text-center shadow-card transition-all hover:shadow-elevated"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent font-display text-2xl font-bold">
                  {s.step}
                </div>
                <div className="mb-3 flex justify-center">
                  <s.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-card-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden text-2xl text-muted-foreground/30 md:block">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Planes y Precios</h2>
            <p className="mt-3 text-muted-foreground">Elige el plan perfecto para tu búsqueda laboral</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
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
                <div className="my-3">
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
                <Link to={plan.link}>
                  <Button
                    className={`w-full ${plan.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Lo que dicen nuestros usuarios</h2>
            <p className="mt-3 text-muted-foreground">Miles de profesionales chilenos confían en PorcentajeLaboral</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border bg-card p-6 shadow-card"
              >
                <Quote className="mb-3 h-8 w-8 text-accent/30" />
                <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="font-display font-semibold text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">¿Listo para encontrar tu empleo ideal?</h2>
          <p className="mt-4 text-primary-foreground/70">Más de 10.000 profesionales chilenos ya usan PorcentajeLaboral</p>
          <Link to="/registro">
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 px-10 text-base font-semibold">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
