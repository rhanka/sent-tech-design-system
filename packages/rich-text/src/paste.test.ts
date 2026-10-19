/**
 * RED 7 — core paste pipeline half: hostile paste is inert; an image kept
 * from an otherwise accepted paste degrades to its alt text; a paste that
 * would create a non-paragraph block is refused whole. Spec §11 RED 7, §7.
 * Environment: J.
 *
 * Observable assertions:
 * - Hostile payloads (`</script><script>`, `onerror` attributes,
 *   `javascript:` links, remote `<img>`, raw HTML): the resulting document
 *   contains no `script` element, no event-handler attribute, no link
 *   attribute and no `img`; scriptable content is dropped or present only as
 *   inert text.
 * - Image with `alt` inside an otherwise accepted paste: the `alt` text is
 *   inserted as plain text, `onUnsupportedPaste` reports the dropped image
 *   once, and `onChange` fires exactly once.
 * - Non-paragraph paste refusal: each payload that would create a
 *   non-paragraph block — (a) `text/plain` carrying a Markdown table,
 *   (b) `text/plain` carrying a fenced code block, (c) `text/html` carrying a
 *   `<table>` element, (d) `text/plain` carrying a heading or a list —
 *   produces exactly one `onUnsupportedPaste` with the expected
 *   `rejectedKinds`, zero `onChange` calls, a resulting `RichTextDocument`
 *   deep-equal to the pre-paste document (all significant fields, §5.6
 *   equality), and an unchanged selection. Creating a preserved block from
 *   the paste, or flattening the payload into paragraphs, fails the test.
 *   Paragraph-only paste still inserts with fresh identities (RED 3).
 *
 * DOM-level assertions (no `script` element, no handler attribute, no `img`
 * in the rendered tree) and the destructive-gesture span half belong to the
 * component suite (RT-1 `RichTextEditor.test.ts` / browser suite); this file
 * asserts the core pipeline at the `RichTextDocument` level.
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
  const initial: RichTextDocument = {
    format: "focus.markdown.p0@1",
    blocks: [paragraph("paragraph:1", "Alpha"), paragraph("paragraph:2", "Beta")],
  };
  const editor: HeadlessEditor = createHeadlessEditor({
    document: initial,
    messages: MESSAGES,
    allocateId: () => `paragraph:paste-${++n}`,
    onChange: (event) => {
      changes.push(event);
    },
    onUnsupportedPaste: (event) => {
      unsupported.push(event);
    },
  });
  return { editor, changes, unsupported, initial };
}

function documentText(document: RichTextDocument): string {
  return document.blocks.map((b) => b.text ?? b.raw ?? "").join("\n");
}

describe("hostile paste is inert", () => {
  it("script elements never become content", () => {
    const { editor, changes } = setup();
    editor.paste({
      html: "<p>Hello</p><script>alert(1)</script>",
      text: "Hello",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("<script");
    expect(text).not.toContain("alert(1)");
    editor.destroy();
  });

  it("event-handler attributes never survive", () => {
    const { editor, changes } = setup();
    editor.paste({
      html: '<p><img src="x" onerror="alert(1)">Caption</p>',
      text: "Caption",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("onerror");
    expect(text).not.toContain("alert(1)");
    editor.destroy();
  });

  it("scriptable link protocols never survive as attributes", () => {
    const { editor, changes } = setup();
    editor.paste({
      html: '<p><a href="javascript:alert(1)">click</a> and <a href="data:text/html,<b>x</b>">other</a></p>',
      text: "click and other",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("javascript:");
    expect(text).not.toContain("data:text/html");
    expect(text).toContain("click");
    editor.destroy();
  });

  it("raw HTML is never assigned as markup: tags are dropped or inert text", () => {
    const { editor, changes } = setup();
    editor.paste({
      html: '<div><style>p { color: red; }</style><p>Text</p></div>',
      text: "Text",
    });
    const text = documentText(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(text).not.toContain("<style");
    expect(text).not.toContain("<div");
    editor.destroy();
  });
});

describe("image paste with alt text inside an otherwise accepted paste", () => {
  it("inserts the alt text as plain text, reports the dropped image once, emits one onChange", () => {
    const { editor, changes, unsupported } = setup();
    editor.paste({
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
    editor.destroy();
  });
});

describe("non-paragraph paste refusal (refused whole)", () => {
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
      const { editor, changes, unsupported, initial } = setup();
      const selectionBefore = editor.getSelection();
      editor.paste(payload);
      expect(unsupported).toHaveLength(1);
      expect(unsupported[0]?.rejectedKinds).toEqual(
        expect.arrayContaining(expectedKinds),
      );
      expect(changes).toHaveLength(0);
      expect(editor.getDocument()).toEqual(initial);
      expect(editor.getSelection()).toEqual(selectionBefore);
      editor.destroy();
    });
  }

  it("paragraph-only paste still inserts with fresh identities", () => {
    const { editor, changes, unsupported } = setup();
    editor.paste({ text: "Inserted plain paragraph" });
    expect(unsupported).toHaveLength(0);
    expect(changes).toHaveLength(1);
    const ids =
      changes[0]?.document.blocks.map((b) => b.paragraphId) ?? [];
    expect(ids).toContain("paragraph:paste-1");
    expect(changes[0]?.gesture.paste?.origin).toBe("external");
    editor.destroy();
  });
});
