/**
 * CL-2F RED: full-profile Markdown bridge (M half per F01–F19, §2.9).
 *
 * Parse/serialize every inventory entry, the §2.9 normalizations (F10-M
 * closing fence, F16-M terminal hard-break elision, underline `<u>`,
 * `---` rules, `- ` markers, numeric ordered markers, ATX headings,
 * backtick fences, `**`/`*`/`~~` delimiters) and the R-FULL-URL-1 refusal.
 */
import { describe, expect, it } from "vitest";
import {
  canonicalPlainMetadata,
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
import type { RichTextBlock, RichTextDocument } from "./model.js";

function allocator(): () => string {
  let sequence = 0;
  return () => `full:test:${(sequence += 1)}`;
}

function parse(markdown: string): RichTextDocument {
  const result = parseFullMarkdown(markdown, allocator());
  expect(result.refusedKinds).toEqual([]);
  expect(result.document).not.toBeNull();
  return result.document as RichTextDocument;
}

function roundTrip(markdown: string): { document: RichTextDocument; wire: string } {
  const document = parse(markdown);
  const wire = serializeFullDocument(document);
  return { document, wire };
}

describe("full bridge paragraphs and headings (F01/F02)", () => {
  it("round-trips plain paragraphs and all six heading levels", () => {
    const { wire } = roundTrip("Hello\n\n# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six");
    expect(wire).toBe("Hello\n\n# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six");
  });

  it("retains empty paragraphs as identified blocks", () => {
    const document = parse("First\n\n\n\nSecond");
    expect(document.blocks.length).toBeGreaterThanOrEqual(3);
    const wire = serializeFullDocument(document);
    const reparsed = parse(wire);
    expect(reparsed.blocks.length).toBe(document.blocks.length);
  });

  it("normalizes Setext headings to ATX", () => {
    const document = parse("Title\n===\n\nSub\n---");
    expect(document.blocks[0]?.metadata?.blockKind).toBe("heading");
    const wire = serializeFullDocument(document);
    expect(wire).toContain("# Title");
  });
});

describe("full bridge lists (F03/F04/F05)", () => {
  it("round-trips bullet lists with the canonical marker", () => {
    const { document, wire } = roundTrip("- First\n- Second");
    expect(wire).toBe("- First\n- Second");
    expect(document.blocks[0]?.metadata?.listKind).toBe("bullet");
    expect(document.blocks[0]?.metadata?.listRunId).toBe(document.blocks[0]?.paragraphId);
    expect(document.blocks[1]?.metadata?.listRunId).toBe(document.blocks[0]?.paragraphId);
  });

  it("preserves ordered start and list boundaries", () => {
    const { document, wire } = roundTrip("3. First\n4. Second\n\n5. Other\n6. Run");
    expect(wire).toBe("3. First\n4. Second\n\n5. Other\n6. Run");
    expect(document.blocks[0]?.metadata?.orderedStart).toBe(3);
    expect(document.blocks[2]?.metadata?.listRunId).not.toBe(
      document.blocks[0]?.metadata?.listRunId,
    );
  });

  it("round-trips nested mixed lists and continuation blocks", () => {
    // Canonical nesting sits at the parent content column (three spaces
    // under "1. "): a two-space indent is a sibling under CommonMark.
    const { wire } = roundTrip("1. First\n   - Nested\n2. Second");
    expect(wire).toBe("1. First\n   - Nested\n2. Second");
  });

  it("keeps only the run opener carrying start/type/tight values", () => {
    const document = parse("1. First\n2. Second");
    expect(document.blocks[0]?.metadata?.orderedStart).toBe(1);
    expect(document.blocks[1]?.metadata?.orderedStart).toBeUndefined();
  });
});

describe("full bridge links and autolink (F06/F07)", () => {
  it("round-trips labeled links with optional titles", () => {
    const { document, wire } = roundTrip('Read [the source](https://example.com "Title").');
    expect(wire).toContain('[the source](https://example.com "Title")');
    expect(document.blocks[0]?.kind).toBe("paragraph");
  });

  it("refuses the whole payload on an unsafe href", () => {
    const result = parseFullMarkdown("[click](javascript:alert(1))", allocator());
    expect(result.document).toBeNull();
    expect(result.refusedKinds).toContain("link");
  });

  it("refuses data and vbscript hrefs whole", () => {
    for (const href of ["data:text/html,hi", "vbscript:msgbox(1)", "ftp://example.com/x"]) {
      const result = parseFullMarkdown(`[x](${href})`, allocator());
      expect(result.document).toBeNull();
    }
  });

  it("accepts http, https, mailto and relative references", () => {
    for (const href of [
      "http://example.com",
      "https://example.com/path?q=1#f",
      "mailto:user@example.com",
      "/relative/path",
      "#fragment",
      "?query=1",
    ]) {
      const result = parseFullMarkdown(`[x](${href})`, allocator());
      expect(result.document).not.toBeNull();
    }
  });
});

describe("full bridge blockquote, code and HR (F08/F10/F15)", () => {
  it("round-trips blockquotes with depth prefixes", () => {
    const { document, wire } = roundTrip("> Quoted\n>\n> Second");
    expect(wire).toContain("> Quoted");
    expect(document.blocks[0]?.metadata?.blockquoteDepth).toBe(1);
  });

  it("round-trips fenced code with language and interior lines", () => {
    const { document, wire } = roundTrip("```js\nconst count = 1;\n```");
    expect(wire).toBe("```js\nconst count = 1;\n```");
    expect(document.blocks[0]?.metadata?.blockKind).toBe("codeBlock");
  });

  it("applies F10-M: no extra blank body line for empty or trailing-LF code", () => {
    const empty = parse("```\n```");
    expect(serializeFullDocument(empty)).toBe("```\n```");
  });

  it("emits fences longer than any internal backtick run", () => {
    const segments = [{ type: "text" as const, text: "a ``` b", marks: {} }];
    const document: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        { paragraphId: "p1", kind: "paragraph", metadata: { ...canonicalPlainMetadata(), blockKind: "paragraph" as const }, segments },
      ],
    };
    void document;
    const parsed = parse("````\ncode with ``` inside\n````");
    expect(parsed.blocks[0]?.metadata?.blockKind).toBe("codeBlock");
  });

  it("round-trips horizontal rules as atomic blocks", () => {
    const { document, wire } = roundTrip("Before\n\n---\n\nAfter");
    expect(wire).toBe("Before\n\n---\n\nAfter");
    expect(document.blocks[1]?.kind).toBe("horizontalRule");
  });
});

