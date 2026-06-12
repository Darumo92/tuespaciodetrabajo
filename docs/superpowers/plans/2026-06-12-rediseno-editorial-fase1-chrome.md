# Rediseño Editorial — Fase 1: Chrome global (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Llevar el "chrome" global (Header, Footer, Base) al sistema editorial de Fase 0: nav plano de 1 línea sin mega-dropdown, superficies sólidas con hairline (fin del glass/backdrop-filter), reveal-on-scroll cableado vía `initReveal()`, y el patrón de tarjeta global (`ArticleCard`) migrado a `[data-reveal]`.

**Architecture:** El chrome ya hereda los tokens editoriales de Fase 0 (alias legacy re-tintados). Esta fase (a) simplifica la IA del Header a 5 destinos (`Catálogo · Guías · Actualidad · Herramientas · Buscar`), eliminando el dropdown "Secciones" y su CSS muerto; (b) sustituye `var(--glass-*)` + `backdrop-filter` por `var(--surface)` + `var(--border)` en header/nav/bottom-nav/cookie-banner; (c) cablea el script de reveal de Fase 0 (`src/scripts/reveal.ts` → `initReveal()`) con guard de idempotencia, conviviendo con el observer legacy `.reveal`/`.reveal-group` (que sigue gobernando titulares y grid de categorías hasta Fases 2-3); (d) migra `ArticleCard.astro` a `[data-reveal]` y retira `reveal-group` de los grids de tarjetas para evitar doble-reveal.

**Tech Stack:** Astro 5, CSS plano (custom properties, OKLCH), IntersectionObserver vanilla (`reveal.ts`), sin Tailwind/React/Motion. Fuentes self-host (sin `<link>` Google). Hashes CSP los regenera `npm run build` (NO editar a mano).

**Spec:** `docs/superpowers/specs/2026-06-12-rediseno-editorial-completo-design.md`
**Roadmap:** `docs/superpowers/plans/2026-06-12-rediseno-editorial-fase0-cimientos.md` (sección "Roadmap de fases siguientes" → Fase 1).

**Reglas duras (heredadas del roadmap):** CSS plano, fuentes self-host, no editar hashes CSP a mano, respetar tokens nuevos (`--bg/--ink/--accent/--surface/--border/--font-*`), cero AI-tells, cero em-dash (`—`), nav en 1 línea ≤80px, contraste WCAG AA en ambos modos.

**Verificación (work de diseño, no TDD clásico):** cada tarea verifica con `npm run build` verde + asserts `grep` sobre el CSS/markup + (al final) inspección visual manual diferida. Los asserts `grep` son el "test".

**Rama:** quedarse en `feat/catalogo-multicategoria`. NO cambiar de rama. NO `git push`.

---

## File Structure

- `src/components/Header.astro` — reescritura de markup (nav plano de 5 destinos, Buscar como icono, sin dropdown) y simplificación del `<script>` (se eliminan los handlers del dropdown; se corrige el `theme-color` dark stale).
- `src/components/Footer.astro` — verificación editorial (ya sin glass ni arcoíris tras Fase 0); sin cambios de markup salvo confirmación.
- `src/layouts/Base.astro` — cablear `initReveal()` con un `<script>` bundled + guard de idempotencia; retirar glass del `cookie-banner`; verificar breadcrumb base.
- `src/components/ArticleCard.astro` — añadir `data-reveal` al `<article>` raíz (patrón de tarjeta global).
- `src/pages/index.astro` — quitar `reveal-group` de los 3 grids de `ArticleCard` (las tarjetas se auto-revelan); conservar `categories-grid reveal-group` y los `.reveal` de titulares.
- `src/layouts/Article.astro` — quitar `reveal-group` del grid de `ArticleCard` relacionados.
- `src/styles/global.css` — chrome: header/nav/dark-header/bottom-nav/cookie a sólido+hairline; borrar bloque CSS muerto `.nav-dropdown*`; fix focus-ring azul; `:active scale` para anchors del chrome.

