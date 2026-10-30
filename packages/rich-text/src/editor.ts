// Tiptap-bound editor factory: the "./editor" entry (spec §4.2).
//
// `createRichTextEditor` builds a real Tiptap `Editor` from the P0
// extensions, installs the live paragraph-identity plugin and the
// preserved-block guard, maps `RichTextDocument` to and from the ProseMirror
// document with the `paragraphId` attribute, and converts editable paragraph
// Markdown through `@tiptap/markdown` per paragraph only (`text/plain` is
// literal text: no bridge, no marks, no Markdown rules). Split, merge,
// undo/redo, paste parsing and Markdown conversion are ProseMirror/Tiptap
// behaviour reached through this entry, never re-implemented in the DS.
//
// Contract (spec §5.3, §5.4, §5.6, §7):
// - Controlled: initialised from a copy of `options.document`, never
//   mutating the prop. Every emitted document carries exact keys.
// - One completed gesture emits exactly one `RichTextChangeEvent`; a gesture
//   that leaves the document unchanged emits nothing.
// - Read-only (`editable: false`) and form-disabled (`disabled: true`) are
//   inert: no mutation, no `onChange`, no `onUnsupportedPaste`. `disabled`
//   wins over `editable`. State changes emit nothing.
// - Text operations are ProseMirror transactions; touched blocks derive from
//   the transaction steps and their mapping, so deletions, joins and mark
//   changes invalidate exactly the blocks they cover. Untouched paragraphs
//   keep their seed text byte-identical and preserved `raw` values carry
//   through verbatim (§13.3 reactivity invariants). Conversions memoise the
//   exact source per node version, so undo restores the byte-exact text with
//   no parallel history.
// - Paste enters through the real ProseMirror paste pipeline (`handlePaste`
//   over the native clipboard event, with `transformPastedHTML`,
//   `transformPasted` and `clipboardTextParser` as the fitting layers, all
//   constrained to the P0 schema plus the Markdown bridge for plain-text
//   payloads); pasted identity attributes are stripped before insertion; a
//   payload that would create any non-paragraph block is refused whole; a
//   paste spanning a preserved block is refused with the block intact.
// - Composition hooks `compositionstart`/`compositionend` explicitly (view
//   `composing` state plus DOM events): readiness turns false at start, no
//   `type` fires mid-composition, exactly one `composition-commit` fires
//   after the commit, then a deferred external update is re-evaluated before
//   pending captures resolve. jsdom covers the event wiring; the real-IME
//   witness stays in RT-1 (browser).
// - No user transaction deletes or replaces a preserved node
//   (`filterTransaction` guard; select-all delete is filtered). Only the
//   explicit external-replacement path (mount, rule-4 application) carries
//   the allow-meta and may replace one.
// - External updates apply the pure §5.6 decision from the "." entry to the
//   live instance (suppress replacement, defer, emit `onExternalConflict`,
//   or replace content with both selection ends re-anchored).
// - `captureDocument()` resolves immediately when ready; during composition
//   it waits for the commit and resolves once with the committed document. A
//   revocation discards the composition and rejects a pending capture once
//   with the neutral error without destroying the session; a capture still
//   pending at `destroy()` rejects once with the same error; calls after
//   destruction return an already-rejected promise; `readiness()` after
//   destruction is `{ composing: false, ready: false }`.

import { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
import { DOMSerializer, Fragment, Slice } from "@tiptap/pm/model";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { isHistoryTransaction, redoDepth, undoDepth } from "@tiptap/pm/history";
import type { EditorView } from "@tiptap/pm/view";
import type { MarkdownManager } from "@tiptap/markdown";
import type {
  RetainedRunMetadata,
  RichTextCaptureResult,
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
import type { FieldBindingIdentity } from "./collaboration.js";
import { decodeHrefToken, isAllowedHref } from "./collaboration.js";
import {
  copyRichTextDocument,
  createCaptureTracker,
  decideExternalUpdate,
  richTextDocumentsEqual,
} from "./document.js";
import type { CaptureTracker } from "./document.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import { createP0EditorExtensions, removeHistoryExtension } from "./editor-extensions.js";
import type { P0EditorExtensionOptions } from "./editor-extensions.js";
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
import type { AnyExtension } from "@tiptap/core";
import { FULL_PROFILE_ID } from "./profile.js";
import type { RichTextProfile } from "./profile.js";
import {
  FULL_IDENTITY_NODE_TYPES,
  IDENTITY_FIX_META,
  PRESERVED_REPLACE_META,
  createParagraphIdentityExtension,
  createPreservedGuardExtension,
  createSessionAllocator,
} from "./editor-identity.js";
import {
  createConversionSeeds,
  documentToProseMirror,
  isFullIdentityNode,
  markTouchedFromTransaction,
  proseMirrorToCaptureResult,
  proseMirrorToDocument,
  reseedConversion,
} from "./editor-conversion.js";
import {
  assertFullDocumentLinksAllowed,
  fullDocumentToProseMirror,
  fullProseMirrorToDocument,
} from "./editor-full-document.js";
import {
  codeLiteralSlice,
  planFullHtmlPaste,
  planFullTextPaste,
  sanitizeFullPastedHtml,
  sliceForFullBlocks,
  stripFullIdentityAttributes,
} from "./editor-full-paste.js";
import type { ConversionSeeds } from "./editor-conversion.js";
import {
  planHtmlPaste,
  planLiteralPaste,
  planTextPaste,
  sanitizePastedHtml,
  sliceForParagraphs,
  stripPlannedMarks,
} from "./editor-paste.js";
import type { PastePlan } from "./editor-paste.js";

/** Clipboard payload for `paste()`: `text/html` when present, else
    `text/plain`. Payloads built by `copyToPayload()` carry the internal
    origin; every other payload is external. */
export interface PastePayload {
  text?: string;
  html?: string;
}

/** Logical selection snapshot (block identity plus intra-paragraph offset at
    both ends). Positions are never emitted as identity; this snapshot exists
    so tests and hosts can assert caret and range preservation across
    updates. */
export interface RichTextSelectionSnapshot {
  anchorParagraphId: string | null;
  anchorOffset: number;
  headParagraphId: string | null;
  headOffset: number;
}

/** A surfaced binding error (CL-3a review 2 B-NEW-6): the binding kept the
    previous PM document and a correct shared-state baseline, and reports
    the refusal through this typed event instead of an empty catch. */
export interface RichTextBindingErrorEvent {
  /** Stable binding-error message (`rich-text.collab-*` codes). */
  message: string;
  /** Where the error was contained: a remote application that could not be
      projected, or a local projection that was rolled back on both sides. */
  phase: "remote-application" | "local-projection";
}

export interface RichTextEditorCallbacks {
  onChange?: (event: RichTextChangeEvent) => void;
  onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
  onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
  onReadinessChange?: (event: RichTextReadiness) => void;
  onBindingError?: (event: RichTextBindingErrorEvent) => void;
}

/** Full-profile extension factory, supplied by the separate full module
    graph (`editor-full-extensions.ts`). The editor entry never statically
    imports that graph (review 1 item 11, review 2 blocking 1): an absent/P0
    mount evaluates none of the eight full extension packages. The full
    branch of `createRichTextEditor` loads the graph on demand through a
    dynamic import, so `profile: "full"` stays a single-prop opt-in with no
    registration ceremony. */
export type FullEditorExtensionFactory = (
  options: P0EditorExtensionOptions,
) => AnyExtension[];

let fullExtensionFactory: FullEditorExtensionFactory | null = null;

/** Full-graph registration entry point, called by the lazily loaded
    `editor-full-extensions.ts` module (and idempotent for any other
    caller); the last registration wins. Consumers never call this
    directly: mounting with `profile: "full"` registers on demand. */
export function registerFullEditorExtensions(
  factory: FullEditorExtensionFactory,
): void {
  fullExtensionFactory = factory;
}

export interface RichTextEditorOptions extends RichTextEditorCallbacks {
  document: RichTextDocument;
  /** Content profile (R-FULL-PROFILE-1): `p0` (default) or the CL-2F `full`
      profile. `full` requires `document.format === "ds.markdown.full@1"`; a
      mismatch refuses construction. A profile change is an explicit remount,
      never implicit widening. */
  profile?: RichTextProfile;
  messages: RichTextMessages;
  allocateId?: () => string;
  editable?: boolean;
  disabled?: boolean;
  /** Mount element. Defaults to a detached element; jsdom and browsers both
      satisfy the ProseMirror `document` requirement. */
  element?: HTMLElement;
  /** CL-2 collaboration slot (§6.3, seam 3): the full binding identity of the
      live field this editor is bound to, if any. Empty by default: a
      controlled editor carries `null` and never loads the collaboration
      graph. The slot is identity only — no live session, no shared state, no
      provider call happens here; the Yjs-backed binding (CL-3,
      `editor-collaboration.ts`) resolves sessions against this identity. */
  collaborationBinding?: FieldBindingIdentity | null;
  /** CL-3a live source (§5.7, §6.3 seam 3): the host side of the binding,
      resolving the identity above to the field `Y.Text` plus its metadata
      map. Present together with `collaborationBinding` iff the editor is
      bound; a controlled editor carries `null` and never loads the
      collaboration graph (type-only import: erased at runtime). */
  collaborationSource?: LiveSessionBindingSource | null;
}

export interface RichTextEditor extends RichTextEditorHandle {
  getDocument(): RichTextDocument;
  getSelection(): RichTextSelectionSnapshot;
  /** Live ProseMirror view. Test and adapter escape hatch: tests dispatch
      native clipboard, composition, selection and history commands through
      it; production code never routes around the gesture methods through it.
      It is the same view the factory created, stable for the session. */
  readonly view: EditorView;
  setEditable(editable: boolean): void;
  setDisabled(disabled: boolean): void;
  /** Update the visible placeholder text with no document transaction,
      no event and no acknowledgement: the next placeholder-decoration
      build reads the new text, and the marker decoration reads the new
      `untranslated` value (§5.7). Pass null when the placeholder key is
      translated; pass the `data-untranslated` value while the catalogue
      entry is missing. */
  setPlaceholder(text: string, untranslated: string | null): void;
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
  /** The collaboration binding this editor was constructed with (CL-2 §6.3
      seam 3), or `null` for a controlled editor. Identity only. */
  getBinding(): FieldBindingIdentity | null;
  destroy(): void;
}

function defaultAllocateId(): string {
  const cryptoObject = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();
  return `paragraph:generated-${Math.floor(Math.random() * 2 ** 32).toString(16)}`;
}

/** Create the Tiptap-bound editor: document in, document plus gesture out.
    The factory copies the supplied document, initialises the acknowledgement
    reference to that copy, and never mutates the caller's value.
    `profile: "full"` is a single-prop opt-in (R-FULL-PROFILE-1) with no
    registration ceremony: the full extension graph loads on demand through
    a dynamic import, so full construction is asynchronous while P0
    construction stays synchronous. The async gap precedes the handle, so
    the mount/readiness contract (§5.6, §6.6) is unchanged: the returned
    handle is fully mounted, and adapters bridge the gap with their existing
    mount-pending path (no core yet ⇒ `readiness()` reports not-ready and
    `captureDocument()` is unavailable). */
export function createRichTextEditor(
  options: RichTextEditorOptions & { profile: "full" },
): Promise<RichTextEditor>;
export function createRichTextEditor(
  options: RichTextEditorOptions & {
    collaborationBinding: FieldBindingIdentity;
    collaborationSource: LiveSessionBindingSource;
  },
): Promise<RichTextEditor>;
export function createRichTextEditor(
  options: RichTextEditorOptions,
): RichTextEditor;
export function createRichTextEditor(
  options: RichTextEditorOptions,
): RichTextEditor | Promise<RichTextEditor> {
  const profile: RichTextProfile = options.profile ?? "p0";
  const bound =
    options.collaborationBinding !== undefined &&
    options.collaborationBinding !== null &&
    options.collaborationSource !== undefined &&
    options.collaborationSource !== null;
  // §6.3 seam 3: `"./editor"` accepts the collaboration binding at
  // construction, so a bound mount routes to the bound entry instead of
  // throwing. The route is a dynamic import: the Yjs modules load only on
  // this path, so a controlled mount and the `"."` entry still load no Yjs
  // module (witness 7); a re-export would pull `editor-bound.js` (and the
  // collaboration runtime) into the controlled graph statically, and a new
  // package export would widen the public surface the seam keeps closed.
  if (bound) {
    return (async (): Promise<RichTextEditor> => {
      const boundEntry = await import("./editor-bound.js");
      return boundEntry.createBoundRichTextEditor(options);
    })();
  }
  if (profile !== "full") {
    return buildEditor(options);
  }
  return (async (): Promise<RichTextEditor> => {
    // Lazy full graph (review 2 blocking 1): evaluated here — on the first
    // full mount — never on a P0 path. The module self-registers on import.
    const full = await import("./editor-full-extensions.js");
    full.ensureFullEditorExtensionsRegistered();
    return buildEditor(options);
  })();
}

export interface BoundImpl {
  ytext: { length: number; doc?: { on: (name: string, fn: (transaction: never) => void) => void; off: (name: string, fn: (transaction: never) => void) => void } };
  fieldMeta: { size?: number };
  binding: { identity: FieldBindingIdentity };
  codec: {
    captureDocumentFromField: (
      ytext: never,
      fieldMeta: never,
      format: never,
    ) => { document: RichTextDocument; representability: { nonRepresentableParagraphIds: string[] } };
  };
  projection: {
    BINDING_ORIGIN_META: string;
    buildSelectionMap: (doc: never, ytext: never) => never;
    projectPmTransactionToYText: (binding: never, before: never, tr: never) => string[];
    applyRemoteUpdateIncrementally: (options: never) => { rebuiltParagraphIds: string[] };
    yTextToPmDoc: (ytext: never, fieldMeta: never, format: never, schema: never) => never;
    linearBlocksOf: (ytext: never) => Array<{ paragraphId: string; separatorIndex: number; contentStart: number; contentEnd: number }>;
    affectedBlocksFromDelta: (
      pre: never,
      post: never,
      delta: never,
    ) => string[];
  };
  initialDocument: RichTextDocument;
}

/** Synchronous editor construction over an already-available extension
    graph (P0 always; full only after the lazy loader registered it).
    Exported for the bound entry (`./editor-bound.js`), which supplies the
    collaboration runtime that the controlled graph never loads. */
export function buildEditor(options: RichTextEditorOptions, boundImpl?: BoundImpl): RichTextEditor {
  const profile: RichTextProfile = options.profile ?? "p0";
  const isFull = profile === "full";
  // R-FULL-PROFILE-1: `full` requires `ds.markdown.full@1`; P0 keeps its
  // existing Markdown/literal formats. A mismatch refuses construction.
  // R-FULL-URL-1: a structured full import carrying a forbidden link target
  // refuses the whole construction, never a single silently stripped link.
  if (isFull) {
    if (options.document.format !== FULL_PROFILE_ID) {
      throw new Error(
        `rich-text.profile-format-mismatch: profile "full" requires format "${FULL_PROFILE_ID}"`,
      );
    }
    assertFullDocumentLinksAllowed(options.document);
  } else if (options.document.format === FULL_PROFILE_ID) {
    throw new Error(
      'rich-text.profile-format-mismatch: profile "p0" cannot mount a full document; select profile "full"',
    );
  }
  /** Identity-block names for this profile (P0 pair or full quintet). */
  const isIdentityBlockName = (name: string): boolean =>
    isFull
      ? FULL_IDENTITY_NODE_TYPES.has(name)
      : name === "paragraph" || name === "preservedBlock";
  /** Touched predicate for this profile (P0 pair or full quintet). */
  const touchedPredicate = isFull ? isFullIdentityNode : undefined;
  /** Text parents accepting typed/cleared/split content in this profile. */
  const isTextParentName = (name: string): boolean =>
    name === "paragraph" ||
    name === "heading" ||
    (isFull && name === "codeBlock");
  const retiredIds = new Set<string>();
  const allocateFresh = createSessionAllocator(
    options.allocateId ?? defaultAllocateId,
    retiredIds,
  );
  let editable = options.editable ?? true;
  let disabled = options.disabled ?? false;
  // CL-2 §6.3 seam 3: the slot is identity only. The value is stored and
  // re-readable; nothing here opens a session, touches shared state or calls
  // a provider, so controlled construction never loads the collaboration
  // graph (asserted in `src/cl2-seams.test.ts`). CL-3a adds the live source
  // beside the identity: bound iff both are present. The source type is a
  // type-only import (erased at runtime), so the controlled path still loads
  // no collaboration module.
  const binding: FieldBindingIdentity | null = options.collaborationBinding ?? null;
  const bindingSource: LiveSessionBindingSource | null = options.collaborationSource ?? null;
  // CL-3a bound mode (§4.5): exactly one history mechanism exists in either
  // mode. The Yjs UndoManager itself lands in CL-3b; until then bound
  // undo/redo fail closed through the placeholder below.
  const boundCollaboration = binding !== null && bindingSource !== null;
  let isProjecting = false;
  let lastLinearBlocks: Array<{ paragraphId: string; separatorIndex: number; contentStart: number; contentEnd: number }> | null = null;
  let yTextHandler: ((event: never, transaction: never) => void) | null = null;
  let fieldMetaHandler: ((event: never, transaction: never) => void) | null = null;
  let afterTransactionHandler: ((transaction: never) => void) | null = null;
  const callbacks: RichTextEditorCallbacks = {
    onChange: options.onChange,
    onExternalConflict: options.onExternalConflict,
    onUnsupportedPaste: options.onUnsupportedPaste,
    onReadinessChange: options.onReadinessChange,
    onBindingError: options.onBindingError,
  };
  /** Surface a contained binding error (review 2 B-NEW-6): the previous PM
      document and a correct shared-state baseline are kept; the typed event
      reports the refusal, never an empty catch. */
  const surfaceBindingError = (message: string, phase: "remote-application" | "local-projection"): void => {
    try {
      callbacks.onBindingError?.({ message, phase });
    } catch {
      // A failing host callback never breaks the session.
    }
  };
  const tracker: CaptureTracker = createCaptureTracker({
    onReadinessChange: callbacks.onReadinessChange,
  });
  // Membership only: a payload object built by `copyToPayload()` marks an
  // internal paste. A `WeakSet` holds no copy after its last external
  // reference drops, so a long session never accumulates pastes.
  const internalPayloads = new WeakSet<PastePayload>();
  // Live placeholder text read by the Placeholder extension on every
  // decoration build: a locale switch updates it through `setPlaceholder`
  // with no document transaction, so the visible placeholder re-renders
  // in place (§5.7). The string captured at mount is never the source.
  // The companion marker is decoration-backed for the same reason: a
  // manually set DOM attribute does not survive the ProseMirror
  // re-renders that follow it (the paragraph element is replaced and only
  // decoration attributes are reapplied), so `data-untranslated` lives in
  // the marker decoration beside the text and never in the DOM alone.
  let livePlaceholder = options.messages.placeholder;
  let livePlaceholderMarker: string | null = null;
  const mountDocument = boundImpl?.initialDocument ?? options.document;
  const seeds: ConversionSeeds = createConversionSeeds(mountDocument);
  let documentFormat: RichTextFormat = mountDocument.format;
  const isPlainTextFormat = (): boolean => documentFormat === "text/plain";
  let lastAcknowledged = copyRichTextDocument(mountDocument);
  // The host's pre-canonical input (review 3 blocking 3): the mounted
  // document canonicalizes (TrailingNode, defaults, normalized order) while
  // the host echo carries the exact pre-mount bytes. Rule-1 echo recognizes
  // the host input when the displayed document still equals the canonical
  // acknowledgement, even though the bytes differ.
  let lastAcceptedInput = copyRichTextDocument(mountDocument);
  // §5.6 unacknowledged local revision: set by any user transaction that
  // modifies the live content (every `emitChange`, including a wire-identical
  // one), cleared only by a rule-1 acknowledgement or a rule-4 application.
  // The §6.6 flag never touches it, and capture never touches it.
  let hasUnacknowledgedLocalRevision = false;
  let deferredExternal: RichTextDocument | null = null;
  let gestureSequence = 0;
  let suppressEmit = false;
  // Identities the last suppressed dispatch touched (undo/redo provenance).
  const suppressedAffected = new Set<string>();
  // History direction for the transaction the imperative undo()/redo() is
  // dispatching right now; native history gestures infer it from the stacks.
  let pendingHistory: "undo" | "redo" | null = null;
  // Composition accumulation: identities touched while composing plus
  // whether the document changed, so `compositionend` emits exactly one
  // `composition-commit`.
  let domComposing = false;
  const composingAffected = new Set<string>();
  let composingChanged = false;

  const isActive = (): boolean => editable && !disabled;

  const element =
    options.element ?? globalThis.document.createElement("div");
  const extensionOptions: P0EditorExtensionOptions = {
    placeholder: () => livePlaceholder,
    placeholderMarker: () => livePlaceholderMarker,
    isEditable: () => isActive(),
    bound: boundCollaboration,
  };
  const fullFactory = isFull ? fullExtensionFactory : null;
  if (isFull && fullFactory === null) {
    // Internal invariant: the `createRichTextEditor` full branch registers
    // the graph before reaching construction. Only profile/format mismatch
    // or a forbidden href may refuse a full construction (R-FULL-PROFILE-1,
    // R-FULL-URL-1).
    throw new Error(
      "rich-text.internal: full extension graph unavailable after lazy load",
    );
  }
  const baseExtensions: AnyExtension[] = isFull
    ? (fullFactory as FullEditorExtensionFactory)(extensionOptions)
    : createP0EditorExtensions(extensionOptions);
  // The single history replacement point (§4.5, CL-3a): when bound, UndoRedo
  // is removed here and only here; the UndoManager itself is the CL-3b seam.
  const composedExtensions = boundCollaboration ? removeHistoryExtension(baseExtensions) : baseExtensions;
  const editor = new Editor({
    element,
    extensions: [
      ...composedExtensions,
      createParagraphIdentityExtension(
        allocateFresh,
        {
          // Identities a select-all replacement consumed (N8, §5.2): retired
          // inside the session, never reallocated.
          onRetire: (ids) => {
            for (const id of ids) retiredIds.add(id);
          },
        },
        isFull ? FULL_IDENTITY_NODE_TYPES : undefined,
      ),
      createPreservedGuardExtension(isPlainTextFormat),
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editable: isActive(),
    editorProps: {
      // The native paste pipeline: every clipboard event is re-planned from
      // the raw `DataTransfer` through the shared policy below, so the
      // convenience method and the native path cannot drift apart.
      handlePaste: (view: EditorView, event: ClipboardEvent): boolean => {
        if (tracker.destroyed || !isActive()) return true;
        const data = (event as ClipboardEvent).clipboardData;
        const html = data?.getData("text/html") ?? "";
        const text =
          data?.getData("text/plain") ?? data?.getData("Text") ?? "";
        if (html === "" && text === "") return false;
        runPastePolicy(view, html, text, nativePasteOriginFor(html, text));
        return true;
      },
      // Drops go through the common paste/refusal policy: a dropped slice
      // carrying a preserved block (empty, duplicated or fresh identity) or
      // any non-paragraph block is refused whole before the identity repair
      // could re-label it. Paragraph-only drops fall through to the default
      // ProseMirror insertion, whose identities the live plugin renews.
      handleDrop: (
        view: EditorView,
        event: DragEvent,
        slice: Slice,
      ): boolean => {
        if (tracker.destroyed || !isActive()) return true;
        const rejected: string[] = [];
        slice.content.forEach((node) => {
          if (node.type.name === "preservedBlock") {
            const kind = node.attrs["preservedKind"];
            const label =
              typeof kind === "string" && kind !== ""
                ? kind
                : "preservedBlock";
            if (!rejected.includes(label)) rejected.push(label);
          } else if (
            node.type.name !== "paragraph" &&
            node.type.name !== "text" &&
            !(isFull && isIdentityBlockName(node.type.name)) &&
            !(
              isFull &&
              (node.type.name === "bulletList" ||
                node.type.name === "orderedList" ||
                node.type.name === "listItem" ||
                node.type.name === "blockquote")
            )
          ) {
            if (!rejected.includes(node.type.name)) {
              rejected.push(node.type.name);
            }
          }
        });
        if (rejected.length === 0) {
          // Same classifiers as the paste path, allocation-free: the drop
          // inserts through the default pipeline when allowed, so no
          // allocator identity may be consumed by classification.
          const data = event.dataTransfer;
          const html = data?.getData("text/html") ?? "";
          const text =
            data?.getData("text/plain") ?? data?.getData("Text") ?? "";
          const classify = (): string[] => {
            const noop = (): string => "";
            if (isFull) {
              if (html !== "") {
                const planned = planFullHtmlPaste(view.state.schema, html, noop);
                if (planned.outcome === "refuse") {
                  return [...planned.rejectedKinds];
                }
                return [];
              }
              if (text !== "") {
                const planned = planFullTextPaste(text, noop);
                if (planned.outcome === "refuse") {
                  return [...planned.rejectedKinds];
                }
              }
              return [];
            }
            if (html !== "") {
              const planned = planHtmlPaste(
                view.state.schema,
                html,
                noop,
              );
              if (planned.outcome === "refuse") {
                return [...planned.rejectedKinds];
              }
              return [];
            }
            if (text !== "") {
              const planned = isPlainTextFormat()
                ? planLiteralPaste(text, noop)
                : planTextPaste(manager(), text, noop);
              if (planned.outcome === "refuse") {
                return [...planned.rejectedKinds];
              }
            }
            return [];
          };
          try {
            for (const kind of classify()) {
              if (!rejected.includes(kind)) rejected.push(kind);
            }
          } catch {
            // Classification never blocks the drop on internal error.
          }
        }
        if (rejected.length > 0) {
          const data = event.dataTransfer;
          const html = data?.getData("text/html") ?? "";
          const text =
            data?.getData("text/plain") ?? data?.getData("Text") ?? "";
          const types = data?.types ?? [];
          const formats: ("text/html" | "text/plain")[] = [];
          if (html !== "" || types.includes("text/html")) {
            formats.push("text/html");
          }
          if (text !== "" || types.includes("text/plain")) {
            formats.push("text/plain");
          }
          if (formats.length === 0) formats.push("text/html");
          callbacks.onUnsupportedPaste?.({
            rejectedKinds: rejected,
            clipboardFormats: formats,
          });
          return true;
        }
        return false;
      },
      // ProseMirror returns before `handlePaste` while composing, so a paste
      // during composition would bypass the policy: intercept it at the DOM
      // level and run the same shared policy (preventing the browser default).
      // Outside composition this stays inert and `handlePaste` owns the path.
      handleDOMEvents: {
        auxclick: (view: EditorView, raw: Event): boolean => {
          if (!isFull) return false;
          const event = raw as MouseEvent;
          const target = event.target as unknown as {
            closest?: (selector: string) => unknown;
          };
          if (target !== null && typeof target === "object" && typeof target.closest === "function" && target.closest("a") !== null) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        // Inert links (CL-2F-F-URL item 1): `handleClickOn` preventDefaults
        // the mouseup, but anchor navigation fires on the subsequent `click`
        // event — plain clicks, modified clicks and keyboard-triggered
        // activation (Enter on a focused link) all arrive here. This real
        // DOM listener cancels the navigation default at the source.
        click: (view: EditorView, raw: Event): boolean => {
          if (!isFull) return false;
          const event = raw as MouseEvent;
          const target = event.target as unknown as {
            closest?: (selector: string) => unknown;
          };
          if (target !== null && typeof target === "object" && typeof target.closest === "function" && target.closest("a[href]") !== null) {
            if (!view.dom.contains(target as unknown as Node)) return false;
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          return false;
        },
        paste: (view: EditorView, raw: Event): boolean => {
          if (tracker.destroyed || !isActive()) return false;
          if (!view.composing && !tracker.composing) return false;
          const data = (raw as ClipboardEvent).clipboardData;
          if (!data) return false;
          const html = data.getData("text/html") ?? "";
          const text =
            data.getData("text/plain") ?? data.getData("Text") ?? "";
          if (html === "" && text === "") return false;
          runPastePolicy(
            view,
            html,
            text,
            nativePasteOriginFor(html, text),
          );
          raw.preventDefault();
          return true;
        },
        // Record the native copy text of this session: the next native
        // paste carrying the same text entered from inside this session,
        // independently of the stripped identities. Never prevents the
        // browser copy itself.
        copy: (view: EditorView): boolean => {
          if (tracker.destroyed || !isActive()) return false;
          try {
            const slice = view.state.selection.content();
            lastNativeCopyText = slice.content.textBetween(
              0,
              slice.content.size,
              "\n\n",
            );
          } catch {
            // Recording never blocks the copy.
          }
          return false;
        },
      },
      // Defence in depth for any path that still parses clipboard input
      // outside `handlePaste`: identities never survive the transform.
      transformPastedHTML: (html: string): string =>
        isFull
          ? sanitizeFullPastedHtml(html).html
          : sanitizePastedHtml(html).html,
      transformPasted: (slice: Slice): Slice => stripSliceIdentities(slice),
      // Allocation-free literal fallback: the parsed slice is discarded by
      // `handlePaste` (which re-plans from the raw transfer), so this layer
      // must not consume allocator identities.
      clipboardTextParser: (text: string, _context?: unknown, _plain?: boolean, parserView?: EditorView): Slice => {
        if (text === "") return Slice.empty;
        if (isFull) {
          const literal = codeLiteralSlice(
            editor.schema,
            (parserView ?? editor.view).state.selection,
            text,
            null,
          );
          if (literal !== null) return literal;
          const planned = planFullTextPaste(text, () => "");
          if (planned.outcome === "refuse" || planned.blocks.length === 0) {
            return Slice.empty;
          }
          try {
            return sliceForFullBlocks(editor.schema, planned.blocks);
          } catch {
            return Slice.empty;
          }
        }
        const paragraphs = text.split(/(?:\r\n?|\n)+/).map((line) => ({
          type: "paragraph",
          attrs: { [PARAGRAPH_ID_ATTRIBUTE]: "" },
          ...(line === ""
            ? {}
            : { content: [{ type: "text", text: line }] }),
        }));
        return sliceForParagraphs(
          editor.schema,
          paragraphs as JSONContent[],
        );
      },
      // Narrow Markdown Shift+Enter no-op (§6.6 prevention stays minimal):
      // in a `text/markdown` field only, Shift+Enter is a no-op when the
      // inserted `hardBreak` would become the first child of its paragraph
      // (caret at offset 0, including an empty paragraph). No transaction,
      // no `onChange`, no history entry, caret and selection unchanged. Any
      // other position, any other gesture (paste, split, merge, deletion),
      // and every `text/plain` position insert normally and are only flagged
      // at emission/capture, never repaired.
      handleKeyDown: (view: EditorView, event: KeyboardEvent): boolean => {
        if (tracker.destroyed || !isActive()) return false;
        if (event.key !== "Enter" || !event.shiftKey) return false;
        if (documentFormat !== "focus.markdown.p0@1") return false;
        const { $from } = view.state.selection;
        if ($from.parent.type.name !== "paragraph") return false;
        if ($from.parentOffset !== 0) return false;
        event.preventDefault();
        return true;
      },
      // Inert links (CL-2F-F-URL): links never navigate — not by mouse,
      // keyboard-triggered click, modified click or middle click — while
      // staying selectable text. The mouseup half of the interception lives
      // here; the navigation-cancelling `click` listener sits in
      // `handleDOMEvents` above.
      handleClickOn: (
        _view: EditorView,
        _pos: number,
        _node: ProseMirrorNode,
        _nodePos: number,
        event: MouseEvent,
        _direct: boolean,
      ): boolean => {
        if (!isFull) return false;
        const target = event.target as unknown as {
          closest?: (selector: string) => unknown;
        };
        if (target !== null && typeof target === "object" && typeof target.closest === "function" && target.closest("a") !== null) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      // `text/plain` is literal: typed characters insert verbatim and the
      // P0 Markdown input rules never fire. Direct props win over the
      // mark extensions' input-rule plugins.
      handleTextInput: (
        view: EditorView,
        from: number,
        to: number,
        text: string,
      ): boolean => {
        if (!isPlainTextFormat()) return false;
        if (tracker.destroyed || !isActive()) return false;
        view.dispatch(view.state.tr.insertText(text, from, to));
        return true;
      },
    },
    onUpdate: ({ transaction }: { transaction: Transaction }) => {
      handleTransaction(transaction);
    },
  });

  let prevUndoDepth = undoDepth(editor.state);
  let prevRedoDepth = redoDepth(editor.state);

  const manager = (): MarkdownManager => editor.storage.markdown.manager;

  // Full run-source retention across capture/remount (R-FULL-META-2): the
  // live document never stores it, so the session carries the previous
  // capture's map as the next capture's incoming base.
  let fullRetained: RetainedRunMetadata = {
    ...(mountDocument.retainedRunMetadata ?? {}),
  };

  if (boundImpl !== undefined) {
    lastLinearBlocks = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as never;
    const ytextObs = boundImpl.ytext as unknown as {
      observe: (fn: (event: never, transaction: never) => void) => void;
      unobserve: (fn: (event: never, transaction: never) => void) => void;
    };
    const metaObs = boundImpl.fieldMeta as unknown as {
      observe: (fn: (event: never, transaction: never) => void) => void;
      unobserve: (fn: (event: never, transaction: never) => void) => void;
    };
    // One remote application per Yjs transaction (review 2 B-NEW-3): the
    // observers accumulate the affected blocks — delta-affected from the
    // text type, `keysChanged` (plus their run members) from the metadata
    // map — and a single `afterTransaction` handler applies the union once,
    // after both observers ran, so a transaction touching `Y.Text` and
    // `fieldmeta` together updates the PM exactly once.
    type LinearBlockShape = { paragraphId: string; separatorIndex: number; contentStart: number; contentEnd: number };
    let pendingAffected: Set<string> | null = null;
    let pendingDelta: Array<{ insert?: string | Record<string, unknown>; delete?: number; retain?: number }> | null = null;
    let pendingPreBlocks: LinearBlockShape[] | null = null;
    let pendingTransaction: unknown = null;
    let forceFullRebuild = false;
    const openPendingWindow = (transaction: never): void => {
      if (pendingTransaction === transaction) return;
      pendingTransaction = transaction;
      pendingAffected = new Set<string>();
      pendingDelta = null;
      pendingPreBlocks = (lastLinearBlocks as LinearBlockShape[] | null) ?? [];
    };
    yTextHandler = ((event: never, transaction: never) => {
      if (tracker.destroyed || isProjecting) return;
      openPendingWindow(transaction);
      try {
        const delta = (event as unknown as { changes: { delta: unknown[] } }).changes.delta as Array<{
          insert?: string | Record<string, unknown>;
          delete?: number;
          retain?: number;
        }>;
        pendingDelta = delta;
        const pre = pendingPreBlocks ?? [];
        const post = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as LinearBlockShape[];
        const affected = boundImpl.projection.affectedBlocksFromDelta(pre as never, post as never, delta as never) as string[];
        for (const id of affected) (pendingAffected as Set<string>).add(id);
      } catch (error) {
        // Accumulation failure (review 2 B-NEW-6): never silent. The next
        // application falls back to a full replacement — a partially
        // accumulated affected set must not under-rebuild — and the refusal
        // surfaces through the typed callback.
        pendingDelta = null;
        forceFullRebuild = true;
        surfaceBindingError(
          error instanceof Error ? error.message : String(error),
          "remote-application",
        );
      }
    }) as never;
    fieldMetaHandler = ((event: never, transaction: never) => {
      if (tracker.destroyed || isProjecting) return;
      openPendingWindow(transaction);
      try {
        const post = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as LinearBlockShape[];
        const keys = (event as unknown as { changes: { keys: Map<string, { action: string }> } }).changes.keys;
        const postIds = new Set(post.map((block) => block.paragraphId));
        const fieldMetaMap = boundImpl.fieldMeta as unknown as Map<string, unknown>;
        for (const [key] of keys) {
          if (postIds.has(key)) {
            (pendingAffected as Set<string>).add(key);
            continue;
          }
          for (const block of post) {
            const record = fieldMetaMap.get(block.paragraphId) as { listRunId?: unknown } | undefined;
            if (record?.listRunId === key) {
              (pendingAffected as Set<string>).add(block.paragraphId);
            }
          }
        }
      } catch (error) {
        // Accumulation failure (review 2 B-NEW-6): never silent. The next
        // application falls back to a full replacement and the refusal
        // surfaces through the typed callback.
        forceFullRebuild = true;
        surfaceBindingError(
          error instanceof Error ? error.message : String(error),
          "remote-application",
        );
      }
    }) as never;
    afterTransactionHandler = ((transaction: never) => {
      if (tracker.destroyed || isProjecting) return;
      if (pendingTransaction !== transaction) return;
      const affected = pendingAffected;
      const delta = pendingDelta;
      const preBlocks = pendingPreBlocks;
      pendingTransaction = null;
      pendingAffected = null;
      pendingDelta = null;
      pendingPreBlocks = null;
      if (affected === null || affected.size === 0) {
        // Baseline refresh: the next delta maps against the new layout.
        lastLinearBlocks = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as never;
        return;
      }
      try {
        boundImpl.projection.applyRemoteUpdateIncrementally({
          view: editor.view,
          ytext: boundImpl.ytext,
          fieldMeta: boundImpl.fieldMeta,
          format: documentFormat,
          fieldKey: binding?.fieldKey ?? "",
          affectedParagraphIds: [...affected],
          ...(forceFullRebuild ? { fullReplace: true } : {}),
          ...(preBlocks !== null && preBlocks.length > 0 ? { preBlocks: preBlocks as never } : {}),
          ...(delta !== null ? { delta: delta as never } : {}),
        } as never);
        forceFullRebuild = false;
      } catch (error) {
        // Review 2 B-NEW-6 (remote path): the previous PM document is kept,
        // the baseline now includes the applied Y.Text change so the next
        // delta maps correctly, and the next remote application
        // resynchronizes through a full replacement. The refusal surfaces
        // through the typed callback.
        forceFullRebuild = true;
        surfaceBindingError(
          error instanceof Error ? error.message : String(error),
          "remote-application",
        );
      } finally {
        lastLinearBlocks = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as never;
      }
    }) as never;
    ytextObs.observe(yTextHandler as never);
    metaObs.observe(fieldMetaHandler as never);
    const ydocObs = (boundImpl.ytext as unknown as { doc?: { on: (name: string, fn: (transaction: never) => void) => void; off: (name: string, fn: (transaction: never) => void) => void } }).doc;
    ydocObs?.on("afterTransaction", afterTransactionHandler as never);
  }

  /** Synchronize inert link rendering with editability (CL-2F-F-URL item 1):
      read-only/disabled mounts render no `href`, and toggling editability
      strips or restores the attribute synchronously. The DOM observer is
      paused across the mutation so no spurious transaction is read back;
      the render spec stays convergent because `SafeLink` renders from the
      same `isEditable` state. Copy keeps link data from the live document
      state, never from this DOM. */
  const syncLinkInertness = (): void => {
    if (!isFull) return;
    const view = editor.view;
    const inert = !isActive();
    const observer = (
      view as unknown as {
        domObserver?: { stop?: () => void; start?: () => void };
      }
    ).domObserver;
    try {
      observer?.stop?.();
    } catch {
      // An observer pause never blocks the sync.
    }
    try {
      const anchors = view.dom.querySelectorAll("a");
      anchors.forEach((anchor) => {
        if (inert) {
          anchor.removeAttribute("href");
          return;
        }
        if (anchor.hasAttribute("href")) return;
        let position: number | null = null;
        try {
          position = view.posAtDOM(anchor, 0);
        } catch {
          position = null;
        }
        if (position === null) return;
        const node = view.state.doc.nodeAt(position);
        const link = node?.marks.find((mark) => mark.type.name === "link");
        const href = link?.attrs["href"];
        if (typeof href === "string" && href !== "") {
          anchor.setAttribute("href", href);
        }
      });
    } finally {
      try {
        observer?.start?.();
      } catch {
        // An observer restart never blocks the sync.
      }
    }
  };

  const displayedDocument = (): RichTextDocument => {
    if (boundImpl !== undefined) {
      const cap = boundImpl.codec.captureDocumentFromField(
        boundImpl.ytext as never,
        boundImpl.fieldMeta as never,
        documentFormat as never,
      );
      if (isFull) {
        fullRetained = { ...(cap.document.retainedRunMetadata ?? {}) };
      }
      return cap.document;
    }
    if (isFull) {
      const read = fullProseMirrorToDocument(editor.state.doc, fullRetained);
      fullRetained = read.retainedRunMetadata;
      return read.document;
    }
    return proseMirrorToDocument(manager(), editor.state.doc, documentFormat, seeds);
  };

  const displayedCaptureResult = (): RichTextCaptureResult => {
    if (boundImpl !== undefined) {
      const cap = boundImpl.codec.captureDocumentFromField(
        boundImpl.ytext as never,
        boundImpl.fieldMeta as never,
        documentFormat as never,
      );
      if (isFull) {
        fullRetained = { ...(cap.document.retainedRunMetadata ?? {}) };
      }
      return {
        document: cap.document,
        representability: { nonRepresentableParagraphIds: [] },
      };
    }
    if (isFull) {
      const read = fullProseMirrorToDocument(editor.state.doc, fullRetained);
      fullRetained = read.retainedRunMetadata;
      return {
        document: read.document,
        representability: { nonRepresentableParagraphIds: read.nonRepresentableParagraphIds },
      };
    }
    const { document, nonRepresentableParagraphIds } =
      proseMirrorToCaptureResult(
        manager(),
        editor.state.doc,
        documentFormat,
        seeds,
      );
    return {
      document,
      representability: { nonRepresentableParagraphIds },
    };
  };

  // Frozen at teardown: `getDocument()` after destruction serves this copy
  // with no bridge and no cache, so the per-version caches can be released
  // while a retained handle still reads the last document.
  let destroyedDocument: RichTextDocument | null = null;

  const currentDocument = (): RichTextDocument => {
    if (tracker.destroyed && destroyedDocument !== null) {
      return copyRichTextDocument(destroyedDocument);
    }
    return displayedDocument();
  };

  const currentCaptureResult = (): RichTextCaptureResult => {
    if (tracker.destroyed && destroyedDocument !== null) {
      return {
        document: copyRichTextDocument(destroyedDocument),
        representability: { nonRepresentableParagraphIds: [] },
      };
    }
    return displayedCaptureResult();
  };

  const emitChange = (
    kind: RichTextGestureKind,
    affectedParagraphIds: readonly string[],
    extra?: Partial<Pick<RichTextGesture, "split" | "merge" | "paste">>,
    capture?: RichTextCaptureResult,
  ): void => {
    if (tracker.destroyed) return;
    // Any completed gesture that reaches emission modified the live content,
    // so it sets the §5.6 revision flag — including a wire-identical edit.
    hasUnacknowledgedLocalRevision = true;
    gestureSequence += 1;
    const gesture: RichTextGesture = {
      gestureId: `gesture:${gestureSequence}`,
      kind,
      affectedParagraphIds: [...affectedParagraphIds],
      ...extra,
    };
    const result = capture ?? currentCaptureResult();
    callbacks.onChange?.({
      document: result.document,
      gesture,
      representability: result.representability,
    });
  };

  let lastDispatchChanged = false;

  /** Top-level blocks of a document for native-gesture provenance. `text`
      is the ProseMirror `textContent` (used for paste origin); `contentKey`
      is the full inline content including `hardBreak` nodes (used for
      survivor comparison, sol N8 residue: a break-only survivor has empty
      `textContent` before and after, so `text` alone misses its modification
      while `contentKey` catches it). */
  const nativeBlocksOf = (
    docNode: ProseMirrorNode,
  ): { id: string; text: string; contentKey: string }[] => {
    const blocks: { id: string; text: string; contentKey: string }[] = [];
    docNode.descendants((node) => {
      if (isIdentityBlockName(node.type.name)) {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && id !== "") {
          blocks.push({
            id,
            text: node.textContent,
            contentKey: JSON.stringify(node.toJSON()),
          });
        }
      }
      return true;
    });
    return blocks;
  };

  // Last native copy (DOM `copy` gesture) in this session, text only: the
  // single slot is overwritten by every copy and never accumulates, so a
  // long session retains at most one payload. A native paste whose text
  // equals this copy entered from inside this session (`internal`),
  // independently of the (stripped and renewed) identities.
  let lastNativeCopyText: string | null = null;

  /** Origin of a native paste payload: `internal` when its text equals the
      last native copy of this session, `external` otherwise. */
  const nativePasteOriginFor = (
    html: string,
    text: string,
  ): "internal" | "external" => {
    void html;
    if (lastNativeCopyText !== null && text === lastNativeCopyText) {
      return "internal";
    }
    return "external";
  };

  /** Order identities in final-document order (spec §5.3: affected lists
      follow the resulting document). Identities absent from the live
      document (retired by a delete) keep their relative input order after
      the present ones. */
  const orderIdsByDocument = (ids: readonly string[]): string[] => {
    const wanted = new Set(ids);
    const ordered: string[] = [];
    editor.state.doc.descendants((node) => {
      if (isIdentityBlockName(node.type.name)) {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && wanted.has(id)) {
          wanted.delete(id);
          ordered.push(id);
        }
      }
      return true;
    });
    for (const id of ids) {
      if (wanted.has(id)) {
        wanted.delete(id);
        ordered.push(id);
      }
    }
    return ordered;
  };

  /** Provenance of one native (unsuppressed) transaction, from ProseMirror
      commands and meta: paste meta first, history transactions next
      (imperative flag, else the undo/redo stack depths), then the structural
      split/merge/delete shapes, defaulting to `type`. The after side always
      reads the live state document: appended identity repairs fold into the
      same dispatch, so `transaction.doc` still carries duplicated identities
      while the state already holds the repaired (fresh) ones. */
  const deriveNativeGesture = (
    transaction: Transaction,
    preUndoDepth: number,
    preRedoDepth: number,
  ): {
    kind: RichTextGestureKind;
    affected: string[];
    extra?: Partial<Pick<RichTextGesture, "split" | "merge" | "paste">>;
  } => {
    if (
      transaction.getMeta("paste") === true ||
      transaction.getMeta("uiEvent") === "paste"
    ) {
      const beforeIds = new Set(
        nativeBlocksOf(transaction.before).map((block) => block.id),
      );
      const afterBlocks = nativeBlocksOf(editor.state.doc);
      const inserted = afterBlocks
        .map((block) => block.id)
        .filter((id) => !beforeIds.has(id));
      // Complete affected in final order: the split host paragraph keeps
      // its identity while changing text, so the touched union (not the
      // fresh identities alone) names the modified block and the tail.
      const touched = new Set<string>();
      markTouchedFromTransaction(touched, editor.state.doc, transaction, [], touchedPredicate);
      const affected = orderIdsByDocument([...new Set([...inserted, ...touched])]);
      const origin =
        lastNativeCopyText !== null &&
        afterBlocks
          .filter((block) => inserted.includes(block.id))
          .map((block) => block.text)
          .join("\n\n") === lastNativeCopyText
          ? "internal"
          : "external";
      return {
        kind: "paste",
        affected,
        extra: {
          paste: { insertedParagraphIds: inserted, origin },
        },
      };
    }
    if (isHistoryTransaction(transaction)) {
      const affectedSet = new Set<string>();
      markTouchedFromTransaction(affectedSet, editor.state.doc, transaction, [], touchedPredicate);
      const affected = orderIdsByDocument([...affectedSet]);
      const directed = pendingHistory;
      pendingHistory = null;
      if (directed !== null) return { kind: directed, affected };
      const newUndo = undoDepth(editor.state);
      const newRedo = redoDepth(editor.state);
      const kind: RichTextGestureKind =
        newUndo > preUndoDepth && newRedo < preRedoDepth
          ? "redo"
          : newRedo > preRedoDepth && newUndo < preUndoDepth
            ? "undo"
            : "undo";
      return { kind, affected };
    }
    const before = nativeBlocksOf(transaction.before);
    const after = nativeBlocksOf(editor.state.doc);
    const beforeIds = new Set(before.map((block) => block.id));
    const afterIds = new Set(after.map((block) => block.id));
    const added = after
      .map((block) => block.id)
      .filter((id) => !beforeIds.has(id));
    const removed = before
      .map((block) => block.id)
      .filter((id) => !afterIds.has(id));
    if (
      after.length === before.length + 1 &&
      added.length === 1 &&
      removed.length === 0
    ) {
      const tailId = added[0] as string;
      const tailIndex = after.findIndex((block) => block.id === tailId);
      const source = tailIndex > 0 ? after[tailIndex - 1] : undefined;
      if (source !== undefined && beforeIds.has(source.id)) {
        return {
          kind: "split",
          affected: [source.id, tailId],
          extra: {
            split: {
              sourceParagraphId: source.id,
              newParagraphIds: [tailId],
            },
          },
        };
      }
    }
    if (
      after.length === before.length - 1 &&
      removed.length === 1 &&
      added.length === 0
    ) {
      const removedId = removed[0] as string;
      const removedIndex = before.findIndex((block) => block.id === removedId);
      const survivor =
        removedIndex > 0 ? after[removedIndex - 1] : undefined;
      // A whole-block removal (node selection) leaves the neighbour text
      // untouched: only a true join concatenates the two texts into the
      // survivor, so the merge announces only then.
      if (survivor !== undefined && beforeIds.has(survivor.id)) {
        const beforeSurvivor = before[removedIndex - 1] as { text: string };
        const removedBlock = before[removedIndex] as { text: string };
        if (survivor.text === `${beforeSurvivor.text}${removedBlock.text}`) {
          retiredIds.add(removedId);
          return {
            kind: "merge",
            affected: [survivor.id],
            extra: {
              merge: {
                survivingParagraphId: survivor.id,
                retiredParagraphIds: [removedId],
              },
            },
          };
        }
      }
    }
    if (removed.length > 0 && added.length === 0) {
      // A global delete empties the surviving first block in place: the
      // removed identities plus every survivor whose full content actually
      // changed (N8 residue — a break-only survivor has empty `textContent`
      // before and after, so `text` alone misses it while `contentKey`
      // including `hardBreak` nodes catches it), in final document order. A
      // whole-block removal that leaves its neighbours byte-identical still
      // reports only the removed identity.
      const afterContentById = new Map(
        after.map((block) => [block.id, block.contentKey]),
      );
      const modifiedSurvivors = before
        .filter((block) => {
          const next = afterContentById.get(block.id);
          return next !== undefined && next !== block.contentKey;
        })
        .map((block) => block.id);
      return {
        kind: "delete",
        affected: orderIdsByDocument([...modifiedSurvivors, ...removed]),
      };
    }
    const affectedSet = new Set<string>();
    markTouchedFromTransaction(affectedSet, editor.state.doc, transaction, [], touchedPredicate);
    return { kind: "type", affected: orderIdsByDocument([...affectedSet]) };
  };

  /** Bookkeep one transaction (touched identities, composition, deferred
      re-evaluation) and emit exactly one event for real input. Native
      transactions carry their provenance from commands and meta; suppressed
      (programmatic-gesture) transactions only record. */
  function handleTransaction(transaction: Transaction): void {
    if (tracker.destroyed) return;
    if (
      boundImpl !== undefined &&
      transaction.getMeta(boundImpl.projection.BINDING_ORIGIN_META) === true
    ) {
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    if (transaction.getMeta(IDENTITY_FIX_META) === true) {
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    if (transaction.docChanged) lastDispatchChanged = true;
    markTouchedFromTransaction(seeds.touched, editor.state.doc, transaction, [], touchedPredicate);
    if (
      boundImpl !== undefined &&
      transaction.docChanged &&
      transaction.getMeta(PRESERVED_REPLACE_META) !== true &&
      !editor.view.composing &&
      !tracker.composing
    ) {
      let projectionFailure: unknown = null;
      isProjecting = true;
      try {
        const revealedIds = (boundImpl.projection.projectPmTransactionToYText(
          {
            ytext: boundImpl.ytext,
            fieldMeta: boundImpl.fieldMeta,
            fieldKey: binding?.fieldKey ?? "",
            allocateId: allocateFresh,
            format: documentFormat,
            // The live document after the identity plugin's repairs for
            // this transaction (review 2 B-NEW-2): the projection adopts the
            // minted split-tail and inserted-block identities instead of
            // allocating a second, divergent one.
            pmTransactionDoc: editor.state.doc,
          } as never,
          transaction.before as never,
          transaction as never,
        ) ?? []) as string[];
        // R-FULL-CODE-1 (review 2 B-NEW-8): blocks that just left a
        // codeBlock carry formats in the shared state that the ProseMirror
        // side could not hold while the block was code. Rebuild them from
        // the shared state so the hidden formats are revealed locally too
        // (the remote replicas reveal through the metadata-only update).
        if (revealedIds.length > 0) {
          try {
            boundImpl.projection.applyRemoteUpdateIncrementally({
              view: editor.view,
              ytext: boundImpl.ytext,
              fieldMeta: boundImpl.fieldMeta,
              format: documentFormat,
              fieldKey: binding?.fieldKey ?? "",
              affectedParagraphIds: revealedIds,
            } as never);
          } catch {
            // The reveal is a display resynchronization: on failure the
            // block keeps the user's transaction result and the shared
            // state stays authoritative for the next application.
          }
        }
        lastLinearBlocks = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as never;
      } catch (error) {
        projectionFailure = error;
      } finally {
        isProjecting = false;
      }
      if (projectionFailure !== null) {
        // Review 2 B-NEW-6 (local path): the projection refused the
        // transaction and inverted the shared state inside its Yjs
        // transaction, so both sides sit at the last agreed state after the
        // PM view is rebuilt from the shared state here. The refusal
        // surfaces through the typed callback; nothing propagates out of
        // the dispatch.
        const cause = projectionFailure instanceof Error ? projectionFailure.message : String(projectionFailure);
        surfaceBindingError(
          `rich-text.collab-step-failed: the local transaction was rolled back on both sides (${cause})`,
          "local-projection",
        );
        try {
          const sharedDoc = boundImpl.projection.yTextToPmDoc(
            boundImpl.ytext as never,
            boundImpl.fieldMeta as never,
            documentFormat as never,
            editor.view.state.schema as never,
          ) as never as { content: unknown };
          const rollback = editor.view.state.tr;
          rollback.setMeta(boundImpl.projection.BINDING_ORIGIN_META, true);
          rollback.setMeta("addToHistory", false);
          rollback.replaceWith(0, editor.view.state.doc.content.size, sharedDoc.content as never);
          editor.view.dispatch(rollback as never);
        } catch {
          // The shared state itself no longer projects: the surfaced error
          // above already reports the refusal; keep the previous document.
        }
        lastLinearBlocks = boundImpl.projection.linearBlocksOf(boundImpl.ytext as never) as never;
        prevUndoDepth = undoDepth(editor.state);
        prevRedoDepth = redoDepth(editor.state);
        return;
      }
    }
    if (suppressEmit) {
      markTouchedFromTransaction(
        suppressedAffected,
        editor.state.doc,
        transaction,
        [],
        touchedPredicate,
      );
    }
    if (editor.view.composing && !tracker.composing) {
      composingAffected.clear();
      composingChanged = false;
      tracker.setComposing(true, currentCaptureResult);
    }
    if (tracker.composing || editor.view.composing) {
      markTouchedFromTransaction(
        composingAffected,
        editor.state.doc,
        transaction,
        [],
        touchedPredicate,
      );
      if (transaction.docChanged) composingChanged = true;
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    // Stack depths before this transaction: the deferred settlement above
    // dispatches its own (history-free) transactions, so the pre state is
    // captured first for history-direction inference.
    const preUndo = prevUndoDepth;
    const preRedo = prevRedoDepth;
    if (deferredExternal !== null) {
      const pending = deferredExternal;
      deferredExternal = null;
      settleExternal(pending);
    }
    if (suppressEmit) {
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    if (!transaction.docChanged) {
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    const derived = deriveNativeGesture(transaction, preUndo, preRedo);
    pendingHistory = null;
    emitChange(derived.kind, derived.affected, derived.extra);
    prevUndoDepth = undoDepth(editor.state);
    prevRedoDepth = redoDepth(editor.state);
  }

  const blockPosition = (
    paragraphId: string,
  ): { pos: number; start: number; end: number; name: string; size: number } | null => {
    let found: {
      pos: number;
      start: number;
      end: number;
      name: string;
      size: number;
    } | null = null;
    editor.state.doc.descendants((node, pos) => {
      if (
        isIdentityBlockName(node.type.name) &&
        node.attrs[PARAGRAPH_ID_ATTRIBUTE] === paragraphId
      ) {
        found = {
          pos,
          start: pos + 1,
          end: pos + node.nodeSize - 1,
          name: node.type.name,
          size: node.nodeSize,
        };
        return false;
      }
      return true;
    });
    return found;
  };

  const identitySet = (): Set<string> => {
    const ids = new Set<string>();
    editor.state.doc.descendants((node) => {
      if (isIdentityBlockName(node.type.name)) {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string") ids.add(id);
      }
      return true;
    });
    return ids;
  };

  /** Run one gesture method: dispatch ProseMirror transactions with emission
      suppressed, then emit exactly one event when a dispatched transaction
      changed the document. A gesture dispatched mid-composition accumulates
      into the pending `composition-commit` and emits nothing itself. The
      emitted document and flag come from the same conversion that produces
      the wire (§6.6 reporting surface). */
  const runGesture = (
    kind: RichTextGestureKind,
    dispatch: () => void,
    gesture: () => {
      affected: readonly string[];
      extra?: Partial<Pick<RichTextGesture, "split" | "merge" | "paste">>;
    },
  ): void => {
    if (tracker.destroyed || !isActive()) return;
    lastDispatchChanged = false;
    suppressedAffected.clear();
    suppressEmit = true;
    try {
      dispatch();
    } finally {
      suppressEmit = false;
    }
    if (tracker.composing || editor.view.composing) return;
    if (!lastDispatchChanged) return;
    const after = displayedCaptureResult();
    const built = gesture();
    emitChange(kind, built.affected, built.extra, after);
  };

  const selectionEndSnapshot = (
    $pos: { parent: ProseMirrorNode; parentOffset: number },
  ): { paragraphId: string | null; offset: number } => {
    const parent = $pos.parent;
    if (
      parent.type.name === "paragraph" ||
      parent.type.name === "heading" ||
      parent.type.name === "codeBlock" ||
      parent.type.name === "preservedBlock"
    ) {
      const id = parent.attrs[PARAGRAPH_ID_ATTRIBUTE];
      return {
        paragraphId: typeof id === "string" ? id : null,
        offset: $pos.parentOffset,
      };
    }
    return { paragraphId: null, offset: 0 };
  };

  const selectionSnapshot = (): RichTextSelectionSnapshot => {
    const selection = editor.state.selection;
    const anchor = selectionEndSnapshot(selection.$anchor);
    const head = selectionEndSnapshot(selection.$head);
    return {
      anchorParagraphId: anchor.paragraphId,
      anchorOffset: anchor.offset,
      headParagraphId: head.paragraphId,
      headOffset: head.offset,
    };
  };

  /** Replace the whole ProseMirror document outside history: mounting and
      rule-4 external applications are not local undoable gestures, and the
      history stacks are left untouched by external applications. The
      explicit allow-meta is the only path that may replace preserved
      nodes. */
  const replaceDocument = (incoming: RichTextDocument): void => {
    const node = editor.schema.nodeFromJSON(
      isFull
        ? fullDocumentToProseMirror(incoming, allocateFresh)
        : documentToProseMirror(manager(), incoming),
    );
    const tr = editor.state.tr.replaceWith(
      0,
      editor.state.doc.content.size,
      node,
    );
    tr.setMeta("addToHistory", false);
    tr.setMeta(PRESERVED_REPLACE_META, true);
    editor.view.dispatch(tr);
  };

  /** True when the incoming document differs from the displayed one only by
      preserved `raw`/`preservedKind` values: same format, same block count,
      same identities and kinds, every paragraph byte-identical, at least one
      preserved value changed. */
  const isRawOnlyPreservedChange = (
    displayed: RichTextDocument,
    incoming: RichTextDocument,
  ): boolean => {
    if (displayed.format !== incoming.format) return false;
    if (displayed.blocks.length !== incoming.blocks.length) return false;
    let preservedChanged = false;
    for (let index = 0; index < displayed.blocks.length; index += 1) {
      const left = displayed.blocks[index]!;
      const right = incoming.blocks[index]!;
      if (left.paragraphId !== right.paragraphId || left.kind !== right.kind) {
        return false;
      }
      if (left.kind === "paragraph") {
        if (left.segments !== undefined || right.segments !== undefined) {
          if (
            JSON.stringify(left.segments ?? null) !==
              JSON.stringify(right.segments ?? null) ||
            JSON.stringify(left.metadata ?? null) !==
              JSON.stringify(right.metadata ?? null)
          ) {
            return false;
          }
          continue;
        }
        if ((left.text ?? undefined) !== (right.text ?? undefined)) {
          return false;
        }
        continue;
      }
      if (left.kind === "horizontalRule") {
        if (
          JSON.stringify(left.hrMetadata ?? null) !==
          JSON.stringify(right.hrMetadata ?? null)
        ) {
          return false;
        }
        continue;
      }
      const rawSame = (left.raw ?? undefined) === (right.raw ?? undefined);
      const kindSame =
        (left.preservedKind ?? undefined) === (right.preservedKind ?? undefined);
      if (!rawSame || !kindSame) preservedChanged = true;
    }
    return preservedChanged;
  };

  /** Targeted `raw`-only application (§5.6): one `setNodeMarkup` per changed
      preserved block, outside history and under the allow-meta. Paragraph
      nodes keep their instances, so a previously acknowledged paragraph edit
      stays undoable on its text. */
  const applyRawOnlyPreservedChange = (
    incoming: RichTextDocument,
  ): void => {
    let tr = editor.state.tr;
    tr.setMeta("addToHistory", false);
    tr.setMeta(PRESERVED_REPLACE_META, true);
    for (const block of incoming.blocks) {
      if (block.kind !== "preserved") continue;
      const target = blockPosition(block.paragraphId);
      if (target === null || target.name !== "preservedBlock") continue;
      const node = editor.state.doc.nodeAt(target.pos);
      const current = node?.attrs ?? {};
      const nextRaw = block.raw ?? "";
      const nextKind = block.preservedKind ?? "";
      // Optional-property presence is refreshed even when no native
      // attribute change is needed (N6): normalised attributes cannot tell
      // a present-but-empty field from an absent one, so the `continue`
      // below must not skip the presence record — otherwise the export
      // keeps a stale field while the acknowledgement recorded its absence
      // and the next external update false-conflicts.
      seeds.preserved.set(block.paragraphId, {
        hasRaw: block.raw !== undefined,
        hasKind: block.preservedKind !== undefined,
      });
      if (
        current["raw"] === nextRaw &&
        current["preservedKind"] === nextKind
      ) {
        continue;
      }
      tr = tr.setNodeMarkup(target.pos, node?.type, {
        ...(current as Record<string, unknown>),
        [PARAGRAPH_ID_ATTRIBUTE]: block.paragraphId,
        raw: nextRaw,
        preservedKind: nextKind,
      });
    }
    editor.view.dispatch(tr);
  };

  const applyExternalDocument = (incoming: RichTextDocument): void => {
    if (isFull) {
      fullRetained = { ...(incoming.retainedRunMetadata ?? {}) };
    }
    const saved = selectionSnapshot();
    const before = displayedDocument();
    const rawOnly = isRawOnlyPreservedChange(before, incoming);
    const prevFormat = documentFormat;
    // The incoming format is effective for the plugins before the replace
    // transaction (plain-text mark stripping, paste planning); restored when
    // the replacement fails.
    documentFormat = incoming.format;
    suppressEmit = true;
    try {
      if (rawOnly) {
        applyRawOnlyPreservedChange(incoming);
      } else {
        replaceDocument(incoming);
        reseedConversion(seeds, incoming);
      }
      // Mounted baseline (review 2 blocking 3, full only): the
      // acknowledgement reference is the canonical mounted document —
      // normalized containerOrder, materialized defaults, the
      // TrailingNode paragraph — never the pre-replace input, so a clean
      // editor reports no local edits on the next external update.
      // P0 keeps the input-copy baseline byte-identical to RT-1. The
      // pre-canonical host input is retained beside it (review 3
      // blocking 3): its echo is Rule 1, not a Rule-4 replace.
      lastAcknowledged = isFull
        ? copyRichTextDocument(displayedDocument())
        : copyRichTextDocument(incoming);
      lastAcceptedInput = copyRichTextDocument(incoming);
      // Rule-4 application completes: the revision flag clears (§5.6). The
      // replacement ran suppressed, so no emission set it back.
      hasUnacknowledgedLocalRevision = false;
      deferredExternal = null;
      // Recording read: every block is seed-fresh, so this serialises
      // nothing and records each mount version's exact text. A later undo
      // restoring one of these versions then hits the record instead of
      // re-serialising through the bridge.
      displayedDocument();
    } catch (error) {
      documentFormat = prevFormat;
      throw error;
    } finally {
      suppressEmit = false;
    }
    // Re-anchor both ends with direction and bounding: each end resolves by
    // block identity plus intra-paragraph offset clamped to the new block
    // size; a missing block falls back to the surviving end, else the
    // document start.
    const anchorTarget =
      saved.anchorParagraphId === null
        ? null
        : blockPosition(saved.anchorParagraphId);
    const headTarget =
      saved.headParagraphId === null
        ? null
        : blockPosition(saved.headParagraphId);
    const place = (
      target: { start: number; end: number } | null,
      offset: number,
    ): number | null => {
      if (target === null) return null;
      const size = target.end - target.start;
      return target.start + Math.max(0, Math.min(offset, size));
    };
    let anchorPos = place(anchorTarget, saved.anchorOffset);
    let headPos = place(headTarget, saved.headOffset);
    if (anchorPos === null) anchorPos = headPos ?? 0;
    if (headPos === null) headPos = anchorPos;
    const tr = editor.state.tr.setSelection(
      TextSelection.create(editor.state.doc, anchorPos, headPos),
    );
    suppressEmit = true;
    try {
      editor.view.dispatch(tr);
    } finally {
      suppressEmit = false;
    }
  };

  const settleExternal = (incoming: RichTextDocument): void => {
    // Pre-canonical host echo (review 3 blocking 3, §5.6 Rule 1): the host
    // replays the exact pre-mount input while the displayed document is the
    // canonical mount. Acknowledge with no replace and no conflict.
    if (
      richTextDocumentsEqual(incoming, lastAcceptedInput) &&
      richTextDocumentsEqual(displayedDocument(), lastAcknowledged)
    ) {
      lastAcceptedInput = copyRichTextDocument(incoming);
      hasUnacknowledgedLocalRevision = false;
      return;
    }
    const decision = decideExternalUpdate({
      displayed: displayedDocument(),
      lastAcknowledged,
      incoming,
      composing: false,
      hasUnacknowledgedLocalRevision,
    });
    if (decision === "echo") {
      lastAcknowledged = copyRichTextDocument(incoming);
      lastAcceptedInput = copyRichTextDocument(incoming);
      hasUnacknowledgedLocalRevision = false;
      return;
    }
    if (decision === "conflict") {
      callbacks.onExternalConflict?.({
        incoming: copyRichTextDocument(incoming),
        local: displayedDocument(),
      });
      return;
    }
    applyExternalDocument(incoming);
  };

  /** Shared paste policy for the convenience method and the native pipeline:
      the P0 schema plus the Markdown bridge (literal text for `text/plain`),
      identity stripping, whole-refusal classification and the preserved-span
      refusal. The full profile plans through the full schema and bridge
      instead. Emits exactly one `paste` event on insertion. */
  function runPastePolicy(
    view: EditorView,
    html: string,
    text: string,
    origin: "internal" | "external",
  ): void {
    const formats: ("text/html" | "text/plain")[] = [];
    if (html !== "") formats.push("text/html");
    if (text !== "") formats.push("text/plain");
    if (formats.length === 0) return;
    const { from, to } = view.state.selection;
    const spannedKinds: string[] = [];
    view.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === "preservedBlock") {
        const kind = node.attrs["preservedKind"];
        const label =
          typeof kind === "string" && kind !== "" ? kind : "preservedBlock";
        if (!spannedKinds.includes(label)) spannedKinds.push(label);
      }
      return true;
    });
    if (spannedKinds.length > 0) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: spannedKinds,
        clipboardFormats: formats,
      });
      return;
    }
    if (isFull) {
      if (runFullCodeLiteral(view, html, text, origin)) return;
      if (runFullUrlOverSelection(view, html, text, origin)) return;
      runFullPastePolicy(view, html, text, origin, formats);
      return;
    }
    let planned: PastePlan;
    if (html !== "") {
      planned = planHtmlPaste(view.state.schema, html, allocateFresh, {
        preserveWhitespace: documentFormat === "text/plain",
      });
      if (documentFormat === "text/plain" && planned.outcome === "insert") {
        planned = {
          outcome: "insert",
          paragraphs: stripPlannedMarks(planned.paragraphs),
          imageReported: planned.imageReported,
          openStart: planned.openStart,
          openEnd: planned.openEnd,
        };
      }
    } else if (isPlainTextFormat()) {
      planned = planLiteralPaste(text, allocateFresh);
    } else {
      planned = planTextPaste(manager(), text, allocateFresh);
    }
    if (planned.outcome === "refuse") {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: [...planned.rejectedKinds],
        clipboardFormats: formats,
      });
      return;
    }
    if (planned.imageReported && planned.paragraphs.length === 0) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: ["image"],
        clipboardFormats: formats,
      });
      return;
    }
    if (planned.paragraphs.length === 0) return;
    const beforeIds = identitySet();
    lastDispatchChanged = false;
    suppressedAffected.clear();
    suppressEmit = true;
    try {
      view.dispatch(
        view.state.tr.replaceSelection(
          sliceForParagraphs(
            view.state.schema,
            planned.paragraphs,
            planned.openStart,
            planned.openEnd,
          ),
        ),
      );
    } finally {
      suppressEmit = false;
    }
    if (tracker.composing || view.composing) return;
    if (!lastDispatchChanged) {
      if (planned.imageReported) {
        callbacks.onUnsupportedPaste?.({
          rejectedKinds: ["image"],
          clipboardFormats: formats,
        });
      }
      return;
    }
    // Inserted identities are read from the resulting document, after slice
    // adjustment and identity repair (N3): a planned identity that never
    // entered (an open slice inserted inline keeps the host paragraph, so
    // its fresh identity is unused) is never announced, while a split tail
    // the insertion created is. Order follows the resulting document.
    // Complete affected in final-document order: pasting inside a paragraph
    // splits it, so the split tail (fresh identity from the repair) and the
    // modified head join the inserted blocks.
    const afterIds = identitySet();
    const inserted = [...afterIds].filter((id) => !beforeIds.has(id));
    for (const id of inserted) seeds.touched.add(id);
    const affected = orderIdsByDocument([...inserted, ...suppressedAffected]);
    const after = displayedCaptureResult();
    emitChange(
      "paste",
      affected,
      {
        paste: { insertedParagraphIds: inserted, origin },
      },
      after,
    );
    if (planned.imageReported) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: ["image"],
        clipboardFormats: formats,
      });
    }
  }

  /** Full-profile paste policy (CL-2F P matrix): safe content enters as
      editable structure with fresh identities; foreign ids are stripped, and
      tables/task content/active HTML/unsafe hrefs refuse the payload whole. */
  /** Code-context literal paste (R-FULL-CODE-1 item 3): when the whole
      selection sits inside one code block the payload inserts as literal
      text — LFs kept, no marks, no code/prose/code split. Emits exactly one
      `paste` event. Returns true when the path applied. */
  function runFullCodeLiteral(
    view: EditorView,
    html: string,
    text: string,
    origin: "internal" | "external",
  ): boolean {
    const literal = codeLiteralSlice(
      view.state.schema,
      view.state.selection,
      text === "" ? null : text,
      html === "" ? null : html,
    );
    if (literal === null) return false;
    const codeId = view.state.selection.$from.parent.attrs[PARAGRAPH_ID_ATTRIBUTE];
    const beforeIds = identitySet();
    lastDispatchChanged = false;
    suppressedAffected.clear();
    suppressEmit = true;
    try {
      view.dispatch(view.state.tr.replaceSelection(literal));
    } finally {
      suppressEmit = false;
    }
    if (tracker.composing || view.composing) return true;
    if (!lastDispatchChanged) return true;
    const afterIds = identitySet();
    const inserted = [...afterIds].filter((id) => !beforeIds.has(id));
    for (const id of inserted) seeds.touched.add(id);
    const affected = orderIdsByDocument([
      ...(typeof codeId === "string" && codeId !== "" ? [codeId] : []),
      ...inserted,
      ...suppressedAffected,
    ]);
    const after = displayedCaptureResult();
    emitChange(
      "paste",
      affected,
      {
        paste: { insertedParagraphIds: inserted, origin },
      },
      after,
    );
    return true;
  }

  /** URL paste over a selected label (F07 review 1 item 9): when the
      payload is link intent — a single token carrying a URI scheme — and
      the selection is a non-empty range inside one textblock, the label
      keeps its text and gains the link instead of being replaced. The href
      decodes and validates first (R-FULL-URL-1); a forbidden href refuses
      the whole paste so the label is never destroyed for a refused link.
      Returns true when the path applied (link or refusal). */
  function runFullUrlOverSelection(
    view: EditorView,
    html: string,
    text: string,
    origin: "internal" | "external",
  ): boolean {
    if (html !== "") return false;
    if (/\s/.test(text)) return false;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decodeHrefToken(text))) return false;
    const { $from, $to } = view.state.selection;
    if ($from.pos === $to.pos) return false;
    if ($from.parent !== $to.parent || !$from.parent.isTextblock) return false;
    if ($from.parent.type.name === "codeBlock") return false;
    const href = decodeHrefToken(text);
    if (!isAllowedHref(href)) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: ["link"],
        clipboardFormats: ["text/plain"],
      });
      return true;
    }
    const linkType = view.state.schema.marks["link"];
    if (linkType === undefined) return false;
    const blockId = $from.parent.attrs[PARAGRAPH_ID_ATTRIBUTE];
    lastDispatchChanged = false;
    suppressedAffected.clear();
    suppressEmit = true;
    try {
      view.dispatch(
        view.state.tr.addMark($from.pos, $to.pos, linkType.create({ href })),
      );
    } finally {
      suppressEmit = false;
    }
    if (tracker.composing || view.composing) return true;
    if (!lastDispatchChanged) return true;
    const affected = orderIdsByDocument([
      ...(typeof blockId === "string" && blockId !== "" ? [blockId] : []),
      ...suppressedAffected,
    ]);
    const after = displayedCaptureResult();
    emitChange(
      "paste",
      affected,
      {
        paste: { insertedParagraphIds: [], origin },
      },
      after,
    );
    return true;
  }

  function runFullPastePolicy(
    view: EditorView,
    html: string,
    text: string,
    origin: "internal" | "external",
    formats: ("text/html" | "text/plain")[],
  ): void {
    const planned =
      html !== ""
        ? planFullHtmlPaste(view.state.schema, html, allocateFresh)
        : planFullTextPaste(text, allocateFresh);
    if (planned.outcome === "refuse") {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: [...planned.rejectedKinds],
        clipboardFormats: formats,
      });
      return;
    }
    if (planned.imageReported && planned.blocks.length === 0) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: ["image"],
        clipboardFormats: formats,
      });
      return;
    }
    if (planned.blocks.length === 0) return;
    const beforeIds = identitySet();
    lastDispatchChanged = false;
    suppressedAffected.clear();
    suppressEmit = true;
    try {
      view.dispatch(
        view.state.tr.replaceSelection(
          sliceForFullBlocks(view.state.schema, planned.blocks),
        ),
      );
    } finally {
      suppressEmit = false;
    }
    if (tracker.composing || view.composing) return;
    if (!lastDispatchChanged) {
      if (planned.imageReported) {
        callbacks.onUnsupportedPaste?.({
          rejectedKinds: ["image"],
          clipboardFormats: formats,
        });
      }
      return;
    }
    const afterIds = identitySet();
    const inserted = [...afterIds].filter((id) => !beforeIds.has(id));
    for (const id of inserted) seeds.touched.add(id);
    const affected = orderIdsByDocument([...inserted, ...suppressedAffected]);
    const after = displayedCaptureResult();
    emitChange(
      "paste",
      affected,
      {
        paste: { insertedParagraphIds: inserted, origin },
      },
      after,
    );
    if (planned.imageReported) {
      callbacks.onUnsupportedPaste?.({
        rejectedKinds: ["image"],
        clipboardFormats: formats,
      });
    }
  }

  /** Reset identity attributes on a pasted slice (defence in depth: the
      policy path re-plans from the raw transfer, so this transformed slice
      is discarded there; any other consumer still never trusts identities). */
  function stripSliceIdentities(slice: Slice): Slice {
    const nodes: ProseMirrorNode[] = [];
    const stripDeep = (node: ProseMirrorNode): ProseMirrorNode => {
      let remade = node;
      if (isIdentityBlockName(node.type.name)) {
        remade = node.type.create(
          { ...node.attrs, [PARAGRAPH_ID_ATTRIBUTE]: "" },
          node.content,
          node.marks,
        );
      }
      if (node.type.name === "bulletList" || node.type.name === "orderedList") {
        const cleared: ProseMirrorNode[] = [];
        remade.content.forEach((child) => cleared.push(stripDeep(child)));
        remade = node.type.create(
          { ...node.attrs, listRunId: "" },
          Fragment.from(cleared),
        );
      } else if (remade !== node || node.childCount > 0) {
        const rebuilt: ProseMirrorNode[] = [];
        let changed = remade !== node;
        remade.content.forEach((child) => {
          const next = stripDeep(child);
          if (next !== child) changed = true;
          rebuilt.push(next);
        });
        if (changed) {
          remade = node.type.create(remade.attrs, Fragment.from(rebuilt), node.marks);
        }
      }
      return remade;
    };
    slice.content.forEach((node) => {
      nodes.push(stripDeep(node));
    });
    return new Slice(Fragment.from(nodes), slice.openStart, slice.openEnd);
  }

  // Explicit composition wiring (view `composing` state plus DOM events).
  // jsdom exercises this wiring through synthetic view-level
  // `compositionstart`/`compositionend` events; the real-IME witness stays
  // in RT-1 (browser, CDP `Input.imeSetComposition`).
  //
  // IME-LOCK-1 clauses 2/3/5: a host-driven revocation (`setEditable(false)`
  // or `setDisabled(true)`) mid-composition abandons the composition. The
  // flag is set on the transition while composing; `handleCompositionEnd`
  // then discards instead of committing: no `composition-commit` carries the
  // uncommitted text, the display reverts to the revision recorded at
  // composition start, and nothing is emitted after revocation.
  //
  // Committed-revision restoration: the pinned revision is the live
  // ProseMirror content plus its wire/flag records at composition start.
  // Local rollback restores both directly — never a Markdown reparse and
  // never a seed-fresh classification — while the pre-composition
  // acknowledgement state stays untouched.
  let compositionBaseDoc: ProseMirrorNode | null = null;
  let compositionBaseSeeds: {
    texts: Map<string, string>;
    touched: Set<string>;
    preserved: Map<string, { hasRaw: boolean; hasKind: boolean }>;
    versionTexts: Map<string, string>;
    versionFlagTexts: Map<string, boolean>;
  } | null = null;
  let compositionRevoked = false;
  const handleCompositionStart = (): void => {
    if (tracker.destroyed || !isActive()) return;
    domComposing = true;
    composingAffected.clear();
    composingChanged = false;
    compositionRevoked = false;
    // Recording read first so the version cache holds the committed
    // revision's exact wire and flag.
    displayedDocument();
    compositionBaseDoc = editor.state.doc;
    compositionBaseSeeds = {
      texts: new Map(seeds.texts),
      touched: new Set(seeds.touched),
      preserved: new Map(
        [...seeds.preserved].map(([key, value]) => [key, { ...value }] as const),
      ),
      versionTexts: new Map(seeds.versionTexts),
      versionFlagTexts: new Map(seeds.versionFlagTexts),
    };
    tracker.setComposing(true, currentCaptureResult);
  };
  const handleCompositionEnd = (): void => {
    if (tracker.destroyed) {
      domComposing = false;
      return;
    }
    domComposing = false;
    // Wait until ProseMirror has flushed the DOM observer and the composed
    // text is in the state: ProseMirror defers its own compositionend DOM
    // read to a microtask, so force the synchronous flush here first. The
    // resulting transaction lands while still composing and accumulates
    // into the pending commit instead of arriving later as `type`.
    try {
      const observer = (
        editor.view as unknown as {
          domObserver?: { flush?: () => void };
        }
      ).domObserver;
      observer?.flush?.();
    } catch {
      // An observer flush never blocks the commit.
    }
    // A revocation mid-composition abandons it (IME-LOCK-1 clauses 3/5):
    // only the uncommitted composition text is discarded — the display
    // reverts to the revision recorded at composition start while the
    // pre-composition acknowledgement state (`lastAcknowledged`,
    // `hasUnacknowledgedLocalRevision`) is preserved — and no
    // `composition-commit` is emitted. A deferred external arrival is still
    // re-evaluated once under §5.6, against the reverted revision.
    if (compositionRevoked) {
      compositionRevoked = false;
      const baseDoc = compositionBaseDoc;
      const baseSeeds = compositionBaseSeeds;
      compositionBaseDoc = null;
      compositionBaseSeeds = null;
      if (baseDoc !== null && baseSeeds !== null) {
        suppressEmit = true;
        try {
          const restore = editor.state.tr.replaceWith(
            0,
            editor.state.doc.content.size,
            baseDoc,
          );
          restore.setMeta("addToHistory", false);
          restore.setMeta(PRESERVED_REPLACE_META, true);
          editor.view.dispatch(restore);
          // Restore the committed wire/flag records over any touched
          // marking the flush and the revert dispatch just produced.
          seeds.texts.clear();
          for (const [key, value] of baseSeeds.texts) seeds.texts.set(key, value);
          seeds.touched.clear();
          for (const id of baseSeeds.touched) seeds.touched.add(id);
          seeds.preserved.clear();
          for (const [key, value] of baseSeeds.preserved) {
            seeds.preserved.set(key, { ...value });
          }
          seeds.versionTexts.clear();
          for (const [key, value] of baseSeeds.versionTexts) {
            seeds.versionTexts.set(key, value);
          }
          seeds.versionFlagTexts.clear();
          for (const [key, value] of baseSeeds.versionFlagTexts) {
            seeds.versionFlagTexts.set(key, value);
          }
        } finally {
          suppressEmit = false;
        }
      }
      // Drop the pending-commit bookkeeping once the revert has landed:
      // the flush above and the revert itself dispatch while still
      // composing, which re-arms the accumulators — a later
      // `compositionend` must never commit the abandoned text.
      composingAffected.clear();
      composingChanged = false;
      // PM skips its own `compositionend` while the view is non-editable,
      // so its `composing` flag would stick forever and suppress every
      // later gesture. The end event arrived: clear the flag the way PM's
      // own handler does, through the view's input state.
      const input = (
        editor.view as unknown as { input?: { composing?: boolean } }
      ).input;
      if (input !== undefined && input !== null && input.composing === true) {
        input.composing = false;
      }
      // Clause 4: pending captures reject exactly once with the neutral
      // error through a cancellation that leaves the session alive —
      // witnessed separately from the destroy path. The flag closes after,
      // with no pending left to resolve.
      tracker.cancelPendingCaptures();
      // Close the composition state BEFORE re-evaluating the deferred
      // arrival: the settle dispatches its own replacement transaction,
      // which must never be misread as pending composition work by the
      // next `compositionend`.
      tracker.setComposing(false, currentCaptureResult);
      if (deferredExternal !== null && !editor.view.composing) {
        const pending = deferredExternal;
        deferredExternal = null;
        settleExternal(pending);
      }
      return;
    }
    compositionBaseDoc = null;
    compositionBaseSeeds = null;
    // §5.6 order: exactly one `composition-commit` first, then the deferred
    // external re-evaluation, then readiness opening and capture settlement.
    const changed = composingChanged;
    const affected = [...composingAffected];
    composingAffected.clear();
    composingChanged = false;
    if (changed) {
      const after = displayedCaptureResult();
      emitChange("composition-commit", affected, undefined, after);
    }
    if (deferredExternal !== null && !editor.view.composing) {
      const pending = deferredExternal;
      deferredExternal = null;
      settleExternal(pending);
    }
    tracker.setComposing(false, currentCaptureResult);
  };
  // IME-LOCK-1 clause 2: revocation applies at once, without remount, even
  // mid-composition. When the surface goes inert while composing, the open
  // composition is marked revoked so its end discards instead of committing.
  const flagRevokedIfComposing = (): void => {
    if (tracker.composing || domComposing || editor.view.composing) {
      compositionRevoked = true;
    }
  };
  const markRevokedComposition = (): void => {
    if (tracker.destroyed || isActive()) return;
    flagRevokedIfComposing();
  };
  const domListeners: { type: string; handler: EventListener }[] = [];
  const listenDom = (type: string, handler: () => void): void => {
    const listener = handler as EventListener;
    element.addEventListener(type, listener);
    domListeners.push({ type, handler: listener });
  };
  listenDom("compositionstart", handleCompositionStart);
  listenDom("compositionend", handleCompositionEnd);

  // Mount content: replace the minimal construction document with the
  // host-supplied value before any gesture runs. Suppressed and outside
  // history: mounting emits no `onChange` and is never undone.
  suppressEmit = true;
  try {
    replaceDocument(mountDocument);
    reseedConversion(seeds, mountDocument);
    // Recording read (see rule-4 application above): records each mount
    // version's exact text with no bridge call.
    displayedDocument();
    if (isFull) {
      // Mounted baseline (review 2 blocking 3): the acknowledgement
      // reference is the canonical mounted document — normalized
      // containerOrder, materialized defaults, the TrailingNode
      // paragraph — never the pre-mount input, so a clean mount reports
      // no local edits on the next external update (Rule 4 applies it).
      // P0 keeps the input-copy baseline byte-identical to RT-1.
      lastAcknowledged = copyRichTextDocument(displayedDocument());
    }
    // Read-only/disabled mounts render no navigable link attributes from
    // the first paint (CL-2F-F-URL item 1).
    syncLinkInertness();
  } finally {
    suppressEmit = false;
  }

  const richEditor: RichTextEditor = {
    get view(): EditorView {
      return editor.view;
    },

    getDocument(): RichTextDocument {
      return currentDocument();
    },

    getSelection(): RichTextSelectionSnapshot {
      return selectionSnapshot();
    },

    setEditable(next: boolean): void {
      if (tracker.destroyed) return;
      // Mark first: flipping editability can synchronously tear down the
      // browser composition (a teardown `compositionend` must discard, never
      // commit the uncommitted text — IME-LOCK-1 clauses 3/5).
      if (!next) flagRevokedIfComposing();
      editable = next;
      editor.setEditable(isActive());
      syncLinkInertness();
      markRevokedComposition();
    },

    setDisabled(next: boolean): void {
      if (tracker.destroyed) return;
      // Same teardown race as `setEditable`: mark before flipping.
      if (next) flagRevokedIfComposing();
      disabled = next;
      editor.setEditable(isActive());
      syncLinkInertness();
      markRevokedComposition();
    },

    setPlaceholder(text: string, untranslated: string | null): void {
      if (tracker.destroyed) return;
      if (livePlaceholder === text && livePlaceholderMarker === untranslated) {
        return;
      }
      livePlaceholder = text;
      livePlaceholderMarker = untranslated;
      // Refresh the decorations with no document transaction: rebuilding
      // the view state re-runs the placeholder and marker decoration builds
      // against the stored values, without touching the document, history,
      // selection, events or acknowledgement (§5.7).
      try {
        editor.view.updateState(editor.view.state);
      } catch {
        // A decoration refresh never blocks the stored update.
      }
    },

    typeText(paragraphId: string, text: string): void {
      if (text === "") return;
      const target = blockPosition(paragraphId);
      if (target === null || !isTextParentName(target.name)) return;
      runGesture(
        "type",
        () => {
          const at = blockPosition(paragraphId);
          if (at === null) return;
          seeds.touched.add(paragraphId);
          editor.view.dispatch(
            editor.state.tr.insertText(text, at.end, at.end),
          );
        },
        () => ({ affected: [paragraphId] }),
      );
    },

    clearParagraph(paragraphId: string): void {
      const target = blockPosition(paragraphId);
      if (target === null || !isTextParentName(target.name)) return;
      if (target.end <= target.start) return;
      runGesture(
        "type",
        () => {
          const at = blockPosition(paragraphId);
          if (at === null) return;
          seeds.touched.add(paragraphId);
          editor.view.dispatch(editor.state.tr.delete(at.start, at.end));
        },
        () => ({ affected: [paragraphId] }),
      );
    },

    splitParagraph(paragraphId: string, offset: number): void {
      const target = blockPosition(paragraphId);
      if (target === null || !isTextParentName(target.name)) return;
      const size = target.end - target.start;
      const at = target.start + Math.max(0, Math.min(offset, size));
      const before = identitySet();
      runGesture(
        "split",
        () => {
          seeds.touched.add(paragraphId);
          editor.view.dispatch(editor.state.tr.split(at));
        },
        () => {
          const after = identitySet();
          const tails = [...after].filter((id) => !before.has(id));
          for (const tail of tails) seeds.touched.add(tail);
          return {
            affected: [paragraphId, ...tails],
            extra: {
              split: {
                sourceParagraphId: paragraphId,
                newParagraphIds: tails,
              },
            },
          };
        },
      );
    },

    mergeWithPrevious(paragraphId: string): void {
      const target = blockPosition(paragraphId);
      if (target === null || !isTextParentName(target.name)) return;
      const resolved = editor.state.doc.resolve(target.pos);
      const index = resolved.index();
      if (index === 0) return;
      const previous = resolved.parent.child(index - 1);
      if (previous.type.name !== target.name) return;
      const survivor = previous.attrs[PARAGRAPH_ID_ATTRIBUTE] as string;
      const before = identitySet();
      runGesture(
        "merge",
        () => {
          seeds.touched.add(survivor);
          seeds.touched.add(paragraphId);
          editor.view.dispatch(editor.state.tr.join(target.pos));
        },
        () => {
          const after = identitySet();
          const retired = [...before].filter((id) => !after.has(id));
          for (const id of retired) retiredIds.add(id);
          return {
            affected: [survivor],
            extra: {
              merge: {
                survivingParagraphId: survivor,
                retiredParagraphIds: retired,
              },
            },
          };
        },
      );
    },

    deleteBlocks(paragraphIds: readonly string[]): void {
      // Deduplicate identities first: the same range deleted twice would
      // remove the neighbour that slid into its positions (R6). Ranges are
      // deduplicated too, so overlapping inputs still delete once.
      const uniqueIds = [...new Set(paragraphIds)];
      const ranges = uniqueIds
        .map((id) => blockPosition(id))
        .filter((target) => target !== null)
        .sort((left, right) => right.pos - left.pos);
      const seenRanges = new Set<string>();
      const deduped = ranges.filter((range) => {
        const key = `${range.pos}:${range.size}`;
        if (seenRanges.has(key)) return false;
        seenRanges.add(key);
        return true;
      });
      if (deduped.length === 0) return;
      // §6.3: a destructive span over a preserved block is refused whole —
      // a silent no-op with the preserved blocks intact. The
      // `filterTransaction` guard backstops every other user path.
      for (const range of deduped) {
        if (range.name === "preservedBlock") return;
      }
      const positions = new Map(
        uniqueIds.map((id) => [id, blockPosition(id)?.pos ?? Number.MAX_SAFE_INTEGER] as const),
      );
      // Affected follow the document order (ascending positions before the
      // delete), never the input order.
      const removed = uniqueIds
        .filter((id) => blockPosition(id) !== null)
        .sort((left, right) => (positions.get(left) ?? 0) - (positions.get(right) ?? 0));
      runGesture(
        "delete",
        () => {
          let tr = editor.state.tr;
          for (const range of deduped) {
            tr = tr.delete(range.pos, range.pos + range.size);
          }
          editor.view.dispatch(tr);
        },
        () => ({ affected: removed }),
      );
    },

    undo(): void {
      // CL-3a bound seam (§4.5): no ProseMirror history exists when bound
      // (UndoRedo removed above) and the UndoManager lands in CL-3b. Fail
      // closed — the same message as the collaboration placeholder — and
      // never double-record.
      if (boundCollaboration) {
        throw new Error("rich-text.bound-undo-unavailable");
      }
      if (tracker.destroyed || !isActive()) return;
      lastDispatchChanged = false;
      suppressedAffected.clear();
      pendingHistory = "undo";
      suppressEmit = true;
      try {
        editor.commands.undo();
      } finally {
        suppressEmit = false;
        pendingHistory = null;
      }
      if (tracker.composing || editor.view.composing) return;
      if (!lastDispatchChanged) return;
      // Only the blocks the undone transaction really touched: the version
      // cache restores their exact source, untouched blocks keep theirs.
      // Affected follow the resulting document order.
      const after = displayedCaptureResult();
      emitChange("undo", orderIdsByDocument([...suppressedAffected]), undefined, after);
    },

    redo(): void {
      if (boundCollaboration) {
        throw new Error("rich-text.bound-undo-unavailable");
      }
      if (tracker.destroyed || !isActive()) return;
      lastDispatchChanged = false;
      suppressedAffected.clear();
      pendingHistory = "redo";
      suppressEmit = true;
      try {
        editor.commands.redo();
      } finally {
        suppressEmit = false;
        pendingHistory = null;
      }
      if (tracker.composing || editor.view.composing) return;
      if (!lastDispatchChanged) return;
      const after = displayedCaptureResult();
      emitChange("redo", orderIdsByDocument([...suppressedAffected]), undefined, after);
    },

    copyToPayload(paragraphIds: readonly string[]): PastePayload {
      // ProseMirror clipboard serialisation: the text joins blocks with the
      // default `\n\n` separator and the HTML is the schema `DOMSerializer`
      // fragment, so block boundaries survive the round trip. Pasted
      // identities are stripped on insertion and replaced with fresh ones.
      const wanted = new Set(paragraphIds);
      const nodes: ProseMirrorNode[] = [];
      editor.state.doc.descendants((node) => {
        if (isIdentityBlockName(node.type.name)) {
          const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
          if (typeof id === "string" && wanted.has(id)) nodes.push(node);
        }
        return true;
      });
      const fragment = Fragment.from(nodes);
      const text = fragment.textBetween(0, fragment.size, "\n\n");
      const serializer = DOMSerializer.fromSchema(editor.schema);
      const container = globalThis.document.createElement("div");
      container.appendChild(serializer.serializeFragment(fragment));
      const payload: PastePayload = { text, html: container.innerHTML };
      internalPayloads.add(payload);
      return payload;
    },

    paste(payload: PastePayload): void {
      if (tracker.destroyed || !isActive()) return;
      const html = payload?.html ?? "";
      const text = payload?.text ?? "";
      const origin = internalPayloads.has(payload) ? "internal" : "external";
      runPastePolicy(editor.view, html, text, origin);
    },

    getBinding(): FieldBindingIdentity | null {
      return binding;
    },

    applyExternalUpdate(next: RichTextDocument): void {
      if (tracker.destroyed) return;
      const incoming = copyRichTextDocument(next);
      // R-FULL-PROFILE-1: a profile/format mismatch refuses the external
      // update without changing the local draft. R-FULL-URL-1: an incoming
      // full document carrying a forbidden link target refuses the same way.
      const formatOk = isFull
        ? incoming.format === FULL_PROFILE_ID
        : incoming.format !== FULL_PROFILE_ID;
      let hrefOk = true;
      if (isFull && formatOk) {
        try {
          assertFullDocumentLinksAllowed(incoming);
        } catch {
          hrefOk = false;
        }
      }
      if (!formatOk || !hrefOk) {
        callbacks.onExternalConflict?.({
          incoming: copyRichTextDocument(incoming),
          local: displayedDocument(),
        });
        return;
      }
      // Pre-canonical host echo (review 3 blocking 3, §5.6 Rule 1): the
      // host replays the exact pre-mount input while the displayed
      // document is the canonical mount. Acknowledge with no replace and
      // no conflict, without moving the acknowledgement off canonical.
      if (
        richTextDocumentsEqual(incoming, lastAcceptedInput) &&
        richTextDocumentsEqual(displayedDocument(), lastAcknowledged)
      ) {
        lastAcceptedInput = copyRichTextDocument(incoming);
        hasUnacknowledgedLocalRevision = false;
        return;
      }
      // §5.6 rule order via the pure decision (§5.6, never restated here).
      const decision = decideExternalUpdate({
        displayed: displayedDocument(),
        lastAcknowledged,
        incoming,
        composing: tracker.composing || editor.view.composing,
        hasUnacknowledgedLocalRevision,
      });
      // Rule 1 — echo: suppression of replacement plus acknowledgement
      // (clears the revision flag). The format is part of the equality.
      if (decision === "echo") {
        lastAcknowledged = incoming;
        lastAcceptedInput = copyRichTextDocument(incoming);
        hasUnacknowledgedLocalRevision = false;
        return;
      }
      // Rule 2 — composition: defer, neither apply nor signal yet.
      if (decision === "defer") {
        deferredExternal = incoming;
        return;
      }
      // Rule 3 — local divergence (wire difference or revision flag alone):
      // never overwrite, surface the conflict.
      if (decision === "conflict") {
        callbacks.onExternalConflict?.({
          incoming: copyRichTextDocument(incoming),
          local: displayedDocument(),
        });
        return;
      }
      // Rule 4 — no conflict: apply automatically with both selection ends
      // re-anchored by paragraph identity plus intra-paragraph offset.
      applyExternalDocument(incoming);
    },

    captureDocument(): Promise<RichTextCaptureResult> {
      return tracker.capture(currentCaptureResult);
    },

    readiness(): RichTextReadiness {
      return tracker.readiness();
    },

    destroy(): void {
      if (tracker.destroyed) return;
      for (const { type, handler } of domListeners) {
        element.removeEventListener(type, handler);
      }
      domListeners.length = 0;
      // Freeze the last displayed document first: the bridge is still
      // available here, and a retained handle keeps reading it afterwards.
      try {
        destroyedDocument = displayedDocument();
      } catch {
        destroyedDocument = null;
      }
      if (boundImpl !== undefined) {
        try {
          const ytextObs = boundImpl.ytext as unknown as {
            unobserve: (fn: (event: never, transaction: never) => void) => void;
          };
          const metaObs = boundImpl.fieldMeta as unknown as {
            unobserve: (fn: (event: never, transaction: never) => void) => void;
          };
          const ydocObs = (boundImpl.ytext as unknown as { doc?: { off: (name: string, fn: (transaction: never) => void) => void } }).doc;
          if (yTextHandler !== null) ytextObs.unobserve(yTextHandler as never);
          if (fieldMetaHandler !== null) metaObs.unobserve(fieldMetaHandler as never);
          if (afterTransactionHandler !== null) ydocObs?.off("afterTransaction", afterTransactionHandler as never);
        } catch {
          // Unobserving never blocks teardown.
        }
        yTextHandler = null;
        fieldMetaHandler = null;
        afterTransactionHandler = null;
        try {
          if (binding !== null && bindingSource !== null) {
            bindingSource.releaseBinding(binding);
          }
        } catch {
          // Release failures never break teardown; the binding is gone with the view.
        }
      }
      tracker.destroy();
      editor.destroy();
      // Release the conversion caches with the teardown: version texts drop
      // with their nodes, and no per-version seed survives through a
      // retained handle — only the single frozen document above.
      seeds.texts.clear();
      seeds.touched.clear();
      seeds.versions = new WeakMap<ProseMirrorNode, string>();
      seeds.versionTexts.clear();
      seeds.versionFlags = new WeakMap<ProseMirrorNode, boolean>();
      seeds.versionFlagTexts.clear();
      seeds.preserved.clear();
      lastNativeCopyText = null;
    },
  };

  return richEditor;
}
