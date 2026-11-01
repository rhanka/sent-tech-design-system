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

/** Comment-stripped source, string contents preserved: no comment text can
    fake (or hide) a runtime import edge. */
function withoutComments(source: string): string {
  let out = "";
  let index = 0;
  while (index < source.length) {
    const char = source[index] as string;
    if (char === "/" && source[index + 1] === "/") {
      const end = source.indexOf("\n", index);
      index = end === -1 ? source.length : end;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      let close = index + 1;
      while (close < source.length && source[close] !== char) {
        close += source[close] === "\\" ? 2 : 1;
      }
      out += source.slice(index, close + 1);
      index = close + 1;
      continue;
    }
    out += char;
    index += 1;
  }
  return out;
}

/** Runtime import specifiers of a source file: static value imports and
    re-exports, bare `import "x"`, and dynamic `import("x")`. Type-only
    statements (`import type` / `export type`) are excluded: under
    `verbatimModuleSyntax` they are erased, so a non-`type` statement or a
    dynamic call in the comment-stripped source is exactly an edge of the
    emitted ESM a bundler must follow. */
function runtimeSpecifiersOf(file: string): string[] {
  const code = withoutComments(readFileSync(join(SRC_DIR, file), "utf8"));
  const patterns = [
    /\b(?:import|export)\s+(?!type\b)[^;()]*?\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const specifiers: string[] = [];
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      specifiers.push(match[1] as string);
    }
  }
  return specifiers;
}

/** Transitive closure over runtime edges (static and dynamic), relative
    specifiers resolved to source files. */
