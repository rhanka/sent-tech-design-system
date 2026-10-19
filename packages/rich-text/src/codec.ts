// Markdown codec bridge entries (spec §6.5).
//
// Segmentation contract: `segmentSource("")` returns `[]`, while a
// controlled document built from an empty source keeps exactly one empty
// paragraph block with `text: ""`. Clearing a paragraph yields `text: ""`
// under the same identity; it is never a removal.
//
// Segmentation authority and equivalence (spec §6.5, §2.2 M5): the merged
// Focus source codec (`segmentMarkdown`/`segmentText` at the pin) is the
// host's segmentation authority. This bridge mirrors its boundaries
// line-wise without a Markdown parser dependency: top-level block slices
// with UTF-16 `[start, end)` offsets into the original source, blank-line
// gaps excluded, CRLF/CR aware, no trimming and no normalisation. Paragraph
// `text` is always the bare block slice: separators are structural gaps
// owned by the manifest host-side, never paragraph content, so a text
// carrying a trailing line break would be refused by `assertParagraphText`
// (`unsupported-paragraph-format`). The RT-2
// `segmentation-equivalence.test.ts` gate qualifies this mirror against
// the DS vectors.
//
// Serialisation (spec §6.5): `sourceFromDocument` emits the canonical LF
// form — block serialisations joined by a blank line with a single final
// newline (an emptied field serialises to `""`). Editable paragraphs emit
// their `text` verbatim; preserved `raw` slices splice back verbatim. The
// live Markdown bridge (`@tiptap/markdown`, spec §6.5) is composed in the
// runtime editor; this entry carries the same paragraph/preserved split so
// the neutral core stays runtime-import free.

import type { RichTextDocument, RichTextFormat } from "./model.js";

/** One source slice: UTF-16 `[start, end)` offsets into the source string
    with its editable/preserved verdict, in source order. Gaps (blank-line
    separators) own no segment. */
export interface SourceSegment {
  start: number;
  end: number;
  editable: boolean;
}

/** Preserved block kinds produced by the bridge. Open vocabulary; the
    listed values mirror the spec examples (§5.5, §6.3). */
export type BridgePreservedKind =
  | "heading"
  | "table"
  | "codeBlock"
  | "list"
  | "blockquote"
  | "image"
  | "horizontalRule"
  | "rawHtml"
  | "link";

interface SourceLine {
  text: string;
  start: number;
  /** Offset just past the line content, before the line ending. */
  endText: number;
}

function splitSourceLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];
  const parts = source.split(/(\r\n|\n|\r)/);
  let offset = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? "";
    const start = offset;
    const endText = offset + text.length;
    offset = endText + (parts[i + 1] ?? "").length;
    lines.push({ text, start, endText });
  }
  // `split` on a source ending with a line break yields a final empty part:
  // it is not a line.
  if (lines.length > 0 && /(?:\r\n|\n|\r)$/.test(source)) lines.pop();
  return lines;
}

function isBlankLine(text: string): boolean {
  return /^[ \t]*$/.test(text);
}

interface FenceOpen {
  char: "`" | "~";
  length: number;
}

