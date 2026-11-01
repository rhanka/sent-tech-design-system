/**
 * CL-3a fix 1 — B5 divergence guard + to-fix 2 (refcount) + to-fix 3 (pre-layout).
 * RED on 72fa8631: `verifyTextAgreement` discarded its inputs, so an
 * untranslatable step passed silently; `releaseBinding` removed the field even
 * with two holders; `affectedBlocksFromDelta` resolved deletions against the
 * post-change layout (misattributing merge survivors).
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { seedFieldFromDocument, fieldTextName, fieldMetaName } from "./collab-codec.js";
import {
  projectPmTransactionToYText,
  affectedBlocksFromDelta,
  linearBlocksOf,
} from "./collab-projection.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import { createRichTextEditor } from "./editor.js";
import type { RichTextDocument } from "./model.js";

const FIELD = "body";

function p0Doc(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [
      { paragraphId: "paragraph:1", kind: "paragraph", text: "abcdef" },
      { paragraphId: "paragraph:2", kind: "paragraph", text: "ghijkl" },
    ],
  };
}

describe("CL-3a-B5 divergence guard", () => {
  it("an untranslatable step is reported, never silent", async () => {
    const ed = await createRichTextEditor({
      document: p0Doc(),
      messages: {
        editorLabel: "L",
        placeholder: "P",
        preservedBlockLabel: "K-{kind}",
        externalConflictLabel: "C",
      },
      allocateId: () => "test:div:1",
      element: globalThis.document.createElement("div"),
    });
    try {
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText(fieldTextName(FIELD));
      const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
      seedFieldFromDocument(ytext, meta, FIELD, p0Doc());
      // Remote mutates Y without projecting to PM (simulating a missed step).
      ytext.doc?.transact(() => {
        ytext.insert(2, "ZZZ");
      });
      // Projecting an empty transaction against the diverged shared state
      // must fail closed (previous code discarded the comparison).
      const emptyTr = ed.view.state.tr;
      expect(() =>
        projectPmTransactionToYText(
          { ytext, fieldMeta: meta, fieldKey: FIELD, allocateId: () => "test:div:2", format: "focus.markdown.p0@1", localOrigin: "test:div:local", markOrigin: "test:div:local:mark" },
          ed.view.state.doc,
          emptyTr,
        ),
      ).toThrow("rich-text.collab-step-failed");
    } finally {
      ed.destroy();
    }
  });
});

describe("CL-3a to-fix 2 release refcount", () => {
  it("two holders of one field cannot release each other", () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:ref", "session:ref", ["body"]);
    const identity = { documentId: "canvas:ref", sessionId: "session:ref", fieldKey: "body" };
    const first = source.resolveBinding(identity);
    const second = source.resolveBinding(identity);
    expect(first.text).toBe(second.text);
    // First holder releases: the field stays admitted for the second holder.
    source.releaseBinding(identity);
    const third = source.resolveBinding(identity);
    expect(third.text).toBe(first.text);
    // Releasing a never-admitted field fails closed.
    expect(() =>
      source.releaseBinding({ documentId: "canvas:ref", sessionId: "session:ref", fieldKey: "other" }),
    ).toThrow("rich-text.binding-identity");
  });
});

describe("CL-3a to-fix 3 affected pre-layout", () => {
  it("deleted ranges resolve against the pre-change layout (merge reports head and tail)", () => {
    const doc: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "p:1", kind: "paragraph", text: "alpha" },
        { paragraphId: "p:2", kind: "paragraph", text: "beta" },
      ],
    };
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName(FIELD));
    const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    seedFieldFromDocument(ytext, meta, FIELD, doc);
    const pre = linearBlocksOf(ytext);
    // Delete the separator of p:2 (merge p:2 into p:1): retain 6, delete 1.
    const delta = [{ retain: 6 }, { delete: 1 }];
    // Apply the merge to obtain the post-change layout.
    ytext.doc?.transact(() => {
      ytext.delete(6, 1);
    });
    const post = linearBlocksOf(ytext);
    const affected = affectedBlocksFromDelta(pre, post, delta as never);
    expect(affected).toContain("p:2");
    expect(affected).toContain("p:1");
  });
});
