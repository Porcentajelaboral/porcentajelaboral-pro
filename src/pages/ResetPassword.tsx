import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, KeyRound, Eye, EyeOff, Check, X, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PageState = "loading" | "form" | "success" | "expired" | "used" | "invalid";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Password validation checks
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allValid = checks.length && checks.uppercase && checks.number && checks.match;

  // Strength indicator
  const strengthScore = [checks.length, checks.uppercase, checks.number].filter(Boolean).length;
  const strengthLabel = strengthScore === 0 ? "" : strengthScore === 1 ? "Débil" : strengthScore === 2 ? "Media" : "Fuerte";
  const strengthColor = strengthScore === 1 ? "bg-destructive" : strengthScore === 2 ? "bg-yellow-500" : strengthScore === 3 ? "bg-accent" : "bg-muted";

  useEffect(() => {
    // Check for recovery token via hash or session event
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const type = params.get("type");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");

    if (errorCode || errorDesc) {
      const desc = (errorDesc || "").toLowerCase();
      if (desc.includes("expired") || desc.includes("otp_expired")) {
        setPageState("expired");
      } else if (desc.includes("already") || desc.includes("used")) {
        setPageState("used");
      } else {
        setPageState("expired");
      }
      return;
    }

    if (type === "recovery") {
      setPageState("form");
      return;
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("form");
      }
    });

    // Check if already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User has a valid session from recovery link
        setPageState("form");
      } else {
        // No token, no session — redirect
        setPageState("invalid");
      }
    });

    // Fallback timeout — if nothing triggers in 3s, mark invalid
    const timeout = setTimeout(() => {
      setPageState((prev) => (prev === "loading" ? "invalid" : prev));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Redirect invalid state
  useEffect(() => {
    if (pageState === "invalid") {
      navigate("/forgot-password", { replace: true });
    }
  }, [pageState, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("invalid")) {
          setPageState("expired");
          return;
        }
        throw error;
      }

      // Log password change in Perfiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("Perfiles")
          .update({ ultima_actualizacion_password: new Date().toISOString() })
          .eq("user_id", user.id);
      }

      // Sign out all sessions
      await supabase.auth.signOut({ scope: "global" });

      setPageState("success");
      toast.success("¡Contraseña actualizada exitosamente!");

      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setSubmitting(false);
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 text-accent" />
      ) : (
        <X className="h-4 w-4 text-destructive" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

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
            {/* SUCCESS */}
            {pageState === "success" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Check className="h-7 w-7 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">¡Contraseña actualizada!</h1>
                <p className="text-sm text-muted-foreground">
                  Redirigiendo al login en unos segundos...
                </p>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full animate-pulse bg-accent" style={{ width: "100%", animation: "grow 3s linear" }} />
                </div>
              </div>
            )}

            {/* EXPIRED */}
            {pageState === "expired" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Este link ha expirado</h1>
                <p className="text-sm text-muted-foreground">
                  Solicita uno nuevo para restablecer tu contraseña.
                </p>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Solicitar nuevo link
                </Button>
              </div>
            )}

            {/* USED */}
            {pageState === "used" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Este link ya fue utilizado</h1>
                <p className="text-sm text-muted-foreground">
                  Si necesitas ayuda, contacta a{" "}
                  <a href="mailto:contacto@porcentajelaboral.com" className="font-medium text-accent hover:underline">
                    contacto@porcentajelaboral.com
                  </a>
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/forgot-password")}
                >
                  Solicitar nuevo link
                </Button>
              </div>
            )}

            {/* FORM */}
            {pageState === "form" && (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <KeyRound className="h-7 w-7 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Crea tu nueva contraseña</h1>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                i <= strengthScore ? strengthColor : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Fortaleza: <span className="font-medium">{strengthLabel}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Validation checklist */}
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    <CheckItem ok={checks.length} label="Mínimo 8 caracteres" />
                    <CheckItem ok={checks.uppercase} label="Al menos una mayúscula" />
                    <CheckItem ok={checks.number} label="Al menos un número" />
                    <CheckItem ok={checks.match} label="Las contraseñas coinciden" />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!allValid || submitting}
                  >
                    {submitting ? "Actualizando..." : "Actualizar contraseña"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
