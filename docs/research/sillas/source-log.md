# Source Log Sillas

## Jerarquia de fuentes

1. Web oficial del fabricante o manual PDF.
2. Tienda oficial regional o distribuidor autorizado cuando aporte disponibilidad o datos tecnicos.
3. Amazon marketplaces via API/cache para ASIN, imagen, precio y disponibilidad; registrar mercado concreto, no asumir disponibilidad global.
4. Reviews editoriales reconocibles con mediciones o fotos propias.
5. Comunidad: Reddit r/OfficeChairs, foros de ergonomia/oficina, hilos de compradores. Usar solo como consenso, no como fuente de specs.

## Reglas

- No copiar textos de reviews ni fabricantes.
- No usar una afirmacion de comunidad si solo aparece en un comentario aislado.
- No usar precio si no se ha verificado el dia de edicion y el mercado concreto.
- No publicar ficha sin fuente oficial o manual.
- No afirmar disponibilidad global: registrar mercados concretos y fecha de verificacion.
- No inventar ASINs por pais; OneLink solo se activa sobre enlaces Amazon verificables.
- No afirmar "probada" salvo producto real del setup de David.

## Auditoria catalogo actual (2026-06-18)

19 sillas existentes auditadas e incorporadas al backlog con `estado=published`. Hallazgos:

- Todas tienen `fuenteSpecs`, `comunidad` e imagen local presente (sin imagenes rotas).
- **Sin ASIN, premium con CTA solo web oficial** (no OneLink directo): herman-miller-aeron, herman-miller-embody, steelcase-gesture, steelcase-leap-v2, hag-capisco, haworth-fern, autonomous-ergochair-pro.
- **Sin ASIN pero con Amazon search como CTA** (OneLink sobre busqueda): ikea-markus, ikea-jarvfjallet, secretlab-titan-evo, sihoo-m18, sihoo-m57, songmics-obn55bk. Revisar que la busqueda no devuelva resultados irrelevantes (IKEA/Secretlab no se venden directos en Amazon).
- **Con ASIN ES verificado**: durrafy, flexispot-c7-lite, hbada-ergonomica, holludle-ergonomica, sihoo-doro-c300, sihoo-m102c.
- **Fichas pobres (muchos specs null)**: holludle-ergonomica (9 null), autonomous-ergochair-pro (6), hbada-ergonomica (6), secretlab-titan-evo (6).
- **Incidencia a resolver**: hbada-ergonomica apunta a ASIN `B0CH7RBQQ7` (modelo P5 con lumbar/reposabrazos ajustables) pero las specs describen el modelo basico. Decidir: corregir specs a P5 o repuntar ASIN.
- Ningun `asin_by_market` poblado todavia: cobertura multimercado pendiente de verificacion en Tasks 6-9.

## Oleada 1 premium (2026-06-20)

7 fichas premium con fuente oficial de fabricante/tienda (jerarquía 1-2) + reseña reconocida donde aplica:
- Herman Miller Sayl / Mirra 2 / Cosm: hermanmiller.com + store.hermanmiller.com (+ BTOD review en Cosm).
- Steelcase Think: eu.steelcase.com/products/think.
- Haworth Zody: store.haworth.com + haworth.com.
- Humanscale Diffrient Smart: humanscale.com.
- HÅG SoFi: hag-office.com + ficha técnica Flokk (PDF).

Sin ASIN (no se venden en Amazon ES): CTA = webOficial. Specs no confirmadas dejadas en null. verificadoEn 2026-06-20.

## Oleada 2 gama media (2026-06-20)

8 fichas con fuente oficial de fabricante: SIHOO (Doro S300), FlexiSpot (C7, BS11 Pro), Hbada (E3 Pro), Ticova, Nouhaus (Ergo3D), Ergotopia (NextBack, datasheet+manual PDF), COLAMY (ATLAS). Reseñas reconocidas donde aplica (TechSpot en C7). CTA = amazon.buscar; sin ASIN. Specs no confirmadas en null (p.ej. FlexiSpot BS11 Pro pesoMaxKg null por conflicto 350/130 kg). songmics-obg-cloud descartada por falta de fuente oficial.

## Oleada 3 IKEA + gaming (2026-06-20)

8 fichas con fuente oficial: IKEA (FLINTAN, HATTEFJALL, STYRSPEL) via ikea.com/es; Razer (Iskur V2),
Corsair (TC100 Relaxed), Newskill (Takamikura V2), Drift (DR500), Branch (Ergonomic Chair, solo US/CA).
IKEA sin Amazon (webOficial); gaming con amazon.buscar o webOficial. Specs no confirmadas en null.

## Research Bloque B (2026-06-21): 11 candidatas nuevas añadidas

Bloque A agotado. Añadidas 11 candidatas con web oficial fetcheada y specs confirmadas (criterio: marca/modelo aún no en catálogo + fuente oficial localizable + amazon_query plausible):

