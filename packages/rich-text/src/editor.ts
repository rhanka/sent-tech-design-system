// Headless editor factory: document in, document plus gesture out
// (spec §5.3, §5.4, §5.6, §7).
//
// The headless factory is the framework-neutral core of the editor: it owns
// the controlled document, applies one user-perceived gesture at a time,
// and emits exactly one `RichTextChangeEvent` (complete document plus
// gesture provenance, no diff) per gesture. It imports no runtime, touches
// no DOM global, and performs no network access. The Svelte adapter (RT-1)
// drives the same contract against the live Tiptap instance; this factory
// is the internal, testable surface of that contract.
//
// Semantics implemented here:
// - Controlled: initialised from a copy of `options.document`, never
//   mutating the prop. Every emitted document is an independent copy with
//   exact keys (`paragraph` blocks carry `paragraphId`/`kind`/`text` only;
//   `preserved` blocks carry `paragraphId`/`kind`/`raw`/`preservedKind`
//   only), so hosts can key-inspect the surface (§5.3, gesture test).
// - One gesture emits exactly one event; a gesture that leaves the document
//   value-equal to the current one emits nothing (§5.3, §5.6 equality).
// - Read-only (`editable: false`) and form-disabled (`disabled: true`) are
//   inert: no mutation, no `onChange`, no `onUnsupportedPaste`, no
//   save-like callback, including through paste and undo/redo.
//   `disabled` wins over `editable`. State changes emit nothing.
// - Text operations are block-local and never call the codec segmentation
//   entry: a keystroke touches only its block, preserved `raw` values carry
//   through by value (§13.3 reactivity invariants).
// - Paste is parsed against the P0 schema only (§7): identity attributes
//   are stripped (only text survives, so no attribute can pass) and fresh
//   identities allocated; scriptable markup, event handlers, links and
//   remote images never become executable or fetchable content; an image
//   `alt` kept from an otherwise accepted paste is inserted as plain text
//   while the dropped image is reported; a payload that would create any
//   non-paragraph block is refused whole (one `onUnsupportedPaste`, zero
//   `onChange`, document and selection unchanged).
// - External updates follow spec §5.6 rules 1–4 in order (echo
//   acknowledgement without replacement, composition deferral, conflict
//   surfacing without overwrite, automatic no-conflict application). No
//   path silently overwrites locally divergent work; blur never cleans it.
//   History stacks are left untouched by external applications.
// - `captureDocument()` resolves immediately when ready; during
//   composition it waits for the commit and resolves once with the
//   committed document, never with a pre-composition snapshot. A capture
//   still pending at `destroy()` rejects once with the neutral capture
//   error (spec §5.6); calls after destruction return an already-rejected
//   promise; `readiness()` after destruction returns
//   `{ composing: false, ready: false }`. The headless factory has no
//   composition input, so `composing` stays false here; the branches exist
//   so the runtime editor shares the same termination semantics.

import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextEditorHandle,
  RichTextExternalConflictEvent,
  RichTextFormat,
  RichTextGesture,
  RichTextGestureKind,
  RichTextReadiness,
  RichTextUnsupportedPasteEvent,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";
import {
  RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE,
  RICH_TEXT_CAPTURE_UNAVAILABLE_NAME,
} from "./model.js";
import { analyzeTextPaste } from "./codec.js";

/** Clipboard payload for `paste()`: `text/html` when present, else
    `text/plain`. Payloads built by `copyToPayload()` from live block
    identities carry the internal origin; every other payload is external. */
export interface PastePayload {
  text?: string;
  html?: string;
}

/** Logical selection snapshot (block identity plus intra-paragraph offset).
    Positions are never emitted as identity; this snapshot exists so tests
    and hosts can assert caret preservation across updates. */
export interface RichTextSelectionSnapshot {
  anchorParagraphId: string | null;
  anchorOffset: number;
}

export interface HeadlessEditorCallbacks {
  onChange?: (event: RichTextChangeEvent) => void;
  onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
  onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
  onReadinessChange?: (event: RichTextReadiness) => void;
}

export interface HeadlessEditorOptions extends HeadlessEditorCallbacks {
  document: RichTextDocument;
  messages: RichTextMessages;
  allocateId?: () => string;
  editable?: boolean;
  disabled?: boolean;
}

