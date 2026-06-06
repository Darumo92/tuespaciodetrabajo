# Mejoras del catálogo de sillas (valoración por ejes, comparador, imágenes) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el catálogo de sillas en una guía-comparador creíble: datos ampliados y honestos, valoración editorial por ejes con nota global /10, comparador interactivo (seleccionar 2-4 sillas y enfrentarlas), contenido editorial por ficha e imágenes consistentes (reales o fallback de marca).

**Architecture:** Se amplía la colección `sillas` (Zod) con specs y valoraciones. La lógica de agregación y de "ganador" vive en `src/lib/sillas.ts` (pura, testeada con Vitest). Componentes `.astro` consumen lib + colección. El comparador es una ruta estática `/sillas/comparar/` que embebe todas las sillas como JSON y renderiza en cliente (vanilla JS) según `?s=slug1,slug2,...`, reutilizando la lógica pura. La selección se hace con casillas en el catálogo (localStorage + barra flotante).

**Tech Stack:** Astro 5 (static), TypeScript, Zod (vía astro:content), Vitest, JS vanilla en cliente (sin framework → CWV).

**Spec de referencia:** `docs/superpowers/specs/2026-06-06-catalogo-sillas-mejoras-design.md`

**Honestidad (rige todo):** dato no confirmado → `null` → `n/d`. Valoraciones por ejes = editoriales (etiquetadas como tales); eje sin base → `null` → "sin valorar" (no computa en nota global ni gana en el comparador). **Los datos son el pilar de esta feature** (prioridad explícita del usuario): investigar a fondo en fuentes reales y minimizar los `n/d` sin inventar jamás un dato.

---

## File Structure

**Crear:**
- `src/components/FallbackImagen.astro` — placeholder de marca cuando no hay imagen.
- `src/components/ImagenSilla.astro` — `<img>` si hay imagen, si no `FallbackImagen`.
- `src/components/ValoracionEjes.astro` — barras por eje + nota global; eje `null` = "sin valorar".
- `src/components/ParaQuien.astro` — listas "para quién sí / no".
- `src/components/TarjetaSilla.astro` — tarjeta enriquecida del catálogo (casilla comparar, badge nota, chips, 1 CTA).
- `src/components/ComparadorSillas.astro` — tabla comparativa render en cliente.
- `src/pages/sillas/comparar.astro` — ruta `/sillas/comparar/` (noindex).

**Modificar:**
- `src/content/config.ts` — ampliar schema Zod de `sillas`.
- `src/lib/sillas.ts` — tipos `Valoraciones` + funciones `mediaEjesPresentes`, `notaGlobal`, `ganadoresPorValor`.
- `src/lib/sillas.test.ts` — tests de las funciones nuevas.
- `src/components/FichaSilla.astro` — usar `ImagenSilla`, añadir `ValoracionEjes`, veredicto, ficha técnica agrupada con campos nuevos, "qué dice la comunidad", `ParaQuien`.
- `src/components/CatalogoSillas.astro` — usar `TarjetaSilla`, casillas de comparar + barra flotante.
- `src/pages/sillas/catalogo/[slug].astro` — añadir schema `Review` editorial honesto.
- `src/content/sillas/*.yaml` — enriquecer las 19 sillas (datos nuevos + valoraciones).

---

## Task 1: Ampliar el schema Zod de `sillas`

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Añadir los campos nuevos al schema `sillas`**

En `src/content/config.ts`, dentro del `z.object({ ... })` de la colección `sillas`, justo ANTES de `fuenteSpecs: z.string(),`, añadir:
```ts
    anchoCm: z.number().nullable().default(null),
    fondoCm: z.number().nullable().default(null),
    mecanismo: z.string().nullable().default(null),
    baseMaterial: z.string().nullable().default(null),
    certificacionBifma: z.boolean().nullable().default(null),
    pesoProductoKg: z.number().nullable().default(null),
    valoraciones: z.object({
      ergonomia: z.number().min(0).max(10).nullable().default(null),
      ajustabilidad: z.number().min(0).max(10).nullable().default(null),
      materiales: z.number().min(0).max(10).nullable().default(null),
      comodidad: z.number().min(0).max(10).nullable().default(null),
      calidadPrecio: z.number().min(0).max(10).nullable().default(null),
    }).default({}),
    veredicto: z.string().optional(),
    comunidad: z.string().optional(),
    paraQuienSi: z.array(z.string()).default([]),
    paraQuienNo: z.array(z.string()).default([]),
```
Todos son opcionales o con `default`, de modo que las 19 sillas actuales siguen validando sin cambios.

- [ ] **Step 2: Verificar que el build valida con los datos actuales**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK, sin errores de validación de colección (las 19 sillas existentes pasan porque los campos nuevos tienen defaults).

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(sillas): extend schema with specs, sub-scores and editorial fields"
```

---

## Task 2: Tipos `Valoraciones` + `mediaEjesPresentes` + `notaGlobal` (TDD)

**Files:**
- Modify: `src/lib/sillas.ts`
- Modify: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir al final de `src/lib/sillas.test.ts`:
```ts
import { mediaEjesPresentes, notaGlobal } from './sillas';
import type { Valoraciones } from './sillas';

const EJES_COMPLETOS: Valoraciones = { ergonomia: 8, ajustabilidad: 8, materiales: 9, comodidad: 7, calidadPrecio: 8 };
const EJES_PARCIALES: Valoraciones = { ergonomia: 9, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: 6 };
const EJES_VACIOS: Valoraciones = { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null };

describe('mediaEjesPresentes', () => {
  it('promedia solo los ejes con valor', () => {
    expect(mediaEjesPresentes(EJES_COMPLETOS)).toBe(8); // (8+8+9+7+8)/5
    expect(mediaEjesPresentes(EJES_PARCIALES)).toBe(7.5); // (9+6)/2
  });
  it('devuelve null si no hay ningún eje', () => {
    expect(mediaEjesPresentes(EJES_VACIOS)).toBeNull();
    expect(mediaEjesPresentes(undefined)).toBeNull();
  });
});

