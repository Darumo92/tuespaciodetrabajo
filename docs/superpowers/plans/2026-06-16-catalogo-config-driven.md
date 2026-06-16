# Catálogo config-driven multicategoría — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que el panel de filtros + orden + chips del catálogo se rendericen y filtren desde `getTipoConfig(tipo)`, de modo que añadir una categoría = añadir un `TipoConfig`, sin tocar `CatalogoProductos.astro` ni `TarjetaProducto.astro`.

**Architecture:** `FiltroConfig` se amplía con `comparacion` (predicado) separado de `control` (render); se añaden `OrdenConfig` y `ChipConfig`. La lógica de filtrado/orden/chips se extrae a funciones puras en `productos.ts` (testeadas con vitest). El componente del catálogo serializa un `panelConfig` en un data-attr del root y su `<script>` genérico lo consume; la card emite `data-c-<clave>` derivados de la config. Comportamiento de `/catalogo/silla/` idéntico.

**Tech Stack:** Astro 5, TypeScript, vitest (nuevo), CSS plano con tokens.

**Spec:** `docs/superpowers/specs/2026-06-16-catalogo-config-driven-design.md`

**Reglas duras (heredadas):** comportamiento idéntico de `/catalogo/silla/`; CSS plano + tokens canónicos; cero AI-tells; hairlines 1px; sin alias legacy; schema/JSON-LD y tag/ASIN intactos; ortografía española sin em-dash en texto visible; build 88 páginas verde. CSP por hashes la regenera `npm run build`: commitear `public/_headers` solo si cambia el hash del script inline del catálogo (sancionado), verificando que el diff sea solo swap de hash.

**Nota harness:** el hook "Fact-Forcing Gate" bloquea el primer Bash/Write/Edit de cada archivo pidiendo facts (request en 1 frase + qué hace; archivos nuevos: callers + no-duplicado). Cumplirlo y reintentar. Pasárselo a cada subagente.

---

## File Structure

- `src/lib/tipos.ts` — **Modify**: tipos nuevos (`Comparacion`, `TransformId`, `FormatoSalida`, `OrdenConfig`, `ChipConfig`), ampliar `FiltroConfig` y `TipoConfig`, reconciliar `silla`.
- `src/lib/productos.ts` — **Modify**: funciones puras `claveData`, `valorComparacion`, `datosFiltrado`, `construirChips`, registry `TRANSFORMS`, helper `formatoChip`.
- `src/lib/productos.test.ts` — **Create**: tests vitest de las funciones puras + mock `escritorio` (contrato de categoría nueva).
- `src/components/producto/CatalogoProductos.astro` — **Modify**: render del panel desde `cfg.filtros`/`cfg.ordenaciones`, `data-catalogo-config` en el root, `<script>` genérico.
- `src/components/producto/TarjetaProducto.astro` — **Modify**: spread `datosFiltrado(p,cfg)`, chips desde `construirChips(p,cfg)`.
- `package.json` — **Modify**: devDep `vitest` + script `test`.

---

## Task 1: Ampliar tipos + reconciliar `silla`

**Files:**
- Modify: `src/lib/tipos.ts`

Solo `CatalogoProductos` consume `cfg.filtros`; ficha/comparador usan `fichaSpecs`/`comparador`/`ejes`. Ampliar `FiltroConfig`/`TipoConfig` es seguro. En este task el componente sigue con el HTML viejo → comportamiento sin cambios; solo crece la config.

- [ ] **Step 1: Reemplazar el bloque de interfaces y la config `silla`**

En `src/lib/tipos.ts`, sustituir desde `export interface FiltroConfig {` hasta el cierre de `const silla: TipoConfig = { ... };` (líneas 4-81) por:

