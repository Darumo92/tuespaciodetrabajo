# Rediseño editorial — Fase 4 (Catálogo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans para ejecutar task por task. Los steps usan checkbox (`- [ ]`).

**Goal:** Eliminar los AI-tells hardcodeados de los componentes de catálogo/ficha (`producto/*`) y dejarlos editoriales (hairlines, acento único verde abeto, feedback táctil `:active`), sin tocar schema ni afiliados.

**Architecture:** Los tokens editoriales de Fase 0 ya están vivos y los nombres legacy (`--color-primary`, `--color-secondary`, `--radius-lg`...) están **aliased** al sistema editorial en `global.css:103-137` (`--color-primary: var(--accent)`, etc.). Por tanto la base (color de marca verde, radio 6px, Schibsted/Source Serif) ya se aplica a estos componentes vía alias. El trabajo de Fase 4 es quirúrgico: cazar los **colores y formas hardcodeados** que se saltan los alias (AI-blue, green dashboard, side-stripes 3px, gradientes, tracks de progreso rellenos, sombras pesadas) y reemplazarlos por tokens/hairlines, más añadir `:active scale` a los pressables que faltan.

**Tech Stack:** Astro 5 (componentes `.astro` con `<style>` scoped), CSS plano con custom properties, sin Tailwind/React/Motion. Build estático Cloudflare Pages.

---

## Baseline de auditoría (estado real 2026-06-14, rama `feat/catalogo-multicategoria`)

Tabla de hallazgos AI-tell con `archivo:línea`. Todos confirmados leyendo el código.

| # | Archivo:línea | AI-tell detectado | Skill / regla violada | Fix en task |
|---|---|---|---|---|
| 1 | `ValoracionEjes.astro:37-38` | Barra de progreso con **track de fondo relleno** (`.vejes-track` gris) + `.vejes-fill` con **gradient** `linear-gradient(90deg, var(--color-primary), #60a5fa)` (AI-blue) | spec §3 (ban track relleno), impeccable (gradient, glass/dashboard slop), design-taste §9 | T1 |
| 2 | `ValoracionEjes.astro:40` | `repeating-linear-gradient` (hatch diagonal) para estado n/d | impeccable (gradiente decorativo) | T1 |
| 3 | `TarjetaProducto.astro:52` | `.card.cmp-sel { box-shadow: 0 0 0 2px #bfdbfe }` → **AI-blue** hardcodeado | impeccable (color consistency lock; azul-IA) | T2 |
| 4 | `TarjetaProducto.astro:59` | `.card-score { background: var(--color-text); color: #fff }` → `#fff` hardcodeado (rompe dark) | impeccable (token bypass) | T2 |
| 5 | `TarjetaProducto.astro:62` | `.chip { color: #3f3f46 }` → gris hardcodeado | impeccable (token bypass) | T2 |
| 6 | `TarjetaProducto.astro` (markup) | pressable `.card-cmp` sin `:active` | emil (feedback táctil) | T2 |
| 7 | `ParaQuien.astro:26-27` | `#16a34a` (verde brillante) + `#dc2626` (rojo) hardcodeados; **segundo verde** distinto del acento de marca | design-taste (color consistency lock; dos verdes) | T3 |
| 8 | `TablaVs.astro:50` | `.vs-win { box-shadow: inset 3px 0 0 #16a34a }` → **side-stripe 3px** (>1px) + verde hardcodeado | impeccable (ban side-stripe >1px), design-taste §9 | T4 |
| 9 | `TablaVs.astro:51` | `.vs-wtag { color: #16a34a }` hardcodeado | impeccable (color lock) | T4 |
| 10 | `ComparadorProductos.astro:26` | `.cmp-win { box-shadow: inset 3px 0 0 #16a34a }` → **side-stripe 3px** + verde hardcodeado | impeccable (ban side-stripe >1px) | T5 |
| 11 | `ComparadorProductos.astro:27` | `.cmp-wtag { color: #16a34a }` hardcodeado | impeccable (color lock) | T5 |
| 12 | `ComparadorProductos.astro:29` | `.cmp-cta { background: var(--color-primary); color: #fff }` → `#fff` hardcodeado; CTA sin `:active` | impeccable (token bypass) + emil | T5 |
| 13 | `CatalogoProductos.astro:192,235,241` | `.cmp-bar { background: var(--color-text); color: #fff; box-shadow: 0 -10px 24px rgb(0 0 0/.16) }` → `#fff` hardcodeado + **sombra pesada** | impeccable (jerarquía por líneas, no sombras pesadas) | T6 |
| 14 | `CatalogoProductos.astro:222` | `.cmp-go { color: #3a2a00; background: var(--color-secondary) }` → marrón hardcodeado; `.cmp-go/.cmp-clear` sin `:active` | impeccable (token bypass) + emil | T6 |
| 15 | `FichaProducto.astro:74` | `.ficha-specs th, td { border-bottom: 1px solid var(--color-border) }` → **hairline en cada fila** (mismo slop que la spec marcó para ComparisonTable §3) | spec §3 (sin hairline en cada fila) | T7 |
| 16 | `global.css:1145` | `.affiliate-button { transition: all var(--transition) }` → **`transition: all`** (CTA afiliado Amazon, render en catálogo) | emil (nunca `transition: all`) | T8 |

