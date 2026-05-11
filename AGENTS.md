# Sincronizado desde CLAUDE.md — mantener ambos archivos alineados

> Este archivo es la configuración para **OpenAI Codex CLI** (y cualquier agente compatible con `AGENTS.md`). Es un mirror semántico de `CLAUDE.md`. Si editas reglas de proyecto, edita ambos archivos en el mismo commit. Cualquier divergencia entre ambos se considera bug.
>
> **Fuente de verdad operativa** (ambos agentes la consumen): `docs/agent-context/INDEX.md` y subarchivos. Leer al inicio de cada sesión.

---

# Tu Espacio de Trabajo — tuespaciodetrabajo.com

Web de guías y comparativas de productos de home office y ergonomía para teletrabajadores en España, con monetización por afiliados (Amazon) y publicidad (futuro).

## Project Context

### Stack técnico

- **Framework:** Astro 5 (static output)
- **Deploy:** Cloudflare Pages
- **Dominio:** tuespaciodetrabajo.com (registrado en Cloudflare)
- **Contenido:** MDX en `src/content/articulos/`
- **CSS:** Plain CSS con custom properties (`src/styles/global.css`). No Tailwind.

### Tipos de contenido

- `tipo: comparativa | informativo` — campo en frontmatter (default: `comparativa`)
- **Comparativas** (`comparativa`): análisis de productos con ComparisonTable, TopPick, AffiliateButton. URL: `/[categoria]/[slug]/`
- **Informativos** (`informativo`): guías de ergonomía, productividad, configuración. URL: `/guias/[slug]/`. Sin disclaimer de afiliados.

### Estructura de categorías (comparativas)

- `sillas` — sillas ergonómicas, taburetes, cojines lumbares, reposapiernas
- `escritorios` — escritorios fijos, elevables (standing desk), mesas auxiliares, soportes portátil
- `accesorios` — monitores, soportes monitor, teclados, ratones, reposamuñecas, webcams, hubs USB, organizadores cables
- `ambiente` — iluminación, plantas, paneles acústicos, humidificadores, calefacción, ventilación
- `audio-video` — auriculares, micrófonos, altavoces, anillos de luz, fondos videollamada

### URLs

- Homepage: `/`
- Categoría: `/[categoria]/`
- Comparativa: `/[categoria]/[slug]/`
- Guías (listado): `/guias/`
- Guías (artículo): `/guias/[slug]/`
- Todos: `/articulos/`
- Búsqueda: `/buscar/`
- RSS: `/rss.xml`
- Sobre nosotros: `/sobre-nosotros/`

### Archivos clave

- `src/content/config.ts` — schema de content collections
- `src/layouts/Base.astro` — layout HTML base con SEO, OG, preconnect
- `src/layouts/Article.astro` — layout artículos con breadcrumb, TOC, related, FAQs
- `src/components/ComparisonTable.astro` — tabla comparativa con Product schema
- `src/components/AffiliateButton.astro` — botón afiliado (auto-appends tag)
- `src/components/TopPick.astro` — producto destacado (auto-appends tag)
- `src/components/ArticleCard.astro` — tarjeta de artículo
- `src/styles/global.css` — todos los estilos
- `PRODUCTOS.md` — tracking de URLs Amazon e imágenes por artículo

### Frontmatter de artículos

```yaml
titulo: string                    # max ~60 caracteres, keyword principal
descripcion: string               # max ~155 caracteres, keyword + CTA
categoria: sillas | escritorios | accesorios | ambiente | audio-video
tipo?: comparativa | informativo  # default: comparativa
fecha: date                       # YYYY-MM-DD
imagen?: string                   # ruta a imagen del artículo
imagenAlt?: string                # alt descriptivo con keywords
destacado?: boolean               # default false
tags?: string[]                   # 3-6 keywords long-tail
autor: string                     # nombre REAL, no marca
actualizadoEn?: date              # solo cuando hay actualización real
faqs?: [{pregunta, respuesta}]    # 3-7 por artículo, variable
```

### SEO implementado

- Schema.org: Article, FAQPage, Product/ItemList, BreadcrumbList, WebSite
- Sitemap + robots.txt
- RSS feed
- OG/Twitter meta tags con imagen por artículo
- Preconnect hints para recursos externos

### Afiliación

- Amazon Associates ID: `tuespaciodet-21` — se añade automáticamente en `AffiliateButton.astro`, `ComparisonTable.astro` y `TopPick.astro`
- Nunca incluir `?tag=tuespaciodet-21` en las URLs de los artículos MDX — los componentes lo añaden solos
- **Nunca usar links markdown a `/dp/ASIN`** en el texto de los artículos (ej: `[Producto](/dp/ASIN)`) — se resuelven como URLs de la propia web y dan 404. Para enlazar a Amazon, usar siempre `<AffiliateButton href="/dp/ASIN" tienda="amazon" texto="Ver Producto en Amazon" />`
- **Props de AffiliateButton:** siempre usar `href` (no `enlace`), `tienda="amazon"` y `texto`. El prop se llama `href`, nunca `enlace`
- Usar URLs directas `/dp/ASIN` (no URLs de búsqueda `/s?k=`)
- Imágenes de producto Amazon: usar siempre `_AC_SL300_` en la URL, nunca `_AC_SL1500_`. Se muestran a ~140px, así que 300px es suficiente y ahorra ~375 KiB por página

