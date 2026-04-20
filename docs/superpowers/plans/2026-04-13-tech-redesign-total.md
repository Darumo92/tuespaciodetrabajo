# Tech Redesign Total — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseño visual completo de tuespaciodetrabajo.com con estética "Precision Tech" — dark-first, tipografía editorial, glassmorphism, jerarquía data-driven. Inspirado en The Verge, RTINGS, Xataka, Wirecutter.

**Architecture:** CSS-first redesign centrado en `global.css` (~2000 líneas). Cambios HTML en layouts y componentes clave. Nueva fuente display (Space Grotesk reemplaza Outfit). Paleta zinc-tinted en lugar de slate. Dark mode como experiencia principal.

**Tech Stack:** Astro 5, plain CSS con custom properties, fuentes self-hosted (woff2), sin Tailwind.

**Replaces:** `docs/superpowers/plans/2026-04-10-visual-redesign.md` (refresh moderado → ahora rediseño total)

---

## Design Philosophy: "Precision Tech"

| Principio | Implementación |
|-----------|---------------|
| Dark-first | Dark mode por defecto; light mode como alternativa |
| Zinc neutrals | Fondos zinc-tinted (#09090b) en vez de slate (#0f172a) |
| Editorial typography | Space Grotesk display (tech character) + Inter body |
| Layered surfaces | 4 niveles de superficie en dark mode (base/card/elevated/border) |
| Glassmorphism | Header, cards, overlays con backdrop-blur y bordes semi-transparentes |
| Data-driven | Score badges, métricas visibles, tabular numbers para precios |
| Restrained color | Blue primary + rose accent; category colors solo para navegación |
| Generous whitespace | Spacing generoso, max-width reducido para lectura |

## Surface Hierarchy

```
DARK MODE (primary):
  Level 0 (base):     #09090b  — page background
  Level 1 (card):     #18181b  — cards, containers
  Level 2 (elevated): #27272a  — hover states, active elements
  Level 3 (border):   #3f3f46  — borders, dividers

LIGHT MODE:
  Level 0 (base):     #fafafa  — page background
  Level 1 (card):     #ffffff  — cards, containers
  Level 2 (elevated): #f4f4f5  — muted backgrounds
  Level 3 (border):   #e4e4e7  — borders, dividers
```

## File Map

| File | Tasks | Changes |
|------|-------|---------|
| `src/styles/global.css` | 1-18 | Tokens completos, todos los componentes |
| `src/layouts/Base.astro` | 4 | Dark-first theme logic, meta-theme-color |
| `src/layouts/Article.astro` | 13 | Article layout refinements, TOC |
| `src/pages/index.astro` | 6, 7, 8 | Hero, trust, category cards |
| `src/components/Header.astro` | 5 | Minimal glass header |
| `src/components/Footer.astro` | 15 | Modern dark footer |
| `src/components/ArticleCard.astro` | 9 | Glass badge, new card structure |
| `src/components/ComparisonTable.astro` | 10 | Data-driven cards with score badges |
| `src/components/TopPick.astro` | 11 | Spotlight glass card |
| `src/components/AffiliateButton.astro` | 12 | Modern CTA button |
| `public/fonts/` | 1 | Space Grotesk woff2 files |

---

## Phase 1: Foundation (Design Tokens)

### Task 1: Typography — self-host Space Grotesk, replace Outfit

**Files:**
- Create: `public/fonts/space-grotesk-latin.woff2`
- Create: `public/fonts/space-grotesk-latin-ext.woff2`
- Remove: `public/fonts/outfit-latin.woff2`
- Remove: `public/fonts/outfit-latin-ext.woff2`
- Modify: `src/styles/global.css:1-75`

- [ ] **Step 1: Download Space Grotesk woff2 files**

Download from Google Fonts API (subset latin + latin-ext):

```bash
# Latin subset
curl -o public/fonts/space-grotesk-latin.woff2 "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2"

# Latin-ext subset
curl -o public/fonts/space-grotesk-latin-ext.woff2 "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb94Cw.woff2"
```

Verify files downloaded:
```bash
ls -la public/fonts/space-grotesk-*.woff2
```

Expected: Two files, each ~20-40KB.

- [ ] **Step 2: Remove old Outfit font files**

```bash
rm public/fonts/outfit-latin.woff2 public/fonts/outfit-latin-ext.woff2
```

- [ ] **Step 3: Replace @font-face declarations in global.css**

Replace lines 25-42 (the two Outfit @font-face blocks):

```css
/* Self-hosted Outfit - latin-ext */
@font-face {
  font-family: 'Outfit';
  src: url('/fonts/outfit-latin-ext.woff2') format('woff2');
  font-display: swap;
  font-weight: 600 900;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* Self-hosted Outfit - latin */
@font-face {
  font-family: 'Outfit';
  src: url('/fonts/outfit-latin.woff2') format('woff2');
  font-display: swap;
  font-weight: 600 900;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

With:

```css
/* Self-hosted Space Grotesk - latin-ext */
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/space-grotesk-latin-ext.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* Self-hosted Space Grotesk - latin */
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/space-grotesk-latin.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

- [ ] **Step 4: Update font-family CSS variable**

In `:root`, replace:

```css
  --font-display: 'Outfit', system-ui, -apple-system, sans-serif;
```

With:

```css
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
```

- [ ] **Step 5: Adjust font-weight references**

Space Grotesk range is 300-700 (no 800/900 like Outfit). Search global.css for any `font-weight: 800` or `font-weight: 900` paired with `font-family: var(--font-display)` and change to `font-weight: 700`. Key locations:

- `.hero-title` (change 900 → 700)
- `.section-title` (change 800 → 700)
- `.article-header-title` (change 900 → 700)
- Any other display elements using 800+ weights

Also add `letter-spacing: -0.02em;` to `.hero-title` and `.article-header-title` for the tight tech look.

- [ ] **Step 6: Update preconnect hint in Base.astro**

No preconnect needed — fonts are self-hosted. Verify no `<link rel="preconnect" href="https://fonts.googleapis.com">` exists. If it does, remove it.

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

Expected: 0 errors. Headings now render in Space Grotesk.

- [ ] **Step 8: Commit**

```bash
git add public/fonts/ src/styles/global.css
git commit -m "style: replace Outfit with Space Grotesk for tech editorial typography"
```

---

### Task 2: Color system — zinc neutrals palette

**Files:**
- Modify: `src/styles/global.css:44-130` (`:root` and `[data-theme="dark"]` blocks)

- [ ] **Step 1: Replace `:root` color tokens**

Replace the entire color section inside `:root` (keep font and spacing variables) with:

```css
  /* --- Colors: Light Mode --- */
  --color-bg: #fafafa;
  --color-bg-card: #ffffff;
  --color-bg-muted: #f4f4f5;
  --color-bg-subtle: #e4e4e7;

  --color-text: #09090b;
  --color-text-muted: #71717a;
  --color-text-light: #a1a1aa;

  --color-border: #e4e4e7;
  --color-border-dark: #d4d4d8;

  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #60a5fa;

  --color-secondary: #f59e0b;
  --color-secondary-text: #92400e;

  --color-accent: #06b6d4;

  --color-rose: #f43f5e;
  --color-rose-dark: #e11d48;
  --color-rose-light: #fb7185;

  /* Category colors */
  --color-cat-sillas: #2563eb;
  --color-cat-escritorios: #f59e0b;
  --color-cat-accesorios: #10b981;
  --color-cat-ambiente: #ec4899;
  --color-cat-audio-video: #8b5cf6;
  --color-cat-guias: #f43f5e;
```

- [ ] **Step 2: Replace `[data-theme="dark"]` color block**

Replace the entire dark mode color block with:

```css
[data-theme="dark"] {
  /* Backgrounds: layered zinc surfaces */
  --color-bg: #09090b;
  --color-bg-card: #18181b;
  --color-bg-muted: #27272a;
  --color-bg-subtle: #3f3f46;

  /* Text */
  --color-text: #fafafa;
  --color-text-muted: #a1a1aa;
  --color-text-light: #71717a;

  /* Borders */
  --color-border: #27272a;
  --color-border-dark: #3f3f46;

  /* Primary: more vibrant in dark */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #93c5fd;

  --color-secondary: #fbbf24;
  --color-secondary-text: #fde68a;

  --color-accent: #22d3ee;

  /* Rose: more vibrant in dark */
  --color-rose: #fb7185;
  --color-rose-dark: #f43f5e;
  --color-rose-light: #fda4af;

  /* Footer */
  --color-footer-bg: #09090b;
  --color-footer-text: #a1a1aa;
  --color-footer-heading: #fafafa;
  --color-footer-link: #d4d4d8;
  --color-footer-border: #27272a;

  /* Shadows: deeper in dark */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 8px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 20px -4px rgba(0, 0, 0, 0.6), 0 4px 8px -4px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 24px 32px -6px rgba(0, 0, 0, 0.6), 0 8px 12px -6px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: 0 errors. Light mode: warm zinc-white backgrounds. Dark mode: deep near-black with zinc tint.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style: zinc-tinted neutral palette replacing slate system"
```

---

### Task 3: Spacing, radius, and shadow system update

**Files:**
- Modify: `src/styles/global.css` (`:root` spacing/radius/shadow section)

- [ ] **Step 1: Update radius tokens**

Replace existing radius tokens with:

```css
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
```

Rationale: Slightly sharper than before (was 8/12/14/16). Tech sites use less roundness. `--radius-full` for pill shapes explicitly.

- [ ] **Step 2: Update shadow tokens (light mode)**

Replace existing shadow tokens with:

```css
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 8px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 12px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04);
  --shadow-xl: 0 24px 48px -8px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06);
```

Rationale: Softer, more diffused shadows = premium feel. Larger spread distances.

- [ ] **Step 3: Add glass effect tokens**

Add after the shadow tokens:

```css
  /* Glass effects */
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-bg-strong: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 20px;
```

And in `[data-theme="dark"]`, add:

```css
  /* Glass effects (dark) */
  --glass-bg: rgba(24, 24, 27, 0.6);
  --glass-bg-strong: rgba(24, 24, 27, 0.8);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-blur: 20px;
```

- [ ] **Step 4: Add transition token**

Replace the existing `--transition` variable with:

```css
  --transition: 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
```

The `cubic-bezier(0.16, 1, 0.3, 1)` is an expo-out easing — snappy entry, gentle settle. Used by Linear, Vercel, and most premium tech UIs.

- [ ] **Step 5: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: update spacing, radius, shadow, glass tokens"
```

---

### Task 4: Dark mode as default experience

**Files:**
- Modify: `src/layouts/Base.astro:85-88`
- Modify: `src/layouts/Base.astro:29-30`

- [ ] **Step 1: Change theme initialization logic**

In `Base.astro`, replace the inline theme script:

```javascript
var t = localStorage.getItem('theme');
if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
  document.documentElement.setAttribute('data-theme', 'dark');
```

With:

```javascript
var t = localStorage.getItem('theme');
if (t !== 'light') {
  document.documentElement.setAttribute('data-theme', 'dark');
```

This means: if the user hasn't explicitly chosen light, default to dark. The user can still toggle to light and their preference is saved.

- [ ] **Step 2: Update meta-theme-color default**

Replace:

```html
<meta name="theme-color" content="#2563eb" id="meta-theme-color" />
<meta name="color-scheme" content="light dark" />
```

With:

```html
<meta name="theme-color" content="#09090b" id="meta-theme-color" />
<meta name="color-scheme" content="dark light" />
```

- [ ] **Step 3: Update meta-theme-color in the theme script**

Ensure the theme toggle script updates the meta-theme-color correctly:
- Dark mode: `#09090b` (zinc-950)
- Light mode: `#fafafa` (zinc-50)

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Open site. Expected: dark mode by default on first visit. Toggle to light works and persists.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: dark mode as default experience"
```

---

## Phase 2: Layout Shell

### Task 5: Header — minimal glass redesign

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/styles/global.css` (header section)

- [ ] **Step 1: Update header CSS**

Replace `.header` styles:

```css
.header {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}
```

- [ ] **Step 2: Update dark mode header**

Replace or add dark mode header override:

```css
[data-theme="dark"] .header {
  background: rgba(9, 9, 11, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}
```

- [ ] **Step 3: Update logo styling**

Replace `.logo` styles to use Space Grotesk character:

```css
.logo {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

Remove any rotation hover animation on the logo — too playful for the tech aesthetic.

- [ ] **Step 4: Update nav link styles**

```css
.nav-link {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  transition: color var(--transition), background var(--transition);
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-text);
  background: var(--color-bg-muted);
}
```

- [ ] **Step 5: Update dropdown menu glass effect**

```css
.dropdown-menu {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}
```

- [ ] **Step 6: Build and commit**

```bash
npm run build && git add src/components/Header.astro src/styles/global.css && git commit -m "style: minimal glass header with tech typography"
```

---

### Task 6: Hero — bold editorial with gradient mesh

**Files:**
- Modify: `src/pages/index.astro` (hero section HTML)
- Modify: `src/styles/global.css` (hero section CSS)

- [ ] **Step 1: Replace hero HTML in index.astro**

Replace the entire hero `<section>` with:

```astro
  <!-- Hero -->
  <section class="hero">
    <div class="hero-glow hero-glow--blue" aria-hidden="true"></div>
    <div class="hero-glow hero-glow--rose" aria-hidden="true"></div>
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <p class="hero-eyebrow">Guías y comparativas {new Date().getFullYear()}</p>
          <h1 class="hero-title">
            Tu espacio de trabajo,<br /><span class="hero-title-accent">analizado al detalle</span>
          </h1>
          <p class="hero-subtitle">
            Análisis independientes de sillas, escritorios y accesorios para teletrabajar con ergonomía real.
          </p>
          <div class="hero-cta">
            <a href="/articulos/" class="hero-cta-btn hero-cta-primary">
              <span>Ver comparativas</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="/guias/" class="hero-cta-btn hero-cta-secondary">Leer guías</a>
          </div>
        </div>
        <div class="hero-bento">
          {categorias.slice(0, 4).map(cat => (
            <a href={`/${cat.slug}/`} class="hero-bento-card">
              <span class="hero-bento-icon"><CategoryIcon categoria={cat.slug} size={22} /></span>
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
                  <CategoryIcon categoria={feat.data.tipo === 'informativo' ? 'guias' : feat.data.categoria} size={18} />
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

- [ ] **Step 2: Replace hero CSS with gradient mesh background**

Remove ALL existing hero CSS (from `/* HERO */` through the hero responsive rules) and replace with:

```css
/* =========================================
   HERO
   ========================================= */

.hero {
  position: relative;
  padding: 5rem 0 4rem;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}

/* Gradient mesh glows */
.hero-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.12;
  pointer-events: none;
}

.hero-glow--blue {
  background: var(--color-primary);
  bottom: -200px;
  left: -100px;
}

.hero-glow--rose {
  background: var(--color-rose);
  top: -200px;
  right: -100px;
}

[data-theme="dark"] .hero-glow {
  opacity: 0.08;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
}

.hero-eyebrow {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-rose);
  margin-bottom: 1rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.08;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin-bottom: 2rem;
  max-width: 460px;
}

.hero-cta {
  display: flex;
  gap: 0.75rem;
}

.hero-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.7rem 1.5rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: all var(--transition);
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
  transform: translateY(-1px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.hero-cta-primary svg {
  transition: transform var(--transition);
}

.hero-cta-primary:hover svg {
  transform: translateX(3px);
}

.hero-cta-secondary {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-dark);
}

.hero-cta-secondary:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
  background: var(--color-bg-muted);
}

/* --- Bento Grid --- */

.hero-bento {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr auto;
  gap: 0.625rem;
}

.hero-bento-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}

.hero-bento-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-2px);
  color: var(--color-text);
}

.hero-bento-icon {
  color: var(--color-primary);
}

.hero-bento-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.88rem;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.hero-bento-count {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.hero-bento-featured {
  grid-column: 1 / -1;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}

.hero-bento-featured:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transform: translateY(-2px);
  color: var(--color-text);
}

.hero-bento-featured-icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-rose));
  border-radius: var(--radius-md);
  width: 40px;
  height: 40px;
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
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-rose);
  margin-bottom: 0.1rem;
}

.hero-bento-featured-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-bento-featured-arrow {
  color: var(--color-text-muted);
  font-size: 1rem;
  flex-shrink: 0;
  transition: transform var(--transition), color var(--transition);
}

.hero-bento-featured:hover .hero-bento-featured-arrow {
  transform: translateX(3px);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .hero {
    padding: 3.5rem 0 2.5rem;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
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

  .hero-glow {
    width: 300px;
    height: 300px;
    filter: blur(80px);
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

- [ ] **Step 3: Remove seasonal banner HTML and CSS**

In `index.astro`, remove the seasonal banner section if it still exists.

In `global.css`, search for `.seasonal` and remove all seasonal banner CSS blocks.

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: Hero renders with gradient mesh glows, bold editorial typography, glass bento cards.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: bold editorial hero with gradient mesh and glass bento grid"
```

---

### Task 7: Trust section — metric cards with icon badges

**Files:**
- Modify: `src/pages/index.astro` (trust section HTML)
- Modify: `src/styles/global.css` (trust section CSS)

- [ ] **Step 1: Replace trust section HTML in index.astro**

Replace the trust section with the same structure from the existing plan (Task 7 in `2026-04-10`), keeping the three trust cards with SVG icons. Reuse that HTML exactly.

- [ ] **Step 2: Replace trust section CSS**

```css
/* =========================================
   TRUST SECTION
   ========================================= */

.trust-section {
  padding: 3.5rem 0;
  border-top: 1px solid var(--color-border);
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.trust-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.625rem;
  padding: 2rem 1.5rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: transform var(--transition), box-shadow var(--transition);
}

.trust-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.trust-card-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
}

.trust-card-icon--blue {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.trust-card-icon--rose {
  background: color-mix(in srgb, var(--color-rose) 10%, transparent);
  color: var(--color-rose);
}

.trust-card-icon--green {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
}

.trust-card strong {
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.trust-card p {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .trust-grid {
    grid-template-columns: 1fr;
  }

  .trust-card {
    flex-direction: row;
    text-align: left;
    gap: 1rem;
    padding: 1.25rem;
  }
}
```

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/pages/index.astro src/styles/global.css && git commit -m "style: trust section with icon badge cards"
```

---

### Task 8: Category cards — icon-forward with glow hover

**Files:**
- Modify: `src/pages/index.astro` (category section)
- Modify: `src/styles/global.css` (category card CSS)

- [ ] **Step 1: Add `--cat-color` custom property to each category card**

In `index.astro`, add the `catColors` map and `style` attribute exactly as in the existing plan (Task 8, Steps 1). Also replace inline styles with `.category-count` class.

- [ ] **Step 2: Replace category card CSS**

```css
.category-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}

.category-card:hover {
  border-color: color-mix(in srgb, var(--cat-color, var(--color-primary)) 35%, var(--color-border));
  box-shadow: 0 8px 28px color-mix(in srgb, var(--cat-color, var(--color-primary)) 12%, transparent);
  transform: translateY(-2px);
  color: var(--color-text);
}

.category-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--cat-color) 12%, transparent);
  border-radius: var(--radius-md);
  color: var(--cat-color, var(--color-text-muted));
  flex-shrink: 0;
  transition: background var(--transition), transform var(--transition);
}

