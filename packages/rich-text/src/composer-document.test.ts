/**
 * CL-2 RED: controlled string conversion for the §6.2.1 composer surface.
 *
 * Pure text ↔ document mapping over the P0 profile: blank-line runs split
 * paragraphs, single newlines stay inside the chunk, identities are fresh
 * from the injected allocator and never derived from content.
 */
import { describe, expect, it } from "vitest";
import {
  composerDocumentFromText,
  composerTextFromDocument,
  joinComposerText,
  splitComposerText,
} from "./composer-document.js";

function allocator(): () => string {
  let sequence = 0;
  return () => `test:composer:${(sequence += 1)}`;
}

describe("composer string split/join (CL-2 witness 7, conversion half)", () => {
  it("splits blank-line runs and keeps single newlines inside the chunk", () => {
    expect(splitComposerText("")).toEqual([""]);
    expect(splitComposerText("hello")).toEqual(["hello"]);
    expect(splitComposerText("a\nb")).toEqual(["a\nb"]);
    expect(splitComposerText("a\n\nb")).toEqual(["a", "b"]);
    expect(splitComposerText("a\n\n\n\nb")).toEqual(["a", "", "b"]);
    expect(splitComposerText("\n\nb")).toEqual(["", "b"]);
    expect(splitComposerText("a\n\n")).toEqual(["a", ""]);
  });

  it("joins chunks with a single blank line", () => {
    expect(joinComposerText([])).toBe("");
    expect(joinComposerText([""])).toBe("");
    expect(joinComposerText(["a", "b"])).toBe("a\n\nb");
    expect(joinComposerText(["a\nb", "c"])).toBe("a\nb\n\nc");
  });

  it("round-trips canonical strings byte-identically", () => {
    for (const text of [
      "",
      "hello",
      "a\nb",
      "a\n\nb",
      "first\n\nsecond\n\nthird",
      "trailing  spaces  ",
    ]) {
      const document = composerDocumentFromText(text, allocator());
      expect(composerTextFromDocument(document)).toBe(text);
    }
  });

  it("preserves separator multiplicity on exact blank-line boundaries (P2)", () => {
    expect(splitComposerText("a\n\n\n\nb")).toEqual(["a", "", "b"]);
    expect(splitComposerText("a\n\n\nb")).toEqual(["a", "\nb"]);
    expect(splitComposerText("\n\nb")).toEqual(["", "b"]);
    expect(splitComposerText("a\n\n")).toEqual(["a", ""]);
    expect(splitComposerText("\n\n")).toEqual(["", ""]);
    expect(splitComposerText("\n\n\n")).toEqual(["", "\n"]);
  });

  it("round-trips noncanonical runs byte-identically (leading/trailing/odd)", () => {
    for (const text of [
      "a\n\n\n\nb",
      "a\n\n\nb",
      "\n\nb",
      "a\n\n",
      "\n\n",
      "\n\n\n",
      "\n\n\n\n",
      "a\n\n\n\n\nb",
      "\n\na\n\n",
    ]) {
      const document = composerDocumentFromText(text, allocator());
      expect(composerTextFromDocument(document)).toBe(text);
    }
  });
});

describe("composer document shape (CL-2 witness 7, conversion half)", () => {
  it("maps every chunk to one paragraph with a fresh identity and exact keys", () => {
    const document = composerDocumentFromText("a\n\nb", allocator());
    expect(document.format).toBe("focus.markdown.p0@1");
    expect(document.blocks).toHaveLength(2);
    expect(document.blocks[0]).toEqual({
      paragraphId: "test:composer:1",
      kind: "paragraph",
      text: "a",
    });
    expect(document.blocks[1]).toEqual({
      paragraphId: "test:composer:2",
      kind: "paragraph",
      text: "b",
    });
  });

  it("mounts an empty string as one empty paragraph", () => {
    const document = composerDocumentFromText("", allocator());
    expect(document.blocks).toEqual([
      { paragraphId: "test:composer:1", kind: "paragraph", text: "" },
    ]);
  });

  it("reads preserved raws verbatim when joining", () => {
    expect(
      composerTextFromDocument({
        format: "focus.markdown.p0@1",
        blocks: [
          { paragraphId: "p:1", kind: "paragraph", text: "a" },
          { paragraphId: "p:2", kind: "preserved", preservedKind: "table", raw: "| a |" },
        ],
      }),
    ).toBe("a\n\n| a |");
  });

  it("never derives identities from content", () => {
    const first = composerDocumentFromText("same", allocator());
    const second = composerDocumentFromText("same", allocator());
    expect(first.blocks[0]?.paragraphId).toBe("test:composer:1");
    expect(second.blocks[0]?.paragraphId).toBe("test:composer:1");
    const third = composerDocumentFromText("same", allocator());
    expect(third.blocks[0]?.paragraphId).toBe("test:composer:1");
  });
});
