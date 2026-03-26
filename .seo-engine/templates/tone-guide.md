# Guia de Tono y Estilo — Tu Espacio de Trabajo

## Principios generales

1. **Profesional pero cercano.** Escribe como un amigo que lleva anos teletrabajando y ha probado de todo, no como un catalogo de oficina.
2. **Especifico, nunca generico.** "Esta silla tiene soporte lumbar ajustable con 4 posiciones y rango de altura de 42-52 cm" > "Esta silla es muy comoda".
3. **Honesto con los inconvenientes.** Si un producto tiene fallos, dilo. La credibilidad se gana con honestidad. Si una silla de 150 EUR no es tan buena como una de 500 EUR, dilo claramente.
4. **Empatico con el teletrabajador.** Entendemos que montar un buen espacio de trabajo puede ser abrumador y caro. Ayudamos a priorizar.
5. **Sin relleno.** Cada frase debe aportar informacion util. Si no aporta, se elimina.

## Voz por tipo de articulo

| Tipo | Voz | Ejemplo |
|------|-----|---------|
| Comparativa | Analitico, experto, basado en datos | "Tras probar 6 sillas en mi despacho, la Ergohuman destaca por..." |
| Guia/Tutorial | Profesor paciente, primera persona | "Yo empece teletrabajando en la mesa del salon y..." |
| Experiencia | Reviewer honesto, admite fallos | "Despues de 6 meses con este escritorio elevable, el motor hace un ruido que..." |
| Setup | Entusiasta practico, inspira sin presumir | "Mi setup no es el mas bonito, pero llevo 3 anos con el y me funciona" |
| Pilar | Enciclopedico pero personal | "Todo lo que he aprendido sobre ergonomia en 5 anos de teletrabajo" |

## Reglas de estilo

### Lenguaje
- Espanol de Espana (no latinoamericano)
- Tuteo (tu, no usted)
- Evitar anglicismos innecesarios (pero "setup", "home office", "hub", "standing desk" son OK cuando no hay equivalente natural)
- Sin emojis en el texto del articulo
- Usar sistema metrico (cm, kg) siempre

### Estructura
- Parrafos cortos (3-4 frases maximo)
- Listas con vinetas para caracteristicas
- Tablas para comparaciones numericas (medidas, precios, peso)
- Negritas para datos clave (precios, medidas, nombres de producto)
- H2 para secciones principales, H3 para subsecciones
- No abusar de H3: si una seccion tiene solo 1 parrafo, no necesita subheading

### SEO
- Keyword principal en: titulo, primer parrafo, un H2, descripcion, slug
- Keywords secundarias de forma natural
- Internal links con anchor text variado y contextual
- No keyword stuffing — si suena forzado, reescribe

### GEO (Generative Engine Optimization — citabilidad por IA)

Las IAs (ChatGPT, Claude, Gemini, Perplexity) citan contenido que es facil de extraer. Estas reglas mejoran la citabilidad sin perjudicar el SEO de Google (de hecho lo refuerzan para featured snippets y passage indexing):

1. **Respuesta directa en las primeras 1-2 frases de cada seccion H2.** No enterrar la respuesta despues de anecdotas o introducciones. Primero el dato/respuesta, despues la narrativa personal.
2. **Datos concretos y especificos.** Precios, medidas, angulos, porcentajes, tiempos. "La SIHOO Doro C300 (~320 EUR) ofrece soporte lumbar dinamico autoajustable" > "Esta silla es muy buena".
3. **Formato estructurado.** Listas, tablas y parrafos cortos con un dato clave por parrafo. Las IAs extraen mejor informacion de estructuras claras.
4. **Afirmaciones con fuente.** Citar fuentes reales (INSST, OMS, IBV, Cornell) con datos verificables. Las IAs prefieren citar contenido que ya incluye referencias autoritativas.
5. **Resumen ejecutivo en la intro.** Cada articulo debe tener una frase-resumen citable en el primer parrafo: la respuesta directa a la pregunta que el titulo plantea, con datos concretos (rango de precios, producto destacado, cifra clave).
6. **No contradecir la respuesta directa con matices excesivos.** Esta bien ser honesto ("no te va a curar nada por si solo"), pero la primera frase debe dar respuesta, no caveats.

**Regla clave:** La respuesta directa al inicio de seccion y la narrativa personal NO son incompatibles. El orden correcto es: respuesta > contexto personal > detalle. Nunca: contexto personal > respuesta.

## E-E-A-T obligatorio

**Cada articulo DEBE incluir al menos uno de estos:**

1. **Experiencia personal** — "Tras usar este monitor 8 horas al dia durante 4 meses..."
2. **Dato verificable** — "Segun un estudio de la Universidad de Cornell sobre ergonomia..."
3. **Metrica del sitio** — "En nuestras comparativas de mas de 30 sillas..."
4. **Referencia experta** — "Los ergonomos recomiendan que la pantalla este a la altura de los ojos..."

Si config.yaml no tiene trust signals suficientes, pedir al usuario antes de publicar.

## Menciones de competidores

- **Siempre respetuoso** — empezar por sus fortalezas
- **Nunca difamar** — "no recomendamos X" esta bien, "X es basura" no
- **Datos verificables** — si mencionas precios o caracteristicas de competidores, deben ser reales
- **Enlazar a su web** cuando sea util para el lector (nofollow)

## CTAs y afiliacion

- **CTA suave, maximo 1 por seccion** — nunca agresivo
- **Transparencia** — disclaimer de afiliados al inicio de comparativas (incluido en layout automaticamente)
- **No presionar** — "Si te interesa, puedes verlo en Amazon" > "COMPRALO YA!"
- **Precio orientativo** — siempre indicar que los precios pueden variar

## Humanizacion (anti-deteccion IA)

**OBLIGATORIO: Leer `templates/humanization-guide.md` antes de escribir o revisar cualquier articulo.**

Resumen de reglas clave:
- **Variar intros** — nunca repetir el mismo patron en articulos consecutivos
- **Experiencia personal** — minimo 2-3 inserciones por articulo
- **Asimetria en listas** — no todos los productos con el mismo numero de pros/contras
- **Romper la estructura** — no seguir siempre el mismo esquema de secciones
- **Honestidad** — si no has probado algo, dilo abiertamente
- **Autoria real** — nombre real, no marca

## Lo que NUNCA hacer

- Inventar datos, precios, ASINs o URLs de productos
- Escribir frases vacias ("en el mercado actual hay muchas opciones...")
- Copiar descripciones de Amazon textualmente
- Poner keyword principal mas de 3-4 veces en un articulo corto
- Escribir articulos sin angulo unico — "mas completo" NO es un angulo
- Usar "sin duda", "sin lugar a dudas", "el mejor del mercado" sin justificacion
- Empezar articulos con "[Tema] es uno de los aspectos mas..." o variantes formulaicas
- Escribir todos los pros/contras con el mismo numero de puntos (simetria perfecta = marcador IA)
- Publicar articulos sin ninguna frase de experiencia personal o declaracion honesta
- Recomendar productos sin mencionar para que tipo de usuario/espacio son adecuados
- Ignorar las medidas del espacio — siempre mencionar dimensiones cuando sean relevantes
