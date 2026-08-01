---
name: Plan Recovery Indexacion v2 historico
description: Sprint ejecutado en junio de 2026. Conservado como evidencia; para el estado vigente consultar project_recovery_session_state.md.
type: project
updated: 2026-06-01
---

> **ARCHIVO HISTÓRICO.** No ejecutar las instrucciones de este documento. El cuerpo se conserva como evidencia del sprint de junio de 2026. Estado vigente: `project_recovery_session_state.md`.

# Plan Recovery Indexacion v2

## Decision ejecutiva historica

Cambiar la estrategia ya. No seguir igual otros 14 dias.

La hipotesis "Google aun no ha visto los cambios de home" queda debilitada: GSC confirma que `/` fue recrawleada el `2026-05-31T23:50:04Z`, despues del bloque home -> pillars, y las internas prioritarias siguen en `Rastreada: actualmente sin indexar`.

La lectura actual es:

1. Problema tecnico bloqueante: baja probabilidad.
2. Problema de calidad/confianza site-level: alta probabilidad.
3. Problema de autoridad externa: alta probabilidad.
4. Falta de tiempo: posible, pero no suficiente como plan operativo.

Objetivo del sprint: generar senales nuevas que Google pueda observar y medir en 10-14 dias:

- 3-5 enlaces/menciones externas rastreables en espanol.
- Una URL test informacional mejorada de forma profunda.
- Senales site-level de confianza, autoria, metodologia y transparencia.
- Medicion por GSC URL Inspection, Search Analytics, referrers detectados y estado indexacion.

## Diagnostico

### Senales que apuntan a problema tecnico

Debiles.

- Home indexada.
- Internas inspeccionadas con `INDEXING_ALLOWED`, robots permitido, fetch correcto y canonical propia.
- Googlebot mobile puede rastrear; no hay bloqueo aparente.
- Sitemap y redirects ya auditados como correctos.

Chequeos tecnicos residuales recomendados solo como descarte:

- Verificar que categorias y paginas nuevas site-level quedan en sitemap si son indexables.
- Confirmar que las nuevas paginas de confianza no llevan `noindex`.
- Revisar que el schema de breadcrumbs conserva ultimo item con `item`.
- No tocar CSP/robots/canonical/sitemap config salvo evidencia nueva.

### Senales de calidad/confianza

Fuertes.

- Sitio nuevo afiliado, con historial de cadencia alta y backdating ya corregido.
- Comparativas afiliadas dominan parte del sitio.
- Mejoras editoriales ya fueron recrawleadas en varias URLs sin indexacion.
- Falta una capa visible de metodologia editorial, pruebas, limitaciones y politica de actualizacion.
- Autor existe, pero debe estar mas conectado a cada articulo y a la metodologia.

### Senales de autoridad externa

Fuertes.

- GSC ha detectado muy pocos referrers externos reales.
- `/guias/ergonomia-teletrabajo-postura-correcta/` tiene referrer externo Quora detectado, pero no indexa aun.
- Reddit warmup sin links sirve para cuenta/reputacion, pero no cambia directamente la autoridad rastreable del dominio.

### Senales de que falta tiempo

Moderadas, no suficientes.

- La home fue recrawleada hace poco.
- Algunas internas no han tenido recrawl reciente.
- Google puede tardar dias/semanas en reevaluar sitios nuevos.

Pero esperar sin introducir senales nuevas no maximiza probabilidad de indexacion. El plan v2 debe cambiar input observable.

## URL test principal

URL elegida:

`https://tuespaciodetrabajo.com/guias/ergonomia-teletrabajo-postura-correcta/`

Justificacion:

- Es informacional, no afiliada o mucho menos afiliada que una comparativa.
- Ya ha tenido impresiones historicas y un clic.
- GSC detecta referrer externo de Quora.
- Encaja con E-E-A-T real del autor: teletrabajo, ergonomia, setup, dolor lumbar/cuello, experiencia personal.
- Es una URL mas defendible para enlaces externos no comerciales.
- Si no indexa tras refuerzo externo + trust + mejora profunda, la senal es mas grave que si falla una comparativa afiliada.

No elegir como test principal:

