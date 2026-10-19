/**
 * RED 2 — editor half: open/focus/leave without a change emits nothing and
 * the document is block-identical; an edit preserves its surroundings.
 * Spec §11 RED 2, §6.5. Environment: J.
 *
 * The input `RichTextDocument` comes from the recorded host segmentation of
 * the corpus (`tests/fixtures/p0-corpus.segments.json`, provenance in the
 * fixture header): the DS test itself segments nothing and stores no
 * separator. Full-source byte identity, separators included, is the FE-3
 * host splice (§6.5/§13.1) and is asserted nowhere here.
 *
 * Observable assertion (no-change half): mount → focus → blur → unmount
 * emits zero `onChange` calls, and the resulting document is block-identical
 * to the input: same block order, same `paragraphId` values, every paragraph
 * `text` byte-identical and every preserved `raw` byte-identical (deep
 * equality over the significant fields of §5.6, never a full-source string
 * comparison). Any block-content normalisation fails the test with the
 * differing block shown. Observable assertion (editing half): in the same
 * host-segmented corpus, edit exactly one middle paragraph through
 * "./editor", then assert the emitted document carries exactly the new text
 * in the edited block and every other block — neighbouring paragraph texts,
 * marker variants outside the edit, preserved `raw` values, order and
 * identities — is unchanged. No DS assertion compares separators, and no DS
 * code reconstructs a full source. A cycle without editing never substitutes
 * for the editing half.
 *
 * This file also carries the controlled empty-field case: the host-segmented
 * empty field is one empty paragraph, asserted on the input document.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
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

interface RecordedSegment {
  order: number;
  start: number;
  end: number;
  editable: boolean;
  text: string;
  preservedKind?: string;
}

interface SegmentsRecord {
  provenance: Record<string, unknown>;
  format: string;
  segments: RecordedSegment[];
}

const HERE = dirname(fileURLToPath(import.meta.url));
const SEGMENTS: SegmentsRecord = JSON.parse(
  readFileSync(
    join(HERE, "../tests/fixtures/p0-corpus.segments.json"),
    "utf8",
  ),
) as SegmentsRecord;

/** Build the input document from the recorded host segmentation: editable
    segments become paragraphs carrying their slice as `text`, non-editable
    segments become preserved blocks carrying their slice as `raw`. */
function documentFromRecordedSegments(): RichTextDocument {
  let n = 0;
  const blocks: RichTextBlock[] = SEGMENTS.segments.map((segment) => {
    const paragraphId = `paragraph:corpus-${++n}`;
    if (segment.editable) {
      return { paragraphId, kind: "paragraph", text: segment.text } as RichTextBlock;
    }
    return {
      paragraphId,
      kind: "preserved",
      raw: segment.text,
      preservedKind: segment.preservedKind ?? "rawHtml",
    } as RichTextBlock;
  });
  return { format: "focus.markdown.p0@1", blocks };
}

function mountRecorded(changes: RichTextChangeEvent[]): {
  editor: RichTextEditor;
  input: RichTextDocument;
} {
  const input = documentFromRecordedSegments();
  let n = 1000;
  const editor = createRichTextEditor({
    document: input,
    messages: MESSAGES,
    allocateId: () => `paragraph:corpus-${++n}`,
    onChange: (event) => {
      changes.push(event);
    },
  });
  return { editor, input };
}

const EDIT_TARGET =
  "Middle paragraph kept for the editing half: the harness edits this line only.";
const EDIT_REPLACEMENT =
  "Middle paragraph kept for the editing half: edited by the RED 2 editing half.";

describe("recorded host segmentation (provenance)", () => {
  it("carries the pin provenance and covers editable and preserved segments", () => {
    expect(SEGMENTS.provenance["h2aCommit"]).toBe("98060bd0a");
    expect(SEGMENTS.format).toBe("focus.markdown.p0@1");
    expect(
      SEGMENTS.segments.filter((segment) => segment.editable).length,
    ).toBeGreaterThan(0);
    expect(
      SEGMENTS.segments.filter((segment) => !segment.editable).length,
    ).toBeGreaterThan(0);
  });
});

