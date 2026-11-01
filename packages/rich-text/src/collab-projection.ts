// DS-owned projection between the linear Y.Text and the ProseMirror
// document (spec §4.3.1, replacing the sync plugin).
//
// - `yTextToPmDoc`: deterministic shared-type → ProseMirror scan. Full
//   wrapper reconstruction reuses the qualified `fullDocumentToProseMirror`
//   accumulation over the captured document (one scan with wrapper
//   accumulation, never a P0 scan plus inferred conversions). P0 builds
//   paragraph/preserved nodes directly from the captured runs (no Markdown
//   manager needed: marks are already attributes on the runs).
// - `projectPmTransactionToYText`: ProseMirror steps translate sequentially
//   against the evolving map (translating every step against the
//   pre-transaction map is non-conforming, CL-3 witness 15). Whole-document
//   replacement is never used: unchanged text keeps its Yjs items so
//   concurrent items and anchors survive. Split tails and inserted blocks
//   adopt the identity the editor's PM plugin already minted (review 2
//   B-NEW-2: one split id, never a second allocation), and every shared-state
//   write is journaled so a refused or diverging transaction inverts to the
//   last agreed state inside the same Yjs transaction (review 2 B-NEW-6:
//   no half-applied state survives on either side).
// - `applyRemoteUpdateIncrementally`: a remote Yjs transaction (text plus
//   metadata together, one application) rebuilds the affected block range —
//   expanded to the enclosing top-level wrapper whenever an affected block
//   sits inside a list or quote — and dispatches one binding-origin
//   transaction (no echo), restoring the local selection, mapped through
//   the transaction delta from the pre-update layout, on that same dispatch.

import * as Y from "yjs";
import { AddMarkStep, RemoveMarkStep, ReplaceStep, Transform } from "@tiptap/pm/transform";
import type { Node as ProseMirrorNode, Schema } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { isAllowedHref } from "./collaboration.js";
import type { FullBlockMetadata, RichTextInlineMarks } from "./collaboration.js";
import type { RichTextDocument, RichTextFormat } from "./model.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  isHorizontalRuleValue,
  isHardBreakValue,
  isPreservedValue,
  isSeparatorValue,
} from "./collab-codec.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
  isPlainMetadata,
} from "./editor-full-markdown.js";
import { fullDocumentToProseMirror, fullProseMirrorToDocument } from "./editor-full-document.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import type { SelectionMap, SelectionMapBlock } from "./collab-selection.js";
import {
  cursorJsonToSelection,
  linearToPmPosition,
  pmPositionToLinear,
  selectionToCursorJson,
} from "./collab-selection.js";

/** Binding inputs for projection (one field only, spec R-MAP-2). */
export interface ProjectionBinding {
  ytext: Y.Text;
  fieldMeta: Y.Map<unknown>;
  fieldKey: string;
  allocateId: () => string;
  format: RichTextFormat;
  /** The editor's live document for this transaction after the identity
      plugin's repairs (review 2 B-NEW-2). Supplied by the bound editor path;
      a standalone projection (raw transaction without the editor) omits it
      and keeps the allocator fallback for every fresh identity. */
  pmTransactionDoc?: ProseMirrorNode;
  /** Local actor origin (CL-3b1 §4.5): every shared-state write of a
      non-mark-only ProseMirror transaction happens in one `ydoc.transact`
      under this origin, so the field `UndoManager` (scoped to it) tracks
      exactly the local actor's content and structural steps. */
  localOrigin: string;
  /** Mark origin (CL-3b1 §4.5 boundary): a mark-only transaction transacts
      under this origin, which no field `UndoManager` tracks, so formatting
      never enters the undo stacks (mark undo is the §5.6 provenance log,
      CL-4). Must differ from `localOrigin`. */
  markOrigin: string;
}

/** Transaction flag marking binding-origin dispatches (echo suppression). */
export const BINDING_ORIGIN_META = "richTextBindingOrigin";

function throwingAllocator(): string {
  throw new Error("rich-text.collab-no-alloc: projection mints no identities (splits allocate through the binding)");
}

function pmMarkToAttributes(markType: string, attrs: Record<string, unknown>): Record<string, unknown> {
  if (markType === "link") {
    const href = attrs["href"];
    if (typeof href !== "string" || !isAllowedHref(href)) {
      throw new Error("rich-text.forbidden-href: structured full import carries a link the R-FULL-URL-1 validator refuses");
    }
    const out: Record<string, unknown> = { link: href };
    if (typeof attrs["title"] === "string") out["linkTitle"] = attrs["title"];
    return out;
  }
  const admitted = new Set(["bold", "italic", "code", "strike", "underline"]);
  if (!admitted.has(markType)) {
    throw new Error(`rich-text.collab-invalid-mark: mark "${markType}" is outside the admitted table`);
  }
  return { [markType]: true };
}

function yAttributesToPmMarks(
  schema: Schema,
  attributes: Record<string, unknown>,
  codeHidden: boolean,
): Array<{ type: string; attrs?: Record<string, unknown> }> {
  void codeHidden;
  const marks: Array<{ type: string; attrs?: Record<string, unknown> }> = [];
  const push = (type: string, attrs?: Record<string, unknown>): void => {
    if (schema.marks[type] === undefined) return;
    marks.push(attrs !== undefined ? { type, attrs } : { type });
  };
  const admitted = new Set(["bold", "italic", "code", "strike", "underline", "link", "linkTitle"]);
  for (const [key, value] of Object.entries(attributes)) {
    if (!admitted.has(key)) {
      throw new Error(`rich-text.collab-invalid-mark: mark "${key}" is outside the admitted table`);
    }
    if (key === "link") {
      if (typeof value !== "string" || !isAllowedHref(value)) {
        throw new Error("rich-text.collab-invalid-mark: unsafe href refuses the whole update");
      }
      continue;
    }
    if (key === "linkTitle") {
      if (typeof value !== "string") {
        throw new Error('rich-text.collab-invalid-mark: linkTitle is a plain string');
      }
      continue;
    }
    if (value !== true) {
      throw new Error(`rich-text.collab-invalid-mark: mark "${key}" carries no other value shape`);
    }
  }
  if (attributes["bold"] === true) push("bold");
  if (attributes["italic"] === true) push("italic");
  if (attributes["code"] === true) push("code");
  if (attributes["strike"] === true) push("strike");
  if (attributes["underline"] === true) push("underline");
  if (typeof attributes["link"] === "string") {
    const attrs: Record<string, unknown> = { href: attributes["link"] };
    if (typeof attributes["linkTitle"] === "string") attrs["title"] = attributes["linkTitle"];
    push("link", attrs);
  }
  return marks;
}

/**
 * Deterministic `Y.Text` → ProseMirror document (spec §4.3.1 item 1).
 * Unknown marks fail closed (no node rendered for the segment, shared
 * content never deleted — the pinned sync plugin's delete-on-error at
 * `sync-plugin.js:837-843` is not reproduced: this function throws and the
 * caller keeps the previous document). Inherited attributes on separator /
 * hard-break / HR embeds produce no mark (R-LIN-4).
 */
export function yTextToPmDoc(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  format: RichTextFormat,
  schema: Schema,
): ProseMirrorNode {
  const captured = captureDocumentFromField(ytext, fieldMeta, format);
  if (format === "ds.markdown.full@1") {
    const json = fullDocumentToProseMirror(captured.document, throwingAllocator);
    return schema.nodeFromJSON(json);
  }
  const content: Array<Record<string, unknown>> = [];
  for (const block of captured.document.blocks) {
    if (block.kind === "preserved") {
      content.push({
        type: "preservedBlock",
        attrs: {
          [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
          raw: block.raw ?? "",
          preservedKind: block.preservedKind ?? "",
        },
      });
      continue;
    }
    const inline: Array<Record<string, unknown>> = [];
    // P0 text field: "\n" positions are hard breaks; runs carry P0 marks.
    const text = block.text ?? "";
    const parts = text.split("\n");
    for (let index = 0; index < parts.length; index += 1) {
      if (index > 0) inline.push({ type: "hardBreak" });
      const piece = parts[index] as string;
      if (piece === "") continue;
      inline.push({ type: "text", text: piece });
    }
    void inline;
    // Marks ride the shared attributes, not the Markdown delimiters: rebuild
    // inline nodes from the delta runs so inherited embed attributes stay
    // ignored and text marks stay exact.
    const exactInline = inlineFromDeltaRuns(ytext, block.paragraphId, schema);
    content.push({
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId },
      content: exactInline,
    });
  }
  return schema.nodeFromJSON({ type: "doc", content });
}

/** Inline content of one P0 paragraph rebuilt from its delta runs. */
function inlineFromDeltaRuns(
  ytext: Y.Text,
  paragraphId: string,
  schema: Schema,
): Array<Record<string, unknown>> {
  const delta = ytext.toDelta() as Array<{
    insert?: string | Record<string, unknown>;
    attributes?: Record<string, unknown>;
  }>;
  let inside = false;
  const inline: Array<Record<string, unknown>> = [];
  for (const op of delta) {
    if (typeof op.insert === "object" && op.insert !== null && isSeparatorValue(op.insert)) {
      if ((op.insert.separator as { paragraphId: string }).paragraphId === paragraphId) {
        inside = true;
        continue;
      }
      if (inside) break;
      continue;
    }
    if (!inside) continue;
    if (typeof op.insert === "object" && op.insert !== null) {
      if (isHardBreakValue(op.insert)) {
        inline.push({ type: "hardBreak" });
        continue;
      }
      // Preserved/HR embeds never appear inside a P0 paragraph segment.
      continue;
    }
    if (typeof op.insert === "string") {
      const marks = yAttributesToPmMarks(schema, op.attributes ?? {}, false);
      const node: Record<string, unknown> = { type: "text", text: op.insert };
      if (marks.length > 0) node["marks"] = marks;
      inline.push(node);
    }
  }
  return inline;
}

// ── Selection map construction ──

interface WalkBlock {
  paragraphId: string;
  kind: string;
  pmInlineStart: number;
  pmInlineEnd: number;
}

/** Blocks of a ProseMirror document in order with inline ranges. */
function walkPmBlocks(pmDoc: ProseMirrorNode): WalkBlock[] {
  const blocks: WalkBlock[] = [];
  pmDoc.descendants((node, pos) => {
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id !== "string" || id === "") return true;
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock"
    ) {
      // Inline range inside the textblock: code LF counts one per "\n".
      blocks.push({
        paragraphId: id,
        kind: node.type.name,
        pmInlineStart: pos + 1,
        pmInlineEnd: pos + 1 + inlineLengthOf(node),
      });
      return false;
    }
    if (node.type.name === "horizontalRule" || node.type.name === "preservedBlock") {
      blocks.push({ paragraphId: id, kind: node.type.name, pmInlineStart: pos, pmInlineEnd: pos });
      return false;
    }
    return true;
  });
  return blocks;
}

function inlineLengthOf(node: ProseMirrorNode): number {
  let length = 0;
  node.forEach((child) => {
    if (child.isText) {
      const text = child.text ?? "";
      length += text.length;
    } else if (child.type.name === "hardBreak") {
      length += 1;
    }
  });
  return length;
}

interface LinearBlock {
  paragraphId: string;
  separatorIndex: number;
  contentStart: number;
  contentEnd: number;
}

