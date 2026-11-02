/**
 * CL-4e mark-undo wiring beside `runBoundHistory` (Option B, host-performed) — fix 1 witnesses.
 * jsdom on the in-memory source for the editor halves (coverage labelled
 * jsdom/in-memory); double halves parameterised on both the in-memory double
 * source and the CL-3c Hocuspocus-backed source. Double evaluation is
 * headless: where a human intent must come from a real path, an editor
 * mounts for setup only and is destroyed before the stand-in evaluates.
 * Source-free pure rows live in `collaboration.test.ts` (Task 2
 * keyless/agent-key pair, cast-free).
 *
 * Gesture model under test (§3.3 rules 1–2): one press undoes or redoes
 * exactly one gesture — character-only (an `UndoManager` entry), mark-only
 * (a mark step) or mixed (one of each, linked by `transactionId`).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { TextSelection } from "@tiptap/pm/state";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  boundLocalOriginFor,
  createInMemoryTestDoubleProvider,
  type LiveSessionBindingSource,
} from "./editor-collaboration.js";
import type { SessionMarkUndoOutcome } from "./editor-collaboration.js";
import {
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { FieldBindingIdentity } from "./collaboration.js";
import {
  createAgentBridgeReceiptStore,
  createAgentBridgeDouble,
  createMarkUndoPerformerStandIn,
  type MarkUndoStandIn,
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
import type { RichTextChangeEvent, RichTextDocument, RichTextEditor } from "./model.js";

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
const observed: Y.UndoManager[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) {
    try {
      (editor as unknown as { destroy(): void }).destroy();
    } catch {
      // Teardown never blocks the next witness.
    }
  }
  for (const manager of observed.splice(0)) {
    try {
      manager.destroy();
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
  onChange?: (event: RichTextChangeEvent) => void,
): Promise<RichTextEditor> {
  void store;
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
    onChange: onChange ?? (() => {}),
  })) as unknown as RichTextEditor;
  mounted.push(editor);
  return editor;
}

/** Recorded gesture summaries (`kind` plus touched-block count) for
    emission-shape witnesses: a void press must record nothing, an effective
    press exactly one entry with at least one touched block. */
function recordGestures(): {
  seen: Array<{ kind: string; affected: number }>;
  onChange: (event: RichTextChangeEvent) => void;
} {
  const seen: Array<{ kind: string; affected: number }> = [];
  return {
    seen,
    onChange: (event: RichTextChangeEvent): void => {
      seen.push({ kind: event.gesture.kind, affected: event.gesture.affectedParagraphIds.length });
    },
  };
}

function bindingOf(
  documentId = DOCUMENT_ID,
  sessionId = SESSION_ID,
  fieldKey = FIELD,
): FieldBindingIdentity {
  return { documentId, sessionId, fieldKey };
}

function pmTextPos(editor: RichTextEditor, needle: string, offset: number): number {
  // Concatenated search across split mark runs: after a bold, no single
  // text node holds the whole paragraph text anymore.
  const view = (editor as unknown as { view: unknown }).view as {
    state: { doc: { descendants(cb: (node: { isText?: boolean; text?: string }, pos: number) => void): void } };
  };
  const runs: Array<{ start: number; text: string }> = [];
  let full = "";
  view.state.doc.descendants((node, pos) => {
    if (node.isText === true && typeof node.text === "string") {
      runs.push({ start: pos, text: node.text });
      full += node.text;
    }
  });
  const at = full.indexOf(needle);
  if (at < 0) throw new Error(`witness: needle ${needle} missing`);
  const target = at + offset;
  let acc = 0;
  for (const run of runs) {
    if (target >= acc && target <= acc + run.text.length) return run.start + (target - acc);
    acc += run.text.length;
  }
  throw new Error("witness: offset outside the paragraph text");
}

function boldRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: unknown }).view as {
    state: { tr: { addMark(from: number, to: number, mark: unknown): unknown }; schema: { marks: { bold: { create(): unknown } } } };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.bold.create()));
}

function italicRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: unknown }).view as {
    state: { tr: { addMark(from: number, to: number, mark: unknown): unknown }; schema: { marks: { italic: { create(): unknown } } } };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.italic.create()));
}

function boldItalicRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: unknown }).view as {
    state: {
      tr: { addMark(from: number, to: number, mark: unknown): unknown };
      schema: { marks: { bold: { create(): unknown }; italic: { create(): unknown } } };
    };
    dispatch(tr: unknown): void;
  };
  const tr = view.state.tr as unknown as {
    addMark(from: number, to: number, mark: unknown): { addMark(from: number, to: number, mark: unknown): unknown };
  };
  view.dispatch(
    tr
      .addMark(from, to, view.state.schema.marks.bold.create())
      .addMark(from, to, view.state.schema.marks.italic.create()),
  );
}

/** One mixed gesture (typing formatted text): an insert plus its mark in a
    single ProseMirror transaction, so the shared transact runs under the
    local origin (its own `UndoManager` entry) while recording mark intents
    under one `transactionId`. */
function mixedTypeBold(editor: RichTextEditor, text: string): void {
  const view = (editor as unknown as { view: unknown }).view as {
    state: {
      tr: { insertText(text: string, from: number): { addMark(from: number, to: number, mark: unknown): unknown } };
      schema: { marks: { bold: { create(): unknown } } };
    };
    dispatch(tr: unknown): void;
  };
  const at = pmTextPos(editor, "abcdef", 6);
  view.dispatch(
    view.state.tr.insertText(text, at).addMark(at, at + text.length, view.state.schema.marks.bold.create()),
  );
}

function docText(editor: RichTextEditor): string {
  return (editor as unknown as { view: { state: { doc: { textContent: string } } } }).view.state.doc.textContent;
}

