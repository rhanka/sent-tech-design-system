// `RichTextDocument` ↔ ProseMirror conversion for the "./editor" entry
// (spec §4.2, §6.5, §6.6).
//
// The wire shape stays `RichTextDocument`: ProseMirror positions and Tiptap
// JSON never leak past this module. Editable paragraphs convert per
// paragraph through `@tiptap/markdown` only — the bridge is never asked to
// serialise a whole document, so the DS never invents separators (§5.1).
// Preserved `raw` slices travel verbatim in node attributes, never through
// an AST. `text/plain` paragraphs are literal text: they are parsed without
// the bridge and serialised child-by-child (`hardBreak` ⇔ `"\n"`, §6.6), so
// no mark and no Markdown input rule can alter them (§6.1). A Markdown
// paragraph's wire is exactly the bridge serialisation and its remount is
// exactly the bridge parse (§6.6): no synthetic marker anywhere.
//
// Unedited paragraphs keep the exact host-segmented slice that entered: the
// factory records the seed text per identity at mount and marks identities
// touched from ProseMirror change ranges as transactions land. A paragraph
// no transaction touched keeps its seed text byte-identical (marker variants
// such as `_emphasis_` vs `*emphasis*` normalise through the bridge, so
// re-serialising untouched paragraphs would manufacture false amendments).
// Only the affected block is ever re-serialised, as a ProseMirror
// transaction (§13.3).
//
// Exact source per node version: serialised texts are memoised by the
// immutable paragraph node object itself. A version seen before (mount
// content, an earlier visit, or a state restored by undo) returns its
// recorded text without touching the bridge, so undo restores the byte-exact
// source and re-reading an unchanged version costs no conversion and no
// node serialisation at all. The wire cache never decides the flag: every
// paragraph pays the §6.6 two-condition test on each emission and capture,
// and an untouched paragraph passes it by construction.