export interface HeadlessEditor extends RichTextEditorHandle {
  getDocument(): RichTextDocument;
  getSelection(): RichTextSelectionSnapshot;
  setEditable(editable: boolean): void;
  setDisabled(disabled: boolean): void;
  typeText(paragraphId: string, text: string): void;
  clearParagraph(paragraphId: string): void;
  splitParagraph(paragraphId: string, offset: number): void;
  mergeWithPrevious(paragraphId: string): void;
  deleteBlocks(paragraphIds: readonly string[]): void;
  undo(): void;
  redo(): void;
  copyToPayload(paragraphIds: readonly string[]): PastePayload;
  paste(payload: PastePayload): void;
  applyExternalUpdate(next: RichTextDocument): void;
  destroy(): void;
}

interface InternalBlock {
  paragraphId: string;
  kind: "paragraph" | "preserved";
  text: string;
  raw: string;
  preservedKind: string;
}

function normalizeBlock(block: RichTextBlock): InternalBlock {
  if (block.kind === "preserved") {
    return {
      paragraphId: block.paragraphId,
      kind: "preserved",
      text: "",
      raw: block.raw ?? "",
      preservedKind: block.preservedKind ?? "",
    };
  }
  return {
    paragraphId: block.paragraphId,
    kind: "paragraph",
    text: block.text ?? "",
    raw: "",
    preservedKind: "",
  };
}

function publicBlock(block: InternalBlock): RichTextBlock {
  if (block.kind === "preserved") {
    return {
      paragraphId: block.paragraphId,
      kind: "preserved",
      raw: block.raw,
      preservedKind: block.preservedKind,
    };
  }
  return {
    paragraphId: block.paragraphId,
    kind: "paragraph",
    text: block.text,
  };
}

/** Document value equality (spec §5.6): format, length, order, and every
    significant field with absent-equals-absent strictness. Never a diff. */
function documentsEqual(
  left: { format: string; blocks: readonly InternalBlock[] },
  right: { format: string; blocks: readonly InternalBlock[] },
): boolean {
  if (left.format !== right.format) return false;
  if (left.blocks.length !== right.blocks.length) return false;
  return left.blocks.every((block, index) => {
    const other = right.blocks[index];
    if (!other) return false;
    return (
      block.paragraphId === other.paragraphId &&
      block.kind === other.kind &&
      block.text === other.text &&
      block.raw === other.raw &&
      block.preservedKind === other.preservedKind
    );
  });
}

function makeCaptureError(): Error {
  const error = new Error(RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE);
  error.name = RICH_TEXT_CAPTURE_UNAVAILABLE_NAME;
  return error;
}

