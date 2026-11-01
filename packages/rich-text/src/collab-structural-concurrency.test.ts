/**
 * CL-3b1 witness 9 — structural concurrency (spec §4.10 CL-D16, R-STR-1…6,
 * R-STR-4 no-withdrawal).
 *
 * CL-3a proved split/merge as local projection steps
 * (`collab-structural.test.ts`); this family proves the concurrent outcomes
 * at the shared-state level: three `Y.Doc` replicas (authoritative + two)
 * exchange updates in controlled orders, and quiescence is asserted by equal
 * state vectors plus equal projected documents. Interleaved undo (R-STR-6)
 * is the `collab-undo.test.ts` family (cases 2a/2b/2c/2e/2g), cross-referenced
 * here and not duplicated.
 *
 * RED on the base: the concurrent outcomes below had no witness; the
 * interleaved-undo half failed closed (`bound-undo-unavailable`).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import {
  createRichTextEditor,
  type RichTextEditor,
} from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
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
const P0 = "focus.markdown.p0@1";
const FULL = "ds.markdown.full@1";

let counter = 1000;

function p0Doc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: P0,
    blocks: blocks.map((block) => ({ paragraphId: block.paragraphId, kind: "paragraph", text: block.text })),
  } as RichTextDocument;
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

/** Deliver one replica's full update into the others (controlled order). */
function deliver(from: Replica, into: Replica[]): void {
  const update = Y.encodeStateAsUpdate(from.doc);
  for (const target of into) Y.applyUpdate(target.doc, update);
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

/** Split the block at a linear index: one separator embed insert (R-STR-1). */
function splitAt(replica: Replica, index: number, newId: string): void {
  replica.text.insertEmbed(index, { separator: { paragraphId: newId, kind: "paragraph" } });
}

/** Merge: delete the separator embed opening the named paragraph (R-STR-3). */
function mergeParagraph(replica: Replica, paragraphId: string): void {
  const blocks = linearBlocksOf(replica.text);
  const target = blocks.find((block) => block.paragraphId === paragraphId);
  expect(target, `separator of ${paragraphId} exists`).toBeDefined();
  replica.text.delete((target as { separatorIndex: number }).separatorIndex, 1);
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

function idsOf(replica: Replica, format: string): string[] {
  return captureDocumentFromField(replica.text, replica.meta, format).document.blocks.map(
    (block) => block.paragraphId,
  );
}

describe("CL-3b1-9a split/split at distinct positions (R-STR-2)", () => {
  it("converges to three paragraphs with identities following resolved positions, both creation orders", async () => {
    for (const order of ["ab", "ba"] as const) {
      const authority = seedAuthority(p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]));
      // Linear: ⟨¶p1⟩ a b c d e f — split after "ab" (index 3), after "abcd" (index 5).
      const replicaA = fork(authority.doc);
      const replicaB = fork(authority.doc);
      splitAt(replicaA, 3, "tail:a");
      splitAt(replicaB, 5, "tail:b");
      if (order === "ab") {
        deliver(replicaA, [authority, replicaB]);
        deliver(replicaB, [authority, replicaA]);
      } else {
        deliver(replicaB, [authority, replicaA]);
        deliver(replicaA, [authority, replicaB]);
      }
      const replicas = [authority, replicaA, replicaB];
      assertQuiescent(`9a-${order}`, P0, replicas);
      // [start, A): p1 "ab"; [A, B): tail:a "cd"; [B, end): tail:b "ef".
      for (const replica of replicas) {
        expect(idsOf(replica, P0)).toEqual(["paragraph:1", "tail:a", "tail:b"]);
        expect(textsOf(replica, P0)).toEqual(["ab", "cd", "ef"]);
      }
    }
  });

  it("an offline split arriving last converges identically", async () => {
    const authority = seedAuthority(p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]));
    const online = fork(authority.doc);
    const offline = fork(authority.doc);
    // Online split after "ab" syncs first; the offline split after "abcd"
    // was created without observing it and arrives after reconnect.
    splitAt(online, 3, "tail:a");
    deliver(online, [authority]);
    splitAt(offline, 5, "tail:b");
    deliver(offline, [authority, online]);
    deliver(authority, [online, offline]);
    const replicas = [authority, online, offline];
    assertQuiescent("9a-offline", P0, replicas);
    for (const replica of replicas) {
      expect(idsOf(replica, P0)).toEqual(["paragraph:1", "tail:a", "tail:b"]);
      expect(textsOf(replica, P0)).toEqual(["ab", "cd", "ef"]);
    }
  });
});

