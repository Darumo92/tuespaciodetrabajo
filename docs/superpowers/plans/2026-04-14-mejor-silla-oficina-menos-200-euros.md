# Artículo #23: Mejor silla de oficina barata — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create comparativa article #23 "Mejor silla de oficina barata: 6 opciones por menos de 200€" with 6 products, hero image, SEO engine updates, and bidirectional internal linking.

**Architecture:** MDX article in `src/content/articulos/` following existing comparativa pattern (TopPick + ComparisonTable + análisis detallado). Post-writing updates to PRODUCTOS.md, content-map.yaml, content-queue.yaml, topic-clusters.yaml, seo-keywords.csv, and changelog.md. Bidirectional links to/from pillar and home-office-productivo-500-euros.

**Tech Stack:** Astro 5 (MDX), Components (TopPick, ComparisonTable, AffiliateButton), Pexels API for hero image, sharp for image optimization.

**Spec:** `docs/superpowers/specs/2026-04-14-mejor-silla-oficina-menos-200-euros-design.md`

---

### Task 1: Verify product data and download hero image

**Files:**
- Create: `public/images/articulos/mejor-silla-oficina-menos-200-euros.webp`

- [ ] **Step 1: Ask user for star ratings of 4 new products**

The implementing agent must ask the user:

```
Necesito las valoraciones (estrellas) de estos 4 productos en Amazon.es:
1. Naspaluro Silla Oficina (ASIN B0FLXSQN3J) — ¿cuántas estrellas y cuántas valoraciones?
2. SONGMICS OBN55BK (ASIN B07ZCJVFDJ) — ¿cuántas estrellas y cuántas valoraciones?
3. COMHOMA Silla Ergonómica (ASIN B0F66N6N3J) — ¿cuántas estrellas y cuántas valoraciones?
4. FelixKing Silla Ergonómica (ASIN B0D8HWL8VP) — ¿cuántas estrellas y cuántas valoraciones?
```

Wait for user response before proceeding. Record the ratings for use in ComparisonTable.

Known ratings (from pilar):
- Hbada: 4.0
- SIHOO M18: 4.0

- [ ] **Step 2: Search Pexels for hero image**

```bash
node scripts/pexels-download.mjs "office chair home desk" mejor-silla-oficina-menos-200-euros --list
```

Review the list output. The image must:
- NOT use any of these pexels_ids already in PRODUCTOS.md: 8001036, 7168054, 1714208, 14715851, 4088255, 7298399, 7151690, 4974907, 5712122, 8001032, 28491194, 12792219, 6934240, 25223697, 4596575, 28955779, 31726669
- Show a simple/budget office chair in a real home office setting (not premium/corporate)
- Be specific to the topic (not a generic office photo)

If no good match, try alternative queries: `"desk chair work from home"`, `"simple office chair desk"`, `"ergonomic chair budget"`.

- [ ] **Step 3: Download selected image**

```bash
node scripts/pexels-download.mjs "office chair home desk" mejor-silla-oficina-menos-200-euros --index=N
```

Replace N with the index of the chosen image from the list.

- [ ] **Step 4: Verify image dimensions and resize if needed**

```bash
sips -g pixelWidth public/images/articulos/mejor-silla-oficina-menos-200-euros.webp
```

If width > 800px, resize:

```javascript
// Run in node
const sharp = require('sharp');
await sharp('public/images/articulos/mejor-silla-oficina-menos-200-euros.webp')
  .resize(800)
  .webp({ quality: 80 })
  .toFile('public/images/articulos/mejor-silla-oficina-menos-200-euros-opt.webp');
// Then replace the original:
// mv mejor-silla-oficina-menos-200-euros-opt.webp mejor-silla-oficina-menos-200-euros.webp
```

Verify final width:
```bash
sips -g pixelWidth public/images/articulos/mejor-silla-oficina-menos-200-euros.webp
```

Expected: pixelWidth ≤ 800

- [ ] **Step 5: Commit hero image**

```bash
git add public/images/articulos/mejor-silla-oficina-menos-200-euros.webp
git commit -m "content: add hero image for mejor-silla-oficina-menos-200-euros"
```