import type { JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
import { Mapping } from "@tiptap/pm/transform";
import type { MarkdownManager } from "@tiptap/markdown";
import type {
  RichTextBlock,
  RichTextDocument,
  RichTextFormat,
} from "./model.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import { isRepresentableWire } from "./document.js";

/** Internal conversion counters (spec §11 reactivity witness, §13.3). Test
    hook only: `src/reactivity.test.ts` reads these across a typing burst.
    Never exported from the package entries, never part of the public API. */
export const conversionCounters = {
  /** Serialisations of one editable paragraph through the bridge. */
  paragraphSerialize: 0,
  /** Parses of one editable paragraph text through the bridge. */
  paragraphParse: 0,
  /** Whole-document serialisations through the bridge. Always zero: the
      DS converts per paragraph only (§6.5). Counted to prove it. */
  documentSerialize: 0,
};

export function resetConversionCounters(): void {
  conversionCounters.paragraphSerialize = 0;
  conversionCounters.paragraphParse = 0;
  conversionCounters.documentSerialize = 0;
}

/** Seed texts plus the touched set for one editor session. `versions` is keyed
    by the immutable ProseMirror node object itself (never by a serialised
    key), so retention follows the nodes ProseMirror itself retains: an
    unchanged paragraph shares its node object across states (a cache hit
    with no conversion and no node serialisation at all) and a dropped
    history version releases its text with its nodes. History rebuilds an
    undone version as new objects with identical content, so `versionTexts`
    keeps the exact text by content key as the fallback for those rebuilds
    (undo restores the byte-exact source with no bridge call); it holds one
    small entry per distinct recorded version and is released on reseed and
    teardown. The flag travels with the wire: `versionFlags` / `versionFlagTexts`
    record the §6.6 representability outcome computed when the wire was first
    recorded, so a cache hit reuses the recorded flag with no bridge re-parse
    — a hit never implies representable, it replays the recorded verdict.
    `preserved` records absent/present presence of `raw`/`preservedKind` per
    preserved identity, so an absent field stays absent through the round trip
    (§5.6 equality). */
export interface ConversionSeeds {
  texts: Map<string, string>;
  touched: Set<string>;
  versions: WeakMap<ProseMirrorNode, string>;
  versionTexts: Map<string, string>;
  versionFlags: WeakMap<ProseMirrorNode, boolean>;
  versionFlagTexts: Map<string, boolean>;
  preserved: Map<string, { hasRaw: boolean; hasKind: boolean }>;
}

export function createConversionSeeds(
  document: RichTextDocument,
): ConversionSeeds {
  const seeds: ConversionSeeds = {
    texts: new Map(),
    touched: new Set(),
    versions: new WeakMap(),
    versionTexts: new Map(),
    versionFlags: new WeakMap(),
    versionFlagTexts: new Map(),
    preserved: new Map(),
  };
  reseedConversion(seeds, document);
  return seeds;
}

/** Reset seeds from a host-supplied document (mount and rule-4 external
    application): every text is seed-fresh, nothing is touched, no version is
    cached yet (versions are recorded lazily on read against the live nodes),
    and preserved presence is re-recorded. */
export function reseedConversion(
  seeds: ConversionSeeds,
  document: RichTextDocument,
): void {
  seeds.texts.clear();
  seeds.touched.clear();
  // A `WeakMap` has no clear: replace it so every previously recorded node
  // version releases with its nodes.
  seeds.versions = new WeakMap<ProseMirrorNode, string>();
  seeds.versionTexts.clear();
  seeds.versionFlags = new WeakMap<ProseMirrorNode, boolean>();
  seeds.versionFlagTexts.clear();
  seeds.preserved.clear();
  for (const block of document.blocks) {
    if (block.kind === "paragraph") {
      seeds.texts.set(block.paragraphId, block.text ?? "");
    } else {
      seeds.preserved.set(block.paragraphId, {
        hasRaw: block.raw !== undefined,
        hasKind: block.preservedKind !== undefined,
      });
    }
  }
}

function isBlockNode(node: ProseMirrorNode): boolean {
  return node.type.name === "paragraph" || node.type.name === "preservedBlock";
}

function blockIdentityOf(node: ProseMirrorNode): string | null {
  const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
  return typeof id === "string" && id !== "" ? id : null;
}

/** Mark every identity block a transaction change covers as touched, from
    the ProseMirror step maps of that transaction projected to the final
    document. Every step range is mapped forward through the remaining step
    maps of the same transaction plus any appended-transaction step maps, so
    a multi-step edit invalidates the blocks it really covers in the final
    document (not the intermediate positions). Deletions (empty resulting
    range), joins (boundary positions) and mark changes (steps with no map,
    such as add/remove-mark) are included: an empty new range marks the block
    containing the position plus its boundary neighbours, and map-less steps
    fall back to their `from`/`to` range (mapped forward the same way). */
export function markTouchedFromTransaction(
  touched: Set<string>,
  doc: ProseMirrorNode,
  transaction: Transaction,
  appended: readonly Transaction[] = [],
): void {
  const size = doc.content.size;
  const clamp = (pos: number): number =>
    Math.max(0, Math.min(pos, size));

  const markBlockAt = (pos: number): void => {
    const at = clamp(pos);
    try {
      const $pos = doc.resolve(at);
      let found = false;
      for (let depth = $pos.depth; depth >= 0; depth -= 1) {
        const ancestor = $pos.node(depth);
        if (isBlockNode(ancestor)) {
          const id = blockIdentityOf(ancestor);
          if (id !== null) touched.add(id);
          found = true;
          break;
        }
      }
      if (!found) {
        // A boundary between two blocks: both neighbours are affected
        // (join/delete-span shape).
        for (const neighbour of [$pos.nodeBefore, $pos.nodeAfter]) {
          if (neighbour !== null && isBlockNode(neighbour)) {
            const id = blockIdentityOf(neighbour);
            if (id !== null) touched.add(id);
          }
        }
      }
    } catch {
      // An unresolvable position (document end edge): fall back to the
      // last top-level block so a trailing deletion is never silent.
      let last: string | null = null;
      doc.forEach((node) => {
        if (isBlockNode(node)) {
          const id = blockIdentityOf(node);
          if (id !== null) last = id;
        }
      });
      if (last !== null) touched.add(last);
    }
  };

  const markRange = (from: number, to: number): void => {
    const start = clamp(from);
    const end = clamp(to);
    if (start < end) {
      doc.nodesBetween(start, end, (node) => {
        if (isBlockNode(node)) {
          const id = blockIdentityOf(node);
          if (id !== null) touched.add(id);
        }
        return true;
      });
      return;
    }
    markBlockAt(start);
  };

  const steps = transaction.steps;
  const appendedSteps = appended.flatMap((entry) =>
    entry.steps.map((step) => step.getMap()),
  );
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index] as (typeof steps)[number];
    // Forward projection to the final document: the remaining step maps of
    // this transaction plus every appended-transaction step map. Identity
    // repair appends (`setNodeAttribute`) carry position-preserving maps, so
    // including them is a no-op for positions and keeps the projection exact
    // when an append does shift content.
    const forward = new Mapping();
    for (let next = index + 1; next < steps.length; next += 1) {
      forward.appendMap(steps[next]!.getMap());
    }
    for (const extra of appendedSteps) {
      forward.appendMap(extra);
    }
    const project = (pos: number, assoc: 1 | -1): number =>
      forward.map(pos, assoc);
    const map = step.getMap();
    let mapped = false;
    map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      mapped = true;
      // Undo/redo maps can name ranges outside the resulting document;
      // positions are clamped before walking it.
      markRange(project(newStart, 1), project(newEnd, -1));
    });
    if (!mapped) {
      // Mark-only steps carry an empty map: fall back to the step range,
      // projected forward the same way.
      const ranged = step as unknown as { from?: unknown; to?: unknown };
      if (typeof ranged.from === "number" && typeof ranged.to === "number") {
        markRange(
          project(ranged.from, 1),
          project(Math.max(ranged.from, ranged.to), -1),
        );
      }
    }
  }
  // New identities the transaction introduced (split tails, pasted blocks)
  // need no range here: `proseMirrorToDocument` serialises any identity with
  // no seed on read.
}