```ts
export interface EjeConfig { clave: string; etiqueta: string; }

export type Comparacion = 'max' | 'igual' | 'min' | 'check' | 'umbral';
export type TransformId = 'reposabrazosNivel';
export type FormatoSalida = 'tramoEuros';

export interface FiltroConfig {
  id: string;
  etiqueta: string;
  control: 'rango' | 'select' | 'check';
  comparacion: Comparacion;
  campo: string;
  opciones?: { valor: string; etiqueta: string }[];
  min?: number; max?: number; step?: number;
  umbral?: number;
  transform?: TransformId;
  formatoSalida?: FormatoSalida;
}

export interface OrdenConfig {
  id: string;
  etiqueta: string;
  campo: string;
  direccion: 'asc' | 'desc';
}

export interface ChipConfig {
  campo: string;
  formato?: string;
  prefijo?: string;
  mostrarSiNulo?: { etiqueta: string };
}

export interface FilaComparador {
  campo: string;
  etiqueta: string;
  direccion?: 'mayor' | 'menor';
  grupo: string;
}
export interface GrupoSpecs { titulo: string; filas: { campo: string; etiqueta: string; formato?: string }[]; }

export interface TipoConfig {
  slug: ClaveTipo;
  labelSingular: string;
  labelPlural: string;
  icono: string;
  ejes: EjeConfig[];
  filtros: FiltroConfig[];
  ordenaciones: OrdenConfig[];
  tarjetaChips: ChipConfig[];
  comparador: FilaComparador[];
  fichaSpecs: GrupoSpecs[];
}

const silla: TipoConfig = {
  slug: 'silla',
  labelSingular: 'Silla',
  labelPlural: 'Sillas',
  icono: '🪑',
  ejes: [
    { clave: 'ergonomia', etiqueta: 'Ergonomía' },
    { clave: 'ajustabilidad', etiqueta: 'Ajustabilidad' },
    { clave: 'materiales', etiqueta: 'Materiales' },
    { clave: 'comodidad', etiqueta: 'Comodidad' },
    { clave: 'calidadPrecio', etiqueta: 'Calidad-precio' },
  ],
  filtros: [
    { id: 'precio', etiqueta: 'Precio máximo', control: 'rango', comparacion: 'max',
      campo: 'tramoPrecio', min: 1, max: 4, step: 1, formatoSalida: 'tramoEuros' },
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', comparacion: 'igual', campo: 'specs.respaldo',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'malla', etiqueta: 'Malla' },
        { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'brazos', etiqueta: 'Reposabrazos mín.', control: 'select', comparacion: 'min',
      campo: 'specs.reposabrazos', transform: 'reposabrazosNivel',
      opciones: [{ valor: '0', etiqueta: 'Cualquiera' }, { valor: '2', etiqueta: '2D o superior' },
        { valor: '3', etiqueta: '3D o superior' }, { valor: '4', etiqueta: '4D' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', comparacion: 'check',
      campo: 'specs.profundidadRegulable' },
    { id: 'peso', etiqueta: 'Soporta 130 kg o más', control: 'check', comparacion: 'umbral',
      campo: 'specs.pesoMaxKg', umbral: 130 },
  ],
  ordenaciones: [
    { id: 'valoracion', etiqueta: 'Mejor valoradas', campo: 'valoracion', direccion: 'desc' },
    { id: 'precio-asc', etiqueta: 'Precio bajo a alto', campo: 'tramoPrecio', direccion: 'asc' },
    { id: 'precio-desc', etiqueta: 'Precio alto a bajo', campo: 'tramoPrecio', direccion: 'desc' },
    { id: 'peso-max', etiqueta: 'Mayor carga', campo: 'specs.pesoMaxKg', direccion: 'desc' },
  ],
  tarjetaChips: [
    { campo: 'specs.lumbar', prefijo: 'Lumbar ', formato: 'enumLower:lumbar' },
    { campo: 'specs.respaldo', formato: 'enum:respaldo' },
    { campo: 'specs.pesoMaxKg', formato: 'kg' },
    { campo: 'specs.garantiaAnios', formato: 'anios', mostrarSiNulo: { etiqueta: 'garantía n/d' } },
  ],
  comparador: [
    { grupo: 'Valoración por ejes', campo: 'valoraciones.ergonomia', etiqueta: 'Ergonomía', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.ajustabilidad', etiqueta: 'Ajustabilidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.materiales', etiqueta: 'Materiales', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.comodidad', etiqueta: 'Comodidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.calidadPrecio', etiqueta: 'Calidad-precio', direccion: 'mayor' },
    { grupo: 'Precio y garantía', campo: 'tramoPrecio', etiqueta: 'Tramo de precio', direccion: 'menor' },
    { grupo: 'Precio y garantía', campo: 'specs.garantiaAnios', etiqueta: 'Garantía (años)', direccion: 'mayor' },
    { grupo: 'Construcción', campo: 'specs.pesoMaxKg', etiqueta: 'Peso máximo (kg)', direccion: 'mayor' },
    { grupo: 'Construcción', campo: 'specs.reclinacionMaxGrados', etiqueta: 'Reclinación máx (°)', direccion: 'mayor' },
  ],
  fichaSpecs: [
    { titulo: 'Ergonomía y ajustes', filas: [
      { campo: 'specs.lumbar', etiqueta: 'Soporte lumbar' },
      { campo: 'specs.reposabrazos', etiqueta: 'Reposabrazos' },
      { campo: 'specs.profundidadRegulable', etiqueta: 'Profundidad regulable', formato: 'bool' },
      { campo: 'specs.reclinacionMaxGrados', etiqueta: 'Reclinación máx.', formato: 'grados' },
      { campo: 'specs.mecanismo', etiqueta: 'Mecanismo' },
    ]},
    { titulo: 'Construcción y materiales', filas: [
      { campo: 'specs.respaldo', etiqueta: 'Respaldo' },
      { campo: 'specs.baseMaterial', etiqueta: 'Base' },
      { campo: 'specs.certificacionBifma', etiqueta: 'Certificación BIFMA', formato: 'bool' },
      { campo: 'specs.pesoMaxKg', etiqueta: 'Peso máximo soportado', formato: 'kg' },
      { campo: 'specs.pesoProductoKg', etiqueta: 'Peso del producto', formato: 'kg' },
    ]},
    { titulo: 'Dimensiones y garantía', filas: [
      { campo: 'specs.anchoCm', etiqueta: 'Ancho', formato: 'cm' },
      { campo: 'specs.fondoCm', etiqueta: 'Fondo', formato: 'cm' },
      { campo: 'specs.garantiaAnios', etiqueta: 'Garantía', formato: 'anios' },
    ]},
  ],
};
```

