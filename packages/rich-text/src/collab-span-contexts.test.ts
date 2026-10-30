/**
 * CL-3a fix 1 B6 + fix 2 B-NEW-8 — witness 13 per §8: each boolean mark and
 * link/title against concurrent splits, hard breaks, code-block splits and
 * HR insertions, in headings, list items, quotes and code lines; two replicas
 * plus the authoritative doc; concurrent delivery in both orders; projected
 * PM documents asserted; case (a) splits with the tail's metadata so the tail
 * keeps its context, asserting the PM node types and marks (none displayed
 * inside codeBlock, R-FULL-CODE-1); case (c) asserts the yTextToPmDoc output;
 * CL-3-13-code-bound runs the prose → code → prose cycle on real bound
 * editors while another replica formats the range — the hidden formats are
 * revealed on every replica when the block returns to prose.
 *
 * RED on 72fa8631 (fix 1): witness 13 used one plain paragraph, sequential
 * transactions, asserting block counts/substring — never a PM document, never
 * two replicas, never a heading/list/quote/code context.
 * RED on d484f514 (fix 2): case (a) split without tail metadata (the tail
 * left its context), case (c) never built the PM, no hard-break/code-split/
 * HR concurrency, and CL-3-13-code-bound was a capture-only reseed — no bound
 * editor, no second replica, no revealed formats.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import {
  seedFieldFromDocument,
  captureDocumentFromField,
  fieldTextName,
  fieldMetaName,
} from "./collab-codec.js";
import { yTextToPmDoc } from "./collab-projection.js";
import { createRichTextEditor, type RichTextEditor } from "./editor.js";
// CL-3a fix 3: the bound runtime is imported by the caller and injected
// through `collaborationRuntime` (the `"./editor"` entry never imports it).
import { createBoundRichTextEditor } from "./editor-bound.js";
import { createInMemoryTestDoubleProvider } from "./editor-collaboration.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import type { ProseMirrorNode } from "@tiptap/pm/model";
import type { RichTextDocument } from "./model.js";

const FIELD = "body";
const FULL = "ds.markdown.full@1";
const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) editor.destroy();
});

type Context = "heading" | "list" | "quote" | "code";
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

function contextDoc(context: Context, text: string): RichTextDocument {
  const base = canonicalPlainMetadata();
  if (context === "heading") {
    return {
      format: FULL,
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
      format: FULL,
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
      format: FULL,
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
    format: FULL,
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
      format: FULL,
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

/** Seeded authoritative doc plus two disconnected replicas. */
function replicas(seed: RichTextDocument): {
  textA: Y.Text;
  textB: Y.Text;
  metaB: Y.Map<unknown>;
} {
  const auth = new Y.Doc();
  const authText = auth.getText(fieldTextName(FIELD));
  const authMeta = auth.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  seedFieldFromDocument(authText, authMeta, FIELD, seed);
  const replicaA = new Y.Doc();
  const replicaB = new Y.Doc();
  Y.applyUpdate(replicaA, Y.encodeStateAsUpdate(auth));
  Y.applyUpdate(replicaB, Y.encodeStateAsUpdate(auth));
  return {
    textA: replicaA.getText(fieldTextName(FIELD)),
    textB: replicaB.getText(fieldTextName(FIELD)),
    metaB: replicaB.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
  };
}

/** Both delivery orders of the two replica updates, as PM documents plus
 * captures, asserted convergent. */
function textblocksOf(pm: ProseMirrorNode): ProseMirrorNode[] {
  const blocks: ProseMirrorNode[] = [];
  pm.descendants((node: ProseMirrorNode) => {
    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading" ||
      node.type.name === "codeBlock"
    ) {
      blocks.push(node);
    }
    return true;
  });
  return blocks;
}

function idsOf(pm: ProseMirrorNode): string[] {
  return textblocksOf(pm).map(
    (node) => (node.attrs as Record<string, unknown>)[PARAGRAPH_ID_ATTRIBUTE] as string,
  );
}

