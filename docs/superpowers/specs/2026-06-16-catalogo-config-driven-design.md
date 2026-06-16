# Catálogo config-driven multicategoría — Design

**Fecha:** 2026-06-16
**Rama:** feat/catalogo-multicategoria
**Estado:** aprobado, listo para plan
**Relación:** sub-refactor del sistema definido en
`2026-06-08-catalogo-multicategoria-design.md` (aquella arquitectura macro ya está
implementada; esto cierra el único outlier: el panel de filtros hardcodeado).

## Problema

El sistema `TipoConfig` (`src/lib/tipos.ts`) ya es multicategoría-ready: ficha
(`FichaProducto.astro`), comparador (`ComparadorProductos.astro`, `TablaVs.astro`)
y las rutas `/catalogo/[tipo]/[slug]` y `/comparar/[tipo]/*` consumen
`getTipoConfig(tipo)` para `fichaSpecs`, `comparador` y `ejes`.

El outlier es `src/components/producto/CatalogoProductos.astro`: hardcodea su panel
de filtros en HTML y su `<script>` de filtrado lee selectores fijos
(`.f-precio`, `.f-respaldo`, `.f-brazos`, `.f-prof`, `.f-peso`, `.f-orden`) y
datasets fijos de la card (`data-tramo/respaldo/brazos/prof/peso/valoracion`).
No consume `cfg.filtros`. Además **diverge** de la config: `silla.filtros` solo
declara precio/respaldo/prof, mientras el HTML añade reposabrazos, peso y el orden.

Consecuencia: añadir una categoría nueva (escritorios, monitores…) obligaría a
tocar el componente del catálogo. Objetivo: añadir categoría = añadir `TipoConfig`
+ datos, **sin tocar** `CatalogoProductos.astro` ni `TarjetaProducto.astro`.

## Invariante duro

Comportamiento de `/catalogo/silla/` **idéntico** tras el refactor: mismos
productos, mismo filtrado, mismo orden, misma comparación. Las facetas
reposabrazos y peso ya estaban en el HTML; mantenerlas en la config = idéntico.
Sistema editorial intacto (CSS plano, tokens canónicos, cero AI-tells, hairlines
1px, sin alias legacy). Schema/JSON-LD y tag/ASIN de afiliado intactos.

## Decisiones de producto (cerradas)

1. **Predicado:** `control` (render) + `comparacion` (lógica). Separa render de
   predicado, ortogonal, retrocompatible.
2. **Chips:** config-driven ahora vía `TipoConfig.tarjetaChips[]`.
3. **Prueba de extensibilidad:** vitest (no había infra de tests). El test
   ejercita la lógica pura contra un mock `escritorio` que documenta el contrato.
4. **Facetas canónicas de silla:** conservar reposabrazos (mín. nivel) y peso
   (≥130 kg) — son útiles y ya estaban en el HTML (mantenerlas = idéntico).

## Diseño

### 1. Tipos (`src/lib/tipos.ts`)

`filtros` solo lo consume `CatalogoProductos` → extender `FiltroConfig` es seguro.

```ts
export type TransformId = 'reposabrazosNivel';
export type FormatoSalida = 'tramoEuros';
export type Comparacion = 'max' | 'igual' | 'min' | 'check' | 'umbral';

export interface FiltroConfig {
  id: string;
  etiqueta: string;
  control: 'rango' | 'select' | 'check';
  comparacion: Comparacion;
  campo: string;
  opciones?: { valor: string; etiqueta: string }[];
  min?: number; max?: number; step?: number;
  umbral?: number;            // comparacion 'umbral'
  transform?: TransformId;    // deriva valor numérico comparable
  formatoSalida?: FormatoSalida; // output del rango
}

export interface OrdenConfig {
  id: string; etiqueta: string; campo: string; direccion: 'asc' | 'desc';
}

export interface ChipConfig {
  campo: string;
  formato?: string;          // 'kg' | 'anios' | 'enum:<campo>' | 'enumLower:<campo>'
  prefijo?: string;
  mostrarSiNulo?: { etiqueta: string };
}

export interface TipoConfig {
  // ...existentes...
  ordenaciones: OrdenConfig[];
  tarjetaChips: ChipConfig[];
}
```

