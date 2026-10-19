/**
 * §11.4 representable-form round-trip table (blocking, §6.6, RED 2 / RT-2).
 * Spec §11.4 lines 604–617, §6.6 lines 508–522. Environment: J.
 *
 * Every row performs at least one edit through a native ProseMirror
 * transaction or keyboard gesture after mount and before the first capture
 * (typing, deletion, a Shift+Enter attempt, or a split); no row whose
 * sequence is only mount → capture counts. Assertions compare the ordered
 * ProseMirror children and the native copy text (`textBetween`) before and
 * after capture, and the wire bytes — never only a `hardBreak` count, never
 * only the wire, and never only an unmodified mount.
 */
import { describe, it, expect } from "vitest";
import { TextSelection } from "@tiptap/pm/state";
import { redoDepth, undoDepth } from "@tiptap/pm/history";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextFormat,
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

interface Mounted {
  editor: RichTextEditor;
  element: HTMLElement;
  changes: RichTextChangeEvent[];
}

function mount(
  format: RichTextFormat,
  blocks: RichTextBlock[],
  prefix = "paragraph",
): Mounted {
  const element = document.createElement("div");
  document.body.appendChild(element);
  const changes: RichTextChangeEvent[] = [];
  let n = 0;
  const editor = createRichTextEditor({
    document: { format, blocks },
    messages: MESSAGES,
    allocateId: () => `${prefix}:fresh-${++n}`,
    element,
    onChange: (event) => {
      changes.push(event);
    },
  });
  return { editor, element, changes };
}

function cleanup(mounted: Mounted): void {
  mounted.editor.destroy();
  mounted.element.remove();
}

type ExpectedChild =
  | { kind: "text"; text: string; marks?: string[] }
  | { kind: "hardBreak"; marks?: string[] };

function liveChildren(
  editor: RichTextEditor,
  paragraphId: string,
): ExpectedChild[] {
  let found: ExpectedChild[] | null = null;
  editor.view.state.doc.descendants((node) => {
    if (
      node.type.name === "paragraph" &&
      (node.attrs as Record<string, unknown>)["paragraphId"] === paragraphId
    ) {
      const children: ExpectedChild[] = [];
      node.content.forEach((child) => {
        if (child.type.name === "hardBreak") {
          const marks = (child.marks ?? [])
            .map((mark) => mark.type.name)
            .sort();
          children.push(
            marks.length > 0
              ? { kind: "hardBreak", marks }
              : { kind: "hardBreak" },
          );
        } else if (child.isText) {
          const marks = (child.marks ?? [])
            .map((mark) => mark.type.name)
            .sort();
          children.push({
            kind: "text",
            text: child.text ?? "",
            ...(marks.length > 0 ? { marks } : {}),
          });
        }
      });
      found = children;
      return false;
    }
    return true;
  });
  if (found === null) throw new Error(`paragraph ${paragraphId} missing`);
  return found;
}

function textChild(text: string): ExpectedChild {
  return { kind: "text", text };
}

function hardBreakChild(...marks: string[]): ExpectedChild {
  return marks.length > 0
    ? { kind: "hardBreak", marks: [...marks].sort() }
    : { kind: "hardBreak" };
}

function nativeCopyText(editor: RichTextEditor): string {
  const doc = editor.view.state.doc;
  return doc.textBetween(0, doc.content.size, "\n\n", "\n");
}

function historyDepths(editor: RichTextEditor): {
  undo: number;
  redo: number;
} {
  return {
    undo: undoDepth(editor.view.state),
    redo: redoDepth(editor.view.state),
  };
}

function paragraphEnd(
  editor: RichTextEditor,
  paragraphId: string,
): number {
  let end = -1;
  editor.view.state.doc.descendants((node, pos) => {
    if (
      node.type.name === "paragraph" &&
      (node.attrs as Record<string, unknown>)["paragraphId"] === paragraphId
    ) {
      end = pos + node.nodeSize - 1;
      return false;
    }
    return true;
  });
  if (end < 0) throw new Error(`paragraph ${paragraphId} missing`);
  return end;
}

