import { defineCollection, z } from 'astro:content';

const CATEGORIAS = ['sillas', 'escritorios', 'accesorios', 'ambiente', 'audio-video', 'guias'] as const;
const TIPOS = ['comparativa', 'informativo'] as const;

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

const LUMBAR = ['fijo', 'presion', 'altura', 'dinamico', '5d'] as const;
const REPOSABRAZOS = ['ninguno', 'fijo', '1d', '2d', '3d', '4d', 'abatibles'] as const;
const RESPALDO = ['malla', 'espuma', 'mixto'] as const;

const sillas = defineCollection({
  type: 'data',
  schema: z.object({
    nombre: z.string(),
    marca: z.string(),
    imagen: z.string().optional(),
    imagenAlt: z.string().optional(),
    precioAprox: z.number().nullable(),
    lumbar: z.enum(LUMBAR),
    reposabrazos: z.enum(REPOSABRAZOS),
    respaldo: z.enum(RESPALDO),
    profundidadRegulable: z.boolean(),
    pesoMaxKg: z.number().nullable(),
    alturaAsientoMinCm: z.number().nullable(),
    alturaAsientoMaxCm: z.number().nullable(),
    reclinacionMaxGrados: z.number().nullable(),
    garantiaAnios: z.number().nullable(),
    valoracion: z.number().min(0).max(5),
    puntosFuertes: z.array(z.string()).default([]),
    puntosDebiles: z.array(z.string()).default([]),
    idealPara: z.string().optional(),
    amazon: z.object({
      asin: z.string().optional(),
      buscar: z.string().optional(),
    }).optional(),
    webOficial: z.string().url().nullable().default(null),
    fuenteSpecs: z.string(),
    verificadoEn: z.string(),
  }),
});

export const collections = { articulos, sillas };
