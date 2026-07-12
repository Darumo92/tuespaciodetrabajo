import { getCampo } from '../productos';
import type { Producto } from '../productos';

export type LocalizedText = Record<'es-ES' | 'en', string>;
export type AnswerValue = string | number | boolean | string[] | null;

export type AnswerExpression = {
  source: 'answer';
  value?: AnswerValue;
  answerKey?: string;
  multiply?: number;
  add?: number;
} | {
  source: 'literal';
  value: AnswerValue;
  multiply?: number;
  add?: number;
};

export type CriterionOperator =
  | 'equals'
  | 'atLeast'
  | 'atMost'
  | 'containsRange'
  | 'ranked'
  | 'boolean'
  | 'axis';

export interface SelectorPenalty {
  factor: number;
  cap?: number;
}

export interface SelectorCriterionWhen {
  answerId: string;
  in: AnswerValue[];
  answerKey?: string;
}

export interface SelectorCriterionFallback {
  field?: string;
  rangeFields?: [string, string];
  operator: CriterionOperator;
  target: AnswerValue | AnswerExpression;
  rank?: Record<string, number>;
  fallback?: SelectorCriterionFallback;
}

export interface SelectorCriterion {
  id: string;
  field?: string;
  rangeFields?: [string, string];
  fallback?: SelectorCriterionFallback;
  operator: CriterionOperator;
  target: AnswerValue | AnswerExpression;
  weight: number;
  missingScore: number;
  rank?: Record<string, number>;
  when?: SelectorCriterionWhen;
  penalty?: SelectorPenalty;
  reason: LocalizedText;
  warning: LocalizedText;
  editorialKeywords?: Record<'es-ES' | 'en', string[]>;
}

export interface SelectorOption {
  value: AnswerValue;
  label: LocalizedText;
  description?: LocalizedText;
  effects: SelectorCriterion[];
}

export interface SelectorNumericValidation {
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectorDimensionComponentValidation extends SelectorNumericValidation {
  label: LocalizedText;
  unit?: LocalizedText;
}

export interface SelectorSelectionValidation {
  minSelections?: number;
  maxSelections?: number;
}

export interface SelectorDimensionsValidation {
  components: Record<string, SelectorDimensionComponentValidation>;
}

export type SelectorQuestionValidation =
  | SelectorNumericValidation
  | SelectorSelectionValidation
  | SelectorDimensionsValidation;

export interface SelectorQuestionVisibility {
  always?: boolean;
  fields?: string[];
  fieldGroups?: string[][];
  mode: 'any' | 'all';
  minProducts: number;
  minRatio: number;
  minDistinct?: number;
}

interface SelectorQuestionBase {
  id: string;
  title: LocalizedText;
  help?: LocalizedText;
  neutralValue?: AnswerValue;
  visibility?: SelectorQuestionVisibility;
}

export type SelectorQuestion = SelectorQuestionBase & (
  | {
    kind: 'single';
    options: SelectorOption[];
    validation?: never;
    effects?: never;
  }
  | {
    kind: 'multi';
    options: SelectorOption[];
    validation?: SelectorSelectionValidation;
    effects?: never;
  }
  | {
    kind: 'number';
    inputLabel: LocalizedText;
    unit?: LocalizedText;
    options?: never;
    validation?: SelectorNumericValidation;
    effects: SelectorCriterion[];
  }
  | {
    kind: 'dimensions';
    options?: never;
    validation: SelectorDimensionsValidation;
    effects: SelectorCriterion[];
  }
);

export interface SelectorTypeConfig {
  tipo: string;
  labels: {
    singular: LocalizedText;
    plural: LocalizedText;
    icon: string;
  };
  routes: {
    catalogType: Record<'es-ES' | 'en', string>;
    editorialCategories: Record<'es-ES' | 'en', string[]>;
  };
  questions: SelectorQuestion[];
}

export interface ResolvedSelectorConfig extends SelectorTypeConfig {
  products: Producto[];
}

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
    : T;

export type ReadonlySelectorTypeConfig = DeepReadonly<SelectorTypeConfig>;
export type ReadonlySelectorQuestion = DeepReadonly<SelectorQuestion>;
export type ReadonlyResolvedSelectorConfig = DeepReadonly<ResolvedSelectorConfig>;

type SelectorTypeConfigInput = SelectorTypeConfig | ReadonlySelectorTypeConfig;
type UnknownRecord = Record<string, unknown>;
type SelectorModule = { selectorConfig?: unknown };

const QUESTION_KINDS = new Set<SelectorQuestion['kind']>(['single', 'multi', 'number', 'dimensions']);
const CRITERION_OPERATORS = new Set<CriterionOperator>([
  'equals',
  'atLeast',
  'atMost',
  'containsRange',
  'ranked',
  'boolean',
  'axis',
]);

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertKnownKeys(value: UnknownRecord, allowed: readonly string[], context: string): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) throw new Error(`${context} has unknown key "${key}"`);
  }
}