- Gaming: AndaSeat Kaiser 3 (andaseat.com) y Kaiser 3E, noblechairs ICON (noblechairs.com), Corsair T3 Rush Fabric (corsair.com), Razer Enki (razer.com, webOficial), DXRacer Master (dxracer.com).
- Oficina/premium: Actiu TNK Flex (actiu.com, marca ES), Okamura Sylphy (okamura.com, premium JP, webOficial), Forma5 Dot.Pro (forma5.com, marca ES, webOficial).
- Budget malla: Eureka Onyx (eurekaergonomic.com), Yaheetech Ergonomic Mesh (yaheetech.shop).

Descartes:
- KERDOM: kerdom.com solo vende movilidad/sillas de ruedas, sin web oficial de sillas de oficina; presencia 100% Amazon/retail. Sin fuente oficial localizable -> descartada (regla dura).
- Interstuhl (EVERY/PURE) y Vitra Physix: producto AAA deseable pero web oficial devuelve 403 anti-bot a WebFetch; no fetcheable -> diferidas (reintentar con navegador/Playwright).
- Mfavour (sin web oficial propia) y Eureka OC05 (modelo no localizable; sustituido por Onyx).

## Oleada 4 Bloque B (2026-06-21)

10 fichas publicadas con fuente oficial fetcheada (jerarquía 1-2) + reseñas/comunidad donde aplica:
- Gaming: AndaSeat Kaiser 3 (andaseat.com + TechRadar/Tom's Hardware), noblechairs ICON (noblechairs.com + Tech Advisor/GamingScan), Corsair T3 Rush Fabric (corsair.com), Razer Enki (razer.com, webOficial), DXRacer Master (dxracer.com + ChairsFX/PC Gamer).
- Oficina/premium: Actiu TNK Flex (actiu.com + ficha técnica PDF oficial, marca ES), Okamura Sylphy (okamura.com + think-furniture, premium JP), Forma5 Dot.Pro (forma5.com + think-furniture, marca ES).
- Budget malla: Eureka Onyx (eurekaergonomic.com), Yaheetech Ergonomic Mesh (yaheetech.shop + manuals.plus).

CTA: gaming/budget Amazon ES por amazon.buscar; Razer Enki + contract/premium (Actiu, Okamura, Forma5) por webOficial. Sin ASIN. Specs solo de fuente oficial; fichas con specs no publicadas omiten el campo (estilo casa). Las premium con menos datos públicos (Okamura, Forma5) son las más justas en cobertura, comparables a herman-miller-sayl ya publicada. AndaSeat 3E queda candidate (producir tras Kaiser 3). Imágenes del usuario normalizadas a 800x800 fondo blanco (eureka-onyx llegó con fondo gris, blanqueada con floodfill; 3 webp convertidas a jpg).

## Research oleada 5 (2026-06-22): 14 candidatas nuevas añadidas

Backlog sin candidatas frescas (solo quedaba andaseat-kaiser-3e + songmics descartada). Research de marcas nuevas a partir de pistas de un post de forocoches (oficina/gaming ES), verificando web oficial fetcheable de cada una (criterio: marca/modelo no en catálogo + fuente oficial localizable + amazon_query plausible). 14 añadidas; 10 con specs suficientes para producir en oleada 5, 4 diferidas.

Producibles (fuente oficial fetcheada y specs confirmadas):
- Oficina/premium: Eurotech Ergohuman GEN2 (eurotechseating.com + ergohuman.com, malla iconica), RH Logic 400 (store.flokk.com + factsheet, escandinava 2PP), Sedus black dot (sedus.com, contract aleman dorsokinetic/Sedo-Lift), Giroflex 353 (store.flokk.com, swivel suizo Automatic Move).
- Gaming premium: RECARO Exo (recaro-gaming.com, Made in Germany EN1335/GS), Vertagear SL5000 (vertagear.com, garantia chasis 10 anios).
- Gaming budget/ES: Sharkoon Skiller SGS40 (en.sharkoon.com, asiento XL 150kg EN1335), Quersus VAOS.3 (quersus.com, OPTIMUS SYNCHRON lumbar 2D), Forgeon Spica (pccomponentes.com, marca PcComponentes muy buscada en ES), Trust GXT 714 Ruya (trust.com, chasis madera FSC 150kg).

Diferidas (estado candidate, no producir esta oleada):
- Wilkhahn AT 187/7 (wilkhahn.com): contract aleman Trimension deseable, pero la web da specs numericas escasas (producto muy configurable). Reintentar con brochure/PDF.
- Maxnomic OFFICE-COMFORT (needforseat.com): ficha de producto con specs muy escasas; datos solo en pagina generica de gama.
- AKRacing Masters Series Max (akracing.com): web devuelve HTTP 402 anti-bot a WebFetch; no fetcheable -> diferida.
- Backforce One Plus (backforce.gg, de Interstuhl): web devuelve HTTP 403 anti-bot; no fetcheable -> diferida (datos disponibles en Blue Angel pero pendiente de fuente oficial directa).

CTA esperado: amazon.buscar para Ergohuman, Sharkoon, Vertagear, Trust (venta en Amazon ES); webOficial para RH Logic 400, Sedus, Giroflex, RECARO Exo, Quersus y Forgeon (contract/premium o exclusiva de tienda). Sin ASIN.
