# Proyecto: Catálogo de escritorios elevables

Estado vivo del catálogo estructurado de escritorios elevables (mismo nivel que las
77 fichas de sillas). Retomar desde aquí entre sesiones. Última actualización: 2026-07-02.

## Objetivo
50-100 fichas de escritorios elevables en `src/content/productos/*.yaml`, bilingües
ES/EN, SEO rico (Product schema con specs, rating, oferta cuando haya precio verificado).

## Reglas fijas (no negociables)
- Bilingüe: prosa editorial en ES base + bloque `en:` paralelo. Nunca un idioma sin el otro.
- Specs técnicas COMPARTIDAS en `specs:` (un solo sitio, no duplicadas por idioma).
- Precio: verificar en Amazon.es o dejar `null`. Nunca inventar. Marcar fuente de cada spec.
- No tocar el patrón i18n de artículos (`articulosI18n/`): esto es catálogo de producto (yaml).

## FASE 0 — Diseño de schema ✅ COMPLETA (2026-07-02)
- **Set de valoraciones cerrado (6 ejes):** `velocidad`, `estabilidad`, `capacidadCarga`,
  `rangoAltura`, `materiales`, `calidadPrecio`. (Elegido plan completo; usuario ausente al confirmar.)
- **`src/content/config.ts`:** `tipo` enum admite `'escritorio'`; `ejesValoracion` y
  `scoreRationale` ampliados a superset (silla + escritorio, todo nullable/opcional, no rompe
  sillas); nuevo `specsEscritorio` en la `discriminatedUnion('tipo', [...])`.
- **`scripts/calidad-datos.mjs`:** pesos y ejes ramificados por `data.tipo`
  (`PESOS_SPEC_ESCRITORIO`, `EJES_POR_TIPO`). Sillas sin regresión (media 74.0 igual).
- **Plantilla:** `docs/agent-context/reference_escritorio_ficha_template.yaml`.

### Campos de `specsEscritorio`
`motor` (manual|simple|doble, OBLIGATORIO), `velocidadMmPorSeg`, `nivelRuidoDb`,
`segmentosColumna`, `alturaMinCm`, `alturaMaxCm`, `cargaMaxKg`, `estructuraMaterial`,
`pesoProductoKg`, `ruedas`, `tableroIncluido`, `tableroMaterial`, `tableroAnchoCm`,
`tableroFondoCm`, `tableroGrosorCm`, `pantallaControl` (ninguna|boton|led|tactil),
`memorias`, `anticolision`, `puertoUsb`, `garantiaAnios`, `certificacionTuv`, `certificacionEmc`.

## FASE 1 — Lote 1 (cola prioritaria) ✅ COMPLETA (2026-07-02)
8 fichas creadas (2 subagentes Sonnet en paralelo), media calidad 69.1, confianza "medio":
`flexispot-ec5-pro` (69) · `flexispot-e1-pro` (69) · `flexispot-e7` (76) ·
`maidesite-el2-pro-art` (68) · `sanodesk-qs-plus` (66) · `ergear-140x70` (58) ·
`jummico-140x60` (70) · `ikea-bekant` (77, descatalogado).
- **Precios: 0 verificados** (Amazon.es bloqueó fetch, error 500). `precioMin/Max: null`,
  `tramoPrecio` estimado por gama. Pendiente pasada de verificación de precios (script amazon-lookup o manual).
- Faltan specs recurrentes en varias: `nivelRuidoDb`, `pesoProductoKg`, `tableroGrosorCm`,
  `segmentosColumna`, certificaciones → subir score en pasada de enriquecido posterior.
- `imagen: ""` en las 8 (sin imágenes aún).

## Lista de modelos candidatos (lotes 3-7)
Ver `plan_escritorios_modelos_candidatos.md` (recopilación 2026-07-06 de foros +
comparativas ES/int). Lote 3 = best-sellers Amazon.es de volumen (Devoko 120x60,
SONGMICS LSD, Maidesite T2 Pro Plus, Duronic TM00, ErGear 120x60).

