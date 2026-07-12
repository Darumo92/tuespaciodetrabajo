# Selector de Productos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un selector bilingüe y compartible que recomiende el top 3 de cualquier tipo elegible de la colección `productos` mediante preguntas y reglas declarativas, sin lógica de categoría en el motor.

**Architecture:** Astro genera el HTML, el catálogo elegible y las configuraciones auto-descubiertas durante el build. Un módulo TypeScript cliente controla el wizard, valida query params y ejecuta un motor puro que devuelve puntuación, trazas, razones y advertencias; no se añade React, Vue, Svelte ni otra librería UI. Cada tipo de producto aporta un único `config-<tipo>.ts`; scoring, render, URL y resultados no conocen nombres de categorías.

**Tech Stack:** Astro 5 static output, TypeScript, Vitest 4, CSS plano con los custom properties existentes, Cloudflare Pages, JSON-LD.

---

## Decisiones Aprobadas

- Se mantiene `output: 'static'`. El `ItemList` de una URL con respuestas se inyecta en el DOM después de validar los params; no estará en el HTML de `View Source`.
- No se usa `client:load`: los componentes `.astro` no se hidratan y el proyecto no tiene framework cliente. Se usa Astro + módulo TypeScript.
- El registro de configs se auto-descubre con `import.meta.glob('./config-*.ts', { eager: true })`.
- Un tipo aparece si tiene config válida y al menos 5 productos.
- Una categoría nueva ya admitida por el schema y catálogo se incorpora al selector creando solo `src/lib/selector/config-<tipo>.ts`.
- El scoring es mixto: 85% encaje declarado + 15% `notaGlobal()`, con penalizaciones y topes para incompatibilidades.
- Los campos ausentes usan un `missingScore` explícito y generan advertencia; no se eliminan del denominador.
- “No lo sé”, “Me da igual” y equivalentes son respuestas válidas con cero criterios activos.
- Silla: normalmente 9 pasos contando tipo. Escritorio: normalmente 8. La cifra real depende de cobertura y variación de datos.
- En escritorio, “espacio disponible” evalúa dimensiones del tablero cuando está incluido. Un marco sin tablero no incumple dimensiones salvo que el usuario también exija tablero incluido.
- En móvil, el top 3 usa pestañas accesibles 1/2/3 para mantener una card visible dentro del viewport; en escritorio se muestran las tres.
- Se auditan ofertas de los 114 productos en ES y US antes de publicar schema de ofertas.
- Jerarquía de fuentes de precio: Amazon del mercado, fabricante, distribuidor oficial, retailer reconocido. Solo producto nuevo y variante exacta.
- Si no existe una oferta real se registra `unavailable`; nunca se fabrica `Offer.price` a partir de `tramoPrecio`.
- Las ofertas ES usan EUR y las US USD. No hay conversión de divisa.
- El último estado indicado por el usuario es que OneLink ya está implementado. Los CTAs siguen usando los builders existentes; la URL de evidencia/schema puede ser la URL directa de la fuente del precio.
- No se modifica el schema de la colección `productos`.
- No se hacen commits durante la ejecución salvo petición explícita del usuario.

## Inventario Actual

| Dato | Estado observado |
|---|---:|
| Productos totales | 114 |
| Sillas | 77 |
| Escritorios | 37 |
| Productos con `precioMin` numérico | 37 |
| Productos sin `precioMin` numérico | 77 |
| Productos con ASIN en su ficha | 29 |
| Productos con búsqueda Amazon | 81 |
| Productos con `webOficial` | 83 |
| Sillas con rango recomendado de altura mínimo | 17 |
| Sillas con rango recomendado de altura máximo | 23 |
| Sillas con altura de asiento mínima/máxima | 70 |

## Preguntas Y Campos

### Preguntas comunes

| ID estable | Tipo de control | Campo o binding | Regla |
|---|---|---|---|
| `tipo` | opciones | `producto.tipo` | Solo configs con al menos 5 productos |
| `presupuesto` | opciones | `tramoPrecio` | Preferencia y restricción máxima; neutral disponible |
| `prioridad` | opciones | bindings de ejes del config | Precio, ergonomía o durabilidad se traducen a criterios por tipo |
| `horas` | opciones | bindings del config | `<4`, `4-8`, `8+`; cada tipo decide qué ejes/specs pesan |

### Preguntas de silla

