import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateSelectorBuild } from './validate-selector-build.mjs';

const site = 'https://tuespaciodetrabajo.com';
const roots: string[] = [];
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
    ? 'Chair & Standing Desk Finder | Tu Espacio de Trabajo'
    : 'Recomendador de sillas y escritorios para home office';
  const description = en
    ? `Answer a few questions and we'll recommend the 3 best chairs or desks for your body, space, and budget. Based on real specs from ${count} products.`
    : `Responde unas preguntas y descubre las 3 mejores sillas o escritorios para tu cuerpo, espacio y presupuesto, usando specs reales de ${count} productos.`;
  const breadcrumbName = en ? 'Chair & standing desk finder' : 'Recomendador de sillas y escritorios';
  const app = {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: en ? 'Chair & standing desk finder' : 'Recomendador de sillas y escritorios',
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
    offers: Object.fromEntries(products.map((product) => [product.slug, null])),
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