function isAnswerValue(value: unknown): value is AnswerValue {
  return value === null
    || typeof value === 'string'
    || typeof value === 'number' && Number.isFinite(value)
    || typeof value === 'boolean'
    || Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function answerEquals(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left)
      && Array.isArray(right)
      && left.length === right.length
      && left.every((value, index) => value === right[index]);
  }
  return left === right;
}

function assertLocalizedText(value: unknown, context: string): asserts value is LocalizedText {
  if (!isRecord(value)) throw new Error(`${context} must contain complete localized copy`);
  assertKnownKeys(value, ['es-ES', 'en'], context);
  for (const locale of ['es-ES', 'en'] as const) {
    if (!isNonemptyString(value[locale])) {
      throw new Error(`${context}.${locale} must be a nonempty string`);
    }
  }
}

function assertExactLocaleKeys(value: UnknownRecord, context: string): void {
  assertKnownKeys(value, ['es-ES', 'en'], context);
  if (!('es-ES' in value) || !('en' in value)) {
    throw new Error(`${context} must contain exactly es-ES and en`);
  }
}

function assertAnswerExpression(value: unknown, context: string): asserts value is AnswerExpression {
  if (!isRecord(value) || (value.source !== 'answer' && value.source !== 'literal')) {
    throw new Error(`${context} must be an answer or literal expression`);
  }
  assertKnownKeys(value, ['source', 'value', 'answerKey', 'multiply', 'add'], context);
  if (value.source === 'literal' && !('value' in value)) {
    throw new Error(`${context} literal expression requires value`);
  }
  if (value.answerKey !== undefined) {
    if (value.source !== 'answer') {
      throw new Error(`${context}.answerKey is only allowed on an answer expression`);
    }
    if (!isNonemptyString(value.answerKey)) {
      throw new Error(`${context}.answerKey must be a nonempty string`);
    }
  }
  if ('value' in value && !isAnswerValue(value.value)) {
    throw new Error(`${context}.value must be a valid answer value`);
  }
  for (const key of ['multiply', 'add'] as const) {
    if (value[key] !== undefined && (typeof value[key] !== 'number' || !Number.isFinite(value[key]))) {
      throw new Error(`${context}.${key} must be finite`);
    }
  }
}

function resolveStaticTarget(target: unknown): { isStatic: boolean; value: unknown } {
  if (!isRecord(target) || !('source' in target)) return { isStatic: true, value: target };
  if (target.source === 'answer') return { isStatic: false, value: null };

  let value = target.value;
  if (target.multiply !== undefined || target.add !== undefined) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { isStatic: true, value: Number.NaN };
    }
    value = value * (typeof target.multiply === 'number' ? target.multiply : 1)
      + (typeof target.add === 'number' ? target.add : 0);
  }
  return { isStatic: true, value };
}

