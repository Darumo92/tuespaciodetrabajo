# Standing Desk Frame vs Complete Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una guía bilingüe, honesta y basada en datos sobre estructura elevable frente a escritorio completo, sin modificar ningún artículo existente.

**Architecture:** La entrega se divide en guardarraíles editoriales, validación de fuentes/productos, creación de la pareja ES+EN y sincronización del motor SEO. El artículo nuevo será una guía informativa híbrida que responde primero a la decisión de compra y después deriva únicamente a fichas internas existentes; no añadirá componentes de comparativa ni afirmará pruebas de producto. Los MDX nuevos quedarán en revisión humana y solo se marcarán como publicados tras aprobación explícita del usuario. Los artículos MDX existentes no se tocarán y no se añadirá un backlink desde el pillar en esta entrega.

**Tech Stack:** Astro 5, MDX, content collections con Zod, YAML/CSV del SEO Content Engine, Pexels downloader, Amazon Creators API, Vitest/build de Astro.

**Design spec:** `docs/superpowers/specs/2026-08-01-standing-desk-frame-vs-complete-design.md`

**Commit policy:** No crear commits. El usuario no los ha solicitado.

---

## File Map

**Guardarraíles editoriales**

- Modify: `.seo-engine/templates/humanization-guide.md` - sustituir instrucciones de invención por humanización honesta.
- Modify: `.seo-engine/templates/tone-guide.md` - eliminar ejemplos falsos y mínimos rígidos de experiencia personal.
- Modify: `.seo-engine/templates/blog-structures.yaml` - permitir señales E-E-A-T verificables cuando no hay experiencia directa.
- Modify: `docs/agent-context/reference_seo_workflows.md` - prohibir fabricación de anécdotas y ajustar el workflow de revisión.
- Modify: `docs/agent-context/reference_article_checklists.md` - convertir el requisito de experiencia en requisito de transparencia verificable.

**Contenido público**

- Create: `src/content/articulos/marco-vs-escritorio-elevable-completo.mdx` - guía española de al menos 1.500 palabras.
- Create: `src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx` - adaptación inglesa de al menos 1.500 palabras.
- Verify: `public/images/articulos/marco-vs-escritorio-elevable-completo.webp` - resultado ya creado de Pexels `4554421`, cottonbro studio, WebP 800x400.

**Datos editoriales**

- Modify: `.seo-engine/data/features.yaml` - asociar únicamente la guía nueva a `escritorios-elevables`.
- Modify: `.seo-engine/data/content-map.yaml` - registrar únicamente el artículo nuevo y su enlazado saliente.
- Modify: `.seo-engine/data/content-queue.yaml` - registrar únicamente el borrador nuevo.
- Modify: `.seo-engine/data/topic-clusters.yaml` - añadir únicamente el artículo nuevo al cluster `escritorios`.
- Modify: `.seo-engine/data/seo-keywords.csv` - guardar los 16 volúmenes reales ES/GB.
- Modify: `.seo-engine/logs/changelog.md` - registrar guardarraíles, borrador nuevo y fuentes.
- Modify: `docs/agent-context/project_content_plan.md` - actualizar únicamente la fila y el handoff del artículo nuevo.
- Modify: `PRODUCTOS.md` - registrar imagen y productos citados sin inventar precios.

---

### Task 1: Endurecer la política de honestidad editorial

**Files:**
- Modify: `.seo-engine/templates/humanization-guide.md:1-153`
- Modify: `.seo-engine/templates/tone-guide.md:1-106`
- Modify: `.seo-engine/templates/blog-structures.yaml:5-145`
- Modify: `docs/agent-context/reference_seo_workflows.md:31-132`
- Modify: `docs/agent-context/reference_article_checklists.md:52-112`

- [ ] **Step 1: Ejecutar el test de política actual y confirmar que falla**

Run:

```bash
rg -n "Inventarlos directamente|Contenido inventado pero coherente|interaccion de lector/comunidad inventada|anecdota de entorno cercano|Mínimo 2 inserciones|Minimo 2-3" .seo-engine/templates/humanization-guide.md .seo-engine/templates/tone-guide.md .seo-engine/templates/blog-structures.yaml docs/agent-context/reference_seo_workflows.md docs/agent-context/reference_article_checklists.md
```

Expected: devuelve las coincidencias de frases prohibidas que existan en el baseline; `min_personal_experience` se valida por separado al final porque debe conservarse en dos formatos.

- [ ] **Step 2: Reescribir `humanization-guide.md` alrededor de hechos verificables**

Conservar las reglas útiles sobre ritmo, intros, listas asimétricas, estructura, autoría y datos concretos. Sustituir las secciones de experiencia e invención por este contrato editorial:

