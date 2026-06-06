# Catálogo de sillas con DB estructurada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, para la categoría sillas (piloto), una base de datos estructurada de productos que alimente un catálogo filtrable, fichas individuales indexables, un selector guiado y tablas comparativas embebidas, con specs verificables y mínimo de botones Amazon.

**Architecture:** Colección de datos Astro `sillas` (validada por Zod en build) como fuente única. Lógica pura (filtros, orden, matcher, construcción de href Amazon OneLink-ready) en `src/lib/sillas.ts`, testeada con Vitest. Componentes `.astro` que consumen lib + colección. Rutas literales `src/pages/sillas/catalogo/` y `src/pages/sillas/selector.astro` (estáticas, ganan prioridad sobre las dinámicas `[categoria]/[slug]`, sin colisión).

**Tech Stack:** Astro 5 (static), TypeScript, Zod (vía astro:content), Vitest (nuevo, solo para lógica pura), JS vanilla en cliente (sin framework → proteger CWV).

**Spec de referencia:** `docs/superpowers/specs/2026-06-06-catalogo-sillas-db-design.md`

---

## File Structure

**Crear:**
- `vitest.config.ts` — config mínima de Vitest.
- `src/content/sillas/*.yaml` — una entrada por silla (datos verificables).
- `src/lib/sillas.ts` — tipos `Silla`/`FiltrosSillas` + funciones puras: `buildAmazonHref`, `reposabrazosNivel`, `filtrarSillas`, `ordenarSillas`, `recomendarSilla`.
- `src/lib/sillas.test.ts` — tests unitarios de la lógica pura.
- `src/components/BotonPrecio.astro` — 1 CTA por producto (OneLink-ready).
- `src/components/CatalogoSillas.astro` — grid + filtros + orden (JS vanilla).
- `src/components/SelectorSillas.astro` — wizard 3 pasos.
- `src/components/FichaSilla.astro` — bloque de ficha individual (specs + CTA).
- `src/components/TablaComparativaDB.astro` — tabla comparativa por `slug`s para artículos.
- `src/pages/sillas/catalogo/index.astro` — `/sillas/catalogo/`.
- `src/pages/sillas/catalogo/[slug].astro` — `/sillas/catalogo/[slug]/`.
- `src/pages/sillas/selector.astro` — `/sillas/selector/`.

**Modificar:**
- `package.json` — devDeps Vitest + script `test`.
- `src/content/config.ts` — añadir colección `sillas`.
- `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx` — migrar la tabla de specs Markdown a `<TablaComparativaDB>`.

---

## Task 1: Vitest setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Instalar Vitest**

Run:
```bash
npm install -D vitest
```
Expected: añade `vitest` a devDependencies, exit 0.

- [ ] **Step 2: Añadir script de test**

En `package.json`, dentro de `"scripts"`, añadir:
```json
"test": "vitest run"
```

- [ ] **Step 3: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Verificar que Vitest arranca**

Run: `npx vitest run`
Expected: "No test files found" (aún no hay tests) y exit 0, o mensaje equivalente sin error de config.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for pure-logic unit tests"
```

---

## Task 2: Colección de datos `sillas` (schema Zod) + seed inicial

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/sillas/sihoo-doro-c300.yaml`, `src/content/sillas/flexispot-c7-lite.yaml`, `src/content/sillas/holludle-ergonomica.yaml`, `src/content/sillas/hbada-ergonomica.yaml`, `src/content/sillas/sihoo-m102c.yaml`, `src/content/sillas/durrafy-ergonomica.yaml`

- [ ] **Step 1: Añadir la colección `sillas` en `src/content/config.ts`**

Tras la definición de `articulos` y antes de `export const collections`, añadir:
```ts
const LUMBAR = ['fijo', 'presion', 'altura', 'dinamico', '5d'] as const;
const REPOSABRAZOS = ['ninguno', '1d', '2d', '3d', '4d', 'abatibles'] as const;
const RESPALDO = ['malla', 'espuma', 'mixto'] as const;

const sillas = defineCollection({
  type: 'data',
  schema: z.object({
    nombre: z.string(),
    marca: z.string(),
    imagen: z.string().optional(),
    imagenAlt: z.string().optional(),
    precioAprox: z.number().nullable(),
    lumbar: z.enum(LUMBAR),
    reposabrazos: z.enum(REPOSABRAZOS),
    respaldo: z.enum(RESPALDO),
    profundidadRegulable: z.boolean(),
    pesoMaxKg: z.number().nullable(),
    alturaAsientoMinCm: z.number().nullable(),
    alturaAsientoMaxCm: z.number().nullable(),
    reclinacionMaxGrados: z.number().nullable(),
    garantiaAnios: z.number().nullable(),
    valoracion: z.number().min(0).max(5),
    puntosFuertes: z.array(z.string()).default([]),
    puntosDebiles: z.array(z.string()).default([]),
    idealPara: z.string().optional(),
    amazon: z.object({
      asin: z.string().optional(),
      buscar: z.string().optional(),
    }).optional(),
    webOficial: z.string().url().nullable().default(null),
    fuenteSpecs: z.string(),
    verificadoEn: z.string(),
  }),
});
```

Y cambiar la última línea a:
```ts
export const collections = { articulos, sillas };
```

- [ ] **Step 2: Crear las 6 entradas seed (de la comparativa faro)**

`src/content/sillas/sihoo-doro-c300.yaml`:
```yaml
nombre: "SIHOO Doro C300"
marca: "SIHOO"
imagen: "https://m.media-amazon.com/images/I/7194RcPKLOL._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica SIHOO Doro C300"
precioAprox: 320
lumbar: "dinamico"
reposabrazos: "3d"
respaldo: "malla"
profundidadRegulable: false
pesoMaxKg: 150
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: 135
garantiaAnios: 3
valoracion: 4.5
puntosFuertes:
  - "Soporte lumbar dinámico autoajustable"
  - "Malla BM densa que mantiene la forma"
  - "Reposabrazos 3D"
  - "Soporta hasta 150 kg"
puntosDebiles:
  - "Precio alto dentro de la gama"
  - "Malla firme las primeras semanas"
idealPara: "Jornada completa, máxima ergonomía sin precio premium"
amazon:
  asin: "B0C3T865C2"
  buscar: "SIHOO Doro C300"
webOficial: null
fuenteSpecs: "Ficha Amazon.es + web SIHOO"
verificadoEn: "2026-06-06"
```

`src/content/sillas/flexispot-c7-lite.yaml`:
```yaml
nombre: "FlexiSpot C7 Lite"
marca: "FlexiSpot"
imagen: "https://m.media-amazon.com/images/I/41ie3wEJhPL._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica FlexiSpot C7 Lite"
precioAprox: 250
lumbar: "5d"
reposabrazos: "3d"
respaldo: "mixto"
profundidadRegulable: false
pesoMaxKg: 130
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: null
valoracion: 4.5
puntosFuertes:
  - "Soporte lumbar 5D"
  - "Reposacabezas y reposabrazos 3D"
  - "Cojín transpirable"
  - "Base de aluminio robusta"
puntosDebiles:
  - "No es barata: compite en gama media"
  - "Asiento firme para menos de 60 kg (según reseñas)"
idealPara: "Muchos ajustes sin llegar a 300 €, prioridad transpiración"
amazon:
  asin: "B0F6XL3SFG"
  buscar: "FlexiSpot C7 Lite"
webOficial: null
fuenteSpecs: "Ficha Amazon.es + web FlexiSpot"
verificadoEn: "2026-06-06"
```