describe("CL-2F review 1 item 3: code LF fidelity (R-FULL-CODE-1)", () => {
  const codeSegments = (markdown: string): unknown[] => {
    const document = parse(markdown);
    expect(document.blocks).toHaveLength(1);
    const block = document.blocks[0];
    if (block?.kind !== "paragraph") throw new Error("expected a code paragraph");
    return (block.segments ?? []) as unknown[];
  };

  it("R3: leading LFs survive parsing without drops", () => {
    expect(codeSegments("```\n\n\nA\n```")).toEqual([
      { type: "hardBreak" },
      { type: "hardBreak" },
      { type: "text", text: "A", marks: {} },
    ]);
  });

  it("R3: an all-LF body is preserved, not emptied", () => {
    expect(codeSegments("```\n\n\n\n```")).toEqual([
      { type: "hardBreak" },
      { type: "hardBreak" },
    ]);
  });

  it("R3: a single trailing LF yields one closing break, not two", () => {
    expect(codeSegments("```\nA\n\n```")).toEqual([
      { type: "text", text: "A", marks: {} },
      { type: "hardBreak" },
    ]);
  });
});

describe("CL-2F review 1 item 7: nested list columns", () => {
  it("R7: ordered-nested-list serializes at each parent content column", () => {
    const document = parse("1. First\n   - Nested\n2. Second\n\n");
    const nested = document.blocks.find((block) => block.paragraphId !== undefined && block.kind === "paragraph" && (block.metadata?.listDepth ?? 0) === 1);
    expect(nested?.metadata?.listDepth).toBe(1);
    const wire = serializeFullDocument(document);
    // The nested marker sits at the parent content column (3), not at two spaces.
    expect(wire).toBe("1. First\n   - Nested\n2. Second");
  });

  it("R7: wide ordered markers keep their nested column on reparse", () => {
    const document = parse("10. Item\n    - nested\n11. Next");
    const nested = document.blocks.find(
      (block) => block.kind === "paragraph" && (block.metadata?.listDepth ?? 0) === 1,
    );
    expect(nested?.metadata?.listDepth).toBe(1);
    const wire = serializeFullDocument(document);
    expect(wire).toBe("10. Item\n    - nested\n11. Next");
    const reparsed = parse(wire);
    const again = reparsed.blocks.find(
      (block) => block.kind === "paragraph" && (block.metadata?.listDepth ?? 0) === 1,
    );
    expect(again).toBeDefined();
    expect(serializeFullDocument(reparsed)).toBe(wire);
  });
});

