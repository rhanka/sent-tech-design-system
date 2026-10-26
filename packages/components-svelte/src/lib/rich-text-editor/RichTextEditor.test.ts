/**
 * RED 1–4, 6–8 component halves: the Svelte adapter surface.
 * Spec §11 RED 1–8 (component halves), §5–§7. Environment: J (jsdom shape of
 * `packages/components-svelte/vite.config.ts`).
 *
 * The adapter owns mounting, prop/event idioms and lifecycle over the
 * Tiptap-bound `"./editor"` factory; every gesture below runs against the
 * component-owned editor (never a second instance). Real-selection, real-IME
 * and real-network witnesses live in `RichTextEditor.browser.test.mjs`
 * (environment B); this file never substitutes a jsdom case for them.
 *
 * RED state: fails because the subpath (`RichTextEditor.svelte`, `index.ts`)
 * does not exist yet.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";

// jsdom implements no layout: `elementFromPoint` exists on neither
// `Element.prototype` nor `Document.prototype` there, while ProseMirror's
// mousedown path calls it on the editor root (the document in jsdom). Real
// browsers provide it (the real click/mousedown paths are witnessed in the
// browser suite, environment B); this shim keeps the jsdom assertions
// focused on event-isolation, never on coordinate mapping.
type ElementFromPointTarget = {
  elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};
for (const target of [Element.prototype, Document.prototype] as unknown as ElementFromPointTarget[]) {
  if (typeof target.elementFromPoint !== "function") {
    target.elementFromPoint = () => null;
  }
}
// ProseMirror's scroll/selection path queries layout boxes that jsdom does
// not implement on text nodes and ranges. Real browsers provide them (the
// real caret, scroll and composition paths are witnessed in the browser
// suite, environment B); these shims keep the jsdom assertions focused on
// documents and events, never on coordinate mapping.
{
  const textPrototype = globalThis.Text?.prototype as
    | { getClientRects?: unknown; getBoundingClientRect?: unknown }
    | undefined;
  if (textPrototype && typeof textPrototype.getClientRects !== "function") {
    Object.defineProperty(textPrototype, "getClientRects", {
      value: () => [],
      configurable: true,
    });
  }
  if (textPrototype && typeof textPrototype.getBoundingClientRect !== "function") {
    Object.defineProperty(textPrototype, "getBoundingClientRect", {
      value: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });
  }
  const rangePrototype = globalThis.Range?.prototype as
    | { getClientRects?: unknown; getBoundingClientRect?: unknown }
    | undefined;
  if (rangePrototype && typeof rangePrototype.getClientRects !== "function") {
    Object.defineProperty(rangePrototype, "getClientRects", {
      value: () => [],
      configurable: true,
    });
  }
  if (
    rangePrototype &&
    typeof rangePrototype.getBoundingClientRect !== "function"
  ) {
    Object.defineProperty(rangePrototype, "getBoundingClientRect", {
      value: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });
  }
}
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextMessages,
  RichTextUnsupportedPasteEvent,
} from "@sentropic/design-system-rich-text";
import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
import { TextSelection } from "@tiptap/pm/state";
import RichTextEditor from "./RichTextEditor.svelte";
import type { RichTextEditorProps } from "./RichTextEditor.svelte";
import RichTextEditorFixture from "./RichTextEditorFixture.svelte";
import RichTextEditorNestedFixture from "./RichTextEditorNestedFixture.svelte";

// Internal observation channel: the component exposes no editor object
// (spec §11 keeps editor/view objects out of the public API), so tests
// record the factory-constructed core instances and drive internal gestures
// through them, while every public-surface assertion reads emitted
// documents, capture results or the DOM.
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
};

const MARKDOWN: RichTextDocument["format"] = "focus.markdown.p0@1";
const PLAIN: RichTextDocument["format"] = "text/plain";

/** Fresh allocator per test: `test:id:<n>`, never a producer identity. */
function makeAllocator(): () => string {
  let sequence = 0;
  return () => `test:id:${(sequence += 1)}`;
}

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function preserved(id: string, kind: string, raw: string): RichTextBlock {
  return { paragraphId: id, kind: "preserved", preservedKind: kind, raw };
}

function twoParagraphs(): RichTextDocument {
  return {
    format: MARKDOWN,
    blocks: [paragraph("paragraph:1", "First"), paragraph("paragraph:2", "Second")],
  };
}

interface Collected {
  changes: RichTextChangeEvent[];
  conflicts: Array<{ incoming: RichTextDocument; local: RichTextDocument }>;
  unsupported: RichTextUnsupportedPasteEvent[];
  readiness: Array<{ composing: boolean; ready: boolean }>;
}

function collect(): Collected & {
  props: (extra?: Partial<RichTextEditorProps>) => RichTextEditorProps;
} {
  const changes: RichTextChangeEvent[] = [];
  const conflicts: Collected["conflicts"] = [];
  const unsupported: RichTextUnsupportedPasteEvent[] = [];
  const readiness: Collected["readiness"] = [];
  const allocateId = makeAllocator();
  return {
    changes,
    conflicts,
    unsupported,
    readiness,
    props: (extra?: Partial<RichTextEditorProps>) => ({
      value: twoParagraphs(),
      messages: { ...MESSAGES },
      allocateId,
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event);
      },
      onUnsupportedPaste: (event) => {
        unsupported.push(event);
      },
      onReadinessChange: (event) => {
        readiness.push({ ...event });
      },
      ...extra,
    }),
  };
}

function editableOf(container: HTMLElement): HTMLElement {
  const editable = container.querySelector(".ProseMirror") as HTMLElement | null;
  expect(editable).not.toBeNull();
  return editable as HTMLElement;
}

/** Synthetic paste through the real ProseMirror clipboard path. */
function dispatchPaste(
  editable: HTMLElement,
  payload: { html?: string; text?: string },
): void {
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

/** Every key of the event tree: the surface carries document, gesture and
    representability only — no before/after, no diff, no Focus key (§5.3). */
function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, entry]) => [key, ...allKeys(entry)]);
  }
  return [];
}

const FORBIDDEN_EVENT_KEYS = [
  "before",
  "after",
  "beforeAnchors",
  "anchors",
  "transactions",
  "changes",
];

