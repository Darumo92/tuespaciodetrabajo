# Progreso ejecución — Catálogo sillas mejoras

> Estado de ejecución del plan `docs/superpowers/plans/2026-06-06-catalogo-sillas-mejoras.md`
> mediante subagent-driven-development (multiagentes). Última actualización: **2026-06-07 ~14:20** (hora servidor build).
> Rama: `feat/catalogo-sillas-db`.

## Resumen

Tasks 1–9 **completadas y commiteadas**. Tasks 10–11 **pendientes** (cortadas por límite de
sesión: los 4 subagentes de investigación de la Task 10 se detuvieron antes de escribir ningún
`.yaml`, por lo que la Task 10 está a **cero progreso real** — el árbol de trabajo no tiene cambios
en `src/content/sillas/`).

Estado verificado tras Task 9:
- `npm run build` → OK (build Complete, _headers regenerado sin diff nuevo).
- `npx vitest run src/lib/sillas.test.ts` → **29/29 tests pasan**.
- Árbol de trabajo limpio.

## Tasks completadas (commits en la rama)

| Task | Commit | Descripción |
|------|--------|-------------|
| 1 | `f8123e2` | Schema Zod ampliado (specs, sub-scores, campos editoriales) |
| 2 | `c637f22` | Tipo `Valoraciones` + `mediaEjesPresentes` + `notaGlobal` (TDD) |
| 3 | `1d2dc12` | `ganadoresPorValor` (TDD) |
| 4 | `0f92c94` | `ImagenSilla` + `FallbackImagen` |
| 5 | `bc64c72` | `ValoracionEjes.astro` |
| 6 | `6b831d9` | `ParaQuien.astro` |
| 7 | `798d1b6` | `FichaSilla` enriquecida + schema `Review` honesto en `[slug].astro` |
| 8 | `b2553f9` | `TarjetaSilla` + selección comparar (casillas + barra flotante) + `_headers` |
| 9 | `d324e85` | Comparador interactivo `/sillas/comparar` (noindex, resalte ganador) + `_headers` |

Verificaciones hechas durante la ejecución:
- Schema `Review` presente en `dist/sillas/catalogo/sihoo-doro-c300/index.html`.
- `FAQPage` y `"HowTo"` → 0 ocurrencias en `dist/`.
- Ruta `/sillas/comparar/index.html` generada con `noindex`.

## PENDIENTE — Task 10 (PILAR: investigación + enriquecer 19 sillas)

**No iniciada en disco.** Es la tarea más importante y la más cara (investigación web real
por silla). Hay que rellenar en cada `src/content/sillas/*.yaml` los campos nuevos del schema:
`anchoCm`, `fondoCm`, `mecanismo`, `baseMaterial`, `certificacionBifma`, `pesoProductoKg`,
`valoraciones{ergonomia,ajustabilidad,materiales,comodidad,calidadPrecio}`, `veredicto`,
`comunidad`, `paraQuienSi[]`, `paraQuienNo[]`; además completar `null` existentes confirmables
(`alturaAsientoMinCm/Max`, `reclinacionMaxGrados`, `garantiaAnios`, `pesoMaxKg`), actualizar
`fuenteSpecs` y poner `verificadoEn: "2026-06-06"`.

**Reglas (del plan, innegociables):** dato no confirmado en fuente real → `null` / `n/d`.
NUNCA inventar números, dimensiones, certificaciones ni ASINs. Sub-scores editoriales pero
fundados en specs + consenso real; eje sin base → `null`.

**Rúbrica + calibración:** ver Task 10 del plan (`...catalogo-sillas-mejoras.md`, Step 2).
Premium (Aeron, Embody, Gesture, Leap V2, Haworth Fern) ~9–9.7 ergonomía/materiales;
mid sólida (Doro C300, C7 Lite, M57) ~8–8.8; económicas correctas (Markus, Hbada, M102C) ~6.5–8;
básicas (Songmics, Durrafy, Holludle) ~5.5–7. Calidad-precio suele invertirse (económicas altas).

**Reparto sugerido para multiagentes (archivos disjuntos = sin conflicto; que NO hagan commit,
commitea el coordinador 1 sola vez):**
- Grupo A (premium): `herman-miller-aeron`, `herman-miller-embody`, `steelcase-gesture`, `steelcase-leap-v2`, `haworth-fern`
- Grupo B (sihoo/flexispot): `sihoo-doro-c300`, `sihoo-m57`, `sihoo-m18`, `sihoo-m102c`, `flexispot-c7-lite`
- Grupo C (mixto): `secretlab-titan-evo`, `hag-capisco`, `autonomous-ergochair-pro`, `ikea-jarvfjallet`, `ikea-markus`
- Grupo D (económicas): `hbada-ergonomica`, `songmics-obn55bk`, `durrafy-ergonomica`, `holludle-ergonomica`

Tras enriquecer: `npm run build` (Zod valida; 0–10 fuera de rango o enum mal → falla aquí),
auditoría de honestidad, y commit:
`git commit -m "feat(sillas): enrich 19 chairs with researched specs, sub-scores and editorial content"`

## PENDIENTE — Task 11 (verificación final + pulido)

1. `npm run test` → todos verdes.
2. `npm run build` → OK. Páginas = 57 previas + 1 (`/sillas/comparar/`).
3. Schemas: `grep -rl "FAQPage" dist/ | wc -l` y `grep -rl '"HowTo"' dist/ | wc -l` → 0 y 0;
   `grep -c '"@type":"Review"' dist/sillas/catalogo/sihoo-doro-c300/index.html` → ≥1.
4. Revisión visual local (`npm run dev`): catálogo (19 tarjetas, badges/chips/imagen-fallback,
   casillas → barra comparar), `/sillas/comparar/?s=...` (tabla, barras por eje, ganador, quitar),
   ficha individual (valoración por ejes, veredicto, specs agrupadas con n/d, comunidad, para-quién).
5. Commit final de pulido si hubo ajustes de estilo.

## Cómo retomar (subagent-driven-development)

1. `git pull` en la rama `feat/catalogo-sillas-db`.
2. Skill `superpowers:subagent-driven-development`.
3. Empezar en Task 10 con el reparto de arriba (4 subagentes research+edit en paralelo, sin commit),
   validar Zod con build, commit único, luego Task 11.

## Nota sobre los componentes (deuda menor conocida)
- `CatalogoSillas.astro` importa `reposabrazosNivel` aunque ya no lo usa directamente (lo usa
  `TarjetaSilla`). El plan lo especifica así; build pasa. Limpiable opcionalmente.
- `comparar.astro` anida `<main>` dentro del `<main>` de `Base.astro` (mismo patrón que las fichas
  existentes). Consistente con el repo, semánticamente mejorable.
