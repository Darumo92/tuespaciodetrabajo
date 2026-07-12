export interface ClipboardWriter {
  writeText(value: string): Promise<void>;
}

interface FocusTarget {
  focus(options?: FocusOptions): void;
}

interface TextareaAdapter {
  value: string;
  style: { position: string; opacity: string };
  select(): void;
  remove(): void;
}

interface SelectionAdapter {
  readonly rangeCount: number;
  getRangeAt(index: number): unknown;
  removeAllRanges(): void;
  addRange(range: unknown): void;
}

export interface ClipboardDocumentAdapter {
  readonly activeElement: FocusTarget | null;
  readonly body: { append(element: TextareaAdapter): void };
  getSelection(): SelectionAdapter | null;
  createElement(tag: 'textarea'): TextareaAdapter;
  execCommand(command: 'copy'): boolean;
}

export async function copyText(
  value: string,
  clipboard: ClipboardWriter | undefined,
  document: ClipboardDocumentAdapter,
): Promise<void> {
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(value);
      return;
    } catch {
      // Continue with the synchronous fallback when clipboard permission is denied.
    }
  }

  const activeElement = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
    : [];
  let textarea: TextareaAdapter | null = null;

  try {
    textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    if (!document.execCommand('copy')) throw new Error('Copy command failed');
  } finally {
    try { textarea?.remove(); } catch { /* Cleanup must not hide the copy result. */ }
    try {
      if (selection) {
        selection.removeAllRanges();
        ranges.forEach((range) => selection.addRange(range));
      }
    } catch { /* Selection restoration is best effort. */ }
    try { activeElement?.focus({ preventScroll: true }); } catch { /* Focus restoration is best effort. */ }
  }
}
