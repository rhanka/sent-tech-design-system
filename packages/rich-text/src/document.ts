// Pure document logic (spec §5.1 model shape, §5.6 equality and external-update
// decision, capture/readiness state).
//
// This module decides and describes; it never applies an edit. No Tiptap,
// ProseMirror, framework or DOM reference lives here: document equality,
// exact-key copying, the §5.6 rule order as a pure decision function and the
// capture/readiness state machine are all plain TypeScript over the model.

import type {
  RichTextBlock,
  RichTextCaptureResult,
  RichTextDocument,
  RichTextReadiness,
  RichTextRepresentability,
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
    document, the incoming document, the composing flag and the
    unacknowledged-local-revision flag, it returns exactly one decision. The
    editor factory and the framework adapters apply the returned decision to
    the live instance; they never restate the order. Divergence is a property
    of the local revision, not of wire equality: the flag alone forces rule 3
    even when the displayed wire still equals the acknowledged wire (§5.6
    serialisation-equal witness; `codec.ts:35–66` at `98060bd0a` for the
    wire-equality shape). The §6.6 representability flag never enters this
    decision, and capture never sets or clears the flag. */
export type ExternalUpdateDecision = "echo" | "defer" | "conflict" | "apply";

export interface ExternalUpdateInput {
  displayed: RichTextDocument;
  lastAcknowledged: RichTextDocument;
  incoming: RichTextDocument;
  composing: boolean;
  /** §5.6 unacknowledged local revision: set by any user transaction that
      modifies the live content (including a wire-identical one), cleared only
      by a rule-1 acknowledgement or a rule-4 application. */
  hasUnacknowledgedLocalRevision: boolean;
}

export function decideExternalUpdate(
  input: ExternalUpdateInput,
): ExternalUpdateDecision {
  // Rule 1 — echo: the incoming document equals the displayed document, so
  // replacement is suppressed and only the acknowledgement is recorded
  // (acknowledgement also clears the revision flag at the call site).
  if (richTextDocumentsEqual(input.incoming, input.displayed)) return "echo";
  // Rule 2 — composition: deferred, neither applied nor a conflict yet.
  if (input.composing) return "defer";
  // Rule 3 — local divergence: never overwrite, surface the conflict. Either
  // a wire difference or the revision flag alone forces the conflict.
  if (
    input.hasUnacknowledgedLocalRevision ||
    !richTextDocumentsEqual(input.displayed, input.lastAcknowledged)
  ) {
    return "conflict";
  }
  // Rule 4 — no conflict: apply automatically (flag stays clear).
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

/** Copy a capture result with exact keys: the document is an exact-key copy
    and the flag carries identities only (§5.3 no-diff rule, §6.6). */
export function copyRichTextCaptureResult(
  result: RichTextCaptureResult,
): RichTextCaptureResult {
  return {
    document: copyRichTextDocument(result.document),
    representability: {
      nonRepresentableParagraphIds: [
        ...result.representability.nonRepresentableParagraphIds,
      ],
    },
  };
}

/** Local equivalent of the pinned `assertParagraphText` single-segment
    coverage criterion, without importing Focus (spec §6.6 reporting surface).
    Faithful to `packages/focus/src/editing/codec.ts:35–66` at `98060bd0a`:
    `segmentText` (lines 35–56) splits on CRLF/CR/LF, groups consecutive
    non-blank lines (blank is `/^[ \t]*$/`) with exact offsets and no
    trimming; `assertParagraphText` (lines 58–66) passes `""` by the line-59
    exception, requires exactly one `segmentText` segment covering
    `[0, text.length]` for `text/plain` (lines 60–63), and exactly one editable
    `segmentMarkdown` segment covering `[0, text.length]` for `text/markdown`
    (lines 64–66, with `segmentMarkdown` lines 7–31 parsing with
    `@lezer/markdown` GFM and the `safe` inline set
    `Paragraph/Emphasis/StrongEmphasis/InlineCode/HardBreak/CodeMark/
    EmphasisMark/Escape/Entity`). For `text/markdown` this module evaluates
    the same covering criterion without the lezer parser: an empty wire
    passes; a wire with leading whitespace, a leading or trailing newline, a
    blank interior line (which would split blocks), or a non-paragraph block
    opening (heading, list, fence, blockquote, rule, HTML, link/image syntax
    that `safe` refuses) fails, exactly as the pinned segmentation would
    record `start !== 0`, `end !== length`, several segments, or
    `editable === false`. For P0 bridge outputs this coincides with the pinned
    verdict; the coincidence is backed by
    `tests/fixtures/representability-vectors.json` (provenance recorded there,
    measured against the pinned parser). */
export function isRepresentableWire(
  text: string,
  format: "focus.markdown.p0@1" | "text/plain",
): boolean {
  if (text === "") return true;
  if (format === "text/plain") {
    const parts = text.split(/(\r\n|\n|\r)/);
    const lines: { start: number; end: number; text: string }[] = [];
    let offset = 0;
    for (let i = 0; i < parts.length; i += 2) {
      const lineText = parts[i] ?? "";
      lines.push({ start: offset, end: offset + lineText.length, text: lineText });
      offset += lineText.length + (parts[i + 1] ?? "").length;
    }
    const segments: { start: number; end: number }[] = [];
    let open: number | null = null;
    const close = (last: number): void => {
      segments.push({ start: lines[open as number]!.start, end: lines[last]!.end });
      open = null;
    };
    lines.forEach((line, index) => {
      if (/^[ \t]*$/.test(line.text)) {
        if (open !== null) close(index - 1);
      } else if (open === null) open = index;
    });
    if (open !== null) close(lines.length - 1);
    return (
      segments.length === 1 &&
      segments[0]!.start === 0 &&
      segments[0]!.end === text.length
    );
  }
  if (/^[ \t\r\n]/.test(text)) return false;
  if (/[\r\n]$/.test(text)) return false;
  const lines = text.split(/\r\n|\n|\r/);
  for (const line of lines) {
    if (/^[ \t]*$/.test(line)) return false;
  }
  if (/^#{1,6}(?:\s|$)/.test(text)) return false;
  if (/^(?:[*+-]\s+\S|\d+[.)]\s+\S)/.test(text)) return false;
  if (/^(`{3,}|~{3,})/.test(text)) return false;
  if (/^>\s?/.test(text)) return false;
  if (/^(?:\* *\* *\*[\s*]*|-\s*-\s*-[\s-]*|_\s*_\s*_[\s_]*)$/.test(text.trim())) {
    return false;
  }
  if (/^<[A-Za-z!/][^>]*>?/.test(text)) return false;
  if (/\[.*\]\(.*\)/.test(text)) return false;
  return true;
}

/** Pure capture/readiness state (spec §5.6): the composing flag, the
    readiness value, deferred-capture settlement and reject-on-destroy. The
    tracker holds capture-result supplier callbacks only; no DOM or editor
    reference. The live editor wires `setComposing` to real ProseMirror
    composition state and settles pending captures with the displayed
    revision, never a mid-composition snapshot. Capture is a pure read
    (§6.6): settling copies the supplied result and touches nothing else. */
export interface CaptureTracker {
  readonly composing: boolean;
  readonly destroyed: boolean;
  readonly pendingCount: number;
  readiness(): RichTextReadiness;
  setComposing(
    composing: boolean,
    current: () => RichTextCaptureResult,
  ): void;
  capture(
    current: () => RichTextCaptureResult,
  ): Promise<RichTextCaptureResult>;
  destroy(): void;
}

export function createCaptureTracker(callbacks?: {
  onReadinessChange?: (readiness: RichTextReadiness) => void;
}): CaptureTracker {
  let composing = false;
  let destroyed = false;
  let pending: {
    resolve: (result: RichTextCaptureResult) => void;
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
    setComposing(
      next: boolean,
      current: () => RichTextCaptureResult,
    ): void {
      if (destroyed) return;
      if (next === composing) return;
      composing = next;
      if (!composing) {
        const waiting = pending;
        pending = [];
        for (const capture of waiting) {
          capture.resolve(copyRichTextCaptureResult(current()));
        }
      }
      emit();
    },
    capture(
      current: () => RichTextCaptureResult,
    ): Promise<RichTextCaptureResult> {
      if (destroyed) return Promise.reject(createCaptureUnavailableError());
      if (composing) {
        return new Promise<RichTextCaptureResult>((resolve, reject) => {
          pending.push({ resolve, reject });
        });
      }
      return Promise.resolve(copyRichTextCaptureResult(current()));
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
