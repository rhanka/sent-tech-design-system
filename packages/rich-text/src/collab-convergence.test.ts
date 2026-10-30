/**
 * CL-3a witness 1 — multi-client convergence and no lost edit in the same
 * word (spec §8 CL-3 (1), §4.3, §4.2).
 *
 * RED on 7a75a861: `./editor-collaboration.js` and `./collab-codec.js` do
 * not exist, so this suite fails at import time.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { seedFieldFromDocument, captureDocumentFromField } from "./collab-codec.js";
import {
  createInMemoryTestDoubleProvider,
  type LiveSessionBindingSource,
} from "./editor-collaboration.js";
import type { RichTextDocument } from "./model.js";

const FIELD = "body";

function p0Doc(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "hello world" }],
  };
}

function exchangeUpdates(a: Y.Doc, b: Y.Doc): void {
  const updateA = Y.encodeStateAsUpdate(a);
  const updateB = Y.encodeStateAsUpdate(b);
  Y.applyUpdate(a, updateB);
  Y.applyUpdate(b, updateA);
}

function paragraphIdsOf(doc: RichTextDocument): string[] {
  return doc.blocks.map((block) => block.paragraphId);
}

describe("CL-3-01 multi-client convergence in the same word", () => {
  it("concurrent inserts into the same word converge with no lost edit", () => {
    const provider = createInMemoryTestDoubleProvider();
    const sessionId = "session:conv-1";
    const documentId = "canvas:conv-1";
    const source: LiveSessionBindingSource = provider.openSession(
      documentId,
      sessionId,
      [FIELD],
    );
    const bindingA = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD });
    const bindingB = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD });
    expect(bindingA.text).toBe(bindingB.text);

    seedFieldFromDocument(bindingA.text, bindingA.fieldMeta, FIELD, p0Doc());

    // Two replicas: fork the authoritative doc into two Y.Docs.
    const replicaA = new Y.Doc();
    const replicaB = new Y.Doc();
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(bindingA.text.doc as Y.Doc));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(bindingA.text.doc as Y.Doc));
    const textA = replicaA.getText(`field:${FIELD}`);
    const textB = replicaB.getText(`field:${FIELD}`);

    // Same paragraph, same word "world": insert concurrently inside it.
    // Linear layout is ⟨¶p1⟩ "hello world" — "world" starts at index 7.
    textA.insert(7, "A-");
    textB.insert(7, "B-");

    exchangeUpdates(replicaA, replicaB);

    const capturedA = captureDocumentFromField(textA, bindingA.fieldMeta, "focus.markdown.p0@1");
    const capturedB = captureDocumentFromField(textB, bindingA.fieldMeta, "focus.markdown.p0@1");
    expect(capturedA.document.blocks).toHaveLength(1);
    expect(capturedB.document.blocks).toHaveLength(1);
    const textAfterA = capturedA.document.blocks[0]?.text ?? "";
    const textAfterB = capturedB.document.blocks[0]?.text ?? "";
    expect(textAfterA).toBe(textAfterB);
    expect(textAfterA).toContain("A-");
    expect(textAfterA).toContain("B-");
    expect(textAfterA).toContain("world");

    // Identity set unchanged (no split happened) and no collision.
    expect(paragraphIdsOf(capturedA.document)).toEqual(["paragraph:1"]);
    expect(paragraphIdsOf(capturedB.document)).toEqual(["paragraph:1"]);
  });

  it("the test double resolves by full identity and fails closed", () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:d1", "session:s1", ["body", "notes"]);
    const ok = source.resolveBinding({
      documentId: "canvas:d1",
      sessionId: "session:s1",
      fieldKey: "body",
    });
    expect(ok.text).toBeDefined();

    expect(() =>
      source.resolveBinding({ documentId: "", sessionId: "session:s1", fieldKey: "body" }),
    ).toThrow();
    expect(() =>
      source.resolveBinding({ documentId: "canvas:d1", sessionId: "session:s1", fieldKey: "other" }),
    ).toThrow();
    expect(() =>
      source.resolveBinding({ documentId: "canvas:d1", sessionId: "session:other", fieldKey: "body" }),
    ).toThrow();
    expect(() =>
      source.resolveBinding({ documentId: "canvas:other", sessionId: "session:s1", fieldKey: "body" }),
    ).toThrow();
  });

  it("two fields of one document stay live independently (R-BIND-3)", () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:d2", "session:s2", ["description", "notes"]);
    const description = source.resolveBinding({
      documentId: "canvas:d2",
      sessionId: "session:s2",
      fieldKey: "description",
    });
    const notes = source.resolveBinding({
      documentId: "canvas:d2",
      sessionId: "session:s2",
      fieldKey: "notes",
    });
    seedFieldFromDocument(description.text, description.fieldMeta, "description", {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:d", kind: "paragraph", text: "desc" }],
    });
    seedFieldFromDocument(notes.text, notes.fieldMeta, "notes", {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:n", kind: "paragraph", text: "note" }],
    });
    source.releaseBinding({ documentId: "canvas:d2", sessionId: "session:s2", fieldKey: "description" });
    // The other field remains usable after its sibling is released.
    notes.text.insert(notes.text.length, "!");
    const captured = captureDocumentFromField(notes.text, notes.fieldMeta, "focus.markdown.p0@1");
    expect(captured.document.blocks[0]?.text).toContain("note!");
  });
});
