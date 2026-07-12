import { describe, expect, it } from 'vitest';
import {
  buildSelectorPageDescription,
  buildSelectorPageSchemas,
  buildSelectorResultSchemaFromPayload,
  buildSelectorResultSchema,
  serializeJsonForHtml,
  syncSelectorResultSchema,
  type SelectorSchemaLookup,
} from './schema';
import type { SelectorProductPayload } from './payload';

const lookup: SelectorSchemaLookup = {
  aeron: {
    name: 'Herman Miller Aeron',
    brand: 'Herman Miller',
    image: 'https://tuespaciodetrabajo.com/images/aeron.webp',
    url: 'https://tuespaciodetrabajo.com/catalogo/silla/aeron/',
    description: 'Una silla de referencia para jornadas largas.',
    reviewRating: 9.2,
    offer: {
      price: 1499,
      priceCurrency: 'EUR',
      url: 'https://example.com/aeron',
      seller: 'Tienda verificada',
    },
  },
  desk: {
    name: 'Standing Desk',
    brand: 'Desk Co',
    url: 'https://tuespaciodetrabajo.com/en/catalog/standing-desks/desk/',
  },
  'desk-reviewed': {
    name: 'Reviewed Standing Desk',
    brand: 'Desk Co',
    url: 'https://tuespaciodetrabajo.com/en/catalog/standing-desks/desk-reviewed/',
    description: 'A stable desk for long workdays.',
    reviewRating: 8.7,
  },
  'desk-rating-only': {
    name: 'Rated Standing Desk',
    brand: 'Desk Co',
    url: 'https://tuespaciodetrabajo.com/en/catalog/standing-desks/desk-rating-only/',
    reviewRating: 8.1,
  },
};

describe('buildSelectorResultSchema', () => {
  it('builds a positioned ItemList with localized Product review and verified offer data', () => {
    const schema = buildSelectorResultSchema([
      { slug: 'aeron', score: 97, reasons: ['fit'], warning: null },
    ], lookup);

    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: 1,
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Product',
          name: 'Herman Miller Aeron',
          brand: { '@type': 'Brand', name: 'Herman Miller' },
          image: 'https://tuespaciodetrabajo.com/images/aeron.webp',
          url: 'https://tuespaciodetrabajo.com/catalogo/silla/aeron/',
          description: 'Una silla de referencia para jornadas largas.',
          review: {
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: 9.2, bestRating: 10, worstRating: 0 },
            author: { '@type': 'Person', name: 'David Rubio Mota' },
            publisher: { '@type': 'Organization', name: 'Tu Espacio de Trabajo' },
            reviewBody: 'Una silla de referencia para jornadas largas.',
          },
          offers: {
            '@type': 'Offer',
            price: 1499,
            priceCurrency: 'EUR',
            url: 'https://example.com/aeron',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'Tienda verificada' },
          },
        },
      }],
    });
    expect(JSON.stringify(schema)).not.toContain('97');
  });

  it('uses the nonblank localized English description as Review.reviewBody', () => {
    const schema = buildSelectorResultSchema([
      { slug: 'desk-reviewed', score: 91, reasons: [], warning: null },
    ], lookup);

    expect(schema.itemListElement[0].item.review).toMatchObject({
      reviewBody: 'A stable desk for long workdays.',
      reviewRating: { ratingValue: 8.7 },
    });
  });

  it('uses prelocalized English data and omits image, description, review and offer when absent', () => {
    const schema = buildSelectorResultSchema([
      { slug: 'desk', score: 88, reasons: [], warning: null },
      { slug: 'missing', score: 100, reasons: [], warning: null },
    ], lookup);

    expect(schema.numberOfItems).toBe(1);
    const product = schema.itemListElement[0].item;
    expect(product.name).toBe('Standing Desk');
    expect(product).not.toHaveProperty('image');
    expect(product).not.toHaveProperty('description');
    expect(product).not.toHaveProperty('review');
    expect(product).not.toHaveProperty('offers');
    expect(JSON.stringify(schema)).not.toMatch(/\b(?:88|100)\b/);
  });

  it('omits Review.reviewBody when the localized verdict is absent', () => {
    const schema = buildSelectorResultSchema([
      { slug: 'desk-rating-only', score: 84, reasons: [], warning: null },
    ], lookup);

    expect(schema.itemListElement[0].item.review).toBeDefined();
    expect(schema.itemListElement[0].item.review).not.toHaveProperty('reviewBody');
  });
});

