import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Mail, Lock, User, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SECURITY_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu mejor amigo/a de la infancia?",
  "¿Cuál fue tu primer empleo?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu escuela primaria?",
];

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

  // Security questions
  const [pregunta1, setPregunta1] = useState("");
  const [respuesta1, setRespuesta1] = useState("");
  const [pregunta2, setPregunta2] = useState("");
  const [respuesta2, setRespuesta2] = useState("");

  const canSubmit =
    acceptTerms &&
    acceptPrivacy &&
    name &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    password.length >= 8 &&
    pregunta1 &&
    respuesta1 &&
    pregunta2 &&
    respuesta2 &&
    pregunta1 !== pregunta2 &&
    (userType === "candidato" || (userType === "empresa" && empresaNombre.trim().length > 0));

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

      // Check if email confirmation is required (no session returned)
      const hasSession = !!data.session;

      // Save security questions only if we have an active session
      if (data.user && hasSession) {
        const { error: secError } = await supabase.from("preguntas_seguridad").insert({
          user_id: data.user.id,
          pregunta_1: pregunta1,
          respuesta_1: respuesta1.trim().toLowerCase(),
          pregunta_2: pregunta2,
          respuesta_2: respuesta2.trim().toLowerCase(),
        });
        if (secError) {
          console.error("Error saving security questions:", secError);
          toast.error("Cuenta creada, pero hubo un error guardando las preguntas de seguridad.");
        }
      } else if (data.user && !hasSession) {
        // Store questions temporarily to save after email confirmation
        localStorage.setItem("pending_security_questions", JSON.stringify({
          user_id: data.user.id,
          pregunta_1: pregunta1,
          respuesta_1: respuesta1.trim().toLowerCase(),
          pregunta_2: pregunta2,
          respuesta_2: respuesta2.trim().toLowerCase(),
        }));
      }

      if (hasSession) {
        toast.success("¡Cuenta creada exitosamente!");
        navigate("/dashboard");
      } else {
        toast.success("¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.", { duration: 8000 });
        navigate("/login");
      }
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        toast.error("Este correo ya está registrado. Intenta iniciar sesión.");
      } else {
        toast.error(err.message || "Error al crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  const availableQ2 = SECURITY_QUESTIONS.filter((q) => q !== pregunta1);

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

            {/* Security Questions */}
            <div className="space-y-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <ShieldCheck className="h-4 w-4" />
                Preguntas de Seguridad
              </div>
              <p className="text-xs text-muted-foreground">
                Estas preguntas te permitirán recuperar tu contraseña sin necesidad de correo.
              </p>

              <div>
                <Label className="text-xs">Pregunta 1</Label>
                <Select value={pregunta1} onValueChange={setPregunta1}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una pregunta" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTIONS.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pregunta1 && (
                  <Input
                    className="mt-1.5"
                    placeholder="Tu respuesta"
                    value={respuesta1}
                    onChange={(e) => setRespuesta1(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <Label className="text-xs">Pregunta 2</Label>
                <Select value={pregunta2} onValueChange={setPregunta2}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una pregunta" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQ2.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pregunta1 === pregunta2 && pregunta2 && (
                  <p className="mt-1 text-xs text-destructive">Debes elegir preguntas diferentes</p>
                )}
                {pregunta2 && pregunta1 !== pregunta2 && (
                  <Input
                    className="mt-1.5"
                    placeholder="Tu respuesta"
                    value={respuesta2}
                    onChange={(e) => setRespuesta2(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Acepto los{" "}
                  <Link to="/terminos" className="text-accent hover:underline" target="_blank">Términos y Condiciones</Link>
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
