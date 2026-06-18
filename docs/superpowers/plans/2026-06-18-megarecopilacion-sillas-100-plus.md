# Megarecopilacion Sillas 100 Plus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasar de 19 sillas a una base de datos editorial global de 100+ sillas verificadas, con fichas utiles, filtros diferenciales y comparativas que aporten mas valor que una lista afiliada normal.

**Architecture:** Tratar las sillas como base de datos editorial internacional, no como articulos sueltos. Crear un pipeline de investigacion con backlog, normalizacion, validacion, importacion por lotes, QA y publicacion escalonada; enriquecer el schema para que cada ficha explique fuente, confianza, disponibilidad por mercado, dimensiones, ajustes y consenso real.

**Tech Stack:** Astro 5, content collection `productos`, YAML, TypeScript validation, scripts Node, Vitest, Amazon lookup/cache, Amazon OneLink, investigacion manual con fuentes oficiales/comunidad.

---

## Principio Estrategico

No publicar 100 fichas pobres de golpe. Google ya esta tratando el sitio como bajo en confianza; una expansion masiva sin metodologia visible puede empeorar la evaluacion. El objetivo es que el catalogo sea claramente util:

- Base de datos global de sillas, no solo "mejores sillas" ni un catalogo limitado a un pais.
- Filtros que resuelvan decisiones reales: altura, peso, lumbar, reposabrazos, profundidad, malla/tapizado, garantia, rango de precio, disponibilidad Amazon/OneLink/oficial por mercado.
- Fichas con fuentes verificadas y limitaciones declaradas.
- Comparativas automaticas entre modelos cercanos.
- Articulos pillar que expliquen metodologia y enlacen a fichas concretas.
- Publicacion por oleadas medibles, no dump de 100 URLs el mismo dia.

## Criterio Internacional Y OneLink

El catalogo no se limita a ningun pais concreto. La investigacion puede usar fuentes globales: webs oficiales internacionales, manuales PDF, tiendas regionales, reviews de otros paises, Reddit, foros y comunidades especializadas. Lo importante es separar siempre tres capas:

- `fuente`: de donde sale el dato tecnico o editorial.
- `disponibilidad`: en que mercados parece comprable el producto.
- `monetizacion`: que enlace Amazon/OneLink se puede usar sin inventar ASINs ni disponibilidad.

Regla operativa: una silla puede entrar si tiene fuente fiable y disponibilidad razonable en al menos un mercado objetivo. No rechazar por no estar disponible en un pais concreto. Si solo existe fuente global pero no disponibilidad Amazon verificada, la ficha puede publicarse como ficha editorial sin ASIN directo y con estado comercial claro.

## Alcance Por Fases

- Fase 0: Auditar 19 sillas actuales y fijar plantilla de datos.
- Fase 1: Crear backlog de 150 candidatas para acabar publicando 100+.
- Fase 2: Importar 30 sillas Tier A/B con fuentes fuertes.
- Fase 3: Mejorar catalogo y filtros para manejar volumen.
- Fase 4: Importar 70+ sillas restantes por oleadas.
- Fase 5: Crear hubs editoriales alrededor del catalogo, sin canibalizar el pillar actual.
- Fase 6: Medir indexacion, crawl y comportamiento antes de seguir escalando.

## File Structure

- Create: `docs/research/sillas/backlog-sillas.csv`
  - Master backlog con estado editorial, mercados disponibles y prioridad.
- Create: `docs/research/sillas/source-log.md`
  - Registro de fuentes consultadas y criterios de confianza.
- Create: `scripts/validate-productos.mjs`
  - Valida campos obligatorios, duplicados, ASINs por mercado, imagenes locales, fuentes y slugs.
- Create: `scripts/import-productos-sillas.mjs`
  - Convierte CSV curado en YAML de `src/content/productos/`.
- Modify: `src/content/config.ts`
  - Ampliar specs de silla y campos editoriales.
- Modify: `src/lib/tipos.ts`
  - Mas filtros/chips/comparador para 100+ sillas.
- Modify: `src/components/producto/CatalogoProductos.astro`
  - Mejorar filtros, busqueda interna y estados de conteo.
- Modify: `src/components/producto/TarjetaProducto.astro`
  - Mejor escaneo en grid grande.