### Notas de la auditoría (lo que NO se toca)
- **Sin em-dash** en ningún componente `producto/*` (grep limpio). No hay copy que humanizar en esta fase salvo verificar al cierre.
- **Esquema de producto + afiliado intactos:** `BotonPrecio.astro` (rel `sponsored nofollow noopener noreferrer`, `buildAmazonHref`), `data-*` de filtros/comparador, JSON `data-json`, `lib/productos` y `lib/tipos` NO se tocan en ninguna task. Solo se editan bloques `<style>` (y markup mínimo de `ValoracionEjes`/`TarjetaProducto` para añadir `:active`/quitar el track).
- **Scripts inline:** `CatalogoProductos.astro` y `ComparadorProductos.astro` tienen `<script>`. Las tasks editan únicamente `<style>` y markup estático, **no** el contenido de `<script>`. Por tanto los hashes CSP no cambian → `public/_headers` debe quedar idéntico. Verificación obligatoria por task.
- **`.card-grid` de catálogo** (`.catalogo-grid`, `auto-fill minmax(320px,1fr)`) es un **listado de productos legítimo**, no un "card grid idéntico repetido" decorativo. No es violación; se conserva.
- **Amazon `#ff9900`** (`affiliate-button.amazon`, `global.css:1162`) es **color de marca obligatorio de Amazon**, NO se cambia. En T8 solo se corrige `transition: all`.

### Decisión sobre `.affiliate-button` (global.css:1145) — el "OJO" de Fase 3
**Entra en Fase 4** (Task 8). Razón: el botón Amazon es el **pressable primario de afiliado en todas las superficies de catálogo** (`TarjetaProducto`, `FichaProducto`, `TablaVs` lo renderizan vía `BotonPrecio`), y `transition: all` es un ban duro de emil. El fix es byte-aislado a la regla global (solo cambia QUÉ propiedades transicionan, no el aspecto): hover/active idénticos. Afecta también a páginas de artículo (Fase 3), pero es una mejora pura de cumplimiento sin regresión visual. Los otros `transition: all` de `global.css` (589, 1392, 2217, 2468, 2505, 2681, 2740, 3032) son de componentes/páginas **fuera de scope** de catálogo → quedan para Fase 5/6.

### Pase visual manual (diferido al cierre)
Tras T9, pase manual en navegador (light + dark): catálogo (`/catalogo/sillas/`), ficha (`/catalogo/sillas/<slug>/`), comparador (`/comparar/sillas/?s=a,b`). No bloquea los commits de las tasks.

---

## File Structure

Todos los cambios son scoped al `<style>` (y markup puntual) de cada componente, más una regla global en T8. Un commit por task.

- `src/components/producto/ValoracionEjes.astro` — T1 (markup + style)
- `src/components/producto/TarjetaProducto.astro` — T2 (markup + style)
- `src/components/producto/ParaQuien.astro` — T3 (style)
- `src/components/producto/TablaVs.astro` — T4 (style)
- `src/components/producto/ComparadorProductos.astro` — T5 (style)
- `src/components/producto/CatalogoProductos.astro` — T6 (style)
- `src/components/producto/FichaProducto.astro` — T7 (style)
- `src/styles/global.css` — T8 (regla `.affiliate-button`)
- T9 — verificación final, sin edits salvo nits que surjan

