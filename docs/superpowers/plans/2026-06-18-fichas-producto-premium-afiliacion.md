# Fichas Producto Premium y Afiliacion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir las fichas de producto del catalogo en paginas utiles, comparables y monetizables, sin romper las reglas de Amazon Associates ni crear paginas finas.

**Architecture:** Mantener la collection `productos` como fuente unica, ampliar su schema con campos editoriales verificables y dividir `FichaProducto.astro` en bloques mas claros: hero, resumen de compra, metodologia, specs, comunidad, comparativas y CTA. La afiliacion se centraliza en `src/lib/productos.ts` y `src/components/BotonPrecio.astro` para evitar tags duplicados y para que todos los CTAs sigan la misma politica.

**Tech Stack:** Astro 5 static output, content collections YAML, TypeScript helpers, Vitest, CSS plano con custom properties.

---

## Decision De Afiliacion

No implementar un boton a Google para productos sin ASIN. Amazon Espana define una compra adscrita cuando el cliente hace clic en un Enlace Especial desde nuestro sitio hacia Amazon durante la misma sesion; esa sesion dura hasta 24 horas, pedido, o clic en otro enlace especial. Pero tambien excluye compras cuando el cliente llega a Amazon desde un motor de busqueda como Google.

Plan correcto:

- ASIN verificado: CTA directo a `https://www.amazon.es/dp/ASIN?tag=tuespaciodet-21`.
- Sin ASIN: CTA principal a una busqueda directa dentro de Amazon, no Google: `https://www.amazon.es/s?k=query&tag=tuespaciodet-21`.
- La query se genera desde `amazon.buscar` si existe; si no existe, desde `marca + nombre`, salvo que el resultado sea claramente enganoso.
- Web oficial queda como enlace secundario de referencia/fuente, no como CTA comercial principal.
- Sin ASIN ni busqueda fiable: estado "sin tienda verificada" y, si existe, enlace secundario a web oficial.
- Antes de activar busquedas Amazon en produccion, validar que el formato aparece correctamente en Amazon Associates/SiteStripe o en un click de prueba reportado como link type valido.

## File Structure

- Modify: `src/lib/productos.ts`
  - Add `buildAmazonSearchHref()`, `buildProductCta()`, source/confidence helpers and tests.
- Modify: `src/content/config.ts`
  - Extend product schema with fields for ficha differential: `resumenCompra`, `metodologia`, `fuentes`, `limitaciones`, `alternativas`, `scoreRationale`.
- Modify: `src/components/BotonPrecio.astro`
  - Replace official-site-first fallback with Amazon-search-first CTA states.
- Modify: `src/components/producto/FichaProducto.astro`
  - Split ficha into clearer sections and surface decision-critical data above the fold.
- Create: `src/components/producto/FichaHero.astro`
- Create: `src/components/producto/FichaResumenCompra.astro`
- Create: `src/components/producto/FichaMetodologiaProducto.astro`
- Create: `src/components/producto/FichaFuentes.astro`
- Modify: `src/components/producto/ValoracionEjes.astro`
  - Add score rationale per axis where available.
- Modify: `src/components/producto/TarjetaProducto.astro`
  - Add stronger card hierarchy, CTA state badge, and richer chips.
- Modify: `src/pages/catalogo/[tipo]/[slug].astro`
  - Improve Product/Review schema using honest author/entity data and no fake offers for products without price.
- Modify: `src/content/productos/*.yaml`
  - Gradual data migration. Start with 5 sillas canonicales before scaling.
- Test: `src/lib/productos.test.ts`
  - Add CTA, search fallback, schema helper and confidence tests.
- Verify: `npm test`, `npm run build`, manual visual check for `/catalogo/silla/`, `/catalogo/silla/herman-miller-aeron/`, `/catalogo/silla/sihoo-doro-c300/`, `/comparar/silla/`.

---

### Task 1: Centralizar Politica De CTA

