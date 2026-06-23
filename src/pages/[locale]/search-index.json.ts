import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { READY_LOCALES, type Locale } from '@/i18n/locales';
import { pathLocaleSegment } from '@/i18n/routes';
import { construirIndiceBusqueda, type Producto, type ArticuloLite } from '@/lib/productos';

export async function getStaticPaths() {
  return READY_LOCALES
    .filter(locale => locale !== 'es-ES')
    .map(locale => ({ params: { locale: pathLocaleSegment(locale) }, props: { locale } }));
}

export const GET: APIRoute = async ({ props }) => {
  const locale = props.locale as Locale;
  const prodEntries = await getCollection('productos');
  const productos = prodEntries.map((e) => ({
    slug: e.id.replace(/\.(ya?ml|json)$/, ''),
    ...e.data,
  })) as unknown as Producto[];

  const artEntries = await getCollection('articulosI18n', ({ data }) => data.locale === locale);
  const articulos: ArticuloLite[] = artEntries.map((e) => ({
    slug: e.data.localizedSlug,
    titulo: e.data.titulo,
    categoria: e.data.tipo === 'informativo' ? 'guides' : e.data.categoriaSlug,
    tipo: e.data.tipo,
  }));

  const indice = construirIndiceBusqueda(productos, articulos, locale);
  return new Response(JSON.stringify(indice), {
    headers: { 'Content-Type': 'application/json' },
  });
};