- Modify: `src/components/producto/FichaProducto.astro`
  - Renderizar datos nuevos.
- Create/Modify: `src/content/productos/*.yaml`
  - 100+ fichas de sillas.
- Modify: `.seo-engine/data/content-map.yaml`, `.seo-engine/data/topic-clusters.yaml`, `.seo-engine/data/seo-keywords.csv`, `.seo-engine/logs/changelog.md`
  - Registrar hubs y cambios SEO cuando se creen articulos o nuevas paginas editoriales.
- Test: `src/lib/productos.test.ts`
  - Tests de helpers nuevos.
- Verify: `npm test`, `node scripts/validate-productos.mjs`, `npm run build`.

---

### Task 1: Definir Backlog De Investigacion

**Files:**
- Create: `docs/research/sillas/backlog-sillas.csv`
- Create: `docs/research/sillas/source-log.md`

- [ ] **Step 1: Create research directory**

```bash
mkdir -p docs/research/sillas
```

- [ ] **Step 2: Create backlog CSV**

Create `docs/research/sillas/backlog-sillas.csv` with this header:

```csv
slug,nombre,marca,tier,estado,mercados_objetivo,amazon_query,asin_primary,asin_by_market,onelink_ready,web_oficial,fuente_oficial,fuente_reviews,fuente_comunidad,prioridad,motivo_inclusion,notas
```

Initial statuses:

- `candidate`: discovered, not validated.
- `researched`: official specs found.
- `asin-found`: at least one Amazon marketplace ASIN verified.
- `no-asin`: no Amazon marketplace ASIN found after lookup.
- `ready-yaml`: ready to import.
- `published`: YAML exists and build passes.
- `rejected`: duplicate, unavailable in any useful target market, low trust, or not relevant for office/home-office use.

Field conventions:

- `mercados_objetivo`: comma-separated market codes where the product is realistically available or worth checking, for example `ES,US,UK,DE,FR,IT`.
- `asin_primary`: first verified ASIN used by the current primary Amazon marketplace until full i18n/OneLink coverage exists.
- `asin_by_market`: semicolon-separated map, for example `ES:B012345678;US:B087654321;DE:B09ABCDEF0`. Leave blank when not verified.
- `onelink_ready`: `yes` only when the primary Amazon URL uses a verified ASIN/search and can safely be handled by OneLink; `no` otherwise.

- [ ] **Step 3: Create source log**

Create `docs/research/sillas/source-log.md`:

```md
# Source Log Sillas

## Jerarquia de fuentes

1. Web oficial del fabricante o manual PDF.
2. Tienda oficial regional o distribuidor autorizado cuando aporte disponibilidad o datos tecnicos.
3. Amazon marketplaces via API/cache para ASIN, imagen, precio y disponibilidad; registrar mercado concreto, no asumir disponibilidad global.
4. Reviews editoriales reconocibles con mediciones o fotos propias.
5. Comunidad: Reddit r/OfficeChairs, foros de ergonomia/oficina, hilos de compradores. Usar solo como consenso, no como fuente de specs.

## Reglas

- No copiar textos de reviews ni fabricantes.
- No usar una afirmacion de comunidad si solo aparece en un comentario aislado.
- No usar precio si no se ha verificado el dia de edicion y el mercado concreto.
- No publicar ficha sin fuente oficial o manual.
- No afirmar disponibilidad global: registrar mercados concretos y fecha de verificacion.
- No inventar ASINs por pais; OneLink solo se activa sobre enlaces Amazon verificables.
- No afirmar "probada" salvo producto real del setup de David.
```

- [ ] **Step 4: Commit**

```bash
git add docs/research/sillas/backlog-sillas.csv docs/research/sillas/source-log.md
git commit -m "docs: add chair research backlog"
```

---

### Task 2: Auditar Las 19 Sillas Actuales

**Files:**
- Modify: `docs/research/sillas/backlog-sillas.csv`
- Modify: `docs/research/sillas/source-log.md`
- Read: `src/content/productos/*.yaml`

- [ ] **Step 1: Export current products into backlog**

For every existing `src/content/productos/*.yaml`, add one row with:

- `estado=published`
- `tier=A` if brand/model is high-demand or reference.
- `tier=B` if useful niche.
- `tier=C` if filler or low confidence.
- `motivo_inclusion` based on current ficha.

- [ ] **Step 2: Mark weak current fichas**

Flag in `notas`:

- Missing official source URL.
- Missing ASIN but has Amazon query.
- Local image missing.
- `comunidad` too broad.
- Specs with `null` in important decision fields.

- [ ] **Step 3: Run build baseline**

```bash
npm run build
```

Expected: PASS before importing more products.

- [ ] **Step 4: Commit**

```bash
git add docs/research/sillas/backlog-sillas.csv docs/research/sillas/source-log.md
git commit -m "docs: audit current chair catalog"
```

---

### Task 3: Ampliar Schema De Sillas Para Ser Diferencial

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/lib/productos.ts`
- Modify: `src/lib/tipos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] **Step 1: Add product-level Amazon/OneLink market fields**

In `src/content/config.ts`, add this helper near `ejesValoracion`:

```ts
const mercadoAmazon = z.object({
  mercado: z.string(),
  asin: z.string().nullable().default(null),
  disponibilidad: z.enum(['available', 'unknown', 'unavailable']).default('unknown'),
  verificadoEn: z.string().optional(),
});
```

In the `productos` schema, keep the existing `amazon` object for the current primary CTA and add:

```ts
    amazonPrimaryMarket: z.string().default('ES'),
    mercadosAmazon: z.array(mercadoAmazon).default([]),
    oneLinkReady: z.boolean().default(false),
```

In `src/lib/productos.ts`, add matching optional fields to `Producto`:

```ts
  amazonPrimaryMarket?: string;
  mercadosAmazon?: {
    mercado: string;
    asin: string | null;
    disponibilidad: 'available' | 'unknown' | 'unavailable';
    verificadoEn?: string;
  }[];
  oneLinkReady?: boolean;
```

Rule: `amazon.asin` remains the primary ASIN used by the current Amazon CTA. `amazonPrimaryMarket` defaults to `ES` only as the current primary marketplace setting; this is not a catalog scope restriction. `mercadosAmazon` stores verified market coverage for the future international rollout.

- [ ] **Step 2: Extend `specsSilla`**

In `src/content/config.ts`, add fields to `specsSilla`:

```ts
  alturaRecomendadaMinCm: z.number().nullable().default(null),
  alturaRecomendadaMaxCm: z.number().nullable().default(null),
  anchoAsientoCm: z.number().nullable().default(null),
  profundidadAsientoMinCm: z.number().nullable().default(null),
  profundidadAsientoMaxCm: z.number().nullable().default(null),
  alturaRespaldoCm: z.number().nullable().default(null),
  reposacabezas: z.enum(['ninguno', 'fijo', 'ajustable']).nullable().default(null),
  asientoMaterial: z.string().nullable().default(null),
  ruedasSueloDuro: z.boolean().nullable().default(null),
  certificacionEn1335: z.boolean().nullable().default(null),
  montajeMinutos: z.number().nullable().default(null),
  devolucionDias: z.number().nullable().default(null),
```

- [ ] **Step 3: Add filters and chips**

In `src/lib/tipos.ts`, add filters:

```ts
    { id: 'altura-min', etiqueta: 'Apta desde altura', control: 'rango', comparacion: 'max',
      campo: 'specs.alturaRecomendadaMinCm', min: 150, max: 190, step: 5 },
    { id: 'altura-max', etiqueta: 'Apta hasta altura', control: 'rango', comparacion: 'min',
      campo: 'specs.alturaRecomendadaMaxCm', min: 160, max: 210, step: 5 },
    { id: 'reposacabezas', etiqueta: 'Reposacabezas', control: 'select', comparacion: 'igual', campo: 'specs.reposacabezas',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'ajustable', etiqueta: 'Ajustable' }, { valor: 'fijo', etiqueta: 'Fijo' }, { valor: 'ninguno', etiqueta: 'Sin reposacabezas' }] },
```

Add chips:

```ts
    { campo: 'specs.alturaRecomendadaMaxCm', formato: 'cm', prefijo: 'Hasta ' },
    { campo: 'specs.profundidadAsientoMaxCm', formato: 'cm', prefijo: 'Asiento ' },
```

