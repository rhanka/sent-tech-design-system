/**
 * CL-3a fix 2 — review pass 2 witnesses (Argon B-NEW-1..7, to-fix 1/2).
 *
 * RED on d484f514: every scenario below failed there — the bound entry was
 * unreachable through the `./editor` seam and auto-seeded instead of failing
 * closed (B-NEW-1); remote split tails carried an allocator-minted id
 * diverging from the PM tail (B-NEW-2); one remote transaction touching
 * `Y.Text` and `fieldmeta` applied twice, once per change (B-NEW-3); remote
 * wrapper changes rebuilt paragraph ranges that no longer matched the
 * wrappers, ending in ReplaceError (B-NEW-4); the split projection lost the
 * opener's ordered run values and rewrote the 2nd+ nested item's listRunId
 * (B-NEW-5); both accumulation catch blocks swallowed failures, and a local
 * refusal left Y.Text rolled back but the PM showing the refused edit
 * (B-NEW-6); verifyP0Agreement compared preserved blocks against a captured
 * paragraph-only subset, so any local edit on a document with a preserved
 * block threw (B-NEW-7).
 *
 * Witness 7 (the offline gate: no `yjs` module in the controlled entries)
 * is covered by `no-network.test.ts` and `collab-packaging.test.ts`, which
 * stayed green through the fix (cited in the report, not duplicated here).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import {
  createRichTextEditor,
  type RichTextEditor,
  type RichTextBindingErrorEvent,
} from "./editor.js";
// CL-3a fix 3: the bound runtime is imported by the caller (here: the test,
// standing in for the host adapter that imports the
// "@sentropic/design-system-rich-text/editor/collaboration" subpath) and
// injected through `collaborationRuntime`; the `"./editor"` entry never
// imports it, so the controlled graph reaches no collaboration module.
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  seedFieldFromDocument,
  fieldTextName,
  fieldMetaName,
} from "./collab-codec.js";
import {
  projectPmTransactionToYText,
  yTextToPmDoc,
  linearBlocksOf,
} from "./collab-projection.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
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

type Seg = { type: "text"; text: string; marks: Record<string, unknown> };

function plainMeta(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    blockKind: "paragraph",
    listKind: "none",
    listDepth: 0,
    blockquoteDepth: 0,
    containerOrder: [],
    ...overrides,
  };
}

function para(
  id: string,
  text: string,
  metadata?: Record<string, unknown>,
  segments?: Seg[],
): Record<string, unknown> {
  return {
    paragraphId: id,
    kind: "paragraph",
    ...(metadata !== undefined ? { metadata } : {}),
    segments: segments ?? [{ type: "text", text, marks: {} }],
  };
}

function fullDoc(blocks: Array<Record<string, unknown>>): RichTextDocument {
  return { format: "ds.markdown.full@1", blocks: blocks as never };
}

function p0Doc(blocks: Array<Record<string, unknown>>): RichTextDocument {
  return { format: "focus.markdown.p0@1", blocks: blocks as never };
}

const FIELD = "body";
const FULL = "ds.markdown.full@1";
const P0 = "focus.markdown.p0@1";

let counter = 0;

function freshField(prefix: string): {
  source: LiveSessionBindingSource;
  identity: FieldBindingIdentity;
} {
  counter += 1;
  const provider = createInMemoryTestDoubleProvider();
  const documentId = `${prefix}:canvas:${counter}`;
  const sessionId = `${prefix}:session:${counter}`;
  const source = provider.openSession(documentId, sessionId, [FIELD]);
  const identity: FieldBindingIdentity = { documentId, sessionId, fieldKey: FIELD };
  return { source, identity };
}

interface BoundOptions {
  document: RichTextDocument;
  /** What actually seeds the field (defaults to `document`). */
  seed?: RichTextDocument;
  /** A deliberately different `options.document` (to-fix 2: stale input). */
  staleDocument?: RichTextDocument;
  onBindingError?: (event: RichTextBindingErrorEvent) => void;
}

/** Mount a bound editor through the `./editor` seam (B-NEW-1) on a field
 * seeded with `seed`, ignoring `options.document` content for the mount. */
async function boundEditor(
  options: BoundOptions & { source?: never; identity?: never },
): Promise<{
  ed: RichTextEditor;
  ydoc: Y.Doc;
  ytext: Y.Text;
  meta: Y.Map<unknown>;
}> {
  const { source, identity } = freshField("rev2");
  return boundEditorOn(source, identity, options);
}

