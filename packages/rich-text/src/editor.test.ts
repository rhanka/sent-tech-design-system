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
import type { EditorView } from "@tiptap/pm/view";
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

  it("a multi-step native transaction projects every step range to the final document (R1)", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:a", "Alpha"), paragraph("paragraph:b", "Beta")],
      },
      messages: MESSAGES,
      allocateId: (() => {
        let n = 100;
        return () => `paragraph:alloc-${++n}`;
      })(),
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    // Two steps in one native transaction: `!` inside B, then 30 Xs at the
    // start of A (shifting B by 30). The first step range must travel
    // through the second step map before invalidation.
    view.dispatch(
      view.state.tr.insertText("!", 9).insertText("X".repeat(30), 1),
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toEqual([
      { paragraphId: "paragraph:a", kind: "paragraph", text: `${"X".repeat(30)}Alpha` },
      { paragraphId: "paragraph:b", kind: "paragraph", text: "B!eta" },
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual([
      "paragraph:a",
      "paragraph:b",
    ]);
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

describe("deleteBlocks deduplicates repeated identities and ranges (R6)", () => {
  it("deleting the same identity twice removes only that block, once", () => {
    const changes: RichTextChangeEvent[] = [];
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
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    editor.deleteBlocks(["paragraph:a", "paragraph:a"]);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("delete");
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual(["paragraph:a"]);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:b", "Beta"),
      paragraph("paragraph:c", "Gamma"),
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
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

  it("a native Shift+Enter hardBreak survives as an interior newline (R4)", () => {
    const changes: RichTextChangeEvent[] = [];
    const conflicts: { incoming: RichTextDocument }[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:1", "Alpha")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event);
      },
    });
    const view = editor.view;
    const hardBreak = view.state.schema.nodes["hardBreak"];
    expect(hardBreak).toBeDefined();
    // Native Shift+Enter inside `Al|pha`: one paragraph, one hardBreak.
    view.dispatch(view.state.tr.insert(3, hardBreak!.create()));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toHaveLength(1);
    expect(changes[0]?.document.blocks[0]?.text).toBe("Al\npha");
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    // The draft carries the break, so an external replacement now
    // conflicts instead of silently overwriting the draft.
    editor.applyExternalUpdate({
      format: "text/plain",
      blocks: [paragraph("paragraph:1", "Remote")],
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.local.blocks[0]?.text).toBe("Al\npha");
    expect(editor.getDocument().blocks[0]?.text).toBe("Al\npha");
    editor.destroy();
    element.remove();
  });

  it("a plain paragraph carrying an interior newline mounts with its hardBreak (R4)", () => {
    const { editor, teardown } = plainSetup("A\nB");
    expect(editor.getDocument().blocks[0]?.text).toBe("A\nB");
    let found = false;
    editor.view.state.doc.descendants((node) => {
      if (node.type.name === "hardBreak") found = true;
      return true;
    });
    expect(found).toBe(true);
    teardown();
  });

  it("an external format change to Markdown keeps incoming marks (R5)", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:1", "hello")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    // The incoming format is effective for the plugins before the replace
    // transaction: the bold mark survives the dispatch instead of being
    // stripped by the stale plain-text guard.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "**bold**")],
    });
    expect(editor.getDocument().format).toBe("focus.markdown.p0@1");
    expect(editor.getDocument().blocks[0]?.text).toBe("**bold**");
    editor.typeText("paragraph:1", "!");
    // Native stored marks extend the bold run: the point is the incoming
    // mark survived the format switch (a stale plain guard would export
    // `bold!` with no marks at all).
    expect(editor.getDocument().blocks[0]?.text).toBe("**bold!**");
    expect(changes).toHaveLength(1);
    editor.destroy();
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

describe("trailing Markdown hardBreak is flagged with the live draft preserved (§6.6)", () => {
  it("capture keeps the bridge wire and flags without mutating", async () => {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "Alpha")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const hardBreak = view.state.schema.nodes["hardBreak"];
    expect(hardBreak).toBeDefined();
    // Native Shift+Enter at the end of `Alpha`: one paragraph, one
    // trailing hardBreak. The event and the capture carry the bridge wire
    // `"Alpha  \n"` with the paragraph flagged; the live draft stays
    // `[text("Alpha"), hardBreak]` and capture mutates nothing.
    view.dispatch(view.state.tr.insert(6, hardBreak!.create()));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", "Alpha  \n"),
    ]);
    expect(changes[0]?.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    const first = await editor.captureDocument();
    expect(first.document).toEqual(changes[0]?.document);
    expect(first.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    let liveBreaks = 0;
    editor.view.state.doc.descendants((node) => {
      if (node.type.name === "hardBreak") liveBreaks += 1;
      return true;
    });
    expect(liveBreaks).toBe(1);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(first.document);
    editor.destroy();
    element.remove();
    // Remounting the flagged wire follows the bridge parse (the trailing
    // break is lost there): no remount equality is asserted for flagged rows.
    const remountedElement = document.createElement("div");
    document.body.appendChild(remountedElement);
    const remounted = createRichTextEditor({
      document: first.document,
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element: remountedElement,
    });
    let remountedBreaks = 0;
    remounted.view.state.doc.descendants((node) => {
      if (node.type.name === "hardBreak") remountedBreaks += 1;
      return true;
    });
    expect(remountedBreaks).toBe(0);
    remounted.destroy();
    remountedElement.remove();
  });
});

describe("break-only Markdown paragraph is flagged with the live draft preserved (§6.6)", () => {
  function countHardBreaks(view: EditorView): number {
    let count = 0;
    view.state.doc.descendants((node) => {
      if (node.type.name === "hardBreak") count += 1;
      return true;
    });
    return count;
  }

  it("an empty Markdown paragraph plus a native break flags with an empty wire", async () => {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const hardBreak = view.state.schema.nodes["hardBreak"];
    expect(hardBreak).toBeDefined();
    // Direct native insertion in the empty paragraph (not the Shift+Enter
    // key, so not the §6.6 no-op): the live document holds a lone
    // `hardBreak`, the event and the capture carry the bridge wire `""`
    // with the paragraph flagged, and the live draft is preserved.
    view.dispatch(view.state.tr.insert(1, hardBreak!.create()));
    expect(countHardBreaks(view)).toBe(1);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", ""),
    ]);
    expect(changes[0]?.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    const first = await editor.captureDocument();
    expect(first.document).toEqual(changes[0]?.document);
    expect(first.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    expect(countHardBreaks(view)).toBe(1);
    editor.destroy();
    element.remove();
  });

  it("Alpha plus break then a native deletion of Alpha flags with an empty wire", async () => {
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "Alpha")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const view = editor.view;
    const hardBreak = view.state.schema.nodes["hardBreak"];
    expect(hardBreak).toBeDefined();
    view.dispatch(view.state.tr.insert(6, hardBreak!.create()));
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", "Alpha  \n"),
    ]);
    // Native deletion of `Alpha` (positions 1..6): the live paragraph holds
    // only the trailing break, flagged with the bridge wire `""`.
    view.dispatch(view.state.tr.delete(1, 6));
    expect(countHardBreaks(view)).toBe(1);
    expect(changes).toHaveLength(2);
    expect(changes[1]?.document.blocks).toEqual([
      paragraph("paragraph:1", ""),
    ]);
    expect(changes[1]?.representability.nonRepresentableParagraphIds).toEqual([
      "paragraph:1",
    ]);
    const first = await editor.captureDocument();
    expect(first.document).toEqual(changes[1]?.document);
    expect(countHardBreaks(view)).toBe(1);
    editor.destroy();
    element.remove();
  });
});

describe("serialisation-equal divergence stays a conflict (§5.6 revision flag)", () => {
  it("three spaces then an external C conflicts instead of overwriting", async () => {
    const changes: RichTextChangeEvent[] = [];
    const conflicts: { incoming: RichTextDocument; local: RichTextDocument }[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "")],
      },
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      element,
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event);
      },
    });
    // Three spaces with no host echo: the live content is `[text("   ")]`
    // while the bridge serialises it to `""` (§6.6 whitespace-only row), so
    // the displayed wire still equals the acknowledged wire — yet the typing
    // transaction set the §5.6 revision flag and the paragraph is flagged.
    editor.typeText("paragraph:1", "   ");
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks[0]?.text).toBe("");
    expect(
      changes[0]?.representability.nonRepresentableParagraphIds,
    ).toEqual(["paragraph:1"]);
    // An external `C` now evaluates under rule 3, not rule 4: the draft is
    // kept live, exactly one conflict fires, and `C` is not applied.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "C")],
    });
    expect(conflicts).toHaveLength(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("");
    // A rule-1 echo of the displayed revision clears the flag; the next
    // external update is then evaluated on the cleared state and applies.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "")],
    });
    expect(conflicts).toHaveLength(1);
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "C")],
    });
    expect(conflicts).toHaveLength(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("C");
    editor.destroy();
    element.remove();
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
