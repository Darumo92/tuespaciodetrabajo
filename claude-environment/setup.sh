#!/usr/bin/env bash
# setup.sh — Bootstrap del entorno de agentes en una máquina nueva.
#
# Tras `git clone` + `cd tuespaciodetrabajo`, ejecutar:
#   bash claude-environment/setup.sh
#
# Lo que hace:
#   1. Clona skills externos (humanizer, mcp-sentinel, prompt-master) → ~/.config/opencode/skills/
#   2. Clona bundle marketing-skills → ~/.config/opencode/skills/
#   3. Instala el plugin superpowers para opencode
#   4. Configura MCP servers (copia opencode.json si no existe)
#   5. Imprime instrucciones finales
#
# Idempotente: se puede ejecutar varias veces. No borra nada del usuario.
# Compatible: Linux + macOS.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Opencode skills directory
OPENCODE_SKILLS="$HOME/.config/opencode/skills"
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.json"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
info() { printf "  → %s\n" "$1"; }
warn() { printf "  ⚠ %s\n" "$1" >&2; }
ok()   { printf "  ✓ %s\n" "$1"; }

# Check jq
if ! command -v jq >/dev/null 2>&1; then
  warn "jq no encontrado. Instálalo:"
  warn "  macOS: brew install jq"
  warn "  Debian/Ubuntu: sudo apt install jq"
  warn "  Fedora/RHEL: sudo dnf install jq"
  warn "  Arch: sudo pacman -S jq"
  exit 1
fi

bold "[1/4] Clonando skills externos → $OPENCODE_SKILLS"
mkdir -p "$OPENCODE_SKILLS"

while IFS=$'\t' read -r name url; do
  dest="$OPENCODE_SKILLS/$name"
  if [ -d "$dest/.git" ]; then
    info "$name: pull"
    git -C "$dest" pull --ff-only --quiet 2>/dev/null || warn "$name pull falló"
  elif [ -d "$dest" ]; then
    info "$name: ya existe (sin .git), saltando"
  else
    info "$name: clonando desde $url"
    git clone --quiet "$url" "$dest"
  fi
done < <(jq -r '.single_skills[] | "\(.name)\t\(.url)"' "$SCRIPT_DIR/git-skills.json")

bold "[2/4] Clonando bundle marketing-skills"
BUNDLES_DIR="$HOME/.config/opencode/_bundles"
mkdir -p "$BUNDLES_DIR"

while IFS=$'\t' read -r name url subdir; do
  bundle_repo="$BUNDLES_DIR/$name"
  if [ -d "$bundle_repo/.git" ]; then
    info "$name: pull"
    git -C "$bundle_repo" pull --ff-only --quiet 2>/dev/null || warn "$name pull falló"
  else
    info "$name: clonando desde $url"
    rm -rf "$bundle_repo"
    git clone --quiet "$url" "$bundle_repo"
  fi
  # Copy each skill from the bundle
  src_dir="$bundle_repo/$subdir"
  if [ ! -d "$src_dir" ]; then
    warn "subdir $subdir no existe en $name"
    continue
  fi
  count=0
  for skill_path in "$src_dir"/*/; do
    [ -d "$skill_path" ] || continue
    skill_name=$(basename "$skill_path")
    dest="$OPENCODE_SKILLS/$skill_name"
    if [ ! -d "$dest" ]; then
      cp -R "$skill_path" "$dest"
      count=$((count + 1))
    fi
  done
  info "Bundle $name: $count skills nuevas copiadas ($(ls "$src_dir" | wc -l | tr -d ' ') totales)"
done < <(jq -r '.bundles[] | "\(.name)\t\(.url)\t\(.skills_subdir)"' "$SCRIPT_DIR/git-skills.json")

bold "[3/4] Verificando configuración opencode"
if [ ! -f "$OPENCODE_CONFIG" ]; then
  info "Copiando opencode.json desde el proyecto"
  mkdir -p "$(dirname "$OPENCODE_CONFIG")"
  cp "$PROJECT_DIR/.config-templates/opencode.json" "$OPENCODE_CONFIG" 2>/dev/null || \
    warn "No se encontró template. Copia manualmente ~/.config/opencode/opencode.json del otro equipo."
else
  ok "opencode.json ya existe"
fi

# Verify plugin superpowers is configured
if grep -q "superpowers" "$OPENCODE_CONFIG" 2>/dev/null; then
  ok "Plugin superpowers configurado"
else
  warn "Añade la línea de plugin superpowers a $OPENCODE_CONFIG:"
  warn '  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]'
fi

bold "[4/4] Verificando MCP servers"
if grep -q "google-search-console\|google-analytics\|cloudflare" "$OPENCODE_CONFIG" 2>/dev/null; then
  ok "MCP servers configurados en opencode.json"
else
  warn "Configura los MCP servers en $OPENCODE_CONFIG"
  warn "Necesitas: cloudflare-api, google-analytics, google-search-console"
  warn "Copia la sección 'mcp' del opencode.json del otro equipo."
fi

echo ""
bold "Resumen"
info "Skills disponibles: $(ls "$OPENCODE_SKILLS" 2>/dev/null | wc -l | tr -d ' ')"
info "Config opencode: $OPENCODE_CONFIG"
info "MCP config: definido en opencode.json (sección 'mcp')"
echo ""
bold "Pasos manuales pendientes:"
echo "  1. Configura GOOGLE_APPLICATION_CREDENTIALS (gcloud auth application-default login)"
echo "  2. Verifica que el token Cloudflare en opencode.json es válido"
echo "  3. Copia .env al proyecto (PEXELS_API_KEY, etc.)"
echo "  4. npm install en el proyecto"
echo ""
ok "Setup completo. Abre opencode en el proyecto y ya tendrás todo."
