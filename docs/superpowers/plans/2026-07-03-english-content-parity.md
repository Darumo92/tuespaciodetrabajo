# English Content Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every English public page to the same editorial, SEO, and localization quality as its Spanish equivalent.

**Architecture:** Spanish MDX remains the source of editorial depth. English MDX files in `src/content/articulosI18n/en/` are rewritten in batches using `translationOf` as the mapping key, with localized headings, metadata, FAQs, CTAs, and internal links. Product/catalog pages get a lighter QA pass after editorial pages.

**Tech Stack:** Astro 5, MDX content collections, plain CSS, static build with `npm run build`.

---

### Task 1: Batch 1 core editorial pages

**Files:**
- Modify: `src/content/articulosI18n/en/complete-home-office-guide.mdx`
- Modify: `src/content/articulosI18n/en/how-to-set-up-an-ergonomic-home-office.mdx`
- Modify: `src/content/articulosI18n/en/back-pain-working-from-home.mdx`
- Modify: `src/content/articulosI18n/en/correct-desk-and-chair-height.mdx`
- Modify: `src/content/articulosI18n/en/my-home-office-setup-2026.mdx`

- [ ] Compare Spanish and English headings, metadata, FAQs, and body depth.
- [ ] Replace thin English copy with full natural English localization.
- [ ] Preserve `translationOf`, `localizedSlug`, `categoriaSlug`, dates, images, author, and valid MDX components.
- [ ] Run `npm run build`.

### Task 2: Remaining editorial MDX batches

**Files:**
- Modify remaining files in `src/content/articulosI18n/en/*.mdx`.

- [ ] Process all remaining articles by SEO impact, prioritizing informational pages below 20% ES depth.
- [ ] Rewrite comparison pages only where the English version loses product rationale, buying guidance, or important caveats.
- [ ] Keep Amazon ASINs, prices, and product claims unchanged unless already present in Spanish.
- [ ] Run `npm run build` after each major batch.

### Task 3: Localized Astro pages and catalog QA

**Files:**
- Review: `src/pages/[locale]/**/*.astro`
- Review: `src/content/productos/*.yaml`

- [ ] Check localized homepage, corporate pages, tools, guides index, articles index, categories, catalog, and product templates.
- [ ] Fix obvious English copy gaps, missing SEO metadata, or Spanish leftovers.
- [ ] Keep catalog/product work limited to clear translation, metadata, CTA, or consistency problems.
- [ ] Run final `npm run build`.

### Task 4: Final report

**Files:**
- Create or update: `docs/agent-context/project_english_localization_audit.md`
- Modify: `docs/agent-context/INDEX.md`

- [ ] Record page-by-page decisions: complete refactor, partial optimization, quick review, or no changes.
- [ ] Include batch status and remaining risk.
- [ ] Link the persistent report from `docs/agent-context/INDEX.md`.
