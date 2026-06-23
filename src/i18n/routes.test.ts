import { describe, expect, it } from 'vitest';
import { navigationHref } from './routes';

describe('navigationHref', () => {
  it('convierte URLs canonicas del sitio en rutas locales', () => {
    expect(navigationHref('https://tuespaciodetrabajo.com/en/catalog/chairs/')).toBe('/en/catalog/chairs/');
  });

  it('preserva query y hash en enlaces internos absolutos', () => {
    expect(navigationHref('https://tuespaciodetrabajo.com/en/search/?q=chair#results')).toBe('/en/search/?q=chair#results');
  });

  it('no modifica rutas relativas ni dominios externos', () => {
    expect(navigationHref('/en/')).toBe('/en/');
    expect(navigationHref('https://www.amazon.es/s?k=silla')).toBe('https://www.amazon.es/s?k=silla');
  });
});
