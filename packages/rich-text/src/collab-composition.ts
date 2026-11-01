/**
 * Bound composition session driver (CL-3b2, spec §4.6.1 CL-D15/R-IME-1…R-IME-5).
 *
 * Private staging for IME composition in bound mode: while a session is
 * open, composition-owned ProseMirror changes mutate only the local display
 * — no transaction is applied to the field's shared `Y.Text`, no shared item
 * is created and the shared document's state vector does not move (R-IME-1/R-IME-3).
 * At commit the staged result is diffed against the shared projection at the
 * start anchor and applied as exactly one Yjs transaction under the local
 * actor origin (R-IME-2). On cancel/revocation the staging is discarded
 * whole and the display re-renders from the shared `Y.Text` (R-IME-4).
 *
 * CL-3b2 review 1 (run-aware commit): the commit carries staged runs, not a
 * plain string. Hard breaks become `{ hardBreak: true }` embeds (never a raw
 * U+000A in a string, R-LIN-1/R-LIN-7) and text runs keep their staged mark
 * attributes; paragraphs other than the composing one are never rewritten.
 * The deleted slice is the affix diff, not the selection range, and only
 * surviving baseline characters are removed — a concurrent insert landing
 * inside the replaced range survives the commit (R-IME-2, §13 F6).
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

/**
 * One staged run of a paragraph display: a text run with its shared mark
 * attributes, or a hard break (stored as a `{ hardBreak: true }` embed,
 * never as U+000A inside a string, R-LIN-1).
 */
export type StagedCompositionRun =
  | { type: "text"; text: string; attributes: Record<string, unknown> }
  | { type: "hardBreak" };

export interface CompositionCommitInput {
  /**
   * Staged runs per paragraph (`paragraphId` → inline runs) read from the
   * local ProseMirror display, including the composing paragraph (which
   * carries the uncommitted composition). Text parents only: atom blocks
   * carry no staged runs and never enter a commit diff.
   */
  stagedRuns: ReadonlyMap<string, readonly StagedCompositionRun[]>;
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
   * Post-commit caret as a linear index (the insertion point plus the
   * inserted units, so composing at field end lands after the committed
   * text), or null when the caret should keep the observer-restored
   * position.
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
): { prefix: number; suffix: number; middle: string; startMiddle: string } {
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
    suffix,
    middle: staged.slice(prefix, staged.length - suffix),
    startMiddle: start.slice(prefix, start.length - suffix),
  };
}

/** Linear text of staged runs (`\n` per hard break, for affix comparison). */
function runsToLinearText(runs: readonly StagedCompositionRun[]): string {
  let out = "";
  for (const run of runs) {
    if (run.type === "hardBreak") out += "\n";
    else out += run.text;
  }
  return out;
}

/**
 * Slice staged runs to the linear interval `[from, to)` (hard breaks count
 * one unit, mirroring the shared linear coordinates). Text runs split at
 * the boundaries keep their mark attributes.
 */
function sliceRuns(
  runs: readonly StagedCompositionRun[],
  from: number,
  to: number,
): StagedCompositionRun[] {
  const out: StagedCompositionRun[] = [];
  let cursor = 0;
  for (const run of runs) {
    if (run.type === "hardBreak") {
      if (cursor >= from && cursor < to) out.push({ type: "hardBreak" });
      cursor += 1;
      continue;
    }
    const start = cursor;
    const end = cursor + run.text.length;
    const overlapStart = Math.max(start, from);
    const overlapEnd = Math.min(end, to);
    if (overlapEnd > overlapStart) {
      out.push({
        type: "text",
        text: run.text.slice(overlapStart - start, overlapEnd - start),
        attributes: { ...run.attributes },
      });
    }
    cursor = end;
  }
  return out;
}

/**
 * Defensive expansion of middle runs before a shared write: a `\r` or `\n`
 * inside a text run (never produced by ProseMirror nodes, which split them)
 * becomes a hard-break embed, so no raw U+000A is ever transacted (R-LIN-1).
 */