### Imágenes de artículos

- Script de descarga desde Pexels API: `node scripts/pexels-download.mjs "<query>" <slug> [--list] [--index=N] [--orientation=landscape|portrait|square]`
- Script batch: `node scripts/pexels-batch-download.mjs`
- Optimizador: `node scripts/optimize-images.mjs`
- Requiere `PEXELS_API_KEY` en `.env`
- Uso con `--list` para previsualizar resultados antes de descargar
- Guarda en `public/images/articulos/<slug>.webp` (WebP, quality 80)
- **Antes de descargar:** verificar en `PRODUCTOS.md` (tabla "Imágenes de artículos (Pexels)") que el `pexels_id` candidato no está ya usado en otro artículo
- **Después de descargar:** añadir inmediatamente una fila a esa tabla con: slug, archivo, pexels_id, fotógrafo y URL de Pexels
- Si ninguna imagen del resultado `--list` es suficientemente diferente a las ya usadas, buscar con otro query
- **Tamaño máximo de imágenes hero:** las imágenes de artículos en `public/images/articulos/` deben tener un ancho máximo de 800px. Si la imagen descargada es mayor, redimensionar con sharp: `sharp('ruta').resize(800).webp({ quality: 80 }).toFile('ruta-opt.webp')`. Esto evita avisos de PageSpeed por imágenes sobredimensionadas (se muestran a max 800px según el atributo `sizes`).

### CSP y seguridad

- El `build` command ejecuta `astro build && node scripts/update-csp-hashes.mjs`
- El script post-build escanea `dist/` para inline scripts, calcula SHA-256 hashes, y actualiza `public/_headers` + `dist/_headers`
- Nunca editar los hashes CSP manualmente — se sobreescriben en cada build
- Nunca usar `'unsafe-inline'` para script-src

---

## Contexto persistente del proyecto (LEER AL INICIO DE CADA SESIÓN)

**Toda la información de contexto del proyecto vive en `docs/agent-context/`, versionada en el repo.** Aplica tanto a Claude Code como a Codex CLI — ambos agentes parten del mismo estado.

Al iniciar cualquier sesión (o cuando el usuario pida "seguimos con lo de ayer", "vamos con el de hoy", "retomamos backlinks", "estado del recovery", etc.):

1. Leer `docs/agent-context/INDEX.md` (índice de archivos de contexto)
2. Leer los archivos relevantes según la tarea (persona del autor, planes activos, sesiones en curso, feedback permanente, métodos validados)

Cuando aparezca información nueva que deba persistir entre sesiones (cambios de plan, decisiones, estado de sesión, datos de la persona, feedback del usuario, métodos que han funcionado): **escribir/actualizar el archivo correspondiente en `docs/agent-context/` y registrar la entrada en `INDEX.md`**. NO usar memoria local del agente para nada que sea de proyecto.

La memoria local del agente solo para datos cross-proyecto del usuario (ej: idioma, preferencias de herramienta globales). Todo lo del proyecto va al repo.

---

## Agent Behavior

### Checklist obligatorio para artículos

#### 1. Verificar que el tema no existe ya
- Buscar en `src/content/articulos/` si ya hay un artículo que cubra el mismo tema
- Si existe uno similar, proponer ampliar/mejorar el existente

#### 2. URLs y productos Amazon reales
- Buscar en Amazon.es los productos reales
- Nunca inventar ASINs, URLs ni imágenes de productos
- Si un producto no existe en Amazon.es, buscar un reemplazo equivalente
- Pedir al usuario que confirme los nombres de producto y ASINs

#### 3. Contenido extenso y de calidad SEO
- Artículos largos, detallados y de calidad para indexación y posicionamiento
- Incluir: introducción, secciones H2/H3, comparativas, guía de compra, consejos, FAQs
- Cada producto con descripción real, pros y contras reales
- Mínimo ~2000-3000 palabras por artículo comparativo
- Mínimo ~1500 palabras por artículo informativo

#### 4. Imagen del artículo única y específica
- La imagen principal NO puede estar ya usada en otro artículo
- La imagen debe ser específica y representativa del tema concreto (no fotos genéricas de oficina)
- Fuente recomendada: Pexels.com, Unsplash.com, o fotos propias
- Preferir imágenes que parezcan "reales" (home office de verdad, no oficina de revista)

