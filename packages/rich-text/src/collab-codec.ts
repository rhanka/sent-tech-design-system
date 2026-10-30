// Linear Y.Text codec for one editable field (spec §4.3.0, §4.3 R-LIN-1…R-LIN-8).
//
// This module and its siblings (`collab-projection.ts`, `collab-selection.ts`,
// `editor-collaboration.ts`) are the only Yjs-reachable modules in the
// package. They are reachable only from the "./editor" graph: the pure "."
// entry never imports them (asserted by `src/collab-packaging.test.ts`), and
// the controlled editor path never loads them (the factory only
// dynamically imports the binding when a live source is present).
//
// No tree-fragment shared types for editable text, no tree sync or cursor
// plugins, no Tiptap live extensions (§4.1 reuse table).

import * as Y from "yjs";
import { isAllowedHref, validateFullBlockMetadata } from "./collaboration.js";
import type {
  FullBlockMetadata,
  RichTextInlineMarks,
} from "./collaboration.js";
import type {
  FullInlineSegment,
  RichTextBlock,
  RichTextDocument,
  RichTextFormat,
} from "./model.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
} from "./editor-full-markdown.js";

/** Shared-type name of a field's linear text (spec §4.3 R-DESC-5). */
export function fieldTextName(fieldKey: string): string {
  return `field:${fieldKey}`;
}

/** Shared-type name of a field's block-metadata map (spec R-LIN-8). */
export function fieldMetaName(fieldKey: string): string {
  return `fieldmeta:${fieldKey}`;
}

export type SeparatorKind = "paragraph" | "preserved" | "horizontalRule";

export interface SeparatorPayload {
  paragraphId: string;
  kind: SeparatorKind;
  preservedKind?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSeparatorValue(value: unknown): value is {
  separator: { paragraphId: string; kind: string; preservedKind?: string };
} {
  if (!isRecord(value)) return false;
  const separator = (value as { separator?: unknown }).separator;
  if (!isRecord(separator)) return false;
  if (typeof separator["paragraphId"] !== "string") return false;
  if (typeof separator["kind"] !== "string") return false;
  return true;
}

export function isHardBreakValue(value: unknown): value is { hardBreak: true } {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 1 && value["hardBreak"] === true;
}

export function isPreservedValue(value: unknown): value is {
  preserved: { raw: string };
} {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== 1) return false;
  const preserved = value["preserved"];
  if (!isRecord(preserved)) return false;
  return typeof preserved["raw"] === "string";
}

export function isHorizontalRuleValue(value: unknown): value is {
  horizontalRule: { paragraphId: string };
} {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== 1) return false;
  const atom = value["horizontalRule"];
  if (!isRecord(atom)) return false;
  return typeof atom["paragraphId"] === "string";
}

/** Admitted boolean mark keys per profile (spec R-LIN-4, R-FULL-MARK-1). */
const P0_BOOLEAN_MARKS: ReadonlySet<string> = new Set(["bold", "italic", "code"]);
const FULL_BOOLEAN_MARKS: ReadonlySet<string> = new Set([
  "bold",
  "italic",
  "code",
  "strike",
  "underline",
]);

function admittedBooleanMarks(format: RichTextFormat): ReadonlySet<string> {
  return format === "ds.markdown.full@1" ? FULL_BOOLEAN_MARKS : P0_BOOLEAN_MARKS;
}

/** Convert shared text attributes to inline marks (embed attributes ignored). */
export function attributesToMarks(
  attributes: Record<string, unknown> | undefined,
  format: RichTextFormat,
): RichTextInlineMarks {
  const marks: RichTextInlineMarks = {};
  if (attributes === undefined) return marks;
  const booleans = admittedBooleanMarks(format);
  for (const [key, value] of Object.entries(attributes)) {
    if (booleans.has(key)) {
      if (value !== true) {
        throw new Error(`rich-text.collab-invalid-mark: mark "${key}" carries no other value shape`);
      }
      (marks as Record<string, unknown>)[key] = true;
      continue;
    }
    if (format === "ds.markdown.full@1" && key === "link") {
      if (typeof value !== "string" || !isAllowedHref(value)) {
        throw new Error("rich-text.collab-invalid-mark: unsafe href refuses the whole update");
      }
      marks.link = value;
      continue;
    }
    if (format === "ds.markdown.full@1" && key === "linkTitle") {
      if (typeof value !== "string") {
        throw new Error('rich-text.collab-invalid-mark: linkTitle is a plain string');
      }
      marks.linkTitle = value;
      continue;
    }
    throw new Error(`rich-text.collab-invalid-mark: mark "${key}" is outside the admitted table`);
  }
  return marks;
}