/** Serialise one paragraph node (§6.6 wire principle). `text/plain` is
    literal text in child order (`hardBreak` ⇔ `"\n"`), whitespace byte-exact,
    no bridge and no mark interpretation. `focus.markdown.p0@1` is exactly the
    `@tiptap/markdown` bridge serialisation of that single paragraph, without
    post-processing and without any synthetic marker: a literal `"  \n"`
    sequence is ordinary text judged by the representability test, never
    decoded into a break count, and bridge syntax (an interior hard break the
    bridge emits between visible texts) stays bridge syntax. Counts the bridge
    call for the reactivity witness. */
export function serializeParagraphNode(
  manager: MarkdownManager,
  node: ProseMirrorNode,
  format: RichTextFormat,
): string {
  if (format === "text/plain") {
    return node.textBetween(0, node.content.size, "", "\n");
  }
  if (node.content.size === 0) return "";
  const json = node.toJSON() as JSONContent;
  if ((json as { type?: string }).type === "doc") {
    conversionCounters.documentSerialize += 1;
  }
  conversionCounters.paragraphSerialize += 1;
  return manager.serialize(json);
}

/** Bridge-only parse of one Markdown paragraph wire (§6.6): the inline
    content of the single paragraph the bridge parses the text back to, or
    `null` when the bridge yields no paragraph, more than one block, or a
    non-paragraph block. No fallback, no literal-text rescue, no break
    synthesis of any kind — a literal sequence that merely looks like a
    former marker (for example `"  \n"`) is judged by the bridge alone.
    Counts the bridge call for the reactivity witness. */
export function parseMarkdownParagraph(
  manager: MarkdownManager,
  text: string,
): JSONContent[] | null {
  conversionCounters.paragraphParse += 1;
  let parsed: (JSONContent & { content?: JSONContent[] }) | null = null;
  try {
    parsed = manager.parse(text) as JSONContent & { content?: JSONContent[] };
  } catch {
    return null;
  }
  const blocks = parsed?.content ?? [];
  if (blocks.length !== 1) return null;
  const first = blocks[0];
  if (first === undefined || first.type !== "paragraph") return null;
  return [...(first.content ?? [])];
}

