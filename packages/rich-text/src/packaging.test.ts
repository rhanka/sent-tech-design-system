/**
 * RED-P — core half: the neutral entry is side-effect free and framework
 * free; the P0 wiring smoke. Spec §11 RED-P split rule, §4.2. Environment:
 * Node (jsdom globals present but untouched).
 *
 * RT-0 owns only this core half: importing the neutral core entry loads no
 * DOM global and no framework module. The Svelte-subpath half (barrel
 * isolation, tarball and consumer checks, browser-harness absence) belongs to
 * RT-1 and is not referenced here: neither half uses a conditional skip and
 * RT-0 never imports the subpath. Every RT-0 test passes with no Svelte
 * subpath present.
 *
 * Observable assertion: importing the entry adds no element to the document
 * and resolves no `@tiptap/*`, `prosemirror-*` or framework module (static
 * import-graph scan: every non-test source specifier is relative or `node:`);
 * the entry re-exports the headless and P0 factory entry points; the P0
 * wiring smoke composes the v3 extension set without DOM access.
 *
 * RED state (RT-0): the import-graph assertions hold on the stubs; the P0
 * wiring smoke fails with `RT-0 RED: P0 extensions not wired` until phase B
 * lands. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import * as entry from "./index.js";
import { createP0Extensions, P0_EXTENSION_NAMES } from "./profile.js";

function sourceSpecifiers(): { file: string; specifier: string }[] {
  const dir = new URL("./", import.meta.url);
  const found: { file: string; specifier: string }[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    const text = readFileSync(new URL(file, dir), "utf8");
    for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) {
      found.push({ file, specifier: match[1] as string });
    }
  }
  return found;
}

describe("core entry import (RT-0 half of RED-P)", () => {
  it("importing the entry adds no element to the document", async () => {
    const before = document.body.innerHTML;
    await import("./index.js");
    expect(document.body.innerHTML).toBe(before);
  });

  it("every core import specifier is relative or node: (no runtime, no framework)", () => {
    const rows = sourceSpecifiers();
    expect(rows.length).toBeGreaterThan(0);
    for (const { file, specifier } of rows) {
      expect(
        specifier.startsWith(".") || specifier.startsWith("node:"),
        `${file} imports "${specifier}": only relative or node: specifiers allowed in the core`,
      ).toBe(true);
    }
  });

  it("no core import specifier resolves to a framework or editor runtime", () => {
    // Note: profile.ts legitimately names the @tiptap/* packages as P0 data
    // strings; what must stay absent is any import of a runtime module.
    const runtimePrefixes = [
      "@tiptap/",
      "prosemirror-",
      "svelte",
      "vue",
      "react",
      "@angular/",
    ];
    for (const { file, specifier } of sourceSpecifiers()) {
      for (const prefix of runtimePrefixes) {
        expect(
          specifier.startsWith(prefix),
          `${file} must not import "${specifier}"`,
        ).toBe(false);
      }
    }
  });

  it("the entry re-exports the headless and P0 factory entry points", () => {
    expect(typeof entry.createHeadlessEditor).toBe("function");
    expect(typeof entry.createP0Extensions).toBe("function");
    expect(typeof entry.createParagraphIdentityPlugin).toBe("function");
    expect(typeof entry.segmentSource).toBe("function");
    expect(typeof entry.documentFromSource).toBe("function");
    expect(typeof entry.sourceFromDocument).toBe("function");
  });
});

describe("P0 wiring smoke (v3 extension set, no DOM access)", () => {
  it("the P0 list carries UndoRedo from @tiptap/extensions, never the v2 history package", () => {
    expect(P0_EXTENSION_NAMES).toContain("@tiptap/extensions");
    expect(P0_EXTENSION_NAMES).not.toContain("@tiptap/extension-history");
  });

  it("composing the P0 extensions returns a non-empty set without touching the document", () => {
    const before = document.body.innerHTML;
    const extensions = createP0Extensions();
    expect(extensions.length).toBeGreaterThan(0);
    expect(document.body.innerHTML).toBe(before);
  });
});
