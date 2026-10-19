/**
 * RED 3 — surface shape, gesture provenance, and the DS half of the baseline
 * witness. Spec §11 RED 3, §5.3. Environment: J.
 *
 * Freeze-witness ownership: the A → B → R1 → undo → R2 freeze sequence that
 * exercises `freezeReturn` against the retained baseline belongs to h2a lot
 * FE-3 (host adapter) and is witnessed there. This file covers only the DS
 * side: the emitted documents and gesture provenance for the A → B → A
 * sequence (documents `B` then `A`, no DS-computed delta), plus the emitted
 * surface shape. It imports no host-side editing module: `@sentropic/focus`
 * is not on npm at the pinned commit (source-gap), so no DS test or source
 * imports `@sentropic/focus/editing` or any Focus type.
 *
 * Observable assertion: every emitted `RichTextChangeEvent` carries
 * `document` and `gesture` only — no `before`, `after`, `beforeAnchors`,
 * `anchors`, `transactions` or `changes` key exists at any level — and the
 * A → B → A sequence emits documents `B` then `A`, so the host-side
 * cumulative result is decided solely by its own diff against the retained
 * baseline.
 *
 * Tiptap entry: emitted-surface and A → B → A assertions run on the
 * `"./editor"` events; the §5.6 echo/decision sub-assertions are
 * additionally covered as a pure decision table in `document.test.ts`.
 * No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { redo, undo } from "@tiptap/pm/history";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextGestureKind,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

const FORBIDDEN_KEYS = [
  "before",
  "after",
  "beforeAnchors",
  "anchors",
  "transactions",
  "changes",
] as const;

function collectKeys(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, out);
  } else if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      out.add(key);
      collectKeys(nested, out);
    }
  }
  return out;
}

function assertSurfaceShape(event: RichTextChangeEvent): void {
  expect(Object.keys(event).sort()).toEqual(["document", "gesture"]);
  const keys = collectKeys(event);
  for (const forbidden of FORBIDDEN_KEYS) {
    expect(
      keys.has(forbidden),
      `emitted event must not carry a "${forbidden}" key at any level`,
    ).toBe(false);
  }
  expect(typeof event.gesture.gestureId).toBe("string");
  expect(event.gesture.gestureId.length).toBeGreaterThan(0);
  expect(Array.isArray(event.gesture.affectedParagraphIds)).toBe(true);
}

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function setup(textA: string): {
  editor: RichTextEditor;
  changes: RichTextChangeEvent[];
} {
  const changes: RichTextChangeEvent[] = [];
  let n = 0;
  const editor = createRichTextEditor({
    document: {
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:a", textA)],
    },
    messages: MESSAGES,
    allocateId: () => `paragraph:fresh-${++n}`,
    onChange: (event) => {
      changes.push(event);
    },
  });
  return { editor, changes };
}

describe("emitted surface shape (no diff in the DS)", () => {
  const kinds: RichTextGestureKind[] = ["type", "split", "undo", "paste"];

  it.each(kinds)("gesture kind '%s' emits document and gesture only", (kind) => {
    const { editor, changes } = setup(" revision A");
    if (kind === "type") editor.typeText("paragraph:a", " plus B");
    if (kind === "split") editor.splitParagraph("paragraph:a", 4);
    if (kind === "undo") {
      editor.typeText("paragraph:a", " plus B");
      editor.undo();
    }
    if (kind === "paste") editor.paste({ text: "pasted" });
    expect(changes.length).toBeGreaterThan(0);
    for (const event of changes) assertSurfaceShape(event);
    editor.destroy();
  });
});

describe("A → B → A sequence (DS half of the baseline witness)", () => {
  it("emits documents B then A with gesture provenance and no DS-computed delta", () => {
    // DS side only: type to B, undo to A. The host adapter (h2a FE-3) diffs
    // both documents against the retained baseline A; the empty cumulative
    // result and the R1/R2 freeze assertions are witnessed there, not here.
    const { editor, changes } = setup(" revision A");
    editor.typeText("paragraph:a", " plus B");
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks[0]?.text).toBe(" revision A plus B");
    expect(changes[0]?.gesture.kind).toBe("type");
    assertSurfaceShape(changes[0] as RichTextChangeEvent);

    editor.undo();
    expect(changes).toHaveLength(2);
    expect(changes[1]?.document.blocks).toEqual([
      paragraph("paragraph:a", " revision A"),
    ]);
    expect(changes[1]?.gesture.kind).toBe("undo");
    assertSurfaceShape(changes[1] as RichTextChangeEvent);
    editor.destroy();
  });

  it("the echo of B back as controlled value records acknowledgement without replacement", () => {
    // Rule 1 (§5.6): an incoming document equal to the displayed document
    // suppresses replacement and records acknowledgement; it advances no
    // baseline anywhere (the DS retains none).
    const { editor, changes } = setup(" revision A");
    editor.typeText("paragraph:a", " plus B");
    const displayed = editor.getDocument();
    const selectionBefore = editor.getSelection();
    editor.applyExternalUpdate(structuredClone(displayed));
    expect(editor.getDocument()).toEqual(displayed);
    expect(editor.getSelection()).toEqual(selectionBefore);
    // The echo itself emits no change and no conflict.
    expect(changes).toHaveLength(1);
    editor.destroy();
  });
});

describe("native gesture provenance (commands and meta, never type)", () => {
  it("a native split announces split with source and fresh tail", () => {
    const { editor, changes } = setup("Alpha text");
    const view = editor.view;
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 6)),
    );
    expect(changes).toHaveLength(0);
    view.dispatch(view.state.tr.split(6));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("split");
    expect(changes[0]?.gesture.split?.sourceParagraphId).toBe("paragraph:a");
    expect(
      changes[0]?.gesture.split?.newParagraphIds,
    ).toHaveLength(1);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      changes[0]?.gesture.split?.newParagraphIds[0] as string,
    ]);
    assertSurfaceShape(changes[0] as RichTextChangeEvent);
    editor.destroy();
  });

  it("a native join announces merge with survivor and retired", () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [
          paragraph("paragraph:a", "Alpha"),
          paragraph("paragraph:b", "Beta"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:native-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    // Boundary position of the second paragraph.
    let boundary = -1;
    view.state.doc.descendants((node, pos) => {
      if (boundary === -1 && node.type.name === "paragraph" && pos > 0) {
        boundary = pos;
      }
    });
    view.dispatch(view.state.tr.join(boundary));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("merge");
    expect(changes[0]?.gesture.merge).toEqual({
      survivingParagraphId: "paragraph:a",
      retiredParagraphIds: ["paragraph:b"],
    });
    expect(changes[0]?.document.blocks[0]?.text).toBe("AlphaBeta");
    assertSurfaceShape(changes[0] as RichTextChangeEvent);
    editor.destroy();
  });

  it("native history announces undo then redo, each limited to the changed block", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [
          paragraph("paragraph:a", "Alpha"),
          paragraph("paragraph:b", "Beta"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    editor.typeText("paragraph:a", " plus");
    expect(changes).toHaveLength(1);
    expect(undo(view.state, view.dispatch.bind(view))).toBe(true);
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.kind).toBe("undo");
    expect(changes[1]?.gesture.affectedParagraphIds).toEqual(["paragraph:a"]);
    expect(changes[1]?.document.blocks).toEqual([
      paragraph("paragraph:a", "Alpha"),
      paragraph("paragraph:b", "Beta"),
    ]);
    expect(redo(view.state, view.dispatch.bind(view))).toBe(true);
    expect(changes).toHaveLength(3);
    expect(changes[2]?.gesture.kind).toBe("redo");
    expect(changes[2]?.gesture.affectedParagraphIds).toEqual(["paragraph:a"]);
    expect(changes[2]?.document.blocks[0]?.text).toBe("Alpha plus");
    for (const event of changes) assertSurfaceShape(event);
    editor.destroy();
  });
});

describe("undo restores the exact source and agrees with captures", () => {
  it("undo invalidates only the edited block: untouched marker text is byte-exact in event and capture", async () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [
          paragraph("paragraph:a", "Alpha"),
          paragraph("paragraph:b", "_untouched_"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.typeText("paragraph:a", " plus");
    editor.undo();
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.kind).toBe("undo");
    // Only the edited block was invalidated: the untouched marker variant
    // survives byte-identically (no `*untouched*` normalisation).
    expect(changes[1]?.document.blocks).toEqual([
      paragraph("paragraph:a", "Alpha"),
      paragraph("paragraph:b", "_untouched_"),
    ]);
    const captured = await editor.captureDocument();
    expect(captured).toEqual(changes[1]?.document);
    expect(editor.readiness()).toEqual({ composing: false, ready: true });
    editor.destroy();
  });

  it("editing then undoing an emphasis paragraph restores its exact source", async () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:a", "_emphasis_")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.typeText("paragraph:a", "!");
    expect(changes).toHaveLength(1);
    editor.undo();
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.kind).toBe("undo");
    expect(changes[1]?.document.blocks).toEqual([
      paragraph("paragraph:a", "_emphasis_"),
    ]);
    expect(editor.getDocument().blocks).toEqual([
      paragraph("paragraph:a", "_emphasis_"),
    ]);
    editor.destroy();
  });
});

describe("native provenance corrections (R9)", () => {
  function trioSetup() {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [
          paragraph("paragraph:a", "Alpha"),
          paragraph("paragraph:b", "Beta"),
          paragraph("paragraph:c", "Gamma"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:r9-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    return { editor, changes };
  }

  it("deleting a whole block by node selection announces delete, never merge", () => {
    const { editor, changes } = trioSetup();
    const view = editor.view;
    let nodePos = -1;
    view.state.doc.descendants((node, pos) => {
      if (
        nodePos === -1 &&
        node.type.name === "paragraph" &&
        node.attrs["paragraphId"] === "paragraph:b"
      ) {
        nodePos = pos;
      }
      return true;
    });
    expect(nodePos).toBeGreaterThan(-1);
    view.dispatch(
      view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)),
    );
    expect(changes).toHaveLength(0);
    view.dispatch(view.state.tr.deleteSelection());
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("delete");
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual(["paragraph:b"]);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:a", "Alpha"),
      paragraph("paragraph:c", "Gamma"),
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
  });

  it("a native copy followed by a native paste in the same session announces internal", () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:a", "Hello")],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:r9copy-${++n}`,
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    // Native copy of the whole first paragraph through the DOM event.
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 1, 6)),
    );
    const copyEvent = new Event("copy", { bubbles: true, cancelable: true });
    const copyTransfer = {
      data: {} as Record<string, string>,
      setData: function (type: string, value: string): void {
        this.data[type] = value;
      },
      getData: function (type: string): string {
        return this.data[type] ?? "";
      },
      clearData: function (): void {
        this.data = {};
      },
      types: [] as string[],
      effectAllowed: "",
    };
    (copyEvent as unknown as Record<string, unknown>)["clipboardData"] =
      copyTransfer;
    (copyEvent as unknown as Record<string, unknown>)["dataTransfer"] =
      copyTransfer;
    viewDom.dispatchEvent(copyEvent);
    // Paste the copied text at the end through the native clipboard path.
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 6)),
    );
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
    (pasteEvent as unknown as Record<string, unknown>)["clipboardData"] = {
      getData: (type: string): string => (type === "text/plain" ? "Hello" : ""),
      types: ["text/plain"],
    };
    viewDom.dispatchEvent(pasteEvent);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("paste");
    expect(changes[0]?.gesture.paste?.origin).toBe("internal");
    editor.destroy();
    element.remove();
  });

  it("pasting inside a paragraph names the modified block and the created tail", () => {
    const { editor, changes } = setup("Alpha text");
    const view = editor.view;
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 3)),
    );
    expect(changes).toHaveLength(0);
    editor.paste({ text: "XY" });
    expect(changes).toHaveLength(1);
    const inserted = changes[0]?.gesture.paste?.insertedParagraphIds ?? [];
    expect(inserted).toHaveLength(1);
    // Complete affected in final order: modified head, inserted block,
    // created tail — never the inserted identity alone.
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      inserted[0] as string,
      ...(changes[0]?.gesture.affectedParagraphIds ?? []).filter(
        (id) => id !== "paragraph:a" && id !== (inserted[0] as string),
      ),
    ]);
    expect(changes[0]?.gesture.affectedParagraphIds).toHaveLength(3);
    expect(changes[0]?.document.blocks.map((b) => b.text)).toEqual([
      "Al",
      "XY",
      "pha text",
    ]);
    editor.destroy();
  });

  it("one transaction touching B then A reports affected in document order", () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [
          paragraph("paragraph:a", "Alpha"),
          paragraph("paragraph:b", "Beta"),
        ],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:r9order-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    // Steps run B-then-A; the report follows the resulting document.
    view.dispatch(view.state.tr.insertText("1", 12).insertText("2", 6));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:b",
    ]);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:a", "Alpha2"),
      paragraph("paragraph:b", "Beta1"),
    ]);
    editor.destroy();
  });
});

describe("gesture provenance follows identities", () => {
  it("split and merge gestures name the identities they touched, in document order", () => {
    const { editor, changes } = setup("Alpha text");
    editor.splitParagraph("paragraph:a", 5);
    expect(changes[0]?.gesture.split).toEqual({
      sourceParagraphId: "paragraph:a",
      newParagraphIds: ["paragraph:fresh-1"],
    });
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:fresh-1",
    ]);
    editor.mergeWithPrevious("paragraph:fresh-1");
    expect(changes[1]?.gesture.merge).toEqual({
      survivingParagraphId: "paragraph:a",
      retiredParagraphIds: ["paragraph:fresh-1"],
    });
    expect(changes[1]?.gesture.affectedParagraphIds).toEqual(["paragraph:a"]);
    for (const event of changes) assertSurfaceShape(event as RichTextChangeEvent);
    editor.destroy();
  });
});