/** Blocks of the linear field in order with content ranges. */
function walkLinearBlocks(ytext: Y.Text): LinearBlock[] {
  const delta = ytext.toDelta() as Array<{ insert?: string | Record<string, unknown> }>;
  const blocks: LinearBlock[] = [];
  let linear = 0;
  let current: { paragraphId: string; separatorIndex: number } | null = null;
  const close = (end: number): void => {
    if (current !== null) {
      blocks.push({
        paragraphId: current.paragraphId,
        separatorIndex: current.separatorIndex,
        contentStart: current.separatorIndex + 1,
        contentEnd: end,
      });
      current = null;
    }
  };
  for (const op of delta) {
    if (typeof op.insert === "object" && op.insert !== null && isSeparatorValue(op.insert)) {
      close(linear);
      current = {
        paragraphId: (op.insert.separator as { paragraphId: string }).paragraphId,
        separatorIndex: linear,
      };
      linear += 1;
      continue;
    }
    if (typeof op.insert === "string") linear += (op.insert as string).length;
    else linear += 1;
  }
  close(linear);
  return blocks;
}

/** Build the bidirectional map between a PM document and its linear field. */
export function buildSelectionMap(pmDoc: ProseMirrorNode, ytext: Y.Text): SelectionMap {
  return buildSelectionMapFromBlocks(pmDoc, walkLinearBlocks(ytext), ytext.length);
}

/** Build the map from an explicit linear layout (pre- or post-update). */
export function buildSelectionMapFromBlocks(
  pmDoc: ProseMirrorNode,
  linearBlocks: LinearBlock[],
  linearLength: number,
): SelectionMap {
  const pmBlocks = walkPmBlocks(pmDoc);
  const byId = new Map(linearBlocks.map((block) => [block.paragraphId, block]));
  const blocks: SelectionMapBlock[] = [];
  for (const pm of pmBlocks) {
    const linear = byId.get(pm.paragraphId);
    if (linear === undefined) continue;
    blocks.push({
      paragraphId: pm.paragraphId,
      separatorIndex: linear.separatorIndex,
      contentStart: linear.contentStart,
      contentEnd: linear.contentEnd,
      pmInlineStart: pm.pmInlineStart,
      pmInlineEnd: pm.pmInlineEnd,
    });
  }
  return { blocks, linearLength, pmSize: pmDoc.content.size };
}

// ── ProseMirror → shared-type (stepwise) ──

function pmTextMarksToYAttributes(
  marks: readonly { type: { name: string }; attrs: Record<string, unknown> }[],
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  for (const mark of marks) {
    Object.assign(attributes, pmMarkToAttributes(mark.type.name, mark.attrs));
  }
  return attributes;
}

function insertInlineNode(
  run: ProjectionRun,
  cursor: { index: number },
  node: ProseMirrorNode,
  codeMode: boolean,
): void {
  if (node.isText) {
    const text = node.text ?? "";
    const attributes = pmTextMarksToYAttributes(node.marks as never);
    if (codeMode) {
      const parts = text.split("\n");
      for (let index = 0; index < parts.length; index += 1) {
        if (index > 0) {
          runInsertEmbed(run, cursor.index, { hardBreak: true });
          cursor.index += 1;
        }
        const piece = parts[index] as string;
        if (piece !== "") {
          runInsert(run, cursor.index, piece, attributes);
          cursor.index += piece.length;
        }
      }
      return;
    }
    if (text !== "") {
      runInsert(run, cursor.index, text, attributes);
      cursor.index += text.length;
    }
    return;
  }
  if (node.type.name === "hardBreak") {
    runInsertEmbed(run, cursor.index, { hardBreak: true });
    cursor.index += 1;
  }
}

// ── Journaled projection run (review 2 B-NEW-2, B-NEW-6, B-NEW-7) ──

/** One captured delta slice (pre-image of a delete or format). */
interface DeltaOpRecord {
  insert?: string | Record<string, unknown>;
  attributes?: Record<string, unknown>;
}

/** One journaled shared-state write, invertible in reverse order. */
type JournalEntry =
  | { op: "insert"; index: number; text: string; attributes?: Record<string, unknown> }
  | { op: "insertEmbed"; index: number }
  | { op: "delete"; index: number; length: number; captured: DeltaOpRecord[] }
  | { op: "format"; index: number; length: number; captured: DeltaOpRecord[] }
  | { op: "metaSet"; key: string; existed: boolean; before?: unknown }
  | { op: "metaDelete"; key: string; before: unknown };

/** An identity the editor's PM plugin minted for this transaction. */
interface FreshIdEntry {
  id: string;
  kind: string;
}

/** One projected insertion recorded for post-projection verification
    (review 2 B-NEW-7: inserted blocks are compared on segments and marks,
    not only counted). */
interface InsertRecord {
  paragraphId: string;
  kind: "paragraph" | "heading" | "codeBlock" | "horizontalRule";
  segments?: Array<{ type: "text" | "hardBreak"; text?: string; marks?: Record<string, unknown> }>;
  metadata?: FullBlockMetadata;
  text?: string;
}

/** Per-projection state: journaled writes, the minted-identity queue and
    the inserted-block records. */
interface ProjectionRun {
  ytext: Y.Text;
  fieldMeta: Y.Map<unknown>;
  format: RichTextFormat;
  allocateId: () => string;
  journal: JournalEntry[];
  freshQueue: FreshIdEntry[];
  inserted: InsertRecord[];
  /** Blocks this projection converted out of a codeBlock: the local view
      must rebuild them from the shared state so formats hidden while the
      block was code are revealed (R-FULL-CODE-1). */
  revealedIds: string[];
}

function runInsert(
  run: ProjectionRun,
  index: number,
  text: string,
  attributes?: Record<string, unknown>,
): void {
  run.journal.push({ op: "insert", index, text, attributes });
  if (attributes !== undefined && Object.keys(attributes).length > 0) {
    run.ytext.insert(index, text, attributes);
  } else {
    // Explicit empty attributes: a bare Yjs insert inherits the left
    // neighbour's marks, so a plain insertion right after a marked run
    // would diverge from the ProseMirror document.
    run.ytext.insert(index, text, {});
  }
}

function runInsertEmbed(run: ProjectionRun, index: number, value: Record<string, unknown>): void {
  run.journal.push({ op: "insertEmbed", index });
  run.ytext.insertEmbed(index, value);
}

/** Capture the current content of a linear range (pre-image of a delete or
    format), so a refused transaction can restore it exactly. */
function captureRange(run: ProjectionRun, index: number, length: number): DeltaOpRecord[] {
  if (length <= 0) return [];
  const delta = run.ytext.toDelta() as DeltaOpRecord[];
  const captured: DeltaOpRecord[] = [];
  let position = 0;
  for (const op of delta) {
    const opLength = typeof op.insert === "string" ? op.insert.length : op.insert === undefined ? 0 : 1;
    const opEnd = position + opLength;
    if (opLength > 0 && opEnd > index && position < index + length) {
      if (typeof op.insert === "string") {
        const sliceStart = Math.max(position, index) - position;
        const sliceEnd = Math.min(opEnd, index + length) - position;
        captured.push({
          insert: op.insert.slice(sliceStart, sliceEnd),
          ...(op.attributes !== undefined ? { attributes: op.attributes } : {}),
        });
      } else if (position >= index && opEnd <= index + length) {
        // Embeds are single units: capture only when fully inside the range.
        captured.push({ ...(op as DeltaOpRecord) });
      }
    }
    position = opEnd;
  }
  return captured;
}

function runDelete(run: ProjectionRun, index: number, length: number): void {
  const captured = captureRange(run, index, length);
  run.journal.push({ op: "delete", index, length, captured });
  run.ytext.delete(index, length);
}

function runFormat(
  run: ProjectionRun,
  index: number,
  length: number,
  attributes: Record<string, unknown>,
): void {
  const captured = captureRange(run, index, length);
  run.journal.push({ op: "format", index, length, captured });
  run.ytext.format(index, length, attributes);
}

function runMetaSet(run: ProjectionRun, key: string, value: unknown): void {
  const before = run.fieldMeta.get(key);
  run.journal.push({ op: "metaSet", key, existed: before !== undefined, before: structuredClone(before) });
  run.fieldMeta.set(key, structuredClone(value));
}

/** Delete a metadata record inside the journaled run (review 1 B-1: an HR
    whose derived wrapper metadata falls back to the canonical defaults
    carries no record — absent materializes the defaults on capture). */
function runMetaDelete(run: ProjectionRun, key: string): void {
  const before = run.fieldMeta.get(key);
  run.journal.push({ op: "metaDelete", key, before: structuredClone(before) });
  run.fieldMeta.delete(key);
}

/** Replay a captured delta slice at a linear index (inversion only: raw
    writes, never journaled). */
function insertDeltaAt(run: ProjectionRun, index: number, captured: DeltaOpRecord[]): void {
  let position = index;
  for (const op of captured) {
    if (typeof op.insert === "string") {
      if (op.attributes !== undefined && Object.keys(op.attributes).length > 0) {
        run.ytext.insert(position, op.insert, op.attributes);
      } else {
        // Explicit empty attributes: the captured plain run must restore
        // without inheriting the left neighbour's marks.
        run.ytext.insert(position, op.insert, {});
      }
      position += op.insert.length;
    } else if (op.insert !== undefined) {
      run.ytext.insertEmbed(position, op.insert);
      position += 1;
    }
  }
}

/** Invert the whole journal in reverse order, restoring the exact
    pre-projection shared state (review 2 B-NEW-6). Raw writes: the
    inversion itself is never journaled and runs inside the same Yjs
    transaction, so the net state change is zero for observers. */
function invertJournal(run: ProjectionRun): void {
  for (let index = run.journal.length - 1; index >= 0; index -= 1) {
    const entry = run.journal[index] as JournalEntry;
    if (entry.op === "insert") {
      run.ytext.delete(entry.index, entry.text.length);
    } else if (entry.op === "insertEmbed") {
      run.ytext.delete(entry.index, 1);
    } else if (entry.op === "delete") {
      insertDeltaAt(run, entry.index, entry.captured);
    } else if (entry.op === "format") {
      run.ytext.delete(entry.index, entry.length);
      insertDeltaAt(run, entry.index, entry.captured);
    } else if (entry.op === "metaSet") {
      if (entry.existed) {
        run.fieldMeta.set(entry.key, entry.before);
      } else {
        run.fieldMeta.delete(entry.key);
      }
    } else {
      run.fieldMeta.set(entry.key, entry.before);
    }
  }
}

/** Minted identities of one transaction, in document order (review 2
    B-NEW-2): the identity plugin assigns the split tail and every inserted
    block a distinct id before the projection runs, so the projection adopts
    those ids instead of allocating a second, divergent one. */
function freshIdQueue(pmDocBefore: ProseMirrorNode, pmTransactionDoc: ProseMirrorNode): FreshIdEntry[] {
  const beforeIds = new Set<string>();
  pmDocBefore.descendants((node) => {
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id === "string" && id !== "") beforeIds.add(id);
    return true;
  });
  const queue: FreshIdEntry[] = [];
  pmTransactionDoc.descendants((node) => {
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id !== "string" || id === "" || beforeIds.has(id)) return true;
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock" ||
      node.type.name === "horizontalRule" ||
      node.type.name === "preservedBlock"
    ) {
      queue.push({ id, kind: node.type.name });
    }
    return true;
  });
  return queue;
}

/** Adopt the next minted identity for a block of `kind`, or null when the
    queue holds none (standalone projections fall back to the allocator). */
function popFreshId(run: ProjectionRun, kind: string): string | null {
  const next = run.freshQueue[0];
  if (next === undefined || next.kind !== kind) return null;
  run.freshQueue.shift();
  return next.id;
}

/** Allocate a fallback identity (no minted counterpart available). */
function runAllocate(run: ProjectionRun): string {
  return run.allocateId();
}

