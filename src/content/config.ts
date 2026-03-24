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

export const collections = { articulos };