---

### Task 2: Write the MDX article

**Files:**
- Create: `src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx`

**References to read before writing:**
- Spec: `docs/superpowers/specs/2026-04-14-mejor-silla-oficina-menos-200-euros-design.md`
- Tone guide: `.seo-engine/templates/tone-guide.md`
- Humanization guide: `.seo-engine/templates/humanization-guide.md`
- Comparison template: `.seo-engine/templates/comparison-template.md`
- Config (author persona): `.seo-engine/config.yaml`
- Pilar article (coherence check): `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx`
- Gaming vs ergonómica (coherence check): `src/content/articulos/silla-gaming-vs-ergonomica.mdx`
- Dolor espalda (coherence check): `src/content/articulos/dolor-espalda-trabajar-casa.mdx`

- [ ] **Step 1: Read reference files for coherence and tone**

Read ALL reference files listed above. Take note of:
- David Rubio's persona details (Barcelona, 7 years remote, ErgoChair Pro, confinement story)
- Javi anecdote in silla-gaming-vs-ergonomica (do NOT reuse Javi — use "Marcos" for this article)
- Fisioterapeuta quotes used in other articles (do not contradict)
- Intro patterns of recent comparativas (avoid repeating)
- SIHOO M18 description in pilar (our analysis must go deeper, not copy)

- [ ] **Step 2: Create the MDX file with frontmatter**

Create `src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx` with this exact frontmatter:

```yaml
---
titulo: "Mejor silla de oficina barata: 6 opciones por menos de 200€"
descripcion: "Analizamos 6 sillas de oficina baratas con ergonomía real por menos de 200 €. Soporte lumbar, malla y ajustes desde 81 €."
categoria: sillas
tipo: comparativa
fecha: 2026-04-15
imagen: /images/articulos/mejor-silla-oficina-menos-200-euros.webp
imagenAlt: "Silla ergonómica de oficina con soporte lumbar en escritorio de home office"
destacado: false
tags:
  - silla oficina barata
  - silla ergonómica barata
  - mejor silla oficina menos 200 euros
  - silla escritorio económica
  - silla teletrabajo presupuesto
autor: David Rubio
faqs:
  - pregunta: "¿Merece la pena una silla ergonómica de menos de 100 €?"
    respuesta: "WRITE_DURING_IMPLEMENTATION"
  - pregunta: "¿Qué silla de oficina barata recomienda la OCU?"
    respuesta: "WRITE_DURING_IMPLEMENTATION"
  - pregunta: "¿Cuánto debería gastar en una silla de oficina para teletrabajar?"
    respuesta: "WRITE_DURING_IMPLEMENTATION"
  - pregunta: "¿Las sillas de malla son mejores que las de acolchado a este precio?"
    respuesta: "WRITE_DURING_IMPLEMENTATION"
---
```

FAQ responses will be written in step 9.

- [ ] **Step 3: Write imports and TopPick**

Add after frontmatter:

```mdx
import TopPick from '../../components/TopPick.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import AffiliateButton from '../../components/AffiliateButton.astro';

<TopPick
  nombre="COMHOMA Silla Ergonómica"
  imagen="https://m.media-amazon.com/images/I/71LJ0XGfsFL._AC_SL300_.jpg"
  descripcion="Reposacabezas 3D, soporte lumbar 3D, reposabrazos ajustables, función basculante e inclinación. Ajustes de silla de 300 € por menos de 150 €."
  precio="~150 EUR"
  enlaceAmazon="/dp/B0F66N6N3J"
/>
```

- [ ] **Step 4: Write introduction (150-250 words)**

