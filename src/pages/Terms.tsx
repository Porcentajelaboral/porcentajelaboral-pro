import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { LegalSection, LegalList, HighlightBox, WarningBox, ContactBlock } from "@/components/legal/LegalComponents";

export default function Terms() {
  const fecha = "10 de abril de 2026";

  return (
    <div className="container max-w-4xl py-12">
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/5 p-6 mb-8 text-center">
        <span className="inline-block rounded-full border border-accent/50 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
          Ley N° 19.496 · Chile
        </span>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground">Reglas de uso del sitio web conforme a la legislación chilena vigente</p>
      </div>

      <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-4 mb-8 text-sm text-muted-foreground">
        <strong className="text-foreground">Marco legal:</strong> Estos Términos se rigen por la <strong className="text-primary">Ley N° 19.496</strong> sobre Protección de los Derechos de los Consumidores, el <strong className="text-primary">Código Civil de Chile</strong>, la <strong className="text-primary">Ley N° 19.628</strong> de Protección de Datos y demás normativa aplicable. Última actualización: {fecha}.
      </div>

      <div className="space-y-6">
        <LegalSection num={1} title="Aceptación de los Términos">
          <p>Al acceder, navegar o utilizar el sitio web <strong>porcentajelaboral.com</strong> (en adelante, "el Sitio"), usted acepta plena y expresamente estos Términos y Condiciones. Si no está de acuerdo, le pedimos que se abstenga de usar el Sitio.</p>
          <p>El Sitio es operado por <strong>Serviprotec</strong>, con domicilio en Santiago, Chile.</p>
          <HighlightBox>
            Para los efectos de estos Términos, se entenderá por <strong>"Usuario"</strong> toda persona natural o jurídica que acceda o utilice el Sitio, y por <strong>"Servicios"</strong> todas las funcionalidades, contenidos y productos disponibles en él.
          </HighlightBox>
        </LegalSection>

        <LegalSection num={2} title="Uso Permitido del Sitio">
          <p>El Usuario se compromete a utilizar el Sitio de forma lícita, responsable y conforme a la legislación chilena vigente. Queda expresamente <strong>prohibido:</strong></p>
          <LegalList items={[
            "Acceder o intentar acceder sin autorización a sistemas, cuentas o datos de otros usuarios.",
            "Publicar, transmitir o distribuir contenido ilegal, difamatorio, obsceno o que infrinja derechos de terceros.",
            "Utilizar bots, scrapers u otros medios automatizados sin autorización escrita del Sitio.",
            "Suplantar la identidad de otra persona o entidad.",
            "Introducir virus, malware u otros códigos maliciosos (Ley N° 21.459 sobre Delitos Informáticos).",
            "Realizar actividades que puedan dañar, sobrecargar o deteriorar el Sitio o sus sistemas.",
            "Usar el Sitio para fines comerciales no autorizados.",
          ]} />
          <p>El incumplimiento de estas restricciones podrá dar lugar a la suspensión o cancelación de su cuenta, sin perjuicio de las acciones legales que correspondan.</p>
        </LegalSection>

        <LegalSection num={3} title="Registro y Cuenta de Usuario">
          <p>Para acceder a determinadas funcionalidades del Sitio, es posible que deba crear una cuenta. Al registrarse, usted declara que:</p>
          <LegalList items={[
            "Es mayor de 18 años o cuenta con autorización de su representante legal.",
            "La información proporcionada es veraz, exacta y actualizada.",
            "Mantendrá la confidencialidad de sus credenciales de acceso.",
            "Notificará de inmediato cualquier uso no autorizado de su cuenta.",
          ]} />
          <p>Nos reservamos el derecho de rechazar el registro, suspender o cancelar cuentas que infrinjan estos Términos, sin previo aviso y sin expresión de causa cuando ello sea justificado.</p>
        </LegalSection>

        <LegalSection num={4} title="Servicios, Precios y Pagos">
          <p>Los precios publicados en el Sitio incluyen el Impuesto al Valor Agregado (IVA) salvo indicación expresa en contrario, conforme a la Ley N° 19.496. Nos reservamos el derecho de modificar precios con previo aviso razonable.</p>
          <LegalList items={[
            "Los pagos se procesan a través de pasarelas seguras certificadas (PCI-DSS). No almacenamos datos de tarjetas.",
            "El cargo se realizará en el momento de la confirmación de la compra o suscripción.",
            "Las transacciones se realizan en Pesos Chilenos (CLP) salvo indicación contraria.",
          ]} />
          <WarningBox>
            <strong>Derecho a retracto (Art. 3° bis Ley 19.496):</strong> En compras realizadas a distancia (internet), usted tiene derecho a retractarse dentro de los <strong>10 días hábiles</strong> siguientes a la recepción del producto o contratación del servicio, siempre que no haya comenzado la ejecución del mismo, con reembolso íntegro del precio pagado.
          </WarningBox>
        </LegalSection>

        <LegalSection num={5} title="Propiedad Intelectual">
          <p>Todo el contenido del Sitio —incluyendo textos, imágenes, logotipos, gráficos, código fuente, diseño y estructura— es propiedad de <strong>Serviprotec</strong> o de sus licenciantes, y está protegido por la <strong>Ley N° 17.336 sobre Propiedad Intelectual</strong> de Chile.</p>
          <p>Queda prohibida la reproducción, distribución, modificación o explotación de cualquier contenido del Sitio sin autorización escrita previa. Se permite la descarga o impresión para uso personal y no comercial.</p>
          <p>Las marcas, nombres comerciales y logotipos del Sitio son marcas registradas protegidas por la Ley N° 19.039 sobre Propiedad Industrial.</p>
        </LegalSection>

        <LegalSection num={6} title="Contenido Generado por Usuarios">
          <p>Si el Sitio permite que los usuarios publiquen contenido (CVs, análisis, etc.), usted declara que:</p>
          <LegalList items={[
            "Es el titular o cuenta con los derechos necesarios sobre dicho contenido.",
            "El contenido no infringe derechos de terceros ni la legislación chilena vigente.",
            "Nos otorga una licencia no exclusiva, gratuita y mundial para mostrar dicho contenido en el Sitio.",
          ]} />
          <p>Nos reservamos el derecho de eliminar contenido que consideremos inapropiado, ilegal o contrario a estos Términos, sin previo aviso.</p>
        </LegalSection>

        <LegalSection num={7} title="Limitación de Responsabilidad">
          <p>En la medida permitida por la legislación chilena vigente y sin perjuicio de los derechos irrenunciables del consumidor establecidos en la Ley N° 19.496:</p>
          <LegalList items={[
            "El Sitio se provee \"tal como está\" y no garantizamos disponibilidad ininterrumpida.",
            "No somos responsables de daños indirectos derivados del uso o imposibilidad de uso del Sitio.",
            "No somos responsables del contenido de sitios web de terceros vinculados desde el Sitio.",
            "Nos esforzamos por mantener la información actualizada y precisa, pero no garantizamos su completitud.",
          ]} />
          <HighlightBox>
            Nada en estos Términos limita derechos que por ley son irrenunciables para el consumidor chileno, incluyendo garantías legales, derecho a retracto y acceso al SERNAC.
          </HighlightBox>
        </LegalSection>

        <LegalSection num={8} title="Privacidad y Protección de Datos">
          <p>El tratamiento de sus datos personales se rige por nuestra <strong>Política de Privacidad</strong>, la cual forma parte integrante de estos Términos y Condiciones. Al aceptar estos Términos, usted también acepta nuestra Política de Privacidad conforme a la Ley N° 19.628.</p>
          <p>Puede consultar nuestra Política de Privacidad completa en <Link to="/privacidad" className="text-accent hover:underline font-medium">esta página</Link> o solicitarla a <strong>contacto@porcentajelaboral.com</strong>.</p>
        </LegalSection>

        <LegalSection num={9} title="Modificaciones de los Términos">
          <p>Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios se publicarán en esta página con la fecha de actualización. Para modificaciones sustanciales, notificaremos a los usuarios registrados mediante correo electrónico con al menos <strong>15 días de anticipación.</strong></p>
          <p>El uso continuado del Sitio después de la publicación de los cambios implica su aceptación. Si no está de acuerdo, puede dar de baja su cuenta contactándonos.</p>
        </LegalSection>

        <LegalSection num={10} title="Ley Aplicable y Resolución de Disputas">
          <p>Estos Términos y Condiciones se rigen exclusivamente por las leyes de la <strong>República de Chile.</strong> Para la resolución de controversias, las partes se someten a:</p>
          <LegalList items={[
            "Mediación como instancia previa y preferente ante el SERNAC (Servicio Nacional del Consumidor).",
            "Juzgados de Policía Local de Chile para disputas de consumo.",
            "Tribunales Ordinarios de Justicia de Chile para otras materias.",
          ]} />
          <p>Lo anterior sin perjuicio del derecho de los consumidores a acudir a las instancias que la ley chilena les reconoce, incluyendo la Ley N° 19.496 y sus modificaciones posteriores.</p>
          <ContactBlock />
        </LegalSection>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Términos y Condiciones · Vigente desde {fecha} · Ley N° 19.496 · República de Chile
        </p>
        <Link to="/privacidad" className="text-sm text-accent hover:underline flex items-center gap-1">
          <Shield className="h-4 w-4" /> Ver Política de Privacidad
        </Link>
      </div>
    </div>
  );
}
