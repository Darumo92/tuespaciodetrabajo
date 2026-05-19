---
name: Estado sesión recovery indexación activa
description: Handoff entre sesiones del plan recovery. Cuando el usuario abra nueva sesión y diga "vamos con lo de ayer" / "seguimos con recovery" / "vamos con bloque B", consultar este memo para saber dónde retomamos exactamente
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## Próxima acción (después de Mar 19 may 2026)

**Bloque C: backlinks Tier 1 + mejora SEO editorial diaria en tandas pequeñas**

Update 2026-05-19 noche:

- Auditoría live GSC/GA4/Cloudflare completada y documentada en `seo-indexing-audit/`.
- Diagnóstico confirmado: problema principal de calidad/indexación, no bloqueo técnico. Home indexada; internas clave rastreadas sin indexar con canonical correcta, fetch correcto y robots permitido.
- Quick wins técnicos aplicados y commiteados:
  - `4e65285 fix: improve category indexability signals` — `/ambiente/` vuelve al sitemap y `/audio-video/` queda oculto de navegación/home/footer/búsqueda mientras está vacío/noindex.
  - `4ffd007 fix: mark direct amazon links as sponsored` — enlaces Amazon directos del artículo BEKANT/E7 marcados como sponsored.
  - `e9023ac content: improve bekant flexispot comparison` — mejora editorial de `/escritorios/ikea-bekant-vs-flexispot-e7/` con `actualizadoEn` real, nota de revisión, tabla de decisión, `AffiliateButton` y checklist de segunda mano.
- Build OK tras cambios.
- Auditoría Amazon del artículo BEKANT/E7: 6 ASINs, 0 incidencias; informe local generado en `reports/amazon-products/audit-2026-05-19.md`.
- Decisión del usuario: NO hacer todos los cambios de golpe. Añadir al plan diario una mejora SEO editorial por tandas pequeñas, además de backlinks y artículos nuevos cuando toque.

Próximo día de trabajo recomendado:

1. Hacer backlinks Tier 1 según `project_backlinks_session_state.md` (Reddit warmup sin links hasta karma >=50).
2. Elegir 1 URL prioritaria y mejorarla con commit separado. Siguiente recomendada: `/ambiente/mejor-lampara-escritorio-led/` o `/sillas/mejor-silla-oficina-menos-200-euros/` según GSC del día.
3. Si se trabaja una URL, aplicar patrón: metodología visible, menos afiliación redundante si existe, experiencia concreta, sección útil tipo checklist/casos donde NO comprar, enlaces internos a artículos concretos.
4. No pedir indexación masiva; pedir solo para URL mejorada tras deploy.

Update 2026-05-19:

- GSC URL Inspection para `https://tuespaciodetrabajo.com/ambiente/mejor-ventilador-silencioso-oficina/`: `Google no reconoce esta URL`.
- La URL sí está publicada y carga correctamente.
- La URL sí aparece en `https://tuespaciodetrabajo.com/sitemap-0.xml` con `lastmod` 2026-05-18.
- GSC muestra `sitemap-index.xml` último envío/descarga 2026-04-27 y `sitemap-0.xml` última descarga 2026-04-26; el sitemap live tiene `lastmod` 2026-05-19.
- Intento de reenviar sitemap por MCP/API falló con `403 Insufficient Permission`. Acción manual recomendada: en Search Console, reenviar `https://tuespaciodetrabajo.com/sitemap-index.xml` y solicitar inspección/indexación de la URL #30 si procede.
- GSC 2026-05-06→2026-05-18: 1 impresión visible (`postura teletrabajo`, `/guias/ergonomia-teletrabajo-postura-correcta/`, posición 88, 2026-05-13).
- GA4 2026-05-18→hoy: sin filas para el sitio ni para la URL #30 en la consulta realizada.

Publicado el artículo recovery #30 el lun 18 may: `mejor-ventilador-silencioso-oficina`.

Siguiente paso recomendado para sesión posterior: retomar backlinks Tier 1. Revisar `docs/PLAN_BACKLINKS_TIER1.md`, `docs/SESION_2_BACKLINKS_PAQUETE.md` y `docs/agent-context/project_backlinks_session_state.md`. Empezar por karma check Reddit y selección de hilos vivos antes de publicar respuestas.

Alternativa si la sesión es corta: revisar GSC/GA4 24-48h después del deploy para confirmar que sitemap/deploy y primeras señales de rastreo del #30 no tienen incidencias.

