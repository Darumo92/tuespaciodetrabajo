# Rediseño Editorial — Fase 2: Home (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescribir `src/pages/index.astro` como home editorial: hero asimétrico con imagen real (≤20 palabras de value-prop, ≤4 elementos de texto), 5 secciones con 5 familias de layout distintas, máx 2 eyebrows, bento de categorías con celdas exactas y diversidad de fondo, copy con verbos concretos, cero em-dash y cero AI-tells, autor real (David Rubio) en el bloque de método.

**Architecture:** El home hereda los tokens editoriales de Fase 0 (`--bg/--ink/--accent/--surface/--surface-muted/--border`, `--font-display/--font-serif`, `--radius 6px`, `--dur-*`, `--ease-out`, `--shadow-md/lg`) y el chrome sólido de Fase 1. Esta fase reemplaza la maquetación del home: (a) hero centrado sin imagen → grid asimétrico texto+imagen real; (b) `categories-grid` uniforme con `catColors` arcoíris → bento de 5 celdas exactas con diversidad de fondo y acento único; (c) tres grids de `ArticleCard` repetidos (pillars + destacados + recientes) → UNA rejilla de tarjetas (comparativas pillar, con stagger `data-reveal-delay`) + un índice editorial de filas (últimas publicaciones, familia distinta); (d) `trust-strip` decorativo (claims vagos + dot) → bloque método/confianza E-E-A-T con el autor real; (e) `tool-banner` con gradiente cyan/azul → superficie sólida tintada al acento. El CSS nuevo del home vive **scoped** en `index.astro` (clases `home-*`); el CSS legacy home-only en `global.css` (`.hero`, `.trust-strip`, `.categories-grid`, `.category-card`) queda huérfano y se barre en Fase 6. La única edición de `global.css` esta fase es recolorar `.tool-banner` (definido allí).

**Tech Stack:** Astro 5, CSS plano scoped (custom properties, OKLCH), IntersectionObserver vanilla (`reveal.ts` → `initReveal()` ya cableado en Fase 1, soporta `data-reveal-delay`). Sin Tailwind/React/Motion. Imágenes reales `/images/articulos/*.webp` (self-host). Hashes CSP los regenera `npm run build` (NO editar a mano).

**Spec:** `docs/superpowers/specs/2026-06-12-rediseno-editorial-completo-design.md` (§3 Home, §4 Contenido, §7 trazabilidad).
**Roadmap:** `docs/superpowers/plans/2026-06-12-rediseno-editorial-fase0-cimientos.md` (Fase 2, líneas 599-602).
**Referencia de formato:** `docs/superpowers/plans/2026-06-12-rediseno-editorial-fase1-chrome.md`.

**Reglas duras (heredadas):** CSS plano (sin Tailwind/React/Motion); fuentes self-host; NO editar hashes CSP a mano; tokens nuevos (`--bg/--ink/--accent/--surface/--border/--font-*`); cero AI-tells (design-taste-frontend §9); **cero em-dash (`—`/`–`)**; contraste WCAG AA en light y dark. Convivencia de reveal: `ArticleCard` se auto-revela con `[data-reveal]` (Fase 1); el legacy `.reveal`/`.reveal-group` NO se usa en el home nuevo (titulares sin `.reveal`; el bento y el índice no lo necesitan).

**Verificación (work de diseño, no TDD clásico):** cada tarea verifica con `npm run build` verde + asserts `grep` sobre markup/CSS. Los asserts `grep` son el "test". Pasada visual manual (`npm run preview`, light + dark) diferida al cierre de fase.

**Rama:** quedarse en `feat/catalogo-multicategoria`. NO cambiar de rama. NO `git push`.

---

## Pre-Flight de diseño (design-taste-frontend §14 — superficies de esta fase)

| Check | Cómo se cumple en este plan |
|---|---|
| Cero em-dash | Todo el copy va con hyphen / punto / coma. Task 7 lo verifica con grep. |
| Page Theme Lock | Una sola familia de tema; celdas del bento son tints dentro del mismo tema (`--surface`/`--surface-muted`/`--accent`), no inversión de sección. |
| Color Consistency Lock | Acento único `--accent` (verde abeto) en toda la página. Se elimina `catColors` arcoíris y el gradiente cyan del tool-banner. |
| Shape Consistency Lock | Un solo radio `--radius` (6px) en todas las celdas/tarjetas/botones. |
| Hero ≤4 elementos de texto | Titular + subtítulo + 2 CTAs. Sin eyebrow, sin dot. |
| Hero subtext ≤20 palabras | Subtítulo = 18 palabras. |
| Hero imagen real | `<img>` real `setup-home-office-escritorio-elevable.webp` con `aspect-ratio` reservado (CLS). |
| Eyebrow restraint (≤ ceil(6/3)=2) | 2 eyebrows: "Comparativas" + "Herramienta gratis". Hero=0. Task 7 cuenta. |
| Section-Layout-Repetition (≥4 familias) | 5 familias: bento, card-grid, índice editorial, prosa+lista, split-feature. |
| Bento cell count exacto | 5 categorías → 5 celdas, sin celda vacía. |
| Bento background diversity | sillas (imagen real), guias (accent sólido), escritorios/accesorios (muted), ambiente (surface) = ≥3 variaciones. |
| No decorative dots | Se elimina `hero-label-dot`. Los dots del bloque método son marcadores semánticos de `<li>`. |
| No scoring bars con track | N/A en home. |
| Motion motivado | Reveal de tarjetas (secuencia, emil stagger 50ms vía `data-reveal-delay`); hover transform/opacity (feedback). Reduced-motion lo respeta `reveal.ts` + `motion.css`. |
| Real author (no Jane Doe) | David Rubio Mota, datos reales de `sobre-mi.astro`. |
| No filler verbs | Copy con verbos concretos (pruebo, comparo, mido, leo, consulto). |