describe("CL-3b1-9b split/split at the same resolved position (R-STR-2 conductor case)", () => {
  it("yields two separators, three paragraphs and an empty middle with Yjs-ordered ids", async () => {
    const authority = seedAuthority(p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]));
    const replicaA = fork(authority.doc);
    const replicaB = fork(authority.doc);
    // Both splits resolve after "ab" (index 3) without observing each other.
    splitAt(replicaA, 3, "tail:a");
    splitAt(replicaB, 3, "tail:b");
    deliver(replicaA, [authority, replicaB]);
    deliver(replicaB, [authority, replicaA]);
    const replicas = [authority, replicaA, replicaB];
    assertQuiescent("9b", P0, replicas);
    const first = idsOf(authority, P0);
    expect(first).toHaveLength(3);
    expect(first[0]).toBe("paragraph:1");
    expect(textsOf(authority, P0)[0]).toBe("ab");
    // Empty middle paragraph, tail carries the remaining text.
    expect(textsOf(authority, P0)[1]).toBe("");
    expect(textsOf(authority, P0)[2]).toBe("abcdef".slice(2));
    // The middle id is the newParagraphId of whichever separator the Yjs
    // total order places first; the tail is the other. Read that order from
    // the authoritative delta and assert every replica matches it.
    const separators: string[] = [];
    for (const op of authority.text.toDelta() as Array<{ insert?: unknown }>) {
      if (
        typeof op.insert === "object" &&
        op.insert !== null &&
        "separator" in (op.insert as Record<string, unknown>)
      ) {
        separators.push(
          (op.insert as { separator: { paragraphId: string } }).separator.paragraphId,
        );
      }
    }
    expect(separators).toHaveLength(3);
    expect(first[1]).toBe(separators[1]);
    expect(first[2]).toBe(separators[2]);
    for (const replica of [replicaA, replicaB]) {
      expect(idsOf(replica, P0)).toEqual(first);
    }
  });
});

describe("CL-3b1-9c merge racing a text insert (R-STR-3)", () => {
  it("the insert survives inside the surviving paragraph, connected and offline", async () => {
    for (const mode of ["connected", "offline"] as const) {
      const authority = seedAuthority(
        p0Doc([
          { paragraphId: "paragraph:1", text: "abc" },
          { paragraphId: "paragraph:2", text: "def" },
        ]),
      );
      // Linear: ⟨¶p1⟩ a b c ⟨¶p2⟩ d e f — p2 content runs 5..8.
      const merger = fork(authority.doc);
      const inserter = fork(authority.doc);
      mergeParagraph(merger, "paragraph:2");
      // Insert "XYZ" bold between "d" and "e" with marks intact.
      inserter.text.insert(6, "XYZ", { bold: true });
      if (mode === "connected") {
        deliver(merger, [authority, inserter]);
        deliver(inserter, [authority, merger]);
      } else {
        deliver(merger, [authority]);
        deliver(inserter, [authority, merger]);
        deliver(authority, [merger, inserter]);
      }
      const replicas = [authority, merger, inserter];
      assertQuiescent(`9c-${mode}`, P0, replicas);
      for (const replica of replicas) {
        expect(idsOf(replica, P0)).toEqual(["paragraph:1"]);
        // Sequence order: a b c d XYZ e f — the insert keeps its position
        // and its marks (P0 capture renders the bold run with sigils).
        expect(textsOf(replica, P0)).toEqual(["abcd**XYZ**ef"]);
      }
    }
  });
});

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

function fullPara(
  id: string,
  text: string,
  metadata?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    paragraphId: id,
    kind: "paragraph",
    ...(metadata !== undefined ? { metadata } : {}),
    segments: [{ type: "text", text, marks: {} }],
  };
}

/** Two plain full paragraphs (no list wrappers) for the R-STR-5 write race. */
function fullShimDoc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: FULL,
    blocks: blocks.map((block) => fullPara(block.paragraphId, block.text)),
  } as unknown as RichTextDocument;
}

