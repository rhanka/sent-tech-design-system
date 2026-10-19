/**
 * RED 7 — core paste pipeline half: hostile paste is inert; an image kept
 * from an otherwise accepted paste degrades to its alt text; a paste that
 * would create a non-paragraph block is refused whole. Spec §11 RED 7, §7.
 * Environment: J.
 *
 * Every case below exercises the native clipboard path: a `paste` event
 * carrying a `DataTransfer`-shaped `clipboardData` is dispatched on the live
 * ProseMirror view DOM, so the ProseMirror paste pipeline (`handlePaste`
 * over `transformPastedHTML` / the clipboard parser) applies the shared
 * policy before insertion. A case calling only the `paste()` convenience
 * method would not count — except the single internal-origin case, whose
 * origin bit requires the exact payload object.
 *
 * Observable assertions:
 * - Hostile payloads (`</script><script>`, `onerror` attributes,
 *   `javascript:` links, remote `<img>`, raw HTML): the resulting document
 *   and DOM contain no `script` element, no event-handler attribute, no link
 *   attribute and no `img`; scriptable content is dropped or present only as
 *   inert text.
 * - Image with `alt` inside an otherwise accepted paste: the `alt` text is
 *   inserted as plain text, `onUnsupportedPaste` reports the dropped image
 *   once, and `onChange` fires exactly once.
 * - Non-paragraph paste refusal (DS side only): each payload that would
 *   create a non-paragraph block — (a) `text/plain` carrying a Markdown
 *   table, (b) `text/plain` carrying a fenced code block, (c) `text/html`
 *   carrying a `<table>` element, (d) `text/plain` carrying a heading or a
 *   list — produces exactly one `onUnsupportedPaste` with the expected
 *   `rejectedKinds` (refusal reported), zero `onChange` calls, a resulting
 *   `RichTextDocument` deep-equal to the pre-paste document (all significant
 *   fields, §5.6 equality; document unchanged), and the selection unchanged.
 *   This test imports no `@sentropic/focus` module and computes no diff or
 *   return; the host-side consequence of the same refusal is the FE-3
 *   witness (§13.1). Creating a preserved block from the paste, or
 *   flattening the payload into paragraphs, fails the test.
 *   Paragraph-only paste still inserts with fresh identities (RED 3).
 * - Multi-paragraph copy keeps block boundaries: copying two paragraphs and
 *   pasting through the native path inserts two paragraphs, not one joined
 *   block.
 * - A paste spanning a preserved block is refused whole with the block
 *   intact (§6.3).
 *
 * DOM-level assertions (no `script` element, no handler attribute, no `img`
 * in the rendered tree) and the destructive-gesture span half belong to the
 * component suite (RT-1 `RichTextEditor.test.ts` / browser suite); this file
 * asserts the core pipeline at the `RichTextDocument` level.
 *
 * Tiptap entry: refusal/inert assertions exercise the ProseMirror clipboard
 * path through `createRichTextEditor` from `./editor.js`. No case is
 * skipped.
 */
import { describe, it, expect } from "vitest";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { Fragment, Slice } from "@tiptap/pm/model";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextUnsupportedPasteEvent,
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