`src/content/sillas/holludle-ergonomica.yaml`:
```yaml
nombre: "HOLLUDLE Silla Ergonómica"
marca: "HOLLUDLE"
imagen: "https://m.media-amazon.com/images/I/71Gt43giOPL._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica HOLLUDLE con profundidad de asiento regulable"
precioAprox: 210
lumbar: "altura"
reposabrazos: "abatibles"
respaldo: "malla"
profundidadRegulable: true
pesoMaxKg: 125
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: 2
valoracion: 4
puntosFuertes:
  - "Profundidad de asiento regulable (rara a este precio)"
  - "Reposacabezas ajustable en altura y ángulo"
  - "Soporte lumbar integrado"
puntosDebiles:
  - "Malla del respaldo algo fina (según reseñas)"
  - "Instrucciones de montaje mejorables"
idealPara: "Alturas fuera de la media (menos de 1,65 m o más de 1,85 m)"
amazon:
  asin: "B0BLNHPM3P"
  buscar: "HOLLUDLE silla ergonómica"
webOficial: null
fuenteSpecs: "Ficha Amazon.es"
verificadoEn: "2026-06-06"
```

`src/content/sillas/hbada-ergonomica.yaml`:
```yaml
nombre: "Hbada Silla Ergonómica"
marca: "Hbada"
imagen: "https://m.media-amazon.com/images/I/61L8eCtWCFL._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica Hbada con reposapiés retráctil"
precioAprox: 190
lumbar: "fijo"
reposabrazos: "1d"
respaldo: "mixto"
profundidadRegulable: false
pesoMaxKg: 120
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: 2
valoracion: 4
puntosFuertes:
  - "Reposapiés retráctil integrado"
  - "Diseño discreto"
  - "Malla transpirable en respaldo"
puntosDebiles:
  - "Soporte lumbar fijo (no ajustable en altura)"
  - "Asiento de espuma, no malla completa"
  - "Reposabrazos solo altura"
idealPara: "Quien prioriza estética y reposapiés integrado"
amazon:
  asin: "B0CH7RBQQ7"
  buscar: "Hbada silla ergonómica"
webOficial: null
fuenteSpecs: "Ficha Amazon.es"
verificadoEn: "2026-06-06"
```

`src/content/sillas/sihoo-m102c.yaml`:
```yaml
nombre: "SIHOO M102C"
marca: "SIHOO"
imagen: "https://m.media-amazon.com/images/I/31pKOaVpQiL._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica SIHOO M102C con reposabrazos abatibles"
precioAprox: 190
lumbar: "altura"
reposabrazos: "abatibles"
respaldo: "malla"
profundidadRegulable: false
pesoMaxKg: 125
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: 2
valoracion: 4
puntosFuertes:
  - "Soporte lumbar ajustable"
  - "Reposacabezas regulable"
  - "Reposabrazos abatibles, útiles en espacios pequeños"
puntosDebiles:
  - "Menos historial de reseñas que la M18"
  - "Ajustes por debajo de Doro C300 y C7 Lite"
idealPara: "Primera silla ergonómica SIHOO por debajo de 200 €"
amazon:
  asin: "B0CLLRNFB8"
  buscar: "SIHOO M102C"
webOficial: null
fuenteSpecs: "Ficha Amazon.es"
verificadoEn: "2026-06-06"
```

`src/content/sillas/durrafy-ergonomica.yaml`:
```yaml
nombre: "Durrafy Silla Ergonómica"
marca: "Durrafy"
imagen: "https://m.media-amazon.com/images/I/619GSz1-BML._AC_SL300_.jpg"
imagenAlt: "Silla ergonómica Durrafy económica"
precioAprox: 130
lumbar: "presion"
reposabrazos: "1d"
respaldo: "malla"
profundidadRegulable: false
pesoMaxKg: 120
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: 2
valoracion: 3.5
puntosFuertes:
  - "El precio más bajo de la comparativa"
  - "Soporte lumbar y reposacabezas incluidos"
puntosDebiles:
  - "Lumbar no ajustable en altura, solo presión"
  - "Materiales inferiores al tacto (según reseñas)"
  - "Asiento estrecho para personas anchas"
idealPara: "Presupuesto limitado a 130-140 €, silla de transición"
amazon:
  asin: "B0C3BZHVK8"
  buscar: "Durrafy silla ergonómica"
webOficial: null
fuenteSpecs: "Ficha Amazon.es"
verificadoEn: "2026-06-06"
```

- [ ] **Step 3: Verificar que Zod valida los datos en build**

Run: `npm run build 2>&1 | tail -5`
Expected: build completa sin errores de validación de colección (si un campo no cumple el schema, Astro falla aquí).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/sillas/
git commit -m "feat(sillas): add structured data collection with 6 seed chairs"
```

---

## Task 3: `buildAmazonHref` (TDD)

**Files:**
- Create: `src/lib/sillas.ts`
- Create: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`src/lib/sillas.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildAmazonHref } from './sillas';