**Tokens disponibles (confirmados en `global.css`):** `--accent`, `--accent-hover`, `--accent-ink`, `--bg`, `--ink`, `--ink-muted`, `--surface`, `--surface-muted`, `--border`, `--border-strong`, `--radius`, `--radius-sm`, `--font-display`, `--font-serif`, `--dur-press`, `--dur-hover`, `--dur-reveal`, `--ease-out`, y los alias legacy (`--color-primary`→`--accent`, `--color-secondary`→`--accent`, `--color-text`→`--ink`, `--color-text-muted`→`--ink-muted`, `--color-bg`→`--bg`, `--color-bg-card`→`--surface`, `--color-bg-muted`→`--surface-muted`, `--color-border`→`--border`, `--color-border-dark`→`--border-strong`, `--radius-md/lg`→`--radius`). Se usan los **alias legacy** dentro de cada componente para minimizar diff y coherencia con el código existente; solo se introducen tokens editoriales nuevos (`--accent-ink`) donde no hay alias equivalente.

---

## Reglas de verificación (todas las tasks)

Cada task termina con:
1. `npm run build` → **verde, ≈88 páginas** (sin regresión de conteo).
2. Asserts `grep` específicos de la task (abajo).
3. `git status --porcelain public/_headers` → **vacío** (sin cambios de hashes CSP).
4. Commit propio con mensaje `feat(rediseno): fase 4 -- <resumen>`.

Banlist global a re-verificar por task sobre los archivos tocados (deben dar **0 matches**):
- `grep -nE '#(60a5fa|bfdbfe|16a34a|dc2626|3a2a00|3f3f46)' <archivo>` (hex AI/hardcoded de la baseline)
- `grep -nE 'inset [0-9]+px' <archivo>` (side-stripes)
- `grep -nE 'transition: all|transition:all' <archivo>`
- `grep -nE '—|–' <archivo>` (em-dash)

---

### Task 1: ValoracionEjes — matar track de progreso + gradient + AI-blue

**Files:**
- Modify: `src/components/producto/ValoracionEjes.astro` (markup líneas 17-25, style líneas 27-42)

Reemplaza la barra de progreso de dashboard (track gris relleno + fill con gradiente azul) por una **barra fina sin track** (solo el trazo de acento, fondo transparente) con el número en primer plano. Estado n/d sin hatch.

- [ ] **Step 1: Reemplazar el bloque markup `.vejes-bars`**

Sustituir las líneas 17-25 (el `<div class="vejes-bars">...</div>`) por:

```astro
  <div class="vejes-list">
    {ejes.map((e) => (
      <div class={`vejes-row${e.valor == null ? ' vejes-nd' : ''}`}>
        <span class="vejes-lbl">{e.etiqueta}</span>
        <span class="vejes-bar" style={e.valor == null ? undefined : `--pct:${e.valor * 10}%`} aria-hidden="true"></span>
        <span class="vejes-val">{e.valor == null ? 'sin valorar' : e.valor.toFixed(1)}</span>
      </div>
    ))}
  </div>
```

- [ ] **Step 2: Reemplazar las reglas de barras en `<style>`**

Sustituir las reglas `.vejes-bars`, `.vejes-row`, `.vejes-track`, `.vejes-fill`, `.vejes-val`, `.vejes-nd .vejes-fill`, `.vejes-nd .vejes-val` (líneas 35-41) por:

```css
  .vejes-list { display: grid; gap: 0.6rem; max-width: 520px; }
  .vejes-row { display: grid; grid-template-columns: 130px 1fr 44px; align-items: center; gap: 0.85rem; font-size: 0.85rem; }
  .vejes-lbl { color: var(--color-text-muted); }
  .vejes-bar { position: relative; height: 2px; }
  .vejes-bar::before { content: ""; position: absolute; left: 0; top: 0; height: 2px; width: var(--pct, 0); background: var(--accent); }
  .vejes-val { font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; text-align: right; font-variant-numeric: tabular-nums; }
  .vejes-nd .vejes-bar { border-top: 1px dashed var(--color-border); }
  .vejes-nd .vejes-bar::before { content: none; }
  .vejes-nd .vejes-val { color: var(--color-text-muted); font-weight: 500; font-size: 0.72rem; }
```