function yMarksAt(ytext: Y.Text, index: number): unknown {
  const delta = ytext.toDelta() as Array<{ insert?: string; attributes?: Record<string, unknown> }>;
  let pos = 0;
  for (const op of delta) {
    if (typeof op.insert === "string") {
      if (index >= pos && index < pos + op.insert.length) return (op.attributes ?? {})["bold"] ?? null;
      pos += op.insert.length;
    }
  }
  return null;
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

type MarkUndoInput = {
  fieldKey: string;
  transactionId: string;
  requestId: string;
  commandTransactionId: string;
  expectedTransitionId: string | null;
  direction: "undo" | "redo";
  marks: Array<{ mark: string; intentIds: string[] }>;
};

/** Counting performer wrapper: records every invocation input, forwards to
    the wrapped performer. */
function countingPerformer(inner: {
  requestMarkUndo(input: unknown): Promise<unknown>;
}): {
  seen: MarkUndoInput[];
  performer: { requestMarkUndo(input: MarkUndoInput): Promise<unknown> };
} {
  const seen: MarkUndoInput[] = [];
  return {
    seen,
    performer: {
      requestMarkUndo: async (input: MarkUndoInput): Promise<unknown> => {
        seen.push({
          fieldKey: input.fieldKey,
          transactionId: input.transactionId,
          requestId: input.requestId,
          commandTransactionId: input.commandTransactionId,
          expectedTransitionId: input.expectedTransitionId,
          direction: input.direction,
          marks: input.marks.map((group) => ({ mark: group.mark, intentIds: [...group.intentIds] })),
        });
        return inner.requestMarkUndo(input as never) as unknown;
      },
    },
  };
}

/** Manually resolved performer (outcome-correlation witness): each call
    parks its promise until the test resolves it. */
function manualPerformer(): {
  inputs: unknown[];
  resolvers: Array<(outcome: unknown) => void>;
  performer: { requestMarkUndo(input: unknown): Promise<unknown> };
} {
  const inputs: unknown[] = [];
  const resolvers: Array<(outcome: unknown) => void> = [];
  return {
    inputs,
    resolvers,
    performer: {
      requestMarkUndo: (input: unknown): Promise<unknown> => {
        inputs.push(input);
        return new Promise<unknown>((resolve) => {
          resolvers.push(resolve as (outcome: unknown) => void);
        });
      },
    },
  };
}

/** An independent `UndoManager` observing the same scopes under the same
    local origin: it mirrors the field manager's capture of tracked
    transactions (mark-only transactions under the mark origin enter
    neither), so `canUndo` and stack depths are assertable without touching
    shipped handles. */
function observeStacks(
  source: LiveSessionBindingSource,
  actorId: string,
): { manager: Y.UndoManager; undoLength(): number; redoLength(): number } {
  const binding = source.resolveBinding(bindingOf());
  const manager = new Y.UndoManager([binding.text, binding.fieldMeta] as never, {
    trackedOrigins: new Set([boundLocalOriginFor(bindingOf(), actorId)]),
  });
  observed.push(manager);
  return {
    manager,
    undoLength: () => manager.undoStack.length,
    redoLength: () => manager.redoStack.length,
  };
}

function humanTxnOf(
  store: ReturnType<typeof createAgentBridgeReceiptStore>,
  mark: string,
  occurrence = 0,
): { transactionId: string; intentId: string } {
  const found = store.provenanceLog.filter(
    (entry) => entry.mark === mark && entry.source.kind === "human-transaction",
  );
  const entry = found[occurrence];
  if (entry === undefined) throw new Error("witness: human intent missing");
  return {
    transactionId: (entry.source as { transactionId: string }).transactionId,
    intentId: entry.intentId,
  };
}

function stop(editor: RichTextEditor): void {
  (editor as unknown as { stopCapturing(): void }).stopCapturing();
}

function undo(editor: RichTextEditor): void {
  (editor as unknown as { undo(): void }).undo();
}

function redo(editor: RichTextEditor): void {
  (editor as unknown as { redo(): void }).redo();
}

function typeEnd(editor: RichTextEditor, text: string): void {
  (editor as unknown as { typeText(paragraphId: string, text: string): void }).typeText("p:1", text);
}

async function setupUndoSource(): Promise<{
  provider: ReturnType<typeof createInMemoryTestDoubleProvider>;
  source: LiveSessionBindingSource;
  doc: RichTextDocument;
  resolved: { text: Y.Text; fieldMeta: Y.Map<unknown> };
  store: ReturnType<typeof createAgentBridgeReceiptStore>;
}> {
  const provider = createInMemoryTestDoubleProvider();
  const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
  const doc = p0Doc("abcdef");
  const resolved = source.resolveBinding(bindingOf()) as unknown as {
    text: Y.Text;
    fieldMeta: Y.Map<unknown>;
  };
  seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
  const store = createAgentBridgeReceiptStore();
  const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
  (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
  return { provider, source, doc, resolved, store };
}

describe("CL-4e single-gesture undo/redo (jsdom/in-memory, §3.3 rules 1–2)", () => {
  it("char-then-mark: one undo requests only the bold, characters intact; redo symmetric", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const boldTxn = humanTxnOf(store, "bold").transactionId;
    expect(docText(editor)).toBe("abcdefZ");
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    undo(editor);
    await tick(10);
    // Exactly one gesture undone: the bold is requested, the typed
    // character is intact.
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: boldTxn, direction: "undo" });
    expect(docText(editor)).toBe("abcdefZ");
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    redo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: boldTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(docText(editor)).toBe("abcdefZ");
  });

  it("mark-then-char: one undo removes only the characters with no mark request; second undo requests the bold", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    await tick();
    const boldTxn = humanTxnOf(store, "bold").transactionId;
    undo(editor);
    await tick(10);
    // Only the character gesture undoes: no mark transition is issued and
    // the bold is intact.
    expect(counter.seen).toHaveLength(0);
    expect(docText(editor)).toBe("abcdef");
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: boldTxn, direction: "undo" });
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    expect(docText(editor)).toBe("abcdef");
  });

  it("mixed gesture undoes characters synchronously and formatting on outcome in one press; redo keeps the reinserted marks", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    mixedTypeBold(editor, "XYZ");
    stop(editor);
    await tick();
    const mixedTxn = humanTxnOf(store, "bold").transactionId;
    const logBefore = store.provenanceLog.length;
    expect(docText(editor)).toBe("abcdefXYZ");
    expect(yMarksAt(resolved.text, 7)).toBe(true);
    undo(editor);
    // The character half applies synchronously at press time, exactly once,
    // with its own `UndoManager` entry linked by `transactionId`.
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    await tick(10);
    // The inserted items are gone, so the mark half completes with no
    // manufactured intent.
    expect(store.provenanceLog.length).toBe(logBefore);
    const selection = (editor as unknown as { getSelection(): { anchorParagraphId: string | null } }).getSelection();
    expect(selection.anchorParagraphId).toBe("p:1");
    redo(editor);
    expect(docText(editor)).toBe("abcdefXYZ");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: mixedTxn, direction: "redo" });
    await tick(10);
    // The character redo reinserts the marked text; the mark redo is a
    // no-op through the cleared transition linkage — never a null restore
    // over the reinserted marks.
    expect(yMarksAt(resolved.text, 7)).toBe(true);
    expect(store.provenanceLog.length).toBe(logBefore);
  });

  it("interleaved marks undo latest-first with the neighbour intact, then redo mirrors", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 2));
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 3), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const firstTxn = humanTxnOf(store, "bold", 0).transactionId;
    const secondTxn = humanTxnOf(store, "bold", 1).transactionId;
    expect(firstTxn).not.toBe(secondTxn);
    undo(editor);
    await tick(10);
    // Only the latest gesture advances: the neighbour step is intact (a
    // double advance would un-bold it here).
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: secondTxn, direction: "undo" });
    expect(yMarksAt(resolved.text, 3)).toBe(null);
    expect(yMarksAt(resolved.text, 1)).toBe(true);
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: firstTxn, direction: "undo" });
    expect(yMarksAt(resolved.text, 1)).toBe(null);
    const transitions = counter.seen.slice(0, 2).map((input) => {
      const entry = store.markUndoOutcomes?.[input.requestId];
      if (entry === undefined) throw new Error("witness: outcome missing");
      return (entry.outcome as { transitionId: string }).transitionId;
    });
    expect(transitions[0]).not.toBe(transitions[1]);
    redo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(3);
    expect(counter.seen[2]).toMatchObject({ transactionId: firstTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, 1)).toBe(true);
    expect(yMarksAt(resolved.text, 3)).toBe(null);
    redo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(4);
    expect(counter.seen[3]).toMatchObject({ transactionId: secondTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, 3)).toBe(true);
  });
});

