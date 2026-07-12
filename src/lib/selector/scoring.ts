import { getCampo, notaGlobal } from '../productos';
import type { SelectorProductPayload } from './payload';
import { answerEquals } from './config';
import type {
  AnswerExpression,
  DeepReadonly,
  LocalizedText,
  ReadonlySelectorTypeConfig,
  SelectorCriterion,
  SelectorCriterionFallback,
  SelectorTypeConfig,
} from './config';

export type CriterionState = 'match' | 'partial' | 'miss' | 'missing';

export interface CriterionTrace {
  criterionId: string;
  questionId: string;
  field: string | null;
  actual: unknown;
  target: unknown;
  match: number;
  weight: number;
  state: CriterionState;
  reason: LocalizedText;
  warning: LocalizedText;
  editorialKeywords: Record<'es-ES' | 'en', readonly string[]>;
}

export interface ScoredProduct {
  producto: SelectorProductPayload;
  score: number;
  traces: readonly CriterionTrace[];
  missingFields: readonly string[];
  violations: readonly CriterionTrace[];
}

export type SelectorAnswers = Readonly<Record<string, unknown>>;

type CriterionInput = SelectorCriterion | DeepReadonly<SelectorCriterion>;
type FallbackInput = SelectorCriterionFallback | DeepReadonly<SelectorCriterionFallback>;
type RuleInput = CriterionInput | FallbackInput;
type ConfigInput = SelectorTypeConfig | ReadonlySelectorTypeConfig;

interface ActiveCriterion {
  questionId: string;
  criterion: CriterionInput;
}

const NUMERIC_OPERATORS = new Set(['atLeast', 'atMost', 'containsRange', 'axis']);

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

function expressionValue(
  expression: DeepReadonly<AnswerExpression>,
  questionId: string,
  answers: SelectorAnswers,
): unknown {
  let value: unknown;
  if (expression.source === 'literal') {
    value = expression.value;
  } else {
    value = answers[questionId];
    if (expression.answerKey !== undefined) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
      value = (value as Readonly<Record<string, unknown>>)[expression.answerKey];
    }
  }

  if (expression.multiply !== undefined || expression.add !== undefined) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    value = value * (expression.multiply ?? 1) + (expression.add ?? 0);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  return value === undefined ? null : value;
}

function resolveTarget(
  target: RuleInput['target'],
  questionId: string,
  answers: SelectorAnswers,
): unknown {
  if (target !== null && typeof target === 'object' && !Array.isArray(target) && 'source' in target) {
    return expressionValue(target as DeepReadonly<AnswerExpression>, questionId, answers);
  }
  if (typeof target === 'number' && !Number.isFinite(target)) return null;
  return target;
}

function isCriterionActive(
  criterion: CriterionInput,
  answers: SelectorAnswers,
): boolean {
  if (!criterion.when) return true;
  let answer = answers[criterion.when.answerId];
  if (criterion.when.answerKey !== undefined) {
    if (answer === null || typeof answer !== 'object' || Array.isArray(answer)) return false;
    answer = (answer as Readonly<Record<string, unknown>>)[criterion.when.answerKey];
  }
  if (Array.isArray(answer)) {
    return answer.some((item) => criterion.when?.in.some((expected) => item === expected));
  }
  return criterion.when.in.some((expected) => answer === expected);
}

function traceField(rule: RuleInput): string | null {
  if (rule.operator === 'containsRange') return rule.rangeFields?.join('|') ?? null;
  return rule.field ?? null;
}

function primaryActual(producto: SelectorProductPayload, rule: RuleInput): unknown {
  if (rule.operator === 'containsRange') {
    if (!rule.rangeFields) return null;
    return rule.rangeFields.map((field) => getCampo(producto, field));
  }
  return rule.field ? getCampo(producto, rule.field) : null;
}

function dataIsMissing(actual: unknown, rule: RuleInput): boolean {
  if (rule.operator === 'containsRange') {
    return !Array.isArray(actual) || actual.length !== 2 || actual.some((value) => !isPresent(value));
  }
  return !isPresent(actual);
}