function expectCleanSurface(event: RichTextChangeEvent): void {
  expect(Object.keys(event).sort()).toEqual([
    "document",
    "gesture",
    "representability",
  ]);
  for (const key of allKeys(event)) {
    expect(
      FORBIDDEN_EVENT_KEYS.includes(key),
      `emitted surface must not carry "${key}"`,
    ).toBe(false);
  }
}

describe("editable/disabled states (RED 1, viewer case)", () => {
  it("editable={false} is inert: typing, paste and shortcuts change nothing", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({ editable: false, value: twoParagraphs() }),
    });
    const editor = lastCore();
    expect(editor).not.toBeNull();
    const before = editor?.getDocument();
    // Simulated typing through the owned editor and through the DOM.
    editor?.typeText("paragraph:1", "X");
    editor?.paste({ text: "pasted" });
    await fireEvent.keyDown(editableOf(container), { key: "Enter" });
    dispatchPaste(editableOf(container), { text: "pasted" });
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(collected.unsupported).toHaveLength(0);
    expect(editor?.getDocument()).toEqual(before);
  });

  it("the viewer lock is the named editable={false} case", async () => {
    const collected = collect();
    render(RichTextEditor, {
      // Viewer case: a host rendering for a viewer passes editable={false}.
      props: collected.props({ editable: false, value: twoParagraphs() }),
    });
    const editor = lastCore();
    editor?.typeText("paragraph:1", "viewer text");
    editor?.undo();
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(editor?.getDocument().blocks[0]).toEqual(
      paragraph("paragraph:1", "First"),
    );
  });

  it("disabled={true} wins over editable and is inert", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({
        editable: true,
        disabled: true,
        value: twoParagraphs(),
      }),
    });
    const editor = lastCore();
    editor?.typeText("paragraph:1", "X");
    editor?.paste({ text: "pasted" });
    await fireEvent.keyDown(editableOf(container), { key: "Enter" });
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(editor?.getDocument().blocks).toHaveLength(2);
  });

  it("read-only stays focusable with no disabled state; disabled is exposed and untabbable", async () => {
    const collected = collect();
    const input = twoParagraphs();
    const { container, rerender } = render(RichTextEditor, {
      props: collected.props({ editable: false, value: input }),
    });
    await tick();
    const editable = editableOf(container);
    expect(editable.getAttribute("aria-disabled")).toBe("false");
    expect(editable.getAttribute("tabindex")).toBe("0");
    // Live transition to disabled: exposed, removed from the tab order.
    await rerender(collected.props({ editable: false, disabled: true, value: input }));
    await tick();
    const disabledEditable = editableOf(container);
    expect(disabledEditable).toBe(editable);
    expect(disabledEditable.getAttribute("aria-disabled")).toBe("true");
    expect(disabledEditable.getAttribute("tabindex")).toBe("-1");
    // Disabled stays inert through the transition; the transition itself
    // emits nothing and changes nothing.
    lastCore().typeText("paragraph:1", "X");
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(lastCore().getDocument()).toEqual(input);
    // Live transition back to editable: the disabled state clears.
    await rerender(
      collected.props({ editable: true, disabled: false, value: input }),
    );
    await tick();
    expect(editableOf(container).getAttribute("aria-disabled")).toBe("false");
    expect(editableOf(container).getAttribute("tabindex")).toBe("0");
    expect(collected.changes).toHaveLength(0);
  });

  it("a disabled editor takes no focus by pointer click or programmatic focus, across live transitions", async () => {
    const collected = collect();
    const input = twoParagraphs();
    const { container, rerender } = render(RichTextEditor, {
      props: collected.props({ disabled: true, value: input }),
    });
    await tick();
    const editable = editableOf(container);
    const inside = (): boolean =>
      container.contains(globalThis.document.activeElement) &&
      globalThis.document.activeElement !== null &&
      globalThis.document.activeElement !== globalThis.document.body;
    // Programmatic focus on a disabled editor lands nowhere inside.
    editable.focus();
    await tick();
    expect(inside()).toBe(false);
    // Pointer click on a disabled paragraph takes no focus either: the
    // mousedown default (which moves focus) is prevented while disabled.
    const mousedown = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });
    const prevented = !editable.dispatchEvent(mousedown);
    editable.click();
    await tick();
    expect(prevented).toBe(true);
    expect(inside()).toBe(false);
    // Live transition to enabled: the same gestures focus again.
    await rerender(collected.props({ disabled: false, value: input }));
    await tick();
    editable.focus();
    await tick();
    expect(globalThis.document.activeElement).toBe(editable);
    (globalThis.document.activeElement as HTMLElement | null)?.blur();
    await tick();
    // Live transition to read-only: still focusable with its caret.
    await rerender(
      collected.props({ editable: false, disabled: false, value: input }),
    );
    await tick();
    editable.focus();
    await tick();
    expect(globalThis.document.activeElement).toBe(editable);
    (globalThis.document.activeElement as HTMLElement | null)?.blur();
    await tick();
    // Live transition back to disabled: focus is refused again, and a
    // focused editor loses focus on entering the disabled state.
    editable.focus();
    await tick();
    expect(globalThis.document.activeElement).toBe(editable);
    await rerender(
      collected.props({ editable: false, disabled: true, value: input }),
    );
    await tick();
    expect(inside()).toBe(false);
    editable.focus();
    await tick();
    expect(inside()).toBe(false);
    expect(collected.changes).toHaveLength(0);
  });
});

describe("no-change cycle (RED 2, component half)", () => {
  it("mount, focus, blur and unmount emit nothing and keep block identity", async () => {
    const collected = collect();
    const input = twoParagraphs();
    const { container, unmount } = render(RichTextEditor, {
      props: collected.props({ value: input }),
    });
    const editable = editableOf(container);
    editable.focus();
    await tick();
    editable.blur();
    await tick();
    expect(collected.changes).toHaveLength(0);
    expect(collected.readiness).toHaveLength(0);
    unmount();
    await tick();
    expect(collected.changes).toHaveLength(0);
  });
});

