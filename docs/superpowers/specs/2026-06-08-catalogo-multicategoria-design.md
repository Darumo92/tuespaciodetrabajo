# Catálogo multicategoría (estilo surfskate.app) — Design Spec

> Rama: `feat/catalogo-multicategoria` (desde `main`). Rama `feat/catalogo-sillas-db` aparcada.
> Análisis de referencia: `docs/superpowers/specs/2026-06-08-rediseno-catalogo-surfskate-analisis.md`.
> Fecha: 2026-06-08.

## Objetivo

Convertir la web en una **base de datos + comparador** de equipamiento de home office al estilo
de surfskate.app: catálogo multicategoría con specs verificadas, comparador (interactivo + páginas
"vs" indexables), buscador global y blog de actualidad. Monetización por afiliación. Pilar:
**honestidad de datos** (dato no confirmado → `null`/`n/d`, nunca inventar) y **SEO diferencial**
(que Google quiera indexarnos antes que a la competencia).

## Decisiones cerradas (brainstorming)

1. **Alcance v1:** infra genérica completa, poblada **solo con `silla`**. El hub muestra solo tipos con datos.
2. **Categorías:** tipos de producto **concretos** (silla, escritorio, monitor, teclado, raton,
   iluminacion, audio, webcam — lista afinable). No buckets amplios.
3. **Estilo:** estructura/UX de surfskate + **paleta y tipografía propias** (no clon).
4. **Precio:** **tramos €–€€€€** (display). Sin precio exacto en schema (los precios de Amazon
   caducan y un precio desincronizado descalifica el rich result). `priceRange` solo si se conoce
   rango real. El rich snippet de CTR son las **estrellas** (Review/AggregateRating honesto).
5. **Buscador:** **global** (command-palette) + schema `WebSite`/`SearchAction`. Resultados `noindex`.
6. **Comparador:** **interactivo** (casillas + barra) **+ páginas "vs" estáticas indexables** (diferencial SEO).
7. **Blog:** reusar colección `articulos` con `tipo: noticia`, listado en `/actualidad/`.
8. **Modelo de datos:** **opción A** — colección única `productos` con unión discriminada por `tipo`.
9. **Datos sillas:** **rescatar** la investigación real de la rama aparcada (commit `de550af`) al migrar.
10. **Pares "vs":** los **cura el agente** (top emparejamientos por gama/precio similar, criterio documentado).

> **Modelo de datos ≠ navegación.** La colección única es interna. El usuario navega SIEMPRE por
> categoría (`/catalogo/sillas/` muestra solo sillas). Nunca una vista mezclada como experiencia
> principal; el único punto global es el buscador, con cada resultado etiquetado por tipo.

## Arquitectura

### 1. Colección `productos` (Zod, unión discriminada)

`src/content/productos/*.yaml`. Schema:
- **Base común:** `tipo` (enum), `nombre`, `marca`, `imagen`, `imagenAlt`, `tramoPrecio` (1–4),
  `precioMin`/`precioMax` (number nullable, opcional), `valoracion` (0–5 legacy/fallback),
  `valoraciones` (objeto de ejes 0–10, nullable por eje), `amazon` (asin/buscar), `webOficial`,
  `veredicto`, `comunidad`, `paraQuienSi[]`, `paraQuienNo[]`, `puntosFuertes[]`, `puntosDebiles[]`,
  `fuenteSpecs`, `verificadoEn`.
- **`specs`:** `z.discriminatedUnion('tipo', [...])`. Cada tipo define su bloque tipado.
  - `silla`: lumbar, respaldo, reposabrazos, profundidadRegulable, reclinacionMaxGrados,
    pesoMaxKg, alturaAsientoMin/Max, anchoCm, fondoCm, mecanismo, baseMaterial, certificacionBifma,
    pesoProductoKg, garantiaAnios. (= specs ya investigadas en `de550af`.)
  - Otros tipos: definidos en el registro pero sin datos en v1.
- El `slug` se deriva del nombre de archivo (patrón existente).

### 2. Registro de tipos — `src/lib/tipos.ts`

Fuente única que parametriza toda la UI genérica. Por cada `tipo`:
```
{
  slug, labelSingular, labelPlural, icono,
  ejes: [{ clave, etiqueta }],                 // ejes de valoración
  filtros: [{ campo, control, etiqueta, ... }],// controles del catálogo
  comparador: [{ campo, etiqueta, direccion }],// filas + dirección de ganador
  fichaSpecs: [{ grupo, filas: [{ campo, etiqueta, formato }] }],
}
```
Añadir una categoría = añadir una entrada aquí + poblar datos. La UI no se toca.

### 3. Lógica pura — `src/lib/productos.ts` (TDD con Vitest)

Generaliza lo de `sillas.ts`:
- `mediaEjesPresentes(valoraciones)` → media de ejes no nulos.
- `notaGlobal(producto)` → media de ejes, fallback `valoracion*2`.
- `ganadoresPorValor(items, direccion)` → slugs ganadores (ignora null).
- `construirIndiceBusqueda(productos, articulos)` → índice JSON para el buscador.
- `seleccionarParesVs(productos, tipo)` → pares curados para páginas "vs".
- Helpers de formato (tramo €, specs n/d).

### 4. Rutas

| Ruta | Qué | Index |
|------|-----|-------|
| `/catalogo/` | Hub: tarjetas por tipo (solo tipos con datos), contadores | index |
| `/catalogo/[tipo]/` | Catálogo filtrable de un tipo | index |
| `/catalogo/[tipo]/[slug]/` | Ficha de producto | index |
| `/comparar/[tipo]/` | Comparador interactivo (`?s=a,b,c`) | **noindex** |
| `/comparar/[tipo]/[a]-vs-[b]/` | Página "vs" estática | **index** |
| `/buscar/` | Buscador global | **noindex** (resultados) |
| `/actualidad/` | Blog de noticias (tabs por tipo) | index |