**Familias de layout (orden final de la página):**

| # | Sección | Familia de layout | Eyebrow |
|---|---|---|---|
| Hero | Value-prop + imagen | Asymmetric Split Hero | no |
| 1 | Categorías | Bento Grid (celdas mixtas) | no |
| 2 | Comparativas | Card Grid (`ArticleCard`) | **sí** ("Comparativas") |
| 3 | Últimas publicaciones | Índice editorial (filas + hairline, 2 col) | no |
| 4 | Método y confianza | Prosa serif + lista (2 col asimétrica) | no |
| 5 | Herramienta | Split feature (texto + figura) | **sí** ("Herramienta gratis") |

---

## File Structure

- `src/pages/index.astro` — reescritura del cuerpo (frontmatter de datos + markup de 6 superficies) y del bloque `<style>` scoped (todo el CSS `home-*`). Es el archivo central de la fase.
- `src/components/ArticleCard.astro` — añadir prop opcional `revealDelay` que emite `data-reveal-delay` (stagger del reveal de la rejilla de comparativas). Cambio mínimo, no rompe otros usos (default 0 = sin atributo).
- `src/styles/global.css` — única edición: recolorar `.tool-banner` y derivados (gradiente cyan/azul → acento sólido), y corregir `var(--color-accent)` (token inexistente) → `var(--accent)`.

**CSS legacy que queda huérfano (NO borrar esta fase, barrido en Fase 6):** `.hero*`, `.hero-label*`, `.trust-strip*`, `.categories-grid`, `.category-card*`, `.category-info*`, `.section-categories`, `.section-home-catalogo` (esta última era scoped y desaparece con el `<style>` reescrito). Nota explícita en Self-Review.

**Imágenes reales disponibles (verificadas en `public/images/articulos/`):**
- Hero: `setup-home-office-escritorio-elevable.webp` (escritorio elevable real).
- Bento celda Sillas: `mejor-silla-ergonomica-calidad-precio.webp`.

---

## Task 1: Hero editorial asimétrico + capa de datos

**Files:**
- Modify: `src/pages/index.astro` (frontmatter + bloque `<!-- Hero -->` + `<style>` scoped)

- [ ] **Step 1: Añadir import de tipo y helpers de datos al frontmatter**

En `src/pages/index.astro`, tras la línea `import { getCollection } from 'astro:content';` (línea 5), añadir:

```astro
import type { CollectionEntry } from 'astro:content';
```

Y tras el bloque de `recientes` (después de la línea 31, antes de `// Excluir pillars...`), añadir los helpers que usarán el bento y el índice editorial:

```astro
const ordenadosPorFecha = [...articulos].sort(
  (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime()
);

const nombresCategoria: Record<string, string> = {
  sillas: 'Sillas',
  escritorios: 'Escritorios',
  accesorios: 'Accesorios',
  ambiente: 'Ambiente',
  'audio-video': 'Audio y vídeo',
};

const hrefDe = (a: CollectionEntry<'articulos'>) =>
  a.data.tipo === 'informativo'
    ? `/guias/${a.slug}/`
    : `/${a.data.categoria}/${a.slug}/`;

const categoriaNombre = (a: CollectionEntry<'articulos'>) =>
  a.data.tipo === 'informativo'
    ? 'Guía'
    : a.data.tipo === 'noticia'
      ? 'Actualidad'
      : (nombresCategoria[a.data.categoria] ?? a.data.categoria);

const fechaCorta = (a: CollectionEntry<'articulos'>) =>
  (a.data.actualizadoEn || a.data.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });

// Últimas publicaciones para el índice editorial (excluye las comparativas pillar)
const pillarSlugSet = new Set(pillars.map(a => a.slug));
const ultimas = ordenadosPorFecha
  .filter(a => !pillarSlugSet.has(a.slug))
  .slice(0, 6);
```

Nota: `pillars` ya está definido arriba (líneas 21-23). NO toques aún `destacados`/`recientes`/`recientesSinDuplicar`/`catColors`: se retiran en Tasks 2 y 4 junto a su markup, para que cada commit compile.

- [ ] **Step 2: Reemplazar el bloque `<!-- Hero -->` por el hero asimétrico**

Reemplazar el bloque completo `<!-- Hero -->` (líneas 129-150, desde `<!-- Hero -->` hasta `</section>` inclusive) por:

```astro
  <!-- Hero editorial asimétrico -->
  <section class="home-hero">
    <div class="container">
      <div class="home-hero-grid">
        <div class="home-hero-text">
          <h1 class="home-hero-title">Pruebo el equipo de home office para que tú no te equivoques.</h1>
          <p class="home-hero-sub">Llevo teletrabajando desde 2019. Comparo sillas, escritorios y accesorios con criterio técnico y muchas horas de uso real.</p>
          <div class="home-hero-cta">
            <a href="/articulos/" class="hero-cta-btn hero-cta-primary">
              Ver comparativas
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="/sobre-mi/" class="hero-cta-btn hero-cta-secondary">Cómo lo pruebo</a>
          </div>
        </div>
        <figure class="home-hero-figure">
          <img src="/images/articulos/setup-home-office-escritorio-elevable.webp" alt="Escritorio elevable con monitor, silla ergonómica y accesorios en un home office real" width="800" height="600" fetchpriority="high" decoding="async" />
        </figure>
      </div>
    </div>
  </section>
```

Disciplina del hero: 4 elementos de texto (titular + subtítulo + 2 CTAs), sin eyebrow ni dot. Subtítulo = 18 palabras. Dos CTAs de intención distinta (explorar vs confianza), sin intención duplicada. Reutiliza las clases de botón `hero-cta-btn`/`hero-cta-primary`/`hero-cta-secondary` ya definidas en `global.css`.

- [ ] **Step 3: Reescribir el bloque `<style>` scoped con CSS base + hero**

Reemplazar TODO el bloque `<style>...</style>` actual (líneas 302-344) por (de aquí en adelante cada task AÑADE su chunk de CSS al final de este bloque, justo antes de `</style>`):

```astro
<style>
  /* =======================================================
     FASE 2 — HOME EDITORIAL (CSS scoped)
     ======================================================= */

  /* --- Hero asimétrico --- */
  .home-hero {
    border-bottom: 1px solid var(--border);
  }
  .home-hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 3rem;
    align-items: center;
    padding: 4rem 0;
  }
  .home-hero-text {
    max-width: 32rem;
  }
  .home-hero-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4.5vw, 3.25rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.04em;
    text-wrap: balance;
    color: var(--ink);
    margin: 0 0 1.1rem;
  }
  .home-hero-sub {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--ink-muted);
    max-width: 36ch;
    margin: 0 0 1.75rem;
  }
  .home-hero-cta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .home-hero-figure {
    margin: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    aspect-ratio: 4 / 3;
  }
  .home-hero-figure img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  @media (max-width: 820px) {
    .home-hero-grid {
      grid-template-columns: 1fr;
      gap: 1.75rem;
      padding: 2.5rem 0 2rem;
    }
    .home-hero-figure {
      order: -1;
      aspect-ratio: 16 / 9;
    }
    .home-hero-text {
      max-width: none;
    }
  }
</style>
```

- [ ] **Step 4: Build verde**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -15
```
Expected: build verde, "Complete!", ~88 páginas. Las secciones legacy (catálogo cta, trust, categorías, pillars, tool, destacados, recientes) siguen presentes y compilan (se reemplazan en tasks siguientes).

- [ ] **Step 5: Verificar hero (sin eyebrow/dot, con imagen real, ≤20 palabras)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -n "hero-label\|hero-label-dot" src/pages/index.astro || echo "OK sin hero-label/dot"
grep -n 'home-hero-figure' src/pages/index.astro
```
Expected: 1ª imprime `OK sin hero-label/dot` (el dot decorativo se fue); 2ª localiza la figura con imagen real.

- [ ] **Step 6: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro
git commit -m "feat(rediseno): fase 2 — hero editorial asimetrico con imagen real + helpers de datos"
```

---

## Task 2: Bento de categorías (celdas exactas + diversidad de fondo)

**Files:**
- Modify: `src/pages/index.astro` (frontmatter `catColors` + bloque `<!-- Categorias -->` + `<style>`)

- [ ] **Step 1: Eliminar el `catColors` arcoíris del frontmatter**

Borrar el bloque (líneas 80-87):
```astro
const catColors: Record<string, string> = {
  sillas: '#2563eb',
  escritorios: '#f59e0b',
  accesorios: '#10b981',
  ambiente: '#ec4899',
  'audio-video': '#8b5cf6',
  guias: '#f43f5e',
};
```
Color Consistency Lock: el home pasa a acento único. El array `categorias` (slug/nombre/descripcion/count) se conserva tal cual.

- [ ] **Step 2: Reemplazar el bloque `<!-- Categorias -->` por el bento**

Reemplazar el bloque completo `<!-- Categorias -->` (líneas 189-212, desde `<!-- Categorias -->` hasta `</section>` inclusive) por:

```astro
  <!-- Categorías (bento, celdas exactas, fondo diverso) -->
  <section class="section home-bento-section">
    <div class="container">
      <h2 class="section-title">Explora por categoría</h2>
      <p class="section-subtitle">Sillas, escritorios y todo lo que toca tu cuerpo ocho horas al día.</p>
      <div class="home-bento">
        {categorias.map(cat => (
          <a href={`/${cat.slug}/`} class={`home-bento-cell home-bento-cell--${cat.slug}`} style={`grid-area: ${cat.slug};`}>
            <span class="home-bento-icon" aria-hidden="true"><CategoryIcon categoria={cat.slug} size={cat.slug === 'sillas' ? 36 : 26} /></span>
            <span class="home-bento-name">{cat.nombre}</span>
            {cat.slug === 'sillas' && <span class="home-bento-desc">{cat.descripcion}</span>}
            <span class="home-bento-count">{cat.count > 0 ? `${cat.count} ${cat.count === 1 ? 'análisis' : 'análisis'}` : 'Próximamente'}</span>
          </a>
        ))}
      </div>
    </div>
  </section>
