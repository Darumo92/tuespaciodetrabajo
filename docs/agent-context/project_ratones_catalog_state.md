# Catálogo de ratones — primer lote

## Ampliación 2026-09-30 — dos fichas ES+EN con vista previa humana aceptada

ProtoArc EM11 NL y Trust Verto Wireless (modelo 22879) se añaden al catálogo
existente, hasta siete ratones y catorce fichas localizadas. El selector conserva
cuatro preguntas y no se generan pares estáticos ni notas editoriales numéricas.
Las fichas se basan en páginas oficiales y en imágenes registradas comparadas
visualmente con las oficiales; no son pruebas de uso. El esquema distingue las
dos pilas AAA de Trust de una pila AA. Bluetooth y USB-C del ProtoArc no implican
uso por cable: USB-C es para cargar, y los botones laterales no funcionan en macOS.

El usuario pidió mantener CTA comercial con los ASINs históricos B0D12PGGKK y
B07FM2GLNQ, aunque la oferta, la variante y la disponibilidad actuales de
Amazon.es no pudieron confirmarse. Tampoco se han confirmado precios actuales
ni si las pilas AAA de Trust están incluidas. La vista previa humana se revisó
y el usuario pidió subir los cambios a main; la verificación comercial de ambas
ofertas sigue pendiente y las fichas advierten de esa incertidumbre junto al
CTA. El push a main aún no se ha hecho: sigue pendiente de autorización
explícita de credenciales/sesión remota. El registro independiente `product-offers.json` ya
estaba vacío y caducado antes de estas dos fichas: `validate:offers` no debe
considerarse aprobado si sigue fallando.

## Internal source ledger — 2026-09-30 buyer guidance

This ledger supports only the new ProtoArc EM11 NL and black Trust 22879
profiles. Manufacturer statements are attributed, and individual observations
are not treated as a measured rate or universal fit guarantee. Consultation date
for every row: **2026-09-30**. No hands-on testing was performed by this site.

| Claim used in ES/EN | Exact source URL | Confidence / scope |
|---|---|---|
| ProtoArc targets small/medium hands under 7.5 in (about 19 cm), describes quiet primary clicks, three devices and USB-C charging. | https://www.protoarc.com/products/em11-nl-vertical-mouse | High for the manufacturer's stated design target and features; not an individual fit or sound measurement. |
| ProtoArc EM11 NL wheel is stepped, side buttons cannot be programmed and forward/back do not function on macOS; NL lacks the EM11's RGB. | https://www.protoarc.com/pages/faq-em11-nl-em11 | High for official support statements about the named models. |
| EM11 NL has an underside channel switch and receiver-storage slot; reviewer heard wheel/side buttons more than main clicks. | https://www.yugatech.com/gadget-reviews/protoarc-em11-nl-vertical-ergonomic-mouse-review/ | Medium for controls; low for one reviewer's subjective sound impression, not measured or universal. |
| EM11 NL switches between two Bluetooth channels and USB receiver from its underside; Mac browser forward/back limitation corroborated. | https://appleinsider.com/articles/25/08/05/protoarc-em11-nl-vertical-mouse-review-a-low-cost-step-to-an-ergonomic-workspace | Medium, one hands-on account consistent with official FAQ; its adaptation story is not generalized. |
| Trust black 22879 lists 60-degree shape, adjustable 800/1200/1600 DPI, storable USB receiver and on/off switch. | https://www.trust.com/en/product/22879-verto-wireless-vertical-ergonomic-mouse | High for model-specific manufacturer specifications, not comfort outcomes. |
| Trust 22879 receiver is uniquely paired without an official replacement; no supported button-remap utility; DPI selection has no visual indicator; standby has no stated delay. | https://support.trust.com/en/support/solutions/articles/9000240080-verto-ergonomic-wireless-mouse-22879 | High for official model-specific support policy; avoid third-party remap guarantees and numeric standby claims. |
| Black Trust model 22879: individual buyers mention wheel/thumb-button reach with small hands. | https://www.ldlc.com/en/product/PB00251115.html | Low: isolated translated purchaser reviews; prompts a fit check, not a size threshold or failure rate. |
| Trust model 22879 listing and purchaser impression mention size; its power data conflicts internally with the two-AAA requirement. | https://www.coolblue.nl/en/product/816621/trust-verto-wireless-ergonomic-mouse.html | Low for fit; conflicting rechargeable/AAA listing fields are excluded from product claims. |

