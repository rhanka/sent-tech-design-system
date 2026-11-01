/**
 * CL-3b1 witness 2 — bound `UndoManager` wiring (spec §4.5 CL-D9, §4.3.1
 * item 6, §4.10 R-STR-6, R-LIN-8, R-FULL-HR-1).
 *
 * RED on the base: every bound `undo()`/`redo()` below threw
 * `rich-text.bound-undo-unavailable` (the CL-3a seam, asserted by the old
 * `collab-binding.test.ts` history-seam test).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import {
  createRichTextEditor,
  type RichTextEditor,
  type RichTextChangeEvent,
} from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
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
const P0 = "focus.markdown.p0@1";
const FULL = "ds.markdown.full@1";

function p0Doc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: P0,
    blocks: blocks.map((block) => ({ paragraphId: block.paragraphId, kind: "paragraph", text: block.text })),
  } as RichTextDocument;
}

let counter = 0;

interface Pair {
  edA: RichTextEditor;
  edB: RichTextEditor;
  ydoc: Y.Doc;
  ytext: Y.Text;
  meta: Y.Map<unknown>;
  gesturesA: RichTextChangeEvent[];
  gesturesB: RichTextChangeEvent[];
}

async function mountPair(
  document: RichTextDocument,
  options?: { allocateA?: () => string; allocateB?: () => string },
): Promise<Pair> {
  counter += 1;
  const profile = document.format === FULL ? "full" : "p0";
  const provider = createInMemoryTestDoubleProvider();
  const documentId = `undo:canvas:${counter}`;
  const sessionId = `undo:session:${counter}`;
  const source = provider.openSession(documentId, sessionId, [FIELD]);
  const identity: FieldBindingIdentity = { documentId, sessionId, fieldKey: FIELD };
  const resolved = source.resolveBinding(identity);
  seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, document);
  const gesturesA: RichTextChangeEvent[] = [];
  const gesturesB: RichTextChangeEvent[] = [];
  let nA = 0;
  let nB = 0;
  const edA = await createBoundRichTextEditor({
    document,
    profile: profile as "p0",
    messages: { ...MESSAGES },
    allocateId: options?.allocateA ?? (() => `fresh:undo:a:${counter}:${(nA += 1)}`),
    collaborationBinding: identity,
    collaborationSource: source,
    collaborationActor: { actorId: `undo-a-${counter}`, kind: "human" },
    element: globalThis.document.createElement("div"),
    onChange: (event) => gesturesA.push(event),
  });
  const edB = await createBoundRichTextEditor({
    document,
    profile: profile as "p0",
    messages: { ...MESSAGES },
    allocateId: options?.allocateB ?? (() => `fresh:undo:b:${counter}:${(nB += 1)}`),
    collaborationBinding: identity,
    collaborationSource: source,
    collaborationActor: { actorId: `undo-b-${counter}`, kind: "human" },
    element: globalThis.document.createElement("div"),
    onChange: (event) => gesturesB.push(event),
  });
  mounted.push(edA, edB);
  const ydoc = resolved.text.doc as Y.Doc;
  return { edA, edB, ydoc, ytext: resolved.text, meta: resolved.fieldMeta, gesturesA, gesturesB };
}

/** Fork a read-only-style replica from an authoritative doc. */
function forkReplica(ydoc: Y.Doc): { doc: Y.Doc; text: Y.Text; meta: Y.Map<unknown> } {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(ydoc));
  return {
    doc,
    text: doc.getText(fieldTextName(FIELD)),
    meta: doc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
  };
}

/** Exchange every update between docs until no side has unseen state. */
function syncDocs(docs: Y.Doc[]): void {
  const updates = docs.map((doc) => Y.encodeStateAsUpdate(doc));
  for (const doc of docs) {
    for (const update of updates) Y.applyUpdate(doc, update);
  }
}

function captureJson(ytext: Y.Text, meta: Y.Map<unknown>, format: string): string {
  return JSON.stringify(captureDocumentFromField(ytext, meta, format).document);
}

