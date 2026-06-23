# Internationalization Workflow

Estado inicial implementado el 22 jun 2026.

## Estrategia vigente

- Español (`es-ES`) sigue siendo el idioma por defecto en `/`.
- Inglés usa una sola versión genérica en `/en/`, no variantes por país.
- La versión inglesa debe tener cobertura editorial completa: si una página pública existe en español y tiene selector de idioma, debe existir su equivalente en inglés antes de exponerla como disponible.
- No hay redirección automática dura por país o navegador. Se usa sugerencia suave y selector visible.
- Los locales planificados se configuran en `src/i18n/locales.ts`, pero sólo se publican si `localeReady: true`.
- No publicar categorías o artículos traducidos sin edición SEO nativa y sin una URL equivalente real.
- No activar un locale como `localeReady: true` si sólo tiene una parte del sitio traducida.

## Archivos clave

- `src/i18n/locales.ts`: configuración de locales, prefijos, hreflang, moneda, país, segmento de guías y Amazon.
- `src/i18n/ui.ts`: textos de interfaz por locale.
- `src/i18n/routes.ts`: construcción de URLs, canonical y alternates.
- `src/i18n/content.ts`: helpers para artículos base y artículos traducidos.
- `src/i18n/amazon.ts`: builder centralizado de URLs Amazon/OneLink.
- `src/content/articulosI18n/<locale>/`: MDX localizados.
- `src/pages/[locale]/`: rutas estáticas localizadas.
- `astro.config.mjs`: sitemap con `xhtml:link` hreflang explícito.

## Añadir un nuevo idioma

1. Activar el locale en `src/i18n/locales.ts` sólo cuando haya contenido listo.
2. Añadir diccionario de UI en `src/i18n/ui.ts`.
3. Crear MDX en `src/content/articulosI18n/<locale>/`.
4. Usar `translationOf` con el slug español original.
5. Usar `localizedSlug`, nunca `slug` en frontmatter i18n porque Astro lo reserva.
6. Definir `categoriaSlug` localizado para comparativas.
7. Añadir alternates de categorías si existe una categoría equivalente real.
8. Verificar que el sitemap genere `xhtml:link` para ES, locale y `x-default`.
9. Ejecutar `npm run build`.

## Reglas SEO

- Canonical siempre apunta a la URL propia del locale.
- `x-default` apunta a la versión española, salvo que se defina otra estrategia global.
- No crear variantes por país si el contenido, moneda, Amazon y SERP intent no están diferenciados.
- No traducir slugs literalmente: escribirlos según intención de búsqueda local.
- Inglés usa USD como moneda preferente (`currency: USD`) para futuras integraciones locales.
- No mezclar precios/monedas si no están verificados para el mercado.
- No mostrar Product `Offer` schema en locales sin precio/mercado verificado.

## Amazon y OneLink

- Mantener los enlaces MDX como `/dp/ASIN` o URLs Amazon verificadas.
- No inventar ASINs ni cambiar URLs artículo por artículo.
- `src/i18n/amazon.ts` centraliza dominio, tag y construcción de enlace.
- Para inglés genérico, el dominio base sigue siendo `amazon.es` con tag `tuespaciodet-21`; OneLink decide redirección.
- No mostrar disponibilidad cacheada española fuera de `es-ES`.
- No mostrar precios de Amazon.es en páginas no españolas.
- No convertir precios EUR a USD automáticamente. Mostrar precios en dólares sólo cuando el dato venga verificado del marketplace local o de una fuente aprobada.

## QA mínimo por locale

- `npm run build` pasa.
- `dist/<locale>/` existe para home, categorías y artículos publicados.
- HTML tiene `lang`, canonical y `rel=alternate` correctos.
- `dist/sitemap-0.xml` contiene `xhtml:link` recíprocos.
- No hay textos visibles en español dentro de páginas localizadas.
- No hay URLs localizadas vacías en header, footer o bottom nav.
- Los CTAs y disclaimers suenan naturales en el idioma publicado.
