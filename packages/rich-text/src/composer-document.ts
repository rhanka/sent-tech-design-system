// Controlled string ↔ document conversion for the §6.2.1 composer surface
// (spec §6.2.1, R-COMP-1).
//
// This module is pure (entry "."): string splitting and joining only, no
// editor runtime, no bridge, no DOM. The Tiptap-bound core
// (`paragraphTextToProseMirror` in `src/editor-conversion.ts`, entry
// `"./editor"`) parses each chunk at mount and evaluates the §6.6
// representability condition on every capture, so this mapping never
// re-implements the bridge verdict: a chunk whose text the bridge cannot
// hold as one paragraph (for example a typed `# title` or `- item`) mounts
// empty, keeps its seed text until touched, and flags once touched — the
// host's send gate reads that flag from the capture, never from here.
//
// Exact `\n\n` boundaries separate paragraphs; single newlines stay inside
// the chunk and extra newlines are carried faithfully (an empty chunk per
// extra boundary, a leading newline on the next chunk). Identities are fresh
// from the injected allocator, never derived from content, and stay internal
// to the composer (never exposed to the chat host, which only sees the
// string).

import type { RichTextBlock, RichTextDocument, RichTextFormat } from "./model.js";
import {
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";

/** Split a composer string into paragraph chunks on exact `\n\n`
    boundaries; single newlines stay inside the chunk and extra newlines are
    carried faithfully. The empty string is one empty chunk. */
export function splitComposerText(text: string): string[] {
  if (text === "") return [""];
  return text.split("\n\n");
}

/** Join paragraph chunks into a composer string with one blank line between
    chunks. Inverse of `splitComposerText`. */
export function joinComposerText(chunks: readonly string[]): string {
  return chunks.join("\n\n");
}

const COMPOSER_FORMAT: RichTextFormat = "focus.markdown.p0@1";

/** Build the controlled document for a composer string. Every chunk becomes
    one paragraph block with a fresh identity from `allocateId`; the empty
    string mounts as one empty paragraph. Exact keys only. */
export function composerDocumentFromText(
  text: string,
  allocateId: () => string,
  format: RichTextFormat = COMPOSER_FORMAT,
): RichTextDocument {
  return {
    format,
    blocks: splitComposerText(text).map((chunk) => ({
      paragraphId: allocateId(),
      kind: "paragraph" as const,
      text: chunk,
    })),
  };
}

/** Read the composer string back from a document: paragraph texts joined with
    blank lines, preserved `raw` slices verbatim in document order. */
export function composerTextFromDocument(document: RichTextDocument): string {
  return joinComposerText(
    document.blocks.map((block) =>
      block.kind === "preserved" ? (block.raw ?? "") : (block.text ?? ""),
    ),
  );
}

/** Full-profile composer mapping (§6.2.1, CL-2F R-FULL-PROFILE-1): the string
    parses through the full Markdown bridge, keeping the bridge's source
    seeds so the surface can re-emit untouched slices byte-identically
    (review 1 item 10). An unsafe-href payload refuses whole and mounts as
    one flagged preserved block (raw kept verbatim, send gate stays closed)
    instead of flattening. */
export interface ComposerFullSeededDocument {
  document: RichTextDocument;
  /** Untouched source slice per block identity, from the bridge parse. */
  seeds: Map<string, string>;
}

export function composerFullSeededDocumentFromText(
  text: string,
  allocateId: () => string,
): ComposerFullSeededDocument {
  if (text === "") {
    const paragraphId = allocateId();
    return {
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          {
            paragraphId,
            kind: "paragraph",
            metadata: {
              blockKind: "paragraph",
              listKind: "none",
              listDepth: 0,
              blockquoteDepth: 0,
              containerOrder: [],
            },
            segments: [],
          },
        ],
      },
      seeds: new Map([[paragraphId, ""]]),
    };
  }
  const parsed = parseFullMarkdown(text, allocateId);
  if (parsed.document !== null)
    return { document: parsed.document, seeds: parsed.seeds };
  return {
    document: {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: allocateId(),
          kind: "preserved",
          raw: text,
          preservedKind: parsed.refusedKinds[0] ?? "link",
        },
      ],
    },
    seeds: parsed.seeds,
  };
}

