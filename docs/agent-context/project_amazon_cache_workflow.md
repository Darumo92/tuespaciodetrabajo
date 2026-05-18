# Amazon Product Cache Workflow

Sistema de datos volátiles de Amazon afiliados para `tuespaciodetrabajo.com`.

## Objetivo

Separar contenido editorial de datos que cambian con frecuencia:

- El MDX mantiene nombre editorial, análisis, pros/contras, explicación y recomendación.
- `src/data/amazon-products.json` mantiene precio, imagen, disponibilidad, URL API y fecha de revisión.
- Los componentes leen el cache por ASIN antes de usar los valores de fallback del artículo.

## Archivos

- `scripts/amazon-api.mjs` — cliente Creators API, OAuth, parseo normalizado.
- `scripts/update-amazon-cache.mjs` — escanea artículos, consulta ASINs y actualiza `src/data/amazon-products.json`.
- `scripts/audit-amazon-products.mjs` — genera reporte Markdown en `reports/amazon-products/` sin modificar artículos.
- `scripts/amazon-lookup.mjs` — busca candidatos reales por keyword o ASIN antes de pedir datos al usuario.
- `src/lib/amazon-products.ts` — helper para extraer ASIN y leer precio, imagen, disponibilidad y fecha del cache.
- `src/data/amazon-products.json` — cache versionado de productos usados.

## Comandos

```bash
npm run update:amazon-cache -- --article mejor-raton-vertical-ergonomico --limit 6
npm run audit:amazon -- --article mejor-raton-vertical-ergonomico --limit 6
npm run audit:amazon -- --delay 2500 --retries 3
npm run update:amazon-cache -- --delay 2500 --retries 3
```

Opciones soportadas:

- `--delay <ms>` para espaciar lotes y evitar 429.
- `--retries <n>` para reintentos por lote.
- `--limit <n>` para probar con pocos ASINs.
- `--article <slug-parcial>` o `--slug <slug-parcial>` para limitar a un artículo.

## Reglas editoriales

- Usar primero la API/cache para precio, imagen y disponibilidad.
- Para nuevas comparativas, buscar candidatos con `node scripts/amazon-lookup.mjs --search "<keyword>"` antes de pedir ASINs al usuario.
- No inventar ASINs, precios, imágenes, specs ni disponibilidad.
- No pedir datos al usuario si la API puede devolverlos.
- No editar artículos por pequeñas diferencias de precio: las cubre el cache.
- Editar artículos solo si el producto está roto, no disponible de forma grave, no corresponde al análisis o el contenido editorial queda obsoleto.
- El precio en Creators API está en `offersV2.listings[0].price.money.displayAmount`; no usar solo `price.displayAmount`.

## Cadencia operativa

- Mensual: ejecutar auditoría completa y actualización completa del cache con `--delay 2500 --retries 3`. Revisar el reporte Markdown antes de tocar contenido editorial.
- Semanal: auditar una muestra de 5-10 artículos/productos, priorizando productos tocados recientemente, artículos con más tráfico o comparativas con incidencias previas.
- Antes de crear o revisar una comparativa: verificar todos sus ASINs con `npm run audit:amazon -- --article <slug> --delay 2500 --retries 3` y actualizar cache con el mismo filtro.
- Tras cambios de cache: ejecutar `npm run build` y verificar al menos un HTML final si hay productos con diferencias visibles de precio, imagen o disponibilidad.
- Si salen muchos productos mal: no reescribir todos los artículos. Clasificar incidencias y programar máximo 1-2 revisiones editoriales por semana, salvo bug grave o producto principal roto.

## Auditoría inicial 2026-05-15

- Comando: `npm run audit:amazon -- --delay 2500 --retries 3`.
- Reporte: `reports/amazon-products/audit-2026-05-15.md`.
- Resultado: 48 ASINs auditados, 48 encontrados, 0 errores API, 5 incidencias.
- Cache completo actualizado con `npm run update:amazon-cache -- --delay 2500 --retries 3`.
- Archivo cache: `src/data/amazon-products.json`, actualizado el 2026-05-15.

Incidencias que NO requieren edición editorial inmediata:

- `B07DHK5DHN` Amazon Basics Brazo Monitor: disponible, precio API 23,09 EUR frente a precio editorial ~38 EUR. Lo cubre el cache.
- `B0C7KQ7MX8` ErGear Soporte Monitor Dual: disponible, precio API 41,99 EUR frente a precio editorial ~60 EUR. Lo cubre el cache.

Incidencias que sí requieren revisión editorial:

- `B0B9C8VV4X` LG 27UP850N-W en `mejor-monitor-trabajar-desde-casa`: sin precio y no disponible.
- `B0F6WBL3M2` FlexiSpot C7 Lite en `mejor-silla-ergonomica-calidad-precio`: sin precio y no disponible.
- `B0D8HWL8VP` FelixKing Silla Ergonómica en `mejor-silla-oficina-menos-200-euros`: sin precio y no disponible.