describe("CL-4e editor mark undo (jsdom/in-memory, performer stand-in over the same store log)", () => {
  it("undo restores the preceding value, redo reasserts it, second undo reverts the redo restore", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const editor = await mountWithUndo(source, doc, HUMAN, store, standIn);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const marksAt = (index: number): unknown => yMarksAt(resolved.text, index);
    expect(marksAt(2)).toBe(true);
    undo(editor);
    await tick(10);
    expect(marksAt(2)).toBe(null);
    redo(editor);
    await tick(10);
    expect(marksAt(2)).toBe(true);
    undo(editor);
    await tick(10);
    expect(marksAt(2)).toBe(null);
  });

  it("canUndo reflects manager stacks only; a mark step alone never changes it", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const editor = await mountWithUndo(source, doc, HUMAN, store, standIn);
    // Independent observer under the same local origin: mirrors the field
    // manager's capture without touching shipped handles.
    const observer = observeStacks(source, HUMAN);
    expect(observer.manager.canUndo()).toBe(false);
    expect(observer.undoLength()).toBe(0);
    expect(observer.redoLength()).toBe(0);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    // Mark-only formatting enters no `UndoManager` stack.
    expect(observer.manager.canUndo()).toBe(false);
    expect(observer.undoLength()).toBe(0);
    expect(observer.redoLength()).toBe(0);
    undo(editor);
    await tick(10);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    expect(observer.manager.canUndo()).toBe(false);
    expect(observer.undoLength()).toBe(0);
    expect(observer.redoLength()).toBe(0);
    redo(editor);
    await tick(10);
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(observer.manager.canUndo()).toBe(false);
    expect(observer.undoLength()).toBe(0);
    expect(observer.redoLength()).toBe(0);
  });

  it("absent performer leaves recording and character undo working with mark undo silent no-op", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const editor = await mountWithUndo(source, doc, HUMAN, store, null);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    await tick();
    // Recording through the sink is unaffected by the absent performer.
    expect(store.provenanceLog.length).toBeGreaterThan(0);
    expect(docText(editor)).toBe("abcdefZ");
    // Character undo still runs; the mark half is a silent no-op.
    expect(() => undo(editor)).not.toThrow();
    await tick(5);
    expect(docText(editor)).toBe("abcdef");
    expect(yMarksAt(resolved.text, 2)).toBe(true);
  });

  it("kept-later: Alice undo after Bob later cover keeps later items byte-unchanged", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const alice = await mountWithUndo(source, doc, HUMAN, store, standIn);
    stop(alice);
    // Alice bolds b,c,d over live items through the real sink path.
    boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 4));
    stop(alice);
    await tick();
    // Bob reasserts over c,d,e,f: the e,f remainder makes the transaction
    // record, so the same-value cover over c,d commits for real.
    const bob = await mountWithUndo(source, doc, BOB, store, standIn);
    stop(bob);
    boldRange(bob, pmTextPos(bob, "abcdef", 2), pmTextPos(bob, "abcdef", 5));
    stop(bob);
    await tick();
    const logBefore = store.provenanceLog.length;
    undo(alice);
    await tick(10);
    // Only the uncovered remainder restores; later-covered items stay
    // byte-unchanged and no intent is manufactured over them.
    expect(yMarksAt(resolved.text, 1)).toBe(null);
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(yMarksAt(resolved.text, 3)).toBe(true);
    expect(store.provenanceLog.length).toBe(logBefore + 1);
  });

  it("seq 70/71 counterexample: B evaluates at the committed cut including the later same-value reassertion", async () => {
    // Alice bolds b; Bob same-value-reasserts over b,c (c unmarked, so the
    // transaction records through the real path). Under Option B the
    // performer evaluates at the committed cut including Bob's cover, so
    // Alice's undo keeps b (kept-later); a prefix ending before Bob's
    // reassertion would have returned a determinate restore — the withdrawn
    // A1 outcome this lot does not ship.
    const { source, doc, resolved, store } = await setupUndoSource();
    const standIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const alice = await mountWithUndo(source, doc, HUMAN, store, standIn);
    stop(alice);
    boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 2));
    stop(alice);
    await tick();
    const bob = await mountWithUndo(source, doc, BOB, store, standIn);
    stop(bob);
    boldRange(bob, pmTextPos(bob, "abcdef", 1), pmTextPos(bob, "abcdef", 3));
    stop(bob);
    await tick();
    expect(yMarksAt(resolved.text, 1)).toBe(true);
    undo(alice);
    await tick(10);
    expect(yMarksAt(resolved.text, 1)).toBe(true);
  });

  it("undeterminable log yields silent refusal with marks, SV and stacks unchanged and step retained", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    // Real-time envelope indexing: the committed envelope survives the
    // named missing-provenance construction below (log truncation).
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = inner.wrapSink(
      (source as unknown as { provenanceSink: { recordFormattingIntent(intent: unknown): void } }).provenanceSink,
    );
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const beforeSv = svHex(resolved.text.doc as Y.Doc);
    const beforeDs = dsHex(resolved.text.doc as Y.Doc);
    // Named missing-provenance construction (the defect under witness):
    // the covering intent is gone, so evaluation is undeterminable.
    store.provenanceLog.splice(0, store.provenanceLog.length);
    undo(editor);
    await tick(10);
    expect(svHex(resolved.text.doc as Y.Doc)).toBe(beforeSv);
    expect(dsHex(resolved.text.doc as Y.Doc)).toBe(beforeDs);
    expect(counter.seen).toHaveLength(1);
    const entry = store.markUndoOutcomes?.[counter.seen[0].requestId];
    if (entry === undefined) throw new Error("witness: outcome missing");
    const outcome = entry.outcome as unknown as SessionMarkUndoOutcome;
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("witness: expected refusal");
    expect(outcome.reason).toBe("mark-provenance-conflict");
    if (outcome.conflict === undefined) throw new Error("witness: conflict missing");
    expect(outcome.conflict.kind).toBe("mark-provenance-conflict");
    expect(outcome.conflict.fieldKey).toBe(FIELD);
    expect(outcome.conflict.mark).toBe("bold");
    expect(outcome.conflict.key).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(outcome.conflict, "key")).toBe(false);
    // The step is retained: a deliberate retry mints a fresh identity for
    // the same transaction instead of no-op-ing.
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1].requestId).not.toBe(counter.seen[0].requestId);
    expect(counter.seen[1].transactionId).toBe(counter.seen[0].transactionId);
  });
});

describe("CL-4e editor postures (jsdom/in-memory, stand-in-native holds)", () => {
  it("pending then terminal advances once: second press issues no second mark transition while older characters still undo", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    // The mark half is in flight: echo applied, outcome withheld.
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // A second press issues no second mark transition; only the older
    // character half runs.
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    expect(docText(editor)).toBe("abcdef");
    const cmd = counter.seen[0].commandTransactionId;
    const restoresBefore = store.provenanceLog.filter(
      (entry) => entry.source.kind === "human-transaction" && (entry.source as { transactionId: string }).transactionId === cmd,
    ).length;
    inner.releaseOutcomes();
    await tick(10);
    // The pending outcome resolves without re-applying characters and
    // without a second inverse: exactly one restore set exists.
    expect(counter.seen).toHaveLength(1);
    expect(docText(editor)).toBe("abcdef");
    const restoresAfter = store.provenanceLog.filter(
      (entry) => entry.source.kind === "human-transaction" && (entry.source as { transactionId: string }).transactionId === cmd,
    ).length;
    expect(restoresAfter).toBe(restoresBefore);
    expect(restoresAfter).toBe(1);
  });

  it("offline unavailable is a silent no-op with fresh identities on the next press, characters still undo", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
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
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    undo(editor);
    await tick(5);
    // One press undoes one gesture: the latest is the bold, whose mark
    // half is unavailable offline — characters and marks stay untouched,
    // and the failure is silent.
    expect(docText(editor)).toBe("abcdefZ");
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(seen).toHaveLength(1);
    mode = "online";
    undo(editor);
    await tick(10);
    // The same gesture retries under a fresh identity and applies; the
    // older character gesture is still intact.
    expect(seen).toHaveLength(2);
    expect(seen[0]).not.toBe(seen[1]);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    expect(docText(editor)).toBe("abcdefZ");
    undo(editor);
    await tick(10);
    // The older character gesture undoes on its own press.
    expect(docText(editor)).toBe("abcdef");
    expect(seen).toHaveLength(2);
  });

  it("local steps never pollute the durable log: only host restores carry the command transaction", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const logBefore = store.provenanceLog.length;
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // The editor manufactures nothing: exactly the host restore set lands
    // under the command transaction — local step state stays local-only.
    const hostEntries = store.provenanceLog.filter(
      (entry) => entry.source.kind === "human-transaction" && (entry.source as { transactionId: string }).transactionId === counter.seen[0].commandTransactionId,
    );
    expect(hostEntries).toHaveLength(1);
    expect(store.provenanceLog.length).toBe(logBefore + 1);
  });

  it("outcome correlation: a mismatching outcome is ignored and the invocation stays pending", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const manual = manualPerformer();
    const editor = await mountWithUndo(source, doc, HUMAN, store, manual.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    undo(editor);
    await tick(3);
    expect(manual.inputs).toHaveLength(1);
    const pendingId = (manual.inputs[0] as { requestId: string }).requestId;
    // A foreign outcome for another identity resolves: it must not advance
    // the pending step.
    manual.resolvers[0]({
      status: "applied",
      requestId: "markundo:req:foreign:0",
      duplicate: false,
      transitionId: "markundo:trans:foreign:0",
      changed: true,
      detail: "foreign",
    });
    await tick(10);
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(pendingId.startsWith("markundo:req:")).toBe(true);
    // The invocation is still pending, so redo issues no new mark
    // transition (an accepted outcome would have advanced the step and the
    // redo would request it).
    redo(editor);
    await tick(5);
    expect(manual.inputs).toHaveLength(1);
  });

  it("step-out-of-date adopts the current transition without advancing; the retry mints a fresh identity", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const { transactionId, intentId } = humanTxnOf(store, "bold");
    // A racing invocation advances the durable transition behind the
    // editor's back (headless, same store).
    const direct = await inner.requestMarkUndo({
      fieldKey: FIELD,
      transactionId,
      requestId: "req:direct:1",
      commandTransactionId: "cmd:direct:1",
      expectedTransitionId: null,
      direction: "undo",
      marks: [{ mark: "bold", intentIds: [intentId] }],
    });
    if (direct.status !== "applied") throw new Error("witness: direct undo did not apply");
    const currentTransition = direct.transitionId;
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0].expectedTransitionId).toBe(null);
    const first = store.markUndoOutcomes?.[counter.seen[0].requestId];
    if (first === undefined) throw new Error("witness: outcome missing");
    expect((first.outcome as { status: string }).status).toBe("refused");
    expect((first.outcome as { reason: string }).reason).toBe("step-out-of-date");
    expect((first.outcome as { transitionId: string }).transitionId).toBe(currentTransition);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // The editor adopts the returned transition without advancing, and the
    // deliberate retry abandons the refused identity (fresh requestId,
    // changed payload is a new invocation, never a reuse).
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1].expectedTransitionId).toBe(currentTransition);
    expect(counter.seen[1].requestId).not.toBe(counter.seen[0].requestId);
    const second = store.markUndoOutcomes?.[counter.seen[1].requestId];
    if (second === undefined) throw new Error("witness: outcome missing");
    expect((second.outcome as { status: string }).status).toBe("applied");
  });

  it("dispose with pending mark undo ignores late resolution; remount starts with empty local history", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    mounted.splice(mounted.indexOf(editor), 1);
    editor.destroy();
    // Late resolution after disposal is ignored by the editor (no listener,
    // no throw); the durable outcome still records host-side.
    inner.releaseOutcomes();
    await tick(10);
    const entry = store.markUndoOutcomes?.[counter.seen[0].requestId];
    if (entry === undefined) throw new Error("witness: outcome missing");
    expect((entry.outcome as { status: string }).status).toBe("applied");
    // A remounted editor starts with empty local histories: its undo
    // issues no mark transition for the pre-restart step.
    const counter2 = countingPerformer(inner);
    const remounted = await mountWithUndo(source, doc, HUMAN, store, counter2.performer);
    stop(remounted);
    await tick();
    undo(remounted);
    await tick(10);
    expect(counter2.seen).toHaveLength(0);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
  });

  it("performer without sink still records mark steps and undo issues a request", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding(bindingOf()) as unknown as { text: Y.Text; fieldMeta: Y.Map<unknown> };
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    // No sink on purpose: the host captures intents out-of-band.
    const store = createAgentBridgeReceiptStore();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    expect(store.provenanceLog.length).toBe(0);
    undo(editor);
    await tick(10);
    // The local mark step was recorded without any sink, so the press
    // issues exactly one performer request.
    expect(counter.seen).toHaveLength(1);
    // The step is retained (the host holds no committed disposition for
    // it): a retry mints a fresh identity for the same transaction.
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1].transactionId).toBe(counter.seen[0].transactionId);
    expect(counter.seen[1].requestId).not.toBe(counter.seen[0].requestId);
  });

  it("two editors on the same session and field never mint the same request identities", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const standA: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const standB: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const countA = countingPerformer(standA);
    const countB = countingPerformer(standB);
    const alice = await mountWithUndo(source, doc, HUMAN, store, countA.performer);
    const bob = await mountWithUndo(source, doc, HUMAN, store, countB.performer);
    stop(alice);
    boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 2));
    stop(alice);
    stop(bob);
    boldRange(bob, pmTextPos(bob, "abcdef", 3), pmTextPos(bob, "abcdef", 4));
    stop(bob);
    await tick();
    undo(alice);
    undo(bob);
    await tick(10);
    expect(countA.seen).toHaveLength(1);
    expect(countB.seen).toHaveLength(1);
    const requestA = countA.seen[0];
    const requestB = countB.seen[0];
    // Same binding-scoped prefix (one session, one field), process-unique
    // counters: the identities differ.
    expect(requestA.requestId.startsWith(`markundo:req:${SESSION_ID}:${FIELD}:`)).toBe(true);
    expect(requestB.requestId.startsWith(`markundo:req:${SESSION_ID}:${FIELD}:`)).toBe(true);
    expect(requestA.requestId).not.toBe(requestB.requestId);
    expect(requestA.commandTransactionId).not.toBe(requestB.commandTransactionId);
    expect(yMarksAt(resolved.text, 1)).toBe(null);
    expect(yMarksAt(resolved.text, 3)).toBe(null);
  });
});

