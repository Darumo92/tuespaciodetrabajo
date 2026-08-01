# Plan Recovery Indexación — 2026-05-06

**Estado:** histórico. Conservado como evidencia del incidente de mayo; no ejecutar como calendario ni plan vigente.
**Causa raíz:** colapso indexación 20 → 2 páginas indexadas (08 abr → 01 may), 17 URLs en "Rastreada-no-indexada".

---

## 1. Diagnóstico forense

### Evidencia

- Initial commit dominio: **2026-03-24**
- 28 artículos publicados entre 24 mar y 26 abr → **0.85 artículos/día sostenido** durante 33 días.
- 22 de 28 artículos (79%) tenían `fecha:` frontmatter inconsistente con primer commit:
  - 6 antedataban a antes del 24 mar (dominio no existía).
  - 12 forward-dated o backdated por 1-14 días.
- Densidad afiliada en top 3 comparativas:
  - mejor-raton-vertical-ergonomico: 7.40 affiliates/1000w
  - mejor-lampara-escritorio-led: 6.29
  - mejor-teclado-ergonomico: 6.19
  - threshold informal HCU: 3-4/1000w
- GSC bucket "Rastreada, actualmente no indexada": 17 URLs (todas comerciales/comparativas).
- Cero backlinks externos.
- Pausa publicación 26 abr → 06 may = 10 días.

### Causas combinadas (ranked por impacto)

1. **Cadencia AI-spam pattern** en sitio nuevo (<6 meses) → SpamBrain/HCU flag.
2. **Backdating de fechas** (22 artículos, 79%) → freshness fraud signal.
3. **Densidad afiliada alta** en comerciales → thin-affiliate flag HCU.
4. **Cero autoridad externa** (sin backlinks) → sandbox sin validación.
5. **Pausa freshness** 10 días → señal de site abandonado.

### Lo que NO es problema

- Sitemap (lectura "Correcto" en GSC, contenido válido).
- Performance (TTFB 70-150ms).
- Render (SSR Astro completo, no JS-only).
- Schema (Article, Product, Review, FAQPage, Breadcrumb, Person+sameAs LinkedIn).
- Headers (CSP, robots, canonical).
- Buckets GSC ruido: redirects (13), robots.txt (11), noindex (9) — todos intencionados.

---

## 2. Acciones aplicadas

### 2026-05-06 — Push #1

**Commit `fa30f13`** — Fix 23 fechas frontmatter alineadas con primer commit.
- `fecha:` ahora coincide con `git log --diff-filter=A`.
- Sitemap `lastmod` global actualizado.
- Build OK 45 páginas.
- Push triggered Cloudflare Pages deploy + IndexNow ping.

---

## 3. Cadencia recovery (NUEVA)

### Antipatrón a evitar

- Burst después de silencio (re-trigger del mismo flag que causó deindexación).
- Volver a 3/semana antes de tener señales de recovery.

### Cadencia escalonada por fases

| Fase | Periodo | Cadencia | Artículos |
|---|---|---|---|
| **Recovery** | 06 may → 02 jun (4 sem) | **1/semana** | 4 |
| **Estabilización** | 03 jun → 30 jun (4 sem) | **2/semana** | 8 |
| **Crecimiento** | 01 jul → 31 jul (4 sem) | **2-3/semana** | 8-12 |
| **Velocidad** | 01 ago en adelante | **3/semana** sostenido | — |

**Condición para subir de fase:** GSC muestra recovery (impresiones diarias >0 sostenidas, indexadas >15) antes de pasar a la siguiente fase. Si no hay recovery, mantener fase actual +2 semanas.

### Reglas operativas

- Día publicación preferido: **lunes**. Secundario: **jueves** (fase 2+).
- **Nunca dos días seguidos** (fase 1 y 2).
- **Nunca fin de semana** (sin tráfico, desperdicia freshness).
- `fecha:` frontmatter = fecha real del commit. Verificación pre-publicación obligatoria.
- `actualizadoEn:` solo cuando hay actualización real (no en bulk, no como freshness spam).

---

## 4. Calendario reordenado (28 artículos pendientes)

Priorización: **estacionales primero** (ventana corta) > **pillares de cluster sin completar** > **comparativas evergreen** > **informativos evergreen**.

### Recovery — mayo

| # | Lun | Slug | Tipo | Cluster | Justificación orden |
|---|---|---|---|---|---|
| 29 | 11 may | trabajar-desde-casa-calor | Info | ambiente | ESTACIONAL — pico jun-ago, ventana cierra rápido |
| 30 | 18 may | mejor-ventilador-silencioso-oficina | Comp | ambiente | ESTACIONAL acompaña #29 |
| 31 | 25 may | mejores-auriculares-cancelacion-ruido-trabajar | Comp PILLAR | audio-video | Pillar cluster nuevo, semilla |
| 32 | 01 jun | teletrabajo-con-ninos-en-casa | Info | productividad | ESTACIONAL — fin curso 20-23 jun |

### Estabilización — junio (subir a 2/semana: lun + jue)

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

