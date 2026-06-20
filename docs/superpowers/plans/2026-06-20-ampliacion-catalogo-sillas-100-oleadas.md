# Ampliación catálogo sillas 24 → 100+ por oleadas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Llevar el catálogo de sillas de 24 a 100+ fichas reales y verificables, produciéndolas en oleadas de ~10, con imágenes que sube el usuario a mano.

**Architecture:** Cada silla es un archivo `src/content/productos/<slug>.yaml` validado por Zod en build (schema en `src/content/config.ts`). La infraestructura (validador, tests, importador, backlog) ya existe. El plan es un **motor de producción de contenido**: research oficial → ficha editorial completa → handoff de imagen → gates (validate/test/build) → trazabilidad → merge. No hay feature de código nueva en este plan.

**Tech Stack:** Astro 5 content collections (`type: 'data'`), YAML, Zod, Vitest, scripts Node (`npm run validate:productos`).

**Spec:** `docs/superpowers/specs/2026-06-20-ampliacion-catalogo-sillas-100-design.md`

**Reglas duras (heredadas):**
- **Honestidad:** nada inventado. Dato no confirmado = `null`. Cada ficha con `fuenteSpecs` + `verificadoEn` + bloque `fuentes`.
- **No inventar ASINs** (API Creators en 403). CTA = `amazon.buscar` (search fallback) o `webOficial` para premium sin Amazon. `amazon.asin` solo si hay ASIN ES real verificado.
- **Imágenes: las sube el usuario.** Ficha no se mergea a `main` sin su imagen real en `public/img/productos/`.
- **Humanizar** `veredicto`/`comunidad`: sin em-dash en texto visible, ortografía ES, test anti-IA.
- **No copiar** textos de fabricante/reseñas. Comunidad solo como consenso, nunca un comentario aislado.
- Gates por oleada: `npm run validate:productos` + `npm test` + `npm run build` en verde.

**Nota harness:** el hook "Fact-Forcing Gate" puede bloquear el primer Bash/Write/Edit de cada archivo pidiendo facts (request en 1 frase + qué hace). Cumplirlo y reintentar. Pasárselo a cada subagente.

**Ficha de referencia (patrón de oro):** `src/content/productos/sihoo-doro-c300.yaml`. Toda ficha nueva debe igualar su nivel de detalle.

---

## File Structure

- `src/content/productos/<slug>.yaml` — **Create** (una por silla). Datos verificables + bloque editorial completo.
- `public/img/productos/<slug>.<ext>` — **Create por el usuario** (jpg/webp/avif). Lienzo cuadrado blanco uniforme.
- `docs/research/sillas/oleada-NN-imagenes.md` — **Create por oleada**. Manifiesto de imágenes pendientes (handoff al usuario).
- `docs/research/sillas/backlog-sillas.csv` — **Modify**. `estado` candidate→published; añadir candidatas nuevas (Bloque B).
- `docs/research/sillas/source-log.md` — **Modify**. Fuentes nuevas usadas por oleada.
- `docs/research/sillas/ESTADO.md` — **Modify**. Handoff multi-PC: oleada actual, qué falta, bloqueos.

No se crean ni modifican componentes `.astro` ni `src/lib/*` en este plan. La búsqueda/grupos de filtros del catálogo (Task 8 del plan `2026-06-18`) es un plan aparte (ver Task 11).

---

## Procedimiento de oleada (PROC) — pasos reutilizables

Cada Task de oleada (1, 2, 3, 6-10) ejecuta este procedimiento con su lista concreta de slugs. Los pasos están aquí una sola vez; cada Task aporta solo los inputs (slugs + tier).

