# Auditoría comercial acotada de ratones — 2026-10-09

## Alcance y método

Solo `logitech-mx-master-3s` y `logitech-mx-anywhere-3s`, mercados ES/US.
Nueve intentos de producto/fuente y una página de catálogo para localizar el
distribuidor US; después, lectura dirigida de variante y caja. No se auditan
los otros 132 productos. Navegador público autorizado, sin iniciar sesión,
cambiar entrega/configuración, acceder a cuenta/cookies ni tocar cesta/compra.
Amazon mostraba un contexto de entrega ya existente: no es una comprobación
anónima aislada ni stock universal. No se conserva información personal.

Los cuatro `checkedAt` siguientes proceden de `date -u +%Y-%m-%dT%H:%M:%SZ`
inmediatamente después de leer la evidencia; no de una hora inventada. Consulta:
9 de octubre de 2026. Precio y stock son observaciones de ese momento, no promesas.
Los resultados del buscador solo localizaron fuentes, nunca acreditaron ofertas.

## Ofertas admitidas

| Producto / mercado | Variante exacta y caja | Oferta, condición y stock observado | Vendedor / tipo | Fuente de compra y evidencia | `checkedAt` |
|---|---|---|---|---|---|
| Master 3S / ES | Consumidor estándar grafito `910-006559`; receptor incluido y compatibilidad Logi Bolt en especificaciones. No Bluetooth Edition, Mac ni Business. | **146,99 EUR**, nuevo (`itemCondition: NewCondition`); entrega anunciada 15–16 octubre y `InStock` en la oferta estructurada. No usar el agregado «desde 130» ni el total del bundle. | **Univers Club - ES**, marketplace PcComponentes / `retailer`; no vendido por PcComponentes directamente. | https://www.pccomponentes.com/logitech-mx-master-3s-performance-raton-inalambrico-funciona-sobre-cristal-clics-silenciosos-usb-c | `2026-10-09T19:29:28Z` |
| Master 3S / US | Consumidor estándar **Graphite `910-006557`**, referencia regional distinta de ES; página indica PC/Mac y caja con ratón, **Logi Bolt USB Receiver**, cable USB-A a USB-C y documentación. No se afirma igualdad de SKU regional. | **257.49 USD**, **Factory New** visible y `NewCondition` estructurado; **4 IN STOCK**. Precio elevado pero realmente mostrado, no convertido desde EUR ni sustituido por uno recordado. | **Provantage** / `distributor`; la página declara «authorized Logitech dealer» y domicilio US. | https://www.provantage.com/logitech-910-006557~7LOG91P9.htm | `2026-10-09T19:31:21Z` |
| Anywhere 3S / ES | Consumidor estándar **Grafito `910-006929`**, ASIN `B07W4DGLY6`; modelo y referencia fabricante coherentes. Caja: ratón, cable USB-A a USB-C y documentación, **sin receptor**. | **77,95 EUR**, **Comprar nuevo**, **En stock**. No usar el importe de segunda mano. | **Amazon**, remitente/vendedor visible / `amazon`. | https://www.amazon.es/dp/B07W4DGLY6?th=1 | `2026-10-09T19:29:01Z` |
| Anywhere 3S / US | Consumidor estándar **Graphite `910-006925`**, selección explícita Graphite en tienda US; no Black `910-006928`, Pale Grey, Mac ni Business. Caja: ratón, cable USB-A a USB-C y documentación, **sin receptor**. SKU regional distinto de ES. | **89.99 USD**, `NewCondition` estructurado; **Low stock. Order before it's gone!** visible y botón de compra habilitado, sin accionarlo. | **Logitech** / `official`. | https://www.logitech.com/en-us/shop/p/mx-anywhere-3s.910-006925 | `2026-10-09T19:30:19Z` |

## Intentos reales y evidencia excluida

