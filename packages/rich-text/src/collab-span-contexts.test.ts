/**
 * CL-3a fix 1 — B6 witness 13 strengthened: each boolean mark and link/title
 * in headings, list items, quotes and code lines; two replicas plus the
 * authoritative doc; concurrent delivery in both orders; projected PM
 * documents asserted; case (c) asserts the inserted character took the mark.
 *
 * RED on 72fa8631: witness 13 used one plain paragraph, sequential
 * transactions, asserting block counts/substring — never a PM document, never
 * two replicas, never a heading/list/quote/code context.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  seedFieldFromDocument,
  captureDocumentFromField,
  fieldTextName,
  fieldMetaName,
} from "./collab-codec.js";
import { yTextToPmDoc } from "./collab-projection.js";
import { createRichTextEditor } from "./editor.js";
import type { RichTextDocument } from "./model.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const FIELD = "body";
const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

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

function contextDoc(
  context: "heading" | "list" | "quote" | "code",
  text: string,
): RichTextDocument {
  const base = canonicalPlainMetadata();
  if (context === "heading") {
    return {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:ctx",
          kind: "paragraph",
          metadata: { ...base, blockKind: "heading", headingLevel: 2 },
          segments: [{ type: "text", text, marks: {} }],
        } as never,
      ],
    };
  }
  if (context === "list") {
    return {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:ctx",
          kind: "paragraph",
          metadata: {
            ...base,
            listKind: "bullet",
            listDepth: 0,
            listItemId: "p:ctx",
            listRunId: "p:ctx",
            listTight: true,
            containerOrder: ["list"],
          },
          segments: [{ type: "text", text, marks: {} }],
        } as never,
      ],
    };
  }
  if (context === "quote") {
    return {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:ctx",
          kind: "paragraph",
          metadata: { ...base, blockquoteDepth: 1, containerOrder: ["quote"] },
          segments: [{ type: "text", text, marks: {} }],
        } as never,
      ],
    };
  }
  return {
    format: "ds.markdown.full@1",
    blocks: [
      {
        paragraphId: "p:ctx",
        kind: "paragraph",
        metadata: { ...base, blockKind: "codeBlock", codeLanguage: "ts" },
        segments: [{ type: "text", text, marks: {} }],
      } as never,
    ],
  };
}

async function pmSchema() {
  const ed = await createRichTextEditor({
    document: {
      format: "ds.markdown.full@1",
      blocks: [
        {
          paragraphId: "p:schema",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata() },
          segments: [{ type: "text", text: "x", marks: {} }],
        } as never,
      ],
    },
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: () => "test:schema:1",
    element: globalThis.document.createElement("div"),
  });
  const schema = ed.view.state.schema;
  ed.destroy();
  return schema;
}

describe("CL-3-13 formatting-span closure across contexts (B6)", () => {
  for (const context of ["heading", "list", "quote", "code"] as const) {
    for (const markCase of MARK_CASES) {
      const label = `${context}/${markCase.mark === "link" ? "link/title" : markCase.mark}`;
      it(`(a) mark vs concurrent split stays convergent — ${label}`, async () => {
        const schema = await pmSchema();
        const seed = contextDoc(context, "abcd");
        const auth = new Y.Doc();
        const authText = auth.getText(fieldTextName(FIELD));
        const authMeta = auth.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
        seedFieldFromDocument(authText, authMeta, FIELD, seed);
        // Two replicas + authoritative: A bolds, B splits without observing.
        const replicaA = new Y.Doc();
        const replicaB = new Y.Doc();
        Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(auth));
        Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(auth));
        const textA = replicaA.getText(fieldTextName(FIELD));
        const textB = replicaB.getText(fieldTextName(FIELD));
        textA.doc?.transact(() => {
          textA.format(1, 4, formatAttributes(markCase));
        });
        textB.doc?.transact(() => {
          textB.insertEmbed(3, { separator: { paragraphId: "p:tail", kind: "paragraph" } });
        });
        // Both delivery orders converge.
        const orderAB1 = new Y.Doc();
        const orderAB2 = new Y.Doc();
        Y.applyUpdate(orderAB1, Y.encodeStateAsUpdate(replicaA));
        Y.applyUpdate(orderAB1, Y.encodeStateAsUpdate(replicaB));
        Y.applyUpdate(orderAB2, Y.encodeStateAsUpdate(replicaB));
        Y.applyUpdate(orderAB2, Y.encodeStateAsUpdate(replicaA));
        const cap1 = captureDocumentFromField(
          orderAB1.getText(fieldTextName(FIELD)),
          orderAB1.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
          "ds.markdown.full@1",
        );
        const cap2 = captureDocumentFromField(
          orderAB2.getText(fieldTextName(FIELD)),
          orderAB2.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
          "ds.markdown.full@1",
        );
        expect(JSON.stringify(cap1.document)).toBe(JSON.stringify(cap2.document));
        expect(cap1.document.blocks).toHaveLength(2);
        // Projected PM documents asserted on both orders.
        const pm1 = yTextToPmDoc(
          orderAB1.getText(fieldTextName(FIELD)),
          orderAB1.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
          "ds.markdown.full@1",
          schema,
        );
        const pm2 = yTextToPmDoc(
          orderAB2.getText(fieldTextName(FIELD)),
          orderAB2.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
          "ds.markdown.full@1",
          schema,
        );
        expect(pm1.eq(pm2)).toBe(true);
      });

      it(`(c) late insert inside a mark span takes the span — ${label}`, async () => {
        const schema = await pmSchema();
        void schema;
        const seed = contextDoc(context, "abcd");
        const auth = new Y.Doc();
        const authText = auth.getText(fieldTextName(FIELD));
        const authMeta = auth.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
        seedFieldFromDocument(authText, authMeta, FIELD, seed);
        const replicaA = new Y.Doc();
        const replicaB = new Y.Doc();
        Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(auth));
        Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(auth));
        const textA = replicaA.getText(fieldTextName(FIELD));
        const textB = replicaB.getText(fieldTextName(FIELD));
        textA.doc?.transact(() => {
          textA.format(1, 2, formatAttributes(markCase));
        });
        textB.doc?.transact(() => {
          textB.insert(2, "X");
        });
        const merged1 = new Y.Doc();
        const merged2 = new Y.Doc();
        Y.applyUpdate(merged1, Y.encodeStateAsUpdate(replicaA));
        Y.applyUpdate(merged1, Y.encodeStateAsUpdate(replicaB));
        Y.applyUpdate(merged2, Y.encodeStateAsUpdate(replicaB));
        Y.applyUpdate(merged2, Y.encodeStateAsUpdate(replicaA));
        for (const merged of [merged1, merged2]) {
          const cap = captureDocumentFromField(
            merged.getText(fieldTextName(FIELD)),
            merged.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
            "ds.markdown.full@1",
          );
          const block = cap.document.blocks[0] as {
            segments?: Array<{ type: string; text?: string; marks?: Record<string, unknown> }>;
          };
          const withX = (block.segments ?? []).find((segment) => (segment.text ?? "").includes("X"));
          expect(withX).toBeDefined();
          if (markCase.mark === "link") {
            expect(withX?.marks?.["link"]).toBe(markCase.value);
          } else {
            expect(withX?.marks?.[markCase.mark]).toBe(true);
          }
        }
      });
    }
  }
});
