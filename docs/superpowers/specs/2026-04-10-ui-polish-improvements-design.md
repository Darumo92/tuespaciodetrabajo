# UI Polish Improvements — Design Spec

**Date:** 2026-04-10
**Scope:** 10 CSS/UI improvements across global.css, Footer.astro, buscar.astro, ComparisonTable.astro
**Approach:** All changes in a single pass — independent CSS edits, one commit

---

## Changes

### #1 Footer dark mode — use CSS tokens (HIGH)

**Problem:** Footer uses hardcoded colors (`#1a1a2e`, `#8e8ea6`, `#f0eff4`, `#2e2e48`) that don't adapt to the theme system.

**Solution:** Add footer-specific custom properties to `:root` and `[data-theme="dark"]`, then replace hardcoded values in `.footer`, `.footer-heading`, `.footer-links a`, `.footer-bottom`, and `[data-theme="dark"] .footer`.

New tokens:
```css
:root {
  --color-footer-bg: #1a1a2e;
  --color-footer-text: #a0a0b8;
  --color-footer-heading: #f0eff4;
  --color-footer-link: #8e8ea6;
  --color-footer-border: #2e2e48;
}

[data-theme="dark"] {
  --color-footer-bg: #0e0e1a;
  --color-footer-text: #a0a0b8;
  --color-footer-heading: #f0eff4;
  --color-footer-link: #b0b0c8;
  --color-footer-border: #1e1e35;
}
```

Also remove inline `style="color: #fff"` and `style="color: #60a5fa"` from `Footer.astro`, replacing with CSS classes `.footer-logo` and `.footer-logo-accent`.

**Files:** `global.css`, `Footer.astro`

---

### #2 Touch targets ≥ 44px (HIGH)

**Problem:** `theme-toggle` has `padding: 0.25rem 0.4rem` (~30px touch area). `bottom-nav-item` has `padding: 0.3rem 0.5rem` (~36px touch area).

**Solution:**
- `.theme-toggle`: increase padding to `0.5rem` (yields ~44px with the 18px icon)
- `.bottom-nav-item`: increase padding to `0.5rem 0.75rem` (yields ~46px height)
- `.nav-search`: verify padding yields ≥44px (currently `0.375rem 0.6rem` — increase to `0.5rem 0.6rem`)

**Files:** `global.css`

---

### #3 Dropdown animation (MEDIUM)

**Problem:** Dropdown menu uses `display: none/block` toggle — appears instantly without transition.

**Solution:** Replace display toggle with opacity + transform + pointer-events + visibility pattern:

```css
.nav-dropdown-menu {
  /* Remove: display: none; */
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-8px);
  pointer-events: none;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out, visibility 0.15s;
}

.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown-menu.open {
  /* Remove: display: block; */
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}
```

Mobile override (≤768px) keeps `display: none/block` since mobile dropdown is inline, not a popover. Reset transform/opacity for mobile:
```css
@media (max-width: 768px) {
  .nav-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
    transition: none;
    display: none;  /* back to display toggle for mobile */
  }
  .nav-dropdown .nav-dropdown-menu.open {
    display: block;
  }
  .nav-dropdown:hover .nav-dropdown-menu {
    display: none;  /* keep existing behavior */
  }
}
```

**Files:** `global.css`

---

### #4 :active state on buttons (MEDIUM)

**Problem:** Buttons have no press feedback — no `:active` state.

**Solution:** Add `transform: scale(0.97)` on `:active` to:
- `.affiliate-button:active`
- `.hero-cta-btn:active`
- `.hero-cat-pill:active`
- `.comp-sort-btn:active`

```css
.affiliate-button:active {
  transform: scale(0.97);
}
```

**Files:** `global.css`, `ComparisonTable.astro` (for `.comp-sort-btn`)

---

### #5 Specific transitions — replace `transition: all` (MEDIUM)

**Problem:** Several elements use `transition: all` which is less performant and can cause unexpected property animations.

**Instances to fix:**

