#!/usr/bin/env bash
# claude-environment/setup.sh
# Bootstrap del entorno Claude Code (skills + plugins) en una máquina nueva.
# Tras `git pull`, ejecutar este script para sincronizar ~/.claude y ~/.agents con el repo.
#
# Idempotente: se puede ejecutar varias veces. No borra nada del usuario.
# Lo que hace:
#   1. Copia claude-environment/skills/* a ~/.claude/skills/ (vía rsync, no pisa repos clonados)
#   2. git clone los skills externos sueltos (humanizer, mcp-sentinel, prompt-master)
#   3. git clone el bundle marketing-skills a ~/.agents/skills/ y enlaza desde ~/.claude/skills/
#   4. Imprime los marketplaces y plugins que hay que añadir manualmente vía Claude Code
#
# Lo que NO hace (limitaciones del entorno):
#   - No instala plugins automáticamente: el usuario debe ejecutar `/plugin marketplace add <repo>`
#     y `/plugin install <name>` desde Claude Code.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SKILLS="$HOME/.claude/skills"
AGENTS_SKILLS="$HOME/.agents/skills"
SOURCE_SKILLS="$SCRIPT_DIR/skills"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
info() { printf "  → %s\n" "$1"; }
warn() { printf "  ⚠ %s\n" "$1" >&2; }

bold "[1/4] Sincronizando skills locales → $TARGET_SKILLS"
mkdir -p "$TARGET_SKILLS" "$AGENTS_SKILLS"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude='.git/' "$SOURCE_SKILLS"/ "$TARGET_SKILLS"/
else
  warn "rsync no encontrado, usando cp -R"
  cp -R "$SOURCE_SKILLS"/. "$TARGET_SKILLS"/
fi
info "$(ls "$TARGET_SKILLS" | wc -l | tr -d ' ') skills disponibles en $TARGET_SKILLS"

bold "[2/4] Clonando skills externos sueltos"
if ! command -v jq >/dev/null 2>&1; then
  warn "jq no encontrado. Instala con: brew install jq"
  warn "Saltando clones."
else
  while IFS=$'\t' read -r name url; do
    dest="$HOME/.claude/skills/$name"
    if [ -d "$dest/.git" ]; then
      info "$name ya clonado, pull"
      git -C "$dest" pull --ff-only --quiet || warn "$name pull falló"
    else
      info "Clonando $name desde $url"
      rm -rf "$dest"
      git clone --quiet "$url" "$dest"
    fi
  done < <(jq -r '.single_skills[] | "\(.name)\t\(.url)"' "$SCRIPT_DIR/git-skills.json")

  bold "[3/4] Clonando bundles (marketing-skills) → $AGENTS_SKILLS"
  while IFS=$'\t' read -r name url subdir; do
    bundle_repo="$HOME/.agents/_bundles/$name"
    mkdir -p "$HOME/.agents/_bundles"
    if [ -d "$bundle_repo/.git" ]; then
      info "$name pull"
      git -C "$bundle_repo" pull --ff-only --quiet || warn "$name pull falló"
    else
      info "Clonando bundle $name desde $url"
      rm -rf "$bundle_repo"
      git clone --quiet "$url" "$bundle_repo"
    fi
    # Copia/symlink cada skill del bundle
    src_dir="$bundle_repo/$subdir"
    if [ ! -d "$src_dir" ]; then
      warn "subdir $subdir no existe en $name"
      continue
    fi
    for skill_path in "$src_dir"/*/; do
      [ -d "$skill_path" ] || continue
      skill_name=$(basename "$skill_path")
      # Copia archivos reales a ~/.agents/skills/<skill>
      mkdir -p "$AGENTS_SKILLS/$skill_name"
      if command -v rsync >/dev/null 2>&1; then
        rsync -a --delete "$skill_path" "$AGENTS_SKILLS/$skill_name/"
      else
        cp -R "$skill_path"/. "$AGENTS_SKILLS/$skill_name"/
      fi
      # Symlink ~/.claude/skills/<skill> → ~/.agents/skills/<skill>
      ln_target="$AGENTS_SKILLS/$skill_name"
      ln_path="$TARGET_SKILLS/$skill_name"
      if [ ! -L "$ln_path" ] && [ ! -e "$ln_path" ]; then
        ln -s "$ln_target" "$ln_path"
      fi
    done
    info "Bundle $name: $(ls "$src_dir" | wc -l | tr -d ' ') skills procesadas"
  done < <(jq -r '.bundles[] | "\(.name)\t\(.url)\t\(.skills_subdir)"' "$SCRIPT_DIR/git-skills.json")
fi

bold "[4/4] Plugins a instalar manualmente en Claude Code"
echo ""
echo "  Marketplaces (uno por uno: /plugin marketplace add <repo>):"
if command -v jq >/dev/null 2>&1; then
  jq -r 'to_entries[] | "    /plugin marketplace add " + (if .value.source.repo then .value.source.repo else .value.source.url end)' "$SCRIPT_DIR/marketplaces.json"
fi
echo ""
echo "  Plugins (uno por uno: /plugin install <id>):"
if command -v jq >/dev/null 2>&1; then
  jq -r '.plugins[] | "    /plugin install " + .id' "$SCRIPT_DIR/plugins.json"
fi

echo ""
bold "Listo. Reinicia Claude Code para detectar las skills."
