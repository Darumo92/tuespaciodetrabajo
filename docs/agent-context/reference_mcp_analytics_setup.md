---
name: MCP analytics setup - Cloudflare, GA4, Search Console
description: Configuracion MCP versionada para analiticas web en Claude Code y Codex CLI.
type: reference
updated: 2026-05-13
---

# MCP analytics setup

Fuente versionada:

- Claude Code: `.mcp.json`
- Codex CLI: `mcp-environment/codex.config.toml` + `mcp-environment/setup-codex-mcp.sh`
- Documentacion operativa: `mcp-environment/README.md`

## Servidores activos

| MCP | Fuente | Estado |
|---|---|---|
| `cloudflare-api` | `https://mcp.cloudflare.com/mcp` | Oficial Cloudflare |
| `google-analytics` | `googleanalytics/google-analytics-mcp`, comando `pipx run analytics-mcp` | Oficial/experimental Google Analytics |
| `google-search-console` | `mcp-server-gsc@0.3.0` | Tercero auditado, no oficial |

## Search Console - regla de seguridad

No hay MCP oficial de Google Search Console a fecha 2026-05-13. No presentar `google-search-console` como oficial.

El paquete aprobado para este repo es `mcp-server-gsc@0.3.0`, fijado a version exacta. No usar `latest`. No actualizar sin nueva auditoria.

Auditoria heredada de `patasyhogar`, 2026-05-13:

- Repo revisado: `https://github.com/ahonn/mcp-server-gsc`
- npm revisado: `mcp-server-gsc@0.3.0`
- Tarball npm: 7 ficheros (`dist/*`, `README.md`, `package.json`)
- `npm audit --omit=dev`: 0 vulnerabilidades
- Scan textual del paquete: sin `child_process`, `eval`, `fetch`, `curl`, `wget`, lectura de `.ssh`, `.aws`, `.env`, ni dominios de exfiltracion
- Dependencias principales: `googleapis`, `google-auth-library`, `@modelcontextprotocol/sdk`, `zod`
- Scope usado por el servidor: `https://www.googleapis.com/auth/webmasters.readonly`
- Riesgo residual: tercero, sin soporte oficial de Google; datos GSC pueden contener texto controlado por terceros y provocar prompt injection indirecta si se pegan sin filtrar en contexto

Mitigaciones:

- Usar OAuth/ADC de usuario cuando la organizacion bloquee service account keys
- Mantener permisos minimos en Search Console
- No guardar credenciales en el repo
- En Codex, `submit_sitemap` queda deshabilitado mediante `disabled_tools`

## Credenciales necesarias

Codex:

- `CLOUDFLARE_API_TOKEN` para Cloudflare
- `GOOGLE_APPLICATION_CREDENTIALS` para GA4/GSC
- `GOOGLE_PROJECT_ID` para GA4

Claude Code:

- Cloudflare puede usar OAuth via `/mcp`
- GA4/GSC usan `GOOGLE_APPLICATION_CREDENTIALS`
- GA4 usa tambien `GOOGLE_PROJECT_ID`

## Configuracion validada 2026-05-13

La configuracion actual reutiliza el mismo proyecto Google Cloud y ADC que `patasyhogar`:

- ADC generado: `~/.config/gcloud/application_default_credentials.json`
- `GOOGLE_PROJECT_ID="patasyhogar-mcp"`
- Scopes necesarios:
  - `https://www.googleapis.com/auth/analytics.readonly`
  - `https://www.googleapis.com/auth/webmasters.readonly`
  - `https://www.googleapis.com/auth/cloud-platform`

Verificacion con MCP:

- Google Analytics Admin API ve cuenta `Darumo` y propiedad `Tuespaciodetrabajo` (`properties/529910113`)
- Search Console API ve `sc-domain:tuespaciodetrabajo.com` con `siteOwner`

Nota Cloudflare Codex:

- Para Codex, mantener `bearer_token_env_var = "CLOUDFLARE_API_TOKEN"`.
- El token debe estar asociado a una cuenta visible para el MCP e incluir `Account Resources: Read`; un token limitado solo a zona puede fallar aunque sea valido para la API REST.
