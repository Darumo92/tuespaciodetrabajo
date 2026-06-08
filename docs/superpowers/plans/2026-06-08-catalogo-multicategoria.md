# Catálogo multicategoría (estilo surfskate) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una arquitectura de catálogo multicategoría (base de datos + comparador + buscador + blog de actualidad) genérica parametrizada por tipo de producto, poblada en v1 solo con `silla`, al estilo surfskate.app pero con identidad propia.

**Architecture:** Colección única `productos` (Zod, unión discriminada por `tipo`). Un registro `src/lib/tipos.ts` parametriza toda la UI (filtros, comparador, ficha). Lógica pura en `src/lib/productos.ts` (Vitest/TDD). Componentes `.astro` genéricos reciben el producto + su `tipoConfig`. Comparador en dos formas: interactivo cliente (`noindex`) y páginas estáticas "vs" (indexables, diferencial SEO). Buscador global con índice JSON estático. Blog de actualidad reusa la colección `articulos`.

**Tech Stack:** Astro 5 (static), TypeScript, Zod (vía astro:content), Vitest, JS vanilla cliente.

**Spec de referencia:** `docs/superpowers/specs/2026-06-08-catalogo-multicategoria-design.md`

**Rama aparcada con artefactos reutilizables:** `feat/catalogo-sillas-db`. Commits clave:
`de550af` (19 sillas enriquecidas), `bc64c72` (ValoracionEjes), `6b831d9` (ParaQuien),
`0f92c94` (ImagenSilla/FallbackImagen). Se rescatan con `git show <sha>:<ruta>`.

**Honestidad (rige todo):** dato no confirmado → `null` → `n/d`. Valoraciones por ejes = editoriales. Nunca inventar specs, ASINs ni precios.

---

## File Structure

**Crear:**
- `src/lib/tipos.ts` — registro de configuración por tipo de producto.
- `src/lib/productos.ts` — tipos + lógica pura (notaGlobal, ganadoresPorValor, índice búsqueda, pares vs).
- `src/lib/productos.test.ts` — tests Vitest.
- `src/content/productos/*.yaml` — 19 sillas migradas (tipo: silla).
- `src/components/producto/FallbackImagen.astro`, `ImagenProducto.astro`, `ValoracionEjes.astro`, `ParaQuien.astro`.
- `src/components/producto/TarjetaProducto.astro`, `CatalogoProductos.astro`, `FichaProducto.astro`.
- `src/components/producto/ComparadorProductos.astro`, `TablaVs.astro`.
- `src/pages/catalogo/index.astro` — hub.
- `src/pages/catalogo/[tipo]/index.astro` — catálogo por tipo.
- `src/pages/catalogo/[tipo]/[slug].astro` — ficha.
- `src/pages/comparar/[tipo]/index.astro` — comparador interactivo (noindex).
- `src/pages/comparar/[tipo]/[par].astro` — páginas "vs" estáticas.
- `src/pages/buscar.astro` — buscador global.
- `src/pages/buscar-indice.json.ts` — endpoint del índice de búsqueda.
- `src/pages/actualidad/index.astro` — blog de noticias.

**Modificar:**
- `src/content/config.ts` — colección `productos`; añadir `noticia` al enum `tipo` de `articulos`.
- `src/components/Header.astro` — enlaces Catálogo, Buscar, Actualidad.
- `src/pages/index.astro` — bloque CTA al catálogo + SearchAction schema.
- `astro.config.mjs` — redirects de rutas viejas de producto.

---

## Task 1: Colección `productos` (schema Zod, unión discriminada)

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Leer el archivo para ubicar el patrón de colecciones**

Run: `sed -n '1,40p' src/content/config.ts`
Expected: ver cómo se definen `defineCollection` y el `export const collections`.

- [ ] **Step 2: Añadir la colección `productos`**

En `src/content/config.ts`, antes de `export const collections`, añadir:
```ts
const ejesValoracion = z.object({
  ergonomia: z.number().min(0).max(10).nullable().default(null),
  ajustabilidad: z.number().min(0).max(10).nullable().default(null),
  materiales: z.number().min(0).max(10).nullable().default(null),
  comodidad: z.number().min(0).max(10).nullable().default(null),
  calidadPrecio: z.number().min(0).max(10).nullable().default(null),
}).default({});

const specsSilla = z.object({
  tipo: z.literal('silla'),
  lumbar: z.enum(['fijo', 'presion', 'altura', 'dinamico', '5d']),
  respaldo: z.enum(['malla', 'espuma', 'mixto']),
  reposabrazos: z.enum(['ninguno', 'fijo', '1d', '2d', '3d', '4d', 'abatibles']),
  profundidadRegulable: z.boolean().default(false),
  reclinacionMaxGrados: z.number().nullable().default(null),
  pesoMaxKg: z.number().nullable().default(null),
  alturaAsientoMinCm: z.number().nullable().default(null),
  alturaAsientoMaxCm: z.number().nullable().default(null),
  anchoCm: z.number().nullable().default(null),
  fondoCm: z.number().nullable().default(null),
  mecanismo: z.string().nullable().default(null),
  baseMaterial: z.string().nullable().default(null),
  certificacionBifma: z.boolean().nullable().default(null),
  pesoProductoKg: z.number().nullable().default(null),
  garantiaAnios: z.number().nullable().default(null),
});

const productos = defineCollection({
  type: 'data',
  schema: z.object({
    tipo: z.enum(['silla']), // ampliar al añadir categorías
    nombre: z.string(),
    marca: z.string(),
    imagen: z.string().default(''),
    imagenAlt: z.string().default(''),
    tramoPrecio: z.number().int().min(1).max(4),
    precioMin: z.number().nullable().default(null),
    precioMax: z.number().nullable().default(null),
    valoracion: z.number().min(0).max(5).nullable().default(null),
    valoraciones: ejesValoracion,
    amazon: z.object({
      asin: z.string().nullable().default(null),
      buscar: z.string().nullable().default(null),
    }).default({}),
    webOficial: z.string().nullable().default(null),
    idealPara: z.string().optional(),
    veredicto: z.string().optional(),
    comunidad: z.string().optional(),
    paraQuienSi: z.array(z.string()).default([]),
    paraQuienNo: z.array(z.string()).default([]),
    puntosFuertes: z.array(z.string()).default([]),
    puntosDebiles: z.array(z.string()).default([]),
    fuenteSpecs: z.string(),
    verificadoEn: z.string().optional(),
    specs: z.discriminatedUnion('tipo', [specsSilla]),
  }),
});
```
Añadir `productos` al objeto `export const collections = { ... }`.

> Nota: `import { z, defineCollection } from 'astro:content';` ya existe en el archivo. Si falta `defineCollection` en el import, añádelo.

- [ ] **Step 3: Verificar que el build no rompe (aún sin datos en `productos`)**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK. Una colección `data` vacía es válida (0 entradas).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(catalogo): productos collection with discriminated-union specs schema"
```

---

## Task 2: Registro de tipos `src/lib/tipos.ts`

**Files:**
- Create: `src/lib/tipos.ts`

- [ ] **Step 1: Crear el registro con la config de `silla`**

```ts
export type ClaveTipo = 'silla';

