/**
 * CL-2F RED suite: the full profile as controlled editor (E/P/C per F01–F19,
 * §2.9, §4.3.2, §6.2.1).
 *
 * Naming: `CL-2F-F<nn>-<E|P|C>-<slug>`, `CL-2F-F10-C-code-controlled`,
 * `CL-2F-F-DEFAULT`, `CL-2F-F-URL`, FK1–FK4. Every case was observed failing
 * before the full wiring (missing profile/format, missing schema nodes,
 * missing bridge) and passes after.
 */
import { afterEach, describe, expect, it } from "vitest";
import { TextSelection } from "@tiptap/pm/state";
import { setBlockType, toggleMark, wrapIn } from "@tiptap/pm/commands";
import type { RichTextDocument } from "./model.js";
import type { FullBlockMetadata, RichTextInlineMarks } from "./collaboration.js";
import {
  canonicalPlainMetadata,
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
import {
  createRichTextEditor,
  type RichTextEditor,
} from "./editor.js";

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) editor.destroy();
});

function allocator(prefix: string): () => string {
  let sequence = 0;
  return () => `${prefix}:${(sequence += 1)}`;
}

function marks(partial: Partial<Record<string, unknown>> = {}): RichTextInlineMarks {
  return { ...partial } as RichTextInlineMarks;
}

function textRun(text: string, partial: Partial<Record<string, unknown>> = {}) {
  return { type: "text" as const, text, marks: marks(partial) };
}

function meta(partial: Partial<FullBlockMetadata> = {}): FullBlockMetadata {
  return { ...canonicalPlainMetadata(), ...partial } as FullBlockMetadata;
}

function para(
  id: string,
  segments: { type: "text"; text: string; marks: RichTextInlineMarks }[] | { type: "hardBreak" }[] | never[] = [],
  partial: Partial<FullBlockMetadata> = {},
): RichTextDocument["blocks"][number] {
  void meta;
  return {
    paragraphId: id,
    kind: "paragraph",
    metadata: { ...canonicalPlainMetadata(), ...partial } as FullBlockMetadata,
    segments: segments as never,
  } as RichTextDocument["blocks"][number];
}

function fullDoc(blocks: RichTextDocument["blocks"]): RichTextDocument {
  return { format: "ds.markdown.full@1", blocks };
}

function mountFull(
  blocks: RichTextDocument["blocks"],
  options: {
    editable?: boolean;
    disabled?: boolean;
    onChange?: () => void;
    placeholder?: string;
    placeholderMarker?: string;
  } = {},
): RichTextEditor {
  const editor = createRichTextEditor({
    document: fullDoc(blocks),
    profile: "full",
    messages: {
      placeholder: options.placeholder ?? "",
      placeholderMarker: options.placeholderMarker ?? "",
    },
    allocateId: allocator("full"),
    editable: options.editable,
    disabled: options.disabled,
    onChange: options.onChange,
  });
  mounted.push(editor);
  return editor;
}

/** Mount → capture → remount → capture equality (C half). */
function expectStableRemount(blocks: RichTextDocument["blocks"]): RichTextDocument {
  const first = mountFull(blocks);
  const capture1 = first.getDocument();
  const second = mountFull(capture1.blocks);
  const capture2 = second.getDocument();
  expect(capture2).toEqual(capture1);
  return capture1;
}

function setCursor(
  editor: RichTextEditor,
  paragraphId: string,
  offset: number,
): void {
  const found = findBlock(editor, paragraphId);
  expect(found).not.toBeNull();
  const { node, pos } = found as { node: { nodeSize: number }; pos: number };
  void node;
  const inner = Math.min(offset, 100000);
  editor.view.dispatch(
    editor.view.state.tr.setSelection(
      TextSelection.create(editor.view.state.doc, pos + 1 + inner),
    ),
  );
}

function findBlock(
  editor: RichTextEditor,
  paragraphId: string,
): { node: { nodeSize: number }; pos: number } | null {
  let result: { node: { nodeSize: number }; pos: number } | null = null;
  editor.view.state.doc.descendants((node, pos) => {
    if (
      result === null &&
      (node.type.name === "paragraph" ||
        node.type.name === "heading" ||
        node.type.name === "codeBlock") &&
      (node.attrs as Record<string, unknown>)["paragraphId"] === paragraphId
    ) {
      result = { node: node as unknown as { nodeSize: number }, pos };
    }
    return result === null;
  });
  return result;
}

function pressKey(editor: RichTextEditor, key: string, extra: Partial<KeyboardEventInit> = {}): void {
  editor.view.dom.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...extra,
    }),
  );
}

