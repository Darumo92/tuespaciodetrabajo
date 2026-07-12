import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  SELECTOR_CONFIGS,
  countFieldCoverage,
  discoverSelectorConfigs,
  getSelectorConfig,
  hasUsefulVariation,
  resolveEligibleSelectorConfigs,
  resolveVisibleQuestions,
  validateSelectorConfig,
} from './config';
import * as selectorConfigModule from './config';
import type {
  DeepReadonly,
  LocalizedText,
  ReadonlySelectorTypeConfig,
  SelectorCriterion,
  SelectorQuestion,
  SelectorTypeConfig,
} from './config';
import type { Producto } from '../productos';
import { evaluateCriterion, scoreProducts } from './scoring';
import type { CriterionTrace, ScoredProduct } from './scoring';
import { generateProductExplanation, interpolateExplanationTemplate } from './razones';
import type { ProductExplanation } from './razones';
import { parseSelectorUrl, serializeSelectorState } from './url';
import { firstUnansweredQuestionIndex, previousSelectorState, targetTabIndex } from './ui-state';
import { copyText } from './clipboard';
import {
  projectSelectorProduct,
  serializeSelectorPayload,
} from './payload';
import type { SelectorProductPayload } from './payload';
import {
  cloneSelectorAnswers,
  createCalculationGuard,
  initialRecoveryState,
  resultLayoutState,
  selectorProgressState,
  selectorUrl,
  transitionRecoveryState,
} from './controller';

const text = (value: string): LocalizedText => ({ 'es-ES': value, en: value });

const criterion = (id = 'fit'): SelectorCriterion => ({
  id,
  field: 'specs.fit',
  operator: 'equals',
  target: { source: 'literal', value: true },
  weight: 1,
  missingScore: 0.5,
  reason: text('Fits'),
  warning: text('Check fit'),
});

const question = (id = 'need', criterionId = 'fit'): SelectorQuestion => ({
  id,
  kind: 'single',
  title: text('Need'),
  options: [{ value: 'yes', label: text('Yes'), effects: [criterion(criterionId)] }],
});

const config = (tipo = 'alpha', questions = [question()]): SelectorTypeConfig => ({
  tipo,
  labels: {
    singular: text(`Selector ${tipo}`),
    plural: text(`Selectors ${tipo}`),
    icon: 'test-icon',
  },
  routes: {
    catalogType: { 'es-ES': tipo, en: tipo },
    editorialCategories: { 'es-ES': [`guide-${tipo}`], en: [`guide-${tipo}`] },
  },
  questions,
});

const product = (
  tipo: string,
  slug: string,
  specs: Record<string, unknown> = {},
): Producto => ({
  slug,
  tipo,
  nombre: slug,
  marca: 'M',
  imagen: '',
  imagenAlt: '',
  tramoPrecio: 1,
  precioMin: null,
  precioMax: null,
  valoracion: null,
  valoraciones: {
    ergonomia: null,
    ajustabilidad: null,
    materiales: null,
    comodidad: null,
    calidadPrecio: null,
  },
  amazon: { asin: null, buscar: null },
  webOficial: null,
  paraQuienSi: [],
  paraQuienNo: [],
  puntosFuertes: [],
  puntosDebiles: [],
  fuenteSpecs: 'test',
  specs: { tipo, ...specs },
} as Producto);

const rawCatalogModules = import.meta.glob('../../content/productos/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function parseCatalogScalar(raw: string): unknown {
  const value = raw.trim();
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  return value;
}

function parseTopLevelCatalogScalar(source: string, key: string): unknown {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) throw new Error(`Catalog fixture is missing top-level ${key}`);
  return parseCatalogScalar(match[1]);
}

function parseCatalogSection(source: string, section: string): Record<string, unknown> {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trimEnd() === `${section}:`);
  if (start < 0) throw new Error(`Catalog fixture is missing ${section}`);
  const values: Record<string, unknown> = {};
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && !line.startsWith(' ')) break;
    const match = line.match(/^  ([A-Za-z0-9]+):\s*(.*?)\s*$/);
    if (match) values[match[1]] = parseCatalogScalar(match[2]);
  }
  if (Object.keys(values).length === 0) throw new Error(`Catalog fixture has empty ${section}`);
  return values;
}

function parseCatalogProduct(path: string, source: string): Producto {
  const tipo = parseTopLevelCatalogScalar(source, 'tipo');
  if (tipo !== 'silla' && tipo !== 'escritorio') {
    throw new Error(`${path} has unsupported tipo ${String(tipo)}`);
  }
  const tramoPrecio = parseTopLevelCatalogScalar(source, 'tramoPrecio');
  const valoracion = parseTopLevelCatalogScalar(source, 'valoracion');
  if (typeof tramoPrecio !== 'number') throw new Error(`${path} has invalid tramoPrecio`);
  if (valoracion !== null && typeof valoracion !== 'number') throw new Error(`${path} has invalid valoracion`);
  const slug = path.split('/').pop()?.replace(/\.yaml$/, '');
  if (!slug) throw new Error(`${path} has no slug`);
  return {
    ...product(tipo, slug, parseCatalogSection(source, 'specs')),
    tramoPrecio,
    valoracion,
    valoraciones: parseCatalogSection(source, 'valoraciones') as Producto['valoraciones'],
  };
}

const actualCatalogProducts = Object.entries(rawCatalogModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([path, source]) => parseCatalogProduct(path, source));

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function measurementQuestion(
  kind: 'number' | 'dimensions' = 'number',
  validation?: Record<string, number>,
): SelectorQuestion {
  return {
    id: 'measurement',
    kind,
    title: text('Measurement'),
    ...(kind === 'number' ? { inputLabel: text('Value') } : {}),
    effects: [criterion('measurement-fit')],
    ...(validation ? { validation } : {}),
  } as SelectorQuestion;
}

function configWithUnknownKey(level: string): unknown {
  const candidate = config() as unknown as Record<string, any>;
  const choice = candidate.questions[0];
  const option = choice.options[0];
  const effect = option.effects[0];

  switch (level) {
    case 'config': candidate.typo = true; break;
    case 'labels': candidate.labels.titel = text('Typo'); break;
    case 'routes': candidate.routes.catalogTypo = {}; break;
    case 'question': choice.visiblity = {}; break;
    case 'visibility':
      choice.visibility = { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0, typo: true };
      break;
    case 'validation': {
      const numeric = measurementQuestion('number', { min: 1 }) as unknown as Record<string, any>;
      numeric.validation.typo = true;
      candidate.questions = [numeric];
      break;
    }
    case 'option': option.descripton = text('Typo'); break;
    case 'criterion': effect.penality = { factor: 0.5 }; break;
    case 'rangeFields': {
      const range = criterion('range-fit') as unknown as Record<string, any>;
      range.operator = 'containsRange';
      delete range.field;
      range.rangeFields = ['specs.min', 'specs.max'];
      range.rangeFields.typo = true;
      candidate.questions = [{ id: 'range', kind: 'number', inputLabel: text('Value'), title: text('Range'), effects: [range] }];
      break;
    }
    case 'expression': effect.target.typo = true; break;
    case 'when': effect.when = { answerId: 'need', in: ['yes'], typo: true }; break;
    case 'fallback': effect.fallback = { field: 'specs.other', operator: 'equals', target: true, typo: true }; break;
    case 'penalty': effect.penalty = { factor: 0.5, typo: true }; break;
    case 'localizedText': choice.title.fr = 'Question'; break;
  }
  return candidate;
}

function compileTimeReadonlyAssertions(
  validated: ReadonlySelectorTypeConfig,
  configs: ReturnType<typeof discoverSelectorConfigs>,
  questions: ReturnType<typeof resolveVisibleQuestions>,
  eligible: ReturnType<typeof resolveEligibleSelectorConfigs>,
  sample: DeepReadonly<{ nested: { value: string }[] }>,
): void {
  // @ts-expect-error validated config properties are deeply readonly
  validated.tipo = 'mutated';
  // @ts-expect-error validated nested arrays are readonly
  validated.questions.push(question());
  // @ts-expect-error discovered config arrays cannot be sorted in place
  configs.sort(() => 0);
  // @ts-expect-error discovered nested localized copy is readonly
  configs[0].labels.singular.en = 'mutated';
  // @ts-expect-error visible question arrays cannot be pushed to
  questions.push(question());
  // @ts-expect-error visible nested question values are readonly
  questions[0].title.en = 'mutated';
  // @ts-expect-error eligible config arrays cannot be sorted in place
  eligible.sort(() => 0);
  // @ts-expect-error eligible nested products are readonly
  eligible[0].products[0].nombre = 'mutated';
  // @ts-expect-error exported DeepReadonly applies recursively
  sample.nested[0].value = 'mutated';
}
void compileTimeReadonlyAssertions;

const urlConfig = (): SelectorTypeConfig => ({
  ...config('gadget'),
  questions: [
    {
      id: 'choice', kind: 'single', title: text('Choice'), neutralValue: 'any',
      options: [
        { value: 'alpha', label: text('Alpha'), effects: [] },
        { value: 'any', label: text('Any'), effects: [] },
      ],
    },
    {
      id: 'tags', kind: 'multi', title: text('Tags'), neutralValue: [],
      validation: { maxSelections: 3 },
      options: [
        { value: 'plain', label: text('Plain'), effects: [] },
        { value: 'none', label: text('Literal none'), effects: [] },
        { value: 'comma,value', label: text('Comma'), effects: [] },
        { value: 'slash\\value', label: text('Slash'), effects: [] },
      ],
    },
    {
      id: 'amount', kind: 'number', inputLabel: text('Amount'), title: text('Amount'), neutralValue: null,
      validation: { min: 1, max: 9, step: 2 }, effects: [],
    },
    {
      id: 'size', kind: 'dimensions', title: text('Size'), neutralValue: null,
      validation: {
        components: {
          width: { min: 10, max: 20, step: 1, label: text('Width') },
          depth: { min: 5, max: 15, step: 1, label: text('Depth') },
        },
      },
      effects: [],
    },
  ],
});

