# Tu Espacio de Trabajo — tuespaciodetrabajo.com

Web de guías y comparativas de productos de home office y ergonomía para teletrabajadores en España. Monetización por afiliados (Amazon).

## Stack técnico

- **Framework:** Astro 5 (static output)
- **Deploy:** Cloudflare Pages
- **Dominio:** tuespaciodetrabajo.com
- **Contenido:** MDX en `src/content/articulos/`
- **CSS:** Plain CSS con custom properties (`src/styles/global.css`). No Tailwind.

## Tipos de contenido

- `tipo: comparativa | informativo` (default: `comparativa`)
- **Comparativas:** análisis de productos con ComparisonTable, TopPick, AffiliateButton. URL: `/[categoria]/[slug]/`
- **Informativos:** guías de ergonomía, productividad, configuración. URL: `/guias/[slug]/`. Sin disclaimer de afiliados.

## Categorías

`sillas` · `escritorios` · `accesorios` · `ambiente` · `audio-video`

## URLs

| Página | Ruta |
|--------|------|
| Homepage | `/` |
| Categoría | `/[categoria]/` |
| Comparativa | `/[categoria]/[slug]/` |
| Guía (artículo) | `/guias/[slug]/` |
| Guías (listado) | `/guias/` |
| Todos | `/articulos/` |
| Búsqueda | `/buscar/` |
| RSS | `/rss.xml` |
| Sobre nosotros | `/sobre-nosotros/` |

## Archivos clave

- `src/content/config.ts` — schema de content collections
- `src/layouts/Base.astro` — layout HTML base con SEO, OG, preconnect
- `src/layouts/Article.astro` — layout artículos con breadcrumb, TOC, related, FAQs
- `src/components/ComparisonTable.astro` — tabla comparativa con Product schema
- `src/components/AffiliateButton.astro` — botón afiliado (auto-appends tag)
- `src/components/TopPick.astro` — producto destacado (auto-appends tag)
- `src/styles/global.css` — todos los estilos
- `PRODUCTOS.md` — tracking de URLs Amazon e imágenes por artículo

## Frontmatter de artículos

```yaml
titulo: string                    # max ~60 chars, keyword principal
descripcion: string               # max ~155 chars, keyword + CTA
categoria: sillas | escritorios | accesorios | ambiente | audio-video
tipo?: comparativa | informativo  # default: comparativa
fecha: date                       # YYYY-MM-DD (fecha real del commit)
imagen?: string                   # ruta a imagen del artículo
imagenAlt?: string                # alt descriptivo con keywords
destacado?: boolean               # default false
tags?: string[]                   # 3-6 keywords long-tail
autor: string                     # nombre REAL, no marca
actualizadoEn?: date              # solo cuando hay actualización real
faqs?: [{pregunta, respuesta}]    # 3-7 por artículo, variable
```

## CSP y seguridad

- Build: `astro build && node scripts/update-csp-hashes.mjs`
- Nunca editar hashes CSP manualmente (se sobreescriben en cada build)
- Nunca usar `'unsafe-inline'` para script-src

---

## Contexto persistente (LEER AL INICIO DE SESIÓN)

Toda la información de contexto vive en `docs/agent-context/`, versionada en el repo.

Al iniciar sesión o cuando el usuario pida continuar trabajo previo:
1. Leer `docs/agent-context/INDEX.md`
2. Leer los archivos relevantes según la tarea

Cuando haya información nueva que deba persistir: escribir/actualizar en `docs/agent-context/` y registrar en `INDEX.md`.

---

## Contexto on-demand (cargar según tarea)

| Tarea | Cargar |
|-------|--------|
| Escribir/auditar/evaluar artículo | `reference_seo_workflows.md` + `reference_article_checklists.md` |
| Productos Amazon / comparativas | `reference_amazon_rules.md` |
| Backlinks / foros / Reddit | `project_backlinks_plan.md` + `project_backlinks_session_state.md` |
| Recovery / indexación | `project_recovery_plan.md` + `project_recovery_session_state.md` |
| Coherencia de persona | `project_author_persona.md` |
| Humanización de texto | `.seo-engine/templates/humanization-guide.md` |

---

## Reglas universales (NUNCA / SIEMPRE)

- **NUNCA adivinar precios** — verificar en Amazon.es
- **NUNCA inventar URLs/ASINs de Amazon** — buscar el ASIN real o pedir al usuario
- **NUNCA usar links markdown a `/dp/ASIN`** — usar `<AffiliateButton href="/dp/ASIN" tienda="amazon" texto="..." />`
- **NUNCA poner `actualizadoEn` en bulk** — señal de freshness spam
- **NUNCA usar web search para SERP data** — pedir datos reales al usuario
- **Siempre verificar imágenes** de producto (existan, carguen, correspondan)
- **Fecha de publicación = fecha real** — `fecha` = día en que se crea el artículo
- **Internal links: verificar tipo del destino** — informativo → `/guias/[slug]/`, comparativa → `/[categoria]/[slug]/`
- **Internal links siempre a artículos concretos** — nunca a categorías sueltas
- **No emails en texto plano en MDX** — enlazar a `/sobre-mi/`
- **Meta descriptions: 120-155 caracteres**
- **BreadcrumbList schema: último item con `item` (URL)**
- **Imágenes artículo: máximo 800px ancho**
- **COHERENCIA OBLIGATORIA entre artículos** — leer artículos existentes antes de escribir experiencias personales, datos del autor, anécdotas
- **Humanizar todo contenido público** antes de publicar (aplicar `.seo-engine/templates/humanization-guide.md`)
- **Siempre presentar borradores con URL pública** — Reddit con `www.reddit.com` (no `old.reddit.com`) y Quora con URL completa. El link old.reddit se usa solo para recon interno, nunca para entregar al usuario.

---

## SEO Content Engine (pointer)

El motor SEO vive en `.seo-engine/`. Para cualquier tarea de contenido/SEO:
1. Leer `docs/agent-context/reference_seo_workflows.md` (workflows completos)
2. Leer `.seo-engine/config.yaml` y los data files relevantes

No escribir contenido sin consultar primero los data files del engine.
