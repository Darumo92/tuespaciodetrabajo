# Reglas Amazon y afiliación

> Cargar este archivo cuando la tarea implique: crear/revisar comparativas, trabajar con productos Amazon, auditar precios/disponibilidad, o modificar componentes de afiliación.

## Afiliación

- Amazon Associates ID: `tuespaciodet-21` — se añade automáticamente en `AffiliateButton.astro`, `ComparisonTable.astro` y `TopPick.astro`
- Datos volátiles de Amazon (precio, imagen, disponibilidad, fecha de revisión) viven en `src/data/amazon-products.json` y se leen con `src/lib/amazon-products.ts`

## Comandos API

- Buscar productos: `node scripts/amazon-lookup.mjs --search "<keyword>"`
- Auditar artículo: `npm run audit:amazon -- --article <slug> --limit <n>`
- Actualizar cache: `npm run update:amazon-cache -- --article <slug> --limit <n>`
- Parseo correcto de precio: `offersV2.listings[0].price.money.displayAmount` (no solo `price.displayAmount`)

## Cadencia

- Mensual: `npm run audit:amazon -- --delay 2500 --retries 3` y `npm run update:amazon-cache -- --delay 2500 --retries 3`
- Semanal: auditar muestra de 5-10 artículos/productos
- Antes de crear/revisar comparativa: auditar todos sus ASINs con `--article <slug>`

## Reglas estrictas

- No editar artículos por pequeñas diferencias de precio/imagen/disponibilidad: lo cubre el cache. Editar MDX solo si el producto está roto, no disponible de forma grave, no corresponde o el análisis editorial queda obsoleto
- Las incidencias editoriales reales viven en `docs/agent-context/project_amazon_editorial_review_queue.md`; no reescribir en masa, priorizar 1-2 revisiones editoriales por semana
- Nunca incluir `?tag=tuespaciodet-21` en las URLs MDX — los componentes lo añaden solos
- **Nunca usar links markdown a `/dp/ASIN`** (ej: `[Producto](/dp/ASIN)`) — da 404. Usar siempre `<AffiliateButton href="/dp/ASIN" tienda="amazon" texto="Ver Producto en Amazon" />`
- **Props de AffiliateButton:** siempre `href` (no `enlace`), `tienda="amazon"` y `texto`
- Usar URLs directas `/dp/ASIN` (no URLs de búsqueda `/s?k=`)
- Imágenes de producto: usar siempre `_AC_SL300_` en la URL, nunca `_AC_SL1500_`

## Imágenes de artículos

- Script Pexels: `node scripts/pexels-download.mjs "<query>" <slug> [--list] [--index=N] [--orientation=landscape|portrait|square]`
- Script batch: `node scripts/pexels-batch-download.mjs`
- Optimizador: `node scripts/optimize-images.mjs`
- Requiere `PEXELS_API_KEY` en `.env`
- Uso con `--list` para previsualizar antes de descargar
- Guarda en `public/images/articulos/<slug>.webp` (WebP, quality 80)
- **Antes de descargar:** verificar en `PRODUCTOS.md` (tabla "Imágenes de artículos (Pexels)") que el `pexels_id` no está ya usado
- **Después de descargar:** añadir fila a esa tabla con: slug, archivo, pexels_id, fotógrafo y URL
- **Tamaño máximo:** 800px de ancho. Si mayor, redimensionar con sharp: `sharp('ruta').resize(800).webp({ quality: 80 }).toFile('ruta-opt.webp')`
