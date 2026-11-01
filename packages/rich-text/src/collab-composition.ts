/**
 * Bound composition session driver (CL-3b2, spec §4.6.1 CL-D15/R-IME-1…R-IME-5).
 *
 * Private staging for IME composition in bound mode: while a session is
 * open, composition-owned ProseMirror changes mutate only the local display
 * — no transaction is applied to the field's shared `Y.Text`, no shared item
 * is created and the shared state vector does not move (R-IME-1/R-IME-3).
 * At commit the staged result is diffed against the shared projection at the
 * start anchor and applied as exactly one Yjs transaction under the local
 * actor origin (R-IME-2). On cancel/revocation the staging is discarded
 * whole and the display re-renders from the shared `Y.Text` (R-IME-4).
 *
 * This module lives in the collaboration graph: it is created by the bound
 * entry (`editor-bound.ts`) and reaches the editor core only through the
 * type-erased `BoundImpl` seam, so the `"./editor"` graph never loads it
 * (spec §4.9, CL-3 witness 7).
 */
import * as Y from "yjs";
import {
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
  createRelativePositionFromTypeIndex,
  relativePositionToJSON,
} from "yjs";
import type { BoundUndoManager } from "./editor-collaboration.js";
import { linearBlocksOf } from "./collab-projection.js";

/** Session identifier: the binding identity plus a per-binding counter. */
export interface CompositionSessionId {
  bindingKey: string;
  compositionId: number;
}

export interface CompositionOpenInput {
  /** Binding identity key (`documentId\nsessionId\nfieldKey`) for session identity. */
  bindingKey: string;
  /** Start selection anchor as a linear index of the field sequence. */
  caretLinear: number;
  /** Start selection head as a linear index of the field sequence. */
  headLinear: number;
}

export interface CompositionCommitInput {
  /**
   * Staged paragraph texts (`paragraphId` → inline text) read from the local
   * ProseMirror display, including the composing paragraph (which carries
   * the uncommitted composition) and every other text block.
   */
  stagedParagraphs: ReadonlyMap<string, string>;
}

export interface CompositionCommitResult {
  applied: boolean;
  /**
   * True when the staged text differed but no shared transaction carries it
   * (the start anchor is gone, R-ANCH-5): the caller fails closed. False
   * when the staged display already equals the shared projection (nothing
   * to apply, quiet close).
   */
  failed: boolean;
  affectedParagraphIds: string[];
  /**
   * Post-commit caret as a linear index (resolved after the transaction, so
   * concurrent and own inserts already shifted it), or null when the caret
   * should keep the observer-restored position.
   */
  caretLinear: number | null;
}

/** Read the inline text of one paragraph segment from the shared sequence. */
function readSharedParagraphText(ytext: Y.Text, paragraphId: string): string | null {
  const delta = ytext.toDelta() as Array<{ insert?: string | Record<string, unknown> }>;
  let current: string | null = null;
  let active = false;
  for (const op of delta) {
    const insert = op.insert;
    if (typeof insert === "object" && insert !== null && "separator" in insert) {
      const payload = (insert as { separator: { paragraphId?: unknown } }).separator;
      active =
        typeof payload === "object" &&
        payload !== null &&
        (payload as { paragraphId?: unknown }).paragraphId === paragraphId;
      if (active) current = "";
      continue;
    }
    if (!active) continue;
    if (typeof insert === "string") {
      current = `${current ?? ""}${insert}`;
      continue;
    }
    if (typeof insert === "object" && insert !== null && "hardBreak" in insert) {
      current = `${current ?? ""}\n`;
    }
  }
  return current;
}

function stripSharedAffix(
  start: string,
  staged: string,
): { prefix: number; middle: string; startMiddle: string } {
  let prefix = 0;
  while (
    prefix < start.length &&
    prefix < staged.length &&
    start.charCodeAt(prefix) === staged.charCodeAt(prefix)
  ) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < start.length - prefix &&
    suffix < staged.length - prefix &&
    start.charCodeAt(start.length - 1 - suffix) === staged.charCodeAt(staged.length - 1 - suffix)
  ) {
    suffix += 1;
  }
  return {
    prefix,
    middle: staged.slice(prefix, staged.length - suffix),
    startMiddle: start.slice(prefix, start.length - suffix),
  };
}

/**
 * Bound composition session driver over one field binding. One session at a
 * time; opening a session while one is open discards the previous staging
 * whole before recording the new start (fail-closed ordering, never a merge).
 */
export class BoundCompositionDriver {
  private session: {
    id: CompositionSessionId;
    caretAnchor: string;
    headAnchor: string;
    paragraphId: string | null;
    startText: string | null;
  } | null = null;
  private nextId = 0;

  constructor(
    private readonly ytext: Y.Text,
    private readonly fieldKey: string,
    private readonly localOrigin: string,
    private readonly undoManager: BoundUndoManager,
  ) {}

  get isOpen(): boolean {
    return this.session !== null;
  }

  /** Paragraph holding the composition caret at session start, if any. */
  startParagraphId(): string | null {
    return this.session?.paragraphId ?? null;
  }

  private mintAnchor(linear: number): string {
    const assoc = linear >= this.ytext.length ? -1 : 0;
    const rpos = createRelativePositionFromTypeIndex(this.ytext, linear, assoc);
    return JSON.stringify(relativePositionToJSON(rpos));
  }

