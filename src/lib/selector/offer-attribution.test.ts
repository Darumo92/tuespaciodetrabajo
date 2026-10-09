import { describe, expect, it } from 'vitest';
import { formatOfferAttribution } from './offer-attribution';

const offer = {
  priceAmount: 146.99, currency: 'EUR', seller: 'Univers Club - ES',
  url: 'https://shop.example/buy', sourceUrl: 'https://www.pccomponentes.com/evidence',
  evidenceUrl: 'https://www.pccomponentes.com/evidence', checkedAt: '2026-10-09T19:29:28Z',
};

describe('formatOfferAttribution', () => {
  it('formats the quote with its seller, evidence and own check date', () => {
    expect(formatOfferAttribution(offer, 'es-ES')).toEqual({
      priceText: '146,99 €', seller: 'Univers Club - ES',
      sourceUrl: offer.evidenceUrl, sourceHost: 'pccomponentes.com',
      dateText: '9 oct 2026', datetimeISO: '2026-10-09T19:29:28.000Z',
    });
  });
  it('formats English USD without converting the amount', () => {
    expect(formatOfferAttribution({ ...offer, priceAmount: 257.49, currency: 'USD', seller: 'Provantage' }, 'en'))
      .toMatchObject({ priceText: '$257.49', seller: 'Provantage', dateText: 'Oct 9, 2026' });
    expect(formatOfferAttribution(offer, 'en')?.priceText).toBe('€146.99');
  });
  it('uses the UTC quote day, never a registry maintenance date', () => {
    const maintainedOffer = { ...offer, checkedAt: '2026-10-08T23:30:00-02:00', updatedAt: '2026-10-10T12:00:00Z' };
    expect(formatOfferAttribution(maintainedOffer, 'en'))
      .toMatchObject({ dateText: 'Oct 9, 2026', datetimeISO: '2026-10-09T01:30:00.000Z' });
  });
  it('keeps evidence separate from purchase and falls back only when absent', () => {
    expect(formatOfferAttribution({ ...offer, evidenceUrl: undefined }, 'en')?.sourceUrl).toBe(offer.sourceUrl);
    expect(formatOfferAttribution({ ...offer, evidenceUrl: undefined, sourceUrl: undefined }, 'en')?.sourceUrl).toBe(offer.url);
  });
  it('does not attribute unaudited offers', () => {
    expect(formatOfferAttribution(null, 'en')).toBeNull();
    expect(formatOfferAttribution(undefined, 'es-ES')).toBeNull();
  });
  it.each(['javascript:alert(1)', 'data:text/html,unsafe', '/relative', 'not a URL'])('rejects unsafe evidence %s without purchase fallback', (evidenceUrl) => {
    expect(formatOfferAttribution({ ...offer, evidenceUrl }, 'en')).toBeNull();
  });
  it.each(['invalid', '2026-02-30T12:00:00Z', '2026-13-09T12:00:00Z', '', '2026-10-09'])('rejects invalid check date %s', (checkedAt) => {
    expect(formatOfferAttribution({ ...offer, checkedAt }, 'en')).toBeNull();
  });
  it.each([{ seller: '' }, { currency: 'invalid' }, { priceAmount: NaN }, { priceAmount: -1 }])('rejects incomplete or invalid quotes %j', (fields) => {
    expect(formatOfferAttribution({ ...offer, ...fields }, 'es-ES')).toBeNull();
  });
});