function fullListDoc(): RichTextDocument {
  return {
    format: FULL,
    blocks: [
      fullPara("p:0", "intro"),
      fullPara("p:1", "item one", {
        ...plainMeta(),
        listKind: "bullet",
        listDepth: 0,
        listItemId: "p:1",
        listRunId: "p:1",
        listTight: true,
        containerOrder: ["list"],
      }),
      fullPara("p:2", "item two", {
        ...plainMeta(),
        listKind: "bullet",
        listDepth: 0,
        listItemId: "p:2",
        listRunId: "p:1",
        containerOrder: ["list"],
      }),
    ],
  } as unknown as RichTextDocument;
}

describe("CL-3b1-9d merge racing a block-metadata write (R-STR-5)", () => {
  it("a concurrent write to the consumed paragraph is orphaned and ignored, no repair emitted", async () => {
    for (const order of ["merge-first", "write-first"] as const) {
      const authority = seedAuthority(
        fullShimDoc([
          { paragraphId: "paragraph:1", text: "alpha" },
          { paragraphId: "paragraph:2", text: "beta" },
        ]),
      );
      const merger = fork(authority.doc);
      const writer = fork(authority.doc);
      // The merge deletes paragraph:2's separator; the writer concurrently
      // converts paragraph:2 to a heading (an admitted full write).
      mergeParagraph(merger, "paragraph:2");
      writer.meta.set(
        "paragraph:2",
        plainMeta({ blockKind: "heading", headingLevel: 1 }),
      );
      if (order === "merge-first") {
        deliver(merger, [authority, writer]);
        deliver(writer, [authority, merger]);
      } else {
        deliver(writer, [authority, merger]);
        deliver(merger, [authority, writer]);
      }
      const replicas = [authority, merger, writer];
      assertQuiescent(`9d-${order}`, FULL, replicas);
      for (const replica of replicas) {
        // The merged paragraph keeps the survivor's (plain) metadata; the
        // consumed paragraph's heading write is orphaned and ignored.
        expect(idsOf(replica, FULL)).toEqual(["paragraph:1"]);
        expect(textsOf(replica, FULL)).toEqual(["alphabeta"]);
        const captured = captureDocumentFromField(replica.text, replica.meta, FULL).document;
        const only = captured.blocks[0] as unknown as { metadata?: Record<string, unknown> };
        expect(only.metadata?.["blockKind"] ?? "paragraph").toBe("paragraph");
        // No repair transaction: the orphan entry is retained untouched, and
        // no entry exists for the survivor (plain materializes by default).
        expect(replica.meta.get("paragraph:2")).toEqual(
          plainMeta({ blockKind: "heading", headingLevel: 1 }),
        );
        expect(replica.meta.get("paragraph:1")).toBeUndefined();
      }
    }
  });

  it("a causally-after write to a retired id stays orphaned and changes no projected document (AMB-6 DS half)", async () => {
    const authority = seedAuthority(
      fullShimDoc([
        { paragraphId: "paragraph:1", text: "alpha" },
        { paragraphId: "paragraph:2", text: "beta" },
      ]),
    );
    const merger = fork(authority.doc);
    mergeParagraph(merger, "paragraph:2");
    deliver(merger, [authority]);
    const before = captureJson(authority, FULL);
    // A late writer that observed the merge writes the retired id anyway.
    const late = fork(authority.doc);
    late.meta.set("paragraph:2", plainMeta({ blockKind: "heading", headingLevel: 2 }));
    deliver(late, [authority, merger]);
    deliver(authority, [merger, late]);
    assertQuiescent("9d-after", FULL, [authority, merger, late]);
    expect(captureJson(authority, FULL)).toBe(before);
    expect(idsOf(authority, FULL)).toEqual(["paragraph:1"]);
    expect(authority.meta.get("paragraph:2")).toEqual(
      plainMeta({ blockKind: "heading", headingLevel: 2 }),
    );
  });
});

