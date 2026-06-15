# Fase 6 (Pulido) — Rediseño Editorial: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el rediseño editorial eliminando por completo la capa de alias legacy (reemplazándola 1:1 por los tokens editoriales canónicos), resolviendo los AI-tells residuales y verificando a11y/contraste/CWV/cross-browser, dejando un único sistema de tokens sin deuda.

**Architecture:** El barrido alias→token es un refactor **transparente**: cada alias está definido en `global.css :root`/`dark` como `var(--alias): var(--token)`, así que reemplazar `var(--alias)` por `var(--token)` produce render byte-idéntico. Se aplica con un script determinista de orden fijo (`scripts/migrate-alias.sh`, temporal) por archivo/grupo, un commit por task, build verde + grep=0 por task. Las definiciones del `:root` solo se borran cuando el grep total de usos da 0. Las auditorías (a11y, CWV, cross-browser, AI slop) van como tasks de verificación; sus fixes, commit propio.

**Tech Stack:** Astro 5, CSS plano (sin Tailwind/React/Motion), fuentes self-host, tokens editoriales en `global.css` + `motion.css`. Build `npm run build` (88 páginas). CSP por hashes regenerada por el build (no editar a mano).

---

## Baseline auditada (2026-06-15, verificada — NO asumir)

Build verde de partida: **88 páginas, ~2s**. `public/_headers` limpio tras build (CSP estable; las ediciones CSS no cambian hashes de scripts inline).

### Hallazgo crítico que corrige el baseline del prompt
El prompt asumía **~224 usos en ~21 archivos fuera de global.css**. Real:
- **~538 usos de alias en los 24 archivos externos** (token-level, varios por línea).
- **284 usos de alias DENTRO de `global.css`** (líneas 237–3143). → **Las definiciones del `:root` NO pueden borrarse hasta barrer también global.css.** Esto añade la Task 6 (barrido de global.css), la más delicada.

### Tabla de mapeo alias → token canónico (1:1, render idéntico)

| Alias legacy | Token canónico |
|---|---|
| `--color-bg` | `--bg` |
| `--color-bg-card` | `--surface` |
| `--color-bg-muted` | `--surface-muted` |
| `--color-bg-subtle` | `--surface-subtle` |
| `--color-text` | `--ink` |
| `--color-text-muted` | `--ink-muted` |
| `--color-text-light` | `--ink-light` |
| `--color-border` | `--border` |
| `--color-border-dark` | `--border-strong` |
| `--color-primary` | `--accent` |
| `--color-primary-dark` | `--accent-hover` |
| `--color-primary-light` | `--accent` |
| `--color-secondary` | `--accent` |
| `--color-secondary-text` | `--accent` |
| `--color-accent` | `--accent` |
| `--color-rose` | `--accent` |
| `--color-rose-dark` | `--accent-hover` |
| `--color-rose-light` | `--accent` |
| `--color-cat-sillas/escritorios/accesorios/ambiente/audio-video/guias/herramientas` | `--accent` |
| `--color-cat-articulos` | `--ink-muted` (excepción) |
| `--radius-md/lg/xl/2xl` | `--radius` |
| `--glass-bg`, `--glass-bg-strong` | `--surface` |
| `--glass-border` | `--border` |

### Usos por archivo externo (color + radius; orden descendente)

| n | archivo |
|---|---|
| 40 | `src/layouts/Article.astro` |
| 30 | `src/components/ComparisonTable.astro` |
| 22 | `src/components/producto/CatalogoProductos.astro` |
| 18 | `src/components/producto/FichaProducto.astro` |
| 17 | `src/components/producto/ComparadorProductos.astro` |
| 15 | `src/pages/actualidad/index.astro` |
| 15 | `src/components/producto/TarjetaProducto.astro` |
| 12 | `src/pages/herramientas/calculadora-ergonomia.astro` |
| 10 | `src/pages/buscar.astro` |
| 9 | `src/pages/articulos.astro` |
| 8 | `src/layouts/Base.astro` |
| 8 | `src/components/TopPick.astro` |
| 6 | `src/components/producto/ValoracionEjes.astro` |
| 6 | `src/components/producto/TablaVs.astro` |
| 6 | `src/components/BotonPrecio.astro` |
| 5 | `src/pages/guias/index.astro` |
| 5 | `src/pages/[categoria]/index.astro` |
| 5 | `src/pages/catalogo/index.astro` |
| 5 | `src/components/producto/FallbackImagen.astro` |
| 4 | `src/pages/comparar/[tipo]/[par].astro` |
| 2 | `src/pages/404.astro` |
| 2 | `src/components/producto/ImagenProducto.astro` |
| 1 | `src/pages/herramientas/index.astro` |
| 1 | `src/components/producto/ParaQuien.astro` |
| (dinámico) | `src/components/ArticleCard.astro` — ver casos especiales |