describe('selector URL state', () => {
  it('round trips single, multi, number, dimensions and exact any values', () => {
    const source = {
      choice: 'any',
      tags: ['comma,value', 'slash\\value'],
      amount: 7,
      size: { width: 12, depth: 8 },
    };
    const params = serializeSelectorState('gadget', source, urlConfig());
    const parsed = parseSelectorUrl(params, [urlConfig()]);

    expect(parsed).toMatchObject({
      tipo: 'gadget',
      answers: source,
      status: 'complete',
      nextQuestionId: null,
      invalidKey: null,
    });
  });

  it('round trips null and empty-array neutral tokens', () => {
    const answers = { choice: 'alpha', tags: [], amount: null, size: null };
    const params = serializeSelectorState('gadget', answers, urlConfig());

    expect(params.get('tags')).toBe('none');
    expect(params.get('amount')).toBe('_');
    expect(params.get('size')).toBe('_');
    expect(parseSelectorUrl(params, [urlConfig()]).answers).toEqual(answers);
  });

  it.each(['number', 'dimensions'] as const)(
    'accepts the neutral URL token for %s only when null is explicitly declared',
    (kind) => {
      const cfg = urlConfig();
      const questionIndex = kind === 'number' ? 2 : 3;
      const measurement = cfg.questions[questionIndex] as Extract<SelectorQuestion, { kind: typeof kind }>;
      const withoutNeutral = {
        ...cfg,
        questions: cfg.questions.map((question, index) => index === questionIndex
          ? { ...measurement, neutralValue: undefined }
          : question),
      } as SelectorTypeConfig;
      delete (withoutNeutral.questions[questionIndex] as unknown as Record<string, unknown>).neutralValue;

      expect(parseSelectorUrl(`?tipo=gadget&${measurement.id}=_`, [withoutNeutral])).toMatchObject({
        status: 'invalid', invalidKey: measurement.id, answers: {},
      });
      expect(parseSelectorUrl(`?tipo=gadget&${measurement.id}=_`, [cfg]).answers).toMatchObject({
        [measurement.id]: null,
      });
    },
  );

  it('uses stable question order and comma escaping without mutating input', () => {
    const answers = {
      size: { depth: 8, width: 12 },
      tags: ['comma,value', 'plain'],
      choice: 'alpha',
      amount: 7,
    };
    const before = structuredClone(answers);
    const params = serializeSelectorState('gadget', answers, urlConfig());

    expect([...params.keys()]).toEqual(['tipo', 'choice', 'tags', 'amount', 'size']);
    expect(params.get('tags')).toBe('v:comma\\,value,plain');
    expect(params.get('size')).toBe('width:12,depth:8');
    expect(answers).toEqual(before);
  });

  it('detects partial and complete state in visible question order', () => {
    const cfg = urlConfig();
    const partial = parseSelectorUrl('?tipo=gadget&choice=alpha&amount=7', [cfg]);
    expect(partial).toMatchObject({ status: 'partial', nextQuestionId: 'tags' });

    const reordered = { ...cfg, questions: [cfg.questions[2], cfg.questions[0]] };
    expect(parseSelectorUrl('?tipo=gadget&choice=alpha', [reordered])).toMatchObject({
      status: 'partial', nextQuestionId: 'amount',
    });
    expect(parseSelectorUrl('?tipo=gadget&amount=7&choice=alpha', [reordered])).toMatchObject({
      status: 'complete', nextQuestionId: null,
    });
  });

  it('recovers from invalid type and invalid values while canonicalizing known state', () => {
    expect(parseSelectorUrl('?tipo=missing&choice=alpha', [urlConfig()])).toMatchObject({
      tipo: null, answers: {}, status: 'invalid', invalidKey: 'tipo', invalidReason: 'unknown-type', canonicalSearch: '',
    });

    const invalidValue = parseSelectorUrl(
      '?tracking=drop&tipo=gadget&choice=wrong&tags=v%3Aplain&amount=7',
      [urlConfig()],
    );
    expect(invalidValue).toMatchObject({
      tipo: 'gadget',
      answers: { tags: ['plain'], amount: 7 },
      status: 'invalid',
      invalidKey: 'choice',
      invalidReason: 'invalid-answer',
      nextQuestionId: 'choice',
      canonicalSearch: 'tipo=gadget&tags=v%3Aplain&amount=7',
    });
  });

  it('returns the earliest configured question when an earlier answer is missing and a later one is invalid', () => {
    const parsed = parseSelectorUrl(
      '?tipo=gadget&amount=99&size=_',
      [urlConfig()],
    );
    expect(parsed).toMatchObject({
      status: 'invalid',
      invalidKey: 'amount',
      nextQuestionId: 'choice',
      answers: { size: null },
    });
  });

  it.each([
    ['number outside range', '?tipo=gadget&choice=alpha&tags=none&amount=99&size=_', 'amount'],
    ['number off step', '?tipo=gadget&choice=alpha&tags=none&amount=2&size=_', 'amount'],
    ['unknown multi option', '?tipo=gadget&choice=alpha&tags=v%3Aother&amount=_&size=_', 'tags'],
    ['incomplete dimensions', '?tipo=gadget&choice=alpha&tags=none&amount=_&size=width:12', 'size'],
  ])('rejects %s', (_case, search, invalidKey) => {
    expect(parseSelectorUrl(search, [urlConfig()])).toMatchObject({
      status: 'invalid', invalidKey, nextQuestionId: invalidKey,
    });
  });

  it('removes unknown params from the canonical query', () => {
    const parsed = parseSelectorUrl(
      '?utm_source=x&tipo=gadget&choice=alpha&tags=none&amount=_&size=_&debug=1',
      [urlConfig()],
    );
    expect(parsed.status).toBe('complete');
    expect(parsed.canonicalSearch).toBe('tipo=gadget&choice=alpha&tags=none&amount=_&size=_');
  });

  it('keeps the empty sentinel distinct from a literal none option', () => {
    const cfg = urlConfig();
    const literal = serializeSelectorState('gadget', { tags: ['none'] }, cfg);
    expect(literal.get('tags')).toBe('v:none');
    expect(parseSelectorUrl(literal, [cfg]).answers.tags).toEqual(['none']);
    expect(parseSelectorUrl('?tipo=gadget&tags=none', [cfg]).answers.tags).toEqual([]);
  });

  it('round trips prefixed comma and backslash values', () => {
    const cfg = urlConfig();
    const params = serializeSelectorState('gadget', { tags: ['comma,value', 'slash\\value'] }, cfg);
    expect(params.get('tags')).toBe('v:comma\\,value,slash\\\\value');
    expect(parseSelectorUrl(params, [cfg]).answers.tags).toEqual(['comma,value', 'slash\\value']);
  });

  it.each([
    ['missing empty neutral', undefined, {}, '?tipo=gadget&choice=alpha&tags=none'],
    ['nonempty neutral', ['plain'], {}, '?tipo=gadget&choice=alpha&tags=none'],
    ['minimum one selection', [], { minSelections: 1 }, '?tipo=gadget&choice=alpha&tags=none'],
    ['legacy unprefixed value', [], {}, '?tipo=gadget&choice=alpha&tags=plain'],
  ] as const)('rejects empty sentinel for %s', (_case, neutralValue, validation, search) => {
    const cfg = urlConfig();
    const tags = cfg.questions[1] as Extract<SelectorQuestion, { kind: 'multi' }>;
    const invalid = {
      ...cfg,
      questions: [
        cfg.questions[0],
        { ...tags, neutralValue, validation },
        ...cfg.questions.slice(2),
      ],
    } as SelectorTypeConfig;
    expect(parseSelectorUrl(search, [invalid])).toMatchObject({
      status: 'invalid', invalidKey: 'tags', nextQuestionId: 'tags', answers: { choice: 'alpha' },
    });
  });

  it('contains no catalog-category or source vocabulary', () => {
    const source = readFileSync(new URL('./url.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/\b(?:chair|chairs|desk|desks|silla|sillas|escritorio|escritorios|category|source)\b/i);
  });
});

describe('selector UI state', () => {
  const visibleQuestions = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];

  it('finds the earliest unanswered visible question in configured order', () => {
    expect(firstUnansweredQuestionIndex(visibleQuestions, { second: 'yes', third: 'yes' })).toBe(0);
    expect(firstUnansweredQuestionIndex(visibleQuestions, { first: 'yes', third: 'yes' })).toBe(1);
  });

  it('treats own neutral and falsy answers as complete', () => {
    expect(firstUnansweredQuestionIndex(
      visibleQuestions,
      { first: null, second: [], third: false },
    )).toBe(-1);
    expect(firstUnansweredQuestionIndex([{ id: 'zero' }], { zero: 0 })).toBe(-1);
  });

  it('does not treat inherited answers as complete', () => {
    const answers = Object.create({ first: 'inherited' }) as Record<string, unknown>;
    answers.second = 'yes';
    answers.third = 'yes';
    expect(firstUnansweredQuestionIndex(visibleQuestions, answers)).toBe(0);
  });

  it.each([
    ['calculating', 0, 1, { mode: 'question', step: 0 }],
    ['results', 0, 1, { mode: 'question', step: 0 }],
    ['error', 0, 1, { mode: 'question', step: 0 }],
    ['calculating', 1, 3, { mode: 'question', step: 2 }],
    ['results', 1, 3, { mode: 'question', step: 2 }],
    ['error', 1, 3, { mode: 'question', step: 2 }],
  ] as const)('returns from %s to the final question', (mode, step, count, expected) => {
    expect(previousSelectorState({ mode, step }, count)).toEqual(expected);
  });

  it('decrements only in question mode and returns the first question to type', () => {
    expect(previousSelectorState({ mode: 'question', step: 2 }, 3)).toEqual({ mode: 'question', step: 1 });
    expect(previousSelectorState({ mode: 'question', step: 0 }, 3)).toEqual({ mode: 'type', step: -1 });
    expect(previousSelectorState({ mode: 'type', step: -1 }, 3)).toEqual({ mode: 'type', step: -1 });
  });

  it.each([
    [0, 'ArrowRight', 3, 1], [2, 'ArrowRight', 3, 0],
    [0, 'ArrowLeft', 3, 2], [2, 'ArrowLeft', 3, 1],
    [1, 'Home', 3, 0], [1, 'End', 3, 2],
    [0, 'Enter', 3, null], [0, 'ArrowRight', 0, null],
  ] as const)('resolves tab index %s + %s', (current, key, count, expected) => {
    expect(targetTabIndex(current, key, count)).toBe(expected);
  });
});

describe('selector clipboard fallback', () => {
  function clipboardFixture(execCommand: () => boolean) {
    const calls: string[] = [];
    const savedRange = { id: 'saved' };
    const textarea = {
      value: '', style: { position: '', opacity: '' },
      select: () => calls.push('select'), remove: () => calls.push('remove'),
    };
    const selection = {
      rangeCount: 1,
      getRangeAt: () => savedRange,
      removeAllRanges: () => calls.push('clear-selection'),
      addRange: (range: unknown) => calls.push(range === savedRange ? 'restore-selection' : 'wrong-range'),
    };
    const document = {
      activeElement: { focus: (options?: FocusOptions) => calls.push(options?.preventScroll ? 'restore-focus' : 'focus') },
      getSelection: () => selection,
      createElement: () => textarea,
      body: { append: () => calls.push('append') },
      execCommand,
    };
    return { calls, document, textarea };
  }

  it('cleans up and restores selection/focus when copy returns false', async () => {
    const fixture = clipboardFixture(() => false);
    await expect(copyText('share', undefined, fixture.document)).rejects.toThrow(/copy/i);
    expect(fixture.calls).toEqual([
      'append', 'select', 'remove', 'clear-selection', 'restore-selection', 'restore-focus',
    ]);
  });

  it('cleans up and restores selection/focus when copy throws', async () => {
    const fixture = clipboardFixture(() => { throw new Error('denied'); });
    await expect(copyText('share', undefined, fixture.document)).rejects.toThrow('denied');
    expect(fixture.calls).toEqual([
      'append', 'select', 'remove', 'clear-selection', 'restore-selection', 'restore-focus',
    ]);
  });

  it('uses the async clipboard without creating a fallback textarea', async () => {
    const fixture = clipboardFixture(() => true);
    const writes: string[] = [];
    await copyText('share', { writeText: async (value) => { writes.push(value); } }, fixture.document);
    expect(writes).toEqual(['share']);
    expect(fixture.calls).toEqual([]);
  });

  it('falls back when the async clipboard rejects', async () => {
    const fixture = clipboardFixture(() => true);
    await copyText('share', { writeText: async () => { throw new Error('denied'); } }, fixture.document);
    expect(fixture.calls).toEqual([
      'append', 'select', 'remove', 'clear-selection', 'restore-selection', 'restore-focus',
    ]);
  });

  it.each([
    ['returns false', (): boolean => false, /copy/i],
    ['throws', (): never => { throw new Error('fallback denied'); }, /fallback denied/],
  ] as const)('cleans up when async clipboard rejects and fallback %s', async (_case, execCommand, error) => {
    const fixture = clipboardFixture(execCommand);
    await expect(copyText(
      'share',
      { writeText: async () => { throw new Error('modern denied'); } },
      fixture.document,
    )).rejects.toThrow(error);
    expect(fixture.calls).toEqual([
      'append', 'select', 'remove', 'clear-selection', 'restore-selection', 'restore-focus',
    ]);
  });
});

describe('selector product payload', () => {
  it('accepts full products while projecting only selector-owned fields', () => {
    const full: Producto = {
      ...product('alpha', 'payload', { fit: true }),
      amazon: { asin: 'B000000000', buscar: 'payload' },
      webOficial: 'https://example.com',
      fuenteSpecs: 'fixture source',
    };
    const scoreable: SelectorProductPayload = full;
    const projected = projectSelectorProduct(full, 'es-ES');
    const projectedLocale: 'es-ES' = projected.locale;

    expect(projected).toEqual(expect.objectContaining({
      slug: 'payload', tipo: 'alpha', marca: 'M', specs: { tipo: 'alpha', fit: true },
    }));
    expect(scoreable.slug).toBe(full.slug);
    expect(projectedLocale).toBe('es-ES');
    expect(projected).not.toHaveProperty('amazon');
    expect(projected).not.toHaveProperty('webOficial');
    expect(projected).not.toHaveProperty('fuenteSpecs');
  });

  it('projects only active Spanish editorial data without retaining English', () => {
    const full = {
      ...product('alpha', 'payload-es', { fit: true }),
      nombre: 'Nombre español único',
      veredicto: 'Veredicto español único',
      idealPara: 'Ideal español único',
      limitaciones: ['Límite español único'],
      paraQuienSi: ['Sí español único'],
      paraQuienNo: ['No español único'],
      puntosFuertes: ['Fuerte español único'],
      puntosDebiles: ['Débil español único'],
      en: {
        nombreComercial: 'Unique English name',
        veredicto: 'Unique English verdict',
        idealPara: 'Unique English ideal',
        paraQuienSi: ['Unique English yes'],
        paraQuienNo: ['Unique English no'],
        puntosFuertes: ['Unique English strength'],
        puntosDebiles: ['Unique English weakness'],
      },
    } as Producto;

    const projected = projectSelectorProduct(full, 'es-ES');
    const serialized = JSON.stringify(projected);
    expect(projected).toMatchObject({
      locale: 'es-ES',
      nombre: 'Nombre español único',
      veredicto: 'Veredicto español único',
      idealPara: 'Ideal español único',
      limitaciones: ['Límite español único'],
    });
    expect(projected).not.toHaveProperty('en');
    expect(serialized).not.toContain('Unique English');
  });

  it('projects only localized English name, verdict and editorial data', () => {
    const full = {
      ...product('alpha', 'payload-en', { fit: true }),
      nombre: 'Nombre español único',
      veredicto: 'Veredicto español único',
      idealPara: 'Ideal español único',
      limitaciones: ['Límite español único'],
      paraQuienSi: ['Sí español único'],
      paraQuienNo: ['No español único'],
      puntosFuertes: ['Fuerte español único'],
      puntosDebiles: ['Débil español único'],
      en: {
        nombreComercial: 'Unique English name',
        veredicto: 'Unique English verdict',
        idealPara: 'Unique English ideal',
        paraQuienSi: ['Unique English yes'],
        paraQuienNo: ['Unique English no'],
        puntosFuertes: ['Unique English strength'],
        puntosDebiles: ['Unique English weakness'],
      },
    } as Producto;

    const projected = projectSelectorProduct(full, 'en');
    const serialized = JSON.stringify(projected);
    expect(projected).toMatchObject({
      locale: 'en',
      nombre: 'Unique English name',
      veredicto: 'Unique English verdict',
      idealPara: 'Unique English ideal',
      paraQuienSi: ['Unique English yes'],
      paraQuienNo: ['Unique English no'],
      puntosFuertes: ['Unique English strength'],
      puntosDebiles: ['Unique English weakness'],
    });
    expect(projected).not.toHaveProperty('en');
    expect(projected.limitaciones).toEqual([]);
    expect(serialized).not.toContain('español único');
  });

  it.each(['es-ES', 'en'] as const)('preserves %s scoring and explanation output after projection', (locale) => {
    const full = {
      ...product('alpha', 'payload-parity', { fit: true }),
      paraQuienSi: ['Encaja con la configuración solicitada'],
      puntosFuertes: ['Ajuste fiable'],
      idealPara: 'Una opción práctica',
      en: {
        nombreComercial: 'Payload parity',
        paraQuienSi: ['Fits the requested setup'],
        puntosFuertes: ['Reliable fit'],
        idealPara: 'A practical match',
      },
    } as Producto;
    const selectorConfig = config('alpha');
    const answers = { need: 'yes' };
    const fullScore = scoreProducts([full], answers, selectorConfig)[0];
    const explanationInput: Parameters<typeof generateProductExplanation>[0] = fullScore;
    const projectedScore = scoreProducts([projectSelectorProduct(full, locale)], answers, selectorConfig)[0];

    expect({ ...projectedScore, producto: undefined }).toEqual({ ...fullScore, producto: undefined });
    expect(generateProductExplanation(projectedScore, locale)).toEqual(generateProductExplanation(explanationInput, locale));
  });

  it('materially reduces catalog bytes and escapes HTML-significant payload text', () => {
    const fullJson = JSON.stringify(actualCatalogProducts);
    const projected = actualCatalogProducts.map((item) => projectSelectorProduct(item, 'es-ES'));
    const projectedJson = serializeSelectorPayload(projected);

    expect(projectedJson.length).toBeLessThan(fullJson.length * 0.94);
    expect(serializeSelectorPayload({ value: '</script><script>alert(1)</script>' }))
      .toBe('{"value":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}');
  });
});

describe('selector controller seams', () => {
  it('invalidates stale calculation generations on cancellation and restart', () => {
    const guard = createCalculationGuard();
    const first = guard.begin();
    expect(guard.isCurrent(first)).toBe(true);
    guard.cancel();
    expect(guard.isCurrent(first)).toBe(false);
    const second = guard.begin();
    expect(guard.isCurrent(second)).toBe(true);
    expect(guard.isCurrent(first)).toBe(false);
  });

  it('exposes tabs only in mobile layout and all cards in desktop layout', () => {
    expect(resultLayoutState(false, 1, 3)).toEqual({
      activeIndex: 1,
      tablistRole: null,
      tabs: [
        { role: null, selected: null, tabIndex: -1, hidden: false },
        { role: null, selected: null, tabIndex: -1, hidden: false },
        { role: null, selected: null, tabIndex: -1, hidden: false },
      ],
      cards: [
        { role: null, labelledBy: null, hidden: false },
        { role: null, labelledBy: null, hidden: false },
        { role: null, labelledBy: null, hidden: false },
      ],
    });
    expect(resultLayoutState(true, 9, 2)).toEqual({
      activeIndex: 1,
      tablistRole: 'tablist',
      tabs: [
        { role: 'tab', selected: false, tabIndex: -1, hidden: false },
        { role: 'tab', selected: true, tabIndex: 0, hidden: false },
        { role: 'tab', selected: null, tabIndex: -1, hidden: true },
      ],
      cards: [
        { role: 'tabpanel', labelledBy: 'selector-result-tab-1', hidden: true },
        { role: 'tabpanel', labelledBy: 'selector-result-tab-2', hidden: false },
      ],
    });
  });

  it('represents the initial type step as zero progress and question steps after it', () => {
    expect(selectorProgressState(-1, 4)).toEqual({ current: 0, total: 5, remaining: 5, percent: 0 });
    expect(selectorProgressState(0, 4)).toEqual({ current: 2, total: 5, remaining: 3, percent: 40 });
  });

  it('clones only plain serializable answer data without retaining references', () => {
    const answers = { choice: 'a', tags: ['x'], size: { width: 80, depth: 60 }, neutral: null };
    const cloned = cloneSelectorAnswers(answers);
    expect(cloned).toEqual(answers);
    expect(cloned).not.toBe(answers);
    expect(cloned.tags).not.toBe(answers.tags);
    expect(cloned.size).not.toBe(answers.size);
  });

  it('preserves the current hash while replacing canonical search state', () => {
    expect(selectorUrl('/selector/', 'tipo=silla', '#resultados')).toBe('/selector/?tipo=silla#resultados');
    expect(selectorUrl('/selector/', '', '#resultados')).toBe('/selector/#resultados');
  });

  it('preserves invalid recovery through back but clears it when the product type changes', () => {
    const parsed = parseSelectorUrl('?tipo=gadget&choice=wrong', [urlConfig()]);
    const invalid = initialRecoveryState(parsed.invalidKey, parsed.invalidReason);
    const afterBack = transitionRecoveryState(invalid, 'back');
    expect(afterBack).toEqual({ questionId: 'choice', invalidReason: 'invalid-answer' });
    expect(transitionRecoveryState(afterBack, 'change-type')).toEqual({
      questionId: null, invalidReason: null,
    });
  });

  it('clears invalid recovery after correction and reset', () => {
    const parsed = parseSelectorUrl('?tipo=gadget&amount=99', [urlConfig()]);
    const invalid = initialRecoveryState(parsed.invalidKey, parsed.invalidReason);
    expect(transitionRecoveryState(invalid, 'correct')).toEqual({ questionId: null, invalidReason: null });
    expect(transitionRecoveryState(invalid, 'reset')).toEqual({ questionId: null, invalidReason: null });
  });
});

describe('selector component source contracts', () => {
  const componentSource = (name: string) => readFileSync(
    new URL(`../../components/selector/${name}.astro`, import.meta.url),
    'utf8',
  );

  it('uses native semantic question controls with generic dimension rendering', () => {
    const source = componentSource('PasoPregunta');
    expect(source).toContain('<section');
    expect(source).toContain('<fieldset');
    expect(source).toContain('<legend');
    expect(source).toMatch(/type=.*radio/);
    expect(source).toContain('type="checkbox"');
    expect(source).toContain('type="number"');
    expect(source).toContain('Object.entries');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-describedby={describedBy}');
    expect(source).not.toMatch(/\b(?:ancho|fondo)\b/i);
  });

  it('provides one inert, lazy card template with safe runtime hooks', () => {
    const source = componentSource('CardProducto');
    expect(source.match(/<template\b/g)).toHaveLength(1);
    expect(source).toContain('data-selector-card-template');
    expect(source).toContain('data-card-rank');
    expect(source).toContain('data-card-score');
    expect(source).toContain('data-card-reasons');
    expect(source).toContain('data-card-warning');
    expect(source).toContain('loading="lazy"');
    expect(source).toMatch(/width="\d+"/);
    expect(source).toMatch(/height="\d+"/);
  });

  it('keeps result tabs inert in SSR while exposing runtime hooks and actions', () => {
    const source = componentSource('ResultadoTop3');
    const markup = source.slice(0, source.indexOf('<style>'));
    expect(source).toContain('aria-live="polite"');
    expect(markup).not.toContain('role="tablist"');
    expect(markup).not.toContain('role="tab"');
    expect(markup).not.toContain('aria-selected');
    expect(source).toContain('aria-controls');
    expect(source).toContain('data-result-tabs');
    expect(source).toContain('data-results-grid');
    expect(source).toContain('data-action-compare');
    expect(source).toContain('data-action-catalog');
    expect(source).toContain('data-action-reset');
    expect(source).toContain('data-action-copy');
    expect(source).toContain('<h2 data-result-empty-heading tabindex="-1">');
  });

  it('uses a bundled safe runtime with canonical URL state and documented results event', () => {
    const sources = [
      'PasoPregunta', 'CardProducto', 'ResultadoTop3', 'SelectorProductos',
    ].map(componentSource).join('\n');
    const runtime = componentSource('SelectorProductos');
    expect(sources).not.toContain('client:load');
    expect(sources).not.toContain('innerHTML');
    expect(runtime).toContain("import { scoreProducts }");
    expect(runtime).toContain('generateProductExplanation');
    expect(runtime).toContain('parseSelectorUrl');
    expect(runtime).toContain('serializeSelectorState');
    expect(runtime).toContain('history.replaceState');
    expect(runtime).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(runtime).toContain('1500');
    expect(runtime).toMatch(/\b100\b/);
    expect(runtime).toContain("CustomEvent('selector:results'");
    expect(runtime).toContain('selector:results exposes serializable');
    expect(runtime).toContain('preventScroll: true');
    expect(runtime).toContain("import { previousSelectorState, targetTabIndex }");
    expect(runtime).toContain("import { copyText }");
    expect(runtime).toContain('previousSelectorState({ mode, step }');
    expect(runtime).toContain('targetTabIndex(index, event.key');
    expect(runtime).toContain("event.key === 'ArrowRight'");
    expect(runtime).toContain("event.key === 'ArrowLeft'");
    expect(runtime).toContain("event.key === 'Home'");
    expect(runtime).toContain("event.key === 'End'");
    expect(runtime).not.toContain("document.createElement('textarea')");
  });

  it('transports projected data in escaped inert JSON and reads it through textContent', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain('projectSelectorProduct');
    expect(runtime).toContain('serializeSelectorPayload');
    expect(runtime).toContain('type="application/json"');
    expect(runtime).toContain('data-selector-payload');
    expect(runtime).toContain('payloadElement.textContent');
    expect(runtime).not.toContain('data-products=');
    expect(runtime).not.toContain('data-configs=');
    expect(runtime).not.toContain('dataset.products');
    expect(runtime).not.toContain('dataset.configs');
  });

  it('uses generation-guarded calculation and media-query change controller seams', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain('createCalculationGuard');
    expect(runtime).toContain('calculationGuard.begin()');
    expect(runtime).toContain('calculationGuard.isCurrent(generation)');
    expect(runtime).toContain('resultLayoutState');
    expect(runtime).toContain("matchMedia('(max-width: 720px)')");
    expect(runtime).toContain("addEventListener('change'");
    expect(runtime).not.toContain("addEventListener('resize'");
  });

  it('clears dynamic result schema whenever recommendations become stale', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain("CustomEvent('selector:clear-results', { bubbles: true })");

    const recalculation = runtime.slice(
      runtime.indexOf('const startCalculation = () =>'),
      runtime.indexOf('const reset = () =>'),
    );
    expect(recalculation).toContain('clearResultSchema();');
    expect(recalculation.indexOf('clearResultSchema();')).toBeLessThan(recalculation.indexOf('hideAll();'));

    const reset = runtime.slice(
      runtime.indexOf('const reset = () =>'),
      runtime.indexOf("root.querySelectorAll<HTMLInputElement>('[data-answer-neutral]')"),
    );
    expect(reset).toContain('clearResultSchema();');

    const typeChange = runtime.slice(runtime.indexOf('if (tipo !== selected.value)'), runtime.indexOf('tipo = selected.value;'));
    expect(typeChange).toContain('clearResultSchema();');

    const backFlow = runtime.slice(
      runtime.indexOf("back.addEventListener('click'"),
      runtime.indexOf("root.querySelector<HTMLButtonElement>('[data-action-reset]')"),
    );
    expect(backFlow).toContain("if (mode === 'calculating' || mode === 'results' || mode === 'error') clearResultSchema();");
  });

  it('preserves hashes, emits cloned plain answers, and recovers at the invalid question', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain('selectorUrl(window.location.pathname');
    expect(runtime).toContain('window.location.hash');
    expect(runtime).toContain('cloneSelectorAnswers(answers)');
    expect(runtime).not.toContain('structuredClone');
    expect(runtime).toContain('parsed.invalidReason');
    expect(runtime).toContain('parsed.invalidKey');
    expect(runtime).toContain('recoveryQuestionId');
    expect(runtime).toContain("panel.querySelector<HTMLInputElement>('input:not([disabled])')");
  });

  it('renders type selection as zero progress rather than a completed one-step flow', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain('selectorProgressState(step, config?.questions.length ?? 0)');
    expect(runtime).toContain("step < 0 ? copy.typeTitle");
    expect(runtime).toContain("progressbar.setAttribute('aria-valuemin', '0')");
  });

  it('clears all recovery UI and state before questions for a newly selected type', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain('let invalidReason');
    expect(runtime).toContain("const clearRecovery = (action: Exclude<RecoveryAction, 'back'>) =>");
    expect(runtime).toContain('recoveryQuestionId = cleared.questionId');
    expect(runtime).toContain('invalidReason = cleared.invalidReason');
    expect(runtime).toContain('recovery.hidden = true');
    expect(runtime).toContain("recovery.textContent = ''");
    expect(runtime).toContain("root.querySelectorAll<HTMLElement>('[data-question-error]')");

    const typeChange = runtime.slice(runtime.indexOf("if (tipo !== selected.value)"), runtime.indexOf('tipo = selected.value;'));
    expect(typeChange).toContain("clearRecovery('change-type');");
    expect(typeChange.indexOf("clearRecovery('change-type');")).toBeLessThan(typeChange.indexOf('answers = {};') + 'answers = {};'.length);

    const backFlow = runtime.slice(runtime.indexOf("back.addEventListener('click'"), runtime.indexOf("root.querySelector<HTMLButtonElement>('[data-action-reset]')"));
    expect(backFlow).not.toContain('clearRecovery');
  });

  it('clears recovery immediately after correcting the affected answer and reset clears it too', () => {
    const runtime = componentSource('SelectorProductos');
    const correction = runtime.slice(
      runtime.indexOf('answers[question.id] = validated.answers[question.id]'),
      runtime.indexOf('if (step + 1 < config.questions.length)'),
    );
    expect(correction).toContain("if (recoveryQuestionId === question.id) clearRecovery('correct');");
    expect(correction.indexOf("clearRecovery('correct');")).toBeLessThan(correction.indexOf('canonicalize();'));

    const calculationAndResults = runtime.slice(runtime.indexOf('const finishCalculation = () =>'), runtime.indexOf('const reset = () =>'));
    expect(calculationAndResults).not.toContain('recovery.hidden = false');

    const reset = runtime.slice(runtime.indexOf('const reset = () =>'), runtime.indexOf("root.querySelectorAll<HTMLInputElement>('[data-answer-neutral]')"));
    expect(reset).toContain("clearRecovery('reset');");
    expect(reset).not.toContain('recovery.hidden = true');
  });

  it('keeps fallback clipboard cleanup in a finally block', () => {
    const source = readFileSync(new URL('./clipboard.ts', import.meta.url), 'utf8');
    expect(source).toContain('finally');
    expect(source).toContain('textarea?.remove()');
    expect(source).toContain('selection.removeAllRanges()');
    expect(source).toContain('activeElement?.focus({ preventScroll: true })');
  });

  it('guards calculation by returning to the earliest unanswered visible question', () => {
    const runtime = componentSource('SelectorProductos');
    expect(runtime).toContain("import { firstUnansweredQuestionIndex }");
    expect(runtime).toContain('firstUnansweredQuestionIndex(config.questions, answers)');
    expect(runtime).toContain('if (unanswered >= 0) { showQuestion(unanswered); return; }');

    const calculation = runtime.slice(runtime.indexOf('const startCalculation = () =>'));
    expect(calculation.indexOf('firstUnansweredQuestionIndex')).toBeLessThan(calculation.indexOf('hideAll()'));
    expect(calculation.indexOf('firstUnansweredQuestionIndex')).toBeLessThan(calculation.indexOf('setTimeout'));
  });

  it('ships public workflow and recovery copy in Spanish and English', () => {
    const source = componentSource('SelectorProductos');
    for (const copy of [
      'Continuar', 'Continue', 'Atrás', 'Back', 'Paso', 'Step', 'Quedan', 'remaining',
      'Enlace copiado', 'Link copied', 'No hemos podido leer', 'We could not read',
    ]) expect(source).toContain(copy);
  });
});

