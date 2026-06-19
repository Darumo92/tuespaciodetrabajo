# Rediseño de filtros del catálogo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la fila plana de filtros del catálogo por una barra superior con búsqueda por texto, píldoras con popovers, filtro de marca multi-select, chips de filtros activos y auto-ocultado de facetas sin datos, sin cambiar el schema ni romper tests/validate/build.

**Architecture:** La lógica testeable (comparación `'en'`, opciones de marca, auto-ocultado, normalización de búsqueda) se extrae a funciones puras en `src/lib/productos.ts` con tests vitest. La capa visual se reescribe en `src/components/producto/CatalogoProductos.astro` (markup + CSS + script de módulo), reusando esas funciones y manteniendo intacta la barra de comparación. Verificación de integración por `npm run build` + Playwright.

**Tech Stack:** Astro 5 (static), TypeScript, vitest, CSS plano con custom properties. Sin frameworks JS. CSP sin `unsafe-inline` (hashes regenerados en build).

**Spec:** `docs/superpowers/specs/2026-06-19-catalogo-filtros-rediseno-design.md`

**Rama:** `feat/megarecopilacion-sillas`. Commit por tarea (cohesionados a la feature; no mezclar cambios ajenos).

---

## Estructura de archivos

- **Modificar** `src/lib/tipos.ts` — añadir `'en'` a `Comparacion`; añadir filtro `marca`.
- **Modificar** `src/lib/productos.ts` — añadir `pasaEn`, `opcionesMarca`, `cuentaConDato`, `filtrosVisibles`, `normalizaTexto`, `coincideBusqueda`.
- **Modificar** `src/lib/productos.test.ts` — tests de las nuevas funciones; actualizar el assert de longitud de `datosFiltrado`.
- **Reescribir** `src/components/producto/CatalogoProductos.astro` — frontmatter, markup, CSS y script.

Ningún cambio en `src/content/config.ts`, YAML de productos, `TarjetaProducto.astro`, ni en la barra de comparación.

---

### Task 1: Comparación `'en'` + predicado puro `pasaEn`

**Files:**
- Modify: `src/lib/tipos.ts:5`
- Modify: `src/lib/productos.ts` (añadir export tras `valorComparacion`, ~línea 153)
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { pasaEn } from './productos';

