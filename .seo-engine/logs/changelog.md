# Changelog — Tu Espacio de Trabajo SEO Engine

## 2026-05-20
**Action:** Mejora editorial recovery — mejor-silla-oficina-menos-200-euros
**Files:** src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx
**Summary:** Añadida sección pre-tabla con metodología de selección, límites del rango <200 EUR, criterios de descarte por altura/peso/horas y declaración honesta de experiencia directa vs análisis por fichas/reseñas. `actualizadoEn` real 2026-05-20. Corregida coherencia persona: despacho 8 m² → 9 m² en Rubí. Objetivo: reforzar calidad percibida/E-E-A-T en URL no reconocida por Google según inspección GSC del día.
**Triggered by:** user ("vamos con el plan dehoy" — día sin publicación nueva, mejora editorial diaria)

## 2026-05-18 18:00
**Action:** Artículo #30 creado — mejor-ventilador-silencioso-oficina
**Files:** src/content/articulos/mejor-ventilador-silencioso-oficina.mdx, public/images/articulos/mejor-ventilador-silencioso-oficina.webp, src/content/articulos/trabajar-desde-casa-calor.mdx, .seo-engine/data/content-map.yaml, .seo-engine/data/content-queue.yaml, .seo-engine/data/topic-clusters.yaml, .seo-engine/data/seo-keywords.csv, .seo-engine/data/features.yaml, PRODUCTOS.md, AGENTS.md
**Summary:** Comparativa recovery #30 (ambiente, estacional verano). SERP top 5 con intent commercial investigation (El Independiente, elEconomista, El Corte Inglés, La Vanguardia, ventiladores.com). Ángulo propio: ventiladores silenciosos para oficina en casa y videollamadas, no guía genérica para dormir/salón. Productos verificados con Amazon Creators API: Philips Serie 2000, Dreo PolyFan, LEVOIT torre, Dreo torre, Cecotec EnergySilence 890 y Honeywell TurboForce. Se aplicó humanizer e imagen Pexels #5850340 redimensionada a 800px.
**Triggered by:** user (vamos con el plan de hoy)

