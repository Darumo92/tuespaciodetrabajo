# Amazon Editorial Review Queue

Cola de revisión editorial derivada de auditorías Amazon. No incluir aquí diferencias pequeñas de precio si el producto sigue disponible: las cubre `src/data/amazon-products.json`.

## Auditoría inicial 2026-05-15

Reporte fuente: `reports/amazon-products/audit-2026-05-15.md`.

Resumen:

- 48 ASINs únicos auditados.
- 48 productos encontrados por API.
- 0 errores API.
- 3 incidencias editoriales reales por producto no disponible/sin precio.
- 2 diferencias de precio en productos disponibles, gestionadas por cache.

## Cola priorizada

1. `mejor-monitor-trabajar-desde-casa` — revisar `LG 27UP850N-W` (`B0B9C8VV4X`). Motivo: no disponible y sin precio. Impacto medio-alto porque es una comparativa comercial de monitores y el producto aparece en tabla, análisis y recomendación final.
2. `mejor-silla-ergonomica-calidad-precio` — revisar `FlexiSpot C7 Lite` (`B0F6WBL3M2`). Motivo: no disponible y sin precio. Impacto alto si sigue siendo una opción destacada de malla completa.
3. `mejor-silla-oficina-menos-200-euros` — revisar `FelixKing Silla Ergonómica` (`B0D8HWL8VP`). Motivo: no disponible y sin precio. Impacto medio porque es una opción de nicho para soporte cervical.

## Productos solo cache, sin revisión editorial

- `mejor-soporte-monitor-brazo-articulado` — `Amazon Basics Brazo Monitor` (`B07DHK5DHN`): precio API 23,09 EUR, en stock. No editar MDX solo por precio.
- `mejor-soporte-monitor-brazo-articulado` — `ErGear Soporte Monitor Dual` (`B0C7KQ7MX8`): precio API 41,99 EUR, en stock. No editar MDX solo por precio.

## Ritmo recomendado

- Revisar 1-2 artículos editoriales por semana como máximo.
- Priorizar artículos con producto principal/top pick roto o producto no disponible en tabla.
- No cambiar análisis editorial hasta confirmar si el producto vuelve a estar disponible o si hay sustituto equivalente con ASIN real.
- Cada revisión editorial debe empezar con `npm run audit:amazon -- --article <slug> --delay 2500 --retries 3`.
