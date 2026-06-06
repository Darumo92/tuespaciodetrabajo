# Mejoras del catálogo de sillas: valoración por ejes, comparador e imágenes — Design

**Fecha:** 2026-06-06
**Estado:** Diseño aprobado (pendiente de plan de implementación)
**Contexto previo:** Amplía la feature entregada en `2026-06-06-catalogo-sillas-db-design.md` (colección `sillas`, catálogo filtrable, fichas, selector, tabla comparativa). El usuario valoró el resultado como "muy pobre": poca información por silla, sin forma de comparar sillas entre sí, e imágenes inconsistentes.

## Goal

Convertir el catálogo en una **guía-comparador de sillas** creíble y diferencial: información rica y verificable por silla, una **valoración editorial por ejes**, un **comparador interactivo** (seleccionar 2-4 sillas y enfrentarlas) y una **estrategia de imágenes** consistente. Todo manteniendo la regla de honestidad del proyecto (dato no verificado → `n/d`, nunca inventar) y reforzando el SEO de "contenido útil" / E-E-A-T.

## Scope

**En esta fase:**
1. Modelo de datos ampliado (specs adicionales + valoración por ejes + contenido editorial), todo honesto/`null`.
2. Valoración editorial por ejes con barras, y **nota global /10** derivada.
3. Bloques de contenido por ficha: **veredicto**, **qué dice la comunidad**, **para quién sí / para quién no**.
4. **Comparador interactivo**: selección con casillas en el catálogo → vista de comparación lado a lado con resalte del "ganador" por fila.
5. **Imágenes**: reales donde sea legítimo + componente de **fallback de marca** consistente.
6. Tarjeta de catálogo enriquecida.
7. Schema.org honesto (Review editorial con nota; Product/ItemList/Breadcrumb existentes).

**Fuera de esta fase (futuro):**
- Páginas estáticas "X vs Y" (otra fase — fuerte SEO de intención).
- Resolución de ASINs reales vía la API de Amazon (proceso ya existente; se ejecuta aparte).
- Datos de test de laboratorio propios (no los tenemos; las valoraciones son editoriales).

## Principio de honestidad (rige todo el diseño)

- Cualquier spec numérica/booleana no confirmada en una fuente real → `null` → se muestra `n/d`.
- Las **valoraciones por ejes son editoriales**, no medidas de laboratorio. Se etiquetan visiblemente como *"valoración editorial basada en specs + consenso de la comunidad"*. Un eje sin base suficiente → `null` → se muestra "sin valorar" (barra rayada), y **no** computa en la nota global ni "gana" en el comparador.
- `fuenteSpecs` y `verificadoEn` siguen siendo obligatorios y honestos.

## Modelo de datos (ampliación de la colección `sillas`)

Se conservan todos los campos actuales. Se añaden (todos opcionales/`nullable`, salvo donde se indique):

**Valoración por ejes** — objeto `valoraciones`, escala 0–10, cada eje `number | null`:
- `ergonomia`, `ajustabilidad`, `materiales`, `comodidad`, `calidadPrecio`

**Specs ampliadas** (cada una `number | null`, `boolean | null` o `string` opcional):
- `anchoCm`, `fondoCm` — dimensiones físicas (alto ya se infiere de altura de asiento).
- `mecanismo` — texto opcional (p. ej. "Sincro", "Multifunción", "Basculante").
- `baseMaterial` — texto opcional (p. ej. "Aluminio", "Nylon").
- `certificacionBifma` — `boolean | null`.
- `pesoProductoKg` — `number | null`.

**Contenido editorial:**
- `veredicto` — `string` opcional (1-2 frases).
- `comunidad` — `string` opcional (resumen de consenso de foros/Reddit, con la fuente reflejada en `fuenteSpecs`).
- `paraQuienSi` — `string[]` (default `[]`).
- `paraQuienNo` — `string[]` (default `[]`).

Se mantienen `puntosFuertes`/`puntosDebiles` (resúmenes objetivos) y `valoracion` (0–5) por compatibilidad y como respaldo de la nota global.

**Nota global /10:** derivada en lógica pura, no se almacena. `notaGlobal(silla)` = media de los ejes de `valoraciones` presentes (no `null`), redondeada a 1 decimal; si no hay ningún eje, cae a `valoracion * 2`. Solo cuentan ejes con valor (honestidad).

