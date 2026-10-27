/**
 * RED: core placeholder refresh (review finding P2-2).
 * Spec §5.7. Environment: J.
 *
 * `setPlaceholder` must refresh the decorations without a document
 * transaction, for text change, marker set and marker clear.
 */
import { describe, it, expect } from "vitest";
import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { createRichTextEditor } from "./editor.js";
import type { RichTextChangeEvent, RichTextDocument } from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "OLD",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

function emptyDoc(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "" }],
  };
}

function showing(editor: ReturnType<typeof createRichTextEditor>): {
  placeholder: string | null;
  untranslated: string | null;
} {
  const p = editor.view.dom.querySelector(
    "p.is-empty, p[data-placeholder]",
  ) as HTMLElement | null;
  if (p === null) return { placeholder: null, untranslated: null };
  return {
    placeholder: p.getAttribute("data-placeholder"),
    untranslated: p.getAttribute("data-untranslated"),
  };
}

describe("core placeholder refresh without a document transaction", () => {
  it("a text change re-renders with no transaction, history, selection, event or acknowledgement change", () => {
    const changes: RichTextChangeEvent[] = [];
    const conflicts: unknown[] = [];
    const unsupported: unknown[] = [];
    const readiness: unknown[] = [];
    const editor = createRichTextEditor({
      document: emptyDoc(),
      messages: MESSAGES,
      allocateId: (() => {
        let n = 0;
        return () => `paragraph:test-${++n}`;
      })(),
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event);
      },
      onUnsupportedPaste: (event) => {
        unsupported.push(event);
      },
      onReadinessChange: (event) => {
        readiness.push(event);
      },
    });
    expect(showing(editor).placeholder).toBe("OLD");
    const docBefore = editor.getDocument();
    const selectionBefore = editor.getSelection();
    const undoBefore = undoDepth(editor.view.state);
    const redoBefore = redoDepth(editor.view.state);

    editor.setPlaceholder("NEW", "rich-text.placeholder");

    // The visible decoration follows the stored text with no transaction.
    expect(showing(editor).placeholder).toBe("NEW");
    expect(showing(editor).untranslated).toBe("rich-text.placeholder");
    // No document, history, selection, event or acknowledgement effect.
    expect(editor.getDocument()).toEqual(docBefore);
    expect(editor.getSelection()).toEqual(selectionBefore);
    expect(undoDepth(editor.view.state)).toBe(undoBefore);
    expect(redoDepth(editor.view.state)).toBe(redoBefore);
    expect(changes).toHaveLength(0);
    expect(conflicts).toHaveLength(0);
    expect(unsupported).toHaveLength(0);
    expect(readiness).toHaveLength(0);
    // Acknowledgement untouched: the unchanged echo still acknowledges,
    // and a clean external C still applies with no conflict.
    editor.applyExternalUpdate(emptyDoc());
    expect(conflicts).toHaveLength(0);
    expect(changes).toHaveLength(0);
    const docC: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "C" }],
    };
    editor.applyExternalUpdate(docC);
    expect(conflicts).toHaveLength(0);
    expect(editor.getDocument()).toEqual(docC);
    editor.destroy();
  });

  it("clearing the marker removes it with no transaction", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: emptyDoc(),
      messages: MESSAGES,
      allocateId: (() => {
        let n = 0;
        return () => `paragraph:test-${++n}`;
      })(),
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.setPlaceholder("NEW", "rich-text.placeholder");
    expect(showing(editor).untranslated).toBe("rich-text.placeholder");
    const docBefore = editor.getDocument();
    const selectionBefore = editor.getSelection();
    const undoBefore = undoDepth(editor.view.state);

    editor.setPlaceholder("TRANSLATED", null);

    expect(showing(editor).placeholder).toBe("TRANSLATED");
    expect(showing(editor).untranslated).toBeNull();
    expect(editor.getDocument()).toEqual(docBefore);
    expect(editor.getSelection()).toEqual(selectionBefore);
    expect(undoDepth(editor.view.state)).toBe(undoBefore);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("a local draft still conflicts after a placeholder refresh", () => {
    const changes: RichTextChangeEvent[] = [];
    const conflicts: { incoming: RichTextDocument }[] = [];
    const twoEmpty: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:1", kind: "paragraph", text: "" },
        { paragraphId: "paragraph:2", kind: "paragraph", text: "" },
      ],
    };
    const editor = createRichTextEditor({
      document: twoEmpty,
      messages: MESSAGES,
      allocateId: (() => {
        let n = 0;
        return () => `paragraph:test-${++n}`;
      })(),
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event as { incoming: RichTextDocument });
      },
    });
    editor.typeText("paragraph:1", "draft");
    expect(changes).toHaveLength(1);
    editor.setPlaceholder("NEW", null);
    // The untouched empty paragraph re-renders the new text.
    expect(showing(editor).placeholder).toBe("NEW");
    const docC: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:1", kind: "paragraph", text: "draft" },
        { paragraphId: "paragraph:2", kind: "paragraph", text: "C" },
      ],
    };
    editor.applyExternalUpdate(docC);
    // The refresh must not have acknowledged the draft: C conflicts.
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.incoming).toEqual(docC);
    editor.destroy();
  });
});