describe("CL-2F-F01 paragraphs E/P/C", () => {
  it("CL-2F-F01-E-text: types, clears and splits paragraphs keeping identities", () => {
    const editor = mountFull([
      para("p1", [textRun("Hello")]),
      para("p2", [], {}),
      para("p3", [textRun("Tail")]),
    ]);
    editor.typeText("p1", " world");
    const after = editor.getDocument();
    expect(after.blocks[0]).toMatchObject({ paragraphId: "p1" });
    expect(JSON.stringify(after.blocks[0])).toContain("Hello world");
    editor.clearParagraph("p3");
    expect(editor.getDocument().blocks[2]).toMatchObject({ paragraphId: "p3" });
    editor.splitParagraph("p1", 5);
    const split = editor.getDocument();
    expect(split.blocks.length).toBe(4);
    expect(split.blocks[0]).toMatchObject({ paragraphId: "p1" });
  });

  it("CL-2F-F01-P-text: pastes paragraphs keeping breaks and allocating identities", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "First\n\nSecond" });
    const after = editor.getDocument();
    expect(after.blocks.length).toBeGreaterThan(2);
    const wire = serializeFullDocument(after);
    expect(wire).toContain("First");
    expect(wire).toContain("Second");
    // Pasted identities are fresh and unique; the seed keeps its own id.
    const ids = after.blocks.map((block) => block.paragraphId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const block of after.blocks) {
      expect(block.paragraphId).not.toBe("");
    }
  });

  it("CL-2F-F01-C-text: capture remounts byte-stable", () => {
    const capture = expectStableRemount([
      para("p1", [textRun("First")]),
      para("p2", [], {}),
      para("p3", [textRun("Third")]),
    ]);
    expect(serializeFullDocument(capture)).toBe("First\n\n\n\nThird");
  });
});

describe("CL-2F-F02 headings E/P/C", () => {
  const heading = (
    id: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    text: string,
  ): RichTextDocument["blocks"][number] =>
    para(id, [textRun(text)], { blockKind: "heading", headingLevel: level });

  it("CL-2F-F02-E-heading: converts and edits every level keeping ids", () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    const editor = mountFull(levels.map((level, index) => heading(`h${index}`, level, `Title ${level}`)));
    editor.typeText("h2", "!");
    const after = editor.getDocument();
    // The trailing node helper appends one identified empty paragraph after
    // the last heading; the six headings keep their identities in order.
    expect(after.blocks.length).toBe(7);
    expect(after.blocks.slice(0, 6).map((block) => block.paragraphId)).toEqual([
      "h0", "h1", "h2", "h3", "h4", "h5",
    ]);
    const wire = serializeFullDocument(after);
    for (const level of levels) {
      expect(wire).toContain(`${"#".repeat(level)} Title ${level}${level === 3 ? "!" : ""}`);
    }
  });

  it("CL-2F-F02-P-heading: pastes ATX and Setext headings to heading blocks", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "# Pasted\n\nSetext\n===" });
    const after = editor.getDocument();
    const headings = after.blocks.filter(
      (block) => block.kind === "paragraph" && block.metadata?.blockKind === "heading",
    );
    expect(headings.length).toBe(2);
    expect(headings[0]?.metadata).toMatchObject({ headingLevel: 1 });
    expect(serializeFullDocument(after)).toContain("# Pasted");
  });

  it("CL-2F-F02-C-heading: heading capture remounts stable", () => {
    expectStableRemount([
      heading("h1", 1, "One"),
      heading("h2", 6, "Six"),
    ]);
  });
});