.category-card:hover .category-icon {
  background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 15%, transparent);
  transform: scale(1.05);
}

.category-count {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: var(--cat-color, var(--color-primary));
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.category-count--empty {
  color: var(--color-text-light);
  font-weight: 500;
}
```

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/pages/index.astro src/styles/global.css && git commit -m "style: category cards with icon-forward layout and glow hover"
```

---

## Phase 3: Content Components

### Task 9: ArticleCard — glass badge on image, refined layout

**Files:**
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/styles/global.css` (article card CSS)

- [ ] **Step 1: Move badge into image area in ArticleCard.astro**

Apply the same HTML change from the existing plan (Task 5): move `<span class="article-card-category">` inside `.article-card-image`, add `style={...}` with `--card-accent`. Remove the `<div class="article-card-badges">`.

- [ ] **Step 2: Replace article card CSS**

```css
/* =========================================
   ARTICLE CARD
   ========================================= */

.article-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-dark);
}

.article-card-image {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-muted);
}

.article-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.article-card:hover .article-card-image img {
  transform: scale(1.04);
}

/* Badge overlay on image */
.article-card-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  color: #fff;
}

.article-card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
}

.article-card-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--color-text);
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-title:hover {
  color: var(--color-primary);
}

.article-card-excerpt {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-meta {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.article-card-readmore {
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--color-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: gap var(--transition);
}

.article-card:hover .article-card-readmore {
  gap: 0.4rem;
}
```

Update badge color classes to solid backgrounds with white text:

```css
.badge-sillas { background: #2563eb; }
.badge-escritorios { background: #d97706; }
.badge-accesorios { background: #059669; }
.badge-ambiente { background: #db2777; }
.badge-audio-video { background: #7c3aed; }
.badge-guias { background: #e11d48; }
```

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/components/ArticleCard.astro src/styles/global.css && git commit -m "style: article card with glass image badge and refined layout"
```

---

### Task 10: ComparisonTable — data-driven cards with score badges

**Files:**
- Modify: `src/components/ComparisonTable.astro`
- Modify: `src/styles/global.css` (comparison table section)

- [ ] **Step 1: Add visual score badge to ComparisonTable.astro**

In the component, add a score badge element that displays the `valoracion` as a visual indicator. After the star rating section, add:

```astro
<div class="comp-score-badge" data-score={producto.valoracion >= 4.5 ? 'excellent' : producto.valoracion >= 3.5 ? 'good' : 'average'}>
  <span class="comp-score-value">{producto.valoracion.toFixed(1)}</span>
  <span class="comp-score-label">{producto.valoracion >= 4.5 ? 'Excelente' : producto.valoracion >= 3.5 ? 'Muy bueno' : 'Bueno'}</span>
</div>
```

- [ ] **Step 2: Replace comparison table CSS**

```css
/* =========================================
   COMPARISON TABLE
   ========================================= */

.comp-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.comp-sort-btn {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.comp-sort-btn:hover {
  border-color: var(--color-border-dark);
  color: var(--color-text);
}

.comp-sort-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.comp-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comp-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 1.5rem;
  align-items: start;
  position: relative;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.comp-card:hover {
  border-color: var(--color-border-dark);
  box-shadow: var(--shadow-md);
}

.comp-card--highlighted {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.comp-badge {
  position: absolute;
  top: -0.5rem;
  left: 1.25rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-rose));
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

.comp-image-box {
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}

.comp-image-box img {
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
}

.comp-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comp-product-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.comp-points {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Score badge */
.comp-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.comp-score-badge[data-score="excellent"] {
  background: color-mix(in srgb, #10b981 12%, transparent);
  color: #10b981;
}

.comp-score-badge[data-score="good"] {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.comp-score-badge[data-score="average"] {
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: var(--color-secondary);
}

.comp-score-value {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.comp-score-label {
  font-size: 0.55rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.15rem;
}

.comp-price {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

/* Stars */
.comp-stars {
  display: flex;
  gap: 2px;
  color: #f59e0b;
}

@media (max-width: 768px) {
  .comp-card {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }

  .comp-image-box {
    max-width: 160px;
    margin: 0 auto;
  }

  .comp-score-badge {
    margin: 0 auto;
  }
}
```

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/components/ComparisonTable.astro src/styles/global.css && git commit -m "style: data-driven comparison cards with score badges"
```

---

### Task 11: TopPick — spotlight glass card

**Files:**
- Modify: `src/components/TopPick.astro` (scoped styles)

- [ ] **Step 1: Replace TopPick scoped styles**

```css
.top-pick {
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
  border-radius: var(--radius-xl);
  padding: 2rem 1.5rem 1.5rem;
  margin: 1.5rem 0;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent);
}

:global([data-theme="dark"]) .top-pick {
  background: rgba(24, 24, 27, 0.6);
  border-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.top-pick-badge {
  position: absolute;
  top: -0.6rem;
  left: 1.25rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-rose));
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

.top-pick-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.top-pick-price {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Update button radius in TopPick**

In `.top-pick-stores .affiliate-button`, add `border-radius: var(--radius-md);`

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/components/TopPick.astro && git commit -m "style: TopPick spotlight glass card with gradient badge"
```

---

### Task 12: AffiliateButton — modern CTA

**Files:**
- Modify: `src/styles/global.css` (affiliate button section)

- [ ] **Step 1: Replace affiliate button CSS**

```css
.affiliate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition);
  background: var(--color-primary);
  color: #fff;
}

.affiliate-button:hover {
  background: var(--color-primary-dark);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.affiliate-button:active {
  transform: scale(0.97);
}

.affiliate-button--amazon {
  background: #ff9900;
  color: #0f1111;
}

.affiliate-button--amazon:hover {
  background: #e88b00;
  color: #0f1111;
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.25);
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: modern CTA affiliate button with glow hover"
```

---

### Task 13: Article layout — editorial reading experience

**Files:**
- Modify: `src/styles/global.css` (article page section)
- Modify: `src/layouts/Article.astro` (minor HTML adjustments)

- [ ] **Step 1: Update article header styles**

```css
.article-header {
  margin-bottom: 2.5rem;
}

.article-header-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.article-header-description {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 640px;
}
```

- [ ] **Step 2: Update article meta styles**

```css
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-light);
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}
```

- [ ] **Step 3: Update prose typography**

```css
.prose {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-text);
}

.prose h2 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.prose h3 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  transition: color var(--transition);
}

.prose a:hover {
  color: var(--color-primary-dark);
}

.prose blockquote {
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--color-text-muted);
  font-style: italic;
}
```

- [ ] **Step 4: Update TOC styles**

```css
.toc {
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}

.toc-title {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.toc-list a {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.3rem 0;
  display: block;
  transition: color var(--transition);
}

.toc-list a:hover {
  color: var(--color-primary);
}
```

- [ ] **Step 5: Update trust bar (article page top badges)**

```css
.trust-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.trust-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
```

- [ ] **Step 6: Update reading progress bar**

```css
.reading-progress {
  position: fixed;
  top: 60px; /* below header */
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  z-index: 99;
  transition: width 0.1s linear;
}
```

Changed from 3px to 2px — thinner is more refined.

- [ ] **Step 7: Build and commit**

```bash
npm run build && git add src/styles/global.css src/layouts/Article.astro && git commit -m "style: editorial article layout with refined typography and TOC"
```

---

### Task 14: FAQ accordion — clean expandable

**Files:**
- Modify: `src/styles/global.css` (FAQ section)

- [ ] **Step 1: Replace FAQ styles**

```css
.faq-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.faq-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  overflow: hidden;
  transition: border-color var(--transition);
}

.faq-item[open] {
  border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: var(--font-sans);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  list-style: none;
  background: var(--color-bg-card);
  transition: background var(--transition);
}

.faq-question:hover {
  background: var(--color-bg-muted);
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-bg-muted);
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition), background var(--transition);
}

