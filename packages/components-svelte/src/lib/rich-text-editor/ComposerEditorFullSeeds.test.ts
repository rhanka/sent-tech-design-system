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
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: BREAK_TWINS }),
    });
    await tick();
    const captured = await component.captureComposer();
    expect(captured.text).toBe(BREAK_TWINS);
  });

  it("a neighboring edit keeps untouched source slices", async () => {
    const seen: string[] = [];
    const { component } = render(ComposerEditor, {
      props: composerProps({
        value: BREAK_TWINS,
        onChange: (text: string) => {
          seen.push(text);
        },
      }),
    });
    await tick();
    const firstId = lastCore().getDocument().blocks[0]?.paragraphId as string;
    lastCore().typeText(firstId, "!");
    await tick();
    expect(seen).toEqual(["Twin!\n\nTwin\n\nHard  \nbreak\n\n"]);
    const captured = await component.captureComposer();
    expect(captured.text).toBe("Twin!\n\nTwin\n\nHard  \nbreak\n\n");
  });
});
