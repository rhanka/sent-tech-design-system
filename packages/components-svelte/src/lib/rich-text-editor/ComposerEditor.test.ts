/**
 * CL-2 RED — composer witnesses on the Svelte string surface (spec §6.2.1).
 *
 * Witness 7: controlled string round-trip, `ComposerKeyEvent` forwarding
 * (Enter/mention keys with modifiers, `isComposing`, working
 * `preventDefault`/`stopPropagation`; a host-handled Enter inserts no
 * newline), `captureComposer()`/`readiness()` deferred capture, and the
 * three B1 per-mount inertness postures. Witness 8 (jsdom parts): flagged
 * draft stays intact unsent, clear-after-send empties the composer,
 * message-edit Cancel/Send round-trips.
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
  ComposerKeyEvent,
  RichTextMessages,
} from "@sentropic/design-system-rich-text";
import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
import ComposerEditor from "./ComposerEditor.svelte";
import type { ComposerEditorProps } from "./ComposerEditor.svelte";

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

const MESSAGES: RichTextMessages = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

function makeAllocator(): () => string {
  let sequence = 0;
  return () => `test:composer:${(sequence += 1)}`;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function composerProps(extra?: Partial<ComposerEditorProps>): ComposerEditorProps {
  return {
    value: "",
    messages: { ...MESSAGES },
    allocateId: makeAllocator(),
    ...extra,
  };
}

function editableOf(container: HTMLElement): HTMLElement {
  const editable = container.querySelector(".ProseMirror") as HTMLElement | null;
  expect(editable).not.toBeNull();
  return editable as HTMLElement;
}

function compositionStart(editable: HTMLElement): void {
  editable.dispatchEvent(
    new CompositionEvent("compositionstart", { bubbles: true }),
  );
}

function compositionEnd(editable: HTMLElement): void {
  editable.dispatchEvent(
    new CompositionEvent("compositionend", { bubbles: true }),
  );
}

describe("composer string round-trip (CL-2 witness 7, RED)", () => {
  it("mounts the host string and emits strings, never documents", async () => {
    const seen: string[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "first\n\nsecond",
        onChange: (text) => {
          seen.push(text);
        },
      }),
    });
    await tick();
    expect(editableOf(container).textContent).toContain("first");
    expect(editableOf(container).textContent).toContain("second");
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "!");
    await tick();
    expect(seen).toEqual(["first!\n\nsecond"]);
  });

  it("a host echo of the emitted string applies nothing and raises no conflict", async () => {
    const seen: string[] = [];
    const initial = composerProps({
      value: "",
      onChange: (text) => {
        seen.push(text);
      },
    });
    const { rerender } = render(ComposerEditor, { props: initial });
    await tick();
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "hi");
    await tick();
    expect(seen).toEqual(["hi"]);
    await rerender({ ...initial, value: "hi" });
    await tick();
    expect(seen).toEqual(["hi"]);
    expect(lastCore().getDocument().blocks).toHaveLength(1);
  });
});

describe("composer key forwarding (CL-2 witness 7, RED)", () => {
  it("forwards Enter with modifiers and composition facts", async () => {
    const forwarded: ComposerKeyEvent[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello",
        onKeyDown: (event) => {
          forwarded.push(event);
        },
      }),
    });
    await tick();
    await fireEvent.keyDown(editableOf(container), {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0]).toMatchObject({
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      isComposing: false,
    });
  });

  it("forwards mention triggers and keys during composition flagged isComposing", async () => {
    const forwarded: ComposerKeyEvent[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello ",
        onKeyDown: (event) => {
          forwarded.push(event);
        },
      }),
    });
    await tick();
    const editable = editableOf(container);
    await fireEvent.keyDown(editable, { key: "@", code: "Digit2" });
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0]?.key).toBe("@");
    compositionStart(editable);
    await fireEvent.keyDown(editable, { key: "Enter", code: "Enter" });
    expect(forwarded).toHaveLength(2);
    expect(forwarded[1]).toMatchObject({ key: "Enter", isComposing: true });
    compositionEnd(editable);
    await tick();
  });

  it("a host-handled Enter inserts no newline and performs no default action", async () => {
    const seen: string[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello",
        onChange: (text) => {
          seen.push(text);
        },
        onKeyDown: () => true,
      }),
    });
    await tick();
    await fireEvent.keyDown(editableOf(container), { key: "Enter", code: "Enter" });
    await tick();
    expect(lastCore().getDocument().blocks).toHaveLength(1);
    expect(lastCore().getDocument().blocks[0]).toMatchObject({ text: "hello" });
    expect(seen).toEqual([]);
  });

  it("preventDefault marks the key handled with the same no-newline outcome", async () => {
    const seen: string[] = [];
    let observedPrevented: boolean | null = null;
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello",
        onChange: (text) => {
          seen.push(text);
        },
        onKeyDown: (event) => {
          event.preventDefault();
          observedPrevented = event.defaultPrevented;
        },
      }),
    });
    await tick();
    await fireEvent.keyDown(editableOf(container), { key: "Enter", code: "Enter" });
    await tick();
    expect(observedPrevented).toBe(true);
    expect(lastCore().getDocument().blocks).toHaveLength(1);
    expect(seen).toEqual([]);
  });

  it("stopPropagation keeps the key from reaching the editor pipeline", async () => {
    const seen: string[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello",
        onChange: (text) => {
          seen.push(text);
        },
        onKeyDown: (event) => {
          event.stopPropagation();
        },
      }),
    });
    await tick();
    const editable = editableOf(container);
    let mountSawKey = 0;
    const mount = container.querySelector(
      ".st-rich-text-editor__surface",
    ) as HTMLElement;
    mount.addEventListener("keydown", () => {
      mountSawKey += 1;
    });
    await fireEvent.keyDown(editable, { key: "Enter", code: "Enter" });
    await tick();
    expect(mountSawKey).toBe(0);
    expect(lastCore().getDocument().blocks).toHaveLength(1);
    expect(seen).toEqual([]);
  });

  it("an unhandled Enter keeps the ordinary editing action", async () => {
    const seen: string[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "hello",
        onChange: (text) => {
          seen.push(text);
        },
        onKeyDown: () => undefined,
      }),
    });
    await tick();
    const editable = editableOf(container);
    const view = lastCore().view;
    const { state } = view;
    const end = state.doc.content.size - 1;
    view.dispatch(
      state.tr.setSelection(
        (await import("@tiptap/pm/state")).TextSelection.create(state.doc, end, end),
      ),
    );
    await fireEvent.keyDown(editable, { key: "Enter", code: "Enter" });
    await tick();
    expect(seen.length).toBeGreaterThan(0);
  });
});

describe("composer capture and readiness (CL-2 witness 7, RED)", () => {
  it("captureComposer resolves the committed text once after a deferred composition", async () => {
    const seen: string[] = [];
    const readiness: Array<{ composing: boolean; ready: boolean }> = [];
    const { component, container } = render(ComposerEditor, {
      props: composerProps({
        value: "",
        onChange: (text) => {
          seen.push(text);
        },
        onReadinessChange: (event) => {
          readiness.push({ ...event });
        },
      }),
    });
    await tick();
    const editable = editableOf(container);
    compositionStart(editable);
    await tick();
    expect(component.readiness()).toMatchObject({ composing: true, ready: false });
    let settled = 0;
    let text: string | null = null;
    void component.captureComposer().then((captured) => {
      settled += 1;
      text = captured.text;
    });
    await sleep(50);
    expect(settled).toBe(0);
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "caf\u00e9");
    compositionEnd(editable);
    await sleep(50);
    await tick();
    expect(seen).toEqual(["caf\u00e9"]);
    expect(settled).toBe(1);
    expect(text).toBe("caf\u00e9");
    expect(component.readiness()).toMatchObject({ composing: false, ready: true });
    expect(readiness).toEqual([
      { composing: true, ready: false },
      { composing: false, ready: true },
    ]);
  });

  it("a capture pending at unmount rejects exactly once with the neutral error", async () => {
    const { component, container, unmount } = render(ComposerEditor, {
      props: composerProps({ value: "" }),
    });
    await tick();
    compositionStart(editableOf(container));
    let settlements = 0;
    let name: string | null = null;
    let message: string | null = null;
    void component.captureComposer().then(
      () => {
        settlements += 1;
      },
      (error: Error) => {
        settlements += 1;
        name = error?.name ?? null;
        message = error?.message ?? null;
      },
    );
    await sleep(20);
    unmount();
    await sleep(50);
    expect(settlements).toBe(1);
    expect(name).toBe("RichTextCaptureUnavailable");
    expect(message).toBe("rich-text.capture-unavailable");
  });
});

describe("composer inertness postures (CL-2 witness 7, B1 mounts, RED)", () => {
  it("a disabled shell mount is inert and non-focusable", async () => {
    const seen: string[] = [];
    const { container } = render(ComposerEditor, {
      props: composerProps({
        value: "draft",
        disabled: true,
        onChange: (text) => {
          seen.push(text);
        },
      }),
    });
    await tick();
    const editable = editableOf(container);
    expect(editable.getAttribute("tabindex")).toBe("-1");
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "X");
    await tick();
    expect(seen).toEqual([]);
    expect(lastCore().getDocument().blocks[0]).toMatchObject({ text: "draft" });
  });

  it("an enabled mount stays typeable across unrelated host updates", async () => {
    const seen: string[] = [];
    const initial = composerProps({
      value: "",
      placeholder: "SENTINEL-A",
      onChange: (text) => {
        seen.push(text);
      },
    });
    const { rerender } = render(ComposerEditor, { props: initial });
    await tick();
    // The host updates presentation while "sending": the DS invents no
    // send state and the surface stays typeable.
    await rerender({ ...initial, placeholder: "SENTINEL-B" });
    await tick();
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "still typing");
    await tick();
    expect(seen).toEqual(["still typing"]);
  });
});

describe("composer send-safety surface (CL-2 witness 8, jsdom parts, RED)", () => {
  it("a flagged draft captures with its flag and stays intact unsent", async () => {
    const seen: string[] = [];
    const { component } = render(ComposerEditor, {
      props: composerProps({
        value: "",
        onChange: (text) => {
          seen.push(text);
        },
      }),
    });
    await tick();
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "# titre");
    await tick();
    expect(seen).toEqual(["# titre"]);
    const flagged = await component.captureComposer();
    expect(flagged.text).toBe("# titre");
    expect(flagged.representability.nonRepresentableParagraphIds).toEqual([id]);
    // The draft stays intact: capturing never rewrites it.
    expect(lastCore().getDocument().blocks[0]).toMatchObject({
      paragraphId: id,
      text: "# titre",
    });
  });

  it("clear-after-send empties the composer", async () => {
    const seen: string[] = [];
    const initial = composerProps({
      value: "",
      onChange: (text) => {
        seen.push(text);
      },
    });
    const { component, rerender } = render(ComposerEditor, { props: initial });
    await tick();
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(id, "hi");
    await tick();
    expect(seen).toEqual(["hi"]);
    // Host send: capture the same string that is sent, then clear by
    // replacing its value (B1 P9) — never a DS side effect.
    const sent = await component.captureComposer();
    expect(sent.text).toBe("hi");
    expect(sent.representability.nonRepresentableParagraphIds).toEqual([]);
    // Host protocol: the emitted string is adopted first (echo, applies
    // nothing), then the send clears by replacing the value (B1 P9).
    await rerender({ ...initial, value: "hi" });
    await tick();
    expect(seen).toEqual(["hi"]);
    await rerender({ ...initial, value: "" });
    await tick();
    const cleared = await component.captureComposer();
    expect(cleared.text).toBe("");
    expect(seen).toEqual(["hi"]);
  });

  it("message-edit Cancel restores the pre-edit string without emitting", async () => {
    const seen: string[] = [];
    const initial = composerProps({
      value: "orig",
      onChange: (text) => {
        seen.push(text);
      },
    });
    const { component, rerender } = render(ComposerEditor, { props: initial });
    await tick();
    const id = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().clearParagraph(id);
    lastCore().typeText(id, "edited");
    await tick();
    // Clearing is a real edit: the empty string is emitted first.
    expect(seen).toEqual(["", "edited"]);
    const sendable = await component.captureComposer();
    expect(sendable.text).toBe("edited");
    // Cancel: the host adopts the edit (echo) then restores the pre-edit
    // string; the restore applies silently and emits no send.
    await rerender({ ...initial, value: "edited" });
    await tick();
    expect(seen).toEqual(["", "edited"]);
    await rerender({ ...initial, value: "orig" });
    await tick();
    expect(seen).toEqual(["", "edited"]);
    const restored = await component.captureComposer();
    expect(restored.text).toBe("orig");
  });
});

describe("composer source hygiene (CL-2, RED)", () => {
  it("the component source carries no built-in label literal", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "ComposerEditor.svelte"),
      "utf8",
    );
    const markup = source.split("</script>").slice(-1)[0]?.split("<style")[0] ?? "";
    const literals = [...markup.matchAll(/>([^<>{}]+)</g)]
      .map((match) => (match[1] as string).trim())
      .filter((text) => text.length > 0);
    expect(literals).toEqual([]);
    const labelled = [...markup.matchAll(/(aria-label|placeholder)="([^"]+)"/g)].map(
      (match) => match[0],
    );
    expect(labelled).toEqual([]);
  });
});
