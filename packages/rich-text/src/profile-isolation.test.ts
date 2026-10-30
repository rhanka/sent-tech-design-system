/**
 * CL-2F review 2, blocking 1: the full extension graph loads on demand and
 * `profile: "full"` stays a single-prop opt-in with no registration
 * ceremony.
 *
 * - No P0-reachable rich-text source statically imports any of the eight
 *   full packages; `editor.ts` reaches the full graph only through a dynamic
 *   `import("./editor-full-extensions.js")` on the full branch.
 * - No Svelte surface references the internal full module at all (neither
 *   statically nor dynamically): both profiles mount through
 *   `createRichTextEditor`, which loads the graph itself on full.
 * - With the eight packages mocked to throw, an absent-profile mount works
 *   (the P0 path evaluates none of them) while a full mount rejects with
 *   the mocked load failure — the graph resolves at full-mount time, never
 *   at import time. The positive zero-ceremony full mount (no registration
 *   call) is witnessed by every `mountFull` helper (e.g. in
 *   `editor-full.test.ts`), which mounts `profile: "full"` with no
 *   `ensure`/registration import.
 *
 * RED: statically importing the full graph on a P0 path fails the scan;
 * restoring the old `full profile not registered` refusal fails the
 * zero-ceremony mount in every full suite.
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
const SVELTE_DIR = join(
  SRC_DIR,
  "..",
  "..",
  "components-svelte",
  "src",
  "lib",
  "rich-text-editor",
);

function sourceOf(file: string): string {
  return readFileSync(join(SRC_DIR, file), "utf8");
}

describe("CL-2F-11 profile isolation (lazy full graph)", () => {
  it("no P0-reachable source statically imports any of the eight full packages", () => {
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
          `${file} must not statically import ${name}`,
        ).toBe(false);
        expect(
          text.includes(`import("${name}")`) ||
            text.includes(`import('${name}')`),
          `${file} must not dynamically import ${name}`,
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

  it("editor.ts reaches the full graph only through a lazy dynamic import", () => {
    const text = sourceOf("editor.ts");
    expect(
      text.includes('from "@sentropic/design-system-rich-text/editor-full-extensions"'),
      "editor.ts must not statically import the full module",
    ).toBe(false);
    expect(
      text.includes('from "./editor-full-extensions.js"'),
      "editor.ts must not statically import the full module",
    ).toBe(false);
    expect(
      text.includes('import("./editor-full-extensions.js")'),
      "editor.ts must lazily import the full graph on the full branch",
    ).toBe(true);
  });

  it("no Svelte surface references the internal full module", () => {
    for (const file of ["RichTextEditor.svelte", "ComposerEditor.svelte"]) {
      const text = readFileSync(join(SVELTE_DIR, file), "utf8");
      expect(
        text.includes("editor-full-extensions"),
        `${file} must mount through createRichTextEditor, never the internal full module`,
      ).toBe(false);
    }
  });

  it("an absent-profile mount works while the eight packages throw", async () => {
    // Synchronous P0 construction: a rejected value would throw here.
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

  it("a full mount resolves the graph on demand (mocked failure rejects)", async () => {
    // The same throwing mocks the P0 mount above never resolves: the full
    // branch dynamically imports the graph at full-mount time, so the
    // mocked failure rejects the construction promise. (Vitest surfaces a
    // throwing mock factory on a dynamic path as a mock-resolution
    // error, hence the alternation below.) The zero-ceremony positive —
    // a full mount with no registration call — is every `mountFull`
    // helper (e.g. in `editor-full.test.ts`), which imports no
    // registration entry point.
    const { createRichTextEditor } = await import("./editor.js");
    await expect(
      createRichTextEditor({
        document: { format: "ds.markdown.full@1", blocks: [] },
        profile: "full",
        messages: { placeholder: "", placeholderMarker: "" },
      }),
    ).rejects.toThrow(/must-not-load:@tiptap|error when mocking a module/);
  });
});
