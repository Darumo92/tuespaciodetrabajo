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

1. ~~`mejor-monitor-trabajar-desde-casa` — revisar `LG 27UP850N-W` (`B0B9C8VV4X`)~~ → **RESUELTO 2026-05-16**: sustituido por LG 27UP85NP-W (B0CRL6TSW8, €389, en stock)
2. ~~`mejor-silla-ergonomica-calidad-precio` — revisar `FlexiSpot C7 Lite` (`B0F6WBL3M2`)~~ → **RESUELTO 2026-05-24**: sustituido por FlexiSpot C7 Lite gris (`B0F6XL3SFG`, €249.99, en stock) y ajustado el texto editorial para no prometer "malla completa".
3. ~~`mejor-silla-oficina-menos-200-euros` — revisar `FelixKing Silla Ergonómica` (`B0D8HWL8VP`)~~ → **RESUELTO 2026-05-16**: sustituido por TONFARY Silla Ergonómica (B0D8K66SJ3, €179.99, en stock)
4. ~~`mejor-soporte-monitor-brazo-articulado` + `novedades-home-office-2026` — revisar `ErGear Soporte Monitor` (`B0FQM6QB48`)~~ → **RESUELTO 2026-05-24**: sustituido por ErGear 13-34" (`B0C7KPNP7T`, €26.99, en stock), hasta 10 kg.
5. ~~`mejor-lampara-escritorio-led` — revisar `Xiaomi Mi LED Desk Lamp 1S` (`B07XHCDR3M`)~~ → **RESUELTO 2026-05-24**: ASIN no disponible retirado. La compra recomendada pasa a SLATOR (`B07ZCY9XZ9`, en stock) por prestaciones verificadas, y la Xiaomi disponible queda como LED Desk Lamp 2 (`B0DBHNYP8N`, €50.24, en stock) con copy conservador.
6. ~~`home-office-productivo-500-euros`, `mejor-silla-ergonomica-calidad-precio`, `mejor-silla-oficina-menos-200-euros`, `silla-gaming-vs-ergonomica`, `novedades-home-office-2026` — revisar `SIHOO M18` (`B07GNDDNMW`)~~ → **RESUELTO 2026-05-24**: enlaces activos sustituidos por SIHOO M102C (`B0CLLRNFB8`, €189.99, en stock). Se conservaron menciones históricas a M18 solo como experiencia/anécdota, sin CTA al ASIN no disponible.

## Productos solo cache, sin revisión editorial

- `mejor-soporte-monitor-brazo-articulado` — `Amazon Basics Brazo Monitor` (`B07DHK5DHN`): precio API 23,09 EUR, en stock. No editar MDX solo por precio.
- `mejor-soporte-monitor-brazo-articulado` — `ErGear Soporte Monitor Dual` (`B0C7KQ7MX8`): precio API 41,99 EUR, en stock. No editar MDX solo por precio.
- `home-office-productivo-500-euros` + `mejor-silla-ergonomica-calidad-precio` — `Durrafy Silla de Oficina` (`B0C3BZHVK8`): precio API 99,45 EUR, en stock. No editar MDX solo por precio salvo que se revise el presupuesto completo.

## Ritmo recomendado

- Revisar 1-2 artículos editoriales por semana como máximo.
- Priorizar artículos con producto principal/top pick roto o producto no disponible en tabla.
- No cambiar análisis editorial hasta confirmar si el producto vuelve a estar disponible o si hay sustituto equivalente con ASIN real.
- Cada revisión editorial debe empezar con `npm run audit:amazon -- --article <slug> --delay 2500 --retries 3`.