function assertRule(value: UnknownRecord, context: string): void {
  if (!CRITERION_OPERATORS.has(value.operator as CriterionOperator)) {
    throw new Error(`${context} has invalid operator`);
  }
  if (!('target' in value)) throw new Error(`${context} target is required`);
  if (isRecord(value.target) && 'source' in value.target) {
    assertAnswerExpression(value.target, `${context} target`);
  } else if (!isAnswerValue(value.target)) {
    throw new Error(`${context} target must be an answer value or expression`);
  }

  if (value.operator === 'containsRange') {
    if (value.field !== undefined) {
      throw new Error(`${context} containsRange rejects field; use rangeFields only`);
    }
    if (!Array.isArray(value.rangeFields) || value.rangeFields.length !== 2) {
      throw new Error(`${context} containsRange requires two rangeFields`);
    }
    assertKnownKeys(value.rangeFields as unknown as UnknownRecord, ['0', '1'], `${context} rangeFields`);
    if (!isNonemptyString(value.rangeFields[0]) || !isNonemptyString(value.rangeFields[1])) {
      throw new Error(`${context} containsRange requires two rangeFields`);
    }
  } else {
    if (value.rangeFields !== undefined) {
      throw new Error(`${context} operator ${String(value.operator)} rejects rangeFields`);
    }
    if (!isNonemptyString(value.field)) {
      throw new Error(`${context} operator ${String(value.operator)} requires field`);
    }
  }

  if (value.operator === 'ranked') {
    if (!isRecord(value.rank) || Object.keys(value.rank).length === 0) {
      throw new Error(`${context} ranked operator requires a rank map`);
    }
    for (const score of Object.values(value.rank)) {
      if (typeof score !== 'number' || !Number.isFinite(score)) {
        throw new Error(`${context} rank map values must be finite numbers`);
      }
    }
  }

  const staticTarget = resolveStaticTarget(value.target);
  if (staticTarget.isStatic) {
    if (value.operator === 'atLeast'
      || value.operator === 'atMost'
      || value.operator === 'containsRange'
      || value.operator === 'axis') {
      if (typeof staticTarget.value !== 'number' || !Number.isFinite(staticTarget.value)) {
        throw new Error(`${context} target must resolve to a finite numeric value`);
      }
    }
    if (value.operator === 'boolean' && typeof staticTarget.value !== 'boolean') {
      throw new Error(`${context} boolean target must be boolean`);
    }
    if (value.operator === 'ranked') {
      const isScalarKey = typeof staticTarget.value === 'string'
        || typeof staticTarget.value === 'number'
        || typeof staticTarget.value === 'boolean';
      if (!isScalarKey
        || !isRecord(value.rank)
        || !Object.prototype.hasOwnProperty.call(value.rank, String(staticTarget.value))) {
        throw new Error(`${context} ranked target must be a scalar key present in rank`);
      }
    }
  }

  if (value.fallback !== undefined) {
    assertFallback(value.fallback, `${context} fallback`);
  }
}

function assertFallback(value: unknown, context: string): asserts value is SelectorCriterionFallback {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
  assertKnownKeys(value, ['field', 'rangeFields', 'operator', 'target', 'rank', 'fallback'], context);
  assertRule(value, context);
}

function assertWhen(value: unknown, context: string): asserts value is SelectorCriterionWhen {
  if (!isRecord(value)) throw new Error(`${context} must be an object`);
  assertKnownKeys(value, ['answerId', 'in', 'answerKey'], context);
  if (!isNonemptyString(value.answerId)) throw new Error(`${context}.answerId must be nonempty`);
  if (!Array.isArray(value.in) || value.in.length === 0 || !value.in.every(isAnswerValue)) {
    throw new Error(`${context}.in must be a nonempty array of answer values`);
  }
  if (value.answerKey !== undefined && !isNonemptyString(value.answerKey)) {
    throw new Error(`${context}.answerKey must be nonempty`);
  }
}

function assertLocalizedKeywords(value: unknown, context: string): void {
  if (!isRecord(value)) throw new Error(`${context} must contain localized arrays`);
  assertExactLocaleKeys(value, context);
  for (const locale of ['es-ES', 'en'] as const) {
    const keywords = value[locale];
    if (!Array.isArray(keywords) || !keywords.every(isNonemptyString)) {
      throw new Error(`${context}.${locale} must contain nonempty strings`);
    }
  }
}

function assertCriterion(
  value: unknown,
  context: string,
  criterionIds: Map<string, string>,
): asserts value is SelectorCriterion {
  if (!isRecord(value)) throw new Error(`${context} criterion must be an object`);
  const id = value.id;
  const criterionContext = isNonemptyString(id)
    ? `${context} criterion "${id}"`
    : `${context} criterion`;
  assertKnownKeys(value, [
    'id',
    'field',
    'rangeFields',
    'fallback',
    'operator',
    'target',
    'weight',
    'missingScore',
    'rank',
    'when',
    'penalty',
    'reason',
    'warning',
    'editorialKeywords',
  ], criterionContext);
  if (!isNonemptyString(id)) throw new Error(`${criterionContext} ID must be nonempty`);
  const previous = criterionIds.get(id);
  if (previous) throw new Error(`${criterionContext} has duplicate ID; first used in ${previous}`);
  criterionIds.set(id, context);

  assertRule(value, criterionContext);
  if (typeof value.weight !== 'number' || !Number.isFinite(value.weight) || value.weight < 0) {
    throw new Error(`${criterionContext} weight must be finite and at least 0`);
  }
  if (typeof value.missingScore !== 'number'
    || !Number.isFinite(value.missingScore)
    || value.missingScore < 0
    || value.missingScore > 1) {
    throw new Error(`${criterionContext} missingScore must be between 0 and 1`);
  }
  if (value.when !== undefined) assertWhen(value.when, `${criterionContext} when`);

  if (value.penalty !== undefined) {
    if (!isRecord(value.penalty)) throw new Error(`${criterionContext} penalty must be an object`);
    assertKnownKeys(value.penalty, ['factor', 'cap'], `${criterionContext} penalty`);
    const { factor, cap } = value.penalty;
    if (typeof factor !== 'number' || !Number.isFinite(factor) || factor < 0 || factor > 1) {
      throw new Error(`${criterionContext} penalty factor must be between 0 and 1`);
    }
    if (cap !== undefined && (typeof cap !== 'number' || !Number.isFinite(cap) || cap < 0 || cap > 100)) {
      throw new Error(`${criterionContext} penalty cap must be between 0 and 100`);
    }
  }

  assertLocalizedText(value.reason, `${criterionContext} reason`);
  assertLocalizedText(value.warning, `${criterionContext} warning`);
  if (value.editorialKeywords !== undefined) {
    assertLocalizedKeywords(value.editorialKeywords, `${criterionContext} editorialKeywords`);
  }
}