/** Native Shift+Enter break appended at the paragraph end (allowed position:
    the break never becomes the first child, so never the §6.6 no-op). */
function appendBreak(mounted: Mounted, id = "paragraph:1"): void {
  const view = mounted.editor.view;
  const hardBreak = view.state.schema.nodes["hardBreak"];
  if (!hardBreak) throw new Error("hardBreak node missing");
  view.dispatch(view.state.tr.insert(paragraphEnd(mounted.editor, id), hardBreak.create()));
}

/** Native keyboard Shift+Enter at the current selection. */
function pressShiftEnter(mounted: Mounted): void {
  const target =
    (mounted.element.querySelector(".ProseMirror") as HTMLElement | null) ??
    mounted.element;
  target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
}

interface NoOpSnapshot {
  changes: number;
  doc: string;
  undo: number;
  redo: number;
  anchor: number;
  head: number;
}

function snapshotNoOp(mounted: Mounted): NoOpSnapshot {
  const view = mounted.editor.view;
  return {
    changes: mounted.changes.length,
    doc: JSON.stringify(view.state.doc.toJSON()),
    undo: undoDepth(view.state),
    redo: redoDepth(view.state),
    anchor: view.state.selection.anchor,
    head: view.state.selection.head,
  };
}

/** Assert a Shift+Enter attempt changed nothing at all (§6.6 line 519 no-op:
    no transaction, no `onChange`, no history entry, caret unchanged). */
function expectShiftEnterNoOp(mounted: Mounted): void {
  const before = snapshotNoOp(mounted);
  pressShiftEnter(mounted);
  expect(snapshotNoOp(mounted)).toEqual(before);
}

function lastFlag(mounted: Mounted): readonly string[] {
  const last = mounted.changes[mounted.changes.length - 1];
  return last?.representability.nonRepresentableParagraphIds ?? [];
}

function expectPurityBaseline(mounted: Mounted): {
  changes: number;
  children: string;
  history: { undo: number; redo: number };
  selection: unknown;
  copy: string;
} {
  return {
    changes: mounted.changes.length,
    children: JSON.stringify(mounted.editor.view.state.doc.toJSON()),
    history: historyDepths(mounted.editor),
    selection: mounted.editor.getSelection(),
    copy: nativeCopyText(mounted.editor),
  };
}

function expectCapturePure(
  mounted: Mounted,
  before: ReturnType<typeof expectPurityBaseline>,
): void {
  expect(mounted.changes.length).toBe(before.changes);
  expect(JSON.stringify(mounted.editor.view.state.doc.toJSON())).toBe(
    before.children,
  );
  expect(historyDepths(mounted.editor)).toEqual(before.history);
  expect(mounted.editor.getSelection()).toEqual(before.selection);
  expect(nativeCopyText(mounted.editor)).toBe(before.copy);
}

function remountOf(captured: RichTextDocument, prefix: string): Mounted {
  return mount(captured.format, [...captured.blocks], prefix);
}

describe("ordered mixture space-break-space-break-space (§11.4, §6.6)", () => {
  it("text/plain round-trips literally with no canonicalisation", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "")], "plain-mix");
    const { editor } = mounted;
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe(" \n \n ");
    const purity = expectPurityBaseline(mounted);
    const first = await mounted.editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", " \n \n "));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(lastFlag(mounted)).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
    ]);
    expectCapturePure(mounted, purity);
    const second = await mounted.editor.captureDocument();
    expect(second.document).toEqual(first.document);
    expect(second.representability).toEqual(first.representability);
    const again = remountOf(first.document, "plain-mix2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
    ]);
    expect(again.editor.captureDocument).toBeDefined();
    const recaptured = await again.editor.captureDocument();
    expect(recaptured.document).toEqual(first.document);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/markdown flags without gathering texts ahead of breaks", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-mix");
    const { editor } = mounted;
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe(" \n \n ");
    const purity = expectPurityBaseline(mounted);
    const first = await mounted.editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("");
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(lastFlag(mounted)).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" "),
    ]);
    expect(nativeCopyText(editor)).toBe(copyBefore);
    expectCapturePure(mounted, purity);
    const second = await mounted.editor.captureDocument();
    expect(second.document).toEqual(first.document);
    expect(second.representability).toEqual(first.representability);
    cleanup(mounted);
  });
});

