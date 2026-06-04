# SEO Full Audit — tuespaciodetrabajo.com

- **URL auditada:** https://tuespaciodetrabajo.com (home + artículos + inventario sitemap)
- **Fecha:** 2026-06-04
- **Motor:** plugin `claude-seo` v2.0.0 (LLM-first + scripts) + Google Search Console (datos reales) + Common Crawl
- **Tipo de sitio:** Publisher / nicho afiliación (guías y comparativas de home office, ES)

---

## SEO Health Score

**84 / 100 — Good**

> ⚠️ **Matiz:** la *configuración* técnica/contenido es alta, pero el **resultado real de visibilidad sigue Crítico**: ~1 de 42 URLs indexada y ~0 impresiones en 30 días. Cuello de botella = **indexación + autoridad**, NO código. Buena noticia v2: la recuperación (Quora) ya genera señales reales.

| Categoría | Peso | Score | Confianza |
|-----------|------|-------|-----------|
| Technical SEO | 22% | 85 | Confirmado |
| Content Quality | 23% | 88 | Confirmado |
| On-Page SEO | 20% | 90 | Confirmado |
| Schema / Structured Data | 10% | 60 | Confirmado |
| Performance (CWV) | 10% | 80 | Hypothesis (PageSpeed rate-limited) |
| AI Search Readiness | 10% | 85 | Confirmado |
| Images | 5% | 92 | Confirmado |

---

## Top 5 críticos

1. 🔴 **Indexación bloqueada** — 1/42 URLs indexada; artículos en `Crawled - currently not indexed`.
2. 🔴 **Autoridad 0** — dominio NO está en Common Crawl (`in_crawl: false`, pagerank `null`). Sin backlinks de valor.
3. 🔴 **FAQPage schema en TODOS los artículos** — tipo restringido (gov/health desde Ago-2023) usado en sitio comercial.
4. ⚠️ **Schema Product ×6 sin validar** en comparativas — requiere offers/aggregateRating correctos o no rinde.
5. ⚠️ **CWV sin confirmar** — PageSpeed API rate-limited (limitación de entorno).

## Top 5 quick wins

1. ✅ **Quitar FAQPage** de la plantilla de artículo (cambiar a contenido FAQ plano sin schema, o sin `@type FAQPage`).
2. ✅ **Solicitar indexación** en GSC de 8-10 páginas dinero.
3. ✅ Continuar olas **Quora ES** (ya hay 1 backlink activo y funcionando).
4. ✅ Enlazado interno guías→comparativas con anchor descriptivo.
5. ✅ Añadir `twitter:site` / generar `llms-full.txt`.

---

## 🔴 Hallazgo dominante: indexación + autoridad

| Elemento | Evidencia (GSC / Common Crawl, datos reales) | Severidad |
|----------|----------------------------------------------|-----------|
| Home `/` | `Submitted and indexed` · crawl 2026-05-31 | ✅ Pass |
| `/sillas/mejor-silla-...` | `Crawled - currently not indexed` · crawl 2026-05-13 | 🔴 Critical |
| `/guias/ergonomia-teletrabajo-...` | `Crawled - not indexed` · crawl **2026-06-03** · referrer **es.quora.com** | 🟡 Progreso |
| Impresiones 30d | ~0 (2 días con 1-2) | 🔴 Critical |
| Common Crawl | `in_crawl: false`, `pagerank: null`, 0 referring domains | 🔴 Critical |

- **Finding:** Google rastrea pero no indexa. `INDEXING_ALLOWED` + `pageFetchState: SUCCESSFUL` → sin bloqueo técnico. Causa = sitio nuevo + autoridad ~0.
- **🟢 Señal positiva (v2):** el artículo de ergonomía tiene ahora **referrer real de Quora** y fue re-crawleado el 2026-06-03 (vs 05-13 del artículo no empujado). **La estrategia de backlinks empieza a funcionar.**

---

## 🔴 Schema — FAQPage restringido (NUEVO en v2)

- **Finding:** `FAQPage` JSON-LD presente en plantilla de artículo. Verificado en 3/3 tipos:
  - `/guias/ergonomia-teletrabajo-postura-correcta/` → FAQPage ✅ presente
  - `/escritorios/ikea-bekant-vs-flexispot-e7/` → FAQPage ✅ presente
  - `/accesorios/mejor-teclado-ergonomico/` → FAQPage ✅ presente
