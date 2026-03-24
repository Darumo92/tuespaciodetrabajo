# Tu Espacio de Trabajo — tuespaciodetrabajo.com

Web de guias y comparativas de productos de home office y ergonomia para teletrabajadores en Espana, con monetizacion por afiliados (Amazon) y publicidad (futuro).

## Stack tecnico

- **Framework:** Astro 5 (static output)
- **Deploy:** Cloudflare Pages
- **Dominio:** tuespaciodetrabajo.com (registrado en Cloudflare)
- **Contenido:** MDX en `src/content/articulos/`
- **CSS:** Plain CSS con custom properties (`src/styles/global.css`). No Tailwind.

## Tipos de contenido

- `tipo: comparativa | informativo` — campo en frontmatter (default: `comparativa`)
- **Comparativas** (`comparativa`): analisis de productos con ComparisonTable, TopPick, AffiliateButton. URL: `/[categoria]/[slug]/`
- **Informativos** (`informativo`): guias de ergonomia, productividad, configuracion. URL: `/guias/[slug]/`. Sin disclaimer de afiliados.

## Estructura de categorias (comparativas)

- `sillas` — sillas ergonomicas, taburetes, cojines lumbares, reposapiernas
- `escritorios` — escritorios fijos, elevables (standing desk), mesas auxiliares, soportes portatil
- `accesorios` — monitores, soportes monitor, teclados, ratones, reposamuñecas, webcams, hubs USB, organizadores cables
- `ambiente` — iluminacion, plantas, paneles acusticos, humidificadores, calefaccion, ventilacion
- `audio-video` — auriculares, microfonos, altavoces, anillos de luz, fondos videollamada

## URLs

- Homepage: `/`
- Categoria: `/[categoria]/`
- Comparativa: `/[categoria]/[slug]/`
- Guias (listado): `/guias/`
- Guias (articulo): `/guias/[slug]/`
- Todos: `/articulos/`
- Busqueda: `/buscar/`
- RSS: `/rss.xml`
- Sobre nosotros: `/sobre-nosotros/`

## Archivos clave

- `src/content/config.ts` — schema de content collections
- `src/layouts/Base.astro` — layout HTML base con SEO, OG, preconnect
- `src/layouts/Article.astro` — layout articulos con breadcrumb, TOC, related, FAQs
- `src/components/ComparisonTable.astro` — tabla comparativa con Product schema
- `src/components/AffiliateButton.astro` — boton afiliado (auto-appends tag)
- `src/components/TopPick.astro` — producto destacado (auto-appends tag)
- `src/components/ArticleCard.astro` — tarjeta de articulo
- `src/styles/global.css` — todos los estilos
- `PRODUCTOS.md` — tracking de URLs Amazon e imagenes por articulo

## Frontmatter de articulos

```yaml
titulo: string                    # max ~60 caracteres, keyword principal
descripcion: string               # max ~155 caracteres, keyword + CTA
categoria: sillas | escritorios | accesorios | ambiente | audio-video
tipo?: comparativa | informativo  # default: comparativa
fecha: date                       # YYYY-MM-DD
imagen?: string                   # ruta a imagen del articulo
imagenAlt?: string                # alt descriptivo con keywords
destacado?: boolean               # default false
tags?: string[]                   # 3-6 keywords long-tail
autor: string                     # nombre REAL, no marca
actualizadoEn?: date              # solo cuando hay actualizacion real
faqs?: [{pregunta, respuesta}]    # 3-7 por articulo, variable
```

## SEO implementado

- Schema.org: Article, FAQPage, Product/ItemList, BreadcrumbList, WebSite
- Sitemap + robots.txt
- RSS feed
- OG/Twitter meta tags con imagen por articulo
- Preconnect hints para recursos externos

## Afiliacion

- Amazon Associates ID: `tuespaciodet-21` — se anade automaticamente en `AffiliateButton.astro`, `ComparisonTable.astro` y `TopPick.astro`
- Nunca incluir `?tag=tuespaciodet-21` en las URLs de los articulos MDX — los componentes lo anaden solos
- Usar URLs directas `/dp/ASIN` (no URLs de busqueda `/s?k=`)

