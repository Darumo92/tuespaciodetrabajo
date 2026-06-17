---
name: Método validado fetch karma Reddit
description: Cómo leer karma de una cuenta Reddit pública desde Claude Code. Método preferente actual: old.reddit HTML. Fallback: about.json/RSS.
type: reference
---

## Método preferente actual: old.reddit HTML

Validado en este proyecto el **2026-06-16** tras revisar el workflow de Patas y Hogar.

`www.reddit.com/user/{USERNAME}/about.json` puede devolver pantalla HTML de bloqueo (`You've been blocked by network security`) aunque la cuenta esté visible y sana. En ese caso, no pedir karma manual al usuario todavía: probar primero `old.reddit.com`.

### Comando

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"

curl -sL -A "$UA" "https://old.reddit.com/user/{USERNAME}/" -o /tmp/rd_user.html
rg -o '<span class="karma[^>]*>[0-9]+</span>|post karma|comment karma|redditor for[^<]*<time title="[^"]+"' /tmp/rd_user.html
```

### Lectura

El HTML suele devolver dos valores:

- `<span class="karma">N</span>` -> post/link karma.
- `<span class="karma comment-karma">N</span>` -> comment karma.

`total_karma = post karma + comment karma`.

Validación 2026-06-16 para `Dear_Potato8535`:

- post karma: `1`
- comment karma: `23`
- total karma: `24`
- cuenta visible públicamente en `old.reddit.com/user/Dear_Potato8535/`

## Señales de cuenta viva / problema

- Si aparece la caja de perfil con karma, la cuenta está visible públicamente.
- Si el HTML contiene `there doesn't seem to be anything here`, distinguir perfil vacío de shadowban revisando título/cabecera y buscando el username.
- Si `old.reddit.com` devuelve `429`, esperar y reintentar más tarde. No asumir shadowban.
- Si `old.reddit.com` no muestra karma y `about.json` devuelve 403/bloqueo, pedir confirmación manual al usuario.

## Fallback 1: about.json

Usar solo si `old.reddit.com` falla o para comparar.

```bash
curl -sSL -A "$UA" "https://www.reddit.com/user/{USERNAME}/about.json" -o /tmp/rd_about.json
python3 -m json.tool /tmp/rd_about.json
```

Campos de interés si devuelve JSON real:

- `link_karma`
- `comment_karma`
- `total_karma`
- `created_utc`
- `is_suspended`
- `has_verified_email`

Problema conocido: puede devolver HTML de bloqueo con HTTP 200 y tamaño grande. Si `python3 -m json.tool` falla, comprobar primeras líneas del fichero antes de concluir nada.

## Fallback 2: RSS de usuario

RSS no da karma. Solo sirve para visibilidad/actividad reciente.

```bash
curl -sL -A "$UA" "https://www.reddit.com/user/{USERNAME}/comments/.rss" -o /tmp/rd_user_comments.rss
```

Limitaciones:

- Puede devolver `429`.
- Puede estar vacío aunque el perfil y los comentarios existan.
- No usarlo como fuente única para shadowban.

## Cuentas del ecosistema

- `Dear_Potato8535` — tuespaciodetrabajo.
- `Pristine_Review5630` — patasyhogar, referencia de método validado.

## Orden operativo

1. `old.reddit.com/user/{USERNAME}/` para karma y visibilidad.
2. `about.json` solo como comparación/fallback.
3. RSS de usuario solo para actividad reciente.
4. Confirmación manual del usuario solo si los tres métodos fallan o contradicen datos visibles.