| ID estable | Respuesta | Evaluación declarativa |
|---|---|---|
| `altura` | centímetros o no sé | Primero `alturaRecomendadaMinCm/MaxCm`; fallback suave al rango de asiento usando `altura * 0.253`, coeficiente ya usado por la calculadora ergonómica |
| `peso` | kilogramos o no sé | `specs.pesoMaxKg >= respuesta + margenKg` |
| `respaldo` | malla, espuma, mixto, indiferente | `equals` sobre `specs.respaldo` |
| `molestias` | lumbar, cervical, cadera, ninguna | Bundle de criterios por opción: lumbar ordenado, ejes y ajustes verificables |
| `compartida` | sí, no, indiferente | Profundidad regulable, altura de asiento y ajustabilidad |

### Preguntas de escritorio

| ID estable | Respuesta | Evaluación declarativa |
|---|---|---|
| `espacio` | ancho y fondo en cm o no sé | `atMost` para `tableroAnchoCm/FondoCm`, condicionado por tablero incluido/exigido |
| `motor` | manual, simple, doble, indiferente | `ranked`/`equals` sobre `specs.motor` |
| `tablero` | incluido, solo estructura, indiferente | `boolean` sobre `specs.tableroIncluido` |
| `accesorios` | memorias, anticolisión, USB, ninguno | Bundle multiselección sobre los campos correspondientes |

### Campos computables

No se preguntan `notaGlobal`, valoraciones editoriales, garantía, certificaciones, calidad/cobertura de datos, precio verificado, marca, imagen, URLs, `idealPara`, `paraQuienSi`, `paraQuienNo`, `puntosFuertes`, `puntosDebiles` ni `limitaciones`.

## Contrato Declarativo

`src/lib/selector/config.ts` define este contrato público. La implementación debe conservar estos nombres y no puede introducir una función de scoring específica por categoría.

```ts
type LocalizedText = Record<'es-ES' | 'en', string>;
type AnswerValue = string | number | boolean | string[] | null;

type AnswerExpression = {
  source: 'answer' | 'literal';
  value?: string | number | boolean;
  multiply?: number;
  add?: number;
};

type CriterionOperator =
  | 'equals'
  | 'atLeast'
  | 'atMost'
  | 'containsRange'
  | 'ranked'
  | 'boolean'
  | 'axis';

interface SelectorCriterion {
  id: string;
  field?: string;
  rangeFields?: { min: string; max: string };
  fallback?: SelectorCriterion;
  operator: CriterionOperator;
  target: AnswerExpression | AnswerValue;
  weight: number;
  missingScore: number;
  rank?: Record<string, number>;
  when?: { answerId: string; in: AnswerValue[] };
  penalty?: { factor: number; cap: number };
  reason: LocalizedText;
  warning: LocalizedText;
  editorialKeywords?: Record<'es-ES' | 'en', string[]>;
}

interface SelectorOption {
  value: AnswerValue;
  label: LocalizedText;
  description?: LocalizedText;
  effects: SelectorCriterion[];
}

interface SelectorQuestion {
  id: string;
  kind: 'single' | 'multi' | 'number' | 'dimensions';
  title: LocalizedText;
  help?: LocalizedText;
  options?: SelectorOption[];
  validation?: { min?: number; max?: number; step?: number };
  neutralValue?: AnswerValue;
  visibility?: {
    always?: boolean;
    fields: string[];
    mode: 'any' | 'all';
    minProducts: number;
    minRatio: number;
    minDistinct?: number;
  };
  effects?: SelectorCriterion[];
}

interface SelectorTypeConfig {
  tipo: string;
  labels: { singular: LocalizedText; plural: LocalizedText; icon: string };
  routes: {
    catalogType: Record<'es-ES' | 'en', string>;
    editorialCategories: Record<'es-ES' | 'en', string[]>;
  };
  questions: SelectorQuestion[];
}
```

## Fórmula De Scoring

Para cada producto:

```ts
const fit = activeWeight > 0 ? weightedMatches / activeWeight : null;
const quality = (notaGlobal(producto) ?? 5) / 10;
const base = fit == null ? quality : fit * 0.85 + quality * 0.15;
const penalized = penalties.reduce((score, penalty) => Math.min(score * penalty.factor, penalty.cap / 100), base);
const score = Math.round(Math.max(0, Math.min(1, penalized)) * 100);
```

- Cada operador devuelve `0..1` y una `CriterionTrace`.
- `containsRange` da 1 dentro del intervalo, decae cerca del borde y 0 fuera del margen declarado.
- `ranked` compara niveles declarados en el config; el motor no conoce `lumbar` ni `motor`.
- Una respuesta neutral no crea criterios.
- Un campo nulo devuelve `missingScore` y estado `missing`.
- Restricciones físicas/espaciales pueden declarar topes más severos que preferencias.
- Orden final: score descendente, `calidadDatos.score`, `notaGlobal()`, `slug` ascendente.
- No hay random.

