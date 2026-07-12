import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8');

describe('selector accessibility source contracts', () => {
  it('only exposes null-neutral measurement controls when null is an own declaration', () => {
    const source = readSource('./PasoPregunta.astro');

    expect(source).toContain("Object.prototype.hasOwnProperty.call(question, 'neutralValue')");
    expect(source).toContain('question.neutralValue === null');
    expect(source.match(/\{supportsNeutral && \(/g)).toHaveLength(2);
    expect(source.match(/data-answer-neutral/g)).toHaveLength(3);
    expect(source.match(/data-answer-(?:number|dimension)[^>]*\n\s*required/g)).toHaveLength(2);
  });

  it('keeps a localized persistent accessible name on the progressbar', () => {
    const source = readSource('./SelectorProductos.astro');

    expect(source).toContain("progressLabel: 'Selection progress'");
    expect(source).toContain("progressLabel: 'Progreso de selección'");
    expect(source).toMatch(/role="progressbar"[^>]*aria-label=\{copy\.progressLabel\}/);
    expect(source).not.toContain("progressbar.setAttribute('aria-label'");
  });

  it('uses the recommendation name in the selector region label', () => {
    const source = readSource('./SelectorProductos.astro');
    expect(source).toContain("'Chair and standing desk finder'");
    expect(source).toContain("'Recomendador de sillas y escritorios'");
    expect(source).not.toContain("'Product selector'");
  });

  it('uses the comfortably contrasting muted ink token for mobile navigation text', () => {
    const source = readSource('../../styles/global.css');
    const rule = source.match(/\.bottom-nav-item \{([^}]*)\}/)?.[1] ?? '';

    expect(rule).toContain('color: var(--ink-muted);');
    expect(rule).not.toContain('color: var(--ink-light);');
  });

  it('uses accent ink for cookie accept button contrast in both themes', () => {
    const source = readSource('../../layouts/Base.astro');
    const rule = source.match(/\.cookie-btn-accept \{([^}]*)\}/)?.[1] ?? '';

    expect(rule).toContain('color: var(--accent-ink);');
    expect(rule).not.toContain('color: #fff;');
  });
});