async function boundEditorOn(
  source: LiveSessionBindingSource,
  identity: FieldBindingIdentity,
  options: BoundOptions,
): Promise<{
  ed: RichTextEditor;
  ydoc: Y.Doc;
  ytext: Y.Text;
  meta: Y.Map<unknown>;
}> {
  const resolved = source.resolveBinding(identity);
  const seed = options.seed ?? options.document;
  if (seed !== null && resolved.text.length === 0) {
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, seed);
  }
  const ed = await createRichTextEditor({
    document: options.staleDocument ?? options.document,
    profile: (options.document ?? options.staleDocument).format === FULL ? "full" : "p0",
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:rev2:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: source,
    collaborationRuntime: createBoundRichTextEditor,
    ...(options.onBindingError !== undefined ? { onBindingError: options.onBindingError } : {}),
    element: globalThis.document.createElement("div"),
  });
  mounted.push(ed);
  return {
    ed,
    ydoc: (resolved.text as unknown as { doc: Y.Doc }).doc,
    ytext: resolved.text,
    meta: resolved.fieldMeta,
  };
}

/** Deliver a remote transaction to the session doc through a replica. */
function remoteFromShared(ydoc: Y.Doc, mutate: (text: Y.Text, meta: Y.Map<unknown>) => void): void {
  const replica = new Y.Doc();
  Y.applyUpdate(replica, Y.encodeStateAsUpdate(ydoc));
  replica.transact(() => {
    mutate(
      replica.getText(fieldTextName(FIELD)),
      replica.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
    );
  });
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(replica));
}

/** Patch `view.dispatch` (an own property shadowing the prototype getter) to
 * count dispatches: one remote application must be one dispatch. */
function countDispatches(ed: RichTextEditor): () => number {
  const view = ed.view as unknown as { dispatch: (tr: unknown) => void };
  const inner = view.dispatch.bind(view);
  let count = 0;
  view.dispatch = (tr: unknown) => {
    count += 1;
    inner(tr as never);
  };
  return () => count;
}

function blockIds(doc: ProseMirrorNode): string[] {
  const ids: string[] = [];
  doc.descendants((node: ProseMirrorNode) => {
    const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
    if (
      typeof id === "string" &&
      id !== "" &&
      (node.type.name === "paragraph" ||
        node.type.name === "heading" ||
        node.type.name === "codeBlock" ||
        node.type.name === "preservedBlock")
    ) {
      ids.push(id);
    }
    return true;
  });
  return ids;
}

function topNames(doc: ProseMirrorNode): string[] {
  const names: string[] = [];
  doc.forEach((child) => names.push(child.type.name));
  return names;
}

function separatorIds(text: Y.Text): string[] {
  const ids: string[] = [];
  for (const op of text.toDelta() as Array<{ insert?: unknown }>) {
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

function captureJson(ytext: Y.Text, meta: Y.Map<unknown>, format: string): string {
  return JSON.stringify(captureDocumentFromField(ytext, meta, format).document);
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

describe("CL-3a fix 2 — B-NEW-1 bound entry (spec 6.3 seam 3)", () => {
  it("createRichTextEditor with a binding routes to the bound path and mounts the shared state", async () => {
    const { ed, ytext, meta } = await boundEditor({
      document: p0Doc([
        { paragraphId: "p:1", kind: "paragraph", text: "alpha" },
        { paragraphId: "p:2", kind: "paragraph", text: "beta" },
      ]),
    });
    // The mount shows the shared projection, not options.document content.
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, P0, ed.view.state.schema))).toBe(true);
    const pmText = ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n");
    expect(pmText).toContain("alpha");
    expect(pmText).toContain("beta");
  });

  it("an unseeded field fails closed instead of auto-seeding (R-MAP-3)", async () => {
    const { source, identity } = freshField("rev2-unseeded");
    source.resolveBinding(identity); // open, never seeded
    await expect(
      createRichTextEditor({
        document: p0Doc([{ paragraphId: "p:1", kind: "paragraph", text: "alpha" }]),
        messages: { ...MESSAGES },
        allocateId: () => "fresh:unseeded:1",
        collaborationBinding: identity,
        collaborationSource: source,
        collaborationRuntime: createBoundRichTextEditor,
        element: globalThis.document.createElement("div"),
      }),
    ).rejects.toThrow("rich-text.collab-unseeded-field");
  });
});

