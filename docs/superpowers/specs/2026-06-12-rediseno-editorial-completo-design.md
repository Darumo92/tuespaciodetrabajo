# Rediseño editorial completo — tuespaciodetrabajo.com

**Fecha:** 2026-06-12
**Tipo:** Redesign-Overhaul (nuevo lenguaje visual, se preserva contenido + URLs + IA de rutas)
**Objetivo:** Web totalmente renovada que NO parezca hecha por IA, basada en tres skills de diseño: `emil-design-eng`, `design-taste-frontend`, `impeccable`.

---

## 0. Contexto y diagnóstico

### Stack (no cambia)
- Astro 5, static output, Cloudflare Pages.
- **CSS plano** con custom properties en `src/styles/global.css` (3336 líneas hoy). Sin Tailwind, sin React, sin Motion. Lo manda `AGENTS.md` e importa para Core Web Vitals (SEO de afiliados).
- Fuentes self-hosted en `/fonts/*.woff2` con preload, CSP con hashes. Nunca `<link>` a Google Fonts, nunca `'unsafe-inline'`.

### Diagnóstico del diseño actual (= "hecho por IA")
Auditados los tokens en `global.css:46-130`. Cada punto es un *AI-tell* documentado en las skills:
- Tipografía: **Inter** + Space Grotesk (Inter = default desaconsejado).
- Color primario **azul #2563eb** (el "AI blue").
- **Glassmorphism** (`--glass-bg`, `--glass-blur`) usado por defecto.
- **8 colores arcoíris** por categoría (`--color-cat-*`) → rompe *color consistency lock*.
- Sombras pesadas (`--shadow-xl`), gradientes, radii múltiples sin sistema.

### Decisiones bloqueadas (aprobadas por el usuario)
| Eje | Valor |
|---|---|
| Alcance | Visual + UX/IA + contenido |
| Dirección estética | Editorial técnico (revista de producto seria, experta) |
| Dials (design-taste-frontend) | `DESIGN_VARIANCE 6` · `MOTION_INTENSITY 4` · `VISUAL_DENSITY 3` |
| Tipografía | Schibsted Grotesk (display + UI) + Source Serif 4 (lectura larga). Self-hosted OFL. |
| Acento | Verde abeto `#1f4d3a`, único, bloqueado en toda la web |
| Dark mode | Sí, ambos modos, diseñado a mano (no inversión automática) |

---

## 1. Sistema de diseño (tokens)

Reescribir el bloque `:root` de `global.css`. Tokens en **OKLCH** con fallback hex.

### Color — light
- `--bg` papel off-white croma ~0 (NO cream/beige-IA): `oklch(0.985 0.002 110)` ≈ `#fafafa`.
- `--surface` blanco puro para tarjetas que lo necesiten: `#ffffff`.
- `--ink` off-black `#16181a` (nunca `#000`).
- `--ink-muted` verificado ≥4.5:1 sobre `--bg`.
- `--accent` verde abeto `#1f4d3a`; `--accent-ink` = papel (texto sobre acento); `--accent-hover` un paso más oscuro.
- `--border` hairline 1px; jerarquía por líneas, no por sombras.

### Color — dark (diseñado a mano)
- `--bg` near-black `#131514` (nunca `#000`).
- `--ink` `#f2f2f0` (nunca `#fff`).
- `--accent` verde aclarado para mantener contraste AA sobre oscuro (p.ej. `oklch(0.72 0.12 158)`); verificar 3:1 en botones / 4.5:1 en texto.
- Paridad de jerarquía: si el CTA destaca en light, destaca en dark.

### Categorías
- Eliminar `--color-cat-*` (arcoíris). Distinción por **icono + etiqueta neutra**; único color de marca = verde abeto. Cumple *Color Consistency Lock*.

### Forma y profundidad
- **Una** escala de radio: `--radius: 6px` (+ `--radius-full` solo para pills interactivos si aplica). *Shape Consistency Lock*.
- Sombras mínimas, tintadas al hue del fondo. Cero glassmorphism por defecto (ban de impeccable). Si en algún punto se justifica glass, lleva fallback `prefers-reduced-transparency`.
- Escala z-index semántica (dropdown → sticky → modal → toast → tooltip). Nada de `z-999`.

