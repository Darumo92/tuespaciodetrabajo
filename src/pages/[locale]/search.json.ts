import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { READY_LOCALES, type Locale } from '@/i18n/locales';
import { pathLocaleSegment } from '@/i18n/routes';

export async function getStaticPaths() {
  return READY_LOCALES
    .filter(locale => locale !== 'es-ES')
    .map(locale => ({ params: { locale: pathLocaleSegment(locale) }, props: { locale } }));
}

export const GET: APIRoute = async ({ props }) => {
  const locale = props.locale as Locale;
  const articulos = await getCollection('articulosI18n', ({ data }) => data.locale === locale);

  const index = articulos.map(a => ({
    titulo: a.data.titulo,
    descripcion: a.data.descripcion,
    slug: a.data.localizedSlug,
    categoria: a.data.tipo === 'informativo' ? 'guides' : a.data.categoriaSlug,
    tipo: a.data.tipo ?? 'comparativa',
    imagen: a.data.imagen ?? null,
    tags: a.data.tags ?? [],
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