## CSP y seguridad

- El `build` command ejecuta `astro build && node scripts/update-csp-hashes.mjs`
- El script post-build escanea `dist/` para inline scripts, calcula SHA-256 hashes, y actualiza `public/_headers` + `dist/_headers`
- Nunca editar los hashes CSP manualmente — se sobreescriben en cada build
- Nunca usar `'unsafe-inline'` para script-src

---

## Checklist obligatorio para articulos

### 1. Verificar que el tema no existe ya
- Buscar en `src/content/articulos/` si ya hay un articulo que cubra el mismo tema
- Si existe uno similar, proponer ampliar/mejorar el existente

### 2. URLs y productos Amazon reales
- Buscar en Amazon.es los productos reales
- Nunca inventar ASINs, URLs ni imagenes de productos
- Si un producto no existe en Amazon.es, buscar un reemplazo equivalente
- Pedir al usuario que confirme los nombres de producto y ASINs

### 3. Contenido extenso y de calidad SEO
- Articulos largos, detallados y de calidad para indexacion y posicionamiento
- Incluir: introduccion, secciones H2/H3, comparativas, guia de compra, consejos, FAQs
- Cada producto con descripcion real, pros y contras reales
- Minimo ~2000-3000 palabras por articulo comparativo
- Minimo ~1500 palabras por articulo informativo

### 4. Imagen del articulo unica y especifica
- La imagen principal NO puede estar ya usada en otro articulo
- La imagen debe ser especifica y representativa del tema concreto (no fotos genericas de oficina)
- Fuente recomendada: Pexels.com, Unsplash.com, o fotos propias
- Preferir imagenes que parezcan "reales" (home office de verdad, no oficina de revista)

### 5. Campos correctos en ComparisonTable
Campos esperados por producto:
- `nombre: string` — nombre del producto
- `imagen: string` — URL de imagen Amazon
- `puntosFuertes: string` — texto descriptivo (NO array, NO `caracteristicas`, NO `descripcion`)
- `precio: string` — ej: "~150 EUR"
- `enlaceAmazon: string` — URL `/dp/ASIN`
- `valoracion: number` — escala 1-5 (NO `puntuacion`, NO escala 1-10)

### 6. Optimizacion SEO
- Titulo: keyword principal, max ~60 caracteres
- Meta descripcion: keyword + CTA, max ~155 caracteres
- FAQs con schema en frontmatter (3-7 por articulo, numero variable)
- Internal linking a articulos relacionados (bidireccional)
- Tags relevantes (3-6 keywords long-tail)
- imagenAlt descriptivo con keywords

### 7. Rebuild tras cambios
- Ejecutar `npm run build` despues de anadir o modificar articulos

---

## 12 Reglas Anti-Error para Lanzamiento

Estas reglas son OBLIGATORIAS y se aplican a todo el contenido del sitio.

### 1. No mas de 20 articulos en el lanzamiento
- Lanzar con 12-15 articulos de alta calidad es mejor que 30 mediocres
- Priorizar variedad de categorias: no todos de sillas, no todos comparativas
- Mejor 10 articulos excelentes que 20 aceptables

### 2. Nombre real y autoria desde el dia 1
- Todos los articulos firmados con nombre REAL, no con "Tu Espacio de Trabajo"
- Pagina "Sobre nosotros" con foto real, historia personal, por que creaste la web
- Schema Person en cada articulo
- Google valora E-E-A-T: la autoria real es fundamental

### 3. Ratio de contenido equilibrado
- **50% guias informativas** — ergonomia, productividad, organizacion, salud postural
- **35% comparativas** — analisis de productos con tabla y afiliacion
- **15% hubs/pilares** — paginas centrales de cluster tematico
- Si todo es comparativa, Google sospecha de sitio de afiliados puro
- Las guias construyen autoridad y atraen links naturales

### 4. Nunca la misma estructura en todos los articulos
- Variar el orden de secciones entre articulos
- Al menos 1 de cada 3 articulos debe tener estructura diferente al estandar
- No todos empiezan con "Que es X" ni terminan con "FAQ"
- Ver `blog-structures.yaml` para variaciones

