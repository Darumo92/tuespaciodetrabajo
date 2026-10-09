# Catálogo de ratones — primer lote

## Atribución visible MICE-03 — candidato local 2026-10-09

MICE-02 cerrada por el padre en `abc870e`, auditoría independiente 4/4;
las menciones a commit pendiente de abajo son evidencia histórica anterior.
MICE-03 añade al selector ES/EN vendedor, enlace público de evidencia y fecha
de consulta de cada oferta (`checkedAt`, día UTC), junto al precio en su moneda
original. `url` de compra se conserva separado de `evidenceUrl`; `updatedAt`
del registro no acredita frescura. Enlaces seguros, foco de teclado y texto
con wrapping, sin precio garantizado, stock universal ni cambio de ranking/CTA.
Ofertas null siguen mostrando solo tramo orientativo, sin atribución heredada.
Checks de este candidato se registran en `odd/tasks/ratones-master3s-anywhere3s.md`.
Pendientes QA visual ES/EN escritorio/móvil, comprobación independiente y commit
del padre; MICE-03 no cerrada ni publicada. Solo la feature tiene autorización
condicional de publicación por el padre, nunca trabajo ajeno/CodeGraph; RDD OFF.

## Auditoría acotada MICE-02 — 2026-10-09

Solo los dos nuevos ratones, no los otros 132 productos. Se registran cuatro
ofertas observadas en navegador público y fechadas con reloj UTC real:
Master ES 146,99 EUR (Univers Club - ES en PcComponentes, estándar 910-006559
con receptor), Master US 257.49 USD (Provantage, Graphite 910-006557 con Bolt),
Anywhere ES 77,95 EUR (Amazon, grafito 910-006929 sin receptor) y Anywhere US
89.99 USD (Logitech, Graphite 910-006925 sin receptor). Todos nuevos y con stock
anunciado en la consulta, no garantía futura; referencias regionales distintas.
Registro completo e intentos: [ofertas 09 oct](../research/ratones-ofertas-2026-10-09.md).

Amazon.es Master mantiene referencias contradictorias; su ASIN sigue null y
el CTA sigue búsqueda exacta. Logitech Master actual vende Bluetooth Edition
sin Bolt: excluida de esta auditoría. Las ofertas US de distribuidor/fabricante
no prueban Amazon US ni OneLink. Precio fijo y ratings YAML siguen null,
`oneLinkReady: false`, dimensiones Master null y USB data sin cambios.
El registro volátil se consume en el selector; las fichas conservan avisos de
afiliación. Auditoría de fuentes corroborada independientemente **4/4** por el
verificador comunicado por el padre; sin refrescar precio o `checkedAt`.
En Master ES y Anywhere US, NewCondition está en el contenedor Product; las
ofertas anidadas prueban importe/moneda/stock y la variante exacta, no incluyen
por sí mismas ese campo de condición. Detalle en el registro de investigación.
La matriz visual original de diez rutas/viewports pasó, pero el selector aún
carece de vendedor, enlace de evidencia y fecha por cotización: **MICE-03 abierto**,
sin PASS comercial UI. MICE-02 es la unidad de datos para commit local previo
al arreglo de presentación MICE-03; no modifica ranking ni destinos afiliados.

MICE-01 ya está en el commit local `24b5221`; las notas de «commit pendiente»
en el handoff anterior son históricas. MICE-02 conserva checkbox abierto:
checks locales observados debajo, commit del padre pendiente; no stage, commit, push o publicación
por este trabajador. RDD global OFF. La publicación de solo esta feature está
condicionada por el padre, excluyendo CodeGraph y todos los cambios ajenos.

### Checks locales de MICE-02 observados

Antes de la corrección mecánica del nombre de fuente de Anywhere: 33 pruebas
focalizadas correctas; suite completa 504/504 en 14 archivos (no repetida aquí);
integridad de ofertas PASS con ES 2/134 y US 2/134; cobertura global FAIL con
264 mercados ausentes de los otros 132 productos. Lectura exacta dos claves ×
ES/US y helper real: 4/4 utilizables al reloj `2026-10-09T19:34:04.104Z`.
Build PASS (463 páginas, 0 conversiones, 17 hashes CSP sin diff de `_headers`);
productos 134 válidos, ratones 22 fichas + 2 catálogos correctos, selector 2
páginas / 134 elegibles y `git diff --check` correcto. No se hicieron escrituras
fuera del alcance ni acciones Git de entrega. La corroboración independiente de
fuentes está completa 4/4; el nombre de fuente se corrige y se repiten checks
focalizados/build. No se traslada el PASS visual original a atribución comercial
UI, todavía pendiente de MICE-03, ni se da el commit del padre por hecho.