- [ ] **Step 3: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE 'gradient|#60a5fa|vejes-track|vejes-fill' src/components/producto/ValoracionEjes.astro || echo "ASSERT_OK: sin gradient/track/fill/AI-blue"
grep -nE 'vejes-bar::before' src/components/producto/ValoracionEjes.astro && echo "ASSERT_OK: barra fina presente"
git status --porcelain public/_headers
```
Expected: build verde ~88 páginas; `ASSERT_OK` en ambos; `public/_headers` sin cambios.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/ValoracionEjes.astro
git commit -m "feat(rediseno): fase 4 -- ValoracionEjes barra fina sin track, sin gradient ni AI-blue"
```

---

### Task 2: TarjetaProducto — ring de selección, badge score y chip a tokens + `:active`

**Files:**
- Modify: `src/components/producto/TarjetaProducto.astro` (style líneas 51-63)

- [ ] **Step 1: Añadir `:active` al pressable `.card-cmp`**

En `<style>`, justo después de la regla `.card-cmp { ... }` (línea 53), añadir:

```css
  .card-cmp { transition: border-color var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out); }
  .card-cmp:active { transform: scale(0.97); }
```

- [ ] **Step 2: Reemplazar `.card.cmp-sel` (línea 52) — ring AI-blue → acento**

```css
  .card.cmp-sel { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent); }
```

- [ ] **Step 3: Reemplazar `.card-score` (línea 59) — `#fff` → token**

```css
  .card-score { background: var(--color-text); color: var(--color-bg); font-family: var(--font-display); font-size: 0.78rem; border-radius: var(--radius-sm); padding: 0.1rem 0.45rem; }
```

- [ ] **Step 4: Reemplazar `.chip` (línea 62) — `#3f3f46` → token**

```css
  .chip { font-size: 0.7rem; background: var(--color-bg-muted); color: var(--color-text); border-radius: var(--radius-sm); padding: 0.1rem 0.45rem; }
```

- [ ] **Step 5: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE '#bfdbfe|#3f3f46|color: #fff' src/components/producto/TarjetaProducto.astro || echo "ASSERT_OK: sin hex hardcoded"
grep -nE 'card-cmp:active' src/components/producto/TarjetaProducto.astro && echo "ASSERT_OK: active presente"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK` x2; `_headers` limpio.

- [ ] **Step 6: Commit**

```bash
git add src/components/producto/TarjetaProducto.astro
git commit -m "feat(rediseno): fase 4 -- TarjetaProducto ring/badge/chip a tokens, :active en comparar"
```

---

### Task 3: ParaQuien — unificar ✓/✗ al acento + neutro (un solo verde)

**Files:**
- Modify: `src/components/producto/ParaQuien.astro` (style líneas 26-27)

El `#16a34a` es un **segundo verde** distinto del acento de marca (rompe color lock) y `#dc2626` es un rojo brillante. Editorial: ✓ al acento de marca, ✗ a tinta atenuada (la semántica "sí/no" la lleva el texto del encabezado, no un semáforo).

- [ ] **Step 1: Reemplazar las dos reglas `::before` (líneas 26-27)**

```css
  .pq-si li::before { content: "✓"; position: absolute; left: 0; color: var(--accent); font-weight: 700; }
  .pq-no li::before { content: "✕"; position: absolute; left: 0; color: var(--color-text-muted); font-weight: 700; }
```

- [ ] **Step 2: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE '#16a34a|#dc2626' src/components/producto/ParaQuien.astro || echo "ASSERT_OK: sin verde/rojo hardcoded"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 3: Commit**

```bash
git add src/components/producto/ParaQuien.astro
git commit -m "feat(rediseno): fase 4 -- ParaQuien marcadores al acento unico y tinta atenuada"
```

---

### Task 4: TablaVs — quitar side-stripe 3px + verde hardcoded

**Files:**
- Modify: `src/components/producto/TablaVs.astro` (style líneas 50-51)

- [ ] **Step 1: Reemplazar `.vs-win` (línea 50) — sin side-stripe, fondo tinta-acento sutil**

```css
  .vs-win { background: color-mix(in srgb, var(--accent) 8%, var(--color-bg-card)); color: var(--color-text); }
```

- [ ] **Step 2: Reemplazar `.vs-wtag` (línea 51) — verde hardcoded → acento**

```css
  :global(.vs-wtag) { display: inline-block; margin-left: 0.35rem; font-size: 0.58rem; font-weight: 700; color: var(--accent); text-transform: uppercase; }
```

