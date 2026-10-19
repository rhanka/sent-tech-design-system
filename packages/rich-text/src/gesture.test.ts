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
 * RED state (RT-0): the headless editor is a stub, so every case fails with
 * `RT-0 RED: headless editor not implemented` until phase B lands. No case
 * is skipped.
 */
import { describe, it, expect } from "vitest";
import { createHeadlessEditor } from "./editor.js";
import type { HeadlessEditor } from "./editor.js";
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
  editor: HeadlessEditor;
  changes: RichTextChangeEvent[];
} {
  const changes: RichTextChangeEvent[] = [];
  let n = 0;
  const editor = createHeadlessEditor({
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