describe("CL-3a fix 2 — B-NEW-2 one split id", () => {
  it("a bound full split carries one tail id across PM, Y.Text and the other replica, keeping the tail marks (B-NEW-7 full comparison)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([
        para("p:1", "", plainMeta(), [
          { type: "text", text: "hello ", marks: {} },
          { type: "text", text: "world", marks: { bold: true } },
        ]),
      ]),
      onBindingError: (event) => errors.push(event),
    });
    // Split inside the bold run.
    const pos = textPos(ed.view.state.doc, "world", 2);
    ed.view.dispatch(ed.view.state.tr.split(pos, 1));
    expect(errors).toEqual([]);
    const ids = blockIds(ed.view.state.doc);
    expect(ids).toHaveLength(2);
    const tailId = ids[1] as string;
    expect(tailId).not.toBe("p:1");
    // The Y.Text separator carries the PM tail id — one id, not two.
    expect(separatorIds(ytext)).toEqual(["p:1", tailId]);
    // The tail keeps its bold marks through the projection (B-NEW-7: split
    // tails are compared on segments/marks, no bypass).
    const cap = captureDocumentFromField(ytext, meta, FULL).document;
    expect(cap.blocks).toHaveLength(2);
    const tail = cap.blocks[1] as { paragraphId: string; segments: Seg[] };
    expect(tail.paragraphId).toBe(tailId);
    expect(tail.segments[0]?.marks).toEqual({ bold: true });
    // The other replica sees the same id.
    const replica = new Y.Doc();
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(ydoc));
    const replicaCap = captureDocumentFromField(
      replica.getText(fieldTextName(FIELD)),
      replica.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      FULL,
    ).document;
    expect((replicaCap.blocks[1] as { paragraphId: string }).paragraphId).toBe(tailId);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });

  it("the public splitParagraph API mints the same single id on the shared field", async () => {
    const { ed, ytext } = await boundEditor({
      document: fullDoc([para("p:1", "hello world")]),
    });
    ed.splitParagraph("p:1", 5);
    const ids = blockIds(ed.view.state.doc);
    expect(ids).toHaveLength(2);
    expect(separatorIds(ytext)).toEqual(ids);
    expect((ids[1] as string)).not.toBe("p:1");
  });
});

describe("CL-3a fix 2 — B-NEW-3 one remote application per transaction", () => {
  it("a remote transaction changing Y.Text and fieldmeta updates the local PM once with both effects", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([para("p:1", "alpha beta", plainMeta()), para("p:2", "gamma", plainMeta())]),
      onBindingError: (event) => errors.push(event),
    });
    const dispatches = countDispatches(ed);
    remoteFromShared(ydoc, (text, fieldMeta) => {
      const blocks = linearBlocksOf(text);
      const head = blocks.find((block) => block.paragraphId === "p:1");
      expect(head).toBeDefined();
      // Split p:1 (separator + tail metadata) and change p:2 to a level-3
      // heading, all inside ONE Yjs transaction.
      text.insertEmbed((head as { contentStart: number }).contentStart + 5, {
        separator: { paragraphId: "p:tail", kind: "paragraph" },
      });
      fieldMeta.set("p:tail", structuredClone(fieldMeta.get("p:1")));
      const p2 = structuredClone(fieldMeta.get("p:2")) as Record<string, unknown>;
      p2["blockKind"] = "heading";
      p2["headingLevel"] = 3;
      fieldMeta.set("p:2", p2);
    });
    expect(errors).toEqual([]);
    expect(dispatches()).toBe(1);
    expect(blockIds(ed.view.state.doc)).toEqual(["p:1", "p:tail", "p:2"]);
    const heading = ed.view.state.doc.child(2);
    expect(heading.type.name).toBe("heading");
    expect(heading.attrs["level"]).toBe(3);
    expect(heading.attrs[PARAGRAPH_ID_ATTRIBUTE]).toBe("p:2");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });

  it("a metadata-only remote change (heading level) updates the local PM once", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([para("p:1", "alpha", plainMeta()), para("p:2", "beta", plainMeta())]),
      onBindingError: (event) => errors.push(event),
    });
    const dispatches = countDispatches(ed);
    remoteFromShared(ydoc, (_text, fieldMeta) => {
      const p2 = structuredClone(fieldMeta.get("p:2")) as Record<string, unknown>;
      p2["blockKind"] = "heading";
      p2["headingLevel"] = 2;
      fieldMeta.set("p:2", p2);
    });
    expect(errors).toEqual([]);
    expect(dispatches()).toBe(1);
    expect(topNames(ed.view.state.doc)).toEqual(["paragraph", "heading"]);
    expect(ed.view.state.doc.child(1).attrs["level"]).toBe(2);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });

  it("a mark-only remote change (bold) updates the local PM once", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([para("p:1", "alpha beta")]),
      onBindingError: (event) => errors.push(event),
    });
    const dispatches = countDispatches(ed);
    remoteFromShared(ydoc, (text) => {
      const blocks = linearBlocksOf(text);
      const head = blocks.find((block) => block.paragraphId === "p:1");
      expect(head).toBeDefined();
      // Formatting rides a retain carrying attributes in the Y.Text delta.
      text.format((head as { contentStart: number }).contentStart, 5, { bold: true });
    });
    expect(errors).toEqual([]);
    expect(dispatches()).toBe(1);
    let bolded = false;
    ed.view.state.doc.descendants((node: ProseMirrorNode) => {
      if (node.isText && node.text === "alpha") {
        bolded = node.marks.some((mark) => mark.type.name === "bold");
      }
      return true;
    });
    expect(bolded).toBe(true);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });
});

