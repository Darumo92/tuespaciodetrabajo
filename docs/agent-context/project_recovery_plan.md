---
name: Plan Recovery Indexación activo
description: Estado del plan recovery tras colapso indexación 2026-05-06. Causas, acciones aplicadas, bloques pendientes. Cuando el usuario pregunte por SEO/indexación/GSC, consultar primero este memo y docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## Diagnóstico (2026-05-06)

Site colapsó: 20 indexadas (08 abr) → 2 indexadas (01 may). 17 URLs en "Rastreada-no-indexada" GSC. Impresiones 0 desde 15 abr.

**Causas (ranked por impacto):**

1. Cadencia AI-spam: 28 artículos en 33 días = 0.85/día en sitio nuevo
2. Backdating fechas: 22/28 artículos (79%) con `fecha:` inconsistente; 6 antedataban a antes del initial commit (24 mar)
3. Densidad afiliada >6/1000w en top 3 comparativas (ratón vertical, lámpara LED, teclado)
4. Cero backlinks externos
5. Pausa freshness 10 días (26 abr → 06 may)

**Lo que NO es causa:** sitemap (OK), schema (OK), performance (TTFB 70-150ms), render (SSR completo), headers, robots/redirects/noindex (todos intencionados).

## Acciones aplicadas

- [x] **2026-05-06 commit fa30f13** — Fix 23 fechas frontmatter alineadas con primer commit. Push #1 disparó re-deploy + IndexNow.

## Bloques pendientes (paralelos)

### Bloque A — Cadencia escalonada
Calendario nuevo en `project_content_calendar.md`. Recovery 1/sem hasta 02 jun.

### Bloque B — Diluir densidad afiliada (urgente, sem 1-2)
Refactor para bajar a ≤5 affiliates/1000w:
- mejor-raton-vertical-ergonomico (actual 7.40)
- mejor-lampara-escritorio-led (actual 6.29)
- mejor-teclado-ergonomico (actual 6.19)

Acción: añadir 600-800w guía compra/ergonomía pre-tabla; quitar 2-3 botones intermedios redundantes.

### Bloque C — Backlinks Tier 1
Continuar plan en `docs/PLAN_BACKLINKS_TIER1.md`. Estado: about.me ✅, Dev.to ✅, pendiente 5 respuestas Quora Bloque B (sesión 2026-04-29 a medias). Mínimo 2 sesiones/semana durante recovery.

### Bloque D — GSC indexación manual (post-deploy +24h)
✅ Completado 2026-05-13. Usuario confirmó solicitud manual de indexación en GSC para las 8 URLs prioritarias, después de aplicar Bloque B en las 3 piezas afectadas.

URLs solicitadas: silla-calidad-precio, monitor, escritorio-elevable, ergonomia-postura, dolor-espalda, lámpara LED, raton-vertical, teclado-ergonomico.

### Bloque E — No tocar
Sitemap, robots.txt, _redirects, schema, headers, CSP. No añadir actualizadoEn en bulk.

## Métricas de seguimiento

| Métrica | Actual (06 may) | Meta 02 jun | Meta 30 jun |
|---|---|---|---|
| Indexadas | 2 | 10+ | 20+ |
| Crawled-not-indexed | 17 | <10 | <5 |
| Impresiones diarias | 0 | >5 | >50 |
| Backlinks | 2 | 8+ | 15+ |

**Si al 02 jun no hay mejora:** investigar URL por URL crawled-not-indexed.
**Si al 30 jun sigue mal:** considerar reset selectivo (despublicar 5-8 piezas débiles).

## Reglas críticas

- Cadencia: 1/sem hasta 02 jun. Nunca dos días seguidos. Nunca fin de semana.
- `fecha:` frontmatter siempre = fecha real del commit del día.
- Densidad afiliada ≤5/1000w en comparativas nuevas.
- No solicitar indexación masiva en GSC sin haber refactorizado primero.
- Subir cadencia solo si hay señales de recovery.
