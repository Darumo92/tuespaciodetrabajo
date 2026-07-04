import { defineCollection, z } from 'astro:content';

const CATEGORIAS = ['sillas', 'escritorios', 'accesorios', 'ambiente', 'audio-video', 'guias'] as const;
const TIPOS = ['comparativa', 'informativo', 'noticia'] as const;
const LOCALES_I18N = ['en', 'fr-FR', 'fr-CA', 'fr-BE', 'nl-NL', 'nl-BE', 'de-DE', 'it-IT', 'pl-PL', 'sv-SE'] as const;

const articulos = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    categoria: z.enum(CATEGORIAS),
    tipo: z.enum(TIPOS).default('comparativa'),
    fecha: z.coerce.date(),
    imagen: z.string().optional(),
    imagenAlt: z.string().optional(),
    destacado: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    actualizadoEn: z.coerce.date().optional(),
    autor: z.string().default('David Rubio'),
    faqs: z.array(z.object({
      pregunta: z.string(),
      respuesta: z.string(),
    })).optional(),
  }),
});

const articulosI18n = defineCollection({
  type: 'content',
  schema: z.object({
    locale: z.enum(LOCALES_I18N),
    translationOf: z.string(),
    localizedSlug: z.string(),
    categoriaSlug: z.string(),
    titulo: z.string(),
    descripcion: z.string(),
    categoria: z.enum(CATEGORIAS),
    tipo: z.enum(TIPOS).default('comparativa'),
    fecha: z.coerce.date(),
    imagen: z.string().optional(),
    imagenAlt: z.string().optional(),
    destacado: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    marketNotes: z.array(z.string()).default([]),
    actualizadoEn: z.coerce.date().optional(),
    autor: z.string().default('David Rubio'),
    faqs: z.array(z.object({
      pregunta: z.string(),
      respuesta: z.string(),
    })).optional(),
  }),
});

// Ejes de valoración (0-10). Superset de todas las categorías: cada tipo usa su
// subconjunto (silla: ergonomia/ajustabilidad/materiales/comodidad/calidadPrecio;
// escritorio: velocidad/estabilidad/capacidadCarga/rangoAltura/materiales/calidadPrecio).
// Todo nullable para que una ficha solo rellene los ejes de su tipo.
const ejesValoracion = z.object({
  // Comunes / silla
  ergonomia: z.number().min(0).max(10).nullable().default(null),
  ajustabilidad: z.number().min(0).max(10).nullable().default(null),
  materiales: z.number().min(0).max(10).nullable().default(null),
  comodidad: z.number().min(0).max(10).nullable().default(null),
  calidadPrecio: z.number().min(0).max(10).nullable().default(null),
  // Escritorio elevable
  velocidad: z.number().min(0).max(10).nullable().default(null),
  estabilidad: z.number().min(0).max(10).nullable().default(null),
  capacidadCarga: z.number().min(0).max(10).nullable().default(null),
  rangoAltura: z.number().min(0).max(10).nullable().default(null),
}).default({});

const mercadoAmazon = z.object({
  mercado: z.string(),
  asin: z.string().nullable().default(null),
  disponibilidad: z.enum(['available', 'unknown', 'unavailable']).default('unknown'),
  verificadoEn: z.string().optional(),
});

const specsSilla = z.object({
  tipo: z.literal('silla'),
  lumbar: z.enum(['fijo', 'presion', 'altura', 'dinamico', '5d']),
  respaldo: z.enum(['malla', 'espuma', 'mixto']),
  reposabrazos: z.enum(['ninguno', 'fijo', '1d', '2d', '3d', '4d', 'abatibles']),
  profundidadRegulable: z.boolean().default(false),
  reclinacionMaxGrados: z.number().nullable().default(null),
  pesoMaxKg: z.number().nullable().default(null),
  alturaAsientoMinCm: z.number().nullable().default(null),
  alturaAsientoMaxCm: z.number().nullable().default(null),
  anchoCm: z.number().nullable().default(null),
  fondoCm: z.number().nullable().default(null),
  mecanismo: z.string().nullable().default(null),
  baseMaterial: z.string().nullable().default(null),
  certificacionBifma: z.boolean().nullable().default(null),
  pesoProductoKg: z.number().nullable().default(null),
  garantiaAnios: z.number().nullable().default(null),
  alturaRecomendadaMinCm: z.number().nullable().default(null),
  alturaRecomendadaMaxCm: z.number().nullable().default(null),
  anchoAsientoCm: z.number().nullable().default(null),
  profundidadAsientoMinCm: z.number().nullable().default(null),
  profundidadAsientoMaxCm: z.number().nullable().default(null),
  alturaRespaldoCm: z.number().nullable().default(null),
  reposacabezas: z.enum(['ninguno', 'fijo', 'ajustable']).nullable().default(null),
  asientoMaterial: z.string().nullable().default(null),
  ruedasSueloDuro: z.boolean().nullable().default(null),
  certificacionEn1335: z.boolean().nullable().default(null),
});

