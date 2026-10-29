/**
 * RED-P — core half: the pure entry loads no editor runtime and no framework
 * module. Spec §11 RED-P split rule, §4.2. Environment: Node (jsdom globals
 * present but untouched).
 *
 * RT-0 owns only this "." half: importing `@sentropic/design-system-rich-text`
 * (the "." entry) touches no `document`/`window` and loads no Svelte, Tiptap
 * or ProseMirror module, asserted over the transitive import graph reachable
 * from `src/index.ts` only — a flat scan of every file under `src/` is not
 * the assertion, because `src/editor.ts` and its `src/editor-*.ts` helpers
 * legitimately import the editor runtime for "./editor". The Svelte-subpath
 * half (barrel isolation, tarball and consumer checks, browser-harness
 * absence) belongs to RT-1 and is not referenced here: neither half uses a
 * conditional skip and RT-0 never imports the subpath. Every RT-0 test passes
 * with no Svelte subpath present.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createP0Extensions, P0_EXTENSION_NAMES } from "./profile.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

/** Import specifiers of one source file. */
function specifiersOf(file: string): string[] {
  const text = readFileSync(join(SRC_DIR, file), "utf8");
  return [...text.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1] as string,
  );
}

/** Files reachable from `src/index.ts` through relative imports. */
function pureEntryGraph(): string[] {
  const seen = new Set<string>(["index.ts"]);
  const queue = ["index.ts"];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    for (const specifier of specifiersOf(file)) {
      if (!specifier.startsWith(".")) continue;
      const target = `${specifier.replace(/\.js$/, "")}.ts`.replace(
        /^\.\//,
        "",
      );
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen];
}

describe("core entry import (RT-0 half of RED-P)", () => {
  it("importing the entry adds no element to the document", async () => {
    const before = document.body.innerHTML;
    await import("./index.js");
    expect(document.body.innerHTML).toBe(before);
  });

  it("every pure-entry import specifier is relative or node: (no runtime, no framework)", () => {
    const rows = pureEntryGraph().flatMap((file) =>
      specifiersOf(file).map((specifier) => ({ file, specifier })),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const { file, specifier } of rows) {
      expect(
        specifier.startsWith(".") || specifier.startsWith("node:"),
        `${file} imports "${specifier}": only relative or node: specifiers allowed in the pure entry`,
      ).toBe(true);
    }
  });

  it("no pure-entry import specifier resolves to a framework or editor runtime", () => {
    // Note: profile.ts legitimately names the @tiptap/* packages as P0 data
    // strings; what must stay absent is any import of a runtime module.
    const runtimePrefixes = [
      "@tiptap/",
      "prosemirror-",
      "yjs",
      "y-protocols",
      "hocuspocus",
      "svelte",
      "vue",
      "react",
      "@angular/",
    ];
    const rows = pureEntryGraph().flatMap((file) =>
      specifiersOf(file).map((specifier) => ({ file, specifier })),
    );
    for (const { file, specifier } of rows) {
      for (const prefix of runtimePrefixes) {
        expect(
          specifier.startsWith(prefix),
          `${file} must not import "${specifier}"`,
        ).toBe(false);
      }
    }
  });

  it("the pure entry never reaches the editor entry", () => {
    const graph = pureEntryGraph();
    for (const file of graph) {
      expect(
        file === "editor.ts" || file.startsWith("editor-"),
        `pure entry must not reach "${file}"`,
      ).toBe(false);
    }
  });

  it("the pure entry graph carries the collaboration model (CL-1M)", () => {
    expect(pureEntryGraph()).toContain("collaboration.ts");
  });

  it("the built pure entry exposes pure helpers and no editor factory or codec", async () => {
    const built = (await import(
      resolve(SRC_DIR, "../dist/index.js")
    )) as Record<string, unknown>;
    expect(typeof built["copyRichTextDocument"]).toBe("function");
    expect(typeof built["richTextDocumentsEqual"]).toBe("function");
    expect(typeof built["decideExternalUpdate"]).toBe("function");
    expect(typeof built["createCaptureTracker"]).toBe("function");
    expect(typeof built["createP0Extensions"]).toBe("function");
    expect(typeof built["createParagraphIdentityPlugin"]).toBe("function");
    expect(typeof built["validateAgentPatch"]).toBe("function");
    expect(typeof built["validateAgentReadRequest"]).toBe("function");
    expect(typeof built["validateCollaborationColor"]).toBe("function");
    expect(typeof built["validateFullBlockMetadata"]).toBe("function");
    expect(typeof built["isAllowedHref"]).toBe("function");
    expect(typeof built["isLockExpired"]).toBe("function");
    expect(typeof built["createPresenceSnapshot"]).toBe("function");
    expect(typeof built["derivePresenceBadgeState"]).toBe("function");
    expect("createRichTextEditor" in built).toBe(false);
    expect("createHeadlessEditor" in built).toBe(false);
    expect("segmentSource" in built).toBe(false);
    expect("documentFromSource" in built).toBe(false);
    expect("sourceFromDocument" in built).toBe(false);
  });
});

describe("build cleans stale outputs before compiling (R15)", () => {
  it("the build script removes dist with node fs before tsc, with no new dependency", () => {
    const manifest = JSON.parse(
      readFileSync(join(SRC_DIR, "..", "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    const build = manifest.scripts?.["build"] ?? "";
    // A stale `dist` (for example the removed hand-written `codec.js`)
    // must never survive into a pack: `tsc` alone does not clean it.
    expect(build).toContain("node -e");
    expect(build).toContain("rmSync");
    expect(build).toContain("dist");
    expect(build).toContain("tsc -p tsconfig.json");
  });
});

describe("P0 wiring smoke (v3 extension set, no DOM access)", () => {
  it("the P0 list carries UndoRedo from @tiptap/extensions, never the v2 history package", () => {
    expect(P0_EXTENSION_NAMES).toContain("@tiptap/extensions");
    expect(P0_EXTENSION_NAMES).not.toContain("@tiptap/extension-history");
  });

  it("composing the P0 extension descriptors returns a non-empty set without touching the document", () => {
    const before = document.body.innerHTML;
    const extensions = createP0Extensions();
    expect(extensions.length).toBeGreaterThan(0);
    expect(document.body.innerHTML).toBe(before);
  });
});