function matchFenceOpen(text: string): FenceOpen | null {
  const match = /^\s{0,3}(`{3,}|~{3,})/.exec(text);
  if (!match) return null;
  const run = match[1] ?? "";
  return { char: run[0] === "~" ? "~" : "`", length: run.length };
}

function isFenceClose(text: string, open: FenceOpen): boolean {
  const match = /^\s{0,3}(`{3,}|~{3,})\s*$/.exec(text);
  if (!match) return false;
  const run = match[1] ?? "";
  return (run[0] === "~" ? "~" : "`") === open.char && run.length >= open.length;
}

/** A fenced-code delimiter line (open or close position). Exported for the
    editor paste pipeline, which reuses the bridge vocabulary. */
export function isFencedCodeLine(line: string): boolean {
  return matchFenceOpen(line) !== null;
}

/** An ATX heading line. Exported for the editor paste pipeline. */
export function isHeadingLine(line: string): boolean {
  return /^\s{0,3}#{1,6}(?:\s|$)/.test(line);
}

/** A list-item line (bullet or ordered). Exported for the paste pipeline. */
export function isListItemLine(line: string): boolean {
  return /^\s{0,3}(?:[-+*]\s+|\d{1,9}[.)]\s+)/.test(line);
}

/** A blockquote line. Exported for the editor paste pipeline. */
export function isBlockquoteLine(line: string): boolean {
  return /^\s{0,3}>/.test(line);
}

/** A thematic-break line. Exported for the editor paste pipeline. */
export function isHorizontalRuleLine(line: string): boolean {
  return /^\s{0,3}(?:\*(?:\s*\*){2,}|-(?:\s*-){2,}|_(?:\s*_){2,})\s*$/.test(line);
}

/** A setext underline (`===` → level 1, `---` → level 2 with a preceding
    paragraph). A lone `---` with no paragraph is a thematic break instead. */
function matchSetextUnderline(text: string): "=" | "-" | null {
  if (/^\s{0,3}=+\s*$/.test(text)) return "=";
  if (/^\s{0,3}-+\s*$/.test(text)) return "-";
  return null;
}

function isCommentOpen(text: string): boolean {
  const open = text.indexOf("<!--");
  if (open < 0) return false;
  return text.indexOf("-->", open + 4) < 0;
}

/** An HTML block-start line (CommonMark type 6 shape, simplified to
    blank-line termination). Comment openings are handled separately. */
function isHtmlBlockStart(text: string): boolean {
  return /^\s{0,3}<(?:\/?[A-Za-z][A-Za-z0-9-]*|[?!])/.test(text);
}

/** A standalone Markdown image line (`![alt](src)` or `![alt][ref]`).
    Exported with its alt extractor for the paste pipeline. */
export function isMarkdownImageLine(line: string): boolean {
  const text = line.trim();
  return (
    /^!\[[^\]]*\]\([^()]*\)$/.test(text) || /^!\[[^\]]*\]\[[^\]]*\]$/.test(text)
  );
}

/** Alt text of a Markdown image (`""` when absent). */
export function extractMarkdownImageAlt(line: string): string | null {
  const match = /!\[([^\]]*)\]/.exec(line);
  return match ? (match[1] ?? "") : null;
}

/** True when the line block carries a fenced table: a delimiter row plus at
    least one more pipe line. Exported for the paste pipeline. */
export function isMarkdownTableBlock(lines: readonly string[]): boolean {
  let pipes = 0;
  let delimiter = false;
  for (const line of lines) {
    if (!line.includes("|")) continue;
    pipes += 1;
    const cell = line.trim();
    if (cell.includes("-") && /^[\s|:~-]+$/.test(cell)) delimiter = true;
  }
  return delimiter && pipes >= 2;
}

function hasImageSyntax(text: string): boolean {
  return /!\[[^\]]*\]/.test(text);
}

function hasLinkSyntax(text: string): boolean {
  return /\[[^\]]*\]\([^()]*\)|\[[^\]]*\]\[[^\]]*\]/.test(text);
}

function hasHtmlSyntax(text: string): boolean {
  return /<\/?[A-Za-z][^<>]*>|<!--|<\?|<![A-Za-z]/.test(text);
}

/** Inline safety (spec §6.2): a paragraph line is editable only without
    links, images and raw HTML. Emphasis, strong, inline code and hard
    breaks stay literal text in the headless model. */
function isInlineSafe(text: string): boolean {
  return !hasImageSyntax(text) && !hasLinkSyntax(text) && !hasHtmlSyntax(text);
}

interface BlockInfo {
  start: number;
  end: number;
  editable: boolean;
  preservedKind: BridgePreservedKind | null;
}