function assertEffects(value: unknown, context: string, criterionIds: Map<string, string>): void {
  if (!Array.isArray(value)) throw new Error(`${context} effects must be an array`);
  value.forEach((effect, index) => assertCriterion(effect, `${context} effect ${index + 1}`, criterionIds));
}

function assertVisibility(value: unknown, context: string): asserts value is SelectorQuestionVisibility {
  if (!isRecord(value)) throw new Error(`${context} visibility must be an object`);
  assertKnownKeys(
    value,
    ['always', 'fields', 'fieldGroups', 'mode', 'minProducts', 'minRatio', 'minDistinct'],
    `${context} visibility`,
  );
  if (value.always !== undefined && typeof value.always !== 'boolean') {
    throw new Error(`${context} visibility.always must be boolean`);
  }
  if (value.fields !== undefined
    && (!Array.isArray(value.fields) || !value.fields.every(isNonemptyString))) {
    throw new Error(`${context} visibility.fields must contain nonempty field names`);
  }
  if (value.fieldGroups !== undefined
    && (!Array.isArray(value.fieldGroups)
      || value.fieldGroups.length === 0
      || !value.fieldGroups.every((group) =>
        Array.isArray(group) && group.length > 0 && group.every(isNonemptyString)))) {
    throw new Error(`${context} visibility.fieldGroups must contain nonempty groups of field names`);
  }
  const hasFlatFields = Array.isArray(value.fields) && value.fields.length > 0;
  const hasFieldGroups = Array.isArray(value.fieldGroups) && value.fieldGroups.length > 0;
  if (value.always !== true && !hasFlatFields && !hasFieldGroups) {
    throw new Error(`${context} visibility requires nonempty fields or fieldGroups unless always is true`);
  }
  if (value.mode !== 'any' && value.mode !== 'all') {
    throw new Error(`${context} visibility.mode must be any or all`);
  }
  if (!Number.isInteger(value.minProducts) || (value.minProducts as number) < 0) {
    throw new Error(`${context} visibility.minProducts must be a nonnegative integer`);
  }
  if (typeof value.minRatio !== 'number'
    || !Number.isFinite(value.minRatio)
    || value.minRatio < 0
    || value.minRatio > 1) {
    throw new Error(`${context} visibility.minRatio must be between 0 and 1`);
  }
  if (value.minDistinct !== undefined
    && (!Number.isInteger(value.minDistinct) || (value.minDistinct as number) < 1)) {
    throw new Error(`${context} visibility.minDistinct must be a positive integer`);
  }
}

