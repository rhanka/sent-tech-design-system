/** Review 1 item 12: no generic Markdown HTML fallback in full.
 *
 * RED on cc91ac7c: the full graph mounts the generic `@tiptap/markdown`
 * manager, whose HTML token path parses `<u class="x" onclick="…">Under</u>`
 * into an underline mark (active handler silently dropped, no refusal).
 * The fix removes the generic manager from the full graph and keeps the
 * exact attribute-free `<u>`/`</u>` DS tokenizer: attributed opens stay
 * literal text, an unmatched closer stays literal text, and HTML pastes
 * carrying event handlers refuse whole.
 */
import { describe, expect, it } from "vitest";
import { createRichTextEditor } from "./editor.js";
import {
  createFullEditorExtensions,
  ensureFullEditorExtensionsRegistered,
} from "./editor-full-extensions.js";
import type { RichTextDocument } from "./model.js";
import { parseFullMarkdown, serializeFullDocument } from "./editor-full-markdown.js";

const HOSTILE = '<u class="x" onclick="alert(1)">Under</u>';

ensureFullEditorExtensionsRegistered();

function allocator(): () => string {
  let sequence = 0;
  return () => `witness:${(sequence += 1)}`;
}

function emptyFullDocument(): RichTextDocument {
  return {
    format: "ds.markdown.full@1",
    blocks: [{ paragraphId: "witness:empty", kind: "paragraph", segments: [] }],
  };
}

function mountFull() {
  return createRichTextEditor({
    document: emptyFullDocument(),
    profile: "full",
    messages: { placeholder: "", placeholderMarker: "" },
    allocateId: allocator(),
  });
}

function textOf(document: RichTextDocument): string {
  return document.blocks
    .map((block) =>
      block.kind === "paragraph"
        ? ((block.segments ?? []) as { text?: string }[]).map((segment) => segment.text ?? "").join("")
        : "",
    )
    .join("\n");
}

function underlinedRuns(document: RichTextDocument): string[] {
  return document.blocks.flatMap((block) =>
    block.kind === "paragraph"
      ? ((block.segments ?? []) as { text?: string; marks?: { underline?: boolean } }[])
          .filter((segment) => segment.marks?.underline === true)
          .map((segment) => segment.text ?? "")
      : [],
  );
}

describe("review 1 item 12: no generic Markdown HTML fallback in full", () => {
  it("full graph contains no generic Markdown manager", () => {
    const extensions = createFullEditorExtensions({
      placeholder: "",
      placeholderMarker: () => null,
      isEditable: () => true,
    });
    expect(extensions.map((extension) => extension.name)).not.toContain("markdown");
  });

  it("parses attributed <u> as literal text with no underline mark", () => {
    const parsed = parseFullMarkdown(HOSTILE, allocator());
    expect(parsed.refusedKinds).toEqual([]);
    expect(underlinedRuns(parsed.document)).toEqual([]);
    expect(textOf(parsed.document)).toContain('<u class="x"');
  });

  it("keeps an unmatched </u> as literal text", () => {
    const parsed = parseFullMarkdown(HOSTILE, allocator());
    expect(textOf(parsed.document)).toContain("</u>");
  });

  it("round-trips the hostile line losslessly through serialize", () => {
    const first = parseFullMarkdown(HOSTILE, allocator());
    const wire = serializeFullDocument(first.document);
    const second = parseFullMarkdown(wire, allocator());
    expect(textOf(second.document)).toBe(textOf(first.document));
    expect(underlinedRuns(second.document)).toEqual([]);
  });

  it("pastes hostile markdown text as literal with no underline mark", () => {
    const editor = mountFull();
    try {
      editor.paste({ text: HOSTILE });
      const after = editor.getDocument();
      expect(underlinedRuns(after)).toEqual([]);
      expect(textOf(after)).toContain('<u class="x"');
    } finally {
      editor.destroy();
    }
  });

  it("refuses an HTML paste carrying an event handler whole", () => {
    const rejected: string[][] = [];
    const rejecting = createRichTextEditor({
      document: emptyFullDocument(),
      profile: "full",
      messages: { placeholder: "", placeholderMarker: "" },
      allocateId: allocator(),
      onUnsupportedPaste: (event) => {
        rejected.push(event.rejectedKinds);
      },
    });
    try {
      const before = textOf(rejecting.getDocument());
      rejecting.paste({ html: `<p>${HOSTILE}</p>` });
      expect(rejected.flat()).toContain("rawHtml");
      expect(textOf(rejecting.getDocument())).toBe(before);
    } finally {
      rejecting.destroy();
    }
  });
});
