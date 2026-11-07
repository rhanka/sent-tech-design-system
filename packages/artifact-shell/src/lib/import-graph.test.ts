// @vitest-environment node
//
// W-0.3 — import-graph gate for @sentropic/design-system-artifact-shell.
//
// Walks src/**/*.{ts,svelte,js,mjs} and asserts, on every import/export
// specifier (static `from` / side-effect `import "…"`, dynamic `import("…")`,
// TS `import("…").Type` specifiers and `require("…")`):
//   1. allowlist: relative paths that resolve and stay inside src/;
//      @sentropic/design-system-tokens; @sentropic/design-system-themes;
//      @sentropic/design-system-svelte (and its documented subpaths); svelte
//      and svelte/*; @testing-library/svelte and vitest in test files only.
//   2. forbidden: any other @sentropic/ package; any specifier containing
//      artifacts / mcp / transport / immo / dataviz / diagram-core /
//      diagram-codecs; any bare "sentropic" runtime name; any direct
//      @lucide/svelte import. A relative specifier that escapes src/ (e.g.
//      ../../diagram-core/src/…) is a violation even though it starts with ".".
//   3. cardinality floor: the scan must examine at least MIN_SOURCE_FILES
//      non-test source files (AS-0 floor: types, fixtures, barrel) so a
//      silently empty scan fails; the examined count is printed.
//   4. string scan: no source file declares a Sentropic anchor field name
//      (blockKey / structuralPath / quoteHash / anchorId) as a type member.
//   5. client-neutrality scan (owner rule): no source or fixture file under
//      src/** contains a hard-coded client/agent product name. The blocklist
//      is assembled from fragments so this gate file does not self-match;
//      the gate file itself is excluded from every scan (it is the scanner).
//   6. colour-literal scan (spec §11): no raw colour literal (hex or rgb()/hsl()/
//      oklch()/… function) appears in any file under src/** except the token
//      table src/lib/tokens.css, the one place §11 allows them.
//
// types.ts must additionally be a pure type module: zero import specifiers.
//
// The failure mode of items 1/2/5/6 is verified by the planted-failure tests
// below (in-memory synthetic files — the plants are never written to src/ and
// never committed), complementing the one-time temporary plants recorded in
// SPIKES.md.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const srcRoot = join(pkgRoot, "src");
const GATE_FILE = "import-graph.test.ts";

// AS-0 floor: types.ts, fixtures.ts, index.ts (ScaffoldSmoke.svelte raises the
// count to 4). AS-1 raises this constant in the same commit that adds the
// components.
const MIN_SOURCE_FILES = 3;

const ALLOWED_DS_PACKAGES = new Set([
  "@sentropic/design-system-tokens",
  "@sentropic/design-system-themes",
  "@sentropic/design-system-svelte"
]);
const TEST_ONLY_PACKAGES = new Set(["@testing-library/svelte", "vitest"]);

// Assembled from fragments so this file does not self-match its own blocklist.
const FORBIDDEN_SUBSTRINGS = [
  "artifacts",
  "m" + "cp",
  "trans" + "port",
  "im" + "mo",
  "data" + "viz",
  "diagram-" + "core",
  "diagram-" + "codecs",
  "@lucide/" + "svelte"
];
const ANCHOR_FIELD_NAMES = ["block" + "Key", "structural" + "Path", "quote" + "Hash", "anchor" + "Id"];
const CLIENT_NAME_FRAGMENTS = ["Cla" + "ude", "Cod" + "ex", "Gem" + "ini", "Mis" + "tral"];