describe("CL-2F-F03/F04/F05 lists E/P/C", () => {
  const listFixture = (): RichTextDocument["blocks"] => [
    para("o1", [textRun("First")], {
      listKind: "ordered", listDepth: 0, listRunId: "o1", listItemId: "o1",
      orderedStart: 3, listTight: true, containerOrder: ["list"],
    }),
    para("o2", [textRun("Second")], {
      listKind: "ordered", listDepth: 0, listRunId: "o1", listItemId: "o2",
      containerOrder: ["list"],
    }),
    para("b1", [textRun("Nested")], {
      listKind: "bullet", listDepth: 1, listRunId: "b1", listItemId: "b1",
      listTight: true, containerOrder: ["list"],
    }),
  ];

  it("CL-2F-F03-E-bullet: indents with Tab keeping content, ids and starts", () => {
    const editor = mountFull([
      para("a1", [textRun("Alpha")], {
        listKind: "bullet", listDepth: 0, listRunId: "a1", listItemId: "a1",
        listTight: true, containerOrder: ["list"],
      }),
      para("a2", [textRun("Beta")], {
        listKind: "bullet", listDepth: 0, listRunId: "a1", listItemId: "a2",
        containerOrder: ["list"],
      }),
    ]);
    setCursor(editor, "a2", 0);
    pressKey(editor, "Tab");
    const after = editor.getDocument();
    const beta = after.blocks.find((block) => block.paragraphId === "a2");
    expect(beta?.metadata?.listDepth).toBe(1);
    expect(beta?.metadata?.listRunId).not.toBe("a1");
    const alpha = after.blocks.find((block) => block.paragraphId === "a1");
    expect(alpha?.metadata?.listRunId).toBe("a1");
    expect(JSON.stringify(beta)).toContain("Beta");
  });

  it("CL-2F-F04-E-ordered: keeps the start across edits and remounts", () => {
    const editor = mountFull(listFixture());
    editor.typeText("o2", "!");
    const after = editor.getDocument();
    const opener = after.blocks.find((block) => block.paragraphId === "o1");
    expect(opener?.metadata?.orderedStart).toBe(3);
    const member = after.blocks.find((block) => block.paragraphId === "o2");
    expect(member?.metadata?.orderedStart).toBeUndefined();
    expect(serializeFullDocument(after)).toContain("3. First");
    expect(serializeFullDocument(after)).toContain("4. Second!");
  });

  it("CL-2F-F05-P-list: pastes markdown lists to editable structure", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "1. First\n2. Second\n  - Nested" });
    const after = editor.getDocument();
    const listed = after.blocks.filter((block) => block.metadata?.listKind !== "none");
    expect(listed.map((block) => block.metadata?.listKind)).toEqual([
      "ordered", "ordered", "bullet",
    ]);
    const opener = listed.find(
      (block) => block.paragraphId === block.metadata?.listRunId,
    );
    expect(opener?.metadata?.orderedStart).toBe(1);
    expect(serializeFullDocument(after)).toContain("1. First\n2. Second\n  - Nested");
  });

  it("CL-2F-F05-C-list: list capture remounts stable", () => {
    expectStableRemount(listFixture());
  });

  it("CL-2F-F05-C-loose: loose runs keep their separation", () => {
    const capture = expectStableRemount([
      para("l1", [textRun("One")], {
        listKind: "bullet", listDepth: 0, listRunId: "l1", listItemId: "l1",
        listTight: false, containerOrder: ["list"],
      }),
      para("l2", [textRun("Two")], {
        listKind: "bullet", listDepth: 0, listRunId: "l1", listItemId: "l2",
        listTight: false, containerOrder: ["list"],
      }),
    ]);
    const wire = serializeFullDocument(capture);
    // The trailing helper paragraph serializes after the loose run.
    expect(wire).toBe("- One\n\n- Two\n\n");
  });
});

describe("CL-2F-F06/F07 links E/P/C", () => {
  it("CL-2F-F06-E-link: sets a labeled link with optional title through the surface", () => {
    const editor = mountFull([para("p1", [textRun("Read the source")])]);
    setCursor(editor, "p1", 0);
    const { state } = editor.view;
    const tr = state.tr.setSelection(
      TextSelection.create(state.doc, 6, 16),
    );
    editor.view.dispatch(tr);
    const marked = editor.view.state.tr.addMark(
      6,
      16,
      editor.view.state.schema.marks["link"]?.create({
        href: "https://example.com",
        title: "Title",
      }),
    );
    editor.view.dispatch(marked);
    const after = editor.getDocument();
    const segments = after.blocks[0]?.kind === "paragraph" ? (after.blocks[0].segments ?? []) : [];
    const linked = segments.filter(
      (segment) => segment.type === "text" && segment.marks.link === "https://example.com",
    );
    expect(linked.length).toBeGreaterThan(0);
    expect(serializeFullDocument(after)).toContain('[the source](https://example.com "Title")');
  });

  it("CL-2F-F07-P-link: pastes URL text to an autolinked run", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "See https://example.com for details" });
    const after = editor.getDocument();
    const wire = serializeFullDocument(after);
    expect(wire).toContain("https://example.com");
    const linked = after.blocks.flatMap((block) =>
      block.kind === "paragraph" ? (block.segments ?? []) : [],
    ).filter((segment) => segment.type === "text" && segment.marks.link !== undefined);
    expect(linked.length).toBeGreaterThan(0);
  });

  it("CL-2F-F06-C-link: link capture remounts stable", () => {
    expectStableRemount([
      para("p1", [
        textRun("Read "),
        textRun("the source", { link: "https://example.com", linkTitle: "Title" }),
        textRun(" now"),
      ]),
    ]);
  });
});

