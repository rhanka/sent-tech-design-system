/**
 * CL-3b2 witness 12 DS half — cursor decoration plugin (spec §5.1.1, §5.1
 * registry, §5.2 R-ANCH-5).
 *
 * Two fields of one document mounted over one awareness object, two remote
 * actors plus one local publisher: each field renders exactly its own
 * field's carets under each actor's label and validated colour; an
 * unregistered `actorId` with an otherwise valid `cursor` renders no caret
 * anywhere; an invalid colour renders as `transparent`; clearing a cursor
 * removes the decoration without removing presence; a caret at field end
 * keeps its R-ANCH-2 affinity after a concurrent append (renders before the
 * appended text). Publisher: the local selection publishes `actorId`,
 * `user: { name, color }` and `cursor: { fieldKey, anchor, head }` with no
 * numeric offsets on the wire, re-publishes only on change, clears on blur,
 * and the awareness payload per update stays within the §8.5 budget
 * (≤ 4 KiB). Labels render as text, never markup (§8.6). The §5.1.1 CL-4
 * witness (two agent actors through the bridge adapter, bridge parsing of
 * flat strings refused) is host/bridge work and is listed as remaining, not
 * done.
 *
 * RED on the CL-3b1 base: the DS cursor plugin, the publisher and the
 * admitted-actor registry do not exist, so no bound mount renders or
 * publishes any caret.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { TextSelection } from "@tiptap/pm/state";
import type { Awareness } from "y-protocols/awareness";
import type { RichTextEditor } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import { fieldMetaName, fieldTextName, seedFieldFromDocument } from "./collab-codec.js";
import { buildSelectionMap } from "./collab-projection.js";
import { selectionToCursorJson } from "./collab-selection.js";
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

const BODY = "body";
const NOTES = "notes";
const P0 = "focus.markdown.p0@1";

let counter = 0;

function paragraphDoc(id: string, text: string): RichTextDocument {
  return {
    format: P0,
    blocks: [{ paragraphId: id, kind: "paragraph", text }],
  } as RichTextDocument;
}

interface FieldSet {
  doc: Y.Doc;
  awareness: Awareness;
  bodyText: Y.Text;
  notesText: Y.Text;
  source: {
    resolveBinding: (identity: FieldBindingIdentity) => {
      identity: FieldBindingIdentity;
      text: Y.Text;
      fieldMeta: Y.Map<unknown>;
      awareness: Awareness;
    };
    releaseBinding: (identity: FieldBindingIdentity) => void;
    registerActor: (actor: { actorId: string; displayLabel: string; color: string }) => void;
    revokeActor: (actorId: string) => void;
    admittedActorOf: (actorId: string) => { displayLabel: string; color: string } | null;
  };
}

async function twoFields(): Promise<FieldSet> {
  const doc = new Y.Doc();
  const bodyText = doc.getText(fieldTextName(BODY));
  const bodyMeta = doc.getMap(fieldMetaName(BODY)) as Y.Map<unknown>;
  const notesText = doc.getText(fieldTextName(NOTES));
  const notesMeta = doc.getMap(fieldMetaName(NOTES)) as Y.Map<unknown>;
  seedFieldFromDocument(bodyText, bodyMeta, BODY, paragraphDoc("p:1", "ab"));
  seedFieldFromDocument(notesText, notesMeta, NOTES, paragraphDoc("n:1", "xy"));
  const { Awareness } = await import("y-protocols/awareness");
  const awareness = new Awareness(doc);
  const textOf = (fieldKey: string): Y.Text => doc.getText(fieldTextName(fieldKey));
  const metaOf = (fieldKey: string): Y.Map<unknown> =>
    doc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>;
  const actors = new Map<string, { displayLabel: string; color: string }>();
  return {
    doc,
    awareness,
    bodyText,
    notesText,
    source: {
      resolveBinding: (identity: FieldBindingIdentity) => ({
        identity: { ...identity },
        text: textOf(identity.fieldKey),
        fieldMeta: metaOf(identity.fieldKey),
        awareness,
      }),
      releaseBinding: (): void => {},
      registerActor: (actor): void => {
        actors.set(actor.actorId, { displayLabel: actor.displayLabel, color: actor.color });
      },
      revokeActor: (actorId: string): void => {
        actors.delete(actorId);
      },
      admittedActorOf: (actorId: string) => actors.get(actorId) ?? null,
    },
  };
}

async function mountField(
  fields: FieldSet,
  fieldKey: string,
): Promise<{ ed: RichTextEditor; element: HTMLElement }> {
  counter += 1;
  const identity: FieldBindingIdentity = {
    documentId: `cursor:canvas:${counter}`,
    sessionId: `cursor:session:${counter}`,
    fieldKey,
  };
  const element = globalThis.document.createElement("div");
  globalThis.document.body.appendChild(element);
  const ed = await createBoundRichTextEditor({
    document: paragraphDoc("p:1", "ab"),
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:cursor:${counter}:${(n += 1)}`;
    })(),
    collaborationBinding: identity,
    collaborationSource: fields.source as never,
    collaborationActor: {
      actorId: "local-1",
      kind: "human",
      displayLabel: "Local",
      color: "#00aa00",
    },
    element,
  });
  mounted.push(ed);
  return { ed, element };
}

/** Fake a remote awareness state on the shared object (the renderer, not
    the awareness protocol, is under test). */