```markdown
## Experiencia, metodología y honestidad

- Solo presentar como experiencia propia hechos que figuran en `.seo-engine/config.yaml` y `docs/agent-context/project_author_persona.md`.
- Si David no ha probado un producto, decirlo de forma breve y explicar la metodología: fichas oficiales, especificaciones, documentación y reseñas verificadas.
- No inventar lectores, compañeros, familiares, compras, lesiones, citas, duración de uso, métricas ni testimonios.
- Una señal personal real puede aparecer una vez si aporta a la decisión. No hay un mínimo artificial de anécdotas.
- Una fuente externa debe existir, respaldar exactamente la afirmación y aportar a la pregunta. No incluir estadísticas solo para cumplir una cuota.

### Formulas de transparencia

- "No he probado este modelo; comparo sus especificaciones publicadas y los patrones repetidos en reseñas verificadas."
- "Mi experiencia directa aquí se limita al montaje de un tablero de madera maciza sobre patas fijas de IKEA; no he usado una estructura elevable."
- "Cuando una cifra no está publicada o no se ha podido confirmar, se omite."
```

El checklist final debe exigir: intro no formulaica, afirmaciones personales verificadas, metodología visible cuando no hay prueba directa, FAQs variables, datos con fuente, tono natural y coherencia con la persona.

- [ ] **Step 3: Corregir tono y estructuras sin imponer experiencias falsas**

En `tone-guide.md`, cambiar la voz general a "amigo que lleva años teletrabajando y distingue entre uso propio e investigación". Sustituir ejemplos que empiezan por "Tras probar" o "Después de 6 meses" por ejemplos metodológicos honestos. El resumen de humanización debe quedar así:

```markdown
- **Variar intros** - nunca repetir el mismo patrón en artículos consecutivos
- **Experiencia solo si es real** - si no se ha probado, declarar el límite y explicar la metodología
- **Asimetría en listas** - no todos los productos con el mismo número de pros/contras
- **Romper la estructura** - no seguir siempre el mismo esquema de secciones
- **Honestidad** - no inventar personas, pruebas, compras, lesiones, métricas ni citas
- **Autoría real** - nombre real, no marca
```

En `blog-structures.yaml`, sustituir cada `min_personal_experience` de `comparativa`, `informativo` y `pilar` por:

```yaml
verified_eeat_signal: true
personal_experience: "only_if_verified"
```

Mantener mínimos de experiencia únicamente en los tipos `experiencia` y `setup`, porque esos formatos solo pueden usarse sobre productos y espacios que David posee realmente. Añadir a sus descripciones: `"No usar este formato sin experiencia directa verificable."`.

- [ ] **Step 4: Alinear workflow y checklist**

En `reference_seo_workflows.md`:

- reemplazar la regla E-E-A-T por experiencia real, dato verificable, metodología transparente o referencia experta real;
- eliminar la orden de inventar directamente;
- cambiar el requisito de "mín 2 inserciones" por una declaración de límites y metodología si no existe uso propio;
- mantener el gate `human-review` y la alerta al usuario.

En `reference_article_checklists.md`, sustituir las líneas de experiencia obligatoria por:

```markdown
5. **Señal E-E-A-T verificable en CADA artículo.** Usar experiencia personal solo si está documentada en la persona canónica. Si el producto no se ha probado, declararlo y explicar la metodología de análisis. Nunca inventar anécdotas, lectores, familiares, lesiones o citas.
```

Y en el checklist de publicación:

```markdown
- [ ] Experiencia personal usada solo cuando está documentada; si no existe, metodología y límites visibles
```

- [ ] **Step 5: Ejecutar el test de política corregida**

Run:

```bash
rg -n "Inventarlos directamente|Contenido inventado pero coherente|interaccion de lector/comunidad inventada|anecdota de entorno cercano|Mínimo 2 inserciones|Minimo 2-3" .seo-engine/templates/humanization-guide.md .seo-engine/templates/tone-guide.md .seo-engine/templates/blog-structures.yaml docs/agent-context/reference_seo_workflows.md docs/agent-context/reference_article_checklists.md
awk '
  /^[a-z_]+:$/ { section = substr($0, 1, length($0) - 1) }
  /^[[:space:]]+min_personal_experience:/ {
    count++
    seen[section]++
    if (section != "experiencia" && section != "setup") bad = 1
  }
  END {
    if (count != 2 || seen["experiencia"] != 1 || seen["setup"] != 1 || bad) exit 1
    print "min_personal_experience: 2 (experiencia=1, setup=1)"
  }
' .seo-engine/templates/blog-structures.yaml
```

Expected: `rg` sin salida y exit code 1, que significa cero instrucciones incompatibles. `awk` imprime `min_personal_experience: 2 (experiencia=1, setup=1)` y termina con exit code 0; cualquier aparición adicional o fuera de `experiencia`/`setup` falla.

---

### Task 2: Validar productos y preparar la imagen

**Files:**
- Read: `src/content/productos/duronic-tm61.yaml`
- Read: `src/content/productos/aimezo-doble-motor.yaml`
- Read: `src/content/productos/maidesite-t1-pro.yaml`
- Read: `src/content/productos/duronic-cd120.yaml`
- Verify: `public/images/articulos/marco-vs-escritorio-elevable-completo.webp`
- Modify: `PRODUCTOS.md`

- [ ] **Step 1: Registrar los resultados ya obtenidos de la Creators API**