/** Convert inline marks to shared text attributes (removals are absent). */
export function marksToAttributes(marks: RichTextInlineMarks): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  if (marks.bold === true) attributes["bold"] = true;
  if (marks.italic === true) attributes["italic"] = true;
  if (marks.code === true) attributes["code"] = true;
  if (marks.strike === true) attributes["strike"] = true;
  if (marks.underline === true) attributes["underline"] = true;
  if (typeof marks.link === "string") {
    if (!isAllowedHref(marks.link)) {
      throw new Error("rich-text.forbidden-href: seed carries a link the R-FULL-URL-1 validator refuses");
    }
    attributes["link"] = marks.link;
  }
  if (typeof marks.linkTitle === "string") attributes["linkTitle"] = marks.linkTitle;
  return attributes;
}

// ── P0 inline Markdown (minimal canonical form) ──
//
// The bound P0 text field carries the same Markdown inline source the
// controlled bridge parses, restricted to the P0 mark set
// (`**bold**`, `*italic*`, `` `code` ``). Hard-break positions are "\n" in
// this field (the shared sequence carries the embed; the backslash display
// form is a string-bridge normalisation owned by CL-2F, not by the sequence).
// Full documents never use this path: their segments carry marks directly.

interface P0Run {
  text: string;
  marks: { bold?: true; italic?: true; code?: true };
}

function parseP0Inline(text: string): P0Run[] {
  const runs: P0Run[] = [];
  let current = "";
  let bold = false;
  let italic = false;
  let code = false;
  const flush = (): void => {
    if (current !== "") {
      const marks: P0Run["marks"] = {};
      if (bold) marks.bold = true;
      if (italic) marks.italic = true;
      if (code) marks.code = true;
      runs.push({ text: current, marks });
      current = "";
    }
  };
  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    if (rest.startsWith("**")) {
      flush();
      bold = !bold;
      index += 2;
      continue;
    }
    const char = text[index] as string;
    if (char === "*" && !code) {
      flush();
      italic = !italic;
      index += 1;
      continue;
    }
    if (char === "`") {
      flush();
      code = !code;
      index += 1;
      continue;
    }
    if (char === "\\" && index + 1 < text.length) {
      const next = text[index + 1] as string;
      if (next === "*" || next === "`" || next === "\\" || next === "[") {
        current += next;
        index += 2;
        continue;
      }
    }
    current += char;
    index += 1;
  }
  flush();
  return runs;
}