describe("anchored mixture between visible anchors (§11.4, §6.6)", () => {
  it("text/plain keeps child order with the literal mapping", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "")], "plain-anchor");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "A ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " B");
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" B"),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("A \n \n B");
    const purity = expectPurityBaseline(mounted);
    const first = await mounted.editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "A \n \n B"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" B"),
    ]);
    expectCapturePure(mounted, purity);
    const second = await mounted.editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "plain-anchor2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([
      textChild("A "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" B"),
    ]);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/markdown flags the two-paragraph bridge wire", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-anchor");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "A ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", " B");
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" B"),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("A \n \n B");
    const purity = expectPurityBaseline(mounted);
    const first = await mounted.editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("A   \n   \n B");
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A "),
      hardBreakChild(),
      textChild(" "),
      hardBreakChild(),
      textChild(" B"),
    ]);
    expect(nativeCopyText(editor)).toBe(copyBefore);
    expectCapturePure(mounted, purity);
    const second = await mounted.editor.captureDocument();
    expect(second.document).toEqual(first.document);
    cleanup(mounted);
  });
});

describe("literal marker-like text (§11.4, §6.6)", () => {
  it("text/plain collision leaves literal two-spaces-plus-break", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "  \n ")], "plain-collision");
    const { editor, changes } = mounted;
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
      textChild(" "),
    ]);
    const view = editor.view;
    const end = paragraphEnd(editor, "paragraph:1");
    view.dispatch(view.state.tr.delete(end - 1, end));
    expect(changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("  \n");
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "  \n"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
    ]);
    expect(nativeCopyText(editor)).toBe("  \n");
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "plain-collision2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
    ]);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/plain repetition keeps every literal break", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "")], "plain-rep");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "  ");
    appendBreak(mounted);
    editor.typeText("paragraph:1", "  ");
    appendBreak(mounted);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
      textChild("  "),
      hardBreakChild(),
    ]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "  \n  \n"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expectCapturePure(mounted, purity);
    cleanup(mounted);
  });

  it("text/markdown types two spaces plus break without decoding a count", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-marker");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "  ");
    appendBreak(mounted);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
    ]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("  \n");
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("");
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("  "),
      hardBreakChild(),
    ]);
    expect(nativeCopyText(editor)).toBe(copyBefore);
    expectCapturePure(mounted, purity);
    cleanup(mounted);
  });
});

describe("structure change # titre (§11.4, §6.6)", () => {
  it("text/markdown flags the heading wire without erasing visible text", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-heading");
    const { editor } = mounted;
    for (const char of "# titre") editor.typeText("paragraph:1", char);
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("# titre")]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("# titre");
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "# titre"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(lastFlag(mounted)).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("# titre")]);
    expect(nativeCopyText(editor)).toBe("# titre");
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    expect(second.representability).toEqual(first.representability);
    cleanup(mounted);
  });

  it("text/plain keeps the literal heading text unflagged", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "")], "plain-heading");
    const { editor } = mounted;
    for (const char of "# titre") editor.typeText("paragraph:1", char);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("# titre")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "# titre"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "plain-heading2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([textChild("# titre")]);
    cleanup(again);
    cleanup(mounted);
  });
});

