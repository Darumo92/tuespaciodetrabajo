import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articulos = await getCollection('articulos');
  const sorted = articulos.sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime()
  );

  return rss({
    title: 'Tu Espacio de Trabajo',
    description: 'Guias de compra y comparativas de productos de home office y ergonomia para teletrabajadores',
    site: context.site || 'https://tuespaciodetrabajo.com',
    items: sorted.map(a => ({
      title: a.data.titulo,
      description: a.data.descripcion,
      pubDate: a.data.fecha,
      link: a.data.tipo === 'informativo'
        ? `/guias/${a.slug}/`
        : `/${a.data.categoria}/${a.slug}/`,
      categories: [a.data.categoria, a.data.tipo ?? 'comparativa'],
    })),
    customData: '<language>es</language>',
  });
}