Excluded from both profiles: disputed ProtoArc Bluetooth version, standby as
battery life, fixed adaptation time, health relief, broad reliability patterns,
Trust weight or batteries-in-box assertions, white Trust variants, and any
current Amazon.es offer/stock inference. Exact-model Reddit posts were not
available as verifiable evidence.

## Estado 2026-09-18 — implementado y verificado en local

El usuario aprobó cinco productos e integración completa. Implementación terminada:
diez fichas ES+EN, dos listados indexables y dos comparadores interactivos noindex,
cero pares estáticos de ratón. Verificado en local con 473 pruebas, build limpio,
dos scripts de validación de build, y navegador (filtros, imágenes, selector, ficha).
Sin commit ni push: pendiente de revisión humana y aprobación para publicar.

- Fichas: logitech-lift, logitech-mx-vertical, logitech-mx-master-4,
  logitech-signature-m650, lamzu-maya-x (ES+EN, sin notas numéricas).
- Ruta EN `mice`; selector con preguntas de mano/formato/conexión/prioridad.
- Comparativa `mejor-raton-vertical-ergonomico` ES+EN corregida: retirados relatos
  de uso no documentados, promesas médicas y cifras; corregidos DPI del ProtoArc
  (1000/1600/2400, USB-C solo carga) y pilas AAA no incluidas del Anker. Enlaza a
  fichas y selector. `actualizadoEn: 2026-09-17`.
- La guía nueva ES+EN (cómo elegir ratón) sigue pendiente y requiere su SERP.

## Estado 2026-09-17 (previo)

El usuario aprueba comenzar el siguiente catálogo con cinco productos, tras la
recomendación de abrir ratones para teletrabajo. Cadencia propuesta y aceptada como
orientación editorial: cinco iniciales y después dos o tres por semana, con revisión
a las tres o cuatro semanas. No es un umbral de Google ni garantiza indexación.

## Evidencia de indexación consultada el 17 sep

- GSC `/catalogo/silla/sihoo-m57/`: Google no reconoce la URL.
- GSC `/guias/como-elegir-escritorio-estudiar/`: rastreada sin indexar; último
  rastreo 2026-09-08T13:36:12Z, fetch correcto, robots/indexación permitidos,
  canonical declarada y elegida coincidentes.
- Search Analytics por página 01–15 sep: home ES 5 impresiones, home EN 4;
  cero clics en ambas. No confundir este informe con un recuento global indexado.
- Referencia: https://developers.google.com/crawling/docs/crawl-budget

## Amazon: API bloqueada; verificación manual disponible

`node scripts/amazon-lookup.mjs B07FNHV4MW B07W4DGC27` obtiene token pero
`getItems` devuelve HTTP 403, `AssociateNotEligible`: la cuenta no cumple actualmente
los requisitos de elegibilidad. No se han cambiado credenciales ni cache.

Fallback realizado: búsquedas internas y páginas de producto Amazon.es con
Playwright. Estos cinco candidatos mostraban `En stock` el 17 sep. Los precios son
observaciones fechadas, no valores aprobados para fijar en las fichas.

| Candidato | ASIN verificado | Precio observado | Papel propuesto |
|---|---|---|---|
| Logitech Lift, gris, versión estándar | B07W4DGC27 | 49,95 EUR | Vertical para manos pequeñas/medianas |
| Logitech MX Vertical | B07FNHV4MW | 59,99 EUR | Segundo tamaño/formato vertical |
| Logitech MX Master 4, negro, estándar | B0FHHSZ8WM | 129,97 EUR | Productividad avanzada |
| LAMZU MAYA X, negro | B0DFGYHVPZ | 129,90 EUR | Ligero; modelo de uso propio documentado |
| Logitech Signature M650, gris, pequeño/mediano | B07W6G822T | 30,95 EUR | Convencional económico |

