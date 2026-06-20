# Diseño — Ampliación catálogo de sillas 24 → 100+ (oleadas)

> **Fecha:** 2026-06-20 · **Autor:** David Rubio Mota · **Estado:** aprobado, listo para writing-plans
> **Rama de trabajo:** `feat/sillas-catalogo-100-oleadas` (sale de `main` actualizado, 24 fichas).
> **Continuación de:** `docs/superpowers/plans/2026-06-18-megarecopilacion-sillas-100-plus.md` (Tasks 1-5 ya hechas) y handoff `docs/research/sillas/ESTADO.md`.
>
> **NOTA multi-PC:** toda la decisión vive en este repo. Cualquier agente/PC retoma desde aquí + `ESTADO.md`.

---

## 1. Problema y objetivo

El catálogo de sillas está en **24 fichas** publicadas en `main` (`src/content/productos/*.yaml`, renderizadas en `/catalogo/silla/`). El objetivo del proyecto es un catálogo **amplio y diferencial** (foso defensivo: ninguna web ES de home-office ofrece un catálogo filtrable de sillas con specs verificables). Meta: **100+ sillas**.

La infraestructura ya está montada (megarecopilación, Tasks 1-5): schema diferencial, validador (`npm run validate:productos`), importador CSV→YAML (`scripts/import-productos-sillas.mjs`), tests (33/33), y un backlog de research con **24 candidatas ya identificadas** (`docs/research/sillas/backlog-sillas.csv`).

**Por tanto el cuello de botella NO es el código, sino producir fichas reales a escala**: por cada silla hay que verificar specs oficiales, leer reseñas y consenso de comunidad, redactar el bloque editorial completo, y montar la imagen.

## 2. Principio de honestidad (NO negociable)

Heredado de `source-log.md` y `AGENTS.md`:
- Catálogo amplio SÍ, pero **cada ficha con specs verificables**. Amplio + inventado = el error que colapsó la indexación, multiplicado.
- Todo dato no confirmado va `null` (no se inventa un número).
- Cada ficha registra `fuenteSpecs` y `verificadoEn`.
- Jerarquía de fuentes: (1) web oficial/manual fabricante, (2) tienda oficial/distribuidor, (3) Amazon por mercado para ASIN/imagen/precio, (4) reseñas reconocidas con mediciones, (5) comunidad solo como consenso.
- No copiar textos de fabricante ni reseñas. No afirmar "probada" salvo el setup real de David.
- **No inventar ASINs.** La API Amazon Creators sigue en 403 `AssociateNotEligible` → CTA = Amazon *search fallback* (OneLink-routable) o web oficial para premium sin Amazon.

## 3. Decisiones del usuario (sesión 2026-06-20)

1. **Imágenes:** las sube el usuario manualmente a `public/img/productos/`. Ninguna ficha se da por publicada sin imagen real.
2. **Indexación:** empujar a 100 **igualmente**, sin esperar señal de GSC. Se asume el riesgo a cambio del foso defensivo.
3. **Orden:** **backlog-first** — primero convertir las 24 candidatas ya researcheadas en fichas (→ ~48), luego researchear hasta 100+.
4. **Lotes de ~10** por oleada (equilibra calidad de verificación y nº de imágenes a subir de una vez).
5. **Una rama por oleada**, merge a `main` solo cuando la oleada está completa con imágenes.
6. Al pasar de ~50 fichas, **intercalar** la mejora de búsqueda por texto + grupos de filtros del catálogo (Task 8 del plan viejo).

## 4. Unidad de producción: la "oleada"

Una oleada = un lote de ~10 fichas **completas**. Flujo por ficha:

1. **Sourcing:** specs de fuente oficial (web/manual fabricante) + reseñas reconocidas + consenso de comunidad (r/OfficeChairs, foros). Registrar `fuenteSpecs` (URLs concretas) y `verificadoEn`.
2. **Redacción editorial completa** (no esqueleto del importador): `idealPara`, `veredicto`, `paraQuienSi`, `paraQuienNo`, `puntosFuertes`, `puntosDebiles`, `comunidad`, `valoraciones` por ejes (ergonomía, ajustabilidad, materiales, comodidad, calidadPrecio), `valoracion` global, `tramoPrecio`.
3. **Specs:** rellenar `specs.*` con datos oficiales; lo no confirmado, `null`.
4. **CTA:** `amazon.buscar` (search fallback) o `webOficial` para premium sin Amazon. `amazon.asin: null` salvo ASIN ES verificado real. `oneLinkReady` según corresponda.
5. **Imagen:** dejar `imagen: ""` (cae a `FallbackImagen`) y registrar la entrada en el **manifiesto de imágenes pendientes** de la oleada.
6. **Humanización:** aplicar el test anti-IA a `veredicto`/`comunidad` (sin em-dash en texto visible, ortografía ES).