describe('dynamic selector schema lifecycle', () => {
  it('builds schema from shared payload, ignores unknown slugs, replaces by id and clears', () => {
    const products: SelectorProductPayload[] = [{
      locale: 'en', slug: 'known', tipo: 'silla', nombre: 'Known chair', marca: 'Brand',
      imagen: '', imagenAlt: '', tramoPrecio: 2, valoracion: null,
      valoraciones: { ergonomia: 8, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null },
      veredicto: 'Localized verdict', idealPara: undefined, limitaciones: [], paraQuienSi: [],
      paraQuienNo: [], puntosFuertes: [], puntosDebiles: [], specs: { tipo: 'silla' },
    }];
    const schema = buildSelectorResultSchemaFromPayload(
      [
        { slug: 'missing', score: 100, reasons: [], warning: null },
        { slug: 'known', score: 99, reasons: [], warning: null },
      ],
      products,
      { known: null },
      'en',
      'https://tuespaciodetrabajo.com',
    );
    const removed: string[] = [];
    const appended: Array<{ id: string; type: string; textContent: string | null }> = [];
    const documentAdapter = {
      getElementById: (id: string) => id === 'selector-results-schema'
        ? { remove: () => removed.push(id) }
        : null,
      createElement: () => ({ id: '', type: '', textContent: null as string | null }),
      head: { append: (node: { id: string; type: string; textContent: string | null }) => appended.push(node) },
    };

    expect(schema.numberOfItems).toBe(1);
    expect(schema.itemListElement[0].item).toMatchObject({
      name: 'Known chair', description: 'Localized verdict',
      review: { reviewBody: 'Localized verdict', reviewRating: { ratingValue: 8 } },
    });
    expect(JSON.stringify(schema)).not.toMatch(/\b(?:99|100)\b/);

    syncSelectorResultSchema(documentAdapter, schema);
    expect(removed).toEqual(['selector-results-schema']);
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({ id: 'selector-results-schema', type: 'application/ld+json' });
    expect(JSON.parse(appended[0].textContent ?? '{}')).toEqual(schema);

    syncSelectorResultSchema(documentAdapter, null);
    expect(removed).toEqual(['selector-results-schema', 'selector-results-schema']);
    expect(appended).toHaveLength(1);
  });
});

describe('serializeJsonForHtml', () => {
  it('escapes opening tags in inert JSON without changing parsed data', () => {
    const value = { name: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonForHtml(value);

    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(value);
  });
});

describe('selector page metadata and static schema', () => {
  it('keeps the current localized descriptions exact and within SEO limits', () => {
    const es = buildSelectorPageDescription(114, 'es-ES');
    const en = buildSelectorPageDescription(114, 'en');

    expect(es).toBe('Responde unas preguntas y descubre las 3 mejores sillas o escritorios para tu cuerpo, espacio y presupuesto, usando specs reales de 114 productos.');
    expect(en).toBe("Answer a few questions and we'll recommend the 3 best chairs or desks for your body, space, and budget. Based on real specs from 114 products.");
    expect(es.length).toBeGreaterThanOrEqual(140);
    expect(es.length).toBeLessThanOrEqual(155);
    expect(en.length).toBeGreaterThanOrEqual(140);
    expect(en.length).toBeLessThanOrEqual(155);
  });

  it('builds localized WebApplication and final-item breadcrumb schema', () => {
    const description = buildSelectorPageDescription(114, 'en');
    const schemas = buildSelectorPageSchemas('en', 'https://tuespaciodetrabajo.com/en/tools/selector/', description);

    expect(schemas.webApplication).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Chair & standing desk finder',
      url: 'https://tuespaciodetrabajo.com/en/tools/selector/',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      inLanguage: 'en',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
    });
    expect(schemas.breadcrumb.itemListElement.at(-1)).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Chair & standing desk finder',
      item: 'https://tuespaciodetrabajo.com/en/tools/selector/',
    });
  });
});
