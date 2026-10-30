// Full-profile document ↔ ProseMirror conversion for the "./editor" entry
// (CL-2F §4.3.2, R-FULL-META-1/2, R-FULL-CODE-1, R-FULL-HR-1, R-FULL-MARK-1).
//
// Controlled mapping only (no Yjs, no fieldmeta): the ProseMirror document is
// built from the structured `RichTextDocument` at mount, and capture reads
// the live ProseMirror document back into the same shapes. List and quote
// wrappers are derived views over flat per-block metadata; run identities
// and opener-only values follow R-FULL-META-1/2.

import type { JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { FullBlockMetadata } from "./collaboration.js";
import { isAllowedHref } from "./collaboration.js";
import type {
  FullInlineSegment,
  RichTextBlock,
  RichTextDocument,
} from "./model.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
} from "./editor-full-markdown.js";

/** Read result of the full capture: the document plus flagged (preserved)
    paragraphs for the composer send gate. */
export interface FullDocumentRead {
  document: RichTextDocument;
  nonRepresentableParagraphIds: string[];
}

function quoteDepthOf(block: RichTextBlock): number {
  if (block.kind === "horizontalRule") return block.hrMetadata?.blockquoteDepth ?? 0;
  if (block.kind === "preserved") return 0;
  return block.metadata?.blockquoteDepth ?? 0;
}

function orderOf(block: RichTextBlock): readonly ("quote" | "list")[] {
  if (block.kind === "horizontalRule") return block.hrMetadata?.containerOrder ?? [];
  if (block.kind === "preserved") return [];
  return block.metadata?.containerOrder ?? [];
}

function listDepthOf(block: RichTextBlock): number {
  if (block.kind !== "paragraph") return 0;
  return block.metadata?.listKind !== "none" ? (block.metadata?.listDepth ?? 0) : -1;
}

function isListBlock(block: RichTextBlock): boolean {
  return block.kind === "paragraph" && block.metadata?.listKind !== "none";
}

function runIdOf(block: RichTextBlock): string | null {
  if (block.kind !== "paragraph") return null;
  return block.metadata?.listRunId ?? null;
}

function itemIdOf(block: RichTextBlock): string {
  if (block.kind !== "paragraph") return block.paragraphId;
  return block.metadata?.listItemId ?? block.paragraphId;
}

function headingLevelOf(block: RichTextBlock): 1 | 2 | 3 | 4 | 5 | 6 {
  if (block.kind === "paragraph" && block.metadata?.blockKind === "heading") {
    return (block.metadata as { headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 }).headingLevel ?? 1;
  }
  return 1;
}

function codeLanguageOf(block: RichTextBlock): string | null {
  if (block.kind === "paragraph" && block.metadata?.blockKind === "codeBlock") {
    return (block.metadata as { codeLanguage?: string | null }).codeLanguage ?? null;
  }
  return null;
}

function isCodeBlock(block: RichTextBlock): boolean {
  return block.kind === "paragraph" && block.metadata?.blockKind === "codeBlock";
}

/** Inline segments to ProseMirror inline JSON. Code text joins with LF and
    carries no marks (R-FULL-CODE-1); prose hard breaks become hardBreak. */
function segmentsToInline(
  segments: readonly FullInlineSegment[],
  code: boolean,
): JSONContent[] {
  if (code) {
    const text = segments
      .map((segment) => (segment.type === "hardBreak" ? "\n" : segment.text))
      .join("");
    return text === "" ? [] : [{ type: "text", text }];
  }
  const content: JSONContent[] = [];
  for (const segment of segments) {
    if (segment.type === "hardBreak") {
      content.push({ type: "hardBreak" });
      continue;
    }
    const marks: { type: string; attrs?: Record<string, unknown> }[] = [];
    if (segment.marks.bold === true) marks.push({ type: "bold" });
    if (segment.marks.italic === true) marks.push({ type: "italic" });
    if (segment.marks.code === true) marks.push({ type: "code" });
    if (segment.marks.strike === true) marks.push({ type: "strike" });
    if (segment.marks.underline === true) marks.push({ type: "underline" });
    if (typeof segment.marks.link === "string") {
      const attrs: Record<string, unknown> = { href: segment.marks.link };
      if (typeof segment.marks.linkTitle === "string") {
        attrs["title"] = segment.marks.linkTitle;
      }
      marks.push({ type: "link", attrs });
    }
    const node: JSONContent = { type: "text", text: segment.text };
    if (marks.length > 0) node["marks"] = marks;
    content.push(node);
  }
  return content;
}

