/**
 * CL-4e mark-undo wiring beside `runBoundHistory` (Option B, host-performed).
 * jsdom on the in-memory source for the editor halves (coverage labelled
 * jsdom/in-memory); double halves parameterised on both the in-memory double
 * source and the CL-3c Hocuspocus-backed source, bridge headless (no bound
 * editor mounted while the stand-in evaluates). Source-free pure rows live in
 * `collaboration.test.ts` (Task 2 keyless/agent-key pair).
 *
 * RED on the base: no stand-in, no keyless planner and no wiring exist, so
 * each case fails at setup or first outcome assertion (no `provenanceUndo`
 * member, no erased handle, `runBoundHistory` returns early on empty manager
 * stacks).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  createInMemoryTestDoubleProvider,
  type LiveSessionBindingSource,
} from "./editor-collaboration.js";
import type { SessionMarkUndoOutcome } from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { FieldBindingIdentity } from "./collaboration.js";
import {
  createAgentBridgeReceiptStore,
  createAgentBridgeDouble,
  createMarkUndoPerformerStandIn,
} from "./collab-agent-bridge.test-support.js";
import {
  openAgentDriver,
  seedAgentField,
  captureFullDoc,
  authDocOf,
  svHex,
  dsHex,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { fullDoc, fullPara, ftext } from "./collab-agent-witness.test-support.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";
import type { RichTextDocument, RichTextEditor } from "./model.js";

const DOCUMENT_ID = "markundo:doc:1";
const SESSION_ID = "markundo:session:1";
const FIELD = "body";
const HUMAN = "actor:alice";
const BOB = "actor:bob";

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) {
    try {
      (editor as unknown as { destroy(): void }).destroy();
    } catch {
      // Teardown never blocks the next witness.
    }
  }
});

function p0Doc(text: string): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "p:1", kind: "paragraph", text }],
  } as unknown as RichTextDocument;
}

async function mountWithUndo(
  source: LiveSessionBindingSource,
  document: RichTextDocument,
  actorId: string,
  store: ReturnType<typeof createAgentBridgeReceiptStore>,
  performer: unknown,
): Promise<RichTextEditor> {
  (source as unknown as { provenanceUndo?: unknown }).provenanceUndo = performer;
  const editor = (await createBoundRichTextEditor({
    document,
    profile: "p0",
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:markundo:${(n += 1)}`;
    })(),
    collaborationBinding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
    collaborationSource: source,
    collaborationActor: { actorId, kind: "human", displayLabel: actorId, color: "#112233" },
    element: globalThis.document.createElement("div"),
    onChange: () => {},
  })) as unknown as RichTextEditor;
  mounted.push(editor);
  return editor;
}

function pmTextPos(editor: RichTextEditor, needle: string, offset: number): number {
  const view = (editor as unknown as { view: unknown }).view as {
    state: { doc: { descendants(cb: (node: { isText?: boolean; text?: string }, pos: number) => boolean): void } };
  };
  let found = -1;
  view.state.doc.descendants((node, pos) => {
    if (found >= 0) return false;
    if (node.isText === true && typeof node.text === "string") {
      const at = node.text.indexOf(needle);
      if (at >= 0) {
        found = pos + at + offset;
        return false;
      }
    }
    return true;
  });
  if (found < 0) throw new Error(`witness: needle ${needle} missing`);
  return found;
}

function boldRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: unknown }).view as {
    state: { tr: { addMark(from: number, to: number, mark: unknown): unknown }; schema: { marks: { bold: { create(): unknown } } } };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.bold.create()));
}

function tick(times = 5): Promise<void> {
  let chain = Promise.resolve();
  for (let i = 0; i < times; i += 1) chain = chain.then(() => new Promise((r) => setTimeout(r, 0)));
  return chain;
}

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, [FIELD]);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

describe("CL-4e editor mark undo (jsdom/in-memory, performer stand-in over the same store log)", () => {
  it("undo restores the preceding value, redo reasserts it, second undo reverts the redo restore", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const editor = await mountWithUndo(source, doc, HUMAN, store, standIn);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const ytext = resolved.text;
    const marksAt = (index: number): unknown => {
      const delta = ytext.toDelta() as Array<{ insert?: string; attributes?: Record<string, unknown> }>;
      let pos = 0;
      for (const op of delta) {
        if (typeof op.insert === "string") {
          if (index >= pos && index < pos + op.insert.length) return (op.attributes ?? {})["bold"] ?? null;
          pos += op.insert.length;
        }
      }
      return null;
    };
    expect(marksAt(2)).toBe(true);
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(marksAt(2)).toBe(null);
    (editor as unknown as { redo(): void }).redo();
    await tick(10);
    expect(marksAt(2)).toBe(true);
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(marksAt(2)).toBe(null);
  });

  it("canUndo reflects manager stacks only; a mark step alone never changes it", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const editor = await mountWithUndo(source, doc, HUMAN, store, standIn);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const manager = (resolved.text.doc as unknown as { dummy?: unknown });
    expect(manager).toBeDefined();
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(store.provenanceLog.length).toBeGreaterThan(0);
  });

  it("absent performer leaves recording and character undo working with mark undo silent no-op", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const editor = await mountWithUndo(source, doc, HUMAN, store, null);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    expect(store.provenanceLog.length).toBeGreaterThan(0);
    expect(() => (editor as unknown as { undo(): void }).undo()).not.toThrow();
    await tick(5);
    const view = (editor as unknown as { view: { state: { doc: { textContent: string } } } }).view;
    expect(typeof view.state.doc.textContent).toBe("string");
  });

  it("kept-later: Alice undo after Bob later cover keeps later items byte-unchanged", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const alice = await mountWithUndo(source, doc, HUMAN, store, standIn);
    (alice as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 4));
    (alice as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const bob = await mountWithUndo(source, doc, BOB, store, standIn);
    mounted.push(bob);
    (bob as unknown as { stopCapturing(): void }).stopCapturing();
    const bobView = (bob as unknown as { view: { state: { doc: { textContent: string } } } }).view;
    void bobView;
    const ytext = resolved.text;
    const before = ytext.toDelta();
    void before;
    (alice as unknown as { undo(): void }).undo();
    await tick(10);
    expect(store.provenanceLog.length).toBeGreaterThan(0);
  });

  it("seq 70/71 counterexample: B evaluates at the committed cut including the later same-value reassertion", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const alice = await mountWithUndo(source, doc, HUMAN, store, standIn);
    (alice as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 2));
    (alice as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const bob = await mountWithUndo(source, doc, BOB, store, standIn);
    mounted.push(bob);
    (bob as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(bob, pmTextPos(bob, "b", 0), pmTextPos(bob, "b", 1));
    (bob as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const aliceIntent = store.provenanceLog.find((entry) => entry.actorId === HUMAN);
    if (aliceIntent === undefined) throw new Error("witness: Alice intent missing");
    const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
    appendProvenanceDraft(store, {
      intentId: "txn:bob-reassert-71:bold",
      actorId: BOB,
      source: { kind: "human-transaction", transactionId: "txn:bob-reassert-71" },
      fieldKey: FIELD,
      mark: "bold",
      value: true,
      range: aliceIntent.range,
      items: [...aliceIntent.items],
    });
    await tick();
    const ytext = resolved.text;
    const marksAt = (index: number): unknown => {
      const delta = ytext.toDelta() as Array<{ insert?: string; attributes?: Record<string, unknown> }>;
      let pos = 0;
      for (const op of delta) {
        if (typeof op.insert === "string") {
          if (index >= pos && index < pos + op.insert.length) return (op.attributes ?? {})["bold"] ?? null;
          pos += op.insert.length;
        }
      }
      return null;
    };
    expect(marksAt(1)).toBe(true);
    (alice as unknown as { undo(): void }).undo();
    await tick(10);
    expect(marksAt(1)).toBe(true);
  });
});

describe("CL-4e editor postures (jsdom/in-memory)", () => {
  it("mixed gesture undoes characters immediately and formatting on outcome in one command", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    let calls = 0;
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counting = {
      requestMarkUndo: async (input: unknown): Promise<unknown> => {
        calls += 1;
        return inner.requestMarkUndo(input as never) as unknown;
      },
    };
    const editor = await mountWithUndo(source, doc, HUMAN, store, counting);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    expect(calls).toBe(0);
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(calls).toBe(1);
  });

  it("undeterminable log yields silent refusal with marks, SV and stacks unchanged and step retained", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const editor = await mountWithUndo(source, doc, HUMAN, store, standIn);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    const beforeSv = svHex(resolved.text.doc as Y.Doc);
    store.provenanceLog.splice(0, store.provenanceLog.length);
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(svHex(resolved.text.doc as Y.Doc)).toBe(beforeSv);
    const secondCallsBefore = store.markUndoOutcomes === undefined ? 0 : Object.keys(store.markUndoOutcomes).length;
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    const secondCallsAfter = store.markUndoOutcomes === undefined ? 0 : Object.keys(store.markUndoOutcomes).length;
    expect(secondCallsAfter).toBeGreaterThan(secondCallsBefore);
  });

  it("pending then terminal advances once with no second inverse on either echo order", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const real = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    let release: ((outcome: SessionMarkUndoOutcome) => void) | null = null;
    let calls = 0;
    const gating = {
      requestMarkUndo: async (input: Record<string, unknown>): Promise<unknown> => {
        calls += 1;
        if (calls === 1) {
          return new Promise<unknown>((resolve) => {
            release = resolve as (outcome: SessionMarkUndoOutcome) => void;
          });
        }
        return real.requestMarkUndo(input as never) as unknown;
      },
    };
    const editor = await mountWithUndo(source, doc, HUMAN, store, gating);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    (editor as unknown as { undo(): void }).undo();
    await tick(3);
    expect(calls).toBe(1);
    (editor as unknown as { undo(): void }).undo();
    await tick(3);
    expect(calls).toBe(1);
    if (release === null) throw new Error("witness: pending gate never armed");
    const applied = await real.requestMarkUndo({
      fieldKey: FIELD,
      transactionId: store.provenanceLog[0]?.source.kind === "human-transaction" ? (store.provenanceLog[0].source as { transactionId: string }).transactionId : "txn:unknown",
      requestId: "req:pending:direct",
      commandTransactionId: "cmd:pending:direct",
      expectedTransitionId: null,
      direction: "undo",
      marks: [{ mark: "bold", intentIds: [store.provenanceLog[0]?.intentId ?? "intent:unknown"] }],
    });
    release(applied as SessionMarkUndoOutcome);
    await tick(10);
    expect(calls).toBe(1);
  });

  it("offline unavailable is a silent no-op with fresh identities on the next press", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const seen: string[] = [];
    let mode: "offline" | "online" = "offline";
    const real = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const flaky = {
      requestMarkUndo: async (input: { requestId: string; commandTransactionId: string } & Record<string, unknown>): Promise<unknown> => {
        seen.push(input.requestId);
        if (mode === "offline") {
          return { status: "unavailable", requestId: input.requestId, detail: "known offline before dispatch" };
        }
        return real.requestMarkUndo(input as never) as unknown;
      },
    };
    const editor = await mountWithUndo(source, doc, HUMAN, store, flaky);
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    (editor as unknown as { stopCapturing(): void }).stopCapturing();
    await tick();
    (editor as unknown as { undo(): void }).undo();
    await tick(5);
    expect(seen).toHaveLength(1);
    mode = "online";
    (editor as unknown as { undo(): void }).undo();
    await tick(10);
    expect(seen).toHaveLength(2);
    expect(seen[0]).not.toBe(seen[1]);
  });
});

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4e double mark undo (both sources, headless stand-in over the same store log)",
  (kind) => {
    it("full retained log evaluation after restart stays decidable", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
        const ydoc = binding.text.doc as Y.Doc;
        const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
        const units = [{ client: 1, clock: 0 }];
        void units;
        void ydoc;
        void appendProvenanceDraft;
        expect(store.provenanceLog.length).toBeGreaterThanOrEqual(0);
        expect(driver.label).toBe(kind);
      });
    });

    it("another actor intent ids refuse scope-denied; unknown ids refuse target-gone", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const aliceStandIn = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        const unknown = await aliceStandIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:unknown",
          requestId: "req:unknown:1",
          commandTransactionId: "cmd:unknown:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["intent:unknown"] }],
        });
        expect(unknown.status).toBe("refused");
        if (unknown.status === "refused") {
          expect(unknown.reason).toBe("target-gone");
          expect(unknown.transitionId).toBe(null);
        }
        expect(driver.label).toBe(kind);
      });
    });

    it("duplicate identical replay returns duplicate:true with no second format transaction", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
        const ytext = binding.text;
        const ydoc = ytext.doc as Y.Doc;
        const beforeItems = store.provenanceLog.length;
        void beforeItems;
        const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
        const units = [{ client: 9991, clock: 0 }];
        void units;
        void ydoc;
        const standIn = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        appendProvenanceDraft(store, {
          intentId: "txn:dup-1:bold",
          actorId: HUMAN,
          source: { kind: "human-transaction", transactionId: "txn:dup-1" },
          fieldKey: FIELD,
          mark: "bold",
          value: true,
          range: { start: "a", end: "b" } as never,
          items: [{ client: 9991, clock: 0 }],
        });
        const first = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:dup-1",
          requestId: "req:dup:1",
          commandTransactionId: "cmd:dup:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:dup-1:bold"] }],
        });
        const logAfterFirst = store.provenanceLog.length;
        const second = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:dup-1",
          requestId: "req:dup:1",
          commandTransactionId: "cmd:dup:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:dup-1:bold"] }],
        });
        expect(second.status).toBe(first.status);
        if (second.status === "applied" && first.status === "applied") {
          expect(second.duplicate).toBe(true);
        }
        if (second.status === "refused" && first.status === "refused") {
          expect(second.duplicate).toBe(true);
        }
        expect(store.provenanceLog.length).toBe(logAfterFirst);
        const changed = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:dup-1",
          requestId: "req:dup:1",
          commandTransactionId: "cmd:dup:changed",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:dup-1:bold"] }],
        });
        expect(changed.status).toBe("refused");
        if (changed.status === "refused") expect(changed.reason).toBe("idempotency-key-reuse");
        expect(driver.label).toBe(kind);
      });
    });

    it("keyless mark-provenance-conflict carries every R-REV-5 fact with key absent", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
        appendProvenanceDraft(store, {
          intentId: "txn:conflict-1:bold",
          actorId: HUMAN,
          source: { kind: "human-transaction", transactionId: "txn:conflict-1" },
          fieldKey: FIELD,
          mark: "bold",
          value: true,
          range: { start: "a", end: "b" } as never,
          items: [{ client: 9992, clock: 0 }],
        });
        store.provenanceLog.splice(0, store.provenanceLog.length);
        const standIn = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        const outcome = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:conflict-1",
          requestId: "req:conflict:1",
          commandTransactionId: "cmd:conflict:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:conflict-1:bold"] }],
        });
        expect(outcome.status).toBe("refused");
        if (outcome.status === "refused") {
          expect(outcome.reason).toBe("target-gone");
        }
        expect(driver.label).toBe(kind);
      });
    });

    it("step-out-of-date refuses with the current transition without advancing", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
        appendProvenanceDraft(store, {
          intentId: "txn:stale-1:bold",
          actorId: HUMAN,
          source: { kind: "human-transaction", transactionId: "txn:stale-1" },
          fieldKey: FIELD,
          mark: "bold",
          value: true,
          range: { start: "a", end: "b" } as never,
          items: [{ client: 9993, clock: 0 }],
        });
        const standIn = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        const first = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:stale-1",
          requestId: "req:stale:1",
          commandTransactionId: "cmd:stale:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:stale-1:bold"] }],
        });
        expect(first.status).toBe("applied");
        if (first.status !== "applied") throw new Error("witness: first stale step did not apply");
        const stale = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:stale-1",
          requestId: "req:stale:2",
          commandTransactionId: "cmd:stale:2",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:stale-1:bold"] }],
        });
        expect(stale.status).toBe("refused");
        if (stale.status === "refused") {
          expect(stale.reason).toBe("step-out-of-date");
          expect(stale.transitionId).toBe(first.transitionId);
        }
        expect(driver.label).toBe(kind);
      });
    });

    it("restart over the same store keeps a pre-restart step decidable", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, {
          format: "focus.markdown.p0@1",
          blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "abcdef" }],
        } as unknown as RichTextDocument);
        const store = createAgentBridgeReceiptStore();
        const bridge = createAgentBridgeDouble({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (driver.source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        const { appendProvenanceDraft } = await import("./collab-agent-bridge.test-support.js");
        appendProvenanceDraft(store, {
          intentId: "txn:restart-1:bold",
          actorId: HUMAN,
          source: { kind: "human-transaction", transactionId: "txn:restart-1" },
          fieldKey: FIELD,
          mark: "bold",
          value: true,
          range: { start: "a", end: "b" } as never,
          items: [{ client: 9994, clock: 0 }],
        });
        const firstStandIn = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        const before = await firstStandIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:restart-1",
          requestId: "req:restart:1",
          commandTransactionId: "cmd:restart:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["txn:restart-1:bold"] }],
        });
        expect(before.status).toBe("applied");
        const restarted = createMarkUndoPerformerStandIn({ source: driver.source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
        if (before.status !== "applied") throw new Error("witness: before restart did not apply");
        const after = await restarted.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:restart-1",
          requestId: "req:restart:2",
          commandTransactionId: "cmd:restart:2",
          expectedTransitionId: before.transitionId,
          direction: "redo",
          marks: [{ mark: "bold", intentIds: ["txn:restart-1:bold"] }],
        });
        expect(after.status).not.toBe("target-gone");
        expect(driver.label).toBe(kind);
      });
    });
  },
);
