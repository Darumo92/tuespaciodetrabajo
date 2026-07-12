import { describe, expect, it } from 'vitest';
import {
  getProductOffer,
  isUsableProductOffer,
  type MarketOffer,
  type ProductOffersFile,
} from './product-offers';

const NOW = new Date('2026-07-10T12:00:00.000Z');

function availableOffer(overrides: Partial<MarketOffer> = {}): MarketOffer {
  return {
    status: 'available',
    priceAmount: 199.99,
    currency: 'EUR',
    url: 'https://shop.example.com/products/chair',
    evidenceUrl: 'https://evidence.example.com/products/chair',
    seller: 'Example Shop',
    sourceType: 'retailer',
    condition: 'new',
    checkedAt: '2026-07-09T12:00:00.000Z',
    attempts: ['retailer'],
    ...overrides,
  };
}

function registry(ES: unknown, US: unknown = availableOffer({ currency: 'USD' })): ProductOffersFile {
  return {
    updatedAt: NOW.toISOString(),
    products: {
      demo: { ES, US },
    },
  } as ProductOffersFile;
}

describe('getProductOffer', () => {
  it('selects the EUR offer for es-ES and the USD offer for en', () => {
    const data = registry(
      availableOffer({ currency: 'EUR', priceAmount: 199.99 }),
      availableOffer({ currency: 'USD', priceAmount: 219.99 }),
    );

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })?.priceAmount).toBe(199.99);
    expect(getProductOffer('demo', 'en', { data, now: NOW })?.priceAmount).toBe(219.99);
  });

  it('rejects an offer whose currency does not match the locale', () => {
    const data = registry(availableOffer({ currency: 'USD' }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it('rejects unavailable offers', () => {
    const data = registry({
      ...availableOffer(),
      status: 'unavailable',
      priceAmount: null,
      url: null,
      evidenceUrl: null,
      seller: null,
      sourceType: null,
      condition: null,
    });

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it('accepts an offer checked exactly 30 days ago', () => {
    const data = registry(availableOffer({ checkedAt: '2026-06-10T12:00:00.000Z' }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).not.toBeNull();
  });

  it('accepts an offer checked exactly now', () => {
    const data = registry(availableOffer({ checkedAt: NOW.toISOString() }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).not.toBeNull();
  });

  it('rejects an offer checked more than 30 days ago', () => {
    const data = registry(availableOffer({ checkedAt: '2026-06-10T11:59:59.999Z' }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it('rejects an offer checked in the future', () => {
    const data = registry(availableOffer({ checkedAt: '2026-07-10T12:00:00.001Z' }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it('rejects an impossible ISO calendar date', () => {
    const data = registry(availableOffer({ checkedAt: '2026-06-31T12:00:00.000Z' }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid price %s',
    (priceAmount) => {
      const data = registry(availableOffer({ priceAmount }));

      expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
    },
  );

  it.each([
    ['url', 'not-a-url'],
    ['url', 'ftp://shop.example.com/chair'],
    ['evidenceUrl', '/relative-evidence'],
    ['evidenceUrl', 'javascript:alert(1)'],
  ] as const)('rejects invalid %s values', (field, value) => {
    const data = registry(availableOffer({ [field]: value }));

    expect(getProductOffer('demo', 'es-ES', { data, now: NOW })).toBeNull();
  });

  it('preserves the evidence URL separately from the purchase URL', () => {
    const offer = availableOffer({
      url: 'https://shop.example.com/buy/chair',
      evidenceUrl: 'https://manufacturer.example.com/chair/specifications',
    });
    const result = getProductOffer('demo', 'es-ES', { data: registry(offer), now: NOW });

    expect(result?.url).toBe('https://shop.example.com/buy/chair');
    expect(result?.evidenceUrl).toBe('https://manufacturer.example.com/chair/specifications');
    expect(result?.evidenceUrl).not.toBe(result?.url);
  });

  it('returns null for an unknown slug', () => {
    expect(getProductOffer('unknown', 'es-ES', { data: registry(availableOffer()), now: NOW })).toBeNull();
  });
});

describe('isUsableProductOffer', () => {
  it('rejects malformed runtime records', () => {
    expect(isUsableProductOffer({ ...availableOffer(), seller: '' }, 'EUR', NOW)).toBe(false);
    expect(isUsableProductOffer({ ...availableOffer(), checkedAt: 'not-a-date' }, 'EUR', NOW)).toBe(false);
  });
});
