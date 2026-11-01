/**
 * CL-3b1 witness 3 — preserved-block gate (spec §4.4, R-LIN-6/R-LIN-8,
 * CL-3b1 Task 4).
 *
 * A preserved-bearing field (host-seeded editable paragraphs adjacent to
 * `preserved` segments carrying `raw` slices that would change under any
 * reserialisation — trailing spaces, entity-like text, CRLF) goes through
 * editable merges on both sides of a preserved segment, adjacent splits and
 * typing, undo/redo around the preserved content (the item-2 manager), and
 * an offline replica merging concurrently. Every `raw` must stay
 * byte-identical (`===` on the exact strings) on every replica and through
 * `captureDocument()`; preserved identities and order are unchanged while
 * the editable merges take effect normally.
 *
 * The refusal half locks the pre-existing binding filter: a local step
 * deleting the preserved embed, a range crossing it, or a slice carrying a
 * preserved node is refused whole with the shared state vector unchanged.
 * Two layers share the gate: the ProseMirror `filterTransaction` guard
 * (§6.3, identity plus the exact verbatim payload per node) silently drops
 * any transaction that adds, removes or alters a preserved node before the
 * projection ever runs, and the imperative editor paths that cannot name a
 * preserved neighbour stay silent no-ops. The projection-level typed
 * refusal (`rich-text.collab-preserved-denied`) is the defence-in-depth
 * half for direct projection callers and is pinned at unit level by
 * `collab-rev2.test.ts` ("AttrStep tampering a preserved block raw").
 *
 * RED on the CL-3a base: the combination below had no witness, and the
 * undo/redo-around-preserved steps fail closed (`bound-undo-unavailable`),
 * the same base anchor as witness 2.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import type { RichTextEditor } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import { linearBlocksOf } from "./collab-projection.js";
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

let counter = 2000;

/** Raw slices that change under any reserialisation: trailing and doubled
    spaces, entity-like text, CRLF line endings. */
const RAW_TABLE = "<table>  spaced  </table>";
const RAW_ENTITIES = "a &amp; b\r\nline2 ";

function fullPara(id: string, text: string): Record<string, unknown> {
  return {
    paragraphId: id,
    kind: "paragraph",
    segments: [{ type: "text", text, marks: {} }],
  };
}

/** Editable paragraphs around two preserved segments (before-side pair,
    after-side pair, far-end pair whose second member the offline replica
    merges: merging into a preserved predecessor is itself refused, so the
    offline merge needs an editable predecessor of its own). */
function preservedField(): RichTextDocument {
  return {
    format: FULL,
    blocks: [
      fullPara("p:1", "aa"),
      fullPara("p:2", "bb"),
      { paragraphId: "k:table", kind: "preserved", raw: RAW_TABLE, preservedKind: "table" },
      fullPara("p:3", "cc"),
      fullPara("p:4", "dd"),
      { paragraphId: "k:ent", kind: "preserved", raw: RAW_ENTITIES, preservedKind: "html" },
      fullPara("p:5", "ee"),
      fullPara("p:6", "ff"),
    ],
  } as unknown as RichTextDocument;
}

interface Replica {
  doc: Y.Doc;
  text: Y.Text;
  meta: Y.Map<unknown>;
}

/** A fresh authoritative field seeded with `document`. */
function seedAuthority(document: RichTextDocument): Replica {
  const doc = new Y.Doc();
  const text = doc.getText(fieldTextName(FIELD));
  const meta = doc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(text, meta, FIELD, document);
  return { doc, text, meta };
}

function fork(authority: Y.Doc): Replica {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(authority));
  return {
    doc,
    text: doc.getText(fieldTextName(FIELD)),
    meta: doc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
  };
}

function vectorHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateVector(doc)).toString("hex");
}

function captureJson(replica: Replica, format: string): string {
  return JSON.stringify(captureDocumentFromField(replica.text, replica.meta, format).document);
}

