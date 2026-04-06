import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Inicio", path: "/" },
  { label: "Precios", path: "/precios" },
  { label: "Ofertas", path: "/ofertas" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <BarChart3 className="h-6 w-6 text-accent" />
          PorcentajeLaboral
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === l.path ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login">
            <Button variant="ghost" size="sm">Iniciar Sesión</Button>
          </Link>
          <Link to="/registro">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Registrarse
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path} className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full">Iniciar Sesión</Button>
            </Link>
            <Link to="/registro" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Registrarse</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
