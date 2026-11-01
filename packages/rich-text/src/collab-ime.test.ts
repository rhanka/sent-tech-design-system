/**
 * CL-3b2 witness 5 — IME private staging (spec §4.6 IME-LOCK-1, §4.6.1
 * CL-D15/R-IME-1…R-IME-5).
 *
 * Three replicas plus an authoritative doc, driven through the editor's
 * synthetic composition wiring: replica A composes uncommitted `X` while
 * replica B commits `Y` in the same paragraph. Before commit, `X` is absent
 * from every shared state (A's shared `Y.Text`, B, the read-only replica C
 * and the authoritative doc) while `Y` is present. Run 1 cancels, run 2
 * revokes `editable` mid-composition, each followed by an ordinary edit `Z`,
 * disconnect and reconnect: every replica converges to `Y` + `Z` without
 * `X`, vectors agree, no leaked shared clocks. Run 3 commits: exactly one
 * shared transaction carries the composition result, `Y` survives, a
 * following edit plus reconnect behaves identically. Retained r1 items: no
 * `onChange` mid-composition, one coalesced commit change, pending capture
 * rejects exactly once with `RichTextCaptureUnavailable` on revocation,
 * caret stable under a remote insert before it. F-1 (inside this witness):
 * typing within 500 ms before or after a composition never merges with the
 * committed composition step.
 *
 * RED on the CL-3b1 base: composition safety is incidental (projection
 * skipped while composing, no staging session, the composing paragraph is
 * rebuilt under remote updates, cancel restores a pre-composition snapshot
 * over merged remote work, and the commit never transacts exactly once).
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { TextSelection } from "@tiptap/pm/state";
import type { RichTextEditor } from "./editor.js";
import type { RichTextChangeEvent } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
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
  for (const editor of mounted.splice(0)) {
    try {
      editor.destroy();
    } catch {
      // Teardown never masks the witness result.
    }
  }
  document.body.innerHTML = "";
});

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const FIELD = "body";
const P0 = "focus.markdown.p0@1";

let counter = 0;

interface Replica {
  doc: Y.Doc;
  text: Y.Text;
  meta: Y.Map<unknown>;
}

function paragraphDoc(id: string, text: string): RichTextDocument {
  return {
    format: P0,
    blocks: [{ paragraphId: id, kind: "paragraph", text }],
  } as RichTextDocument;
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

interface Mounted {
  ed: RichTextEditor;
  element: HTMLElement;
  errors: unknown[];
  gestures: RichTextChangeEvent[];
}

async function mountOn(
  forked: Replica,
  tag: string,
  actorId: string,
  options?: { editable?: boolean },
): Promise<Mounted> {
  const identity: FieldBindingIdentity = {
    documentId: `ime:${tag}:canvas:${counter}`,
    sessionId: `ime:${tag}:session:${counter}`,
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
  const element = globalThis.document.createElement("div");
  globalThis.document.body.appendChild(element);
  const errors: unknown[] = [];
  const gestures: RichTextChangeEvent[] = [];
  const ed = await createBoundRichTextEditor({
    document: paragraphDoc("p:1", "ab"),
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:ime:${tag}:${counter}:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: source as never,
    collaborationActor: { actorId, kind: "human" },
    element,
    editable: options?.editable ?? true,
    onChange: (event) => gestures.push(event),
    onBindingError: (event) => errors.push(event),
  });
  mounted.push(ed);
  return { ed, element, errors, gestures };
}

function vectorHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateVector(doc)).toString("hex");
}

function captureJson(replica: Replica): string {
  return JSON.stringify(captureDocumentFromField(replica.text, replica.meta, P0).document);
}

function assertQuiescent(label: string, replicas: Replica[]): void {
  const vectors = replicas.map((replica) => vectorHex(replica.doc));
  for (const vector of vectors) expect(vector, `${label}: state vectors agree`).toBe(vectors[0]);
  const captures = replicas.map((replica) => captureJson(replica));
  for (const capture of captures) expect(capture, `${label}: documents agree`).toBe(captures[0]);
}

function syncInto(src: Replica, dst: Replica): void {
  Y.applyUpdate(dst.doc, Y.encodeStateAsUpdate(src.doc));
}

/** Exchange every update both ways (a reconnect). */
function reconnectAll(replicas: Replica[]): void {
  for (let round = 0; round < 2; round += 1) {
    for (const src of replicas) {
      const update = Y.encodeStateAsUpdate(src.doc);
      for (const dst of replicas) {
        if (dst !== src) Y.applyUpdate(dst.doc, update);
      }
    }
  }
}