describe("CL-3b1-9f run-source exception (R-FULL-META-2, R-STR-5)", () => {
  it("a deleted opener still referenced by a live member remains the run-value source", async () => {
    const authority = seedAuthority(fullListDoc());
    const merger = fork(authority.doc);
    const reader = fork(authority.doc);
    // Merge the run opener (paragraph:1 is "p:1" here) into its predecessor:
    // its separator embed is deleted and its run record is orphaned.
    mergeParagraph(merger, "p:1");
    deliver(merger, [authority, reader]);
    const replicas = [authority, merger, reader];
    assertQuiescent("9f", FULL, replicas);
    for (const replica of replicas) {
      expect(idsOf(replica, FULL)).toEqual(["p:0", "p:2"]);
      expect(textsOf(replica, FULL)).toEqual(["introitem one", "item two"]);
      // The surviving member still reads the run through the retained
      // source record: bullet wrappers reconstructed identically.
      const captured = captureDocumentFromField(replica.text, replica.meta, FULL).document;
      const member = captured.blocks.find((block) => block.paragraphId === "p:2") as unknown as {
        metadata?: Record<string, unknown>;
      };
      expect(member.metadata?.["listKind"]).toBe("bullet");
      expect(member.metadata?.["listRunId"]).toBe("p:1");
      // The source record is retained (not collected, not rewritten): the
      // sole run-value source for the live reference.
      expect(replica.meta.get("p:1")).toEqual(
        expect.objectContaining({ listRunId: "p:1", listKind: "bullet" }),
      );
    }
  });
});

// R-STR-6 (interleaved undo) is witnessed by `collab-undo.test.ts` cases
// CL-3b1-2a (split undo, §4.5 (a)), CL-3b1-2b (merge undo, §4.5 (b)),
// CL-3b1-2c (collaborator protection, §4.5 (c)), CL-3b1-2e (metadata undo)
// and CL-3b1-2g (HR atom undo/redo) — asserted on the authoritative doc and
// at least two replicas with quiescence. Not duplicated here.

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
  const mkEditor = async (forked: Replica, tag: string, actorId: string): Promise<RichTextEditor> => {
    const identity: FieldBindingIdentity = {
      documentId: `struct:${tag}:canvas:${counter}`,
      sessionId: `struct:${tag}:session:${counter}`,
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
  const { ed: edA, errors: errorsA } = await mkEditor(forkA, "a", `struct-a-${counter}`);
  const { ed: edB, errors: errorsB } = await mkEditor(forkB, "b", `struct-b-${counter}`);
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

/** Sink a list item one level through the editor (a conformant depth write). */
async function sinkItem(ed: RichTextEditor, needle: string): Promise<boolean> {
  const schemaList = await import("@tiptap/pm/schema-list");
  const { TextSelection } = await import("@tiptap/pm/state");
  let pos = -1;
  ed.view.state.doc.descendants((node, p) => {
    if (node.isText && node.text !== undefined && node.text.includes(needle)) pos = p;
    return true;
  });
  expect(pos).toBeGreaterThan(-1);
  ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, pos)));
  return schemaList.sinkListItem(ed.view.state.schema.nodes.listItem)(
    ed.view.state,
    (tr: never) => ed.view.dispatch(tr as never),
    ed.view,
  );
}

/** Toggle a bullet list run to ordered through the list node (a kind write). */
function toggleListKind(ed: RichTextEditor): void {
  let pos = -1;
  ed.view.state.doc.descendants((node, p) => {
    if (node.type.name === "bulletList") pos = p;
    return true;
  });
  expect(pos).toBeGreaterThanOrEqual(0);
  const bullet = ed.view.state.doc.nodeAt(pos);
  ed.view.dispatch(
    ed.view.state.tr.setNodeMarkup(pos, ed.view.state.schema.nodes.orderedList, {
      ...(bullet?.attrs ?? {}),
      listRunId: bullet?.attrs["listRunId"] ?? "p:1",
    }),
  );
}