**Files:**
- Modify: `src/lib/productos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Add failing tests for CTA policy**

Add this test block to `src/lib/productos.test.ts` after `describe('buildAmazonHref', ...)`:

```ts
describe('buildProductCta', () => {
  it('prioriza ASIN verificado', () => {
    expect(buildProductCta({
      amazon: { asin: 'B0TEST1234', buscar: 'silla ergonomica' },
      webOficial: 'https://example.com',
      nombre: 'Demo',
    })).toEqual({
      href: 'https://www.amazon.es/dp/B0TEST1234?tag=tuespaciodet-21',
      label: 'Ver precio en Amazon',
      kind: 'amazon-product',
      sponsored: true,
    });
  });

  it('usa busqueda directa en Amazon cuando no hay ASIN pero si query', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: 'IKEA MARKUS silla oficina' },
      webOficial: null,
      nombre: 'IKEA MARKUS',
    })).toEqual({
      href: 'https://www.amazon.es/s?k=IKEA%20MARKUS%20silla%20oficina&tag=tuespaciodet-21',
      label: 'Buscar en Amazon',
      kind: 'amazon-search',
      sponsored: true,
    });
  });

  it('genera busqueda Amazon desde nombre y marca si no hay query manual', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: null },
      webOficial: 'https://example.com/producto',
      nombre: 'Aeron',
      marca: 'Herman Miller',
    })).toEqual({
      href: 'https://www.amazon.es/s?k=Herman%20Miller%20Aeron&tag=tuespaciodet-21',
      label: 'Buscar en Amazon',
      kind: 'amazon-search',
      sponsored: true,
    });
  });

  it('devuelve estado sin tienda si la busqueda Amazon esta desactivada', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: null },
      webOficial: null,
      nombre: 'Sin destino',
      disableAmazonSearch: true,
    })).toEqual({
      href: null,
      label: 'Sin tienda verificada',
      kind: 'unavailable',
      sponsored: false,
    });
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
npm test -- src/lib/productos.test.ts
```

Expected: FAIL because `buildProductCta` is not exported.

- [ ] **Step 3: Implement CTA helper**

Add this to `src/lib/productos.ts` near `buildAmazonHref`:

```ts
export type ProductCtaKind = 'amazon-product' | 'amazon-search' | 'unavailable';

export interface ProductCtaInput {
  amazon?: ProductoAmazon;
  webOficial?: string | null;
  nombre: string;
  marca?: string;
  disableAmazonSearch?: boolean;
}

export interface ProductCta {
  href: string | null;
  label: string;
  kind: ProductCtaKind;
  sponsored: boolean;
}

