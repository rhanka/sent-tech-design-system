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
 * Tiptap entry: `createRichTextEditor` from `./editor.js` builds a real
 * Tiptap `Editor` from the P0 extensions; inert-state and cleared-paragraph
 * assertions run against ProseMirror state. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { TextSelection } from "@tiptap/pm/state";
import { createRichTextEditor } from "./editor.js";
import {
  conversionCounters,
  resetConversionCounters,
} from "./editor-conversion.js";
import type {
  RichTextEditorOptions,
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
  const options: RichTextEditorOptions = {
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
    const editor = createRichTextEditor({ ...options, editable: false });
    editor.typeText("paragraph:1", " intruder");
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("hostile and plain pastes mutate nothing and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createRichTextEditor({ ...options, editable: false });
    editor.paste(HOSTILE_PAYLOAD);
    editor.paste({ text: "plain intruder" });
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });

  it("split, merge, undo and redo mutate nothing and emit no onChange", () => {
    const { options, changes } = collectEvents();
    const before = options.document;
    const editor = createRichTextEditor({ ...options, editable: false });
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
    const editor = createRichTextEditor({ ...options, disabled: true });
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
    const editor = createRichTextEditor({
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
    const viewer = createRichTextEditor({ ...options, editable: false });
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
    const editor = createRichTextEditor(options);
    editor.setEditable(false);
    editor.setDisabled(true);
    editor.setDisabled(false);
    editor.setEditable(true);
    expect(editor.getDocument()).toEqual(before);
    expect(changes).toHaveLength(0);
    editor.destroy();
  });
});

describe("native invalidation through transaction steps and mapping", () => {
  it("a native deletion is exported: the screen text and the document agree", () => {
    const { options, changes } = collectEvents();
    const editor = createRichTextEditor(options);
    // Delete the `l` of `First paragraph` without any helper: a bare
    // ProseMirror delete whose resulting range is empty.
    const view = editor.view;
    // Text offset 2 of `First paragraph` is the `r` of `First`.
    view.dispatch(view.state.tr.delete(3, 4));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("type");
    expect(changes[0]?.document.blocks[0]?.text).toBe("Fist paragraph");
    expect(editor.getDocument().blocks[0]?.text).toBe(
      changes[0]?.document.blocks[0]?.text,
    );
    editor.destroy();
  });

  it("a native mark change invalidates its block (one real serialisation)", () => {
    const { options, changes } = collectEvents();
    const editor = createRichTextEditor(options);
    resetConversionCounters();
    const view = editor.view;
    const bold = view.state.schema.marks["bold"];
    expect(bold).toBeDefined();
    view.dispatch(view.state.tr.addMark(1, 6, bold!.create()));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("type");
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual(["paragraph:1"]);
    // The mark step carries no positional map: without the from/to fallback
    // nothing would serialise and the counter would stay at zero. The bold
    // mark is real content, so the exported text carries it.
    expect(conversionCounters.paragraphSerialize).toBe(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("**First** paragraph");
    editor.destroy();
  });
});

describe("preserved blocks survive user transactions", () => {
  function preservedSetup() {
    const changes: ReturnType<typeof collectEvents>["changes"] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const before: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        paragraph("paragraph:1", "Alpha"),
        {
          paragraphId: "paragraph:kept",
          kind: "preserved",
          raw: "| a | b |",
          preservedKind: "table",
        },
        paragraph("paragraph:2", "Beta"),
      ],
    };
    const editor = createRichTextEditor({
      document: before,
      messages: MESSAGES,
      allocateId: (() => {
        let n = 0;
        return () => `paragraph:guard-${++n}`;
      })(),
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    return {
      editor,
      changes,
      before,
      teardown: () => {
        editor.destroy();
        element.remove();
      },
    };
  }

  it("deleteBlocks over a preserved identity is a silent no-op", () => {
    const { editor, changes, before, teardown } = preservedSetup();
    editor.deleteBlocks(["paragraph:kept"]);
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
    teardown();
  });

  it("select-all followed by delete never removes the preserved block", () => {
    const { editor, changes, before, teardown } = preservedSetup();
    const view = editor.view;
    view.dispatch(view.state.tr.delete(0, view.state.doc.content.size));
    expect(changes).toHaveLength(0);
    const next = editor.getDocument();
    expect(next).toEqual(before);
    expect(
      next.blocks.find((b) => b.paragraphId === "paragraph:kept"),
    ).toEqual(before.blocks[1]);
    teardown();
  });
});

describe("text/plain is literal text (no marks, no Markdown rules)", () => {
  function plainSetup(text: string) {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:1", text)],
      },
      messages: MESSAGES,
      allocateId: (() => {
        let n = 0;
        return () => `paragraph:plain-${++n}`;
      })(),
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    return {
      editor,
      changes,
      viewDom,
      teardown: () => {
        editor.destroy();
        element.remove();
      },
    };
  }

  it("markdown delimiters mount as literal characters, with no mark in the DOM", () => {
    const { editor, viewDom, teardown } = plainSetup("**literal**");
    expect(editor.getDocument().blocks[0]?.text).toBe("**literal**");
    expect(viewDom.innerHTML).not.toContain("<strong>");
    expect(viewDom.innerHTML).not.toContain("<em>");
    teardown();
  });

  it("typing after literal delimiters keeps them literal", () => {
    const { editor, changes, teardown } = plainSetup("**literal**");
    editor.typeText("paragraph:1", "!");
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks[0]?.text).toBe("**literal**!");
    expect(editor.getDocument().blocks[0]?.text).toBe("**literal**!");
    teardown();
  });

  it("an external format change to text/plain switches later input to literal", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "hello")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.applyExternalUpdate({
      format: "text/plain",
      blocks: [paragraph("paragraph:1", "**plain**")],
    });
    expect(editor.getDocument().blocks[0]?.text).toBe("**plain**");
    editor.typeText("paragraph:1", "!");
    expect(editor.getDocument().blocks[0]?.text).toBe("**plain**!");
    editor.destroy();
  });
});

