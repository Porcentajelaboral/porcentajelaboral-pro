import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Upload, Target, TrendingUp, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Upload, title: "Sube tu CV", desc: "Carga tu currículum en PDF o pega el texto directamente." },
  { icon: Target, title: "Análisis IA", desc: "Nuestra IA compara tu perfil con la oferta laboral al instante." },
  { icon: TrendingUp, title: "Porcentaje de Match", desc: "Obtén un score detallado de compatibilidad con recomendaciones." },
  { icon: Zap, title: "Mejora tu CV", desc: "Recibe sugerencias personalizadas para aumentar tu match." },
  { icon: Shield, title: "Datos Seguros", desc: "Tu información está protegida con encriptación de nivel empresarial." },
  { icon: Users, title: "Para Empresas", desc: "Panel dedicado para gestionar ofertas y ver candidatos compatibles." },
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
              Descubre tu{" "}
              <span className="text-gradient">porcentaje de compatibilidad</span>{" "}
              laboral
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70">
              Analiza tu CV contra cualquier oferta de trabajo en segundos. Obtén un score detallado y mejora tus oportunidades de conseguir el empleo ideal.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/registro">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base font-semibold shadow-lg">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link to="/precios">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8">
                  Ver Planes
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/50">5 análisis gratis al mes — Sin tarjeta de crédito</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">¿Cómo funciona?</h2>
            <p className="mt-3 text-muted-foreground">Tres simples pasos para maximizar tus oportunidades laborales</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
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