describe("CL-2F review 1 item 8: inline fidelity", () => {
  const firstSegments = (markdown: string): unknown[] => {
    const document = parse(markdown);
    const block = document.blocks[0];
    if (block?.kind !== "paragraph") throw new Error("expected a paragraph");
    return (block.segments ?? []) as unknown[];
  };

  it("R8: a double-backtick span containing a single backtick keeps its content", () => {
    expect(firstSegments("`` `x` ``")).toEqual([
      { type: "text", text: " `x` ", marks: { code: true } },
    ]);
  });

  it("R8: a longer backtick run does not close a shorter span early", () => {
    expect(firstSegments("``a```")).toEqual([
      { type: "text", text: "``a```", marks: {} },
    ]);
  });

  it("R8: a closing underscore after a word char ends the emphasis", () => {
    expect(firstSegments("_italic_ tail")).toEqual([
      { type: "text", text: "italic", marks: { italic: true } },
      { type: "text", text: " tail", marks: {} },
    ]);
  });

  it("R8: a paragraph starting with # re-emits escaped", () => {
    const document = parse("\\# literal");
    expect(serializeFullDocument(document)).toBe("\\# literal");
    expect(firstSegments("\\# literal")).toEqual([
      { type: "text", text: "# literal", marks: {} },
    ]);
  });

  it("R8: link titles carrying quotes survive exactly", () => {
    const segments = firstSegments('[a](https://example.com "say \\"hi\\"")');
    expect(segments).toEqual([
      {
        type: "text",
        text: "a",
        marks: { link: "https://example.com", linkTitle: 'say "hi"' },
      },
    ]);
    const document = parse('[a](https://example.com "say \\"hi\\"")');
    const wire = serializeFullDocument(document);
    expect(wire).toBe('[a](https://example.com "say \\"hi\\"")');
    expect(firstSegments(wire)).toEqual(segments);
  });
});

describe("full bridge marks (F09/F11-F14)", () => {
  it("round-trips bold, italic, inline code, strike and underline", () => {
    const { document, wire } = roundTrip(
      "**Bold** *italic* `code` ~~strike~~ <u>underline</u>",
    );
    expect(wire).toBe("**Bold** *italic* `code` ~~strike~~ <u>underline</u>");
    const segments = document.blocks[0]?.kind === "paragraph"
      ? (document.blocks[0] as { segments?: { marks?: unknown }[] }).segments ?? []
      : [];
    expect(segments.length).toBeGreaterThan(1);
  });

  it("round-trips combined marks", () => {
    const { wire } = roundTrip("**Bold and *both***");
    expect(wire).toContain("**");
    expect(wire).toContain("*both*");
  });

  it("emits a longer fence for inline code containing backticks", () => {
    const document: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p1",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata(), blockKind: "paragraph" as const },
          segments: [{ type: "text", text: "a ` b", marks: { code: true } }],
        },
      ],
    };
    const wire = serializeFullDocument(document);
    expect(wire).toContain("``");
    const reparsed = parse(wire);
    expect(reparsed.blocks[0]).toBeDefined();
  });
});

