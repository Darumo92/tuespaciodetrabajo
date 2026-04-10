# Visual Redesign — Design Spec

**Date:** 2026-04-10
**Direction:** Premium + Tech/Moderno
**Palette:** Blue (#2563eb) + Rose (#f43f5e) accent
**Dark mode:** Deep (#0a0a14)
**Hero:** Bento grid layout

---

## 1. Color System Update

### New tokens in `:root`

```css
--color-rose: #f43f5e;
--color-rose-dark: #e11d48;
--color-rose-light: #fb7185;
```

### Updated dark mode tokens in `[data-theme="dark"]`

```css
--color-bg: #0a0a14;
--color-bg-card: #12121f;
--color-bg-muted: #1a1a2e;
--color-rose: #fb7185;
--color-rose-dark: #f43f5e;
--color-rose-light: #fda4af;
```

Keep all existing blue/amber/green tokens. Rose is additive, not replacement.

**Files:** `src/styles/global.css`

---

## 2. Header — Enhanced Glass

Increase backdrop blur from 12px to 20px. Add subtle bottom gradient border instead of solid border.

```css
.header {
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
}

[data-theme="dark"] .header {
  background: rgba(10, 10, 20, 0.8);
  border-bottom: 1px solid rgba(96, 165, 250, 0.08);
}
```

**Files:** `src/styles/global.css`

---

## 3. Hero — Bento Grid Layout

Complete rewrite of the hero section in `index.astro` and corresponding CSS.

### HTML Structure

```
.hero
  .container
    .hero-grid (2 columns: text | bento)
      .hero-content
        p.hero-eyebrow ("Guías y comparativas 2026")
        h1.hero-title (con span gradient)
        p.hero-subtitle
        .hero-cta (2 buttons: primary + secondary outline)
      .hero-bento (2x2 grid)
        .hero-bento-card (Sillas — links to /sillas/)
        .hero-bento-card (Escritorios — links to /escritorios/)
        .hero-bento-featured (span 2 cols — articulo destacado)
```

### Visual Design

- Background: `linear-gradient(135deg, #f0f4ff, #faf9ff, #fff5f7)` with dot pattern overlay and radial gradient orbs (blue bottom-left, rose top-right)
- Dark mode: `linear-gradient(135deg, #0a0a14, #0f0f1f, #120a14)` with same orbs at lower opacity
- Bento cards: glass effect (`background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(primary, 0.1); border-radius: 14px`)
- Dark bento cards: `background: rgba(255,255,255,0.03)`
- Hero eyebrow: rose color, uppercase, small, letter-spaced
- Hero title gradient: `linear-gradient(135deg, --color-primary, --color-primary-light)`
- Primary CTA: solid blue, `border-radius: 10px`
- Secondary CTA: ghost/outline with blue tint background
- Featured bento card: spans 2 columns, shows icon with gradient bg (blue→rose), title, excerpt, "Leer →" link
- Bento cards link to categories, show emoji icon + category name + product count
- Mobile (≤768px): hero-grid becomes single column, bento grid becomes 2x2 below text

### Data

- Categories and product counts are dynamic (computed from content collections, same as current hero stats)
- Featured article: use the first `destacado: true` article, same logic as current

**Remove:** hero-stats, hero-cat-pills, seasonal banner. The bento grid replaces these.

**Files:** `src/pages/index.astro`, `src/styles/global.css`

---

## 4. Article Cards — Badge on Image + Category Border

### Changes

- Move `.article-card-category` badge from card body to overlay on image (position: absolute, top-left)
- Badge: white text on solid category color background, small pill
- Add `border-left: 4px solid [category-color]` to card body
- Image area: add subtle gradient overlay matching category color at very low opacity
- When no image: keep current placeholder but tint with category color

### Category Colors for borders/badges

Use existing badge colors:
- sillas: #2563eb (blue)
- escritorios: #f59e0b (amber)
- accesorios: #10b981 (green)
- ambiente: #ec4899 (pink)
- audio-video: #8b5cf6 (purple)
- guias: #f43f5e (rose — new)

### CSS

```css
.article-card {
  border-left: 4px solid var(--card-accent, var(--color-primary));
}

.article-card-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2;
  color: #fff;
  /* background set by badge-[categoria] class */
}
```

**Files:** `src/components/ArticleCard.astro`, `src/styles/global.css`

---

## 5. TopPick — Glassmorphism + Glow

### Changes

- Background: glass effect (`rgba(255,255,255,0.8); backdrop-filter: blur(16px)`)
- Border: `2px solid rgba(--color-primary, 0.2)`
- Box shadow: multi-layer glow (`0 8px 32px rgba(primary, 0.1), 0 0 0 1px rgba(primary, 0.05)`)
- Badge: gradient background `linear-gradient(135deg, --color-primary, --color-rose)` instead of solid primary
- Dark mode: glass at `rgba(255,255,255,0.04)`, border at `rgba(primary-light, 0.15)`, glow reduced

**Files:** `src/components/TopPick.astro` (scoped styles), `src/styles/global.css`

---

## 6. Trust Section — Centered Icons with Gradient Backgrounds

### Changes

- Layout: cards become vertical/centered (text-align center)
- Icon containers: 56px, centered, with gradient background (`linear-gradient(135deg, rgba(color, 0.1), rgba(color, 0.05))`)
- Border radius on icon: 14px (squircle)
- Remove top border accent, replace with the icon gradient as the visual differentiator
- Each card uses its own color: primary (blue), rose, green

**Files:** `src/pages/index.astro`, `src/styles/global.css`

---

## 7. Buttons — Border Radius + Gradient CTA

### Changes

- Global: change `border-radius: 100px` (pill) to `border-radius: 10px` on all buttons:
  - `.affiliate-button`
  - `.hero-cta-btn` (now hero CTA buttons)
  - `.comp-sort-btn` — keep pill (100px) for these small filter buttons only
- Keep pill radius for badges and sort buttons
- Add new `.btn-gradient` class for hero primary CTA: `background: linear-gradient(135deg, --color-primary, --color-rose)`
- Secondary hero CTA: ghost style with tinted background `rgba(primary, 0.08)` + subtle border

**Files:** `src/styles/global.css`, `src/pages/index.astro`

---

## 8. Category Cards — Unique Gradients + Glow Hover

### Changes

- Each category card gets a subtle gradient background tint (5% opacity of its category color)
- Category icon background: gradient at 15% opacity of category color
- Hover: increase gradient opacity to 12%, colored glow shadow matching category
- Use CSS custom property `--cat-color` set per card via inline style in the template

```css
.category-card {
  background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 4%, var(--color-bg-card));
}

.category-card:hover {
  box-shadow: 0 8px 24px color-mix(in srgb, var(--cat-color) 15%, transparent);
}
```

**Files:** `src/pages/index.astro` (add --cat-color per card), `src/styles/global.css`

---

## 9. Typography — H2 Accent Border + Spacing

### Changes

- Article H2 headings (`.prose h2`): add left border accent
  ```css
  .prose h2 {
    border-left: 4px solid var(--color-primary);
    padding-left: 0.75rem;
  }
  ```
- Increase section spacing: `.section` padding from 3.5rem to 4.5rem
- Dark mode H2 border: use `var(--color-primary-light)`

**Files:** `src/styles/global.css`

---

## 10. Dark Mode — Deep Background

### Changes

Already covered in section 1 tokens. Additional adjustments:

- `.header` dark: `rgba(10, 10, 20, 0.8)`
- Cards in dark: `background: rgba(255,255,255,0.03)` for glass effect areas (hero bento, TopPick)
- Regular cards (article, category, trust): keep `var(--color-bg-card)` which is now `#12121f`
- Footer dark bg: update `--color-footer-bg` to `#08080f` for deeper contrast

**Files:** `src/styles/global.css`

---

## Scope and Non-Goals

### In scope
- All CSS changes in `global.css`
- HTML restructuring in `index.astro` (hero section)
- Minor template changes in `ArticleCard.astro`, `TopPick.astro`
- Category card template in `index.astro`

### NOT in scope
- Article layout (`Article.astro`) — future improvement
- ComparisonTable redesign — current design works well
- Footer redesign — recently updated with tokens
- Search page — recently cleaned up
- New components or JS logic
- Font changes — Outfit + Inter pair works well

---

## Verification

1. `npm run build` — 0 errors
2. Visual: light mode homepage — hero bento, cards, trust section
3. Visual: dark mode homepage — glass effects, deep background, glows
4. Visual: article page — H2 borders, card badge on image
5. Visual: TopPick — glass effect + glow
6. Responsive: mobile layout (hero stacks, bento 2x2 under text)
7. Accessibility: contrast ratios on new colors (rose on white ≥ 4.5:1)
