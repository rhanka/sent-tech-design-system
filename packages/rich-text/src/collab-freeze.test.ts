/**
 * CL-3c witness 4, DS half — freeze-bridge candidate capture against a
 * test-double publication authority (spec §8 CL-3 (4), §4.7).
 *
 * A real bound session over the in-memory double (freeze semantics are
 * transport-independent; the Task-2 Hocuspocus backing is not required
 * here). The session's candidate capture (`captureBoundDocument` output per
 * field) is fed to a test-double publication authority
 * (`./collab-freeze-authority.test-support.ts`) that retains the baseline,
 * refuses incomplete / unrepresentable / duplicate-identity / unmapped-field
 * captures before diffing (mirroring the host `captureBaselineDiff`
 * refusal posture), and otherwise computes the paragraph diff
 * (added / removed / text-changed by `paragraphId`) as plain data.
 *
 * (a) two participants type, split and merge concurrently in one field: the
 * candidate capture yields exactly the merged delta; (b) the same session
 * undoes back to baseline (CL-3b1 manager, `stopCapturing()` between
 * gestures): a fresh candidate capture yields the empty cumulative return;
 * (c) the retained baseline is deep-equal to its session-open value and
 * capture applies no transaction (state vector identical immediately before
 * and after each `captureBoundDocument` call); (d) each refused capture
 * shape is refused whole with the double's `diffParagraphs`-equivalent
 * never invoked.
 *
 * This qualifies the DS candidate capture only. The real Focus diff,
 * lineage, serialisation, CAS publication and the FE-6 gate stay host-side
 * (CL-5). No « connected publication delivered » claim follows from this
 * lot (spec §4.7 point 4).
 *
 * RED on the CL-3c base: no authority/capture witness exists, so (a)–(d)
 * fail at setup (`Cannot find module
 * './collab-freeze-authority.test-support.js'`).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  captureBoundDocument,
  createInMemoryTestDoubleProvider,
} from "./editor-collaboration.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import { affectedBlocksFromDelta, linearBlocksOf } from "./collab-projection.js";
import type { RichTextDocument } from "./model.js";
import type { RichTextEditor } from "./editor.js";
import {
  createTestPublicationAuthority,
  toTestCandidate,
  type FreezeTestBlock,
} from "./collab-freeze-authority.test-support.js";

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const P0 = "focus.markdown.p0@1";
const DOCUMENT_ID = "canvas:cl3c-freeze-4";
const SESSION_ID = "session:cl3c-freeze-4";
const FIELD = "body";
const P1 = "paragraph:freeze-p1";
const P2 = "paragraph:freeze-p2";

function baselineDoc(): RichTextDocument {
  return {
    format: P0,
    blocks: [
      { paragraphId: P1, kind: "paragraph", text: "alpha" },
      { paragraphId: P2, kind: "paragraph", text: "beta" },
    ],
  };
}

function vectorHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateVector(doc)).toString("hex");
}

describe("CL-3c-04(a) regression unit: boundary insert attribution", () => {
  it("attributes a text insert landing before a separator to the preceding block", () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const meta = ydoc.getMap("fieldmeta:body") as Y.Map<unknown>;
    seedFieldFromDocument(ytext, meta, FIELD, baselineDoc());
    const pre = linearBlocksOf(ytext);
    // Append "AA" at the end of p1: the separator of p2 sits at index 6,
    // so the insert lands exactly on it and extends p1's tail.
    ydoc.transact(() => {
      ytext.insert(6, "AA");
    });
    const post = linearBlocksOf(ytext);
    const affected = affectedBlocksFromDelta(pre, post, [{ retain: 6 }, { insert: "AA" }] as never);
    expect(affected).toEqual([P1]);
  });

  it("keeps an insert at index 0 on the first block", () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const meta = ydoc.getMap("fieldmeta:body") as Y.Map<unknown>;
    seedFieldFromDocument(ytext, meta, FIELD, baselineDoc());
    const pre = linearBlocksOf(ytext);
    ydoc.transact(() => {
      ytext.insert(0, "AA");
    });
    const post = linearBlocksOf(ytext);
    const affected = affectedBlocksFromDelta(pre, post, [{ insert: "AA" }] as never);
    expect(affected).toEqual([P1]);
  });
});

describe("CL-3c-04 freeze-bridge candidate capture, DS half", () => {
  const mounted: RichTextEditor[] = [];
  afterEach(() => {
    for (const editor of mounted.splice(0)) editor.destroy();
  });

  it("(a) concurrent type, split and merge yield exactly the merged delta", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]);
    const identity = { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD };
    const seeded = source.resolveBinding(identity);
    seedFieldFromDocument(seeded.text, seeded.fieldMeta, FIELD, baselineDoc());

    const sessionOpen = captureBoundDocument(seeded, P0);
    const authority = createTestPublicationAuthority({
      [FIELD]: sessionOpen.document.blocks.map((block) => ({
        paragraphId: block.paragraphId,
        serialized: (block as { text?: string }).text ?? "",
        representable: true,
      })),
    });

    let sequence = 0;
    const edA = await createBoundRichTextEditor({
      document: baselineDoc(),
      messages: { ...MESSAGES },
      allocateId: () => `test:freeze:${(sequence += 1)}`,
      collaborationBinding: identity,
      collaborationSource: source,
      collaborationActor: { actorId: "witness:alice", displayLabel: "Alice", color: "#112233" },
      element: globalThis.document.createElement("div"),
    });
    const edB = await createBoundRichTextEditor({
      document: baselineDoc(),
      messages: { ...MESSAGES },
      allocateId: () => `test:freeze:${(sequence += 1)}`,
      collaborationBinding: identity,
      collaborationSource: source,
      collaborationActor: { actorId: "witness:bob", displayLabel: "Bob", color: "#445566" },
      element: globalThis.document.createElement("div"),
    });
    mounted.push(edA, edB);

    // Two participants, deterministic gestures with AMB-8 delimiters.
    edA.stopCapturing();
    edA.typeText(P1, "AA");
    edB.stopCapturing();
    edB.typeText(P2, "BB");
    edA.stopCapturing();
    edA.splitParagraph(P1, 3);
    edB.stopCapturing();
    edB.mergeWithPrevious(P2);

    const doc = seeded.text.doc as Y.Doc;
    const before = vectorHex(doc);
    const candidate = captureBoundDocument(seeded, P0);
    const after = vectorHex(doc);
    expect(after).toBe(before);

    const verdict = authority.submitCandidate(toTestCandidate(FIELD, candidate));
    expect(verdict.refused).toBeNull();
    expect(authority.diffCallCount()).toBe(1);
    expect(verdict.delta).not.toBeNull();
    const delta = verdict.delta as NonNullable<typeof verdict.delta>;
    // Split head changed, split tail added (carrying the merged p2 text),
    // p2 retired by the merge. Nothing else.
    expect(delta.changed).toEqual([{ paragraphId: P1, before: "alpha", after: "alp" }]);
    expect(delta.removed).toEqual([{ paragraphId: P2 }]);
    expect(delta.added).toHaveLength(1);
    expect(delta.added[0]?.text).toBe("haAAbetaBB");
    const tailId = delta.added[0]?.paragraphId as string;
    expect(typeof tailId).toBe("string");
    expect([P1, P2]).not.toContain(tailId);
  });

  it("(b) undo-to-baseline yields the empty cumulative return", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:cl3c-freeze-4b", "session:cl3c-freeze-4b", [FIELD]);
    const identity = { documentId: "canvas:cl3c-freeze-4b", sessionId: "session:cl3c-freeze-4b", fieldKey: FIELD };
    const seeded = source.resolveBinding(identity);
    seedFieldFromDocument(seeded.text, seeded.fieldMeta, FIELD, baselineDoc());

    const sessionOpen = captureBoundDocument(seeded, P0);
    const openBlocks: FreezeTestBlock[] = sessionOpen.document.blocks.map((block) => ({
      paragraphId: block.paragraphId,
      serialized: (block as { text?: string }).text ?? "",
      representable: true,
    }));
    const authority = createTestPublicationAuthority({ [FIELD]: openBlocks });

    let sequence = 0;
    const edA = await createBoundRichTextEditor({
      document: baselineDoc(),
      messages: { ...MESSAGES },
      allocateId: () => `test:freezeb:${(sequence += 1)}`,
      collaborationBinding: identity,
      collaborationSource: source,
      collaborationActor: { actorId: "witness:alice", displayLabel: "Alice", color: "#112233" },
      element: globalThis.document.createElement("div"),
    });
    const edB = await createBoundRichTextEditor({
      document: baselineDoc(),
      messages: { ...MESSAGES },
      allocateId: () => `test:freezeb:${(sequence += 1)}`,
      collaborationBinding: identity,
      collaborationSource: source,
      collaborationActor: { actorId: "witness:bob", displayLabel: "Bob", color: "#445566" },
      element: globalThis.document.createElement("div"),
    });
    mounted.push(edA, edB);

    edA.stopCapturing();
    edA.typeText(P1, "AA");
    edB.stopCapturing();
    edB.typeText(P2, "BB");
    edA.stopCapturing();
    edA.splitParagraph(P1, 3);
    edB.stopCapturing();
    edB.mergeWithPrevious(P2);

    const merged = authority.submitCandidate(
      toTestCandidate(FIELD, captureBoundDocument(seeded, P0)),
    );
    expect(merged.refused).toBeNull();
    expect(merged.delta?.changed).not.toHaveLength(0);

    // Both participants undo their own gestures; extra undos are silent
    // no-ops (the field manager guards on an empty stack).
    edA.undo();
    edA.undo();
    edA.undo();
    edB.undo();
    edB.undo();
    edB.undo();

    const doc = seeded.text.doc as Y.Doc;
    const before = vectorHex(doc);
    const candidate = captureBoundDocument(seeded, P0);
    const after = vectorHex(doc);
    expect(after).toBe(before);

    const verdict = authority.submitCandidate(toTestCandidate(FIELD, candidate));
    expect(verdict.refused).toBeNull();
    expect(verdict.delta).toEqual({ added: [], removed: [], changed: [] });

    // (c) the retained baseline is deep-equal to its session-open value,
    // returned by the same reference after every call.
    expect(authority.baseline).toEqual({ [FIELD]: openBlocks });
    expect(verdict.baseline).toBe(authority.baseline);
    expect(merged.baseline).toBe(authority.baseline);
  });

  it("(d) refused capture shapes are refused whole before diffing", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:cl3c-freeze-4d", "session:cl3c-freeze-4d", [FIELD]);
    const identity = { documentId: "canvas:cl3c-freeze-4d", sessionId: "session:cl3c-freeze-4d", fieldKey: FIELD };
    const seeded = source.resolveBinding(identity);
    seedFieldFromDocument(seeded.text, seeded.fieldMeta, FIELD, baselineDoc());
    const sessionOpen = captureBoundDocument(seeded, P0);
    const openBlocks: FreezeTestBlock[] = sessionOpen.document.blocks.map((block) => ({
      paragraphId: block.paragraphId,
      serialized: (block as { text?: string }).text ?? "",
      representable: true,
    }));
    const envelope = toTestCandidate(FIELD, sessionOpen);

    const incomplete = createTestPublicationAuthority({ [FIELD]: openBlocks });
    const incompleteVerdict = incomplete.submitCandidate({ ...envelope, complete: false });
    expect(incompleteVerdict.refused).toBe("incomplete-capture");
    expect(incompleteVerdict.delta).toBeNull();
    expect(incomplete.diffCallCount()).toBe(0);

    const unrepresentable = createTestPublicationAuthority({ [FIELD]: openBlocks });
    const unrepresentableVerdict = unrepresentable.submitCandidate({
      ...envelope,
      blocks: envelope.blocks.map((block, index) =>
        index === 0 ? { ...block, representable: false } : block,
      ),
    });
    expect(unrepresentableVerdict.refused).toBe("invalid-capture");
    expect(unrepresentableVerdict.delta).toBeNull();
    expect(unrepresentable.diffCallCount()).toBe(0);

    const duplicate = createTestPublicationAuthority({ [FIELD]: openBlocks });
    const duplicateVerdict = duplicate.submitCandidate({
      ...envelope,
      blocks: [...envelope.blocks, envelope.blocks[0] as FreezeTestBlock],
    });
    expect(duplicateVerdict.refused).toBe("invalid-capture");
    expect(duplicateVerdict.delta).toBeNull();
    expect(duplicate.diffCallCount()).toBe(0);

    const unmapped = createTestPublicationAuthority({ [FIELD]: openBlocks });
    const unmappedVerdict = unmapped.submitCandidate({ ...envelope, fieldKey: "notes" });
    expect(unmappedVerdict.refused).toBe("unmapped-capture");
    expect(unmappedVerdict.delta).toBeNull();
    expect(unmapped.diffCallCount()).toBe(0);
  });
});