describe("paragraph identity (RED 3, component half)", () => {
  it("split names the source and the fresh tail; merge names survivor and retired", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({ value: twoParagraphs() }),
    });
    const editor = lastCore();
    expect(editor).not.toBeNull();
    editor?.splitParagraph("paragraph:1", "First".length);
    await tick();
    expect(collected.changes).toHaveLength(1);
    const split = collected.changes[0] as RichTextChangeEvent;
    expectCleanSurface(split);
    expect(split.gesture.kind).toBe("split");
    expect(split.gesture.split?.sourceParagraphId).toBe("paragraph:1");
    expect(split.gesture.split?.newParagraphIds).toHaveLength(1);
    const tail = split.gesture.split?.newParagraphIds[0] as string;
    expect(tail).not.toBe("paragraph:1");
    expect(split.document.blocks.map((block) => block.paragraphId)).toEqual([
      "paragraph:1",
      tail,
      "paragraph:2",
    ]);
    editor?.mergeWithPrevious(tail);
    await tick();
    expect(collected.changes).toHaveLength(2);
    const merge = collected.changes[1] as RichTextChangeEvent;
    expectCleanSurface(merge);
    expect(merge.gesture.kind).toBe("merge");
    expect(merge.gesture.merge?.survivingParagraphId).toBe("paragraph:1");
    expect(merge.gesture.merge?.retiredParagraphIds).toEqual([tail]);
    expect(merge.document.blocks.map((block) => block.paragraphId)).toEqual([
      "paragraph:1",
      "paragraph:2",
    ]);
  });

  it("undo of a delete restores the same identity; redo removes it again", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({ value: twoParagraphs() }),
    });
    const editor = lastCore();
    editor?.deleteBlocks(["paragraph:2"]);
    await tick();
    expect(collected.changes).toHaveLength(1);
    editor?.undo();
    await tick();
    expect(collected.changes).toHaveLength(2);
    expect(
      collected.changes[1]?.document.blocks.map((block) => block.paragraphId),
    ).toEqual(["paragraph:1", "paragraph:2"]);
    editor?.redo();
    await tick();
    expect(collected.changes).toHaveLength(3);
    expect(
      collected.changes[2]?.document.blocks.map((block) => block.paragraphId),
    ).toEqual(["paragraph:1"]);
  });

  it("internal paste carries fresh identities; a forged identity never survives", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({ value: twoParagraphs() }),
    });
    const editor = lastCore();
    const payload = editor?.copyToPayload(["paragraph:1"]);
    expect(payload).toBeDefined();
    editor?.paste(payload as { text?: string; html?: string });
    await tick();
    expect(collected.changes).toHaveLength(1);
    const internal = collected.changes[0] as RichTextChangeEvent;
    expect(internal.gesture.kind).toBe("paste");
    expect(internal.gesture.paste?.origin).toBe("internal");
    const inserted = internal.gesture.paste?.insertedParagraphIds ?? [];
    expect(inserted.length).toBeGreaterThan(0);
    expect(inserted).not.toContain("paragraph:1");
    const forgedCount = collected.changes.length;
    editor?.paste({
      text: "forged",
      html: '<p data-paragraph-id="paragraph:forged">forged</p>',
    });
    await tick();
    expect(collected.changes.length).toBeGreaterThan(forgedCount);
    const external = collected.changes[
      collected.changes.length - 1
    ] as RichTextChangeEvent;
    expect(external.gesture.paste?.origin).toBe("external");
    expect(
      external.document.blocks.map((block) => block.paragraphId),
    ).not.toContain("paragraph:forged");
  });

  it("A → B → A emits documents B then A with no DS-computed delta", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({
        value: {
          format: MARKDOWN,
          blocks: [paragraph("paragraph:1", "A")],
        },
      }),
    });
    const editor = lastCore();
    editor?.typeText("paragraph:1", " typed");
    await tick();
    editor?.undo();
    await tick();
    expect(collected.changes).toHaveLength(2);
    for (const event of collected.changes) expectCleanSurface(event);
    expect(
      collected.changes.map((event) => event.document.blocks[0]?.text),
    ).toEqual(["A typed", "A"]);
  });
});

describe("Enter at end of paragraph (RED 3, text/plain, allowed locally)", () => {
  it("Enter with the caret at the end splits: the empty tail is fresh, one split event", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({
        value: { format: PLAIN, blocks: [paragraph("paragraph:1", "A")] },
      }),
    });
    const editor = lastCore();
    editor?.splitParagraph("paragraph:1", 1);
    await tick();
    expect(collected.changes).toHaveLength(1);
    const event = collected.changes[0] as RichTextChangeEvent;
    expectCleanSurface(event);
    expect(event.gesture.kind).toBe("split");
    expect(event.document.blocks).toEqual([
      paragraph("paragraph:1", "A"),
      {
        paragraphId: event.gesture.split?.newParagraphIds[0] as string,
        kind: "paragraph",
        text: "",
      },
    ]);
    expect(event.gesture.split?.sourceParagraphId).toBe("paragraph:1");
  });
});

describe("clear a field containing separators (RED 3, text/plain, allowed locally)", () => {
  it("selecting and clearing the whole content leaves the single controlled empty block", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({
        // Host-segmented input from the source "A\n\nB": two paragraphs.
        // The DS test segments nothing and stores no separator.
        value: {
          format: PLAIN,
          blocks: [paragraph("paragraph:1", "A"), paragraph("paragraph:2", "B")],
        },
      }),
    });
    const editable = editableOf(container);
    editable.focus();
    await tick();
    await fireEvent.keyDown(editable, { key: "a", ctrlKey: true });
    await fireEvent.keyDown(editable, { key: "Backspace" });
    await tick();
    expect(collected.changes).toHaveLength(1);
    const event = collected.changes[0] as RichTextChangeEvent;
    expectCleanSurface(event);
    expect(event.document.blocks).toEqual([
      { paragraphId: "paragraph:1", kind: "paragraph", text: "" },
    ]);
  });
});

describe("Enter right after an interior newline (RED 3, text/plain, allowed locally)", () => {
  it("the head keeps its trailing newline and the tail is fresh", async () => {
    const collected = collect();
    render(RichTextEditor, {
      props: collected.props({
        // One host-segmented paragraph holding the interior newline (§5.1):
        // mounts as one block, never two.
        value: { format: PLAIN, blocks: [paragraph("paragraph:1", "A\nB")] },
      }),
    });
    const editor = lastCore();
    expect(
      editor?.getDocument().blocks.map((block) => block.paragraphId),
    ).toEqual(["paragraph:1"]);
    // Caret immediately after the interior newline (offset 2 of "A\nB").
    editor?.splitParagraph("paragraph:1", 2);
    await tick();
    expect(collected.changes).toHaveLength(1);
    const event = collected.changes[0] as RichTextChangeEvent;
    expectCleanSurface(event);
    expect(event.gesture.kind).toBe("split");
    expect(event.gesture.split?.sourceParagraphId).toBe("paragraph:1");
    const tail = event.gesture.split?.newParagraphIds[0] as string;
    expect(event.document.blocks).toEqual([
      paragraph("paragraph:1", "A\n"),
      paragraph(tail, "B"),
    ]);
  });
});