describe('buildAmazonHref', () => {
  it('usa el ASIN cuando existe', () => {
    expect(buildAmazonHref({ asin: 'B0C3T865C2' })).toBe(
      'https://www.amazon.es/dp/B0C3T865C2?tag=tuespaciodet-21'
    );
  });

  it('usa búsqueda por nombre como fallback si no hay asin', () => {
    expect(buildAmazonHref({ buscar: 'SIHOO Doro C300' })).toBe(
      'https://www.amazon.es/s?k=SIHOO+Doro+C300&tag=tuespaciodet-21'
    );
  });

  it('devuelve null si no hay asin ni buscar', () => {
    expect(buildAmazonHref({})).toBeNull();
    expect(buildAmazonHref(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — "Failed to resolve import './sillas'" o "buildAmazonHref is not a function".

- [ ] **Step 3: Implementación mínima**

`src/lib/sillas.ts`:
```ts
export const AMAZON_TAG = 'tuespaciodet-21';

export interface SillaAmazon {
  asin?: string;
  buscar?: string;
}

export function buildAmazonHref(amazon?: SillaAmazon): string | null {
  if (amazon?.asin) {
    return `https://www.amazon.es/dp/${amazon.asin}?tag=${AMAZON_TAG}`;
  }
  if (amazon?.buscar) {
    const q = encodeURIComponent(amazon.buscar).replace(/%20/g, '+');
    return `https://www.amazon.es/s?k=${q}&tag=${AMAZON_TAG}`;
  }
  return null;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): buildAmazonHref (asin preferred, search fallback, OneLink-ready)"
```

---

## Task 4: `reposabrazosNivel` + `filtrarSillas` (TDD)

**Files:**
- Modify: `src/lib/sillas.ts`
- Modify: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir al final de `src/lib/sillas.test.ts`:
```ts
import { reposabrazosNivel, filtrarSillas } from './sillas';
import type { Silla } from './sillas';

const FIXTURE: Silla[] = [
  { slug: 'a', nombre: 'A', marca: 'A', precioAprox: 320, lumbar: 'dinamico', reposabrazos: '3d', respaldo: 'malla', profundidadRegulable: false, pesoMaxKg: 150, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: 135, garantiaAnios: 3, valoracion: 4.5, puntosFuertes: [], puntosDebiles: [] },
  { slug: 'b', nombre: 'B', marca: 'B', precioAprox: 130, lumbar: 'presion', reposabrazos: '1d', respaldo: 'malla', profundidadRegulable: false, pesoMaxKg: 120, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: null, garantiaAnios: 2, valoracion: 3.5, puntosFuertes: [], puntosDebiles: [] },
  { slug: 'c', nombre: 'C', marca: 'C', precioAprox: 210, lumbar: 'altura', reposabrazos: 'abatibles', respaldo: 'espuma', profundidadRegulable: true, pesoMaxKg: 125, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: null, garantiaAnios: 2, valoracion: 4, puntosFuertes: [], puntosDebiles: [] },
];

describe('reposabrazosNivel', () => {
  it('mapea las etiquetas a número', () => {
    expect(reposabrazosNivel('3d')).toBe(3);
    expect(reposabrazosNivel('1d')).toBe(1);
    expect(reposabrazosNivel('abatibles')).toBe(2);
    expect(reposabrazosNivel('ninguno')).toBe(0);
  });
});

describe('filtrarSillas', () => {
  it('sin filtros devuelve todas', () => {
    expect(filtrarSillas(FIXTURE, {}).length).toBe(3);
  });
  it('filtra por precio máximo', () => {
    expect(filtrarSillas(FIXTURE, { precioMax: 215 }).map(s => s.slug)).toEqual(['b', 'c']);
  });
  it('filtra por respaldo', () => {
    expect(filtrarSillas(FIXTURE, { respaldo: 'malla' }).map(s => s.slug)).toEqual(['a', 'b']);
  });
  it('filtra por profundidad regulable', () => {
    expect(filtrarSillas(FIXTURE, { profundidadRegulable: true }).map(s => s.slug)).toEqual(['c']);
  });
  it('filtra por nivel mínimo de reposabrazos', () => {
    expect(filtrarSillas(FIXTURE, { reposabrazosMin: 3 }).map(s => s.slug)).toEqual(['a']);
  });
  it('filtra por carga mínima (pesoMaxKg)', () => {
    expect(filtrarSillas(FIXTURE, { pesoMin: 130 }).map(s => s.slug)).toEqual(['a']);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — `Silla`, `reposabrazosNivel`, `filtrarSillas` no exportados.

- [ ] **Step 3: Implementación**

Añadir a `src/lib/sillas.ts`:
```ts
export type Lumbar = 'fijo' | 'presion' | 'altura' | 'dinamico' | '5d';
export type Reposabrazos = 'ninguno' | '1d' | '2d' | '3d' | '4d' | 'abatibles';
export type Respaldo = 'malla' | 'espuma' | 'mixto';

export interface Silla {
  slug: string;
  nombre: string;
  marca: string;
  imagen?: string;
  imagenAlt?: string;
  precioAprox: number | null;
  lumbar: Lumbar;
  reposabrazos: Reposabrazos;
  respaldo: Respaldo;
  profundidadRegulable: boolean;
  pesoMaxKg: number | null;
  alturaAsientoMinCm: number | null;
  alturaAsientoMaxCm: number | null;
  reclinacionMaxGrados: number | null;
  garantiaAnios: number | null;
  valoracion: number;
  puntosFuertes: string[];
  puntosDebiles: string[];
  idealPara?: string;
  amazon?: SillaAmazon;
  webOficial?: string | null;
  fuenteSpecs?: string;
  verificadoEn?: string;
}

export interface FiltrosSillas {
  precioMax?: number;
  respaldo?: Respaldo;
  profundidadRegulable?: boolean;
  reposabrazosMin?: number;
  pesoMin?: number;
}

const NIVEL_REPOSABRAZOS: Record<Reposabrazos, number> = {
  ninguno: 0,
  '1d': 1,
  abatibles: 2,
  '2d': 2,
  '3d': 3,
  '4d': 4,
};

export function reposabrazosNivel(r: Reposabrazos): number {
  return NIVEL_REPOSABRAZOS[r] ?? 0;
}

export function filtrarSillas(sillas: Silla[], f: FiltrosSillas): Silla[] {
  return sillas.filter((s) => {
    if (f.precioMax != null && (s.precioAprox == null || s.precioAprox > f.precioMax)) return false;
    if (f.respaldo && s.respaldo !== f.respaldo) return false;
    if (f.profundidadRegulable && !s.profundidadRegulable) return false;
    if (f.reposabrazosMin != null && reposabrazosNivel(s.reposabrazos) < f.reposabrazosMin) return false;
    if (f.pesoMin != null && (s.pesoMaxKg == null || s.pesoMaxKg < f.pesoMin)) return false;
    return true;
  });
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): reposabrazosNivel + filtrarSillas with unit tests"
```

---

## Task 5: `ordenarSillas` (TDD)

**Files:**
- Modify: `src/lib/sillas.ts`
- Modify: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/lib/sillas.test.ts`:
```ts
import { ordenarSillas } from './sillas';

describe('ordenarSillas', () => {
  it('precio ascendente (null al final)', () => {
    expect(ordenarSillas(FIXTURE, 'precio-asc').map(s => s.slug)).toEqual(['b', 'c', 'a']);
  });
  it('precio descendente', () => {
    expect(ordenarSillas(FIXTURE, 'precio-desc').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('valoración descendente', () => {
    expect(ordenarSillas(FIXTURE, 'valoracion').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('peso máximo descendente', () => {
    expect(ordenarSillas(FIXTURE, 'peso-max').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('no muta el array original', () => {
    const copia = [...FIXTURE];
    ordenarSillas(FIXTURE, 'precio-asc');
    expect(FIXTURE).toEqual(copia);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — `ordenarSillas` no exportado.

- [ ] **Step 3: Implementación**

Añadir a `src/lib/sillas.ts`:
```ts
export type OrdenSillas = 'precio-asc' | 'precio-desc' | 'valoracion' | 'peso-max';

function numOrInf(n: number | null, dir: 'asc' | 'desc'): number {
  if (n != null) return n;
  return dir === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
}

export function ordenarSillas(sillas: Silla[], orden: OrdenSillas): Silla[] {
  const copia = [...sillas];
  switch (orden) {
    case 'precio-asc':
      return copia.sort((a, b) => numOrInf(a.precioAprox, 'asc') - numOrInf(b.precioAprox, 'asc'));
    case 'precio-desc':
      return copia.sort((a, b) => numOrInf(b.precioAprox, 'desc') - numOrInf(a.precioAprox, 'desc'));
    case 'valoracion':
      return copia.sort((a, b) => b.valoracion - a.valoracion);
    case 'peso-max':
      return copia.sort((a, b) => numOrInf(b.pesoMaxKg, 'desc') - numOrInf(a.pesoMaxKg, 'desc'));
    default:
      return copia;
  }
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): ordenarSillas (price/rating/load, nulls last, no mutation)"
```

---

## Task 6: `recomendarSilla` (selector matcher, TDD)

**Files:**
- Modify: `src/lib/sillas.ts`
- Modify: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/lib/sillas.test.ts`:
```ts
import { recomendarSilla } from './sillas';

describe('recomendarSilla', () => {
  it('presupuesto bajo elige la más barata válida', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'bajo', altura: 'media' });
    expect(r.silla?.slug).toBe('b');
  });
  it('altura fuera de media prioriza profundidad regulable', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'medio', altura: 'baja' });
    expect(r.silla?.slug).toBe('c');
    expect(r.motivo).toMatch(/profundidad/i);
  });
  it('presupuesto alto con altura media elige la mejor valorada en rango', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'alto', altura: 'media' });
    expect(r.silla?.slug).toBe('a');
  });
  it('si ninguna entra en presupuesto devuelve null con motivo', () => {
    const r = recomendarSilla([], { presupuesto: 'bajo', altura: 'media' });
    expect(r.silla).toBeNull();
    expect(r.motivo).toBeTruthy();
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — `recomendarSilla` no exportado.

- [ ] **Step 3: Implementación**

Añadir a `src/lib/sillas.ts`:
```ts
export type Presupuesto = 'bajo' | 'medio' | 'alto';
export type AlturaPerfil = 'baja' | 'media' | 'alta';

export interface CriteriosSelector {
  presupuesto: Presupuesto;
  altura: AlturaPerfil;
}

export interface Recomendacion {
  silla: Silla | null;
  motivo: string;
}

const TECHO_PRESUPUESTO: Record<Presupuesto, number> = {
  bajo: 150,
  medio: 250,
  alto: Number.POSITIVE_INFINITY,
};

export function recomendarSilla(sillas: Silla[], c: CriteriosSelector): Recomendacion {
  const techo = TECHO_PRESUPUESTO[c.presupuesto];
  const enPresupuesto = sillas.filter(
    (s) => s.precioAprox != null && s.precioAprox <= techo
  );

  if (enPresupuesto.length === 0) {
    return { silla: null, motivo: 'No hay sillas dentro de ese presupuesto en el catálogo.' };
  }

  const alturaFueraDeMedia = c.altura === 'baja' || c.altura === 'alta';
  if (alturaFueraDeMedia) {
    const conProfundidad = enPresupuesto
      .filter((s) => s.profundidadRegulable)
      .sort((a, b) => b.valoracion - a.valoracion);
    if (conProfundidad.length > 0) {
      return {
        silla: conProfundidad[0],
        motivo: 'Tiene profundidad de asiento regulable, clave para tu altura.',
      };
    }
  }

  const mejor = [...enPresupuesto].sort((a, b) => b.valoracion - a.valoracion)[0];
  return { silla: mejor, motivo: 'Es la mejor valorada dentro de tu presupuesto.' };
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS (toda la suite).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): recomendarSilla matcher (budget + height) with tests"
```

---

## Task 7: `BotonPrecio.astro` (1 CTA, OneLink-ready)

**Files:**
- Create: `src/components/BotonPrecio.astro`

- [ ] **Step 1: Crear el componente**

`src/components/BotonPrecio.astro`:
```astro
---
import StoreIcon from './StoreIcon.astro';
import { buildAmazonHref, type SillaAmazon } from '@/lib/sillas';

interface Props {
  amazon?: SillaAmazon;
  webOficial?: string | null;
  nombre: string;
}

const { amazon, webOficial, nombre } = Astro.props;
const amazonHref = buildAmazonHref(amazon);
---

{amazonHref ? (
  <a
    href={amazonHref}
    class="affiliate-button amazon"
    target="_blank"
    rel="sponsored nofollow noopener noreferrer"
  >
    <StoreIcon tienda="amazon" size={15} />
    Ver precio en Amazon
    <span class="sr-only">{`de ${nombre} (se abre en nueva pestaña)`}</span>
  </a>
) : webOficial ? (
  <a
    href={webOficial}
    class="boton-web-oficial"
    target="_blank"
    rel="nofollow noopener noreferrer"
  >
    Ver en la web oficial
    <span class="sr-only">{`de ${nombre} (se abre en nueva pestaña)`}</span>
  </a>
) : (
  <span class="boton-sin-tienda">No disponible online actualmente</span>
)}

<style>
  .boton-web-oficial {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.6rem 1.1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-dark);
    color: var(--color-text);
    text-decoration: none;
    transition: border-color var(--transition);
  }
  .boton-web-oficial:hover { border-color: var(--color-primary); color: var(--color-primary); }
  .boton-sin-tienda {
    font-size: 0.82rem;
    color: var(--color-text-muted);
    font-style: italic;
  }
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
  }
</style>
```

- [ ] **Step 2: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK (el componente compila; aún no se usa).

- [ ] **Step 3: Commit**

```bash
git add src/components/BotonPrecio.astro
git commit -m "feat(sillas): BotonPrecio component (single CTA, OneLink-ready)"
```

---

## Task 8: Ficha individual + ruta `/sillas/catalogo/[slug]/`

**Files:**
- Create: `src/components/FichaSilla.astro`
- Create: `src/pages/sillas/catalogo/[slug].astro`

- [ ] **Step 1: Crear `FichaSilla.astro`**

`src/components/FichaSilla.astro`:
```astro
---
import BotonPrecio from './BotonPrecio.astro';
import type { Silla } from '@/lib/sillas';

interface Props { silla: Silla; }
const { silla } = Astro.props;

const ETIQUETA_LUMBAR: Record<string, string> = {
  fijo: 'Fijo', presion: 'Ajustable en presión', altura: 'Ajustable en altura',
  dinamico: 'Dinámico autoajustable', '5d': '5D ajustable',
};
const ETIQUETA_REPOSABRAZOS: Record<string, string> = {
  ninguno: 'Ninguno', '1d': '1D (altura)', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Abatibles',
};
const ETIQUETA_RESPALDO: Record<string, string> = {
  malla: 'Malla', espuma: 'Espuma', mixto: 'Malla + cojín',
};

function fmt(v: number | null, sufijo = ''): string {
  return v == null ? 'n/d' : `${v}${sufijo}`;
}

const specs: { etiqueta: string; valor: string }[] = [
  { etiqueta: 'Precio aprox.', valor: silla.precioAprox == null ? 'n/d' : `~${silla.precioAprox} €` },
  { etiqueta: 'Soporte lumbar', valor: ETIQUETA_LUMBAR[silla.lumbar] ?? silla.lumbar },
  { etiqueta: 'Reposabrazos', valor: ETIQUETA_REPOSABRAZOS[silla.reposabrazos] ?? silla.reposabrazos },
  { etiqueta: 'Respaldo', valor: ETIQUETA_RESPALDO[silla.respaldo] ?? silla.respaldo },
  { etiqueta: 'Profundidad regulable', valor: silla.profundidadRegulable ? 'Sí' : 'No' },
  { etiqueta: 'Peso máximo', valor: fmt(silla.pesoMaxKg, ' kg') },
  { etiqueta: 'Reclinación máx.', valor: fmt(silla.reclinacionMaxGrados, '°') },
  { etiqueta: 'Garantía', valor: silla.garantiaAnios == null ? 'n/d' : `${silla.garantiaAnios} años` },
];
---

<article class="ficha">
  <header class="ficha-header">
    {silla.imagen && (
      <img src={silla.imagen} alt={silla.imagenAlt ?? silla.nombre} width="200" height="200" loading="lazy" decoding="async" />
    )}
    <div>
      <p class="ficha-marca">{silla.marca}</p>
      <h1 class="ficha-nombre">{silla.nombre}</h1>
      <p class="ficha-valoracion">★ {silla.valoracion.toFixed(1)} / 5</p>
      {silla.idealPara && <p class="ficha-ideal">Ideal para: {silla.idealPara}</p>}
      <BotonPrecio amazon={silla.amazon} webOficial={silla.webOficial} nombre={silla.nombre} />
    </div>
  </header>

  <h2>Ficha técnica</h2>
  <table class="ficha-specs">
    <tbody>
      {specs.map((s) => (
        <tr><th scope="row">{s.etiqueta}</th><td>{s.valor}</td></tr>
      ))}
    </tbody>
  </table>

  {silla.puntosFuertes.length > 0 && (
    <>
      <h2>Lo que destaca</h2>
      <ul>{silla.puntosFuertes.map((p) => <li>{p}</li>)}</ul>
    </>
  )}
  {silla.puntosDebiles.length > 0 && (
    <>
      <h2>Lo que no convence</h2>
      <ul>{silla.puntosDebiles.map((p) => <li>{p}</li>)}</ul>
    </>
  )}

  {(silla.fuenteSpecs || silla.verificadoEn) && (
    <p class="ficha-fuente">
      Datos: {silla.fuenteSpecs ?? 'n/d'}{silla.verificadoEn ? ` · verificado el ${silla.verificadoEn}` : ''}.
      Los campos marcados como “n/d” no tienen dato verificado; verifica siempre la ficha del fabricante antes de comprar.
    </p>
  )}
</article>

<style>
  .ficha-header { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start; margin-bottom: 2rem; }
  .ficha-marca { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem; color: var(--color-text-muted); margin: 0; }
  .ficha-nombre { font-family: var(--font-display); margin: 0.2rem 0 0.5rem; }
  .ficha-valoracion { color: var(--color-secondary); font-weight: 700; margin: 0 0 0.5rem; }
  .ficha-ideal { color: var(--color-text-muted); font-size: 0.9rem; margin: 0 0 1rem; }
  .ficha-specs { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; }
  .ficha-specs th, .ficha-specs td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--color-border); }
  .ficha-specs th { width: 45%; color: var(--color-text-muted); font-weight: 600; }
  .ficha-fuente { font-size: 0.8rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: 2rem; }
</style>
```

- [ ] **Step 2: Crear la ruta `/sillas/catalogo/[slug]/`**

`src/pages/sillas/catalogo/[slug].astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import FichaSilla from '@/components/FichaSilla.astro';
import { buildAmazonHref } from '@/lib/sillas';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const sillas = await getCollection('sillas');
  return sillas.map((entry) => ({
    params: { slug: entry.id.replace(/\.(yaml|yml|json)$/, '') },
    props: { silla: { slug: entry.id.replace(/\.(yaml|yml|json)$/, ''), ...entry.data } },
  }));
}

const { silla } = Astro.props;
const titulo = `${silla.nombre}: ficha y specs | Tu Espacio de Trabajo`;
const descripcion = `Ficha técnica de la ${silla.nombre}: soporte lumbar, reposabrazos, peso máximo, garantía y precio aproximado. Datos verificables, sin experiencia inventada.`;

const amazonHref = buildAmazonHref(silla.amazon);
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: silla.nombre,
  brand: { '@type': 'Brand', name: silla.marca },
  ...(silla.imagen && { image: silla.imagen }),
  description: descripcion,
  ...(silla.precioAprox != null && {
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: String(silla.precioAprox),
      availability: 'https://schema.org/InStock',
      ...(amazonHref && { url: amazonHref }),
    },
  }),
};
---

<Base title={titulo} description={descripcion} image={silla.imagen}>
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan">
      <a href="/sillas/">Sillas</a> › <a href="/sillas/catalogo/">Catálogo</a> › <span>{silla.nombre}</span>
    </nav>
    <FichaSilla silla={silla} />
    <p style="margin-top:2rem;">
      ← <a href="/sillas/catalogo/">Volver al catálogo de sillas</a> ·
      <a href="/sillas/mejor-silla-ergonomica-calidad-precio/">Ver la comparativa completa</a>
    </p>
  </main>
  <script is:inline type="application/ld+json" set:html={JSON.stringify(productSchema)} />
</Base>
```

> **Nota:** confirma en Astro 5 cómo se obtiene el identificador de una data collection entry. Si `entry.id` ya viene sin extensión, simplifica los `.replace(...)` a `entry.id`. Verifica con el build del Step 3 y ajusta.

- [ ] **Step 3: Verificar build genera las fichas**

Run: `npm run build 2>&1 | grep -E 'catalogo|sillas' | head`
Expected: aparecen rutas `/sillas/catalogo/sihoo-doro-c300/index.html` y las demás.

- [ ] **Step 4: Verificar schema sin FAQPage/HowTo**

Run: `grep -rl "FAQPage" dist/ | wc -l; grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/FichaSilla.astro src/pages/sillas/catalogo/
git commit -m "feat(sillas): individual chair pages /sillas/catalogo/[slug] with Product schema"
```

---

## Task 9: Catálogo filtrable `/sillas/catalogo/`

**Files:**
- Create: `src/components/CatalogoSillas.astro`
- Create: `src/pages/sillas/catalogo/index.astro`

- [ ] **Step 1: Crear `CatalogoSillas.astro`**

Renderiza todas las filas con `data-*` y filtra/ordena en cliente con JS vanilla. `BotonPrecio` da 1 CTA por fila.

`src/components/CatalogoSillas.astro`:
```astro
---
import BotonPrecio from './BotonPrecio.astro';
import { reposabrazosNivel, type Silla } from '@/lib/sillas';

interface Props { sillas: Silla[]; }
const { sillas } = Astro.props;
---

<section class="catalogo">
  <div class="catalogo-filtros">
    <label>Presupuesto máx (€)
      <input type="range" id="f-precio" min="100" max="400" step="10" value="400" />
      <output id="f-precio-out">400</output>
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

  <p class="catalogo-count"><span id="catalogo-n">{sillas.length}</span> sillas</p>

  <div class="catalogo-grid" id="catalogo-grid">
    {sillas.map((s) => (
      <article class="catalogo-card"
        data-precio={s.precioAprox ?? ''}
        data-respaldo={s.respaldo}
        data-brazos={reposabrazosNivel(s.reposabrazos)}
        data-prof={s.profundidadRegulable ? '1' : '0'}
        data-peso={s.pesoMaxKg ?? ''}
        data-valoracion={s.valoracion}>
        {s.imagen && <img src={s.imagen} alt={s.imagenAlt ?? s.nombre} width="120" height="120" loading="lazy" decoding="async" />}
        <div class="catalogo-info">
          <a class="catalogo-nombre" href={`/sillas/catalogo/${s.slug}/`}>{s.nombre}</a>
          <p class="catalogo-meta">★ {s.valoracion.toFixed(1)} · {s.precioAprox == null ? 'n/d' : `~${s.precioAprox} €`} · {s.pesoMaxKg == null ? 'n/d' : `${s.pesoMaxKg} kg`}{s.profundidadRegulable ? ' · prof. regulable' : ''}</p>
          <BotonPrecio amazon={s.amazon} webOficial={s.webOficial} nombre={s.nombre} />
        </div>
      </article>
    ))}
  </div>
  <p class="catalogo-vacio" id="catalogo-vacio" hidden>Ninguna silla cumple esos filtros. Prueba a relajar alguno.</p>
</section>

<style>
  .catalogo-filtros { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); }
  .catalogo-filtros label { display: flex; flex-direction: column; font-size: 0.8rem; font-weight: 600; gap: 0.25rem; color: var(--color-text-muted); }
  .catalogo-check { flex-direction: row !important; align-items: center; gap: 0.4rem; }
  .catalogo-count { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem; }
  .catalogo-grid { display: grid; gap: 1rem; }
  .catalogo-card { display: flex; gap: 1rem; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1rem; }
  .catalogo-card img { object-fit: contain; background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 0.5rem; flex-shrink: 0; }
  .catalogo-info { flex: 1; min-width: 0; }
  .catalogo-nombre { font-family: var(--font-display); font-weight: 700; color: var(--color-text); text-decoration: none; }
  .catalogo-nombre:hover { color: var(--color-primary); }
  .catalogo-meta { font-size: 0.82rem; color: var(--color-text-muted); margin: 0.3rem 0 0.7rem; }
</style>

<script>
  const grid = document.getElementById('catalogo-grid');
  if (grid) {
    const cards = Array.from(grid.querySelectorAll('.catalogo-card')) as HTMLElement[];
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

    function aplicar() {
      const precioMax = parseFloat(fPrecio.value);
      fPrecioOut.textContent = String(precioMax);
      let visibles = 0;

      cards.forEach((c) => {
        const precio = num(c.dataset.precio || '');
        const respaldo = c.dataset.respaldo || '';
        const brazos = parseInt(c.dataset.brazos || '0', 10);
        const prof = c.dataset.prof === '1';
        const peso = num(c.dataset.peso || '');

        let ok = true;
        if (precio != null && precio > precioMax) ok = false;
        if (fRespaldo.value && respaldo !== fRespaldo.value) ok = false;
        if (parseInt(fBrazos.value, 10) > brazos) ok = false;
        if (fProf.checked && !prof) ok = false;
        if (fPeso.checked && (peso == null || peso < 130)) ok = false;

        c.style.display = ok ? '' : 'none';
        if (ok) visibles++;
      });

      const orden = fOrden.value;
      const visiblesArr = cards.filter((c) => c.style.display !== 'none');
      const val = (c: HTMLElement, k: string) => num(c.dataset[k] || '');
      visiblesArr.sort((a, b) => {
        if (orden === 'precio-asc') return (val(a, 'precio') ?? Infinity) - (val(b, 'precio') ?? Infinity);
        if (orden === 'precio-desc') return (val(b, 'precio') ?? -Infinity) - (val(a, 'precio') ?? -Infinity);
        if (orden === 'peso-max') return (val(b, 'peso') ?? -Infinity) - (val(a, 'peso') ?? -Infinity);
        return (val(b, 'valoracion') ?? 0) - (val(a, 'valoracion') ?? 0);
      });
      visiblesArr.forEach((c) => grid.appendChild(c));

      if (nOut) nOut.textContent = String(visibles);
      if (vacio) vacio.hidden = visibles > 0;
    }

    [fPrecio, fRespaldo, fBrazos, fProf, fPeso, fOrden].forEach((el) =>
      el.addEventListener('input', aplicar)
    );
    aplicar();
  }
</script>
```

- [ ] **Step 2: Crear la página `/sillas/catalogo/`**

`src/pages/sillas/catalogo/index.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import CatalogoSillas from '@/components/CatalogoSillas.astro';
import { getCollection } from 'astro:content';

const entries = await getCollection('sillas');
const sillas = entries
  .map((e) => ({ slug: e.id.replace(/\.(yaml|yml|json)$/, ''), ...e.data }))
  .sort((a, b) => b.valoracion - a.valoracion);

const titulo = 'Catálogo de sillas ergonómicas: filtra por precio, altura y peso | Tu Espacio de Trabajo';
const descripcion = 'Catálogo filtrable de sillas ergonómicas con specs verificables: soporte lumbar, reposabrazos, peso máximo, garantía y precio. Filtra y ordena para encontrar la tuya.';

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: sillas.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://tuespaciodetrabajo.com/sillas/catalogo/${s.slug}/`,
    name: s.nombre,
  })),
};
---

<Base title={titulo} description={descripcion}>
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan">
      <a href="/sillas/">Sillas</a> › <span>Catálogo</span>
    </nav>
    <h1>Catálogo de sillas ergonómicas</h1>
    <p>Filtra por presupuesto, respaldo, reposabrazos, profundidad regulable y carga máxima. Todos los datos salen de fichas de fabricante y reseñas verificadas; lo que no tiene dato confirmado aparece como <strong>n/d</strong>. ¿Prefieres que te guiemos? Usa el <a href="/sillas/selector/">selector guiado</a>.</p>
    <CatalogoSillas sillas={sillas} />
  </main>
  <script is:inline type="application/ld+json" set:html={JSON.stringify(itemListSchema)} />
</Base>
```

- [ ] **Step 3: Verificar build + ruta**

Run: `npm run build 2>&1 | grep -E 'catalogo/index' | head`
Expected: aparece `/sillas/catalogo/index.html`.

- [ ] **Step 4: Verificar no se rompió `/sillas/` ni los artículos**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK, total de páginas ≥ 49 + nuevas.

- [ ] **Step 5: Commit**

```bash
git add src/components/CatalogoSillas.astro src/pages/sillas/catalogo/index.astro
git commit -m "feat(sillas): filterable catalog /sillas/catalogo with ItemList schema"
```

---

## Task 10: Selector guiado `/sillas/selector/`

**Files:**
- Create: `src/components/SelectorSillas.astro`
- Create: `src/pages/sillas/selector.astro`

- [ ] **Step 1: Crear `SelectorSillas.astro`**

El matcher (`recomendarSilla`) es lógica pura ya testeada; el wizard lo importa en un `<script>` module (una sola fuente de verdad) y serializa las sillas a JSON vía `data-*`.

`src/components/SelectorSillas.astro`:
```astro
---
import { type Silla } from '@/lib/sillas';

interface Props { sillas: Silla[]; }
const { sillas } = Astro.props;
const sillasJson = JSON.stringify(sillas);
---

<section class="selector" data-sillas={sillasJson}>
  <div class="selector-paso" data-paso="1">
    <p class="selector-label">Paso 1 de 2</p>
    <h2>¿Cuánto puedes gastar?</h2>
    <div class="selector-opts">
      <button data-k="presupuesto" data-v="bajo">Menos de 150 €</button>
      <button data-k="presupuesto" data-v="medio">150 – 250 €</button>
      <button data-k="presupuesto" data-v="alto">Más de 250 €</button>
    </div>
  </div>

  <div class="selector-paso" data-paso="2" hidden>
    <p class="selector-label">Paso 2 de 2</p>
    <h2>¿Cuánto mides?</h2>
    <div class="selector-opts">
      <button data-k="altura" data-v="baja">Menos de 1,65 m</button>
      <button data-k="altura" data-v="media">1,65 – 1,85 m</button>
      <button data-k="altura" data-v="alta">Más de 1,85 m</button>
    </div>
  </div>

  <div class="selector-resultado" data-paso="3" hidden>
    <p class="selector-label">Tu recomendación</p>
    <div id="selector-out"></div>
    <button id="selector-reset" class="selector-reset">Empezar de nuevo</button>
  </div>
</section>

<style>
  .selector { border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; }
  .selector-label { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.72rem; color: var(--color-text-muted); margin: 0 0 0.4rem; }
  .selector-opts { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem; }
  .selector-opts button, .selector-reset { font-family: var(--font-sans); font-weight: 600; padding: 0.6rem 1.1rem; border-radius: var(--radius-full); border: 1px solid var(--color-border); background: transparent; cursor: pointer; transition: all var(--transition); }
  .selector-opts button:hover { border-color: var(--color-primary); color: var(--color-primary); }
  .selector-reset { margin-top: 1rem; }
  .selector-rec { background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 1rem; }
  .selector-rec a { font-weight: 700; }
</style>

<script>
  import { recomendarSilla, type Silla, type Presupuesto, type AlturaPerfil } from '@/lib/sillas';

  const root = document.querySelector('.selector') as HTMLElement | null;
  if (root) {
    const sillas: Silla[] = JSON.parse(root.dataset.sillas || '[]');
    const pasos = Array.from(root.querySelectorAll('.selector-paso, .selector-resultado')) as HTMLElement[];
    const out = root.querySelector('#selector-out') as HTMLElement;
    const reset = root.querySelector('#selector-reset') as HTMLButtonElement;
    const sel: { presupuesto?: Presupuesto; altura?: AlturaPerfil } = {};

    function mostrar(n: number) {
      pasos.forEach((p) => { p.hidden = p.dataset.paso !== String(n); });
    }

    root.querySelectorAll('button[data-k]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = (btn as HTMLElement).dataset.k as 'presupuesto' | 'altura';
        const v = (btn as HTMLElement).dataset.v as string;
        (sel as Record<string, string>)[k] = v;
        if (k === 'presupuesto') { mostrar(2); return; }
        const r = recomendarSilla(sillas, { presupuesto: sel.presupuesto!, altura: sel.altura! });
        if (r.silla) {
          out.innerHTML = `<div class="selector-rec"><a href="/sillas/catalogo/${r.silla.slug}/">${r.silla.nombre}</a><p>${r.motivo}</p><p>~${r.silla.precioAprox ?? 'n/d'} € · ★ ${r.silla.valoracion.toFixed(1)}</p></div>`;
        } else {
          out.innerHTML = `<div class="selector-rec"><p>${r.motivo}</p><p><a href="/sillas/catalogo/">Ver el catálogo completo</a></p></div>`;
        }
        mostrar(3);
      });
    });

    reset.addEventListener('click', () => { delete sel.presupuesto; delete sel.altura; mostrar(1); });
  }
</script>
```

- [ ] **Step 2: Crear la página `/sillas/selector/`**

`src/pages/sillas/selector.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import SelectorSillas from '@/components/SelectorSillas.astro';
import { getCollection } from 'astro:content';

const entries = await getCollection('sillas');
const sillas = entries.map((e) => ({ slug: e.id.replace(/\.(yaml|yml|json)$/, ''), ...e.data }));

const titulo = 'Selector de silla ergonómica: encuentra la tuya en 2 pasos | Tu Espacio de Trabajo';
const descripcion = 'Responde 2 preguntas (presupuesto y altura) y te recomendamos la silla ergonómica del catálogo que mejor encaja, con el motivo basado en datos.';
---

<Base title={titulo} description={descripcion}>
  <main class="container" style="padding: 2rem 0; max-width: 640px;">
    <nav class="breadcrumb" aria-label="Migas de pan">
      <a href="/sillas/">Sillas</a> › <span>Selector</span>
    </nav>
    <h1>Encuentra tu silla en 2 pasos</h1>
    <p>Te recomendamos una silla del <a href="/sillas/catalogo/">catálogo</a> según tu presupuesto y altura, explicándote por qué. Si prefieres comparar tú, usa el catálogo filtrable.</p>
    <SelectorSillas sillas={sillas} />
  </main>
</Base>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build 2>&1 | grep -E 'selector' | head`
Expected: aparece `/sillas/selector/index.html`.

- [ ] **Step 4: Commit**

```bash
git add src/components/SelectorSillas.astro src/pages/sillas/selector.astro
git commit -m "feat(sillas): guided selector /sillas/selector reusing recomendarSilla logic"
```

---

## Task 11: `TablaComparativaDB` + migrar la comparativa faro

**Files:**
- Create: `src/components/TablaComparativaDB.astro`
- Modify: `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx`

- [ ] **Step 1: Crear `TablaComparativaDB.astro`**

Recibe `slugs` (orden de la comparativa), lee la colección `sillas`, pinta tabla de specs + 1 CTA por fila. Genera schema `Product` por ítem desde la fuente única.

`src/components/TablaComparativaDB.astro`:
```astro
---
import BotonPrecio from './BotonPrecio.astro';
import { buildAmazonHref, type Silla } from '@/lib/sillas';
import { getCollection } from 'astro:content';

interface Props { slugs: string[]; }
const { slugs } = Astro.props;

const entries = await getCollection('sillas');
const porSlug = new Map(entries.map((e) => [e.id.replace(/\.(yaml|yml|json)$/, ''), e.data]));
const sillas: Silla[] = slugs
  .map((slug) => { const data = porSlug.get(slug); return data ? { slug, ...data } : null; })
  .filter((s): s is Silla => s !== null);

const ETIQUETA_LUMBAR: Record<string, string> = { fijo: 'Fijo', presion: 'Presión', altura: 'Altura', dinamico: 'Dinámico', '5d': '5D' };
const ETIQUETA_RESPALDO: Record<string, string> = { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla+cojín' };
const fmt = (v: number | null, suf = '') => (v == null ? 'n/d' : `${v}${suf}`);

const productSchemas = sillas.map((s) => {
  const href = buildAmazonHref(s.amazon);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.nombre,
    brand: { '@type': 'Brand', name: s.marca },
    ...(s.imagen && { image: s.imagen }),
    ...(s.precioAprox != null && {
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: String(s.precioAprox), availability: 'https://schema.org/InStock', ...(href && { url: href }) },
    }),
  };
});
---

{productSchemas.map((sch) => (
  <script is:inline type="application/ld+json" set:html={JSON.stringify(sch)} />
))}

<div class="tcdb-wrap">
  <table class="tcdb">
    <thead>
      <tr><th>Modelo</th><th>Precio</th><th>Lumbar</th><th>Brazos</th><th>Respaldo</th><th>Peso máx</th><th>Garantía</th><th></th></tr>
    </thead>
    <tbody>
      {sillas.map((s) => (
        <tr>
          <td data-th="Modelo"><a href={`/sillas/catalogo/${s.slug}/`}>{s.nombre}</a></td>
          <td data-th="Precio">{s.precioAprox == null ? 'n/d' : `~${s.precioAprox} €`}</td>
          <td data-th="Lumbar">{ETIQUETA_LUMBAR[s.lumbar] ?? s.lumbar}{s.profundidadRegulable ? ' +prof' : ''}</td>
          <td data-th="Brazos">{s.reposabrazos}</td>
          <td data-th="Respaldo">{ETIQUETA_RESPALDO[s.respaldo] ?? s.respaldo}</td>
          <td data-th="Peso máx">{fmt(s.pesoMaxKg, ' kg')}</td>
          <td data-th="Garantía">{s.garantiaAnios == null ? 'n/d' : `${s.garantiaAnios} años`}</td>
          <td data-th=""><BotonPrecio amazon={s.amazon} webOficial={s.webOficial} nombre={s.nombre} /></td>
        </tr>
      ))}
    </tbody>
  </table>
  <p class="tcdb-nota">Specs de fabricante y fichas de Amazon.es; “n/d” = sin dato verificado. <a href="/sillas/catalogo/">Filtra todo el catálogo</a> o usa el <a href="/sillas/selector/">selector</a>.</p>
</div>

<style>
  .tcdb-wrap { overflow-x: auto; margin: 1.5rem 0 2rem; }
  .tcdb { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .tcdb th, .tcdb td { padding: 0.6rem 0.7rem; border-bottom: 1px solid var(--color-border); text-align: left; white-space: nowrap; }
  .tcdb thead th { color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .tcdb td a { font-weight: 600; }
  .tcdb-nota { font-size: 0.78rem; color: var(--color-text-muted); }
  @media (max-width: 640px) {
    .tcdb thead { display: none; }
    .tcdb, .tcdb tbody, .tcdb tr, .tcdb td { display: block; width: 100%; }
    .tcdb tr { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 0.75rem; padding: 0.5rem; }
    .tcdb td { border: none; display: flex; justify-content: space-between; gap: 1rem; }
    .tcdb td::before { content: attr(data-th); font-weight: 600; color: var(--color-text-muted); }
    .tcdb td[data-th=""]::before { content: ""; }
  }
</style>
```

- [ ] **Step 2: Migrar el artículo faro**

En `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx`:

a) Añadir el import junto a los otros (debajo de `import AffiliateButton ...`):
```mdx
import TablaComparativaDB from '@/components/TablaComparativaDB.astro';
```

b) Sustituir TODO el bloque de la tabla de specs en Markdown (la sección `## Tabla comparativa de specs` con su tabla `| Modelo | Precio aprox. | ...|` y el párrafo "Cómo leer la tabla") por:
```mdx
## Tabla comparativa de specs

Los datos verificables de cada silla, uno al lado del otro. Salen de fichas de fabricante y de Amazon.es; lo que no tiene dato confirmado aparece como **n/d**. Cada modelo enlaza a su ficha completa, y puedes filtrar todo el catálogo o usar el selector guiado.

<TablaComparativaDB slugs={[
  "sihoo-doro-c300",
  "flexispot-c7-lite",
  "holludle-ergonomica",
  "hbada-ergonomica",
  "sihoo-m102c",
  "durrafy-ergonomica"
]} />
```

> Deja intactos `TopPick`, `ComparisonTable` y los `AffiliateButton` por ahora (otra fase decidirá si se reducen más). El objetivo de esta tarea es que la tabla de specs venga de la DB.

- [ ] **Step 3: Verificar build + schema**

Run: `npm run build 2>&1 | tail -3 && grep -rl "FAQPage" dist/ | wc -l && grep -rl '"HowTo"' dist/ | wc -l`
Expected: build OK; ambos greps = `0`.

- [ ] **Step 4: Commit**

```bash
git add src/components/TablaComparativaDB.astro src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx
git commit -m "feat(sillas): TablaComparativaDB; migrate flagship specs table to single data source"
```

---

## Task 12: Ampliar el catálogo a 15-25 sillas reales

**Files:**
- Create: `src/content/sillas/*.yaml` (9-19 entradas nuevas)

- [ ] **Step 1: Investigar sillas reales con specs verificables**

Para cada silla candidata (disponible en Amazon.es o de marca conocida tipo IKEA/Herman Miller), recopilar de ficha de fabricante / listado Amazon: precio aprox, tipo lumbar, reposabrazos, respaldo, profundidad regulable, peso máx, reclinación, garantía. **Regla:** dato no confirmado → `null` (nunca inventar). Registrar `fuenteSpecs` y `verificadoEn: "2026-06-06"`.

Candidatas sugeridas (verificar disponibilidad/ASIN antes de añadir): SIHOO M18, SIHOO M57, Songmics OBN, Hbada E3, Razzor, Newaz, Yaheetech ergonómica, IKEA Markus, IKEA Järvfjället, Herman Miller Aeron (sin Amazon → `webOficial` o sin tienda).

- [ ] **Step 2: Crear un `.yaml` por silla**

Mismo esquema que Task 2 Step 2. Ejemplo para una silla sin venta en Amazon (Herman Miller Aeron):
```yaml
nombre: "Herman Miller Aeron"
marca: "Herman Miller"
imagen: ""
imagenAlt: "Silla ergonómica Herman Miller Aeron"
precioAprox: 1500
lumbar: "altura"
reposabrazos: "4d"
respaldo: "malla"
profundidadRegulable: false
pesoMaxKg: 159
alturaAsientoMinCm: null
alturaAsientoMaxCm: null
reclinacionMaxGrados: null
garantiaAnios: 12
valoracion: 4.8
puntosFuertes:
  - "Referencia de la industria en ergonomía"
  - "Garantía de 12 años"
  - "Tres tallas (A/B/C) para distintas complexiones"
puntosDebiles:
  - "Precio muy alto"
  - "No se vende en Amazon.es (sin enlace de compra)"
idealPara: "Quien prioriza durabilidad y ergonomía máxima sin límite de presupuesto"
webOficial: "https://www.hermanmiller.com/es_es/products/seating/office-chairs/aeron-chairs/"
fuenteSpecs: "Web oficial Herman Miller"
verificadoEn: "2026-06-06"
```
> Nota: sin clave `amazon` → `BotonPrecio` mostrará "Web oficial". Si `imagen` queda `""`, la ficha y el catálogo omiten la imagen sin romperse.

- [ ] **Step 3: Verificar que Zod valida todas las entradas nuevas**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK (cualquier campo inválido o enum mal escrito hace fallar aquí). Total de fichas `/sillas/catalogo/[slug]/` = nº de archivos en `src/content/sillas/`.

- [ ] **Step 4: Verificar honestidad (sin inventar): repaso manual**

Revisar cada `.yaml` nuevo: ¿todo número tiene fuente real? Si no, ponerlo a `null`. Confirmar `fuenteSpecs` y `verificadoEn` presentes (Zod ya obliga a que existan).

- [ ] **Step 5: Commit**

```bash
git add src/content/sillas/
git commit -m "feat(sillas): expand catalog to 15-25 real chairs with verifiable specs"
```

---

## Task 13: Verificación final + look pro

**Files:** (sin código nuevo; ajustes de estilo si el mockup lo pide)

- [ ] **Step 1: Suite de tests**

Run: `npm run test`
Expected: PASS (todos los tests de `src/lib/sillas.test.ts`).

- [ ] **Step 2: Build limpio**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK, todas las páginas (49 previas + catálogo + N fichas + selector).

- [ ] **Step 3: Schemas prohibidos = 0**

Run: `grep -rl "FAQPage" dist/ | wc -l && grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.

- [ ] **Step 4: Revisión visual local**

Run: `npm run dev` y abrir:
- `http://localhost:4321/sillas/catalogo/` — filtros y orden funcionan; 1 CTA por silla.
- `http://localhost:4321/sillas/catalogo/sihoo-doro-c300/` — ficha con specs + 1 CTA.
- `http://localhost:4321/sillas/selector/` — wizard 2 pasos → recomendación.
- `http://localhost:4321/sillas/mejor-silla-ergonomica-calidad-precio/` — la tabla de specs ahora viene de la DB.

Validar aspecto profesional. Si algo se ve pobre, iterar estilos (validar el "look pro" con mockup en companion visual antes de cerrar).

- [ ] **Step 5: Commit final (si hubo ajustes de estilo)**

```bash
git add -A
git commit -m "polish(sillas): visual refinements after review"
```

---

## Self-Review (rellenado al escribir el plan)

**Cobertura del spec:**
- §3 modelo de datos → Task 2 (schema) + 12 (poblar). ✅
- §4 páginas/URLs → Task 8 (ficha), 9 (catálogo), 10 (selector). ✅
- §5 componentes → Task 7 (BotonPrecio), 8 (FichaSilla), 9 (CatalogoSillas), 10 (SelectorSillas), 11 (TablaComparativaDB). ✅
- §6 schema.org ItemList/Product, sin FAQPage/HowTo → Tasks 8, 9, 11 + verificaciones grep. ✅
- §7 reducción de botones (1 CTA) → Task 7 + uso en 8/9/11. ✅
- §8 integración + migrar faro → Task 11. ✅
- §2 honestidad (n/d, fuenteSpecs, verificadoEn) → Task 2 schema obliga; Task 12 step 4 repaso. ✅

**Consistencia de tipos:** `Silla`, `SillaAmazon`, `FiltrosSillas`, `recomendarSilla`, `buildAmazonHref`, `reposabrazosNivel`, `ordenarSillas`, `filtrarSillas` definidos en Task 3-6 y usados con la misma firma en 7-11. ✅

**Riesgo conocido (resolver en ejecución):** el identificador de entrada de data collection en Astro 5 (`entry.id` con o sin extensión). Los `.replace(/\.(yaml|yml|json)$/,'')` cubren ambos casos; verificar en el primer build (Task 8 Step 3) y simplificar si procede.
