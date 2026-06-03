---
name: Estado sesión recovery indexación activa
description: Handoff entre sesiones del plan recovery. Cuando el usuario abra nueva sesión y diga "vamos con lo de ayer" / "seguimos con recovery" / "vamos con bloque B", consultar este memo para saber dónde retomamos exactamente
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## Update 2026-06-03 — Recovery v2 Dia 2

- Deploy Cloudflare resuelto: produccion ya sirve la seccion `Plan de 7 dias para corregir tu postura sin comprar nada` en la URL test y el sitemap live tiene `lastmod 2026-06-02T13:57:51.914Z`.
- GSC sitemaps: `sitemap-index.xml` con `lastSubmitted 2026-06-02T12:17:21Z` y `lastDownloaded 2026-06-02T12:44:21Z`. Ya no figura el 19 may -> paso "reenviar sitemap" cerrado, no hace falta accion.
- GSC Search Analytics `2026-05-16` -> `2026-06-02` (dim date): 0 impresiones/clicks todos los dias; blackout de rendimiento continua.
- GSC live (index_inspect):
  - `/guias/ergonomia-teletrabajo-postura-correcta/`: `Crawled - currently not indexed`, ultimo rastreo `2026-05-25T22:44:40Z`, referrer solo Quora ES. La mejora del 02 jun y el link de LinkedIn aun NO recogidos (no re-crawl desde 25 may). LinkedIn todavia NO aparece como referrer.
  - `/metodologia-editorial/`: `Crawled - currently not indexed`, ultimo rastreo `2026-06-01T14:37:22Z`.
  - `/como-probamos-productos/`: `URL is unknown to Google` (nunca rastreada pese a responder 200).
  - `/sobre-mi/`: `URL is unknown to Google` (nunca rastreada pese a responder 200).
- Trust pages live: `/metodologia-editorial/`, `/como-probamos-productos/`, `/sobre-mi/` responden 200 en produccion.

Backlinks Quora ES publicados hoy (3 respuestas, link contextual 1 por respuesta, borradores pasados por humanizer). Metodo documentado en `reference_quora_es_workflow.md` (busqueda Brave `site:es.quora.com/`):
- `https://es.quora.com/Qu%C3%A9-silla-para-PC-u-oficina-de-bajo-presupuesto-recomiendan` -> `/sillas/mejor-silla-ergonomica-calidad-precio/`
- `https://es.quora.com/Cono-quitar-el-dolor-de-espalda-de-tanto-estar-sentado` -> `/guias/dolor-espalda-trabajar-casa/`
- `https://es.quora.com/Cu%C3%A1l-es-la-posici%C3%B3n-ideal-para-sentarse-frente-a-la-computadora-al-trabajar` -> `/guias/ergonomia-teletrabajo-postura-correcta/`

Proximos pasos:
1. Accion manual del usuario (API no permite Request Indexing): pedir indexacion en GSC de las 2 `Unknown to Google`: `https://tuespaciodetrabajo.com/como-probamos-productos/` y `https://tuespaciodetrabajo.com/sobre-mi/`.
2. Monitorizar re-crawl de la URL test y aparicion de Quora/LinkedIn como referrer de las 3 URLs destino en los proximos dias.
3. Pausa editorial sigue vigente: no publicar articulos nuevos hasta >=3 URLs prioritarias indexadas. Reddit sin links hasta `total_karma >= 50`.
4. Cadencia Quora: no mas de 3 respuestas/semana espaciadas 24h+; proxima tanda con ratio respuesta:link 2-3:1 (alguna sin link).

---
## Update 2026-06-02 — Recovery v2 Dia 1

- GSC Search Analytics `2026-05-14` -> `2026-06-01`: sin filas devueltas; blackout de rendimiento continua.
- GA4 `2026-05-14` -> `2026-06-01`: 10 sesiones, 7 usuarios activos, 5 engaged sessions, todas `Direct`; 0 `Organic Search`.
- GSC live:
  - `/` sigue `Enviada e indexada`, ultimo rastreo `2026-05-31T23:50:04Z`.
  - `/guias/ergonomia-teletrabajo-postura-correcta/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T22:44:40Z`, referrer externo Quora detectado.
  - `/metodologia-editorial/` ya fue rastreada el `2026-06-01T14:37:22Z` y queda `Rastreada: actualmente sin indexar`.
  - `/como-probamos-productos/` y `/sobre-mi/` todavia figuran como `Google no reconoce esta URL`, aunque ambas responden 200 en produccion.