describe("echo acknowledgement (RED 4, J document half)", () => {
  it("the controlled echo records acknowledgement without replacement, then C applies", async () => {
    const collected = collect();
    const docA: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "A")],
    };
    const docB: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "B")],
    };
    const docC: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "C")],
    };
    const { component, rerender } = render(RichTextEditor, {
      props: collected.props({ value: docA }),
    });
    const editor = lastCore();
    const instanceBefore = editor;
    // Rewrite the single paragraph A → B through edit gestures.
    editor?.clearParagraph("paragraph:1");
    editor?.typeText("paragraph:1", "B");
    await tick();
    const typed = collected.changes[collected.changes.length - 1];
    expect(typed?.document.blocks[0]?.text).toBe("B");
    // Rule 1: the echo suppresses replacement and records acknowledgement.
    await rerender(collected.props({ value: docB }));
    await tick();
    expect(collected.conflicts).toHaveLength(0);
    expect(lastCore()).toBe(instanceBefore);
    // Rule 4: C arrives with no intervening local edit and applies cleanly.
    await rerender(collected.props({ value: docC }));
    await tick();
    expect(collected.conflicts).toHaveLength(0);
    expect(component.captureDocument).toBeDefined();
    const captured = await component.captureDocument();
    expect(captured.document).toEqual(docC);
  });

  it("an update confined to a preserved raw applies without conflict", async () => {
    const collected = collect();
    const rawBefore = "| a |\n|---|\n| 1 |";
    const rawAfter = "| a |\n|---|\n| 2 |";
    const before: RichTextDocument = {
      format: MARKDOWN,
      blocks: [
        paragraph("paragraph:1", "Intro"),
        preserved("paragraph:2", "table", rawBefore),
      ],
    };
    const after: RichTextDocument = {
      format: MARKDOWN,
      blocks: [
        paragraph("paragraph:1", "Intro"),
        preserved("paragraph:2", "table", rawAfter),
      ],
    };
    const { container, rerender } = render(RichTextEditor, {
      props: collected.props({ value: before }),
    });
    await rerender(collected.props({ value: after }));
    await tick();
    expect(collected.conflicts).toHaveLength(0);
    expect(collected.changes).toHaveLength(0);
    const region = container.querySelector(
      '[data-preserved-block="table"]',
    ) as HTMLElement | null;
    expect(region).not.toBeNull();
    expect(region?.textContent).toBe(rawAfter);
  });
});

describe("serialisation-equal divergence (RED 4, J document half)", () => {
  it("a wire-identical draft still conflicts: the revision flag decides, never wire equality", async () => {
    const collected = collect();
    const empty: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "")],
    };
    const external: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "C")],
    };
    const { rerender } = render(RichTextEditor, {
      props: collected.props({ value: empty }),
    });
    const editor = lastCore();
    // Three spaces: the live content is [text("   ")] while the bridge
    // serialises it to "" — the displayed wire still equals the acknowledged
    // wire, yet the typing transaction set the unacknowledged-local-revision
    // flag (§5.6 witness).
    editor?.typeText("paragraph:1", "   ");
    await tick();
    expect(editor?.view.state.doc.textContent).toBe("   ");
    await rerender(collected.props({ value: external }));
    await tick();
    // Rule 3 fires: the spaces stay live, C is not applied, one conflict.
    expect(collected.conflicts).toHaveLength(1);
    expect(collected.conflicts[0]?.incoming).toEqual(external);
    expect(editor?.view.state.doc.textContent).toBe("   ");
    expect(editor?.getDocument().blocks[0]?.text).toBe("");
  });
});

describe("locale change never replays the value (review finding 1)", () => {
  const externalC = (): RichTextDocument => ({
    format: MARKDOWN,
    blocks: [paragraph("paragraph:1", "C")],
  });

  it.each([
    ["focused", true],
    ["blurred", false],
  ])(
    "whitespace draft survives a locale change, then conflicts on external update (%s)",
    async (_label, focused) => {
      const collected = collect();
      const empty: RichTextDocument = {
        format: MARKDOWN,
        blocks: [paragraph("paragraph:1", "")],
      };
      const { container, rerender } = render(RichTextEditor, {
        props: collected.props({ value: empty }),
      });
      const editor = lastCore();
      editor.typeText("paragraph:1", "   ");
      await tick();
      expect(editor.view.state.doc.textContent).toBe("   ");
      const editable = editableOf(container);
      if (focused) editable.focus();
      else {
        editable.focus();
        editable.blur();
      }
      await tick();
      // Locale switch with the value unchanged: no replay, no conflict,
      // no change event — the silent draft stays untouched.
      await rerender(
        collected.props({
          value: empty,
          messages: { ...MESSAGES, placeholder: "SENTINEL-PLACEHOLDER-2" },
        }),
      );
      await tick();
      expect(collected.conflicts).toHaveLength(0);
      expect(collected.changes).toHaveLength(1);
      expect(editor.view.state.doc.textContent).toBe("   ");
      // The later external update conflicts instead of silently winning.
      await rerender(collected.props({ value: externalC() }));
      await tick();
      expect(collected.conflicts).toHaveLength(1);
      expect(collected.conflicts[0]?.incoming.blocks[0]?.text).toBe("C");
      expect(collected.changes).toHaveLength(1);
      expect(editor.view.state.doc.textContent).toBe("   ");
    },
  );

  it.each([
    ["focused", true],
    ["blurred", false],
  ])(
    "ordinary text plus a locale change raises no spurious conflict (%s)",
    async (_label, focused) => {
      const collected = collect();
      const start: RichTextDocument = {
        format: MARKDOWN,
        blocks: [paragraph("paragraph:1", "A")],
      };
      const { container, rerender } = render(RichTextEditor, {
        props: collected.props({ value: start }),
      });
      const editor = lastCore();
      editor.typeText("paragraph:1", " typed");
      await tick();
      const editable = editableOf(container);
      if (focused) editable.focus();
      else {
        editable.focus();
        editable.blur();
      }
      await tick();
      // Same value, new catalogue: the update effect must not run, so no
      // conflict surfaces for a change the host never made.
      await rerender(
        collected.props({
          value: start,
          messages: { ...MESSAGES, placeholder: "SENTINEL-PLACEHOLDER-2" },
        }),
      );
      await tick();
      expect(collected.conflicts).toHaveLength(0);
      expect(editor.view.state.doc.textContent).toBe("A typed");
      // The genuine divergence still surfaces exactly once afterwards.
      await rerender(collected.props({ value: externalC() }));
      await tick();
      expect(collected.conflicts).toHaveLength(1);
      expect(collected.conflicts[0]?.local.blocks[0]?.text).toBe("A typed");
    },
  );
});