Run:

```bash
node scripts/amazon-lookup.mjs B0C34FB93G B0D1KB6GV2 B08DXZ6JJ5 B0DKJPZWW9
```

Expected conforme a la consulta del 2026-08-01:

- Duronic TM61 `B0C34FB93G`: identidad validada, disponible y 175,99 EUR en el momento de consulta. La URL fuente del YAML usa `B0C34CGRHX`, así que no sirve como prueba del listing exacto validado.
- AIMEZO `B0D1KB6GV2`: identidad coincidente, pero no disponible; sin precio actual ni afirmación de compra directa.
- Maidesite `B08DXZ6JJ5`: resultado genérico/con deriva de versión; Amazon indica 30 mm/s frente a los 25 mm/s del YAML T1 Pro.
- Duronic CD120 `B0DKJPZWW9`: identidad coincidente, pero no disponible; sin precio actual ni afirmación de compra directa.

- [ ] **Step 2: Congelar las únicas afirmaciones de producto permitidas**

- Duronic TM61 puede citarse como listing validado. Evitar precios volátiles; si 175,99 EUR resulta genuinamente útil, presentarlo únicamente como captura fechada del 2026-08-01, no como precio vigente.
- AIMEZO y Duronic CD120 pueden ilustrar diferencias entre fichas o formatos, pero deben identificarse como no disponibles en la consulta. No incluir precio actual, CTA directo ni lenguaje de compra inmediata.
- Maidesite puede citarse solo como ejemplo de catálogo con altura 72-120 cm, carga de 100 kg y compatibilidad amplia de tableros. Añadir una advertencia explícita para comprobar la versión y no afirmar que el listing actual sea exactamente el T1 Pro del YAML.
- Omitir por completo cualquier velocidad de Maidesite, incluso al explicar la discrepancia.
- No presentar las notas `valoraciones` como resultados de prueba ni añadir especificaciones que no sean necesarias para la decisión marco/completo.

Los productos solo llevarán los cuatro enlaces internos de catálogo enumerados en las Tasks 3 y 4. No usar enlaces Amazon, `AffiliateButton`, `TopPick` ni `ComparisonTable`.

- [ ] **Step 3: Reproducir la descarga registrada solo si falta la imagen**

La selección ya ejecutada fue la consulta `DIY home office desk assembly`, resultado `--index=5`, orientación `--orientation=landscape`: Pexels ID `4554421`, cottonbro studio, `https://www.pexels.com/photo/woman-in-white-crew-neck-t-shirt-holding-red-and-white-plastic-toy-4554421/`. No volver a descargar si el archivo ya existe.

Run:

```bash
set -euo pipefail
image='public/images/articulos/marco-vs-escritorio-elevable-completo.webp'
if [ ! -f "$image" ]; then
  node scripts/pexels-download.mjs "DIY home office desk assembly" marco-vs-escritorio-elevable-completo --index=5 --orientation=landscape
fi
```

Expected: el archivo existe y corresponde al resultado registrado. La foto muestra una persona atornillando un tablero fijo a una estructura metálica: ilustra montaje DIY, pero no un actuador ni una estructura elevable.

- [ ] **Step 4: Recortar de forma segura a 800x400 y verificar limpieza**

El procesamiento no puede leer y sobrescribir la misma ruta con Sharp. Crear el temporal oculto en el mismo directorio, limpiar en caso de error y renombrar únicamente después de generar correctamente el WebP.

Run:

```bash
set -euo pipefail
image='public/images/articulos/marco-vs-escritorio-elevable-completo.webp'
tmp="$(mktemp 'public/images/articulos/.marco-vs-escritorio-elevable-completo.XXXXXX.webp')"
trap 'rm -f -- "$tmp"' EXIT
rm -f -- "$tmp"
node -e "import sharp from 'sharp'; const [input, output] = process.argv.slice(1); await sharp(input).resize(800, 400, { fit: 'cover', position: 'centre' }).webp({ quality: 80 }).toFile(output)" "$image" "$tmp"
mv -- "$tmp" "$image"
trap - EXIT
node -e "import sharp from 'sharp'; const p=process.argv[1]; const m=await sharp(p).metadata(); console.log(m.format,m.width,m.height); if(m.format!=='webp'||m.width!==800||m.height!==400) process.exit(1)" "$image"
if compgen -G 'public/images/articulos/.marco-vs-escritorio-elevable-completo.*.webp' > /dev/null; then
  printf 'Error: quedó un archivo temporal de imagen\n' >&2
  exit 1
fi
```

Expected: `webp 800 400`, exit code 0 y ningún temporal permanente. Registrar ID, fotógrafo y URL exacta en `PRODUCTOS.md`. No describir la imagen como una estructura elevable.

---

### Task 3: Crear el borrador español

**Files:**
- Create: `src/content/articulos/marco-vs-escritorio-elevable-completo.mdx`

- [ ] **Step 1: Confirmar que no existe una pieza canibalizadora**

Run:

```bash
rg -n "estructura de escritorio elevable o mesa completa|estructura escritorio elevable|marco-vs-escritorio-elevable-completo" src/content/articulos .seo-engine/data/content-map.yaml
```

Expected: referencias parciales en artículos de escritorio, pero ningún MDX dedicado ni entrada con ese slug. El ángulo se mantiene porque el pillar explica cómo elegir y la comparativa existente lista productos, mientras esta guía resuelve formato, coste y compatibilidad.

- [ ] **Step 2: Crear el frontmatter español**

Usar este frontmatter con respuestas FAQ coherentes con el cuerpo:

```yaml
---
titulo: "Estructura de escritorio elevable o mesa completa"
descripcion: "Compara una estructura de escritorio elevable con una mesa completa: costes, tablero, montaje y compatibilidad para elegir sin pagar de más."
categoria: escritorios
tipo: informativo
fecha: 2026-08-01
imagen: "/images/articulos/marco-vs-escritorio-elevable-completo.webp"
imagenAlt: "Persona atornillando un tablero de madera a una estructura metálica de escritorio"
destacado: false
tags:
  - estructura escritorio elevable
  - estructura mesa elevable
  - patas escritorio elevable
  - escritorio elevable sin tablero
  - mesa escritorio elevable
autor: David Rubio
faqs:
  - pregunta: "¿Qué sale más barato, una estructura elevable o un escritorio completo?"
    respuesta: "El marco solo puede salir más barato si ya tienes un tablero compatible. Si necesitas comprar tablero, tornillería, herramientas y gestión de cables, un escritorio completo de entrada puede costar menos y reduce el riesgo de incompatibilidad."
  - pregunta: "¿Puedo poner cualquier tablero sobre una estructura elevable?"
    respuesta: "No. Debes comprobar el rango de ancho del marco, el fondo y grosor admitidos, el peso del tablero y dónde se atornillan los travesaños. Un tablero demasiado fino, pesado o con refuerzos mal situados puede impedir un montaje seguro."
  - pregunta: "¿Qué grosor debe tener el tablero de un escritorio elevable?"
    respuesta: "No hay una cifra universal: manda el mínimo que indique el fabricante del marco y la longitud de los tornillos. Como referencia de compra, comprueba que los tornillos no atraviesen el tablero y que el material tenga suficiente cuerpo para sujetarlos."
  - pregunta: "¿Cuándo conviene comprar el escritorio elevable completo?"
    respuesta: "Conviene cuando priorizas montaje sencillo, garantía sobre el conjunto y compatibilidad resuelta. También suele ser mejor para un primer elevable si te encajan las medidas y no necesitas un material o forma de tablero especiales."
---
```

- [ ] **Step 3: Escribir la respuesta y tabla de decisión**

Abrir con una respuesta citable: estructura si ya existe un tablero adecuado o se necesita una medida/material especial; completo si se busca sencillez, garantía conjunta y coste predecible. Antes de productos, incluir esta tabla:

| Situación | Elección | Motivo |
|---|---|---|
| Ya tienes un tablero compatible | Estructura | Evitas pagar dos veces por la superficie |
| Quieres madera maciza o una medida poco habitual | Estructura | Controlas material y dimensiones |
| Es tu primer elevable y las medidas estándar te encajan | Completo | Menos decisiones y compatibilidad resuelta |
| No tienes herramientas o no quieres perforar | Completo | Montaje más guiado |
| El marco más tablero supera el precio del conjunto | Completo | Menor coste total |

Después de la tabla, incluir una sola señal personal real: el montaje del tablero macizo con patas IKEA enseñó a David que medir, marcar y elegir tornillos forma parte del coste del DIY. Declarar inmediatamente que esa mesa es fija y que no ha probado una estructura elevable.

- [ ] **Step 4: Desarrollar el coste total y la compatibilidad**

Escribir al menos 1.500 palabras en total y cubrir:

- fórmula de coste: marco + tablero + tornillería + herramientas + gestión de cables + tiempo;
- ancho regulable del marco y medidas exteriores del tablero;
- fondo, grosor, peso y material del tablero;
- longitud y posición de tornillos;
- carga total como suma de tablero, monitores, brazos y accesorios;
- voladizo lateral y frontal;
- espacio para travesaño, caja de control y bandejas de cables;
- montaje, garantía y devoluciones como coste de riesgo.

No dar un grosor universal si el fabricante no lo publica. No afirmar que doble motor siempre equivale a mayor estabilidad; presentarlo como un factor junto a columnas, pies, travesaño, carga y altura. Priorizar la fórmula de coste sobre precios concretos; el único precio permitido sería el ejemplo TM61 de 175,99 EUR, identificado como consulta del 2026-08-01, y debe omitirse si no mejora la explicación.

- [ ] **Step 5: Añadir escenarios y ejemplos sin convertirlos en ranking**

Usar tres escenarios para marco:

1. Reutilizar un tablero compatible.
2. Montar madera maciza o medidas fuera del estándar.
3. Priorizar motor/carga sobre acabado del tablero.

Usar tres escenarios para completo:

1. Primer elevable sin herramientas.
2. Presupuesto cerrado.
3. Garantía y devolución del conjunto.

