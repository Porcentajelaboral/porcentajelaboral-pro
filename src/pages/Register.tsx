import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Mail, Lock, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"candidato" | "empresa">("candidato");
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptPool, setAcceptPool] = useState(false);
  const [acceptAlerts, setAcceptAlerts] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = acceptTerms && acceptPrivacy && name && email && password && confirmPassword && password === confirmPassword && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            es_empresa: userType === "empresa",
            empresa_nombre: userType === "empresa" ? empresaNombre : null,
            acepta_terminos: acceptTerms,
            acepta_privacidad: acceptPrivacy,
            cv_en_pool: acceptPool,
            autoriza_contacto: acceptAlerts,
          },
        },
      });

      if (error) throw error;

      toast.success("¡Cuenta creada exitosamente! Revisa tu email para confirmar.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 font-display text-2xl font-bold text-primary">
            <BarChart3 className="h-7 w-7 text-accent" />
            PorcentajeLaboral
          </div>
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Comienza con 5 análisis gratis al mes</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Juan Pérez" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="Repite tu contraseña" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-destructive">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* User type selector */}
            <div>
              <Label>¿Eres candidato o empresa?</Label>
              <div className="mt-1.5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("candidato")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    userType === "candidato"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <User className="h-4 w-4" /> Candidato
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("empresa")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    userType === "empresa"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <Building2 className="h-4 w-4" /> Empresa
                </button>
              </div>
            </div>

            {userType === "empresa" && (
              <div>
                <Label htmlFor="empresaNombre">Nombre de la empresa</Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="empresaNombre" placeholder="Mi Empresa SpA" className="pl-10" value={empresaNombre} onChange={(e) => setEmpresaNombre(e.target.value)} />
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Acepto los{" "}
                  <Link to="/privacidad" className="text-accent hover:underline" target="_blank">Términos y Condiciones</Link>
                  {" "}*
                </label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="privacy" checked={acceptPrivacy} onCheckedChange={(v) => setAcceptPrivacy(v === true)} className="mt-0.5" />
                <label htmlFor="privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Acepto la{" "}
                  <Link to="/privacidad" className="text-accent hover:underline" target="_blank">Política de Privacidad</Link>
                  {" "}*
                </label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="pool" checked={acceptPool} onCheckedChange={(v) => setAcceptPool(v === true)} className="mt-0.5" />
                <label htmlFor="pool" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Autorizo que empresas vean mi perfil en el pool de candidatos
                </label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="alerts" checked={acceptAlerts} onCheckedChange={(v) => setAcceptAlerts(v === true)} className="mt-0.5" />
                <label htmlFor="alerts" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Acepto recibir alertas de nuevas ofertas compatibles por email
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!canSubmit || loading}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-accent hover:underline">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