- Comparativa afiliada: mayor riesgo de que Google la clasifique como thin affiliate aunque se mejore.
- Pagina nueva de metodologia: util para trust, pero tardara en acumular enlaces internos/externos y no representa el cluster principal.
- Otra guia: viable, pero ninguna tiene mejor combinacion de referrer externo + tema pilar + bajo riesgo afiliado.

## Bloque A: enlaces externos crawlables

Meta: 3-5 enlaces/menciones rastreables en espanol en 10-14 dias.

### A1. LinkedIn publico del autor

- Prioridad: P0.
- Impacto esperado: medio; confianza de entidad/persona y descubrimiento externo.
- Dificultad: baja.
- Tiempo: 45-60 min.
- URL a enlazar: URL test.
- Angulo: post personal sobre 7 anos teletrabajando y las 5 correcciones ergonomicas que mas cambiaron el dia a dia.
- Rastreable: normalmente si el perfil/post es publico.
- Riesgo spam: bajo si es post personal sin tono SEO.
- Validacion: URL del post accesible sin login o con snippet publico; GSC puede detectar referrer en URL Inspection.
- Metrica esperada: nuevo referrer externo o recrawl de la URL test.

### A2. Quora ES respuesta ampliada

- Prioridad: P0.
- Impacto esperado: medio; Google ya detecto Quora como referrer.
- Dificultad: media.
- Tiempo: 60-90 min.
- URL a enlazar: URL test.
- Angulo: responder una pregunta concreta sobre postura/teletrabajo/silla/monitor, con una respuesta completa y link solo como desarrollo.
- Rastreable: si la respuesta queda publica.
- Riesgo spam: medio si parece link drop; bajo si la respuesta resuelve por si misma.
- Validacion: respuesta visible en incognito; GSC referrer si Google la rastrea.
- Metrica esperada: referrer externo adicional y posible recrawl URL test.

### A3. Medium o Dev.to en espanol

- Prioridad: P1.
- Impacto esperado: medio-bajo SEO directo, medio para entidad/autoria.
- Dificultad: media.
- Tiempo: 90-120 min.
- URL a enlazar: URL test y pagina de metodologia/autoria.
- Angulo: "Lo que aprendi ajustando mi puesto de teletrabajo despues de una lesion lumbar".
- Rastreable: alto.
- Riesgo spam: bajo si el articulo es nativo y no replica el contenido.
- Validacion: URL publica indexable, link visible en HTML.
- Metrica esperada: referrer detectado y/o recrawl.

### A4. Foro espanol nicho

- Prioridad: P1.
- Impacto esperado: medio si el hilo es real y visible.
- Dificultad: media-alta.
- Tiempo: 60-120 min.
- URL a enlazar: URL test solo si encaja; si no, sin link.
- Opciones: Mediavida tecnologia, foros de autonomos/freelance, comunidades de programacion en espanol.
- Angulo: consejo practico sobre setup/postura, link como recurso propio cuando el hilo pida guia.
- Rastreable: variable; validar caso a caso.
- Riesgo spam: medio-alto si cuenta nueva o hilo no pide recursos.
- Validacion: pagina accesible sin login y link renderizado.
- Metrica esperada: referrer detectado si Google rastrea.

### A5. Perfil/directorio legitimo del autor o proyecto

- Prioridad: P2.
- Impacto esperado: bajo-medio; senal de entidad.
- Dificultad: baja-media.
- Tiempo: 30-60 min.
- URL a enlazar: home, pagina Sobre David o metodologia.
- Opciones: about.me ya existe si esta activo; perfil profesional publico; GitHub profile si hay coherencia; directorios de proyectos solo si no son granjas.
- Rastreable: variable.
- Riesgo spam: bajo si es perfil real, alto si directorio basura.
- Validacion: visible sin login, link HTML.
- Metrica esperada: referrer externo a home o pagina de autor.

## Bloque B: confianza / E-E-A-T site-level

Meta: que un evaluador y Google puedan entender quien escribe, por que sabe del tema, como se eligen productos y como se actualiza el contenido.

### B1. Pagina "Sobre David"