export interface EjeConfig { clave: string; etiqueta: string; }
export interface FiltroConfig {
  id: string;
  etiqueta: string;
  control: 'rango' | 'select' | 'check';
  campo: string;
  opciones?: { valor: string; etiqueta: string }[];
  min?: number; max?: number; step?: number;
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
    { id: 'precio', etiqueta: 'Tramo de precio máx', control: 'rango', campo: 'tramoPrecio', min: 1, max: 4, step: 1 },
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', campo: 'specs.respaldo',
      opciones: [{ valor: 'malla', etiqueta: 'Malla' }, { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', campo: 'specs.profundidadRegulable' },
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

export const TIPOS: Record<ClaveTipo, TipoConfig> = { silla };
export const TIPOS_CON_DATOS: ClaveTipo[] = ['silla'];

export function getTipoConfig(slug: string): TipoConfig | undefined {
  return (TIPOS as Record<string, TipoConfig>)[slug];
}
```

- [ ] **Step 2: Verificar compilación**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK (sin errores de tipos en `src/lib/tipos.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/tipos.ts
git commit -m "feat(catalogo): tipos registry parametrizing catalog/comparator/ficha UI"
```

---

## Task 3: `productos.ts` — tipos + notaGlobal + ganadoresPorValor + getCampo (TDD)

**Files:**
- Create: `src/lib/productos.ts`
- Create: `src/lib/productos.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/productos.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { mediaEjesPresentes, notaGlobal, ganadoresPorValor, getCampo } from './productos';
import type { Producto, Valoraciones } from './productos';

const COMPLETOS: Valoraciones = { ergonomia: 8, ajustabilidad: 8, materiales: 9, comodidad: 7, calidadPrecio: 8 };
const PARCIALES: Valoraciones = { ergonomia: 9, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: 6 };
const VACIOS: Valoraciones = { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null };

const base = (over: Partial<Producto> = {}): Producto => ({
  slug: 'x', tipo: 'silla', nombre: 'X', marca: 'M', imagen: '', imagenAlt: '',
  tramoPrecio: 2, precioMin: null, precioMax: null, valoracion: 4, valoraciones: VACIOS,
  amazon: { asin: null, buscar: null }, webOficial: null, paraQuienSi: [], paraQuienNo: [],
  puntosFuertes: [], puntosDebiles: [], fuenteSpecs: 'x', specs: { tipo: 'silla', garantiaAnios: 3 } as any, ...over,
});

describe('mediaEjesPresentes', () => {
  it('promedia solo ejes con valor', () => {
    expect(mediaEjesPresentes(COMPLETOS)).toBe(8);
    expect(mediaEjesPresentes(PARCIALES)).toBe(7.5);
  });
  it('null si no hay ejes', () => {
    expect(mediaEjesPresentes(VACIOS)).toBeNull();
    expect(mediaEjesPresentes(undefined)).toBeNull();
  });
});

describe('notaGlobal', () => {
  it('usa media de ejes', () => { expect(notaGlobal(base({ valoraciones: PARCIALES }))).toBe(7.5); });
  it('fallback valoracion*2', () => { expect(notaGlobal(base({ valoracion: 4.5, valoraciones: VACIOS }))).toBe(9); });
});

describe('ganadoresPorValor', () => {
  const items = [{ slug: 'a', valor: 320 }, { slug: 'b', valor: 130 }, { slug: 'c', valor: null }];
  it('menor gana, ignora null', () => { expect(ganadoresPorValor(items, 'menor')).toEqual(['b']); });
  it('mayor gana', () => { expect(ganadoresPorValor(items, 'mayor')).toEqual(['a']); });
  it('empate marca varios', () => {
    expect(ganadoresPorValor([{ slug: 'a', valor: 5 }, { slug: 'b', valor: 5 }], 'mayor')).toEqual(['a', 'b']);
  });
  it('todos null → vacío', () => { expect(ganadoresPorValor([{ slug: 'a', valor: null }], 'menor')).toEqual([]); });
});

describe('getCampo', () => {
  it('lee ruta anidada', () => {
    expect(getCampo(base(), 'specs.garantiaAnios')).toBe(3);
    expect(getCampo(base({ tramoPrecio: 2 }), 'tramoPrecio')).toBe(2);
    expect(getCampo(base(), 'specs.inexistente')).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: FAIL — módulo/exports no existen.

- [ ] **Step 3: Implementar**

`src/lib/productos.ts`:
```ts
import type { ClaveTipo } from './tipos';

export interface Valoraciones {
  ergonomia: number | null;
  ajustabilidad: number | null;
  materiales: number | null;
  comodidad: number | null;
  calidadPrecio: number | null;
}

export interface Producto {
  slug: string;
  tipo: ClaveTipo;
  nombre: string;
  marca: string;
  imagen: string;
  imagenAlt: string;
  tramoPrecio: number;
  precioMin: number | null;
  precioMax: number | null;
  valoracion: number | null;
  valoraciones: Valoraciones;
  amazon: { asin: string | null; buscar: string | null };
  webOficial: string | null;
  idealPara?: string;
  veredicto?: string;
  comunidad?: string;
  paraQuienSi: string[];
  paraQuienNo: string[];
  puntosFuertes: string[];
  puntosDebiles: string[];
  fuenteSpecs: string;
  verificadoEn?: string;
  specs: Record<string, unknown> & { tipo: ClaveTipo };
}

export type Direccion = 'mayor' | 'menor';

export function mediaEjesPresentes(v?: Valoraciones): number | null {
  if (!v) return null;
  const vals = [v.ergonomia, v.ajustabilidad, v.materiales, v.comodidad, v.calidadPrecio]
    .filter((n): n is number => n != null);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function notaGlobal(p: Producto): number | null {
  const media = mediaEjesPresentes(p.valoraciones);
  if (media != null) return media;
  if (p.valoracion != null) return Math.round(p.valoracion * 2 * 10) / 10;
  return null;
}

export function ganadoresPorValor(
  items: { slug: string; valor: number | null }[],
  direccion: Direccion
): string[] {
  const conValor = items.filter((i): i is { slug: string; valor: number } => i.valor != null);
  if (conValor.length === 0) return [];
  const mejor = conValor.reduce(
    (m, i) => (direccion === 'mayor' ? Math.max(m, i.valor) : Math.min(m, i.valor)),
    conValor[0].valor
  );
  return conValor.filter((i) => i.valor === mejor).map((i) => i.slug);
}

/** Lee una ruta tipo 'specs.garantiaAnios' o 'tramoPrecio'. Devuelve null si no existe. */
export function getCampo(p: Producto, ruta: string): unknown {
  const val = ruta.split('.').reduce<unknown>((o, k) => {
    if (o != null && typeof o === 'object' && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, p);
  return val === undefined ? null : val;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): productos lib core (notaGlobal, ganadoresPorValor, getCampo) (TDD)"
```

---

## Task 4: `seleccionarParesVs` + `construirIndiceBusqueda` (TDD)

**Files:**
- Modify: `src/lib/productos.ts`
- Modify: `src/lib/productos.test.ts`

- [ ] **Step 1: Añadir tests que fallan**

Añadir a `src/lib/productos.test.ts`:
```ts
import { seleccionarParesVs, construirIndiceBusqueda } from './productos';

describe('seleccionarParesVs', () => {
  const mk = (slug: string, tramo: number, val: number) => base({ slug, tramoPrecio: tramo, valoracion: val });
  it('empareja productos de tramo igual o adyacente, orden alfabético estable', () => {
    const ps = [mk('aeron', 4, 4.8), mk('leap', 4, 4.7), mk('markus', 1, 4.0)];
    const pares = seleccionarParesVs(ps, 8);
    expect(pares).toContainEqual(['aeron', 'leap']);
    expect(pares.every(([a, b]) => a < b)).toBe(true);
    expect(pares).not.toContainEqual(['aeron', 'markus']); // tramo 4 vs 1 → no
  });
  it('respeta el límite máximo de pares', () => {
    const ps = Array.from({ length: 10 }, (_, i) => mk(`s${i}`, 2, 4));
    expect(seleccionarParesVs(ps, 5).length).toBeLessThanOrEqual(5);
  });
});

describe('construirIndiceBusqueda', () => {
  it('incluye productos y artículos con su entidad', () => {
    const idx = construirIndiceBusqueda(
      [base({ slug: 'aeron', nombre: 'Aeron', marca: 'Herman Miller' })],
      [{ slug: 'guia', titulo: 'Guía sillas', categoria: 'sillas', tipo: 'comparativa' }]
    );
    expect(idx).toContainEqual(expect.objectContaining({ entidad: 'producto', slug: 'aeron', titulo: 'Aeron' }));
    expect(idx).toContainEqual(expect.objectContaining({ entidad: 'articulo', slug: 'guia' }));
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: FAIL — `seleccionarParesVs`/`construirIndiceBusqueda` no exportados.

- [ ] **Step 3: Implementar**

Añadir a `src/lib/productos.ts`:
```ts
export type ParVs = [string, string];

/**
 * Empareja productos cuyo tramo de precio sea igual o adyacente (|Δtramo| <= 1),
 * priorizando los mejor valorados. Devuelve pares [a,b] con a<b (orden alfabético)
 * para URLs estables. Limita a `max` pares.
 */
export function seleccionarParesVs(productos: Producto[], max: number): ParVs[] {
  const ordenados = [...productos].sort((a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0));
  const pares: ParVs[] = [];
  const vistos = new Set<string>();
  for (let i = 0; i < ordenados.length; i++) {
    for (let j = i + 1; j < ordenados.length; j++) {
      if (pares.length >= max) return pares;
      const a = ordenados[i], b = ordenados[j];
      if (Math.abs(a.tramoPrecio - b.tramoPrecio) > 1) continue;
      const [x, y] = a.slug < b.slug ? [a.slug, b.slug] : [b.slug, a.slug];
      const clave = `${x}|${y}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      pares.push([x, y]);
    }
  }
  return pares;
}

export interface ArticuloLite { slug: string; titulo: string; categoria: string; tipo: string; }
export interface EntradaIndice {
  entidad: 'producto' | 'articulo';
  slug: string;
  titulo: string;
  sub: string;
  tipo: string;
  url: string;
}

export function construirIndiceBusqueda(productos: Producto[], articulos: ArticuloLite[]): EntradaIndice[] {
  const p: EntradaIndice[] = productos.map((x) => ({
    entidad: 'producto', slug: x.slug, titulo: x.nombre, sub: x.marca, tipo: x.tipo,
    url: `/catalogo/${x.tipo}/${x.slug}/`,
  }));
  const a: EntradaIndice[] = articulos.map((x) => ({
    entidad: 'articulo', slug: x.slug, titulo: x.titulo, sub: x.categoria, tipo: x.tipo,
    url: `/${x.categoria}/${x.slug}/`,
  }));
  return [...p, ...a];
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: PASS (toda la suite).

- [ ] **Step 5: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat(catalogo): seleccionarParesVs + construirIndiceBusqueda (TDD)"
```

---

## Task 5: Migrar las 19 sillas a `src/content/productos/`

**Files:**
- Create: `src/content/productos/*.yaml` (19)

- [ ] **Step 1: Extraer los datos enriquecidos de la rama aparcada**

Run: `git show de550af:src/content/sillas/sihoo-doro-c300.yaml`
Expected: ver el YAML enriquecido (valoraciones, specs nuevas, veredicto, comunidad, etc.). Repetir para conocer el formato exacto de cada campo. Lista de los 19 archivos (mismos slugs):
```
autonomous-ergochair-pro durrafy-ergonomica flexispot-c7-lite hag-capisco haworth-fern
hbada-ergonomica herman-miller-aeron herman-miller-embody holludle-ergonomica ikea-jarvfjallet
ikea-markus secretlab-titan-evo sihoo-doro-c300 sihoo-m102c sihoo-m18 sihoo-m57
songmics-obn55bk steelcase-gesture steelcase-leap-v2
```

- [ ] **Step 2: Transformar cada YAML al schema `productos`**

Para CADA uno de los 19, crear `src/content/productos/<slug>.yaml` reestructurando los campos del YAML viejo (de `de550af`) al nuevo schema:
- Copiar al nivel raíz igual: `nombre`, `marca`, `imagen`, `imagenAlt`, `valoracion`,
  `valoraciones{...}`, `amazon{asin,buscar}`, `webOficial`, `idealPara`, `veredicto`, `comunidad`,
  `paraQuienSi`, `paraQuienNo`, `puntosFuertes`, `puntosDebiles`, `fuenteSpecs`, `verificadoEn`.
- Añadir al nivel raíz: `tipo: silla`.
- Derivar `tramoPrecio` desde el `precioAprox` viejo con estos cortes: `<150 → 1`, `150–349 → 2`,
  `350–699 → 3`, `>=700 → 4`. Poner `precioMin`/`precioMax` solo si la fuente daba un rango real; si
  el viejo solo tenía `precioAprox` puntual, dejar ambos en `null` (el tramo ya lo cubre).
- Mover a `specs:` (con `tipo: silla` dentro): `lumbar`, `respaldo`, `reposabrazos`,
  `profundidadRegulable`, `reclinacionMaxGrados`, `pesoMaxKg`, `alturaAsientoMinCm`,
  `alturaAsientoMaxCm`, `anchoCm`, `fondoCm`, `mecanismo`, `baseMaterial`, `certificacionBifma`,
  `pesoProductoKg`, `garantiaAnios`.

Estructura resultante (ejemplo ilustrativo con valores sintéticos; usa los REALES de `de550af`):
```yaml
tipo: "silla"
nombre: "SIHOO Doro C300"
marca: "SIHOO"
imagen: "https://m.media-amazon.com/images/I/EXAMPLE._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica SIHOO Doro C300"
tramoPrecio: 2
precioMin: null
precioMax: null
valoracion: 4.5
valoraciones:
  ergonomia: 8.8
  ajustabilidad: 8.0
  materiales: 8.5
  comodidad: 8.2
  calidadPrecio: 9.0
amazon:
  asin: "EXAMPLE0000"
  buscar: "SIHOO Doro C300"
webOficial: null
idealPara: "Jornada completa, ergonomía sin precio premium"
veredicto: "<copiar de de550af>"
comunidad: "<copiar de de550af>"
paraQuienSi: ["<copiar>"]
paraQuienNo: ["<copiar>"]
puntosFuertes: ["<copiar>"]
puntosDebiles: ["<copiar>"]
fuenteSpecs: "<copiar>"
verificadoEn: "2026-06-06"
specs:
  tipo: "silla"
  lumbar: "dinamico"
  respaldo: "malla"
  reposabrazos: "3d"
  profundidadRegulable: false
  reclinacionMaxGrados: 135
  pesoMaxKg: 150
  alturaAsientoMinCm: null
  alturaAsientoMaxCm: null
  anchoCm: null
  fondoCm: null
  mecanismo: "<copiar>"
  baseMaterial: "<copiar>"
  certificacionBifma: null
  pesoProductoKg: null
  garantiaAnios: 3
```
**No inventes datos.** Copia exactamente los valores de `de550af`. Donde el viejo tenía `null`, mantener `null`.

- [ ] **Step 3: Verificar que Zod valida los 19**

Run: `npm run build 2>&1 | tail -8`
Expected: build OK. Cualquier enum mal escrito, eje fuera de 0–10 o `tramoPrecio` fuera de 1–4 falla aquí. Corregir hasta verde.
Run: `ls src/content/productos/*.yaml | wc -l`
Expected: `19`.

- [ ] **Step 4: Commit**

```bash
git add src/content/productos/
git commit -m "feat(catalogo): migrate 19 enriched chairs to productos collection (tipo: silla)"
```

---

## Task 6: Componentes base de imagen y valoración

**Files:**
- Create: `src/components/producto/FallbackImagen.astro`
- Create: `src/components/producto/ImagenProducto.astro`
- Create: `src/components/producto/ValoracionEjes.astro`
- Create: `src/components/producto/ParaQuien.astro`

- [ ] **Step 1: Rescatar `FallbackImagen.astro` y `ParaQuien.astro` (verbatim)**

No dependen de `sillas`; se copian tal cual de la rama aparcada:
Run: `mkdir -p src/components/producto && git show 0f92c94:src/components/FallbackImagen.astro > src/components/producto/FallbackImagen.astro`
Run: `git show 6b831d9:src/components/ParaQuien.astro > src/components/producto/ParaQuien.astro`

- [ ] **Step 2: Crear `ImagenProducto.astro`**

`src/components/producto/ImagenProducto.astro`:
```astro
---
import FallbackImagen from './FallbackImagen.astro';
interface Props { imagen?: string; imagenAlt?: string; marca: string; nombre: string; size?: number; }
const { imagen, imagenAlt, marca, nombre, size = 200 } = Astro.props;
const tieneImagen = imagen != null && imagen.trim() !== '';
---
{tieneImagen ? (
  <img src={imagen} alt={imagenAlt ?? nombre} width={size} height={size} loading="lazy" decoding="async" class="img-prod" />
) : (
  <FallbackImagen marca={marca} nombre={nombre} size={size} />
)}
<style>
  .img-prod { object-fit: contain; background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 0.5rem; flex-shrink: 0; }
</style>
```

- [ ] **Step 3: Crear `ValoracionEjes.astro` (ejes desde tipoConfig)**

`src/components/producto/ValoracionEjes.astro`:
```astro
---
import { notaGlobal, type Producto } from '@/lib/productos';
import { getTipoConfig } from '@/lib/tipos';
interface Props { producto: Producto; }
const { producto } = Astro.props;
const cfg = getTipoConfig(producto.tipo);
const v = producto.valoraciones as unknown as Record<string, number | null>;
const ejes = (cfg?.ejes ?? []).map((e) => ({ etiqueta: e.etiqueta, valor: v?.[e.clave] ?? null }));
const global = notaGlobal(producto);
---
<section class="vejes">
  <div class="vejes-head">
    <h2>Valoración por ejes</h2>
    <span class="vejes-tag">editorial · specs + comunidad</span>
  </div>
  {global != null && (<p class="vejes-global"><strong>{global.toFixed(1)}</strong><span>/10 · nota global</span></p>)}
  <div class="vejes-bars">
    {ejes.map((e) => (
      <div class={`vejes-row${e.valor == null ? ' vejes-nd' : ''}`}>
        <span class="vejes-lbl">{e.etiqueta}</span>
        <span class="vejes-track"><span class="vejes-fill" style={`width:${e.valor == null ? 100 : e.valor * 10}%`}></span></span>
        <span class="vejes-val">{e.valor == null ? 'sin valorar' : e.valor.toFixed(1)}</span>
      </div>
    ))}
  </div>
</section>
<style>
  .vejes { margin: 1.5rem 0 2rem; }
  .vejes-head { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
  .vejes-head h2 { margin: 0; }
  .vejes-tag { font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); background: var(--color-bg-muted); padding: 0.2rem 0.5rem; border-radius: 6px; }
  .vejes-global { font-family: var(--font-display); margin: 0.5rem 0 1rem; }
  .vejes-global strong { font-size: 1.4rem; }
  .vejes-global span { color: var(--color-text-muted); font-size: 0.8rem; font-weight: 500; }
  .vejes-bars { display: grid; gap: 0.7rem; max-width: 520px; }
  .vejes-row { display: grid; grid-template-columns: 130px 1fr 70px; align-items: center; gap: 0.7rem; font-size: 0.85rem; }
  .vejes-track { height: 9px; background: var(--color-bg-muted); border-radius: 99px; overflow: hidden; }
  .vejes-fill { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--color-primary), #60a5fa); }
  .vejes-val { font-weight: 700; font-size: 0.82rem; text-align: right; }
  .vejes-nd .vejes-fill { background: repeating-linear-gradient(45deg, #e4e4e7, #e4e4e7 4px, #f4f4f5 4px, #f4f4f5 8px); }
  .vejes-nd .vejes-val { color: var(--color-text-muted); font-weight: 500; font-size: 0.72rem; }
</style>
```

- [ ] **Step 4: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK.

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/
git commit -m "feat(catalogo): base producto components (image, fallback, ValoracionEjes, ParaQuien)"
```

---

## Task 7: Helpers de formato + `TarjetaProducto.astro` (TDD para helpers)

**Files:**
- Modify: `src/lib/productos.ts`
- Modify: `src/lib/productos.test.ts`
- Create: `src/components/producto/TarjetaProducto.astro`

- [ ] **Step 1: Tests de los helpers**

Añadir a `src/lib/productos.test.ts`:
```ts
import { formatoSpec, tramoTexto, etiquetaEnum, reposabrazosNivel } from './productos';

describe('formatoSpec', () => {
  it('n/d para null', () => { expect(formatoSpec(null, 'kg')).toBe('n/d'); });
  it('aplica sufijos', () => {
    expect(formatoSpec(150, 'kg')).toBe('150 kg');
    expect(formatoSpec(135, 'grados')).toBe('135°');
    expect(formatoSpec(3, 'anios')).toBe('3 años');
    expect(formatoSpec(48, 'cm')).toBe('48 cm');
  });
  it('bool', () => { expect(formatoSpec(true, 'bool')).toBe('Sí'); expect(formatoSpec(false, 'bool')).toBe('No'); });
});

describe('tramoTexto', () => {
  it('símbolos €', () => { expect(tramoTexto(1)).toBe('€'); expect(tramoTexto(4)).toBe('€€€€'); });
});

describe('etiquetaEnum', () => {
  it('traduce y cae al valor crudo', () => {
    expect(etiquetaEnum('lumbar', 'dinamico')).toBe('Dinámico autoajustable');
    expect(etiquetaEnum('respaldo', 'malla')).toBe('Malla');
    expect(etiquetaEnum('lumbar', 'desconocido')).toBe('desconocido');
  });
});

describe('reposabrazosNivel', () => {
  it('mapea a nivel numérico', () => {
    expect(reposabrazosNivel('3d')).toBe(3);
    expect(reposabrazosNivel('ninguno')).toBe(0);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar helpers**

Añadir a `src/lib/productos.ts`:
```ts
export function tramoTexto(tramo: number): string {
  return '€'.repeat(Math.max(1, Math.min(4, tramo)));
}

export function formatoSpec(valor: unknown, formato?: string): string {
  if (formato === 'bool') return valor ? 'Sí' : 'No';
  if (valor == null) return 'n/d';
  switch (formato) {
    case 'kg': return `${valor} kg`;
    case 'grados': return `${valor}°`;
    case 'anios': return `${valor} años`;
    case 'cm': return `${valor} cm`;
    default: return String(valor);
  }
}

const ETIQUETAS: Record<string, Record<string, string>> = {
  lumbar: { fijo: 'Fijo', presion: 'Ajustable en presión', altura: 'Ajustable en altura', dinamico: 'Dinámico autoajustable', '5d': '5D ajustable' },
  reposabrazos: { ninguno: 'Ninguno', fijo: 'Fijos', '1d': '1D (altura)', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Abatibles' },
  respaldo: { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla + cojín' },
};

export function etiquetaEnum(campo: string, valor: string): string {
  return ETIQUETAS[campo]?.[valor] ?? valor;
}

export function reposabrazosNivel(v: string): number {
  return ({ ninguno: 0, fijo: 1, '1d': 1, '2d': 2, '3d': 3, '4d': 4, abatibles: 2 } as Record<string, number>)[v] ?? 0;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/productos.test.ts`
Expected: PASS.

- [ ] **Step 5: Crear `TarjetaProducto.astro`**

`src/components/producto/TarjetaProducto.astro`:
```astro
---
import BotonPrecio from '../BotonPrecio.astro';
import ImagenProducto from './ImagenProducto.astro';
import { notaGlobal, tramoTexto, etiquetaEnum, reposabrazosNivel, getCampo, type Producto } from '@/lib/productos';
interface Props { producto: Producto; }
const { producto: p } = Astro.props;
const global = notaGlobal(p);
const respaldo = getCampo(p, 'specs.respaldo') as string | null;
const garantia = getCampo(p, 'specs.garantiaAnios') as number | null;
const pesoMax = getCampo(p, 'specs.pesoMaxKg') as number | null;
const lumbar = getCampo(p, 'specs.lumbar') as string | null;
const reposabrazos = getCampo(p, 'specs.reposabrazos') as string | null;
const chips = [
  lumbar ? `Lumbar ${etiquetaEnum('lumbar', lumbar).toLowerCase()}` : null,
  respaldo ? etiquetaEnum('respaldo', respaldo) : null,
  pesoMax == null ? null : `${pesoMax} kg`,
  garantia == null ? 'garantía n/d' : `${garantia} años`,
].filter((c): c is string => c != null);
---
<article class="card"
  data-slug={p.slug}
  data-tramo={p.tramoPrecio}
  data-respaldo={respaldo ?? ''}
  data-brazos={reposabrazos ? reposabrazosNivel(reposabrazos) : 0}
  data-prof={getCampo(p, 'specs.profundidadRegulable') ? '1' : '0'}
  data-peso={pesoMax ?? ''}
  data-valoracion={p.valoracion ?? 0}>
  <label class="card-cmp"><input type="checkbox" class="cmp-chk" value={p.slug} /> comparar</label>
  <ImagenProducto imagen={p.imagen} imagenAlt={p.imagenAlt} marca={p.marca} nombre={p.nombre} size={110} />
  <div class="card-info">
    <span class="card-brand">{p.marca}</span>
    <a class="card-name" href={`/catalogo/${p.tipo}/${p.slug}/`}>{p.nombre}</a>
    <p class="card-line">
      {global != null && <span class="card-score">{global.toFixed(1)}/10</span>}
      <span class="card-price">{tramoTexto(p.tramoPrecio)}</span>
    </p>
    <div class="card-chips">
      {chips.map((c) => <span class={`chip${c.includes('n/d') ? ' chip-nd' : ''}`}>{c}</span>)}
    </div>
    <BotonPrecio amazon={p.amazon} webOficial={p.webOficial} nombre={p.nombre} />
  </div>
</article>
<style>
  .card { position: relative; display: flex; gap: 1rem; align-items: flex-start; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1rem; background: var(--color-bg); }
  .card.cmp-sel { border-color: var(--color-primary); box-shadow: 0 0 0 2px #bfdbfe; }
  .card-cmp { position: absolute; top: 0.6rem; right: 0.6rem; display: flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: var(--color-text-muted); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; padding: 0.2rem 0.5rem; cursor: pointer; }
  .card-info { flex: 1; min-width: 0; }
  .card-brand { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
  .card-name { font-family: var(--font-display); font-weight: 700; color: var(--color-text); text-decoration: none; display: block; margin: 0.05rem 0 0.3rem; }
  .card-name:hover { color: var(--color-primary); }
  .card-line { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 0.5rem; font-weight: 700; font-size: 0.92rem; }
  .card-score { background: var(--color-text); color: #fff; font-family: var(--font-display); font-size: 0.78rem; border-radius: 7px; padding: 0.1rem 0.45rem; }
  .card-price { color: var(--color-secondary); }
  .card-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.7rem; }
  .chip { font-size: 0.7rem; background: var(--color-bg-muted); color: #3f3f46; border-radius: 6px; padding: 0.1rem 0.45rem; }
  .chip-nd { color: var(--color-text-muted); font-style: italic; }
</style>
```

- [ ] **Step 6: Verificar build + commit**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK.
```bash
git add src/lib/productos.ts src/lib/productos.test.ts src/components/producto/TarjetaProducto.astro
git commit -m "feat(catalogo): spec format helpers (TDD) + TarjetaProducto"
```

---

## Task 8: `CatalogoProductos.astro` (filtros + orden + comparar)

**Files:**
- Create: `src/components/producto/CatalogoProductos.astro`

- [ ] **Step 1: Crear el componente**

`src/components/producto/CatalogoProductos.astro`:
```astro
---
import TarjetaProducto from './TarjetaProducto.astro';
import type { Producto } from '@/lib/productos';
interface Props { productos: Producto[]; tipo: string; }
const { productos, tipo } = Astro.props;
---
<section class="catalogo" data-tipo={tipo}>
  <div class="catalogo-filtros">
    <label>Precio máx
      <input type="range" id="f-precio" min="1" max="4" step="1" value="4" />
      <output id="f-precio-out">Sin límite</output>
    </label>
    <label>Respaldo
      <select id="f-respaldo">
        <option value="">Cualquiera</option>
        <option value="malla">Malla</option>
        <option value="espuma">Espuma</option>
        <option value="mixto">Mixto</option>
      </select>
    </label>
    <label>Reposabrazos mín.
      <select id="f-brazos">
        <option value="0">Cualquiera</option>
        <option value="2">2D+</option>
        <option value="3">3D+</option>
      </select>
    </label>
    <label class="catalogo-check"><input type="checkbox" id="f-prof" /> Profundidad regulable</label>
    <label class="catalogo-check"><input type="checkbox" id="f-peso" /> Soporta ≥130 kg</label>
    <label>Ordenar
      <select id="f-orden">
        <option value="valoracion">Mejor valoradas</option>
        <option value="precio-asc">Precio ↑</option>
        <option value="precio-desc">Precio ↓</option>
        <option value="peso-max">Más carga</option>
      </select>
    </label>
  </div>
  <p class="catalogo-count"><span id="catalogo-n">{productos.length}</span> productos · marca casillas para comparar</p>
  <div class="catalogo-grid" id="catalogo-grid">
    {productos.map((p) => <TarjetaProducto producto={p} />)}
  </div>
  <p class="catalogo-vacio" id="catalogo-vacio" hidden>Ninguno cumple esos filtros. Prueba a relajar alguno.</p>
</section>

<div class="cmp-bar" id="cmp-bar" hidden>
  Has seleccionado <strong id="cmp-n">0</strong>
  <a id="cmp-go" href={`/comparar/${tipo}/`}>Comparar ⚖️</a>
  <button id="cmp-clear" type="button">limpiar</button>
</div>

<style>
  .catalogo-filtros { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); }
  .catalogo-filtros label { display: flex; flex-direction: column; font-size: 0.8rem; font-weight: 600; gap: 0.25rem; color: var(--color-text-muted); }
  .catalogo-check { flex-direction: row !important; align-items: center; gap: 0.4rem; }
  .catalogo-count { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem; }
  .catalogo-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  .cmp-bar { position: fixed; left: 0; right: 0; bottom: 0; background: var(--color-text); color: #fff; display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 0.85rem; font-size: 0.88rem; z-index: 50; }
  .cmp-bar a { background: var(--color-secondary); color: #3a2a00; font-weight: 700; border-radius: 99px; padding: 0.5rem 1.25rem; text-decoration: none; }
  .cmp-bar a[aria-disabled="true"] { opacity: 0.5; pointer-events: none; }
  .cmp-bar button { background: transparent; color: #fff; border: 1px solid #555; border-radius: 8px; padding: 0.4rem 0.8rem; cursor: pointer; font: inherit; }
</style>

<script>
  const sec = document.querySelector('.catalogo') as HTMLElement | null;
  const grid = document.getElementById('catalogo-grid');
  if (sec && grid) {
    const tipo = sec.dataset.tipo || '';
    const cards = Array.from(grid.querySelectorAll('.card')) as HTMLElement[];
    const fPrecio = document.getElementById('f-precio') as HTMLInputElement;
    const fPrecioOut = document.getElementById('f-precio-out') as HTMLOutputElement;
    const fRespaldo = document.getElementById('f-respaldo') as HTMLSelectElement;
    const fBrazos = document.getElementById('f-brazos') as HTMLSelectElement;
    const fProf = document.getElementById('f-prof') as HTMLInputElement;
    const fPeso = document.getElementById('f-peso') as HTMLInputElement;
    const fOrden = document.getElementById('f-orden') as HTMLSelectElement;
    const nOut = document.getElementById('catalogo-n');
    const vacio = document.getElementById('catalogo-vacio');
    const num = (v: string) => (v === '' ? null : parseFloat(v));
    const cmp = (x: number, y: number) => (x === y ? 0 : x < y ? -1 : 1);

    function aplicar() {
      const tramoMax = parseFloat(fPrecio.value);
      const sinLimite = tramoMax >= parseFloat(fPrecio.max);
      fPrecioOut.textContent = sinLimite ? 'Sin límite' : '€'.repeat(tramoMax);
      let visibles = 0;
      cards.forEach((c) => {
        const tramo = num(c.dataset.tramo || '');
        const respaldo = c.dataset.respaldo || '';
        const brazos = parseInt(c.dataset.brazos || '0', 10);
        const prof = c.dataset.prof === '1';
        const peso = num(c.dataset.peso || '');
        let ok = true;
        if (tramo != null && tramo > tramoMax) ok = false;
        if (fRespaldo.value && respaldo !== fRespaldo.value) ok = false;
        if (parseInt(fBrazos.value, 10) > brazos) ok = false;
        if (fProf.checked && !prof) ok = false;
        if (fPeso.checked && (peso == null || peso < 130)) ok = false;
        c.style.display = ok ? '' : 'none';
        if (ok) visibles++;
      });
      const orden = fOrden.value;
      const vis = cards.filter((c) => c.style.display !== 'none');
      const val = (c: HTMLElement, k: string) => num(c.dataset[k] || '');
      vis.sort((a, b) => {
        if (orden === 'precio-asc') return cmp(val(a, 'tramo') ?? Infinity, val(b, 'tramo') ?? Infinity);
        if (orden === 'precio-desc') return cmp(val(b, 'tramo') ?? -Infinity, val(a, 'tramo') ?? -Infinity);
        if (orden === 'peso-max') return cmp(val(b, 'peso') ?? -Infinity, val(a, 'peso') ?? -Infinity);
        return cmp(val(b, 'valoracion') ?? 0, val(a, 'valoracion') ?? 0);
      });
      vis.forEach((c) => grid!.appendChild(c));
      if (nOut) nOut.textContent = String(visibles);
      if (vacio) (vacio as HTMLElement).hidden = visibles > 0;
    }
    [fPrecio, fRespaldo, fBrazos, fProf, fPeso, fOrden].forEach((el) => el.addEventListener('input', aplicar));
    aplicar();

    const KEY = `comparar-${tipo}`;
    const bar = document.getElementById('cmp-bar') as HTMLElement;
    const nEl = document.getElementById('cmp-n') as HTMLElement;
    const go = document.getElementById('cmp-go') as HTMLAnchorElement;
    const clear = document.getElementById('cmp-clear') as HTMLButtonElement;
    const checks = Array.from(grid.querySelectorAll('.cmp-chk')) as HTMLInputElement[];
    const leer = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
    const guardar = (a: string[]) => localStorage.setItem(KEY, JSON.stringify(a));
    function pintar() {
      const sel = leer();
      checks.forEach((ch) => { ch.checked = sel.includes(ch.value); ch.closest('.card')?.classList.toggle('cmp-sel', ch.checked); });
      nEl.textContent = String(sel.length);
      bar.hidden = sel.length === 0;
      const ok = sel.length >= 2 && sel.length <= 4;
      go.setAttribute('aria-disabled', ok ? 'false' : 'true');
      go.href = ok ? `/comparar/${tipo}/?s=${sel.join(',')}` : `/comparar/${tipo}/`;
    }
    checks.forEach((ch) => ch.addEventListener('change', () => {
      let sel = leer();
      if (ch.checked) { if (!sel.includes(ch.value)) { if (sel.length >= 4) { ch.checked = false; alert('Puedes comparar hasta 4.'); return; } sel.push(ch.value); } }
      else { sel = sel.filter((s) => s !== ch.value); }
      guardar(sel); pintar();
    }));
    clear.addEventListener('click', () => { guardar([]); pintar(); });
    pintar();
  }
</script>
```

- [ ] **Step 2: Verificar build + commit**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK. Si cambia `public/_headers` (hash de script inline), inclúyelo.
```bash
git add src/components/producto/CatalogoProductos.astro
git add public/_headers 2>/dev/null || true
git commit -m "feat(catalogo): CatalogoProductos (filters, sort, compare selection)"
```

---

## Task 9: `FichaProducto.astro` + rutas de catálogo (hub, tipo, ficha)

**Files:**
- Create: `src/components/producto/FichaProducto.astro`
- Create: `src/pages/catalogo/index.astro`
- Create: `src/pages/catalogo/[tipo]/index.astro`
- Create: `src/pages/catalogo/[tipo]/[slug].astro`

- [ ] **Step 1: Crear `FichaProducto.astro`**

`src/components/producto/FichaProducto.astro`:
```astro
---
import BotonPrecio from '../BotonPrecio.astro';
import ImagenProducto from './ImagenProducto.astro';
import ValoracionEjes from './ValoracionEjes.astro';
import ParaQuien from './ParaQuien.astro';
import { notaGlobal, tramoTexto, formatoSpec, etiquetaEnum, getCampo, type Producto } from '@/lib/productos';
import { getTipoConfig } from '@/lib/tipos';
interface Props { producto: Producto; }
const { producto: p } = Astro.props;
const cfg = getTipoConfig(p.tipo);
const global = notaGlobal(p);
const ENUM_CAMPOS = new Set(['specs.lumbar', 'specs.reposabrazos', 'specs.respaldo']);
function render(campo: string, formato?: string): string {
  const v = getCampo(p, campo);
  if (ENUM_CAMPOS.has(campo) && typeof v === 'string') return etiquetaEnum(campo.split('.').pop()!, v);
  return formatoSpec(v, formato);
}
const grupos = (cfg?.fichaSpecs ?? []).map((g) => ({
  titulo: g.titulo,
  filas: g.filas.map((f) => ({ etiqueta: f.etiqueta, valor: render(f.campo, f.formato) })),
}));
---
<article class="ficha">
  <header class="ficha-header">
    <ImagenProducto imagen={p.imagen} imagenAlt={p.imagenAlt} marca={p.marca} nombre={p.nombre} size={200} />
    <div>
      <p class="ficha-marca">{p.marca}</p>
      <h1 class="ficha-nombre">{p.nombre}</h1>
      <p class="ficha-precio">{tramoTexto(p.tramoPrecio)}{global != null && <span class="ficha-nota">★ {global.toFixed(1)}/10</span>}</p>
      {p.idealPara && <p class="ficha-ideal">Ideal para: {p.idealPara}</p>}
      <BotonPrecio amazon={p.amazon} webOficial={p.webOficial} nombre={p.nombre} />
    </div>
  </header>

  <ValoracionEjes producto={p} />

  {p.veredicto && <div class="ficha-veredicto"><strong>Veredicto.</strong> {p.veredicto}</div>}

  <h2>Ficha técnica</h2>
  {grupos.map((g) => (
    <div class="ficha-grupo">
      <h3>{g.titulo}</h3>
      <table class="ficha-specs"><tbody>
        {g.filas.map((f) => (
          <tr><th scope="row">{f.etiqueta}</th><td class={f.valor === 'n/d' ? 'ficha-nd' : ''}>{f.valor}</td></tr>
        ))}
      </tbody></table>
    </div>
  ))}

  {p.comunidad && (<><h2>Qué dice la comunidad</h2><p class="ficha-comunidad">{p.comunidad}</p></>)}

  <ParaQuien si={p.paraQuienSi ?? []} no={p.paraQuienNo ?? []} />

  {p.puntosFuertes.length > 0 && (<><h2>Lo que destaca</h2><ul>{p.puntosFuertes.map((x) => <li>{x}</li>)}</ul></>)}
  {p.puntosDebiles.length > 0 && (<><h2>Lo que no convence</h2><ul>{p.puntosDebiles.map((x) => <li>{x}</li>)}</ul></>)}

  <p class="ficha-fuente">
    Datos: {p.fuenteSpecs}{p.verificadoEn ? ` · verificado el ${p.verificadoEn}` : ''}.
    Las valoraciones por ejes son editoriales (specs + consenso de la comunidad). "n/d" = sin dato verificado; verifica la ficha del fabricante antes de comprar.
  </p>
</article>
<style>
  .ficha-header { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start; margin-bottom: 1.5rem; }
  .ficha-marca { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem; color: var(--color-text-muted); margin: 0; }
  .ficha-nombre { font-family: var(--font-display); margin: 0.2rem 0 0.5rem; }
  .ficha-precio { font-weight: 700; font-size: 1.2rem; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; color: var(--color-secondary); }
  .ficha-nota { color: var(--color-secondary); font-size: 0.9rem; }
  .ficha-ideal { color: var(--color-text-muted); font-size: 0.9rem; margin: 0 0 1rem; }
  .ficha-veredicto { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 0.9rem 1.1rem; font-size: 0.95rem; margin: 0 0 2rem; }
  .ficha-grupo { margin-bottom: 1.5rem; }
  .ficha-grupo h3 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 0.4rem; }
  .ficha-specs { width: 100%; border-collapse: collapse; }
  .ficha-specs th, .ficha-specs td { text-align: left; padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--color-border); }
  .ficha-specs th { width: 50%; color: var(--color-text-muted); font-weight: 600; }
  .ficha-nd { color: var(--color-text-muted); font-style: italic; }
  .ficha-comunidad { background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 1rem 1.1rem; font-size: 0.92rem; }
  .ficha-fuente { font-size: 0.8rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: 2rem; }
</style>
```

- [ ] **Step 2: Crear el hub `/catalogo/`**

`src/pages/catalogo/index.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import { getCollection } from 'astro:content';
import { TIPOS, TIPOS_CON_DATOS } from '@/lib/tipos';

const productos = await getCollection('productos');
const conteo = (tipo: string) => productos.filter((p) => p.data.tipo === tipo).length;
const tarjetas = TIPOS_CON_DATOS.map((slug) => ({ cfg: TIPOS[slug], n: conteo(slug) }));
const titulo = 'Catálogo de equipamiento para home office | Tu Espacio de Trabajo';
const descripcion = 'Base de datos comparativa de equipamiento de home office: sillas ergonómicas y más, con specs verificadas, valoración por ejes y comparador.';
---
<Base title={titulo} description={descripcion}>
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <span>Catálogo</span></nav>
    <h1>Catálogo</h1>
    <p class="cat-sub">Specs verificadas, valoración por ejes y comparador. Elige una categoría.</p>
    <div class="cat-hub">
      {tarjetas.map(({ cfg, n }) => (
        <a class="cat-hub-card" href={`/catalogo/${cfg.slug}/`}>
          <span class="cat-hub-ico" aria-hidden="true">{cfg.icono}</span>
          <span class="cat-hub-tit">{cfg.labelPlural}</span>
          <span class="cat-hub-n">{n} productos</span>
        </a>
      ))}
    </div>
  </main>
</Base>
<style>
  .cat-sub { color: var(--color-text-muted); margin-bottom: 2rem; }
  .cat-hub { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .cat-hub-card { display: flex; flex-direction: column; gap: 0.3rem; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); text-decoration: none; color: inherit; transition: border-color .15s, transform .15s; }
  .cat-hub-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
  .cat-hub-ico { font-size: 2rem; }
  .cat-hub-tit { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
  .cat-hub-n { color: var(--color-text-muted); font-size: 0.85rem; }
</style>
```

- [ ] **Step 3: Crear `/catalogo/[tipo]/index.astro`**

`src/pages/catalogo/[tipo]/index.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import CatalogoProductos from '@/components/producto/CatalogoProductos.astro';
import { getCollection } from 'astro:content';
import { TIPOS_CON_DATOS, getTipoConfig } from '@/lib/tipos';
import type { Producto } from '@/lib/productos';

export async function getStaticPaths() {
  return TIPOS_CON_DATOS.map((tipo) => ({ params: { tipo } }));
}
const { tipo } = Astro.params;
const cfg = getTipoConfig(tipo as string)!;
const entries = await getCollection('productos', (p) => p.data.tipo === tipo);
const productos = entries.map((e) => ({ slug: e.id.replace(/\.(ya?ml|json)$/, ''), ...e.data })) as unknown as Producto[];
const siteUrl = 'https://tuespaciodetrabajo.com';
const itemList = {
  '@context': 'https://schema.org', '@type': 'ItemList', name: `${cfg.labelPlural} para home office`,
  numberOfItems: productos.length,
  itemListElement: productos.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/catalogo/${tipo}/${p.slug}/`, name: p.nombre })),
};
---
<Base title={`${cfg.labelPlural} para home office | Catálogo`} description={`Catálogo comparativo de ${cfg.labelPlural.toLowerCase()} con specs verificadas y valoración por ejes.`}>
  <script is:inline type="application/ld+json" set:html={JSON.stringify(itemList)} slot="head" />
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <a href="/catalogo/">Catálogo</a> › <span>{cfg.labelPlural}</span></nav>
    <h1>{cfg.labelPlural}</h1>
    <CatalogoProductos productos={productos} tipo={tipo as string} />
  </main>
</Base>
```

- [ ] **Step 4: Crear `/catalogo/[tipo]/[slug].astro` (ficha + Review schema)**

`src/pages/catalogo/[tipo]/[slug].astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import FichaProducto from '@/components/producto/FichaProducto.astro';
import { getCollection } from 'astro:content';
import { notaGlobal, type Producto } from '@/lib/productos';
import { getTipoConfig } from '@/lib/tipos';

export async function getStaticPaths() {
  const entries = await getCollection('productos');
  return entries.map((e) => {
    const slug = e.id.replace(/\.(ya?ml|json)$/, '');
    return { params: { tipo: e.data.tipo, slug }, props: { producto: { slug, ...e.data } } };
  });
}
const { producto } = Astro.props as { producto: Producto };
const cfg = getTipoConfig(producto.tipo)!;
const nota = notaGlobal(producto);
const siteUrl = 'https://tuespaciodetrabajo.com';
const productSchema = {
  '@context': 'https://schema.org', '@type': 'Product', name: producto.nombre,
  brand: { '@type': 'Brand', name: producto.marca },
  ...(producto.imagen ? { image: producto.imagen } : {}),
};
const reviewSchema = nota == null ? null : {
  '@context': 'https://schema.org', '@type': 'Review',
  itemReviewed: { '@type': 'Product', name: producto.nombre, brand: { '@type': 'Brand', name: producto.marca } },
  reviewRating: { '@type': 'Rating', ratingValue: String(nota), bestRating: '10', worstRating: '0' },
  author: { '@type': 'Organization', name: 'Tu Espacio de Trabajo' },
  ...(producto.veredicto ? { reviewBody: producto.veredicto } : {}),
};
const breadcrumb = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${siteUrl}/catalogo/` },
    { '@type': 'ListItem', position: 3, name: cfg.labelPlural, item: `${siteUrl}/catalogo/${producto.tipo}/` },
    { '@type': 'ListItem', position: 4, name: producto.nombre, item: `${siteUrl}/catalogo/${producto.tipo}/${producto.slug}/` },
  ],
};
---
<Base title={`${producto.nombre} — análisis y specs | Tu Espacio de Trabajo`} description={producto.veredicto ?? `Análisis de ${producto.nombre}: specs verificadas y valoración por ejes.`}>
  <script is:inline type="application/ld+json" set:html={JSON.stringify(productSchema)} slot="head" />
  {reviewSchema && <script is:inline type="application/ld+json" set:html={JSON.stringify(reviewSchema)} slot="head" />}
  <script is:inline type="application/ld+json" set:html={JSON.stringify(breadcrumb)} slot="head" />
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <a href="/catalogo/">Catálogo</a> › <a href={`/catalogo/${producto.tipo}/`}>{cfg.labelPlural}</a> › <span>{producto.nombre}</span></nav>
    <FichaProducto producto={producto} />
  </main>
</Base>
```

- [ ] **Step 5: Verificar build + schemas**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK. Rutas `/catalogo/`, `/catalogo/silla/` y 19 fichas generadas.
Run: `grep -rl '"@type":"Review"' dist/catalogo/silla/ | wc -l`
Expected: ≥ 1.
Run: `grep -rl "FAQPage" dist/ | wc -l; grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.

- [ ] **Step 6: Commit**

```bash
git add src/components/producto/FichaProducto.astro src/pages/catalogo/
git commit -m "feat(catalogo): FichaProducto + catalog routes (hub, tipo, ficha + Review schema)"
```

---

## Task 10: Comparador interactivo `/comparar/[tipo]/`

**Files:**
- Create: `src/components/producto/ComparadorProductos.astro`
- Create: `src/pages/comparar/[tipo]/index.astro`

- [ ] **Step 1: Crear `ComparadorProductos.astro`**

`src/components/producto/ComparadorProductos.astro`:
```astro
---
import { getTipoConfig } from '@/lib/tipos';
import type { Producto } from '@/lib/productos';
interface Props { productos: Producto[]; tipo: string; }
const { productos, tipo } = Astro.props;
const cfg = getTipoConfig(tipo)!;
const datos = JSON.stringify({ productos, comparador: cfg.comparador });
---
<section class="cmp" data-json={datos} data-tipo={tipo}>
  <div id="cmp-out"></div>
  <p id="cmp-empty" class="cmp-empty" hidden>Elige entre 2 y 4 en el <a href={`/catalogo/${tipo}/`}>catálogo</a> (casillas "comparar") y vuelve aquí.</p>
</section>
<style>
  .cmp-empty { color: var(--color-text-muted); }
  .cmp-scroll { overflow-x: auto; }
  .cmp-table { border-collapse: collapse; width: 100%; min-width: 640px; }
  .cmp-table td, .cmp-table th { padding: 0.7rem 0.8rem; border-bottom: 1px solid var(--color-border); text-align: left; font-size: 0.86rem; vertical-align: middle; }
  .cmp-attr { color: var(--color-text-muted); font-weight: 600; font-size: 0.8rem; position: sticky; left: 0; background: var(--color-bg); width: 180px; }
  .cmp-grp td { background: var(--color-bg-muted); font-family: var(--font-display); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
  .cmp-name { font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; }
  .cmp-name a { color: inherit; text-decoration: none; }
  .cmp-global { font-family: var(--font-display); font-weight: 700; margin-top: 0.2rem; }
  .cmp-global small { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 500; }
  .cmp-rm { font-size: 0.7rem; color: var(--color-text-muted); border: 1px solid var(--color-border); border-radius: 6px; padding: 0.1rem 0.4rem; background: none; cursor: pointer; margin-top: 0.3rem; }
  .cmp-win { background: #ecfdf5; box-shadow: inset 3px 0 0 #16a34a; }
  .cmp-wtag { font-size: 0.58rem; font-weight: 700; color: #16a34a; text-transform: uppercase; margin-left: 0.3rem; }
  .cmp-nd { color: var(--color-text-muted); font-style: italic; }
  .cmp-cta { display: inline-block; background: var(--color-primary); color: #fff; font-weight: 600; font-size: 0.78rem; padding: 0.45rem 0.9rem; border-radius: 8px; text-decoration: none; }
  .cmp-legend { font-size: 0.76rem; color: var(--color-text-muted); margin-top: 0.8rem; }
</style>
<script>
  import { ganadoresPorValor, notaGlobal, formatoSpec, etiquetaEnum, tramoTexto, getCampo, type Producto } from '@/lib/productos';
  import { buildAmazonHref } from '@/lib/sillas';

  const root = document.querySelector('.cmp') as HTMLElement | null;
  if (root) {
    const { productos, comparador } = JSON.parse(root.dataset.json || '{"productos":[],"comparador":[]}') as {
      productos: Producto[]; comparador: { campo: string; etiqueta: string; direccion?: 'mayor' | 'menor'; grupo: string }[];
    };
    const tipo = root.dataset.tipo || '';
    const out = root.querySelector('#cmp-out') as HTMLElement;
    const empty = root.querySelector('#cmp-empty') as HTMLElement;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    const ENUM = new Set(['specs.lumbar', 'specs.reposabrazos', 'specs.respaldo']);

    const slugs = (new URLSearchParams(location.search).get('s') || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 4);
    const sel = slugs.map((s) => productos.find((p) => p.slug === s)).filter((p): p is Producto => p != null);

    if (sel.length < 2) { empty.hidden = false; }
    else {
      function celda(p: Producto, campo: string): string {
        const v = getCampo(p, campo);
        if (campo === 'tramoPrecio') return tramoTexto(Number(v));
        if (ENUM.has(campo) && typeof v === 'string') return etiquetaEnum(campo.split('.').pop()!, v);
        if (campo.startsWith('valoraciones.')) return v == null ? '<span class="cmp-nd">sin valorar</span>' : `<b>${Number(v).toFixed(1)}</b>`;
        const fmt = campo.includes('garantia') ? 'anios' : campo.includes('peso') ? 'kg' : campo.includes('reclin') ? 'grados' : undefined;
        return v == null ? '<span class="cmp-nd">n/d</span>' : formatoSpec(v, fmt);
      }
      const head = sel.map((p) => {
        const g = notaGlobal(p);
        const href = buildAmazonHref(p.amazon) || p.webOficial || '';
        const cta = href ? `<a class="cmp-cta" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${buildAmazonHref(p.amazon) ? 'Ver precio' : 'Web oficial'}</a><br>` : '';
        return `<td><div class="cmp-name"><a href="/catalogo/${tipo}/${esc(p.slug)}/">${esc(p.nombre)}</a></div>${g != null ? `<div class="cmp-global">${g.toFixed(1)}<small>/10</small></div>` : ''}${cta}<button class="cmp-rm" data-slug="${esc(p.slug)}">✕ quitar</button></td>`;
      }).join('');

      let lastGrupo = '';
      const body = comparador.map((fila) => {
        let pre = '';
        if (fila.grupo !== lastGrupo) { lastGrupo = fila.grupo; pre = `<tr class="cmp-grp"><td class="cmp-attr">${esc(fila.grupo)}</td>${sel.map(() => '<td></td>').join('')}</tr>`; }
        const gan = fila.direccion ? ganadoresPorValor(sel.map((p) => ({ slug: p.slug, valor: (getCampo(p, fila.campo) as number | null) })), fila.direccion) : [];
        const cells = sel.map((p) => {
          const win = gan.includes(p.slug);
          return `<td class="${win ? 'cmp-win' : ''}">${celda(p, fila.campo)}${win ? '<span class="cmp-wtag">mejor</span>' : ''}</td>`;
        }).join('');
        return `${pre}<tr><td class="cmp-attr">${esc(fila.etiqueta)}</td>${cells}</tr>`;
      }).join('');

      out.innerHTML = `<div class="cmp-scroll"><table class="cmp-table"><thead><tr><td class="cmp-attr"></td>${head}</tr></thead><tbody>${body}</tbody></table></div><p class="cmp-legend">Celda resaltada = mejor valor de la fila. "n/d"/"sin valorar" no gana. Valoraciones por ejes editoriales.</p>`;
      out.querySelectorAll('.cmp-rm').forEach((b) => b.addEventListener('click', () => {
        const slug = (b as HTMLElement).dataset.slug;
        const rest = sel.filter((p) => p.slug !== slug).map((p) => p.slug);
        location.search = rest.length ? `?s=${rest.join(',')}` : '';
      }));
    }
  }
</script>
```
> Nota: `buildAmazonHref` se reusa de `@/lib/sillas` (existe en `main`). Confirma su firma con `git show main:src/lib/sillas.ts | grep -n buildAmazonHref`. Si no existiera en `main`, replícalo en `productos.ts` con la misma lógica y ajusta el import.

- [ ] **Step 2: Crear la página `/comparar/[tipo]/index.astro` (noindex)**

`src/pages/comparar/[tipo]/index.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import ComparadorProductos from '@/components/producto/ComparadorProductos.astro';
import { getCollection } from 'astro:content';
import { TIPOS_CON_DATOS, getTipoConfig } from '@/lib/tipos';
import type { Producto } from '@/lib/productos';

export async function getStaticPaths() {
  return TIPOS_CON_DATOS.map((tipo) => ({ params: { tipo } }));
}
const { tipo } = Astro.params;
const cfg = getTipoConfig(tipo as string)!;
const entries = await getCollection('productos', (p) => p.data.tipo === tipo);
const productos = entries.map((e) => ({ slug: e.id.replace(/\.(ya?ml|json)$/, ''), ...e.data })) as unknown as Producto[];
---
<Base title={`Comparador de ${cfg.labelPlural.toLowerCase()} | Tu Espacio de Trabajo`} description={`Compara ${cfg.labelPlural.toLowerCase()} lado a lado: valoración por ejes, precio y specs, resaltando la mejor de cada criterio.`} noindex={true}>
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/catalogo/">Catálogo</a> › <a href={`/catalogo/${tipo}/`}>{cfg.labelPlural}</a> › <span>Comparar</span></nav>
    <h1>Comparativa de {cfg.labelPlural.toLowerCase()}</h1>
    <ComparadorProductos productos={productos} tipo={tipo as string} />
  </main>
</Base>
```

- [ ] **Step 3: Verificar build + noindex**

Run: `npm run build 2>&1 | grep -E 'comparar' | head`
Expected: aparece `/comparar/silla/index.html`.
Run: `grep -o 'noindex' dist/comparar/silla/index.html | head -1`
Expected: `noindex`.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/ComparadorProductos.astro src/pages/comparar/
git add public/_headers 2>/dev/null || true
git commit -m "feat(catalogo): interactive comparator /comparar/[tipo] (noindex, winner highlighting)"
```

---

## Task 11: Páginas "vs" estáticas `/comparar/[tipo]/[par]`

**Files:**
- Create: `src/components/producto/TablaVs.astro`
- Create: `src/pages/comparar/[tipo]/[par].astro`

- [ ] **Step 1: Crear `TablaVs.astro` (render servidor, indexable)**

`src/components/producto/TablaVs.astro`:
```astro
---
import { notaGlobal, tramoTexto, formatoSpec, etiquetaEnum, ganadoresPorValor, getCampo, type Producto } from '@/lib/productos';
import { getTipoConfig } from '@/lib/tipos';
import BotonPrecio from '../BotonPrecio.astro';
interface Props { a: Producto; b: Producto; tipo: string; }
const { a, b, tipo } = Astro.props;
const cfg = getTipoConfig(tipo)!;
const sel = [a, b];
const ENUM = new Set(['specs.lumbar', 'specs.reposabrazos', 'specs.respaldo']);
function celda(p: Producto, campo: string): string {
  const v = getCampo(p, campo);
  if (campo === 'tramoPrecio') return tramoTexto(Number(v));
  if (ENUM.has(campo) && typeof v === 'string') return etiquetaEnum(campo.split('.').pop()!, v);
  if (campo.startsWith('valoraciones.')) return v == null ? 'sin valorar' : Number(v).toFixed(1);
  const fmt = campo.includes('garantia') ? 'anios' : campo.includes('peso') ? 'kg' : campo.includes('reclin') ? 'grados' : undefined;
  return formatoSpec(v, fmt);
}
let lastGrupo = '';
const filas = cfg.comparador.map((f) => {
  const grupo = f.grupo !== lastGrupo ? (lastGrupo = f.grupo, f.grupo) : null;
  const gan = f.direccion ? ganadoresPorValor(sel.map((p) => ({ slug: p.slug, valor: getCampo(p, f.campo) as number | null })), f.direccion) : [];
  return { grupo, etiqueta: f.etiqueta, a: celda(a, f.campo), b: celda(b, f.campo), ganaA: gan.includes(a.slug), ganaB: gan.includes(b.slug) };
});
const notaA = notaGlobal(a), notaB = notaGlobal(b);
---
<div class="vs-scroll">
  <table class="vs-table">
    <thead><tr><td></td>
      <th><a href={`/catalogo/${tipo}/${a.slug}/`}>{a.nombre}</a>{notaA != null && <div class="vs-nota">★ {notaA.toFixed(1)}/10</div>}<BotonPrecio amazon={a.amazon} webOficial={a.webOficial} nombre={a.nombre} /></th>
      <th><a href={`/catalogo/${tipo}/${b.slug}/`}>{b.nombre}</a>{notaB != null && <div class="vs-nota">★ {notaB.toFixed(1)}/10</div>}<BotonPrecio amazon={b.amazon} webOficial={b.webOficial} nombre={b.nombre} /></th>
    </tr></thead>
    <tbody>
      {filas.map((f) => (<>
        {f.grupo && <tr class="vs-grp"><td>{f.grupo}</td><td></td><td></td></tr>}
        <tr><th scope="row">{f.etiqueta}</th>
          <td class={f.ganaA ? 'vs-win' : ''} set:html={f.a + (f.ganaA ? ' <span class="vs-wtag">mejor</span>' : '')} />
          <td class={f.ganaB ? 'vs-win' : ''} set:html={f.b + (f.ganaB ? ' <span class="vs-wtag">mejor</span>' : '')} />
        </tr>
      </>))}
    </tbody>
  </table>
</div>
<style>
  .vs-scroll { overflow-x: auto; }
  .vs-table { border-collapse: collapse; width: 100%; min-width: 520px; }
  .vs-table th, .vs-table td { padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--color-border); text-align: left; font-size: 0.88rem; }
  .vs-table thead a { font-family: var(--font-display); font-weight: 700; color: inherit; text-decoration: none; }
  .vs-nota { color: var(--color-secondary); font-size: 0.8rem; margin: 0.2rem 0; }
  .vs-grp td { background: var(--color-bg-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-family: var(--font-display); }
  .vs-win { background: #ecfdf5; box-shadow: inset 3px 0 0 #16a34a; }
  .vs-wtag { font-size: 0.58rem; font-weight: 700; color: #16a34a; text-transform: uppercase; }
</style>
```

- [ ] **Step 2: Crear `/comparar/[tipo]/[par].astro`**

`src/pages/comparar/[tipo]/[par].astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import TablaVs from '@/components/producto/TablaVs.astro';
import { getCollection } from 'astro:content';
import { TIPOS_CON_DATOS, getTipoConfig } from '@/lib/tipos';
import { seleccionarParesVs, notaGlobal, type Producto } from '@/lib/productos';

const MAX_PARES = 16;
export async function getStaticPaths() {
  const paths: any[] = [];
  for (const tipo of TIPOS_CON_DATOS) {
    const entries = await getCollection('productos', (p) => p.data.tipo === tipo);
    const productos = entries.map((e) => ({ slug: e.id.replace(/\.(ya?ml|json)$/, ''), ...e.data })) as unknown as Producto[];
    const porSlug = Object.fromEntries(productos.map((p) => [p.slug, p]));
    for (const [a, b] of seleccionarParesVs(productos, MAX_PARES)) {
      paths.push({ params: { tipo, par: `${a}-vs-${b}` }, props: { a: porSlug[a], b: porSlug[b] } });
    }
  }
  return paths;
}
const { tipo } = Astro.params;
const { a, b } = Astro.props as { a: Producto; b: Producto };
const cfg = getTipoConfig(tipo as string)!;
const siteUrl = 'https://tuespaciodetrabajo.com';
const ganadora = (notaGlobal(a) ?? 0) >= (notaGlobal(b) ?? 0) ? a : b;
const titulo = `${a.nombre} vs ${b.nombre}: comparativa y cuál elegir`;
const desc = `Comparamos ${a.nombre} y ${b.nombre} en ergonomía, materiales, precio y garantía. Tabla lado a lado y veredicto.`;
const breadcrumb = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${siteUrl}/catalogo/` },
    { '@type': 'ListItem', position: 3, name: cfg.labelPlural, item: `${siteUrl}/catalogo/${tipo}/` },
    { '@type': 'ListItem', position: 4, name: `${a.nombre} vs ${b.nombre}`, item: `${siteUrl}/comparar/${tipo}/${a.slug}-vs-${b.slug}/` },
  ],
};
---
<Base title={`${titulo} | Tu Espacio de Trabajo`} description={desc}>
  <script is:inline type="application/ld+json" set:html={JSON.stringify(breadcrumb)} slot="head" />
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/catalogo/">Catálogo</a> › <a href={`/catalogo/${tipo}/`}>{cfg.labelPlural}</a> › <span>{a.nombre} vs {b.nombre}</span></nav>
    <h1>{a.nombre} vs {b.nombre}</h1>
    <p class="vs-intro">Comparativa lado a lado de dos {cfg.labelPlural.toLowerCase()} de gama similar. La celda verde marca el mejor valor de cada fila.</p>
    <TablaVs a={a} b={b} tipo={tipo as string} />
    <div class="vs-veredicto">
      <h2>¿Cuál elegir?</h2>
      <p>Por valoración global editorial, destaca <strong>{ganadora.nombre}</strong>. {a.veredicto ? `${a.nombre}: ${a.veredicto} ` : ''}{b.veredicto ? `${b.nombre}: ${b.veredicto}` : ''}</p>
      <p class="vs-nota-honesta">Valoraciones editoriales (specs + consenso). Verifica precio y disponibilidad antes de comprar.</p>
    </div>
  </main>
</Base>
<style>
  .vs-intro { color: var(--color-text-muted); margin-bottom: 1.5rem; }
  .vs-veredicto { margin-top: 2rem; background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 1.25rem; }
  .vs-veredicto h2 { margin-top: 0; }
  .vs-nota-honesta { font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0; }
</style>
```

- [ ] **Step 3: Verificar build + indexabilidad**

Run: `npm run build 2>&1 | grep -cE 'comparar/silla/.+-vs-.+'`
Expected: número > 0 (páginas vs generadas, hasta 16).
Run: `FILE=$(ls dist/comparar/silla/*-vs-*/index.html | head -1); grep -c 'noindex' "$FILE"`
Expected: `0` (las vs SÍ se indexan).

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/TablaVs.astro src/pages/comparar/
git commit -m "feat(catalogo): static vs comparison pages (indexable, curated pairs)"
```

---

## Task 12: Buscador global `/buscar/` + índice JSON + SearchAction

**Files:**
- Create: `src/pages/buscar-indice.json.ts`
- Create: `src/pages/buscar.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Confirmar los campos de `articulos`**

Run: `grep -n "articulos" -A40 src/content/config.ts | grep -nE "titulo|categoria|tipo|fecha|descripcion"`
Expected: ver los nombres reales de los campos para usarlos en el endpoint (ajusta si difieren de `titulo`/`categoria`/`tipo`).

- [ ] **Step 2: Endpoint del índice de búsqueda**

`src/pages/buscar-indice.json.ts`:
```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { construirIndiceBusqueda, type Producto, type ArticuloLite } from '@/lib/productos';

export const GET: APIRoute = async () => {
  const prodEntries = await getCollection('productos');
  const productos = prodEntries.map((e) => ({ slug: e.id.replace(/\.(ya?ml|json)$/, ''), ...e.data })) as unknown as Producto[];
  const artEntries = await getCollection('articulos');
  const articulos: ArticuloLite[] = artEntries.map((e) => ({
    slug: e.slug, titulo: e.data.titulo, categoria: e.data.categoria, tipo: e.data.tipo,
  }));
  const indice = construirIndiceBusqueda(productos, articulos);
  return new Response(JSON.stringify(indice), { headers: { 'Content-Type': 'application/json' } });
};
```
> Si `articulos` usa `e.id` en vez de `e.slug`, o nombres de campo distintos (Step 1), ajústalo aquí.

- [ ] **Step 3: Página del buscador (noindex)**

`src/pages/buscar.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
---
<Base title="Buscar | Tu Espacio de Trabajo" description="Busca productos y guías en Tu Espacio de Trabajo." noindex={true}>
  <main class="container" style="padding: 2rem 0;">
    <h1>Buscar</h1>
    <input type="search" id="q" class="buscar-input" placeholder="Busca sillas, guías…" autocomplete="off" autofocus />
    <p id="buscar-hint" class="buscar-hint">Escribe para buscar en productos y artículos.</p>
    <ul id="buscar-res" class="buscar-res"></ul>
  </main>
</Base>
<style>
  .buscar-input { width: 100%; max-width: 560px; font-size: 1.1rem; padding: 0.8rem 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  .buscar-hint { color: var(--color-text-muted); font-size: 0.85rem; margin: 0.6rem 0 1.2rem; }
  .buscar-res { list-style: none; padding: 0; display: grid; gap: 0.5rem; max-width: 640px; }
  .buscar-res li a { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); text-decoration: none; color: inherit; }
  .buscar-res li a:hover { border-color: var(--color-primary); }
  .buscar-tag { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); background: var(--color-bg-muted); border-radius: 6px; padding: 0.15rem 0.5rem; align-self: center; white-space: nowrap; }
</style>
<script>
  interface Entrada { entidad: string; slug: string; titulo: string; sub: string; tipo: string; url: string; }
  const q = document.getElementById('q') as HTMLInputElement;
  const res = document.getElementById('buscar-res') as HTMLElement;
  const hint = document.getElementById('buscar-hint') as HTMLElement;
  let indice: Entrada[] = [];
  fetch('/buscar-indice.json').then((r) => r.json()).then((d) => { indice = d; });
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function buscar() {
    const term = norm(q.value.trim());
    if (!term) { res.innerHTML = ''; hint.hidden = false; return; }
    hint.hidden = true;
    const hits = indice.filter((e) => norm(`${e.titulo} ${e.sub}`).includes(term)).slice(0, 20);
    res.innerHTML = hits.length
      ? hits.map((e) => `<li><a href="${e.url}"><span><strong>${e.titulo}</strong><br><small>${e.sub}</small></span><span class="buscar-tag">${e.entidad === 'producto' ? e.tipo : 'artículo'}</span></a></li>`).join('')
      : '<li style="color:var(--color-text-muted)">Sin resultados.</li>';
  }
  q.addEventListener('input', buscar);
</script>
```

- [ ] **Step 4: Añadir `WebSite`+`SearchAction` en la home**

Lee `src/pages/index.astro` para colocar el script junto a los schemas existentes (usa `slot="head"` si el layout lo usa). Añadir:
```astro
<script is:inline type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org', '@type': 'WebSite',
  url: 'https://tuespaciodetrabajo.com/',
  potentialAction: { '@type': 'SearchAction', target: 'https://tuespaciodetrabajo.com/buscar?q={search_term_string}', 'query-input': 'required name=search_term_string' },
})} slot="head" />
```

- [ ] **Step 5: Verificar build**

Run: `npm run build 2>&1 | tail -3 && ls dist/buscar-indice.json dist/buscar/index.html`
Expected: build OK; ambos existen.
Run: `grep -o 'noindex' dist/buscar/index.html | head -1`
Expected: `noindex`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/buscar-indice.json.ts src/pages/buscar.astro src/pages/index.astro
git commit -m "feat(catalogo): global search (/buscar) + JSON index + WebSite SearchAction"
```

---

## Task 13: Blog de actualidad `/actualidad/`

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/pages/actualidad/index.astro`

- [ ] **Step 1: Añadir `noticia` al enum `tipo` de `articulos`**

Run: `grep -n "tipo:" src/content/config.ts`
Expected: localizar el `z.enum([...])` del campo `tipo` de la colección `articulos`.
Editar ese enum para incluir `'noticia'` junto a los valores existentes. NO quitar valores existentes. Anota los valores reales que veas (los usarás en las tabs del Step 2).

- [ ] **Step 2: Crear el listado `/actualidad/`**

Primero confirma los campos: `grep -n "articulos" -A40 src/content/config.ts | grep -E "titulo|fecha|categoria|descripcion|tipo"`.
`src/pages/actualidad/index.astro` (ajusta `descripcion`/`fecha`/`titulo`/`categoria` a los nombres reales si difieren):
```astro
---
import Base from '@/layouts/Base.astro';
import { getCollection } from 'astro:content';

const todos = await getCollection('articulos');
const ordenados = todos.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
const TABS = [
  { id: 'todos', label: 'Todo' },
  { id: 'noticia', label: 'Noticias' },
  { id: 'comparativa', label: 'Guías' },
  { id: 'informativo', label: 'Tips' },
];
---
<Base title="Actualidad y guías de home office | Tu Espacio de Trabajo" description="Noticias, guías y análisis de equipamiento para teletrabajo: novedades, comparativas y consejos.">
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <span>Actualidad</span></nav>
    <h1>Actualidad</h1>
    <div class="act-tabs" id="act-tabs">
      {TABS.map((t) => <button class="act-tab" data-tab={t.id} aria-pressed={t.id === 'todos'}>{t.label}</button>)}
    </div>
    <ul class="act-list" id="act-list">
      {ordenados.map((a) => (
        <li class="act-item" data-tipo={a.data.tipo}>
          <a href={`/${a.data.categoria}/${a.slug}/`}>
            <span class="act-meta">{a.data.tipo} · {a.data.fecha.toLocaleDateString('es-ES')}</span>
            <span class="act-tit">{a.data.titulo}</span>
            {a.data.descripcion && <span class="act-exc">{a.data.descripcion}</span>}
          </a>
        </li>
      ))}
    </ul>
  </main>
</Base>
<style>
  .act-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0 1.5rem; }
  .act-tab { background: var(--color-bg-muted); border: 1px solid var(--color-border); border-radius: 99px; padding: 0.35rem 0.9rem; font: inherit; font-size: 0.85rem; cursor: pointer; }
  .act-tab[aria-pressed="true"] { background: var(--color-text); color: #fff; border-color: var(--color-text); }
  .act-list { list-style: none; padding: 0; display: grid; gap: 0.25rem; max-width: 720px; }
  .act-item a { display: grid; gap: 0.2rem; padding: 0.9rem 0; border-bottom: 1px solid var(--color-border); text-decoration: none; color: inherit; }
  .act-meta { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
  .act-tit { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; }
  .act-tit:hover { color: var(--color-primary); }
  .act-exc { font-size: 0.9rem; color: var(--color-text-muted); }
</style>
<script>
  const tabs = document.getElementById('act-tabs');
  const items = Array.from(document.querySelectorAll('#act-list .act-item')) as HTMLElement[];
  tabs?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.act-tab') as HTMLElement | null;
    if (!btn) return;
    const tab = btn.dataset.tab;
    tabs.querySelectorAll('.act-tab').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    items.forEach((it) => { it.style.display = (tab === 'todos' || it.dataset.tipo === tab) ? '' : 'none'; });
  });
</script>
```

- [ ] **Step 3: Verificar build + commit**

Run: `npm run build 2>&1 | tail -3 && ls dist/actualidad/index.html`
Expected: build OK; archivo existe.
```bash
git add src/content/config.ts src/pages/actualidad/index.astro
git commit -m "feat(catalogo): actualidad blog listing + noticia article type"
```

---

## Task 14: Navegación (header, home) + redirects de rutas viejas

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/pages/index.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Añadir enlaces al header**

Run: `sed -n '1,40p' src/components/Header.astro`
Expected: ver el array de enlaces de navegación.
Añadir al array (sin romper el formato existente):
```
{ href: '/catalogo/', label: 'Catálogo' }
{ href: '/buscar/', label: 'Buscar' }
{ href: '/actualidad/', label: 'Actualidad' }
```
(El "Comparar" se alcanza desde cada catálogo; no requiere enlace global.)

- [ ] **Step 2: Bloque CTA al catálogo en la home**

Lee `src/pages/index.astro` y añade tras el hero una sección con 2 CTAs:
```astro
<section class="container" style="padding: 2.5rem 0;">
  <div class="home-catalogo-cta">
    <h2>Catálogo comparativo de equipamiento</h2>
    <p>Specs verificadas, valoración por ejes y comparador lado a lado. Empezamos por sillas; más categorías en camino.</p>
    <div class="home-cta-row">
      <a class="affiliate-button" href="/catalogo/">Explorar catálogo</a>
      <a class="affiliate-button" href="/catalogo/silla/">Comparar sillas</a>
    </div>
  </div>
</section>
<style>
  .home-catalogo-cta { border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.75rem; background: var(--color-bg-muted); }
  .home-cta-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
</style>
```
> Usa la clase de botón real de la home (revisa el CSS global; `affiliate-button` se usa en `[categoria]/index.astro`). Si quieres un botón secundario, usa la clase secundaria existente; no inventes clases sin definirlas.

- [ ] **Step 3: Redirects de rutas viejas de producto**

Run: `sed -n '1,60p' astro.config.mjs`
Expected: ver `defineConfig` y si ya existe `redirects`.
Añadir/fusionar en `defineConfig({ ... })`:
```js
  redirects: {
    '/sillas/catalogo': '/catalogo/silla',
    '/sillas/catalogo/[slug]': '/catalogo/silla/[slug]',
    '/sillas/comparar': '/comparar/silla',
    '/sillas/selector': '/catalogo/silla',
  },
```
> Defensivo (esas URLs solo existieron en la rama aparcada). Si ya hay `redirects`, fusiona sin duplicar claves.

- [ ] **Step 4: Verificar build + commit**

Run: `npm run build 2>&1 | tail -4`
Expected: build OK; header con enlaces nuevos; home con bloque CTA.
```bash
git add src/components/Header.astro src/pages/index.astro astro.config.mjs
git commit -m "feat(catalogo): nav links (catalogo/buscar/actualidad), home CTA, legacy redirects"
```

---

## Task 15: Verificación final + pulido

**Files:** (ajustes de estilo si procede)

- [ ] **Step 1: Suite de tests**

Run: `npm run test` (o `npx vitest run`)
Expected: PASS — toda `src/lib/productos.test.ts`.

- [ ] **Step 2: Build limpio**

Run: `npm run build 2>&1 | tail -6`
Expected: build OK. Rutas presentes: `/catalogo/`, `/catalogo/silla/`, 19 fichas, `/comparar/silla/`, páginas `*-vs-*`, `/buscar/`, `/buscar-indice.json`, `/actualidad/`.

- [ ] **Step 3: Schemas e indexabilidad**

Run: `grep -rl "FAQPage" dist/ | wc -l; grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.
Run: `grep -rl '"@type":"Review"' dist/catalogo/silla/ | wc -l`
Expected: 19.
Run: `grep -o 'noindex' dist/comparar/silla/index.html dist/buscar/index.html | wc -l`
Expected: `2`.
Run: `FILE=$(ls dist/comparar/silla/*-vs-*/index.html | head -1); grep -c noindex "$FILE"`
Expected: `0`.

- [ ] **Step 4: Revisión visual local**

Run: `npm run dev` y abrir:
- `/catalogo/` — hub con "Sillas (19 productos)".
- `/catalogo/silla/` — 19 tarjetas, filtros, casillas → barra "Comparar".
- `/comparar/silla/?s=herman-miller-aeron,steelcase-leap-v2` — tabla, ganador por fila.
- una `/comparar/silla/<a>-vs-<b>/` — página vs con veredicto.
- `/catalogo/silla/herman-miller-aeron/` — ficha con ejes, veredicto, specs n/d, comunidad, para-quién.
- `/buscar/` — "aeron" devuelve la ficha; "silla" lista varias.
- `/actualidad/` — listado con tabs.
Validar aspecto profesional e identidad propia; iterar estilos si algo se ve pobre.

- [ ] **Step 5: Commit final (si hubo ajustes)**

```bash
git add -A
git commit -m "polish(catalogo): visual refinements after review"
```

---

## Self-Review (rellenado al escribir el plan)

**Cobertura del spec:**
- Colección `productos` unión discriminada → Task 1. ✅
- Registro `tipos.ts` → Task 2. ✅
- Lógica pura testeada → Tasks 3,4,7. ✅
- Migración datos sillas (rescate `de550af`) → Task 5. ✅
- Componentes genéricos (imagen, ejes, para-quién, tarjeta, catálogo, ficha) → Tasks 6,7,8,9. ✅
- Rutas catálogo (hub/tipo/ficha) + Review honesto → Task 9. ✅
- Comparador interactivo noindex → Task 10. ✅
- Páginas "vs" estáticas indexables (pares curados) → Task 11. ✅
- Buscador global + índice JSON + SearchAction → Task 12. ✅
- Blog actualidad (`tipo: noticia`) → Task 13. ✅
- Nav header/home + redirects → Task 14. ✅
- Precio en tramos €, sin precio exacto en schema → Tasks 1,7,9. ✅
- Verificación (tests, schemas, noindex) → Task 15. ✅

**Consistencia de tipos:** `Producto`, `Valoraciones`, `getCampo`, `notaGlobal`, `ganadoresPorValor`,
`tramoTexto`, `formatoSpec`, `etiquetaEnum`, `reposabrazosNivel`, `seleccionarParesVs`,
`construirIndiceBusqueda`, `EntradaIndice`, `ArticuloLite`, `TipoConfig`, `getTipoConfig`,
`TIPOS`, `TIPOS_CON_DATOS` — definidos en Tasks 2-3-4-7 y usados con la misma firma en 6-15.

**Sin placeholders:** cada paso de código incluye el código completo. Los rescates verbatim
(FallbackImagen, ParaQuien) se traen con `git show <sha>:<ruta>` (contenido exacto recuperable).
Los `<copiar de de550af>` de Task 5 son datos reales a transcribir (no placeholders de código): la
investigación honesta por silla es trabajo de ejecución, con la fuente exacta indicada.

**Riesgos conocidos:** (1) nombres de campo de `articulos` (`titulo`/`categoria`/`tipo`/`fecha`/`descripcion`)
se confirman en Tasks 12-13 (Steps de `grep` incluidos). (2) `buildAmazonHref` se reusa de
`@/lib/sillas` (existe en `main`; verificación incluida en Task 10). (3) pares "vs" limitados a 16.
