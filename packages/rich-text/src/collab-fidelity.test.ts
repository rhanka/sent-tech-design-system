/**
 * CL-3a witness 11 — projection fidelity, full (spec §8 CL-3 (11), §4.3.1,
 * §4.3.2, R-FULL-META-1/2, R-FULL-CODE-1, R-FULL-HR-1).
 *
 * Capture → fresh Y.Text/metadata seed → remount equality for every
 * F01–F19 kind and attribute, plus CL-3-11-metadata-defaults,
 * CL-3-11-run-start-depth and CL-3-11-run-opener-delete on the authoritative
 * doc and at least two replicas including reversed delivery.
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
} from "./collab-codec.js";
import type { RichTextDocument } from "./model.js";
import type { FullBlockMetadata, RichTextInlineMarks } from "./collaboration.js";
import { canonicalHrDefaults, canonicalPlainMetadata } from "./editor-full-markdown.js";
import { richTextDocumentsEqual } from "./document.js";

const FIELD = "body";

function marks(partial: Partial<Record<string, unknown>> = {}): RichTextInlineMarks {
  return { ...partial } as RichTextInlineMarks;
}

function textRun(text: string, partial: Partial<Record<string, unknown>> = {}) {
  return { type: "text" as const, text, marks: marks(partial) };
}

function para(
  id: string,
  segments: RichTextDocument["blocks"][number]["segments"] = [],
  partial: Partial<FullBlockMetadata> = {},
): RichTextDocument["blocks"][number] {
  return {
    paragraphId: id,
    kind: "paragraph",
    metadata: { ...canonicalPlainMetadata(), ...partial } as FullBlockMetadata,
    segments: segments as never,
  } as RichTextDocument["blocks"][number];
}

function fullFixture(): RichTextDocument {
  return {
    format: "ds.markdown.full@1",
    blocks: [
      // F01 paragraphs + empty
      para("p:plain", [textRun("plain")]),
      para("p:empty", []),
      // F02 all heading levels
      para("p:h1", [textRun("heading one")], { blockKind: "heading", headingLevel: 1 }),
      para("p:h2", [textRun("heading two")], { blockKind: "heading", headingLevel: 2 }),
      para("p:h3", [textRun("heading three")], { blockKind: "heading", headingLevel: 3 }),
      para("p:h4", [textRun("heading four")], { blockKind: "heading", headingLevel: 4 }),
      para("p:h5", [textRun("heading five")], { blockKind: "heading", headingLevel: 5 }),
      para("p:h6", [textRun("heading six")], { blockKind: "heading", headingLevel: 6 }),
      // F03/F04/F05 lists: bullet, ordered with start/type, nested, mixed, continuation
      para("p:bullet-1", [textRun("bullet one")], {
        listKind: "bullet", listDepth: 0, listItemId: "p:bullet-1", listRunId: "p:bullet-1", listTight: true,
        containerOrder: ["list"],
      }),
      para("p:bullet-2", [textRun("bullet two")], {
        listKind: "bullet", listDepth: 0, listItemId: "p:bullet-2", listRunId: "p:bullet-1",
        containerOrder: ["list"],
      }),
      para("p:ordered-1", [textRun("ordered one")], {
        listKind: "ordered", listDepth: 0, listItemId: "p:ordered-1", listRunId: "p:ordered-1",
        orderedStart: 3, orderedType: "a", listTight: true, containerOrder: ["list"],
      }),
      para("p:ordered-2", [textRun("ordered two")], {
        listKind: "ordered", listDepth: 0, listItemId: "p:ordered-2", listRunId: "p:ordered-1",
        containerOrder: ["list"],
      }),
      para("p:nested", [textRun("nested")], {
        listKind: "bullet", listDepth: 1, listItemId: "p:nested", listRunId: "p:bullet-1",
        containerOrder: ["list", "list"],
      }),
      para("p:continuation", [textRun("continuation")], {
        listKind: "bullet", listDepth: 0, listItemId: "p:bullet-2", listRunId: "p:bullet-1",
        containerOrder: ["list"],
      }),
      // F08 blockquotes (single, nested, with continuation)
      para("p:quote-1", [textRun("quoted")], {
        blockquoteDepth: 1, containerOrder: ["quote"],
      }),
      para("p:quote-2", [textRun("deep quote")], {
        blockquoteDepth: 2, containerOrder: ["quote", "quote"],
      }),
      para("p:quote-list", [textRun("quoted list")], {
        listKind: "bullet", listDepth: 0, listItemId: "p:quote-list", listRunId: "p:quote-list",
        blockquoteDepth: 1, containerOrder: ["quote", "list"],
      }),
      // F10 multiline code with language (incl leading/internal/trailing LF)
      para("p:code", [
        textRun("const a = 1;"),
        { type: "hardBreak" },
        textRun("const b = 2;"),
        { type: "hardBreak" },
        { type: "hardBreak" },
        textRun("const c = 3;"),
      ], { blockKind: "codeBlock", codeLanguage: "ts" }),
      // F06/F07/F09/F11-F14 all mark combinations with href/title
      para("p:marks", [
        textRun("bold", { bold: true }),
        textRun("italic", { italic: true }),
        textRun("code", { code: true }),
        textRun("strike", { strike: true }),
        textRun("underline", { underline: true }),
        textRun("link", { link: "https://example.com", linkTitle: "Example" }),
        textRun("combo", { bold: true, italic: true, link: "https://example.com/x" }),
      ]),
      // F16 hard breaks incl consecutive/final
      para("p:breaks", [
        textRun("a"),
        { type: "hardBreak" },
        { type: "hardBreak" },
        textRun("b"),
        { type: "hardBreak" },
      ]),
      // F15 HR identities
      { paragraphId: "p:hr-1", kind: "horizontalRule", hrMetadata: canonicalHrDefaults() },
      para("p:after-hr", [textRun("after rule")]),
      // Preserved raw
      { paragraphId: "p:kept", kind: "preserved", raw: "<table>verbatim</table>", preservedKind: "table" },
    ],
  };
}

function seedFresh(doc: RichTextDocument): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown> } {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText(fieldTextName(FIELD));
  const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(ytext, meta, FIELD, doc);
  return { ydoc, ytext, meta };
}

describe("CL-3-11 projection fidelity, full", () => {
  it("capture → fresh seed → remount equality for every F01–F19 kind", () => {
    const fixture = fullFixture();
    const { ydoc, ytext, meta } = seedFresh(fixture);
    const captured = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    expect(richTextDocumentsEqual(captured.document, fixture)).toBe(true);

    // Fresh Y.Text/metadata seed from the capture, then remount equality.
    const reseeded = seedFresh(captured.document);
    const recaptured = captureDocumentFromField(reseeded.ytext, reseeded.meta, "ds.markdown.full@1");
    expect(richTextDocumentsEqual(recaptured.document, fixture)).toBe(true);
    expect(recaptured.document.blocks.map((b) => b.paragraphId)).toEqual(
      fixture.blocks.map((b) => b.paragraphId),
    );
    expect(Y.encodeStateAsUpdate(ydoc).length).toBeGreaterThan(0);
  });

  it("authoritative doc and two replicas agree including reversed delivery", () => {
    const fixture = fullFixture();
    const auth = seedFresh(fixture);
    const replicaA = new Y.Doc();
    const replicaB = new Y.Doc();
    const update = Y.encodeStateAsUpdate(auth.ydoc);
    // Reversed delivery: B applies first, A second — same converged state.
    Y.applyUpdate(replicaB, update);
    Y.applyUpdate(replicaA, update);
    // Concurrent list-depth write on A vs text insert on B, then sync.
    const metaA = replicaA.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    const textB = replicaB.getText(fieldTextName(FIELD));
    metaA.set("p:bullet-2", {
      ...canonicalPlainMetadata(),
      listKind: "bullet",
      listDepth: 1,
      listItemId: "p:bullet-2",
      listRunId: "p:bullet-1",
      containerOrder: ["list", "list"],
    });
    textB.insert(1, "!");
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(replicaB));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(replicaA));
    Y.applyUpdate(auth.ydoc, Y.encodeStateAsUpdate(replicaA));

    const capAuth = captureDocumentFromField(auth.ytext, auth.meta, "ds.markdown.full@1");
    const capA = captureDocumentFromField(
      replicaA.getText(fieldTextName(FIELD)),
      replicaA.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
    );
    const capB = captureDocumentFromField(
      replicaB.getText(fieldTextName(FIELD)),
      replicaB.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
    );
    expect(richTextDocumentsEqual(capA.document, capAuth.document)).toBe(true);
    expect(richTextDocumentsEqual(capB.document, capAuth.document)).toBe(true);
    // Text survives on every replica; no flattening.
    const plain = capAuth.document.blocks.find((b) => b.paragraphId === "p:plain");
    expect(JSON.stringify(plain)).toContain("!");
  });

  it("CL-3-11-metadata-defaults materializes canonical defaults without repair", () => {
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        { paragraphId: "p:nodefault", kind: "paragraph", segments: [{ type: "text", text: "x", marks: {} }] } as never,
        { paragraphId: "p:hr-nodefault", kind: "horizontalRule" },
      ],
    };
    const { ytext, meta } = seedFresh(doc);
    // No metadata entries were written for absent records.
    expect(meta.has("p:nodefault")).toBe(false);
    expect(meta.has("p:hr-nodefault")).toBe(false);
    const captured = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    const plain = captured.document.blocks.find((b) => b.paragraphId === "p:nodefault");
    expect(plain?.metadata).toEqual(canonicalPlainMetadata());
    const hr = captured.document.blocks.find((b) => b.paragraphId === "p:hr-nodefault");
    expect(hr?.hrMetadata).toEqual(canonicalHrDefaults());
    // Capture performed no shared repair write.
    expect(meta.has("p:nodefault")).toBe(false);
    expect(meta.has("p:hr-nodefault")).toBe(false);
  });

  it("CL-3-11-run-start-depth keeps source values and member depths apart", () => {
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        para("p:run", [textRun("one")], {
          listKind: "ordered", listDepth: 0, listItemId: "p:run", listRunId: "p:run",
          orderedStart: 1, orderedType: "1", listTight: true, containerOrder: ["list"],
        }),
        para("p:member", [textRun("two")], {
          listKind: "ordered", listDepth: 0, listItemId: "p:member", listRunId: "p:run",
          containerOrder: ["list"],
        }),
      ],
    };
    const auth = seedFresh(doc);
    const replicaA = new Y.Doc();
    const replicaB = new Y.Doc();
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(auth.ydoc));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(auth.ydoc));
    // Source opener start/type/tight change races a member depth change.
    (replicaA.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>).set("p:run", {
      ...canonicalPlainMetadata(),
      blockKind: "paragraph",
      listKind: "ordered",
      listDepth: 0,
      listItemId: "p:run",
      listRunId: "p:run",
      orderedStart: 5,
      orderedType: "a",
      listTight: false,
      containerOrder: ["list"],
    });
    (replicaB.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>).set("p:member", {
      ...canonicalPlainMetadata(),
      blockKind: "paragraph",
      listKind: "ordered",
      listDepth: 2,
      listItemId: "p:member",
      listRunId: "p:run",
      containerOrder: ["list", "list", "list"],
    });
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(replicaB));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(replicaA));
    const capA = captureDocumentFromField(
      replicaA.getText(fieldTextName(FIELD)),
      replicaA.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
    );
    const capB = captureDocumentFromField(
      replicaB.getText(fieldTextName(FIELD)),
      replicaB.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
    );
    expect(richTextDocumentsEqual(capA.document, capB.document)).toBe(true);
    const source = capA.document.blocks.find((b) => b.paragraphId === "p:run")?.metadata as FullBlockMetadata;
    expect(source.orderedStart).toBe(5);
    expect(source.orderedType).toBe("a");
    expect(source.listTight).toBe(false);
    const member = capA.document.blocks.find((b) => b.paragraphId === "p:member")?.metadata as FullBlockMetadata;
    expect(member.listDepth).toBe(2);
    expect(member.orderedStart).toBeUndefined();
  });

  it("CL-3-11-run-opener-delete promotes the first survivor without repair", () => {
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        para("p:intro", [textRun("intro")]),
        para("p:run", [textRun("one")], {
          listKind: "ordered", listDepth: 0, listItemId: "p:run", listRunId: "p:run",
          orderedStart: 7, orderedType: "I", listTight: true, containerOrder: ["list"],
        }),
        para("p:m2", [textRun("two")], {
          listKind: "ordered", listDepth: 0, listItemId: "p:m2", listRunId: "p:run",
          containerOrder: ["list"],
        }),
        para("p:m3", [textRun("three")], {
          listKind: "ordered", listDepth: 0, listItemId: "p:m3", listRunId: "p:run",
          containerOrder: ["list"],
        }),
      ],
    };
    const { ydoc, ytext, meta } = seedFresh(doc);
    // Merge the opener away into its predecessor (delete the opener's
    // separator, never the field's first): the opener text joins "intro".
    const delta = ytext.toDelta() as Array<{ insert?: unknown }>;
    let linear = 0;
    let openerIndex = -1;
    for (const op of delta) {
      if (typeof op.insert === "object" && op.insert !== null && "separator" in (op.insert as Record<string, unknown>)) {
        const payload = (op.insert as { separator: { paragraphId: string } }).separator;
        if (payload.paragraphId === "p:run") {
          openerIndex = linear;
          break;
        }
        linear += 1;
      } else if (typeof op.insert === "string") {
        linear += (op.insert as string).length;
      } else {
        linear += 1;
      }
    }
    expect(openerIndex).toBeGreaterThan(0);
    ydoc.transact(() => {
      ytext.delete(openerIndex, 1);
    });
    const captured = captureDocumentFromField(ytext, meta, "ds.markdown.full@1");
    // Stable run id retained; run values still come from the deleted source.
    expect(captured.document.retainedRunMetadata?.["p:run"]).toBeDefined();
    expect(captured.document.retainedRunMetadata?.["p:run"]?.orderedStart).toBe(7);
    // No member gained run fields.
    for (const block of captured.document.blocks) {
      if (block.paragraphId === "p:run") continue;
      const record = block.metadata as FullBlockMetadata | undefined;
      expect(record?.orderedStart).toBeUndefined();
    }
    // Reseed retains the referenced deleted source.
    const reseeded = seedFresh(captured.document);
    const recaptured = captureDocumentFromField(reseeded.ytext, reseeded.meta, "ds.markdown.full@1");
    expect(recaptured.document.retainedRunMetadata?.["p:run"]?.orderedStart).toBe(7);
  });

  it("CL-3-11-B6 wrappers and positions agree at PM level in both delivery orders", async () => {
    const { createRichTextEditor } = await import("./editor.js");
    const schemaEd = await createRichTextEditor({
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          { paragraphId: "p:s", kind: "paragraph", metadata: { ...canonicalPlainMetadata() }, segments: [{ type: "text", text: "x", marks: {} }] } as never,
        ],
      },
      profile: "full",
      messages: { editorLabel: "L", placeholder: "P", preservedBlockLabel: "K-{kind}", externalConflictLabel: "C" },
      allocateId: () => "test:schema:1",
      element: globalThis.document.createElement("div"),
    });
    const schema = schemaEd.view.state.schema;
    schemaEd.destroy();
    const { yTextToPmDoc } = await import("./collab-projection.js");
    const fixture = fullFixture();
    const auth = seedFresh(fixture);
    // Two concurrent pairs: same edits, opposite sync orders.
    const setupPair = (): { a: Y.Doc; b: Y.Doc } => {
      const a = new Y.Doc();
      const b = new Y.Doc();
      Y.applyUpdate(a, Y.encodeStateAsUpdate(auth.ydoc));
      Y.applyUpdate(b, Y.encodeStateAsUpdate(auth.ydoc));
      (a.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>).set("p:bullet-2", {
        ...canonicalPlainMetadata(),
        listKind: "bullet",
        listDepth: 1,
        listItemId: "p:bullet-2",
        listRunId: "p:bullet-1",
        containerOrder: ["list", "list"],
      });
      b.getText(fieldTextName(FIELD)).insert(1, "!");
      return { a, b };
    };
    const pair1 = setupPair();
    Y.applyUpdate(pair1.a, Y.encodeStateAsUpdate(pair1.b));
    Y.applyUpdate(pair1.b, Y.encodeStateAsUpdate(pair1.a));
    const pair2 = setupPair();
    Y.applyUpdate(pair2.b, Y.encodeStateAsUpdate(pair2.a));
    Y.applyUpdate(pair2.a, Y.encodeStateAsUpdate(pair2.b));
    const docs = [pair1.a, pair1.b, pair2.a, pair2.b].map((ydoc) =>
      yTextToPmDoc(
        ydoc.getText(fieldTextName(FIELD)),
        ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
        "ds.markdown.full@1",
        schema,
      ),
    );
    for (let index = 1; index < docs.length; index += 1) {
      expect(docs[index]?.eq(docs[0] as never)).toBe(true);
    }
    // Wrapper/position spot check at PM level: the sunk member sits nested.
    const json = JSON.stringify(docs[0]?.toJSON());
    expect(json).toContain("bulletList");
    expect(json).toContain("p:bullet-2");
  });

  it("CL-3-11-B6 code with leading and trailing LF converges at PM level", async () => {
    const { createRichTextEditor } = await import("./editor.js");
    const schemaEd = await createRichTextEditor({
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          { paragraphId: "p:s", kind: "paragraph", metadata: { ...canonicalPlainMetadata() }, segments: [{ type: "text", text: "x", marks: {} }] } as never,
        ],
      },
      profile: "full",
      messages: { editorLabel: "L", placeholder: "P", preservedBlockLabel: "K-{kind}", externalConflictLabel: "C" },
      allocateId: () => "test:schema:2",
      element: globalThis.document.createElement("div"),
    });
    const schema = schemaEd.view.state.schema;
    schemaEd.destroy();
    const { yTextToPmDoc } = await import("./collab-projection.js");
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:code",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata(), blockKind: "codeBlock", codeLanguage: "ts" },
          segments: [
            { type: "hardBreak" },
            { type: "text", text: "const a = 1;", marks: {} },
            { type: "hardBreak" },
          ],
        } as never,
      ],
    };
    const auth = seedFresh(doc);
    const replicaA = new Y.Doc();
    const replicaB = new Y.Doc();
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(auth.ydoc));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(auth.ydoc));
    replicaA.getText(fieldTextName(FIELD)).insert(3, "// ");
    replicaB.getText(fieldTextName(FIELD)).insert(5, "X");
    Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(replicaB));
    Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(replicaA));
    const pmA = yTextToPmDoc(
      replicaA.getText(fieldTextName(FIELD)),
      replicaA.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
      schema,
    );
    const pmB = yTextToPmDoc(
      replicaB.getText(fieldTextName(FIELD)),
      replicaB.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
      schema,
    );
    expect(pmA.eq(pmB)).toBe(true);
    expect(JSON.stringify(pmA.toJSON())).toContain("codeBlock");
  });

  it("CL-3-11-B6 opener delete promotes the first survivor at PM level", async () => {
    const { createRichTextEditor } = await import("./editor.js");
    const schemaEd = await createRichTextEditor({
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          { paragraphId: "p:s", kind: "paragraph", metadata: { ...canonicalPlainMetadata() }, segments: [{ type: "text", text: "x", marks: {} }] } as never,
        ],
      },
      profile: "full",
      messages: { editorLabel: "L", placeholder: "P", preservedBlockLabel: "K-{kind}", externalConflictLabel: "C" },
      allocateId: () => "test:schema:3",
      element: globalThis.document.createElement("div"),
    });
    const schema = schemaEd.view.state.schema;
    schemaEd.destroy();
    const { yTextToPmDoc } = await import("./collab-projection.js");
    const doc: RichTextDocument = {
      format: "ds.markdown.full@1",
      blocks: [
        { paragraphId: "p:intro", kind: "paragraph", segments: [{ type: "text", text: "intro", marks: {} }] } as never,
        {
          paragraphId: "p:run", kind: "paragraph",
          metadata: {
            ...canonicalPlainMetadata(), listKind: "ordered", listDepth: 0, listItemId: "p:run",
            listRunId: "p:run", orderedStart: 7, orderedType: "I", listTight: true, containerOrder: ["list"],
          },
          segments: [{ type: "text", text: "one", marks: {} }],
        } as never,
        {
          paragraphId: "p:m2", kind: "paragraph",
          metadata: {
            ...canonicalPlainMetadata(), listKind: "ordered", listDepth: 0, listItemId: "p:m2",
            listRunId: "p:run", containerOrder: ["list"],
          },
          segments: [{ type: "text", text: "two", marks: {} }],
        } as never,
      ],
    };
    const { ydoc, ytext } = seedFresh(doc);
    let sepIndex = -1;
    let linear = 0;
    for (const op of ytext.toDelta() as Array<{ insert?: unknown }>) {
      if (typeof op.insert === "object" && op.insert !== null) {
        if (sepIndex === -1 && linear > 0) {
          const payload = (op.insert as { separator?: { paragraphId?: string } }).separator;
          if (payload?.paragraphId === "p:run") sepIndex = linear;
        }
        linear += 1;
      } else if (typeof op.insert === "string") {
        linear += (op.insert as string).length;
      } else {
        linear += 1;
      }
    }
    expect(sepIndex).toBeGreaterThan(0);
    ydoc.transact(() => {
      ytext.delete(sepIndex, 1);
    });
    const pm = yTextToPmDoc(
      ytext,
      ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      "ds.markdown.full@1",
      schema,
    );
    const json = pm.toJSON() as { content?: Array<{ content?: Array<{ content?: Array<{ attrs?: { paragraphId?: string } }> }> }> };
    const ids: string[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) {
        for (const entry of node) walk(entry);
        return;
      }
      if (typeof node === "object" && node !== null) {
        const record = node as { type?: string; attrs?: { paragraphId?: string }; content?: unknown };
        if (record.attrs?.paragraphId !== undefined) ids.push(record.attrs.paragraphId);
        if (record.content !== undefined) walk(record.content);
      }
    };
    walk(json.content);
    expect(ids).toContain("p:m2");
    expect(ids).not.toContain("p:run");
  });
});
