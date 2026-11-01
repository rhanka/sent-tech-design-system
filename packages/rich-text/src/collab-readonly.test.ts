/**
 * CL-3b2 witness 6 — read-only bound session + B8 (spec §6.2 R-API-2/R-API-4,
 * R-API-3).
 *
 * A bound editor mounted `editable: false` (admitted viewer) renders remote
 * updates (text, metadata, structural) as they arrive, keeps text
 * selectable/copyable, and every local mutation path is inert: native
 * typing, the gesture methods, `undo()`/`redo()` and keyboard history each
 * leave the shared state vector and the shared content byte-identical, with
 * no `onChange` emitted. Toggling `setEditable(true)` on the same mount (no
 * remount) enables editing; toggling back mid-composition follows the Task 1
 * revocation. `applyExternalUpdate` on a bound editor never replaces the
 * shared projection: it surfaces the session-level conflict through
 * `onExternalConflict` and changes nothing on either side (R-API-3). B8:
 * two bound editors admitted editable on one field stay editable together
 * while an L0 lock snapshot names another actor — at the rich-text level the
 * editable fact is computed through `computeEffectiveEditable` (binding
 * present ⇒ the lock does not drive `editable`) — and concurrent typing into
 * one paragraph converges with no lost edit; the controlled surface for the
 * same lock renders read-only.
 *
 * RED on the CL-3b1 base: a raw local transaction on a read-only bound
 * mount projects into the shared `Y.Text`, and `applyExternalUpdate`
 * replaces the bound display through the controlled rule path.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import type { RichTextEditor } from "./editor.js";
import type { RichTextChangeEvent, RichTextExternalConflictEvent } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import {
  computeEffectiveEditable,
  type FieldBindingIdentity,
  type LockSnapshot,
} from "./collaboration.js";
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
  gestures: RichTextChangeEvent[];
  conflicts: RichTextExternalConflictEvent[];
  errors: unknown[];
}

async function mountOn(
  forked: Replica,
  tag: string,
  actorId: string,
  options?: { editable?: boolean },
): Promise<Mounted> {
  counter += 1;
  const identity: FieldBindingIdentity = {
    documentId: `ro:canvas:${counter}`,
    sessionId: `ro:session:${counter}`,
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
  const gestures: RichTextChangeEvent[] = [];
  const conflicts: RichTextExternalConflictEvent[] = [];
  const errors: unknown[] = [];
  const ed = await createBoundRichTextEditor({
    document: paragraphDoc("p:1", "ab"),
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:ro:${tag}:${counter}:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: source as never,
    collaborationActor: { actorId, kind: "human" },
    element,
    editable: options?.editable ?? true,
    onChange: (event) => gestures.push(event),
    onExternalConflict: (event) => conflicts.push(event),
    onBindingError: (event) => errors.push(event),
  });
  mounted.push(ed);
  return { ed, gestures, conflicts, errors };
}

function vectorHex(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateVector(doc)).toString("hex");
}

function captureJson(replica: Replica): string {
  return JSON.stringify(captureDocumentFromField(replica.text, replica.meta, P0).document);
}

function pmText(ed: RichTextEditor): string {
  return ed.view.state.doc.textBetween(0, ed.view.state.doc.content.size, "\n\n", "\n");
}

describe("CL-3b2-6 read-only bound session renders while every mutation path stays inert", () => {
  it("an admitted viewer renders remote updates and stays selectable, with shared state and content byte-identical", async () => {
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkViewer = fork(authority.doc);
    const forkWriter = fork(authority.doc);
    const viewer = await mountOn(forkViewer, "viewer", "ro-viewer", { editable: false });
    const writer = await mountOn(forkWriter, "writer", "ro-writer", { editable: true });

    // Remote text, then a remote split, arrive on the read-only mount.
    writer.ed.typeText("p:1", "XY");
    writer.ed.stopCapturing();
    Y.applyUpdate(forkViewer.doc, Y.encodeStateAsUpdate(forkWriter.doc));
    expect(pmText(viewer.ed), "remote text renders read-only").toContain("XY");
    writer.ed.splitParagraph("p:1", 1);
    writer.ed.stopCapturing();
    Y.applyUpdate(forkViewer.doc, Y.encodeStateAsUpdate(forkWriter.doc));
    expect(viewer.ed.view.state.doc.childCount, "remote structure renders").toBe(2);

    // Text stays selectable and copyable on the inert surface: the caret
    // snapshot names a live paragraph and the tail copy carries the remote
    // text (the head kept `p:1` with `a`, the split tail carries `bXY`).
    const liveIds = (
      viewer.ed.getDocument().blocks as Array<{ paragraphId: string }>
    ).map((block) => block.paragraphId);
    expect(liveIds).toHaveLength(2);
    expect(liveIds[0]).toBe("p:1");
    const selectable = viewer.ed.getSelection();
    expect(liveIds).toContain(selectable.anchorParagraphId);
    const payload = viewer.ed.copyToPayload([liveIds[1] as string]);
    expect(payload.text).toContain("XY");
    expect(viewer.errors).toEqual([]);

    // Every local mutation path leaves shared state and content
    // byte-identical, with no `onChange` emitted.
    const vectorBefore = vectorHex(forkViewer.doc);
    const captureBefore = captureJson(forkViewer);
    const pmBefore = pmText(viewer.ed);
    viewer.ed.typeText("p:1", "LOCAL");
    viewer.ed.splitParagraph("p:1", 1);
    viewer.ed.mergeWithPrevious("p:1");
    viewer.ed.deleteBlocks(["p:1"]);
    viewer.ed.paste({ text: "LOCAL" });
    viewer.ed.undo();
    viewer.ed.redo();
    // Native typing through the DOM input path never reaches the view or
    // the shared state on the inert surface (ProseMirror drops input when
    // the view is not editable).
    viewer.ed.view.dom.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true }),
    );
    viewer.ed.view.dom.dispatchEvent(
      new InputEvent("beforeinput", {
        data: "NATIVE",
        inputType: "insertText",
        bubbles: true,
        cancelable: true,
      }),
    );
    // Keyboard history through the view never reaches the shared state.
    viewer.ed.view.dom.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true, cancelable: true }),
    );
    expect(vectorHex(forkViewer.doc), "shared state vector byte-identical").toBe(vectorBefore);
    expect(captureJson(forkViewer), "shared content byte-identical").toBe(captureBefore);
    expect(pmText(viewer.ed), "inert view byte-identical").toBe(pmBefore);
    expect(viewer.gestures, "no onChange from any inert path").toEqual([]);
    expect(viewer.errors).toEqual([]);

    // Toggling the same mount to editable (no remount) enables editing.
    viewer.ed.setEditable(true);
    viewer.ed.typeText("p:1", "NOW");
    expect(pmText(viewer.ed)).toContain("NOW");
    expect(captureJson(forkViewer)).toContain("NOW");
    expect(viewer.gestures).toHaveLength(1);
    expect(viewer.gestures[0]?.gesture.kind).toBe("type");

    // Toggling back mid-composition follows the Task 1 revocation: the
    // staged text is discarded, the display re-renders from shared state.
    viewer.ed.view.dom.dispatchEvent(new Event("compositionstart", { bubbles: true }));
    viewer.ed.view.dispatch(viewer.ed.view.state.tr.insertText("STAGED", 2));
    expect(pmText(viewer.ed), "composition staged on the display").toContain("STAGED");
    expect(captureJson(forkViewer), "staged text absent from shared state").not.toContain("STAGED");
    const vectorBeforeRevoke = vectorHex(forkViewer.doc);
    viewer.ed.setEditable(false);
    viewer.ed.view.dom.dispatchEvent(new Event("compositionend", { bubbles: true }));
    expect(vectorHex(forkViewer.doc), "revocation adds no shared transaction").toBe(
      vectorBeforeRevoke,
    );
    expect(captureJson(forkViewer), "revocation stages nothing").not.toContain("STAGED");
    expect(pmText(viewer.ed), "display re-rendered from shared").not.toContain("STAGED");
  });

  it("applyExternalUpdate on a bound editor surfaces the session conflict and changes nothing (R-API-3)", async () => {
    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const a = await mountOn(forkA, "a", "ro-ext");
    const vectorBefore = vectorHex(forkA.doc);
    const captureBefore = captureJson(forkA);
    const pmBefore = pmText(a.ed);

    a.ed.applyExternalUpdate(paragraphDoc("p:1", "replaced"));
    expect(a.conflicts, "one session-level conflict surfaces").toHaveLength(1);
    expect(a.conflicts[0]?.incoming.blocks[0]).toMatchObject({ text: "replaced" });
    expect(vectorHex(forkA.doc), "shared state vector unchanged").toBe(vectorBefore);
    expect(captureJson(forkA), "shared content unchanged").toBe(captureBefore);
    expect(pmText(a.ed), "display unchanged").toBe(pmBefore);
    expect(a.gestures, "no change event").toEqual([]);
  });
});

describe("CL-3b2-6 B8 admitted editors stay editable together under a foreign L0 lock", () => {
  it("two bound editors type concurrently into one paragraph and converge with no lost edit", async () => {
    const lock: LockSnapshot = {
      unit: { scopeRef: "canvas:lock:b8" },
      holder: {
        actorId: "someone-else",
        kind: "human",
        displayLabel: "Someone Else",
        color: "#112233",
      },
      expiresAt: null,
    };
    // The host computes exactly one editing fact per surface mode: a live
    // binding keeps admitted editors editable under a locked-by-other L0
    // snapshot, while the same snapshot without a binding reads read-only.
    const binding: FieldBindingIdentity = {
      documentId: "ro:canvas:b8",
      sessionId: "ro:session:b8",
      fieldKey: FIELD,
    };
    expect(
      computeEffectiveEditable({ binding, editable: true, lock, actorId: "a" }),
      "admitted L2 editors stay editable",
    ).toBe(true);
    expect(
      computeEffectiveEditable({ binding: null, editable: true, lock, actorId: "a" }),
      "controlled surface for the same lock reads read-only",
    ).toBe(false);

    const authority = seedAuthority(paragraphDoc("p:1", "ab"));
    const forkA = fork(authority.doc);
    const forkB = fork(authority.doc);
    // Both editors mount with the admitted-editable fact above.
    const a = await mountOn(forkA, "a", "ro-b8-a", { editable: true });
    const b = await mountOn(forkB, "b", "ro-b8-b", { editable: true });
    a.ed.typeText("p:1", "AA");
    a.ed.stopCapturing();
    b.ed.typeText("p:1", "BB");
    b.ed.stopCapturing();
    Y.applyUpdate(forkA.doc, Y.encodeStateAsUpdate(forkB.doc));
    Y.applyUpdate(forkB.doc, Y.encodeStateAsUpdate(forkA.doc));
    Y.applyUpdate(authority.doc, Y.encodeStateAsUpdate(forkA.doc));
    const captures = [forkA, forkB].map((replica) => captureJson(replica));
    expect(captures[0]).toBe(captures[1]);
    expect(captures[0]).toContain("AA");
    expect(captures[0]).toContain("BB");
    expect(vectorHex(forkA.doc)).toBe(vectorHex(forkB.doc));
    expect(a.errors).toEqual([]);
    expect(b.errors).toEqual([]);
  });
});
