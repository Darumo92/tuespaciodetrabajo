# Auditoria de indexacion - Resumen ejecutivo

Fecha: 2026-05-19
Sitio: https://tuespaciodetrabajo.com
Stack: Astro 5, salida estatica, Cloudflare Pages, contenido MDX, afiliacion Amazon.

## Veredicto

No he encontrado en el codigo ni en las pruebas HTTP live una causa tecnica unica que explique por si sola que Google solo mantenga indexada la home. Las paginas internas importantes devuelven 200, tienen canonical autorreferente, meta robots indexable, no envian `X-Robots-Tag: noindex`, aparecen con contenido HTML completo inicial y no muestran diferencias entre usuario normal y Googlebot.

La explicacion mas probable es combinada: evaluacion algoritmica/calidad de sitio nuevo afiliado, cadencia de publicacion anomala, fechas historicamente inconsistentes, densidad afiliada inicial alta y baja autoridad externa. Esto encaja con el dato persistido de GSC: 20 indexadas el 08 abr -> 2 indexadas el 01 may, 17 URLs en `Rastreada, actualmente sin indexar` e impresiones practicamente a cero desde el 15 abr.

## Top 3 causas probables

1. Senal algoritmica de baja calidad/thin affiliate en sitio nuevo.
   Evidencia: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:12-23`, `project_recovery_plan.md:9-19`, 28 articulos en 33 dias, densidad afiliada alta en comparativas comerciales y 17 URLs en `Rastreada-no-indexada`.

2. Historial de freshness/backdating y burst editorial.
   Evidencia: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:12-16`, `fa30f13` corrige 23 fechas, el colapso ocurre despues del burst de marzo/abril.

3. Baja autoridad externa y descubrimiento/crawl limitado.
   Evidencia: `docs/agent-context/project_backlinks_plan.md:9`, `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:23`, el plan interno registra 0 backlinks verificados en BWT el 2026-04-28 y objetivo de recovery via backlinks.

## Causas tecnicas revisadas

No parecen causa principal:

- `robots.txt`: no bloquea articulos ni categorias relevantes.
- `meta robots`: los articulos usan `max-image-preview:large`, no `noindex`.
- `X-Robots-Tag`: no aparece en HTML ni paginas auditadas; solo se configura para assets y fuentes.
- Canonicals: las URLs internas auditadas tienen canonical autorreferente con trailing slash.
- Render: contenido principal y enlaces internos aparecen en HTML inicial.
- Googlebot: las muestras responden igual que usuario normal.

Riesgos tecnicos secundarios:

- `/ambiente/` esta excluida del sitemap aunque ahora tiene articulos e indexa como categoria util (`astro.config.mjs:52`).
- `/audio-video/` se enlaza desde home/header/footer pero esta vacia, noindex y excluida del sitemap.
- Hay enlaces markdown directos a Amazon en `ikea-bekant-vs-flexispot-e7.mdx:42-43`, fuera del componente que aplica `rel="sponsored nofollow"`.
- El schema Product/Review usa ratings editoriales y review author `Organization` en listados; no bloquea indexacion, pero puede ser una senal de marcado agresivo si no se sustenta con metodologia visible.

## Primera correccion recomendada

No empezaria por sitemap/robots/canonical globales. Primero confirmaria en GSC live una muestra de URLs `Rastreada-no-indexada` y, si se confirma el patron actual, priorizaria contenido/calidad: reforzar 5-8 URLs internas criticas con metodologia, evidencia de experiencia real, reduccion de patrones afiliados y enlaces internos contextuales. Como quick win tecnico seguro, ajustaria el sitemap para incluir `/ambiente/` y evitar enlazar categorias vacias/noindex desde navegacion principal hasta que tengan contenido.

## Actualizacion con datos live MCP/API

GSC live confirma el diagnostico: la home esta `Enviada e indexada`, pero las URLs internas prioritarias auditadas estan `Rastreada: actualmente sin indexar`. En todas las internas revisadas Google indica `INDEXING_ALLOWED`, `robotsTxtState: ALLOWED`, `pageFetchState: SUCCESSFUL` y canonical Google igual a la canonical declarada. Esto descarta como causa principal robots, noindex, canonical incorrecta, sitemap roto o bloqueo de rastreo.

Datos clave:

- Sitemap index enviado y descargado por GSC el 2026-05-19, sin errores ni warnings.
- GSC Search Analytics: 913 impresiones y 8 clics entre 2026-03-24 y 2026-04-14; 27 impresiones y 2 clics entre 2026-04-15 y 2026-05-19.
- GA4: Organic Search baja de 11 sesiones pre-caida a 2 sesiones post-caida; las principales landing internas pasan a 0 sesiones organicas.
- Cloudflare: dominio activo en Cloudflare Pages, ultimo deploy production correcto, `uses_functions: false`, sin Workers ni Workers routes. HTTP/www redirige correctamente a `https://tuespaciodetrabajo.com/`.

Conclusion actualizada: el problema es de seleccion/evaluacion de indexacion por Google, no de bloqueo tecnico. La primera linea de accion debe ser calidad, autoridad, enlazado interno y reduccion de senales thin-affiliate; los cambios tecnicos deben limitarse a quick wins no disruptivos.