### 5. Experiencia personal en CADA articulo
- Minimo 2 inserciones de experiencia personal por articulo
- Basadas en la persona de `config.yaml` para consistencia
- Si no has probado un producto, declaralo honestamente
- "De los 6 que analice, solo he probado 2 personalmente"
- Ver `humanization-guide.md` para ejemplos

### 6. Fotos propias siempre que sea posible
- Al menos las fotos de la pagina "Sobre nosotros" y del setup propio deben ser reales
- Para articulos: combinar fotos propias + Pexels/Unsplash
- Las imagenes de Amazon (m.media-amazon.com) son OK para hotlinking de productos
- Evitar fotos de stock de oficinas perfectas — buscar imagenes de home offices reales

### 7. Fechas de publicacion escalonadas y reales
- NO publicar todos los articulos el mismo dia
- Escalonar en un periodo de 2-4 semanas como minimo
- Las fechas deben parecer naturales (no todos los lunes, no intervalos exactos)
- Nunca poner `actualizadoEn` en bulk — es senal de freshness spam para Google

### 8. Longitud variada entre articulos
- No todos los articulos de 2500 palabras exactas
- Comparativas: 2000-3500 palabras (variable)
- Guias: 1500-2500 palabras (variable)
- Pilares: 3000-5000 palabras
- Que la variacion sea natural, no forzada

### 9. Contenido estacional
- Planificar articulos estacionales:
  - Enero: "Como montar tu home office despues de Navidad"
  - Septiembre: "Vuelta al teletrabajo: revisa tu setup"
  - Noviembre: "Black Friday: las mejores ofertas en ergonomia"
  - Verano: "Como mantener fresco tu espacio de trabajo"
- Los articulos estacionales atraen trafico en picos y se pueden actualizar cada ano

### 10. Internal linking bidireccional
- Cada articulo debe enlazar a al menos 2-3 articulos relacionados
- Los enlaces deben ser bidireccionales: si A enlaza a B, B debe enlazar a A
- Anchor text variado y contextual, nunca "haz clic aqui"
- Cluster pages enlazan al pilar, pilar enlaza a todos los cluster pages
- Revisar internal linking cada vez que se publica un articulo nuevo

### 11. Schema markup desde el dia 1
- Article schema en todos los articulos
- FAQPage schema en articulos con FAQs
- Product schema en comparativas (via ComparisonTable)
- BreadcrumbList en todas las paginas
- WebSite schema en la homepage
- Verificar con Google Rich Results Test antes de publicar

### 12. Listas y pros/contras desbalanceados
- NUNCA todos los productos con el mismo numero de pros y contras
- Un producto puede tener 5 pros y 1 contra, otro 2 pros y 3 contras
- El numero de FAQs debe variar entre articulos (3-7, no siempre 5)
- Las listas de "mejores X" no necesitan ser siempre de 5 o 10 items
- La asimetria es natural; la simetria perfecta es marcador de IA

---

## Pre-publish checklist

Antes de publicar CUALQUIER articulo, verificar TODOS estos puntos:

- [ ] Titulo <= 60 caracteres con keyword principal
- [ ] Descripcion <= 155 caracteres con keyword + CTA
- [ ] Slug <= 7 palabras
- [ ] Keyword principal en: titulo, primer parrafo, un H2, descripcion, slug
- [ ] Imagen unica, no repetida en otro articulo
- [ ] imagenAlt descriptivo con keywords
- [ ] Todos los productos con ASIN real verificado en Amazon.es
- [ ] Todas las imagenes de producto cargan correctamente
- [ ] Precios orientativos (~) verificados en Amazon.es
- [ ] Nombres de producto coinciden con los de Amazon.es
- [ ] Al menos 2 inserciones de experiencia personal
- [ ] Intro diferente a articulos recientes de la misma categoria
- [ ] Pros/contras con numero variable por producto
- [ ] Internal links a 2+ articulos relacionados
- [ ] FAQs en frontmatter (3-7, numero variable)
- [ ] Tags relevantes (3-6)
- [ ] Autor con nombre real
- [ ] No hay keyword stuffing
- [ ] Medidas y dimensiones incluidas donde sean relevantes
- [ ] `npm run build` ejecutado sin errores
- [ ] PRODUCTOS.md actualizado con los datos del articulo

