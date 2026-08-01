# Agent Context Index

Contexto persistente del proyecto, versionado en repo. Cargar al inicio de sesión los archivos relevantes a la tarea.

---

## Referencias (workflows y reglas — cargar según tarea)

- [SEO Workflows](reference_seo_workflows.md) — Blog Writing, Audit, Evaluate, Topic Cluster, Feature, Data Import workflows completos. **Cargar para cualquier tarea de contenido/SEO.**
- [Article Checklists](reference_article_checklists.md) — Checklist obligatorio, 12 reglas anti-error, pre-publish checklist, humanización. **Cargar al crear/revisar artículos.**
- [Amazon Rules](reference_amazon_rules.md) — Afiliación, comandos API, cadencia, reglas estrictas, imágenes. **Cargar al trabajar con productos/comparativas.**
- [Internationalization Workflow](reference_i18n_workflow.md) — Arquitectura i18n, rutas por locale, slugs localizados, hreflang/canonical/sitemap y reglas Amazon OneLink.
- [MCP Analytics/GSC/Cloudflare](reference_mcp_analytics_setup.md) — Config para usar MCPs de Cloudflare, GA y GSC.
- [Recon Reddit / old.reddit](reference_reddit_thread_recon.md) — Método validado para karma, hilos vivos, búsquedas y replies. Preferir old.reddit; RSS como fallback.
- [Recon Mediavida vía Exa](reference_mediavida_thread_recon.md) — Método validado para listar hilos vivos /foro/*.
- [Workflow Quora ES](reference_quora_es_workflow.md) — Encontrar preguntas REALES vía Brave `site:es.quora.com/` (WebSearch inventa slugs; curl/WebFetch dan 403). Mapeo pregunta→artículo + patrón respuesta.
- [Fetch karma Reddit](reference_reddit_karma_fetch.md) — Método old.reddit HTML para leer karma; about.json/RSS solo como fallback.

## Estado de proyectos activos

- [Plan editorial vigente](project_content_plan.md) — Única cola de artículos nuevos: 1 artículo bilingüe ES+EN por semana. Reafirmado por el usuario el 01 ago 2026.
- [Estado recovery e indexación](project_recovery_session_state.md) — Handoff cronológico vigente para Google, Bing e IndexNow. Consultar este archivo, no los planes recovery históricos.
- [Plan backlinks Tier 1](project_backlinks_plan.md) — Para "vamos con el plan de backlinks".
- [Estado sesión backlinks](project_backlinks_session_state.md) — Actualizado 27 may: karma Reddit 24; 3 comentarios de warmup sin link publicados y visibles en RSS.
- [Workflow Amazon cache](project_amazon_cache_workflow.md) — Sistema API/cache para separar datos volátiles de Amazon del MDX.
- [Estado Amazon OneLink](project_amazon_onelink_state.md) — Cuentas internacionales registradas; tag vigente `tuespaciodet-21`; pasos de configuración OneLink.
- [Cola revisión editorial Amazon](project_amazon_editorial_review_queue.md) — Incidencias de productos que requieren revisión editorial.
- [Auditoría paridad contenido EN](project_english_localization_audit.md) — Refactor i18n EN completado 03 jul 2026: 30/30 MDX revisados, ratios EN/ES 90%-116%, calculadora EN limpiada.
- [Estado catálogo de sillas](../research/sillas/ESTADO.md) — Handoff vivo; leer este archivo para conocer cifras, API y siguiente lote actuales.
- [Estado catálogo de escritorios](project_escritorios_catalog_state.md) — Handoff vivo del catálogo de escritorios elevables.

## Histórico — no ejecutar como plan vigente

- [Auditoría de indexación del 24 may](../../seo-indexing-audit/audit-2026-05-24.md) — Evidencia fechada; no gobierna la cadencia editorial actual.
- [Recovery de mayo](project_recovery_plan.md) y [Recovery v2](project_recovery_plan_v2.md) — Conservados por su diagnóstico histórico; sustituidos por el estado de sesión.
- [Refuerzo E-E-A-T de mayo](project_eeat_recovery_plan.md) — Histórico; no usar como cola editorial ni como fuente de hechos personales.

## Persona y coherencia

- [Persona del autor](project_author_persona.md) — Datos canónicos David Rubio para coherencia E-E-A-T.

## Feedback permanente (reglas del usuario)

- [Usar todos los agentes y skills](feedback_use_all_tools.md) — Usar todos los agentes, plugins y skills sin pedir permiso.
- [Usar MCP antes de pedir datos](feedback_use_mcp_analytics_before_asking.md) — Para SEO/tráfico/indexación, consultar primero GSC/GA4/Cloudflare via MCP.
- [Comentarios foros anti-IA](feedback_forum_comment_humanization.md) — Comentarios Reddit/Quora/Mediavida deben pasar test humano y referenciar al OP.
- [No crear paquetes MD social](feedback_no_social_draft_md_packages.md) — Para Reddit/Quora/backlinks, pasar URLs y borradores por chat; no crear `SESION_X_*.md`.

## Scripts útiles

- [Script reddit_replies.py](../../scripts/reddit_replies.py) — Checkear replies en hilos donde hemos comentado.