describe("CL-4e echo orders and no re-record (jsdom/in-memory, mounted replica)", () => {
  async function setupEcho(): Promise<{
    source: LiveSessionBindingSource;
    doc: RichTextDocument;
    resolved: { text: Y.Text; fieldMeta: Y.Map<unknown> };
    store: ReturnType<typeof createAgentBridgeReceiptStore>;
    inner: MarkUndoStandIn;
    counter: ReturnType<typeof countingPerformer>;
    sinkCalls: () => number;
    editor: RichTextEditor;
    replica: RichTextEditor;
    stacksEditor: { manager: Y.UndoManager; undoLength(): number; redoLength(): number };
    stacksReplica: { manager: Y.UndoManager; undoLength(): number; redoLength(): number };
  }> {
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession(DOCUMENT_ID, SESSION_ID, [FIELD]) as LiveSessionBindingSource;
    const doc = p0Doc("abcdef");
    const resolved = source.resolveBinding(bindingOf()) as unknown as { text: Y.Text; fieldMeta: Y.Map<unknown> };
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD, doc);
    const store = createAgentBridgeReceiptStore();
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    let calls = 0;
    const rawSink = bridge.sink;
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = {
      recordFormattingIntent(intent: unknown): void {
        calls += 1;
        rawSink.recordFormattingIntent(intent);
      },
    };
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const replica = await mountWithUndo(source, doc, BOB, store, null);
    const stacksEditor = observeStacks(source, HUMAN);
    const stacksReplica = observeStacks(source, BOB);
    return { source, doc, resolved, store, inner, counter, sinkCalls: () => calls, editor, replica, stacksEditor, stacksReplica };
  }

  it("committed echo applies once under revert:<actor>: no sink re-record, no stack entry, single advance", async () => {
    const { resolved, store, counter, sinkCalls, editor, stacksEditor, stacksReplica } = await setupEcho();
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    const sinkBefore = sinkCalls();
    const undoEditorBefore = stacksEditor.undoLength();
    const undoReplicaBefore = stacksReplica.undoLength();
    const redoEditorBefore = stacksEditor.redoLength();
    const redoReplicaBefore = stacksReplica.redoLength();
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // The echo arrives as an ordinary remote update under a non-local
    // `revert:<actor>` origin: it re-records nothing through the sink and
    // enters no `UndoManager` stack, while history advances once.
    expect(sinkCalls()).toBe(sinkBefore);
    expect(stacksEditor.undoLength()).toBe(undoEditorBefore);
    expect(stacksReplica.undoLength()).toBe(undoReplicaBefore);
    expect(stacksEditor.redoLength()).toBe(redoEditorBefore);
    expect(stacksReplica.redoLength()).toBe(redoReplicaBefore);
    expect(Object.keys(store.markUndoOutcomes ?? {})).toHaveLength(1);
    expect(Object.keys(store.markUndoTransitions ?? {})).toHaveLength(1);
    // The step advanced: the next undo targets nothing (no older gesture),
    // so no second transition is issued.
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
  });

  it("echo-before-response: the echo applies while the outcome is withheld, then advances exactly once", async () => {
    const { resolved, store, counter, sinkCalls, editor, stacksEditor, stacksReplica, inner } = await setupEcho();
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    inner.holdOutcomes();
    const sinkBefore = sinkCalls();
    const undoEditorBefore = stacksEditor.undoLength();
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    // Echo first: the committed marks are gone, but the step has not
    // advanced — the outcome is still withheld.
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    expect(sinkCalls()).toBe(sinkBefore);
    expect(stacksEditor.undoLength()).toBe(undoEditorBefore);
    expect(stacksReplica.undoLength()).toBe(undoEditorBefore);
    // Still pending: no second transition while unresolved.
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    inner.releaseOutcomes();
    await tick(10);
    // Response second: exactly one advance, provable because the redo now
    // requests the undone step (a stuck step would request nothing).
    expect(counter.seen).toHaveLength(1);
    redo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ direction: "redo" });
    expect(yMarksAt(resolved.text, 2)).toBe(true);
  });

  it("response-before-echo: the outcome advances before the echo lands, with no second advance", async () => {
    const { resolved, store, counter, sinkCalls, editor, stacksEditor, stacksReplica, inner } = await setupEcho();
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    inner.setEchoMode("manual");
    const sinkBefore = sinkCalls();
    const undoEditorBefore = stacksEditor.undoLength();
    undo(editor);
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    const cmd = counter.seen[0].commandTransactionId;
    // Response first: history advanced (the next undo requests nothing
    // more) while the echo has not landed — the marks are still present.
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    expect(Object.keys(store.markUndoOutcomes ?? {})).toHaveLength(1);
    expect(Object.keys(store.markUndoTransitions ?? {})).toHaveLength(1);
    undo(editor);
    await tick(5);
    expect(counter.seen).toHaveLength(1);
    inner.flushEcho();
    await tick(10);
    // Echo second: the marks land with no second advance — one outcome,
    // one transition, one restore set, no sink re-record, no stack entry.
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    expect(sinkCalls()).toBe(sinkBefore);
    expect(stacksEditor.undoLength()).toBe(undoEditorBefore);
    expect(stacksReplica.undoLength()).toBe(undoEditorBefore);
    expect(Object.keys(store.markUndoOutcomes ?? {})).toHaveLength(1);
    expect(Object.keys(store.markUndoTransitions ?? {})).toHaveLength(1);
    const restores = store.provenanceLog.filter(
      (entry) => entry.source.kind === "human-transaction" && (entry.source as { transactionId: string }).transactionId === cmd,
    );
    expect(restores).toHaveLength(1);
  });
});