---

## Reglas importantes

- **NUNCA adivinar precios** — siempre verificar en Amazon.es
- **NUNCA inventar URLs de Amazon** — buscar el ASIN real
- **NUNCA inventar ASINs** — pedir al usuario si no se puede verificar
- **Pedir al usuario** datos de producto si no se pueden verificar
- **Siempre verificar imagenes** de producto: que existan, carguen y correspondan al producto
- **Si un producto cambia**, actualizar TODO: nombre, ASIN, imagen, precio, descripcion, texto del analisis
- **No poner `actualizadoEn` en bulk** — senal de freshness spam para Google
- **Imagenes de Amazon** (m.media-amazon.com) son OK para hotlinking
- **Buscar CADA producto** por su nombre especifico, nunca busquedas genericas de categoria

---

## SEO Content Engine

SEO engine lives in `.seo-engine/`. Use it for all blog and SEO tasks.

**UNIVERSAL RULE: For ANY task involving blogs, content, SEO, keywords, competitors, or documentation in this project — ALWAYS read `.seo-engine/config.yaml` and the relevant data files FIRST before responding.** This includes writing, evaluating, reviewing, editing, auditing, planning, or answering questions about content. Never rely on your default behavior — always check the engine data.

**Sub-Agent Rule:** Parallelize independent tasks. Don't do sequentially what can run simultaneously.

### File Reference

| File | Purpose | When |
|------|---------|------|
| `config.yaml` | Settings, author, trust signals | Before any task |
| `data/features.yaml` | Feature registry | Before writing |
| `data/competitors.yaml` | Competitor matrix | Before comparisons |
| `data/seo-keywords.csv` | Keywords + SERP data | Before choosing topics |
| `data/content-map.yaml` | Blog <-> feature <-> keyword map | Before writing |
| `data/content-queue.yaml` | Prioritized ideas | When deciding what to write |
| `data/topic-clusters.yaml` | Pillar/cluster architecture | Before writing |
| `templates/blog-frontmatter.yaml` | Frontmatter format | When generating |
| `templates/blog-structures.yaml` | Outlines by type | When structuring |
| `templates/tone-guide.md` | Style + E-E-A-T rules | Before writing |
| `templates/humanization-guide.md` | Anti-IA patterns + experiencia personal | Before writing and reviewing |
| `templates/comparison-template.md` | Comparativa template | When writing comparativas |
| `logs/changelog.md` | Audit trail | After every action |

### Core Rules

1. **Read before writing.** Always read: config, features, content-map, content-queue, topic-clusters, tone-guide, humanization-guide.
2. **Never fabricate features.** Only reference what's in features.yaml.
3. **Competitor claims need confidence.** If "unverified" or 90+ days old, caveat or direct reader to competitor's page.
4. **No web search for SERP data.** NEVER use built-in web search to research keywords or SERP results. It produces generic data that leads to generic content. ALWAYS ask the user to provide real Google SERP data (top results, PAA, related searches). The ONLY exception is if a dedicated SEO MCP tool (Semrush, Ahrefs) is connected.
5. **Cannibalization check before every blog.** Search content-map for overlapping keywords. If conflict, recommend updating existing blog. Only proceed if angle is genuinely different.
6. **Every blog needs a unique angle.** Define what's different from what ranks. "More comprehensive" is NOT an angle.
7. **E-E-A-T mandatory.** Every blog must include at least one: testimonial, metric, experience, or review link from config.trust_signals. If config has no trust signals yet, ask user to provide one before publishing.
8. **Human review required.** Save all blogs as `status: "human-review"`. Never auto-publish. Alert user to review.
9. **Respect pillar/cluster linking.** Cluster pages link to pillar. Pillar links to all cluster pages. Non-negotiable.
10. **Update all files after writing:**
    - content-map.yaml (register blog)
    - features.yaml (blog_refs)
    - seo-keywords.csv (mapped_blog_slugs)
    - content-queue.yaml (status)
    - topic-clusters.yaml (if cluster blog)
    - changelog.md (log action)