const SOURCE_EXTENSIONS = new Set([".ts", ".svelte", ".js", ".mjs"]);
const TEST_FILE_RE = /\.test\.(ts|js|mjs)$/;
// The token table (spec §2.5 / A0-17) is the one file under src/** where a raw
// colour literal is allowed (spec §11).
const TOKEN_TABLE_REL = join("lib", "tokens.css");
// Assembled so the patterns below do not self-match if this file were scanned
// (it is excluded from every scan — it is the scanner).
const COLOUR_LITERAL_PATTERNS = [
  new RegExp("#" + "[0-9a-fA-F]{3,8}\\b"),
  new RegExp("\\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\\s*\\(")
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

function packageOf(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function extractSpecifiers(source: string): string[] {
  const specs = new Set<string>();
  // static `export … from "…"` / `import … from "…"` (incl. `import type`)
  for (const match of source.matchAll(/\bfrom\s*["']([^"']+)["']/g)) specs.add(match[1]);
  // side-effect import: import "…"
  for (const match of source.matchAll(/\bimport\s*["']([^"']+)["']/g)) specs.add(match[1]);
  // dynamic import: import("…")
  for (const match of source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) specs.add(match[1]);
  // TS import-type specifier: import("…").Type — same pattern as dynamic import
  // require("…")
  for (const match of source.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)) specs.add(match[1]);
  return [...specs];
}

type ScannedFile = {
  abs: string;
  rel: string;
  isGate: boolean;
  isTest: boolean;
  source: string;
};

const allFiles: ScannedFile[] = walk(srcRoot).map((abs) => ({
  abs,
  rel: relative(srcRoot, abs),
  isGate: relative(srcRoot, abs) === join("lib", GATE_FILE),
  isTest: TEST_FILE_RE.test(abs),
  source: readFileSync(abs, "utf8")
}));

// Every file except the gate itself is scanned (sources, fixtures, tests).
const scanned = allFiles.filter((f) => !f.isGate);
const sourceFiles = scanned.filter((f) => !f.isTest && SOURCE_EXTENSIONS.has(f.abs.slice(f.abs.lastIndexOf("."))));

function specifierViolations(files: ScannedFile[] = scanned): string[] {
  const violations: string[] = [];
  for (const file of files) {
    if (!SOURCE_EXTENSIONS.has(file.abs.slice(file.abs.lastIndexOf(".")))) continue;
    for (const spec of extractSpecifiers(file.source)) {
      if (spec.startsWith(".")) {
        // Relative specifiers are allowed only if they resolve inside src/;
        // a traversal out of the package (e.g. ../../diagram-core/src/…) is a
        // violation, and the resolved path must not hit a forbidden substring.
        const resolved = resolve(dirname(file.abs), spec);
        const relToSrc = relative(srcRoot, resolved);
        if (relToSrc.startsWith("..") || isAbsolute(relToSrc)) {
          violations.push(`${file.rel}: relative specifier "${spec}" escapes src/`);
          continue;
        }
        const lower = relative(pkgRoot, resolved).toLowerCase();
        const hit = FORBIDDEN_SUBSTRINGS.find((f) => lower.includes(f.toLowerCase()));
        if (hit) {
          violations.push(`${file.rel}: relative specifier "${spec}" resolves to a forbidden path (contains "${hit}")`);
        }
        continue;
      }
      if (spec.startsWith("@sentropic/")) {
        if (!ALLOWED_DS_PACKAGES.has(packageOf(spec))) {
          violations.push(`${file.rel}: non-allowlisted @sentropic/ specifier "${spec}"`);
        }
        continue;
      }
      if (spec === "svelte" || spec.startsWith("svelte/")) continue;
      if (file.isTest && TEST_ONLY_PACKAGES.has(packageOf(spec))) continue;
      const lower = spec.toLowerCase();
      if (lower.includes("sentropic")) {
        violations.push(`${file.rel}: bare sentropic runtime specifier "${spec}"`);
        continue;
      }
      const hit = FORBIDDEN_SUBSTRINGS.find((f) => lower.includes(f.toLowerCase()));
      if (hit) {
        violations.push(`${file.rel}: forbidden specifier "${spec}" (contains "${hit}")`);
        continue;
      }
      violations.push(`${file.rel}: specifier "${spec}" is not on the allowlist`);
    }
  }
  return violations;
}

function colourLiteralViolations(files: ScannedFile[] = scanned): string[] {
  const hits: string[] = [];
  for (const file of files) {
    if (file.rel === TOKEN_TABLE_REL) continue; // the token table is exempt (§11)
    for (const pattern of COLOUR_LITERAL_PATTERNS) {
      if (pattern.test(file.source)) hits.push(`${file.rel}: raw colour literal matches ${pattern}`);
    }
  }
  return hits;
}

describe("W-0.3 import-graph gate", () => {
  it("examines at least the AS-0 cardinality floor of source files (printed)", () => {
    console.log(`import-graph gate: examined ${sourceFiles.length} source files (floor ${MIN_SOURCE_FILES})`);
    expect(sourceFiles.length).toBeGreaterThanOrEqual(MIN_SOURCE_FILES);
    expect(scanned.length).toBeGreaterThan(0);
  });

  it("allows only allowlisted import/export specifiers", () => {
    expect(specifierViolations()).toEqual([]);
  });

  it("types.ts is a pure type module (zero import specifiers)", () => {
    const typesFile = scanned.find((f) => f.rel === join("lib", "types.ts"));
    expect(typesFile, "src/lib/types.ts must exist").toBeTruthy();
    expect(extractSpecifiers(typesFile!.source)).toEqual([]);
  });

  it("no source declares a Sentropic anchor field name as a type member", () => {
    const hits: string[] = [];
    for (const file of scanned) {
      for (const name of ANCHOR_FIELD_NAMES) {
        if (file.source.includes(name)) hits.push(`${file.rel}: contains "${name}"`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("no source or fixture contains a hard-coded client/agent product name", () => {
    const hits: string[] = [];
    for (const file of scanned) {
      const lower = file.source.toLowerCase();
      for (const fragment of CLIENT_NAME_FRAGMENTS) {
        if (lower.includes(fragment.toLowerCase())) {
          hits.push(`${file.rel}: contains a forbidden client/agent name`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it("no raw colour literal appears outside the token table (spec §11)", () => {
    expect(colourLiteralViolations()).toEqual([]);
  });
});

// Planted-failure cases (W-0.3): each plant is an in-memory synthetic file —
// it is never written to src/ and never committed. Each test proves the gate
// fails on the wrong shape it is supposed to catch.
describe("W-0.3 planted-failure cases (in-memory plants, never written to src/)", () => {
  const plant = (name: string, source: string, isTest = false): ScannedFile => ({
    abs: join(srcRoot, "lib", name),
    rel: join("lib", name),
    isGate: false,
    isTest,
    source
  });

  it("allowlisted plants produce no violations (positive control)", () => {
    expect(
      specifierViolations([
        plant(
          "zz-ok.ts",
          'import { foundation } from "@sentropic/design-system-tokens";\nimport type { BlockDisplay } from "./types.js";\nimport "./tokens.css";'
        )
      ])
    ).toEqual([]);
  });

  it("catches a dynamic import() of a forbidden specifier in a .mjs file under src", () => {
    const v = specifierViolations([plant("zz-dyn.mjs", 'export const load = () => import("@sentropic/artifacts");')]);
    expect(v.some((m) => m.includes('"@sentropic/artifacts"'))).toBe(true);
  });

  it("catches a TS import(\"…\") type specifier", () => {
    const v = specifierViolations([plant("zz-type.ts", 'type K = import("@sentropic/transport").BlockKey;')]);
    expect(v.some((m) => m.includes('"@sentropic/transport"'))).toBe(true);
  });

  it("catches a require() of a forbidden specifier in a .js file under src", () => {
    const v = specifierViolations([plant("zz-req.js", 'const m = require("mcp");')]);
    expect(v.some((m) => m.includes("forbidden specifier"))).toBe(true);
  });

  it("catches a side-effect import of a forbidden bare package in a .js file under src", () => {
    const v = specifierViolations([plant("zz-side.js", 'import "diagram-core";')]);
    expect(v.some((m) => m.includes('"diagram-core"'))).toBe(true);
  });

  it("catches a relative path escape out of the package", () => {
    const v = specifierViolations([plant("zz-rel.ts", 'import "../../diagram-core/src/index.js";')]);
    expect(v.some((m) => m.includes("escapes src/"))).toBe(true);
  });

  it("catches a relative path escape out of src/ even without a forbidden name", () => {
    const v = specifierViolations([plant("zz-rel2.ts", 'import "../../../outside.js";')]);
    expect(v.some((m) => m.includes("escapes src/"))).toBe(true);
  });

  it("catches raw colour literals outside the token table, and exempts the token table", () => {
    expect(colourLiteralViolations([plant("zz-hex.ts", 'const c = "#ff0000";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-fn.ts", 'const c = "rgb(15 23 42 / 0.08)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-ok.ts", 'const c = foundation.color.slate[10];')])).toEqual([]);
    expect(colourLiteralViolations([plant("tokens.css", ":root { --x: #fff; }")])).toEqual([]);
  });
});