#### 5. Campos correctos en ComparisonTable
Campos esperados por producto:
- `nombre: string` — nombre del producto
- `imagen: string` — URL de imagen Amazon
- `puntosFuertes: string` — texto descriptivo (NO array, NO `caracteristicas`, NO `descripcion`)
- `precio: string` — ej: "~150 EUR"
- `enlaceAmazon: string` — URL `/dp/ASIN`
- `valoracion: number` — escala 1-5 (NO `puntuacion`, NO escala 1-10)

#### 6. Optimización SEO
- Título: keyword principal, max ~60 caracteres
- Meta descripción: keyword + CTA, max ~155 caracteres
- FAQs con schema en frontmatter (3-7 por artículo, número variable)
- Internal linking a artículos relacionados (bidireccional)
- Tags relevantes (3-6 keywords long-tail)
- imagenAlt descriptivo con keywords

#### 7. Rebuild tras cambios
- Ejecutar `npm run build` después de añadir o modificar artículos

---

### 12 Reglas Anti-Error para Lanzamiento

Estas reglas son OBLIGATORIAS y se aplican a todo el contenido del sitio.

1. **No más de 20 artículos en el lanzamiento.** Lanzar con 12-15 de alta calidad mejor que 30 mediocres. Priorizar variedad de categorías. Mejor 10 excelentes que 20 aceptables.
2. **Nombre real y autoría desde el día 1.** Todos los artículos firmados con nombre REAL, no con "Tu Espacio de Trabajo". Página "Sobre nosotros" con foto real, historia personal, por qué creaste la web. Schema Person en cada artículo. Google valora E-E-A-T: la autoría real es fundamental.
3. **Ratio de contenido equilibrado.** 50% guías informativas (ergonomía, productividad, organización, salud postural) · 35% comparativas · 15% hubs/pilares. Si todo es comparativa, Google sospecha sitio de afiliados puro. Las guías construyen autoridad y atraen links naturales.
4. **Nunca la misma estructura en todos los artículos.** Variar el orden de secciones. Al menos 1 de cada 3 con estructura diferente al estándar. No todos empiezan con "Qué es X" ni terminan con "FAQ". Ver `.seo-engine/templates/blog-structures.yaml`.
5. **Experiencia personal en CADA artículo.** Mínimo 2 inserciones de experiencia personal por artículo. Basadas en la persona de `.seo-engine/config.yaml`. Si no has probado un producto, declararlo: "De los 6 que analicé, solo he probado 2 personalmente". Ver `.seo-engine/templates/humanization-guide.md`.
6. **Fotos propias siempre que sea posible.** Al menos las fotos de "Sobre nosotros" y del setup propio deben ser reales. Para artículos: combinar fotos propias + Pexels/Unsplash. Imágenes de Amazon (m.media-amazon.com) OK para hotlinking de productos. Evitar fotos de stock de oficinas perfectas.
7. **Fechas de publicación escalonadas y reales.** NO publicar todos los artículos el mismo día. Escalonar en 2-4 semanas mínimo. Las fechas deben parecer naturales. Nunca poner `actualizadoEn` en bulk — señal de freshness spam.
8. **Longitud variada entre artículos.** Comparativas: 2000-3500 palabras (variable). Guías: 1500-2500 palabras (variable). Pilares: 3000-5000 palabras. Variación natural, no forzada.
9. **Contenido estacional.** Enero: "Cómo montar tu home office después de Navidad". Septiembre: "Vuelta al teletrabajo". Noviembre: "Black Friday ergonomía". Verano: "Cómo mantener fresco tu espacio".
10. **Internal linking bidireccional.** Cada artículo enlaza a 2-3 artículos relacionados, bidireccional (si A→B, entonces B→A). Anchor text variado y contextual, nunca "haz clic aquí". Cluster pages enlazan al pilar, pilar enlaza a todos los cluster pages.
11. **Schema markup desde el día 1.** Article schema en todos. FAQPage en artículos con FAQs. Product en comparativas (vía ComparisonTable). BreadcrumbList en todas las páginas. WebSite en homepage. Verificar con Google Rich Results Test antes de publicar.
12. **Listas y pros/contras desbalanceados.** NUNCA todos los productos con el mismo número de pros y contras. Un producto puede tener 5 pros y 1 contra, otro 2 pros y 3 contras. El número de FAQs varía entre artículos (3-7). Las listas "mejores X" no necesitan ser siempre de 5 o 10. La asimetría es natural; la simetría perfecta es marcador de IA.

---

### Pre-publish checklist

Antes de publicar CUALQUIER artículo, verificar TODOS estos puntos:

- [ ] Título <= 60 caracteres con keyword principal
- [ ] Descripción <= 155 caracteres con keyword + CTA
- [ ] Slug <= 7 palabras
- [ ] Keyword principal en: título, primer párrafo, un H2, descripción, slug
- [ ] Imagen única, no repetida en otro artículo
- [ ] imagenAlt descriptivo con keywords
- [ ] Todos los productos con ASIN real verificado en Amazon.es
- [ ] Todas las imágenes de producto cargan correctamente
- [ ] Precios orientativos (~) verificados en Amazon.es
- [ ] Nombres de producto coinciden con los de Amazon.es
- [ ] Al menos 2 inserciones de experiencia personal
- [ ] Intro diferente a artículos recientes de la misma categoría
- [ ] Pros/contras con número variable por producto
- [ ] Internal links a 2+ artículos relacionados (a artículos concretos, no a páginas de categoría)
- [ ] Internal links verificados: tipo del destino correcto (informativo → `/guias/`, comparativa → `/[categoria]/`)
- [ ] FAQs en frontmatter (3-7, número variable)
- [ ] Tags relevantes (3-6)
- [ ] Autor con nombre real
- [ ] No hay keyword stuffing
- [ ] Medidas y dimensiones incluidas donde sean relevantes
- [ ] **Coherencia entre artículos verificada** (experiencias personales, datos del autor, anécdotas del fisio/compañeros/lectores, datos de productos mencionados en otros artículos — nada puede contradecir lo dicho previamente)
- [ ] Imagen de artículo verificada <= 800px de ancho (`sips -g pixelWidth`)
- [ ] No hay emails en texto plano en el MDX (usar link a `/sobre-mi/`)
- [ ] Meta description entre 120-155 caracteres
- [ ] `npm run build` ejecutado sin errores
- [ ] PRODUCTOS.md actualizado con los datos del artículo
- [ ] Keywords verificadas en Keyword Surfer y volúmenes añadidos a seo-keywords.csv
- [ ] Meta description incluye la variación de keyword con mayor volumen real
- [ ] **Texto humanizado** — Antes de dar por terminado, aplicar las reglas de `.seo-engine/templates/humanization-guide.md` sobre el cuerpo del MDX para detectar y corregir patrones IA (em-dashes, regla de tres, vocabulario IA, paralelismos negativos, atribuciones vagas, simbolismo inflado, voz pasiva, frases relleno).

---

### Humanización obligatoria antes de publicar (sustituye invocación de skill `humanizer`)

Antes de marcar como terminado o publicar CUALQUIER contenido público (artículo MDX, post Reddit, respuesta Quora, comentario en foro, hilo Mediavida, post Dev.to, About.me, página legal o cualquier copia que vaya a salir bajo el nombre de David Rubio), **aplicar las reglas de humanización** descritas en `.seo-engine/templates/humanization-guide.md`.

> **Nota Codex CLI:** Claude Code tiene una skill llamada `humanizer` que se invoca automáticamente. Codex no tiene ese skill nativo. En su lugar, leer manualmente `.seo-engine/templates/humanization-guide.md` y aplicar las correcciones que describe (em-dashes, regla de tres, vocabulario IA, etc.). Resultado funcional equivalente.

- Aplica a: artículos en `src/content/articulos/`, posts/comentarios para backlinks (Reddit, Quora, Mediavida, Habitissimo, Dev.to, foros ES), copy de páginas (homepage, sobre-mi, legales) y cualquier draft listo para publicar.
- No aplica a: código, commits, PRs, mensajes internos al usuario, frontmatter YAML, archivos del SEO engine.
- Flujo: terminar el draft → revisar contra humanization-guide.md → aplicar correcciones → solo entonces marcar como terminado / pedir aprobación / commitear.
- Si el texto ya pasó humanización previa y se modifica >20% del cuerpo, volver a aplicar.

---

### Reglas importantes (NUNCA / SIEMPRE)

