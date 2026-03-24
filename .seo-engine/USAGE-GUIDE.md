# SEO Engine — Guia de Uso

## Que es el SEO Engine

El directorio `.seo-engine/` contiene la configuracion, datos y plantillas que guian toda la creacion de contenido para tuespaciodetrabajo.com. Es el cerebro editorial del proyecto.

**Regla universal:** Antes de cualquier tarea relacionada con contenido, SEO, keywords, competidores o documentacion, SIEMPRE leer `config.yaml` y los archivos de datos relevantes PRIMERO.

## Estructura de archivos

```
.seo-engine/
  config.yaml              # Configuracion general, autor, trust signals
  data/
    features.yaml          # Registro de categorias/features cubiertas
    competitors.yaml       # Analisis de competidores
    content-map.yaml       # Mapa articulo <-> keyword <-> feature
    content-queue.yaml     # Cola priorizada de ideas de contenido
    seo-keywords.csv       # Keywords con datos SERP
    topic-clusters.yaml    # Arquitectura pilar/cluster
  templates/
    blog-frontmatter.yaml  # Plantilla de frontmatter
    blog-structures.yaml   # Estructuras por tipo de articulo
    tone-guide.md          # Guia de tono y estilo
    humanization-guide.md  # Patrones anti-IA y experiencia personal
    comparison-template.md # Plantilla para comparativas
  logs/
    changelog.md           # Registro de todas las acciones
```

## Workflows principales

### Escribir un articulo

1. Leer config.yaml, features.yaml, content-map.yaml, content-queue.yaml, topic-clusters.yaml, tone-guide.md, humanization-guide.md
2. Elegir tema de la cola (mayor prioridad con status "planned") o por peticion del usuario
3. Verificar canibalizacion: buscar en content-map keywords solapadas
4. Pedir datos SERP reales al usuario (NUNCA usar web search generico)
5. Definir angulo unico desde los gaps del SERP
6. Redactar siguiendo la estructura de blog-structures.yaml
7. Aplicar humanizacion obligatoria (humanization-guide.md)
8. Guardar con status "human-review"
9. Actualizar TODOS los archivos de datos (content-map, features, keywords, queue, clusters, changelog)

### Revisar un articulo

1. Leer el articulo + todos los archivos de datos
2. Evaluar: SEO, canibalizacion, E-E-A-T, cluster, internal linking, angulo unico, humanizacion
3. Generar informe con puntuacion, fortalezas, problemas y recomendaciones

### Auditar el contenido

1. Gaps de cobertura de features
2. Keywords sin articulo asignado
3. Completitud de clusters
4. Canibalizacion de keywords
5. Contenido obsoleto (90+ dias)
6. Gaps de internal linking
7. Gaps de E-E-A-T y humanizacion

### Crear un cluster tematico

1. Disenar paginas desde features + conocimiento del tema
2. Pedir datos SERP para la keyword pilar
3. Asegurar que el pilar incluye TODAS las secciones obligatorias
4. Guardar en topic-clusters.yaml
5. Anadir paginas a content-queue.yaml

### Importar datos SEO

1. Merge en seo-keywords.csv (sin duplicados)
2. Mapear a features
3. Asignar a clusters
4. Recalcular prioridades de la cola
5. Generar nuevas ideas

## Reglas criticas

- **Nunca fabricar datos SERP** — pedir siempre al usuario
- **Nunca publicar automaticamente** — todo queda en "human-review"
- **Nunca borrar datos** — solo anadir o actualizar
- **Registrar todo** en changelog.md
- **Verificar canibalizacion** antes de cada articulo nuevo
- **Respetar linking pilar/cluster** — bidireccional obligatorio
