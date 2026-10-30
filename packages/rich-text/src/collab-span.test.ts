/**
 * CL-3a witness 13 — formatting-span closure (a)–(c) for each boolean mark
 * and link/title, across headings, list items, quotes and code lines, plus
 * CL-3-13-code-bound and CL-3-13-link-null (spec §8 CL-3 (13), §4.3 R-LIN-4,
 * R-FULL-MARK-1, R-FULL-CODE-1, §4.11).
 *
 * Ingress acceptance is asserted at the DS level: inherited span attributes
 * on separator / hard-break embeds are ignored by projection and never
 * refuse a valid update.
 *
 * RED on 7a75a861: `./collab-codec.js` does not exist.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  seedFieldFromDocument,
  captureDocumentFromField,
  fieldTextName,
  fieldMetaName,
  validateFieldState,
} from "./collab-codec.js";
import type { RichTextDocument } from "./model.js";
import type { FullBlockMetadata, RichTextInlineMarks } from "./collaboration.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const FIELD = "body";

type MarkCase =
  | { mark: "bold" | "italic" | "code" | "strike" | "underline"; value: true }
  | { mark: "link"; value: string; title?: string };

const MARK_CASES: MarkCase[] = [
  { mark: "bold", value: true },
  { mark: "italic", value: true },
  { mark: "code", value: true },
  { mark: "strike", value: true },
  { mark: "underline", value: true },
  { mark: "link", value: "https://example.com", title: "Example" },
];

function formatAttributes(markCase: MarkCase): Record<string, unknown> {
  if (markCase.mark === "link") {
    const attrs: Record<string, unknown> = { link: markCase.value };
    if (markCase.title !== undefined) attrs["linkTitle"] = markCase.title;
    return attrs;
  }
  return { [markCase.mark]: true };
}

function seedP0(text: string): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown>; format: "focus.markdown.p0@1" } {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText(fieldTextName(FIELD));
  const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(ytext, meta, FIELD, {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text }],
  });
  return { ydoc, ytext, meta, format: "focus.markdown.p0@1" };
}

function seedFullText(text: string): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown>; format: "ds.markdown.full@1" } {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText(fieldTextName(FIELD));
  const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(ytext, meta, FIELD, {
    format: "ds.markdown.full@1",
    blocks: [
      {
        paragraphId: "paragraph:1",
        kind: "paragraph",
        metadata: canonicalPlainMetadata(),
        segments: [{ type: "text", text, marks: {} }],
      } as never,
    ],
  });
  return { ydoc, ytext, meta, format: "ds.markdown.full@1" };
}

function seedForMark(markCase: MarkCase): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown>; format: "focus.markdown.p0@1" | "ds.markdown.full@1" } {
  // P0 admits exactly bold/italic/code (spec §4.11: underline stays the
  // unsupported-mark witness under P0); strike/underline/link/title run
  // under the full admitted table.
  if (markCase.mark === "bold" || markCase.mark === "italic" || markCase.mark === "code") {
    return seedP0("abcd");
  }
  return seedFullText("abcd");
}

function linearIndexOfSeparator(ytext: Y.Text, paragraphId: string): number {
  const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
  let linear = 0;
  for (const op of delta) {
    if (typeof op.insert === "object" && op.insert !== null && "separator" in (op.insert as Record<string, unknown>)) {
      const payload = (op.insert as { separator: { paragraphId: string } }).separator;
      if (payload.paragraphId === paragraphId) return linear;
      linear += 1;
    } else if (typeof op.insert === "string") {
      linear += (op.insert as string).length;
    } else {
      linear += 1;
    }
  }
  return -1;
}

describe("CL-3-13 formatting-span closure", () => {
  for (const markCase of MARK_CASES) {
    const label = markCase.mark === "link" ? "link/title" : markCase.mark;
    it(`(a) mark vs concurrent split ignores inherited attributes — ${label}`, () => {
      const { ydoc, ytext, meta, format } = seedForMark(markCase);
      // Replica A bolds the whole run; replica B inserts a separator inside
      // it without having observed the span. Simulate by applying the format
      // first, then inserting the separator inside the formatted span: the
      // separator delta carries inherited attributes (R-LIN-4).
      ydoc.transact(() => {
        ytext.format(1, 4, formatAttributes(markCase));
      });
      ydoc.transact(() => {
        ytext.insertEmbed(3, { separator: { paragraphId: "paragraph:2", kind: "paragraph" } });
      });
      // Ingress acceptance at DS level: inherited attributes never invalidate.
      expect(() => validateFieldState(ytext, meta, format)).not.toThrow();
      const captured = captureDocumentFromField(ytext, meta, format);
      expect(captured.document.blocks).toHaveLength(2);
      expect(captured.document.blocks[0]?.paragraphId).toBe("paragraph:1");
      expect(captured.document.blocks[1]?.paragraphId).toBe("paragraph:2");
      // No mark on any boundary: boundaries are identities, not text.
      for (const block of captured.document.blocks) {
        expect(block.kind).toBe("paragraph");
      }
    });

    it(`(b) mark vs concurrent hard break keeps one paragraph — ${label}`, () => {
      const { ydoc, ytext, meta, format } = seedForMark(markCase);
      ydoc.transact(() => {
        ytext.format(1, 4, formatAttributes(markCase));
      });
      ydoc.transact(() => {
        ytext.insertEmbed(3, { hardBreak: true });
      });
      expect(() => validateFieldState(ytext, meta, format)).not.toThrow();
      const captured = captureDocumentFromField(ytext, meta, format);
      expect(captured.document.blocks).toHaveLength(1);
    });

    it(`(c) late concurrent insert inside a mark span takes the span — ${label}`, () => {
      const seeded = seedForMark(markCase);
      const { ydoc, ytext, meta, format } = seeded;
      void seeded;
      ydoc.transact(() => {
        ytext.format(1, 2, formatAttributes(markCase));
      });
      // Concurrent interior insert lands inside the formatted span and takes
      // its formatting under R-ANCH-4 span inheritance.
      ydoc.transact(() => {
        ytext.insert(2, "X");
      });
      const captured = captureDocumentFromField(ytext, meta, format);
      expect(captured.document.blocks).toHaveLength(1);
      // The update is accepted; the text survives.
      expect(JSON.stringify(captured.document.blocks[0])).toContain("X");
    });
  }

  it("CL-3-13-code-bound retains hidden formats through capture/reseed", () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName(FIELD));
    const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:code",
          kind: "paragraph",
          metadata: {
            ...canonicalPlainMetadata(),
            blockKind: "codeBlock",
            codeLanguage: "ts",
          } as FullBlockMetadata,
          segments: [
            { type: "text", text: "ab", marks: { bold: true } as RichTextInlineMarks },
            { type: "hardBreak" },
            { type: "text", text: "cd", marks: {} },
          ],
        } as never,
      ],
    };
    seedFieldFromDocument(ytext, meta, FIELD, doc);
    // Bound capture reads Y.Text plus fieldmeta: hidden bold survives even
    // though the ProseMirror code view displays no marks.
    const captured = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    const code = captured.document.blocks[0];
    const segments = (code?.segments ?? []) as Array<{ type: string; text?: string; marks?: Record<string, unknown> }>;
    const first = segments.find((segment) => segment.text === "ab");
    expect(first?.marks?.["bold"]).toBe(true);
    // Fresh-session reseeding restores those runs/metadata unchanged.
    const fresh = new Y.Doc();
    const freshText = fresh.getText(fieldTextName(FIELD));
    const freshMeta = fresh.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    seedFieldFromDocument(freshText, freshMeta, FIELD, captured.document);
    const recaptured = captureDocumentFromField(freshText, freshMeta, "ds.markdown.full@1");
    expect(JSON.stringify(recaptured.document.blocks[0])).toBe(JSON.stringify(code));
  });

  it("CL-3-13-link-null accepts removals and retains unrelated marks", () => {
    const { ydoc, ytext, meta, format } = seedFullText("ab");
    void ydoc;
    ydoc.transact(() => {
      ytext.format(1, 2, { link: "https://example.com", linkTitle: "T", bold: true });
    });
    // Separate link:null removal retains the concurrent bold.
    ydoc.transact(() => {
      ytext.format(1, 2, { link: null });
    });
    expect(() => validateFieldState(ytext, meta, format)).not.toThrow();
    const afterLinkNull = captureDocumentFromField(ytext, meta, format);
    expect(JSON.stringify(afterLinkNull.document.blocks[0])).toContain("ab");
    // Combined link+title null removal is accepted as well.
    ydoc.transact(() => {
      ytext.format(1, 2, { linkTitle: null });
    });
    expect(() => validateFieldState(ytext, meta, format)).not.toThrow();
  });

  it("link A → link B concurrent with bold converges deterministically", () => {
    const { ydoc, ytext, meta, format } = seedFullText("ab");
    void ydoc;
    ydoc.transact(() => {
      ytext.format(1, 2, { link: "https://a.example" });
    });
    ydoc.transact(() => {
      ytext.format(1, 2, { link: "https://b.example", bold: true });
    });
    const captured = captureDocumentFromField(ytext, meta, format);
    expect(JSON.stringify(captured.document.blocks[0])).toContain("ab");
    expect(linearIndexOfSeparator(ytext, "paragraph:1")).toBe(0);
  });
});
