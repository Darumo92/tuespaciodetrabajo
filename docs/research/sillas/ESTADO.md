# Estado megarecopilación sillas — handoff

> Documento de continuidad para retomar en otra sesión/PC. Última actualización: **2026-06-18**.
> Plan ejecutado: `docs/superpowers/plans/2026-06-18-megarecopilacion-sillas-100-plus.md`.
> Rama de trabajo: **`feat/megarecopilacion-sillas`** (sin push ni merge todavía).

## Resumen en una línea

Infraestructura del catálogo terminada; catálogo en **67 sillas** tras oleadas 1-5 (oleada 5 = marcas nuevas pista forocoches, 2026-06-22). Bloque A agotado; Bloque B en marcha. Camino a 100+ por oleadas de ~10, con imágenes que sube el usuario. Plan vigente: `docs/superpowers/plans/2026-06-20-ampliacion-catalogo-sillas-100-oleadas.md`. Rama `feat/sillas-catalogo-100-oleadas`.

## Decisiones tomadas por el usuario

- **Amazon:** de momento **solo search fallback** (sin ASIN directo). La API Creators está inhabilitada (ver Bloqueos). No inventar ASINs.
- **Oleadas:** backlog + **una oleada piloto** (hecha, 5 fichas). No volcar 100 URLs de golpe.
- **Hbada:** corregir specs al **modelo P5** (hecho).
- **Imágenes:** el usuario las sube manualmente a `public/img/productos/`. Las 5 piloto ya están (webp/jpg/avif, no todas jpg).

## Estado por Task del plan

| Task | Estado | Notas |
|------|--------|-------|
| 1 Backlog | ✅ | `backlog-sillas.csv` + `source-log.md` |
| 2 Auditoría 19 sillas | ✅ | filas `published` con flags de debilidad |
| 3 Schema diferencial | ✅ | mercados Amazon/OneLink + 12 specs nuevas + filtros/chips; tests 33/33 |
| 4 Validador | ✅ | `npm run validate:productos` |
| 5 Importador CSV→YAML | ✅ | `scripts/import-productos-sillas.mjs` + `import-sample.csv` (dry-run verificado) |
| 6 Research 150 candidatas | 🟡 parcial | batch 1 = 29 candidatas añadidas; faltan batches 2-5 |
| 7 Oleada 30 sillas | 🟡 piloto | 5 fichas publicadas (de 30); resto pendiente |
| 8 Catálogo 50+ (búsqueda texto, grupos filtros) | ⬜ | no empezado |
| 9 Oleadas hasta 100+ | ⬜ | no empezado |
| 10 Hubs editoriales | ⬜ | bloqueado: necesita SERP real del usuario |
| 11 Medición indexación | ⬜ | bloqueado: requiere publicar y medir en GSC |

**Extra (no era Task):** fix del filtrado del catálogo que rompí en Task 3 (ver más abajo).

## Catálogo actual: 67 sillas (oleada 5 publicada 2026-06-22)

- **19 originales** (auditadas, `published`).
- **5 piloto nuevas** (specs oficiales verificadas, CTA = Amazon search fallback, sin ASIN):
  - `steelcase-series-1` (premium accesible)
  - `humanscale-freedom` (premium, reclinación por peso)
  - `noblechairs-hero` (gaming, personas altas/peso alto)
  - `ikea-matchspel` (gaming-office IKEA)
  - `ikea-langfjall` (oficina tapizada IKEA)

URL de ficha: `/catalogo/silla/<slug>/`. Build = 93 páginas.

## Backlog (`backlog-sillas.csv`)

- 19 `published` (originales) + 5 `published` (piloto) + **24 `candidate`** restantes del batch 1 (29 añadidas, 5 promovidas a published).
- Campos clave: `estado`, `mercados_objetivo`, `amazon_query`, `asin_primary` (vacío), `asin_by_market` (vacío, sin verificar), `onelink_ready`.
- Candidatas pendientes de sourcing oficial: marca + modelo + query Amazon, `estado=candidate`.