describe("CL-3a fix 2 — B-NEW-4 remote application at wrapper boundaries", () => {
  function listDoc(): RichTextDocument {
    return fullDoc([
      para("p:0", "intro"),
      para("p:2", "item one", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:2", listRunId: "p:2",
        listTight: true, containerOrder: ["list"],
      })),
      para("p:3", "item two", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:3", listRunId: "p:2",
        containerOrder: ["list"],
      })),
    ]);
  }

  interface Harness {
    ed: RichTextEditor;
    ydoc: Y.Doc;
    ytext: Y.Text;
    meta: Y.Map<unknown>;
    dispatches: () => number;
    errors: RichTextBindingErrorEvent[];
  }

  async function setup(): Promise<Harness> {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: listDoc(),
      onBindingError: (event) => errors.push(event),
    });
    return { ed, ydoc, ytext, meta, dispatches: countDispatches(ed), errors };
  }

  it("a remote sink rebuilds the enclosing list; the untouched top-level node stays object-identical", async () => {
    const h = await setup();
    const introBefore = h.ed.view.state.doc.firstChild;
    remoteFromShared(h.ydoc, (_text, fieldMeta) => {
      fieldMeta.set("p:3", {
        ...(structuredClone(fieldMeta.get("p:3")) as Record<string, unknown>),
        listDepth: 1,
        containerOrder: ["list", "list"],
      } as never);
    });
    expect(h.errors).toEqual([]);
    expect(h.dispatches()).toBe(1);
    expect(topNames(h.ed.view.state.doc)).toEqual(["paragraph", "bulletList"]);
    expect(blockIds(h.ed.view.state.doc)).toEqual(["p:0", "p:2", "p:3"]);
    const list = h.ed.view.state.doc.child(1);
    expect(list.childCount).toBe(1);
    const item = list.child(0);
    expect(item.type.name).toBe("listItem");
    expect(item.childCount).toBe(2);
    expect(item.child(1).type.name).toBe("bulletList");
    // Unaffected top-level node: the very same node object.
    expect(h.ed.view.state.doc.firstChild).toBe(introBefore);
    expect(h.ed.view.state.doc.eq(yTextToPmDoc(h.ytext, h.meta, FULL, h.ed.view.state.schema))).toBe(true);
  });

  it("a remote lift moves the block out of the list", async () => {
    const h = await setup();
    remoteFromShared(h.ydoc, (_text, fieldMeta) => {
      fieldMeta.set("p:3", plainMeta() as never);
    });
    expect(h.errors).toEqual([]);
    expect(h.dispatches()).toBe(1);
    expect(topNames(h.ed.view.state.doc)).toEqual(["paragraph", "bulletList", "paragraph"]);
    expect(blockIds(h.ed.view.state.doc)).toEqual(["p:0", "p:2", "p:3"]);
    expect(h.ed.view.state.doc.eq(yTextToPmDoc(h.ytext, h.meta, FULL, h.ed.view.state.schema))).toBe(true);
  });

  it("a remote bullet-to-ordered toggle rewraps the run", async () => {
    const h = await setup();
    remoteFromShared(h.ydoc, (_text, fieldMeta) => {
      // Members carry their own listKind: a toggle rewrites every member.
      const p2 = structuredClone(fieldMeta.get("p:2")) as Record<string, unknown>;
      p2["listKind"] = "ordered";
      fieldMeta.set("p:2", p2 as never);
      const p3 = structuredClone(fieldMeta.get("p:3")) as Record<string, unknown>;
      p3["listKind"] = "ordered";
      fieldMeta.set("p:3", p3 as never);
    });
    expect(h.errors).toEqual([]);
    expect(h.dispatches()).toBe(1);
    expect(topNames(h.ed.view.state.doc)).toEqual(["paragraph", "orderedList"]);
    expect(blockIds(h.ed.view.state.doc)).toEqual(["p:0", "p:2", "p:3"]);
    expect(h.ed.view.state.doc.eq(yTextToPmDoc(h.ytext, h.meta, FULL, h.ed.view.state.schema))).toBe(true);
  });

  it("a remote blockquote wrap nests the list inside the quote", async () => {
    const h = await setup();
    remoteFromShared(h.ydoc, (_text, fieldMeta) => {
      for (const id of ["p:2", "p:3"]) {
        const record = structuredClone(fieldMeta.get(id)) as Record<string, unknown>;
        record["blockquoteDepth"] = 1;
        record["containerOrder"] = ["quote", "list"];
        fieldMeta.set(id, record as never);
      }
    });
    expect(h.errors).toEqual([]);
    expect(h.dispatches()).toBe(1);
    expect(topNames(h.ed.view.state.doc)).toEqual(["paragraph", "blockquote"]);
    const quote = h.ed.view.state.doc.child(1);
    expect(quote.child(0).type.name).toBe("bulletList");
    expect(blockIds(h.ed.view.state.doc)).toEqual(["p:0", "p:2", "p:3"]);
    expect(h.ed.view.state.doc.eq(yTextToPmDoc(h.ytext, h.meta, FULL, h.ed.view.state.schema))).toBe(true);
  });

  it("a remote list-item split adds the new item without ReplaceError", async () => {
    const h = await setup();
    remoteFromShared(h.ydoc, (text, fieldMeta) => {
      const blocks = linearBlocksOf(text);
      const item = blocks.find((block) => block.paragraphId === "p:3");
      expect(item).toBeDefined();
      // Split at the end of p:3's content: a fresh item in the same run.
      text.insertEmbed((item as { contentEnd: number }).contentEnd, {
        separator: { paragraphId: "p:tail", kind: "paragraph" },
      });
      fieldMeta.set("p:tail", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:tail", listRunId: "p:2",
        containerOrder: ["list"],
      }) as never);
    });
    expect(h.errors).toEqual([]);
    expect(h.dispatches()).toBe(1);
    expect(topNames(h.ed.view.state.doc)).toEqual(["paragraph", "bulletList"]);
    const list = h.ed.view.state.doc.child(1);
    expect(list.childCount).toBe(3);
    expect(list.child(2).type.name).toBe("listItem");
    expect(blockIds(h.ed.view.state.doc)).toEqual(["p:0", "p:2", "p:3", "p:tail"]);
    expect(h.ed.view.state.doc.eq(yTextToPmDoc(h.ytext, h.meta, FULL, h.ed.view.state.schema))).toBe(true);
  });
});

