# Diseño — Catálogo de sillas con base de datos estructurada (modelo surfskate)

> **Fecha:** 2026-06-06 · **Autor:** David Rubio Mota · **Estado:** aprobado, listo para writing-plans
> **Contexto:** Fase 3 del `PLAN-RECONDUCCION-SEO.md` (Días 24-28), adelantada a petición del usuario.
> **Objetivo:** activo factual único y diferencial que Google indexe, reduciendo el exceso de botones Amazon y elevando la profesionalidad del sitio.
>
> **NOTA multi-PC:** toda la decisión vive en este repo (no en memoria del asistente). Cualquier agente/PC retoma desde aquí.

---

## 1. Problema y objetivo

El sitio es un dominio nuevo (~2,5 meses) que Google **no indexa** (`Crawled - currently not indexed` masivo). Causa diagnosticada (ver plan, Sección 1): contenido que fabricaba experiencia. La lección de `surfskate.app`: **datos factuales agregados y verificables = valor que indexa**, aunque los monte una IA.

Petición del usuario (verbatim, sesión 2026-06-06):
- "siguen habiendo demasiado botones de amazon… no me parece todo lo profesional posible"
- "estaría bien que estuviese mucho mejor la tabla comparativa mas datos, poder escoger sillas de una base de datos"
- "hacer algo único y diferencial de las demás webs"
- "que sea la web lo mas pro posible… conseguir que google nos indexe"
- "Contra mas catalogo amplio tengamos mejor"

**Objetivo de esta fase:** construir, **solo para la categoría sillas** (piloto), una base de datos estructurada de productos que alimente:
1. un catálogo filtrable y ordenable (la "estrella"),
2. fichas individuales por silla (volumen de páginas indexables),
3. un selector guiado (asistente),
4. tablas comparativas embebidas en los artículos (misma fuente de datos).

**Diferencial:** ninguna web ES de home-office/ergonomía ofrece un catálogo filtrable de sillas con specs verificables + matcher por altura/peso/presupuesto. El resto son roundups de stock afiliado. Este catálogo es el foso defensivo.

---

## 2. Principio de honestidad (NO negociable)

Heredado del `PLAN-RECONDUCCION-SEO.md`, Sección 2-3:
- **Catálogo amplio SÍ, pero cada ficha con specs verificables.** Amplio + inventado = el error anterior multiplicado.
- Todo dato no confirmado se marca `n_d` (no disponible), nunca se inventa un número.
- Cada ficha registra `fuenteSpecs` y `verificadoEn`.
- No afirmar uso/prueba propia de sillas no poseídas. Referencia personal real = Herman Miller Aeron (única silla que David usa de verdad; no entra en el catálogo de comparación por gama de precio, se cita como vara de medir).

Objetivo de volumen realista del piloto: **15-25 sillas reales** disponibles en Amazon.es u otras tiendas, con specs de ficha de fabricante. Empieza con un set sólido y crece.

---

## 3. Arquitectura de datos

Nueva colección de datos Astro `sillas` (decisión de implementación: data collection vía `defineCollection({ type: 'data' })` en `src/content/` con archivos por silla, o `src/data/sillas/*.json`; el plan de implementación elige). **Una entrada por silla.**

### Esquema de cada silla

```yaml
slug: sihoo-doro-c300            # id único, URL-safe
nombre: "SIHOO Doro C300"
marca: "SIHOO"
imagen: "https://m.media-amazon.com/images/I/...jpg"   # ficha de producto, NUNCA "foto propia"
imagenAlt: "Silla ergonómica SIHOO Doro C300"

# --- specs verificables (null / "n_d" permitido) ---
precioAprox: 320                 # número en EUR, aprox
lumbar: "dinamico"               # fijo | presion | altura | dinamico | 5d
reposabrazos: "3d"               # 1d | 2d | 3d | 4d | abatibles | ninguno
respaldo: "malla"                # malla | espuma | mixto
profundidadRegulable: false      # bool
pesoMaxKg: 150                   # número | null
alturaAsientoMinCm: null         # número | null
alturaAsientoMaxCm: null         # número | null
reclinacionMaxGrados: 135        # número | null
garantiaAnios: 3                 # número | null

# --- evaluación editorial (criterios objetivos, no experiencia fingida) ---
valoracion: 4.5                  # 0-5, basada en specs + reseñas verificadas
puntosFuertes: ["Lumbar dinámico autoajustable", "Malla densa", "Soporta 150 kg"]
puntosDebiles: ["Precio alto para la gama", "Malla firme al inicio"]
idealPara: "Jornada completa, prioridad ergonomía sin precio premium"

# --- compra (solo Amazon como afiliado) ---
amazon:
  asin: "B0C3T865C2"             # 1 ASIN (.es). OneLink geo-resuelve mañana. opcional
  buscar: "SIHOO Doro C300"      # fallback búsqueda si no hay asin fiable. opcional
webOficial: null                 # url tienda/fabricante, enlace neutro nofollow. opcional

# --- trazabilidad de honestidad ---
fuenteSpecs: "Ficha Amazon.es + web SIHOO"
verificadoEn: "2026-06-06"       # YYYY-MM-DD
```