Las categorías de **artículos** actuales (`/sillas/`, `/escritorios/`…) se mantienen. El catálogo
vive en `/catalogo/`. **Redirects** de rutas viejas de producto (`/sillas/catalogo/*`,
`/sillas/comparar/*`, `/sillas/selector/*`) → equivalentes en `/catalogo/sillas/*`.

### 5. Componentes (genéricos, parametrizados por `tipoConfig`)

- `TarjetaProducto.astro` — tarjeta de catálogo (imagen/fallback, badge ★nota, chips, tramo €, casilla comparar).
- `CatalogoProductos.astro` — filtros generados desde `tipoConfig`, toggle grid/tabla ordenable,
  contador dinámico, casillas comparar + barra flotante (localStorage).
- `FichaProducto.astro` — specs agrupadas desde `tipoConfig`, `ValoracionEjes`, veredicto,
  comunidad, `ParaQuien`, fuentes; emite `Review` honesto.
- `ComparadorProductos.astro` — comparador interactivo cliente (radar/barras + tabla, ganador por fila).
- `TablaVs.astro` — tabla para las páginas "vs" estáticas + mini-veredicto "cuál elegir".
- `BuscadorGlobal.astro` — command-palette (modal en header) + página `/buscar/`, fuzzy sobre índice JSON.
- `ImagenProducto.astro` / `FallbackImagen.astro`, `ValoracionEjes.astro`, `ParaQuien.astro` —
  rescatables de la rama aparcada (referencia), generalizados a producto.

### 6. Comparador — detalle

- **Interactivo:** marcar 2–4 en `/catalogo/[tipo]/` → barra → `/comparar/[tipo]/?s=…`. `noindex`.
  Reutiliza `ganadoresPorValor`/`notaGlobal`. Visualización: barras por eje + (opcional) radar.
- **Páginas "vs" estáticas:** `getStaticPaths` genera pares **curados** por `seleccionarParesVs`
  (criterio: misma gama/rango de precio y/o top valorados; ~10–20 pares por tipo, NO los 171 de 19
  sillas). URL `slugA-vs-slugB` (orden alfabético estable). Contenido: intro, tabla comparativa,
  mini-veredicto editorial "para quién cada una", CTAs. Schema `BreadcrumbList`. Indexable.

### 7. Buscador global

Índice JSON estático (productos + artículos) emitido en build. Fuzzy client-side (vanilla, sin
framework). Atajo command-palette en header + página `/buscar/`. Cada resultado con **etiqueta de
tipo**. `WebSite`+`SearchAction` en home; resultados `noindex`.

### 8. Blog actualidad

`articulos`: añadir valor `noticia` al enum `tipo`. Listado `/actualidad/` con tabs (Noticias /
Guías / Reviews / Tips, mapeados a los `tipo` existentes). Schema `Article`/`NewsArticle`. Entra en
RSS y sitemap existentes.

### 9. SEO / schema (honesto)

- Producto: `Product` + `Review`/`AggregateRating` (sin precio exacto; `priceRange` solo si rango real).
- "vs": indexable + `BreadcrumbList`.
- Home: `WebSite`+`SearchAction`. Catálogo `[tipo]`: `ItemList`. Noticias: `Article`.
- `noindex`: comparador interactivo + `/buscar/`. Cero `FAQPage`/`HowTo` inventados (consistente con el sitio).

### 10. Estilo visual

Estructura surfskate (sidebar de filtros, toggle grid/tabla, barras/radar) con design tokens
existentes (`var(--color-*)`, `var(--font-display)`). Densidad media, identidad cálida propia.
Sin framework cliente (CWV). Header con enlaces nuevos: Catálogo, Comparar, Buscar, Actualidad.

## Migración de datos (sillas)

Rescatar de la rama aparcada (`git show de550af`) los 19 `.yaml` enriquecidos de
`src/content/sillas/` y transformarlos a `src/content/productos/` con `tipo: silla` y `specs:{…}`.
Mantener la honestidad (n/d donde no había fuente). Convertir `precioAprox` → `tramoPrecio`
(+ `precioMin/Max` si procede). Conservar valoraciones por ejes, veredicto, comunidad, para-quién.

## Testing

- Vitest (TDD) para `src/lib/productos.ts`: `mediaEjesPresentes`, `notaGlobal`, `ganadoresPorValor`,
  `construirIndiceBusqueda`, `seleccionarParesVs`.
- Validación de build (Zod discriminated union) sobre todos los `productos`.
- Greps de schema: 0 `FAQPage`/`HowTo`; `Review` presente; comparador interactivo y `/buscar/` con `noindex`.

## Alcance v1 (qué entra)

Infra genérica + tipo `silla` poblado (datos rescatados) + comparador interactivo de sillas +
~10–20 páginas "vs" de sillas + buscador global (indexa sillas + artículos) + `/actualidad/`
(estructura, aunque haya pocas noticias) + redirects de rutas viejas + home/nav actualizados.
Otros tipos: definidos en el registro, sin datos, ocultos del hub hasta poblarse.

## Fuera de alcance v1 (futuro)

Poblar monitores/teclados/etc.; radar avanzado; selector guiado multicategoría (el de sillas se
migra); i18n EN/ES; newsletter.

## Riesgos

- **Explosión de pares "vs":** mitigado con curación (`seleccionarParesVs`, pocos pares relevantes).
- **Migración:** los datos buenos están en otra rama; hay que traerlos con `git show`/checkout puntual.
- **Genericidad vs especificidad:** el registro `tipos.ts` debe cubrir bien las specs de silla sin
  sobre-abstraer; validar con la única categoría real antes de añadir otras.