function runtimeGraphFrom(entry: string): string[] {
  const seen = new Set<string>([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    for (const specifier of runtimeSpecifiersOf(file)) {
      if (!specifier.startsWith(".")) continue;
      const target = `${specifier.replace(/\.js$/, "")}.ts`.replace(/^\.\//, "");
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen].sort();
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

  it("the runtime graph of \".\" and \"./editor\", dynamic import() edges included, reaches no collaboration module (CL-3a fix 3)", () => {
    for (const entry of ["index.ts", "editor.ts"] as const) {
      const graph = runtimeGraphFrom(entry);
      if (entry === "editor.ts") {
        // Parser sanity anchors: the walk must see the static extension
        // graph AND the lazy full-profile dynamic import, so a walker
        // regression cannot turn this witness into a vacuous pass.
        expect(graph).toContain("editor-extensions.ts");
        expect(graph).toContain("editor-full-extensions.ts");
      }
      for (const file of graph) {
        expect(
          file === "editor-bound.ts",
          `${entry}: the runtime graph reaches the bound entry "${file}"`,
        ).toBe(false);
        expect(
          file === "editor-collaboration.ts",
          `${entry}: the runtime graph reaches "${file}"`,
        ).toBe(false);
        expect(file.startsWith("collab-"), `${entry}: the runtime graph reaches "${file}"`).toBe(false);
      }
      const rows = graph.flatMap((file) =>
        runtimeSpecifiersOf(file).map((specifier) => ({ file, specifier })),
      );
      for (const { file, specifier } of rows) {
        expect(specifier.startsWith("yjs"), `${entry}: ${file} imports "${specifier}"`).toBe(false);
        expect(specifier.startsWith("y-protocols"), `${entry}: ${file} imports "${specifier}"`).toBe(false);
      }
    }
  });

  it("only the collaboration modules are Yjs-reachable", async () => {
    const codec = readFileSync(join(SRC_DIR, "collab-codec.ts"), "utf8");
    const projection = readFileSync(join(SRC_DIR, "collab-projection.ts"), "utf8");
    const selection = readFileSync(join(SRC_DIR, "collab-selection.ts"), "utf8");
    const binding = readFileSync(join(SRC_DIR, "editor-collaboration.ts"), "utf8");
    // CL-3b2: the composition session and the cursor plugin live in the
    // collaboration graph behind "./editor/collaboration" (witness 7).
    const composition = readFileSync(join(SRC_DIR, "collab-composition.ts"), "utf8");
    const cursor = readFileSync(join(SRC_DIR, "collab-cursor.ts"), "utf8");
    for (const [name, text] of [
      ["collab-codec.ts", codec],
      ["collab-projection.ts", projection],
      ["collab-selection.ts", selection],
      ["editor-collaboration.ts", binding],
      ["collab-composition.ts", composition],
      ["collab-cursor.ts", cursor],
    ] as const) {
      expect(text.includes("Y.XmlFragment"), `${name} must not use Y.XmlFragment`).toBe(false);
      expect(text.includes("Y.XmlElement"), `${name} must not use Y.XmlElement`).toBe(false);
      expect(text.includes("Y.XmlText"), `${name} must not use Y.XmlText`).toBe(false);
      expect(text.includes("y-prosemirror"), `${name} must not use y-prosemirror`).toBe(false);
      expect(text.includes("yCursorPlugin"), `${name} must not use yCursorPlugin (§5.1)`).toBe(false);
      expect(text.includes("extension-collaboration"), `${name} must not use a Tiptap collaboration extension`).toBe(false);
      expect(text.includes("extension-collaboration-caret"), `${name} must not use a Tiptap caret extension`).toBe(false);
    }
    expect(codec.includes("yjs")).toBe(true);
    expect(binding.includes("y-protocols/awareness")).toBe(true);
    // The DS writes its own decoration plugin (§5.1): plain ProseMirror
    // only, mounted through a plain Tiptap extension wrapper.
    expect(cursor.includes("y-prosemirror")).toBe(false);
    expect(cursor.includes("wrapCursorPlugin")).toBe(true);
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

describe("CL-3c-07 Hocuspocus dev-only and test-support isolation (witness 7 regression)", () => {
  it("the shipped runtime graphs reach no Hocuspocus or test-support module", () => {
    for (const entry of ["index.ts", "editor.ts"] as const) {
      const graph = runtimeGraphFrom(entry);
      for (const file of graph) {
        expect(
          file,
          `${entry}: the shipped runtime graph reaches test-support "${file}"`,
        ).not.toMatch(/test-support/);
        expect(
          file.startsWith("collab-hocuspocus"),
          `${entry}: the shipped runtime graph reaches "${file}"`,
        ).toBe(false);
        expect(
          file.startsWith("collab-freeze-authority"),
          `${entry}: the shipped runtime graph reaches "${file}"`,
        ).toBe(false);
      }
      for (const specifier of graph.flatMap((file) => runtimeSpecifiersOf(file))) {
        expect(
          specifier.startsWith("@hocuspocus"),
          `${entry}: shipped code imports "${specifier}"`,
        ).toBe(false);
      }
    }
  });

  it("the Hocuspocus pin is an exact dev-only dependency", () => {
    const manifest = JSON.parse(
      readFileSync(join(SRC_DIR, "..", "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    expect(manifest.devDependencies?.["@hocuspocus/server"]).toBe("4.7.1");
    expect(manifest.dependencies?.["@hocuspocus/server"]).toBeUndefined();
    expect(manifest.peerDependencies?.["@hocuspocus/server"]).toBeUndefined();
    expect(manifest.dependencies?.["@hocuspocus/provider"]).toBeUndefined();
    expect(manifest.peerDependencies?.["@hocuspocus/provider"]).toBeUndefined();
    expect(manifest.devDependencies?.["@hocuspocus/provider"]).toBeUndefined();
  });

  it("the test-support sources use no banned collaboration module", () => {
    const banned = [
      "y-prosemirror",
      "Y.XmlFragment",
      "Y.XmlElement",
      "Y.XmlText",
      "extension-collaboration",
      "extension-collaboration-caret",
    ];
    for (const file of [
      "collab-hocuspocus-source.test-support.ts",
      "collab-freeze-authority.test-support.ts",
    ] as const) {
      const text = readFileSync(join(SRC_DIR, file), "utf8");
      for (const marker of banned) {
        expect(text.includes(marker), `${file} must not use ${marker}`).toBe(false);
      }
    }
    // The Hocuspocus import lives only in the Hocuspocus-backed source;
    // the freeze authority is provider-independent.
    const freeze = readFileSync(join(SRC_DIR, "collab-freeze-authority.test-support.ts"), "utf8");
    expect(freeze.includes("@hocuspocus")).toBe(false);
    const hocuspocus = readFileSync(join(SRC_DIR, "collab-hocuspocus-source.test-support.ts"), "utf8");
    expect(hocuspocus.includes("@hocuspocus/server")).toBe(true);
  });
});