function walkBlocks(source: string, lines: SourceLine[]): BlockInfo[] {
  const blocks: BlockInfo[] = [];
  const count = lines.length;
  let i = 0;
  const sliceEnd = (last: number): number => lines[last]?.endText ?? 0;
  while (i < count) {
    const line = lines[i];
    if (!line || isBlankLine(line.text)) {
      i += 1;
      continue;
    }
    const start = line.start;
    const first = line.text;
    const fence = matchFenceOpen(first);
    if (fence) {
      let j = i + 1;
      while (j < count && !isFenceClose(lines[j]?.text ?? "", fence)) j += 1;
      if (j < count) j += 1;
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "codeBlock" });
      i = j;
      continue;
    }
    if (first.includes("<!--")) {
      let j = i;
      if (first.indexOf("-->", first.indexOf("<!--") + 4) < 0) {
        j = i + 1;
        while (j < count && !(lines[j]?.text ?? "").includes("-->")) j += 1;
        if (j < count) j += 1;
      } else {
        j = i + 1;
      }
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "rawHtml" });
      i = j;
      continue;
    }
    if (isHtmlBlockStart(first)) {
      let j = i + 1;
      while (j < count && !isBlankLine(lines[j]?.text ?? "")) j += 1;
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "rawHtml" });
      i = j;
      continue;
    }
    if (isHeadingLine(first)) {
      blocks.push({ start, end: line.endText, editable: false, preservedKind: "heading" });
      i += 1;
      continue;
    }
    if (isBlockquoteLine(first)) {
      let j = i + 1;
      while (j < count && isBlockquoteLine(lines[j]?.text ?? "")) j += 1;
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "blockquote" });
      i = j;
      continue;
    }
    if (isMarkdownImageLine(first)) {
      blocks.push({ start, end: line.endText, editable: false, preservedKind: "image" });
      i += 1;
      continue;
    }
    if (isListItemLine(first)) {
      let j = i + 1;
      while (
        j < count &&
        !isBlankLine(lines[j]?.text ?? "") &&
        (isListItemLine(lines[j]?.text ?? "") || /^[ \t]/.test(lines[j]?.text ?? ""))
      )
        j += 1;
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "list" });
      i = j;
      continue;
    }
    if (/^(?: {4}|\t)/.test(first)) {
      let j = i + 1;
      while (j < count && /^(?: {4}|\t)/.test(lines[j]?.text ?? "")) j += 1;
      blocks.push({ start, end: sliceEnd(j - 1), editable: false, preservedKind: "codeBlock" });
      i = j;
      continue;
    }
    if (isHorizontalRuleLine(first)) {
      blocks.push({ start, end: line.endText, editable: false, preservedKind: "horizontalRule" });
      i += 1;
      continue;
    }
    // Paragraph accumulation with interruption (ATX headings, fences,
    // blockquotes, thematic breaks, HTML blocks, comments and list items
    // start a new block; setext underlines merge; tables never interrupt).
    const acc: number[] = [i];
    let setextHeading = false;
    i += 1;
    while (i < count && !isBlankLine(lines[i]?.text ?? "")) {
      const text = lines[i]?.text ?? "";
      const setext = matchSetextUnderline(text);
      if (setext) {
        acc.push(i);
        i += 1;
        setextHeading = true;
        break;
      }
      if (
        matchFenceOpen(text) ||
        isHeadingLine(text) ||
        isBlockquoteLine(text) ||
        isHorizontalRuleLine(text) ||
        text.includes("<!--") ||
        isHtmlBlockStart(text) ||
        isListItemLine(text)
      )
        break;
      acc.push(i);
      i += 1;
    }
    const end = sliceEnd(acc[acc.length - 1] ?? i);
    if (setextHeading) {
      blocks.push({ start, end, editable: false, preservedKind: "heading" });
      continue;
    }
    const texts = acc.map((index) => lines[index]?.text ?? "");
    if (isMarkdownTableBlock(texts)) {
      blocks.push({ start, end, editable: false, preservedKind: "table" });
      continue;
    }
    if (texts.every(isInlineSafe)) {
      blocks.push({ start, end, editable: true, preservedKind: null });
      continue;
    }
    const kind: BridgePreservedKind = texts.some(hasImageSyntax)
      ? "image"
      : texts.some(hasLinkSyntax)
        ? "link"
        : "rawHtml";
    blocks.push({ start, end, editable: false, preservedKind: kind });
  }
  return blocks;
}

