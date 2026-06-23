import type { ClaveTipo, FiltroConfig, TipoConfig } from './tipos';
import { buildAmazonSearchUrl, buildAmazonUrl } from '../i18n/amazon';
import { DEFAULT_LOCALE, type Locale } from '../i18n/locales';
import { localizedPath } from '../i18n/routes';
import { t } from '../i18n/ui';

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

export function tramoTexto(tramo: number, locale: Locale = DEFAULT_LOCALE): string {
  const symbol = locale === DEFAULT_LOCALE ? '€' : '$';
  return symbol.repeat(Math.max(1, Math.min(4, tramo)));
}

export function formatoSpec(valor: unknown, formato?: string, locale: Locale = DEFAULT_LOCALE): string {
  const isEnglish = locale === 'en';
  if (valor == null) return isEnglish ? 'n/a' : 'n/d';
  if (formato === 'bool') return valor ? (isEnglish ? 'Yes' : 'Sí') : 'No';
  const rawText = String(valor);
  const englishRaw: Record<string, string> = {
    aluminio: 'aluminum',
    plastico: 'plastic',
    plástico: 'plastic',
    acero: 'steel',
    nylon: 'nylon',
    poliamida: 'polyamide',
    malla: 'mesh',
    espuma: 'foam',
    tapizado: 'upholstered',
    sincro: 'synchro',
    basculante: 'tilt',
    multibloqueo: 'multi-lock',
  };
  switch (formato) {
    case 'kg': return `${valor} kg`;
    case 'grados': return `${valor}°`;
    case 'anios': return isEnglish ? `${valor} year${Number(valor) === 1 ? '' : 's'}` : `${valor} años`;
    case 'cm': return `${valor} cm`;
    default: return isEnglish ? englishRaw[rawText.toLowerCase()] ?? rawText : rawText;
  }
}

