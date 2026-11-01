/**
 * CL-3b1 FU-2 probe (spec §4.3.1 item 4, §5.2): force a local projection
 * failure (`rich-text.collab-step-failed`) with the caret in the middle of a
 * block's text and observe where the post-rollback caret lands.
 *
 * RED probe on the base: the rollback rebuilds the whole document without
 * restoring the selection, so the caret is expected at a document edge
 * instead of its pre-rollback intra-block offset.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import {
  createRichTextEditor,
  type RichTextEditor,
  type RichTextBindingErrorEvent,
} from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  seedFieldFromDocument,
  fieldTextName,
  fieldMetaName,
} from "./collab-codec.js";
import {
  applyRemoteUpdateIncrementally,
  buildSelectionMapFromBlocks,
  linearBlocksOf,
  preUpdateLinearLength,
  yTextToPmDoc,
} from "./collab-projection.js";
import { linearToPmPosition, pmPositionToLinear } from "./collab-selection.js";
import { TextSelection } from "@tiptap/pm/state";
import type { ProseMirrorNode } from "@tiptap/pm/model";
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
import type { FieldBindingIdentity } from "./collaboration.js";
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

const FIELD = "body";
const FULL = "ds.markdown.full@1";

function para(id: string, text: string): Record<string, unknown> {
  return {
    paragraphId: id,
    kind: "paragraph",
    segments: [{ type: "text", text, marks: {} }],
  };
}

function fullDoc(blocks: Array<Record<string, unknown>>): RichTextDocument {
  return { format: FULL, blocks: blocks as never };
}

let counter = 0;

async function boundEditor(options: {
  document: RichTextDocument;
  onBindingError?: (event: RichTextBindingErrorEvent) => void;
}): Promise<{ ed: RichTextEditor; ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown> }> {
  counter += 1;
  const provider = createInMemoryTestDoubleProvider();
  const documentId = `fu2:canvas:${counter}`;
  const sessionId = `fu2:session:${counter}`;
  const source: LiveSessionBindingSource = provider.openSession(documentId, sessionId, [FIELD]);
  const identity: FieldBindingIdentity = { documentId, sessionId, fieldKey: FIELD };
  const resolved = source.resolveBinding(identity);
  seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, options.document);
  const ed = await createRichTextEditor({
    document: options.document,
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:fu2:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: source,
    collaborationRuntime: createBoundRichTextEditor,
    onBindingError: options.onBindingError,
  });
  mounted.push(ed);
  const ydoc = (resolved.text as unknown as { doc: Y.Doc }).doc;
  return { ed, ydoc, ytext: resolved.text, meta: resolved.fieldMeta };
}

function textPos(doc: ProseMirrorNode, needle: string, offset = 0): number {
  let found = -1;
  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (found !== -1) return false;
    if (node.isText && node.text !== undefined && node.text.includes(needle)) {
      found = pos + node.text.indexOf(needle) + offset;
      return false;
    }
    return true;
  });
  expect(found).toBeGreaterThan(-1);
  return found;
}

describe("CL-3b1 FU-2 probe: rollback caret", () => {
  it("post-rollback caret sits at the pre-rollback intra-block offset", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ytext, meta } = await boundEditor({
      document: fullDoc([
        para("p:1", "alphabetic"),
        { paragraphId: "p:hr", kind: "horizontalRule" },
        para("p:2", "omega"),
      ]),
      onBindingError: (event) => errors.push(event),
    });
    // Caret in the middle of "alphabetic" (after "alp"), in the surviving
    // region ahead of the refused span.
    const caretPos = textPos(ed.view.state.doc, "alphabetic", 3);
    ed.view.dispatch(
      ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, caretPos)),
    );
    expect(ed.view.state.selection.anchor).toBe(caretPos);
    let hrPos = -1;
    ed.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "horizontalRule") hrPos = pos;
      return true;
    });
    expect(hrPos).toBeGreaterThan(-1);
    // A local delete crossing the HR atom: unprojectable, both sides roll back.
    const from = textPos(ed.view.state.doc, "alphabetic", 6);
    ed.view.dispatch(ed.view.state.tr.delete(from, hrPos + 1));
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("rich-text.collab-step-failed");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
    const afterCaret = textPos(ed.view.state.doc, "alphabetic", 3);
    expect(ed.view.state.selection.anchor).toBe(afterCaret);
    expect(ed.view.state.selection.head).toBe(afterCaret);
  });
});

describe("CL-3b1 FU-1: selection pre-image carries the pre-update length", () => {
  it("a caret before an appended block restores to the same linear offset", async () => {
    const p0 = (id: string, text: string): Record<string, unknown> => ({
      paragraphId: id,
      kind: "paragraph",
      text,
    });
    const doc = {
      format: "focus.markdown.p0@1",
      blocks: [p0("paragraph:1", "alpha"), p0("paragraph:2", "beta")],
    } as RichTextDocument;
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("fu1:canvas", "fu1:session", ["body"]);
    const identity = { documentId: "fu1:canvas", sessionId: "fu1:session", fieldKey: "body" };
    const resolved = source.resolveBinding(identity);
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, "body", doc);
    const ed = await createBoundRichTextEditor({
      document: doc,
      messages: { ...MESSAGES },
      allocateId: (() => {
        let n = 0;
        return () => `fresh:fu1:${(n += 1)}`;
      })(),
      collaborationBinding: identity,
      collaborationSource: source,
      element: globalThis.document.createElement("div"),
    });
    mounted.push(ed);
    // Pre-update layout: ⟨¶1⟩ alpha ⟨¶2⟩ beta — linear length 11.
    const preBlocks = linearBlocksOf(resolved.text);
    expect(preBlocks).toHaveLength(2);
    const preLength = preUpdateLinearLength(preBlocks);
    expect(preLength).toBe(11);
    expect(preLength).toBe(resolved.text.length);
    // Caret at the end of "alpha" (before the appended block lands).
    const caretPos = textPos(ed.view.state.doc, "alpha", 5);
    ed.view.dispatch(
      ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, caretPos)),
    );
    // A remote appends a new block at the field end: the shared length moves
    // to 18 while the pre-update layout still describes 13.
    resolved.text.doc?.transact(() => {
      resolved.text.insert(resolved.text.length, "—");
      resolved.text.insertEmbed(resolved.text.length, {
        separator: { paragraphId: "paragraph:3", kind: "paragraph" },
      } as never);
      resolved.text.insert(resolved.text.length, "gamma");
    });
    expect(resolved.text.length).toBe(18);
    expect(preUpdateLinearLength(preBlocks)).toBe(11);
    // The pre-image map carries the pre-update length, never the mutated one.
    const preMap = buildSelectionMapFromBlocks(ed.view.state.doc, preBlocks, preUpdateLinearLength(preBlocks));
    expect(preMap.linearLength).toBe(11);
    expect(preMap.linearLength).not.toBe(resolved.text.length);
    // The caret maps through the pre-image map to the pre-update linear
    // offset of the end of "alpha".
    const caretLinear = pmPositionToLinear(preMap, caretPos);
    expect(caretLinear).toBe(6);
    // Applying the remote append repaints the new block and restores the
    // caret at the same linear offset (the end of "alpha").
    const result = applyRemoteUpdateIncrementally({
      view: ed.view,
      ytext: resolved.text,
      fieldMeta: resolved.fieldMeta,
      format: "focus.markdown.p0@1",
      fieldKey: "body",
      affectedParagraphIds: ["paragraph:2", "paragraph:3"],
      preBlocks,
    });
    expect(result.rebuiltParagraphIds).toEqual(["paragraph:2", "paragraph:3"]);
    const afterMap = buildSelectionMapFromBlocks(
      ed.view.state.doc,
      linearBlocksOf(resolved.text),
      resolved.text.length,
    );
    expect(linearToPmPosition(afterMap, caretLinear)).toBe(caretPos);
    expect(ed.view.state.selection.anchor).toBe(caretPos);
    expect(ed.view.state.selection.head).toBe(caretPos);
    expect(ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n")).toContain("gamma");
  });
});

describe("CL-3b1 review-1 TF-2 rollback from the pre-transaction document", () => {
  it("a failing transaction that changes text before the caret restores the caret exactly", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ytext, meta } = await boundEditor({
      document: fullDoc([
        para("p:1", "alphabetic"),
        { paragraphId: "p:hr", kind: "horizontalRule" },
        para("p:2", "omega"),
      ]),
      onBindingError: (event) => errors.push(event),
    });
    // Caret inside p:2 (after "ome"), in the surviving region after the
    // refused span.
    const caretPos = textPos(ed.view.state.doc, "omega", 3);
    ed.view.dispatch(
      ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, caretPos)),
    );
    expect(ed.view.state.selection.anchor).toBe(caretPos);
    // One transaction: insert text at the start of p:1 (before the caret's
    // block, shifting every later PM position), then delete from inside p:1
    // across the HR atom (refused whole). A pre-map built from the
    // post-transaction document linearizes the caret two units early.
    const tr = ed.view.state.tr;
    tr.insertText("QQ", textPos(ed.view.state.doc, "alphabetic", 0));
    let hrPos = -1;
    tr.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "horizontalRule") hrPos = pos;
      return true;
    });
    expect(hrPos).toBeGreaterThan(-1);
    tr.delete(textPos(tr.doc, "omega", 1), hrPos + 1);
    ed.view.dispatch(tr);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("rich-text.collab-step-failed");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
    const afterCaret = textPos(ed.view.state.doc, "omega", 3);
    expect(ed.view.state.selection.anchor).toBe(afterCaret);
    expect(ed.view.state.selection.head).toBe(afterCaret);
  });

  it("a failing transaction under a node selection restores a valid caret without crashing", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ytext, meta } = await boundEditor({
      document: fullDoc([
        para("p:1", "alphabetic"),
        { paragraphId: "p:hr", kind: "horizontalRule" },
        para("p:2", "omega"),
      ]),
      onBindingError: (event) => errors.push(event),
    });
    let hrPos = -1;
    ed.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "horizontalRule") hrPos = pos;
      return true;
    });
    expect(hrPos).toBeGreaterThan(-1);
    const { NodeSelection } = await import("@tiptap/pm/state");
    ed.view.dispatch(ed.view.state.tr.setSelection(NodeSelection.create(ed.view.state.doc, hrPos)));
    expect(ed.view.state.selection).toBeInstanceOf(NodeSelection);
    const from = textPos(ed.view.state.doc, "alphabetic", 6);
    ed.view.dispatch(ed.view.state.tr.delete(from, hrPos + 1));
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("rich-text.collab-step-failed");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
    // Handled fail-safe: a valid text caret at the surviving atom rather
    // than the old `new selection.constructor` corruption.
    const restored = ed.view.state.selection;
    expect(restored.anchor).toBeGreaterThanOrEqual(0);
    expect(restored.head).toBeLessThanOrEqual(ed.view.state.doc.content.size);
    expect(() => ed.view.state.doc.resolve(restored.anchor)).not.toThrow();
    expect(() => ed.view.state.doc.resolve(restored.head)).not.toThrow();
  });
});

describe("CL-3b1 review-1 FU-1 production path: observer-driven remote append keeps the caret", () => {
  it("a length-changing remote append through the observer path restores the caret with no manual pre-image", async () => {
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([para("p:1", "alpha"), para("p:2", "beta")]),
    });
    const caretPos = textPos(ed.view.state.doc, "alpha", 5);
    ed.view.dispatch(
      ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, caretPos)),
    );
    expect(ed.view.state.selection.anchor).toBe(caretPos);
    // A peer appends a block and its text; only the peer diff reaches the
    // local doc, so the observers accumulate the pre-update layout and the
    // delta themselves (no caller-supplied preBlocks).
    const peer = new Y.Doc();
    Y.applyUpdate(peer, Y.encodeStateAsUpdate(ydoc));
    const peerText = peer.getText("field:body");
    const beforeLength = peerText.length;
    peer.transact(() => {
      peerText.insert(peerText.length, "!");
      peerText.insertEmbed(peerText.length, {
        separator: { paragraphId: "paragraph:3", kind: "paragraph" },
      } as never);
      peerText.insert(peerText.length, "gamma");
    });
    expect(peerText.length).toBeGreaterThan(beforeLength);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(peer, Y.encodeStateVector(ydoc)));
    expect(ed.view.state.selection.anchor).toBe(caretPos);
    expect(ed.view.state.selection.head).toBe(caretPos);
    expect(ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n")).toContain("gamma");
    expect(ytext.length).toBe(peerText.length);
    void meta;
  });
});