function injectRemote(awareness: Awareness, clientId: number, state: unknown): void {
  awareness.getStates().set(clientId, state as Record<string, unknown>);
  (
    awareness as unknown as { emit: (name: string, args: unknown[]) => void }
  ).emit("change", [{ added: [clientId], updated: [], removed: [] }, "test"]);
}

function remoteCursor(
  ed: RichTextEditor,
  ytext: Y.Text,
  fieldKey: string,
  pmAnchor: number,
  pmHead: number,
): { fieldKey: string; anchor: unknown; head: unknown } {
  const map = buildSelectionMap(ed.view.state.doc, ytext);
  const cursor = selectionToCursorJson(ytext, fieldKey, map, pmAnchor, pmHead);
  return { fieldKey: cursor.fieldKey, anchor: cursor.anchor, head: cursor.head };
}

function caretsOf(mount: { ed: RichTextEditor; element: HTMLElement }, actorId: string): Element[] {
  return [...mount.element.querySelectorAll(`[data-remote-caret="${actorId}"]`)];
}

function selectionsOf(
  mount: { ed: RichTextEditor; element: HTMLElement },
  actorId: string,
): Element[] {
  return [...mount.element.querySelectorAll(`[data-remote-selection="${actorId}"]`)];
}

describe("CL-3b2-12 renderer renders exactly its own field's admitted carets", () => {
  it("each field renders its own carets with label and validated colour; strangers and revoked actors render nothing", async () => {
    const fields = await twoFields();
    fields.source.registerActor({ actorId: "r1", displayLabel: "R One", color: "#112233" });
    fields.source.registerActor({ actorId: "r2", displayLabel: "R Two", color: "#445566" });
    const edBody = await mountField(fields, BODY);
    const edNotes = await mountField(fields, NOTES);

    injectRemote(fields.awareness, 1001, {
      actorId: "r1",
      user: { name: "R One", color: "#112233" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 2, 2),
    });
    injectRemote(fields.awareness, 1002, {
      actorId: "r2",
      user: { name: "R Two", color: "#445566" },
      cursor: remoteCursor(edNotes.ed, fields.notesText, NOTES, 1, 3),
    });
    // An unregistered actorId with an otherwise valid cursor renders no
    // caret anywhere.
    injectRemote(fields.awareness, 1003, {
      actorId: "r3",
      user: { name: "R Three", color: "#778899" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 2, 2),
    });

    const r1Body = caretsOf(edBody, "r1");
    expect(r1Body, "body renders the body caret").toHaveLength(1);
    expect(r1Body[0]?.textContent).toBe("R One");
    // jsdom serialises the hex colour to its rgb form in the style attribute.
    expect(r1Body[0]?.querySelector("[data-remote-caret-bar]")?.getAttribute("style")).toContain(
      "17, 34, 51",
    );
    expect(caretsOf(edNotes, "r1"), "notes never render the body caret").toHaveLength(0);
    expect(caretsOf(edNotes, "r2"), "notes render the notes selection caret").toHaveLength(1);
    expect(
      edNotes.element.querySelectorAll('[data-remote-selection="r2"]'),
      "notes render the selection range",
    ).toHaveLength(1);
    expect(caretsOf(edBody, "r2"), "body never renders the notes caret").toHaveLength(0);
    expect(caretsOf(edBody, "r3"), "stranger renders nowhere (body)").toHaveLength(0);
    expect(caretsOf(edNotes, "r3"), "stranger renders nowhere (notes)").toHaveLength(0);

    // Clearing the cursor removes the decoration without removing presence.
    injectRemote(fields.awareness, 1001, {
      actorId: "r1",
      user: { name: "R One", color: "#112233" },
      cursor: null,
    });
    expect(caretsOf(edBody, "r1"), "cleared cursor removes the decoration").toHaveLength(0);
    expect(
      (fields.awareness.getStates().get(1001) as { user?: unknown } | undefined)?.user,
      "presence stays",
    ).toEqual({ name: "R One", color: "#112233" });

    // Revoking the actor removes the caret through registry verification.
    injectRemote(fields.awareness, 1001, {
      actorId: "r1",
      user: { name: "R One", color: "#112233" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 2, 2),
    });
    expect(caretsOf(edBody, "r1"), "republished caret renders again").toHaveLength(1);
    fields.source.revokeActor("r1");
    injectRemote(fields.awareness, 1001, {
      actorId: "r1",
      user: { name: "R One", color: "#112233" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 2, 2),
    });
    expect(caretsOf(edBody, "r1"), "revoked actor renders no caret").toHaveLength(0);
  });

  it("an invalid colour renders as transparent and labels render as text, never markup", async () => {
    const fields = await twoFields();
    fields.source.registerActor({
      actorId: "r4",
      displayLabel: "<img src=x onerror=y>",
      color: "not-a-color",
    });
    const edBody = await mountField(fields, BODY);
    await mountField(fields, NOTES);
    injectRemote(fields.awareness, 1004, {
      actorId: "r4",
      user: { name: "<img src=x onerror=y>", color: "not-a-color" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 1, 1),
    });
    const carets = caretsOf(edBody, "r4");
    expect(carets, "invalid colour still renders a caret").toHaveLength(1);
    expect(carets[0]?.textContent, "label renders as text").toBe("<img src=x onerror=y>");
    expect(carets[0]?.querySelector("img"), "no markup in the label").toBeNull();
    expect(
      carets[0]?.querySelector("[data-remote-caret-bar]")?.getAttribute("style"),
      "invalid colour falls back to transparent",
    ).toContain("transparent");
  });

  it("a caret at field end keeps its R-ANCH-2 affinity after a concurrent append", async () => {
    const fields = await twoFields();
    fields.source.registerActor({ actorId: "r1", displayLabel: "R One", color: "#112233" });
    const edBody = await mountField(fields, BODY);
    // End-of-field caret: association `< 0` binds the previously last item.
    injectRemote(fields.awareness, 1001, {
      actorId: "r1",
      user: { name: "R One", color: "#112233" },
      cursor: remoteCursor(edBody.ed, fields.bodyText, BODY, 3, 3),
    });
    expect(caretsOf(edBody, "r1"), "end caret renders").toHaveLength(1);
    // A concurrent remote append lands after the caret anchor.
    fields.doc.transact(() => {
      fields.bodyText.insert(fields.bodyText.length, "ZZ");
    });
    const caret = caretsOf(edBody, "r1");
    expect(caret, "caret survives the append").toHaveLength(1);
    const html = edBody.element.innerHTML;
    const caretIndex = html.indexOf("data-remote-caret-bar");
    const appendedIndex = html.indexOf("ZZ");
    expect(caretIndex).toBeGreaterThanOrEqual(0);
    expect(appendedIndex).toBeGreaterThanOrEqual(0);
    expect(caretIndex, "caret renders before the appended text").toBeLessThan(appendedIndex);
  });
});