Tras la última corrección del nombre de fuente: comando focalizado de ofertas y
ratones 33 PASS; build 463 páginas / cero conversiones / 17 hashes CSP sin diff;
validator ratones 22 fichas + 2 catálogos PASS; integridad ofertas PASS (ES 2/134,
US 2/134, 264 pendientes); `git diff --check` PASS. No se repitió la suite completa
504/504 ni se alteraron importes/fechas. MICE-02 lista para commit local del padre
como unidad de auditoría independiente 4/4; MICE-03 sigue abierto para atribución
comercial visible. Solo se sincronizó evidencia pasiva tras estos comandos.

## Ampliación local 2026-10-09: MX Master 3S y MX Anywhere 3S

El usuario aprueba sustituir el artículo semanal por dos fichas ES+EN, no crear
un artículo MDX. Se han redactado ambos YAML: once ratones y veintidós fichas
localizadas en datos locales. El renderer existente genera los cuatro destinos:
`/catalogo/raton/logitech-mx-master-3s/`, `/catalogo/raton/logitech-mx-anywhere-3s/`,
`/en/catalog/mice/logitech-mx-master-3s/` y `/en/catalog/mice/logitech-mx-anywhere-3s/`.
Son destinos generados y comprobados en el build local, no comprobaciones HTTP
del sitio público ni publicación.

Las fichas separan rueda de pulgar y puesto fijo del Master (141 g) frente al
Anywhere compacto (99 g, 100,5 x 65 x 34,4 mm). Ambos incluyen metodología sin
uso propio, decisiones de compra, límites de Options+ y alternativas existentes.
Anywhere tiene desplazamiento horizontal con botón lateral y rueda, aunque no
rueda de pulgar independiente. Easy-Switch en la base no equivale a Flow.

Master corresponde al consumidor estándar con Bolt y cable de carga en la caja
descrita por soporte, no a la Bluetooth Edition actual sin receptor. Se usa
búsqueda exacta: el anuncio histórico mezcla 910-006559 y 910-006557. Las medidas
de otra edición no se trasplantan. Su USB-C carga pero no transmite datos según
el análisis independiente; `cableDatos: false`. Anywhere grafito 910-006929
conserva B07W4DGLY6 por identidad corroborada, no por oferta actual aprobada;
Bolt compatible pero no incluido y `cableDatos: null`, sin negación no demostrada.

Fuentes consultadas el 2026-10-09 por la investigación previa y reutilizadas por
el autor: [registro compacto](../research/ratones-demanda-2026-10-09.md) y `fuentes`
de cada YAML. Imágenes 300 px verificadas en el handoff. Sin precios fijos, notas,
auditorías de ofertas fabricadas ni aprobación US; OneLink no se declara listo.

Estado de esta ampliación: comprobaciones locales de aceptación completas y lista
para commit local del padre; MICE-01 no se cierra hasta registrar ese commit.
Revisión humana de publicación y acciones remotas pendientes, no publicada.
RED original antes de los YAML: seis fallos esperados y 332 pruebas correctas.
Tras la redacción hubo 337 correctas y un fallo de una aserción errónea que esperaba
`cableDatos: null` en Master. El padre la corrigió a `false` según la evidencia de
carga sin datos, sin alterar el perfil, y comprobó las tres dimensiones estándar
desconocidas. Anywhere conserva `cableDatos: null`. GREEN actual: 338/338 correctas.

### Verificación local observada de MICE-01

- `npx vitest run src/lib/selector/ratones.test.ts src/lib/selector/scoring.test.ts`: 338 pruebas correctas.
- `npm test`: 503 pruebas correctas en 14 archivos.
- `npm run build`: 463 páginas; cero conversiones de imágenes; `public/_headers` sin cambios, 17 hashes CSP.
- `npm run validate:ratones-build`: 22 fichas y 2 catálogos indexables, 2 comparadores noindex, sin pares estáticos.
- `npm run validate:selector-build`: 2 páginas y 134 productos elegibles.
- `npm run validate:productos`: 134 productos válidos.
- `npm run validate:offers`: integridad PASS; ES 0/134 y US 0/134 auditados.
- `npm run validate:offers:coverage`: FAIL esperado, 268 auditorías pendientes (134 ES + 134 US), frente al baseline de 264/132; no es un fallo de implementación de la unidad ni acredita cobertura comercial.
- `git diff --check`: correcto. Lectura del HTML generado de las cuatro fichas: textos ES+EN, encabezados, avisos al comprador, enlaces de fuentes y CTA de búsqueda/directo comprobados.

