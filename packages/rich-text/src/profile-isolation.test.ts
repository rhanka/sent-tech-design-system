/**
 * CL-2F review 1, item 11: the absent/P0 mount loads none of the eight full
 * extension packages. The full imports live in the separate
 * `editor-full-extensions.ts` graph, loaded only after explicit full
 * selection (side-effect registration through
 * `ensureFullEditorExtensionsRegistered`), never through the P0 module path.
 *
 * RED: with the eight packages mocked to throw, importing the editor entry
 * and mounting with an absent profile must still work, and mounting `full`
 * must refuse with the not-registered error instead of silently loading the
 * packages. A static scan locks the split: no P0-reachable source names any
 * of the eight packages.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FULL_PACKAGES = [
  "@tiptap/extension-heading",
  "@tiptap/extension-list",
  "@tiptap/extension-blockquote",
  "@tiptap/extension-code-block",
  "@tiptap/extension-horizontal-rule",
  "@tiptap/extension-strike",
  "@tiptap/extension-underline",
  "@tiptap/extension-link",
] as const;

vi.mock("@tiptap/extension-heading", () => {
  throw new Error("must-not-load:@tiptap/extension-heading");
});
vi.mock("@tiptap/extension-list", () => {
  throw new Error("must-not-load:@tiptap/extension-list");
});
vi.mock("@tiptap/extension-blockquote", () => {
  throw new Error("must-not-load:@tiptap/extension-blockquote");
});
vi.mock("@tiptap/extension-code-block", () => {
  throw new Error("must-not-load:@tiptap/extension-code-block");
});
vi.mock("@tiptap/extension-horizontal-rule", () => {
  throw new Error("must-not-load:@tiptap/extension-horizontal-rule");
});
vi.mock("@tiptap/extension-strike", () => {
  throw new Error("must-not-load:@tiptap/extension-strike");
});
vi.mock("@tiptap/extension-underline", () => {
  throw new Error("must-not-load:@tiptap/extension-underline");
});
vi.mock("@tiptap/extension-link", () => {
  throw new Error("must-not-load:@tiptap/extension-link");
});

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

function sourceOf(file: string): string {
  return readFileSync(join(SRC_DIR, file), "utf8");
}

describe("CL-2F-11 profile isolation", () => {
  it("no P0-reachable source imports any of the eight full packages", () => {
    const p0Graph = [
      "editor.ts",
      "editor-extensions.ts",
      "editor-identity.ts",
      "editor-conversion.ts",
      "editor-paste.ts",
      "editor-full-document.ts",
      "editor-full-markdown.ts",
      "editor-full-paste.ts",
      "document.ts",
      "model.ts",
      "profile.ts",
      "composer-document.ts",
    ];
    for (const file of p0Graph) {
      const text = sourceOf(file);
      for (const name of FULL_PACKAGES) {
        expect(
          text.includes(`from "${name}"`) || text.includes(`from '${name}'`),
          `${file} must not import ${name}`,
        ).toBe(false);
      }
    }
    const fullGraph = sourceOf("editor-full-extensions.ts");
    for (const name of FULL_PACKAGES) {
      expect(
        fullGraph.includes(`from "${name}"`) ||
          fullGraph.includes(`from '${name}'`),
        `editor-full-extensions.ts must carry ${name}`,
      ).toBe(true);
    }
  });

  it("an absent-profile mount works while the eight packages throw", async () => {
    const { createRichTextEditor } = await import("./editor.js");
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [{ paragraphId: "p1", kind: "paragraph", text: "Hello" }],
      },
      messages: { placeholder: "", placeholderMarker: "" },
    });
    try {
      expect(editor.getDocument().blocks[0]).toMatchObject({ text: "Hello" });
    } finally {
      editor.destroy();
    }
  });

  it("a full mount without the registered graph refuses instead of loading", async () => {
    const { createRichTextEditor } = await import("./editor.js");
    expect(() =>
      createRichTextEditor({
        document: { format: "ds.markdown.full@1", blocks: [] },
        profile: "full",
        messages: { placeholder: "", placeholderMarker: "" },
      }),
    ).toThrow(/full profile not registered/);
  });
});