## Generación De Razones

`scoring.ts` devuelve por criterio:

```ts
interface CriterionTrace {
  criterionId: string;
  questionId: string;
  field: string | null;
  actual: unknown;
  target: unknown;
  match: number;
  weight: number;
  state: 'match' | 'partial' | 'miss' | 'missing';
  reason: LocalizedText;
  warning: LocalizedText;
  editorialKeywords: Record<'es-ES' | 'en', string[]>;
}
```

`razones.ts` selecciona:

1. Hasta 3 trazas positivas, ordenadas por `weight * match`, sin repetir el mismo criterio.
2. Si faltan razones, líneas de `paraQuienSi`/`puntosFuertes` con mayor solapamiento de keywords normalizadas.
3. `idealPara` como último fallback.
4. Una advertencia: primero restricción incumplida, después dato crítico ausente, después línea relevante de `paraQuienNo`/`puntosDebiles`/`limitaciones`.
5. En `en`, usar `producto.en.*`; nunca filtrar una línea española en el resultado inglés.

## Arquitectura De Archivos

### Crear

- `docs/plans/selector-productos.md` — este plan.
- `src/data/product-offers.json` — registro volátil ES/US por slug.
- `src/lib/product-offers.ts` — resolución de oferta por mercado y freshness.
- `src/lib/product-offers.test.ts` — invariantes del registro y helper.
- `scripts/validate-product-offers.mjs` — cobertura 114 x 2 y consistencia.
- `src/lib/selector/config.ts` — tipos, factorías, auto-descubrimiento y filtrado por cobertura.
- `src/lib/selector/config-sillas.ts` — configuración declarativa de silla.
- `src/lib/selector/config-escritorios.ts` — configuración declarativa de escritorio.
- `src/lib/selector/scoring.ts` — motor puro y trazas.
- `src/lib/selector/razones.ts` — razones/advertencias deterministas.
- `src/lib/selector/scoring.test.ts` — tests de config, scoring, razones y extensibilidad.
- `src/components/selector/SelectorProductos.astro` — aplicación, estado, URL y payload.
- `src/components/selector/PasoPregunta.astro` — pregunta accesible.
- `src/components/selector/ResultadoTop3.astro` — cálculo, cards, pestañas y acciones.
- `src/components/selector/CardProducto.astro` — `<template>` inerte de card.
- `src/pages/herramientas/selector.astro` — página ES.
- `src/pages/[locale]/tools/selector.astro` — página EN mediante `getStaticPaths()`.

### Modificar

- `src/i18n/ui.ts` — microcopy transversal y enlace de navegación ES/EN.
- `src/pages/index.astro` — CTA selector debajo del hero.
- `src/pages/[locale]/index.astro` — CTA EN equivalente.
- `src/pages/[categoria]/index.astro` — banner derivado de config.
- `src/pages/[locale]/[categoria]/index.astro` — banner derivado de config en EN.
- `src/components/producto/CatalogoProductos.astro` — botón selector con `?tipo=` junto a filtros.
- `src/pages/herramientas/index.astro` — card selector.
- `src/pages/[locale]/tools/index.astro` — card selector y eliminación de `noindex`.
- `src/components/Header.astro` — enlace principal Selector/Finder.
- `astro.config.mjs` — sitemap EN tools y hreflang del selector.
- `src/styles/global.css` — estilos compartidos del selector usando tokens existentes.
- `public/_headers` — solo el cambio automático de hashes generado por `npm run build`, sin editar manualmente.
- `docs/agent-context/project_amazon_onelink_state.md` — registrar la confirmación más reciente del usuario sobre OneLink US.

### Reutilizar Sin Modificar

- `src/lib/productos.ts` — importar `notaGlobal`, `getCampo`, rutas, nombres y CTAs; no duplicar su lógica.

## Task 1: Crear Y Completar El Registro De Ofertas ES/US

**Files:**
- Create: `src/data/product-offers.json`
- Create: `src/lib/product-offers.ts`
- Create: `src/lib/product-offers.test.ts`
- Create: `scripts/validate-product-offers.mjs`
- Read/Reuse: `src/data/amazon-products.json`
- Read/Reuse: `src/lib/amazon-products.ts`
- Read/Reuse: `src/i18n/amazon.ts`
- Modify: `docs/agent-context/project_amazon_onelink_state.md`

- [ ] **Step 1: Escribir tests fallidos del helper de ofertas**

Casos exactos:

