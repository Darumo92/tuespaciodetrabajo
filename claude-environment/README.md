# claude-environment/

Estado replicable del entorno de agentes para este proyecto. Se versiona en repo para que cualquier máquina, tras `git pull`, pueda reproducir skills y plugins.

## Uso en máquina nueva (macOS o Linux)

```bash
git clone <repo> tuespaciodetrabajo
cd tuespaciodetrabajo
bash claude-environment/setup.sh
npm install
```

El script:
1. Clona skills externos (humanizer, mcp-sentinel, prompt-master) a `~/.config/opencode/skills/`
2. Clona bundle marketing-skills (36 skills) a `~/.config/opencode/skills/`
3. Verifica que opencode.json tiene plugin superpowers y MCP servers configurados
4. Imprime pasos manuales restantes (credentials, .env, etc.)

## Archivos

| Archivo | Qué es |
|---------|--------|
| `git-skills.json` | Skills/bundles a clonar desde GitHub |
| `marketplaces.json` | Legacy: plugin marketplaces de Claude Code (referencia) |
| `plugins.json` | Legacy: plugins Claude Code (referencia) |
| `setup.sh` | Script bootstrap (idempotente) |

## Pasos manuales tras el script

1. `gcloud auth application-default login` (para GA4 y GSC MCPs)
2. Verificar token Cloudflare en `~/.config/opencode/opencode.json`
3. Copiar `.env` al proyecto (PEXELS_API_KEY, etc.)
4. Si el opencode.json no existe: copiar del otro equipo o crear desde la plantilla en el repo

## Mantener actualizado

Cuando instales una skill nueva y quieras propagarla:

```bash
# Si es skill de GitHub (external), añadirla a git-skills.json
# Si es skill local custom, el setup no la cubre — copiarla manualmente

# Re-ejecutar setup en la otra máquina:
git pull
bash claude-environment/setup.sh
```

## Lo que NO se sincroniza (intencionado)

- `~/.config/opencode/opencode.json` — contiene tokens y paths absolutos por máquina
- `~/.config/opencode/node_modules/` — pesado, regenerable
- `.env` — secretos locales
- `skills/` — ya no se versiona (reproducible via setup.sh desde los repos fuente)
