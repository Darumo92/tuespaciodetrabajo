---
name: Plan recuperación E-E-A-T tras colapso indexación abril 2026
description: Estado del plan de refuerzo E-E-A-T para sacar 15 páginas de "Rastreada-no-indexada" en GSC. Artículos pendientes, patrón de cambios y reglas de cadencia
type: project
originSessionId: 526f9e83-434f-4fe7-8dcd-23c58725559b
---
**Why:** GSC reportó colapso de indexación 2026-04-10 → 2026-04-24 (20 → 4 páginas indexadas, -80%). Causa raíz = veredicto Google de baja calidad / E-E-A-T débil sobre 15 páginas en "Rastreada: actualmente sin indexar". Ningún fix técnico recupera indexación; hace falta refuerzo de contenido + autor.

**How to apply:** Cuando el usuario diga "vamos con E-E-A-T" o "siguiente artículo del plan recovery" o "el de [slug]", retomar este plan en el siguiente artículo pendiente. Aplicar SIEMPRE el patrón de refuerzo descrito abajo. Respetar la cadencia (1-2 artículos/día) — NO hacer todos de golpe.

## Cadencia (criterio corregido 2026-04-27)

- **Aplicar los 15 artículos cuanto antes** — el sitio está en colapso crítico (4 indexadas, 0 impresiones). No hay rankings que proteger. Esperar = más días con veredicto "Rastreada-no-indexada"
- **Commits separados por artículo** (no batch grande). Mensaje: `content: strengthen E-E-A-T in [slug]`. Razón: rollback granular si un artículo falla + historial git muestra patrón de "autor mejorando" no "IA en 1 commit gigante"
- Push tras cada commit o batch final tras toda la sesión
- Argumento "sitio inestable por churn alto" NO aplica a sitios sin tráfico/rankings. Aplica a sitios establecidos. En este caso, el cambio masivo es positivo
- NO penalty algorítmico por editar artículos. Solo riesgo "re-evaluación temporal" — irrelevante cuando partes de 0 impresiones

## Patrón de refuerzo por artículo

Aplicar estos 5 cambios siempre:

1. **Intro reescrita** con datos físicos/biográficos verificables del autor (1,80 m, 85 kg, vive en Rubí, 7-8 h sentado/día, etc.)
2. **Bloque metodología** tras TopPick (en comparativas) o tras intro (en guías): cuántos productos probó físicamente, cuáles no, fuentes consultadas (r/teletrabajo, r/spain, valoraciones Amazon filtradas), criterios objetivos
3. **Mención Pep (fisioterapeuta) + clínica Fisiosthetic** al menos 1 vez por artículo de salud postural. Variar entre "Pep" y "mi fisioterapeuta" para naturalidad. Datos canónicos: 300 € en 6 sesiones tras dolor lumbar post-confinamiento 2020
4. **1-2 enlaces externos autoritativos**: Cornell Ergonomics (https://ergo.human.cornell.edu/AHTutorials/ckpttoc.html), INSST (https://www.insst.es/), CDC NIOSH, OSHA. NO enlazar a competidores
5. **Verificar y corregir inconsistencias** entre lo que se dice en este artículo y otros artículos / `/sobre-mi/` (frecuencia uso productos, fechas, cifras)

## Estado de los 15 artículos en "Rastreada-no-indexada"

Origen: GSC export 2026-04-27 (carpetas tuespaciodetrabajo-12 en ~/Downloads).

| # | Slug | URL | Estado E-E-A-T |
|---|------|-----|----------------|
| 1 | mejor-silla-ergonomica-calidad-precio | /sillas/mejor-silla-ergonomica-calidad-precio/ | ✅ Hecho 2026-04-27 (commit 5b48b81). 3073 palabras, Pep + Fisiosthetic, Cornell, metodología transparente |
| 2 | mejor-escritorio-elevable-electrico | /escritorios/mejor-escritorio-elevable-electrico/ | ✅ Hecho 2026-04-28 (commit ed53df0). Intro reescrita con estructura distinta a #1 (narrativa-first, no bio-block), metodología transparente, Pep + Fisiosthetic, Cornell + INSST |
| 3 | mejor-monitor-trabajar-desde-casa | /accesorios/mejor-monitor-trabajar-desde-casa/ | ✅ Hecho 2026-04-29 (commit c247e9c). Intro contraintuitiva ("compra que más cambió"), bloque metodología (probados físicamente / oficina ajena / no probados), Pep + Fisiosthetic + 300 €/6 sesiones, Cornell + INSST, fix 8→9 m² |
| 4 | dolor-espalda-trabajar-casa | /guias/dolor-espalda-trabajar-casa/ | ✅ Hecho 2026-04-28 (commit b73ed7c). Encadenado médico→Pep→Fisiosthetic 300 €/6 sesiones, disclaimer YMYL "no soy médico", Cornell, 9 m² Rubí |
| 5 | ergonomia-teletrabajo-postura-correcta | /guias/ergonomia-teletrabajo-postura-correcta/ | ✅ Hecho 2026-04-28 (commit 4125f3e). Bloque YMYL transparencia, Pep×6, Cornell+INSST+IBV, 9 m² Rubí, apertura lead-stat distinta |
| 6 | mejor-raton-vertical-ergonomico | /accesorios/mejor-raton-vertical-ergonomico/ | ✅ Refactor Bloque B 2026-05-07 (7.40 → 3.43 afiliados/1000w) |
| 7 | mejor-teclado-ergonomico | /accesorios/mejor-teclado-ergonomico/ | ✅ Refactor Bloque B 2026-05-08 (6.19 → 2.62 afiliados/1000w) |
| 8 | altura-correcta-escritorio-silla | /guias/altura-correcta-escritorio-silla/ | Pendiente |
| 9 | mi-setup-home-office-2026 | /guias/mi-setup-home-office-2026/ | ✅ Hecho 2026-04-28 (commit 48e0b32). Apertura tour-style nueva, Pep×3 + Fisiosthetic, Cornell+INSST en intro, 9 m² Rubí norte, 1,80 m, 74/110 cm |
| 10 | organizar-cables-escritorio | /guias/organizar-cables-escritorio/ | Pendiente |
| 11 | home-office-piso-pequeno | /guias/home-office-piso-pequeno/ | Pendiente |
| 12 | novedades-home-office-2026 | /guias/novedades-home-office-2026/ | Pendiente |
| 13 | productividad-en-casa-entorno-fisico | /guias/productividad-en-casa-entorno-fisico/ | Pendiente |
| 14 | ambiente/mejor-lampara-escritorio-led | /ambiente/mejor-lampara-escritorio-led/ | ✅ Refactor Bloque B 2026-05-12 (6.29 → 3.08 afiliados/1000w) |
| 15 | tunel-carpiano-teletrabajo-prevencion | /guias/tunel-carpiano-teletrabajo-prevencion/ | Pendiente |
| - | accesorios/ (categoría) | /accesorios/ | NO tocar — listing, no contenido |

## Orden recomendado

- Día 1 (2026-04-27): #1 mejor-silla-ergonomica-calidad-precio ✅ (commit 5b48b81)
- Día 2 (2026-04-28): #2, #4, #5, #9 ✅
- Día 3 (2026-04-29): #3 mejor-monitor-trabajar-desde-casa ✅ (commit c247e9c). Resto pausado por foco en plan backlinks
- **Próximos pendientes (orden):** #15 tunel-carpiano, #8 altura-correcta, #10 organizar-cables, #11 home-office-piso-pequeno, #12 novedades, #13 productividad-entorno

## Trigger para retomar mañana

Cuando el usuario diga cualquiera de:
- "vamos con el plan"
- "seguimos con E-E-A-T"
- "siguiente artículo"
- "vamos con el de [slug]"
- "haz los artículos pendientes"
- "vamos con los pillars"

→ Leer este archivo + project_author_persona.md + abrir el siguiente artículo pendiente del orden de arriba. Aplicar el patrón de refuerzo (los 5 cambios). Commit separado por artículo. Push al final o tras cada uno.

## Resumen rápido del estado al cerrar 2026-04-27

Hechos hoy:
- Fix técnico: `/dp/*` catch-all redirect, legales sin noindex, meta robots consolidado
- E-E-A-T: Person schema con LinkedIn sameAs en /sobre-mi/ y todos los artículos
- Datos canónicos del autor establecidos (Rubí, 1,80 m, 85 kg, hijo sept 2024, fisio Pep en Fisiosthetic)
- 1/15 artículos refactorizados (mejor-silla-ergonomica-calidad-precio)

Pendiente usuario (acción manual fuera del código):
- ✅ LinkedIn → Contact info → añadido https://tuespaciodetrabajo.com/sobre-mi/ (confirmado por usuario 2026-04-27)
- ✅ Solicitada indexación manual en GSC del artículo refactorizado mejor-silla-ergonomica-calidad-precio (confirmado por usuario 2026-04-27)

Pendiente código:
- 9 artículos restantes con refactor E-E-A-T (6/15 completados al 2026-04-29)
- Decisión usuario sobre quitar `audio-video` del nav principal (categoría vacía con noindex)

## Tareas paralelas (no bloquean refactor de artículos)

- LinkedIn: usuario debe añadir https://tuespaciodetrabajo.com/sobre-mi/ a "Contact info" en LinkedIn → reciprocidad sameAs (estado: PENDIENTE confirmar)
- Solicitar indexación manual en GSC tras cada artículo refactorizado (24-48h después del deploy). Top 5 prioritarios: mejor-silla, mejor-escritorio, dolor-espalda, ergonomia, sobre-mi
- NO publicar nuevos artículos hasta completar los 15 (~14 días). Pausar Phase 1 calendar
- NO setear `actualizadoEn` en frontmatter al refactorizar (señal freshness spam)

## Métricas de éxito (revisar semanal en GSC)

- "Rastreada: actualmente sin indexar" debe bajar de 15 → ~5 en 4 semanas
- "Indexadas" subir de 4 → 15+ en 4 semanas
- Impresiones romper la racha 0 (actualmente 0 desde 2026-04-21)
- Si tras 4 semanas no recupera → considerar consolidar artículos finos (merge 2 en 1) y revisar diversificación de afiliación
