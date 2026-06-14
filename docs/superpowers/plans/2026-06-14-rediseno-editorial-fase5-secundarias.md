# Rediseño editorial — Fase 5 (Secundarias) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans para ejecutar task por task. Los steps usan checkbox (`- [ ]`).

**Goal:** Dejar las páginas secundarias (buscar, actualidad, guías, herramientas, listado de categoría, articulos, legales, sobre-mi, 404) coherentes con el lenguaje editorial: hairlines en vez de sombras, acento único verde abeto (cero AI-blue / segundo verde), `:active` en pressables, sin gradient-text ni side-stripes >1px ni `transition: all`, y cero em-dash visible. Schema/JSON-LD y tag/ASIN de afiliado intactos byte a byte.

**Architecture:** Los tokens editoriales de Fase 0 y sus alias legacy (`--color-primary`→`--accent`, `--color-text`→`--ink`, etc.) ya re-tintan estas páginas. El trabajo de Fase 5 es quirúrgico: cazar los AI-tells **hardcodeados** que se saltan los alias. La mayor parte del peso está en la **calculadora de ergonomía**, cuyo chrome NO vive en un `<style>` scoped sino en el bloque global `.ergo-*` de `src/styles/global.css` (~860 líneas, líneas 2200-3070), la superficie menos editorial del sitio (AI-blue `rgba(37,99,235,…)` = `#2563eb`, segundo verde emerald `#10b981`, gradientes, side-stripes 3-4px, `#fff` hardcodeado, sombras pesadas, 6× `transition: all`, cero `:active`). El resto son páginas pequeñas con `<style>` scoped (404 gradient-text, articulos/actualidad pills, [categoria]/guias side-stripe en la intro).

**Tech Stack:** Astro 5 (`.astro` con `<style>` scoped + reglas globales en `global.css`), CSS plano con custom properties, sin Tailwind/React/Motion. Build estático Cloudflare Pages.

---

## Baseline de auditoría (estado real 2026-06-14, rama `feat/catalogo-multicategoria`)

Tabla de hallazgos AI-tell con `archivo:línea`. Todos confirmados leyendo el código.

| # | Archivo:línea | AI-tell detectado | Skill / regla violada | Fix en task |
|---|---|---|---|---|
| 1 | `404.astro:40-43` | `.page-404-number` con **gradient-text** (`linear-gradient` + `background-clip: text` + `-webkit-text-fill-color: transparent`) | impeccable (ban gradient-text), design-taste §9 | T1 |
| 2 | `global.css:589` | `.hero-cta-btn { transition: all var(--transition) }` → **`transition: all`** (CTA primario de 404 y home) | emil (nunca `transition: all`) | T2 |
| 3 | `articulos.astro:172` | `.cat-filter-btn,.tipo-filter-btn { transition: all 0.2s }` → **`transition: all`** | emil | T3 |
| 4 | `articulos.astro:184` | `.cat-filter-btn.active { color: white }` → `white` hardcodeado (rompe contraste/dark si cambia acento) | impeccable (token bypass) | T3 |
| 5 | `articulos.astro:165` | `.cat-filter-btn { border: 1.5px }` (pill) | impeccable (hairline 1px) | T3 |
| 6 | `actualidad/index.astro:171` | `.actualidad-tab[aria-pressed="true"] { color: white }` → `white` hardcodeado | impeccable (token bypass) | T4 |
| 7 | `actualidad/index.astro:152` | `.actualidad-tab { border: 1.5px }` (pill) | impeccable (hairline 1px) | T4 |
| 8 | `[categoria]/index.astro:163` | `.category-intro { border-left: 4px solid var(--color-primary) }` → **side-stripe 4px** (>1px) | impeccable (ban side-stripe >1px) | T5 |
| 9 | `[categoria]/index.astro:179` | `.subcat-heading { border-bottom: 2px solid var(--color-border) }` (>1px) | impeccable (hairline) | T5 |
| 10 | `guias/index.astro:102` | `.category-intro { border-left: 4px solid var(--color-primary) }` → **side-stripe 4px** (mismo patrón, archivo distinto) | impeccable (ban side-stripe >1px) | T5 |
| 11 | `guias/index.astro:117` | `.subcat-heading { border-bottom: 2px solid var(--color-border) }` (>1px) | impeccable (hairline) | T5 |
| 12 | `global.css:2221-2230,2480,2569,2687,2746,2977,3049` | `.ergo-*` con `color: #fff` hardcodeado (7 sitios) → rompe tokens/dark | impeccable (token bypass) | T6 |
| 13 | `global.css:2354,2402,2408,2417,2481,2523,2689,2695` | `.ergo-*` con sombras **AI-blue** `rgba(37, 99, 235, …)` (8 sitios) | impeccable (color consistency lock; azul-IA) | T6 |
| 14 | `global.css:2527-2529,2533,2546,2578` | `.ergo-dolor-chip--none` con **emerald** `#10b981`/`#047857`/`#34d399`/`rgba(16,185,129,…)` → **segundo verde** ≠ acento | design-taste (color lock; dos verdes) | T6 |
| 15 | `global.css:2377,2390` | `.ergo` sliders con **gradient** decorativo (2377 además muerto: lo pisa `background: var(--color-border)` en 2378) | impeccable (gradiente decorativo) | T6 |
| 16 | `global.css:2766-2773` | `.ergo-score-card::before { width: 4px }` → **side-stripe 4px** (barra de color de score) | impeccable (ban side-stripe >1px) | T6 |
| 17 | `global.css:2890,2959,3030` | `.ergo-measure`/`.ergo-tip`/`.ergo-cta` con `border-left: 3px`/`4px` → **side-stripes >1px** | impeccable (ban side-stripe >1px) | T6 |
| 18 | `global.css:2958` | `.ergo-tip { background: rgba(245, 158, 11, 0.08) }` → tinte **amber** por defecto (no semántico; el default no es warning) | impeccable (color lock) | T6 |
| 19 | `global.css:3039` | `.ergo-cta:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08) }` → **sombra negra pesada** | impeccable (jerarquía por líneas) | T6 |
| 20 | `global.css:2217,2468,2505,2681,2740,3032` | `.ergo-*` con `transition: all` (6 sitios) | emil (nunca `transition: all`) | T7 |
| 21 | `global.css` `.ergo-chip`/`.ergo-dolor-chip` (labels) | pressables sin `:active` (no son `<button>`, no heredan el `button:active` global de motion.css) | emil (feedback táctil) | T7 |
| 22 | `herramientas/index.astro:27` | `<title>` con **em-dash** ` — Tu Espacio de Trabajo` (la mayoría del sitio usa ` \| `) | spec §4 (cero em-dash visible) | T8 |
| 23 | `sobre-mi.astro:44` | `<Base title>` con **em-dash** ` — Tu Espacio de Trabajo` | spec §4 (cero em-dash visible) | T8 |
| 24 | `calculadora-ergonomia.astro:59,386,387` | **Em-dash** en copy visible (FAQ + prosa del cuerpo) | spec §4 (cero em-dash visible) | T8 |
| 25 | `calculadora-ergonomia.astro:298,303` | **Em-dash** `—` como placeholder de score (markup) | spec §4 (cero em-dash visible) | T8 |

