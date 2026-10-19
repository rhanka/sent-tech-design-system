// `RichTextDocument` ↔ ProseMirror conversion for the "./editor" entry
// (spec §4.2, §6.5).
//
// The wire shape stays `RichTextDocument`: ProseMirror positions and Tiptap
// JSON never leak past this module. Editable paragraphs convert per
// paragraph through `@tiptap/markdown` only — the bridge is never asked to
// serialise a whole document, so the DS never invents separators (§5.1).
// Preserved `raw` slices travel verbatim in node attributes, never through
// an AST.
//
// Unedited paragraphs keep the exact host-segmented slice that entered: the
// factory records the seed text per identity at mount and marks identities
// touched from ProseMirror change ranges as transactions land. A paragraph
// no transaction touched keeps its seed text byte-identical (marker variants
// such as `_emphasis_` vs `*emphasis*` normalise through the bridge, so
// re-serialising untouched paragraphs would manufacture false amendments).
// Only the affected block is ever re-serialised, as a ProseMirror
// transaction (§13.3).

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

/** Seed texts plus the touched set for one editor session. */
export interface ConversionSeeds {
  texts: Map<string, string>;
  touched: Set<string>;
}

export function createConversionSeeds(
  document: RichTextDocument,
): ConversionSeeds {
  const seeds: ConversionSeeds = { texts: new Map(), touched: new Set() };
  reseedConversion(seeds, document);
  return seeds;
}

/** Reset seeds from a host-supplied document (mount and rule-4 external
    application): every text is seed-fresh, nothing is touched. */
export function reseedConversion(
  seeds: ConversionSeeds,
  document: RichTextDocument,
): void {
  seeds.texts.clear();
  seeds.touched.clear();
  for (const block of document.blocks) {
    if (block.kind === "paragraph") {
      seeds.texts.set(block.paragraphId, block.text ?? "");
    }
  }
}

/** Mark every identity block a transaction changed range covers as touched,
    from the ProseMirror step maps of that transaction. */
export function markTouchedFromTransaction(
  touched: Set<string>,
  doc: ProseMirrorNode,
  transaction: Transaction,
): void {
  const size = doc.content.size;
  for (const step of transaction.steps) {
    const map = step.getMap();
    map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      // Undo/redo maps can name ranges outside the resulting document;
      // clamp to the document before walking it.
      const from = Math.max(0, Math.min(newStart, size));
      const to = Math.max(0, Math.min(newEnd, size));
      if (from >= to) return;
      doc.nodesBetween(from, to, (node) => {
        if (node.type.name === "paragraph" || node.type.name === "preservedBlock") {
          const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
          if (typeof id === "string" && id !== "") touched.add(id);
        }
        return true;
      });
    });
  }
  // New identities the transaction introduced (split tails, pasted blocks)
  // need no range here: `proseMirrorToDocument` serialises any identity with
  // no seed on read.
}

/** Serialise one paragraph node through the bridge. Counts the call for the
    reactivity witness. */
export function serializeParagraphNode(
  manager: MarkdownManager,
  node: ProseMirrorNode,
): string {
  if (node.content.size === 0) return "";
  const json = node.toJSON() as JSONContent;
  if ((json as { type?: string }).type === "doc") {
    conversionCounters.documentSerialize += 1;
  }
  conversionCounters.paragraphSerialize += 1;
  const output = manager.serialize(json);
  return output.endsWith("\n") ? output.slice(0, -1) : output;
}

/** Parse one editable paragraph text into ProseMirror paragraph JSON. Falls
    back to a single literal text node when the bridge does not return a
    single paragraph (editable host texts always do). */
export function paragraphTextToProseMirror(
  manager: MarkdownManager,
  paragraphId: string,
  text: string,
): JSONContent {
  conversionCounters.paragraphParse += 1;
  if (text === "") {
    return {
      type: "paragraph",
      attrs: { [PARAGRAPH_ID_ATTRIBUTE]: paragraphId },
    };
  }
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
      );
    }),
  };
}

/** Read the ProseMirror document back into a `RichTextDocument`: untouched
    paragraphs keep their seed text byte-identical, touched paragraphs
    re-serialise per paragraph through the bridge, preserved blocks return
    their `raw` verbatim. Exact keys only (§5.3 surface rule). */
export function proseMirrorToDocument(
  manager: MarkdownManager,
  doc: ProseMirrorNode,
  format: RichTextFormat,
  seeds: ConversionSeeds,
): RichTextDocument {
  const blocks: RichTextBlock[] = [];
  doc.forEach((node) => {
    if (node.type.name === "preservedBlock") {
      const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
      blocks.push({
        paragraphId: typeof id === "string" ? id : "",
        kind: "preserved",
        raw: typeof node.attrs["raw"] === "string" ? node.attrs["raw"] : "",
        preservedKind:
          typeof node.attrs["preservedKind"] === "string"
            ? node.attrs["preservedKind"]
            : "",
      });
      return;
    }
    if (node.type.name !== "paragraph") return;
    const id =
      typeof node.attrs[PARAGRAPH_ID_ATTRIBUTE] === "string"
        ? (node.attrs[PARAGRAPH_ID_ATTRIBUTE] as string)
        : "";
    const seed = seeds.texts.get(id);
    if (!seeds.touched.has(id) && seed !== undefined) {
      blocks.push({ paragraphId: id, kind: "paragraph", text: seed });
      return;
    }
    const text = serializeParagraphNode(manager, node);
    seeds.texts.set(id, text);
    blocks.push({ paragraphId: id, kind: "paragraph", text });
  });
  return { format, blocks: [...blocks] };
}