function setup() {
  const changes: RichTextChangeEvent[] = [];
  const unsupported: RichTextUnsupportedPasteEvent[] = [];
  let n = 0;
  const element = document.createElement("div");
  document.body.appendChild(element);
  const initial: RichTextDocument = {
    format: "focus.markdown.p0@1",
    blocks: [paragraph("paragraph:1", "Alpha"), paragraph("paragraph:2", "Beta")],
  };
  const editor: RichTextEditor = createRichTextEditor({
    document: initial,
    messages: MESSAGES,
    allocateId: () => `paragraph:paste-${++n}`,
    element,
    onChange: (event) => {
      changes.push(event);
    },
    onUnsupportedPaste: (event) => {
      unsupported.push(event);
    },
  });
  const viewDom =
    (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
  const teardown = (): void => {
    editor.destroy();
    element.remove();
  };
  return { editor, changes, unsupported, initial, viewDom, teardown };
}

/** Dispatch a native `paste` event with clipboard payloads on the view DOM,
    through the real ProseMirror paste pipeline. */
function dispatchNativePaste(
  viewDom: HTMLElement,
  payload: { text?: string; html?: string },
): void {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  const data: Record<string, string> = {};
  if (payload.text !== undefined) data["text/plain"] = payload.text;
  if (payload.html !== undefined) data["text/html"] = payload.html;
  (event as unknown as Record<string, unknown>)["clipboardData"] = {
    getData: (type: string): string => data[type] ?? "",
    types: Object.keys(data),
  };
  viewDom.dispatchEvent(event);
}

function documentText(document: RichTextDocument): string {
  return document.blocks.map((b) => b.text ?? b.raw ?? "").join("\n");
}

/** Dispatch a real `copy` event on the view DOM: the ProseMirror handler
    serialises the live selection into the returned transfer (exact text
    plus native `data-pm-slice` HTML, preserved markers included). */
function captureNativeCopy(viewDom: HTMLElement): Record<string, string> {
  const copyEvent = new Event("copy", { bubbles: true, cancelable: true });
  const captured: Record<string, string> = {};
  const copyTransfer = {
    setData: (type: string, value: string): void => {
      captured[type] = value;
    },
    getData: (type: string): string => captured[type] ?? "",
    clearData: (): void => {
      for (const key of Object.keys(captured)) delete captured[key];
    },
    types: ["text/html", "text/plain"],
  };
  (copyEvent as unknown as Record<string, unknown>)["clipboardData"] =
    copyTransfer;
  (copyEvent as unknown as Record<string, unknown>)["dataTransfer"] =
    copyTransfer;
  viewDom.dispatchEvent(copyEvent);
  return captured;
}

describe("hostile paste is inert (native clipboard path)", () => {
  it("script elements never become content", () => {
    const { editor, changes, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: "<p>Hello</p><script>alert(1)</script>",
      text: "Hello",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("<script");
    expect(text).not.toContain("alert(1)");
    expect(viewDom.innerHTML).not.toContain("<script");
    expect(editor.getDocument().blocks.every((b) => b.kind === "paragraph")).toBe(
      true,
    );
    teardown();
  });

  it("event-handler attributes never survive", () => {
    const { editor, changes, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<p><img src="x" onerror="alert(1)">Caption</p>',
      text: "Caption",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("onerror");
    expect(text).not.toContain("alert(1)");
    expect(viewDom.innerHTML).not.toContain("onerror");
    expect(viewDom.innerHTML).not.toContain("<img");
    teardown();
  });

  it("scriptable link protocols never survive as attributes", () => {
    const { changes, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<p><a href="javascript:alert(1)">click</a> and <a href="data:text/html,<b>x</b>">other</a></p>',
      text: "click and other",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("javascript:");
    expect(text).not.toContain("data:text/html");
    expect(text).toContain("click");
    teardown();
  });

  it("raw HTML is never assigned as markup: tags are dropped or inert text", () => {
    const { changes, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<div><style>p { color: red; }</style><p>Text</p></div>',
      text: "Text",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("<style");
    expect(text).not.toContain("<div");
    teardown();
  });

  it("a forged data-paragraph-id never survives the native path", () => {
    const { editor, changes, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<p data-paragraph-id="paragraph:forged">Forged</p>',
      text: "Forged",
    });
    expect(changes).toHaveLength(1);
    const ids =
      changes[0]?.document.blocks.map((b) => b.paragraphId) ?? [];
    expect(ids).not.toContain("paragraph:forged");
    expect(ids).toContain("paragraph:paste-1");
    expect(changes[0]?.gesture.paste?.origin).toBe("external");
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    teardown();
  });
});

describe("image paste with alt text inside an otherwise accepted paste (native path)", () => {
  it("inserts the alt text as plain text, reports the dropped image once, emits one onChange", () => {
    const { changes, unsupported, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<p>Before</p><img src="https://example.invalid/pic.png" alt="Sunset over the harbour"><p>After</p>',
      text: "Before\nSunset over the harbour\nAfter",
    });
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("image");
    expect(changes).toHaveLength(1);
    const text = documentText(changes[0]?.document as RichTextDocument);
    expect(text).toContain("Sunset over the harbour");
    expect(text).toContain("Before");
    expect(text).toContain("After");
    expect(text).not.toContain("example.invalid");
    expect(text).not.toContain("<img");
    // Every block of the resulting document is an editable paragraph.
    for (const block of (changes[0]?.document as RichTextDocument).blocks) {
      expect(block.kind).toBe("paragraph");
    }
    teardown();
  });
});

describe("inline slice content is kept, never dropped silently (R3, native path)", () => {
  it("bare inline HTML inserts its text and reports nothing", () => {
    const { changes, unsupported, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: "<strong>bold</strong>",
      text: "bold",
    });
    expect(unsupported).toHaveLength(0);
    expect(changes).toHaveLength(1);
    expect(documentText(changes[0]?.document as RichTextDocument)).toContain(
      "bold",
    );
    teardown();
  });

  it("an image inside a paragraph degrades inline without losing its siblings", () => {
    const { changes, unsupported, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, {
      html: '<p>before<img alt="ALT">after</p>',
      text: "beforeALTafter",
    });
    expect(changes).toHaveLength(1);
    const text = documentText(changes[0]?.document as RichTextDocument);
    expect(text).toContain("before");
    expect(text).toContain("ALT");
    expect(text).toContain("after");
    expect(unsupported.map((event) => event.rejectedKinds).flat()).toContain(
      "image",
    );
    teardown();
  });
});

describe("structural figure refuses whole while pure image degrades (R8, native path)", () => {
  it("a figure with a caption is refused whole, nothing inserted", () => {
    const { editor, changes, unsupported, initial, viewDom, teardown } =
      setup();
    const selectionBefore = editor.getSelection();
    dispatchNativePaste(viewDom, {
      html: "<p>safe</p><figure>caption</figure>",
      text: "safe\ncaption",
    });
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("image");
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(initial);
    expect(editor.getSelection()).toEqual(selectionBefore);
    teardown();
  });

  it("a paste during composition still runs the refusal policy (R8, native path)", () => {
    const { editor, changes, unsupported, initial, viewDom, teardown } =
      setup();
    viewDom.dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true }),
    );
    // ProseMirror returns before `handlePaste` while composing; the DOM
    // interception still refuses the table payload.
    dispatchNativePaste(viewDom, {
      html: "<table><tr><td>one</td><td>two</td></tr></table>",
      text: "one two",
    });
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("table");
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(initial);
    viewDom.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true }),
    );
    teardown();
  });

  // The browser default that would insert through without the interception
  // above is `not covered (RT-1 browser witness)`: jsdom performs no native
  // insertion, so only the policy outcome (refusal, no mutation) is observed
  // here; the real during-composition browser insertion shape stays a
  // browser witness.
});