export function buildAmazonSearchHref(query?: string | null): string | null {
  const q = query?.trim();
  if (!q) return null;
  return `https://www.amazon.es/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
}

export function buildProductCta(input: ProductCtaInput): ProductCta {
  const productHref = buildAmazonHref(input.amazon);
  if (productHref) {
    return { href: productHref, label: 'Ver precio en Amazon', kind: 'amazon-product', sponsored: true };
  }

  const fallbackQuery = [input.marca, input.nombre].filter(Boolean).join(' ');
  const searchHref = input.disableAmazonSearch
    ? null
    : buildAmazonSearchHref(input.amazon?.buscar || fallbackQuery);
  if (searchHref) {
    return { href: searchHref, label: 'Buscar en Amazon', kind: 'amazon-search', sponsored: true };
  }

  return { href: null, label: 'Sin tienda verificada', kind: 'unavailable', sponsored: false };
}
```

- [ ] **Step 4: Import helper in tests**

Update the import list in `src/lib/productos.test.ts`:

```ts
import {
  mediaEjesPresentes,
  notaGlobal,
  ganadoresPorValor,
  getCampo,
  seleccionarParesVs,
  construirIndiceBusqueda,
  formatoSpec,
  tramoTexto,
  etiquetaEnum,
  reposabrazosNivel,
  buildAmazonHref,
  buildProductCta,
  claveData,
  valorComparacion,
  datosFiltrado,
} from './productos';
```

- [ ] **Step 5: Run unit tests**

Run:

```bash
npm test -- src/lib/productos.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/productos.ts src/lib/productos.test.ts
git commit -m "feat: centralize product CTA policy"
```

---

### Task 2: Actualizar BotonPrecio Con Estados Monetizables

**Files:**
- Modify: `src/components/BotonPrecio.astro`
- Depends on: Task 1

- [ ] **Step 1: Replace CTA logic**

Replace the frontmatter in `src/components/BotonPrecio.astro` with:

```astro
---
import StoreIcon from './StoreIcon.astro';
import { buildProductCta, type ProductoAmazon } from '@/lib/productos';

interface Props {
  amazon?: ProductoAmazon;
  webOficial?: string | null;
  nombre: string;
  marca?: string;
}

const { amazon, webOficial, nombre, marca } = Astro.props;
const cta = buildProductCta({ amazon, webOficial, nombre, marca });
const rel = cta.sponsored ? 'sponsored nofollow noopener noreferrer' : 'nofollow noopener noreferrer';
---
```

- [ ] **Step 2: Replace markup**

Replace the conditional markup with:

```astro
{cta.href ? (
  <a
    href={cta.href}
    class={`affiliate-button ${cta.kind.startsWith('amazon') ? 'amazon' : ''} boton-precio boton-precio--${cta.kind}`}
    target="_blank"
    rel={rel}
    data-cta-kind={cta.kind}
  >
    {cta.kind.startsWith('amazon') && <StoreIcon tienda="amazon" size={15} />}
    {cta.label}
    <span class="sr-only">{`de ${nombre} (se abre en nueva pestaña)`}</span>
  </a>
) : (
  <span class="boton-sin-tienda">{cta.label}</span>
)}
```

- [ ] **Step 3: Replace local styles**

Replace `.boton-web-oficial` styles with:

```css
  .boton-precio {
    min-height: 2.6rem;
    align-items: center;
    justify-content: center;
  }
```

Keep `.boton-sin-tienda` and `.sr-only`.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: PASS and no Astro component errors.

- [ ] **Step 5: Manual check**

Open local preview and inspect:

- `/catalogo/silla/sihoo-doro-c300/` shows `Ver precio en Amazon`.
- `/catalogo/silla/ikea-markus/` shows `Buscar en Amazon`.
- `/catalogo/silla/herman-miller-aeron/` shows `Buscar en Amazon` unless Amazon search is manually disabled because results are misleading.

- [ ] **Step 6: Commit**

```bash
git add src/components/BotonPrecio.astro
git commit -m "feat: add Amazon search CTA fallback"
```

---

### Task 3: Ampliar Schema Editorial De Productos

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/lib/productos.ts`
- Modify: 5 pilot YAML files in `src/content/productos/`

- [ ] **Step 1: Add schema fields**

In `src/content/config.ts`, inside the product schema, add after `veredicto`:

```ts
    resumenCompra: z.object({
      mejorPara: z.string().optional(),
      evitarSi: z.string().optional(),
      alternativaDirecta: z.string().optional(),
      decisionRapida: z.string().optional(),
    }).default({}),
    metodologia: z.array(z.string()).default([]),
    scoreRationale: z.object({
      ergonomia: z.string().optional(),
      ajustabilidad: z.string().optional(),
      materiales: z.string().optional(),
      comodidad: z.string().optional(),
      calidadPrecio: z.string().optional(),
    }).default({}),
    fuentes: z.array(z.object({
      tipo: z.enum(['oficial', 'review', 'comunidad', 'tienda', 'manual']),
      nombre: z.string(),
      url: z.string().url(),
      fechaConsulta: z.string(),
    })).default([]),
    limitaciones: z.array(z.string()).default([]),
    alternativas: z.array(z.object({
      slug: z.string(),
      motivo: z.string(),
    })).default([]),
```

- [ ] **Step 2: Add TypeScript interfaces**

In `src/lib/productos.ts`, add matching fields to `Producto`:

```ts
  resumenCompra?: {
    mejorPara?: string;
    evitarSi?: string;
    alternativaDirecta?: string;
    decisionRapida?: string;
  };
  metodologia?: string[];
  scoreRationale?: Partial<Record<keyof Valoraciones, string>>;
  fuentes?: {
    tipo: 'oficial' | 'review' | 'comunidad' | 'tienda' | 'manual';
    nombre: string;
    url: string;
    fechaConsulta: string;
  }[];
  limitaciones?: string[];
  alternativas?: { slug: string; motivo: string }[];
```

- [ ] **Step 3: Migrate 5 pilot products**

Add the new fields to:

- `src/content/productos/herman-miller-aeron.yaml`
- `src/content/productos/sihoo-doro-c300.yaml`
- `src/content/productos/ikea-markus.yaml`
- `src/content/productos/steelcase-leap-v2.yaml`
- `src/content/productos/flexispot-c7-lite.yaml`

Use only already verified sources in `fuenteSpecs` or official pages. Do not invent ownership, tests, prices or community claims.

- [ ] **Step 4: Validate build**

Run:

```bash
npm run build
```

Expected: PASS. If any URL in `fuentes` is not accepted by `z.string().url()`, fix the source URL rather than removing validation.

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts src/lib/productos.ts src/content/productos/herman-miller-aeron.yaml src/content/productos/sihoo-doro-c300.yaml src/content/productos/ikea-markus.yaml src/content/productos/steelcase-leap-v2.yaml src/content/productos/flexispot-c7-lite.yaml
git commit -m "feat: expand product editorial schema"
```

---

### Task 4: Crear Hero De Ficha Producto

**Files:**
- Create: `src/components/producto/FichaHero.astro`
- Modify: `src/components/producto/FichaProducto.astro`

- [ ] **Step 1: Create `FichaHero.astro`**

```astro
---
import BotonPrecio from '../BotonPrecio.astro';
import ImagenProducto from './ImagenProducto.astro';
import { notaGlobal, tramoTexto, type Producto } from '@/lib/productos';

interface Props { producto: Producto; }

const { producto: p } = Astro.props;
const global = notaGlobal(p);
---

<header class="ficha-hero">
  <div class="ficha-hero-media">
    <ImagenProducto imagen={p.imagen} imagenAlt={p.imagenAlt} marca={p.marca} nombre={p.nombre} size={420} />
  </div>
  <div class="ficha-hero-copy">
    <p class="ficha-marca">{p.marca}</p>
    <h1 class="ficha-nombre">{p.nombre}</h1>
    <div class="ficha-kpis">
      <span class="ficha-precio">{tramoTexto(p.tramoPrecio)}</span>
      {global != null && <span class="ficha-nota">{global.toFixed(1)}<small>/10</small></span>}
      {p.verificadoEn && <span class="ficha-verificado">Verificado {p.verificadoEn}</span>}
    </div>
    {p.idealPara && <p class="ficha-ideal">Ideal para: {p.idealPara}</p>}
    {p.resumenCompra?.decisionRapida && <p class="ficha-decision">{p.resumenCompra.decisionRapida}</p>}
    <BotonPrecio amazon={p.amazon} webOficial={p.webOficial} nombre={p.nombre} marca={p.marca} />
  </div>
</header>

<style>
  .ficha-hero {
    display: grid;
    grid-template-columns: minmax(240px, 420px) minmax(0, 1fr);
    gap: clamp(1.25rem, 4vw, 3rem);
    align-items: start;
    margin-bottom: 2rem;
  }

  .ficha-hero-media {
    display: flex;
    justify-content: center;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: clamp(1rem, 3vw, 1.6rem);
  }

  .ficha-marca {
    margin: 0;
    color: var(--ink-muted);
    font-size: 0.76rem;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ficha-nombre {
    max-width: 780px;
    margin: 0.25rem 0 0.8rem;
    font-family: var(--font-display);
    letter-spacing: 0;
  }

  .ficha-kpis {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-items: center;
    margin-bottom: 0.9rem;
  }

  .ficha-precio,
  .ficha-nota,
  .ficha-verificado {
    display: inline-flex;
    align-items: baseline;
    min-height: 2rem;
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.6rem;
    font-weight: 750;
  }

  .ficha-precio {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .ficha-nota {
    color: var(--bg);
    background: var(--ink);
    font-family: var(--font-display);
  }

  .ficha-nota small {
    margin-left: 0.12rem;
    font-size: 0.72rem;
    opacity: 0.76;
  }

  .ficha-verificado {
    color: var(--ink-muted);
    border: 1px solid var(--border);
    font-size: 0.78rem;
  }

  .ficha-ideal,
  .ficha-decision {
    max-width: 720px;
    color: var(--ink-muted);
    line-height: 1.65;
  }

  .ficha-decision {
    color: var(--ink);
    font-weight: 600;
  }

  @media (max-width: 760px) {
    .ficha-hero {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Use hero in ficha**

In `src/components/producto/FichaProducto.astro`, remove `BotonPrecio` and `ImagenProducto` imports, add:

```astro
import FichaHero from './FichaHero.astro';
```

Replace the `<header class="ficha-header">...</header>` block with:

```astro
  <FichaHero producto={p} />
```

- [ ] **Step 3: Remove old header CSS**

Delete old `.ficha-header`, `.ficha-marca`, `.ficha-nombre`, `.ficha-precio`, `.ficha-nota`, `.ficha-ideal` rules from `FichaProducto.astro`.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/FichaHero.astro src/components/producto/FichaProducto.astro
git commit -m "feat: redesign product ficha hero"
```

---

### Task 5: Anadir Resumen De Compra Y Diferenciacion

**Files:**
- Create: `src/components/producto/FichaResumenCompra.astro`
- Modify: `src/components/producto/FichaProducto.astro`

- [ ] **Step 1: Create summary component**

```astro
---
import type { Producto } from '@/lib/productos';

interface Props { producto: Producto; }

const { producto: p } = Astro.props;
const r = p.resumenCompra ?? {};
const hasResumen = Boolean(r.mejorPara || r.evitarSi || r.alternativaDirecta || p.limitaciones?.length);
---

{hasResumen && (
  <section class="ficha-resumen" aria-labelledby="resumen-compra">
    <h2 id="resumen-compra">Resumen de compra</h2>
    <div class="resumen-grid">
      {r.mejorPara && <p><strong>Mejor para</strong><span>{r.mejorPara}</span></p>}
      {r.evitarSi && <p><strong>Evitar si</strong><span>{r.evitarSi}</span></p>}
      {r.alternativaDirecta && <p><strong>Alternativa directa</strong><span>{r.alternativaDirecta}</span></p>}
      {p.limitaciones?.length ? <p><strong>Limitaciones verificadas</strong><span>{p.limitaciones.join(' · ')}</span></p> : null}
    </div>
  </section>
)}

<style>
  .ficha-resumen {
    margin: 0 0 2rem;
    padding: 1.1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .ficha-resumen h2 {
    margin: 0 0 0.9rem;
    font-size: 1rem;
  }

  .resumen-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .resumen-grid p {
    margin: 0;
    padding: 0.85rem;
    border-radius: var(--radius-sm);
    background: var(--surface-muted);
  }

  .resumen-grid strong,
  .resumen-grid span {
    display: block;
  }

  .resumen-grid strong {
    margin-bottom: 0.22rem;
    font-size: 0.74rem;
    color: var(--ink-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .resumen-grid span {
    color: var(--ink);
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .resumen-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Render after hero**

In `src/components/producto/FichaProducto.astro`, import and render:

```astro
import FichaResumenCompra from './FichaResumenCompra.astro';
```

After `<FichaHero producto={p} />`, add:

```astro
  <FichaResumenCompra producto={p} />
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/FichaResumenCompra.astro src/components/producto/FichaProducto.astro
git commit -m "feat: add product buying summary"
```

---

### Task 6: Explicar Metodologia Y Fuentes En Cada Ficha

**Files:**
- Create: `src/components/producto/FichaMetodologiaProducto.astro`
- Create: `src/components/producto/FichaFuentes.astro`
- Modify: `src/components/producto/FichaProducto.astro`

- [ ] **Step 1: Create methodology component**

```astro
---
import type { Producto } from '@/lib/productos';

interface Props { producto: Producto; }

const { producto: p } = Astro.props;
---

{p.metodologia?.length ? (
  <section class="ficha-metodo" aria-labelledby="metodo-producto">
    <h2 id="metodo-producto">Cómo se ha valorado</h2>
    <ul>{p.metodologia.map((item) => <li>{item}</li>)}</ul>
  </section>
) : null}

<style>
  .ficha-metodo {
    margin: 2rem 0;
    padding: 1rem 1.15rem;
    border-left: 3px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 5%, var(--surface));
  }

  .ficha-metodo h2 {
    margin-top: 0;
    font-size: 1rem;
  }

  .ficha-metodo ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .ficha-metodo li + li {
    margin-top: 0.35rem;
  }