/** Concatenated PM text carrying the given mark ("" when no run displays it). */
function markedTexts(pm: ProseMirrorNode, markName: string): string {
  let out = "";
  pm.descendants((node: ProseMirrorNode) => {
    if (node.isText && node.marks.some((mark) => mark.type.name === markName)) {
      out += node.text ?? "";
    }
    return true;
  });
  return out;
}

function countNodes(pm: ProseMirrorNode, name: string): number {
  let count = 0;
  pm.descendants((node: ProseMirrorNode) => {
    if (node.type.name === name) count += 1;
    return true;
  });
  return count;
}

function bothOrders(
  replicaA: Y.Doc,
  replicaB: Y.Doc,
): Array<{
  ydoc: Y.Doc;
  pm: (schema: never) => ProseMirrorNode;
  capture: () => RichTextDocument;
}> {
  const orders = [0, 1].map((index) => {
    const merged = new Y.Doc();
    if (index === 0) {
      Y.applyUpdate(merged, Y.encodeStateAsUpdate(replicaA));
      Y.applyUpdate(merged, Y.encodeStateAsUpdate(replicaB));
    } else {
      Y.applyUpdate(merged, Y.encodeStateAsUpdate(replicaB));
      Y.applyUpdate(merged, Y.encodeStateAsUpdate(replicaA));
    }
    const text = merged.getText(fieldTextName(FIELD));
    const meta = merged.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    return {
      ydoc: merged,
      pm: ((schema: never) =>
        yTextToPmDoc(text, meta, FULL, schema as never)) as never,
      capture: () => captureDocumentFromField(text, meta, FULL).document,
    };
  });
  expect(JSON.stringify(orders[0]!.capture())).toBe(JSON.stringify(orders[1]!.capture()));
  return orders;
}

