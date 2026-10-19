/**
 * Internal reactivity witness (spec §11, FE-8 surface §13.3). Environment: J.
 * Internal test only: it exercises the Tiptap-bound editor factory and the
 * "./editor" conversion counters. It is never exported and never part of
 * the public API; it imports "./editor" explicitly.
 *
 * Observable assertion, over real operations (never test-wrapper counts):
 * across a typing burst the live ProseMirror view instance is stable and
 * nothing is destroyed; each keystroke issues exactly one paragraph bridge
 * serialisation for the visited-and-changed paragraph, zero paragraph
 * re-parses and zero whole-document conversions — even with several already
 * visited paragraphs, because conversions memoise the exact source per node
 * version; revisiting a known version (undo) costs no conversion at all.
 * Preserved blocks' `raw` values stay identical by value in every emitted
 * document. A stable DOM root, a single `onChange` count, or equality of one
 * `raw` string alone never satisfies this witness: the counters below
 * observe the conversion entries directly.
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
        paragraph("paragraph:a", "first"),
        paragraph("paragraph:b", "second"),
        paragraph("paragraph:c", "third"),
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

describe("no remount per keystroke (live view)", () => {
  it("a typing burst keeps one live ProseMirror view", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
    const liveView = editor.view;
    for (const char of " burst text") {
      editor.typeText("paragraph:a", char);
    }
    // The real operation surface: the same live view served every
    // keystroke — no reconstruction, no replacement.
    expect(editor.view).toBe(liveView);
    expect(changes.length).toBeGreaterThan(0);
    editor.destroy();
  });
});

describe("no whole-document reparse per keystroke (real conversions)", () => {
  it("with several visited paragraphs, a keystroke serialises only its own paragraph", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
    // Visit two paragraphs so both versions are recorded.
    editor.typeText("paragraph:a", "!");
    editor.typeText("paragraph:b", "?");
    resetConversionCounters();
    editor.typeText("paragraph:a", ".");
    // Exactly one paragraph serialisation (the changed one), zero
    // re-parses, zero whole-document conversions: the already visited
    // paragraph B is a version-cache hit, not a second serialisation. A
    // `touched` set that is never cleared would serialise both.
    expect(conversionCounters.paragraphSerialize).toBe(1);
    expect(conversionCounters.paragraphParse).toBe(0);
    expect(conversionCounters.documentSerialize).toBe(0);
    editor.destroy();
  });

  it("undo back to a recorded version costs no conversion", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
    editor.typeText("paragraph:a", "!");
    expect(changes).toHaveLength(1);
    resetConversionCounters();
    editor.undo();
    expect(changes).toHaveLength(2);
    // The restored version is the recorded mount version: exact text with
    // no bridge call.
    expect(conversionCounters.paragraphSerialize).toBe(0);
    expect(conversionCounters.paragraphParse).toBe(0);
    expect(conversionCounters.documentSerialize).toBe(0);
    expect(editor.getDocument().blocks[0]).toEqual(
      paragraph("paragraph:a", "first"),
    );
    editor.destroy();
  });

  it("preserved blocks keep identical raw values in every emitted document", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = createRichTextEditor(mountOptions(changes));
    for (const char of "burst") {
      editor.typeText("paragraph:a", char);
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