```ts
it('devuelve EUR para es-ES y USD para en');
it('rechaza una oferta con moneda de otro mercado');
it('omite precio cuando status es unavailable');
it('omite ofertas con más de 30 días');
it('prioriza el registro por slug y mercado sobre el cache genérico');
it('mantiene URL de evidencia separada del CTA afiliado');
```

- [ ] **Step 2: Ejecutar los tests y verificar el fallo esperado**

Run: `npx vitest run src/lib/product-offers.test.ts`

Expected: FAIL porque `product-offers.ts` y el registro todavía no existen.

- [ ] **Step 3: Implementar el contrato del registro**

```ts
interface MarketOffer {
  status: 'available' | 'unavailable';
  priceAmount: number | null;
  currency: 'EUR' | 'USD';
  url: string | null;
  evidenceUrl: string | null;
  seller: string | null;
  sourceType: 'amazon' | 'official' | 'distributor' | 'retailer' | null;
  condition: 'new' | null;
  checkedAt: string;
  attempts: Array<'amazon' | 'official' | 'distributor' | 'retailer'>;
}

interface ProductOffersFile {
  updatedAt: string;
  products: Record<string, { ES: MarketOffer; US: MarketOffer }>;
}
```

`getProductOffer(slug, locale)` devuelve oferta solo si estado, moneda, importe, URL, condición y freshness son válidos.

- [ ] **Step 4: Crear el validador de cobertura**

El script debe:

- Leer los 114 slugs desde los nombres de `src/content/productos/*.{yaml,yml,json}`.
- Exigir exactamente una entrada `ES` y una `US` por slug.
- Exigir precio positivo, URL HTTP(S), seller, sourceType, `condition: new` y fecha ISO para `available`.
- Exigir `priceAmount: null`, `url: null`, `condition: null` y los cuatro intentos registrados para `unavailable`.
- Rechazar slugs desconocidos y monedas incorrectas.
- Imprimir conteos por mercado y estado.

- [ ] **Step 5: Auditar los 114 productos en España**

Para cada slug, seguir este orden y registrar la primera oferta nueva de variante exacta:

1. ASIN/listing Amazon.es verificado.
2. Tienda oficial del fabricante para España o Europa con envío a España.
3. Distribuidor oficial.
4. Retailer reconocido.
5. `unavailable` tras documentar los cuatro intentos.

No usar snippet de buscador como evidencia de precio. Abrir la página fuente y comprobar modelo, variante, condición, moneda y disponibilidad.

- [ ] **Step 6: Auditar los 114 productos en Estados Unidos**

Repetir el flujo con Amazon.com, fabricante US, distribuidor US y retailer US. Guardar USD; no convertir EUR. OneLink se usa para CTAs, no como prueba del importe US.

- [ ] **Step 7: Validar cobertura y tests**

Run: `node scripts/validate-product-offers.mjs`

Expected: `114 products | ES 114 audited | US 114 audited | 0 errors`.

Run: `npx vitest run src/lib/product-offers.test.ts`

Expected: PASS.

## Task 2: Definir La DSL Y El Auto-Descubrimiento

**Files:**
- Create: `src/lib/selector/config.ts`
- Test: `src/lib/selector/scoring.test.ts`

- [ ] **Step 1: Escribir tests fallidos de configuración**

```ts
it('rechaza ids de pregunta duplicados');
it('rechaza pesos negativos y missingScore fuera de 0..1');
it('oculta un tipo con menos de 5 productos');
it('oculta una pregunta sin cobertura o sin valores discriminantes');
it('mantiene una pregunta always-visible declarada por el config');
it('auto-descubre un config-*.ts sin registrar su tipo en el motor');
```

- [ ] **Step 2: Ejecutar el test rojo**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: FAIL por imports inexistentes.

- [ ] **Step 3: Implementar tipos, `defineSelectorConfig()` y validación**

La validación falla con mensajes que incluyan archivo, tipo, pregunta y criterio. No usar Zod nuevo; validación TypeScript/runtime pequeña y explícita.

- [ ] **Step 4: Implementar auto-descubrimiento**

Usar un patrón que no capture `config.ts`:

```ts
const modules = import.meta.glob('./config-*.ts', { eager: true });
```

Cada módulo exporta `selectorConfig`. Detectar dos configs con el mismo `tipo` como error de build.

- [ ] **Step 5: Implementar visibilidad por datos**

Reutilizar `getCampo()` para cobertura. Una pregunta es visible si cumple `minProducts`, `minRatio` y `minDistinct`; las preguntas comunes declaradas como obligatorias no dependen de campos opcionales.

