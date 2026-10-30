/**
 * CL-2 RED — the three §6.3 seams plus capture neutrality and the
 * no-provider byte-identity gate (CL-2 witnesses 4 and 5).
 *
 * Seam 1 (identity discipline): no code path mints an identity from
 * `crypto.randomUUID()` inside a session; the factory default stays the only
 * call site. Seam 2 (mode-neutral capture): consecutive captures never assume
 * a one-gesture delta — an external replacement between two captures yields
 * a second capture equal to the replacement. Seam 3 (empty provider slot):
 * `"./editor"` accepts an optional collaboration binding at construction,
 * the history extension is factored to a single replacement point, and
 * controlled mode never loads the collaboration graph (no Yjs, no
 * y-protocols, no hocuspocus, no Tiptap collaboration extension).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRichTextEditor } from "./editor.js";
import type { RichTextDocument } from "./model.js";
import { createP0EditorExtensions, createHistoryExtension } from "./editor-extensions.js";
import type { FieldBindingIdentity } from "./collaboration.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

function doc(text: string): RichTextDocument {
  return {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text }],
  };
}

const BINDING: FieldBindingIdentity = {
  documentId: "canvas:artifact-1",
  sessionId: "session:1",
  fieldKey: "field:body",
};

describe("seam 1 — single identity source (CL-2 witness, RED)", () => {
  it("mints session identities only through the injected allocator", () => {
    const seen: string[] = [];
    const editor = createRichTextEditor({
      document: doc("hello"),
      messages: { ...MESSAGES },
      allocateId: () => {
        const next = `test:seam:${seen.length + 1}`;
        seen.push(next);
        return next;
      },
      element: globalThis.document.createElement("div"),
    });
    editor.splitParagraph("paragraph:1", 2);
    expect(seen.length).toBeGreaterThan(0);
    editor.destroy();
  });

  it("calls crypto.randomUUID only in the factory default, never in a session path", () => {
    // Session files never mint identities: the allocator injection point is
    // the single identity source in both modes (§6.3 seam 1). The factory
    // default (`defaultAllocateId`, for non-Focus hosts only) stays the one
    // admitted call site.
    for (const file of ["editor-identity.ts", "editor-conversion.ts", "editor-paste.ts"]) {
      const text = readFileSync(join(SRC_DIR, file), "utf8");
      expect(
        text.includes("randomUUID"),
        `${file} must not mint identities from crypto.randomUUID()`,
      ).toBe(false);
    }
    const editorText = readFileSync(join(SRC_DIR, "editor.ts"), "utf8");
    const defaultFn = editorText.indexOf("function defaultAllocateId");
    expect(defaultFn).toBeGreaterThanOrEqual(0);
    // The whole factory default is one short function: every `randomUUID`
    // mention lives inside it, nowhere else in the session paths.
    const fnEnd = editorText.indexOf("\n}", defaultFn);
    expect(fnEnd).toBeGreaterThan(defaultFn);
    const fnBody = editorText.slice(defaultFn, fnEnd);
    expect(fnBody).toContain("randomUUID");
    const outside =
      editorText.slice(0, defaultFn) + editorText.slice(fnEnd);
    expect(
      outside.includes("randomUUID"),
      "editor.ts mints identities outside the factory default",
    ).toBe(false);
  });
});

describe("seam 3 — empty provider slot (CL-2 witnesses 5 and 6, RED)", () => {
  it("accepts an optional collaboration binding at construction", () => {
    const editor = createRichTextEditor({
      document: doc("hello"),
      messages: { ...MESSAGES },
      collaborationBinding: BINDING,
      element: globalThis.document.createElement("div"),
    });
    expect(editor.getBinding()).toEqual(BINDING);
    editor.destroy();
  });

  it("leaves the slot empty by default", () => {
    const editor = createRichTextEditor({
      document: doc("hello"),
      messages: { ...MESSAGES },
      element: globalThis.document.createElement("div"),
    });
    expect(editor.getBinding()).toBeNull();
    editor.destroy();
  });

  it("factors the history extension to a single replacement point", () => {
    const history = createHistoryExtension();
    expect(history.name).toBe("undoRedo");
    const composed = createP0EditorExtensions({
      placeholder: "p",
      placeholderMarker: () => null,
      isEditable: () => true,
    });
    const names = composed.map((extension) => extension.name);
    expect(names.filter((name) => name === "undoRedo")).toHaveLength(1);
    expect(names).toContain("undoRedo");
  });

  it("loads no collaboration graph in the editor entry", () => {
    const graph: string[] = ["editor.ts", "editor-extensions.ts", "editor-identity.ts", "editor-conversion.ts", "editor-paste.ts"];
    const forbidden = ["yjs", "y-prosemirror", "y-protocols", "hocuspocus", "@tiptap/extension-collaboration"];
    for (const file of graph) {
      const text = readFileSync(join(SRC_DIR, file), "utf8");
      for (const marker of forbidden) {
        expect(
          text.includes(marker),
          `${file} must not load the collaboration graph ("${marker}")`,
        ).toBe(false);
      }
    }
  });
});

describe("capture neutrality (CL-2 witness 4, RED)", () => {
  it("an external replacement between two captures yields a second capture equal to the replacement", async () => {
    const editor = createRichTextEditor({
      document: doc("before"),
      messages: { ...MESSAGES },
      element: globalThis.document.createElement("div"),
    });
    const first = await editor.captureDocument();
    expect(first.document.blocks[0]).toMatchObject({ text: "before" });
    const replacement: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "paragraph:9", kind: "paragraph", text: "replaced whole" }],
    };
    editor.applyExternalUpdate(replacement);
    const second = await editor.captureDocument();
    expect(second.document).toEqual(replacement);
    editor.destroy();
  });
});

describe("no provider ⇒ RT-1 behaviour byte-identically (CL-2 witness 5, RED)", () => {
  it("a bound-slot-null editor emits the same documents as the RT-1 baseline", async () => {
    const script = (editor: ReturnType<typeof createRichTextEditor>): void => {
      editor.typeText("paragraph:1", "hello world");
      editor.splitParagraph("paragraph:1", 5);
      editor.undo();
      editor.redo();
    };
    const run = async (withSlot: boolean) => {
      const changes: RichTextDocument[] = [];
      let sequence = 0;
      const editor = createRichTextEditor({
        document: doc("hello"),
        messages: { ...MESSAGES },
        allocateId: () => `test:slot:${(sequence += 1)}`,
        ...(withSlot ? { collaborationBinding: null } : {}),
        element: globalThis.document.createElement("div"),
      });
      editor.typeText("paragraph:1", "hello world");
      changes.push(editor.getDocument());
      editor.splitParagraph("paragraph:1", 5);
      changes.push(editor.getDocument());
      editor.undo();
      changes.push(editor.getDocument());
      editor.redo();
      changes.push(editor.getDocument());
      script(editor);
      const captured = await editor.captureDocument();
      editor.destroy();
      return { changes, captured };
    };
    const baseline = await run(false);
    const slotted = await run(true);
    expect(slotted.changes).toEqual(baseline.changes);
    expect(slotted.captured).toEqual(baseline.captured);
  });
});
