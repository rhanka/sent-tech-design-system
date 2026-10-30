/**
 * Review 1 item 10 — source seeds kept through the composer surface.
 *
 * RED on cc91ac7c: the full composer mapping discards the bridge's source
 * seeds (`composer-document.ts` keeps only the document) and the export
 * emits the canonical wire with no seed reuse, so the pinned `break-twins`
 * input `Twin\n\nTwin\n\nHard  \nbreak\n\n` already changes two-space hard
 * breaks to backslashes on its initial mount-and-capture, and a neighboring
 * edit cannot keep untouched slices.
 */
import { describe, expect, it } from "vitest";
import { ensureFullEditorExtensionsRegistered } from "./editor-full-extensions.js";
import { createRichTextEditor } from "./editor.js";
import {
  composerFullSeededDocumentForText,
  composerFullSeededDocumentFromText,
  composerFullSeededTextFromDocument,
} from "./composer-document.js";

ensureFullEditorExtensionsRegistered();

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const BREAK_TWINS = "Twin\n\nTwin\n\nHard  \nbreak\n\n";

function mountComposer(text: string) {
  let sequence = 0;
  const seeded = composerFullSeededDocumentFromText(
    text,
    () => `test:composer:${(sequence += 1)}`,
  );
  const editor = createRichTextEditor({
    document: seeded.document,
    profile: "full",
    messages: { ...MESSAGES },
    element: globalThis.document.createElement("div"),
  });
  return {
    editor,
    captureComposer: async (): Promise<string> => {
      const captured = await editor.captureDocument();
      return composerFullSeededTextFromDocument(
        captured.document,
        seeded.seeds,
      );
    },
  };
}

describe("review 1 item 10: seeds through the composer surface", () => {
  it("initial composer capture keeps two-space hard breaks", async () => {
    const { editor, captureComposer } = mountComposer(BREAK_TWINS);
    try {
      expect(await captureComposer()).toBe(BREAK_TWINS);
    } finally {
      editor.destroy();
    }
  });

  it("seeded export re-emits untouched slices after a neighbor edit", () => {
    let sequence = 0;
    const allocateId = () => `test:composer:${(sequence += 1)}`;
    const { document, seeds } = composerFullSeededDocumentFromText(
      BREAK_TWINS,
      allocateId,
    );
    expect(seeds.size).toBe(document.blocks.length);
    const edited = {
      ...document,
      blocks: document.blocks.map((block, index) =>
        index === 0 && block.kind === "paragraph"
          ? {
              ...block,
              segments: [{ type: "text", text: "Twin!", marks: {} }],
            }
          : block,
      ),
    };
    const touched = new Set([
      edited.blocks[0]?.paragraphId as string,
    ]);
    expect(composerFullSeededTextFromDocument(edited, seeds, touched)).toBe(
      "Twin!\n\nTwin\n\nHard  \nbreak\n\n",
    );
  });

  it("seeded replacement remaps seeds through positional identity reuse", () => {
    let sequence = 0;
    const allocateId = () => `test:composer:${(sequence += 1)}`;
    const first = composerFullSeededDocumentFromText(BREAK_TWINS, allocateId);
    const second = composerFullSeededDocumentForText(
      BREAK_TWINS,
      first.document.blocks,
      allocateId,
    );
    expect(second.document.blocks.map((block) => block.paragraphId)).toEqual(
      first.document.blocks.map((block) => block.paragraphId),
    );
    expect(composerFullSeededTextFromDocument(second.document, second.seeds)).toBe(
      BREAK_TWINS,
    );
  });
});