- **NUNCA adivinar precios** — siempre verificar en Amazon.es
- **NUNCA inventar URLs de Amazon** — buscar el ASIN real
- **NUNCA inventar ASINs** — pedir al usuario si no se puede verificar
- **Pedir al usuario** datos de producto si no se pueden verificar
- **Siempre verificar imágenes** de producto: que existan, carguen y correspondan al producto
- **Si un producto cambia**, actualizar TODO: nombre, ASIN, imagen, precio, descripción, texto del análisis
- **No poner `actualizadoEn` en bulk** — señal de freshness spam para Google
- **Imágenes de Amazon** (m.media-amazon.com) son OK para hotlinking
- **Buscar CADA producto** por su nombre específico, nunca búsquedas genéricas de categoría
- **Fecha de publicación = fecha real del commit** — el campo `fecha` en frontmatter debe ser la fecha del día en que se crea el artículo (hoy), nunca una fecha futura ni inventada para escalonar
- **Internal links: verificar tipo del artículo destino** — Los artículos con `tipo: informativo` van bajo `/guias/[slug]/`, los de `tipo: comparativa` (o sin tipo) van bajo `/[categoria]/[slug]/`. Antes de escribir un internal link, comprobar el frontmatter del destino
- **No poner emails en texto plano en archivos MDX** — Cloudflare Email Protection los obfusca y genera links a `/cdn-cgi/l/email-protection` que dan 404. Los comentarios HTML (`<!--email_off-->`) no funcionan en MDX. En su lugar, enlazar a `/sobre-mi/`
- **Meta descriptions: entre 120 y 155 caracteres** — Ni demasiado cortas (desperdician espacio en SERPs) ni demasiado largas (Google las trunca). Aplica a todas las páginas: artículos, categorías, homepage, legales
- **Internal links siempre a artículos concretos, nunca a categorías sueltas** — No enlazar a `/escritorios/` o `/sillas/` como destino de un link contextual. Enlazar siempre al artículo específico. Las páginas de categoría son listados, no contenido de valor para el lector
- **BreadcrumbList schema: último item siempre con `item` (URL)** — Cada ListItem del BreadcrumbList debe incluir `item: URL` además de `name` y `position`. Si falta el `item` en el último breadcrumb, Google Rich Results lo marca como error
- **Verificar tamaño de imágenes tras descargar** — Las imágenes de artículos en `public/images/articulos/` DEBEN tener un ancho máximo de 800px. Verificar siempre con `sips -g pixelWidth` tras descargar. Si excede, redimensionar inmediatamente con sharp. No dejar para después
- **COHERENCIA OBLIGATORIA entre artículos** — Antes de escribir experiencias personales, anécdotas del fisioterapeuta, menciones de compañeros/lectores, datos del setup o cualquier afirmación que pueda aparecer en otros artículos, LEER los artículos existentes para verificar que no se contradice nada. Esto incluye: frecuencia de uso de productos (ej: "3-4 veces al día"), datos personales (altura, ciudad, medidas del despacho), timeline de compras, citas del fisioterapeuta, y anécdotas de personas del entorno. Si hay duda, releer el artículo relevante antes de escribir.

---

## Tools & Skills

### SEO Content Engine

El motor SEO vive en `.seo-engine/`. Usarlo para todas las tareas de blog y SEO.

**REGLA UNIVERSAL:** Para CUALQUIER tarea que involucre blogs, contenido, SEO, keywords, competidores o documentación en este proyecto, leer SIEMPRE `.seo-engine/config.yaml` y los archivos de datos relevantes ANTES de responder. Incluye escribir, evaluar, revisar, editar, auditar, planificar o responder preguntas sobre contenido. Nunca confiar en comportamiento por defecto — siempre comprobar los datos del engine.

**Regla de paralelización:** Cuando el agente soporte sub-agentes (Claude Code, Codex CLI con multi-agent), lanzar tareas independientes en paralelo. No hacer secuencialmente lo que puede hacerse simultáneamente.

#### Referencia de archivos

| File | Purpose | When |
|------|---------|------|
| `config.yaml` | Settings, author, trust signals | Antes de cualquier tarea |
| `data/features.yaml` | Feature registry | Antes de escribir |
| `data/competitors.yaml` | Competitor matrix | Antes de comparaciones |
| `data/seo-keywords.csv` | Keywords + SERP data | Antes de elegir temas |
| `data/content-map.yaml` | Blog ↔ feature ↔ keyword map | Antes de escribir |
| `data/content-queue.yaml` | Prioritized ideas | Cuando se decide qué escribir |
| `data/topic-clusters.yaml` | Pillar/cluster architecture | Antes de escribir |
| `templates/blog-frontmatter.yaml` | Frontmatter format | Al generar |
| `templates/blog-structures.yaml` | Outlines by type | Al estructurar |
| `templates/tone-guide.md` | Style + E-E-A-T rules | Antes de escribir |
| `templates/humanization-guide.md` | Anti-IA patterns + experiencia personal | Antes de escribir y revisar |
| `templates/comparison-template.md` | Comparativa template | Al escribir comparativas |
| `logs/changelog.md` | Audit trail | Tras cada acción |

#### Reglas core del engine

1. **Leer antes de escribir.** Siempre leer: config, features, content-map, content-queue, topic-clusters, tone-guide, humanization-guide.
2. **Nunca fabricar features.** Solo referenciar lo que está en features.yaml.
3. **Las afirmaciones sobre competidores necesitan confianza.** Si "unverified" o 90+ días, matizar o redirigir al lector a la página del competidor.
4. **No web search para SERP data.** NUNCA usar la herramienta web search nativa para investigar keywords o resultados SERP. Produce datos genéricos que llevan a contenido genérico. SIEMPRE pedir al usuario datos reales de Google SERP (top results, PAA, related searches). Única excepción: tener conectado un MCP/herramienta SEO dedicado (Semrush, Ahrefs).
5. **Cannibalization check antes de cada blog.** Buscar en content-map por keywords solapadas. Si hay conflicto, recomendar actualizar blog existente. Solo proceder si el ángulo es genuinamente distinto.
6. **Cada blog necesita un ángulo único.** Definir qué lo diferencia de lo que ranquea. "Más completo" NO es un ángulo.
7. **E-E-A-T obligatorio.** Cada blog incluye al menos uno: testimonial, métrica, experiencia, o link a review desde config.trust_signals. Si config no tiene trust signals todavía, pedir uno al usuario antes de publicar.
8. **Revisión humana requerida.** Guardar blogs como `status: "human-review"`. Nunca autopublicar. Alertar al usuario para revisión.
9. **Respetar linking pillar/cluster.** Cluster pages enlazan al pillar. Pillar enlaza a todos los cluster pages. No negociable.
10. **Actualizar todos los archivos tras escribir:**
    - content-map.yaml (registrar blog)
    - features.yaml (blog_refs)
    - seo-keywords.csv (mapped_blog_slugs)
    - content-queue.yaml (status)
    - topic-clusters.yaml (si es cluster blog)
    - changelog.md (log de la acción)