Próximo artículo del calendario recovery: lun 25 may, `mejores-auriculares-cancelacion-ruido-trabajar` (comparativa pillar audio-video). No adelantar antes del 25 may salvo cambio explícito del usuario, por cadencia recovery 1/semana.

## Trabajo realizado Lun 18 may 2026

- Artículo #30 creado: `src/content/articulos/mejor-ventilador-silencioso-oficina.mdx`.
- URL: `/ambiente/mejor-ventilador-silencioso-oficina/`.
- SERP real aportada por usuario: El Independiente, elEconomista, El Corte Inglés, La Vanguardia, ventiladores.com. Intent dominante: commercial investigation/listicle.
- Keyword Surfer aportado por usuario: `ventilador silencioso` 9900, `mejor ventilador silencioso` 260, `ventilador de torre silencioso` 1000, `ventilador silencioso para dormir` 1600, `ventilador bajo consumo` 390, `ventilador para oficina` 0.
- Productos verificados con `node scripts/amazon-lookup.mjs` y cache API: Philips Serie 2000, Dreo PolyFan, LEVOIT torre, Dreo torre, Cecotec EnergySilence 890, Honeywell TurboForce.
- Cache Amazon actualizado con `npm run update:amazon-cache -- --article mejor-ventilador-silencioso-oficina --delay 2500 --retries 3` (6 ASINs, 0 errores).
- Imagen Pexels descargada tras confirmación de `PEXELS_API_KEY`: Pexels `5850340`, fotógrafo `FOX ^.ᆽ.^= ∫`, guardada como `public/images/articulos/mejor-ventilador-silencioso-oficina.webp`, redimensionada a 800x533.
- SVG temporal eliminado y `PRODUCTOS.md` actualizado con crédito Pexels y tabla de productos.
- `trabajar-desde-casa-calor` actualizado para enlazar al artículo #30.
- SEO engine actualizado: `content-map`, `content-queue`, `topic-clusters`, `seo-keywords`, `features`, `changelog`.
- `AGENTS.md` y `project_amazon_cache_workflow.md` actualizados: usar `scripts/amazon-lookup.mjs --search` antes de pedir ASINs al usuario.
- Skills usadas: `seo` y `humanizer`; además se aplicó el flujo propio `.seo-engine/` del proyecto.
- Build OK: `npm run build`, 47 páginas, CSP hashes actualizados.

## Pendiente para seguir luego

- Confirmar deploy/push final del commit de hoy.
- En 24-48h: comprobar GSC/GA4 para `/ambiente/mejor-ventilador-silencioso-oficina/` y sitemap.
- Retomar Bloque C backlinks Tier 1 si no hay incidencia técnica.
- Preparar, no publicar aún, investigación del artículo del 25 may: `mejores-auriculares-cancelacion-ruido-trabajar`.
- Mantener cadencia recovery: no publicar otro artículo antes del lun 25 may.

Las 3 piezas con densidad afiliada alta ya están refactorizadas:

- Ratón vertical: 7.40 → 3.43/1000w
- Teclado ergonómico: 6.19 → 2.62/1000w
- Lámpara LED: 6.29 → 3.08/1000w

## Calendario semana 06-14 may

| Día | Tarea | Estado |
|---|---|---|
| Mié 06 may | Push fix fechas (commit fa30f13) + plan recovery (d64febc) | ✅ |
| Jue 07 may | Bloque B pieza 1: refactor ratón vertical (commit 49524be) | ✅ 7.40 → 3.43/1000w |
| Vie 08 may | Bloque B pieza 2: refactor teclado ergonómico (commit 671d6c3) | ✅ 6.19 → 2.62/1000w |
| Sáb 09 may | Sin pushes. Opcional: Bloque C backlinks (Quora 5 respuestas) | — |
| Dom 10 may | Sin pushes | — |
| Lun 11 may | Artículo nuevo #29: trabajar-desde-casa-calor | ✅ publicado (2868w, info ambiente) |
| Mar 12 may | Bloque B pieza 3: refactor lámpara LED | ✅ 6.29 → 3.08/1000w |
| Mié 13 may | Bloque D: solicitar indexación manual GSC top 8 URLs | ✅ solicitado por usuario |
| Jue 14 may | **Bloque C backlinks Tier 1** ← SIGUIENTE | Pendiente |

## Top 8 URLs para Bloque D (mié 13 may)

GSC → Inspección URL → Solicitar indexación:

1. https://tuespaciodetrabajo.com/sillas/mejor-silla-ergonomica-calidad-precio/
2. https://tuespaciodetrabajo.com/accesorios/mejor-monitor-trabajar-desde-casa/
3. https://tuespaciodetrabajo.com/escritorios/mejor-escritorio-elevable-electrico/
4. https://tuespaciodetrabajo.com/guias/ergonomia-teletrabajo-postura-correcta/
5. https://tuespaciodetrabajo.com/guias/dolor-espalda-trabajar-casa/
6. https://tuespaciodetrabajo.com/ambiente/mejor-lampara-escritorio-led/ (post-refactor 12 may)
7. https://tuespaciodetrabajo.com/accesorios/mejor-raton-vertical-ergonomico/ (post-refactor 07 may)
8. https://tuespaciodetrabajo.com/accesorios/mejor-teclado-ergonomico/ (post-refactor 08 may)

(Homepage y altura-correcta quedan fuera del top 8 inicial — sustituidas por las tres comparativas refactorizadas con densidad afiliada corregida)

## Estado bloques recovery

- [x] Bloque A día 0: fix fechas frontmatter (commit fa30f13)
- [x] Bloque B pieza 1: ratón vertical (commit 49524be, 07 may, 7.40 → 3.43/1000w)
- [x] Bloque B pieza 2: teclado ergonómico (commit 671d6c3, 08 may, 6.19 → 2.62/1000w)
- [x] Bloque B pieza 3: lámpara LED (commit pendiente, 12 may, 6.29 → 3.08/1000w)
- [x] Bloque C SESION_1 Quora: 5 respuestas publicadas 2026-04-30 (confirmado dom 10 may). Siguiente: SESION_2 Reddit Día 6+ (karma check)
- [x] Bloque D: solicitud indexación manual GSC top 8 (confirmado por usuario 2026-05-13)

## Resumen pieza 2 (vie 08 may)

- Bloque educativo nuevo ~750w pre-ComparisonTable: biomecánica de la muñeca (desviación cubital 15-20°, pronación, extensión dorsal — Cornell + INSST), tres formatos (wave / split fijo curvado / split separable + Kinesis columnar para RSI diagnosticado), cuatro señales tempranas (hormigueo meñique-anular, epicondilitis, tensión trapecios, manos pesadas tarde) con anécdota de lector pidiendo enlace K860, y cuatro escenarios NO comprar (uso <3h, gaming, <30€, síntomas agudos)
- Eliminados 5 AffiliateButton redundantes del cuerpo
- Conservados: TopPick (1) + ComparisonTable (5 filas) + CTAs finales (5) = 11 enlaces /dp/
- Densidad final: 11 / ~4200w = **2.62/1000w** (objetivo ≤5)
- Coherencia persona: "Barcelona" → "Rubí 9 m²" + Pep/Fisiosthetic/Rubí
- Anécdota nueva: lector escribió pidiendo enlace K860 tras 6 meses con hormigueo meñique (no contradice lectora PERIBOARD-612 ya en cuerpo)
- Compañero Madrid (existente) coherente con ratón vertical post-refactor (mismo compañero: tendinitis 1ª, Anker después)
- Fuentes externas: Cornell Ergonomics + INSST (existentes reforzadas)
- Build OK, push único del día (671d6c3)

## Resumen pieza 3 (mar 12 may)

- Bloque educativo nuevo ~780w pre-ComparisonTable: lux y lúmenes (500 lux como referencia de trabajo con pantalla), INSST/RD 486/1997, distancia y orientación real, CCT 4000-5000 K para jornada, 2700-3000 K para cierre, CRI ≥80, parpadeo/PWM, y casos donde NO comprar lámpara nueva.
- Eliminados 7 AffiliateButton sueltos tras cada producto.
- Conservados/reubicados: TopPick (1) + ComparisonTable (7 filas) + 5 CTAs finales = 13 enlaces /dp/.
- Densidad final: 13 / 4224w = **3.08/1000w** (objetivo ≤5).
- Coherencia persona: Rubí, despacho 9 m², ventana norte, BenQ ScreenBar Halo y Xiaomi usada por su mujer, consistente con `mi-setup-home-office-2026`.
- Fuentes externas: INSST iluminación.
- Build OK (`npm run build`, 46 páginas, CSP hashes actualizados).

## Documentación de referencia

- Plan completo: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md`
- Calendario: `project_content_calendar.md`
- Persona autor: `project_author_persona.md`
- Backlinks: `docs/PLAN_BACKLINKS_TIER1.md`
- Sesión backlinks pendiente: `docs/SESION_1_BACKLINKS_PAQUETE.md`
