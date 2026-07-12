import { answerEquals } from './config';
import type {
  DeepReadonly,
  SelectorNumericValidation,
  SelectorQuestion,
  SelectorTypeConfig,
} from './config';

type ConfigInput = SelectorTypeConfig | DeepReadonly<SelectorTypeConfig>;
type QuestionInput = SelectorQuestion | DeepReadonly<SelectorQuestion>;
type Answers = Readonly<Record<string, unknown>>;

export interface ParsedSelectorUrl {
  readonly tipo: string | null;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly status: 'initial' | 'partial' | 'complete' | 'invalid';
  readonly nextQuestionId: string | null;
  readonly invalidKey: string | null;
  readonly invalidReason: 'unknown-type' | 'invalid-answer' | null;
  readonly canonicalSearch: string;
}

function scalarToken(value: unknown): string | null {
  if (value === null) return '_';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function escapeListValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,');
}

function splitEscapedList(value: string): string[] | null {
  const parts: string[] = [];
  let current = '';
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === ',') {
      parts.push(current);
      current = '';
    } else {
      current += character;
    }
  }
  if (escaped) return null;
  parts.push(current);
  return parts;
}

function isOnStep(value: number, validation: SelectorNumericValidation): boolean {
  if (validation.min !== undefined && value < validation.min) return false;
  if (validation.max !== undefined && value > validation.max) return false;
  if (validation.step === undefined) return true;
  const offset = value - (validation.min ?? 0);
  return Math.abs(offset / validation.step - Math.round(offset / validation.step)) < 1e-9;
}

function parseOption(question: Extract<QuestionInput, { kind: 'single' }>, token: string): unknown {
  return question.options.find((option) => scalarToken(option.value) === token)?.value;
}

function parseMulti(question: Extract<QuestionInput, { kind: 'multi' }>, token: string): string[] | undefined {
  if (token === 'none') {
    const { minSelections, maxSelections } = question.validation ?? {};
    const permitsZero = (minSelections ?? 0) === 0 && (maxSelections === undefined || maxSelections >= 0);
    return answerEquals(question.neutralValue, []) && permitsZero ? [] : undefined;
  }
  if (!token.startsWith('v:')) return undefined;
  const values = splitEscapedList(token.slice(2));
  if (!values || values.some((value) => value.length === 0)) return undefined;
  const allowed = new Set(
    question.options
      .map((option) => option.value)
      .filter((value): value is string => typeof value === 'string'),
  );
  if (values.some((value) => !allowed.has(value)) || new Set(values).size !== values.length) return undefined;
  if (!answerEquals(values, question.neutralValue)) {
    const { minSelections, maxSelections } = question.validation ?? {};
    if (minSelections !== undefined && values.length < minSelections) return undefined;
    if (maxSelections !== undefined && values.length > maxSelections) return undefined;
  }
  return values;
}

function parseNumber(question: Extract<QuestionInput, { kind: 'number' }>, token: string): number | null | undefined {
  if (token === '_') return question.neutralValue === null ? null : undefined;
  if (token.trim() === '') return undefined;
  const value = Number(token);
  if (!Number.isFinite(value) || !isOnStep(value, question.validation ?? {})) return undefined;
  return value;
}

function dimensionComponents(
  question: Extract<QuestionInput, { kind: 'dimensions' }>,
): readonly [string, DeepReadonly<SelectorNumericValidation>][] {
  const validation = question.validation;
  if (!validation || !('components' in validation)) return [];
  return Object.entries(validation.components);
}

function parseDimensions(
  question: Extract<QuestionInput, { kind: 'dimensions' }>,
  token: string,
): Readonly<Record<string, number>> | null | undefined {
  if (token === '_') return question.neutralValue === null ? null : undefined;
  const components = dimensionComponents(question);
  const parts = splitEscapedList(token);
  if (components.length === 0 || !parts || parts.length !== components.length) return undefined;
  const result: Record<string, number> = {};
  for (let index = 0; index < components.length; index += 1) {
    const [key, validation] = components[index];
    const separator = parts[index].indexOf(':');
    if (separator < 1 || parts[index].slice(0, separator) !== key) return undefined;
    const raw = parts[index].slice(separator + 1);
    const value = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(value) || !isOnStep(value, validation)) return undefined;
    result[key] = value;
  }
  return result;
}

function parseQuestion(question: QuestionInput, token: string): unknown {
  switch (question.kind) {
    case 'single': return parseOption(question, token);
    case 'multi': return parseMulti(question, token);
    case 'number': return parseNumber(question, token);
    case 'dimensions': return parseDimensions(question, token);
  }
}

function serializeQuestion(question: QuestionInput, value: unknown): string | null {
  if (question.kind === 'multi') {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null;
    return value.length === 0 ? 'none' : `v:${value.map(escapeListValue).join(',')}`;
  }
  if (question.kind === 'dimensions') {
    if (value === null) return '_';
    if (typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Readonly<Record<string, unknown>>;
    const components = dimensionComponents(question);
    if (components.length === 0) return null;
    const values: string[] = [];
    for (const [key] of components) {
      const token = scalarToken(record[key]);
      if (token === null || token === '_') return null;
      values.push(`${key}:${token}`);
    }
    return values.join(',');
  }
  return scalarToken(value);
}

export function serializeSelectorState(
  tipo: string,
  answers: Answers,
  config: ConfigInput,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tipo', tipo);
  for (const question of config.questions) {
    if (!Object.prototype.hasOwnProperty.call(answers, question.id)) continue;
    const token = serializeQuestion(question, answers[question.id]);
    if (token !== null) params.set(question.id, token);
  }
  return params;
}

export function parseSelectorUrl(
  search: string | URLSearchParams,
  configs: readonly ConfigInput[],
): ParsedSelectorUrl {
  const input = typeof search === 'string'
    ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    : new URLSearchParams(search);
  const tipo = input.get('tipo');
  if (tipo === null) {
    return {
      tipo: null, answers: {}, status: 'initial', nextQuestionId: null,
      invalidKey: null, invalidReason: null, canonicalSearch: '',
    };
  }
  const config = configs.find((candidate) => candidate.tipo === tipo);
  if (!config) {
    return {
      tipo: null, answers: {}, status: 'invalid', nextQuestionId: null,
      invalidKey: 'tipo', invalidReason: 'unknown-type', canonicalSearch: '',
    };
  }

  const answers: Record<string, unknown> = {};
  let invalidKey: string | null = null;
  for (const question of config.questions) {
    const token = input.get(question.id);
    if (token === null) continue;
    const value = parseQuestion(question, token);
    if (value === undefined) {
      invalidKey ??= question.id;
      continue;
    }
    answers[question.id] = value;
  }

  const firstMissing = config.questions.find((question) =>
    !Object.prototype.hasOwnProperty.call(answers, question.id));
  const canonicalSearch = serializeSelectorState(tipo, answers, config).toString();
  return {
    tipo,
    answers,
    status: invalidKey ? 'invalid' : firstMissing ? 'partial' : 'complete',
    nextQuestionId: firstMissing?.id ?? null,
    invalidKey,
    invalidReason: invalidKey ? 'invalid-answer' : null,
    canonicalSearch,
  };
}