```

El array `categorias` mantiene el orden `sillas, escritorios, accesorios, ambiente, guias`, que casa con los `grid-template-areas`. `CategoryIcon` ya está importado (línea 4).

- [ ] **Step 3: Añadir el CSS del bento al bloque `<style>` (antes de `</style>`)**

```css

  /* --- Bento de categorías --- */
  .home-bento {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1.5fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "sillas escritorios ambiente"
      "sillas accesorios  guias";
  }
  .home-bento-cell {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.35rem;
    min-height: 150px;
    padding: 1.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--ink);
    text-decoration: none;
    transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
  }
  .home-bento-cell:hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-md);
  }
  .home-bento-cell--escritorios,
  .home-bento-cell--accesorios {
    background: var(--surface-muted);
  }
  .home-bento-cell--guias {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }
  .home-bento-cell--guias .home-bento-icon,
  .home-bento-cell--guias .home-bento-count {
    color: var(--accent-ink);
  }
  .home-bento-cell--sillas {
    position: relative;
    overflow: hidden;
    min-height: 312px;
    color: #fff;
    border-color: transparent;
    background:
      linear-gradient(180deg, rgba(20, 24, 22, 0.08) 0%, rgba(20, 24, 22, 0.84) 100%),
      var(--surface-muted) url('/images/articulos/mejor-silla-ergonomica-calidad-precio.webp') center / cover no-repeat;
  }
  .home-bento-cell--sillas .home-bento-icon,
  .home-bento-cell--sillas .home-bento-count {
    color: #fff;
  }
  .home-bento-icon {
    color: var(--accent);
  }
  .home-bento-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }
  .home-bento-cell--sillas .home-bento-name {
    font-size: 1.5rem;
  }
  .home-bento-desc {
    font-size: 0.85rem;
    line-height: 1.4;
    opacity: 0.92;
    max-width: 32ch;
  }
  .home-bento-count {
    margin-top: 0.15rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--ink-muted);
  }
  @media (max-width: 760px) {
    .home-bento {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto;
      grid-template-areas:
        "sillas sillas"
        "escritorios accesorios"
        "ambiente guias";
    }
    .home-bento-cell--sillas {
      min-height: 220px;
    }
  }
  @media (max-width: 460px) {
    .home-bento {
      grid-template-columns: 1fr;
      grid-template-areas:
        "sillas"
        "escritorios"
        "accesorios"
        "ambiente"
        "guias";
    }
  }
```

Diversidad de fondo: `sillas` (imagen real + scrim), `guias` (acento sólido), `escritorios`/`accesorios` (muted), `ambiente` (surface) = 4 fondos distintos. Contraste: blanco sobre scrim 0.84 (AA); `--accent-ink` sobre `--accent` (diseñado AA en Fase 0); `--ink` sobre surface/muted (AA).

- [ ] **Step 4: Build verde + verificar sin arcoíris**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -10
grep -nE "#2563eb|#f59e0b|#10b981|#ec4899|#8b5cf6|#f43f5e|catColors" src/pages/index.astro || echo "OK sin arcoiris en index"
grep -c "grid-area:" src/pages/index.astro
```
Expected: build verde; `OK sin arcoiris en index`; el conteo de `grid-area:` ≥1 (en fuente aparece 1 literal en el template; el `.map` lo genera por celda en runtime).

- [ ] **Step 5: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro
git commit -m "feat(rediseno): fase 2 — bento de categorias (5 celdas exactas, fondo diverso, acento unico)"
```

---

## Task 3: Comparativas (card grid único) + stagger + retirar caja catálogo

**Files:**
- Modify: `src/components/ArticleCard.astro` (prop `revealDelay`)
- Modify: `src/pages/index.astro` (borrar `section-home-catalogo` + reescribir header de pillars + `<style>`)

- [ ] **Step 1: Añadir prop `revealDelay` a `ArticleCard`**

En `src/components/ArticleCard.astro`, en la interfaz `Props` (líneas 5-8), añadir la línea `revealDelay`:

```astro
interface Props {
  articulo: CollectionEntry<'articulos'>;
  headingLevel?: 2 | 3;
  revealDelay?: number;
}
```

Y en la desestructuración (línea 10):
```astro
const { articulo, headingLevel = 3, revealDelay = 0 } = Astro.props;
```

- [ ] **Step 2: Emitir `data-reveal-delay` en el `<article>` raíz**

Reemplazar (línea 54):
```astro
<article class="article-card" data-reveal data-tipo={tipoArticulo} style={`--card-accent: var(--color-cat-${badgeCategoria})`}>
```
por:
```astro
<article class="article-card" data-reveal {...(revealDelay ? { 'data-reveal-delay': revealDelay } : {})} data-tipo={tipoArticulo} style={`--card-accent: var(--color-cat-${badgeCategoria})`}>
```
`reveal.ts` lee `el.dataset.revealDelay` y aplica el `setTimeout` (stagger). Default 0 = sin atributo = comportamiento idéntico al actual para el resto de usos (`Article.astro`, etc.).

- [ ] **Step 3: Borrar la caja `section-home-catalogo` del home**

En `src/pages/index.astro`, borrar el bloque completo `<section class="section section-home-catalogo">...</section>` (líneas 152-167). Su enlace a `/catalogo/` se reubica como link dentro de la sección de comparativas (Step 4), evitando una sección de solo-CTA.

- [ ] **Step 4: Reescribir el header de la sección de comparativas pillar**

Reemplazar el `<div class="section-header">...</div>` interno del bloque de pillars (líneas 218-222) por:

```astro
        <div class="section-header">
          <span class="section-eyebrow">Comparativas</span>
          <h2 class="section-title">Comparativas a fondo, no listas copiadas de Amazon.</h2>
          <p class="section-subtitle">Pruebo, mido y comparo cada producto antes de recomendarlo. Empiezo por lo que más castiga la espalda: sillas y escritorios.</p>
          <a href="/catalogo/" class="home-inline-link">Ver el catálogo comparativo</a>
        </div>