- [ ] **Step 6: Ejecutar tests**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: tests de configuración PASS; tests futuros siguen pendientes de implementación dentro del mismo archivo.

## Task 3: Implementar El Motor Genérico Con TDD

**Files:**
- Create: `src/lib/selector/scoring.ts`
- Modify: `src/lib/selector/scoring.test.ts`

- [ ] **Step 1: Añadir tests fallidos de operadores**

Cubrir exactamente:

```ts
it.each([
  ['equals', 'malla', 'malla', 1],
  ['atLeast', 130, 120, 1],
  ['atMost', 120, 130, 1],
  ['boolean', true, true, 1],
])('evalúa %s con actual=%s target=%s', (operator, actual, target, expected) => {
  expect(evaluateCriterion(operator, actual, target)).toBe(expected);
});
it('containsRange devuelve 1 dentro, parcial en margen y 0 fuera');
it('ranked usa exclusivamente el mapa rank del criterio');
it('axis normaliza un eje editorial de 0..10 a 0..1');
it('evalúa AnswerExpression con multiply y add');
it('usa el fallback declarado cuando el campo principal falta');
it('aplica missingScore sin retirar peso del denominador');
it('ignora criterios de respuestas neutrales');
it('respeta when contra otras respuestas');
```

- [ ] **Step 2: Ejecutar rojo**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: FAIL en los tests nuevos.

- [ ] **Step 3: Implementar operadores y trazas**

Todas las lecturas de producto pasan por `getCampo()`. Los operadores no pueden inspeccionar `producto.tipo` ni rutas concretas.

- [ ] **Step 4: Añadir tests fallidos de fórmula y ranking**

```ts
it('combina 85% fit y 15% notaGlobal');
it('usa notaGlobal como ranking si todas las respuestas son neutrales');
it('aplica factor y cap a una incompatibilidad');
it('mantiene productos incompletos con advertencia');
it('devuelve máximo tres resultados sin duplicados');
it('desempata por calidadDatos, notaGlobal y slug');
it('produce el mismo resultado en ejecuciones repetidas');
it('funciona con un mock monitor sin cambiar scoring.ts');
```

- [ ] **Step 5: Implementar `scoreProducts()`**

Firma pública:

```ts
scoreProducts(
  products: Producto[],
  answers: Record<string, AnswerValue>,
  config: SelectorTypeConfig,
): ScoredProduct[]
```

`ScoredProduct` contiene `producto`, `score`, `traces`, `missingFields` y `violations`.

- [ ] **Step 6: Ejecutar tests**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: todos los tests de config y scoring PASS.

## Task 4: Implementar Razones Y Advertencias Con TDD

**Files:**
- Create: `src/lib/selector/razones.ts`
- Modify: `src/lib/selector/scoring.test.ts`

- [ ] **Step 1: Escribir tests fallidos de explicación**

```ts
it('prioriza la razón con mayor impacto ponderado');
it('no repite el mismo criterio');
it('completa razones desde paraQuienSi y puntosFuertes por keywords');
it('prioriza incompatibilidad sobre punto débil editorial');
it('usa idealPara como fallback final');
it('genera copy inglés desde config y producto.en');
it('nunca devuelve texto español en locale en');
it('no inventa contenido cuando faltan arrays editoriales');
```

- [ ] **Step 2: Ejecutar rojo**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: FAIL en razones.

- [ ] **Step 3: Implementar normalización y selección determinista**

Reutilizar el patrón de `normalizaTexto()` o esa función directamente. Interpolar solo placeholders permitidos (`actual`, `target`, `productName`, `brand`). Escapar/renderizar mediante `textContent` en cliente.

- [ ] **Step 4: Ejecutar verde**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: todos los tests PASS.

## Task 5: Declarar Sillas Y Escritorios

**Files:**
- Create: `src/lib/selector/config-sillas.ts`
- Create: `src/lib/selector/config-escritorios.ts`
- Modify: `src/lib/selector/scoring.test.ts`

- [ ] **Step 1: Añadir snapshots estructurales de preguntas visibles**

Con el inventario actual:

```ts
expect(chairQuestionIds).toEqual([
  'presupuesto', 'prioridad', 'horas', 'altura', 'peso', 'respaldo', 'molestias', 'compartida'
]);
expect(deskQuestionIds).toEqual([
  'presupuesto', 'prioridad', 'horas', 'espacio', 'motor', 'tablero', 'accesorios'
]);
```

El paso `tipo` pertenece al shell global, por eso no aparece en estos arrays.

- [ ] **Step 2: Declarar el config de sillas**

