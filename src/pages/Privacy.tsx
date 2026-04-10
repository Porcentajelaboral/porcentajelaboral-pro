import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { LegalSection, LegalList, HighlightBox, ContactBlock } from "@/components/legal/LegalComponents";

export default function Privacy() {
  const fecha = "10 de abril de 2026";

  return (
    <div className="container max-w-4xl py-12">
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/5 p-6 mb-8 text-center">
        <span className="inline-block rounded-full border border-accent/50 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
          Ley N° 19.628 · Chile
        </span>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Conforme a la legislación chilena vigente de protección de datos personales</p>
      </div>

      <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4 mb-8 text-sm text-muted-foreground">
        <strong className="text-foreground">Marco legal:</strong> Esta política se rige por la <strong className="text-primary">Ley N° 19.628</strong> sobre Protección de la Vida Privada, la <strong className="text-primary">Ley N° 19.496</strong> sobre Protección de los Derechos de los Consumidores y demás normativa aplicable en Chile. Última actualización: {fecha}.
      </div>

      <div className="space-y-6">
        <LegalSection num={1} title="Responsable del Tratamiento">
          <p><strong>Serviprotec</strong> (en adelante, "nosotros" o "el Sitio"), con domicilio en Santiago, Chile y correo de contacto <strong>contacto@porcentajelaboral.com</strong>, es el responsable del tratamiento de sus datos personales conforme al artículo 2° de la Ley N° 19.628.</p>
        </LegalSection>

        <LegalSection num={2} title="Datos que Recopilamos">
          <p>Podemos recopilar los siguientes datos personales:</p>
          <LegalList items={[
            "Nombre completo, correo electrónico y número de teléfono",
            "Datos de registro de cuenta (usuario y contraseña cifrada)",
            "Información de facturación (gestionada por pasarelas de pago certificadas PCI-DSS)",
            "Dirección IP, tipo de navegador y datos de navegación (cookies)",
            "Contenido del CV y formularios de análisis",
          ]} />
          <HighlightBox>
            <strong>Menores de edad:</strong> Este Sitio no está dirigido a personas menores de 14 años. No recopilamos intencionalmente sus datos. Si usted es padre o tutor y detecta que su hijo ha proporcionado datos, contáctenos para eliminarlos de inmediato (Art. 10° Ley 19.628).
          </HighlightBox>
        </LegalSection>

        <LegalSection num={3} title="Finalidad y Base Legal del Tratamiento">
          <p>Tratamos sus datos para las siguientes finalidades, siempre con base legal conforme al artículo 4° de la Ley N° 19.628:</p>
          <LegalList items={[
            "Prestación del servicio: gestionar su cuenta y entregar los servicios contratados",
            "Comunicaciones: responder consultas y enviar información relevante del servicio",
            "Marketing (con consentimiento): envío de newsletter y comunicaciones comerciales",
            "Mejora del servicio: análisis estadístico del uso del Sitio (datos anonimizados)",
            "Cumplimiento legal: obligaciones tributarias ante el SII y mandatos judiciales",
            "Seguridad: prevención de fraude y protección de la integridad del Sitio",
          ]} />
          <p>Sus datos no serán utilizados para finalidades distintas a las indicadas sin su consentimiento previo.</p>
        </LegalSection>

        <LegalSection num={4} title="Cookies y Tecnologías de Rastreo">
          <p>Utilizamos cookies propias y de terceros conforme a las directrices de la Ley N° 19.628 y SUBTEL:</p>
          <LegalList items={[
            "Esenciales: necesarias para el funcionamiento básico del Sitio (no requieren consentimiento)",
            "Analíticas: estadísticas de uso anónimas (requieren consentimiento)",
            "Marketing: publicidad personalizada (requieren consentimiento explícito)",
          ]} />
          <p>Puede gestionar o rechazar cookies no esenciales desde la configuración de su navegador.</p>
        </LegalSection>

        <LegalSection num={5} title="Compartición de Datos con Terceros">
          <p><strong>No vendemos ni comercializamos sus datos.</strong> Podemos compartirlos únicamente con:</p>
          <LegalList items={[
            "Proveedores de servicios tecnológicos (hosting, correo, analítica) bajo contrato de confidencialidad",
            "Pasarelas de pago certificadas (Flow u otras PCI-DSS)",
            "Autoridades competentes cuando sea exigido por ley o resolución judicial",
          ]} />
          <p>En caso de transferencias internacionales, adoptamos salvaguardas contractuales equivalentes a las exigidas por la ley chilena (Art. 24° Ley N° 19.628).</p>
        </LegalSection>

        <LegalSection num={6} title="Sus Derechos como Titular (ARCO)">
          <p>Conforme a los artículos 12°, 13° y 14° de la Ley N° 19.628, usted tiene derecho a:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {[
              { title: "Acceso", desc: "Conocer qué datos tenemos sobre usted y cómo los usamos" },
              { title: "Rectificación", desc: "Corregir datos inexactos, desactualizados o erróneos" },
              { title: "Cancelación", desc: "Solicitar la eliminación de sus datos cuando no sean necesarios" },
              { title: "Oposición", desc: "Oponerse al tratamiento para fines específicos como marketing" },
            ].map((r) => (
              <div key={r.title} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">{r.title}</div>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
          <p>Para ejercer sus derechos, contáctenos en <strong>contacto@porcentajelaboral.com</strong> indicando su nombre, RUT y el derecho que desea ejercer. Responderemos en máximo <strong>5 días hábiles.</strong></p>
          <p>Si no está conforme con nuestra respuesta, puede acudir al <strong>Consejo para la Transparencia (CPLT)</strong> o a los Tribunales de Justicia de Chile.</p>
        </LegalSection>

        <LegalSection num={7} title="Conservación y Eliminación de Datos">
          <p>Sus datos se conservarán únicamente el tiempo necesario para cumplir las finalidades indicadas:</p>
          <LegalList items={[
            "Datos de cuenta activa: durante la vigencia de su cuenta y 5 años posteriores al cierre",
            "Datos de facturación: 6 años conforme al Código Tributario y normativa del SII",
            "Comunicaciones de marketing: hasta que retire su consentimiento",
            "Logs de seguridad: 6 a 12 meses",
          ]} />
          <p>Transcurrido el período de retención, los datos serán eliminados de forma segura o anonimizados de manera irreversible.</p>
        </LegalSection>

        <LegalSection num={8} title="Seguridad de los Datos">
          <p>Aplicamos medidas técnicas y organizativas de seguridad conforme al artículo 11° de la Ley N° 19.628, entre ellas:</p>
          <LegalList items={[
            "Cifrado de datos en tránsito (TLS/HTTPS) y en reposo",
            "Control de acceso con principio de mínimo privilegio",
            "Copias de seguridad periódicas y monitoreo continuo",
            "Contratos de confidencialidad con todo el personal y proveedores",
          ]} />
          <p>En caso de brecha de seguridad que pueda causarle perjuicio, le notificaremos a usted y a las autoridades competentes en el menor plazo posible.</p>
        </LegalSection>

        <LegalSection num={9} title="Modificaciones y Contacto">
          <p>Podemos actualizar esta Política de Privacidad para reflejar cambios legales o en nuestras prácticas. Le notificaremos cambios sustanciales mediante correo electrónico con al menos <strong>15 días de anticipación.</strong></p>
          <p>Para consultas, solicitudes o reclamos relacionados con su privacidad, contáctenos:</p>
          <ContactBlock />
        </LegalSection>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Política de Privacidad · Vigente desde {fecha} · Ley N° 19.628 República de Chile
        </p>
        <Link to="/terminos" className="text-sm text-accent hover:underline flex items-center gap-1">
          <FileText className="h-4 w-4" /> Ver Términos y Condiciones
        </Link>
      </div>
    </div>
  );
}
