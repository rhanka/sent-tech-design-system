/**
 * RED 3 — core plugin half: identity carriage through split, merge,
 * undo/redo, internal paste; external paste cannot inject identity.
 * Spec §11 RED 3, §5.2. Environment: J.
 *
 * Observable assertion: Enter-split keeps the leading `paragraphId` and gives
 * the tail a fresh allocator-supplied ID (`gesture.split` names source and
 * fresh tails); Backspace-merge keeps the leading ID, retires the consumed ID
 * without ever reallocating it (`gesture.merge` names survivor and retired);
 * undo of a delete restores the same ID and redo removes it again; internal
 * copy/paste carries a fresh ID distinct from its source (`gesture.paste`
 * names the inserted IDs with the correct origin); an external paste whose
 * HTML carries `data-paragraph-id="paragraph:forged"` yields an
 * allocator-supplied ID, never `paragraph:forged`. IDs are read from the
 * emitted `RichTextDocument` blocks.
 *
 * Tiptap entry: split/merge/undo/paste identity assertions exercise
 * ProseMirror transactions and the live identity plugin through
 * `createRichTextEditor` from `./editor.js`. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { AllSelection, TextSelection } from "@tiptap/pm/state";
import { deleteSelection, splitBlock } from "@tiptap/pm/commands";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function setup(initial: RichTextDocument) {
  const changes: RichTextChangeEvent[] = [];
  let n = 0;
  const allocated: string[] = [];
  const editor: RichTextEditor = createRichTextEditor({
    document: initial,
    messages: MESSAGES,
    allocateId: () => {
      const id = `paragraph:fresh-${++n}`;
      allocated.push(id);
      return id;
    },
    onChange: (event) => {
      changes.push(event);
    },
  });
  return { editor, changes, allocated };
}

const TWO_PARAGRAPHS: RichTextDocument = {
  format: "focus.markdown.p0@1",
  blocks: [paragraph("paragraph:a", "Alpha text"), paragraph("paragraph:b", "Beta text")],
};

describe("split carriage (Enter)", () => {
  it("leading block keeps its identity, tail carries a fresh allocator ID, gesture.split names both", () => {
    const { editor, changes } = setup(TWO_PARAGRAPHS);
    editor.splitParagraph("paragraph:a", 5);
    expect(changes).toHaveLength(1);
    const event = changes[0];
    expect(event?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
      "paragraph:fresh-1",
      "paragraph:b",
    ]);
    expect(event?.document.blocks[0]?.text).toBe("Alpha");
    expect(event?.document.blocks[1]?.text).toBe(" text");
    expect(event?.gesture.kind).toBe("split");
    expect(event?.gesture.split).toEqual({
      sourceParagraphId: "paragraph:a",
      newParagraphIds: ["paragraph:fresh-1"],
    });
    expect(event?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:fresh-1",
    ]);
    editor.destroy();
  });
});

describe("merge carriage (Backspace at paragraph start)", () => {
  it("leading identity survives, consumed identity is retired and never reallocated", () => {
    const { editor, changes, allocated } = setup(TWO_PARAGRAPHS);
    editor.mergeWithPrevious("paragraph:b");
    expect(changes).toHaveLength(1);
    const event = changes[0];
    expect(event?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
    ]);
    expect(event?.document.blocks[0]?.text).toBe("Alpha textBeta text");
    expect(event?.gesture.kind).toBe("merge");
    expect(event?.gesture.merge).toEqual({
      survivingParagraphId: "paragraph:a",
      retiredParagraphIds: ["paragraph:b"],
    });
    // A later split must not reallocate the retired identity.
    editor.splitParagraph("paragraph:a", 5);
    expect(allocated).not.toContain("paragraph:b");
    expect(changes).toHaveLength(2);
    expect(changes[1]?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
      "paragraph:fresh-1",
    ]);
    editor.destroy();
  });
});

describe("undo/redo identity restoration", () => {
  it("undo of a delete restores the same identity; redo removes it again", () => {
    const { editor, changes } = setup(TWO_PARAGRAPHS);
    editor.deleteBlocks(["paragraph:b"]);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("delete");
    expect(changes[0]?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
    ]);
    editor.undo();
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.kind).toBe("undo");
    expect(changes[1]?.document.blocks).toEqual(TWO_PARAGRAPHS.blocks);
    editor.redo();
    expect(changes).toHaveLength(3);
    expect(changes[2]?.gesture.kind).toBe("redo");
    expect(changes[2]?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
    ]);
    editor.destroy();
  });
});

describe("internal copy/paste identity", () => {
  it("pasted blocks carry fresh identities distinct from their source, origin internal", () => {
    const { editor, changes } = setup(TWO_PARAGRAPHS);
    const payload = editor.copyToPayload(["paragraph:a"]);
    editor.paste(payload);
    expect(changes).toHaveLength(1);
    const event = changes[0];
    const ids = event?.document.blocks.map((b) => b.paragraphId) ?? [];
    expect(ids).toContain("paragraph:a");
    const inserted = event?.gesture.paste?.insertedParagraphIds ?? [];
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).not.toBe("paragraph:a");
    expect(ids.filter((id) => id === inserted[0])).toHaveLength(1);
    expect(event?.gesture.paste?.origin).toBe("internal");
    expect(event?.gesture.kind).toBe("paste");
    editor.destroy();
  });
});

describe("external paste cannot inject identity", () => {
  it("a forged data-paragraph-id never survives; the block ID is allocator-supplied", () => {
    const { editor, changes } = setup(TWO_PARAGRAPHS);
    editor.paste({
      html: '<p data-paragraph-id="paragraph:forged">Forged</p>',
      text: "Forged",
    });
    expect(changes).toHaveLength(1);
    const ids =
      changes[0]?.document.blocks.map((b) => b.paragraphId) ?? [];
    expect(ids).not.toContain("paragraph:forged");
    expect(ids).toContain("paragraph:fresh-1");
    expect(changes[0]?.gesture.paste?.origin).toBe("external");
    editor.destroy();
  });
});

/**
 * Empty `text/plain` paragraphs, DS block level (spec §5.10, §2.2 M8,
 * RED 3 named witnesses). Both gestures are allowed locally; the
 * assertions stop at block level (no full-source string, no separator
 * stored, no `@sentropic/focus` import, no diff or return computed).
 * Host agreement for these gestures is not claimed under the pin and lives
 * only in FE-3 (§13.1).
 */