describe("an open native slice stays inline (R10, native path)", () => {
  it("pasting a 1 1 slice at a paragraph end inserts inline, never a new block", () => {
    const { editor, changes, viewDom, teardown } = setup();
    const view = editor.view;
    // Cursor at the end of `Alpha` (text positions 1..6).
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 6)),
    );
    expect(changes).toHaveLength(0);
    dispatchNativePaste(viewDom, {
      html: '<p data-pm-slice="1 1 []">lp</p>',
      text: "lp",
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]?.document.blocks).toHaveLength(2);
    expect(changes[0]?.document.blocks[0]?.text).toBe("Alphalp");
    expect(changes[0]?.document.blocks[1]?.text).toBe("Beta");
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    teardown();
  });

  it("an inline open paste announces no inserted identity (N3, native path)", () => {
    const { editor, changes, viewDom, teardown } = setup();
    const view = editor.view;
    // Cursor at the end of `Alpha` (text positions 1..6).
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, 6)),
    );
    expect(changes).toHaveLength(0);
    dispatchNativePaste(viewDom, {
      html: '<p data-pm-slice="1 1 []">lp</p>',
      text: "lp",
    });
    expect(changes).toHaveLength(1);
    // Only the host paragraph survives: the planned fresh identity never
    // entered the document, so nothing is announced as inserted and the
    // modified block alone is affected.
    expect(changes[0]?.document.blocks.map((b) => b.paragraphId)).toEqual([
      "paragraph:1",
      "paragraph:2",
    ]);
    expect(changes[0]?.gesture.paste?.insertedParagraphIds).toEqual([]);
    expect(changes[0]?.gesture.affectedParagraphIds).toEqual(["paragraph:1"]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    teardown();
  });
});

