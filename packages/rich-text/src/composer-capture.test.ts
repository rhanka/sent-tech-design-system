/**
 * CL-2 RED — composer capture over the real core (witness 7, capture half).
 *
 * `captureComposer()` resolves the string and the representability of the
 * SAME captured revision; during composition it defers and resolves once
 * with the committed text; a flagged draft keeps its text intact with a
 * non-empty flag. The composer conversion is `composer-document.ts`; the
 * capture path here runs the Tiptap-bound core so the §6.6 verdict is the
 * real one, never a re-implementation.
 */
import { describe, expect, it } from "vitest";
import { createRichTextEditor } from "./editor.js";
import {
  composerDocumentFromText,
  composerTextFromDocument,
} from "./composer-document.js";

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

function mountComposer(text: string) {
  let sequence = 0;
  const document = composerDocumentFromText(text, () => `test:composer:${(sequence += 1)}`);
  const editor = createRichTextEditor({
    document,
    messages: { ...MESSAGES },
    element: globalThis.document.createElement("div"),
  });
  return {
    editor,
    captureComposer: async () => {
      const captured = await editor.captureDocument();
      return {
        text: composerTextFromDocument(captured.document),
        representability: captured.representability,
      };
    },
  };
}

describe("composer capture (CL-2 witness 7, RED)", () => {
  it("captures the string and the representability of the same revision", async () => {
    const { editor, captureComposer } = mountComposer("first\n\nsecond");
    const captured = await captureComposer();
    expect(captured.text).toBe("first\n\nsecond");
    expect(captured.representability.nonRepresentableParagraphIds).toEqual([]);
    editor.destroy();
  });

  it("round-trips a canonical composer string through mount and capture", async () => {
    for (const text of ["", "hello", "a\nb", "first\n\nsecond\n\nthird"]) {
      const { editor, captureComposer } = mountComposer(text);
      const captured = await captureComposer();
      expect(captured.text).toBe(text);
      editor.destroy();
    }
  });

  it("a typed block-syntax draft captures with its flag and stays intact unsent", async () => {
    const { editor, captureComposer } = mountComposer("");
    const id = editor.getDocument().blocks[0]?.paragraphId as string;
    editor.typeText(id, "# titre");
    const captured = await captureComposer();
    expect(captured.text).toBe("# titre");
    expect(captured.representability.nonRepresentableParagraphIds).toEqual([id]);
    expect(editor.getDocument().blocks[0]).toMatchObject({ paragraphId: id, text: "# titre" });
    editor.destroy();
  });

  it("a later edit that clears the flag re-enables send of the then-current text", async () => {
    const { editor, captureComposer } = mountComposer("");
    const id = editor.getDocument().blocks[0]?.paragraphId as string;
    editor.typeText(id, "# titre");
    const flagged = await captureComposer();
    expect(flagged.representability.nonRepresentableParagraphIds).toEqual([id]);
    // `typeText` appends, so clearing the flag replaces the paragraph
    // content first: the send gate then sees the then-current text.
    editor.clearParagraph(id);
    editor.typeText(id, "plain text");
    const cleared = await captureComposer();
    expect(cleared.representability.nonRepresentableParagraphIds).toEqual([]);
    expect(cleared.text).toBe("plain text");
    editor.destroy();
  });
});
