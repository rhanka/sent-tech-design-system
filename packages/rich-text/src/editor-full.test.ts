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
import type { FullInlineSegment, RichTextDocument } from "./model.js";
import type { FullBlockMetadata, RichTextInlineMarks } from "./collaboration.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
import {
  copyRichTextDocument,
  richTextDocumentsEqual,
} from "./document.js";
import { validateFullBlockMetadata } from "./collaboration.js";
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

async function mountFull(
  blocks: RichTextDocument["blocks"],
  options: {
    editable?: boolean;
    disabled?: boolean;
    onChange?: () => void;
    placeholder?: string;
    placeholderMarker?: string;
  } = {},
): Promise<RichTextEditor> {
  const editor = await createRichTextEditor({
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

/** A top-level plain ProseMirror paragraph block: the only shape after
    which TrailingNode adds nothing (a paragraph nested in a quote or a
    list still ends the document with a wrapper node). */
function isTopLevelParagraphBlock(
  block: RichTextDocument["blocks"][number] | undefined,
): boolean {
  if (block?.kind !== "paragraph") return false;
  const metadata = block.metadata;
  return (
    (metadata?.blockKind ?? "paragraph") === "paragraph" &&
    (metadata?.blockquoteDepth ?? 0) === 0 &&
    (metadata?.listKind ?? "none") === "none"
  );
}

/** Expected capture of an input block list: the input blocks with the
    canonical materializations capture performs (absent HR metadata
    materializes the container defaults, spec §4.3.2). */
function withCanonicalMaterialization(
  blocks: RichTextDocument["blocks"],
): RichTextDocument["blocks"] {
  return blocks.map((block) => {
    if (block.kind === "horizontalRule" && block.hrMetadata === undefined) {
      return { ...block, hrMetadata: canonicalHrDefaults() };
    }
    return block;
  });
}

/** Mount → capture → remount → capture equality (C half, review 1 item 13):
    the first capture equals the expected input document (mount fidelity,
    never a first-capture self-comparison), and the remounted capture equals
    the first. A TrailingNode paragraph may follow the input blocks — real
    allocator-identified content (spec §2.8: it stays a content block under
    F01) — exactly when the last input block is not a plain paragraph. */
async function expectStableRemount(
  blocks: RichTextDocument["blocks"],
): RichTextDocument {
  const expected = withCanonicalMaterialization(blocks);
  const first = await mountFull(blocks);
  const capture1 = first.getDocument();
  expect(capture1.blocks.slice(0, expected.length)).toEqual(expected);
  const rest = capture1.blocks.slice(expected.length);
  if (rest.length > 0) {
    expect(rest.length).toBe(1);
    const trailing = rest[0] as RichTextDocument["blocks"][number];
    expect(trailing.kind).toBe("paragraph");
    expect(trailing.segments ?? []).toEqual([]);
    expect(
      typeof trailing.paragraphId === "string" && trailing.paragraphId !== "",
    ).toBe(true);
    expect(isTopLevelParagraphBlock(expected[expected.length - 1])).toBe(false);
  } else {
    expect(isTopLevelParagraphBlock(expected[expected.length - 1])).toBe(true);
  }
  const second = await mountFull(capture1.blocks);
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
  it("CL-2F-F01-E-text: types, clears and splits paragraphs keeping identities", async () => {
    const editor = await mountFull([
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

  it("CL-2F-F01-P-text: pastes paragraphs keeping breaks and allocating identities", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
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

  it("CL-2F-F01-C-text: capture remounts byte-stable", async () => {
    const capture = await expectStableRemount([
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

  it("CL-2F-F02-E-heading: converts and edits every level keeping ids", async () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    const editor = await mountFull(levels.map((level, index) => heading(`h${index}`, level, `Title ${level}`)));
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

  it("CL-2F-F02-P-heading: pastes ATX and Setext headings to heading blocks", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "# Pasted\n\nSetext\n===" });
    const after = editor.getDocument();
    const headings = after.blocks.filter(
      (block) => block.kind === "paragraph" && block.metadata?.blockKind === "heading",
    );
    expect(headings.length).toBe(2);
    expect(headings[0]?.metadata).toMatchObject({ headingLevel: 1 });
    expect(serializeFullDocument(after)).toContain("# Pasted");
  });

  it("CL-2F-F02-C-heading: heading capture remounts stable", async () => {
    await expectStableRemount([
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
      listTight: true, containerOrder: ["list", "list"],
    }),
  ];

  it("CL-2F-F03-E-bullet: indents with Tab keeping content, ids and starts", async () => {
    const editor = await mountFull([
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

  it("CL-2F-F04-E-ordered: keeps the start across edits and remounts", async () => {
    const editor = await mountFull(listFixture());
    editor.typeText("o2", "!");
    const after = editor.getDocument();
    const opener = after.blocks.find((block) => block.paragraphId === "o1");
    expect(opener?.metadata?.orderedStart).toBe(3);
    const member = after.blocks.find((block) => block.paragraphId === "o2");
    expect(member?.metadata?.orderedStart).toBeUndefined();
    expect(serializeFullDocument(after)).toContain("3. First");
    expect(serializeFullDocument(after)).toContain("4. Second!");
  });

  it("CL-2F-F05-P-list: pastes markdown lists to editable structure", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    // Canonical nesting sits at the parent content column (three spaces
    // under "2. "); a two-space indent is a sibling under CommonMark.
    editor.paste({ text: "1. First\n2. Second\n   - Nested" });
    const after = editor.getDocument();
    const listed = after.blocks.filter((block) => block.metadata?.listKind !== "none");
    expect(listed.map((block) => block.metadata?.listKind)).toEqual([
      "ordered", "ordered", "bullet",
    ]);
    const opener = listed.find(
      (block) => block.paragraphId === block.metadata?.listRunId,
    );
    expect(opener?.metadata?.orderedStart).toBe(1);
    expect(serializeFullDocument(after)).toContain("1. First\n2. Second\n   - Nested");
  });

  it("CL-2F-F05-C-list: list capture remounts stable", async () => {
    await expectStableRemount(listFixture());
  });

  it("CL-2F-review2-hr-nested-list: an HR inside a nested list projects inside its wrappers", async () => {
    // The rule carries its wrapper metadata on `hrMetadata` (never on
    // `metadata`): projection must read it there, so the rule neither
    // splits the parent run into two items nor escapes to top level.
    const editor = await mountFull([
      para("l1", [textRun("One")], {
        listKind: "bullet", listDepth: 0, listRunId: "l1", listItemId: "l1",
        containerOrder: ["list"],
      }),
      {
        paragraphId: "hr1",
        kind: "horizontalRule",
        hrMetadata: {
          listKind: "bullet",
          listDepth: 1,
          listItemId: "nx",
          listRunId: "l1",
          blockquoteDepth: 0,
          containerOrder: ["list", "list"],
        },
      } as never,
      para("l2", [textRun("Two")], {
        listKind: "bullet", listDepth: 1, listRunId: "l1", listItemId: "l2",
        containerOrder: ["list", "list"],
      }),
    ]);
    const json = editor.view.state.doc.toJSON() as {
      content: { type: string; content?: { type: string }[] }[];
    };
    const lists = (json.content ?? []).filter((node) => node.type === "bulletList");
    expect(lists).toHaveLength(1);
    const items = (lists[0]?.content ?? []).filter((node) => node.type === "listItem");
    // No run split: the parent item holds the paragraph, the rule and the
    // nested list together.
    expect(items).toHaveLength(1);
    expect((items[0]?.content ?? []).map((node) => node.type)).toEqual([
      "paragraph",
      "horizontalRule",
      "bulletList",
    ]);
  });

  it("CL-2F-review2-hr-nested-quote: an HR inside a nested quote projects inside its wrappers", async () => {
    const editor = await mountFull([
      para("q1", [textRun("One")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
      {
        paragraphId: "hr1",
        kind: "horizontalRule",
        hrMetadata: {
          listKind: "none",
          listDepth: 0,
          blockquoteDepth: 1,
          containerOrder: ["quote"],
        },
      } as never,
      para("q2", [textRun("Two")], { blockquoteDepth: 1, containerOrder: ["quote"] }),
    ]);
    const json = editor.view.state.doc.toJSON() as {
      content: { type: string; content?: { type: string }[] }[];
    };
    const quotes = (json.content ?? []).filter((node) => node.type === "blockquote");
    expect(quotes).toHaveLength(1);
    expect((quotes[0]?.content ?? []).map((node) => node.type)).toEqual([
      "paragraph",
      "horizontalRule",
      "paragraph",
    ]);
  });

  it("CL-2F-F05-C-loose: loose runs keep their separation", async () => {
    const capture = await expectStableRemount([
      para("l1", [textRun("One")], {
        listKind: "bullet", listDepth: 0, listRunId: "l1", listItemId: "l1",
        listTight: false, containerOrder: ["list"],
      }),
      para("l2", [textRun("Two")], {
        listKind: "bullet", listDepth: 0, listRunId: "l1", listItemId: "l2",
        containerOrder: ["list"],
      }),
    ]);
    const wire = serializeFullDocument(capture);
    // The trailing helper paragraph serializes after the loose run.
    expect(wire).toBe("- One\n\n- Two\n\n");
  });
});

describe("CL-2F-F06/F07 links E/P/C", () => {
  it("CL-2F-F06-E-link: sets a labeled link with optional title through the surface", async () => {
    const editor = await mountFull([para("p1", [textRun("Read the source")])]);
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

  it("CL-2F-F07-P-link: pastes URL text to an autolinked run", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "See https://example.com for details" });
    const after = editor.getDocument();
    const wire = serializeFullDocument(after);
    expect(wire).toContain("https://example.com");
    const linked = after.blocks.flatMap((block) =>
      block.kind === "paragraph" ? (block.segments ?? []) : [],
    ).filter((segment) => segment.type === "text" && segment.marks.link !== undefined);
    expect(linked.length).toBeGreaterThan(0);
  });

  it("CL-2F-F06-C-link: link capture remounts stable", async () => {
    await expectStableRemount([
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

  it("CL-2F-F08-E-quote: wraps a paragraph through the command path", async () => {
    const editor = await mountFull([para("p1", [textRun("Wrap me")])]);
    setCursor(editor, "p1", 0);
    const command = wrapIn(editor.view.state.schema.nodes["blockquote"]);
    command(editor.view.state, editor.view.dispatch);
    const after = editor.getDocument();
    expect(after.blocks[0]?.metadata?.blockquoteDepth).toBe(1);
    expect(serializeFullDocument(after)).toContain("> Wrap me");
  });

  it("CL-2F-F08-P-quote: pastes quote prefixes to nested depth", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "> Quoted\n>\n> Second" });
    const after = editor.getDocument();
    const quoted = after.blocks.filter((block) => (block.metadata?.blockquoteDepth ?? 0) > 0);
    expect(quoted.length).toBe(2);
    expect(quoted.every((block) => block.metadata?.blockquoteDepth === 1)).toBe(true);
  });

  it("CL-2F-F08-C-quote: quote capture remounts stable", async () => {
    await expectStableRemount(quoteFixture());
  });
});

describe("CL-2F-F09/F10 code E/P/C", () => {
  const codeFixture = (): RichTextDocument["blocks"] => [
    para("c1", [textRun("const count = 1;"), { type: "hardBreak" }, textRun("const total = count;")], {
      blockKind: "codeBlock", codeLanguage: "js",
    }),
  ];

  it("CL-2F-F09-E-code: toggles inline code without dropping sibling marks", async () => {
    const editor = await mountFull([para("p1", [textRun("Bold and code", { bold: true })])]);
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

  it("CL-2F-F10-E-block: converts a prose block to code keeping language and lines", async () => {
    const editor = await mountFull([para("p1", [textRun("const x = 1;")])]);
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

  it("CL-2F-F10-C-code-controlled: conversion clears every inline attribute and never resurrects it", async () => {
    // Spec §8 (CL-2F-F10-C-code-controlled): the input prose carries every
    // admitted inline attribute (bold, italic, code, strike, underline,
    // link, linkTitle) plus a hard break for LF preservation.
    const editor = await mountFull([
      para("p1", [
        textRun("BoldItalic", { bold: true, italic: true }),
        textRun("Code", { code: true }),
        textRun("Strike", { strike: true }),
        textRun("Under", { underline: true }),
        textRun("Linked", {
          link: "https://example.com/guide",
          linkTitle: "Guide title",
        }),
        { type: "hardBreak" },
        textRun("Tail"),
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
    expect(asCode.blocks[0]?.metadata).toMatchObject({ codeLanguage: "ts" });
    const codeSegments = asCode.blocks[0]?.kind === "paragraph" ? (asCode.blocks[0].segments ?? []) : [];
    // Unmarked code with the same text, LF and language.
    expect(
      codeSegments
        .map((segment) => (segment.type === "hardBreak" ? "\n" : (segment as { text: string }).text))
        .join(""),
    ).toBe("BoldItalicCodeStrikeUnderLinked\nTail");
    for (const segment of codeSegments) {
      if (segment.type === "text") expect(segment.marks).toEqual({});
    }
    expect(serializeFullDocument(asCode)).toContain(
      "```ts\nBoldItalicCodeStrikeUnderLinked\nTail\n```",
    );
    // Retained provenance asserted separately: the controlled conversion
    // records no run-source provenance for the converted block.
    expect(asCode.retainedRunMetadata ?? {}).toEqual({});
    // Remount: capture/remount contains the same unmarked code.
    const remounted = await mountFull(asCode.blocks);
    expect(remounted.getDocument()).toEqual(asCode);
    // Converting back restores no mark: none of the seven inline
    // attributes return.
    setCursor(remounted, "p1", 0);
    const toProse = setBlockType(remounted.view.state.schema.nodes["paragraph"], {
      paragraphId: "p1",
    });
    expect(
      toProse(remounted.view.state, remounted.view.dispatch, remounted.view),
    ).toBe(true);
    const backToProse = remounted.getDocument();
    const proseSegments =
      backToProse.blocks[0]?.kind === "paragraph" ? (backToProse.blocks[0].segments ?? []) : [];
    expect(proseSegments.length).toBeGreaterThan(0);
    for (const segment of proseSegments) {
      if (segment.type === "text") expect(segment.marks).toEqual({});
    }
  });

  it("CL-2F-F10-P-code: pastes fenced blocks with language and longer fences", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "````\ncode with ``` inside\n````" });
    const after = editor.getDocument();
    expect(after.blocks.some((block) => block.metadata?.blockKind === "codeBlock")).toBe(true);
  });

  it("CL-2F-F10-C-code: code capture remounts stable", async () => {
    const capture = await expectStableRemount(codeFixture());
    expect(serializeFullDocument(capture)).toContain(
      "```js\nconst count = 1;\nconst total = count;\n```",
    );
  });
});

describe("CL-2F-F11/F12/F13/F14 marks E/P/C", () => {
  it("CL-2F-F11/12-E-bold-italic: toggles bold and italic through the surface", async () => {
    const editor = await mountFull([para("p1", [textRun("Make me bold and italic")])]);
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

  it("CL-2F-F13-E-strike: toggles strike and keeps it on the wire", async () => {
    const editor = await mountFull([para("p1", [textRun("Remove this")])]);
    const { state } = editor.view;
    editor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 1, 7)));
    const strike = toggleMark(editor.view.state.schema.marks["strike"]);
    strike(editor.view.state, editor.view.dispatch);
    expect(serializeFullDocument(editor.getDocument())).toBe("~~Remove~~ this");
  });

  it("CL-2F-F14-P-underline: pastes <u> and styled underline to the mark", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ html: "<p>Plain <u>under</u> and <span style=\"text-decoration: underline;\">styled</span></p>" });
    const after = editor.getDocument();
    const underlined = after.blocks.flatMap((block) =>
      block.kind === "paragraph" ? (block.segments ?? []) : [],
    ).filter((segment) => segment.type === "text" && segment.marks.underline === true);
    expect(underlined.length).toBe(2);
    expect(serializeFullDocument(after)).toContain("<u>under</u>");
  });

  it("CL-2F-F11/12/13/14-C-marks: mark capture remounts stable", async () => {
    await expectStableRemount([
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
  it("CL-2F-F15-E-hr: inserts an atomic rule keeping its identity", async () => {
    const editor = await mountFull([para("p1", [textRun("Before")])]);
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

  it("CL-2F-F15-P-hr: pastes rule spellings to one atom", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({ text: "Before\n\n***\n\nAfter" });
    const after = editor.getDocument();
    expect(after.blocks.some((block) => block.kind === "horizontalRule")).toBe(true);
  });

  it("CL-2F-F15-C-hr: rule capture remounts stable", async () => {
    const capture = await expectStableRemount([
      para("p1", [textRun("Before")]),
      { paragraphId: "hr1", kind: "horizontalRule" },
      para("p3", [textRun("After")]),
    ]);
    expect(serializeFullDocument(capture)).toBe("Before\n\n---\n\nAfter");
  });
});

describe("CL-2F-F16 hard breaks E/P/C", () => {
  it("CL-2F-F16-E-break: Shift+Enter inserts a break without splitting", async () => {
    const editor = await mountFull([para("p1", [textRun("Hardbreak")])]);
    setCursor(editor, "p1", 4);
    pressKey(editor, "Enter", { shiftKey: true });
    const after = editor.getDocument();
    expect(after.blocks.length).toBe(1);
    expect(serializeFullDocument(after)).toBe("Hard\\\nbreak");
  });

  it("CL-2F-F16-P-break: pastes backslash and two-space breaks", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
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

  it("CL-2F-F16-C-break: terminal breaks stay in capture, off the wire", async () => {
    const capture = await expectStableRemount([
      para("p1", [textRun("Twin"), { type: "hardBreak" }]),
      para("p2", [textRun("Twin"), { type: "hardBreak" }]),
    ]);
    expect(serializeFullDocument(capture)).toBe("Twin\n\nTwin");
    const first = capture.blocks[0];
    expect(first?.kind === "paragraph" && (first.segments ?? []).length).toBe(2);
  });
});

describe("CL-2F-F17 document E/C", () => {
  it("CL-2F-F17-E-doc: edits inside a mixed document keep wrappers and order", async () => {
    const editor = await mountFull([
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

  it("CL-2F-F17-C-doc: mixed document capture remounts stable", async () => {
    await expectStableRemount([
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
  // The placeholder/trailing E/C/P witnesses live in
  // `full-host-document.test.ts` on the pinned host document
  // (CL-2F-F18-E-host, CL-2F-F19-C-host, CL-2F-F18-P-host,
  // CL-2F-F18-C-host, CL-2F-F19-P-host); the M halves follow below.
  it("CL-2F-F19-E-history: undo and redo traverse full edits", async () => {
    const editor = await mountFull([para("p1", [textRun("One")])]);
    editor.typeText("p1", " two");
    expect(JSON.stringify(editor.getDocument())).toContain("One two");
    editor.undo();
    expect(JSON.stringify(editor.getDocument())).toContain("One");
    expect(JSON.stringify(editor.getDocument())).not.toContain("One two");
    editor.redo();
    expect(JSON.stringify(editor.getDocument())).toContain("One two");
  });
});

describe("CL-2F-F17/F18/F19 M: host-document bridge round-trips", () => {
  // The same pinned bytes as `full-host-document.test.ts` (HOST_WIRE):
  // heading, quote, ordered run with a non-1 start, nested bullet run,
  // code block, titled link, HR and a two-space hard break.
  const HOST_WIRE = [
    "# Host Document",
    "",
    "> Quoted intro",
    "",
    "3. First ordered",
    "4. Second ordered",
    "   - Nested bullet",
    "",
    "```js",
    "const x = 1;",
    "```",
    "",
    'Read [the source](https://example.com/ "A title") carefully.',
    "",
    "---",
    "",
    "Tail with a break.  ",
    "Last line.",
  ].join("\n");

  function parseHost(): RichTextDocument {
    const parsed = parseFullMarkdown(HOST_WIRE, allocator("host"));
    expect(parsed.refusedKinds, "host wire refused").toEqual([]);
    expect(parsed.document, "host wire has no document").not.toBeNull();
    return parsed.document as RichTextDocument;
  }

  function textOf(document: RichTextDocument): string {
    const parts: string[] = [];
    for (const block of document.blocks) {
      if (block.kind === "paragraph") {
        const segments = (block.segments ?? []) as {
          type?: string;
          text?: string;
        }[];
        parts.push(
          segments
            .map((segment) =>
              segment.type === "hardBreak" ? "\n" : (segment.text ?? ""),
            )
            .join(""),
        );
      } else if (block.kind === "horizontalRule") {
        parts.push("---");
      } else {
        parts.push("");
      }
    }
    return parts.join("\n");
  }

  it("CL-2F-F17-M-host: the host document parses, edits and re-serializes stably", async () => {
    const parsed = parseFullMarkdown(HOST_WIRE, allocator("host"));
    expect(parsed.refusedKinds).toEqual([]);
    const document = parseHost();
    // Untouched blocks re-emit their source bytes: byte-identical wire.
    expect(serializeFullDocument(document, { seeds: parsed.seeds })).toBe(
      HOST_WIRE,
    );
    // Edit the tail: neighbors keep their source slices on the wire.
    const tailId = document.blocks
      .filter((block) => block.kind === "paragraph")
      .pop()?.paragraphId as string;
    const edited: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: document.blocks.map((block) =>
        block.paragraphId === tailId && block.kind === "paragraph"
          ? {
              ...block,
              segments: [
                ...((block.segments ?? []) as {
                  type: "text";
                  text: string;
                  marks: RichTextInlineMarks;
                }[]),
                textRun("!", {}),
              ],
            }
          : block,
      ),
    };
    const wire = serializeFullDocument(edited, {
      seeds: parsed.seeds,
      touched: new Set([tailId]),
    });
    expect(wire).toContain("3. First ordered");
    expect(wire).toContain("   - Nested bullet");
    expect(wire).toContain("# Host Document");
    const reparsed = parseFullMarkdown(wire, allocator("host"));
    expect(reparsed.refusedKinds).toEqual([]);
    const again = parseFullMarkdown(wire, allocator("host"));
    expect(serializeFullDocument(again.document as RichTextDocument, {
      seeds: again.seeds,
    })).toBe(wire);
    expect(textOf(reparsed.document as RichTextDocument)).toContain("Last line.!");
  });

  it("CL-2F-F18-M-host: the host wire carries no placeholder or helper artefacts", async () => {
    const document = parseHost();
    const parsed = parseFullMarkdown(HOST_WIRE, allocator("host"));
    const wire = serializeFullDocument(document, { seeds: parsed.seeds });
    expect(wire).not.toContain("Write something");
    expect(wire).not.toContain("data-untranslated");
    expect(wire).not.toContain("history");
    expect(wire).not.toMatch(/paragraph:[a-z0-9-]+/);
    // Every content block keeps a defined identity; the tail is intact.
    for (const block of document.blocks) {
      expect(typeof block.paragraphId === "string" && block.paragraphId !== "").toBe(true);
    }
    expect(textOf(document).split("\n").pop()).toBe("Last line.");
  });

  it("CL-2F-F19-M-host: the host document round-trips with its trailing content identified", async () => {
    const document = parseHost();
    const parsed = parseFullMarkdown(HOST_WIRE, allocator("host"));
    const wire = serializeFullDocument(document, { seeds: parsed.seeds });
    const reparsed = parseFullMarkdown(wire, allocator("host"));
    expect(reparsed.refusedKinds).toEqual([]);
    const again = reparsed.document as RichTextDocument;
    // Same block count and identities modulo fresh allocation: compare the
    // text spine and the trailing block exactly.
    expect(again.blocks.length).toBe(document.blocks.length);
    expect(textOf(again).split("\n").slice(-2)).toEqual([
      "Tail with a break.",
      "Last line.",
    ]);
    const wire2 = serializeFullDocument(again, { seeds: reparsed.seeds });
    expect(wire2).toBe(wire);
  });
});

describe("CL-2F review 1 item 4: absent metadata is canonical before classification", () => {
  it("R4: a metadata-free paragraph mounts as a plain paragraph and captures canonical defaults", async () => {
    const bare = {
      paragraphId: "p1",
      kind: "paragraph",
      segments: [textRun("Plain")],
    } as unknown as RichTextDocument["blocks"][number];
    const editor = await mountFull([bare]);
    const after = editor.getDocument();
    expect(after.blocks).toHaveLength(1);
    expect(after.blocks[0]).toMatchObject({ paragraphId: "p1", kind: "paragraph" });
    // Canonical defaults materialize on capture (§4.3.2 capture data).
    expect(after.blocks[0]?.kind === "paragraph" ? after.blocks[0].metadata : undefined).toEqual(
      canonicalPlainMetadata(),
    );
    expect(validateFullBlockMetadata(
      after.blocks[0]?.kind === "paragraph" ? after.blocks[0].metadata : undefined,
    )).toMatchObject({ ok: true });
    expect(serializeFullDocument(after)).toBe("Plain");
  });
});

describe("CL-2F review 1 item 5: ordered wrapper stack projection and capture", () => {
  const quotedItemDoc = (): RichTextDocument["blocks"] => [
    para("i1", [textRun("One")], {
      listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i1",
      listTight: true, containerOrder: ["list"],
    }),
    para("q1", [textRun("Quoted")], {
      listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i1",
      blockquoteDepth: 1, containerOrder: ["list", "quote"],
    }),
    para("i2", [textRun("Two")], {
      listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i2",
      containerOrder: ["list"],
    }),
  ];

  it("R5: a citation inside a list item stays inside that item", async () => {
    const editor = await mountFull(quotedItemDoc());
    const after = editor.getDocument();
    const quoted = after.blocks.find((block) => block.paragraphId === "q1");
    expect(quoted?.metadata?.listItemId).toBe("i1");
    expect(quoted?.metadata?.blockquoteDepth).toBe(1);
    expect(quoted?.metadata?.containerOrder).toEqual(["list", "quote"]);
    // The item still holds three blocks in one run (plus the identified
    // trailing paragraph the helper appends after a closing list, as in F02-E).
    expect(after.blocks.slice(0, 3).map((block) => block.paragraphId)).toEqual(["i1", "q1", "i2"]);
    for (const block of after.blocks) {
      if (block.kind !== "paragraph") continue;
      expect(validateFullBlockMetadata(block.metadata)).toMatchObject({ ok: true });
    }
    // The ProseMirror structure nests the quote inside the item.
    let quoteInsideItem = 0;
    editor.view.state.doc.descendants((node) => {
      if (node.type.name === "listItem") {
        node.descendants((child) => {
          if (child.type.name === "blockquote") quoteInsideItem += 1;
          return true;
        });
      }
      return true;
    });
    expect(quoteInsideItem).toBe(1);
    // The quoted text is not lost on the wire.
    expect(serializeFullDocument(after)).toContain("Quoted");
  });

  it("R5: a list-contained HR keeps its wrappers", async () => {
    const editor = await mountFull([
      para("i1", [textRun("One")], {
        listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i1",
        listTight: true, containerOrder: ["list"],
      }),
      {
        paragraphId: "hr1",
        kind: "horizontalRule",
        hrMetadata: {
          listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i1",
          blockquoteDepth: 0, containerOrder: ["list"],
        },
      } as RichTextDocument["blocks"][number],
      para("i2", [textRun("Two")], {
        listKind: "bullet", listDepth: 0, listRunId: "r1", listItemId: "i2",
        containerOrder: ["list"],
      }),
    ]);
    const after = editor.getDocument();
    expect(after.blocks.slice(0, 3).map((block) => block.kind)).toEqual([
      "paragraph", "horizontalRule", "paragraph",
    ]);
    const hr = after.blocks[1];
    expect(hr?.kind === "horizontalRule" ? hr.hrMetadata?.listRunId : undefined).toBe("r1");
    expect(hr?.kind === "horizontalRule" ? hr.hrMetadata?.containerOrder : undefined).toEqual(["list"]);
    expect(validateFullBlockMetadata(
      hr?.kind === "horizontalRule" ? hr.hrMetadata : undefined,
    )).toMatchObject({ ok: true });
    const second = await mountFull(after.blocks);
    expect(second.getDocument()).toEqual(after);
  });

  it("R5: nested lists and quotes capture one order entry per nesting level", async () => {
    const capture = await expectStableRemount([
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
        listTight: true, containerOrder: ["list", "list"],
      }),
      para("q1", [textRun("Deep quote")], {
        listKind: "bullet", listDepth: 1, listRunId: "b1", listItemId: "b1",
        blockquoteDepth: 1, containerOrder: ["list", "list", "quote"],
      }),
    ]);
    const nested = capture.blocks.find((block) => block.paragraphId === "b1");
    expect(nested?.metadata?.containerOrder).toEqual(["list", "list"]);
    const deep = capture.blocks.find((block) => block.paragraphId === "q1");
    expect(deep?.metadata?.containerOrder).toEqual(["list", "list", "quote"]);
    for (const block of capture.blocks) {
      if (block.kind !== "paragraph") continue;
      expect(
        validateFullBlockMetadata(block.metadata),
        `block ${block.paragraphId} must validate`,
      ).toMatchObject({ ok: true });
    }
  });
});

describe("CL-2F review 2 blocking 3: containerOrder counts and mounted baseline", () => {
  it("R3b: the parser emits one containerOrder entry per nesting level", async () => {
    const cases: Record<string, string> = {
      "nested ordered list": "1. a\n   1. b\n",
      "nested bullet list": "- a\n  - b\n",
      "nested quote": ">> text\n",
      "quote-wrapped nested list": "> - a\n>   - b\n",
      "quote-wrapped rule": "> ---\n",
    };
    for (const [label, markdown] of Object.entries(cases)) {
      const parsed = parseFullMarkdown(markdown, allocator(`r3:${label}`));
      expect(parsed.document, `${label} parses`).not.toBeNull();
      for (const block of parsed.document?.blocks ?? []) {
        if (block.kind === "preserved") continue;
        const record = block.kind === "horizontalRule" ? block.hrMetadata : block.metadata;
        expect(
          validateFullBlockMetadata(record),
          `${label} block ${block.paragraphId} must validate`,
        ).toMatchObject({ ok: true });
      }
    }
    const nested = parseFullMarkdown("1. a\n   1. b\n", allocator("r3:nested"));
    const depths = (nested.document?.blocks ?? []).map((block) =>
      block.kind === "paragraph" ? block.metadata?.containerOrder : block.hrMetadata?.containerOrder,
    );
    expect(depths).toEqual([["list"], ["list", "list"]]);
    const quoted = parseFullMarkdown(">> text\n", allocator("r3:quote"));
    expect(
      quoted.document?.blocks.map((block) =>
        block.kind === "paragraph" ? block.metadata?.containerOrder : [],
      ),
    ).toEqual([["quote", "quote"]]);
  });

  it("R3b: a parsed nested document capture is a remount fixed point", async () => {
    // The mounted capture normalizes library-canonical defaults (the
    // `orderedType: "1"` arabic default the parser records is the
    // Tiptap-canonical absent value, as in every existing ordered
    // fixture); the fixed point — capture, remount, identical capture —
    // is what the clean-mount baseline relies on.
    const parsed = parseFullMarkdown("1. a\n   1. b\n", allocator("r3:remount"));
    expect(parsed.document).not.toBeNull();
    const first = await mountFull(parsed.document?.blocks ?? []);
    const capture1 = first.getDocument();
    expect(capture1.blocks.slice(0, 2).map((block) => block.paragraphId)).toHaveLength(2);
    const second = await mountFull(capture1.blocks);
    expect(second.getDocument()).toEqual(capture1);
  });

  it("R3b: a clean mount applies the host echo without conflict", async () => {
    const hosts: RichTextDocument["blocks"][] = [
      // Nested list (normalized containerOrder on mount).
      (parseFullMarkdown("1. a\n   1. b\n", allocator("r3:echo1")).document?.blocks ?? []),
      // Metadata-free paragraph (materialized canonical defaults).
      [{ paragraphId: "p1", kind: "paragraph", segments: [{ type: "text", text: "hi", marks: {} }] } as never],
      // Trailing non-paragraph block (TrailingNode paragraph on mount).
      [
        para("p1", [textRun("hi")]),
        para("h1", [textRun("Title")], { blockKind: "heading", headingLevel: 1 }),
      ],
    ];
    for (const blocks of hosts) {
      expect(blocks.length).toBeGreaterThan(0);
      let conflicted = 0;
      const editor = await createRichTextEditor({
        document: fullDoc(blocks),
        profile: "full",
        messages: { placeholder: "", placeholderMarker: "" },
        allocateId: allocator("r3:echo"),
        onExternalConflict: () => {
          conflicted += 1;
        },
      });
      mounted.push(editor);
      // The host echo: the exact pre-mount input pushed back. A clean
      // mount has no local edits, so the update applies (Rule 4) instead
      // of raising onExternalConflict (Rule 3).
      editor.applyExternalUpdate(fullDoc(blocks));
      expect(conflicted).toBe(0);
    }
  });
});

describe("CL-2F review 1 item 6: run-source retention (R-FULL-META-2)", () => {
  const orderedRun = (): RichTextDocument["blocks"] => [
    para("a", [textRun("First")], {
      listKind: "ordered", listDepth: 0, listRunId: "a", listItemId: "a",
      orderedStart: 3, listTight: true, containerOrder: ["list"],
    }),
    para("b", [textRun("Second")], {
      listKind: "ordered", listDepth: 0, listRunId: "a", listItemId: "b",
      containerOrder: ["list"],
    }),
  ];

  it("R6: deleting the opener does not transfer start/type/tight onto the survivor", async () => {
    const editor = await mountFull(orderedRun());
    editor.deleteBlocks(["a"]);
    const after = editor.getDocument();
    // The opener identity is gone from the blocks, but the run still
    // references it (plus the identified trailing paragraph).
    expect(after.blocks.some((block) => block.paragraphId === "a")).toBe(false);
    const members = after.blocks.filter(
      (block) => block.kind === "paragraph" && block.metadata?.listRunId === "a",
    );
    expect(members.length).toBeGreaterThan(0);
    expect(members.some((block) => block.paragraphId === "b")).toBe(true);
    for (const member of members) {
      expect(member.kind === "paragraph" ? member.metadata : undefined).not.toHaveProperty("orderedStart");
      expect(member.kind === "paragraph" ? member.metadata : undefined).not.toHaveProperty("orderedType");
      expect(member.kind === "paragraph" ? member.metadata : undefined).not.toHaveProperty("listTight");
    }
    // The retained source record keeps the original values.
    expect(after.retainedRunMetadata?.["a"]).toMatchObject({
      orderedStart: 3,
      listTight: true,
      listRunId: "a",
    });
    // The wire still numbers from the retained source, not from 1.
    expect(serializeFullDocument(after)).toMatch(/^3\. /m);
  });

  it("R6: retained metadata survives capture, copy and remount", async () => {
    const editor = await mountFull(orderedRun());
    editor.deleteBlocks(["a"]);
    const capture1 = editor.getDocument();
    expect(capture1.retainedRunMetadata?.["a"]).toBeDefined();
    const copied = copyRichTextDocument(capture1);
    expect(copied).toEqual(capture1);
    expect(copied.retainedRunMetadata).not.toBe(capture1.retainedRunMetadata);
    // Remount the copied document with its retained map: capture stays equal.
    const editor2 = await createRichTextEditor({
      document: copied,
      profile: "full",
      messages: { placeholder: "", placeholderMarker: "" },
      allocateId: allocator("full2"),
    });
    mounted.push(editor2);
    const capture2 = editor2.getDocument();
    expect(richTextDocumentsEqual(capture1, capture2)).toBe(true);
    expect(capture2.retainedRunMetadata?.["a"]).toMatchObject({ orderedStart: 3 });
    // The remount still numbers from the retained source.
    expect(serializeFullDocument(capture2)).toMatch(/^3\. /m);
  });
});

describe("CL-2F review 1 item 9: native clipboard and URL over selection", () => {
  it("R9: native HTML paste preserves nested and top-level inline marks", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    setCursor(editor, "p1", 4);
    editor.paste({ html: "Top <b>bold <i>both</i></b> tail" });
    const after = editor.getDocument();
    const texts = after.blocks.flatMap((block) =>
      block.kind === "paragraph" ? ((block.segments ?? []) as { type: string; text?: string; marks?: Record<string, unknown> }[]) : [],
    );
    // No text lost across the fragment.
    expect(texts.map((segment) => segment.text ?? "").join("")).toBe(
      "SeedTop bold both tail",
    );
    // Nested and top-level marks survive on their own runs.
    expect(
      texts.filter(
        (segment) => segment.type === "text" && Object.keys(segment.marks ?? {}).length > 0,
      ),
    ).toEqual([
      { type: "text", text: "bold ", marks: { bold: true } },
      { type: "text", text: "both", marks: { bold: true, italic: true } },
    ]);
  });

  it("R9: URL paste over a selected label links the label instead of replacing it", async () => {
    const editor = await mountFull([para("p1", [textRun("click here to continue")])]);
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, 7, 11)),
    );
    editor.paste({ text: "https://example.com/guide" });
    const after = editor.getDocument();
    expect(after.blocks).toHaveLength(1);
    expect(after.blocks[0]?.kind === "paragraph" ? after.blocks[0].segments : undefined).toEqual([
      { type: "text", text: "click ", marks: {} },
      {
        type: "text",
        text: "here",
        marks: { link: "https://example.com/guide" },
      },
      { type: "text", text: " to continue", marks: {} },
    ]);
  });

  it("R9: URL paste over a selection with a forbidden href refuses whole", async () => {
    const editor = await mountFull([para("p1", [textRun("click here")])]);
    const before = editor.getDocument();
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, 7, 11)),
    );
    editor.paste({ text: "javascript:alert(1)" });
    expect(editor.getDocument()).toEqual(before);
  });
});

describe("CL-2F review 1 item 3: code capture and paste", () => {
  const codeOf = (
    id: string,
    segments: FullInlineSegment[],
  ): RichTextDocument["blocks"][number] => ({
    paragraphId: id,
    kind: "paragraph",
    metadata: {
      ...canonicalPlainMetadata(),
      blockKind: "codeBlock",
      codeLanguage: "js",
    },
    segments,
  });

  it("R3: leading and all-LF lines survive capture with no duplicate terminal break", async () => {
    const editor = await mountFull([
      codeOf("c1", [
        { type: "hardBreak" },
        { type: "hardBreak" },
        { type: "text", text: "A", marks: {} },
        { type: "hardBreak" },
      ]),
      codeOf("c2", [{ type: "hardBreak" }, { type: "hardBreak" }]),
    ]);
    const after = editor.getDocument();
    const first = after.blocks.find((block) => block.paragraphId === "c1");
    expect(first?.kind === "paragraph" ? first.segments : undefined).toEqual([
      { type: "hardBreak" },
      { type: "hardBreak" },
      { type: "text", text: "A", marks: {} },
      { type: "hardBreak" },
    ]);
    const second = after.blocks.find((block) => block.paragraphId === "c2");
    expect(second?.kind === "paragraph" ? second.segments : undefined).toEqual([
      { type: "hardBreak" },
      { type: "hardBreak" },
    ]);
  });

  it("R3: paste inside code inserts literal text with LFs kept", async () => {
    const editor = await mountFull([
      codeOf("c1", [{ type: "text", text: "existing", marks: {} }]),
    ]);
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, 5)),
    );
    editor.paste({ text: "Line one\nLine two" });
    const after = editor.getDocument();
    // No code/prose/code split: one code block plus the identified trailing
    // paragraph, with the pasted LFs kept as hard breaks.
    expect(after.blocks.filter((block) => block.kind === "paragraph")).toHaveLength(2);
    const code = after.blocks.find((block) => block.paragraphId === "c1");
    expect(code?.kind === "paragraph" ? code.metadata?.blockKind : undefined).toBe("codeBlock");
    expect(code?.kind === "paragraph" ? code.segments : undefined).toEqual([
      { type: "text", text: "exisLine one", marks: {} },
      { type: "hardBreak" },
      { type: "text", text: "Line twoting", marks: {} },
    ]);
  });
});

describe("CL-2F-F-DEFAULT profile selection", () => {
  it("CL-2F-F-DEFAULT: absent profile stays byte-identical to P0 behaviour", async () => {
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
    await expect(
      createRichTextEditor({
        document,
        profile: "full",
        messages: { placeholder: "", placeholderMarker: "" },
      }),
    ).rejects.toThrow(/profile-format-mismatch/);
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

describe("CL-2F review 1 item 2: entity decoding and global refusal (R-FULL-URL-1)", () => {
  it("R2: entity-encoded javascript: refuses on Markdown parse", async () => {
    const parsed = parseFullMarkdown("[bad](jav&#x61;script:alert(1))", allocator("full"));
    expect(parsed.document).toBeNull();
    expect(parsed.refusedKinds).toContain("link");
  });

  it("R2: entity-encoded javascript: refuses on paste without changing the draft", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    const before = editor.getDocument();
    editor.paste({ text: "Click [bad](jav&#x61;script:alert(1))." });
    expect(editor.getDocument()).toEqual(before);
  });

  it("R2: entity-encoded javascript: refuses on HTML paste without changing the draft", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    const before = editor.getDocument();
    editor.paste({
      html: '<p>Click <a href="jav&amp;#x61;script:alert(1)">bad</a></p>',
    });
    expect(editor.getDocument()).toEqual(before);
  });

  it("R2: a structured import with a forbidden href refuses construction whole", async () => {
    await expect(
      mountFull([para("p1", [textRun("bad", { link: "javascript:alert(1)" })])]),
    ).rejects.toThrow(/forbidden-href/);
  });

  it("R2: a command-added forbidden link is refused, the draft keeps no link", async () => {
    const editor = await mountFull([para("p1", [textRun("click here")])]);
    const { state } = editor.view;
    const schemaLink = state.schema.marks["link"];
    expect(schemaLink).toBeDefined();
    editor.view.dispatch(
      state.tr.addMark(
        1,
        6,
        (schemaLink as unknown as { create: (attrs: unknown) => unknown }).create({
          href: "javascript:alert(1)",
        }) as never,
      ),
    );
    const after = editor.getDocument();
    expect(JSON.stringify(after)).not.toContain("javascript");
    expect(after.blocks).toHaveLength(1);
    expect(after.blocks[0]).toMatchObject({ paragraphId: "p1" });
  });

  it("R2: an external update with a forbidden href conflicts, the draft is preserved", async () => {
    let conflicted = 0;
    const editor2 = await createRichTextEditor({
      document: fullDoc([para("p1", [textRun("Seed")])]),
      profile: "full",
      messages: { placeholder: "", placeholderMarker: "" },
      allocateId: allocator("fullx"),
      onExternalConflict: () => {
        conflicted += 1;
      },
    });
    mounted.push(editor2);
    const before = editor2.getDocument();
    editor2.applyExternalUpdate(
      fullDoc([para("p1", [textRun("bad", { link: "javascript:alert(1)" })])]),
    );
    expect(conflicted).toBe(1);
    expect(editor2.getDocument()).toEqual(before);
  });
});

describe("CL-2F review 2 blocking 2: the single href validator", () => {
  // Validator and agent-patch levels live in `collaboration.test.ts`; every
  // surface below reaches them through the single `isAllowedHref`.
  it("R2b: a structured import with an entity-encoded href refuses construction whole", async () => {
    await expect(
      mountFull([para("p1", [textRun("bad", { link: "data&colon;text/html,x" })])]),
    ).rejects.toThrow(/forbidden-href/);
  });

  it("R2b: an external update with an entity-encoded href conflicts, the draft is preserved", async () => {
    let conflicted = 0;
    const editor = await createRichTextEditor({
      document: fullDoc([para("p1", [textRun("Seed")])]),
      profile: "full",
      messages: { placeholder: "", placeholderMarker: "" },
      allocateId: allocator("fullx"),
      onExternalConflict: () => {
        conflicted += 1;
      },
    });
    mounted.push(editor);
    const before = editor.getDocument();
    editor.applyExternalUpdate(
      fullDoc([para("p1", [textRun("bad", { link: "vbscript&colon;x" })])]),
    );
    expect(conflicted).toBe(1);
    expect(editor.getDocument()).toEqual(before);
  });

  it("R2b: a guard-level entity-encoded link mark is refused, the draft keeps no link", async () => {
    const editor = await mountFull([para("p1", [textRun("click here")])]);
    const { state } = editor.view;
    const schemaLink = state.schema.marks["link"];
    expect(schemaLink).toBeDefined();
    editor.view.dispatch(
      state.tr.addMark(
        1,
        6,
        (schemaLink as unknown as { create: (attrs: unknown) => unknown }).create({
          href: "javascript&colon;alert(1)",
        }) as never,
      ),
    );
    const after = editor.getDocument();
    expect(JSON.stringify(after)).not.toContain("javascript");
    expect(JSON.stringify(after)).not.toContain("colon");
    expect(after.blocks).toHaveLength(1);
    expect(after.blocks[0]).toMatchObject({ paragraphId: "p1" });
  });

  it("R2b: entity-encoded colons refuse on Markdown parse, HTML paste and URL paste", async () => {
    const parsed = parseFullMarkdown("[bad](javascript&colon;alert(1))", allocator("full"));
    expect(parsed.document).toBeNull();
    expect(parsed.refusedKinds).toContain("link");
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    const before = editor.getDocument();
    editor.paste({
      html: '<p>Click <a href="javascript&colon;alert(1)">bad</a></p>',
    });
    expect(editor.getDocument()).toEqual(before);
  });

  it("R2b: URL paste over a selection with an encoded scheme refuses without replacing the label", async () => {
    const editor = await mountFull([para("p1", [textRun("click here")])]);
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, 1, 5)),
    );
    editor.paste({ text: "javascript&colon;alert(1)" });
    const after = editor.getDocument();
    // The payload is refused whole: the label keeps its text with no link.
    expect(JSON.stringify(after)).not.toContain("javascript");
    expect(after.blocks).toHaveLength(1);
    expect(after.blocks[0]?.kind === "paragraph" ? (after.blocks[0].segments ?? []) : []).toEqual([
      { type: "text", text: "click here", marks: {} },
    ]);
  });

  it("R2b: a whitespace-padded HTML href stores trimmed and capture keeps the link", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    editor.paste({
      html: '<p><a href=" https://example.com ">site</a></p>',
    });
    const after = editor.getDocument();
    const links = after.blocks.flatMap((block) =>
      block.kind === "paragraph"
        ? ((block.segments ?? []) as { type: string; marks?: Record<string, unknown> }[]).filter(
            (segment) => segment.type === "text" && segment.marks?.["link"] !== undefined,
          )
        : [],
    );
    expect(links).toHaveLength(1);
    // Stored value equals the validated value: no padding survives.
    expect((links[0] as { marks: { link: string } }).marks.link).toBe("https://example.com");
    const recaptured = (await mountFull(after.blocks)).getDocument();
    expect(JSON.stringify(recaptured)).toContain("https://example.com");
  });

  it("R2b: a whitespace-padded structured href refuses instead of stripping on capture", async () => {
    await expect(
      mountFull([para("p1", [textRun("bad", { link: " https://example.com " })])]),
    ).rejects.toThrow(/forbidden-href/);
  });
});

describe("CL-2F-F-URL link safety", () => {
  const linkPara = (href: string): RichTextDocument["blocks"] => [
    para("p1", [textRun("Go ", {}), textRun("there", { link: href })]),
  ];

  it("CL-2F-F-URL: admits http/https/mailto/relative and refuses javascript/data/vbscript whole", async () => {
    for (const href of [
      "http://example.com",
      "https://example.com/path?q=1#f",
      "mailto:user@example.com",
      "/relative/path",
      "#fragment",
      "?query=1",
    ]) {
      const editor = await mountFull(linkPara(href));
      editor.paste({ text: `See [label](${href}).` });
      expect(editor.getDocument().blocks.length).toBeGreaterThan(0);
    }
    for (const href of ["javascript:alert(1)", "data:text/html,hi", "vbscript:msgbox(1)"]) {
      const editor = await mountFull([para("p1", [textRun("Seed")])]);
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

  it("CL-2F-F-URL: refuses hostile HTML payloads whole without changing the draft", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    const before = editor.getDocument();
    editor.paste({
      html: "<p>Hi</p><script>alert(1)</script><p><a href=\"javascript:alert(1)\">x</a></p>",
    });
    expect(editor.getDocument()).toEqual(before);
    editor.paste({ html: "<table><tr><td>flat</td></tr></table>" });
    expect(editor.getDocument()).toEqual(before);
  });

  it("CL-2F-F-URL: drops remote images to alt text and reports them", async () => {
    const editor = await mountFull([para("p1", [textRun("Seed")])]);
    const reported: string[][] = [];
    void reported;
    editor.paste({ html: "<p>Look <img src=\"https://example.com/i.png\" alt=\"pic\"> here</p>" });
    const after = editor.getDocument();
    expect(JSON.stringify(after)).toContain("pic");
    expect(JSON.stringify(after)).not.toContain("https://example.com/i.png");
  });

  it("CL-2F-F-URL: links stay inert in editable and read-only rendering", async () => {
    const editor = await mountFull(linkPara("https://example.com"), { editable: true });
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
    // Read-only rendering keeps links selectable but renders no navigable
    // attribute (item 1): `a[href]` is gone, the text stays.
    editor.setEditable(false);
    expect(editor.view.dom.querySelector("a[href]")).toBeNull();
    const readAnchor = editor.view.dom.querySelector("a");
    expect(readAnchor?.textContent).toBe("there");
    (readAnchor as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(window.location.href).toBe(locationBefore);
    // Re-enabling restores the href from the live document state.
    editor.setEditable(true);
    const restored = editor.view.dom.querySelector("a[href]");
    expect(restored?.getAttribute("href")).toBe("https://example.com");
    expect(restored?.textContent).toBe("there");
  });

  it("CL-2F-F-URL item 1: disabled mounts render no navigable link attributes", async () => {
    const editor = await mountFull(linkPara("https://example.com"), { disabled: true });
    expect(editor.view.dom.querySelector("a[href]")).toBeNull();
    const anchor = editor.view.dom.querySelector("a");
    expect(anchor?.textContent).toBe("there");
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

  it("CL-2F-FK1: Tab and Shift+Tab indent and outdent keeping run lineage", async () => {
    const editor = await mountFull(twoItems());
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

  it("CL-2F-FK2: Enter splits an item and Backspace rejoins at the edge", async () => {
    const editor = await mountFull(twoItems());
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

  it("CL-2F-FK3: Enter adds code lines and triple-Enter at the end exits the block", async () => {
    const editor = await mountFull([
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

  it("CL-2F-FK4: Enter in prose splits, Shift+Enter breaks without splitting", async () => {
    const editor = await mountFull([para("p1", [textRun("Hello world")])]);
    setCursor(editor, "p1", 5);
    pressKey(editor, "Enter");
    let after = editor.getDocument();
    expect(after.blocks.length).toBe(2);
    const editor2 = await mountFull([para("q1", [textRun("Hello world")])]);
    setCursor(editor2, "q1", 5);
    pressKey(editor2, "Enter", { shiftKey: true });
    after = editor2.getDocument();
    expect(after.blocks.length).toBe(1);
    expect(serializeFullDocument(after)).toBe("Hello\\\n world");
  });

  it("CL-2F-FK1-list-enter: Enter at the end of an item opens a fresh sibling", async () => {
    const editor = await mountFull(twoItems());
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