function assertQuiescent(label: string, format: string, replicas: Replica[]): void {
  const vectors = replicas.map((replica) => vectorHex(replica.doc));
  for (const vector of vectors) expect(vector, `${label}: state vectors agree`).toBe(vectors[0]);
  const captures = replicas.map((replica) => captureJson(replica, format));
  for (const capture of captures) expect(capture, `${label}: documents agree`).toBe(captures[0]);
}

/** Merge: delete the separator embed opening the named paragraph (R-STR-3). */
function mergeParagraph(replica: Replica, paragraphId: string): void {
  const blocks = linearBlocksOf(replica.text);
  const target = blocks.find((block) => block.paragraphId === paragraphId);
  expect(target, `separator of ${paragraphId} exists`).toBeDefined();
  replica.text.delete((target as { separatorIndex: number }).separatorIndex, 1);
}

function idsOf(replica: Replica, format: string): string[] {
  return captureDocumentFromField(replica.text, replica.meta, format).document.blocks.map(
    (block) => block.paragraphId,
  );
}

function textsOf(replica: Replica, format: string): string[] {
  return (
    captureDocumentFromField(replica.text, replica.meta, format).document.blocks as Array<{
      text?: string;
      segments?: Array<{ type?: string; text?: string }>;
    }>
  ).map((block) => {
    if (typeof block.text === "string") return block.text;
    return (block.segments ?? [])
      .map((segment) => (segment.type === "text" ? (segment.text ?? "") : ""))
      .join("");
  });
}

/** The verbatim `raw` of a preserved block on a replica (Y-side capture). */
function rawOf(replica: Replica, id: string): unknown {
  const blocks = captureDocumentFromField(replica.text, replica.meta, FULL).document
    .blocks as Array<{ paragraphId?: string; raw?: unknown }>;
  return blocks.find((block) => block.paragraphId === id)?.raw;
}

interface SessionPair {
  edA: RichTextEditor;
  edB: RichTextEditor;
  docA: Y.Doc;
  textA: Y.Text;
  metaA: Y.Map<unknown>;
  docB: Y.Doc;
  textB: Y.Text;
  metaB: Y.Map<unknown>;
  errorsA: unknown[];
  errorsB: unknown[];
}

/**
 * Two independent bound sessions over forked replicas of one seeded doc.
 * Forks share Yjs item identity (true replicas); a local test source binds
 * each editor to its fork, so concurrent gestures neither observe each
 * other. Seeding twice would mint distinct identities and fake a conflict.
 */
async function twoSessions(document: RichTextDocument): Promise<SessionPair> {
  counter += 1;
  const profile = document.format === FULL ? "full" : "p0";
  const authority = seedAuthority(document);
  const mkEditor = async (
    forked: Replica,
    tag: string,
    actorId: string,
  ): Promise<{ ed: RichTextEditor; errors: unknown[] }> => {
    const identity: FieldBindingIdentity = {
      documentId: `pres:${tag}:canvas:${counter}`,
      sessionId: `pres:${tag}:session:${counter}`,
      fieldKey: FIELD,
    };
    const { Awareness } = await import("y-protocols/awareness");
    const awareness = new Awareness(forked.doc);
    const source = {
      resolveBinding: () => ({
        identity: { ...identity },
        text: forked.text,
        fieldMeta: forked.meta,
        awareness,
      }),
      releaseBinding: () => {},
    };
    let n = 0;
    const errors: unknown[] = [];
    const ed = await createBoundRichTextEditor({
      document,
      profile: profile as "p0",
      messages: { ...MESSAGES },
      allocateId: () => `fresh:sess:${tag}:${counter}:${(n += 1)}`,
      collaborationBinding: identity,
      collaborationSource: source as never,
      collaborationActor: { actorId, kind: "human" },
      element: globalThis.document.createElement("div"),
      onBindingError: (event) => errors.push(event),
    });
    mounted.push(ed);
    return { ed, errors };
  };
  const forkA = fork(authority.doc);
  const forkB = fork(authority.doc);
  const { ed: edA, errors: errorsA } = await mkEditor(forkA, "a", `pres-a-${counter}`);
  const { ed: edB, errors: errorsB } = await mkEditor(forkB, "b", `pres-b-${counter}`);
  return {
    edA,
    edB,
    docA: forkA.doc,
    textA: forkA.text,
    metaA: forkA.meta,
    docB: forkB.doc,
    textB: forkB.text,
    metaB: forkB.meta,
    errorsA,
    errorsB,
  };
}