## Bloqueos (qué falta para seguir)

1. **Amazon Creators API → 403 `AssociateNotEligible`.** `scripts/amazon-lookup.mjs` obtiene OAuth pero `getItems`/`searchItems` fallan (cuenta no elegible por umbral de ventas). Sin esto NO se pueden verificar ASINs/precios/disponibilidad por mercado. Mientras: fichas con **Amazon search fallback** (OneLink-routable), sin afirmar ASIN ni disponibilidad por mercado, y sin inventar ASINs (regla AGENTS.md). Reevaluar si el usuario confirma elegibilidad.
2. **SERP real para hubs (Task 10).** Regla del proyecto: WebSearch/WebFetch NO valen como datos SERP. Para escribir un hub el usuario debe aportar, por keyword: top 3-5 resultados Google, PAA, búsquedas relacionadas y volúmenes Keyword Surfer. Hub recomendado para empezar: **"sillas ergonómicas personas altas"** (ya hay fichas que encajan: HERO, Series 1, Aeron talla C). Otros candidatos: malla, espalda, reposabrazos abatibles, 150 kg.
3. **Aviso de estrategia (auditoría indexación vigente):** pausar artículos nuevos hasta señal de recovery; Task 11 condiciona escalar a que GSC indexe esta primera tanda. Meter hubs ahora puede ir contra esa decisión.

## Fix del filtrado (regresión que introduje en Task 3)

- **Síntoma:** catálogo vacío al cargar (todas las cards ocultas) → "no funciona el filtrado".
- **Causa raíz:** el filtro `altura-max` es `control:'rango'` + `comparacion:'min'` (combinación nueva). En `CatalogoProductos.astro`: (a) el slider arrancaba en `value=f.max` (lo más restrictivo para 'min'); (b) el handler 'min' trataba dato ausente como 0 (`?? 0`). Como 23/24 sillas tienen `alturaRecomendadaMaxCm=null`, `210 > 0` ocultaba todas.
- **Fix (commit `112b0d7`):** rango 'min' arranca en `f.min`; handler 'min' salta null igual que 'max'. CSP hash actualizado en el mismo commit. Verificado: antes 0 cards, después 24.
- **Nota:** los filtros de altura solo son útiles cuando más sillas tengan `alturaRecomendadaMin/MaxCm` (ahora solo HERO). Considerar poblar ese campo o esconder esos filtros hasta tener datos.

## Próximos pasos posibles

- **A)** Usuario aporta SERP de "personas altas" → escribir ese hub (Task 10). Choca con la pausa de indexación.
- **B)** Seguir con **batch 2 de candidatas** (Task 6) y/o más fichas piloto research-only (sin ASIN), respetando la pausa.
- **C)** Task 8: añadir búsqueda por texto y grupos de filtros al catálogo (no necesita datos externos) — buena mejora estructural sin riesgo de indexación.
- **D)** Poblar `alturaRecomendadaMin/MaxCm` y otras specs nuevas en las 19 fichas existentes para que los filtros nuevos sean útiles.

## Cómo retomar / verificar

```bash
git checkout feat/megarecopilacion-sillas
npm install
npm test                      # 33/33
npm run validate:productos    # 24 OK
npm run build                 # 93 páginas
```

Importar un lote curado:
```bash
node scripts/import-productos-sillas.mjs docs/research/sillas/<lote>.csv
```

## Commits de esta rama (10)

```
112b0d7 fix(catalogo): filtro rango 'min' ocultaba todas las cards
4f6cc2e data: wire pilot chair images (webp/jpg/avif)
60c4e6e data: add pilot chair catalog wave (5 fichas, specs verificadas, search fallback)
0f990aa docs: add chair research batch 1
a6eb169 fix(hbada): corregir specs a modelo P5 (lumbar 2D, reposacabezas, 136 kg)
528978d chore: add chair product importer
f51797d chore: add product catalog validator
01c9333 feat: expand chair specs and filters
403f079 docs: audit current chair catalog
828287a docs: add chair research backlog
```