La evaluación nativa fue alta/no evaluable por archivos sin seguimiento. La
comprobación independiente ordinaria de solo lectura está realizada con RDD
deshabilitado/no gestionado: 11 pruebas de ratones, validator de 22 fichas y 2
catálogos y diff-check correctos, sin bloqueo de productos o integración. Corroboró
la caja estándar de Master frente a Bluetooth Edition y el USB solo de carga.
Su veredicto parcial se debía únicamente a documentación obsoleta, corregida en
esta sincronización. El padre repitió `npx vitest run src/lib/selector/ratones.test.ts`:
11 pruebas correctas. No se repiten pruebas ni build para estos cambios pasivos.

El usuario eligió `feature-branch-chain` antes de commits; el recuento previo a
esta sincronización fue de unas 667 líneas authored, frente a 380 orientativas.
Las dos fichas forman una unidad coherente; no se inventan límites de futuras PR.
Commit local pendiente del padre; publicación y futuras acciones remotas quedan
bajo autorización humana. El escritor premium trabajó en serie: agotó cuota tras
escribir y se retomó el mismo escritor cuando el usuario comunicó su restauración.

## Seguimiento local 2026-10-03 — ofertas y móvil

### Integridad de ofertas, no cobertura comercial

El usuario aprueba separar la estructura del registro de las auditorías comerciales.
`npm run validate:offers` ahora valida registros existentes, fechas, claves y
evidencia sin exigir inventar datos ausentes. El registro permanece vacío, con
`defaultStatus: unaudited`: no hay precios nuevos, intentos, disponibilidad ni
fechas de auditoría fabricados. `updatedAt` es mantenimiento, no prueba comercial.
`npm run validate:offers:coverage` sigue siendo obligatorio para afirmar cobertura:
observado FAIL con 264 errores, 132 productos, ES 0/132 y US 0/132.
La integridad observada es PASS con 264 pendientes; los 133 errores de la validación
anterior siguen siendo evidencia histórica real, no un PASS retroactivo.
Las consultas de Anker y Perixx anteriores no se convierten en auditorías ES/US.

### Corrección móvil verificada, aún sin commit ni publicación

El componente compartido deja encoger el grid y acota imagen/fallback al contenedor,
con lienzo cuadrado y `object-fit: contain`, sin esconder overflow del documento.
RED real en Anker ES: documento de 453 px a viewport 320/390 (la sesión anterior
midió 454 px). GREEN en Anker/Perixx ES+EN y Trust EN a 320/390/760/1440:
20 escenarios con imagen cargada, controles dentro del viewport y documento igual
al ancho cliente (305/375/745/1425 px, descontando scrollbar de 15 px).
Otros 20 escenarios usan sustitución DOM que reproduce el markup del fallback
y su CSS compilado real; texto dentro del lienzo, 15,2 px sin escalado y proporción
1:1. No se afirma fallback automático ante error de red: ese mecanismo no existe.
La página se restauró al terminar. Preview local `http://127.0.0.1:4321/`.

Pruebas nuevas: RED 16 fallos/38 correctas; primer GREEN 54 correctas y prueba
final ampliada 56 correctas. Suite completa 499 correctas; catálogo 132 válido;
build 459 páginas; validadores ratones (18 fichas) y selector (132 elegibles) PASS.
Optimizador: cero conversiones, sin cambios de archivos tracked fuera del alcance.
Sin staging, commits, push, PR, despliegue ni revisión RDD (global OFF).
El padre debe comprobar el candidato y cerrar sus unidades con commits locales;
la cobertura comercial y la aprobación humana de publicación siguen pendientes.

## Ampliación local 2026-10-03: Anker y Perixx, revisión humana pendiente

El usuario sustituye el artículo de esta semana por dos fichas completas ES+EN:
Anker A7852 / AK-98ANWVM-UBA negro con receptor USB-A y Perixx PERIMICE-513N
negro USB-A, referencia 11168 / PM-513N-11168. El catálogo pasa a nueve ratones
y dieciocho fichas localizadas. No se generan pares estáticos ni notas numéricas.