- GSC sitemaps: `sitemap-index.xml` sigue con ultima descarga/envio `2026-05-19`; sitemap live actualizado a `2026-06-01T14:34:07.762Z` antes de la mejora de hoy.
- Cloudflare API/MCP probado otra vez: falla con `Authentication error` (`10000`); no cambia diagnostico porque curl live confirma 200 en paginas nuevas y GSC confirma rastreo correcto de home/metodologia.
- Mejora profunda aplicada a la URL test:
  - `src/content/articulos/ergonomia-teletrabajo-postura-correcta.mdx`
  - añadido `actualizadoEn: 2026-06-02` por cambio real;
  - añadida seccion `Plan de 7 dias para corregir tu postura sin comprar nada`, con tabla de diagnostico, mediciones por dia y criterios para decidir compra/fisio.
- Build OK: `npm run build`, 49 paginas; sitemap `lastmod` actualizado a `2026-06-02T11:40:00.670Z`; CSP hashes regenerados sin cambio pendiente en `public/_headers`.
- Commit/push OK: `ac2963b content: improve ergonomics recovery test guide` enviado a `origin/main`.
- Verificacion live inmediata post-push: produccion aun no servia la nueva seccion; esperar deploy/propagacion de Cloudflare Pages y comprobar de nuevo.
- Usuario confirma que ya hizo la indexacion manual indicada tras la mejora.
- Segunda verificacion live en la conversacion: produccion todavia no muestra `Plan de 7 dias` ni sitemap `lastmod` de `2026-06-02`; repo limpio/sincronizado. Sospecha: deploy de Cloudflare Pages pendiente/no actualizado.
- Usuario confirma que publico el post publico de LinkedIn de David enlazando la URL test.
- URL compartida: `https://www.linkedin.com/posts/david-rubio-mota_en-2020-empec%C3%A9-a-teletrabajar-desde-la-mesa-share-7467574822030561281-9lu8/`
- Verificacion HTTP: la URL responde 307 y redirige a una URL canonica publica con HTTP 200:
  `https://es.linkedin.com/posts/david-rubio-mota_gu%C3%ADa-de-ergonom%C3%ADa-para-teletrabajadores-activity-7467574822773108736-RX1s`

Proximos pasos:
1. Confirmar que produccion sirve la seccion `Plan de 7 dias para corregir tu postura sin comprar nada`.
2. Revisar Cloudflare Pages/deploy si sigue sin actualizar tras unos minutos.
3. Reenviar manualmente `https://tuespaciodetrabajo.com/sitemap-index.xml` en GSC si sigue con ultima descarga del 19 may.
4. Monitorizar si GSC detecta LinkedIn como referrer de la URL test en los proximos dias. Reddit sigue sin links hasta confirmar `total_karma >=50`.

## Proxima accion (despues de Sab 30 may 2026)

Update 2026-06-01 tarde — Recovery v2 Dia 0 implementado:

- Implementado bloque trust site-level del Plan Recovery v2.
- Nuevas paginas indexables:
  - `/metodologia-editorial/`
  - `/como-probamos-productos/`
- `/sobre-mi/` reforzada con:
  - nombre completo David Rubio Mota;
  - limites claros: no medico/fisio/PRL;
  - enlaces a metodologia editorial y pruebas de productos;
  - claims personales suavizados;
  - email plano eliminado de esta pagina;
  - enlaces finales a URLs concretas en vez de categorias.
- Footer actualizado:
  - enlaces globales a las dos paginas de metodologia desde todo el sitio;
  - disclosure afiliado mas claro: no se aceptan pagos por posicionar productos.
- URL test `/guias/ergonomia-teletrabajo-postura-correcta/` enlaza ahora a metodologia editorial y como probamos productos, sin CTAs afiliados nuevos y sin `actualizadoEn`.
- SEO engine changelog actualizado.
- Build OK: `npm run build`, 49 paginas; sitemap incluye `/metodologia-editorial/` y `/como-probamos-productos/`; CSP hashes regenerados sin cambio pendiente en `public/_headers`.

