---
name: Estado sesión recovery indexación activa
description: Handoff entre sesiones del plan recovery. Cuando el usuario abra nueva sesión y diga "vamos con lo de ayer" / "seguimos con recovery" / "vamos con bloque B", consultar este memo para saber dónde retomamos exactamente
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## Próxima acción (Lun 11 may 2026)

**Artículo nuevo #29: trabajar-desde-casa-calor (estacional jun-ago)**

Tipo: Informativo (Info), cluster ambiente. Workflow estándar SEO engine — preguntar SERP + Keyword Surfer antes de redactar.

## Después (Mar 12 may 2026)

**Refactor lámpara LED (Bloque B pieza 3 de 3)**

Archivo: `src/content/articulos/mejor-lampara-escritorio-led.mdx`

Densidad reportada 06 may: **6.29 affiliates/1000w** (objetivo ≤5).

Mismo patrón que piezas 1 y 2:
- Bloque educativo ~600-700w pre-ComparisonTable: lux recomendados según tarea (INSST 500 lux trabajo administrativo, 750 lux precisión), CCT 4000-5000K para jornada vs 2700-3000K para descanso, CRI ≥80, evitar parpadeo (driver PWM vs DC), brazo articulado vs barra LED clip vs lámpara de pie, perfiles que NO necesitan (luz natural ventana norte, jornada <4h)
- Coherencia persona: David Rubio (Rubí, despacho 9 m², ventana orientación a contrastar — revisar mi-setup-home-office-2026 antes de escribir)
- Mención fisio Pep solo si encaja (mejor reservarlo para temas posturales puros)
- Eliminar AffiliateButton sueltos del cuerpo, mantener TopPick + ComparisonTable + 5 CTAs finales
- Verificar coherencia con artículos del cluster ambiente

## Calendario semana 06-14 may

| Día | Tarea | Estado |
|---|---|---|
| Mié 06 may | Push fix fechas (commit fa30f13) + plan recovery (d64febc) | ✅ |
| Jue 07 may | Bloque B pieza 1: refactor ratón vertical (commit 49524be) | ✅ 7.40 → 3.43/1000w |
| Vie 08 may | Bloque B pieza 2: refactor teclado ergonómico (commit 671d6c3) | ✅ 6.19 → 2.62/1000w |
| Sáb 09 may | Sin pushes. Opcional: Bloque C backlinks (Quora 5 respuestas) | — |
| Dom 10 may | Sin pushes | — |
| Lun 11 may | **Artículo nuevo #29: trabajar-desde-casa-calor** ← SIGUIENTE | Pendiente |
| Mar 12 may | Bloque B pieza 3: refactor lámpara LED | Pendiente |
| Mié 13 may | Bloque D: solicitar indexación manual GSC top 8 URLs | Pendiente |
| Jue 14 may | Bloque C backlinks Tier 1 | Pendiente |

## Top 8 URLs para Bloque D (mié 13 may)

GSC → Inspección URL → Solicitar indexación:

1. https://tuespaciodetrabajo.com/sillas/mejor-silla-ergonomica-calidad-precio/
2. https://tuespaciodetrabajo.com/accesorios/mejor-monitor-trabajar-desde-casa/
3. https://tuespaciodetrabajo.com/escritorios/mejor-escritorio-elevable-electrico/
4. https://tuespaciodetrabajo.com/guias/ergonomia-teletrabajo-postura-correcta/
5. https://tuespaciodetrabajo.com/guias/dolor-espalda-trabajar-casa/
6. https://tuespaciodetrabajo.com/guias/altura-correcta-escritorio-silla/
7. https://tuespaciodetrabajo.com/accesorios/mejor-raton-vertical-ergonomico/ (post-refactor 07 may)
8. https://tuespaciodetrabajo.com/accesorios/mejor-teclado-ergonomico/ (post-refactor 08 may)

(Homepage queda fuera del top 8 — sustituida por teclado refactorizado)

## Estado bloques recovery

- [x] Bloque A día 0: fix fechas frontmatter (commit fa30f13)
- [x] Bloque B pieza 1: ratón vertical (commit 49524be, 07 may, 7.40 → 3.43/1000w)
- [x] Bloque B pieza 2: teclado ergonómico (commit 671d6c3, 08 may, 6.19 → 2.62/1000w)
- [ ] Bloque B pieza 3: lámpara LED ← MAR 12 MAY
- [ ] Bloque C: backlinks Tier 1 (Quora 5 respuestas Bloque B pendientes desde 29 abr)
- [ ] Bloque D: solicitud indexación manual GSC top 8

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

## Documentación de referencia

- Plan completo: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md`
- Calendario: `project_content_calendar.md`
- Persona autor: `project_author_persona.md`
- Backlinks: `docs/PLAN_BACKLINKS_TIER1.md`
- Sesión backlinks pendiente: `docs/SESION_1_BACKLINKS_PAQUETE.md`