**Predicado por `comparacion`** (semántica reproducida del script actual):

| comparacion | control | ocultar si                                       | valor seleccionado        |
|-------------|---------|--------------------------------------------------|---------------------------|
| `max`       | rango   | `cardVal > seleccionado`                          | `input.value` (number)    |
| `igual`     | select  | `seleccionado !== '' && cardVal !== seleccionado` | `select.value` (string)   |
| `min`       | select  | `Number(seleccionado) > Number(cardVal)`          | `select.value` (number)   |
| `check`     | check   | `checked && cardVal !== '1'`                       | `input.checked` (bool)    |
| `umbral`    | check   | `checked && (cardVal === '' || Number(cardVal) < umbral)` | `input.checked` (bool) |

### `silla` reconciliada

```ts
filtros: [
  { id:'precio', etiqueta:'Precio máximo', control:'rango', comparacion:'max',
    campo:'tramoPrecio', min:1, max:4, step:1, formatoSalida:'tramoEuros' },
  { id:'respaldo', etiqueta:'Respaldo', control:'select', comparacion:'igual',
    campo:'specs.respaldo',
    opciones:[ {valor:'',etiqueta:'Cualquiera'}, {valor:'malla',etiqueta:'Malla'},
               {valor:'espuma',etiqueta:'Espuma'}, {valor:'mixto',etiqueta:'Mixto'} ] },
  { id:'brazos', etiqueta:'Reposabrazos mín.', control:'select', comparacion:'min',
    campo:'specs.reposabrazos', transform:'reposabrazosNivel',
    opciones:[ {valor:'0',etiqueta:'Cualquiera'}, {valor:'2',etiqueta:'2D o superior'},
               {valor:'3',etiqueta:'3D o superior'}, {valor:'4',etiqueta:'4D'} ] },
  { id:'prof', etiqueta:'Profundidad regulable', control:'check', comparacion:'check',
    campo:'specs.profundidadRegulable' },
  { id:'peso', etiqueta:'Soporta 130 kg o más', control:'check', comparacion:'umbral',
    campo:'specs.pesoMaxKg', umbral:130 },
],
ordenaciones: [
  { id:'valoracion', etiqueta:'Mejor valoradas', campo:'valoracion', direccion:'desc' },
  { id:'precio-asc', etiqueta:'Precio bajo a alto', campo:'tramoPrecio', direccion:'asc' },
  { id:'precio-desc', etiqueta:'Precio alto a bajo', campo:'tramoPrecio', direccion:'desc' },
  { id:'peso-max', etiqueta:'Mayor carga', campo:'specs.pesoMaxKg', direccion:'desc' },
],
tarjetaChips: [
  { campo:'specs.lumbar', prefijo:'Lumbar ', formato:'enumLower:lumbar' },
  { campo:'specs.respaldo', formato:'enum:respaldo' },
  { campo:'specs.pesoMaxKg', formato:'kg' },
  { campo:'specs.garantiaAnios', formato:'anios', mostrarSiNulo:{ etiqueta:'garantía n/d' } },
],
```

Se conservan los textos visibles actuales del HTML (etiquetas de control,
opciones, "Ordenar") y el orden visual de los controles del panel: precio,
respaldo, brazos, prof, peso, orden.

### 2. Lógica pura (`src/lib/productos.ts`)

Funciones exportadas, testeables sin Astro (`productos.ts` solo importa el tipo
de `tipos.ts`):

- `claveData(campo: string): string` — `'specs.pesoMaxKg'` → `'pesomaxkg'`
  (minúsculas, solo alfanumérico). Namespace único `data-c-<clave>` compartido
  por filtros y ordenaciones.
- `valorComparacion(p, filtro): string` — valor comparable de la card:
  `transform` aplicado (reposabrazosNivel), coerción bool (`check` → `'1'`/`'0'`),
  resto `String(getCampo)` o `''` si null.
