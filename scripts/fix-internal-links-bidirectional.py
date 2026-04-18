#!/usr/bin/env python3
"""Regenera internal_links_to e internal_links_from en content-map.yaml
escaneando los links reales de los MDX.

Flujo:
1. Escanea cada MDX en src/content/articulos/ y src/pages/herramientas/*.astro
2. Extrae slugs referenciados via /(categoria|guias|herramientas)/slug/
3. Los `internal_links_to` de cada entry se reemplazan por los slugs reales
4. Los `internal_links_from` se derivan invirtiendo el grafo
5. Preserva "sillas (categoría)" y otros items con espacios (se mantienen si existían)
"""
import re
import sys
from pathlib import Path

from ruamel.yaml import YAML

ROOT = Path(__file__).resolve().parents[1]
CMAP = ROOT / ".seo-engine" / "data" / "content-map.yaml"
ARTICULOS_DIR = ROOT / "src" / "content" / "articulos"
TOOLS_DIR = ROOT / "src" / "pages" / "herramientas"

LINK_RE = re.compile(
    r"/(?:sillas|escritorios|accesorios|ambiente|audio-video|guias|herramientas)/([a-z0-9-]+)/"
)


def extract_slugs_from_file(path: Path, self_slug: str) -> set[str]:
    if not path.exists():
        return set()
    text = path.read_text(encoding="utf-8")
    slugs = set(LINK_RE.findall(text))
    slugs.discard(self_slug)
    return slugs


def main():
    y = YAML()
    y.preserve_quotes = True
    y.width = 4096
    y.indent(mapping=2, sequence=4, offset=2)
    data = y.load(CMAP.read_text(encoding="utf-8"))

    entries = []
    for key in ("articles", "tools"):
        for item in data.get(key) or []:
            entries.append(item)

    by_slug = {e["slug"]: e for e in entries if "slug" in e}

    # Preserve category-style entries ("sillas (categoría)") that appeared before
    preserved_specials = {}
    for e in entries:
        slug = e["slug"]
        old_to = e.get("internal_links_to") or []
        preserved_specials[slug] = [s for s in old_to if " " in s]

    # Step 1: recompute internal_links_to by scanning MDX/Astro files
    to_map = {slug: set() for slug in by_slug}
    missing_files = []

    for e in entries:
        slug = e["slug"]
        path_str = e.get("path")
        if not path_str:
            continue
        file_path = ROOT / path_str
        if not file_path.exists():
            missing_files.append(path_str)
            continue
        found = extract_slugs_from_file(file_path, slug)
        to_map[slug] = found

    # Report unknown refs (slugs in MDX that don't exist as entries)
    unknown_refs = set()
    for slug, targets in to_map.items():
        for t in targets:
            if t not in by_slug:
                unknown_refs.add((slug, t))

    # Step 2: derive from_map by inverting to_map (only for known slugs)
    from_map = {slug: set() for slug in by_slug}
    for src, targets in to_map.items():
        for t in targets:
            if t in from_map:
                from_map[t].add(src)

    # Step 3: write back
    changes_to = 0
    changes_from = 0
    for e in entries:
        slug = e["slug"]
        new_to = sorted(s for s in to_map[slug] if s in by_slug)
        # Append preserved specials (categoría) at end
        new_to += preserved_specials.get(slug, [])
        new_from = sorted(from_map[slug])

        old_to = list(e.get("internal_links_to") or [])
        old_from = list(e.get("internal_links_from") or [])

        if old_to != new_to:
            changes_to += 1
            print(f"[TO    ] {slug}: {len(old_to)} -> {len(new_to)}")
        if sorted(old_from) != new_from:
            changes_from += 1
            print(f"[FROM  ] {slug}: {len(old_from)} -> {len(new_from)}")

        e["internal_links_to"] = new_to
        e["internal_links_from"] = new_from

    if unknown_refs:
        print("\n[WARN] Links en MDX a slugs no registrados en content-map:")
        for src, t in sorted(unknown_refs):
            print(f"  {src} -> {t}")

    if missing_files:
        print("\n[WARN] Paths en content-map no encontrados:")
        for p in missing_files:
            print(f"  {p}")

    with open(CMAP, "w", encoding="utf-8") as f:
        y.dump(data, f)

    print(f"\n[OK] {CMAP.relative_to(ROOT)} actualizado")
    print(f"     entries: {len(entries)} | to changes: {changes_to} | from changes: {changes_from}")


if __name__ == "__main__":
    main()