function escapeP0Text(text: string): string {
  return text.replace(/([\\`*])/g, "\\$1");
}

function serializeP0Runs(runs: P0Run[]): string {
  let output = "";
  for (const run of runs) {
    let piece = escapeP0Text(run.text);
    if (run.marks.code === true) piece = `\`${piece}\``;
    if (run.marks.italic === true) piece = `*${piece}*`;
    if (run.marks.bold === true) piece = `**${piece}**`;
    output += piece;
  }
  return output;
}

// ── Envelope guard (§8.5: field ≤ 2000 paragraphs, doc state ≤ 5 MiB) ──

export const MAX_LIVE_PARAGRAPHS = 2000;
export const MAX_LIVE_STATE_BYTES = 5 * 1024 * 1024;

function estimateSeedBytes(document: RichTextDocument): number {
  let bytes = 0;
  for (const block of document.blocks) {
    bytes += block.paragraphId.length;
    if (block.kind === "paragraph") {
      if (typeof block.text === "string") bytes += block.text.length;
      for (const segment of block.segments ?? []) {
        if (segment.type === "text") bytes += segment.text.length;
        bytes += 1;
      }
      bytes += JSON.stringify(block.metadata ?? null).length;
    } else if (block.kind === "preserved") {
      bytes += (block.raw ?? "").length + (block.preservedKind ?? "").length;
    }
    bytes += 8;
  }
  return bytes;
}

/** Refuse to seed a field beyond the live envelope (witnessed, not silent). */
export function checkDocumentEnvelope(document: RichTextDocument): void {
  if (document.blocks.length > MAX_LIVE_PARAGRAPHS) {
    throw new Error(
      `rich-text.envelope-exceeded: field carries ${document.blocks.length} blocks, envelope allows ${MAX_LIVE_PARAGRAPHS}`,
    );
  }
  if (estimateSeedBytes(document) > MAX_LIVE_STATE_BYTES) {
    throw new Error("rich-text.envelope-exceeded: document estimate exceeds the 5 MiB live envelope");
  }
}

// ── Seeding ──

function writeSeparator(
  ytext: Y.Text,
  index: number,
  payload: SeparatorPayload,
): void {
  if (payload.paragraphId === "") {
    throw new Error("rich-text.collab-invalid-separator: paragraphId must be non-empty");
  }
  if (payload.kind === "preserved") {
    if (typeof payload.preservedKind !== "string" || payload.preservedKind === "") {
      throw new Error("rich-text.collab-invalid-separator: preserved blocks carry a non-empty preservedKind");
    }
    ytext.insertEmbed(index, {
      separator: {
        paragraphId: payload.paragraphId,
        kind: payload.kind,
        preservedKind: payload.preservedKind,
      },
    });
    return;
  }
  ytext.insertEmbed(index, {
    separator: { paragraphId: payload.paragraphId, kind: payload.kind },
  });
}

function insertTextRun(
  ytext: Y.Text,
  index: number,
  text: string,
  attributes?: Record<string, unknown>,
): number {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("rich-text.collab-invalid-text: no string insert contains U+000A");
  }
  if (text === "") return index;
  if (attributes !== undefined && Object.keys(attributes).length > 0) {
    ytext.insert(index, text, attributes);
  } else {
    ytext.insert(index, text);
  }
  return index + text.length;
}

function seedP0Paragraph(
  ytext: Y.Text,
  cursor: number,
  paragraphId: string,
  text: string,
  format: RichTextFormat,
): number {
  writeSeparator(ytext, cursor, { paragraphId, kind: "paragraph" });
  let next = cursor + 1;
  const lines = text.split("\n");
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    if (lineIndex > 0) {
      ytext.insertEmbed(next, { hardBreak: true });
      next += 1;
    }
    const line = lines[lineIndex] as string;
    if (format === "text/plain") {
      next = insertTextRun(ytext, next, line);
      continue;
    }
    // Strip one Markdown hard-break marker when the seed carries the
    // bridge wire form (backslash or two-space run before the newline).
    let content = line;
    if (content.endsWith("\\")) content = content.slice(0, -1);
    else if (content.endsWith("  ")) content = content.slice(0, -2);
    for (const run of parseP0Inline(content)) {
      const attributes: Record<string, unknown> = {};
      if (run.marks.bold === true) attributes["bold"] = true;
      if (run.marks.italic === true) attributes["italic"] = true;
      if (run.marks.code === true) attributes["code"] = true;
      next = insertTextRun(ytext, next, run.text, attributes);
    }
  }
  return next;
}

function seedFullParagraph(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  cursor: number,
  block: RichTextBlock,
): number {
  writeSeparator(ytext, cursor, { paragraphId: block.paragraphId, kind: "paragraph" });
  let next = cursor + 1;
  const segments = block.segments ?? [];
  for (const segment of segments) {
    if (segment.type === "hardBreak") {
      ytext.insertEmbed(next, { hardBreak: true });
      next += 1;
      continue;
    }
    const attributes = marksToAttributes(segment.marks);
    const href = (segment.marks as RichTextInlineMarks).link;
    if (typeof href === "string" && !isAllowedHref(href)) {
      throw new Error("rich-text.forbidden-href: seed carries a link the R-FULL-URL-1 validator refuses");
    }
    next = insertTextRun(ytext, next, segment.text, attributes);
  }
  if (block.metadata !== undefined) {
    fieldMeta.set(block.paragraphId, structuredClone(block.metadata) as unknown);
  }
  return next;
}

/**
 * Seed a field's `Y.Text` and `fieldmeta` map from a `RichTextDocument`
 * (spec §4.3 R-MAP-3: host operation at session open; the DS binding never
 * reseeds mid-session). Clears both shared types first so capture-driven
 * fresh-session seeding restores runs/metadata exactly.
 */