Presentar Duronic TM61 como ejemplo validado. AIMEZO y Duronic CD120 pueden ilustrar diferencias de datos o formato, pero se debe indicar que no estaban disponibles en la consulta y no se pueden enmarcar como compras actuales. Maidesite solo puede aparecer con 72-120 cm, 100 kg, compatibilidad amplia de tableros y aviso de comprobar la versión; omitir su velocidad y no equiparar el listing actual con la versión YAML. Cada mención debe usar exactamente la ruta correspondiente de la lista de enlaces del Step 6, indicar que David no los ha probado y respetar las restricciones de Task 2.

- [ ] **Step 6: Cerrar con checklist y enlaces internos**

El checklist final debe pedir al lector anotar:

- ancho y fondo disponibles;
- medidas, grosor, material y peso del tablero;
- rango de altura necesario;
- peso del equipo;
- herramientas disponibles;
- presupuesto total;
- responsable de garantía de marco y tablero.

Incluir enlaces contextuales a:

```text
/guias/como-elegir-escritorio-elevable/
/guias/altura-correcta-escritorio-silla/
/herramientas/selector/
/catalogo/escritorio/duronic-tm61/
/catalogo/escritorio/aimezo-doble-motor/
/catalogo/escritorio/maidesite-t1-pro/
/catalogo/escritorio/duronic-cd120/
```

No usar `AffiliateButton`, `ComparisonTable` ni `TopPick` en esta guía.

---

### Task 4: Crear la adaptación inglesa

**Files:**
- Create: `src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx`

- [ ] **Step 1: Crear el frontmatter inglés**

Usar:

```yaml
---
locale: en
translationOf: marco-vs-escritorio-elevable-completo
localizedSlug: standing-desk-frame-vs-complete
categoriaSlug: guides
titulo: "Standing desk frame or complete desk: which to buy?"
descripcion: "Compare a standing desk frame with a complete desk: true cost, tabletop fit, assembly and stability, so you can choose the right setup."
categoria: escritorios
tipo: informativo
fecha: 2026-08-01
imagen: "/images/articulos/marco-vs-escritorio-elevable-completo.webp"
imagenAlt: "Person fastening a wooden tabletop to a metal desk frame"
destacado: false
tags:
  - standing desk frame
  - standing desk legs
  - sit stand desk frame
  - electric standing desk frame
  - standing desk frame only
keywords:
  - standing desk frame
  - standing desk legs
  - sit stand desk frame
  - electric standing desk frame
  - standing desk frame only
marketNotes:
  - "UK SERP research on 2026-08-01; intent is commercial and transactional, with product pages dominant."
  - "The article answers frame versus complete desk while targeting the higher-volume frame and legs terms."
autor: David Rubio
faqs:
  - pregunta: "How do I choose a standing desk frame?"
    respuesta: "Start with the frame's supported tabletop sizes, height range and total load, then check motor type, control features and warranty. Measure your room and include the tabletop's own weight before comparing capacity figures."
  - pregunta: "Can I add a standing desk frame to a regular tabletop?"
    respuesta: "Often, but not automatically. The top must fit the frame's width and depth range, provide safe fixing points and stay within the total load limit. Check thickness and screw length so the fixings hold without breaking through the surface."
  - pregunta: "What are the disadvantages of buying a standing desk frame only?"
    respuesta: "You must source and fit the tabletop, confirm compatibility and handle warranty issues across separate parts. Tools, fixings, cable management and assembly time can also remove the apparent saving over a complete desk."
  - pregunta: "When is a complete standing desk the better choice?"
    respuesta: "A complete desk is usually better when you want predictable cost, guided assembly and one warranty for the whole setup. It also reduces compatibility risk if a standard tabletop size suits your room."
---
```

- [ ] **Step 2: Localizar el cuerpo para intención británica**

Mantener la misma lógica y especificaciones que ES, pero redactar inglés nativo en lugar de traducir literalmente. Usar `tabletop`, `frame only`, `standing desk legs`, `sit-stand desk frame` y `complete standing desk` de forma natural. No mostrar precios españoles ni convertir EUR a GBP/USD.

La tabla de decisión y el checklist deben conservar la misma cobertura. Las preguntas PAA se responden en cuerpo o FAQ, sin añadir la regla 20-8-2 porque no es central en esta decisión. Aplicar las mismas restricciones de disponibilidad y versión que en ES, y usar solo enlaces internos de catálogo para los productos.

- [ ] **Step 3: Localizar enlaces**

Usar:

```text
/en/guides/how-to-choose-a-standing-desk/
/en/guides/correct-desk-and-chair-height/
/en/tools/selector/
/en/catalog/standing-desks/duronic-tm61/
/en/catalog/standing-desks/aimezo-doble-motor/
/en/catalog/standing-desks/maidesite-t1-pro/
/en/catalog/standing-desks/duronic-cd120/
```

La señal personal debe decir que David montó y usa una mesa fija de madera maciza con patas IKEA, no una standing desk.

---

### Task 5: Sincronizar motor SEO y tracking

