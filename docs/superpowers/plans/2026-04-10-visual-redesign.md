# Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign tuespaciodetrabajo.com with a Premium + Tech/Modern aesthetic — blue+rose palette, deep dark mode, glassmorphism, bento hero grid.

**Architecture:** CSS-first redesign. Most changes are in `global.css`. Three templates get HTML changes: `index.astro` (hero+trust+categories), `ArticleCard.astro` (badge position), `TopPick.astro` (glass styles). No new JS logic.

**Tech Stack:** Astro 5, plain CSS with custom properties, no Tailwind.

**Spec:** `docs/superpowers/specs/2026-04-10-visual-redesign-design.md`

---

## File Map

| File | Tasks | Changes |
|------|-------|---------|
| `src/styles/global.css` | 1-9 | Color tokens, header glass, hero CSS, cards, buttons, typography |
| `src/pages/index.astro` | 4, 7, 8 | Hero bento grid rewrite, trust section, category cards |
| `src/components/ArticleCard.astro` | 5 | Badge position move to image overlay |
| `src/components/TopPick.astro` | 6 | Glass styles in scoped CSS |

---

### Task 1: Color system + dark mode deep background

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add rose tokens to `:root`**

After `--color-accent: #10b981;` add:

```css
  --color-rose: #f43f5e;
  --color-rose-dark: #e11d48;
  --color-rose-light: #fb7185;
```

- [ ] **Step 2: Update `[data-theme="dark"]` with deep background + rose**

Replace the dark mode color block:

```css
[data-theme="dark"] {
  --color-bg: #0a0a14;
  --color-bg-card: #12121f;
  --color-bg-muted: #1a1a2e;

  --color-text: #f0eff4;
  --color-text-muted: #a0a0b8;
  --color-text-light: #70708a;

  --color-border: #1e1e35;
  --color-border-dark: #2a2a45;

  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
  --color-primary-light: #93c5fd;
  --color-secondary: #f59e0b;
  --color-secondary-text: #fbbf24;
  --color-accent: #34d399;

  --color-rose: #fb7185;
  --color-rose-dark: #f43f5e;
  --color-rose-light: #fda4af;

  --color-footer-bg: #08080f;
  --color-footer-text: #a0a0b8;
  --color-footer-heading: #f0eff4;
  --color-footer-link: #b0b0c8;
  --color-footer-border: #1e1e35;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add rose palette and deep dark mode background"
```

---

### Task 2: Header enhanced glass

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Update header glass effect**

Replace:

```css
.header {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
```

With:

```css
.header {
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
```

- [ ] **Step 2: Add dark mode header override**

Find the existing dark header styles or add after the dark mode footer section:

```css
[data-theme="dark"] .header {
  background: rgba(10, 10, 20, 0.8);
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}
```

- [ ] **Step 3: Build and commit**

Run: `npm run build`

```bash
git add src/styles/global.css
git commit -m "style: enhance header glass effect"
```

---

### Task 3: Global button border-radius

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Change affiliate-button border-radius**

In `.affiliate-button`, replace `border-radius: 100px;` with `border-radius: 10px;`

- [ ] **Step 2: Change hero-cat-pill border-radius**

In `.hero-cat-pill`, replace `border-radius: 100px;` with `border-radius: 10px;`

- [ ] **Step 3: Keep pill radius for badges and sort buttons**

Verify `.comp-badge`, `.badge`, `.comp-sort-btn`, `.top-pick-badge` still have `border-radius: 100px;`. Do NOT change those.

- [ ] **Step 4: Build and commit**

Run: `npm run build`

```bash
git add src/styles/global.css
git commit -m "style: change button border-radius from pill to 10px"
```

---

### Task 4: Hero — bento grid rewrite

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

This is the largest task. It replaces the entire hero section and removes the seasonal banner.

- [ ] **Step 1: Replace hero HTML in index.astro**

Replace the entire hero section (from `<!-- Hero -->` through the closing `</section>` of the seasonal banner) with:

