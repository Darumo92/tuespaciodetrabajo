import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const articulos = await getCollection('articulos');

  const index = articulos.map(a => ({
    titulo: a.data.titulo,
    descripcion: a.data.descripcion,
    slug: a.slug,
    categoria: a.data.categoria,
    tipo: a.data.tipo ?? 'comparativa',
    imagen: a.data.imagen ?? null,
    tags: a.data.tags ?? [],
    // Strip MDX imports, components and markdown syntax for plain-text content
    contenido: a.body
      .replace(/^---[\s\S]*?---/, '')
      .replace(/^import\s.+$/gm, '')
      .replace(/<[A-Z][^>]*[\s\S]*?\/>/gm, '')
      .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/gm, '')
      .replace(/[#{*`_]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
