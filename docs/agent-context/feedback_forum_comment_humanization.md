---
name: Comentarios foros / Reddit / Quora deben pasar test anti-IA y ser coherentes con el OP
description: Regla permanente para TODOS los comentarios en Reddit, Quora, Mediavida, Habitissimo, X, foros y cualquier plataforma social. No es opcional, no caduca, aplica también a paquetes de respuestas pre-generados.
type: feedback
originSessionId: 756302ed-c7eb-46af-8771-2aad4315a99e
---
**Regla:** todo comentario que se redacte para postear en foro o red social DEBE pasar como humano y DEBE responder al post original concreto. Cero genéricos, cero plantillas no adaptadas.

**Why:** el usuario tiene cuenta nueva con karma 2 (Dear_Potato8535). Un solo comentario detectado como IA o como off-topic con respecto al OP = downvote masivo, removal, posible shadowban. Quemada la cuenta = quemado el plan backlinks Tier 1 entero. Además daña reputación del dominio si se asocia el sitio a spam.

## Paso 0 OBLIGATORIO antes de presentar borradores: invocar skill humanizer

**Sin esperar a que el usuario lo pida. Sin excepciones.** Aplica a:
- Comentarios Reddit (cualquier sub, cualquier longitud)
- Respuestas Quora
- Posts/respuestas Mediavida, Habitissimo, Forocoches, X/Twitter, LinkedIn, Dev.to
- Comentarios en otros blogs
- Cualquier copy público que vaya bajo el nombre / la cuenta del usuario

**Flujo correcto:**
1. Redactar borrador(es) interno
2. Invocar `Skill humanizer` con los borradores como input ANTES de mostrar al usuario
3. Aplicar correcciones del humanizer al texto
4. Solo ENTONCES presentar el resultado humanizado al usuario para aprobación/posteo

**Flujo INCORRECTO (no repetir):** presentar borrador "limpio mentalmente" sin pasar por la skill. CLAUDE.md ya lo dice (sección "Humanizer obligatorio antes de publicar"), este feedback lo refuerza: el usuario no debe tener que pedirlo. Si está claro que no se hizo, el usuario perderá tiempo recordándolo y la cuenta perderá ritmo de respuesta.

**How to apply (checklist obligatorio antes de enviar cualquier comentario):**

1. **Leer el post original completo.** Citar 1-2 detalles concretos del OP en la respuesta (su problema concreto, datos que dio, no genérico).
2. **Coherencia persona David Rubio:** 7 años teletrabajando · vive en Rubí (Barcelona) · ingeniero software · lumbar 2020 · fisio · Sihoo M57 → Ergohuman · standing desk Flexispot 2023. NO contradecir nada.
3. **Anti-patrones IA — eliminar siempre:**
   - "En el ámbito de…", "Es importante mencionar que…", "A continuación…", "Espero que esto te ayude"
   - Listas perfectamente simétricas (3 ventajas, 3 desventajas, 3 consejos)
   - Cierres tipo "¡Espero que te sirva!" o "¡Mucho ánimo!"
   - Frases motivacionales genéricas
   - Uso excesivo de adjetivos calificativos por nombre ("excelente silla ergonómica")
   - Estructura H1/H2/H3 markdown en plataformas que no la usan en comentarios cotidianos
4. **Marcadores humanos a meter:**
   - 1 dato medible concreto (€, cm, kg, meses, marcas reales)
   - 1 anécdota/experiencia personal específica (no "yo también lo viví", sí "en agosto 2020 dejé de poder girar el cuello")
   - 1 opinión contraintuitiva o que matice el consenso del subreddit
   - 1 detalle imperfecto (un producto que NO te funcionó, una compra arrepentida, algo que cambiarías)
   - Variación de longitud entre frases (frases cortas + frases largas mezcladas)
   - Coloquialismo natural ES: "vamos", "encima", "al final", "la verdad es que", "y mira que…"
5. **Adaptación obligatoria al OP:**
   - Reabrir el comentario con referencia a SU caso, no con tu introducción genérica
   - Si el OP da datos (presupuesto, m², horas/día), úsalos: tu respuesta debe ser MENOS aplicable a otro hilo
   - Si el OP usa tono informal, no responder con tono manual técnico
6. **Anchor link variado** cuando lleve link: nunca dos comentarios con el mismo formulario tipo "monté una comparativa". Variar: "lo desglosé en", "comparé seis modelos en", "lo escribí desarrollado aquí", "tengo el detalle en", "si te sirve referencia".
7. **Test final pre-envío:** leer el comentario en voz alta. Si suena a artículo/manual → reescribir. Si tiene una sola frase que un humano nativo no diría jamás → reescribir. Si no se podría responder igual a otro hilo similar → reescribir.

**Aplicación a paquetes pre-generados:** los textos de SESION_X_BACKLINKS_PAQUETE.md son **plantillas base**, NO copy-paste literal. Antes de pegar: adaptar primer y último párrafo al OP concreto, intercalar 1-2 detalles que solo apliquen a ESE hilo, romper simetría de listas si la plantilla la tiene.

**Aplica para siempre.** Reddit, Quora, Mediavida, Habitissimo, Forocoches, X, LinkedIn, comentarios en otros blogs, todo. No re-confirmar al usuario en cada respuesta.