**Files:**
- Modify: `.seo-engine/data/features.yaml:13-19`
- Modify: `.seo-engine/data/content-map.yaml:1-998`
- Modify: `.seo-engine/data/content-queue.yaml:1-245`
- Modify: `.seo-engine/data/topic-clusters.yaml:43-77`
- Modify: `.seo-engine/data/seo-keywords.csv:272`
- Modify: `.seo-engine/logs/changelog.md:1-3`
- Modify: `docs/agent-context/project_content_plan.md:52-121`
- Modify: `PRODUCTOS.md:3-186`

- [ ] **Step 1: Registrar feature y cluster**

Añadir a `features.yaml` bajo `escritorios-elevables.blog_refs`:

```yaml
      - marco-vs-escritorio-elevable-completo
```

Añadir a `topic-clusters.yaml` bajo `escritorios.cluster_pages`:

```yaml
      - slug: marco-vs-escritorio-elevable-completo
        title: "Estructura de escritorio elevable o mesa completa"
        keyword: "estructura escritorio elevable"
        status: human-review
```

- [ ] **Step 2: Añadir las entradas de content map**

Insertar antes de `tools:`:

```yaml
  - slug: marco-vs-escritorio-elevable-completo
    title: "Estructura de escritorio elevable o mesa completa"
    path: src/content/articulos/marco-vs-escritorio-elevable-completo.mdx
    type: informativo
    category: escritorios
    primary_keyword: "estructura escritorio elevable"
    secondary_keywords:
      - estructura mesa elevable
      - patas escritorio elevable
      - mesa escritorio elevable
      - escritorio elevable sin tablero
    cluster: escritorios
    status: human-review
    date: 2026-08-01
    has_eeat_signals: true
    internal_links_to:
      - como-elegir-escritorio-elevable
      - altura-correcta-escritorio-silla
```

`internal_links_to` es un campo histórico reservado a slugs de enlaces entre artículos. No añadir aquí el selector ni páginas de producto. Los siete URLs reales de cada versión (dos guías, selector y cuatro fichas de catálogo) se verifican directamente en los MDX; las referencias de los cuatro productos se registran además en `PRODUCTOS.md`.

- [ ] **Step 3: Registrar el artículo nuevo en content queue**

Añadir únicamente esta entrada, sin modificar registros existentes:

```yaml
  - slug: marco-vs-escritorio-elevable-completo
    title: "Estructura de escritorio elevable o mesa completa"
    type: informativo
    category: escritorios
    priority: high
    status: human-review
    date_created: 2026-08-01
    notes: >-
      Borrador ES+EN en revisión humana. SERP comercial/transaccional: España
      (mesa escritorio elevable 1.600; estructura mesa elevable 210; patas
      escritorio elevable 210; estructura escritorio elevable 170) y Reino
      Unido (standing desk legs 1.000; standing desk frame 880). Ángulo único:
      coste total, compatibilidad del tablero y montaje de estructura frente a
      escritorio completo, sin ranking de productos. Ejemplos de catálogo:
      Duronic TM61 validado el 2026-08-01; AIMEZO y Duronic CD120 no disponibles;
      Maidesite con deriva de versión, sin publicar velocidad y con aviso de
      comprobar la versión. Imagen Pexels 4554421, cottonbro studio. Rutas:
      src/content/articulos/marco-vs-escritorio-elevable-completo.mdx y
      src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx. David no
      ha probado estos elevables; la metodología usa fichas oficiales, datos de
      catálogo contrastados y límites explícitos, sin experiencias inventadas.
```

- [ ] **Step 4: Añadir las keywords con ocho columnas válidas**

Añadir exactamente estas filas a `seo-keywords.csv`:

```csv
mesa escritorio elevable,1600,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
estructura mesa elevable,210,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
patas escritorio elevable,210,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
estructura escritorio elevable,170,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Primary ES - Keyword Surfer España 2026-08-01
escritorio elevable sin tablero,10,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
marco escritorio elevable,0,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
escritorio elevable completo,0,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer España 2026-08-01
marco vs escritorio elevable completo,0,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Comparison angle - Keyword Surfer España 2026-08-01
standing desk legs,1000,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer United Kingdom 2026-08-01
standing desk frame,880,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Primary EN - Keyword Surfer United Kingdom 2026-08-01
sit stand desk frame,170,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer United Kingdom 2026-08-01
electric standing desk frame,90,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer United Kingdom 2026-08-01
standing desk frame only,20,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer United Kingdom 2026-08-01
standing desk without top,10,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Keyword Surfer United Kingdom 2026-08-01
standing desk frame vs complete desk,0,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Comparison angle - Keyword Surfer United Kingdom 2026-08-01
standing desk frame vs complete standing desk,0,,,commercial_investigation,marco-vs-escritorio-elevable-completo,escritorios,Comparison variant - Keyword Surfer United Kingdom 2026-08-01
```

- [ ] **Step 5: Actualizar únicamente el artículo nuevo en el plan editorial**