## Lógica pura (`src/lib/sillas.ts`, ampliación, TDD)

Funciones nuevas, puras y testeadas con Vitest:
- `notaGlobal(silla): number | null` — media de ejes presentes (fallback a `valoracion*2`; `null` si no hay nada).
- `mediaEjesPresentes(valoraciones): number | null` — helper de agregación honesta.
- `compararSillas(sillas: Silla[], criterios: AtribComparable[])` → modelo de tabla con, por fila, el/los `slug` "ganador(es)"; los `null` nunca ganan; empates marcan varios ganadores; cada criterio define su dirección (mayor-mejor para peso/garantía/ejes; menor-mejor para precio). Reutiliza `reposabrazosNivel` para comparar reposabrazos.

Casos de test clave: media ignora `null`; nota global con todos `null` cae a `valoracion*2`; precio menor gana; peso/garantía mayor gana; `n/d` no gana; empate marca varios; ejes editoriales comparan por valor.

## Componentes y rutas

**Nuevos componentes (`.astro`):**
- `FallbackImagen.astro` — recibe `marca`/`nombre`; si no hay imagen, pinta un placeholder de marca limpio (texto de marca + modelo sobre fondo neutro). Usado por tarjeta, ficha y comparador para consistencia total.
- `ImagenSilla.astro` (o lógica equivalente) — muestra `<img>` si `imagen` es no vacía, si no `FallbackImagen`.
- `ValoracionEjes.astro` — barras por eje (0–10) + nota global; eje `null` → barra rayada "sin valorar"; cabecera con etiqueta de "valoración editorial".
- `ParaQuien.astro` — listas "para quién SÍ / NO" (✓ verde / ✕ rojo).
- `TarjetaSilla.astro` — tarjeta enriquecida del catálogo (casilla comparar, badge nota /10, precio, chips de specs clave, 1 CTA). `CatalogoSillas` pasa a usarla.
- `ComparadorSillas.astro` — render cliente de la tabla comparativa lado a lado a partir de los `slug` seleccionados.

**Modificados:**
- `FichaSilla.astro` — añade `ValoracionEjes`, `veredicto`, ficha técnica **agrupada** (ergonomía/ajustes · construcción/materiales · dimensiones/garantía) con los nuevos campos y `n/d`, bloque "qué dice la comunidad" y `ParaQuien`. Usa `ImagenSilla`.
- `CatalogoSillas.astro` — tarjetas vía `TarjetaSilla`; casillas "comparar"; barra flotante "Comparar (n)" que enlaza al comparador con los `slug` seleccionados; mantiene filtros/orden vanilla JS (slider ya corregido a 50–2000 "Sin límite").
- `content/config.ts` — amplía el schema Zod de `sillas` con los campos nuevos.
- Datos: re-investigar y enriquecer las 19 sillas (ver "Población de datos").

**Nueva ruta:**
- `src/pages/sillas/comparar.astro` → `/sillas/comparar/`. Embebe todas las sillas como JSON; lee `?s=slug1,slug2,...` de la URL en cliente y renderiza `ComparadorSillas`. Límite 2–4 (si llegan más, toma las primeras 4; si <2, muestra invitación a elegir en el catálogo). Marcada `noindex` (es una herramienta cuyo contenido varía por query; el SEO de comparativas vive en las futuras páginas "vs").

**Selección (cliente):** casillas en las tarjetas; estado en `localStorage` + reflejado en la barra flotante; al pulsar "Comparar" navega a `/sillas/comparar/?s=...`. Vanilla JS (sin framework, proteger CWV).

## Comparador — comportamiento

- Columnas por silla (2–4): imagen/fallback, marca+modelo, nota global /10, botón "quitar", 1 CTA.
- Filas agrupadas: **valoración por ejes** (mini-barras comparables), precio/garantía, ergonomía/ajustes, construcción.
- **Resalte del ganador por fila** (celda destacada + etiqueta "mejor / más barata / más carga…") calculado con `compararSillas`. Los `n/d` no ganan.
- Responsive: scroll horizontal con primera columna (atributo) fija.

## Imágenes