| Producto / mercado / clase | Consulta o URL real | Resultado y límite |
|---|---|---|
| Master / ES / `amazon` | https://www.amazon.es/dp/B07W5JKHFZ?th=1 | 99,00 EUR, «Comprar nuevo», dos unidades, vendedor Luxario197. **No admitida**: modelo/parte `910-006559`, referencia fabricante `910-006557`, caja solo «1 batería». Persiste la atribución contradictoria; no convertir el ASIN en CTA directo. |
| Master / ES / `official` | https://www.logitech.com/es-es/shop/p/mx-master-3s → https://www.logitech.com/es-es/shop/p/mx-master-3s.910-007501 | Redirige a **Edición Bluetooth**, otra caja. No trasplantar su precio al estándar con Bolt. |
| Master / ES / `retailer` | Búsqueda «Logitech MX Master 3S 910-006559 PcComponentes» → URL admitida arriba | P/N, grafito, receptor, vendedor, precio visible y condición nueva estructurada corroborados. No se inventa intento de distribuidor ES; se cierra con una oferta real de retailer, no con `unavailable`. |
| Anywhere / ES / `amazon` | https://www.amazon.es/dp/B07W4DGLY6?th=1 | Primera fuente suficiente: oferta nueva exacta admitida. No se registran intentos oficiales/distribuidor/retailer que no se realizaron. |
| Master / US / `amazon` | https://www.amazon.com/dp/B09HM94VDS?th=1 | `910-006557`, caja con Bolt; «No disponible por el momento» en el contexto mostrado, sin oferta utilizable. **No acredita ausencia en todo US** ni permite marcar mercado `unavailable`. |
| Master / US / `official` | https://www.logitech.com/en-us/shop/p/mx-master-3s → https://www.logitech.com/en-us/shop/p/mx-master-3s.910-007500 | **Bluetooth Edition**, caja visible solo Mouse + User documentation. Variante excluida. |
| Master / US / `distributor` | Búsqueda `site:provantage.com "910-006557"` → https://www.provantage.com/logitech-computer-accessories~50HEQPT_LGTC.htm → https://www.provantage.com/logitech-910-006557~7LOG91P9.htm | Catálogo enlaza al producto exacto; página final suficiente para oferta admitida. No se inventa intento retailer US. |
| Anywhere / US / `amazon` | https://www.amazon.com/dp/B0BPY4ZQXG?th=1 | No puede enviarse al destino activo; sin precio/vendedor comprable corroborado. Además, modelo `910-006925` pero caja dice Anywhere **3** con receptor USB: campo contradictorio excluido. No cambiar código postal ni inferir ausencia US. |
| Anywhere / US / `official` | https://www.logitech.com/en-us/shop/p/mx-anywhere-3s → Black `910-006928`; selección pública **Graphite** → URL admitida arriba | Se esperó la actualización visible a Color Graphite; 89.99 USD y low stock corresponden a esta selección, no a Black. «In the Box» leído sin receptor; JSON-LD identifica Graphite y NewCondition. |

Todas estas consultas son del 2026-10-09, dentro de la ventana observada
`19:28:34Z`–`19:31:21Z` (timestamps de las navegaciones y reloj UTC). No hay
precios basados únicamente en snippets, condiciones inferidas de una foto,
CAPTCHA sorteado, ausencia deducida de un bloqueo ni intentos ficticios.

## Separación de evidencia y afiliación

La oferta ES Master es de marketplace, la US de distribuidor. La oferta US
Anywhere es oficial. Ninguna prueba demuestra el destino de OneLink ni una
oferta Amazon US aprobada. Se conservan `oneLinkReady: false`, ASIN Master null
y su búsqueda exacta; ASIN Anywhere ES sigue siendo `B07W4DGLY6`.
Las advertencias sobre la oferta encontrada al comprar siguen necesarias.
Las cifras viven solo en `src/data/product-offers.json`: precio fijo y ratings
YAML continúan null. No se modifican dimensiones Master ni USB data de ninguno.

## Corroboración independiente acotada — 4/4

El padre comunica la corroboración por el verificador independiente de las
cuatro ofertas exactas. Esta nota registra ese resultado, no una nueva consulta
del writer ni un refresco de `checkedAt`, precio o stock en el registro.