describe("external application re-anchors both selection ends", () => {
  it("a range across two paragraphs survives a clean update with direction and offsets", () => {
    const { options, changes } = collectEvents();
    const editor = createRichTextEditor(options);
    const view = editor.view;
    // Anchor inside paragraph 1 at offset 1, head inside paragraph 2 at
    // offset 2. Paragraph 1 text starts at 1; paragraph 2 text starts at
    // 1 + ("First paragraph".length + 2).
    const secondStart =
      1 + ("First paragraph".length + 2);
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.create(view.state.doc, 1 + 1, secondStart + 2),
      ),
    );
    expect(editor.getSelection()).toEqual({
      anchorParagraphId: "paragraph:1",
      anchorOffset: 1,
      headParagraphId: "paragraph:2",
      headOffset: 2,
    });
    // Clean update changing only paragraph 1 (before the head): rule 4.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [
        paragraph("paragraph:1", "First paragraph edited"),
        paragraph("paragraph:2", "Second paragraph"),
      ],
    });
    expect(changes).toHaveLength(0);
    // Both ends re-anchored by identity with offsets bounded — never
    // collapsed to a cursor.
    expect(editor.getSelection()).toEqual({
      anchorParagraphId: "paragraph:1",
      anchorOffset: 1,
      headParagraphId: "paragraph:2",
      headOffset: 2,
    });
    expect(editor.getDocument().blocks[0]?.text).toBe(
      "First paragraph edited",
    );
    editor.destroy();
  });
});

describe("clearing a paragraph keeps the empty paragraph (never a removal)", () => {
  it("emits one document where the cleared block has text '' under the same identity", () => {
    const { options, changes } = collectEvents();
    const editor = createRichTextEditor(options);
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