describe("Enter at end of paragraph (text/plain, allowed locally)", () => {
  it("Enter with the caret at the end splits: leading keeps its identity, the empty tail is fresh, one split event", () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:a", "A")],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:enter-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    // Caret at the end of the paragraph, then the native Enter command.
    editor.view.dispatch(
      editor.view.state.tr.setSelection(
        TextSelection.create(editor.view.state.doc, 2),
      ),
    );
    expect(changes).toHaveLength(0);
    const handled = splitBlock(
      editor.view.state,
      editor.view.dispatch.bind(editor.view),
    );
    expect(handled).toBe(true);
    expect(changes).toHaveLength(1);
    const event = changes[0];
    expect(event?.document.blocks).toEqual([
      paragraph("paragraph:a", "A"),
      { paragraphId: "paragraph:enter-1", kind: "paragraph", text: "" },
    ]);
    expect(event?.gesture.kind).toBe("split");
    expect(event?.gesture.split).toEqual({
      sourceParagraphId: "paragraph:a",
      newParagraphIds: ["paragraph:enter-1"],
    });
    expect(editor.getDocument()).toEqual(event?.document);
    editor.destroy();
  });
});

describe("clear a field containing separators (text/plain, allowed locally)", () => {
  it("selecting and clearing the whole content leaves the single controlled empty block", () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const editor = createRichTextEditor({
      // Host-segmented from source `"A\n\nB"`: two paragraphs.
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:a", "A"), paragraph("paragraph:b", "B")],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:clear-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.view.dispatch(
      editor.view.state.tr.setSelection(
        TextSelection.create(
          editor.view.state.doc,
          0,
          editor.view.state.doc.content.size,
        ),
      ),
    );
    expect(changes).toHaveLength(0);
    const handled = deleteSelection(
      editor.view.state,
      editor.view.dispatch.bind(editor.view),
    );
    expect(handled).toBe(true);
    // The gesture is allowed: exactly one `onChange` whose document is the
    // single controlled empty block — not dropped, not a placeholder, and
    // not collapsed back to `["A", "B"]`.
    expect(changes).toHaveLength(1);
    const document = changes[0]?.document;
    expect(document?.blocks).toHaveLength(1);
    expect(document?.blocks[0]?.kind).toBe("paragraph");
    expect(document?.blocks[0]?.text).toBe("");
    expect(editor.getDocument()).toEqual(document);
    editor.destroy();
  });
});

describe("select-all delete keeps the first identity (N8)", () => {
  it("AllSelection plus Backspace leaves one empty paragraph keeping the first identity, others retired", () => {
    const changes: RichTextChangeEvent[] = [];
    const allocated: string[] = [];
    // The script allocator would hand `paragraph:b` back first: session
    // retirement must skip it.
    const script = ["paragraph:b", "paragraph:next"];
    let n = 0;
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:a", "A"), paragraph("paragraph:b", "B")],
      },
      messages: MESSAGES,
      allocateId: () => {
        const id = script[n] ?? `paragraph:later-${n}`;
        n += 1;
        allocated.push(id);
        return id;
      },
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)));
    viewDom.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        bubbles: true,
        cancelable: true,
      }),
    );
    // One gesture, one event: the emptied block keeps the first identity
    // with no fresh identity minted for it.
    expect(changes).toHaveLength(1);
    expect(editor.getDocument().blocks).toEqual([
      { paragraphId: "paragraph:a", kind: "paragraph", text: "" },
    ]);
    expect(allocated).toHaveLength(0);
    // The consumed identity is retired inside the session: the next split
    // skips `paragraph:b` even though the allocator offers it first.
    editor.splitParagraph("paragraph:a", 0);
    expect(allocated).toEqual(["paragraph:b", "paragraph:next"]);
    expect(editor.getDocument().blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:a",
      "paragraph:next",
    ]);
    editor.destroy();
    element.remove();
  });

  it("AllSelection plus Backspace on two paragraphs reports the emptied survivor first, in document order", () => {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:a", "A"), paragraph("paragraph:b", "B")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)));
    viewDom.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        bubbles: true,
        cancelable: true,
      }),
    );
    // The document keeps the first identity emptied in place — and the
    // affected list reunites the removed identity with the effectively
    // modified survivor, in document order (N8 regression).
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("delete");
    expect(editor.getDocument().blocks).toEqual([
      { paragraphId: "paragraph:a", kind: "paragraph", text: "" },
    ]);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:b",
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
    element.remove();
  });

  it("AllSelection plus Backspace on three paragraphs reports the survivor then the removed, in document order", () => {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [
          paragraph("paragraph:a", "A"),
          paragraph("paragraph:b", "B"),
          paragraph("paragraph:c", "C"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)));
    viewDom.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("delete");
    expect(editor.getDocument().blocks).toEqual([
      { paragraphId: "paragraph:a", kind: "paragraph", text: "" },
    ]);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:b",
      "paragraph:c",
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
    element.remove();
  });
});