**Reglas del modelo:**
- `amazon` ausente y `webOficial` ausente → ficha factual sin botón de compra (válida igual, aporta SEO).
- `amazon.asin` preferente; `amazon.buscar` solo fallback. **1 solo ASIN**, no uno por país (OneLink resuelve geo + fallback).
- Sillas no vendidas en Amazon (p. ej. Herman Miller, IKEA) **se listan igual**, sin botón comercial o con `webOficial` neutro.

---

## 4. Páginas y URLs (jugada de indexación)

| Ruta | Contenido | Schema |
|---|---|---|
| `/sillas/catalogo/` | Catálogo filtrable + ordenable (enfoque A, la estrella) | `ItemList` (→ `Dataset` cuando crezca) |
| `/sillas/catalogo/[slug]/` | **Ficha individual por silla** — N páginas factuales indexables (volumen surfskate) | `Product` (+ `offer`, `aggregateRating` si verificable) |
| `/sillas/selector/` | Asistente guiado 3 pasos (enfoque B), o embebido en catálogo | — |

- Cada ficha enlaza a su comparativa relevante y viceversa (enlazado interno descriptivo).
- Decisión enfoques: **A como estrella** (catálogo filtrable, activo que indexa), **B como complemento** (selector guiado, embebido o página ligera).

---

## 5. Componentes (Astro)

- `CatalogoSillas.astro` — grid/tabla + barra de filtros + orden por columna. **JS vanilla** (sin framework pesado → proteger CWV).
  - Filtros: presupuesto (rango), tu altura (cm), tu peso (kg), respaldo (malla/espuma), profundidad regulable (sí/no), reposabrazos (1D/2D/3D), peso máx (≥).
  - Orden: precio ↑↓, valoración, peso máx.
- `SelectorSillas.astro` — wizard 3 pasos (presupuesto → altura → prioridad) → recomendación razonada con datos ("única con profundidad regulable para tu altura").
- `FichaSilla.astro` — página individual: tabla de specs completa + puntos fuertes/débiles + **1 botón precio** (vía `BotonPrecio`).
- `BotonPrecio.astro` — **1 botón por producto**, OneLink-ready:
  - si `amazon.asin` → link `/dp/ASIN?tag=tuespaciodet-21` (`rel="sponsored nofollow noopener"`).
  - si no, `amazon.buscar` → link búsqueda Amazon por nombre.
  - si no hay `amazon` pero sí `webOficial` → enlace neutro "Web oficial" (`rel="nofollow"`).
  - si nada → sin botón.
  - **Diseño OneLink-friendly:** centralizar la construcción del href para que migrar a OneLink (script global + tags por marketplace) sea cambiar 1 sitio.
- `TablaComparativaDB.astro` — recibe lista de `slug`s, lee de la colección `sillas`, renderiza tabla comparativa para incrustar en artículos. **Reemplaza** el patrón actual de `ComparisonTable` con datos inline duplicados → datos únicos centralizados, menos botones.

---

## 6. Schema.org (indexabilidad + GEO/AEO)

