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
  RetainedRunMetadata,
  RichTextBlock,
  RichTextDocument,
} from "./model.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
} from "./editor-full-markdown.js";

/** Read result of the full capture: the document plus flagged (preserved)
    paragraphs for the composer send gate. `retainedRunMetadata` carries the
    still-referenced run-source records whose separators are gone
    (R-FULL-META-2): keyed by `listRunId`, with no entry for a live source. */
export interface FullDocumentRead {
  document: RichTextDocument;
  nonRepresentableParagraphIds: string[];
  retainedRunMetadata: RetainedRunMetadata;
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

/** List depth for projection grouping (review 2 to-fix 1): a
    horizontal rule carries its wrapper metadata on `hrMetadata`, never on
    `metadata`, so grouping must read it there — otherwise a rule inside a
    nested list or quote projects outside its wrappers. */
function projectionListDepth(block: RichTextBlock, fallback: number): number {
  if (block.kind === "horizontalRule") {
    const hr = block.hrMetadata;
    if (hr !== undefined && hr.listKind !== "none") return hr.listDepth;
    return fallback;
  }
  if (block.kind !== "paragraph") return fallback;
  return block.metadata?.listDepth ?? fallback;
}

function isListBlock(block: RichTextBlock): boolean {
  // Absent metadata is the canonical plain default (spec §4.3.2): a
  // metadata-free paragraph is never listed (`undefined !== "none"` must not
  // classify it as a list member).
  return (
    block.kind === "paragraph" &&
    block.metadata?.listKind !== undefined &&
    block.metadata.listKind !== "none"
  );
}

/** The outermost wrapper of one block: the first entry of its ordered
    container stack when the depths support it, else the depth-derived
    fallback (quote outer, matching the bridge's own `["quote", "list"]`
    shape for quote-wrapped lists). Stale orders never invent a wrapper the
    depths deny. */
function effectiveOuter(block: RichTextBlock): "quote" | "list" | null {
  const order = orderOf(block);
  const quoteDepth = quoteDepthOf(block);
  // A list-contained horizontal rule carries the run in its wrapper
  // metadata even though it is not a list block itself.
  const listed =
    isListBlock(block) ||
    (block.kind === "horizontalRule" &&
      block.hrMetadata?.listKind !== undefined &&
      block.hrMetadata.listKind !== "none");
  if (order.length > 0) {
    const first = order[0];
    if (first === "quote" && quoteDepth > 0) return "quote";
    if (first === "list" && listed) return "list";
  }
  if (quoteDepth > 0) return "quote";
  if (listed) return "list";
  return null;
}

function runIdOf(block: RichTextBlock): string | null {
  if (block.kind === "horizontalRule") return block.hrMetadata?.listRunId ?? null;
  if (block.kind !== "paragraph") return null;
  return block.metadata?.listRunId ?? null;
}

function itemIdOf(block: RichTextBlock): string {
  // A list-contained rule joins its named item instead of opening a
  // paragraph-less item of its own.
  if (block.kind === "horizontalRule") {
    return block.hrMetadata?.listItemId ?? block.paragraphId;
  }
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

/** The sole run-value source (R-FULL-META-1/2): the live opener record when
    a block still carries the run id, else the retained source record, else
    nothing (canonical defaults apply and capture flags the run through its
    retained map). Deleting the opener never transfers start/type/tight onto
    a surviving member. */
function runSourceRecord(
  runBlocks: readonly RichTextBlock[],
  runId: string,
  retained: RetainedRunMetadata,
): FullBlockMetadata | undefined {
  for (const block of runBlocks) {
    if (block.kind === "paragraph" && block.paragraphId === runId) {
      return block.metadata as FullBlockMetadata | undefined;
    }
  }
  return retained[runId];
}

/** Build one list node's children from consecutive same-run blocks. */
function buildListRun(
  runBlocks: RichTextBlock[],
  kind: "bullet" | "ordered",
  allocateFresh: () => string,
  retained: RetainedRunMetadata,
): JSONContent {
  const opener = runBlocks[0] as RichTextBlock;
  const openerMeta = opener.metadata as FullBlockMetadata | undefined;
  // The stable run id: the source opener's id when known, else the first
  // block's id (a pasted `""` run id normalizes the same way). Members never
  // donate run values.
  const runId =
    openerMeta?.listRunId !== undefined && openerMeta.listRunId !== ""
      ? openerMeta.listRunId
      : opener.paragraphId;
  const source = runSourceRecord(runBlocks, runId, retained);
  const attrs: Record<string, unknown> = {
    listRunId: runId,
    listTight: source?.listTight ?? true,
  };
  if (kind === "ordered") {
    attrs["start"] = source?.orderedStart ?? 1;
    if (source?.orderedType !== undefined) attrs["type"] = source.orderedType;
  }
  // The run base depth is the shallowest member depth, never the deleted
  // opener's: surviving members keep their own depths through promotion.
  let runDepth = 0;
  let firstDepth = true;
  for (const block of runBlocks) {
    if (block.kind !== "paragraph") continue;
    const depth = block.metadata?.listDepth ?? 0;
    if (firstDepth || depth < runDepth) {
      runDepth = depth;
      firstDepth = false;
    }
  }
  const items: JSONContent[] = [];
  let currentItemBlocks: RichTextBlock[] = [];
  const flushItem = (): void => {
    if (currentItemBlocks.length === 0) return;
    items.push(buildListItem(currentItemBlocks, runDepth, allocateFresh));
    currentItemBlocks = [];
  };
  for (const block of runBlocks) {
    const depth = projectionListDepth(block, runDepth);
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
    itemNodes.push(attachNestedLists(item, allocateFresh, retained));
  }
  return {
    type: kind === "bullet" ? "bulletList" : "orderedList",
    attrs,
    content: itemNodes,
  };
}

/** Build one non-quoted, same-depth item child node. */
function buildItemSingle(
  block: RichTextBlock,
  allocateFresh: () => string,
): JSONContent {
  if (block.kind === "horizontalRule") {
    return {
      type: "horizontalRule",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId },
    };
  }
  if (block.kind === "preserved") {
    return {
      type: "preservedBlock",
      attrs: {
        [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
        raw: block.raw ?? "",
        preservedKind: block.preservedKind ?? "",
      },
    };
  }
  return textBlockToPm(block, allocateFresh);
}

/** Build the content of one list item: same-depth text/HR/preserved nodes,
    quote runs nested as blockquote nodes (a citation inside a list item
    stays inside that item), deeper blocks deferred to `attachNestedLists`. */
function buildItemContent(
  blocks: readonly RichTextBlock[],
  runDepth: number,
  allocateFresh: () => string,
): JSONContent[] {
  const content: JSONContent[] = [];
  let quoteRun: RichTextBlock[] = [];
  const flushQuote = (): void => {
    if (quoteRun.length === 0) return;
    content.push(buildItemQuoteRun(quoteRun, runDepth, allocateFresh));
    quoteRun = [];
  };
  for (const block of blocks) {
    const depth = projectionListDepth(block, runDepth);
    if (depth !== runDepth) {
      flushQuote();
      content.push({ type: "__nested__", attrs: {}, nestedBlock: block } as unknown as JSONContent);
      continue;
    }
    if (
      block.kind === "paragraph" &&
      quoteDepthOf(block) > 0 &&
      effectiveOuter(block) === "list"
    ) {
      quoteRun.push(block);
      continue;
    }
    flushQuote();
    content.push(buildItemSingle(block, allocateFresh));
  }
  flushQuote();
  return content;
}

/** Build one blockquote node inside a list item from consecutive quoted
    same-depth blocks, recursing for deeper quote levels. */
function buildItemQuoteRun(
  run: RichTextBlock[],
  runDepth: number,
  allocateFresh: () => string,
): JSONContent {
  const minimum = Math.min(...run.map(quoteDepthOf));
  const inner = run.map((block) => stripQuoteLevel(block, minimum));
  const children = buildItemContent(inner, runDepth, allocateFresh);
  let node: JSONContent = { type: "blockquote", content: children };
  for (let level = 1; level < minimum; level += 1) {
    node = { type: "blockquote", content: [node] };
  }
  return node;
}

/** Build one listItem node; deeper blocks stay flat here and are nested by
    `attachNestedLists`. */
function buildListItem(
  itemBlocks: RichTextBlock[],
  runDepth: number,
  allocateFresh: () => string,
): JSONContent {
  const content = buildItemContent(itemBlocks, runDepth, allocateFresh);
  if (content.length === 0 || (content[0] as JSONContent).type !== "paragraph") {
    content.unshift({
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: allocateFresh() },
    });
  }
  return { type: "listItem", content };
}

/** Build a non-list nested placeholder flat (defensive: valid records only
    nest lists deeper; a stray deeper text/HR block keeps its content
    instead of being forced into a list). */
function buildNestedNonList(
  block: RichTextBlock,
  allocateFresh: () => string,
): JSONContent {
  return buildItemSingle(block, allocateFresh);
}

/** Replace `__nested__` placeholders with real nested list nodes grouped by
    run, attached inside their parent item. */
function attachNestedLists(
  item: JSONContent,
  allocateFresh: () => string,
  retained: RetainedRunMetadata,
): JSONContent {
  const content = (item.content ?? []) as JSONContent[];
  if (!content.some((entry) => entry.type === "__nested__")) return item;
  const rebuilt: JSONContent[] = [];
  let run: { kind: "bullet" | "ordered"; blocks: RichTextBlock[] } | null = null;
  const flushRun = (): void => {
    if (run === null) return;
    rebuilt.push(buildListRun(run.blocks, run.kind, allocateFresh, retained));
    run = null;
  };
  for (const entry of content) {
    if (entry.type !== "__nested__") {
      flushRun();
      rebuilt.push(entry);
      continue;
    }
    const block = (entry as unknown as { nestedBlock: RichTextBlock }).nestedBlock;
    if (!isListBlock(block)) {
      flushRun();
      rebuilt.push(buildNestedNonList(block, allocateFresh));
      continue;
    }
    const kind = block.metadata?.listKind === "ordered" ? "ordered" : "bullet";
    if (run !== null && run.kind !== kind) flushRun();
    if (run === null) run = { kind, blocks: [] };
    run.blocks.push(block);
  }
  flushRun();
  return { ...item, content: rebuilt };
}

/** Build top-level ProseMirror content from flat full blocks. The dispatch
    follows each block's ordered wrapper stack: quote-outer blocks group into
    quote runs (which rebuild inner lists), list-outer blocks — including
    list-contained rules — group into list runs. A citation inside a list
    item therefore stays inside that item. */
function buildTopLevel(
  blocks: readonly RichTextBlock[],
  allocateFresh: () => string,
  retained: RetainedRunMetadata,
): JSONContent[] {
  let index = 0;
  // Iterative wrapper grouping that preserves sibling order.
  const top: JSONContent[] = [];
  while (index < blocks.length) {
    const block = blocks[index] as RichTextBlock;
    const outer = effectiveOuter(block);
    if (outer === "quote") {
      const run: RichTextBlock[] = [block];
      index += 1;
      while (index < blocks.length && effectiveOuter(blocks[index] as RichTextBlock) === "quote") {
        run.push(blocks[index] as RichTextBlock);
        index += 1;
      }
      top.push(buildQuoteGroup(run, allocateFresh, retained));
      continue;
    }
    if (outer === "list") {
      const runBlocks: RichTextBlock[] = [block];
      const runId = runIdOf(block);
      const runDepth = projectionListDepth(block, 0);
      const listKind = block.metadata?.listKind ?? "bullet";
      index += 1;
      while (index < blocks.length) {
        const next = blocks[index] as RichTextBlock;
        if (effectiveOuter(next) !== "list") break;
        const nextDepth = projectionListDepth(next, 0);
        // Deeper blocks nest inside the current run's last item; only a
        // same-or-shallower block with another run id closes the run.
        if (nextDepth <= runDepth && runIdOf(next) !== runId) break;
        runBlocks.push(next);
        index += 1;
      }
      top.push(buildListRun(runBlocks, listKind === "ordered" ? "ordered" : "bullet", allocateFresh, retained));
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
function buildQuoteGroup(
  run: RichTextBlock[],
  allocateFresh: () => string,
  retained: RetainedRunMetadata,
): JSONContent {
  const depth = Math.min(...run.map(quoteDepthOf));
  const inner = run.map((block) => stripQuoteLevel(block, depth));
  const children = buildTopLevel(inner, allocateFresh, retained);
  let node: JSONContent = { type: "blockquote", content: children };
  for (let level = 1; level < depth; level += 1) {
    node = { type: "blockquote", content: [node] };
  }
  return node;
}

/** Remove the first `levels` quote entries of a block's ordered wrapper
    stack (outermost-first for top-level runs, after the list prefix for
    item content), keeping every other entry — one order entry per nesting
    level is retained, never deduplicated. */
function stripQuoteLevel(block: RichTextBlock, levels: number): RichTextBlock {
  if (levels <= 0) return block;
  const stripOrder = (order: readonly ("quote" | "list")[]): ("quote" | "list")[] => {
    const kept: ("quote" | "list")[] = [];
    let remaining = levels;
    for (const entry of order) {
      if (entry === "quote" && remaining > 0) {
        remaining -= 1;
        continue;
      }
      kept.push(entry);
    }
    return kept;
  };
  if (block.kind === "horizontalRule" && block.hrMetadata !== undefined) {
    return {
      ...block,
      hrMetadata: {
        ...block.hrMetadata,
        blockquoteDepth: Math.max(0, block.hrMetadata.blockquoteDepth - levels),
        containerOrder: stripOrder(block.hrMetadata.containerOrder),
      },
    };
  }
  if (block.kind === "paragraph" && block.metadata !== undefined) {
    return {
      ...block,
      metadata: {
        ...block.metadata,
        blockquoteDepth: Math.max(0, block.metadata.blockquoteDepth - levels),
        containerOrder: stripOrder(block.metadata.containerOrder),
      },
    };
  }
  return block;
}

/** Build the ProseMirror document JSON for a full document. Absent block
    metadata materializes the canonical plain defaults before wrapper
    classification, and the retained run-source map supplies run values for
    still-referenced runs whose opener is gone. */
export function fullDocumentToProseMirror(
  document: RichTextDocument,
  allocateFresh: () => string,
): JSONContent {
  const retained = document.retainedRunMetadata ?? {};
  return {
    type: "doc",
    content: buildTopLevel(
      document.blocks.map(materializeFullDefaults),
      allocateFresh,
      retained,
    ),
  };
}

/** Refuse a structured full import carrying a forbidden link target: per
    R-FULL-URL-1 an unsafe href refuses the whole payload, never a single
    link (silent stripping would launder the refusal). Pure. */
export function assertFullDocumentLinksAllowed(
  document: RichTextDocument,
): void {
  for (const block of document.blocks) {
    if (block.kind !== "paragraph") continue;
    for (const segment of block.segments ?? []) {
      if (segment.type !== "text") continue;
      const href = segment.marks.link;
      if (typeof href === "string" && !isAllowedHref(href)) {
        throw new Error(
          "rich-text.forbidden-href: structured full import carries a link the R-FULL-URL-1 validator refuses",
        );
      }
    }
  }
}

/** Inline JSON to full segments. Code parents join text with LF (their marks
    are display-hidden per R-FULL-CODE-1 and never reach the capture). */
function inlineToSegments(content: ProseMirrorNode | null, code: boolean): FullInlineSegment[] {
  const segments: FullInlineSegment[] = [];
  if (content === null) return segments;
  // Code text may arrive split across several text nodes at arbitrary
  // boundaries (which carry no LF): join first, split once, so leading and
  // all-LF lines survive and no phantom break appears between children.
  const codeParts: string[] = [];
  content.forEach((child) => {
    if (child.type.name === "hardBreak") {
      segments.push({ type: "hardBreak" });
      return;
    }
    if (!child.isText) return;
    if (code) {
      codeParts.push(child.textContent);
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
  if (code && codeParts.length > 0) {
    // One hard break per line boundary of the joined code text: leading
    // and all-LF lines survive, and no duplicate terminal break is added.
    const lines = codeParts.join("").split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      if (lineIndex > 0) segments.push({ type: "hardBreak" });
      const line = lines[lineIndex] as string;
      if (line !== "") segments.push({ type: "text", text: line, marks: {} });
    }
  }
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

/** One observed list run: the wrapper attributes that project the sole
    run-value source (R-FULL-META-1/2). */
interface ObservedRun {
  listKind: "bullet" | "ordered";
  tight: boolean;
  start: number;
  orderedType: "1" | "a" | "A" | "i" | "I" | null;
}

/** Read the live ProseMirror document back into a full capture.
    `incomingRetained` is the previous capture's retention map: still-referenced
    sourceless runs keep their last observed non-run attributes across capture. */
export function fullProseMirrorToDocument(
  doc: ProseMirrorNode,
  incomingRetained?: RetainedRunMetadata,
): FullDocumentRead {
  const blocks: RichTextBlock[] = [];
  const nonRepresentableParagraphIds: string[] = [];
  const observedRuns = new Map<string, ObservedRun>();

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
        // One order entry per nesting level, outermost first: every
        // blockquote node appends exactly one quote entry.
        const order: ("quote" | "list")[] = [...frame.containerOrder, "quote"];
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
    // One order entry per nesting level: every list node appends exactly
    // one list entry, so nested lists/quotes validate.
    const order: ("quote" | "list")[] = [...frame.containerOrder, "list"];
    if (!observedRuns.has(runId)) {
      observedRuns.set(runId, { listKind: kind, tight, start, orderedType });
    }
    const listFrame: CaptureFrame = {
      ...frame,
      listKind: kind,
      listDepth: frame.listDepth + (frame.listKind === "none" ? 0 : 1),
      listRunId: runId,
      listItemId: null,
      runTight: tight,
      orderedStart: kind === "ordered" ? start : null,
      orderedType: kind === "ordered" ? orderedType : null,
      // The stable source id is the run id itself, never the first surviving
      // member: promotion must not transfer run ownership (R-FULL-META-2).
      runSourceId: runId,
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
  // Run-source retention (R-FULL-META-2): live source records remain solely
  // on their own captured blocks; every still-referenced run whose source
  // separator is gone is retained here with the live wrapper's run values,
  // preserving its last observed non-run attributes across capture.
  const liveIds = new Set<string>();
  const shallowestDepth = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind !== "paragraph") continue;
    liveIds.add(block.paragraphId);
    const referenced = block.metadata?.listRunId;
    if (referenced === undefined) continue;
    const depth = block.metadata?.listDepth ?? 0;
    const known = shallowestDepth.get(referenced);
    if (known === undefined || depth < known) shallowestDepth.set(referenced, depth);
  }
  const retainedRunMetadata: RetainedRunMetadata = {};
  for (const [runId, observed] of observedRuns) {
    if (liveIds.has(runId)) continue;
    const base = incomingRetained?.[runId];
    const record = {
      ...(base !== undefined ? { ...base } : {}),
      blockKind: "paragraph",
      listKind: observed.listKind,
      listDepth:
        typeof base?.listDepth === "number"
          ? base.listDepth
          : (shallowestDepth.get(runId) ?? 0),
      listItemId: runId,
      listRunId: runId,
      blockquoteDepth:
        typeof base?.blockquoteDepth === "number" ? base.blockquoteDepth : 0,
      containerOrder: [...(base?.containerOrder ?? ["list"])],
    } as FullBlockMetadata;
    if (observed.listKind === "ordered") {
      record.orderedStart = observed.start;
      if (observed.orderedType !== null) {
        record.orderedType = observed.orderedType;
      } else {
        delete (record as { orderedType?: unknown }).orderedType;
      }
    } else {
      delete (record as { orderedStart?: unknown }).orderedStart;
      delete (record as { orderedType?: unknown }).orderedType;
    }
    record.listTight = observed.tight;
    retainedRunMetadata[runId] = record;
  }
  const document: RichTextDocument = { format: "ds.markdown.full@1", blocks };
  if (Object.keys(retainedRunMetadata).length > 0) {
    document.retainedRunMetadata = retainedRunMetadata;
  }
  return {
    document,
    nonRepresentableParagraphIds,
    retainedRunMetadata,
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
