---
name: Cómo leer Reddit desde Claude Code
description: Método validado para karma, hilos vivos, búsquedas y comentarios sin login. Preferente: old.reddit HTML. Fallback: RSS.
type: reference
originSessionId: 756302ed-c7eb-46af-8771-2aad4315a99e
---

## Método preferente v2: old.reddit HTML

Actualizado el **2026-06-16** tras revisar el proyecto Patas y Hogar y validarlo en `tuespaciodetrabajo`.

Motivo: `www.reddit.com/.../.rss` y `www.reddit.com/user/.../about.json` pueden devolver `429`, HTML vacío o pantalla de bloqueo. `old.reddit.com` funcionó en la misma sesión para:

- leer karma público de `Dear_Potato8535`;
- listar hilos nuevos de `r/Ergonomics`;
- buscar dentro de `r/askspain`;
- abrir hilos completos de `r/Ergonomics`.

UA recomendado:

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
```

## Orden operativo diario

1. Verificar karma/cuenta viva con `old.reddit.com/user/{USERNAME}/`.
2. Revisar hilos nuevos por subreddit con `old.reddit.com/r/SUB/new/`.
3. Hacer búsquedas temáticas en subs grandes con `old.reddit.com/r/SUB/search?...`.
4. Leer hilo completo y comentarios existentes antes de redactar.
5. Revisar replies en hilos trackeados desde `project_backlinks_session_state.md`.
6. Usar RSS o Brave solo si old.reddit falla.

## 1. Karma y estado de cuenta

Ver `reference_reddit_karma_fetch.md`. Resumen:

```bash
curl -sL -A "$UA" "https://old.reddit.com/user/Dear_Potato8535/" -o /tmp/rd_user.html
rg -o '<span class="karma[^>]*>[0-9]+</span>|post karma|comment karma|redditor for[^<]*<time title="[^"]+"' /tmp/rd_user.html
```

Validado 2026-06-16:

- `Dear_Potato8535`: post karma `1`, comment karma `23`, total `24`.

## 2. Hilos nuevos por subreddit

```bash
curl -sL -A "$UA" "https://old.reddit.com/r/Ergonomics/new/" -o /tmp/rd_ergonomics_new.html
curl -sL -A "$UA" "https://old.reddit.com/r/OfficeChairs/new/" -o /tmp/rd_officechairs_new.html
curl -sL -A "$UA" "https://old.reddit.com/r/StandingDesks/new/" -o /tmp/rd_standingdesks_new.html
curl -sL -A "$UA" "https://old.reddit.com/r/homeoffice/new/" -o /tmp/rd_homeoffice_new.html
```

Extraer candidatos:

```bash
rg -o 'data-fullname="t3_[^"]+"|data-author="[^"]+"|class="title may-blank[^>]*>[^<]+|href="https://old\.reddit\.com/r/[^"]+/comments/[a-z0-9]+/[^"]+"|<time title="[^"]+"' /tmp/rd_ergonomics_new.html | head -180
```

Campos útiles:

- `data-fullname="t3_ID"` -> ID de post.
- `data-author="..."` -> autor.
- `class="title may-blank ...>` -> título.
- `<time title="... UTC"` -> fecha.
- `href="https://old.reddit.com/r/.../comments/ID/slug/"` -> URL.

## 3. Búsqueda temática en subs grandes

Sirve para `r/askspain`, `r/spain`, `r/Madrid`, `r/Barcelona`, `r/programacion`, etc.

```bash
curl -sL -A "$UA" \
  "https://old.reddit.com/r/askspain/search?q=teletrabajo+OR+silla+OR+programacion&restrict_sr=1&sort=new&t=week" \
  -o /tmp/rd_askspain_search.html
```

Extraer:

```bash
rg -o 'data-fullname="t3_[^"]+"|href="https://old\.reddit\.com/r/[^"]+/comments/[a-z0-9]+/[^"]+"|comments may-blank" >[0-9]+ comments</a>|<time title="[^"]+"|search-result-body|search-result-header' /tmp/rd_askspain_search.html | head -160
```

Notas:

- La búsqueda puede devolver candidatos parcialmente relacionados. Leer siempre el hilo antes de redactar.
- Si un resultado no abre en `old.reddit`, probar `www.reddit.com` en navegador manual o elegir otro candidato.

## 4. Leer hilo completo y comentarios existentes

```bash
curl -sL -A "$UA" "https://old.reddit.com/r/SUB/comments/ID/SLUG/" -o /tmp/rd_thread.html
```