function assertValidation(
  value: unknown,
  context: string,
  kind: SelectorQuestion['kind'],
  optionCount?: number,
): asserts value is SelectorQuestionValidation {
  if (kind === 'dimensions'
    && (!isRecord(value)
      || !isRecord(value.components)
      || Object.keys(value.components).length === 0)) {
    throw new Error(`${context} validation.components must be a nonempty object`);
  }
  if (!isRecord(value)) throw new Error(`${context} validation must be an object`);
  const validationContext = `${context} validation`;
  assertKnownKeys(value, ['min', 'max', 'step', 'minSelections', 'maxSelections', 'components'], validationContext);
  if (Object.keys(value).length === 0) throw new Error(`${validationContext} must be nonempty`);
  if (kind === 'single') throw new Error(`${validationContext} is not supported for single questions`);

  if (value.components !== undefined) {
    if (kind !== 'dimensions') {
      throw new Error(`${validationContext}.components is only allowed for dimensions questions`);
    }
    if (Object.keys(value).length !== 1) {
      const otherKeys = Object.keys(value).filter((key) => key !== 'components').join(', ');
      throw new Error(`${validationContext}.components cannot be combined with ${otherKeys}`);
    }
    if (!isRecord(value.components) || Object.keys(value.components).length === 0) {
      throw new Error(`${validationContext}.components must be a nonempty object`);
    }
    for (const [key, bounds] of Object.entries(value.components)) {
      if (!isNonemptyString(key)) {
        throw new Error(`${validationContext}.components keys must be nonempty`);
      }
      const componentContext = `${validationContext}.components.${key}`;
      if (!isRecord(bounds)) throw new Error(`${componentContext} must be an object`);
      assertKnownKeys(bounds, ['min', 'max', 'step', 'label', 'unit'], componentContext);
      assertLocalizedText(bounds.label, `${componentContext}.label`);
      if (bounds.unit !== undefined) assertLocalizedText(bounds.unit, `${componentContext}.unit`);
      for (const bound of ['min', 'max', 'step'] as const) {
        if (bounds[bound] !== undefined
          && (typeof bounds[bound] !== 'number' || !Number.isFinite(bounds[bound]))) {
          throw new Error(`${componentContext}.${bound} must be finite`);
        }
      }
      if (typeof bounds.step === 'number' && bounds.step <= 0) {
        throw new Error(`${componentContext}.step must be greater than 0`);
      }
      if (typeof bounds.min === 'number' && typeof bounds.max === 'number' && bounds.min > bounds.max) {
        throw new Error(`${componentContext}.min cannot exceed max`);
      }
    }
    return;
  }

  const allowedForKind = kind === 'multi'
    ? ['minSelections', 'maxSelections']
    : ['min', 'max', 'step'];
  for (const key of Object.keys(value)) {
    if (!allowedForKind.includes(key)) {
      throw new Error(`${validationContext}.${key} is not allowed for ${kind} questions`);
    }
  }
  for (const key of ['min', 'max', 'step', 'minSelections', 'maxSelections'] as const) {
    const bound = value[key];
    if (bound !== undefined && (typeof bound !== 'number' || !Number.isFinite(bound))) {
      throw new Error(`${context} validation.${key} must be finite`);
    }
  }
  if (typeof value.step === 'number' && value.step <= 0) {
    throw new Error(`${context} validation.step must be greater than 0`);
  }
  for (const key of ['minSelections', 'maxSelections'] as const) {
    const bound = value[key];
    if (bound !== undefined && (!Number.isInteger(bound) || (bound as number) < 0)) {
      throw new Error(`${context} validation.${key} must be a nonnegative integer`);
    }
  }
  if (typeof value.min === 'number' && typeof value.max === 'number' && value.min > value.max) {
    throw new Error(`${context} validation.min cannot exceed max`);
  }
  if (typeof value.minSelections === 'number'
    && typeof value.maxSelections === 'number'
    && value.minSelections > value.maxSelections) {
    throw new Error(`${context} validation.minSelections cannot exceed maxSelections`);
  }
  if (kind === 'multi' && optionCount !== undefined) {
    if (typeof value.minSelections === 'number' && value.minSelections > optionCount) {
      throw new Error(`${context} validation.minSelections cannot exceed available options`);
    }
    if (typeof value.maxSelections === 'number' && value.maxSelections > optionCount) {
      throw new Error(`${context} validation.maxSelections cannot exceed available options`);
    }
  }
}

function assertDimensionAnswerKeys(
  rule: SelectorCriterion | SelectorCriterionFallback,
  context: string,
  componentKeys: ReadonlySet<string>,
): void {
  if (isRecord(rule.target) && rule.target.source === 'answer') {
    if (!isNonemptyString(rule.target.answerKey)) {
      throw new Error(`${context} answer target requires answerKey`);
    }
    if (!componentKeys.has(rule.target.answerKey)) {
      throw new Error(
        `${context} answerKey "${rule.target.answerKey}" must exist in validation.components`,
      );
    }
  }
  if (rule.fallback) {
    assertDimensionAnswerKeys(rule.fallback, `${context} fallback`, componentKeys);
  }
}

function assertCriterionWhenReference(
  criterion: SelectorCriterion,
  context: string,
  questionsById: ReadonlyMap<string, SelectorQuestion>,
): void {
  if (!criterion.when) return;
  const referenced = questionsById.get(criterion.when.answerId);
  if (!referenced) {
    throw new Error(
      `${context} when answerId "${criterion.when.answerId}" does not reference a question`,
    );
  }
  if (criterion.when.answerKey !== undefined) {
    if (referenced.kind !== 'dimensions') {
      throw new Error(`${context} when answerKey is only allowed for dimensions questions`);
    }
    const components = referenced.validation && 'components' in referenced.validation
      ? referenced.validation.components
      : undefined;
    if (!components || !(criterion.when.answerKey in components)) {
      throw new Error(
        `${context} when answerKey "${criterion.when.answerKey}" must exist in validation.components`,
      );
    }
  }
  if (referenced.kind === 'single' || referenced.kind === 'multi') {
    for (const expected of criterion.when.in) {
      if (!referenced.options.some((option) => answerEquals(option.value, expected))) {
        throw new Error(
          `${context} when value ${JSON.stringify(expected)} is not a declared option`,
        );
      }
    }
  }
}

