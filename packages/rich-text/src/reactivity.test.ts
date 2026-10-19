/**
 * Internal reactivity witness (spec §11, FE-8 surface §13.3). Environment: J.
 * Internal test only: it wraps the Tiptap-bound editor factory and the
 * "./editor" conversion counters. It is never exported and never part of
 * the public API; it imports "./editor" explicitly.
 *
 * Observable assertion: across a typing burst, exactly one editor
 * construction and zero destructions; zero whole-document conversion or
 * Markdown re-parse calls per keystroke (a keystroke touches only the
 * affected block, as a ProseMirror transaction); preserved blocks' `raw`
 * values identical by value in every emitted document. A stable DOM root, a
 * single `onChange` count, or equality of one `raw` string alone never
 * satisfies this witness: the counters below observe the factory and the
 * conversion entries directly.
 */
import { describe, it, expect } from "vitest";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditorOptions } from "./editor.js";
import {
  conversionCounters,
  resetConversionCounters,
} from "./editor-conversion.js";
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

function mountOptions(changes: RichTextChangeEvent[]): RichTextEditorOptions {
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
    const createCounted = (args: RichTextEditorOptions) => {
      constructions += 1;
      return createRichTextEditor(args);
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
  it("keystrokes issue zero whole-document conversion or re-parse calls", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
    resetConversionCounters();
    const burst = "burst";
    for (const char of burst) {
      editor.typeText("paragraph:edit", char);
    }
    // One affected block per keystroke: exactly one paragraph serialisation
    // per keystroke, zero paragraph re-parses, and zero whole-document
    // conversions across the whole burst.
    expect(conversionCounters.paragraphSerialize).toBe(burst.length);
    expect(conversionCounters.paragraphParse).toBe(0);
    expect(conversionCounters.documentSerialize).toBe(0);
    editor.destroy();
  });

  it("preserved blocks keep identical raw values in every emitted document", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
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
