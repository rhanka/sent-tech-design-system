/**
 * Review 1 item 10 — seeds through the full composer surface.
 *
 * RED on cc91ac7c: mounting `ComposerEditor` with `profile: "full"` on the
 * pinned `break-twins` value already normalizes its two-space hard breaks
 * to backslashes on the initial `captureComposer()`, and a neighboring edit
 * cannot keep the untouched slices byte-identical: the composer mapping
 * keeps no source seeds.
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import type { RichTextMessages } from "@sentropic/design-system-rich-text";
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
      // Full construction is asynchronous (lazy full graph): record the
      // settled instance, never the pending promise.
      const maybe = actual.createRichTextEditor(options) as
        | CoreEditor
        | Promise<CoreEditor>;
      if (maybe instanceof Promise) {
        return maybe.then((instance) => {
          createdCores.push(instance);
          return instance;
        });
      }
      createdCores.push(maybe);
      return maybe;
    },
  };
});

function lastCore(): CoreEditor {
  const instance = createdCores[createdCores.length - 1];
  expect(instance).toBeDefined();
  return instance as CoreEditor;
}

/** Deterministic mount wait: the full graph loads on demand, so the core
    settles after the dynamic import — poll for a core recorded after
    `previous` (bounded, fails loudly when the mount never settles). */
async function waitForCore(previous: number): Promise<CoreEditor> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (createdCores.length > previous) {
      return createdCores[createdCores.length - 1] as CoreEditor;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("full composer core never settled");
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

function composerProps(extra?: Partial<ComposerEditorProps>): ComposerEditorProps {
  return {
    value: "",
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: makeAllocator(),
    ...extra,
  } as ComposerEditorProps;
}

const BREAK_TWINS = "Twin\n\nTwin\n\nHard  \nbreak\n\n";

describe("full composer seeds (review 1 item 10, RED)", () => {
  it("initial capture keeps two-space hard breaks", async () => {
    const previous = createdCores.length;
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: BREAK_TWINS }),
    });
    await tick();
    await waitForCore(previous);
    const captured = await component.captureComposer();
    expect(captured.text).toBe(BREAK_TWINS);
  });

  it("a neighboring edit keeps untouched source slices", async () => {
    const seen: string[] = [];
    const previous = createdCores.length;
    const { component } = render(ComposerEditor, {
      props: composerProps({
        value: BREAK_TWINS,
        onChange: (text: string) => {
          seen.push(text);
        },
      }),
    });
    await tick();
    await waitForCore(previous);
    const firstId = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(firstId, "!");
    await tick();
    expect(seen).toEqual(["Twin!\n\nTwin\n\nHard  \nbreak\n\n"]);
    const captured = await component.captureComposer();
    expect(captured.text).toBe("Twin!\n\nTwin\n\nHard  \nbreak\n\n");
  });
});