function actualIsUsable(actual: unknown, rule: RuleInput): boolean {
  if (rule.operator === 'containsRange') {
    return Array.isArray(actual)
      && actual.length === 2
      && actual.every((value) => typeof value === 'number' && Number.isFinite(value))
      && actual[0] <= actual[1];
  }
  if (!isPresent(actual)) return false;
  if (NUMERIC_OPERATORS.has(rule.operator)) {
    return typeof actual === 'number' && Number.isFinite(actual);
  }
  return true;
}

function targetIsUsable(target: unknown, rule: RuleInput): boolean {
  if (target === null || target === undefined || target === '') return false;
  if (NUMERIC_OPERATORS.has(rule.operator)) {
    return typeof target === 'number' && Number.isFinite(target);
  }
  if (rule.operator === 'ranked') {
    return rule.rank !== undefined
      && Object.prototype.hasOwnProperty.call(rule.rank, String(target));
  }
  return true;
}

function evaluateMatch(actual: unknown, target: unknown, rule: RuleInput): number {
  switch (rule.operator) {
    case 'equals':
      return answerEquals(actual, target) ? 1 : 0;
    case 'boolean':
      return actual === target ? 1 : 0;
    case 'atLeast': {
      const actualNumber = actual as number;
      const targetNumber = target as number;
      if (actualNumber >= targetNumber) return 1;
      return targetNumber > 0 ? clamp(actualNumber / targetNumber) : 0;
    }
    case 'atMost': {
      const actualNumber = actual as number;
      const targetNumber = target as number;
      if (actualNumber <= targetNumber) return 1;
      return actualNumber > 0 && targetNumber > 0 ? clamp(targetNumber / actualNumber) : 0;
    }
    case 'containsRange': {
      const [minimum, maximum] = actual as [number, number];
      const targetNumber = target as number;
      if (targetNumber >= minimum && targetNumber <= maximum) return 1;
      const span = Math.max(1, Math.abs(maximum - minimum));
      const distance = targetNumber < minimum ? minimum - targetNumber : targetNumber - maximum;
      return clamp(1 - distance / span);
    }
    case 'ranked': {
      const actualRank = rule.rank?.[String(actual)];
      const targetRank = rule.rank?.[String(target)];
      if (actualRank === undefined || targetRank === undefined) return 0;
      if (actualRank >= targetRank) return 1;
      return targetRank > 0 ? clamp(actualRank / targetRank) : 0;
    }
    case 'axis': {
      const actualNumber = actual as number;
      const targetNumber = target as number;
      return targetNumber > 0 ? clamp(actualNumber / targetNumber) : 0;
    }
  }
}

function stateFor(match: number): Exclude<CriterionState, 'missing'> {
  if (match === 1) return 'match';
  if (match === 0) return 'miss';
  return 'partial';
}

function localizedKeywords(keywords: CriterionInput['editorialKeywords']): CriterionTrace['editorialKeywords'] {
  return keywords
    ? { 'es-ES': [...keywords['es-ES']], en: [...keywords.en] }
    : { 'es-ES': [], en: [] };
}

function buildTrace(
  criterion: CriterionInput,
  questionId: string,
  field: string | null,
  actual: unknown,
  target: unknown,
  match: number,
  state: CriterionState,
): CriterionTrace {
  return {
    criterionId: criterion.id,
    questionId,
    field,
    actual,
    target,
    match: clamp(match),
    weight: criterion.weight,
    state,
    reason: { ...criterion.reason },
    warning: { ...criterion.warning },
    editorialKeywords: localizedKeywords(criterion.editorialKeywords),
  };
}

export function evaluateCriterion(
  producto: SelectorProductPayload,
  criterion: CriterionInput,
  questionId: string,
  answers: SelectorAnswers,
): CriterionTrace {
  let rule: RuleInput = criterion;
  let actual = primaryActual(producto, rule);
  while (dataIsMissing(actual, rule) && rule.fallback) {
    rule = rule.fallback;
    actual = primaryActual(producto, rule);
  }
  const target = resolveTarget(rule.target, questionId, answers);
  const field = traceField(rule);

  if (!actualIsUsable(actual, rule) || !targetIsUsable(target, rule)) {
    return buildTrace(
      criterion,
      questionId,
      field,
      dataIsMissing(actual, rule) ? null : actual,
      targetIsUsable(target, rule) ? target : null,
      criterion.missingScore,
      'missing',
    );
  }

  const match = clamp(evaluateMatch(actual, target, rule));
  return buildTrace(criterion, questionId, field, actual, target, match, stateFor(match));
}