Cambiar la fila #2 a `✍️ borrador ES+EN en revisión humana`. Sustituir el handoff de Playwright ya completado por un resumen fechado de las keywords y el enfoque aprobado.

- [ ] **Step 6: Actualizar PRODUCTOS y changelog**

En `PRODUCTOS.md`:

- añadir la fila de imagen con slug, archivo, Pexels ID `4554421`, cottonbro studio y URL de Pexels;
- añadir una sección `### marco-vs-escritorio-elevable-completo`;
- listar Duronic TM61, AIMEZO doble motor, Maidesite y Duronic CD120 con ASIN, resultado API y advertencias pertinentes;
- registrar TM61 `B0C34FB93G` como disponible a 175,99 EUR en la consulta del 2026-08-01 y anotar que la fuente YAML usa el ASIN distinto `B0C34CGRHX`;
- registrar AIMEZO `B0D1KB6GV2` y CD120 `B0DKJPZWW9` como identidad coincidente pero no disponibles, sin precio actual;
- registrar Maidesite `B08DXZ6JJ5` con deriva de versión y discrepancia de velocidad, pero indicar que la velocidad se omite del artículo;
- marcar el artículo como informativo y aclarar que todos los enlaces de producto del MDX son fichas internas de catálogo.

Añadir al principio de `.seo-engine/logs/changelog.md` una entrada `2026-08-01` con acción, todos los archivos tocados, resumen del borrador nuevo `human-review` y los guardarraíles editoriales, y `Triggered by: user`. No registrar una corrección del pillar.

---

### Task 6: Humanizar y verificar el borrador completo

**Files:**
- Review: todos los archivos modificados en Tasks 1-5

- [ ] **Step 1: Aplicar la skill `humanizer` a ES y EN**

Revisar ambos artículos nuevos contra la guía ya corregida. Eliminar lenguaje promocional, secuencias rígidas de tres, conclusiones repetidas, atribuciones vagas y frases que suenen traducidas. No añadir anécdotas para hacer el texto más humano.

- [ ] **Step 2: Verificar longitud de títulos y metas**

Run:

```bash
node -e "const values={newEsTitle:'Estructura de escritorio elevable o mesa completa',newEsMeta:'Compara una estructura de escritorio elevable con una mesa completa: costes, tablero, montaje y compatibilidad para elegir sin pagar de más.',newEnTitle:'Standing desk frame or complete desk: which to buy?',newEnMeta:'Compare a standing desk frame with a complete desk: true cost, tabletop fit, assembly and stability, so you can choose the right setup.'}; for(const [k,v] of Object.entries(values)){const n=Array.from(v).length; console.log(k,n); if(k.endsWith('Title')&&n>60)process.exitCode=1;if(k.endsWith('Meta')&&(n<120||n>155))process.exitCode=1}"
```

Expected: títulos ES/EN `49` y `51`; metas ES/EN `140` y `135`; exit code 0.

- [ ] **Step 3: Verificar longitud y paridad de los artículos nuevos**

Run:

```bash
node -e "import fs from 'node:fs'; const files=['src/content/articulos/marco-vs-escritorio-elevable-completo.mdx','src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx']; for(const file of files){const body=fs.readFileSync(file,'utf8').replace(/^---[\\s\\S]*?---\\s*/,''); const count=(body.match(/\\S+/g)||[]).length; console.log(file,count); if(count<1500)process.exitCode=1}"
rg -n '^## ' src/content/articulos/marco-vs-escritorio-elevable-completo.mdx src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx
```

Expected: cada cuerpo supera 1.500 palabras; las secciones cubren decisión, coste, compatibilidad, montaje, escenarios, ejemplos y checklist en ambos idiomas.

- [ ] **Step 4: Ejecutar escaneos de honestidad y enlaces**

Run:

```bash
rg -n "he probado (un|una|el|la) (Duronic|AIMEZO|Maidesite)|he usado (un|una|el|la) (Duronic|AIMEZO|Maidesite)|I (tested|have used) (a|the) (Duronic|AIMEZO|Maidesite)|lector|compañero|familiar|reader told|colleague" src/content/articulos/marco-vs-escritorio-elevable-completo.mdx src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx
rg -n "AffiliateButton|TopPick|ComparisonTable|amazon\.|/dp/|25 mm/s|30 mm/s" src/content/articulos/marco-vs-escritorio-elevable-completo.mdx src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx
rg -n "\]\(/catalogo/escritorio/|\]\(/guias/|\]\(/herramientas/selector/" src/content/articulos/marco-vs-escritorio-elevable-completo.mdx
rg -n "\]\(/en/catalog/standing-desks/|\]\(/en/guides/|\]\(/en/tools/selector/" src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx
```

Expected: los dos primeros comandos no muestran afirmaciones o componentes prohibidos; los dos últimos muestran todos los enlaces internos especificados. La frase real sobre el tablero DIY puede aparecer, pero nunca como prueba de una estructura elevable. Revisar además que AIMEZO y CD120 figuren como no disponibles, y que Maidesite incluya la advertencia de comprobar la versión.

- [ ] **Step 5: Validar productos y construir el sitio**