function pmText(ed: RichTextEditor): string {
  return ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n");
}

function sharedText(replica: Replica): string {
  return replica.text.toString();
}

function beginComposition(element: HTMLElement): void {
  element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
}

function endComposition(element: HTMLElement): void {
  element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
}

function cancelComposition(element: HTMLElement): void {
  element.dispatchEvent(new Event("compositioncancel", { bubbles: true }));
}

function collapseCaret(ed: RichTextEditor, pos: number): void {
  ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, pos)));
}

function insertTextAt(ed: RichTextEditor, pos: number, str: string): void {
  ed.view.dispatch(ed.view.state.tr.insertText(str, pos));
}

describe("CL-3b2-5 IME staging: cancel discards without a shared trace", () => {
  it("run 1: cancel the composition, edit Z, reconnect — every replica converges to Y + Z without X", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const forkC = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-a-${counter}`);
    const b = await mountOn(forkB, "b", `ime-b-${counter}`);
    // C stays a bare read-only replica: no editor, no local edits.
    expect(sharedText(forkA)).toBe("ab");

    // A composes uncommitted X (caret after `a`).
    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    expect(a.ed.readiness()).toEqual({ composing: true, ready: false });
    insertTextAt(a.ed, 2, "X");
    expect(pmText(a.ed).replace(/\n\n/g, ""), "A display stages X").toContain("aXb");
    // R-IME-1: no transaction reaches the shared Y.Text mid-composition.
    expect(sharedText(forkA), "X absent from A's shared text").toBe("ab");
    expect(a.gestures, "no onChange mid-composition").toEqual([]);
    // A capture pending mid-composition waits for the outcome.
    let settled = 0;
    const pending = a.ed.captureDocument().then(
      () => {
        settled += 1;
      },
      (error: unknown) => {
        settled += 1;
        throw error;
      },
    );

    // B commits Y in the same paragraph; every shared state carries Y.
    b.ed.typeText("p:1", "Y");
    b.ed.stopCapturing();
    for (const replica of [forkA, forkB, forkC, authority]) syncInto(forkB, replica);
    for (const replica of [forkA, forkB, forkC, authority]) {
      expect(sharedText(replica), "Y present in every shared state").toContain("Y");
      expect(sharedText(replica), "X absent from every shared state").not.toContain("X");
    }
    // The composing paragraph is not rebuilt under the composition: A's
    // display still stages X without the remote Y.
    expect(pmText(a.ed).replace(/\n\n/g, ""), "composing range deferred").toBe("aXb");

    // Cancel: the staging is discarded whole, the display re-renders from
    // the shared Y.Text (Y survives, X is gone), nothing is emitted.
    cancelComposition(a.element);
    await expect(pending, "pending capture rejects on cancel").rejects.toMatchObject({
      name: "RichTextCaptureUnavailable",
    });
    expect(settled, "pending capture settles exactly once").toBe(1);
    expect(a.gestures, "no commit event for discarded text").toEqual([]);
    expect(a.ed.readiness()).toEqual({ composing: false, ready: true });
    expect(pmText(a.ed).replace(/\n\n/g, ""), "display re-rendered from shared").toBe("abY");
    expect(a.errors).toEqual([]);

    // An ordinary edit Z follows, then disconnect and reconnect.
    a.ed.typeText("p:1", "Z");
    a.ed.stopCapturing();
    reconnectAll([forkA, forkB, forkC, authority]);
    assertQuiescent("ime-cancel", [forkA, forkB, forkC, authority]);
    for (const replica of [forkA, forkB, forkC, authority]) {
      expect(sharedText(replica), "Y survives the cancel").toContain("Y");
      expect(sharedText(replica), "Z lands after the cancel").toContain("Z");
      expect(sharedText(replica), "X never leaks into shared state").not.toContain("X");
    }
    // A's post-cancel update carries no X: a fresh replica applying it
    // stays X-free (no missing-dependency clock was ever minted).
    const probe = new Y.Doc();
    Y.applyUpdate(probe, Y.encodeStateAsUpdate(forkA.doc));
    expect(probe.getText(fieldTextName(FIELD)).toString()).not.toContain("X");
  });
});

describe("CL-3b2-5 IME staging: revocation discards without a shared trace", () => {
  it("run 2: revoke editable mid-composition, re-enable, edit Z, reconnect — convergence to Y + Z without X", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const forkC = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-a-${counter}`);
    const b = await mountOn(forkB, "b", `ime-b-${counter}`);

    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    expect(sharedText(forkA), "X absent from A's shared text").toBe("ab");
    let settled = 0;
    const pending = a.ed.captureDocument().then(
      () => {
        settled += 1;
      },
      (error: unknown) => {
        settled += 1;
        throw error;
      },
    );

    b.ed.typeText("p:1", "Y");
    b.ed.stopCapturing();
    for (const replica of [forkA, forkB, forkC, authority]) syncInto(forkB, replica);
    expect(sharedText(forkA)).toContain("Y");

    // IME-LOCK-1 clause 2: revocation is immediate, mid-composition.
    a.ed.setEditable(false);
    // The browser tears the composition down; the end event discards.
    endComposition(a.element);
    await expect(pending, "pending capture rejects exactly once").rejects.toMatchObject({
      name: "RichTextCaptureUnavailable",
    });
    expect(settled, "pending capture settles exactly once").toBe(1);
    expect(a.gestures, "no commit event after revocation").toEqual([]);
    expect(pmText(a.ed).replace(/\n\n/g, ""), "display re-rendered from shared").toBe("abY");

    // Re-enable on the same mount (no remount) and edit normally.
    a.ed.setEditable(true);
    a.ed.typeText("p:1", "Z");
    a.ed.stopCapturing();
    reconnectAll([forkA, forkB, forkC, authority]);
    assertQuiescent("ime-revoke", [forkA, forkB, forkC, authority]);
    for (const replica of [forkA, forkB, forkC, authority]) {
      expect(sharedText(replica)).toContain("Y");
      expect(sharedText(replica)).toContain("Z");
      expect(sharedText(replica)).not.toContain("X");
    }
  });
});