describe('notaGlobal', () => {
  it('usa la media de ejes presentes (redondeada a 1 decimal)', () => {
    const s = { ...FIXTURE[0], valoraciones: EJES_PARCIALES };
    expect(notaGlobal(s)).toBe(7.5);
  });
  it('cae a valoracion*2 si no hay ejes', () => {
    const s = { ...FIXTURE[0], valoracion: 4.5, valoraciones: EJES_VACIOS };
    expect(notaGlobal(s)).toBe(9); // 4.5 * 2
  });
  it('cae a valoracion*2 si valoraciones es undefined', () => {
    const s = { ...FIXTURE[0], valoracion: 4 };
    expect(notaGlobal(s)).toBe(8);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — `mediaEjesPresentes`/`notaGlobal`/`Valoraciones` no exportados.

- [ ] **Step 3: Implementación**

En `src/lib/sillas.ts`, añadir el tipo `Valoraciones` justo después de la definición de `Respaldo` (línea ~5):
```ts
export interface Valoraciones {
  ergonomia: number | null;
  ajustabilidad: number | null;
  materiales: number | null;
  comodidad: number | null;
  calidadPrecio: number | null;
}
```
Ampliar la interfaz `Silla` añadiendo estos campos OPCIONALES (para no romper el `FIXTURE` de los tests existentes), tras `verificadoEn?: string;`:
```ts
  anchoCm?: number | null;
  fondoCm?: number | null;
  mecanismo?: string | null;
  baseMaterial?: string | null;
  certificacionBifma?: boolean | null;
  pesoProductoKg?: number | null;
  valoraciones?: Valoraciones;
  veredicto?: string;
  comunidad?: string;
  paraQuienSi?: string[];
  paraQuienNo?: string[];
```
Y al final del archivo, añadir las funciones:
```ts
export function mediaEjesPresentes(v?: Valoraciones): number | null {
  if (!v) return null;
  const vals = [v.ergonomia, v.ajustabilidad, v.materiales, v.comodidad, v.calidadPrecio]
    .filter((n): n is number => n != null);
  if (vals.length === 0) return null;
  const media = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(media * 10) / 10;
}

export function notaGlobal(silla: Silla): number | null {
  const media = mediaEjesPresentes(silla.valoraciones);
  if (media != null) return media;
  if (silla.valoracion != null) return Math.round(silla.valoracion * 2 * 10) / 10;
  return null;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS (toda la suite).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): Valoraciones type + mediaEjesPresentes + notaGlobal (TDD)"
```

---

## Task 3: `ganadoresPorValor` (lógica de "ganador" del comparador, TDD)

**Files:**
- Modify: `src/lib/sillas.ts`
- Modify: `src/lib/sillas.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/lib/sillas.test.ts`:
```ts
import { ganadoresPorValor } from './sillas';

describe('ganadoresPorValor', () => {
  const items = [
    { slug: 'a', valor: 320 },
    { slug: 'b', valor: 130 },
    { slug: 'c', valor: null },
  ];
  it('menor gana (precio), ignora null', () => {
    expect(ganadoresPorValor(items, 'menor')).toEqual(['b']);
  });
  it('mayor gana', () => {
    expect(ganadoresPorValor(items, 'mayor')).toEqual(['a']);
  });
  it('empate marca varios ganadores', () => {
    const t = [{ slug: 'a', valor: 150 }, { slug: 'b', valor: 150 }, { slug: 'c', valor: 90 }];
    expect(ganadoresPorValor(t, 'mayor')).toEqual(['a', 'b']);
  });
  it('todos null → sin ganadores', () => {
    const n = [{ slug: 'a', valor: null }, { slug: 'b', valor: null }];
    expect(ganadoresPorValor(n, 'menor')).toEqual([]);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: FAIL — `ganadoresPorValor` no exportado.

- [ ] **Step 3: Implementación**

Añadir a `src/lib/sillas.ts`:
```ts
export type DireccionComparacion = 'mayor' | 'menor';

export function ganadoresPorValor(
  items: { slug: string; valor: number | null }[],
  direccion: DireccionComparacion
): string[] {
  const conValor = items.filter((i): i is { slug: string; valor: number } => i.valor != null);
  if (conValor.length === 0) return [];
  const mejor = conValor.reduce(
    (m, i) => (direccion === 'mayor' ? Math.max(m, i.valor) : Math.min(m, i.valor)),
    conValor[0].valor
  );
  return conValor.filter((i) => i.valor === mejor).map((i) => i.slug);
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npx vitest run src/lib/sillas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sillas.ts src/lib/sillas.test.ts
git commit -m "feat(sillas): ganadoresPorValor for comparator winner highlighting (TDD)"
```

---

## Task 4: `FallbackImagen.astro` + `ImagenSilla.astro`

**Files:**
- Create: `src/components/FallbackImagen.astro`
- Create: `src/components/ImagenSilla.astro`

- [ ] **Step 1: Crear `FallbackImagen.astro`**

```astro
---
interface Props { marca: string; nombre: string; size?: number; }
const { marca, nombre, size = 200 } = Astro.props;
---
<div class="fallback-img" style={`--s:${size}px`} role="img" aria-label={`${marca} ${nombre} (sin imagen disponible)`}>
  <span class="fb-marca">{marca}</span>
  <span class="fb-nombre">{nombre}</span>
  <span class="fb-nota">sin imagen</span>
</div>
<style>
  .fallback-img { width: var(--s); height: var(--s); background: var(--color-bg-muted); border-radius: var(--radius-md);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem; text-align: center; padding: 0.6rem; flex-shrink: 0; }
  .fb-marca { font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .fb-nombre { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; color: var(--color-text); line-height: 1.15; }
  .fb-nota { font-size: 0.62rem; color: var(--color-text-muted); opacity: 0.7; margin-top: 0.2rem; }
</style>
```

- [ ] **Step 2: Crear `ImagenSilla.astro`**

```astro
---
import FallbackImagen from './FallbackImagen.astro';
interface Props { imagen?: string; imagenAlt?: string; marca: string; nombre: string; size?: number; }
const { imagen, imagenAlt, marca, nombre, size = 200 } = Astro.props;
const tieneImagen = imagen != null && imagen.trim() !== '';
---
{tieneImagen ? (
  <img src={imagen} alt={imagenAlt ?? nombre} width={size} height={size} loading="lazy" decoding="async" class="img-silla" />
) : (
  <FallbackImagen marca={marca} nombre={nombre} size={size} />
)}
<style>
  .img-silla { object-fit: contain; background: var(--color-bg-muted); border-radius: var(--radius-md); padding: 0.5rem; flex-shrink: 0; }
</style>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK (componentes compilan aunque aún no se usen).

- [ ] **Step 4: Commit**

```bash
git add src/components/FallbackImagen.astro src/components/ImagenSilla.astro
git commit -m "feat(sillas): ImagenSilla with branded FallbackImagen for missing photos"
```

---

## Task 5: `ValoracionEjes.astro`

**Files:**
- Create: `src/components/ValoracionEjes.astro`

- [ ] **Step 1: Crear el componente**

```astro
---
import { notaGlobal, type Silla } from '@/lib/sillas';
interface Props { silla: Silla; }
const { silla } = Astro.props;

const v = silla.valoraciones;
const ejes: { etiqueta: string; valor: number | null }[] = [
  { etiqueta: 'Ergonomía', valor: v?.ergonomia ?? null },
  { etiqueta: 'Ajustabilidad', valor: v?.ajustabilidad ?? null },
  { etiqueta: 'Materiales', valor: v?.materiales ?? null },
  { etiqueta: 'Comodidad', valor: v?.comodidad ?? null },
  { etiqueta: 'Calidad-precio', valor: v?.calidadPrecio ?? null },
];
const global = notaGlobal(silla);
---
<section class="vejes">
  <div class="vejes-head">
    <h2>Valoración por ejes</h2>
    <span class="vejes-tag">editorial · specs + comunidad</span>
  </div>
  {global != null && (
    <p class="vejes-global"><strong>{global.toFixed(1)}</strong><span>/10 · nota global</span></p>
  )}
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

- [ ] **Step 2: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/ValoracionEjes.astro
git commit -m "feat(sillas): ValoracionEjes component (sub-score bars + global score)"
```

---

## Task 6: `ParaQuien.astro`

**Files:**
- Create: `src/components/ParaQuien.astro`

- [ ] **Step 1: Crear el componente**

```astro
---
interface Props { si: string[]; no: string[]; }
const { si, no } = Astro.props;
---
{(si.length > 0 || no.length > 0) && (
  <div class="paraquien">
    {si.length > 0 && (
      <div class="pq-col pq-si">
        <h3>Para quién sí</h3>
        <ul>{si.map((x) => <li>{x}</li>)}</ul>
      </div>
    )}
    {no.length > 0 && (
      <div class="pq-col pq-no">
        <h3>Para quién no</h3>
        <ul>{no.map((x) => <li>{x}</li>)}</ul>
      </div>
    )}
  </div>
)}
<style>
  .paraquien { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin: 1rem 0 2rem; }
  .pq-col h3 { font-size: 0.85rem; margin-bottom: 0.5rem; }
  .pq-col ul { list-style: none; padding: 0; margin: 0; font-size: 0.88rem; }
  .pq-col li { padding: 0.25rem 0 0.25rem 1.3rem; position: relative; }
  .pq-si li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 700; }
  .pq-no li::before { content: "✕"; position: absolute; left: 0; color: #dc2626; font-weight: 700; }
  @media (max-width: 560px) { .paraquien { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/ParaQuien.astro
git commit -m "feat(sillas): ParaQuien component (for-whom yes/no lists)"
```

---

## Task 7: Enriquecer `FichaSilla.astro` + schema `Review` en la ruta

**Files:**
- Modify: `src/components/FichaSilla.astro`
- Modify: `src/pages/sillas/catalogo/[slug].astro`

- [ ] **Step 1: Reescribir `FichaSilla.astro`**

Sustituir TODO el contenido de `src/components/FichaSilla.astro` por:
```astro
---
import BotonPrecio from './BotonPrecio.astro';
import ImagenSilla from './ImagenSilla.astro';
import ValoracionEjes from './ValoracionEjes.astro';
import ParaQuien from './ParaQuien.astro';
import { notaGlobal, type Silla } from '@/lib/sillas';

interface Props { silla: Silla; }
const { silla } = Astro.props;

const ETIQUETA_LUMBAR: Record<string, string> = {
  fijo: 'Fijo', presion: 'Ajustable en presión', altura: 'Ajustable en altura',
  dinamico: 'Dinámico autoajustable', '5d': '5D ajustable',
};
const ETIQUETA_REPOSABRAZOS: Record<string, string> = {
  ninguno: 'Ninguno', fijo: 'Fijos', '1d': '1D (altura)', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Abatibles',
};
const ETIQUETA_RESPALDO: Record<string, string> = { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla + cojín' };

function fmt(v: number | null | undefined, sufijo = ''): string {
  return v == null ? 'n/d' : `${v}${sufijo}`;
}
const dimensiones = (silla.anchoCm != null || silla.fondoCm != null)
  ? `${fmt(silla.anchoCm)} × ${fmt(silla.fondoCm)} cm (an × fo)`
  : 'n/d';
const altura = (silla.alturaAsientoMinCm != null && silla.alturaAsientoMaxCm != null)
  ? `${silla.alturaAsientoMinCm}–${silla.alturaAsientoMaxCm} cm` : 'n/d';

const grupos: { titulo: string; filas: { etiqueta: string; valor: string }[] }[] = [
  { titulo: 'Ergonomía y ajustes', filas: [
    { etiqueta: 'Soporte lumbar', valor: ETIQUETA_LUMBAR[silla.lumbar] ?? silla.lumbar },
    { etiqueta: 'Reposabrazos', valor: ETIQUETA_REPOSABRAZOS[silla.reposabrazos] ?? silla.reposabrazos },
    { etiqueta: 'Profundidad de asiento regulable', valor: silla.profundidadRegulable ? 'Sí' : 'No' },
    { etiqueta: 'Reclinación máx.', valor: fmt(silla.reclinacionMaxGrados, '°') },
    { etiqueta: 'Mecanismo', valor: silla.mecanismo ?? 'n/d' },
  ]},
  { titulo: 'Construcción y materiales', filas: [
    { etiqueta: 'Respaldo', valor: ETIQUETA_RESPALDO[silla.respaldo] ?? silla.respaldo },
    { etiqueta: 'Base', valor: silla.baseMaterial ?? 'n/d' },
    { etiqueta: 'Certificación BIFMA', valor: silla.certificacionBifma == null ? 'n/d' : (silla.certificacionBifma ? 'Sí' : 'No') },
    { etiqueta: 'Peso máximo soportado', valor: fmt(silla.pesoMaxKg, ' kg') },
    { etiqueta: 'Peso del producto', valor: fmt(silla.pesoProductoKg, ' kg') },
  ]},
  { titulo: 'Dimensiones y garantía', filas: [
    { etiqueta: 'Altura del asiento', valor: altura },
    { etiqueta: 'Dimensiones', valor: dimensiones },
    { etiqueta: 'Garantía', valor: silla.garantiaAnios == null ? 'n/d' : `${silla.garantiaAnios} años` },
  ]},
];
const global = notaGlobal(silla);
---

<article class="ficha">
  <header class="ficha-header">
    <ImagenSilla imagen={silla.imagen} imagenAlt={silla.imagenAlt} marca={silla.marca} nombre={silla.nombre} size={200} />
    <div>
      <p class="ficha-marca">{silla.marca}</p>
      <h1 class="ficha-nombre">{silla.nombre}</h1>
      <p class="ficha-precio">{silla.precioAprox == null ? 'Precio n/d' : `~${silla.precioAprox} €`}{global != null && <span class="ficha-nota">★ {global.toFixed(1)}/10</span>}</p>
      {silla.idealPara && <p class="ficha-ideal">Ideal para: {silla.idealPara}</p>}
      <BotonPrecio amazon={silla.amazon} webOficial={silla.webOficial} nombre={silla.nombre} />
    </div>
  </header>

  <ValoracionEjes silla={silla} />

  {silla.veredicto && (
    <div class="ficha-veredicto"><strong>Veredicto.</strong> {silla.veredicto}</div>
  )}

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

  {silla.comunidad && (
    <>
      <h2>Qué dice la comunidad</h2>
      <p class="ficha-comunidad">{silla.comunidad}</p>
    </>
  )}

  <ParaQuien si={silla.paraQuienSi ?? []} no={silla.paraQuienNo ?? []} />

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
      Las valoraciones por ejes son editoriales (basadas en specs + consenso de la comunidad). Los campos "n/d" no tienen dato verificado; verifica siempre la ficha del fabricante antes de comprar.
    </p>
  )}
</article>

<style>
  .ficha-header { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start; margin-bottom: 1.5rem; }
  .ficha-marca { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem; color: var(--color-text-muted); margin: 0; }
  .ficha-nombre { font-family: var(--font-display); margin: 0.2rem 0 0.5rem; }
  .ficha-precio { font-weight: 700; font-size: 1.1rem; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
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

- [ ] **Step 2: Añadir el schema `Review` editorial honesto en `[slug].astro`**

En `src/pages/sillas/catalogo/[slug].astro`, en el frontmatter, tras la línea `const amazonHref = buildAmazonHref(silla.amazon);`, añadir el import de `notaGlobal` (amplía el import existente desde `@/lib/sillas` para incluir `notaGlobal`) y calcular la nota:
```ts
const nota = notaGlobal(silla);
```
Asegúrate de que el import quede: `import { buildAmazonHref, notaGlobal } from '@/lib/sillas';`

Después del objeto `productSchema` existente, añadir un segundo objeto schema:
```ts
const reviewSchema = nota == null ? null : {
  '@context': 'https://schema.org',
  '@type': 'Review',
  itemReviewed: { '@type': 'Product', name: silla.nombre, brand: { '@type': 'Brand', name: silla.marca } },
  reviewRating: { '@type': 'Rating', ratingValue: String(nota), bestRating: '10', worstRating: '0' },
  author: { '@type': 'Organization', name: 'Tu Espacio de Trabajo' },
  ...(silla.veredicto && { reviewBody: silla.veredicto }),
};
```
Y en el cuerpo, junto al `<script>` existente del `productSchema`, añadir (solo si hay nota):
```astro
  {reviewSchema && <script is:inline type="application/ld+json" set:html={JSON.stringify(reviewSchema)} />}
```

- [ ] **Step 3: Verificar build + schemas**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK.
Run: `grep -rl "FAQPage" dist/ | wc -l; grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.
Run: `grep -l '"@type":"Review"' dist/sillas/catalogo/sihoo-doro-c300/index.html`
Expected: coincide (el Review se renderiza; nota: las 19 sillas actuales aún no tienen `valoraciones`, así que `notaGlobal` cae a `valoracion*2` y el Review aparece igualmente).

- [ ] **Step 4: Commit**

```bash
git add src/components/FichaSilla.astro src/pages/sillas/catalogo/[slug].astro
git commit -m "feat(sillas): enrich FichaSilla (sub-scores, verdict, grouped specs, community) + honest Review schema"
```

---

## Task 8: `TarjetaSilla.astro` + casillas de comparar en `CatalogoSillas.astro`

**Files:**
- Create: `src/components/TarjetaSilla.astro`
- Modify: `src/components/CatalogoSillas.astro`

- [ ] **Step 1: Crear `TarjetaSilla.astro`**

```astro
---
import BotonPrecio from './BotonPrecio.astro';
import ImagenSilla from './ImagenSilla.astro';
import { notaGlobal, reposabrazosNivel, type Silla } from '@/lib/sillas';

interface Props { silla: Silla; }
const { silla: s } = Astro.props;
const global = notaGlobal(s);
const ETIQUETA_LUMBAR: Record<string, string> = { fijo: 'Lumbar fijo', presion: 'Lumbar presión', altura: 'Lumbar altura', dinamico: 'Lumbar dinámico', '5d': 'Lumbar 5D' };
const chips = [
  ETIQUETA_LUMBAR[s.lumbar] ?? s.lumbar,
  ({ malla: 'Malla', espuma: 'Espuma', mixto: 'Malla+cojín' } as Record<string,string>)[s.respaldo] ?? s.respaldo,
  s.pesoMaxKg == null ? null : `${s.pesoMaxKg} kg`,
  s.garantiaAnios == null ? 'garantía n/d' : `${s.garantiaAnios} años`,
];
---
<article class="card"
  data-slug={s.slug}
  data-precio={s.precioAprox ?? ''}
  data-respaldo={s.respaldo}
  data-brazos={reposabrazosNivel(s.reposabrazos)}
  data-prof={s.profundidadRegulable ? '1' : '0'}
  data-peso={s.pesoMaxKg ?? ''}
  data-valoracion={s.valoracion}>
  <label class="card-cmp"><input type="checkbox" class="cmp-chk" value={s.slug} /> comparar</label>
  <ImagenSilla imagen={s.imagen} imagenAlt={s.imagenAlt} marca={s.marca} nombre={s.nombre} size={110} />
  <div class="card-info">
    <span class="card-brand">{s.marca}</span>
    <a class="card-name" href={`/sillas/catalogo/${s.slug}/`}>{s.nombre}</a>
    <p class="card-line">
      {global != null && <span class="card-score">{global.toFixed(1)}/10</span>}
      <span class="card-price">{s.precioAprox == null ? 'n/d' : `~${s.precioAprox} €`}</span>
    </p>
    <div class="card-chips">
      {chips.filter((c): c is string => c != null).map((c) => <span class={`chip${c.includes('n/d') ? ' chip-nd' : ''}`}>{c}</span>)}
    </div>
    <BotonPrecio amazon={s.amazon} webOficial={s.webOficial} nombre={s.nombre} />
  </div>
</article>
<style>
  .card { position: relative; display: flex; gap: 1rem; align-items: flex-start; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1rem; }
  .card.cmp-sel { border-color: var(--color-primary); box-shadow: 0 0 0 2px #bfdbfe; }
  .card-cmp { position: absolute; top: 0.6rem; right: 0.6rem; display: flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: var(--color-text-muted); background: #fff; border: 1px solid var(--color-border); border-radius: 8px; padding: 0.2rem 0.5rem; cursor: pointer; }
  .card-info { flex: 1; min-width: 0; }
  .card-brand { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
  .card-name { font-family: var(--font-display); font-weight: 700; color: var(--color-text); text-decoration: none; display: block; margin: 0.05rem 0 0.3rem; }
  .card-name:hover { color: var(--color-primary); }
  .card-line { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 0.5rem; font-weight: 700; font-size: 0.92rem; }
  .card-score { background: var(--color-text); color: #fff; font-family: var(--font-display); font-size: 0.78rem; border-radius: 7px; padding: 0.1rem 0.45rem; }
  .card-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.7rem; }
  .chip { font-size: 0.7rem; background: var(--color-bg-muted); color: #3f3f46; border-radius: 6px; padding: 0.1rem 0.45rem; }
  .chip-nd { color: var(--color-text-muted); font-style: italic; }
</style>
```

- [ ] **Step 2: Reescribir `CatalogoSillas.astro` para usar `TarjetaSilla` + selección de comparar**

Sustituir TODO el contenido de `src/components/CatalogoSillas.astro` por:
```astro
---
import TarjetaSilla from './TarjetaSilla.astro';
import { reposabrazosNivel, type Silla } from '@/lib/sillas';

interface Props { sillas: Silla[]; }
const { sillas } = Astro.props;
---

<section class="catalogo">
  <div class="catalogo-filtros">
    <label>Presupuesto máx (€)
      <input type="range" id="f-precio" min="50" max="2000" step="50" value="2000" />
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

  <p class="catalogo-count"><span id="catalogo-n">{sillas.length}</span> sillas · marca casillas para comparar</p>

  <div class="catalogo-grid" id="catalogo-grid">
    {sillas.map((s) => <TarjetaSilla silla={s} />)}
  </div>
  <p class="catalogo-vacio" id="catalogo-vacio" hidden>Ninguna silla cumple esos filtros. Prueba a relajar alguno.</p>
</section>

<div class="cmp-bar" id="cmp-bar" hidden>
  Has seleccionado <strong id="cmp-n">0</strong> sillas
  <a id="cmp-go" href="/sillas/comparar/">Comparar ⚖️</a>
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
  const grid = document.getElementById('catalogo-grid');
  if (grid) {
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
      const precioMax = parseFloat(fPrecio.value);
      const sinLimite = precioMax >= parseFloat(fPrecio.max);
      fPrecioOut.textContent = sinLimite ? 'Sin límite' : `${precioMax} €`;
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
        if (orden === 'precio-asc') return cmp(val(a, 'precio') ?? Infinity, val(b, 'precio') ?? Infinity);
        if (orden === 'precio-desc') return cmp(val(b, 'precio') ?? -Infinity, val(a, 'precio') ?? -Infinity);
        if (orden === 'peso-max') return cmp(val(b, 'peso') ?? -Infinity, val(a, 'peso') ?? -Infinity);
        return cmp(val(b, 'valoracion') ?? 0, val(a, 'valoracion') ?? 0);
      });
      visiblesArr.forEach((c) => grid.appendChild(c));
      if (nOut) nOut.textContent = String(visibles);
      if (vacio) vacio.hidden = visibles > 0;
    }
    [fPrecio, fRespaldo, fBrazos, fProf, fPeso, fOrden].forEach((el) => el.addEventListener('input', aplicar));
    aplicar();

    // --- selección para comparar ---
    const KEY = 'sillas-comparar';
    const bar = document.getElementById('cmp-bar') as HTMLElement;
    const nEl = document.getElementById('cmp-n') as HTMLElement;
    const go = document.getElementById('cmp-go') as HTMLAnchorElement;
    const clear = document.getElementById('cmp-clear') as HTMLButtonElement;
    const checks = Array.from(grid.querySelectorAll('.cmp-chk')) as HTMLInputElement[];

    const leer = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
    const guardar = (a: string[]) => localStorage.setItem(KEY, JSON.stringify(a));

    function pintar() {
      const sel = leer();
      checks.forEach((ch) => {
        ch.checked = sel.includes(ch.value);
        ch.closest('.card')?.classList.toggle('cmp-sel', ch.checked);
      });
      nEl.textContent = String(sel.length);
      bar.hidden = sel.length === 0;
      const ok = sel.length >= 2 && sel.length <= 4;
      go.setAttribute('aria-disabled', ok ? 'false' : 'true');
      go.href = ok ? `/sillas/comparar/?s=${sel.join(',')}` : '/sillas/comparar/';
    }
    checks.forEach((ch) => ch.addEventListener('change', () => {
      let sel = leer();
      if (ch.checked) { if (!sel.includes(ch.value)) { if (sel.length >= 4) { ch.checked = false; alert('Puedes comparar hasta 4 sillas.'); return; } sel.push(ch.value); } }
      else { sel = sel.filter((s) => s !== ch.value); }
      guardar(sel); pintar();
    }));
    clear.addEventListener('click', () => { guardar([]); pintar(); });
    pintar();
  }
</script>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build 2>&1 | tail -3`
Expected: build OK. Si el build cambia `public/_headers` (nuevos hashes de script inline), inclúyelo en el commit.

- [ ] **Step 4: Commit**

```bash
git add src/components/TarjetaSilla.astro src/components/CatalogoSillas.astro
git add public/_headers 2>/dev/null || true
git commit -m "feat(sillas): enriched TarjetaSilla + compare selection (checkboxes + floating bar)"
```

---

## Task 9: `ComparadorSillas.astro` + ruta `/sillas/comparar/`

**Files:**
- Create: `src/components/ComparadorSillas.astro`
- Create: `src/pages/sillas/comparar.astro`

- [ ] **Step 1: Crear `ComparadorSillas.astro`**

Embebe todas las sillas como JSON y renderiza la tabla en cliente según `?s=`. Usa `ganadoresPorValor` y `notaGlobal` de la lib (fuente única). Las filas con `direccion` se resaltan; los `n/d` no ganan.

```astro
---
import { type Silla } from '@/lib/sillas';
interface Props { sillas: Silla[]; }
const { sillas } = Astro.props;
const sillasJson = JSON.stringify(sillas);
---
<section class="cmp" data-sillas={sillasJson}>
  <div id="cmp-out"></div>
  <p id="cmp-empty" class="cmp-empty" hidden>Elige entre 2 y 4 sillas en el <a href="/sillas/catalogo/">catálogo</a> (marca las casillas "comparar") y vuelve aquí.</p>
</section>

<style>
  .cmp-empty { color: var(--color-text-muted); }
  .cmp-scroll { overflow-x: auto; }
  .cmp-table { border-collapse: collapse; width: 100%; min-width: 640px; }
  .cmp-table td, .cmp-table th { padding: 0.7rem 0.8rem; border-bottom: 1px solid var(--color-border); text-align: left; font-size: 0.86rem; vertical-align: middle; }
  .cmp-attr { color: var(--color-text-muted); font-weight: 600; font-size: 0.8rem; position: sticky; left: 0; background: #fff; width: 170px; }
  .cmp-grp td { background: #fbfbfb; font-family: var(--font-display); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
  .cmp-head .cmp-photo { width: 84px; height: 84px; margin-bottom: 0.4rem; }
  .cmp-brand { font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
  .cmp-name { font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; }
  .cmp-name a { color: inherit; text-decoration: none; }
  .cmp-global { font-family: var(--font-display); font-weight: 700; margin-top: 0.2rem; }
  .cmp-global small { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 500; }
  .cmp-rm { font-size: 0.7rem; color: var(--color-text-muted); border: 1px solid var(--color-border); border-radius: 6px; padding: 0.1rem 0.4rem; background: none; cursor: pointer; margin-top: 0.3rem; }
  .cmp-win { background: #ecfdf5; box-shadow: inset 3px 0 0 #16a34a; }
  .cmp-wtag { font-size: 0.58rem; font-weight: 700; color: #16a34a; text-transform: uppercase; margin-left: 0.3rem; }
  .cmp-nd { color: var(--color-text-muted); font-style: italic; }
  .cmp-bar2 { height: 7px; width: 64px; background: var(--color-bg-muted); border-radius: 99px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 0.4rem; }
  .cmp-bar2 i { display: block; height: 100%; background: linear-gradient(90deg, var(--color-primary), #60a5fa); }
  .cmp-fb { width: 84px; height: 84px; background: var(--color-bg-muted); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 0.62rem; color: var(--color-text-muted); text-align: center; padding: 0.3rem; }
  .cmp-cta { display: inline-block; background: var(--color-primary); color: #fff; font-weight: 600; font-size: 0.78rem; padding: 0.45rem 0.9rem; border-radius: 8px; text-decoration: none; }
  .cmp-legend { font-size: 0.76rem; color: var(--color-text-muted); margin-top: 0.8rem; }
</style>

<script>
  import { ganadoresPorValor, notaGlobal, reposabrazosNivel, buildAmazonHref, type Silla } from '@/lib/sillas';

  const root = document.querySelector('.cmp') as HTMLElement | null;
  if (root) {
    const todas: Silla[] = JSON.parse(root.dataset.sillas || '[]');
    const out = root.querySelector('#cmp-out') as HTMLElement;
    const empty = root.querySelector('#cmp-empty') as HTMLElement;

    const ETI_LUMBAR: Record<string, string> = { fijo: 'Fijo', presion: 'Presión', altura: 'Altura', dinamico: 'Dinámico', '5d': '5D' };
    const ETI_RESP: Record<string, string> = { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla+cojín' };
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

    function slugsDeUrl(): string[] {
      const p = new URLSearchParams(location.search).get('s') || '';
      return p.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 4);
    }

    const sel = slugsDeUrl()
      .map((sl) => todas.find((t) => t.slug === sl))
      .filter((s): s is Silla => s != null);

    if (sel.length < 2) { empty.hidden = false; }
    else {
      // filas con dirección de "ganador"
      const ejeFns: Record<string, (s: Silla) => number | null> = {
        ergonomia: (s) => s.valoraciones?.ergonomia ?? null,
        ajustabilidad: (s) => s.valoraciones?.ajustabilidad ?? null,
        materiales: (s) => s.valoraciones?.materiales ?? null,
        comodidad: (s) => s.valoraciones?.comodidad ?? null,
        calidadPrecio: (s) => s.valoraciones?.calidadPrecio ?? null,
      };
      function barCell(v: number | null) {
        if (v == null) return '<span class="cmp-nd">sin valorar</span>';
        return `<span class="cmp-bar2"><i style="width:${v * 10}%"></i></span><b>${v.toFixed(1)}</b>`;
      }
      function ganBar(clave: string, dir: 'mayor' | 'menor', fn: (s: Silla) => number | null) {
        return ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: fn(s) })), dir);
      }

      type Fila = { etiqueta: string; render: (s: Silla) => string; gan?: string[]; };
      const filas: ({ grupo: string } | Fila)[] = [
        { grupo: 'Valoración por ejes' },
        { etiqueta: 'Ergonomía', render: (s) => barCell(ejeFns.ergonomia(s)), gan: ganBar('ergonomia', 'mayor', ejeFns.ergonomia) },
        { etiqueta: 'Ajustabilidad', render: (s) => barCell(ejeFns.ajustabilidad(s)), gan: ganBar('ajustabilidad', 'mayor', ejeFns.ajustabilidad) },
        { etiqueta: 'Materiales', render: (s) => barCell(ejeFns.materiales(s)), gan: ganBar('materiales', 'mayor', ejeFns.materiales) },
        { etiqueta: 'Comodidad', render: (s) => barCell(ejeFns.comodidad(s)), gan: ganBar('comodidad', 'mayor', ejeFns.comodidad) },
        { etiqueta: 'Calidad-precio', render: (s) => barCell(ejeFns.calidadPrecio(s)), gan: ganBar('calidadPrecio', 'mayor', ejeFns.calidadPrecio) },
        { grupo: 'Precio y garantía' },
        { etiqueta: 'Precio aprox.', render: (s) => s.precioAprox == null ? '<span class="cmp-nd">n/d</span>' : `~${s.precioAprox} €`, gan: ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: s.precioAprox })), 'menor') },
        { etiqueta: 'Garantía', render: (s) => s.garantiaAnios == null ? '<span class="cmp-nd">n/d</span>' : `${s.garantiaAnios} años`, gan: ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: s.garantiaAnios })), 'mayor') },
        { grupo: 'Ergonomía y ajustes' },
        { etiqueta: 'Soporte lumbar', render: (s) => ETI_LUMBAR[s.lumbar] ?? s.lumbar },
        { etiqueta: 'Reposabrazos', render: (s) => String(s.reposabrazos).toUpperCase(), gan: ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: reposabrazosNivel(s.reposabrazos) })), 'mayor') },
        { etiqueta: 'Profundidad regulable', render: (s) => s.profundidadRegulable ? 'Sí' : 'No' },
        { etiqueta: 'Reclinación máx.', render: (s) => s.reclinacionMaxGrados == null ? '<span class="cmp-nd">n/d</span>' : `${s.reclinacionMaxGrados}°`, gan: ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: s.reclinacionMaxGrados })), 'mayor') },
        { grupo: 'Construcción' },
        { etiqueta: 'Respaldo', render: (s) => ETI_RESP[s.respaldo] ?? s.respaldo },
        { etiqueta: 'Peso máximo', render: (s) => s.pesoMaxKg == null ? '<span class="cmp-nd">n/d</span>' : `${s.pesoMaxKg} kg`, gan: ganadoresPorValor(sel.map((s) => ({ slug: s.slug, valor: s.pesoMaxKg })), 'mayor') },
      ];

      const head = sel.map((s) => {
        const g = notaGlobal(s);
        const href = buildAmazonHref(s.amazon) || s.webOficial || '';
        const cta = href ? `<a class="cmp-cta" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${buildAmazonHref(s.amazon) ? 'Ver precio' : 'Web oficial'}</a>` : '';
        const img = (s.imagen && s.imagen.trim() !== '')
          ? `<img class="cmp-photo" src="${esc(s.imagen)}" alt="${esc(s.imagenAlt || s.nombre)}" width="84" height="84" loading="lazy" style="object-fit:contain;background:var(--color-bg-muted);border-radius:var(--radius-md);padding:4px">`
          : `<div class="cmp-fb">${esc(s.marca)}<br>${esc(s.nombre)}</div>`;
        return `<td class="cmp-head">${img}<div class="cmp-brand">${esc(s.marca)}</div><div class="cmp-name"><a href="/sillas/catalogo/${esc(s.slug)}/">${esc(s.nombre)}</a></div>${g != null ? `<div class="cmp-global">${g.toFixed(1)}<small>/10</small></div>` : ''}<button class="cmp-rm" data-slug="${esc(s.slug)}">✕ quitar</button></td>`;
      }).join('');

      const body = filas.map((f) => {
        if ('grupo' in f) return `<tr class="cmp-grp"><td class="cmp-attr">${esc(f.grupo)}</td>${sel.map(() => '<td></td>').join('')}</tr>`;
        const cells = sel.map((s) => {
          const win = f.gan?.includes(s.slug);
          return `<td class="${win ? 'cmp-win' : ''}">${f.render(s)}${win ? '<span class="cmp-wtag">mejor</span>' : ''}</td>`;
        }).join('');
        return `<tr><td class="cmp-attr">${esc(f.etiqueta)}</td>${cells}</tr>`;
      }).join('');

      const ctas = sel.map((s) => {
        const href = buildAmazonHref(s.amazon) || s.webOficial || '';
        return `<td>${href ? `<a class="cmp-cta" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${buildAmazonHref(s.amazon) ? 'Ver precio' : 'Web oficial'}</a>` : ''}</td>`;
      }).join('');

      out.innerHTML = `<div class="cmp-scroll"><table class="cmp-table"><thead><tr><td class="cmp-attr"></td>${head}</tr></thead><tbody>${body}<tr><td class="cmp-attr"></td>${ctas}</tr></tbody></table></div><p class="cmp-legend">Celda resaltada = mejor valor de la fila. "n/d"/"sin valorar" no se considera ganador. Valoraciones por ejes editoriales.</p>`;

      out.querySelectorAll('.cmp-rm').forEach((b) => b.addEventListener('click', () => {
        const slug = (b as HTMLElement).dataset.slug;
        const rest = sel.filter((s) => s.slug !== slug).map((s) => s.slug);
        location.search = rest.length ? `?s=${rest.join(',')}` : '';
      }));
    }
  }
</script>
```

- [ ] **Step 2: Crear la página `/sillas/comparar/`**

`src/pages/sillas/comparar.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import ComparadorSillas from '@/components/ComparadorSillas.astro';
import { getCollection } from 'astro:content';

const entries = await getCollection('sillas');
const sillas = entries.map((e) => ({ slug: e.id.replace(/\.(yaml|yml|json)$/, ''), ...e.data }));

const titulo = 'Comparador de sillas ergonómicas | Tu Espacio de Trabajo';
const descripcion = 'Compara hasta 4 sillas ergonómicas lado a lado: valoración por ejes, precio, garantía, ergonomía y construcción, resaltando la mejor opción de cada criterio.';
---

<Base title={titulo} description={descripcion} noindex={true}>
  <main class="container" style="padding: 2rem 0;">
    <nav class="breadcrumb" aria-label="Migas de pan">
      <a href="/sillas/">Sillas</a> › <a href="/sillas/catalogo/">Catálogo</a> › <span>Comparar</span>
    </nav>
    <h1>Comparativa de sillas</h1>
    <ComparadorSillas sillas={sillas} />
  </main>
</Base>
```
> Nota: `Base` ya admite la prop `noindex`. Si no, añade `<meta name="robots" content="noindex, follow">` equivalente. El comparador es una herramienta cuyo contenido varía por query; el SEO de comparativas vive en las futuras páginas "vs".

- [ ] **Step 3: Verificar build + ruta + noindex**

Run: `npm run build 2>&1 | grep -E 'comparar' | head`
Expected: aparece `/sillas/comparar/index.html`.
Run: `grep -o 'noindex' dist/sillas/comparar/index.html | head -1`
Expected: `noindex`.
Run: `npm run build 2>&1 | tail -3`
Expected: build OK. Incluye `public/_headers` en el commit si cambió.

- [ ] **Step 4: Commit**

```bash
git add src/components/ComparadorSillas.astro src/pages/sillas/comparar.astro
git add public/_headers 2>/dev/null || true
git commit -m "feat(sillas): interactive comparator /sillas/comparar (select 2-4, winner highlighting)"
```

---

## Task 10: Enriquecer los datos de las 19 sillas (PILAR — investigación a fondo)

**Files:**
- Modify: `src/content/sillas/*.yaml` (las 19)

> **Esta es la tarea más importante del plan.** Un comparador sin datos buenos no sirve. Investiga CADA silla a fondo en fuentes reales y rellena todo lo verificable; deja `null` SOLO lo genuinamente no localizable. NUNCA inventes un número. Las valoraciones por ejes son editoriales pero deben estar fundadas en specs + consenso real.

- [ ] **Step 1: Investigar cada silla en fuentes reales**

Para cada uno de los 19 `.yaml` de `src/content/sillas/`, consultar (usar WebSearch/WebFetch): web del fabricante, ficha de Amazon.es, reviews especializadas (p. ej. RTINGS, btod, seatedlab), r/OfficeChairs y foros, fichas de distribuidores. Recopilar, cuando se confirmen: `anchoCm`, `fondoCm`, `mecanismo`, `baseMaterial`, `certificacionBifma`, `pesoProductoKg`, y los ya existentes que estuvieran a `null` (`alturaAsientoMinCm/Max`, `reclinacionMaxGrados`, `garantiaAnios`, `pesoMaxKg`). Capturar también una URL de imagen real legítima para `imagen` cuando exista (CDN de Amazon para sillas en Amazon; imagen oficial del fabricante si su uso es legítimo); si hay duda, dejar `imagen: ""`.

- [ ] **Step 2: Asignar valoraciones por ejes (rúbrica editorial 0-10)**

Para cada silla, puntuar 0-10 cada eje siguiendo esta rúbrica consistente; eje sin base suficiente → `null`:
- `ergonomia`: tipo y calidad del soporte lumbar, reclinación, consenso ergonómico de reviews/comunidad.
- `ajustabilidad`: número y tipo de ajustes (reposabrazos D, profundidad de asiento, lumbar, altura, reclinación).
- `materiales`: calidad de malla/espuma, base (aluminio>nylon), durabilidad/garantía, consenso.
- `comodidad`: consenso de uso prolongado (reviews/Reddit).
- `calidadPrecio`: prestaciones frente al precio en su segmento.
Calibración orientativa (coherencia entre sillas): referencias premium muy aclamadas (Aeron, Leap V2, Gesture, Embody) ~9-9.7 en ergonomía/materiales; gama media sólida (Doro C300, C7 Lite, SIHOO M57) ~8-8.8; económicas correctas (Markus, Hbada, M102C) ~6.5-8; básicas (Songmics, Durrafy) ~5.5-7. La calidad-precio suele invertirse (las económicas competentes puntúan alto aquí). Documenta el porqué en `comunidad`/`fuenteSpecs` cuando ayude.

- [ ] **Step 3: Redactar contenido editorial por silla**

Añadir a cada `.yaml`: `veredicto` (1-2 frases), `comunidad` (resumen honesto del consenso de foros/Reddit con la fuente reflejada en `fuenteSpecs`), `paraQuienSi` (2-4 ítems), `paraQuienNo` (2-4 ítems). Actualizar `fuenteSpecs` para reflejar TODAS las fuentes realmente consultadas, y `verificadoEn: "2026-06-06"`.

Ejemplo completo (plantilla real, SIHOO Doro C300 — ajusta los valores a lo que verifiques de verdad):
```yaml
valoraciones:
  ergonomia: 8.8
  ajustabilidad: 8.0
  materiales: 8.5
  comodidad: 8.2
  calidadPrecio: 9.0
anchoCm: null
fondoCm: null
mecanismo: "Sincro con bloqueo en 4 posiciones"
baseMaterial: "Nylon reforzado"
certificacionBifma: null
pesoProductoKg: null
veredicto: "La ergonomía premium más accesible: lumbar dinámico real sin pagar 1.000 €+."
comunidad: "Muy valorada en r/OfficeChairs como alternativa sensata a una Aeron usada; destacan el lumbar dinámico y la densidad de la malla, critican la firmeza inicial del asiento."
paraQuienSi:
  - "Teletrabajo de jornada completa"
  - "Quien quiere lumbar dinámico sin precio premium"
  - "Usuarios de hasta 150 kg"
paraQuienNo:
  - "Presupuesto por debajo de 200 €"
  - "Quien necesite profundidad de asiento regulable"
```
> Mantén los campos existentes; añade los nuevos. Respeta el estilo YAML (comillas dobles, indentación de 2 espacios).

- [ ] **Step 4: Verificar que Zod valida todas las entradas enriquecidas**

Run: `npm run build 2>&1 | tail -6`
Expected: build OK (cualquier valor de eje fuera de 0-10, enum mal escrito o tipo inválido falla aquí). Corrige y repite hasta verde.

- [ ] **Step 5: Auditoría de honestidad**

Revisar cada `.yaml`: ¿cada número no nulo tiene fuente real? ¿`fuenteSpecs` refleja lo realmente consultado? ¿algún eje puntuado sin base? Ajustar (a `null` lo no fundado). Confirmar que NO se han inventado ASINs ni datos.

- [ ] **Step 6: Commit**

```bash
git add src/content/sillas/
git commit -m "feat(sillas): enrich 19 chairs with researched specs, sub-scores and editorial content"
```

---

## Task 11: Verificación final + pulido

**Files:** (sin código nuevo salvo ajustes de estilo)

- [ ] **Step 1: Suite de tests**

Run: `npm run test`
Expected: PASS (todos los tests de `src/lib/sillas.test.ts`, incluidos `mediaEjesPresentes`, `notaGlobal`, `ganadoresPorValor`).

- [ ] **Step 2: Build limpio**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK. Páginas = 57 previas + 1 (`/sillas/comparar/`) = 58 (las fichas y catálogo no cambian de número).

- [ ] **Step 3: Schemas**

Run: `grep -rl "FAQPage" dist/ | wc -l && grep -rl '"HowTo"' dist/ | wc -l`
Expected: `0` y `0`.
Run: `grep -c '"@type":"Review"' dist/sillas/catalogo/sihoo-doro-c300/index.html`
Expected: ≥ 1 (Review editorial presente).

- [ ] **Step 4: Revisión visual local**

Run: `npm run dev` y abrir:
- `http://localhost:4321/sillas/catalogo/` — 19 sillas visibles por defecto (slider "Sin límite"); tarjetas con badge nota, chips e imagen/fallback; marcar 2-3 casillas → barra flotante "Comparar".
- Pulsar "Comparar" → `http://localhost:4321/sillas/comparar/?s=...` — tabla lado a lado, barras por eje, resalte del ganador por fila, "quitar".
- `http://localhost:4321/sillas/catalogo/herman-miller-aeron/` — ficha con valoración por ejes + nota global, veredicto, specs agrupadas con n/d, "qué dice la comunidad", para quién sí/no, y fallback de imagen.
Validar aspecto profesional; iterar estilos si algo se ve pobre.

- [ ] **Step 5: Commit final (si hubo ajustes de estilo)**

```bash
git add -A
git commit -m "polish(sillas): visual refinements after review"
```

---

## Self-Review (rellenado al escribir el plan)

**Cobertura del spec:**
- Modelo de datos ampliado → Task 1 (schema) + 10 (poblar). ✅
- Valoración por ejes + nota global → Task 2 (lib) + 5 (ValoracionEjes) + 7 (ficha). ✅
- Contenido editorial (veredicto/comunidad/para-quién) → Task 6 (ParaQuien) + 7 (ficha) + 10 (datos). ✅
- Comparador (selección 2-4 + tabla + ganador) → Task 3 (ganadoresPorValor) + 8 (selección) + 9 (comparador). ✅
- Imágenes reales + fallback → Task 4 (ImagenSilla/FallbackImagen), usado en 7/8/9. ✅
- SEO/schema Review honesto; sin FAQPage/HowTo; comparador noindex → Task 7 (Review) + 9 (noindex) + 11 (greps). ✅
- Honestidad (n/d, ejes editoriales, fuentes) → Task 1 (nullable) + 10 (auditoría). ✅

**Consistencia de tipos:** `Valoraciones`, `notaGlobal`, `mediaEjesPresentes`, `ganadoresPorValor`, `DireccionComparacion` definidos en Task 2-3 y usados con la misma firma en 5/7/8/9. Campos nuevos de `Silla` (opcionales) consistentes entre schema (Task 1) y tipo (Task 2). ✅

**Sin placeholders:** cada paso de código incluye el código completo; Task 10 da rúbrica + ejemplo real completo (la investigación por silla es trabajo de ejecución, no un placeholder de código).

**Riesgo conocido:** Task 10 es intensiva en investigación honesta; algunas premium poco documentadas tendrán varios `n/d`. La rúbrica fija la coherencia de las valoraciones. Revisar URLs/precios antes de desplegar.