describe("CL-4e double mark undo (both sources, headless evaluation)", () => {
  function destroyMounted(): void {
    for (const editor of mounted.splice(0)) {
      try {
        editor.destroy();
      } catch {
        // Teardown never blocks the next witness.
      }
    }
  }

  /** Real human setup through a bound editor (records through the sink
      path), destroyed before the stand-in evaluates: evaluation itself is
      headless. Returns the committed transaction and intent ids read back
      from the log (orchestration reads, never hand-written entries). */
  async function setupHumanBold(
    driver: AgentWitnessDriver,
    store: ReturnType<typeof createAgentBridgeReceiptStore>,
    actor: string,
    from: number,
    to: number,
    bothMarks = false,
  ): Promise<{ ytext: Y.Text }> {
    seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, p0Doc("abcdef"));
    const source = driver.source as unknown as LiveSessionBindingSource;
    const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const editor = await mountWithUndo(source, p0Doc("abcdef"), actor, store, null);
    if (bothMarks) {
      boldItalicRange(editor, from, to);
    } else {
      boldRange(editor, from, to);
    }
    await tick();
    const resolved = source.resolveBinding(bindingOf()) as unknown as { text: Y.Text };
    destroyMounted();
    return { ytext: resolved.text };
  }

  it("restart over the same store keeps the pre-restart step decidable through the durable tables", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        const { ytext } = await setupHumanBold(driver, store, HUMAN, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        // "Restart": a new stand-in over the same store (durable transition
        // and outcome tables survive; only the evaluation handle is fresh).
        const restarted: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source: driver.source as unknown as LiveSessionBindingSource,
          documentId: DOCUMENT_ID,
          sessionId: SESSION_ID,
          fieldKeys: [FIELD],
          store,
          actorId: HUMAN,
        });
        const undone = await restarted.requestMarkUndo({
          fieldKey: FIELD,
          transactionId,
          requestId: "req:restart:1",
          commandTransactionId: "cmd:restart:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        });
        if (undone.status !== "applied") throw new Error(`witness (${kind}): restart undo did not apply`);
        expect(typeof undone.transitionId).toBe("string");
        expect(yMarksAt(ytext, 2)).toBe(null);
        const redone = await restarted.requestMarkUndo({
          fieldKey: FIELD,
          transactionId,
          requestId: "req:restart:2",
          commandTransactionId: "cmd:restart:2",
          expectedTransitionId: undone.transitionId,
          direction: "redo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        });
        if (redone.status !== "applied") throw new Error(`witness (${kind}): restart redo did not apply`);
        expect(redone.transitionId).not.toBe(undone.transitionId);
        expect(yMarksAt(ytext, 2)).toBe(true);
        destroyMounted();
      });
    }
  });

  it("another actor intent ids refuse scope-denied (never target-gone)", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        await setupHumanBold(driver, store, BOB, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        const source = driver.source as unknown as LiveSessionBindingSource;
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const alice: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        const outcome = await alice.requestMarkUndo({
          fieldKey: FIELD,
          transactionId,
          requestId: "req:scope:1",
          commandTransactionId: "cmd:scope:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        });
        if (outcome.status !== "refused") throw new Error(`witness (${kind}): expected scope-denied`);
        expect(outcome.reason).toBe("scope-denied");
        expect(outcome.transitionId).toBe(null);
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        destroyMounted();
      });
    }
  });

  it("unknown transaction after settled ingress refuses target-gone", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        await setupHumanBold(driver, store, HUMAN, 1, 4);
        const source = driver.source as unknown as LiveSessionBindingSource;
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        const outcome = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: "txn:never-committed",
          requestId: "req:gone:1",
          commandTransactionId: "cmd:gone:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: ["intent:never-committed"] }],
        });
        if (outcome.status !== "refused") throw new Error(`witness (${kind}): expected target-gone`);
        expect(outcome.reason).toBe("target-gone");
        expect(outcome.transitionId).toBe(null);
        destroyMounted();
      });
    }
  });

  it("duplicate identical replay returns the stored outcome; changed payload under the same requestId refuses without replacing", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        const { ytext } = await setupHumanBold(driver, store, HUMAN, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        const source = driver.source as unknown as LiveSessionBindingSource;
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        const input = {
          fieldKey: FIELD,
          transactionId,
          requestId: "req:dup:1",
          commandTransactionId: "cmd:dup:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        } as const;
        const first = await standIn.requestMarkUndo({ ...input, marks: [{ mark: "bold", intentIds: [intentId] }] });
        if (first.status !== "applied") throw new Error(`witness (${kind}): first undo did not apply`);
        const logAfterFirst = store.provenanceLog.length;
        const svAfterFirst = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const replay = await standIn.requestMarkUndo({ ...input, marks: [{ mark: "bold", intentIds: [intentId] }] });
        if (replay.status !== "applied") throw new Error(`witness (${kind}): replay did not apply`);
        expect(replay.duplicate).toBe(true);
        expect(replay.transitionId).toBe(first.transitionId);
        // No second format transaction, no manufactured intent.
        expect(store.provenanceLog.length).toBe(logAfterFirst);
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(svAfterFirst);
        expect(yMarksAt(ytext, 2)).toBe(null);
        const reuse = await standIn.requestMarkUndo({
          ...input,
          marks: [{ mark: "bold", intentIds: ["intent:changed-payload"] }],
        });
        if (reuse.status !== "refused") throw new Error(`witness (${kind}): expected idempotency-key-reuse`);
        expect(reuse.reason).toBe("idempotency-key-reuse");
        // The original durable outcome is not replaced.
        expect(Object.keys(store.markUndoOutcomes ?? {})).toHaveLength(1);
        const kept = store.markUndoOutcomes?.["req:dup:1"];
        if (kept === undefined) throw new Error("witness: outcome missing");
        expect((kept.outcome as { status: string }).status).toBe("applied");
        destroyMounted();
      });
    }
  });

  it("step-out-of-date adopts the current transition without advancing, then the chain continues", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        await setupHumanBold(driver, store, HUMAN, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        const source = driver.source as unknown as LiveSessionBindingSource;
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        const marks = [{ mark: "bold", intentIds: [intentId] }];
        const first = await standIn.requestMarkUndo({
          fieldKey: FIELD, transactionId, requestId: "req:stale:1", commandTransactionId: "cmd:stale:1",
          expectedTransitionId: null, direction: "undo", marks,
        });
        if (first.status !== "applied") throw new Error(`witness (${kind}): first undo did not apply`);
        const stale = await standIn.requestMarkUndo({
          fieldKey: FIELD, transactionId, requestId: "req:stale:2", commandTransactionId: "cmd:stale:2",
          expectedTransitionId: null, direction: "undo", marks,
        });
        if (stale.status !== "refused") throw new Error(`witness (${kind}): expected step-out-of-date`);
        expect(stale.reason).toBe("step-out-of-date");
        expect(stale.transitionId).toBe(first.transitionId);
        const next = await standIn.requestMarkUndo({
          fieldKey: FIELD, transactionId, requestId: "req:stale:3", commandTransactionId: "cmd:stale:3",
          expectedTransitionId: first.transitionId, direction: "undo", marks,
        });
        if (next.status !== "applied") throw new Error(`witness (${kind}): chained undo did not apply`);
        expect(next.transitionId).not.toBe(first.transitionId);
        destroyMounted();
      });
    }
  });

  it("missing provenance yields a genuine keyless mark-provenance-conflict through the committed envelope", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        await setupHumanBold(driver, store, HUMAN, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        const source = driver.source as unknown as LiveSessionBindingSource;
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        // The stand-in is created after the commit, so the committed
        // envelope is indexed; the log truncation below is the named
        // missing-provenance construction (the defect under witness).
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        store.provenanceLog.splice(0, store.provenanceLog.length);
        const outcome = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId,
          requestId: "req:keyless:1",
          commandTransactionId: "cmd:keyless:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        });
        if (outcome.status !== "refused") throw new Error(`witness (${kind}): expected conflict`);
        expect(outcome.reason).toBe("mark-provenance-conflict");
        if (outcome.conflict === undefined) throw new Error("witness: conflict missing");
        expect(outcome.conflict.kind).toBe("mark-provenance-conflict");
        expect(outcome.conflict.fieldKey).toBe(FIELD);
        expect(outcome.conflict.mark).toBe("bold");
        expect(Object.prototype.hasOwnProperty.call(outcome.conflict, "key")).toBe(false);
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        destroyMounted();
      });
    }
  });

  it("multi-group whole refusal: one undeterminable group refuses the whole step with no partial write", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        await setupHumanBold(driver, store, HUMAN, 1, 4, true);
        const bold = humanTxnOf(store, "bold");
        const italic = humanTxnOf(store, "italic");
        expect(italic.transactionId).toBe(bold.transactionId);
        const source = driver.source as unknown as LiveSessionBindingSource;
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const logBefore = store.provenanceLog.length;
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        // Named missing-provenance construction over one group only: the
        // bold intent stays committed, the italic cover is gone.
        store.provenanceLog.splice(
          0,
          store.provenanceLog.length,
          ...store.provenanceLog.filter((entry) => entry.mark !== "italic"),
        );
        const outcome = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId: bold.transactionId,
          requestId: "req:multi:1",
          commandTransactionId: "cmd:multi:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [
            { mark: "bold", intentIds: [bold.intentId] },
            { mark: "italic", intentIds: [italic.intentId] },
          ],
        });
        if (outcome.status !== "refused") throw new Error(`witness (${kind}): expected whole refusal`);
        expect(outcome.reason).toBe("mark-provenance-conflict");
        if (outcome.conflict === undefined) throw new Error("witness: conflict missing");
        expect(outcome.conflict.mark).toBe("italic");
        // No partial write: neither group applied, no intent manufactured.
        expect(store.provenanceLog.length).toBe(logBefore - 1);
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        destroyMounted();
      });
    }
  });

  it("fully kept-later step applies with changed:false, recorded transition and no manufactured intent", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        const source = driver.source as unknown as LiveSessionBindingSource;
        seedAgentField(driver.source, DOCUMENT_ID, SESSION_ID, FIELD, p0Doc("abcdef"));
        const bridge = createAgentBridgeDouble({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store });
        (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
        // Alice bolds b,c,d; Bob same-value-covers b,c,d,e,f (e,f make the
        // transaction record) — all through the real sink path.
        const alice = await mountWithUndo(source, p0Doc("abcdef"), HUMAN, store, null);
        boldRange(alice, pmTextPos(alice, "abcdef", 1), pmTextPos(alice, "abcdef", 4));
        await tick();
        const bob = await mountWithUndo(source, p0Doc("abcdef"), BOB, store, null);
        boldRange(bob, pmTextPos(bob, "abcdef", 1), pmTextPos(bob, "abcdef", 5));
        await tick();
        destroyMounted();
        const { transactionId, intentId } = humanTxnOf(store, "bold", 0);
        const logBefore = store.provenanceLog.length;
        const beforeSv = svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeDs = dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD));
        const beforeCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        const outcome = await standIn.requestMarkUndo({
          fieldKey: FIELD,
          transactionId,
          requestId: "req:kept:1",
          commandTransactionId: "cmd:kept:1",
          expectedTransitionId: null,
          direction: "undo",
          marks: [{ mark: "bold", intentIds: [intentId] }],
        });
        if (outcome.status !== "applied") throw new Error(`witness (${kind}): expected applied`);
        expect(outcome.changed).toBe(false);
        expect(typeof outcome.transitionId).toBe("string");
        // No manufactured intent, no content/SV/DS change; the transition
        // still records so the chain continues.
        expect(store.provenanceLog.length).toBe(logBefore);
        expect(svHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeSv);
        expect(dsHex(authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD))).toBe(beforeDs);
        expect(captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD)).toEqual(beforeCapture);
        const slot = store.markUndoTransitions?.[`${FIELD}:${transactionId}`];
        if (slot === undefined) throw new Error("witness: transition missing");
        expect(slot.transitionId).toBe(outcome.transitionId);
        destroyMounted();
      });
    }
  });

