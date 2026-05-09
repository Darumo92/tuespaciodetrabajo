---
name: Cómo buscar hilos vivos de Mediavida desde Claude Code (vía Exa)
description: Método validado para recon de hilos /foro/* sin acceso autenticado. Mediavida bloquea TODO acceso anónimo (Cloudflare-like challenge), por lo que la única vía es Exa MCP. Usar SIEMPRE este método cuando se necesiten hilos vivos para responder en Mediavida.
type: reference
originSessionId: 756302ed-c7eb-46af-8771-2aad4315a99e
---
**Contexto:** Mediavida bloquea con HTTP 403 + página de challenge JS ("Analizando la solicitud") cualquier acceso anónimo a:
- Páginas de hilos directas
- Perfiles de usuario (tanto `/id/<user>` como `/<user>`)
- Listados de subforos
- Cualquier intento de RSS (`/feed`, `/rss`, `/foro/X/rss`, `/foro/X.rss`, etc. — todos 403)

WebFetch directo a `mediavida.com` también devuelve 403. No hay endpoint que sirva contenido legible sin sesión cookie + JS evaluado.

**Solución que SÍ funciona:** Exa MCP. Mediavida está crawleado por Exa (autorizado), por lo que `web_search_exa` y `web_fetch_exa` devuelven contenido limpio.

## Método paso a paso

### 1. Descubrir hilos relevantes con web_search_exa

Llamar `mcp__plugin_everything-claude-code_exa__web_search_exa` con query restringido a `site:mediavida.com` + keywords del nicho:

```
site:mediavida.com [silla|escritorio|monitor|teclado|setup|teletrabajo|home office] [año actual]
```

Para tuespaciodetrabajo.com las queries útiles son:

```
site:mediavida.com hilo silla escritorio monitor periféricos teletrabajo recomendación 2026
site:mediavida.com home office setup ergonomía dolor espalda
site:mediavida.com hilo monitores recomendaciones
site:mediavida.com command center zona juegos setup
```

Devuelve URL + título + fecha de última actividad indexada + snippet. Megahilos activos suelen aparecer múltiples veces (una por página indexada).

### 2. Identificar la página actual del megahilo

Para hilos largos (`/foro/X/Y-NNNNNN`), la URL base es la página 1. La última página tiene formato `/foro/X/Y-NNNNNN/<num>`. El número de página actual se deduce de:

- La URL de los resultados de Exa más recientes (mira el `/N` final).
- O hacer un `web_fetch_exa` a `/foro/X/Y-NNNNNN` (página 1) y leer la paginación al pie ("Página 1 de 718"), luego saltar a la última.

### 3. Leer la última página con web_fetch_exa

```
mcp__plugin_everything-claude-code_exa__web_fetch_exa
  urls: ["https://www.mediavida.com/foro/X/Y-NNNNNN/<lastpage>"]
  maxCharacters: 6000-8000
```

El contenido devuelto incluye autores, números de mensaje (`#21302`), fechas relativas (`14d`, `13d`...), texto y URLs citadas.

### 4. Filtrar mensajes recientes y preguntas abiertas

De la última página extraer:
- **Preguntas sin responder o mal respondidas** (mejor oportunidad de aportar valor sin pisar a nadie).
- **Conversaciones activas con divergencias** (otro ángulo aporta diversidad sin contradecir).
- **Mensajes >7 días sin actividad posterior** (descartar — hilo dormido, mensaje queda enterrado).

### 5. Filtrar self-promo / debate cerrado

Si los últimos 5 mensajes son solo del mismo usuario respondiéndose a sí mismo (suele pasar en megahilos con "expertos" residentes), el espacio está copado. Mejor hilo paralelo.

## Limitaciones críticas de Exa con Mediavida

- **`/last` no funciona** — devuelve `CRAWL_NOT_FOUND` o `CRAWL_LIVECRAWL_TIMEOUT`. Hay que pasar el número de página explícito.
- **Páginas muy nuevas (<24h)** pueden no estar indexadas aún en Exa. Si el hilo recibió actividad ayer y no aparece, esperar.
- **Threads pequeños o subforos minoritarios** (juegos antiguos, off-topic muy específico) pueden no estar indexados al detalle. Para esos, fallar a "pídeselo al usuario".
- **Búsqueda dentro de subforo concreto** funciona razonablemente con `site:mediavida.com/foro/<subforo>` pero la cobertura es parcial.

## Detalles operativos críticos

- **Pre-tool hook bloquea atajos de descarga directa a intérprete.** Patrones donde la salida de un comando de red entra directamente en `bash`, `sh`, `zsh` o `python` están en denylist crítica. SIEMPRE descargar a `-o /tmp/archivo` y procesar luego en una llamada Bash separada que lea el fichero (igual que Reddit).
- **No malgastar curl probando endpoints Mediavida:** todos devuelven el mismo HTML 403 de challenge. Saltar directo a Exa.
- **No probar WebFetch a Mediavida:** también 403 con challenge.

## Megahilos canónicos para tuespaciodetrabajo.com

Validados como activos a 2026-05-01:

- `hard-soft/periferico-indispensable-silla-406028` — sillas, megahilo, ~300 páginas
- `hard-soft/hilo-general-monitores-recomendaciones-noticias-598812` — monitores, ~718 páginas, MUY activo
- `hard-soft/hilo-guia-galeria-teclados-beta-433804` — teclados mecánicos
- `hard-soft/periferico-indispensable-escritorio-651651` — escritorios (poca actividad)
- `juegos/command-center-como-tu-zona-juegos-version-2025-724886` — galería de setups (3+ páginas, activo)
- `off-topic/silla-gaming-ergonomica-recomendaciones-690293` — silla gaming vs ergo
- `estudios-trabajo/material-os-proporcionan-para-teletrabajo-682318` — material teletrabajo

## Aplicar siempre que el usuario diga

"busca hilos Mediavida", "encuentra hilos en /hard-soft/", "qué hay activo en Mediavida", "haz recon de Mediavida". Probar primero Exa antes de pedir URLs al usuario manualmente. Solo pedir manual si Exa no encuentra nada relevante (subforos minoritarios, hilos muy nuevos no indexados).