function defaultAllocateId(): string {
  const cryptoObject = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();
  return `paragraph:generated-${Math.floor(Math.random() * 2 ** 32).toString(16)}`;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);/g, (_match, digits: string) =>
      String.fromCodePoint(Number.parseInt(digits, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

interface HtmlPasteAnalysis {
  refusedKinds: string[];
  paragraphs: string[];
  imageSeen: boolean;
}

/** Parse an HTML clipboard payload against the P0 schema (spec §7).
    Only text survives: every tag (with its attributes) is dropped, so no
    `data-paragraph-id`, event handler, link target or image source can pass.
    Scriptable elements and their content vanish silently; standalone images
    degrade to their alt text with the `image` kind reported. */
function analyzeHtmlPaste(html: string): HtmlPasteAnalysis {
  const refusedKinds: string[] = [];
  const report = (kind: string): void => {
    if (!refusedKinds.includes(kind)) refusedKinds.push(kind);
  };
  let work = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "noscript",
    "template",
    "link",
    "meta",
  ]) {
    work = work.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "");
    work = work.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }
  // Standalone images degrade to their alt text: swap each <img> for a
  // sentinel carrying its alt so positions survive tag stripping.
  const alts: string[] = [];
  work = work.replace(/<img\b[^>]*>/gi, (tag) => {
    const match = /alt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    const alt = match ? (match[2] ?? match[3] ?? match[4] ?? "") : "";
    const index = alts.length;
    alts.push(alt);
    return `${index}`;
  });
  const imageSeen = alts.length > 0;
  if (imageSeen) report("image");
  // Refusal scan in clipboard order: any non-paragraph block kind refuses
  // the whole paste (spec §7 rule 5). Plain containers (div, section,
  // span, p) never refuse; their text is unwrapped below.
  const refusalTags: { pattern: RegExp; kind: string }[] = [
    { pattern: /<\s*table\b/i, kind: "table" },
    { pattern: /<\s*pre\b/i, kind: "codeBlock" },
    { pattern: /<\s*h[1-6]\b/i, kind: "heading" },
    { pattern: /<\s*(ul|ol|li|dl|dt|dd)\b/i, kind: "list" },
    { pattern: /<\s*blockquote\b/i, kind: "blockquote" },
    { pattern: /<\s*hr\b/i, kind: "horizontalRule" },
    { pattern: /<\s*figure\b/i, kind: "image" },
  ];
  const hits: { index: number; kind: string }[] = [];
  for (const { pattern, kind } of refusalTags) {
    pattern.lastIndex = 0;
    const match = pattern.exec(work);
    if (match) hits.push({ index: match.index, kind });
  }
  hits.sort((a, b) => a.index - b.index);
  for (const hit of hits) report(hit.kind);
  const refusing = refusedKinds.some((kind) => kind !== "image");
  if (refusing) return { refusedKinds, paragraphs: [], imageSeen };
  const paragraphs: string[] = [];
  const pushChunk = (chunk: string): void => {
    const text = chunk.trim();
    if (text !== "") paragraphs.push(text);
  };
  const sentinelPattern = /(\d+)/g;
  const expandSentinels = (text: string): string =>
    text.replace(sentinelPattern, (_match, digits: string) => {
      const alt = alts[Number(digits)] ?? "";
      return alt === "" ? "" : `\n${alt}\n`;
    });
  const paragraphPattern = /<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi;
  let remainder = work;
  let paragraphMatch = paragraphPattern.exec(work);
  while (paragraphMatch) {
    const inner = paragraphMatch[1] ?? "";
    const withBreaks = inner.replace(/<br\s*\/?>/gi, "\n");
    const stripped = withBreaks.replace(/<[^>]*>/g, "");
    for (const line of expandSentinels(decodeEntities(stripped)).split("\n")) {
      const text = line.trim();
      if (text !== "") pushChunk(text);
    }
    remainder = remainder.replace(paragraphMatch[0], "\n");
    paragraphMatch = paragraphPattern.exec(work);
  }
  const bare = expandSentinels(decodeEntities(remainder.replace(/<[^>]*>/g, "")));
  for (const line of bare.split("\n")) {
    const text = line.trim().replace(/\s+/g, " ");
    if (text !== "") pushChunk(text);
  }
  return { refusedKinds, paragraphs, imageSeen };
}

interface EditorSnapshot {
  blocks: InternalBlock[];
  selection: RichTextSelectionSnapshot;
}

/** Create the headless editor: document in, document plus gesture out.
    The factory copies the supplied document, initialises the acknowledgement
    reference to that copy, and never mutates the caller's value. */
