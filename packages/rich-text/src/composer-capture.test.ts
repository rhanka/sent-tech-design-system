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

  it("an untouched noncanonical string captures byte-identically with no change event (P2)", async () => {
    for (const text of ["a\n\n\n\nb", "a\n\n\nb", "\n\nb", "a\n\n", "\n\n\n"]) {
      let changes = 0;
      let sequence = 0;
      const document = composerDocumentFromText(text, () => `test:composer:${(sequence += 1)}`);
      const editor = createRichTextEditor({
        document,
        messages: { ...MESSAGES },
        element: globalThis.document.createElement("div"),
        onChange: () => {
          changes += 1;
        },
      });
      const captured = await editor.captureDocument();
      expect(composerTextFromDocument(captured.document)).toBe(text);
      expect(changes).toBe(0);
      expect(captured.representability.nonRepresentableParagraphIds).toEqual([]);
      editor.destroy();
    }
  });

  it("revocation during composition restores the committed flagged draft with its flag", async () => {
    let changes = 0;
    let sequence = 0;
    const document = composerDocumentFromText("", () => `test:composer:${(sequence += 1)}`);
    const editor = createRichTextEditor({
      document,
      messages: { ...MESSAGES },
      element: globalThis.document.createElement("div"),
      onChange: () => {
        changes += 1;
      },
    });
    const id = editor.getDocument().blocks[0]?.paragraphId as string;
    editor.typeText(id, "# titre");
    expect(changes).toBe(1);
    let captured = await editor.captureDocument();
    expect(composerTextFromDocument(captured.document)).toBe("# titre");
    expect(captured.representability.nonRepresentableParagraphIds).toEqual([id]);
    const viewDom = editor.view.dom as HTMLElement;
    viewDom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    editor.setEditable(false);
    viewDom.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    expect(changes).toBe(1);
    expect(editor.view.dom.textContent ?? "").toContain("# titre");
    captured = await editor.captureDocument();
    expect(composerTextFromDocument(captured.document)).toBe("# titre");
    expect(captured.representability.nonRepresentableParagraphIds).toEqual([id]);
    editor.setEditable(true);
    editor.typeText(id, "X");
    expect(changes).toBe(2);
    captured = await editor.captureDocument();
    expect(composerTextFromDocument(captured.document)).toBe("# titreX");
    expect(captured.representability.nonRepresentableParagraphIds).toEqual([id]);
    editor.destroy();
  });
});
