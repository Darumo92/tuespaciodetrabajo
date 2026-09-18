# Catálogo de ratones: diseño aprobado

El usuario aprobó el 17 de septiembre los cinco modelos y la integración descrita
en `docs/agent-context/project_ratones_catalog_state.md`.

## Entrega

Añadir el tipo `raton` al catálogo existente, con ruta inglesa `mice` coherente
con el plural `chairs`. Cinco productos: Logitech Lift, MX Vertical, MX Master 4,
LAMZU MAYA X y Signature M650 estándar pequeño/mediano. Cada YAML contiene texto
ES y EN, medidas verificadas, fuentes fechadas, ventajas, límites y casos de uso.

Reutilizar fichas, filtros, comparación interactiva y selector. Mostrar formato,
lateralidad, medidas, peso, conectividad y alimentación. No asignar notas
numéricas sin metodología: las cinco fichas parten con valoraciones nulas.
El selector usa criterios de compatibilidad y preferencias, no supuestas pruebas.
Datos desconocidos permanecen nulos. Simetría del cuerpo no equivale a botones
ambidiestros ni permite recomendar un modelo diestro para zurdos.

## URLs

Diez fichas ES+EN y dos listados: doce nuevas URLs indexables. Dos comparadores
interactivos noindex. No generar pares estáticos ni enlaces hacia pares para
ratones. El control se aplica en la selección compartida de pares para cubrir
tanto rutas como enlaces. Sitemap y hreflang usan la misma localización `mice`.

## Fuentes y comercio

Amazon Creators API devolvió AssociateNotEligible. Las páginas Amazon.es se
verificaron manualmente: ASINs y observaciones en el handoff. Mantener precios
volátiles fuera del texto editorial; no presentar precio español como precio
estadounidense. Usar imágenes Amazon verificadas a 300 px y fuentes oficiales
para especificaciones. Cuando falte un dato no rellenarlo por inferencia.

## Integridad editorial

Corregir afirmaciones no respaldadas de experiencia y salud en la comparativa
vertical existente ES+EN al conectarla con las fichas. Solo está documentado el
uso propio del MAYA X, sin resultados ni duración añadidos. Conservar las URLs
del artículo, humanizar ambos idiomas y actualizar su fecha de modificación
porque se revisa realmente el contenido. La guía nueva se prepara después.

## Comprobación

Pruebas de rutas/localización, pares desactivados y selector con datos nulos y
preferencias incompatibles. Build completo con CSP, revisión de sitemap (doce
URLs indexables), canonical/hreflang y ausencia de pares. Navegación local ES+EN,
filtros, comparación y selector en móvil y escritorio. Sin commit/push hasta que
el usuario lo solicite.