export function seedFieldFromDocument(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  fieldKey: string,
  document: RichTextDocument,
): void {
  void fieldKey;
  checkDocumentEnvelope(document);
  const ydoc = ytext.doc;
  if (ydoc === null) {
    throw new Error("rich-text.collab-no-doc: field Y.Text is not attached to a Y.Doc");
  }
  const idSet = new Set<string>();
  for (const block of document.blocks) {
    if (idSet.has(block.paragraphId)) {
      throw new Error("rich-text.collab-duplicate-id: block paragraphId values are pairwise distinct");
    }
    idSet.add(block.paragraphId);
  }
  ydoc.transact(() => {
    if (ytext.length > 0) ytext.delete(0, ytext.length);
    for (const key of [...fieldMeta.keys()]) fieldMeta.delete(key);
    let cursor = 0;
    for (const block of document.blocks) {
      if (block.kind === "preserved") {
        writeSeparator(ytext, cursor, {
          paragraphId: block.paragraphId,
          kind: "preserved",
          preservedKind: block.preservedKind ?? "",
        });
        cursor += 1;
        ytext.insertEmbed(cursor, { preserved: { raw: block.raw ?? "" } });
        cursor += 1;
        continue;
      }
      if (block.kind === "horizontalRule") {
        writeSeparator(ytext, cursor, { paragraphId: block.paragraphId, kind: "horizontalRule" });
        cursor += 1;
        ytext.insertEmbed(cursor, { horizontalRule: { paragraphId: block.paragraphId } });
        cursor += 1;
        if (block.hrMetadata !== undefined) {
          fieldMeta.set(block.paragraphId, structuredClone(block.hrMetadata) as unknown);
        }
        continue;
      }
      if (block.segments !== undefined || block.metadata !== undefined) {
        if (document.format !== "ds.markdown.full@1") {
          throw new Error("rich-text.profile-format-mismatch: segments require the full profile");
        }
        cursor = seedFullParagraph(ytext, fieldMeta, cursor, block);
        continue;
      }
      cursor = seedP0Paragraph(ytext, cursor, block.paragraphId, block.text ?? "", document.format);
    }
    if (document.retainedRunMetadata !== undefined) {
      for (const [runId, record] of Object.entries(document.retainedRunMetadata)) {
        if (!fieldMeta.has(runId)) {
          fieldMeta.set(runId, structuredClone(record) as unknown);
        }
      }
    }
  });
}

// ── Capture ──

interface OpenBlock {
  paragraphId: string;
  kind: SeparatorKind;
  preservedKind?: string;
  runs: Array<{ text: string; attributes: Record<string, unknown> }>;
  hardBreaks: number;
  preservedRaw?: string;
  hrSeen: boolean;
}

function emptyBlock(payload: SeparatorPayload): OpenBlock {
  return {
    paragraphId: payload.paragraphId,
    kind: payload.kind,
    preservedKind: payload.preservedKind,
    runs: [],
    hardBreaks: 0,
    hrSeen: false,
  };
}

/**
 * Read one field back into a `RichTextDocument` (spec §4.3.1: the canonical
 * capture source; bound code capture reads `Y.Text` plus `fieldmeta`,
 * including hidden format attributes the code view does not display).
 */
