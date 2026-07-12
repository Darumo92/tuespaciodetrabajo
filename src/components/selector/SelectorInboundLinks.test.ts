import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

describe('selector inbound link source contracts', () => {
  it('places the full home CTA between the hero and category bento in both locales', () => {
    for (const path of ['pages/index.astro', 'pages/[locale]/index.astro']) {
      const page = read(path);
      const heroEnd = page.indexOf('</section>', page.indexOf('class="home-hero"'));
      const cta = page.indexOf('<SelectorCta', heroEnd);
      const bento = page.indexOf('home-bento-section', heroEnd);
      expect(page).toContain("variant=\"home\"");
      expect(cta).toBeGreaterThan(heroEnd);
      expect(cta).toBeLessThan(bento);
    }
  });

  it('derives category context from selector routes and real inventory without category-name checks', () => {
    for (const path of ['pages/[categoria]/index.astro', 'pages/[locale]/[categoria]/index.astro']) {
      const page = read(path);
      expect(page).toContain('SELECTOR_CONFIGS');
      expect(page).toContain('resolveEligibleSelectorConfig');
      expect(page).toContain('routes.editorialCategories');
      expect(page).toContain("getCollection('productos')");
      expect(page).toContain("e.id.replace(/\\.(ya?ml|json)$/, '')");
      expect(page).not.toContain('.length >= 5');
      expect(page).toContain('<SelectorCta');
      expect(page).toContain('tipo={selectorTipo}');

      const selectorLogic = page.slice(page.indexOf('const selectorConfig'), page.indexOf('---', page.indexOf('const selectorConfig')));
      expect(selectorLogic).not.toMatch(/(?:if|\?|===|includes\()\s*['"](?:silla|escritorio|sillas|escritorios|chairs|desks)['"]/);
    }
  });

  it('adds general hub links, catalog type help and the second localized tool listing', () => {
    for (const path of ['pages/catalogo/index.astro', 'pages/[locale]/catalog/index.astro']) {
      const hub = read(path);
      expect(hub).toContain('resolveEligibleSelectorConfigs(SELECTOR_CONFIGS, selectorProducts, 5)');
      expect(hub).toContain('eligibleSelectorConfigs.length > 0 &&');
      expect(hub).toContain('<SelectorCta');
      expect(hub).toContain('variant="compact"');
    }

    const catalog = read('components/producto/CatalogoProductos.astro');
    const cta = read('components/selector/SelectorCta.astro');
    expect(cta).toContain('Recomendador de sillas y escritorios');
    expect(cta).toContain('Chair & standing desk finder');
    expect(catalog).toContain('resolveEligibleSelectorConfig');
    expect(catalog).toContain('selectorConfig && <SelectorCta');
    expect(catalog).toContain('tipo={tipo}');
    expect(catalog.indexOf('<SelectorCta')).toBeGreaterThan(catalog.indexOf('class="cat-search"'));
    expect(catalog.indexOf('<SelectorCta')).toBeLessThan(catalog.indexOf('class="cat-bar"'));

    const esTools = read('pages/herramientas/index.astro');
    const enTools = read('pages/[locale]/tools/index.astro');
    expect(esTools).toContain("localizedPath('es-ES', ['herramientas', 'selector'])");
    expect(esTools).toContain('Recomendador de sillas y escritorios');
    expect(enTools).toContain("localizedPath(locale, ['tools', 'selector'])");
    expect(enTools).toContain('Chair & standing desk finder');
  });

  it('uses the same simple tool-card layout in Spanish and English', () => {
    const esTools = read('pages/herramientas/index.astro');
    const enTools = read('pages/[locale]/tools/index.astro');
    for (const source of [esTools, enTools]) {
      expect(source).toContain('class="container section"');
      expect(source).toContain('class="tool-grid"');
      expect(source.match(/class="tool-card"/g)).toHaveLength(2);
      expect(source).toContain('.tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }');
      expect(source).toContain('.tool-card { display: block; padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius); text-decoration: none; color: inherit; background: var(--surface); }');
    }
    expect(esTools).not.toContain('related-links');
    expect(esTools).not.toContain('tool-header');
    expect(esTools).not.toContain('tool-page');
  });

  it('keeps the recommender under Tools instead of duplicating it in primary navigation', () => {
    const header = read('components/Header.astro');
    const globalCss = read('styles/global.css');
    const ui = read('i18n/ui.ts');
    expect(ui).not.toContain("selector: 'Selector'");
    expect(ui).not.toContain("selector: 'Finder'");
    expect(header).not.toContain("localizedPath(locale, ['herramientas', 'selector'])");
    expect(header).not.toContain("localizedPath(locale, ['tools', 'selector'])");
    expect(header).not.toContain('ui.nav.selector');
    expect(header).toContain('activeNavigationHref(currentPath, navLinks.map((link) => link.href))');
    expect(header).toContain("link.href === activeHref ? 'active' : ''");
    expect(header).toContain("currentPath === link.href ? { 'aria-current': 'page' } : {}");
    expect(header).not.toContain('@media (min-width: 769px) and (max-width: 1140px)');
    expect(globalCss).toContain('@media (max-width: 960px)');
    expect(globalCss).toMatch(/@media \(max-width: 960px\) \{[\s\S]*?\.nav-search-label/);
    expect(globalCss).toMatch(/@media \(max-width: 960px\) \{[\s\S]*?\.nav-toggle[\s\S]*?\.nav\.open/);
    expect(globalCss).toMatch(/@media \(max-width: 768px\) \{[\s\S]*?\.bottom-nav/);
  });
});
