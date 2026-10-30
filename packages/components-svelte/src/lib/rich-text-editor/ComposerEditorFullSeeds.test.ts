/**
 * Review 1 item 10 (seeds) + review 3 blocking 1 (async mount) + review 3
 * blocking 3b (TrailingNode byte-identity) through the real full composer
 * surface: no `vi.mock`, no polling — `captureComposer()` awaits the pending
 * mount itself.
 *
 * RED on 825a15d1: `captureComposer()` rejected while the full graph loaded,
 * prop flips during mount were dropped, unmount during mount did not reject
 * through the pending promise, and an untouched composer ending with a list,
 * code block, heading or quote captured with an extra `"\n\n"`.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import type { RichTextMessages } from "@sentropic/design-system-rich-text";
import ComposerEditor from "./ComposerEditor.svelte";
import type { ComposerEditorProps } from "./ComposerEditor.svelte";

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

describe("full composer seeds and async mount (reviews 1 and 3, RED)", () => {
  it("initial capture keeps two-space hard breaks", async () => {
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: BREAK_TWINS }),
    });
    const captured = await component.captureComposer();
    expect(captured.text).toBe(BREAK_TWINS);
  });

  it("capture during mount resolves to the mounted document", async () => {
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: BREAK_TWINS }),
    });
    // No tick, no wait: the capture awaits the pending full mount itself.
    const captured = await component.captureComposer();
    expect(captured.text).toBe(BREAK_TWINS);
  });

  it("prop flip during mount applies the latest value", async () => {
    const { component, rerender } = render(ComposerEditor, {
      props: composerProps({ value: "first" }),
    });
    await rerender({ ...composerProps({ value: "second" }) });
    const captured = await component.captureComposer();
    expect(captured.text).toBe("second");
  });

  it("unmount during mount rejects capture", async () => {
    const { component, unmount } = render(ComposerEditor, {
      props: composerProps({ value: BREAK_TWINS }),
    });
    const pending = component.captureComposer();
    await unmount();
    await expect(pending).rejects.toMatchObject({
      name: "RichTextCaptureUnavailable",
    });
  });

  it("untouched list-final composer captures byte-identically", async () => {
    const input = "- item one\n- item two";
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: input }),
    });
    const captured = await component.captureComposer();
    expect(captured.text).toBe(input);
  });

  it("untouched code-final composer captures byte-identically", async () => {
    const input = "```ts\nconst x = 1;\n```";
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: input }),
    });
    const captured = await component.captureComposer();
    expect(captured.text).toBe(input);
  });

  it("untouched heading-final composer captures byte-identically", async () => {
    const input = "# Title";
    const { component } = render(ComposerEditor, {
      props: composerProps({ value: input }),
    });
    const captured = await component.captureComposer();
    expect(captured.text).toBe(input);
  });

  it("a host replacement keeps untouched source slices", async () => {
    const seen: string[] = [];
    const { component, rerender } = render(ComposerEditor, {
      props: composerProps({
        value: BREAK_TWINS,
        onChange: (text: string) => {
          seen.push(text);
        },
      }),
    });
    const first = await component.captureComposer();
    expect(first.text).toBe(BREAK_TWINS);
    await rerender({
      ...composerProps({
        value: "Twin!\n\nTwin\n\nHard  \nbreak\n\n",
        onChange: (text: string) => {
          seen.push(text);
        },
      }),
    });
    const captured = await component.captureComposer();
    expect(captured.text).toBe("Twin!\n\nTwin\n\nHard  \nbreak\n\n");
    expect(seen).not.toContain(BREAK_TWINS);
  });
});