/** Quiescence: equal state vectors and equal projected documents everywhere. */
function assertQuiescent(
  label: string,
  format: string,
  entries: Array<{ ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown> }>,
): void {
  const vectors = entries.map((entry) =>
    Buffer.from(Y.encodeStateVector(entry.ydoc)).toString("hex"),
  );
  for (const vector of vectors) expect(vector, `${label}: state vectors agree`).toBe(vectors[0]);
  const captures = entries.map((entry) => captureJson(entry.ytext, entry.meta, format));
  for (const capture of captures) expect(capture, `${label}: documents agree`).toBe(captures[0]);
}

function textOf(ytext: Y.Text, meta: Y.Map<unknown>, format: string, id: string): string | undefined {
  const doc = captureDocumentFromField(ytext, meta, format).document;
  const block = doc.blocks.find((entry) => entry.paragraphId === id) as
    | { text?: string; segments?: Array<{ type?: string; text?: string }> }
    | undefined;
  if (block === undefined) return undefined;
  if (typeof block.text === "string") return block.text;
  // Full profile: text-like blocks carry segments, not a text field.
  return (block.segments ?? [])
    .map((segment) => (segment.type === "text" ? (segment.text ?? "") : ""))
    .join("");
}

function idsOf(ytext: Y.Text, meta: Y.Map<unknown>, format: string): string[] {
  return captureDocumentFromField(ytext, meta, format).document.blocks.map(
    (block) => block.paragraphId,
  );
}

function separatorIds(ytext: Y.Text): string[] {
  const ids: string[] = [];
  for (const op of ytext.toDelta() as Array<{ insert?: unknown }>) {
    if (
      typeof op.insert === "object" &&
      op.insert !== null &&
      "separator" in (op.insert as Record<string, unknown>)
    ) {
      ids.push((op.insert as { separator: { paragraphId: string } }).separator.paragraphId);
    }
  }
  return ids;
}

describe("CL-3b1-2a interleaved split undo (spec §4.5 (a), R-STR-6)", () => {
  it("undo of my split keeps the collaborator characters in merged sequence order", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]));
    const { edA, edB, ydoc, ytext, meta, gesturesA } = pair;
    // My split at offset 3: paragraph:1 "abc" + tail "def".
    edA.splitParagraph("paragraph:1", 3);
    const tailId = idsOf(ytext, meta, P0).find((id) => id !== "paragraph:1") as string;
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1", tailId]);
    // A collaborator inserts into the tail (connected, distinct origin).
    edB.typeText(tailId, "XYZ");
    expect(textOf(ytext, meta, P0, tailId)).toBe("defXYZ");
    const replicaA = forkReplica(ydoc);
    const replicaB = forkReplica(ydoc);
    // My undo deletes only my separator embed: one paragraph, all characters.
    gesturesA.length = 0;
    edA.undo();
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1"]);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("abcdefXYZ");
    expect(separatorIds(ytext)).toEqual(["paragraph:1"]);
    // Exactly one undo gesture naming the changed block.
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("undo");
    expect([...(gesturesA[0]?.gesture.affectedParagraphIds ?? [])]).toEqual(["paragraph:1"]);
    // Quiescence on the authoritative doc and two replicas.
    syncDocs([ydoc, replicaA.doc, replicaB.doc]);
    assertQuiescent("2a", P0, [
      { ydoc, ytext, meta },
      { ydoc: replicaA.doc, ytext: replicaA.text, meta: replicaA.meta },
      { ydoc: replicaB.doc, ytext: replicaB.text, meta: replicaB.meta },
    ]);
    expect(textOf(replicaA.text, replicaA.meta, P0, "paragraph:1")).toBe("abcdefXYZ");
  });

  it("an offline collaborator insert into the head survives my split undo", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]));
    const { edA, ydoc, ytext, meta } = pair;
    edA.splitParagraph("paragraph:1", 3);
    const tailId = idsOf(ytext, meta, P0).find((id) => id !== "paragraph:1") as string;
    // Offline replica inserts inside the head; its transaction arrives last.
    const offline = forkReplica(ydoc);
    offline.text.insert(2, "OFF-");
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(offline.doc));
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("aOFF-bc");
    edA.undo();
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1"]);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("aOFF-bcdef");
    const replica = forkReplica(ydoc);
    syncDocs([ydoc, offline.doc, replica.doc]);
    assertQuiescent("2a-offline", P0, [
      { ydoc, ytext, meta },
      { ydoc: offline.doc, ytext: offline.text, meta: offline.meta },
      { ydoc: replica.doc, ytext: replica.text, meta: replica.meta },
    ]);
  });
});