```astro
  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <p class="hero-eyebrow">Guías y comparativas {new Date().getFullYear()}</p>
          <h1 class="hero-title">
            Crea tu espacio de trabajo <span>perfecto</span>
          </h1>
          <p class="hero-subtitle">
            Análisis honestos de sillas, escritorios y accesorios para teletrabajar desde casa con comodidad.
          </p>
          <div class="hero-cta">
            <a href="/articulos/" class="hero-cta-btn hero-cta-primary">Ver comparativas</a>
            <a href="/guias/" class="hero-cta-btn hero-cta-secondary">Leer guías</a>
          </div>
        </div>
        <div class="hero-bento">
          {categorias.slice(0, 4).map(cat => (
            <a href={`/${cat.slug}/`} class="hero-bento-card">
              <span class="hero-bento-icon"><CategoryIcon categoria={cat.slug} size={24} /></span>
              <div>
                <p class="hero-bento-name">{cat.nombre}</p>
                <p class="hero-bento-count">{cat.count > 0 ? `${cat.count} artículos` : 'Próximamente'}</p>
              </div>
            </a>
          ))}
          {destacados.length > 0 && (() => {
            const feat = destacados[0];
            const featUrl = feat.data.tipo === 'informativo'
              ? `/guias/${feat.slug}/`
              : `/${feat.data.categoria}/${feat.slug}/`;
            return (
              <a href={featUrl} class="hero-bento-featured">
                <div class="hero-bento-featured-icon">
                  <CategoryIcon categoria={feat.data.tipo === 'informativo' ? 'guias' : feat.data.categoria} size={20} />
                </div>
                <div class="hero-bento-featured-text">
                  <p class="hero-bento-featured-label">Destacado</p>
                  <p class="hero-bento-featured-title">{feat.data.titulo}</p>
                </div>
                <span class="hero-bento-featured-arrow">→</span>
              </a>
            );
          })()}
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Remove seasonal banner CSS**

In `global.css`, delete the seasonal banner styles: `.seasonal-banner`, `.seasonal-items`, `.seasonal-item`, `.seasonal-icon`, `.seasonal-text`, `.seasonal-arrow`, and all their hover/responsive rules. Search for "seasonal" and remove all matching rule blocks.

- [ ] **Step 3: Remove old hero CSS and add new hero CSS**

In `global.css`, replace the entire HERO section (from `/* HERO */` comment through `.hero-meta`) with:

```css
/* =========================================
   HERO
   ========================================= */

.hero {
  background:
    radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent) 1px, transparent 1px),
    linear-gradient(135deg, #f0f4ff 0%, #faf9ff 50%, #fff5f7 100%);
  background-size: 24px 24px, 100% 100%;
  padding: 4.5rem 0 3.5rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse, rgba(244, 63, 94, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

[data-theme="dark"] .hero {
  background:
    radial-gradient(circle, color-mix(in srgb, var(--color-primary) 4%, transparent) 1px, transparent 1px),
    linear-gradient(135deg, #0a0a14 0%, #0f0f1f 50%, #120a14 100%);
  background-size: 24px 24px, 100% 100%;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
  position: relative;
}

.hero-content {
  display: flex;
  flex-direction: column;
}

.hero-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-rose);
  margin-bottom: 0.75rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 900;
  color: var(--color-text);
  line-height: 1.1;
  margin-bottom: 1.25rem;
  letter-spacing: -0.03em;
}

.hero-title span {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 1.75rem;
  max-width: 480px;
}

.hero-cta {
  display: flex;
  gap: 0.75rem;
}

.hero-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.hero-cta-btn:active {
  transform: scale(0.97);
}

.hero-cta-primary {
  background: var(--color-primary);
  color: #fff;
}

.hero-cta-primary:hover {
  background: var(--color-primary-dark);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.hero-cta-secondary {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.hero-cta-secondary:hover {
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary-dark);
  transform: translateY(-2px);
}

[data-theme="dark"] .hero-cta-secondary {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
}

/* --- Bento Grid --- */

.hero-bento {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr auto;
  gap: 0.75rem;
}

.hero-bento-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.hero-bento-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-2px);
  color: var(--color-text);
}

