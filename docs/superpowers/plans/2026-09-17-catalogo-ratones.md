# Catálogo de ratones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Integrar cinco ratones ES+EN en catálogo y selector, con doce URLs nuevas indexables.

**Architecture:** Extender el registro de tipos y el schema discriminado existentes. Configuración de ratones en un módulo separado; YAML compartido para specs y textos ES+EN. Desactivar pares en el helper común y reutilizar componentes con etiquetas localizadas.

**Tech Stack:** Astro 5, TypeScript, YAML, CSS existente, Vitest, Playwright.

## Global Constraints

- Cinco modelos aprobados: Lift, MX Vertical, MX Master 4, MAYA X, M650 estándar.
- Doce nuevas URLs indexables, dos comparadores noindex, cero pares de ratón.
- No inventar precios, notas, compatibilidad, experiencias ni testimonios.
- API Amazon bloqueada: usar evidencia manual y fuentes oficiales fechadas.
- Sin commit/push hasta petición del usuario; preservar cambios ajenos.

## Task 1: Datos y rutas de ratón

**Files:** `src/content/config.ts`, `src/lib/tipos.ts`, nuevo `src/lib/tipos-raton.ts`, `src/lib/productos.ts`, `src/lib/productos.test.ts`, `astro.config.mjs`.

**Interfaces:** `ClaveTipo` añade `raton`; `TipoConfig.paresAutomaticos?: boolean`; `specs.tipo = 'raton'`; ruta EN `mice`.

- [ ] Añadir regresiones a rutas y pares:
  ```ts
  expect(catalogPath('en', 'raton')).toBe('/en/catalog/mice/');
  expect(sourceTipoSlug('mice', 'en')).toBe('raton');
  expect(seleccionarParesVs([mouseA, mouseB], 16)).toEqual([]);
  ```
- [ ] Ejecutar `npx vitest run src/lib/productos.test.ts` para confirmar fallo.
- [ ] Extender schema con formato, mano, dimensiones mm, peso g, Bluetooth,
  receptor, cable de datos, multidispositivo, batería/pilas y clic silencioso.
  Todos los campos no verificados son nullable; formato y mano son explícitos.
- [ ] Registrar configuración `raton` con `paresAutomaticos: false`, ejes vacíos,
  filtros propios y filas de comparación sin declarar un ganador por DPI/peso.
- [ ] Filtrar pares antes de ordenar:
  ```ts
  const elegibles = productos.filter(p => getTipoConfig(p.tipo)?.paresAutomaticos !== false);
  ```
- [ ] Añadir `raton: 'mice'` a rutas y sitemap. Repetir prueba.

## Task 2: Fuentes y fichas bilingües

**Files:** cinco `src/content/productos/logitech-*.yaml` / `lamzu-maya-x.yaml`, handoff de ratones.

**Interfaces:** YAML existente con `specs.tipo: raton`, textos `en`, `valoracion: null`, `valoraciones: {}`.

- [ ] Consultar páginas oficiales de los cinco productos y manuales; guardar
  fuentes/fecha y distinguir variante, receptor incluido y compatibilidad básica
  frente a software opcional.
- [ ] Crear cinco YAML con ASINs del handoff, imágenes Amazon 300 px verificadas,
  specs confirmadas, ventajas y límites específicos. Mantener `precioMin` y
  `precioMax` nulos: los precios del handoff son observaciones, no ofertas duraderas.
- [ ] Añadir metodología y limitaciones EN al schema y a `Producto.en`; usar esos
  campos en los componentes para evitar metodología genérica sobre notas.
- [ ] Comprobar cada YAML con parser y build. Revisar imágenes visualmente.

## Task 3: Integración UI y selector

**Files:** `FichaProducto.astro`, `FichaMetodologiaProducto.astro`, `FichaFuentes.astro`, `CatalogoProductos.astro`, componentes comparador, rutas listado ES, `src/lib/selector/config-ratones.ts`, textos de selector y pruebas asociadas.

**Interfaces:** módulo `selectorConfig: SelectorTypeConfig` descubierto por glob existente.

- [ ] Añadir prueba del selector usando productos reales: Bluetooth requerido
  favorece modelos Bluetooth; MAYA X no debe presentarse como coincidencia
  Bluetooth; los datos desconocidos no cuentan como confirmación.
- [ ] Añadir configuración de preferencias por formato/conexión y lateralidad,
  con razones bilingües, avisos y penalizaciones explícitas por incompatibilidad.
- [ ] Localizar etiquetas y valores de las nuevas specs en fichas/filtros/
  comparación. Ocultar bloques de notas cuando no hay ejes.
- [ ] Actualizar presentación del selector para incluir ratones, manteniendo
  rutas existentes y comportamiento del resto de categorías.
- [ ] Ejecutar pruebas de selector y catálogo; revisar contador y enlaces.

## Task 4: Revisión de comparativa y enlaces

**Files:** `src/content/articulos/mejor-raton-vertical-ergonomico.mdx`, pareja EN,
registros correspondientes de `.seo-engine/data/`, `PRODUCTOS.md`.

- [ ] Leer registros engine, pareja EN y fuentes de productos antiguos.
- [ ] Retirar relatos no documentados, promesas médicas, cifras y diagnósticos
  sin respaldo. Explicar investigación documental y uso real de MAYA X sin
  inventar resultados. Mantener la intención y las URLs existentes.
- [ ] Enlazar fichas Lift y MX Vertical y selector; desde fichas enlazar artículo
  específico. Fecha `actualizadoEn` real solo en los dos artículos revisados.
- [ ] Aplicar humanizer ES+EN; actualizar trazabilidad editorial.

## Task 5: Verificación y entrega

**Files:** handoff/INDEX/changelog; salida de build (no editar hashes a mano).

- [ ] Ejecutar `npm test` y `npm run build`. Corregir fallos de cambios nuevos;
  documentar fallos preexistentes con evidencia, sin ocultarlos.
- [ ] Inspeccionar HTML/sitemap: diez fichas, dos listados indexables, dos
  comparadores noindex, cero pares; canonical/hreflang ES+EN coincidentes.
- [ ] Preview local: verificar imágenes, filtros vertical/Bluetooth, selección
  de dos modelos, selector y enlaces internos en 390 y 1440 px.
- [ ] Revisar `git diff --check` y diff final. Actualizar handoff con resultados
  y entregar URLs previstas para revisión humana, sin publicar.