/** Segments of an inserted slice node, mirroring the capture reader's
    normalization (adjacent same-mark runs merged; code text joined then
    split once per line with no displayed marks, R-FULL-CODE-1). */
function recordSegmentsOf(
  node: ProseMirrorNode,
  codeMode: boolean,
): Array<{ type: "text" | "hardBreak"; text?: string; marks?: Record<string, unknown> }> {
  const segments: Array<{ type: "text" | "hardBreak"; text?: string; marks?: Record<string, unknown> }> = [];
  const codeParts: string[] = [];
  node.forEach((child) => {
    if (child.type.name === "hardBreak") {
      segments.push({ type: "hardBreak" });
      return;
    }
    if (!child.isText) return;
    if (codeMode) {
      codeParts.push(child.textContent);
      return;
    }
    const marks = pmTextMarksToYAttributes(child.marks as never);
    const last = segments[segments.length - 1];
    if (last !== undefined && last.type === "text" && JSON.stringify(last.marks ?? {}) === JSON.stringify(marks)) {
      last.text = (last.text ?? "") + (child.text ?? "");
    } else {
      segments.push({ type: "text", text: child.text ?? "", marks });
    }
  });
  if (codeMode && codeParts.length > 0) {
    const lines = codeParts.join("").split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      if (lineIndex > 0) segments.push({ type: "hardBreak" });
      const line = lines[lineIndex] as string;
      if (line !== "") segments.push({ type: "text", text: line, marks: {} });
    }
  }
  return segments;
}

/** Plain text of an inserted slice node ("\n" per hard break), for P0
    records. */
function recordTextOf(node: ProseMirrorNode): string {
  const parts: string[] = [];
  node.forEach((child) => {
    if (child.isText) parts.push(child.text ?? "");
    else if (child.type.name === "hardBreak") parts.push("\n");
  });
  return parts.join("");
}

interface SliceInsertContext {
  listKind: "none" | "bullet" | "ordered";
  listDepth: number;
  blockquoteDepth: number;
  containerOrder: Array<"quote" | "list">;
  /** True when the insertion point sits inside a codeBlock (R-FULL-CODE-1):
      bare text then splits on LF into hard-break embeds, mirroring the
      capture reader. Block nodes in the slice keep their own per-node mode. */
  codeMode: boolean;
}

/** Insert one slice textblock. The identity comes from the minted queue
    (review 2 B-NEW-2) when the editor supplies the fixed transaction
    document; standalone projections fall back to the allocator. Incoming
    ids are never trusted directly: only the plugin-minted counterpart of
    this very transaction is adopted. */
function insertSliceTextblock(
  run: ProjectionRun,
  cursor: { index: number },
  node: ProseMirrorNode,
  context: SliceInsertContext,
  firstInSlice: boolean,
  openStart: number,
): void {
  const blockKind: "paragraph" | "heading" | "codeBlock" =
    node.type.name === "heading"
      ? "heading"
      : node.type.name === "codeBlock"
        ? "codeBlock"
        : "paragraph";
  const freshId = popFreshId(run, blockKind) ?? runAllocate(run);
  if (run.format === "ds.markdown.full@1") {
    const metadata: FullBlockMetadata = {
      ...(canonicalPlainMetadata() as FullBlockMetadata),
      blockKind,
      listKind: context.listKind,
      listDepth: context.listDepth,
      blockquoteDepth: context.blockquoteDepth,
      containerOrder: [...context.containerOrder],
    } as FullBlockMetadata;
    if (blockKind === "heading") {
      (metadata as { headingLevel?: number }).headingLevel =
        typeof node.attrs["level"] === "number" ? node.attrs["level"] : 1;
    }
    if (blockKind === "codeBlock") {
      (metadata as { codeLanguage?: string | null }).codeLanguage =
        typeof node.attrs["language"] === "string" ? node.attrs["language"] : null;
    }
    void firstInSlice;
    void openStart;
    runInsertEmbed(run, cursor.index, { separator: { paragraphId: freshId, kind: "paragraph" } });
    cursor.index += 1;
    runMetaSet(run, freshId, metadata);
    const codeMode = blockKind === "codeBlock";
    node.forEach((child) => {
      insertInlineNode(run, cursor, child, codeMode);
    });
    run.inserted.push({
      paragraphId: freshId,
      kind: blockKind,
      segments: recordSegmentsOf(node, codeMode),
      metadata: structuredClone(metadata) as FullBlockMetadata,
    });
    return;
  }
  runInsertEmbed(run, cursor.index, { separator: { paragraphId: freshId, kind: "paragraph" } });
  cursor.index += 1;
  node.forEach((child) => {
    insertInlineNode(run, cursor, child, false);
  });
  run.inserted.push({ paragraphId: freshId, kind: "paragraph", text: recordTextOf(node) });
}

/**
 * Insert the separator of a paragraph split (spec §4.2, R-FULL-META-2): the
 * head keeps its id, the tail carries the identity the PM plugin minted
 * (review 2 B-NEW-2: exactly one id per split, allocated by the plugin when
 * it repaired the raw duplicate, by the allocator only for standalone
 * projections). Under full the tail copies the creator's observed
 * block-local metadata with no run-level values: an item split
 * (`openStart >= 2`, the slice opens the list item) opens a new item and
 * takes the tail id as `listItemId` (R-FULL-META-1); a continuation split
 * inside one item keeps the item's opening paragraph id (R-FULL-META-1).
 */
function insertSplitSeparator(
  run: ProjectionRun,
  map: SelectionMap,
  linearIndex: number,
  tailId: string,
  itemSplit: boolean,
): void {
  runInsertEmbed(run, linearIndex, { separator: { paragraphId: tailId, kind: "paragraph" } });
  if (run.format !== "ds.markdown.full@1") return;
  const head = linearToBlock(map, linearIndex);
  if (head === null) return;
  const observed = run.fieldMeta.get(head) as FullBlockMetadata | undefined;
  if (observed === undefined) return;
  const observedItemId = (observed as { listItemId?: unknown }).listItemId;
  const tail: FullBlockMetadata = {
    ...(structuredClone(observed) as FullBlockMetadata),
  };
  if (itemSplit) {
    (tail as { listItemId?: unknown }).listItemId = tailId;
  } else if (typeof observedItemId === "string" && observedItemId !== "") {
    (tail as { listItemId?: unknown }).listItemId = observedItemId;
  } else {
    delete (tail as { listItemId?: unknown }).listItemId;
  }
  delete (tail as { orderedStart?: unknown }).orderedStart;
  delete (tail as { orderedType?: unknown }).orderedType;
  delete (tail as { listTight?: unknown }).listTight;
  runMetaSet(run, tailId, tail);
}

/** Repair the working document when the sole block was deleted with an
    empty slice (review 1 B-4): the ProseMirror result is childless while
    the shared state carries the supplied fresh empty paragraph, so append
    that paragraph under its supplied identity for verification. The
    projection never invents content — the paragraph is empty. */
function repairEmptyDocWithParagraph(pmDoc: ProseMirrorNode, freshId: string): ProseMirrorNode {
  if (pmDoc.childCount > 0) return pmDoc;
  const paragraphType = pmDoc.type.schema.nodes["paragraph"];
  if (paragraphType === undefined) return pmDoc;
  const paragraph = paragraphType.create({ [PARAGRAPH_ID_ATTRIBUTE]: freshId });
  return pmDoc.type.create(null, [paragraph]);
}

/** True when a slice carries block-level nodes (a block insert, not a text
    continuation): pasted wrappers count through their descendants. */
function sliceInsertsBlocks(slice: { content: ProseMirrorNode["content"] }): boolean {
  let found = false;
  slice.content.descendants((node) => {
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock" ||
      node.type.name === "horizontalRule"
    ) {
      found = true;
      return false;
    }
    return true;
  });
  return found;
}

/** Block id containing a linear index (split head lookup). */
function linearToBlock(map: SelectionMap, index: number): string | null {
  for (const block of map.blocks) {
    if (index === block.separatorIndex) return block.paragraphId;
    if (index >= block.contentStart && index <= block.contentEnd) return block.paragraphId;
  }
  return map.blocks.length > 0 ? (map.blocks[map.blocks.length - 1] as SelectionMapBlock).paragraphId : null;
}

/** Insert slice content at a linear index (minted identities for new
    blocks, recorded for verification). */
function insertSliceContent(
  run: ProjectionRun,
  linearIndex: number,
  slice: { content: ProseMirrorNode["content"]; openStart: number; openEnd: number },
  context: SliceInsertContext,
): number {
  const cursor = { index: linearIndex };
  let first = true;
  const walk = (fragment: ProseMirrorNode["content"], ctx: SliceInsertContext): void => {
    fragment.forEach((node) => {
      // Bare inline content (typing steps carry a raw text node, not a
      // paragraph): insert it into the current block as-is, splitting on
      // LF when the insertion point is inside a codeBlock (R-FULL-CODE-1:
      // Enter inside code is a hard break, never a raw U+000A insert).
      if (node.isText) {
        insertInlineNode(run, cursor, node, ctx.codeMode);
        first = false;
        return;
      }
      if (node.type.name === "hardBreak") {
        runInsertEmbed(run, cursor.index, { hardBreak: true });
        cursor.index += 1;
        first = false;
        return;
      }
      if (node.type.name === "paragraph" || node.type.name === "heading" || node.type.name === "codeBlock") {
        // A slice open at the start continues the current block with its
        // first textblock's inline content (no new separator).
        if (first && slice.openStart > 0) {
          const codeMode = node.type.name === "codeBlock";
          node.forEach((child) => {
            insertInlineNode(run, cursor, child, codeMode);
          });
        } else {
          insertSliceTextblock(run, cursor, node, ctx, first, slice.openStart);
        }
        first = false;
        return;
      }
      if (node.type.name === "horizontalRule") {
        const freshId = popFreshId(run, "horizontalRule") ?? runAllocate(run);
        runInsertEmbed(run, cursor.index, { separator: { paragraphId: freshId, kind: "horizontalRule" } });
        cursor.index += 1;
        runInsertEmbed(run, cursor.index, { horizontalRule: { paragraphId: freshId } });
        cursor.index += 1;
        run.inserted.push({ paragraphId: freshId, kind: "horizontalRule" });
        // Wrapper metadata at insert time (review 1 B-1, R-FULL-HR-1): the
        // surrounding sync pass reconciles the complete derived record
        // (including list item/run ids) from the post-step document right
        // after, so a partial context write here never survives alone.
        if (run.format === "ds.markdown.full@1") {
          const wrapped =
            context.listKind !== "none" ||
            context.listDepth !== 0 ||
            context.blockquoteDepth !== 0 ||
            context.containerOrder.length > 0;
          if (wrapped) {
            runMetaSet(run, freshId, {
              listKind: context.listKind,
              listDepth: context.listDepth,
              blockquoteDepth: context.blockquoteDepth,
              containerOrder: [...context.containerOrder],
            });
          }
        }
        first = false;
        return;
      }
      if (node.type.name === "preservedBlock") {
        throw new Error("rich-text.collab-preserved-denied: the binding refuses any step touching preserved content");
      }
      if (node.type.name === "bulletList" || node.type.name === "orderedList") {
        const nested: SliceInsertContext = {
          listKind: node.type.name === "bulletList" ? "bullet" : "ordered",
          listDepth: ctx.listDepth + (ctx.listKind === "none" ? 0 : 1),
          blockquoteDepth: ctx.blockquoteDepth,
          containerOrder: ctx.containerOrder.includes("list")
            ? [...ctx.containerOrder]
            : [...ctx.containerOrder, "list"],
          codeMode: ctx.codeMode,
        };
        walk(node.content, nested);
        return;
      }
      if (node.type.name === "blockquote") {
        const nested: SliceInsertContext = {
          ...ctx,
          blockquoteDepth: ctx.blockquoteDepth + 1,
          containerOrder: ctx.containerOrder.includes("quote")
            ? [...ctx.containerOrder]
            : ["quote", ...ctx.containerOrder],
        };
        walk(node.content, nested);
        return;
      }
      if (node.type.name === "listItem") {
        walk(node.content, ctx);
        return;
      }
    });
  };
  walk(slice.content, context);
  return cursor.index - linearIndex;
}

