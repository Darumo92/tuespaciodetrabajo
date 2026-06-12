# Rediseño Editorial — Fase 0: Cimientos (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la capa de tokens de diseño "hecha por IA" por el sistema editorial técnico (verde abeto, papel off-white, Schibsted Grotesk + Source Serif 4, motion emil), reskin instantáneo de todo el sitio sin romper componentes.

**Architecture:** Token layer en `src/styles/global.css`. Se introducen tokens semánticos nuevos y se mantienen los nombres legacy (`--color-primary`, `--color-cat-*`, `--glass-*`, `--shadow-*`, `--radius-*`) como **alias** mapeados a la paleta nueva. Esto re-tinta toda la web de una vez sin tocar componentes. Las fases 1-5 refinan componente a componente; los alias se eliminan en Fase 6. Fuentes self-hosted woff2 con preload + CSP regenerada en build.

**Tech Stack:** Astro 5, CSS plano (custom properties, OKLCH), woff2 self-hosted, IntersectionObserver vanilla. Sin Tailwind/React/Motion.

**Spec:** `docs/superpowers/specs/2026-06-12-rediseno-editorial-completo-design.md`

**Verificación (work de diseño, no TDD clásico):** cada tarea verifica con `npm run build` verde + asserts `grep` sobre el CSS/HTML generado + inspección visual. No hay tests unitarios de CSS; los asserts grep son el "test".

---

## File Structure

- `src/styles/global.css` — capa `@font-face` (líneas 5-43) y bloque `:root` + `[data-theme="dark"]` (45-168). Se reescribe SOLO esa cabecera; el resto del archivo (reglas de componentes) queda intacto y sigue funcionando vía alias.
- `src/layouts/Base.astro` — preloads de fuente (líneas 39-43) y `<meta name="theme-color">` (línea 32).
- `public/fonts/` — añadir woff2 nuevos; los viejos (`inter-*`, `space-grotesk-*`) se retiran al final de la fase.
- `src/styles/motion.css` (nuevo) — primitivas de motion (curvas, durations, reveal). Importado desde `global.css`.
- `src/scripts/reveal.ts` (nuevo) — IntersectionObserver reveal-on-scroll, `{ once: true }`, respeta `prefers-reduced-motion`.

---

## Task 1: Obtener fuentes self-hosted (Schibsted Grotesk + Source Serif 4)

**Files:**
- Create: `public/fonts/schibsted-grotesk-latin-wght-normal.woff2`
- Create: `public/fonts/schibsted-grotesk-latin-ext-wght-normal.woff2`
- Create: `public/fonts/source-serif-4-latin-wght-normal.woff2`
- Create: `public/fonts/source-serif-4-latin-ext-wght-normal.woff2`
- Create: `public/fonts/source-serif-4-latin-wght-italic.woff2`

- [ ] **Step 1: Descargar los woff2 variables desde el CDN de Fontsource (OFL, mismos archivos que sirve @fontsource-variable)**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
BASE="https://cdn.jsdelivr.net/fontsource/fonts"
curl -fsSL "$BASE/schibsted-grotesk:vf@latest/latin-wght-normal.woff2"     -o public/fonts/schibsted-grotesk-latin-wght-normal.woff2
curl -fsSL "$BASE/schibsted-grotesk:vf@latest/latin-ext-wght-normal.woff2" -o public/fonts/schibsted-grotesk-latin-ext-wght-normal.woff2
curl -fsSL "$BASE/source-serif-4:vf@latest/latin-wght-normal.woff2"        -o public/fonts/source-serif-4-latin-wght-normal.woff2
curl -fsSL "$BASE/source-serif-4:vf@latest/latin-ext-wght-normal.woff2"    -o public/fonts/source-serif-4-latin-ext-wght-normal.woff2
curl -fsSL "$BASE/source-serif-4:vf@latest/latin-wght-italic.woff2"        -o public/fonts/source-serif-4-latin-wght-italic.woff2
```

- [ ] **Step 2: Verificar que los 5 archivos existen y son woff2 válidos (no HTML de error)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
for f in schibsted-grotesk-latin-wght-normal schibsted-grotesk-latin-ext-wght-normal source-serif-4-latin-wght-normal source-serif-4-latin-ext-wght-normal source-serif-4-latin-wght-italic; do
  printf '%s: ' "$f"; file "public/fonts/$f.woff2"
done
```
Expected: cada línea termina en `Web Open Font Format (Version 2)`. Si alguno dice `HTML document` o `empty`, el CDN falló: reintentar con la URL exacta del paquete en https://www.jsdelivr.com/package/npm/@fontsource-variable/schibsted-grotesk (carpeta `/files/`).