| Mercado / producto | Evidencia independiente y ubicación de condición |
|---|---|
| ES / Master | JSON-LD del **Product** con `mpn: 910-006559` y `itemCondition: NewCondition`; **Offer anidado** de 146.99 EUR, Univers Club - ES, InStock. La condición pertenece al contenedor Product, no al Offer anidado. |
| US / Anywhere | JSON-LD del **Product** con `itemCondition: NewCondition`; **ProductModel anidado Graphite 910-006925** con Offer de 89.99 USD, InStock. La condición procede del contenedor Product, no de un campo de condición dentro de ese Offer. |
| US / Master | Provantage muestra **Factory New**, cuatro unidades y 257.49 USD para 910-006557. No se cambia a un SKU ES ni se deduce una oferta Amazon US. |
| ES / Anywhere | Amazon muestra **Comprar nuevo**, 77,95 EUR y vendedor Amazon para 910-006929. Se conservan los límites del contexto de entrega; no equivale a stock universal. |

Las fuentes exactas y fechas originales siguen en la tabla de ofertas admitidas.
La auditoría de fuentes MICE-02 está corroborada 4/4, pero **no hay PASS comercial
de interfaz**: mostrar vendedor, enlace de evidencia y fecha por oferta en el
selector ES/EN es la corrección separada **MICE-03**, todavía abierta.

## Verificación y entrega

Checks observados tras el último cambio de datos/YAML/tests:

- `npx vitest run src/lib/product-offers.test.ts src/lib/selector/ratones.test.ts`: **33 PASS**, 2 archivos.
- `npm run validate:offers`: **PASS**, 134 productos, ES 2/134, US 2/134, 264 pendientes.
- `npm run validate:offers:coverage`: **FAIL esperado**, exactamente 264 auditorías ausentes de los otros 132 productos; no cobertura global aprobada.
- Lectura directa de las claves reales por el writer y ejecución de `isUsableProductOffer` / `getProductOffer` del módulo actual (transpilado con esbuild sin escribir archivos): **4/4 utilizables** al reloj real `2026-10-09T19:34:04.104Z`, exactamente dos slugs y ES/US en cada uno. Es autoverificación, distinta de la corroboración independiente anterior.
- `npm test`: **504 PASS**, 14 archivos.
- `npm run build`: **PASS**, 463 páginas, 0 conversiones de imágenes, 17 hashes CSP; `public/_headers` sin diff.
- `npm run validate:productos`: **PASS**, 134 productos.
- `npm run validate:ratones-build`: **PASS**, 22 fichas + 2 catálogos indexables, 2 comparadores noindex, sin pares.
- `npm run validate:selector-build`: **PASS**, 2 páginas, 134 productos elegibles.
- `git diff --check`: **PASS**.

El preflight de imágenes primero falló por directorio opcional inexistente
`public/images/productos`; al omitir directorios ausentes como el optimizador
real, confirmó cero escrituras necesarias. No se cambió el optimizador ni imágenes.

Estos checks corresponden al candidato anterior a la corrección mecánica del
nombre de fuente Amazon en Anywhere. Las 504 pruebas de suite completa son
evidencia previa: no se afirma una nueva ejecución de toda la suite aquí.
Los checks focalizados/build se repiten después de ese último cambio de fuente.
MICE-02 conserva checkbox abierto hasta el commit local del padre, como unidad
de datos separada y anterior al arreglo UI MICE-03. La matriz visual original
de diez rutas/viewports pasó para fichas, imágenes y foco, pero no acredita
atribución comercial de las nuevas cotizaciones: vendedor/fuente/fecha en el
selector siguen pendientes en MICE-03. Publicación y acciones Git remotas
pertenecen al padre. No se aprueban los otros 264 mercados pendientes.

### Repetición tras la corrección mecánica de fuente

- `npx vitest run src/lib/product-offers.test.ts src/lib/selector/ratones.test.ts`: **33 PASS**, 2 archivos.
- `npm run build`: **PASS**, 463 páginas, 0 conversiones de imágenes, 17 hashes CSP; `public/_headers` sin diff.
- `npm run validate:ratones-build`: **PASS**, 22 fichas + 2 catálogos indexables, 2 comparadores noindex, sin pares.
- `npm run validate:offers`: **PASS**, ES 2/134, US 2/134 y 264 mercados pendientes.
- `git diff --check`: **PASS**.

No se repite la suite completa ni se refresca ningún dato comercial; solo se
añade esta evidencia pasiva después de los comandos. Unidad de auditoría MICE-02
lista para commit local del padre, sin cerrar el arreglo UI MICE-03.