## Oleada 1 — premium/oficina (2026-06-20)

Plan: `docs/superpowers/plans/2026-06-20-ampliacion-catalogo-sillas-100-oleadas.md` (Task 1). Rama `feat/sillas-catalogo-100-oleadas`.

7 fichas premium publicadas (specs oficiales verificadas, CTA = webOficial, sin ASIN; imágenes del usuario normalizadas a fondo blanco):
- `herman-miller-sayl`, `herman-miller-mirra-2`, `herman-miller-cosm`, `steelcase-think`, `haworth-zody`, `humanscale-diffrient-smart`, `hag-sofi`.

Backlog: estas 7 pasan candidate→published (quedan 17 candidatas del Bloque A). Catálogo: 24 → 31. Build 100 páginas, validate + tests verdes. Revisión spec + calidad pasada (fix: mirra-2 respaldo malla→mixto; pulido anti-AI-tells en 4 veredictos).

Siguiente: Oleada 2 (gama media, Task 2).

## Oleada 2 — gama media (2026-06-20)

Plan Task 2. 8 fichas publicadas (de 9 previstas): sihoo-doro-s300, flexispot-c7, flexispot-bs11-pro, hbada-e3 (E3 Pro), ticova-ergonomic, nouhaus-ergo3d, ergotopia-nextback, colamy-high-back (ATLAS). CTA = amazon.buscar (search fallback), sin ASIN.

Baja: `songmics-obg-cloud` descartada (sin fuente oficial verificable de ese modelo) -> sigue como candidate.

Imágenes del usuario normalizadas a fondo blanco (3 se rehicieron por venir con fondo negro/lifestyle). Catálogo 31 -> 39. Build 108 páginas, validate verde. Revisión spec + calidad pasada (pulido de calcos/redundancias en 4 veredictos).

Quedan 9 candidatas del Bloque A (8 para Oleada 3 + songmics descartada). Siguiente: Oleada 3 (IKEA + gaming, Task 3).

## Oleada 3 — IKEA + gaming (2026-06-20)

Plan Task 3. 8 fichas publicadas: ikea-flintan, ikea-hattefjall, ikea-styrspel, razer-iskur-v2,
corsair-tc100, newskill-takamikura (V2), drift-dr500, branch-ergonomic. IKEA con CTA webOficial;
gaming con amazon.buscar o webOficial (Razer/Branch directos). Branch: solo EE.UU./Canadá, nota en limitaciones.

Fix de datos: ikea-styrspel 110 kg (no 125). Pulido anti-AI-tells en los 8 veredictos.
Incidencia de imágenes: las 3 IKEA llegaron en avif corrupto (verde en sips/QuickLook, bitstream no soportado
en libheif); rehechas por el usuario en PNG y normalizadas a 800x800 blanco. Las otras 5, OK.

Fix UI (aplica a todo el catálogo): ImagenProducto usa fondo de caja blanco fijo (antes var(--bg)) para que
el letterbox no salga negro en modo oscuro.

Catálogo 39 -> 47. Bloque A del backlog AGOTADO (solo queda songmics-obg-cloud descartada). Build 116 páginas.
Siguiente: Oleada 4 = Bloque B (Task 4 research de marcas nuevas, luego producir).

## Oleada 4 — Bloque B (2026-06-21)

Task 4 (research Bloque B) hecha: backlog +11 candidatas nuevas con web oficial fetcheada (AndaSeat Kaiser 3/3E, noblechairs ICON, Corsair T3 Rush, Razer Enki, DXRacer Master, Actiu TNK Flex, Okamura Sylphy, Forma5 Dot.Pro, Eureka Onyx, Yaheetech Mesh). Descartes: KERDOM (sin web oficial de sillas de oficina), Interstuhl/Vitra (403 anti-bot, diferidas), Mfavour, Eureka OC05.