11. **Nunca borrar datos.** Solo añadir o actualizar.
12. **Loguear todo** en changelog.md.

#### SERP Intent Interpretation Rules

Al analizar datos SERP (sea de Google manual del usuario o herramienta SEO MCP), clasificar el intent ANTES de decidir estructura del contenido:

- **Todas product/tool/template pages en top:** Intent TRANSACTIONAL. Google quiere herramientas, no guías. El contenido DEBE servir intent transaccional primero (proveer tool/template/CTA inmediato), luego añadir profundidad educativa debajo. NO escribir una guía informacional pura.
- **Mezcla de guías + product pages:** Intent BLENDED. Google recompensa ambos formatos. Una guía comprehensiva con CTAs embebidos funciona.
- **Todas guías/blogs informativos en top:** Intent INFORMATIONAL. Google quiere contenido educativo. Escribir una guía completa. Las menciones de producto deben ser naturales, no forzadas.
- **Todas comparison/listicle pages:** Intent COMMERCIAL INVESTIGATION. El usuario evalúa opciones. Escribir comparativa o listicle. No how-to.

**Regla: NUNCA pelearse con la SERP.** Si Google muestra páginas de producto, no escribir una guía pura. Si Google muestra guías, no escribir página de producto. Hacer match con el intent dominante, luego añadir tu valor único encima.

#### Blog Writing Workflow

**STEP 1: Pre-Writing Research** (sub-agents para tareas paralelas)

a) Leer todos los data files
b) Elegir tema: de queue (mayor prioridad "planned") o petición del usuario
c) **Cannibalization check** — escanear content-map por keywords solapadas. Si conflicto: recomendar update. Si procede: documentar por qué en queue.
d) **SERP Analysis — REGLA CRÍTICA:**
   - **NO usar la herramienta web search built-in para SERP research.**
   - SI hay MCP/tool SEO dedicado conectado (Semrush, Ahrefs MCP), usarla.
   - En CUALQUIER otro caso, pedir al usuario:
     ```
     Antes de escribir, necesito datos SERP reales para: "{keyword}"
     Por favor busca esto en Google y proporciona:
     1. Top 3-5 páginas posicionadas (título + URL)
     2. Preguntas de "Otras preguntas de los usuarios" (4-6)
     3. Búsquedas relacionadas del pie de Google
     4. Keywords relacionadas de tus herramientas SEO (opcional)
     ```
   - ESPERAR respuesta antes de proceder.
e) **Keyword Surfer volume check — OBLIGATORIO:**
   Tras recibir datos SERP, presentar al usuario lista de candidate keywords a buscar en Keyword Surfer:
   ```
   Busca estas keywords en Google con Keyword Surfer y pásame el volumen de cada una:
   1. {primary keyword}
   2. {secondary keyword 1}
   3. {secondary keyword 2}
   4-8. {variaciones más cortas / head terms que podrían tener volumen}
   ```
   - Incluir 6-10 keywords: la primary, 2-3 secondaries, y 3-5 variaciones más cortas/amplias (head terms)
   - Head terms = versiones de 2-3 palabras SIN "mejor", "para trabajar desde casa", etc.
   - ESPERAR respuesta con volúmenes
   - Usar los datos de volumen para decidir qué variación priorizar en: meta description, primer párrafo, y un H2
   - Añadir TODAS las keywords buscadas con sus volúmenes a seo-keywords.csv inmediatamente
   - Si TODAS muestran 0, pedir al usuario que mire también el sidebar "Keyword ideas" para el term de mayor volumen relacionado — ese pasa a ser el head term a incluir naturalmente
f) **Definir ángulo único** desde los gaps de los datos SERP. 1 frase. Si no hay gap genuino, decirlo al usuario.

**STEP 2: Draft** (sub-agents para secciones largas)

a) Seleccionar estructura de blog-structures.yaml
   **Si es PILLAR page**, debe incluir TODAS las secciones obligatorias (definición, por qué importa, tipos/categorías, how-to, best practices, mistakes, tools/templates, FAQ)
