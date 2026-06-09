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
