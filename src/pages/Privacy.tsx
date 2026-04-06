import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-7 w-7 text-accent" />
        <h1 className="font-display text-3xl font-bold text-foreground">Política de Privacidad</h1>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>Última actualización: Abril 2026</p>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Información que Recopilamos</h2>
          <p>Recopilamos información personal que nos proporcionas directamente, como tu nombre, correo electrónico y contenido de tu CV cuando utilizas nuestros servicios de análisis.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Uso de la Información</h2>
          <p>Utilizamos tu información para proporcionar y mejorar nuestros servicios de análisis de compatibilidad laboral. Tu CV es procesado por nuestra IA exclusivamente para generar el análisis solicitado.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Protección de Datos</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal. Todos los datos son encriptados en tránsito y en reposo.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Retención de Datos</h2>
          <p>Conservamos tu información mientras mantengas una cuenta activa. Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Tus Derechos</h2>
          <p>De acuerdo con la legislación chilena, tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales (derechos ARCO).</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Contacto</h2>
          <p>Para consultas sobre privacidad, contáctanos en privacidad@porcentajelaboral.cl</p>
        </section>
      </div>
    </div>
  );
}