describe("CL-3b1-9g depth/kind write racing a split within a list", () => {
  it("head takes the map-winning write; tail takes the block-local snapshot without run-level values", async () => {
    for (const order of ["ab", "ba"] as const) {
      for (const write of ["depth", "kind"] as const) {
        const s = await twoSessions(fullListDoc());
        // A's metadata write on the member p:2 (depth 0→1, or bullet→ordered).
        if (write === "depth") {
          expect(await sinkItem(s.edA, "item two")).toBe(true);
        } else {
          toggleListKind(s.edA);
        }
        // B's concurrent split of the same member at offset 1.
        s.edB.splitParagraph("p:2", 1);
        expect(s.errorsA, `9g-${order}-${write} A errors`).toEqual([]);
        expect(s.errorsB, `9g-${order}-${write} B errors`).toEqual([]);
        const tailId = idsOf(
          { doc: s.docB, text: s.textB, meta: s.metaB },
          FULL,
        ).find((id) => id !== "p:0" && id !== "p:1" && id !== "p:2") as string;
        syncSessions({ doc: s.docA }, { doc: s.docB }, order);
        // Offline participant: forked from B's split state with its own text
        // insert inside p:0, arriving after A and B converged.
        const c = fork(s.docB);
        c.text.insert(6, "!");
        Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
        Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
        Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
        const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
        const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
        assertQuiescent(`9g-${order}-${write}`, FULL, [a, b, c]);
        for (const replica of [a, b, c]) {
          // All text survives in sequence.
          expect(idsOf(replica, FULL), `9g-${order}-${write} ids`).toEqual([
            "p:0",
            "p:1",
            "p:2",
            tailId,
          ]);
          expect(textsOf(replica, FULL), `9g-${order}-${write} texts`).toEqual([
            "intro!",
            "item one",
            "i",
            "tem two",
          ]);
          // Every replica reconstructs the same wrappers.
          const captured = captureDocumentFromField(replica.text, replica.meta, FULL).document;
          const head = captured.blocks.find((block) => block.paragraphId === "p:2") as unknown as {
            metadata?: Record<string, unknown>;
          };
          const tail = captured.blocks.find((block) => block.paragraphId === tailId) as unknown as {
            metadata?: Record<string, unknown>;
          };
          if (write === "depth") {
            expect(head.metadata?.["listDepth"]).toBe(1);
            expect(head.metadata?.["listKind"]).toBe("bullet");
          } else {
            expect(head.metadata?.["listKind"]).toBe("ordered");
          }
          // The tail is the splitter's observed block-local snapshot: the
          // offset-1 split is a continuation of the same item (listItemId
          // stays p:2), with the run pointer and no run-level values.
          expect(tail.metadata?.["listItemId"]).toBe("p:2");
          expect(tail.metadata?.["listRunId"]).toBe("p:1");
          expect(tail.metadata?.["listTight"]).toBeUndefined();
          expect(tail.metadata?.["orderedStart"]).toBeUndefined();
          expect(tail.metadata?.["orderedType"]).toBeUndefined();
        }
      }
    }
  });
});

function fullCodeDoc(): RichTextDocument {
  return {
    format: FULL,
    blocks: [
      {
        paragraphId: "p:code",
        kind: "paragraph",
        metadata: plainMeta({ blockKind: "codeBlock", codeLanguage: "ts" }),
        segments: [
          { type: "text", text: "line1", marks: {} },
          { type: "hardBreak" },
          { type: "text", text: "line2", marks: {} },
        ],
      },
      fullPara("p:after", "tail"),
    ],
  } as unknown as RichTextDocument;
}

/** Top-level position of the block opening with `id`. */
function blockTopPos(ed: RichTextEditor, id: string): number {
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

/** Insert text at the end of a block's inline content. */
function insertBlockText(ed: RichTextEditor, id: string, str: string): void {
  let end = -1;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.attrs?.["paragraphId"] === id) {
      end = pos + node.nodeSize - 1;
      return false;
    }
    return true;
  });
  expect(end).toBeGreaterThan(-1);
  ed.view.dispatch(ed.view.state.tr.insertText(str, end));
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