Incluir copy ES/EN completo, límites numéricos razonables del control, respuestas neutrales, bindings de prioridad/horas, margen de peso y templates de razones/advertencias.

- [ ] **Step 3: Declarar el config de escritorios**

Incluir la dependencia entre `espacio` y `tablero`, niveles de motor, selección múltiple de accesorios y bindings a ejes de escritorio.

- [ ] **Step 4: Probar respuestas extremas**

Fixture: `altura=200`, `peso=130`, `presupuesto=1`, `horas=8+`. Verificar que devuelve tres resultados, que ningún producto incompatible obtiene score alto y que los faltantes se explican.

- [ ] **Step 5: Ejecutar tests**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: PASS.

## Task 6: Construir Los Componentes Astro Y El Estado Cliente

**Files:**
- Create: `src/components/selector/PasoPregunta.astro`
- Create: `src/components/selector/CardProducto.astro`
- Create: `src/components/selector/ResultadoTop3.astro`
- Create: `src/components/selector/SelectorProductos.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Renderizar preguntas accesibles en build**

`PasoPregunta.astro` recibe una pregunta localizada y genera `fieldset`/`legend`, labels reales, descripciones asociadas y controles numéricos con mensajes de error localizados.

- [ ] **Step 2: Crear el template inerte de card**

`CardProducto.astro` emite un único `<template>`. El cliente clona tres instancias y rellena nombre, marca, imagen, tramo/precio, score, razones, advertencia y enlaces con propiedades DOM; no usa HTML editorial sin escapar.

- [ ] **Step 3: Crear estados de resultado**

`ResultadoTop3.astro` incluye:

- Estado calculando con tres puntos animados durante 1,5 s.
- `role=status`/`aria-live=polite`.
- Grid de tres cards en escritorio.
- Tablist 1/2/3 en móvil con flechas de teclado.
- Acciones comparar, catálogo, reiniciar y copiar enlace.
- Feedback de clipboard y fallback cuando `navigator.clipboard` falla.

- [ ] **Step 4: Crear el controlador del wizard**

`SelectorProductos.astro` recibe productos, configs, locale y ofertas resueltas. Mantiene:

```ts
interface SelectorState {
  tipo: string | null;
  step: number;
  answers: Record<string, AnswerValue>;
  mode: 'questions' | 'calculating' | 'results' | 'error';
}
```

El controlador implementa atrás, adelante, validación, reset, progreso, params, cálculo, tabs y acciones.

- [ ] **Step 5: Implementar serialización de URL**

- Usar IDs estables sin traducción.
- Orden de params: `tipo`, luego orden de preguntas.
- Serializar respuestas neutrales con un token estable declarado por la pregunta (`any` o `unknown`) para que una URL compartida siga considerándose completa.
- Arrays como valores separados por coma y escapados por `URLSearchParams`.
- Una URL completa válida abre resultados.
- Una URL parcial abre la primera pregunta pendiente.
- Params desconocidos se ignoran.
- Valor inválido se elimina y muestra error junto a la pregunta.

- [ ] **Step 6: Añadir estilos sin duplicar el sistema global**

Usar exclusivamente `--bg`, `--surface`, `--surface-muted`, `--ink`, `--ink-muted`, `--accent`, `--border`, radios, sombras y fuentes existentes. Añadir `prefers-reduced-motion`; no introducir gradientes decorativos nuevos ni otro sistema de cards.

- [ ] **Step 7: Verificar build del componente**

Run: `npx astro build`

Expected: 0 errors y 0 warnings.

## Task 7: Crear Páginas ES/EN Y Schema

**Files:**
- Create: `src/pages/herramientas/selector.astro`
- Create: `src/pages/[locale]/tools/selector.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Cargar catálogo y configs en ambas páginas**

Agrupar productos por `tipo`, cruzar con configs y filtrar grupos `<5`. Serializar al cliente solo campos usados por scoring, razones, cards y enlaces.

- [ ] **Step 2: Implementar metadatos ES**

- Title: `Encuentra tu equipo ideal en 2 minutos | Tu Espacio de Trabajo`.
- Description dinámica, 146 caracteres con 114 actuales: `Responde unas preguntas y descubre las 3 mejores sillas o escritorios para tu cuerpo, espacio y presupuesto, usando specs reales de 114 productos.`
- Canonical: `https://tuespaciodetrabajo.com/herramientas/selector/`.

- [ ] **Step 3: Implementar metadatos EN**

