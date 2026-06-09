import type { ClaveTipo } from './tipos';

export interface Valoraciones {
  ergonomia: number | null;
  ajustabilidad: number | null;
  materiales: number | null;
  comodidad: number | null;
  calidadPrecio: number | null;
}

export interface Producto {
  slug: string;
  tipo: ClaveTipo;
  nombre: string;
  marca: string;
  imagen: string;
  imagenAlt: string;
  tramoPrecio: number;
  precioMin: number | null;
  precioMax: number | null;
  valoracion: number | null;
  valoraciones: Valoraciones;
  amazon: { asin: string | null; buscar: string | null };
  webOficial: string | null;
  idealPara?: string;
  veredicto?: string;
  comunidad?: string;
  paraQuienSi: string[];
  paraQuienNo: string[];
  puntosFuertes: string[];
  puntosDebiles: string[];
  fuenteSpecs: string;
  verificadoEn?: string;
  specs: Record<string, unknown> & { tipo: ClaveTipo };
}

export type Direccion = 'mayor' | 'menor';

export function mediaEjesPresentes(v?: Valoraciones): number | null {
  if (!v) return null;
  const vals = [v.ergonomia, v.ajustabilidad, v.materiales, v.comodidad, v.calidadPrecio]
    .filter((n): n is number => n != null);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function notaGlobal(p: Producto): number | null {
  const media = mediaEjesPresentes(p.valoraciones);
  if (media != null) return media;
  if (p.valoracion != null) return Math.round(p.valoracion * 2 * 10) / 10;
  return null;
}

export function ganadoresPorValor(
  items: { slug: string; valor: number | null }[],
  direccion: Direccion
): string[] {
  const conValor = items.filter((i): i is { slug: string; valor: number } => i.valor != null);
  if (conValor.length === 0) return [];
  const mejor = conValor.reduce(
    (m, i) => (direccion === 'mayor' ? Math.max(m, i.valor) : Math.min(m, i.valor)),
    conValor[0].valor
  );
  return conValor.filter((i) => i.valor === mejor).map((i) => i.slug);
}

/** Lee una ruta tipo 'specs.garantiaAnios' o 'tramoPrecio'. Devuelve null si no existe. */
export function getCampo(p: Producto, ruta: string): unknown {
  const val = ruta.split('.').reduce<unknown>((o, k) => {
    if (o != null && typeof o === 'object' && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, p);
  return val === undefined ? null : val;
}

export type ParVs = [string, string];

/**
 * Empareja productos cuyo tramo de precio sea igual o adyacente (|Δtramo| <= 1),
 * priorizando los mejor valorados. Devuelve pares [a,b] con a<b (orden alfabético)
 * para URLs estables. Limita a `max` pares.
 */
export function seleccionarParesVs(productos: Producto[], max: number): ParVs[] {
  const ordenados = [...productos].sort((a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0));
  const pares: ParVs[] = [];
  const vistos = new Set<string>();
  for (let i = 0; i < ordenados.length; i++) {
    for (let j = i + 1; j < ordenados.length; j++) {
      if (pares.length >= max) return pares;
      const a = ordenados[i], b = ordenados[j];
      if (Math.abs(a.tramoPrecio - b.tramoPrecio) > 1) continue;
      const [x, y] = a.slug < b.slug ? [a.slug, b.slug] : [b.slug, a.slug];
      const clave = `${x}|${y}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      pares.push([x, y]);
    }
  }
  return pares;
}

export interface ArticuloLite { slug: string; titulo: string; categoria: string; tipo: string; }
export interface EntradaIndice {
  entidad: 'producto' | 'articulo';
  slug: string;
  titulo: string;
  sub: string;
  tipo: string;
  url: string;
}

export function construirIndiceBusqueda(productos: Producto[], articulos: ArticuloLite[]): EntradaIndice[] {
  const p: EntradaIndice[] = productos.map((x) => ({
    entidad: 'producto', slug: x.slug, titulo: x.nombre, sub: x.marca, tipo: x.tipo,
    url: `/catalogo/${x.tipo}/${x.slug}/`,
  }));
  const a: EntradaIndice[] = articulos.map((x) => ({
    entidad: 'articulo', slug: x.slug, titulo: x.titulo, sub: x.categoria, tipo: x.tipo,
    url: `/${x.categoria}/${x.slug}/`,
  }));
  return [...p, ...a];
}
