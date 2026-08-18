# Plan de contenidos — 1 artículo/semana (roadmap por fases)

> Creado 2026-07-21 y reafirmado por el usuario el 2026-08-01. Es la única cola
> editorial vigente. Los calendarios anteriores se eliminaron del repositorio.

## Estrategia (por qué así)

- **Cadencia decidida: 1 artículo/semana.** Se mantiene aunque Google o Bing tengan
  fluctuaciones de visibilidad; recovery, backlinks y monitorización corren en paralelo
  y no sustituyen esta cola salvo nueva decisión explícita del usuario.
- **El artículo NO duplica al catálogo/comparador.** El catálogo + `/herramientas/selector/`
  ya cubren la intención "mejor X / A vs B" (comercial/transaccional). El artículo cubre
  lo que el catálogo no puede: **informacional / problema / guía-embudo** que rankea la
  duda y enruta al comparador y a las fichas. Comparativas puras: como mucho 1/mes.
- **Cluster temático = autoridad.** Agrupar artículos por categoría (escritorios ahora)
  construye autoridad temática y enlaza en bloque las fichas de esa categoría.
- **El contenido sigue al catálogo.** Orden: sillas/escritorios (ya con catálogo) →
  periféricos conforme se creen sus fichas (ratón, teclado, cascos/auriculares, webcam,
  micrófono, monitor, iluminación…). No escribir artículos-embudo de una categoría antes
  de tener sus fichas.

## Reglas innegociables (cada artículo)

1. **Bilingüe ES+EN** siempre (`src/content/articulos/<slug>.mdx` + `src/content/articulosI18n/en/<slug-en>.mdx`). Nunca uno sin el otro.
2. **Humanizer** obligatorio sobre ES y EN antes de cerrar.
3. **Datos SERP los aporta el usuario** (keyword, volumen ES, KD, intención, SERP features). No inventar. Pedírselos antes de redactar cada artículo.
4. **Imágenes se descargan de Pexels** con `node scripts/pexels-download.mjs "<query>" <slug> [--list] [--index=N]` (API key en `.env`, licencia libre). NO se generan con IA. Salida: `public/images/articulos/<slug>.webp`.
5. **Dudas primero**: preguntar antes de redactar si hay duda de enfoque/alcance.
6. Densidad afiliada ≤5/1000w · `fecha` = commit real · lunes preferente, nunca 2 días seguidos ni fin de semana · enlaces internos a artículos CONCRETOS + fichas + comparador · metodología visible + señal personal de David Rubio · componentes `TopPick`/`ComparisonTable`/`AffiliateButton` con `/dp/<ASIN>`, nunca URL Amazon a pelo.

## Checklist de publicación semanal (MODO PUBLICAR)

1. Coger el siguiente slug de la cola de abajo. Confirmar en 1 línea.
2. **Pedir al usuario el SERP** de ese artículo. Si dudas de enfoque, preguntar.
3. Research real (WebSearch/WebFetch + oficiales/reseñas). Specs/precios nunca inventados; precios orientativos verificados en Amazon.es. Reutilizar ASIN de fichas existentes.
4. Redactar ES: frontmatter completo (fecha = hoy), intro con señal personal antes de afiliados, metodología visible, "para quién sí/no" por producto, 3+ enlaces internos + comparador, 4-6 FAQs.
5. Redactar EN paralelo (`locale:en, translationOf, localizedSlug, categoriaSlug` de un EN de la misma categoría, `keywords`, `marketNotes`).
6. Descargar imagen: `node scripts/pexels-download.mjs "<query en inglés>" <slug> --list` para ver opciones, luego con `--index=N` para bajar la elegida → `public/images/articulos/<slug>.webp`.
7. `humanizer` sobre ES y EN.
8. `npx astro build` limpio.
9. Commit (ES+EN+imagen), fecha real. Marcar fila de la cola como ✅.

## Referencias técnicas