- [ ] **Step 4: Add tests for new data keys**

Update `datosFiltrado: silla` test to assert:

```ts
expect(d['data-c-alturarecomendadomincm']).toBeDefined();
expect(d['data-c-alturarecomendadamaxcm']).toBeDefined();
expect(d['data-c-reposacabezas']).toBeDefined();
```

Update `productoSilla.specs` in the test fixture:

```ts
alturaRecomendadaMinCm: 160,
alturaRecomendadaMaxCm: 190,
reposacabezas: 'ajustable',
profundidadAsientoMaxCm: 48,
```

- [ ] **Step 5: Add tests for market fields**

Update the product fixture in `src/lib/productos.test.ts`:

```ts
amazonPrimaryMarket: 'ES',
mercadosAmazon: [
  { mercado: 'ES', asin: 'B000000001', disponibilidad: 'available', verificadoEn: '2026-06-18' },
  { mercado: 'US', asin: 'B000000002', disponibilidad: 'available', verificadoEn: '2026-06-18' },
],
oneLinkReady: true,
```

Add a focused assertion that these fields are preserved on the product object used by helpers:

```ts
expect(productoSilla.amazonPrimaryMarket).toBe('ES');
expect(productoSilla.mercadosAmazon?.map((m) => m.mercado)).toEqual(['ES', 'US']);
expect(productoSilla.oneLinkReady).toBe(true);
```

- [ ] **Step 6: Run tests**

```bash
npm test -- src/lib/productos.test.ts
```

Expected: PASS after fixture and config updates.

- [ ] **Step 7: Build**

```bash
npm run build
```

Expected: PASS with old YAML because new product-level fields and chair specs have safe defaults.

- [ ] **Step 8: Commit**

```bash
git add src/content/config.ts src/lib/productos.ts src/lib/tipos.ts src/lib/productos.test.ts
git commit -m "feat: expand chair specs and filters"
```

---

### Task 4: Crear Validador De Productos

**Files:**
- Create: `scripts/validate-productos.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create validation script**

```js
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'src/content/productos');
const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
const slugs = new Set();
const names = new Map();
const errors = [];

function getScalar(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'));
  return match?.[1]?.trim() || null;
}

function hasBlockValue(text, key) {
  return new RegExp(`^${key}:\\s*`, 'm').test(text);
}

for (const file of files) {
  const slug = file.replace(/\\.ya?ml$/, '');
  const text = await fs.readFile(path.join(dir, file), 'utf8');
  const nombre = getScalar(text, 'nombre');
  const marca = getScalar(text, 'marca');
  const imagen = getScalar(text, 'imagen');
  const fuenteSpecs = getScalar(text, 'fuenteSpecs');

  if (slugs.has(slug)) errors.push(`${file}: slug duplicado`);
  slugs.add(slug);

  if (!nombre) errors.push(`${file}: falta nombre`);
  if (!marca) errors.push(`${file}: falta marca`);
  if (!fuenteSpecs) errors.push(`${file}: falta fuenteSpecs`);
  if (!hasBlockValue(text, 'valoraciones')) errors.push(`${file}: falta valoraciones`);
  if (!hasBlockValue(text, 'paraQuienSi')) errors.push(`${file}: falta paraQuienSi`);
  if (!hasBlockValue(text, 'paraQuienNo')) errors.push(`${file}: falta paraQuienNo`);

  if (imagen?.startsWith('/img/productos/')) {
    const imgPath = path.join(root, 'public', imagen);
    try {
      await fs.access(imgPath);
    } catch {
      errors.push(`${file}: imagen local no existe ${imagen}`);
    }
  }

  const key = `${marca || ''}|${nombre || ''}`.toLowerCase();
  if (names.has(key)) errors.push(`${file}: nombre duplicado con ${names.get(key)}`);
  names.set(key, file);
}

console.log(`Productos revisados: ${files.length}`);

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

console.log('OK: catalogo de productos valido');
```

- [ ] **Step 2: Add package script**

In `package.json`:

```json
"validate:productos": "node scripts/validate-productos.mjs"
```

- [ ] **Step 3: Run validator**

```bash
npm run validate:productos
```

Expected: PASS or a concrete list of current issues to fix before import.

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-productos.mjs package.json
git commit -m "chore: add product catalog validator"
```