describe("reactive placeholder (review finding 2)", () => {
  it("a locale change re-renders the paragraph placeholder in place", async () => {
    const collected = collect();
    const empty: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "")],
    };
    const countBefore = coreCount();
    const { container, rerender } = render(RichTextEditor, {
      props: collected.props({ value: empty }),
    });
    await tick();
    const instanceBefore = lastCore();
    const showing = (): HTMLElement | null =>
      container.querySelector(
        ".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]",
      ) as HTMLElement | null;
    expect(showing()?.getAttribute("data-placeholder")).toBe(
      "SENTINEL-PLACEHOLDER",
    );
    await rerender(
      collected.props({
        value: empty,
        messages: { ...MESSAGES, placeholder: "SENTINEL-PLACEHOLDER-2" },
      }),
    );
    await tick();
    // No remount, no change event; the paragraph carries the new text.
    expect(coreCount()).toBe(countBefore + 1);
    expect(lastCore()).toBe(instanceBefore);
    expect(collected.changes).toHaveLength(0);
    expect(showing()?.getAttribute("data-placeholder")).toBe(
      "SENTINEL-PLACEHOLDER-2",
    );
    expect(showing()?.getAttribute("data-untranslated")).toBeNull();
    // Typing and deleting a character keeps the new catalogue text: the
    // decoration rebuild reads the live value, not the mount string.
    lastCore().typeText("paragraph:1", "x");
    await tick();
    lastCore().clearParagraph("paragraph:1");
    await tick();
    expect(showing()?.getAttribute("data-placeholder")).toBe(
      "SENTINEL-PLACEHOLDER-2",
    );
  });

  it("a missing placeholder renders the marker on the paragraph", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({
        value: { format: MARKDOWN, blocks: [paragraph("paragraph:1", "")] },
        messages: {} as unknown as RichTextMessages,
      }),
    });
    await tick();
    const showing = container.querySelector(
      ".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]",
    );
    expect(showing).not.toBeNull();
    expect(showing?.getAttribute("data-placeholder")).toBe(
      "⟦untranslated:rich-text.placeholder⟧",
    );
    expect(showing?.getAttribute("data-untranslated")).toBe(
      "rich-text.placeholder",
    );
  });
});

describe("nested controlled updates (review finding P2-1)", () => {
  it("a host $state update of value.blocks[0].text without replacing the reference reaches the editor", async () => {
    const collected = collect();
    const initial: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "Alpha one")],
    };
    const { component } = render(RichTextEditorNestedFixture, {
      props: {
        initial,
        messages: { ...MESSAGES },
        allocateId: makeAllocator(),
        onChange: (event: RichTextChangeEvent) => {
          collected.changes.push(event);
        },
        onExternalConflict: (event) => {
          collected.conflicts.push(event);
        },
        onUnsupportedPaste: (event) => {
          collected.unsupported.push(event);
        },
        onReadinessChange: (event) => {
          collected.readiness.push({ ...event });
        },
      },
    });
    await tick();
    const editor = lastCore();
    expect(editor.getDocument().blocks[0]?.text).toBe("Alpha one");
    // In-place nested mutation: the reference never changes.
    const before = (component as unknown as { currentValue(): RichTextDocument }).currentValue();
    (component as unknown as { updateNestedText(text: string): void }).updateNestedText("HOST-C");
    await tick();
    const after = (component as unknown as { currentValue(): RichTextDocument }).currentValue();
    expect(after).toBe(before);
    expect(after.blocks[0]).toEqual(paragraph("paragraph:1", "HOST-C"));
    expect(editor.getDocument().blocks[0]?.text).toBe("HOST-C");
    expect(collected.conflicts).toHaveLength(0);
  });

  it("a nested update against a local draft raises the conflict path", async () => {
    const collected = collect();
    const initial: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "Alpha one")],
    };
    const { component } = render(RichTextEditorNestedFixture, {
      props: {
        initial,
        messages: { ...MESSAGES },
        allocateId: makeAllocator(),
        onChange: (event: RichTextChangeEvent) => {
          collected.changes.push(event);
        },
        onExternalConflict: (event) => {
          collected.conflicts.push(event);
        },
        onUnsupportedPaste: (event) => {
          collected.unsupported.push(event);
        },
        onReadinessChange: (event) => {
          collected.readiness.push({ ...event });
        },
      },
    });
    await tick();
    const editor = lastCore();
    editor.typeText("paragraph:1", " local");
    await tick();
    expect(collected.changes).toHaveLength(1);
    (component as unknown as { updateNestedText(text: string): void }).updateNestedText("HOST-C");
    await tick();
    expect(collected.conflicts).toHaveLength(1);
    expect(collected.conflicts[0]?.incoming.blocks[0]?.text).toBe("HOST-C");
    expect(editor.getDocument().blocks[0]?.text).toBe("Alpha one local");
  });
});

describe("parent selection isolation (RED 6)", () => {
  it("typing, clicking and selecting inside the editor never reach the card handler", async () => {
    const onCardSelect = vi.fn();
    const collected = collect();
    const { container } = render(RichTextEditorFixture, {
      props: {
        ...collected.props({ value: twoParagraphs() }),
        onCardSelect,
      },
    });
    const card = container.querySelector(
      '[data-testid="editor-card"]',
    ) as HTMLElement;
    const editable = editableOf(container);
    await fireEvent.keyDown(editable, { key: "a" });
    await fireEvent.keyUp(editable, { key: "a" });
    await fireEvent.click(editable);
    await fireEvent.mouseDown(editable);
    await fireEvent.mouseUp(editable);
    await tick();
    expect(onCardSelect).not.toHaveBeenCalled();
    const outside = container.querySelector(
      '[data-testid="outside-card"]',
    ) as HTMLElement;
    await fireEvent.click(outside);
    expect(onCardSelect).toHaveBeenCalledTimes(1);
    expect(card).not.toBeNull();
  });
});