const ETIQUETAS: Record<Locale | 'fallback', Record<string, Record<string, string>>> = {
  'es-ES': {
    lumbar: { fijo: 'Fijo', presion: 'Ajustable en presión', altura: 'Ajustable en altura', dinamico: 'Dinámico autoajustable', '5d': '5D ajustable' },
    reposabrazos: { ninguno: 'Ninguno', fijo: 'Fijos', '1d': '1D (altura)', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Abatibles' },
    respaldo: { malla: 'Malla', espuma: 'Espuma', mixto: 'Malla + cojín' },
  },
  en: {
    lumbar: { fijo: 'Fixed', presion: 'Pressure-adjustable', altura: 'Height-adjustable', dinamico: 'Dynamic self-adjusting', '5d': 'Adjustable 5D' },
    reposabrazos: { ninguno: 'None', fijo: 'Fixed', '1d': '1D height', '2d': '2D', '3d': '3D', '4d': '4D', abatibles: 'Flip-up' },
    respaldo: { malla: 'Mesh', espuma: 'Foam', mixto: 'Mesh + cushion' },
  },
  'fr-FR': {},
  'fr-CA': {},
  'fr-BE': {},
  'nl-NL': {},
  'nl-BE': {},
  'de-DE': {},
  'it-IT': {},
  'pl-PL': {},
  'sv-SE': {},
  fallback: {},
};

export function etiquetaEnum(campo: string, valor: string, locale: Locale = DEFAULT_LOCALE): string {
  return ETIQUETAS[locale]?.[campo]?.[valor] ?? ETIQUETAS[DEFAULT_LOCALE][campo]?.[valor] ?? valor;
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
    .sort((a, b) => b.n - a.n || a.valor.localeCompare(b.valor, 'es'));
}

/** Nº de productos con dato no nulo ni vacío para una ruta de campo. */
export function cuentaConDato(productos: Producto[], campo: string): number {
  return productos.reduce((acc, p) => {
    const v = getCampo(p, campo);
    return acc + (v != null && v !== '' ? 1 : 0);
  }, 0);
}

/** Filtra los filtros a renderizar: oculta los que tienen < min productos con dato,
 *  salvo los ids en siempreVisibles. */
export function filtrosVisibles(
  filtros: FiltroConfig[],
  productos: Producto[],
  min: number,
  siempreVisibles: string[]
): FiltroConfig[] {
  return filtros.filter(
    (f) => siempreVisibles.includes(f.id) || cuentaConDato(productos, f.campo) >= min
  );
}

/** minúsculas + sin diacríticos + recortado, para comparar búsquedas. */
export function normalizaTexto(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** true si la query (normalizada) aparece como substring en alguno de los campos. Query vacía = true. */
export function coincideBusqueda(query: string, ...campos: string[]): boolean {
  const q = normalizaTexto(query);
  if (!q) return true;
  return campos.some((c) => normalizaTexto(c).includes(q));
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

function formatoChip(valor: unknown, formato?: string, locale: Locale = DEFAULT_LOCALE): string {
  if (!formato) return String(valor);
  if (formato.startsWith('enumLower:')) {
    return etiquetaEnum(formato.slice('enumLower:'.length), String(valor), locale).toLowerCase();
  }
  if (formato.startsWith('enum:')) {
    return etiquetaEnum(formato.slice('enum:'.length), String(valor), locale);
  }
  return formatoSpec(valor, formato, locale);
}

/** Chips de la card desde cfg.tarjetaChips. nd:true para el fallback de campos null con mostrarSiNulo. */
export function construirChips(p: Producto, cfg: TipoConfig, locale: Locale = DEFAULT_LOCALE): { texto: string; nd: boolean }[] {
  const out: { texto: string; nd: boolean }[] = [];
  for (const chip of cfg.tarjetaChips) {
    const raw = getCampo(p, chip.campo);
    if (raw == null) {
      if (chip.mostrarSiNulo) out.push({ texto: locale === 'en' ? chip.mostrarSiNulo.etiquetaEn ?? 'n/a' : chip.mostrarSiNulo.etiqueta, nd: true });
      continue;
    }
    const prefix = locale === 'en' ? chip.prefijoEn ?? chip.prefijo ?? '' : chip.prefijo ?? '';
    out.push({ texto: prefix + formatoChip(raw, chip.formato, locale), nd: false });
  }
  return out;
}

export function buildAmazonHref(amazon?: ProductoAmazon, locale: Locale = DEFAULT_LOCALE): string | null {
  if (amazon?.asin) {
    return buildAmazonUrl({ href: `/dp/${amazon.asin}`, locale });
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
  locale?: Locale;
}

export interface ProductCta {
  href: string | null;
  label: string;
  kind: ProductCtaKind;
  sponsored: boolean;
}

export function buildAmazonSearchHref(query?: string | null, locale: Locale = DEFAULT_LOCALE): string | null {
  const q = query?.trim();
  if (!q) return null;
  return buildAmazonSearchUrl({ query: q, locale });
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
  const locale = input.locale ?? DEFAULT_LOCALE;
  const ui = t(locale);
  const productHref = buildAmazonHref(input.amazon, locale);
  if (productHref) {
    const label = locale === DEFAULT_LOCALE ? 'Ver precio en Amazon' : ui.commerce.viewOnAmazon;
    return { href: productHref, label, kind: 'amazon-product', sponsored: true };
  }

  const fallbackQuery = buildFallbackSearchQuery(input.marca, input.nombre);
  const searchHref = input.disableAmazonSearch
    ? null
    : buildAmazonSearchHref(input.amazon?.buscar || fallbackQuery, locale);
  if (searchHref) {
    return { href: searchHref, label: ui.commerce.searchAmazon, kind: 'amazon-search', sponsored: true };
  }

  return { href: null, label: ui.commerce.unavailable, kind: 'unavailable', sponsored: false };
}

/**
 * Recorta un texto para usarlo como meta description, respetando el límite
 * recomendado (~155 chars). Corta en el último espacio y añade elipsis.
 */
export function recortarMeta(texto: string, max = 155): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(' ');
  return `${corte.slice(0, ultimoEspacio > 0 ? ultimoEspacio : max).trimEnd()}…`;
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

export function localizedTipoSlug(tipo: string, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === 'en' && tipo === 'silla') return 'chairs';
  return tipo;
}

export function sourceTipoSlug(localizedTipo: string, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === 'en' && localizedTipo === 'chairs') return 'silla';
  return localizedTipo;
}

export function catalogPath(locale: Locale = DEFAULT_LOCALE, tipo?: string): string {
  const base = locale === DEFAULT_LOCALE ? ['catalogo'] : ['catalog'];
  return localizedPath(locale, tipo ? [...base, localizedTipoSlug(tipo, locale)] : base);
}

export function productPath(producto: Pick<Producto, 'tipo' | 'slug'>, locale: Locale = DEFAULT_LOCALE): string {
  return localizedPath(locale, [
    locale === DEFAULT_LOCALE ? 'catalogo' : 'catalog',
    localizedTipoSlug(producto.tipo, locale),
    producto.slug,
  ]);
}

export function comparePath(tipo: string, par = '', locale: Locale = DEFAULT_LOCALE): string {
  const segments = [
    locale === DEFAULT_LOCALE ? 'comparar' : 'compare',
    localizedTipoSlug(tipo, locale),
    par,
  ].filter(Boolean);
  return localizedPath(locale, segments);
}

export function localizedProductName(p: Pick<Producto, 'nombre' | 'marca'>, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === DEFAULT_LOCALE) return p.nombre;
  return p.nombre
    .replace(/\bSilla de Oficina Ergonomica de Malla\b/gi, 'Mesh Ergonomic Office Chair')
    .replace(/\bSilla de Oficina Ergonómica de Malla\b/gi, 'Mesh Ergonomic Office Chair')
    .replace(/\bSilla de Oficina\b/gi, 'Office Chair')
    .replace(/\bSilla Ergonómica\b/gi, 'Ergonomic Chair')
    .replace(/\bSilla ergonómica\b/gi, 'Ergonomic Chair')
    .replace(/\bcon reposacabezas\b/gi, 'with Headrest')
    .replace(/\s+/g, ' ')
    .trim();
}

function productNameWithBrand(p: Producto, locale: Locale = DEFAULT_LOCALE): string {
  const name = localizedProductName(p, locale);
  return name.toLocaleLowerCase().startsWith(p.marca.toLocaleLowerCase()) ? name : `${p.marca} ${name}`;
}

export function localizedProductMeta(p: Producto, locale: Locale = DEFAULT_LOCALE): { title: string; description: string; h1: string } {
  if (locale === DEFAULT_LOCALE) {
    const description = p.veredicto ? recortarMeta(p.veredicto) : `Análisis de ${p.nombre}: specs verificadas y valoración por ejes.`;
    return {
      title: `${p.nombre} — análisis y specs | Tu Espacio de Trabajo`,
      description,
      h1: p.nombre,
    };
  }

  const back = getCampo(p, 'specs.respaldo');
  const arms = getCampo(p, 'specs.reposabrazos');
  const maxWeight = getCampo(p, 'specs.pesoMaxKg');
  const warranty = getCampo(p, 'specs.garantiaAnios');
  const name = localizedProductName(p, locale);
  const brandedName = productNameWithBrand(p, locale);
  const bits = [
    back ? `${etiquetaEnum('respaldo', String(back), locale).toLowerCase()} back` : null,
    arms ? `${etiquetaEnum('reposabrazos', String(arms), locale)} armrests` : null,
    maxWeight ? `supports ${maxWeight} kg` : null,
    warranty ? `${warranty}-year warranty` : null,
  ].filter(Boolean);
  const detail = bits.length ? `: ${bits.join(', ')}` : '';
  return {
    title: `${name} Specs | Chair Database`,
    description: recortarMeta(`${brandedName} review with verified specs${detail}. Compare ergonomics, adjustability, comfort and buying options.`),
    h1: `${name} review and specs`,
  };
}

export function construirIndiceBusqueda(productos: Producto[], articulos: ArticuloLite[], locale: Locale = DEFAULT_LOCALE): EntradaIndice[] {
  const p: EntradaIndice[] = productos.map((x) => ({
    entidad: 'producto', slug: x.slug, titulo: x.nombre, sub: x.marca, tipo: x.tipo,
    url: productPath(x, locale),
  }));
  const a: EntradaIndice[] = articulos.map((x) => ({
    entidad: 'articulo', slug: x.slug, titulo: x.titulo, sub: x.categoria, tipo: x.tipo,
    url: x.tipo === 'informativo'
      ? localizedPath(locale, [locale === DEFAULT_LOCALE ? 'guias' : 'guides', x.slug])
      : localizedPath(locale, [x.categoria, x.slug]),
  }));
  return [...p, ...a];
}
