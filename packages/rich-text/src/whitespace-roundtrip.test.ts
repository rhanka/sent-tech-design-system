/**
 * Self-sweep for sol pass 4 residuals (RT-0 round 5): every whitespace-only
 * or break-only paragraph shape in both formats, whitespace inside marks
 * (bold, italic, code), and leading/trailing spaces in Markdown paragraphs.
 *
 * Table-driven round trip per row: mount, capture, remount, equal document —
 * plus the exact live `hardBreak` count on both mounts. A row whose bridge
 * cannot represent it (Markdown break-only / whitespace-only) travels on
 * the explicit N1-residual wire and still round-trips byte-identical.
 */
import { describe, it, expect } from "vitest";
import type { EditorView } from "@tiptap/pm/view";
import { createRichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextFormat,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

interface SweepRow {
  label: string;
  format: RichTextFormat;
  text: string;
  expectedBreaks: number;
}

const ROWS: SweepRow[] = [
  // text/plain: literal text, interior newlines as hardBreak nodes.
  { label: "plain empty", format: "text/plain", text: "", expectedBreaks: 0 },
  { label: "plain spaces-only", format: "text/plain", text: "   ", expectedBreaks: 0 },
  { label: "plain tab-only", format: "text/plain", text: "\t", expectedBreaks: 0 },
  { label: "plain break-only", format: "text/plain", text: "\n", expectedBreaks: 1 },
  { label: "plain spaces around break", format: "text/plain", text: "  \n  ", expectedBreaks: 1 },
  { label: "plain interior break", format: "text/plain", text: "A\nB", expectedBreaks: 1 },
  { label: "plain double break", format: "text/plain", text: "A\n\nB", expectedBreaks: 2 },
  { label: "plain leading spaces", format: "text/plain", text: "  hello", expectedBreaks: 0 },
  { label: "plain trailing spaces", format: "text/plain", text: "hello  ", expectedBreaks: 0 },
  { label: "plain surrounding spaces", format: "text/plain", text: "  hello  ", expectedBreaks: 0 },
  { label: "plain double interior space", format: "text/plain", text: "A  B", expectedBreaks: 0 },
  // focus.markdown.p0@1: bridge plus the explicit N1-residual wire.
  { label: "markdown empty", format: "focus.markdown.p0@1", text: "", expectedBreaks: 0 },
  { label: "markdown spaces-only", format: "focus.markdown.p0@1", text: "   ", expectedBreaks: 0 },
  { label: "markdown tab-only", format: "focus.markdown.p0@1", text: "\t", expectedBreaks: 0 },
  { label: "markdown break-only", format: "focus.markdown.p0@1", text: "  \n", expectedBreaks: 1 },
  { label: "markdown two breaks", format: "focus.markdown.p0@1", text: "  \n  \n", expectedBreaks: 2 },
  { label: "markdown spaces plus break", format: "focus.markdown.p0@1", text: "     \n", expectedBreaks: 1 },
  { label: "markdown trailing break", format: "focus.markdown.p0@1", text: "Alpha  \n", expectedBreaks: 1 },
  { label: "markdown bold double space", format: "focus.markdown.p0@1", text: "**A  B**", expectedBreaks: 0 },
  { label: "markdown italic double space", format: "focus.markdown.p0@1", text: "*A  B*", expectedBreaks: 0 },
  { label: "markdown code double space", format: "focus.markdown.p0@1", text: "`A  B`", expectedBreaks: 0 },
  { label: "markdown code tab", format: "focus.markdown.p0@1", text: "`A\tB`", expectedBreaks: 0 },
  { label: "markdown leading spaces", format: "focus.markdown.p0@1", text: "  hello", expectedBreaks: 0 },
  { label: "markdown trailing spaces", format: "focus.markdown.p0@1", text: "hello  ", expectedBreaks: 0 },
  { label: "markdown surrounding spaces", format: "focus.markdown.p0@1", text: "  hello  ", expectedBreaks: 0 },
];

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function countHardBreaks(editor: { view: EditorView }): number {
  let count = 0;
  editor.view.state.doc.descendants((node) => {
    if (node.type.name === "hardBreak") count += 1;
    return true;
  });
  return count;
}

describe("whitespace and break-only round trip sweep (sol pass 4 self-sweep)", () => {
  it.each(ROWS)("mount, capture, remount, equal document: $label", (row) => {
    const input: RichTextDocument = {
      format: row.format,
      blocks: [paragraph("paragraph:1", row.text)],
    };
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor({
      document: input,
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
      onChange: (event) => {
        changes.push(event);
      },
    });
    // Mount is change-free and the capture is the input byte-identical.
    expect(changes).toHaveLength(0);
    expect(countHardBreaks(editor)).toBe(row.expectedBreaks);
    const captured = editor.getDocument();
    expect(captured).toEqual(input);
    editor.destroy();
    // Remount from the capture: same live breaks, same document.
    const remounted = createRichTextEditor({
      document: captured,
      messages: MESSAGES,
      allocateId: () => "paragraph:never-used",
    });
    expect(countHardBreaks(remounted)).toBe(row.expectedBreaks);
    expect(remounted.getDocument()).toEqual(captured);
    remounted.destroy();
  });
});