describe("hostile paste (RED 7, jsdom half)", () => {
  it("scriptable markup is inert: no script, handler, link or image survives", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({ value: twoParagraphs() }),
    });
    const editable = editableOf(container);
    dispatchPaste(editable, {
      html: '<p>Hello <img src="https://example.com/x.png" onerror="alert(1)" alt="pic"><a href="javascript:alert(2)">click</a></p><script>alert(3)</script>',
      text: "Hello pic click",
    });
    await tick();
    const editor = lastCore();
    const after = editor?.getDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[onerror]")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    const texts = (after?.blocks ?? [])
      .map((block) => block.text ?? "")
      .join("\n");
    expect(texts).toContain("Hello");
  });

  it.each([
    {
      name: "markdown table",
      payload: { text: "| a | b |\n|---|---|\n| 1 | 2 |" },
      kinds: ["table"],
    },
    {
      name: "fenced code block",
      payload: { text: "```js\nconst x = 1;\n```" },
      kinds: ["codeBlock"],
    },
    {
      name: "html table element",
      payload: { html: "<table><tr><td>x</td></tr></table>", text: "x" },
      kinds: ["table"],
    },
    {
      name: "heading line",
      payload: { text: "# Title" },
      kinds: ["heading"],
    },
    {
      name: "list lines",
      payload: { text: "- a\n- b" },
      kinds: ["list"],
    },
  ])(
    "a paste that would create $name is refused whole (DS side only)",
    async ({ payload, kinds }) => {
      const collected = collect();
      const { container } = render(RichTextEditor, {
        props: collected.props({ value: twoParagraphs() }),
      });
      const editor = lastCore();
      const before = editor?.getDocument();
      const selectionBefore = editor?.getSelection();
      const changesBefore = collected.changes.length;
      dispatchPaste(editableOf(container), payload);
      await tick();
      expect(collected.unsupported).toHaveLength(1);
      expect(collected.unsupported[0]?.rejectedKinds).toEqual(
        expect.arrayContaining(kinds),
      );
      expect(collected.changes).toHaveLength(changesBefore);
      expect(editor?.getDocument()).toEqual(before);
      expect(editor?.getSelection()).toEqual(selectionBefore);
    },
  );
});

