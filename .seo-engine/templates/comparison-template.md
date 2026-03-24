# Plantilla de Articulo Comparativo — Tu Espacio de Trabajo

Usa esta plantilla como base para articulos de tipo `comparativa`.
No es rigida: adapta, omite o anade secciones segun el tema.

---

## Frontmatter

```yaml
---
titulo: "[Keyword principal] — max 60 caracteres"
descripcion: "[Keyword + CTA] — max 155 caracteres"
categoria: "sillas" # sillas | escritorios | accesorios | ambiente | audio-video
tipo: "comparativa"
fecha: YYYY-MM-DD
imagen: "/images/articulos/[slug].webp"
imagenAlt: "[Descripcion con keywords]"
destacado: false
tags:
  - "[keyword long-tail 1]"
  - "[keyword long-tail 2]"
  - "[keyword long-tail 3]"
autor: "[NOMBRE REAL]"
faqs:
  - pregunta: "[Pregunta de PAA o natural]"
    respuesta: "[Respuesta concisa 2-3 frases]"
  - pregunta: "[Otra pregunta]"
    respuesta: "[Otra respuesta]"
---
```

## Estructura del articulo

### 1. TopPick (componente)

```mdx
<TopPick
  nombre="[Producto recomendado]"
  imagen="[URL imagen Amazon]"
  precio="~XXX EUR"
  enlaceAmazon="/dp/ASIN"
  razon="[1 frase de por que es el mejor para la mayoria]"
/>
```

### 2. Introduccion (150-250 palabras)

- Keyword principal en la primera frase
- Contexto: por que importa elegir bien este producto para teletrabajar
- **VARIAR el formato** (ver humanization-guide.md):
  - Pregunta directa
  - Anecdota personal del setup
  - Dato sorprendente sobre ergonomia
  - Recomendacion inmediata
  - Problema del lector
- Insercion de experiencia personal (obligatorio)
- Adelantar que vas a analizar X productos

### 3. ComparisonTable (componente)

```mdx
<ComparisonTable productos={[
  {
    nombre: "[Nombre exacto del producto]",
    imagen: "[URL imagen Amazon]",
    puntosFuertes: "[Texto descriptivo de ventajas principales]",
    precio: "~XXX EUR",
    enlaceAmazon: "/dp/ASIN",
    valoracion: 4.5
  },
  // ... mas productos (4-8 por comparativa)
]} />
```

**Campos obligatorios por producto:**
- `nombre`: string — nombre exacto del producto
- `imagen`: string — URL de imagen Amazon (m.media-amazon.com)
- `puntosFuertes`: string — texto descriptivo (NO array, NO campo "caracteristicas")
- `precio`: string — ej: "~150 EUR"
- `enlaceAmazon`: string — URL directa `/dp/ASIN`
- `valoracion`: number — escala 1-5

### 4. Analisis detallado (principal, 800-1500 palabras)

Para cada producto:

#### [Nombre del producto] — [subtitulo descriptivo]

- Descripcion real del producto (2-3 parrafos)
- **Pros** (numero variable, 2-6 puntos)
- **Contras** (numero variable, 1-4 puntos)
- Para quien es ideal (1-2 frases)
- Insercion de experiencia personal si lo has probado, o declaracion honesta si no

**IMPORTANTE:**
- Pros y contras con numero DIFERENTE por producto (asimetria obligatoria)
- No copiar descripcion de Amazon
- Incluir medidas, peso, materiales concretos
- Mencionar para que tipo de espacio/escritorio es adecuado

### 5. Guia de compra (300-500 palabras)

- Criterios para elegir (ergonomia, medidas, presupuesto, espacio disponible)
- Errores comunes al comprar
- Que mirar en las especificaciones
- Insercion de experiencia: "El error que yo cometi fue..."

### 6. Nuestra recomendacion (150-250 palabras)

- Mejor opcion general
- Mejor calidad-precio
- Mejor para espacios pequenos (si aplica)
- Mejor premium (si aplica)
- Enlace a cada producto con AffiliateButton

### 7. FAQs (ya en frontmatter, se renderizan automaticamente)

- 3-7 preguntas (numero variable)
- Basadas en People Also Ask de Google
- Respuestas concisas (2-4 frases)

---

## Notas importantes

- **URLs Amazon**: usar solo `/dp/ASIN`, nunca URLs de busqueda `/s?k=`
- **Tag de afiliado**: NO incluir `?tag=tuespaciodet-21` — los componentes lo anaden solos
- **Imagenes de Amazon**: hotlinking desde `m.media-amazon.com` es OK
- **Precios**: siempre orientativos con `~`, nunca exactos
- **Medidas**: incluir siempre dimensiones (ancho x profundo x alto) cuando sean relevantes
- **Peso maximo**: para sillas, indicar siempre el peso maximo soportado
- **Garantia**: mencionar si el fabricante ofrece garantia extendida