- [ ] **Step 3: Commit**

```bash
git add public/fonts/schibsted-grotesk-*.woff2 public/fonts/source-serif-4-*.woff2
git commit -m "chore(rediseno): add Schibsted Grotesk + Source Serif 4 woff2 (fase 0)"
```

---

## Task 2: Reescribir @font-face en global.css

**Files:**
- Modify: `src/styles/global.css:5-43` (bloques @font-face Inter + Space Grotesk)

- [ ] **Step 1: Sustituir los 4 bloques @font-face (líneas 5-43) por los nuevos**

Reemplazar el contenido de las líneas 5-43 por:

```css
/* Self-hosted Schibsted Grotesk (display + UI) - latin */
@font-face {
  font-family: 'Schibsted Grotesk';
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url('/fonts/schibsted-grotesk-latin-wght-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Self-hosted Schibsted Grotesk - latin-ext (acentos español) */
@font-face {
  font-family: 'Schibsted Grotesk';
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url('/fonts/schibsted-grotesk-latin-ext-wght-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* Self-hosted Source Serif 4 (lectura larga) - latin */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/source-serif-4-latin-wght-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Self-hosted Source Serif 4 - latin-ext */
@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/source-serif-4-latin-ext-wght-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

/* Self-hosted Source Serif 4 - italic (énfasis en prosa) */
@font-face {
  font-family: 'Source Serif 4';
  font-style: italic;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/source-serif-4-latin-wght-italic.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

- [ ] **Step 2: Verificar que ya no hay referencias a las fuentes viejas en @font-face**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "inter-latin|space-grotesk" src/styles/global.css
```
Expected: sin resultados (exit 1). Si aparece algo, quedó una referencia vieja.

---

## Task 3: Reescribir bloque :root (light) con paleta editorial + alias legacy

**Files:**
- Modify: `src/styles/global.css:45-116` (`:root`)

- [ ] **Step 1: Sustituir el bloque `:root` (líneas 45-116) por la paleta editorial nueva con alias**

