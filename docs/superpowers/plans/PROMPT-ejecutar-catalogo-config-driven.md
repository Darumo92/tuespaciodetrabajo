# Prompt para ejecutar el plan (pegar en una sesión nueva)

---

Ejecuta el plan `docs/superpowers/plans/2026-06-16-catalogo-config-driven.md`
(refactor del catálogo a config-driven por `TipoConfig`). Spec de referencia:
`docs/superpowers/specs/2026-06-16-catalogo-config-driven-design.md`.

Modo: **subagent-driven** (skill `superpowers:subagent-driven-development`) — un
subagente fresco por task con spec + quality review entre tasks. Modelo: haiku para
lo mecánico (Task 1 datos/tipos, edits de componente), sonnet para el diseño de las
funciones puras y el script genérico (Tasks 2-5).

Rama: `feat/catalogo-multicategoria` (ya estás en ella). **No cambiar de rama. No push.**

Reglas duras (no negociar):
- Comportamiento de `/catalogo/silla/` **idéntico** tras el refactor (mismos
  productos, mismo filtrado/orden/comparación). Verificar con build (88 páginas) +
  `npm test` + revisión manual de la lógica de filtros.
- Sistema editorial intacto: CSS plano, tokens canónicos (--accent, --ink, --surface,
  --border, --radius, --dur-*/--ease-*). CERO AI-tells (gradient-text, glass,
  transition:all, side-stripe >1px, backdrop-filter). Hairlines 1px. Sin alias legacy
  (no reintroducir var(--color-*) salvo --color-footer-*).
- CSP por hashes: la regenera `npm run build`. El script inline del catálogo cambia →
  su hash cambia (sancionado): commitear `public/_headers` SOLO si cambia, verificando
  que el diff sea únicamente swap de hash (sin cambio de política ni dominio).
- Schema/JSON-LD y tag/ASIN de afiliado (AMAZON_TAG='tuespaciodet-21', buildAmazonHref)
  intactos byte a byte.
- Ortografía española correcta, sin em-dash en texto visible.

Cada task: build verde + verificación declarada en el task antes de commitear. Commits
con el mensaje que indica cada task.

Nota harness: el hook "Fact-Forcing Gate" bloquea el primer Bash/Write/Edit de cada
archivo pidiendo facts (request en 1 frase + qué hace; archivos nuevos: callers +
no-duplicado). Cúmplelo y reintenta. Pásaselo a cada subagente.

Al terminar las 6 tasks: reporte final (build 88 páginas, npm test verde, diff de
_headers solo hash, paridad de /catalogo/silla/, extensibilidad probada por el mock
escritorio). Sin push.
