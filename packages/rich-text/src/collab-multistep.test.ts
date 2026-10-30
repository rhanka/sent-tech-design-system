/**
 * CL-3a witness 15 — multi-step transaction projection (spec §8 CL-3 (15),
 * §4.3.1 item 2: steps translate sequentially against the evolving map).
 *
 * RED on 7a75a861: `./collab-projection.js` does not exist.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createRichTextEditor, type RichTextEditor } from "./editor.js";
import { seedFieldFromDocument, captureDocumentFromField } from "./collab-codec.js";
import { projectPmTransactionToYText } from "./collab-projection.js";
import type { RichTextDocument } from "./model.js";

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) editor.destroy();
});

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

describe("CL-3-15 multi-step transaction projection", () => {
  it("one transaction with insert, delete and split projects stepwise", async () => {
    const seed: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "abcdef" }],
    };
    const editor = createRichTextEditor({
      document: seed,
      messages: { ...MESSAGES },
      allocateId: (() => {
        let n = 0;
        return () => `test:multi:${(n += 1)}`;
      })(),
      element: globalThis.document.createElement("div"),
    });
    mounted.push(editor);

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const fieldMeta = ydoc.getMap("fieldmeta:body");
    seedFieldFromDocument(ytext, fieldMeta, "body", seed);

    // One ProseMirror transaction carrying three position-changing steps:
    // insert "X", delete the range that follows it in post-insert
    // coordinates, then split at the post-delete position. Each step
    // addresses the document produced by the preceding steps.
    const view = editor.view;
    const startDoc = view.state.doc;
    const tr = view.state.tr;
    tr.insertText("X", 2);
    // Delete two characters after the insertion (post-insert coordinates).
    tr.delete(3, 5);
    // Split the paragraph at the post-delete position 3.
    const splitPos = 3;
    tr.split(splitPos, 1);
    expect(tr.steps).toHaveLength(3);
    // Ground truth: the transaction already carries its post-state document.
    const expectedPmDoc = tr.doc;
    const expectedText = expectedPmDoc.textBetween(0, expectedPmDoc.content.size, "\n\n", "\n");

    projectPmTransactionToYText(
      { ytext, fieldMeta, fieldKey: "body", allocateId: () => "test:multi:tail", format: "focus.markdown.p0@1" },
      startDoc,
      tr,
    );

    // The Y.Text projection must equal the sequential application: capture
    // through the codec and compare block texts/identities with the PM doc.
    const captured = captureDocumentFromField(ytext, fieldMeta, "focus.markdown.p0@1");
    const capturedText = captured.document.blocks
      .map((block) => block.text ?? "")
      .join("\n\n");
    expect(capturedText).toBe(expectedText);
    expect(captured.document.blocks).toHaveLength(2);
    expect(captured.document.blocks[0]?.paragraphId).toBe("paragraph:1");
    expect(captured.document.blocks[1]?.paragraphId).toBe("test:multi:tail");

    // A second replica converges to the same projection.
    const replica = new Y.Doc();
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(ydoc));
    const replicaText = replica.getText("field:body");
    const replicaMeta = replica.getMap("fieldmeta:body");
    const replicaCaptured = captureDocumentFromField(replicaText, replicaMeta, "focus.markdown.p0@1");
    expect(replicaCaptured.document).toEqual(captured.document);
  });
});