describe("CL-4e pass-2 fixes (pending char scan, truncation while pending, strict correlation)", () => {
  it("pending undo still reaches the oldest character gesture (char, char, mark)", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    typeEnd(editor, "A");
    stop(editor);
    typeEnd(editor, "B");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    expect(docText(editor)).toBe("abcdefAB");
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    // The latest gesture is the bold: its mark half is now in flight.
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    undo(editor);
    await tick(3);
    expect(docText(editor)).toBe("abcdefA");
    expect(counter.seen).toHaveLength(1);
    // While the mark step is still pending, the oldest character gesture
    // must stay reachable: skipping it here blocks "A" forever.
    undo(editor);
    await tick(3);
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
  });

  it("pending undo reaches across an already-undone character gesture (char, mark, char)", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    typeEnd(editor, "A");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    typeEnd(editor, "B");
    stop(editor);
    await tick();
    expect(docText(editor)).toBe("abcdefAB");
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    // Latest gesture first: only the characters go, with no mark request.
    expect(counter.seen).toHaveLength(0);
    expect(docText(editor)).toBe("abcdefA");
    undo(editor);
    await tick(3);
    // The middle gesture is the bold: its mark half is now in flight.
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // The top gesture is already undone, so the scan must keep going down
    // to "A" instead of stopping on it.
    undo(editor);
    await tick(3);
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
  });

  it("redo while pending restores the earliest undone characters first", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    typeEnd(editor, "A");
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    typeEnd(editor, "B");
    stop(editor);
    await tick();
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    undo(editor);
    await tick(3);
    undo(editor);
    await tick(3);
    // Both character gestures are undone while the bold stays in flight.
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    // Redo order is chronological: "A" (index 0) before "B", with no new
    // mark transition while the undo is pending.
    redo(editor);
    await tick(3);
    expect(docText(editor)).toBe("abcdefA");
    expect(counter.seen).toHaveLength(1);
    redo(editor);
    await tick(3);
    expect(docText(editor)).toBe("abcdefAB");
    expect(counter.seen).toHaveLength(1);
  });

  it("new local work while a mixed mark undo is pending truncates the pending redo", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    mixedTypeBold(editor, "B");
    stop(editor);
    await tick();
    const mixedTxn = humanTxnOf(store, "bold").transactionId;
    expect(docText(editor)).toBe("abcdefB");
    inner.holdOutcomes();
    undo(editor);
    // The character half applies synchronously; the mark half is in flight.
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    // New local work while the mark outcome is withheld: the manager drops
    // its redo stack, and the history must drop the pending redo with it.
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    await tick();
    expect(docText(editor)).toBe("abcdefZ");
    inner.releaseOutcomes();
    await tick(10);
    // The pending step still records its outcome, but issues nothing new.
    expect(counter.seen).toHaveLength(1);
    undo(editor);
    await tick(5);
    expect(docText(editor)).toBe("abcdef");
    // Redo restores only "Z": the character half of one gesture is never
    // combined with the mark half of another.
    redo(editor);
    await tick(10);
    expect(docText(editor)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
  });

  it("new local work while a mark-only undo is pending truncates the pending redo", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    stop(editor);
    typeEnd(editor, "Z");
    stop(editor);
    await tick();
    expect(docText(editor)).toBe("abcdefZ");
    inner.releaseOutcomes();
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    undo(editor);
    await tick(5);
    expect(docText(editor)).toBe("abcdef");
    // Redo restores only "Z": the pending mark redo was truncated by the
    // new local work, so no mark transition may follow.
    redo(editor);
    await tick(10);
    expect(docText(editor)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
  });

  it("an applied outcome without requestId never advances the pending step", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const manual = manualPerformer();
    const editor = await mountWithUndo(source, doc, HUMAN, store, manual.performer);
    stop(editor);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stop(editor);
    await tick();
    undo(editor);
    await tick(3);
    expect(manual.inputs).toHaveLength(1);
    // A conforming outcome always carries the pending identity: one without
    // it is ignored and the invocation stays pending.
    manual.resolvers[0]({
      status: "applied",
      duplicate: false,
      transitionId: "markundo:trans:bogus:0",
      changed: true,
      detail: "missing identity",
    });
    await tick(10);
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    // Still pending in both directions: neither press issues a new mark
    // transition for the never-advanced step.
    redo(editor);
    await tick(5);
    expect(manual.inputs).toHaveLength(1);
    undo(editor);
    await tick(5);
    expect(manual.inputs).toHaveLength(1);
  });
});

  it("D-C4c through the stand-in: an uncommitted original stays pending until release, then applies", async () => {
    for (const kind of ["in-memory-double", "hocuspocus"] as const) {
      await withDriver(kind, async (driver) => {
        const store = createAgentBridgeReceiptStore();
        const { ytext } = await setupHumanBold(driver, store, HUMAN, 1, 4);
        const { transactionId, intentId } = humanTxnOf(store, "bold");
        const source = driver.source as unknown as LiveSessionBindingSource;
        const standIn: MarkUndoStandIn = createMarkUndoPerformerStandIn({
          source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN,
        });
        standIn.holdTransactionCommit(transactionId);
        let settled = false;
        const pending = standIn
          .requestMarkUndo({
            fieldKey: FIELD,
            transactionId,
            requestId: "req:lag:1",
            commandTransactionId: "cmd:lag:1",
            expectedTransitionId: null,
            direction: "undo",
            marks: [{ mark: "bold", intentIds: [intentId] }],
          })
          .then((outcome) => {
            settled = true;
            return outcome;
          });
        await tick(5);
        // Lag alone never resolves — not even as `target-gone`.
        expect(settled).toBe(false);
        standIn.releaseTransactionCommit(transactionId);
        const outcome = await pending;
        if (outcome.status !== "applied") throw new Error(`witness (${kind}): released lag did not apply`);
        expect(yMarksAt(ytext, 2)).toBe(null);
        destroyMounted();
      });
    }
  });
});