describe("CL-3b2-5 IME staging: commit applies exactly one shared transaction", () => {
  it("run 3: commit carries the composition once, Y survives, a following edit plus reconnect converges", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const forkC = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-a-${counter}`);
    const b = await mountOn(forkB, "b", `ime-b-${counter}`);

    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    expect(sharedText(forkA), "X absent before commit").toBe("ab");
    expect(a.gestures, "no onChange mid-composition").toEqual([]);

    b.ed.typeText("p:1", "Y");
    b.ed.stopCapturing();
    for (const replica of [forkA, forkB, forkC, authority]) syncInto(forkB, replica);
    expect(sharedText(forkA)).toContain("Y");

    // Commit: exactly one shared transaction carries the result.
    let commitUpdates = 0;
    const countUpdates = (): void => {
      commitUpdates += 1;
    };
    forkA.doc.on("update", countUpdates);
    endComposition(a.element);
    forkA.doc.off("update", countUpdates);
    expect(commitUpdates, "exactly one shared transaction on commit").toBe(1);
    expect(a.gestures, "exactly one coalesced commit change").toHaveLength(1);
    expect(a.gestures[0]?.gesture.kind).toBe("composition-commit");
    expect(sharedText(forkA), "X committed to shared text").toContain("X");
    expect(sharedText(forkA), "Y survives the commit").toContain("Y");
    expect(a.errors).toEqual([]);

    // A following edit plus reconnect behaves identically.
    a.ed.typeText("p:1", "Z");
    a.ed.stopCapturing();
    reconnectAll([forkA, forkB, forkC, authority]);
    assertQuiescent("ime-commit", [forkA, forkB, forkC, authority]);
    for (const replica of [forkA, forkB, forkC, authority]) {
      expect(sharedText(replica)).toContain("X");
      expect(sharedText(replica)).toContain("Y");
      expect(sharedText(replica)).toContain("Z");
    }
    const committed = await a.ed.captureDocument();
    expect(JSON.stringify(committed.document.blocks)).toContain("X");
  });
});

describe("CL-3b2-F-1 composition steps never merge with adjacent typing", () => {
  it("typing within 500 ms before or after a composition stays a separate undo step", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-a-${counter}`);

    // No test-side stopCapturing around the composition: the production
    // breaks at compositionstart and after the commit delimit the steps.
    a.ed.typeText("p:1", "pre");
    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    endComposition(a.element);
    a.ed.typeText("p:1", "post");
    expect(a.gestures.map((event) => event.gesture.kind)).toEqual([
      "type",
      "composition-commit",
      "type",
    ]);

    // Three undos peel the three steps apart, in reverse order.
    a.ed.undo();
    expect(sharedText(forkA), "first undo removes only the post text").toBe("aXbpre");
    a.ed.undo();
    expect(sharedText(forkA), "second undo removes only the composition").toBe("abpre");
    a.ed.undo();
    expect(sharedText(forkA), "third undo removes only the pre text").toBe("ab");
    a.ed.redo();
    expect(sharedText(forkA), "redo restores the pre text").toBe("abpre");
    a.ed.redo();
    expect(sharedText(forkA), "redo restores the composition").toBe("aXbpre");
    a.ed.redo();
    expect(sharedText(forkA), "redo restores the post text").toBe("aXbprepost");
  });
});

