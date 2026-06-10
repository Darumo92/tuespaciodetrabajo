import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { construirIndiceBusqueda, type Producto, type ArticuloLite } from '@/lib/productos';

export const GET: APIRoute = async () => {
  const prodEntries = await getCollection('productos');
  const productos = prodEntries.map((e) => ({
    slug: e.id.replace(/\.(ya?ml|json)$/, ''),
    ...e.data,
  })) as unknown as Producto[];

  const artEntries = await getCollection('articulos');
  const articulos: ArticuloLite[] = artEntries.map((e) => ({
    slug: e.slug,
    titulo: e.data.titulo,
    categoria: e.data.categoria,
    tipo: e.data.tipo,
  }));

  const indice = construirIndiceBusqueda(productos, articulos);
  return new Response(JSON.stringify(indice), {
    headers: { 'Content-Type': 'application/json' },
  });
};