### Crecimiento — julio (subir a 2-3/semana)

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

### Velocidad — agosto (3/semana sostenido)

| # | Día | Slug | Tipo | Cluster |
|---|---|---|---|---|
| 50 | Lun 03 ago | pausas-activas-teletrabajo | Info | productividad |
| 51 | Jue 06 ago | ergonomia-casa-guia-definitiva | HUB | hub-central |
| 52 | Lun 10 ago | evitar-distracciones-trabajando-casa | Info | productividad |
| 53 | Jue 13 ago | home-office-programadores-setup | Info | productividad |
| 54 | Lun 17 ago | decorar-home-office-poco-presupuesto | Info | ambiente |
| 55 | Jue 20 ago | vuelta-oficina-vs-teletrabajo-hibrido | Info | productividad |
| 56 | Lun 24 ago | mejores-apps-productividad-teletrabajadores | Actualidad | productividad |

**Phase 1 cierre estimado: 24 ago 2026** (vs. 1 jul original = +8 semanas por recovery).

---

## 5. Acciones complementarias paralelas

### Bloque B — Diluir densidad afiliada (urgente, semanas 1-2)

Refactor 3 piezas con ratio >6 affiliates/1000w:

1. `mejor-raton-vertical-ergonomico` (7.40) → añadir 600-800w guía compra/ergonomía pre-tabla. Quitar 2-3 botones intermedios.
2. `mejor-lampara-escritorio-led` (6.29) → idem.
3. `mejor-teclado-ergonomico` (6.19) → idem.

**Objetivo: bajar a ≤5/1000w cada una.**

### Bloque C — Backlinks Tier 1 (paralelo)

Plan ya documentado en `docs/PLAN_BACKLINKS_TIER1.md` y `docs/SESION_*_BACKLINKS_PAQUETE.md`.
Estado actual (memoria):
- About.me ✅
- Dev.to ✅
- Pendiente: 5 respuestas Quora Bloque B (sesión 2026-04-29 quedó a medias).

Activar al menos 2 sesiones por semana durante recovery.

### Bloque D — GSC indexación manual (post-deploy)

Tras deploy del push #1 propagado (~24h), solicitar indexación manual GSC (Inspección URL → Solicitar indexación) para top 8:

1. /sillas/mejor-silla-ergonomica-calidad-precio/
2. /accesorios/mejor-monitor-trabajar-desde-casa/
3. /escritorios/mejor-escritorio-elevable-electrico/
4. /guias/ergonomia-teletrabajo-postura-correcta/
5. /guias/dolor-espalda-trabajar-casa/
6. /guias/altura-correcta-escritorio-silla/
7. /accesorios/mejor-raton-vertical-ergonomico/
8. /

**No hacer en bulk antes de Bloque B** — sería bandera roja repetir lo mismo sin cambios.

### Bloque E — No tocar

- Sitemap, robots.txt, _redirects.
- Schema, headers, CSP.
- Buckets ruido GSC (redirects/robots/noindex configurados a propósito).
- No añadir `actualizadoEn:` en bulk.

---

## 6. Métricas de seguimiento (revisar semanal)

| Métrica | Estado actual (06 may) | Objetivo recovery (02 jun) | Objetivo estabilización (30 jun) |
|---|---|---|---|
| Indexadas GSC | 2 | 10+ | 20+ |
| "Rastreada-no-indexada" | 17 | <10 | <5 |
| Impresiones diarias | 0 (15 abr→) | >5 sostenidas | >50 |
| Backlinks externos | 2 (about.me, dev.to) | 8+ | 15+ |
| Cadencia publicación | 0 últimos 10 días | 1/semana sostenido | 2/semana sostenido |

**Si al 02 jun no se ve mejora en indexadas:** investigar manualmente cada URL crawled-not-indexed (puede haber issue específico no detectado en este análisis).

**Si al 30 jun sigue mal:** considerar reset selectivo (despublicar 5-8 piezas más débiles, mejorar el resto al máximo, esperar 90 días).

---

## 7. Pre-publicación checklist (cada artículo)

Además del checklist estándar de `CLAUDE.md`:

- [ ] `fecha:` = fecha de hoy (no inventada para escalonar).
- [ ] Densidad afiliada ≤5 affiliates/1000w para comparativas.
- [ ] No publicar el día después del artículo anterior (mínimo 2 días gap en fase Recovery).
- [ ] Verificar que la cadencia semanal no se está disparando sin querer.

---

## 8. Histórico decisiones

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-05-06 | Reducir cadencia 3/sem → 1/sem en Recovery | Burst pattern causó flag HCU; cura = cadencia natural sostenida |
| 2026-05-06 | Reordenar calendario priorizando estacionales | Ventanas calor/niños/Prime Day cierran si esperamos |
| 2026-05-06 | Posponer cierre Phase 1 a 24 ago (vs 01 jul) | Cadencia segura > velocidad cuando hay flag activo |
| 2026-05-06 | Fix 23 fechas frontmatter (commit fa30f13) | Backdating en 79% artículos = freshness fraud signal |
