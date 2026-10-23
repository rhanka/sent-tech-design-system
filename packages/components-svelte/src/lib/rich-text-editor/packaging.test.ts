/**
 * RED-P — RT-1 half: Svelte subpath resolution, barrel isolation, distribution
 * wiring and the adapter forbidden-import scan.
 * Spec §11 RED-P split rule, §8, §12 RT-1. Environment: J (jsdom shape) + Node.
 *
 * RT-1 owns this half: `packages/components-svelte/src/lib/rich-text-editor/
 * packaging.test.ts` asserts subpath resolution and barrel isolation, and the
 * repository guards (`pack:smoke`, licensing) run as gate commands. The
 * tarball/consumer half (nested dist paths, no `*.browser.test.*` entry, no
 * `*.test.mjs` entry, real consumer build) runs against the packed artefacts
 * in the RT-1 gate, not here: this file is dist-free on purpose.
 *
 * RED state: fails because the subpath (`index.ts`, `RichTextEditor.svelte`)
 * does not exist yet and the `package.json`/`vite.config.ts` wiring is absent.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RICH_TEXT_EDITOR_DIR = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = dirname(RICH_TEXT_EDITOR_DIR);
const PACKAGE_DIR = dirname(dirname(LIB_DIR));

function readPackageFile(relativePath: string): string {
  return readFileSync(join(PACKAGE_DIR, relativePath), "utf8");
}

/** Import specifiers of one source file (`.ts` or `.svelte` script block). */
function specifiersOf(relativePath: string): string[] {
  const text = readFileSync(join(PACKAGE_DIR, relativePath), "utf8");
  return [...text.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1] as string,
  );
}

