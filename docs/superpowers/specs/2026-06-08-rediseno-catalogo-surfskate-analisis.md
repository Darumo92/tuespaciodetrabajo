# Análisis surfskate.app + adaptación a Tu Espacio de Trabajo

> Rama: `feat/catalogo-multicategoria` (nueva, desde `main`). Rama `feat/catalogo-sillas-db` **aparcada**.
> Fecha: 2026-06-08. Objetivo: rehacer el catálogo a imagen de surfskate.app, multicategoría,
> con comparador + buscador + blog de actualidad.

## 1. Qué es surfskate.app (referencia)

Sitio nicho tipo "base de datos + comparador" de surfskates. No vende: agrega specs verificadas,
deja comparar y filtrar, monetiza por afiliación. Misma jugada que queremos para home office.

Cifras que muestran como gancho: "195+ surfskates, 33 truck systems, 96 wheels".

## 2. Arquitectura del sitio (rutas)

- `/catalog/` con sub-catálogos: `surfskates`, `trucks`, `wheels` (3 tipos de producto distintos).
- `/compare/` con variantes: `boards`, `trucks`, `wheels`.
- `/quiz/` (board finder, selector guiado de 7 preguntas).
- `/surf-matcher/` (herramienta secundaria: traduce "tu ola/estilo" a tabla).
- `/blog/` + `/blog/[slug]/` con filtros por tipo (News / Guides / Reviews / Tips).
- Soporte: `/about/`, `/glossary/`, `/faq/`, `/contact/`, legales.
- Filtrado por marca vía query: `?brand=Carver`.
- Bilingüe EN/ES (toggle).

## 3. Home (secciones, de arriba a abajo)

1. **Header sticky**: logo + nav (Catalog, Compare, Board Finder, Surf Matcher, Blog, Contact) + toggle idioma.
2. **Hero**: titular "Find your ideal surfskate" + subtítulo con las cifras (195+...) + 2 CTAs: "View Catalog" y "Compare Models".
3. **Propuesta de valor**: 4 bloques con icono — "Filter by specs", "Compare side by side", "Visualize geometry", + las 2 herramientas (quiz y matcher).
4. **Showcase de marcas**: grid de 23 logos, cada uno enlaza a catálogo filtrado por marca.
5. **Preview del blog**: 3 artículos recientes (fecha, categoría, "Read more").
6. **Newsletter** (aparece 2 veces).
7. **Footer**: columnas Catalog / Tools / Learn / Legal + disclosure de afiliación.

## 4. Catálogo (la pieza central)

- **Sidebar de filtros** (izquierda):
  - Marca (multi-select, 23 marcas).
  - Categoría/tipo (4 opciones).
  - "Truck system" (dropdown con 45+ opciones).
  - Año (2018–2026).
  - **Slider de rango doble** para wheelbase (medida clave) min–max.
- **Doble vista**: grid de tarjetas **o** tabla ordenable (cada columna con sort ↕).
- **Tarjeta de producto**: nombre + marca, año, sistema, longitud, wheelbase, ancho, ángulo,
  badge de categoría, **nivel de precio con símbolos € a €€€€** (no precio exacto), enlace "View →".
- **Contador dinámico**: "192 models found" actualiza con filtros.
- Sin paginación visible (carga todo / scroll). Filtrado client-side instantáneo.
- Las casillas de comparar NO están en el catálogo: el comparador es herramienta aparte con buscador propio.

## 5. Comparador

- **Buscador** para añadir productos (no checkboxes en catálogo) — selección de **hasta 3**.
- Contador (0/3). Estado vacío con instrucción.
- Tabla comparativa por grupos: Dimensiones (wheelbase, longitud, ancho), Trucks (ángulo),
  Wheels, Peso.
- **3 visualizaciones**: radar de geometría, barras por métrica, y un "foot-on-board visualizer"
  (gimmick específico del producto).

## 6. Buscador / Selector guiado (quiz)

- **Board finder**: 7 preguntas rápidas (objetivo de riding, tamaño corporal, presupuesto) →
  recomienda tablas de la base de datos. Input por botones.
- **Surf matcher**: herramienta de marketing secundaria.

## 7. Blog

- Lista vertical full-width (sin tarjetas), separación mínima.
- Por artículo: categoría, fecha, titular enlazado, excerpt 1–2 frases, "Read more →".
- **Tabs de filtro** por tipo: All / News / Guides / Reviews / Tips.
- Feed cronológico, sin hero. Newsletter al final. URL `/blog/[slug]/`.

## 8. Estilo visual

Minimalista, limpio, texto oscuro sobre fondo claro, mucho whitespace, baja densidad,
secciones bien separadas, tipografía jerárquica legible, data-driven (gráficos, tablas).

---

## 9. Mapeo a Tu Espacio de Trabajo

**Categorías actuales del repo** (colección `articulos` + nav): `sillas`, `escritorios`,
`accesorios`, `ambiente`, `audio-video`.

surfskate tiene 3 TIPOS de producto (surfskates/trucks/wheels) cada uno con su propio set de specs
y su propio comparador. Nuestro equivalente: cada **categoría = un tipo de producto con specs
propias**. Granularidad que pidió el usuario: sillas, monitores, teclados, ratones, mesas...
→ hay que decidir el árbol de categorías de producto.

**Equivalencias de funcionalidad:**
| surfskate.app | Tu Espacio de Trabajo |
|---------------|------------------------|
| `/catalog/surfskates` `/trucks` `/wheels` | `/catalogo/sillas` `/escritorios` `/monitores`... |
| Specs: wheelbase, ángulo, longitud | Specs por categoría (sillas ya definidas; resto por definir) |
| Precio en € a €€€€ | Idem (evita precios desactualizados → mejor SEO/honestidad) |
| Comparador hasta 3, radar+barras | Comparador por categoría (specs no se mezclan entre tipos) |
| Quiz 7 preguntas | Selector guiado (ya existe `/sillas/selector/`) |
| Blog News/Guides/Reviews/Tips | Ya hay colección `articulos`; añadir blog de noticias/actualidad |
| Showcase de marcas | Grid de marcas (Herman Miller, Logitech, Dell...) |

**Lo que YA tenemos reutilizable:** colección `sillas` (19 con specs), `src/lib/sillas.ts`
(lógica pura comparador), componentes de la rama aparcada (se pueden rescatar como referencia).

**El gran reto = datos.** Solo `sillas` tiene 19 productos. El resto de categorías están vacías
de producto (solo artículos). Un catálogo multicategoría creíble necesita poblar productos por
categoría con specs reales (mismo pilar de honestidad: dato no confirmado → n/d, nunca inventar).

## 10. Decisiones abiertas (para brainstorming antes de construir)

1. **Árbol de categorías de producto** v1: ¿qué tipos exactos (sillas, mesas/escritorios,
   monitores, teclados, ratones, +)? ¿precio en € a €€€€ o exacto?
2. **Alcance v1**: ¿empezar solo con sillas (única con datos) y dejar la arquitectura lista para
   añadir categorías, o poblar 2-3 categorías de golpe?
3. **Modelo de datos genérico**: schema base común + specs por categoría (discriminated union),
   para que catálogo/comparador/buscador funcionen para cualquier tipo.
4. **Estilo visual**: ¿clonar el look minimalista claro de surfskate o mantener identidad propia?
5. **Buscador**: global (todas las categorías) tipo command-palette, o por categoría.
6. **Comparador**: por categoría (no mezclar specs de tipos distintos), hasta N=3/4.
7. **Blog de actualidad**: ¿flujo de noticias nuevo o reusar `articulos` con un tipo "noticia"?