```

Y reemplazar el `.map` de pillars (líneas 224-226) para pasar el stagger:
```astro
          {pillars.map((articulo, i) => (
            <ArticleCard articulo={articulo} revealDelay={i * 50} />
          ))}
```
Eyebrow #1 (de 2 permitidos). Esta es la ÚNICA rejilla de tarjetas del home (familia card-grid usada una vez). Stagger 50ms (emil).

- [ ] **Step 5: Añadir CSS del link inline al bloque `<style>` (antes de `</style>`)**

```css

  /* --- Link inline editorial (comparativas, método) --- */
  .home-inline-link {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid currentColor;
    padding-bottom: 1px;
    transition: color var(--transition), transform var(--dur-press) var(--ease-out);
  }
  .home-inline-link:hover {
    color: var(--accent-hover);
  }
  .home-inline-link:active {
    transform: scale(0.98);
  }
```

- [ ] **Step 6: Build verde + verificar stagger y un solo card-grid (todavía 2 grids hasta Task 4)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -10
grep -c "articles-grid" src/pages/index.astro
grep -n "revealDelay" src/pages/index.astro src/components/ArticleCard.astro
grep -n "section-home-catalogo" src/pages/index.astro || echo "OK caja catalogo retirada"
```
Expected: build verde; `articles-grid` aún aparece 2 veces (pillars + destacados, este último se retira en Task 4); `revealDelay` presente en index y ArticleCard; `OK caja catalogo retirada`.

- [ ] **Step 7: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro src/components/ArticleCard.astro
git commit -m "feat(rediseno): fase 2 — comparativas card-grid unico con stagger, retirar caja catalogo"
```

---

## Task 4: Índice editorial (reemplaza destacados + recientes)

**Files:**
- Modify: `src/pages/index.astro` (frontmatter destacados/recientes + bloques markup + `<style>`)

- [ ] **Step 1: Limpiar el frontmatter de destacados/recientes duplicados**

Borrar los bloques (líneas 25-37: cálculo de `destacados`, `recientes`, `pillarSet`/`destacadoSlugs`/`recientesSinDuplicar`/`mostrarRecientes`):

```astro
const destacados = articulos
  .filter(a => a.data.destacado)
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());

const recientes = articulos
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime())
  .slice(0, 4);

