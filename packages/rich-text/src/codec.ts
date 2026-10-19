// Markdown codec bridge entries (spec §6.5).
// RT-0: boundary types are fixed; every entry is a stub (phase B).
//
// Segmentation contract (phase B must honour it): `segmentSource("")`
// returns `[]`, while a controlled document built from an empty source keeps
// exactly one empty paragraph block with `text: ""`. Clearing a paragraph
// yields `text: ""` under the same identity; it is never a removal.

import type { RichTextDocument, RichTextFormat } from "./model.js";

/** One source slice: UTF-16 `[start, end)` offsets into the source string
    with its editable/preserved verdict, in source order. */
export interface SourceSegment {
  start: number;
  end: number;
  editable: boolean;
}

/** Split a source string into ordered editable/preserved boundaries without
    trimming and without re-segmenting plain text (phase B).
    RT-0 RED stub: throws. */
export function segmentSource(
  _source: string,
  _format: RichTextFormat,
): SourceSegment[] {
  throw new Error("RT-0 RED: codec segmentation not wired (phase B)");
}

export interface DocumentFromSourceOptions {
  format: RichTextFormat;
  /** Host identity allocator, one identity per block. */
  allocateId: () => string;
}

/** Build the controlled document for a source string: editable segments
    become `paragraph` blocks, non-editable segments become `preserved` blocks
    carrying their verbatim slice as `raw` (phase B).
    RT-0 RED stub: throws. */
export function documentFromSource(
  _source: string,
  _options: DocumentFromSourceOptions,
): RichTextDocument {
  throw new Error("RT-0 RED: source-to-document bridge not wired (phase B)");
}

/** Serialise a controlled document back to source: editable paragraphs
    through the Markdown bridge, preserved `raw` slices spliced back
    byte-identical at their block positions (phase B).
    RT-0 RED stub: throws. */
export function sourceFromDocument(_document: RichTextDocument): string {
  throw new Error("RT-0 RED: document-to-source bridge not wired (phase B)");
}