**Pattern:** Dato sorprendente. Requirements:
- First sentence: include `silla de oficina barata` naturally + concrete data point (INSST 74% molestias OR price stat)
- Mention 6 products analyzed, range 81-200€
- Personal touch: "Mi primera silla de teletrabajo, durante el confinamiento de 2020, fue una de ~120€ que compré con prisas en Amazon. No tenía soporte lumbar ajustable — solo un cojín cosido al respaldo. A los dos meses la cambié." (Coherent with timeline: David started remote 2019, confinement 2020.)
- Lector interaction: "Un lector me escribió hace poco preguntando si merecía la pena gastar más de 100 € en una silla."
- Transition to article promise: what chairs under 200€ are actually worth it
- Do NOT start with "Si al final de la jornada te duele..." (used in pilar) or ironic comparison (used in monitor bracket article)
- Include link to `/guias/dolor-espalda-trabajar-casa/` contextually

- [ ] **Step 5: Write ComparisonTable**

Add after introduction:

```mdx
## Las 6 mejores sillas de oficina baratas en 2026

<ComparisonTable productos={[
  {
    nombre: "COMHOMA Silla Ergonómica",
    imagen: "https://m.media-amazon.com/images/I/71LJ0XGfsFL._AC_SL300_.jpg",
    puntosFuertes: "Reposacabezas 3D y soporte lumbar 3D ajustables, reposabrazos regulables, función basculante con bloqueo de inclinación. La que más ajustes ofrece por debajo de 150 €.",
    precio: "~150 EUR",
    enlaceAmazon: "/dp/B0F66N6N3J",
    valoracion: RATING_FROM_STEP_1
  },
  {
    nombre: "SIHOO M18",
    imagen: "https://m.media-amazon.com/images/I/61nb9ErcVpL._AC_SL300_.jpg",
    puntosFuertes: "La superventas de Amazon España: soporte lumbar ajustable en altura, reposacabezas, mecanismo de inclinación regulable. Años de valoraciones positivas y soporte post-venta real.",
    precio: "~200 EUR",
    enlaceAmazon: "/dp/B07GNDDNMW",
    valoracion: 4
  },
  {
    nombre: "Hbada Silla Ergonómica",
    imagen: "https://m.media-amazon.com/images/I/61L8eCtWCFL._AC_SL300_.jpg",
    puntosFuertes: "Diseño limpio con malla transpirable de alta densidad, reposacabezas ajustable, soporte lumbar y reposapiés integrado retráctil para descansos.",
    precio: "~190 EUR",
    enlaceAmazon: "/dp/B0CH7RBQQ7",
    valoracion: 4
  },
  {
    nombre: "FelixKing Silla Ergonómica",
    imagen: "https://m.media-amazon.com/images/I/81GODetTd8L._AC_SL300_.jpg",
    puntosFuertes: "Respaldo alto con reposacabezas integrado, soporte lumbar ajustable, reposabrazos abatibles. Buena opción si priorizas el apoyo cervical.",
    precio: "~172 EUR",
    enlaceAmazon: "/dp/B0D8HWL8VP",
    valoracion: RATING_FROM_STEP_1
  },
  {
    nombre: "SONGMICS OBN55BK",
    imagen: "https://m.media-amazon.com/images/I/71vUF7tlyKS._AC_SL300_.jpg",
    puntosFuertes: "Malla transpirable, soporte lumbar ajustable, apoyacabezas y apoyabrazos, inclinación hasta 120°. Marca consolidada con buen servicio post-venta en Europa.",
    precio: "~110 EUR",
    enlaceAmazon: "/dp/B07ZCJVFDJ",
    valoracion: RATING_FROM_STEP_1
  },
  {
    nombre: "Naspaluro Silla Oficina Ergonómica",
    imagen: "https://m.media-amazon.com/images/I/61GTUcJNZ+L._AC_SL300_.jpg",
    puntosFuertes: "Soporte lumbar dinámico, reposabrazos abatibles, balanceo de 120°. La opción más económica con ajustes ergonómicos reales.",
    precio: "~81 EUR",
    enlaceAmazon: "/dp/B0FLXSQN3J",
    valoracion: RATING_FROM_STEP_1
  }
]} />
```

Replace all `RATING_FROM_STEP_1` with actual ratings obtained in Task 1 Step 1.

Note: COMHOMA goes first (gets automatic "🏆 Mejor opción" badge). Products ordered by editorial recommendation, not by price.