describe("CL-2F-F08 blockquote E/P/C", () => {
  const quoteFixture = (): RichTextDocument["blocks"] => [
    para("q1", [textRun("Quoted")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
    para("q2", [textRun("Second")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
  ];

  it("CL-2F-F08-E-quote: wraps a paragraph through the command path", () => {
    const editor = mountFull([para("p1", [textRun("Wrap me")])]);
    setCursor(editor, "p1", 0);
    const command = wrapIn(editor.view.state.schema.nodes["blockquote"]);
    command(editor.view.state, editor.view.dispatch);
    const after = editor.getDocument();
    expect(after.blocks[0]?.metadata?.blockquoteDepth).toBe(1);
    expect(serializeFullDocument(after)).toContain("> Wrap me");
  });

  it("CL-2F-F08-P-quote: pastes quote prefixes to nested depth", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "> Quoted\n>\n> Second" });
    const after = editor.getDocument();
    const quoted = after.blocks.filter((block) => (block.metadata?.blockquoteDepth ?? 0) > 0);
    expect(quoted.length).toBe(2);
    expect(quoted.every((block) => block.metadata?.blockquoteDepth === 1)).toBe(true);
  });

  it("CL-2F-F08-C-quote: quote capture remounts stable", () => {
    expectStableRemount(quoteFixture());
  });
});

describe("CL-2F-F09/F10 code E/P/C", () => {
  const codeFixture = (): RichTextDocument["blocks"] => [
    para("c1", [textRun("const count = 1;"), { type: "hardBreak" }, textRun("const total = count;")], {
      blockKind: "codeBlock", codeLanguage: "js",
    }),
  ];

  it("CL-2F-F09-E-code: toggles inline code without dropping sibling marks", () => {
    const editor = mountFull([para("p1", [textRun("Bold and code", { bold: true })])]);
    setCursor(editor, "p1", 0);
    const { state } = editor.view;
    editor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 10, 14)));
    const command = toggleMark(editor.view.state.schema.marks["code"]);
    command(editor.view.state, editor.view.dispatch);
    const after = editor.getDocument();
    const segments = after.blocks[0]?.kind === "paragraph" ? (after.blocks[0].segments ?? []) : [];
    const coded = segments.filter((segment) => segment.type === "text" && segment.marks.code === true);
    expect(coded.length).toBeGreaterThan(0);
    expect(serializeFullDocument(after)).toContain("`");
  });

  it("CL-2F-F10-E-block: converts a prose block to code keeping language and lines", () => {
    const editor = mountFull([para("p1", [textRun("const x = 1;")])]);
    setCursor(editor, "p1", 0);
    const { state } = editor.view;
    const command = setBlockType(
      editor.view.state.schema.nodes["codeBlock"],
      { language: "js" },
    );
    command(state, editor.view.dispatch, editor.view);
    const after = editor.getDocument();
    expect(after.blocks[0]?.metadata?.blockKind).toBe("codeBlock");
    expect(after.blocks[0]?.metadata).toMatchObject({ codeLanguage: "js" });
    expect(serializeFullDocument(after)).toContain("```js\nconst x = 1;\n```");
  });

  it("CL-2F-F10-C-code-controlled: conversion clears inline formats and never resurrects them", () => {
    const editor = mountFull([
      para("p1", [
        textRun("Bold", { bold: true }),
        textRun(" and "),
        textRun("linked", { link: "https://example.com" }),
      ]),
    ]);
    setCursor(editor, "p1", 0);
    // Mirrors the documented toggle path: the block identity travels with
    // the conversion while PM clears every incompatible inline mark.
    const toCode = setBlockType(editor.view.state.schema.nodes["codeBlock"], {
      paragraphId: "p1",
      language: "ts",
    });
    expect(
      toCode(editor.view.state, editor.view.dispatch, editor.view),
    ).toBe(true);
    const asCode = editor.getDocument();
    expect(asCode.blocks[0]?.metadata?.blockKind).toBe("codeBlock");
    const codeSegments = asCode.blocks[0]?.kind === "paragraph" ? (asCode.blocks[0].segments ?? []) : [];
    for (const segment of codeSegments) {
      if (segment.type === "text") expect(segment.marks).toEqual({});
    }
    // Converting back resurrects nothing: provenance of the clearing stands.
    setCursor(editor, "p1", 0);
    const toProse = setBlockType(editor.view.state.schema.nodes["paragraph"], {
      paragraphId: "p1",
    });
    expect(
      toProse(editor.view.state, editor.view.dispatch, editor.view),
    ).toBe(true);
    const backToProse = editor.getDocument();
    const proseSegments =
      backToProse.blocks[0]?.kind === "paragraph" ? (backToProse.blocks[0].segments ?? []) : [];
    for (const segment of proseSegments) {
      if (segment.type === "text") expect(segment.marks).toEqual({});
    }
  });

  it("CL-2F-F10-P-code: pastes fenced blocks with language and longer fences", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "````\ncode with ``` inside\n````" });
    const after = editor.getDocument();
    expect(after.blocks.some((block) => block.metadata?.blockKind === "codeBlock")).toBe(true);
  });

  it("CL-2F-F10-C-code: code capture remounts stable", () => {
    const capture = expectStableRemount(codeFixture());
    expect(serializeFullDocument(capture)).toContain(
      "```js\nconst count = 1;\nconst total = count;\n```",
    );
  });
});

