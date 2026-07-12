import { localizedProductName, normalizaTexto } from '../productos';
import type { SelectorProductPayload } from './payload';
import { DEFAULT_LOCALE } from '../../i18n/locales';
import type { Locale } from '../../i18n/locales';
import type { CriterionTrace, ScoredProduct } from './scoring';

type ExplanationLocale = Extract<Locale, 'es-ES' | 'en'>;

export interface ProductExplanation {
  readonly reasons: readonly string[];
  readonly warning: string | null;
}

export interface ProductExplanationOptions {
  maxReasons?: number;
}

interface EditorialSources {
  positive: readonly (readonly string[])[];
  negative: readonly (readonly string[])[];
  weakPoints: readonly string[];
  ideal: string | undefined;
}

interface RankedEditorialLine {
  text: string;
  overlap: number;
  sourcePriority: number;
  index: number;
}

function stringifyTemplateValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

export function interpolateExplanationTemplate(
  template: string,
  trace: Pick<CriterionTrace, 'actual' | 'target'>,
  producto: SelectorProductPayload,
  locale: ExplanationLocale = DEFAULT_LOCALE,
): string {
  const values: Record<'actual' | 'target' | 'productName' | 'brand', string> = {
    actual: stringifyTemplateValue(trace.actual),
    target: stringifyTemplateValue(trace.target),
    productName: producto.locale === locale ? producto.nombre : localizedProductName(producto, locale),
    brand: stringifyTemplateValue(producto.marca),
  };
  return template.replace(/\{(actual|target|productName|brand)\}/g, (_, key: keyof typeof values) => values[key]);
}

function editorialSources(producto: SelectorProductPayload, locale: ExplanationLocale): EditorialSources {
  if (producto.locale === locale) {
    return {
      positive: [producto.paraQuienSi, producto.puntosFuertes],
      negative: [producto.paraQuienNo, producto.puntosDebiles, producto.limitaciones ?? []],
      weakPoints: producto.puntosDebiles,
      ideal: producto.idealPara,
    };
  }
  if (locale === DEFAULT_LOCALE) {
    return {
      positive: [producto.paraQuienSi, producto.puntosFuertes],
      negative: [producto.paraQuienNo, producto.puntosDebiles, producto.limitaciones ?? []],
      weakPoints: producto.puntosDebiles,
      ideal: producto.idealPara,
    };
  }
  const fullProduct = producto as unknown as { en?: {
    paraQuienSi?: string[]; puntosFuertes?: string[]; paraQuienNo?: string[];
    puntosDebiles?: string[]; idealPara?: string;
  } };
  return {
    positive: [fullProduct.en?.paraQuienSi ?? [], fullProduct.en?.puntosFuertes ?? []],
    negative: [fullProduct.en?.paraQuienNo ?? [], fullProduct.en?.puntosDebiles ?? []],
    weakPoints: fullProduct.en?.puntosDebiles ?? [],
    ideal: fullProduct.en?.idealPara,
  };
}

function localizedKeywords(traces: readonly CriterionTrace[], locale: ExplanationLocale): readonly string[] {
  const keywords = new Map<string, string>();
  for (const trace of traces) {
    for (const keyword of trace.editorialKeywords[locale]) {
      const normalized = normalizaTexto(keyword);
      if (normalized && !keywords.has(normalized)) keywords.set(normalized, keyword);
    }
  }
  return [...keywords.keys()];
}

function keywordOverlap(line: string, normalizedKeywords: readonly string[]): number {
  const normalizedLine = normalizaTexto(line);
  if (!normalizedLine) return 0;
  return normalizedKeywords.reduce(
    (total, keyword) => total + (normalizedLine.includes(keyword) ? 1 : 0),
    0,
  );
}

function rankEditorialLines(
  sources: readonly (readonly string[])[],
  keywords: readonly string[],
): readonly RankedEditorialLine[] {
  const candidates: RankedEditorialLine[] = [];
  sources.forEach((lines, sourcePriority) => {
    lines.forEach((line, index) => {
      const text = line.trim();
      if (!text) return;
      const overlap = keywordOverlap(text, keywords);
      if (overlap > 0) candidates.push({ text, overlap, sourcePriority, index });
    });
  });
  return candidates.sort((left, right) =>
    right.overlap - left.overlap
    || left.sourcePriority - right.sourcePriority
    || left.index - right.index);
}

function normalizedReasonLimit(value: number | undefined): number {
  if (value === undefined) return 3;
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

function interpolatedTraceText(
  trace: CriterionTrace,
  field: 'reason' | 'warning',
  producto: SelectorProductPayload,
  locale: ExplanationLocale,
): string {
  return interpolateExplanationTemplate(trace[field][locale], trace, producto, locale).trim();
}

function firstTraceWarning(
  traces: readonly CriterionTrace[],
  producto: SelectorProductPayload,
  locale: ExplanationLocale,
): string | null {
  for (const trace of traces) {
    const warning = interpolatedTraceText(trace, 'warning', producto, locale);
    if (warning) return warning;
  }
  return null;
}

function generateWarning(
  scored: ScoredProduct,
  locale: ExplanationLocale,
  sources: EditorialSources,
  keywords: readonly string[],
): string | null {
  const violation = firstTraceWarning(scored.violations, scored.producto, locale);
  if (violation) return violation;

  const missing = firstTraceWarning(
    scored.traces.filter((trace) => trace.state === 'missing'),
    scored.producto,
    locale,
  );
  if (missing) return missing;

  const editorial = rankEditorialLines(sources.negative, keywords)[0];
  if (editorial) return editorial.text;
  return sources.weakPoints.find((line) => line.trim())?.trim() ?? null;
}

export function generateProductExplanation(
  scored: ScoredProduct,
  locale: ExplanationLocale,
  options: ProductExplanationOptions = {},
): ProductExplanation {
  const maxReasons = normalizedReasonLimit(options.maxReasons);
  const sources = editorialSources(scored.producto, locale);
  const keywords = localizedKeywords(scored.traces, locale);
  const reasons: string[] = [];
  const seen = new Set<string>();

  const addReason = (candidate: string): void => {
    if (reasons.length >= maxReasons) return;
    const text = candidate.trim();
    const normalized = normalizaTexto(text);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    reasons.push(text);
  };

  scored.traces
    .map((trace, index) => ({ trace, index }))
    .filter(({ trace }) =>
      (trace.state === 'match' || trace.state === 'partial')
      && trace.match > 0
      && trace.reason[locale].trim().length > 0)
    .sort((left, right) =>
      right.trace.weight * right.trace.match - left.trace.weight * left.trace.match
      || left.index - right.index)
    .forEach(({ trace }) => addReason(interpolatedTraceText(trace, 'reason', scored.producto, locale)));

  if (reasons.length < maxReasons) {
    rankEditorialLines(sources.positive, keywords).forEach(({ text }) => addReason(text));
  }
  if (reasons.length < maxReasons && sources.ideal) addReason(sources.ideal);

  return {
    reasons,
    warning: generateWarning(scored, locale, sources, keywords),
  };
}
