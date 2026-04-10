# UI Polish Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 10 CSS/UI polish improvements to tuespaciodetrabajo.com — better dark mode, touch targets, animations, transitions, and code cleanup.

**Architecture:** All changes are independent CSS edits across 4 files. No new components, no JS logic changes. The site is a static Astro 5 site using plain CSS with custom properties.

**Tech Stack:** Astro 5, plain CSS, no Tailwind. Build: `npm run build`. Deploy: Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-04-10-ui-polish-improvements-design.md`

---

## File Map

| File | Changes |
|------|---------|
| `src/styles/global.css` | Tasks 1-7 (footer tokens, touch targets, dropdown anim, :active, transitions, cards, hero, reduced-motion) |
| `src/components/Footer.astro` | Task 1 (remove inline styles, use CSS classes) |
| `src/pages/buscar.astro` | Task 6 (inline styles → CSS classes) |
| `src/components/ComparisonTable.astro` | Task 4 (:active + transition fix for sort buttons) |

---

### Task 1: Footer — dark mode tokens + inline styles cleanup

**Files:**
- Modify: `src/styles/global.css` (`:root`, `[data-theme="dark"]`, `.footer` section, `[data-theme="dark"] .footer` section)
- Modify: `src/components/Footer.astro` (remove inline `style` attributes)

- [ ] **Step 1: Add footer tokens to `:root`**

In `src/styles/global.css`, after the existing `--radius-xl: 16px;` line (line ~75), add:

```css
  --color-footer-bg: #1a1a2e;
  --color-footer-text: #a0a0b8;
  --color-footer-heading: #f0eff4;
  --color-footer-link: #8e8ea6;
  --color-footer-border: #2e2e48;
```

- [ ] **Step 2: Add footer tokens to `[data-theme="dark"]`**

In `src/styles/global.css`, after `--shadow-xl` in the dark theme block (line ~105), add:

```css
  --color-footer-bg: #0e0e1a;
  --color-footer-text: #a0a0b8;
  --color-footer-heading: #f0eff4;
  --color-footer-link: #b0b0c8;
  --color-footer-border: #1e1e35;
