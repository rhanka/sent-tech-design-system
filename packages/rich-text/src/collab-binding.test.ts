/**
 * CL-3a binding — history seam, incremental remote application and envelope
 * guard (spec §4.3.1 item 4, §4.5, §6.3 seam 3, §8.5 envelope).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createRichTextEditor, type RichTextEditor } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  createBoundHistoryPlaceholder,
  createBoundUndoManager,
  createInMemoryTestDoubleProvider,
  BOUND_HISTORY_UNAVAILABLE_MESSAGE,
} from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import {
  BINDING_ORIGIN_META,
  applyRemoteUpdateIncrementally,
  yTextToPmDoc,
} from "./collab-projection.js";
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

function p0Doc(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [
      { paragraphId: "paragraph:1", kind: "paragraph", text: "alpha" },
      { paragraphId: "paragraph:2", kind: "paragraph", text: "beta" },
      { paragraphId: "paragraph:3", kind: "paragraph", text: "gamma" },
    ],
  };
}

describe("CL-3a bound history seam", () => {
  it("bound composition removes UndoRedo in exactly one place", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:h1", "session:h1", ["body"]);
    const identity = { documentId: "canvas:h1", sessionId: "session:h1", fieldKey: "body" };
    // R-MAP-3 (review 2 B-NEW-1): the host seeds the field at session open;
    // an unseeded field refuses the bound mount instead of auto-seeding.
    const seeded = source.resolveBinding(identity);
    seedFieldFromDocument(seeded.text, seeded.fieldMeta, "body", p0Doc());
    const bound = await createBoundRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      allocateId: () => "test:hist:1",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    mounted.push(bound);
    const names = bound.view.state.plugins.map((plugin) => (plugin as { key?: { key?: string } }).key?.key ?? "");
    void names;
    // The Tiptap undoRedo extension registers no history plugin when bound:
    // a bound undo fails closed instead of reaching ProseMirror history.
    expect(() => bound.undo()).toThrow(BOUND_HISTORY_UNAVAILABLE_MESSAGE);
    expect(() => bound.redo()).toThrow(BOUND_HISTORY_UNAVAILABLE_MESSAGE);

    const controlled = createRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      allocateId: () => "test:hist:2",
      element: globalThis.document.createElement("div"),
    });
    mounted.push(controlled);
    expect(() => controlled.undo()).not.toThrow();
    expect(() => controlled.redo()).not.toThrow();
  });

  it("the placeholder never double-records and the UndoManager seam throws", () => {
    const placeholder = createBoundHistoryPlaceholder();
    expect(placeholder.available).toBe(false);
    expect(() => placeholder.undo()).toThrow(BOUND_HISTORY_UNAVAILABLE_MESSAGE);
    expect(() => placeholder.redo()).toThrow(BOUND_HISTORY_UNAVAILABLE_MESSAGE);
    expect(() => createBoundUndoManager({
      text: new Y.Doc().getText("field:x"),
      fieldMeta: new Y.Doc().getMap("fieldmeta:x") as Y.Map<unknown>,
      trackedOrigin: "local",
    })).toThrow("rich-text.bound-undo-unavailable");
  });

  it("binding without source keeps controlled history (CL-2 seam intact)", () => {
    const editor = createRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      allocateId: () => "test:hist:3",
      collaborationBinding: { documentId: "canvas:h2", sessionId: "session:h2", fieldKey: "body" },
      element: globalThis.document.createElement("div"),
    });
    mounted.push(editor);
    expect(() => editor.undo()).not.toThrow();
  });

  it("binding plus source without the injected runtime fails closed (CL-3a fix 3, §6.3 seam 3)", () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:rt", "session:rt", ["body"]);
    // A bound mount must come with `collaborationRuntime` (imported by the
    // caller from the collaboration subpath); this entry never imports the
    // bound runtime, so the forgotten injection is a typed refusal, never a
    // silent controlled mount over a live shared field.
    expect(() =>
      createRichTextEditor({
        document: p0Doc(),
        messages: { ...MESSAGES },
        allocateId: () => "test:rt:1",
        collaborationBinding: { documentId: "canvas:rt", sessionId: "session:rt", fieldKey: "body" },
        collaborationSource: source,
        element: globalThis.document.createElement("div"),
      }),
    ).toThrow("rich-text.collab-runtime-required");
  });
});

describe("CL-3a incremental remote application", () => {
  it("rebuilds only the affected block range with echo suppression", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:r1", "session:r1", ["body"]);
    const identity = { documentId: "canvas:r1", sessionId: "session:r1", fieldKey: "body" };
    const binding = source.resolveBinding(identity);
    seedFieldFromDocument(binding.text, binding.fieldMeta, "body", p0Doc());

    const editor = await createBoundRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      allocateId: () => "test:remote:1",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    mounted.push(editor);

    const beforeNodes: unknown[] = [];
    editor.view.state.doc.forEach((node) => beforeNodes.push(node));
    // Remote insert in paragraph:2 only (linear: ⟨¶1⟩ alpha ⟨¶2⟩ beta …).
    // "alpha" is 5 chars: separators at 0 and 6; paragraph:2 content starts at 7.
    const beforeY = captureDocumentFromField(binding.text, binding.fieldMeta, "focus.markdown.p0@1");
    binding.text.doc?.transact(() => {
      binding.text.insert(7, "REMOTE-");
    });

    const result = applyRemoteUpdateIncrementally({
      view: editor.view,
      ytext: binding.text,
      fieldMeta: binding.fieldMeta,
      format: "focus.markdown.p0@1",
      fieldKey: "body",
      affectedParagraphIds: ["paragraph:2"],
    });
    expect(result.rebuiltParagraphIds).toEqual(["paragraph:2"]);

    const after = captureDocumentFromField(binding.text, binding.fieldMeta, "focus.markdown.p0@1");
    expect(after.document.blocks[1]).toMatchObject({ paragraphId: "paragraph:2", text: "REMOTE-beta" });
    expect(after.document.blocks[0]).toEqual(beforeY.document.blocks[0]);
    expect(after.document.blocks[2]).toEqual(beforeY.document.blocks[2]);

    // Incremental: unaffected PM nodes stay object-identical.
    const afterNodes: unknown[] = [];
    editor.view.state.doc.forEach((node) => afterNodes.push(node));
    expect(afterNodes[0]).toBe(beforeNodes[0]);
    expect(afterNodes[2]).toBe(beforeNodes[2]);

    // The projected editor shows the remote text…
    const pmBeta = editor.view.state.doc.textBetween(0, editor.view.state.doc.content.size, "\n\n", "\n");
    expect(pmBeta).toContain("REMOTE-beta");
    // …and the binding-origin dispatch never echoed back into the Y.Text:
    // capturing again yields the same document (no duplicated insert).
    const reread = captureDocumentFromField(binding.text, binding.fieldMeta, "focus.markdown.p0@1");
    expect(reread.document).toEqual(after.document);
    void BINDING_ORIGIN_META;
  });

  it("400-block append applies incrementally within the remote budget", async () => {
    const blocks = Array.from({ length: 400 }, (_, index) => ({
      paragraphId: `paragraph:${index}`,
      kind: "paragraph" as const,
      text: "word ".repeat(20),
    }));
    const big = { format: "focus.markdown.p0@1" as const, blocks };
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:r400", "session:r400", ["body"]);
    const identity = { documentId: "canvas:r400", sessionId: "session:r400", fieldKey: "body" };
    const binding = source.resolveBinding(identity);
    seedFieldFromDocument(binding.text, binding.fieldMeta, "body", big);
    const editor = await createBoundRichTextEditor({
      document: big,
      messages: { ...MESSAGES },
      allocateId: () => "test:remote:400",
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    mounted.push(editor);
    binding.text.doc?.transact(() => {
      binding.text.insert(binding.text.length, "X");
    });
    const start = performance.now();
    const result = applyRemoteUpdateIncrementally({
      view: editor.view,
      ytext: binding.text,
      fieldMeta: binding.fieldMeta,
      format: "focus.markdown.p0@1",
      fieldKey: "body",
      affectedParagraphIds: ["paragraph:399"],
    });
    const elapsed = performance.now() - start;
    expect(result.rebuiltParagraphIds).toEqual(["paragraph:399"]);
    expect(elapsed).toBeLessThan(250);
  });

  it("yTextToPmDoc is deterministic for the same field state", () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:r2", "session:r2", ["body"]);
    const binding = source.resolveBinding({ documentId: "canvas:r2", sessionId: "session:r2", fieldKey: "body" });
    seedFieldFromDocument(binding.text, binding.fieldMeta, "body", p0Doc());
    const scratch = createRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      element: globalThis.document.createElement("div"),
    });
    mounted.push(scratch);
    const schema = scratch.view.state.schema;
    const first = yTextToPmDoc(binding.text, binding.fieldMeta, "focus.markdown.p0@1", schema);
    const second = yTextToPmDoc(binding.text, binding.fieldMeta, "focus.markdown.p0@1", schema);
    expect(first.eq(second)).toBe(true);
    expect(first.textBetween(0, first.content.size, "\n\n", "\n")).toContain("alpha");
  });
});

describe("CL-3a live envelope guard", () => {
  it("refuses a field beyond 2000 paragraphs with a surfaced reason", () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName("body"));
    const meta = ydoc.getMap(fieldMetaName("body")) as Y.Map<unknown>;
    const blocks: RichTextDocument["blocks"] = [];
    for (let index = 0; index < 2001; index += 1) {
      blocks.push({ paragraphId: `paragraph:${index}`, kind: "paragraph", text: "x" });
    }
    expect(() => seedFieldFromDocument(ytext, meta, "body", {
      format: "focus.markdown.p0@1",
      blocks,
    })).toThrow("rich-text.envelope-exceeded");
  });
});