function assertWhenReferences(config: SelectorTypeConfig, typeContext: string): void {
  const questionsById = new Map(config.questions.map((question) => [question.id, question]));
  for (const question of config.questions) {
    if (question.kind === 'single' || question.kind === 'multi') {
      for (const option of question.options) {
        for (const criterion of option.effects) {
          assertCriterionWhenReference(
            criterion,
            `${typeContext} question "${question.id}" criterion "${criterion.id}"`,
            questionsById,
          );
        }
      }
    } else {
      for (const criterion of question.effects) {
        assertCriterionWhenReference(
          criterion,
          `${typeContext} question "${question.id}" criterion "${criterion.id}"`,
          questionsById,
        );
      }
    }
  }
}

export function validateSelectorConfig(
  config: unknown,
  sourceName = 'selector config',
): ReadonlySelectorTypeConfig {
  if (!isRecord(config)) throw new Error(`${sourceName}: selector config must be an object`);
  if (!isNonemptyString(config.tipo)) throw new Error(`${sourceName}: selector type must be nonempty`);
  const typeContext = `${sourceName} type "${config.tipo}"`;
  assertKnownKeys(config, ['tipo', 'labels', 'routes', 'questions'], typeContext);

  if (!isRecord(config.labels)) throw new Error(`${typeContext} labels must be an object`);
  assertKnownKeys(config.labels, ['singular', 'plural', 'icon'], `${typeContext} labels`);
  assertLocalizedText(config.labels.singular, `${typeContext} labels.singular`);
  assertLocalizedText(config.labels.plural, `${typeContext} labels.plural`);
  if (!isNonemptyString(config.labels.icon)) {
    throw new Error(`${typeContext} labels.icon must be a nonempty string`);
  }

  if (!isRecord(config.routes)) throw new Error(`${typeContext} routes must be an object`);
  assertKnownKeys(config.routes, ['catalogType', 'editorialCategories'], `${typeContext} routes`);
  if (!isRecord(config.routes.catalogType)) {
    throw new Error(`${typeContext} routes.catalogType must be localized`);
  }
  assertExactLocaleKeys(config.routes.catalogType, `${typeContext} routes.catalogType`);
  if (!isRecord(config.routes.editorialCategories)) {
    throw new Error(`${typeContext} routes.editorialCategories must be localized`);
  }
  assertExactLocaleKeys(config.routes.editorialCategories, `${typeContext} routes.editorialCategories`);
  for (const locale of ['es-ES', 'en'] as const) {
    if (!isNonemptyString(config.routes.catalogType[locale])) {
      throw new Error(`${typeContext} routes.catalogType.${locale} must be nonempty`);
    }
    const categories = config.routes.editorialCategories[locale];
    if (!Array.isArray(categories) || categories.length === 0 || !categories.every(isNonemptyString)) {
      throw new Error(`${typeContext} routes.editorialCategories.${locale} must contain nonempty strings`);
    }
  }

  if (!Array.isArray(config.questions) || config.questions.length === 0) {
    throw new Error(`${typeContext} questions must be a nonempty array`);
  }
  const questionIds = new Set<string>();
  const criterionIds = new Map<string, string>();

  config.questions.forEach((question, index) => {
    const fallbackContext = `${typeContext} question ${index + 1}`;
    if (!isRecord(question)) throw new Error(`${fallbackContext} must be an object`);
    const questionContext = isNonemptyString(question.id)
      ? `${typeContext} question "${question.id}"`
      : fallbackContext;
    assertKnownKeys(question, [
      'id',
      'kind',
      'title',
      'help',
      'options',
      'validation',
      'neutralValue',
      'visibility',
      'effects',
      'inputLabel',
      'unit',
    ], questionContext);
    if (!isNonemptyString(question.id)) throw new Error(`${questionContext} ID must be nonempty`);
    if (questionIds.has(question.id)) throw new Error(`${questionContext} has duplicate ID`);
    questionIds.add(question.id);

    if (!QUESTION_KINDS.has(question.kind as SelectorQuestion['kind'])) {
      throw new Error(`${questionContext} has invalid kind`);
    }
    assertLocalizedText(question.title, `${questionContext} title`);
    if (question.help !== undefined) assertLocalizedText(question.help, `${questionContext} help`);
    if (Object.prototype.hasOwnProperty.call(question, 'neutralValue')) {
      if ((question.kind === 'number' || question.kind === 'dimensions') && question.neutralValue !== null) {
        throw new Error(`${questionContext} neutralValue must be null for ${question.kind} questions`);
      }
      if (!isAnswerValue(question.neutralValue)) {
        throw new Error(`${questionContext} neutralValue must be a valid answer value`);
      }
    }
    if (question.visibility !== undefined) assertVisibility(question.visibility, questionContext);
    if (question.kind === 'number') {
      assertLocalizedText(question.inputLabel, `${questionContext} inputLabel`);
      if (question.unit !== undefined) assertLocalizedText(question.unit, `${questionContext} unit`);
    } else if (question.inputLabel !== undefined || question.unit !== undefined) {
      throw new Error(`${questionContext} inputLabel and unit are only allowed for number questions`);
    }

    if (question.kind === 'single' || question.kind === 'multi') {
      if (question.effects !== undefined) {
        throw new Error(`${questionContext} kind ${question.kind} cannot use question-level effects`);
      }
      if (!Array.isArray(question.options) || question.options.length === 0) {
        throw new Error(`${questionContext} kind ${question.kind} requires nonempty options`);
      }
      if (question.validation !== undefined) {
        assertValidation(question.validation, questionContext, question.kind, question.options.length);
      }
      const optionValues: AnswerValue[] = [];
      question.options.forEach((option, optionIndex) => {
        const optionContext = `${questionContext} option ${optionIndex + 1}`;
        if (!isRecord(option)) throw new Error(`${optionContext} must be an object`);
        assertKnownKeys(option, ['value', 'label', 'description', 'effects'], optionContext);
        if (!('value' in option) || !isAnswerValue(option.value)) {
          throw new Error(`${optionContext} value must be a valid answer value`);
        }
        if (optionValues.some((value) => answerEquals(value, option.value))) {
          throw new Error(`${optionContext} has duplicate option value`);
        }
        optionValues.push(option.value);
        assertLocalizedText(option.label, `${optionContext} label`);
        if (option.description !== undefined) {
          assertLocalizedText(option.description, `${optionContext} description`);
        }
        assertEffects(option.effects, optionContext, criterionIds);
      });
    } else {
      if (question.options !== undefined) {
        throw new Error(`${questionContext} kind ${String(question.kind)} cannot use options`);
      }
      if (!Array.isArray(question.effects) || question.effects.length === 0) {
        throw new Error(`${questionContext} kind ${String(question.kind)} requires nonempty effects`);
      }
      if (question.kind === 'dimensions') {
        assertValidation(question.validation, questionContext, question.kind);
      } else if (question.validation !== undefined) {
        assertValidation(question.validation, questionContext, question.kind as SelectorQuestion['kind']);
      }
      assertEffects(question.effects, questionContext, criterionIds);
      if (question.kind === 'dimensions') {
        const componentKeys = new Set(Object.keys(
          (question.validation as SelectorDimensionsValidation).components,
        ));
        for (const effect of question.effects as SelectorCriterion[]) {
          assertDimensionAnswerKeys(effect, `${questionContext} criterion "${effect.id}"`, componentKeys);
        }
      }
    }
  });

  assertWhenReferences(config as unknown as SelectorTypeConfig, typeContext);

  return cloneAndFreeze(config as unknown as SelectorTypeConfig);
}