describe("CL-3b1-2b interleaved merge undo (spec §4.5 (b), R-STR-6)", () => {
  it("undo of my merge restores the separator with its original id on the collaborator's side", async () => {
    const pair = await mountPair(
      p0Doc([
        { paragraphId: "paragraph:1", text: "abc" },
        { paragraphId: "paragraph:2", text: "def" },
      ]),
    );
    const { edA, edB, ydoc, ytext, meta } = pair;
    edA.mergeWithPrevious("paragraph:2");
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1"]);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("abcdef");
    // A collaborator inserts at the merged end (sequence position after "def").
    edB.typeText("paragraph:1", "XYZ");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("abcdefXYZ");
    const replicaA = forkReplica(ydoc);
    const replicaB = forkReplica(ydoc);
    edA.undo();
    // The deleted separator returns with its original payload: the head keeps
    // "abc", the restored tail carries "def" plus the collaborator's "XYZ".
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1", "paragraph:2"]);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("abc");
    expect(textOf(ytext, meta, P0, "paragraph:2")).toBe("defXYZ");
    expect(separatorIds(ytext)).toEqual(["paragraph:1", "paragraph:2"]);
    syncDocs([ydoc, replicaA.doc, replicaB.doc]);
    assertQuiescent("2b", P0, [
      { ydoc, ytext, meta },
      { ydoc: replicaA.doc, ytext: replicaA.text, meta: replicaA.meta },
      { ydoc: replicaB.doc, ytext: replicaB.text, meta: replicaB.meta },
    ]);
  });
});

describe("CL-3b1-2c undo never touches collaborator items (spec §4.5 (c))", () => {
  it("my separator undo keeps collaborator text and the collaborator separator", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "abc" }]));
    const { edA, edB, ydoc, ytext, meta } = pair;
    // My split at offset 1: paragraph:1 "a" + tail "bc".
    edA.splitParagraph("paragraph:1", 1);
    const tailId = idsOf(ytext, meta, P0).find((id) => id !== "paragraph:1") as string;
    // The collaborator types into my tail, then splits it: two separators now.
    edB.typeText(tailId, "XYZ");
    edB.splitParagraph(tailId, 1);
    const tail2Id = idsOf(ytext, meta, P0).find(
      (id) => id !== "paragraph:1" && id !== tailId,
    ) as string;
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1", tailId, tail2Id]);
    expect(textOf(ytext, meta, P0, tailId)).toBe("b");
    expect(textOf(ytext, meta, P0, tail2Id)).toBe("cXYZ");
    const replicaA = forkReplica(ydoc);
    const replicaB = forkReplica(ydoc);
    // My undo removes only my separator: "a" rejoins "b", the collaborator
    // separator and every collaborator character survive unmoved.
    edA.undo();
    expect(idsOf(ytext, meta, P0)).toEqual(["paragraph:1", tail2Id]);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("ab");
    expect(textOf(ytext, meta, P0, tail2Id)).toBe("cXYZ");
    expect(separatorIds(ytext)).toEqual(["paragraph:1", tail2Id]);
    syncDocs([ydoc, replicaA.doc, replicaB.doc]);
    assertQuiescent("2c", P0, [
      { ydoc, ytext, meta },
      { ydoc: replicaA.doc, ytext: replicaA.text, meta: replicaA.meta },
      { ydoc: replicaB.doc, ytext: replicaB.text, meta: replicaB.meta },
    ]);
  });
});