Run:

```bash
npm run validate:productos
npm test
npm run build
```

Expected: tres comandos con exit code 0. El build ejecuta optimización de imágenes, Astro, ajuste de sitemap y actualización automática de hashes CSP.

- [ ] **Step 6: Verificar salidas ES/EN, canonical, hreflang y schema**

Run:

```bash
test -f dist/guias/marco-vs-escritorio-elevable-completo/index.html
test -f dist/en/guides/standing-desk-frame-vs-complete/index.html
rg -n "canonical|hreflang|Article|BreadcrumbList" dist/guias/marco-vs-escritorio-elevable-completo/index.html dist/en/guides/standing-desk-frame-vs-complete/index.html
rg -n "marco-vs-escritorio-elevable-completo|standing-desk-frame-vs-complete" dist/sitemap-0.xml
```

Expected: ambos HTML existen; cada uno contiene canonical propio, alternates recíprocos, `Article` y `BreadcrumbList`; el sitemap contiene ambas URLs.

- [ ] **Step 7: Revisar el diff sin tocar cambios ajenos**

Run:

```bash
git status --porcelain=v1 --untracked-files=all -- src/content/articulos src/content/articulosI18n/en | awk '
  {
    path = substr($0, 4)
    if (path != "src/content/articulos/marco-vs-escritorio-elevable-completo.mdx" &&
        path != "src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx") {
      print "Cambio de artículo fuera de alcance: " $0 > "/dev/stderr"
      bad = 1
    }
  }
  END { exit bad }
'
git diff --exit-code -- src/content/articulos/como-elegir-escritorio-elevable.mdx src/content/articulosI18n/en/how-to-choose-a-standing-desk.mdx
git diff --check
git status --short
```

Expected: el gate `awk` termina con exit code 0 y no imprime nada; cualquier artículo modificado, eliminado o no rastreado distinto de los dos MDX nuevos lo hace fallar. El segundo comando confirma diff cero en ambos pillars existentes; `git diff --check` no muestra salida. `git status --short` puede mostrar cambios previos fuera de las colecciones; no revertirlos ni incluirlos en una acción posterior.

- [ ] **Step 8: Entregar el borrador para revisión humana**

Informar al usuario de:

- rutas ES y EN;
- recuento de palabras;
- Pexels ID `4554421`, cottonbro studio y fuente;
- productos y datos utilizados;
- build/tests ejecutados;
- estado `human-review`.

Confirmar que los dos pillars existentes tienen diff cero. Pedir aprobación explícita del contenido nuevo. No marcar la fila como publicada ni crear commit.

---

### Task 7: Cerrar la publicación solo tras aprobación explícita

**Files:**
- Modify: `.seo-engine/data/content-map.yaml`
- Modify: `.seo-engine/data/content-queue.yaml`
- Modify: `.seo-engine/data/topic-clusters.yaml`
- Modify: `.seo-engine/logs/changelog.md`
- Modify: `docs/agent-context/project_content_plan.md`
- Modify: frontmatter ES+EN si la fecha real de publicación difiere de `2026-08-01`

- [ ] **Step 1: Aplicar feedback o registrar aprobación sin cambios**

Si el usuario pide cambios, volver a ejecutar Task 6 completa después de aplicarlos. Si aprueba explícitamente el contenido nuevo, continuar.

- [ ] **Step 2: Sincronizar estado publicado**

Cambiar `human-review` a `published` para `marco-vs-escritorio-elevable-completo` en content map, queue y topic cluster. Cambiar la fila #2 del plan a `✅` con la fecha real.

En `content-queue.yaml`, cambiar siempre `status` y añadir `date_published` solo si, en el momento de publicar, ese campo sigue siendo la convención usada para nuevas entradas publicadas; si no lo es, no añadir ningún campo de fecha. `date_created` no se modifica.

Si la aprobación/publicación ocurre otro día, actualizar `fecha` de ambos MDX nuevos y `date` del content map a ese día antes del build. No usar `actualizadoEn` en los artículos nuevos.

- [ ] **Step 3: Registrar aprobación y repetir verificación final**

Añadir la aprobación al changelog y ejecutar:

```bash
npm run build
git status --porcelain=v1 --untracked-files=all -- src/content/articulos src/content/articulosI18n/en | awk '
  {
    path = substr($0, 4)
    if (path != "src/content/articulos/marco-vs-escritorio-elevable-completo.mdx" &&
        path != "src/content/articulosI18n/en/standing-desk-frame-vs-complete.mdx") {
      print "Cambio de artículo fuera de alcance: " $0 > "/dev/stderr"
      bad = 1
    }
  }
  END { exit bad }
'
git diff --exit-code -- src/content/articulos/como-elegir-escritorio-elevable.mdx src/content/articulosI18n/en/how-to-choose-a-standing-desk.mdx
git diff --check
git status --short
```

Expected: build correcto, gate global de colecciones con exit code 0, diff cero en ambos pillars existentes y `git diff --check` sin salida. No crear commit salvo una petición explícita posterior del usuario.
