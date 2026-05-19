# Google Search Console - Evidencia disponible

## Datos persistidos de GSC

| Dato | Evidencia |
|---|---|
| Indexadas bajan de 20 a 2 | `docs/agent-context/project_recovery_plan.md:9`, `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:4` |
| Fecha aproximada del colapso | 20 indexadas el 08 abr -> 2 indexadas el 01 may, impresiones 0 desde 15 abr (`project_recovery_plan.md:9`, `PLAN_RECOVERY_INDEXACION_2026-05-06.md:189-194`) |
| 17 URLs en `Rastreada, actualmente no indexada` | `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:22` |
| Buckets adicionales: redirects, robots, noindex | `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:41` registra redirects 13, robots 11, noindex 9 como ruido intencionado |
| Sitemap leido por GSC, pero desactualizado en descarga | `project_recovery_session_state.md:16`: `sitemap-index.xml` ultima descarga 2026-04-27 y `sitemap-0.xml` 2026-04-26, live con `lastmod` 2026-05-19 |
| Reenvio sitemap por MCP/API fallo | `project_recovery_session_state.md:17`: 403 Insufficient Permission |
| Inspeccion URL nueva #30 | `project_recovery_session_state.md:13`: GSC dice `Google no reconoce esta URL` para `/ambiente/mejor-ventilador-silencioso-oficina/` aunque publica y en sitemap |
| Senal de recuperacion minima | `project_recovery_session_state.md:18`: 1 impresion visible del 2026-05-13 para `/guias/ergonomia-teletrabajo-postura-correcta/`, query `postura teletrabajo`, posicion 88 |
| Solicitud manual top 8 | `project_recovery_plan.md:41-44`, `project_recovery_session_state.md:73-84` |

## GSC Evidence Matrix

| URL | Tipo | Estado GSC disponible | Ultimo rastreo | Canonical declarada | Canonical Google | En sitemap | Bloqueada | Noindex | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| `https://tuespaciodetrabajo.com/` | Home | Indexada probable, una de las pocas mantenidas | No disponible live | Self en HTTP | No disponible | Si | No | No | Recovery plan indica solo home/resto casi fuera |
| `/sillas/mejor-silla-ergonomica-calidad-precio/` | Comparativa | Solicitada manualmente top 8 | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:77` |
| `/accesorios/mejor-monitor-trabajar-desde-casa/` | Comparativa | Solicitada manualmente top 8 | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:78` |
| `/escritorios/mejor-escritorio-elevable-electrico/` | Comparativa | Solicitada manualmente top 8 | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:79` |
| `/guias/ergonomia-teletrabajo-postura-correcta/` | Guia | Solicitada manualmente; 1 impresion 2026-05-13 | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:80`, `:18` |
| `/guias/dolor-espalda-trabajar-casa/` | Guia | Solicitada manualmente top 8 | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:81` |
| `/ambiente/mejor-lampara-escritorio-led/` | Comparativa afiliada | Solicitada manualmente top 8 post-refactor | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:82` |
| `/accesorios/mejor-raton-vertical-ergonomico/` | Comparativa afiliada | Solicitada manualmente top 8 post-refactor | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:83` |
| `/accesorios/mejor-teclado-ergonomico/` | Comparativa afiliada | Solicitada manualmente top 8 post-refactor | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:84` |
| `/ambiente/mejor-ventilador-silencioso-oficina/` | Comparativa nueva | `Google no reconoce esta URL` | No disponible live | Self confirmado por HTTP | No disponible | Si | No | No | `project_recovery_session_state.md:13-15` |

## Datos que faltan monitorizar en GSC

- Acciones manuales.
- Problemas de seguridad.
- Cobertura exacta por bucket actual.
- URLs con `Descubierta, actualmente sin indexar`.
- URLs con `Rastreada, actualmente sin indexar` actuales.
- URLs con canonical alternativa o Google canonical distinta.
- Consultas y paginas con mayor perdida.

## Hipotesis GSC basada en datos disponibles

El patron `Rastreada, actualmente sin indexar` indica que Google puede acceder a las paginas, pero decide no incluirlas. Esto es mas compatible con evaluacion de calidad/duplicacion/valor percibido o baja autoridad que con robots, noindex, canonical global o bloqueo Cloudflare.

## Actualizacion GSC live 2026-05-19

Propiedad consultada: `sc-domain:tuespaciodetrabajo.com`, permiso `siteOwner`.

Sitemap live:

| Sitemap | Last submitted | Last downloaded | Errores | Warnings |
|---|---:|---:|---:|---:|
| `https://tuespaciodetrabajo.com/sitemap-index.xml` | 2026-05-19T09:41:45Z | 2026-05-19T09:41:46Z | 0 | 0 |

Search Analytics live:

| Periodo | Clics | Impresiones | Lectura |
|---|---:|---:|---|
| 2026-03-24 a 2026-04-14 | 8 | 913 | Visibilidad inicial en multiples internas |
| 2026-04-15 a 2026-05-19 | 2 | 27 | Caida casi total tras 15 abr |

URL Inspection live:

| URL | Estado GSC | Ultimo rastreo | Indexing | Robots | Fetch | Canonical Google |
|---|---|---:|---|---|---|---|
| `/` | Enviada e indexada | 2026-05-16T06:36:54Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/sillas/mejor-silla-ergonomica-calidad-precio/` | Rastreada: actualmente sin indexar | 2026-05-13T09:10:44Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/accesorios/mejor-monitor-trabajar-desde-casa/` | Rastreada: actualmente sin indexar | 2026-05-13T09:10:44Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/escritorios/mejor-escritorio-elevable-electrico/` | Rastreada: actualmente sin indexar | 2026-04-20T19:33:50Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/guias/ergonomia-teletrabajo-postura-correcta/` | Rastreada: actualmente sin indexar | 2026-05-13T09:12:45Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/guias/dolor-espalda-trabajar-casa/` | Rastreada: actualmente sin indexar | 2026-05-13T09:12:45Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/ambiente/mejor-lampara-escritorio-led/` | Rastreada: actualmente sin indexar | 2026-05-13T09:14:47Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/accesorios/mejor-raton-vertical-ergonomico/` | Rastreada: actualmente sin indexar | 2026-05-13T09:14:47Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/accesorios/mejor-teclado-ergonomico/` | Rastreada: actualmente sin indexar | 2026-05-13T09:16:47Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/ambiente/mejor-ventilador-silencioso-oficina/` | Rastreada: actualmente sin indexar | 2026-05-19T10:01:13Z | INDEXING_ALLOWED | ALLOWED | SUCCESSFUL | Self |
| `/audio-video/` | Google no reconoce esta URL | - | UNSPECIFIED | UNSPECIFIED | UNSPECIFIED | - |
| `/ambiente/` | Google no reconoce esta URL | - | UNSPECIFIED | UNSPECIFIED | UNSPECIFIED | - |

La nueva URL de ventilador ya no esta en `Google no reconoce esta URL`: Google la rastreo el 2026-05-19 y la dejo tambien como `Rastreada: actualmente sin indexar`.