```

- [ ] **Step 3: Update `.footer` rules to use tokens**

Replace the hardcoded colors in the footer section:

```css
.footer {
  background: var(--color-footer-bg);
  color: var(--color-footer-text);
  padding: 3.5rem 0 2rem;
  margin-top: 3rem;
}
```

```css
.footer-heading {
  color: var(--color-footer-heading);
  /* rest unchanged */
}
```

```css
.footer-links a {
  color: var(--color-footer-link);
  /* rest unchanged */
}
```

```css
.footer-bottom {
  border-top: 1px solid var(--color-footer-border);
  /* rest unchanged */
}
```

- [ ] **Step 4: Update dark mode footer override**

Replace `[data-theme="dark"] .footer { background: #0e0e1a; }` with:

```css
[data-theme="dark"] .footer a {
  color: var(--color-footer-link);
}

[data-theme="dark"] .footer a:hover {
  color: var(--color-footer-heading);
}
```

Remove the separate `[data-theme="dark"] .footer { background: #0e0e1a; }` rule — the token handles it now.

- [ ] **Step 5: Add footer logo classes to `global.css`**

Add after the `.footer-affiliate-notice` block:

```css
.footer-logo {
  color: var(--color-footer-heading);
}

.footer-logo:hover {
  color: var(--color-footer-heading);
}

.footer-logo-accent {
  color: var(--color-primary-light);
}

.footer-legal-nav {
  margin-top: 1rem;
}
```

- [ ] **Step 6: Clean up Footer.astro inline styles**

In `src/components/Footer.astro`, replace:

```html
<a href="/" class="logo" style="color: #fff;">
  <LogoIcon size={28} />
  Tu Espacio de <span style="color: #60a5fa">Trabajo</span>
</a>
```

With:

```html
<a href="/" class="logo footer-logo">
  <LogoIcon size={28} />
  Tu Espacio de <span class="footer-logo-accent">Trabajo</span>
</a>
```

Replace:

```html
<nav aria-label="Informacion legal" style="margin-top: 1rem;">
```

With:

```html
<nav aria-label="Informacion legal" class="footer-legal-nav">
```

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: Build succeeds. No errors.

---

### Task 2: Touch targets ≥ 44px

**Files:**
- Modify: `src/styles/global.css` (`.theme-toggle`, `.bottom-nav-item`, `.nav-search`)

- [ ] **Step 1: Increase theme-toggle touch area**

Replace:

```css
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: background var(--transition);
  line-height: 1;
}
```

With:

```css
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: background var(--transition);
  line-height: 1;
}
```

- [ ] **Step 2: Increase bottom-nav-item touch area**

Replace:

```css
.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
```

With:

```css
.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
  min-height: 44px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 3: Increase nav-search touch area**

Replace:

```css
.nav-search {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.6rem;
}
```

With:

```css
.nav-search {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.6rem;
  min-width: 44px;
  min-height: 44px;
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 3: Dropdown animation

**Files:**
- Modify: `src/styles/global.css` (`.nav-dropdown-menu`, hover/open rules, mobile override)

- [ ] **Step 1: Replace dropdown display toggle with opacity/transform**

Replace:

```css
.nav-dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 230px;
  padding: 0.5rem;
  z-index: 110;
}
```

With:

```css
.nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 230px;
  padding: 0.5rem;
  z-index: 110;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out, visibility 0.15s;
}
```

- [ ] **Step 2: Update hover/open states**

Replace:

```css
.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown-menu.open {
  display: block;
}
```

With:

```css
.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}
```

- [ ] **Step 3: Update mobile override**

Replace the mobile dropdown rules (inside `@media (max-width: 768px)`):

```css
  .nav-dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 0 0 0 0.5rem;
    min-width: auto;
    background: transparent;
  }
```

With:

```css
  .nav-dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 0 0 0 0.5rem;
    min-width: auto;
    background: transparent;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: none;
    display: none;
  }
```

And replace:

```css
  .nav-dropdown:hover .nav-dropdown-menu {
    display: none;
  }

  .nav-dropdown .nav-dropdown-menu.open {
    display: block;
  }
```

With:

```css
  .nav-dropdown:hover .nav-dropdown-menu {
    display: none;
    transform: none;
  }

  .nav-dropdown .nav-dropdown-menu.open {
    display: block;
    transform: none;
  }
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 4: Button :active states + specific transitions

**Files:**
- Modify: `src/styles/global.css` (multiple button selectors)
- Modify: `src/components/ComparisonTable.astro` (`.comp-sort-btn`)

- [ ] **Step 1: Replace `.nav-link` transition**

Replace:

```css
  transition: all var(--transition);
```

(in `.nav-link` rule) with:

```css
  transition: background var(--transition), color var(--transition);
```

- [ ] **Step 2: Replace `.hero-cat-pill` transition**

Replace:

```css
  transition: all 0.2s ease;
```

(in `.hero-cat-pill` rule) with:

```css
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
```

- [ ] **Step 3: Replace `.hero-cta-btn` transition**

Replace:

```css
  transition: all 0.25s ease;
```

(in `.hero-cta-btn` rule) with:

```css
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
```

- [ ] **Step 4: Replace `.category-card` transition**

Replace:

```css
  transition: all 0.25s ease, background-color 0.3s ease;
```

(in `.category-card` rule) with:

```css
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
```

- [ ] **Step 5: Replace `.category-icon` transition**

Replace:

```css
  transition: all 0.3s ease;
```

(in `.category-icon` rule) with:

```css
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease;
```

- [ ] **Step 6: Replace `.affiliate-button` transition**

Replace:

```css
  transition: all 0.25s ease;
```

(in `.affiliate-button` rule) with:

```css
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
```

- [ ] **Step 7: Replace `.seasonal-item` transition**

Replace:

```css
  transition: all 0.2s ease;
```

(in `.seasonal-item` rule) with:

```css
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
```

- [ ] **Step 8: Replace `.nav-dropdown-item` transition**

Replace:

```css
  transition: all var(--transition);
```

(in `.nav-dropdown-item` rule) with:

```css
  transition: background var(--transition), color var(--transition);
```

- [ ] **Step 9: Add :active states to global buttons**

Add after `.affiliate-button.amazon:hover` block in `global.css`:

```css
.affiliate-button:active {
  transform: scale(0.97);
}
```

Add after `.hero-cta-secondary:hover` block:

```css
.hero-cta-btn:active {
  transform: scale(0.97);
}
```

Add after `.hero-cat-pill:hover` block:

```css
.hero-cat-pill:active {
  transform: scale(0.97);
}
```

- [ ] **Step 10: Fix ComparisonTable sort button transition + add :active**

In `src/components/ComparisonTable.astro`, replace in the `<style>` block:

```css
.comp-sort-btn {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
```

With:

```css
.comp-sort-btn {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

And add after `.comp-sort-btn:hover`:

```css
.comp-sort-btn:active {
  transform: scale(0.97);
}
```

- [ ] **Step 11: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 5: Article cards hover refinement + hero dot pattern

**Files:**
- Modify: `src/styles/global.css` (`.article-card`, `.hero`)

- [ ] **Step 1: Refine article card transition**

Replace:

```css
.article-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.3s ease;
  display: flex;
  flex-direction: column;
}
```

With:

```css
.article-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 2: Increase hero dot pattern contrast**

Replace:

```css
  background:
    radial-gradient(circle, color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px),
    var(--color-bg);
```

With:

```css
  background:
    radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent) 1px, transparent 1px),
    var(--color-bg);
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 6: Search page — inline styles → CSS classes

**Files:**
- Modify: `src/pages/buscar.astro`

- [ ] **Step 1: Replace inline styles in HTML with classes**

In the HTML section of `src/pages/buscar.astro`, replace:

```html
    <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">
      Buscar artículos
    </h1>
    <p style="color: var(--color-text-muted); margin-bottom: 2rem;">
      Encuentra guías y comparativas sobre productos para tu home office
    </p>
```

With:

```html
    <h1 class="search-title">
      Buscar artículos
    </h1>
    <p class="search-subtitle">
      Encuentra guías y comparativas sobre productos para tu home office
    </p>
```

Replace:

```html
      <div style="position: relative;">
```

With:

```html
      <div class="search-input-wrap">
```

Replace:

```html
      <div id="search-meta" class="search-meta" style="display:none;"></div>
```

With:

```html
      <div id="search-meta" class="search-meta search-meta--hidden"></div>
```

Replace:

```html
      <div id="empty-state" class="search-state" style="display:none;">
        <p style="font-size: 3rem; margin-bottom: 0.75rem;">🖥️</p>
        <p class="text-muted">Escribe algo para buscar entre los artículos</p>
      </div>
      <div id="no-results-state" class="search-state" style="display:none;">
        <p style="font-size: 3rem; margin-bottom: 0.75rem;">🔍</p>
        <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Sin resultados</h2>
        <p class="text-muted">Prueba con otras palabras clave o explora por categoria:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
          <a href="/sillas/" class="affiliate-button" style="font-size: 0.85rem; padding: 0.5rem 1rem;"><CategoryIcon categoria="sillas" size={14} /> Sillas</a>
          <a href="/escritorios/" class="affiliate-button" style="font-size: 0.85rem; padding: 0.5rem 1rem;"><CategoryIcon categoria="escritorios" size={14} /> Escritorios</a>
          <a href="/accesorios/" class="affiliate-button" style="font-size: 0.85rem; padding: 0.5rem 1rem;"><CategoryIcon categoria="accesorios" size={14} /> Accesorios</a>
          <a href="/ambiente/" class="affiliate-button" style="font-size: 0.85rem; padding: 0.5rem 1rem;"><CategoryIcon categoria="ambiente" size={14} /> Ambiente</a>
          <a href="/audio-video/" class="affiliate-button" style="font-size: 0.85rem; padding: 0.5rem 1rem;"><CategoryIcon categoria="audio-video" size={14} /> Audio y Video</a>
        </div>
      </div>
      <div id="results-grid" class="articles-grid" style="display:none;" role="region" aria-live="polite" aria-label="Resultados de busqueda"></div>
```

With:

```html
      <div id="empty-state" class="search-state search-state--hidden">
        <p class="search-state-icon">🖥️</p>
        <p class="text-muted">Escribe algo para buscar entre los artículos</p>
      </div>
      <div id="no-results-state" class="search-state search-state--hidden">
        <p class="search-state-icon">🔍</p>
        <h2 class="search-state-heading">Sin resultados</h2>
        <p class="text-muted">Prueba con otras palabras clave o explora por categoria:</p>
        <div class="search-state-cats">
          <a href="/sillas/" class="affiliate-button search-cat-btn"><CategoryIcon categoria="sillas" size={14} /> Sillas</a>
          <a href="/escritorios/" class="affiliate-button search-cat-btn"><CategoryIcon categoria="escritorios" size={14} /> Escritorios</a>
          <a href="/accesorios/" class="affiliate-button search-cat-btn"><CategoryIcon categoria="accesorios" size={14} /> Accesorios</a>
          <a href="/ambiente/" class="affiliate-button search-cat-btn"><CategoryIcon categoria="ambiente" size={14} /> Ambiente</a>
          <a href="/audio-video/" class="affiliate-button search-cat-btn"><CategoryIcon categoria="audio-video" size={14} /> Audio y Video</a>
        </div>
      </div>
      <div id="results-grid" class="articles-grid search-results--hidden" role="region" aria-live="polite" aria-label="Resultados de busqueda"></div>
```

- [ ] **Step 2: Add CSS classes to the `<style>` block**

Add these rules to the existing `<style>` block in `buscar.astro`:

```css
  .search-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .search-subtitle {
    color: var(--color-text-muted);
    margin-bottom: 2rem;
  }

  .search-input-wrap {
    position: relative;
  }

  .search-meta--hidden {
    display: none;
  }

  .search-state--hidden {
    display: none;
  }

  .search-results--hidden {
    display: none;
  }

  .search-state-icon {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }

  .search-state-heading {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .search-state-cats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .search-cat-btn {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
```

- [ ] **Step 3: Update JS display toggles to use classes**

In the `<script>` block of `buscar.astro`, update the `search()` function. Replace all `style.display` assignments with class toggles:

Replace:

```js
    if (!q) {
      loadingState.style.display = 'none';
      emptyState.style.display = '';
      noResultsState.style.display = 'none';
      resultsGrid.style.display = 'none';
      meta.style.display = 'none';
      return;
    }
```

With:

```js
    if (!q) {
      loadingState.style.display = 'none';
      emptyState.classList.remove('search-state--hidden');
      noResultsState.classList.add('search-state--hidden');
      resultsGrid.classList.add('search-results--hidden');
      meta.classList.add('search-meta--hidden');
      return;
    }
```

Replace:

```js
    if (results.length === 0) {
      noResultsState.style.display = '';
      resultsGrid.style.display = 'none';
      meta.style.display = 'none';
    } else {
      noResultsState.style.display = 'none';
      resultsGrid.innerHTML = results.map(a => renderCard(a, q)).join('');
      resultsGrid.style.display = '';
      meta.textContent = `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} para "${q}"`;
      meta.style.display = '';
    }
```

With:

```js
    if (results.length === 0) {
      noResultsState.classList.remove('search-state--hidden');
      resultsGrid.classList.add('search-results--hidden');
      meta.classList.add('search-meta--hidden');
    } else {
      noResultsState.classList.add('search-state--hidden');
      resultsGrid.innerHTML = results.map(a => renderCard(a, q)).join('');
      resultsGrid.classList.remove('search-results--hidden');
      meta.textContent = `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} para "${q}"`;
      meta.classList.remove('search-meta--hidden');
    }
```