function cloneAndFreeze<T>(value: T): DeepReadonly<T> {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneAndFreeze(item))) as DeepReadonly<T>;
  }
  if (isRecord(value)) {
    const clone = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneAndFreeze(item)]),
    );
    return Object.freeze(clone) as DeepReadonly<T>;
  }
  return value as DeepReadonly<T>;
}

export function discoverSelectorConfigs(
  modules: Readonly<Record<string, unknown>>,
): readonly ReadonlySelectorTypeConfig[] {
  const discovered: { source: string; config: ReadonlySelectorTypeConfig }[] = [];
  const sourceByType = new Map<string, string>();

  for (const [source, rawModule] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    if (!isRecord(rawModule) || !('selectorConfig' in rawModule)) {
      throw new Error(`${source}: expected a named selectorConfig export`);
    }
    const candidate = (rawModule as SelectorModule).selectorConfig;
    const validated = validateSelectorConfig(candidate, source);
    const previousSource = sourceByType.get(validated.tipo);
    if (previousSource) {
      throw new Error(`Duplicate selector type "${validated.tipo}" in ${previousSource} and ${source}`);
    }
    sourceByType.set(validated.tipo, source);
    discovered.push({ source, config: validated });
  }

  const snapshots = discovered
    .map(({ config }) => config)
    .sort((a, b) => a.tipo.localeCompare(b.tipo));
  return Object.freeze(snapshots);
}