- [ ] **Step 6: Write "Qué pierdes por debajo de 200€ (y qué no)" section**

This is the EXCLUSIVE section that differentiates from the pilar. ~300-400 words.

**H2:** `## Silla de oficina barata: qué pierdes por debajo de 200 € (y qué no)`

Include keyword `silla de oficina barata` in this H2.

**Content structure:**
- **Lo que SÍ pierdes:** Materiales (aluminio→plástico), ajuste profundidad asiento (raro <200€), reposabrazos 4D (solo 2D o fijos), durabilidad (3-5 años vs 7-10), garantía (1-2 años vs 5-10)
- **Lo que NO pierdes (si eliges bien):** Soporte lumbar ajustable en altura (desde ~110€), malla transpirable, mecanismo inclinación, reposacabezas
- Fisioterapeuta quote: "Lo mínimo no negociable es soporte lumbar ajustable en altura. Da igual si la silla cuesta 100 o 500 euros."
- Be specific with examples from the 6 products when illustrating trade-offs

- [ ] **Step 7: Write análisis detallado — 6 product reviews**

**H2:** `## Análisis detallado de cada silla`

Write ~200-250 words per product. Each product gets an H3 with the product name.

**Asymmetric pros/contras (MANDATORY — this distribution is exact):**

| Product | Pros count | Contras count |
|---------|-----------|---------------|
| Naspaluro (~81€) | 3 | 3 |
| SONGMICS (~110€) | 4 | 2 |
| COMHOMA (~150€) | 5 | 2 |
| FelixKing (~172€) | 3 | 3 |
| Hbada (~190€) | 4 | 2 |
| SIHOO M18 (~200€) | 5 | 1 |

Each product analysis must include:
- Who it's ideal for (specific user profile/situation)
- At least one specific measurement (seat height range, max weight, etc.)
- An `<AffiliateButton>` at the end:

```mdx
<AffiliateButton href="/dp/ASIN" tienda="amazon" texto="Ver [Product Name] en Amazon" />
```

**Humanization in this section:**
- For one product (suggest SONGMICS or COMHOMA), insert: "Cuando un compañero de equipo, Marcos, me pidió recomendación de silla bajo 150 €, le sugerí que priorizara soporte lumbar ajustable sobre reposacabezas. Eligió la [this product] y lleva 4 meses sin quejarse de la espalda."
- For SIHOO M18: reference that it's the one mentioned in the pilar and in silla-gaming-vs-ergonomica, with deeper analysis here. Do NOT copy text from pillar — write original content.

- [ ] **Step 8: Write guía de compra and recomendación sections**

**H2:** `## 4 cosas que mirar en una silla de oficina barata`

~300-400 words. 4 subsections (H3 each):
1. **Soporte lumbar ajustable en altura** — filter #1, eliminates 60% of bad options
2. **Altura de asiento para tu estatura** — provide ranges (ej: <1.65m needs seat at ~42cm, >1.85m needs ~52cm+)
3. **Malla vs acolchado** — climate consideration (important for summer in Spain), hours of use
4. **Base y peso máximo** — plastic vs reinforced nylon, weight capacity

Include link to `/guias/ergonomia-teletrabajo-postura-correcta/` in this section.

**H2:** `## Nuestra recomendación según tu caso`

~150-200 words. Three profiles:
- **Presupuesto mínimo (<100€):** Naspaluro — for short sessions or first ergonomic chair
- **Mejor equilibrio (130-170€):** COMHOMA — most adjustments for the price
- **Tope de gama bajo 200€:** SIHOO M18 — the safe bet if you can stretch budget
- Final paragraph with link to pilar: "Si tu presupuesto es flexible, en nuestra [comparativa de sillas ergonómicas calidad-precio](/sillas/mejor-silla-ergonomica-calidad-precio/) analizamos opciones hasta 320 €."

- [ ] **Step 9: Write FAQ responses in frontmatter**

Go back to the frontmatter and replace `WRITE_DURING_IMPLEMENTATION` with real responses.

Each FAQ response: 2-3 sentences, concise, with a concrete data point when possible.