```css
:root {
  /* === SISTEMA EDITORIAL — light === */

  /* Superficies (papel off-white croma ~0, NO cream-IA) */
  --bg: oklch(0.985 0.002 110);          /* #fafafa neutro */
  --surface: #ffffff;
  --surface-muted: oklch(0.965 0.003 110);
  --surface-subtle: oklch(0.93 0.004 110);

  /* Tinta */
  --ink: #16181a;                         /* off-black, nunca #000 */
  --ink-muted: oklch(0.45 0.006 250);     /* >=4.5:1 sobre --bg */
  --ink-light: oklch(0.56 0.006 250);     /* solo texto grande/decorativo */

  /* Acento único: verde abeto */
  --accent: oklch(0.38 0.07 158);         /* ~#1f4d3a */
  --accent-hover: oklch(0.32 0.07 158);
  --accent-ink: var(--bg);                /* texto sobre acento */

  /* Bordes hairline */
  --border: oklch(0.90 0.004 110);
  --border-strong: oklch(0.84 0.005 110);

  /* Sombras mínimas tintadas (no negro puro) */
  --shadow-sm: 0 1px 2px oklch(0.38 0.02 158 / 0.06);
  --shadow-md: 0 2px 8px oklch(0.38 0.02 158 / 0.08);
  --shadow-lg: 0 8px 24px oklch(0.38 0.02 158 / 0.10);
  --shadow-xl: var(--shadow-lg);

  /* Una escala de radio */
  --radius: 6px;
  --radius-sm: 4px;
  --radius-full: 999px;

  /* Tipografía */
  --font-display: 'Schibsted Grotesk', system-ui, -apple-system, sans-serif;
  --font-sans: 'Schibsted Grotesk', system-ui, -apple-system, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;

  /* Layout */
  --container-width: 1140px;
  --container-padding: 1.5rem;
  --header-height: 64px;

  /* === ALIAS LEGACY (se eliminan en Fase 6) ===
     Mantienen vivos los componentes aún no migrados, ya re-tintados. */
  --color-bg: var(--bg);
  --color-bg-card: var(--surface);
  --color-bg-muted: var(--surface-muted);
  --color-bg-subtle: var(--surface-subtle);
  --color-text: var(--ink);
  --color-text-muted: var(--ink-muted);
  --color-text-light: var(--ink-light);
  --color-border: var(--border);
  --color-border-dark: var(--border-strong);

  /* Antes azul/arcoíris: ahora TODO mapea al acento o neutro */
  --color-primary: var(--accent);
  --color-primary-dark: var(--accent-hover);
  --color-primary-light: var(--accent);
  --color-secondary: var(--accent);
  --color-secondary-text: var(--accent);
  --color-accent: var(--accent);
  --color-rose: var(--accent);
  --color-rose-dark: var(--accent-hover);
  --color-rose-light: var(--accent);

  /* Categorías: fin del arcoíris, todas neutro/acento */
  --color-cat-sillas: var(--accent);
  --color-cat-escritorios: var(--accent);
  --color-cat-accesorios: var(--accent);
  --color-cat-ambiente: var(--accent);
  --color-cat-audio-video: var(--accent);
  --color-cat-guias: var(--accent);
  --color-cat-herramientas: var(--accent);
  --color-cat-articulos: var(--ink-muted);

  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);

  /* Glass: neutralizado a superficie sólida (se retira por componente) */
  --glass-bg: var(--surface);
  --glass-bg-strong: var(--surface);
  --glass-border: var(--border);
  --glass-blur: 0px;

  --color-footer-bg: #14171a;
  --color-footer-text: oklch(0.72 0.006 250);
  --color-footer-heading: var(--bg);
  --color-footer-link: oklch(0.82 0.004 110);
  --color-footer-border: oklch(0.30 0.006 250);

  --transition: 160ms cubic-bezier(0.23, 1, 0.32, 1);
  --transition-slow: 400ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

- [ ] **Step 2: Verificar que el azul IA y el arcoíris desaparecieron como valores literales del bloque light**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
sed -n '45,116p' src/styles/global.css | grep -nE "#2563eb|#f59e0b|#ec4899|#8b5cf6|#06b6d4|#f43f5e"
```
Expected: sin resultados (exit 1).

---

## Task 4: Reescribir bloque dark mode (diseñado a mano) con alias

**Files:**
- Modify: `src/styles/global.css:119-168` (`[data-theme="dark"]`)

- [ ] **Step 1: Sustituir el bloque `[data-theme="dark"]` (líneas 119-168) por**