</style>
```

- [ ] **Step 2: Create sources component**

```astro
---
import type { Producto } from '@/lib/productos';

interface Props { producto: Producto; }

const { producto: p } = Astro.props;
---

{p.fuentes?.length ? (
  <section class="ficha-fuentes" aria-labelledby="fuentes-producto">
    <h2 id="fuentes-producto">Fuentes verificadas</h2>
    <ul>
      {p.fuentes.map((f) => (
        <li>
          <a href={f.url} target="_blank" rel="nofollow noopener noreferrer">{f.nombre}</a>
          <span>{f.tipo} · consultado {f.fechaConsulta}</span>
        </li>
      ))}
    </ul>
  </section>
) : null}

<style>
  .ficha-fuentes {
    margin: 2rem 0;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .ficha-fuentes h2 {
    font-size: 1rem;
  }

  .ficha-fuentes ul {
    list-style: none;
    padding: 0;
  }

  .ficha-fuentes li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.7rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
    font-size: 0.86rem;
  }

  .ficha-fuentes span {
    color: var(--ink-muted);
  }
</style>
```

- [ ] **Step 3: Render components**

In `FichaProducto.astro`, import:

```astro
import FichaMetodologiaProducto from './FichaMetodologiaProducto.astro';
import FichaFuentes from './FichaFuentes.astro';
```

Render `FichaMetodologiaProducto` before `ValoracionEjes`, and `FichaFuentes` before `.ficha-fuente`.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/FichaMetodologiaProducto.astro src/components/producto/FichaFuentes.astro src/components/producto/FichaProducto.astro
git commit -m "feat: show product methodology and sources"
```

