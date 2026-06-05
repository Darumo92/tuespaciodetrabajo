# Plan de reconducción SEO — tuespaciodetrabajo.com

> **Documento maestro y autónomo.** Escrito para que cualquier agente (Claude o Codex) lo siga sin acceso a memoria externa ni al chat donde se creó. Contiene el diagnóstico, los principios, las decisiones pendientes y el trabajo día a día.
>
> **Fecha de creación:** 2026-06-04 · **Autor del sitio:** David Rubio Mota (darumo092@gmail.com)
> **Stack:** Astro (TypeScript) · contenido en `src/content/articulos/*.mdx` · páginas en `src/pages/`.

---

## 0. Cómo usar este documento

1. Lee las secciones 1-6 ANTES de tocar nada. Son el "por qué" y las reglas. Sin eso, el trabajo diario no tiene sentido.
2. La **Sección 3 (Decisión previa)** es BLOQUEANTE. David debe rellenar el inventario de verdad antes de reescribir contenido. Sin eso, se repite el error de fabricar E-E-A-T.
3. La **Sección 7** es el plan día a día. Cada día tiene entregable concreto y archivos.
4. Marca cada día como `[x]` al terminar. Codex y Claude pueden alternarse; este archivo es la única fuente de verdad.
5. Track paralelo (Sección 8): backlinks Reddit/Quora los hace David a mano cada día. No forman parte de los "días de build".

---

## 1. Contexto y diagnóstico (qué pasa y por qué)

### Síntoma
- 42 URLs en el sitemap, **~1 indexada** (solo la home). El resto en GSC = `Crawled - currently not indexed`.
- ~0 impresiones orgánicas en 30 días. Tráfico orgánico nulo.
- Dominio creado 2026-03-24 (nuevo, ~2,5 meses).

### Qué se ha DESCARTADO como causa (con datos, no opinión)
- ❌ **Backlinks/autoridad como switch**: la web de referencia `surfskate.app` tiene autoridad 0 idéntica en Common Crawl (`in_crawl: false`, pagerank `null`, 0 referring domains) y SÍ indexa.
- ❌ **FAQPage**: `surfskate.app` usa FAQPage e indexa igual. (Aun así se eliminó por buena práctica, ver Sección 5.)
- ❌ **Sitemap**: surfskate no tiene `sitemap.xml` (404) e indexa.
- ❌ **Config técnica**: la del sitio es excelente (headers seguridad 100/100, canonical, hreflang, redirects limpios, llms.txt 100/100).
- ❌ **Historial de dominio**: limpio, nuevo.
- ❌ **Solicitar indexación manual en GSC**: David lo ha hecho varias veces; Google nunca indexa. Confirmado inútil. **Dejar de hacerlo.**

### Causa real (alta confianza)
**El contenido fabrica experiencia que no existe.** Es contenido generado por IA donde el valor central es *experiencia personal inventada* ("he probado 5 sillas", "me destrocé la espalda", importes y fechas inventados). Esto es exactamente lo que el **Helpful Content System** y el **sistema de reseñas de productos** de Google penalizan. `Crawled - currently not indexed` masivo es el síntoma literal de este patrón.

### La lección de surfskate (clave de todo el plan)
`surfskate.app` también es contenido asistido por IA, **pero su valor es FACTUAL, no experiencia fingida**:
- Su núcleo `/catalog/` es un **dataset estructurado**: 193 surfskates con specs reales (geometría, wheelbase, trucks), schema `Dataset`/`ItemList`, 615 enlaces internos. Specs = hechos verificables y públicos.
- Resuelve un trabajo real ("compara specs y elige tabla") con **datos ciertos**.

**Google no penaliza la IA. Penaliza la falta de valor genuino.**
- Datos factuales agregados (specs reales) = valor real aunque los monte una IA → indexa.
- Experiencia subjetiva fabricada = valor negativo (es engaño + replicable) → no indexa.

> **No es IA-vs-humano. Es dato-factual-y-útil vs experiencia-fingida.**

---

## 2. Principio rector (la regla que gobierna TODO el trabajo)

**Cada página debe ofrecer algo cierto y útil que Google no tenga ya, sin inventar experiencia.**

Tres fuentes de valor legítimas (se pueden montar con IA, son verídicas):
1. **Datos factuales estructurados**: specs reales de fabricante en tablas comparables (medidas, materiales, peso máx, garantía, vatios, precio, rango de altura…). Esto es el "modelo surfskate" aplicado a cada categoría.
2. **Herramientas reales**: la calculadora de ergonomía (`/herramientas/calculadora-ergonomia/`) es el mejor activo del sitio. Hacer más como ella.
3. **Experiencia de primera mano REAL** (solo la que exista de verdad): lo que David posee y usa de verdad, con sus fotos y datos. Cantidad pequeña pero auténtica > 41 artículos fingidos.

