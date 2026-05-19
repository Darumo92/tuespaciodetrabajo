# SEO Content Engine — Workflows

> Cargar este archivo cuando la tarea implique: escribir artículos, auditar contenido, evaluar blogs, crear topic clusters, importar datos SEO o añadir features.

## SEO Engine Location

El motor SEO vive en `.seo-engine/`. Usarlo para todas las tareas de blog y SEO.

**REGLA UNIVERSAL:** Para CUALQUIER tarea que involucre blogs, contenido, SEO, keywords, competidores o documentación en este proyecto, leer SIEMPRE `.seo-engine/config.yaml` y los archivos de datos relevantes ANTES de responder.

**Regla de paralelización:** Lanzar tareas independientes en paralelo. No hacer secuencialmente lo que puede hacerse simultáneamente.

### File Reference

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

### Core Rules

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

---

## SERP Intent Interpretation Rules

Al analizar datos SERP, clasificar el intent ANTES de decidir estructura del contenido:

- **Todas product/tool/template pages en top:** Intent TRANSACTIONAL. Google quiere herramientas, no guías. El contenido DEBE servir intent transaccional primero (proveer tool/template/CTA inmediato), luego añadir profundidad educativa debajo. NO escribir una guía informacional pura.
- **Mezcla de guías + product pages:** Intent BLENDED. Google recompensa ambos formatos. Una guía comprehensiva con CTAs embebidos funciona.
- **Todas guías/blogs informativos en top:** Intent INFORMATIONAL. Google quiere contenido educativo. Escribir una guía completa. Las menciones de producto deben ser naturales, no forzadas.
- **Todas comparison/listicle pages:** Intent COMMERCIAL INVESTIGATION. El usuario evalúa opciones. Escribir comparativa o listicle. No how-to.

**Regla: NUNCA pelearse con la SERP.** Si Google muestra páginas de producto, no escribir una guía pura. Si Google muestra guías, no escribir página de producto. Hacer match con el intent dominante, luego añadir tu valor único encima.

---

## Blog Writing Workflow

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

---

## Audit Workflow

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

---

## Evaluate / Review Blog Workflow

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

---

## Create Topic Cluster Workflow

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

---

## New Feature Workflow

1. Add to features.yaml
2. Add to competitors.yaml (unverified)
3. Generate keywords to seo-keywords.csv
4. Assign to cluster or create new in topic-clusters.yaml
5. Check existing blogs, mark needs-update
6. Queue blog ideas (con cannibalization check)
7. Log

---

## SEO Data Import Workflow

1. Merge into seo-keywords.csv (sin duplicados)
2. Map to features
3. Update SERP fields si disponibles
4. Assign to clusters
5. Recalculate queue priorities
6. Generate new queue items (con cannibalization check)
7. Log

---

## Changelog Format

```
## {YYYY-MM-DD HH:MM}
**Action:** {what}
**Files:** {list}
**Summary:** {1-2 sentences}
**Triggered by:** {user / audit / detection / import}
```