describe("CL-3b1-9i split inside multiline code racing a text insert (R-FULL-CODE-1)", () => {
  it("two code blocks with copied language; hard breaks retained at sequence positions", async () => {
    for (const order of ["ab", "ba"] as const) {
      const s = await twoSessions(fullCodeDoc());
      // A splits "line1" at offset 3; B concurrently appends "X<LF>Y"
      // (newlineInCode inserts LF text; the projection splits it into a
      // hard-break embed, never a raw U+000A insert).
      s.edA.splitParagraph("p:code", 3);
      insertBlockText(s.edB, "p:code", "X\nY");
      expect(s.errorsA).toEqual([]);
      expect(s.errorsB).toEqual([]);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      // Offline participant with its own field-end insert, arriving last.
      const c = fork(s.docB);
      c.text.insert(c.text.length, "!");
      Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
      Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
      Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
      const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
      const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
      assertQuiescent(`9i-${order}`, FULL, [a, b, c]);
      for (const replica of [a, b, c]) {
        const captured = captureDocumentFromField(replica.text, replica.meta, FULL).document;
        const codes = captured.blocks.filter(
          (block) => (block.metadata as Record<string, unknown> | undefined)?.["blockKind"] === "codeBlock",
        );
        expect(codes).toHaveLength(2);
        for (const code of codes) {
          expect((code.metadata as Record<string, unknown>)?.["codeLanguage"]).toBe("ts");
        }
        // Head keeps "lin"; the tail carries the rest plus B's insert.
        const segText = (block: { segments?: Array<{ type?: string; text?: string }> }): string =>
          (block.segments ?? [])
            .map((segment) => (segment.type === "hardBreak" ? "\n" : (segment.text ?? "")))
            .join("");
        expect(captured.blocks.map((block) => block.paragraphId)).toEqual([
          "p:code",
          expect.any(String),
          "p:after",
        ]);
        expect(segText(captured.blocks[0] as never)).toBe("lin");
        expect(segText(captured.blocks[1] as never)).toBe("e1\nline2X\nY");
        expect(segText(captured.blocks[2] as never)).toBe("tail!");
      }
    }
  });
});

/** Insert an HR atom before a block; returns the minted paragraph id. */
function insertHr(ed: RichTextEditor, beforeId: string): string {
  const pos = blockTopPos(ed, beforeId);
  ed.view.dispatch(
    ed.view.state.tr.insert(pos, ed.view.state.schema.nodes.horizontalRule.create()),
  );
  let id = "";
  ed.view.state.doc.descendants((node) => {
    if (node.type.name === "horizontalRule") id = (node.attrs["paragraphId"] as string) ?? "";
    return true;
  });
  expect(id).not.toBe("");
  return id;
}

/** Delete exactly the HR atom node. */
function deleteHr(ed: RichTextEditor, hrId: string): void {
  let found = -1;
  let size = 0;
  ed.view.state.doc.descendants((node, pos) => {
    if (node.type.name === "horizontalRule" && node.attrs["paragraphId"] === hrId) {
      found = pos;
      size = node.nodeSize;
      return false;
    }
    return true;
  });
  expect(found).toBeGreaterThanOrEqual(0);
  ed.view.dispatch(ed.view.state.tr.delete(found, found + size));
}

/** The separator+atom pair of an HR id is adjacent in the shared delta. */
function assertHrPair(replica: Replica, hrId: string): void {
  const delta = replica.text.toDelta() as Array<{ insert?: unknown }>;
  const at = delta.findIndex(
    (op) =>
      typeof op.insert === "object" &&
      op.insert !== null &&
      "separator" in (op.insert as Record<string, unknown>) &&
      ((op.insert as { separator: { paragraphId: string } }).separator.paragraphId === hrId),
  );
  expect(at, `HR pair for ${hrId}`).toBeGreaterThanOrEqual(0);
  expect(delta[at + 1]?.insert).toEqual({ horizontalRule: { paragraphId: hrId } });
}