11. **Never delete data.** Add or update only.
12. **Log everything** to changelog.md.

### SERP Intent Interpretation Rules

When analyzing SERP data (whether from user-provided Google results or SEO MCP tool), classify the intent BEFORE deciding content structure:

**All product/tool/template pages in top results:**
Intent is TRANSACTIONAL. Google wants tools, not guides. Content MUST serve the transactional intent first (provide tool/template/CTA immediately), then add educational depth below. Do NOT write a pure informational guide.

**Mix of guides + product pages:**
Intent is BLENDED. Google rewards both formats. A comprehensive guide with embedded tool/template CTAs works well here.

**All informational guides/blogs in top results:**
Intent is INFORMATIONAL. Google wants educational content. Write a thorough guide. Product mentions should be natural, not forced.

**All comparison/listicle pages:**
Intent is COMMERCIAL INVESTIGATION. User is evaluating options. Write a comparison or listicle. Don't write a how-to.

**Rule: NEVER fight the SERP.** If Google shows product pages, don't write a pure guide. If Google shows guides, don't write a product page. Match the dominant intent, then add your unique value on top.

### Blog Writing Workflow

**STEP 1: Pre-Writing Research** (sub-agents for parallel tasks)

a) Read all data files
b) Pick topic: from queue (highest priority "planned") or user request
c) **Cannibalization check** — scan content-map for overlapping keywords. If conflict: recommend update. If proceeding: document why in queue.
d) **SERP Analysis — CRITICAL RULE:**
   - **DO NOT use built-in web search tool for SERP research.**
   - IF a dedicated SEO MCP tool is connected (Semrush, Ahrefs MCP) use that tool
   - In ALL other cases ask the user:
     ```
     Antes de escribir, necesito datos SERP reales para: "{keyword}"
     Por favor busca esto en Google y proporciona:
     1. Top 3-5 paginas posicionadas (titulo + URL)
     2. Preguntas de "Otras preguntas de los usuarios" (4-6)
     3. Busquedas relacionadas del pie de Google
     4. Keywords relacionadas de tus herramientas SEO (opcional)
     ```
   - WAIT for response before proceeding.
e) **Define unique angle** from SERP data gaps. 1 sentence. If no genuine gap found, tell user.

**STEP 2: Draft** (sub-agents for long blog sections)

a) Select structure from blog-structures.yaml
   **If writing a PILLAR page**, it MUST include ALL mandatory sections (definition, why it matters, types/categories, how-to, best practices, mistakes, tools/templates, FAQ)
b) Read tone-guide.md and humanization-guide.md — use correct voice and apply anti-IA patterns
c) **Humanization check pre-writing:** Review intros of 3 most recent articles in same category to avoid repeating patterns
d) Build frontmatter: titulo <= 60 chars, descripcion <= 155 chars, slug <= 7 words
e) Write blog:
   - Primary keyword in: title, first paragraph, one H2, description, slug
   - Secondary keywords natural
   - FAQ from People Also Ask data (variable count 3-7, NOT always 5)
   - Internal links: prioritize pillar (if cluster page), then relevant blogs. Varied anchor text.
   - External links: 1-2 authoritative (not competitors)
   - **Humanization:** Intro variada, min 2 inserciones de experiencia personal, pros/contras asimetricos, al menos 1 variacion estructural
f) **Inject E-E-A-T:** author name (nombre real, no marca), testimonial/metric/experience from config, review link
g) **Ask user:**
   ```
   Antes de finalizar, quieres anadir algo?
   - Una experiencia personal o historia relacionada con este tema?
   - Feedback especifico de usuarios o citas?
   - Fuentes externas a referenciar?
   (Di "skip" si esta bien asi)
   ```

**STEP 3: Post-Writing** (sub-agents — all parallel)

a) Save blog with status: "human-review"
b) Update content-map, features, keywords, queue, clusters, changelog
c) **Alert:**
   ```
   Blog redactado: "{title}"
   Archivo: {path} | Palabras: {count} | Links: {count}
   Cluster: {name or "standalone"}

   REVISION NECESARIA — di "Aprueba blog {slug}" o da feedback.
   ```