type InlineChild = { type: string; text?: string; marks?: { type: string }[] };

function normaliseInline(
  content: JSONContent[] | undefined,
): InlineChild[] {
  return (content ?? []).map((child) => {
    if (child.type === "text") {
      const marks = ((child as { marks?: { type?: string }[] }).marks ?? [])
        .map((mark) => ({ type: mark.type ?? "" }))
        .sort((left, right) => (left.type < right.type ? -1 : left.type > right.type ? 1 : 0));
      return { type: "text", text: (child as { text?: string }).text ?? "", marks };
    }
    return { type: child.type ?? "" };
  });
}

function inlineContentEquals(
  live: JSONContent[] | undefined,
  parsed: JSONContent[] | null,
): boolean {
  if (parsed === null) return false;
  const left = normaliseInline(live);
  const right = normaliseInline(parsed);
  if (left.length !== right.length) return false;
  return left.every((child, index) => {
    const other = right[index] as InlineChild;
    if (child.type !== other.type) return false;
    if ((child.text ?? "") !== (other.text ?? "")) return false;
    const leftMarks = (child.marks ?? []).map((mark) => mark.type).sort();
    const rightMarks = (other.marks ?? []).map((mark) => mark.type).sort();
    return (
      leftMarks.length === rightMarks.length &&
      leftMarks.every((mark, markIndex) => mark === rightMarks[markIndex])
    );
  });
}

/** Representability of one live paragraph for its candidate wire (§6.6).
    `wire` is the untouched source bytes, the plain literal mapping, or the
    bridge serialisation; `liveContent` is the paragraph's ordered inline
    JSON. Empty (`P` empty and `W === ""`) is representable by the line-59
    exception. For `text/plain` condition (1) is the literal mapping itself
    and holds by construction, so only the pinned single-segment criterion
    (via `isRepresentableWire`) decides. For Markdown-method `edited` wires
    both hold exactly when the bridge re-parse deep-equals the live content
    and the wire passes that same criterion; an untouched paragraph whose wire
    entered as a host-segmented slice satisfies both by construction. */
export function isParagraphRepresentable(
  manager: MarkdownManager,
  liveContent: JSONContent[] | undefined,
  wire: string,
  format: RichTextFormat,
  liveSize: number,
): boolean {
  if (wire === "" && liveSize === 0) return true;
  if (format === "text/plain") {
    return isRepresentableWire(wire, format);
  }
  const parsed = parseMarkdownParagraph(manager, wire);
  if (!inlineContentEquals(liveContent, parsed)) return false;
  return isRepresentableWire(wire, format);
}

/** Parse one editable paragraph text into ProseMirror paragraph JSON.
    `text/plain` is literal (no bridge, no marks, no Markdown rules): every
    `"\n"` becomes one `hardBreak` in order, whitespace byte-exact (§5.1,
    §6.6 `text/plain`). The Markdown profile is exactly the bridge parse
    (§6.6 wire principle): a single parsed paragraph keeps its inline
    content, and any other bridge outcome (no paragraph, several blocks, a
    non-paragraph block) mounts as the empty paragraph. No literal-text
    fallback and no break synthesis beside the bridge: keeping a parallel
    private parse beside the bridge fails §6.6. */