---

### Task 5: Crear Importador Desde CSV Curado

**Files:**
- Create: `scripts/import-productos-sillas.mjs`
- Create: `docs/research/sillas/import-sample.csv`

- [ ] **Step 1: Create sample import file**

Create `docs/research/sillas/import-sample.csv`:

```csv
slug,nombre,marca,tramoPrecio,valoracion,amazonBuscar,asinPrimary,amazonPrimaryMarket,asinByMarket,oneLinkReady,webOficial,imagen,imagenAlt,idealPara,veredicto,fuenteSpecs,verificadoEn
demo-silla,Demo Silla,Demo,2,4.1,Demo silla ergonomica,,ES,,false,https://example.com,/img/productos/demo-silla.jpg,Silla ergonomica Demo,Teletrabajo ligero,Ficha de ejemplo no publicable,Web oficial Demo,2026-06-18
```

- [ ] **Step 2: Create importer skeleton**

Create `scripts/import-productos-sillas.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/import-productos-sillas.mjs docs/research/sillas/lote.csv');
  process.exit(1);
}

const text = await fs.readFile(input, 'utf8');
const [headerLine, ...rows] = text.trim().split(/\r?\n/);
const headers = headerLine.split(',');

function parseRow(line) {
  const values = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
}

function yamlString(v) {
  return JSON.stringify(v ?? '');
}

function yamlBool(v) {
  return String(v).toLowerCase() === 'true' ? 'true' : 'false';
}

function renderMercadosAmazon(row) {
  const raw = String(row.asinByMarket || '').trim();
  if (!raw) return '[]';
  const rows = raw.split(';').map((entry) => {
    const [mercado, asin] = entry.split(':').map((v) => v.trim());
    if (!mercado || !asin) return null;
    return `  - mercado: ${yamlString(mercado)}
    asin: ${yamlString(asin)}
    disponibilidad: "available"
    verificadoEn: ${yamlString(row.verificadoEn)}`;
  }).filter(Boolean);
  return rows.length ? `\n${rows.join('\n')}` : '[]';
}

function render(row) {
  return `tipo: "silla"
nombre: ${yamlString(row.nombre)}
marca: ${yamlString(row.marca)}
imagen: ${yamlString(row.imagen)}
imagenAlt: ${yamlString(row.imagenAlt)}
tramoPrecio: ${Number(row.tramoPrecio || 2)}
precioMin: null
precioMax: null
valoracion: ${Number(row.valoracion || 0)}
valoraciones:
  ergonomia: null
  ajustabilidad: null
  materiales: null
  comodidad: null
  calidadPrecio: null
amazon:
  asin: ${row.asinPrimary ? yamlString(row.asinPrimary) : 'null'}
  buscar: ${row.amazonBuscar ? yamlString(row.amazonBuscar) : 'null'}
amazonPrimaryMarket: ${row.amazonPrimaryMarket ? yamlString(row.amazonPrimaryMarket) : '"ES"'}
mercadosAmazon: ${renderMercadosAmazon(row)}
oneLinkReady: ${yamlBool(row.oneLinkReady)}
webOficial: ${row.webOficial ? yamlString(row.webOficial) : 'null'}
idealPara: ${yamlString(row.idealPara)}
veredicto: ${yamlString(row.veredicto)}
comunidad: ""
paraQuienSi: []
paraQuienNo: []
puntosFuertes: []
puntosDebiles: []
fuenteSpecs: ${yamlString(row.fuenteSpecs)}
verificadoEn: ${yamlString(row.verificadoEn)}
specs:
  tipo: "silla"
  lumbar: "fijo"
  respaldo: "malla"
  reposabrazos: "fijo"
  profundidadRegulable: false
  reclinacionMaxGrados: null
  pesoMaxKg: null
  alturaAsientoMinCm: null
  alturaAsientoMaxCm: null
  anchoCm: null
  fondoCm: null
  mecanismo: null
  baseMaterial: null
  certificacionBifma: null
  pesoProductoKg: null
  garantiaAnios: null