describe("CL-4f composition commit isolation (jsdom/in-memory, editor level)", () => {
  // An independent observing manager mirrors the field manager's capture —
  // including its production breaks. The compositionstart/end breaks fire
  // inside the dispatched handlers on the field manager only, so the
  // helpers re-issue the same break on the observer afterwards: instrument
  // alignment, not a test-side gap (no `stop()` appears in the test body
  // between the gesture and the commit).
  function beginComposition(editor: RichTextEditor, observer: { manager: Y.UndoManager }): void {
    const dom = (editor as unknown as { view: { dom: HTMLElement } }).view.dom;
    dom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    observer.manager.stopCapturing();
  }

  function endComposition(editor: RichTextEditor, observer: { manager: Y.UndoManager }): void {
    const dom = (editor as unknown as { view: { dom: HTMLElement } }).view.dom;
    dom.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    observer.manager.stopCapturing();
  }

  function collapseToEnd(editor: RichTextEditor, needle: string, offset: number): void {
    const view = (editor as unknown as { view: { state: { doc: unknown; tr: unknown }; dispatch(tr: unknown): void } }).view as {
      state: { doc: { nodeSize: number }; tr: { setSelection(sel: unknown): unknown } };
      dispatch(tr: unknown): void;
    };
    const pos = pmTextPos(editor, needle, offset);
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc as never, pos)));
  }

  function insertMarkedAtEnd(editor: RichTextEditor, needle: string, offset: number, text: string): void {
    const view = (editor as unknown as { view: { state: { tr: unknown; schema: unknown }; dispatch(tr: unknown): void } }).view as {
      state: {
        tr: { insertText(text: string, from: number): { addMark(from: number, to: number, mark: unknown): unknown } };
        schema: { marks: { bold: { create(): unknown } } };
      };
      dispatch(tr: unknown): void;
    };
    const pos = pmTextPos(editor, needle, offset);
    view.dispatch(
      view.state.tr.insertText(text, pos).addMark(pos, pos + text.length, view.state.schema.marks.bold.create()),
    );
  }

  it("a marked commit after a mixed gesture is its own undo step with no test-side break", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stop(editor);
    // Preceding mixed gesture: typed characters plus bold, one transact.
    mixedTypeBold(editor, "XYZ");
    stop(editor);
    await tick();
    const mixedTxn = humanTxnOf(store, "bold").transactionId;
    const undoBefore = observer.undoLength();
    // No test-side capture break between the gesture and the commit: only
    // the production breaks delimit the steps.
    collapseToEnd(editor, "abcdefXYZ", 9);
    beginComposition(editor, observer);
    insertMarkedAtEnd(editor, "abcdefXYZ", 9, "Q");
    endComposition(editor, observer);
    await tick();
    // The commit grew the observing stack by exactly one step.
    expect(observer.undoLength()).toBe(undoBefore + 1);
    expect(docText(editor)).toBe("abcdefXYZQ");
    expect(yMarksAt(resolved.text, 9)).toBe(true);
    const commitTxn = humanTxnOf(store, "bold", 1).transactionId;
    expect(commitTxn).not.toBe(mixedTxn);
    // One undo removes only the composition text and issues exactly one
    // performer request naming the composition transaction; the preceding
    // gesture's marks are byte-unchanged.
    undo(editor);
    expect(docText(editor)).toBe("abcdefXYZ");
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: commitTxn, direction: "undo" });
    expect(yMarksAt(resolved.text, 6)).toBe(true);
    await tick(10);
    // A second undo addresses the preceding mixed gesture.
    undo(editor);
    expect(docText(editor)).toBe("abcdef");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    await tick(10);
    expect(yMarksAt(resolved.text, 6)).toBe(null);
  });
});

