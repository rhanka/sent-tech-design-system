// @vitest-environment node
//
// W-0.3 — import-graph gate for @sentropic/design-system-artifact-shell.
//
// Walks src/**/*.{ts,svelte} and asserts, on every import/export specifier:
//   1. allowlist: relative paths; @sentropic/design-system-tokens;
//      @sentropic/design-system-themes; @sentropic/design-system-svelte (and
//      its documented subpaths); svelte and svelte/*; @testing-library/svelte
//      and vitest in test files only.
//   2. forbidden: any other @sentropic/ package; any specifier containing
//      artifacts / mcp / transport / immo / dataviz / diagram-core /
//      diagram-codecs; any bare "sentropic" runtime name; any direct
//      @lucide/svelte import.
//   3. cardinality floor: the scan must examine at least MIN_SOURCE_FILES
//      non-test source files (AS-0 floor: types, fixtures, barrel) so a
//      silently empty scan fails; the examined count is printed.
//   4. string scan: no source file declares a Sentropic anchor field name
//      (blockKey / structuralPath / quoteHash / anchorId) as a type member.
//   5. client-neutrality scan (owner rule): no source or fixture file under
//      src/** contains a hard-coded client/agent product name. The blocklist
//      is assembled from fragments so this gate file does not self-match;
//      the gate file itself is excluded from every scan (it is the scanner).
//
// types.ts must additionally be a pure type module: zero import specifiers.
//
// The failure mode of items 1/2/5 is verified once by a temporary plant
// (planted specifier / planted name in a fixture, gate fails, plant removed —
// never committed); see SPIKES.md.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
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

const SOURCE_EXTENSIONS = new Set([".ts", ".svelte"]);

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
  for (const match of source.matchAll(/\bfrom\s*["']([^"']+)["']/g)) specs.add(match[1]);
  for (const match of source.matchAll(/\bimport\s*["']([^"']+)["']/g)) specs.add(match[1]);
  return [...specs];
}

const allFiles = walk(srcRoot).map((abs) => ({
  abs,
  rel: relative(srcRoot, abs),
  isGate: relative(srcRoot, abs) === join("lib", GATE_FILE),
  isTest: abs.endsWith(".test.ts"),
  source: readFileSync(abs, "utf8")
}));

// Every file except the gate itself is scanned (sources, fixtures, tests).
const scanned = allFiles.filter((f) => !f.isGate);
const sourceFiles = scanned.filter((f) => !f.isTest && SOURCE_EXTENSIONS.has(f.abs.slice(f.abs.lastIndexOf("."))));

function specifierViolations(): string[] {
  const violations: string[] = [];
  for (const file of scanned) {
    if (!SOURCE_EXTENSIONS.has(file.abs.slice(file.abs.lastIndexOf(".")))) continue;
    for (const spec of extractSpecifiers(file.source)) {
      if (spec.startsWith(".")) continue; // relative path
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
});