  openSession(input: CompositionOpenInput): void {
    // A replaced session never merges into the previous staging: the old
    // staging is dropped before the new start is recorded.
    this.session = null;
    this.nextId += 1;
    let paragraphId: string | null = null;
    for (const block of linearBlocksOf(this.ytext)) {
      if (input.caretLinear === block.separatorIndex) {
        paragraphId = block.paragraphId;
        break;
      }
      if (input.caretLinear >= block.contentStart && input.caretLinear <= block.contentEnd) {
        paragraphId = block.paragraphId;
      }
    }
    this.session = {
      id: { bindingKey: input.bindingKey, compositionId: this.nextId },
      caretAnchor: this.mintAnchor(input.caretLinear),
      headAnchor: this.mintAnchor(input.headLinear),
      paragraphId,
      startText: paragraphId === null ? null : readSharedParagraphText(this.ytext, paragraphId),
    };
  }

  /** Resolve a session anchor against the current shared sequence. */
  resolveAnchor(anchor: string): number | null {
    let rpos: ReturnType<typeof createRelativePositionFromJSON>;
    try {
      rpos = createRelativePositionFromJSON(JSON.parse(anchor) as never);
    } catch {
      return null;
    }
    const doc = this.ytext.doc;
    if (doc === null) return null;
    const absolute = createAbsolutePositionFromRelativePosition(rpos, doc);
    if (absolute === null || absolute === undefined) return null;
    if (absolute.type !== this.ytext) return null;
    return absolute.index;
  }

  /**
   * Commit the staged display as exactly one shared transaction under the
   * local actor origin (R-IME-2). The composing paragraph applies its net
   * local middle at the resolved start anchor (concurrent remote text in
   * the same paragraph survives); other staged paragraphs apply their
   * current shared-segment difference in the same transaction. The session
   * closes before transacting so the commit's own observers repaint the
   * composing range. Returns the affected paragraph ids for the single
   * coalesced `composition-commit` change.
   */
  commitSession(input: CompositionCommitInput): CompositionCommitResult {
    const session = this.session;
    if (session === null) return { applied: false, failed: false, affectedParagraphIds: [], caretLinear: null };
    const ydoc = this.ytext.doc;
    if (ydoc === null) {
      this.session = null;
      return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
    }
    // Resolve every anchor before closing: a gone target fails the whole
    // commit closed (R-ANCH-5) instead of half-applying.
    const caretIndex = this.resolveAnchor(session.caretAnchor);
    const headIndex = this.resolveAnchor(session.headAnchor);
    const affected: string[] = [];
    type Edit = { paragraphId: string; kind: "anchor"; at: number; end: number; text: string }
      | { paragraphId: string; kind: "segment"; at: number; end: number; text: string };
    const edits: Edit[] = [];
    if (session.paragraphId !== null && session.startText !== null) {
      const staged = input.stagedParagraphs.get(session.paragraphId);
      if (staged !== undefined && staged !== session.startText) {
        if (caretIndex === null || headIndex === null) {
          this.session = null;
          return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
        }
        const { middle } = stripSharedAffix(session.startText, staged);
        const at = Math.min(caretIndex, headIndex);
        const end = Math.max(caretIndex, headIndex);
        edits.push({ paragraphId: session.paragraphId, kind: "anchor", at, end, text: middle });
        affected.push(session.paragraphId);
      }
    }
    // Non-composing paragraphs: the staged display already carries the
    // applied remote updates, so replacing the current shared segment with
    // the staged text keeps both (no anchor tracking needed outside the
    // composing range).
    for (const [paragraphId, staged] of input.stagedParagraphs) {
      if (paragraphId === session.paragraphId) continue;
      const blocks = linearBlocksOf(this.ytext);
      const block = blocks.find((entry) => entry.paragraphId === paragraphId);
      if (block === undefined) continue;
      const current = readSharedParagraphText(this.ytext, paragraphId);
      if (current === null || current === staged) continue;
      edits.push({ paragraphId, kind: "segment", at: block.contentStart, end: block.contentEnd, text: staged });
      affected.push(paragraphId);
    }
    const caretAnchor = session.caretAnchor;
    const hasComposingEdit =
      session.paragraphId !== null && affected.includes(session.paragraphId);
    this.session = null;
    if (edits.length === 0) return { applied: false, failed: false, affectedParagraphIds: [], caretLinear: null };
    const origin = this.localOrigin;
    // Descending positions: earlier indices stay valid while later edits land.
    const ordered = [...edits].sort((left, right) => right.at - left.at);
    ydoc.transact(() => {
      for (const edit of ordered) {
        if (edit.end > edit.at) this.ytext.delete(edit.at, edit.end - edit.at);
        if (edit.text !== "") this.ytext.insert(edit.at, edit.text);
      }
    }, origin);
    // F-1: the commit is its own undo step — adjacent typing within the
    // capture window never merges into it.
    this.undoManager.stopCapturing();
    // R-IME-5: the caret is restored through the start anchor resolved after
    // the transaction, so own and concurrent inserts already shifted it.
    const caretLinear = hasComposingEdit ? this.resolveAnchor(caretAnchor) : null;
    return { applied: true, failed: false, affectedParagraphIds: affected, caretLinear };
  }

  /**
   * Discard the staging whole (R-IME-4): nothing was ever in the shared
   * sequence, so there is nothing to remove. Returns the start anchors for
   * caret restoration, or null when no session was open.
   */
  discardSession(): { anchor: string; head: string } | null {
    const session = this.session;
    this.session = null;
    if (session === null) return null;
    return { anchor: session.caretAnchor, head: session.headAnchor };
  }

  /** Field key this driver is bound to (diagnostics only). */
  get boundFieldKey(): string {
    return this.fieldKey;
  }
}

/** Create the bound composition session driver for one field binding. */
export function createBoundCompositionDriver(options: {
  ytext: Y.Text;
  fieldKey: string;
  localOrigin: string;
  undoManager: BoundUndoManager;
}): BoundCompositionDriver {
  return new BoundCompositionDriver(
    options.ytext,
    options.fieldKey,
    options.localOrigin,
    options.undoManager,
  );
}