Proximos pasos:
1. Deploy/push de estos cambios.
2. Tras deploy, solicitar indexacion manual solo de:
   - `https://tuespaciodetrabajo.com/metodologia-editorial/`
   - `https://tuespaciodetrabajo.com/como-probamos-productos/`
   - `https://tuespaciodetrabajo.com/sobre-mi/`
   - `https://tuespaciodetrabajo.com/guias/ergonomia-teletrabajo-postura-correcta/`
3. Siguiente bloque recomendado: mejora profunda de la URL test o primer enlace externo crawlable en espanol (LinkedIn/Quora ES), no articulos nuevos.

Update 2026-06-01:

- Hoy tocaria calendario `teletrabajo-con-ninos-en-casa`, pero la pausa editorial sigue vigente: no publicar articulos nuevos hasta que al menos 3 URLs prioritarias esten indexadas.
- GSC Search Analytics `2026-05-14` -> `2026-05-31`: sin filas devueltas; blackout de rendimiento continua.
- GA4 `2026-05-14` -> `2026-05-31`: 10 sesiones, 6 filas, todas `Direct`; 0 `Organic Search`.
- GSC live:
  - `/` sigue `Enviada e indexada` y ya fue recrawleada el `2026-05-31T23:50:04Z` tras el bloque home->pillars.
  - `/accesorios/mejor-monitor-trabajar-desde-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-26T12:07:06Z`, referrer solo home.
  - `/guias/ergonomia-teletrabajo-postura-correcta/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T22:44:40Z`, referrer Quora detectado.
  - `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:10:44Z`.
  - `/escritorios/mejor-escritorio-elevable-electrico/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-04-20T19:33:50Z`.
  - `/guias/dolor-espalda-trabajar-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:12:45Z`.
- Lectura: Google ya vio la home actualizada, pero el bloque home->pillars no ha bastado por si solo para indexar internas. Refuerza que el foco operativo debe seguir en autoridad externa/warmup, no en mas publicaciones.
- Cloudflare Pages MCP/API consultado; sigue fallando con `Authentication error` (`10000`). No cambia diagnostico porque GSC confirma fetch correcto y recrawl mobile de la home.
- Decision: mantener pausa editorial; continuar Backlinks Tier 1 / Reddit warmup sin enlaces.

Proximos pasos:
1. No publicar `teletrabajo-con-ninos-en-casa` ni recuperar calendario hasta senal objetiva de indexacion.
2. No repetir solicitudes de indexacion de `/` ni de URLs recrawleadas sin cambios nuevos.
3. Ejecutar paquete Reddit sin link preparado en `project_backlinks_session_state.md`; seguir sin links hasta confirmar `total_karma >=50`.

Update 2026-05-31:

- GSC Search Analytics `2026-05-14` -> `2026-05-30`: sin filas devueltas; el blackout de rendimiento continua.
- GA4 `2026-05-14` -> `2026-05-30`: 10 sesiones, 7 usuarios activos, 5 engaged sessions, todas `Direct`; 0 `Organic Search`.
- GSC live:
  - `/` sigue `Enviada e indexada`, ultimo rastreo `2026-05-21T11:33:02Z`; no hay recrawl posterior al bloque home->pillars ni a la solicitud manual del 25 may.
  - `/accesorios/mejor-monitor-trabajar-desde-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-26T12:07:06Z`.
  - `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:10:44Z`.
  - `/guias/ergonomia-teletrabajo-postura-correcta/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T22:44:40Z`, referrer externo Quora detectado.
  - `/ambiente/mejor-lampara-escritorio-led/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T12:56:27Z`.
  - `/guias/dolor-espalda-trabajar-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:12:45Z`.
  - `/escritorios/mejor-escritorio-elevable-electrico/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-04-20T19:33:50Z`.
- Decision: mantener pausa editorial. No publicar articulos nuevos ni repetir solicitudes de indexacion sin cambios. Foco de hoy: Reddit/backlinks sin enlaces y seguimiento de replies.

Proximos pasos:
1. No publicar `mejores-auriculares-cancelacion-ruido-trabajar` ni avanzar calendario hasta que al menos 3 URLs prioritarias esten indexadas.
2. No repetir indexacion manual de `/`, monitor o silla sin cambios nuevos.
3. Continuar Backlinks Tier 1 / Reddit warmup sin enlaces mientras no se confirme karma >=50.