describe("CL-3a fix 2 — B-NEW-5 run metadata", () => {
  it("splitting the ordered run opener keeps orderedStart/orderedType/listTight on the opener (two replicas)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { source, identity } = freshField("rev2-openerrun");
    const doc = fullDoc([
      para("p:1", "one two", plainMeta({
        listKind: "ordered", listDepth: 0, listItemId: "p:1", listRunId: "p:1",
        orderedStart: 7, orderedType: "I", listTight: true, containerOrder: ["list"],
      })),
      para("p:2", "three", plainMeta({
        listKind: "ordered", listDepth: 0, listItemId: "p:2", listRunId: "p:1",
        containerOrder: ["list"],
      })),
    ]);
    const first = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    const second = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    // Local continuation split inside the run opener.
    const pos = textPos(first.ed.view.state.doc, "one two", 3);
    first.ed.view.dispatch(first.ed.view.state.tr.split(pos, 1));
    expect(errors).toEqual([]);
    const cap = captureDocumentFromField(first.ytext, first.meta, FULL).document;
    const ids = cap.blocks.map((block) => (block as { paragraphId: string }).paragraphId);
    expect(ids).toEqual(["p:1", "fresh:rev2:1", "p:2"]);
    const opener = cap.blocks[0]?.metadata as unknown as Record<string, unknown>;
    expect(opener["orderedStart"]).toBe(7);
    expect(opener["orderedType"]).toBe("I");
    expect(opener["listTight"]).toBe(true);
    const tail = cap.blocks[1]?.metadata as unknown as Record<string, unknown>;
    expect(tail["orderedStart"]).toBeUndefined();
    expect(tail["listRunId"]).toBe("p:1");
    // Both replicas converge on the same document and the same PM list start.
    expect(captureJson(second.ytext, second.meta, FULL)).toBe(
      captureJson(first.ytext, first.meta, FULL),
    );
    for (const mount of [first, second]) {
      const pm = mount.ed.view.state.doc;
      expect(pm.eq(yTextToPmDoc(mount.ytext, mount.meta, FULL, mount.ed.view.state.schema))).toBe(true);
      expect(topNames(pm)).toEqual(["orderedList"]);
      expect(pm.child(0).attrs["start"]).toBe(7);
    }
  });

  it("sinking the second nested item keeps the outer run id (two replicas)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { source, identity } = freshField("rev2-sinkrun");
    const doc = fullDoc([
      para("p:1", "top", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:1", listRunId: "p:1",
        listTight: true, containerOrder: ["list"],
      })),
      para("p:2", "mid", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:2", listRunId: "p:1",
        containerOrder: ["list"],
      })),
      para("p:3", "already nested", plainMeta({
        listKind: "bullet", listDepth: 1, listItemId: "p:3", listRunId: "p:1",
        containerOrder: ["list", "list"],
      })),
      para("p:4", "to sink", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:4", listRunId: "p:1",
        containerOrder: ["list"],
      })),
    ]);
    const first = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    const second = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    const schemaList = await import("@tiptap/pm/schema-list");
    const { TextSelection } = await import("@tiptap/pm/state");
    const pos = textPos(first.ed.view.state.doc, "to sink");
    first.ed.view.dispatch(
      first.ed.view.state.tr.setSelection(TextSelection.create(first.ed.view.state.doc, pos)),
    );
    const ok = schemaList.sinkListItem(first.ed.view.state.schema.nodes.listItem)(
      first.ed.view.state,
      (tr: never) => first.ed.view.dispatch(tr),
      first.ed.view,
    );
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
    const cap = captureDocumentFromField(first.ytext, first.meta, FULL).document;
    const sunk = cap.blocks.find(
      (block) => (block as { paragraphId: string }).paragraphId === "p:4",
    );
    const sunkMeta = sunk?.metadata as Record<string, unknown>;
    expect(sunkMeta["listDepth"]).toBe(1);
    expect(sunkMeta["listRunId"]).toBe("p:1");
    expect(captureJson(second.ytext, second.meta, FULL)).toBe(
      captureJson(first.ytext, first.meta, FULL),
    );
    for (const mount of [first, second]) {
      expect(mount.ed.view.state.doc.eq(
        yTextToPmDoc(mount.ytext, mount.meta, FULL, mount.ed.view.state.schema),
      )).toBe(true);
    }
  });

  it("a bound continuation split keeps the item id; an item split mints a fresh one (two replicas)", async () => {
    const doc = fullDoc([
      para("p:2", "item one", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:2", listRunId: "p:2",
        listTight: true, containerOrder: ["list"],
      })),
      para("p:3", "item two", plainMeta({
        listKind: "bullet", listDepth: 0, listItemId: "p:3", listRunId: "p:2",
        containerOrder: ["list"],
      })),
    ]);
    // Continuation: same list item, so the tail keeps p:3's item id.
    {
      const { source, identity } = freshField("rev2-cont");
      const first = await boundEditorOn(source, identity, { document: doc });
      const second = await boundEditorOn(source, identity, { document: doc });
      const pos = textPos(first.ed.view.state.doc, "item two", 4);
      first.ed.view.dispatch(first.ed.view.state.tr.split(pos, 1));
      const cap = captureDocumentFromField(first.ytext, first.meta, FULL).document;
      const tail = cap.blocks[2]?.metadata as unknown as Record<string, unknown>;
      expect(tail["listItemId"]).toBe("p:3");
      expect(tail["listRunId"]).toBe("p:2");
      expect(captureJson(second.ytext, second.meta, FULL)).toBe(
        captureJson(first.ytext, first.meta, FULL),
      );
    }
    // Item split: depth 2, so the tail is its own item with a fresh id.
    {
      const { source, identity } = freshField("rev2-itemsplit");
      const first = await boundEditorOn(source, identity, { document: doc });
      const second = await boundEditorOn(source, identity, { document: doc });
      const pos = textPos(first.ed.view.state.doc, "item two", 4);
      first.ed.view.dispatch(first.ed.view.state.tr.split(pos, 2));
      const cap = captureDocumentFromField(first.ytext, first.meta, FULL).document;
      const ids = cap.blocks.map((block) => (block as { paragraphId: string }).paragraphId);
      expect(ids).toEqual(["p:2", "p:3", "fresh:rev2:1"]);
      const tailMeta = cap.blocks[2]?.metadata as unknown as Record<string, unknown>;
      expect(tailMeta["listItemId"]).toBe("fresh:rev2:1");
      expect(tailMeta["listRunId"]).toBe("p:2");
      // One id everywhere: PM, Y.Text separator, both replicas.
      expect(separatorIds(first.ytext)).toEqual(ids);
      expect(blockIds(second.ed.view.state.doc)).toEqual(ids);
      for (const mount of [first, second]) {
        expect(mount.ed.view.state.doc.eq(
          yTextToPmDoc(mount.ytext, mount.meta, FULL, mount.ed.view.state.schema),
        )).toBe(true);
      }
    }
  });
});

