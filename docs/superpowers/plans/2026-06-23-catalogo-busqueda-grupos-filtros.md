# Catálogo: Búsqueda por texto + grupos de filtros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ampliar la búsqueda del catálogo a nombre+marca+idealPara con debounce, y agrupar los 9 filtros en grupos temáticos plegables (patrón híbrido), con paridad ES/EN y sin regresiones.

**Architecture:** Lógica pura testeable en `src/lib/productos.ts` (`textoBuscable`, `agruparFiltros`) + metadatos de grupo en `src/lib/tipos.ts` (`grupo` en `FiltroConfig`, `GRUPOS_FILTRO`). La card emite `data-buscar` precomputado. `CatalogoProductos.astro` renderiza filtros rápidos + panel "Más filtros" con `<details>` por grupo, reusando el JS de popover/estado/chips actual sin tocar `pasaFiltro`/`applyFilters`. El estado de filtros sigue plano por `id`; los grupos son solo envoltura visual.

**Tech Stack:** Astro 5 (static), TypeScript, Vitest, plain CSS. Sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-06-23-catalogo-busqueda-grupos-filtros-design.md`

---

## Estructura de archivos

- `src/lib/productos.ts` — añade `textoBuscable(p)` y `agruparFiltros(filtros, grupos)` + interfaces. Lógica pura.
- `src/lib/tipos.ts` — añade `grupo?` a `FiltroConfig`, `GrupoFiltro`, `GRUPOS_FILTRO`, y asigna `grupo` a los filtros de `silla`.
- `src/lib/productos.test.ts` — tests de los dos helpers nuevos.
- `src/components/producto/TarjetaProducto.astro` — emite `data-buscar`.
- `src/components/producto/CatalogoProductos.astro` — UI rápidos + panel agrupado, JS de búsqueda con debounce, toggle de panel, CSS, labels ES/EN.

Gates (tras cada task con código): `npm test`. Cierre: `npm run validate:productos` + `npm test` + `npm run build`.

---

## Task 1: helper `textoBuscable` (lib, TDD)

**Files:**
- Modify: `src/lib/productos.ts` (añadir tras `coincideBusqueda`, ~línea 243)
- Test: `src/lib/productos.test.ts` (añadir al final)

- [ ] **Step 1: Write the failing test**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { textoBuscable } from './productos';

describe('textoBuscable', () => {
  it('concatena nombre, marca e idealPara normalizados', () => {
    const s = textoBuscable({ nombre: 'Aeron', marca: 'Herman Miller', idealPara: 'Personas altas' });
    expect(s).toBe('aeron herman miller personas altas');
  });
  it('tolera idealPara ausente', () => {
    expect(textoBuscable({ nombre: 'Markus', marca: 'IKEA', idealPara: undefined })).toBe('markus ikea');
  });
  it('sin acentos ni mayúsculas para comparar', () => {
    expect(textoBuscable({ nombre: 'Ergonómica', marca: 'Hbada', idealPara: 'Oficina' })).toBe('ergonomica hbada oficina');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/productos.test.ts -t textoBuscable`
