# Plan: Auditoría completa de porcentajelaboral.com

Voy a trabajar en 4 fases. Te entrego un informe en cada una y solo aplico cambios cuando me confirmes.

## Fase 1 — Auditoría técnica (sin tocar código)
- Revisar rutas, `AuthContext`, `ProtectedRoute`, `Login`, `Register`, `Dashboard`, `Analysis`, `Results`, `JobMatching`, `Enterprise`, `Pricing`, `AdminDashboard`, `MyData`, `History`, `ForgotPassword`, `ResetPassword`.
- Revisar Edge Functions: `analyze-cv`, `job-matching`, `scrape-job-url`, `scrape-job-offer`, `flow-create`, `flow-webhook`, `reset-password-security`, `get-security-questions`, `auth-email-hook`.
- Revisar RLS, GRANTS, triggers y funciones (`handle_new_user`, `has_role`, `is_admin`).
- Correr `supabase--linter` y `security--get_scan_results`.
- Revisar logs recientes de Edge Functions con errores.

**Entregable:** lista priorizada de bugs (🔴 bloqueantes / 🟡 importantes / 🟢 cosméticos).

## Fase 2 — Pruebas E2E reales en el preview
Usando el navegador automatizado, con cuentas de prueba (`qa+gratis@…`, `qa+premium@…`, `qa+elite@…`, `qa+enterprise@…`, `qa+empresa@…`):

```text
1. Registro candidato → verifica trigger Perfiles + plan gratis
2. Login → redirige a /dashboard
3. Análisis CV (gratis): subir CV + oferta manual → resultado
4. Verificar contador analisis_usados y bloqueo al 5º
5. Promover usuario a premium (via admin/SQL) → verificar:
   - JobMatching accesible
   - LockedOverlay desbloqueado
   - Análisis por URL funciona
6. Elite → campos adicionales del análisis (carta, entrevista)
7. Enterprise → registro empresa, /empresa carga, crear oferta
8. Reset password con preguntas de seguridad
9. ?preview_plan=elite con usuario no-admin → debe ser ignorado
10. Logout y rutas protegidas → redirect a /login
```

**Entregable:** matriz pasa/falla por flujo + screenshots de errores.

## Fase 3 — Arreglos de los bugs encontrados
Te muestro cada arreglo antes de aplicarlo si es invasivo (RLS, migraciones). Cambios pequeños (textos, validaciones, manejo de errores) los aplico directo y te los listo al final.

## Fase 4 — Propuestas de mejora (documento, sin código)
Te entrego un documento con propuestas priorizadas (impacto/esfuerzo) en las 4 áreas que elegiste:

### UX/UI y conversión
- Onboarding guiado post-registro (3 pasos).
- Landing: prueba social (logos, testimonios, casos), CTA más claro, demo interactiva sin login.
- Pricing: comparativa visual + FAQ + garantía/devolución.
- Estados vacíos en Dashboard/Historial con CTA accionable.
- Mejorar feedback en análisis (skeleton + progreso real).

### SEO y posicionamiento
- `react-helmet-async` por ruta + JSON-LD (`Organization`, `Product`, `FAQPage`).
- Sitemap.xml dinámico + robots.txt revisado.
- Landing pages SEO ("análisis cv chile", "carta presentación ia", "match laboral"). Lo valido con Semrush DB `mx`/`us` para Chile.
- Blog/recursos (guías de CV, plantillas) para tráfico orgánico.
- Mejorar meta tags, OG image, Twitter card.

### Nuevas funcionalidades IA
- Generador de carta de presentación personalizada (Elite+).
- Simulador de entrevista por voz/texto (Elite+).
- Reescritor de CV con sugerencias de keywords ATS.
- Ranking comparativo: "tu CV vs candidatos promedio en esta oferta".
- Alertas IA: nuevas ofertas que matchean >80% (premium+).
- Análisis de tendencias del mercado por área/región.

### Panel empresa / matching
- Dashboard empresa: KPIs (ofertas activas, candidatos, match promedio).
- Búsqueda y filtrado avanzado de candidatos en el pool.
- Pipeline de candidatos (kanban: nuevo → revisado → entrevista → contratado).
- Mejoras al algoritmo: ponderar experiencia/ubicación/disponibilidad.
- Notas internas y etiquetas por candidato.
- Exportar shortlist a CSV/PDF.
- Mensajería interna empresa ↔ candidato.

## Notas técnicas
- Las cuentas de prueba quedarán marcadas para que las puedas borrar después (o las borro yo al final).
- Para probar Premium/Elite/Enterprise sin pasar por Flow.cl, actualizo `plan_tipo` directo en `Perfiles` vía SQL (es la forma estándar de QA).
- Si encuentro algo que requiere migración SQL o cambio de RLS, te lo muestro antes de ejecutar.
- No tocaré Flow.cl en producción; solo verifico que `flow-create` responda OK con datos de prueba.

¿Apruebas este plan? Si quieres acotar algo (saltar alguna fase, no crear cuentas reales, enfocar más en una área), dímelo antes de empezar.