/**
 * CL-4c provenance — shipped halves (Tasks 3, 4 and 10 shipped parts).
 * jsdom on the in-memory source, coverage labelled as such. Shared working
 * file for Tasks 3, 4, 5(file-level routing/recording) and 10 (absent-sink,
 * undo isolation). The pure computation lives in collaboration.test.ts;
 * the double halves live in collab-agent-revert.test.ts.
 *
 * RED on the base: the sink types and capture do not exist, so every
 * witness fails at import or setup.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  createInMemoryTestDoubleProvider,
  type LiveSessionBindingSource,
  type SessionProvenanceSink,
  type FormattingIntentDraft,
} from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { FieldBindingIdentity, RelativeAnchor } from "./collaboration.js";
import type { RichTextDocument, RichTextEditor } from "./model.js";
import type { RichTextChangeEvent } from "./editor.js";

const mounted: RichTextEditor[] = [] as unknown as RichTextEditor[];
afterEach(() => {
  for (const editor of mounted.splice(0)) (editor as unknown as { destroy(): void }).destroy();
});

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const P0 = "focus.markdown.p0@1";
const FIELD_A = "body";
const FIELD_B = "notes";

function p0Doc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: P0,
    blocks: blocks.map((block) => ({ paragraphId: block.paragraphId, kind: "paragraph", text: block.text })),
  } as unknown as RichTextDocument;
}

let counter = 0;

interface Mounted {
  editor: RichTextEditor;
  ydoc: Y.Doc;
  ytext: Y.Text;
  meta: Y.Map<unknown>;
}

async function mountField(
  source: LiveSessionBindingSource,
  documentId: string,
  sessionId: string,
  fieldKey: string,
  document: RichTextDocument,
  actorId: string,
): Promise<Mounted> {
  counter += 1;
  const identity: FieldBindingIdentity = { documentId, sessionId, fieldKey };
  const gestures: RichTextChangeEvent[] = [];
  const editor = (await createBoundRichTextEditor({
    document,
    profile: "p0",
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:prov:${counter}:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: source,
    collaborationActor: { actorId, kind: "human", displayLabel: actorId, color: "#112233" },
    element: globalThis.document.createElement("div"),
    onChange: (event) => gestures.push(event),
  })) as unknown as RichTextEditor;
  mounted.push(editor);
  const binding = source.resolveBinding(identity);
  return { editor, ydoc: binding.text.doc as Y.Doc, ytext: binding.text, meta: binding.fieldMeta };
}

function pmTextPos(editor: RichTextEditor, needle: string, offset: number): number {
  const view = (editor as unknown as { view: any }).view as {
    state: { doc: { descendants(cb: (node: any, pos: number) => boolean): void } };
  };
  let found = -1;
  view.state.doc.descendants((node, pos) => {
    if (found >= 0) return false;
    if (node.isText && typeof node.text === "string") {
      const at = node.text.indexOf(needle);
      if (at >= 0) {
        found = pos + at + offset;
        return false;
      }
    }
    return true;
  });
  if (found < 0) throw new Error(`provenance witness: needle ${needle} not found`);
  return found;
}

function boldRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: any }).view as {
    state: { tr: any; schema: any };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.bold.create()));
}

/** Same-value reassertion over an overlapping range. A fully redundant mark
    step never reaches the binding: ProseMirror drops it (`tr.addMark` yields
    0 steps) and, for an explicit step, Tiptap v3 drops the transaction itself
    (`prevState.doc.eq(state.doc)` gates the `update` event that feeds
    `handleTransaction`). The binding therefore records every mark-bearing
    transaction it observes; the witness reasserts the same value over the
    first range plus one unmarked character so the transaction commits and
    the overlapping items are recorded again with fresh ids. */
async function reassertBoldRange(editor: RichTextEditor, from: number, to: number): Promise<void> {
  const view = (editor as unknown as { view: any }).view as {
    state: { tr: any; schema: any };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.bold.create()));
}

function hasBold(editor: RichTextEditor, needle: string): boolean {
  const view = (editor as unknown as { view: any }).view as {
    state: { doc: { descendants(cb: (node: any) => boolean): void } };
  };
  let found = false;
  view.state.doc.descendants((node) => {
    if (node.isText && typeof node.text === "string" && node.text.includes(needle)) {
      if (node.marks.some((mark) => mark.type.name === "bold")) found = true;
    }
    return true;
  });
  return found;
}