- Frontmatter ES: `titulo, descripcion, categoria (sillas|escritorios|accesorios|ambiente|audio-video|guias), tipo (comparativa|informativo|noticia), fecha, imagen, imagenAlt, destacado, tags[], actualizadoEn?, autor(=David Rubio), faqs[]`.
- Frontmatter EN añade: `locale, translationOf, localizedSlug, categoriaSlug, keywords[], marketNotes[]`.
- URLs: ES `/guias/<slug>/` · EN `/en/guides/<slug-en>/`. Fichas: `/catalogo/escritorio|silla/<slug>/`. Comparador: `/herramientas/selector/`.
- Idiomas: de momento **solo ES+EN** (el schema soporta más locales; no abrir aún).

---

## COLA / ROADMAP

Estado: ⬜ pendiente · 🔬 esperando SERP del usuario · ✍️ en redacción · ✅ publicado

### FASE 1 — Escritorios (cluster autoridad · catálogo con 46 fichas)

| # | Slug ES | Slug EN | Rol | Enruta a | Estado |
|---|---------|---------|-----|----------|--------|
| 1 | `como-elegir-escritorio-elevable` | `how-to-choose-a-standing-desk` | Pillar guía compra (informativo) | comparador + fichas escritorio | ✅ 2026-07-21 |
| 2 | `marco-vs-escritorio-elevable-completo` | `standing-desk-frame-vs-complete` | Informativo educativo | fichas marco (duronic-tm61, aimezo, maidesite-t1) vs completos | ✅ 2026-08-01 |
| 3 | `cuantas-horas-de-pie-escritorio-elevable` | `how-many-hours-standing-desk` | Salud/rutina (informativo) | pillar #1 + fichas | ✅ 2026-08-06 |
| 4 | `errores-comprar-escritorio-elevable` | `mistakes-buying-a-standing-desk` | Informativo compra | comparador | ✅ 2026-08-16 |

### FASE 2 — Sillas (catálogo ya grande · evitar duplicar comparativas existentes)

Artículos de silla YA existentes (no duplicar): ajustar-silla-oficina, ejercicios-estiramientos-silla, silla-gaming-vs-ergonomica, mejor-silla-ergonomica-calidad-precio, mejor-silla-oficina-menos-200-euros.

| # | Slug ES | Rol | Enruta a | Estado |
|---|---------|-----|----------|--------|
| 5 | `como-elegir-silla-ergonomica` | Pillar guía compra | comparador + fichas silla | ✅ 2026-08-18 |
| 6 | `silla-ergonomica-dolor-lumbar` | Problema/salud | fichas + pillar | ⬜ |
| 7 | `cada-cuanto-cambiar-silla-oficina` | Informativo mantenimiento | fichas | ⬜ |

### FASE 3+ — Periféricos y otras categorías (CUANDO existan sus fichas)

Regla: primero se crea el catálogo de la categoría, luego su artículo-embudo. 1 pillar
informacional/guía por categoría (las comparativas puras las cubre el catálogo).
Algunas comparativas de periférico YA existen como artículo (raton-vertical, teclado-ergonomico,
monitor, soporte-monitor, lampara-led, ventilador) → revisar y, si procede, reconvertir a
guía-embudo enlazando el futuro catálogo, no crear duplicados.

| Categoría | Artículo-embudo previsto | Requisito |
|-----------|--------------------------|-----------|
| Ratón ergonómico | `como-elegir-raton-ergonomico` | catálogo ratones |
| Teclado | `como-elegir-teclado-teletrabajo` | catálogo teclados |
| Cascos / auriculares | `como-elegir-auriculares-teletrabajo` | catálogo auriculares |
| Webcam | `como-elegir-webcam-videollamadas` | catálogo webcams |
| Micrófono | `como-elegir-microfono-videollamadas` | catálogo micros |
| Monitor | `guia-monitor-teletrabajo` (revisar el existente) | catálogo monitores |
| Iluminación | `guia-iluminacion-escritorio` (revisar existente) | catálogo lámparas |

