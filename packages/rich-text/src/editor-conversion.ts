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
// Exact source per node version: serialised texts are memoised by paragraph
// identity plus node-content version. A version seen before (mount content,
// an earlier visit, or a state restored by undo) returns its recorded text
// without touching the bridge, so undo restores the byte-exact source and
// re-reading an unchanged version costs no conversion.

import type { JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
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

/** Seed texts plus the touched set for one editor session. `versions` maps
    `paragraphId + "::" + node-version` to the exact text recorded for that
    version, so a revisited version (including an undo restoration) returns
    its exact source with no bridge call. `preserved` records absent/present
    presence of `raw`/`preservedKind` per preserved identity, so an absent
    field stays absent through the round trip (§5.6 equality). */
export interface ConversionSeeds {
  texts: Map<string, string>;
  touched: Set<string>;
  versions: Map<string, string>;
  preserved: Map<string, { hasRaw: boolean; hasKind: boolean }>;
}

export function createConversionSeeds(
  document: RichTextDocument,
): ConversionSeeds {
  const seeds: ConversionSeeds = {
    texts: new Map(),
    touched: new Set(),
    versions: new Map(),
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
  seeds.versions.clear();
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

/** Version key of one paragraph node: the stable string of its JSON form
    (identity plus inline content and marks). Two reads of the same version
    share the key; any content or mark change moves it. */
function nodeVersionKey(node: ProseMirrorNode): string {
  return JSON.stringify(node.toJSON());
}

function isBlockNode(node: ProseMirrorNode): boolean {
  return node.type.name === "paragraph" || node.type.name === "preservedBlock";
}

function blockIdentityOf(node: ProseMirrorNode): string | null {
  const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
  return typeof id === "string" && id !== "" ? id : null;
}

/** Mark every identity block a transaction change covers as touched, from
    the ProseMirror step maps of that transaction. Deletions (empty resulting
    range), joins (boundary positions) and mark changes (steps with no map,
    such as add/remove-mark) are included: an empty new range marks the block
    containing the position plus its boundary neighbours, and map-less steps
    fall back to their `from`/`to` range. */
export function markTouchedFromTransaction(
  touched: Set<string>,
  doc: ProseMirrorNode,
  transaction: Transaction,
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

  for (const step of transaction.steps) {
    const map = step.getMap();
    let mapped = false;
    map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      mapped = true;
      // Undo/redo maps can name ranges outside the resulting document;
      // positions are clamped before walking it.
      markRange(newStart, newEnd);
    });
    if (!mapped) {
      // Mark-only steps carry an empty map: fall back to the step range.
      const ranged = step as unknown as { from?: unknown; to?: unknown };
      if (typeof ranged.from === "number" && typeof ranged.to === "number") {
        markRange(ranged.from, ranged.to);
      }
    }
  }
  // New identities the transaction introduced (split tails, pasted blocks)
  // need no range here: `proseMirrorToDocument` serialises any identity with
  // no seed on read.
}

/** Serialise one paragraph node. `text/plain` is literal textContent with no
    bridge call and no mark interpretation; `focus.markdown.p0@1` goes through
    the bridge per paragraph only. Counts the bridge call for the reactivity
    witness. */
export function serializeParagraphNode(
  manager: MarkdownManager,
  node: ProseMirrorNode,
  format: RichTextFormat,
): string {
  if (format === "text/plain") return node.textContent;
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
    return {
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
      content: [{ type: "text", text }],
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
    const versioned = `${id}::${nodeVersionKey(node)}`;
    const cached = seeds.versions.get(versioned);
    if (cached !== undefined) {
      blocks.push({ paragraphId: id, kind: "paragraph", text: cached });
      return;
    }
    const seed = seeds.texts.get(id);
    if (!seeds.touched.has(id) && seed !== undefined) {
      seeds.versions.set(versioned, seed);
      blocks.push({ paragraphId: id, kind: "paragraph", text: seed });
      return;
    }
    const text = serializeParagraphNode(manager, node, format);
    seeds.versions.set(versioned, text);
    seeds.texts.set(id, text);
    seeds.touched.delete(id);
    blocks.push({ paragraphId: id, kind: "paragraph", text });
  });
  return { format, blocks: [...blocks] };
}
