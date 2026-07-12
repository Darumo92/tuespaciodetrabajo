import { notaGlobal, productPath } from '../productos';
import type { SelectorPayloadOffer, SelectorProductPayload } from './payload';

export interface SelectorSchemaOffer {
  price: number;
  priceCurrency: string;
  url: string;
  seller?: string;
}

export interface SelectorSchemaProduct {
  name: string;
  brand: string;
  image?: string;
  url: string;
  description?: string;
  reviewRating?: number;
  offer?: SelectorSchemaOffer;
}

export type SelectorSchemaLookup = Record<string, SelectorSchemaProduct>;

export interface SelectorEventResult {
  slug: string;
  score: number;
  reasons: string[];
  warning: string | null;
}

export type SelectorLocale = 'es-ES' | 'en';

export function buildSelectorPageDescription(productCount: number, locale: SelectorLocale): string {
  return locale === 'en'
    ? `Answer a few questions and we'll recommend the 3 best chairs or desks for your body, space, and budget. Based on real specs from ${productCount} products.`
    : `Responde unas preguntas y descubre las 3 mejores sillas o escritorios para tu cuerpo, espacio y presupuesto, usando specs reales de ${productCount} productos.`;
}

export function buildSelectorPageSchemas(
  locale: SelectorLocale,
  canonicalUrl: string,
  description: string,
) {
  const isEn = locale === 'en';
  const siteUrl = 'https://tuespaciodetrabajo.com';
  const toolsUrl = isEn ? `${siteUrl}/en/tools/` : `${siteUrl}/herramientas/`;

  return {
    webApplication: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: isEn ? 'Chair & standing desk finder' : 'Recomendador de sillas y escritorios',
      url: canonicalUrl,
      description,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
      inLanguage: locale,
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: isEn ? `${siteUrl}/en/` : `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: isEn ? 'Tools' : 'Herramientas', item: toolsUrl },
        { '@type': 'ListItem', position: 3, name: isEn ? 'Chair & standing desk finder' : 'Recomendador de sillas y escritorios', item: canonicalUrl },
      ],
    },
  };
}

export function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildSelectorResultSchema(
  results: readonly SelectorEventResult[],
  lookup: SelectorSchemaLookup,
) {
  const products = results.flatMap(({ slug }) => {
    const product = lookup[slug];
    return product ? [product] : [];
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: (() => {
        const description = product.description?.trim();
        return {
        '@type': 'Product',
        name: product.name,
        brand: { '@type': 'Brand', name: product.brand },
        ...(product.image ? { image: product.image } : {}),
        url: product.url,
        ...(description ? { description } : {}),
        ...(product.reviewRating == null ? {} : {
          review: {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: product.reviewRating,
              bestRating: 10,
              worstRating: 0,
            },
            author: { '@type': 'Person', name: 'David Rubio Mota' },
            publisher: { '@type': 'Organization', name: 'Tu Espacio de Trabajo' },
            ...(description ? { reviewBody: description } : {}),
          },
        }),
        ...(product.offer ? {
          offers: {
            '@type': 'Offer',
            price: product.offer.price,
            priceCurrency: product.offer.priceCurrency,
            url: product.offer.url,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            ...(product.offer.seller
              ? { seller: { '@type': 'Organization', name: product.offer.seller } }
              : {}),
          },
        } : {}),
        };
      })(),
    })),
  };
}

export function buildSelectorResultSchemaFromPayload(
  results: readonly SelectorEventResult[],
  products: readonly SelectorProductPayload[],
  offers: Readonly<Record<string, SelectorPayloadOffer | null>>,
  locale: SelectorLocale,
  siteUrl: string,
) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const lookup: SelectorSchemaLookup = {};
  for (const { slug } of results) {
    const product = bySlug.get(slug);
    if (!product) continue;
    const image = product.imagen?.trim();
    const description = product.veredicto?.trim();
    const rating = notaGlobal(product);
    const offer = offers[slug];
    const offerUrl = offer?.url ?? offer?.sourceUrl;
    lookup[slug] = {
      name: product.nombre,
      brand: product.marca,
      ...(image ? { image: new URL(image, siteUrl).href } : {}),
      url: new URL(productPath(product, locale), siteUrl).href,
      ...(description ? { description } : {}),
      ...(rating == null ? {} : { reviewRating: rating }),
      ...(offer && offerUrl && Number.isFinite(offer.priceAmount) ? {
        offer: {
          price: offer.priceAmount,
          priceCurrency: offer.currency,
          url: offerUrl,
          ...(offer.seller ? { seller: offer.seller } : {}),
        },
      } : {}),
    };
  }
  return buildSelectorResultSchema(results, lookup);
}

export interface SelectorSchemaDocumentAdapter {
  getElementById(id: string): { remove(): void } | null;
  createElement(tag: 'script'): { id: string; type: string; textContent: string | null };
  head: { append(node: { id: string; type: string; textContent: string | null }): void };
}

export function syncSelectorResultSchema(
  documentAdapter: SelectorSchemaDocumentAdapter,
  schema: ReturnType<typeof buildSelectorResultSchema> | null,
): void {
  documentAdapter.getElementById('selector-results-schema')?.remove();
  if (!schema) return;
  const script = documentAdapter.createElement('script');
  script.id = 'selector-results-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  documentAdapter.head.append(script);
}
