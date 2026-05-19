# Cloudflare - Auditoria SEO

## Evidencia live HTTP

Pruebas realizadas sobre home, articulos internos, sitemap y robots:

- Servidor: `cloudflare`.
- HTML auditado: 200 en usuario normal y 200 en Googlebot.
- Diferencias Googlebot: no detectadas en status ni longitud HTML para la muestra.
- `X-Robots-Tag`: ausente en HTML auditado.
- `cf-cache-status`: `DYNAMIC` en HTML, `REVALIDATED` en robots.
- `Content-Type`: correcto para HTML, XML y TXT.
- No se observo challenge, 403, 401, 429, 5xx ni JS challenge en las muestras.

## Configuracion versionada relevante

| Archivo | Evidencia | Riesgo |
|---|---|---|
| `public/_headers:34-53` | Headers universales y CSP para HTML | Sin noindex en HTML |
| `public/_headers:12-19` | `X-Robots-Tag: noindex` solo para `/_astro/*` y `/fonts/*` | Correcto |
| `public/_redirects:1-27` | Redirecciones de sitemap, sobre-nosotros, tags, trailing slash y `/dp/*` | No afecta articulos principales |
| `scripts/update-csp-hashes.mjs` | Reescribe CSP en build | No editar hashes manualmente |

## Riesgos Cloudflare a monitorizar si reaparece evidencia tecnica

| Riesgo | Probabilidad | Evidencia actual | Que revisar |
|---|---|---|---|
| Bot Fight/WAF bloqueando Googlebot | Baja con muestra actual | Googlebot recibe 200 y mismo HTML | Firewall events filtrando Googlebot real, ASN Google, verified bots |
| Cache antigua con noindex/canonical/404 | Media-baja | HTTP actual correcto; historico tuvo fixes de sitemap/CSP/robots | Cache Rules, Tiered Cache, deploy activo, HTML viejo servido por rutas concretas |
| Headers SEO anadidos por Transform Rules | Baja desconocida | No aparece `X-Robots-Tag` en muestra | Transform Rules y Response Header Rules live |
| Workers modificando HTML/canonical | Baja desconocida | No hay Workers en repo, HTML normal | Workers/routes activos en dashboard |
| Redirect Rules www/http inconsistentes | Baja desconocida | Muestras https non-www OK | DNS/canonical domain, http->https, www->non-www |

## Recomendaciones sin ejecutar cambios

- Revisar Firewall Events ultimos 30 dias para user agents Googlebot y Google Inspection Tool.
- Confirmar que Verified Bots estan permitidos.
- Confirmar que no hay Managed Challenge, JS Challenge, Turnstile o Rate Limiting en rutas HTML.
- Verificar reglas de Transform Headers para ausencia de `X-Robots-Tag` en `/*`.
- Confirmar que Cloudflare Pages deploy activo corresponde al ultimo commit.
- Si se implementan fixes tecnicos despues, purgar solo URLs afectadas, no purga masiva salvo evidencia de cache HTML vieja.

## Actualizacion Cloudflare live 2026-05-19

Zona: `tuespaciodetrabajo.com`, status `active`, setup `full`, plan Free Website.

DNS:

- Apex `tuespaciodetrabajo.com`: CNAME a `tuespaciodetrabajo.pages.dev`, proxied true.
- `www.tuespaciodetrabajo.com`: CNAME a `tuespaciodetrabajo.pages.dev`, proxied true.

Cloudflare Pages:

- Proyecto: `tuespaciodetrabajo`.
- Source: GitHub `Darumo92/tuespaciodetrabajo`, production branch `main`.
- Build command: `npm run build`, output `dist`.
- Framework: Astro 5.18.1.
- Ultimo deploy production: 2026-05-19T11:44:32Z, status success, commit `df5a022`.
- `uses_functions: false`.
- Dominios: `tuespaciodetrabajo.pages.dev`, `tuespaciodetrabajo.com`, `www.tuespaciodetrabajo.com`.

Workers:

- Account Workers scripts: lista vacia.
- Zone Workers routes: lista vacia.

Pruebas de dominio:

| URL | Resultado |
|---|---|
| `http://tuespaciodetrabajo.com/` | 301 a `https://tuespaciodetrabajo.com/` |
| `http://www.tuespaciodetrabajo.com/` | 301 a `https://tuespaciodetrabajo.com/` |
| `https://www.tuespaciodetrabajo.com/` | 301 a `https://tuespaciodetrabajo.com/` |
| `https://tuespaciodetrabajo.pages.dev/` | 200, canonical a `https://tuespaciodetrabajo.com/` |

Conclusion: Cloudflare no es causa probable. No hay Workers ni Pages Functions interceptando Googlebot, y GSC confirma fetch exitoso de las URLs internas.