describe("CL-3b1-9j atomic HR insertion/deletion/undo adjacent to text, lists and code", () => {
  it("pair integrity, convergence and same-id undo next to text", async () => {
    for (const order of ["ab", "ba"] as const) {
      const s = await twoSessions(
        fullShimDoc([
          { paragraphId: "paragraph:1", text: "aa" },
          { paragraphId: "paragraph:2", text: "bb" },
        ]),
      );
      // A inserts the HR before paragraph:2; B concurrently prepends to
      // paragraph:2 (a distinct anchor one unit after the pair position, so
      // the Yjs order keeps the separator+atom pair adjacent: same-index
      // text/HR-pair interleaving is a separate CRDT hazard, recorded as a
      // finding, not exercised here).
      const hrId = insertHr(s.edA, "paragraph:2");
      insertBlockStartText(s.edB, "paragraph:2", "ZZ");
      expect(s.errorsA).toEqual([]);
      expect(s.errorsB).toEqual([]);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      const c = fork(s.docB);
      c.text.insert(c.text.length, "!");
      Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
      Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
      Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
      const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
      const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
      assertQuiescent(`9j-text-${order}`, FULL, [a, b, c]);
      for (const replica of [a, b, c]) {
        expect(idsOf(replica, FULL)).toEqual(["paragraph:1", hrId, "paragraph:2"]);
        assertHrPair(replica, hrId);
      }
      const hrBefore = JSON.stringify(
        captureDocumentFromField(s.textA, s.metaA, FULL).document.blocks.find(
          (block) => block.paragraphId === hrId,
        ),
      );
      // Atomic delete then undo on A: the pair vanishes and returns with the
      // same id and retained wrapper metadata — never a text snapshot.
      // AMB-8 deterministic steps: the insert above and the delete below
      // are separate undo steps, so the capture window ends here.
      s.edA.stopCapturing();
      s.errorsA.length = 0;
      deleteHr(s.edA, hrId);
      expect(s.errorsA).toEqual([]);
      expect(idsOf({ doc: s.docA, text: s.textA, meta: s.metaA }, FULL)).toEqual([
        "paragraph:1",
        "paragraph:2",
      ]);
      s.edA.undo();
      expect(idsOf({ doc: s.docA, text: s.textA, meta: s.metaA }, FULL)).toEqual([
        "paragraph:1",
        hrId,
        "paragraph:2",
      ]);
      expect(
        JSON.stringify(
          captureDocumentFromField(s.textA, s.metaA, FULL).document.blocks.find(
            (block) => block.paragraphId === hrId,
          ),
        ),
      ).toBe(hrBefore);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      const d = fork(s.docA);
      syncSessions({ doc: s.docA }, { doc: d.doc }, "ab");
      assertQuiescent(`9j-text-undo-${order}`, FULL, [
        { doc: s.docA, text: s.textA, meta: s.metaA },
        { doc: s.docB, text: s.textB, meta: s.metaB },
        d,
      ]);
    }
  });

  it("a range operation crossing the HR atom refuses whole", async () => {
    const s = await twoSessions(
      fullShimDoc([
        { paragraphId: "paragraph:1", text: "aa" },
        { paragraphId: "paragraph:2", text: "bb" },
      ]),
    );
    insertHr(s.edA, "paragraph:2");
    syncSessions({ doc: s.docA }, { doc: s.docB }, "ab");
    s.errorsA.length = 0;
    const before = captureJson({ doc: s.docA, text: s.textA, meta: s.metaA }, FULL);
    // Delete from inside paragraph:1 to inside paragraph:2, crossing the atom.
    let from = -1;
    let to = -1;
    s.edA.view.state.doc.descendants((node, pos) => {
      if (node.isText && node.text !== undefined) {
        if (node.text.includes("aa")) from = pos;
        if (node.text.includes("bb")) to = pos + node.text.length;
      }
      return true;
    });
    expect(from).toBeGreaterThan(-1);
    expect(to).toBeGreaterThan(-1);
    s.edA.view.dispatch(s.edA.view.state.tr.delete(from, to));
    expect(s.errorsA).toHaveLength(1);
    expect(String((s.errorsA[0] as { message?: unknown })?.message ?? "")).toContain(
      "rich-text.collab-step-failed",
    );
    expect(captureJson({ doc: s.docA, text: s.textA, meta: s.metaA }, FULL)).toBe(before);
  });
});

function fullNestedDoc(): RichTextDocument {
  return {
    format: FULL,
    blocks: [
      fullPara("p:0", "intro"),
      fullPara("p:1", "item one", {
        ...plainMeta(),
        listKind: "bullet",
        listDepth: 0,
        listItemId: "p:1",
        listRunId: "p:1",
        listTight: true,
        containerOrder: ["list"],
      }),
      fullPara("p:2", "item two", {
        ...plainMeta(),
        listKind: "bullet",
        listDepth: 1,
        listItemId: "p:2",
        listRunId: "p:1",
        containerOrder: ["list", "list"],
      }),
      fullPara("p:3", "item three", {
        ...plainMeta(),
        listKind: "bullet",
        listDepth: 1,
        listItemId: "p:3",
        listRunId: "p:1",
        containerOrder: ["list", "list"],
      }),
    ],
  } as unknown as RichTextDocument;
}