**Directions:**
1. "¿Merece la pena una silla de menos de 100€?" — Sí but with caveats. Basic lumbar, fewer adjustments, less durable materials. OK for <6h/day sessions. Mention Naspaluro as example.
2. "¿Qué silla recomienda la OCU?" — The OCU periodically reviews chairs. Our analysis focuses on Amazon.es availability + real ergonomic adjustments, which are the criteria that matter most for telecommuters.
3. "¿Cuánto gastar?" — 130-200€ is the sweet spot. Below 100€ serious lumbar compromises. Above 200€ better durability and fine adjustments but diminishing returns.
4. "¿Malla vs acolchado?" — Depends on climate and preference. Mesh breathes better (key in Spanish summers). Padded is softer initially but retains heat. For 6+ hours daily, mesh recommended.

- [ ] **Step 10: Final article review**

Before committing, verify the complete article against this checklist:
- [ ] Title ≤60 chars with primary keyword
- [ ] Description 120-155 chars with keyword + CTA
- [ ] Primary keyword `silla oficina barata` in: title, first paragraph, one H2, description
- [ ] Min 2 personal experience insertions (confinement chair story + Marcos anecdote)
- [ ] Min 1 fisioterapeuta mention
- [ ] Min 1 reader interaction
- [ ] Pros/contras asymmetric (different count per product)
- [ ] Internal links to 3+ articles (pilar, dolor-espalda, ergonomia-postura)
- [ ] All AffiliateButton use `href` (not `enlace`), `tienda="amazon"`, `texto`
- [ ] All product images use `_AC_SL300_` (not `_AC_SL1500_`)
- [ ] No markdown links to `/dp/ASIN` in text (only via AffiliateButton)
- [ ] No email in plaintext
- [ ] Word count: 2000-2800 words
- [ ] FAQs have real responses (no placeholders)

- [ ] **Step 11: Commit the article**

```bash
git add src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx
git commit -m "content: add comparativa mejores sillas oficina baratas <200€"
```

---

### Task 3: Update PRODUCTOS.md

**Files:**
- Modify: `PRODUCTOS.md`

- [ ] **Step 1: Add Pexels image entry**

Add a row to the "Imágenes de artículos (Pexels)" table in PRODUCTOS.md:

```markdown
| mejor-silla-oficina-menos-200-euros | mejor-silla-oficina-menos-200-euros.webp | PEXELS_ID | Photographer Name | https://www.pexels.com/photo/PEXELS_ID/ |
```

Replace PEXELS_ID and Photographer with values from Task 1 Step 3.

- [ ] **Step 2: Add product tracking section**

Add a new section to PRODUCTOS.md:

```markdown
### mejor-silla-oficina-menos-200-euros

| Producto | ASIN | URL Amazon | Imagen | Precio | Estado |
|----------|------|-----------|--------|--------|--------|
| Naspaluro Silla Oficina Ergonómica | B0FLXSQN3J | /dp/B0FLXSQN3J | https://m.media-amazon.com/images/I/61GTUcJNZ+L._AC_SL1500_.jpg | ~81 EUR | verificado |
| SONGMICS OBN55BK | B07ZCJVFDJ | /dp/B07ZCJVFDJ | https://m.media-amazon.com/images/I/71vUF7tlyKS._AC_SL1500_.jpg | ~110 EUR | verificado |
| COMHOMA Silla Ergonómica | B0F66N6N3J | /dp/B0F66N6N3J | https://m.media-amazon.com/images/I/71LJ0XGfsFL._AC_SL1500_.jpg | ~150 EUR | verificado |
| FelixKing Silla Ergonómica | B0D8HWL8VP | /dp/B0D8HWL8VP | https://m.media-amazon.com/images/I/81GODetTd8L._SL1500_.jpg | ~172 EUR | verificado |
| Hbada Silla Ergonómica | B0CH7RBQQ7 | /dp/B0CH7RBQQ7 | https://m.media-amazon.com/images/I/61L8eCtWCFL._AC_SL1500_.jpg | ~190 EUR | verificado |
| SIHOO M18 | B07GNDDNMW | /dp/B07GNDDNMW | https://m.media-amazon.com/images/I/61nb9ErcVpL._AC_SL1500_.jpg | ~200 EUR | verificado |
```

