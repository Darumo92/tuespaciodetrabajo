# Rediseño editorial — Fase 3 (Lectura) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 1 subagente por task, fresh context, review entre tareas.

**Goal:** Convertir la experiencia de lectura (artículo + componentes de afiliación) al lenguaje editorial de Fase 0: columna serif legible, chrome sin glassmorphism ni gradientes, componentes de producto sin AI-slop (hero-metric, side-stripe, badges arcoíris), botones editoriales con feedback táctil. Contenido, schema y tags de afiliado intactos.

**Architecture:** Trabajo de diseño sobre CSS plano + markup Astro existente. La mayor parte vive en `src/styles/global.css` (reglas `.article-page`, `.prose`, `.affiliate-button`) y en los `<style>` con scope de cada componente (`ComparisonTable.astro`, `TopPick.astro`, `BotonPrecio.astro`). Tokens ya definidos en Fase 0 (`--accent`, `--ink`, `--surface`, `--surface-muted`, `--border`, `--font-serif`, `--font-display`, `--radius`, `--dur-press/-hover/-reveal`, `--ease-out`); esta fase los consume, no crea tokens nuevos salvo que un step lo indique. El sistema de reveal (`[data-reveal]` → `.is-visible` en `motion.css`, cableado por `initReveal()` en Fase 1) y `ArticleCard` ya migrado se reutilizan tal cual.

**Tech Stack:** Astro 5 (static), CSS plano con custom properties, fuentes self-hosted (Source Serif 4 / Schibsted Grotesk), IntersectionObserver vanilla. Sin Tailwind, React ni Motion.

---

## Reglas duras (heredadas, aplican a TODOS los tasks)

- **CSS plano.** Nada de Tailwind/React/Motion. Custom properties existentes.
- **NO editar hashes CSP a mano.** `npm run build` regenera `public/_headers`. Si un task añade/quita un `<script>` inline, commitea `public/_headers` junto al cambio. Los tasks de esta fase son CSS + texto de markup: no añaden scripts → `_headers` debería quedar estable, pero **verifícalo** con `git status` tras cada build.
- **Cero em-dash** (`—` / `–`) en texto visible. Hyphen normal o middot `·`.
- **Tokens, no literales de color.** Prohibido reintroducir hex de marca (`#2563eb`, `#fbbf24`, `#10b981`…) salvo el naranja de marca Amazon (`#ff9900` / `#e88b00` / `#0f1111`), que es identidad de tienda y se conserva.
- **Bans absolutos (impeccable §):** side-stripe borders >1px, gradient-text, glassmorphism por defecto, hero-metric template, card grids idénticos repetidos, `transition: all`, animar desde `scale(0)`.
- **Contraste WCAG AA** en light y dark. Cualquier color nuevo se verifica en ambos modos.
- **Motion (emil):** `:active { transform: scale(0.97) }` en pressables; durations vía `--dur-*`; curvas vía `--ease-out`; reveal solo `transform`+`opacity`, `{ once: true }`, stagger 50ms; `prefers-reduced-motion` respetado (ya cubierto globalmente por `motion.css`).
- **Convivencia reveal:** usar `[data-reveal]` (sistema nuevo). NO tocar el legacy `.reveal`/`.is-visible` de otras páginas.
- **Schema y afiliación intactos:** los `<script type="application/ld+json">` de `ComparisonTable` (Product) y `Article` (Article/Breadcrumb) no se tocan; `tag=tuespaciodet-21` y normalización `/dp/` se conservan byte a byte.

## Verificación por task (work de diseño, no TDD)

Cada task cierra con:
1. `npm run build` → **verde**, 88 páginas, sin regresión.
2. `git status public/_headers` → sin cambios (o commitear si los hubiera).
3. Asserts `grep` literales sobre markup/CSS (incluidos en cada task).
4. Commit propio.

Pasada visual manual (`npm run preview`, light + dark) **diferida al cierre de fase** (Task 7).

## Estado actual auditado (baseline 2026-06-13)