### Casos especiales (NO mecánicos)

1. **`--color-footer-*` se CONSERVAN.** No son alias 1:1: contienen valores literales propios (`--color-footer-bg: #14171a` light / `oklch(0.15 …)` dark; `--color-footer-text/link/border` mezcla literal+token). Son una **paleta footer canónica deliberada**, no banned, no AI-tell. Decisión: mantenerlas y **relabelar** el comentario del bloque de "alias legacy" a "paleta footer (canónica)". El script de migración NO las toca y la Task 8 NO las borra.
2. **`ArticleCard.astro:55` interpola dinámicamente** `style={`--card-accent: var(--color-cat-${badgeCategoria})`}`. No reemplazable por sed. Decisión (Task 5): reescribir a condicional — `articulos` → `var(--ink-muted)`, resto → `var(--accent)` (replica el mapeo exacto del `:root`).
3. **`--glass-blur` (0px)** solo existe en definiciones (líneas 143, 212), **sin usos en el cuerpo**. No hay `backdrop-filter: blur(var(--glass-blur))`. Se borra en Task 8 junto al resto de glass defs.
4. **`--transition` / `--transition-slow` (global.css:151–152)** son tokens de motion legacy (`160ms`/`400ms cubic-bezier(0.23,1,0.32,1)`), **24 usos** en `ComparisonTable`, `global.css`, `buscar`, `index`, `Article`. Duplican el sistema `--dur-*`/`--ease-*`. Se unifican en Task 9 (motion polish), no en el barrido de color.

### AI-tells residuales (archivo:línea)

| # | AI-tell | Ubicación | Fix |
|---|---|---|---|
| 1 | `transition: all var(--transition)` | `global.css:1392` (`.footer-back-top`) | transición específica de las props que cambian en `:hover` (transform, border-color, color, box-shadow) con tokens de motion |
| 2 | `backdrop-filter: blur(4px)` | `global.css:3109` (`.ergo-modal-backdrop`) | quitar blur — el scrim ya es `rgba(9,9,11,0.55)` (opaco suficiente). Sin glass. |
| 3 | `border: 1.5px solid var(--color-border)` | `global.css:2734` (`.ergo-share-btn`) | `1px` |

**Otros 1.5px no flagados por el prompt** (no son ban duro; `side-stripe >1px` se refiere a franjas de acento verticales, no a bordes normales): `Article.astro:476` (`.back-to-top-link`) y 8 más en `global.css` (588, 1538, 2344, 2461, 2502, 2676, 3085, 3143). Se documentan como hallazgo de la Task 10 (a11y/contraste) y solo se normalizan si rompen consistencia visual; no se tocan en barrido.

### Diferidos (documentados, NO son tasks de Fase 6)

- **Em-dash en prosa `.mdx`** (`src/content/articulos/*`): ~400 instancias en 20+ archivos. Es **copy de autor**, no chrome de UI. El reemplazo correcto (— → coma / paréntesis / dos puntos / punto) depende de la semántica de cada frase y exige la skill `humanizer` con juicio, no un sed mecánico (riesgo de dañar prosa y campos `description` de frontmatter que alimentan JSON-LD). El em-dash en **UI visible** ya se eliminó en Fase 5. **Decisión: diferir a un pase de humanización dedicado.** No hay em-dash en campos `name:` de schema (verificado). Se registra como follow-up explícito.
- **Pase visual manual** (light + dark, todo el sitio): ejecución del usuario al cierre.

---

## Receta de migración compartida (script temporal determinista)

Todas las tasks de barrido invocan el mismo script. Se crea en Task 1 y se borra en Task 13. Orden de sed: **más específico primero** (evita que `--color-bg` capture `--color-bg-card`, etc.). NO toca `--color-footer-*` (no están en la receta) ni la interpolación dinámica de ArticleCard (cadenas literales no casan con `${...}`).

`scripts/migrate-alias.sh`:

```bash
#!/usr/bin/env bash
# Migración transparente: alias legacy -> tokens editoriales canónicos.
# Cada alias mapea 1:1 a su token (ver definiciones en global.css :root/dark).
# Orden: mas especifico primero. NO toca --color-footer-* (paleta footer canonica, se conserva).
set -euo pipefail
f="$1"
sed -i \
  -e 's/var(--color-bg-card)/var(--surface)/g' \
  -e 's/var(--color-bg-muted)/var(--surface-muted)/g' \
  -e 's/var(--color-bg-subtle)/var(--surface-subtle)/g' \
  -e 's/var(--color-bg)/var(--bg)/g' \
  -e 's/var(--color-text-muted)/var(--ink-muted)/g' \
  -e 's/var(--color-text-light)/var(--ink-light)/g' \
  -e 's/var(--color-text)/var(--ink)/g' \
  -e 's/var(--color-border-dark)/var(--border-strong)/g' \
  -e 's/var(--color-border)/var(--border)/g' \
  -e 's/var(--color-primary-dark)/var(--accent-hover)/g' \
  -e 's/var(--color-primary-light)/var(--accent)/g' \
  -e 's/var(--color-primary)/var(--accent)/g' \
  -e 's/var(--color-secondary-text)/var(--accent)/g' \
  -e 's/var(--color-secondary)/var(--accent)/g' \
  -e 's/var(--color-accent)/var(--accent)/g' \
  -e 's/var(--color-rose-dark)/var(--accent-hover)/g' \
  -e 's/var(--color-rose-light)/var(--accent)/g' \
  -e 's/var(--color-rose)/var(--accent)/g' \
  -e 's/var(--color-cat-articulos)/var(--ink-muted)/g' \
  -e 's/var(--color-cat-sillas)/var(--accent)/g' \
  -e 's/var(--color-cat-escritorios)/var(--accent)/g' \
  -e 's/var(--color-cat-accesorios)/var(--accent)/g' \
  -e 's/var(--color-cat-ambiente)/var(--accent)/g' \
  -e 's/var(--color-cat-audio-video)/var(--accent)/g' \
  -e 's/var(--color-cat-guias)/var(--accent)/g' \
  -e 's/var(--color-cat-herramientas)/var(--accent)/g' \
  -e 's/var(--radius-md)/var(--radius)/g' \
  -e 's/var(--radius-lg)/var(--radius)/g' \
  -e 's/var(--radius-xl)/var(--radius)/g' \
  -e 's/var(--radius-2xl)/var(--radius)/g' \
  -e 's/var(--glass-bg-strong)/var(--surface)/g' \
  -e 's/var(--glass-bg)/var(--surface)/g' \
  -e 's/var(--glass-border)/var(--border)/g' \
  "$f"
echo "migrated: $f"
```

**Grep de verificación** (alias barridos, excluye footer; debe dar 0 en el/los archivo(s) de la task):

```bash
grep -nE 'var\(--(color-(bg|bg-card|bg-muted|bg-subtle|text|text-muted|text-light|border|border-dark|primary|primary-dark|primary-light|secondary|secondary-text|accent|rose|rose-dark|rose-light|cat-[a-z-]+)|radius-(md|lg|xl|2xl)|glass-(bg|bg-strong|border))\)' <archivo>
```

**Nota harness (pásala a cada subagente):** hay un hook "Fact-Forcing Gate" que bloquea el primer Bash/Write/Edit de cada archivo pidiendo facts (request en 1 frase + qué hace el comando/edit; archivos nuevos: además callers/duplicado). Cumplir y reintentar el mismo comando.

---

## Task 1: Crear script de migración + barrer componentes producto/*

**Files:**
- Create: `scripts/migrate-alias.sh`
- Modify: `src/components/producto/CatalogoProductos.astro`, `FichaProducto.astro`, `ComparadorProductos.astro`, `TarjetaProducto.astro`, `ValoracionEjes.astro`, `TablaVs.astro`, `FallbackImagen.astro`, `ImagenProducto.astro`, `ParaQuien.astro`, `BotonPrecio.astro`

- [ ] **Step 1: Crear `scripts/migrate-alias.sh`** con el contenido exacto de la sección "Receta de migración compartida". Facts del gate (archivo nuevo): request = "Fase 6: migrar alias legacy a tokens canónicos"; qué hace = "sed in-place 1:1 alias→token, orden específico-primero"; callers = "invocado manualmente por las tasks de barrido"; duplicado = "no existe script equivalente". Luego `chmod +x scripts/migrate-alias.sh`.

