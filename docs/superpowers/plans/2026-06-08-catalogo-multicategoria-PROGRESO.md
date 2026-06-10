# Progreso — Catálogo multicategoría (subagent-driven)

Plan: `2026-06-08-catalogo-multicategoria.md` (15 tasks TDD).
Rama: `feat/catalogo-multicategoria`.
Modo: subagent-driven-development. Commit + revisión (spec + calidad) por task. Pausa para confirmar tras cada task.

> Estado vive AQUÍ (no en memoria) para poder continuar desde otro PC/sesión.

## Estado por task

- [x] **Task 1** — Colección `productos` (schema Zod unión discriminada). Commit `f3481f6`. Spec ✅. Calidad: issues evaluados, ninguno real (diseño deliberado del plan: dual `tipo` para filtrado barato, `''` sentinel imagen, fechas string verbatim).
- [x] **Task 2** — Registro `src/lib/tipos.ts`. Commit `b7b394f`. Verbatim vs plan, build OK.
- [x] **Task 3** — `productos.ts` core (mediaEjesPresentes, notaGlobal, ganadoresPorValor, getCampo) TDD. Commit `6a26523`. 9/9 tests.
- [x] **Task 4** — `seleccionarParesVs` + `construirIndiceBusqueda` TDD. Suite 12/12.
- [x] **Task 5** — Migración 19 sillas a `src/content/productos/`. Commit `db7da13`. Spec ✅ (fidelidad verbatim verificada en los 19, parse-compare vs `de550af`). Sin enums inventados. tramoPrecio correcto en los 19. precioMin/Max null (fuente solo tenía precioAprox puntual).

- [x] **Task 6** — Componentes base (FallbackImagen, ImagenProducto, ValoracionEjes, ParaQuien). Commit `75836ae`. FallbackImagen/ParaQuien rescatados verbatim (`0f92c94`/`6b831d9`), props coinciden sin adaptación, build OK.
- [x] **Task 7** — Helpers de formato (TDD) + `TarjetaProducto`. Commit `f19b30b`. Suite `src/lib/productos.test.ts` 21/21, build OK. Añadido `BotonPrecio` genérico para resolver dependencia de `TarjetaProducto`. `buildAmazonHref` solo genera URL Amazon con ASIN verificado; `amazon.buscar` no produce `/s?k=` público por regla Amazon vigente. Calidad ✅ tras corregir URLs `/guias/` en índice, `formatoSpec(null, 'bool') => n/d` y label accesible de comparar.
- [x] **Task 8** — `CatalogoProductos` (filtros + orden + comparar). Commit `f6023b6`. Spec ✅. Calidad ✅ tras ajustar barra de comparar sobre bottom nav móvil y merge robusto de `localStorage` para múltiples instancias del mismo tipo. Build OK; `public/_headers` sin cambios.

- [x] **Task 9** — `FichaProducto` + rutas catálogo (hub `/catalogo/`, `/catalogo/[tipo]/`, ficha `/catalogo/[tipo]/[slug]` + Product/Review/BreadcrumbList JSON-LD). Commit `95871f5`. Verbatim del plan, 0 adaptaciones (Base.astro tiene `slot name="head"`). Build OK 70 pp, 19 fichas con Review schema, 0 FAQPage/HowTo. Spec ✅. Calidad ✅ (Approved; minors heredados del plan: `siteUrl` y regex slug duplicados, `as unknown as Producto[]` cast — no bloqueantes). `public/_headers` revertido (postbuild regen CSP) → fuera del commit; JSON-LD es `application/ld+json`, no lo gobierna `script-src`.

## Pendiente

- [ ] Task 10 — Comparador interactivo `/comparar/[tipo]/` (noindex).
- [ ] Task 11 — Páginas "vs" estáticas `/comparar/[tipo]/[par]`.
- [ ] Task 12 — Buscador global `/buscar/` + índice JSON + SearchAction.
- [ ] Task 13 — Blog actualidad `/actualidad/`.
- [ ] Task 14 — Navegación (header, home) + redirects.
- [ ] Task 15 — Verificación final + pulido.

## Notas para continuar

- `buildAmazonHref` ya existe en `src/lib/productos.ts` desde Task 7. Para Tasks 10-11 reutilizarlo desde `@/lib/productos`; no importar `@/lib/sillas` (no existe en `main`) y no generar URLs Amazon de búsqueda `/s?k=` sin ASIN.
- Hook `gateguard-fact-force` intercepta primer Write/Bash de cada subagente y del controlador; resuelto presentando facts.
- Rescate de artefactos rama aparcada `feat/catalogo-sillas-db`: `0f92c94:src/components/FallbackImagen.astro`, `6b831d9:src/components/ParaQuien.astro` (Task 6).