describe('validateSelectorConfig', () => {
  it.each([
    ['missing validation', undefined],
    ['empty validation', {}],
    ['numeric validation', { min: 1, max: 10, step: 1 }],
    ['empty components', { components: {} }],
  ])('rejects dimensions with %s', (_case, validation) => {
    const dimensions = measurementQuestion('dimensions') as unknown as Record<string, unknown>;
    if (validation === undefined) delete dimensions.validation;
    else dimensions.validation = validation;

    expect(() => validateSelectorConfig(
      config('alpha', [dimensions as unknown as SelectorQuestion]),
      'dimensions-validation-source',
    )).toThrow(/dimensions-validation-source.*measurement.*validation.*components.*nonempty/i);
  });

  it.each(['number', 'dimensions'] as const)(
    'allows %s to omit neutral support but rejects non-null neutral values',
    (kind) => {
      const measurement = measurementQuestion(kind) as unknown as Record<string, unknown>;
      if (kind === 'dimensions') {
        measurement.validation = {
          components: { width: { min: 1, max: 10, label: text('Width') } },
        };
      }
      expect(validateSelectorConfig(
        config('alpha', [measurement as unknown as SelectorQuestion]),
        'neutral-source',
      ).questions[0]).not.toHaveProperty('neutralValue');

      measurement.neutralValue = 0;
      expect(() => validateSelectorConfig(
        config('alpha', [measurement as unknown as SelectorQuestion]),
        'neutral-source',
      )).toThrow(/neutral-source.*measurement.*neutralValue.*null/i);

      measurement.neutralValue = null;
      expect(validateSelectorConfig(
        config('alpha', [measurement as unknown as SelectorQuestion]),
        'neutral-source',
      ).questions[0]).toHaveProperty('neutralValue', null);
    },
  );

  it('requires strict localized labels for numeric questions and dimension components', () => {
    const missingInput = config();
    missingInput.questions = [measurementQuestion()];
    delete (missingInput.questions[0] as unknown as Record<string, unknown>).inputLabel;
    expect(() => validateSelectorConfig(missingInput, 'numeric-label-source')).toThrow(/inputLabel.*localized/i);

    const badUnit = config();
    const numericQuestion = measurementQuestion();
    if (numericQuestion.kind !== 'number') throw new Error('Expected numeric question fixture');
    badUnit.questions = [{ ...numericQuestion, unit: { 'es-ES': 'cm', en: ' ' } }];
    expect(() => validateSelectorConfig(badUnit, 'numeric-unit-source')).toThrow(/unit\.en.*nonempty/i);

    const dimensions = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
    dimensions.validation = { components: { width: { min: 1, max: 10 } } } as never;
    const missingComponentLabel = config();
    missingComponentLabel.questions = [dimensions];
    expect(() => validateSelectorConfig(missingComponentLabel, 'dimension-label-source')).toThrow(/components\.width\.label.*localized/i);
  });

  it('renders configured localized numeric labels and visible units without generic fallbacks', () => {
    const source = readFileSync(new URL('../../components/selector/PasoPregunta.astro', import.meta.url), 'utf8');
    expect(source).toContain('question.inputLabel[locale]');
    expect(source).toContain('validation.label[locale]');
    expect(source).toContain('question.unit?.[locale]');
    expect(source).toContain('validation.unit?.[locale]');
    expect(source).not.toMatch(/Measurement|Medida|>Value<|>Valor</);
  });

  it('accepts the exact localized route contract', () => {
    const valid = config();
    const validated = validateSelectorConfig(valid, 'route-source');
    expect(validated).toEqual(valid);
    expect(validated).not.toBe(valid);
    expect(valid.routes).toEqual({
      catalogType: { 'es-ES': 'alpha', en: 'alpha' },
      editorialCategories: { 'es-ES': ['guide-alpha'], en: ['guide-alpha'] },
    });
  });

  it.each([
    ['catalogType.en', (invalid: Record<string, any>) => delete invalid.routes.catalogType.en],
    ['catalogType.en', (invalid: Record<string, any>) => { invalid.routes.catalogType.en = ' '; }],
    ['editorialCategories.en', (invalid: Record<string, any>) => delete invalid.routes.editorialCategories.en],
    ['editorialCategories.es-ES', (invalid: Record<string, any>) => { invalid.routes.editorialCategories['es-ES'] = []; }],
    ['editorialCategories.en', (invalid: Record<string, any>) => { invalid.routes.editorialCategories.en = ['']; }],
  ])('rejects invalid localized route mapping %s', (routePath, mutate) => {
    const invalid = config() as unknown as Record<string, any>;
    mutate(invalid);
    expect(() => validateSelectorConfig(invalid, 'route-source'))
      .toThrow(new RegExp(`route-source.*alpha.*routes.*${routePath.replace('.', '.*')}`, 'i'));
  });

  it('rejects duplicate and empty question IDs with source context', () => {
    expect(() => validateSelectorConfig(config('alpha', [question('same'), question('same', 'other')]), './config-alpha.ts'))
      .toThrow(/config-alpha\.ts.*alpha.*question.*same/i);
    expect(() => validateSelectorConfig(config('alpha', [question('  ')]), './config-alpha.ts'))
      .toThrow(/config-alpha\.ts.*alpha.*question.*nonempty/i);
  });

  it('rejects criterion IDs duplicated across the whole config', () => {
    const duplicate = question();
    duplicate.options?.push({ value: 'no', label: text('No'), effects: [criterion()] });
    expect(() => validateSelectorConfig(config('alpha', [duplicate]), 'fake-module'))
      .toThrow(/fake-module.*alpha.*criterion.*fit.*duplicate/i);
  });

  it.each([[-1], [Number.NaN]])('rejects invalid criterion weight %s', (weight) => {
    const invalid = config();
    invalid.questions[0].options![0].effects[0].weight = weight;
    expect(() => validateSelectorConfig(invalid, 'weight-source'))
      .toThrow(/weight-source.*alpha.*criterion.*fit.*weight/i);
  });

  it.each([[-0.01], [1.01], [Number.NaN]])('rejects missingScore outside 0..1: %s', (missingScore) => {
    const invalid = config();
    invalid.questions[0].options![0].effects[0].missingScore = missingScore;
    expect(() => validateSelectorConfig(invalid, 'score-source'))
      .toThrow(/score-source.*alpha.*criterion.*fit.*missingScore/i);
  });

  it('rejects incomplete localized copy', () => {
    const invalid = config();
    invalid.questions[0].title = { 'es-ES': 'Pregunta', en: '' };
    expect(() => validateSelectorConfig(invalid, 'copy-source'))
      .toThrow(/copy-source.*alpha.*question.*need.*title.*en/i);
  });

  it('rejects incomplete localized labels', () => {
    const invalid = config() as unknown as { labels: { singular: Record<string, string> } };
    delete invalid.labels.singular.en;
    expect(() => validateSelectorConfig(invalid, 'label-source'))
      .toThrow(/label-source.*alpha.*labels.*singular.*en/i);
  });

  it('requires strict singular, plural, and nonempty icon labels', () => {
    expect(validateSelectorConfig(config(), 'label-source').labels).toEqual({
      singular: text('Selector alpha'),
      plural: text('Selectors alpha'),
      icon: 'test-icon',
    });

    const missingPlural = config() as unknown as Record<string, any>;
    delete missingPlural.labels.plural;
    expect(() => validateSelectorConfig(missingPlural, 'label-source'))
      .toThrow(/label-source.*labels.*plural/i);

    const emptyIcon = config() as unknown as Record<string, any>;
    emptyIcon.labels.icon = ' ';
    expect(() => validateSelectorConfig(emptyIcon, 'label-source'))
      .toThrow(/label-source.*labels.*icon.*nonempty/i);
  });

  it('returns an isolated deeply frozen validation snapshot', () => {
    const source = config();
    const validated = validateSelectorConfig(source, 'snapshot-source');
    const originalTitle = validated.labels.singular.en;
    const originalReason = validated.questions[0].options![0].effects[0].reason.en;
    source.labels.singular.en = 'Mutated source';
    source.questions[0].options![0].effects[0].reason.en = 'Mutated source reason';
    expect(validated).not.toBe(source);
    expect(validated.labels.singular.en).toBe(originalTitle);
    expect(validated.questions[0].options![0].effects[0].reason.en).toBe(originalReason);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated.questions)).toBe(true);
    expect(Object.isFrozen(validated.questions[0].options![0].effects[0].reason)).toBe(true);
    expect(() => {
      // @ts-expect-error runtime assertion verifies the same readonly contract
      validated.labels.singular.en = 'Runtime mutation';
    }).toThrow(TypeError);
  });

  it.each([
    ['config', 'typo'], ['labels', 'titel'], ['routes', 'catalogTypo'], ['question', 'visiblity'],
    ['visibility', 'typo'], ['validation', 'typo'], ['option', 'descripton'], ['criterion', 'penality'],
    ['rangeFields', 'typo'], ['expression', 'typo'], ['when', 'typo'], ['fallback', 'typo'],
    ['penalty', 'typo'], ['localizedText', 'fr'],
  ])('rejects unknown keys at the %s level', (level, key) => {
    expect(() => validateSelectorConfig(configWithUnknownKey(level), 'strict-source'))
      .toThrow(new RegExp(`strict-source.*alpha.*unknown key.*${key}`, 'i'));
  });

  it('includes question and criterion context for criterion typos', () => {
    expect(() => validateSelectorConfig(configWithUnknownKey('criterion'), 'typo-source'))
      .toThrow(/typo-source.*alpha.*question.*need.*criterion.*fit.*unknown key.*penality/i);
  });

  it('requires complete criterion warning copy', () => {
    const invalid = config() as unknown as { questions: { options: { effects: Record<string, unknown>[] }[] }[] };
    delete invalid.questions[0].options[0].effects[0].warning;
    expect(() => validateSelectorConfig(invalid, 'warning-source'))
      .toThrow(/warning-source.*alpha.*criterion.*fit.*warning/i);
  });

  it('validates localized editorial keyword arrays without cross-locale fallback', () => {
    const valid = config();
    valid.questions[0].options![0].effects[0].editorialKeywords = {
      'es-ES': ['ajuste preciso'],
      en: ['precise fit'],
    };
    expect(validateSelectorConfig(valid, 'keyword-source').questions[0].options![0].effects[0].editorialKeywords)
      .toEqual({ 'es-ES': ['ajuste preciso'], en: ['precise fit'] });

    const missingLocale = config() as unknown as Record<string, any>;
    missingLocale.questions[0].options[0].effects[0].editorialKeywords = { en: ['fit'] };
    expect(() => validateSelectorConfig(missingLocale, 'keyword-source'))
      .toThrow(/keyword-source.*editorialKeywords.*es-ES/i);

    const invalidItem = config() as unknown as Record<string, any>;
    invalidItem.questions[0].options[0].effects[0].editorialKeywords = {
      'es-ES': [''], en: ['fit'],
    };
    expect(() => validateSelectorConfig(invalidItem, 'keyword-source'))
      .toThrow(/keyword-source.*editorialKeywords.*es-ES.*nonempty/i);
  });

  it('strictly validates cross-answer when predicates', () => {
    const profile = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
    profile.id = 'profile';
    profile.effects[0].id = 'profile-fit';
    profile.validation = { components: { mode: { min: 0, max: 1, label: text('Mode') } } };
    const valid = config('alpha', [question(), profile]);
    valid.questions[0].options![0].effects[0].when = {
      answerId: 'profile', in: ['active', true], answerKey: 'mode',
    };
    expect(validateSelectorConfig(valid, 'when-source').questions[0].options![0].effects[0].when)
      .toEqual({ answerId: 'profile', in: ['active', true], answerKey: 'mode' });

    for (const when of [
      { answerId: '', in: ['active'] },
      { answerId: 'profile', in: 'active' },
      { answerId: 'profile', in: [] },
      { answerId: 'profile', in: ['active'], answerKey: '' },
      { answerId: 'profile', in: ['active'], extra: true },
    ]) {
      const invalid = config() as unknown as Record<string, any>;
      invalid.questions[0].options[0].effects[0].when = when;
      expect(() => validateSelectorConfig(invalid, 'when-source')).toThrow(/when-source.*when/i);
    }
  });

  it('rejects cross-answer predicates that reference an unknown question ID', () => {
    const invalid = config();
    invalid.questions[0].options![0].effects[0].when = { answerId: 'typo', in: ['yes'] };
    expect(() => validateSelectorConfig(invalid, 'when-reference-source'))
      .toThrow(/when-reference-source.*criterion.*fit.*when.*answerId.*typo.*question/i);
  });

  it('rejects predicate values outside a referenced single or multi option domain', () => {
    const need = question();
    need.options![0].effects[0].when = { answerId: 'mode', in: ['missing'] };
    const mode = question('mode', 'mode-fit');
    expect(() => validateSelectorConfig(config('alpha', [need, mode]), 'when-option-source'))
      .toThrow(/when-option-source.*criterion.*fit.*when.*missing.*option/i);
  });

  it('allows answerKey only for a declared component of a dimensions question', () => {
    const need = question();
    const mode = question('mode', 'mode-fit');
    need.options![0].effects[0].when = { answerId: 'mode', in: ['yes'], answerKey: 'value' };
    expect(() => validateSelectorConfig(config('alpha', [need, mode]), 'when-key-source'))
      .toThrow(/when-key-source.*criterion.*fit.*when.*answerKey.*dimensions/i);

    const dimensions = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
    dimensions.id = 'profile';
    dimensions.effects[0].id = 'profile-fit';
    dimensions.validation = { components: { width: { min: 1, max: 10, label: text('Width') } } };
    need.options![0].effects[0].when = { answerId: 'profile', in: [5], answerKey: 'height' };
    expect(() => validateSelectorConfig(config('alpha', [need, dimensions]), 'when-key-source'))
      .toThrow(/when-key-source.*criterion.*fit.*when.*answerKey.*height.*components/i);

    need.options![0].effects[0].when = { answerId: 'profile', in: [5], answerKey: 'width' };
    expect(validateSelectorConfig(config('alpha', [need, dimensions]), 'when-key-source').questions[0])
      .toEqual(need);
  });

  it('validates alternate rules recursively with the same operator and target constraints', () => {
    const valid = config();
    valid.questions[0].options![0].effects[0].fallback = {
      rangeFields: ['specs.alternateMin', 'specs.alternateMax'],
      operator: 'containsRange',
      target: { source: 'answer', multiply: 0.5 },
      fallback: {
        field: 'specs.lastResort',
        operator: 'ranked',
        target: 'high',
        rank: { low: 1, high: 2 },
      },
    };
    expect(validateSelectorConfig(valid, 'fallback-source').questions[0].options![0].effects[0].fallback)
      .toEqual(valid.questions[0].options![0].effects[0].fallback);

    const invalidRank = config() as unknown as Record<string, any>;
    invalidRank.questions[0].options[0].effects[0].fallback = {
      field: 'specs.alternate', operator: 'ranked', target: 'high',
    };
    expect(() => validateSelectorConfig(invalidRank, 'fallback-source'))
      .toThrow(/fallback-source.*fallback.*rank/i);

    const invalidRange = config() as unknown as Record<string, any>;
    invalidRange.questions[0].options[0].effects[0].fallback = {
      field: 'specs.alternate', rangeFields: ['specs.low', 'specs.high'],
      operator: 'containsRange', target: 10,
    };
    expect(() => validateSelectorConfig(invalidRange, 'fallback-source'))
      .toThrow(/fallback-source.*fallback.*rejects field/i);
  });

  it.each(['atLeast', 'atMost', 'containsRange', 'axis'] as const)(
    'requires finite numeric static targets for %s',
    (operator) => {
      const makeEffect = (): SelectorCriterion => {
        const effect = criterion(`static-${operator}`);
        effect.operator = operator;
        if (operator === 'containsRange') {
          delete effect.field;
          effect.rangeFields = ['specs.minimum', 'specs.maximum'];
        }
        return effect;
      };
      const makeQuestion = (effect: SelectorCriterion): SelectorQuestion => ({
        id: 'static-target', kind: 'number', inputLabel: text('Value'), title: text('Static target'), effects: [effect],
      });

      for (const target of [
        '10',
        { source: 'literal', value: '10' },
        { source: 'literal', value: Number.MAX_VALUE, multiply: 2 },
      ]) {
        const effect = makeEffect();
        effect.target = target as SelectorCriterion['target'];
        expect(() => validateSelectorConfig(config('alpha', [makeQuestion(effect)]), 'static-target-source'))
          .toThrow(/static-target-source.*target.*finite numeric/i);
      }

      for (const target of [
        10,
        { source: 'literal', value: 5, multiply: 2 },
        { source: 'answer' },
      ]) {
        const effect = makeEffect();
        effect.target = target as SelectorCriterion['target'];
        expect(validateSelectorConfig(config('alpha', [makeQuestion(effect)]), 'static-target-source'))
          .toBeDefined();
      }
    },
  );

  it('requires ranked static targets to be scalar keys present in rank', () => {
    const makeRanked = (target: SelectorCriterion['target']): SelectorCriterion => ({
      ...criterion('ranked-static'),
      operator: 'ranked',
      target,
      rank: { low: 1, high: 2, '2': 3 },
    });
    const makeQuestion = (effect: SelectorCriterion): SelectorQuestion => ({
      id: 'ranked-target', kind: 'number', inputLabel: text('Value'), title: text('Ranked target'), effects: [effect],
    });

    for (const target of ['unknown', ['high'], { source: 'literal', value: 'unknown' }] as const) {
      expect(() => validateSelectorConfig(
        config('alpha', [makeQuestion(makeRanked(target as SelectorCriterion['target']))]),
        'ranked-target-source',
      )).toThrow(/ranked-target-source.*ranked.*target.*rank/i);
    }

    for (const target of [
      'high',
      { source: 'literal', value: 'high' },
      { source: 'literal', value: 1, add: 1 },
      { source: 'answer' },
    ]) {
      expect(validateSelectorConfig(
        config('alpha', [makeQuestion(makeRanked(target as SelectorCriterion['target']))]),
        'ranked-target-source',
      )).toBeDefined();
    }
  });

  it('requires boolean static targets while allowing answer-sourced targets', () => {
    const makeBoolean = (target: SelectorCriterion['target']): SelectorCriterion => ({
      ...criterion('boolean-static'), operator: 'boolean', target,
    });
    const makeQuestion = (effect: SelectorCriterion): SelectorQuestion => ({
      id: 'boolean-target', kind: 'number', inputLabel: text('Value'), title: text('Boolean target'), effects: [effect],
    });

    for (const target of ['true', 1, { source: 'literal', value: 'true' }] as const) {
      expect(() => validateSelectorConfig(
        config('alpha', [makeQuestion(makeBoolean(target as SelectorCriterion['target']))]),
        'boolean-target-source',
      )).toThrow(/boolean-target-source.*boolean.*target/i);
    }
    for (const target of [true, false, { source: 'literal', value: true }, { source: 'answer' }]) {
      expect(validateSelectorConfig(
        config('alpha', [makeQuestion(makeBoolean(target as SelectorCriterion['target']))]),
        'boolean-target-source',
      )).toBeDefined();
    }
  });

  it('applies static target validation recursively to fallback rules', () => {
    const invalid = config() as unknown as Record<string, any>;
    invalid.questions[0].options[0].effects[0].fallback = {
      field: 'specs.alternate', operator: 'atLeast', target: '10',
    };
    expect(() => validateSelectorConfig(invalid, 'fallback-target-source'))
      .toThrow(/fallback-target-source.*fallback.*target.*finite numeric/i);
  });

  it.each(['single', 'multi'] as const)(
    'rejects structurally duplicate scalar and array option values for %s questions',
    (kind) => {
      for (const values of [['same', 'same'], [['a', 'b'], ['a', 'b']]] as const) {
        const duplicate = {
          id: 'duplicates',
          kind,
          title: text('Duplicates'),
          options: values.map((value) => ({
            value: Array.isArray(value) ? [...value] : value,
            label: text('Value'),
            effects: [],
          })),
        } as SelectorQuestion;
        expect(() => validateSelectorConfig(config('alpha', [duplicate]), 'duplicate-option-source'))
          .toThrow(/duplicate-option-source.*duplicates.*duplicate option value/i);
      }
    },
  );

  it('rejects invalid question kinds with source and type context', () => {
    const invalid = config() as unknown as { questions: Record<string, unknown>[] };
    invalid.questions[0].kind = 'choice';
    expect(() => validateSelectorConfig(invalid, 'kind-source'))
      .toThrow(/kind-source.*alpha.*question.*need.*kind/i);
  });

  it('rejects invalid criterion operators with full context', () => {
    const invalid = config() as unknown as { questions: { options: { effects: Record<string, unknown>[] }[] }[] };
    invalid.questions[0].options[0].effects[0].operator = 'near';
    expect(() => validateSelectorConfig(invalid, 'operator-source'))
      .toThrow(/operator-source.*alpha.*question.*need.*criterion.*fit.*operator/i);
  });

  it.each([
    [{ source: 'unknown', value: true }, /source/i],
    [{ source: 'literal', value: true, multiply: Number.NaN }, /multiply/i],
    [{ source: 'literal', value: true, add: Number.POSITIVE_INFINITY }, /add/i],
    [{ source: 'literal' }, /literal.*value/i],
  ])('rejects malformed answer expressions: %j', (target, expected) => {
    const invalid = config() as unknown as { questions: { options: { effects: Record<string, unknown>[] }[] }[] };
    invalid.questions[0].options[0].effects[0].target = target;
    expect(() => validateSelectorConfig(invalid, 'expression-source')).toThrow(expected);
  });

  it('accepts a nonempty answerKey only on answer expressions', () => {
    const valid = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
    valid.validation = { components: { primary: { min: 1, max: 10, label: text('Primary') } } };
    valid.effects[0].target = { source: 'answer', answerKey: 'primary', multiply: 2, add: 1 };
    expect(validateSelectorConfig(config('alpha', [valid]), 'answer-key-source').questions[0])
      .toEqual(valid);

    const emptyKey = config('alpha', [valid]) as unknown as Record<string, any>;
    emptyKey.questions[0].effects[0].target.answerKey = ' ';
    expect(() => validateSelectorConfig(emptyKey, 'answer-key-source'))
      .toThrow(/answer-key-source.*answerKey.*nonempty/i);

    const literalKey = config() as unknown as Record<string, any>;
    literalKey.questions[0].options[0].effects[0].target = {
      source: 'literal', value: 1, answerKey: 'primary',
    };
    expect(() => validateSelectorConfig(literalKey, 'answer-key-source'))
      .toThrow(/answer-key-source.*answerKey.*answer expression/i);
  });

  it('requires answerKey for numeric targets sourced from dimensions answers', () => {
    const dimensions = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
    dimensions.validation = {
      components: { primary: { min: 1, max: 10, label: text('Primary') } },
    };
    dimensions.effects[0].operator = 'atLeast';
    dimensions.effects[0].target = { source: 'answer' };
    expect(() => validateSelectorConfig(config('alpha', [dimensions]), 'dimension-key-source'))
      .toThrow(/dimension-key-source.*measurement-fit.*answerKey/i);

    dimensions.effects[0].target = { source: 'literal', value: 10 };
    expect(validateSelectorConfig(config('alpha', [dimensions]), 'dimension-literal-source').questions[0])
      .toEqual(dimensions);
  });

  it.each([
    ['equals', true, undefined],
    ['boolean', true, undefined],
    ['ranked', 'high', { low: 1, high: 2 }],
  ] as const)(
    'requires answerKey for %s targets sourced from dimensions answers',
    (operator, literalValue, rank) => {
      const dimensions = measurementQuestion('dimensions') as Extract<SelectorQuestion, { kind: 'dimensions' }>;
      dimensions.validation = {
        components: { primary: { min: 1, max: 10, label: text('Primary') } },
      };
      dimensions.effects[0].operator = operator;
      dimensions.effects[0].target = { source: 'answer' };
      if (rank) dimensions.effects[0].rank = rank;

      expect(() => validateSelectorConfig(config('alpha', [dimensions]), 'dimension-key-source'))
        .toThrow(/dimension-key-source.*measurement-fit.*answerKey/i);

      dimensions.effects[0].target = { source: 'literal', value: literalValue };
      expect(validateSelectorConfig(config('alpha', [dimensions]), 'dimension-literal-source').questions[0])
        .toEqual(dimensions);
    },
  );

  it('rejects non-range operators without a field', () => {
    const invalid = config() as unknown as { questions: { options: { effects: Record<string, unknown>[] }[] }[] };
    delete invalid.questions[0].options[0].effects[0].field;
    expect(() => validateSelectorConfig(invalid, 'field-source'))
      .toThrow(/field-source.*alpha.*question.*need.*criterion.*fit.*requires field/i);
  });

  it.each([
    [{ factor: -0.01 }, /factor/i], [{ factor: 1.01 }, /factor/i], [{ factor: Number.NaN }, /factor/i],
    [{ factor: 0.5, cap: -0.01 }, /cap/i], [{ factor: 0.5, cap: 100.01 }, /cap/i],
    [{ factor: 0.5, cap: Number.NaN }, /cap/i],
  ])('rejects invalid criterion penalty %j', (penalty, expected) => {
    const invalid = config();
    invalid.questions[0].options![0].effects[0].penalty = penalty;
    expect(() => validateSelectorConfig(invalid, 'penalty-source')).toThrow(expected);
  });

  it('enforces exclusive field shapes for range and non-range operators', () => {
    const range = criterion();
    range.operator = 'containsRange';
    range.rangeFields = ['specs.min', 'specs.max'];
    expect(() => validateSelectorConfig(config('alpha', [{
      id: 'range-question', kind: 'number', inputLabel: text('Value'), title: text('Range'), effects: [range],
    }]), 'range-source')).toThrow(/range-source.*alpha.*range-question.*fit.*rejects field/i);

    const scalar = criterion();
    scalar.rangeFields = ['specs.min', 'specs.max'];
    expect(() => validateSelectorConfig(config('alpha', [{
      id: 'scalar-question', kind: 'number', inputLabel: text('Value'), title: text('Scalar'), effects: [scalar],
    }]), 'shape-source')).toThrow(/shape-source.*alpha.*scalar-question.*fit.*rangeFields/i);
  });

  it('requires exactly two range fields for containsRange', () => {
    const range = { ...criterion(), operator: 'containsRange' as const, field: undefined };
    expect(() => validateSelectorConfig(config('alpha', [{
      id: 'range-question', kind: 'number', inputLabel: text('Value'), title: text('Range'), effects: [range],
    }]), 'range-source')).toThrow(/range-source.*alpha.*range-question.*fit.*two rangeFields/i);
  });

  it.each([[undefined], [{}], [{ low: 0, high: Number.NaN }]])(
    'requires a nonempty finite rank map: %j',
    (rank) => {
      const ranked = { ...criterion(), operator: 'ranked' as const, rank } as SelectorCriterion;
      expect(() => validateSelectorConfig(config('alpha', [{
        id: 'rank-question', kind: 'number', inputLabel: text('Value'), title: text('Rank'), effects: [ranked],
      }]), 'rank-source')).toThrow(/rank-source.*alpha.*rank-question.*fit.*rank/i);
    },
  );

  it.each(['single', 'multi'] as const)('%s questions require options and reject question effects', (kind) => {
    const withoutOptions = { id: 'choice', kind, title: text('Choice') } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [withoutOptions]), 'choice-source'))
      .toThrow(/choice-source.*alpha.*question.*choice.*options/i);
    const withEffects = {
      ...question('choice'), kind, effects: [criterion('question-fit')],
    } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [withEffects]), 'choice-source'))
      .toThrow(/choice-source.*alpha.*question.*choice.*question-level effects/i);
  });

  it.each(['number', 'dimensions'] as const)('%s questions require effects and reject options', (kind) => {
    const withoutEffects = { id: 'measurement', kind, title: text('Measurement'), ...(kind === 'number' ? { inputLabel: text('Value') } : {}) } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [withoutEffects]), 'measurement-source'))
      .toThrow(/measurement-source.*alpha.*question.*measurement.*effects/i);
    const withOptions = {
      id: 'measurement', kind, title: text('Measurement'), effects: [criterion()], ...(kind === 'number' ? { inputLabel: text('Value') } : {}),
      options: [{ value: 1, label: text('One'), effects: [criterion('option-fit')] }],
    } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [withOptions]), 'measurement-source'))
      .toThrow(/measurement-source.*alpha.*question.*measurement.*options/i);
  });

  it.each([
    [{ min: Number.NaN }, /validation.*min.*finite/i],
    [{ max: Number.POSITIVE_INFINITY }, /validation.*max.*finite/i],
    [{ min: 10, max: 5 }, /min.*exceed.*max/i],
    [{ step: 0 }, /step.*greater than 0/i],
  ])('rejects incoherent numeric validation %j', (validation, expected) => {
    const numeric = { id: 'numeric', kind: 'number' as const, inputLabel: text('Value'), title: text('Numeric'), effects: [criterion()], validation };
    expect(() => validateSelectorConfig(config('alpha', [numeric]), 'validation-source')).toThrow(expected);
  });

  it.each([
    [{ fields: ['specs.fit'], mode: 'some', minProducts: 1, minRatio: 1 }, /mode/i],
    [{ fields: ['specs.fit'], mode: 'all', minProducts: -1, minRatio: 1 }, /minProducts/i],
    [{ fields: ['specs.fit'], mode: 'all', minProducts: 1.5, minRatio: 1 }, /minProducts/i],
    [{ fields: ['specs.fit'], mode: 'all', minProducts: 1, minRatio: -0.01 }, /minRatio/i],
    [{ fields: ['specs.fit'], mode: 'all', minProducts: 1, minRatio: 1.01 }, /minRatio/i],
    [{ fields: ['specs.fit'], mode: 'all', minProducts: 1, minRatio: 1, minDistinct: 0 }, /minDistinct/i],
  ])('rejects invalid visibility bounds %j', (visibility, expected) => {
    const invalid = { ...question(), visibility } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [invalid]), 'visibility-source')).toThrow(expected);
  });

  it('rejects a non-boolean visibility.always value', () => {
    const invalid = {
      ...question(), visibility: { always: 'yes', fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
    } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [invalid]), 'always-source'))
      .toThrow(/always-source.*alpha.*question.*need.*visibility.*always.*boolean/i);
  });

  it.each([['not-an-array'], [[]], [['specs.fit', '']]])(
    'rejects malformed or empty visibility fields when not always: %j',
    (fields) => {
      const invalid = {
        ...question(), visibility: { fields, mode: 'all', minProducts: 0, minRatio: 0 },
      } as unknown as SelectorQuestion;
      expect(() => validateSelectorConfig(config('alpha', [invalid]), 'fields-source'))
        .toThrow(/fields-source.*alpha.*question.*need.*visibility.*fields/i);
    },
  );

  it('accepts complete alternative visibility field groups without flat fields', () => {
    const grouped = {
      ...question(),
      visibility: {
        fieldGroups: [['specs.primaryMin', 'specs.primaryMax'], ['specs.fallbackMin', 'specs.fallbackMax']],
        mode: 'any', minProducts: 2, minRatio: 0.5,
      },
    } as unknown as SelectorQuestion;
    expect(validateSelectorConfig(config('alpha', [grouped]), 'grouped-visibility-source').questions[0])
      .toEqual(grouped);
  });

  it.each([
    ['not-an-array'],
    [[]],
    [[[]]],
    [[['specs.minimum', '']]],
    [[['specs.minimum'], []]],
    [[['specs.minimum'], 'not-a-group']],
  ])('rejects malformed or empty visibility fieldGroups: %j', (fieldGroups) => {
    const invalid = {
      ...question(),
      visibility: { fieldGroups, mode: 'any', minProducts: 1, minRatio: 0 },
    } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [invalid]), 'grouped-fields-source'))
      .toThrow(/grouped-fields-source.*alpha.*question.*need.*visibility.*fieldGroups/i);
  });

  it('rejects configs without questions', () => {
    expect(() => validateSelectorConfig(config('alpha', []), 'empty-source'))
      .toThrow(/empty-source.*alpha.*questions.*nonempty/i);
  });

  it.each([
    ['single', { min: 1 }], ['single', { minSelections: 1 }],
    ['multi', { min: 1 }], ['multi', { step: 1 }],
  ])('rejects validation keys that do not apply to %s questions: %j', (kind, validation) => {
    const choice = { ...question(), kind, validation } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [choice]), 'kind-validation-source'))
      .toThrow(/kind-validation-source.*alpha.*question.*need.*validation/i);
  });

  it.each(['number', 'dimensions'] as const)('rejects selection validation keys on %s questions', (kind) => {
    const numeric = kind === 'number'
      ? measurementQuestion(kind, { minSelections: 1 })
      : measurementQuestion(kind) as unknown as Record<string, unknown>;
    if (kind === 'dimensions') {
      numeric.validation = {
        components: { width: { min: 1, max: 10, label: text('Width') } },
        minSelections: 1,
      };
    }
    expect(() => validateSelectorConfig(
      config('alpha', [numeric as unknown as SelectorQuestion]),
      'numeric-validation-source',
    ))
      .toThrow(/numeric-validation-source.*alpha.*question.*measurement.*validation.*minSelections/i);
  });

  it('accepts selection counts only for multi questions', () => {
    const multi = {
      ...question(), kind: 'multi' as const, validation: { minSelections: 1, maxSelections: 1 },
    } as SelectorQuestion;
    expect(validateSelectorConfig(config('alpha', [multi]), 'multi-source').questions[0]).toEqual(multi);
  });

  it('accepts numeric validation for number questions', () => {
    const numeric = measurementQuestion('number', { min: 1, max: 10, step: 1 });
    expect(validateSelectorConfig(config('alpha', [numeric]), 'numeric-source').questions[0]).toEqual(numeric);
  });

  it('accepts distinct generic validation bounds for each dimensions component', () => {
    const dimensions = {
      id: 'size', kind: 'dimensions', title: text('Size'), effects: [
        { ...criterion('width'), target: { source: 'answer', answerKey: 'width' } },
        { ...criterion('depth'), target: { source: 'answer', answerKey: 'depth' } },
      ],
      validation: {
        components: {
          width: { min: 60, max: 240, step: 1, label: text('Width') },
          depth: { min: 40, max: 120, step: 1, label: text('Depth') },
        },
      },
    } as unknown as SelectorQuestion;
    expect(validateSelectorConfig(config('alpha', [dimensions]), 'dimensions-source').questions[0])
      .toEqual(dimensions);
  });

  it('rejects dimensions answer keys missing from the component validation map', () => {
    const dimensions = {
      id: 'size', kind: 'dimensions', title: text('Size'),
      effects: [{ ...criterion('height-fit'), target: { source: 'answer', answerKey: 'height' } }],
      validation: { components: { width: { min: 60, max: 240, label: text('Width') } } },
    } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [dimensions]), 'dimension-component-source'))
      .toThrow(/dimension-component-source.*height-fit.*answerKey.*height.*components/i);
  });

  it('validates answer keys in recursive dimension fallbacks against component names', () => {
    const dimensions = {
      id: 'size', kind: 'dimensions', title: text('Size'),
      effects: [{
        ...criterion('size-fit'), target: { source: 'answer', answerKey: 'width' },
        fallback: {
          field: 'specs.alternate', operator: 'atLeast',
          target: { source: 'answer', answerKey: 'depth' },
        },
      }],
      validation: { components: {
        width: { min: 60, max: 240, label: text('Width') },
        depth: { min: 40, max: 120, label: text('Depth') },
      } },
    } as unknown as SelectorQuestion;
    expect(validateSelectorConfig(config('alpha', [dimensions]), 'dimension-fallback-source').questions[0])
      .toEqual(dimensions);

    const mismatched = structuredClone(dimensions) as unknown as Record<string, any>;
    mismatched.validation.components = { width: { min: 60, max: 240, label: text('Width') } };
    expect(() => validateSelectorConfig(config('alpha', [mismatched as unknown as SelectorQuestion]), 'dimension-fallback-source'))
      .toThrow(/dimension-fallback-source.*size-fit.*fallback.*answerKey.*depth.*components/i);
  });

  it('rejects empty validation objects', () => {
    const multi = { ...question(), kind: 'multi' as const, validation: {} } as unknown as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [multi]), 'validation-source'))
      .toThrow(/validation-source.*alpha.*question.*need.*validation.*nonempty/i);
  });

  it.each([
    [{ minSelections: 2 }, /minSelections.*options/i],
    [{ maxSelections: 2 }, /maxSelections.*options/i],
    [{ minSelections: 1, maxSelections: 0 }, /minSelections.*exceed.*maxSelections/i],
  ])('rejects unsatisfiable multi selection constraints %j', (validation, expected) => {
    const multi = { ...question(), kind: 'multi' as const, validation } as SelectorQuestion;
    expect(() => validateSelectorConfig(config('alpha', [multi]), 'selection-source')).toThrow(expected);
  });
});

