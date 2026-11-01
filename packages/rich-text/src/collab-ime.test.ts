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
