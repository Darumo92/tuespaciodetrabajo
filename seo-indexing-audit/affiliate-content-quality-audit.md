# Auditoria de contenido afiliado y calidad

## Matriz por tipo de pagina

| Tipo de contenido | Riesgo thin affiliate | Riesgo duplicacion | Riesgo baja utilidad | Ejemplos | Mejoras recomendadas |
|---|---|---|---|---|---|
| Comparativas principales | Alto historico, medio actual tras refactors | Medio | Medio-alto | `mejor-raton-vertical-ergonomico`, `mejor-teclado-ergonomico`, `mejor-lampara-escritorio-led` tuvieron densidad afiliada >6/1000w; ahora bajadas a 2.62-3.43 segun `project_recovery_session_state.md:53-57` | Reforzar metodologia visible, criterios ponderados, pruebas propias, fotos/evidencias, limites de recomendacion y secciones de no compra |
| Comparativas nuevas | Medio | Medio | Medio | `mejor-ventilador-silencioso-oficina` tiene 12 elementos afiliados en 2451 palabras y GSC aun no reconoce URL | Mantener cadencia lenta, anadir datos propios/mediciones y evitar patron tabla+CTAs como bloque dominante |
| Guias informativas puras | Bajo-medio | Medio | Medio | `ergonomia-teletrabajo-postura-correcta`, `dolor-espalda-trabajar-casa`, `fatiga-visual-pantalla` | Aumentar evidencia de experiencia real, fuentes externas y enlaces a metodologia/editorial |
| Guias informativas con afiliados | Medio | Medio | Medio | `mi-setup-home-office-2026`, `home-office-productivo-500-euros`, `novedades-home-office-2026`, `silla-gaming-vs-ergonomica` | Separar claramente experiencia propia de recomendacion comercial, reducir CTAs tempranos, enlazar a reviews profundas |
| Categorias | Medio | Bajo | Medio | `/audio-video/` vacia/noindex; `/ambiente/` con contenido pero fuera de sitemap | No enlazar categorias vacias, enriquecer categorias indexables con contenido editorial unico |
| Herramientas | Bajo | Bajo | Bajo | `/herramientas/calculadora-ergonomia/` | Buen activo no afiliado para diluir perfil comercial; enlazarlo desde articulos de ergonomia |

## Evidencia de riesgo calidad

- Sitio nuevo con 28 articulos en 33 dias: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:12-13`.
- 22 de 28 articulos con fechas inconsistentes historicas: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:14-16`.
- Densidad afiliada historica alta en top 3: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:17-21`.
- Cero backlinks externos verificados inicialmente: `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:23`.
- Comparativas con 13-15 elementos/componentes afiliados segun recuento local en varias URLs.
- Trust signals globales vacios en `.seo-engine/config.yaml:51-54` (`reviews: []`, `testimonials: []`, `metrics: []`).

## Senales positivas

- Pagina `sobre-mi` con persona, experiencia, metodologia y disclosure (`src/pages/sobre-mi.astro:59-142`).
- Disclosure visible en articulos comparativos (`Article.astro:241-250`).
- Enlaces afiliados del componente con `nofollow noopener noreferrer sponsored`.
- Refactors ya aplicados en tres piezas de mayor densidad afiliada.
- Herramienta gratuita de ergonomia que aporta valor no afiliado.

## Problemas concretos

| Problema | Severidad | Evidencia | Impacto | Recomendacion |
|---|---|---|---|---|
| Patron historico de publicacion masiva | Alta | 28 articulos en 33 dias | Puede activar evaluacion de sitio generado en masa | Mantener cadencia recovery 1/sem y no publicar en bursts |
| Fechas historicamente manipuladas o inconsistentes | Alta | 22/28 articulos con inconsistencias corregidas en `fa30f13` | Senal de freshness spam; aunque ya corregida, el historial pudo activar reevaluacion | No usar `actualizadoEn` bulk; documentar cambios reales |
| Densidad afiliada en comparativas | Alta historica, media actual | Top 3 >6/1000w historico; refactor a 2.62-3.43 | Thin affiliate | Continuar refactor en comparativas restantes con 14-15 links/3000w |
| Metodologia aun poco demostrable en algunas tablas | Media | Ratings editoriales en schema y tarjetas | Google puede no ver valor propio suficiente frente a Amazon/listicles | Publicar metodologia por categoria, criterios ponderados, evidencias y escenarios de no compra |
| Trust signals estructurados vacios | Media | `.seo-engine/config.yaml:51-54` | E-E-A-T incompleto a nivel sistema | Anadir testimonios/metricas/reviews reales cuando existan |