describe("CL-3b2-12 publisher publishes the local selection without numeric offsets", () => {
  it("publishes actor, user and field cursor on change, dedupes repeats, clears on blur, within budget", async () => {
    const fields = await twoFields();
    const edBody = await mountField(fields, BODY);
    await mountField(fields, NOTES);

    let cursorWrites = 0;
    const originalSet = fields.awareness.setLocalStateField.bind(fields.awareness);
    fields.awareness.setLocalStateField = ((field: string, value: unknown) => {
      if (field === "cursor") cursorWrites += 1;
      return originalSet(field, value);
    }) as typeof fields.awareness.setLocalStateField;

    const collapse = (pos: number): void => {
      edBody.ed.view.dispatch(
        edBody.ed.view.state.tr.setSelection(TextSelection.create(edBody.ed.view.state.doc, pos)),
      );
    };
    collapse(2);
    const local = fields.awareness.getLocalState() as unknown as {
      actorId?: unknown;
      user?: unknown;
      cursor?: { fieldKey?: unknown; anchor?: unknown; head?: unknown };
    };
    expect(local.actorId, "actorId published").toBe("local-1");
    expect(local.user, "user published with validated colour").toEqual({
      name: "Local",
      color: "#00aa00",
    });
    expect(local.cursor?.fieldKey, "cursor carries the field key").toBe(BODY);
    expect(JSON.stringify(local.cursor), "no numeric offsets on the wire").not.toMatch(
      /"(anchor|head)":\d/,
    );
    const firstAnchor = JSON.stringify(local.cursor);
    expect(
      JSON.stringify(local).length,
      "awareness payload per update within the §8.5 budget",
    ).toBeLessThanOrEqual(4096);

    // Re-publish only when the relative positions actually changed: the
    // same selection writes nothing, a moved caret writes once.
    const writesAfterFirst = cursorWrites;
    collapse(2);
    expect(cursorWrites, "same selection publishes nothing").toBe(writesAfterFirst);
    collapse(3);
    expect(cursorWrites, "moved caret publishes once").toBe(writesAfterFirst + 1);
    const moved = fields.awareness.getLocalState() as unknown as {
      cursor?: { fieldKey?: unknown };
    };
    expect(moved.cursor?.fieldKey, "moved caret stays on the field").toBe(BODY);
    expect(JSON.stringify(moved.cursor), "anchor tracks the caret").not.toBe(firstAnchor);

    // Blur clears the cursor (presence stays for the session).
    edBody.ed.view.dom.dispatchEvent(new Event("blur"));
    expect(
      (fields.awareness.getLocalState() as { cursor?: unknown } | null)?.cursor,
      "blur clears the cursor",
    ).toBeNull();
  });
});
