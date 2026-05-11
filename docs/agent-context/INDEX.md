# Agent Context Index

Contexto persistente del proyecto, versionado en repo (no en memoria local Claude). Cargar al inicio de cada sesión. Actualizar aquí cualquier estado/plan/persona/feedback que deba sobrevivir entre sesiones y máquinas.

## Archivos


- [Usar todos los agentes y skills](feedback_use_all_tools.md) — El usuario quiere que use todos los agentes, plugins y skills sin pedir permiso cada vez
- [Calendario de publicación Recovery](project_content_calendar.md) — Mapa fecha→artículo POST-recovery (cadencia rebajada). Reemplaza Plan v2. Para "vamos con el de hoy"
- [Plan Recovery Indexación activo](project_recovery_plan.md) — Estado plan tras colapso indexación 06 may. Bloques A-E. Para SEO/GSC/indexación
- [Sesión recovery handoff](project_recovery_session_state.md) — Próxima acción concreta: jue 07 may refactor ratón vertical. Para "vamos con lo de ayer" / "seguimos con recovery"
- [Plan v2 DEPRECADO](reference_plan_v2.md) — docs/PLAN_v2_2026-04-12.md OBSOLETO desde 06 may. Cadencia 3/sem causó flag HCU. Solo histórico
- [Persona del autor](project_author_persona.md) — Datos canónicos David Rubio (vive en Rubí, altura/peso/setup/fisio) para coherencia E-E-A-T entre artículos
- [Plan recovery E-E-A-T](project_eeat_recovery_plan.md) — Estado del refactor de los 15 artículos "Rastreada-no-indexada" en GSC. Patrón refuerzo + orden 14 días
- [Plan backlinks Tier 1 pendiente](project_backlinks_plan.md) — Cuando el usuario diga "vamos con el plan de backlinks", ejecutar plan adquisición Tier 1 (Reddit, foros ES, Quora, directorios, HARO)
- [Estado sesión backlinks activa](project_backlinks_session_state.md) — Retomar la noche 2026-04-29. About.me + Dev.to ✅. Pendiente: 5 respuestas Quora Bloque B en docs/SESION_1_BACKLINKS_PAQUETE.md
- [Comentarios foros anti-IA](feedback_forum_comment_humanization.md) — Regla permanente: comentarios Reddit/Quora/Mediavida/Habitissimo deben pasar test humano y referenciar al OP concreto
- [Recon Reddit vía RSS](reference_reddit_thread_recon.md) — Método validado para listar hilos vivos r/* desde Claude Code (RSS + UA Safari + descarga a fichero, NO pipe a intérprete)
- [Recon Mediavida vía Exa](reference_mediavida_thread_recon.md) — Método validado para listar hilos vivos /foro/* desde Claude Code (Exa MCP search + fetch; Mediavida bloquea TODO acceso anónimo)
- [Fetch karma Reddit](reference_reddit_karma_fetch.md) — Método validado curl + UA Safari + about.json para leer karma de cualquier cuenta Reddit pública. Reemplaza nota errónea previa