describe('pasaEn (comparación multi-select)', () => {
  it('conjunto vacío no filtra (siempre visible)', () => {
    expect(pasaEn('IKEA', [])).toBe(true);
    expect(pasaEn('', [])).toBe(true);
  });
  it('visible si el valor está en el conjunto', () => {
    expect(pasaEn('IKEA', ['IKEA', 'Steelcase'])).toBe(true);
  });
  it('oculto si el valor no está en el conjunto', () => {
    expect(pasaEn('Hbada', ['IKEA', 'Steelcase'])).toBe(false);
    expect(pasaEn('', ['IKEA'])).toBe(false);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts -t pasaEn`
Expected: FAIL — `pasaEn is not a function` / import error.

- [ ] **Step 3: Implementar**

En `src/lib/tipos.ts` línea 5, cambiar:

```ts
export type Comparacion = 'max' | 'igual' | 'min' | 'check' | 'umbral';
```

por:

```ts
export type Comparacion = 'max' | 'igual' | 'min' | 'check' | 'umbral' | 'en';
```

En `src/lib/productos.ts`, tras la función `valorComparacion` (~línea 153), añadir:

```ts
/** comparación 'en': la card es visible si su valor está en el conjunto seleccionado.
 *  Conjunto vacío = sin filtrar (visible). */
export function pasaEn(cardValue: string, seleccion: string[]): boolean {
  if (seleccion.length === 0) return true;
  return seleccion.includes(cardValue);
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/productos.test.ts -t pasaEn`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tipos.ts src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): add 'en' comparison and pasaEn predicate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Filtro `marca` + `opcionesMarca`

**Files:**
- Modify: `src/lib/tipos.ts` (array `silla.filtros`, ~línea 69-89)
- Modify: `src/lib/productos.ts` (añadir export `opcionesMarca`)
- Test: `src/lib/productos.test.ts` (nuevo test + actualizar assert existente)

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { opcionesMarca } from './productos';

describe('opcionesMarca', () => {
  it('cuenta por marca y ordena por nº desc, luego alfabético', () => {
    const ps = [
      base({ slug: 'a', marca: 'IKEA' }),
      base({ slug: 'b', marca: 'IKEA' }),
      base({ slug: 'c', marca: 'Steelcase' }),
      base({ slug: 'd', marca: 'Hbada' }),
    ];
    expect(opcionesMarca(ps)).toEqual([
      { valor: 'IKEA', n: 2 },
      { valor: 'Hbada', n: 1 },
      { valor: 'Steelcase', n: 1 },
    ]);
  });
  it('ignora marca vacía', () => {
    expect(opcionesMarca([base({ marca: '' })])).toEqual([]);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts -t opcionesMarca`
Expected: FAIL — `opcionesMarca is not a function`.

- [ ] **Step 3: Implementar**

En `src/lib/productos.ts`, tras `pasaEn`, añadir:

```ts
/** Marcas presentes en el catálogo con su conteo, ordenadas por nº desc y luego alfabético. */
export function opcionesMarca(productos: Producto[]): { valor: string; n: number }[] {
  const conteo = new Map<string, number>();
  for (const p of productos) {
    if (!p.marca) continue;
    conteo.set(p.marca, (conteo.get(p.marca) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([valor, n]) => ({ valor, n }))
    .sort((a, b) => b.n - a.n || a.valor.localeCompare(b.valor));
}
```

En `src/lib/tipos.ts`, dentro de `silla.filtros`, insertar el filtro `marca` justo después del filtro `precio` (tras la línea que termina en `formatoSalida: 'tramoEuros' },`):

```ts
    { id: 'marca', etiqueta: 'Marca', control: 'select', comparacion: 'en', campo: 'marca' },
```

- [ ] **Step 4: Actualizar el assert de longitud que ahora rompe**

El test `datosFiltrado: silla` ahora emite además `data-c-marca`. En `src/lib/productos.test.ts`, dentro de `describe('datosFiltrado: silla')`, añadir la aserción del nuevo campo y subir la longitud:

```ts
    expect(d['data-c-marca']).toBe('X'); // productoSilla.marca
```

y cambiar:

```ts
    expect(Object.keys(d).length).toBe(9); // precio/peso comparten clave con sus ordenaciones
```

por:

```ts
    expect(Object.keys(d).length).toBe(10); // +marca; precio/peso comparten clave con sus ordenaciones
```

- [ ] **Step 5: Ejecutar toda la suite**

Run: `npm test`
Expected: PASS — todos los tests verdes (los 33 previos + nuevos de Task 1 y 2).

- [ ] **Step 6: Commit**

```bash
git add src/lib/tipos.ts src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): add brand facet (multi-select) and opcionesMarca

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Auto-ocultado de facetas (`cuentaConDato` + `filtrosVisibles`)

**Files:**
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { cuentaConDato, filtrosVisibles } from './productos';

describe('cuentaConDato', () => {
  it('cuenta productos con dato no nulo ni vacío', () => {
    const ps = [
      base({ specs: { tipo: 'silla', pesoMaxKg: 130 } as any }),
      base({ specs: { tipo: 'silla', pesoMaxKg: null } as any }),
      base({ specs: { tipo: 'silla' } as any }),
    ];
    expect(cuentaConDato(ps, 'specs.pesoMaxKg')).toBe(1);
  });
});

describe('filtrosVisibles', () => {
  const fEdad: FiltroConfig = { id: 'edad', etiqueta: '', control: 'select', comparacion: 'igual', campo: 'specs.edad' };
  const fSiempre: FiltroConfig = { id: 'marca', etiqueta: '', control: 'select', comparacion: 'en', campo: 'marca' };
  it('oculta facetas con menos de min datos, salvo las siempre visibles', () => {
    const ps = [base({ specs: { tipo: 'silla', edad: 5 } as any }), base({ specs: { tipo: 'silla' } as any })];
    const vis = filtrosVisibles([fEdad, fSiempre], ps, 3, ['marca']);
    expect(vis.map((f) => f.id)).toEqual(['marca']); // edad tiene 1 dato (<3) → oculto; marca siempre
  });
  it('muestra facetas con suficientes datos', () => {
    const ps = [
      base({ specs: { tipo: 'silla', edad: 1 } as any }),
      base({ specs: { tipo: 'silla', edad: 2 } as any }),
      base({ specs: { tipo: 'silla', edad: 3 } as any }),
    ];
    const vis = filtrosVisibles([fEdad], ps, 3, []);
    expect(vis.map((f) => f.id)).toEqual(['edad']);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts -t filtrosVisibles`
Expected: FAIL — funciones no definidas.

- [ ] **Step 3: Implementar**

En `src/lib/productos.ts`, tras `opcionesMarca`, añadir:

```ts
/** Nº de productos con dato no nulo ni vacío para una ruta de campo. */
export function cuentaConDato(productos: Producto[], campo: string): number {
  return productos.reduce((acc, p) => {
    const v = getCampo(p, campo);
    return acc + (v != null && v !== '' ? 1 : 0);
  }, 0);
}

/** Filtra los filtros a renderizar: oculta los que tienen < min productos con dato,
 *  salvo los ids en siempreVisibles. */
export function filtrosVisibles(
  filtros: FiltroConfig[],
  productos: Producto[],
  min: number,
  siempreVisibles: string[]
): FiltroConfig[] {
  return filtros.filter(
    (f) => siempreVisibles.includes(f.id) || cuentaConDato(productos, f.campo) >= min
  );
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/productos.test.ts -t "filtrosVisibles|cuentaConDato"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): auto-hide facets with insufficient data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Búsqueda (`normalizaTexto` + `coincideBusqueda`)

**Files:**
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { normalizaTexto, coincideBusqueda } from './productos';

describe('normalizaTexto', () => {
  it('minúsculas, sin acentos, recortado', () => {
    expect(normalizaTexto('  ERGONÓMICA  ')).toBe('ergonomica');
    expect(normalizaTexto('Långfjäll')).toBe('langfjall');
  });
});

describe('coincideBusqueda', () => {
  it('query vacía siempre coincide', () => {
    expect(coincideBusqueda('', 'Aeron', 'Herman Miller')).toBe(true);
  });
  it('coincide por substring sin acentos/mayúsculas', () => {
    expect(coincideBusqueda('ikea', 'MATCHSPEL', 'IKEA')).toBe(true);
    expect(coincideBusqueda('ergo', 'Silla Ergonómica', 'Hbada')).toBe(true);
  });
  it('no coincide si no está en ningún campo', () => {
    expect(coincideBusqueda('steelcase', 'Aeron', 'Herman Miller')).toBe(false);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts -t "normalizaTexto|coincideBusqueda"`
Expected: FAIL — funciones no definidas.

- [ ] **Step 3: Implementar**

En `src/lib/productos.ts`, tras `filtrosVisibles`, añadir (el rango Unicode son los diacríticos combinantes U+0300–U+036F):

```ts
/** minúsculas + sin diacríticos + recortado, para comparar búsquedas. */
export function normalizaTexto(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** true si la query (normalizada) aparece como substring en alguno de los campos. Query vacía = true. */
export function coincideBusqueda(query: string, ...campos: string[]): boolean {
  const q = normalizaTexto(query);
  if (!q) return true;
  return campos.some((c) => normalizaTexto(c).includes(q));
}
```

- [ ] **Step 4: Ejecutar toda la suite**

Run: `npm test`
Expected: PASS — todo verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): text search normalization helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Reescritura del componente `CatalogoProductos.astro`

Una sola reescritura cohesiva (frontmatter + markup + CSS + script en el mismo archivo). Se verifica por build + Playwright (no unit; la lógica testeable ya vive en `productos.ts`).

**Files:**
- Rewrite: `src/components/producto/CatalogoProductos.astro`

- [ ] **Step 1: Reescribir el archivo completo**

Sustituir TODO el contenido de `src/components/producto/CatalogoProductos.astro` por el bloque de código de referencia que sigue. Notas de implementación:
- El script reimplementa `norm` (paridad con `normalizaTexto`) y la lógica de comparación (paridad con `pasaEn` y las ramas existentes); es intencional para no introducir un import de módulo en el `<script>` del cliente. Las funciones puras de `productos.ts` cubren esa lógica con tests.
- El rango Unicode `[̀-ͯ]` en `norm` son los diacríticos combinantes.
- Ningún handler inline (`onclick=`): todos los listeners van por `addEventListener` para respetar la CSP.

```astro
---
import TarjetaProducto from './TarjetaProducto.astro';
import { getTipoConfig } from '@/lib/tipos';
import { claveData, opcionesMarca, filtrosVisibles } from '@/lib/productos';
import type { Producto } from '@/lib/productos';

interface Props {
  productos: Producto[];
  tipo: string;
}

const { productos, tipo } = Astro.props;
const cfg = getTipoConfig(tipo);
const ordenaciones = cfg?.ordenaciones ?? [];

// Auto-ocultado: una faceta sólo se muestra si >= MIN_DATOS_FACETA productos tienen ese dato.
// precio y marca siempre visibles (datos presentes por definición).
const MIN_DATOS_FACETA = 3;
const SIEMPRE_VISIBLES = ['precio', 'marca'];
const filtros = cfg ? filtrosVisibles(cfg.filtros, productos, MIN_DATOS_FACETA, SIEMPRE_VISIBLES) : [];

// Opciones dinámicas de marca (no es un enum fijo).
const marcas = opcionesMarca(productos);

// Para facetas de rango: lista de valores discretos (segmentado).
const valoresRango = (f: (typeof filtros)[number]) => {
  const min = f.min ?? 0;
  const max = f.max ?? min;
  const step = f.step ?? 1;
  const out: number[] = [];
  for (let v = min; v <= max; v += step) out.push(v);
  return out;
};
const etiquetaRango = (f: (typeof filtros)[number], v: number) =>
  f.formatoSalida === 'tramoEuros' ? '€'.repeat(v) : String(v);

const panelConfig = {
  filtros: filtros.map((f) => ({
    id: f.id, control: f.control, comparacion: f.comparacion, clave: claveData(f.campo),
    umbral: f.umbral, formatoSalida: f.formatoSalida, max: f.max, etiqueta: f.etiqueta,
  })),
  ordenaciones: ordenaciones.map((o) => ({ id: o.id, clave: claveData(o.campo), direccion: o.direccion })),
};
const labelPlural = (cfg?.labelPlural ?? 'productos').toLowerCase();
---

<section class="catalogo" data-catalogo-root data-tipo={tipo} data-catalogo-config={JSON.stringify(panelConfig)}>
  <div class="cat-search">
    <span class="cat-search-icon" aria-hidden="true">🔍</span>
    <input type="search" class="cat-search-input" data-busqueda
      placeholder="Buscar por nombre o marca…" aria-label="Buscar productos" autocomplete="off" />
  </div>

  <div class="cat-bar">
    <button class="cat-mobtoggle" type="button" data-mob-toggle aria-expanded="false">
      Filtrar<span class="cat-mobn" data-mob-n hidden>0</span>
    </button>

    <div class="cat-pills" data-pills>
      {filtros.map((f) => (
        f.control === 'check' ? (
          <button class="cat-pill cat-pill--toggle" type="button"
            data-pill={f.id} data-pill-tipo="toggle" aria-pressed="false">{f.etiqueta}</button>
        ) : (
          <div class="cat-facet" data-facet={f.id}>
            <button class="cat-pill" type="button" data-pill={f.id} data-pill-tipo="dropdown"
              aria-expanded="false" aria-controls={`pop-${f.id}`}>
              <span class="cat-pill-label">{f.etiqueta}</span>
              <span class="cat-pill-val" data-pill-val hidden></span>
              <span class="cat-pill-caret" aria-hidden="true">▾</span>
            </button>
            <div class="cat-pop" id={`pop-${f.id}`} data-pop={f.id} role="group" aria-label={f.etiqueta} hidden>
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
                    <button class="cat-opt" type="button" data-opt={o.valor}>{o.etiqueta}</button>
                  ))}
                </div>
              )}
              <div class="cat-pop-foot">
                <button class="cat-pop-clear" type="button" data-pop-clear>Quitar</button>
              </div>
            </div>
          </div>
        )
      ))}

      <label class="cat-pill cat-pill--orden">
        <span>Ordenar</span>
        <select data-orden>
          {ordenaciones.map((o) => <option value={o.id}>{o.etiqueta}</option>)}
        </select>
      </label>
    </div>
  </div>

  <div class="cat-chips" data-chips hidden>
    <button class="cat-clear" type="button" data-clear-all>Limpiar todo</button>
  </div>

  <p class="catalogo-count" aria-live="polite">
    <span class="catalogo-n">{productos.length}</span>
    <span>{labelPlural} · marca entre 2 y 4 casillas para comparar</span>
  </p>

  <div class="catalogo-grid">
    {productos.map((producto) => <TarjetaProducto producto={producto} />)}
  </div>

  <p class="catalogo-vacio" hidden>Ningún producto cumple esos filtros. Prueba a relajar alguno.</p>

  <div class="cmp-bar" hidden>
    <span class="cmp-status">
      <strong class="cmp-n">0</strong>
      <span class="cmp-copy">seleccionados</span>
    </span>
    <a class="cmp-go" href={`/comparar/${tipo}/`} aria-disabled="true">Comparar</a>
    <button class="cmp-clear" type="button">Limpiar</button>
  </div>
</section>

<style>
  .catalogo { position: relative; padding-bottom: 4.5rem; }

  /* Búsqueda */
  .cat-search { position: relative; max-width: 22rem; margin-bottom: 1rem; }
  .cat-search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); font-size: 0.9rem; opacity: 0.6; }
  .cat-search-input {
    width: 100%; min-height: 2.5rem; padding: 0 0.8rem 0 2.1rem;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--bg); color: var(--ink); font: inherit;
  }
  .cat-search-input:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

  /* Barra de píldoras */
  .cat-bar { margin-bottom: 0.9rem; }
  .cat-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .cat-facet { position: relative; }

  .cat-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    min-height: 2.3rem; padding: 0.35rem 0.85rem;
    border: 1px solid var(--border); border-radius: 999px;
    background: var(--bg); color: var(--ink);
    font: inherit; font-size: 0.84rem; font-weight: 650; cursor: pointer;
    transition: border-color var(--dur-hover) var(--ease-out), background var(--dur-hover) var(--ease-out);
  }
  .cat-pill:hover { border-color: var(--border-strong); }
  .cat-pill:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .cat-pill.is-active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--bg)); color: var(--ink); }
  .cat-pill--toggle[aria-pressed='true'] { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--bg)); }
  .cat-pill-val { font-weight: 750; color: var(--accent); }
  .cat-pill-caret { font-size: 0.7rem; opacity: 0.7; }

  .cat-pill--orden { gap: 0.35rem; padding-right: 0.4rem; cursor: default; }
  .cat-pill--orden span { color: var(--ink-muted); font-weight: 650; }
  .cat-pill--orden select { border: 0; background: transparent; color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; }
  .cat-pill--orden select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* Popover */
  .cat-pop {
    position: absolute; top: calc(100% + 0.4rem); left: 0; z-index: 30;
    min-width: 12rem; max-width: 16rem; padding: 0.8rem;
    border: 1px solid var(--border-strong); border-radius: var(--radius);
    background: var(--bg); box-shadow: 0 10px 30px color-mix(in srgb, var(--ink) 18%, transparent);
  }
  .cat-seg { display: flex; gap: 0.3rem; }
  .cat-seg-btn {
    flex: 1; min-height: 2rem; padding: 0 0.4rem;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--bg); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer;
  }
  .cat-seg-btn.is-on { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }

  .cat-opts { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .cat-opt {
    min-height: 2rem; padding: 0.3rem 0.7rem;
    border: 1px solid var(--border); border-radius: 999px;
    background: var(--bg); color: var(--ink); font: inherit; font-size: 0.82rem; font-weight: 650; cursor: pointer;
  }
  .cat-opt.is-on { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }

  .cat-checks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.15rem; max-height: 15rem; overflow-y: auto; }
  .cat-check { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.2rem; font-size: 0.84rem; cursor: pointer; }
  .cat-check input { width: 1rem; height: 1rem; accent-color: var(--accent); }
  .cat-check-txt { flex: 1; }
  .cat-check-n { color: var(--ink-muted); font-size: 0.78rem; }

  .cat-pop-foot { margin-top: 0.7rem; padding-top: 0.6rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  .cat-pop-clear { border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; }

  /* Chips activos */
  .cat-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-bottom: 0.9rem; }
  .cat-chip {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.3rem 0.25rem 0.65rem;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
    border-radius: 999px; background: color-mix(in srgb, var(--accent) 8%, var(--bg));
    font-size: 0.78rem; font-weight: 650; color: var(--ink);
  }
  .cat-chip-x { display: inline-flex; align-items: center; justify-content: center; width: 1.1rem; height: 1.1rem; border: 0; border-radius: 999px; background: transparent; color: var(--ink-muted); font: inherit; cursor: pointer; }
  .cat-chip-x:hover { color: var(--ink); }
  .cat-clear { border: 0; background: transparent; color: var(--accent); font: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-left: 0.2rem; }

  .catalogo-count { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0 0 1rem; font-size: 0.86rem; color: var(--ink-muted); }
  .catalogo-count .catalogo-n { font-weight: 750; color: var(--ink); }

  .catalogo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 1rem; }

  .catalogo-vacio { margin: 1.25rem 0 0; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-muted); color: var(--ink-muted); }

  /* Botón móvil "Filtrar": oculto en escritorio */
  .cat-mobtoggle { display: none; }
  .cat-mobn {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 1.2rem; height: 1.2rem; margin-left: 0.4rem; padding: 0 0.3rem;
    border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 0.72rem; font-weight: 750;
  }

  /* Barra de comparación (sin cambios) */
  .cmp-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; display: flex; align-items: center; justify-content: center; gap: 0.85rem; padding: 0.78rem max(1rem, env(safe-area-inset-right)) calc(0.78rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left)); background: var(--ink); color: var(--bg); box-shadow: 0 -1px 0 var(--border-strong); }
  .cmp-status { display: inline-flex; align-items: baseline; gap: 0.32rem; min-width: 0; font-size: 0.88rem; }
  .cmp-status strong { font-family: var(--font-display); font-size: 1rem; }
  .cmp-go, .cmp-clear { min-height: 2.25rem; border-radius: var(--radius); padding: 0.48rem 0.9rem; font: inherit; font-weight: 750; white-space: nowrap; }
  .cmp-go { display: inline-flex; align-items: center; color: var(--accent-ink); background: var(--accent); text-decoration: none; }
  .cmp-go[aria-disabled='true'] { opacity: 0.55; pointer-events: none; }
  .cmp-clear { border: 1px solid color-mix(in srgb, var(--bg) 35%, transparent); background: transparent; color: var(--bg); cursor: pointer; }
  .cmp-clear:hover, .cmp-clear:focus-visible { border-color: var(--bg); }
  .cmp-go, .cmp-clear { transition: transform var(--dur-press) var(--ease-out); }
  .cmp-go:active, .cmp-clear:active { transform: scale(0.97); }

  /* Móvil: drawer de filtros */
  @media (max-width: 768px) {
    .catalogo { padding-bottom: 8.5rem; }
    .cat-mobtoggle {
      display: inline-flex; align-items: center; min-height: 2.5rem; padding: 0.4rem 1rem;
      border: 1px solid var(--border-strong); border-radius: var(--radius);
      background: var(--bg); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer;
    }
    .cat-pills {
      position: fixed; inset: 0; z-index: 60; display: none;
      flex-direction: column; align-items: stretch; gap: 0.7rem;
      padding: 1.1rem; background: var(--bg); overflow-y: auto;
    }
    .cat-bar.is-open .cat-pills { display: flex; }
    .cat-bar.is-open .cat-pills::after {
      content: 'Ver resultados'; order: 99; position: sticky; bottom: 0;
      margin-top: auto; padding: 0.8rem; text-align: center;
      background: var(--accent); color: var(--accent-ink); border-radius: var(--radius); font-weight: 750; cursor: pointer;
    }
    .cat-facet { width: 100%; }
    .cat-pill { width: 100%; justify-content: space-between; }
    .cat-pop { position: static; min-width: 0; max-width: none; box-shadow: none; border: 0; border-left: 2px solid var(--border); border-radius: 0; margin: 0.2rem 0 0.4rem 0.4rem; }
    .cmp-bar { bottom: calc(56px + env(safe-area-inset-bottom, 0px)); padding-bottom: 0.78rem; }
  }

  @media (max-width: 560px) {
    .catalogo { padding-bottom: 10.5rem; }
    .cmp-bar { flex-wrap: wrap; justify-content: space-between; gap: 0.55rem; }
    .cmp-status { width: 100%; justify-content: center; }
    .cmp-go, .cmp-clear { flex: 1 1 8rem; justify-content: center; text-align: center; }
  }
</style>

<script>
  type FiltroRT = {
    id: string; control: string; comparacion: string; clave: string;
    umbral?: number; formatoSalida?: string; max?: number; etiqueta: string;
  };
  type OrdenRT = { id: string; clave: string; direccion: 'asc' | 'desc' };

  const roots = document.querySelectorAll<HTMLElement>('[data-catalogo-root]');

  roots.forEach((root) => {
    const tipo = root.dataset.tipo || '';
    const grid = root.querySelector<HTMLElement>('.catalogo-grid');
    if (!grid) return;

    let cfg: { filtros: FiltroRT[]; ordenaciones: OrdenRT[] };
    try {
      cfg = JSON.parse(root.dataset.catalogoConfig || '{"filtros":[],"ordenaciones":[]}');
    } catch {
      return;
    }
    const filtros = cfg.filtros || [];
    const ordenaciones = cfg.ordenaciones || [];
    const filtroDe = (id: string) => filtros.find((f) => f.id === id);

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.card'));
    const ordenSel = root.querySelector<HTMLSelectElement>('[data-orden]');
    const nOut = root.querySelector<HTMLElement>('.catalogo-n');
    const vacio = root.querySelector<HTMLElement>('.catalogo-vacio');
    const busquedaInput = root.querySelector<HTMLInputElement>('[data-busqueda]');
    const chipsBox = root.querySelector<HTMLElement>('[data-chips]');
    const clearAllBtn = root.querySelector<HTMLButtonElement>('[data-clear-all]');
    const mobToggle = root.querySelector<HTMLButtonElement>('[data-mob-toggle]');
    const mobN = root.querySelector<HTMLElement>('[data-mob-n]');
    const bar = root.querySelector<HTMLElement>('.cat-bar');

    const dataKey = (clave: string) => 'c' + clave.charAt(0).toUpperCase() + clave.slice(1);
    const readCard = (card: HTMLElement, clave: string) => card.dataset[dataKey(clave)];
    const toNumber = (v: string | undefined): number | null => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const compare = (x: number, y: number) => (x === y ? 0 : x < y ? -1 : 1);

    // Estado de filtros: id -> valor (number | string | string[] | true)
    const estado: Record<string, number | string | string[] | true> = {};
    let busqueda = '';

    const etiquetaValor = (f: FiltroRT, v: number | string | string[] | true): string => {
      if (f.control === 'rango') {
        const n = typeof v === 'number' ? v : Number(v);
        const txt = f.formatoSalida === 'tramoEuros' ? '€'.repeat(n) : String(n);
        return f.comparacion === 'min' ? `Desde ${txt}` : `Hasta ${txt}`;
      }
      if (Array.isArray(v)) return `· ${v.length}`;
      return String(v);
    };

    // ----- Búsqueda -----
    const coincide = (card: HTMLElement): boolean => {
      if (!busqueda) return true;
      const nombre = card.querySelector('.card-name')?.textContent ?? '';
      const marca = card.querySelector('.card-brand')?.textContent ?? '';
      return norm(nombre).includes(busqueda) || norm(marca).includes(busqueda);
    };

    // ----- Aplicación de filtros -----
    const pasaFiltro = (card: HTMLElement, f: FiltroRT): boolean => {
      const sel = estado[f.id];
      if (sel == null) return true;
      const cv = readCard(card, f.clave) ?? '';
      if (f.comparacion === 'max') {
        const n = toNumber(cv);
        return n == null || n <= Number(sel);
      }
      if (f.comparacion === 'min') {
        const n = toNumber(cv);
        return n == null || Number(sel) <= n;
      }
      if (f.comparacion === 'igual') {
        return cv === String(sel);
      }
      if (f.comparacion === 'en') {
        const arr = Array.isArray(sel) ? sel : [];
        return arr.length === 0 || arr.includes(cv);
      }
      if (f.comparacion === 'check') {
        return sel !== true || cv === '1';
      }
      if (f.comparacion === 'umbral') {
        const n = toNumber(cv);
        return sel !== true || (n != null && n >= (f.umbral ?? Infinity));
      }
      return true;
    };

    const applyFilters = () => {
      let visibles = 0;
      cards.forEach((card) => {
        const visible = coincide(card) && filtros.every((f) => pasaFiltro(card, f));
        card.hidden = !visible;
        if (visible) visibles += 1;
      });

      const orden = ordenaciones.find((o) => o.id === ordenSel?.value) || ordenaciones[0];
      if (orden) {
        const worst = orden.direccion === 'asc' ? Infinity : -Infinity;
        cards.filter((c) => !c.hidden).sort((a, b) => {
          const x = toNumber(readCard(a, orden.clave)) ?? worst;
          const y = toNumber(readCard(b, orden.clave)) ?? worst;
          return orden.direccion === 'asc' ? compare(x, y) : compare(y, x);
        }).forEach((c) => grid.appendChild(c));
      }

      if (nOut) nOut.textContent = String(visibles);
      if (vacio) vacio.hidden = visibles > 0;
      renderEstado();
    };

    // ----- Render del estado en píldoras y chips -----
    const nActivos = () => Object.keys(estado).length + (busqueda ? 1 : 0);

    const etiquetaOpcion = (filtroId: string, valor: string): string => {
      const btn = root.querySelector<HTMLElement>(`[data-pop="${filtroId}"] [data-opt="${CSS.escape(valor)}"]`);
      return btn?.textContent?.trim() || valor;
    };

    const renderEstado = () => {
      // píldoras
      filtros.forEach((f) => {
        const pill = root.querySelector<HTMLElement>(`[data-pill="${f.id}"]`);
        if (!pill) return;
        const sel = estado[f.id];
        const activo = sel != null && !(Array.isArray(sel) && sel.length === 0);
        if (pill.dataset.pillTipo === 'toggle') {
          pill.setAttribute('aria-pressed', activo ? 'true' : 'false');
        } else {
          pill.classList.toggle('is-active', activo);
          const valEl = pill.querySelector<HTMLElement>('[data-pill-val]');
          if (valEl) {
            if (activo) { valEl.textContent = etiquetaValor(f, sel as never); valEl.hidden = false; }
            else { valEl.textContent = ''; valEl.hidden = true; }
          }
        }
      });

      // chips
      if (chipsBox && clearAllBtn) {
        chipsBox.querySelectorAll('.cat-chip').forEach((c) => c.remove());
        const frag: HTMLElement[] = [];
        const addChip = (etiqueta: string, onRemove: () => void) => {
          const chip = document.createElement('span');
          chip.className = 'cat-chip';
          chip.append(document.createTextNode(etiqueta));
          const x = document.createElement('button');
          x.type = 'button'; x.className = 'cat-chip-x'; x.textContent = '✕';
          x.setAttribute('aria-label', `Quitar filtro: ${etiqueta}`);
          x.addEventListener('click', () => { onRemove(); applyFilters(); });
          chip.append(x);
          frag.push(chip);
        };
        if (busqueda && busquedaInput) {
          addChip(`«${busquedaInput.value.trim()}»`, () => { busqueda = ''; busquedaInput.value = ''; });
        }
        filtros.forEach((f) => {
          const sel = estado[f.id];
          if (sel == null) return;
          if (Array.isArray(sel)) {
            sel.forEach((val) => addChip(val, () => {
              const arr = (estado[f.id] as string[]).filter((x) => x !== val);
              if (arr.length) estado[f.id] = arr; else delete estado[f.id];
              syncControles(f.id);
            }));
          } else {
            const etiqueta = f.control === 'rango' || f.comparacion === 'check' || f.comparacion === 'umbral'
              ? `${f.etiqueta}: ${etiquetaValor(f, sel)}`
              : etiquetaOpcion(f.id, String(sel));
            addChip(etiqueta, () => { delete estado[f.id]; syncControles(f.id); });
          }
        });
        frag.forEach((c) => chipsBox.insertBefore(c, clearAllBtn));
        chipsBox.hidden = frag.length === 0;
      }

      // contador móvil
      if (mobN) {
        const n = nActivos();
        mobN.textContent = String(n);
        mobN.hidden = n === 0;
      }
    };

    // Re-sincroniza los controles visuales de una faceta con el estado (tras quitar un chip).
    const syncControles = (filtroId: string) => {
      const pop = root.querySelector<HTMLElement>(`[data-pop="${filtroId}"]`);
      if (!pop) return;
      const sel = estado[filtroId];
      pop.querySelectorAll<HTMLElement>('[data-opt]').forEach((el) => {
        const val = el.dataset.opt ?? '';
        let on = false;
        if (Array.isArray(sel)) on = sel.includes(val);
        else if (sel != null) on = String(sel) === val;
        if (el instanceof HTMLInputElement) el.checked = on;
        else el.classList.toggle('is-on', on);
      });
    };

    // ----- Popovers -----
    const cerrarPopovers = () => {
      root.querySelectorAll<HTMLElement>('.cat-pop').forEach((p) => (p.hidden = true));
      root.querySelectorAll<HTMLElement>('[data-pill-tipo="dropdown"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    };

    root.querySelectorAll<HTMLButtonElement>('[data-pill]').forEach((pill) => {
      const id = pill.dataset.pill || '';
      const f = filtroDe(id);
      if (!f) return;

      if (pill.dataset.pillTipo === 'toggle') {
        pill.addEventListener('click', () => {
          if (estado[id]) delete estado[id]; else estado[id] = true;
          applyFilters();
        });
        return;
      }

      const pop = root.querySelector<HTMLElement>(`#pop-${id}`);
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const abierto = pill.getAttribute('aria-expanded') === 'true';
        cerrarPopovers();
        if (!abierto && pop) {
          pop.hidden = false;
          pill.setAttribute('aria-expanded', 'true');
        }
      });

      pop?.querySelectorAll<HTMLElement>('[data-opt]').forEach((el) => {
        const val = el.dataset.opt ?? '';
        const handler = () => {
          if (f.comparacion === 'en') {
            const arr = Array.isArray(estado[id]) ? (estado[id] as string[]).slice() : [];
            const idx = arr.indexOf(val);
            if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
            if (arr.length) estado[id] = arr; else delete estado[id];
          } else {
            // segmentado / opción única: toggle
            if (String(estado[id]) === val) delete estado[id];
            else estado[id] = f.control === 'rango' ? Number(val) : val;
          }
          syncControles(id);
          applyFilters();
        };
        if (el instanceof HTMLInputElement) el.addEventListener('change', handler);
        else el.addEventListener('click', handler);
      });

      pop?.querySelector<HTMLButtonElement>('[data-pop-clear]')?.addEventListener('click', () => {
        delete estado[id];
        syncControles(id);
        applyFilters();
      });
    });

    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.cat-facet')) cerrarPopovers();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarPopovers(); });

    // ----- Búsqueda -----
    busquedaInput?.addEventListener('input', () => {
      busqueda = norm(busquedaInput.value);
      applyFilters();
    });

    // ----- Orden -----
    ordenSel?.addEventListener('change', applyFilters);

    // ----- Limpiar todo -----
    clearAllBtn?.addEventListener('click', () => {
      for (const k of Object.keys(estado)) delete estado[k];
      busqueda = '';
      if (busquedaInput) busquedaInput.value = '';
      root.querySelectorAll<HTMLElement>('[data-opt]').forEach((el) => {
        if (el instanceof HTMLInputElement) el.checked = false;
        else el.classList.remove('is-on');
      });
      applyFilters();
    });

    // ----- Drawer móvil -----
    mobToggle?.addEventListener('click', () => {
      const abierto = bar?.classList.toggle('is-open');
      mobToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    // Clic en el pseudo-botón "Ver resultados" (parte baja del drawer)
    root.querySelector<HTMLElement>('.cat-pills')?.addEventListener('click', (e) => {
      const pills = e.currentTarget as HTMLElement;
      if (e.target === pills && bar?.classList.contains('is-open')) {
        bar.classList.remove('is-open');
        mobToggle?.setAttribute('aria-expanded', 'false');
      }
    });

    // ===== Barra de comparación (igual que antes) =====
    const checks = Array.from(grid.querySelectorAll<HTMLInputElement>('.cmp-chk'));
    const cmpBar = root.querySelector<HTMLElement>('.cmp-bar');
    const nEl = root.querySelector<HTMLElement>('.cmp-n');
    const copyEl = root.querySelector<HTMLElement>('.cmp-copy');
    const go = root.querySelector<HTMLAnchorElement>('.cmp-go');
    const clear = root.querySelector<HTMLButtonElement>('.cmp-clear');
    if (cmpBar && nEl && copyEl && go && clear) {
      const KEY = `comparar-${tipo}`;
      const validSlugs = new Set(checks.map((c) => c.value));
      const readStored = (): string[] => {
        try {
          const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
          if (!Array.isArray(parsed)) return [];
          return parsed.filter((v): v is string => typeof v === 'string').slice(0, 4);
        } catch { return []; }
      };
      const readSelection = (): string[] => readStored().filter((s) => validSlugs.has(s));
      const saveSelection = (selection: string[]) => {
        const maxPreserved = Math.max(0, 4 - selection.length);
        const preserved = readStored().filter((s) => !validSlugs.has(s)).slice(0, maxPreserved);
        localStorage.setItem(KEY, JSON.stringify([...preserved, ...selection].slice(0, 4)));
      };
      const renderCompare = () => {
        const selection = readSelection();
        if (selection.length > 4) saveSelection(selection.slice(0, 4));
        checks.forEach((c) => {
          const selected = selection.includes(c.value);
          c.checked = selected;
          c.closest('.card')?.classList.toggle('cmp-sel', selected);
        });
        nEl.textContent = String(selection.length);
        copyEl.textContent = selection.length === 1 ? 'seleccionado' : 'seleccionados';
        cmpBar.hidden = selection.length === 0;
        const canCompare = selection.length >= 2 && selection.length <= 4;
        go.setAttribute('aria-disabled', canCompare ? 'false' : 'true');
        if (canCompare) go.removeAttribute('tabindex'); else go.setAttribute('tabindex', '-1');
        go.href = canCompare ? `/comparar/${tipo}/?s=${selection.join(',')}` : `/comparar/${tipo}/`;
      };
      checks.forEach((check) => {
        check.addEventListener('change', () => {
          let selection = readSelection();
          if (check.checked) {
            if (!selection.includes(check.value)) {
              if (selection.length >= 4) {
                check.checked = false;
                check.setCustomValidity('Puedes comparar hasta 4 productos.');
                check.reportValidity();
                check.setCustomValidity('');
                return;
              }
              selection.push(check.value);
            }
          } else {
            selection = selection.filter((s) => s !== check.value);
          }
          saveSelection(selection);
          renderCompare();
        });
      });
      clear.addEventListener('click', () => { saveSelection([]); renderCompare(); });
      go.addEventListener('click', (event) => { if (go.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
      renderCompare();
    }

    applyFilters();
  });
</script>
```

- [ ] **Step 2: Type-check + build**

Run: `npm run build`
Expected: build OK, "93 page(s) built", y la línea "Updated CSP script-src". Sin errores de TypeScript.

- [ ] **Step 3: Verificar que la carga no oculta cards (regresión 112b0d7)**

Run: `npm run preview -- --port 4321` (en background), luego con Playwright navegar a `http://localhost:4321/catalogo/silla/` y comprobar:
- `document.querySelectorAll('.card:not([hidden])').length` === nº total de sillas (24).
- La píldora/popover de altura NO está presente (solo 1 silla con dato; auto-ocultada).

- [ ] **Step 4: Verificación funcional (Playwright)**

En `http://localhost:4321/catalogo/silla/`:
- Escribir "ikea" en la búsqueda → solo cards IKEA visibles; chip «ikea» aparece.
- Abrir popover "Precio", pulsar "€€" → cuenta baja, píldora muestra "Hasta €€", chip "Precio máximo: Hasta €€"; clic fuera cierra el popover; `Esc` también.
- Abrir "Marca", marcar 2 marcas → 2 chips, contador correcto, píldora "Marca · 2".
- Pulsar toggle "Soporta 130 kg o más" → aria-pressed=true, filtra.
- "Limpiar todo" → 24 cards, sin chips, búsqueda vacía.
- Resize a 390px: aparece botón "Filtrar (n)"; abre drawer; clic en zona inferior "Ver resultados" cierra.
- Seleccionar 2 cards con "comparar" → cmp-bar aparece y "Comparar" se habilita.

- [ ] **Step 5: Suite completa + validate**

Run: `npm test && npm run validate:productos`
Expected: tests verdes; "Productos revisados: 24 / OK".

- [ ] **Step 6: Commit**

```bash
git add src/components/producto/CatalogoProductos.astro public/_headers
git commit -m "feat(catalogo): filter bar with search, brand multi-select and popovers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> Nota CSP: `npm run build` regenera los hashes en `public/_headers` y `dist/_headers`. Incluir `public/_headers` en el commit si cambió.

---

## Self-Review

**Cobertura del spec:**
- Patrón B (barra superior + popovers) → Task 5 markup/CSS. ✔
- Búsqueda texto (nombre+marca, sin acentos) → Task 4 + `coincide` en script. ✔
- Marca multi-select + comparación `'en'` → Tasks 1, 2. ✔
- Auto-ocultar facetas <3 datos → Task 3 + frontmatter Task 5. ✔
- Chips activos + limpiar todo → Task 5 script. ✔
- Popover live-apply, uno a la vez, clic fuera + Esc, sin onclick inline → Task 5 script. ✔
- Móvil drawer "Filtrar (n)" + "Ver resultados" → Task 5 CSS/script. ✔
- A11y (aria-expanded/controls/pressed, aria-label chips, aria-live count) → Task 5 markup. ✔
- No tocar cmp-bar/schema/TarjetaProducto → respetado. ✔
- Verificación test/validate/build/Playwright → Task 5. ✔

**Placeholder scan:** sin TBD/TODO; todo el código está completo.

**Consistencia de tipos:** `pasaEn`, `opcionesMarca`, `cuentaConDato`, `filtrosVisibles`, `normalizaTexto`, `coincideBusqueda` con firmas idénticas entre definición (productos.ts) y uso (test/componente). El script reimplementa `norm`/`pasaFiltro` localmente (paridad con `normalizaTexto`/`pasaEn`; documentado en spec como "y/o el script"); las funciones de productos.ts cubren la lógica con tests.

**Nota de riesgo:** si al ejecutar el auto-ocultado se esconde alguna faceta inesperada (p. ej. reposacabezas con <3 datos), es comportamiento correcto por diseño; reportar al usuario qué facetas quedaron ocultas para decidir si poblar specs (opción D).