// Excluir pillars y destacados de recientes para evitar duplicados
const pillarSet = new Set(pillars.map(a => a.slug));
const destacadoSlugs = new Set(destacados.map(a => a.slug));
const recientesSinDuplicar = recientes.filter(a => !destacadoSlugs.has(a.slug) && !pillarSet.has(a.slug));
const mostrarRecientes = recientesSinDuplicar.length > 0;
```

Y reemplazarlos por una única lista para el schema (el índice visible usa `ultimas` de Task 1):
```astro
const recientes = ordenadosPorFecha.slice(0, 6);
```
`ordenadosPorFecha` y `pillarSlugSet` ya se definieron en Task 1. `itemListSchema` (que mapea `recientes`) sigue válido con esta nueva `recientes` de 6 elementos.

- [ ] **Step 2: Reemplazar las secciones destacados + recientes por el índice editorial**

Borrar AMBOS bloques: `<!-- Destacados -->` (líneas 264-280) y `<!-- Articulos recientes ... -->` (líneas 282-298), e insertar en su lugar:

```astro
  <!-- Últimas publicaciones (índice editorial de filas) -->
  {ultimas.length > 0 && (
    <section class="section">
      <div class="container">
        <h2 class="section-title">Lo último que he publicado</h2>
        <p class="section-subtitle">Guías y análisis recién salidos, ordenados por fecha.</p>
        <div class="home-index">
          {ultimas.map(a => (
            <a href={hrefDe(a)} class="home-index-item">
              <span class="home-index-title">{a.data.titulo}</span>
              <span class="home-index-meta">{categoriaNombre(a)} · {fechaCorta(a)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )}
```
Familia distinta del card-grid: filas con hairline (solo `border-bottom`, nunca top+bottom por fila), 2 columnas en desktop. La meta lleva un único middle-dot (rationed). Sin `ArticleCard`, sin imágenes de tarjeta.

- [ ] **Step 3: Añadir CSS del índice al bloque `<style>` (antes de `</style>`)**

```css

  /* --- Índice editorial de filas --- */
  .home-index {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--border);
  }
  .home-index-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1.1rem 0;
    border-bottom: 1px solid var(--border);
    text-decoration: none;
    color: var(--ink);
    transition: padding-left var(--transition), color var(--transition);
  }
  .home-index-title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    line-height: 1.25;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .home-index-meta {
    font-size: 0.78rem;
    color: var(--ink-muted);
  }
  .home-index-item:hover {
    padding-left: 0.5rem;
    color: var(--accent);
  }
  .home-index-item:hover .home-index-meta {
    color: var(--ink-muted);
  }
  @media (min-width: 761px) {
    .home-index-item:nth-child(odd) {
      padding-right: 2rem;
    }
    .home-index-item:nth-child(even) {
      padding-left: 2rem;
      border-left: 1px solid var(--border);
    }
    .home-index-item:nth-child(even):hover {
      padding-left: 2.5rem;
    }
  }
  @media (max-width: 760px) {
    .home-index {
      grid-template-columns: 1fr;
    }
  }
```

- [ ] **Step 4: Build verde + verificar sin doble card-grid ni consts muertas**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -12
grep -c "articles-grid" src/pages/index.astro
grep -nE "destacados|recientesSinDuplicar|mostrarRecientes|destacadoSlugs" src/pages/index.astro || echo "OK sin consts muertas"
grep -n "home-index" src/pages/index.astro
```
Expected: build verde; `articles-grid` = `1` (solo comparativas); `OK sin consts muertas`; `home-index` presente. Si el build se queja de `recientes`/`ordenadosPorFecha` no definido, confirmar que Task 1 Step 1 añadió `ordenadosPorFecha` y que el Step 1 de esta task dejó `const recientes = ordenadosPorFecha.slice(0, 6);`.

- [ ] **Step 5: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro
git commit -m "feat(rediseno): fase 2 — indice editorial de filas (reemplaza destacados + recientes duplicados)"
```

---

## Task 5: Bloque método y confianza E-E-A-T (reemplaza trust-strip)

**Files:**
- Modify: `src/pages/index.astro` (borrar `trust-strip` + insertar bloque método + `<style>`)

Datos del autor verificados en `src/pages/sobre-mi.astro`: David Rubio Mota, ingeniero de software, vive en Rubí (Barcelona), teletrabaja desde 2019, 7-8 h/día en la misma silla, prueba en su despacho real, consulta foros de ergonomía y a su fisioterapeuta, no cobra por colocar productos.

- [ ] **Step 1: Borrar el `trust-strip` decorativo**

Borrar el bloque completo `<!-- Trust strip -->` (líneas 169-187, desde `<!-- Trust strip -->` hasta el `</div>` de cierre del `.trust-strip`). Sus claims vagos ("Análisis independientes / Precios actualizados / Actualizado regularmente") y los iconos sueltos se sustituyen por E-E-A-T real.

- [ ] **Step 2: Insertar el bloque método (tras el índice editorial, antes de la herramienta)**

Insertar inmediatamente después del cierre del bloque del índice editorial (Task 4) y antes de la sección de herramienta:

```astro
  <!-- Método y confianza (E-E-A-T, autor real) -->
  <section class="section section--alt">
    <div class="container">
      <div class="home-method-grid">
        <div class="home-method-intro">
          <h2 class="section-title">Cómo pruebo lo que recomiendo</h2>
          <p class="home-method-lead">
            Soy David Rubio, ingeniero de software. Teletrabajo desde 2019 y paso entre siete y ocho horas al día en la misma silla, así que el equipo de home office me importa por motivos egoístas antes que profesionales.
          </p>
          <a href="/sobre-mi/" class="home-inline-link">Sobre mí y mi método</a>
        </div>
        <ul class="home-method-list">
          <li>Pruebo el equipo en mi propio despacho, no en una sala de test prestada.</li>
          <li>Leo las fichas con criterio técnico y contrasto medidas. No copio el texto de Amazon.</li>
          <li>Consulto foros de ergonomía y a mi fisioterapeuta antes de recomendar nada postural.</li>
          <li>No cobro por colocar un producto en una posición. Si no lo he probado, lo digo.</li>
        </ul>
      </div>
    </div>
  </section>
```
4 items concretos (≤5, sin inline-header), prosa en serif para contraste de eje tipográfico (impeccable). Reutiliza `home-inline-link` (Task 3).

- [ ] **Step 3: Añadir CSS del bloque método al `<style>` (antes de `</style>`)**

```css

  /* --- Método y confianza --- */
  .home-method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
  .home-method-lead {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.65;
    color: var(--ink);
    max-width: 44ch;
    margin: 0 0 1.25rem;
    text-wrap: pretty;
  }
  .home-method-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.9rem;
  }
  .home-method-list li {
    position: relative;
    padding-left: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--ink-muted);
  }
  .home-method-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    background: var(--accent);
  }
  @media (max-width: 760px) {
    .home-method-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
```

- [ ] **Step 4: Build verde + verificar trust-strip retirado**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -10
grep -n "trust-strip" src/pages/index.astro || echo "OK trust-strip retirado"
grep -n "home-method" src/pages/index.astro
```
Expected: build verde; `OK trust-strip retirado`; `home-method` presente.

- [ ] **Step 5: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro
git commit -m "feat(rediseno): fase 2 — bloque metodo y confianza E-E-A-T con autor real (reemplaza trust-strip)"
```

---

## Task 6: Herramienta split feature — recolor al acento + reorden al final

**Files:**
- Modify: `src/styles/global.css` (`.tool-banner` y derivados)
- Modify: `src/pages/index.astro` (mover la sección de herramienta al final)

- [ ] **Step 1: Recolorar `.tool-banner` (quitar gradiente cyan/azul)**

En `src/styles/global.css`, reemplazar el bloque `.tool-banner` (líneas 1935-1949):
```css
.tool-banner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(37, 99, 235, 0.1) 100%);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: var(--radius-2xl);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  position: relative;
  overflow: hidden;
}
```
por:
```css
.tool-banner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 2.5rem;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 2: Recolorar el glow `::before`, el `:hover`, el eyebrow y el cta**