**PROC-1: Research por silla (fuente oficial primero).** Para cada slug del lote, reunir:
- Specs de web oficial o manual PDF del fabricante (jerarquía de `source-log.md`).
- 1-3 reseñas reconocidas con mediciones (Tom's Guide, RTINGS, Wirecutter, etc.).
- Consenso de comunidad (r/OfficeChairs, foros). Solo consenso, no comentario aislado.
- Anotar cada URL con su `fechaConsulta` (= hoy) para el bloque `fuentes` y `fuenteSpecs`.

**PROC-2: Escribir la ficha YAML** en `src/content/productos/<slug>.yaml` copiando la ESTRUCTURA de `sihoo-doro-c300.yaml`. Plantilla con guía campo a campo (rellenar con datos reales; lo no confirmado va `null`/`[]`/`""`):

```yaml
tipo: "silla"
nombre: "<nombre comercial exacto>"
marca: "<marca>"
imagen: ""                         # VACÍO en producción de oleada (cae a FallbackImagen). Se cablea tras subir imagen.
imagenAlt: "Silla <descripción corta con keyword>"
tramoPrecio: 3                     # 1:<150  2:150-300  3:300-600  4:>600 (según precio real observado)
precioMin: null                    # solo si verificado el día y mercado; si no, null
precioMax: null
valoracion: 4.3                    # 0-5 global, derivada de los ejes y el análisis
valoraciones:                      # 0-10 cada eje; null si no hay base para puntuar
  ergonomia: null
  ajustabilidad: null
  materiales: null
  comodidad: null
  calidadPrecio: null
amazon:
  asin: null                       # null salvo ASIN ES real verificado
  buscar: "<query Amazon>"         # search fallback; null si premium sin Amazon (usar webOficial)
amazonPrimaryMarket: "ES"
mercadosAmazon: []                 # vacío salvo ASIN por mercado verificado
oneLinkReady: false                # true solo si hay enlace Amazon verificable
webOficial: null                   # URL tienda/fabricante para premium sin Amazon
idealPara: "<perfil de uso en 1 frase>"
veredicto: "<2-3 frases, humanizado, sin em-dash, criterio editorial honesto>"
resumenCompra:
  mejorPara: "<...>"
  evitarSi: "<...>"
  alternativaDirecta: "<slug o nombre de otra silla del catálogo + por qué>"
  decisionRapida: "<la frase de cierre>"
metodologia:
  - "Se han contrastado specs oficiales y reseñas citadas en fuenteSpecs."
  - "<criterio de puntuación específico de esta silla>"
scoreRationale:
  ergonomia: "<por qué esa nota>"
  ajustabilidad: "<...>"
  materiales: "<...>"
  comodidad: "<...>"
  calidadPrecio: "<...>"
fuentes:
  - tipo: "oficial"                # oficial|review|comunidad|tienda|manual
    nombre: "<nombre fuente>"
    url: "https://..."             # URL válida (Zod valida formato)
    fechaConsulta: "2026-06-20"
limitaciones:
  - "<limitación real verificada>"
alternativas:
  - slug: "<slug existente en catálogo>"
    motivo: "<por qué>"
comunidad: "<consenso de reseñas/foros, humanizado>"
paraQuienSi:
  - "<perfil 1>"
  - "<perfil 2>"
paraQuienNo:
  - "<perfil 1>"
  - "<perfil 2>"
puntosFuertes:
  - "<...>"
puntosDebiles:
  - "<...>"
fuenteSpecs: "<lista de URLs/fuentes separadas por +>"
verificadoEn: "2026-06-20"
specs:
  tipo: "silla"
  lumbar: "dinamico"               # fijo|presion|altura|dinamico|5d
  respaldo: "malla"                # malla|espuma|mixto
  reposabrazos: "3d"               # ninguno|fijo|1d|2d|3d|4d|abatibles
  profundidadRegulable: false
  reclinacionMaxGrados: null
  pesoMaxKg: null
  alturaAsientoMinCm: null
  alturaAsientoMaxCm: null
  anchoCm: null
  fondoCm: null
  mecanismo: null
  baseMaterial: null
  certificacionBifma: null
  pesoProductoKg: null
  garantiaAnios: null
  alturaRecomendadaMinCm: null
  alturaRecomendadaMaxCm: null
  anchoAsientoCm: null
  profundidadAsientoMinCm: null
  profundidadAsientoMaxCm: null
  alturaRespaldoCm: null
  reposacabezas: null              # ninguno|fijo|ajustable
  asientoMaterial: null
  ruedasSueloDuro: null
  certificacionEn1335: null
  montajeMinutos: null
  devolucionDias: null
```

Reglas de calidad de la ficha (definition of done parcial):
- `paraQuienSi`, `paraQuienNo`, `puntosFuertes`, `puntosDebiles` no vacíos.
- `fuentes` con ≥1 entrada `tipo: "oficial"`.
- Máximo razonable de `specs.*` en `null`: si quedan >8 specs en `null`, la fuente es insuficiente → marcar la silla de nuevo `candidate` en el backlog y NO publicarla en esta oleada.
- `alternativas[].slug` debe existir en `src/content/productos/`.

**PROC-3: Validar la ficha (sin imagen aún).**
Run: `npm run validate:productos`
Expected: `OK: catalogo de productos valido` (las fichas con `imagen: ""` no disparan el chequeo de imagen local).

**PROC-4: Generar el manifiesto de imágenes** `docs/research/sillas/oleada-NN-imagenes.md`:

```markdown
# Oleada NN — imágenes pendientes

Sube cada imagen a `public/img/productos/<archivo>` (lienzo cuadrado blanco uniforme) y avisa.

| slug | fuente sugerida (URL imagen oficial) | archivo destino | alt sugerido |
|------|--------------------------------------|-----------------|--------------|
| herman-miller-sayl | https://store.hermanmiller.com/... | herman-miller-sayl.jpg | Silla Herman Miller Sayl respaldo Y-Tower |
```

**PROC-5: Commit de la ficha-set (sin imágenes).**
```bash
git add src/content/productos/ docs/research/sillas/oleada-NN-imagenes.md
git commit -m "data(sillas): oleada NN fichas (<tier>), pendiente imagenes"
```

**PROC-6: HANDOFF — el usuario sube las imágenes** a `public/img/productos/` según el manifiesto. Esperar confirmación. (Checkpoint humano; el subagente no continúa la oleada hasta que el usuario confirme.)

**PROC-7: Cablear imágenes.** Para cada ficha, editar `imagen: ""` → `imagen: "/img/productos/<slug>.<ext>"` con la extensión real subida. Normalizar al lienzo cuadrado blanco si hace falta (criterio de commits previos `5f31856`/`948a1ad`).

**PROC-8: Gates finales.**
Run: `npm run validate:productos` → `OK` (ahora sí valida que cada imagen local existe).
Run: `npm test` → suite verde (33/33 o más).
Run: `npm run build` → build verde, nº de páginas = anterior + nº de fichas de la oleada.

**PROC-9: Trazabilidad.** Editar:
- `backlog-sillas.csv`: cada slug de la oleada `estado` candidate→published; rellenar `fuente_oficial/fuente_reviews/fuente_comunidad=si`, `notas` con fecha de oleada.
- `source-log.md`: añadir bloque "Oleada NN (fecha): fuentes nuevas".
- `ESTADO.md`: actualizar "Resumen en una línea", tabla de Tasks, "Catálogo actual: N sillas", próximos pasos.

**PROC-10: Commit + merge.**
```bash
git add src/content/productos/ public/img/productos/ docs/research/sillas/
git commit -m "data(sillas): oleada NN completa (<N> fichas con imagenes) -> catalogo a <total>"
git checkout main && git merge --no-ff feat/sillas-catalogo-100-oleadas
```
(Si CSP cambia por el build, commitear `public/_headers` solo si el diff es swap de hash del script del catálogo.)

---

## Task 1: Oleada 1 — premium / oficina (E-E-A-T)

**Files:**
- Create: `src/content/productos/{herman-miller-sayl,herman-miller-mirra-2,herman-miller-cosm,steelcase-think,haworth-zody,humanscale-diffrient-smart,hag-sofi}.yaml`
- Create: `docs/research/sillas/oleada-01-imagenes.md`
- Modify: `docs/research/sillas/{backlog-sillas.csv,source-log.md,ESTADO.md}`

**Inputs (slugs, ya en backlog como `candidate`):** herman-miller-sayl, herman-miller-mirra-2, herman-miller-cosm, steelcase-think, haworth-zody, humanscale-diffrient-smart, hag-sofi (7 fichas).

**Tier:** premium. CTA esperado: mayoría `webOficial` (no se venden directas en Amazon ES); `amazon.buscar` solo si el search devuelve la silla real, no terceros.

- [ ] **Step 1: PROC-1** — research oficial de las 7 sillas. Web oficial Herman Miller/Steelcase/Haworth/Humanscale/HAG + reseñas (Tom's Guide, RTINGS, Wirecutter) + r/OfficeChairs.
- [ ] **Step 2: PROC-2** — escribir las 7 fichas YAML (estructura de `sihoo-doro-c300.yaml`), `imagen: ""`. Para premium sin Amazon: `amazon.buscar: null`, `webOficial: "<url tienda oficial>"`, `oneLinkReady: false`.
- [ ] **Step 3: PROC-3** — `npm run validate:productos` → `OK`.
- [ ] **Step 4: PROC-4** — escribir `docs/research/sillas/oleada-01-imagenes.md`.
- [ ] **Step 5: PROC-5** — commit fichas-set (sin imágenes).
- [ ] **Step 6: PROC-6** — HANDOFF: el usuario sube las 7 imágenes. Esperar confirmación.
- [ ] **Step 7: PROC-7** — cablear `imagen:` de las 7 fichas.
- [ ] **Step 8: PROC-8** — `npm run validate:productos` + `npm test` + `npm run build` (páginas = base + 7).
- [ ] **Step 9: PROC-9** — actualizar backlog/source-log/ESTADO (catálogo a 31).
- [ ] **Step 10: PROC-10** — commit + merge a `main`.

---

## Task 2: Oleada 2 — gama media / marcas conocidas

**Files:**
- Create: `src/content/productos/{sihoo-doro-s300,flexispot-c7,flexispot-bs11-pro,hbada-e3,ticova-ergonomic,nouhaus-ergo3d,ergotopia-nextback,colamy-high-back,songmics-obg-cloud}.yaml`
- Create: `docs/research/sillas/oleada-02-imagenes.md`
- Modify: `docs/research/sillas/{backlog-sillas.csv,source-log.md,ESTADO.md}`

**Inputs (9 fichas):** sihoo-doro-s300, flexispot-c7, flexispot-bs11-pro, hbada-e3, ticova-ergonomic, nouhaus-ergo3d, ergotopia-nextback, colamy-high-back, songmics-obg-cloud.

**Tier:** media/budget. CTA esperado: mayoría `amazon.buscar` (search fallback); `amazon.asin` solo si hay ASIN ES real verificado.

- [ ] **Step 1: PROC-1** — research oficial de las 9 sillas (web fabricante + reseñas + comunidad).
- [ ] **Step 2: PROC-2** — escribir las 9 fichas YAML, `imagen: ""`, CTA `amazon.buscar`.
- [ ] **Step 3: PROC-3** — `npm run validate:productos` → `OK`.
- [ ] **Step 4: PROC-4** — escribir `oleada-02-imagenes.md`.
- [ ] **Step 5: PROC-5** — commit fichas-set.
- [ ] **Step 6: PROC-6** — HANDOFF: usuario sube 9 imágenes. Esperar.
- [ ] **Step 7: PROC-7** — cablear `imagen:`.
- [ ] **Step 8: PROC-8** — validate + test + build (páginas = base + 9).
- [ ] **Step 9: PROC-9** — trazabilidad (catálogo a 40).
- [ ] **Step 10: PROC-10** — commit + merge.

---

## Task 3: Oleada 3 — IKEA + gaming

**Files:**
- Create: `src/content/productos/{ikea-flintan,ikea-hattefjall,ikea-styrspel,razer-iskur-v2,corsair-tc100,newskill-takamikura,drift-dr500,branch-ergonomic}.yaml`
- Create: `docs/research/sillas/oleada-03-imagenes.md`
- Modify: `docs/research/sillas/{backlog-sillas.csv,source-log.md,ESTADO.md}`

**Inputs (8 fichas):** ikea-flintan, ikea-hattefjall, ikea-styrspel, razer-iskur-v2, corsair-tc100, newskill-takamikura, drift-dr500, branch-ergonomic.

**Tier:** IKEA (CTA `webOficial` IKEA; `amazon.buscar` solo si relevante) + gaming (CTA `amazon.buscar` o web oficial Secretlab-style). Branch: verificar disponibilidad EU; si no hay venta ES/EU, `webOficial` US y nota en `limitaciones`.

- [ ] **Step 1: PROC-1** — research oficial (IKEA.es, Razer, Corsair, Newskill, Drift, Branch).
- [ ] **Step 2: PROC-2** — escribir las 8 fichas YAML, `imagen: ""`.
- [ ] **Step 3: PROC-3** — `npm run validate:productos` → `OK`.
- [ ] **Step 4: PROC-4** — escribir `oleada-03-imagenes.md`.
- [ ] **Step 5: PROC-5** — commit fichas-set.
- [ ] **Step 6: PROC-6** — HANDOFF: usuario sube 8 imágenes. Esperar.
- [ ] **Step 7: PROC-7** — cablear `imagen:`.
- [ ] **Step 8: PROC-8** — validate + test + build (páginas = base + 8).
- [ ] **Step 9: PROC-9** — trazabilidad (catálogo a 48).
- [ ] **Step 10: PROC-10** — commit + merge. **Bloque A (backlog) completado: 48 sillas.**

---

## Task 4: Research Bloque B — ampliar backlog a 100+ candidatas

**Files:**
- Modify: `docs/research/sillas/backlog-sillas.csv` (añadir ~52 filas `estado=candidate`)
- Modify: `docs/research/sillas/source-log.md`

Objetivo: tener pipeline para superar 100 fichas publicadas. Añadir ~52 candidatas nuevas con `slug,nombre,marca,tier,estado=candidate,mercados_objetivo,amazon_query,prioridad,motivo_inclusion`.

Segmentos a cubrir (marcas confirmadas en el spec, ampliables con criterio):
- **Budget Amazon.es:** KERDOM, Razzor, Newkity, Yaheetech, Mfavour, Eureka, Devoko, Naspaluro, Dripex.
- **Gaming:** noblechairs Icon, AndaSeat (Kaiser/Phantom), DXRacer, Corsair T3 Rush, Razer Enki, Trust GXT, Forgeon, Newskill (otros), Drift (otros).
- **Oficina/premium:** Interstuhl, Vitra (ID Chair/Physix), Okamura, Boss Design, Wilkhahn, Sedus, Giroflex, Dauphin.
- **Marcas ES / retail:** Forma5, Actiu, IKEA (resto gama), Conforama/Carrefour si tienen modelo con specs oficiales.

- [ ] **Step 1:** Para cada candidata, verificar que existe web oficial o ficha con specs (descartar las que no tengan fuente oficial localizable). Anotar `amazon_query` plausible.
- [ ] **Step 2:** Añadir las filas al CSV respetando el orden de columnas del header existente (campos sin dato = vacío, no inventar ASIN).
- [ ] **Step 3:** Registrar en `source-log.md` un bloque "Research batch 2-5 (2026-..): N candidatas añadidas, criterio de inclusión".
- [ ] **Step 4: Verificar el CSV no rompe el importador.**
Run: `node scripts/import-productos-sillas.mjs docs/research/sillas/import-sample.csv` (dry-run con el sample, no con el backlog) — confirma que el script sigue parseando. Expected: `created ...` sin throw, luego borrar el yaml de prueba si lo crea.
- [ ] **Step 5: Commit.**
```bash
git add docs/research/sillas/backlog-sillas.csv docs/research/sillas/source-log.md
git commit -m "docs(sillas): research batch 2-5, backlog ampliado a 100+ candidatas"
```

---

## Task 5: Oleada 4 (candidatas batch B, lote ~10)

**Files:**
- Create: `src/content/productos/<10 slugs del backlog ordenados por prioridad>.yaml`
- Create: `docs/research/sillas/oleada-04-imagenes.md`
- Modify: `docs/research/sillas/{backlog-sillas.csv,source-log.md,ESTADO.md}`

**Inputs:** seleccionar del backlog las ~10 candidatas `prioridad=alta` no publicadas (preferir las de mayor demanda/E-E-A-T). Listar los slugs concretos al iniciar la oleada.

Ejecutar **PROC-1 … PROC-10** (idéntico a Task 1, sustituyendo el lote). Catálogo a ~58.

- [ ] Step 1: PROC-1 (research lote)
- [ ] Step 2: PROC-2 (escribir fichas)
- [ ] Step 3: PROC-3 (validate)
- [ ] Step 4: PROC-4 (manifiesto oleada-04)
- [ ] Step 5: PROC-5 (commit fichas-set)
- [ ] Step 6: PROC-6 (HANDOFF imágenes — esperar)
- [ ] Step 7: PROC-7 (cablear imágenes)
- [ ] Step 8: PROC-8 (validate + test + build)
- [ ] Step 9: PROC-9 (trazabilidad)
- [ ] Step 10: PROC-10 (commit + merge)

---

## Task 6: Oleada 5 (lote ~10)

Igual que Task 5 con el siguiente lote del backlog (`prioridad=media` por demanda). Catálogo a ~68. Manifiesto `oleada-05-imagenes.md`.

- [ ] Step 1: PROC-1 · [ ] Step 2: PROC-2 · [ ] Step 3: PROC-3 · [ ] Step 4: PROC-4 · [ ] Step 5: PROC-5 · [ ] Step 6: PROC-6 (HANDOFF) · [ ] Step 7: PROC-7 · [ ] Step 8: PROC-8 · [ ] Step 9: PROC-9 · [ ] Step 10: PROC-10

---

## Task 7: Oleada 6 (lote ~10)

Igual que Task 5 con el siguiente lote. Catálogo a ~78. Manifiesto `oleada-06-imagenes.md`.

- [ ] Step 1: PROC-1 · [ ] Step 2: PROC-2 · [ ] Step 3: PROC-3 · [ ] Step 4: PROC-4 · [ ] Step 5: PROC-5 · [ ] Step 6: PROC-6 (HANDOFF) · [ ] Step 7: PROC-7 · [ ] Step 8: PROC-8 · [ ] Step 9: PROC-9 · [ ] Step 10: PROC-10

---

## Task 8: Oleada 7 (lote ~10)

Igual que Task 5 con el siguiente lote. Catálogo a ~88. Manifiesto `oleada-07-imagenes.md`.

- [ ] Step 1: PROC-1 · [ ] Step 2: PROC-2 · [ ] Step 3: PROC-3 · [ ] Step 4: PROC-4 · [ ] Step 5: PROC-5 · [ ] Step 6: PROC-6 (HANDOFF) · [ ] Step 7: PROC-7 · [ ] Step 8: PROC-8 · [ ] Step 9: PROC-9 · [ ] Step 10: PROC-10

---

## Task 9: Oleada 8 (lote ~12) — cruzar 100

Igual que Task 5 con un lote de ~12 para superar las 100 publicadas. Catálogo a **100+**. Manifiesto `oleada-08-imagenes.md`.

- [ ] Step 1: PROC-1 · [ ] Step 2: PROC-2 · [ ] Step 3: PROC-3 · [ ] Step 4: PROC-4 · [ ] Step 5: PROC-5 · [ ] Step 6: PROC-6 (HANDOFF) · [ ] Step 7: PROC-7 · [ ] Step 8: PROC-8 · [ ] Step 9: PROC-9 · [ ] Step 10: PROC-10

- [ ] **Step 11: Cierre de fase.** Confirmar `ls src/content/productos/*.yaml | wc -l` ≥ 100 y `npm run build` verde. Actualizar `ESTADO.md` → fase "100+ alcanzada".

---

## Task 10: Auditoría de calidad post-100

**Files:** Modify: fichas con exceso de `null`; `docs/research/sillas/ESTADO.md`.

- [ ] **Step 1: Detectar fichas pobres.**
Run: `grep -c ': null' src/content/productos/*.yaml | sort -t: -k2 -rn | head -20`
Revisar las que tengan muchos `specs.*` en `null` (umbral >8) → completar con fuente oficial o degradar nota.
- [ ] **Step 2:** Para cada ficha pobre, volver a PROC-1/PROC-2 (completar specs) o documentar en `limitaciones` por qué faltan.
- [ ] **Step 3:** `npm run validate:productos` + `npm test` + `npm run build`.
- [ ] **Step 4: Commit.**
```bash
git add src/content/productos/ docs/research/sillas/ESTADO.md
git commit -m "data(sillas): auditoria calidad post-100, completar specs"
```

---

## Task 11: (fuera de este plan) Búsqueda + grupos de filtros del catálogo

Al cruzar ~50 fichas, el catálogo necesita búsqueda por texto y agrupación de filtros para seguir navegable (Task 8 del plan `2026-06-18-megarecopilacion-sillas-100-plus.md`). **Es una feature de código (`src/lib/productos.ts` + `CatalogoProductos.astro`), no producción de contenido.** Tiene su propio diseño y TDD.

- [ ] **Acción:** cuando el catálogo pase de 50 (tras Task 6), invocar `superpowers:brainstorming` → `writing-plans` para specear esa feature en un plan separado. No mezclar con las oleadas de contenido.

---

## Self-Review

**Spec coverage:**
- §3.1 imágenes manuales → PROC-4/PROC-6/PROC-7 (manifiesto + handoff + cableado). ✓
- §3.2 empujar a 100 sin esperar indexación → Tasks 1-9 sin gate de GSC; medición fuera de alcance (§8). ✓
- §3.3 backlog-first → Tasks 1-3 (24 candidatas) antes que Task 4 (research nuevo). ✓
- §3.4 lotes ~10 → Tasks con 7-12 fichas. ✓
- §3.5 rama por oleada / merge con imágenes → PROC-10. ✓
- §4 unidad de producción → PROC-1…PROC-10. ✓
- §6 hoja de ruta (Bloque A 3 oleadas, Bloque B research + oleadas) → Tasks 1-9. ✓
- §6 mejora estructural intercalada → Task 11 (plan aparte). ✓
- §7 trazabilidad → PROC-9. ✓
- §8 fuera de alcance (hubs, indexación, ASIN, otras categorías) → no hay tasks de eso. ✓

**Placeholder scan:** la plantilla YAML usa `<...>` como guía de relleno deliberada (el dato real es research en ejecución, no se puede preescribir sin inventar — viola la regla de honestidad preescribir specs). Los pasos PROC y las listas de slugs son concretos. ✓

**Type consistency:** los campos de la plantilla coinciden con `src/content/config.ts` (verificado: `mercadosAmazon`, `oneLinkReady`, `amazonPrimaryMarket`, `resumenCompra`, `scoreRationale`, `fuentes`, `limitaciones`, `alternativas`, specs ampliadas). Slugs de Tasks 1-3 = las 24 candidatas del backlog (7+9+8=24). ✓
