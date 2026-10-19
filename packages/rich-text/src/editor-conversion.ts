// `RichTextDocument` ↔ ProseMirror conversion for the "./editor" entry
// (spec §4.2, §6.5).
//
// The wire shape stays `RichTextDocument`: ProseMirror positions and Tiptap
// JSON never leak past this module. Editable paragraphs convert per
// paragraph through `@tiptap/markdown` only — the bridge is never asked to
// serialise a whole document, so the DS never invents separators (§5.1).
// Preserved `raw` slices travel verbatim in node attributes, never through
// an AST. `text/plain` paragraphs are literal text: they are parsed without
// the bridge and serialised from `textContent`, so no mark and no Markdown
// input rule can alter them (§6.1).
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
// node serialisation at all.

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
    teardown. `preserved` records absent/present presence of
    `raw`/`preservedKind` per preserved identity, so an absent field stays
    absent through the round trip (§5.6 equality). */
export interface ConversionSeeds {
  texts: Map<string, string>;
  touched: Set<string>;
  versions: WeakMap<ProseMirrorNode, string>;
  versionTexts: Map<string, string>;
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

/** Serialise one paragraph node. `text/plain` is literal text with ProseMirror
    leaf text: every `hardBreak` (Shift+Enter interior newline, §5.1) becomes
    `"\n"`, so the exported text keeps the line break. No bridge call and no
    mark interpretation; `focus.markdown.p0@1` goes through the bridge per
    paragraph only. Counts the bridge call for the reactivity witness. */
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
  const output = manager.serialize(json);
  return output.endsWith("\n") ? output.slice(0, -1) : output;
}

/** Parse one editable paragraph text into ProseMirror paragraph JSON.
    `text/plain` is literal (no bridge, no marks, no Markdown rules); the
    Markdown profile falls back to a single literal text node when the bridge
    does not return a single paragraph (editable host texts always do). */
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
    // Literal text with interior newlines as `hardBreak` nodes (§5.1): every
    // `"\n"` strictly inside the text becomes a `hardBreak`; a leading or
    // trailing newline yields a leading/trailing `hardBreak` (a draft the
    // pinned contract refuses at export under §5.10, never trimmed here).
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
    const first = parsed?.content?.[0];
    if (first !== undefined && first.type === "paragraph") {
      return {
        type: "paragraph",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
        content: first.content,
      };
    }
  } catch {
    // Fall through to the literal-text paragraph below.
  }
  return {
    type: "paragraph",
    attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
    content: [{ type: "text", text }],
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

/** Read the ProseMirror document back into a `RichTextDocument`: a version
    seen before returns its recorded exact text with no bridge call (this is
    what makes undo restore the byte-exact source); an untouched paragraph
    keeps its seed text byte-identical and records it for its version;
    otherwise the paragraph re-serialises per paragraph through the bridge
    (literal textContent for `text/plain`) and the version is recorded while
    the identity leaves the touched set. Preserved blocks return their `raw`
    verbatim with absent `raw`/`preservedKind` staying absent. Exact keys only
    (§5.3 surface rule). */
export function proseMirrorToDocument(
  manager: MarkdownManager,
  doc: ProseMirrorNode,
  format: RichTextFormat,
  seeds: ConversionSeeds,
): RichTextDocument {
  const blocks: RichTextBlock[] = [];
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
    // The node object is immutable: the same object is the same version, so
    // an unchanged paragraph is a cache hit with no serialisation and no
    // conversion of any kind. The content-keyed fallback below runs only on
    // a node miss (history rebuilds an undone version as new objects).
    const cached = seeds.versions.get(node);
    if (cached !== undefined) {
      blocks.push({ paragraphId: id, kind: "paragraph", text: cached });
      return;
    }
    const contentKey = JSON.stringify(node.toJSON());
    const rebuilt = seeds.versionTexts.get(contentKey);
    if (rebuilt !== undefined) {
      seeds.versions.set(node, rebuilt);
      blocks.push({ paragraphId: id, kind: "paragraph", text: rebuilt });
      return;
    }
    const seed = seeds.texts.get(id);
    if (!seeds.touched.has(id) && seed !== undefined) {
      seeds.versions.set(node, seed);
      seeds.versionTexts.set(contentKey, seed);
      blocks.push({ paragraphId: id, kind: "paragraph", text: seed });
      return;
    }
    const text = serializeParagraphNode(manager, node, format);
    seeds.versions.set(node, text);
    seeds.versionTexts.set(contentKey, text);
    seeds.texts.set(id, text);
    seeds.touched.delete(id);
    blocks.push({ paragraphId: id, kind: "paragraph", text });
  });
  return { format, blocks: [...blocks] };
}
