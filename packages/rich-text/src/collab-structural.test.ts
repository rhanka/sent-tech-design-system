/**
 * CL-3a fix 1 — B3: nested split / sink / list-kind projection.
 * Ported from probe3/probe4 (RED on 72fa8631: split inside a list produced a
 * tail with listKind none outside the list; sink rewrote listRunId p:2→p:3).
 * Each case projects on two replicas and compares PM documents.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { createRichTextEditor, type RichTextEditor } from "./editor.js";
import { seedFieldFromDocument, captureDocumentFromField } from "./collab-codec.js";
import { projectPmTransactionToYText, yTextToPmDoc } from "./collab-projection.js";
import type { RichTextDocument } from "./model.js";

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) editor.destroy();
});

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const plain = () => ({
  blockKind: "paragraph" as const,
  listKind: "none" as const,
  listDepth: 0,
  blockquoteDepth: 0,
  containerOrder: [] as Array<"quote" | "list">,
});

function fullDoc(): RichTextDocument {
  return {
    format: "ds.markdown.full@1",
    blocks: [
      {
        paragraphId: "p:2",
        kind: "paragraph",
        metadata: { ...plain(), listKind: "bullet", listDepth: 0, listItemId: "p:2", listRunId: "p:2", listTight: true, containerOrder: ["list"] },
        segments: [{ type: "text", text: "item one", marks: {} }],
      } as never,
      {
        paragraphId: "p:3",
        kind: "paragraph",
        metadata: { ...plain(), listKind: "bullet", listDepth: 0, listItemId: "p:3", listRunId: "p:2", containerOrder: ["list"] },
        segments: [{ type: "text", text: "item two", marks: {} }],
      } as never,
    ],
  };
}

async function setup() {
  const ed = await createRichTextEditor({
    document: fullDoc(),
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:${(n += 1)}`;
    })(),
    element: globalThis.document.createElement("div"),
  });
  mounted.push(ed);
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText("field:body");
  const meta = ydoc.getMap("fieldmeta:body");
  seedFieldFromDocument(ytext, meta, "body", fullDoc());
  return { ed, ydoc, ytext, meta };
}

describe("CL-3a-B3 nested split and sink", () => {
  it("split inside a list keeps the tail in the run with a fresh item id", async () => {
    const { ed, ytext, meta } = await setup();
    const { TextSelection } = await import("@tiptap/pm/state");
    let pos = -1;
    ed.view.state.doc.descendants((node, p) => {
      if (node.isText && node.text?.includes("item two")) pos = p + 1;
    });
    expect(pos).toBeGreaterThan(0);
    const tr = ed.view.state.tr;
    tr.setSelection(TextSelection.create(ed.view.state.doc, pos));
    const splitPos = ed.view.state.selection.from;
    const splitTr = ed.view.state.tr;
    splitTr.split(splitPos, 1);
    projectPmTransactionToYText(
      { ytext, fieldMeta: meta, fieldKey: "body", allocateId: () => "fresh:tail", format: "ds.markdown.full@1" },
      ed.view.state.doc,
      splitTr,
    );
    const cap = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    const tail = cap.document.blocks.find((b) => b.paragraphId === "fresh:tail");
    expect(tail).toBeDefined();
    const tailMeta = (tail as { metadata?: Record<string, unknown> }).metadata ?? {};
    expect(tailMeta["listKind"]).toBe("bullet");
    expect(tailMeta["listRunId"]).toBe("p:2");
    expect(tailMeta["listItemId"]).toBe("fresh:tail");
    expect(tailMeta["orderedStart"]).toBeUndefined();
    // Two replicas converge on the same PM (tail inside the list).
    const replica = new Y.Doc();
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(ytext.doc as Y.Doc));
    const pm1 = yTextToPmDoc(ytext, meta, "ds.markdown.full@1", ed.view.state.schema);
    const pm2 = yTextToPmDoc(
      replica.getText("field:body"),
      replica.getMap("fieldmeta:body") as Y.Map<unknown>,
      "ds.markdown.full@1",
      ed.view.state.schema,
    );
    expect(pm1.eq(pm2)).toBe(true);
    expect(JSON.stringify(pm1.toJSON())).toContain("fresh:tail");
  });

  it("sink preserves the run id and lift removes the list wrapper", async () => {
    const schemaList = await import("@tiptap/pm/schema-list");
    const { TextSelection } = await import("@tiptap/pm/state");
    // Sink p:3 (depth 0→1, run stays p:2).
    {
      const { ed, ytext, meta } = await setup();
      let pos = -1;
      ed.view.state.doc.descendants((node, p) => {
        if (node.isText && node.text?.includes("item two")) pos = p + 1;
      });
      ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, pos)));
      const cmd = schemaList.sinkListItem(ed.view.state.schema.nodes.listItem);
      const trs: Array<{ steps: unknown[] } & Record<string, unknown>> = [];
      const ok = cmd(ed.view.state, ((tr: never) => {
        trs.push(tr as never);
      }) as never, ed.view);
      expect(ok).toBe(true);
      const tr = trs[0] as unknown as Parameters<typeof projectPmTransactionToYText>[2];
      projectPmTransactionToYText(
        { ytext, fieldMeta: meta, fieldKey: "body", allocateId: () => "fresh:sink", format: "ds.markdown.full@1" },
        ed.view.state.doc,
        tr,
      );
      const cap = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
      const sunk = cap.document.blocks.find((b) => b.paragraphId === "p:3");
      const sunkMeta = (sunk as { metadata?: Record<string, unknown> }).metadata ?? {};
      expect(sunkMeta["listDepth"]).toBe(1);
      expect(sunkMeta["listRunId"]).toBe("p:2");
      const pm1 = yTextToPmDoc(ytext, meta, "ds.markdown.full@1", ed.view.state.schema);
      const replica = new Y.Doc();
      Y.applyUpdate(replica, Y.encodeStateAsUpdate(ytext.doc as Y.Doc));
      const pm2 = yTextToPmDoc(
        replica.getText("field:body"),
        replica.getMap("fieldmeta:body") as Y.Map<unknown>,
        "ds.markdown.full@1",
        ed.view.state.schema,
      );
      expect(pm1.eq(pm2)).toBe(true);
    }
    // Lift p:3 (list→paragraph).
    {
      const { ed, ytext, meta } = await setup();
      let pos = -1;
      ed.view.state.doc.descendants((node, p) => {
        if (node.isText && node.text?.includes("item two")) pos = p + 1;
      });
      ed.view.dispatch(ed.view.state.tr.setSelection(TextSelection.create(ed.view.state.doc, pos)));
      const cmd = schemaList.liftListItem(ed.view.state.schema.nodes.listItem);
      const trs: Array<Parameters<typeof projectPmTransactionToYText>[2]> = [];
      const ok = cmd(ed.view.state, ((tr: never) => {
        trs.push(tr as never);
      }) as never, ed.view);
      expect(ok).toBe(true);
      projectPmTransactionToYText(
        { ytext, fieldMeta: meta, fieldKey: "body", allocateId: () => "fresh:lift", format: "ds.markdown.full@1" },
        ed.view.state.doc,
        trs[0] as never,
      );
      const cap = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
      const lifted = cap.document.blocks.find((b) => b.paragraphId === "p:3");
      const liftedMeta = (lifted as { metadata?: Record<string, unknown> }).metadata ?? {};
      expect(liftedMeta["listKind"]).toBe("none");
    }
  });

  it("bullet to ordered toggle projects the kind without touching the run", async () => {
    const { ed, ytext, meta } = await setup();
    // Toggle the whole bullet run to ordered via a PM wrapper replace:
    // derive the post-toggle PM by changing the list node type, then project
    // the wrapper change through metadata (text items never move).
    const { TextSelection } = await import("@tiptap/pm/state");
    let pos = -1;
    ed.view.state.doc.descendants((node, p) => {
      if (node.type.name === "bulletList") pos = p;
    });
    expect(pos).toBeGreaterThanOrEqual(0);
    const bullet = ed.view.state.doc.nodeAt(pos);
    expect(bullet?.type.name).toBe("bulletList");
    const orderedType = ed.view.state.schema.nodes.orderedList;
    const tr = ed.view.state.tr.setNodeMarkup(pos, orderedType, {
      ...bullet?.attrs,
      listRunId: "p:2",
    });
    tr.setSelection(TextSelection.create(tr.doc, 1));
    projectPmTransactionToYText(
      { ytext, fieldMeta: meta, fieldKey: "body", allocateId: () => "fresh:toggle", format: "ds.markdown.full@1" },
      ed.view.state.doc,
      tr,
    );
    const cap = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    for (const id of ["p:2", "p:3"]) {
      const block = cap.document.blocks.find((b) => b.paragraphId === id);
      const blockMeta = (block as { metadata?: Record<string, unknown> }).metadata ?? {};
      expect(blockMeta["listKind"]).toBe("ordered");
      expect(blockMeta["listRunId"]).toBe("p:2");
    }
  });
});