### Decisiones de scope (explícitas)

**Clasificación de los 8 `transition: all` de `global.css` (el "OJO" heredado):**
- **Entran en Fase 5** (7): `589` (`.hero-cta-btn`, CTA de 404 → T2) y `2217`/`2468`/`2505`/`2681`/`2740`/`3032` (todos `.ergo-*` = chrome de la calculadora, página en scope → T7).
- **Queda para Fase 6** (1): `1392` (`.footer-back-top`) es chrome del footer (Fase 1), fuera del alcance de Secundarias. Se documenta y se difiere al pulido.

**Colores semánticos de data-viz que NO se tocan (excepción documentada, igual criterio que el verde-rojo del diagrama):**
- **Escala de score** `.ergo-score-card[data-color]` (`#ef4444` rojo / `#f59e0b` amber / `#84cc16` lima / `#10b981` verde, `global.css:2775-2778`): es un semáforo de puntuación 0-100 (data-viz legítimo, no slop arcoíris de categoría). Se conserva la escala; solo se elimina la **barra side-stripe de 4px** que la pinta (T6, #16), pasando el color al borde/anillo.
- **Rojo de aviso** `.ergo-tip--warn` (`#ef4444`, `global.css:2964,2986`): estado semántico "warning". Se conserva el tinte rojo; solo se elimina el side-stripe fat (T6, #17).
- **Figura SVG blueprint** (dentro del `<script is:inline>` de `calculadora-ergonomia.astro`, líneas ~880-1003): `#10b981` (zona segura), `#ef4444` (peligro), `#8b6f47`/`#a0845c` (madera) son **codificación semántica instruccional** del plano técnico. Tocarlas **cambiaría el hash CSP** del script inline y degradaría la legibilidad del diagrama. **NO se tocan.** El punto de leyenda `style="background:#10b981"` (`:338`) se conserva para mantener coherencia con el SVG.

**Integridad de Schema/JSON-LD (intacto byte a byte):** las cadenas `name:` de los objetos schema con em-dash (`sobre-mi.astro:37` aboutPageSchema, `calculadora-ergonomia.astro:22` softwareAppSchema) **NO se tocan**. T8 solo cambia `<title>`/prop visible y copy del cuerpo, nunca JSON-LD.

**Páginas en scope SIN trabajo (auditadas, limpias):**
- `buscar.astro`: `<style>` token-puro; `#search-input:focus` usa un focus-ring con `color-mix(--color-primary 15%)` (legítimo, no sombra pesada); los pressables `.search-cat-btn` usan `.affiliate-button` global (ya con `:active` desde Fase 4). Sin edits.
- `sobre-mi.astro`: prosa real E-E-A-T, clase global `.legal-page`, sin AI-tell en CSS. Solo el em-dash del `<title>` (T8). Sin edits de estilo.
- `aviso-legal.astro`, `cookies.astro`, `politica-privacidad.astro`: sin `<style>` scoped, sin AI-tells, sin em-dash. Sin edits.
- `guias/[slug].astro`: solo envuelve `Article.astro` (territorio Fase 3). Sin edits.
- `herramientas/index.astro`: sin `<style>` scoped; clases globales `.tool-page`/`.related-links`. Solo el em-dash del `<title>` (T8). Sin edits de estilo.

### Pase visual manual (diferido al cierre)
Tras T9, pase manual en navegador (light + dark): `/404` (URL inexistente), `/articulos/` (filtros), `/actualidad/`, `/sillas/` (listado categoría), `/guias/`, `/herramientas/calculadora-ergonomia/` (recorrer pasos: chips, sliders, dolor-chips, resultados con score-card + tips + CTAs). No bloquea los commits de las tasks.

---

## File Structure

Un commit por task. Tokens disponibles (confirmados): `--accent`, `--accent-hover`, `--accent-ink`, `--bg`, `--ink`, `--ink-muted`, `--surface`, `--surface-muted`, `--border`, `--border-strong`, `--radius`, `--radius-sm`, `--font-display`, `--font-serif`, `--dur-press`, `--dur-hover`, `--dur-reveal`, `--ease-out`, `--shadow-md`, y los alias legacy (`--color-primary`→`--accent`, `--color-text`→`--ink`, `--color-bg`→`--bg`, `--color-bg-muted`→`--surface-muted`, `--color-border`→`--border`, `--radius-md/lg`→`--radius`, etc.). Se usan los **alias legacy** dentro de cada superficie para minimizar diff; solo se introduce `--accent-ink` donde hay `#fff` sobre acento.

- `src/pages/404.astro` — T1 (style)
- `src/styles/global.css` (`.hero-cta-btn`, línea 589) — T2
- `src/pages/articulos.astro` — T3 (style). **NO tocar `<script>`.**
- `src/pages/actualidad/index.astro` — T4 (style). **NO tocar `<script>`.**
- `src/pages/[categoria]/index.astro` + `src/pages/guias/index.astro` — T5 (style, dos archivos, mismo cambio)
- `src/styles/global.css` (bloque `.ergo-*`, ~2200-3070) — T6 (colores/sombras/stripes) y T7 (motion)
- `src/pages/herramientas/index.astro`, `src/pages/sobre-mi.astro`, `src/pages/herramientas/calculadora-ergonomia.astro` — T8 (em-dash visible, markup/frontmatter; **NO `<script>`, NO schema**)
- T9 — verificación final, sin edits salvo nits

---

## Reglas de verificación (todas las tasks)

Cada task termina con:
1. `npm run build` → **verde, ≈88 páginas** (sin regresión de conteo).
2. Asserts `grep` específicos de la task (abajo).
3. `git status --porcelain public/_headers` → **vacío** (sin cambios de hashes CSP). Ninguna task edita `<script>` inline → los hashes no cambian.
4. Commit propio con mensaje `feat(rediseno): fase 5 -- <resumen>`.

---

### Task 1: 404 — matar gradient-text del número

**Files:**
- Modify: `src/pages/404.astro` (style líneas 34-45)

El `.page-404-number` usa gradient-text (ban absoluto de impeccable). Como los alias mapean todo al acento, el gradiente ya renderiza casi plano; se reemplaza por color sólido de acento.

- [ ] **Step 1: Reemplazar las 4 líneas de gradient-text (40-43)**

En la regla `.page-404-number`, sustituir:

```css
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-rose) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
```

por:

```css
    color: var(--accent);
```

- [ ] **Step 2: Build + asserts**

```bash
npm run build 2>&1 | tail -5
grep -nE 'background-clip|text-fill-color|linear-gradient' src/pages/404.astro || echo "ASSERT_OK: sin gradient-text"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat(rediseno): fase 5 -- 404 numero a color solido (sin gradient-text)"
```

---

### Task 2: hero-cta-btn — eliminar `transition: all`

**Files:**
- Modify: `src/styles/global.css:589` (regla `.hero-cta-btn`, empieza en 578)

`.hero-cta-btn` es el CTA primario de `404.astro` (`hero-cta-primary`/`hero-cta-secondary`) y también de home. Fix byte-aislado (mismo criterio que `.affiliate-button` en Fase 4): solo cambia QUÉ propiedades transicionan; el `:active scale(0.97)` (línea 592) y los hover se conservan idénticos.

- [ ] **Step 1: Reemplazar la línea 589**

Dentro de `.hero-cta-btn { ... }`, cambiar:

```css
  transition: all var(--transition);
```

por:

```css
  transition: background-color var(--dur-hover) var(--ease-out), color var(--dur-hover) var(--ease-out), border-color var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out);
```

(Editar **solo** la ocurrencia dentro de `.hero-cta-btn`. No tocar otras `transition: all` de global.css.)

- [ ] **Step 2: Build + asserts**

```bash
npm run build 2>&1 | tail -5
sed -n '578,591p' src/styles/global.css | grep -E 'transition: all' && echo "REVISAR: aun transition:all en hero-cta-btn" || echo "ASSERT_OK: hero-cta-btn sin transition:all"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 5 -- hero-cta-btn sin transition:all (CTA de 404 y home)"
```

---

### Task 3: articulos — filtros sin `transition: all`, `white` a token, hairline

**Files:**
- Modify: `src/pages/articulos.astro` (style líneas 163-185). **NO tocar `<script>`.**

- [ ] **Step 1: Reemplazar `.cat-filter-btn, .tipo-filter-btn` (líneas 163-176) — border 1.5px→1px, transition específica**

```css
  .cat-filter-btn, .tipo-filter-btn {
    padding: 0.4rem 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: 99px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color var(--dur-hover) var(--ease-out), color var(--dur-hover) var(--ease-out), background-color var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out);
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
```

- [ ] **Step 2: Reemplazar `.cat-filter-btn.active, .tipo-filter-btn.active` (líneas 181-185) — `white`→`--accent-ink`**

```css
  .cat-filter-btn.active, .tipo-filter-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--accent-ink);
  }
```

- [ ] **Step 3: Build + asserts**

```bash
npm run build 2>&1 | tail -5
grep -nE 'transition: all|color: white' src/pages/articulos.astro || echo "ASSERT_OK: sin transition:all ni white"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio (script intacto).

- [ ] **Step 4: Commit**

```bash
git add src/pages/articulos.astro
git commit -m "feat(rediseno): fase 5 -- articulos filtros sin transition:all, activo a accent-ink, hairline"
```

---

### Task 4: actualidad — pills `white` a token, hairline

**Files:**
- Modify: `src/pages/actualidad/index.astro` (style líneas 149-172). **NO tocar `<script>`.**

La `transition` de `.actualidad-tab` (línea 160) ya es específica. Solo border y `white`.

- [ ] **Step 1: Reemplazar `border: 1.5px` por `1px` en `.actualidad-tab` (línea 152)**

Cambiar:
```css
    border: 1.5px solid var(--color-border);
```
por:
```css
    border: 1px solid var(--color-border);
```

- [ ] **Step 2: Reemplazar `color: white` en `.actualidad-tab[aria-pressed="true"]` (línea 171)**

Cambiar (dentro de la regla `.actualidad-tab[aria-pressed="true"] { ... }`):
```css
    color: white;
```
por:
```css
    color: var(--accent-ink);
```

- [ ] **Step 3: Build + asserts**

```bash
npm run build 2>&1 | tail -5
grep -nE 'color: white|border: 1.5px' src/pages/actualidad/index.astro || echo "ASSERT_OK: sin white ni 1.5px"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 4: Commit**

```bash
git add src/pages/actualidad/index.astro
git commit -m "feat(rediseno): fase 5 -- actualidad pills a accent-ink y hairline"
```

---

### Task 5: [categoria] + guias — intro sin side-stripe 4px, heading hairline

**Files:**
- Modify: `src/pages/[categoria]/index.astro` (style líneas 157-181)
- Modify: `src/pages/guias/index.astro` (style líneas 96-119)

Las dos páginas tienen el mismo `.category-intro` con side-stripe de 4px (ban >1px) y `.subcat-heading` con border-bottom de 2px. Se sustituye el callout por un borde hairline completo y se baja el heading a 1px. **Cambio idéntico en ambos archivos.**

- [ ] **Step 1: `[categoria]/index.astro` — reemplazar `.category-intro` (líneas 158-164)**

```css
  .category-intro {
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
```

- [ ] **Step 2: `[categoria]/index.astro` — reemplazar el border-bottom de `.subcat-heading` (línea 179)**

Cambiar:
```css
    border-bottom: 2px solid var(--color-border);
```
por:
```css
    border-bottom: 1px solid var(--color-border);
```

- [ ] **Step 3: `guias/index.astro` — reemplazar `.category-intro` (líneas 97-103)**

```css
  .category-intro {
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
```

- [ ] **Step 4: `guias/index.astro` — reemplazar el border-bottom de `.subcat-heading` (línea 117)**

Cambiar:
```css
    border-bottom: 2px solid var(--color-border);
```
por:
```css
    border-bottom: 1px solid var(--color-border);
```

- [ ] **Step 5: Build + asserts**

```bash
npm run build 2>&1 | tail -5
grep -nE 'border-left: 4px|border-bottom: 2px' src/pages/[categoria]/index.astro src/pages/guias/index.astro || echo "ASSERT_OK: sin side-stripe 4px ni 2px"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 6: Commit**

```bash
git add src/pages/[categoria]/index.astro src/pages/guias/index.astro
git commit -m "feat(rediseno): fase 5 -- intro de categoria/guias sin side-stripe 4px, heading hairline"
```

---

### Task 6: calculadora `.ergo-*` — colores, sombras y side-stripes a editorial

**Files:**
- Modify: `src/styles/global.css` (bloque `.ergo-*`, líneas 2200-3070). **NO tocar `calculadora-ergonomia.astro` ni su `<script>`.**

Refactor de la superficie menos editorial del sitio. Reemplazos quirúrgicos: `#fff`→`--accent-ink`, AI-blue shadows→tinte de acento (o se quitan), emerald→acento de marca, gradientes decorativos→sólido, side-stripes→hairline/borde, sombra negra→token. **Se conservan** la escala de score `[data-color]` y el rojo de `--warn` (data-viz semántico, ver decisiones de scope).

> Aplica cada Edit con su contexto único de regla. Lee el bloque antes de editar para confirmar offsets (el build previo no ha movido líneas).

- [ ] **Step 1: step-dot `#fff` → `--accent-ink` (líneas 2221-2230)**

```css
.ergo-progress-steps li.is-active .ergo-step-dot {
  background: var(--color-primary);
  color: var(--accent-ink);
  box-shadow: 0 0 0 4px var(--ergo-blueprint-strong);
}

.ergo-progress-steps li.is-done .ergo-step-dot {
  background: var(--color-primary);
  color: var(--accent-ink);
}
```

- [ ] **Step 2: field-num focus ring AI-blue → acento (línea 2354)**

Dentro de `.ergo-field-num:focus`, cambiar:
```css
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
```
por:
```css
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
```

- [ ] **Step 3: slider track — quitar gradient muerto (líneas 2375-2380)**

Reemplazar la regla completa:
```css
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) calc((var(--val, 50) - 140) / 70 * 100%), var(--color-border) calc((var(--val, 50) - 140) / 70 * 100%));
  background: var(--color-border);
  border-radius: 2px;
}
```
por:
```css
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
}
```

- [ ] **Step 4: slider moz-progress gradient → sólido (líneas 2388-2392)**

Dentro de `input[type="range"]::-moz-range-progress`, cambiar:
```css
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
```
por:
```css
  background: var(--color-primary);
```

- [ ] **Step 5: slider thumb webkit — sombras AI-blue → acento (líneas 2394-2409)**

Reemplazar las dos reglas:
```css
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-bg-card);
  border: 3px solid var(--color-primary);
  margin-top: -8px;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 25%, transparent);
  transition: transform 120ms, box-shadow 120ms;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 38%, transparent);
}
```

- [ ] **Step 6: slider thumb moz — sombra AI-blue → acento (líneas 2411-2418)**

Dentro de `input[type="range"]::-moz-range-thumb`, cambiar:
```css
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
```
por:
```css
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 25%, transparent);
```

- [ ] **Step 7: chip checked — `#fff` + sombra AI-blue (líneas 2477-2482)**

```css
.ergo-chip input:checked + span {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--accent-ink);
}
```

- [ ] **Step 8: dolor-chip selected — quitar sombra AI-blue (líneas 2520-2524)**

```css
.ergo-dolor-chip.is-selected {
  border-color: var(--color-primary);
  background: var(--ergo-blueprint);
}
```

- [ ] **Step 9: dolor-chip "none" emerald → acento de marca (líneas 2526-2534)**

Reemplazar las dos reglas:
```css
.ergo-dolor-chip.ergo-dolor-chip--none.is-selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
}

[data-theme="dark"] .ergo-dolor-chip.ergo-dolor-chip--none.is-selected {
  color: var(--accent);
}
```

- [ ] **Step 10: dolor-icon "none" emerald → acento (líneas 2545-2547)**

Dentro de `.ergo-dolor-chip.ergo-dolor-chip--none.is-selected .ergo-dolor-icon`, cambiar:
```css
  color: #10b981;
```
por:
```css
  color: var(--accent);
```

- [ ] **Step 11: dolor-chip ✓ — `#fff` + emerald (líneas 2560-2579)**

En `.ergo-dolor-chip.is-selected::after` cambiar `color: #fff;` por `color: var(--accent-ink);`. En `.ergo-dolor-chip.ergo-dolor-chip--none.is-selected::after` cambiar `background: #10b981;` por `background: var(--accent);`.

- [ ] **Step 12: btn-primary — `#fff` + sombras AI-blue (líneas 2685-2696)**

```css
.ergo-btn-primary {
  background: var(--color-primary);
  color: var(--accent-ink);
  margin-left: auto;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 22%, transparent);
}

.ergo-btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent);
}
```

- [ ] **Step 13: share-btn hover — `#fff` → `--accent-ink` (línea 2746)**

Dentro de `.ergo-share-btn:hover`, cambiar `color: #fff;` por `color: var(--accent-ink);`.

- [ ] **Step 14: score-card — quitar side-stripe 4px, color al borde (líneas 2750-2773)**

Reemplazar `.ergo-score-card` y eliminar la regla `.ergo-score-card::before`:
```css
.ergo-score-card {
  --score-accent: var(--color-text-light);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.75rem;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: var(--color-bg-muted);
  border: 1px solid color-mix(in srgb, var(--score-accent) 45%, var(--color-border));
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  transition: border-color 300ms var(--ease-out);
}
```
(Eliminar por completo el bloque `.ergo-score-card::before { ... }` de las líneas 2766-2773. La escala `[data-color]` de 2775-2778 **se conserva**: ahora tinta el borde y el anillo `#ring-fill`.)

- [ ] **Step 15: measure — quitar side-stripe 3px (líneas 2885-2890)**

En `.ergo-measure`, eliminar la línea:
```css
  border-left: 3px solid var(--color-primary);
```
(El borde hairline `border: 1px solid var(--color-border)` ya presente queda como única separación.)

- [ ] **Step 16: tips — amber default → neutro, side-stripe fuera, `#fff` → token (líneas 2952-2988)**

Reemplazar:
```css
.ergo-tip {
  position: relative;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  line-height: 1.55;
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border);
}

.ergo-tip--warn {
  background: color-mix(in srgb, #ef4444 7%, var(--color-bg-card));
  border-color: color-mix(in srgb, #ef4444 30%, var(--color-border));
}

.ergo-tip::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.ergo-tip--warn::before {
  background: #ef4444;
  content: '!';
}
```
(El `#ef4444` del warning se conserva: estado semántico documentado.)

- [ ] **Step 17: cta — side-stripe 4px fuera, sombra negra → token, `#fff` → token (líneas 3024-3056)**

En `.ergo-cta` eliminar la línea `border-left: 4px solid var(--cta-color, var(--color-primary));`. En `.ergo-cta:hover` cambiar `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);` por `box-shadow: var(--shadow-md);`. En `.ergo-cta-num` cambiar `color: #fff;` por `color: var(--accent-ink);`.

- [ ] **Step 18: Build + asserts**

```bash
npm run build 2>&1 | tail -5
echo "== AI-blue / emerald / #fff en ergo =="
awk 'NR>=2200 && NR<=3070' src/styles/global.css | grep -nE 'rgba\(37, ?99, ?235|#10b981|#047857|#34d399|rgba\(16, ?185, ?129|color: #fff|background: #10b981' || echo "ASSERT_OK: sin AI-blue/emerald/#fff en ergo"
echo "== side-stripes >1px en ergo =="
awk 'NR>=2200 && NR<=3070' src/styles/global.css | grep -nE 'border-left: [2-9]px|width: 4px' | grep -v 'ring' || echo "ASSERT_OK: sin side-stripe >1px"
echo "== escala de score conservada =="
grep -nE 'data-color="(red|amber|greenLight|green)"' src/styles/global.css && echo "ASSERT_OK: escala de score intacta"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK` en AI-blue/emerald/#fff y side-stripes; escala de score presente; `_headers` limpio.

- [ ] **Step 19: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 5 -- calculadora .ergo-* a tokens (sin AI-blue, sin emerald, sin side-stripes)"
```

---

### Task 7: calculadora `.ergo-*` — motion sin `transition: all` + `:active` en chips

**Files:**
- Modify: `src/styles/global.css` (bloque `.ergo-*`). **NO tocar `calculadora-ergonomia.astro`.**

Los 6 `transition: all` de `.ergo-*` (emil ban). `.ergo-btn`/`.ergo-share-btn` son `<button>` (heredan `button:active` global de motion.css); los chips son `<label>` y necesitan `:active` explícito.

- [ ] **Step 1: `.ergo-step-dot` transition (línea 2217)**

Cambiar `transition: all 200ms;` por:
```css
  transition: background-color 200ms var(--ease-out), color 200ms var(--ease-out), box-shadow 200ms var(--ease-out);
```

- [ ] **Step 2: `.ergo-chip > span` transition (línea 2468)**

Cambiar `transition: all 180ms;` por:
```css
  transition: border-color 180ms var(--ease-out), background-color 180ms var(--ease-out), color 180ms var(--ease-out), transform var(--dur-press) var(--ease-out);
```

- [ ] **Step 3: `.ergo-dolor-chip` transition (línea 2505)**

Cambiar `transition: all 180ms;` por:
```css
  transition: border-color 180ms var(--ease-out), background-color 180ms var(--ease-out), transform 180ms var(--ease-out);
```

- [ ] **Step 4: `.ergo-btn` transition (línea 2681)**

Cambiar `transition: all 180ms;` por:
```css
  transition: background-color 180ms var(--ease-out), color 180ms var(--ease-out), border-color 180ms var(--ease-out), box-shadow 180ms var(--ease-out), transform var(--dur-press) var(--ease-out);
```

- [ ] **Step 5: `.ergo-share-btn` transition (línea 2740)**

Cambiar `transition: all 180ms;` por:
```css
  transition: background-color 180ms var(--ease-out), border-color 180ms var(--ease-out), color 180ms var(--ease-out);
```

- [ ] **Step 6: `.ergo-cta` transition (línea 3032)**

Cambiar `transition: all 220ms;` por:
```css
  transition: transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out), border-color 220ms var(--ease-out);
```

- [ ] **Step 7: añadir `:active` a los chips-label**

Justo después de la regla `.ergo-chip input:focus-visible + span { ... }` (termina ~línea 2487), añadir:
```css
.ergo-chip:active > span { transform: scale(0.97); }
```
Y justo después de `.ergo-dolor-chip:hover { ... }` (termina ~línea 2518), añadir:
```css
.ergo-dolor-chip:active { transform: scale(0.98); }
```

- [ ] **Step 8: Build + asserts**

```bash
npm run build 2>&1 | tail -5
awk 'NR>=2200 && NR<=3070' src/styles/global.css | grep -nE 'transition: all' || echo "ASSERT_OK: 0 transition:all en ergo"
grep -nE 'ergo-chip:active|ergo-dolor-chip:active' src/styles/global.css && echo "ASSERT_OK: :active en chips"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK` x2; `_headers` limpio.

- [ ] **Step 9: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 5 -- calculadora .ergo-* motion especifico + :active en chips"
```

---

### Task 8: em-dash visible — títulos y copy (sin schema, sin script)

**Files:**
- Modify: `src/pages/herramientas/index.astro` (línea 27)
- Modify: `src/pages/sobre-mi.astro` (línea 44)
- Modify: `src/pages/herramientas/calculadora-ergonomia.astro` (líneas 59, 298, 303, 386-387)

Cero em-dash visible (spec §4). Se sustituye el separador de `<title>` por ` | ` (mayoría del sitio) y los em-dash de copy por puntuación normal. **NO se tocan** las cadenas `name:` de schema (`sobre-mi.astro:37`, `calculadora-ergonomia.astro:22`) ni el `<script>`.

- [ ] **Step 1: `herramientas/index.astro:27` — separador de título**

Cambiar:
```astro
  title="Herramientas gratis para optimizar tu home office — Tu Espacio de Trabajo"
```
por:
```astro
  title="Herramientas gratis para optimizar tu home office | Tu Espacio de Trabajo"
```

- [ ] **Step 2: `sobre-mi.astro:44` — separador de título (solo el prop `title`, NO el schema de la línea 37)**

Cambiar:
```astro
<Base title="Sobre mí — Tu Espacio de Trabajo" description="Soy David Rubio, ingeniero y teletrabajador desde 2019. Analizo productos de home office para ayudarte a montar tu espacio ideal.">
```
por:
```astro
<Base title="Sobre mí | Tu Espacio de Trabajo" description="Soy David Rubio, ingeniero y teletrabajador desde 2019. Analizo productos de home office para ayudarte a montar tu espacio ideal.">
```

- [ ] **Step 3: `calculadora-ergonomia.astro:59` — em-dash en FAQ**

Cambiar el fragmento `demasiado alto — uno de los dos, no puedes evitarlo` por `demasiado alto: uno de los dos, no puedes evitarlo`.

- [ ] **Step 4: `calculadora-ergonomia.astro:386-387` — em-dash en prosa**

Cambiar:
```astro
        entre 170 y 180 cm. Pero la distribución real de estaturas tiene dos colas largas — mucha
        gente por debajo de 165 y por encima de 185 — y para esas personas la "altura estándar"
```
por:
```astro
        entre 170 y 180 cm. Pero la distribución real de estaturas tiene dos colas largas (mucha
        gente por debajo de 165 y por encima de 185), y para esas personas la "altura estándar"
```

- [ ] **Step 5: `calculadora-ergonomia.astro:298,303` — placeholder de score**

Cambiar `<div class="ergo-score-num" id="score-num">—</div>` por `<div class="ergo-score-num" id="score-num">·</div>` y `<span class="ergo-score-badge" id="score-badge">—</span>` por `<span class="ergo-score-badge" id="score-badge">·</span>`.

- [ ] **Step 6: Build + asserts**

```bash
npm run build 2>&1 | tail -5
echo "== em-dash visible restante (excluye schema name: y script) =="
grep -nE '—|–' src/pages/herramientas/index.astro src/pages/sobre-mi.astro | grep -vE "name: '"
grep -nE '—|–' src/pages/herramientas/calculadora-ergonomia.astro | grep -vE "name: '|tips.push|// =="
git status --porcelain public/_headers
```
Expected: build verde ~88; sin em-dash en `<title>`/prosa/placeholder (solo quedan los de schema `name:` y comentarios/strings del `<script>`, intencionales); `_headers` limpio (no se tocó `<script>`).

- [ ] **Step 7: Commit**

```bash
git add src/pages/herramientas/index.astro src/pages/sobre-mi.astro src/pages/herramientas/calculadora-ergonomia.astro
git commit -m "feat(rediseno): fase 5 -- em-dash fuera de titulos y copy (schema intacto)"
```

---

### Task 9: Verificación final de fase + barrido de cumplimiento

**Files:** ninguno (salvo nits que surjan; si aparece edit, commit propio).

- [ ] **Step 1: Build limpio y conteo de páginas**

```bash
npm run build 2>&1 | tail -8
```
Expected: verde, ≈88 páginas, sin warnings nuevos.

- [ ] **Step 2: Barrido AI-tell sobre las superficies de Fase 5**

```bash
FILES="src/pages/404.astro src/pages/articulos.astro src/pages/actualidad/index.astro src/pages/[categoria]/index.astro src/pages/guias/index.astro"
echo "== gradient-text / transition:all / white / side-stripe en páginas =="
grep -rnE 'background-clip: text|transition: all|color: white|border-left: [2-9]px|border-bottom: [2-9]px' $FILES || echo "ASSERT_OK: páginas limpias"
echo "== ergo: AI-blue / emerald / #fff / side-stripe / transition:all =="
awk 'NR>=2200 && NR<=3070' src/styles/global.css | grep -nE 'rgba\(37, ?99, ?235|#10b981|#047857|#34d399|color: #fff|border-left: [2-9]px|transition: all' || echo "ASSERT_OK: ergo limpio"
echo "== hero-cta-btn transition =="
sed -n '578,591p' src/styles/global.css | grep -E 'transition: all' && echo "REVISAR" || echo "ASSERT_OK: hero-cta-btn limpio"
echo "== :active en pressables de ergo (chips) =="
grep -nE 'ergo-chip:active|ergo-dolor-chip:active' src/styles/global.css
```
Expected: `ASSERT_OK` en todos los bloques; `:active` presente en chips.

- [ ] **Step 3: Integridad schema/JSON-LD + afiliado intactos**

```bash
echo "== schema name: con em-dash conservado byte a byte =="
grep -nE "name: 'Sobre mí — |name: 'Calculadora de ergonomía — " src/pages/sobre-mi.astro src/pages/herramientas/calculadora-ergonomia.astro && echo "ASSERT_OK: schema name intacto"
echo "== _headers (hashes CSP) sin cambios en toda la fase =="
git status --porcelain public/_headers && echo "(esperado: vacio)"
echo "== ningún <script> tocado: diff de scripts inline =="
git diff 5baf981..HEAD -- src/pages/herramientas/calculadora-ergonomia.astro | grep -nE '^\+' | grep -iE 'define:vars|addEventListener|const C_SAFE|woodC' && echo "REVISAR: script tocado" || echo "ASSERT_OK: script intacto"
```
Expected: schema `name:` presente con em-dash; `_headers` vacío; script no tocado.

- [ ] **Step 4: Pre-Flight Check (design-taste-frontend §14) sobre superficies tocadas**

Verificación manual (anotar en el resumen de cierre): color consistency lock (un solo verde abeto; cero AI-blue/emerald en ergo), shape lock (radio único, hairlines ≤1px salvo borde de score-card que es 1px tintado), sin gradient-text/glass/hero-metric/side-stripe >1px, contraste AA light+dark en: pills activas (`--accent-ink` sobre acento), score-card y badges (escala semántica), chips checked, tips. Pase visual diferido en navegador (light + dark): `/404`, `/articulos/`, `/actualidad/`, `/sillas/`, `/guias/`, `/herramientas/calculadora-ergonomia/`.

- [ ] **Step 5: Resumen de cierre de Fase 5**

Escribir resumen breve (commits, asserts, decisiones: 7/8 `transition: all` resueltos —queda `.footer-back-top:1392` para Fase 6—, excepciones de data-viz semántico conservadas, schema intacto). Pendientes para Fase 6: eliminar alias legacy, `.footer-back-top` transition, AI slop test final, CWV. Sin commit adicional salvo que el Step 4 destape un fix.

---

## Self-Review (checklist del autor del plan)

**1. Cobertura de spec §6 "Secundarias"** (`buscar`, `actualidad`, `guias`, `herramientas`, `[categoria]/index`, `articulos`, legales, `sobre-mi`, `404`):
- `404` → T1 (gradient-text). ✓
- `articulos` → T3 (transition:all, white, hairline). ✓
- `actualidad` → T4 (white, hairline). ✓
- `[categoria]/index` + `guias` → T5 (side-stripe, heading). ✓
- `herramientas/*` (calculadora) → T6 (colores/sombras/stripes) + T7 (motion) + T8 (em-dash). ✓
- `buscar`, `sobre-mi`, legales, `guias/[slug]`, `herramientas/index` → auditadas limpias (solo em-dash de título en herramientas/index + sobre-mi → T8). ✓
- bans absolutos §1 (side-stripe >1px, gradient-text, glass, hero-metric, card grids): side-stripe → T5/T6; gradient-text → T1; gradient decorativo → T6; glass/hero-metric/card-grid: ninguno detectado en scope. ✓
- §3 estados/feedback `:active` → T7 (chips); pressables `<button>` y `.affiliate-button` ya cubiertos (global). ✓
- §4 cero em-dash → T8. ✓

**2. Placeholder scan:** sin TBD/TODO; cada step con CSS/markup/comando literal y expected. ✓

**3. Consistencia de tokens/clases:** `--accent-ink`, `--accent`, `--shadow-md`, `--dur-press`, `--dur-hover`, `--ease-out`, `--ergo-blueprint`, `--ergo-blueprint-strong` confirmados en `global.css`/`motion.css`. Las clases `.ergo-*` editadas existen tal cual en el bloque global. Escala `[data-color]` y `--warn` rojo conservados deliberadamente (documentado). ✓

**4. Riesgos:** ninguna task edita `<script>` inline → `_headers` estable (assert por task + T9). Schema/JSON-LD `name:` con em-dash conservado byte a byte (assert en T8/T9). Tag/ASIN de afiliado no entra en ninguna task. El único `transition: all` que queda (`.footer-back-top:1392`) es chrome de footer → Fase 6, documentado.