/** Sync two session docs in the given delivery order, then converge fully. */
function syncSessions(
  a: { doc: Y.Doc },
  b: { doc: Y.Doc },
  order: "ab" | "ba",
): void {
  const updateA = Y.encodeStateAsUpdate(a.doc);
  const updateB = Y.encodeStateAsUpdate(b.doc);
  if (order === "ab") {
    Y.applyUpdate(b.doc, updateA);
    Y.applyUpdate(a.doc, updateB);
  } else {
    Y.applyUpdate(a.doc, updateB);
    Y.applyUpdate(b.doc, updateA);
  }
}

/** Insert text at the start of a block's inline content. */
function insertBlockStartText(ed: RichTextEditor, id: string, str: string): void {
  let start = -1;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      start = pos + 1;
      return false;
    }
    return true;
  });
  expect(start).toBeGreaterThan(-1);
  ed.view.dispatch(ed.view.state.tr.insertText(str, start));
}

/** Delete exactly the named top-level node through a raw dispatch. */
function deleteNodeById(ed: RichTextEditor, id: string): void {
  let found = -1;
  let size = 0;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      found = pos;
      size = node.nodeSize;
      return false;
    }
    return true;
  });
  expect(found, `node ${id} exists`).toBeGreaterThanOrEqual(0);
  ed.view.dispatch(ed.view.state.tr.delete(found, found + size));
}

/** Delete the range from the end of one block's text to the start of
    another block's text (crosses every separator and atom between). */
function deleteRangeBetweenBlocks(ed: RichTextEditor, fromId: string, toId: string): void {
  let from = -1;
  let to = -1;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === fromId) from = pos + node.nodeSize - 1;
    if (node.attrs?.["paragraphId"] === toId) to = pos + 1;
    return true;
  });
  expect(from, `end of ${fromId}`).toBeGreaterThan(-1);
  expect(to, `start of ${toId}`).toBeGreaterThan(-1);
  expect(to, "range is forward").toBeGreaterThan(from);
  ed.view.dispatch(ed.view.state.tr.delete(from, to));
}

/** Replace a whole paragraph with a preserved node through a raw dispatch:
    the slice carries preserved content into an editable position. */
function replaceBlockWithPreserved(ed: RichTextEditor, id: string): void {
  let found = -1;
  let size = 0;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      found = pos;
      size = node.nodeSize;
      return false;
    }
    return true;
  });
  expect(found, `node ${id} exists`).toBeGreaterThanOrEqual(0);
  const preserved = ed.view.state.schema.nodes.preservedBlock.create({
    paragraphId: "k:injected",
    raw: "<injected/>",
    preservedKind: "table",
  });
  ed.view.dispatch(ed.view.state.tr.replaceWith(found, found + size, preserved));
}

/** Rewrite a preserved block's verbatim payload through node attributes. */
function setPreservedRaw(ed: RichTextEditor, id: string, raw: string): void {
  let found = -1;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      found = pos;
      return false;
    }
    return true;
  });
  expect(found, `node ${id} exists`).toBeGreaterThanOrEqual(0);
  const node = ed.view.state.doc.nodeAt(found);
  expect(node).not.toBeNull();
  ed.view.dispatch(
    ed.view.state.tr.setNodeMarkup(found, undefined, {
      ...((node as unknown as { attrs: Record<string, unknown> }).attrs),
      raw,
    }),
  );
}