Oleada 4 (Task 5): 10 fichas publicadas con imagen (todas menos AndaSeat 3E, que sigue candidate). Producidas por 2 subagentes implementadores, revisadas en spec-compliance (enums, slugs de alternativas, CTA, sin ASIN, sin em-dash) y ortografía/humanización (las fichas venían sin tildes ni ñ: ~450 correcciones). CTA: amazon.buscar (gaming/budget) o webOficial (Razer Enki, Actiu, Okamura, Forma5). Specs solo de fuente oficial; estilo casa (campos sin dato se omiten). Imágenes del usuario normalizadas a 800x800 blanco (eureka-onyx llegó en gris, blanqueada; 3 webp -> jpg).

Catálogo 47 -> 57. Build 126 páginas, validate (57) + test (45/45) verdes. Backlog: 10 candidate->published.

Backlog Bloque B restante (candidate): andaseat-kaiser-3e + songmics-obg-cloud (descartada). Pistas sin verificar de un post de forocoches (oficina/gaming ES) pendientes de research: Eurotech Ergohuman, RH Logic 400, Nightingale/Biplax CXO, Steelcase Please, Herman Miller Celle, AKRacing, Sharkoon, RECARO, Backforce, Phoenix, Euromof, Biplax, Luyando, Vertagear, Maxnomic, Quersus.

Siguiente tras oleada 4: Oleada 5 (hecha, ver abajo).

## Oleada 5 — marcas nuevas pista forocoches (2026-06-22)

Task 6. Backlog sin candidatas frescas: research previo de marcas nuevas (pistas de un post de forocoches), +14 candidatas con web oficial fetcheada (10 producibles + 4 diferidas). Descartes/diferidas por no fetcheable o specs escasas: Wilkhahn AT (specs configurables escasas), Maxnomic OFC (specs escasas), AKRacing Masters Max (web 402 anti-bot), Backforce One Plus (web 403 anti-bot).

10 fichas publicadas con imagen, fuente oficial fetcheada (2026-06-22), estilo casa (specs sin dato omitidas):
- Oficina/premium: eurotech-ergohuman-gen2 (malla iconica, amazon.buscar), rh-logic-400 (Flokk 2PP, webOficial), sedus-black-dot (contract aleman dorsokinetic, webOficial), giroflex-353 (swivel suizo Automatic Move, webOficial).
- Gaming: recaro-exo (concha ergo Made in Germany, webOficial), vertagear-sl5000 (racing aluminio, amazon.buscar), sharkoon-skiller-sgs40 (asiento XL EN1335, amazon.buscar), quersus-vaos-3 (europea LUMBFLEX, webOficial), forgeon-spica (marca PcComponentes, webOficial), trust-gxt-714-ruya (budget chasis FSC, amazon.buscar).

CTA: amazon.buscar para las que se venden en Amazon ES; webOficial para contract/premium y exclusivas de tienda (Forgeon = PcComponentes). Sin ASIN. Revisado spec-compliance + humanizacion (rotos moldes calcados de decisionRapida/paraQuienNo/comunidad). Imágenes del usuario normalizadas a 800x800 fondo blanco (4 webp y 1 png transparente convertidas a jpg).

Catálogo 57 -> 67. Build 141 páginas, validate (67) + test (45/45) verdes. Backlog: 10 candidate->published; quedan candidate andaseat-kaiser-3e, songmics (descartada) y las 4 diferidas de oleada 5.

AVISO multi-PC: durante la sesión apareció en el árbol de trabajo un WIP grande de i18n (astro.config, components, src/i18n, [locale] pages, articulosI18n, config.ts, plan internacionalizacion) ajeno a esta oleada; NO se tocó ni se commiteó. El build regeneró public/_headers (CSP entrelazado con scripts i18n); dejado sin commitear.

Siguiente: Oleada 6 (Task 7, lote ~10). Al estar muy por encima de 50 fichas, retomar Task 11 (búsqueda + grupos de filtros del catálogo) como PLAN APARTE (es código, no contenido).
