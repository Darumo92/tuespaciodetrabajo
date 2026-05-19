# Auditoria tecnica de indexabilidad

## Fase 1 - Mapa del proyecto

Arquitectura:

- Framework: Astro 5 (`package.json:13-17`).
- Output: static (`astro.config.mjs:60`).
- Render: generacion estatica en build, no SSR/ISR. El HTML se sirve completo desde Cloudflare Pages.
- Contenido: collection `articulos` en `src/content/articulos/*.mdx`, schema en `src/content/config.ts`.
- Comparativas: `src/pages/[categoria]/[slug].astro`, rutas `/{categoria}/{slug}/`, solo `tipo !== 'informativo'`.
- Guias: `src/pages/guias/[slug].astro`, rutas `/guias/{slug}/`, solo `tipo === 'informativo'`.
- Categorias: `src/pages/[categoria]/index.astro`, rutas `/sillas/`, `/escritorios/`, `/accesorios/`, `/ambiente/`, `/audio-video/`.
- Listados: `/articulos/`, `/guias/`, `/herramientas/`.
- Sitemap: `@astrojs/sitemap` en `astro.config.mjs:44-58`; postproceso `scripts/fix-sitemap-lastmod.mjs`.
- Robots: `public/robots.txt`.
- Headers: `public/_headers`, copiado/actualizado por `scripts/update-csp-hashes.mjs`.
- Redirects: `public/_redirects`.
- SEO base: `src/layouts/Base.astro` define title, description, canonical, meta robots, OG, hreflang, WebSite schema.
- SEO articulo: `src/layouts/Article.astro` define Article, FAQ, HowTo y BreadcrumbList schema.
- Afiliados: `src/components/AffiliateButton.astro`, `TopPick.astro`, `ComparisonTable.astro`.

No hay evidencia de:

- Middleware Astro.
- SSR, edge functions o Workers versionados en repo.
- Logica por Googlebot, user-agent, pais o dispositivo.
- Rewrites dinamicos en la app.

## Archivos SEO criticos

| Archivo | Funcion | Riesgo |
|---|---|---|
| `astro.config.mjs` | Sitemap, trailing slash, static output | Excluye `/ambiente/` aunque ya tiene articulos |
| `public/robots.txt` | Directivas de rastreo y sitemap | Correcto para articulos; bloquea busqueda y actualizaciones |
| `public/_headers` | Cache, CSP, security headers, X-Robots assets | Revisar live en Cloudflare para asegurar no merges inesperados |
| `public/_redirects` | Sitemap alias, tags a home, trailing slash, `/dp/*` | Redirecciones intencionadas; tags a home pueden generar ruido historico |
| `src/layouts/Base.astro` | Canonical, robots, OG, schema base | Canonical por `Astro.url.href`; correcto en live |
| `src/layouts/Article.astro` | Article/FAQ/HowTo/Breadcrumb schema, disclaimer | Productividad del schema depende de contenido real |
| `src/pages/[categoria]/index.astro` | Categoria noindex si vacia | `/audio-video/` noindex enlazada en navegacion |
| `src/components/AffiliateButton.astro` | Links Amazon con tag y rel | Correcto salvo enlaces markdown fuera del componente |
| `src/components/ComparisonTable.astro` | Tabla, links Amazon, Product schema | Marcado Product/Review potencialmente agresivo |

## Tabla de problemas tecnicos