describe("CL-3a fix 2 — B-NEW-6 surfaced errors and no half-applied state", () => {
  it("an unprojectable local step rolls back both sides and reports collab-step-failed (local-projection)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ytext, meta } = await boundEditor({
      document: fullDoc([
        para("p:1", "alpha"),
        { paragraphId: "p:hr", kind: "horizontalRule" },
        para("p:2", "omega"),
      ]),
      onBindingError: (event) => errors.push(event),
    });
    const beforeText = ytext.toString();
    const beforeCapture = captureJson(ytext, meta, FULL);
    let hrPos = -1;
    ed.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "horizontalRule") hrPos = pos;
      return true;
    });
    expect(hrPos).toBeGreaterThan(-1);
    // A local delete crossing the HR atom: unprojectable.
    const from = textPos(ed.view.state.doc, "alpha", 1);
    ed.view.dispatch(ed.view.state.tr.delete(from, hrPos + 1));
    expect(errors).toHaveLength(1);
    expect(errors[0]?.phase).toBe("local-projection");
    expect(errors[0]?.message).toContain("rich-text.collab-step-failed");
    expect(errors[0]?.message).toContain("rolled back");
    // Both sides sit at the previous state.
    expect(ytext.toString()).toBe(beforeText);
    expect(captureJson(ytext, meta, FULL)).toBe(beforeCapture);
    // The PM view is rebuilt from the shared state: the HR survives.
    let hrCount = 0;
    ed.view.state.doc.descendants((node: ProseMirrorNode) => {
      if (node.type.name === "horizontalRule") hrCount += 1;
      return true;
    });
    expect(hrCount).toBe(1);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });

  it("an unprojectable remote update keeps the previous PM, reports remote-application, then heals", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ydoc, ytext, meta } = await boundEditor({
      document: fullDoc([para("p:1", "alpha")]),
      onBindingError: (event) => errors.push(event),
    });
    const before = ed.view.state.doc;
    remoteFromShared(ydoc, (text) => {
      const blocks = linearBlocksOf(text);
      const head = blocks.find((block) => block.paragraphId === "p:1");
      expect(head).toBeDefined();
      // A mark outside the admitted table: the update is unprojectable.
      text.insert((head as { contentStart: number }).contentStart, "BOGUS", { surprise: true });
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.phase).toBe("remote-application");
    expect(errors[0]?.message).toContain("rich-text.collab-invalid-mark");
    // No half-applied state: the PM keeps the previous document object.
    expect(ed.view.state.doc).toBe(before);
    expect(
      ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n"),
    ).not.toContain("BOGUS");
    // The shared Y.Text still received the remote change; the baseline moved.
    expect(ytext.toString()).toContain("BOGUS");
    // Heal: the replica clears the offending attribute.
    remoteFromShared(ydoc, (text) => {
      const blocks = linearBlocksOf(text);
      const head = blocks.find((block) => block.paragraphId === "p:1");
      expect(head).toBeDefined();
      text.format((head as { contentStart: number }).contentStart, 5, { surprise: null });
    });
    expect(errors).toHaveLength(1);
    // The next application resynchronizes through the full replacement.
    expect(
      ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n"),
    ).toContain("BOGUS");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
  });
});

