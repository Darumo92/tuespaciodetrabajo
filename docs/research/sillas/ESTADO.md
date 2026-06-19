# Estado megarecopilación sillas — handoff

> Documento de continuidad para retomar en otra sesión/PC. Última actualización: **2026-06-18**.
> Plan ejecutado: `docs/superpowers/plans/2026-06-18-megarecopilacion-sillas-100-plus.md`.
> Rama de trabajo: **`feat/megarecopilacion-sillas`** (sin push ni merge todavía).

## Resumen en una línea

Infraestructura del catálogo (Tasks 1-5) terminada y verificada; catálogo ampliado de **19 → 24 sillas** con una oleada piloto de 5 fichas; el resto del research (100+ sillas) está pausado a la espera de datos de Amazon y de la señal de indexación.

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

## Catálogo actual: 24 sillas

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