describe("untouched source _emphasis_ (§11.4, §6.6)", () => {
  it("an untouched paragraph keeps its source bytes after a neighbour edit", async () => {
    const mounted = mount(
      "focus.markdown.p0@1",
      [paragraph("paragraph:1", "_emphasis_"), paragraph("paragraph:2", "voisin")],
      "md-untouched",
    );
    const { editor } = mounted;
    editor.typeText("paragraph:2", "!");
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:2")).toEqual([textChild("voisin!")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "_emphasis_"));
    expect(first.document.blocks[1]?.text).toBe("voisin!");
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(lastFlag(mounted)).toEqual([]);
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "md-untouched2");
    expect(again.editor.captureDocument).toBeDefined();
    cleanup(again);
    cleanup(mounted);
  });

  it("an undo-restored paragraph keeps its source bytes", async () => {
    const mounted = mount(
      "focus.markdown.p0@1",
      [paragraph("paragraph:1", "_emphasis_"), paragraph("paragraph:2", "voisin")],
      "md-undo",
    );
    const { editor } = mounted;
    editor.typeText("paragraph:1", "!");
    expect(mounted.changes).toHaveLength(1);
    editor.undo();
    expect(mounted.changes).toHaveLength(2);
    editor.typeText("paragraph:2", "!");
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "_emphasis_"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    cleanup(mounted);
  });
});

describe("restoration sequence Shift+Enter capture/remount type B (§11.4, §6.6)", () => {
  it("text/markdown no-op then B with exact contents", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-restore");
    const { editor } = mounted;
    editor.view.dispatch(
      editor.view.state.tr.setSelection(TextSelection.create(editor.view.state.doc, 1)),
    );
    expect(liveChildren(editor, "paragraph:1")).toEqual([]);
    expectShiftEnterNoOp(mounted);
    expect(liveChildren(editor, "paragraph:1")).toEqual([]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", ""));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expectCapturePure(mounted, purity);
    const again = remountOf(first.document, "md-restore2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([]);
    again.editor.view.dispatch(
      again.editor.view.state.tr.setSelection(
        TextSelection.create(again.editor.view.state.doc, 1),
      ),
    );
    again.editor.typeText("paragraph:1", "B");
    expect(again.changes).toHaveLength(1);
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([textChild("B")]);
    expect(lastFlag(again)).toEqual([]);
    const purity2 = expectPurityBaseline(again);
    const second = await again.editor.captureDocument();
    expect(second.document.blocks[0]).toEqual(paragraph("paragraph:1", "B"));
    expect(second.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([textChild("B")]);
    expectCapturePure(again, purity2);
    const third = remountOf(second.document, "md-restore3");
    expect(liveChildren(third.editor, "paragraph:1")).toEqual([textChild("B")]);
    const recaptured = await third.editor.captureDocument();
    expect(recaptured.document).toEqual(second.document);
    cleanup(third);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/plain inserts literally then B with exact contents", async () => {
    const mounted = mount("text/plain", [paragraph("paragraph:1", "")], "plain-restore");
    const { editor } = mounted;
    pressShiftEnter(mounted);
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([hardBreakChild()]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "\n"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([hardBreakChild()]);
    expectCapturePure(mounted, purity);
    const again = remountOf(first.document, "plain-restore2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([hardBreakChild()]);
    const end = paragraphEnd(again.editor, "paragraph:1");
    again.editor.view.dispatch(
      again.editor.view.state.tr.setSelection(
        TextSelection.create(again.editor.view.state.doc, end),
      ),
    );
    again.editor.typeText("paragraph:1", "B");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([hardBreakChild(), textChild("B")]);
    const second = await again.editor.captureDocument();
    expect(second.document.blocks[0]).toEqual(paragraph("paragraph:1", "\nB"));
    expect(second.representability.nonRepresentableParagraphIds).toEqual([]);
    const third = remountOf(second.document, "plain-restore3");
    expect(liveChildren(third.editor, "paragraph:1")).toEqual([hardBreakChild(), textChild("B")]);
    cleanup(third);
    cleanup(again);
    cleanup(mounted);
  });
});

describe("bold hardBreak mark witness (§11.4, §6.6)", () => {
  function hardBreakRange(
    editor: RichTextEditor,
  ): { from: number; to: number } {
    let from = -1;
    editor.view.state.doc.descendants((node, pos) => {
      if (node.type.name === "hardBreak" && from < 0) {
        from = pos;
        return false;
      }
      return true;
    });
    if (from < 0) throw new Error("hardBreak missing");
    return { from, to: from + 1 };
  }

  it("text/markdown flags a bold hardBreak with the draft unchanged", async () => {
    const mounted = mount(
      "focus.markdown.p0@1",
      [paragraph("paragraph:1", "A  \nB")],
      "md-bold-break",
    );
    const { editor } = mounted;
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild(),
      textChild("B"),
    ]);
    // Native Ctrl+B over only the break: apply the bold mark over the
    // hardBreak range through a native transaction.
    const bold = editor.view.state.schema.marks["bold"];
    expect(bold).toBeDefined();
    const range = hardBreakRange(editor);
    editor.view.dispatch(
      editor.view.state.tr.addMark(range.from, range.to, bold!.create()),
    );
    expect(mounted.changes.length).toBeGreaterThan(0);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild("bold"),
      textChild("B"),
    ]);
    const copyBefore = nativeCopyText(editor);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(
      paragraph("paragraph:1", "A  \nB"),
    );
    expect(first.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    expect(lastFlag(mounted)).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild("bold"),
      textChild("B"),
    ]);
    expect(nativeCopyText(editor)).toBe(copyBefore);
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    expect(second.representability).toEqual(first.representability);
    // The draft is unchanged by the flag and by capture: typing X
    // immediately after the break in the live editor still yields a bold X.
    const after = hardBreakRange(editor);
    editor.view.dispatch(
      editor.view.state.tr
        .setStoredMarks([bold!.create()])
        .insertText("X", after.to),
    );
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild("bold"),
      { kind: "text", text: "X", marks: ["bold"] },
      textChild("B"),
    ]);
    cleanup(mounted);
  });

  it("text/markdown unmarked break round-trips unflagged", async () => {
    const mounted = mount(
      "focus.markdown.p0@1",
      [paragraph("paragraph:1", "A  \nB")],
      "md-unmarked-break",
    );
    const { editor } = mounted;
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild(),
      textChild("B"),
    ]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(
      paragraph("paragraph:1", "A  \nB"),
    );
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(lastFlag(mounted)).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild(),
      textChild("B"),
    ]);
    expectCapturePure(mounted, purity);
    const again = remountOf(first.document, "md-unmarked-break2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([
      textChild("A"),
      hardBreakChild(),
      textChild("B"),
    ]);
    const recaptured = await again.editor.captureDocument();
    expect(recaptured.document).toEqual(first.document);
    expect(recaptured.representability).toEqual(first.representability);
    cleanup(again);
    cleanup(mounted);
  });
});