### Diversificación / estacional (intercalar si un SERP lo justifica)

- Vuelta al cole/oficina (finales agosto-septiembre): setup teletrabajo, escritorio estudiante.
- Productividad/salud TOFU que enlace clusters (pausas activas, ergonomía guía definitiva).

---

## Cómo retomar cada semana

"Vamos con el artículo de esta semana" → coger el primer slug no ✅ de la Fase activa →
seguir el **Checklist de publicación** de arriba. Los datos SERP se investigan con Playwright + Keyword Surfer (cambiar país en KS según idioma de la búsqueda).

## Handoff 2026-08-18 — artículo #5 publicado ✅

Artículo #5 `como-elegir-silla-ergonomica` / `how-to-choose-an-ergonomic-chair` (Fase 2, sillas) aprobado y publicado.

- SERP: `como elegir silla ergonómica` 0 vol · head term `silla ergonómica` 1000 (ES) · `how to choose an ergonomic chair` 40 · `ergonomic office chair` 135000 (EN).
- Ángulo: pillar guía compra informativo (4 ajustes por orden + malla vs tapizado + reclinación sincronizada + franjas de precio). Metodología honesta: David usa Aeron.
- ES ~1.530 palabras, EN ~1.524. Imagen Pexels 4008707 (Elina Fairytale, 800px).
- Próximo: artículo #6 `silla-ergonomica-dolor-lumbar` (Problema/salud → fichas + pillar).

## Handoff 2026-08-16 — artículo #4 publicado ✅

Artículo #4 `errores-comprar-escritorio-elevable` / `mistakes-buying-a-standing-desk` completado y publicado 2026-08-16.

- SERP investigado con Playwright + Keyword Surfer, **bandera España para ES y bandera USA para EN** (no mezclar país/idioma). Long-tail 0 vol: `errores comprar escritorio elevable` / `standing desk buying mistakes`. Head terms con volumen: `escritorio elevable` 8100 (KD 0.96), `mesa elevable electrica` 720, `escritorio elevable electrico` 110 · `standing desk` 165000 (KD 4.36), `standing desk review` 720.
- Ángulo: los competidores (BTOD, Yo-Yo Desk, Vari, Suspain, Xataka) cubren errores de *uso*; este artículo cubre errores de *compra* que no se corrigen con hábito (medir, rango de altura, carga vs peso, motor, estabilidad, extras). 6 errores asimétricos + checklist.
- Metodología honesta: David no usa elevable (mesa fija DIY de madera maciza + patas IKEA), declarado en la intro.
- ES: ~1.500 palabras, EN: ~1.500 palabras. Imagen Pexels #5691673 (Ksenia Chernaya, midiendo tablero, 800px).
- Enlaza pillar, marco-vs, altura-correcta, selector y 4 fichas (SONGMICS LSD134, FlexiSpot E7, Duronic TM61, DEVAISE 120x60).
- Con esto se cierra la FASE 1 (escritorios). Próximo: FASE 2 (sillas) con `como-elegir-silla-ergonomica` (pillar guía compra).

## Handoff 2026-08-06 — artículo #3 publicado ✅

Artículo #3 `cuantas-horas-de-pie-escritorio-elevable` / `how-many-hours-standing-desk` completado y publicado 2026-08-06.

- SERP ES y GB investigados con Playwright + Keyword Surfer (sin pedir datos al usuario). Keywords long-tail con 0 vol, pero PAAs confirman interés real.
- Ángulo: respuesta directa con datos + metodología honesta (David no usa standing desk). Intro variada del patrón narrativo de los artículos #1 y #2.
- ES: ~1.829 palabras, EN: ~1.845 palabras. Imagen Pexels de mujer en standing desk (800px).
- Próximo: artículo #4 `errores-comprar-escritorio-elevable`.