function walkTextSegments(source: string): SourceSegment[] {
  // Mirrors the pinned Focus `segmentText`: one unit per block of non-blank
  // lines, exact source offsets, CRLF/CR aware, no trimming. Blank lines
  // stay structural gaps, never paragraph content.
  if (source === "") return [];
  const parts = source.split(/(\r\n|\n|\r)/);
  const starts: number[] = [];
  const ends: number[] = [];
  const texts: string[] = [];
  let offset = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? "";
    starts.push(offset);
    ends.push(offset + text.length);
    texts.push(text);
    offset += text.length + (parts[i + 1] ?? "").length;
  }
  const segments: SourceSegment[] = [];
  let open: number | null = null;
  const close = (last: number): void => {
    const first = open ?? last;
    segments.push({
      start: starts[first] ?? 0,
      end: ends[last] ?? 0,
      editable: true,
    });
    open = null;
  };
  texts.forEach((text, index) => {
    if (/^[ \t]*$/.test(text)) {
      if (open !== null) close(index - 1);
    } else if (open === null) {
      open = index;
    }
  });
  if (open !== null) close(texts.length - 1);
  return segments;
}

/** Split a source string into ordered editable/preserved boundaries without
    trimming and without re-segmenting plain text. `text/plain` mirrors the
    pinned Focus `segmentText` exactly; Markdown mirrors its block
    boundaries line-wise (see the module header). */
export function segmentSource(
  source: string,
  format: RichTextFormat,
): SourceSegment[] {
  if (source === "") return [];
  if (format === "text/plain") return walkTextSegments(source);
  return walkBlocks(source, splitSourceLines(source)).map((block) => ({
    start: block.start,
    end: block.end,
    editable: block.editable,
  }));
}

export interface DocumentFromSourceOptions {
  format: RichTextFormat;
  /** Host identity allocator, one identity per block. */
  allocateId: () => string;
}

/** Build the controlled document for a source string: editable segments
    become `paragraph` blocks carrying their bare slice as `text`,
    non-editable segments become `preserved` blocks carrying their verbatim
    slice as `raw` with the segmented `preservedKind`. An empty source keeps
    exactly one empty paragraph block with `text: ""`. */
export function documentFromSource(
  source: string,
  options: DocumentFromSourceOptions,
): RichTextDocument {
  if (source === "") {
    return {
      format: options.format,
      blocks: [
        { paragraphId: options.allocateId(), kind: "paragraph", text: "" },
      ],
    };
  }
  if (options.format === "text/plain") {
    return {
      format: options.format,
      blocks: walkTextSegments(source).map((segment) => ({
        paragraphId: options.allocateId(),
        kind: "paragraph" as const,
        text: source.slice(segment.start, segment.end),
      })),
    };
  }
  return {
    format: options.format,
    blocks: walkBlocks(source, splitSourceLines(source)).map((block) => {
      if (block.editable) {
        return {
          paragraphId: options.allocateId(),
          kind: "paragraph" as const,
          text: source.slice(block.start, block.end),
        };
      }
      return {
        paragraphId: options.allocateId(),
        kind: "preserved" as const,
        raw: source.slice(block.start, block.end),
        preservedKind: block.preservedKind ?? "rawHtml",
      };
    }),
  };
}