describe("CL-3a fix 2 — B-NEW-7 divergence guard", () => {
  const preservedDoc = () =>
    p0Doc([
      { paragraphId: "p:1", kind: "paragraph", text: "alpha" },
      { paragraphId: "p:kept", kind: "preserved", raw: "<table>verbatim</table>", preservedKind: "table" },
      { paragraphId: "p:2", kind: "paragraph", text: "omega" },
    ]);

  it("a local edit passes with a preserved block present and the preserved block is compared (id + raw)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { ed, ytext, meta } = await boundEditor({
      document: preservedDoc(),
      onBindingError: (event) => errors.push(event),
    });
    // On d484f514 every local edit on a document with a preserved block threw
    // (verifyP0Agreement compared the preserved raw against a capture that
    // filtered it out as a non-paragraph).
    ed.view.dispatch(ed.view.state.tr.insertText("ZZ", 2));
    expect(errors).toEqual([]);
    const cap = await ed.captureDocument();
    const kept = cap.document.blocks.find(
      (block) => (block as { paragraphId: string }).paragraphId === "p:kept",
    ) as { raw?: string; preservedKind?: string };
    expect(kept.raw).toBe("<table>verbatim</table>");
    expect(kept.preservedKind).toBe("table");
    expect(blockIds(ed.view.state.doc)).toEqual(["p:1", "p:kept", "p:2"]);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, P0, ed.view.state.schema))).toBe(true);
  });

  it("an AttrStep tampering a preserved block raw refuses projection and leaves Y.Text unchanged", async () => {
    const schemaEd = await createRichTextEditor({
      document: preservedDoc(),
      messages: { ...MESSAGES },
      allocateId: () => "fresh:attrstep:1",
      element: globalThis.document.createElement("div"),
    });
    mounted.push(schemaEd);
    let keptPos = -1;
    schemaEd.view.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "preservedBlock") keptPos = pos;
      return true;
    });
    expect(keptPos).toBeGreaterThan(-1);
    const node = schemaEd.view.state.doc.nodeAt(keptPos);
    expect(node).not.toBeNull();
    const tr = schemaEd.view.state.tr.setNodeMarkup(keptPos, undefined, {
      ...(node as ProseMirrorNode).attrs,
      raw: "tampered",
    });
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName(FIELD));
    const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    seedFieldFromDocument(ytext, meta, FIELD, preservedDoc());
    const before = captureJson(ytext, meta, P0);
    expect(() =>
      projectPmTransactionToYText(
        { ytext, fieldMeta: meta, fieldKey: FIELD, allocateId: () => "fresh:attrstep:2", format: P0 },
        schemaEd.view.state.doc,
        tr,
      ),
    ).toThrow("rich-text.collab-preserved-denied");
    expect(captureJson(ytext, meta, P0)).toBe(before);
  });
});