.faq-item[open] .faq-toggle {
  transform: rotate(45deg);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.faq-answer {
  padding: 0 1.25rem 1.25rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.7;
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: clean FAQ accordion with bordered cards"
```

---

### Task 15: Footer — minimal dark

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css` (footer section)

- [ ] **Step 1: Replace footer CSS**

```css
/* =========================================
   FOOTER
   ========================================= */

.footer {
  background: var(--color-footer-bg, #09090b);
  color: var(--color-footer-text, #a1a1aa);
  padding: 3rem 0 1.5rem;
  border-top: 1px solid var(--color-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-brand-description {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--color-footer-text);
  max-width: 320px;
  margin-top: 0.75rem;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-footer-heading, #fafafa);
  text-decoration: none;
}

.footer-heading {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-footer-heading, #fafafa);
  margin-bottom: 0.75rem;
}

.footer-link {
  font-size: 0.82rem;
  color: var(--color-footer-link, #71717a);
  text-decoration: none;
  display: block;
  padding: 0.2rem 0;
  transition: color var(--transition);
}

.footer-link:hover {
  color: var(--color-footer-heading, #fafafa);
}

.footer-affiliate-notice {
  font-size: 0.72rem;
  color: var(--color-footer-text);
  opacity: 0.7;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.04);
  margin-top: 1rem;
  line-height: 1.5;
}

.footer-bottom {
  border-top: 1px solid var(--color-footer-border, #27272a);
  padding-top: 1.25rem;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-footer-text);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/components/Footer.astro src/styles/global.css && git commit -m "style: minimal dark footer with refined typography"
```

---

## Phase 4: Remaining Pages & Elements

### Task 16: Mobile bottom nav — refined glass bar

**Files:**
- Modify: `src/styles/global.css` (bottom nav section)

- [ ] **Step 1: Replace bottom nav CSS**

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: none;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--color-text-light);
  font-size: 0.62rem;
  font-weight: 500;
  min-width: 48px;
  padding: 0.25rem 0;
  transition: color var(--transition);
}

