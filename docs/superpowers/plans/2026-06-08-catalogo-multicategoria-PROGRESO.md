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

## Pendiente

- [ ] Task 7 — Helpers de formato (TDD) + TarjetaProducto.
- [ ] Task 8 — CatalogoProductos (filtros + orden + comparar).
- [ ] Task 9 — FichaProducto + rutas catálogo (hub, tipo, ficha + Review schema).
- [ ] Task 10 — Comparador interactivo `/comparar/[tipo]/` (noindex).
- [ ] Task 11 — Páginas "vs" estáticas `/comparar/[tipo]/[par]`.
- [ ] Task 12 — Buscador global `/buscar/` + índice JSON + SearchAction.
- [ ] Task 13 — Blog actualidad `/actualidad/`.
- [ ] Task 14 — Navegación (header, home) + redirects.
- [ ] Task 15 — Verificación final + pulido.

## Notas para continuar

- `buildAmazonHref` (Task 10) se reusa de `@/lib/sillas`; verificar firma con `git show main:src/lib/sillas.ts | grep -n buildAmazonHref` antes de importar. Si no existe en `main`, replicar en `productos.ts`.
- Hook `gateguard-fact-force` intercepta primer Write/Bash de cada subagente y del controlador; resuelto presentando facts.
- Rescate de artefactos rama aparcada `feat/catalogo-sillas-db`: `0f92c94:src/components/FallbackImagen.astro`, `6b831d9:src/components/ParaQuien.astro` (Task 6).