describe("CL-3b2-5 IME staging: retained r1 caret stability", () => {
  it("the caret stays on its content under a remote insert before it", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-a-${counter}`);
    const b = await mountOn(forkB, "b", `ime-b-${counter}`);

    collapseCaret(a.ed, 3);
    expect(a.ed.getSelection()).toMatchObject({ anchorParagraphId: "p:1", anchorOffset: 2 });
    // B inserts before A's caret; the caret tracks its content.
    insertTextAt(b.ed, 1, "YY");
    b.ed.stopCapturing();
    syncInto(forkB, forkA);
    expect(a.errors).toEqual([]);
    expect(a.ed.getSelection()).toMatchObject({ anchorParagraphId: "p:1", anchorOffset: 4 });
    expect(b.ed.getSelection()).toBeDefined();
  });
});

describe("CL-3b2 review 1: run-aware IME commit (R-LIN-1/R-LIN-7, caret, affix)", () => {
  it("commit at field end lands the caret after the committed text (R-IME-5)", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-end-${counter}`);

    collapseCaret(a.ed, 3);
    expect(a.ed.getSelection()).toMatchObject({ anchorParagraphId: "p:1", anchorOffset: 2 });
    beginComposition(a.element);
    insertTextAt(a.ed, 3, "X");
    endComposition(a.element);
    expect(sharedText(forkA), "X committed to shared text").toBe("abX");
    expect(a.ed.getSelection(), "caret lands after the committed text").toMatchObject({
      anchorParagraphId: "p:1",
      anchorOffset: 3,
    });
    expect(a.errors).toEqual([]);
  });

  it("replacing a selection that shares an affix loses no character", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "abcd"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-affix-${counter}`);

    // Select "bc" (PM 2..4), then compose "bX" over it: staged "abXd".
    a.ed.view.dispatch(
      a.ed.view.state.tr.setSelection(TextSelection.create(a.ed.view.state.doc, 2, 4)),
    );
    beginComposition(a.element);
    a.ed.view.dispatch(a.ed.view.state.tr.insertText("bX", 2, 4));
    expect(pmText(a.ed).replace(/\n\n/g, ""), "staged display carries the replacement").toBe("abXd");
    endComposition(a.element);
    expect(sharedText(forkA), "no character lost in the replacement").toBe("abXd");
    expect(a.errors).toEqual([]);
  });

  it("a marked replacement keeps its mark attributes on commit", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "a**b**c"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-markrun-${counter}`);
    const b = await mountOn(forkB, "b", `ime-markrun-${counter}`);

    // Select the bold "b" (PM 2..3) and stage a bold "X" over it, the way an
    // IME keeps the surrounding marks on its replacement text.
    const schema = a.ed.view.state.schema;
    const boldMark = schema.marks["bold"].create();
    a.ed.view.dispatch(
      a.ed.view.state.tr.setSelection(TextSelection.create(a.ed.view.state.doc, 2, 3)),
    );
    beginComposition(a.element);
    a.ed.view.dispatch(a.ed.view.state.tr.replaceWith(2, 3, schema.text("X", [boldMark])));
    expect(pmText(a.ed).replace(/\n\n/g, ""), "staged display carries the replacement").toBe("aXc");
    endComposition(a.element);
    expect(sharedText(forkA), "replacement committed").toBe("aXc");
    const delta = forkA.text.toDelta() as Array<{
      insert?: string | Record<string, unknown>;
      attributes?: Record<string, unknown>;
    }>;
    expect(
      delta.some(
        (op) => op.insert === "X" && (op.attributes as Record<string, unknown> | undefined)?.["bold"] === true,
      ),
      "staged mark attributes survive the commit",
    ).toBe(true);
    const captured = captureDocumentFromField(forkA.text, forkA.meta, P0).document;
    expect(JSON.stringify(captured)).toContain("X");
    reconnectAll([forkA, forkB, authority]);
    assertQuiescent("ime-markrun", [forkA, forkB, authority]);
    expect(a.errors).toEqual([]);
  });

  it("a multi-line commit stores hardBreak embeds, never raw U+000A (R-LIN-1/R-LIN-7)", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "a**b**\ncd"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const forkC = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-break-${counter}`);
    const b = await mountOn(forkB, "b", `ime-break-${counter}`);

    // Sanity: the seed carries a bold run and a hard break in shared state.
    const seeded = forkA.text.toDelta() as Array<{ insert?: string | Record<string, unknown> }>;
    expect(seeded.some((op) => typeof op.insert === "object" && op.insert !== null && "hardBreak" in (op.insert as Record<string, unknown>))).toBe(true);

    // Stage a two-line IME result "X<break>Y" after "a" on the display.
    const schema = a.ed.view.state.schema;
    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    a.ed.view.dispatch(a.ed.view.state.tr.insertText("X", 2));
    a.ed.view.dispatch(a.ed.view.state.tr.insert(3, schema.nodes["hardBreak"].create()));
    a.ed.view.dispatch(a.ed.view.state.tr.insertText("Y", 4));
    expect(sharedText(forkA), "nothing staged in shared state mid-composition").toBe("abcd");

    // A collaborator commits in the same paragraph while A composes.
    b.ed.typeText("p:1", "Q");
    b.ed.stopCapturing();
    for (const replica of [forkA, forkB, forkC, authority]) syncInto(forkB, replica);

    endComposition(a.element);
    const delta = forkA.text.toDelta() as Array<{
      insert?: string | Record<string, unknown>;
      attributes?: Record<string, unknown>;
    }>;
    for (const op of delta) {
      if (typeof op.insert === "string") {
        expect(op.insert.includes("\n"), "no raw U+000A in shared text").toBe(false);
      }
    }
    expect(
      delta.filter((op) => typeof op.insert === "object" && op.insert !== null && "hardBreak" in (op.insert as Record<string, unknown>)).length,
      "both hard breaks stored as embeds",
    ).toBe(2);
    expect(
      delta.some((op) => op.insert === "b" && (op.attributes as Record<string, unknown> | undefined)?.["bold"] === true),
      "seeded bold run keeps its mark attributes",
    ).toBe(true);
    // Capture succeeds on the committed field (it throws on raw newlines).
    const captured = captureDocumentFromField(forkA.text, forkA.meta, P0).document;
    expect(JSON.stringify(captured)).toContain("X");
    expect(JSON.stringify(captured)).toContain("Q");
    const text = (captured.blocks[0] as { text?: string }).text ?? "";
    expect(text, "P0 capture keeps both lines and the bold run").toBe("aX\nY**b**\ncdQ");
    reconnectAll([forkA, forkB, forkC, authority]);
    assertQuiescent("ime-break-commit", [forkA, forkB, forkC, authority]);
    expect(a.errors).toEqual([]);
  });

  it("a multi-line staging cancelled keeps marks and breaks (R-LIN-1/R-LIN-7)", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "a**b**\ncd"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-breakcancel-${counter}`);

    const schema = a.ed.view.state.schema;
    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    a.ed.view.dispatch(a.ed.view.state.tr.insertText("X", 2));
    a.ed.view.dispatch(a.ed.view.state.tr.insert(3, schema.nodes["hardBreak"].create()));
    a.ed.view.dispatch(a.ed.view.state.tr.insertText("Y", 4));
    cancelComposition(a.element);
    expect(sharedText(forkA), "cancel stages nothing").toBe("abcd");
    const captured = captureDocumentFromField(forkA.text, forkA.meta, P0).document;
    const text = (captured.blocks[0] as { text?: string }).text ?? "";
    expect(text, "cancel keeps the seeded marks and break").toBe("a**b**\ncd");
    expect(pmText(a.ed).replace(/\n\n/g, ""), "display re-rendered from shared").toBe("ab\ncd");
    expect(a.gestures, "no commit event on cancel").toEqual([]);
  });

  it("commit renders deferred remote text into the local view (BLOCKING-1)", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const forkC = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-repaint-${counter}`);
    const b = await mountOn(forkB, "b", `ime-repaint-${counter}`);

    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    b.ed.typeText("p:1", "Y");
    b.ed.stopCapturing();
    for (const replica of [forkA, forkB, forkC, authority]) syncInto(forkB, replica);
    expect(pmText(a.ed).replace(/\n\n/g, ""), "composing range deferred").toBe("aXb");

    endComposition(a.element);
    expect(sharedText(forkA), "X committed, Y survives").toBe("aXbY");
    // The local view equals the shared projection after commit — not only
    // the shared Y.Text, but the rendered ProseMirror document.
    expect(
      pmText(a.ed).replace(/\n\n/g, ""),
      "deferred remote text rendered into the local view on commit",
    ).toBe(sharedText(forkA));
    expect(a.ed.view.state.doc.textContent, "PM doc equals the shared projection").toBe(
      sharedText(forkA),
    );
    expect(a.errors).toEqual([]);

    a.ed.typeText("p:1", "Z");
    a.ed.stopCapturing();
    reconnectAll([forkA, forkB, forkC, authority]);
    assertQuiescent("ime-repaint-commit", [forkA, forkB, forkC, authority]);
  });

  it("a no-op close repaints deferred remote text (BLOCKING-1)", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-noop-${counter}`);
    const b = await mountOn(forkB, "b", `ime-noop-${counter}`);

    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    // Type-then-delete inside the composition: no net local change.
    a.ed.view.dispatch(a.ed.view.state.tr.delete(2, 3));
    expect(pmText(a.ed).replace(/\n\n/g, ""), "staged text back to the start").toBe("ab");

    b.ed.typeText("p:1", "Y");
    b.ed.stopCapturing();
    syncInto(forkB, forkA);
    expect(sharedText(forkA), "remote Y parked in shared state").toBe("abY");

    const gesturesBefore = a.gestures.length;
    endComposition(a.element);
    expect(a.gestures.length, "no commit event for a no-op close").toBe(gesturesBefore);
    expect(
      pmText(a.ed).replace(/\n\n/g, ""),
      "deferred remote text rendered on a no-op close",
    ).toBe("abY");
    expect(a.errors).toEqual([]);
  });
});

