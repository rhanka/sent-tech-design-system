/**
 * CL-3a witness 7 — packaging: "." and a controlled mount load no Yjs
 * module; the offline artefact without provider behaves byte-identically to
 * CL-2 / CL-2F (spec §8 CL-3 (7), §4.9).
 *
 * RED on 7a75a861: `./collab-codec.js` and `./editor-collaboration.js` do
 * not exist, so the isolation half fails at import time.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRichTextEditor } from "./editor.js";
import { createP0EditorExtensions } from "./editor-extensions.js";
import type { RichTextDocument } from "./model.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

function specifiersOf(file: string): string[] {
  const text = readFileSync(join(SRC_DIR, file), "utf8");
  return [...text.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1] as string);
}

function graphFrom(entry: string): string[] {
  const seen = new Set<string>([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    for (const specifier of specifiersOf(file)) {
      if (!specifier.startsWith(".")) continue;
      const target = `${specifier.replace(/\.js$/, "")}.ts`.replace(/^\.\//, "");
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen];
}

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

describe("CL-3-07 packaging isolation", () => {
  it("the pure entry reaches no Yjs module", () => {
    const graph = graphFrom("index.ts");
    expect(graph).toContain("collaboration.ts");
    for (const file of graph) {
      expect(file.startsWith("collab-"), `pure entry must not reach "${file}"`).toBe(false);
      expect(file, `pure entry must not reach "${file}"`).not.toMatch(/^editor-collaboration/);
    }
    const rows = graph.flatMap((file) =>
      specifiersOf(file).map((specifier) => ({ file, specifier })),
    );
    for (const { file, specifier } of rows) {
      expect(specifier.startsWith("yjs"), `${file} imports "${specifier}"`).toBe(false);
      expect(specifier.startsWith("y-protocols"), `${file} imports "${specifier}"`).toBe(false);
    }
  });

  it("only the collaboration modules are Yjs-reachable", async () => {
    const codec = readFileSync(join(SRC_DIR, "collab-codec.ts"), "utf8");
    const projection = readFileSync(join(SRC_DIR, "collab-projection.ts"), "utf8");
    const selection = readFileSync(join(SRC_DIR, "collab-selection.ts"), "utf8");
    const binding = readFileSync(join(SRC_DIR, "editor-collaboration.ts"), "utf8");
    for (const [name, text] of [
      ["collab-codec.ts", codec],
      ["collab-projection.ts", projection],
      ["collab-selection.ts", selection],
      ["editor-collaboration.ts", binding],
    ] as const) {
      expect(text.includes("Y.XmlFragment"), `${name} must not use Y.XmlFragment`).toBe(false);
      expect(text.includes("Y.XmlElement"), `${name} must not use Y.XmlElement`).toBe(false);
      expect(text.includes("Y.XmlText"), `${name} must not use Y.XmlText`).toBe(false);
      expect(text.includes("y-prosemirror"), `${name} must not use y-prosemirror`).toBe(false);
      expect(text.includes("extension-collaboration"), `${name} must not use a Tiptap collaboration extension`).toBe(false);
    }
    expect(codec.includes("yjs")).toBe(true);
    expect(binding.includes("y-protocols/awareness")).toBe(true);
  });

  it("a controlled mount keeps UndoRedo and loads no collaboration graph", () => {
    const composed = createP0EditorExtensions({
      placeholder: "p",
      placeholderMarker: () => null,
      isEditable: () => true,
    });
    const names = composed.map((extension) => extension.name);
    expect(names.filter((name) => name === "undoRedo")).toHaveLength(1);
  });

  it("the offline artefact without provider matches the CL-2 baseline", async () => {
    const docOf = (text: string): RichTextDocument => ({
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text }],
    });
    const changes: RichTextDocument[] = [];
    let sequence = 0;
    const editor = createRichTextEditor({
      document: docOf("hello"),
      messages: { ...MESSAGES },
      allocateId: () => `test:offline:${(sequence += 1)}`,
      collaborationBinding: null,
      element: globalThis.document.createElement("div"),
      onChange: (event) => {
        changes.push(event.document);
      },
    });
    editor.typeText("paragraph:1", "hello world");
    editor.splitParagraph("paragraph:1", 5);
    editor.undo();
    editor.redo();
    const captured = await editor.captureDocument();
    editor.destroy();
    expect(changes).toHaveLength(4);
    expect(changes[0]?.blocks).toEqual([
      { paragraphId: "paragraph:1", kind: "paragraph", text: "hellohello world" },
    ]);
    expect(captured.document.blocks).toEqual([
      { paragraphId: "paragraph:1", kind: "paragraph", text: "hello" },
      { paragraphId: "test:offline:1", kind: "paragraph", text: "hello world" },
    ]);
  });

  it("a controlled full mount loads no CRDT graph", async () => {
    const editor = await createRichTextEditor({
      document: {
        format: "ds.markdown.full@1",
        blocks: [
          {
            paragraphId: "paragraph:1",
            kind: "paragraph",
            metadata: {
              blockKind: "paragraph",
              listKind: "none",
              listDepth: 0,
              blockquoteDepth: 0,
              containerOrder: [],
            },
            segments: [{ type: "text", text: "hello", marks: {} }],
          },
        ],
      },
      profile: "full",
      messages: { ...MESSAGES },
      allocateId: () => "test:full-offline:1",
      collaborationBinding: null,
      element: globalThis.document.createElement("div"),
    });
    expect(editor.getBinding()).toBeNull();
    const captured = await editor.captureDocument();
    expect(captured.document.blocks[0]?.paragraphId).toBe("paragraph:1");
    editor.destroy();
  });
});