describe("CL-3b1-2d undo isolation between two bound editors", () => {
  it("each undo removes only its own origin's items", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "base" }]));
    const { edA, edB, ydoc, ytext, meta, gesturesA, gesturesB } = pair;
    edA.typeText("paragraph:1", "AAA");
    edB.typeText("paragraph:1", "BBB");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseAAABBB");
    gesturesA.length = 0;
    edA.undo();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseBBB");
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("undo");
    gesturesB.length = 0;
    edB.undo();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    expect(gesturesB).toHaveLength(1);
    expect(gesturesB[0]?.gesture.kind).toBe("undo");
    // An empty undo stack is a silent no-op: no throw, no gesture, unchanged.
    gesturesA.length = 0;
    expect(() => edA.undo()).not.toThrow();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    expect(gesturesA).toHaveLength(0);
    // Redo restores exactly my items; the emptied redo stack then no-ops.
    edA.redo();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseAAA");
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("redo");
    expect(() => edA.redo()).not.toThrow();
    expect(gesturesA).toHaveLength(1);
    const replica = forkReplica(ydoc);
    syncDocs([ydoc, replica.doc]);
    assertQuiescent("2d", P0, [
      { ydoc, ytext, meta },
      { ydoc: replica.doc, ytext: replica.text, meta: replica.meta },
    ]);
  });

  it("an inactive bound editor performs no undo", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "base" }]));
    const { edA, ytext, meta, gesturesA } = pair;
    edA.typeText("paragraph:1", "AAA");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseAAA");
    edA.setDisabled(true);
    gesturesA.length = 0;
    expect(() => edA.undo()).not.toThrow();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseAAA");
    expect(gesturesA).toHaveLength(0);
    edA.setDisabled(false);
    edA.undo();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    expect(gesturesA).toHaveLength(1);
  });
});

function fullDoc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: FULL,
    blocks: blocks.map((block) => ({
      paragraphId: block.paragraphId,
      kind: "paragraph",
      segments: [{ type: "text", text: block.text, marks: {} }],
    })),
  } as unknown as RichTextDocument;
}

/** Top-level block position of an identity block in an editor view. */
function blockPos(ed: RichTextEditor, id: string): number {
  let found = -1;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      found = pos;
      return false;
    }
    return true;
  });
  expect(found).toBeGreaterThanOrEqual(0);
  return found;
}

/** Inline PM position of a needle inside a paragraph's text. */
function pmTextPos(ed: RichTextEditor, needle: string, offset: number): number {
  let found = -1;
  ed.view.state.doc.descendants((node, pos) => {
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

describe("CL-3b1-2e metadata undo (R-STR-6 map half, R-LIN-8)", () => {
  it("undo of my block-metadata write undoes only that map write", async () => {
    const pair = await mountPair(
      fullDoc([
        { paragraphId: "paragraph:1", text: "alpha" },
        { paragraphId: "paragraph:2", text: "beta" },
      ]),
    );
    const { edA, edB, ydoc, ytext, meta } = pair;
    const toHeading = (ed: RichTextEditor, id: string): void => {
      const pos = blockPos(ed, id);
      const node = ed.view.state.doc.nodeAt(pos);
      ed.view.dispatch(
        ed.view.state.tr.setNodeMarkup(pos, ed.view.state.schema.nodes.heading, {
          ...(node?.attrs ?? {}),
          level: 1,
        }),
      );
    };
    // The collaborator converts paragraph:2 first (distinct origin).
    toHeading(edB, "paragraph:2");
    expect((meta.get("paragraph:2") as Record<string, unknown> | undefined)?.["blockKind"]).toBe(
      "heading",
    );
    // My conversion of paragraph:1 is the tracked step under test.
    toHeading(edA, "paragraph:1");
    expect((meta.get("paragraph:1") as Record<string, unknown> | undefined)?.["blockKind"]).toBe(
      "heading",
    );
    const replicaA = forkReplica(ydoc);
    const replicaB = forkReplica(ydoc);
    edA.undo();
    // My map write is undone (entry back to absent); the collaborator's
    // heading entry is untouched, and both projected documents agree.
    expect(meta.get("paragraph:1")).toBeUndefined();
    expect((meta.get("paragraph:2") as Record<string, unknown> | undefined)?.["blockKind"]).toBe(
      "heading",
    );
    expect(edA.view.state.doc.nodeAt(blockPos(edA, "paragraph:1"))?.type.name).toBe("paragraph");
    expect(edA.view.state.doc.nodeAt(blockPos(edA, "paragraph:2"))?.type.name).toBe("heading");
    syncDocs([ydoc, replicaA.doc, replicaB.doc]);
    assertQuiescent("2e", FULL, [
      { ydoc, ytext, meta },
      { ydoc: replicaA.doc, ytext: replicaA.text, meta: replicaA.meta },
      { ydoc: replicaB.doc, ytext: replicaB.text, meta: replicaB.meta },
    ]);
  });
});

describe("CL-3b1-2f mark boundary (spec §4.5 boundary, AMB-2)", () => {
  it("a mark-only gesture never enters the stacks; undo consumes the text step", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]));
    const { edA, ytext, meta, gesturesA } = pair;
    const bold = (from: number, to: number): void => {
      edA.view.dispatch(
        edA.view.state.tr.addMark(from, to, edA.view.state.schema.marks.bold.create()),
      );
    };
    const hasBold = (needle: string): boolean => {
      let found = false;
      edA.view.state.doc.descendants((node) => {
        if (node.isText && node.text !== undefined && node.text.includes(needle)) {
          if (node.marks.some((mark) => mark.type.name === "bold")) found = true;
        }
        return true;
      });
      return found;
    };
    // Mark-only on a fresh editor: bold applies, but the stack stays empty —
    // undo is a silent no-op and the mark survives. (The P0 capture renders
    // bold runs with `**` sigils in `text`.)
    bold(pmTextPos(edA, "alpha", 0), pmTextPos(edA, "alpha", 5));
    expect(hasBold("alpha")).toBe(true);
    gesturesA.length = 0;
    expect(() => edA.undo()).not.toThrow();
    expect(gesturesA).toHaveLength(0);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("**alpha**");
    expect(hasBold("alpha")).toBe(true);
    // A text step followed by a mark-only gesture: undo consumes the text
    // step, not the mark — "X" disappears while the bold on "alpha" stays.
    edA.typeText("paragraph:1", "X");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("**alphaX**");
    const wholeFrom = pmTextPos(edA, "alpha", 0);
    bold(wholeFrom, wholeFrom + 6);
    expect(hasBold("alpha")).toBe(true);
    gesturesA.length = 0;
    edA.undo();
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("**alpha**");
    expect(hasBold("alpha")).toBe(true);
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("undo");
  });
});

