# Rediseño de filtros del catálogo — diseño

> Fecha: 2026-06-19. Rama: `feat/megarecopilacion-sillas`. Corresponde a **Task 8** del plan
> `docs/superpowers/plans/2026-06-18-megarecopilacion-sillas-100-plus.md` (búsqueda por texto +
> grupos de filtros), ampliado tras brainstorming con el usuario.

## Problema

El catálogo (`src/components/producto/CatalogoProductos.astro`) renderiza los 8 filtros de silla
como una fila plana `flex-wrap` de controles crudos: sliders `<input type=range>` sin valor visible,
`<select>` y checkboxes mezclados. Resultado: poco intuitivo, feo y poco práctico. Falta:

- Búsqueda por texto.
- Filtro por marca.
- Agrupación / jerarquía visual.
- Chips de filtros activos y "limpiar todo".
- Manejo de facetas cuyo dato casi no existe (hoy solo 1 silla tiene `alturaRecomendadaMin/MaxCm`,
  así que los 2 filtros de altura ensucian la barra sin filtrar nada útil).

## Objetivo

Rediseñar la **capa de presentación** de los filtros al patrón "barra superior con popovers"
(estilo Wirecutter/Airbnb), añadir búsqueda por texto y un filtro de marca multi-select, sin alterar
la semántica de los filtros existentes ni el schema de contenido. Mantener verdes `npm test`,
`npm run validate:productos` y `npm run build`.

## Decisiones tomadas (usuario)

1. **Patrón de layout: B — barra superior con popovers** (no sidebar).
2. **Facetas sin datos suficientes: auto-ocultar** si menos de **3** productos tienen el dato.
   Altura se oculta sola hoy; reaparece cuando se pueblen specs (opción D futura).
3. **Filtro Marca: multi-select** (OR sobre el conjunto elegido), opciones autogeneradas del catálogo.

## Alcance

**Dentro:**
- Reescritura de la capa de presentación de `CatalogoProductos.astro` (markup + CSS + script del módulo).
- Búsqueda por texto (nombre + marca), client-side.
- Nueva faceta **Marca** multi-select con nueva comparación `'en'`.
- Auto-ocultado de facetas con `<3` productos con dato.
- Chips de filtros activos, "limpiar todo", contador en vivo.
- Comportamiento móvil (drawer "Filtrar (n)").
- Accesibilidad de los nuevos controles.

**Fuera (no tocar):**
- Barra de comparación (`.cmp-*`, selección en `localStorage`, ruta `/comparar/`).
- Schema de contenido (`src/content/config.ts`), datos YAML de productos.
- `TarjetaProducto.astro` (salvo, si hiciera falta, exponer marca como dato de filtrado — ver más abajo).
- Semántica de los filtros existentes (precio/respaldo/brazos/prof/peso/reposacabezas/altura).
- Migrar respaldo/reposacabezas a multi-select (posible follow-up reusando `'en'`, no ahora).

## Arquitectura

### Modelo de filtros (recordatorio, `src/lib/tipos.ts`)

Filtros actuales de `silla` y su `comparacion`:

| id | control | comparacion | campo |
|----|---------|-------------|-------|
| precio | rango | max | tramoPrecio |
| respaldo | select | igual | specs.respaldo |
| brazos | select | min | specs.reposabrazos (transform reposabrazosNivel) |
| prof | check | check | specs.profundidadRegulable |
| peso | check | umbral | specs.pesoMaxKg (umbral 130) |
| altura-min | rango | max | specs.alturaRecomendadaMinCm |
| altura-max | rango | min | specs.alturaRecomendadaMaxCm |
| reposacabezas | select | igual | specs.reposacabezas |

### Cambios en el motor (`tipos.ts` + `productos.ts`)

1. **Nueva comparación `'en'`** en el tipo `Comparacion`.
2. **Nuevo filtro `marca`** en `silla.filtros`: `control:'select'`, `comparacion:'en'`, `campo:'marca'`.
   - Las **opciones no son un enum fijo**: se generan en runtime/build a partir de las marcas
     presentes en los productos del catálogo (con conteo). El `FiltroConfig.opciones` queda vacío o
     ausente para este filtro; las opciones reales se calculan en `CatalogoProductos.astro`.