`;
}

const outDir = path.join(process.cwd(), 'src/content/productos');

for (const line of rows.filter(Boolean)) {
  const row = parseRow(line);
  if (!row.slug) throw new Error(`Fila sin slug: ${line}`);
  const file = path.join(outDir, `${row.slug}.yaml`);
  await fs.writeFile(file, render(row), { flag: 'wx' });
  console.log(`created ${file}`);
}
```

- [ ] **Step 3: Run sample into temp directory only**

Do not import `demo-silla` into production. For script verification, copy the script logic to a temporary directory or run against a one-row real candidate only after the YAML is editorially complete.

- [ ] **Step 4: Commit**

```bash
git add scripts/import-productos-sillas.mjs docs/research/sillas/import-sample.csv
git commit -m "chore: add chair product importer"
```

---

### Task 6: Research Pipeline Para 150 Candidatas

**Files:**
- Modify: `docs/research/sillas/backlog-sillas.csv`
- Modify: `docs/research/sillas/source-log.md`

- [ ] **Step 1: Build candidate universe**

Collect 150 candidates across these buckets:

- Ergonomicas premium: Herman Miller, Steelcase, Haworth, Humanscale, HAG, Kinnarps.
- Gama media Amazon/global: SIHOO, FlexiSpot, Hbada, Songmics, Durrafy, Holludle, Ticova, Ergotopia, Colamy.
- IKEA y retail internacional: MARKUS, JARVFJALLET, MATCHSPEL, LÅNGFJÄLL, FLINTAN and current regional catalogs where the model is sold.
- Gaming usadas para teletrabajo: Secretlab, Corsair, Noblechairs, DXRacer, Newskill, Drift.
- Sillas para personas altas/peso alto.
- Sillas para pisos pequenos o brazos abatibles.
- Modelos reacondicionados o clasicos con mercado real en al menos un pais objetivo only if sourceable.

- [ ] **Step 2: Source each candidate**

For each candidate, record:

- Official URL or manual.
- Amazon query and ASINs by marketplace if found via `node scripts/amazon-lookup.mjs --search "<name>"` or manual Amazon marketplace verification.
- One independent review or community consensus if available.
- Target-market availability: Amazon marketplace, official regional shop, IKEA/regional retailer, authorized distributor, refurbished marketplace, or unavailable.
- `asin_by_market` only for verified marketplace ASINs. Example: `ES:B012345678;US:B087654321;DE:B09ABCDEF0`.
- `onelink_ready=yes` only if the primary Amazon CTA is a valid Amazon product/search URL that OneLink can route safely.

- [ ] **Step 3: Reject weak candidates**

Set `estado=rejected` when:

- No official source/manual.
- Not available or realistically buyable from any useful target market.
- Duplicate white-label product with no meaningful distinction.
- Product category is not an office/home-office chair.

- [ ] **Step 4: Commit backlog after each 30 candidates**

```bash
git add docs/research/sillas/backlog-sillas.csv docs/research/sillas/source-log.md
git commit -m "docs: add chair research batch 1"
```

Use batch numbers 1-5.

---

### Task 7: Importar Primera Oleada De 30 Sillas

**Files:**
- Create: `src/content/productos/*.yaml`
- Modify: `docs/research/sillas/backlog-sillas.csv`
- Modify: `PRODUCTOS.md` if product images/ASIN tracking is added there

- [ ] **Step 1: Select 30 candidates**

Criteria:

- At least 10 with a verified ASIN in one or more Amazon marketplaces.
- At least 10 official/premium chairs without direct ASIN coverage but with strong official source and reviewed Amazon search fallback.
- At least 5 budget chairs.
- At least 5 high-intent use cases: altas, espalda, calor/malla, brazos abatibles, menos 200.
- At least 10 fichas with `mercadosAmazon` populated for more than one market when verifiable.

- [ ] **Step 2: Create YAML manually or via importer**

Every imported chair must include:

- `nombre`, `marca`, `imagenAlt`, `tramoPrecio`, `valoracion`.
- `valoraciones` by axis or null when not enough data.
- `amazon.asin` only if verified for the current primary market.
- `amazon.buscar` when a manual query improves the default `marca + nombre` search.
- `amazonPrimaryMarket`, `mercadosAmazon`, and `oneLinkReady` when market coverage has been verified.
- If no ASIN exists in the primary market, use Amazon search fallback as the main commercial CTA unless manual review shows irrelevant or misleading results.
- `webOficial` only if official/distributor source; use it as source/reference, not as primary monetization CTA.
- `veredicto`, `idealPara`, `paraQuienSi`, `paraQuienNo`.
- `puntosFuertes`, `puntosDebiles`.
- `fuenteSpecs`, `verificadoEn`.
- `specs` with as many verified fields as possible.