| Problema | Severidad | Evidencia exacta | Archivo y linea | URLs/rutas afectadas | Impacto SEO | Recomendacion |
|---|---|---|---|---|---|---|
| Categoria `/ambiente/` excluida del sitemap aunque ya tiene articulos | Media | Filtro excluye `page !== 'https://tuespaciodetrabajo.com/ambiente/'`; live sitemap contiene articulos ambiente pero no categoria | `astro.config.mjs:52` | `/ambiente/` | Pierde senal de discovery/jerarquia; no explica deindexacion masiva | Incluir `/ambiente/` si tiene articulos indexables |
| Categoria vacia/noindex enlazada globalmente | Media | `audio-video` esta en header, footer y home; categoria vacia usa `noindex={esVacia}` | `Header.astro:12`, `Footer.astro:9`, `index.astro:98-102`, `[categoria]/index.astro:64-94` | `/audio-video/` | Ruido de crawl hacia pagina noindex/thin | Ocultar de navegacion principal hasta publicar primer articulo o dejarla fuera de home/header/footer |
| Enlaces markdown directos a Amazon sin rel sponsored/nofollow | Media | Links `[FlexiSpot EC5 PRO](https://www.amazon.es/dp/...` y `[JUMMICO...](https://www.amazon.es/dp/...` | `src/content/articulos/ikea-bekant-vs-flexispot-e7.mdx:42-43` | `/escritorios/ikea-bekant-vs-flexispot-e7/` | Incumple buenas practicas de links pagados; pequeno riesgo de confianza | Cambiar a `AffiliateButton` o HTML con `rel="nofollow sponsored noopener"` |
| Product/Review schema auto-generado para productos afiliados | Media | `review` con `reviewRating` y author Organization para cada producto | `ComparisonTable.astro:61-130` | Todas las comparativas | Riesgo de marcado demasiado comercial si no hay review real/metodologia suficiente | Reforzar metodologia y considerar ItemList + Product minimo o Review solo si hay prueba documentada |
| Legal pages indexables tras fix previo | Baja | No `noindex` en legal pages; plan dice fix intencionado | `src/pages/aviso-legal.astro`, `cookies.astro`, `politica-privacidad.astro` | Legales | No causa de colapso; posible ruido menor | Mantener si decision previa era indexarlas; no tocar ahora |
| `X-Robots-Tag: noindex` en assets/fuentes | Baja | `_headers` aplica noindex a `/_astro/*` y `/fonts/*` | `public/_headers:12-19` | Assets | Correcto; no afecta HTML | Sin cambios |
| Busqueda y actualizaciones bloqueadas/noindex | Baja | Robots bloquea `/buscar/` y `/actualizaciones/`; paginas noindex | `robots.txt:5-6`, `buscar.astro:20`, `actualizaciones.astro:25` | `/buscar/`, `/actualizaciones/` | Correcto para paginas de utilidad | Sin cambios |

## Pruebas HTTP live destacadas

Muestras revisadas con usuario normal y Googlebot:

- Home: 200, canonical self, robots `max-image-preview:large`, sin `X-Robots-Tag`, HTML 100 KB, sin diferencia Googlebot.
- `/sillas/mejor-silla-ergonomica-calidad-precio/`: 200, canonical self, robots indexable, HTML 164 KB, sin diferencia Googlebot.
- `/accesorios/mejor-monitor-trabajar-desde-casa/`: 200, canonical self, robots indexable, HTML 162 KB, sin diferencia Googlebot.
- `/escritorios/mejor-escritorio-elevable-electrico/`: 200, canonical self, robots indexable, HTML 164 KB, sin diferencia Googlebot.
- `/guias/ergonomia-teletrabajo-postura-correcta/`: 200, canonical self, robots indexable, HTML 122 KB, sin diferencia Googlebot.
- `/audio-video/`: 200, canonical self, robots `noindex, follow, max-image-preview:large`, intencional por categoria vacia.

Conclusion tecnica: las URLs internas principales son rastreables e indexables desde HTTP/HTML. El problema no parece un bloqueo tecnico global.

## Confirmacion GSC live

URL Inspection confirma que las paginas internas no estan bloqueadas tecnicamente:

- `indexingState: INDEXING_ALLOWED`.
- `robotsTxtState: ALLOWED`.
- `pageFetchState: SUCCESSFUL`.
- Canonical Google igual a canonical declarada.
- Estado: `Rastreada: actualmente sin indexar`.

Esto significa que Google ya pudo rastrear las paginas, pudo leer lo suficiente para elegir la canonical correcta, y aun asi decidio no indexarlas. La causa principal no esta en robots, canonical, noindex, redirects ni Cloudflare.
