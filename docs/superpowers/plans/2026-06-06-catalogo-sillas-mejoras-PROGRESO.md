# Progreso ejecución — Catálogo sillas mejoras

> Estado de ejecución del plan `docs/superpowers/plans/2026-06-06-catalogo-sillas-mejoras.md`
> mediante subagent-driven-development (multiagentes). Última actualización: **2026-06-08 ~08:24**.
> Rama: `feat/catalogo-sillas-db`.

## Resumen

**Tasks 1–11 COMPLETADAS.** Plan ejecutado de principio a fin.

Verificación final (Task 11):
- `npx vitest run src/lib/sillas.test.ts` → **29/29 tests pasan**.
- `npm run build` → OK, **71 páginas** (incluye `/sillas/comparar/`).
- Schemas: `FAQPage` = 0, `"HowTo"` = 0 en `dist/`. `Review` presente en
  `dist/sillas/catalogo/sihoo-doro-c300/index.html`. `/sillas/comparar/` con `noindex`.
- Árbol de trabajo limpio.

**Único paso no automatizable pendiente:** revisión visual interactiva (`npm run dev`) y
pulido estético opcional (Task 11 step 4). No bloquea: build/tests/schemas verdes. Hacerlo en
local cuando se quiera dar el repaso de UI; commit de pulido solo si se tocan estilos.

## Tasks completadas (commits en la rama)

| Task | Commit | Descripción |
|------|--------|-------------|
| 1 | `f8123e2` | Schema Zod ampliado (specs, sub-scores, campos editoriales) |
| 2 | `c637f22` | Tipo `Valoraciones` + `mediaEjesPresentes` + `notaGlobal` (TDD) |
| 3 | `1d2dc12` | `ganadoresPorValor` (TDD) |
| 4 | `0f92c94` | `ImagenSilla` + `FallbackImagen` |
| 5 | `bc64c72` | `ValoracionEjes.astro` |
| 6 | `6b831d9` | `ParaQuien.astro` |
| 7 | `798d1b6` | `FichaSilla` enriquecida + schema `Review` honesto en `[slug].astro` |
| 8 | `b2553f9` | `TarjetaSilla` + selección comparar (casillas + barra flotante) + `_headers` |
| 9 | `d324e85` | Comparador interactivo `/sillas/comparar` (noindex, resalte ganador) + `_headers` |
| 10 | `de550af` | **19 sillas enriquecidas**: specs investigados, sub-scores editoriales y contenido |

## Task 10 — notas de la investigación (honestidad)

Las 19 sillas se investigaron en fuentes reales (webs de fabricante, Amazon.es/IKEA.es,
RTINGS/btod/seatedlab, r/OfficeChairs). Reglas respetadas: dato no confirmado → `null`;
sin inventar números, dimensiones, certificaciones ni ASINs; sub-scores editoriales pero
fundados en specs + consenso (eje sin base → `null`). Zod valida los 5 ejes en rango 0–10.

Calibración aplicada (coherente entre sillas):
- Premium (Aeron, Embody, Gesture, Leap V2, Haworth Fern): ergonomía/materiales altos.
- Mid sólida (Doro C300, C7 Lite, M57): ~8–8.8.
- Económicas correctas (Markus, Hbada, M102C): ~6.5–8; **calidad-precio invertida** (Markus
  calidadPrecio 9 / ajustabilidad 4.5).
- Básicas (Songmics, Durrafy, Holludle): ~5.5–7, con nulls donde el consenso es fino.

Correcciones de datos previos confirmadas con fuente (ej.: Haworth Fern `pesoMaxKg` 159,
`garantiaAnios` 12, `certificacionBifma` true). Donde no había fuente fiable se mantuvo `null`
(ej.: `pesoProductoKg` de Secretlab; `garantiaAnios`/`certificacionBifma` de Autonomous ErgoChair Pro).

## Deuda menor conocida (no bloqueante)
- `CatalogoSillas.astro` importa `reposabrazosNivel` aunque ya no lo usa directamente (lo usa
  `TarjetaSilla`). El plan lo especifica así; build pasa. Limpiable opcionalmente.
- `comparar.astro` anida `<main>` dentro del `<main>` de `Base.astro` (mismo patrón que las
  fichas existentes). Consistente con el repo, semánticamente mejorable.