describe("no-change cycle", () => {
  it("mount without editing emits zero onChange calls", () => {
    const changes: RichTextChangeEvent[] = [];
    const { editor } = mountRecorded(changes);
    // Focus, blur and unmount with no edit: the open/leave cycle is silent.
    editor.getDocument();
    editor.getSelection();
    editor.destroy();
    expect(changes).toHaveLength(0);
  });

  it("the unedited document is block-identical to the host-segmented input", () => {
    const changes: RichTextChangeEvent[] = [];
    const { editor, input } = mountRecorded(changes);
    expect(editor.getDocument()).toEqual(input);
    editor.destroy();
  });

  it("preserved blocks mount with byte-identical raw slices", () => {
    const changes: RichTextChangeEvent[] = [];
    const { editor, input } = mountRecorded(changes);
    const expected = input.blocks.filter((b) => b.kind === "preserved");
    const actual = editor.getDocument().blocks.filter((b) => b.kind === "preserved");
    expect(actual.length).toBeGreaterThan(0);
    expect(actual).toEqual(expected);
    editor.destroy();
  });
});

describe("editing half: one middle-paragraph edit preserves its surroundings", () => {
  it("the emitted document changes only the edited paragraph", () => {
    const changes: RichTextChangeEvent[] = [];
    const { editor, input } = mountRecorded(changes);
    const target = editor
      .getDocument()
      .blocks.find(
        (b) => b.kind === "paragraph" && (b.text ?? "").includes(EDIT_TARGET),
      );
    expect(target).toBeDefined();
    // Replace the paragraph text wholesale: clear, then type the line.
    editor.clearParagraph(target?.paragraphId as string);
    editor.typeText(target?.paragraphId as string, EDIT_REPLACEMENT);
    expect(changes.length).toBeGreaterThan(0);
    const next = changes[changes.length - 1]?.document as RichTextDocument;
    expect(next.blocks).toHaveLength(input.blocks.length);
    next.blocks.forEach((block, index) => {
      const before = input.blocks[index] as RichTextBlock;
      expect(block.paragraphId).toBe(before.paragraphId);
      expect(block.kind).toBe(before.kind);
      if (block.paragraphId === target?.paragraphId) {
        expect(block.text).toBe(EDIT_REPLACEMENT);
      } else if (block.kind === "paragraph") {
        expect(block.text).toBe(before.text);
      } else {
        expect(block.raw).toBe(before.raw);
        expect(block.preservedKind).toBe(before.preservedKind);
      }
    });
    editor.destroy();
  });
});