function resolveActiveCriteria(config: ConfigInput, answers: SelectorAnswers): ActiveCriterion[] {
  const active: ActiveCriterion[] = [];
  const seenIds = new Set<string>();

  const add = (questionId: string, criterion: CriterionInput): void => {
    if (seenIds.has(criterion.id) || !isCriterionActive(criterion, answers)) return;
    seenIds.add(criterion.id);
    active.push({ questionId, criterion });
  };

  for (const question of config.questions) {
    const answer = answers[question.id];
    if (question.neutralValue !== undefined && answerEquals(answer, question.neutralValue)) continue;
    if (question.kind === 'single') {
      const selected = question.options.find((option) => answerEquals(option.value, answer));
      selected?.effects.forEach((effect) => add(question.id, effect));
      continue;
    }
    if (question.kind === 'multi') {
      if (!Array.isArray(answer)) continue;
      for (const option of question.options) {
        if (!answer.some((value) => answerEquals(value, option.value))) continue;
        option.effects.forEach((effect) => add(question.id, effect));
      }
      continue;
    }
    question.effects.forEach((effect) => add(question.id, effect));
  }

  return active;
}

function missingProductFields(producto: SelectorProductPayload, rule: RuleInput): string[] {
  const actual = primaryActual(producto, rule);
  if (!dataIsMissing(actual, rule)) return [];
  const current = rule.operator === 'containsRange'
    ? (rule.rangeFields ?? []).filter((field) => !isPresent(getCampo(producto, field)))
    : rule.field ? [rule.field] : [];
  if (rule.fallback) {
    return [...current, ...missingProductFields(producto, rule.fallback)];
  }
  return current;
}

function descendingNullable(left: number | null | undefined, right: number | null | undefined): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return right - left;
}

export function scoreProducts(
  products: readonly SelectorProductPayload[],
  answers: SelectorAnswers,
  config: ConfigInput,
  limit = 3,
): readonly ScoredProduct[] {
  const active = resolveActiveCriteria(config, answers);
  const uniqueProducts = [...new Map(products.map((producto) => [producto.slug, producto])).values()];

  const scored = uniqueProducts.map((producto): ScoredProduct => {
    const traces = active.map(({ questionId, criterion }) =>
      evaluateCriterion(producto, criterion, questionId, answers));
    const totalWeight = traces.reduce((sum, trace) => sum + trace.weight, 0);
    const quality = clamp((notaGlobal(producto) ?? 5) / 10);
    const fit = totalWeight > 0
      ? traces.reduce((sum, trace) => sum + trace.match * trace.weight, 0) / totalWeight
      : quality;
    let current = active.length > 0 && totalWeight > 0 ? fit * 0.85 + quality * 0.15 : quality;
    const violations: CriterionTrace[] = [];
    const missingFields = new Set<string>();

    traces.forEach((trace, index) => {
      const criterion = active[index].criterion;
      if (trace.state === 'missing') {
        missingProductFields(producto, criterion).forEach((field) => missingFields.add(field));
        return;
      }
      if (trace.match < 1 && criterion.penalty) {
        current = Math.min(current * criterion.penalty.factor, (criterion.penalty.cap ?? 100) / 100);
        violations.push(trace);
      }
    });

    return {
      producto,
      score: Math.round((clamp(current) + Number.EPSILON) * 100),
      traces,
      missingFields: [...missingFields],
      violations,
    };
  });

  scored.sort((left, right) =>
    right.score - left.score
    || descendingNullable(left.producto.calidadDatos?.score, right.producto.calidadDatos?.score)
    || descendingNullable(notaGlobal(left.producto), notaGlobal(right.producto))
    || left.producto.slug.localeCompare(right.producto.slug));

  return scored.slice(0, Math.max(0, limit));
}