- [ ] **Step 3: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE 'inset [0-9]+px|#16a34a' src/components/producto/TablaVs.astro || echo "ASSERT_OK: sin side-stripe ni verde hardcoded"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 4: Commit**

```bash
git add src/components/producto/TablaVs.astro
git commit -m "feat(rediseno): fase 4 -- TablaVs sin side-stripe 3px, ganador con tinte acento"
```

---

### Task 5: ComparadorProductos — win sin side-stripe, CTA a tokens + `:active`

**Files:**
- Modify: `src/components/producto/ComparadorProductos.astro` (style líneas 26-29). **NO tocar `<script>`.**

- [ ] **Step 1: Reemplazar `.cmp-win` (línea 26) — sin side-stripe**

```css
  .cmp :global(.cmp-win) { background: color-mix(in srgb, var(--accent) 8%, var(--color-bg-card)); color: var(--color-text); }
```

- [ ] **Step 2: Reemplazar `.cmp-wtag` (línea 27) — verde hardcoded → acento**

```css
  .cmp :global(.cmp-wtag) { display: inline-block; font-size: 0.58rem; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-left: 0.35rem; }
```

- [ ] **Step 3: Reemplazar `.cmp-cta` (línea 29) — `#fff` → `--accent-ink`, radio token, `:active`**

```css
  .cmp :global(.cmp-cta) { display: inline-block; background: var(--accent); color: var(--accent-ink); font-weight: 600; font-size: 0.78rem; padding: 0.45rem 0.9rem; border-radius: var(--radius); text-decoration: none; transition: background var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out); }
  .cmp :global(.cmp-cta:active) { transform: scale(0.97); }
```

- [ ] **Step 4: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE 'inset [0-9]+px|#16a34a|color: #fff' src/components/producto/ComparadorProductos.astro || echo "ASSERT_OK: limpio"
grep -nE 'cmp-cta:active' src/components/producto/ComparadorProductos.astro && echo "ASSERT_OK: active CTA"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK` x2; `_headers` limpio (script intacto).

- [ ] **Step 5: Commit**

```bash
git add src/components/producto/ComparadorProductos.astro
git commit -m "feat(rediseno): fase 4 -- Comparador sin side-stripe, CTA a accent-ink con :active"
```

---

### Task 6: CatalogoProductos — barra de comparación a tokens, sin sombra pesada + `:active`

**Files:**
- Modify: `src/components/producto/CatalogoProductos.astro` (style líneas 180-242). **NO tocar `<script>`.**

- [ ] **Step 1: Reemplazar `.cmp-bar` (líneas 180-194) — `#fff` → token, sombra pesada → hairline**

Sustituir el bloque `.cmp-bar { ... }`:

```css
  .cmp-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 0.78rem max(1rem, env(safe-area-inset-right)) calc(0.78rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
    background: var(--color-text);
    color: var(--color-bg);
    box-shadow: 0 -1px 0 var(--color-border-dark);
  }
```

- [ ] **Step 2: Reemplazar `.cmp-go` (líneas 219-225) — marrón `#3a2a00` → `--accent-ink`**

```css
  .cmp-go {
    display: inline-flex;
    align-items: center;
    color: var(--accent-ink);
    background: var(--accent);
    text-decoration: none;
  }
```

- [ ] **Step 3: Reemplazar `.cmp-clear` (líneas 232-237) — `#fff` → token sobre la barra oscura**

```css
  .cmp-clear {
    border: 1px solid color-mix(in srgb, var(--color-bg) 35%, transparent);
    background: transparent;
    color: var(--color-bg);
    cursor: pointer;
  }
```

- [ ] **Step 4: Reemplazar el bloque `.cmp-clear:hover, :focus-visible` (líneas 239-242) y añadir `:active` a ambos botones**

Sustituir:

```css
  .cmp-clear:hover,
  .cmp-clear:focus-visible {
    border-color: var(--color-bg);
  }

  .cmp-go,
  .cmp-clear { transition: transform var(--dur-press) var(--ease-out); }

  .cmp-go:active,
  .cmp-clear:active { transform: scale(0.97); }
```

