import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Lock, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailError, setEmailError] = useState("");

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = useCallback((value: string) => {
    if (!value) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un email válido";
    return "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "https://www.porcentajelaboral.com/reset-password",
      });
    } catch {
      // Silently handle — always show the same success message
    } finally {
      setLoading(false);
      setSent(true);
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <BarChart3 className="h-6 w-6 text-accent" />
            PorcentajeLaboral
          </Link>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card p-8 shadow-card">
            {!sent ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <Lock className="h-7 w-7 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ingresa tu email y te enviaremos instrucciones para recuperarla
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError(validateEmail(e.target.value));
                        }}
                        required
                      />
                    </div>
                    {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={loading || cooldown > 0}
                  >
                    {loading
                      ? "Enviando..."
                      : cooldown > 0
                      ? `Reenviar en ${cooldown}s`
                      : "Enviar instrucciones"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">¡Revisa tu correo!</h2>
                <p className="text-sm text-muted-foreground">
                  Si este email está registrado, recibirás las instrucciones en los próximos minutos.
                  Revisa también tu carpeta de spam.
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={cooldown > 0}
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Enviar de nuevo"}
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
