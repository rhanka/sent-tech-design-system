// Framework-neutral controlled document model (spec §5.1, §5.3, §5.5, §5.6,
// canvas-live CL-2F §4.3.2).
// Type declarations only (the fixed contract). No runtime behaviour lives here.

import type {
  FullBlockMetadata,
  RichTextInlineMarks,
} from "./collaboration.js";

export type RichTextFormat =
  | "focus.markdown.p0@1"
  | "text/plain"
  | "ds.markdown.full@1";

/** One inline segment of a full text block (spec §4.3.2). */
export type FullInlineSegment =
  | { type: "text"; text: string; marks: RichTextInlineMarks }
  | { type: "hardBreak" };

export interface RichTextBlock {
  /** Opaque per-block identity, host-supplied. See spec §5.2. */
  paragraphId: string;
  kind: "paragraph" | "preserved" | "horizontalRule";
  /** Editable paragraph text (Markdown inline source for
      `focus.markdown.p0@1`, literal text for `text/plain`).
      Present iff kind === "paragraph" on a P0 document. Full text blocks
      carry `segments`/`metadata` instead and never use this field. */
  text?: string;
  /** Verbatim source slice of a preserved block. Present iff
      kind === "preserved". Never edited, never reserialised. */
  raw?: string;
  /** Preserved block kind as segmented host-side (e.g. "heading",
      "list", "table", "codeBlock", "diagram"). Display only. */
  preservedKind?: string;
  /** Full text-block metadata (spec R-FULL-META-1). Present iff this block
      belongs to a `ds.markdown.full@1` document and kind is "paragraph".
      Absent materializes the canonical plain defaults on capture. */
  metadata?: FullBlockMetadata;
  /** Full wrapper metadata of a horizontal-rule atom (spec R-FULL-HR-1).
      Wrapper/grouping keys only; never `blockKind`, `headingLevel` or
      `codeLanguage`. Absent materializes the canonical defaults. */
  hrMetadata?: FullBlockMetadata;
  /** Ordered inline runs of a full text block (spec §4.3.2). Present iff
      this block belongs to a `ds.markdown.full@1` document and kind is
      "paragraph". Code lines are `hardBreak` segments per R-FULL-CODE-1. */
  segments?: readonly FullInlineSegment[];
}

export interface RichTextDocument {
  format: RichTextFormat;
  blocks: readonly RichTextBlock[];
}

export type RichTextGestureKind =
  | "type"
  | "split"
  | "merge"
  | "paste"
  | "delete"
  | "undo"
  | "redo"
  | "composition-commit";

/** Gesture provenance. Exactly what the host adapter needs to follow
    block identities across the gesture; no text diff is carried. */
export interface RichTextGesture {
  /** Opaque identifier of this completed gesture, allocated by the component. */
  gestureId: string;
  kind: RichTextGestureKind;
  /** Ordered `paragraphId` values of the blocks the gesture touched,
      in resulting document order. */
  affectedParagraphIds: readonly string[];
  /** Present iff kind === "split": the block that was split and the fresh
      identities allocated for the tail blocks, in document order. */
  split?: {
    sourceParagraphId: string;
    newParagraphIds: readonly string[];
  };
  /** Present iff kind === "merge": the surviving identity and the identities
      consumed by the merge, which the component never reallocates. */
  merge?: {
    survivingParagraphId: string;
    retiredParagraphIds: readonly string[];
  };
  /** Present iff kind === "paste": the freshly allocated identities of the
      inserted blocks and whether the paste entered from inside this editor
      session or from outside it. */
  paste?: {
    insertedParagraphIds: readonly string[];
    origin: "internal" | "external";
  };
}

/** Representability of the emitted wires (§6.6). Identities only: no text,
    no diff, no Focus type. Empty when every paragraph is representable. */
export interface RichTextRepresentability {
  nonRepresentableParagraphIds: readonly string[];
}

export interface RichTextChangeEvent {
  /** The complete new controlled value. The only content the component emits. */
  document: RichTextDocument;
  /** Provenance of the single completed gesture that produced `document`. */
  gesture: RichTextGesture;
  /** Paragraphs of `document` whose wire is non-representable (§6.6). */
  representability: RichTextRepresentability;
}

/** A paste the profile refused. Carries kinds only: no pasted text, no HTML,
    no host-side type (spec §5.5). */
export interface RichTextUnsupportedPasteEvent {
  /** Non-paragraph block kinds the paste would have created, in clipboard
      order, deduplicated (e.g. "table", "codeBlock", "heading", "list",
      "blockquote", "image", "horizontalRule", "rawHtml"). */
  rejectedKinds: readonly string[];
  clipboardFormats: readonly ("text/html" | "text/plain")[];
}

/** An external controlled update that arrived while the editor held local,
    unacknowledged work or an in-progress composition (spec §5.6, rule 3).
    The component keeps the local document untouched; the host decides. */
export interface RichTextExternalConflictEvent {
  incoming: RichTextDocument;
  local: RichTextDocument;
}

export interface RichTextReadiness {
  /** True while an IME composition is in progress in the editor. */
  composing: boolean;
  /** True iff no composition is in progress and the last emitted document
      is the displayed revision. The host captures only when ready. */
  ready: boolean;
}

/** Capture result (§5.6, §6.6): the captured document plus the
    representability of its wires for that same revision. */
export interface RichTextCaptureResult {
  document: RichTextDocument;
  representability: RichTextRepresentability;
}

/** Deferred-capture surface (spec §5.6). Framework adapters expose this in
    their own idiom (a component reference in Svelte); the headless core
    factory exposes it directly on the editor object. */
export interface RichTextEditorHandle {
  captureDocument(): Promise<RichTextCaptureResult>;
  readiness(): RichTextReadiness;
}

/** Neutral capture error (spec §5.6): a pending `captureDocument()` rejects
    with an `Error` carrying exactly this `name` and `message` when the
    editor is destroyed before the capture settles. */
export const RICH_TEXT_CAPTURE_UNAVAILABLE_NAME =
  "RichTextCaptureUnavailable" as const;
export const RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE =
  "rich-text.capture-unavailable" as const;
export type RichTextCaptureUnavailableName =
  typeof RICH_TEXT_CAPTURE_UNAVAILABLE_NAME;
export type RichTextCaptureUnavailableMessage =
  typeof RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE;
