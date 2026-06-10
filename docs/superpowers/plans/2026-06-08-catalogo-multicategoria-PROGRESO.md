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

- [x] **Task 10** — Comparador interactivo `/comparar/[tipo]/` (noindex). Commit `0e963fd`. **FIX crítico aplicado:** plan importaba `buildAmazonHref` de `@/lib/sillas` (no existe en esta rama ni en `main`) → corregido a `@/lib/productos`. `grep -rn lib/sillas src/` vacío. Base.astro YA soportaba prop `noindex` (emite `<meta name=robots content="noindex, follow, ...">`) → sin tocar Base. Build OK 71 pp, `/comparar/silla/` con noindex. Spec ✅. Calidad ✅ (Approved; minors: doble `buildAmazonHref`, rama ENUM inalcanzable en comparador, `td` en thead sin `th scope` — todo heredado del plan, sin exploit XSS: slugs validados contra lista + `esc()` en todos los sinks). `public/_headers` revertido (postbuild CSP regen no determinista, no causado por comparador → script bundleado externo).

- [x] **Task 11** — Páginas "vs" estáticas `/comparar/[tipo]/[par]` (indexables, pares curados). Commit `bcd9ef9`. **Adaptación:** `const MAX_PARES = 16` movido de scope módulo → dentro de `getStaticPaths` (Astro aísla el scope; build fallaba `MAX_PARES is not defined`). Behavior-preserving. Build OK 87 pp, 16 páginas vs `silla/*-vs-*`, noindex=0 (sí indexan). Spec ✅. Calidad ✅ (Approved; `set:html` seguro: campos de `comparador` numéricos/null editoriales, nunca string crudo → sin XSS; minors: rama ENUM dead, `paths: any[]`/cast/`cfg!` patrón estándar). `public/_headers` revertido (postbuild CSP regen, restaurado a `5a94b33`, sin pérdida; security-warning del subagente verificado falso-positivo: working tree limpio, `_headers`==HEAD).

- [x] **Task 12** — Buscador global `/buscar/` + índice JSON + SearchAction. Commits `1aaa76d` + fix `e40514b`. **Desviación justificada del plan literal (verificada en spec review):**
  - Net-new: `src/pages/buscar-indice.json.ts` — endpoint que combina productos+articulos vía `construirIndiceBusqueda`. 49 entradas (19 productos + 30 articulos), campos `{entidad, slug, titulo, sub, tipo, url}`. Productos `e.id.replace(...)`; articulos `e.slug` (legacy, igual que resto del repo) + `{titulo, categoria, tipo}` (coinciden con `ArticuloLite`).
  - `buscar.astro` YA existía (versión rica: noindex, `?q=` deeplink, debounce, búsqueda de artículos vía `/buscar.json`). **NO se sobrescribió** → extendido sin destruir para también hacer fetch de `/buscar-indice.json` y renderizar tarjetas de producto (degradación elegante: fallo del fetch de productos no bloquea búsqueda de artículos). Sigue noindex.
  - `index.astro` **NO tocado**: `Base.astro` (líneas ~98-116) YA emite `WebSite`+`SearchAction` global en todas las páginas (target `/buscar/?q={search_term_string}`). Añadir el nodo del plan habría duplicado el schema. `dist/index.html` tiene exactamente 1 `WebSite`.
  - Build OK 87 pp. Spec ✅ (goal logrado, desviaciones = juicio de ingeniería, no pereza). Calidad ✅ (Approved tras fix `e40514b`: `p.url` fetcheado se interpolaba crudo en `href` de `renderProductoCard` → envuelto en `escapeHtml`. Minors diferidos: badge hardcodeado `badge-sillas`/"Producto" sin usar `tipo`; nombre de interface `Producto` en cliente debería ser `EntradaIndice`).
  - `public/_headers` revertido (postbuild CSP regen) en ambos commits.

## Pendiente
- [ ] Task 13 — Blog actualidad `/actualidad/`.
- [ ] Task 14 — Navegación (header, home) + redirects de rutas viejas.
- [ ] Task 15 — Verificación final + pulido.

> **Checkpoint sesión 2026-06-10 (Opus 4.8, subagent-driven).** Tasks 9-12 completadas hoy (12 de 15 = 80%). Working tree LIMPIO, todo commiteado. Parado a petición del usuario tras Task 12 para decidir si continúa en esta sesión u otra (otro PC). **Para retomar en otro PC: push de la rama primero** (`git push -u origin feat/catalogo-multicategoria`) — aún NO empujada. Reanudar desde Task 13 (plan líneas 1677+).

## Notas para continuar

- `buildAmazonHref` ya existe en `src/lib/productos.ts` desde Task 7. Reutilizar desde `@/lib/productos`; **no importar `@/lib/sillas`** (no existe en `main` ni en esta rama — el plan lo referencia erróneamente en Task 10) y no generar URLs Amazon de búsqueda `/s?k=` sin ASIN.
- **Patrón `public/_headers` (Tasks 9-12):** el postbuild regenera hashes CSP de forma no determinista; NO es causado por las tasks (los `<script>` son módulos externos bundleados y el JSON-LD es `application/ld+json`, no gobernado por `script-src`). Se revierte con `git checkout public/_headers` antes de cada commit para mantenerlo fuera. Subagentes pueden disparar un security-warning por esto → es falso-positivo (restaura estado commiteado, sin pérdida).
- **Astro 5 colecciones:** productos usan `e.id` (strip extensión `.ya?ml|json`); articulos usan `e.slug` (legacy). Seguir el patrón del resto del repo.
- `Base.astro` tiene `<slot name="head">` para inyectar JSON-LD/meta, y prop `noindex` (emite `<meta name=robots content="noindex, follow, ...">`). Ya incluye `WebSite`+`SearchAction` global.
- Hook `gateguard-fact-force` intercepta primer Write/Bash de cada subagente y del controlador; resuelto presentando facts.
- Rescate de artefactos rama aparcada `feat/catalogo-sillas-db`: `0f92c94:src/components/FallbackImagen.astro`, `6b831d9:src/components/ParaQuien.astro` (Task 6).
