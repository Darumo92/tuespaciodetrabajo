import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateSelectorBuild } from './validate-selector-build.mjs';

const site = 'https://tuespaciodetrabajo.com';
const roots: string[] = [];
const checkedAt = new Date().toISOString();
function fixtureOffer(locale: 'es-ES' | 'en') {
  return {
    priceAmount: locale === 'en' ? 257.49 : 146.99, currency: locale === 'en' ? 'USD' : 'EUR',
    seller: locale === 'en' ? 'Provantage' : 'Univers Club - ES', checkedAt,
    url: 'https://shop.example/buy', evidenceUrl: `https://evidence.example/${locale}`,
    sourceUrl: `https://evidence.example/${locale}`,
  };
}
const alternateGroups = [
  [['es-ES', `${site}/herramientas/`], ['en', `${site}/en/tools/`], ['x-default', `${site}/herramientas/`]],
  [['es-ES', `${site}/herramientas/calculadora-ergonomia/`], ['en', `${site}/en/tools/ergonomic-calculator/`], ['x-default', `${site}/herramientas/calculadora-ergonomia/`]],
  [['es-ES', `${site}/herramientas/selector/`], ['en', `${site}/en/tools/selector/`], ['x-default', `${site}/herramientas/selector/`]],
] as const;

function payloadProducts(locale: 'es-ES' | 'en', counts: Record<string, number>) {
  return Object.entries(counts).flatMap(([tipo, count]) => Array.from({ length: count }, (_, index) => ({
    locale,
    slug: `${tipo}-${index}`,
    tipo,
    nombre: `Product ${tipo} ${index}`,
    marca: 'Brand',
    imagen: '',
    imagenAlt: '',
    tramoPrecio: 1,
    valoracion: null,
    valoraciones: { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null },
    limitaciones: [], paraQuienSi: [], paraQuienNo: [], puntosFuertes: [], puntosDebiles: [],
    specs: { tipo },
  })));
}

function pageHtml(locale: 'es-ES' | 'en', counts = { silla: 6, escritorio: 5 }): string {
  const en = locale === 'en';
  const products = payloadProducts(locale, counts);
  const count = products.length;
  const canonical = en ? `${site}/en/tools/selector/` : `${site}/herramientas/selector/`;
  const title = en
    ? 'Chair, Desk & Mouse Finder | Tu Espacio de Trabajo'
    : 'Recomendador de sillas, escritorios y ratones';
  const description = en
    ? `Find chairs, standing desks and mice for your home office. Compare ${count} products using published specs, your preferences and clear compatibility warnings.`
    : `Encuentra sillas, escritorios y ratones para teletrabajar. Compara ${count} productos por sus especificaciones, tus preferencias y los límites de cada modelo.`;
  const breadcrumbName = en ? 'Chair, desk & mouse finder' : 'Recomendador de sillas, escritorios y ratones';
  const app = {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: en ? 'Chair, desk & mouse finder' : 'Recomendador de sillas, escritorios y ratones',
    url: canonical, description, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web',
    isAccessibleForFree: true, inLanguage: locale,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 3, name: breadcrumbName, item: canonical }],
  };
  const payload = {
    products,
    configs: Object.entries(counts).map(([tipo, productCount]) => ({ tipo, productCount, questions: [] })),
    offers: Object.fromEntries(products.map((product, index) => [product.slug, index === 0 ? fixtureOffer(locale) : null])),
    copy: {}, locale,
  };
  return `<!doctype html><html lang="${en ? 'en' : 'es'}"><head>
<title>${title}</title><meta name="description" content="${description}">
<style>@media (max-width: 960px){.nav-toggle{display:block}.nav{display:none}.nav.open{display:flex}}</style>
<meta name="robots" content="max-image-preview:large"><link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="es-ES" href="${site}/herramientas/selector/">
<link rel="alternate" hreflang="en" href="${site}/en/tools/selector/">
<link rel="alternate" hreflang="x-default" href="${site}/herramientas/selector/">
<script type="application/ld+json">${JSON.stringify(app)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script></head><body>
<script type="application/json" data-selector-payload>${JSON.stringify(payload)}</script>
<nav class="nav"><a class="nav-link active" href="${en ? '/en/tools/' : '/herramientas/'}">${en ? 'Tools' : 'Herramientas'}</a></nav>
<h1>${en ? 'Find the chair or standing desk that fits you best' : 'Encuentra la silla o el escritorio que mejor encaja contigo'}</h1>
</body></html>`;
}