- [ ] **Step 5: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE '#fff|#3a2a00|0 -10px 24px' src/components/producto/CatalogoProductos.astro || echo "ASSERT_OK: sin hex/sombra pesada"
grep -nE 'cmp-clear:active|cmp-go:active' src/components/producto/CatalogoProductos.astro && echo "ASSERT_OK: active barra"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK` x2; `_headers` limpio (script intacto).

- [ ] **Step 6: Commit**

```bash
git add src/components/producto/CatalogoProductos.astro
git commit -m "feat(rediseno): fase 4 -- CatalogoProductos barra cmp a tokens, hairline en vez de sombra, :active"
```

---

### Task 7: FichaProducto — tabla de specs sin hairline en cada fila

**Files:**
- Modify: `src/components/producto/FichaProducto.astro` (style líneas 73-75)

La spec §3 marcó "sin hairline en cada fila" como slop para la tabla de comparativa; la `.ficha-specs` lo repite (border-bottom en cada `<tr>`). Como las filas ya están agrupadas por `.ficha-grupo` con su `<h3>` kicker, basta con una separación más sutil: hairline solo entre filas (no en la última) y atenuar el tono.

- [ ] **Step 1: Reemplazar las reglas `.ficha-specs` (líneas 73-75)**

Sustituir:

```css
  .ficha-specs { width: 100%; border-collapse: collapse; }
  .ficha-specs th, .ficha-specs td { text-align: left; padding: 0.5rem 0.75rem; }
  .ficha-specs tr + tr th, .ficha-specs tr + tr td { border-top: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent); }
  .ficha-specs th { width: 50%; color: var(--color-text-muted); font-weight: 600; }
```

- [ ] **Step 2: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
grep -nE 'border-bottom: 1px solid var\(--color-border\)' src/components/producto/FichaProducto.astro && echo "REVISAR: aun hay border-bottom por fila" || echo "ASSERT_OK: sin hairline por fila"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio.

- [ ] **Step 3: Commit**

```bash
git add src/components/producto/FichaProducto.astro
git commit -m "feat(rediseno): fase 4 -- FichaProducto specs agrupadas sin hairline en cada fila"
```

---

### Task 8: affiliate-button global — eliminar `transition: all`

**Files:**
- Modify: `src/styles/global.css:1145`

Decisión documentada arriba: el CTA Amazon es el pressable primario de catálogo. Fix byte-aislado: solo cambia qué propiedades transicionan; hover (`translateY(-1px)` + box-shadow) y `:active scale(0.97)` se conservan idénticos. Amazon `#ff9900` **no se toca**.

- [ ] **Step 1: Reemplazar la línea 1145**

Cambiar (dentro del bloque `.affiliate-button { ... }` que empieza en la línea 1132):

```css
  transition: all var(--transition);
```

por:

```css
  transition: background var(--dur-hover) var(--ease-out), color var(--dur-hover) var(--ease-out), transform var(--dur-press) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out);
```

(Editar **solo** la ocurrencia dentro de `.affiliate-button`. NO tocar las otras `transition: all` de global.css.)

- [ ] **Step 2: Build + asserts**