Update 2026-05-30:

- GSC Search Analytics `2026-05-14` -> `2026-05-29`: sin filas devueltas; el blackout de rendimiento continua.
- GA4 `2026-05-14` -> `2026-05-29`: 10 sesiones, 7 usuarios, 5 engaged sessions, todas `Direct`; 0 `Organic Search`.
- GSC live:
  - `/` sigue `Enviada e indexada`, ultimo rastreo `2026-05-21T11:33:02Z`; la solicitud del 25 may aun no se refleja como recrawl posterior al bloque home->pillars.
  - `/accesorios/mejor-monitor-trabajar-desde-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-26T12:07:06Z`, fetch/robots/canonical correctos, referrer solo home.
  - `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:10:44Z`.
  - `/guias/ergonomia-teletrabajo-postura-correcta/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T22:44:40Z`; Google detecta referrer externo de Quora, pero aun no indexa.
  - `/ambiente/mejor-lampara-escritorio-led/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-25T12:56:27Z`.
  - `/guias/dolor-espalda-trabajar-casa/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-05-13T09:12:45Z`.
  - `/escritorios/mejor-escritorio-elevable-electrico/` sigue `Rastreada: actualmente sin indexar`, ultimo rastreo `2026-04-20T19:33:50Z`.
- Cloudflare Pages MCP/API consultado; sigue fallando con `Authentication error` (`10000`). No cambia el diagnostico porque GSC confirma fetch correcto.
- Decision: mantener pausa editorial. No publicar articulos nuevos ni repetir solicitudes de indexacion sin cambios. Foco de hoy: backlinks/warmup Reddit sin enlaces y observacion.

Proximos pasos:
1. No publicar `mejores-auriculares-cancelacion-ruido-trabajar` ni avanzar calendario hasta que al menos 3 URLs prioritarias esten indexadas.
2. No repetir indexacion manual de `/`, monitor o silla sin cambios nuevos.
3. Continuar Backlinks Tier 1 / Reddit warmup sin enlaces mientras no se confirme karma >=50.

## Próxima acción (después de Mié 27 may 2026)

Update 2026-05-28:

- GSC live: `/` sigue `Enviada e indexada`, último rastreo aún `2026-05-21T11:33:02Z`; la solicitud manual del 25 may todavía no se refleja como recrawl posterior al bloque home→pillars.
- GSC live: `/accesorios/mejor-monitor-trabajar-desde-casa/` sigue `Rastreada: actualmente sin indexar`, último rastreo `2026-05-26T12:07:06Z`, fetch/robots/canonical correctos, referrer detectado solo home.
- GSC live: `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue `Rastreada: actualmente sin indexar`, último rastreo `2026-05-13T09:10:44Z`, fetch/robots/canonical correctos, referrer detectado solo home.
- Search Analytics `2026-05-14`→`2026-05-27`: sin filas devueltas; el blackout continúa.
- GA4 `2026-05-14`→`2026-05-27`: 10 sesiones, todas `Direct`; 0 sesiones `Organic Search`.
- Cloudflare Pages MCP consultado; sigue fallando con `Authentication error` (`10000`). No bloquea la decisión porque GSC confirma rastreo correcto.
- Decisión: mantener pausa editorial; no publicar artículos nuevos ni repetir solicitudes de indexación sin cambios. Foco operativo del día: backlinks/warmup Reddit sin enlaces.

Próximos pasos:
1. No repetir solicitud de `/` ni de monitor/silla sin cambios.
2. Mantener artículos nuevos pausados; reactivar calendario solo si al menos 3 URLs prioritarias aparecen indexadas.
3. Continuar Backlinks Tier 1 / Reddit warmup sin enlaces mientras karma sea inferior a 50.

Update 2026-05-27:

- GSC live: `/` sigue `Enviada e indexada`, con último rastreo todavía en `2026-05-21T11:33:02Z`; la solicitud del 25 may no se refleja aún en un recrawl posterior al bloque home→pillars.
- GSC live: `/accesorios/mejor-monitor-trabajar-desde-casa/` **sí fue recrawleada** el `2026-05-26T12:07:06Z`, después del deploy del contenido revisado, pero permanece `Rastreada: actualmente sin indexar`. La solicitud manual también se realizó el 26 may, sin atribuirla como causa del recrawl porque no consta su hora exacta. `robotsTxtState`, fetch y canonical siguen correctos; el único referrer detectado es la home.
- Search Analytics `2026-05-14`→`2026-05-26`: solo 2 impresiones, ambas del 14 may (`/` y `/guias/ergonomia-teletrabajo-postura-correcta/`); sin filas posteriores. El blackout continúa.
- GA4 `2026-05-14`→`2026-05-26`: 9 sesiones, 6 usuarios activos y 5 sesiones con interacción, todas `Direct`; ninguna señal de `Organic Search`.
- Cloudflare Pages MCP consultado para confirmar deploy, pero la API respondió `Authentication error` (`10000`). No invalida el resultado de GSC: Google ya pudo rastrear el HTML actualizado del monitor.
- Decisión: el recrawl del monitor sin indexación refuerza que no procede publicar artículos nuevos ni solicitar indexación otra vez sin cambios; se mantiene el foco diario en backlinks/warmup y medición.

Próximos pasos:
1. No repetir solicitudes de `/` ni del monitor sin cambios nuevos. Volver a medir home/monitor el 28-29 may o en el control completo del domingo 31 may.
2. Mantener artículos nuevos pausados; reactivar calendario solo si al menos 3 URLs prioritarias aparecen indexadas.
3. Continuar Backlinks Tier 1 / Reddit warmup sin enlaces mientras karma sea inferior a 50.

## Próxima acción (después de Mar 26 may 2026)

Update 2026-05-26:

- GSC live: `/` sigue `Enviada e indexada`, pero su último rastreo continúa en `2026-05-21T11:33:02Z`; todavía no hay recrawl posterior al bloque home→pillars del 24 may ni a la solicitud manual del 25 may.
- `/accesorios/mejor-monitor-trabajar-desde-casa/` sigue `Rastreada: actualmente sin indexar` (último rastreo `2026-05-13T09:10:44Z`, canonical/fetch/robots correctos). `/guias/dolor-espalda-trabajar-casa/` está igual, con último rastreo `2026-05-13T09:12:45Z`.
- Search Analytics 14-25 may no devuelve filas: el blackout de impresiones continúa. GA4 14-25 may solo registra sesiones Direct; ninguna señal de Organic Search.
- Se eligió una única URL para mejora editorial: `/accesorios/mejor-monitor-trabajar-desde-casa/`, por ser P0 comercial y haber tenido impresiones históricas.
- Mejora aplicada: se retira el reclamo inexacto “6 probados”, se explicita qué modelos se han probado, se incorpora tabla de decisión y escenarios donde no comprar, y se corrigen afirmaciones personales/posturales y la distinción IPS/VA.
- Auditoría Amazon previa detectó `LG 34WR55QK-B` (`B0DGLR66J6`) no disponible. Sustituido por `AOC CU34V5C` (`B0B5PL93XQ`, 273,55 EUR, en stock, USB-C 65 W); cache y `PRODUCTOS.md` actualizados. Reauditoría posterior: 6 ASINs, 0 incidencias.
- `actualizadoEn: 2026-05-26` añadido por revisión real. Densidad afiliada: 13 enlaces `/dp/` sobre ~3926 palabras, aproximadamente 3,31/1000w.
- Build OK: `npm run build`, 47 páginas, hashes CSP regenerados.
- Deploy confirmado: commit `dfcb21e` subido a `origin/main`; HTML live ya sirve `AOC CU34V5C` y la tabla `Decisión rápida`, sin el reclamo `6 probados`.
- Solicitud manual de indexación en GSC para `https://tuespaciodetrabajo.com/accesorios/mejor-monitor-trabajar-desde-casa/` completada por el usuario el 26 may tras el deploy. No repetir sin cambios nuevos.

Próximos pasos:
1. No repetir solicitudes de la home ni del monitor sin cambios nuevos; revisar si cambia `lastCrawlTime` entre el 27 y el 28 may.
2. Mantener artículos nuevos pausados; revisar GSC/GA4 el domingo 31 may y reactivar calendario solo si al menos 3 URLs prioritarias aparecen indexadas.
3. Continuar Backlinks Tier 1 / Reddit warmup sin enlaces mientras karma sea inferior a 50.