describe("CL-3b2 review 1 F6: concurrent insert inside a replaced selection survives", () => {
  it("commit keeps the concurrent insert; cancel drops only the staging; reconnect converges", async () => {
    counter += 1;
    const selectRange = (ed: RichTextEditor, anchor: number, head: number): void => {
      ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, anchor, head)));
    };
    // Commit run: concurrent insert inside the replaced range survives.
    {
      const authority = seedAuthority(paragraphDoc("p:1", "abcd"));
      const forkA = fork(authority.doc);
      const forkB = fork(authority.doc);
      const forkC = fork(authority.doc);
      const a = await mountOn(forkA, "a", `ime-f6-${counter}`);
      const b = await mountOn(forkB, "b", `ime-f6-${counter}`);

      selectRange(a.ed, 2, 4);
      beginComposition(a.element);
      // Concurrent insert "Y" between "b" and "c" (shared index 3).
      forkB.doc.transact(() => {
        forkB.text.insert(3, "Y");
      });
      syncInto(forkB, forkA);
      expect(sharedText(forkA), "concurrent insert parked in shared state").toBe("abYcd");
      expect(pmText(a.ed).replace(/\n\n/g, ""), "composing display deferred").toBe("abcd");

      // The IME replaces the selected "bc" with "X" on the staged display.
      a.ed.view.dispatch(a.ed.view.state.tr.insertText("X", 2, 4));
      endComposition(a.element);
      expect(sharedText(forkA), "concurrent insert survives the commit (spec R-IME-2)").toBe("aXYd");
      expect(pmText(a.ed).replace(/\n\n/g, ""), "local view matches the merged commit").toBe("aXYd");
      expect(a.errors).toEqual([]);

      a.ed.typeText("p:1", "Z");
      a.ed.stopCapturing();
      reconnectAll([forkA, forkB, forkC, authority]);
      assertQuiescent("ime-f6-commit", [forkA, forkB, forkC, authority]);
      for (const replica of [forkA, forkB, forkC, authority]) {
        expect(sharedText(replica)).toContain("X");
        expect(sharedText(replica)).toContain("Y");
      }
    }
    // Cancel run: the staging is discarded whole, the concurrent insert stays.
    {
      const authority = seedAuthority(paragraphDoc("p:1", "abcd"));
      const forkA = fork(authority.doc);
      const forkB = fork(authority.doc);
      const a = await mountOn(forkA, "a", `ime-f6c-${counter}`);
      selectRange(a.ed, 2, 4);
      beginComposition(a.element);
      forkB.doc.transact(() => {
        forkB.text.insert(3, "Y");
      });
      syncInto(forkB, forkA);
      a.ed.view.dispatch(a.ed.view.state.tr.insertText("X", 2, 4));
      cancelComposition(a.element);
      expect(sharedText(forkA), "cancel keeps the concurrent insert").toBe("abYcd");
      expect(sharedText(forkA), "cancel leaks no staged text").not.toContain("X");
      expect(pmText(a.ed).replace(/\n\n/g, ""), "display re-rendered from shared").toBe("abYcd");
      expect(a.gestures, "no commit event on cancel").toEqual([]);
    }
  });
});

