import type { ClaveTipo, FiltroConfig, TipoConfig } from './tipos';

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
export type ProductoAmazon = Producto['amazon'];
export const AMAZON_TAG = 'tuespaciodet-21';

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

export function tramoTexto(tramo: number): string {
  return '€'.repeat(Math.max(1, Math.min(4, tramo)));
}

export function formatoSpec(valor: unknown, formato?: string): string {
  if (valor == null) return 'n/d';
  if (formato === 'bool') return valor ? 'Sí' : 'No';
  switch (formato) {
    case 'kg': return `${valor} kg`;
    case 'grados': return `${valor}°`;
    case 'anios': return `${valor} años`;
    case 'cm': return `${valor} cm`;
    default: return String(valor);
  }
}

const ETIQUETAS: Record<string, Record<string, string>> = {
  lumbar: { fijo: 'Fijo', presion: 'Ajustable en presión', altura: 'Ajustable en altura', dinamico: 'Dinámico autoajustable', '5d': '5D ajustable' },
  reposabrazos: { ninguno: 'Ninguno', fijo: 'Fijos', '1d': '1D (altura)', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Abatibles' },
  respaldo: { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla + cojín' },
};

export function etiquetaEnum(campo: string, valor: string): string {
  return ETIQUETAS[campo]?.[valor] ?? valor;
}

export function reposabrazosNivel(v: string): number {
  return ({ ninguno: 0, fijo: 1, '1d': 1, '2d': 2, '3d': 3, '4d': 4, abatibles: 2 } as Record<string, number>)[v] ?? 0;
}

const TRANSFORMS: Record<string, (v: unknown) => number> = {
  reposabrazosNivel: (v) => reposabrazosNivel(String(v ?? '')),
};

/** 'specs.pesoMaxKg' -> 'pesomaxkg'. Namespace data-c-<clave> compartido por filtros y ordenaciones. */
export function claveData(campo: string): string {
  const segmento = campo.split('.').pop() ?? campo;
  return segmento.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Valor comparable que la card debe emitir para un filtro (aplica transform / coercion bool). */
export function valorComparacion(p: Producto, filtro: FiltroConfig): string {
  const raw = getCampo(p, filtro.campo);
  if (filtro.transform) {
    const fn = TRANSFORMS[filtro.transform];
    return fn ? String(fn(raw)) : '';
  }
  if (filtro.comparacion === 'check') return raw ? '1' : '0';
  return raw == null ? '' : String(raw);
}

/** Mapa { 'data-c-<clave>': valor } para la card, sobre campos únicos de filtros y ordenaciones. */
export function datosFiltrado(p: Producto, cfg: TipoConfig): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of cfg.filtros) {
    out[`data-c-${claveData(f.campo)}`] = valorComparacion(p, f);
  }
  for (const o of cfg.ordenaciones) {
    const key = `data-c-${claveData(o.campo)}`;
    if (key in out) continue; // ya emitido por un filtro con el mismo campo
    const raw = getCampo(p, o.campo);
    out[key] = raw == null ? '' : String(raw);
  }
  return out;
}

export function buildAmazonHref(amazon?: ProductoAmazon): string | null {
  if (amazon?.asin) {
    return `https://www.amazon.es/dp/${amazon.asin}?tag=${AMAZON_TAG}`;
  }
  return null;
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
    url: x.tipo === 'informativo' ? `/guias/${x.slug}/` : `/${x.categoria}/${x.slug}/`,
  }));
  return [...p, ...a];
}