**Prohibido a partir de ahora:**
- Afirmar uso/prueba directa de productos no poseídos/no probados.
- Inventar importes, fechas, episodios, "probé N unidades".
- Pasar fotos de internet/Amazon como propias.

---

## 3. DECISIÓN PREVIA — RESUELTA (2026-06-05)

> ✅ Inventario de verdad completado por David. Decisión estratégica: **OPCIÓN A — honestidad pura.** No comprará productos para probar. Solo se presenta como uso propio el SETUP REAL.

**Fuente de verdad de la persona (ya depurada):** `docs/agent-context/project_author_persona.md` + `.seo-engine/config.yaml` (ambos corregidos el 2026-06-05). Resumen:

**REAL (usar como autoridad genuina):**
- David Rubio Mota, ingeniero de software, Rubí (Barcelona), teletrabaja desde 2019, LinkedIn real. Físico 1,80m/85kg real. Familia real. Fisio Pep/Fisiosthetic real (1×/mes).
- **Setup poseído**: Herman Miller Aeron · escritorio fijo DIY (tablón macizo + patas IKEA) · doble monitor BenQ+LG · teclado Keychron Q1 Max · ratón Lamzu Maya X 8K · auriculares Beyerdynamic DT770 Pro · reposapiés · webcam Logitech.
- Puede hacer **fotos propias** de lo que posee.
- **Foto de autor en el sitio:** NO (preferencia). El enlace a LinkedIn (foto+nombre) cubre la señal.

**INVENTADO (eliminar de TODO el sitio):**
- Setup falso: ErgoChair Pro, FlexiSpot E7/standing desk, Logitech Ergo K860, MX Vertical, Sony WH-1000XM5, BenQ ScreenBar.
- Lesión/episodio: dolor lumbar + hormigueo + confinamiento 2020 + "300€/6 sesiones".
- "Probó 5 sillas", y TODAS las anécdotas de terceros inventadas (compañero de Madrid/Sabadell, "lector con JUMMICO", mujer en habitación sur, etc.).

> ⚠️ **ALCANCE REAL (más grande de lo previsto):** la persona falsa está incrustada en MUCHOS sitios, no solo en los 30 artículos:
> - `.seo-engine/config.yaml` ✅ corregido (2026-06-05)
> - `docs/agent-context/project_author_persona.md` ✅ corregido (2026-06-05)
> - `PRODUCTOS.md` — mapea productos del setup falso (K860, MX Vertical, Sony XM5, ScreenBar, ErgoChair, FlexiSpot). Revisar.
> - **Cada artículo** contiene anécdotas personales y de terceros inventadas (ver `.seo-engine/logs/changelog*.md`). Eliminar en Fases 1-2.
> - `docs/SESION_1_BACKLINKS_PAQUETE.md` y docs de backlinks — citan setup falso + episodio fisio inventado. Revisar antes de reutilizar.
> - `.seo-engine/data/content-queue.yaml` y `topic-clusters.yaml` — "notes" con experiencia falsa. Corregir al tocar cada pieza.

---

## 4. Estado actual del sitio (inventario)

**Contenido (30 artículos en `src/content/articulos/`):**

*Comparativas (11) — afiliación, MÁXIMO riesgo (experiencia fingida + imágenes Amazon):*
- `mejor-silla-ergonomica-calidad-precio` (sillas)
- `mejor-silla-oficina-menos-200-euros` (sillas)
- `mejor-escritorio-elevable-electrico` (escritorios)
- `ikea-bekant-vs-flexispot-e7` (escritorios)
- `mejor-monitor-trabajar-desde-casa` (accesorios)
- `mejor-raton-vertical-ergonomico` (accesorios)
- `mejor-teclado-ergonomico` (accesorios)
- `mejor-soporte-monitor-brazo-articulado` (accesorios)
- `mejor-lampara-escritorio-led` (ambiente)
- `mejor-ventilador-silencioso-oficina` (ambiente)
- (revisar `silla-gaming-vs-ergonomica` — marcado informativo pero es comparativa)

*Informativas (19) — guías, menor riesgo (más factuales). Ej.:* `ergonomia-teletrabajo-postura-correcta`, `dolor-espalda-trabajar-casa`, `guia-completa-home-office`, `standing-desk-merece-la-pena`, `tunel-carpiano-teletrabajo-prevencion`, etc.