[data-theme="dark"] .hero-bento-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.hero-bento-icon {
  font-size: 1.5rem;
}

.hero-bento-name {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--color-text);
}

.hero-bento-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.hero-bento-featured {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.hero-bento-featured:hover {
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-2px);
  color: var(--color-text);
}

[data-theme="dark"] .hero-bento-featured {
  background: rgba(255, 255, 255, 0.03);
}

.hero-bento-featured-icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-rose));
  border-radius: 10px;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.hero-bento-featured-text {
  flex: 1;
  min-width: 0;
}

.hero-bento-featured-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-rose);
  margin-bottom: 0.15rem;
}

.hero-bento-featured-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-text);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-bento-featured-arrow {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 0 2.5rem;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-content {
    text-align: center;
    align-items: center;
  }

  .hero-subtitle {
    max-width: 100%;
  }

  .hero-cta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
}

@media (max-width: 480px) {
  .hero-cta {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta-btn {
    justify-content: center;
  }
}
```

- [ ] **Step 4: Also remove the old hero-cat-pill styles and hero-stats styles**

Search for `.hero-cat-pill`, `.hero-stats`, `.hero-stat`, `.hero-meta` in `global.css` and remove those rule blocks. They are no longer used.

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: redesign hero with bento grid layout"
```

---

### Task 5: Article cards — badge on image + category border

**Files:**
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Move badge into image area in ArticleCard.astro**

Replace the article-card template HTML:

```astro
<article class="article-card" data-tipo={esInformativo ? 'informativo' : 'comparativa'}>
  <a href={url} class="article-card-image" aria-hidden="true" tabindex="-1">
    {imagen ? (
      <img src={imagen} alt={titulo} width="400" height="225" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" fetchpriority="low" />
    ) : (
      <div class="article-card-image-placeholder" aria-hidden="true">
        <CategoryIcon categoria={esInformativo ? 'guias' : categoria} size={48} />
      </div>
    )}
  </a>

  <div class="article-card-body">
    <div class="article-card-badges">
      <span class={`article-card-category badge badge-${categoria}`}>
        {info.nombre}
      </span>
    </div>
```

With:

```astro
<article class="article-card" data-tipo={esInformativo ? 'informativo' : 'comparativa'} style={`--card-accent: var(--color-cat-${esInformativo ? 'guias' : categoria})`}>
  <a href={url} class="article-card-image" aria-hidden="true" tabindex="-1">
    {imagen ? (
      <img src={imagen} alt={titulo} width="400" height="225" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" fetchpriority="low" />
    ) : (
      <div class="article-card-image-placeholder" aria-hidden="true">
        <CategoryIcon categoria={esInformativo ? 'guias' : categoria} size={48} />
      </div>
    )}
    <span class={`article-card-category badge badge-${esInformativo ? 'guias' : categoria}`}>
      {info.nombre}
    </span>
  </a>

  <div class="article-card-body">
```

Also remove the `<div class="article-card-badges">` block from the card body (the 3 lines that were just above the title link).

- [ ] **Step 2: Add category color tokens to `:root` in global.css**

After the rose tokens, add:

```css
  --color-cat-sillas: #2563eb;
  --color-cat-escritorios: #f59e0b;
  --color-cat-accesorios: #10b981;
  --color-cat-ambiente: #ec4899;
  --color-cat-audio-video: #8b5cf6;
  --color-cat-guias: #f43f5e;
```

- [ ] **Step 3: Update article card CSS**

Add `border-left` to `.article-card`:

```css
.article-card {
  border-left: 4px solid var(--card-accent, var(--color-primary));
}
```

Move `.article-card-category` to absolute positioning on the image:

Replace:

```css
.article-card-category {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}
```

With:

```css
.article-card-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
}
```

Add `position: relative` to `.article-card-image` (if not already there).

Remove the `.article-card-badges` CSS block entirely.

Add a guias badge class:

```css
.badge-guias {
  background: #f43f5e;
  color: #fff;
}
```

Update existing badge classes to ensure white text:

```css
.badge-sillas { background: #2563eb; color: #fff; }
.badge-escritorios { background: #d97706; color: #fff; }
.badge-accesorios { background: #059669; color: #fff; }
.badge-ambiente { background: #db2777; color: #fff; }
.badge-audio-video { background: #7c3aed; color: #fff; }
```

- [ ] **Step 4: Build and commit**

Run: `npm run build`

```bash
git add src/components/ArticleCard.astro src/styles/global.css
git commit -m "style: move article card badge to image overlay, add category border"
```

---

### Task 6: TopPick — glassmorphism + glow

**Files:**
- Modify: `src/components/TopPick.astro`

- [ ] **Step 1: Update TopPick scoped styles**

Replace the `.top-pick` rule:

```css
.top-pick {
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem 1.5rem;
  margin: 1.5rem 0;
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-bg));
  position: relative;
  box-shadow: 0 4px 24px color-mix(in srgb, var(--color-primary) 10%, transparent);
}
```

With:

```css
.top-pick {
  border: 2px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem 1.5rem;
  margin: 1.5rem 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 10%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 5%, transparent);
}
```

- [ ] **Step 2: Update badge gradient**

Replace `.top-pick-badge` background:

```css
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
```

With:

```css
  background: linear-gradient(135deg, var(--color-primary), var(--color-rose));
```

- [ ] **Step 3: Add dark mode override**

Add at the end of the `<style>` block (before the closing `</style>`):

```css
:global([data-theme="dark"]) .top-pick {
  background: rgba(255, 255, 255, 0.04);
  border-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 5%, transparent);
}
```

- [ ] **Step 4: Change affiliate-button border-radius in TopPick scope**

In `.top-pick-stores .affiliate-button`, add `border-radius: 10px;`

- [ ] **Step 5: Build and commit**

Run: `npm run build`

```bash
git add src/components/TopPick.astro
git commit -m "style: TopPick glassmorphism with gradient badge and glow"
```

---

### Task 7: Trust section — centered icons with gradient

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace trust section HTML in index.astro**

Replace the trust section (from `<!-- Trust / Social proof` through its closing `</section>`):

```astro
  <!-- Trust / Social proof -->
  <section class="trust-section">
    <div class="container">
      <div class="trust-grid reveal-group">
        <div class="trust-card">
          <div class="trust-card-icon trust-card-icon--blue" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <strong>Análisis independientes</strong>
          <p>Probamos y comparamos productos reales. Sin reseñas patrocinadas.</p>
        </div>
        <div class="trust-card">
          <div class="trust-card-icon trust-card-icon--rose" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
          </div>
          <strong>Precios actualizados</strong>
          <p>Comparamos precios en Amazon.es para mostrarte las mejores opciones.</p>
        </div>
        <div class="trust-card">
          <div class="trust-card-icon trust-card-icon--green" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><polyline points="21 3 21 9 15 9"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L21 9"/></svg>
          </div>
          <strong>Actualizado regularmente</strong>
          <p>Revisamos precios y disponibilidad para que la info sea fiable.</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Replace trust section CSS**

Replace the entire trust section CSS block:

```css
.trust-section {
  padding: 3rem 0;
  border-top: 1px solid var(--color-border);
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.trust-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 2rem 1.5rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.trust-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.trust-card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  margin-bottom: 0.25rem;
}

.trust-card-icon--blue {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, transparent), color-mix(in srgb, var(--color-primary) 5%, transparent));
  color: var(--color-primary);
}