export function createHeadlessEditor(
  options: HeadlessEditorOptions,
): HeadlessEditor {
  const allocate = options.allocateId ?? defaultAllocateId;
  let editable = options.editable ?? true;
  let disabled = options.disabled ?? false;
  const callbacks: HeadlessEditorCallbacks = {
    onChange: options.onChange,
    onExternalConflict: options.onExternalConflict,
    onUnsupportedPaste: options.onUnsupportedPaste,
    onReadinessChange: options.onReadinessChange,
  };
  let displayed: InternalBlock[] = options.document.blocks.map(normalizeBlock);
  let documentFormat: RichTextFormat = options.document.format;
  let lastAcknowledged: InternalBlock[] = options.document.blocks.map(normalizeBlock);
  let selection: RichTextSelectionSnapshot = {
    anchorParagraphId: displayed[0]?.paragraphId ?? null,
    anchorOffset: 0,
  };
  const past: EditorSnapshot[] = [];
  const future: EditorSnapshot[] = [];
  const retiredIds = new Set<string>();
  const internalPayloads = new Set<PastePayload>();
  let gestureSequence = 0;
  let destroyed = false;
  // Headless composition state. The headless surface has no composition
  // input, so this stays false; the branches below exist so the runtime
  // editor shares the same rule-2 deferral and capture-wait semantics.
  const composing = false;
  let deferredExternal: InternalBlock[] | null = null;
  let deferredFormat: RichTextFormat | null = null;
  const pendingCaptures: {
    resolve: (document: RichTextDocument) => void;
    reject: (error: Error) => void;
  }[] = [];

  const isActive = (): boolean => editable && !disabled;

  const snapshotBlocks = (blocks: InternalBlock[]): InternalBlock[] =>
    blocks.map((block) => ({ ...block }));

  const snapshotDocument = (
    blocks: InternalBlock[],
    format: RichTextFormat = documentFormat,
  ): RichTextDocument => ({
    format,
    blocks: blocks.map(publicBlock),
  });

  const currentDocument = (): RichTextDocument => snapshotDocument(displayed);

  const allocateFresh = (): string => {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const id = allocate();
      if (!retiredIds.has(id)) return id;
    }
    return allocate();
  };

  const pushHistory = (): void => {
    past.push({
      blocks: snapshotBlocks(displayed),
      selection: { ...selection },
    });
    future.length = 0;
  };

  const emitChange = (
    kind: RichTextGestureKind,
    affectedParagraphIds: readonly string[],
    extra?: Partial<Pick<RichTextGesture, "split" | "merge" | "paste">>,
  ): void => {
    if (destroyed) return;
    gestureSequence += 1;
    const gesture: RichTextGesture = {
      gestureId: `gesture:${gestureSequence}`,
      kind,
      affectedParagraphIds: [...affectedParagraphIds],
      ...extra,
    };
    callbacks.onChange?.({ document: currentDocument(), gesture });
  };

  const blockIndex = (paragraphId: string): number =>
    displayed.findIndex((block) => block.paragraphId === paragraphId);

  const editor: HeadlessEditor = {
    getDocument(): RichTextDocument {
      return currentDocument();
    },

    getSelection(): RichTextSelectionSnapshot {
      return { ...selection };
    },

    setEditable(next: boolean): void {
      if (destroyed) return;
      editable = next;
    },

    setDisabled(next: boolean): void {
      if (destroyed) return;
      disabled = next;
    },

    typeText(paragraphId: string, text: string): void {
      if (destroyed || !isActive()) return;
      const index = blockIndex(paragraphId);
      const block = displayed[index];
      if (!block || block.kind !== "paragraph") return;
      if (text === "") return;
      pushHistory();
      block.text += text;
      selection = { anchorParagraphId: block.paragraphId, anchorOffset: block.text.length };
      emitChange("type", [block.paragraphId]);
    },

    clearParagraph(paragraphId: string): void {
      if (destroyed || !isActive()) return;
      const index = blockIndex(paragraphId);
      const block = displayed[index];
      if (!block || block.kind !== "paragraph") return;
      if (block.text === "") return;
      pushHistory();
      block.text = "";
      selection = { anchorParagraphId: block.paragraphId, anchorOffset: 0 };
      emitChange("type", [block.paragraphId]);
    },

    splitParagraph(paragraphId: string, offset: number): void {
      if (destroyed || !isActive()) return;
      const index = blockIndex(paragraphId);
      const block = displayed[index];
      if (!block || block.kind !== "paragraph") return;
      const clamped = Math.max(0, Math.min(offset, block.text.length));
      pushHistory();
      const tailId = allocateFresh();
      const head = block.text.slice(0, clamped);
      const tail = block.text.slice(clamped);
      block.text = head;
      const tailBlock: InternalBlock = {
        paragraphId: tailId,
        kind: "paragraph",
        text: tail,
        raw: "",
        preservedKind: "",
      };
      displayed.splice(index + 1, 0, tailBlock);
      selection = { anchorParagraphId: tailId, anchorOffset: 0 };
      emitChange("split", [block.paragraphId, tailId], {
        split: { sourceParagraphId: block.paragraphId, newParagraphIds: [tailId] },
      });
    },

    mergeWithPrevious(paragraphId: string): void {
      if (destroyed || !isActive()) return;
      const index = blockIndex(paragraphId);
      const block = displayed[index];
      const previous = index > 0 ? displayed[index - 1] : undefined;
      if (!block || !previous) return;
      if (block.kind !== "paragraph" || previous.kind !== "paragraph") return;
      pushHistory();
      const survivorOffset = previous.text.length;
      previous.text += block.text;
      retiredIds.add(block.paragraphId);
      displayed.splice(index, 1);
      selection = { anchorParagraphId: previous.paragraphId, anchorOffset: survivorOffset };
      emitChange("merge", [previous.paragraphId], {
        merge: {
          survivingParagraphId: previous.paragraphId,
          retiredParagraphIds: [block.paragraphId],
        },
      });
    },

    deleteBlocks(paragraphIds: readonly string[]): void {
      if (destroyed || !isActive()) return;
      const wanted = new Set(paragraphIds);
      const removed = displayed
        .filter((block) => wanted.has(block.paragraphId))
        .map((block) => block.paragraphId);
      if (removed.length === 0) return;
      pushHistory();
      displayed = displayed.filter((block) => !wanted.has(block.paragraphId));
      selection = {
        anchorParagraphId: displayed[0]?.paragraphId ?? null,
        anchorOffset: 0,
      };
      emitChange("delete", removed);
    },

    undo(): void {
      if (destroyed || !isActive()) return;
      const previous = past.pop();
      if (!previous) return;
      future.push({
        blocks: snapshotBlocks(displayed),
        selection: { ...selection },
      });
      displayed = previous.blocks;
      selection = previous.selection;
      emitChange(
        "undo",
        displayed.map((block) => block.paragraphId),
      );
    },

    redo(): void {
      if (destroyed || !isActive()) return;
      const next = future.pop();
      if (!next) return;
      past.push({
        blocks: snapshotBlocks(displayed),
        selection: { ...selection },
      });
      displayed = next.blocks;
      selection = next.selection;
      emitChange(
        "redo",
        displayed.map((block) => block.paragraphId),
      );
    },

    copyToPayload(paragraphIds: readonly string[]): PastePayload {
      const wanted = new Set(paragraphIds);
      const texts = displayed
        .filter((block) => wanted.has(block.paragraphId))
        .map((block) => (block.kind === "paragraph" ? block.text : block.raw));
      const payload: PastePayload = { text: texts.join("\n") };
      internalPayloads.add(payload);
      return payload;
    },

    paste(payload: PastePayload): void {
      if (destroyed || !isActive()) return;
      const html = payload?.html ?? "";
      const text = payload?.text ?? "";
      const formats: ("text/html" | "text/plain")[] = [];
      if (html !== "") formats.push("text/html");
      if (text !== "") formats.push("text/plain");
      if (formats.length === 0) return;
      const origin = internalPayloads.has(payload) ? "internal" : "external";
      if (html !== "") {
        const analysis = analyzeHtmlPaste(html);
        if (analysis.paragraphs.length === 0 && analysis.refusedKinds.length === 0) {
          if (analysis.imageSeen) {
            callbacks.onUnsupportedPaste?.({
              rejectedKinds: ["image"],
              clipboardFormats: formats,
            });
          } else if (text !== "") {
            editor.paste({ text });
          }
          return;
        }
        if (analysis.paragraphs.length === 0 || analysis.refusedKinds.some((kind) => kind !== "image")) {
          callbacks.onUnsupportedPaste?.({
            rejectedKinds: [...analysis.refusedKinds],
            clipboardFormats: formats,
          });
          return;
        }
        insertPasteParagraphs(analysis.paragraphs, origin);
        if (analysis.imageSeen) {
          callbacks.onUnsupportedPaste?.({
            rejectedKinds: ["image"],
            clipboardFormats: formats,
          });
        }
        return;
      }
      const analysis = analyzeTextPaste(text);
      const refusing = analysis.refusedKinds.filter((kind) => kind !== "image");
      if (refusing.length > 0) {
        callbacks.onUnsupportedPaste?.({
          rejectedKinds: [...analysis.refusedKinds],
          clipboardFormats: formats,
        });
        return;
      }
      if (analysis.paragraphs.length === 0) {
        if (analysis.imageAlts.length > 0) {
          callbacks.onUnsupportedPaste?.({
            rejectedKinds: ["image"],
            clipboardFormats: formats,
          });
        }
        return;
      }
      insertPasteParagraphs(analysis.paragraphs, origin);
      if (analysis.imageAlts.length > 0) {
        callbacks.onUnsupportedPaste?.({
          rejectedKinds: ["image"],
          clipboardFormats: formats,
        });
      }
    },

    applyExternalUpdate(next: RichTextDocument): void {
      if (destroyed) return;
      const incoming: InternalBlock[] = next.blocks.map(normalizeBlock);
      const incomingFormat = next.format;
      const incomingDoc = { format: incomingFormat, blocks: incoming };
      const shown = { format: documentFormat, blocks: displayed };
      // Rule 1 — echo: suppression of replacement plus acknowledgement.
      // The format is part of the equality: only the mount format ever
      // flows here, so a format change falls through to the rules below.
      if (incomingFormat === documentFormat && documentsEqual(shown, incomingDoc)) {
        lastAcknowledged = snapshotBlocks(incoming);
        return;
      }
      // Rule 2 — composition: defer, neither apply nor signal yet.
      if (composing) {
        deferredExternal = snapshotBlocks(incoming);
        deferredFormat = incomingFormat;
        return;
      }
      // Rule 3 — local divergence: never overwrite, surface the conflict.
      if (!documentsEqual(shown, { format: documentFormat, blocks: lastAcknowledged })) {
        callbacks.onExternalConflict?.({
          incoming: snapshotDocument(incoming, incomingFormat),
          local: currentDocument(),
        });
        return;
      }
      // Rule 4 — no conflict: apply automatically and re-anchor the
      // selection by paragraph identity plus intra-paragraph offset.
      displayed = snapshotBlocks(incoming);
      documentFormat = incomingFormat;
      const anchor = displayed.find(
        (block) => block.paragraphId === selection.anchorParagraphId,
      );
      if (anchor) {
        const extent = (anchor.kind === "paragraph" ? anchor.text : anchor.raw).length;
        selection = {
          anchorParagraphId: anchor.paragraphId,
          anchorOffset: Math.min(selection.anchorOffset, extent),
        };
      } else {
        selection = {
          anchorParagraphId: displayed[0]?.paragraphId ?? null,
          anchorOffset: 0,
        };
      }
      lastAcknowledged = snapshotBlocks(incoming);
    },

    captureDocument(): Promise<RichTextDocument> {
      if (destroyed) return Promise.reject(makeCaptureError());
      if (composing) {
        return new Promise<RichTextDocument>((resolve, reject) => {
          pendingCaptures.push({ resolve, reject });
        });
      }
      return Promise.resolve(currentDocument());
    },

    readiness(): RichTextReadiness {
      if (destroyed) return { composing: false, ready: false };
      return { composing, ready: !composing };
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      const pending = pendingCaptures.splice(0, pendingCaptures.length);
      for (const capture of pending) capture.reject(makeCaptureError());
    },
  };

  function insertPasteParagraphs(
    paragraphs: readonly string[],
    origin: "internal" | "external",
  ): void {
    if (paragraphs.length === 0) return;
    pushHistory();
    const inserted: InternalBlock[] = paragraphs.map((paragraphText) => ({
      paragraphId: allocateFresh(),
      kind: "paragraph" as const,
      text: paragraphText,
      raw: "",
      preservedKind: "",
    }));
    const anchorIndex = displayed.findIndex(
      (block) => block.paragraphId === selection.anchorParagraphId,
    );
    const at = anchorIndex >= 0 ? anchorIndex + 1 : displayed.length;
    displayed.splice(at, 0, ...inserted);
    const last = inserted[inserted.length - 1];
    if (last) {
      selection = { anchorParagraphId: last.paragraphId, anchorOffset: last.text.length };
    }
    // Insertion always changes the document, so exactly one event follows.
    emitChange(
      "paste",
      inserted.map((block) => block.paragraphId),
      {
        paste: {
          insertedParagraphIds: inserted.map((block) => block.paragraphId),
          origin,
        },
      },
    );
  }

  return editor;
}