/**
 * Exact HR-pair start (R-FULL-HR-1, CL-3b1 §4.10): separators are invisible
 * to ProseMirror ranges, so a PM-side deletion of an HR node covers the atom
 * alone (`[S+1, S+2)`); a block-level cut may also cover the whole pair
 * (`[S, S+2)`). Either exact coverage resolves to the pair start `S`, so the
 * separator+atom pair is removed atomically. Anything else — including a
 * range merely crossing the pair — returns null and refuses whole
 * (`collab-structural-conflict`).
 */
function exactHrPairStart(ytext: Y.Text, from: number, to: number): number | null {
  const span = to - from;
  if (span !== 1 && span !== 2) return null;
  const pairStart = span === 2 ? from : from - 1;
  const ops = ytext.toDelta() as Array<{ insert?: unknown }>;
  let linear = 0;
  for (let index = 0; index < ops.length; index += 1) {
    const op = ops[index] as { insert?: unknown };
    const length = typeof op.insert === "string" ? (op.insert as string).length : 1;
    if (linear === pairStart) {
      if (typeof op.insert !== "object" || op.insert === null) return null;
      const payload = op.insert as Record<string, unknown>;
      if (!("separator" in payload)) return null;
      const separator = payload["separator"] as { paragraphId?: unknown; kind?: unknown };
      if (separator.kind !== "horizontalRule" || typeof separator.paragraphId !== "string") {
        return null;
      }
      const next = ops[index + 1] as { insert?: unknown } | undefined;
      if (next === undefined || typeof next.insert !== "object" || next.insert === null) {
        return null;
      }
      const atomPayload = next.insert as Record<string, unknown>;
      if (!("horizontalRule" in atomPayload)) return null;
      const atom = atomPayload["horizontalRule"] as { paragraphId?: unknown };
      if (atom.paragraphId !== separator.paragraphId) return null;
      if (pairStart + 2 !== (span === 2 ? to : from + 1)) return null;
      return pairStart;
    }
    linear += length;
  }
  return null;
}

function linearRangeTouchesAtom(
  map: SelectionMap,
  ytext: Y.Text,
  from: number,
  to: number,
): "preserved" | "horizontalRule" | null {
  const delta = ytext.toDelta() as Array<{ insert?: string | Record<string, unknown> }>;
  let linear = 0;
  let currentKind: string | null = null;
  for (const op of delta) {
    const length = typeof op.insert === "string" ? (op.insert as string).length : 1;
    const end = linear + length;
    // CL-3b2 F-2: the separator opens its segment, so the current kind is
    // updated from the separator before the range test. Testing the stale
    // kind first misclassified a range over the separator+atom pair of an
    // HR placed immediately after a preserved block as preserved content.
    if (typeof op.insert === "object" && op.insert !== null && isSeparatorValue(op.insert)) {
      currentKind = (op.insert.separator as { kind: string }).kind;
    }
    const overlaps = linear < to && end > from;
    if (overlaps && typeof op.insert === "object" && op.insert !== null) {
      if (isPreservedValue(op.insert) || currentKind === "preserved") return "preserved";
      if (isHorizontalRuleValue(op.insert) || currentKind === "horizontalRule") return "horizontalRule";
      if (isSeparatorValue(op.insert)) {
        const kind = (op.insert.separator as { kind: string }).kind;
        if (kind === "preserved") return "preserved";
        if (kind === "horizontalRule") return "horizontalRule";
      }
    }
    linear = end;
  }
  void map;
  return null;
}

/**
 * Project one ProseMirror transaction to the field `Y.Text`, step by step
 * against the evolving map (spec §4.3.1 item 2). A transaction that would
 * delete a preserved embed or place text before the first separator is
 * refused by the filter and never reaches the `Y.Text`.
 */
function countTextBlocks(doc: ProseMirrorNode): number {
  let count = 0;
  doc.descendants((node) => {
    if (node.type.name === "paragraph" || node.type.name === "heading" || node.type.name === "codeBlock") {
      count += 1;
      return false;
    }
    return true;
  });
  return count;
}

/** A step that only converts one whole textblock's type — the
    setBlockType/setNodeMarkup conversions between paragraph, heading and
    codeBlock with the same id and the same inline text. Such a step must not
    rewrite the runs: formats hidden through a code detour survive in the
    shared state (R-FULL-CODE-1), and the metadata sync writes the new type. */
function isTextblockTypeConversion(
  doc: ProseMirrorNode,
  from: number,
  to: number,
  slice: { content: ProseMirrorNode["content"]; openStart: number; openEnd: number },
): boolean {
  if (slice.openStart !== 0 || slice.openEnd !== 0) return false;
  if (slice.content.childCount !== 1) return false;
  const node = doc.resolve(from).nodeAfter;
  if (node === null || node.isText) return false;
  const nodeType = node.type.name;
  if (nodeType !== "paragraph" && nodeType !== "heading" && nodeType !== "codeBlock") return false;
  if (to !== from + node.nodeSize) return false;
  const child = slice.content.child(0);
  const childType = child.type.name;
  if (childType !== "paragraph" && childType !== "heading" && childType !== "codeBlock") return false;
  const nodeId = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
  const childId = child.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
  if (typeof nodeId !== "string" || nodeId === "" || nodeId !== childId) return false;
  return child.textContent === node.textContent;
}

/** Record blocks whose node type left codeBlock in this step: the local
    view rebuilds them from the shared state so formats hidden while the
    block was code are revealed (R-FULL-CODE-1, review 2 B-NEW-8). */
function collectCodeReveals(
  run: ProjectionRun,
  preDoc: ProseMirrorNode,
  postDoc: ProseMirrorNode,
): void {
  const preTypes = new Map<string, string>();
  preDoc.descendants((node) => {
    if (node.type.name === "paragraph" || node.type.name === "heading" || node.type.name === "codeBlock") {
      const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
      if (typeof id === "string" && id !== "") preTypes.set(id, node.type.name);
      return false;
    }
    return true;
  });
  postDoc.descendants((node) => {
    if (node.type.name === "paragraph" || node.type.name === "heading") {
      const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
      if (
        typeof id === "string" &&
        id !== "" &&
        preTypes.get(id) === "codeBlock" &&
        !run.revealedIds.includes(id)
      ) {
        run.revealedIds.push(id);
      }
      return false;
    }
    return true;
  });
}

export function projectPmTransactionToYText(
  binding: ProjectionBinding,
  pmDocBefore: ProseMirrorNode,
  tr: Transaction,
): string[] {
  if (binding.ytext.doc === null) {
    throw new Error("rich-text.collab-no-doc: field Y.Text is not attached to a Y.Doc");
  }
  // Review 1 TF-3: validate every step (preserved clearance, HR crossing,
  // ranges) before the first mutating write to the live shared state.
  // Phase 1 projects onto a scratch clone that is discarded afterwards, so
  // a refusal at any step leaves the live state vector byte-equal. Phase 2
  // executes the identical projection onto the live state while replaying
  // the recorded allocator outputs, keeping identities stable across both
  // phases (one allocation sequence per transaction, as before).
  const scratch = cloneFieldDoc(binding);
  const recorded: string[] = [];
  projectIntoRun(
    {
      ...binding,
      ytext: scratch.ytext,
      fieldMeta: scratch.fieldMeta,
      allocateId: () => {
        const id = binding.allocateId();
        recorded.push(id);
        return id;
      },
    },
    pmDocBefore,
    tr,
  );
  let replay = 0;
  return projectIntoRun(
    {
      ...binding,
      allocateId: () =>
        replay < recorded.length ? (recorded[replay++] as string) : binding.allocateId(),
    },
    pmDocBefore,
    tr,
  );
}

/** Clone one field's shared state into a scratch document (review 1 TF-3
    validation phase): the clone carries the same text, metadata map and
    field names, observes nothing, and is never synced anywhere. */
function cloneFieldDoc(binding: ProjectionBinding): {
  ydoc: Y.Doc;
  ytext: Y.Text;
  fieldMeta: Y.Map<unknown>;
} {
  const ydoc = binding.ytext.doc;
  if (ydoc === null) {
    throw new Error("rich-text.collab-no-doc: field Y.Text is not attached to a Y.Doc");
  }
  const scratch = new Y.Doc();
  Y.applyUpdate(scratch, Y.encodeStateAsUpdate(ydoc));
  return {
    ydoc: scratch,
    ytext: scratch.getText(fieldTextName(binding.fieldKey)),
    fieldMeta: scratch.getMap(fieldMetaName(binding.fieldKey)) as Y.Map<unknown>,
  };
}