**Convivencia de los dos sistemas de reveal (decisión de diseño):**
- **Legacy** `.reveal` / `.reveal-group` → `.revealed` (keyframe `reveal-up`), observer inline en `Base.astro:151-168`. Sigue vivo para titulares (`.section-title.reveal`, subtítulos) y `categories-grid.reveal-group`. Se migrará en Fases 2-3.
- **Nuevo** `[data-reveal]` → `.is-visible` (transición, `motion.css`), observer `initReveal()` de `reveal.ts`. Esta fase lo cablea y lo aplica SOLO a `ArticleCard`. Selectores disjuntos = sin conflicto. Una tarjeta NUNCA debe quedar a la vez como `[data-reveal]` y como hijo directo de `.reveal-group` (de ahí la retirada de `reveal-group` de los grids de tarjetas).

---

## Task 1: Header.astro — nav editorial plano (markup + script)

**Files:**
- Modify: `src/components/Header.astro` (reescritura completa del archivo)

Reescribe `src/components/Header.astro` con exactamente este contenido (markup plano de 5 destinos, Buscar como icono con etiqueta sr-only, sin dropdown; script sin handlers de dropdown y con `theme-color` dark corregido a `#131514`):

- [ ] **Step 1: Reemplazar el archivo completo**

```astro
---
import LogoIcon from './LogoIcon.astro';

const currentPath = Astro.url.pathname;

const navLinks = [
  { href: '/catalogo/', label: 'Catálogo' },
  { href: '/guias/', label: 'Guías' },
  { href: '/actualidad/', label: 'Actualidad' },
  { href: '/herramientas/', label: 'Herramientas' },
];
---

<header class="header">
  <div class="container">
    <div class="header-inner">
      <a href="/" class="logo">
        <LogoIcon size={28} />
        Tu Espacio de <span>Trabajo</span>
      </a>

      <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
        <span class="hamburger-icon" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav class="nav" id="nav" aria-label="Navegación principal">
        {navLinks.map(link => (
          <a
            href={link.href}
            class={`nav-link ${currentPath.startsWith(link.href) ? 'active' : ''}`}
            {...(currentPath === link.href ? { 'aria-current': 'page' } : {})}
          >
            {link.label}
          </a>
        ))}

        <a
          href="/buscar/"
          class={`nav-link nav-search ${currentPath.startsWith('/buscar/') ? 'active' : ''}`}
          {...(currentPath === '/buscar/' ? { 'aria-current': 'page' } : {})}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <span class="nav-search-label">Buscar</span>
        </a>

        <button
          class="theme-toggle"
          id="theme-toggle"
          aria-label="Cambiar tema claro/oscuro"
          title="Cambiar tema"
        >
          <svg id="theme-icon-sun" class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg id="theme-icon-moon" class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>
      </nav>
    </div>
  </div>
</header>

<script>
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');

  function closeNav() {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.contains('open');
    if (isOpen) {
      closeNav();
      toggle.focus();
    } else {
      nav?.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      requestAnimationFrame(() => {
        const firstLink = nav?.querySelector('a, button:not(#nav-toggle)') as HTMLElement;
        firstLink?.focus();
      });
    }
  });

  // Cerrar menú móvil al pulsar un enlace
  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeNav());
  });

  // Dark mode toggle
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const metaTheme = document.getElementById('meta-theme-color');
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      if (metaTheme) metaTheme.setAttribute('content', '#fafafa');
      themeBtn.setAttribute('aria-label', 'Activar modo oscuro');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      if (metaTheme) metaTheme.setAttribute('content', '#131514');
      themeBtn.setAttribute('aria-label', 'Activar modo claro');
    }
  });

  // Escape: cerrar menú móvil
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      closeNav();
      toggle?.focus();
    }
  });

  // Focus trap del menú móvil
  nav?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
    const focusable = nav.querySelectorAll('a, button') as NodeListOf<HTMLElement>;
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
</script>
```

- [ ] **Step 2: Verificar que el dropdown y CategoryIcon ya no se referencian en Header**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "nav-dropdown|CategoryIcon|comparativaLinks|infoLinks|#09090b" src/components/Header.astro
```
Expected: sin resultados (exit 1).

- [ ] **Step 3: Build verde**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -15
```
Expected: build verde, "Complete!", ~88 páginas, sin errores.