Reemplazar en `.tool-banner::before` (líneas 1951-1960) la línea del radial cyan:
```css
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%);
```
por:
```css
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%);
```

Reemplazar `.tool-banner:hover` (líneas 1962-1966):
```css
.tool-banner:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(6, 182, 212, 0.18);
  border-color: var(--color-accent);
}
```
por:
```css
.tool-banner:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}
```

Reemplazar `.tool-banner-eyebrow` (líneas 1973-1984) — colores cyan + token inexistente `--color-accent`:
```css
.tool-banner-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.75rem;
  background: rgba(6, 182, 212, 0.15);
  border-radius: var(--radius-full);
  margin-bottom: 0.75rem;
}
```
por:
```css
.tool-banner-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.75rem;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: var(--radius-full);
  margin-bottom: 0.75rem;
}
```

Reemplazar la línea de color de `.tool-banner-cta` (línea ~2005):
```css
  color: var(--color-accent);
```
por:
```css
  color: var(--accent);
```

Reemplazar el override dark `[data-theme="dark"] .tool-banner` (líneas 2022-2025):
```css
[data-theme="dark"] .tool-banner {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.06) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: rgba(34, 211, 238, 0.2);
}
```
por:
```css
[data-theme="dark"] .tool-banner {
  background: var(--surface-muted);
  border-color: var(--border);
}
```

- [ ] **Step 3: Mover la sección de herramienta al final del home**

En `src/pages/index.astro`, cortar el bloque completo `<!-- Herramienta destacada -->` (líneas 232-262, desde el comentario hasta `</section>` inclusive) y pegarlo como ÚLTIMA sección, justo antes de `</Base>`. Orden final de superficies: hero → bento → comparativas → índice → método → herramienta.

El eyebrow `tool-banner-eyebrow` "Herramienta gratis" es el eyebrow #2 (de 2 permitidos). El copy actual del banner ya es concreto; no se reescribe. La figura SVG es un esquema funcional de la calculadora (no un fake screenshot), se conserva recolorada al acento vía `currentColor`.

- [ ] **Step 4: Build verde + verificar sin cyan ni token fantasma**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -10
grep -nE "rgba\(6, 182, 212|rgba\(37, 99, 235|rgba\(34, 211, 238|rgba\(59, 130, 246" src/styles/global.css || echo "OK sin cyan/azul residual"
grep -nE "\-\-color-accent\b" src/styles/global.css || echo "OK sin token --color-accent fantasma"
```
Expected: build verde; `OK sin cyan/azul residual` (o, si quedaran rgba de esos en OTRAS reglas no-tool-banner, verificar a ojo que NINGUNA está en reglas `.tool-banner*`); `OK sin token --color-accent fantasma`.

- [ ] **Step 5: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/pages/index.astro src/styles/global.css
git commit -m "feat(rediseno): fase 2 — herramienta split feature recolor al acento, reorden al final"
```

---

## Task 7: Verificación final + copy self-audit + barrido de reglas duras

**Files:** ninguno (verificación; commit solo si hay polish)

- [ ] **Step 1: Build completo limpio**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -25
```
Expected: build verde, "Complete!", ~88 páginas, sin errores de CSP/fuentes/CSS.

- [ ] **Step 2: Barrido mecánico de AI-tells y reglas duras del home**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
echo "--- em-dash en index (debe ser 0) ---"; grep -n "—\|–" src/pages/index.astro || echo "OK sin em-dash"
echo "--- eyebrows (section-eyebrow + tool-banner-eyebrow, debe ser 2) ---"; grep -cE "section-eyebrow|tool-banner-eyebrow" src/pages/index.astro
echo "--- hero-label-dot (decorative dot, debe ser 0) ---"; grep -c "hero-label-dot" src/pages/index.astro
echo "--- arcoiris hex en index (debe ser 0) ---"; grep -cE "#2563eb|#f59e0b|#10b981|#ec4899|#8b5cf6|#f43f5e" src/pages/index.astro
echo "--- familias de layout (markers, deben aparecer las 6) ---"; grep -oE "home-hero-grid|home-bento|articles-grid|home-index|home-method-grid|tool-banner" src/pages/index.astro | sort -u
```
Expected:
- em-dash: `OK sin em-dash`.
- eyebrows: `2`.
- hero-label-dot: `0`.
- arcoíris: `0`.
- familias: aparecen `home-hero-grid`, `home-bento`, `articles-grid`, `home-index`, `home-method-grid`, `tool-banner` (6 marcadores = hero + 5 familias).