describe("CL-3-13 formatting-span closure across contexts (B6 + review 2 B-NEW-8)", () => {
  for (const context of ["heading", "list", "quote", "code"] as const) {
    for (const markCase of MARK_CASES) {
      const label = `${context}/${markCase.mark === "link" ? "link/title" : markCase.mark}`;
      const markName = markCase.mark === "link" ? "link" : markCase.mark;

      it(`(a) mark vs concurrent split keeps the tail in context — ${label}`, async () => {
        const schema = await pmSchema();
        const { textA, textB, metaB } = replicas(contextDoc(context, "abcd"));
        textA.doc?.transact(() => {
          textA.format(1, 4, formatAttributes(markCase));
        });
        // The split carries the tail's metadata: the tail stays in the same
        // context (review 2 B-NEW-8), so the projection never falls back to a
        // plain paragraph.
        textB.doc?.transact(() => {
          textB.insertEmbed(3, { separator: { paragraphId: "p:tail", kind: "paragraph" } });
          // R-FULL-META-1/2: the tail keeps the context (list kind/depth,
          // item and run) but never the run-source values, which live only
          // on the opener.
          const tailMeta = structuredClone(metaB.get("p:ctx")) as Record<string, unknown>;
          delete tailMeta["orderedStart"];
          delete tailMeta["orderedType"];
          delete tailMeta["listTight"];
          metaB.set("p:tail", tailMeta);
        });
        for (const order of bothOrders(textA.doc as Y.Doc, textB.doc as Y.Doc)) {
          const pm = order.pm(schema as never);
          expect(idsOf(pm)).toEqual(["p:ctx", "p:tail"]);
          const [head, tail] = textblocksOf(pm);
          if (context === "heading") {
            expect(head?.type.name).toBe("heading");
            expect(tail?.type.name).toBe("heading");
            expect(head?.attrs["level"]).toBe(2);
            expect(tail?.attrs["level"]).toBe(2);
          } else if (context === "list") {
            expect(countNodes(pm, "bulletList")).toBe(1);
            expect(countNodes(pm, "listItem")).toBe(1);
            expect(head?.type.name).toBe("paragraph");
            expect(tail?.type.name).toBe("paragraph");
          } else if (context === "quote") {
            expect(countNodes(pm, "blockquote")).toBe(1);
            expect(head?.type.name).toBe("paragraph");
            expect(tail?.type.name).toBe("paragraph");
          } else {
            expect(head?.type.name).toBe("codeBlock");
            expect(tail?.type.name).toBe("codeBlock");
            expect(head?.attrs["language"]).toBe("ts");
            expect(tail?.attrs["language"]).toBe("ts");
          }
          if (context === "code") {
            // R-FULL-CODE-1: code displays no marks even though the shared
            // runs keep them hidden.
            expect(markedTexts(pm, markName)).toBe("");
            const capture = order.capture();
            const tailBlock = capture.blocks.find((b) => (b as { paragraphId: string }).paragraphId === "p:tail");
            const segments = (tailBlock?.segments ?? []) as Array<{
              type: string;
              text?: string;
              marks?: Record<string, unknown>;
            }>;
            const marked = segments.find((segment) =>
              segment.marks !== undefined &&
              (markCase.mark === "link"
                ? segment.marks["link"] === markCase.value
                : segment.marks[markCase.mark] === true),
            );
            expect(marked).toBeDefined();
          } else {
            // Spec 13(a): two paragraphs ab / cd with the bold text runs
            // intact — the full span is marked.
            expect(markedTexts(pm, markName)).toBe("abcd");
          }
        }
      });

      it(`(b) mark vs concurrent hard break stays convergent — ${label}`, async () => {
        const schema = await pmSchema();
        const { textA, textB } = replicas(contextDoc(context, "abcd"));
        textA.doc?.transact(() => {
          textA.format(1, 4, formatAttributes(markCase));
        });
        textB.doc?.transact(() => {
          textB.insertEmbed(3, { hardBreak: true });
        });
        for (const order of bothOrders(textA.doc as Y.Doc, textB.doc as Y.Doc)) {
          const pm = order.pm(schema as never);
          expect(idsOf(pm)).toEqual(["p:ctx"]);
          const block = textblocksOf(pm)[0];
          if (context === "heading") {
            expect(block?.type.name).toBe("heading");
          } else if (context === "list") {
            expect(countNodes(pm, "bulletList")).toBe(1);
            expect(countNodes(pm, "listItem")).toBe(1);
            expect(block?.type.name).toBe("paragraph");
          } else if (context === "quote") {
            expect(countNodes(pm, "blockquote")).toBe(1);
            expect(block?.type.name).toBe("paragraph");
          } else {
            expect(block?.type.name).toBe("codeBlock");
            expect(block?.attrs["language"]).toBe("ts");
          }
          if (context === "code") {
            // In code the break is an LF line separator and no mark renders.
            expect(countNodes(pm, "hardBreak")).toBe(0);
            expect(markedTexts(pm, markName)).toBe("");
            expect(block?.textContent).toContain("ab");
            expect(block?.textContent).toContain("cd");
          } else {
            expect(countNodes(pm, "hardBreak")).toBe(1);
            expect(markedTexts(pm, markName)).toBe("abcd");
          }
        }
      });

      it(`(c) late insert inside a mark span takes the span — ${label}`, async () => {
        const schema = await pmSchema();
        const { textA, textB } = replicas(contextDoc(context, "abcd"));
        textA.doc?.transact(() => {
          textA.format(1, 2, formatAttributes(markCase));
        });
        textB.doc?.transact(() => {
          textB.insert(2, "X");
        });
        for (const order of bothOrders(textA.doc as Y.Doc, textB.doc as Y.Doc)) {
          const pm = order.pm(schema as never);
          expect(idsOf(pm)).toEqual(["p:ctx"]);
          const block = textblocksOf(pm)[0];
          expect(block?.textContent).toContain("aXb");
          if (context === "code") {
            // Review 2 B-NEW-8: assert the yTextToPmDoc output — the late X
            // renders in the code text, marks stay display-hidden.
            expect(markedTexts(pm, markName)).toBe("");
          } else {
            expect(markedTexts(pm, markName)).toBe("aXb");
          }
          const capture = order.capture();
          const segments = (capture.blocks[0]?.segments ?? []) as Array<{
            type: string;
            text?: string;
            marks?: Record<string, unknown>;
          }>;
          const withX = segments.find((segment) => (segment.text ?? "").includes("X"));
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

  it("mark vs concurrent code-block split converges on both orders with hidden formats intact", async () => {
    const schema = await pmSchema();
    const { textA, textB, metaB } = replicas(contextDoc("code", "abcdef"));
    textA.doc?.transact(() => {
      textA.format(2, 3, { bold: true });
    });
    // Concurrent split of the code block: the tail stays a code block of the
    // same language.
    textB.doc?.transact(() => {
      textB.insertEmbed(4, { separator: { paragraphId: "p:tail", kind: "paragraph" } });
      metaB.set("p:tail", structuredClone(metaB.get("p:ctx")));
    });
    for (const order of bothOrders(textA.doc as Y.Doc, textB.doc as Y.Doc)) {
      const pm = order.pm(schema as never);
      expect(idsOf(pm)).toEqual(["p:ctx", "p:tail"]);
      const [head, tail] = textblocksOf(pm);
      expect(head?.type.name).toBe("codeBlock");
      expect(tail?.type.name).toBe("codeBlock");
      expect(head?.attrs["language"]).toBe("ts");
      expect(tail?.attrs["language"]).toBe("ts");
      expect(markedTexts(pm, "bold")).toBe("");
      const capture = order.capture();
      const joined = JSON.stringify(capture.blocks);
      expect(joined).toContain("bold");
    }
  });

  it("mark vs concurrent HR insertion converges on both orders with the atom and the span intact", async () => {
    const schema = await pmSchema();
    const seed: RichTextDocument = {
      format: FULL,
      blocks: [
        {
          paragraphId: "p:ctx",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata() },
          segments: [{ type: "text", text: "abcd", marks: {} }],
        } as never,
      ],
    };
    const { textA, textB } = replicas(seed);
    textA.doc?.transact(() => {
      textA.format(1, 4, { bold: true });
    });
    textB.doc?.transact(() => {
      textB.insertEmbed(5, { separator: { paragraphId: "p:hr", kind: "horizontalRule" } });
      textB.insertEmbed(6, { horizontalRule: { paragraphId: "p:hr" } });
    });
    for (const order of bothOrders(textA.doc as Y.Doc, textB.doc as Y.Doc)) {
      const pm = order.pm(schema as never);
      expect(idsOf(pm)).toEqual(["p:ctx"]);
      expect(countNodes(pm, "horizontalRule")).toBe(1);
      expect(markedTexts(pm, "bold")).toBe("abcd");
      const hr = pm.child(1);
      expect((hr.attrs as Record<string, unknown>)[PARAGRAPH_ID_ATTRIBUTE]).toBe("p:hr");
    }
  });

  it("CL-3-13-code-bound: prose → codeBlock by a bound metadata write while another replica formats, back to prose — formats revealed on every replica", async () => {
    const { setBlockType } = await import("@tiptap/pm/commands");
    const provider = createInMemoryTestDoubleProvider();
    const source = provider.openSession("canvas:span-code", "session:span-code", [FIELD]);
    const identity = { documentId: "canvas:span-code", sessionId: "session:span-code", fieldKey: FIELD };
    const binding = source.resolveBinding(identity);
    const seed: RichTextDocument = {
      format: FULL,
      blocks: [
        {
          paragraphId: "p:1",
          kind: "paragraph",
          metadata: { ...canonicalPlainMetadata() },
          segments: [{ type: "text", text: "alpha beta", marks: {} }],
        } as never,
      ],
    };
    seedFieldFromDocument(binding.text, binding.fieldMeta, FIELD, seed);
    const mount = async () => {
      const ed = await createRichTextEditor({
        document: seed,
        profile: "full",
        messages: { ...MESSAGES },
        allocateId: () => "fresh:span-code:1",
        collaborationBinding: identity,
        collaborationSource: source,
        collaborationRuntime: createBoundRichTextEditor,
        element: globalThis.document.createElement("div"),
      });
      mounted.push(ed);
      return ed;
    };
    const edA = await mount();
    const edB = await mount();
    const sharedYdoc = (binding.text as unknown as { doc: Y.Doc }).doc;
    const freshPm = (ed: RichTextEditor) =>
      yTextToPmDoc(binding.text, binding.fieldMeta, FULL, ed.view.state.schema);

    // Bound metadata write: prose → codeBlock through the documented toggle
    // path (the block identity travels with the conversion).
    const paragraphPos = (() => {
      let pos = -1;
      edA.view.state.doc.descendants((node: ProseMirrorNode, p: number) => {
        if (pos === -1 && node.type.name === "paragraph") pos = p;
        return true;
      });
      expect(pos).toBeGreaterThan(-1);
      return pos;
    })();
    expect(
      setBlockType(edA.view.state.schema.nodes["codeBlock"], {
        paragraphId: "p:1",
        language: "ts",
      })(edA.view.state, edA.view.dispatch, edA.view),
    ).toBe(true);
    for (const ed of [edA, edB]) {
      const block = textblocksOf(ed.view.state.doc)[0];
      expect(block?.type.name).toBe("codeBlock");
      expect(block?.attrs["language"]).toBe("ts");
      expect(ed.view.state.doc.eq(freshPm(ed))).toBe(true);
    }

    // While the block is code, another replica formats the range. The PM
    // keeps displaying no marks (R-FULL-CODE-1) but the shared runs keep the
    // attributes hidden.
    const replica = new Y.Doc();
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(sharedYdoc));
    const replicaText = replica.getText(fieldTextName(FIELD));
    replica.transact(() => {
      // "alpha" occupies the linear range right after the separator.
      const layoutStart = 1;
      replicaText.format(layoutStart, 5, { bold: true });
    });
    Y.applyUpdate(sharedYdoc, Y.encodeStateAsUpdate(replica));
    for (const ed of [edA, edB]) {
      const block = textblocksOf(ed.view.state.doc)[0];
      expect(block?.type.name).toBe("codeBlock");
      expect(markedTexts(ed.view.state.doc, "bold")).toBe("");
      expect(ed.view.state.doc.eq(freshPm(ed))).toBe(true);
      const capture = captureDocumentFromField(binding.text, binding.fieldMeta, FULL).document;
      const segments = (capture.blocks[0]?.segments ?? []) as Array<{
        type: string;
        text?: string;
        marks?: Record<string, unknown>;
      }>;
      const alpha = segments.find((segment) => (segment.text ?? "") === "alpha");
      expect(alpha?.marks?.["bold"]).toBe(true);
    }

    // Back to prose: the hidden format is revealed on every replica.
    expect(
      setBlockType(edA.view.state.schema.nodes["paragraph"], {
        paragraphId: "p:1",
      })(edA.view.state, edA.view.dispatch, edA.view),
    ).toBe(true);
    for (const ed of [edA, edB]) {
      const block = textblocksOf(ed.view.state.doc)[0];
      expect(block?.type.name).toBe("paragraph");
      expect(markedTexts(ed.view.state.doc, "bold")).toBe("alpha");
      expect(ed.view.state.doc.eq(freshPm(ed))).toBe(true);
    }
    // Fresh-session reseeding restores those runs/metadata unchanged.
    const finalCapture = captureDocumentFromField(binding.text, binding.fieldMeta, FULL).document;
    const reseedDoc = new Y.Doc();
    const reseedText = reseedDoc.getText(fieldTextName(FIELD));
    const reseedMeta = reseedDoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    seedFieldFromDocument(reseedText, reseedMeta, FIELD, finalCapture);
    expect(JSON.stringify(captureDocumentFromField(reseedText, reseedMeta, FULL).document)).toBe(
      JSON.stringify(finalCapture),
    );
  });
});