- [ ] **Step 4: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/components/Header.astro
git commit -m "feat(rediseno): fase 1 — header nav editorial plano (5 destinos, buscar icono, sin dropdown)"
```

---

## Task 2: global.css — chrome sólido+hairline, borrar CSS muerto del dropdown, :active, focus-ring

**Files:**
- Modify: `src/styles/global.css` (varios bloques)

- [ ] **Step 1: `.header` → superficie sólida + hairline (quitar glass/backdrop-filter)**

Reemplazar el bloque `.header` (actualmente líneas ~351-361):

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
  isolation: isolate;
}
```
por:
```css
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
  isolation: isolate;
}
```

- [ ] **Step 2: `.nav` móvil → superficie sólida + hairline**

Reemplazar las 4 líneas glass dentro de `.nav` en `@media (max-width: 768px)` (actualmente ~461-464):

```css
    background: var(--glass-bg-strong);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-bottom: 1px solid var(--color-border);
```
por:
```css
    background: var(--surface);
    border-bottom: 1px solid var(--border);
```

- [ ] **Step 3: `:active scale` para los anchors del chrome + etiqueta sr-only de Buscar**

Inmediatamente después del bloque `.nav-link.active::after { ... }` (termina ~línea 437), insertar:

```css
/* Feedback táctil en enlaces de nav (los <button> ya lo tienen vía motion.css) */
.nav-link {
  transition: color var(--transition), background var(--transition), transform var(--dur-press) var(--ease-out);
}
.nav-link:active,
.logo:active {
  transform: scale(0.97);
}

/* Buscar: icono en desktop, etiqueta visible en móvil */
.nav-search {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.nav-search-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 768px) {
  .nav-search-label {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
}
```

Nota: la regla `.nav-link { transition: color ... }` original (~405-414) se mantiene; este bloque re-declara las 3 propiedades de transición completas para AÑADIR `transform`. No borres la regla original (define padding, color, etc.); solo añade esta segunda declaración `.nav-link` después.

- [ ] **Step 4: Borrar el bloque CSS muerto del dropdown (ya no existe en el markup)**