## FASES 2-N — Research + creación de fichas ⬜ PENDIENTE
- Batches de 5-8 escritorios por subagente (general-purpose, run_in_background donde paralelice).
- Por producto: specs reales (motor, velocidad, rango altura, carga, dimensiones+grosor tablero,
  memorias, anticolisión, garantía, peso, materiales) desde fuentes oficiales/tiendas. Nunca inventar.
- Tras cada batch: `node scripts/calidad-datos.mjs --write <slugs>` + `node scripts/validate-productos.mjs`.
- Commit por fase (no un commit gigante al final).

### Cola prioritaria (ya mencionados en artículos → no perder cobertura indexada)
FlexiSpot EC5 PRO · FlexiSpot E1 PRO · FlexiSpot E7 · Maidesite EL2 Pro Art ·
SANODESK QS+ · ErGear 140x70 · JUMMICO 140x60 · IKEA Bekant.
Artículos fuente: `mejor-escritorio-elevable-electrico.mdx`, `ikea-bekant-vs-flexispot-e7.mdx`.

### Progreso fichas
- Creadas: 31 / (objetivo 50-100).
  - Lote 8 premium/editorial (2, 2026-07-08, media calidad 78.5): specs de oficiales/reseñas.
    `secretlab-magnus-pro` (80, metálico gestión cables magnética; sucesor Magnus Evo 2025 → sin Amazon, precio tienda),
    `ergotopia-desktopia-pro-x` (77, premium alemán OLED/9 memorias/7 años, Amazon.es).
    **Datos rellenados 2026-07-08**: ergotopia (B09ZYF6NRK, 979€), secretlab-magnus-pro (B0G1SCVHQ7, 1039€
    — sí está en Amazon.es). Ambas con imagen.
  - Lote 7 IKEA (3, 2026-07-08, media calidad 65.0): specs+precio de IKEA.es (público, NO Amazon → asin null).
    `ikea-idasen` (69, eléctrico app Bluetooth 63-127cm/70kg, 579€), `ikea-trotten` (69, manual manivela 50kg, 189€),
    `ikea-mittzon` (57, doble motor 2 memorias/detección colisión, 379€; IKEA no publica carga/velocidad → null).
    **Pendiente**: imágenes (de IKEA.es; precio ya puesto, sin ASIN por no estar en Amazon).
  - Lote 6 (3, 2026-07-08, media calidad 67.0): marcas secundarias Amazon.es, specs de oficiales/reseñas.
    `costway-120x60` (77, completo 1 motor 4 memorias/USB/anticol 9 niveles), `desktronic` (63, estructura
    doble motor pantalla táctil/USB-C), `fezibo-l-shape` (61, forma de L esquina doble motor — único en L).
    HOMALL **saltado** (datos insuficientes). **Datos Amazon.es rellenados 2026-07-08**: costway (B0DGG91LBG, 150€),
    fezibo-l-shape (B0B9GV9HP3, 399.99€), desktronic (B08XNVZ3B3, 249.99€ — marco pantalla táctil). Las 3 con imagen.
  - Lote 5 (2, 2026-07-08, media calidad 87.0): `maidesite-t1-pro` (94, marco 1 motor 100kg/USB-C 18W/10 años),
    `maidesite-sn1` (80, completo doble motor 80kg/4 memorias/3 tamaños). Specs de fuentes oficiales/reseñas.
    S2 Pro Plus **saltado**: = marco T2 Pro Plus + tablero → duplicaría `maidesite-t2-pro-plus`.
    **Datos Amazon.es rellenados 2026-07-08**: sn1 (B0B4JQMYGK, precio no disponible → null), t1-pro (B08DXZ6JJ5, 199.99€). Ambas con imagen.
  - Lote 4 (4, 2026-07-08, media calidad 86.3): FlexiSpot resto de gama, specs de fuentes oficiales/reseñas.
    `flexispot-e7-pro` (94, doble motor autobloqueo 50mm/s/180kg/TÜV/10 años), `flexispot-ec5-plus` (87,
    doble motor 3 etapas patas T 120kg), `flexispot-comhar-eg8` (83, todo-en-uno vidrio+cajón+USB, motor único),
    `flexispot-e7q` (81, Odin 4 patas/4 motores, carga hasta 200kg; motor='doble' por límite enum).
    **Datos Amazon.es rellenados 2026-07-08**: ec5-plus (B0FDPSYQ9Y, 399.99€), comhar-eg8 (B08PFH81J6, 299.99€),
    e7q (B0C7ZK4HTQ, 799.99-989.98€). E7 Pro sin ASIN (en Amazon.es solo hay E7 no Pro) → `amazon.buscar`,
    precio 369.99€ (sin tablero) - 499.98€ (con tablero). Las 4 con imagen.
  - Lote 3 (5, 2026-07-06, media calidad 72.6): `maidesite-t2-pro-plus` (86, doble motor 160kg/10 años),
    `devoko-120x60` (72), `ergear-120x60` (72), `songmics-lsd132` (66), `duronic-tm00` (66, manual/manivela).
    Specs de fuentes oficiales/reseñas. **Datos Amazon.es rellenados 2026-07-08** (usuario): ASIN+precio+imagen
    en devoko (B0CKVPFSTD, 114€), songmics (B0CV4W77FK, 95.99€), maidesite-t2-pro-plus (B087JF3B5S, 339.99€),
    ergear (B0D9MGDDHD, 109.99€). Duronic TM00 no está en Amazon.es → `asin: null` + `amazon.buscar`, precio 214.99€
    (imagen sí subida). Las 5 fichas con imagen. Devoko corregido a variante real del ASIN (73-118cm, 2 memorias, USB no confirmado).
    API Amazon Creators sigue dando 403 AssociateNotEligible (revalidado 2026-07-08) → datos los aporta el usuario.
  - Lote 1 (7, calidad subida a media 82 el 2026-07-03): `flexispot-ec5-pro`, `flexispot-e1-pro`,
    `flexispot-e7`, `maidesite-el2-pro-art`, `sanodesk-qs-plus`, `ergear-140x70`, `jummico-140x60`.
  - Lote 2 (5, 2026-07-03, media calidad 94): `flexispot-e8` (98), `flexispot-e5` (94),
    `maidesite-t2-pro` (94), `sanodesk-e1-pro` (94, estructura dual TÜV), `fezibo-140x60` (82, completo con cajones).
    Datos Amazon.es (precio/ASIN/título/imagen) los aporta el usuario; specs de oficiales/reseñas, nunca inventadas.
  - Nota: `calidad-datos.mjs` ya no penaliza campos `tablero*` cuando `tableroIncluido:false` (dato N/A = completo).

## FASE FINAL — Integración ⬜ PENDIENTE
Acoplamientos silla→escritorio a resolver (diferidos aquí en FASE 0 a propósito):
- `src/lib/productos.ts`: `Valoraciones` interface + `mediaEjesPresentes` (L7-13, 91-97)
  promedian solo ejes de silla → escritorios devuelven `null` y `notaGlobal` cae a `valoracion*2`.
  Ampliar a promedio genérico de ejes presentes o por tipo.
- `src/lib/productos.ts`: `localizedTipoSlug`/`sourceTipoSlug` (L439-447) solo mapean
  `silla↔chairs`. Decidir slug EN de escritorio (p.ej. `standing-desks`) y añadir mapping.
- `src/lib/tipos.ts`: `TipoConfig` (filtros/chips/ordenaciones) — crear config para escritorio.
- Migrar los 3 artículos de escritorios de `ComparisonTable` inline al catálogo estructurado.
- `astro build` limpio + recalcular calidad + revisar fichas con score bajo.

## Cómo retomar
1. Leer este doc + `reference_escritorio_ficha_template.yaml`.
2. Coger siguiente lote de la cola, research, crear yaml, `--write` calidad, validar.
3. Actualizar "Progreso fichas" y commitear el lote.
