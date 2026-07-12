import { localizedProductMeta, localizedProductName, type Producto } from '../productos';
import type { SelectorLocale } from './schema';

export interface SelectorProductPayload extends Pick<Producto,
  | 'slug'
  | 'tipo'
  | 'marca'
  | 'imagen'
  | 'tramoPrecio'
  | 'valoracion'
  | 'valoraciones'
  | 'calidadDatos'
  | 'specs'
> {
  locale?: SelectorLocale;
  nombre: string;
  imagenAlt: string;
  veredicto?: string;
  idealPara?: string;
  limitaciones?: string[];
  paraQuienSi: string[];
  paraQuienNo: string[];
  puntosFuertes: string[];
  puntosDebiles: string[];
}

export interface SelectorPayloadOffer {
  priceAmount: number;
  currency: string;
  sourceUrl?: string;
  url?: string;
  seller?: string;
}

export function projectSelectorProduct<Locale extends SelectorLocale>(
  product: Producto,
  locale: Locale,
): SelectorProductPayload & { locale: Locale; limitaciones: string[] } {
  const isEn = locale === 'en';
  const localizedVerdict = isEn
    ? product.en?.veredicto?.trim() || localizedProductMeta(product, locale).description
    : product.veredicto?.trim();

  return {
    locale,
    slug: product.slug,
    tipo: product.tipo,
    nombre: localizedProductName(product, locale),
    marca: product.marca,
    imagen: product.imagen,
    imagenAlt: isEn ? '' : product.imagenAlt,
    tramoPrecio: product.tramoPrecio,
    valoracion: product.valoracion,
    valoraciones: product.valoraciones,
    ...(localizedVerdict ? { veredicto: localizedVerdict } : {}),
    idealPara: isEn ? product.en?.idealPara : product.idealPara,
    limitaciones: isEn ? [] : product.limitaciones ?? [],
    paraQuienSi: isEn ? product.en?.paraQuienSi ?? [] : product.paraQuienSi,
    paraQuienNo: isEn ? product.en?.paraQuienNo ?? [] : product.paraQuienNo,
    puntosFuertes: isEn ? product.en?.puntosFuertes ?? [] : product.puntosFuertes,
    puntosDebiles: isEn ? product.en?.puntosDebiles ?? [] : product.puntosDebiles,
    calidadDatos: product.calidadDatos,
    specs: product.specs,
  };
}

export function serializeSelectorPayload(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
