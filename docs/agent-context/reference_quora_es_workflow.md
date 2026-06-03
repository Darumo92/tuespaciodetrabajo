---
name: Quora ES workflow para tuespaciodetrabajo
description: Metodo validado para encontrar preguntas REALES en Quora ES (sin inventar URLs) y redactar respuestas con link contextual hacia articulos del sitio. Cuando el usuario diga "busca preguntas en quora", "backlinks quora", "outreach quora", usar este flujo.
type: reference
---

# Quora ES — workflow tuespaciodetrabajo

Adaptado del metodo validado en el proyecto patasyhogar. Misma mecanica de busqueda, distinta marca/nicho.

## Por que existe este doc

`WebSearch` (Brave/Bing interno) a veces devuelve slugs de Quora **aproximados o mal codificados** que 404ean al abrirlos. No fiarse de URLs sacadas solo de WebSearch. Quora bloquea a bots: `curl` y `WebFetch` directos a `es.quora.com/...` dan **403** exista o no la pagina, asi que tampoco sirven para verificar.

## Como encontrar preguntas REALES (metodo validado)

**Usar Brave Search con operador `site:es.quora.com/` via `WebFetch`.** Devuelve titulos, URLs completas y snippets reales del indice de Brave; son URLs que existen de verdad.

Formato de la URL a pasar a WebFetch:

```text
https://search.brave.com/search?q=site%3Aes.quora.com%2F%20<keywords%20url-encoded>
```

Prompt recomendado en WebFetch:

> "Lista TODOS los resultados que apunten a es.quora.com. Para cada uno dame el titulo exacto de la pregunta y la URL completa exacta (sin acortar). No inventes ninguna URL, copia solo las que aparezcan literalmente."

Ejemplos de queries utiles para el nicho (home office / ergonomia / teletrabajo):

```text
site:es.quora.com/ silla ergonomica teletrabajo espalda
site:es.quora.com/ dolor de espalda trabajar sentado ordenador
site:es.quora.com/ posicion correcta frente al ordenador
site:es.quora.com/ escritorio elevable de pie trabajar
site:es.quora.com/ monitor altura cuello teletrabajo
site:es.quora.com/ silla bajo presupuesto oficina
```

Pasos:
1. Lanzar 2-4 variaciones de keyword en Brave.
2. Priorizar preguntas con intencion clara y encaje con un articulo EXISTENTE del sitio.
3. Preguntas viejas con vistas / con varias respuestas ya = mejor distribucion que preguntas nuevas sin engagement.
4. **Verificar fit del articulo destino** antes de redactar: hacer `WebFetch` de la URL del sitio (esa si responde 200) y comprobar que cubre lo que promete el borrador. No prometer en Quora algo que el articulo no tiene.
5. Si Brave da snippet suficiente, redactar sin necesidad de leer todo Quora (el agente no puede por 403).

**Fallbacks** (solo si Brave falla): DuckDuckGo HTML 1-2 consultas antes de captcha. Quora search directo NO (403). Google/Bing suelen pedir challenge.

## Patron de respuesta

Formato 250-450 palabras (mas corto que patasyhogar; aqui el lector busca decision rapida de compra/ajuste).

Estructura:
```
[Apertura directa: dato o correccion de mito (1-2 frases, sin pleasantries)]
[Punto 1 practico con dato concreto]
[Punto 2 practico con dato concreto]
[Punto 3 practico con dato concreto]
[Cierre + 1 link contextual SOLO si aporta]
```

Reglas:
1. **Sin pleasantries de apertura.** Nada de "buena pregunta", "depende de muchos factores". Entrar directo.
2. **Maximo 3 puntos.** Mas = TL;DR.
3. **Datos concretos** del articulo real: precios, angulos, cm, frecuencias. No abstracto.
4. **1 solo link por respuesta**, anchor contextual (no "lee aqui"/"mas info"). Si el link no encaja natural, omitir.
5. **Ratio respuesta:link 2-3:1** a lo largo del tiempo: algunas respuestas sin link para no parecer promocional.
6. **Humanizer obligatorio** antes de publicar (usar skill `humanizer`). Tells de IA matan Quora.
7. **No firmar** al final; el perfil ya firma.
8. **Identidad:** tuespaciodetrabajo es marca personal real de David Rubio. Coherente con LinkedIn (mismo autor). No inventar credenciales medicas: NO somos medico/fisio/PRL; en temas de dolor, derivar a profesional cuando toque.

## Mapeo pregunta -> articulo destino

| Tema pregunta | Articulo |
|---|---|
| Elegir silla / calidad-precio / bajo presupuesto | `/sillas/mejor-silla-ergonomica-calidad-precio/` |
| Dolor de espalda por estar sentado | `/guias/dolor-espalda-trabajar-casa/` |
| Postura / posicion correcta frente al ordenador | `/guias/ergonomia-teletrabajo-postura-correcta/` |
| Escritorio elevable / trabajar de pie | `/escritorios/mejor-escritorio-elevable-electrico/` |
| Monitor / altura pantalla | `/accesorios/mejor-monitor-trabajar-desde-casa/` |

## Cadencia y riesgos

- Maximo 3 respuestas largas/semana, espaciadas 24h+ (evitar batch -> spam flag).
- Cuenta nueva: no forzar volumen el primer mes.
- Shadowban silencioso si patron promocional: verificar respuestas en incognito de vez en cuando.
- Escribir nativo ES; no traducir respuestas EN.

## Por que Quora importa en el recovery

Evidencia GSC: el unico referrer externo que ha conseguido que Google rastree la URL test `/guias/ergonomia.../` es una pregunta de Quora ES. Con el sitio en `Crawled - not indexed` por falta de autoridad (0 backlinks documentados), cada respuesta Quora con link crawlable suma descubrimiento + senal de autoridad. Es de los pocos canales crawlables disponibles ahora (Reddit bloqueado hasta `total_karma >= 50`).

## Estado / registro

Anotar respuestas publicadas (URL pregunta + tema + articulo enlazado + fecha) en `project_recovery_session_state.md` o el doc de estado de backlinks que corresponda.