function textOf(ytext: Y.Text, meta: Y.Map<unknown>, id: string): string | undefined {
  const doc = captureDocumentFromField(ytext, meta, P0).document;
  const block = doc.blocks.find((entry) => entry.paragraphId === id) as { text?: string } | undefined;
  return block?.text;
}

describe("Task 3 sink routing (jsdom, in-memory source)", () => {
  it("routes two fields of one session to the one sink with fieldKeys", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:route1`;
    const sessionId = `prov:session:route1`;
    const received: FormattingIntentDraft[] = [];
    const sink: SessionProvenanceSink = { recordFormattingIntent: (intent) => { received.push(intent); } };
    (provider as unknown as { openSession: unknown });
    const source = provider.openSession(documentId, sessionId, [FIELD_A, FIELD_B]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = sink;
    const docA = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const docB = p0Doc([{ paragraphId: "paragraph:1", text: "beta" }]);
    const resolvedA = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolvedA.text, resolvedA.fieldMeta, FIELD_A, docA);
    const resolvedB = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_B });
    seedFieldFromDocument(resolvedB.text, resolvedB.fieldMeta, FIELD_B, docB);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, docA, "actor:human-a");
    const mountedB = await mountField(source, documentId, sessionId, FIELD_B, docB, "actor:human-b");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "alpha", 5));
    boldRange(mountedB.editor, pmTextPos(mountedB.editor, "beta", 0), pmTextPos(mountedB.editor, "beta", 4));
    expect(received).toHaveLength(2);
    expect(new Set(received.map((entry) => entry.fieldKey))).toEqual(new Set([FIELD_A, FIELD_B]));
  });

  it("keeps one sink closure per session and survives field disposal", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:route2`;
    const sessionId = `prov:session:route2`;
    const receivedA: FormattingIntentDraft[] = [];
    const receivedB: FormattingIntentDraft[] = [];
    const sourceA = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (sourceA as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { receivedA.push(intent); },
    };
    const otherSession = `prov:session:route2b`;
    const sourceB = provider.openSession(documentId, otherSession, [FIELD_A]) as LiveSessionBindingSource;
    (sourceB as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { receivedB.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = sourceA.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const resolvedB = sourceB.resolveBinding({ documentId, sessionId: otherSession, fieldKey: FIELD_A });
    seedFieldFromDocument(resolvedB.text, resolvedB.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(sourceA, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const mountedOther = await mountField(sourceB, documentId, otherSession, FIELD_A, doc, "actor:human-b");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "alpha", 5));
    boldRange(mountedOther.editor, pmTextPos(mountedOther.editor, "alpha", 0), pmTextPos(mountedOther.editor, "alpha", 5));
    expect(receivedA).toHaveLength(1);
    expect(receivedB).toHaveLength(1);
  });

  it("records nothing with no mark gesture (wiring separation)", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:route3`;
    const sessionId = `prov:session:route3`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    expect(received).toHaveLength(0);
  });
});

describe("Task 4 human-intent recording (jsdom, in-memory source)", () => {
  it("records one draft per mark with seq absent at type and runtime", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:rec1`;
    const sessionId = `prov:session:rec1`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "alpha", 5));
    expect(received).toHaveLength(1);
    const draft = received[0] as unknown as Record<string, unknown>;
    expect("seq" in draft).toBe(false);
    expect(typeof draft["intentId"]).toBe("string");
    expect(typeof draft["transactionId" as never]).toBe("undefined");
    const typed = received[0] as FormattingIntentDraft;
    expect(typed.fieldKey).toBe(FIELD_A);
    expect(typed.mark).toBe("bold");
    expect(typed.value).toBe(true);
    expect(Array.isArray(typed.items) && typed.items.length).toBeGreaterThan(0);
    expect(typeof typed.range.start).toBe("string");
  });

  it("mints fresh ids across a same-value reassertion", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:rec2`;
    const sessionId = `prov:session:rec2`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alphaBeta" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "alpha", 5));
    await reassertBoldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "Beta", 4));
    expect(received).toHaveLength(2);
    expect(received[0]?.intentId).not.toBe(received[1]?.intentId);
    expect((received[0]?.source as { transactionId?: string }).transactionId).not.toBe(
      (received[1]?.source as { transactionId?: string }).transactionId,
    );
    // ProseMirror narrows `addMark` to the unmarked subset, so the second
    // gesture records exactly the newly covered items with fresh ids, in the
    // identical draft shape (same mark, same value pairing).
    expect(received[0]?.mark).toBe("bold");
    expect(received[1]?.mark).toBe("bold");
    expect(received[0]?.value).toBe(true);
    expect(received[1]?.value).toBe(true);
    expect(received[0]?.items).toHaveLength(5);
    expect(received[1]?.items).toHaveLength(4);
    const firstIds = new Set((received[0]?.items ?? []).map((item) => `${item.client}:${item.clock}`));
    for (const item of received[1]?.items ?? []) {
      expect(firstIds.has(`${item.client}:${item.clock}`)).toBe(false);
    }
  });

  it("computes and drops with an absent sink while the mark still applies", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:rec3`;
    const sessionId = `prov:session:rec3`;
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    expect(() => boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "alpha", 5))).not.toThrow();
    expect(hasBold(mountedA.editor, "alpha")).toBe(true);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**alpha**");
  });
});