describe("CL-4f remote-delete and pending order (jsdom/in-memory)", () => {
  // Deterministic-step discipline for both managers: the test's own
  // `stop()` breaks the field manager only, so the aligned helper re-issues
  // the same break on the independent observer afterwards. The observer is
  // frozen across undo/redo presses (manager undo/redo transacts carry the
  // manager instance as origin, untracked by design): its length proves the
  // pre-press stack shape, consumption is read from text.
  function stepBoth(editor: RichTextEditor, observer: { manager: Y.UndoManager }): void {
    stop(editor);
    observer.manager.stopCapturing();
  }

  function sharedOf(resolved: { text: Y.Text }): string {
    return resolved.text.toString();
  }

  // Shared `Y.Text` index of a needle: the wire carries separator embeds
  // `toString()` skips, so linear offsets never index the sequence.
  function sharedIndexOf(ytext: Y.Text, needle: string): number {
    const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
    let yIndex = 0;
    let linear = "";
    const spans: Array<{ start: number; text: string }> = [];
    for (const op of delta) {
      if (typeof op.insert === "string") {
        spans.push({ start: yIndex, text: op.insert });
        yIndex += op.insert.length;
        linear += op.insert;
      } else if (op.insert !== undefined) {
        yIndex += 1;
      }
    }
    const at = linear.indexOf(needle);
    if (at < 0) throw new Error("witness: needle missing in shared text");
    let acc = 0;
    for (const span of spans) {
      if (at >= acc && at < acc + span.text.length) return span.start + (at - acc);
      acc += span.text.length;
    }
    throw new Error("witness: shared offset outside runs");
  }

  // Mixed gesture at the true paragraph end (the file's `mixedTypeBold`
  // hardcodes the pristine `abcdef` end, which a preceding gesture moves).
  function mixedTypeBoldAtEnd(editor: RichTextEditor): void {
    const full = docText(editor);
    const view = (editor as unknown as { view: { state: { tr: unknown; schema: unknown }; dispatch(tr: unknown): void } }).view as {
      state: {
        tr: { insertText(text: string, from: number): { addMark(from: number, to: number, mark: unknown): unknown } };
        schema: { marks: { bold: { create(): unknown } } };
      };
      dispatch(tr: unknown): void;
    };
    const pos = pmTextPos(editor, full, full.length);
    view.dispatch(
      view.state.tr.insertText("XYZ", pos).addMark(pos, pos + 3, view.state.schema.marks.bold.create()),
    );
  }

  // A remote peer edit: transact under a non-local origin, captured by
  // neither the field manager nor the observer.
  function remoteDelete(resolved: { text: Y.Text }, index: number, length: number): void {
    const ydoc = resolved.text.doc;
    if (ydoc === null) throw new Error("witness: detached text");
    ydoc.transact(() => {
      resolved.text.delete(index, length);
    }, "actor:remote-peer");
  }

  it("(a) newest character gesture deleted remotely: one press consumes the empty gesture only", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    await tick();
    expect(sharedOf(resolved)).toBe("abcdefAB");
    // Setup shape guard: two separate stack items on both managers.
    expect(observer.undoLength()).toBe(2);
    // The remote peer deletes every character of the newest gesture B.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "B"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefA");
    // One press consumes B's now-empty item and stops: A stays intact.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdefA");
    expect(docText(editor)).toBe("abcdefA");
    expect(counter.seen).toHaveLength(0);
    expect(observer.undoLength()).toBe(2);
    // The next press addresses A.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
  });

  it("(b) older character gesture deleted remotely: presses address B then the empty A", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    await tick();
    expect(observer.undoLength()).toBe(2);
    // The remote peer deletes every character of the older gesture A.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "A"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefB");
    // Newest-first: B undoes, then the empty A item is consumed alone.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    // A's empty press leaves no redo item (the manager pushes none for an
    // all-empty pop), so redo selects the only redoable gesture, B, and a
    // further redo is inert: A stays consumed-void with no half to apply.
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdefB");
    expect(counter.seen).toHaveLength(0);
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdefB");
    expect(counter.seen).toHaveLength(0);
  });

  it("(c) mixed gesture with its characters deleted remotely: one press keeps the older gesture", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    mixedTypeBoldAtEnd(editor);
    stepBoth(editor, observer);
    await tick();
    const mixedTxn = humanTxnOf(store, "bold").transactionId;
    expect(sharedOf(resolved)).toBe("abcdefZXYZ");
    expect(observer.undoLength()).toBe(2);
    // The remote peer deletes every character of the mixed gesture.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "XYZ"), 3);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    // One press: at most one performer request naming the mixed
    // transaction, and the older gesture's characters stay.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(docText(editor)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    // The next press addresses the older character gesture alone.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
  });

  it("(d1) pending out-of-order undo: redo follows reverse undo-completion order", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stepBoth(editor, observer);
    await tick();
    const markTxn = humanTxnOf(store, "bold").transactionId;
    inner.holdOutcomes();
    // The newer mark gesture goes pending; its echo applies, no outcome.
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // An older character half still undoes through the pending path.
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    // The pending outcome resolves last: undo completion order is the
    // character gesture first, the mark gesture second.
    inner.releaseOutcomes();
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    // Redo follows reverse undo-completion order: the mark gesture (last
    // undone) redoes first, the character gesture second.
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: markTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(2);
    expect(yMarksAt(resolved.text, 2)).toBe(true);
  });

  it("(d2) pending excursion over a remotely deleted older gesture: same redo order", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stepBoth(editor, observer);
    await tick();
    const markTxn = humanTxnOf(store, "bold").transactionId;
    inner.holdOutcomes();
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    // The older gesture's characters are deleted remotely in full before
    // the pending-path press reaches them.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "Z"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    // The press consumes only the older gesture's empty character half:
    // no new performer request, no text motion.
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    inner.releaseOutcomes();
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    // Same redo order as (d1): the mark gesture first. The character half
    // has no redo item (its press consumed the item without effect), so
    // the second redo is void-inert: text unchanged, no new request.
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: markTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, 2)).toBe(true);
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(2);
  });

  it("(e) redo-side empty item: a vacuous remote transact leaves redo effective", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    await tick();
    expect(observer.undoLength()).toBe(1);
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    // The redone text is absent; a remote peer transacts vacuously around
    // the gap (insert plus delete under a non-local origin). No conforming
    // construction empties the redo item: the reinsert always lands.
    const ydoc = resolved.text.doc;
    if (ydoc === null) throw new Error("witness: detached text");
    const at = resolved.text.length;
    ydoc.transact(() => {
      resolved.text.insert(at, "R");
    }, "actor:remote-peer");
    ydoc.transact(() => {
      resolved.text.delete(at, 1);
    }, "actor:remote-peer");
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(0);
  });

  it("(f) void pop-through press emits nothing; the next press emits exactly one undo", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const gestures = recordGestures();
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer, gestures.onChange);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    await tick();
    expect(observer.undoLength()).toBe(2);
    // The remote peer deletes every character of the newest gesture B.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "B"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefA");
    gestures.seen.length = 0;
    // The void press consumes B's empty item beside A's effective one and
    // restores it: no visible effect, so no gesture event at all.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdefA");
    expect(docText(editor)).toBe("abcdefA");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toEqual([]);
    // The next press addresses A alone and emits exactly one undo naming
    // the touched block.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toHaveLength(1);
    expect(gestures.seen[0]).toMatchObject({ kind: "undo" });
    expect(gestures.seen[0]?.affected ?? 0).toBeGreaterThanOrEqual(1);
    expect(gestures.seen.every((entry) => entry.affected > 0)).toBe(true);
  });

  it("(g) two consecutive remotely-deleted gestures: one silent press each, then the effective gesture", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const gestures = recordGestures();
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer, gestures.onChange);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    await tick();
    expect(observer.undoLength()).toBe(3);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "A"), 1);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "B"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    gestures.seen.length = 0;
    // Press 1 consumes B's empty item only; press 2 consumes A's.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toEqual([]);
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toEqual([]);
    // Press 3 reaches the effective gesture below the voids.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toHaveLength(1);
    expect(gestures.seen[0]).toMatchObject({ kind: "undo" });
    expect(gestures.seen[0]?.affected ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("(h) three consecutive remotely-deleted gestures: three silent presses, then the effective gesture", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const gestures = recordGestures();
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer, gestures.onChange);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    typeEnd(editor, "C");
    stepBoth(editor, observer);
    await tick();
    expect(observer.undoLength()).toBe(4);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "A"), 1);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "B"), 1);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "C"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    gestures.seen.length = 0;
    for (let press = 0; press < 3; press += 1) {
      undo(editor);
      expect(sharedOf(resolved)).toBe("abcdefZ");
      expect(counter.seen).toHaveLength(0);
    }
    expect(gestures.seen).toEqual([]);
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toHaveLength(1);
    expect(gestures.seen[0]).toMatchObject({ kind: "undo" });
    expect(gestures.seen[0]?.affected ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("(i) consecutive voids with nothing below: later presses keep working", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const gestures = recordGestures();
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer, gestures.onChange);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stepBoth(editor, observer);
    typeEnd(editor, "A");
    stepBoth(editor, observer);
    typeEnd(editor, "B");
    stepBoth(editor, observer);
    await tick();
    const markTxn = humanTxnOf(store, "bold").transactionId;
    remoteDelete(resolved, sharedIndexOf(resolved.text, "A"), 1);
    remoteDelete(resolved, sharedIndexOf(resolved.text, "B"), 1);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    gestures.seen.length = 0;
    // Both character items pop empty with nothing effective below: two
    // silent presses, then the mark gesture below stays reachable.
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toEqual([]);
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(0);
    expect(gestures.seen).toEqual([]);
    undo(editor);
    await tick(3);
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: markTxn, direction: "undo" });
    expect(yMarksAt(resolved.text, 2)).toBe(null);
    // New local work after the voids truncates them: type and undo again.
    typeEnd(editor, "C");
    stepBoth(editor, observer);
    await tick();
    expect(sharedOf(resolved)).toBe("abcdefC");
    gestures.seen.length = 0;
    undo(editor);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(gestures.seen).toHaveLength(1);
    expect(gestures.seen[0]).toMatchObject({ kind: "undo" });
    redo(editor);
    expect(sharedOf(resolved)).toBe("abcdefC");
  });

  it("(j) mixed gesture with a live character half keeps redo-stack order", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    mixedTypeBoldAtEnd(editor);
    stepBoth(editor, observer);
    await tick();
    const mixedTxn = humanTxnOf(store, "bold").transactionId;
    expect(sharedOf(resolved)).toBe("abcdefZXYZ");
    inner.holdOutcomes();
    // Press 1 undoes the mixed gesture's character half; its mark half
    // stays pending. Press 2 undoes the older character through the
    // pending path. The pending mark outcome resolves last.
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    inner.releaseOutcomes();
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    // Redo follows the character stack (LIFO): the older character first —
    // a press that re-applied the mixed gesture here would pop the older
    // character's stack item and misattribute it.
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdefZXYZ");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: mixedTxn, direction: "redo" });
    expect(yMarksAt(resolved.text, sharedOf(resolved).indexOf("XYZ"))).toBe(true);
  });

  it("(k) R7: void mixed gesture above an effective character undone through the pending path", async () => {
    const { source, doc, resolved, store } = await setupUndoSource();
    const inner: MarkUndoStandIn = createMarkUndoPerformerStandIn({ source, documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKeys: [FIELD], store, actorId: HUMAN });
    const counter = countingPerformer(inner);
    const editor = await mountWithUndo(source, doc, HUMAN, store, counter.performer);
    const observer = observeStacks(source, HUMAN);
    stepBoth(editor, observer);
    typeEnd(editor, "Z");
    stepBoth(editor, observer);
    boldRange(editor, pmTextPos(editor, "abcdef", 1), pmTextPos(editor, "abcdef", 4));
    stepBoth(editor, observer);
    mixedTypeBoldAtEnd(editor);
    stepBoth(editor, observer);
    await tick();
    const markTxn = humanTxnOf(store, "bold", 0).transactionId;
    const mixedTxn = humanTxnOf(store, "bold", 1).transactionId;
    expect(sharedOf(resolved)).toBe("abcdefZXYZ");
    // The mixed gesture's characters are deleted remotely in full: its
    // character half is void while its mark half stays live.
    remoteDelete(resolved, sharedIndexOf(resolved.text, "XYZ"), 3);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    inner.holdOutcomes();
    // Press 1 consumes the void character half beside the effective older
    // one (restored silently) and dispatches the mixed mark undo; press 2
    // undoes the older character through the pending path.
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(1);
    expect(counter.seen[0]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    undo(editor);
    await tick(3);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(1);
    inner.releaseOutcomes();
    await tick(10);
    expect(counter.seen).toHaveLength(1);
    // Redo spends the mixed mark first (its completion is last) without
    // touching the character stack, then the older character.
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdef");
    expect(counter.seen).toHaveLength(2);
    expect(counter.seen[1]).toMatchObject({ transactionId: mixedTxn, direction: "redo" });
    redo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(2);
    // The final undo addresses the newest redoable gesture first and keeps
    // text and performer count exact.
    undo(editor);
    await tick(10);
    expect(sharedOf(resolved)).toBe("abcdefZ");
    expect(counter.seen).toHaveLength(3);
    expect(counter.seen[2]).toMatchObject({ transactionId: mixedTxn, direction: "undo" });
    expect(markTxn).not.toBe(mixedTxn);
  });
});