export function captureDocumentFromField(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  format: RichTextFormat,
): { document: RichTextDocument; representability: { nonRepresentableParagraphIds: string[] } } {
  validateFieldState(ytext, fieldMeta, format);
  const delta = ytext.toDelta() as Array<{
    insert?: string | Record<string, unknown>;
    attributes?: Record<string, unknown>;
  }>;
  const blocks: OpenBlock[] = [];
  let current: OpenBlock | null = null;
  const seenIds = new Set<string>();
  for (const op of delta) {
    const insert = op.insert;
    if (typeof insert === "object" && insert !== null) {
      if (isSeparatorValue(insert)) {
        if (current !== null) blocks.push(current);
        const payload = insert.separator;
        if (seenIds.has(payload.paragraphId)) {
          throw new Error("rich-text.collab-duplicate-id: block paragraphId values are pairwise distinct");
        }
        seenIds.add(payload.paragraphId);
        // Inherited span attributes on embeds are ignored (R-LIN-4): only
        // the embed value is read, never op.attributes.
        current = emptyBlock({
          paragraphId: payload.paragraphId,
          kind: payload.kind as SeparatorKind,
          preservedKind: payload.preservedKind,
        });
        continue;
      }
      if (current === null) {
        throw new Error("rich-text.collab-invalid-field: first item is a separator embed");
      }
      if (isHardBreakValue(insert)) {
        if (current.kind === "preserved" || current.kind === "horizontalRule") {
          throw new Error("rich-text.collab-invalid-segment: no text inside preserved/HR segments");
        }
        current.hardBreaks += 1;
        current.runs.push({ text: "\n", attributes: {} });
        continue;
      }
      if (isPreservedValue(insert)) {
        if (current.kind !== "preserved") {
          throw new Error("rich-text.collab-invalid-preserved: preserved embed outside its segment");
        }
        current.preservedRaw = insert.preserved.raw;
        continue;
      }
      if (isHorizontalRuleValue(insert)) {
        const atomId = (insert.horizontalRule as { paragraphId: string }).paragraphId;
        if (atomId !== current.paragraphId) {
          throw new Error("rich-text.collab-invalid-hr: mismatched atom identities refuse whole");
        }
        current.hrSeen = true;
        continue;
      }
      throw new Error("rich-text.collab-invalid-embed: unlisted inline embed shape");
    }
    if (typeof insert === "string") {
      if (current === null) {
        throw new Error("rich-text.collab-invalid-field: first item is a separator embed");
      }
      if (insert.includes("\n")) {
        throw new Error("rich-text.collab-invalid-text: no string insert contains U+000A");
      }
      if (current.kind === "preserved" || current.kind === "horizontalRule") {
        throw new Error("rich-text.collab-invalid-segment: no text inside preserved/HR segments");
      }
      current.runs.push({ text: insert, attributes: { ...(op.attributes ?? {}) } });
      continue;
    }
  }
  if (current !== null) blocks.push(current);
  if (blocks.length === 0) {
    throw new Error("rich-text.collab-invalid-field: first item is a separator embed");
  }

  const liveIds = new Set(blocks.map((block) => block.paragraphId));
  const referencedRunIds = new Set<string>();
  if (format === "ds.markdown.full@1") {
    for (const block of blocks) {
      if (block.kind !== "paragraph") continue;
      const record = fieldMeta.get(block.paragraphId) as FullBlockMetadata | undefined;
      const runId = record?.listRunId;
      if (typeof runId === "string" && runId !== "" && !liveIds.has(runId)) {
        referencedRunIds.add(runId);
      }
    }
  }

  const documentBlocks: RichTextBlock[] = [];
  for (const block of blocks) {
    if (block.kind === "preserved") {
      const out: RichTextBlock = { paragraphId: block.paragraphId, kind: "preserved" };
      if (block.preservedRaw !== undefined) out.raw = block.preservedRaw;
      const kinds = fieldMeta.get(block.paragraphId);
      void kinds;
      documentBlocks.push(out);
      const withKind: RichTextBlock = documentBlocks[documentBlocks.length - 1] as RichTextBlock;
      // Preserved kind rides the separator payload (immutable); when the
      // opener carried one, surface it on the block.
      if (block.preservedKind !== undefined && block.preservedKind !== "") {
        withKind.preservedKind = block.preservedKind;
      }
      continue;
    }
    if (block.kind === "horizontalRule") {
      if (!block.hrSeen) {
        throw new Error("rich-text.collab-invalid-hr: half an atom refuses whole");
      }
      const stored = fieldMeta.get(block.paragraphId) as FullBlockMetadata | undefined;
      const out: RichTextBlock = { paragraphId: block.paragraphId, kind: "horizontalRule" };
      out.hrMetadata = stored !== undefined
        ? (structuredClone(stored) as FullBlockMetadata)
        : canonicalHrDefaults();
      documentBlocks.push(out);
      continue;
    }
    if (format === "ds.markdown.full@1") {
      const stored = fieldMeta.get(block.paragraphId) as FullBlockMetadata | undefined;
      const metadata: FullBlockMetadata = stored !== undefined
        ? (structuredClone(stored) as FullBlockMetadata)
        : (canonicalPlainMetadata() as FullBlockMetadata);
      const segments: FullInlineSegment[] = [];
      for (const run of block.runs) {
        if (run.text === "\n") {
          segments.push({ type: "hardBreak" });
          continue;
        }
        segments.push({
          type: "text",
          text: run.text,
          marks: attributesToMarks(run.attributes, format),
        });
      }
      documentBlocks.push({
        paragraphId: block.paragraphId,
        kind: "paragraph",
        metadata,
        segments,
      });
      continue;
    }
    // P0 / text/plain: runs re-serialise to the text field.
    if (format === "text/plain") {
      let text = "";
      for (const run of block.runs) {
        text += run.text;
      }
      documentBlocks.push({ paragraphId: block.paragraphId, kind: "paragraph", text });
      continue;
    }
    const runs: P0Run[] = [];
    for (const run of block.runs) {
      if (run.text === "\n") {
        runs.push({ text: "\n", marks: {} });
        continue;
      }
      const marks = attributesToMarks(run.attributes, format);
      const p0Marks: P0Run["marks"] = {};
      if (marks.bold === true) p0Marks.bold = true;
      if (marks.italic === true) p0Marks.italic = true;
      if (marks.code === true) p0Marks.code = true;
      runs.push({ text: run.text, marks: p0Marks });
    }
    let text = "";
    for (const run of runs) {
      if (run.text === "\n") {
        text += "\n";
        continue;
      }
      text += serializeP0Runs([run]);
    }
    documentBlocks.push({ paragraphId: block.paragraphId, kind: "paragraph", text });
  }

  const retained: Record<string, FullBlockMetadata> = {};
  for (const runId of referencedRunIds) {
    const record = fieldMeta.get(runId) as FullBlockMetadata | undefined;
    if (record !== undefined) {
      retained[runId] = structuredClone(record) as FullBlockMetadata;
    }
  }
  const document: RichTextDocument = { format, blocks: documentBlocks };
  if (Object.keys(retained).length > 0) {
    document.retainedRunMetadata = retained;
  }
  return { document, representability: { nonRepresentableParagraphIds: [] } };
}