describe('discoverSelectorConfigs', () => {
  it('discovers a named fake config export without registration', () => {
    const fake = config('zeta');
    expect(discoverSelectorConfigs({ './config-zeta.ts': { selectorConfig: fake } })).toEqual([fake]);
  });

  it('rejects duplicate types and names both modules', () => {
    expect(() => discoverSelectorConfigs({
      './config-first.ts': { selectorConfig: config('same') },
      './config-second.ts': { selectorConfig: config('same') },
    })).toThrow(/same.*config-first\.ts.*config-second\.ts/i);
  });

  it('returns configs in stable type order regardless of module order', () => {
    expect(discoverSelectorConfigs({
      './config-zeta.ts': { selectorConfig: config('zeta') },
      './config-alpha.ts': { selectorConfig: config('alpha') },
    }).map((item) => item.tipo)).toEqual(['alpha', 'zeta']);
  });

  it('rejects matching modules without a named selectorConfig export', () => {
    expect(() => discoverSelectorConfigs({ './config-missing.ts': { default: config() } }))
      .toThrow(/config-missing\.ts.*named selectorConfig export/i);
  });

  it('does not mutate supplied modules or config objects', () => {
    const alpha = config('alpha');
    const zeta = config('zeta');
    const modules = deepFreeze({
      './config-zeta.ts': { selectorConfig: zeta },
      './config-alpha.ts': { selectorConfig: alpha },
    });
    const before = JSON.stringify(modules);
    const discovered = discoverSelectorConfigs(modules);
    expect(JSON.stringify(modules)).toBe(before);
    expect(discovered).toEqual([alpha, zeta]);
    expect(discovered[0]).not.toBe(alpha);
    expect(Object.isFrozen(alpha.questions[0].options![0].effects[0])).toBe(true);
  });

  it('returns isolated deeply frozen config snapshots', () => {
    const source = config('alpha');
    const discovered = discoverSelectorConfigs({ './config-alpha.ts': { selectorConfig: source } });
    const snapshot = discovered[0];
    const originalTitle = snapshot.labels.singular.en;
    const originalReason = snapshot.questions[0].options![0].effects[0].reason.en;
    source.labels.singular.en = 'Mutated source';
    source.questions[0].options![0].effects[0].reason.en = 'Mutated source reason';
    expect(snapshot).not.toBe(source);
    expect(snapshot.labels.singular.en).toBe(originalTitle);
    expect(snapshot.questions[0].options![0].effects[0].reason.en).toBe(originalReason);
    expect(Object.isFrozen(discovered)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.questions)).toBe(true);
    expect(Object.isFrozen(snapshot.questions[0].options![0].effects[0].target)).toBe(true);
    expect(() => {
      // @ts-expect-error runtime assertion verifies the same readonly contract
      snapshot.labels.singular.en = 'Runtime mutation';
    }).toThrow(TypeError);
  });

  it('exposes actual eager-glob discovery through SELECTOR_CONFIGS and getSelectorConfig', () => {
    expect(SELECTOR_CONFIGS.map((item) => item.tipo)).toEqual(['escritorio', 'silla']);
    expect(Object.isFrozen(SELECTOR_CONFIGS)).toBe(true);
    expect(getSelectorConfig('silla')).toBe(SELECTOR_CONFIGS[1]);
    expect(getSelectorConfig('escritorio')).toBe(SELECTOR_CONFIGS[0]);
    expect(getSelectorConfig('missing-type')).toBeUndefined();
  });
});