- [ ] **Step 3: Validate**

```bash
npm run validate:productos
npm test
npm run build
```

Expected: all PASS.

- [ ] **Step 4: Update backlog statuses**

Set imported rows to `published`.

- [ ] **Step 5: Commit**

```bash
git add src/content/productos docs/research/sillas/backlog-sillas.csv PRODUCTOS.md
git commit -m "data: add first expanded chair catalog batch"
```

---

### Task 8: Hacer El Catalogo Util Con 50+ Productos

**Files:**
- Modify: `src/components/producto/CatalogoProductos.astro`
- Modify: `src/components/producto/TarjetaProducto.astro`
- Modify: `src/lib/tipos.ts`

- [ ] **Step 1: Add text search to catalog**

In `CatalogoProductos.astro`, add before filters:

```astro
  <label class="catalogo-search">
    <span>Buscar silla</span>
    <input type="search" data-search placeholder="Marca o modelo" autocomplete="off" />
  </label>
```

Add `data-name` and `data-brand` in `TarjetaProducto.astro` root:

```astro
<article class="card" data-slug={p.slug} data-name={p.nombre.toLowerCase()} data-brand={p.marca.toLowerCase()} {...dataAttrs}>
```

In the catalog script, include search query in filtering:

```ts
const search = root.querySelector<HTMLInputElement>('[data-search]');
const q = search?.value.trim().toLowerCase() ?? '';
const textOk = !q || card.dataset.name?.includes(q) || card.dataset.brand?.includes(q);
```

Use `textOk` in the final visibility condition.

- [ ] **Step 2: Add filter groups**

Visually separate filters by:

- Precio
- Ergonomia
- Dimensiones
- Construccion

Keep existing config-driven behavior; only add markup wrappers if needed.

- [ ] **Step 3: Build and inspect**

```bash
npm run build
```

Check `/catalogo/silla/` with 50+ cards:

- Filters fit mobile.
- Count updates.
- Empty state appears.
- Compare bar still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/CatalogoProductos.astro src/components/producto/TarjetaProducto.astro src/lib/tipos.ts
git commit -m "feat: improve large chair catalog filtering"
```

---

### Task 9: Importar Oleadas Hasta 100+ Sillas

**Files:**
- Create: `src/content/productos/*.yaml`
- Modify: `docs/research/sillas/backlog-sillas.csv`
- Modify: `PRODUCTOS.md`

- [ ] **Step 1: Import in batches of 20**

Run one batch at a time:

- Batch 2: 20 products.
- Batch 3: 20 products.
- Batch 4: 20 products.
- Batch 5: remaining products to reach 100+.

- [ ] **Step 2: Validate each batch**

After each batch:

```bash
npm run validate:productos
npm test
npm run build
```

Expected: all PASS.

- [ ] **Step 3: Manual spot check each batch**

For every batch, inspect at least 4 fichas:

- One with ASIN.
- One with Amazon search fallback.
- One official-source ficha without ASIN in the primary market, using Amazon search fallback.
- One ficha with multiple `mercadosAmazon` entries to verify market data is not being presented as global availability.

- [ ] **Step 4: Commit each batch**

```bash
git add src/content/productos docs/research/sillas/backlog-sillas.csv PRODUCTOS.md
git commit -m "data: add expanded chair catalog batch 2"
```

Repeat with batch number.

---

### Task 10: Crear Hubs Editoriales Que No Sean Thin Affiliate

**Files:**
- Create/Modify: `src/content/articulos/*.mdx`
- Modify: `.seo-engine/data/content-map.yaml`
- Modify: `.seo-engine/data/topic-clusters.yaml`
- Modify: `.seo-engine/data/seo-keywords.csv`
- Modify: `.seo-engine/logs/changelog.md`

- [ ] **Step 1: Do cannibalization check**

Read existing pages:

- `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx`
- `src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx`
- `src/content/articulos/silla-gaming-vs-ergonomica.mdx`
- `src/content/articulos/ajustar-silla-oficina-correctamente.mdx`

Do not create a new article if the intent belongs in an existing article.

- [ ] **Step 2: Create only these hub angles if SERP/user data supports them**

Candidate pages:

- `mejores-sillas-ergonomicas-personas-altas`
- `mejores-sillas-ergonomicas-malla`
- `mejores-sillas-oficina-espalda`
- `sillas-oficina-reposabrazos-abatibles`
- `sillas-oficina-150-kg`

Each hub must link to concrete product fichas and explain selection criteria. No category-only internal links.

- [ ] **Step 3: Request real SERP/Keyword Surfer data before writing**

Per project rule, do not use web search as SERP data. Ask the user for:

- Top 3-5 Google results.
- PAA questions.
- Related searches.
- Keyword Surfer volumes.

- [ ] **Step 4: Publish one hub at a time**

Each hub:

- 1800-3000 words.
- Honest methodology.
- Links to `/catalogo/silla/<slug>/` fichas.
- Links to relevant guides.
- No fake first-person product testing.
- Humanized before publish.

- [ ] **Step 5: Build and commit each hub**

```bash
npm run build
git add src/content/articulos .seo-engine/data .seo-engine/logs
git commit -m "content: add chair hub for <angle>"
```

---

### Task 11: Medicion Y Control De Indexacion

**Files:**
- Modify: `docs/agent-context/project_recovery_session_state.md`
- Optional: create `docs/research/sillas/indexacion-catalogo.md`

- [ ] **Step 1: Submit sitemap after first 30 products**

Use GSC manually or MCP if available. Record:

- Date submitted.
- Product count.
- URL examples inspected.
- Crawl/index state.

- [ ] **Step 2: Inspect representative URLs**

Inspect:

- `/catalogo/silla/`
- 3 premium fichas.
- 3 budget fichas.
- 3 Amazon fallback fichas.
- 3 fichas con fuente oficial pero sin ASIN, usando Amazon search fallback.

- [ ] **Step 3: Wait for crawl signals before publishing all hubs**

If GSC keeps reporting `Rastreada: actualmente sin indexar` across most fichas, pause new content and improve trust/methodology/internal links instead of adding more pages.

- [ ] **Step 4: Update session state**

Append to `docs/agent-context/project_recovery_session_state.md`:

```md
## 2026-06-18 Chair Catalog Expansion

- Added product catalog expansion plan.
- Rule: no Google search affiliate fallback; use verified Amazon product/search links and OneLink-ready market data only.
- Publication must be batched and measured against GSC indexation before continuing.
```

- [ ] **Step 5: Commit**

```bash
git add docs/agent-context/project_recovery_session_state.md docs/research/sillas/indexacion-catalogo.md
git commit -m "docs: track chair catalog indexation rollout"
```

---

## Current Comparator/Ficha Sufficiency Assessment

Current catalog is a strong prototype, but not enough to be the best chair comparator:

- Good: filterable catalog, product pages, axis ratings, comparison pages, schema basics.
- Weak: too few products, thin source visibility, limited dimensions, limited fit guidance by height/body type, sparse price/availability model, weak methodology per product.
- Missing: text search, richer filters, source citations, score rationale, limitation blocks, alternatives, product-to-product recommendations, and publication/indexation measurement.

The comparator should eventually show:

- Recommended height range.
- Seat depth and width.
- Lumbar type and adjustability.
- Armrest level.
- Headrest state.
- Back material.
- Warranty.
- Weight capacity.
- Return policy / official availability.
- Verified source confidence.
- Amazon/OneLink state: direct ASIN in primary market, verified ASINs by market, Amazon search fallback, Amazon search disabled after manual review.

The ficha should eventually show:

- Decision summary.
- Who should buy / avoid.
- Score rationale by axis.
- Specs table.
- Community consensus with source type.
- Limitations.
- Alternatives.
- Source list with consultation dates.
- Honest note: tested directly vs evaluated from specs/community.

## Self-Review

- Spec coverage: covers research, data expansion, product schema, UI, hubs, Amazon policy, indexation measurement.
- Placeholder scan: no placeholder markers found.
- Type consistency: fields added in schema are consumed by component plan and import plan.