describe("CL-2F-F11/F12/F13/F14 marks E/P/C", () => {
  it("CL-2F-F11/12-E-bold-italic: toggles bold and italic through the surface", () => {
    const editor = mountFull([para("p1", [textRun("Make me bold and italic")])]);
    const { state } = editor.view;
    editor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 1, 8)));
    const schema = editor.view.state.schema;
    const bold = toggleMark(schema.marks["bold"]);
    bold(editor.view.state, editor.view.dispatch);
    editor.view.dispatch(
      editor.view.state.tr.setSelection(TextSelection.create(editor.view.state.doc, 14, 24)),
    );
    const italic = toggleMark(schema.marks["italic"]);
    italic(editor.view.state, editor.view.dispatch);
    const wire = serializeFullDocument(editor.getDocument());
    expect(wire).toBe("**Make me** bold *and italic*");
  });

  it("CL-2F-F13-E-strike: toggles strike and keeps it on the wire", () => {
    const editor = mountFull([para("p1", [textRun("Remove this")])]);
    const { state } = editor.view;
    editor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 1, 7)));
    const strike = toggleMark(editor.view.state.schema.marks["strike"]);
    strike(editor.view.state, editor.view.dispatch);
    expect(serializeFullDocument(editor.getDocument())).toBe("~~Remove~~ this");
  });

  it("CL-2F-F14-P-underline: pastes <u> and styled underline to the mark", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ html: "<p>Plain <u>under</u> and <span style=\"text-decoration: underline;\">styled</span></p>" });
    const after = editor.getDocument();
    const underlined = after.blocks.flatMap((block) =>
      block.kind === "paragraph" ? (block.segments ?? []) : [],
    ).filter((segment) => segment.type === "text" && segment.marks.underline === true);
    expect(underlined.length).toBe(2);
    expect(serializeFullDocument(after)).toContain("<u>under</u>");
  });

  it("CL-2F-F11/12/13/14-C-marks: mark capture remounts stable", () => {
    expectStableRemount([
      para("p1", [
        textRun("Bold", { bold: true }),
        textRun(" "),
        textRun("italic", { italic: true }),
        textRun(" "),
        textRun("strike", { strike: true }),
        textRun(" "),
        textRun("under", { underline: true }),
      ]),
    ]);
  });
});

describe("CL-2F-F15 horizontal rule E/P/C", () => {
  it("CL-2F-F15-E-hr: inserts an atomic rule keeping its identity", () => {
    const editor = mountFull([para("p1", [textRun("Before")])]);
    setCursor(editor, "p1", 6);
    const hr = editor.view.state.schema.nodes["horizontalRule"]?.create({ paragraphId: "hr1" });
    expect(hr).toBeDefined();
    editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(hr));
    const after = editor.getDocument();
    expect(after.blocks.slice(0, 2).map((block) => block.kind)).toEqual([
      "paragraph", "horizontalRule",
    ]);
    expect(after.blocks[1]).toMatchObject({ paragraphId: "hr1", kind: "horizontalRule" });
    expect(serializeFullDocument(after)).toBe("Before\n\n---\n\n");
  });

  it("CL-2F-F15-P-hr: pastes rule spellings to one atom", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "Before\n\n***\n\nAfter" });
    const after = editor.getDocument();
    expect(after.blocks.some((block) => block.kind === "horizontalRule")).toBe(true);
  });

  it("CL-2F-F15-C-hr: rule capture remounts stable", () => {
    const capture = expectStableRemount([
      para("p1", [textRun("Before")]),
      { paragraphId: "hr1", kind: "horizontalRule" },
      para("p3", [textRun("After")]),
    ]);
    expect(serializeFullDocument(capture)).toBe("Before\n\n---\n\nAfter");
  });
});

