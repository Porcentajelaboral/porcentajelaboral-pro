import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const publicLinks = [
    { label: "Inicio", path: "/" },
    { label: "Precios", path: "/precios" },
  ];

  const authLinks = [
    { label: "Dashboard", path: profile?.es_empresa ? "/empresa" : "/dashboard" },
    { label: "Análisis", path: "/analisis" },
    { label: "Historial", path: "/historial" },
  ];

  const navLinks = user ? authLinks : publicLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <BarChart3 className="h-6 w-6 text-accent" />
          PorcentajeLaboral
        </Link>

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
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link to="/registro">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Registrarse</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.path} to={l.path} className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => { handleSignOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Iniciar Sesión</Button>
                </Link>
                <Link to="/registro" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