/** Serialise a controlled document back to source in the canonical LF form:
    block serialisations (paragraph `text`, preserved `raw`) joined by a
    blank line with a single final newline; an emptied field serialises to
    `""`. Preserved `raw` slices splice back byte-identical at their block
    positions. Sources whose separators are not LF blank lines (CRLF gaps,
    trailing blank lines) do not survive this emission: separators are
    structural gaps owned by the manifest host-side (spec §6.5), and the
    fixed `RichTextDocument` (§5.1) carries no separator storage. */
export function sourceFromDocument(document: RichTextDocument): string {
  if (
    document.blocks.length === 1 &&
    document.blocks[0]?.kind === "paragraph" &&
    (document.blocks[0]?.text ?? "") === ""
  ) {
    return "";
  }
  const parts = document.blocks.map((block) =>
    block.kind === "preserved" ? (block.raw ?? "") : (block.text ?? ""),
  );
  return `${parts.join("\n\n")}\n`;
}

/** Analysis of a `text/plain` paste payload for the editor pipeline (spec
    §7): refusal kinds in clipboard order deduplicated, insertable paragraph
    texts (Markdown image lines degraded to their alt text, blank lines
    dropped), and the degraded image alts. */
export interface TextPasteAnalysis {
  refusedKinds: string[];
  paragraphs: string[];
  imageAlts: string[];
}

/** Classify a plain-text clipboard payload line-wise. Fenced code, tables,
    headings, lists, blockquotes, horizontal rules and raw-HTML lines refuse
    the paste whole; standalone Markdown images degrade to their alt text. */
export function analyzeTextPaste(text: string): TextPasteAnalysis {
  const refusedKinds: string[] = [];
  const paragraphs: string[] = [];
  const imageAlts: string[] = [];
  const report = (kind: string): void => {
    if (!refusedKinds.includes(kind)) refusedKinds.push(kind);
  };
  const lines = text.split(/\r\n|\n|\r/);
  let i = 0;
  let pending: string[] = [];
  const flushPending = (): void => {
    if (pending.length === 0) return;
    if (isMarkdownTableBlock(pending)) {
      report("table");
    } else {
      for (const line of pending) paragraphs.push(line);
    }
    pending = [];
  };
  const isHtmlLine = (line: string): boolean => /^\s*<\/?[A-Za-z!]/.test(line);
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const fence = matchFenceOpen(line);
    if (fence) {
      flushPending();
      report("codeBlock");
      i += 1;
      while (i < lines.length && !isFenceClose(lines[i] ?? "", fence)) i += 1;
      if (i < lines.length) i += 1;
      continue;
    }
    if (line.trim() === "") {
      flushPending();
      i += 1;
      continue;
    }
    if (isHeadingLine(line)) {
      flushPending();
      report("heading");
      i += 1;
      continue;
    }
    if (isListItemLine(line)) {
      flushPending();
      report("list");
      i += 1;
      while (
        i < lines.length &&
        (lines[i]?.trim() === "" ||
          isListItemLine(lines[i] ?? "") ||
          /^[ \t]/.test(lines[i] ?? ""))
      ) {
        if ((lines[i]?.trim() ?? "") === "") break;
        i += 1;
      }
      continue;
    }
    if (isBlockquoteLine(line)) {
      flushPending();
      report("blockquote");
      i += 1;
      continue;
    }
    if (isHorizontalRuleLine(line)) {
      flushPending();
      report("horizontalRule");
      i += 1;
      continue;
    }
    if (isMarkdownImageLine(line)) {
      flushPending();
      report("image");
      const alt = extractMarkdownImageAlt(line) ?? "";
      imageAlts.push(alt);
      if (alt !== "") paragraphs.push(alt);
      i += 1;
      continue;
    }
    if (isHtmlLine(line)) {
      flushPending();
      report("rawHtml");
      i += 1;
      continue;
    }
    pending.push(line);
    i += 1;
  }
  flushPending();
  return { refusedKinds, paragraphs, imageAlts };
}
