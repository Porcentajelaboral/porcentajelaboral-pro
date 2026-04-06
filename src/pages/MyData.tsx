import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Download, UserX, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyData() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDownload = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      const { data: analyses } = await supabase.from("analisis").select("*").eq("user_id", user.id);
      const exportData = {
        perfil: profile,
        analisis: analyses,
        fecha_exportacion: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mis-datos-porcentajelaboral.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Datos descargados exitosamente");
    } catch {
      toast.error("Error al descargar datos");
    } finally {
      setDownloading(false);
    }
  };

  const handleLeavePool = async () => {
    if (!user) return;
    await supabase.from("Perfiles").update({ cv_en_pool: false, autoriza_contacto: false }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Te has retirado del pool de candidatos");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    toast.info("Para eliminar tu cuenta, contacta a contacto@porcentajelaboral.com");
    // In production, this would call an edge function to delete the user
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent" /> Mis Datos
        </h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      {/* Profile summary */}
      <div className="mb-6 rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-card-foreground mb-4">Resumen de datos</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="text-card-foreground">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Nombre:</span><span className="text-card-foreground">{user?.user_metadata?.full_name || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Plan:</span><span className="text-card-foreground">{profile?.plan_tipo || "gratis"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Análisis usados:</span><span className="text-card-foreground">{profile?.analisis_usados || 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">En pool de candidatos:</span><span className="text-card-foreground">{profile?.cv_en_pool ? "Sí" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Registro:</span><span className="text-card-foreground">{profile?.fecha_registro ? new Date(profile.fecha_registro).toLocaleDateString("es-CL") : "—"}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Descargar mis datos</p>
              <p className="text-sm text-muted-foreground">Exporta todos tus datos en formato JSON</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4" /> {downloading ? "Descargando..." : "Descargar"}
            </Button>
          </div>
        </motion.div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Retirarme del pool de candidatos</p>
              <p className="text-sm text-muted-foreground">Las empresas ya no podrán ver tu perfil</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleLeavePool}>
              <UserX className="h-4 w-4" /> Retirarme
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Eliminar mi cuenta y todos mis datos</p>
              <p className="text-sm text-muted-foreground">Esta acción es irreversible</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> ¿Estás seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente tu cuenta, todos tus análisis y datos personales.
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Legal text */}
      <div className="mt-8 rounded-xl border bg-muted/50 p-6 text-sm text-muted-foreground">
        <h3 className="font-display font-semibold text-card-foreground mb-2">Tus derechos según la Ley 19.628</h3>
        <p className="leading-relaxed">
          De acuerdo con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile, tienes derecho a:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Conocer, acceder y obtener información sobre los datos personales almacenados.</li>
          <li>Solicitar la modificación de tus datos cuando sean erróneos, inexactos, equívocos o incompletos.</li>
          <li>Solicitar la eliminación o cancelación de tus datos personales cuando su almacenamiento carezca de fundamento legal.</li>
          <li>Oponerte al tratamiento de tus datos personales con fines de publicidad o estudios de mercado.</li>
        </ul>
        <p className="mt-3">
          Para ejercer estos derechos, contacta a <a href="mailto:contacto@porcentajelaboral.com" className="text-accent hover:underline">contacto@porcentajelaboral.com</a>.
        </p>
      </div>
    </div>
  );
}
