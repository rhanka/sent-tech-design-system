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
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RICH_TEXT_EDITOR_DIR = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = dirname(RICH_TEXT_EDITOR_DIR);
const PACKAGE_DIR = dirname(dirname(LIB_DIR));
const NEUTRAL_PACKAGE_DIR = join(PACKAGE_DIR, "..", "rich-text");

function readPackageFile(relativePath: string): string {
  return readFileSync(join(PACKAGE_DIR, relativePath), "utf8");
}

/** Every static import form the graphs recognise: `from` imports,
    side-effect imports, re-exports and static dynamic imports. */
function specifiersOf(relativePath: string): string[] {
  const text = readFileSync(join(PACKAGE_DIR, relativePath), "utf8");
  const found = new Set<string>();
  const patterns = [
    /(?:import|export)\s+[^'";]*?\sfrom\s*["']([^"']+)["']/g,
    /import\s*["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      found.add(match[1] as string);
    }
  }
  return [...found];
}

/** File extensions that carry no import edge: recorded, never traversed. */
const ASSET_EXTENSIONS = new Set([
  ".css",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".json",
]);

/** Resolve a relative specifier to a package-relative path, or null for a
    non-module asset. Throws when the target does not exist: an unresolved
    local import fails the test instead of silently dropping the edge. */
function resolveLocalSpecifier(
  fromFile: string,
  specifier: string,
): string | null {
  const base = fromFile.split("/").slice(0, -1).join("/");
  const parts: string[] = [];
  for (const part of `${base}/${specifier}`.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  const normalized = parts.join("/").replace(/\/\.\//g, "/");
  const dot = normalized.lastIndexOf(".");
  if (dot !== -1 && ASSET_EXTENSIONS.has(normalized.slice(dot))) {
    return null;
  }
  // TypeScript ESM convention: a `.js` specifier names a `.ts` (or
  // `.svelte`) source, so those siblings are candidates too.
  const candidates = normalized.endsWith(".js")
    ? [
        normalized,
        `${normalized.slice(0, -3)}.ts`,
        `${normalized.slice(0, -3)}.svelte`,
      ]
    : /\.(ts|svelte|mjs|cjs)$/.test(normalized)
      ? [normalized]
      : [
          `${normalized}.ts`,
          `${normalized}.svelte`,
          `${normalized}.js`,
          `${normalized}/index.ts`,
        ];
  for (const candidate of candidates) {
    try {
      readFileSync(join(PACKAGE_DIR, candidate), "utf8");
      return candidate;
    } catch {
      /* next candidate */
    }
  }
  throw new Error(
    `unresolved local import: "${specifier}" from "${fromFile}" (tried ${candidates.join(", ")})`,
  );
}

interface ModuleGraph {
  files: string[];
  edges: Array<{ file: string; specifier: string }>;
}

/** Transitive module graph from entry files through resolved relative
    imports. Bare specifiers are recorded as edges without descending into
    `node_modules`; every relative edge must resolve (fail closed). */
function resolveGraph(roots: string[]): ModuleGraph {
  for (const root of roots) {
    readFileSync(join(PACKAGE_DIR, root), "utf8");
  }
  const seen = new Set<string>();
  const edges: Array<{ file: string; specifier: string }> = [];
  const queue = [...roots];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of specifiersOf(file)) {
      edges.push({ file, specifier });
      if (!specifier.startsWith(".")) continue;
      const target = resolveLocalSpecifier(file, specifier);
      if (target !== null && !seen.has(target)) queue.push(target);
    }
  }
  return { files: [...seen], edges };
}

/** Source graph reachable from the subpath entry. */
function adapterGraph(): ModuleGraph {
  return resolveGraph([
    "src/lib/rich-text-editor/index.ts",
    "src/lib/rich-text-editor/RichTextEditor.svelte",
  ]);
}

/** Strip block and line comments (outside string literals) so JSDoc
    `@import` tags and examples never count as edges. */
function stripComments(text: string): string {
  const noBlocks = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return noBlocks
    .split("\n")
    .map((line) => {
      let quote: string | null = null;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (quote !== null) {
          if (char === "\\") index += 1;
          else if (char === quote) quote = null;
        } else if (char === '"' || char === "'" || char === "`") {
          quote = char;
        } else if (char === "/" && line[index + 1] === "/") {
          return line.slice(0, index);
        }
      }
      return line;
    })
    .join("\n");
}

interface RuntimeSpecifiers {
  runtime: string[];
  typeOnly: string[];
}

/** Runtime import specifiers of one module's text. Whole-`import type`
    statements are erased at build: recorded separately, never traversed.
    Keyword guards keep `import`/`require` inside strings (reserved-word
    lists, messages) out of the graph. */
function runtimeSpecifiersOf(text: string): RuntimeSpecifiers {
  const code = stripComments(text);
  const typeOnly = new Set<string>();
  const erasable = code.replace(
    /(?<![\w$"'])import\s+type\s+[^'";]*?\sfrom\s*["']([^"']+)["']/g,
    (_match, spec: string) => {
      typeOnly.add(spec);
      return "";
    },
  );
  const runtime = new Set<string>();
  const patterns = [
    /(?<![\w$"'])(?:import|export)\s+[^'";]*?\sfrom\s*["']([^"']+)["']/g,
    /(?<![\w$"'])import\s*["']([^"']+)["']/g,
    /(?<![\w$"'])import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /(?<![\w$."'])require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of erasable.matchAll(pattern)) {
      runtime.add(match[1] as string);
    }
  }
  return { runtime: [...runtime], typeOnly: [...typeOnly] };
}

function isAssetPath(path: string): boolean {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return false;
  const ext = path.slice(dot).split("?")[0] as string;
  return ASSET_EXTENSIONS.has(ext);
}

/** Resolve a relative specifier from an absolute importing file, or null
    for a non-module asset. Throws when the target does not exist. */
function resolveRelativeTarget(fromAbs: string, specifier: string): string | null {
  const normalized = resolve(dirname(fromAbs), specifier);
  if (/\.(ts|svelte|mjs|cjs|js)$/.test(normalized)) {
    try {
      readFileSync(normalized, "utf8");
      return normalized;
    } catch {
      throw new Error(
        `unresolved local import: "${specifier}" from "${fromAbs}"`,
      );
    }
  }
  const candidates = [
    `${normalized}.ts`,
    `${normalized}.svelte`,
    `${normalized}.js`,
    `${normalized}/index.ts`,
    `${normalized}/index.js`,
  ];
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, "utf8");
      return candidate;
    } catch {
      /* next candidate */
    }
  }
  throw new Error(
    `unresolved local import: "${specifier}" from "${fromAbs}" (tried ${candidates.join(", ")})`,
  );
}

function pickExportTarget(entry: unknown): string | null {
  if (typeof entry === "string") return entry;
  if (entry !== null && typeof entry === "object") {
    for (const condition of ["import", "default", "node", "require", "types"]) {
      const candidate = (entry as Record<string, unknown>)[condition];
      if (typeof candidate === "string") return candidate;
    }
  }
  return null;
}

/** ESM-conditions fallback for exports maps with no require/default target,
    plus `#` package self-references. Returns null when not found (the
    caller climbs or fails closed). */
function resolveViaExportsMap(specifier: string, fromAbs: string): string | null {
  if (specifier.startsWith("#")) {
    let dir = dirname(fromAbs);
    while (true) {
      try {
        const manifest = JSON.parse(
          readFileSync(join(dir, "package.json"), "utf8"),
        ) as { imports?: Record<string, unknown> };
        if (manifest.imports?.[specifier] !== undefined) {
          const target = pickExportTarget(manifest.imports[specifier]);
          if (target !== null) return resolve(dir, target);
        }
        return null;
      } catch {
        const parent = dirname(dir);
        if (parent === dir) return null;
        dir = parent;
      }
    }
  }
  const parts = specifier.split("/");
  const top = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0] as string;
  const sub = specifier.startsWith("@") ? parts.slice(2).join("/") : parts.slice(1).join("/");
  let dir = dirname(fromAbs);
  while (true) {
    const base = join(dir, "node_modules", top);
    try {
      const manifest = JSON.parse(
        readFileSync(join(base, "package.json"), "utf8"),
      ) as { exports?: Record<string, unknown>; main?: unknown };
      if (sub === "") {
        if (manifest.exports !== undefined) {
          const target = pickExportTarget(manifest.exports["."]);
          if (target !== null) return resolve(base, target);
          return null;
        }
        if (typeof manifest.main === "string") return resolve(base, manifest.main);
        return resolve(base, "index.js");
      }
      if (manifest.exports !== undefined) {
        const entry = manifest.exports[`./${sub}`];
        if (entry !== undefined) {
          const target = pickExportTarget(entry);
          if (target !== null) return resolve(base, target);
        }
        return null;
      }
      return resolve(base, sub);
    } catch {
      /* not here: climb */
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Resolve a bare specifier from its importing file through `node_modules`
    (fail closed). `node:`/`data:`/`blob:` and asset specifiers are not
    modules and return null. */
function resolveBareTarget(specifier: string, fromAbs: string): string | null {
  if (
    specifier.startsWith("node:") ||
    specifier.startsWith("data:") ||
    specifier.startsWith("blob:")
  ) {
    return null;
  }
  if (isAssetPath(specifier)) return null;
  try {
    return createRequire(fromAbs).resolve(specifier);
  } catch {
    const fallback = resolveViaExportsMap(specifier, fromAbs);
    if (fallback !== null) return fallback;
    throw new Error(`unresolved bare import: "${specifier}" from "${fromAbs}"`);
  }
}

interface ResolvedConsumerGraph {
  files: string[];
  runtimeSpecifiers: string[];
}

/** Fresh resolved consumer graph from BUILT entries through relative and
    bare imports into `node_modules`. Unlike the source walk above, a mocked
    transitive bare dependency that loads Tiptap is traversed and therefore
    observed. Every edge must resolve (fail closed). */
function resolveConsumerGraph(roots: string[]): ResolvedConsumerGraph {
  for (const root of roots) {
    readFileSync(root, "utf8");
  }
  const seen = new Set<string>();
  const runtimeSpecifiers: string[] = [];
  const queue = [...roots];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    if (isAssetPath(file)) continue;
    seen.add(file);
    const { runtime } = runtimeSpecifiersOf(readFileSync(file, "utf8"));
    for (const specifier of runtime) {
      runtimeSpecifiers.push(specifier);
      if (isAssetPath(specifier)) continue;
      const target = specifier.startsWith(".")
        ? resolveRelativeTarget(file, specifier)
        : resolveBareTarget(specifier, file);
      if (target !== null && !seen.has(target)) queue.push(target);
    }
    if (seen.size > 12000) {
      throw new Error("consumer module graph exceeded 12000 files");
    }
  }
  return { files: [...seen], runtimeSpecifiers };
}

function isEditorRuntimeSpecifier(specifier: string): boolean {
  return (
    specifier.startsWith("@tiptap/") || specifier.startsWith("prosemirror-")
  );
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
    for (const file of adapterGraph().files) {
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
    const graph = resolveGraph(["src/lib/index.ts"]);
    // Non-vacuous: the barrel fans out over the component library, so a
    // graph of a handful of files would mean the walk itself is broken.
    expect(graph.files.length).toBeGreaterThan(10);
    expect(graph.edges.length).toBeGreaterThan(0);
    for (const { file, specifier } of graph.edges) {
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

describe("resolved consumer graphs (RED-P, fresh graphs with bare dependencies)", () => {
  it(
    "the barrel consumer graph loads no editor runtime",
    () => {
      // Fresh graph from the BUILT barrel through relative and bare
      // imports into `node_modules`: a mocked transitive bare dependency
      // that loads Tiptap is traversed here (the source walk above stops
      // at bare edges), so it fails this test.
      const graph = resolveConsumerGraph([
        join(PACKAGE_DIR, "dist/index.js"),
      ]);
      // Non-vacuous: the barrel fans out over the component library and
      // its dependencies (thousands of modules), so a small graph would
      // mean the walk itself is broken.
      expect(graph.files.length).toBeGreaterThan(100);
      expect(graph.runtimeSpecifiers.length).toBeGreaterThan(0);
      const runtimeHits = graph.runtimeSpecifiers.filter(
        isEditorRuntimeSpecifier,
      );
      expect(
        `editor-runtime edges in the barrel graph: ${JSON.stringify([...new Set(runtimeHits)].slice(0, 10))}`,
      ).toBe("editor-runtime edges in the barrel graph: []");
      const richTextHits = [...graph.files, ...graph.runtimeSpecifiers].filter(
        (entry) => entry.includes("rich-text"),
      );
      expect(
        `rich-text edges in the barrel graph: ${JSON.stringify(richTextHits.slice(0, 10))}`,
      ).toBe("rich-text edges in the barrel graph: []");
    },
    120000,
  );

  it(
    "the subpath consumer graph loads the editor runtime (positive control)",
    () => {
      // The same walk from the BUILT subpath entry must reach Tiptap/
      // ProseMirror through the neutral entry: without this control, the
      // barrel absence above would be vacuous.
      const graph = resolveConsumerGraph([
        join(PACKAGE_DIR, "dist/rich-text-editor/index.js"),
      ]);
      expect(graph.files.length).toBeGreaterThan(10);
      const runtimeHits = [
        ...new Set(
          graph.runtimeSpecifiers.filter(isEditorRuntimeSpecifier),
        ),
      ];
      expect(runtimeHits.length).toBeGreaterThan(0);
      expect(
        graph.files.some((file) => file.includes("design-system-rich-text")),
        "the subpath graph must reach the neutral package",
      ).toBe(true);
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
    const graph = adapterGraph();
    expect(graph.edges.length).toBeGreaterThan(0);
    for (const { file, specifier } of graph.edges) {
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
    const graph = adapterGraph();
    for (const { file, specifier } of graph.edges) {
      expect(
        specifier.startsWith("@tiptap/") || specifier.startsWith("prosemirror-"),
        `${file} must not import the editor runtime directly ("${specifier}"): use "@sentropic/design-system-rich-text/editor"`,
      ).toBe(false);
    }
    const direct = graph.edges.filter(
      (row) => row.specifier === "@sentropic/design-system-rich-text/editor",
    );
    expect(direct.length).toBeGreaterThan(0);
  });

  it("the subpath graph reaches the editor runtime through the neutral entry (positive control)", async () => {
    // Control 1: Tiptap itself resolves and loads, so the absences above
    // are meaningful instead of vacuous.
    const tiptap = await import("@tiptap/core");
    expect(tiptap).toBeDefined();
    // Control 2: the neutral entry the adapter reaches really pulls the
    // editor runtime. Read from the neutral package sources (no build
    // needed) plus a resolvability check of the published entry.
    const resolved = await import.meta.resolve(
      "@sentropic/design-system-rich-text/editor",
    );
    expect(resolved).toContain("/rich-text/");
    const helperFiles = readdirSync(join(NEUTRAL_PACKAGE_DIR, "src")).filter(
      (name) =>
        (name === "editor.ts" || name.startsWith("editor-")) &&
        name.endsWith(".ts") &&
        !name.endsWith(".test.ts"),
    );
    expect(helperFiles.length).toBeGreaterThan(0);
    const runtimeEdges = helperFiles.flatMap((name) => {
      const text = readFileSync(join(NEUTRAL_PACKAGE_DIR, "src", name), "utf8");
      return [...text.matchAll(/(?:import|export)\s+[^'";]*?\sfrom\s*["']([^"']+)["']/g)].map(
        (match) => `${name} -> ${match[1] as string}`,
      );
    });
    expect(
      runtimeEdges.some(
        (edge) =>
          edge.includes("@tiptap/") || edge.includes("prosemirror-"),
      ),
      `the neutral "./editor" entry must pull the editor runtime (saw: ${runtimeEdges.slice(0, 8).join(", ")})`,
    ).toBe(true);
  });
});