**Páginas de confianza (3) en `src/pages/`:** `sobre-mi.astro`, `metodologia-editorial.astro`, `como-probamos-productos.astro`. (Bien escritas y con marco honesto, PERO contienen datos inventados que hay que depurar — Sección 3.)

**Herramienta (1):** `herramientas/calculadora-ergonomia.astro` — el mejor activo. Modelo a expandir.

**Scores auditoría (claude-seo v2.0.0):** técnico 85/100; on-page 90; contenido bien escrito pero con experiencia fingida; imágenes 7/11 de Amazon en comparativas.

**Layout de artículo:** `src/layouts/Article.astro` (frontmatter usa `faqs`, `autor`, `categoria`, `tipo`, `imagen`, `tags`).

---

## 5. Reglas técnicas permanentes

**Schema (JSON-LD `application/ld+json` siempre, nunca Microdata/RDFa):**
- ✅ Permitidos: `Article`/`BlogPosting`, `BreadcrumbList`, `WebSite`, `Organization`, `Person`, `Product` (con `offer`/`review`/`aggregateRating` reales), `ItemList`, `Dataset`, `SoftwareApplication`.
- ❌ Prohibidos: `FAQPage` (restringido a gov/health desde Ago-2023; ya eliminado de `Article.astro` y calculadora — NO reintroducir), `HowTo` (rich results eliminados Sept-2023; ya eliminado — NO reintroducir).
- Las FAQ pueden seguir como **HTML visible** (útiles para usuario y para AI/GEO), pero **sin** schema `FAQPage`.
- Verificar tras cada cambio: `grep -rl "FAQPage\|\"HowTo\"" dist/` debe dar 0.

**Imágenes:**
- Mantener webp + `alt` + `width`/`height` + `loading="lazy"` (ya correcto).
- Imágenes de producto: usar las de la API de afiliado SOLO como ficha de producto, NUNCA presentadas como "foto propia". Fotos propias = solo si son reales.

**No tocar (ya correcto):** headers de seguridad, canonical, hreflang, redirects, robots.txt base, llms.txt.

**Build/verify:** `npm run build` debe pasar (49 páginas). Tras cambios de schema, revisar `dist/`.

---

## 6. Checklists reutilizables

### 6.A — Reescritura de COMPARATIVA (las 11, máxima prioridad)
Para cada comparativa:
- [ ] **Quitar toda experiencia fingida** ("he probado", "me destrocé la espalda", "tras semanas de uso", importes/fechas inventados).
- [ ] **Reencuadrar** el intro a marco honesto: "Comparativa basada en specs de fabricante, disponibilidad en España, garantías y reseñas verificadas de compradores." Decir explícitamente qué se conoce por uso real (si aplica) vs investigación.
- [ ] **Tabla de specs factuales reales** (el valor tipo surfskate): columnas con datos verificables por producto (medidas, peso máx, materiales, garantía, rango ajuste, vatios, conectividad, precio aprox.). Mínimo 5-8 productos × 6-10 specs.
- [ ] Schema `Product` por ítem SOLO con datos reales (`offer` con precio/moneda/disponibilidad; `aggregateRating` solo si se usan ratings verificables, p.ej. de Amazon, citando fuente).
- [ ] **Criterios de selección objetivos** (por qué entra/sale cada producto), no opinión inventada.
- [ ] **Recomendación por perfil** basada en datos ("si mides <162cm…", "si tu presupuesto es <150€…"), no en vivencia falsa.
- [ ] Enlaces internos a guías informativas relacionadas (anchor descriptivo).
- [ ] Imágenes: ficha de producto OK; nada presentado como foto propia salvo que lo sea.
- [ ] Coherencia con páginas de confianza (no afirmar nada que la metodología no respalde).

### 6.B — Mejora de INFORMATIVO (las 19)
- [ ] Verificar afirmaciones factuales (datos, cifras) y citar fuentes serias donde aporte (estudios, normas tipo ISO 7250, fabricantes).
- [ ] Quitar experiencia personal inventada; conservar solo la real.
- [ ] Añadir valor único: datos concretos, tablas, ejemplos numéricos, lo que no esté en otras guías.
- [ ] Dedupe: si dos guías se solapan mucho, fusionar en una más completa (la metodología ya promete esto).
- [ ] Enlazado interno hacia comparativas (transaccional) y otras guías.