- [ ] **Step 3: Copy self-audit (lectura de todas las cadenas visibles)**

Releer a ojo todas las cadenas visibles del home (titulares, subtítulos, eyebrows, labels de botón, copy del método, copy del bento, alt de la imagen). Confirmar: cero filler ("eleva/sin fisuras/next-gen"), verbos concretos, sin frases rotas ni cute-AI, sin intención de CTA duplicada (hero: "Ver comparativas" vs "Cómo lo pruebo"; método/comparativas: "Sobre mí y mi método" / "Ver el catálogo comparativo" son destinos distintos). El alt de la imagen describe la escena real. Si alguna cadena chirría, reescribir con frase funcional simple y commitear como polish.

- [ ] **Step 4: Confirmar git limpio y los 6 commits de la fase**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git status --short
git log --oneline -7
```
Expected: working tree limpio; los 6 commits de Fase 2 presentes (Tasks 1-6). Sin cambios sin commitear (salvo polish del Step 3, que se commitea aparte).

---

## Self-Review (hecho)

**1. Cobertura del alcance Fase 2 (roadmap líneas 599-602 + spec §3 Home):**
- Hero editorial asimétrico, ≤20 palabras (18), imagen real, ≤4 elementos de texto → Task 1. ✓
- 5 secciones con ≥4 familias de layout distintas → bento / card-grid / índice editorial / prosa+lista / split-feature = 5 familias (Tasks 2-6). ✓
- Máx 1 eyebrow por 3 secciones (6 superficies → 2) → 2 eyebrows (Comparativas, Herramienta), hero 0 (Task 3, Task 6; verificado Task 7). ✓
- Reescritura de copy con verbos concretos, cero em-dash, pasada de humanización (autor real, sin AI-tells) → Tasks 1-5 + audit Task 7. ✓
- Bento de categorías con celdas exactas (5 → 5) y diversidad de fondo (imagen/accent/muted/surface) → Task 2. ✓

**2. Reglas duras heredadas:** CSS plano scoped (sin Tailwind/React) ✓; fuentes self-host intactas ✓; CSP la regenera `npm run build` (steps de build) ✓; tokens nuevos (`--accent/--surface/--surface-muted/--border/--font-display/--font-serif/--dur-press/--ease-out`) usados ✓; cero em-dash (Task 7 Step 2) ✓; cero AI-tells (catColors arcoíris, dot decorativo, gradiente cyan, hero centrado sin imagen, 3 grids repetidos: todos eliminados) ✓; contraste AA (scrim 0.84 / accent-ink sobre accent / ink sobre surface) ✓.

**3. Placeholders:** ninguno; todo el markup/CSS/copy va literal.

**4. Consistencia de nombres y tipos:** `revealDelay` (prop nueva en `ArticleCard`, Task 3) ↔ `data-reveal-delay` (leído por `reveal.ts` como `dataset.revealDelay`, Fase 0) ✓. Helpers `hrefDe`/`categoriaNombre`/`fechaCorta`/`ordenadosPorFecha`/`ultimas`/`pillarSlugSet` definidos en Task 1 y usados en Tasks 2-4 ✓. `recientes` redefinido en Task 4 sobre `ordenadosPorFecha` (definido Task 1) y consumido por `itemListSchema` ✓. Clase `home-inline-link` definida en Task 3 y reutilizada en Task 5 ✓. `categorias` (frontmatter existente) consumido por el bento con orden que casa con `grid-template-areas` ✓.

**5. Riesgo conocido (documentado):**
- La imagen del hero usa un `.webp` de artículo (`setup-home-office-escritorio-elevable.webp`) como asset real. Es real y representa la escena; si en Fase 6 se genera un asset dedicado de hero, se sustituye la `src` sin tocar layout (el contenedor reserva `aspect-ratio`, sin CLS).
- El bento sirve la imagen de `sillas` como `background-image` (sin `<img>`): no aporta a LCP ni a CLS (celda con `min-height`), pero no lleva `alt`; el nombre/categoría textual cubre la accesibilidad de la celda (es un enlace con texto).

**6. CSS legacy huérfano (diferido a Fase 6, NO borrar esta fase):** `.hero*`, `.hero-label*`, `.trust-strip*`, `.categories-grid`, `.category-card*`, `.category-info*`, `.section-categories` quedan sin uso en el home tras esta fase. Se barren en Fase 6 (junto al resto de alias legacy), conforme a la estrategia "reescribir `global.css` por capas, no de golpe" (spec §8).

**7. Diferido a fases siguientes:** preload de la imagen de hero en `Base.astro` (micro-optimización LCP); migración del resto de `.reveal`/`.reveal-group` legacy; gate de hover con `@media (hover: hover)`; pasada visual manual en ambos modos.

---

## Pendiente al cerrar Fase 2 (NO ejecutar aquí)

- Pasada visual manual (`npm run preview`) en home, light y dark: confirmar hero asimétrico con imagen nítida sin salto (CLS), bento con celdas de tamaño exacto y fondos diversos legibles, reveal de tarjetas escalonado suave, índice editorial con hairlines limpias, bloque método legible en serif, herramienta tintada al acento (sin cyan).
- NO continuar a Fase 3 (Lectura). Reportar los 6 commits y parar.