describe("non-paragraph paste refusal (refused whole, native path)", () => {
  const cases: {
    name: string;
    payload: { text?: string; html?: string };
    expectedKinds: string[];
  }[] = [
    {
      name: "text/plain carrying a Markdown table",
      payload: { text: "| a | b |\n| - | - |\n| 1 | 2 |" },
      expectedKinds: ["table"],
    },
    {
      name: "text/plain carrying a fenced code block",
      payload: { text: "```\nconst x = 1;\n```" },
      expectedKinds: ["codeBlock"],
    },
    {
      name: "text/html carrying a table element",
      payload: {
        html: "<table><tr><td>one</td><td>two</td></tr></table>",
        text: "one two",
      },
      expectedKinds: ["table"],
    },
    {
      name: "text/plain carrying a heading",
      payload: { text: "# Pasted heading" },
      expectedKinds: ["heading"],
    },
    {
      name: "text/plain carrying a list",
      payload: { text: "- pasted item one\n- pasted item two" },
      expectedKinds: ["list"],
    },
  ];

  for (const { name, payload, expectedKinds } of cases) {
    it(`${name}: one onUnsupportedPaste, zero onChange, document and selection unchanged`, () => {
      const { editor, changes, unsupported, initial, viewDom, teardown } =
        setup();
      const selectionBefore = editor.getSelection();
      dispatchNativePaste(viewDom, payload);
      expect(unsupported).toHaveLength(1);
      expect(unsupported[0]?.rejectedKinds).toEqual(
        expect.arrayContaining(expectedKinds),
      );
      expect(changes).toHaveLength(0);
      expect(editor.getDocument()).toEqual(initial);
      expect(editor.getSelection()).toEqual(selectionBefore);
      teardown();
    });
  }

  it("paragraph-only paste still inserts with fresh identities", () => {
    const { changes, unsupported, viewDom, teardown } = setup();
    dispatchNativePaste(viewDom, { text: "Inserted plain paragraph" });
    expect(unsupported).toHaveLength(0);
    expect(changes).toHaveLength(1);
    const ids =
      changes[0]?.document.blocks.map((b) => b.paragraphId) ?? [];
    expect(ids).toContain("paragraph:paste-1");
    expect(changes[0]?.gesture.paste?.origin).toBe("external");
    teardown();
  });
});

describe("internal copy/paste keeps literal whitespace (N2, native path)", () => {
  it("double spaces, tab and peripheral spaces survive a real copy then paste", () => {
    const source = "  A  B\tC  ";
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "text/plain",
        blocks: [paragraph("paragraph:1", source)],
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
    // A real copy event: the ProseMirror handler serialises the selection
    // into the transfer (exact text plus native `data-pm-slice` HTML).
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.create(view.state.doc, 1, 1 + source.length),
      ),
    );
    const captured = captureNativeCopy(viewDom);
    // The clipboard carries the exact text and a native slice payload.
    expect(captured["text/plain"]).toBe(source);
    expect(captured["text/html"] ?? "").toContain("data-pm-slice");
    // A real paste event at the paragraph end through the native path.
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.create(view.state.doc, 1 + source.length),
      ),
    );
    dispatchNativePaste(viewDom, {
      text: captured["text/plain"],
      html: captured["text/html"],
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("paste");
    expect(changes[0]?.gesture.paste?.origin).toBe("internal");
    // Nothing normalised: the paragraph carries the source twice, byte
    // for byte (double spaces, tab, leading and trailing spaces).
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", `${source}${source}`),
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
    element.remove();
  });

  it("Markdown inline code keeps double spaces and tab through a real copy then paste", () => {
    const inner = "A  B\tC";
    const changes: RichTextChangeEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", `\`${inner}\``)],
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
    // A real copy event over the code-span content: the transfer carries
    // the exact inner text plus native `data-pm-slice` HTML.
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.create(view.state.doc, 1, 1 + inner.length),
      ),
    );
    const captured = captureNativeCopy(viewDom);
    expect(captured["text/plain"]).toBe(inner);
    expect(captured["text/html"] ?? "").toContain("data-pm-slice");
    // A real paste event at the end of the code span through the native
    // path: the `data-pm-slice` marker keeps HTML whitespace collapsing
    // off, even though the target format is Markdown (N2 residual).
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.create(view.state.doc, 1 + inner.length),
      ),
    );
    dispatchNativePaste(viewDom, {
      text: captured["text/plain"],
      html: captured["text/html"],
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("paste");
    expect(changes[0]?.gesture.paste?.origin).toBe("internal");
    // Nothing normalised: the code span carries the inner text twice, byte
    // for byte (double space and tab intact).
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", `\`${inner}${inner}\``),
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    editor.destroy();
    element.remove();
  });
});

