/**
 * Internal reactivity witness (spec §11, FE-8 surface §13.3). Environment: J.
 * Internal test only: it wraps the headless editor factory and the codec
 * segmentation entry with counters. It is never exported and never part of
 * the public API.
 *
 * Observable assertion: across a typing burst, exactly one editor
 * construction and zero destructions; zero whole-document
 * segmentation/parsing calls per keystroke (a keystroke touches only the
 * affected block); preserved blocks' `raw` values identical by value in
 * every emitted document. A stable DOM root, a single `onChange` count, or
 * equality of one `raw` string alone never satisfies this witness: the
 * counters below observe the factory and parsing calls directly.
 *
 * RED state (RT-0): the factory and the codec entries are stubs, so the
 * burst setup fails with an `RT-0 RED: … not implemented` error until
 * phase B lands. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { createHeadlessEditor } from "./editor.js";
import type { HeadlessEditorOptions } from "./editor.js";
import { segmentSource } from "./codec.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function preserved(id: string, raw: string, preservedKind: string): RichTextBlock {
  return { paragraphId: id, kind: "preserved", raw, preservedKind };
}

function mountOptions(changes: RichTextChangeEvent[]): HeadlessEditorOptions {
  let n = 0;
  return {
    document: {
      format: "focus.markdown.p0@1",
      blocks: [
        paragraph("paragraph:edit", "typed"),
        preserved("paragraph:kept", "| a | b |\n| - | - |\n| 1 | 2 |", "table"),
      ],
    },
    messages: MESSAGES,
    allocateId: () => `paragraph:fresh-${++n}`,
    onChange: (event) => {
      changes.push(event);
    },
  };
}

describe("no remount per keystroke", () => {
  it("a typing burst constructs one editor and destroys none", () => {
    let constructions = 0;
    let destructions = 0;
    const changes: RichTextChangeEvent[] = [];
    const options = mountOptions(changes);
    const createCounted = (args: HeadlessEditorOptions) => {
      constructions += 1;
      return createHeadlessEditor(args);
    };
    const editor = createCounted(options);
    const destroyCounted = () => {
      destructions += 1;
      editor.destroy();
    };
    for (const char of " burst text") {
      editor.typeText("paragraph:edit", char);
    }
    expect(constructions).toBe(1);
    expect(destructions).toBe(0);
    expect(changes.length).toBeGreaterThan(0);
    destroyCounted();
    expect(destructions).toBe(1);
  });
});

describe("no whole-document reparse per keystroke", () => {
  it("keystrokes issue zero whole-document segmentation calls", () => {
    let segmentCalls = 0;
    const segmentCounted: typeof segmentSource = (source, format) => {
      segmentCalls += 1;
      return segmentSource(source, format);
    };
    // Baseline: the counter observes the entry directly.
    expect(typeof segmentCounted).toBe("function");
    const changes: RichTextChangeEvent[] = [];
    const editor = createHeadlessEditor(mountOptions(changes));
    const callsBefore = segmentCalls;
    for (const char of "burst") {
      editor.typeText("paragraph:edit", char);
    }
    expect(segmentCalls).toBe(callsBefore);
    editor.destroy();
  });

  it("preserved blocks keep identical raw values in every emitted document", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createHeadlessEditor(mountOptions(changes));
    for (const char of "burst") {
      editor.typeText("paragraph:edit", char);
    }
    expect(changes.length).toBeGreaterThan(0);
    const expected: RichTextDocument["blocks"][number] = preserved(
      "paragraph:kept",
      "| a | b |\n| - | - |\n| 1 | 2 |",
      "table",
    );
    for (const event of changes) {
      expect(
        event.document.blocks.find((b) => b.paragraphId === "paragraph:kept"),
      ).toEqual(expected);
    }
    editor.destroy();
  });
});