(El `export type ClaveTipo` de la línea 1 y `export const TIPOS`, `TIPOS_CON_DATOS`, `getTipoConfig` de las líneas 83-88 quedan intactos.)

- [ ] **Step 2: Build verde**

Run: `npm run build`
Expected: `[build] 88 page(s) built` sin errores de tipo. `/catalogo/silla/` sigue usando el HTML viejo → comportamiento idéntico.

- [ ] **Step 3: Commit**

```bash
git add src/lib/tipos.ts
git commit -m "feat(catalogo): ampliar TipoConfig (comparacion/ordenaciones/tarjetaChips) y reconciliar silla"
```

---

## Task 2: vitest + `claveData` + registry `TRANSFORMS`

**Files:**
- Modify: `package.json`
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts` (Create)

- [ ] **Step 1: Instalar vitest y añadir script**

Run: `npm install -D vitest`

Luego editar `package.json` para añadir en `"scripts"` (tras la línea `"preview"`):

```json
    "test": "vitest run",
```

- [ ] **Step 2: Escribir el test que falla**

Crear `src/lib/productos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { claveData, valorComparacion } from './productos';
import type { FiltroConfig } from './tipos';

describe('claveData', () => {
  it('normaliza rutas a clave alfanumérica en minúsculas', () => {
    expect(claveData('specs.pesoMaxKg')).toBe('pesomaxkg');
    expect(claveData('tramoPrecio')).toBe('tramoprecio');
    expect(claveData('valoracion')).toBe('valoracion');
    expect(claveData('specs.profundidadRegulable')).toBe('profundidadregulable');
  });
});