- **Reales donde sea legítimo:** sillas en Amazon → imagen del CDN de Amazon (se completará al resolver ASINs con la API; el campo `imagen` admite URL). Premium → imagen oficial del fabricante solo si su uso es legítimo; si hay duda, `imagen: ""`.
- **Fallback de marca** (`FallbackImagen`) siempre que `imagen` esté vacía → la rejilla, la ficha y el comparador nunca se ven rotos ni vacíos.
- Sin imágenes "de relleno" inventadas ni logos de terceros sin permiso.

## SEO / schema.org

- **Ficha:** se mantiene `Product`. Se añade un `Review` editorial honesto: `reviewRating` = nota global (escala /10, `bestRating: 10`), `author`/`publisher` = el sitio, `reviewBody` = veredicto. Es **nuestra** reseña editorial (honesto), no `aggregateRating` de usuarios (que sería engañoso).
- Se mantienen `ItemList` (catálogo) y `BreadcrumbList`.
- **Prohibido** (como en la fase previa): `FAQPage`, `HowTo`. Verificación por grep en `dist/` = 0.
- El contenido editorial rico (veredicto, comunidad, para-quién) es la palanca principal de "contenido útil".
- `/sillas/comparar/` → `noindex`.

## Población de datos (PILAR esencial — no escatimar)

> **Prioridad explícita del usuario:** los datos son el pilar del comparador; sin datos buenos, el comparador pierde todo el sentido. La investigación debe ser **exhaustiva**: el objetivo es **minimizar los `n/d`** a base de buscar de verdad en múltiples fuentes (fabricante, Amazon.es, RTINGS/reviews especializadas, r/OfficeChairs y foros, fichas de distribuidores). `n/d` se reserva **solo** para datos genuinamente no localizables tras buscar — nunca por pereza, y nunca inventando. Cada silla merece una pasada de investigación seria, no un relleno superficial.

- Re-investigar las 19 sillas (fuentes reales: fabricante, Amazon.es, reviews especializadas, r/OfficeChairs y foros, distribuidores) para rellenar los campos nuevos **cuando se confirmen en una fuente real**; el resto `null` solo tras intentar localizarlo.
- **Valoraciones por ejes**: asignación editorial siguiendo una rúbrica consistente y documentada en el plan:
  - *Ergonomía*: tipo de lumbar, soporte, reclinación, consenso ergonómico.
  - *Ajustabilidad*: nº y tipo de ajustes (reposabrazos, profundidad, lumbar, altura).
  - *Materiales*: calidad de malla/espuma, base, durabilidad/garantía, consenso.
  - *Comodidad*: consenso de uso prolongado.
  - *Calidad-precio*: prestaciones frente a precio.
  - Eje sin base suficiente → `null` ("sin valorar").
- Riesgo aceptado: algunas sillas premium poco documentadas mostrarán varios `n/d`; es preferible a inventar. El plan debe fijar la rúbrica para que las notas sean coherentes y defendibles, e indicar que las URLs/precios se revisan antes de desplegar.

## Testing

- Lógica pura nueva (`notaGlobal`, `mediaEjesPresentes`, `compararSillas`) con Vitest siguiendo TDD (rojo→verde).
- Zod valida todas las entradas en `npm run build` (campos nuevos incluidos).
- Verificación de schemas prohibidos (`FAQPage`/`HowTo` = 0) y build limpio.

## Arquitectura: aislamiento y claridad

- La lógica de agregación y de "ganador" vive en `src/lib/sillas.ts` (pura, testeable), no en los componentes.
- Cada componente nuevo tiene una responsabilidad única y una interfaz por props clara (`FallbackImagen`, `ValoracionEjes`, `ParaQuien`, `TarjetaSilla`, `ComparadorSillas`).
- El comparador separa **datos** (JSON embebido + lib pura) de **render** (componente) y de **selección** (script de catálogo).

## Criterios de éxito

- El catálogo permite seleccionar 2–4 sillas y compararlas lado a lado con resalte de diferencias.
- Cada ficha muestra valoración por ejes + nota global, veredicto, consenso de comunidad y para-quién, además de specs ampliadas; los datos sin confirmar aparecen como `n/d`/"sin valorar".
- Ninguna tarjeta/ficha/columna se ve "rota" por falta de imagen (fallback consistente).
- Build limpio, tests verdes, `FAQPage`/`HowTo` = 0, y schema `Review` editorial honesto en las fichas.
