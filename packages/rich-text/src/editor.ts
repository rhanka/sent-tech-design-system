// Headless editor factory: document in, document plus gesture out
// (spec §5.3, §5.4, §5.6, §7). RT-0: the intended surface is fixed as types;
// the factory is a stub (phase B).
//
// Intended semantics (asserted by the RT-0 RED tests, implemented in phase B):
// - Controlled: initialised from `options.document`, never mutating the prop.
// - One user-perceived gesture emits exactly one `RichTextChangeEvent`
//   carrying the complete resulting document plus gesture provenance, and
//   nothing else (no diff, no baseline retained, no `before`/`after` keys).
// - Read-only (`editable: false`) and form-disabled (`disabled: true`) states
//   are inert: no mutation, no `onChange`, no save-like callback, including
//   through paste and mutation shortcuts. `disabled` wins over `editable`.
// - Paste is parsed against the P0 schema only: identity attributes are
//   stripped and fresh identities allocated; scriptable markup, event
//   handlers, links and remote images never become executable or fetchable
//   content; an image `alt` kept from an otherwise accepted paste is inserted
//   as plain text while the dropped image is reported; a payload that would
//   create any non-paragraph block is refused whole (one
//   `onUnsupportedPaste`, zero `onChange`, document and selection unchanged).
// - External updates follow spec §5.6 rules 1–4 in order (echo acknowledgement
//   without replacement, composition deferral, conflict surfacing without
//   overwrite, automatic no-conflict application). No path silently overwrites
//   locally divergent work; blur never cleans it.
// - `captureDocument()` resolves immediately when ready; during composition it
//   waits for the commit and resolves once with the committed document, never
//   with a pre-composition snapshot. A capture still pending at `destroy()`
//   rejects once with the neutral capture error (spec §5.6); calls after
//   destruction return an already-rejected promise; `readiness()` after
//   destruction returns `{ composing: false, ready: false }`.

import type {
  RichTextChangeEvent,
  RichTextDocument,
  RichTextEditorHandle,
  RichTextExternalConflictEvent,
  RichTextReadiness,
  RichTextUnsupportedPasteEvent,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

/** Clipboard payload for `paste()`: `text/html` when present, else
    `text/plain`. Payloads built by `copyToPayload()` from live block
    identities carry the internal origin; every other payload is external. */
export interface PastePayload {
  text?: string;
  html?: string;
}

/** Logical selection snapshot (block identity plus intra-paragraph offset).
    Positions are never emitted as identity; this snapshot exists so tests
    and hosts can assert caret preservation across updates. */
export interface RichTextSelectionSnapshot {
  anchorParagraphId: string | null;
  anchorOffset: number;
}

export interface HeadlessEditorCallbacks {
  onChange?: (event: RichTextChangeEvent) => void;
  onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
  onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
  onReadinessChange?: (event: RichTextReadiness) => void;
}

export interface HeadlessEditorOptions extends HeadlessEditorCallbacks {
  document: RichTextDocument;
  messages: RichTextMessages;
  allocateId?: () => string;
  editable?: boolean;
  disabled?: boolean;
}

export interface HeadlessEditor extends RichTextEditorHandle {
  getDocument(): RichTextDocument;
  getSelection(): RichTextSelectionSnapshot;
  setEditable(editable: boolean): void;
  setDisabled(disabled: boolean): void;
  typeText(paragraphId: string, text: string): void;
  clearParagraph(paragraphId: string): void;
  splitParagraph(paragraphId: string, offset: number): void;
  mergeWithPrevious(paragraphId: string): void;
  deleteBlocks(paragraphIds: readonly string[]): void;
  undo(): void;
  redo(): void;
  copyToPayload(paragraphIds: readonly string[]): PastePayload;
  paste(payload: PastePayload): void;
  applyExternalUpdate(next: RichTextDocument): void;
  destroy(): void;
}

/** Create the headless editor (phase B). RT-0 RED stub: throws. */
export function createHeadlessEditor(
  _options: HeadlessEditorOptions,
): HeadlessEditor {
  throw new Error("RT-0 RED: headless editor not implemented (phase B)");
}
