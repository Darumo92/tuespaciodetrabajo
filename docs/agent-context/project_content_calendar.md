---
name: Calendario de publicación Recovery
description: Mapa fecha→artículo POST-recovery (cadencia rebajada por flag indexación). Reemplaza Plan v2. Cuando el usuario diga "vamos con el de hoy", consultar esta tabla y docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## ⚠️ Cambio importante 2026-05-06

Plan v2 (`docs/PLAN_v2_2026-04-12.md`) **DEPRECADO** desde semanas posteriores al 6 may. Cadencia 3/sem causó flag HCU + colapso indexación (20 → 2 indexadas). Nuevo plan: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md`.

## Cadencia escalonada

| Fase | Periodo | Cadencia |
|---|---|---|
| Recovery | 06 may → 02 jun | 1/semana (lunes) |
| Estabilización | 03 jun → 30 jun | 2/semana (lun + jue) |
| Crecimiento | 01 jul → 31 jul | 2-3/semana |
| Velocidad | 01 ago → | 3/semana sostenido |

**Subir de fase solo si GSC muestra recovery** (impresiones >0 sostenidas, indexadas creciendo).

## Calendario reordenado (priorizando estacionales)

### Mayo — Recovery (1/semana)

| # | Lun | Slug | Tipo | Cluster | Razón orden |
|---|---|---|---|---|---|
| 29 | 11 may | trabajar-desde-casa-calor | Info | ambiente | ESTACIONAL pico jun-ago |
| 30 | 18 may | mejor-ventilador-silencioso-oficina | Comp | ambiente | ✅ publicado. ESTACIONAL acompaña #29 |
| 31 | 25 may | mejores-auriculares-cancelacion-ruido-trabajar | Comp PILLAR | audio-video | Pillar cluster nuevo |
| 32 | 01 jun | teletrabajo-con-ninos-en-casa | Info | productividad | ESTACIONAL fin curso 20-23 jun |

### Junio — Estabilización (2/semana lun+jue)

| # | Día | Slug | Tipo | Cluster |
|---|---|---|---|---|
| 33 | Jue 04 jun | mejor-webcam-videollamadas | Comp | audio-video |
| 34 | Lun 08 jun | amazon-prime-day-2026-mejores-ofertas | Actualidad | hub-central |
| 35 | Jue 11 jun | mejor-microfono-videollamadas | Comp | audio-video |
| 36 | Lun 15 jun | mejor-escritorio-2-monitores | Comp | escritorios |
| 37 | Jue 18 jun | mejor-reposamunecas-teclado-raton | Comp | perifericos |
| 38 | Lun 22 jun | mejor-escritorio-esquinero-piso-pequeno | Comp | escritorios |
| 39 | Jue 25 jun | mejor-soporte-portatil-escritorio | Comp | perifericos |
| 40 | Lun 29 jun | mejor-hub-usbc-portatil | Comp | perifericos |

### Julio — Crecimiento (2-3/semana)

| # | Día | Slug | Tipo | Cluster |
|---|---|---|---|---|
| 41 | Jue 02 jul | mejor-silla-personas-altas | Comp | sillas |
| 42 | Lun 06 jul | mejor-silla-dolor-espalda | Comp | sillas |
| 43 | Jue 09 jul | mejor-alfombrilla-xxl | Comp | perifericos |
| 44 | Lun 13 jul | mejorar-imagen-videollamadas | Info | audio-video |
| 45 | Jue 16 jul | mejores-accesorios-home-office-amazon | HUB | hub-central |
| 46 | Lun 20 jul | plantas-interior-oficina-casa | Info | ambiente |
| 47 | Jue 23 jul | mejor-teclado-mecanico-silencioso | Comp | perifericos |
| 48 | Lun 27 jul | mejor-reposapies-oficina | Comp | perifericos |
| 49 | Jue 30 jul | rutina-trabajo-productiva-casa | Info | productividad |

### Agosto — Velocidad (3/semana)

| # | Día | Slug | Tipo | Cluster |
|---|---|---|---|---|
| 50 | Lun 03 ago | pausas-activas-teletrabajo | Info | productividad |
| 51 | Jue 06 ago | ergonomia-casa-guia-definitiva | HUB | hub-central |
| 52 | Lun 10 ago | evitar-distracciones-trabajando-casa | Info | productividad |
| 53 | Jue 13 ago | home-office-programadores-setup | Info | productividad |
| 54 | Lun 17 ago | decorar-home-office-poco-presupuesto | Info | ambiente |
| 55 | Jue 20 ago | vuelta-oficina-vs-teletrabajo-hibrido | Info | productividad |
| 56 | Lun 24 ago | mejores-apps-productividad-teletrabajadores | Actualidad | productividad |

**Cierre Phase 1 estimado: 24 ago 2026** (vs 1 jul original).

## Reglas operativas

- Día preferido: **lunes**. Secundario: **jueves** (fase 2+).
- Nunca dos días seguidos.
- Nunca fin de semana.
- `fecha:` frontmatter = fecha real del commit. Verificar pre-publicación.
- Densidad afiliada ≤5 affiliates/1000w en comparativas.
- Si "vamos con el de hoy": buscar fecha en tabla → leer `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md` para detalles → seguir SEO engine workflow de `docs/agent-context/reference_seo_workflows.md`.
- Si el día no tiene artículo: hacer **backlinks Tier 1 + una mejora SEO editorial pequeña** de una URL prioritaria, o mantenimiento — NO adelantar siguiente artículo.

## Plan diario añadido 2026-05-19

Además de backlinks y de los artículos nuevos cuando toque calendario:

- Cada día de trabajo SEO elegir **máximo 1 URL prioritaria** en `Rastreada: actualmente sin indexar` y aplicar una mejora editorial concreta.
- Trabajar en **tandas pequeñas**: 1 URL por día normal; máximo 2-3 URLs por tanda si son cambios muy mecánicos y de bajo riesgo.
- No hacer reescrituras masivas de 10-15 artículos en una misma sesión. Si todo cambia a la vez, no se podrá atribuir qué ayudó a indexar.
- Después de cada URL mejorada: build, commit separado y anotar qué cambió.
- Solicitar indexación manual solo para URLs con mejora sustancial, no en masa.
- Esperar 3-7 días para observar GSC antes de repetir el mismo patrón en muchas URLs.

### Errores detectados en la creación de artículos que NO debemos repetir

- Publicar demasiado rápido en un sitio nuevo: la cadencia alta de abril pareció señal de contenido generado en masa.
- Comparativas demasiado afiliadas: muchas llamadas a Amazon y poca utilidad previa a la tabla.
- Fechas incoherentes o antedatadas: `fecha` debe ser siempre la fecha real del commit.
- Poca diferenciación entre artículos: intros, estructura y pros/contras demasiado parecidos.
- Experiencia personal insuficiente o genérica: cada artículo debe incluir señales concretas, coherentes con David Rubio y su setup.
- Falta de metodología visible: explicar qué se ha probado, qué no, qué fuentes se han usado y cómo se decidió.
- Recomendaciones sin contexto de usuario: cada producto debe decir para quién sí y para quién no.
- Enlaces internos débiles: enlazar a artículos concretos relacionados, no a categorías sueltas.
- Precios y disponibilidad tratados como fijos: usar precios orientativos, verificar Amazon y no prometer importes exactos.
- URLs Amazon directas en Markdown o con `?tag=` manual: usar `AffiliateButton`, `TopPick` o `ComparisonTable` con `/dp/ASIN`.
