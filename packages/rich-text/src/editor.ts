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
//   capture still pending at `destroy()` rejects once with the neutral
//   capture error; calls after destruction return an already-rejected
//   promise; `readiness()` after destruction is `{ composing: false, ready:
//   false }`.

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
  copyRichTextDocument,
  createCaptureTracker,
  decideExternalUpdate,
  richTextDocumentsEqual,
} from "./document.js";
import type { CaptureTracker } from "./document.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import { createP0EditorExtensions } from "./editor-extensions.js";
import {
  IDENTITY_FIX_META,
  PRESERVED_REPLACE_META,
  createParagraphIdentityExtension,
  createPreservedGuardExtension,
  createSessionAllocator,
} from "./editor-identity.js";
import {
  createConversionSeeds,
  documentToProseMirror,
  markTouchedFromTransaction,
  proseMirrorToDocument,
  reseedConversion,
} from "./editor-conversion.js";
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

export interface RichTextEditorCallbacks {
  onChange?: (event: RichTextChangeEvent) => void;
  onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
  onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
  onReadinessChange?: (event: RichTextReadiness) => void;
}

export interface RichTextEditorOptions extends RichTextEditorCallbacks {
  document: RichTextDocument;
  messages: RichTextMessages;
  allocateId?: () => string;
  editable?: boolean;
  disabled?: boolean;
  /** Mount element. Defaults to a detached element; jsdom and browsers both
      satisfy the ProseMirror `document` requirement. */
  element?: HTMLElement;
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

function defaultAllocateId(): string {
  const cryptoObject = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();
  return `paragraph:generated-${Math.floor(Math.random() * 2 ** 32).toString(16)}`;
}

/** Create the Tiptap-bound editor: document in, document plus gesture out.
    The factory copies the supplied document, initialises the acknowledgement
    reference to that copy, and never mutates the caller's value. */
export function createRichTextEditor(
  options: RichTextEditorOptions,
): RichTextEditor {
  const retiredIds = new Set<string>();
  const allocateFresh = createSessionAllocator(
    options.allocateId ?? defaultAllocateId,
    retiredIds,
  );
  let editable = options.editable ?? true;
  let disabled = options.disabled ?? false;
  const callbacks: RichTextEditorCallbacks = {
    onChange: options.onChange,
    onExternalConflict: options.onExternalConflict,
    onUnsupportedPaste: options.onUnsupportedPaste,
    onReadinessChange: options.onReadinessChange,
  };
  const tracker: CaptureTracker = createCaptureTracker({
    onReadinessChange: callbacks.onReadinessChange,
  });
  // Membership only: a payload object built by `copyToPayload()` marks an
  // internal paste. A `WeakSet` holds no copy after its last external
  // reference drops, so a long session never accumulates pastes.
  const internalPayloads = new WeakSet<PastePayload>();
  const seeds: ConversionSeeds = createConversionSeeds(options.document);
  let documentFormat: RichTextFormat = options.document.format;
  const isPlainTextFormat = (): boolean => documentFormat === "text/plain";
  let lastAcknowledged = copyRichTextDocument(options.document);
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
  const editor = new Editor({
    element,
    extensions: [
      ...createP0EditorExtensions({ placeholder: options.messages.placeholder }),
      createParagraphIdentityExtension(allocateFresh, {
        // Identities a select-all replacement consumed (N8, §5.2): retired
        // inside the session, never reallocated.
        onRetire: (ids) => {
          for (const id of ids) retiredIds.add(id);
        },
      }),
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
            node.type.name !== "text"
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
        sanitizePastedHtml(html).html,
      transformPasted: (slice: Slice): Slice => stripSliceIdentities(slice),
      // Allocation-free literal fallback: the parsed slice is discarded by
      // `handlePaste` (which re-plans from the raw transfer), so this layer
      // must not consume allocator identities.
      clipboardTextParser: (text: string): Slice => {
        if (text === "") return Slice.empty;
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

  const displayedDocument = (): RichTextDocument =>
    proseMirrorToDocument(manager(), editor.state.doc, documentFormat, seeds);

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

  const emitChange = (
    kind: RichTextGestureKind,
    affectedParagraphIds: readonly string[],
    extra?: Partial<Pick<RichTextGesture, "split" | "merge" | "paste">>,
    document?: RichTextDocument,
  ): void => {
    if (tracker.destroyed) return;
    gestureSequence += 1;
    const gesture: RichTextGesture = {
      gestureId: `gesture:${gestureSequence}`,
      kind,
      affectedParagraphIds: [...affectedParagraphIds],
      ...extra,
    };
    callbacks.onChange?.({
      document: document ?? currentDocument(),
      gesture,
    });
  };

  let lastDispatchChanged = false;

  /** Top-level blocks of a document for native-gesture provenance. */
  const nativeBlocksOf = (
    docNode: ProseMirrorNode,
  ): { id: string; text: string }[] => {
    const blocks: { id: string; text: string }[] = [];
    docNode.forEach((node) => {
      if (
        node.type.name === "paragraph" ||
        node.type.name === "preservedBlock"
      ) {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && id !== "") {
          blocks.push({ id, text: node.textContent });
        }
      }
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
    editor.state.doc.forEach((node) => {
      if (
        node.type.name === "paragraph" ||
        node.type.name === "preservedBlock"
      ) {
        const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof id === "string" && wanted.has(id)) {
          wanted.delete(id);
          ordered.push(id);
        }
      }
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
      markTouchedFromTransaction(touched, editor.state.doc, transaction);
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
      markTouchedFromTransaction(affectedSet, editor.state.doc, transaction);
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
      // removed identities plus every survivor whose text actually changed
      // (N8 regression — the modified survivor `a` was missing), in final
      // document order. A whole-block removal that leaves its neighbours
      // byte-identical still reports only the removed identity.
      const afterTextById = new Map(after.map((block) => [block.id, block.text]));
      const modifiedSurvivors = before
        .filter((block) => {
          const next = afterTextById.get(block.id);
          return next !== undefined && next !== block.text;
        })
        .map((block) => block.id);
      return {
        kind: "delete",
        affected: orderIdsByDocument([...modifiedSurvivors, ...removed]),
      };
    }
    const affectedSet = new Set<string>();
    markTouchedFromTransaction(affectedSet, editor.state.doc, transaction);
    return { kind: "type", affected: orderIdsByDocument([...affectedSet]) };
  };

  /** Bookkeep one transaction (touched identities, composition, deferred
      re-evaluation) and emit exactly one event for real input. Native
      transactions carry their provenance from commands and meta; suppressed
      (programmatic-gesture) transactions only record. */
  function handleTransaction(transaction: Transaction): void {
    if (tracker.destroyed) return;
    if (transaction.getMeta(IDENTITY_FIX_META) === true) {
      prevUndoDepth = undoDepth(editor.state);
      prevRedoDepth = redoDepth(editor.state);
      return;
    }
    if (transaction.docChanged) lastDispatchChanged = true;
    markTouchedFromTransaction(seeds.touched, editor.state.doc, transaction);
    if (suppressEmit) {
      markTouchedFromTransaction(
        suppressedAffected,
        editor.state.doc,
        transaction,
      );
    }
    if (editor.view.composing && !tracker.composing) {
      composingAffected.clear();
      composingChanged = false;
      tracker.setComposing(true, currentDocument);
    }
    if (tracker.composing || editor.view.composing) {
      markTouchedFromTransaction(
        composingAffected,
        editor.state.doc,
        transaction,
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
        (node.type.name === "paragraph" || node.type.name === "preservedBlock") &&
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
      if (
        node.type.name === "paragraph" ||
        node.type.name === "preservedBlock"
      ) {
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
      into the pending `composition-commit` and emits nothing itself. */
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
    const after = displayedDocument();
    const built = gesture();
    emitChange(kind, built.affected, built.extra, after);
  };

  const selectionEndSnapshot = (
    $pos: { parent: ProseMirrorNode; parentOffset: number },
  ): { paragraphId: string | null; offset: number } => {
    const parent = $pos.parent;
    if (parent.type.name === "paragraph" || parent.type.name === "preservedBlock") {
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
      documentToProseMirror(manager(), incoming),
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
        if ((left.text ?? undefined) !== (right.text ?? undefined)) {
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
      lastAcknowledged = copyRichTextDocument(incoming);
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
    const decision = decideExternalUpdate({
      displayed: displayedDocument(),
      lastAcknowledged,
      incoming,
      composing: false,
    });
    if (decision === "echo") {
      lastAcknowledged = copyRichTextDocument(incoming);
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
      refusal. Emits exactly one `paste` event on insertion. */
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
    const after = displayedDocument();
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
    slice.content.forEach((node) => {
      if (
        node.type.name === "paragraph" ||
        node.type.name === "preservedBlock"
      ) {
        nodes.push(
          node.type.create(
            { ...node.attrs, [PARAGRAPH_ID_ATTRIBUTE]: "" },
            node.content,
            node.marks,
          ),
        );
      } else {
        nodes.push(node);
      }
    });
    return new Slice(Fragment.from(nodes), slice.openStart, slice.openEnd);
  }

  // Explicit composition wiring (view `composing` state plus DOM events).
  // jsdom exercises this wiring through synthetic view-level
  // `compositionstart`/`compositionend` events; the real-IME witness stays
  // in RT-1 (browser, CDP `Input.imeSetComposition`).
  const handleCompositionStart = (): void => {
    if (tracker.destroyed || !isActive()) return;
    domComposing = true;
    composingAffected.clear();
    composingChanged = false;
    tracker.setComposing(true, currentDocument);
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
    // §5.6 order: exactly one `composition-commit` first, then the deferred
    // external re-evaluation, then readiness opening and capture settlement.
    const changed = composingChanged;
    const affected = [...composingAffected];
    composingAffected.clear();
    composingChanged = false;
    if (changed) {
      const after = displayedDocument();
      emitChange("composition-commit", affected, undefined, after);
    }
    if (deferredExternal !== null && !editor.view.composing) {
      const pending = deferredExternal;
      deferredExternal = null;
      settleExternal(pending);
    }
    tracker.setComposing(false, currentDocument);
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
    replaceDocument(options.document);
    reseedConversion(seeds, options.document);
    // Recording read (see rule-4 application above): records each mount
    // version's exact text with no bridge call.
    displayedDocument();
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
      editable = next;
      editor.setEditable(isActive());
    },

    setDisabled(next: boolean): void {
      if (tracker.destroyed) return;
      disabled = next;
      editor.setEditable(isActive());
    },

    typeText(paragraphId: string, text: string): void {
      if (text === "") return;
      const target = blockPosition(paragraphId);
      if (target === null || target.name !== "paragraph") return;
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
      if (target === null || target.name !== "paragraph") return;
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
      if (target === null || target.name !== "paragraph") return;
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
      if (target === null || target.name !== "paragraph") return;
      const resolved = editor.state.doc.resolve(target.pos);
      const index = resolved.index();
      if (index === 0) return;
      const previous = resolved.parent.child(index - 1);
      if (previous.type.name !== "paragraph") return;
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
      const after = displayedDocument();
      emitChange("undo", orderIdsByDocument([...suppressedAffected]), undefined, after);
    },

    redo(): void {
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
      const after = displayedDocument();
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
        if (
          node.type.name === "paragraph" ||
          node.type.name === "preservedBlock"
        ) {
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

    applyExternalUpdate(next: RichTextDocument): void {
      if (tracker.destroyed) return;
      const incoming = copyRichTextDocument(next);
      // Rule 1 — echo: suppression of replacement plus acknowledgement.
      // The format is part of the equality, so a format change falls through.
      if (richTextDocumentsEqual(incoming, displayedDocument())) {
        lastAcknowledged = incoming;
        return;
      }
      // Rule 2 — composition: defer, neither apply nor signal yet.
      if (tracker.composing || editor.view.composing) {
        deferredExternal = incoming;
        return;
      }
      // Rule 3 — local divergence: never overwrite, surface the conflict.
      if (!richTextDocumentsEqual(displayedDocument(), lastAcknowledged)) {
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

    captureDocument(): Promise<RichTextDocument> {
      return tracker.capture(currentDocument);
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
      tracker.destroy();
      editor.destroy();
      // Release the conversion caches with the teardown: version texts drop
      // with their nodes, and no per-version seed survives through a
      // retained handle — only the single frozen document above.
      seeds.texts.clear();
      seeds.touched.clear();
      seeds.versions = new WeakMap<ProseMirrorNode, string>();
      seeds.versionTexts.clear();
      seeds.preserved.clear();
      lastNativeCopyText = null;
    },
  };

  return richEditor;
}