/** The verbatim `raw` of a preserved block through an editor's displayed
    document (`captureDocument()`, PM side). */
async function displayedRaw(ed: RichTextEditor, id: string): Promise<unknown> {
  const captured = await ed.captureDocument();
  const blocks = captured.document.blocks as Array<{ paragraphId?: string; raw?: unknown }>;
  return blocks.find((block) => block.paragraphId === id)?.raw;
}

describe("CL-3b1-3 editable work around preserved segments", () => {
  it("merges, splits, typing, an offline merge and undo/redo keep every raw byte-identical", async () => {
    for (const order of ["ab", "ba"] as const) {
      const s = await twoSessions(preservedField());
      // A merges the before-side pair and splits/types on the after-side;
      // B types at the far end. AMB-8 deterministic steps between gestures.
      s.edA.mergeWithPrevious("p:2");
      s.edA.stopCapturing();
      s.edA.splitParagraph("p:4", 1);
      s.edA.stopCapturing();
      s.edA.typeText("p:3", "ZZ");
      s.edA.stopCapturing();
      insertBlockStartText(s.edB, "p:5", "QQ");
      expect(s.errorsA, `3-combo-${order} A errors`).toEqual([]);
      expect(s.errorsB, `3-combo-${order} B errors`).toEqual([]);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      // Offline fork merges p:6 into p:5 (an editable predecessor — a merge
      // into a preserved predecessor would itself refuse), arriving last.
      const c = fork(s.docB);
      mergeParagraph(c, "p:6");
      Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
      Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
      Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
      const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
      const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
      assertQuiescent(`3-combo-${order}`, FULL, [a, b, c]);
      // The editable merges took effect; preserved identities and order
      // are unchanged (the split tail carries a fresh id). `textsOf`
      // reads `""` for the preserved blocks, which carry no text runs.
      const fresh = idsOf(a, FULL)[4];
      expect(typeof fresh).toBe("string");
      for (const replica of [a, b, c]) {
        expect(idsOf(replica, FULL)).toEqual(["p:1", "k:table", "p:3", "p:4", fresh, "k:ent", "p:5"]);
        expect(textsOf(replica, FULL)).toEqual(["aabb", "", "ccZZ", "d", "d", "", "QQeeff"]);
        // Byte-identical raws on every replica: `===` on the exact seeded
        // strings, trailing spaces, entity-like text and CRLF included.
        expect(rawOf(replica, "k:table")).toBe(RAW_TABLE);
        expect(rawOf(replica, "k:ent")).toBe(RAW_ENTITIES);
      }
      // And through the displayed document on both editors.
      for (const ed of [s.edA, s.edB]) {
        expect(await displayedRaw(ed, "k:table")).toBe(RAW_TABLE);
        expect(await displayedRaw(ed, "k:ent")).toBe(RAW_ENTITIES);
      }
      // Undo/redo around the preserved segments on A: the manager reverts
      // only the editable gestures; every raw stays byte-identical after
      // each step and the preserved order never shifts.
      const rawsNow = (): void => {
        expect(rawOf(a, "k:table")).toBe(RAW_TABLE);
        expect(rawOf(a, "k:ent")).toBe(RAW_ENTITIES);
      };
      s.edA.undo(); // type
      expect(idsOf(a, FULL)).toEqual(["p:1", "k:table", "p:3", "p:4", fresh, "k:ent", "p:5"]);
      expect(textsOf(a, FULL)).toEqual(["aabb", "", "cc", "d", "d", "", "QQeeff"]);
      rawsNow();
      s.edA.undo(); // split
      expect(idsOf(a, FULL)).toEqual(["p:1", "k:table", "p:3", "p:4", "k:ent", "p:5"]);
      expect(textsOf(a, FULL)).toEqual(["aabb", "", "cc", "dd", "", "QQeeff"]);
      rawsNow();
      s.edA.undo(); // merge
      expect(idsOf(a, FULL)).toEqual(["p:1", "p:2", "k:table", "p:3", "p:4", "k:ent", "p:5"]);
      expect(textsOf(a, FULL)).toEqual(["aa", "bb", "", "cc", "dd", "", "QQeeff"]);
      rawsNow();
      s.edA.redo(); // merge
      s.edA.redo(); // split
      s.edA.redo(); // type
      expect(idsOf(a, FULL)).toEqual(["p:1", "k:table", "p:3", "p:4", fresh, "k:ent", "p:5"]);
      expect(textsOf(a, FULL)).toEqual(["aabb", "", "ccZZ", "d", "d", "", "QQeeff"]);
      rawsNow();
      // The undone/redone history converges again on both sessions.
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      assertQuiescent(`3-combo-undo-${order}`, FULL, [a, b]);
      for (const replica of [a, b]) {
        expect(rawOf(replica, "k:table")).toBe(RAW_TABLE);
        expect(rawOf(replica, "k:ent")).toBe(RAW_ENTITIES);
      }
    }
  });
});