---

### Task 7: Mejorar Schema Product/Review Sin Inventar Offers

**Files:**
- Modify: `src/pages/catalogo/[tipo]/[slug].astro`

- [ ] **Step 1: Update Product schema**

Replace `productSchema` with:

```ts
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: producto.nombre,
  brand: { '@type': 'Brand', name: producto.marca },
  ...(producto.imagen ? { image: producto.imagen } : {}),
  ...(producto.veredicto ? { description: producto.veredicto } : {}),
  ...(producto.amazon?.asin ? {
    sameAs: `https://www.amazon.es/dp/${producto.amazon.asin}`,
  } : {}),
};
```

- [ ] **Step 2: Update Review author**

Change `author` in `reviewSchema` to:

```ts
  author: { '@type': 'Person', name: 'David Rubio Mota' },
  publisher: { '@type': 'Organization', name: 'Tu Espacio de Trabajo' },
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Validate structured data manually**

Use rendered HTML from `dist/catalogo/silla/sihoo-doro-c300/index.html` and confirm:

- Product has `name`, `brand`, `image`, `description`.
- Review has `Person` author.
- No fake `Offer` exists when `precioMin/precioMax` are null.

- [ ] **Step 5: Commit**

```bash
git add src/pages/catalogo/[tipo]/[slug].astro
git commit -m "fix: make product schema more honest"
```