## 2026-05-11 09:20
**Action:** Publicar artículo #29 trabajar-desde-casa-calor (cluster ambiente, estacional jun-ago) — primer artículo post-recovery indexación
**Files:** src/content/articulos/trabajar-desde-casa-calor.mdx, public/images/articulos/trabajar-desde-casa-calor.webp, .seo-engine/data/content-queue.yaml, PRODUCTOS.md
**Summary:** Publicado primer artículo del plan recovery cadencia 1/sem. Info ambiente, 2868 palabras, 6 FAQs variables, 4 internal links a artículos concretos (mejor-escritorio-elevable-electrico, mejor-monitor-trabajar-desde-casa, insonorizar-home-office, productividad-en-casa-entorno-fisico). Coherencia persona: Rubí 9 m² orientación norte, fisio Pep contractura trapecio derecho, BenQ PD2705U 35-50W radiado, mujer teletrabaja habitación contigua sur a 35°C, lector Sevilla con ventilador 56dB. Datos verificables: INSST RD 486/1997 (23-26°C confort), AEMET 25-30 días/año >35°C, Sabadell 41,1°C 30 jun 2025, Helsinki Univ. caída 2%/grado (vía OMS), IDAE +7-10%/grado <25°C. Estructura no estándar (cumple regla anti-IA): intro anecdótica → realidad térmica España → 3 capas en orden → bridge ventilador silencioso (precarga #30 head term 9900 vol) → errores contraintuitivos → rutina diaria Rubí → cuándo AC no opcional → más allá del aire → resumen. Meta desc 151 chars. Humanizer pass: sin em dashes, sin AI vocab, suavizado anuncio rule-of-three pre-bullets finales. Build OK 46 páginas. Status queue: published.
**Triggered by:** user ("vamos con la sesion de hoy" — calendario recovery lun 11 may, aprobación explícita)

## 2026-05-08 21:15
**Action:** Refactor mejor-teclado-ergonomico (Recovery Bloque B pieza 2) — diluir densidad afiliada
**Files:** src/content/articulos/mejor-teclado-ergonomico.mdx
**Summary:** Bajada densidad afiliada de 6.19 a 2.62 affiliates/1000w. Insertado bloque educativo ~750w pre-ComparisonTable cubriendo: biomecánica de la muñeca (desviación cubital 15-20°, pronación, extensión dorsal — con referencias Cornell Ergonomics e INSST), tres formatos diferenciados (wave / split fijo curvado / split separable + mención Kinesis Advantage columnar para programadores con RSI), cuatro señales tempranas (hormigueo meñique-anular, epicondilitis, tensión trapecios, manos pesadas a media tarde) con anécdota lector que escribió pidiendo enlace K860, y cuatro escenarios donde NO comprar (uso <3h/día, gaming, presupuesto <30€, síntomas agudos). Mantenida cita de Pep como referencia ergonómica. Eliminados 5 AffiliateButton sueltos en cuerpo (uno tras cada análisis de producto) — conservados TopPick, 5 filas ComparisonTable y 5 CTAs finales en "Nuestra recomendación". Fix coherencia persona: "home office en Barcelona" → "despacho de 9 m² en Rubí" + mención Pep/Fisiosthetic/Rubí. Total enlaces /dp/ pasa de 16 a 11 sobre ~4200w body. Build OK. Push único del día.
**Triggered by:** user ("seguimos con el plan" — plan recovery indexación, calendario vie 08 may)

## 2026-05-07 22:18
**Action:** Refactor mejor-raton-vertical-ergonomico (Recovery Bloque B pieza 1) — diluir densidad afiliada
**Files:** src/content/articulos/mejor-raton-vertical-ergonomico.mdx
**Summary:** Bajada densidad afiliada de 7.40 a 3.43 affiliates/1000w. Insertado bloque educativo ~700w pre-ComparisonTable cubriendo: biomecánica de la pronación (con referencia Cornell Ergonomics), señales tempranas (hormigueo, dolor base pulgar, mano dormida), perfiles para los que NO compensa (gaming competitivo, diseño <0.5mm, uso <2h/día, ratón compartido), curva de adaptación días 1-3 / 4-7 / 8-14 con anécdota de compañera de Sabadell. Eliminados 6 AffiliateButton sueltos en cuerpo (uno tras cada análisis de producto) — conservados TopPick, 6 filas ComparisonTable y 5 CTAs finales en "Nuestra recomendación". Fix coherencia persona: "setup de Barcelona" → "despacho de 9 m² en Rubí" + "fisioterapeuta Pep en Fisiosthetic en Rubí". Total enlaces afiliados pasa de 18 a 12 sobre ~3500w body. Build OK. Push 49524be (1/1 del día).
**Triggered by:** user ("vamos con el plan de hoy" — plan recovery indexación, calendario jue 07 may)

## 2026-04-24 22:40
**Action:** Nuevo artículo #27 ejercicios-estiramientos-silla-oficina (Info, cluster sillas) en human-review
**Files:** src/content/articulos/ejercicios-estiramientos-silla-oficina.mdx, src/content/articulos/ajustar-silla-oficina-correctamente.mdx, src/content/articulos/dolor-cervicales-ordenador.mdx, src/content/articulos/dolor-espalda-trabajar-casa.mdx, src/content/articulos/mejor-silla-ergonomica-calidad-precio.mdx, .seo-engine/data/content-map.yaml, .seo-engine/data/topic-clusters.yaml, .seo-engine/data/seo-keywords.csv, PRODUCTOS.md, public/images/articulos/ejercicios-estiramientos-silla-oficina.webp
**Summary:** Artículo informativo ~2600 palabras sobre ejercicios y estiramientos en silla de oficina. Ángulo propio vs SERP genérico (espriu.es, sillapilable, cuerpomente, ofival, fisicoclinica — todos listas 4-5 estiramientos sin rutina ni tiempos): rutina estructurada 2 min cada 2h, 15 ejercicios en 4 bloques (cervical/hombros, dorsal/pecho, lumbar/cadera, inferiores + core), contraindicaciones, 4 errores reales al empezar, hábito sin app vs Stretchly, ancla a eventos del día. 6 FAQs de PAA real ("qué ejercicios para estirar en la oficina", "qué ejercicios para estar sentado", "cómo estirarse en una silla", + 3 custom). Head terms embebidos KW Surfer 2026-04-24: ejercicios en silla (1600), ejercicios sentados (1300), ejercicios con silla (1000), gimnasia en silla (480), pausas activas (260), ejercicios sentado (210), estiramientos en la oficina (110), ejercicios en la oficina (90). 4 internal links salientes (ajustar-silla, dolor-cervicales, dolor-espalda, pilar sillas) todos con backlink bidireccional añadido. 11 keywords nuevas en seo-keywords.csv. Imagen Pexels #5899200 kaboompics (home office ejercicio) descargada, redimensionada a 800px. INSST NTP 242 + estudio Thorp 2014 como fuentes autoritativas. Coherencia: fisio + cervicalgia 2021 + despacho 8m² Barcelona + FlexiSpot E7 + ErgoChair Pro. Build OK.
**Triggered by:** user ("vamos con el artículo de hoy" — #27 del calendario, Vie 24 abr)

## 2026-04-21 12:00
**Action:** Nuevo artículo #26 insonorizar-home-office (Info, cluster ambiente, estacional obras primavera) en human-review
**Files:** src/content/articulos/insonorizar-home-office.mdx, src/content/articulos/home-office-piso-pequeno.mdx, src/content/articulos/guia-completa-home-office.mdx, .seo-engine/data/content-map.yaml, .seo-engine/data/topic-clusters.yaml, .seo-engine/data/seo-keywords.csv
**Summary:** Artículo informativo ~2100 palabras sobre cómo insonorizar una habitación/home office sin obras. Ángulo propio vs SERP (decibel.shop, reddit, bnpanel, masacoustics, europeanacustica): experiencia directa en piso alquiler Barcelona, mediciones dB reales antes/después (48→32 dB), orden exacto de intervenciones por capas (sellado > textiles > paneles), demistificación paneles espuma vs aislamiento, rutas <50€/<200€, errores cometidos. 6 FAQs de PAA real ("cómo puedo insonorizar mi oficina en casa", "qué puedo poner en mi cuarto", "qué material no deja pasar el ruido", "5 acciones para evitar el ruido", "paneles espuma sí/no", "pared con vecinos sin obra"). Head terms embebidos: cómo insonorizar una habitación (1900), insonorizar pared (2900), insonorizar habitación (2400), paneles acústicos (6600 referencia), cómo insonorizar una pared (880), insonorizar pared sin obra (390). 2 internal links salientes bidireccionales con home-office-piso-pequeno y guia-completa-home-office. 22 keywords nuevas en seo-keywords.csv. content-map.yaml + topic-clusters.yaml actualizados (status planned → human-review). Adelantado 1 día (publicación original 22 abr, hoy 21 abr). Imagen Pexels pendiente.
**Triggered by:** user ("vamos con el artículo de hoy" — adelanto desde martes sin artículo asignado)

## 2026-04-19 22:30
**Action:** Nuevo artículo #25 dolor-cervicales-ordenador (Info, cluster sillas) publicado
**Files:** src/content/articulos/dolor-cervicales-ordenador.mdx, src/content/articulos/dolor-espalda-trabajar-casa.mdx, src/content/articulos/ergonomia-teletrabajo-postura-correcta.mdx, src/content/articulos/ajustar-silla-oficina-correctamente.mdx, src/content/articulos/altura-correcta-escritorio-silla.mdx, src/content/articulos/tunel-carpiano-teletrabajo-prevencion.mdx, src/pages/herramientas/calculadora-ergonomia.astro, data/content-map.yaml, data/content-queue.yaml, PRODUCTOS.md
**Summary:** Artículo informativo ~2100 palabras sobre dolor cervical por ordenador. Ángulo propio vs SERP clínico (Quirónsalud, Sanitas, Mapfre): biomecánica Hansraj, 3 síntomas tech neck, ajustes que cambiaron cervicalgia propia, ejercicios realistas entre meetings, red flags para fisio. 5 FAQs de PAA real. Head terms embebidos: dolor cervical (8100), cervicalgia (12100), ejercicios para las cervicales (2400), estiramientos cervicales (1600), tech neck (210). 7 internal links salientes, 6 bidireccionales (dolor-espalda, ergonomia-postura, ajustar-silla, altura-correcta, tunel-carpiano, calculadora-ergonomia). content-map actualizado en las 7 entries. Imagen Pexels pendiente (PEXELS_API_KEY no disponible en worktree).
**Triggered by:** user ("vamos con el artículo de mañana")

## 2026-04-15 23:15
**Action:** Internal linking audit + fix — 9 new bidirectional links
**Files:** 7 MDX articles, data/content-map.yaml
**Summary:** Linking audit identified gaps: mejor-raton-vertical (1 outgoing → 3), silla-gaming (no hub link → added), soporte-monitor (no monitor link → added), teclado (weak fatiga-visual → reinforced), standing-desk (no hub/altura links → added 2), home-office-500 (no hub link → added), escritorio-elevable (no altura link → added). Hub guia-completa-home-office incoming 3→6. altura-correcta incoming 2→4. content-map.yaml updated with all new links.
**Triggered by:** user (maintenance day)

## 2026-04-15 --:--
**Action:** Keyword research audio-video completado — S4 procede
**Files:** data/seo-keywords.csv, logs/changelog.md
**Summary:** Keyword research audio-video completado con Keyword Surfer. Resultados: "auriculares cancelación ruido" 2900 SV (fuerte para pilar), "mejor webcam" 210, "mejor webcam calidad precio" 260, "micrófono pc" 720, "micrófonos para la pc" 1000. Keywords long-tail con 0 volumen: "auriculares cancelación ruido trabajar", "mejor webcam videollamadas", "mejor micrófono videollamadas", "webcam teletrabajo". Keywords relacionadas fuertes: "auriculares con cancelación de ruido" 2400, "cascos cancelación ruido" 1600, "auriculares con micro" 2400. 23 keywords añadidas a seo-keywords.csv. VEREDICTO: S4 procede — el pilar de auriculares tiene keyword fuerte (2900). Webcam y micrófono son cluster pages de apoyo.
**Triggered by:** user

## 2026-04-15 --:--
**Action:** SEO engine sync — tareas previas obligatorias Plan v2
**Files:** data/content-queue.yaml, data/content-map.yaml, data/topic-clusters.yaml, src/content/articulos/mejor-teclado-ergonomico.mdx, src/content/articulos/mejor-soporte-monitor-brazo-articulado.mdx
**Summary:** Sincronización masiva del SEO engine: 20 artículos approved→published en content-queue y content-map. silla-gaming-vs-ergonomica human-review→published (ya estaba publicado). fatiga-visual-pantalla planned→published en topic-clusters (perifericos). home-office-piso-pequeno planned→published en topic-clusters (escritorios). guia-completa-home-office y novedades-home-office-2026 approved→published en hub-central. Internal linking: añadidos 3 links salientes desde pilar mejor-teclado-ergonomico (→ratón, →soporte-monitor, →fatiga-visual) y 1 link desde mejor-soporte-monitor-brazo-articulado→teclado. Actualizado content-map con todos los links nuevos y internal_links_from de silla-gaming-vs-ergonomica (4 links entrantes). Todas las tareas previas del Plan v2 S1 completadas excepto keyword research audio-video (deadline 25 abril).
**Triggered by:** user

## 2026-04-15 --:--
**Action:** Blog written — "Mejor silla de oficina barata: 6 opciones por menos de 200€"
**Files:** src/content/articulos/mejor-silla-oficina-menos-200-euros.mdx, public/images/articulos/mejor-silla-oficina-menos-200-euros.webp, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Comparativa de 6 sillas ergonómicas por debajo de 200 € en 4 tiers de precio (81-200€). Ángulo: trade-offs honestos del segmento presupuesto. TopPick: COMHOMA (~150€). Primary keyword: "silla oficina barata" (480 SV). 4 FAQs. 3 experiencias personales + fisio + lector. Internal links: pilar sillas, dolor-espalda, ergonomía-postura. Cluster sillas. Imagen Pexels #5644330. Status: human-review.
**Triggered by:** user

## 2026-04-13 --:--
**Action:** Blog written — "Guía completa de home office: todo lo que necesitas" (HUB central)
**Files:** src/content/articulos/guia-completa-home-office.mdx, public/images/articulos/guia-completa-home-office.webp, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md, docs/superpowers/specs/2026-04-13-guia-completa-home-office-design.md
**Summary:** HUB central del sitio (pilar del cluster hub-central). Enfoque B: proceso de montaje en 6 pasos. ~3500 palabras, 6 FAQs, 21 internal links (todos los artículos existentes). 6 links bidireccionales añadidos desde pilares de cada cluster. Keywords: 'home office' 2400, 'oficina en casa' 880, 'teletrabajo desde casa' 720 — 10 keywords añadidas a seo-keywords.csv. SERP informacional, competencia débil. Imagen Pexels #31726669 (Alpha En, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-11 --:--
**Action:** Blog written — "Silla gaming vs ergonómica: cuál elegir para trabajar"
**Files:** src/content/articulos/silla-gaming-vs-ergonomica.mdx, seo-keywords.csv, content-map.yaml, content-queue.yaml, topic-clusters.yaml, features.yaml, PRODUCTOS.md
**Summary:** Artículo informativo del cluster sillas comparando gaming vs ergonómica para teletrabajo. ~2000 palabras, 5 FAQs, 5 internal links, 2 AffiliateButtons. Imagen Pexels #28955779.
**Triggered by:** user

## 2026-04-09 10:00
**Action:** Blog redactado — Novedades en home office 2026: los productos más interesantes
**Files:** src/content/articulos/novedades-home-office-2026.mdx, public/images/articulos/novedades-home-office-2026.webp, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Artículo informativo transversal (hub-central) sobre productos interesantes de home office en 2026. ~1900 palabras, 4 FAQs, 10 internal links a comparativas existentes. Keywords con 0 volumen directo (8 keywords buscadas en KW Surfer, todas 0). Ángulo: selección personal de teletrabajador veterano, no resumen de feria. Estructura variada con "Lo que todavía no me convence" y "Qué voy a cambiar". Imagen Pexels #4596575 (Alex Staudinger, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-08 16:30
**Action:** SEO keyword data import completa — Keyword Surfer (99 keywords)
**Files:** data/seo-keywords.csv, logs/changelog.md
**Summary:** Importación completa de datos reales de Keyword Surfer (España) para las 99 keywords del CSV. De 99 keywords, solo 19 tienen volumen >0 en KW Surfer. Top keywords con volumen: soporte monitor escritorio (1600), escritorio elevable eléctrico (1000), mesa elevable eléctrica (720), ratón ergonómico inalámbrico (590), mejor silla ergonómica (480), organizador cables escritorio (480), caja organizador cables (480), fatiga ocular síntomas (390). La mayoría de las primary keywords muestran 0 por ser demasiado long-tail, pero Google agrupa intents y nuestros títulos contienen los head terms que sí tienen volumen. Datos corregidos vs versión anterior: organizar cables escritorio 480→110, ocultar cables escritorio 480→90, organizador cables escritorio 320→480. Principales head terms descubiertos en keyword ideas: sindrome tunel carpiano 27100, teclados ordenador 14800, flexos 9900, escritorio elevable 8100, gafas luz azul 8100, ratón ergonómico 6600, ratón vertical 3600, soporte monitor 2900, organizador de cables 2900.
**Triggered by:** user (Keyword Surfer screenshots)

## 2026-04-08 10:15
**Action:** Blog aprobado — Cómo organizar los cables de tu escritorio
**Files:** data/content-map.yaml, data/content-queue.yaml
**Summary:** Artículo aprobado por el usuario sin cambios. Status actualizado a approved.
**Triggered by:** user

## 2026-04-08 10:00
**Action:** Blog redactado — Cómo organizar los cables de tu escritorio
**Files:** src/content/articulos/organizar-cables-escritorio.mdx, src/content/articulos/productividad-en-casa-entorno-fisico.mdx, src/content/articulos/home-office-piso-pequeno.mdx, src/content/articulos/mejor-escritorio-elevable-electrico.mdx, src/content/articulos/mejorar-iluminacion-espacio-trabajo.mdx, src/content/articulos/mejor-lampara-escritorio-led.mdx, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Guía informativa sobre organización de cables de escritorio (~2000 palabras). Ángulo: experiencia real de teletrabajador tras 4 intentos en 7 años vs SERP dominado por tiendas (Leroy Merlin, Amazon) y listicles (Xataka). Intro tipo problema del lector (diferente a últimos ambiente: ir al grano, experiencia + recomendación, contraposición). 3 experiencias personales: 4 intentos de cable management, FlexiSpot E7 tensando cables, compañero de equipo con 11 cables. Lector con JUMMICO. Fisioterapeuta sobre entorno limpio. Fuente: INSST seguridad laboral. Secciones: diagnóstico cables, método 5 pasos, qué comprar y qué no, escritorios elevables, lo que aprendí tras 4 intentos. 4 FAQs de SERP. 5 internal links salientes, 5 bidireccionales añadidos. Cluster: ambiente. Imagen Pexels #25223697 (Jakub Zerdzicki, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-07 10:15
**Action:** Blog aprobado — Home office en piso pequeño: ideas y soluciones que funcionan
**Files:** data/content-map.yaml
**Summary:** Artículo aprobado por el usuario sin cambios. Status actualizado a approved.
**Triggered by:** user

## 2026-04-07 10:00
**Action:** Blog redactado — Home office en piso pequeño: ideas y soluciones que funcionan
**Files:** src/content/articulos/home-office-piso-pequeno.mdx, src/content/articulos/home-office-productivo-500-euros.mdx, src/content/articulos/productividad-en-casa-entorno-fisico.mdx, src/content/articulos/mejor-escritorio-elevable-electrico.mdx, src/content/articulos/mejor-soporte-monitor-brazo-articulado.mdx, data/content-map.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Guía informativa sobre montar un home office en pisos pequeños (~2000 palabras). Ángulo: ergonomía real + experiencia práctica vs SERP dominado por revistas decoración (Interiores, HOLA, AD Magazine). Intro tipo contraste Pinterest vs realidad. 4 experiencias personales: salón 2019, despacho 8m², escritorio 160cm que no cabía, brazo monitor. Compañero Marcos (Madrid 50m²). Lector Pablo (cortina separadora). Fisioterapeuta sobre temperatura. Secciones: espacio mínimo, distribución (3 tipos), muebles compactos, lo que revistas no cuentan (acústica/temperatura/cables), errores, checklist. 5 FAQs de SERP data. 7 internal links salientes, 4 bidireccionales añadidos. Cluster: productividad. Imagen Pexels #6934240 (Max Vakhtbovych, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-06 12:30
**Action:** Blog aprobado — Mejor lámpara de escritorio LED 2026
**Files:** data/content-map.yaml, data/content-queue.yaml
**Summary:** Artículo aprobado por el usuario sin cambios. Status actualizado a approved.
**Triggered by:** user

## 2026-04-06 12:00
**Action:** Blog redactado — Mejor lámpara de escritorio LED 2026
**Files:** src/content/articulos/mejor-lampara-escritorio-led.mdx, src/content/articulos/mejorar-iluminacion-espacio-trabajo.mdx, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Comparativa de 7 lámparas LED de escritorio (29-179 EUR). Pillar del cluster ambiente. Ángulo: teletrabajo + ergonomía visual vs SERP enfocado en estudiar (El País, Xataka, La Casa Sibarita). Top pick: Xiaomi Mi LED Desk Lamp 1S (~48 EUR). ~2800 palabras, 5 FAQs (variable). Estructura comparativa con variación: 'Flexo, pinza o barra de monitor' (tipos) + 'Tres errores que veo' (sección personal). Intro tipo experiencia + recomendación directa (diferente a últimas comparativas: análogo irónico, resultado + análisis). 3 experiencias personales: flexo barato ~20€, Xiaomi para mujer, BenQ Halo uso diario. Compañero con pinza/mando. Lector sobre pagar doble. Pros/contras asimétricos (3/2, 2/3, 4/2, 3/2, 3/3, 4/3, 4/1). Internal links bidireccionales: mejorar-iluminacion (añadido link en ambos). Links a fatiga-visual, mi-setup, mejor-monitor, mejor-escritorio-elevable. 7 keywords añadidas/actualizadas. Imagen Pexels #12792219 (Elijah Pilchard, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-05 18:30
**Action:** Blog aprobado — Cómo mejorar la iluminación de tu espacio de trabajo
**Files:** data/content-map.yaml, data/content-queue.yaml
**Summary:** Artículo aprobado por el usuario sin cambios. Status actualizado a approved.
**Triggered by:** user

## 2026-04-05 14:00
**Action:** Blog redactado — Cómo mejorar la iluminación de tu espacio de trabajo
**Files:** src/content/articulos/mejorar-iluminacion-espacio-trabajo.mdx, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Guía informativa sobre iluminación de home office para teletrabajadores. Ángulo: experiencia real en despacho 8m² vs SERP dominado por tiendas de lámparas y normativa corporativa (Lightingspain, La Casa de las Lámparas, Ofiprix, Leroy Merlin, faro.es). ~2000 palabras, 5 FAQs (variable). Estructura variada: sin 'Conceptos clave', incluye 'Lo que probé antes de encontrar una solución' (sección personal única) y 'Soluciones por presupuesto' (tres niveles). Intro tipo 'ir al grano' (diferente a últimos informativos: dato sorprendente, anécdota personal). Experiencias personales: lámpara de pie con reflejos en pantalla, flexo barato que ocupaba escritorio, BenQ ScreenBar Halo. Compañera Ana en semisótano Madrid (~75 EUR solución). Lector con 6500K todo el día. Fuentes: INSST Guía Técnica RD 486/1997 (500 lux), IBV. Internal links bidireccionales a fatiga-visual-pantalla, productividad-en-casa-entorno-fisico, mi-setup-home-office-2026. Cluster: ambiente. Imagen Pexels #28491194 (Thới Nam Cao, 800px). 8 keywords añadidas. Status: human-review.
**Triggered by:** user

## 2026-04-05 10:30
**Action:** Blog aprobado — Mejor soporte de monitor (brazo articulado) 2026
**Files:** data/content-map.yaml, data/content-queue.yaml
**Summary:** Artículo aprobado por el usuario sin cambios. Status actualizado a approved.
**Triggered by:** user

## 2026-04-05 10:00
**Action:** Blog redactado — Mejor soporte de monitor (brazo articulado) 2026
**Files:** src/content/articulos/mejor-soporte-monitor-brazo-articulado.mdx, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Comparativa de 6 brazos articulados para monitor (27-199 EUR) con ASINs verificados en Amazon.es: ErGear 13-34" (top pick), BONTEC 15-34", HUANUO 17-30", Amazon Basics, ErGear Dual, Ergotron LX. Ángulo: ergonomía específica para teletrabajadores + sección "brazo vs sobremesa" + guía de montaje VESA, no listicle genérico de accesorios gaming. SERP: blogdegaming, PCComponentes, Profesional Review, Klisst, Reddit. ~2500 palabras, 5 FAQs. Estructura variada: incluye "Brazo articulado vs. soporte de sobremesa" y "Guía de montaje y compatibilidad VESA". Intro tipo contraposición/irónica (diferente a monitor: recomendación directa, ratón: dato biomecánico, teclado: ironía). Experiencias personales: montaje ErGear con compañero en IKEA, fisioterapeuta con Ergotron LX. Lector preguntando dual vs individual. Fuente: INSST. Pros/contras asimétricos (5/2, 3/2, 3/3, 4/2, 4/3, 5/2). Internal links a 5 artículos (escritorios, monitor, ergonomía, altura, dolor). Cluster: periféricos. Imagen Pexels #8001032 (Pavel Danilyuk, 800px). 8 keywords añadidas. Status: human-review.
**Triggered by:** user

## 2026-04-04 12:00
**Action:** Blog redactado — Fatiga visual por pantalla: cómo proteger tus ojos
**Files:** src/content/articulos/fatiga-visual-pantalla.mdx, data/content-map.yaml, data/content-queue.yaml, data/topic-clusters.yaml, data/seo-keywords.csv, data/features.yaml, PRODUCTOS.md, logs/changelog.md
**Summary:** Guía informativa sobre fatiga visual digital para teletrabajadores. Ángulo: experiencia real de 7 años frente a pantalla vs artículos clínicos del SERP (admiravision, AAO, creu-blanca, eizo, fernandez-vega). ~1900 palabras, 4 FAQs (variable). Estructura variada: sin sección 'Conceptos clave', incluye sección de mitos (gafas luz azul, modo noche) y guía de configuración de pantalla. Intro tipo 'dato sorprendente' (diferente a últimos informativos: pregunta retórica, hook directo, corrección de creencia). Experiencias personales: visión borrosa 17:00, oftalmóloga, regla 20-20-20 automatizada, compañero gafas azules. Lector con ojos rojos. Fuentes: Academia Americana de Oftalmología, Universidad de Cornell. Internal links a monitor, ergonomía, productividad, mi-setup, altura. Cluster: periféricos. Imagen Pexels #5712122 (Arina Krasnikova, 800px). Nueva feature: salud-visual. 9 keywords añadidas. Status: human-review.
**Triggered by:** user

## 2026-04-03 23:00
**Action:** Reestructurar topic clusters según plan editorial del usuario
**Files:** data/topic-clusters.yaml, data/content-map.yaml, logs/changelog.md
**Summary:** Reemplazada la arquitectura de clusters anterior (3 clusters con pilares informativos) por la del plan editorial del usuario (7 clusters). Nuevos clusters: C1 Sillas (pilar: silla ergonómica), C2 Escritorios (pilar: standing desk eléctrico), C3 Periféricos (pilar: teclado ergonómico), C4 Audio/Vídeo (pilar: auriculares cancelación ruido), C5 Ambiente (pilar: lámpara LED), C6 Productividad (sin pilar, ads RPM), HUB Central (pilar: guía completa home office). Incluye los 47 artículos futuros del plan con status planned. Actualizados todos los cluster assignments en content-map.yaml. Motivación: los pilares deben ser comparativas transaccionales (no informativos), cada cluster debe coincidir con una categoría de producto real, y se necesita un hub central que conecte todos los clusters.
**Triggered by:** user (plan editorial)

## 2026-04-03 22:15
**Action:** Auditoría Ahrefs — correcciones SEO y arquitectura de clusters
**Files:** data/topic-clusters.yaml, data/content-map.yaml, data/content-queue.yaml, src/content/articulos/productividad-en-casa-entorno-fisico.mdx, src/content/articulos/mi-setup-home-office-2026.mdx, src/content/articulos/altura-correcta-escritorio-silla.mdx, src/pages/index.astro, src/pages/sobre-mi.astro, src/pages/[categoria]/index.astro, CLAUDE.md, logs/changelog.md
**Summary:** Correcciones tras auditoría de Ahrefs: 2 enlaces 404 corregidos (email obfuscation de Cloudflare en MDX, link a artículo informativo con ruta de comparativa), meta descriptions de 5 categorías ampliadas a 120-140 chars, meta descriptions de homepage y sobre-mí recortadas a ≤155 chars, schema Organization logo con width/height. Definidos 3 topic clusters (ergonomia-y-salud-postural, accesorios-ergonomicos, escritorio-y-espacio-de-trabajo) con pillar pages asignadas. Todos los artículos mapeados a su cluster en content-map.yaml. 2 artículos pasados de human-review a approved (mi-setup, home-office-500). Fecha de productividad-en-casa-entorno-fisico corregida de 2026-04-14 a 2026-03-30 (fecha real del commit). Añadidos 2 internal links cruzados a categorías de comparativas (monitor, silla) en productividad-en-casa-entorno-fisico. Reglas de prevención añadidas a CLAUDE.md.
**Triggered by:** user (auditoría Ahrefs)

## 2026-04-03 10:00
**Action:** Blog redactado — Altura correcta de escritorio y silla para teletrabajar
**Files:** src/content/articulos/altura-correcta-escritorio-silla.mdx, data/content-map.yaml, data/content-queue.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Guía informativa sobre cálculo de alturas de escritorio y silla según estatura. Ángulo: experiencia real de teletrabajador con fórmulas prácticas y test del codo, vs guías genéricas de tiendas de muebles del SERP. ~2100 palabras, 5 FAQs (variable). Estructura variada: tabla de alturas por estatura, sección de errores comunes, sin sección "Conceptos clave". Intro tipo "pregunta directa" (diferente a últimos informativos: anécdota, contraposición, dato). Experiencias personales: contractura trapecio por 3 cm de desajuste, ajuste fino del FlexiSpot, memorias guardadas para calzado. Anécdota entorno: compañera 160 cm con pies colgando. Lector 192 cm con IKEA MALM. Fuente: INSST guía ergonomía oficina. Internal links a ergonomía, escritorios elevables, standing desk, túnel carpiano, dolor espalda. Imagen Pexels #4974907 (olia danilevich, 800px). Status: human-review.
**Triggered by:** user

## 2026-04-02 21:30
**Action:** Blog redactado — Mejor ratón vertical ergonómico 2026
**Files:** src/content/articulos/mejor-raton-vertical-ergonomico.mdx, data/content-map.yaml, data/content-queue.yaml, data/seo-keywords.csv, PRODUCTOS.md, logs/changelog.md
**Summary:** Comparativa de 6 ratones verticales (18-66 EUR) con ASINs verificados en Amazon.es: Logitech MX Vertical (top pick), Logitech Lift, ProtoArc EM11 NL, Trust Verto, Anker AK-UBA, Perixx PERIMICE-513. Ángulo: experiencia real de 1+ año con MX Vertical, no listicle de medio tech. SERP: Xataka, PCComponentes, Hardzone, Fnac, Reddit. ~2600 palabras, 6 FAQs. Estructura variada: sin sección separada "por qué importa", incluye "Vertical, trackball o ergonómico: cuál te conviene". Intro tipo "dato sorprendente" (diferente a teclado y monitor). Experiencias personales (fisio, adaptación MX Vertical, compañero Madrid con Anker), lector consultor IT con ProtoArc, fuente IBV. Pros/contras asimétricos (6/2, 5/3, 4/4, 4/5, 4/4, 5/2). Internal links a teclado, túnel carpiano, monitor, setup. Imagen Pexels #7151690 (Helena Lopes, 800×533). Status: human-review.
**Triggered by:** user
