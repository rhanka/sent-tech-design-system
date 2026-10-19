// Tiptap-bound editor factory: the "./editor" entry (spec §4.2).
//
// `createRichTextEditor` builds a real Tiptap `Editor` from the P0
// extensions, installs the live paragraph-identity plugin, maps
// `RichTextDocument` to and from the ProseMirror document with the
// `paragraphId` attribute, and converts editable paragraph Markdown through
// `@tiptap/markdown` per paragraph only. Split, merge, undo/redo, paste
// parsing and Markdown conversion are ProseMirror/Tiptap behaviour reached
// through this entry, never re-implemented in the DS.
//
// Contract (spec §5.3, §5.4, §5.6, §7):
// - Controlled: initialised from a copy of `options.document`, never
//   mutating the prop. Every emitted document carries exact keys.
// - One completed gesture emits exactly one `RichTextChangeEvent`; a gesture
//   that leaves the document unchanged emits nothing.
// - Read-only (`editable: false`) and form-disabled (`disabled: true`) are
//   inert: no mutation, no `onChange`, no `onUnsupportedPaste`. `disabled`
//   wins over `editable`. State changes emit nothing.
// - Text operations are ProseMirror transactions on the affected block only;
//   untouched paragraphs keep their seed text byte-identical and preserved
//   `raw` values carry through verbatim (§13.3 reactivity invariants).
// - Paste enters through the P0 schema only (ProseMirror clipboard parsing
//   plus the Markdown bridge for plain-text payloads); pasted identity
//   attributes are never trusted; a payload that would create any
//   non-paragraph block is refused whole.
// - External updates apply the pure §5.6 decision from the "." entry to the
//   live instance (suppress replacement, defer, emit `onExternalConflict`,
//   or replace content with selection re-anchoring).
// - `captureDocument()` resolves immediately when ready; during composition
//   it waits for the commit and resolves once with the committed document. A
//   capture still pending at `destroy()` rejects once with the neutral
//   capture error; calls after destruction return an already-rejected
//   promise; `readiness()` after destruction is `{ composing: false, ready:
//   false }`.

import { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
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
  createParagraphIdentityExtension,
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
  planTextPaste,
  sliceForParagraphs,
} from "./editor-paste.js";