---

### Task 8: Pulir Tarjeta De Catalogo Para Escaneo

**Files:**
- Modify: `src/components/producto/TarjetaProducto.astro`

- [ ] **Step 1: Add CTA state badge in card**

In frontmatter, import `buildProductCta`:

```astro
import { notaGlobal, tramoTexto, datosFiltrado, construirChips, buildProductCta, type Producto } from '@/lib/productos';
```

Add:

```ts
const cta = buildProductCta({ amazon: p.amazon, webOficial: p.webOficial, nombre: p.nombre, marca: p.marca });
const ctaLabel = cta.kind === 'amazon-product'
  ? 'Amazon'
  : cta.kind === 'amazon-search'
    ? 'Busqueda Amazon'
    : 'Sin tienda';
```

Add inside `.card-line`:

```astro
      <span class={`card-cta card-cta--${cta.kind}`}>{ctaLabel}</span>
```

- [ ] **Step 2: Add styles**

Add:

```css
  .card-cta {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.08rem 0.42rem;
    color: var(--ink-muted);
    font-size: 0.68rem;
    font-weight: 750;
  }

  .card-cta--amazon-product,
  .card-cta--amazon-search {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
    color: var(--accent);
  }
```

- [ ] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/TarjetaProducto.astro
git commit -m "feat: surface product CTA state in catalog cards"
```

---

### Task 9: Visual QA Y Conversion QA

**Files:**
- No code required unless defects are found.

- [ ] **Step 1: Run full verification**

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 2: Start preview**

```bash
npm run preview
```

Expected: Astro preview URL available.

- [ ] **Step 3: Check critical pages**

Inspect manually:

- `/catalogo/silla/`
- `/catalogo/silla/herman-miller-aeron/`
- `/catalogo/silla/sihoo-doro-c300/`
- `/catalogo/silla/ikea-markus/`
- `/comparar/silla/`

Verify:

- Above-the-fold shows image, brand, product name, score, CTA and decision summary.
- CTAs do not overflow on mobile.
- No Google search CTA appears.
- Amazon search fallback appears for products without ASIN, using `amazon.buscar` first and `marca + nombre` as fallback query.
- Official links are not marked `sponsored`.

- [ ] **Step 4: Commit QA fixes if needed**

```bash
git add src
git commit -m "fix: polish product ficha responsive states"
```

---

## Rollout Notes

- Do not migrate all 19 current fichas in one pass. First migrate 5, build, inspect, then migrate the rest.
- Do not add fake prices. Keep `precioMin/precioMax` null unless verified from Amazon.es or official store on the day of editing.
- Do not add `Offer` schema unless there is a verified current price and URL.
- Keep all product claims traceable to `fuentes` or `fuenteSpecs`.

## Self-Review

- Spec coverage: covers ficha design, CTA policy, Amazon/no-Google decision, schema, tests and QA.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: `buildProductCta`, `Producto`, `ProductoAmazon`, `resumenCompra`, `fuentes`, `limitaciones` are defined before use.