.trust-card-icon--rose {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-rose) 12%, transparent), color-mix(in srgb, var(--color-rose) 5%, transparent));
  color: var(--color-rose);
}

.trust-card-icon--green {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 12%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent));
  color: var(--color-accent);
}

.trust-card strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.trust-card p {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}
```

- [ ] **Step 3: Build and commit**

Run: `npm run build`

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "style: redesign trust section with centered icons and gradients"
```

---

### Task 8: Category cards — unique gradients + glow hover

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add --cat-color to each category card in index.astro**

The category color map in the template (define before the HTML, inside the frontmatter):

```typescript
const catColors: Record<string, string> = {
  sillas: '#2563eb',
  escritorios: '#f59e0b',
  accesorios: '#10b981',
  ambiente: '#ec4899',
  'audio-video': '#8b5cf6',
  guias: '#f43f5e',
};
```

Update the category card markup. Replace:

```astro
          <a href={`/${cat.slug}/`} class="category-card">
```

With:

```astro
          <a href={`/${cat.slug}/`} class="category-card" style={`--cat-color: ${catColors[cat.slug] || '#2563eb'}`}>
```

Also replace the inline `style="margin-top: 0.5rem; ..."` attributes on the count/proximamente paragraphs with CSS classes. Replace:

```astro
              {cat.count > 0 ? (
                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--color-primary); font-weight: 600;">
                  {cat.count} {cat.count === 1 ? 'artículo' : 'artículos'}
                </p>
              ) : (
                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--color-text-light); font-weight: 500;">
                  Próximamente
                </p>
              )}
```