Expected: FAIL — `textoBuscable is not a function` / import error.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/productos.ts`, tras la función `coincideBusqueda` (~línea 243):

```ts
/** Texto normalizado buscable de un producto: nombre + marca + idealPara. */
export function textoBuscable(p: Pick<Producto, 'nombre' | 'marca' | 'idealPara'>): string {
  return normalizaTexto([p.nombre, p.marca, p.idealPara ?? ''].join(' ').replace(/\s+/g, ' '));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/productos.test.ts -t textoBuscable`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): helper textoBuscable (nombre+marca+idealPara)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: grupos en tipos.ts (`grupo`, `GRUPOS_FILTRO`)

**Files:**
- Modify: `src/lib/tipos.ts` (interface `FiltroConfig` ~línea 9-20; añadir `GrupoFiltro`/`GRUPOS_FILTRO`; asignar `grupo` en filtros de `silla` ~línea 70-91)
- Test: `src/lib/productos.test.ts` (cubierto en Task 3, que consume estos datos)

> Sin test propio: son datos de config. Su corrección se valida en Task 3 (`agruparFiltros`) y por `npx tsc`. Esta task no rompe runtime (campo opcional).

- [ ] **Step 1: Añadir `grupo` opcional a `FiltroConfig`**

En `src/lib/tipos.ts`, dentro de `interface FiltroConfig`, añadir una línea (tras `formatoSalida?`):

```ts
  formatoSalida?: FormatoSalida;
  grupo?: string;
```

- [ ] **Step 2: Añadir interface y const de grupos**

En `src/lib/tipos.ts`, tras `interface FiltroConfig { ... }` (antes de `OrdenConfig`):

```ts
export interface GrupoFiltro { id: string; etiqueta: string; etiquetaEn: string; }
export const GRUPOS_FILTRO: GrupoFiltro[] = [
  { id: 'ergonomia',   etiqueta: 'Ergonomía y ajustes', etiquetaEn: 'Ergonomics & adjustments' },
  { id: 'encaje',      etiqueta: 'Encaje corporal',     etiquetaEn: 'Body fit' },
  { id: 'resistencia', etiqueta: 'Resistencia',         etiquetaEn: 'Load capacity' },
];
```

- [ ] **Step 3: Asignar `grupo` a los filtros de `silla`**

En `src/lib/tipos.ts`, en el array `filtros` de `silla`, añadir `grupo` a cada filtro NO rápido. `precio` y `marca` quedan SIN `grupo` (rápidos). Resultado por filtro:

```ts
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', comparacion: 'igual', campo: 'specs.respaldo', grupo: 'ergonomia',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'malla', etiqueta: 'Malla' },
        { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'brazos', etiqueta: 'Reposabrazos mín.', control: 'select', comparacion: 'min',
      campo: 'specs.reposabrazos', transform: 'reposabrazosNivel', grupo: 'ergonomia',
      opciones: [{ valor: '0', etiqueta: 'Cualquiera' }, { valor: '2', etiqueta: '2D o superior' },
        { valor: '3', etiqueta: '3D o superior' }, { valor: '4', etiqueta: '4D' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', comparacion: 'check',
      campo: 'specs.profundidadRegulable', grupo: 'ergonomia' },
    { id: 'peso', etiqueta: 'Soporta 130 kg o más', control: 'check', comparacion: 'umbral',
      campo: 'specs.pesoMaxKg', umbral: 130, grupo: 'resistencia' },
    { id: 'altura-min', etiqueta: 'Apta desde altura', control: 'rango', comparacion: 'max',
      campo: 'specs.alturaRecomendadaMinCm', min: 150, max: 190, step: 5, grupo: 'encaje' },
    { id: 'altura-max', etiqueta: 'Apta hasta altura', control: 'rango', comparacion: 'min',
      campo: 'specs.alturaRecomendadaMaxCm', min: 160, max: 210, step: 5, grupo: 'encaje' },
    { id: 'reposacabezas', etiqueta: 'Reposacabezas', control: 'select', comparacion: 'igual', campo: 'specs.reposacabezas', grupo: 'ergonomia',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'ajustable', etiqueta: 'Ajustable' }, { valor: 'fijo', etiqueta: 'Fijo' }, { valor: 'ninguno', etiqueta: 'Sin reposacabezas' }] },
```

(`precio` y `marca` se dejan exactamente como están, sin `grupo`.)

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tipos.ts
git commit -m "feat(catalogo): metadatos de grupo en FiltroConfig + GRUPOS_FILTRO

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: helper `agruparFiltros` (lib, TDD)

**Files:**
- Modify: `src/lib/productos.ts` (añadir tras `filtrosVisibles`, ~línea 231; ajustar import de tipos línea 1)
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Write the failing test**

Añadir a `src/lib/productos.test.ts`:

```ts
import { agruparFiltros } from './productos';
import { GRUPOS_FILTRO } from './tipos';

describe('agruparFiltros', () => {
  const mk = (id: string, grupo?: string): FiltroConfig =>
    ({ id, etiqueta: id, control: 'select', comparacion: 'igual', campo: `specs.${id}`, grupo });

  it('separa rápidos (sin grupo) de los agrupados', () => {
    const { rapidos, grupos } = agruparFiltros(
      [mk('precio'), mk('marca'), mk('respaldo', 'ergonomia')], GRUPOS_FILTRO);
    expect(rapidos.map((f) => f.id)).toEqual(['precio', 'marca']);
    expect(grupos.map((g) => g.id)).toEqual(['ergonomia']);
    expect(grupos[0].filtros.map((f) => f.id)).toEqual(['respaldo']);
  });

  it('respeta el orden de GRUPOS_FILTRO', () => {
    const { grupos } = agruparFiltros(
      [mk('peso', 'resistencia'), mk('respaldo', 'ergonomia')], GRUPOS_FILTRO);
    expect(grupos.map((g) => g.id)).toEqual(['ergonomia', 'resistencia']);
  });

  it('omite grupos sin filtros visibles', () => {
    const { grupos } = agruparFiltros([mk('respaldo', 'ergonomia')], GRUPOS_FILTRO);
    expect(grupos.map((g) => g.id)).toEqual(['ergonomia']); // encaje y resistencia vacíos → fuera
  });

  it('expone etiqueta y etiquetaEn del grupo', () => {
    const { grupos } = agruparFiltros([mk('respaldo', 'ergonomia')], GRUPOS_FILTRO);
    expect(grupos[0].etiqueta).toBe('Ergonomía y ajustes');
    expect(grupos[0].etiquetaEn).toBe('Ergonomics & adjustments');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/productos.test.ts -t agruparFiltros`
Expected: FAIL — `agruparFiltros is not a function`.

- [ ] **Step 3: Write minimal implementation**

En `src/lib/productos.ts`, cambiar la línea 1 del import de tipos para incluir `GrupoFiltro`:

```ts
import type { ClaveTipo, FiltroConfig, TipoConfig, GrupoFiltro } from './tipos';
```

Y añadir tras `filtrosVisibles` (~línea 231):

```ts
export interface GrupoFiltrosRender { id: string; etiqueta: string; etiquetaEn: string; filtros: FiltroConfig[]; }

/** Reparte filtros (ya pasados por filtrosVisibles) en rápidos (sin grupo) y grupos.
 *  Grupos en el orden de `grupos`; los vacíos se omiten. */
export function agruparFiltros(
  filtros: FiltroConfig[],
  grupos: GrupoFiltro[]
): { rapidos: FiltroConfig[]; grupos: GrupoFiltrosRender[] } {
  const rapidos = filtros.filter((f) => !f.grupo);
  const out: GrupoFiltrosRender[] = [];
  for (const g of grupos) {
    const fs = filtros.filter((f) => f.grupo === g.id);
    if (fs.length === 0) continue;
    out.push({ id: g.id, etiqueta: g.etiqueta, etiquetaEn: g.etiquetaEn, filtros: fs });
  }
  return { rapidos, grupos: out };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/productos.test.ts -t agruparFiltros`
Expected: PASS (4 tests).

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: todos verdes (51 previos + nuevos).

- [ ] **Step 6: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): helper agruparFiltros (rápidos + grupos, omite vacíos)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: card emite `data-buscar`

**Files:**
- Modify: `src/components/producto/TarjetaProducto.astro` (import línea 3; frontmatter ~línea 14; `<article>` línea 17)

- [ ] **Step 1: Importar `textoBuscable`**

En `src/components/producto/TarjetaProducto.astro` línea 3, añadir `textoBuscable` al import desde `@/lib/productos`:

```ts
import { localizedProductName, notaGlobal, tramoTexto, datosFiltrado, construirChips, productPath, textoBuscable, type Producto } from '@/lib/productos';
```

- [ ] **Step 2: Computar el texto buscable**

Tras la línea `const displayName = localizedProductName(p, locale);` (~línea 14):

```ts
const buscable = textoBuscable(p);
```

- [ ] **Step 3: Emitir el atributo**

En el `<article>` (línea 17), añadir `data-buscar`:

```astro
<article class="card" data-slug={p.slug} data-buscar={buscable} {...dataAttrs}>
```

- [ ] **Step 4: Verificar typecheck**

Run: `npx astro check 2>&1 | tail -5` (o `npx tsc --noEmit` si astro check no está configurado)
Expected: sin errores nuevos en TarjetaProducto.

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/TarjetaProducto.astro
git commit -m "feat(catalogo): card emite data-buscar (nombre+marca+idealPara)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: búsqueda lee `data-buscar` + debounce

**Files:**
- Modify: `src/components/producto/CatalogoProductos.astro` — bloque `<script>`: `coincide` (líneas 384-389) y handler de búsqueda (líneas 600-606); placeholder (líneas 82-83).

- [ ] **Step 1: Ampliar placeholder ES/EN**

En `CatalogoProductos.astro` líneas 82-83, cambiar el placeholder a incluir "uso":

```astro
    <input type="search" class="cat-search-input" data-busqueda
      placeholder={isEn ? 'Search by name, brand or use…' : 'Buscar por nombre, marca o uso…'} aria-label={isEn ? 'Search products' : 'Buscar productos'} autocomplete="off" />
```

- [ ] **Step 2: `coincide` lee `data-buscar`**

Reemplazar la función `coincide` (líneas 384-389) por:

```ts
    // ----- Búsqueda -----
    const coincide = (card: HTMLElement): boolean => {
      if (!busqueda) return true;
      return (card.dataset.buscar ?? '').includes(busqueda);
    };
```

- [ ] **Step 3: Debounce en el input**

Reemplazar el bloque de búsqueda (líneas 600-606) por:

```ts
    // ----- Búsqueda (con debounce) -----
    let busquedaTimer: ReturnType<typeof setTimeout> | undefined;
    const aplicarBusqueda = () => {
      busqueda = norm(busquedaInput?.value ?? '');
      applyFilters();
    };
    busquedaInput?.addEventListener('input', () => {
      clearTimeout(busquedaTimer);
      busquedaTimer = setTimeout(aplicarBusqueda, 150);
    });
    busquedaInput?.addEventListener('search', () => { // botón ✕ nativo: inmediato
      clearTimeout(busquedaTimer);
      aplicarBusqueda();
    });
```

- [ ] **Step 4: Build para verificar JS válido y CSP**

Run: `npm run build 2>&1 | tail -15`
Expected: build OK; `public/_headers` regenerado con nuevo hash del script del catálogo.

- [ ] **Step 5: Verificar comportamiento (manual)**

`npm run preview` y comprobar: escribir "alta" filtra por idealPara; ✕ limpia; sin errores en consola. (Si no se verifica en vivo, confiar en build + tests de `textoBuscable`.)

- [ ] **Step 6: Commit (CSP en Task 7)**

El hash de `public/_headers` se decide en Task 7 (puede mezclarse con WIP i18n). Aquí commitear solo el componente:

```bash
git add src/components/producto/CatalogoProductos.astro
git commit -m "feat(catalogo): búsqueda por data-buscar (incluye idealPara) + debounce

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: panel "Más filtros" con grupos `<details>`

**Files:**
- Modify: `src/components/producto/CatalogoProductos.astro` — frontmatter (imports línea 3-4, tras `filtros` línea 23, `panelConfig` líneas 67-73 SIN cambios), markup `.cat-pills` (líneas 91-145), CSS (`<style>`), JS toggle del panel.

> Reusa el markup de píldoras/popover actual **sin cambiar su lógica**. Se reparte ese markup en: rápidos (fuera del panel) y grupos (dentro de `<details>`). `panelConfig.filtros` sigue mapeando `filtros` (todos), porque el JS runtime necesita la config de cada filtro por `id`.

- [ ] **Step 1: Importar y agrupar en el frontmatter**

En `CatalogoProductos.astro` líneas 3-4, añadir `agruparFiltros` y `GRUPOS_FILTRO`:

```ts
import { getTipoConfig, GRUPOS_FILTRO } from '@/lib/tipos';
import { claveData, opcionesMarca, filtrosVisibles, agruparFiltros, comparePath, localizedTipoSlug } from '@/lib/productos';
```

Tras la línea 23 (`const filtros = ...`):

```ts
const { rapidos, grupos } = agruparFiltros(filtros, GRUPOS_FILTRO);
const grupoLabel = (g: (typeof grupos)[number]) => (isEn ? g.etiquetaEn : g.etiqueta);
```

NO cambiar `panelConfig` (líneas 67-73): sigue usando `filtros.map(...)` con todos los filtros.

- [ ] **Step 2: Reescribir el contenido de `.cat-pills`**

Reemplazar el contenido de `<div class="cat-pills" data-pills>` (líneas 91-145). El cuerpo de cada filtro `f` es EXACTAMENTE el de las líneas 93-135 actuales. Estructura nueva:

```astro
    <div class="cat-pills" data-pills>
      {rapidos.map((f) => (
        f.control === 'check' ? (
          <button class="cat-pill cat-pill--toggle" type="button"
            data-pill={f.id} data-pill-tipo="toggle" aria-pressed="false">{tr(f.etiqueta)}</button>
        ) : (
          <div class="cat-facet" data-facet={f.id}>
            <button class="cat-pill" type="button" data-pill={f.id} data-pill-tipo="dropdown"
              aria-expanded="false" aria-controls={`pop-${f.id}`}>
              <span class="cat-pill-label">{tr(f.etiqueta)}</span>
              <span class="cat-pill-val" data-pill-val hidden></span>
              <span class="cat-pill-caret" aria-hidden="true">▾</span>
            </button>
            <div class="cat-pop" id={`pop-${f.id}`} data-pop={f.id} role="group" aria-label={tr(f.etiqueta)} hidden>
              {f.control === 'rango' ? (
                <div class="cat-seg">
                  {valoresRango(f).map((v) => (
                    <button class="cat-seg-btn" type="button" data-opt={v}>{etiquetaRango(f, v)}</button>
                  ))}
                </div>
              ) : f.id === 'marca' ? (
                <ul class="cat-checks">
                  {marcas.map((m) => (
                    <li>
                      <label class="cat-check">
                        <input type="checkbox" data-opt={m.valor} />
                        <span class="cat-check-txt">{m.valor}</span>
                        <span class="cat-check-n">{m.n}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div class="cat-opts">
                  {(f.opciones ?? []).filter((o) => o.valor !== '' && o.valor !== '0').map((o) => (
                    <button class="cat-opt" type="button" data-opt={o.valor}>{tr(o.etiqueta)}</button>
                  ))}
                </div>
              )}
              <div class="cat-pop-foot">
                <button class="cat-pop-clear" type="button" data-pop-clear>{isEn ? 'Remove' : 'Quitar'}</button>
              </div>
            </div>
          </div>
        )
      ))}

      {grupos.length > 0 && (
        <button class="cat-pill cat-morebtn" type="button" data-more-toggle
          aria-expanded="false" aria-controls="cat-morepanel">
          {isEn ? 'More filters' : 'Más filtros'}<span class="cat-mobn" data-more-n hidden>0</span>
        </button>
      )}

      <div class="cat-morepanel" id="cat-morepanel" data-more-panel hidden>
        {grupos.map((g) => (
          <details class="cat-group" open>
            <summary class="cat-group-sum">{grupoLabel(g)}</summary>
            <div class="cat-group-body">
              {g.filtros.map((f) => (
                f.control === 'check' ? (
                  <button class="cat-pill cat-pill--toggle" type="button"
                    data-pill={f.id} data-pill-tipo="toggle" aria-pressed="false">{tr(f.etiqueta)}</button>
                ) : (
                  <div class="cat-facet" data-facet={f.id}>
                    <button class="cat-pill" type="button" data-pill={f.id} data-pill-tipo="dropdown"
                      aria-expanded="false" aria-controls={`pop-${f.id}`}>
                      <span class="cat-pill-label">{tr(f.etiqueta)}</span>
                      <span class="cat-pill-val" data-pill-val hidden></span>
                      <span class="cat-pill-caret" aria-hidden="true">▾</span>
                    </button>
                    <div class="cat-pop" id={`pop-${f.id}`} data-pop={f.id} role="group" aria-label={tr(f.etiqueta)} hidden>
                      {f.control === 'rango' ? (
                        <div class="cat-seg">
                          {valoresRango(f).map((v) => (
                            <button class="cat-seg-btn" type="button" data-opt={v}>{etiquetaRango(f, v)}</button>
                          ))}
                        </div>
                      ) : (
                        <div class="cat-opts">
                          {(f.opciones ?? []).filter((o) => o.valor !== '' && o.valor !== '0').map((o) => (
                            <button class="cat-opt" type="button" data-opt={o.valor}>{tr(o.etiqueta)}</button>
                          ))}
                        </div>
                      )}
                      <div class="cat-pop-foot">
                        <button class="cat-pop-clear" type="button" data-pop-clear>{isEn ? 'Remove' : 'Quitar'}</button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </details>
        ))}
      </div>

      <label class="cat-pill cat-pill--orden">
        <span>{isEn ? 'Sort' : 'Ordenar'}</span>
        <select data-orden>
          {ordenaciones.map((o) => <option value={o.id}>{tr(o.etiqueta)}</option>)}
        </select>
      </label>

      <button class="cat-verres" type="button" data-ver-res>{isEn ? 'Show' : 'Ver'} <span data-ver-n>{productos.length}</span> {isEn ? 'results' : 'resultados'}</button>
    </div>
```

> El cuerpo del panel omite la rama `f.id === 'marca'` porque marca es rápido; ningún filtro agrupado usa lista de marcas.

- [ ] **Step 3: CSS del panel y grupos**

Añadir al `<style>` tras la regla `.cat-pop-clear` (~línea 242), antes de `/* Chips activos */`:

```css
  /* Panel "Más filtros" */
  .cat-morebtn { gap: 0.4rem; }
  .cat-morebtn[aria-expanded='true'] { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--bg)); }
  .cat-morepanel {
    flex-basis: 100%; order: 50; margin-top: 0.6rem; padding: 0.9rem;
    border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-muted);
    display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.8rem 1.2rem;
  }
  .cat-group { border: 0; }
  .cat-group-sum { cursor: pointer; font-weight: 700; font-size: 0.86rem; padding: 0.2rem 0; }
  .cat-group-sum:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .cat-group-body { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
```

- [ ] **Step 4: JS — toggle del panel y contador**

En el `<script>`, definir el bloque del panel ANTES de la primera llamada a `applyFilters()` (línea 701). Colocarlo justo tras el bloque del drawer móvil (`verResBtn?.addEventListener(...)`, ~línea 632):

```ts
    // ----- Panel "Más filtros" -----
    const moreToggle = root.querySelector<HTMLButtonElement>('[data-more-toggle]');
    const morePanel = root.querySelector<HTMLElement>('[data-more-panel]');
    const moreN = root.querySelector<HTMLElement>('[data-more-n]');
    const idsPanel = new Set(
      Array.from(root.querySelectorAll<HTMLElement>('[data-more-panel] [data-pill]')).map((b) => b.dataset.pill || '')
    );
    moreToggle?.addEventListener('click', () => {
      const abierto = moreToggle.getAttribute('aria-expanded') === 'true';
      moreToggle.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      if (morePanel) morePanel.hidden = abierto;
    });
    const actualizarMoreN = () => {
      if (!moreN) return;
      const n = Object.keys(estado).filter((id) => idsPanel.has(id)).length;
      moreN.textContent = String(n);
      moreN.hidden = n === 0;
    };
```

En `renderEstado()`, junto al bloque del contador móvil (~línea 515, antes de cerrar la función), añadir:

```ts
      actualizarMoreN();
```

> `renderEstado` referencia `actualizarMoreN` por closure; como el bloque del panel se define antes de la primera llamada a `applyFilters()` (que es quien dispara `renderEstado`), la referencia ya existe en tiempo de ejecución. Si el linter avisa de "usado antes de declarar", mover el bloque del panel arriba del primer `applyFilters()`.

- [ ] **Step 5: Build**

Run: `npm run build 2>&1 | tail -15`
Expected: build OK, sin errores TS; `_headers` con nuevo hash del catálogo.

- [ ] **Step 6: Verificación manual (recomendada)**

`npm run preview`: "Más filtros" abre/cierra el panel; cada grupo pliega/despliega; aplicar un filtro del panel actualiza chips y el contador (N) del botón; "Limpiar todo" resetea; móvil dentro del drawer; teclado (Tab/Enter/Escape). ES e inglés (`/catalogo/silla/` y `/en/catalog/chairs/`).

- [ ] **Step 7: Commit**

```bash
git add src/components/producto/CatalogoProductos.astro
git commit -m "feat(catalogo): grupos de filtros plegables en panel Más filtros (ES/EN)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: cierre — gates + CSP + merge

**Files:**
- Posible: `public/_headers` (solo el hash del catálogo)

- [ ] **Step 1: Gates completos**

```bash
npm run validate:productos   # 77 OK
npm test                     # todos verdes
npm run build                # build OK
```

- [ ] **Step 2: Revisar diff de `public/_headers`**

Run: `git diff public/_headers`
- Si el diff es **solo** el cambio de hash del script del catálogo → `git add public/_headers` + commit.
- Si el diff mezcla cambios del WIP i18n → **NO** commitear `_headers` entero; consultar con el usuario qué hash corresponde al catálogo y aislarlo.

- [ ] **Step 3: Verificar árbol limpio de lo ajeno**

Run: `git status --short`
Expected: solo archivos de esta feature. El WIP i18n (astro.config.mjs, src/i18n/, [locale], etc.) NO debe estar staged.

- [ ] **Step 4: Merge a main (no-ff)**

```bash
git fetch
git merge-base --is-ancestor origin/main main && echo "OK ancestro" || echo "REBASE: mover main a origin/main antes de mergear"
git checkout main
git merge --no-ff feat/catalogo-busqueda-filtros -m "merge: Task 11 búsqueda + grupos de filtros del catálogo"
```

El push lo hace el usuario.

---

## Self-Review

**Spec coverage:**
- Búsqueda nombre+marca+idealPara → Task 1 (`textoBuscable`) + Task 4 (card) + Task 5 (JS). ✓
- Debounce ~150ms → Task 5 Step 3. ✓
- Sin tags → ninguna task los lee. ✓
- Grupos en tipos → Task 2. ✓
- `agruparFiltros` + omite vacíos → Task 3. ✓
- Patrón híbrido (rápidos + panel `<details>`) → Task 6. ✓
- Paridad ES/EN → Task 5 Step 1 (placeholder), Task 6 (`grupoLabel`, etiquetas vía `tr`/`isEn`). ✓
- Sin tocar pasaFiltro/applyFilters/chips/comparador → Tasks 5-6 no los modifican; estado plano por `id`. ✓
- A11y (`<details>`, aria-expanded/controls, Escape) → Task 6 Steps 2-4. ✓
- CSP solo hash catálogo → Task 7 Step 2. ✓
- Grupos vacíos no renderizan → Task 3 (lógica) + Task 6 (markup `grupos.map`). ✓

**Placeholder scan:** sin TBD/TODO; todo el código está completo. ✓

**Type consistency:** `textoBuscable(Pick<...>)`, `agruparFiltros(FiltroConfig[], GrupoFiltro[]) → {rapidos, grupos: GrupoFiltrosRender[]}`, `GRUPOS_FILTRO`/`GrupoFiltro` con `etiqueta`/`etiquetaEn`. `data-buscar` emitido (Task 4) y leído (Task 5). `[data-more-toggle]`/`[data-more-panel]`/`[data-more-n]` consistentes entre markup (Task 6 Step 2) y JS (Task 6 Step 4). ✓
