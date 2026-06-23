import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('TarjetaProducto catalog card', () => {
  it('no renderiza CTAs externos de Amazon en el catalogo', () => {
    const source = readFileSync(new URL('./TarjetaProducto.astro', import.meta.url), 'utf8');

    expect(source).not.toContain('href={cta.href}');
    expect(source).not.toContain('target="_blank"');
    expect(source).not.toContain('data-cta-kind={cta.kind}');
  });
});
