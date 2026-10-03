import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (name: string) => readFileSync(new URL(`./${name}.astro`, import.meta.url), 'utf8');
const rule = (name: string, selector: string) => source(name).match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))?.[1] ?? '';

describe('product hero responsive sizing contract', () => {
  it('lets the grid media shrink below its intrinsic content width', () => {
    expect(rule('FichaHero', 'ficha-hero-media')).toMatch(/min-width:\s*0\s*;/);
  });

  it.each([['ImagenProducto', 'img-prod'], ['FallbackImagen', 'fallback-img']])(
    'bounds %s to its container without distorting its square canvas', (name, selector) => {
      const css = rule(name, selector);
      expect(css).toMatch(/max-width:\s*100%\s*;/);
      expect(css).toMatch(/height:\s*auto\s*;/);
      expect(css).toMatch(/aspect-ratio:\s*1\s*;/);
      expect(css).toMatch(/min-width:\s*0\s*;/);
      expect(css).toMatch(/flex-shrink:\s*1\s*;/);
    },
  );
});