describe("CL-3b1-3 refusals touching preserved content", () => {
  it("local steps deleting, crossing, injecting or rewriting preserved content refuse whole", async () => {
    const s = await twoSessions(preservedField());
    const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
    const before = vectorHex(s.docA);
    const idsBefore = idsOf(a, FULL);
    // The §6.3 guard drops these transactions before the projection runs:
    // silent, no event. Fail-closed means the shared vector never moves
    // and the local view keeps every block and every raw byte.
    const checkSilentlyDropped = (label: string): void => {
      expect(s.errorsA, `${label} silent`).toEqual([]);
      expect(vectorHex(s.docA), `${label} vector`).toBe(before);
      expect(idsOf(a, FULL), `${label} ids`).toEqual(idsBefore);
      expect(rawOf(a, "k:table"), `${label} raw table`).toBe(RAW_TABLE);
      expect(rawOf(a, "k:ent"), `${label} raw entities`).toBe(RAW_ENTITIES);
    };
    // (a) Deleting the preserved embed.
    deleteNodeById(s.edA, "k:table");
    checkSilentlyDropped("atom delete");
    // (b) A range crossing the preserved segment (end of p:2 to start of
    // p:3): a merge across preserved content refuses whole.
    deleteRangeBetweenBlocks(s.edA, "p:2", "p:3");
    checkSilentlyDropped("crossing range");
    // (c) A slice carrying a preserved node into an editable paragraph.
    replaceBlockWithPreserved(s.edA, "p:1");
    checkSilentlyDropped("preserved slice");
    // (d) Rewriting the verbatim payload through node attributes: the
    // guard inventories identity plus the exact raw, so the tamper drops.
    setPreservedRaw(s.edA, "k:table", "<injected/>");
    checkSilentlyDropped("raw rewrite");
    // (e) The imperative merge into a preserved neighbour is a silent
    // no-op at the editor level: no transaction, no error, no change.
    s.edA.mergeWithPrevious("p:3");
    checkSilentlyDropped("merge into preserved");
    // (f) `deleteBlocks` over a preserved id is a silent no-op likewise.
    s.edA.deleteBlocks(["k:table"]);
    checkSilentlyDropped("deleteBlocks preserved");
    // The editor stays live after the refusals: a legal gesture on an
    // editable neighbour applies normally with no error outstanding.
    s.edA.typeText("p:1", "Q");
    expect(s.errorsA, "liveness errors").toEqual([]);
    expect(vectorHex(s.docA), "liveness vector moved").not.toBe(before);
    expect(rawOf(a, "k:table"), "liveness raw table").toBe(RAW_TABLE);
    expect(rawOf(a, "k:ent"), "liveness raw entities").toBe(RAW_ENTITIES);
    expect(textsOf(a, FULL)[0], "liveness text").toBe("aaQ");
  });
});
