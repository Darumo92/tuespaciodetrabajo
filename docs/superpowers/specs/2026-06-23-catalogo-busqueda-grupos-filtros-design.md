# Diseño: Búsqueda por texto + grupos de filtros del catálogo

> Task 11 del plan `2026-06-20-ampliacion-catalogo-sillas-100-oleadas.md` (mejora estructural, **código no contenido**). Catálogo a 77 sillas tras oleada 6. Rama `feat/catalogo-busqueda-filtros`.
> Fecha: 2026-06-23.

## Objetivo

Con 77 sillas, el catálogo necesita seguir navegable:

1. **Búsqueda por texto** más útil (no solo nombre/marca).
2. **Agrupar los 9 filtros** en grupos temáticos plegables para que la barra no sea una fila plana inmanejable.

Sin regresiones de accesibilidad, sin tocar el filtrado ni la barra de comparación, sin generar URLs facetadas indexables, y **con paridad ES / inglés en toda etiqueta, placeholder y aria nuevos**.

## Estado de partida (qué ya existe)

- `src/lib/productos.ts`: `normalizaTexto`, `coincideBusqueda(query, ...campos)`, `opcionesMarca`, `cuentaConDato`, `filtrosVisibles`, `claveData`, `datosFiltrado`, `pasaEn`. Con tests verdes (51 en `productos.test.ts`).
- `src/lib/tipos.ts`: `FiltroConfig` (control `rango|select|check`, comparacion `max|igual|min|check|umbral|en`), config `silla` con 9 filtros + ordenaciones + chips.
- `src/components/producto/CatalogoProductos.astro`: input `type=search [data-busqueda]` con label/aria/placeholder enrutados por `isEn`; fila plana de píldoras con popovers; drawer móvil; barra de comparación; `applyFilters`/`pasaFiltro`/chips. La búsqueda hoy lee `.card-name` + `.card-brand`, sin debounce.
- `src/components/producto/TarjetaProducto.astro`: card con `data-slug`, `data-c-*` (filtrado), `.card-name`, `.card-brand`.

**Decisiones de datos verificadas:** `idealPara` poblado en 77/77 fichas; campo `tags` poblado en 0/77 → la búsqueda **no** incluye tags (sería inventar dato).

## Decisiones de diseño (cerradas con el usuario)

- **Patrón UI = Híbrido (A).** Filtros rápidos siempre visibles + botón "Más filtros" que abre panel con grupos plegables. Justificación: patrón vivo en ecommerce actual (Baymard); mejor a11y vía `<details>/<summary>` nativos; encaja con el drawer móvil existente; SEO neutro (filtros son JS cliente sobre cards estáticas ya en el DOM, no cambian contenido rastreable ni generan URLs).
- **Búsqueda = nombre + marca + idealPara**, con debounce ~150ms. Sin tags (vacíos).
- **Marca es filtro rápido** (alta intención en sillas; no enterrarla).
- **Grupos vacíos no se renderizan** (respetando `filtrosVisibles`, que ya auto-oculta facetas con <3 datos).
- **Paridad ES / EN** obligatoria en cada string nuevo.

## Arquitectura

### 1. Búsqueda

**`TarjetaProducto.astro`** emite un atributo `data-buscar` con el texto buscable ya normalizado:

```
data-buscar = normalizaTexto(`${nombre} ${marca} ${idealPara ?? ''}`)
```

No infla el DOM visible (es un atributo). El `idealPara` está en español en los datos; en EN la búsqueda sigue funcionando por substring sin acentos (no se traduce el contenido del catálogo, igual que hoy).

**`productos.ts`** — helper testeable:

```ts
/** Texto normalizado buscable de un producto: nombre + marca + idealPara. */
export function textoBuscable(p: Pick<Producto,'nombre'|'marca'|'idealPara'>): string
```

Reutiliza `normalizaTexto`. `coincideBusqueda` ya existente queda como utilidad pura (cubierta por tests). La card usa `textoBuscable`.

**`CatalogoProductos.astro` (script inline)**:
- `coincide(card)` lee `card.dataset.buscar` en vez de `.card-name`/`.card-brand`.
- `input` con **debounce ~150ms** (timer simple, sin dependencias). El evento `search` (botón ✕ nativo) aplica inmediato.
- Placeholder/aria ya enrutados por `isEn` → ampliar el placeholder a algo tipo "Buscar por nombre, marca o uso…" / "Search by name, brand or use…".

### 2. Grupos de filtros

**`tipos.ts`**:
- `FiltroConfig` gana `grupo?: string` (id de grupo; ausencia = filtro rápido).
- Const exportada con orden y etiquetas de grupos:

```ts
export interface GrupoFiltro { id: string; etiqueta: string; etiquetaEn: string; }
export const GRUPOS_FILTRO: GrupoFiltro[] = [
  { id: 'ergonomia',   etiqueta: 'Ergonomía y ajustes', etiquetaEn: 'Ergonomics & adjustments' },
  { id: 'encaje',      etiqueta: 'Encaje corporal',     etiquetaEn: 'Body fit' },
  { id: 'resistencia', etiqueta: 'Resistencia',         etiquetaEn: 'Load capacity' },
];
```
- Asignar `grupo` a los filtros de `silla`:
  - rápidos (sin `grupo`): `precio`, `marca`.
  - `ergonomia`: `respaldo`, `brazos`, `prof`, `reposacabezas`.
  - `encaje`: `altura-min`, `altura-max`.
  - `resistencia`: `peso`.

**`productos.ts`** — helper testeable:

```ts
export interface GrupoFiltrosRender { id: string; etiqueta: string; etiquetaEn: string; filtros: FiltroConfig[]; }
/** Reparte filtros YA visibles en grupos (orden GRUPOS_FILTRO). Excluye grupos vacíos.
 *  Devuelve { rapidos: FiltroConfig[], grupos: GrupoFiltrosRender[] }. */
export function agruparFiltros(
  filtrosVisibles: FiltroConfig[],
  grupos: GrupoFiltro[]
): { rapidos: FiltroConfig[]; grupos: GrupoFiltrosRender[] }
```

Reglas: filtro sin `grupo` → `rapidos`; filtro con `grupo` → su grupo; grupos en orden de `GRUPOS_FILTRO`; grupo sin filtros → omitido. Se le pasan los filtros **ya pasados por `filtrosVisibles`**, así el auto-ocultado por datos se respeta sin lógica nueva.

**`CatalogoProductos.astro`**:
- Frontmatter: tras `filtrosVisibles`, llamar `agruparFiltros` → `rapidos` + `grupos`. Pasar al `panelConfig` igual que hoy (la config runtime JS no necesita saber de grupos: el estado de filtros sigue siendo plano por `id`).
- Markup:
  - Fila superior: Buscar (ya está, arriba) · píldoras de `rapidos` (precio, marca) · "Más filtros (N)" · Ordenar · "Ver N resultados" (móvil).
  - Panel "Más filtros": contenedor con un `<details>` por grupo (`<summary>` = etiqueta del grupo + contador opcional). Dentro, las **mismas píldoras/popovers** que hoy, una por filtro del grupo. El JS de popover/estado/chips actual sigue enganchando por `[data-pill]`/`[data-pop]` sin cambios de lógica.
  - El botón "Más filtros" togglea la visibilidad del panel (en escritorio) y muestra el contador de filtros del panel activos. En móvil, el panel vive dentro del drawer existente.
- Todas las etiquetas nuevas (summary de grupo, botón "Más filtros", placeholder) pasan por el patrón `isEn`/`labelMap` o `etiquetaEn`.

### 3. Sin tocar (garantía anti-regresión)

- `pasaFiltro`, `applyFilters`, ordenación, chips activos, "Limpiar todo", barra de comparación, `datosFiltrado`, `data-c-*`: intactos. Los grupos son envoltura visual; el estado de filtros sigue indexado por `id` plano.
- Sin parámetros de URL ni rutas facetadas nuevas.

## Accesibilidad

- `<details>/<summary>` nativos: plegado y navegación por teclado sin JS.
- Mantener foco, `aria-expanded`, roles y Escape de los popovers actuales.
- Botón "Más filtros" con `aria-expanded` y `aria-controls` al panel.
- Input de búsqueda conserva label/aria; debounce no rompe lectores de pantalla (`aria-live` del contador ya existe).

## CSP

El script inline del catálogo cambia (debounce + toggle panel). `npm run build` regenera `public/_headers` con el nuevo hash. **Solo el hash del catálogo** debe entrar en el commit; coordinar con el usuario por el WIP i18n que también toca `_headers`.

## Plan de tests (TDD)

`src/lib/productos.test.ts` (mantener 51 verdes + añadir):
- `textoBuscable`: incluye nombre, marca e idealPara normalizados; tolera `idealPara` ausente.
- `agruparFiltros`:
  - filtros sin `grupo` → `rapidos`.
  - filtros con `grupo` → su grupo, en orden de `GRUPOS_FILTRO`.
  - grupo sin filtros visibles → omitido.
  - integración con `filtrosVisibles` (pasar lista ya filtrada).

Gates antes de commit: `npm run validate:productos` + `npm test` + `npm run build`.

## Fuera de alcance

- Filtro de certificaciones (BIFMA): no hay datos suficientes; no se inventa.
- Búsqueda por tags: campo vacío en todas las fichas.
- URLs facetadas / persistencia de filtros en URL.
- Poblar specs nuevas (altura, etc.) en fichas existentes — el grupo "Encaje corporal" puede salir vacío hasta que haya datos, y el diseño lo contempla (no se renderiza vacío).
