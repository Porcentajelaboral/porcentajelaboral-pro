import { Shield, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Privacy() {
  const fecha = "10 de abril de 2026";

  return (
    <div className="container max-w-4xl py-12">
      <Tabs defaultValue="privacidad" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="privacidad" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Política de Privacidad
          </TabsTrigger>
          <TabsTrigger value="terminos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Términos y Condiciones
          </TabsTrigger>
        </TabsList>

        {/* ===== POLÍTICA DE PRIVACIDAD ===== */}
        <TabsContent value="privacidad">
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

          <p className="text-center text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
            Política de Privacidad · Vigente desde {fecha} · Ley N° 19.628 República de Chile
          </p>
        </TabsContent>

        {/* ===== TÉRMINOS Y CONDICIONES ===== */}
        <TabsContent value="terminos">
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
              <p>Puede consultar nuestra Política de Privacidad completa en la pestaña correspondiente de esta página o solicitarla a <strong>contacto@porcentajelaboral.com</strong>.</p>
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

          <p className="text-center text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
            Términos y Condiciones · Vigente desde {fecha} · Ley N° 19.496 · República de Chile
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Reusable sub-components ── */

function LegalSection({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-3 bg-primary px-5 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/20 text-xs font-bold text-accent">
          {num}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground">{title}</h2>
      </div>
      <div className="p-5 space-y-3 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 my-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground">
          <span className="text-accent font-bold shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground my-3">
      {children}
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 text-sm text-yellow-800 dark:text-yellow-200 my-3">
      {children}
    </div>
  );
}

function ContactBlock() {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg bg-primary p-4 mt-3 text-sm text-primary-foreground/75">
      <span>📧 contacto@porcentajelaboral.com</span>
      <span className="text-primary-foreground/30">|</span>
      <span>📍 Santiago, Chile</span>
    </div>
  );
}