function requiredSelectorConfig(tipo: 'silla' | 'escritorio'): ReadonlySelectorTypeConfig {
  const found = getSelectorConfig(tipo);
  if (!found) throw new Error(`Missing ${tipo} selector config`);
  return found;
}

function requiredQuestion(
  cfg: ReadonlySelectorTypeConfig,
  id: string,
): ReadonlySelectorTypeConfig['questions'][number] {
  const found = cfg.questions.find((item) => item.id === id);
  if (!found) throw new Error(`Missing ${cfg.tipo}.${id}`);
  return found;
}

function optionEffects(
  cfg: ReadonlySelectorTypeConfig,
  questionId: string,
  value: string,
): readonly DeepReadonly<SelectorCriterion>[] {
  const question = requiredQuestion(cfg, questionId);
  if (question.kind !== 'single' && question.kind !== 'multi') {
    throw new Error(`${cfg.tipo}.${questionId} is not an option question`);
  }
  const option = question.options.find((item) => item.value === value);
  if (!option) throw new Error(`Missing ${cfg.tipo}.${questionId}.${value}`);
  return option.effects;
}

function allConfigCriteria(cfg: ReadonlySelectorTypeConfig): readonly DeepReadonly<SelectorCriterion>[] {
  return cfg.questions.flatMap((question) =>
    question.kind === 'single' || question.kind === 'multi'
      ? question.options.flatMap((option) => option.effects)
      : question.effects);
}

describe('production selector configs', () => {
  it('auto-discovers exactly the chair and standing-desk configs with their route contracts', () => {
    const chair = requiredSelectorConfig('silla');
    const desk = requiredSelectorConfig('escritorio');
    expect(chair).toMatchObject({
      labels: {
        singular: { 'es-ES': 'Silla', en: 'Office chair' },
        plural: { 'es-ES': 'Sillas', en: 'Office chairs' },
        icon: 'sillas',
      },
      routes: {
        catalogType: { 'es-ES': 'silla', en: 'chairs' },
        editorialCategories: { 'es-ES': ['sillas'], en: ['chairs'] },
      },
    });
    expect(desk).toMatchObject({
      labels: {
        singular: { 'es-ES': 'Escritorio elevable', en: 'Standing desk' },
        plural: { 'es-ES': 'Escritorios elevables', en: 'Standing desks' },
        icon: 'escritorios',
      },
      routes: {
        catalogType: { 'es-ES': 'escritorio', en: 'standing-desks' },
        editorialCategories: { 'es-ES': ['escritorios'], en: ['desks'] },
      },
    });
  });

  it('validates both configs and exposes isolated deeply frozen snapshots', () => {
    for (const cfg of SELECTOR_CONFIGS) {
      expect(validateSelectorConfig(cfg, `production-${cfg.tipo}`)).toEqual(cfg);
      expect(Object.isFrozen(cfg)).toBe(true);
      expect(Object.isFrozen(cfg.questions)).toBe(true);
      expect(Object.isFrozen(allConfigCriteria(cfg)[0].reason)).toBe(true);
    }
  });

  it('keeps the exact requested question order outside the global type step', () => {
    expect(requiredSelectorConfig('silla').questions.map((item) => item.id)).toEqual([
      'presupuesto', 'prioridad', 'horas', 'altura', 'peso', 'respaldo', 'molestias', 'compartida',
    ]);
    expect(requiredSelectorConfig('escritorio').questions.map((item) => item.id)).toEqual([
      'presupuesto', 'prioridad', 'horas', 'espacio', 'motor', 'tablero', 'accesorios',
    ]);
  });

  it('provides complete localized public copy and localized editorial keywords', () => {
    for (const cfg of SELECTOR_CONFIGS) {
      const publicCopy: { 'es-ES': string; en: string }[] = [cfg.labels.singular, cfg.labels.plural];
      for (const question of cfg.questions) {
        publicCopy.push(question.title);
        if (question.help) publicCopy.push(question.help);
        if (question.kind === 'single' || question.kind === 'multi') {
          for (const option of question.options) {
            publicCopy.push(option.label);
            if (option.description) publicCopy.push(option.description);
          }
        }
      }
      for (const effect of allConfigCriteria(cfg)) {
        publicCopy.push(effect.reason, effect.warning);
        expect(effect.editorialKeywords?.['es-ES'].length).toBeGreaterThan(0);
        expect(effect.editorialKeywords?.en.length).toBeGreaterThan(0);
      }
      expect(publicCopy.every((copy) => copy['es-ES'].trim() && copy.en.trim())).toBe(true);
      expect(publicCopy.map((copy) => copy.en).join('\n')).not.toMatch(
        /\b(?:silla|escritorio|presupuesto|ninguna|ajustable|malla|espuma|tablero|molestias|garantía)\b/i,
      );
    }
  });

  it('marks common questions always visible and specific questions by useful catalog fields', () => {
    for (const cfg of SELECTOR_CONFIGS) {
      for (const id of ['presupuesto', 'prioridad', 'horas']) {
        expect(requiredQuestion(cfg, id).visibility?.always).toBe(true);
      }
    }
    expect(requiredQuestion(requiredSelectorConfig('silla'), 'altura').visibility).toMatchObject({
      mode: 'any',
      fieldGroups: [
        ['specs.alturaRecomendadaMinCm', 'specs.alturaRecomendadaMaxCm'],
        ['specs.alturaAsientoMinCm', 'specs.alturaAsientoMaxCm'],
      ],
    });
  });

  it('makes every explicit neutral response produce no criteria', () => {
    for (const cfg of SELECTOR_CONFIGS) {
      const answers = Object.fromEntries(cfg.questions.map((question) => [question.id, question.neutralValue]));
      const candidate = product(cfg.tipo, `${cfg.tipo}-neutral`, {});
      expect(scoreProducts([candidate], answers, cfg)[0].traces).toEqual([]);
      for (const question of cfg.questions) {
        expect(question.neutralValue).not.toBeUndefined();
        if (question.kind === 'single' || question.kind === 'multi') {
          const explicitNeutral = question.options.find((option) =>
            question.kind === 'multi' && Array.isArray(question.neutralValue)
              ? question.neutralValue.includes(String(option.value))
              : JSON.stringify(option.value) === JSON.stringify(question.neutralValue));
          expect(explicitNeutral?.effects).toEqual([]);
        }
      }
    }
  });

  it('uses budget weight 2 with stronger tier penalties than preference criteria', () => {
    for (const cfg of SELECTOR_CONFIGS) {
      for (const tier of ['1', '2', '3', '4']) {
        const [effect] = optionEffects(cfg, 'presupuesto', tier);
        expect(effect).toMatchObject({
          field: 'tramoPrecio', operator: 'atMost', target: Number(tier), weight: 2,
          penalty: { factor: 0.65, cap: 70 },
        });
      }
      expect(Math.max(...allConfigCriteria(cfg)
        .filter((effect) => effect.id.includes('preferencia'))
        .map((effect) => effect.weight))).toBeLessThan(2);
    }
  });

  it('scores chair lumbar rank, recommended-height and seat-height fallback, and weight margin', () => {
    const chair = requiredSelectorConfig('silla');
    const lumbar = optionEffects(chair, 'molestias', 'lumbar')[0];
    const height = requiredQuestion(chair, 'altura');
    const weight = requiredQuestion(chair, 'peso');
    if (height.kind !== 'number' || weight.kind !== 'number') throw new Error('Chair measurements must be numeric');

    expect(evaluateCriterion(product('silla', 'dynamic', { lumbar: 'dinamico' }), lumbar, 'molestias', {
      molestias: ['lumbar'],
    }).match).toBe(1);
    expect(evaluateCriterion(product('silla', 'pressure', { lumbar: 'presion' }), lumbar, 'molestias', {
      molestias: ['lumbar'],
    }).match).toBeCloseTo(1 / 2);

    expect(evaluateCriterion(product('silla', 'recommended', {
      alturaRecomendadaMinCm: 170, alturaRecomendadaMaxCm: 190,
    }), height.effects[0], 'altura', { altura: 180 })).toMatchObject({ match: 1, target: 180 });
    expect(evaluateCriterion(product('silla', 'seat-fallback', {
      alturaAsientoMinCm: 44, alturaAsientoMaxCm: 48,
    }), height.effects[0], 'altura', { altura: 180 })).toMatchObject({ match: 1, target: 45.54 });

    expect(evaluateCriterion(product('silla', 'weight-fit', { pesoMaxKg: 110 }), weight.effects[0], 'peso', {
      peso: 100,
    }).match).toBe(1);
    expect(evaluateCriterion(product('silla', 'weight-miss', { pesoMaxKg: 100 }), weight.effects[0], 'peso', {
      peso: 100,
    }).match).toBeCloseTo(100 / 110);
    expect(weight.effects[0]).toMatchObject({ weight: 2.5, missingScore: 0.35, penalty: { factor: 0.5, cap: 49 } });
  });

  it('scores chair back material, cervical and hip needs, and shared adjustability', () => {
    const chair = requiredSelectorConfig('silla');
    const candidate = product('silla', 'shared-chair', {
      respaldo: 'malla', reposacabezas: 'ajustable', reclinacionMaxGrados: 125,
      profundidadRegulable: true,
    });
    candidate.valoraciones.comodidad = 10;
    candidate.valoraciones.ajustabilidad = 10;
    const result = scoreProducts([candidate], {
      presupuesto: 'any', prioridad: 'any', horas: 'unknown', altura: null, peso: null,
      respaldo: 'malla', molestias: ['cervical', 'cadera'], compartida: 'si',
    }, chair)[0];
    expect(result.traces.map((trace) => trace.criterionId)).toEqual([
      'silla-respaldo-malla', 'silla-cervical-reposacabezas', 'silla-cervical-reclinacion',
      'silla-cadera-profundidad', 'silla-cadera-comodidad',
      'silla-compartida-profundidad', 'silla-compartida-ajustabilidad',
    ]);
    expect(result.traces.every((trace) => trace.match === 1)).toBe(true);
  });

  it('scores desk dimensions by answer key only when a supplied board must fit', () => {
    const desk = requiredSelectorConfig('escritorio');
    expect(requiredQuestion(desk, 'espacio').help).toEqual({
      'es-ES': 'Indica ancho y fondo en centímetros. Solo afectan a la puntuación si necesitas un escritorio con tablero incluido; si aún no lo has decidido, no se aplican.',
      en: 'Enter width and depth in centimeters. They affect scoring only if you require a desk with an included tabletop; if you are undecided, they do not apply.',
    });
    expect(requiredQuestion(desk, 'espacio').visibility).toMatchObject({
      mode: 'any',
      fieldGroups: [['specs.tableroAnchoCm', 'specs.tableroFondoCm']],
    });
    expect(requiredQuestion(desk, 'espacio').validation).toEqual({
      components: {
        ancho: { min: 60, max: 240, step: 1, label: { 'es-ES': 'Ancho disponible', en: 'Available width' }, unit: text('cm') },
        fondo: { min: 40, max: 120, step: 1, label: { 'es-ES': 'Fondo disponible', en: 'Available depth' }, unit: text('cm') },
      },
    });
    const compact = product('escritorio', 'compact', { tableroAnchoCm: 120, tableroFondoCm: 60 });
    const oversized = product('escritorio', 'oversized', { tableroAnchoCm: 180, tableroFondoCm: 80 });
    const answers = {
      presupuesto: 'any', prioridad: 'any', horas: 'unknown', espacio: { ancho: 140, fondo: 70 },
      motor: 'any', tablero: 'incluido', accesorios: [],
    };
    const fitting = scoreProducts([compact], answers, desk)[0];
    expect(fitting.traces.filter((trace) => trace.questionId === 'espacio')
      .map((trace) => [trace.target, trace.match])).toEqual([[140, 1], [70, 1]]);
    const tooLarge = scoreProducts([oversized], answers, desk)[0];
    expect(tooLarge.violations).toHaveLength(2);
    expect(tooLarge.score).toBeLessThanOrEqual(65);
    expect(scoreProducts([oversized], { ...answers, tablero: 'estructura' }, desk)[0].traces
      .filter((trace) => trace.questionId === 'espacio')).toEqual([]);
  });

  it.each(['any', 'estructura'] as const)(
    'does not add desk dimension traces or warnings when tablero is %s',
    (tablero) => {
      const desk = requiredSelectorConfig('escritorio');
      const candidate = product('escritorio', `space-neutral-${tablero}`, {
        tableroAnchoCm: 180, tableroFondoCm: 80, tableroIncluido: false,
      });
      const result = scoreProducts([candidate], {
        presupuesto: 'any', prioridad: 'any', horas: 'unknown',
        espacio: { ancho: 120, fondo: 60 }, motor: 'any', tablero, accesorios: [],
      }, desk)[0];
      expect(result.traces.filter((trace) => trace.questionId === 'espacio')).toEqual([]);
      expect(generateProductExplanation(result, 'es-ES').warning).toBeNull();
      expect(generateProductExplanation(result, 'en').warning).toBeNull();
    },
  );

  it('scores desk motor, board inclusion, and selected accessories', () => {
    const desk = requiredSelectorConfig('escritorio');
    const candidate = product('escritorio', 'equipped', {
      motor: 'doble', tableroIncluido: true, memorias: 4, anticolision: true, puertoUsb: true,
    });
    const result = scoreProducts([candidate], {
      presupuesto: 'any', prioridad: 'any', horas: 'unknown', espacio: null,
      motor: 'doble', tablero: 'incluido', accesorios: ['memorias', 'anticolision', 'usb'],
    }, desk)[0];
    expect(result.traces.map((trace) => trace.criterionId)).toEqual([
      'escritorio-motor-doble', 'escritorio-tablero-incluido',
      'escritorio-accesorio-memorias', 'escritorio-accesorio-anticolision', 'escritorio-accesorio-usb',
    ]);
    expect(result.traces.every((trace) => trace.match === 1)).toBe(true);
    expect(optionEffects(desk, 'tablero', 'incluido')[0]).toMatchObject({
      field: 'specs.tableroIncluido', operator: 'boolean', target: true, weight: 2,
      penalty: { factor: 0.7, cap: 70 },
    });
  });

  it('returns three stable chair results while physical incompatibility stays below 30', () => {
    const chair = requiredSelectorConfig('silla');
    const candidates = [
      qualityProduct('recommended-fit', 8, {
        alturaRecomendadaMinCm: 190, alturaRecomendadaMaxCm: 205, pesoMaxKg: 150,
      }),
      qualityProduct('seat-fit', 8, {
        alturaAsientoMinCm: 49, alturaAsientoMaxCm: 53, pesoMaxKg: 145,
      }),
      qualityProduct('expensive-fit', 9, {
        alturaRecomendadaMinCm: 190, alturaRecomendadaMaxCm: 210, pesoMaxKg: 160,
      }),
      qualityProduct('physical-mismatch', 10, {
        alturaRecomendadaMinCm: 150, alturaRecomendadaMaxCm: 180, pesoMaxKg: 120,
      }),
    ].map((candidate, index) => ({ ...candidate, tipo: 'silla', tramoPrecio: index === 2 ? 4 : 1 } as Producto));
    const answers = {
      presupuesto: '1', prioridad: 'any', horas: 'unknown', altura: 200, peso: 130,
      respaldo: 'any', molestias: [], compartida: 'any',
    };
    const first = scoreProducts(candidates, answers, chair);
    const second = scoreProducts(candidates, answers, chair);
    expect(first).toHaveLength(3);
    expect(first.map((item) => item.producto.slug)).toEqual(second.map((item) => item.producto.slug));
    const mismatch = scoreProducts(candidates, answers, chair, 10)
      .find((item) => item.producto.slug === 'physical-mismatch');
    expect(mismatch?.score).toBeLessThanOrEqual(30);
  });

  it('reports missing chair fit fields and only the localized verified-data warning', () => {
    const chair = requiredSelectorConfig('silla');
    const result = scoreProducts([product('silla', 'missing-physical-data')], {
      presupuesto: 'any', prioridad: 'any', horas: 'unknown', altura: 180, peso: 100,
      respaldo: 'any', molestias: [], compartida: 'any',
    }, chair)[0];

    expect(result.missingFields).toEqual([
      'specs.alturaRecomendadaMinCm', 'specs.alturaRecomendadaMaxCm',
      'specs.alturaAsientoMinCm', 'specs.alturaAsientoMaxCm', 'specs.pesoMaxKg',
    ]);
    expect(result.traces.map((trace) => [trace.criterionId, trace.state])).toEqual([
      ['silla-altura-ajuste', 'missing'], ['silla-peso-margen', 'missing'],
    ]);
    expect(generateProductExplanation(result, 'es-ES')).toEqual({
      reasons: [],
      warning: 'El rango verificado no encaja con tu altura o faltan medidas.',
    });
    expect(generateProductExplanation(result, 'en')).toEqual({
      reasons: [],
      warning: 'The verified range does not fit your height, or measurements are missing.',
    });
  });
});

