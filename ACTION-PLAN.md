# SEO Action Plan — tuespaciodetrabajo.com

**Fecha:** 2026-06-04 · **Health Score:** 84/100 (Good) · **Motor:** claude-seo v2.0.0 + GSC + Common Crawl
**Bloqueo real:** indexación + autoridad (1/42 URLs). Único fix de código relevante: quitar FAQPage.

---

## ✅ HECHO (2026-06-04)

### 1. Eliminar FAQPage + HowTo schema — COMPLETADO
- `FAQPage` (restringido gov/health) y `HowTo` (deprecado Sept-2023) eliminados de `src/layouts/Article.astro` y `src/pages/herramientas/calculadora-ergonomia.astro`.
- FAQ visible (HTML) conservada. Build OK (49 páginas). Verificado: `grep FAQPage dist/` = 0, `grep HowTo dist/` = 0.

### ~~Validar schema Product~~ — NO NECESARIO
- Verificado en build: cada `Product` ya tiene `Offer` + `Review` + `Rating` + `Brand` + `MerchantReturnPolicy` + `OfferShippingDetails`. Bien formado.

---

## 🔴 Critical — la indexación NO se arregla forzándola

> **Realidad confirmada por el usuario (2026-06-04):** se ha solicitado indexación manual varias veces y Google NUNCA indexa estas páginas.

- **Diagnóstico:** `Crawled - currently not indexed` repetido pese a solicitudes = Google las descubre, las rastrea, y **decide no indexarlas**. No es problema de descubrimiento ni de config. Es **umbral de calidad/autoridad**: para un dominio nuevo sin autoridad (Common Crawl: pagerank `null`, 0 referring domains), Google no "gasta" índice.
- **Conclusión:** "Solicitar indexación" es inútil aquí. **Dejar de hacerlo.** La única palanca que mueve `not indexed → indexed` en sitio nuevo es **autoridad externa real**.

### 2. Autoridad externa = ÚNICA palanca real (P0)
- **Realidad medida (2026-06-04):** 1 backlink de Quora NO ha bastado. Google descubrió el enlace (`es.quora.com` en `referringUrls`) pero la página sigue `not indexed`, 0 impresiones. El re-crawl 06-03 vino de la indexación manual, NO del enlace. Quora usa `nofollow` → sirve para tráfico de referido y descubrimiento, NO para pasar autoridad de indexación.
- **Conclusión:** hace falta **volumen + calidad** de autoridad, no enlaces sueltos nofollow.
- **Cómo (por orden de impacto en indexación):**
  1. **Backlinks dofollow reales** — directorios de nicho que pasen link juice, menciones editoriales, colaboraciones/guest posts, comparadores home office. ESTO es lo que mueve indexación.
  2. **Tráfico real a las páginas** — Quora ES / LinkedIn / Reddit (karma≥50) como FUENTE DE VISITAS. El tráfico real es señal de demanda que empuja indexación. Mantener Quora por esto, no por el link.
  3. Seguir publicando contenido enlazado internamente para reforzar las páginas con autoridad de las pocas que sí indexen.
- **Esfuerzo:** alto, sostenido (semanas) · **Impacto:** es lo único que mueve la aguja.

---

## 🟡 Medium (este mes)

### 5. Enlazado interno guías → comparativas
- Desde guías informativas enlazar a comparativas transaccionales con anchor descriptivo. Reparte autoridad interna.

### 6. Confirmar Core Web Vitals
- Configurar API key: `~/.config/claude-seo/google-api.json` con `api_key`.
- Re-ejecutar `pagespeed_check.py https://tuespaciodetrabajo.com --strategy mobile`. Objetivo LCP<2.5s, INP<200ms, CLS<0.1.

### 7. Gestión explícita de AI crawlers (W2)
- Bloques `Allow` para GPTBot, ClaudeBot, PerplexityBot, Google-Extended en robots.txt.

---

## 🔵 Low (backlog)
- `llms-full.txt` con guías clave (W4).
- `twitter:site`/`twitter:creator` (W3).
- Reducir repetición en artículo pilar (W5).

---

## Lo que NO tocar (ya correcto)
- Headers seguridad (100/100), HTTPS, HSTS, CSP.
- Canonical, hreflang, redirects, robots.txt base.
- Title/meta/H1. Imágenes (webp+alt+dims+lazy).
- Schema home (WebSite/Organization/ItemList).
- llms.txt. Calidad de contenido (95/100, 0 patrones IA).

---

## Métrica de éxito (7-14 días)
1. ✅ FAQPage/HowTo eliminados (hecho, verificado en build).
2. Más referrers Quora/LinkedIn en GSC (ya hay 1) → ≥1 por página prioritaria.
3. Páginas con backlink pasan a re-crawl reciente (como ya hizo ergonomía).
4. Tras re-crawl con autoridad: paso a `Indexed` + primeras impresiones (>0/día).

> NO usar como métrica "solicité indexación": confirmado inútil en este dominio.