### Bans absolutos heredados de impeccable (auditar en cada fase)
side-stripe borders >1px · gradient text (`background-clip:text`) · glassmorphism default · hero-metric template · card grids idénticos repetidos · texto que desborda su contenedor.

---

## 2. Tipografía + motion

### Tipografía
- **Display + UI:** Schibsted Grotesk. Headlines `clamp()` max ≤6rem, `letter-spacing` ≥ -0.04em (floor), `text-wrap: balance` en h1-h3.
- **Lectura de artículos:** Source Serif 4. Columna 65-75ch, line-height ~1.7, `text-wrap: pretty` en prosa.
- Par en eje de contraste (sans geométrico + serif). Énfasis dentro de titular = mismo family en italic/bold, nunca inyectar serif suelto.
- Self-host: añadir `schibsted-grotesk-latin.woff2` y `source-serif-4-latin.woff2` a `/fonts/`, preload en `Base.astro`, retirar Inter/Space Grotesk. Actualizar hashes CSP en build.

### Motion (emil-design-eng)
- Curvas: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Nunca `ease-in` en UI, nunca `transition: all`.
- Durations: botón 140ms; hover/tooltip 125-200ms; reveal 400-600ms. Todo <300ms salvo reveals editoriales.
- Botones/pressables: `:active { transform: scale(0.97) }`. Nunca animar desde `scale(0)` (usar `scale(0.95)` + opacity).
- Reveal-on-scroll: IntersectionObserver vanilla, `{ once: true }`, stagger 50ms entre items. Solo `transform` + `opacity` (GPU). CSS transitions (interrumpibles), no keyframes para UI dinámica.
- "¿Debe animar?": NO animar acciones de teclado ni elementos vistos decenas de veces/día. Motion motivado (jerarquía/feedback/secuencia), nunca decorativo.
- `@media (prefers-reduced-motion: reduce)`: colapsar movimiento a crossfade/instantáneo. Obligatorio.
- Hover gateado con `@media (hover: hover) and (pointer: fine)`.

---

## 3. UX / IA

### Navegación
- Una línea, altura ≤80px (default 64-72px). Condensar a: **Catálogo · Guías · Actualidad · Herramientas · Buscar (icono)**. Sin nav de dos líneas. Toggle dark/light discreto.
- Labels de nav y slugs de ruta NO cambian (preservación SEO). Solo cambia presentación.

### Home (`index.astro`)
Hero editorial **asimétrico** (no centrado, VARIANCE 6): value-prop ≤20 palabras / ≤2 líneas de titular, una imagen real, CTA primario visible sin scroll, `pt` ≤6rem. Máx 4 elementos de texto en el hero. Luego secciones con ≥4 familias de layout distintas, sin repetir, máx 1 eyebrow cada 3 secciones:
1. Categorías destacadas (bento con ritmo, celdas exactas = nº de categorías, diversidad de fondo).
2. Últimas comparativas.
3. Guías recientes.
4. Actualidad.
5. Bloque método/confianza (E-E-A-T: cómo probamos, autor real).

### Artículo (`Article.astro`)
Columna serif de lectura 65-75ch, breadcrumb + TOC refinados, related, FAQs. **ComparisonTable** rediseñada sin hairline en cada fila (slop); agrupar filas en clusters o tarjeta-por-spec. TopPick sin plantilla hero-metric.

### Catálogo / ficha
TarjetaProducto y FichaProducto editoriales; ValoracionEjes (multi-eje) sin barras de progreso con track de fondo relleno (slop de dashboard) → número + icono o barra fina sin track. Comparador y TablaVs coherentes.

### Estados
Loading (skeleton con forma del layout final, no spinner genérico), empty, error inline. Feedback táctil `:active`.

---

## 4. Contenido

- Reescribir copy de home + secciones: verbos concretos, fuera filler ("eleva / sin fisuras / next-gen"), nombres y datos reales (no "Acme"/"John Doe").
- **Cero em-dash** (`—`/`–`) en todo texto visible. Hyphen normal.
- Fuera eyebrow-en-cada-sección y marcadores numerados 01/02/03 (AI-tells).
- Un label por intención de CTA (no "Contacta" + "Hablemos" + "Escríbeme").
- **Humanización obligatoria** del copy público con `.seo-engine/templates/humanization-guide.md` (lo manda AGENTS.md).
- Coherencia de persona/autor: leer artículos existentes antes de tocar anécdotas/datos del autor.