El autor editorial ha redactado ambas fichas sin pruebas propias. Se conservan
las imágenes registradas, contrastadas visualmente con las galerías oficiales.
Perixx se alimenta por USB y transmite datos por su cable de 1,8 m; el modelo 713
inalámbrico y la variante 513 USB-C quedan fuera. Las medidas y pesos sin evidencia
coherente se dejan desconocidos; Anker usa 120 × 62,8 × 74,8 mm corroborados.

El usuario elige búsqueda Amazon del modelo exacto, no CTA con ASIN histórico.
Tramo 1 económico orientativo, sin cortes numéricos nuevos ni precios permanentes.
La comprobación comercial del 3 de octubre no es una auditoría de ofertas ES/US:
no se ha verificado Amazon US ni se han creado registros de ofertas. Se conserva
el aviso de comprobar modelo, precio y disponibilidad junto al CTA porque una
consulta fechada no acredita la oferta que encontrará cada comprador después.

### Registro compacto de fuentes y límites (consulta 2026-10-03)

| Afirmación | Fuente exacta | Confianza y alcance |
|---|---|---|
| Anker: dos AAA no incluidas, 800/1200/1600 DPI, reposo de ocho minutos y reactivación con clic principal; avance/retroceso no funcionan en Mac OS X. | https://www.anker.com/ca/products/a7852 | Alta, especificaciones oficiales; reposo no equivale a autonomía. |
| A7852/A7852011 negro, diestro y medidas métricas 120 × 62,8 × 74,8 mm. | https://anker.com.sg/products/anker-2-4g-wireless-vertical-mouse-ergonomic-optical-a7852 | Alta para identidad y valores métricos corroborados; otros campos oficiales en pulgadas discrepan. Peso no confirmado. |
| AK-98ANWVM-UBA corresponde al Anker inalámbrico A7852. | https://www.hardwarezone.com.sg/pc/accessories/anker-wireless-ergonomic-vertical-mouse-review | Media, identificación de SKU anterior; no extrapolar comodidad a la oferta actual. |
| Anker inalámbrico, controles y receptor. | https://www.tomsguide.com/computing/peripherals/anker-2-4g-wireless-vertical-ergonomic-mouse-review | Media, análisis independiente del modelo; no prueba propia. |
| Acabado y apoyo de pulgar; un autor encontró fricción en rueda y acceso difícil al control superior. | https://www.digitalcameraworld.com/tech/anker-wireless-vertical-ergonomic-mouse-review | Baja para comodidad universal; experiencia atribuida que sirve para proponer comprobaciones. |
| Perixx: cable de 1,8 m, USB y orientación a manos medianas/grandes. | https://eu.perixx.com/products/perimice-513 | Alta para especificaciones declaradas, no talla garantizada. |
| USB-A negro PM-513N-11168, código 4049571651316, distinto de USB-C PM-513C-12290. | https://eu.perixx.com/products/perimice-513.js | Alta para identidad de variante; la foto principal USB-C no identifica el USB-A. |
| Modelo 513 con alimentación USB, seis controles y 1000/1600 DPI; pilas y reposo pertenecen al 713. | https://downloads.perixx.com/manuals/PERIMICE-513_E_Manual.pdf | Alta, páginas 4–6 leídas visualmente; dimensiones/peso discrepantes quedan desconocidos. Imagen promocional con tres DPI excluida. |
| Un propietario documenta desplazamiento irregular y polvo al desmontar su unidad. | https://racedorsey.com/posts/2026/perixx-vertical-mouse-stuttering-scroll-wheel/ | Baja, caso individual; no tasa de fallos ni recomendación de abrir el ratón. |
| Imagen registrada de Anker coincide con A7852011. | https://m.media-amazon.com/images/I/51dXoPgdyfL._AC_SL300_.jpg | Alta para correspondencia visual, no disponibilidad de la oferta. |
| Imagen Perixx registrada coincide con galería USB-A oficial. | https://m.media-amazon.com/images/I/51N0cWqT93L._AC_SL300_.jpg y https://cdn.shopify.com/s/files/1/0532/6186/1024/files/perimice-513-wired-ergonomic-vertical-mouse-745503.jpg?width=800 | Alta para correspondencia visual; no usar el hero USB-C ni la gráfica de DPI errónea. |
| Anker Wireless negro: 15,99 EUR, IVA aplicable incluido, oferta anticipada exclusiva Prime, en stock; AnkerDirect ES, envío Amazon. | https://www.amazon.es/dp/B00BIFNTMC?th=1 | Alta para lo mostrado en navegador el 03 oct a las 11:30 CEST; no precio general sin Prime ni oferta permanente. |
| Perixx negro Con Cable-Diestros: 17,99 EUR, IVA aplicable incluido, en stock; Perixx ES, envío Amazon. | https://www.amazon.es/dp/B00GZIA2AE?th=1 | Alta para oferta principal mostrada el 03 oct a las 11:30 CEST; identidad USB-A corroborada por el registro y fabricante. No usar los 24,81 EUR del widget anterior. |