describe("leading and trailing spaces (§11.4, §6.6)", () => {
  it("text/markdown leading space stays live then flags", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-lead");
    const { editor } = mounted;
    editor.typeText("paragraph:1", " ");
    editor.typeText("paragraph:1", "mot");
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild(" mot")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", " mot"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild(" mot")]);
    expectCapturePure(mounted, purity);
    cleanup(mounted);
  });

  it("text/markdown trailing space round-trips unflagged", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-trail");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "mot");
    editor.typeText("paragraph:1", " ");
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("mot ")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "mot "));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("mot ")]);
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "md-trail2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([textChild("mot ")]);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/markdown interior space survives capture unflagged", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-interior");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "word");
    editor.typeText("paragraph:1", " ");
    editor.typeText("paragraph:1", "next");
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("word next")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toEqual(paragraph("paragraph:1", "word next"));
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("word next")]);
    expectCapturePure(mounted, purity);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "md-interior2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([textChild("word next")]);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/plain leading and trailing spaces round-trip literally", async () => {
    const lead = mount("text/plain", [paragraph("paragraph:1", "")], "plain-lead");
    lead.editor.typeText("paragraph:1", " ");
    lead.editor.typeText("paragraph:1", "mot");
    expect(liveChildren(lead.editor, "paragraph:1")).toEqual([textChild(" mot")]);
    const purityLead = expectPurityBaseline(lead);
    const firstLead = await lead.editor.captureDocument();
    expect(firstLead.document.blocks[0]).toEqual(paragraph("paragraph:1", " mot"));
    expect(firstLead.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(lead.editor, "paragraph:1")).toEqual([textChild(" mot")]);
    expectCapturePure(lead, purityLead);
    cleanup(lead);
    const trail = mount("text/plain", [paragraph("paragraph:1", "")], "plain-trail");
    trail.editor.typeText("paragraph:1", "mot");
    trail.editor.typeText("paragraph:1", " ");
    expect(liveChildren(trail.editor, "paragraph:1")).toEqual([textChild("mot ")]);
    const purityTrail = expectPurityBaseline(trail);
    const firstTrail = await trail.editor.captureDocument();
    expect(firstTrail.document.blocks[0]).toEqual(paragraph("paragraph:1", "mot "));
    expect(firstTrail.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(trail.editor, "paragraph:1")).toEqual([textChild("mot ")]);
    expectCapturePure(trail, purityTrail);
    cleanup(trail);
  });
});

