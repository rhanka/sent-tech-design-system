/**
 * Review 3 blocking 1 through the real full document surface: no `vi.mock`,
 * no polling — `captureDocument()` awaits the pending mount itself.
 *
 * RED on 825a15d1: prop changes (`effectiveEditable`, `disabled`,
 * `value`) arriving before the full core settled were dropped, the chrome
 * `$effect` never re-ran on `profile: "full"` (stale aria/disabled), and
 * `captureDocument()` rejected while mounting instead of awaiting it.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import type {
  RichTextDocument,
  RichTextMessages,
} from "@sentropic/design-system-rich-text";
import { parseFullMarkdown } from "@sentropic/design-system-rich-text";
import RichTextEditor from "./RichTextEditor.svelte";
import type { RichTextEditorProps } from "./RichTextEditor.svelte";

const MESSAGES: RichTextMessages = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

function makeAllocator(prefix: string): () => string {
  let sequence = 0;
  return () => `${prefix}:${(sequence += 1)}`;
}

function fullDocFor(text: string): RichTextDocument {
  const parsed = parseFullMarkdown(text, makeAllocator("mount"));
  const document = parsed.document;
  expect(document).not.toBeNull();
  return document as RichTextDocument;
}

function editorProps(extra?: Partial<RichTextEditorProps>): RichTextEditorProps {
  return {
    value: fullDocFor("hello"),
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: makeAllocator("test"),
    ...extra,
  } as RichTextEditorProps;
}

describe("full document async mount (review 3 blocking 1, RED)", () => {
  it("capture during mount resolves to the mounted document", async () => {
    const { component } = render(RichTextEditor, {
      props: editorProps({ value: fullDocFor("hello") }),
    });
    // No tick, no wait: the capture awaits the pending full mount itself.
    const captured = await component.captureDocument();
    expect(captured.document.blocks.length).toBeGreaterThan(0);
    expect(JSON.stringify(captured.document)).toContain("hello");
  });

  it("value flip during mount applies the latest document", async () => {
    const first = fullDocFor("first");
    const second = fullDocFor("second");
    const { component, rerender } = render(RichTextEditor, {
      props: editorProps({ value: first }),
    });
    await rerender({ ...editorProps({ value: second }) });
    const captured = await component.captureDocument();
    expect(JSON.stringify(captured.document)).toContain("second");
    expect(JSON.stringify(captured.document)).not.toContain("first");
  });

  it("disabled flip during mount reconciles on settle", async () => {
    const { component, rerender, container } = render(RichTextEditor, {
      props: editorProps({ value: fullDocFor("hello"), disabled: false }),
    });
    await rerender({ ...editorProps({ value: fullDocFor("hello"), disabled: true }) });
    await component.captureDocument();
    await tick();
    const dom = container.querySelector(".ProseMirror");
    expect(dom?.getAttribute("aria-disabled")).toBe("true");
  });

  it("unmount during mount rejects capture", async () => {
    const { component, unmount } = render(RichTextEditor, {
      props: editorProps({ value: fullDocFor("hello") }),
    });
    const pending = component.captureDocument();
    await unmount();
    await expect(pending).rejects.toMatchObject({
      name: "RichTextCaptureUnavailable",
    });
  });
});
