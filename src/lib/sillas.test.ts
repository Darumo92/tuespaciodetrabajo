import { describe, it, expect } from 'vitest';
import { buildAmazonHref } from './sillas';

describe('buildAmazonHref', () => {
  it('usa el ASIN cuando existe', () => {
    expect(buildAmazonHref({ asin: 'B0C3T865C2' })).toBe(
      'https://www.amazon.es/dp/B0C3T865C2?tag=tuespaciodet-21'
    );
  });

  it('usa búsqueda por nombre como fallback si no hay asin', () => {
    expect(buildAmazonHref({ buscar: 'SIHOO Doro C300' })).toBe(
      'https://www.amazon.es/s?k=SIHOO+Doro+C300&tag=tuespaciodet-21'
    );
  });

  it('devuelve null si no hay asin ni buscar', () => {
    expect(buildAmazonHref({})).toBeNull();
    expect(buildAmazonHref(undefined)).toBeNull();
  });
});