### Audit Workflow

1. Feature coverage gaps (empty blog_refs)
2. Keyword gaps (high priority, no blog)
3. Cluster completion (% per cluster)
4. Keyword cannibalization
5. Stale content (90+ days)
6. Competitor data freshness (90+ days)
7. Internal linking gaps
8. E-E-A-T gaps (has_eeat_signals: false)
9. Humanization gaps (intros formulaicas, sin experiencia personal, listas simetricas, estructura identica)
10. Report + update queue + log

### Evaluate / Review Blog Workflow

When asked to evaluate, review, analyze, or give feedback on a blog (existing or draft):

1. Read the blog file
2. Read config.yaml, features.yaml, competitors.yaml, content-map.yaml, topic-clusters.yaml, tone-guide.md, humanization-guide.md
3. Evaluate against ALL of these criteria:
   - **SEO check:** Primary keyword in title, first paragraph, one H2, description, slug? Title <= 60 chars? Description <= 155 chars?
   - **Keyword cannibalization:** Does another blog target the same keyword?
   - **Feature accuracy:** Are all mentioned features actually in features.yaml?
   - **Competitor accuracy:** Are competitor claims backed by data in competitors.yaml?
   - **E-E-A-T signals:** Does the blog include testimonials, metrics, experience, or review links?
   - **Cluster alignment:** Is this blog part of a cluster? Does it link to its pillar?
   - **Internal linking:** Links to at least 2 other blogs? Anchor text varied and contextual?
   - **Unique angle:** What is this blog's angle? Is it genuinely different from what ranks?
   - **Tone/voice:** Does it match the blog type's voice from blog-structures.yaml?
   - **Content quality:** Is it specific and concrete or vague and generic?
   - **Word count:** Meets minimum from config?
   - **Pillar completeness (if pillar):** Does it have ALL mandatory sections?
   - **SERP intent match:** Does the content format match what Google rewards for this keyword?
   - **FAQ quality:** Are FAQ questions drawn from real People Also Ask data or generic?
   - **Humanizacion — intro:** Es la intro formulaica o repite el patron de otros articulos?
   - **Humanizacion — experiencia:** Tiene al menos 2 inserciones de experiencia personal?
   - **Humanizacion — asimetria:** Las listas de pros/contras tienen numero variable?
   - **Humanizacion — estructura:** Sigue exactamente el esquema estandar o tiene variacion?
   - **Humanizacion — autoria:** Firma con nombre real?
4. Output a structured report with: score (out of 10), strengths, issues found, specific fix recommendations
5. If blog is in content-map with status "human-review": provide clear approve/reject recommendation

### Create Topic Cluster Workflow

1. Read features.yaml and existing topic-clusters.yaml
2. Design cluster pages from features + topic knowledge
3. **Before finalizing the pillar page:** ask user for SERP data on the pillar keyword
4. WAIT for response
5. Apply SERP Intent Interpretation Rules to decide pillar format
6. Ensure pillar includes ALL mandatory sections
7. Save cluster to topic-clusters.yaml
8. Add all pages to content-queue.yaml (with cannibalization check)
9. Add keywords to seo-keywords.csv
10. Log to changelog.md

### New Feature Workflow

1. Add to features.yaml
2. Add to competitors.yaml (unverified)
3. Generate keywords to seo-keywords.csv
4. Assign to cluster or create new in topic-clusters.yaml
5. Check existing blogs, mark needs-update
6. Queue blog ideas (with cannibalization check)
7. Log

### SEO Data Import Workflow

1. Merge into seo-keywords.csv (no dupes)
2. Map to features
3. Update SERP fields if available
4. Assign to clusters
5. Recalculate queue priorities
6. Generate new queue items (with cannibalization check)
7. Log

### Changelog Format

```
## {YYYY-MM-DD HH:MM}
**Action:** {what}
**Files:** {list}
**Summary:** {1-2 sentences}
**Triggered by:** {user / audit / detection / import}
```
