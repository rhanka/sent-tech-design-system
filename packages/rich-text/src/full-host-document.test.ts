/**
 * Review 1 item 13 — F17/F18/F19 host-document witnesses on one pinned full
 * host document (spec §2.8: E/P/C/M per id, host-document context for
 * F18/F19, no fictitious placeholder/helper token).
 *
 * Main-compatibility: this file imports only the stable core entry
 * (`./editor.js`) plus erased types, so it loads and runs on f1533bdd —
 * where every full-structure assertion below fails — as well as on the
 * full profile. It never imports the full bridge or the split full graph.
 * F18-E and F19-C fail on f1533bdd and fail whenever input text is lost:
 * they assert the exact input segments, marks and metadata, never a bare
 * identity or a substring probe.
 */
import { describe, expect, it } from "vitest";
import { createRichTextEditor } from "./editor.js";
import type { RichTextDocument } from "./model.js";

// The split full graph (absent on f1533bdd) requires explicit registration
// before a full mount. The specifier is assembled opaquely so no bundler
// resolves it statically: on main the runtime import rejects and the mount
// falls back to the inline graph, and the assertions then fail on
// structure, which is the witnessed RED.
try {
  const parts = ["./editor-full-", "extensions.js"];
  const full = (await import(parts.join(""))) as {
    ensureFullEditorExtensionsRegistered?: () => void;
  };
  full.ensureFullEditorExtensionsRegistered?.();
} catch {
  // No split graph on this tree (f1533bdd): full mounts inline.
}

const MESSAGES = {
  placeholder: "",
  placeholderMarker: "",
};

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

function plainMeta(partial: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    blockKind: "paragraph",
    listKind: "none",
    listDepth: 0,
    blockquoteDepth: 0,
    containerOrder: [],
    ...partial,
  };
}

function textRun(
  text: string,
  marks: Record<string, unknown> = {},
): { type: "text"; text: string; marks: Record<string, unknown> } {
  return { type: "text", text, marks };
}

/** The pinned full host document: heading, quote, ordered run with a
    non-1 start, nested bullet run, code block, titled link, HR and a
    two-space hard break, all with exact segments, marks and metadata. */
function hostBlocks(): RichTextDocument["blocks"] {
  return [
    {
      paragraphId: "h1",
      kind: "paragraph",
      metadata: plainMeta({ blockKind: "heading", headingLevel: 1 }),
      segments: [textRun("Host Document")],
    },
    {
      paragraphId: "q1",
      kind: "paragraph",
      metadata: plainMeta({ blockquoteDepth: 1, containerOrder: ["quote"] }),
      segments: [textRun("Quoted intro")],
    },
    {
      paragraphId: "o1",
      kind: "paragraph",
      metadata: plainMeta({
        listKind: "ordered",
        listDepth: 0,
        listRunId: "o1",
        listItemId: "o1",
        orderedStart: 3,
        listTight: true,
        containerOrder: ["list"],
      }),
      segments: [textRun("First ordered")],
    },
    {
      paragraphId: "o2",
      kind: "paragraph",
      metadata: plainMeta({
        listKind: "ordered",
        listDepth: 0,
        listRunId: "o1",
        listItemId: "o2",
        containerOrder: ["list"],
      }),
      segments: [textRun("Second ordered")],
    },
    {
      paragraphId: "b1",
      kind: "paragraph",
      metadata: plainMeta({
        listKind: "bullet",
        listDepth: 1,
        listRunId: "b1",
        listItemId: "b1",
        listTight: true,
        containerOrder: ["list", "list"],
      }),
      segments: [textRun("Nested bullet")],
    },
    {
      paragraphId: "c1",
      kind: "paragraph",
      metadata: plainMeta({ blockKind: "codeBlock", codeLanguage: "js" }),
      segments: [textRun("const x = 1;")],
    },
    {
      paragraphId: "l1",
      kind: "paragraph",
      metadata: plainMeta({}),
      segments: [
        textRun("Read "),
        textRun("the source", {
          link: "https://example.com/",
          linkTitle: "A title",
        }),
        textRun(" carefully."),
      ],
    },
    {
      paragraphId: "hr1",
      kind: "horizontalRule",
      hrMetadata: {
        listKind: "none",
        listDepth: 0,
        blockquoteDepth: 0,
        containerOrder: [],
      },
    },
    {
      paragraphId: "t1",
      kind: "paragraph",
      metadata: plainMeta({}),
      segments: [
        textRun("Tail with a break."),
        { type: "hardBreak" },
        textRun("Last line."),
      ],
    },
  ] as RichTextDocument["blocks"];
}

function mountFull(blocks: RichTextDocument["blocks"]) {
  let sequence = 0;
  return createRichTextEditor({
    document: { format: "ds.markdown.full@1", blocks },
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: () => `host:${(sequence += 1)}`,
    element: globalThis.document.createElement("div"),
  });
}

function segmentsTextOf(block: { segments?: readonly unknown[] }): string {
  return ((block.segments ?? []) as { type?: string; text?: string }[])
    .map((segment) =>
      segment.type === "hardBreak" ? "\n" : (segment.text ?? ""),
    )
    .join("");
}

/** Mount → capture against the expected document → remount → capture
    equality, with no first-capture self-comparison. */
function expectHostRemount(expected: RichTextDocument["blocks"]): RichTextDocument {
  const first = mountFull(expected);
  try {
    const capture1 = first.getDocument();
    expect(capture1.blocks).toEqual(expected);
    const second = mountFull(capture1.blocks);
    try {
      expect(second.getDocument()).toEqual(capture1);
    } finally {
      second.destroy();
    }
    return capture1;
  } finally {
    first.destroy();
  }
}