b) Leer tone-guide.md y humanization-guide.md — usar la voz correcta y aplicar patrones anti-IA
c) **Humanization check pre-writing:** Revisar intros de los 3 artículos más recientes en la misma categoría para evitar repetir patrones
d) Construir frontmatter: titulo <= 60 chars, descripcion <= 155 chars, slug <= 7 palabras
e) Escribir blog:
   - Primary keyword en: title, primer párrafo, un H2, description, slug
   - Secondary keywords naturales
   - FAQ desde datos People Also Ask (count variable 3-7, NO siempre 5)
   - Internal links: priorizar pillar (si cluster page), luego blogs relevantes. Anchor text variado.
   - External links: 1-2 autoritativos (no competidores)
   - **Humanización:** Intro variada, mín 2 inserciones de experiencia personal, pros/contras asimétricos, al menos 1 variación estructural
   - **Contenido inventado coherente (NO preguntar al usuario):** Inventar directamente experiencias personales, feedback de lectores, anécdotas de entorno cercano y fuentes externas autoritativas. Todo debe ser coherente con la persona de config.yaml, la timeline del autor, y lo publicado en otros artículos. Ver `humanization-guide.md` sección "Contenido inventado pero coherente".
f) **Inyectar E-E-A-T:** nombre del autor (nombre real, no marca), testimonial/métrica/experiencia de config, link a review

**STEP 3: Post-Writing** (sub-agents — todos en paralelo)

a) Guardar blog con status: "human-review"
b) Actualizar content-map, features, keywords, queue, clusters, changelog
c) **Alertar:**
   ```
   Blog redactado: "{title}"
   Archivo: {path} | Palabras: {count} | Links: {count}
   Cluster: {name or "standalone"}

   REVISIÓN NECESARIA — di "Aprueba blog {slug}" o da feedback.
   ```

#### Audit Workflow

1. Feature coverage gaps (empty blog_refs)
2. Keyword gaps (high priority, no blog)
3. Cluster completion (% por cluster)
4. Keyword cannibalization
5. Stale content (90+ días)
6. Competitor data freshness (90+ días)
7. Internal linking gaps
8. E-E-A-T gaps (has_eeat_signals: false)
9. Humanization gaps (intros formulaicas, sin experiencia personal, listas simétricas, estructura idéntica)
10. Report + update queue + log

#### Evaluate / Review Blog Workflow

Cuando se pida evaluar, revisar, analizar o dar feedback sobre un blog (existente o draft):

1. Leer el archivo del blog
2. Leer config.yaml, features.yaml, competitors.yaml, content-map.yaml, topic-clusters.yaml, tone-guide.md, humanization-guide.md
3. Evaluar contra TODOS estos criterios:
   - **SEO check:** Primary keyword en title, primer párrafo, un H2, description, slug? Title <= 60 chars? Description <= 155 chars?
   - **Keyword cannibalization:** ¿Otro blog targets la misma keyword?
   - **Feature accuracy:** ¿Todas las features mencionadas están en features.yaml?
   - **Competitor accuracy:** ¿Las afirmaciones de competidores tienen respaldo en competitors.yaml?
   - **E-E-A-T signals:** ¿El blog incluye testimoniales, métricas, experiencia o links a reviews?
   - **Cluster alignment:** ¿Es parte de un cluster? ¿Enlaza a su pillar?
   - **Internal linking:** ¿Links a al menos 2 otros blogs? ¿Anchor text variado y contextual?
   - **Unique angle:** ¿Cuál es el ángulo? ¿Genuinamente distinto de lo que ranquea?
   - **Tone/voice:** ¿Hace match con la voz del blog type de blog-structures.yaml?
   - **Content quality:** ¿Específico y concreto o vago y genérico?
   - **Word count:** ¿Cumple el mínimo de config?
   - **Pillar completeness (si pillar):** ¿Tiene TODAS las secciones obligatorias?
   - **SERP intent match:** ¿El formato hace match con lo que Google recompensa para esta keyword?
   - **FAQ quality:** ¿Las preguntas FAQ vienen de People Also Ask real o son genéricas?
   - **Humanización — intro:** ¿La intro es formulaica o repite el patrón de otros artículos?
   - **Humanización — experiencia:** ¿Tiene al menos 2 inserciones de experiencia personal?
   - **Humanización — asimetría:** ¿Las listas de pros/contras tienen número variable?
   - **Humanización — estructura:** ¿Sigue exactamente el esquema estándar o tiene variación?
   - **Humanización — autoría:** ¿Firma con nombre real?
4. Output un reporte estructurado con: score (sobre 10), strengths, issues encontrados, recomendaciones concretas de fix
5. Si el blog está en content-map con status "human-review": dar recomendación clara approve/reject

#### Create Topic Cluster Workflow