**Flujo de la oleada (handoff de imágenes):**
1. Producir las ~10 fichas en la rama de la oleada (`imagen: ""`).
2. Generar `docs/research/sillas/oleada-NN-imagenes.md`: tabla `slug → fuente sugerida de imagen → nombre de archivo destino (public/img/productos/<slug>.<ext>) → alt sugerido`.
3. El usuario sube las imágenes a `public/img/productos/`.
4. Cablear cada `imagen:` al archivo subido, normalizar al lienzo cuadrado blanco si hace falta (criterio de los commits previos), `npm run build`.
5. `npm run validate:productos` + `npm test` + `npm run build` en verde.
6. Actualizar `backlog-sillas.csv` (candidate→published), `source-log.md`, `ESTADO.md`.
7. Merge de la rama de la oleada a `main`.

**Criterio de "publicable" (definition of done por ficha):** specs oficiales con `fuenteSpecs`+`verificadoEn`; bloque editorial completo y humanizado; CTA válido sin ASIN inventado; **imagen real presente**; validador y build verdes.

## 5. Estrategia de rama / publicación

- Rama base de la fase: `feat/sillas-catalogo-100-oleadas` (esta).
- Cada oleada puede vivir en su propia sub-rama o como commits agrupados; el invariante es **no mergear a `main` una oleada sin sus imágenes reales**.
- `main` es la fuente de verdad y de deploy (Cloudflare Pages). La vieja `feat/megarecopilacion-sillas` quedó por detrás de `main` y no se usa.

## 6. Hoja de ruta de oleadas

**Bloque A — vaciar backlog (24 candidatas → ~48 fichas):**
- Oleada 1 (premium/oficina): herman-miller-sayl, herman-miller-mirra-2, herman-miller-cosm, steelcase-think, haworth-zody, humanscale-diffrient-smart, hag-sofi (E-E-A-T).
- Oleada 2 (gama media / marcas conocidas): sihoo-doro-s300, flexispot-c7, flexispot-bs11-pro, hbada-e3, ticova-ergonomic, nouhaus-ergo3d, ergotopia-nextback, colamy-high-back, songmics-obg-cloud.
- Oleada 3 (IKEA + gaming): ikea-flintan, ikea-hattefjall, ikea-styrspel, razer-iskur-v2, corsair-tc100, newskill-takamikura, drift-dr500, branch-ergonomic.

**Bloque B — research hasta 100+ (≈52 candidatas nuevas):**
- Research batches 2-5 en `backlog-sillas.csv`: más budget Amazon.es (KERDOM, Razzor, Newkity, Yaheetech, Mfavour, Eureka), más gaming (Noblechairs Icon, AndaSeat, DXRacer, Corsair variantes), más oficina/premium (Interstuhl, Vitra, Okamura, Boss Design), marcas ES.
- Oleadas 4-8: producir esas hasta superar 100 fichas publicadas.

**Mejora estructural intercalada (al pasar de ~50 fichas):**
- Activar búsqueda por texto + grupos de filtros en `CatalogoProductos.astro` (Task 8 del plan `2026-06-18`). No necesita datos externos. Mantiene navegable un catálogo grande.

## 7. Trazabilidad (multi-PC)

Cada oleada actualiza, en el mismo commit/merge:
- `docs/research/sillas/backlog-sillas.csv` — estado de cada slug (candidate→published), queries, mercados.
- `docs/research/sillas/source-log.md` — fuentes nuevas usadas.
- `docs/research/sillas/ESTADO.md` — handoff: qué oleada va, qué falta, bloqueos.

## 8. Fuera de alcance (YAGNI)

- **Hubs editoriales / artículos nuevos** (Task 10 del plan viejo): bloqueados por la pausa editorial de indexación y por requerir SERP real del usuario. No entran en esta fase.
- **Medición de indexación (Task 11):** el usuario decidió empujar a 100 sin esperar; la medición queda como observación posterior, no como gate.
- **Verificación de ASINs por mercado / OneLink real:** bloqueado por la API Creators (403). No se fuerza.
- **Nuevas categorías** (escritorios, etc.): el motor es config-driven y lo soporta, pero esta fase es solo sillas.

## 9. Riesgos

- **Volumen sin indexación confirmada:** producir ~76 fichas que Google podría no indexar. Mitigación: cada ficha es un activo factual reutilizable (tablas comparativas, selector), no solo una página suelta.
- **Ritmo limitado por subida manual de imágenes:** mitigado por el manifiesto por oleada (el usuario sabe exactamente qué subir) y por lotes de ~10.
- **Calidad a escala:** riesgo de fichas pobres (muchos `null`). Mitigación: definition of done por ficha + validador + auditoría de `null` por oleada.
- **CTA irrelevante en search fallback** (IKEA/Secretlab/premium no venden en Amazon): revisar por ficha; preferir `webOficial` cuando el search devuelva terceros.