3. **Lógica de filtrado** (la función pura que evalúa visibilidad por producto, en `productos.ts`
   y/o el script del catálogo): añadir rama `'en'` → producto visible si el valor de su campo está en
   el conjunto seleccionado; conjunto vacío = no filtra.
4. **Exposición del dato `marca`**: `datosFiltrado(p, cfg)` debe emitir `data-cMarca` (o equivalente
   según `claveData`) para que el script lo lea como los demás campos. Verificar cómo `datosFiltrado`
   deriva las claves de `campo` y añadir `marca` a los campos emitidos.

### Auto-ocultado de facetas (`CatalogoProductos.astro`, frontmatter)

- Para cada filtro con `comparacion` numérica/select sobre `specs.*`, contar productos con dato
  no-nulo (`!= null` y `!= ''`) en ese campo.
- Si el conteo `< 3`, **no renderizar** esa píldora ni incluirla en `panelConfig.filtros`.
- Umbral constante `MIN_DATOS_FACETA = 3` (documentar en el componente).
- Excepciones que **siempre** se muestran: `precio`, `marca` (datos presentes por definición).

### Presentación (markup + CSS)

Estructura nueva dentro de `.catalogo`:

```
[ búsqueda ]                         <- input texto, ancho acotado
[ barra de píldoras flex-wrap ]      <- toggles + dropdowns + Ordenar
[ fila de chips activos + Limpiar ]  <- solo si hay filtros activos
[ contador "N sillas" ]
[ grid de cards ]                    <- sin cambios estructurales
[ mensaje vacío ]                    <- existente
[ barra de comparación cmp-bar ]     <- existente, intacta
```

Tipos de píldora:
- **Toggle** (booleanos: prof, peso): `<button>` que activa/desactiva; sin popover.
- **Dropdown** (precio, marca, respaldo, brazos, reposacabezas): `<button aria-expanded aria-controls>`
  que abre un popover posicionado debajo.
  - precio → control **segmentado** (€/€€/€€€/€€€€), single-select "hasta X".
  - marca → **lista de checkboxes** (multi) con conteo, ordenada por nº desc.
  - respaldo / reposacabezas → lista de opciones single-select (radios o botones).
  - brazos → lista single-select "mínimo" (2D+/3D+/4D).
- **Ordenar** → dropdown al final con las `ordenaciones`.

Estética coherente con el sistema existente: `var(--border)`, `var(--radius)`, `var(--accent)`,
`var(--ink)`, etc. Sin colores hardcodeados (regla del proyecto). Los mockups usaron negro/azul solo
como ilustración; la implementación usa los tokens del tema.

### Comportamiento (script del módulo)

- **Popover**: uno abierto a la vez. Abre al clic en la píldora; cierra con clic fuera, `Esc`, o al
  abrir otro. **Aplica en vivo** (sin botón "Aplicar"); cada popover tiene "Quitar" (limpia su faceta).
- **Estado activo de píldora**: la píldora muestra estado activo y, donde aplique, el valor o el
  conteo (p. ej. "Marca · 2", "Hasta €€€").
- **Chips activos**: por cada filtro con valor, un chip con ✕ que lo limpia. "Limpiar todo" resetea
  todos los filtros + búsqueda.
- **Búsqueda**: input de texto; normaliza (minúsculas + sin diacríticos) y filtra por substring sobre
  el nombre (`.card-name`) y la marca (`.card-brand`) de cada card. Se combina (AND) con el resto de
  filtros. Sin red, sin debounce complejo (input listener directo basta a esta escala).
- **Integración**: la búsqueda y la faceta marca se evalúan en el mismo paso que `applyFilters`, que
  sigue gestionando visibilidad, contador, orden y mensaje vacío.
- **Listeners en el módulo JS** (no atributos `onclick` inline) para respetar la CSP sin
  `unsafe-inline`. Los hashes de `script-src` se regeneran en `npm run build`.

