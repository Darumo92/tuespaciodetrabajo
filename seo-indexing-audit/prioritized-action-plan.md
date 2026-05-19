# Plan de accion priorizado

## Acciones inmediatas 0-24h

Actualizacion tras datos live: GSC ya confirma que el bucket dominante en la muestra es `Rastreada: actualmente sin indexar`; el sitemap ya fue descargado el 2026-05-19 sin errores; Cloudflare no muestra bloqueo. Por tanto, no conviene insistir con reenvios masivos ni tocar robots/canonical/headers globales.

- No tocar robots, canonicals o headers globales sin nueva evidencia de GSC live.
- No reenviar el sitemap de forma repetida: GSC ya lo descargo el 2026-05-19 sin errores.
- No pedir indexacion masiva otra vez sin cambios sustanciales en las URLs.
- Usar URL Inspection solo despues de cambios concretos en una URL prioritaria.
- Confirmar acciones manuales y problemas de seguridad.
- Revisar Cloudflare Firewall Events para Googlebot y Google Inspection Tool.
- No purgar cache global, no cambiar WAF, no publicar en bulk, no anadir `actualizadoEn` masivo.

## Acciones corto plazo 1-7 dias

- Hecho 2026-05-19: incluir `/ambiente/` en sitemap si se mantiene indexable y con articulos.
- Hecho 2026-05-19: retirar u ocultar `/audio-video/` de home/header/footer/busqueda hasta que tenga al menos una comparativa indexable.
- Hecho 2026-05-19: convertir enlaces markdown directos a Amazon en `ikea-bekant-vs-flexispot-e7.mdx` a componente/HTML con `rel="nofollow sponsored noopener"`.
- Revisar comparativas con 14-15 enlaces afiliados y bajar redundancia si superan 4-5 enlaces por 1000 palabras.
- Anadir enlaces internos contextuales desde home, guias fuertes y categorias hacia las 8 URLs recovery.
- Revisar schema Product/Review para que solo use Review si hay evidencia de prueba o metodologia visible.
- Documentar una pagina o bloque de metodologia editorial enlazable desde comparativas.

## Acciones medio plazo 2-6 semanas

- Reescribir 5-8 comparativas clave con mas experiencia real, fotos propias o evidencia de uso cuando sea posible.
- Consolidar paginas debiles si compiten por la misma intencion.
- Fortalecer las comparativas con criterios ponderados: ergonomia, ajuste, medidas, ruido, materiales, garantia, devoluciones, para quien si/no.
- Reducir lenguaje de listicle afiliado y aumentar diagnostico: problemas reales, casos de no compra, tradeoffs.
- Completar backlinks Tier 1 con cadencia natural, no spam.
- Mantener publicacion 1/semana hasta ver mejora sostenida en GSC.
- Crear contenido no afiliado/herramientas que diluya la proporcion comercial.

## Acciones de medicion

- GSC: indexadas, no indexadas, `Rastreada-no-indexada`, `Descubierta-no-indexada`, canonical alternativa, impresiones por pagina, sitemap last read.
- GSC URL Inspection: ultimo rastreo, canonical declarada/elegida, indexable yes/no para muestra fija.
- GA4: organic sessions por landing page, engagement rate, average engagement time, affiliate_click por landing.
- Cloudflare: 403/429/5xx por bot, managed challenge, cache status de HTML, firewall events Googlebot.
- Medir recuperacion de rastreo: incremento de `Ultimo rastreo` reciente en GSC para URLs internas.
- Medir recuperacion de indexacion: pasar de 2 a 10+ indexadas antes de 02 jun segun plan.
- Medir recuperacion de impresiones: >5 impresiones diarias sostenidas antes de subir cadencia.