Extraer señales rápidas:

```bash
rg -n 'thing id-t3_|data-author=|usertext-body|<div class="md"|score unvoted|data-fullname="t1_|data-permalink=|Dear_Potato8535' /tmp/rd_thread.html | head -180
```

Datos que se pueden leer:

- OP: bloque `thing id-t3_ID`.
- Comentarios: bloques `thing id-t1_...`.
- Autor: `data-author="..."`.
- Permalink: `data-permalink="/r/.../COMMENT_ID/"`.
- Texto: `<div class="md">...`.
- Score: `score unvoted" title="N"`.
- Replies: bloques `child`, `data-replies`, `numchildren`.

Limitación validada 2026-06-16:

- Algunos hilos directos pueden devolver 404 o bloqueo aunque el listado funcione. Ejemplo: `r/askspain` `1v6wh6n` devolvió 404 en `old.reddit`. En esos casos, no marcar el borrador como definitivo sin ver el hilo manualmente.

## 5. Revisar replies en hilos trackeados

No depender del perfil RSS. Flujo:

1. Leer `docs/agent-context/project_backlinks_session_state.md`.
2. Extraer URLs/IDs de hilos donde `Dear_Potato8535` comentó en los últimos 7-14 días.
3. Descargar cada hilo con `old.reddit`.
4. Buscar `data-author="Dear_Potato8535"`.
5. Revisar si el bloque tiene hijos/replies posteriores.

Ejemplo:

```bash
curl -sL -A "$UA" "https://old.reddit.com/r/Ergonomics/comments/1tvaf8e/office_chair_for_great_lumbar_support_in_the/" -o /tmp/rd_thread.html
rg -n 'data-author="Dear_Potato8535"|data-fullname="t1_|data-replies=|numchildren|<time title=' /tmp/rd_thread.html
```

`scripts/reddit_replies.py` sigue siendo útil, pero si falla por XML vacío o `429`, usar este método manual antes de concluir que no hay replies.

## 6. Fallback RSS

Usar cuando old.reddit falle o para vista limpia del contenido.

### Listados

```bash
curl -sL -A "$UA" "https://www.reddit.com/r/SUB/new/.rss" -o /tmp/sub_new.rss
```

Preferir `/new/.rss`. Evitar `new.rss?limit=N`, que puede devolver feed vacío.

### Comentarios de hilo

```bash
curl -sL -A "$UA" "https://old.reddit.com/r/SUB/comments/ID/SLUG/.rss?sort=new" -o /tmp/rd_thread.xml
rg -n '<entry>|<name>|<title>|<link href|<content' /tmp/rd_thread.xml | head -160
```

## 7. Reglas antes de redactar comentarios

- Leer body completo del post y comentarios existentes.
- Si el hilo depende de imagen/media y no se puede ver, marcarlo como candidato débil o descartarlo.
- Verificar si `Dear_Potato8535` ya comentó en el hilo. Doble comentario en el mismo hilo puede parecer spam.
- Si no se puede verificar automáticamente, preguntar al usuario antes de redactar: "¿Ya comentaste en alguno de estos hilos?"
- En Reddit mantener 0 links hasta confirmar `total_karma >=50`.
- Hilos EN sirven para karma/credibilidad; links propios solo en ES cuando el contexto sea fuerte.

## 8. Subreddits útiles para tuespaciodetrabajo.com

**ES:**

- `r/askspain`
- `r/spain`
- `r/Autonomos`
- `r/programacion`
- `r/freelance_es`
- `r/Madrid`
- `r/Barcelona`

**EN:**

- `r/Ergonomics`
- `r/OfficeChairs`
- `r/StandingDesks`
- `r/homeoffice`
- `r/wfh`
- `r/HomeOfficeSetups`

## 9. Qué no usar por defecto

- `.json` de posts/subreddits como primera opción: suele bloquear.
- `www.reddit.com/user/{USERNAME}/about.json` como única fuente de karma: puede devolver HTML de bloqueo con HTTP 200.
- RSS de usuario como única fuente de visibilidad: puede devolver `429` o vacío.
- Web search para inventar URLs de Reddit: si se usa buscador externo, abrir/verificar antes de redactar.

## Aplicar siempre que el usuario diga

"busca hilos Reddit", "encuentra hilos vivos en r/X", "haz recon de Reddit", "qué hay esta semana en X subreddit", "revisa karma", "revisa replies Reddit", "plan de Reddit de hoy".