- **Evidence:** afecta a ~41 páginas (toda plantilla de artículo).
- **Impact:** desde agosto 2023 Google restringe rich results de FAQPage a webs de **gobierno y salud autorizadas**. En sitio comercial: no genera rich result y es señal de uso indebido de structured data.
- **Fix:** eliminar `@type: FAQPage` de la plantilla. Mantener el contenido FAQ como HTML normal (sigue siendo útil para usuario y para AI/GEO). Opcional: `Article` ya presente, suficiente.

> Schema home (`WebSite`/`Organization`/`ItemList`) = correcto. Artículo además trae `Article` + `BreadcrumbList` + 6× `Product` → revisar que los `Product` tengan `offers`/`aggregateRating` válidos.

---

## ✅ Fortalezas confirmadas

### Content Quality — 88 (NUEVO v2: medido)
- Artículo `mejor-silla-ergonomica-calidad-precio`: **overall_quality 95/100**, `ai_pattern_score 0`, `filler_score 0`, `information_density 1.0`. Único flag: `repetitive` (32) — menor.
- **4.300 palabras** en el artículo pilar. Profundidad real.
- Páginas E-E-A-T presentes: `/como-probamos-productos/`, `/metodologia-editorial/`.

### Technical SEO — 85
- Headers seguridad **100/100** (HSTS preload, CSP `default-src 'none'`, X-Frame DENY, nosniff, Referrer-Policy, Permissions-Policy).
- Redirects 0-hop 145ms. Canonical autorreferencial. robots.txt válido.
- sitemap-index → sitemap-0, **42 URLs** con `lastmod`.

### On-Page — 90
- Title home ~58 chars. Artículo: title + H1 únicos y descriptivos. Meta description OK. Jerarquía H1/H2/H3 correcta. hreflang `es`+`x-default`.

### Images — 92
- webp + `alt` + `width`/`height` (sin CLS) + `loading="lazy"`.

### AI Search Readiness — 85
- **llms.txt Quality Score 100/100** (6 secciones, 10 links). Contenido muy citable.

---

## ⚠️ Mejoras (Warning)

| # | Hallazgo | Impacto | Fix |
|---|----------|---------|-----|
| W1 | Schema `Product` ×6 sin validar offers/rating | Medio | Validar con `schema_ecommerce_validate.py`; añadir `offers` + `aggregateRating` reales |
| W2 | AI crawlers sin gestión explícita en robots.txt | Bajo | Bloques `Allow` para GPTBot/ClaudeBot/PerplexityBot/Google-Extended |
| W3 | `twitter:site`/`twitter:creator` ausentes | Bajo | Añadir handle X si existe |
| W4 | `llms-full.txt` no existe | Bajo | Generar con guías clave |
| W5 | Flag `repetitive` en artículo pilar | Bajo | Variar vocabulario en secciones repetidas |

---

## Performance (CWV) — Hypothesis
- ⚠️ **PageSpeed Insights API rate-limited** (`240 QPM / 25,000 QPD exceeded`) + sin API key local (`Credential Tier -1`). **Limitación de entorno.**
- Señales positivas (Likely): Astro estático, webp con dimensiones (sin CLS), lazy load, CSP que limita 3rd-party.
- Acción: configurar `GOOGLE_API_KEY` en `~/.config/claude-seo/google-api.json` para CrUX/PSI fiable.

---

## Environment Limitations
- PageSpeed/CrUX: sin API key + rate limit → CWV `Hypothesis`.
- Backlinks: solo tier Common Crawl (sin Moz/Bing API). Suficiente para confirmar autoridad 0.
- GSC: vía MCP (datos reales OK). GA4: no consultado esta sesión.

---

## Conclusión
Sitio **bien construido y con contenido de calidad real** (84/100). Dos palancas:
1. **Quitar FAQPage** de plantilla (fix de código, rápido) — único hallazgo técnico nuevo relevante.
2. **Autoridad + indexación** (fuera del código): seguir Quora/LinkedIn + solicitar indexación. **Ya hay primera señal positiva** (backlink Quora activo + re-crawl reciente). Ver `ACTION-PLAN.md`.