describe("CL-3b1-2g HR atom undo/redo (R-FULL-HR-1)", () => {
  it("undo/redo of an HR insertion restores/removes the original pair with its id", async () => {
    const pair = await mountPair(
      fullDoc([
        { paragraphId: "paragraph:1", text: "alpha" },
        { paragraphId: "paragraph:2", text: "beta" },
      ]),
    );
    const { edA, ydoc, ytext, meta, gesturesA } = pair;
    const insertHrBefore = (id: string): void => {
      const pos = blockPos(edA, id);
      edA.view.dispatch(
        edA.view.state.tr.insert(pos, edA.view.state.schema.nodes.horizontalRule.create()),
      );
    };
    insertHrBefore("paragraph:2");
    const ids = idsOf(ytext, meta, FULL);
    expect(ids).toHaveLength(3);
    expect(ids[0]).toBe("paragraph:1");
    expect(ids[2]).toBe("paragraph:2");
    const hrId = ids[1] as string;
    // The shared sequence carries the separator+atom pair for the HR.
    const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
    const pairAt = delta.findIndex(
      (op) =>
        typeof op.insert === "object" &&
        op.insert !== null &&
        "separator" in (op.insert as Record<string, unknown>) &&
        ((op.insert as { separator: { paragraphId: string; kind: string } }).separator
          .paragraphId === hrId),
    );
    expect(pairAt).toBeGreaterThanOrEqual(0);
    expect(
      (delta[pairAt] as { insert: { separator: { kind: string } } }).insert.separator.kind,
    ).toBe("horizontalRule");
    expect(delta[pairAt + 1]?.insert).toEqual({ horizontalRule: { paragraphId: hrId } });
    const hrCapture = JSON.stringify(
      captureDocumentFromField(ytext, meta, FULL).document.blocks.find(
        (block) => block.paragraphId === hrId,
      ),
    );
    const replicaA = forkReplica(ydoc);
    const replicaB = forkReplica(ydoc);
    // Undo removes the pair; redo restores the same pair with the same id
    // and the same retained wrapper metadata — never a text snapshot.
    gesturesA.length = 0;
    edA.undo();
    expect(idsOf(ytext, meta, FULL)).toEqual(["paragraph:1", "paragraph:2"]);
    expect(separatorIds(ytext)).not.toContain(hrId);
    expect(textOf(ytext, meta, FULL, "paragraph:1")).toBe("alpha");
    expect(textOf(ytext, meta, FULL, "paragraph:2")).toBe("beta");
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("undo");
    gesturesA.length = 0;
    edA.redo();
    expect(idsOf(ytext, meta, FULL)).toEqual(["paragraph:1", hrId, "paragraph:2"]);
    expect(
      captureDocumentFromField(ytext, meta, FULL).document.blocks.find(
        (block) => block.paragraphId === hrId,
      ),
    ).toEqual(JSON.parse(hrCapture));
    expect(gesturesA).toHaveLength(1);
    expect(gesturesA[0]?.gesture.kind).toBe("redo");
    syncDocs([ydoc, replicaA.doc, replicaB.doc]);
    assertQuiescent("2g", FULL, [
      { ydoc, ytext, meta },
      { ydoc: replicaA.doc, ytext: replicaA.text, meta: replicaA.meta },
      { ydoc: replicaB.doc, ytext: replicaB.text, meta: replicaB.meta },
    ]);
  });
});