export function paragraphTextToProseMirror(
  manager: MarkdownManager,
  paragraphId: string,
  text: string,
  format: RichTextFormat,
): JSONContent {
  if (text === "") {
    return {
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
    };
  }
  if (format === "text/plain") {
    // Literal text with interior newlines as `hardBreak` nodes (§5.1, §6.6):
    // every `"\n"` becomes a `hardBreak` in order; a leading or trailing
    // newline yields a leading/trailing `hardBreak` (a draft the pinned
    // contract refuses at export under §5.10, never trimmed here).
    const lines = text.split("\n");
    if (lines.length === 1) {
      return {
        type: "paragraph",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
        content: [{ type: "text", text }],
      };
    }
    const content: JSONContent[] = [];
    lines.forEach((line, index) => {
      if (index > 0) content.push({ type: "hardBreak" });
      if (line !== "") content.push({ type: "text", text: line });
    });
    return {
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
      ...(content.length === 0 ? {} : { content }),
    };
  }
  conversionCounters.paragraphParse += 1;
  try {
    const parsed = manager.parse(text) as JSONContent & {
      content?: JSONContent[];
    };
    const blocks = parsed?.content ?? [];
    if (blocks.length === 1 && blocks[0]?.type === "paragraph") {
      return {
        type: "paragraph",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
        content: (blocks[0] as { content?: JSONContent[] }).content,
      };
    }
  } catch {
    // Any bridge failure mounts as the empty paragraph below.
  }
  return {
    type: "paragraph",
    attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
  };
}

/** Build the ProseMirror document JSON for a `RichTextDocument`, keeping
    every `paragraphId` and every preserved `raw` verbatim. */
export function documentToProseMirror(
  manager: MarkdownManager,
  document: RichTextDocument,
): JSONContent {
  return {
    type: "doc",
    content: document.blocks.map((block) => {
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
      return paragraphTextToProseMirror(
        manager,
        block.paragraphId,
        block.text ?? "",
        document.format,
      );
    }),
  };
}

/** Read the ProseMirror document back into a `RichTextDocument` plus the
    per-paragraph cache meta the representability flag needs: a version seen
    before returns its recorded exact text and its recorded flag with no
    bridge call (this is what makes undo restore the byte-exact source and
    what keeps the reactivity budgets: only the edited paragraph pays the
    flag evaluation); an untouched paragraph keeps its seed text byte-identical
    and records it for its version with a true flag by construction (§6.6);
    otherwise the paragraph re-serialises per paragraph through the bridge
    (literal `hardBreak` ⇔ `"\n"` for `text/plain`, bridge serialisation
    without post-processing for Markdown), pays the §6.6 two-condition test
    once, and records wire and flag while the identity leaves the touched set.
    Preserved blocks return their `raw` verbatim with absent `raw`/
    `preservedKind` staying absent. Exact keys only (§5.3 surface rule). */
interface ParagraphRead {
  id: string;
  text: string;
  representable: boolean;
}