```css
/* === SISTEMA EDITORIAL — dark (diseñado a mano) === */
[data-theme="dark"] {
  --bg: oklch(0.18 0.004 160);            /* ~#131514 near-black */
  --surface: oklch(0.21 0.005 160);
  --surface-muted: oklch(0.25 0.005 160);
  --surface-subtle: oklch(0.30 0.006 160);

  --ink: oklch(0.95 0.003 110);           /* ~#f2f2f0 */
  --ink-muted: oklch(0.72 0.006 250);
  --ink-light: oklch(0.60 0.006 250);

  /* Acento aclarado para AA sobre oscuro */
  --accent: oklch(0.72 0.12 158);
  --accent-hover: oklch(0.78 0.12 158);
  --accent-ink: oklch(0.18 0.02 160);     /* tinta oscura sobre acento claro */

  --border: oklch(0.30 0.006 160);
  --border-strong: oklch(0.38 0.007 160);

  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.4);
  --shadow-md: 0 2px 8px oklch(0 0 0 / 0.5);
  --shadow-lg: 0 8px 24px oklch(0 0 0 / 0.55);
  --shadow-xl: var(--shadow-lg);

  /* Alias legacy re-mapeados (heredan los nuevos de arriba) */
  --color-bg: var(--bg);
  --color-bg-card: var(--surface);
  --color-bg-muted: var(--surface-muted);
  --color-bg-subtle: var(--surface-subtle);
  --color-text: var(--ink);
  --color-text-muted: var(--ink-muted);
  --color-text-light: var(--ink-light);
  --color-border: var(--border);
  --color-border-dark: var(--border-strong);

  --color-primary: var(--accent);
  --color-primary-dark: var(--accent-hover);
  --color-primary-light: var(--accent);
  --color-secondary: var(--accent);
  --color-secondary-text: var(--accent);
  --color-accent: var(--accent);
  --color-rose: var(--accent);
  --color-rose-dark: var(--accent-hover);
  --color-rose-light: var(--accent);

  --color-cat-sillas: var(--accent);
  --color-cat-escritorios: var(--accent);
  --color-cat-accesorios: var(--accent);
  --color-cat-ambiente: var(--accent);
  --color-cat-audio-video: var(--accent);
  --color-cat-guias: var(--accent);
  --color-cat-herramientas: var(--accent);
  --color-cat-articulos: var(--ink-muted);

  --glass-bg: var(--surface);
  --glass-bg-strong: var(--surface);
  --glass-border: var(--border);
  --glass-blur: 0px;

  --color-footer-bg: oklch(0.15 0.004 160);
  --color-footer-text: var(--ink-muted);
  --color-footer-heading: var(--ink);
  --color-footer-link: oklch(0.82 0.004 110);
  --color-footer-border: var(--border);
}
```

- [ ] **Step 2: Verificar que no quedan azules/arcoíris literales en todo el CSS de tokens**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "#2563eb|#3b82f6|#f59e0b|#ec4899|#8b5cf6|#22d3ee|#fb7185" src/styles/global.css
```
Expected: sin resultados (exit 1).

---

## Task 5: Confirmar que body usa la nueva tipografía y curva

**Files:**
- Verify (no edit): `src/styles/global.css:183-191` (`body`)

- [ ] **Step 1: Confirmar que `body` ya usa `var(--font-sans)` y `var(--transition-slow)`**

El `body` (línea 184) usa `font-family: var(--font-sans)` y (línea 189) `transition: ... var(--transition-slow)`. Como esos alias ahora apuntan a Schibsted Grotesk y a la curva editorial, NO requiere cambio de código. Solo verificar.

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
sed -n '183,191p' src/styles/global.css
```
Expected: contiene `font-family: var(--font-sans);` y `transition: background-color var(--transition-slow), color var(--transition-slow);`. Sin cambios necesarios.

---

## Task 6: Actualizar preloads de fuente y theme-color en Base.astro

**Files:**
- Modify: `src/layouts/Base.astro:39-43` (preloads) y `:32` (theme-color)

- [ ] **Step 1: Sustituir los preloads (líneas 39-43) por las fuentes nuevas**

```html
    <!-- Preload fuentes críticas self-hosted (latin cubre español base) -->
    <link rel="preload" href="/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/source-serif-4-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
```

- [ ] **Step 2: Actualizar el theme-color de light al papel nuevo (línea 32)**

Reemplazar:
```html
    <meta name="theme-color" content="#ffffff" id="meta-theme-color" />
```
por:
```html
    <meta name="theme-color" content="#fafafa" id="meta-theme-color" />
```