| Selector | Current | Replacement |
|----------|---------|-------------|
| `.nav-link` | `all var(--transition)` | `background var(--transition), color var(--transition)` |
| `.hero-cat-pill` | `all 0.2s ease` | `background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease` |
| `.hero-cta-btn` | `all 0.25s ease` | `background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease` |
| `.affiliate-button` | `all 0.25s ease` | `background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease` |
| `.seasonal-item` | `all 0.2s ease` | `box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease` |
| `.comp-sort-btn` | `all 0.2s` | `background 0.2s ease, color 0.2s ease, border-color 0.2s ease` |
| `.nav-dropdown-item` | `all var(--transition)` | `background var(--transition), color var(--transition)` |

**Files:** `global.css`, `ComparisonTable.astro`

---

### #6 Article cards — refined hover (MEDIUM)

**Problem:** Article card hover uses `transition: all 0.35s cubic-bezier(...)` which is overly broad.

**Solution:** Replace with specific properties and use `ease-out` (element is "entering" its hover state):

```css
.article-card {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}
```

Keep the existing `translateY(-3px)` and shadow values — just make the transition declaration precise.

**Files:** `global.css`

---

### #7 Hero dot pattern — increase contrast (LOW)

**Problem:** The radial-gradient dot pattern at 6% opacity is too subtle on some displays.

**Solution:** Increase from 6% to 8%:

```css
.hero {
  background:
    radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent) 1px, transparent 1px),
    var(--color-bg);
}
```

**Files:** `global.css`

---

### #8 buscar.astro — inline styles → CSS classes (MEDIUM)

**Problem:** Page heading, subtitle, and several UI elements use inline `style=""` attributes instead of CSS classes.

**Elements to fix:**
- `<h1 style="font-size: 2rem; ...">` → class `.search-title`
- `<p style="color: var(--color-text-muted); ...">` → class `.search-subtitle`
- `<div style="position: relative;">` → class `.search-input-wrap`
- `<p style="font-size: 3rem; ...">` (×2) → class `.search-state-icon`
- `<h2 style="font-size: 1.1rem; ...">` → class `.search-state-heading`
- `<div style="display: flex; flex-wrap: wrap; ...">` → class `.search-state-cats`
- Category buttons: `style="font-size: 0.85rem; padding: 0.5rem 1rem;"` → class `.search-cat-btn`
- Error loading: remove inline style, use existing `.text-muted` + class `.search-error`

**Files:** `buscar.astro`

---

### #9 Footer.astro — inline styles → CSS classes (MEDIUM)

**Problem:** Logo in footer uses inline `style="color: #fff"` and `style="color: #60a5fa"`.

**Solution:** Add `.footer-logo` and `.footer-logo-accent` classes. Also move the `style="margin-top: 1rem;"` on the legal nav to a class.

```css
.footer-logo {
  color: var(--color-footer-heading);
}

.footer-logo-accent {
  color: var(--color-primary-light);
}

.footer-legal-nav {
  margin-top: 1rem;
}
```

**Files:** `Footer.astro`, `global.css`

---

### #10 prefers-reduced-motion coverage (HIGH)

**Problem:** Current `prefers-reduced-motion` only covers scroll reveal. New dropdown animation needs coverage too.

**Solution:** Extend the existing media query:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; }
  .reveal.revealed { animation: none; }
  .reveal-group > * { opacity: 1; }

  .nav-dropdown-menu {
    transition: none;
  }

  .article-card,
  .affiliate-button,
  .hero-cta-btn,
  .hero-cat-pill,
  .seasonal-item,
  .trust-card {
    transition: none;
  }
}
```

**Files:** `global.css`

---

## Dropped improvements

- **Skeleton loaders** — Only needed for search page, which already has a text loading state. Not worth the added complexity for a static site.
- **Loading states on affiliate buttons** — These are `<a>` tags opening in new tabs. No actual loading state to show.
- **Disclaimer animation** — Static content visible on scroll. Animating it would add unnecessary motion to content users see frequently.

## Verification

After implementation:
1. `npm run build` — must pass without errors
2. Visual check: light mode + dark mode footer consistency
3. Visual check: dropdown animation on desktop
4. Visual check: button :active states
5. Accessibility: verify touch targets ≥ 44px via DevTools
6. Accessibility: verify `prefers-reduced-motion` disables animations
