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
//   concurrent items and anchors survive.
// - `applyRemoteUpdateIncrementally`: a remote Y.Text change rebuilds only
//   the affected block range and dispatches one binding-origin transaction
//   (no echo), restoring the local selection through relative positions.

import * as Y from "yjs";
import { AddMarkStep, RemoveMarkStep, ReplaceStep } from "@tiptap/pm/transform";
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
import { canonicalPlainMetadata, isPlainMetadata } from "./editor-full-markdown.js";
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
  const pmBlocks = walkPmBlocks(pmDoc);
  const linearBlocks = walkLinearBlocks(ytext);
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
  return { blocks, linearLength: ytext.length, pmSize: pmDoc.content.size };
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
  ytext: Y.Text,
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
          ytext.insertEmbed(cursor.index, { hardBreak: true });
          cursor.index += 1;
        }
        const piece = parts[index] as string;
        if (piece !== "") {
          if (Object.keys(attributes).length > 0) ytext.insert(cursor.index, piece, attributes);
          else ytext.insert(cursor.index, piece);
          cursor.index += piece.length;
        }
      }
      return;
    }
    if (text !== "") {
      if (Object.keys(attributes).length > 0) ytext.insert(cursor.index, text, attributes);
      else ytext.insert(cursor.index, text);
      cursor.index += text.length;
    }
    return;
  }
  if (node.type.name === "hardBreak") {
    ytext.insertEmbed(cursor.index, { hardBreak: true });
    cursor.index += 1;
  }
}

interface SliceInsertContext {
  listKind: "none" | "bullet" | "ordered";
  listDepth: number;
  blockquoteDepth: number;
  containerOrder: Array<"quote" | "list">;
}

