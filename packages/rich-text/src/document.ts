// Pure document logic (spec §5.1 model shape, §5.6 equality and external-update
// decision, capture/readiness state).
//
// This module decides and describes; it never applies an edit. No Tiptap,
// ProseMirror, framework or DOM reference lives here: document equality,
// exact-key copying, the §5.6 rule order as a pure decision function and the
// capture/readiness state machine are all plain TypeScript over the model.

import type {
  RichTextBlock,
  RichTextDocument,
  RichTextReadiness,
} from "./model.js";
import {
  RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE,
  RICH_TEXT_CAPTURE_UNAVAILABLE_NAME,
} from "./model.js";

/** Copy one block with exactly its significant keys: `paragraph` blocks carry
    `paragraphId`/`kind`/`text` only, `preserved` blocks carry
    `paragraphId`/`kind`/`raw`/`preservedKind` only. Absent stays absent. */
function copyBlock(block: RichTextBlock): RichTextBlock {
  if (block.kind === "preserved") {
    const copy: RichTextBlock = {
      paragraphId: block.paragraphId,
      kind: "preserved",
    };
    if (block.raw !== undefined) copy.raw = block.raw;
    if (block.preservedKind !== undefined) {
      copy.preservedKind = block.preservedKind;
    }
    return copy;
  }
  const copy: RichTextBlock = {
    paragraphId: block.paragraphId,
    kind: "paragraph",
  };
  if (block.text !== undefined) copy.text = block.text;
  return copy;
}

/** Exact-key document copy: an independent value carrying only the §5.6
    significant fields, so hosts can key-inspect the emitted surface. */
export function copyRichTextDocument(
  document: RichTextDocument,
): RichTextDocument {
  return {
    format: document.format,
    blocks: document.blocks.map(copyBlock),
  };
}

function optionalTextEqual(
  left: string | undefined,
  right: string | undefined,
): boolean {
  return (left ?? undefined) === (right ?? undefined);
}

function blocksEqual(left: RichTextBlock, right: RichTextBlock): boolean {
  return (
    left.paragraphId === right.paragraphId &&
    left.kind === right.kind &&
    optionalTextEqual(left.text, right.text) &&
    optionalTextEqual(left.raw, right.raw) &&
    optionalTextEqual(left.preservedKind, right.preservedKind)
  );
}

/** Document value equality (spec §5.6): `format`, length, order, and every
    significant field with absent-equals-absent strictness. Never a diff: a
    difference in `format` alone, in `kind` alone, or in the `raw` of one
    preserved block alone is a real difference, never an echo. */
export function richTextDocumentsEqual(
  left: RichTextDocument,
  right: RichTextDocument,
): boolean {
  if (left.format !== right.format) return false;
  if (left.blocks.length !== right.blocks.length) return false;
  return left.blocks.every((block, index) => {
    const other = right.blocks[index];
    if (other === undefined) return false;
    return blocksEqual(block, other);
  });
}

/** The §5.6 external-update decision, in rule order: echo / defer / conflict
    / apply. Pure: given the displayed document, the last acknowledged
    document, the incoming document and the composing flag, it returns exactly
    one decision. The editor factory and the framework adapters apply the
    returned decision to the live instance; they never restate the order. */
export type ExternalUpdateDecision = "echo" | "defer" | "conflict" | "apply";

export interface ExternalUpdateInput {
  displayed: RichTextDocument;
  lastAcknowledged: RichTextDocument;
  incoming: RichTextDocument;
  composing: boolean;
}

export function decideExternalUpdate(
  input: ExternalUpdateInput,
): ExternalUpdateDecision {
  // Rule 1 — echo: the incoming document equals the displayed document, so
  // replacement is suppressed and only the acknowledgement is recorded.
  if (richTextDocumentsEqual(input.incoming, input.displayed)) return "echo";
  // Rule 2 — composition: deferred, neither applied nor a conflict yet.
  if (input.composing) return "defer";
  // Rule 3 — local divergence: never overwrite, surface the conflict.
  if (!richTextDocumentsEqual(input.displayed, input.lastAcknowledged)) {
    return "conflict";
  }
  // Rule 4 — no conflict: apply automatically.
  return "apply";
}

/** The neutral capture error (spec §5.6): a pending `captureDocument()`
    rejects with an `Error` carrying exactly this `name` and `message` when
    the editor is destroyed before the capture settles. */
export function createCaptureUnavailableError(): Error {
  const error = new Error(RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE);
  error.name = RICH_TEXT_CAPTURE_UNAVAILABLE_NAME;
  return error;
}

/** Pure capture/readiness state (spec §5.6): the composing flag, the
    readiness value, deferred-capture settlement and reject-on-destroy. The
    tracker holds document supplier callbacks only; no DOM or editor
    reference. The live editor wires `setComposing` to real ProseMirror
    composition state and settles pending captures with the displayed
    revision, never a mid-composition snapshot. */
export interface CaptureTracker {
  readonly composing: boolean;
  readonly destroyed: boolean;
  readonly pendingCount: number;
  readiness(): RichTextReadiness;
  setComposing(
    composing: boolean,
    current: () => RichTextDocument,
  ): void;
  capture(current: () => RichTextDocument): Promise<RichTextDocument>;
  destroy(): void;
}

export function createCaptureTracker(callbacks?: {
  onReadinessChange?: (readiness: RichTextReadiness) => void;
}): CaptureTracker {
  let composing = false;
  let destroyed = false;
  let pending: {
    resolve: (document: RichTextDocument) => void;
    reject: (error: Error) => void;
  }[] = [];

  const readiness = (): RichTextReadiness => {
    if (destroyed) return { composing: false, ready: false };
    return { composing, ready: !composing };
  };

  const emit = (): void => {
    callbacks?.onReadinessChange?.(readiness());
  };

  return {
    get composing(): boolean {
      return composing;
    },
    get destroyed(): boolean {
      return destroyed;
    },
    get pendingCount(): number {
      return pending.length;
    },
    readiness,
    setComposing(next: boolean, current: () => RichTextDocument): void {
      if (destroyed) return;
      if (next === composing) return;
      composing = next;
      if (!composing) {
        const waiting = pending;
        pending = [];
        for (const capture of waiting) {
          capture.resolve(copyRichTextDocument(current()));
        }
      }
      emit();
    },
    capture(current: () => RichTextDocument): Promise<RichTextDocument> {
      if (destroyed) return Promise.reject(createCaptureUnavailableError());
      if (composing) {
        return new Promise<RichTextDocument>((resolve, reject) => {
          pending.push({ resolve, reject });
        });
      }
      return Promise.resolve(copyRichTextDocument(current()));
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      const waiting = pending;
      pending = [];
      for (const capture of waiting) {
        capture.reject(createCaptureUnavailableError());
      }
    },
  };
}