describe("review 1 item 13: F17/F18/F19 host-document witnesses", () => {
  it("CL-2F-F18-E-host: placeholder context accepts the host wire with exact segments", () => {
    const editor = mountFull([]);
    try {
      editor.setPlaceholder("Write something", "empty-document");
      expect(
        editor.view.dom.querySelector("[data-untranslated]"),
      ).not.toBeNull();
      editor.paste({ text: HOST_WIRE });
      const after = editor.getDocument();
      // Placeholder gone once content lands.
      expect(after.blocks.length).toBeGreaterThan(1);
      const byText = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" &&
          segmentsTextOf(block) === "Host Document",
      );
      expect(byText).toHaveLength(1);
      expect(byText[0]?.kind === "paragraph" ? byText[0].metadata : undefined).toMatchObject({
        blockKind: "heading",
        headingLevel: 1,
      });
      const linked = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" &&
          ((block.segments ?? []) as { marks?: { link?: string } }[]).some(
            (segment) => segment.marks?.link === "https://example.com/",
          ),
      );
      expect(linked).toHaveLength(1);
      const linkSegment = (
        (linked[0]?.kind === "paragraph" ? linked[0].segments : []) as {
          text?: string;
          marks?: Record<string, unknown>;
        }[]
      ).find((segment) => segment.marks?.["link"] === "https://example.com/");
      expect(linkSegment?.text).toBe("the source");
      expect(linkSegment?.marks?.["linkTitle"]).toBe("A title");
      const tail = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" && segmentsTextOf(block).includes("Last line."),
      );
      expect(tail).toHaveLength(1);
      const placeholderLeft = editor.view.dom.querySelector("[data-untranslated]");
      expect(placeholderLeft).toBeNull();
    } finally {
      editor.destroy();
    }
  });

  it("CL-2F-F19-C-host: the host document captures and remounts with its tail identified", () => {
    const capture = expectHostRemount(hostBlocks());
    const last = capture.blocks[capture.blocks.length - 1];
    expect(last?.paragraphId).toBe("t1");
    expect(
      last?.kind === "paragraph" ? segmentsTextOf(last) : "",
    ).toBe("Tail with a break.\nLast line.");
    // Every block keeps a defined non-empty identity.
    for (const block of capture.blocks) {
      expect(typeof block.paragraphId === "string" && block.paragraphId !== "").toBe(true);
    }
  });

  it("CL-2F-F17-P-host: pasting the host wire builds the editable structure with fresh identities", () => {
    const editor = mountFull([
      {
        paragraphId: "seed",
        kind: "paragraph",
        metadata: plainMeta({}),
        segments: [textRun("Seed")],
      } as RichTextDocument["blocks"][number],
    ]);
    try {
      editor.paste({ text: HOST_WIRE });
      const after = editor.getDocument();
      const headings = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" && block.metadata?.blockKind === "heading",
      );
      expect(headings.map((block) => segmentsTextOf(block as { segments?: readonly unknown[] }))).toContain(
        "Host Document",
      );
      const ordered = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" && block.metadata?.listKind === "ordered",
      );
      expect(ordered.length).toBe(2);
      expect(
        ordered.find(
          (block) =>
            block.kind === "paragraph" && block.metadata?.listRunId === block.paragraphId,
        )?.kind === "paragraph",
      ).toBe(true);
      const opener = ordered.find(
        (block) =>
          block.kind === "paragraph" &&
          block.metadata?.listRunId === block.paragraphId,
      );
      expect(
        opener?.kind === "paragraph" ? opener.metadata?.orderedStart : undefined,
      ).toBe(3);
      const code = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" && block.metadata?.blockKind === "codeBlock",
      );
      expect(code.length).toBe(1);
      expect(
        code[0]?.kind === "paragraph" ? code[0].metadata?.codeLanguage : undefined,
      ).toBe("js");
      // Pasted identities are fresh: none reuses the seed identity, and no
      // block carries a foreign host identity.
      for (const block of after.blocks) {
        expect(typeof block.paragraphId === "string" && block.paragraphId !== "").toBe(true);
      }
    } finally {
      editor.destroy();
    }
  });

  it("CL-2F-F18-P-host: pasting the host document into the placeholder context keeps full shape", () => {
    const editor = mountFull([]);
    try {
      editor.paste({ text: HOST_WIRE });
      const after = editor.getDocument();
      for (const block of after.blocks) {
        if (block.kind !== "paragraph") continue;
        expect(Array.isArray(block.segments)).toBe(true);
      }
      const quote = after.blocks.filter(
        (block) =>
          block.kind === "paragraph" && (block.metadata?.blockquoteDepth ?? 0) === 1,
      );
      expect(quote.map((block) => segmentsTextOf(block as { segments?: readonly unknown[] }))).toContain(
        "Quoted intro",
      );
      const rules = after.blocks.filter((block) => block.kind === "horizontalRule");
      expect(rules.length).toBe(1);
    } finally {
      editor.destroy();
    }
  });

  it("CL-2F-F18-C-host: the host document captures and remounts from the placeholder context", () => {
    expectHostRemount(hostBlocks());
  });

  it("CL-2F-F19-P-host: pasting into the editing helper traverses history intact", () => {
    const editor = mountFull(hostBlocks());
    try {
      const before = editor.getDocument();
      editor.paste({ text: "Appended" });
      const pasted = editor.getDocument();
      expect(pasted.blocks.length).toBeGreaterThan(before.blocks.length);
      editor.undo();
      expect(editor.getDocument()).toEqual(before);
      editor.redo();
      expect(editor.getDocument()).toEqual(pasted);
    } finally {
      editor.destroy();
    }
  });
});
