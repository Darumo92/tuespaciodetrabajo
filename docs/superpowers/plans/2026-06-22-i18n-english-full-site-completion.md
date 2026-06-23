# English Full-Site Internationalization Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every currently public Spanish surface have a professional English equivalent under `/en/` without exposing Spanish UI, Spanish editorial product copy, missing language-switch targets, or fake USD prices.

**Architecture:** Keep Spanish as the default source of truth. Add an English product/catalog presentation layer that reuses verified structured product data, localizes labels and routes, and hides Spanish editorial product fields unless translated. Add route-level English equivalents for catalog, product pages, comparisons, search, article index, tools, news/update pages and empty categories.

**Tech Stack:** Astro 5 static output, MDX content collections, TypeScript helpers, Vitest, plain CSS.

---

### Task 1: Add English product/catalog localization helpers

**Files:**
- Modify: `src/lib/productos.ts`
- Modify: `src/lib/tipos.ts`
- Test: `src/lib/productos.test.ts`

- [ ] Add tests proving English price tier uses `$`, specs render in English, enum labels are English, product catalog URLs use `/en/catalog/chairs/...`, and search index can emit localized article/product URLs.
- [ ] Implement locale-aware helpers without changing Spanish behavior.

### Task 2: Localize product components

**Files:**
- Modify: `src/components/BotonPrecio.astro`
- Modify: `src/components/producto/FichaProducto.astro`
- Modify: `src/components/producto/FichaHero.astro`
- Modify: `src/components/producto/FichaResumenCompra.astro`
- Modify: `src/components/producto/FichaMetodologiaProducto.astro`
- Modify: `src/components/producto/FichaFuentes.astro`
- Modify: `src/components/producto/ValoracionEjes.astro`
- Modify: `src/components/producto/ParaQuien.astro`
- Modify: `src/components/producto/TarjetaProducto.astro`
- Modify: `src/components/producto/CatalogoProductos.astro`
- Modify: `src/components/producto/ComparadorProductos.astro`
- Modify: `src/components/producto/TablaVs.astro`

- [ ] Pass `locale` into each component.
- [ ] Render Spanish editorial fields only for `es-ES`.
- [ ] Render English generic product copy from structured specs.
- [ ] Localize labels, buttons, empty states, “best” badges, “not rated”, “n/a”, verified dates, and screen-reader text.

### Task 3: Add English route equivalents

**Files:**
- Create: `src/pages/[locale]/catalog/index.astro`
- Create: `src/pages/[locale]/catalog/[tipo]/index.astro`
- Create: `src/pages/[locale]/catalog/[tipo]/[slug].astro`
- Create: `src/pages/[locale]/compare/[tipo]/index.astro`
- Create: `src/pages/[locale]/compare/[tipo]/[par].astro`
- Create: `src/pages/[locale]/articles.astro`
- Create: `src/pages/[locale]/search.astro`
- Create: `src/pages/[locale]/search.json.ts`
- Create: `src/pages/[locale]/search-index.json.ts`
- Create: `src/pages/[locale]/tools/index.astro`
- Create: `src/pages/[locale]/tools/ergonomic-calculator.astro`
- Create: `src/pages/[locale]/news/index.astro`
- Create: `src/pages/[locale]/updates.astro`
- Modify: `src/pages/[locale]/[categoria]/index.astro`

- [ ] Generate 67 English product pages and 17 English compare pages.
- [ ] Include canonical/hreflang for catalog, product pages and comparisons.
- [ ] Generate `/en/audio-video/` as a noindex empty category instead of linking to a 404.

### Task 4: Wire navigation, sitemap and QA gates

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/Base.astro`
- Modify: `astro.config.mjs`
- Modify: `docs/agent-context/reference_i18n_workflow.md`

- [ ] Add English nav/footer links for catalog, tools, search and article index.
- [ ] Add sitemap hreflang groups for product catalog and compare pages where appropriate.
- [ ] Document that English product pages use structured English summaries unless editor-translated product copy exists.

### Task 5: Verification

- [ ] Run `npm run test`.
- [ ] Run `npm run validate:productos`.
- [ ] Run `npm run build`.
- [ ] Count rendered English pages and verify expected coverage:
  - 30 articles/guides.
  - 67 product pages.
  - 17 compare pages.
  - catalog, tools, search, article index, news/update and category support pages.
- [ ] Scan rendered `/en/` HTML for Spanish UI/legal/commercial text and EUR symbols.
- [ ] Report exact remaining risks instead of claiming perfection.