describe("CL-3b2 review 1 BLOCKING-3: structural remote in another paragraph defers mid-composition", () => {
  it("remote delete/split in p2 keep the p1 staging; commit converges on 3 replicas", async () => {
    counter += 1;
    const twoParagraphs = (): RichTextDocument => ({
      format: P0,
      blocks: [
        { paragraphId: "p:1", kind: "paragraph", text: "ab" },
        { paragraphId: "p:2", kind: "paragraph", text: "cd" },
      ],
    }) as RichTextDocument;
    // Delete run: removing p2 remotely must not rebuild the composing range.
    {
      const authority = seedAuthority(twoParagraphs());
      const forkA = fork(authority.doc);
      const forkB = fork(authority.doc);
      const forkC = fork(authority.doc);
      const a = await mountOn(forkA, "a", `ime-b3-${counter}`);
      const b = await mountOn(forkB, "b", `ime-b3-${counter}`);

      collapseCaret(a.ed, 2);
      beginComposition(a.element);
      insertTextAt(a.ed, 2, "X");
      b.ed.deleteBlocks(["p:2"]);
      b.ed.stopCapturing();
      syncInto(forkB, forkA);
      expect(
        pmText(a.ed).replace(/\n\n/g, ""),
        "composing paragraph survives a remote block delete in p2",
      ).toContain("X");
      endComposition(a.element);
      expect(sharedText(forkA), "composition committed over the merged sequence").toContain("X");
      expect(sharedText(forkA), "remote delete of p2 stands").not.toContain("cd");
      expect(
        pmText(a.ed).replace(/\n\n/g, ""),
        "local view renders the commit plus the remote delete",
      ).toContain("X");
      expect(a.errors).toEqual([]);

      reconnectAll([forkA, forkB, forkC, authority]);
      assertQuiescent("ime-b3-delete", [forkA, forkB, forkC, authority]);
      expect(sharedText(forkA)).toContain("X");
      expect(a.ed.getSelection()).toMatchObject({ anchorParagraphId: "p:1" });
    }
    // Split run: a live non-composing update still paints while composing.
    {
      const authority = seedAuthority(twoParagraphs());
      const forkA = fork(authority.doc);
      const forkB = fork(authority.doc);
      const a = await mountOn(forkA, "a", `ime-b3s-${counter}`);
      const b = await mountOn(forkB, "b", `ime-b3s-${counter}`);

      collapseCaret(a.ed, 2);
      beginComposition(a.element);
      insertTextAt(a.ed, 2, "X");
      b.ed.splitParagraph("p:2", 1);
      b.ed.stopCapturing();
      syncInto(forkB, forkA);
      expect(pmText(a.ed).replace(/\n\n/g, ""), "composition survives a remote split in p2").toContain("X");
      expect(
        a.ed.view.state.doc.childCount,
        "disjoint structural update paints live without touching the staging",
      ).toBe(3);
      endComposition(a.element);
      expect(sharedText(forkA)).toContain("X");
      expect(a.errors).toEqual([]);
    }
  });
});

