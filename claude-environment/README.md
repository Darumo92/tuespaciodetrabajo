# claude-environment/

Estado replicable del entorno Claude Code para este proyecto. Se versiona en repo para que cualquier máquina, tras `git pull`, pueda reproducir las skills y plugins exactamente.

## Uso en máquina nueva

```bash
git clone <repo> tuespaciodetrabajo
cd tuespaciodetrabajo
bash claude-environment/setup.sh
```

El script:

1. Copia `claude-environment/skills/` → `~/.claude/skills/` (40 skills)
2. Clona los skills externos (`humanizer`, `mcp-sentinel`, `prompt-master`) desde sus repos
3. Imprime la lista de marketplaces y plugins que hay que añadir manualmente vía Claude Code (no hay CLI estable aún)

Tras ejecutar el script, abre Claude Code y ejecuta uno por uno los `/plugin marketplace add ...` y `/plugin install ...` que el script imprime.

## Archivos

| Archivo | Qué es |
|---------|--------|
| `skills/` | Copia de `~/.claude/skills/` sin `.git/` interno (40 skills, ~1MB) |
| `git-skills.json` | Skills clonadas desde GitHub (humanizer, mcp-sentinel, prompt-master) — el script las re-clona |
| `marketplaces.json` | Lista de plugin marketplaces conocidos con su repo origen |
| `plugins.json` | Plugins instalados (id + marketplace + versión) |
| `setup.sh` | Script bootstrap (idempotente) |

## Mantener actualizado

Cuando instales una skill o plugin nuevo en local y quieras propagarlo a otras máquinas:

```bash
# Re-sincronizar skills
rsync -a --exclude='.git/' ~/.claude/skills/ claude-environment/skills/

# Regenerar manifests
cp ~/.claude/plugins/known_marketplaces.json claude-environment/marketplaces.json
python3 -c "
import json
d = json.load(open('$HOME/.claude/plugins/installed_plugins.json'))
out = {'version': 1, 'plugins': []}
for fid, ins in d.get('plugins', {}).items():
    name, mp = fid.split('@', 1) if '@' in fid else (fid, '')
    versions = sorted({i.get('version') for i in ins if i.get('version')})
    out['plugins'].append({'id': fid, 'name': name, 'marketplace': mp, 'versions': versions})
json.dump(out, open('claude-environment/plugins.json', 'w'), indent=2)
"

git add claude-environment/
git commit -m "chore: sync claude environment"
git push
```

## Lo que NO se sincroniza (intencionado)

- `.claude/settings.local.json` — paths absolutos y permisos específicos máquina
- `~/.claude/plugins/cache/` — pesado (218MB), regenerable
- `~/.claude/projects/<proyecto>/memory/` — antes era memoria local; ahora vive en `docs/agent-context/`
- Skills/plugins instalados globalmente que no se hayan copiado aquí
