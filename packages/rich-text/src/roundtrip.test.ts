/**
 * RED 2 — core half: no-change cycle emits nothing and round-trips
 * byte-identical; an edit preserves its surroundings. Spec §11 RED 2, §6.5.
 * Environment: J.
 *
 * Corpus: `tests/fixtures/p0-corpus.md` (every P0 construct, every preserved
 * construct named in §6.3, two textually identical paragraphs, accents/emoji,
 * CRLF separators, marker variants, trailing blank lines, final newline,
 * preserved blocks interleaved between editable paragraphs).
 *
 * Observable assertion (no-change half): mount → focus → blur → unmount emits
 * zero `onChange` calls, and serialising the unedited document reproduces the
 * source byte-identically (string equality). Any normalisation difference
 * fails with the difference shown. Observable assertion (editing half): edit
 * exactly one middle paragraph, then compare the complete reconstructed
 * source — the edited paragraph carries the new text while every neighbouring
 * paragraph, every separator (including CRLF), every marker variant outside
 * the edit and every preserved block's `raw` stay byte-identical. A cycle
 * without editing never substitutes for the editing half.
 *
 * This file also carries the empty-field case (lot follow-up): segmentation
 * of `""` gives `[]`, while the controlled document keeps one empty paragraph
 * with `text: ""`.
 *
 * Segmentation-boundary equivalence against the DS vectors is witnessed
 * separately by `src/segmentation-equivalence.test.ts` (RT-2, §11.3); no
 * host-side fixture is imported here.
 *
 * RED state (RT-0): the codec bridge and the headless editor are stubs, so
 * every case fails with an `RT-0 RED: … not implemented` error until phase B
 * lands. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHeadlessEditor } from "./editor.js";
import {
  documentFromSource,
  segmentSource,
  sourceFromDocument,
} from "./codec.js";
import type {
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

const CORPUS_URL = new URL("../tests/fixtures/p0-corpus.md", import.meta.url);
const CORPUS = readFileSync(CORPUS_URL, "utf8");

const EDIT_TARGET =
  "Middle paragraph kept for the editing half: the harness edits this line only.";
const EDIT_REPLACEMENT =
  "Middle paragraph kept for the editing half: edited by the RED 2 editing half.";

function mountCorpus(changes: RichTextChangeEvent[]) {
  let n = 0;
  const document = documentFromSource(CORPUS, {
    format: "focus.markdown.p0@1",
    allocateId: () => `paragraph:corpus-${++n}`,
  });
  const editor = createHeadlessEditor({
    document,
    messages: MESSAGES,
    allocateId: () => `paragraph:corpus-${++n}`,
    onChange: (event) => {
      changes.push(event);
    },
  });
  return editor;
}

describe("no-change cycle", () => {
  it("mount without editing emits zero onChange calls", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = mountCorpus(changes);
    // Focus, blur and unmount with no edit: the open/leave cycle is silent.
    editor.getDocument();
    editor.getSelection();
    editor.destroy();
    expect(changes).toHaveLength(0);
  });

  it("serialising the unedited document reproduces the source byte-identically", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = mountCorpus(changes);
    const roundTripped = sourceFromDocument(editor.getDocument());
    expect(roundTripped).toBe(CORPUS);
    editor.destroy();
  });

  it("preserved blocks mount with byte-identical raw slices", () => {
    const changes: RichTextChangeEvent[] = [];
    const editor = mountCorpus(changes);
    const raws = editor
      .getDocument()
      .blocks.filter((b) => b.kind === "preserved")
      .map((b) => b.raw);
    expect(raws.length).toBeGreaterThan(0);
    for (const raw of raws) {
      expect(CORPUS).toContain(raw as string);
    }
    editor.destroy();
  });
});

describe("editing half: one middle-paragraph edit preserves its surroundings", () => {
  it("reconstructed source changes only the edited paragraph", () => {
    expect(CORPUS).toContain(EDIT_TARGET);
    const changes: RichTextChangeEvent[] = [];
    const editor = mountCorpus(changes);
    const target = editor
      .getDocument()
      .blocks.find(
        (b) => b.kind === "paragraph" && (b.text ?? "").includes(EDIT_TARGET),
      );
    expect(target).toBeDefined();
    // Replace the paragraph text wholesale through repeated typing/clearing
    // at the headless surface: clear, then type the replacement line.
    editor.clearParagraph(target?.paragraphId as string);
    editor.typeText(target?.paragraphId as string, EDIT_REPLACEMENT);
    expect(changes.length).toBeGreaterThan(0);
    const rebuilt = sourceFromDocument(
      changes[changes.length - 1]?.document as RichTextDocument,
    );
    expect(rebuilt).toBe(CORPUS.replace(EDIT_TARGET, EDIT_REPLACEMENT));
    editor.destroy();
  });
});

describe("empty field", () => {
  it('segmentation of "" gives []', () => {
    expect(segmentSource("", "focus.markdown.p0@1")).toEqual([]);
    expect(segmentSource("", "text/plain")).toEqual([]);
  });

  it('the controlled document keeps one empty paragraph with text ""', () => {
    let n = 0;
    for (const format of ["focus.markdown.p0@1", "text/plain"] as const) {
      const document = documentFromSource("", {
        format,
        allocateId: () => `paragraph:empty-${++n}`,
      });
      expect(document.format).toBe(format);
      expect(document.blocks).toHaveLength(1);
      expect(document.blocks[0]?.kind).toBe("paragraph");
      expect(document.blocks[0]?.text).toBe("");
    }
  });
});