- Catálogo: `ItemList` con cada silla como `Product` (o `Dataset` cuando el catálogo sea grande, como surfskate).
- Ficha individual: `Product` con:
  - `brand`, `image`, `description`, specs como `additionalProperty` (`PropertyValue`) donde aplique.
  - `offer` con `priceCurrency: EUR`, `price`, `availability`, `priceValidUntil`, política de devolución/envío (ya implementado en `ComparisonTable`, reutilizar).
  - `aggregateRating` SOLO si hay rating verificable citando fuente (p. ej. Amazon), nunca inventado.
- **Prohibido:** `FAQPage` (restringido) y `HowTo` (rich results eliminados). FAQ como HTML visible OK. Verificar `grep -rl "FAQPage\|\"HowTo\"" dist/` = 0 tras build.

---

## 7. Profesionalidad y reducción de botones

- Problema actual: artículos con 4-6 botones Amazon repetidos (TopPick + ComparisonTable + AffiliateButton ×4 + enlaces) → aspecto de granja de afiliados, mala UX, señal SEO negativa.
- Solución:
  - **1 CTA de precio por producto**, no repetido.
  - Tabla densa pero legible, ordenable, responsive.
  - Ficha de producto como tarjeta seria de referencia, no muro de botones.
  - El peso de la página recae en los **datos** (tabla de specs), no en los CTAs.
- Antes de implementar el look final, **mockup pulido "pro"** validado en el companion visual.

---

## 8. Integración con el contenido existente

- Las comparativas de artículo (`src/content/articulos/*.mdx`) migran de `ComparisonTable` con datos inline a `TablaComparativaDB` con `slug`s → fuente de datos única.
- La comparativa faro ya reescrita (`mejor-silla-ergonomica-calidad-precio`, commit `d218fa8`) será el primer consumidor: sus 6 sillas se vuelcan a la colección `sillas` y la tabla de specs Markdown se reemplaza por el componente DB.
- El catálogo enlaza a las comparativas (transaccional ↔ referencia).

---

## 9. Alcance — qué se hace AHORA vs qué se APLAZA

### EN ESTA FASE (subsistema 1)
- [ ] Colección de datos `sillas` + esquema (sección 3).
- [ ] Poblar 15-25 sillas reales con specs verificables (`n_d` donde no haya dato).
- [ ] `/sillas/catalogo/` (filtrable + ordenable).
- [ ] `/sillas/catalogo/[slug]/` (fichas individuales).
- [ ] Selector guiado (página o embebido).
- [ ] Componentes: `CatalogoSillas`, `SelectorSillas`, `FichaSilla`, `BotonPrecio`, `TablaComparativaDB`.
- [ ] Schema `ItemList`/`Product` (sin FAQPage/HowTo).
- [ ] Migrar la comparativa faro a `TablaComparativaDB`.
- [ ] Mockup pro validado + build OK + `grep FAQPage/HowTo dist/` = 0.

### APLAZADO (fases siguientes, anotado para no perderlo)
- **Amazon OneLink** (geo-redirección automática al Amazon del país del visitante + tag por marketplace). El modelo de dato ya queda OneLink-ready (1 ASIN, href centralizado). Requiere: alta de tags por marketplace en Amazon Associates + script OneLink global.
- **Agregador multi-tienda** (Skimlinks / Sovrn / Awin) para monetizar enlaces no-Amazon. Hoy NO: solo hay afiliado Amazon.
- **Traducción a inglés (i18n) + geo internacional.** Aplazado: dominio nuevo sin indexar; añadir inglés dispersa autoridad. Revisar cuando ES recupere indexación.
- **Replicar el catálogo a otras categorías** (escritorios, monitores, teclados, ratones, ambiente). El componente se diseña reutilizable, pero el piloto valida primero en sillas.

---

## 10. Criterios de éxito

1. Catálogo `/sillas/catalogo/` y ≥15 fichas individuales construidas, con specs verificables y `n_d` donde falte.
2. Filtros y orden funcionan sin framework pesado; CWV no se degrada.
3. Máximo 1 CTA de precio por producto; aspecto profesional validado en mockup.
4. `npm run build` OK (todas las páginas). `grep -rl "FAQPage\|\"HowTo\"" dist/` = 0.
5. Schema `Product`/`ItemList` válido en las nuevas páginas.
6. Comparativa faro migrada a la fuente de datos única.
7. (Medio plazo, GSC) las nuevas fichas factuales empiezan a recibir crawl/indexación — señal de que el modelo surfskate funciona.