- Title: `Find Your Perfect Home Office Gear in 2 Minutes | Tu Espacio de Trabajo`.
- Description: `Answer a few questions and we'll recommend the 3 best chairs or desks for your body, space, and budget. Based on real specs from 114 products.`
- Canonical: `https://tuespaciodetrabajo.com/en/tools/selector/`.

El número se deriva de la colección durante build para no quedar obsoleto al añadir productos.

- [ ] **Step 4: Añadir alternates y schemas estáticos**

Usar `buildAlternates()` con ES y EN. Renderizar `WebApplication` y `BreadcrumbList`; el último breadcrumb siempre incluye `item`.

- [ ] **Step 5: Añadir `ItemList` dinámico**

Tras calcular una URL completa, crear/reemplazar un único `<script type="application/ld+json" id="selector-results-schema">`.

Cada `ListItem.item` es `Product` con:

- Nombre localizado mediante `localizedProductName()`.
- Brand e imagen absoluta si existe.
- Review editorial con `notaGlobal()` sobre 10, autor David Rubio Mota y veredicto localizado.
- Offer solo si `getProductOffer()` devuelve dato válido para el locale.
- Nunca usar el score de encaje 0–100 como `reviewRating`.

- [ ] **Step 6: Corregir sitemap**

- Eliminar la exclusión global `!page.includes('/en/tools/')`.
- Añadir el grupo ES/EN del selector a `buildHreflangMap()`.
- Confirmar que herramientas, calculadora y selector EN son indexables.

- [ ] **Step 7: Ejecutar build SEO inicial**

Run: `npx astro build`

Expected: compila ambas rutas sin errors ni warnings.