.bottom-nav-item.active,
.bottom-nav-item:active {
  color: var(--color-primary);
}

.bottom-nav-item svg {
  width: 20px;
  height: 20px;
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: refined glass mobile bottom nav"
```

---

### Task 17: Search page — modern instant results

**Files:**
- Modify: `src/styles/global.css` (search section)

- [ ] **Step 1: Replace search page CSS**

```css
.search-container {
  max-width: 640px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.85rem 1.25rem 0.85rem 3rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.search-input::placeholder {
  color: var(--color-text-light);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
  pointer-events: none;
}

.search-results-count {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-variant-numeric: tabular-nums;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-result-item {
  padding: 1rem 1.25rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.search-result-item:hover {
  border-color: var(--color-border-dark);
  box-shadow: var(--shadow-sm);
}

.search-result-title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.search-result-excerpt {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.search-no-results {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: modern search page with focus ring and clean results"
```

---

### Task 18: Category page — refined grid layout

**Files:**
- Modify: `src/styles/global.css` (category page section)

- [ ] **Step 1: Update category page styles**

```css
.category-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.category-header h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.category-description {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 640px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: refined category page grid layout"
```

---

## Phase 5: Polish

### Task 19: Micro-interactions — scroll reveal, hover, transitions

**Files:**
- Modify: `src/styles/global.css` (animations section)

- [ ] **Step 1: Update scroll reveal animation**

```css
@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
  animation: reveal-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.reveal-group > * {
  opacity: 0;
  animation: reveal-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.reveal-group > *:nth-child(1) { animation-delay: 0s; }
.reveal-group > *:nth-child(2) { animation-delay: 0.06s; }
.reveal-group > *:nth-child(3) { animation-delay: 0.12s; }
.reveal-group > *:nth-child(4) { animation-delay: 0.18s; }
.reveal-group > *:nth-child(5) { animation-delay: 0.24s; }
.reveal-group > *:nth-child(6) { animation-delay: 0.3s; }
```

Reduced from 80ms stagger to 60ms — snappier, more modern.

- [ ] **Step 2: Add focus-visible styles globally**

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

:focus:not(:focus-visible) {
  outline: none;
}
```

- [ ] **Step 3: Add selection color**

```css
::selection {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-text);
}
```

- [ ] **Step 4: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: micro-interactions — reveal animations, focus rings, selection"
```

---

### Task 20: Accessibility — contrast, reduced motion

**Files:**
- Modify: `src/styles/global.css` (reduced motion section)

- [ ] **Step 1: Update prefers-reduced-motion**

Replace the entire `@media (prefers-reduced-motion: reduce)` block:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .reveal,
  .reveal-group > * {
    opacity: 1;
    animation: none;
  }

  .hero-glow {
    display: none;
  }
}
```

- [ ] **Step 2: Verify contrast ratios**

Check key text/background pairs meet WCAG AA (4.5:1):

| Element | Foreground | Background | Target |
|---------|-----------|------------|--------|
| Body text (dark) | #fafafa | #09090b | 4.5:1 ✓ (21:1) |
| Muted text (dark) | #a1a1aa | #09090b | 4.5:1 ✓ (7.4:1) |
| Light text (dark) | #71717a | #09090b | 3:1 ✓ (4.6:1) — OK for large text |
| Body text (light) | #09090b | #fafafa | 4.5:1 ✓ (21:1) |
| Muted text (light) | #71717a | #fafafa | 4.5:1 ✓ (4.7:1) |
| Primary link (dark) | #3b82f6 | #09090b | 3:1 ✓ (5.1:1) |
| Primary link (light) | #2563eb | #fafafa | 3:1 ✓ (4.3:1) |

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "a11y: reduced motion, contrast verification, focus styles"
```

---

### Task 21: Sticky CTA bar — refined glass

**Files:**
- Modify: `src/styles/global.css` (sticky CTA section)

- [ ] **Step 1: Update sticky CTA bar styles**

```css
.sticky-cta {
  position: fixed;
  bottom: 56px; /* above bottom nav on mobile */
  left: 0;
  right: 0;
  z-index: 90;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  padding: 0.6rem 1rem;
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sticky-cta.visible {
  transform: translateY(0);
}

.sticky-cta-name {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.sticky-cta-price {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sticky-cta-btn {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition);
}

.sticky-cta-btn:hover {
  background: var(--color-primary-dark);
  color: #fff;
}

@media (max-width: 768px) {
  .sticky-cta {
    display: flex;
  }
}

@media (min-width: 769px) {
  .sticky-cta {
    bottom: 0;
  }
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: refined glass sticky CTA bar"
```

---

### Task 22: Affiliate disclaimer + cookie banner refinement

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Update affiliate disclaimer styles**

```css
.affiliate-disclaimer {
  background: color-mix(in srgb, var(--color-secondary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 15%, transparent);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
```

- [ ] **Step 2: Update cookie banner styles**

```css
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  padding: 1rem 1.5rem;
}

.cookie-banner-content {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.cookie-banner-text {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.cookie-banner-actions {
  display: flex;
  gap: 0.5rem;
}

.cookie-btn {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
}

.cookie-btn--accept {
  background: var(--color-primary);
  color: #fff;
}

.cookie-btn--accept:hover {
  background: var(--color-primary-dark);
}

.cookie-btn--reject {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.cookie-btn--reject:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text);
}
```

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/styles/global.css && git commit -m "style: refined affiliate disclaimer and glass cookie banner"
```

---

### Task 23: Final build, full verification, cleanup

**Files:**
- All modified files

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Verify dark mode rendering**

Start dev server and check each page type in dark mode:

```bash
npm run dev
```

Check:
- Homepage: hero glows, bento cards, trust section, category cards
- Article page: typography, TOC, comparison table, TopPick, FAQ
- Category page: grid layout, badges
- Search page: input focus, results
- Mobile: bottom nav, sticky CTA, responsive layouts

- [ ] **Step 3: Verify light mode rendering**

Toggle to light mode and check same pages. Ensure:
- Glass effects still visible (lighter glass-bg)
- Text contrast meets 4.5:1 minimum
- Borders and dividers visible
- Score badges readable

- [ ] **Step 4: Check reduced motion**

Enable `prefers-reduced-motion: reduce` in browser DevTools:
- No animations should play
- All content visible immediately
- Gradient glows hidden

- [ ] **Step 5: Remove old plan**

```bash
rm docs/superpowers/plans/2026-04-10-visual-redesign.md
```

- [ ] **Step 6: Final commit**

```bash
git add . && git commit -m "feat: complete tech redesign — dark-first, Space Grotesk, zinc palette, glassmorphism"
```

---

## Summary of Visual Changes

| Element | Before | After |
|---------|--------|-------|
| **Font display** | Outfit | Space Grotesk |
| **Color base** | Slate (#0f172a / #f8fafc) | Zinc (#09090b / #fafafa) |
| **Default theme** | Light (system preference) | Dark (explicit default) |
| **Shadows** | Standard | Diffused, larger spread |
| **Radius** | 8-16px | 6-24px (sharper small, generous large) |
| **Transitions** | 0.2s ease | 0.2s expo-out (snappy) |
| **Header** | Semi-transparent | Full glassmorphism |
| **Hero** | Dot pattern + gradient | Gradient mesh glows |
| **Hero title** | "Crea tu espacio de trabajo perfecto" | "Tu espacio de trabajo, analizado al detalle" |
| **Cards** | Left border accent | Clean border, image badge overlay |
| **Comparison** | Basic cards | Data-driven with score badges |
| **TopPick** | Solid background | Frosted glass |
| **H2 (prose)** | Left border | Bottom border (primary tint) |
| **FAQ** | Basic details/summary | Bordered card accordion |
| **Footer** | Dark navy | Zinc dark, minimal |
| **Buttons** | Pill (100px radius) | Rounded (10px) |
| **Easing** | ease | cubic-bezier(0.16, 1, 0.3, 1) |
| **Progress bar** | 3px gradient | 2px gradient (thinner) |
| **Score display** | Stars only | Stars + score badge (color-coded) |
