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
  amazonPrimaryMarket?: string;
  mercadosAmazon?: {
    mercado: string;
    asin: string | null;
    disponibilidad: 'available' | 'unknown' | 'unavailable';
    verificadoEn?: string;
  }[];
  oneLinkReady?: boolean;
  webOficial: string | null;
  idealPara?: string;
  veredicto?: string;
  resumenCompra?: {
    mejorPara?: string;
    evitarSi?: string;
    alternativaDirecta?: string;
    decisionRapida?: string;
  };
  metodologia?: string[];
  scoreRationale?: Partial<Record<keyof Valoraciones, string>>;
  fuentes?: {
    tipo: 'oficial' | 'review' | 'comunidad' | 'tienda' | 'manual';
    nombre: string;
    url: string;
    fechaConsulta: string;
  }[];
  limitaciones?: string[];
  alternativas?: { slug: string; motivo: string }[];
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

/** comparación 'en': la card es visible si su valor está en el conjunto seleccionado.
 *  Conjunto vacío = sin filtrar (visible). */
export function pasaEn(cardValue: string, seleccion: string[]): boolean {
  if (seleccion.length === 0) return true;
  return seleccion.includes(cardValue);
}

/** Marcas presentes en el catálogo con su conteo, ordenadas por nº desc y luego alfabético. */
export function opcionesMarca(productos: Producto[]): { valor: string; n: number }[] {
  const conteo = new Map<string, number>();
  for (const p of productos) {
    if (!p.marca) continue;
    conteo.set(p.marca, (conteo.get(p.marca) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([valor, n]) => ({ valor, n }))
    .sort((a, b) => b.n - a.n || a.valor.localeCompare(b.valor));
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

function formatoChip(valor: unknown, formato?: string): string {
  if (!formato) return String(valor);
  if (formato.startsWith('enumLower:')) {
    return etiquetaEnum(formato.slice('enumLower:'.length), String(valor)).toLowerCase();
  }
  if (formato.startsWith('enum:')) {
    return etiquetaEnum(formato.slice('enum:'.length), String(valor));
  }
  return formatoSpec(valor, formato);
}

/** Chips de la card desde cfg.tarjetaChips. nd:true para el fallback de campos null con mostrarSiNulo. */
export function construirChips(p: Producto, cfg: TipoConfig): { texto: string; nd: boolean }[] {
  const out: { texto: string; nd: boolean }[] = [];
  for (const chip of cfg.tarjetaChips) {
    const raw = getCampo(p, chip.campo);
    if (raw == null) {
      if (chip.mostrarSiNulo) out.push({ texto: chip.mostrarSiNulo.etiqueta, nd: true });
      continue;
    }
    out.push({ texto: (chip.prefijo ?? '') + formatoChip(raw, chip.formato), nd: false });
  }
  return out;
}

export function buildAmazonHref(amazon?: ProductoAmazon): string | null {
  if (amazon?.asin) {
    return `https://www.amazon.es/dp/${amazon.asin}?tag=${AMAZON_TAG}`;
  }
  return null;
}

export type ProductCtaKind = 'amazon-product' | 'amazon-search' | 'unavailable';

export interface ProductCtaInput {
  amazon?: ProductoAmazon;
  webOficial?: string | null;
  nombre: string;
  marca?: string;
  disableAmazonSearch?: boolean;
}

export interface ProductCta {
  href: string | null;
  label: string;
  kind: ProductCtaKind;
  sponsored: boolean;
}

export function buildAmazonSearchHref(query?: string | null): string | null {
  const q = query?.trim();
  if (!q) return null;
  return `https://www.amazon.es/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
}

function buildFallbackSearchQuery(marca: string | undefined, nombre: string): string {
  const cleanMarca = marca?.trim();
  const cleanNombre = nombre.trim();
  if (!cleanMarca) return cleanNombre;
  if (cleanNombre.toLocaleLowerCase().startsWith(cleanMarca.toLocaleLowerCase())) {
    return cleanNombre;
  }
  return `${cleanMarca} ${cleanNombre}`.trim();
}

export function buildProductCta(input: ProductCtaInput): ProductCta {
  const productHref = buildAmazonHref(input.amazon);
  if (productHref) {
    return { href: productHref, label: 'Ver precio en Amazon', kind: 'amazon-product', sponsored: true };
  }

  const fallbackQuery = buildFallbackSearchQuery(input.marca, input.nombre);
  const searchHref = input.disableAmazonSearch
    ? null
    : buildAmazonSearchHref(input.amazon?.buscar || fallbackQuery);
  if (searchHref) {
    return { href: searchHref, label: 'Buscar en Amazon', kind: 'amazon-search', sponsored: true };
  }

  return { href: null, label: 'Sin tienda verificada', kind: 'unavailable', sponsored: false };
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