describe('production catalog selector integration', () => {
  it('loads the approved 114-product inventory split without hiding count drift', () => {
    expect(Object.keys(rawCatalogModules)).toHaveLength(114);
    expect(actualCatalogProducts).toHaveLength(114);
    expect(actualCatalogProducts.filter((item) => item.tipo === 'silla')).toHaveLength(77);
    expect(actualCatalogProducts.filter((item) => item.tipo === 'escritorio')).toHaveLength(37);
  });

  it('resolves the approved question IDs in order from actual catalog coverage', () => {
    const chairs = actualCatalogProducts.filter((item) => item.tipo === 'silla');
    const desks = actualCatalogProducts.filter((item) => item.tipo === 'escritorio');
    expect(resolveVisibleQuestions(requiredSelectorConfig('silla'), chairs).map((item) => item.id)).toEqual([
      'presupuesto', 'prioridad', 'horas', 'altura', 'peso', 'respaldo', 'molestias', 'compartida',
    ]);
    expect(resolveVisibleQuestions(requiredSelectorConfig('escritorio'), desks).map((item) => item.id)).toEqual([
      'presupuesto', 'prioridad', 'horas', 'espacio', 'motor', 'tablero', 'accesorios',
    ]);
  });

  it('makes actual desk space visibility depend on paired tabletop dimensions', () => {
    const desks = actualCatalogProducts.filter((item) => item.tipo === 'escritorio');
    const paired = desks.filter((item) =>
      item.specs.tableroAnchoCm != null && item.specs.tableroFondoCm != null);
    const widthOnly = desks.filter((item) => item.specs.tableroAnchoCm != null).length;
    const depthOnly = desks.filter((item) => item.specs.tableroFondoCm != null).length;
    expect(paired.length).toBeGreaterThanOrEqual(3);
    expect(paired.length / desks.length).toBeGreaterThanOrEqual(0.2);
    expect(paired.length).toBeLessThanOrEqual(widthOnly);
    expect(paired.length).toBeLessThanOrEqual(depthOnly);
    expect(resolveVisibleQuestions(requiredSelectorConfig('escritorio'), desks).map((item) => item.id))
      .toContain('espacio');
  });

  it.each([
    ['chair representative', 'silla', {
      presupuesto: '2', prioridad: 'ergonomia', horas: '4-8', altura: 175, peso: 75,
      respaldo: 'malla', molestias: ['lumbar'], compartida: 'no',
    }],
    ['chair extreme', 'silla', {
      presupuesto: '1', prioridad: 'durabilidad', horas: '8+', altura: 210, peso: 180,
      respaldo: 'espuma', molestias: ['lumbar', 'cervical', 'cadera'], compartida: 'si',
    }],
    ['desk representative', 'escritorio', {
      presupuesto: '2', prioridad: 'ergonomia', horas: '4-8', espacio: { ancho: 140, fondo: 70 },
      motor: 'doble', tablero: 'incluido', accesorios: ['memorias', 'anticolision'],
    }],
    ['desk extreme', 'escritorio', {
      presupuesto: '1', prioridad: 'durabilidad', horas: '8+', espacio: { ancho: 60, fondo: 40 },
      motor: 'manual', tablero: 'incluido', accesorios: ['usb'],
    }],
  ] as const)('returns three finite stable unique actual-catalog results for %s', (_, tipo, answers) => {
    const candidates = actualCatalogProducts.filter((item) => item.tipo === tipo);
    const config = requiredSelectorConfig(tipo);
    const first = scoreProducts(candidates, answers, config);
    const second = scoreProducts(candidates, answers, config);
    expect(first).toHaveLength(3);
    expect(first.map((item) => item.producto.slug)).toEqual(second.map((item) => item.producto.slug));
    expect(new Set(first.map((item) => item.producto.slug)).size).toBe(3);
    expect(first.every((item) => Number.isFinite(item.score))).toBe(true);
  });
});

describe('catalog coverage and question visibility', () => {
  it('counts false and zero as present, but not null, missing, or empty strings', () => {
    const products = [
      product('alpha', 'false', { value: false }), product('alpha', 'zero', { value: 0 }),
      product('alpha', 'null', { value: null }), product('alpha', 'missing'),
      product('alpha', 'empty', { value: '' }),
    ];
    expect(countFieldCoverage(products, 'specs.value')).toBe(2);
  });

  it('supports any and all field coverage modes', () => {
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index), {
      common: index < 4 ? true : null, rare: index === 0 ? true : null,
    }));
    const baseVisibility = { fields: ['specs.common', 'specs.rare'], minProducts: 3, minRatio: 0.5 };
    const anyQuestion = { ...question('any'), visibility: { ...baseVisibility, mode: 'any' as const } };
    const allQuestion = { ...question('all', 'all-fit'), visibility: { ...baseVisibility, mode: 'all' as const } };
    expect(resolveVisibleQuestions(config('alpha', [anyQuestion, allQuestion]), products).map((item) => item.id))
      .toEqual(['any']);
  });

  it('requires useful distinct values when minDistinct is configured', () => {
    const products = [product('alpha', 'a', { value: 1 }), product('alpha', 'b', { value: 1 })];
    const varied = [product('alpha', 'a', { value: 1 }), product('alpha', 'b', { value: 2 })];
    const visible = {
      ...question(), visibility: { fields: ['specs.value'], mode: 'all' as const, minProducts: 2, minRatio: 1, minDistinct: 2 },
    };
    expect(hasUsefulVariation(products, ['specs.value'], 2)).toBe(false);
    expect(resolveVisibleQuestions(config('alpha', [visible]), products)).toEqual([]);
    expect(resolveVisibleQuestions(config('alpha', [visible]), varied)).toEqual([visible]);
  });

  it('couples coverage and variation on the same field in any mode', () => {
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index), {
      coveredButConstant: index < 4 ? 'same' : null,
      variedButSparse: index < 2 ? index : null,
    }));
    const coupled = {
      ...question(),
      visibility: {
        fields: ['specs.coveredButConstant', 'specs.variedButSparse'], mode: 'any' as const,
        minProducts: 3, minRatio: 0.5, minDistinct: 2,
      },
    };
    expect(resolveVisibleQuestions(config('alpha', [coupled]), products)).toEqual([]);
  });

  it('requires every field to meet its own distinctness in all mode', () => {
    const products = Array.from({ length: 4 }, (_, index) => product('alpha', String(index), {
      constant: 'same', varied: index % 2,
    }));
    const coupled = {
      ...question(),
      visibility: {
        fields: ['specs.constant', 'specs.varied'], mode: 'all' as const,
        minProducts: 4, minRatio: 1, minDistinct: 2,
      },
    };
    expect(resolveVisibleQuestions(config('alpha', [coupled]), products)).toEqual([]);
  });

  it('applies any and all modes across complete alternative field groups', () => {
    const products = Array.from({ length: 2 }, (_, index) => product('alpha', String(index), {
      primaryMin: 10 + index, primaryMax: 20 + index, fallbackMin: 30 + index,
    }));
    const base = {
      fieldGroups: [
        ['specs.primaryMin', 'specs.primaryMax'],
        ['specs.fallbackMin', 'specs.fallbackMax'],
      ],
      minProducts: 2, minRatio: 1, minDistinct: 2,
    };
    const anyQuestion = {
      ...question('group-any'), visibility: { ...base, mode: 'any' as const },
    } as unknown as SelectorQuestion;
    const allQuestion = {
      ...question('group-all', 'group-all-fit'), visibility: { ...base, mode: 'all' as const },
    } as unknown as SelectorQuestion;
    expect(resolveVisibleQuestions(config('alpha', [anyQuestion, allQuestion]), products).map((item) => item.id))
      .toEqual(['group-any']);
  });

  it('rejects a field group whose endpoints exist only on disjoint products', () => {
    const products = [
      product('alpha', 'min-a', { minimum: 10 }),
      product('alpha', 'min-b', { minimum: 11 }),
      product('alpha', 'max-a', { maximum: 20 }),
      product('alpha', 'max-b', { maximum: 21 }),
    ];
    const grouped = {
      ...question('disjoint-group'),
      visibility: {
        fieldGroups: [['specs.minimum', 'specs.maximum']], mode: 'any' as const,
        minProducts: 2, minRatio: 0.5, minDistinct: 2,
      },
    } as unknown as SelectorQuestion;
    expect(resolveVisibleQuestions(config('alpha', [grouped]), products)).toEqual([]);
  });

  it('accepts a field group when enough products contain the complete pair', () => {
    const products = [
      product('alpha', 'complete-a', { minimum: 10, maximum: 20 }),
      product('alpha', 'complete-b', { minimum: 11, maximum: 21 }),
      product('alpha', 'missing-a'),
      product('alpha', 'missing-b'),
    ];
    const grouped = {
      ...question('complete-group'),
      visibility: {
        fieldGroups: [['specs.minimum', 'specs.maximum']], mode: 'any' as const,
        minProducts: 2, minRatio: 0.5, minDistinct: 2,
      },
    } as unknown as SelectorQuestion;
    expect(resolveVisibleQuestions(config('alpha', [grouped]), products)).toEqual([grouped]);
  });

  it('calculates each field distinctness from complete group records only', () => {
    const products = [
      product('alpha', 'complete-a', { minimum: 10, maximum: 20 }),
      product('alpha', 'complete-b', { minimum: 10, maximum: 20 }),
      product('alpha', 'minimum-only', { minimum: 11 }),
      product('alpha', 'maximum-only', { maximum: 21 }),
    ];
    const grouped = {
      ...question('complete-distinctness'),
      visibility: {
        fieldGroups: [['specs.minimum', 'specs.maximum']], mode: 'any' as const,
        minProducts: 2, minRatio: 0.5, minDistinct: 2,
      },
    } as unknown as SelectorQuestion;
    expect(resolveVisibleQuestions(config('alpha', [grouped]), products)).toEqual([]);
  });

  it('shows chair height only when either recommended or seat-height endpoints are complete', () => {
    const chair = requiredSelectorConfig('silla');
    const incomplete = Array.from({ length: 2 }, (_, index) => product('silla', `incomplete-${index}`, {
      alturaRecomendadaMinCm: 160 + index,
    }));
    const complete = Array.from({ length: 2 }, (_, index) => product('silla', `complete-${index}`, {
      alturaAsientoMinCm: 42 + index, alturaAsientoMaxCm: 52 + index,
    }));
    expect(resolveVisibleQuestions(chair, incomplete).map((item) => item.id)).not.toContain('altura');
    expect(resolveVisibleQuestions(chair, complete).map((item) => item.id)).toContain('altura');
  });

  it('retains always-visible questions even with empty fields and no products', () => {
    const always = {
      ...question(), visibility: { always: true, fields: [], mode: 'all' as const, minProducts: 99, minRatio: 1 },
    };
    expect(resolveVisibleQuestions(config('alpha', [always]), [])).toEqual([always]);
  });

  it('returns isolated deeply frozen visible questions', () => {
    const source = config();
    const visible = resolveVisibleQuestions(source, []);
    const originalTitle = visible[0].title.en;
    source.questions[0].title.en = 'Mutated source';
    expect(visible[0].title.en).toBe(originalTitle);
    expect(Object.isFrozen(visible)).toBe(true);
    expect(Object.isFrozen(visible[0])).toBe(true);
    expect(Object.isFrozen(visible[0].options![0].effects[0])).toBe(true);
  });
});

describe('resolveEligibleSelectorConfigs', () => {
  it('excludes a type with four products and includes one with five', () => {
    const products = [
      ...Array.from({ length: 4 }, (_, index) => product('alpha', `a${index}`, { fit: true })),
      ...Array.from({ length: 5 }, (_, index) => product('beta', `b${index}`, { fit: true })),
    ];
    expect(resolveEligibleSelectorConfigs([config('alpha'), config('beta')], products).map((item) => item.tipo))
      .toEqual(['beta']);
  });

  it('sorts eligible configs by type and attaches only visible questions', () => {
    const visible = {
      ...question('visible'), visibility: { always: true, fields: [], mode: 'all' as const, minProducts: 0, minRatio: 0 },
    };
    const hidden = {
      ...question('hidden', 'hidden-fit'), visibility: { fields: ['specs.none'], mode: 'all' as const, minProducts: 1, minRatio: 0 },
    };
    const products = [product('zeta', 'z'), product('alpha', 'a')];
    const result = resolveEligibleSelectorConfigs(
      [config('zeta', [visible, hidden]), config('alpha', [visible, hidden])], products, 1,
    );
    expect(result.map((item) => item.tipo)).toEqual(['alpha', 'zeta']);
    expect(result.every((item) => item.questions.map((entry) => entry.id).join() === 'visible')).toBe(true);
    expect(result.every((item) => item.products.length === 1)).toBe(true);
  });

  it('ignores product groups that do not have a selector config', () => {
    const products = Array.from({ length: 6 }, (_, index) => product('orphan', String(index)));
    expect(resolveEligibleSelectorConfigs([config('alpha')], products)).toEqual([]);
  });

  it('uses a custom minimum product threshold', () => {
    const products = Array.from({ length: 2 }, (_, index) => product('alpha', String(index)));
    expect(resolveEligibleSelectorConfigs([config('alpha')], products, 3)).toEqual([]);
    expect(resolveEligibleSelectorConfigs([config('alpha')], products, 2).map((item) => item.tipo)).toEqual(['alpha']);
  });

  it('excludes configs when every question resolves as hidden', () => {
    const hidden = {
      ...question(), visibility: { fields: ['specs.missing'], mode: 'all' as const, minProducts: 1, minRatio: 0 },
    };
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index)));
    expect(resolveEligibleSelectorConfigs([config('alpha', [hidden])], products)).toEqual([]);
  });

  it('returns deeply frozen eligible configs and products', () => {
    const source = config('alpha');
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index)));
    const eligible = resolveEligibleSelectorConfigs([source], products);
    expect(Object.isFrozen(eligible)).toBe(true);
    expect(Object.isFrozen(eligible[0])).toBe(true);
    expect(Object.isFrozen(eligible[0].questions)).toBe(true);
    expect(Object.isFrozen(eligible[0].products)).toBe(true);
    expect(Object.isFrozen(eligible[0].products[0])).toBe(true);
  });
});

describe('resolveEligibleSelectorConfig', () => {
  const resolveOne = (selectorConfigModule as typeof selectorConfigModule & {
    resolveEligibleSelectorConfig: (
      configs: readonly SelectorTypeConfig[],
      products: readonly Producto[],
      matches: (config: ReadonlySelectorTypeConfig) => boolean,
      minProducts?: number,
    ) => ReturnType<typeof resolveEligibleSelectorConfigs>[number] | undefined;
  }).resolveEligibleSelectorConfig;

  it('returns no CTA config when the requested config is missing', () => {
    const products = Array.from({ length: 5 }, (_, index) => product('orphan', String(index)));
    expect(resolveOne([config('alpha')], products, (candidate) => candidate.tipo === 'orphan')).toBeUndefined();
  });

  it('returns no CTA config below five actual products', () => {
    const products = Array.from({ length: 4 }, (_, index) => product('alpha', String(index)));
    expect(resolveOne([config('alpha')], products, (candidate) => candidate.tipo === 'alpha')).toBeUndefined();
  });

  it('returns no CTA config when every question has zero visibility', () => {
    const hidden = {
      ...question(), visibility: { fields: ['specs.missing'], mode: 'all' as const, minProducts: 1, minRatio: 0 },
    };
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index)));
    expect(resolveOne([config('alpha', [hidden])], products, (candidate) => candidate.tipo === 'alpha')).toBeUndefined();
  });

  it('returns the fully resolved eligible config when products and visible questions qualify', () => {
    const products = Array.from({ length: 5 }, (_, index) => product('alpha', String(index)));
    const result = resolveOne([config('alpha')], products, (candidate) => candidate.tipo === 'alpha');
    expect(result?.tipo).toBe('alpha');
    expect(result?.products).toHaveLength(5);
    expect(result?.questions.length).toBeGreaterThan(0);
  });
});

it('keeps the selector engine free of production category vocabulary', () => {
  const source = readFileSync(new URL('./config.ts', import.meta.url), 'utf8');
  expect(source).not.toMatch(/\b(?:silla|sillas|escritorio|escritorios|accesorios|ambiente|audio-video)\b/i);
});

it('uses the exact eager config-module glob without matching config.ts', () => {
  const source = readFileSync(new URL('./config.ts', import.meta.url), 'utf8');
  expect(source).toContain("import.meta.glob('./config-*.ts', { eager: true })");
  expect('./config.ts').not.toMatch(/^\.\/config-.*\.ts$/);
});