- `datosFiltrado(p, cfg): Record<string,string>` — itera campos únicos de
  `filtros` ∪ `ordenaciones`, devuelve `{ 'data-c-<clave>': valor }`. Para
  ordenaciones cuyo campo no está en un filtro, valor = `String(getCampo)` (o `''`).
  Reproduce los 6 datasets actuales: tramoprecio, respaldo, reposabrazos,
  profundidadregulable, pesomaxkg, valoracion.
- `construirChips(p, cfg): { texto: string; nd: boolean }[]` — aplica
  `prefijo`/`formato`; `mostrarSiNulo` muestra la etiqueta de fallback con
  `nd:true` cuando el campo es null; los demás chips null se omiten.
- registry `const TRANSFORMS = { reposabrazosNivel }`.

`formatoSalida` ('tramoEuros') se resuelve en el `<script>` cliente (el output del
rango se recalcula al mover el slider), no en TS.

### 3. `CatalogoProductos.astro`

- Panel renderizado en loop sobre `cfg.filtros`; markup por `control`:
  - `rango`: `<label.catalogo-field>` + `<input type=range>` (min/max/step,
    value=max) + `<output.catalogo-out>`
  - `select`: `<label.catalogo-field>` + `<select>` con `opciones`
  - `check`: `<label.catalogo-check>` + `<input type=checkbox>`
  - Cada control con `data-filtro={id}`.
- Select de orden desde `cfg.ordenaciones`, `data-orden`.
- Root: `data-catalogo-config={JSON.stringify(panelConfig)}` donde `panelConfig`
  = `{ filtros: [{id,control,comparacion,clave,umbral,formatoSalida,max}],
       ordenaciones: [{id,clave,direccion}], ordenInicial }`.
  La config viaja por data-attr, **no por un nuevo `<script>`** → el hash del
  script módulo solo cambia con su lógica, no con los datos.
- `<script>` genérico: lee `panelConfig`, localiza controles por `data-filtro`,
  aplica predicado por `comparacion`, ordena con regla "null al fondo según
  dirección" (`asc`→`+Inf`, `desc`→`-Inf`; equivalente al actual ±Inf/0 porque la
  card emite `0` para valoracion y `''`→null para peso). Output del rango por
  `formatoSalida`. Flujo cmp-bar / localStorage / máx-4 **sin cambios**.
- CSS sin cambios (reutiliza `.catalogo-field`, `.catalogo-check`;
  `.f-precio-out` se renombra a `.catalogo-out`).

### 4. `TarjetaProducto.astro`

- `const cfg = getTipoConfig(p.tipo)`
- `const dataAttrs = datosFiltrado(p, cfg)` → spread `{...dataAttrs}` en `<article>`
  (sustituye los 6 `data-*` manuales; `data-slug` se conserva).
- `const chips = construirChips(p, cfg)` → render con clase `chip-nd` cuando
  `chip.nd`.

### 5. Extensibilidad (vitest)

- devDep `vitest`; script `"test": "vitest run"`.
- `src/lib/productos.test.ts` (imports relativos `./productos`, `./tipos`):
  - mock `escritorio: TipoConfig` con filtros `alturaMin`/`alturaMax`/`motor`,
    ordenaciones y chips — documenta el contrato de una categoría nueva.
  - asserts: `claveData`, `valorComparacion` (incl. transform reposabrazosNivel),
    `datosFiltrado` (claves y valores esperados para silla y escritorio mock),
    `construirChips` (incl. garantía null → `nd:true` + etiqueta fallback).
- El mock `escritorio` NO se añade a `TIPOS`/`TIPOS_CON_DATOS` ni se crean datos.

## Verificación

- `npm run build` → 88 páginas verde.
- `npm test` → verde.
- Diff manual del filtrado: mismo set, mismo orden, misma comparación que antes.
- CSP: `public/_headers` se commitea **solo** si cambia el hash del script inline
  (esperado, sancionado). Verificar que el diff de `_headers` sea solo swap de
  hash, sin cambio de política ni dominio.

## Fuera de alcance

- Datos de productos nuevos (no inventar).
- Activar `escritorio` en `TIPOS_CON_DATOS`.
- Refactors no relacionados de ficha/comparador (ya multicategoría-ready).