function readDocumentWithMeta(
  manager: MarkdownManager,
  doc: ProseMirrorNode,
  format: RichTextFormat,
  seeds: ConversionSeeds,
): { blocks: RichTextBlock[]; paragraphs: ParagraphRead[] } {
  const blocks: RichTextBlock[] = [];
  const paragraphs: ParagraphRead[] = [];
  doc.forEach((node) => {
    if (node.type.name === "preservedBlock") {
      const id = blockIdentityOf(node) ?? "";
      const raw =
        typeof node.attrs["raw"] === "string" ? node.attrs["raw"] : "";
      const kind =
        typeof node.attrs["preservedKind"] === "string"
          ? node.attrs["preservedKind"]
          : "";
      const presence = seeds.preserved.get(id);
      const block: RichTextBlock = { paragraphId: id, kind: "preserved" };
      if (presence === undefined) {
        block.raw = raw;
        block.preservedKind = kind;
      } else {
        if (presence.hasRaw) block.raw = raw;
        if (presence.hasKind) block.preservedKind = kind;
      }
      blocks.push(block);
      return;
    }
    if (node.type.name !== "paragraph") return;
    const id = blockIdentityOf(node) ?? "";
    const liveJson = node.toJSON() as JSONContent & {
      content?: JSONContent[];
    };
    const liveContent = liveJson.content;
    const liveSize = node.content.size;
    // The node object is immutable: the same object is the same version, so
    // an unchanged paragraph is a cache hit with no serialisation and no
    // conversion of any kind — wire and flag both replay the recorded
    // verdict. The content-keyed fallback below runs only on a node miss
    // (history rebuilds an undone version as new objects).
    const cached = seeds.versions.get(node);
    if (cached !== undefined) {
      let flag = seeds.versionFlags.get(node);
      if (flag === undefined) {
        // Entries recorded before the flag cache existed: evaluate once and
        // record, so later reads replay without a bridge call.
        flag = isParagraphRepresentable(
          manager,
          liveContent,
          cached,
          format,
          liveSize,
        );
        seeds.versionFlags.set(node, flag);
      }
      blocks.push({ paragraphId: id, kind: "paragraph", text: cached });
      paragraphs.push({ id, text: cached, representable: flag });
      return;
    }
    const contentKey = JSON.stringify(node.toJSON());
    const rebuilt = seeds.versionTexts.get(contentKey);
    if (rebuilt !== undefined) {
      let flag = seeds.versionFlagTexts.get(contentKey);
      if (flag === undefined) {
        flag = isParagraphRepresentable(
          manager,
          liveContent,
          rebuilt,
          format,
          liveSize,
        );
        seeds.versionFlagTexts.set(contentKey, flag);
      }
      seeds.versions.set(node, rebuilt);
      seeds.versionFlags.set(node, flag);
      blocks.push({ paragraphId: id, kind: "paragraph", text: rebuilt });
      paragraphs.push({ id, text: rebuilt, representable: flag });
      return;
    }
    const seed = seeds.texts.get(id);
    if (!seeds.touched.has(id) && seed !== undefined) {
      // Untouched seed: wire and flag by construction (§6.6), no bridge.
      seeds.versions.set(node, seed);
      seeds.versionTexts.set(contentKey, seed);
      seeds.versionFlags.set(node, true);
      seeds.versionFlagTexts.set(contentKey, true);
      blocks.push({ paragraphId: id, kind: "paragraph", text: seed });
      paragraphs.push({ id, text: seed, representable: true });
      return;
    }
    const text = serializeParagraphNode(manager, node, format);
    const flag = isParagraphRepresentable(
      manager,
      liveContent,
      text,
      format,
      liveSize,
    );
    seeds.versions.set(node, text);
    seeds.versionTexts.set(contentKey, text);
    seeds.versionFlags.set(node, flag);
    seeds.versionFlagTexts.set(contentKey, flag);
    seeds.texts.set(id, text);
    seeds.touched.delete(id);
    blocks.push({ paragraphId: id, kind: "paragraph", text });
    paragraphs.push({ id, text, representable: flag });
  });
  return { blocks, paragraphs };
}

/** Read the ProseMirror document back into a `RichTextDocument`: same wire
    logic as the capture result, without the representability evaluation (so
    re-reading an unchanged document costs no bridge re-parse). Preserved
    blocks return their `raw` verbatim; exact keys only (§5.3). */
export function proseMirrorToDocument(
  manager: MarkdownManager,
  doc: ProseMirrorNode,
  format: RichTextFormat,
  seeds: ConversionSeeds,
): RichTextDocument {
  const { blocks } = readDocumentWithMeta(manager, doc, format, seeds);
  return { format, blocks: [...blocks] };
}

/** Read the ProseMirror document back into a capture result (§6.6 reporting
    surface): the document wires from the same conversion that produces the
    emitted wire, plus `nonRepresentableParagraphIds` in document order
    (identities only). Wire and flag come from the same per-version record, so
    no paragraph pays a second bridge call here: a cache hit replays the
    verdict computed when its wire was recorded, and a hit never implies
    representable. Preserved blocks are never flagged. */
export function proseMirrorToCaptureResult(
  manager: MarkdownManager,
  doc: ProseMirrorNode,
  format: RichTextFormat,
  seeds: ConversionSeeds,
): { document: RichTextDocument; nonRepresentableParagraphIds: string[] } {
  const { blocks, paragraphs } = readDocumentWithMeta(
    manager,
    doc,
    format,
    seeds,
  );
  const nonRepresentableParagraphIds: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.representable) nonRepresentableParagraphIds.push(paragraph.id);
  }
  return {
    document: { format, blocks: [...blocks] },
    nonRepresentableParagraphIds,
  };
}
