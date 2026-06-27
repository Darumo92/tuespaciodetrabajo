---
name: No crear paquetes markdown para borradores Reddit/Quora
description: Regla permanente para entregables de outreach social/backlinks: los borradores y URLs se pasan por chat, no en archivos .md nuevos.
type: feedback
originSessionId: current
---

Cuando el usuario pida el plan de hoy de Reddit, Quora, foros, backlinks o outreach social:

- **No crear archivos `.md` nuevos** tipo `SESION_X_REDDIT_QUORA_PAQUETE.md` para entregar borradores.
- Pasar en la respuesta del chat las URLs y los textos listos para copiar/pegar.
- Mantener `docs/agent-context/project_backlinks_session_state.md` solo para estado persistente: karma, candidatos, descartes, qué se publicó, URLs visibles, pendientes.
- Si hace falta guardar una preferencia o regla operativa, crear/actualizar un archivo de feedback en `docs/agent-context/` y registrarlo en `INDEX.md`.
- Si por error se crea un `.md` de paquete social, retirarlo y dejar el contenido en el chat.

Motivo: el usuario quiere recibir estos borradores directamente en conversación para poder publicar rápido, sin navegar archivos adicionales.
