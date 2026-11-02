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
import { mintEndOfFieldAnchor, tryResolveAnchorToLinear } from "./collab-selection.js";
import type { RichTextDocument, RichTextEditor } from "./model.js";
import type { RichTextChangeEvent } from "./editor.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

function fullDoc(blocks: Array<{ paragraphId: string; text: string }>): RichTextDocument {
  return {
    format: "ds.markdown.full@1",
    blocks: blocks.map((block) => ({
      paragraphId: block.paragraphId,
      kind: "paragraph",
      metadata: { ...canonicalPlainMetadata() },
      segments: [{ type: "text", text: block.text, marks: {} }],
    })),
  } as unknown as RichTextDocument;
}

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
  profile: "p0" | "full" = "p0",
): Promise<Mounted> {
  counter += 1;
  const identity: FieldBindingIdentity = { documentId, sessionId, fieldKey };
  const gestures: RichTextChangeEvent[] = [];
  const editor = (await createBoundRichTextEditor({
    document,
    profile,
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

function removeBoldRange(editor: RichTextEditor, from: number, to: number): void {
  const view = (editor as unknown as { view: any }).view as {
    state: { tr: any; schema: any };
    dispatch(tr: unknown): void;
  };
  view.dispatch(view.state.tr.removeMark(from, to, view.state.schema.marks.bold.create()));
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

  it("disposing one field never stops recording for the sibling field", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:dispose1`;
    const sessionId = `prov:session:dispose1`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A, FIELD_B]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const docA = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const docB = p0Doc([{ paragraphId: "paragraph:1", text: "beta" }]);
    const resolvedA = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolvedA.text, resolvedA.fieldMeta, FIELD_A, docA);
    const resolvedB = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_B });
    seedFieldFromDocument(resolvedB.text, resolvedB.fieldMeta, FIELD_B, docB);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, docA, "actor:human-a");
    const mountedB = await mountField(source, documentId, sessionId, FIELD_B, docB, "actor:human-b");
    (mountedA.editor as unknown as { destroy(): void }).destroy();
    source.releaseBinding({ documentId, sessionId, fieldKey: FIELD_A });
    const index = mounted.findIndex((entry) => entry === (mountedA.editor as unknown as RichTextEditor));
    if (index >= 0) mounted.splice(index, 1);
    boldRange(mountedB.editor, pmTextPos(mountedB.editor, "beta", 0), pmTextPos(mountedB.editor, "beta", 4));
    expect(received).toHaveLength(1);
    expect(received[0]?.fieldKey).toBe(FIELD_B);
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
    // R-REV-3: a same-value reassertion records all items it covers (the
    // user-addressed range carried via transaction meta, unioned with the
    // narrowed step range), with fresh ids in the identical draft shape.
    expect(received[0]?.mark).toBe("bold");
    expect(received[1]?.mark).toBe("bold");
    expect(received[0]?.value).toBe(true);
    expect(received[1]?.value).toBe(true);
    expect(received[0]?.items).toHaveLength(5);
    expect(received[1]?.items).toHaveLength(9);
    const firstIds = new Set((received[0]?.items ?? []).map((item) => `${item.client}:${item.clock}`));
    const secondIds = new Set((received[1]?.items ?? []).map((item) => `${item.client}:${item.clock}`));
    for (const id of firstIds) {
      expect(secondIds.has(id)).toBe(true);
    }
  });

  it("records all items for a mixed insert plus same-value reassertion", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:mixedreassert`;
    const sessionId = `prov:session:mixedreassert`;
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
    expect(received).toHaveLength(1);
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const start = pmTextPos(mountedA.editor, "alpha", 0);
    const end = pmTextPos(mountedA.editor, "Beta", 4);
    // One dispatch: a plain insert outside the marked span plus a reassertion
    // over the whole word while its head is already bold. The user range must
    // resolve after the insert applied, not against the pre-transaction map.
    view.dispatch(view.state.tr.insertText("X", end).addMark(start, start + 9, view.state.schema.marks.bold.create()));
    expect(received).toHaveLength(2);
    expect(received[0]?.intentId).not.toBe(received[1]?.intentId);
    const draft = received[1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    // All 9 word items, not the 4 of the narrowed step subset.
    expect(draft.items).toHaveLength(9);
    const firstIds = new Set((received[0]?.items ?? []).map((item) => `${item.client}:${item.clock}`));
    const secondIds = new Set(draft.items.map((item) => `${item.client}:${item.clock}`));
    for (const id of firstIds) {
      expect(secondIds.has(id)).toBe(true);
    }
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.start as RelativeAnchor)).toBe(1);
    // The marked word spans linear 1..10; the appended "X" sits at 10..11.
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.end as RelativeAnchor)).toBe(10);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**alphaBeta**X");
  });

  it("keeps the full user range when the already-marked subset is the suffix", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:suffixreassert`;
    const sessionId = `prov:session:suffixreassert`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alphaBeta" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "Beta", 0), pmTextPos(mountedA.editor, "Beta", 4));
    expect(received).toHaveLength(1);
    // Reassert over the whole word: the narrowed step covers only "alpha",
    // but the draft range must still span all 9 items (group bounds widen
    // only, never narrow to the later step entry).
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "Beta", 4));
    expect(received).toHaveLength(2);
    const draft = received[1] as FormattingIntentDraft;
    expect(draft.items).toHaveLength(9);
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.start as RelativeAnchor)).toBe(1);
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.end as RelativeAnchor)).toBe(mountedA.ytext.length);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**alphaBeta**");
  });

  it("keeps the full user range when the already-marked subset is the prefix", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:prefixreassert`;
    const sessionId = `prov:session:prefixreassert`;
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
    expect(received).toHaveLength(1);
    // Reassert over the whole word: the narrowed step covers only "Beta",
    // but the draft range must still start at the word head (group bounds
    // widen only, never narrow to the later step entry).
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "alpha", 0), pmTextPos(mountedA.editor, "Beta", 4));
    expect(received).toHaveLength(2);
    const draft = received[1] as FormattingIntentDraft;
    expect(draft.items).toHaveLength(9);
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.start as RelativeAnchor)).toBe(1);
    expect(tryResolveAnchorToLinear(mountedA.ytext, draft.range.end as RelativeAnchor)).toBe(mountedA.ytext.length);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**alphaBeta**");
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

  it("records two marks in one transaction with distinct intentIds", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:twomark`;
    const sessionId = `prov:session:twomark`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const from = pmTextPos(mountedA.editor, "alpha", 0);
    const to = pmTextPos(mountedA.editor, "alpha", 5);
    view.dispatch(
      view.state.tr
        .addMark(from, to, view.state.schema.marks.bold.create())
        .addMark(from, to, view.state.schema.marks.italic.create()),
    );
    expect(received).toHaveLength(2);
    const marks = new Set(received.map((entry) => entry.mark));
    expect(marks).toEqual(new Set(["bold", "italic"]));
    const ids = received.map((entry) => entry.intentId);
    expect(new Set(ids).size).toBe(2);
    for (const entry of received) {
      expect(entry.intentId.startsWith(`${(entry.source as { transactionId: string }).transactionId}:`)).toBe(true);
    }
  });

  it("records a full-profile link draft and its removal", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:linkrec`;
    const sessionId = `prov:session:linkrec`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = fullDoc([{ paragraphId: "paragraph:1", text: "alpha" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a", "full");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const from = pmTextPos(mountedA.editor, "alpha", 0);
    const to = pmTextPos(mountedA.editor, "alpha", 5);
    view.dispatch(view.state.tr.addMark(from, to, view.state.schema.marks.link.create({ href: "https://example.com/x" })));
    expect(received).toHaveLength(1);
    expect(received[0]?.mark).toBe("link");
    expect(received[0]?.value).toBe("https://example.com/x");
    view.dispatch(view.state.tr.removeMark(from, to, view.state.schema.marks.link.create({ href: "https://example.com/x" })));
    expect(received).toHaveLength(3);
    const removals = received.slice(1);
    expect(new Set(removals.map((entry) => entry.mark))).toEqual(new Set(["link", "linkTitle"]));
    for (const entry of removals) expect(entry.value).toBe(null);
  });

  it("records the mark part of a mixed type-then-format transaction once", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:mixedrec`;
    const sessionId = `prov:session:mixedrec`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const at = pmTextPos(mountedA.editor, "ab", 2);
    view.dispatch(view.state.tr.insertText("X", at));
    const from = pmTextPos(mountedA.editor, "a", 0);
    const to = pmTextPos(mountedA.editor, "X", 1) + 1;
    boldRange(mountedA.editor, from, to);
    const boldDrafts = received.filter((entry) => entry.mark === "bold");
    expect(boldDrafts.length).toBeGreaterThanOrEqual(1);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toContain("X");
  });
});

describe("Review fixes B1 deleted items, B4 disjoint ranges, B3 composition (jsdom, in-memory source)", () => {
  it("B1 formats the post-tombstone range with live item identities", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:b1prior`;
    const sessionId = `prov:session:b1prior`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any }; dispatch(tr: unknown): void } }).view;
    const delFrom = pmTextPos(mountedA.editor, "cd", 0);
    view.dispatch(view.state.tr.delete(delFrom, delFrom + 2));
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("abef");
    // Format "ef" past the tombstoned "cd": the seeded chain is the separator
    // embed (clock 0) plus "abcdef" (clocks 1..6), so live "ef" is clocks
    // 5..6 while tombstoned "cd" keeps clocks 3..4.
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "ef", 0), pmTextPos(mountedA.editor, "ef", 2));
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("ab**ef**");
    const draft = received[received.length - 1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    expect(draft.items).toHaveLength(2);
    const client = draft.items[0]?.client;
    expect(draft.items.every((item) => item.client === client)).toBe(true);
    expect(draft.items.map((item) => item.clock)).toEqual([5, 6]);
  });

  it("B1 records live items only for a same-transaction delete plus format", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:b1same`;
    const sessionId = `prov:session:b1same`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "abcdef" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const delFrom = pmTextPos(mountedA.editor, "cd", 0);
    // The addMark addresses the post-delete document ("ef" now sits where
    // "cd" was): same layout as the prior-delete case, clocks 5..6.
    view.dispatch(view.state.tr.delete(delFrom, delFrom + 2).addMark(delFrom, delFrom + 2, view.state.schema.marks.bold.create()));
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("ab**ef**");
    const draft = received[received.length - 1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    expect(draft.items).toHaveLength(2);
    const client = draft.items[0]?.client;
    expect(draft.items.every((item) => item.client === client)).toBe(true);
    expect(draft.items.map((item) => item.clock)).toEqual([5, 6]);
  });

  it("B4 keeps disjoint same-mark ranges exact without spanning the gap", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:b4disjoint`;
    const sessionId = `prov:session:b4disjoint`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "abcdefgh" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const firstFrom = pmTextPos(mountedA.editor, "ab", 0);
    const secondFrom = pmTextPos(mountedA.editor, "fgh", 0);
    view.dispatch(
      view.state.tr
        .addMark(firstFrom, firstFrom + 2, view.state.schema.marks.bold.create())
        .addMark(secondFrom, secondFrom + 3, view.state.schema.marks.bold.create()),
    );
    expect(received).toHaveLength(1);
    expect(received[0]?.items).toHaveLength(5);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**ab**cde**fgh**");
  });

  it("B4 resolves step-time indices when an insert precedes a format", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:b4drift`;
    const sessionId = `prov:session:b4drift`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const start = pmTextPos(mountedA.editor, "ab", 0);
    view.dispatch(view.state.tr.insertText("X", start).addMark(start, start + 3, view.state.schema.marks.bold.create()));
    const draft = received[received.length - 1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    expect(draft.items).toHaveLength(3);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**Xab**");
  });

  it("B4 resolves step-time indices when a format precedes an insert", async () => {
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:b4driftdisc`;
    const sessionId = `prov:session:b4driftdisc`;
    const received: FormattingIntentDraft[] = [];
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as LiveSessionBindingSource;
    (source as unknown as { provenanceSink?: SessionProvenanceSink }).provenanceSink = {
      recordFormattingIntent: (intent) => { received.push(intent); },
    };
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]);
    const resolved = source.resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const view = (mountedA.editor as unknown as { view: { state: { tr: any; schema: any }; dispatch(tr: unknown): void } }).view;
    const start = pmTextPos(mountedA.editor, "ab", 0);
    // Discriminating order: the format runs before the insert shifts the
    // indices, so resolving the mark range after the transaction would cover
    // only the shifted window (2 items) instead of the addressed span (3).
    view.dispatch(view.state.tr.addMark(start, start + 3, view.state.schema.marks.bold.create()).insertText("X", start));
    const draft = received[received.length - 1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    expect(draft.items).toHaveLength(3);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**Xab**");
  });

  it("B3 records composition-committed marks at commit inside the transaction", async () => {
    const { BoundCompositionDriver } = await import("./collab-composition.js");
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const meta = ydoc.getMap("fieldmeta:body");
    seedFieldFromDocument(ytext, meta, FIELD_A, p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]));
    const received: FormattingIntentDraft[] = [];
    const sink: SessionProvenanceSink = { recordFormattingIntent: (intent) => { received.push(intent); } };
    const driver = new BoundCompositionDriver(ytext, FIELD_A, "origin:test", { stopCapturing: () => {} } as never, sink as never, "actor:human-a");
    driver.openSession({ bindingKey: "test", caretLinear: 3, headLinear: 3 });
    const before = received.length;
    driver.commitSession({
      stagedRuns: new Map([["paragraph:1", [{ type: "text", text: "abX", attributes: { bold: true } }]]]),
    });
    expect(received.length).toBeGreaterThan(before);
    const draft = received[received.length - 1] as FormattingIntentDraft;
    expect(draft.mark).toBe("bold");
    expect(draft.value).toBe(true);
    expect(draft.fieldKey).toBe(FIELD_A);
    expect(draft.items.length).toBeGreaterThan(0);
  });

  it("B3 composition intent ids are never reused across remounts", async () => {
    const { BoundCompositionDriver } = await import("./collab-composition.js");
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const meta = ydoc.getMap("fieldmeta:body");
    seedFieldFromDocument(ytext, meta, FIELD_A, p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]));
    const received: FormattingIntentDraft[] = [];
    const sink: SessionProvenanceSink = { recordFormattingIntent: (intent) => { received.push(intent); } };
    const first = new BoundCompositionDriver(ytext, FIELD_A, "origin:test", { stopCapturing: () => {} } as never, sink as never, "actor:human-a");
    first.openSession({ bindingKey: "test", caretLinear: 3, headLinear: 3 });
    first.commitSession({
      stagedRuns: new Map([["paragraph:1", [{ type: "text", text: "abX", attributes: { bold: true } }]]]),
    });
    expect(received).toHaveLength(1);
    // A remounted driver (fresh per-driver counter) commits a different
    // payload: the process-global counter discipline still mints a fresh id.
    const second = new BoundCompositionDriver(ytext, FIELD_A, "origin:test", { stopCapturing: () => {} } as never, sink as never, "actor:human-a");
    second.openSession({ bindingKey: "test", caretLinear: 4, headLinear: 4 });
    second.commitSession({
      stagedRuns: new Map([["paragraph:1", [{ type: "text", text: "abXY", attributes: { bold: true } }]]]),
    });
    expect(received).toHaveLength(2);
    expect(received[0]?.intentId).not.toBe(received[1]?.intentId);
    expect(new Set(received.map((entry) => entry.intentId)).size).toBe(2);
  });

  it("B3 composition commit at end of field uses end-of-field anchors", async () => {
    const { BoundCompositionDriver } = await import("./collab-composition.js");
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("field:body");
    const meta = ydoc.getMap("fieldmeta:body");
    seedFieldFromDocument(ytext, meta, FIELD_A, p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]));
    const received: FormattingIntentDraft[] = [];
    const sink: SessionProvenanceSink = { recordFormattingIntent: (intent) => { received.push(intent); } };
    const driver = new BoundCompositionDriver(ytext, FIELD_A, "origin:test", { stopCapturing: () => {} } as never, sink as never, "actor:human-a");
    driver.openSession({ bindingKey: "test", caretLinear: 3, headLinear: 3 });
    driver.commitSession({
      stagedRuns: new Map([["paragraph:1", [{ type: "text", text: "abX", attributes: { bold: true } }]]]),
    });
    const draft = received[received.length - 1] as FormattingIntentDraft;
    // The committed run ends at the end of the field, so the end anchor binds
    // with assoc -1 exactly like the projection's step-time capture (the run
    // starts mid-field, before the inserted character).
    expect(draft.range.end).toBe(mintEndOfFieldAnchor(ytext, ytext.length));
  });

  it("B2 bound-editor 7(a): agent bolds ab, human bolds abcd, revert keeps ab bold", async () => {
    const { setupAgentBridge } = await import("./collab-agent-witness.test-support.js");
    const { agentPatchFromRead } = await import("./collab-agent-witness.test-support.js");
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:seven-a`;
    const sessionId = `prov:session:seven-a`;
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as unknown as LiveSessionBindingSource;
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "abcd" }]);
    const resolved = (source as LiveSessionBindingSource).resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const { bridge, store } = setupAgentBridge(source as LiveSessionBindingSource, documentId, sessionId, [FIELD_A]);
    (source as unknown as { provenanceSink?: unknown }).provenanceSink = bridge.sink;
    const mountedA = await mountField(source as LiveSessionBindingSource, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const read = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const all = bridge.readState({
      binding: { documentId, sessionId, fieldKey: FIELD_A },
      anchorRequests: [{ paragraphId: "paragraph:1", paragraphOffset: 0 }, { paragraphId: "paragraph:1", paragraphOffset: 2 }],
    });
    const requested = all.fields[0]?.requestedAnchors as RelativeAnchor[];
    const agentPatch = agentPatchFromRead(read, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:1", [
      { type: "mark", fieldKey: FIELD_A, paragraphId: "paragraph:1", range: { start: requested[0] as RelativeAnchor, end: requested[1] as RelativeAnchor }, mark: "bold", applied: true },
    ]);
    expect((await bridge.applyPatch(agentPatch)).status).toBe("applied");
    const from = pmTextPos(mountedA.editor, "ab", 0);
    const to = pmTextPos(mountedA.editor, "cd", 2);
    boldRange(mountedA.editor, from, to);
    const revert = await bridge.revertPatch({
      key: { documentId, actorId: "actor:agent-a", sessionEpoch: "epoch:1", patchId: agentPatch.patchId },
      requestedBy: "actor:human-a",
    });
    expect(revert.status).toBe("applied");
    expect(hasBold(mountedA.editor, "ab")).toBe(true);
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1")).toBe("**abcd**");
  });
});

describe("Task 10 shipped halves (jsdom, in-memory source)", () => {
  it("absent-sink formatting later refuses a provenance revert whole", async () => {
    const { setupAgentBridge } = await import("./collab-agent-witness.test-support.js");
    const provider = createInMemoryTestDoubleProvider();
    const documentId = `prov:doc:absent1`;
    const sessionId = `prov:session:absent1`;
    const source = provider.openSession(documentId, sessionId, [FIELD_A]) as unknown as LiveSessionBindingSource;
    const doc = p0Doc([{ paragraphId: "paragraph:1", text: "ab" }]);
    const resolved = (source as LiveSessionBindingSource).resolveBinding({ documentId, sessionId, fieldKey: FIELD_A });
    seedFieldFromDocument(resolved.text, resolved.fieldMeta, FIELD_A, doc);
    const mountedA = await mountField(source as LiveSessionBindingSource, documentId, sessionId, FIELD_A, doc, "actor:human-a");
    const { bridge, store } = setupAgentBridge(source as LiveSessionBindingSource, documentId, sessionId, [FIELD_A]);
    const read = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const startAnchor = read.fields[0]?.paragraphs[0]?.startAnchor as RelativeAnchor;
    const endAnchor = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
    const { agentPatchFromRead } = await import("./collab-agent-witness.test-support.js");
    const patch = agentPatchFromRead(read, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:1", [
      { type: "mark", fieldKey: FIELD_A, paragraphId: "paragraph:1", range: { start: startAnchor, end: endAnchor }, mark: "bold", applied: true },
    ]);
    expect((await bridge.applyPatch(patch)).status).toBe("applied");
    expect(store.provenanceLog).toHaveLength(1);
    removeBoldRange(mountedA.editor, pmTextPos(mountedA.editor, "ab", 0), pmTextPos(mountedA.editor, "ab", 2));
    expect(hasBold(mountedA.editor, "ab")).toBe(false);
    expect(store.provenanceLog).toHaveLength(1);
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
    mountedA.editor.typeText("paragraph:1", "H");
    const { bridge } = setupAgentBridge(source as LiveSessionBindingSource, documentId, sessionId, [FIELD_A]);
    const read = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const at = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
    const patch = agentPatchFromRead(read, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:1", [
      { type: "insert", fieldKey: FIELD_A, paragraphId: "paragraph:1", at, text: "A" },
    ]);
    expect((await bridge.applyPatch(patch)).status).toBe("applied");
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).toContain("H");
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).toContain("A");
    mountedA.editor.undo();
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).not.toContain("H");
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).toContain("A");
    mountedA.editor.typeText("paragraph:1", "J");
    boldRange(mountedA.editor, pmTextPos(mountedA.editor, "base", 0), pmTextPos(mountedA.editor, "base", 4));
    expect(hasBold(mountedA.editor, "base")).toBe(true);
    mountedA.editor.undo();
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).not.toContain("J");
    expect(hasBold(mountedA.editor, "base")).toBe(true);
    const read2 = bridge.readState({ binding: { documentId, sessionId, fieldKey: FIELD_A } });
    const at2 = read2.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
    const patch2 = agentPatchFromRead(read2, FIELD_A, documentId, sessionId, "actor:agent-a", "epoch:2", [
      { type: "insert", fieldKey: FIELD_A, paragraphId: "paragraph:1", at: at2, text: "B" },
    ]);
    expect((await bridge.applyPatch(patch2)).status).toBe("applied");
    const revert2 = await bridge.revertPatch({
      key: { documentId, actorId: "actor:agent-a", sessionEpoch: "epoch:2", patchId: patch2.patchId },
      requestedBy: "actor:human-a",
    });
    expect(revert2.status).toBe("applied");
    mountedA.editor.typeText("paragraph:1", "K");
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).toContain("K");
    mountedA.editor.undo();
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).not.toContain("K");
    expect(textOf(mountedA.ytext, mountedA.meta, "paragraph:1") as string).toContain("base");
  });
});
