import { describe, expect, it } from 'vitest';
import * as routes from './routes';

const { navigationHref } = routes;
const activeNavigationHref = (routes as typeof routes & {
  activeNavigationHref: (currentPath: string, hrefs: readonly string[]) => string | undefined;
}).activeNavigationHref;

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

describe('activeNavigationHref', () => {
  const es = ['/catalogo/', '/guias/', '/actualidad/', '/herramientas/', '/herramientas/selector/'];
  const en = ['/en/catalog/', '/en/guides/', '/en/articles/', '/en/tools/', '/en/tools/selector/'];

  it('selects only the longest matching ES route', () => {
    expect(activeNavigationHref('/herramientas/selector/', es)).toBe('/herramientas/selector/');
    expect(activeNavigationHref('/herramientas/selector/?tipo=silla', es)).toBe('/herramientas/selector/');
    expect(activeNavigationHref('/herramientas/calculadora-ergonomia/', es)).toBe('/herramientas/');
    expect(activeNavigationHref('/herramientas/', es)).toBe('/herramientas/');
  });

  it('selects only the longest matching EN route without matching sibling prefixes', () => {
    expect(activeNavigationHref('/en/tools/selector/', en)).toBe('/en/tools/selector/');
    expect(activeNavigationHref('/en/tools/ergonomic-calculator/', en)).toBe('/en/tools/');
    expect(activeNavigationHref('/en/tools/', en)).toBe('/en/tools/');
    expect(activeNavigationHref('/en/tool shed/', en)).toBeUndefined();
  });
});