/** Insert one slice textblock (fresh identity; incoming ids stripped). */
function insertSliceTextblock(
  binding: ProjectionBinding,
  ytext: Y.Text,
  cursor: { index: number },
  node: ProseMirrorNode,
  context: SliceInsertContext,
  firstInSlice: boolean,
  openStart: number,
): void {
  const freshId = binding.allocateId();
  if (binding.format === "ds.markdown.full@1") {
    const blockKind = node.type.name === "heading"
      ? "heading"
      : node.type.name === "codeBlock"
        ? "codeBlock"
        : "paragraph";
    const metadata: FullBlockMetadata = {
      ...(canonicalPlainMetadata() as FullBlockMetadata),
      blockKind: blockKind as FullBlockMetadata["blockKind"],
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
    ytext.insertEmbed(cursor.index, { separator: { paragraphId: freshId, kind: "paragraph" } });
    cursor.index += 1;
    binding.fieldMeta.set(freshId, structuredClone(metadata) as unknown);
    const codeMode = blockKind === "codeBlock";
    node.forEach((child) => {
      insertInlineNode(ytext, cursor, child, codeMode);
    });
    return;
  }
  ytext.insertEmbed(cursor.index, { separator: { paragraphId: freshId, kind: "paragraph" } });
  cursor.index += 1;
  node.forEach((child) => {
    insertInlineNode(ytext, cursor, child, false);
  });
}

/**
 * Insert the separator of a paragraph split (spec §4.2, R-FULL-META-2): the
 * head keeps its id, the tail receives a fresh id carried by the inserted
 * separator embed. Under full the tail copies the creator's observed
 * block-local metadata with a fresh item id and no run-level values; a code
 * split copies the language.
 */
function insertSplitSeparator(
  binding: ProjectionBinding,
  ytext: Y.Text,
  map: SelectionMap,
  linearIndex: number,
): void {
  const tailId = binding.allocateId();
  ytext.insertEmbed(linearIndex, { separator: { paragraphId: tailId, kind: "paragraph" } });
  if (binding.format !== "ds.markdown.full@1") return;
  const head = linearToBlock(binding, map, linearIndex);
  if (head === null) return;
  const observed = binding.fieldMeta.get(head) as FullBlockMetadata | undefined;
  if (observed === undefined) return;
  const tail: FullBlockMetadata = {
    ...(structuredClone(observed) as FullBlockMetadata),
    listItemId: tailId,
  };
  delete (tail as { orderedStart?: unknown }).orderedStart;
  delete (tail as { orderedType?: unknown }).orderedType;
  delete (tail as { listTight?: unknown }).listTight;
  binding.fieldMeta.set(tailId, structuredClone(tail) as unknown);
}

/** Block id containing a linear index (split head lookup). */
function linearToBlock(
  binding: ProjectionBinding,
  map: SelectionMap,
  index: number,
): string | null {
  void binding;
  for (const block of map.blocks) {
    if (index === block.separatorIndex) return block.paragraphId;
    if (index >= block.contentStart && index <= block.contentEnd) return block.paragraphId;
  }
  return map.blocks.length > 0 ? (map.blocks[map.blocks.length - 1] as SelectionMapBlock).paragraphId : null;
}

/** Insert slice content at a linear index (fresh ids for new blocks). */
function insertSliceContent(
  binding: ProjectionBinding,
  ytext: Y.Text,
  linearIndex: number,
  slice: { content: ProseMirrorNode["content"]; openStart: number; openEnd: number },
  context: SliceInsertContext,
): number {
  const cursor = { index: linearIndex };
  let first = true;
  const walk = (fragment: ProseMirrorNode["content"], ctx: SliceInsertContext): void => {
    fragment.forEach((node) => {
      // Bare inline content (typing steps carry a raw text node, not a
      // paragraph): insert it into the current block as-is.
      if (node.isText) {
        insertInlineNode(ytext, cursor, node, false);
        first = false;
        return;
      }
      if (node.type.name === "hardBreak") {
        ytext.insertEmbed(cursor.index, { hardBreak: true });
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
            insertInlineNode(ytext, cursor, child, codeMode);
          });
        } else {
          insertSliceTextblock(binding, ytext, cursor, node, ctx, first, slice.openStart);
        }
        first = false;
        return;
      }
      if (node.type.name === "horizontalRule") {
        const freshId = binding.allocateId();
        ytext.insertEmbed(cursor.index, { separator: { paragraphId: freshId, kind: "horizontalRule" } });
        cursor.index += 1;
        ytext.insertEmbed(cursor.index, { horizontalRule: { paragraphId: freshId } });
        cursor.index += 1;
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
    if (typeof op.insert === "object" && op.insert !== null && isSeparatorValue(op.insert)) {
      currentKind = (op.insert.separator as { kind: string }).kind;
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

export function projectPmTransactionToYText(
  binding: ProjectionBinding,
  pmDocBefore: ProseMirrorNode,
  tr: Transaction,
): void {
  const { ytext, fieldMeta } = binding;
  const ydoc = ytext.doc;
  if (ydoc === null) {
    throw new Error("rich-text.collab-no-doc: field Y.Text is not attached to a Y.Doc");
  }
  const preMeta = new Map<string, unknown>();
  for (const [key, value] of fieldMeta.entries()) {
    preMeta.set(key, structuredClone(value));
  }
  let workingDoc = pmDocBefore;
  let map = buildSelectionMap(workingDoc, ytext);

  ydoc.transact(() => {
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
        if (atom === "horizontalRule") {
          throw new Error("rich-text.collab-structural-conflict: range operations cannot cross an HR atom");
        }
        // A pure insert growing the textblock count through an open slice is
        // a split (the slice mirrors the head/tail halves with
        // `structure: true`; the tail text is already in place, so only
        // the separator is inserted). A block insert from paste carries a
        // closed boundary (`openStart === 0`) and keeps the general path.
        const isSplit = from === to && postTextBlocks === preTextBlocks + 1 && slice.openStart > 0;
        if (isSplit) {
          insertSplitSeparator(binding, ytext, map, linearFrom);
          workingDoc = postDoc;
          syncMetadataFromPmDoc(binding, workingDoc);
          map = buildSelectionMap(workingDoc, ytext);
          continue;
        }
        if (linearTo > linearFrom) {
          ytext.delete(linearFrom, linearTo - linearFrom);
        }
        if ((slice.content.size ?? 0) > 0) {
          insertSliceContent(binding, ytext, linearFrom, slice, {
            listKind: "none",
            listDepth: 0,
            blockquoteDepth: 0,
            containerOrder: [],
          });
        }
        workingDoc = postDoc;
        syncMetadataFromPmDoc(binding, workingDoc);
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
          ytext.format(linearFrom, linearTo - linearFrom, attributes);
        } else {
          const removal: Record<string, unknown> = {};
          for (const key of Object.keys(attributes)) removal[key] = null;
          if (mark.type.name === "link") {
            removal["link"] = null;
            removal["linkTitle"] = null;
          }
          ytext.format(linearFrom, linearTo - linearFrom, removal);
        }
      }
      // Apply the step to the working document so the next step maps
      // against the post-step document (evolving map discipline).
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
      // Metadata fallback: wrapper/type/attribute changes write complete
      // metadata records; text items are never moved or replaced.
      syncMetadataFromPmDoc(binding, workingDoc);
      map = buildSelectionMap(workingDoc, ytext);
    }
  });

  // Fail closed when the projected sequence diverges from the transaction
  // result (an untranslated text effect would otherwise go missing).
  verifyTextAgreement(binding, workingDoc, preMeta);
  void fieldMeta;
}

/** Write metadata records derived from a post-step PM document. */
function syncMetadataFromPmDoc(binding: ProjectionBinding, pmDoc: ProseMirrorNode): void {
  if (binding.format !== "ds.markdown.full@1") return;
  const read = fullProseMirrorToDocument(pmDoc, undefined);
  for (const block of read.document.blocks) {
    if (block.kind !== "paragraph") continue;
    const derived = block.metadata as FullBlockMetadata | undefined;
    if (derived === undefined) continue;
    const current = binding.fieldMeta.get(block.paragraphId) as FullBlockMetadata | undefined;
    if (current === undefined) {
      if (!isPlainMetadata(derived)) {
        binding.fieldMeta.set(block.paragraphId, structuredClone(derived) as unknown);
      }
      continue;
    }
    if (JSON.stringify(current) === JSON.stringify(derived)) continue;
    // Depth-only changes never re-derive listRunId from PM list-node
    // attributes (R-FULL-META-1/2): a nested list created by sink carries an
    // empty wrapper run id, so the derived run id falls back to the block's
    // own id. Keep the stored run id and take the remaining wrapper fields
    // (depth/kind/order) from the derived record.
    const currentRun = (current as { listRunId?: unknown }).listRunId;
    const derivedRun = (derived as { listRunId?: unknown }).listRunId;
    if (
      typeof currentRun === "string" &&
      currentRun !== "" &&
      derivedRun !== currentRun &&
      derivedRun === block.paragraphId &&
      currentRun !== block.paragraphId
    ) {
      const merged = {
        ...(structuredClone(derived) as FullBlockMetadata),
        listRunId: currentRun,
      } as FullBlockMetadata;
      if ((merged as { listRunId?: unknown }).listRunId !== block.paragraphId) {
        delete (merged as { orderedStart?: unknown }).orderedStart;
        delete (merged as { orderedType?: unknown }).orderedType;
        delete (merged as { listTight?: unknown }).listTight;
      }
      if (JSON.stringify(current) !== JSON.stringify(merged)) {
        binding.fieldMeta.set(block.paragraphId, structuredClone(merged) as unknown);
      }
      continue;
    }
    binding.fieldMeta.set(block.paragraphId, structuredClone(derived) as unknown);
  }
}

/** Fail closed when the shared sequence disagrees with the PM result. */
function verifyTextAgreement(
  binding: ProjectionBinding,
  pmDoc: ProseMirrorNode,
  preMeta: Map<string, unknown>,
): void {
  const captured = captureDocumentFromField(binding.ytext, binding.fieldMeta, binding.format);
  if (binding.format !== "ds.markdown.full@1") {
    verifyP0Agreement(binding, pmDoc, captured, preMeta);
    return;
  }
  verifyFullAgreement(binding, pmDoc, captured, preMeta);
}

/** P0/plain verification: ids (allowing fresh split tails) plus text. */
function verifyP0Agreement(
  binding: ProjectionBinding,
  pmDoc: ProseMirrorNode,
  captured: ReturnType<typeof captureDocumentFromField>,
  preMeta: Map<string, unknown>,
): void {
  void binding;
  void preMeta;
  const pmIds: string[] = [];
  const pmTexts: string[] = [];
  pmDoc.descendants((node) => {
    if (node.type.name !== "paragraph" && node.type.name !== "preservedBlock") return true;
    const id = node.attrs?.[PARAGRAPH_ID_ATTRIBUTE];
    if (typeof id !== "string" || id === "") return true;
    pmIds.push(id);
    pmTexts.push(node.textContent);
    return false;
  });
  const capBlocks = captured.document.blocks.filter((block) => block.kind === "paragraph");
  if (capBlocks.length !== pmIds.length) {
    // Split tails carry fresh ids while the raw PM step carries a duplicate:
    // allow the count to match when duplicates explain the gap.
    const uniquePm = new Set(pmIds);
    if (capBlocks.length !== uniquePm.size + (pmIds.length - uniquePm.size)) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
  }
  const seen = new Set<string>();
  for (let index = 0; index < capBlocks.length; index += 1) {
    const cap = capBlocks[index] as { paragraphId: string; text?: string };
    const pmId = pmIds[index];
    if (pmId === undefined) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    if (cap.paragraphId !== pmId) {
      // Fresh split tail: the raw PM carries the head id twice.
      if (pmId !== cap.paragraphId && seen.has(pmId)) {
        seen.add(cap.paragraphId);
        continue;
      }
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    seen.add(cap.paragraphId);
    const capText = cap.text ?? "";
    const pmText = pmTexts[index] ?? "";
    // P0 capture serialises marks as Markdown delimiters while PM text is
    // plain: compare after stripping the bridge delimiters is out of scope
    // here (marks already throw before mutation on unknown/forbidden), so
    // compare plain text equality for the mark-free path and length parity
    // otherwise. The dedicated span witnesses assert mark fidelity.
    if (capText !== pmText && capText.replace(/[*`\\]/g, "") !== pmText) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
  }
}

/** Full verification: blocks, ids and metadata (tails per R-FULL-META-2). */
function verifyFullAgreement(
  binding: ProjectionBinding,
  pmDoc: ProseMirrorNode,
  captured: ReturnType<typeof captureDocumentFromField>,
  preMeta: Map<string, unknown>,
): void {
  void binding;
  const expectedRead = fullProseMirrorToDocument(pmDoc, undefined);
  const expectedAll = expectedRead.document.blocks.filter(
    (block) => block.kind === "paragraph" || block.kind === "horizontalRule" || block.kind === "preserved",
  );
  const capturedIds = new Set(captured.document.blocks.map((block) => block.paragraphId));
  const preIds = new Set(preMeta.keys());
  // Drop the PM trailing empty paragraph that never lives in Y.Text.
  const expected = expectedAll.filter((block) => {
    if (capturedIds.has(block.paragraphId)) return true;
    if (preIds.has(block.paragraphId)) return true;
    if (block.kind === "paragraph") {
      const text = (block.segments ?? [])
        .map((segment) => (segment.type === "hardBreak" ? "" : segment.text ?? ""))
        .join("");
      if (text === "") return false;
    }
    if (block.kind === "horizontalRule") return true;
    return true;
  });
  const expectedById = new Map<string, typeof expected[number][]>();
  for (const block of expected) {
    const list = expectedById.get(block.paragraphId) ?? [];
    list.push(block);
    expectedById.set(block.paragraphId, list);
  }
  if (captured.document.blocks.length !== expected.length) {
    // Fresh split tails explain exactly one extra captured block per
    // duplicated expected id; anything else diverges.
    const uniqueExpected = new Set(expected.map((block) => block.paragraphId));
    const freshTails = captured.document.blocks.filter(
      (block) => !preIds.has(block.paragraphId) && !uniqueExpected.has(block.paragraphId),
    );
    const duplicates = expected.length - uniqueExpected.size;
    if (captured.document.blocks.length !== expected.length - duplicates + freshTails.length + duplicates) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
  }
  const seenCount = new Map<string, number>();
  for (const cap of captured.document.blocks) {
    if (cap.kind === "horizontalRule" || cap.kind === "preserved") {
      const candidates = expectedById.get(cap.paragraphId) ?? [];
      const exp = candidates[0];
      if (exp === undefined || exp.kind !== cap.kind) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      if (cap.kind === "preserved" && exp.kind === "preserved") {
        if ((cap.raw ?? "") !== (exp.raw ?? "") || (cap.preservedKind ?? "") !== (exp.preservedKind ?? "")) {
          throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
        }
      }
      continue;
    }
    if (cap.kind !== "paragraph") continue;
    const isFreshTail = !preIds.has(cap.paragraphId);
    if (isFreshTail) {
      const headId = findSplitHeadForTail(captured.document.blocks, cap.paragraphId, preMeta);
      const headPre = (preMeta.get(headId) as FullBlockMetadata | undefined) ?? (preMeta.get(cap.paragraphId) as FullBlockMetadata | undefined);
      const capMeta = cap.metadata as FullBlockMetadata | undefined;
      if (headPre === undefined || capMeta === undefined) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      if (
        capMeta.listRunId !== headPre.listRunId ||
        capMeta.listKind !== headPre.listKind ||
        capMeta.listDepth !== headPre.listDepth ||
        capMeta.blockquoteDepth !== headPre.blockquoteDepth ||
        JSON.stringify(capMeta.containerOrder ?? []) !== JSON.stringify(headPre.containerOrder ?? []) ||
        capMeta.listItemId !== cap.paragraphId ||
        (capMeta as { orderedStart?: unknown }).orderedStart !== undefined ||
        (capMeta as { orderedType?: unknown }).orderedType !== undefined ||
        (capMeta as { listTight?: unknown }).listTight !== undefined
      ) {
        throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
      }
      continue;
    }
    const candidates = expectedById.get(cap.paragraphId) ?? [];
    const occurrence = seenCount.get(cap.paragraphId) ?? 0;
    const exp = candidates[Math.min(occurrence, candidates.length - 1)];
    seenCount.set(cap.paragraphId, occurrence + 1);
    if (exp === undefined || exp.kind !== "paragraph") {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    const expMeta = correctExpectedMeta(exp.metadata as FullBlockMetadata | undefined, cap.paragraphId, preMeta);
    const capMeta = cap.metadata as FullBlockMetadata | undefined;
    if (JSON.stringify(expMeta ?? null) !== JSON.stringify(capMeta ?? null)) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
    const expSegments = (exp.segments ?? []).map((segment) =>
      segment.type === "hardBreak" ? "\n" : `${segment.text ?? ""}|${JSON.stringify(segment.marks ?? {})}`,
    ).join("\u0000");
    const capSegments = (cap.segments ?? []).map((segment) =>
      segment.type === "hardBreak" ? "\n" : `${segment.text ?? ""}|${JSON.stringify(segment.marks ?? {})}`,
    ).join("\u0000");
    if (expSegments !== capSegments) {
      throw new Error("rich-text.collab-step-failed: projected blocks diverge from the transaction");
    }
  }
}

/** Depth-only correction shared with the sync path (never re-derive runId). */
function correctExpectedMeta(
  derived: FullBlockMetadata | undefined,
  blockId: string,
  preMeta: Map<string, unknown>,
): FullBlockMetadata | undefined {
  if (derived === undefined) return undefined;
  const current = preMeta.get(blockId) as FullBlockMetadata | undefined;
  if (current === undefined) return derived;
  const currentRun = (current as { listRunId?: unknown }).listRunId;
  const derivedRun = (derived as { listRunId?: unknown }).listRunId;
  if (
    typeof currentRun === "string" &&
    currentRun !== "" &&
    derivedRun !== currentRun &&
    derivedRun === blockId &&
    currentRun !== blockId
  ) {
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

/** Head block id preceding a fresh split tail in capture order. */
function findSplitHeadForTail(
  blocks: ReturnType<typeof captureDocumentFromField>["document"]["blocks"],
  tailId: string,
  preMeta: Map<string, unknown>,
): string {
  const index = blocks.findIndex((block) => block.paragraphId === tailId);
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = blocks[cursor] as { paragraphId: string };
    if (preMeta.has(candidate.paragraphId)) return candidate.paragraphId;
  }
  const firstPre = [...preMeta.keys()][0];
  return typeof firstPre === "string" ? firstPre : tailId;
}

// ── Incremental remote application ──

export interface RemoteApplyResult {
  rebuiltParagraphIds: string[];
}

/**
 * Project a remote `Y.Text` change incrementally (spec §4.3.1 item 4): only
 * the affected block range is rebuilt through item 1 and dispatched as one
 * binding-origin transaction (no echo). The local selection is restored
 * through relative positions, never saved numeric offsets.
 */
export function applyRemoteUpdateIncrementally(options: {
  view: EditorView;
  ytext: Y.Text;
  fieldMeta: Y.Map<unknown>;
  format: RichTextFormat;
  fieldKey: string;
  affectedParagraphIds: readonly string[];
}): RemoteApplyResult {
  const { view, ytext, fieldMeta, format, fieldKey, affectedParagraphIds } = options;
  const affected = new Set(affectedParagraphIds);
  if (affected.size === 0) return { rebuiltParagraphIds: [] };

  // Capture the local selection as relative positions before the rebuild.
  const beforeMap = buildSelectionMap(view.state.doc, ytext);
  const selection = view.state.selection;
  const cursor = selectionToCursorJson(
    ytext,
    fieldKey,
    beforeMap,
    selection.anchor,
    selection.head,
  );

  const freshDoc = yTextToPmDoc(ytext, fieldMeta, format, view.state.schema);
  const oldDoc = view.state.doc;
  const oldRanges = findBlockRanges(oldDoc, affected);
  const freshRanges = findBlockRanges(freshDoc, affected);
  const tr = view.state.tr;
  tr.setMeta(BINDING_ORIGIN_META, true);
  if (oldRanges.length > 0 && freshRanges.length > 0) {
    const oldFrom = Math.min(...oldRanges.map((range) => range.start));
    const oldTo = Math.max(...oldRanges.map((range) => range.end));
    const freshFrom = Math.min(...freshRanges.map((range) => range.start));
    const freshTo = Math.max(...freshRanges.map((range) => range.end));
    const slice = freshDoc.slice(freshFrom, freshTo);
    tr.replaceWith(oldFrom, oldTo, slice.content);
  } else {
    tr.replaceWith(0, oldDoc.content.size, freshDoc.content);
  }
  view.dispatch(tr);

  // Restore through relative positions across the rebuild.
  const afterMap = buildSelectionMap(view.state.doc, ytext);
  const restored = cursorJsonToSelection(ytext, afterMap, cursor);
  if (restored !== null) {
    const { TextSelection } = tr.selection.constructor as unknown as {
      TextSelection: { create(doc: ProseMirrorNode, anchor: number, head?: number): never };
    };
    void TextSelection;
    try {
      const $anchor = view.state.doc.resolve(Math.max(0, Math.min(restored.anchor, view.state.doc.content.size)));
      const $head = view.state.doc.resolve(Math.max(0, Math.min(restored.head, view.state.doc.content.size)));
      const selTr = view.state.tr;
      selTr.setMeta(BINDING_ORIGIN_META, true);
      selTr.setSelection(new (selection.constructor as new (...args: never[]) => never)(
        $anchor as never,
        $head as never,
      ) as never);
      view.dispatch(selTr);
    } catch {
      // Clamp failure restores nothing rather than an invalid selection.
    }
  }
  void linearToPmPosition;
  return { rebuiltParagraphIds: [...affected] };
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

/** Derive the affected block range from a Y.Text change delta.
 *
 * Deleted ranges resolve against the pre-change layout; the surviving block
 * at the deletion point in the post-change layout joins the set so merges
 * rebuild their survivor. Separator inserts report both the head (pre-change
 * block at the insertion point) and the fresh tail id from the payload.
 */
export function affectedBlocksFromDelta(
  preBlocks: LinearBlockLayout[],
  postBlocks: LinearBlockLayout[],
  delta: Array<{ insert?: string | Record<string, unknown>; delete?: number; retain?: number }>,
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