- Prioridad: P0.
- Impacto esperado: medio-alto para confianza site-level.
- Dificultad: baja-media.
- Tiempo: 2-3 h.
- Ruta recomendada: mantener/crear `/sobre-mi/` y enlazar desde header/footer/articulos.
- Contenido exacto:
  - Nombre real: David Rubio.
  - Contexto: ingeniero software, 7 anos teletrabajando, Rubi/Barcelona.
  - Experiencia: setup propio, lesion/dolor lumbar 2020 si es coherente con persona, aprendizaje con fisio.
  - Que cubre la web: ergonomia domestica, sillas, escritorios, perifericos, ambiente de trabajo.
  - Que no cubre: diagnostico medico, promesas de curacion, recomendaciones profesionales individualizadas.
  - Setup actual: silla, mesa, monitor, teclado/raton, iluminacion si son datos canonicos.
  - Como contactar: no email plano; enlazar segun regla del proyecto.
- Validacion: pagina indexable, linkada desde footer/header, schema Person o AboutPage si encaja.
- Metrica esperada: recrawl home/sobre-mi; refuerzo de entidad.

### B2. Metodologia editorial

- Prioridad: P0.
- Impacto esperado: alto para percepcion de sitio afiliado.
- Dificultad: media.
- Tiempo: 3-4 h.
- Ruta recomendada: `/metodologia-editorial/`.
- Contenido exacto:
  - Como se decide que temas cubrir.
  - Fuentes usadas: experiencia propia, fichas de fabricante, manuales, reviews de usuarios, normativa/ergonomia cuando aplique.
  - Diferencia entre productos probados, productos analizados por especificaciones y productos descartados.
  - Criterios comunes: ergonomia, ajuste, durabilidad, compatibilidad con pisos pequenos, disponibilidad en Espana, devoluciones.
  - Como se actualizan articulos: cambios reales de producto, disponibilidad, aprendizaje nuevo, correcciones.
  - Que significa `actualizadoEn`: solo cambios sustanciales, no freshness artificial.
  - Politica de errores/correcciones.
- Validacion: enlazada desde footer y desde articulos comparativos/informativos.
- Metrica esperada: nueva pagina rastreada; aumento de confianza interna.

### B3. Metodologia de pruebas de productos

- Prioridad: P0/P1.
- Impacto esperado: alto para comparativas afiliadas.
- Dificultad: media.
- Tiempo: 3-5 h.
- Ruta recomendada: `/como-probamos-productos/`.
- Contenido exacto:
  - Productos probados directamente vs evaluados por documentacion.
  - Que se mide por categoria:
    - Sillas: ajustes, soporte lumbar, asiento, reposabrazos, rango de altura, uso prolongado.
    - Escritorios: estabilidad, rango, ruido, montaje, profundidad, gestion de cables.
    - Monitores: ergonomia, conectividad, soporte VESA, tamano/distancia.
    - Iluminacion: lux aproximado, temperatura, parpadeo percibido, reflejos.
  - Como se tratan precios: no prometer precios fijos; verificar Amazon cuando se actualiza.
  - Como se descartan productos.
  - Limitaciones: no laboratorio, no consejo medico, no todos los productos comprados.
- Validacion: link desde comparativas y pagina Sobre David.
- Metrica esperada: mejor confianza en comparativas, recrawl de paginas enlazadas.

### B4. Aviso de afiliacion visible y humano

- Prioridad: P0.
- Impacto esperado: medio.
- Dificultad: baja.
- Tiempo: 1 h.
- Contenido exacto:
  - "Algunos enlaces son de afiliado. Si compras desde ellos, podemos recibir una comision sin coste extra para ti."
  - "Eso no cambia el precio ni garantiza que recomendemos el producto."
  - "No aceptamos pagos por colocar productos en una posicion concreta."
  - "Cuando no hemos probado un producto directamente, lo indicamos o lo explicamos en metodologia."
- Ubicacion: pagina legal/metodologia y disclosure corto en comparativas.
- Validacion: disclosure visible, no intrusivo, coherente.
- Metrica esperada: confianza, no metrica directa.

### B5. Bloque de autor en articulos

- Prioridad: P1.
- Impacto esperado: medio.
- Dificultad: media si requiere componente.
- Tiempo: 2-4 h.
- Contenido exacto:
  - Foto o avatar real si disponible.
  - "Por David Rubio, ingeniero software y teletrabajador desde 2019".
  - Linea de experiencia relacionada con el tema.
  - Link a `/sobre-mi/` y metodologia.
  - Fecha publicada y fecha actualizada si existe.
