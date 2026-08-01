# Checklists para artículos

> Cargar este archivo cuando la tarea implique: crear artículos, revisar artículos antes de publicar, o auditar calidad de contenido existente.

## Checklist obligatorio para artículos

### 1. Verificar que el tema no existe ya
- Buscar en `src/content/articulos/` si ya hay un artículo que cubra el mismo tema
- Si existe uno similar, proponer ampliar/mejorar el existente

### 2. URLs y productos Amazon reales
- Buscar primero productos reales con la Creators API (`node scripts/amazon-lookup.mjs --search "<keyword>"`)
- Nunca inventar ASINs, URLs ni imágenes de productos
- Si un producto no existe en Amazon.es, buscar un reemplazo equivalente
- Pedir al usuario ASINs solo si la API/cache no puede verificar productos reales o devuelve resultados insuficientes

### 3. Contenido extenso y de calidad SEO
- Artículos largos, detallados y de calidad para indexación y posicionamiento
- Incluir: introducción, secciones H2/H3, comparativas, guía de compra, consejos, FAQs
- Cada producto con descripción real, pros y contras reales
- Mínimo ~2000-3000 palabras por artículo comparativo
- Mínimo ~1500 palabras por artículo informativo

### 4. Imagen del artículo única y específica
- La imagen principal NO puede estar ya usada en otro artículo
- La imagen debe ser específica y representativa del tema concreto (no fotos genéricas de oficina)
- Fuente recomendada: Pexels.com, Unsplash.com, o fotos propias
- Preferir imágenes que parezcan "reales" (home office de verdad, no oficina de revista)

### 5. Campos correctos en ComparisonTable
Campos esperados por producto:
- `nombre: string` — nombre del producto
- `imagen: string` — URL de imagen Amazon
- `puntosFuertes: string` — texto descriptivo (NO array, NO `caracteristicas`, NO `descripcion`)
- `precio: string` — ej: "~150 EUR"
- `enlaceAmazon: string` — URL `/dp/ASIN`
- `valoracion: number` — escala 1-5 (NO `puntuacion`, NO escala 1-10)

### 6. Optimización SEO
- Título: keyword principal, max ~60 caracteres
- Meta descripción: keyword + CTA, max ~155 caracteres
- FAQs con schema en frontmatter (3-7 por artículo, número variable)
- Internal linking a artículos relacionados (bidireccional)
- Tags relevantes (3-6 keywords long-tail)
- imagenAlt descriptivo con keywords

### 7. Rebuild tras cambios
- Ejecutar `npm run build` después de añadir o modificar artículos

---

## 12 Reglas Anti-Error para Lanzamiento

1. **No más de 20 artículos en el lanzamiento.** Lanzar con 12-15 de alta calidad mejor que 30 mediocres. Priorizar variedad de categorías.
2. **Nombre real y autoría desde el día 1.** Todos los artículos firmados con nombre REAL. Página "Sobre nosotros" con foto real. Schema Person en cada artículo. Google valora E-E-A-T.
3. **Ratio de contenido equilibrado.** 50% guías informativas · 35% comparativas · 15% hubs/pilares. Si todo es comparativa, Google sospecha sitio de afiliados puro.
4. **Nunca la misma estructura en todos los artículos.** Variar el orden de secciones. Al menos 1 de cada 3 con estructura diferente al estándar.
5. **Señal E-E-A-T verificable en CADA artículo.** Usar experiencia personal solo si está documentada en `.seo-engine/config.yaml` y `project_author_persona.md`; si no hay uso directo, declararlo y explicar la metodología de análisis. Nunca inventar anécdotas, lectores, familiares, lesiones o citas.
6. **Fotos propias siempre que sea posible.** Al menos "Sobre nosotros" y setup propio reales. Para artículos: combinar propias + Pexels/Unsplash. Imágenes Amazon OK para hotlinking.
7. **Fechas de publicación escalonadas y reales.** NO publicar todos el mismo día. Escalonar en 2-4 semanas. Nunca `actualizadoEn` en bulk.
8. **Longitud variada entre artículos.** Comparativas: 2000-3500. Guías: 1500-2500. Pilares: 3000-5000. Variación natural.
9. **Contenido estacional.** Enero: home office post-Navidad. Septiembre: vuelta teletrabajo. Noviembre: Black Friday. Verano: mantener fresco.
10. **Internal linking bidireccional.** Cada artículo enlaza a 2-3 relacionados. Si A→B, entonces B→A. Anchor text variado. Cluster→pilar, pilar→cluster.
11. **Schema markup desde el día 1.** Article, FAQPage, Product/ItemList, BreadcrumbList, WebSite.
12. **Listas y pros/contras desbalanceados.** NUNCA todos los productos con mismo número de pros/contras. FAQs entre 3-7 (variable). La asimetría es natural.

---

## Pre-publish checklist

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
- [ ] Hay una señal E-E-A-T verificable; la experiencia personal está documentada o, si no hubo uso directo, se declaran las limitaciones y la metodología sin inventar personas, pruebas, compras, lesiones, métricas ni citas
- [ ] Intro diferente a artículos recientes de la misma categoría
- [ ] Pros/contras con número variable por producto
- [ ] Internal links a 2+ artículos relacionados (a artículos concretos, no a páginas de categoría)
- [ ] Internal links verificados: tipo del destino correcto (informativo → `/guias/`, comparativa → `/[categoria]/`)
- [ ] FAQs en frontmatter (3-7, número variable)
- [ ] Tags relevantes (3-6)
- [ ] Autor con nombre real
- [ ] No hay keyword stuffing
- [ ] Medidas y dimensiones incluidas donde sean relevantes
- [ ] Coherencia entre artículos verificada contra las fuentes canónicas (experiencia real, datos del autor y datos de productos)
- [ ] Imagen de artículo verificada <= 800px de ancho
- [ ] No hay emails en texto plano en el MDX (usar link a `/sobre-mi/`)
- [ ] Meta description entre 120-155 caracteres
- [ ] `npm run build` ejecutado sin errores
- [ ] PRODUCTOS.md actualizado con los datos del artículo
- [ ] Keywords verificadas en Keyword Surfer y volúmenes añadidos a seo-keywords.csv
- [ ] Meta description incluye la variación de keyword con mayor volumen real
- [ ] Texto humanizado (aplicar reglas de `.seo-engine/templates/humanization-guide.md`)

---

## Humanización obligatoria antes de publicar

Antes de marcar como terminado CUALQUIER contenido público (artículo MDX, post Reddit/Quora/foro, copy de página), aplicar las reglas de `.seo-engine/templates/humanization-guide.md`.

- Aplica a: artículos, posts/comentarios para backlinks, copy de páginas, cualquier draft público.
- No aplica a: código, commits, PRs, mensajes internos, frontmatter YAML, archivos del SEO engine.
- Flujo: terminar draft → revisar contra humanization-guide.md → aplicar correcciones → marcar como terminado.
- Si se modifica >20% del cuerpo tras humanización previa, volver a aplicar.
