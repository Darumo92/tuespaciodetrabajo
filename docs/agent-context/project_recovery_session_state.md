---
name: Estado sesión recovery indexación activa
description: Handoff entre sesiones del plan recovery. Cuando el usuario abra nueva sesión y diga "vamos con lo de ayer" / "seguimos con recovery" / "vamos con bloque B", consultar este memo para saber dónde retomamos exactamente
type: project
originSessionId: c08b5d9c-873e-4ee4-be4b-27dda7bb729a
---
## Próxima acción (Jue 14 may 2026)

**Bloque C: backlinks Tier 1 — SESION_2 Reddit Día 6+**

Bloque D completado el mié 13 may: usuario confirmó "indexación solicitada" para las 8 URLs prioritarias en GSC.

Siguiente paso: retomar backlinks Tier 1. Revisar `docs/PLAN_BACKLINKS_TIER1.md`, `docs/SESION_2_BACKLINKS_PAQUETE.md` y `docs/agent-context/project_backlinks_session_state.md`. Empezar por karma check Reddit y selección de hilos vivos antes de publicar respuestas.

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