describe("internal copy/paste origin (membership by payload identity)", () => {
  it("the exact payload object pastes as internal; a lookalike copy pastes as external", () => {
    const { editor, changes, teardown } = setup();
    const payload = editor.copyToPayload(["paragraph:1"]);
    editor.paste(payload);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.paste?.origin).toBe("internal");
    // A structurally identical payload that is not the registered object is
    // external: membership is identity, never content comparison.
    editor.paste({ ...payload });
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.paste?.origin).toBe("external");
    teardown();
  });
});

describe("multi-paragraph copy keeps block boundaries (native path)", () => {
  it("copying two paragraphs pastes two paragraphs with fresh identities", () => {
    const { editor, changes, viewDom, teardown } = setup();
    const payload = editor.copyToPayload(["paragraph:1", "paragraph:2"]);
    expect(payload.text).toBe("Alpha\n\nBeta");
    expect(payload.html).toContain("<p");
    dispatchNativePaste(viewDom, { text: payload.text, html: payload.html });
    expect(changes).toHaveLength(1);
    const event = changes[0];
    const inserted = event?.gesture.paste?.insertedParagraphIds ?? [];
    expect(inserted).toHaveLength(2);
    expect(new Set(inserted).size).toBe(2);
    expect(inserted).not.toContain("paragraph:1");
    expect(inserted).not.toContain("paragraph:2");
    const byId = new Map(
      (event?.document.blocks ?? []).map((b) => [b.paragraphId, b] as const),
    );
    // Block boundaries survived: two consecutive inserted blocks carrying
    // each source text exactly, never one joined `A\nB` paragraph.
    const first = byId.get(inserted[0] as string);
    const second = byId.get(inserted[1] as string);
    expect(first?.kind).toBe("paragraph");
    expect(second?.kind).toBe("paragraph");
    expect(first?.text).toBe("Alpha");
    expect(second?.text).toBe("Beta");
    expect(event?.gesture.paste?.origin).toBe("external");
    teardown();
  });
});