function sitemapXml(): string {
  const entries = alternateGroups.flatMap((group) => group.slice(0, 2).map(([, url]) =>
    `<url><loc>${url}</loc>${group.map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`).join('')}</url>`));
  return `<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`;
}

const inboundPages = [
  ['index.html', '/herramientas/selector/', null],
  ['en/index.html', '/en/tools/selector/', null],
  ['herramientas/index.html', '/herramientas/selector/', null],
  ['en/tools/index.html', '/en/tools/selector/', null],
  ['catalogo/index.html', '/herramientas/selector/', null],
  ['en/catalog/index.html', '/en/tools/selector/', null],
  ['sillas/index.html', '/herramientas/selector/', 'silla'],
  ['escritorios/index.html', '/herramientas/selector/', 'escritorio'],
  ['accesorios/index.html', '/herramientas/selector/', null],
  ['en/chairs/index.html', '/en/tools/selector/', 'silla'],
  ['en/desks/index.html', '/en/tools/selector/', 'escritorio'],
  ['en/accessories/index.html', '/en/tools/selector/', null],
  ['catalogo/silla/index.html', '/herramientas/selector/', 'silla'],
  ['catalogo/escritorio/index.html', '/herramientas/selector/', 'escritorio'],
  ['en/catalog/chairs/index.html', '/en/tools/selector/', 'silla'],
  ['en/catalog/standing-desks/index.html', '/en/tools/selector/', 'escritorio'],
] as const;

function writeInboundPages(distDir: string): void {
  for (const [relative, selectorPath, tipo] of inboundPages) {
    const file = join(distDir, relative);
    mkdirSync(join(file, '..'), { recursive: true });
    const headerLink = `<a href="${selectorPath}">${selectorPath.includes('/en/') ? 'Finder' : 'Selector'}</a>`;
    const bodyLink = tipo
      ? `<a href="${selectorPath}?tipo=${tipo}">Contextual finder</a>`
      : `<a href="${selectorPath}">Body finder link</a>`;
    writeFileSync(file, `<!doctype html><body><header>${headerLink}</header><main>${bodyLink}</main></body>`);
  }
}

function validFixture(): { root: string; distDir: string; sourceDir: string } {
  const root = mkdtempSync(join(tmpdir(), 'selector-build-'));
  roots.push(root);
  const distDir = join(root, 'dist');
  const sourceDir = join(root, 'src');
  mkdirSync(join(distDir, 'herramientas/selector'), { recursive: true });
  mkdirSync(join(distDir, 'en/tools/selector'), { recursive: true });
  mkdirSync(join(sourceDir, 'content/productos'), { recursive: true });
  mkdirSync(join(sourceDir, 'lib/selector'), { recursive: true });
  mkdirSync(join(sourceDir, 'data'), { recursive: true });
  writeFileSync(join(sourceDir, 'data/product-offers.json'), JSON.stringify({
    defaultStatus: 'unaudited', updatedAt: '2026-10-08T00:00:00Z',
    products: { 'silla-0': Object.fromEntries((['es-ES', 'en'] as const).map((locale) => {
      const { sourceUrl, ...offer } = fixtureOffer(locale);
      return [locale === 'en' ? 'US' : 'ES', { ...offer, status: 'available', condition: 'new', sourceType: 'retailer', attempts: ['retailer'] }];
    })) },
  }));
  writeFileSync(join(distDir, 'herramientas/selector/index.html'), pageHtml('es-ES'));
  writeFileSync(join(distDir, 'en/tools/selector/index.html'), pageHtml('en'));
  writeFileSync(join(distDir, 'sitemap-0.xml'), sitemapXml());
  writeInboundPages(distDir);
  for (let index = 0; index < 6; index += 1) {
    writeFileSync(join(sourceDir, `content/productos/silla-${index}.yaml`), 'tipo: "silla"\n');
  }
  for (let index = 0; index < 5; index += 1) {
    writeFileSync(join(sourceDir, `content/productos/escritorio-${index}.yaml`), 'tipo: "escritorio"\n');
  }
  writeFileSync(join(sourceDir, 'lib/selector/config-sillas.ts'), "export const selectorConfig = {\n  tipo: 'silla',\n};\n");
  writeFileSync(join(sourceDir, 'lib/selector/config-escritorios.ts'), "export const selectorConfig = {\n  tipo: 'escritorio',\n};\n");
  return { root, distDir, sourceDir };
}

afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

describe('validateSelectorBuild', () => {
  it.each([
    { checkedAt: undefined }, { checkedAt: 'invalid' }, { seller: '' },
    { evidenceUrl: undefined }, { evidenceUrl: 'javascript:alert(1)' },
    { evidenceUrl: 'https://wrong.example/proof' }, { currency: 'EUR' },
    { sourceUrl: 'https://shop.example/buy' }, { checkedAt: '2026-10-08T00:00:00Z' },
    { seller: 'Wrong seller' }, { url: undefined }, { priceAmount: 1 },
  ])('rejects missing, unsafe or wrong-market attribution %j', (fields) => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'en/tools/selector/index.html');
    const html = readFileSync(file, 'utf8');
    writeFileSync(file, html.replace(JSON.stringify(fixtureOffer('en')), JSON.stringify({ ...fixtureOffer('en'), ...fields })));
    expect(() => validateSelectorBuild(fixture)).toThrow(/offer attribution/i);
  });
  it('rejects a quotation on an unaudited product', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'en/tools/selector/index.html');
    writeFileSync(file, pageHtml('en').replace('"silla-1":null', `"silla-1":${JSON.stringify(fixtureOffer('en'))}`));
    expect(() => validateSelectorBuild(fixture)).toThrow(/unaudited.*null/i);
  });
  it('rejects an approved offer serialized from the other market', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'en/tools/selector/index.html');
    writeFileSync(file, pageHtml('en').replace(JSON.stringify(fixtureOffer('en')), JSON.stringify(fixtureOffer('es-ES'))));
    expect(() => validateSelectorBuild(fixture)).toThrow(/offer attribution.*approved US/i);
  });
  it('derives eligible inventory independently and validates payload, schemas and three sitemap groups', () => {
    const fixture = validFixture();
    expect(validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toEqual({ productCount: 11, pages: 2 });
  });

  it('reports payload and metadata drift from independent source inventory', () => {
    const fixture = validFixture();
    writeFileSync(join(fixture.distDir, 'en/tools/selector/index.html'), pageHtml('en', { silla: 5, escritorio: 5 }));
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/en\/tools\/selector\/index\.html: runtime selector payload has 10 products; source inventory requires 11/i);
  });

  it('fails actionably when a selector config has ambiguous tipo declarations', () => {
    const fixture = validFixture();
    writeFileSync(
      join(fixture.sourceDir, 'lib/selector/config-sillas.ts'),
      "export const selectorConfig = { tipo: 'silla' };\nconst accidental = { tipo: 'escritorio' };\n",
    );
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/config-sillas\.ts.*ambiguous.*tipo/i);
  });

  it('rejects duplicate shared payload serialization', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'herramientas/selector/index.html');
    const html = pageHtml('es-ES');
    const payload = html.match(/<script type="application\/json" data-selector-payload>[\s\S]*?<\/script>/)?.[0] ?? '';
    writeFileSync(file, html.replace('</body>', `${payload}</body>`));
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/exactly one data-selector-payload.*found 2/i);
  });

  it('rejects a runtime config product count that disagrees with source', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'en/tools/selector/index.html');
    writeFileSync(file, pageHtml('en').replace('"productCount":6', '"productCount":7'));
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/config silla declares 7 products; source requires 6/i);
  });

  it('rejects a missing key inbound link independently from the global header', () => {
    const fixture = validFixture();
    writeFileSync(
      join(fixture.distDir, 'index.html'),
      '<!doctype html><body><header><a href="/herramientas/selector/">Selector</a></header><main></main></body>',
    );
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/index\.html: expected a body inbound link to \/herramientas\/selector\//i);
  });

  it('rejects contextual selector links from an unmapped category', () => {
    const fixture = validFixture();
    writeFileSync(
      join(fixture.distDir, 'accesorios/index.html'),
      '<!doctype html><body><header><a href="/herramientas/selector/">Selector</a></header><main><a href="/herramientas/selector/?tipo=silla">Wrong context</a></main></body>',
    );
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/accesorios\/index\.html: unmapped category must not link to a contextual selector tipo/i);
  });

  it('rejects generated selector pages with overlapping active primary navigation links', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'en/tools/selector/index.html');
    writeFileSync(file, pageHtml('en').replace('</nav>', '<a class="nav-link active" href="/en/catalog/">Catalog</a></nav>'));
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/en\/tools\/selector\/index\.html: expected exactly one active primary navigation link; found 2/i);
  });

  it('rejects generated selector pages without the safe 960px header breakpoint', () => {
    const fixture = validFixture();
    const file = join(fixture.distDir, 'herramientas/selector/index.html');
    writeFileSync(file, pageHtml('es-ES').replace('max-width: 960px', 'max-width: 768px'));
    expect(() => validateSelectorBuild({ distDir: fixture.distDir, sourceDir: fixture.sourceDir }))
      .toThrow(/herramientas\/selector\/index\.html: missing generated 960px header mobile-menu contract/i);
  });
});