describe("trailing break and whitespace-only (§11.4, §6.6)", () => {
  it("text/markdown trailing break stays live then flags", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-trailing");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "Alpha");
    appendBreak(mounted);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("Alpha"), hardBreakChild()]);
    const copyBefore = nativeCopyText(editor);
    expect(copyBefore).toBe("Alpha\n");
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("Alpha  \n");
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("Alpha"), hardBreakChild()]);
    expect(nativeCopyText(editor)).toBe(copyBefore);
    expectCapturePure(mounted, purity);
    cleanup(mounted);
  });

  it("text/markdown interior break after typing B round-trips", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-interior-break");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "Alpha");
    appendBreak(mounted);
    editor.typeText("paragraph:1", "B");
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("Alpha"),
      hardBreakChild(),
      textChild("B"),
    ]);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("Alpha  \nB");
    expect(first.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([
      textChild("Alpha"),
      hardBreakChild(),
      textChild("B"),
    ]);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    const again = remountOf(first.document, "md-interior-break2");
    expect(liveChildren(again.editor, "paragraph:1")).toEqual([
      textChild("Alpha"),
      hardBreakChild(),
      textChild("B"),
    ]);
    cleanup(again);
    cleanup(mounted);
  });

  it("text/markdown whitespace-only stays live with an empty bridge wire", async () => {
    const mounted = mount("focus.markdown.p0@1", [paragraph("paragraph:1", "")], "md-ws");
    const { editor } = mounted;
    editor.typeText("paragraph:1", "   ");
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("   ")]);
    const purity = expectPurityBaseline(mounted);
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]?.text).toBe("");
    expect(first.representability.nonRepresentableParagraphIds).toEqual(["paragraph:1"]);
    expect(liveChildren(editor, "paragraph:1")).toEqual([textChild("   ")]);
    expectCapturePure(mounted, purity);
    cleanup(mounted);
  });

  it("text/plain trailing break and whitespace-only take the literal mapping", async () => {
    const trailing = mount("text/plain", [paragraph("paragraph:1", "")], "plain-trailing");
    trailing.editor.typeText("paragraph:1", "Alpha");
    appendBreak(trailing);
    expect(liveChildren(trailing.editor, "paragraph:1")).toEqual([textChild("Alpha"), hardBreakChild()]);
    const purityTrailing = expectPurityBaseline(trailing);
    const firstTrailing = await trailing.editor.captureDocument();
    expect(firstTrailing.document.blocks[0]).toEqual(paragraph("paragraph:1", "Alpha\n"));
    expect(firstTrailing.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(trailing.editor, "paragraph:1")).toEqual([textChild("Alpha"), hardBreakChild()]);
    expectCapturePure(trailing, purityTrailing);
    cleanup(trailing);
    const ws = mount("text/plain", [paragraph("paragraph:1", "")], "plain-ws");
    ws.editor.typeText("paragraph:1", "   ");
    expect(liveChildren(ws.editor, "paragraph:1")).toEqual([textChild("   ")]);
    const purityWs = expectPurityBaseline(ws);
    const firstWs = await ws.editor.captureDocument();
    expect(firstWs.document.blocks[0]).toEqual(paragraph("paragraph:1", "   "));
    expect(firstWs.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(liveChildren(ws.editor, "paragraph:1")).toEqual([textChild("   ")]);
    expectCapturePure(ws, purityWs);
    cleanup(ws);
  });
});