## Task 8: Añadir Enlazado Interno ES/EN

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/[locale]/index.astro`
- Modify: `src/pages/[categoria]/index.astro`
- Modify: `src/pages/[locale]/[categoria]/index.astro`
- Modify: `src/components/producto/CatalogoProductos.astro`
- Modify: `src/pages/herramientas/index.astro`
- Modify: `src/pages/[locale]/tools/index.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/i18n/ui.ts`

- [ ] **Step 1: Insertar CTA home en el punto exacto**

Insertar después de `</section>` del hero y antes de `<section class="section home-bento-section">`. Usar fondo `--surface-muted`, texto centrado y botón grande. Copy ES/EN aprobado y enlaces localizados.

- [ ] **Step 2: Añadir banner a categorías elegibles**

Resolver la config por `routes.editorialCategories[locale]`. Mostrar banner después de la intro y antes de cards. No escribir condiciones por silla/escritorio.

- [ ] **Step 3: Añadir CTA al catálogo**

Colocar “Que el selector te ayude” / “Let the finder help” junto a la barra de filtros. Enlazar al selector localizado con `?tipo=<tipo>`.

- [ ] **Step 4: Añadir selector al hub de herramientas**

Crear segunda card ES/EN. Retirar `noindex` del hub EN porque ya contiene dos herramientas completas y equivalentes.

- [ ] **Step 5: Añadir enlace al header**

Añadir `Selector` en ES y `Finder` en EN junto a Herramientas/Tools. Verificar que el header sigue cabiendo a 1140 px y que el menú móvil conserva focus trap.

- [ ] **Step 6: Ejecutar build**

Run: `npx astro build`

Expected: 0 errors y 0 warnings.

## Task 9: Pruebas Automatizadas Y Extensibilidad

**Files:**
- Modify: `src/lib/selector/scoring.test.ts`
- Modify: `src/lib/product-offers.test.ts`

- [ ] **Step 1: Ejecutar tests objetivo**

Run: `npx vitest run src/lib/selector/scoring.test.ts`

Expected: todos PASS.

- [ ] **Step 2: Ejecutar suite completa**

Run: `npm test`

Expected: todos PASS, sin regresiones en `productos`, rutas ni tarjetas.

- [ ] **Step 3: Probar alta de producto sin cambios de código**

Crear temporalmente `src/content/productos/selector-fixture-silla.yaml` copiando la forma mínima válida de una silla, con nombre/slug únicos y specs claramente ficticias solo para QA local. Ejecutar build y comprobar que el contador de silla aumenta en uno y el producto entra al array del selector. Borrar el fixture antes del diff final.

- [ ] **Step 4: Probar alta de tipo con un solo config**

En test, crear un módulo virtual/mock `config-monitor.ts` y 5 productos monitor en memoria. Verificar que aparece como tipo, genera preguntas y devuelve top 3 sin modificar `config.ts`, `scoring.ts`, `razones.ts` ni componentes.

- [ ] **Step 5: Confirmar worktree limpio respecto al fixture**

Run: `git status --short`

Expected: no aparece `selector-fixture-silla.yaml`; se preservan intactos los cambios ajenos ya existentes.

## Task 10: QA Manual, SEO Y Rendimiento

**Files:**
- Generated: `dist/**`
- Generated automatically: `public/_headers`

- [ ] **Step 1: Ejecutar build completo del proyecto**

Run: `npm run build`

Expected: optimización de imágenes, Astro build, sitemap, lastmod y hashes CSP terminan con exit code 0; sin warnings.

- [ ] **Step 2: Ejecutar el comando exacto solicitado**

Run: `npx astro build`

Expected: exit code 0, sin errors ni warnings.

- [ ] **Step 3: Arrancar desarrollo y recorrer la matriz funcional**

Run: `npm run dev`

Comprobar:

- Sillas ES completo.
- Sillas EN completo, sin copy español.
- Escritorios ES y EN.
- Atrás desde cada paso conservando respuestas.
- Reset total.
- Copiar enlace.
- URL completa abre cálculo y resultado.
- URL parcial reanuda.
- URL inválida se recupera.
- Usuario extremo: 200 cm, 130 kg, presupuesto tramo 1.
- Tres fichas enlazan al locale correcto.
- Comparar abre `?s=` con los tres slugs.
- Catálogo abre el tipo correcto.
- Precio/moneda corresponde al mercado o muestra solo tramo.
- Teclado completo, focus visible, lector de pantalla y `prefers-reduced-motion`.

- [ ] **Step 4: Revisar HTML generado**

Verificar en `dist/herramientas/selector/index.html` y `dist/en/tools/selector/index.html`:

- Title y description.
- Canonical propio.
- Hreflang recíproco y x-default ES.
- Robots indexable.
- WebApplication.
- BreadcrumbList con último `item`.
- Ausencia de `unsafe-inline` en CSP.

- [ ] **Step 5: Revisar sitemap**

Confirmar que el sitemap contiene las dos URLs del selector y sus `xhtml:link` recíprocos.

- [ ] **Step 6: Validar schema**

Probar la página base en Schema.org Validator y Rich Results Test. Para una URL compartida, validar el DOM renderizado o pegar el JSON-LD dinámico, porque la limitación estática acordada impide verlo en `View Source`.

- [ ] **Step 7: Ejecutar Lighthouse**

Auditar ES y EN en móvil y escritorio. Objetivo mínimo en cada ruta:

```text
Performance >= 90
Accessibility >= 90
SEO >= 90
```

Si falla Performance, inspeccionar tamaño del payload y evitar serializar campos no usados. Si falla Accessibility, corregir primero nombres accesibles, foco, contraste y tabs. Si falla SEO, revisar canonical, indexación, hreflang y schema.

- [ ] **Step 8: Revisar diff final**

Run: `git diff --check`

Expected: sin whitespace errors.

Run: `git status --short`

Expected: solo archivos previstos del selector, ofertas, enlaces, sitemap, i18n, estilos y hash CSP; cambios ajenos previos permanecen intactos.

## Criterios De Aceptación

- El motor no contiene `silla`, `escritorio`, `lumbar`, `motor` ni otro conocimiento de categoría.
- Añadir una config y 5 productos de un tipo ya soportado por el catálogo lo activa sin tocar el motor/UI.
- Los tipos con 0–4 productos no aparecen.
- Las preguntas sin cobertura/variación se ocultan según config.
- No hay puntuaciones infladas por datos ausentes.
- El top 3 es estable, explicable y bilingüe.
- El comparador recibe exactamente los slugs recomendados.
- Las URLs completas son compartibles y las parciales recuperables.
- No se modifica el schema de `productos`.
- Ningún precio, ASIN, disponibilidad ni Offer se inventa.
- ES y EN cumplen canonical, hreflang, sitemap, schema y enlazado interno.
- Build, tests y Lighthouse cumplen los umbrales solicitados.

## Auto-Revisión Del Plan

- **Cobertura:** incluye precios ES/US, DSL, scoring, razones, UI, URL, comparador, SEO, i18n, enlaces, fixture y Lighthouse.
- **Consistencia:** el selector sigue siendo estático; solo `ItemList` depende del cliente. `Offer` depende del registro verificado y nunca del tramo.
- **Extensibilidad:** el auto-descubrimiento evita editar un registro central por cada tipo.
- **Scope:** la auditoría de 228 combinaciones producto/mercado es una fase separada y verificable, pero forma parte de la misma entrega por decisión del usuario.
- **Completitud:** no quedan marcadores vacíos ni decisiones técnicas sin resolver.