- Validacion: presente en articulos, sin ocupar demasiado above-the-fold.
- Metrica esperada: confianza site-level.

## Bloque C: mejora profunda URL test

URL: `/guias/ergonomia-teletrabajo-postura-correcta/`

Meta: convertirla en la pieza mas fuerte y defendible del sitio.

### Cambios exactos

1. Intro
   - Abrir con experiencia concreta de David, no definicion generica de ergonomia.
   - Mencionar que no es consejo medico y que el objetivo es reducir fricciones del puesto de trabajo.
   - Promesa clara: ajuste paso a paso de silla, mesa, monitor, teclado/raton, luz y pausas.

2. Estructura
   - Diagnostico rapido: "si solo tienes 10 minutos, revisa esto".
   - Orden por impacto:
     1. altura silla/mesa
     2. pies y caderas
     3. monitor
     4. teclado/raton
     5. iluminacion
     6. pausas y cambios de postura
   - Seccion "lo que no arregla una guia de ergonomia".
   - Seccion "errores que yo cometi".
   - Checklist final imprimible o resumible.

3. Experiencia propia
   - Usar datos canonicos del autor: 7 anos teletrabajo, Rubi, ingeniero software, episodio lumbar 2020 si aplica.
   - Incluir 2-3 cambios concretos con resultado observable: subir monitor X cm, usar reposapies, cambiar silla/raton, alternar postura.
   - No inventar mediciones; si no existen, plantear "medicion pendiente".

4. Imagenes/fotos
   - Prioridad alta si el usuario puede aportar fotos propias.
   - Minimo ideal: 3 fotos 800px max:
     - vista lateral de postura/monitor
     - detalle teclado/raton
     - detalle pies/reposapies/silla
   - Si no hay fotos: no usar stock generico como sustituto de experiencia; usar diagramas simples solo si aportan.

5. Datos o mediciones
   - Medir y documentar:
     - distancia ojo-monitor aproximada
     - altura superior pantalla respecto a ojos
     - altura mesa/silla si se conoce
     - duracion de bloques sentado/de pie si aplica
   - No presentar como universal; usar como ejemplo.

6. Enlaces internos
   - Linkar a articulos concretos, no categorias.
   - Desde la guia hacia:
     - dolor espalda trabajar casa
     - ajustar silla oficina correctamente
     - mejor silla ergonomica calidad precio
     - mejor escritorio elevable electrico
     - mejor monitor trabajar desde casa
     - mejor raton vertical ergonomico
   - Desde esos articulos de vuelta a la URL test en contexto editorial, no footer.

7. Afiliacion
   - Mantener la URL test informacional y sin CTAs afiliados directos.
   - Si enlaza a comparativas, que sea despues de resolver el problema principal.
   - No meter tabla de productos ni botones Amazon en esta URL.

8. Schema
   - Article + BreadcrumbList ya existente si layout lo hace.
   - FAQ solo si hay preguntas reales y respuestas utiles.
   - HowTo solo si el marcado refleja pasos concretos reales; evitar schema inflado.
   - Añadir `about`/`mentions` si el sistema lo soporta sin inventar entidades.

9. Autor/confianza
   - Bloque autor visible.
   - Link a Sobre David, metodologia editorial y metodologia de pruebas.
   - Nota "revisado/actualizado" solo si se hace revision real.

Validacion:

- Build OK.
- HTML live con cambios.
- URL test linka a paginas de confianza y viceversa.
- Solicitar indexacion manual solo tras deploy.
- Revisar GSC en dia 3-5 y dia 7.

Metrica esperada:

- Recrawl de URL test.
- Nuevos referrers externos.
- Cambio de `Rastreada: actualmente sin indexar` a indexada, o al menos incremento de impresiones si aparece en Search Analytics.

## Bloque D: medicion y umbrales

### Dia 0

Acciones:

- Publicar paginas site-level P0.
- Mejorar URL test.
- Publicar 1-2 enlaces externos iniciales.
- Solicitar indexacion manual de URL test y paginas site-level nuevas tras deploy.

Medir:

- URL Inspection antes/despues: estado, lastCrawlTime, referringUrls.
- Build/deploy live.

