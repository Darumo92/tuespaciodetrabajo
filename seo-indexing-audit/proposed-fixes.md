# Cambios propuestos, agrupados en commits pequenos

No implementar todavia. Esta lista esta ordenada para reducir riesgo.

## Commit 1 - Sitemap y navegacion de categorias

- Incluir `/ambiente/` en sitemap eliminando la exclusion en `astro.config.mjs:52`.
- Ocultar `/audio-video/` de home/header/footer hasta que tenga contenido indexable.
- Verificar live que `/ambiente/` devuelve 200, canonical self y aparece en sitemap.

## Commit 2 - Higiene de enlaces afiliados

- Reemplazar enlaces markdown directos a Amazon en `src/content/articulos/ikea-bekant-vs-flexispot-e7.mdx:42-43`.
- Usar `AffiliateButton` o `<a rel="nofollow sponsored noopener noreferrer" target="_blank">`.
- Buscar de nuevo `amazon.es/dp` en MDX para asegurar que no quedan enlaces pagados sin marcado.

## Commit 3 - Enlazado interno recovery

- Anadir enlaces contextuales desde guias fuertes a top 8 URLs recovery.
- Priorizar anchors naturales, no repetidos.
- Evitar enlaces desde bloques masivos tipo footer.

## Commit 4 - Metodologia editorial visible

- Crear seccion reutilizable o pagina breve de metodologia de pruebas/comparativas.
- Enlazarla desde comparativas principales.
- Explicar como se puntua, que se prueba, que viene de fichas tecnicas y que viene de experiencia propia.

## Commit 5 - Refuerzo de comparativas restantes

- Auditar `mejor-monitor-trabajar-desde-casa`, `mejor-soporte-monitor-brazo-articulado`, `mejor-silla-oficina-menos-200-euros`, `mejor-escritorio-elevable-electrico`.
- Reducir CTAs redundantes si densidad >5/1000w.
- Anadir secciones de `para quien si`, `para quien no`, mediciones y errores de compra.

## Commit 6 - Schema Product/Review conservador

- Revisar `ComparisonTable.astro`.
- Mantener Product/Offer solo donde datos estan verificados.
- Considerar quitar `review` o limitarlo a casos con review real demostrada.
- Validar con Rich Results Test despues del cambio.

## Commit 7 - Medicion

- Revisar si `affiliate_click` debe disparar tambien sin consentimiento como evento propio no GA o si se acepta limitacion RGPD.
- Crear dashboard GA4/GSC con landing pages recovery.
- No cambiar consentimiento sin revision legal.