- [ ] **Step 3: Verificar que no quedan preloads de fuentes viejas**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "inter-latin|space-grotesk" src/layouts/Base.astro
```
Expected: sin resultados (exit 1).

---

## Task 7: Crear capa de primitivas de motion

**Files:**
- Create: `src/styles/motion.css`
- Modify: `src/styles/global.css` (añadir `@import` tras la cabecera de comentario, antes del primer @font-face)

- [ ] **Step 1: Crear `src/styles/motion.css`**

```css
/* =========================================
   MOTION PRIMITIVES (emil-design-eng)
   GPU-only (transform/opacity). Reduced-motion safe.
   ========================================= */

:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --dur-press: 140ms;
  --dur-hover: 180ms;
  --dur-reveal: 500ms;
}

/* Feedback táctil universal en pressables */
button:active,
.boton:active,
a.boton:active,
[role="button"]:active {
  transform: scale(0.97);
}

/* Reveal-on-scroll: el contenido es visible por defecto;
   solo se anima cuando el script ha marcado [data-reveal] Y no hay reduced-motion.
   No se gatea la visibilidad del contenido en una clase (evita páginas en blanco). */
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity var(--dur-reveal) var(--ease-out),
                transform var(--dur-reveal) var(--ease-out);
  }
  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Importar motion.css al principio de global.css**

Tras la cabecera de comentario (línea 3) y ANTES del primer `@font-face`, insertar:
```css
@import './motion.css';
```

- [ ] **Step 3: Verificar import presente**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -n "@import './motion.css'" src/styles/global.css
```
Expected: una línea de resultado.

---

## Task 8: Crear script reveal-on-scroll

**Files:**
- Create: `src/scripts/reveal.ts`

- [ ] **Step 1: Crear `src/scripts/reveal.ts`**

```ts
// Reveal-on-scroll: IntersectionObserver, once, stagger via data-reveal-delay.
// No usa listeners de scroll. Si hay prefers-reduced-motion, no hace nada
// (el contenido ya es visible: motion.css solo oculta bajo no-preference).
export function initReveal(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (els.length === 0) return;

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay ?? 0);
        window.setTimeout(() => el.classList.add('is-visible'), delay);
        obs.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  els.forEach((el) => io.observe(el));
}
```

- [ ] **Step 2: Verificar que typecheck no añade errores nuevos**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npx astro check 2>&1 | tail -20
```
Expected: sin errores nuevos en `src/scripts/reveal.ts`. (Si `astro check` ya tenía errores preexistentes en otros archivos, ignorarlos; verificar solo que reveal.ts no añade ninguno.)

Nota: el cableado de `initReveal()` en `Base.astro` (un `<script>` que la importe y la llame) y la aplicación de `data-reveal` a tarjetas se hace en **Fase 1** y siguientes, donde se tocan esos componentes. Aquí solo se crea la primitiva.

---

## Task 9: Build completo + verificación visual + retirar fuentes viejas

**Files:**
- Delete: `public/fonts/inter-latin.woff2`, `public/fonts/inter-latin-ext.woff2`, `public/fonts/space-grotesk-latin.woff2`, `public/fonts/space-grotesk-latin-ext.woff2`

- [ ] **Step 1: Build completo (regenera hashes CSP con las fuentes nuevas)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -25
```
Expected: build verde, "Complete!", nº de páginas igual al previo (~70). Sin errores de CSP ni de fuentes.

- [ ] **Step 2: Verificación visual en ambos modos (home + un artículo)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run preview &
sleep 3
```
Abrir `http://localhost:4321/` y un artículo. Confirmar visualmente:
- Fondo papel off-white, texto off-black, acento verde abeto en enlaces/botones.
- Tipografía display = Schibsted Grotesk (no Inter/Space Grotesk).
- Toggle de tema: dark = near-black con verde aclarado, sin azul, sin arcoíris de categorías.
- Sin glass borroso (blur 0).
Parar preview: `kill %1`.

- [ ] **Step 3: Confirmar que ninguna fuente vieja se referencia ya en el build generado**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -rE "inter-latin|space-grotesk" dist/ | head
```
Expected: sin resultados (exit 1). Si aparece, alguna página/CSS aún la referencia: localizar y corregir antes de borrar los woff2.

- [ ] **Step 4: Borrar los woff2 viejos y rebuild**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git rm public/fonts/inter-latin.woff2 public/fonts/inter-latin-ext.woff2 public/fonts/space-grotesk-latin.woff2 public/fonts/space-grotesk-latin-ext.woff2
npm run build 2>&1 | tail -10
```
Expected: build verde tras borrar.