const specsEscritorio = z.object({
  tipo: z.literal('escritorio'),
  // Motor y movimiento
  motor: z.enum(['manual', 'simple', 'doble']),
  velocidadMmPorSeg: z.number().nullable().default(null),
  nivelRuidoDb: z.number().nullable().default(null),
  segmentosColumna: z.number().int().nullable().default(null), // 2 o 3 tramos
  // Rango de altura del conjunto (tablero incluido)
  alturaMinCm: z.number().nullable().default(null),
  alturaMaxCm: z.number().nullable().default(null),
  // Carga y estructura
  cargaMaxKg: z.number().nullable().default(null),
  estructuraMaterial: z.string().nullable().default(null), // acero, aluminio…
  pesoProductoKg: z.number().nullable().default(null),
  ruedas: z.boolean().nullable().default(null),
  // Tablero
  tableroIncluido: z.boolean().nullable().default(null),
  tableroMaterial: z.string().nullable().default(null),
  tableroAnchoCm: z.number().nullable().default(null),
  tableroFondoCm: z.number().nullable().default(null),
  tableroGrosorCm: z.number().nullable().default(null),
  // Control y funciones
  pantallaControl: z.enum(['ninguna', 'boton', 'led', 'tactil']).nullable().default(null),
  memorias: z.number().int().nullable().default(null), // nº de posiciones memorizables
  anticolision: z.boolean().nullable().default(null),
  puertoUsb: z.boolean().nullable().default(null),
  // Garantía y certificación
  garantiaAnios: z.number().nullable().default(null),
  certificacionTuv: z.boolean().nullable().default(null),
  certificacionEmc: z.boolean().nullable().default(null),
});

const productos = defineCollection({
  type: 'data',
  schema: z.object({
    tipo: z.enum(['silla', 'escritorio']), // ampliar al añadir categorías
    nombre: z.string(),
    // Nombre corto (marca + modelo) para <title> y comparativas: mantiene el
    // title ≤ 60 caracteres. Fallback a `nombre` si no se define.
    tituloCorto: z.string().optional(),
    marca: z.string(),
    imagen: z.string().default(''),
    imagenAlt: z.string().default(''),
    tramoPrecio: z.number().int().min(1).max(4),
    precioMin: z.number().nullable().default(null),
    precioMax: z.number().nullable().default(null),
    valoracion: z.number().min(0).max(5).nullable().default(null),
    valoraciones: ejesValoracion,
    amazon: z.object({
      asin: z.string().nullable().default(null),
      buscar: z.string().nullable().default(null),
    }).default({}),
    amazonPrimaryMarket: z.string().default('ES'),
    mercadosAmazon: z.array(mercadoAmazon).default([]),
    oneLinkReady: z.boolean().default(false),
    webOficial: z.string().nullable().default(null),
    idealPara: z.string().optional(),
    veredicto: z.string().optional(),
    resumenCompra: z.object({
      mejorPara: z.string().optional(),
      evitarSi: z.string().optional(),
      alternativaDirecta: z.string().optional(),
      decisionRapida: z.string().optional(),
    }).default({}),
    metodologia: z.array(z.string()).default([]),
    scoreRationale: z.object({
      // silla
      ergonomia: z.string().optional(),
      ajustabilidad: z.string().optional(),
      materiales: z.string().optional(),
      comodidad: z.string().optional(),
      calidadPrecio: z.string().optional(),
      // escritorio
      velocidad: z.string().optional(),
      estabilidad: z.string().optional(),
      capacidadCarga: z.string().optional(),
      rangoAltura: z.string().optional(),
    }).default({}),
    fuentes: z.array(z.object({
      tipo: z.enum(['oficial', 'review', 'comunidad', 'tienda', 'manual']),
      nombre: z.string(),
      url: z.string().url(),
      fechaConsulta: z.string(),
    })).default([]),
    limitaciones: z.array(z.string()).default([]),
    alternativas: z.array(z.object({
      slug: z.string(),
      motivo: z.string(),
    })).default([]),
    comunidad: z.string().optional(),
    paraQuienSi: z.array(z.string()).default([]),
    paraQuienNo: z.array(z.string()).default([]),
    puntosFuertes: z.array(z.string()).default([]),
    puntosDebiles: z.array(z.string()).default([]),
    fuenteSpecs: z.string(),
    verificadoEn: z.string().optional(),
    calidadDatos: z.object({
      score: z.number().int().min(0).max(100).nullable().default(null),
      confianza: z.enum(['alto', 'medio', 'bajo']).nullable().default(null),
      camposFaltantes: z.array(z.string()).default([]),
      enriquecidoEn: z.string().nullable().default(null),
    }).optional(),
    // Contenido editorial en inglés. ES vive en los campos base; las specs técnicas
    // son compartidas. Si falta, la ficha EN usa el fallback generado de specs.
    en: z.object({
      nombreComercial: z.string().optional(),
      tituloCorto: z.string().optional(),
      veredicto: z.string().optional(),
      idealPara: z.string().optional(),
      comunidad: z.string().optional(),
      resumenCompra: z.object({
        mejorPara: z.string().optional(),
        evitarSi: z.string().optional(),
        alternativaDirecta: z.string().optional(),
        decisionRapida: z.string().optional(),
      }).optional(),
      puntosFuertes: z.array(z.string()).default([]),
      puntosDebiles: z.array(z.string()).default([]),
      paraQuienSi: z.array(z.string()).default([]),
      paraQuienNo: z.array(z.string()).default([]),
    }).optional(),
    specs: z.discriminatedUnion('tipo', [specsSilla, specsEscritorio]),
  }),
});

export const collections = { articulos, articulosI18n, productos };