/** Project one ProseMirror transaction onto its run's shared state. */
function projectIntoRun(
  binding: ProjectionBinding,
  pmDocBefore: ProseMirrorNode,
  tr: Transaction,
): string[] {
  const { ytext, fieldMeta } = binding;
  const ydoc = ytext.doc;
  if (ydoc === null) {
    throw new Error("rich-text.collab-no-doc: field Y.Text is not attached to a Y.Doc");
  }
  const preMeta = new Map<string, unknown>();
  for (const [key, value] of fieldMeta.entries()) {
    preMeta.set(key, structuredClone(value));
  }
  const run: ProjectionRun = {
    ytext,
    fieldMeta,
    format: binding.format,
    allocateId: binding.allocateId,
    journal: [],
    freshQueue: [],
    inserted: [],
    revealedIds: [],
  };
  if (binding.pmTransactionDoc !== undefined) {
    run.freshQueue = freshIdQueue(pmDocBefore, binding.pmTransactionDoc);
  }
  let workingDoc = pmDocBefore;
  let map = buildSelectionMap(workingDoc, ytext);
  let failed = false;
  let failure: unknown = null;

  // Every shared-state write is journaled and verified inside one Yjs
  // transaction (review 2 B-NEW-6): a refused or diverging projection
  // inverts the journal before the transaction commits, so observers on
  // either side never see a half-applied state. The transaction runs under
  // one origin (CL-3b1 §4.5): the local origin normally, the mark origin for
  // a mark-only transaction (never tracked by the field UndoManager).
  const origin = isMarkOnlyTransaction(tr) ? binding.markOrigin : binding.localOrigin;
  ydoc.transact(() => {
    try {
      for (const step of tr.steps) {
        if (step instanceof ReplaceStep) {
          const from = (step as unknown as { from: number }).from;
          const to = (step as unknown as { to: number }).to;
          const slice = (step as unknown as { slice: { content: ProseMirrorNode["content"]; openStart: number; openEnd: number } }).slice;
          // Classify against the post-step document first: a pure insert that
          // grows the textblock count by exactly one through an open slice is
          // a split at any depth (one separator insert; the tail text is
          // already in place), not a content duplication. Top-level childCount
          // stays flat for splits inside list items/quotes, so textblocks are
          // the depth-independent signal.
          const postStep = step.apply(workingDoc);
          if (postStep === null) {
            throw new Error("rich-text.collab-step-failed: ProseMirror step does not apply");
          }
          const postDoc = (postStep as { doc: ProseMirrorNode }).doc;
          const preTextBlocks = countTextBlocks(workingDoc);
          const postTextBlocks = countTextBlocks(postDoc);
          const linearFrom = pmPositionToLinear(map, from);
          const linearTo = pmPositionToLinear(map, to);
          if (linearFrom > linearTo) {
            throw new Error("rich-text.collab-invalid-range: step range maps backwards");
          }
          if (linearFrom === 0 && linearTo > 0 && (slice.content.size ?? 0) === 0 && from === 0) {
            throw new Error("rich-text.collab-invalid-range: no text before the first separator");
          }
          const atom = linearRangeTouchesAtom(map, ytext, linearFrom, linearTo);
          if (atom === "preserved") {
            throw new Error("rich-text.collab-preserved-denied: the binding refuses any step touching preserved content");
          }
          // R-FULL-CODE-1: bare text inserts split on LF only inside a
          // codeBlock. Resolve the insertion point against the pre-step
          // document (a pure insert shifts nothing before it).
          let insertCodeMode = false;
          try {
            const $from = workingDoc.resolve(from);
            for (let depth = $from.depth; depth >= 0; depth -= 1) {
              const ancestor = $from.node(depth);
              const name = ancestor.type.name;
              if (name === "paragraph" || name === "heading" || name === "codeBlock") {
                insertCodeMode = name === "codeBlock";
                break;
              }
            }
          } catch {
            insertCodeMode = false;
          }
          if (atom === "horizontalRule") {
            // An exact-pair deletion removes the atom (R-FULL-HR-1): the
            // separator+atom pair vanishes and the HR metadata record is
            // left orphaned like a merge-consumed block (R-STR-5), so undo
            // restores the pair with its record intact. Anything else
            // touching the pair refuses whole.
            //
            // Sole-block supply (review 1 B-4, R-FULL-HR-1 §4.3.2): deleting
            // or replacing the only block also supplies a fresh
            // empty-paragraph id so the first-separator invariant holds —
            // the field is never left empty.
            const pairStart = exactHrPairStart(ytext, linearFrom, linearTo);
            const soleBlock = pairStart === 0 && ytext.length === 2;
            if (pairStart !== null && ((slice.content.size ?? 0) === 0 || soleBlock)) {
              runDelete(run, pairStart, 2);
              if (soleBlock) {
                if ((slice.content.size ?? 0) > 0) {
                  insertSliceContent(run, 0, slice, {
                    listKind: "none",
                    listDepth: 0,
                    blockquoteDepth: 0,
                    containerOrder: [],
                    codeMode: insertCodeMode,
                  });
                  workingDoc = postDoc;
                } else {
                  const freshId = popFreshId(run, "paragraph") ?? runAllocate(run);
                  runInsertEmbed(run, 0, { separator: { paragraphId: freshId, kind: "paragraph" } });
                  // The verification record carries the canonical plain
                  // metadata the capture materializes for a record-less
                  // paragraph (no shared write: absent is the canonical
                  // encoding of plain).
                  run.inserted.push({
                    paragraphId: freshId,
                    kind: "paragraph",
                    text: "",
                    metadata: canonicalPlainMetadata(),
                  });
                  workingDoc = repairEmptyDocWithParagraph(postDoc, freshId);
                }
              } else {
                workingDoc = postDoc;
              }
              syncMetadataFromPmDoc(run, workingDoc, binding.pmTransactionDoc);
              map = buildSelectionMap(workingDoc, ytext);
              continue;
            }
            throw new Error("rich-text.collab-structural-conflict: range operations cannot cross an HR atom");
          }
          // A pure insert growing the textblock count through an open slice is
          // a split (the slice mirrors the head/tail halves with
          // `structure: true`; the tail text is already in place, so only
          // the separator is inserted). A block insert from paste carries a
          // closed boundary (`openStart === 0`) and keeps the general path.
          const isSplit = from === to && postTextBlocks === preTextBlocks + 1 && slice.openStart > 0;
          if (isSplit) {
            const headId = linearToBlock(map, linearFrom);
            const tailKind = splitTailKindOf(postDoc, headId);
            const tailId = popFreshId(run, tailKind) ?? runAllocate(run);
            insertSplitSeparator(run, map, linearFrom, tailId, slice.openStart >= 2);
            workingDoc = repairSplitTailIdentity(postDoc, headId, tailId);
            syncMetadataFromPmDoc(run, workingDoc, binding.pmTransactionDoc);
            map = buildSelectionMap(workingDoc, ytext);
            continue;
          }
          if (isTextblockTypeConversion(workingDoc, from, to, slice)) {
            // Type-only conversion (paragraph/heading/codeBlock, same id and
            // text): the runs stay untouched so formats hidden through a
            // code detour survive in the shared state (R-FULL-CODE-1); only
            // the metadata record changes. Blocks leaving codeBlock are
            // recorded so the local view can reveal the hidden formats.
            collectCodeReveals(run, workingDoc, postDoc);
            workingDoc = postDoc;
            syncMetadataFromPmDoc(run, workingDoc, binding.pmTransactionDoc);
            map = buildSelectionMap(workingDoc, ytext);
            continue;
          }
          if (linearTo > linearFrom) {
            runDelete(run, linearFrom, linearTo - linearFrom);
          }
          if ((slice.content.size ?? 0) > 0) {
            // A pure block insert at the start of the first block (document
            // start or wrapper start) addresses the separator opening it:
            // inserting after that separator would strand the block's text
            // inside a new HR segment (review 1 B-1). Middle boundaries
            // already resolve to the separator through the previous block.
            let insertAt = linearFrom;
            if (from === to && sliceInsertsBlocks(slice)) {
              const host = map.blocks.find(
                (block) => block.pmInlineStart === from + 1 && insertAt === block.contentStart,
              );
              if (host !== undefined) insertAt = host.separatorIndex;
            }
            insertSliceContent(run, insertAt, slice, {
              listKind: "none",
              listDepth: 0,
              blockquoteDepth: 0,
              containerOrder: [],
              codeMode: insertCodeMode,
            });
          }
          workingDoc = postDoc;
          syncMetadataFromPmDoc(run, workingDoc, binding.pmTransactionDoc);
          map = buildSelectionMap(workingDoc, ytext);
          continue;
        } else if (step instanceof AddMarkStep || step instanceof RemoveMarkStep) {
          const from = (step as unknown as { from: number }).from;
          const to = (step as unknown as { to: number }).to;
          const mark = (step as unknown as { mark: { type: { name: string }; attrs: Record<string, unknown> } }).mark;
          const linearFrom = pmPositionToLinear(map, from);
          const linearTo = pmPositionToLinear(map, to);
          if (linearTo <= linearFrom) continue;
          const attributes = pmMarkToAttributes(mark.type.name, mark.attrs);
          if (step instanceof AddMarkStep) {
            runFormat(run, linearFrom, linearTo - linearFrom, attributes);
          } else {
            const removal: Record<string, unknown> = {};
            for (const key of Object.keys(attributes)) removal[key] = null;
            if (mark.type.name === "link") {
              removal["link"] = null;
              removal["linkTitle"] = null;
            }
            runFormat(run, linearFrom, linearTo - linearFrom, removal);
          }
        }
        // Apply the step to the working document so the next step maps
        // against the post-step document (evolving map discipline).
        const preStepDoc = workingDoc;
        const applied = step.apply(workingDoc);
        if (applied === null || (applied as { doc?: unknown }).doc === undefined) {
          const maybe = step.apply(workingDoc) as unknown as { doc: ProseMirrorNode } | null;
          if (maybe === null) {
            throw new Error("rich-text.collab-step-failed: ProseMirror step does not apply");
          }
          workingDoc = maybe.doc;
        } else {
          workingDoc = (applied as { doc: ProseMirrorNode }).doc;
        }
        collectCodeReveals(run, preStepDoc, workingDoc);
        // Metadata fallback: wrapper/type/attribute changes write complete
        // metadata records; text items are never moved or replaced.
        syncMetadataFromPmDoc(run, workingDoc, binding.pmTransactionDoc);
        map = buildSelectionMap(workingDoc, ytext);
      }
      // Fail closed when the projected sequence diverges from the
      // transaction result (an untranslated text effect would otherwise go
      // missing). Verified inside the transaction so a divergence inverts
      // instead of committing.
      verifyTextAgreement(run, workingDoc, preMeta);
      if (run.freshQueue.length > 0) {
        throw new Error(
          "rich-text.collab-step-failed: identity repairs minted blocks the projection did not create",
        );
      }
    } catch (error) {
      failed = true;
      failure = error;
      invertJournal(run);
    }
  }, origin);
  if (failed) {
    throw failure;
  }
  return run.revealedIds;
}

/** Node type of the duplicated split tail: the last textblock occurrence
    carrying the head id in the raw post-step document. */
function splitTailKindOf(postDoc: ProseMirrorNode, headId: string | null): string {
  if (headId === null) return "paragraph";
  let kind = "paragraph";
  postDoc.descendants((node, pos) => {
    void pos;
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock"
    ) {
      if (node.attrs?.[PARAGRAPH_ID_ATTRIBUTE] === headId) kind = node.type.name;
      return false;
    }
    return true;
  });
  return kind;
}

/** Give the duplicated raw split tail its own identity (review 2 B-NEW-2):
    the raw ProseMirror step duplicates the head attrs, so the last
    occurrence of the head id in the post-step document is the tail and
    receives the identity the projection wrote to `Y.Text`. The repaired
    working document then verifies strictly (unique ids). */
function repairSplitTailIdentity(
  postDoc: ProseMirrorNode,
  headId: string | null,
  tailId: string,
): ProseMirrorNode {
  if (headId === null) return postDoc;
  const positions: number[] = [];
  postDoc.descendants((node, pos) => {
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock"
    ) {
      if (node.attrs?.[PARAGRAPH_ID_ATTRIBUTE] === headId) positions.push(pos);
      return false;
    }
    return true;
  });
  if (positions.length < 2) return postDoc;
  const last = positions[positions.length - 1] as number;
  return new Transform(postDoc).setNodeAttribute(last, PARAGRAPH_ID_ATTRIBUTE, tailId).doc;
}

/**
 * Order-insensitive record comparison (R-STR-5): object keys sort, arrays
 * keep their order, and explicit `undefined` values are dropped exactly the
 * way `JSON.stringify` drops them (the derivation emits `undefined` for
 * absent run ids while stored records omit the keys). A derived record
 * identical to the stored one must not mint a new Yjs item: that would
 * manufacture a false last-writer-wins tie that randomly kills a real
 * concurrent write. No-op writes must not create items.
 */
export function stableMetadataJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((entry) => stableMetadataJson(entry)).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableMetadataJson(entry)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Write metadata records derived from a post-step PM document.
    `repairedDoc` (when supplied) is the transaction-final document after the
    identity plugin's repairs: the step-local `pmDoc` still carries empty
    identities for blocks this very transaction inserted (readers skip those),
    so HR wrapper records — which have no insert-time write carrying the
    complete derivation — are read from the repaired document instead
    (review 1 B-1). Paragraphs keep the step-local read (their insert-time
    write already carries the queue-adopted identity). */