### 6.C — Páginas de confianza
- [ ] Solo datos verídicos (resultado de Sección 3).
- [ ] Coherencia total entre las 3 + con el persona doc + con los artículos.
- [ ] La metodología debe describir el proceso REAL (investigación asistida por IA + specs + reseñas + lo que se posea). Es legítimo y honesto decirlo así.

### 6.D — Tabla de specs / dataset (modelo surfskate)
- [ ] Datos de fabricante/fuentes públicas, verificables.
- [ ] Estructura consistente entre productos de la misma categoría.
- [ ] Schema `ItemList` (o `Dataset` si es un catálogo grande).
- [ ] Ordenable/filtrable si es viable en Astro.

---

## 7. Plan día a día

> Cadencia sugerida: 1 sesión de build/día. Ajustable. Cada día = entregable + `npm run build` OK + commit. **Track backlinks (Sección 8) es aparte y diario.**

### FASE 0 — Fundamentos y verdad (Días 1-2)

**Día 1 — Decisión de verdad + persona**
- [ ] David rellena la Sección 3 (inventario real vs inventado) y elige Opción A/B.
- [ ] Reescribir `docs/agent-context/project_author_persona.md` + `.seo-engine/config.yaml`: solo datos verídicos.
- [ ] Entregable: persona doc depurado. Commit.

**Día 2 — Páginas de confianza coherentes**
- [ ] Reescribir `sobre-mi.astro`, `metodologia-editorial.astro`, `como-probamos-productos.astro` con la verdad (checklist 6.C).
- [ ] Metodología: describir el proceso real (specs + reseñas + lo poseído). Quitar importes/episodios inventados.
- [ ] `npm run build` OK. Commit.

### FASE 1 — Comparativas (Días 3-13) — máxima prioridad
> 11 comparativas. Ritmo ~1/día. Aplicar checklist 6.A + 6.D a cada una.

- [ ] **Día 3** — `mejor-silla-ergonomica-calidad-precio` (pieza faro; usar como plantilla de referencia para el resto).
- [ ] **Día 4** — `mejor-silla-oficina-menos-200-euros`
- [ ] **Día 5** — `mejor-escritorio-elevable-electrico`
- [ ] **Día 6** — `ikea-bekant-vs-flexispot-e7`
- [ ] **Día 7** — `mejor-monitor-trabajar-desde-casa`
- [ ] **Día 8** — `mejor-raton-vertical-ergonomico`
- [ ] **Día 9** — `mejor-teclado-ergonomico`
- [ ] **Día 10** — `mejor-soporte-monitor-brazo-articulado`
- [ ] **Día 11** — `mejor-lampara-escritorio-led`
- [ ] **Día 12** — `mejor-ventilador-silencioso-oficina`
- [ ] **Día 13** — `silla-gaming-vs-ergonomica` (reclasificar bien tipo) + repaso de las 11.

### FASE 2 — Informativas (Días 14-23)
> 19 guías. Ritmo ~2/día. Checklist 6.B. Priorizar las que ya tienen alguna señal (p.ej. la de ergonomía que ya recibió crawl reciente).

- [ ] **Día 14** — `ergonomia-teletrabajo-postura-correcta` + `guia-completa-home-office`
- [ ] **Día 15** — `dolor-espalda-trabajar-casa` + `dolor-cervicales-ordenador`
- [ ] **Día 16** — `tunel-carpiano-teletrabajo-prevencion` + `fatiga-visual-pantalla`
- [ ] **Día 17** — `ajustar-silla-oficina-correctamente` + `altura-correcta-escritorio-silla`
- [ ] **Día 18** — `ejercicios-estiramientos-silla-oficina` + `standing-desk-merece-la-pena`
- [ ] **Día 19** — `home-office-piso-pequeno` + `insonorizar-home-office`
- [ ] **Día 20** — `mejorar-iluminacion-espacio-trabajo` + `organizar-cables-escritorio`
- [ ] **Día 21** — `home-office-productivo-500-euros` + `productividad-en-casa-entorno-fisico`
- [ ] **Día 22** — `trabajar-desde-casa-calor` + `novedades-home-office-2026`
- [ ] **Día 23** — `mi-setup-home-office-2026` (¡debe reflejar SETUP REAL!) + dedupe/fusión de solapadas.

### FASE 3 — Capa de valor único (Días 24-28)
> Aquí se construye el "modelo surfskate" que diferencia el dominio.