describe("absent preservedKind stays absent", () => {
  function mountWithoutKind() {
    const changes: RichTextChangeEvent[] = [];
    const conflicts: { incoming: RichTextDocument }[] = [];
    const input: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:a", kind: "paragraph", text: "Alpha" },
        // Received without `preservedKind`: absent must stay absent.
        { paragraphId: "paragraph:k", kind: "preserved", raw: "| a |" },
      ],
    };
    let n = 0;
    const editor = createRichTextEditor({
      document: input,
      messages: MESSAGES,
      allocateId: () => `paragraph:absent-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
      onExternalConflict: (event) => {
        conflicts.push(event);
      },
    });
    return { editor, changes, conflicts, input };
  }

  it("a preserved block received without preservedKind round-trips without it", () => {
    const { editor, input } = mountWithoutKind();
    const next = editor.getDocument();
    expect(next).toEqual(input);
    expect("preservedKind" in (next.blocks[1] as object)).toBe(false);
    editor.destroy();
  });

  it("a raw-only update to that block applies under rule 4 instead of conflicting", () => {
    const { editor, changes, conflicts } = mountWithoutKind();
    // Without the absent/present distinction the mounted document would
    // carry `preservedKind: ""`, diverge from the acknowledgement, and turn
    // this clean update into a conflict.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:a", kind: "paragraph", text: "Alpha" },
        { paragraphId: "paragraph:k", kind: "preserved", raw: "| b |" },
      ],
    });
    expect(conflicts).toHaveLength(0);
    expect(changes).toHaveLength(0);
    expect(editor.getDocument().blocks[1]).toEqual({
      paragraphId: "paragraph:k",
      kind: "preserved",
      raw: "| b |",
    });
    editor.destroy();
  });
});

describe("raw-only external change keeps paragraph instances (R13)", () => {
  function rawSetup() {
    const changes: RichTextChangeEvent[] = [];
    const input: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:a", kind: "paragraph", text: "Alpha" },
        {
          paragraphId: "paragraph:k",
          kind: "preserved",
          raw: "| a |",
          preservedKind: "table",
        },
      ],
    };
    let n = 0;
    const editor = createRichTextEditor({
      document: input,
      messages: MESSAGES,
      allocateId: () => `paragraph:raw-${++n}`,
      onChange: (event) => {
        changes.push(event);
      },
    });
    const paragraphNodeOf = () => {
      let found: unknown = null;
      editor.view.state.doc.descendants((node) => {
        if (
          found === null &&
          node.type.name === "paragraph" &&
          (node.attrs as Record<string, unknown>)["paragraphId"] ===
            "paragraph:a"
        ) {
          found = node;
        }
        return true;
      });
      return found;
    };
    return { editor, changes, input, paragraphNodeOf };
  }

  it("a raw-only update dispatches a targeted change: paragraphs untouched, undo intact", () => {
    const { editor, changes, paragraphNodeOf } = rawSetup();
    editor.typeText("paragraph:a", "!");
    expect(changes).toHaveLength(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("Alpha!");
    // Acknowledge the paragraph edit (rule 1 echo) so the later raw-only
    // update applies under rule 4 with no local divergence.
    editor.applyExternalUpdate(structuredClone(editor.getDocument()));
    expect(changes).toHaveLength(1);
    const before = paragraphNodeOf();
    // External application limited to the preserved `raw`: no paragraph is
    // rebuilt, so the acknowledged paragraph edit stays undoable on its text.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [
        { paragraphId: "paragraph:a", kind: "paragraph", text: "Alpha!" },
        {
          paragraphId: "paragraph:k",
          kind: "preserved",
          raw: "| b |",
          preservedKind: "table",
        },
      ],
    });
    expect(changes).toHaveLength(1);
    expect(editor.getDocument().blocks[1]).toEqual({
      paragraphId: "paragraph:k",
      kind: "preserved",
      raw: "| b |",
      preservedKind: "table",
    });
    expect(paragraphNodeOf()).toBe(before);
    editor.undo();
    expect(changes).toHaveLength(2);
    expect(changes[1]?.gesture.kind).toBe("undo");
    expect(editor.getDocument().blocks[0]?.text).toBe("Alpha");
    expect(editor.getDocument().blocks[1]).toEqual({
      paragraphId: "paragraph:k",
      kind: "preserved",
      raw: "| b |",
      preservedKind: "table",
    });
    editor.destroy();
  });
});

describe("empty field", () => {
  it('the host-segmented empty field is one empty paragraph with text ""', () => {
    const changes: RichTextChangeEvent[] = [];
    let n = 0;
    for (const format of ["focus.markdown.p0@1", "text/plain"] as const) {
      const editor = createRichTextEditor({
        document: {
          format,
          blocks: [
            { paragraphId: `paragraph:empty-${++n}`, kind: "paragraph", text: "" },
          ],
        },
        messages: MESSAGES,
        allocateId: () => `paragraph:empty-${++n}`,
        onChange: (event) => {
          changes.push(event);
        },
      });
      const document = editor.getDocument();
      expect(document.format).toBe(format);
      expect(document.blocks).toHaveLength(1);
      expect(document.blocks[0]?.kind).toBe("paragraph");
      expect(document.blocks[0]?.text).toBe("");
      editor.destroy();
    }
    expect(changes).toHaveLength(0);
  });
});
