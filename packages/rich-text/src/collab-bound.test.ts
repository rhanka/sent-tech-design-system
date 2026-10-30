/**
 * CL-3a fix 1 — B1 wiring: real bound editor in jsdom, two replicas through
 * the in-memory double. Local typing reaches the other replica, remote typing
 * appears locally, bound capture equals the shared state (probe1 A1–A3).
 *
 * RED on 72fa8631: `createRichTextEditor` with a binding never resolved,
 * observed or projected — `Y.Text` unchanged on local insert (A1), editor PM
 * unchanged on remote insert (A2), bound capture returned the unsynced local
 * PM text (A3).
 */
import { describe, expect, it, afterEach } from "vitest";
import { type RichTextEditor } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  seedFieldFromDocument,
} from "./collab-codec.js";
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

function doc3(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [
      { paragraphId: "paragraph:1", kind: "paragraph", text: "alpha" },
      { paragraphId: "paragraph:2", kind: "paragraph", text: "beta" },
      { paragraphId: "paragraph:3", kind: "paragraph", text: "gamma" },
    ],
  };
}

describe("CL-3a-B1 bound editor wiring", () => {
  it("local typing reaches the other replica, remote typing appears locally, bound capture equals shared state", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:b1", "session:b1", ["body"]);
    const identity = { documentId: "canvas:b1", sessionId: "session:b1", fieldKey: "body" };
    const binding = source.resolveBinding(identity);
    seedFieldFromDocument(binding.text, binding.fieldMeta, "body", doc3());

    const ed1 = await createBoundRichTextEditor({
      document: doc3(),
      messages: { ...MESSAGES },
      allocateId: () => "test:b1:1",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    const ed2 = await createBoundRichTextEditor({
      document: doc3(),
      messages: { ...MESSAGES },
      allocateId: () => "test:b1:2",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    mounted.push(ed1, ed2);

    // A1: local insertText in the bound editor reaches Y.Text.
    const yBefore = binding.text.toString();
    ed1.view.dispatch(ed1.view.state.tr.insertText("ZZ", 2));
    expect(binding.text.toString()).not.toBe(yBefore);
    expect(binding.text.toString()).toContain("ZZ");
    // The other replica through the same double observes it.
    expect(ed2.view.state.doc.textBetween(0, ed2.view.state.doc.content.size, "\n\n", "\n")).toContain("ZZ");

    // A2: remote Y.Text insert appears locally.
    binding.text.doc?.transact(() => {
      binding.text.insert(7, "REMOTE-");
    });
    const pmText = ed1.view.state.doc.textBetween(0, ed1.view.state.doc.content.size, "\n\n", "\n");
    expect(pmText).toContain("REMOTE-");
    expect(ed2.view.state.doc.textBetween(0, ed2.view.state.doc.content.size, "\n\n", "\n")).toContain("REMOTE-");

    // A3: bound captureDocument reads Y.Text + fieldmeta (equals shared state).
    const cap = await ed1.captureDocument();
    const shared = captureDocumentFromField(binding.text, binding.fieldMeta, "focus.markdown.p0@1");
    expect(cap.document).toEqual(shared.document);
  });

  it("releasing the binding on destroy fails closed for unknown fields", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:b1r", "session:b1r", ["body"]);
    const identity = { documentId: "canvas:b1r", sessionId: "session:b1r", fieldKey: "body" };
    const binding = source.resolveBinding(identity);
    seedFieldFromDocument(binding.text, binding.fieldMeta, "body", doc3());
    const ed = await createBoundRichTextEditor({
      document: doc3(),
      messages: { ...MESSAGES },
      allocateId: () => "test:b1r:1",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    ed.destroy();
    // Releasing a never-admitted field fails closed.
    expect(() =>
      source.releaseBinding({ documentId: "canvas:b1r", sessionId: "session:b1r", fieldKey: "other" }),
    ).toThrow("rich-text.binding-identity");
  });
});
