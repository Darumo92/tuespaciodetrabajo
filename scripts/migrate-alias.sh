#!/usr/bin/env bash
# Migración transparente: alias legacy -> tokens editoriales canónicos.
# Cada alias mapea 1:1 a su token (ver definiciones en global.css :root/dark).
# Orden: mas especifico primero. NO toca --color-footer-* (paleta footer canonica, se conserva).
set -euo pipefail
f="$1"
sed -i \
  -e 's/var(--color-bg-card)/var(--surface)/g' \
  -e 's/var(--color-bg-muted)/var(--surface-muted)/g' \
  -e 's/var(--color-bg-subtle)/var(--surface-subtle)/g' \
  -e 's/var(--color-bg)/var(--bg)/g' \
  -e 's/var(--color-text-muted)/var(--ink-muted)/g' \
  -e 's/var(--color-text-light)/var(--ink-light)/g' \
  -e 's/var(--color-text)/var(--ink)/g' \
  -e 's/var(--color-border-dark)/var(--border-strong)/g' \
  -e 's/var(--color-border)/var(--border)/g' \
  -e 's/var(--color-primary-dark)/var(--accent-hover)/g' \
  -e 's/var(--color-primary-light)/var(--accent)/g' \
  -e 's/var(--color-primary)/var(--accent)/g' \
  -e 's/var(--color-secondary-text)/var(--accent)/g' \
  -e 's/var(--color-secondary)/var(--accent)/g' \
  -e 's/var(--color-accent)/var(--accent)/g' \
  -e 's/var(--color-rose-dark)/var(--accent-hover)/g' \
  -e 's/var(--color-rose-light)/var(--accent)/g' \
  -e 's/var(--color-rose)/var(--accent)/g' \
  -e 's/var(--color-cat-articulos)/var(--ink-muted)/g' \
  -e 's/var(--color-cat-sillas)/var(--accent)/g' \
  -e 's/var(--color-cat-escritorios)/var(--accent)/g' \
  -e 's/var(--color-cat-accesorios)/var(--accent)/g' \
  -e 's/var(--color-cat-ambiente)/var(--accent)/g' \
  -e 's/var(--color-cat-audio-video)/var(--accent)/g' \
  -e 's/var(--color-cat-guias)/var(--accent)/g' \
  -e 's/var(--color-cat-herramientas)/var(--accent)/g' \
  -e 's/var(--radius-md)/var(--radius)/g' \
  -e 's/var(--radius-lg)/var(--radius)/g' \
  -e 's/var(--radius-xl)/var(--radius)/g' \
  -e 's/var(--radius-2xl)/var(--radius)/g' \
  -e 's/var(--glass-bg-strong)/var(--surface)/g' \
  -e 's/var(--glass-bg)/var(--surface)/g' \
  -e 's/var(--glass-border)/var(--border)/g' \
  "$f"
echo "migrated: $f"