### Dia 3-5

Medir:

- URL test: lastCrawlTime.
- Referrers detectados.
- Search Analytics por pagina y query.
- Sitemap descargado o no si se ve en GSC.

Escenarios:

- Google rastrea URL test y no indexa: anotar, no repetir solicitud; completar enlaces externos restantes y revisar si trust pages fueron rastreadas.
- Google no rastrea URL test: reforzar enlaces internos desde home/sobre/metodologia y enviar 1 enlace externo adicional directo.
- Google detecta referrer externo: mantener plan hasta dia 7.

### Dia 7

Medir:

- Estado URL test.
- Estado paginas site-level.
- Estado 3-5 URLs prioritarias.
- Referrers nuevos.

Escenarios:

- Solo indexa URL test: senal positiva; repetir patron en una segunda guia informacional, no comparativa.
- Indexan guias pero no comparativas: reducir temporalmente peso afiliado y reforzar comparativas con metodologia/fotos antes de pedir indexacion.
- Google rastrea varias y no indexa ninguna: pasar a medida agresiva dia 10-14.

### Dia 10-14

Decision:

- Si al menos 1 URL prioritaria indexa: continuar con 1 guia fuerte/semana + enlaces externos, mantener comparativas pausadas.
- Si 3+ URLs indexan: reactivar calendario con guias informacionales primero, no comparativas.
- Si nada indexa y hay recrawls: aplicar reset selectivo.
- Si nada indexa y no hay recrawls: problema de autoridad/descubrimiento; aumentar enlaces externos y revisar GSC/sitemap/manual submit.

Reset selectivo si no hay cambio:

- Reducir exposicion de comparativas afiliadas desde home.
- Poner foco temporal en guias/herramientas no afiliadas.
- Considerar noindex temporal o despublicacion de piezas mas debiles solo si hay evidencia clara y tras revisar una por una.
- No hacer bulk masivo sin poder atribuir efecto.

## Decision editorial historica durante el sprint

Recomendacion clara:

- Pausar todos los articulos nuevos.
- No publicar comparativas afiliadas nuevas.
- No publicar guias nuevas salvo que sean parte directa del sprint y no afiliadas.
- Si se crea algo nuevo, que sean paginas de confianza/metodologia o una herramienta/recurso no afiliado.
- Actualizar solo una URL test de forma profunda.
- Reddit queda secundario: maximo 2-3 comentarios sin link/dia si no consume el bloque P0.

## Orden de ejecucion

1. Crear/mejorar Sobre David.
2. Crear Metodologia editorial.
3. Crear Como probamos productos.
4. Mejorar URL test `ergonomia-teletrabajo-postura-correcta`.
5. Enlazar bidireccionalmente URL test <-> paginas site-level <-> articulos relacionados.
6. Publicar 1-2 enlaces externos crawlables a URL test.
7. Solicitar indexacion manual solo de URL test y paginas nuevas importantes.
8. Medir dia 3-5, dia 7 y dia 10-14.

## Que no hacer ahora

- No publicar articulos nuevos del calendario.
- No publicar comparativas afiliadas nuevas.
- No repetir solicitudes de indexacion sin cambios reales.
- No hacer microretoques diarios esperando que cambie el estado.
- No comprar enlaces.
- No meter links en Reddit con karma <50.
- No hacer schema inflado ni reviews si no hay prueba propia documentada.
- No actualizar `actualizadoEn` en bulk.
- No tocar robots/canonical/sitemap/CSP sin evidencia tecnica nueva.

## Evidencia que cambiaria la opinion

- 3+ URLs prioritarias pasan a indexadas: reactivar calendario gradualmente.
- URL test indexa tras enlaces/trust: repetir patron en otra guia y luego en comparativa.
- Guias indexan pero comparativas no: el problema es mas de afiliacion/calidad comercial que tecnico.
- Referrers externos aparecen pero no hay indexacion tras recrawl: el problema principal es confianza/calidad del contenido/sitio.
- No hay recrawls tras enlaces externos: el problema sigue siendo autoridad/descubrimiento; hay que subir enlaces crawlables y revisar envio sitemap/manual.
- GSC muestra canonical diferente, bloqueo robots, fetch fail o noindex: pivotar a tecnico inmediatamente.