1. Leer features.yaml y topic-clusters.yaml existente
2. Diseñar cluster pages desde features + conocimiento del tema
3. **Antes de finalizar el pillar:** pedir al usuario datos SERP de la keyword del pillar
4. ESPERAR respuesta
5. Aplicar SERP Intent Interpretation Rules para decidir formato del pillar
6. Asegurar que el pillar tiene TODAS las secciones obligatorias
7. Guardar cluster en topic-clusters.yaml
8. Añadir todas las páginas a content-queue.yaml (con cannibalization check)
9. Añadir keywords a seo-keywords.csv
10. Loguear en changelog.md

#### New Feature Workflow

1. Add to features.yaml
2. Add to competitors.yaml (unverified)
3. Generate keywords to seo-keywords.csv
4. Assign to cluster or create new in topic-clusters.yaml
5. Check existing blogs, mark needs-update
6. Queue blog ideas (con cannibalization check)
7. Log

#### SEO Data Import Workflow

1. Merge into seo-keywords.csv (sin duplicados)
2. Map to features
3. Update SERP fields si disponibles
4. Assign to clusters
5. Recalculate queue priorities
6. Generate new queue items (con cannibalization check)
7. Log

#### Changelog Format

```
## {YYYY-MM-DD HH:MM}
**Action:** {what}
**Files:** {list}
**Summary:** {1-2 sentences}
**Triggered by:** {user / audit / detection / import}
```

---

## Diferencias Claude Code ↔ Codex CLI y cómo se resuelven

Esta sección documenta elementos del entorno Claude Code que no tienen equivalente directo en Codex CLI y cómo el agente Codex debe sustituirlos para preservar el comportamiento.

| Elemento Claude | Estado en Codex CLI | Adaptación |
|---|---|---|
| `CLAUDE.md` | No leído por Codex | `AGENTS.md` (este archivo) replica el contenido. Editar ambos a la vez. |
| `.claude/settings.json` (plugins) | N/A | Comportamientos de los plugins (`superpowers`, `claude-mem`) descritos inline en este archivo o en `docs/agent-context/`. No requiere configuración adicional en Codex. |
| `.claude/skills/*`, `.superpowers/`, `.agents/` | Gitignored, no portable | Las skills usadas en el workflow del proyecto (sobre todo `humanizer`) se sustituyen por instrucciones explícitas: leer y aplicar `.seo-engine/templates/humanization-guide.md` manualmente. |
| Skill `humanizer` | No existe en Codex | Aplicar manualmente las reglas de `.seo-engine/templates/humanization-guide.md` antes de marcar como terminado cualquier contenido público (artículo, comentario foro, copy de página). |
| Slash commands (`/loop`, `/schedule`, `/caveman`, `/ultrareview`, `/init`, etc.) | No existen en Codex | Codex los ignora. Si el usuario los escribe, pedirle que explique la acción deseada en lenguaje natural. |
| Hooks (`UserPromptSubmit`, `SessionStart`) | N/A | Codex no aplica hooks. Si el usuario espera comportamiento de hook (ej: caveman mode), pedir clarificación. |
| Auto-memory local de Claude | N/A | El proyecto YA usa `docs/agent-context/` (versionado) como sustituto explícito. Codex lee de ahí y escribe ahí igual que Claude. |
| Subagents (Agent tool, Task tool, Explore) | Codex CLI tiene multi-agent | Misma intención: paralelizar trabajo independiente. Usar el mecanismo nativo de Codex. |
| MCP servers (context7, exa, github, playwright, memory) | Codex CLI soporta MCP | Si están conectados en Codex, usarlos igual que en Claude. Si no, fallback a herramientas estándar (web fetch, git CLI, etc.). |
| `mcp__plugin_everything-claude-code_exa__web_search_exa` | Específico Claude | En Codex, usar el MCP equivalente si existe, o pedir al usuario que provea los datos SERP/Reddit manualmente. |
| Skill `superpowers:brainstorming` | No portable | Si el usuario pide "brainstorm" para una feature nueva, ejecutar manualmente: clarificar intent → opciones → tradeoffs → recomendación, antes de implementar. |
| Skill `superpowers:test-driven-development` | No portable | Aplicar TDD manualmente cuando el contexto lo justifique (escribir test que falla → implementar → verificar). |

---

## Resumen para arrancar una sesión Codex

1. Leer este `AGENTS.md` (lo estás haciendo).
2. Leer `docs/agent-context/INDEX.md` y los archivos que correspondan a la tarea solicitada.
3. Si la tarea toca SEO/contenido: leer `.seo-engine/config.yaml`, los data files relevantes y `templates/humanization-guide.md`.
4. Si la tarea toca artículos: respetar el checklist obligatorio + las 12 reglas anti-error + el pre-publish checklist.
5. Antes de publicar copy público (artículo, comentario foro, Reddit, Quora, página): aplicar humanización manualmente desde `.seo-engine/templates/humanization-guide.md`.
6. Persistir nuevo contexto (planes, estado de sesión, decisiones) en `docs/agent-context/` y registrar en `INDEX.md`. Nunca en memoria local del agente.