function syncMetadataFromPmDoc(
  run: ProjectionRun,
  pmDoc: ProseMirrorNode,
  repairedDoc?: ProseMirrorNode,
): void {
  if (run.format !== "ds.markdown.full@1") return;
  const read = fullProseMirrorToDocument(pmDoc, undefined);
  const paragraphBlocks = read.document.blocks.filter((block) => block.kind === "paragraph");
  const storedRunOf = (blockId: string): string | null => {
    const record = run.fieldMeta.get(blockId) as { listRunId?: unknown } | undefined;
    const stored = record?.listRunId;
    return typeof stored === "string" && stored !== "" ? stored : null;
  };
  for (let blockIndex = 0; blockIndex < paragraphBlocks.length; blockIndex += 1) {
    const block = paragraphBlocks[blockIndex] as {
      paragraphId: string;
      metadata?: FullBlockMetadata;
    };
    const derived = block.metadata as FullBlockMetadata | undefined;
    if (derived === undefined) continue;
    const current = run.fieldMeta.get(block.paragraphId) as FullBlockMetadata | undefined;
    if (current === undefined) {
      if (!isPlainMetadata(derived)) {
        runMetaSet(run, block.paragraphId, derived);
      }
      continue;
    }
    if (stableMetadataJson(current) === stableMetadataJson(derived)) continue;
    // Depth-only changes never re-derive listRunId from PM list-node
    // attributes (R-FULL-META-1/2): a nested list created by sink carries an
    // empty wrapper run id, so the derived run id falls back to the block's
    // own id or to the first block of the derived cluster. Keep the stored
    // run id and take the remaining wrapper fields (depth/kind/order) from
    // the derived record when either fallback applies: the derived cluster
    // starts at the block itself, or an adjacent block of the same list
    // kind already stores the same run id (a sunk or lifted member keeps
    // its run, review 2 B-NEW-5).
    const currentRun = (current as { listRunId?: unknown }).listRunId;
    const derivedRun = (derived as { listRunId?: unknown }).listRunId;
    const previousId = blockIndex > 0 ? (paragraphBlocks[blockIndex - 1] as { paragraphId: string }).paragraphId : null;
    const nextId =
      blockIndex + 1 < paragraphBlocks.length
        ? (paragraphBlocks[blockIndex + 1] as { paragraphId: string }).paragraphId
        : null;
    const neighborCarriesRun =
      (previousId !== null && storedRunOf(previousId) === currentRun) ||
      (nextId !== null && storedRunOf(nextId) === currentRun);
    const keepCurrentRun =
      typeof currentRun === "string" &&
      currentRun !== "" &&
      derivedRun !== currentRun &&
      currentRun !== block.paragraphId &&
      ((derivedRun === block.paragraphId) ||
        (derived.listDepth > 0 &&
          derived.listKind === current.listKind &&
          neighborCarriesRun));
    if (keepCurrentRun) {
      const merged = {
        ...(structuredClone(derived) as FullBlockMetadata),
        listRunId: currentRun,
      } as FullBlockMetadata;
      if ((merged as { listRunId?: unknown }).listRunId !== block.paragraphId) {
        delete (merged as { orderedStart?: unknown }).orderedStart;
        delete (merged as { orderedType?: unknown }).orderedType;
        delete (merged as { listTight?: unknown }).listTight;
      }
      if (stableMetadataJson(current) !== stableMetadataJson(merged)) {
        runMetaSet(run, block.paragraphId, merged);
      }
      continue;
    }
    runMetaSet(run, block.paragraphId, derived);
  }
  // Horizontal-rule wrapper metadata (review 1 B-1, R-FULL-HR-1): an HR
  // inserted or moved inside a blockquote or list carries exactly its
  // wrapper/grouping record; a top-level HR carries no record (absent
  // materializes the canonical defaults on capture). Read from the repaired
  // document: the step-local read skips this transaction's own insertions
  // (empty identities), while the repaired read carries their final ids.
  const defaultHrJson = stableMetadataJson(canonicalHrDefaults());
  const hrRead = repairedDoc !== undefined ? fullProseMirrorToDocument(repairedDoc, undefined) : read;
  for (const block of hrRead.document.blocks) {
    if (block.kind !== "horizontalRule") continue;
    const hr = block as { paragraphId: string; hrMetadata?: FullBlockMetadata };
    const derived = hr.hrMetadata ?? canonicalHrDefaults();
    const derivedJson = stableMetadataJson(derived);
    const current = run.fieldMeta.get(hr.paragraphId) as FullBlockMetadata | undefined;
    if (current === undefined) {
      if (derivedJson !== defaultHrJson) {
        runMetaSet(run, hr.paragraphId, derived);
      }
      continue;
    }
    if (stableMetadataJson(current) === derivedJson) continue;
    if (derivedJson === defaultHrJson) {
      runMetaDelete(run, hr.paragraphId);
    } else {
      runMetaSet(run, hr.paragraphId, derived);
    }
  }
}

/** Fail closed when the shared sequence disagrees with the PM result. */
function verifyTextAgreement(
  run: ProjectionRun,
  pmDoc: ProseMirrorNode,
  preMeta: Map<string, unknown>,
): void {
  const captured = captureDocumentFromField(run.ytext, run.fieldMeta, run.format);
  if (run.format !== "ds.markdown.full@1") {
    verifyP0Agreement(run, pmDoc, captured, preMeta);
    return;
  }
  verifyFullAgreement(run, pmDoc, captured, preMeta);
}

type CapturedField = ReturnType<typeof captureDocumentFromField>;

/** P0/plain verification: every captured block is either a raw PM block
    (compared on id and text; preserved blocks also compare their raw
    payload and kind against the PM node attributes) or a recorded
    projection insert (compared on id and text). Nothing else passes, and
    the counts must balance exactly (review 2 B-NEW-7). */
function verifyP0Agreement(
  run: ProjectionRun,
  pmDoc: ProseMirrorNode,
  captured: CapturedField,
  _preMeta: Map<string, unknown>,
): void {
  void _preMeta;
  const pmBlocks: Array<{
    id: string;
    kind: "paragraph" | "preserved";
    text: string;
    raw: string;
    preservedKind: string;
  }> = [];
  pmDoc.descendants((node) => {
    if (node.type.name !== "paragraph" && node.type.name !== "preservedBlock") return true;
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id !== "string" || id === "") return true;
    pmBlocks.push({
      id,
      kind: node.type.name === "preservedBlock" ? "preserved" : "paragraph",
      text: node.textContent,
      raw: typeof node.attrs?.["raw"] === "string" ? (node.attrs["raw"] as string) : "",
      preservedKind:
        typeof node.attrs?.["preservedKind"] === "string" ? (node.attrs["preservedKind"] as string) : "",
    });
    return false;
  });
  const pmById = new Map(pmBlocks.map((block) => [block.id, block]));
  const recordById = new Map(
    run.inserted.filter((record) => record.kind === "paragraph").map((record) => [record.paragraphId, record]),
  );
  const capBlocks = captured.document.blocks.filter(
    (block) => block.kind === "paragraph" || block.kind === "preserved",
  );
  const expectedIds = new Set<string>([...pmById.keys(), ...recordById.keys()]);
  if (capBlocks.length !== expectedIds.size) {
    throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
  }
  for (const cap of capBlocks) {
    const pm = pmById.get(cap.paragraphId);
    if (pm !== undefined) {
      if (cap.kind !== pm.kind) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      if (cap.kind === "preserved") {
        if ((cap.raw ?? "") !== pm.raw || (cap.preservedKind ?? "") !== pm.preservedKind) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
        continue;
      }
      const capText = cap.text ?? "";
      if (capText !== pm.text && capText.replace(/[*`\\]/g, "") !== pm.text) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      continue;
    }
    const record = recordById.get(cap.paragraphId);
    if (record === undefined || cap.kind !== "paragraph") {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    const capText = cap.text ?? "";
    const recordText = record.text ?? "";
    if (capText !== recordText && capText.replace(/[*`\\]/g, "") !== recordText) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
  }
}

/** Capture-vocabulary kind of an insert record (the reader maps every
    textblock to "paragraph"). */
function captureKindOfRecord(record: InsertRecord): "paragraph" | "horizontalRule" {
  return record.kind === "horizontalRule" ? "horizontalRule" : "paragraph";
}

/** Full verification (review 2 B-NEW-7): every captured block matches, by
    id, either the raw PM read (metadata corrected per R-FULL-META-1/2, plus
    segments and marks) or a recorded projection insert (kind, metadata,
    segments and marks). The fresh-tail bypass is gone: after the identity
    repair a split tail verifies like any other block. */