With:

```astro
              {cat.count > 0 ? (
                <p class="category-count">{cat.count} {cat.count === 1 ? 'artículo' : 'artículos'}</p>
              ) : (
                <p class="category-count category-count--empty">Próximamente</p>
              )}
```

- [ ] **Step 2: Update category card CSS**

Replace `.category-card` and `.category-card:hover`:

```css
.category-card {
  background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 4%, var(--color-bg-card));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--color-text);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.category-card:hover {
  border-color: color-mix(in srgb, var(--cat-color) 30%, var(--color-border));
  box-shadow: 0 8px 24px color-mix(in srgb, var(--cat-color) 15%, transparent);
  transform: translateY(-3px);
  color: var(--color-text);
}
```

Replace `.category-icon`:

```css
.category-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 10%, var(--color-bg-card));
  border: 1px solid color-mix(in srgb, var(--cat-color) 15%, transparent);
  border-radius: var(--radius-md);
  color: var(--cat-color, var(--color-text-muted));
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;
}
```

Add the count classes:

```css
.category-count {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--cat-color, var(--color-primary));
  font-weight: 600;
}

.category-count--empty {
  color: var(--color-text-light);
  font-weight: 500;
}
```

- [ ] **Step 3: Build and commit**

Run: `npm run build`

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "style: category cards with unique gradients and glow hover"
```

---

### Task 9: Typography — H2 accent border + section spacing

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add H2 left border in prose**

Find `.prose h2` in global.css and add:

```css
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
```

Add dark mode variant:

```css
[data-theme="dark"] .prose h2 {
  border-left-color: var(--color-primary-light);
}
```

- [ ] **Step 2: Increase section spacing**

Replace `.section` padding:

```css
.section {
  padding-block: 4.5rem;
}
```

- [ ] **Step 3: Update prefers-reduced-motion for new hero animations**

In the `@media (prefers-reduced-motion: reduce)` block, add `.hero-bento-card` and `.hero-bento-featured` to the transition: none list.

- [ ] **Step 4: Build and commit**

Run: `npm run build`

```bash
git add src/styles/global.css
git commit -m "style: H2 accent borders and increased section spacing"
```

---

### Task 10: Final build + full verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: 0 errors, all pages built.

- [ ] **Step 2: Verify no remaining issues**

Run: `grep -n "transition: all" src/styles/global.css` — expected: no matches.
Run: `grep -rn "seasonal" src/styles/global.css` — expected: no matches (seasonal CSS removed).

- [ ] **Step 3: Commit any cleanup**

If any fixes needed, commit them. Otherwise skip.
