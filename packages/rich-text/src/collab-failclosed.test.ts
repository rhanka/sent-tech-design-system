/**
 * CL-3a fix 1 — B4 fail-closed projection + to-fix 1 (hard-break in preserved).
 * Each invalid shared state raises a binding error and keeps the previous PM.
 * RED on 72fa8631: forbidden href, unknown/malformed marks, HR id mismatch
 * and preserved-segment embeds passed silently (or were dropped).
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  seedFieldFromDocument,
  captureDocumentFromField,
  fieldTextName,
  fieldMetaName,
} from "./collab-codec.js";
import { yTextToPmDoc, applyRemoteUpdateIncrementally } from "./collab-projection.js";
import { createRichTextEditor } from "./editor.js";
import type { RichTextDocument } from "./model.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const FIELD = "body";
const MESSAGES = {
  editorLabel: "L",
  placeholder: "P",
  preservedBlockLabel: "K-{kind}",
  externalConflictLabel: "C",
};

function p0Doc(): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [
      { paragraphId: "paragraph:1", kind: "paragraph", text: "alpha" },
      { paragraphId: "paragraph:2", kind: "paragraph", text: "beta" },
    ],
  };
}

function freshFullDoc(): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown> } {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText(fieldTextName(FIELD));
  const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(ytext, meta, FIELD, p0Doc());
  return { ydoc, ytext, meta };
}

describe("CL-3a-B4 fail-closed capture", () => {
  it("forbidden href refuses from both mark-conversion directions", () => {
    const { ytext, meta } = freshFullDoc();
    ytext.doc?.transact(() => {
      ytext.format(1, 2, { link: "javascript:alert(1)" });
    });
    expect(() => captureDocumentFromField(ytext, meta, "focus.markdown.p0@1")).toThrow(
      "rich-text.collab-invalid-mark",
    );
  });

  it("unknown and malformed marks refuse the whole update", () => {
    {
      const { ytext, meta } = freshFullDoc();
      ytext.doc?.transact(() => {
        ytext.format(1, 2, { evilmark: true } as never);
      });
      expect(() => captureDocumentFromField(ytext, meta, "focus.markdown.p0@1")).toThrow(
        "rich-text.collab-invalid-mark",
      );
    }
    {
      const { ytext, meta } = freshFullDoc();
      ytext.doc?.transact(() => {
        ytext.format(1, 2, { bold: "yes" } as never);
      });
      expect(() => captureDocumentFromField(ytext, meta, "focus.markdown.p0@1")).toThrow(
        "rich-text.collab-invalid-mark",
      );
    }
  });

  it("HR atom id mismatch refuses the whole update", () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName(FIELD));
    const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        { paragraphId: "p:hr", kind: "horizontalRule" } as never,
        {
          paragraphId: "p:after",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata() },
          segments: [{ type: "text", text: "after", marks: {} }],
        } as never,
      ],
    };
    seedFieldFromDocument(ytext, meta, FIELD, doc);
    // Corrupt the HR atom identity (separator p:hr, atom p:other).
    const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
    let atomIndex = -1;
    let linear = 0;
    for (const op of delta) {
      if (typeof op.insert === "object" && op.insert !== null) {
        const insert = op.insert as { horizontalRule?: { paragraphId?: string } };
        if (insert.horizontalRule !== undefined && atomIndex === -1) atomIndex = linear;
        linear += 1;
      } else if (typeof op.insert === "string") {
        linear += (op.insert as string).length;
      } else {
        linear += 1;
      }
    }
    expect(atomIndex).toBeGreaterThanOrEqual(0);
    ydoc.transact(() => {
      ytext.delete(atomIndex, 1);
      ytext.insertEmbed(atomIndex, { horizontalRule: { paragraphId: "p:other" } });
    });
    expect(() => captureDocumentFromField(ytext, meta, "ds.markdown.full@1")).toThrow(
      "rich-text.collab-invalid-hr",
    );
  });

  it("non-preserved embed inside a preserved segment refuses (to-fix 1)", async () => {
    const schemaEd = await createRichTextEditor({
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          { paragraphId: "p:s", kind: "paragraph", metadata: { ...canonicalPlainMetadata() }, segments: [{ type: "text", text: "x", marks: {} }] } as never,
        ],
      },
      profile: "full",
      messages: { ...MESSAGES },
      allocateId: () => "test:schema:1",
      element: globalThis.document.createElement("div"),
    });
    const schema = schemaEd.view.state.schema;
    schemaEd.destroy();
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText(fieldTextName(FIELD));
    const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:keep",
          kind: "preserved",
          preservedKind: "math",
          raw: "$$x$$",
          metadata: { ...canonicalPlainMetadata() },
        } as never,
      ],
    };
    seedFieldFromDocument(ytext, meta, FIELD, doc);
    // Insert a hard-break embed inside the preserved segment (after its separator).
    let sepIndex = -1;
    let linear = 0;
    for (const op of ytext.toDelta() as Array<{ insert?: unknown }>) {
      if (typeof op.insert === "object" && op.insert !== null) {
        if (sepIndex === -1) sepIndex = linear;
        linear += 1;
      } else if (typeof op.insert === "string") {
        linear += (op.insert as string).length;
      } else {
        linear += 1;
      }
    }
    expect(sepIndex).toBeGreaterThanOrEqual(0);
    ydoc.transact(() => {
      ytext.insertEmbed(sepIndex + 1, { hardBreak: true });
    });
    expect(() => captureDocumentFromField(ytext, meta, "ds.markdown.full@1")).toThrow(
      "rich-text.collab-invalid-segment",
    );
    expect(() => yTextToPmDoc(ytext, meta, "ds.markdown.full@1", schema)).toThrow(
      "rich-text.collab-invalid-segment",
    );
  });

  it("invalid remote keeps the previous PM document", async () => {
    const ed = await createRichTextEditor({
      document: p0Doc(),
      messages: { ...MESSAGES },
      allocateId: () => "test:prev:1",
      element: globalThis.document.createElement("div"),
    });
    try {
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText(fieldTextName(FIELD));
      const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
      seedFieldFromDocument(ytext, meta, FIELD, p0Doc());
      const before = ed.view.state.doc.toJSON();
      ytext.doc?.transact(() => {
        ytext.format(1, 2, { link: "javascript:alert(1)" });
      });
      expect(() =>
        applyRemoteUpdateIncrementally({
          view: ed.view,
          ytext,
          fieldMeta: meta,
          format: "focus.markdown.p0@1",
          fieldKey: FIELD,
          affectedParagraphIds: ["paragraph:1"],
        }),
      ).toThrow("rich-text.collab-invalid-mark");
      expect(ed.view.state.doc.toJSON()).toEqual(before);
    } finally {
      ed.destroy();
    }
  });
});