function expandRunsForCommit(runs: readonly StagedCompositionRun[]): StagedCompositionRun[] {
  const out: StagedCompositionRun[] = [];
  for (const run of runs) {
    if (run.type === "hardBreak") {
      out.push(run);
      continue;
    }
    const parts = run.text.split(/[\r\n]/);
    for (let index = 0; index < parts.length; index += 1) {
      if (index > 0) out.push({ type: "hardBreak" });
      const piece = parts[index] as string;
      if (piece !== "") out.push({ type: "text", text: piece, attributes: { ...run.attributes } });
    }
  }
  return out;
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
    /**
     * Relative anchors for every shared offset of the composing paragraph
     * at open (`contentStart + i` for `i` in `0..startText.length`): the
     * commit deletes exactly the surviving baseline characters, so a
     * concurrent insert landing inside the replaced range is never removed
     * (§13 F6, R-IME-2).
     */
    charAnchors: string[];
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

  private mintAnchorAt(linear: number, assoc: number): string {
    const rpos = createRelativePositionFromTypeIndex(this.ytext, linear, assoc);
    return JSON.stringify(relativePositionToJSON(rpos));
  }

  private mintAnchor(linear: number): string {
    const assoc = linear >= this.ytext.length ? -1 : 0;
    return this.mintAnchorAt(linear, assoc);
  }

  openSession(input: CompositionOpenInput): void {
    // A replaced session never merges into the previous staging: the old
    // staging is dropped before the new start is recorded.
    this.session = null;
    this.nextId += 1;
    let paragraphId: string | null = null;
    let contentStart = 0;
    let startText: string | null = null;
    for (const block of linearBlocksOf(this.ytext)) {
      if (input.caretLinear === block.separatorIndex) {
        paragraphId = block.paragraphId;
        contentStart = block.contentStart;
        break;
      }
      if (input.caretLinear >= block.contentStart && input.caretLinear <= block.contentEnd) {
        paragraphId = block.paragraphId;
        contentStart = block.contentStart;
      }
    }
    if (paragraphId !== null) {
      startText = readSharedParagraphText(this.ytext, paragraphId);
    }
    // Per-character relative anchors over the composing paragraph: the
    // commit deletes the affix slice of the baseline text (not the live
    // selection range), so a shared prefix/suffix kept by the IME is never
    // lost through a selection-range delete, and only surviving baseline
    // characters are removed.
    let charAnchors: string[] = [];
    if (paragraphId !== null && startText !== null) {
      for (let offset = 0; offset <= startText.length; offset += 1) {
        charAnchors.push(this.mintAnchorAt(contentStart + offset, 0));
      }
    }
    this.session = {
      id: { bindingKey: input.bindingKey, compositionId: this.nextId },
      caretAnchor: this.mintAnchor(input.caretLinear),
      headAnchor: this.mintAnchor(input.headLinear),
      paragraphId,
      startText,
      charAnchors,
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
   * local runs at the resolved start anchor: only surviving baseline
   * characters of the affix slice are removed, so concurrent remote text in
   * the same paragraph — including inserts inside a replaced selection —
   * survives. Text runs carry their staged mark attributes and hard breaks
   * transact as embeds, never as raw U+000A. Nothing outside the composing
   * paragraph is written: remote updates there are already in the shared
   * `Y.Text`. The session closes before transacting so the commit's own
   * observers repaint the composing range. Returns the affected paragraph
   * id for the single coalesced `composition-commit` change.
   */
  commitSession(input: CompositionCommitInput): CompositionCommitResult {
    const session = this.session;
    if (session === null) return { applied: false, failed: false, affectedParagraphIds: [], caretLinear: null };
    const ydoc = this.ytext.doc;
    if (ydoc === null) {
      this.session = null;
      return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
    }
    if (session.paragraphId === null || session.startText === null) {
      this.session = null;
      return { applied: false, failed: false, affectedParagraphIds: [], caretLinear: null };
    }
    const staged = input.stagedRuns.get(session.paragraphId);
    const stagedText = staged === undefined ? session.startText : runsToLinearText(staged);
    if (staged === undefined || stagedText === session.startText) {
      // The staged display already equals the shared projection: quiet
      // close, no transaction, no event.
      this.session = null;
      return { applied: false, failed: false, affectedParagraphIds: [], caretLinear: null };
    }
    // Resolve every anchor before closing: a gone target fails the whole
    // commit closed (R-ANCH-5) instead of half-applying.
    const startText = session.startText;
    const { prefix, suffix } = stripSharedAffix(startText, stagedText);
    const delFrom = prefix;
    const delTo = startText.length - suffix;
    const blocks = linearBlocksOf(this.ytext);
    const block = blocks.find((entry) => entry.paragraphId === session.paragraphId);
    if (block === undefined) {
      this.session = null;
      return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
    }
    const at = this.resolveAnchor(session.charAnchors[delFrom] as string);
    const sliceEnd = this.resolveAnchor(session.charAnchors[delTo] as string);
    if (at === null || sliceEnd === null) {
      this.session = null;
      return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
    }
    const currentText = readSharedParagraphText(this.ytext, session.paragraphId) ?? "";
    const deletes: number[] = [];
    for (let offset = delFrom; offset < delTo; offset += 1) {
      const anchorIndex = this.resolveAnchor(session.charAnchors[offset] as string);
      const nextIndex = this.resolveAnchor(session.charAnchors[offset + 1] as string);
      if (anchorIndex === null || nextIndex === null) {
        this.session = null;
        return { applied: false, failed: true, affectedParagraphIds: [], caretLinear: null };
      }
      if (nextIndex <= anchorIndex) continue;
      // The baseline character is already gone remotely: nothing to remove.
      const local = anchorIndex - block.contentStart;
      if (local < 0 || local >= currentText.length) continue;
      // A concurrent insert or replacement at this position is kept (§13
      // F6): only a surviving baseline character is removed.
      if (currentText[local] !== startText[offset]) continue;
      deletes.push(anchorIndex);
    }
    const middleRuns = expandRunsForCommit(
      sliceRuns(staged, prefix, stagedText.length - suffix),
    );
    let insertedUnits = 0;
    for (const run of middleRuns) {
      insertedUnits += run.type === "hardBreak" ? 1 : run.text.length;
    }
    this.session = null;
    const origin = this.localOrigin;
    // Descending positions: earlier indices stay valid while later edits land.
    const orderedDeletes = [...deletes].sort((left, right) => right - left);
    ydoc.transact(() => {
      for (const index of orderedDeletes) this.ytext.delete(index, 1);
      let cursor = at;
      for (const run of middleRuns) {
        if (run.type === "hardBreak") {
          this.ytext.insertEmbed(cursor, { hardBreak: true });
          cursor += 1;
          continue;
        }
        if (run.text !== "") {
          this.ytext.insert(cursor, run.text, { ...run.attributes });
          cursor += run.text.length;
        }
      }
    }, origin);
    // F-1: the commit is its own undo step — adjacent typing within the
    // capture window never merges into it.
    this.undoManager.stopCapturing();
    // R-IME-5: the post-commit caret is the insertion point plus the
    // inserted units, so composing at the end of a field lands after the
    // committed text (resolving the start anchor would land before it).
    return {
      applied: true,
      failed: false,
      affectedParagraphIds: [session.paragraphId],
      caretLinear: at + insertedUnits,
    };
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
