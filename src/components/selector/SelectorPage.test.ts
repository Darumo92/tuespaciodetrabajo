import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const componentSource = () => readFileSync(new URL('./SelectorPage.astro', import.meta.url), 'utf8');
const pageSource = (relative: string) => readFileSync(new URL(`../../pages/${relative}`, import.meta.url), 'utf8');

describe('public selector page source contracts', () => {
  it('loads eligible catalog products and verified locale offers in one shared server wrapper', () => {
    const source = componentSource();
    expect(source).toContain("getCollection('productos')");
    expect(source).toContain("e.id.replace(/\\.(ya?ml|json)$/, '')");
    expect(source).toContain('resolveEligibleSelectorConfigs(SELECTOR_CONFIGS, products, 5)');
    expect(source).toContain('getProductOffer(product.slug, locale)');
    expect(source).toContain('<SelectorProductos');
    expect(source).toContain('products={eligibleProducts}');
    expect(source).toContain('configs={configs}');
    expect(source).toContain('offersBySlug={offersBySlug}');
  });

  it('names the tool after the chair and desk recommendation it provides', () => {
    const source = componentSource();
    expect(source).toContain('Recomendador de sillas y escritorios para home office');
    expect(source).toContain('Encuentra la silla o el escritorio que mejor encaja contigo');
    expect(source).toContain('Chair & Standing Desk Finder | Tu Espacio de Trabajo');
    expect(source).toContain('Find the chair or standing desk that fits you best');
    expect(source).not.toContain('Encuentra tu equipo ideal en 2 minutos | Tu Espacio de Trabajo');
  });

  it('uses safe static and dynamic JSON-LD transport without runtime innerHTML', () => {
    const source = componentSource();
    expect(source).toContain("'[data-selector-payload]'");
    expect(source).not.toContain('data-selector-schema-lookup');
    expect(source).not.toContain('schemaLookupJson');
    expect(source).toContain("addEventListener('selector:results'");
    expect(source).toContain("addEventListener('selector:clear-results'");
    expect(source).toContain('buildSelectorResultSchemaFromPayload');
    expect(source).toContain('syncSelectorResultSchema');
    expect(source).not.toContain('innerHTML');
  });

  it('keeps both routes thin and only generates ready non-default English pages', () => {
    const es = pageSource('herramientas/selector.astro');
    const localized = pageSource('[locale]/tools/selector.astro');
    expect(es).toContain('<SelectorPage locale="es-ES" />');
    expect(localized).toContain('READY_LOCALES');
    expect(localized).toContain("locale !== 'es-ES'");
    expect(localized).toContain('<SelectorPage locale={locale} />');
    expect(localized).not.toContain('noindex');
  });

  it('adds reciprocal tools, calculator and selector sitemap links and keeps the English hub indexable', () => {
    const astroConfig = readFileSync(new URL('../../../astro.config.mjs', import.meta.url), 'utf8');
    const toolsHub = pageSource('[locale]/tools/index.astro');
    expect(astroConfig).not.toContain("!page.includes('/en/tools/')");
    expect(astroConfig).toContain("localizedPath('es-ES', ['herramientas', 'selector'])");
    expect(astroConfig).toContain("localizedPath('en', ['tools', 'selector'])");
    expect(astroConfig).toContain("localizedPath('es-ES', ['herramientas'])");
    expect(astroConfig).toContain("localizedPath('en', ['tools'])");
    expect(astroConfig).toContain("localizedPath('es-ES', ['herramientas', 'calculadora-ergonomia'])");
    expect(astroConfig).toContain("localizedPath('en', ['tools', 'ergonomic-calculator'])");
    expect(toolsHub).not.toContain('noindex={true}');
  });
});