/** Clipboard payload for `paste()`: `text/html` when present, else
    `text/plain`. Payloads built by `copyToPayload()` carry the internal
    origin; every other payload is external. */
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
  const internalPayloads = new Set<PastePayload>();
  const seeds: ConversionSeeds = createConversionSeeds(options.document);
  let documentFormat: RichTextFormat = options.document.format;
  let lastAcknowledged = copyRichTextDocument(options.document);
  let deferredExternal: RichTextDocument | null = null;
  let gestureSequence = 0;
  let suppressEmit = false;

  const isActive = (): boolean => editable && !disabled;

  const element =
    options.element ?? globalThis.document.createElement("div");
  const editor = new Editor({
    element,
    extensions: [
      ...createP0EditorExtensions({ placeholder: options.messages.placeholder }),
      createParagraphIdentityExtension(allocateFresh),
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editable: isActive(),
    onUpdate: ({ transaction }: { transaction: Transaction }) => {
      handleTransaction(transaction);
    },
  });

  const manager = (): MarkdownManager => editor.storage.markdown.manager;

  const displayedDocument = (): RichTextDocument =>
    proseMirrorToDocument(manager(), editor.state.doc, documentFormat, seeds);

  const currentDocument = displayedDocument;

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

  /** Bookkeep one transaction (touched identities, composition, deferred
      re-evaluation) and emit exactly one event for real input. */
  function handleTransaction(transaction: Transaction): void {
    if (tracker.destroyed) return;
    if (transaction.getMeta("richTextIdentityFix") === true) return;
    if (transaction.docChanged) lastDispatchChanged = true;
    markTouchedFromTransaction(seeds.touched, editor.state.doc, transaction);
    tracker.setComposing(editor.view.composing, currentDocument);
    if (!editor.view.composing && deferredExternal !== null) {
      const pending = deferredExternal;
      deferredExternal = null;
      settleExternal(pending);
    }
    if (suppressEmit) return;
    if (!transaction.docChanged) return;
    const affected = new Set<string>();
    markTouchedFromTransaction(affected, editor.state.doc, transaction);
    emitChange("type", [...affected]);
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
      changed the document. */
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
    suppressEmit = true;
    try {
      dispatch();
    } finally {
      suppressEmit = false;
    }
    if (!lastDispatchChanged) return;
    const after = displayedDocument();
    const built = gesture();
    emitChange(kind, built.affected, built.extra, after);
  };

  const selectionSnapshot = (): RichTextSelectionSnapshot => {
    const anchor = editor.state.selection.$anchor;
    const parent = anchor.parent;
    if (parent.type.name === "paragraph" || parent.type.name === "preservedBlock") {
      const id = parent.attrs[PARAGRAPH_ID_ATTRIBUTE];
      return {
        anchorParagraphId: typeof id === "string" ? id : null,
        anchorOffset: anchor.parentOffset,
      };
    }
    return { anchorParagraphId: null, anchorOffset: 0 };
  };

  /** Replace the whole ProseMirror document outside history: mounting and
      rule-4 external applications are not local undoable gestures, and the
      history stacks are left untouched by external applications. */
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
    editor.view.dispatch(tr);
  };

  const applyExternalDocument = (incoming: RichTextDocument): void => {
    const anchor = selectionSnapshot();
    suppressEmit = true;
    try {
      replaceDocument(incoming);
      reseedConversion(seeds, incoming);
      documentFormat = incoming.format;
      lastAcknowledged = copyRichTextDocument(incoming);
      deferredExternal = null;
    } finally {
      suppressEmit = false;
    }
    const target = blockPosition(anchor.anchorParagraphId ?? "");
    if (target !== null && anchor.anchorParagraphId !== null) {
      const size = target.end - target.start;
      const offset = Math.max(0, Math.min(anchor.anchorOffset, size));
      const tr = editor.state.tr.setSelection(
        TextSelection.create(editor.state.doc, target.start + offset),
      );
      suppressEmit = true;
      try {
        editor.view.dispatch(tr);
      } finally {
        suppressEmit = false;
      }
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

  // Mount content: replace the minimal construction document with the
  // host-supplied value before any gesture runs. Suppressed and outside
  // history: mounting emits no `onChange` and is never undone.
  suppressEmit = true;
  try {
    replaceDocument(options.document);
    reseedConversion(seeds, options.document);
  } finally {
    suppressEmit = false;
  }

  const richEditor: RichTextEditor = {
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
      const ranges = paragraphIds
        .map((id) => blockPosition(id))
        .filter((target) => target !== null)
        .sort((left, right) => right.pos - left.pos);
      if (ranges.length === 0) return;
      const removed = paragraphIds.filter((id) => blockPosition(id) !== null);
      runGesture(
        "delete",
        () => {
          let tr = editor.state.tr;
          for (const range of ranges) {
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
      suppressEmit = true;
      try {
        editor.commands.undo();
      } finally {
        suppressEmit = false;
      }
      if (!lastDispatchChanged) return;
      const after = displayedDocument();
      for (const block of after.blocks) seeds.touched.add(block.paragraphId);
      emitChange(
        "undo",
        after.blocks.map((block) => block.paragraphId),
        undefined,
        after,
      );
    },

    redo(): void {
      if (tracker.destroyed || !isActive()) return;
      lastDispatchChanged = false;
      suppressEmit = true;
      try {
        editor.commands.redo();
      } finally {
        suppressEmit = false;
      }
      if (!lastDispatchChanged) return;
      const after = displayedDocument();
      for (const block of after.blocks) seeds.touched.add(block.paragraphId);
      emitChange(
        "redo",
        after.blocks.map((block) => block.paragraphId),
        undefined,
        after,
      );
    },

    copyToPayload(paragraphIds: readonly string[]): PastePayload {
      const wanted = new Set(paragraphIds);
      const texts = currentDocument()
        .blocks.filter((block) => wanted.has(block.paragraphId))
        .map((block) =>
          block.kind === "paragraph" ? (block.text ?? "") : (block.raw ?? ""),
        );
      const payload: PastePayload = { text: texts.join("\n") };
      internalPayloads.add(payload);
      return payload;
    },

    paste(payload: PastePayload): void {
      if (tracker.destroyed || !isActive()) return;
      const html = payload?.html ?? "";
      const text = payload?.text ?? "";
      const formats: ("text/html" | "text/plain")[] = [];
      if (html !== "") formats.push("text/html");
      if (text !== "") formats.push("text/plain");
      if (formats.length === 0) return;
      const origin = internalPayloads.has(payload) ? "internal" : "external";
      const planned =
        html !== ""
          ? planHtmlPaste(editor.schema, html, allocateFresh)
          : planTextPaste(manager(), text, allocateFresh);
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
      const inserted = planned.paragraphs.map(
        (paragraph) =>
          (paragraph.attrs as Record<string, unknown>)[
            PARAGRAPH_ID_ATTRIBUTE
          ] as string,
      );
      lastDispatchChanged = false;
      suppressEmit = true;
      try {
        editor.view.dispatch(
          editor.state.tr.replaceSelection(
            sliceForParagraphs(editor.schema, planned.paragraphs),
          ),
        );
      } finally {
        suppressEmit = false;
      }
      if (!lastDispatchChanged) {
        if (planned.imageReported) {
          callbacks.onUnsupportedPaste?.({
            rejectedKinds: ["image"],
            clipboardFormats: formats,
          });
        }
        return;
      }
      for (const id of inserted) seeds.touched.add(id);
      const after = displayedDocument();
      emitChange(
        "paste",
        inserted,
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
      if (tracker.composing) {
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
      // Rule 4 — no conflict: apply automatically with selection re-anchored
      // by paragraph identity plus intra-paragraph offset.
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
      tracker.destroy();
      editor.destroy();
    },
  };

  return richEditor;
}