function verifyFullAgreement(
  run: ProjectionRun,
  pmDoc: ProseMirrorNode,
  captured: CapturedField,
  preMeta: Map<string, unknown>,
): void {
  const expectedRead = fullProseMirrorToDocument(pmDoc, undefined);
  const expectedAll = expectedRead.document.blocks.filter(
    (block) => block.kind === "paragraph" || block.kind === "horizontalRule" || block.kind === "preserved",
  );
  const expectedById = new Map(expectedAll.map((block) => [block.paragraphId, block]));
  // Neighbour runs (as of the pre-transaction metadata) for the run-keep
  // correction: a sunk or lifted member keeps its run when an adjacent
  // block of the same list still names it (R-FULL-META-1/2).
  const paragraphExpected = expectedAll.filter((block) => block.kind === "paragraph");
  const neighborRuns = new Map<string, Array<string | null>>();
  const preRunOf = (blockId: string): string | null => {
    const record = preMeta.get(blockId) as { listRunId?: unknown } | undefined;
    const stored = record?.listRunId;
    return typeof stored === "string" && stored !== "" ? stored : null;
  };
  for (let index = 0; index < paragraphExpected.length; index += 1) {
    const block = paragraphExpected[index] as { paragraphId: string };
    const previous = index > 0 ? (paragraphExpected[index - 1] as { paragraphId: string }).paragraphId : null;
    const next =
      index + 1 < paragraphExpected.length
        ? (paragraphExpected[index + 1] as { paragraphId: string }).paragraphId
        : null;
    neighborRuns.set(block.paragraphId, [
      previous !== null ? preRunOf(previous) : null,
      next !== null ? preRunOf(next) : null,
    ]);
  }
  const recordById = new Map(run.inserted.map((record) => [record.paragraphId, record]));
  const capBlocks = captured.document.blocks;
  const expectedIds = new Set<string>([...expectedById.keys(), ...recordById.keys()]);
  if (capBlocks.length !== expectedIds.size) {
    throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
  }
  const segmentKey = (
    segments: ReadonlyArray<{ type: string; text?: string; marks?: unknown }> | undefined,
  ): string =>
    (segments ?? [])
      .map((segment) =>
        segment.type === "hardBreak" ? "\n" : `${segment.text ?? ""}|${JSON.stringify(segment.marks ?? {})}`,
      )
      .join("\u0000");
  // R-FULL-CODE-1 display normalization: a block that is (or was, in the
  // pre-transaction metadata) a codeBlock compares its segments without
  // marks. The ProseMirror side never carries them — the schema strips
  // marks inside a codeBlock and the PM read drops them — while the shared
  // state keeps them hidden; the type-conversion path preserves them on
  // purpose so the cycle prose -> code -> prose reveals the formats.
  const isCodeMetaRecord = (meta: unknown): boolean => {
    if (meta === null || typeof meta !== "object") return false;
    const record = meta as { blockKind?: unknown; codeLanguage?: unknown };
    return (
      record.blockKind === "codeBlock" ||
      (record.codeLanguage !== undefined && record.codeLanguage !== null)
    );
  };
  const segmentsForComparison = (
    segments: ReadonlyArray<{ type: string; text?: string; marks?: unknown }> | undefined,
    codeInvolved: boolean,
  ): ReadonlyArray<{ type: string; text?: string; marks?: unknown }> | undefined => {
    if (!codeInvolved || segments === undefined) return segments;
    // Merge adjacent text runs (marks stripped, empty runs dropped):
    // run boundaries inside a code detour are an artifact of the block's
    // history, not of its content.
    const normalized: Array<{ type: string; text?: string }> = [];
    for (const segment of segments) {
      if (segment.type === "hardBreak") {
        normalized.push({ type: "hardBreak" });
        continue;
      }
      const text = segment.text ?? "";
      const last = normalized[normalized.length - 1];
      if (last !== undefined && last.type === "text") {
        last.text = (last.text ?? "") + text;
      } else if (text !== "") {
        normalized.push({ type: "text", text });
      }
    }
    return normalized;
  };
  for (const cap of capBlocks) {
    const exp = expectedById.get(cap.paragraphId);
    if (exp !== undefined) {
      if (exp.kind !== cap.kind) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      if (cap.kind === "preserved") {
        if ((cap.raw ?? "") !== (exp.raw ?? "") || (cap.preservedKind ?? "") !== (exp.preservedKind ?? "")) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
        continue;
      }
      if (cap.kind === "horizontalRule") {
        // Wrapper metadata agreement (review 1 B-1, R-FULL-HR-1): the
        // stored record (or the canonical defaults when absent) must match
        // the ProseMirror read, order-insensitively like the sync path.
        const expMeta =
          (exp as unknown as { hrMetadata?: FullBlockMetadata }).hrMetadata ?? canonicalHrDefaults();
        const capMeta =
          (cap as unknown as { hrMetadata?: FullBlockMetadata }).hrMetadata ?? canonicalHrDefaults();
        if (stableMetadataJson(expMeta) !== stableMetadataJson(capMeta)) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
      }
      if (cap.kind === "paragraph") {
        const expMeta = correctExpectedMeta(
          exp.metadata as FullBlockMetadata | undefined,
          cap.paragraphId,
          preMeta,
          neighborRuns,
        );
        const capMeta = cap.metadata as FullBlockMetadata | undefined;
        // Order-insensitive like the sync path (R-STR-5): the stored record
        // keeps its key order when the write is a semantic no-op, and the
        // derivation's explicit `undefined` run ids match omitted keys.
        if (stableMetadataJson(expMeta ?? null) !== stableMetadataJson(capMeta ?? null)) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
        const codeInvolved =
          isCodeMetaRecord(preMeta.get(cap.paragraphId)) ||
          isCodeMetaRecord(expMeta) ||
          isCodeMetaRecord(capMeta);
        if (
          segmentKey(segmentsForComparison(exp.segments, codeInvolved)) !==
          segmentKey(segmentsForComparison(cap.segments, codeInvolved))
        ) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
      }
      continue;
    }
    const record = recordById.get(cap.paragraphId);
    if (record === undefined || captureKindOfRecord(record) !== cap.kind) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    if (cap.kind === "paragraph") {
      const capMeta = cap.metadata as FullBlockMetadata | undefined;
      if (stableMetadataJson(record.metadata ?? null) !== stableMetadataJson(capMeta ?? null)) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      const recordCodeInvolved =
        isCodeMetaRecord(preMeta.get(cap.paragraphId)) ||
        isCodeMetaRecord(record.metadata) ||
        isCodeMetaRecord(capMeta);
      if (
        segmentKey(segmentsForComparison(record.segments, recordCodeInvolved)) !==
        segmentKey(segmentsForComparison(cap.segments, recordCodeInvolved))
      ) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
    }
  }
}

/** Depth-only correction shared with the sync path (never re-derive runId):
    the stored run survives when the derived cluster falls back to the block
    itself or when an adjacent block of the same list kind still names the
    same run (R-FULL-META-1/2, review 2 B-NEW-5). */
function correctExpectedMeta(
  derived: FullBlockMetadata | undefined,
  blockId: string,
  preMeta: Map<string, unknown>,
  neighborRuns: Map<string, Array<string | null>>,
): FullBlockMetadata | undefined {
  if (derived === undefined) return undefined;
  const current = preMeta.get(blockId) as FullBlockMetadata | undefined;
  if (current === undefined) return derived;
  const currentRun = (current as { listRunId?: unknown }).listRunId;
  const derivedRun = (derived as { listRunId?: unknown }).listRunId;
  const neighbors = neighborRuns.get(blockId) ?? [null, null];
  const neighborCarriesRun = neighbors.some((neighbor) => neighbor !== null && neighbor === currentRun);
  const keepCurrentRun =
    typeof currentRun === "string" &&
    currentRun !== "" &&
    derivedRun !== currentRun &&
    currentRun !== blockId &&
    ((derivedRun === blockId) ||
      (derived.listDepth > 0 && derived.listKind === current.listKind && neighborCarriesRun));
  if (keepCurrentRun) {
    const merged = { ...(structuredClone(derived) as FullBlockMetadata), listRunId: currentRun } as FullBlockMetadata;
    if ((merged as { listRunId?: unknown }).listRunId !== blockId) {
      delete (merged as { orderedStart?: unknown }).orderedStart;
      delete (merged as { orderedType?: unknown }).orderedType;
      delete (merged as { listTight?: unknown }).listTight;
    }
    return merged;
  }
  return derived;
}

// ── Incremental remote application ──

export interface RemoteApplyResult {
  rebuiltParagraphIds: string[];
}

/** Map a pre-update linear index to its post-update image through the
    transaction delta (review 2 B-NEW-4): retains map identity, deletions
    collapse to the effacement point, inserts at the index stay before the
    inserted content. */
function mapLinearIndexThroughDelta(
  delta: Array<{ insert?: string | Record<string, unknown>; delete?: number; retain?: number }>,
  preIndex: number,
): number {
  let prePosition = 0;
  let postPosition = 0;
  for (const op of delta) {
    if (op.retain !== undefined) {
      if (preIndex < prePosition + op.retain) {
        return postPosition + (preIndex - prePosition);
      }
      prePosition += op.retain;
      postPosition += op.retain;
      continue;
    }
    if (op.delete !== undefined) {
      if (preIndex < prePosition + op.delete) {
        return postPosition;
      }
      prePosition += op.delete;
      continue;
    }
    const length = typeof op.insert === "string" ? op.insert.length : 1;
    if (preIndex <= prePosition) {
      return postPosition;
    }
    postPosition += length;
  }
  // CL-3b2 witness 5 (retained r1 caret stability): a Yjs delta ends at its
  // last change — a trailing retain is omitted — so an index past the final
  // op still carries the accumulated shift. Falling through to the bare
  // `postPosition` froze every caret at or past the insert point instead of
  // tracking its content.
  return postPosition + (preIndex - prePosition);
}

/** Top-level PM range covering a leaf range: replacement boundaries always
    sit at depth 0 (review 2 B-NEW-4), so an affected block inside a list or
    quote rebuilds its whole enclosing top-level wrapper. */
function topLevelRangeOf(
  doc: ProseMirrorNode,
  start: number,
  end: number,
): { from: number; to: number } | null {
  let from = -1;
  let to = -1;
  let position = 0;
  doc.forEach((child) => {
    const size = child.nodeSize;
    if (position < end && position + size > start) {
      if (from === -1) from = position;
      to = position + size;
    }
    position += size;
  });
  if (from === -1 || to === -1) return null;
  return { from, to };
}

/** Identified block ids inside a range, at any depth. */
function collectIdsInRange(doc: ProseMirrorNode, from: number, to: number): Set<string> {
  const ids = new Set<string>();
  doc.nodesBetween(from, to, (node: ProseMirrorNode) => {
    const id = (node.attrs as Record<string, unknown>)[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id === "string" && id !== "") ids.add(id);
    return true;
  });
  return ids;
}

/** Span of whole top-level nodes containing any of the given ids. Ids absent
 * from this document are skipped (inserted or removed blocks). */
function topLevelRangeOfIds(
  doc: ProseMirrorNode,
  ids: Set<string>,
): { from: number; to: number } | null {
  if (ids.size === 0) return null;
  let from = -1;
  let to = -1;
  let position = 0;
  doc.forEach((child) => {
    const size = child.nodeSize;
    let contains = false;
    child.descendants((node: ProseMirrorNode) => {
      if (contains) return false;
      const id = (node.attrs as Record<string, unknown>)[PARAGRAPH_ID_ATTRIBUTE];
      if (typeof id === "string" && ids.has(id)) {
        contains = true;
        return false;
      }
      return true;
    });
    if (contains) {
      if (from === -1) from = position;
      to = position + size;
    }
    position += size;
  });
  if (from === -1 || to === -1) return null;
  return { from, to };
}

/** Wrapper-balanced replacement ranges (review 2 B-NEW-4): a block moving
 * between wrappers changes which top-level node contains it, so each side's
 * region is expanded with the identified blocks present only in the other
 * region until both cover the same ids. This keeps the unaffected neighbours
 * of a moved block — the surviving item after a lift, the list around a sunk
 * block — inside both replacement ranges. Null when the regions cannot be
 * balanced: the caller falls back to a full replacement. */
function balancedWrapperRanges(
  oldDoc: ProseMirrorNode,
  freshDoc: ProseMirrorNode,
  oldStart: number,
  oldEnd: number,
  freshStart: number,
  freshEnd: number,
): { old: { from: number; to: number }; fresh: { from: number; to: number } } | null {
  const oldTop = topLevelRangeOf(oldDoc, oldStart, oldEnd);
  const freshTop = topLevelRangeOf(freshDoc, freshStart, freshEnd);
  if (oldTop === null || freshTop === null) return null;
  let old = oldTop;
  let fresh = freshTop;
  for (let pass = 0; pass < 8; pass += 1) {
    const oldIds = collectIdsInRange(oldDoc, old.from, old.to);
    const freshIds = collectIdsInRange(freshDoc, fresh.from, fresh.to);
    const missingInFresh = [...oldIds].filter((id) => !freshIds.has(id));
    const missingInOld = [...freshIds].filter((id) => !oldIds.has(id));
    if (missingInFresh.length === 0 && missingInOld.length === 0) return { old, fresh };
    const freshAdd = topLevelRangeOfIds(freshDoc, new Set(missingInFresh));
    if (freshAdd !== null) {
      fresh = { from: Math.min(fresh.from, freshAdd.from), to: Math.max(fresh.to, freshAdd.to) };
    }
    const oldAdd = topLevelRangeOfIds(oldDoc, new Set(missingInOld));
    if (oldAdd !== null) {
      old = { from: Math.min(old.from, oldAdd.from), to: Math.max(old.to, oldAdd.to) };
    }
    if (freshAdd === null && oldAdd === null) {
      // Nothing further to balance: the remaining missing ids exist on one
      // side only (inserted or removed blocks), which is expected.
      return { old, fresh };
    }
  }
  return null;
}

/**
 * Project one remote Yjs transaction (text plus metadata together, applied
 * once with the union of the affected blocks) incrementally (spec §4.3.1
 * item 4): the affected block range — expanded to the enclosing top-level
 * wrapper whenever an affected block sits inside a list or quote in either
 * document — is rebuilt through item 1 and dispatched as one binding-origin
 * transaction (no echo). The local selection is computed from the
 * pre-update layout, mapped through the transaction delta, minted as
 * relative positions and restored on that same single dispatch.
 */