Localizar con precisión:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "^\.nav-dropdown|^\.nav-search|^\.section-categories" src/styles/global.css
```

Borrar íntegro el rango que va desde la primera línea `.nav-dropdown {` (~1658) hasta (sin incluir) `.section-categories {` (~1826). Eso elimina TODAS las reglas `.nav-dropdown`, `.nav-dropdown-trigger`, `.nav-dropdown-arrow`, `.nav-dropdown-menu`, `.nav-dropdown-menu::before`, `.nav-dropdown-heading`, `.nav-dropdown-divider`, `.nav-dropdown-item*`, su bloque `@media (max-width: 768px)` y la regla `.nav-search`/`.nav-search svg` LEGACY (~1603-1614 si cayera en el rango).

IMPORTANTE: `.nav-search` se redefine en Step 3, así que cualquier `.nav-search`/`.nav-search svg` legacy DEBE quedar borrada para no duplicar. Conservar intacta `.section-categories` y lo que venga después.

- [ ] **Step 5: `[data-theme="dark"] .header` → sólido (quitar rgba glass remanente)**

Reemplazar (actualmente ~1528-1535):
```css
[data-theme="dark"] .header {
  background: rgba(9, 9, 11, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .nav {
  background: var(--color-bg);
}
```
por:
```css
[data-theme="dark"] .header {
  background: var(--surface);
  border-bottom-color: var(--border);
}

[data-theme="dark"] .nav {
  background: var(--surface);
}
```

- [ ] **Step 6: Focus-ring sin azul AI (glow tintado al acento)**

Reemplazar (actualmente ~1517-1522):
```css
button:focus-visible,
.affiliate-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}
```
por:
```css
button:focus-visible,
.affiliate-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent);
}
```

- [ ] **Step 7: `.bottom-nav` → superficie sólida + hairline**

Reemplazar las 4 líneas glass dentro de `.bottom-nav` (actualmente ~1863-1866):
```css
  background: var(--glass-bg-strong);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
```
por:
```css
  background: var(--surface);
  border-top: 1px solid var(--border);
```

- [ ] **Step 8: Verificar que no queda glass/backdrop-filter en el chrome ni CSS de dropdown**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "nav-dropdown" src/styles/global.css
grep -nE "glass|backdrop-filter|rgba\(37, 99, 235|rgba\(9, 9, 11" src/styles/global.css
```
Expected:
- 1ª: sin resultados (exit 1) — CSS de dropdown borrado.
- 2ª: las ÚNICAS coincidencias permitidas son las definiciones de los alias `--glass-*` en `:root`/`[data-theme="dark"]` (~140-143 y ~209-212, que apuntan a `--surface`/`--border`/`0px`). NO debe aparecer ningún `var(--glass-bg-strong)`/`backdrop-filter: blur(var(--glass-blur))` en `.header`, `.nav`, `.nav-dropdown*`, `.bottom-nav`. Verifícalo a ojo en el listado.

- [ ] **Step 9: Build verde**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -15
```
Expected: build verde, ~88 páginas, sin errores de CSP ni de CSS.

- [ ] **Step 10: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/styles/global.css
git commit -m "feat(rediseno): fase 1 — chrome solido+hairline, borrar CSS muerto dropdown, focus-ring sin azul AI"
```

---

## Task 3: Footer.astro — verificación editorial + :active

**Files:**
- Modify: `src/styles/global.css` (`.footer-back-top:active`)
- Verify (no edit salvo confirmación): `src/components/Footer.astro`

- [ ] **Step 1: Confirmar que el Footer ya es editorial (sin glass ni arcoíris)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "glass|backdrop-filter|#2563eb|#f59e0b|#ec4899|#8b5cf6" src/components/Footer.astro || echo "Footer markup limpio: OK"
```
Expected: imprime `Footer markup limpio: OK`. El Footer hereda los tokens editoriales de Fase 0 (footer-bg oscuro sólido, links con hairline `::after` en acento). No requiere cambios de markup.

- [ ] **Step 2: Añadir feedback `:active` al botón flotante "volver arriba"**

`.footer-back-top` es un `<a>` (no lo cubre `motion.css`). Tras el bloque `.footer-back-top:hover { ... }` (termina ~línea 1364), insertar:

```css
.footer-back-top:active {
  transform: scale(0.95);
}
```

- [ ] **Step 3: Build verde + commit**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -8
git add src/styles/global.css
git commit -m "feat(rediseno): fase 1 — footer :active en volver-arriba (verificado editorial)"
```
Expected: build verde antes del commit.

---

## Task 4: Base.astro — cablear initReveal() + retirar glass del cookie-banner

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Cablear `initReveal()` con un `<script>` bundled + guard de idempotencia**

En `src/layouts/Base.astro`, justo DESPUÉS del bloque del observer legacy de reveal (el `<!-- Scroll reveal observer -->` con su `<script is:inline>`, termina ~línea 168) y antes del comentario `<!-- Microsoft Clarity ... -->`, insertar este bloque nuevo (NO es `is:inline`: Astro lo bundlea y resuelve el import TS):

```astro
    <!-- Reveal-on-scroll editorial (data-reveal) — Fase 1 -->
    <script>
      import { initReveal } from '@/scripts/reveal';
      const w = window as unknown as { __revealInit?: boolean };
      if (!w.__revealInit) {
        w.__revealInit = true;
        initReveal();
      }
    </script>
```

Nota de diseño: el observer legacy inline (`.reveal`/`.reveal-group`) se mantiene intacto; gobierna titulares y `categories-grid`. Este `initReveal()` gobierna `[data-reveal]` (de momento solo `ArticleCard`, Task 5). Selectores disjuntos = sin conflicto. El guard `__revealInit` evita doble-observer si el script se incluyera dos veces.

- [ ] **Step 2: Retirar glass del `cookie-banner` (chrome propiedad de Base)**

En el `<style>` del cookie-banner (~270-282), reemplazar:
```css
        background: var(--glass-bg-strong);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border-top: 1px solid var(--glass-border);
```
por:
```css
        background: var(--surface);
        border-top: 1px solid var(--border);
```

- [ ] **Step 3: Verificar breadcrumb base (solo confirmación, sin cambios)**

El breadcrumb global (`.breadcrumb`, `global.css:912-932`) ya es editorial tras Fase 0: usa `var(--color-text-muted)` (alias de `--ink-muted`), hover en `var(--color-primary)` (=`--accent`) y separador hairline. No requiere cambios. Confirmar:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
sed -n '912,932p' src/styles/global.css
```
Expected: usa variables (no literales azul/arcoíris). Sin acción.

- [ ] **Step 4: Verificar que no queda glass en Base**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -nE "glass|backdrop-filter" src/layouts/Base.astro
```
Expected: sin resultados (exit 1).

- [ ] **Step 5: Build verde**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -15
```
Expected: build verde, ~88 páginas. El nuevo `<script>` bundled debe resolver `@/scripts/reveal` sin error (alias `@` ya configurado en tsconfig). Si falla la resolución, confirmar que `src/scripts/reveal.ts` existe y exporta `initReveal`.

- [ ] **Step 6: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/layouts/Base.astro
git commit -m "feat(rediseno): fase 1 — cablear initReveal() con guard + cookie-banner sin glass"
```

---

## Task 5: ArticleCard a [data-reveal] + retirar reveal-group de los grids de tarjetas

**Files:**
- Modify: `src/components/ArticleCard.astro` (línea 54)
- Modify: `src/pages/index.astro` (líneas 223, 273, 291)
- Modify: `src/layouts/Article.astro` (línea 247)

- [ ] **Step 1: Añadir `data-reveal` al `<article>` raíz de la tarjeta**

En `src/components/ArticleCard.astro`, en el `<article class="article-card" ...>` (línea 54), añadir el atributo `data-reveal`:

Reemplazar:
```astro
<article class="article-card" data-tipo={tipoArticulo} style={`--card-accent: var(--color-cat-${badgeCategoria})`}>
```
por:
```astro
<article class="article-card" data-reveal data-tipo={tipoArticulo} style={`--card-accent: var(--color-cat-${badgeCategoria})`}>
```

- [ ] **Step 2: Quitar `reveal-group` de los 3 grids de `ArticleCard` en index.astro**

Run para localizar exacto:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -n "articles-grid reveal-group" src/pages/index.astro
```
Sustituir cada coincidencia `class="articles-grid reveal-group"` → `class="articles-grid"` (líneas 223, 273, 291: los 3 contenedores que envuelven `<ArticleCard .../>`).

IMPORTANTE: NO tocar `categories-grid reveal-group` (línea 196, contiene tarjetas de categoría, no `ArticleCard`) ni los `.reveal` de titulares (`section-title reveal`, `section-subtitle reveal`). Siguen con el sistema legacy.

- [ ] **Step 3: Quitar `reveal-group` del grid de relacionados en Article.astro**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -n "articles-grid reveal-group" src/layouts/Article.astro
```
Sustituir la coincidencia (línea 247) `class="articles-grid reveal-group"` → `class="articles-grid"`.

- [ ] **Step 4: Verificar que ningún `ArticleCard` queda dentro de un `reveal-group` (sin doble-reveal)**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -rn "articles-grid reveal-group" src/
```
Expected: sin resultados (exit 1). Cualquier `reveal-group` restante (p.ej. `categories-grid reveal-group`) NO debe envolver `ArticleCard`.

- [ ] **Step 5: Build verde**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -15
```
Expected: build verde, ~88 páginas.

- [ ] **Step 6: Confirmar que el build sirve `data-reveal` en las tarjetas y no referencia fuentes viejas**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
grep -rl "data-reveal" dist/ | head -3
grep -rE "inter-latin|space-grotesk" dist/ | head || echo "sin fuentes viejas: OK"
```
Expected: 1ª lista ≥1 archivo HTML con `data-reveal`; 2ª imprime `sin fuentes viejas: OK`.

- [ ] **Step 7: Commit**

```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git add src/components/ArticleCard.astro src/pages/index.astro src/layouts/Article.astro
git commit -m "feat(rediseno): fase 1 — ArticleCard data-reveal, retirar reveal-group de grids de tarjetas"
```

---

## Task 6: Build final + barrido de verificación

**Files:** ninguno (verificación)

- [ ] **Step 1: Build completo limpio**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
npm run build 2>&1 | tail -25
```
Expected: build verde, "Complete!", ~88 páginas, sin errores de CSP/fuentes/CSS.

- [ ] **Step 2: Barrido de reglas duras del chrome**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
echo "--- nav 1 línea: header-height ≤80px ---"; grep -nE "header-height:" src/styles/global.css
echo "--- sin dropdown CSS (debe ser 0) ---"; grep -c "nav-dropdown" src/styles/global.css
echo "--- sin azul AI literal en chrome ---"; grep -nE "rgba\(37, 99, 235|#2563eb|rgba\(9, 9, 11" src/styles/global.css || echo "OK sin azul AI"
echo "--- em-dash en chrome (debe ser 0) ---"; grep -rn "—" src/components/Header.astro src/components/Footer.astro src/layouts/Base.astro || echo "OK sin em-dash"
```
Expected: `header-height` = `64px` (≤80px ✓); `nav-dropdown` count = `0`; sin azul AI; sin em-dash.

- [ ] **Step 3: Confirmar git limpio salvo lo de esta fase**

Run:
```bash
cd /home/darumo/Proyectos/tuespaciodetrabajo
git status --short
git log --oneline -6
```
Expected: working tree limpio; los 5 commits de Fase 1 presentes (Tasks 1-5). Sin cambios sin commitear.

---

## Self-Review (hecho)

- **Cobertura del alcance Fase 1 (roadmap):**
  - Header nav 1 línea ≤80px, condensado a Catálogo/Guías/Actualidad/Herramientas/Buscar(icono), toggle, `:active scale` → Task 1 (markup) + Task 2 Step 3 (`:active`). ✓
  - Footer editorial, hairlines, sin arcoíris ni glass → Task 3 (verificado, ya cumplía tras Fase 0; +`:active`). ✓
  - Base cablear `initReveal()` con guard de idempotencia MPA + breadcrumb base → Task 4 Steps 1, 3. ✓
  - Aplicar `data-reveal` al patrón de tarjetas global → Task 5 (ArticleCard + retirar reveal-group de grids). ✓
  - Retirar `--glass-*`/`backdrop-filter` de Header/Footer (+bottom-nav, cookie) → Task 2 (Steps 1,2,5,7) + Task 4 Step 2. ✓
- **Reglas duras:** CSS plano (sin Tailwind/React) ✓; fuentes self-host intactas ✓; CSP la regenera `npm run build` (tareas build) ✓; tokens nuevos (`--surface/--border/--accent/--dur-press/--ease-out`) usados ✓; cero em-dash (Task 6 Step 2 lo verifica) ✓; nav 1 línea (header-height 64px) ✓; contraste AA heredado de Fase 0 ✓.
- **Placeholders:** ninguno; todo el código va literal.
- **Consistencia de nombres:** `initReveal` (definido en `reveal.ts` Fase 0) cableado con el mismo nombre en Task 4. `[data-reveal]`/`.is-visible` (motion.css Fase 0) ↔ `data-reveal` en ArticleCard (Task 5). `nav-search`/`nav-search-label` definidos en Task 2 Step 3 y usados en Task 1 markup. `--dur-press`/`--ease-out` provienen de `motion.css` (Fase 0).
- **Riesgo conocido (documentado):** al aplanar el Header desaparece el acceso directo desde desktop a las páginas de comparativa por categoría (`/sillas/`, `/escritorios/`, `/accesorios/`, `/ambiente/`). Siguen accesibles vía `/catalogo/`, footer y bottom-nav (móvil). Es la simplificación editorial intencionada del roadmap.
- **Diferido a fases siguientes:** stagger por-tarjeta vía `data-reveal-delay` (cuando se reworkeen index/Article en Fases 2-3); migración del resto de `.reveal`/`.reveal-group` legacy al sistema `[data-reveal]`; pasada visual manual en ambos modos.

---

## Pendiente al cerrar Fase 1 (NO ejecutar aquí)

- Pasada visual manual (`npm run preview`) en home + listado + artículo, light y dark: confirmar header sólido con hairline (sin blur), nav en 1 línea, Buscar como icono en desktop y con etiqueta en móvil, reveal de tarjetas suave, dark theme-color coherente (`#131514`).
- NO continuar a Fase 2 (Home). Reportar commits y parar.