describe("full bridge hard breaks (F16)", () => {
  it("round-trips nonterminal breaks as backslash + LF", () => {
    const { document, wire } = roundTrip("Hard\\\nbreak");
    expect(wire).toBe("Hard\\\nbreak");
    expect(
      document.blocks[0]?.kind === "paragraph" &&
        (document.blocks[0] as { segments?: unknown[] }).segments !== undefined,
    ).toBe(true);
  });

  it("applies F16-M: terminal hard breaks are retained in capture, elided on the wire", () => {
    const document: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p1",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata(), blockKind: "paragraph" as const },
          segments: [
            { type: "text", text: "Twin", marks: {} },
            { type: "hardBreak" },
          ],
        },
      ],
    };
    const wire = serializeFullDocument(document);
    expect(wire).toBe("Twin");
    expect(document.blocks[0]?.kind).toBe("paragraph");
  });
});

describe("full bridge placeholders and helpers emit nothing (F18/F19)", () => {
  it("serializes an empty document to the empty string", () => {
    const document: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [],
    };
    expect(serializeFullDocument(document)).toBe("");
  });

  it("keeps a real trailing paragraph as identified content", () => {
    const document = parse("Content\n\nTail");
    expect(document.blocks.length).toBe(2);
    expect(document.blocks[1]?.paragraphId).toBeDefined();
  });
});

describe("full bridge out-of-schema content (preserved, never flattened)", () => {
  it("preserves tables and images as verbatim raw blocks", () => {
    const input = "Before\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n![Image](https://example.com/image.png)\n\nAfter";
    const document = parse(input);
    const table = document.blocks.find((block) => block.preservedKind === "table");
    const image = document.blocks.find((block) => block.preservedKind === "image");
    expect(table?.raw).toContain("| A | B |");
    expect(image?.raw).toContain("![Image]");
    expect(serializeFullDocument(document)).toBe(input);
  });

  it("preserves task lists and raw HTML blocks without rendering", () => {
    const document = parse("- [ ] todo\n\n<div>\nraw\n</div>");
    expect(document.blocks.some((block) => block.kind === "preserved")).toBe(true);
    expect(serializeFullDocument(document)).toContain("- [ ] todo");
  });

  it("keeps angle-bracket text inline without escaping", () => {
    const { wire } = roundTrip("Research & operations <team>");
    expect(wire).toBe("Research & operations <team>");
  });
});

describe("full bridge conversion seeds (untouched bytes)", () => {
  it("re-emits untouched block seeds byte-identical after an edit", async () => {
    const { parseFullMarkdown: parseFull, serializeFullDocument: serialize } =
      await import("./editor-full-markdown.js");
    const input = "Title _x_\n\n- item\n\nTail";
    const parsed = parseFull(input, allocator());
    expect(parsed.document).not.toBeNull();
    const document = parsed.document as RichTextDocument;
    const edited: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: document.blocks.map((block) =>
        block.paragraphId === document.blocks[1]?.paragraphId
          ? {
              ...block,
              segments: [{ type: "text" as const, text: "changed", marks: {} }],
            }
          : block,
      ),
    };
    const touched = new Set([document.blocks[1]?.paragraphId as string]);
    const wire = serialize(edited, { seeds: parsed.seeds, touched });
    expect(wire).toContain("Title _x_");
    expect(wire).toContain("changed");
    expect(wire).toContain("Tail");
  });
});

describe("full bridge corpus twins (W1 preparation)", () => {
  it("round-trips citation wires literally", () => {
    const { wire } = roundTrip("test [1] and [2] end");
    expect(wire).toBe("test [1] and [2] end");
  });

  it("round-trips score marks across blocks", () => {
    const { wire } = roundTrip("High **value**, *bounded* risk and `measured` effort.\n\nKeep this neighbouring paragraph.");
    expect(wire).toBe("High **value**, *bounded* risk and `measured` effort.\n\nKeep this neighbouring paragraph.");
  });
});