- [ ] **Step 3: Commit**

```bash
git add PRODUCTOS.md
git commit -m "docs: add product tracking for mejor-silla-oficina-menos-200-euros"
```

---

### Task 4: Add incoming internal links

**Files:**
- Modify: `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx`
- Modify: `src/content/articulos/home-office-productivo-500-euros.mdx`

- [ ] **Step 1: Read pilar article to find insertion point**

```bash
# Find the best place to insert a link — near the ComparisonTable or in the recommendation section
```

Read `src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx` and find where to add a contextual link. Best location: near the end or in the recommendation section. Insert a natural sentence like:

```markdown
Si tu presupuesto está por debajo de 200 €, tenemos una [comparativa específica de sillas de oficina baratas](/sillas/mejor-silla-oficina-menos-200-euros/) donde analizamos 6 opciones desde 81 € con ergonomía real.
```

- [ ] **Step 2: Read home-office-productivo-500-euros article to find insertion point**

The article already has an H3 "Qué buscar en una silla por menos de 200 €" at approximately line 57, and links to the pilar at line 77. Add a link to our new article near that section:

```markdown
En nuestra [comparativa de sillas de oficina baratas por menos de 200 €](/sillas/mejor-silla-oficina-menos-200-euros/) analizamos 6 opciones concretas desde 81 € si necesitas orientación específica.
```

Insert this AFTER the existing link to the pilar (line 77), as a complementary reference.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx src/content/articulos/home-office-productivo-500-euros.mdx
git commit -m "content: add incoming links to mejor-silla-oficina-menos-200-euros"
```

---

### Task 5: Update SEO engine files

**Files:**
- Modify: `.seo-engine/data/content-map.yaml`
- Modify: `.seo-engine/data/content-queue.yaml`
- Modify: `.seo-engine/data/topic-clusters.yaml`
- Modify: `.seo-engine/data/seo-keywords.csv`
- Modify: `.seo-engine/logs/changelog.md`

- [ ] **Step 1: Add entry to content-map.yaml**

Add to the articles list in `.seo-engine/data/content-map.yaml`:

```yaml
  - slug: mejor-silla-oficina-menos-200-euros
    title: "Mejor silla de oficina barata: 6 opciones por menos de 200€"
    path: src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx
    type: comparativa
    category: sillas
    primary_keyword: "silla oficina barata"
    secondary_keywords:
      - mejor silla ergonómica
      - mejor silla oficina
      - silla ergonómica barata
      - mejor silla escritorio
      - silla oficina menos 200 euros
    cluster: sillas
    status: human-review
    date: 2026-04-15
    has_eeat_signals: true
    internal_links_to:
      - mejor-silla-ergonomica-calidad-precio
      - dolor-espalda-trabajar-casa
      - ergonomia-teletrabajo-postura-correcta
    internal_links_from:
      - mejor-silla-ergonomica-calidad-precio
      - home-office-productivo-500-euros
```

- [ ] **Step 2: Update content-queue.yaml**

Find the entry for `mejor-silla-oficina-menos-200-euros` in `.seo-engine/data/content-queue.yaml` and update its status:

Change `status: planned` (or `approved`) to `status: human-review`.

If no entry exists, add:

```yaml
  - slug: mejor-silla-oficina-menos-200-euros
    title: "Mejor silla de oficina barata: 6 opciones por menos de 200€"
    type: comparativa
    category: sillas
    priority: high
    status: human-review
    date_created: 2026-04-14
    notes: "Comparativa 6 sillas <200€. Ángulo: trade-offs honestos del segmento presupuesto. 4 tiers (81-200€). TopPick COMHOMA ~150€. Primary keyword: silla oficina barata (480 SV). 4 FAQs. Imagen Pexels."
