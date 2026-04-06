import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              <BarChart3 className="h-5 w-5 text-accent" />
              PorcentajeLaboral
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Analiza tu compatibilidad laboral con inteligencia artificial. Hecho en Chile 🇨🇱
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Producto</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/precios" className="hover:text-accent transition-colors">Precios</Link>
              <Link to="/analisis" className="hover:text-accent transition-colors">Analizar CV</Link>
              <Link to="/ofertas" className="hover:text-accent transition-colors">Ofertas</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Empresa</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/privacidad" className="hover:text-accent transition-colors">Privacidad</Link>
              <span>Contacto</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Planes</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <span>Gratis</span>
              <span>Premium — $4.990/mes</span>
              <span>Elite — $9.990/mes</span>
              <span>Enterprise — $49.990/mes</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} PorcentajeLaboral. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