El navegador activo fue autorizado por el usuario y mostraba personalización de
entrega; no se presenta como comprobación anónima aislada ni como disponibilidad
universal. No se accedió a credenciales, login, cuenta, cesta o compra. La denegación
de crear otro contexto no impedía usar la conexión MCP real. Reddit y RTINGS no
aportaron cuerpos verificables y no sustentan afirmaciones públicas.

### Integración y cierre local

- Rama `feat/ratones-anker-perixx`, base `92ea30b`; commits locales `bc69035` (USB, 3 archivos, +14/-3 = 17 líneas) y `d777ca9` (pareja e integración, 15 archivos, +744/-22 = 766 líneas). Total de implementación antes de este cierre documental: +758/-25 = 783 líneas. Sin push, PR, merge ni despliegue.
- Prerrequisito USB con test-first observado: 2 fallos / 66 pruebas correctas antes; 68 correctas después. No se activó TDD estricto ni RDD (global OFF).
- Regresiones para nueve ratones, búsqueda exacta, selección por cable de Perixx e incompatibilidad de Anker, pesos desconocidos y ausencia de precios/notas inventados.
- Comparativa ES+EN enlazada a las fichas, medidas de Anker corregidas y sus dos CTA alineados con búsqueda exacta; sin tocar fechas de publicación o actualización.
- Baseline de `validate:offers` observado antes de integrar: 132 productos y 133 errores, porque los dos YAML ya existían. Histórico anterior: 130 productos / 131 errores. No ocultar las dos auditorías nuevas pendientes.
- Evaluación nativa de solo lectura: riesgo alto/no evaluable por inventario sin seguimiento; se aplicó la vía de comprobación independiente para riesgo alto sin activar RDD (global OFF). Verificador independiente: 402 pruebas focalizadas, 132 productos, validadores de ratones/selector, whitespace y lectura de cuatro rutas correctos; sin bloqueo causado por el candidato. El padre revisó USB y texto de Perixx, añadió la aserción de presencia del aviso al comprador y repitió validator de ratones y diff-check, ambos correctos. Evidencia completa en `odd/tasks/ratones-anker-perixx.md`.
- QA local: 402 pruebas focalizadas y 479 totales correctas; 132 productos válidos; build de 459 páginas; validadores de ratones (18 fichas) y selector (132 elegibles) correctos. Ofertas sigue fallando con los mismos 133 errores del baseline observado.
- Preview ES/EN HTTP 200, imágenes y CTA correctos, y Perixx aparece segundo en la selección por cable mientras Anker queda fuera de los tres resultados. Incidencia móvil heredada: ancho de documento 454 px a viewport de 390 px en las cuatro fichas y también en Trust EN; sin desbordamiento a 1440 px. El componente compartido está fuera del alcance autorizado y no se ha modificado. Entrega parcial, no QA completo.
- USB queda terminado con prueba RED/GREEN, comprobación independiente y commit. La pareja queda parcial por los 133 errores obligatorios de ofertas y la aceptación humana de publicación pendiente; el desbordamiento heredado es un seguimiento separado. El commit local conserva el trabajo, no autoriza publicar ni equivale a aprobar ofertas.
- Límites de rollback: `d777ca9` retira solo la pareja y su integración/documentación, conservando USB; para retirar `bc69035` deben retirarse primero sus dependencias. El cierre documental posterior se reconcilia aparte. No se ha ejecutado rollback ni se han alterado cambios ajenos de backlinks/recovery, `opencode.json` o `.atl/`.
- Este último cierre solo modifica los dos documentos de evidencia. No se repiten pruebas funcionales ni build para prosa pasiva; siguen vigentes las 479 pruebas y 459 páginas porque el cambio final del padre fue la aserción del validator y documentación. Se mantiene preview en `127.0.0.1:4321`, sin exposición remota ni nuevas consultas.

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