Replace the fetch callback:

```js
    .then((data: Article[]) => {
      allArticles = data;
      loadingState.style.display = 'none';
      emptyState.style.display = '';
      if (input.value.trim()) search(input.value);
    })
    .catch(() => {
      loadingState.innerHTML = '<p style="color:var(--color-primary);">Error cargando el índice. Recarga la página.</p>';
    });
```

With:

```js
    .then((data: Article[]) => {
      allArticles = data;
      loadingState.style.display = 'none';
      emptyState.classList.remove('search-state--hidden');
      if (input.value.trim()) search(input.value);
    })
    .catch(() => {
      loadingState.innerHTML = '<p class="search-error">Error cargando el índice. Recarga la página.</p>';
    });
```

And add the error class to `<style>`:

```css
  .search-error {
    color: var(--color-primary);
  }
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 7: prefers-reduced-motion coverage

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Extend reduced-motion media query**

Replace the existing `@media (prefers-reduced-motion: reduce)` block:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal-group > * {
    opacity: 1;
  }
  .reveal.revealed,
  .reveal-group.revealed > * {
    animation: none;
  }
}
```

With:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal-group > * {
    opacity: 1;
  }
  .reveal.revealed,
  .reveal-group.revealed > * {
    animation: none;
  }

  .nav-dropdown-menu {
    transition: none;
  }

  .article-card,
  .affiliate-button,
  .hero-cta-btn,
  .hero-cat-pill,
  .seasonal-item,
  .category-card,
  .category-icon,
  .trust-card,
  .comp-sort-btn {
    transition: none;
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 8: Final build + full verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 2: Verify footer tokens**

Check that `.footer` in the built CSS uses `var(--color-footer-bg)` and not hardcoded `#1a1a2e`.

- [ ] **Step 3: Verify no remaining `transition: all`**

Run: `grep -n "transition: all" src/styles/global.css src/components/ComparisonTable.astro`
Expected: No matches.

- [ ] **Step 4: Verify no inline styles in buscar.astro HTML**

Run: `grep -n 'style="' src/pages/buscar.astro`
Expected: No matches in the HTML template section (only the loading state which uses `style.display` in JS is acceptable).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/Footer.astro src/pages/buscar.astro src/components/ComparisonTable.astro
git commit -m "style: UI polish — dark mode tokens, touch targets, dropdown animation, button feedback, specific transitions, search cleanup, reduced-motion"
```