---

## 5. Inventario de componentes a refactorizar

Layouts: `Base.astro`, `Article.astro`.
Chrome: `Header.astro`, `Footer.astro`, `LogoIcon`, `CategoryIcon`, `StoreIcon`, `SmoothScroll`.
Contenido: `ArticleCard`, `ComparisonTable`, `TopPick`, `AffiliateButton`, `BotonPrecio`.
Producto: `producto/TarjetaProducto`, `FichaProducto`, `ValoracionEjes`, `ImagenProducto`, `FallbackImagen`, `ParaQuien`, `CatalogoProductos`, `ComparadorProductos`, `TablaVs`.
Páginas: `index`, `[categoria]/index`, `[categoria]/[slug]`, `guias/*`, `articulos`, `buscar*`, `catalogo/*`, `comparar/*`, `actualidad/*`, `herramientas/*`, `sobre-mi`, legales, `404`.

---

## 6. Fases del super plan

Cada fase compila (`npm run build`) y se despliega de forma independiente. URLs intactas en todas → riesgo de indexación nulo.

| Fase | Alcance | Riesgo SEO |
|---|---|---|
| **0 · Cimientos** | tokens nuevos (color/forma/sombra/z), fuentes self-host + retirar Inter/Space Grotesk, primitivas de motion (curvas, mixins), tokens dark a mano, util IntersectionObserver reveal | nulo |
| **1 · Chrome global** | `Header` (nav 1 línea + toggle tema), `Footer`, `Base.astro`, breadcrumb base | bajo |
| **2 · Home** | hero editorial asimétrico + secciones + reescritura de copy | bajo |
| **3 · Lectura** | `Article.astro`, prosa serif, TOC, `ComparisonTable`, `TopPick`, `AffiliateButton`, `BotonPrecio` | bajo |
| **4 · Catálogo** | `TarjetaProducto`, `FichaProducto`, `ValoracionEjes`, `ImagenProducto`, `CatalogoProductos`, `ComparadorProductos`, `TablaVs` | bajo |
| **5 · Secundarias** | `buscar`, `actualidad`, `guias`, `herramientas`, `[categoria]/index`, `articulos`, legales, `sobre-mi`, `404` | bajo |
| **6 · Pulido** | motion polish (revisión a día siguiente, slow-motion), humanización de copy, audit a11y + contraste WCAG, Core Web Vitals (LCP<2.5 / INP<200 / CLS<0.1), pase dark mode + cross-browser, **AI slop test** final | nulo |

### Criterio de "hecho" por fase
- `npm run build` verde, sin regresión de páginas.
- Pre-Flight Check de `design-taste-frontend` (Sección 14) pasa para las superficies tocadas.
- Contraste WCAG AA verificado en ambos modos.
- Cero AI-tells de la Sección 9 de design-taste-frontend.

---

## 7. Trazabilidad a las skills

- **emil-design-eng:** curvas de easing, `:active scale`, durations, reveal stagger, no-animar-teclado, reduced-motion, GPU-only, transitions>keyframes.
- **design-taste-frontend:** design read + dials, AI-tells eliminados, consistency locks (color/forma/tema), hero discipline, nav 1 línea, modo Redesign-Overhaul, preservación SEO.
- **impeccable:** OKLCH, ban cream-beige-IA, contraste verificado, par tipográfico en eje de contraste, clamp/tracking floors, bans absolutos (side-stripe, gradient-text, glass, hero-metric, card grids), AI slop test como gate.

---

## 8. Riesgos y mitigación

- **CSP:** cada build regenera hashes (`update-csp-hashes.mjs`). No editar a mano. Nuevas fuentes self-hosted no afectan script-src.
- **Core Web Vitals:** fuentes con `font-display: swap` + preload; reveal con IntersectionObserver (no listeners de scroll); reservar espacio para imágenes (CLS).
- **global.css 3336 líneas:** se reescribe por capas (tokens primero en Fase 0, luego por componente). No tocar todo de golpe.
- **Persona/coherencia de contenido:** la reescritura de copy respeta datos del autor existentes.