- [ ] **Step 2: Aplicar el script a cada componente producto/***

```bash
for f in CatalogoProductos FichaProducto ComparadorProductos TarjetaProducto ValoracionEjes TablaVs FallbackImagen ImagenProducto ParaQuien; do
  bash scripts/migrate-alias.sh "src/components/producto/$f.astro"
done
bash scripts/migrate-alias.sh src/components/BotonPrecio.astro
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `[build] 88 page(s) built` sin errores.

- [ ] **Step 4: Verificar grep=0 de alias barridos en los archivos tocados**

```bash
grep -rnE 'var\(--(color-(bg|text|border|primary|secondary|accent|rose|cat)[a-z-]*|radius-(md|lg|xl|2xl)|glass-[a-z-]+)\)' src/components/producto/ src/components/BotonPrecio.astro
```
Expected: sin salida (0 coincidencias).

- [ ] **Step 5: Verificar `public/_headers` sin cambios**

Run: `git status --short public/_headers`
Expected: vacío.

- [ ] **Step 6: Commit**

```bash
git add scripts/migrate-alias.sh src/components/producto/ src/components/BotonPrecio.astro
git commit -m "feat(rediseno): fase 6 -- barrido alias->token en componentes producto/* + BotonPrecio"
```

---

## Task 2: Barrer componentes compartidos (ComparisonTable, TopPick)

**Files:**
- Modify: `src/components/ComparisonTable.astro`, `src/components/TopPick.astro`

- [ ] **Step 1: Aplicar el script**

```bash
bash scripts/migrate-alias.sh src/components/ComparisonTable.astro
bash scripts/migrate-alias.sh src/components/TopPick.astro
```

- [ ] **Step 2: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 3: Verificar grep=0**

```bash
grep -nE 'var\(--(color-(bg|text|border|primary|secondary|accent|rose|cat)[a-z-]*|radius-(md|lg|xl|2xl)|glass-[a-z-]+)\)' src/components/ComparisonTable.astro src/components/TopPick.astro
```
Expected: sin salida. (Nota: `ComparisonTable` aún usa `var(--transition)` — es motion legacy, se trata en Task 9; no es alias de color.)

- [ ] **Step 4: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 5: Commit**

```bash
git add src/components/ComparisonTable.astro src/components/TopPick.astro
git commit -m "feat(rediseno): fase 6 -- barrido alias->token en ComparisonTable + TopPick"
```

---

## Task 3: Barrer layouts (Base, Article) — footer preservado

**Files:**
- Modify: `src/layouts/Base.astro`, `src/layouts/Article.astro`

- [ ] **Step 1: Aplicar el script** (no toca `--color-footer-*` — quedan intactos a propósito)

```bash
bash scripts/migrate-alias.sh src/layouts/Base.astro
bash scripts/migrate-alias.sh src/layouts/Article.astro
```

- [ ] **Step 2: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 3: Verificar grep=0 de alias barridos (footer permitido)**

```bash
grep -nE 'var\(--(color-(bg|text|border|primary|secondary|accent|rose|cat)[a-z-]*|radius-(md|lg|xl|2xl)|glass-[a-z-]+)\)' src/layouts/Base.astro src/layouts/Article.astro
```
Expected: sin salida.

- [ ] **Step 4: Confirmar que footer SIGUE usando sus tokens** (sanity)

```bash
grep -nE 'var\(--color-footer-' src/layouts/Base.astro
```
Expected: con salida (se conservan). Si 0, no es un fallo — solo significa que Base no referenciaba footer aquí.

- [ ] **Step 5: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro src/layouts/Article.astro
git commit -m "feat(rediseno): fase 6 -- barrido alias->token en layouts (footer-* conservado)"
```

---

## Task 4: Barrer páginas

**Files:**
- Modify: `src/pages/actualidad/index.astro`, `src/pages/articulos.astro`, `src/pages/buscar.astro`, `src/pages/catalogo/index.astro`, `src/pages/[categoria]/index.astro`, `src/pages/guias/index.astro`, `src/pages/comparar/[tipo]/[par].astro`, `src/pages/404.astro`, `src/pages/herramientas/index.astro`, `src/pages/herramientas/calculadora-ergonomia.astro`

- [ ] **Step 1: Aplicar el script a cada página**

```bash
for f in \
  src/pages/actualidad/index.astro \
  src/pages/articulos.astro \
  src/pages/buscar.astro \
  src/pages/catalogo/index.astro \
  "src/pages/[categoria]/index.astro" \
  src/pages/guias/index.astro \
  "src/pages/comparar/[tipo]/[par].astro" \
  src/pages/404.astro \
  src/pages/herramientas/index.astro \
  src/pages/herramientas/calculadora-ergonomia.astro ; do
  bash scripts/migrate-alias.sh "$f"
done
```

Nota: en `calculadora-ergonomia.astro` los `var(--color-cat-sillas/escritorios/accesorios)` de la leyenda de data-viz **ya renderizaban como `--accent`** (el alias mapeaba a `--accent`), así que el reemplazo es transparente (sin pérdida de distinción: ya eran idénticos).

- [ ] **Step 2: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 3: Verificar grep=0**

```bash
grep -rnE 'var\(--(color-(bg|text|border|primary|secondary|accent|rose|cat)[a-z-]*|radius-(md|lg|xl|2xl)|glass-[a-z-]+)\)' src/pages/
```
Expected: sin salida.

- [ ] **Step 4: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 5: Commit**

```bash
git add src/pages/
git commit -m "feat(rediseno): fase 6 -- barrido alias->token en paginas"
```

---

## Task 5: ArticleCard — resolver interpolación dinámica de categoría

**Files:**
- Modify: `src/components/ArticleCard.astro:55`

- [ ] **Step 1: Leer la línea 55** para confirmar el markup actual:

```
<article class="article-card" data-reveal ... style={`--card-accent: var(--color-cat-${badgeCategoria})`}>
```

- [ ] **Step 2: Reemplazar la interpolación por un condicional** que replica el mapeo del `:root` (`articulos` → `--ink-muted`, resto → `--accent`). Edit:

old:
```astro
style={`--card-accent: var(--color-cat-${badgeCategoria})`}
```
new:
```astro
style={`--card-accent: var(${badgeCategoria === 'articulos' ? '--ink-muted' : '--accent'})`}
```

- [ ] **Step 3: Aplicar el script de barrido por si quedara algún alias estático en el archivo**

```bash
bash scripts/migrate-alias.sh src/components/ArticleCard.astro
```

- [ ] **Step 4: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 5: Verificar grep=0 (incluida la interpolación)**

```bash
grep -nE 'color-cat|var\(--(color-(bg|text|border|primary|secondary|accent|rose)[a-z-]*|radius-(md|lg|xl|2xl)|glass)' src/components/ArticleCard.astro
```
Expected: sin salida.

- [ ] **Step 6: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 7: Commit**

```bash
git add src/components/ArticleCard.astro
git commit -m "feat(rediseno): fase 6 -- ArticleCard card-accent condicional (sin alias dinamico cat)"
```

---

## Task 6: Barrer `global.css` (284 usos internos) — el más delicado

**Files:**
- Modify: `src/styles/global.css` (cuerpo; NO las definiciones de alias 103–218, que el sed no casa, ni footer-*)

- [ ] **Step 1: Aplicar el script al cuerpo de global.css**

```bash
bash scripts/migrate-alias.sh src/styles/global.css
```

El script no casa las líneas de definición (`--color-bg: var(--bg);` LHS no tiene `var(`, RHS no es alias) ni `--color-footer-*`. Solo reescribe los `var(--alias)` del cuerpo.

- [ ] **Step 2: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 3: Verificar grep=0 de alias barridos en el CUERPO** (excluye las definiciones 103–218 y footer)

```bash
grep -nE 'var\(--(color-(bg|bg-card|bg-muted|bg-subtle|text|text-muted|text-light|border|border-dark|primary|primary-dark|primary-light|secondary|secondary-text|accent|rose|rose-dark|rose-light|cat-[a-z-]+)|radius-(md|lg|xl|2xl)|glass-(bg|bg-strong|border))\)' src/styles/global.css | grep -vE '^(1(0[3-9]|[1-9][0-9])|2(0[0-9]|1[0-8])):'
```
Expected: sin salida. (Las definiciones 103–218 siguen presentes; se borran en Task 8.)

- [ ] **Step 4: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 6 -- barrido alias->token en cuerpo de global.css (284 usos)"
```

---

## Task 7: Resolver AI-tells residuales

**Files:**
- Modify: `src/styles/global.css` (3 ediciones)

Nota: tras Task 6, los `var(--color-*)` de estas zonas ya son tokens canónicos. Las líneas pueden haberse desplazado; localizar por selector, no por número de línea.

- [ ] **Step 1: `.footer-back-top` — eliminar `transition: all`**

Localizar la regla `.footer-back-top`. Su `:hover` cambia `transform`, `border-color`, `color`, `box-shadow`. Edit:

old:
```css
  transition: all var(--transition);
```
new:
```css
  transition: transform var(--dur-hover) var(--ease-out), border-color var(--dur-hover) var(--ease-out), color var(--dur-hover) var(--ease-out), box-shadow var(--dur-hover) var(--ease-out);
```

- [ ] **Step 2: `.ergo-modal-backdrop` — quitar el blur (sin glass)**

Localizar `.ergo-modal-backdrop`. El scrim `background: rgba(9, 9, 11, 0.55)` ya es opaco suficiente. Edit: borrar la línea

```css
  backdrop-filter: blur(4px);
```
(eliminar la declaración completa; mantener el `background` rgba).

- [ ] **Step 3: `.ergo-share-btn` — borde 1.5px → 1px**

Localizar `.ergo-share-btn`. Edit:

old:
```css
  border: 1.5px solid var(--border);
```
new:
```css
  border: 1px solid var(--border);
```

- [ ] **Step 4: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 5: Verificar AI-tells eliminados**

```bash
grep -nE 'transition:\s*all|backdrop-filter' src/styles/global.css
```
Expected: 0 resultados.

- [ ] **Step 6: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 6 -- AI-tells residuales (footer-back-top transition, ergo-modal sin blur, share-btn 1px)"
```

---

## Task 8: Borrar definiciones de alias del `:root` y `dark` (gated en grep=0)

**Files:**
- Modify: `src/styles/global.css` (bloques de definición light ~103–143 y dark ~180–212)

**Gate previo OBLIGATORIO:** esta task solo corre si el grep total de usos de alias barridos (todo `src/`, excluyendo definiciones y footer) da **0**.

- [ ] **Step 1: Gate — grep total = 0**

```bash
grep -rnE 'var\(--(color-(bg|bg-card|bg-muted|bg-subtle|text|text-muted|text-light|border|border-dark|primary|primary-dark|primary-light|secondary|secondary-text|accent|rose|rose-dark|rose-light|cat-[a-z-]+)|radius-(md|lg|xl|2xl)|glass-(bg|bg-strong|border|blur))\)' src/ | grep -vE 'global\.css:(1(0[3-9]|[1-9][0-9])|2(0[0-9]|1[0-8])):'
```
Expected: **sin salida**. Si hay salida → DETENERSE, esos usos faltan por barrer (volver a la task correspondiente). No borrar definiciones con usos vivos.

- [ ] **Step 2: Borrar las definiciones de alias en el bloque light** (`:root`). Eliminar las líneas de `--color-bg` … `--color-rose-light`, `--color-cat-*`, `--radius-md/lg/xl/2xl`, `--glass-bg/-strong/-border/-blur`. **CONSERVAR** `--color-footer-*` (relabelar su comentario a "paleta footer (canónica)"). Conservar todos los tokens editoriales canónicos (`--bg`, `--surface*`, `--ink*`, `--accent*`, `--border*`, `--radius*`, `--shadow*`, `--font-*`) y `--transition`/`--transition-slow` (los trata Task 9).

- [ ] **Step 3: Borrar las definiciones de alias equivalentes en el bloque `dark`** (mismas familias). **CONSERVAR** `--color-footer-*` dark.

- [ ] **Step 4: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 5: Verificar que NO queda ninguna definición de alias barrido**

```bash
grep -nE '^\s*--(color-(bg|bg-card|bg-muted|bg-subtle|text|text-muted|text-light|border|border-dark|primary|primary-dark|primary-light|secondary|secondary-text|accent|rose|rose-dark|rose-light|cat-)|radius-(md|lg|xl|2xl)|glass-)' src/styles/global.css
```
Expected: sin salida. Y confirmar footer presente:
```bash
grep -nE '^\s*--color-footer-' src/styles/global.css
```
Expected: 5 defs en light + 5 en dark (se conservan).

- [ ] **Step 6: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(rediseno): fase 6 -- eliminar capa de alias legacy del :root y dark (footer-* conservado)"
```

---

## Task 9: Motion polish (emil) — unificar motion legacy + reduced-motion

**Files:**
- Modify: `src/components/ComparisonTable.astro`, `src/pages/buscar.astro`, `src/pages/index.astro`, `src/layouts/Article.astro`, `src/styles/global.css`

Objetivo: un solo sistema de motion (`--dur-*` / `--ease-*` de `motion.css`). Eliminar los tokens legacy `--transition` / `--transition-slow` (24 usos). Verificar reveals <600ms, sin `ease-in` en UI, reduced-motion correcto.

- [ ] **Step 1: Inventario de `var(--transition)` y `var(--transition-slow)`**

```bash
grep -rnE 'var\(--transition(-slow)?\)' src --include=*.astro --include=*.css
```

- [ ] **Step 2: Reemplazar cada `transition: <props...> var(--transition)`** por las mismas props con `var(--dur-hover) var(--ease-out)`, y `var(--transition-slow)` por `var(--dur-reveal) var(--ease-out)`. Hacer por archivo, leyendo cada declaración (la propiedad concreta varía). Ejemplo de patrón:

old: `transition: transform var(--transition);`
new: `transition: transform var(--dur-hover) var(--ease-out);`

(`--transition` = 160ms ≈ `--dur-hover`; `--transition-slow` = 400ms ≈ `--dur-reveal`. Verificar valores reales de los tokens en `motion.css` antes de mapear; si `--dur-reveal` difiere mucho de 400ms, conservar el timing con un literal apropiado en vez de introducir un cambio perceptible.)

- [ ] **Step 3: Borrar las defs `--transition` y `--transition-slow`** de `global.css` (líneas ~151–152) cuando el grep de usos dé 0.

- [ ] **Step 4: Auditar reveals y curvas** (documentar hallazgos en el commit body):
  - `grep -nE 'animation:.*reveal|transition:.*[0-9]{3,}ms' src/styles/global.css` — confirmar reveals de contenido <600ms. El `stroke-dashoffset 900ms` de la viz ergo (calculadora) es un **draw de gauge de data-viz**, no un reveal de contenido — se conserva (decisión documentada).
  - Confirmar 0 `ease-in` real en UI: `grep -rnE 'ease-in[,; )]' src --include=*.css | grep -v ease-in-out` → las curvas presentes son `cubic-bezier(0.16,1,0.3,1)` / `(0.23,1,0.32,1)` / `(0.2,0.8,0.2,1)` (todas desaceleración, OK).
  - Confirmar bloque `@media (prefers-reduced-motion: reduce)` presente y que anula animaciones/reveals: `grep -nE 'prefers-reduced-motion' src/styles/global.css src/styles/motion.css`.

- [ ] **Step 5: Build** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 6: Verificar 0 usos de motion legacy**

```bash
grep -rnE 'var\(--transition(-slow)?\)|transition:\s*all' src --include=*.astro --include=*.css
```
Expected: sin salida.

- [ ] **Step 7: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(rediseno): fase 6 -- motion polish: unificar --transition* a tokens --dur/--ease, reduced-motion verificado"
```

---

## Task 10: Auditoría a11y + contraste WCAG AA (light + dark) — VERIFICACIÓN

**Files:** sin edición salvo fixes puntuales (cada fix = commit propio).

- [ ] **Step 1: Checklist de contraste** sobre los pares de tokens en ambos modos. Calcular ratio (objetivo AA: texto normal ≥4.5:1, texto grande/UI ≥3:1, bordes/estados ≥3:1):
  - `--ink` sobre `--bg` y sobre `--surface`
  - `--ink-muted` sobre `--bg` / `--surface` / `--surface-muted`
  - `--ink-light` sobre `--bg` (suele ser el límite — verificar ≥4.5 o reservarlo a texto grande)
  - `--accent` sobre `--bg` y `--accent-ink` sobre `--accent` (botones)
  - badges warn (glifo blanco sobre rojo — ya fijado en Fase 5; reconfirmar en dark)
  - `--border` / `--border-strong` sobre `--bg` (≥3:1 para ser perceptible)

Documentar tabla ratio light + dark en el commit body. Donde falle AA, fix puntual del token afectado o del uso.

- [ ] **Step 2: Foco visible** — confirmar `:focus-visible` con outline perceptible (≥3:1, ≥2px) en links, botones, chips, inputs, tabs. `grep -nE ':focus-visible|outline' src/styles/global.css`. Verificar que ningún `outline: none` queda sin reemplazo de foco.

- [ ] **Step 3: Roles/semántica** — botones interactivos `<button>`, links `<a href>`, modal ergo con `role="dialog"`/`aria-modal` y trap de foco, `aria-label` en iconos sin texto (`.ergo-share-btn`, `.footer-back-top`). Listar gaps.

- [ ] **Step 4: Decidir sobre los 1.5px residuales** (8 en global.css + `.back-to-top-link`): si rompen consistencia con el resto de bordes (ahora 1px), normalizar a 1px; si son intencionales (chips), conservar y documentar.

- [ ] **Step 5: Aplicar fixes** que surjan; cada fix con build verde + commit propio:

```bash
npm run build   # 88 pages
git add <archivos>
git commit -m "fix(rediseno): fase 6 a11y -- <hallazgo concreto>"
```

- [ ] **Step 6:** Si no hay fixes, registrar "a11y/contraste: PASS sin cambios" (no se commitea nada).

---

## Task 11: Core Web Vitals (Lighthouse) — VERIFICACIÓN

**Files:** sin edición salvo fixes.

- [ ] **Step 1:** Servir el build y correr Lighthouse (o `npx lighthouse`) sobre páginas representativas: home `/`, un artículo, catálogo, una ficha de producto, la calculadora. Objetivos: **LCP <2.5s, INP <200ms, CLS <0.1**.

- [ ] **Step 2:** Documentar métricas por página. Tras el refactor solo cambiaron nombres de var CSS (sin nuevo JS/imágenes); verificar que el cambio de borde 1.5→1px no introdujo CLS (despreciable).

- [ ] **Step 3:** Fixes solo si alguna métrica falla; cada fix = build verde + commit propio. Si todo cumple, registrar "CWV: PASS".

---

## Task 12: Cross-browser + dark mode + AI slop test final — VERIFICACIÓN

**Files:** sin edición salvo fixes.

- [ ] **Step 1: AI slop test** = Pre-Flight Check de `design-taste-frontend §14` sobre todo el sitio. Confirmar 0 de cada ban (§9): gradient-text, glass por defecto, hero-metric, side-stripe >1px, grids de cards idénticas, `transition: all`. Barridos:

```bash
grep -rnE 'background-clip:\s*text|-webkit-background-clip:\s*text|transition:\s*all|backdrop-filter' src --include=*.astro --include=*.css
grep -rnE 'var\(--(color-|radius-(md|lg|xl|2xl)|glass-|transition)' src --include=*.astro --include=*.css | grep -v 'color-footer'
```
Expected: 0 (salvo footer-*). Cualquier resto → fix.

- [ ] **Step 2: Em-dash en UI visible** (no en prosa .mdx diferida ni en `name:` schema):

```bash
grep -rnE '[—–]' src --include=*.astro | grep -viE 'name:\s*' | head
```
Revisar manualmente que lo que aparezca sea schema (preservar byte) o ya no exista en chrome. Registrar.

- [ ] **Step 3: Cross-browser + dark** (manual, documentar): Chromium, Firefox, WebKit/Safari. Toggle dark. Verificar que tokens resuelven, foco visible, motion respeta reduced-motion, sin FOUC de fuentes self-host.

- [ ] **Step 4:** Integridad final intacta: schema/JSON-LD y tag/ASIN de afiliado byte-idénticos:

```bash
git diff main...HEAD -- src/content src/components/producto/BotonPrecio.astro | grep -iE 'asin|tag=|"@type"|jsonld' | head
```
Expected: sin cambios en esos valores (solo nombres de var CSS).

- [ ] **Step 5:** Fixes que surjan = commit propio. Si limpio, registrar "AI slop / cross-browser: PASS".

---

## Task 13: Limpieza final

**Files:**
- Delete: `scripts/migrate-alias.sh`

- [ ] **Step 1: Borrar el script temporal de migración**

```bash
git rm scripts/migrate-alias.sh
```

- [ ] **Step 2: Build final** — Run `npm run build` — Expected: `88 page(s) built`.

- [ ] **Step 3: Grep final de garantía — 0 alias legacy, 0 motion legacy, 0 AI-tells** (footer-* permitido)

```bash
grep -rnE 'var\(--(color-(bg|text|border|primary|secondary|accent|rose|cat)[a-z-]*|radius-(md|lg|xl|2xl)|glass-[a-z-]+|transition(-slow)?)\)|transition:\s*all|backdrop-filter' src --include=*.astro --include=*.css
```
Expected: sin salida.

- [ ] **Step 4: `git status --short public/_headers`** — Expected: vacío.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(rediseno): fase 6 -- eliminar script temporal de migracion de alias"
```

---

## Self-Review (checklist del autor del plan)

**1. Cobertura de alcance Fase 6:**
- (1) Eliminar capa de alias legacy → Tasks 1–6 (barrido) + Task 8 (borrar defs). ✔ Incluye global.css (284 usos) que el prompt no contemplaba.
- (2) AI-tells residuales (footer transition:all, backdrop-filter, share-btn 1.5px) → Task 7. ✔
- (3) Motion polish (emil, reveals <600ms, sin ease-in, reduced-motion) → Task 9. ✔
- (4) a11y + contraste WCAG AA ambos modos → Task 10. ✔
- (5) CWV Lighthouse → Task 11. ✔
- (6) Cross-browser + dark → Task 12. ✔
- (7) AI slop test final (design-taste-frontend §14) → Task 12 Step 1. ✔
- Em-dash .mdx → **diferido explícitamente** (documentado, copy de autor, requiere humanizer). ✔
- Pase visual manual → diferido al usuario. ✔

**2. Placeholders:** sin TBD/TODO; cada step tiene comando o edit literal. Receta sed completa; los edits de Task 5/7/8 muestran old/new exactos.

**3. Consistencia de tipos/nombres:** mapeo alias→token único en toda la receta; `--card-accent` (Task 5) coincide con el nombre usado por ArticleCard; footer-* tratado igual en Tasks 3, 8, 12.

**Riesgos asumidos (spec §8):** CSP estable (ediciones CSS no cambian hashes inline → `_headers` limpio, verificado por task). Refactor transparente garantizado por el grep=0 gate antes de borrar defs (Task 8 Step 1). Footer-* es la única excepción al borrado, justificada por valores literales no-1:1.