const scoringCriterion = (
  overrides: Partial<SelectorCriterion> = {},
): SelectorCriterion => ({
  ...criterion('score-fit'),
  field: 'specs.value',
  target: { source: 'literal', value: 10 },
  missingScore: 0.25,
  editorialKeywords: {
    'es-ES': ['primero', 'segundo'],
    en: ['first', 'second'],
  },
  ...overrides,
});

const evaluate = (
  effect: SelectorCriterion,
  specs: Record<string, unknown>,
  answer: unknown = null,
) => evaluateCriterion(
  product('synthetic', 'candidate', specs),
  effect,
  'input',
  { input: answer },
);

function directQuestion(
  effects: SelectorCriterion[],
  kind: 'number' | 'dimensions' = 'number',
  id = 'input',
): SelectorQuestion {
  return kind === 'number'
    ? { id, kind, title: text(id), inputLabel: text('Value'), effects }
    : {
      id,
      kind,
      title: text(id),
      validation: { components: { input: { label: text('Value') } } },
      effects,
    };
}

function selectedQuestion(
  effects: SelectorCriterion[],
  id = 'choice',
): SelectorQuestion {
  return {
    id,
    kind: 'single',
    title: text(id),
    options: [
      { value: 'neutral', label: text('Neutral'), effects: [] },
      { value: 'selected', label: text('Selected'), effects },
    ],
  };
}

function qualityProduct(
  slug: string,
  note: number | null,
  specs: Record<string, unknown> = {},
  dataScore: number | null = null,
): Producto {
  const candidate = product('synthetic', slug, specs);
  candidate.valoraciones.ergonomia = note;
  candidate.calidadDatos = {
    score: dataScore,
    confianza: null,
    camposFaltantes: [],
    enriquecidoEn: null,
  };
  return candidate;
}

describe('evaluateCriterion', () => {
  it('uses exact strict scalar equality without normalization or coercion', () => {
    const equals = scoringCriterion({ operator: 'equals', target: 'Ready' });
    expect(evaluate(equals, { value: 'Ready' }).match).toBe(1);
    expect(evaluate(equals, { value: 'ready' }).match).toBe(0);
    expect(evaluate({ ...equals, target: ' Ready ' }, { value: 'Ready' }).match).toBe(0);
    expect(evaluate({ ...equals, target: true }, { value: 1 }).match).toBe(0);
  });

  it('uses structural exact equality for AnswerValue arrays', () => {
    const equals = scoringCriterion({ operator: 'equals', target: ['a', 'b'] });
    expect(evaluate(equals, { value: ['a', 'b'] }).match).toBe(1);
    expect(evaluate(equals, { value: ['b', 'a'] }).match).toBe(0);
    expect(evaluate(equals, { value: ['a', 'b', 'c'] }).match).toBe(0);
  });

  it('keeps boolean comparison strict and binary', () => {
    const bool = scoringCriterion({ operator: 'boolean', target: false });
    expect(evaluate(bool, { value: false }).match).toBe(1);
    expect(evaluate(bool, { value: 0 }).match).toBe(0);
  });

  it.each([
    [12, 10, 1], [10, 10, 1], [5, 10, 0.5], [-1, 10, 0], [1, 0, 1], [-1, 0, 0],
  ])('evaluates atLeast actual=%s target=%s as %s', (actual, target, expected) => {
    expect(evaluate(scoringCriterion({ operator: 'atLeast', target }), { value: actual }).match)
      .toBe(expected);
  });

  it.each([
    [5, 10, 1], [10, 10, 1], [20, 10, 0.5], [1, 0, 0], [0, 0, 1],
  ])('evaluates atMost actual=%s target=%s as %s', (actual, target, expected) => {
    expect(evaluate(scoringCriterion({ operator: 'atMost', target }), { value: actual }).match)
      .toBe(expected);
  });

  it.each([[10, 1], [15, 1], [20, 1], [5, 0.5], [25, 0.5], [31, 0]])(
    'evaluates containsRange target=%s as %s',
    (target, expected) => {
      const range = scoringCriterion({
        operator: 'containsRange', field: undefined,
        rangeFields: ['specs.low', 'specs.high'], target,
      });
      const trace = evaluate(range, { low: 10, high: 20 });
      expect(trace.match).toBe(expected);
      expect(trace.actual).toEqual([10, 20]);
      expect(trace.field).toBe('specs.low|specs.high');
    },
  );

  it('uses a minimum interval span of one for containsRange decay', () => {
    const range = scoringCriterion({
      operator: 'containsRange', field: undefined,
      rangeFields: ['specs.low', 'specs.high'], target: 4.5,
    });
    expect(evaluate(range, { low: 5, high: 5 }).match).toBe(0.5);
  });

  it('treats a present reversed range as malformed and does not use fallback', () => {
    const range = scoringCriterion({
      operator: 'containsRange',
      field: undefined,
      rangeFields: ['specs.low', 'specs.high'],
      target: 15,
      fallback: {
        rangeFields: ['specs.alternateLow', 'specs.alternateHigh'],
        operator: 'containsRange',
        target: 15,
      },
    });
    expect(evaluate(range, {
      low: 20, high: 10, alternateLow: 10, alternateHigh: 20,
    })).toMatchObject({
      field: 'specs.low|specs.high', actual: [20, 10], state: 'missing',
    });
  });

  it('compares ranked values and treats an unmapped actual as a miss', () => {
    const ranked = scoringCriterion({
      operator: 'ranked', target: 'high', rank: { low: 1, medium: 2, high: 3 },
    });
    expect(evaluate(ranked, { value: 'high' }).match).toBe(1);
    expect(evaluate(ranked, { value: 'medium' }).match).toBeCloseTo(2 / 3);
    expect(evaluate(ranked, { value: 'unknown' }).match).toBe(0);
  });

  it.each([[12, 10, 1], [5, 10, 0.5], [-1, 10, 0], [1, 0, 0]])(
    'evaluates axis actual=%s target=%s as %s',
    (actual, target, expected) => {
      expect(evaluate(scoringCriterion({ operator: 'axis', target }), { value: actual }).match)
        .toBe(expected);
    },
  );

  it('derives match, partial, and miss states from the clamped match', () => {
    const effect = scoringCriterion({ operator: 'atLeast', target: 10 });
    expect(evaluate(effect, { value: 10 }).state).toBe('match');
    expect(evaluate(effect, { value: 5 }).state).toBe('partial');
    expect(evaluate(effect, { value: -1 }).state).toBe('miss');
  });

  it('resolves current-answer and literal arithmetic expressions', () => {
    const fromAnswer = scoringCriterion({
      operator: 'equals', target: { source: 'answer', multiply: 2, add: 1 },
    });
    expect(evaluate(fromAnswer, { value: 7 }, 3).target).toBe(7);
    expect(evaluate(fromAnswer, { value: 7 }, 3).match).toBe(1);
    const literal = scoringCriterion({
      operator: 'equals', target: { source: 'literal', value: 3, multiply: 2, add: 1 },
    });
    expect(evaluate(literal, { value: 7 }).target).toBe(7);
  });

  it('resolves a declared component from a dimensions answer', () => {
    const effect = scoringCriterion({
      operator: 'equals', target: { source: 'answer', answerKey: 'primary', multiply: 2 },
    });
    expect(evaluate(effect, { value: 8 }, { primary: 4, secondary: 9 }).target).toBe(8);
  });

  it.each([
    [{ source: 'answer', multiply: 2 }, 'not-a-number'],
    [{ source: 'answer', answerKey: 'missing' }, { primary: 3 }],
    [{ source: 'literal', value: Number.POSITIVE_INFINITY }, null],
  ])('returns a missing trace for malformed or nonfinite target %j', (target, answer) => {
    const effect = scoringCriterion({ operator: 'atLeast', target: target as never });
    const trace = evaluate(effect, { value: 10 }, answer);
    expect(trace.state).toBe('missing');
    expect(trace.target).toBeNull();
  });

  it('uses an alternate range rule and target expression when primary data is absent', () => {
    const effect = scoringCriterion({
      operator: 'containsRange',
      field: undefined,
      rangeFields: ['specs.primaryMin', 'specs.primaryMax'],
      target: { source: 'answer' },
      fallback: {
        rangeFields: ['specs.alternateMin', 'specs.alternateMax'],
        operator: 'containsRange',
        target: { source: 'answer', multiply: 0.5 },
      },
      weight: 7,
    });
    const trace = evaluate(effect, { alternateMin: 5, alternateMax: 15 }, 20);
    expect(trace).toMatchObject({
      criterionId: effect.id,
      actual: [5, 15],
      target: 10,
      match: 1,
      weight: 7,
      field: 'specs.alternateMin|specs.alternateMax',
      reason: effect.reason,
      warning: effect.warning,
    });
  });

  it('supports nested alternate rules while preserving parent trace identity', () => {
    const effect = scoringCriterion({
      id: 'parent',
      field: 'specs.primary',
      operator: 'equals',
      target: 'primary',
      fallback: {
        field: 'specs.secondary',
        operator: 'equals',
        target: 'secondary',
        fallback: {
          field: 'specs.tertiary',
          operator: 'equals',
          target: 'tertiary',
        },
      },
    });
    expect(evaluate(effect, { tertiary: 'tertiary' })).toMatchObject({
      criterionId: 'parent', field: 'specs.tertiary', actual: 'tertiary', target: 'tertiary',
      match: 1, state: 'match',
    });
  });

  it.each([undefined, null, ''])('uses fallback for absent primary value %s', (primary) => {
    const effect = scoringCriterion({
      field: 'specs.primary', operator: 'equals', target: true,
      fallback: { field: 'specs.alternate', operator: 'equals', target: true },
    });
    expect(evaluate(effect, { primary, alternate: true })).toMatchObject({
      field: 'specs.alternate', actual: true, match: 1, state: 'match',
    });
  });

  it('does not fall back when primary data is present with an invalid type', () => {
    const effect = scoringCriterion({
      field: 'specs.primary', operator: 'atLeast', target: 10,
      fallback: { field: 'specs.alternate', operator: 'atLeast', target: 10 },
    });
    expect(evaluate(effect, { primary: 'invalid', alternate: 20 })).toMatchObject({
      field: 'specs.primary', actual: 'invalid', target: 10, state: 'missing',
    });
  });

  it('reports the deepest alternate rule when all declared data is missing', () => {
    const effect = scoringCriterion({
      field: 'specs.primary', operator: 'equals', target: true,
      fallback: {
        field: 'specs.secondary', operator: 'equals', target: true,
        fallback: { field: 'specs.tertiary', operator: 'equals', target: true },
      },
    });
    expect(evaluate(effect, {})).toMatchObject({
      criterionId: effect.id, field: 'specs.tertiary', actual: null,
      target: true, match: effect.missingScore, state: 'missing',
    });
  });

  it('keeps missing state and missingScore when required primary data is unavailable', () => {
    const trace = evaluate(scoringCriterion({ missingScore: 0.5 }), {});
    expect(trace).toMatchObject({ field: 'specs.value', actual: null, match: 0.5, state: 'missing' });
  });

  it('always exposes editorial keywords as both locale arrays', () => {
    expect(evaluate(scoringCriterion(), { value: 10 }).editorialKeywords).toEqual({
      'es-ES': ['primero', 'segundo'], en: ['first', 'second'],
    });
    expect(evaluate(scoringCriterion({ editorialKeywords: undefined }), { value: 10 }).editorialKeywords)
      .toEqual({ 'es-ES': [], en: [] });
  });
});

describe('scoreProducts', () => {
  it('resolves criteria in question order and ignores a neutral single response', () => {
    const first = scoringCriterion({ id: 'first', target: true });
    const second = scoringCriterion({ id: 'second', target: true });
    const cfg = config('synthetic', [
      selectedQuestion([first], 'first-question'), selectedQuestion([second], 'second-question'),
    ]);
    const candidate = product('synthetic', 'candidate', { value: true });
    expect(scoreProducts([candidate], {
      'second-question': 'selected', 'first-question': 'selected',
    }, cfg)[0].traces.map((trace) => trace.criterionId)).toEqual(['first', 'second']);
    expect(scoreProducts([candidate], {
      'second-question': 'neutral', 'first-question': 'neutral',
    }, cfg)[0].traces).toEqual([]);
  });

  it('matches scalar and array option answers exactly', () => {
    const effect = scoringCriterion({ target: true });
    const scalar: SelectorQuestion = {
      id: 'choice', kind: 'single', title: text('Choice'),
      options: [{ value: 'Ready', label: text('Ready'), effects: [effect] }],
    };
    const candidate = product('synthetic', 'candidate', { value: true });
    expect(scoreProducts([candidate], { choice: 'ready' }, config('synthetic', [scalar]))[0].traces)
      .toEqual([]);
    expect(scoreProducts([candidate], { choice: 'Ready' }, config('synthetic', [scalar]))[0].traces)
      .toHaveLength(1);

    const array: SelectorQuestion = {
      id: 'choice', kind: 'single', title: text('Choice'),
      options: [{ value: ['a', 'b'], label: text('Pair'), effects: [effect] }],
    };
    expect(scoreProducts([candidate], { choice: ['a', 'b'] }, config('synthetic', [array]))[0].traces)
      .toHaveLength(1);
    expect(scoreProducts([candidate], { choice: ['b', 'a'] }, config('synthetic', [array]))[0].traces)
      .toEqual([]);
  });

  it('short-circuits scalar neutralValue before mistakenly configured option effects', () => {
    const neutral: SelectorQuestion = {
      id: 'choice', kind: 'single', title: text('Choice'), neutralValue: 'none',
      options: [{ value: 'none', label: text('None'), effects: [scoringCriterion({ target: true })] }],
    };
    const result = scoreProducts(
      [product('synthetic', 'candidate', { value: true })],
      { choice: 'none' }, config('synthetic', [neutral]),
    );
    expect(result[0].traces).toEqual([]);
  });

  it('short-circuits an exact array neutralValue deterministically', () => {
    const effect = scoringCriterion({ target: true });
    const neutral: SelectorQuestion = {
      id: 'choice', kind: 'multi', title: text('Choice'), neutralValue: ['a', 'b'],
      options: [{ value: 'b', label: text('B'), effects: [effect] }],
    };
    const candidate = product('synthetic', 'candidate', { value: true });
    expect(scoreProducts([candidate], { choice: ['a', 'b'] }, config('synthetic', [neutral]))[0].traces)
      .toEqual([]);
    expect(scoreProducts([candidate], { choice: ['b', 'a'] }, config('synthetic', [neutral]))[0].traces)
      .toHaveLength(1);
  });

  it('uses selected multi options in option order and deduplicates criterion IDs', () => {
    const repeated = scoringCriterion({ id: 'repeated', target: true });
    const later = scoringCriterion({ id: 'later', target: true });
    const multi: SelectorQuestion = {
      id: 'multi', kind: 'multi', title: text('Multi'),
      options: [
        { value: 'a', label: text('A'), effects: [repeated] },
        { value: 'b', label: text('B'), effects: [{ ...repeated }, later] },
      ],
    };
    const result = scoreProducts(
      [product('synthetic', 'candidate', { value: true })],
      { multi: ['b', 'a'] }, config('synthetic', [multi]),
    );
    expect(result[0].traces.map((trace) => trace.criterionId)).toEqual(['repeated', 'later']);
  });

  it('structurally matches array-valued multi options while preserving order and dedupe', () => {
    const arrayOnly = scoringCriterion({ id: 'array-only', target: true });
    const repeated = scoringCriterion({ id: 'repeated-array', target: true });
    const later = scoringCriterion({ id: 'later-array', target: true });
    const multi: SelectorQuestion = {
      id: 'multi-array', kind: 'multi', title: text('Multi array'),
      options: [
        { value: ['a', 'b'], label: text('Pair'), effects: [arrayOnly, repeated] },
        { value: 'later', label: text('Later'), effects: [{ ...repeated }, later] },
      ],
    };
    const result = scoreProducts(
      [product('synthetic', 'candidate', { value: true })],
      { 'multi-array': ['later', ['a', 'b']] },
      config('synthetic', [multi]),
    );
    expect(result[0].traces.map((trace) => trace.criterionId))
      .toEqual(['array-only', 'repeated-array', 'later-array']);
  });

  it('activates criteria from a strict cross-answer scalar predicate', () => {
    const guarded = scoringCriterion({
      target: { source: 'literal', value: true },
      when: { answerId: 'mode', in: ['enabled'] },
    });
    const cfg = config('synthetic', [directQuestion([guarded])]);
    const candidate = product('synthetic', 'candidate', { value: true });
    expect(scoreProducts([candidate], { input: 1, mode: 'enabled' }, cfg)[0].traces).toHaveLength(1);
    expect(scoreProducts([candidate], { input: 1, mode: 'Enabled' }, cfg)[0].traces).toHaveLength(0);
  });

  it('activates cross-answer predicates for array intersection and answerKey values', () => {
    const fromArray = scoringCriterion({
      id: 'array', target: true, when: { answerId: 'modes', in: ['enabled', 'other'] },
    });
    const fromKey = scoringCriterion({
      id: 'key', target: true,
      when: { answerId: 'dimensions', answerKey: 'profile', in: ['enabled'] },
    });
    const cfg = config('synthetic', [directQuestion([fromArray, fromKey])]);
    const candidate = product('synthetic', 'candidate', { value: true });
    const active = scoreProducts([candidate], {
      input: 1,
      modes: ['disabled', 'other'],
      dimensions: { profile: 'enabled' },
    }, cfg)[0];
    expect(active.traces.map((trace) => trace.criterionId)).toEqual(['array', 'key']);

    const inactive = scoreProducts([candidate], {
      input: 1,
      modes: ['disabled'],
      dimensions: { profile: 'Enabled' },
    }, cfg)[0];
    expect(inactive.traces).toEqual([]);
  });

  it('includes missingScore in the full weighted denominator', () => {
    const result = scoreProducts(
      [qualityProduct('candidate', null)], { input: 10 },
      config('synthetic', [directQuestion([scoringCriterion({ weight: 3, missingScore: 0.5 })])]),
    )[0];
    expect(result.score).toBe(50);
    expect(result.traces[0].match).toBe(0.5);
  });

  it('combines fit at 85 percent and quality at 15 percent exactly', () => {
    const result = scoreProducts(
      [qualityProduct('candidate', 8, { value: 5 })], { input: 10 },
      config('synthetic', [directQuestion([scoringCriterion({ operator: 'atLeast', target: 10 })])]),
    )[0];
    expect(result.traces[0].match).toBe(0.5);
    expect(result.score).toBe(55);
  });

  it('uses quality alone when no criteria are active', () => {
    const ranked = scoreProducts([
      qualityProduct('low', 4), qualityProduct('high', 9), qualityProduct('fallback', null),
    ], { choice: 'selected' }, config('synthetic', [selectedQuestion([])]));
    expect(ranked.map(({ producto, score }) => [producto.slug, score])).toEqual([
      ['high', 90], ['fallback', 50], ['low', 40],
    ]);
  });

  it('applies penalty factors and caps in trace order and records violations', () => {
    const first = scoringCriterion({
      id: 'first', operator: 'atLeast', target: 10, penalty: { factor: 0.8 },
    });
    const second = scoringCriterion({
      id: 'second', operator: 'atLeast', target: 10, penalty: { factor: 0.5, cap: 20 },
    });
    const result = scoreProducts(
      [qualityProduct('candidate', 10, { value: 5 })], { input: 10 },
      config('synthetic', [directQuestion([first, second])]),
    )[0];
    expect(result.score).toBe(20);
    expect(result.violations.map((trace) => trace.criterionId)).toEqual(['first', 'second']);
  });

  it('does not apply a penalty to missing data', () => {
    const missing = scoringCriterion({ missingScore: 0.5, penalty: { factor: 0, cap: 0 } });
    const result = scoreProducts(
      [qualityProduct('candidate', null)], { input: 10 },
      config('synthetic', [directQuestion([missing])]),
    )[0];
    expect(result.score).toBe(50);
    expect(result.violations).toEqual([]);
  });

  it('reports unique missing fields across scalar and range traces', () => {
    const scalar = scoringCriterion({ id: 'scalar', field: 'specs.shared' });
    const duplicate = scoringCriterion({ id: 'duplicate', field: 'specs.shared' });
    const range = scoringCriterion({
      id: 'range', operator: 'containsRange', field: undefined,
      rangeFields: ['specs.shared', 'specs.other'],
    });
    const result = scoreProducts(
      [product('synthetic', 'candidate')], { input: 10 },
      config('synthetic', [directQuestion([scalar, duplicate, range])]),
    )[0];
    expect(result.missingFields).toEqual(['specs.shared', 'specs.other']);
    expect(result.traces.every((trace) => trace.state === 'missing')).toBe(true);
  });

  it('returns the default top three without duplicate products', () => {
    const best = qualityProduct('best', 10);
    const result = scoreProducts([
      qualityProduct('fourth', 6), best, qualityProduct('third', 7), best, qualityProduct('second', 8),
    ], { choice: 'selected' }, config('synthetic', [selectedQuestion([])]));
    expect(result.map((item) => item.producto.slug)).toEqual(['best', 'second', 'third']);
  });

  it('uses data quality, global note, and slug as the deterministic tie chain', () => {
    const cfg = config('synthetic', [directQuestion([scoringCriterion({ target: true })])]);
    const candidates = [
      qualityProduct('z-slug', 8, { value: true }, 50),
      qualityProduct('a-slug', 8, { value: true }, 50),
      qualityProduct('higher-note', 8.1, { value: true }, 50),
      qualityProduct('higher-data', 8, { value: true }, 80),
      qualityProduct('null-data', 8.2, { value: true }, null),
    ];
    const result = scoreProducts(candidates, { input: 1 }, cfg, 10);
    expect(result.every((item) => item.score === 97)).toBe(true);
    expect(result.map((item) => item.producto.slug)).toEqual([
      'higher-data', 'higher-note', 'a-slug', 'z-slug', 'null-data',
    ]);
  });

  it('returns stable repeated output without mutating products, answers, or config', () => {
    const products = deepFreeze([
      qualityProduct('b', 7, { value: 5 }), qualityProduct('a', 7, { value: 5 }),
    ]);
    const answers = deepFreeze({ input: 10 });
    const cfg = deepFreeze(config('synthetic', [directQuestion([
      scoringCriterion({ operator: 'atLeast', target: { source: 'answer' } }),
    ])]));
    const before = JSON.stringify({ products, answers, cfg });
    const first = scoreProducts(products, answers, cfg, 10);
    const second = scoreProducts(products, answers, cfg, 10);
    expect(first).toEqual(second);
    expect(first.map((item) => item.producto.slug)).toEqual(['a', 'b']);
    expect(JSON.stringify({ products, answers, cfg })).toBe(before);
  });

  it('scores a wholly synthetic product type and field without engine changes', () => {
    const cfg = config('nebula', [directQuestion([scoringCriterion({
      id: 'signal-fit', field: 'specs.signal', operator: 'equals', target: 'clear',
    })])]);
    const result = scoreProducts([
      product('nebula', 'weak', { signal: 'noisy' }),
      product('nebula', 'strong', { signal: 'clear' }),
    ], { input: 'clear' }, cfg);
    expect(result.map((item) => item.producto.slug)).toEqual(['strong', 'weak']);
  });
});