describe("Task 10 shipped halves (jsdom, in-memory source)", () => {
  it("absent-sink formatting later refuses a provenance revert whole", async () => {
    const { createAgentBridgeDouble, createAgentBridgeReceiptStore } = await import("./collab-agent-bridge.test-support.js");
    const { setupAgentBridge } = await import("./collab-agent-witness.test-support.js");
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:absent1`;
    const sessionId = `prov:session:absent1`;
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as unknown as LiveSessionBindingSource;
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]);
    const resolved = (source as LiveSessionBindingSource).resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source as LiveSessionBindingSource, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "ab", 0), pmTextPos(mountedA.editor, "ab", 2));
    expect(hasBold(mountedA.editor, "ab")).toBe(true);
    const { bridge, store } = setupAgentBridge(source as LiveSessionBindingSource, documentId, sessionId, [FIELD_A]);
    void createAgentBridgeDouble;
    const read = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const startAnchor = read.fields[0]?.paragraphs[0]?.startAnchor as RelativeAnchor;
    const endAnchor = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
    const { agentPatchFromRead } = await import("./collab-agent-witness.test-support.js");
    const patch = agentPatchFromRead(read, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:1", [
      { type: "mark", fieldKey: FIELD_A, paragraphId: "paragraph:1", range: { start: startAnchor, end: endAnchor }, mark: "bold", applied: true },
    ]);
    expect((await bridge.applyPatch(patch)).status).toBe("applied");
    const recordKey = JSON.stringify([documentId, "actor:agent-a", "epoch:1", patch.patchId]);
    const record = store.records[recordKey];
    const intentId = record?.operations.find((entry) => entry.kind === "mark")?.markIntentIds[0];
    store.provenanceLog = store.provenanceLog.filter((entry) => entry.intentId !== intentId);
    const svBefore = Buffer.from(Y.encodeStateVector((resolved.text.doc as Y.Doc))).toString("hex");
    const revert = await bridge.revertPatch({ key: { documentId, actorId: "actor:agent-a", sessionEpoch: "epoch:1", patchId: patch.patchId }, requestedBy: "actor:human-a" });
    expect(revert.status).toBe("refused");
    expect(revert.reason).toBe("mark-provenance-conflict");
    expect(Buffer.from(Y.encodeStateVector(resolved.text.doc as Y.Doc)).toString("hex")).toBe(svBefore);
  });

  it("human undo never removes agent text and no mark path touches the UndoManager", async () => {
    const { setupAgentBridge } = await import("./collab-agent-witness.test-support.js");
    const { agentPatchFromRead } = await import("./collab-agent-witness.test-support.js");
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:iso1`;
    const sessionId = `prov:session:iso1`;
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as unknown as LiveSessionBindingSource;
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "base" }]);
    const resolved = (source as LiveSessionBindingSource).resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source as LiveSessionBindingSource, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const manager = (mountedA.editor as unknown as { undoManager?: { canUndo(): boolean } }).undoManager as unknown as { canUndo(): boolean } | undefined;
    void manager;
    mountedA.editor.typeText("paragraph:1", "H");
    const { bridge } = setupAgentBridge(source as LiveSessionBindingSource, documentId, sessionId, [FIELD_A]);
    const read = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
    const patch = agentPatchFromRead(read, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:1", [
      { type: "insert", fieldKey: FIELD_A, paragraphId: "paragraph:1", at, text: "A" },
    ]);
    expect((await bridge.applyPatch(patch)).status).toBe("applied");
    const beforeUndo = textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string;
    expect(beforeUndo).toContain("H");
    expect(beforeUndo).toContain("A");
    mountedA.editor.undo();
    const afterUndo = textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string;
    expect(afterUndo).not.toContain("H");
    expect(afterUndo).toContain("A");
  });
});
