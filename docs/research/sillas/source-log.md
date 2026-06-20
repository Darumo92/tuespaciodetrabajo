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