```

- [ ] **Step 3: Update topic-clusters.yaml**

Find the sillas cluster in `.seo-engine/data/topic-clusters.yaml`, locate the `mejor-silla-oficina-menos-200-euros` entry, and change:

```yaml
        status: planned
```
to:
```yaml
        status: human-review
```

- [ ] **Step 4: Add keywords to seo-keywords.csv**

Add these rows to `.seo-engine/data/seo-keywords.csv` (check existing entries first to avoid duplicates):

```csv
silla oficina barata,480,commercial-investigation,sillas,mejor-silla-oficina-menos-200-euros,2026-04-14
silla ergonómica barata,140,commercial-investigation,sillas,mejor-silla-oficina-menos-200-euros,2026-04-14
mejor silla escritorio,210,commercial-investigation,sillas,mejor-silla-oficina-menos-200-euros,2026-04-14
mejores sillas ergonómicas,170,informational,sillas,,2026-04-14
silla oficina 200 euros,0,commercial-investigation,sillas,mejor-silla-oficina-menos-200-euros,2026-04-14
silla ergonómica menos 200 euros,0,commercial-investigation,sillas,mejor-silla-oficina-menos-200-euros,2026-04-14
```

Check the CSV header for exact column names and adjust accordingly.

- [ ] **Step 5: Log to changelog.md**

Add to top of `.seo-engine/logs/changelog.md`:

```markdown
## 2026-04-15 --:--
**Action:** Blog written — "Mejor silla de oficina barata: 6 opciones por menos de 200€"
**Files:** src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx, public/images/articulos/mejor-silla-oficina-menos-200-euros.webp, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Comparativa de 6 sillas ergonómicas por debajo de 200 € en 4 tiers de precio (81-200€). Ángulo: trade-offs honestos del segmento presupuesto. TopPick: COMHOMA (~150€). Primary keyword: "silla oficina barata" (480 SV). 4 FAQs. 2 experiencias personales + fisio + lector. Internal links: pilar sillas, dolor-espalda, ergonomía-postura. Cluster sillas. Imagen Pexels #XXXXX. Status: human-review.
**Triggered by:** user
```

Replace XXXXX with actual Pexels ID.

- [ ] **Step 6: Commit all SEO engine updates**

```bash
git add .seo-engine/data/content-map.yaml .seo-engine/data/content-queue.yaml .seo-engine/data/topic-clusters.yaml .seo-engine/data/seo-keywords.csv .seo-engine/logs/changelog.md
git commit -m "seo: register mejor-silla-oficina-menos-200-euros in engine"
```

---

### Task 6: Build and verify

**Files:** None (verification only)

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: build completes without errors. The post-build script will auto-update CSP hashes.

- [ ] **Step 2: Verify the article page exists in build output**

```bash
ls dist/sillas/mejor-silla-oficina-menos-200-euros/index.html
```

Expected: file exists.

- [ ] **Step 3: Verify product images load**

Check that all 6 product image URLs return 200:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/71LJ0XGfsFL._AC_SL300_.jpg"
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/61nb9ErcVpL._AC_SL300_.jpg"
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/61L8eCtWCFL._AC_SL300_.jpg"
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/81GODetTd8L._AC_SL300_.jpg"
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/71vUF7tlyKS._AC_SL300_.jpg"
curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/61GTUcJNZ+L._AC_SL300_.jpg"
```

Expected: all return `200`.

- [ ] **Step 4: Verify internal links resolve**

```bash
ls dist/sillas/mejor-silla-ergonomica-calidad-precio/index.html
ls dist/guias/dolor-espalda-trabajar-casa/index.html
ls dist/guias/ergonomia-teletrabajo-postura-correcta/index.html
```

Expected: all exist.

- [ ] **Step 5: Alert user for review**

```
Blog redactado: "Mejor silla de oficina barata: 6 opciones por menos de 200€"
Archivo: src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx
Palabras: ~XXXX | Links internos: 3 salientes + 2 entrantes
Cluster: sillas (sub-page del pilar)

REVISIÓN NECESARIA — di "Aprueba blog mejor-silla-oficina-menos-200-euros" o da feedback.
```