### Móvil (`<768px`)

- La barra de píldoras se colapsa a un botón **"Filtrar (n)"** (n = nº de filtros activos).
- Al pulsarlo se abre un **panel deslizante** (aside/dialog) con todas las facetas apiladas + Ordenar,
  y un botón "Ver N resultados" que lo cierra. Filtra en vivo igual que en escritorio.
- La **búsqueda** permanece visible siempre (no dentro del drawer).
- La `cmp-bar` existente sigue funcionando; respetar su offset inferior actual en móvil.

## Accesibilidad

- Píldoras dropdown: `<button aria-expanded="false|true" aria-controls="<popover-id>">`.
- Popover: contenedor con `role="group"`/`aria-label`; foco gestionado al abrir/cerrar; `Esc` cierra
  y devuelve foco a la píldora.
- Chips activos: `<button>` con `aria-label` ("Quitar filtro: IKEA").
- Toda la interacción accesible por teclado.
- Contador "N sillas" en una región con `aria-live="polite"` para anunciar cambios.

## Manejo de errores / casos límite

- **0 resultados**: mostrar `.catalogo-vacio` existente.
- **Config JSON inválida**: el script ya hace `try/catch` y aborta; mantener.
- **Sin filtros activos al cargar**: todas las cards visibles (24). Evitar la regresión del fix
  `112b0d7` (los rango 'min' que ocultaban todo): no aplicar ningún filtro por defecto; los popovers
  arrancan en "sin selección".
- **Marca con valor que ya no existe** (datos cambian): conjunto seleccionado se intersecta con las
  marcas presentes; ignorar las ausentes.
- **Una sola marca en catálogo**: la faceta marca igualmente se muestra (decisión: precio y marca
  siempre visibles); con 1 opción es inocua.

## Testing / verificación

**Unit (`src/lib/productos.test.ts`)** — mantener los 33 actuales y añadir:
- Comparación `'en'`: producto visible solo si su marca está en el conjunto; conjunto vacío no filtra.
- Helper de auto-ocultado (conteo de datos por campo < umbral) si se extrae como función pura.
- Normalización de búsqueda (minúsculas + sin acentos, substring) si se extrae como función pura.

**Pipeline:**
- `npm test` → todos verdes.
- `npm run validate:productos` → 24 OK.
- `npm run build` → 93 páginas + regeneración de hashes CSP.

**Manual (Playwright):**
- Carga inicial: 24 cards visibles (no 0).
- Búsqueda "ikea" → solo cards IKEA.
- Popover precio: abre, segmentado aplica en vivo, "Quitar" limpia; clic fuera y `Esc` cierran.
- Marca multi: marcar 2 → chips IKEA/Steelcase, contador correcto.
- Toggle peso/prof: activa/desactiva.
- "Limpiar todo" resetea filtros + búsqueda → 24 cards.
- Auto-ocultado: las píldoras de altura NO aparecen (solo 1 silla con dato).
- Móvil (<768px): botón "Filtrar (n)" abre drawer; "Ver N resultados" cierra; búsqueda visible.
- `cmp-bar` sigue funcionando (seleccionar 2-4 y comparar).

## Riesgos

- **CSP**: cualquier inline handler rompe `script-src`. Mitigación: listeners en el módulo; build
  regenera hashes.
- **Regresión del filtrado**: el bug `112b0d7` nació de inicializar mal un control. Mitigación: el
  test de "carga = 24 cards" y verificación Playwright explícita.
- **Tamaño de `CatalogoProductos.astro`**: ya es grande (markup + CSS + script en un archivo). Si
  durante la implementación crece en exceso, considerar extraer el script del catálogo a un módulo
  `.ts` importado, manteniendo el patrón del proyecto. No es objetivo en sí; solo si mejora claridad.

## Commit

Un único commit pequeño y enfocado en la rama `feat/megarecopilacion-sillas`, tipo
`feat(catalogo): barra de filtros con búsqueda, marca y popovers`. No mezclar cambios no relacionados.