function textBlockToPm(
  block: RichTextBlock,
  allocateFresh: () => string,
): JSONContent {
  const segments = block.segments ?? [];
  void allocateFresh;
  if (isCodeBlock(block)) {
    return {
      type: "codeBlock",
      attrs: {
        [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
        language: codeLanguageOf(block),
      },
      content: segmentsToInline(segments, true),
    };
  }
  if (block.metadata?.blockKind === "heading") {
    return {
      type: "heading",
      attrs: {
        [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
        level: headingLevelOf(block),
      },
      content: segmentsToInline(segments, false),
    };
  }
  return {
    type: "paragraph",
    attrs: { [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId },
    content: segmentsToInline(segments, false),
  };
}

/** Build one list node's children from consecutive same-run blocks. */
function buildListRun(
  runBlocks: RichTextBlock[],
  kind: "bullet" | "ordered",
  allocateFresh: () => string,
): JSONContent {
  const opener = runBlocks[0] as RichTextBlock;
  const openerMeta = opener.metadata as FullBlockMetadata | undefined;
  const attrs: Record<string, unknown> = {
    listRunId: openerMeta?.listRunId ?? opener.paragraphId,
    listTight: openerMeta?.listTight ?? true,
  };
  if (kind === "ordered") {
    attrs["start"] = openerMeta?.orderedStart ?? 1;
    if (openerMeta?.orderedType !== undefined) attrs["type"] = openerMeta.orderedType;
  }
  const runDepth = openerMeta?.listDepth ?? 0;
  const items: JSONContent[] = [];
  let currentItemBlocks: RichTextBlock[] = [];
  const flushItem = (): void => {
    if (currentItemBlocks.length === 0) return;
    items.push(buildListItem(currentItemBlocks, runDepth, allocateFresh));
    currentItemBlocks = [];
  };
  for (const block of runBlocks) {
    const depth = block.kind === "paragraph" ? (block.metadata?.listDepth ?? runDepth) : runDepth;
    if (depth === runDepth && itemIdOf(block) !== (currentItemBlocks.length > 0 ? itemIdOf(currentItemBlocks[0] as RichTextBlock) : null)) {
      flushItem();
      currentItemBlocks = [block];
      continue;
    }
    if (depth === runDepth) {
      if (currentItemBlocks.length === 0) currentItemBlocks = [block];
      else currentItemBlocks.push(block);
      continue;
    }
    // Deeper block: nested run belonging to the current item. It stays in
    // this item's block list and becomes a nested list node in
    // `attachNestedLists`.
    if (currentItemBlocks.length === 0) {
      // Orphan depth jump with no parent item: normalize to this run.
      const normalized: RichTextBlock =
        block.kind === "paragraph" && block.metadata !== undefined
          ? {
              ...block,
              metadata: { ...block.metadata, listDepth: runDepth },
            }
          : block;
      currentItemBlocks = [normalized];
      continue;
    }
    currentItemBlocks.push(block);
  }
  flushItem();
  // Second pass: split items' deeper blocks into nested list nodes.
  const itemNodes: JSONContent[] = [];
  for (const item of items) {
    itemNodes.push(attachNestedLists(item, allocateFresh));
  }
  return {
    type: kind === "bullet" ? "bulletList" : "orderedList",
    attrs,
    content: itemNodes,
  };
}

/** Build one listItem node; deeper blocks stay flat here and are nested by
    `attachNestedLists`. */
function buildListItem(
  itemBlocks: RichTextBlock[],
  runDepth: number,
  allocateFresh: () => string,
): JSONContent {
  const content: JSONContent[] = [];
  for (const block of itemBlocks) {
    const depth = block.kind === "paragraph" ? (block.metadata?.listDepth ?? runDepth) : runDepth;
    if (depth !== runDepth) {
      content.push({ type: "__nested__", attrs: {}, nestedBlock: block } as unknown as JSONContent);
      continue;
    }
    if (block.kind === "horizontalRule") {
      content.push({
        type: "horizontalRule",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId },
      });
      continue;
    }
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
    content.push(textBlockToPm(block, allocateFresh));
  }
  if (content.length === 0 || (content[0] as JSONContent).type !== "paragraph") {
    content.unshift({
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: allocateFresh() },
    });
  }
  return { type: "listItem", content };
}

/** Replace `__nested__` placeholders with real nested list nodes grouped by
    run, attached inside their parent item. */
function attachNestedLists(item: JSONContent, allocateFresh: () => string): JSONContent {
  const content = (item.content ?? []) as JSONContent[];
  if (!content.some((entry) => entry.type === "__nested__")) return item;
  const rebuilt: JSONContent[] = [];
  let run: { kind: "bullet" | "ordered"; blocks: RichTextBlock[] } | null = null;
  const flushRun = (): void => {
    if (run === null) return;
    rebuilt.push(buildListRun(run.blocks, run.kind, allocateFresh));
    run = null;
  };
  for (const entry of content) {
    if (entry.type !== "__nested__") {
      flushRun();
      rebuilt.push(entry);
      continue;
    }
    const block = (entry as unknown as { nestedBlock: RichTextBlock }).nestedBlock;
    const kind = block.metadata?.listKind === "ordered" ? "ordered" : "bullet";
    if (run !== null && run.kind !== kind) flushRun();
    if (run === null) run = { kind, blocks: [] };
    run.blocks.push(block);
  }
  flushRun();
  return { ...item, content: rebuilt };
}

/** Build top-level ProseMirror content from flat full blocks. */
function buildTopLevel(
  blocks: readonly RichTextBlock[],
  allocateFresh: () => string,
): JSONContent[] {
  let index = 0;
  // Iterative quote grouping that preserves sibling order.
  const top: JSONContent[] = [];
  while (index < blocks.length) {
    const block = blocks[index] as RichTextBlock;
    const quoteDepth = quoteDepthOf(block);
    if (quoteDepth > 0) {
      const run: RichTextBlock[] = [block];
      index += 1;
      while (index < blocks.length && quoteDepthOf(blocks[index] as RichTextBlock) > 0) {
        run.push(blocks[index] as RichTextBlock);
        index += 1;
      }
      top.push(buildQuoteGroup(run, allocateFresh));
      continue;
    }
    if (isListBlock(block)) {
      const runBlocks: RichTextBlock[] = [block];
      const runId = runIdOf(block);
      const runDepth = block.metadata?.listDepth ?? 0;
      const listKind = block.metadata?.listKind ?? "bullet";
      index += 1;
      while (index < blocks.length) {
        const next = blocks[index] as RichTextBlock;
        if (!isListBlock(next)) break;
        if (quoteDepthOf(next) !== 0) break;
        const nextDepth = next.metadata?.listDepth ?? 0;
        // Deeper blocks nest inside the current run's last item; only a
        // same-or-shallower block with another run id closes the run.
        if (nextDepth <= runDepth && runIdOf(next) !== runId) break;
        runBlocks.push(next);
        index += 1;
      }
      top.push(buildListRun(runBlocks, listKind === "ordered" ? "ordered" : "bullet", allocateFresh));
      continue;
    }
    if (block.kind === "horizontalRule") {
      top.push({
        type: "horizontalRule",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId },
      });
      index += 1;
      continue;
    }
    if (block.kind === "preserved") {
      top.push({
        type: "preservedBlock",
        attrs: {
          [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
          raw: block.raw ?? "",
          preservedKind: block.preservedKind ?? "",
        },
      });
      index += 1;
      continue;
    }
    top.push(textBlockToPm(block, allocateFresh));
    index += 1;
  }
  return top;
}

/** Build nested blockquotes for a consecutive quoted run. */
function buildQuoteGroup(run: RichTextBlock[], allocateFresh: () => string): JSONContent {
  const depth = Math.min(...run.map(quoteDepthOf));
  const inner = run.map((block) => stripQuoteLevel(block, depth));
  const children = buildTopLevel(inner, allocateFresh);
  let node: JSONContent = { type: "blockquote", content: children };
  for (let level = 1; level < depth; level += 1) {
    node = { type: "blockquote", content: [node] };
  }
  return node;
}

function stripQuoteLevel(block: RichTextBlock, levels: number): RichTextBlock {
  if (block.kind === "horizontalRule" && block.hrMetadata !== undefined) {
    return {
      ...block,
      hrMetadata: {
        ...block.hrMetadata,
        blockquoteDepth: Math.max(0, block.hrMetadata.blockquoteDepth - levels),
        containerOrder: block.hrMetadata.containerOrder.filter((entry) => entry !== "quote" || levels === 0),
      },
    };
  }
  if (block.kind === "paragraph" && block.metadata !== undefined) {
    return {
      ...block,
      metadata: {
        ...block.metadata,
        blockquoteDepth: Math.max(0, block.metadata.blockquoteDepth - levels),
      },
    };
  }
  return block;
}

/** Build the ProseMirror document JSON for a full document. */
export function fullDocumentToProseMirror(
  document: RichTextDocument,
  allocateFresh: () => string,
): JSONContent {
  return {
    type: "doc",
    content: buildTopLevel(document.blocks, allocateFresh),
  };
}

/** Inline JSON to full segments. Code parents join text with LF (their marks
    are display-hidden per R-FULL-CODE-1 and never reach the capture). */
function inlineToSegments(content: ProseMirrorNode | null, code: boolean): FullInlineSegment[] {
  const segments: FullInlineSegment[] = [];
  if (content === null) return segments;
  content.forEach((child) => {
    if (child.type.name === "hardBreak") {
      segments.push({ type: "hardBreak" });
      return;
    }
    if (!child.isText) return;
    if (code) {
      for (const line of child.textContent.split("\n")) {
        if (segments.length > 0) segments.push({ type: "hardBreak" });
        if (line !== "") segments.push({ type: "text", text: line, marks: {} });
      }
      return;
    }
    const marks: FullInlineSegment & { type: "text" } = {
      type: "text",
      text: child.textContent,
      marks: {},
    };
    const target = marks.marks as Record<string, unknown>;
    for (const mark of child.marks) {
      if (mark.type.name === "bold") target["bold"] = true;
      else if (mark.type.name === "italic") target["italic"] = true;
      else if (mark.type.name === "code") target["code"] = true;
      else if (mark.type.name === "strike") target["strike"] = true;
      else if (mark.type.name === "underline") target["underline"] = true;
      else if (mark.type.name === "link") {
        const href = mark.attrs["href"];
        if (typeof href === "string" && href !== "" && isAllowedHref(href)) {
          target["link"] = href;
          const title = mark.attrs["title"];
          if (typeof title === "string" && title !== "") target["linkTitle"] = title;
        }
      }
    }
    const last = segments[segments.length - 1];
    if (
      last !== undefined &&
      last.type === "text" &&
      JSON.stringify(last.marks) === JSON.stringify(marks.marks)
    ) {
      last.text += marks.text;
    } else {
      segments.push(marks);
    }
  });
  return segments;
}

interface CaptureFrame {
  quoteDepth: number;
  containerOrder: readonly ("quote" | "list")[];
  listKind: "none" | "bullet" | "ordered";
  listDepth: number;
  listRunId: string | null;
  listItemId: string | null;
  runTight: boolean;
  orderedStart: number | null;
  orderedType: "1" | "a" | "A" | "i" | "I" | null;
  runSourceId: string | null;
}

function frameMetadata(
  frame: CaptureFrame,
  blockKind: "paragraph" | "heading" | "codeBlock",
  paragraphId: string,
  extra?: { headingLevel?: 1 | 2 | 3 | 4 | 5 | 6; codeLanguage?: string | null },
): FullBlockMetadata {
  const metadata = {
    blockKind,
    listKind: frame.listKind,
    listDepth: frame.listDepth,
    listItemId: frame.listItemId ?? undefined,
    listRunId: frame.listRunId ?? undefined,
    blockquoteDepth: frame.quoteDepth,
    containerOrder: [...frame.containerOrder],
  } as FullBlockMetadata;
  if (blockKind === "heading") {
    (metadata as { headingLevel: 1 | 2 | 3 | 4 | 5 | 6 }).headingLevel =
      extra?.headingLevel ?? 1;
  }
  if (blockKind === "codeBlock") {
    (metadata as { codeLanguage: string | null }).codeLanguage =
      extra?.codeLanguage ?? null;
  }
  // Opener-only run values (R-FULL-META-1): present solely on the run source.
  if (frame.listKind === "ordered" && paragraphId === frame.runSourceId) {
    metadata.orderedStart = frame.orderedStart ?? 1;
    if (frame.orderedType !== null) metadata.orderedType = frame.orderedType;
    metadata.listTight = frame.runTight;
  } else if (frame.listKind === "bullet" && paragraphId === frame.runSourceId) {
    metadata.listTight = frame.runTight;
  }
  return metadata;
}

/** Read the live ProseMirror document back into a full capture. */
export function fullProseMirrorToDocument(doc: ProseMirrorNode): FullDocumentRead {
  const blocks: RichTextBlock[] = [];
  const nonRepresentableParagraphIds: string[] = [];

  const readInlineParent = (
    node: ProseMirrorNode,
    frame: CaptureFrame,
    blockKind: "paragraph" | "heading" | "codeBlock",
    extra?: { headingLevel?: 1 | 2 | 3 | 4 | 5 | 6; codeLanguage?: string | null },
  ): void => {
    const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
    const paragraphId = typeof id === "string" && id !== "" ? id : null;
    if (paragraphId === null) return;
    blocks.push({
      paragraphId,
      kind: "paragraph",
      metadata: frameMetadata(frame, blockKind, paragraphId, extra),
      segments: inlineToSegments(node, blockKind === "codeBlock"),
    });
  };

  const readChildren = (parent: ProseMirrorNode, frame: CaptureFrame): void => {
    parent.forEach((node) => {
      const name = node.type.name;
      if (name === "paragraph") {
        readInlineParent(node, frame, "paragraph");
        return;
      }
      if (name === "heading") {
        const level = node.attrs["level"];
        readInlineParent(node, frame, "heading", {
          headingLevel:
            level === 2 || level === 3 || level === 4 || level === 5 || level === 6
              ? level
              : 1,
        });
        return;
      }
      if (name === "codeBlock") {
        const language = node.attrs["language"];
        readInlineParent(node, frame, "codeBlock", {
          codeLanguage: typeof language === "string" ? language : null,
        });
        return;
      }
      if (name === "horizontalRule") {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && id !== "") {
          const hrOrder: ("quote" | "list")[] = [...frame.containerOrder];
          blocks.push({
            paragraphId: id,
            kind: "horizontalRule",
            hrMetadata: {
              listKind: frame.listKind,
              listDepth: frame.listDepth,
              listItemId: frame.listItemId ?? undefined,
              listRunId: frame.listRunId ?? undefined,
              blockquoteDepth: frame.quoteDepth,
              containerOrder: hrOrder,
            },
          });
        }
        return;
      }
      if (name === "blockquote") {
        const order: ("quote" | "list")[] = frame.containerOrder.includes("quote")
          ? [...frame.containerOrder]
          : ["quote", ...frame.containerOrder];
        readChildren(node, { ...frame, quoteDepth: frame.quoteDepth + 1, containerOrder: order });
        return;
      }
      if (name === "bulletList" || name === "orderedList") {
        readList(node, frame, name === "orderedList" ? "ordered" : "bullet");
        return;
      }
      if (name === "preservedBlock") {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id !== "string" || id === "") return;
        const raw = node.attrs["raw"];
        const kind = node.attrs["preservedKind"];
        const block: RichTextBlock = { paragraphId: id, kind: "preserved" };
        if (typeof raw === "string") block.raw = raw;
        if (typeof kind === "string") block.preservedKind = kind;
        blocks.push(block);
        nonRepresentableParagraphIds.push(id);
        return;
      }
      if (name === "listItem") {
        // A bare item outside a list (should not occur): read contents plain.
        readChildren(node, frame);
      }
    });
  };

  const readList = (
    list: ProseMirrorNode,
    frame: CaptureFrame,
    kind: "bullet" | "ordered",
  ): void => {
    // Run identity: the wrapper attribute, else the first descendant block.
    let runId = typeof list.attrs["listRunId"] === "string" && list.attrs["listRunId"] !== ""
      ? (list.attrs["listRunId"] as string)
      : null;
    let firstId: string | null = null;
    list.descendants((child) => {
      if (firstId !== null) return false;
      if (
        child.type.name === "paragraph" ||
        child.type.name === "heading" ||
        child.type.name === "codeBlock"
      ) {
        const id = child.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && id !== "") firstId = id;
        return false;
      }
      return true;
    });
    if (runId === null) runId = firstId;
    if (runId === null) return;
    const tight = list.attrs["listTight"] !== false;
    const start = typeof list.attrs["start"] === "number" ? (list.attrs["start"] as number) : 1;
    const rawType = list.attrs["type"];
    const orderedType =
      rawType === "a" || rawType === "A" || rawType === "i" || rawType === "I" ? rawType : null;
    const order: ("quote" | "list")[] = frame.containerOrder.includes("list")
      ? [...frame.containerOrder]
      : [...frame.containerOrder, "list"];
    const listFrame: CaptureFrame = {
      ...frame,
      listKind: kind,
      listDepth: frame.listDepth + (frame.listKind === "none" ? 0 : 1),
      listRunId: runId,
      listItemId: null,
      runTight: tight,
      orderedStart: kind === "ordered" ? start : null,
      orderedType: kind === "ordered" ? orderedType : null,
      runSourceId: firstId,
      containerOrder: order,
    };
    list.forEach((item) => {
      if (item.type.name !== "listItem") {
        readChildren(item, listFrame);
        return;
      }
      // The item identity is its first text block (R-FULL-META-1).
      let itemId: string | null = null;
      item.forEach((child) => {
        if (itemId !== null) return;
        if (
          child.type.name === "paragraph" ||
          child.type.name === "heading" ||
          child.type.name === "codeBlock"
        ) {
          const id = child.attrs[PARAGRAPH_ID_ATTRIBUTE];
          if (typeof id === "string" && id !== "") itemId = id;
        }
      });
      const itemFrame: CaptureFrame = { ...listFrame, listItemId: itemId };
      readChildren(item, itemFrame);
    });
  };

  readChildren(doc, {
    quoteDepth: 0,
    containerOrder: [],
    listKind: "none",
    listDepth: 0,
    listRunId: null,
    listItemId: null,
    runTight: true,
    orderedStart: null,
    orderedType: null,
    runSourceId: null,
  });
  return {
    document: { format: "ds.markdown.full@1", blocks },
    nonRepresentableParagraphIds,
  };
}

/** Materialize canonical defaults for a captured full text block whose source
    omitted wrapper metadata (§4.3.2 capture data, not a shared repair). */
export function materializeFullDefaults(block: RichTextBlock): RichTextBlock {
  if (block.kind === "horizontalRule") {
    return {
      ...block,
      hrMetadata: block.hrMetadata ?? canonicalHrDefaults(),
    };
  }
  if (block.kind === "paragraph" && block.segments !== undefined) {
    return {
      ...block,
      metadata: block.metadata ?? canonicalPlainMetadata(),
    };
  }
  return block;
}
