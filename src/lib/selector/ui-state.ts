export type SelectorMode = 'type' | 'question' | 'calculating' | 'results' | 'error';

export interface SelectorUiState {
  readonly mode: SelectorMode;
  readonly step: number;
}

export function firstUnansweredQuestionIndex(
  questions: readonly { readonly id: string }[],
  answers: Readonly<Record<string, unknown>>,
): number {
  return questions.findIndex((question) =>
    !Object.prototype.hasOwnProperty.call(answers, question.id));
}

export function previousSelectorState(
  state: SelectorUiState,
  questionCount: number,
): SelectorUiState {
  const count = Math.max(0, Math.trunc(questionCount));
  if (state.mode === 'type' || count === 0) return { mode: 'type', step: -1 };
  if (state.mode !== 'question') return { mode: 'question', step: count - 1 };
  return state.step > 0
    ? { mode: 'question', step: Math.min(state.step - 1, count - 1) }
    : { mode: 'type', step: -1 };
}

export function targetTabIndex(
  current: number,
  key: string,
  tabCount: number,
): number | null {
  const count = Math.max(0, Math.trunc(tabCount));
  if (count === 0) return null;
  const index = Math.max(0, Math.min(Math.trunc(current), count - 1));
  if (key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowLeft') return (index - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}
