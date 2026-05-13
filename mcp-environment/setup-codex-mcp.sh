#!/usr/bin/env bash
# mcp-environment/setup-codex-mcp.sh - sync repo MCP config into ~/.codex/config.toml
#
# Compatible macOS and Linux. This keeps Codex MCP setup reproducible in the
# same spirit as claude-environment/setup.sh.

set -euo pipefail

ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${ENV_DIR}/codex.config.toml"
DST="${HOME}/.codex/config.toml"
BACKUP="${HOME}/.codex/config.toml.backup-$(date +%Y%m%d-%H%M%S)"
BEGIN="# >>> tuespaciodetrabajo mcp-environment"
END="# <<< tuespaciodetrabajo mcp-environment"

if [[ ! -f "${SRC}" ]]; then
  echo "ERROR: no encuentro ${SRC}" >&2
  exit 1
fi

mkdir -p "$(dirname "${DST}")"
touch "${DST}"
cp "${DST}" "${BACKUP}"

TMP="$(mktemp)"
awk -v begin="${BEGIN}" -v end="${END}" '
  $0 == begin { skip = 1; next }
  $0 == end { skip = 0; next }
  skip != 1 { print }
' "${DST}" > "${TMP}"

{
  sed '/^[[:space:]]*$/N;/^\n$/D' "${TMP}"
  echo
  echo "${BEGIN}"
  cat "${SRC}"
  echo "${END}"
} > "${DST}"

rm -f "${TMP}"
chmod 600 "${DST}"

cat <<EOF
Codex MCP config sincronizada:
  ${DST}

Backup:
  ${BACKUP}

Reinicia Codex para cargar los MCP.
Autenticacion Cloudflare para Codex:
  export CLOUDFLARE_API_TOKEN=tu-token-limitado

Google Analytics usa Application Default Credentials:
  export GOOGLE_APPLICATION_CREDENTIALS="\$HOME/.config/gcloud/application_default_credentials.json"
  export GOOGLE_PROJECT_ID=patasyhogar-mcp
EOF