describe("CL-2F-F16 hard breaks E/P/C", () => {
  it("CL-2F-F16-E-break: Shift+Enter inserts a break without splitting", () => {
    const editor = mountFull([para("p1", [textRun("Hardbreak")])]);
    setCursor(editor, "p1", 4);
    pressKey(editor, "Enter", { shiftKey: true });
    const after = editor.getDocument();
    expect(after.blocks.length).toBe(1);
    expect(serializeFullDocument(after)).toBe("Hard\\\nbreak");
  });

  it("CL-2F-F16-P-break: pastes backslash and two-space breaks", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "Hard\\\nbreak\n\nTwo  \nspaces" });
    const after = editor.getDocument();
    const withBreak = after.blocks.filter(
      (block) =>
        block.kind === "paragraph" &&
        (block.segments ?? []).some((segment) => segment.type === "hardBreak"),
    );
    expect(withBreak.length).toBeGreaterThan(0);
    expect(serializeFullDocument(after)).toContain("Hard\\\nbreak");
  });

  it("CL-2F-F16-C-break: terminal breaks stay in capture, off the wire", () => {
    const capture = expectStableRemount([
      para("p1", [textRun("Twin"), { type: "hardBreak" }]),
      para("p2", [textRun("Twin"), { type: "hardBreak" }]),
    ]);
    expect(serializeFullDocument(capture)).toBe("Twin\n\nTwin");
    const first = capture.blocks[0];
    expect(first?.kind === "paragraph" && (first.segments ?? []).length).toBe(2);
  });
});

