import { defineCollection, z } from 'astro:content';

const CATEGORIAS = ['sillas', 'escritorios', 'accesorios', 'ambiente', 'audio-video', 'guias'] as const;
const TIPOS = ['comparativa', 'informativo', 'noticia'] as const;

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

const ejesValoracion = z.object({
  ergonomia: z.number().min(0).max(10).nullable().default(null),
  ajustabilidad: z.number().min(0).max(10).nullable().default(null),
  materiales: z.number().min(0).max(10).nullable().default(null),
  comodidad: z.number().min(0).max(10).nullable().default(null),
  calidadPrecio: z.number().min(0).max(10).nullable().default(null),
}).default({});

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
});

const productos = defineCollection({
  type: 'data',
  schema: z.object({
    tipo: z.enum(['silla']), // ampliar al añadir categorías
    nombre: z.string(),
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
    webOficial: z.string().nullable().default(null),
    idealPara: z.string().optional(),
    veredicto: z.string().optional(),
    comunidad: z.string().optional(),
    paraQuienSi: z.array(z.string()).default([]),
    paraQuienNo: z.array(z.string()).default([]),
    puntosFuertes: z.array(z.string()).default([]),
    puntosDebiles: z.array(z.string()).default([]),
    fuenteSpecs: z.string(),
    verificadoEn: z.string().optional(),
    specs: z.discriminatedUnion('tipo', [specsSilla]),
  }),
});

export const collections = { articulos, productos };