describe("preserved drop refusal and duplicate-identity guard (R7, native path)", () => {
  function keptSetup() {
    const changes: RichTextChangeEvent[] = [];
    const unsupported: RichTextUnsupportedPasteEvent[] = [];
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
    let n = 0;
    const editor = createRichTextEditor({
      document: before,
      messages: MESSAGES,
      allocateId: () => `paragraph:drop-${++n}`,
      element,
      onChange: (event) => {
        changes.push(event);
      },
      onUnsupportedPaste: (event) => {
        unsupported.push(event);
      },
    });
    return {
      editor,
      changes,
      unsupported,
      before,
      teardown: () => {
        editor.destroy();
        element.remove();
      },
    };
  }

  function keptNodeOf(editor: RichTextEditor): ProseMirrorNode {
    let found: ProseMirrorNode | null = null;
    editor.view.state.doc.descendants((node) => {
      if (
        found === null &&
        node.type.name === "preservedBlock" &&
        node.attrs["paragraphId"] === "paragraph:kept"
      ) {
        found = node;
      }
      return true;
    });
    expect(found).not.toBe(null);
    return found as ProseMirrorNode;
  }

  it("a dropped slice carrying the preserved block is refused whole", () => {
    const { editor, changes, unsupported, before, teardown } = keptSetup();
    const view = editor.view;
    // The slice a dragstart of the preserved table would carry: the live
    // node with its (duplicated on drop) identity.
    const slice = new Slice(Fragment.from([keptNodeOf(editor)]), 0, 0);
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    (drop as unknown as Record<string, unknown>)["dataTransfer"] = {
      getData: (): string => "",
      types: [],
    };
    // The same prop ProseMirror consults on a drop (`view.props.handleDrop`,
    // reached here directly because jsdom has no layout for `posAtCoords`).
    const props = view.props as unknown as {
      handleDrop?: (
        view: EditorView,
        event: Event,
        slice: Slice,
        moved: boolean,
      ) => boolean;
    };
    expect(typeof props.handleDrop).toBe("function");
    const handled = props.handleDrop?.(view, drop, slice, false);
    expect(handled).toBe(true);
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("table");
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
    teardown();
  });

  it("a transaction duplicating a preserved identity is filtered", () => {
    const { editor, changes, before, teardown } = keptSetup();
    const view = editor.view;
    view.dispatch(view.state.tr.replaceSelectionWith(keptNodeOf(editor)));
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
    teardown();
  });
});

describe("paste spanning a preserved block is refused whole (native path)", () => {
  it("the preserved raw and identity survive, one report, zero onChange", () => {
    const changes: RichTextChangeEvent[] = [];
    const unsupported: RichTextUnsupportedPasteEvent[] = [];
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
    let n = 0;
    const editor = createRichTextEditor({
      document: before,
      messages: MESSAGES,
      allocateId: () => `paragraph:span-${++n}`,
      element,
      onChange: (event) => {
        changes.push(event);
      },
      onUnsupportedPaste: (event) => {
        unsupported.push(event);
      },
    });
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    // Span the whole document, preserved block included, through the real
    // ProseMirror selection.
    editor.view.dispatch(
      editor.view.state.tr.setSelection(
        TextSelection.create(
          editor.view.state.doc,
          0,
          editor.view.state.doc.content.size,
        ),
      ),
    );
    dispatchNativePaste(viewDom, { text: "replacement" });
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("table");
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
    editor.destroy();
    element.remove();
  });
});

describe("copying a preserved block refuses the paste whole (N7, native path)", () => {
  it("pasting the copied preserved HTML reports the kind, inserts nothing", () => {
    const changes: RichTextChangeEvent[] = [];
    const unsupported: RichTextUnsupportedPasteEvent[] = [];
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
    let n = 0;
    const editor = createRichTextEditor({
      document: before,
      messages: MESSAGES,
      allocateId: () => `paragraph:copied-${++n}`,
      element,
      onChange: (event) => {
        changes.push(event);
      },
      onUnsupportedPaste: (event) => {
        unsupported.push(event);
      },
    });
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    // Copy the preserved block natively: the clipboard HTML carries its
    // preserved marker.
    let preservedPos = -1;
    editor.view.state.doc.descendants((node, pos) => {
      if (node.type.name === "preservedBlock") preservedPos = pos;
      return true;
    });
    expect(preservedPos).toBeGreaterThanOrEqual(0);
    editor.view.dispatch(
      editor.view.state.tr.setSelection(
        NodeSelection.create(editor.view.state.doc, preservedPos),
      ),
    );
    const captured = captureNativeCopy(viewDom);
    expect(captured["text/html"] ?? "").toContain("data-preserved-block");
    // Paste inside an ordinary paragraph: the preserved region is
    // classified before its marker is stripped, so the whole payload is
    // refused instead of flattening into a paragraph.
    editor.view.dispatch(
      editor.view.state.tr.setSelection(
        TextSelection.create(editor.view.state.doc, 6),
      ),
    );
    dispatchNativePaste(viewDom, {
      text: captured["text/plain"],
      html: captured["text/html"],
    });
    expect(unsupported).toHaveLength(1);
    expect(unsupported[0]?.rejectedKinds).toContain("table");
    expect(changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
    editor.destroy();
    element.remove();
  });
});