## Próxima acción (después de Dom 24 may 2026)

Update 2026-05-25:

- La auditoría `seo-indexing-audit/audit-2026-05-24.md` prevalece sobre el calendario anterior: **NO publicar** `mejores-auriculares-cancelacion-ruido-trabajar` ni otro artículo nuevo hasta que al menos 3 URLs prioritarias estén indexadas.
- Evidencia audit: home indexada; internas rastreables pero `Rastreada: actualmente sin indexar`; 0 impresiones desde el 14 may; mejoras editoriales ya recrawled sin conseguir indexación.
- P0 técnico de la auditoría ya se ejecutó el domingo 24 may: `1a0c2f8 fix(seo): add pillar comparativas block to home`, con enlaces directos desde `/` a 8 comparativas prioritarias. Commit incluido en `origin/main`.
- Revisión live 25 may: `/` permanece `Enviada e indexada` (último rastreo 21 may); `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue `Rastreada: actualmente sin indexar` (último rastreo 13 may).
- Solicitud manual de reindexación de `https://tuespaciodetrabajo.com/` completada por el usuario el 25 may tras el deploy del bloque de comparativas. No repetir sin cambios nuevos; revisar `lastCrawlTime` en 24-72h.
- Reddit 24 may: 3 comentarios sin link publicados; karma registrado=15. Mantener 0 links en Reddit hasta karma >=50.

Próximos pasos:
1. Continuar Backlinks Tier 1: warmup Reddit sin enlaces; Quora solo ante preguntas nuevas y claramente pertinentes, porque las 10 respuestas del paquete existente ya están publicadas.
2. Mar-Mié 26-27 may: comprobar si la home ha sido recrawled y aplicar solo una mejora editorial a `/accesorios/mejor-monitor-trabajar-desde-casa/` o `/guias/dolor-espalda-trabajar-casa/`, según GSC del día.
3. Revisar GSC/GA4 el domingo 31 may; no reactivar calendario sin cambio objetivo de indexación.

## Próxima acción (después de Vie 22 may 2026)

Update 2026-05-22:

- Mejora editorial aplicada a `/sillas/mejor-silla-ergonomica-calidad-precio/`:
  - Añadida tabla de decisión rápida por perfil de comprador antes de la ComparisonTable.
  - Añadida sección "Cuándo NO comprar una silla de esta lista" (peso >100kg, <3h/día, altura <1.55m, dolor lumbar diagnosticado, uso lounge).
  - Añadido `actualizadoEn: 2026-05-22`.
  - Densidad afiliada sin cambios (5 AffiliateButton + 1 TopPick + 6 ComparisonTable = 12 enlaces / ~4000w ≈ 3/1000w).
  - Build OK, commit 04b9226, push OK.
- GSC re-inspección confirmada: `/sillas/mejor-silla-ergonomica-calidad-precio/` sigue "Rastreada - actualmente sin indexar", canonical correcta, fetch OK, robots permitido.
- Solicitar indexación manual en GSC para esta URL tras deploy.
- Reddit karma: 15 (link=1, comment=14). Seguir sin links hasta ≥50.
- 3 comentarios Reddit preparados para publicación manual:
  1. r/Ergonomics 1tkili1 → neck pain long-term fix (0 comments, first responder)
  2. r/OfficeChairs 1tkagyt → completely lost, 1.90m dev, chair advice
  3. r/Ergonomics 1tj2kbk → budget mesh chairs (ASTRIDE, Sweetcrispy, etc.)

Próximos pasos:
1. **Lun 25 may**: próximo artículo del calendario `mejores-auriculares-cancelacion-ruido-trabajar`. NO adelantar.
2. Esperar 3-7 días antes de otra mejora editorial en masa. Revisar GSC para ver si las URLs mejoradas empiezan a indexarse.
3. Seguir Reddit warmup: 1-2 comentarios/día sin link hasta karma ≥50.
4. Si toca mejora editorial el próximo día sin artículo: elegir entre `/accesorios/mejor-monitor-trabajar-desde-casa/` o `/guias/dolor-espalda-trabajar-casa/`.

Update 2026-05-21:

- Mejora editorial aplicada a `/ambiente/mejor-lampara-escritorio-led/`:
  - Añadida metodología visible antes de la ComparisonTable: experiencia directa (BenQ Halo propia + Xiaomi de mi mujer), análisis por fichas de SLATOR/Aigostar/Hokone/EYOCEAN, criterios de selección, límites.
  - Añadida tabla de decisión rápida por tipo de comprador.
  - Añadido `actualizadoEn: 2026-05-21`.
  - Densidad afiliada: 13 enlaces / ~4540w = 2.86/1000w.
  - Build OK, commit e06038c.
- GSC re-rastreo confirmado: `/sillas/mejor-silla-oficina-menos-200-euros/` rastreada 20 may, `/escritorios/ikea-bekant-vs-flexispot-e7/` rastreada 19 may. Google está revisitando activamente.
- Todas las URLs clave siguen "Rastreada - sin indexar" (canonical correcta, fetch OK, robots permitido).
- Reddit karma: 13 (link=1, comment=12). Seguir sin links hasta ≥50.
- 2 comentarios Reddit preparados (1tjh8ps neck/back pain, 1tiny0l wrist pain).

Próximos pasos:
1. **Deploy + solicitar inspección manual** solo para `https://tuespaciodetrabajo.com/ambiente/mejor-lampara-escritorio-led/`.
2. **Lun 25 may**: próximo artículo del calendario `mejores-auriculares-cancelacion-ruido-trabajar`. NO adelantar.
3. Esperar 3-7 días antes de otra mejora editorial en masa. Revisar GSC para ver si las URLs ya mejoradas empiezan a indexarse.
4. Seguir Reddit warmup: 1-2 comentarios/día sin link hasta karma ≥50.

## Update 2026-05-20

- GSC revisado antes de tocar contenido:
  - 2026-05-06→2026-05-19: 1 impresión total (`postura teletrabajo`, `/guias/ergonomia-teletrabajo-postura-correcta/`, posición 88, 2026-05-13).
  - `/ambiente/mejor-lampara-escritorio-led/`: `Rastreada: actualmente sin indexar`, canonical correcta, robots permitido, fetch OK, último rastreo 2026-05-13.
  - `/sillas/mejor-silla-oficina-menos-200-euros/`: `Google no reconoce esta URL`.
- GA4 2026-05-06→2026-05-19: 10 filas, 0 tráfico relevante para la URL de silla barata.
- Mejora editorial aplicada a `/sillas/mejor-silla-oficina-menos-200-euros/`:
  - Añadida metodología visible antes de la tabla: criterios de selección, límites del rango <200 EUR, experiencia directa vs análisis por fichas/reseñas, y casos donde no conviene comprar una silla barata.
  - Añadido `actualizadoEn: 2026-05-20` por revisión real.
  - Corregida coherencia persona: despacho `8 m²` → `9 m²` en Rubí.
- Próximo paso tras deploy: solicitar inspección/indexación manual solo para `https://tuespaciodetrabajo.com/sillas/mejor-silla-oficina-menos-200-euros/`.
- Mantener regla: no repetir este patrón en masa; esperar 3-7 días antes de escalar a más URLs.

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
- Deploy confirmado por el usuario y solicitud manual de indexación enviada en GSC para `https://tuespaciodetrabajo.com/escritorios/ikea-bekant-vs-flexispot-e7/`.

Próximo día de trabajo recomendado:

1. Hacer backlinks Tier 1 según `project_backlinks_session_state.md` (Reddit warmup sin links hasta karma >=50).
2. Revisar en 3-7 días el estado GSC de `/escritorios/ikea-bekant-vs-flexispot-e7/` tras la solicitud manual. No repetir solicitud si no hay cambios nuevos.
3. Elegir 1 URL prioritaria y mejorarla con commit separado. Siguiente recomendada: `/ambiente/mejor-lampara-escritorio-led/` o `/sillas/mejor-silla-oficina-menos-200-euros/` según GSC del día.
4. Si se trabaja una URL, aplicar patrón: metodología visible, menos afiliación redundante si existe, experiencia concreta, sección útil tipo checklist/casos donde NO comprar, enlaces internos a artículos concretos.
5. No pedir indexación masiva; pedir solo para URL mejorada tras deploy.

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