Run:
```bash
npm run build 2>&1 | tail -5
sed -n '1132,1148p' src/styles/global.css | grep -nE 'transition: all' && echo "REVISAR: aun transition:all en affiliate-button" || echo "ASSERT_OK: affiliate-button sin transition:all"
git status --porcelain public/_headers
```
Expected: build verde ~88; `ASSERT_OK`; `_headers` limpio (no hay scripts inline implicados → hashes intactos).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 4 -- affiliate-button sin transition:all (CTA afiliado de catalogo)"
```

---

### Task 9: Verificación final de fase + barrido de cumplimiento

**Files:** ninguno (salvo nits que surjan; si aparece edit, commit propio).

- [ ] **Step 1: Build limpio y conteo de páginas**

Run:
```bash
npm run build 2>&1 | tail -8
```
Expected: verde, ≈88 páginas, sin warnings nuevos.

- [ ] **Step 2: Barrido AI-tell sobre todos los componentes de catálogo**

Run:
```bash
echo "== hex AI/hardcoded =="
grep -rnE '#(60a5fa|bfdbfe|16a34a|dc2626|3a2a00|3f3f46)' src/components/producto/ || echo "ASSERT_OK: 0 hex hardcoded"
echo "== side-stripes =="
grep -rnE 'inset [0-9]+px' src/components/producto/ || echo "ASSERT_OK: 0 side-stripe"
echo "== gradient =="
grep -rnE 'gradient' src/components/producto/ || echo "ASSERT_OK: 0 gradient"
echo "== transition:all en producto + affiliate-button =="
grep -rnE 'transition: all|transition:all' src/components/producto/ ; sed -n '1132,1148p' src/styles/global.css | grep -E 'transition: all' || echo "ASSERT_OK: 0 transition:all en scope"
echo "== em-dash =="
grep -rnE '—|–' src/components/producto/ || echo "ASSERT_OK: 0 em-dash"
echo "== :active en pressables =="
grep -rnE ':active' src/components/producto/*.astro
```
Expected: `ASSERT_OK` en hex, side-stripe, gradient, transition:all, em-dash; `:active` presente en TarjetaProducto/Comparador/CatalogoProductos.

- [ ] **Step 3: Integridad afiliado + schema intactos**

Run:
```bash
git diff --stat 50fc005..HEAD -- src/lib/ src/components/BotonPrecio.astro src/components/StoreIcon.astro && echo "(esperado: vacio = lib/afiliado intactos)"
grep -nE 'sponsored nofollow noopener noreferrer' src/components/BotonPrecio.astro && echo "ASSERT_OK: rel afiliado intacto"
git status --porcelain public/_headers && echo "(esperado: vacio)"
```
Expected: `git diff --stat` de `lib/` y `BotonPrecio`/`StoreIcon` **vacío**; rel afiliado presente; `_headers` sin cambios.

- [ ] **Step 4: Pre-Flight Check (design-taste-frontend §14) sobre superficies tocadas**

Verificación manual (anotar en el resumen de cierre): color consistency lock (un solo verde abeto, sin AI-blue), shape lock (radio único), sin glass/gradient/hero-metric/side-stripe, contraste AA light+dark en badge score, `.cmp-bar`, `.vs-win`/`.cmp-win`, ring de selección. Pase visual diferido en navegador (light + dark): `/catalogo/sillas/`, una ficha, `/comparar/sillas/?s=<a>,<b>`.

- [ ] **Step 5: Resumen de cierre de Fase 4**

Escribir resumen breve (commits, asserts, decisión affiliate-button, pendientes para Fase 5/6: resto de `transition: all` en global.css). Sin commit adicional salvo que el Step 4 destape un fix.

---

## Self-Review (checklist del autor del plan)

**1. Cobertura de spec §3 "Catálogo / ficha":**
- "TarjetaProducto y FichaProducto editoriales" → T2, T7. ✓
- "ValoracionEjes sin barras de progreso con track de fondo relleno → número + icono o barra fina sin track" → T1 (barra fina sin track + número prominente). ✓
- "Comparador y TablaVs coherentes" → T4, T5. ✓
- "ImagenProducto/FallbackImagen coherentes" → auditados, ya usan `--color-bg-muted`/`--radius-md` (alias editorial), sin AI-tells. Sin edit necesario; verificado en baseline y T9. ✓
- "ParaQuien coherente" → T3. ✓
- "CatalogoProductos coherente, sin gradientes/glass" → T6 + baseline (sin glass/gradient). ✓
- Feedback táctil `:active` (estados, spec §3) → T2, T5, T6 (+ BotonPrecio web-oficial ya en Fase 3, affiliate-button en T8). ✓
- bans absolutos §1 (side-stripe >1px, gradient, glass, hero-metric, card grids) → T1/T4/T5 (side-stripe+gradient); glass/hero-metric/card-grid: ninguno detectado en scope. ✓

**2. Placeholder scan:** sin TBD/TODO; cada step con CSS/markup literal y comandos con expected. ✓

**3. Type/clase consistency:** clases nuevas `.vejes-list`/`.vejes-bar` reemplazan completas a `.vejes-bars`/`.vejes-track`/`.vejes-fill` (markup y style en la misma T1). `--accent-ink`, `--accent`, `--dur-press`, `--dur-hover`, `--ease-out`, `--radius`, `--radius-sm` confirmados en `global.css`. ✓

**4. Riesgos:** scripts inline de Catalogo/Comparador NO se tocan → `_headers` estable (assert por task). Afiliado/schema en `lib/` no entran en ninguna task (assert en T9). Un solo `transition: all` de scope (affiliate-button); el resto, fuera de catálogo, queda para Fase 5/6 (documentado).
</content>