/** Source files reachable from the subpath entry through relative imports. */
function adapterGraph(): string[] {
  const roots = [
    "src/lib/rich-text-editor/index.ts",
    "src/lib/rich-text-editor/RichTextEditor.svelte",
  ];
  const seen = new Set<string>(roots);
  const queue = [...roots];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    for (const specifier of specifiersOf(file)) {
      if (!specifier.startsWith(".")) continue;
      const base = file.split("/").slice(0, -1).join("/");
      const target = `${base}/${specifier}`
        .replace(/\.js$/, ".ts")
        .replace(/\/\.\//g, "/");
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen];
}

describe("subpath entry (RT-1 half of RED-P)", () => {
  it("the subpath entry resolves and exposes the component", async () => {
    const entry = (await import("./index.js")) as Record<string, unknown>;
    expect(entry["default"]).toBeDefined();
    expect(entry["RichTextEditor"]).toBeDefined();
  });

  it("the subpath entry re-exports the prop and handle types", () => {
    const text = readFileSync(
      join(RICH_TEXT_EDITOR_DIR, "index.ts"),
      "utf8",
    );
    expect(text).toContain("RichTextEditorProps");
    expect(text).toContain("RichTextEditorHandle");
  });

  it("the subpath entry never reaches the barrel", () => {
    for (const file of adapterGraph()) {
      expect(
        file === "src/lib/index.ts",
        `subpath entry must not reach the barrel ("${file}")`,
      ).toBe(false);
    }
  });

  it("resolves through the manifest exports map (self-reference)", async () => {
    const resolved = await import.meta.resolve(
      "@sentropic/design-system-svelte/rich-text-editor",
    );
    expect(resolved).toContain("rich-text-editor");
  });

  it("the stylesheet subpath resolves through the manifest exports map", async () => {
    const resolved = await import.meta.resolve(
      "@sentropic/design-system-svelte/rich-text-editor.css",
    );
    expect(resolved).toContain("rich-text-editor.css");
  });
});

describe("barrel isolation (RT-1 half of RED-P)", () => {
  it("src/lib/index.ts carries no rich-text export (explicit no-change)", () => {
    const barrel = readPackageFile("src/lib/index.ts");
    expect(barrel).not.toContain("rich-text");
    expect(barrel).not.toContain("RichTextEditor");
  });

  it("no barrel-reachable module imports the editor runtime", () => {
    const barrelText = readPackageFile("src/lib/index.ts");
    const roots = [...barrelText.matchAll(/from\s+["'](\.[^"']+)["']/g)].map(
      (match) => `src/lib/${(match[1] as string).replace(/^\.\//, "")}`,
    );
    const seen = new Set<string>();
    const queue = [...roots];
    const specifiers: Array<{ file: string; specifier: string }> = [];
    while (queue.length > 0) {
      const file = queue.pop() as string;
      const withExtension = file.endsWith(".svelte") ? file : `${file}.ts`;
      if (seen.has(withExtension)) continue;
      seen.add(withExtension);
      let entries: string[] = [];
      try {
        entries = specifiersOf(withExtension);
      } catch {
        try {
          entries = specifiersOf(`${file}.svelte`);
        } catch {
          continue;
        }
      }
      for (const specifier of entries) {
        specifiers.push({ file: withExtension, specifier });
        if (!specifier.startsWith(".")) continue;
        const base = withExtension.split("/").slice(0, -1).join("/");
        queue.push(`${base}/${specifier}`.replace(/\/\.\//g, "/"));
      }
    }
    expect(specifiers.length).toBeGreaterThan(0);
    for (const { file, specifier } of specifiers) {
      expect(
        specifier.includes("rich-text"),
        `${file} must not reach the rich-text subpath ("${specifier}")`,
      ).toBe(false);
      expect(
        specifier.startsWith("@tiptap/") || specifier.startsWith("prosemirror-"),
        `${file} must not import the editor runtime ("${specifier}")`,
      ).toBe(false);
    }
  });

  // The built barrel: the published `dist/index.js` itself, not the source
  // barrel it is compiled from. Importing the whole component graph takes
  // measurably longer than the default jsdom budget, hence the explicit
  // timeout; lowering it back to the default reintroduces a timing failure
  // with no assertion value.
  it(
    "the built barrel exposes no rich-text export",
    async () => {
      const barrel = (await import(
        "../../../dist/index.js"
      )) as Record<string, unknown>;
      expect("RichTextEditor" in barrel).toBe(false);
      expect(
        Object.keys(barrel).some((key) => /richtext/i.test(key)),
      ).toBe(false);
    },
    120000,
  );
});

describe("distribution wiring (RT-1)", () => {
  it("the exports map carries exactly the specified subpaths", () => {
    const manifest = JSON.parse(readPackageFile("package.json")) as {
      exports?: Record<string, unknown>;
    };
    expect(manifest.exports?.["./rich-text-editor"]).toEqual({
      svelte: "./dist/rich-text-editor/index.js",
      types: "./dist/rich-text-editor/index.d.ts",
      import: "./dist/rich-text-editor/index.js",
    });
    expect(manifest.exports?.["./rich-text-editor.css"]).toBe(
      "./dist/rich-text-editor/rich-text-editor.css",
    );
    expect(manifest.exports?.["."]).toEqual({
      svelte: "./dist/index.js",
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    });
  });

  it("the files array excludes the browser harness from the tarball", () => {
    const manifest = JSON.parse(readPackageFile("package.json")) as {
      files?: string[];
    };
    expect(manifest.files ?? []).toContain("!dist/**/*.test.mjs");
  });

  it("the jsdom run excludes the browser file from collection", () => {
    const config = readPackageFile("vite.config.ts");
    expect(config).toContain("test.exclude");
    expect(config).toContain("rich-text-editor");
    expect(config).toContain("browser.test.mjs");
  });

  it("the Svelte package depends on the neutral package (never the reverse)", () => {
    const manifest = JSON.parse(readPackageFile("package.json")) as {
      dependencies?: Record<string, string>;
    };
    expect(
      manifest.dependencies?.["@sentropic/design-system-rich-text"],
    ).toBe("0.1.0");
  });
});

describe("adapter forbidden imports (RED 8, Svelte adapter graph)", () => {
  it("no adapter module imports Focus, HTTP, Track, app or network code", () => {
    const forbidden = [
      "@sentropic/focus",
      "node:http",
      "node:https",
      "axios",
      "node-fetch",
      "undici",
      "apiPut",
      "$lib",
    ];
    const rows = adapterGraph().flatMap((file) =>
      specifiersOf(file).map((specifier) => ({ file, specifier })),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const { file, specifier } of rows) {
      for (const marker of forbidden) {
        expect(
          specifier.includes(marker),
          `${file} must not import "${specifier}" (forbidden marker "${marker}")`,
        ).toBe(false);
      }
      const lower = specifier.toLowerCase();
      expect(
        lower.includes("track") &&
          (lower.includes("store") || lower.includes("type")),
        `${file} must not import a Track type ("${specifier}")`,
      ).toBe(false);
    }
  });

  it("the adapter reaches the editor runtime only through the neutral entry", () => {
    const rows = adapterGraph().flatMap((file) =>
      specifiersOf(file).map((specifier) => ({ file, specifier })),
    );
    for (const { file, specifier } of rows) {
      expect(
        specifier.startsWith("@tiptap/") || specifier.startsWith("prosemirror-"),
        `${file} must not import the editor runtime directly ("${specifier}"): use "@sentropic/design-system-rich-text/editor"`,
      ).toBe(false);
    }
    const direct = rows.filter(
      (row) => row.specifier === "@sentropic/design-system-rich-text/editor",
    );
    expect(direct.length).toBeGreaterThan(0);
  });
});
