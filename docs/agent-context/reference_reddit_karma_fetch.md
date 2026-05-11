---
name: Método validado fetch karma Reddit
description: Cómo leer karma de cualquier cuenta Reddit pública desde Claude Code (curl + UA Safari + about.json). Reemplaza nota previa errónea "Reddit bloquea todo fetch externo"
type: reference
---

## Endpoint

```
https://www.reddit.com/user/{USERNAME}/about.json
```

## Comando

```bash
curl -sSL -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' \
  "https://www.reddit.com/user/{USERNAME}/about.json"
```

## Campos de interés en `data`

- `link_karma` — karma posts
- `comment_karma` — karma comentarios
- `total_karma` — suma
- `created_utc` — timestamp creación cuenta
- `is_suspended` — cuenta suspendida
- `has_verified_email`

## Códigos HTTP

- `200` + JSON con `data` → cuenta existe, datos visibles
- `404` `{"message":"Not Found","error":404}` → cuenta no existe / borrada
- `403` → suspendida o shadowban total

## Notas

- Header `User-Agent` con UA Safari es crítico. Sin UA o con UA por defecto curl → bloqueo.
- Funciona sin login y sin token OAuth.
- `https://www.reddit.com/user/{USERNAME}/` (HTML) sirve anti-bot wall "Please wait for verification" — inútil para scraping. Usar siempre `.json`.
- `https://old.reddit.com/user/{USERNAME}/` HTML sí carga pero parsear es ruidoso. Preferir `about.json`.
- RSS `/user/{USERNAME}.rss` solo expone últimos comentarios, NO karma.

## Cuentas del ecosistema

- `Dear_Potato8535` — tuespaciodetrabajo (campaña backlinks Tier 1, warmup activo)
- `Pristine_Review5630` — patasyhogar (referencia de método validado)

## Origen

Método replicado del proyecto patasyhogar (`/Users/darumo/Proyectos/patasyhogar/docs/agent-context/project-state/project_backlinks_social_status.md`). Validado en este proyecto 2026-05-11 — devuelve 200 + JSON para ambas cuentas.

Nota previa errónea en `project_backlinks_session_state.md` decía "Reddit bloquea todo fetch externo incluyendo .json y HTML". **Falso**. Con UA Safari `about.json` funciona.