export function composerFullDocumentFromText(
  text: string,
  allocateId: () => string,
): RichTextDocument {
  return composerFullSeededDocumentFromText(text, allocateId).document;
}

/** Read the full composer string back with conversion seeds: blocks whose
    identity is absent from `touched` re-emit their source slice
    byte-identically (§4.3.2); touched, new and seedless blocks emit the
    canonical wire. Preserved `raw` slices pass through verbatim. */
export function composerFullSeededTextFromDocument(
  document: RichTextDocument,
  seeds: ReadonlyMap<string, string>,
  touched?: ReadonlySet<string>,
): string {
  return serializeFullDocument(
    {
      format: "ds.markdown.full@1",
      blocks: document.blocks,
    },
    { seeds, ...(touched === undefined ? {} : { touched }) },
  );
}

/** Read the full composer string back: the canonical full wire (§2.9).
    No seeds are reused here, so the wire is canonical and self-consistent.
    Preserved `raw` slices pass through verbatim. */
export function composerFullTextFromDocument(
  document: RichTextDocument,
): string {
  return serializeFullDocument({
    format: "ds.markdown.full@1",
    blocks: document.blocks,
  });
}

/** Full-profile controlled string → document with positional identity reuse
    and conversion seeds: the text block at an index the displayed document
    already holds keeps that block's identity (run references remap through
    the reuse), so a host echo of the last emitted string acknowledges
    instead of conflicting. Fresh identities come from `allocateId`. Seeds
    remap through the same reuse, so a host replacement defines the new
    source slices for the identities it reuses. */
export function composerFullSeededDocumentForText(
  text: string,
  previous: readonly RichTextBlock[],
  allocateId: () => string,
): ComposerFullSeededDocument {
  const { document: fresh, seeds } = composerFullSeededDocumentFromText(
    text,
    allocateId,
  );
  const reused = new Map<string, string>();
  const blocks = fresh.blocks.map((block, index) => {
    const prior = previous[index];
    if (
      block.kind === "paragraph" &&
      prior !== undefined &&
      prior.kind === "paragraph"
    ) {
      reused.set(block.paragraphId, prior.paragraphId);
      return { ...block, paragraphId: prior.paragraphId };
    }
    return block;
  });
  const remapped = new Map<string, string>();
  for (const [identity, source] of seeds) {
    remapped.set(reused.get(identity) ?? identity, source);
  }
  return {
    document: {
      format: "ds.markdown.full@1",
      blocks: blocks.map((block) => {
        if (block.kind !== "paragraph" || block.metadata === undefined) {
          return block;
        }
        const metadata = { ...block.metadata };
        if (
          metadata.listItemId !== undefined &&
          reused.has(metadata.listItemId)
        ) {
          metadata.listItemId = reused.get(metadata.listItemId);
        }
        if (
          metadata.listRunId !== undefined &&
          reused.has(metadata.listRunId)
        ) {
          metadata.listRunId = reused.get(metadata.listRunId);
        }
        return { ...block, metadata };
      }),
    },
    seeds: remapped,
  };
}

/** Full-profile controlled string → document with positional identity reuse:
    the text block at an index the displayed document already holds keeps
    that block's identity (run references remap through the reuse), so a
    host echo of the last emitted string acknowledges instead of
    conflicting. Fresh identities come from `allocateId`. */
export function composerFullDocumentForText(
  text: string,
  previous: readonly RichTextBlock[],
  allocateId: () => string,
): RichTextDocument {
  return composerFullSeededDocumentForText(text, previous, allocateId)
    .document;
}