| Superficie | Hallazgo AI-tell / editorial pendiente | Ubicación |
|---|---|---|
| `.prose` | Hereda fuente **sans** del body; spec exige **Source Serif 4**. Sin tope de medida (65-75ch). Sin `text-wrap: pretty`. | `global.css:1027-1031`, `.prose p:1057` |
| `.article-page` | `max-width: 800px` sin columna de lectura diferenciada | `global.css:940-944` |
| reading-progress bar | `linear-gradient(90deg, --color-primary, --color-accent)` (gradiente decorativo) | `Article.astro:400` |
| `.sticky-cta-bar` | `--glass-bg-strong` + `backdrop-filter: blur` = **glassmorphism ban** | `Article.astro:537-539` |
| `.toc-list a`, `.back-to-top-link` | `transition: all` (ban) | `Article.astro:444, 517` |
| `.trust-bar` | Rule-of-three de pills con iconos decorativos (AI-tell) | `Article.astro:176-189, 459-491` |
| `.article-category-badge` | Pill sólido uppercase loud; refinar a kicker editorial | `global.css:968-979` |
| `comp-badge` / `top-pick-badge` | `linear-gradient(135deg,#fbbf24,#f59e0b)` + `rgba` shadow (gradiente + color fuera de marca) | `ComparisonTable.astro:330-338`, `TopPick.astro:102-110` |
| `comp-score-badge` | **hero-metric template**: número grande en círculo bordeado, colores arcoíris `#10b981/#047857/#92400e` | `ComparisonTable.astro:201-204, 523-578` |
| `comp-img-wrap` / `comp-card--top::before` | `linear-gradient(135deg…)` decorativos | `ComparisonTable.astro:350, 313-319` |
| `top-pick` | `border-left: 6px solid` = **side-stripe >1px ban** | `TopPick.astro:85` |
| em-dash | `Amazon — {precio}` / `Ver en Amazon — {precio}` | `ComparisonTable.astro:219`, `TopPick.astro:73` |
| `'Nuestra eleccion'` | falta tilde → `'Nuestra elección'` | `TopPick.astro:28` |
| `BotonPrecio .boton-web-oficial` | sin `:active scale` | `BotonPrecio.astro:41-54` |
| `AffiliateButton` | ya editorial vía `.affiliate-button` global (`:active scale` presente). Solo verificar. | `global.css:1129-1156` |

---

## Task 1: Columna serif de lectura (`.prose` editorial)

Convierte la prosa del artículo a Source Serif 4, fija la medida 65-75ch y activa `text-wrap: pretty`. Las cabeceras siguen en `--font-display` (par sans+serif en eje de contraste).

**Files:**
- Modify: `src/styles/global.css:1027-1031` (`.prose`)
- Modify: `src/styles/global.css:1057-1059` (`.prose p`)

- [ ] **Step 1: Reescribir el bloque base `.prose`**

Reemplaza (`global.css:1027-1031`):

```css
.prose {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--color-text);
}
```

por:

```css
.prose {
  font-family: var(--font-serif);
  font-size: 1.075rem;
  line-height: 1.7;
  max-width: 70ch;
  color: var(--color-text);
  text-wrap: pretty;
}
```

Nota: `max-width: 70ch` cae dentro del rango 65-75ch del spec. La prosa queda alineada a la izquierda dentro del contenedor `.article-page` de 800px (margen por defecto, sin `auto`), produciendo asimetría editorial controlada. Las cabeceras `.prose h2/h3` ya fuerzan `font-family: var(--font-display)` (líneas 1034, 1047) y mantienen el contraste sans/serif.

- [ ] **Step 2: Activar `text-wrap: pretty` también a nivel párrafo (refuerzo)**

Reemplaza (`global.css:1057-1059`):

```css
.prose p {
  margin-bottom: 1.25rem;
}
```

por:

```css
.prose p {
  margin-bottom: 1.25rem;
  text-wrap: pretty;
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: verde, 88 páginas, sin warnings nuevos.

- [ ] **Step 4: Asserts**

```bash
grep -n "font-family: var(--font-serif);" src/styles/global.css | grep -q . && echo "OK serif"
grep -n "max-width: 70ch;" src/styles/global.css | grep -q . && echo "OK measure"
grep -c "text-wrap: pretty;" src/styles/global.css   # esperado: >= 2
git status --porcelain public/_headers                # esperado: vacío
```

Expected: `OK serif`, `OK measure`, conteo ≥ 2, sin cambios en `_headers`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 3 -- prosa serif Source Serif 4, medida 70ch, text-wrap pretty"
```

---

## Task 2: Chrome del artículo — breadcrumb, TOC, kicker, back-to-top (sin `transition: all`)