describe('valorComparacion: transform reposabrazosNivel', () => {
  const filtro: FiltroConfig = {
    id: 'brazos', etiqueta: '', control: 'select', comparacion: 'min',
    campo: 'specs.reposabrazos', transform: 'reposabrazosNivel',
  };
  it('mapea el enum de reposabrazos a su nivel numérico', () => {
    const p = { specs: { reposabrazos: '4d' } } as never;
    expect(valorComparacion(p, filtro)).toBe('4');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `npm test`
Expected: FAIL — `claveData`/`valorComparacion` no exportadas.

- [ ] **Step 4: Implementar**

En `src/lib/productos.ts`, cambiar el import de la línea 1 a:

```ts
import type { ClaveTipo, FiltroConfig, TipoConfig } from './tipos';
```

Y añadir, justo después de `export function reposabrazosNivel(...) { ... }` (tras la línea 108):

```ts
const TRANSFORMS: Record<string, (v: unknown) => number> = {
  reposabrazosNivel: (v) => reposabrazosNivel(String(v ?? '')),
};

/** 'specs.pesoMaxKg' -> 'pesomaxkg'. Namespace data-c-<clave> compartido por filtros y ordenaciones. */
export function claveData(campo: string): string {
  return campo.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Valor comparable que la card debe emitir para un filtro (aplica transform / coerción bool). */
export function valorComparacion(p: Producto, filtro: FiltroConfig): string {
  const raw = getCampo(p, filtro.campo);
  if (filtro.transform) {
    const fn = TRANSFORMS[filtro.transform];
    return fn ? String(fn(raw)) : '';
  }
  if (filtro.comparacion === 'check') return raw ? '1' : '0';
  return raw == null ? '' : String(raw);
}
```

- [ ] **Step 5: Verificar que pasa + build verde**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: 88 páginas (vitest no afecta al build).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/productos.ts src/lib/productos.test.ts
git commit -m "test(catalogo): vitest + claveData + valorComparacion (transform)"
```

---

## Task 3: `datosFiltrado`

**Files:**
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Ampliar el test (incluye mock `escritorio` = contrato de categoría nueva)**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { datosFiltrado } from './productos';
import { getTipoConfig } from './tipos';
import type { TipoConfig } from './tipos';

const productoSilla = {
  slug: 'demo', tipo: 'silla', nombre: 'Demo', marca: 'X', imagen: '', imagenAlt: '',
  tramoPrecio: 3, precioMin: null, precioMax: null, valoracion: 4.5,
  valoraciones: { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null },
  amazon: { asin: null, buscar: null }, webOficial: null,
  paraQuienSi: [], paraQuienNo: [], puntosFuertes: [], puntosDebiles: [], fuenteSpecs: '',
  specs: { tipo: 'silla', respaldo: 'malla', reposabrazos: '3d', profundidadRegulable: true, pesoMaxKg: 150 },
} as never;

describe('datosFiltrado: silla', () => {
  it('emite los 6 data-c-<clave> derivados de filtros y ordenaciones', () => {
    const cfg = getTipoConfig('silla') as TipoConfig;
    const d = datosFiltrado(productoSilla, cfg);
    expect(d['data-c-tramoprecio']).toBe('3');
    expect(d['data-c-respaldo']).toBe('malla');
    expect(d['data-c-reposabrazos']).toBe('3'); // nivel de 3d
    expect(d['data-c-profundidadregulable']).toBe('1');
    expect(d['data-c-pesomaxkg']).toBe('150');
    expect(d['data-c-valoracion']).toBe('4.5');
    expect(Object.keys(d).length).toBe(6); // precio/peso comparten clave con sus ordenaciones
  });
});

// Mock de categoría nueva: añadir un TipoConfig => la card y el filtrado funcionan sin tocar componentes.
const escritorio: TipoConfig = {
  slug: 'escritorio' as never, labelSingular: 'Escritorio', labelPlural: 'Escritorios', icono: '🖥️',
  ejes: [],
  filtros: [
    { id: 'altura', etiqueta: 'Altura mín. máx', control: 'rango', comparacion: 'max', campo: 'specs.alturaMinCm', min: 60, max: 80, step: 1 },
    { id: 'motor', etiqueta: 'Motorizado', control: 'check', comparacion: 'check', campo: 'specs.motorizado' },
  ],
  ordenaciones: [
    { id: 'rango', etiqueta: 'Mayor recorrido', campo: 'specs.alturaMaxCm', direccion: 'desc' },
  ],
  tarjetaChips: [
    { campo: 'specs.motorizado', formato: 'bool', prefijo: 'Motor: ' },
  ],
  comparador: [], fichaSpecs: [],
};

describe('datosFiltrado: categoría nueva (escritorio mock)', () => {
  it('deriva data-c-* de la nueva config sin código específico', () => {
    const p = { specs: { tipo: 'escritorio', alturaMinCm: 65, alturaMaxCm: 125, motorizado: true } } as never;
    const d = datosFiltrado(p, escritorio);
    expect(d['data-c-alturamincm']).toBe('65');
    expect(d['data-c-motorizado']).toBe('1');
    expect(d['data-c-alturamaxcm']).toBe('125');
    expect(Object.keys(d).length).toBe(3);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npm test`
Expected: FAIL — `datosFiltrado` no exportada.

- [ ] **Step 3: Implementar**

En `src/lib/productos.ts`, añadir tras `valorComparacion`:

```ts
/** Mapa { 'data-c-<clave>': valor } para la card, sobre campos únicos de filtros y ordenaciones. */
export function datosFiltrado(p: Producto, cfg: TipoConfig): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of cfg.filtros) {
    out[`data-c-${claveData(f.campo)}`] = valorComparacion(p, f);
  }
  for (const o of cfg.ordenaciones) {
    const key = `data-c-${claveData(o.campo)}`;
    if (key in out) continue; // ya emitido por un filtro con el mismo campo
    const raw = getCampo(p, o.campo);
    out[key] = raw == null ? '' : String(raw);
  }
  return out;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npm test`
Expected: PASS (3 describe verdes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "test(catalogo): datosFiltrado + mock escritorio (contrato categoría nueva)"
```

---

## Task 4: `construirChips`

**Files:**
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Ampliar el test**

Añadir al final de `src/lib/productos.test.ts`:

```ts
import { construirChips } from './productos';

describe('construirChips: silla', () => {
  const cfg = getTipoConfig('silla') as TipoConfig;

  it('reproduce los chips actuales (lumbar/respaldo/peso/garantía)', () => {
    const p = { specs: { tipo: 'silla', lumbar: '5d', respaldo: 'mixto', pesoMaxKg: 150, garantiaAnios: 5 } } as never;
    const chips = construirChips(p, cfg);
    expect(chips.map((c) => c.texto)).toEqual(['Lumbar 5d ajustable', 'Malla + cojín', '150 kg', '5 años']);
    expect(chips.every((c) => !c.nd)).toBe(true);
  });

  it('garantía null muestra el fallback con nd:true', () => {
    const p = { specs: { tipo: 'silla', lumbar: 'fijo', respaldo: 'malla', pesoMaxKg: 120, garantiaAnios: null } } as never;
    const chips = construirChips(p, cfg);
    expect(chips[chips.length - 1]).toEqual({ texto: 'garantía n/d', nd: true });
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npm test`
Expected: FAIL — `construirChips` no exportada.

- [ ] **Step 3: Implementar**

En `src/lib/productos.ts`, añadir tras `datosFiltrado`:

```ts
function formatoChip(valor: unknown, formato?: string): string {
  if (!formato) return String(valor);
  if (formato.startsWith('enumLower:')) {
    return etiquetaEnum(formato.slice('enumLower:'.length), String(valor)).toLowerCase();
  }
  if (formato.startsWith('enum:')) {
    return etiquetaEnum(formato.slice('enum:'.length), String(valor));
  }
  return formatoSpec(valor, formato);
}

/** Chips de la card desde cfg.tarjetaChips. nd:true para el fallback de campos null con mostrarSiNulo. */
export function construirChips(p: Producto, cfg: TipoConfig): { texto: string; nd: boolean }[] {
  const out: { texto: string; nd: boolean }[] = [];
  for (const chip of cfg.tarjetaChips) {
    const raw = getCampo(p, chip.campo);
    if (raw == null) {
      if (chip.mostrarSiNulo) out.push({ texto: chip.mostrarSiNulo.etiqueta, nd: true });
      continue;
    }
    out.push({ texto: (chip.prefijo ?? '') + formatoChip(raw, chip.formato), nd: false });
  }
  return out;
}
```

- [ ] **Step 4: Verificar que pasa + build verde**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: 88 páginas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "test(catalogo): construirChips config-driven (incl. fallback n/d)"
```

---

## Task 5: Componente del catálogo + card config-driven (swap atómico del contrato data-attr)

**Files:**
- Modify: `src/components/producto/CatalogoProductos.astro`
- Modify: `src/components/producto/TarjetaProducto.astro`
- Modify: `public/_headers` (regenerado por build, solo swap de hash)

La card pasa de `data-tramo/respaldo/brazos/prof/peso/valoracion` a `data-c-<clave>`, y el script pasa a leerlos desde la config. Ambos cambios van en el **mismo commit** para no romper el filtrado entre tasks.

- [ ] **Step 1: Reescribir `CatalogoProductos.astro`**

Sustituir el archivo completo por:

```astro
---
import TarjetaProducto from './TarjetaProducto.astro';
import { getTipoConfig } from '@/lib/tipos';
import { claveData } from '@/lib/productos';
import type { Producto } from '@/lib/productos';

interface Props {
  productos: Producto[];
  tipo: string;
}

const { productos, tipo } = Astro.props;
const cfg = getTipoConfig(tipo);
const filtros = cfg?.filtros ?? [];
const ordenaciones = cfg?.ordenaciones ?? [];

const panelConfig = {
  filtros: filtros.map((f) => ({
    id: f.id, control: f.control, comparacion: f.comparacion, clave: claveData(f.campo),
    umbral: f.umbral, formatoSalida: f.formatoSalida, max: f.max,
  })),
  ordenaciones: ordenaciones.map((o) => ({ id: o.id, clave: claveData(o.campo), direccion: o.direccion })),
};
---

<section class="catalogo" data-catalogo-root data-tipo={tipo} data-catalogo-config={JSON.stringify(panelConfig)}>
  <div class="catalogo-filtros" aria-label="Filtros de catálogo">
    {filtros.map((f) => (
      f.control === 'rango' ? (
        <label class="catalogo-field">
          <span>{f.etiqueta}</span>
          <input type="range" data-filtro={f.id} min={f.min} max={f.max} step={f.step} value={f.max} />
          <output class="catalogo-out" data-out={f.id}>Sin límite</output>
        </label>
      ) : f.control === 'select' ? (
        <label class="catalogo-field">
          <span>{f.etiqueta}</span>
          <select data-filtro={f.id}>
            {(f.opciones ?? []).map((o) => <option value={o.valor}>{o.etiqueta}</option>)}
          </select>
        </label>
      ) : (
        <label class="catalogo-check">
          <input type="checkbox" data-filtro={f.id} />
          <span>{f.etiqueta}</span>
        </label>
      )
    ))}

    <label class="catalogo-field">
      <span>Ordenar</span>
      <select data-orden>
        {ordenaciones.map((o) => <option value={o.id}>{o.etiqueta}</option>)}
      </select>
    </label>
  </div>

  <p class="catalogo-count">
    <span class="catalogo-n">{productos.length}</span>
    <span>productos · marca entre 2 y 4 casillas para comparar</span>
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
  .catalogo {
    position: relative;
    padding-bottom: 4.5rem;
  }

  .catalogo-filtros {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    align-items: end;
    margin-bottom: 1.35rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid var(--border);
  }

  .catalogo-field,
  .catalogo-check {
    font-size: 0.82rem;
    font-weight: 650;
    color: var(--ink-muted);
  }

  .catalogo-field {
    display: flex;
    flex-direction: column;
    gap: 0.32rem;
    min-width: min(100%, 11rem);
  }

  .catalogo-field input,
  .catalogo-field select {
    min-height: 2.35rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--ink);
    font: inherit;
  }

  .catalogo-field select {
    padding: 0 0.65rem;
  }

  .catalogo-field input[type='range'] {
    min-height: 1.8rem;
    accent-color: var(--accent);
  }

  .catalogo-out {
    min-height: 1rem;
    font-size: 0.75rem;
    color: var(--ink);
  }

  .catalogo-check {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2.35rem;
  }

  .catalogo-check input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent);
  }

  .catalogo-count {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0 0 1rem;
    font-size: 0.86rem;
    color: var(--ink-muted);
  }

  .catalogo-count .catalogo-n {
    font-weight: 750;
    color: var(--ink);
  }

  .catalogo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 1rem;
  }

  .catalogo-vacio {
    margin: 1.25rem 0 0;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-muted);
    color: var(--ink-muted);
  }

  .cmp-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 0.78rem max(1rem, env(safe-area-inset-right)) calc(0.78rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
    background: var(--ink);
    color: var(--bg);
    box-shadow: 0 -1px 0 var(--border-strong);
  }

  .cmp-status {
    display: inline-flex;
    align-items: baseline;
    gap: 0.32rem;
    min-width: 0;
    font-size: 0.88rem;
  }

  .cmp-status strong {
    font-family: var(--font-display);
    font-size: 1rem;
  }

  .cmp-go,
  .cmp-clear {
    min-height: 2.25rem;
    border-radius: var(--radius);
    padding: 0.48rem 0.9rem;
    font: inherit;
    font-weight: 750;
    white-space: nowrap;
  }

  .cmp-go {
    display: inline-flex;
    align-items: center;
    color: var(--accent-ink);
    background: var(--accent);
    text-decoration: none;
  }

  .cmp-go[aria-disabled='true'] {
    opacity: 0.55;
    pointer-events: none;
  }

  .cmp-clear {
    border: 1px solid color-mix(in srgb, var(--bg) 35%, transparent);
    background: transparent;
    color: var(--bg);
    cursor: pointer;
  }

  .cmp-clear:hover,
  .cmp-clear:focus-visible {
    border-color: var(--bg);
  }

  .cmp-go,
  .cmp-clear { transition: transform var(--dur-press) var(--ease-out); }

  .cmp-go:active,
  .cmp-clear:active { transform: scale(0.97); }

  @media (max-width: 768px) {
    .catalogo {
      padding-bottom: 8.5rem;
    }

    .cmp-bar {
      bottom: calc(56px + env(safe-area-inset-bottom, 0px));
      padding-bottom: 0.78rem;
    }
  }

  @media (max-width: 560px) {
    .catalogo {
      padding-bottom: 10.5rem;
    }

    .catalogo-field {
      width: 100%;
    }

    .catalogo-check {
      width: 100%;
    }

    .cmp-bar {
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.55rem;
    }

    .cmp-status {
      width: 100%;
      justify-content: center;
    }

    .cmp-go,
    .cmp-clear {
      flex: 1 1 8rem;
      justify-content: center;
      text-align: center;
    }
  }
</style>

<script>
  type FiltroRT = { id: string; control: string; comparacion: string; clave: string; umbral?: number; formatoSalida?: string; max?: number };
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

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.card'));
    const ordenSel = root.querySelector<HTMLSelectElement>('[data-orden]');
    const nOut = root.querySelector<HTMLElement>('.catalogo-n');
    const vacio = root.querySelector<HTMLElement>('.catalogo-vacio');
    const bar = root.querySelector<HTMLElement>('.cmp-bar');
    const nEl = root.querySelector<HTMLElement>('.cmp-n');
    const copyEl = root.querySelector<HTMLElement>('.cmp-copy');
    const go = root.querySelector<HTMLAnchorElement>('.cmp-go');
    const clear = root.querySelector<HTMLButtonElement>('.cmp-clear');

    if (!bar || !nEl || !copyEl || !go || !clear) return;

    const controlDe = (id: string) => root.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-filtro="${id}"]`);
    const dataKey = (clave: string) => 'c' + clave.charAt(0).toUpperCase() + clave.slice(1);
    const readCard = (card: HTMLElement, clave: string) => card.dataset[dataKey(clave)];

    const toNumber = (value: string | undefined): number | null => {
      if (value == null || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const compare = (x: number, y: number) => (x === y ? 0 : x < y ? -1 : 1);

    const checks = Array.from(grid.querySelectorAll<HTMLInputElement>('.cmp-chk'));
    const KEY = `comparar-${tipo}`;
    const validSlugs = new Set(checks.map((check) => check.value));

    const readStoredSelection = (): string[] => {
      try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((value): value is string => typeof value === 'string').slice(0, 4);
      } catch {
        return [];
      }
    };

    const readSelection = (): string[] => readStoredSelection().filter((slug) => validSlugs.has(slug));

    const saveSelection = (selection: string[]) => {
      const maxPreserved = Math.max(0, 4 - selection.length);
      const preserved = readStoredSelection().filter((slug) => !validSlugs.has(slug)).slice(0, maxPreserved);
      localStorage.setItem(KEY, JSON.stringify([...preserved, ...selection].slice(0, 4)));
    };

    const renderCompare = () => {
      const selection = readSelection();
      if (selection.length > 4) saveSelection(selection.slice(0, 4));

      checks.forEach((check) => {
        const selected = selection.includes(check.value);
        check.checked = selected;
        check.closest('.card')?.classList.toggle('cmp-sel', selected);
      });

      nEl.textContent = String(selection.length);
      copyEl.textContent = selection.length === 1 ? 'seleccionado' : 'seleccionados';
      bar.hidden = selection.length === 0;

      const canCompare = selection.length >= 2 && selection.length <= 4;
      go.setAttribute('aria-disabled', canCompare ? 'false' : 'true');
      if (canCompare) {
        go.removeAttribute('tabindex');
      } else {
        go.setAttribute('tabindex', '-1');
      }
      go.href = canCompare ? `/comparar/${tipo}/?s=${selection.join(',')}` : `/comparar/${tipo}/`;
    };

    const salidaRango = (f: FiltroRT, val: number): string => {
      if (f.formatoSalida === 'tramoEuros') {
        return val >= (f.max ?? Infinity) ? 'Sin límite' : `Hasta ${'€'.repeat(val)}`;
      }
      return String(val);
    };

    const applyFilters = () => {
      filtros.forEach((f) => {
        if (f.control !== 'rango') return;
        const ctrl = controlDe(f.id);
        const out = root.querySelector<HTMLOutputElement>(`[data-out="${f.id}"]`);
        if (ctrl && out) out.textContent = salidaRango(f, Number((ctrl as HTMLInputElement).value));
      });

      let visibles = 0;
      cards.forEach((card) => {
        let visible = true;
        for (const f of filtros) {
          const ctrl = controlDe(f.id);
          if (!ctrl) continue;
          const cv = readCard(card, f.clave) ?? '';
          if (f.comparacion === 'max') {
            const n = toNumber(cv);
            if (n != null && n > Number((ctrl as HTMLInputElement).value)) visible = false;
          } else if (f.comparacion === 'igual') {
            const sel = (ctrl as HTMLSelectElement).value;
            if (sel && cv !== sel) visible = false;
          } else if (f.comparacion === 'min') {
            const n = toNumber(cv) ?? 0;
            if (Number((ctrl as HTMLSelectElement).value) > n) visible = false;
          } else if (f.comparacion === 'check') {
            if ((ctrl as HTMLInputElement).checked && cv !== '1') visible = false;
          } else if (f.comparacion === 'umbral') {
            const n = toNumber(cv);
            if ((ctrl as HTMLInputElement).checked && (n == null || n < (f.umbral ?? Infinity))) visible = false;
          }
        }
        card.hidden = !visible;
        if (visible) visibles += 1;
      });

      const orden = ordenaciones.find((o) => o.id === ordenSel?.value) || ordenaciones[0];
      if (orden) {
        const worst = orden.direccion === 'asc' ? Infinity : -Infinity;
        cards.filter((card) => !card.hidden).sort((a, b) => {
          const x = toNumber(readCard(a, orden.clave)) ?? worst;
          const y = toNumber(readCard(b, orden.clave)) ?? worst;
          return orden.direccion === 'asc' ? compare(x, y) : compare(y, x);
        }).forEach((card) => grid.appendChild(card));
      }

      if (nOut) nOut.textContent = String(visibles);
      if (vacio) vacio.hidden = visibles > 0;
    };

    filtros.forEach((f) => {
      const ctrl = controlDe(f.id);
      if (!ctrl) return;
      ctrl.addEventListener('input', applyFilters);
      ctrl.addEventListener('change', applyFilters);
    });
    if (ordenSel) {
      ordenSel.addEventListener('input', applyFilters);
      ordenSel.addEventListener('change', applyFilters);
    }

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
          selection = selection.filter((slug) => slug !== check.value);
        }

        saveSelection(selection);
        renderCompare();
      });
    });

    clear.addEventListener('click', () => {
      saveSelection([]);
      renderCompare();
    });

    go.addEventListener('click', (event) => {
      if (go.getAttribute('aria-disabled') === 'true') event.preventDefault();
    });

    applyFilters();
    renderCompare();
  });
</script>
```

- [ ] **Step 2: Reescribir el frontmatter y el markup de `TarjetaProducto.astro`**

Sustituir las líneas 1-48 de `src/components/producto/TarjetaProducto.astro` (desde `---` hasta `</article>`) por:

```astro
---
import BotonPrecio from '../BotonPrecio.astro';
import ImagenProducto from './ImagenProducto.astro';
import { notaGlobal, tramoTexto, datosFiltrado, construirChips, type Producto } from '@/lib/productos';
import { getTipoConfig } from '@/lib/tipos';

interface Props { producto: Producto; }

const { producto: p } = Astro.props;
const global = notaGlobal(p);
const cfg = getTipoConfig(p.tipo);
const dataAttrs = cfg ? datosFiltrado(p, cfg) : {};
const chips = cfg ? construirChips(p, cfg) : [];
---

<article class="card" data-slug={p.slug} {...dataAttrs}>
  <label class="card-cmp">
    <input type="checkbox" class="cmp-chk" value={p.slug} />
    comparar <span class="sr-only">{p.nombre}</span>
  </label>
  <ImagenProducto imagen={p.imagen} imagenAlt={p.imagenAlt} marca={p.marca} nombre={p.nombre} size={110} />
  <div class="card-info">
    <span class="card-brand">{p.marca}</span>
    <a class="card-name" href={`/catalogo/${p.tipo}/${p.slug}/`}>{p.nombre}</a>
    <p class="card-line">
      {global != null && <span class="card-score">{global.toFixed(1)}/10</span>}
      <span class="card-price">{tramoTexto(p.tramoPrecio)}</span>
    </p>
    <div class="card-chips">
      {chips.map((c) => <span class={`chip${c.nd ? ' chip-nd' : ''}`}>{c.texto}</span>)}
    </div>
    <BotonPrecio amazon={p.amazon} webOficial={p.webOficial} nombre={p.nombre} />
  </div>
</article>
```

(El bloque `<style>` de `TarjetaProducto.astro`, líneas 50-70, queda intacto.)

- [ ] **Step 3: Build + comprobar regeneración de CSP**

Run: `npm run build`
Expected: 88 páginas. El script `update-csp-hashes.mjs` regenera el hash del script inline del catálogo → `public/_headers` cambia.

Run: `git diff --stat public/_headers`
Expected: `public/_headers` modificado.

Run: `git diff public/_headers`
Expected: **solo** líneas de `sha256-...` cambiadas dentro de `script-src` (swap de hash). Sin cambios de política, directivas ni dominios. Si el diff toca algo más, PARAR y revisar.

- [ ] **Step 4: Verificación manual del filtrado (idéntico)**

Levantar `npm run preview` (background) y abrir `http://localhost:4321/catalogo/silla/`. Comprobar:
- Panel con: Precio máximo (rango, "Sin límite"), Respaldo (select, "Cualquiera/Malla/Espuma/Mixto"), Reposabrazos mín. (select, "Cualquiera/2D o superior/3D o superior/4D"), Profundidad regulable (check), Soporta 130 kg o más (check), Ordenar (select, "Mejor valoradas/Precio bajo a alto/Precio alto a bajo/Mayor carga").
- Rango a 3 → output "Hasta €€€"; a 4 → "Sin límite". Productos de tramo 4 desaparecen al bajar el slider.
- Respaldo = Malla filtra; Reposabrazos = 3D oculta sillas con nivel < 3; Profundidad oculta las que no la tienen; 130 kg oculta las de < 130 o n/d.
- Ordenar cambia el orden (mejor valoradas por defecto, precio asc/desc, mayor carga).
- Marcar 2-4 casillas → barra comparar; >4 bloquea; Comparar navega a `/comparar/silla/?s=...`; Limpiar resetea. Chips de card idénticos (Lumbar …, respaldo, kg, años / garantía n/d).

Parar el preview tras verificar.

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/CatalogoProductos.astro src/components/producto/TarjetaProducto.astro public/_headers
git commit -m "feat(catalogo): panel de filtros, orden y chips render+filtrado desde TipoConfig"
```

---

## Task 6: Verificación final

**Files:** ninguno (solo checks)

- [ ] **Step 1: Suite verde + build verde**

Run: `npm test && npm run build`
Expected: vitest PASS; `[build] 88 page(s) built`.

- [ ] **Step 2: Anti-slop y reglas duras**

Run: `grep -rn 'transition: *all\|backdrop-filter\|gradient' src/components/producto/CatalogoProductos.astro src/components/producto/TarjetaProducto.astro`
Expected: sin coincidencias.

Run: `grep -rn 'var(--color-' src/components/producto/CatalogoProductos.astro src/components/producto/TarjetaProducto.astro`
Expected: sin coincidencias (sin alias legacy).

Run: `grep -n 'tuespaciodet-21\|buildAmazonHref\|AMAZON_TAG' src/lib/productos.ts`
Expected: tag y helpers intactos.

- [ ] **Step 3: Confirmar extensibilidad documentada**

Run: `grep -n 'escritorio' src/lib/productos.test.ts`
Expected: el mock `escritorio` existe en el test (contrato de categoría nueva).

Run: `grep -n 'escritorio' src/lib/tipos.ts`
Expected: sin coincidencias (NO en `TIPOS`/`TIPOS_CON_DATOS`).

- [ ] **Step 4: Reporte final**

Resumir: tasks completadas, build 88 páginas, `npm test` verde, diff de `_headers` solo swap de hash, comportamiento de `/catalogo/silla/` idéntico, contrato de categoría nueva probado por el mock `escritorio`. Sin push (regla del usuario).

---

## Self-Review (cubierto)

- **Spec coverage:** tipos/silla (T1), claveData/valorComparacion/datosFiltrado/construirChips (T2-T4), render+script genérico (T5), card (T5), vitest+mock escritorio (T2-T4), verificación+CSP (T5-T6). Todo el spec mapeado.
- **Paridad:** etiquetas/opciones/orden de controles = HTML actual; predicados = lógica actual; orden con null-al-fondo = ±Inf/0 actual (valoracion nunca null en los 19 productos); output del rango = €€€/Sin límite.
- **Type consistency:** `claveData`, `valorComparacion`, `datosFiltrado`, `construirChips`, `panelConfig{filtros,ordenaciones}`, `data-c-<clave>`, `dataKey` consistentes entre TS, test, componente y script.
