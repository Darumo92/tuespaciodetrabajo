export const AMAZON_TAG = 'tuespaciodet-21';

export type Lumbar = 'fijo' | 'presion' | 'altura' | 'dinamico' | '5d';
export type Reposabrazos = 'ninguno' | '1d' | '2d' | '3d' | '4d' | 'abatibles';
export type Respaldo = 'malla' | 'espuma' | 'mixto';

export interface Silla {
  slug: string;
  nombre: string;
  marca: string;
  imagen?: string;
  imagenAlt?: string;
  precioAprox: number | null;
  lumbar: Lumbar;
  reposabrazos: Reposabrazos;
  respaldo: Respaldo;
  profundidadRegulable: boolean;
  pesoMaxKg: number | null;
  alturaAsientoMinCm: number | null;
  alturaAsientoMaxCm: number | null;
  reclinacionMaxGrados: number | null;
  garantiaAnios: number | null;
  valoracion: number;
  puntosFuertes: string[];
  puntosDebiles: string[];
  idealPara?: string;
  amazon?: SillaAmazon;
  webOficial?: string | null;
  fuenteSpecs?: string;
  verificadoEn?: string;
}

export interface FiltrosSillas {
  precioMax?: number;
  respaldo?: Respaldo;
  profundidadRegulable?: boolean;
  reposabrazosMin?: number;
  pesoMin?: number;
}

const NIVEL_REPOSABRAZOS: Record<Reposabrazos, number> = {
  ninguno: 0,
  '1d': 1,
  abatibles: 2,
  '2d': 2,
  '3d': 3,
  '4d': 4,
};

export function reposabrazosNivel(r: Reposabrazos): number {
  return NIVEL_REPOSABRAZOS[r] ?? 0;
}

export function filtrarSillas(sillas: Silla[], f: FiltrosSillas): Silla[] {
  return sillas.filter((s) => {
    if (f.precioMax != null && (s.precioAprox == null || s.precioAprox > f.precioMax)) return false;
    if (f.respaldo && s.respaldo !== f.respaldo) return false;
    if (f.profundidadRegulable && !s.profundidadRegulable) return false;
    if (f.reposabrazosMin != null && reposabrazosNivel(s.reposabrazos) < f.reposabrazosMin) return false;
    if (f.pesoMin != null && (s.pesoMaxKg == null || s.pesoMaxKg < f.pesoMin)) return false;
    return true;
  });
}

export interface SillaAmazon {
  asin?: string;
  buscar?: string;
}

export function buildAmazonHref(amazon?: SillaAmazon): string | null {
  if (amazon?.asin) {
    return `https://www.amazon.es/dp/${amazon.asin}?tag=${AMAZON_TAG}`;
  }
  if (amazon?.buscar) {
    const q = encodeURIComponent(amazon.buscar).replace(/%20/g, '+');
    return `https://www.amazon.es/s?k=${q}&tag=${AMAZON_TAG}`;
  }
  return null;
}

export type OrdenSillas = 'precio-asc' | 'precio-desc' | 'valoracion' | 'peso-max';

function numOrInf(n: number | null, dir: 'asc' | 'desc'): number {
  if (n != null) return n;
  return dir === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
}

function cmp(x: number, y: number): number {
  return x === y ? 0 : x < y ? -1 : 1;
}

export function ordenarSillas(sillas: Silla[], orden: OrdenSillas): Silla[] {
  const copia = [...sillas];
  switch (orden) {
    case 'precio-asc':
      return copia.sort((a, b) => cmp(numOrInf(a.precioAprox, 'asc'), numOrInf(b.precioAprox, 'asc')));
    case 'precio-desc':
      return copia.sort((a, b) => cmp(numOrInf(b.precioAprox, 'desc'), numOrInf(a.precioAprox, 'desc')));
    case 'valoracion':
      return copia.sort((a, b) => cmp(b.valoracion, a.valoracion));
    case 'peso-max':
      return copia.sort((a, b) => cmp(numOrInf(b.pesoMaxKg, 'desc'), numOrInf(a.pesoMaxKg, 'desc')));
    default:
      return copia;
  }
}