describe("messages and lifecycle (RED 8, jsdom half)", () => {
  it("renders exactly the injected sentinel strings, no built-in label", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({
        value: {
          format: MARKDOWN,
          blocks: [
            paragraph("paragraph:1", ""),
            preserved("paragraph:2", "table", "| a |"),
          ],
        },
      }),
    });
    await tick();
    const editable = editableOf(container);
    expect(editable.getAttribute("aria-label")).toBe("SENTINEL-EDITOR-LABEL");
    expect(editable.getAttribute("data-placeholder")).toBeNull();
    // Tiptap decorates only the current empty node (showOnlyCurrent): move
    // the caret into the empty first paragraph, as a user focusing the
    // field does, before asserting the visible placeholder.
    {
      const core = lastCore();
      const { state } = core.view;
      core.view.dispatch(
        state.tr.setSelection(TextSelection.create(state.doc, 1, 1)),
      );
      await tick();
    }
    const showing = container.querySelector(
      ".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]",
    );
    expect(showing?.getAttribute("data-placeholder")).toBe(
      "SENTINEL-PLACEHOLDER",
    );
    const region = container.querySelector(
      '[data-preserved-block="table"]',
    ) as HTMLElement | null;
    expect(region?.getAttribute("aria-label")).toBe("SENTINEL-PRESERVED-table");
    expect(container.querySelector(".st-rich-text-editor__status")?.textContent).toBe(
      "SENTINEL-CONFLICT",
    );
  });

  it("a missing key renders the untranslated marker with its data attribute", async () => {
    const collected = collect();
    const { container } = render(RichTextEditor, {
      props: collected.props({
        value: twoParagraphs(),
        messages: {} as unknown as RichTextMessages,
      }),
    });
    await tick();
    const editable = editableOf(container);
    expect(editable.getAttribute("aria-label")).toBe(
      "⟦untranslated:rich-text.editorLabel⟧",
    );
    expect(editable.getAttribute("data-untranslated")).toBe(
      "rich-text.editorLabel",
    );
    expect(
      container
        .querySelector(".st-rich-text-editor__status")
        ?.getAttribute("data-untranslated"),
    ).toBe("rich-text.externalConflictLabel");
  });

  it("the component source carries no built-in label literal", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "RichTextEditor.svelte"),
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

  it("unmount removes every listener, observer and task it created", async () => {
    const collected = collect();
    const added: Array<{
      target: EventTarget;
      type: string;
      listener: EventListener;
      capture: boolean;
    }> = [];
    const removed: Array<{
      target: EventTarget;
      type: string;
      listener: EventListener;
      capture: boolean;
    }> = [];
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;
    // Scheduled work tracked by actual id: an id leaves the pending set
    // only when its callback runs or its cancellation lands. Firing after
    // unmount is a violation, never a pass.
    const pendingTimeouts = new Map<unknown, string>();
    const pendingIntervals = new Map<unknown, string>();
    const pendingRaf = new Map<number, string>();
    const violations: string[] = [];
    let unmounted = false;
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    const OriginalRAF =
      typeof globalThis.requestAnimationFrame === "function"
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : undefined;
    const OriginalCancelRAF =
      typeof globalThis.cancelAnimationFrame === "function"
        ? globalThis.cancelAnimationFrame.bind(globalThis)
        : undefined;
    // Every observer class the component may create (§5.9): construction
    // and disconnection are recorded, and a callback firing after unmount
    // is a violation.
    const createdObservers: object[] = [];
    const disconnected = new Set<object>();
    const observerKinds = [
      "MutationObserver",
      "ResizeObserver",
      "IntersectionObserver",
    ] as const;
    const originalObservers = new Map<string, unknown>();
    try {
      EventTarget.prototype.addEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: AddEventListenerOptions | boolean,
      ): void {
        added.push({
          target: this,
          type,
          listener: listener as EventListener,
          capture:
            typeof options === "boolean" ? options : (options?.capture ?? false),
        });
        originalAdd.call(this, type, listener, options);
      };
      EventTarget.prototype.removeEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean,
      ): void {
        removed.push({
          target: this,
          type,
          listener: listener as EventListener,
          capture:
            typeof options === "boolean" ? options : (options?.capture ?? false),
        });
        originalRemove.call(this, type, listener, options);
      };
      for (const kind of observerKinds) {
        const Original = (globalThis as unknown as Record<string, unknown>)[
          kind
        ];
        if (typeof Original !== "function") continue;
        originalObservers.set(kind, Original);
        const disconnectOf = (
          Original as unknown as { prototype: { disconnect(): void } }
        ).prototype.disconnect;
        const Tracked = class extends (
          Original as new (
            callback: (...args: never[]) => void,
          ) => object
        ) {
          constructor(callback: (...args: never[]) => void) {
            super((...args: never[]) => {
              if (unmounted) {
                violations.push(`${kind} callback fired after unmount`);
                return;
              }
              callback(...args);
            });
            createdObservers.push(this);
          }
          disconnect(): void {
            disconnected.add(this);
            disconnectOf.call(this);
          }
        };
        (globalThis as unknown as Record<string, unknown>)[kind] = Tracked;
      }
      // Task ownership by scheduling stack: the adapter (`RichTextEditor.
      // svelte`) and the neutral factory (`packages/rich-text/src/`) schedule
      // no timer today, so any timer scheduled from those modules is a
      // component task and must be cancelled on unmount. Engine timers
      // (Tiptap mount/create, async-delete queue, ProseMirror observer
      // flush) carry no component callback: they settle silently, so they
      // run normally and only their completion is tracked. A component
      // callback firing after unmount is a violation, never a pass — hence
      // the unmounted guard on component-owned timeouts, and the teardown
      // snapshot below that a drain cannot hide.
      // Ownership by DIRECT scheduling site (first stack frame above this
      // mock): the adapter (`RichTextEditor.svelte`) and the neutral factory
      // (`packages/rich-text`, source-mapped to `src/`, built as `dist/`)
      // schedule no timer today, so a timer scheduled directly from those
      // modules is a component task. Engine timers scheduled deeper inside
      // Tiptap/ProseMirror — even when the call chain passed through the
      // factory during mount — classify as engine: their direct site is the
      // engine module. Test files never count as component tasks.
      const isComponentTask = (stack: string): boolean => {
        const site = stack.split("\n")[2] ?? "";
        return (
          /rich-text-editor\/RichTextEditor\.svelte/.test(site) ||
          /packages\/rich-text\/(src|dist)\/(?!.*\.test\.)/.test(site)
        );
      };
      globalThis.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
        const stack = new Error().stack ?? "";
        const owned = isComponentTask(stack);
        const wrapped = (...inner: unknown[]): void => {
          pendingTimeouts.delete(id);
          if (unmounted && owned) {
            violations.push(`timeout (${String(timeout)}) fired after unmount`);
            return;
          }
          (handler as (...called: unknown[]) => void)(...inner);
        };
        const id = originalSetTimeout(wrapped, timeout, ...(args as []));
        pendingTimeouts.set(id, `${owned ? "component" : "engine"} timeout@${String(timeout)}`);
        return id;
      }) as unknown as typeof setTimeout;
      globalThis.clearTimeout = ((id: unknown) => {
        pendingTimeouts.delete(id);
        return originalClearTimeout(id as ReturnType<typeof setTimeout>);
      }) as typeof clearTimeout;
      globalThis.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
        const wrapped = (...inner: unknown[]): void => {
          if (unmounted) {
            violations.push(`interval (${String(timeout)}) fired after unmount`);
            pendingIntervals.delete(id);
            return;
          }
          (handler as (...called: unknown[]) => void)(...inner);
        };
        const id = originalSetInterval(wrapped, timeout, ...(args as []));
        pendingIntervals.set(id, `interval@${String(timeout)}`);
        return id;
      }) as unknown as typeof setInterval;
      globalThis.clearInterval = ((id: unknown) => {
        pendingIntervals.delete(id);
        return originalClearInterval(id as ReturnType<typeof setInterval>);
      }) as typeof clearInterval;
      if (OriginalRAF !== undefined) {
        globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
          const id = OriginalRAF((time) => {
            pendingRaf.delete(id);
            if (unmounted) {
              violations.push("animation frame fired after unmount");
              return;
            }
            callback(time);
          });
          pendingRaf.set(id, "animation-frame");
          return id;
        }) as typeof requestAnimationFrame;
      }
      if (OriginalCancelRAF !== undefined) {
        globalThis.cancelAnimationFrame = ((id: number) => {
          pendingRaf.delete(id);
          return OriginalCancelRAF(id);
        }) as typeof cancelAnimationFrame;
      }
      const beforeCores = coreCount();
      const { container, unmount } = render(RichTextEditor, {
        props: collected.props({ value: twoParagraphs() }),
      });
      const root = container.querySelector(
        ".st-rich-text-editor",
      ) as EventTarget;
      await tick();
      expect(coreCount()).toBe(beforeCores + 1);
      // A further keystroke before unmount still emits through the listener.
      const editableBeforeUnmount = editableOf(container);
      await fireEvent.keyDown(editableBeforeUnmount, { key: "a" });
      const changesBefore = collected.changes.length;
      const conflictsBefore = collected.conflicts.length;
      const readinessBefore = collected.readiness.length;
      // Retain the editor target identities BEFORE teardown: after unmount
      // the editor DOM is detached, so `container.contains()` no longer
      // recognises it and a retained ProseMirror listener would pass as
      // irrelevant. Every listener target observed while mounted that is
      // the root, inside the container, or the live ProseMirror element
      // stays relevant after detachment.
      const liveDom: unknown = lastCore().view.dom;
      const retainedTargets = new Set<EventTarget>([
        root,
        editableBeforeUnmount,
        globalThis.document,
        globalThis.window,
      ]);
      if (liveDom instanceof EventTarget) retainedTargets.add(liveDom);
      for (const entry of added) {
        if (
          entry.target === root ||
          (entry.target instanceof Element &&
            container.contains(entry.target))
        ) {
          retainedTargets.add(entry.target);
        }
      }
      unmount();
      unmounted = true;
      await tick();
      // Component-owned work is asserted at teardown — before draining: a
      // leaked component task still scheduled here fails instead of
      // settling silently through the drains below. Engine timers settle
      // through the drains and are asserted after them.
      const teardownComponentPending = [...pendingTimeouts.entries()]
        .filter(([, label]) => label.startsWith("component "))
        .map(([id, label]) => `${String(id)}:${label}`);
      expect(teardownComponentPending).toEqual([]);
      await new Promise((resolve) => originalSetTimeout(resolve, 0));
      await new Promise((resolve) => originalSetTimeout(resolve, 50));
      // Relevance reads the retained identities, never the post-teardown
      // tree: detached editor targets (the ProseMirror element carries the
      // core listeners) stay covered after unmount.
      const relevant = (entry: { target: EventTarget }): boolean =>
        retainedTargets.has(entry.target);
      const addedRelevant = added.filter(relevant);
      const removedRelevant = removed.filter(relevant);
      // The upstream Safari workaround (`prosemirror-view`: `if (safari)
      // view.dom.addEventListener("input", () => null)`) is anonymous, so
      // even a correct `destroy()` cannot remove it; it fires no observable
      // effect. jsdom reports `navigator.vendor === "Apple Computer"`, so
      // the branch is taken here (in real Chromium it is not). Exactly that
      // no-op is exempt — any other retained listener still fails.
      const isUpstreamSafariNoop = (entry: {
        type: string;
        listener: EventListener;
      }): boolean =>
        entry.type === "input" &&
        /^\(\s*\)\s*=>\s*null$/.test(Function.prototype.toString.call(entry.listener));
      const ownedAdded = addedRelevant.filter(
        (entry) => !isUpstreamSafariNoop(entry),
      );
      expect(ownedAdded.length).toBeGreaterThan(0);
      for (const entry of ownedAdded) {
        expect(
          removedRelevant.some(
            (candidate) =>
              candidate.target === entry.target &&
              candidate.type === entry.type &&
              candidate.listener === entry.listener &&
              candidate.capture === entry.capture,
          ),
          `listener (${entry.type}) on ${
            entry.target === root
              ? "editor root"
              : entry.target === globalThis.document
                ? "document"
                : entry.target === globalThis.window
                  ? "window"
                  : "editor DOM"
          } was not removed on unmount`,
        ).toBe(true);
      }
      expect(createdObservers.length).toBeGreaterThan(0);
      for (const observer of createdObservers) {
        expect(disconnected.has(observer)).toBe(true);
      }
      // Zero pending work: every scheduled task either ran or was
      // cancelled, and nothing fires after unmount.
      expect(pendingTimeouts.size).toBe(0);
      expect(pendingIntervals.size).toBe(0);
      expect(pendingRaf.size).toBe(0);
      expect(violations).toEqual([]);
      // A keystroke after unmount mutates nothing and emits nothing. The
      // unmounted DOM is detached, so the dispatch targets the retained
      // node: any listener the teardown failed to remove would still fire.
      await fireEvent.keyDown(editableBeforeUnmount, { key: "Enter" });
      await tick();
      await new Promise((resolve) => originalSetTimeout(resolve, 0));
      expect(collected.changes).toHaveLength(changesBefore);
      expect(collected.conflicts).toHaveLength(conflictsBefore);
      expect(collected.readiness).toHaveLength(readinessBefore);
      expect(violations).toEqual([]);
      expect(pendingTimeouts.size).toBe(0);
      expect(pendingIntervals.size).toBe(0);
      expect(pendingRaf.size).toBe(0);
    } finally {
      EventTarget.prototype.addEventListener = originalAdd;
      EventTarget.prototype.removeEventListener = originalRemove;
      for (const [kind, Original] of originalObservers) {
        (globalThis as unknown as Record<string, unknown>)[kind] = Original;
      }
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
      globalThis.setInterval = originalSetInterval;
      globalThis.clearInterval = originalClearInterval;
      if (OriginalRAF !== undefined) {
        globalThis.requestAnimationFrame = OriginalRAF;
      }
      if (OriginalCancelRAF !== undefined) {
        globalThis.cancelAnimationFrame = OriginalCancelRAF;
      }
    }
  });

  it("a capture through a stale handle rejects with the neutral error", async () => {
    const collected = collect();
    const { component, unmount } = render(RichTextEditor, {
      props: collected.props({ value: twoParagraphs() }),
    });
    unmount();
    await tick();
    await expect(component.captureDocument()).rejects.toMatchObject({
      name: "RichTextCaptureUnavailable",
      message: "rich-text.capture-unavailable",
    });
    expect(component.readiness()).toEqual({ composing: false, ready: false });
  });

  it("locale change re-renders labels in place without remount or change event", async () => {
    const collected = collect();
    const empty: RichTextDocument = {
      format: MARKDOWN,
      blocks: [paragraph("paragraph:1", "")],
    };
    const countBefore = coreCount();
    const { container, rerender } = render(RichTextEditor, {
      props: collected.props({ value: empty }),
    });
    const before = lastCore();
    await rerender(
      collected.props({
        value: empty,
        messages: { ...MESSAGES, placeholder: "SENTINEL-PLACEHOLDER-2" },
      }),
    );
    await tick();
    expect(coreCount()).toBe(countBefore + 1);
    expect(lastCore()).toBe(before);
    expect(collected.changes).toHaveLength(0);
    // The actual placeholder rendering follows the catalogue on the
    // displaying paragraph; the editor root carries no placeholder text.
    expect(editableOf(container).getAttribute("data-placeholder")).toBeNull();
    const showing = container.querySelector(
      ".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]",
    );
    expect(showing?.getAttribute("data-placeholder")).toBe(
      "SENTINEL-PLACEHOLDER-2",
    );
    expect(
      container.querySelector(".ProseMirror")?.getAttribute("aria-label"),
    ).toBe("SENTINEL-EDITOR-LABEL");
  });

  it("the stylesheet carries a complete focus outline from the focus tokens", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "rich-text-editor.css"),
      "utf8",
    );
    const focusRule = css.match(
      /\.ProseMirror:focus-visible\s*\{([^}]*)\}/,
    )?.[1];
    expect(focusRule).toBeDefined();
    // Complete outline: width, solid style and color in one declaration,
    // reading the existing focus tokens — never a bare color fallback.
    expect(focusRule).toContain("solid");
    expect(focusRule).toContain("--st-focus-width");
    expect(focusRule).toContain("--st-focus-color");
    expect(focusRule).toContain("--st-focus-offset");
  });
});