describe("CL-3a fix 2 — to-fix witnesses", () => {
  it("two bound editors on one field stay independent across destroy (holder reference count)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    const { source, identity } = freshField("rev2-refcount");
    const doc = fullDoc([para("p:1", "alpha")]);
    const a = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    const b = await boundEditorOn(source, identity, {
      document: doc,
      onBindingError: (event) => errors.push(event),
    });
    a.ed.destroy();
    // A remote write after the first editor's destroy still reaches the second.
    remoteFromShared(b.ydoc, (text) => {
      const blocks = linearBlocksOf(text);
      const head = blocks.find((block) => block.paragraphId === "p:1");
      expect(head).toBeDefined();
      text.insert((head as { contentStart: number }).contentStart, "REMOTE-", {});
    });
    expect(errors).toEqual([]);
    expect(
      b.ed.view.state.doc.textBetween(0, b.ed.view.state.doc.content.size, "\n\n", "\n"),
    ).toContain("REMOTE-");
    // A local edit on the survivor still projects.
    b.ed.view.dispatch(b.ed.view.state.tr.insertText("LOCAL", textPos(b.ed.view.state.doc, "REMOTE-")));
    expect(errors).toEqual([]);
    expect(b.ytext.toString()).toContain("LOCAL");
    expect(b.ed.view.state.doc.eq(
      yTextToPmDoc(b.ytext, b.meta, FULL, b.ed.view.state.schema),
    )).toBe(true);
  });

  it("a stale options.document never leaks: the mount shows the shared state, retained run metadata survives (to-fix 2)", async () => {
    const errors: RichTextBindingErrorEvent[] = [];
    // Build a shared state whose ordered run source is retained: the opener
    // was merged away and p:run lives on as retainedRunMetadata.
    const scratch = new Y.Doc();
    const scratchText = scratch.getText(fieldTextName(FIELD));
    const scratchMeta = scratch.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    seedFieldFromDocument(scratchText, scratchMeta, FIELD, fullDoc([
      para("p:intro", "intro"),
      para("p:run", "one", plainMeta({
        listKind: "ordered", listDepth: 0, listItemId: "p:run", listRunId: "p:run",
        orderedStart: 7, orderedType: "I", listTight: true, containerOrder: ["list"],
      })),
      para("p:m2", "two", plainMeta({
        listKind: "ordered", listDepth: 0, listItemId: "p:m2", listRunId: "p:run",
        containerOrder: ["list"],
      })),
    ]));
    const delta = scratchText.toDelta() as Array<{ insert?: unknown }>;
    let linear = 0;
    let openerIndex = -1;
    for (const op of delta) {
      if (
        typeof op.insert === "object" &&
        op.insert !== null &&
        "separator" in (op.insert as Record<string, unknown>)
      ) {
        const payload = (op.insert as { separator: { paragraphId: string } }).separator;
        if (payload.paragraphId === "p:run") {
          openerIndex = linear;
          break;
        }
        linear += 1;
      } else if (typeof op.insert === "string") {
        linear += (op.insert as string).length;
      } else {
        linear += 1;
      }
    }
    expect(openerIndex).toBeGreaterThan(-1);
    scratch.transact(() => {
      scratchText.delete(openerIndex, 1);
    });
    const shared = captureDocumentFromField(scratchText, scratchMeta, FULL).document;
    expect(shared.retainedRunMetadata?.["p:run"]?.orderedStart).toBe(7);

    const { ed, ytext, meta } = await boundEditor({
      // A deliberately stale nominal document: the mount must ignore it.
      document: shared as RichTextDocument,
      seed: shared as RichTextDocument,
      staleDocument: fullDoc([para("p:stale", "stale content")]),
      onBindingError: (event) => errors.push(event),
    });
    const pmText = ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n");
    expect(pmText).not.toContain("stale content");
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
    // The ordered run reads its values from the retained source.
    expect(topNames(ed.view.state.doc)).toEqual(["paragraph", "orderedList"]);
    expect(ed.view.state.doc.child(1).attrs["start"]).toBe(7);
    const cap = await ed.captureDocument();
    expect(cap.document.retainedRunMetadata?.["p:run"]?.orderedStart).toBe(7);
    // The next local keystroke projects cleanly off the captured mount.
    ed.view.dispatch(ed.view.state.tr.insertText("ZZ", textPos(ed.view.state.doc, "intro", 1)));
    expect(errors).toEqual([]);
    expect(ed.view.state.doc.eq(yTextToPmDoc(ytext, meta, FULL, ed.view.state.schema))).toBe(true);
    const cap2 = await ed.captureDocument();
    expect(cap2.document.retainedRunMetadata?.["p:run"]?.orderedStart).toBe(7);
  });
});