const selectorModules = import.meta.glob('./config-*.ts', { eager: true });

export const SELECTOR_CONFIGS: readonly ReadonlySelectorTypeConfig[] = discoverSelectorConfigs(selectorModules);

export function getSelectorConfig(tipo: string): ReadonlySelectorTypeConfig | undefined {
  return SELECTOR_CONFIGS.find((config) => config.tipo === tipo);
}

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function countFieldCoverage(products: readonly Producto[], field: string): number {
  return products.reduce((count, product) => count + (isPresent(getCampo(product, field)) ? 1 : 0), 0);
}

function distinctKey(value: unknown): string {
  if (value !== null && typeof value === 'object') return `object:${JSON.stringify(value)}`;
  return `${typeof value}:${String(value)}`;
}

export function hasUsefulVariation(
  products: readonly Producto[],
  fields: readonly string[],
  minDistinct: number,
): boolean {
  return fields.some((field) => {
    const values = new Set<string>();
    for (const product of products) {
      const value = getCampo(product, field);
      if (isPresent(value)) values.add(distinctKey(value));
      if (values.size >= minDistinct) return true;
    }
    return false;
  });
}

export function resolveVisibleQuestions(
  config: SelectorTypeConfigInput,
  products: readonly Producto[],
): readonly ReadonlySelectorQuestion[] {
  const visible = config.questions.filter((question) => {
    const visibility = question.visibility;
    if (!visibility || visibility.always) return true;

    const fieldPasses = (field: string): boolean => {
      const coverage = countFieldCoverage(products, field);
      const ratio = products.length === 0 ? 0 : coverage / products.length;
      const hasVariation = visibility.minDistinct === undefined
        || hasUsefulVariation(products, [field], visibility.minDistinct);
      return coverage >= visibility.minProducts
        && ratio >= visibility.minRatio
        && hasVariation;
    };
    const flatResults = (visibility.fields ?? []).map(fieldPasses);
    const groupResults = (visibility.fieldGroups ?? []).map((group) => {
      const completeProducts = products.filter((product) =>
        group.every((field) => isPresent(getCampo(product, field))));
      const ratio = products.length === 0 ? 0 : completeProducts.length / products.length;
      const hasVariation = visibility.minDistinct === undefined
        || group.every((field) => hasUsefulVariation(completeProducts, [field], visibility.minDistinct!));
      return completeProducts.length >= visibility.minProducts
        && ratio >= visibility.minRatio
        && hasVariation;
    });
    const passesFieldRequirements = [...flatResults, ...groupResults];
    return visibility.mode === 'all'
      ? passesFieldRequirements.every(Boolean)
      : passesFieldRequirements.some(Boolean);
  });
  return cloneAndFreeze(visible) as readonly ReadonlySelectorQuestion[];
}

export function resolveEligibleSelectorConfigs(
  configs: readonly SelectorTypeConfigInput[],
  products: readonly Producto[],
  minProducts = 5,
): readonly ReadonlyResolvedSelectorConfig[] {
  const productsByType = new Map<string, Producto[]>();
  for (const product of products) {
    const group = productsByType.get(product.tipo) ?? [];
    group.push(product);
    productsByType.set(product.tipo, group);
  }

  const resolved = configs
    .map((config) => ({ config, products: productsByType.get(config.tipo) ?? [] }))
    .filter(({ products }) => products.length >= minProducts)
    .map(({ config, products }) => ({
      ...config,
      questions: resolveVisibleQuestions(config, products),
      products,
    }))
    .filter((config) => config.questions.length > 0)
    .sort((a, b) => a.tipo.localeCompare(b.tipo));
  return cloneAndFreeze(resolved) as readonly ReadonlyResolvedSelectorConfig[];
}

export function resolveEligibleSelectorConfig(
  configs: readonly SelectorTypeConfigInput[],
  products: readonly Producto[],
  matches: (config: ReadonlyResolvedSelectorConfig) => boolean,
  minProducts = 5,
): ReadonlyResolvedSelectorConfig | undefined {
  return resolveEligibleSelectorConfigs(configs, products, minProducts).find(matches);
}