describe("CL-3b2 review 1 TO-FIX-2: destroy mid-composition discards the session", () => {
  it("destroy drops staged text with no shared write and settles pending captures", async () => {
    counter += 1;
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", `ime-destroy-${counter}`);

    collapseCaret(a.ed, 2);
    beginComposition(a.element);
    insertTextAt(a.ed, 2, "X");
    expect(sharedText(forkA), "nothing staged in shared state").toBe("ab");
    const vectorBefore = vectorHex(forkA.doc);
    let settled = 0;
    let rejection: unknown = null;
    const pending = a.ed.captureDocument().then(
      () => {
        settled += 1;
      },
      (error: unknown) => {
        settled += 1;
        rejection = error;
      },
    );
    a.ed.destroy();
    await pending;
    expect(settled, "pending capture settles exactly once on destroy").toBe(1);
    expect(
      (rejection as { name?: unknown } | null)?.name,
      "pending capture rejects neutrally on destroy",
    ).toBe("RichTextCaptureUnavailable");
    expect(sharedText(forkA), "destroy writes no staged text").toBe("ab");
    expect(vectorHex(forkA.doc), "destroy moves no shared clock").toBe(vectorBefore);
    expect(a.gestures, "no commit event from a destroyed composition").toEqual([]);
    mounted.splice(mounted.indexOf(a.ed), 1);
    document.body.innerHTML = "";
  });
});