/** Lift a list item one level through the editor (a conformant depth write). */
async function liftItem(ed: RichTextEditor, needle: string): Promise<boolean> {
  const schemaList = await import("@tiptap/pm/schema-list");
  const { TextSelection } = await import("@tiptap/pm/state");
  let pos = -1;
  ed.view.state.doc.descendants((node, p) => {
    if (node.isText && node.text !== undefined && node.text.includes(needle)) pos = p;
    return true;
  });
  expect(pos).toBeGreaterThan(-1);
  ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, pos)));
  return schemaList.liftListItem(ed.view.state.schema.nodes.listItem)(
    ed.view.state,
    (tr: never) => ed.view.dispatch(tr as never),
    ed.view,
  );
}

describe("CL-3b1-9h two depth writes on the same entry", () => {
  it("the existing map winner survives identically on every replica", async () => {
    for (const order of ["ab", "ba"] as const) {
      // p:3 starts nested (depth 1): A lifts it (1→0) while B sinks it
      // under p:2 (1→2). Two whole-record writes, one key, one map winner.
      const s = await twoSessions(fullNestedDoc());
      expect(await liftItem(s.edA, "item three")).toBe(true);
      expect(await sinkItem(s.edB, "item three")).toBe(true);
      expect(s.errorsA).toEqual([]);
      expect(s.errorsB).toEqual([]);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      // Offline participant with its own text insert, arriving last.
      const c = fork(s.docB);
      c.text.insert(6, "!");
      Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
      Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
      Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
      const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
      const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
      assertQuiescent(`9h-${order}`, FULL, [a, b, c]);
      // One whole-record winner, identical wrappers everywhere, text intact.
      const depths = [a, b, c].map((replica) => {
        const captured = captureDocumentFromField(replica.text, replica.meta, FULL).document;
        const member = captured.blocks.find((block) => block.paragraphId === "p:3") as unknown as {
          metadata?: Record<string, unknown>;
        };
        return member.metadata?.["listDepth"];
      });
      expect(depths[0]).toBe(depths[1]);
      expect(depths[1]).toBe(depths[2]);
      expect([0, 2]).toContain(depths[0] as number);
      for (const replica of [a, b, c]) {
        expect(textsOf(replica, FULL)).toContain("item three");
      }
    }
  });
});

describe("CL-3b1-R-STR-4 no fallback or withdrawal outcome", () => {
  it("concurrent legal gestures all apply: merge vs insert through bound editors, both orders, offline last", async () => {
    for (const order of ["ab", "ba"] as const) {
      const s = await twoSessions(
        p0Doc([
          { paragraphId: "paragraph:1", text: "abc" },
          { paragraphId: "paragraph:2", text: "def" },
        ]),
      );
      // A merges paragraph:2 into its predecessor while B — which has not
      // observed the merge — prepends to the consumed paragraph. Both
      // gestures are legal; neither may be refused or withdrawn (R-STR-4):
      // the R-STR-3 outcome is the insert surviving in the merged paragraph.
      s.edA.mergeWithPrevious("paragraph:2");
      insertBlockStartText(s.edB, "paragraph:2", "XYZ");
      expect(s.errorsA, `r-str-4-${order} A errors`).toEqual([]);
      expect(s.errorsB, `r-str-4-${order} B errors`).toEqual([]);
      syncSessions({ doc: s.docA }, { doc: s.docB }, order);
      // Offline participant with its own field-end insert, arriving last.
      const c = fork(s.docB);
      c.text.insert(c.text.length, "!");
      Y.applyUpdate(c.doc, Y.encodeStateAsUpdate(s.docA));
      Y.applyUpdate(s.docA, Y.encodeStateAsUpdate(c.doc));
      Y.applyUpdate(s.docB, Y.encodeStateAsUpdate(c.doc));
      const a: Replica = { doc: s.docA, text: s.textA, meta: s.metaA };
      const b: Replica = { doc: s.docB, text: s.textB, meta: s.metaB };
      assertQuiescent(`r-str-4-${order}`, P0, [a, b, c]);
      for (const replica of [a, b, c]) {
        expect(idsOf(replica, P0)).toEqual(["paragraph:1"]);
        // Nothing dropped: the merge took effect and both inserts survived
        // at their sequence positions — no degraded outcome recorded.
        expect(textsOf(replica, P0)).toEqual(["abcXYZdef!"]);
      }
    }
  });
});