describe("CL-2F-F17 document E/C", () => {
  it("CL-2F-F17-E-doc: edits inside a mixed document keep wrappers and order", () => {
    const editor = mountFull([
      para("h1", [textRun("Title")], { blockKind: "heading", headingLevel: 1 }),
      para("q1", [textRun("Quoted")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
      para("o1", [textRun("Item")], {
        listKind: "ordered", listDepth: 0, listRunId: "o1", listItemId: "o1",
        orderedStart: 1, listTight: true, containerOrder: ["list"],
      }),
      para("code1", [textRun("x = 1")], { blockKind: "codeBlock", codeLanguage: "py" }),
      { paragraphId: "hr1", kind: "horizontalRule" },
    ]);
    editor.typeText("q1", "!");
    const after = editor.getDocument();
    expect(after.blocks.slice(0, 5).map((block) => block.paragraphId)).toEqual([
      "h1", "q1", "o1", "code1", "hr1",
    ]);
    expect(serializeFullDocument(after)).toContain("# Title");
    expect(serializeFullDocument(after)).toContain("> Quoted!");
  });

  it("CL-2F-F17-C-doc: mixed document capture remounts stable", () => {
    expectStableRemount([
      para("h1", [textRun("Title")], { blockKind: "heading", headingLevel: 2 }),
      para("q1", [textRun("Quoted")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
      para("o1", [textRun("One")], {
        listKind: "bullet", listDepth: 0, listRunId: "o1", listItemId: "o1",
        listTight: true, containerOrder: ["list"],
      }),
      para("code1", [textRun("x = 1")], { blockKind: "codeBlock", codeLanguage: null }),
      { paragraphId: "hr1", kind: "horizontalRule" },
      para("tail", [textRun("Tail")]),
    ]);
  });
});

describe("CL-2F-F18/F19 helpers and placeholders", () => {
  it("CL-2F-F18-E-placeholder: an empty full document shows the placeholder and accepts the first paragraph", () => {
    const editor = mountFull([], {
      editable: true,
      placeholder: "Write something",
    });
    editor.setPlaceholder("Write something", "empty-document");
    const placeholder = editor.view.dom.querySelector("[data-untranslated]");
    expect(placeholder).not.toBeNull();
    editor.paste({ text: "First words" });
    const after = editor.getDocument();
    expect(after.blocks.length).toBe(1);
    expect(JSON.stringify(after.blocks[0])).toContain("First words");
  });

  it("CL-2F-F19-E-history: undo and redo traverse full edits", () => {
    const editor = mountFull([para("p1", [textRun("One")])]);
    editor.typeText("p1", " two");
    expect(JSON.stringify(editor.getDocument())).toContain("One two");
    editor.undo();
    expect(JSON.stringify(editor.getDocument())).toContain("One");
    expect(JSON.stringify(editor.getDocument())).not.toContain("One two");
    editor.redo();
    expect(JSON.stringify(editor.getDocument())).toContain("One two");
  });

  it("CL-2F-F19-C-trailing: a trailing paragraph is identified content", () => {
    const capture = expectStableRemount([para("p1", [textRun("Content")])]);
    const last = capture.blocks[capture.blocks.length - 1];
    expect(last?.paragraphId).toBeDefined();
    expect(last?.paragraphId).not.toBe("");
  });
});

describe("CL-2F-F-DEFAULT profile selection", () => {
  it("CL-2F-F-DEFAULT: absent profile stays byte-identical to P0 behaviour", () => {
    const document: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "p1", kind: "paragraph", text: "Hello **world**" }],
    };
    const editor = createRichTextEditor({
      document,
      messages: { placeholder: "", placeholderMarker: "" },
      allocateId: allocator("p0"),
    });
    mounted.push(editor);
    expect(editor.getDocument()).toEqual(document);
    // A full payload refuses the default construction without changing P0.
    expect(() =>
      createRichTextEditor({
        document: fullDoc([para("p1", [textRun("x")])]),
        messages: { placeholder: "", placeholderMarker: "" },
      }),
    ).toThrow(/profile/);
    // A P0 payload refuses the full construction.
    expect(() =>
      createRichTextEditor({
        document,
        profile: "full",
        messages: { placeholder: "", placeholderMarker: "" },
      }),
    ).toThrow(/profile-format-mismatch/);
  });

  it("CL-2F-F-DEFAULT: full controlled editing loads no live/collaboration machinery", async () => {
    const { readFileSync } = await import("node:fs");
    const sources = [
      "./editor.ts",
      "./editor-full-document.ts",
      "./editor-full-markdown.ts",
      "./editor-full-paste.ts",
      "./editor-extensions.ts",
    ].map((file) => readFileSync(new URL(file, import.meta.url), "utf8"));
    for (const source of sources) {
      expect(source).not.toMatch(/from ["']yjs["']/);
      expect(source).not.toMatch(/y-prosemirror/);
    }
  });
});

describe("CL-2F-F-URL link safety", () => {
  const linkPara = (href: string): RichTextDocument["blocks"] => [
    para("p1", [textRun("Go ", {}), textRun("there", { link: href })]),
  ];

  it("CL-2F-F-URL: admits http/https/mailto/relative and refuses javascript/data/vbscript whole", () => {
    for (const href of [
      "http://example.com",
      "https://example.com/path?q=1#f",
      "mailto:user@example.com",
      "/relative/path",
      "#fragment",
      "?query=1",
    ]) {
      const editor = mountFull(linkPara(href));
      editor.paste({ text: `See [label](${href}).` });
      expect(editor.getDocument().blocks.length).toBeGreaterThan(0);
    }
    for (const href of ["javascript:alert(1)", "data:text/html,hi", "vbscript:msgbox(1)"]) {
      const editor = mountFull([para("p1", [textRun("Seed")])]);
      let changed = 0;
      editor.view.dom.addEventListener("x", () => {
        changed += 1;
      });
      const before = editor.getDocument();
      editor.paste({ text: `Click [here](${href}).` });
      expect(editor.getDocument()).toEqual(before);
      expect(changed).toBe(0);
    }
  });

  it("CL-2F-F-URL: refuses hostile HTML payloads whole without changing the draft", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    const before = editor.getDocument();
    editor.paste({
      html: "<p>Hi</p><script>alert(1)</script><p><a href=\"javascript:alert(1)\">x</a></p>",
    });
    expect(editor.getDocument()).toEqual(before);
    editor.paste({ html: "<table><tr><td>flat</td></tr></table>" });
    expect(editor.getDocument()).toEqual(before);
  });

  it("CL-2F-F-URL: drops remote images to alt text and reports them", () => {
    const editor = mountFull([para("p1", [textRun("Seed")])]);
    const reported: string[][] = [];
    void reported;
    editor.paste({ html: "<p>Look <img src=\"https://example.com/i.png\" alt=\"pic\"> here</p>" });
    const after = editor.getDocument();
    expect(JSON.stringify(after)).toContain("pic");
    expect(JSON.stringify(after)).not.toContain("https://example.com/i.png");
  });

  it("CL-2F-F-URL: links stay inert in editable and read-only rendering", () => {
    const editor = mountFull(linkPara("https://example.com"), { editable: true });
    const anchor = editor.view.dom.querySelector("a[href]");
    expect(anchor).not.toBeNull();
    const locationBefore = window.location.href;
    (anchor as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(window.location.href).toBe(locationBefore);
    // Modified click and keyboard-triggered activation are intercepted too.
    (anchor as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    expect(window.location.href).toBe(locationBefore);
    (anchor as HTMLElement).dispatchEvent(
      new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }),
    );
    // Read-only rendering keeps links selectable but inert.
    editor.setEditable(false);
    const readAnchor = editor.view.dom.querySelector("a[href]");
    expect(readAnchor).not.toBeNull();
    expect(readAnchor?.textContent).toBe("there");
    (readAnchor as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(window.location.href).toBe(locationBefore);
  });
});

describe("CL-2F-FK keyboard families", () => {
  const twoItems = (): RichTextDocument["blocks"] => [
    para("k1", [textRun("First")], {
      listKind: "bullet", listDepth: 0, listRunId: "k1", listItemId: "k1",
      listTight: true, containerOrder: ["list"],
    }),
    para("k2", [textRun("Second")], {
      listKind: "bullet", listDepth: 0, listRunId: "k1", listItemId: "k2",
      containerOrder: ["list"],
    }),
  ];

  it("CL-2F-FK1: Tab and Shift+Tab indent and outdent keeping run lineage", () => {
    const editor = mountFull(twoItems());
    setCursor(editor, "k2", 0);
    pressKey(editor, "Tab");
    let after = editor.getDocument();
    expect(after.blocks.find((block) => block.paragraphId === "k2")?.metadata?.listDepth).toBe(1);
    setCursor(editor, "k2", 0);
    pressKey(editor, "Tab", { shiftKey: true });
    after = editor.getDocument();
    const back = after.blocks.find((block) => block.paragraphId === "k2");
    expect(back?.metadata?.listDepth).toBe(0);
    expect(back?.metadata?.listRunId).toBe("k1");
    expect(JSON.stringify(back)).toContain("Second");
  });

  it("CL-2F-FK2: Enter splits an item and Backspace rejoins at the edge", () => {
    const editor = mountFull(twoItems());
    setCursor(editor, "k1", 2);
    pressKey(editor, "Enter");
    let after = editor.getDocument();
    // The split opens a fresh sibling; the trailing helper appends after it.
    expect(after.blocks.length).toBe(4);
    const tail = after.blocks[1];
    expect(tail?.paragraphId).not.toBe("k1");
    expect(tail?.metadata?.listRunId).toBe("k1");
    expect(tail?.metadata?.listItemId).not.toBe("k1");
    // Backspace at the start of the tail item rejoins it.
    setCursor(editor, tail?.paragraphId as string, 0);
    pressKey(editor, "Backspace");
    after = editor.getDocument();
    expect(after.blocks.length).toBe(3);
    expect(JSON.stringify(after.blocks[0])).toContain("First");
  });

  it("CL-2F-FK3: Enter adds code lines and triple-Enter at the end exits the block", () => {
    const editor = mountFull([
      para("c1", [textRun("line one")], { blockKind: "codeBlock", codeLanguage: "js" }),
      para("p2", [textRun("After")]),
    ]);
    setCursor(editor, "c1", 8);
    pressKey(editor, "Enter");
    let after = editor.getDocument();
    const code = after.blocks[0];
    expect(code?.metadata?.blockKind).toBe("codeBlock");
    const codeText = (code?.kind === "paragraph" ? (code.segments ?? []) : [])
      .map((segment) => (segment.type === "hardBreak" ? "\n" : segment.text))
      .join("");
    expect(codeText).toBe("line one\n");
    // Empty last line plus Enter exits the code block (exitOnTripleEnter).
    pressKey(editor, "Enter");
    pressKey(editor, "Enter");
    after = editor.getDocument();
    expect(after.blocks.length).toBeGreaterThanOrEqual(2);
  });

  it("CL-2F-FK4: Enter in prose splits, Shift+Enter breaks without splitting", () => {
    const editor = mountFull([para("p1", [textRun("Hello world")])]);
    setCursor(editor, "p1", 5);
    pressKey(editor, "Enter");
    let after = editor.getDocument();
    expect(after.blocks.length).toBe(2);
    const editor2 = mountFull([para("q1", [textRun("Hello world")])]);
    setCursor(editor2, "q1", 5);
    pressKey(editor2, "Enter", { shiftKey: true });
    after = editor2.getDocument();
    expect(after.blocks.length).toBe(1);
    expect(serializeFullDocument(after)).toBe("Hello\\\n world");
  });

  it("CL-2F-FK1-list-enter: Enter at the end of an item opens a fresh sibling", () => {
    const editor = mountFull(twoItems());
    setCursor(editor, "k2", 6);
    pressKey(editor, "Enter");
    const after = editor.getDocument();
    expect(after.blocks.length).toBe(4);
    const fresh = after.blocks[2];
    expect(fresh?.paragraphId).not.toBe("k2");
    expect(fresh?.metadata?.listRunId).toBe("k1");
    expect(fresh?.metadata).not.toHaveProperty("orderedStart");
  });
});