- [ ] **Step 5: Commit final de Fase 0**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/styles/global.css src/styles/motion.css src/scripts/reveal.ts src/layouts/Base.astro public/fonts/
git commit -m "feat(rediseno): fase 0 cimientos — tokens editoriales, fuentes, motion (emil+taste+impeccable)"
```

---

## Self-Review (hecho)

- **Cobertura del spec §1 (tokens):** Tasks 3, 4 (color light/dark, radii, sombras, fin arcoíris). ✓
- **§2 (tipografía):** Tasks 1, 2, 6 (fuentes + preload). §2 (motion): Tasks 7, 8 (curvas, press, reveal, reduced-motion). ✓
- **§0 stack (CSP, self-host):** Task 9 (build regenera hashes). ✓
- **Migración sin romper:** alias legacy en Tasks 3-4 mantienen componentes vivos. ✓
- **Placeholders:** ninguno; todo el CSS/TS va literal.
- **Consistencia de nombres:** tokens nuevos (`--bg`, `--ink`, `--accent`) usados igual en light y dark; alias idénticos en ambos bloques. `initReveal` definido en Task 8, cableado diferido a Fase 1 (nota explícita).

---

## Roadmap de fases siguientes (cada una = su propio plan al ejecutarse)

Estas fases se expanden a plan detallado con `writing-plans` cuando se llegue a ellas. Inventario de tareas por fase:

### Fase 1 · Chrome global
- `Header.astro`: nav 1 línea ≤80px, condensar a Catálogo/Guías/Actualidad/Herramientas/Buscar(icono), toggle tema, `:active scale`.
- `Footer.astro`: editorial, hairlines, sin arcoíris.
- `Base.astro`: cablear `initReveal()` vía `<script>`, breadcrumb base.
- Aplicar `data-reveal` al patrón de tarjetas global.
- Retirar `--glass-*`/`backdrop-filter` de Header/Footer (sustituir por sólido + hairline).

### Fase 2 · Home
- `index.astro`: hero editorial asimétrico (≤20 palabras, imagen real, ≤4 elementos texto), 5 secciones con ≥4 familias de layout, máx 1 eyebrow/3 secciones.
- Reescritura de copy (verbos concretos, cero em-dash) + humanización.
- Bento de categorías (celdas exactas, diversidad de fondo).

### Fase 3 · Lectura
- `Article.astro`: columna serif 65-75ch, line-height 1.7, TOC/breadcrumb refinados.
- `ComparisonTable.astro`: sin hairline por fila (agrupar/tarjeta-por-spec), Product schema intacto.
- `TopPick.astro`: sin hero-metric template.
- `AffiliateButton.astro`, `BotonPrecio.astro`: estilo botón editorial + `:active scale`, tag afiliado intacto.

### Fase 4 · Catálogo
- `producto/TarjetaProducto`, `FichaProducto`, `ValoracionEjes` (sin barras con track relleno), `ImagenProducto`, `FallbackImagen`, `ParaQuien`, `CatalogoProductos`, `ComparadorProductos`, `TablaVs`.

### Fase 5 · Secundarias
- `buscar.astro`, `actualidad/index`, `guias/index`+`[slug]`, `herramientas/*`, `[categoria]/index`, `articulos.astro`, legales, `sobre-mi.astro`, `404.astro`.

### Fase 6 · Pulido
- Eliminar alias legacy de `global.css` + barrer usos restantes en componentes.
- Motion polish (revisión a día siguiente, slow-motion DevTools).
- Audit a11y + contraste WCAG AA ambos modos.
- Core Web Vitals (Lighthouse): LCP<2.5 / INP<200 / CLS<0.1.
- Pase cross-browser + dark mode.
- **AI slop test** final (Pre-Flight Check design-taste-frontend §14).
