/**
 * CL-2 RED — adapter witnesses on the Svelte surface (spec §6.2, §8 CL-2).
 *
 * (1) Controlled surface, lock held by another ⇒ typing, paste, drop, cut
 * and mutation shortcuts are inert, no `onChange`, text still selectable.
 * (2) Acquiring the lock flips to editable without remount (same ProseMirror
 * instance, caret/selection preserved). (5) No provider ⇒ byte-identical
 * controlled behaviour to RT-1. (6) B8 with and without a live `binding`.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";

for (const target of [Element.prototype, Document.prototype] as unknown as Array<{
  elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
}>) {
  if (typeof target.elementFromPoint !== "function") {
    target.elementFromPoint = () => null;
  }
}

import type {
  CollaborationActor,
  CollaborationCapabilities,
  FieldBindingIdentity,
  LockSnapshot,
  PresenceSnapshot,
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextMessages,
} from "@sentropic/design-system-rich-text";
import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
import { TextSelection } from "@tiptap/pm/state";
import RichTextEditor from "./RichTextEditor.svelte";
import type { RichTextEditorProps } from "./RichTextEditor.svelte";

const { createdCores } = vi.hoisted(() => ({
  createdCores: [] as CoreEditor[],
}));
vi.mock("@sentropic/design-system-rich-text/editor", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@sentropic/design-system-rich-text/editor")
    >();
  return {
    ...actual,
    createRichTextEditor: (
      options: Parameters<typeof actual.createRichTextEditor>[0],
    ) => {
      const instance = actual.createRichTextEditor(options);
      createdCores.push(instance);
      return instance;
    },
  };
});

function lastCore(): CoreEditor {
  const instance = createdCores[createdCores.length - 1];
  expect(instance).toBeDefined();
  return instance as CoreEditor;
}

function coreCount(): number {
  return createdCores.length;
}

const MESSAGES: RichTextMessages = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
  presenceLabel: "SENTINEL-PRESENCE-{count}",
  lockLabel: "SENTINEL-LOCK-{holder}",
  unlockRequestLabel: "SENTINEL-UNLOCK",
  noLockLabel: "SENTINEL-NOLOCK",
};

const MARKDOWN: RichTextDocument["format"] = "focus.markdown.p0@1";

function makeAllocator(): () => string {
  let sequence = 0;
  return () => `test:id:${(sequence += 1)}`;
}

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function twoParagraphs(): RichTextDocument {
  return {
    format: MARKDOWN,
    blocks: [paragraph("paragraph:1", "First"), paragraph("paragraph:2", "Second")],
  };
}

const SELF: CollaborationActor = {
  actorId: "actor:self",
  kind: "human",
  displayLabel: "Self",
  color: "#112233",
};
const OTHER: CollaborationActor = {
  actorId: "actor:other",
  kind: "human",
  displayLabel: "Other",
  color: "#445566",
};
const BINDING: FieldBindingIdentity = {
  documentId: "canvas:artifact-1",
  sessionId: "session:1",
  fieldKey: "field:body",
};
const CAPABILITIES: CollaborationCapabilities = {
  currentActorId: "actor:self",
  canAcquire: true,
  canRequestUnlock: true,
  canForceUnlock: false,
};
function lockHeldBy(holder: CollaborationActor | null): LockSnapshot {
  return {
    unit: { scopeRef: "scope:card-1" },
    holder,
    expiresAt: null,
  };
}
const PRESENCE: PresenceSnapshot = {
  scopeRef: "scope:card-1",
  actors: [OTHER],
  total: 2,
};

interface Collected {
  changes: RichTextChangeEvent[];
  locks: LockSnapshot[];
  presences: PresenceSnapshot[];
}

function collect(extra?: Partial<RichTextEditorProps>): {
  collected: Collected;
  props: RichTextEditorProps;
} {
  const collected: Collected = { changes: [], locks: [], presences: [] };
  return {
    collected,
    props: {
      value: twoParagraphs(),
      messages: { ...MESSAGES },
      allocateId: makeAllocator(),
      onChange: (event) => {
        collected.changes.push(event);
      },
      onLockChange: (snapshot) => {
        collected.locks.push(snapshot);
      },
      onPresenceChange: (snapshot) => {
        collected.presences.push(snapshot);
      },
      ...extra,
    },
  };
}

function editableOf(container: HTMLElement): HTMLElement {
  const editable = container.querySelector(".ProseMirror") as HTMLElement | null;
  expect(editable).not.toBeNull();
  return editable as HTMLElement;
}

function dispatchPaste(editable: HTMLElement, payload: { html?: string; text?: string }): void {
  const transfer = {
    getData: (type: string): string => {
      if (type === "text/html") return payload.html ?? "";
      if (type === "text/plain" || type === "Text") return payload.text ?? "";
      return "";
    },
    types: [
      ...(payload.html !== undefined ? ["text/html"] : []),
      ...(payload.text !== undefined ? ["text/plain"] : []),
    ],
  };
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", { value: transfer });
  editable.dispatchEvent(event);
}

describe("CL-2 witness 1 — lock held by another ⇒ inert but selectable (RED)", () => {
  it("typing, paste, drop, cut and mutation shortcuts change nothing and emit nothing", async () => {
    const { collected, props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      presence: PRESENCE,
      capabilities: CAPABILITIES,
    });
    const { container } = render(RichTextEditor, { props });
    await tick();
    const editor = lastCore();
    const before = editor.getDocument();
    editor.typeText("paragraph:1", "X");
    editor.paste({ text: "pasted" });
    editor.splitParagraph("paragraph:1", 1);
    editor.mergeWithPrevious("paragraph:2");
    editor.deleteBlocks(["paragraph:1"]);
    editor.undo();
    editor.redo();
    const editable = editableOf(container);
    await fireEvent.keyDown(editable, { key: "Enter", code: "Enter" });
    await fireEvent.keyDown(editable, { key: "Backspace", code: "Backspace" });
    await fireEvent.keyDown(editable, { key: "z", code: "KeyZ", ctrlKey: true });
    await fireEvent.keyDown(editable, { key: "y", code: "KeyY", ctrlKey: true });
    dispatchPaste(editable, { text: "pasted" });
    editable.dispatchEvent(new Event("cut", { bubbles: true, cancelable: true }));
    const handled = editor.view.someProp("handleDrop", (handler: unknown) => {
      const fn = handler as (
        view: unknown,
        event: unknown,
        slice: unknown,
        moved: boolean,
      ) => boolean;
      return fn(editor.view, {}, undefined, false);
    });
    expect(handled).toBe(true);
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(editor.getDocument()).toEqual(before);
  });

  it("text stays selectable and copyable with no disabled state", async () => {
    const { props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      presence: PRESENCE,
      capabilities: CAPABILITIES,
    });
    const { container } = render(RichTextEditor, { props });
    await tick();
    const editable = editableOf(container);
    expect(editable.getAttribute("tabindex")).toBe("0");
    expect(editable.getAttribute("aria-disabled")).toBe("false");
    const selection = window.getSelection();
    expect(selection).not.toBeNull();
    selection?.selectAllChildren(editable);
    expect(selection?.toString()).toContain("First");
    const payload = lastCore().copyToPayload(["paragraph:1"]);
    expect(payload.text).toContain("First");
    selection?.removeAllRanges();
  });

  it("the composition seam renders lock and presence facts with injected labels", async () => {
    const { collected, props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      presence: PRESENCE,
      capabilities: CAPABILITIES,
    });
    const { container } = render(RichTextEditor, { props });
    await tick();
    const seam = container.querySelector('[data-testid="live-seam"]');
    expect(seam).not.toBeNull();
    expect(seam?.querySelector(".st-rich-text-editor__lock")?.textContent).toBe(
      "SENTINEL-LOCK-Other",
    );
    expect(seam?.querySelector(".st-rich-text-editor__presence")?.textContent).toBe(
      "SENTINEL-PRESENCE-2",
    );
    const unlock = seam?.querySelector(
      ".st-rich-text-editor__unlock",
    ) as HTMLButtonElement | null;
    expect(unlock?.textContent).toBe("SENTINEL-UNLOCK");
    // Read-only mode still shows the badge with request-unlock disabled.
    expect(unlock?.disabled).toBe(true);
    expect(collected.locks).toHaveLength(1);
    expect(collected.presences).toHaveLength(1);
  });
});

describe("CL-2 witness 2 — acquiring the lock flips without remount (RED)", () => {
  it("same ProseMirror instance, caret and selection preserved, then editable", async () => {
    const { collected, props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      capabilities: CAPABILITIES,
    });
    const { rerender } = render(RichTextEditor, { props });
    await tick();
    const countBefore = coreCount();
    const editor = lastCore();
    const viewBefore = editor.view;
    editor.typeText("paragraph:1", "blocked");
    expect(collected.changes).toHaveLength(0);
    // Place the caret while locked: selection is never a mutation path.
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, 2, 2)),
    );
    const selectionBefore = editor.getSelection();
    expect(selectionBefore.anchorParagraphId).toBe("paragraph:1");
    // Acquire: the host passes the released lock; no remount follows.
    await rerender({ ...props, lock: lockHeldBy(null) });
    await tick();
    expect(coreCount()).toBe(countBefore);
    expect(lastCore().view).toBe(viewBefore);
    expect(lastCore().getSelection()).toEqual(selectionBefore);
    // The surface is editable again through the same instance.
    lastCore().typeText("paragraph:1", "X");
    await tick();
    expect(collected.changes).toHaveLength(1);
    expect(lastCore().getDocument().blocks[0]).toMatchObject({
      paragraphId: "paragraph:1",
    });
  });
});

describe("CL-2 witness 6 — B8 with and without a live binding (RED)", () => {
  it("without a binding the locked-by-other snapshot makes the surface read-only", async () => {
    const { collected, props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      capabilities: CAPABILITIES,
    });
    render(RichTextEditor, { props });
    await tick();
    lastCore().typeText("paragraph:1", "X");
    await tick();
    expect(collected.changes).toHaveLength(0);
  });

  it("with a live binding the same snapshot keeps admitted editors editable", async () => {
    const { collected, props } = collect({
      editable: true,
      binding: BINDING,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      presence: PRESENCE,
      capabilities: CAPABILITIES,
    });
    const { container } = render(RichTextEditor, { props });
    await tick();
    lastCore().typeText("paragraph:1", "live");
    await tick();
    expect(collected.changes).toHaveLength(1);
    // The badge still renders the lock fact without driving editable.
    const seam = container.querySelector('[data-testid="live-seam"]');
    expect(seam?.querySelector(".st-rich-text-editor__lock")?.textContent).toBe(
      "SENTINEL-LOCK-Other",
    );
    expect(lastCore().getBinding()).toEqual(BINDING);
  });
});

describe("CL-2 witness 5 — no provider ⇒ RT-1 behaviour byte-identically (RED)", () => {
  it("omitting the new props mounts no live seam and keeps the RT-1 contract", async () => {
    const { collected, props } = collect({ editable: true });
    const { container } = render(RichTextEditor, { props });
    await tick();
    expect(container.querySelector('[data-testid="live-seam"]')).toBeNull();
    expect(lastCore().getBinding()).toBeNull();
    const editable = editableOf(container);
    expect(editable.getAttribute("aria-label")).toBe("SENTINEL-EDITOR-LABEL");
    expect(editable.getAttribute("tabindex")).toBe("0");
    lastCore().typeText("paragraph:1", "X");
    await tick();
    expect(collected.changes).toHaveLength(1);
    expect(collected.locks).toHaveLength(0);
    expect(collected.presences).toHaveLength(0);
  });
});

describe("unlock button untranslated marker (P2)", () => {
  it("carries data-untranslated like the adjacent labels when the key is missing", async () => {
    const { props } = collect({
      editable: true,
      actor: SELF,
      lock: lockHeldBy(OTHER),
      capabilities: CAPABILITIES,
    });
    const missing = {
      ...props,
      messages: {
        editorLabel: "SENTINEL-EDITOR-LABEL",
        placeholder: "SENTINEL-PLACEHOLDER",
        preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
        externalConflictLabel: "SENTINEL-CONFLICT",
        presenceLabel: "SENTINEL-PRESENCE-{count}",
        lockLabel: "SENTINEL-LOCK-{holder}",
        noLockLabel: "SENTINEL-NOLOCK",
      } as unknown as RichTextMessages,
    };
    const { container } = render(RichTextEditor, { props: missing });
    await tick();
    const unlock = container.querySelector(
      ".st-rich-text-editor__unlock",
    ) as HTMLElement | null;
    expect(unlock).not.toBeNull();
    expect(unlock?.getAttribute("data-untranslated")).toBe("collab.unlockRequestLabel");
  });
});
