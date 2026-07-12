import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = () => readFileSync(new URL('./SelectorCta.astro', import.meta.url), 'utf8');

describe('SelectorCta source contract', () => {
  it('builds localized selector URLs and appends an optional stable source type', () => {
    const component = source();
    expect(component).toContain("type SelectorCtaLocale = 'es-ES' | 'en'");
    expect(component).toContain("'es-ES': localizedPath('es-ES', ['herramientas', 'selector'])");
    expect(component).toContain("en: localizedPath('en', ['tools', 'selector'])");
    expect(component).toContain('locale: SelectorCtaLocale');
    expect(component).not.toContain('type Locale');
    expect(component).not.toContain('DEFAULT_LOCALE');
    expect(component).toContain('new URLSearchParams()');
    expect(component).toContain("searchParams.set('tipo', tipo)");
    expect(component).toContain('`${selectorPath}?${searchParams}`');
  });

  it('provides complete native ES and EN copy for home and compact variants', () => {
    const component = source();
    expect(component).toContain('¿No sabes qué silla o escritorio comprar?');
    expect(component).toContain('En menos de 2 minutos te recomendamos las tres opciones que mejor encajan contigo.');
    expect(component).toContain('Encontrar mi equipo ideal');
    expect(component).toContain('Not sure which chair or desk to buy?');
    expect(component).toContain('In less than 2 minutes, we’ll recommend the three options that best fit your needs.');
    expect(component).toContain('Find my ideal setup');
    expect(component).toContain('Recomendador de sillas y escritorios');
    expect(component).toContain('Usar el recomendador');
    expect(component).toContain('Chair & standing desk finder');
    expect(component).toContain('Use the finder');
  });

  it('renders accessible anchor CTAs in home and compact visual variants', () => {
    const component = source();
    expect(component).toContain("type SelectorCtaVariant = 'home' | 'compact'");
    expect(component).toContain('variant?: SelectorCtaVariant');
    expect(component).toContain('<a class="selector-cta__link" href={href}>{copy.button}</a>');
    expect(component).toContain('selector-cta--home');
    expect(component).toContain('selector-cta--compact');
    expect(component).toContain('border-radius: var(--radius)');
    expect(component).not.toContain('border-radius: 6px');
    expect(component).not.toContain('onclick');
    expect(component).not.toContain('linear-gradient');
    expect(component).not.toContain('box-shadow');
  });
});