Refina la navegación de lectura: kicker editorial en lugar de pill loud, TOC y back-to-top con transiciones específicas (no `all`), separador de breadcrumb más sobrio.

**Files:**
- Modify: `src/styles/global.css:968-979` (`.article-category-badge`)
- Modify: `src/layouts/Article.astro:444` (`.toc-list a` transition)
- Modify: `src/layouts/Article.astro:514-518` (`.back-to-top-link` transition)

- [ ] **Step 1: Kicker editorial en vez de pill sólido uppercase**

Reemplaza (`global.css:968-979`):

```css
.article-category-badge {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  margin-bottom: 1rem;
}
```

por:

```css
.article-category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
}
```

Nota: pasa de pill relleno (loud, AI-ish) a kicker tipográfico verde sobre papel. El `<CategoryIcon>` inline (Article.astro:144) hereda `currentColor` = `--accent`. Contraste: `--accent` (#1f4d3a) sobre `--bg` (#fafafa) ≈ 8.5:1 AA; en dark `--accent` aclarado sobre `--bg` near-black verificado en Fase 0.

- [ ] **Step 2: TOC link sin `transition: all`**

En `src/layouts/Article.astro`, reemplaza dentro de `.toc-list a` (línea 444):

```css
      transition: all var(--transition);
```

por:

```css
      transition: color var(--transition), background var(--transition);
```

- [ ] **Step 3: back-to-top sin `transition: all`**

En `src/layouts/Article.astro`, reemplaza dentro de `.back-to-top-link` (línea 517):

```css
      transition: all 0.2s;
```

por:

```css
      transition: color var(--dur-hover) var(--ease-out), background var(--dur-hover) var(--ease-out);
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: verde, 88 páginas.

- [ ] **Step 5: Asserts**

```bash
grep -n "transition: all" src/layouts/Article.astro || echo "OK sin transition:all en Article"
grep -q "color: var(--accent);" src/styles/global.css && echo "OK kicker accent"
sed -n '960,980p' src/styles/global.css | grep -q "background: var(--color-primary);" && echo "FAIL pill sigue" || echo "OK pill retirado"
git status --porcelain public/_headers
```

Expected: `OK sin transition:all en Article`, `OK kicker accent`, `OK pill retirado`, `_headers` sin cambios.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Article.astro
git commit -m "feat(rediseno): fase 3 -- kicker editorial de categoria y transiciones especificas en TOC/back-to-top"
```

---

## Task 3: Retirar glassmorphism del sticky-CTA y aplanar la barra de progreso

Elimina el `backdrop-filter` (ban impeccable) del CTA fijo móvil y el gradiente decorativo de la barra de lectura, sustituyéndolos por superficie sólida + hairline.

**Files:**
- Modify: `src/layouts/Article.astro:397-403` (`.reading-progress-bar`)
- Modify: `src/layouts/Article.astro:529-545` (`.sticky-cta-bar`)

- [ ] **Step 1: Barra de progreso plana (sin gradiente)**

En `src/layouts/Article.astro`, reemplaza el bloque `.reading-progress-bar` (líneas 397-403):

```css
    .reading-progress-bar {
      height: 100%;
      width: 0;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
      transition: width 0.1s linear;
      border-radius: 0 2px 2px 0;
    }
```

por:

```css
    .reading-progress-bar {
      height: 100%;
      width: 0;
      background: var(--accent);
      transition: width 0.1s linear;
    }
```

- [ ] **Step 2: Sticky-CTA sólido (sin glass)**

En `src/layouts/Article.astro`, reemplaza el bloque `.sticky-cta-bar` (líneas 530-545):

```css
    .sticky-cta-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 90;
      background: var(--glass-bg-strong);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border-top: 1px solid var(--glass-border);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      padding: 0.625rem 1rem;
      transform: translateY(100%);
      transition: transform var(--transition-slow);
    }
```

por:

```css
    .sticky-cta-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 90;
      background: var(--surface);
      border-top: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      padding: 0.625rem 1rem;
      transform: translateY(100%);
      transition: transform var(--dur-hover) var(--ease-out);
    }
```

Nota: `--surface` es opaco en ambos modos (Fase 0). Se mantiene `box-shadow` mínima (`--shadow-md`, tintada al hue del fondo) para despegar la barra del contenido sin glass. La animación de entrada usa `--dur-hover` (180ms) en lugar de `--transition-slow` (400ms): un CTA que aparece debe sentirse inmediato.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: verde, 88 páginas.

- [ ] **Step 4: Asserts**

```bash
grep -n "backdrop-filter" src/layouts/Article.astro || echo "OK sin backdrop-filter"
grep -n "linear-gradient" src/layouts/Article.astro || echo "OK sin gradiente en Article"
grep -q "background: var(--surface);" src/layouts/Article.astro && echo "OK sticky solido"
git status --porcelain public/_headers
```

Expected: `OK sin backdrop-filter`, `OK sin gradiente en Article`, `OK sticky solido`, `_headers` sin cambios.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Article.astro
git commit -m "feat(rediseno): fase 3 -- retirar glassmorphism del sticky-CTA y aplanar barra de lectura"
```

---

## Task 4: `ComparisonTable` editorial — retirar hero-metric, gradientes y em-dash

De-slop de las tarjetas comparativas: elimina el `comp-score-badge` (hero-metric template), recolorea el `comp-badge` ganador al acento sin gradiente, aplana el fondo de imagen y el overlay de la tarjeta top, y corrige el em-dash del botón. Product schema y `tag` intactos.

**Files:**
- Modify: `src/components/ComparisonTable.astro:201-204` (markup `comp-score-badge` → eliminar)
- Modify: `src/components/ComparisonTable.astro:219` (em-dash)
- Modify: `src/components/ComparisonTable.astro:313-339` (`comp-card--top::before`, `comp-badge`)
- Modify: `src/components/ComparisonTable.astro:348-358` (`comp-img-wrap`)
- Modify: `src/components/ComparisonTable.astro:523-578` (CSS `comp-score-badge*` → eliminar)

- [ ] **Step 1: Eliminar el markup del hero-metric `comp-score-badge`**

En `src/components/ComparisonTable.astro`, elimina por completo este bloque (líneas 201-204):

```jsx
            <div class={`comp-score-badge ${p.valoracion >= 4.5 ? 'comp-score-badge--excellent' : p.valoracion >= 3.5 ? 'comp-score-badge--good' : 'comp-score-badge--average'}`}>
              <span class="comp-score-value">{p.valoracion.toFixed(1)}</span>
              <span class="comp-score-label">{p.valoracion >= 4.5 ? 'Excelente' : p.valoracion >= 3.5 ? 'Muy bueno' : 'Bueno'}</span>
            </div>
```

(La valoración ya se comunica con las estrellas + `comp-rating-num`; el círculo numérico era redundante y es el patrón hero-metric prohibido.)

- [ ] **Step 2: Corregir el em-dash del botón Amazon**

En `src/components/ComparisonTable.astro`, reemplaza (línea 219):

```jsx
              Amazon — {p.precio}
```

por:

```jsx
              Amazon · {p.precio}
```

- [ ] **Step 3: `comp-badge` ganador en acento plano (sin gradiente dorado)**

En `src/components/ComparisonTable.astro`, reemplaza el bloque `.comp-badge` (líneas 326-339):

```css
.comp-badge {
  position: absolute;
  top: -0.7rem;
  left: 1.25rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.35rem 1rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
```

por:

```css
.comp-badge {
  position: absolute;
  top: -0.7rem;
  left: 1.25rem;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.35rem 1rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

- [ ] **Step 4: Retirar el overlay con gradiente de la tarjeta top**

En `src/components/ComparisonTable.astro`, elimina por completo el bloque `.comp-card--top::before` (líneas 313-320):

```css
.comp-card--top::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent);
  pointer-events: none;
}
```

(El borde `2px solid var(--color-primary)` de `.comp-card--top` ya distingue la tarjeta; el overlay con gradiente era decorativo.)

- [ ] **Step 5: Fondo de imagen plano (sin gradiente)**

En `src/components/ComparisonTable.astro`, reemplaza dentro de `.comp-img-wrap` (línea 350):

```css
  background: linear-gradient(135deg, var(--color-bg-muted), color-mix(in srgb, var(--color-primary) 4%, var(--color-bg-muted)));
```

por:

```css
  background: var(--surface-muted);
```

- [ ] **Step 6: Eliminar todo el CSS de `comp-score-badge`**

En `src/components/ComparisonTable.astro`, elimina por completo el bloque CSS de `comp-score-badge` y sus variantes (líneas 523-578), desde el comentario `/* Score badge */` hasta el cierre de `.comp-score-label { … }` inclusive:

```css
/* Score badge */
.comp-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  border: 2px solid currentColor;
  flex-shrink: 0;
  margin-top: 0.75rem;
}

.comp-score-badge--excellent {
  background: color-mix(in srgb, #10b981 12%, transparent);
  color: #047857;
}

.comp-score-badge--good {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary-dark);
}

.comp-score-badge--average {
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: #92400e;
}

:global([data-theme="dark"]) .comp-score-badge--excellent {
  color: #34d399;
}

:global([data-theme="dark"]) .comp-score-badge--good {
  color: var(--color-primary-light);
}

:global([data-theme="dark"]) .comp-score-badge--average {
  color: #fbbf24;
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
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: verde, 88 páginas. El Product schema sigue emitiéndose (no se tocó el bloque `productSchemas`).

- [ ] **Step 8: Asserts**

```bash
grep -n "comp-score-badge\|comp-score-value\|comp-score-label" src/components/ComparisonTable.astro || echo "OK hero-metric eliminado"
grep -n "linear-gradient\|#fbbf24\|#f59e0b\|#10b981\|#047857\|#92400e\|#34d399" src/components/ComparisonTable.astro || echo "OK sin gradientes ni hex arcoiris"
grep -n "—\|–" src/components/ComparisonTable.astro || echo "OK sin em-dash"
grep -q "'@type': 'Product'" src/components/ComparisonTable.astro && echo "OK Product schema intacto"
grep -q "tag=\${AMAZON_TAG}" src/components/ComparisonTable.astro && echo "OK tag afiliado intacto"
git status --porcelain public/_headers
```

Expected: `OK hero-metric eliminado`, `OK sin gradientes ni hex arcoiris`, `OK sin em-dash`, `OK Product schema intacto`, `OK tag afiliado intacto`, `_headers` sin cambios.

- [ ] **Step 9: Commit**

```bash
git add src/components/ComparisonTable.astro
git commit -m "feat(rediseno): fase 3 -- ComparisonTable sin hero-metric, badges al acento, sin gradientes ni em-dash"
```

---

## Task 5: `TopPick` editorial — retirar side-stripe, badge al acento, ortografía y em-dash

De-slop del bloque destacado: elimina el borde lateral de 6px (side-stripe ban), recolorea el badge trofeo al acento sin gradiente, corrige el em-dash del botón y la tilde de la etiqueta por defecto. Sin plantilla hero-metric. `tag` intacto.

**Files:**
- Modify: `src/components/TopPick.astro:28` (`etiqueta` default tilde)
- Modify: `src/components/TopPick.astro:73` (em-dash)
- Modify: `src/components/TopPick.astro:83-92` (`.top-pick` border)
- Modify: `src/components/TopPick.astro:98-111` (`.top-pick-badge`)
- Modify: `src/components/TopPick.astro:229-232` (`:global([data-theme="dark"]) .top-pick`)

- [ ] **Step 1: Corregir tilde en la etiqueta por defecto**

En `src/components/TopPick.astro`, reemplaza (línea 28):

```jsx
  etiqueta = 'Nuestra eleccion',
```

por:

```jsx
  etiqueta = 'Nuestra elección',
```

- [ ] **Step 2: Corregir el em-dash del botón**

En `src/components/TopPick.astro`, reemplaza (línea 73):

```jsx
              Ver en Amazon — {precioAmazon}
```

por:

```jsx
              Ver en Amazon · {precioAmazon}
```

- [ ] **Step 3: Retirar el side-stripe de 6px**

En `src/components/TopPick.astro`, reemplaza el bloque `.top-pick` (líneas 83-92):

```css
.top-pick {
  border: 2px solid var(--color-primary);
  border-left: 6px solid var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 3%, var(--color-bg-card));
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin: 2.5rem 0;
  position: relative;
  transition: box-shadow var(--transition);
}
```

por:

```css
.top-pick {
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 4%, var(--surface));
  border-radius: var(--radius);
  padding: 2rem;
  margin: 2.5rem 0;
  position: relative;
  transition: box-shadow var(--dur-hover) var(--ease-out);
}
```

Nota: el borde pasa de `2px` + side-stripe `6px` (ban) a un hairline de `1px` en acento que rodea la tarjeta completa. La jerarquía de "esta es la elección" la lleva el badge + el tinte de fondo, no una barra lateral gruesa.

- [ ] **Step 4: Badge trofeo en acento plano (sin gradiente dorado)**

En `src/components/TopPick.astro`, reemplaza el bloque `.top-pick-badge` (líneas 98-111):

```css
.top-pick-badge {
  position: absolute;
  top: -0.8rem;
  left: 1.25rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
```

por:

```css
.top-pick-badge {
  position: absolute;
  top: -0.8rem;
  left: 1.25rem;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

- [ ] **Step 5: Alinear la variante dark con el nuevo borde de 1px**

En `src/components/TopPick.astro`, reemplaza el bloque dark (líneas 229-232):

```css
:global([data-theme="dark"]) .top-pick {
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-bg-card));
  border-color: var(--color-primary);
}
```

por:

```css
:global([data-theme="dark"]) .top-pick {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  border-color: var(--accent);
}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: verde, 88 páginas.

- [ ] **Step 7: Asserts**

```bash
grep -n "border-left: 6px" src/components/TopPick.astro || echo "OK sin side-stripe"
grep -n "linear-gradient\|#fbbf24\|#f59e0b\|rgba(245" src/components/TopPick.astro || echo "OK sin gradiente dorado"
grep -n "—\|–" src/components/TopPick.astro || echo "OK sin em-dash"
grep -q "Nuestra elección" src/components/TopPick.astro && echo "OK tilde elección"
grep -q "tag=\${AMAZON_TAG}" src/components/TopPick.astro && echo "OK tag afiliado intacto"
git status --porcelain public/_headers
```

Expected: `OK sin side-stripe`, `OK sin gradiente dorado`, `OK sin em-dash`, `OK tilde elección`, `OK tag afiliado intacto`, `_headers` sin cambios.

- [ ] **Step 8: Commit**

```bash
git add src/components/TopPick.astro
git commit -m "feat(rediseno): fase 3 -- TopPick sin side-stripe ni hero-metric, badge al acento, ortografia"
```

---

## Task 6: Botones editoriales — `BotonPrecio` `:active` y verificación de `AffiliateButton`

`AffiliateButton` ya renderiza vía la clase global `.affiliate-button`, que tiene estilo editorial y `:active { transform: scale(0.97) }` (global.css:1154-1156). Esta tarea añade feedback táctil al único botón que le falta (`BotonPrecio .boton-web-oficial`) y verifica que el tag de afiliado/ASIN se conserva en ambos componentes.

**Files:**
- Modify: `src/components/BotonPrecio.astro:50-54` (`.boton-web-oficial` transition + `:active`)

- [ ] **Step 1: `:active scale` y transición específica en `.boton-web-oficial`**

En `src/components/BotonPrecio.astro`, dentro del bloque `.boton-web-oficial { … }` (línea 52), reemplaza:

```css
    transition: border-color var(--transition);
```

por:

```css
    transition: border-color var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out);
```

Y reemplaza la línea de `:hover` (línea 54):

```css
  .boton-web-oficial:hover { border-color: var(--color-primary); color: var(--color-primary); }
```

por:

```css
  .boton-web-oficial:hover { border-color: var(--color-primary); color: var(--color-primary); }
  .boton-web-oficial:active { transform: scale(0.97); }
```

- [ ] **Step 2: Verificar que `AffiliateButton` no necesita cambios**

Inspección (read-only): confirma que `AffiliateButton.astro` usa `class="affiliate-button …"` (línea 37) y que la clase global ya aporta editorial + `:active`. No se edita.

```bash
grep -q 'class={`affiliate-button' src/components/AffiliateButton.astro && echo "OK AffiliateButton usa clase global editorial"
grep -q "transform: scale(0.97);" src/styles/global.css && echo "OK :active scale global presente"
```

Expected: ambos `OK`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: verde, 88 páginas.

- [ ] **Step 4: Asserts**

```bash
grep -q ".boton-web-oficial:active { transform: scale(0.97); }" src/components/BotonPrecio.astro && echo "OK BotonPrecio :active"
grep -n "transition: all" src/components/BotonPrecio.astro || echo "OK sin transition:all"
grep -q "buildAmazonHref" src/components/BotonPrecio.astro && echo "OK href afiliado intacto"
git status --porcelain public/_headers
```

Expected: `OK BotonPrecio :active`, `OK sin transition:all`, `OK href afiliado intacto`, `_headers` sin cambios.

- [ ] **Step 5: Commit**

```bash
git add src/components/BotonPrecio.astro
git commit -m "feat(rediseno): fase 3 -- feedback tactil :active en BotonPrecio web-oficial"
```

---

## Task 7: Barrido de cierre de fase — trust-bar, asserts globales y pasada visual

Cierre: simplifica el `trust-bar` (rule-of-three con iconos decorativos, AI-tell), corre el set completo de asserts de fase y deja constancia de la pasada visual manual.

**Files:**
- Modify: `src/layouts/Article.astro:176-189` (markup `.trust-bar`)
- Modify: `src/layouts/Article.astro:458-491` (CSS `.trust-bar`/`.trust-item`)

- [ ] **Step 1: Simplificar el `trust-bar` (retirar iconos decorativos, prosa editorial)**

El `trust-bar` actual son tres pills con SVG decorativos ("Análisis independiente / Productos probados / Actualizado regularmente"): patrón rule-of-three + iconos decorativos. Reemplaza el bloque markup (`Article.astro:176-189`):

```jsx
    <aside class="trust-bar">
      <div class="trust-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Análisis independiente
      </div>
      <div class="trust-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 2v4"/><path d="m16.24 7.76-2.83 2.83"/><path d="M18 12h4"/><path d="m16.24 16.24-2.83-2.83"/><path d="M12 18v4"/><path d="m7.76 16.24 2.83-2.83"/><path d="M2 12h4"/><path d="m7.76 7.76 2.83 2.83"/></svg>
        Productos probados
      </div>
      <div class="trust-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21.5 2v6s-6-1-12 4c0 0-1-5-1-10 7.5 0 13 0 13 0z"/><path d="M2.5 22c2-2 8-6 9.5-9.5"/><path d="M10 15c-3 0-6 3-6 3"/></svg>
        Actualizado regularmente
      </div>
    </aside>
```

por una línea de confianza editorial en prosa, sin iconos:

```jsx
    <p class="trust-line">
      Análisis independiente. Productos probados de primera mano y precios revisados con regularidad.
    </p>
```

- [ ] **Step 2: CSS del `trust-line` (sustituye al `.trust-bar`/`.trust-item`)**

En `src/layouts/Article.astro`, reemplaza el bloque `.trust-bar` … `.trust-badge` y su media query (líneas 458-491):

```css
    /* Trust bar */
    .trust-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.25rem 0;
    }
    .trust-item,
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
    .trust-item svg,
    .trust-badge svg {
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .trust-bar {
        gap: 0.375rem;
      }
      .trust-item,
      .trust-badge {
        font-size: 0.68rem;
        padding: 0.25rem 0.55rem;
      }
    }
```

por:

```css
    /* Trust line (editorial, sin iconos decorativos) */
    .trust-line {
      margin: 1.25rem 0;
      font-size: 0.85rem;
      line-height: 1.6;
      color: var(--color-text-muted);
    }
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: verde, 88 páginas.

- [ ] **Step 4: Asserts globales de fase**

```bash
# Cero em-dash en todas las superficies de Fase 3
grep -rn "—\|–" src/layouts/Article.astro src/components/ComparisonTable.astro src/components/TopPick.astro src/components/AffiliateButton.astro src/components/BotonPrecio.astro || echo "OK cero em-dash Fase 3"

# Cero glassmorphism / transition:all en las superficies tocadas
grep -rn "backdrop-filter\|transition: all" src/layouts/Article.astro src/components/ComparisonTable.astro src/components/TopPick.astro src/components/BotonPrecio.astro || echo "OK sin glass ni transition:all"

# Cero hex arcoiris fuera de marca Amazon en componentes de producto
grep -rn "#fbbf24\|#f59e0b\|#10b981\|#047857\|#92400e\|#34d399\|#2563eb" src/components/ComparisonTable.astro src/components/TopPick.astro || echo "OK sin hex arcoiris"

# Prosa serif + medida
grep -q "font-family: var(--font-serif);" src/styles/global.css && grep -q "max-width: 70ch;" src/styles/global.css && echo "OK prosa serif + medida"

# Trust-bar retirado
grep -n "trust-bar\|trust-item" src/layouts/Article.astro || echo "OK trust-bar retirado"

# Schema + tag intactos
grep -q "'@type': 'Product'" src/components/ComparisonTable.astro && grep -q "BreadcrumbList" src/layouts/Article.astro && echo "OK schemas intactos"

# CSP estable
git status --porcelain public/_headers
```

Expected: todos los `OK`, `_headers` sin cambios. Si `_headers` cambió, añádelo al commit de este task.

- [ ] **Step 5: Pasada visual manual (light + dark)**

Run: `npm run preview` y abre una ficha de comparativa (p.ej. `/sillas/<slug>/`) y una guía (`/guias/<slug>/`).

Checklist visual (design-taste-frontend Pre-Flight §14):
- Prosa en serif, medida ~70ch, ritmo de línea cómodo.
- Sin gradientes ni glass; badges en verde abeto coherente.
- Sin círculo numérico hero-metric en comparativas.
- TopPick con hairline 1px (sin barra lateral gruesa).
- `:active` perceptible al pulsar botones (scale 0.97).
- Light y dark: contraste de kicker, badges y botones legible; jerarquía del CTA equivalente en ambos modos.

Documenta el resultado en el mensaje de commit o como nota; no bloquea el merge salvo regresión.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Article.astro
# si el build modificó _headers:
# git add public/_headers
git commit -m "feat(rediseno): fase 3 -- trust-line editorial sin iconos, barrido de cierre de fase"
```

---

## Self-Review (ejecutado por quien escribe el plan)

**1. Cobertura de spec/roadmap (líneas 604-608 + §3/§4/§7):**
- "Columna serif 65-75ch, line-height 1.7, text-wrap pretty" → Task 1. ✓
- "Breadcrumb + TOC refinados" → Task 2 (kicker, TOC sin `transition:all`, separador). Breadcrumb base ya viene de Fase 1; aquí se refina su entorno. ✓
- "related, FAQs" → ya presentes y editoriales (ArticleCard `[data-reveal]`, FAQ `<details>`); no requieren rework de Fase 3, se conservan. ✓
- "ComparisonTable sin hairline por fila (clusters/tarjeta-por-spec), Product schema intacto" → Task 4. El componente ya es tarjeta-por-producto (no tabla con filas hairline); el slop real eran hero-metric + gradientes, eliminados. Schema intacto verificado. ✓
- "TopPick sin hero-metric template" → Task 5 (side-stripe fuera, badge plano, sin círculo numérico). ✓
- "AffiliateButton + BotonPrecio botón editorial + :active, tag intacto" → Task 6. ✓
- §4 "cero em-dash" → Tasks 4, 5 + assert global Task 7. ✓
- §4 ortografía (tilde `elección`) → Task 5. ✓
- §7 trazabilidad emil (`:active`, `--dur-*`, `--ease-out`) / impeccable (bans glass, side-stripe, hero-metric, gradient) / design-taste (color consistency lock al acento) → cubierto transversalmente. ✓

**2. Placeholder scan:** Sin TBD/TODO. Todos los steps de CSS/markup muestran el bloque literal antes y después. Asserts con comandos exactos y salida esperada.

**3. Type/clase consistency:** Clases referenciadas (`.comp-badge`, `.comp-score-badge`, `.top-pick-badge`, `.trust-line`, `.boton-web-oficial`, `.article-category-badge`) coinciden entre markup y CSS de cada task. `comp-score-badge` se elimina en markup (Step 1) y CSS (Step 6) del mismo task — sin referencias huérfanas. `.trust-line` se introduce en markup (Task 7 Step 1) y CSS (Step 2) juntos.

**Gaps conocidos (fuera de alcance, dejados explícitos):**
- `.prose table` (tablas markdown) conserva `border: 1px` por celda; no es un componente de Fase 3 y reescribirlo afectaría a contenido editorial existente. Si se quiere de-slop, va a Fase 6 (pulido).
- `.badge-sillas`/`.badge-escritorios`… (hex arcoíris en `global.css:1425+`) los usa el sistema de categorías legacy, no las superficies de lectura tocadas aquí (los tags de artículo usan `.article-tag-badge` neutro). Limpieza de alias legacy está asignada a Fase 6 en el roadmap.

---

## Execution Handoff

Plan completo y guardado en `docs/superpowers/plans/2026-06-13-rediseno-editorial-fase3-lectura.md`. Dos opciones de ejecución:

1. **Subagent-Driven (recomendado)** — un subagente fresco por task, review entre tasks, iteración rápida. REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`.
2. **Inline** — ejecutar en esta sesión con `superpowers:executing-plans`, checkpoints por lote.

Rama: permanecer en `feat/catalogo-multicategoria`. NO `git push`.
