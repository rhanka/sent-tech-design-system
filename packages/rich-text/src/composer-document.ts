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
// Blank-line runs separate paragraphs; single newlines stay inside the
// chunk. Identities are fresh from the injected allocator, never derived
// from content, and stay internal to the composer (never exposed to the
// chat host, which only sees the string).

import type { RichTextDocument, RichTextFormat } from "./model.js";

/** Split a composer string into paragraph chunks. Blank-line runs (`\n\n+`)
    separate paragraphs; single newlines stay inside the chunk. The empty
    string is one empty chunk. */
export function splitComposerText(text: string): string[] {
  if (text === "") return [""];
  return text.split(/\n\n+/);
}

/** Join paragraph chunks into a composer string with one blank line between
    chunks. Inverse of `splitComposerText` up to blank-run collapsing. */
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