// ── Resulting-state validation (§4.11 DS half) ──
//
// Inherited span attributes on separator / hard-break / HR embeds are
// permitted and ignored (R-LIN-4): an update is never refused because an
// embed carries them.

export function validateFieldState(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  format: RichTextFormat,
): void {
  const delta = ytext.toDelta() as Array<{
    insert?: string | Record<string, unknown>;
    attributes?: Record<string, unknown>;
  }>;
  let first = true;
  const seenIds = new Set<string>();
  let currentKind: SeparatorKind | null = null;
  let currentId: string | null = null;
  let contentItems = 0;
  let hrSeen = false;
  const booleans = admittedBooleanMarks(format);

  const flushBlock = (): void => {
    if (currentKind === "horizontalRule" && !hrSeen) {
      throw new Error("rich-text.collab-invalid-hr: half an atom refuses whole");
    }
    if (currentKind === "preserved" && contentItems !== 1) {
      throw new Error("rich-text.collab-invalid-preserved: preserved content is exactly one embed");
    }
    currentKind = null;
    currentId = null;
    contentItems = 0;
    hrSeen = false;
  };

  for (const op of delta) {
    const insert = op.insert;
    if (typeof insert === "object" && insert !== null) {
      if (isSeparatorValue(insert)) {
        if (first) first = false;
        else flushBlock();
        const payload = insert.separator;
        if (payload.paragraphId === "") {
          throw new Error("rich-text.collab-invalid-separator: paragraphId must be non-empty");
        }
        if (seenIds.has(payload.paragraphId)) {
          throw new Error("rich-text.collab-duplicate-id: block paragraphId values are pairwise distinct");
        }
        seenIds.add(payload.paragraphId);
        if (payload.kind !== "paragraph" && payload.kind !== "preserved" && payload.kind !== "horizontalRule") {
          throw new Error(`rich-text.collab-invalid-kind: unlisted boundary kind "${payload.kind}"`);
        }
        if (format !== "ds.markdown.full@1" && payload.kind === "horizontalRule") {
          throw new Error('rich-text.collab-invalid-kind: "horizontalRule" needs the full profile');
        }
        if (payload.kind === "preserved") {
          if (typeof payload.preservedKind !== "string" || payload.preservedKind === "") {
            throw new Error("rich-text.collab-invalid-separator: preserved blocks carry a non-empty preservedKind");
          }
          const extra = Object.keys(payload);
          if (!extra.includes("paragraphId") || !extra.includes("kind") || !extra.includes("preservedKind") || extra.length !== 3) {
            throw new Error("rich-text.collab-invalid-separator: preserved payload carries exactly its admitted keys");
          }
        } else {
          const extra = Object.keys(payload);
          if (extra.length !== 2 || !extra.includes("paragraphId") || !extra.includes("kind")) {
            throw new Error("rich-text.collab-invalid-separator: separator payload carries exactly its admitted keys");
          }
        }
        currentKind = payload.kind;
        currentId = payload.paragraphId;
        continue;
      }
      if (first) {
        throw new Error("rich-text.collab-invalid-field: first item is a separator embed");
      }
      if (isHardBreakValue(insert)) {
        if (currentKind === "preserved" || currentKind === "horizontalRule") {
          throw new Error("rich-text.collab-invalid-segment: no text inside preserved/HR segments");
        }
        continue;
      }
      if (isPreservedValue(insert)) {
        if (currentKind !== "preserved") {
          throw new Error("rich-text.collab-invalid-preserved: preserved embed outside its segment");
        }
        contentItems += 1;
        continue;
      }
      if (isHorizontalRuleValue(insert)) {
        if (currentKind !== "horizontalRule") {
          throw new Error("rich-text.collab-invalid-hr: atom outside its segment");
        }
        const atomId = (insert.horizontalRule as { paragraphId: string }).paragraphId;
        if (atomId !== currentId) {
          throw new Error("rich-text.collab-invalid-hr: mismatched atom identities refuse whole");
        }
        contentItems += 1;
        hrSeen = true;
        continue;
      }
      throw new Error("rich-text.collab-invalid-embed: unlisted inline embed shape");
    }
    if (typeof insert === "string") {
      if (first) {
        throw new Error("rich-text.collab-invalid-field: first item is a separator embed");
      }
      if (insert.includes("\n")) {
        throw new Error("rich-text.collab-invalid-text: no string insert contains U+000A");
      }
      const attributes = op.attributes ?? {};
      for (const [key, value] of Object.entries(attributes)) {
        if (booleans.has(key)) {
          if (value !== true) {
            throw new Error(`rich-text.collab-invalid-mark: mark "${key}" carries no other value shape`);
          }
          continue;
        }
        if (format === "ds.markdown.full@1" && key === "link") {
          if (typeof value !== "string" || !isAllowedHref(value)) {
            throw new Error("rich-text.collab-invalid-mark: unsafe href refuses the whole update");
          }
          continue;
        }
        if (format === "ds.markdown.full@1" && key === "linkTitle") {
          if (typeof value !== "string") {
            throw new Error("rich-text.collab-invalid-mark: linkTitle is a plain string");
          }
          continue;
        }
        throw new Error(`rich-text.collab-invalid-mark: mark "${key}" is outside the admitted table`);
      }
      if (currentKind === "preserved" || currentKind === "horizontalRule") {
        throw new Error("rich-text.collab-invalid-segment: no text inside preserved/HR segments");
      }
      if (format === "text/plain" && Object.keys(attributes).length > 0) {
        throw new Error("rich-text.collab-invalid-mark: text/plain carries no marks");
      }
      contentItems += 1;
      continue;
    }
  }
  flushBlock();

  // Metadata map: P0 carries no entries; full records keep their admitted
  // shapes, run values only on their source, HR wrapper-only subset.
  if (format !== "ds.markdown.full@1") {
    if ([...fieldMeta.keys()].length > 0) {
      throw new Error("rich-text.collab-invalid-meta: P0 carries an empty metadata map");
    }
    return;
  }
  for (const [key, value] of fieldMeta.entries()) {
    const record = value as FullBlockMetadata;
    const validation = validateFullBlockMetadata(record);
    if (!validation.ok) {
      throw new Error(`rich-text.collab-invalid-meta: ${validation.reason ?? "admitted shape"}`);
    }
    if (
      (record.orderedStart !== undefined ||
        record.orderedType !== undefined ||
        record.listTight !== undefined) &&
      record.listRunId !== key
    ) {
      throw new Error("rich-text.collab-invalid-meta: run values live only on their source opener");
    }
    if (!seenIds.has(key)) continue;
    const openerKind = openerKindOf(ytext, key);
    if (openerKind === "horizontalRule") {
      if (
        (record as { blockKind?: unknown }).blockKind !== undefined ||
        (record as { headingLevel?: unknown }).headingLevel !== undefined ||
        (record as { codeLanguage?: unknown }).codeLanguage !== undefined
      ) {
        throw new Error("rich-text.collab-invalid-meta: HR admits wrapper keys only");
      }
    }
  }
}

function openerKindOf(ytext: Y.Text, paragraphId: string): SeparatorKind | null {
  const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
  for (const op of delta) {
    if (typeof op.insert === "object" && op.insert !== null && isSeparatorValue(op.insert)) {
      if (op.insert.separator.paragraphId === paragraphId) {
        return op.insert.separator.kind as SeparatorKind;
      }
    }
  }
  return null;
}
