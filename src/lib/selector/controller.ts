export interface CalculationGuard {
  begin(): number;
  cancel(): void;
  isCurrent(generation: number): boolean;
}

export function createCalculationGuard(): CalculationGuard {
  let generation = 0;
  return {
    begin: () => ++generation,
    cancel: () => { generation += 1; },
    isCurrent: (candidate) => candidate === generation,
  };
}

export interface ResultLayoutState {
  readonly activeIndex: number;
  readonly tablistRole: 'tablist' | null;
  readonly tabs: readonly {
    readonly role: 'tab' | null;
    readonly selected: boolean | null;
    readonly tabIndex: number;
    readonly hidden: boolean;
  }[];
  readonly cards: readonly {
    readonly role: 'tabpanel' | null;
    readonly labelledBy: string | null;
    readonly hidden: boolean;
  }[];
}

export function resultLayoutState(mobile: boolean, requestedIndex: number, cardCount: number): ResultLayoutState {
  const count = Math.max(0, Math.min(3, Math.trunc(cardCount)));
  const activeIndex = count === 0 ? 0 : Math.max(0, Math.min(Math.trunc(requestedIndex), count - 1));
  return {
    activeIndex,
    tablistRole: mobile ? 'tablist' : null,
    tabs: [0, 1, 2].map((index) => ({
      role: mobile ? 'tab' : null,
      selected: mobile && index < count ? index === activeIndex : null,
      tabIndex: mobile && index === activeIndex && index < count ? 0 : -1,
      hidden: mobile && index >= count,
    })),
    cards: Array.from({ length: count }, (_, index) => ({
      role: mobile ? 'tabpanel' : null,
      labelledBy: mobile ? `selector-result-tab-${index + 1}` : null,
      hidden: mobile && index !== activeIndex,
    })),
  };
}

export function selectorProgressState(step: number, questionCount: number): {
  current: number;
  total: number;
  remaining: number;
  percent: number;
} {
  const questions = Math.max(0, Math.trunc(questionCount));
  const total = questions + 1;
  const current = step < 0 ? 0 : Math.min(total, Math.max(1, Math.trunc(step) + 2));
  return {
    current,
    total,
    remaining: total - current,
    percent: total === 0 ? 0 : current / total * 100,
  };
}

function cloneAnswer(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneAnswer);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneAnswer(entry)]));
  }
  return value;
}

export function cloneSelectorAnswers(answers: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, cloneAnswer(value)]));
}

export function selectorUrl(pathname: string, search: string, hash: string): string {
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
}

export type SelectorInvalidReason = 'unknown-type' | 'invalid-answer' | null;
export type RecoveryAction = 'back' | 'change-type' | 'correct' | 'reset';

export interface SelectorRecoveryState {
  readonly questionId: string | null;
  readonly invalidReason: SelectorInvalidReason;
}

export function initialRecoveryState(
  questionId: string | null,
  invalidReason: SelectorInvalidReason,
): SelectorRecoveryState {
  return { questionId, invalidReason };
}

export function transitionRecoveryState(
  state: SelectorRecoveryState,
  action: RecoveryAction,
): SelectorRecoveryState {
  return action === 'back' ? state : { questionId: null, invalidReason: null };
}