- [ ] **Día 24** — Diseñar estructura de **tabla de specs por categoría** (campos, schema `ItemList`/`Dataset`, componente Astro reutilizable).
- [ ] **Día 25** — Implementar tablas de specs en sillas y escritorios (datos reales de fabricante).
- [ ] **Día 26** — Tablas de specs en monitores/teclados/ratones/ambiente.
- [ ] **Día 27** — Idear + especificar 1-2 **herramientas nuevas** tipo calculadora (ej.: "selector de silla por altura/peso/presupuesto", "calculadora de presupuesto de setup"). Diseño + datos.
- [ ] **Día 28** — Implementar la primera herramienta nueva. `SoftwareApplication` schema.

### FASE 4 — Técnico, enlazado y cierre (Días 29-30)
- [ ] **Día 29** — Enlazado interno global: guías→comparativas y comparativas→guías con anchors descriptivos; revisar huérfanas (`internal_links.py`). CWV: configurar `GOOGLE_API_KEY` en `~/.config/claude-seo/google-api.json` y validar PageSpeed (objetivo LCP<2.5s, INP<200ms, CLS<0.1).
- [ ] **Día 30** — Revisión final: build limpio, `grep FAQPage/HowTo dist/` = 0, re-auditar con `/seo audit`, revisar GSC. Documentar estado.

### Mantenimiento continuo (post Día 30)
- Publicar contenido NUEVO solo al nuevo nivel (factual + valor único), cadencia lenta (~1/semana). Nunca roundups de stock con experiencia fingida.
- Revisar GSC semanal: qué pasa a `Indexed`, qué páginas reciben re-crawl.

---

## 8. Track paralelo — Backlinks (lo hace David, a diario)

> No bloquea el build. Recordatorio: con autoridad casi nula, Quora es `nofollow` → vale como **tráfico/descubrimiento**, no como traspaso de autoridad. Aun así, tráfico real = señal de demanda.

- [ ] Cada día: respuestas en **Quora ES** (método validado: Brave Search `site:es.quora.com`) y **Reddit** (cuando karma≥50). Ratio 2-3:1 respuesta:enlace. Ver `docs/agent-context/reference_quora_es_workflow.md` y `docs/agent-context/project_backlinks_plan.md`.
- [ ] Objetivo: enviar tráfico real a las páginas dinero ya mejoradas (no a páginas con experiencia fingida).
- [ ] Registrar referrers que aparezcan en GSC.

---

## 9. Métricas y verificación (GSC)

Revisar (vía MCP `google-search-console` o GSC web):
- `index_inspect` de páginas mejoradas → buscar paso de `Crawled - not indexed` a `Submitted and indexed`.
- `lastCrawlTime` → tras mejorar contenido, Google debería re-crawlear; es la señal temprana.
- `search_analytics` → primeras impresiones sostenidas (>0/día).

**Señales de éxito (4-8 semanas):**
1. Páginas mejoradas pasan a `Indexed`.
2. Aparecen impresiones.
3. El ratio indexado/total sube desde ~1/42.

**NO usar como métrica:** "solicité indexación" (confirmado inútil en este dominio).

---

## 10. Qué NO hacer (errores a evitar)

- ❌ Solicitar indexación manual en GSC (no funciona aquí).
- ❌ Reintroducir `FAQPage` o `HowTo` schema.
- ❌ Inventar experiencia, importes, fechas, "probé N unidades".
- ❌ Pasar fotos de internet/Amazon como propias.
- ❌ Publicar artículos nuevos antes de arreglar los existentes.
- ❌ Perseguir backlinks como solución mágica (no lo es; el contenido factual sí).
- ❌ Confiar en "está bien escrito" como prueba de calidad: Google evalúa valor único, no prosa.

---

## Apéndice — Comandos útiles

```bash
# Build + verificar schemas prohibidos fuera
npm run build
grep -rl "FAQPage" dist/ ; grep -rl '"HowTo"' dist/   # ambos deben dar 0

# Auditoría SEO (plugin claude-seo v2.0.0)
# /seo audit https://tuespaciodetrabajo.com   (desde Claude Code)

# Scripts del plugin (ruta puede variar por versión):
#   ~/.claude/plugins/cache/agricidaniel-claude-seo/claude-seo/<ver>/scripts/
#   parse_html.py, content_quality.py, internal_links.py, pagespeed_check.py,
#   commoncrawl_graph.py, domain_history.py
```

**Estado de cambios ya aplicados (2026-06-04):** eliminado `FAQPage` + `HowTo` schema de `src/layouts/Article.astro` y `src/pages/herramientas/calculadora-ergonomia.astro` (commit `24922fa`). Reports de auditoría: `FULL-AUDIT-REPORT.md`, `ACTION-PLAN.md`.
