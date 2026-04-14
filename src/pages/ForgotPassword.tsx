import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Mail, ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SECURITY_QUESTIONS_OPTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu mejor amigo/a de la infancia?",
  "¿Cuál fue tu primer empleo?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu escuela primaria?",
];

type Step = "email" | "questions" | "newPassword" | "success";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [pregunta1, setPregunta1] = useState("");
  const [pregunta2, setPregunta2] = useState("");
  const [respuesta1, setRespuesta1] = useState("");
  const [respuesta2, setRespuesta2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-security-questions", {
        body: { email: email.trim() },
      });

      if (error) throw new Error("Error al buscar la cuenta");
      if (data?.error) throw new Error(data.error);

      setPregunta1(data.pregunta_1);
      setPregunta2(data.pregunta_2);
      setStep("questions");
    } catch (err: any) {
      toast.error(err.message || "No se encontró una cuenta con ese correo");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respuesta1 || !respuesta2) return;
    setStep("newPassword");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password-security", {
        body: {
          email: email.trim(),
          respuesta_1: respuesta1,
          respuesta_2: respuesta2,
          new_password: newPassword,
        },
      });

      if (error) throw new Error("Error al restablecer la contraseña");
      if (data?.error) throw new Error(data.error);

      setStep("success");
      toast.success("¡Contraseña actualizada exitosamente!");
    } catch (err: any) {
      toast.error(err.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="mb-6 flex items-center justify-center gap-2">
      {["email", "questions", "newPassword", "success"].map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              step === s
                ? "bg-accent text-accent-foreground"
                : ["email", "questions", "newPassword", "success"].indexOf(step) > i
                ? "bg-accent/20 text-accent"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          {i < 3 && <div className={`h-0.5 w-6 ${["email", "questions", "newPassword", "success"].indexOf(step) > i ? "bg-accent" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 font-display text-2xl font-bold text-primary">
            <BarChart3 className="h-7 w-7 text-accent" />
            PorcentajeLaboral
          </div>
          <h1 className="text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifica tu identidad con tus preguntas de seguridad
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          {stepIndicator}

          {step === "email" && (
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading || !email}
              >
                {loading ? "Buscando cuenta..." : "Continuar"}
              </Button>
            </form>
          )}

          {step === "questions" && (
            <form className="space-y-4" onSubmit={handleQuestionsSubmit}>
              <div className="rounded-lg bg-accent/5 p-3 text-center">
                <ShieldCheck className="mx-auto mb-1 h-6 w-6 text-accent" />
                <p className="text-xs text-muted-foreground">Responde tus preguntas de seguridad para verificar tu identidad</p>
              </div>
              <div>
                <Label>{pregunta1}</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Tu respuesta"
                  value={respuesta1}
                  onChange={(e) => setRespuesta1(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{pregunta2}</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Tu respuesta"
                  value={respuesta2}
                  onChange={(e) => setRespuesta2(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("email")} className="flex-1">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!respuesta1 || !respuesta2}
                >
                  Verificar
                </Button>
              </div>
            </form>
          )}

          {step === "newPassword" && (
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="rounded-lg bg-accent/10 p-3 text-center">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-accent" />
                <p className="text-xs text-accent">Identidad verificada. Ingresa tu nueva contraseña.</p>
              </div>
              <div>
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("questions")} className="flex-1">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? "Actualizando..." : "Cambiar Contraseña"}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">¡Contraseña actualizada!</h2>
              <p className="text-sm text-muted-foreground">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          )}

          {step !== "success" && (
            <div className="mt-4 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