export function applyRemoteUpdateIncrementally(options: {
  view: EditorView;
  ytext: Y.Text;
  fieldMeta: Y.Map<unknown>;
  format: RichTextFormat;
  fieldKey: string;
  affectedParagraphIds: readonly string[];
  /** Linear layout as of the pre-update state (selection pre-image). When
      omitted, the current layout is used (metadata-only updates map
      identically). */
  preBlocks?: LinearBlockLayout[];
  /** The Y.Text delta of this transaction (pre-image to post-image mapping
      for the selection). */
  delta?: Array<{ insert?: string | Record<string, unknown>; delete?: number; retain?: number }>;
  /** Replace the whole document instead of the affected range (heal path
      after a failed application, review 2 B-NEW-6). */
  fullReplace?: boolean;
  /** Keep the ProseMirror-mapped selection (CL-3b2 review 1, BLOCKING-3):
      while a composition session stages the composing range, a disjoint
      incremental update must not round-trip the composing selection
      through the staged/shared length mismatch. */
  keepMappedSelection?: boolean;
}): RemoteApplyResult {
  const { view, ytext, fieldMeta, format, fieldKey, affectedParagraphIds } = options;
  const affected = new Set(affectedParagraphIds);
  if (affected.size === 0 && options.fullReplace !== true) return { rebuiltParagraphIds: [] };

  const preBlocks = options.preBlocks ?? linearBlocksOf(ytext);
  // Selection pre-image: PM positions paired with the pre-update layout.
  // FU-1: the pre-image map carries the pre-update linear length derived
  // from the pre-update blocks, never the already-mutated `ytext.length`.
  const beforeMap = buildSelectionMapFromBlocks(
    view.state.doc,
    preBlocks as LinearBlock[],
    preUpdateLinearLength(preBlocks),
  );
  const selection = view.state.selection;
  const anchorPre = pmPositionToLinear(beforeMap, selection.anchor);
  const headPre = pmPositionToLinear(beforeMap, selection.head);
  const delta = options.delta;
  const anchorPost = delta === undefined ? anchorPre : mapLinearIndexThroughDelta(delta, anchorPre);
  const headPost = delta === undefined ? headPre : mapLinearIndexThroughDelta(delta, headPre);
  const assocFor = (linear: number): number => (linear >= ytext.length ? -1 : 0);
  const cursor = {
    fieldKey,
    anchor: Y.relativePositionToJSON(Y.createRelativePositionFromTypeIndex(ytext, anchorPost, assocFor(anchorPost))),
    head: Y.relativePositionToJSON(Y.createRelativePositionFromTypeIndex(ytext, headPost, assocFor(headPost))),
  };

  const freshDoc = yTextToPmDoc(ytext, fieldMeta, format, view.state.schema);
  const oldDoc = view.state.doc;
  const tr = view.state.tr;
  tr.setMeta(BINDING_ORIGIN_META, true);
  const oldRanges = findBlockRanges(oldDoc, affected);
  const freshRanges = findBlockRanges(freshDoc, affected);
  let replaced = false;
  if (
    options.fullReplace !== true &&
    oldRanges.length > 0 &&
    freshRanges.length > 0
  ) {
    const oldStart = Math.min(...oldRanges.map((range) => range.start));
    const oldEnd = Math.max(...oldRanges.map((range) => range.end));
    const freshStart = Math.min(...freshRanges.map((range) => range.start));
    const freshEnd = Math.max(...freshRanges.map((range) => range.end));
    const ranges = balancedWrapperRanges(oldDoc, freshDoc, oldStart, oldEnd, freshStart, freshEnd);
    if (ranges !== null) {
      const slice = freshDoc.slice(ranges.fresh.from, ranges.fresh.to);
      tr.replaceWith(ranges.old.from, ranges.old.to, slice.content);
      replaced = true;
    }
  }
  if (!replaced) {
    tr.replaceWith(0, oldDoc.content.size, freshDoc.content);
  }
  // Selection restored on the same transaction: one dispatch, no second
  // round-trip (review 2 B-NEW-4).
  const afterMap = buildSelectionMapFromBlocks(tr.doc, walkLinearBlocks(ytext), ytext.length);
  const restored = cursorJsonToSelection(ytext, afterMap, cursor);
  if (options.keepMappedSelection !== true && restored !== null) {
    try {
      const size = tr.doc.content.size;
      const $anchor = tr.doc.resolve(Math.max(0, Math.min(restored.anchor, size)));
      const $head = tr.doc.resolve(Math.max(0, Math.min(restored.head, size)));
      tr.setSelection(
        new (selection.constructor as new (...args: never[]) => never)($anchor as never, $head as never) as never,
      );
    } catch {
      // Clamp failure keeps the default post-replacement selection rather
      // than an invalid one.
    }
  }
  view.dispatch(tr);
  return { rebuiltParagraphIds: [...affected] };
}

/**
 * Whether a remote update must defer while a composition session is open
 * (CL-3b2 review 1, BLOCKING-3): when the composing range or an affected
 * paragraph carries wrapper metadata (list or quote), the incremental
 * application expands to the enclosing top-level wrapper and would rebuild
 * the staged composing range. P0/text fields never wrap (paragraphs are
 * top-level), so disjoint updates there always stay live. The check is
 * deliberately conservative — a composition session lasts seconds, and a
 * paint delayed until the commit/cancel sync is always preferable to a
 * wiped staging.
 */
export function sharesComposingWrapper(options: {
  fieldMeta: Y.Map<unknown>;
  format: RichTextFormat;
  deferredParagraphIds: readonly string[];
  affectedParagraphIds: readonly string[];
}): boolean {
  if (options.format !== "ds.markdown.full@1") return false;
  if (options.deferredParagraphIds.length === 0 || options.affectedParagraphIds.length === 0) {
    return false;
  }
  const hasWrapper = (paragraphId: string): boolean => {
    const record = options.fieldMeta.get(paragraphId) as {
      listKind?: unknown;
      listRunId?: unknown;
      blockquoteDepth?: unknown;
      containerOrder?: unknown;
    } | undefined;
    if (record === undefined || record === null) return false;
    if (record.listKind !== undefined && record.listKind !== "none") return true;
    if (typeof record.listRunId === "string" && record.listRunId !== "") return true;
    if (typeof record.blockquoteDepth === "number" && record.blockquoteDepth > 0) return true;
    if (Array.isArray(record.containerOrder) && record.containerOrder.length > 0) return true;
    return false;
  };
  return (
    options.deferredParagraphIds.some(hasWrapper) || options.affectedParagraphIds.some(hasWrapper)
  );
}

/** Outer PM ranges of the affected blocks (textblocks plus HR/preserved atoms). */
function findBlockRanges(
  doc: ProseMirrorNode,
  affected: Set<string>,
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  doc.descendants((node, pos) => {
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id !== "string" || id === "" || !affected.has(id)) return true;
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock" ||
      node.type.name === "horizontalRule" ||
      node.type.name === "preservedBlock"
    ) {
      ranges.push({ start: pos, end: pos + node.nodeSize });
      return false;
    }
    return true;
  });
  return ranges;
}

export interface LinearBlockLayout {
  paragraphId: string;
  separatorIndex: number;
  contentStart: number;
  contentEnd: number;
}

/** Linear block layout of a field (exported for pre/post affected computation). */
export function linearBlocksOf(ytext: Y.Text): LinearBlockLayout[] {
  return walkLinearBlocks(ytext) as LinearBlockLayout[];
}

/** Pre-update linear length of a field layout (CL-3b1 FU-1): the last
    pre-update block's `contentEnd`, or 0 for an empty layout. A pre-update
    selection map must carry this length, never the already-mutated
    `ytext.length`. */
export function preUpdateLinearLength(preBlocks: LinearBlockLayout[]): number {
  if (preBlocks.length === 0) return 0;
  return (preBlocks[preBlocks.length - 1] as LinearBlockLayout).contentEnd;
}

/** Mark-only transaction test (CL-3b1 §4.5 boundary): true when the
    transaction carries at least one step and every step is an add/remove-mark
    step. Such transactions transact under the mark origin and never enter the
    field `UndoManager` stacks; a mixed text+marks gesture transacts under the
    local origin (its characters are undoable, its marks ride the items). */
export function isMarkOnlyTransaction(tr: Transaction): boolean {
  if (tr.steps.length === 0) return false;
  for (const step of tr.steps) {
    if (!(step instanceof AddMarkStep) && !(step instanceof RemoveMarkStep)) {
      return false;
    }
  }
  return true;
}

/** Derive the affected block range from a Y.Text change delta.
 *
 * Deleted ranges resolve against the pre-change layout; the surviving block
 * at the deletion point in the post-change layout joins the set so merges
 * rebuild their survivor. Separator inserts report both the head (pre-change
 * block at the insertion point) and the fresh tail id from the payload.
 * Formatting transactions (review 2 B-NEW-3) ride a retain carrying
 * attributes: every block the formatted range intersects joins the set.
 */
export function affectedBlocksFromDelta(
  preBlocks: LinearBlockLayout[],
  postBlocks: LinearBlockLayout[],
  delta: Array<{
    insert?: string | Record<string, unknown>;
    delete?: number;
    retain?: number;
    attributes?: Record<string, unknown> | null;
  }>,
): string[] {
  const touched = new Set<string>();
  const idAtPre = (index: number): string | null => {
    for (const block of preBlocks) {
      if (index === block.separatorIndex) return block.paragraphId;
    }
    for (const block of preBlocks) {
      if (index >= block.contentStart && index <= block.contentEnd) return block.paragraphId;
    }
    return preBlocks.length > 0
      ? (preBlocks[preBlocks.length - 1] as LinearBlockLayout).paragraphId
      : null;
  };
  const idAtPost = (index: number): string | null => {
    for (const block of postBlocks) {
      if (index === block.separatorIndex) return block.paragraphId;
    }
    for (const block of postBlocks) {
      if (index >= block.contentStart && index <= block.contentEnd) return block.paragraphId;
    }
    return postBlocks.length > 0
      ? (postBlocks[postBlocks.length - 1] as LinearBlockLayout).paragraphId
      : null;
  };
  let preIndex = 0;
  let postIndex = 0;
  for (const op of delta) {
    if (op.retain !== undefined) {
      if (op.attributes !== undefined) {
        // Formatting rides a retain (Yjs `Text.format`): blocks intersecting
        // the formatted range rebuild so their marked runs refresh.
        const from = preIndex;
        const to = preIndex + op.retain;
        for (const block of preBlocks) {
          if (block.separatorIndex <= to - 1 && block.contentEnd >= from) {
            touched.add(block.paragraphId);
          }
        }
      }
      preIndex += op.retain;
      postIndex += op.retain;
      continue;
    }
    if (op.delete !== undefined) {
      for (let offset = 0; offset < op.delete; offset += 1) {
        const id = idAtPre(preIndex + offset);
        if (id !== null) touched.add(id);
      }
      const survivor = idAtPost(postIndex);
      if (survivor !== null) touched.add(survivor);
      preIndex += op.delete;
      continue;
    }
    const insert = op.insert;
    if (typeof insert === "object" && insert !== null && isSeparatorValue(insert)) {
      const head = idAtPre(preIndex) ?? idAtPost(postIndex);
      if (head !== null) touched.add(head);
      const tailId = (insert.separator as { paragraphId: string }).paragraphId;
      if (typeof tailId === "string" && tailId !== "") touched.add(tailId);
      postIndex += 1;
      continue;
    }
    const head = idAtPre(preIndex) ?? idAtPost(postIndex);
    if (head !== null) touched.add(head);
    if (typeof insert === "string") postIndex += (insert as string).length;
    else postIndex += 1;
  }
  return [...touched];
}

export function linearFieldName(fieldKey: string): string {
  return fieldTextName(fieldKey);
}

export function linearMetaName(fieldKey: string): string {
  return fieldMetaName(fieldKey);
}

void isHorizontalRuleValue;
void isPreservedValue;
void isSeparatorValue;