URLs verificadas: `https://www.amazon.es/dp/` + cada ASIN de la tabla.
Las imágenes principales de Lift, Master 4, MAYA X y M650 cargaron con
`naturalWidth > 0`. Del MX Vertical se obtuvo la imagen, pendiente de comprobación
visual final. Todas requieren comprobación de correspondencia visual y formato
300 px al preparar el contenido. No reutilizar imágenes antiguas sin comprobar.

Fuentes oficiales consultadas:
- https://www.logitech.com/es-es/products/mice.html — listado vigente, incluye
  Lift, MX Vertical, MX Master 4 y Signature M650.
- https://lamzu.com/products/lamzu-maya-x — modelo y variantes; algunas variantes
  agotadas en tienda oficial aunque Amazon mostraba stock del negro.

Falta investigación detallada de specs/manuales, compatibilidad, contenido de caja
y variantes. No asumir que el receptor 8K viene incluido con un ASIN sin verificar.
Forma simétrica no implica botones ambidiestros. Las fichas de variantes estándar,
Mac, Business, L y zurdos no se deben mezclar.

## Arquitectura observada y propuesta

- `src/content/config.ts`: productos solo admite `silla` y `escritorio`.
- `src/lib/tipos.ts`: registro de configuración para filtros, fichas y comparador.
- `src/lib/productos.ts`: rutas ES/EN, formatos y selección de pares.
- `src/lib/selector/config.ts`: recomendador configurable por tipo.
- Rutas dinámicas en `src/pages/catalogo/`, `src/pages/[locale]/catalog/` y
  sus equivalentes `comparar`/`compare`.
- Las rutas `[par].astro` generan pares automáticamente para cada tipo registrado;
  los listados y comparadores también publican enlaces a esos pares. Se necesita
  desactivar generación Y enlaces de pares para ratones en este primer lote.
- El comparador interactivo de categoría ya utiliza `noindex`.

Propuesta recomendada: reutilizar catálogo, fichas y comparador con tipo `raton`
(EN `mouse`), filtros propios y cinco fichas ES+EN. Integrar preguntas del selector
basadas en lateralidad, formato y conexión, con datos desconocidos explícitos.
Especificaciones objetivas y razones editoriales, sin inventar puntuaciones de
comodidad, precisión o prevención de lesiones.

Huella objetivo del catálogo: diez fichas + dos listados = doce URLs indexables;
dos comparadores interactivos adicionales con noindex. Selector existente
actualizado, sin URL nueva. Cero pares estáticos de ratón. Confirmar con el build
y sitemap reales durante implementación.

Alternativas consideradas: cinco fichas aisladas (menor trabajo pero poca utilidad
para elegir); categoría completa con pares automáticos (más URLs sin necesidad).

## Corrección editorial necesaria al conectar el artículo existente

`mejor-raton-vertical-ergonomico.mdx` conserva afirmaciones de uso propio del MX
Vertical, despacho de 9 m², lesiones, citas del fisio y testimonios de terceros que
contradicen la persona canónica o carecen de respaldo. La fuente canónica confirma
LAMZU MAYA X 8K y niega propiedad del MX Vertical. No trasladar esas afirmaciones
a las fichas. Revisar también la pareja EN al añadir enlaces al catálogo, retirando
afirmaciones no verificadas y comprobando fuentes y specs afectadas.

## Siguiente paso

Confirmar selección e integración propuestas, redactar especificación técnica y
plan de implementación. Después verificar fuentes completas, crear fichas ES+EN,
corregir la comparativa enlazada, humanizar contenido, ejecutar pruebas de rutas,
filtros/selector y build con CSP, y comprobar doce URLs indexables nuevas.
