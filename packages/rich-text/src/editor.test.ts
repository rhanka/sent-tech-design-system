/**
 * RED 1 — core half: read-only / disabled states are inert (viewer case).
 * Spec §11 RED 1, §5.4. Environment: J (jsdom shape of vite.config.ts).
 *
 * Observable assertion: with `editable: false`, and separately with
 * `disabled: true`, simulated typing, paste (hostile and plain payloads) and
 * mutation shortcuts produce zero document mutation, zero `onChange` calls
 * and zero save-like callbacks. The viewer case is the named fixture below
 * (`editable: false` labelled as the viewer lock). Assertions read the
 * emitted event log and the resulting `RichTextDocument`.
 *
 * This file also carries the empty-paragraph case (lot follow-up): clearing a
 * paragraph emits a document where that paragraph has `text: ""` under the
 * same identity; it is never a removal.
 *
 * RED state (RT-0): `createHeadlessEditor` is a stub, so every case that
 * mounts the editor fails with `RT-0 RED: headless editor not implemented`
 * until phase B lands. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { createHeadlessEditor } from "./editor.js";
import type {
  HeadlessEditorOptions,
  PastePayload,
} from "./editor.js";
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

function mountDocument(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [paragraph("paragraph:1", "First paragraph"), paragraph("paragraph:2", "Second paragraph")],
  };
}

function collectEvents() {
  const changes: RichTextChangeEvent[] = [];
  const options: HeadlessEditorOptions = {
    document: mountDocument(),
    messages: MESSAGES,
    allocateId: (() => {
      let n = 100;
      return () => `paragraph:alloc-${++n}`;
    })(),
    onChange: (event) => {
      changes.push(event);
    },
  };
  return { options, changes };
}

const HOSTILE_PAYLOAD: PastePayload = {
  html: '<p>Pasted</p><script>alert(1)</script><img src="https://example.invalid/x.png" onerror="alert(1)">',
  text: "Pasted",
};

describe("read-only state (editable: false)", () => {
  it("typing mutates nothing and emits no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor({ ...options, editable: false });
    editor.typeText("paragraph:1", " intruder");
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("hostile and plain pastes mutate nothing and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor({ ...options, editable: false });
    editor.paste(HOSTILE_PAYLOAD);
    editor.paste({ text: "plain intruder" });
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("split, merge, undo and redo mutate nothing and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor({ ...options, editable: false });
    editor.splitParagraph("paragraph:1", 5);
    editor.mergeWithPrevious("paragraph:2");
    editor.deleteBlocks(["paragraph:2"]);
    editor.undo();
    editor.redo();
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });
});

describe("form-disabled state (disabled: true)", () => {
  it("typing, paste and mutation shortcuts mutate nothing and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor({ ...options, disabled: true });
    editor.typeText("paragraph:1", " intruder");
    editor.paste(HOSTILE_PAYLOAD);
    editor.splitParagraph("paragraph:1", 5);
    editor.mergeWithPrevious("paragraph:2");
    editor.undo();
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("disabled wins over an explicit editable: true", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor({
      ...options,
      editable: true,
      disabled: true,
    });
    editor.typeText("paragraph:2", " intruder");
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });
});

describe("viewer lock fixture (editable: false, labelled)", () => {
  it("a viewer paste of a hostile payload leaves the document and the event log untouched", () => {
    // Viewer rendering: the host passes editable={false}; the lock must hold
    // through paste, not only through typing (spec §11 RED 1).
    const { options, changes } = collectEvents();
    const before = options.document;
    const viewer = createHeadlessEditor({ ...options, editable: false });
    viewer.paste(HOSTILE_PAYLOAD);
    viewer.paste({ text: "viewer plain paste" });
    expect(viewer.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    viewer.destroy();
  });
});

describe("state changes emit nothing and alter nothing", () => {
  it("setEditable/setDisabled change no block and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createHeadlessEditor(options);
    editor.setEditable(false);
    editor.setDisabled(true);
    editor.setDisabled(false);
    editor.setEditable(true);
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });
});

describe("clearing a paragraph keeps the empty paragraph (never a removal)", () => {
  it("emits one document where the cleared block has text '' under the same identity", () => {
    const { options, changes } = collectEvents();
    const editor = createHeadlessEditor(options);
    editor.clearParagraph("paragraph:1");
    expect(changes).toHaveLength(1);
    const next = changes[0]?.document;
    expect(next?.blocks).toHaveLength(2);
    expect(next?.blocks[0]).toEqual({
      paragraphId: "paragraph:1",
      kind: "paragraph",
      text: "",
    });
    expect(next?.blocks[1]).toEqual(paragraph("paragraph:2", "Second paragraph"));
    expect(editor.getDocument()).toEqual(next);
    editor.destroy();
  });
});