describe("CL-3b1-2h undo is one shared transaction, never re-projected", () => {
  it("an undo transaction advances the state vector exactly once with no echo", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "base" }]));
    const { edA, ydoc, ytext, meta } = pair;
    edA.typeText("paragraph:1", "hello");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("basehello");
    const vectorOf = (): string =>
      Buffer.from(Y.encodeStateVector(ydoc)).toString("hex");
    const seen: Array<{ origin: unknown; changed: number; vector: string }> = [];
    const count = (transaction: {
      origin: unknown;
      changedParentTypes: { size: number };
    }): void => {
      seen.push({
        origin: transaction.origin,
        changed: transaction.changedParentTypes.size,
        vector: vectorOf(),
      });
    };
    ydoc.on("afterTransaction", count as never);
    try {
      edA.undo();
    } finally {
      ydoc.off("afterTransaction", count as never);
    }
    // The undo applies as exactly one content transaction (the manager's):
    // the repaint dispatches a binding-origin PM transaction (no Yjs write)
    // and nothing echoes back through pmToYText. (Undo tombstones or
    // revives kept items, so it advances no state-vector clocks; the content
    // change itself is the observable.) Yjs itself opens an empty read
    // transaction when our observer reads the lazy event delta (null origin,
    // no changed types) — internal read housekeeping, not a re-projection.
    const content = seen.filter((entry) => entry.changed > 0);
    expect(content).toHaveLength(1);
    expect(content[0]?.origin).not.toBeNull();
    for (const entry of seen) {
      if (entry.changed === 0) expect(entry.vector).toBe(content[0]?.vector);
    }
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    expect(captureJson(ytext, meta, P0)).toBe(
      captureJson(forkReplica(ydoc).text, forkReplica(ydoc).meta, P0),
    );
  });
});

describe("CL-3b1-2i bound history keys (Mod-z / Mod-Shift-z / Mod-y)", () => {
  it("the controlled history keys drive the field UndoManager in bound mode", async () => {
    const pair = await mountPair(p0Doc([{ paragraphId: "paragraph:1", text: "base" }]));
    const { edA, ytext, meta } = pair;
    edA.typeText("paragraph:1", "Q");
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseQ");
    const press = (key: string, shiftKey: boolean, metaKey: boolean, ctrlKey: boolean): void => {
      const event = new KeyboardEvent("keydown", {
        key,
        shiftKey,
        metaKey,
        ctrlKey,
        bubbles: true,
        cancelable: true,
      });
      const handled = edA.view.someProp("handleKeyDown", (fn) =>
        (fn as (view: unknown, event: unknown) => boolean)(edA.view, event),
      );
      expect(handled).toBe(true);
    };
    press("z", false, true, false);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    press("y", false, true, false);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseQ");
    press("z", false, false, true);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("base");
    press("Z", true, true, false);
    expect(textOf(ytext, meta, P0, "paragraph:1")).toBe("baseQ");
  });
});