it('keeps scoring.ts free of production category, type, and field vocabulary', () => {
  const source = readFileSync(new URL('./scoring.ts', import.meta.url), 'utf8');
  expect(source).not.toMatch(
    /\b(?:silla|sillas|escritorio|escritorios|accesorios|ambiente|audio-video|ergonomia|ajustabilidad|materiales|comodidad|calidadPrecio|pesoMaxKg|garantiaAnios|reposabrazos|respaldo)\b/i,
  );
});

const explanationTrace = (overrides: Partial<CriterionTrace> = {}): CriterionTrace => ({
  criterionId: 'trace',
  questionId: 'question',
  field: 'specs.value',
  actual: 10,
  target: 8,
  match: 1,
  weight: 1,
  state: 'match',
  reason: { 'es-ES': 'Razón técnica', en: 'Technical reason' },
  warning: { 'es-ES': 'Aviso técnico', en: 'Technical warning' },
  editorialKeywords: { 'es-ES': [], en: [] },
  ...overrides,
});

function explanationProduct(overrides: Partial<Producto> = {}): Producto {
  return {
    ...product('synthetic', 'explanation'),
    nombre: 'Nombre español',
    marca: 'Marca',
    idealPara: undefined,
    ...overrides,
  } as Producto;
}

function explanationScore(
  producto: Producto,
  traces: readonly CriterionTrace[] = [],
  violations: readonly CriterionTrace[] = [],
): ScoredProduct {
  return { producto, score: 80, traces, missingFields: [], violations };
}

function compileTimeExplanationAssertions(explanation: ProductExplanation): void {
  // @ts-expect-error generated reasons property is readonly
  explanation.reasons = [];
  // @ts-expect-error generated reasons are readonly
  explanation.reasons.push('mutated');
  // @ts-expect-error generated warning property is readonly
  explanation.warning = null;
}
void compileTimeExplanationAssertions;

describe('generateProductExplanation', () => {
  it('orders accepted positive traces by descending weighted match', () => {
    const traces = [
      explanationTrace({ criterionId: 'low', weight: 1, match: 0.5, state: 'partial', reason: text('Low') }),
      explanationTrace({ criterionId: 'high', weight: 3, reason: text('High') }),
      explanationTrace({ criterionId: 'middle', weight: 2, match: 0.5, state: 'partial', reason: text('Middle') }),
      explanationTrace({ criterionId: 'miss', weight: 99, match: 0, state: 'miss', reason: text('Miss') }),
      explanationTrace({ criterionId: 'missing', weight: 99, match: 0.5, state: 'missing', reason: text('Missing') }),
    ];
    expect(generateProductExplanation(explanationScore(explanationProduct(), traces), 'en').reasons)
      .toEqual(['High', 'Middle', 'Low']);
  });

  it('preserves trace order when weighted match values tie', () => {
    const traces = [
      explanationTrace({ criterionId: 'first', weight: 2, match: 0.5, state: 'partial', reason: text('First') }),
      explanationTrace({ criterionId: 'second', weight: 1, match: 1, reason: text('Second') }),
      explanationTrace({ criterionId: 'third', weight: 4, match: 0.25, state: 'partial', reason: text('Third') }),
    ];
    expect(generateProductExplanation(explanationScore(explanationProduct(), traces), 'en').reasons)
      .toEqual(['First', 'Second', 'Third']);
  });

  it('trims and removes duplicate normalized technical reasons', () => {
    const traces = [
      explanationTrace({ criterionId: 'first', weight: 2, reason: text('  Ajuste ergonómico  ') }),
      explanationTrace({ criterionId: 'duplicate', reason: text('ajuste ERGONOMICO') }),
    ];
    expect(generateProductExplanation(explanationScore(explanationProduct(), traces), 'es-ES').reasons)
      .toEqual(['Ajuste ergonómico']);
  });

  it('interpolates only allowed placeholders and preserves unknown placeholders literally', () => {
    const producto = explanationProduct({
      nombre: 'Nombre local',
      marca: 'Fabricante',
      en: { nombreComercial: 'Localized name' },
    });
    expect(interpolateExplanationTemplate(
      '{actual}|{target}|{productName}|{brand}|{unknown}|{{actual}}',
      explanationTrace({ actual: null, target: undefined }),
      producto,
      'en',
    )).toBe('||Localized name|Fabricante|{unknown}|{}');
  });

  it('selects editorial reasons accent/case insensitively by overlap then source and index', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Primera ERGONÓMICA', 'Segunda regulable'],
      puntosFuertes: ['Fuerte ergonómica regulable', 'Otro regulable'],
    });
    const traces = [explanationTrace({
      state: 'miss', match: 0,
      editorialKeywords: { 'es-ES': ['ergonomica', 'REGULÁBLE'], en: [] },
    })];
    expect(generateProductExplanation(explanationScore(producto, traces), 'es-ES').reasons)
      .toEqual(['Fuerte ergonómica regulable', 'Primera ERGONÓMICA', 'Segunda regulable']);
  });

  it('requires editorial overlap and uses idealPara only as the final localized fallback', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Sin relación'],
      puntosFuertes: ['Tampoco coincide'],
      idealPara: 'Ideal final',
    });
    const traces = [explanationTrace({
      state: 'miss', match: 0,
      editorialKeywords: { 'es-ES': ['preciso'], en: [] },
    })];
    expect(generateProductExplanation(explanationScore(producto, traces), 'es-ES').reasons)
      .toEqual(['Ideal final']);
  });

  it('honors zero, one, and three maxReasons and treats invalid limits conservatively', () => {
    const traces = ['One', 'Two', 'Three', 'Four'].map((value, index) =>
      explanationTrace({ criterionId: value, weight: 4 - index, reason: text(value) }));
    const scored = explanationScore(explanationProduct(), traces);
    expect(generateProductExplanation(scored, 'en', { maxReasons: 0 }).reasons).toEqual([]);
    expect(generateProductExplanation(scored, 'en', { maxReasons: 1 }).reasons).toEqual(['One']);
    expect(generateProductExplanation(scored, 'en', { maxReasons: 3 }).reasons).toEqual(['One', 'Two', 'Three']);
    expect(generateProductExplanation(scored, 'en', { maxReasons: -1 }).reasons).toEqual([]);
    expect(generateProductExplanation(scored, 'en', { maxReasons: Number.NaN }).reasons).toEqual([]);
    expect(generateProductExplanation(scored, 'en', { maxReasons: 1.9 }).reasons).toEqual(['One']);
  });

  it('prioritizes violation then missing then best editorial warning', () => {
    const violation = explanationTrace({
      criterionId: 'violation', state: 'partial', warning: text('Violation'),
    });
    const missing = explanationTrace({
      criterionId: 'missing', state: 'missing', warning: text('Missing'),
    });
    const keyword = explanationTrace({
      criterionId: 'keyword', state: 'miss', match: 0, warning: text(''),
      editorialKeywords: { 'es-ES': ['limite'], en: ['limit'] },
    });
    const producto = explanationProduct({
      paraQuienNo: ['Límite editorial'], puntosDebiles: ['Punto débil'], limitaciones: ['Limitación'],
    });
    expect(generateProductExplanation(
      explanationScore(producto, [missing, keyword, violation], [violation]), 'es-ES',
    ).warning).toBe('Violation');
    expect(generateProductExplanation(
      explanationScore(producto, [missing, keyword], []), 'es-ES',
    ).warning).toBe('Missing');
    expect(generateProductExplanation(
      explanationScore(producto, [keyword], []), 'es-ES',
    ).warning).toBe('Límite editorial');
  });

  it('uses the first nonblank weak point only when no warning editorial overlap exists', () => {
    const producto = explanationProduct({
      paraQuienNo: ['No usar'], puntosDebiles: ['  ', 'Honest fallback'], limitaciones: ['Otra línea'],
    });
    expect(generateProductExplanation(explanationScore(producto), 'es-ES').warning)
      .toBe('Honest fallback');
  });

  it('uses only English editorial fields and never Spanish or limitations fallbacks', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Español keyword'],
      paraQuienNo: ['Aviso español keyword'],
      puntosFuertes: ['Fuerte español keyword'],
      puntosDebiles: ['Débil español'],
      idealPara: 'Ideal español',
      limitaciones: ['Limitación keyword'],
      en: {
        paraQuienSi: ['English keyword'],
        puntosFuertes: [],
        paraQuienNo: [],
        puntosDebiles: [],
      },
    });
    const keyword = explanationTrace({
      state: 'miss', match: 0, reason: text(''), warning: text(''),
      editorialKeywords: { 'es-ES': ['español'], en: ['keyword'] },
    });
    expect(generateProductExplanation(explanationScore(producto, [keyword]), 'en'))
      .toEqual({ reasons: ['English keyword'], warning: null });
  });

  it('uses English strengths without falling back to Spanish positive editorial fields', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Spanish keyword profile'],
      puntosFuertes: ['Spanish keyword strength'],
      idealPara: 'Spanish ideal',
      en: { paraQuienSi: [], puntosFuertes: ['English keyword strength'] },
    });
    const keyword = explanationTrace({
      state: 'miss', match: 0, reason: text(''), warning: text(''),
      editorialKeywords: { 'es-ES': ['spanish'], en: ['keyword'] },
    });
    expect(generateProductExplanation(explanationScore(producto, [keyword]), 'en').reasons)
      .toEqual(['English keyword strength']);
  });

  it('uses the English ideal fallback without falling back to Spanish idealPara', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Spanish profile'], puntosFuertes: ['Spanish strength'], idealPara: 'Spanish ideal',
      en: { paraQuienSi: [], puntosFuertes: [], idealPara: 'English ideal' },
    });
    expect(generateProductExplanation(explanationScore(producto), 'en').reasons)
      .toEqual(['English ideal']);

    const withoutEnglishIdeal = explanationProduct({
      idealPara: 'Spanish ideal', en: { paraQuienSi: [], puntosFuertes: [] },
    });
    expect(generateProductExplanation(explanationScore(withoutEnglishIdeal), 'en').reasons)
      .toEqual([]);
  });

  it('uses English paraQuienNo without falling back to the Spanish warning field', () => {
    const producto = explanationProduct({
      paraQuienNo: ['Spanish keyword warning'],
      puntosDebiles: ['Spanish weakness'],
      en: { paraQuienNo: ['English keyword warning'], puntosDebiles: [] },
    });
    const keyword = explanationTrace({
      state: 'miss', match: 0, reason: text(''), warning: text(''),
      editorialKeywords: { 'es-ES': ['spanish'], en: ['keyword'] },
    });
    expect(generateProductExplanation(explanationScore(producto, [keyword]), 'en').warning)
      .toBe('English keyword warning');
  });

  it('uses English weak points without falling back to Spanish puntosDebiles', () => {
    const producto = explanationProduct({
      puntosDebiles: ['Spanish fallback'],
      en: { paraQuienNo: [], puntosDebiles: ['English fallback'] },
    });
    expect(generateProductExplanation(explanationScore(producto), 'en').warning)
      .toBe('English fallback');

    const withoutEnglishWeakness = explanationProduct({
      puntosDebiles: ['Spanish fallback'], en: { paraQuienNo: [], puntosDebiles: [] },
    });
    expect(generateProductExplanation(explanationScore(withoutEnglishWeakness), 'en').warning)
      .toBeNull();
  });

  it('chooses the first nonblank warning from multiple violations', () => {
    const first = explanationTrace({ criterionId: 'first-violation', warning: text('First violation') });
    const second = explanationTrace({ criterionId: 'second-violation', warning: text('Second violation') });
    expect(generateProductExplanation(
      explanationScore(explanationProduct(), [first, second], [first, second]), 'en',
    ).warning).toBe('First violation');
  });

  it('chooses the first nonblank warning from multiple missing traces', () => {
    const first = explanationTrace({
      criterionId: 'first-missing', state: 'missing', warning: text('First missing'),
    });
    const second = explanationTrace({
      criterionId: 'second-missing', state: 'missing', warning: text('Second missing'),
    });
    expect(generateProductExplanation(
      explanationScore(explanationProduct(), [first, second]), 'en',
    ).warning).toBe('First missing');
  });

  it('orders warning editorial candidates by overlap then source priority', () => {
    const keyword = explanationTrace({
      state: 'miss', match: 0, reason: text(''), warning: text(''),
      editorialKeywords: { 'es-ES': ['alpha', 'beta'], en: [] },
    });
    const higherOverlap = explanationProduct({
      paraQuienNo: ['Alpha excluded profile'],
      puntosDebiles: ['Alpha beta weak point'],
      limitaciones: ['Alpha beta limitation'],
    });
    expect(generateProductExplanation(explanationScore(higherOverlap, [keyword]), 'es-ES').warning)
      .toBe('Alpha beta weak point');

    const sourceTie = explanationProduct({
      paraQuienNo: ['Alpha excluded profile'],
      puntosDebiles: ['Alpha weak point'],
      limitaciones: ['Alpha limitation'],
    });
    expect(generateProductExplanation(explanationScore(sourceTie, [keyword]), 'es-ES').warning)
      .toBe('Alpha excluded profile');
  });

  it('selects Spanish limitaciones when it has the best keyword overlap', () => {
    const producto = explanationProduct({
      paraQuienNo: ['Alpha excluded profile'],
      puntosDebiles: ['Beta weak point'],
      limitaciones: ['Alpha beta limitation'],
    });
    const keyword = explanationTrace({
      state: 'miss', match: 0, reason: text(''), warning: text(''),
      editorialKeywords: { 'es-ES': ['alpha', 'beta'], en: [] },
    });
    expect(generateProductExplanation(explanationScore(producto, [keyword]), 'es-ES').warning)
      .toBe('Alpha beta limitation');
  });

  it('still uses English technical templates when translated editorial arrays are empty', () => {
    const producto = explanationProduct({
      paraQuienSi: ['Texto español'], puntosDebiles: ['Aviso español'],
      en: { paraQuienSi: [], puntosFuertes: [], paraQuienNo: [], puntosDebiles: [] },
    });
    const positive = explanationTrace({ reason: { 'es-ES': 'Razón española', en: 'English technical' } });
    const missing = explanationTrace({
      criterionId: 'missing', state: 'missing', warning: { 'es-ES': 'Aviso español', en: 'English missing' },
    });
    expect(generateProductExplanation(explanationScore(producto, [positive, missing]), 'en'))
      .toEqual({ reasons: ['English technical'], warning: 'English missing' });
  });

  it('uses localizedProductName in generated technical copy', () => {
    const producto = explanationProduct({
      nombre: 'Nombre español', en: { nombreComercial: 'English Product' },
    });
    const trace = explanationTrace({ reason: text('{productName}') });
    expect(generateProductExplanation(explanationScore(producto, [trace]), 'en').reasons)
      .toEqual(['English Product']);
  });

  it('returns deterministic output without mutating a deeply frozen input', () => {
    const trace = explanationTrace({
      reason: text('{brand} {actual}'),
      editorialKeywords: { 'es-ES': ['fuerte'], en: ['strong'] },
    });
    const scored = deepFreeze(explanationScore(explanationProduct({
      puntosFuertes: ['Fuerte editorial'],
    }), [trace]));
    const before = JSON.stringify(scored);
    const first = generateProductExplanation(scored, 'es-ES');
    const second = generateProductExplanation(scored, 'es-ES');
    expect(first).toEqual(second);
    expect(JSON.stringify(scored)).toBe(before);
  });
});

it('keeps razones.ts generic and free of production category vocabulary', () => {
  const source = readFileSync(new URL('./razones.ts', import.meta.url), 'utf8');
  expect(source).not.toMatch(
    /\b(?:silla|sillas|escritorio|escritorios|accesorios|ambiente|audio-video|ergonomia|ajustabilidad|materiales|comodidad|calidadPrecio|pesoMaxKg|garantiaAnios|reposabrazos|respaldo)\b/i,
  );
});
