// @vitest-environment node
//
// W-0.3 — import-graph gate for @sentropic/design-system-artifact-shell.
//
// Walks src/**/*.{ts,svelte,js,mjs,css} and asserts, on every import/export
// specifier (static `from` / side-effect `import "…"`, dynamic `import("…")`,
// TS `import("…").Type` specifiers, `require("…")`, template-literal
// `import(\`…\`)` / `` from `…` ``, block comments allowed between the keyword
// and the string e.g. `import(/* c */ "x")`, and `@import` in `.css` files and
// in the `<style>` blocks of `.svelte` files, quoted and `url(…)` forms):
//   1. allowlist (documented set): relative paths that resolve and stay inside
//      src/; the bare specifiers @sentropic/design-system-tokens,
//      @sentropic/design-system-themes, @sentropic/design-system-svelte —
//      a SUBPATH of an allowed package (e.g.
//      "@sentropic/design-system-svelte/<anything>") is a violation unless it
//      is listed in ALLOWED_DS_SPECIFIERS explicitly; svelte and svelte/*;
//      in test files only (*.test.{ts,js,mjs}, which includes
//      *.browser.test.mjs): @testing-library/svelte, vitest, puppeteer-core
//      and node:* builtins.
//   2. forbidden: any other @sentropic/ package; any specifier containing
//      artifacts / mcp / transport / immo / dataviz / diagram-core /
//      diagram-codecs; any bare "sentropic" runtime name; any direct
//      @lucide/svelte import. A relative specifier that escapes src/ (e.g.
//      ../../diagram-core/src/…) is a violation even though it starts with ".".
//      A template-literal specifier with ${…} interpolation cannot be verified
//      statically and is a violation.
//   3. cardinality floor: the scan must examine at least MIN_SOURCE_FILES
//      non-test source files (AS-0 floor: types, fixtures, barrel) so a
//      silently empty scan fails; the examined count is printed.
//   4. string scan: no source file declares a Sentropic anchor field name
//      (blockKey / structuralPath / quoteHash / anchorId) as a type member.
//   5. client-neutrality scan (owner rule): no source or fixture file under
//      src/** contains a hard-coded client/agent product name. The blocklist
//      is assembled from fragments so this gate file does not self-match;
//      the gate file itself is excluded from every scan (it is the scanner).
//   6. colour-literal scan (spec §11): no raw colour literal appears in any
//      file under src/** except the token table src/lib/tokens.css — the one
//      place §11 allows them; the exemption is anchored by asserting the token
//      table exists. Detected: hex, rgb()/rgba()/hsl()/hsla()/oklch()/oklab()/
//      hwb()/lab()/lch()/color()/color-mix()/light-dark( functions, and CSS
//      named colours used as a value token (white, transparent, …).
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

// Documented allowlist of @sentropic/ specifiers (spec §2.6 item 1). Only the
// exact strings below are allowed: the bare package names. A subpath of an
// allowed package (e.g. "@sentropic/design-system-svelte/presence-badge") is
// rejected unless it is added here explicitly. AS-0/AS-1 import the Svelte
// primitives through the barrel only (S-3 PASS); if the §1 fallback ever
// fires, the fallback subpath is added to this set in the same change that
// first uses it.
const ALLOWED_DS_SPECIFIERS = new Set([
  "@sentropic/design-system-tokens",
  "@sentropic/design-system-themes",
  "@sentropic/design-system-svelte"
]);
const ALLOWED_DS_PACKAGES = new Set([...ALLOWED_DS_SPECIFIERS].map((s) => packageOf(s)));
// Allowed in test files only: *.test.{ts,js,mjs} — which includes
// *.browser.test.mjs (the AS-1 browser witnesses run with `node <file>`
// through the repository puppeteer-core harness, and the W-1.9 source scan of
// .svelte files needs node:fs).
const TEST_ONLY_PACKAGES = new Set(["@testing-library/svelte", "vitest", "puppeteer-core"]);

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
const TEST_FILE_RE = /\.test\.(ts|js|mjs)$/; // matches *.test.* and *.browser.test.mjs
// The token table (spec §2.5 / A0-17) is the one file under src/** where a raw
// colour literal is allowed (spec §11).
const TOKEN_TABLE_REL = join("lib", "tokens.css");

// Optional block comments between a keyword and its string, so that
// `import(/* c */ "x")` and `from /* c */ "x"` are still extracted.
const OPT_BLOCK_COMMENTS = String.raw`(?:\/\*[^]*?\*\/\s*)*`;
// Marker prefix for a template-literal specifier containing ${…}: its value is
// dynamic and cannot be verified statically, so it is always a violation.
const UNVERIFIABLE = "\u0000unverifiable\u0000";

const HEX_COLOUR_RE = new RegExp("#" + "[0-9a-fA-F]{3,8}\\b");
// Colour functions, incl. color-mix(, hwb(/lab(/lch(, color(, light-dark(.
// The lookbehind keeps e.g. "background-color(" from matching "color(".
const COLOUR_FUNCTION_RE = new RegExp(
  "(?<![\\w-])(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch|color|color-mix|light-dark)\\s*\\("
);
// CSS named colours (plus the transparent keyword) used as a standalone value
// token — the boundaries keep them from matching inside a longer identifier
// (--x-white, white-space, backgroundColor).
const NAMED_COLOURS = [
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
  "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
  "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
  "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
  "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
  "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
  "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
  "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
  "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo",
  "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
  "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
  "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
  "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
  "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
  "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite",
  "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink",
  "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue",
  "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver",
  "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue",
  "tan", "teal", "thistle", "tomato", "transparent", "turquoise", "violet", "wheat", "white",
  "whitesmoke", "yellow", "yellowgreen"
];
const NAMED_COLOUR_RE = new RegExp("(?<![\\w-])(?:" + NAMED_COLOURS.join("|") + ")(?![\\w-])");
const COLOUR_LITERAL_PATTERNS = [HEX_COLOUR_RE, COLOUR_FUNCTION_RE, NAMED_COLOUR_RE];

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
  const fromRe = new RegExp("\\bfrom\\s*" + OPT_BLOCK_COMMENTS + "[\"']([^\"']+)[\"']", "g");
  // side-effect import: import "…"
  const sideEffectRe = new RegExp("\\bimport\\s*" + OPT_BLOCK_COMMENTS + "[\"']([^\"']+)[\"']", "g");
  // dynamic import: import("…") — also covers the TS import("…").Type specifier
  const dynamicRe = new RegExp("\\bimport\\s*\\(\\s*" + OPT_BLOCK_COMMENTS + "[\"']([^\"']+)[\"']\\s*\\)", "g");
  // require("…")
  const requireRe = new RegExp("\\brequire\\s*\\(\\s*" + OPT_BLOCK_COMMENTS + "[\"']([^\"']+)[\"']\\s*\\)", "g");
  for (const re of [fromRe, sideEffectRe, dynamicRe, requireRe]) {
    for (const match of source.matchAll(re)) specs.add(match[1]);
  }
  // template literals: import(`…`), from `…`, require(`…`). Without ${…} the
  // specifier is static and checked normally; with ${…} it is unverifiable.
  const templateRe = new RegExp(
    "\\b(?:import\\s*\\(\\s*|from\\s*|require\\s*\\(\\s*)" + OPT_BLOCK_COMMENTS + "`([^`]+)`",
    "g"
  );
  for (const match of source.matchAll(templateRe)) {
    specs.add(match[1].includes("${") ? UNVERIFIABLE + match[1] : match[1]);
  }
  return [...specs];
}

// @import specifiers in .css files and in the <style> blocks of .svelte files:
// the quoted form (@import "…"; @import url("…")) and the unquoted url(…) form.
function extractCssImports(source: string): string[] {
  const specs = new Set<string>();
  const quotedRe = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/g;
  const unquotedRe = /@import\s+url\(\s*([^)"'\s]+)\s*\)/g;
  for (const match of source.matchAll(quotedRe)) specs.add(match[1]);
  for (const match of source.matchAll(unquotedRe)) specs.add(match[1]);
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

function classifySpecifier(file: ScannedFile, spec: string): string | null {
  if (spec.startsWith(UNVERIFIABLE)) {
    return `${file.rel}: dynamic template-literal specifier cannot be statically verified ("${spec.slice(UNVERIFIABLE.length)}")`;
  }
  if (spec.startsWith(".")) {
    // Relative specifiers are allowed only if they resolve inside src/;
    // a traversal out of the package (e.g. ../../diagram-core/src/…) is a
    // violation, and the resolved path must not hit a forbidden substring.
    const resolved = resolve(dirname(file.abs), spec);
    const relToSrc = relative(srcRoot, resolved);
    if (relToSrc.startsWith("..") || isAbsolute(relToSrc)) {
      return `${file.rel}: relative specifier "${spec}" escapes src/`;
    }
    const lower = relative(pkgRoot, resolved).toLowerCase();
    const hit = FORBIDDEN_SUBSTRINGS.find((f) => lower.includes(f.toLowerCase()));
    if (hit) {
      return `${file.rel}: relative specifier "${spec}" resolves to a forbidden path (contains "${hit}")`;
    }
    return null;
  }
  if (spec.startsWith("@sentropic/")) {
    if (ALLOWED_DS_SPECIFIERS.has(spec)) return null;
    if (ALLOWED_DS_PACKAGES.has(packageOf(spec))) {
      return `${file.rel}: @sentropic/ subpath "${spec}" is not in the documented specifier set (ALLOWED_DS_SPECIFIERS)`;
    }
    return `${file.rel}: non-allowlisted @sentropic/ specifier "${spec}"`;
  }
  if (spec === "svelte" || spec.startsWith("svelte/")) return null;
  // Test files only (*.test.* incl. *.browser.test.mjs): node:* builtins and
  // puppeteer-core (the repository browser harness) plus the test runners.
  if (file.isTest && (spec.startsWith("node:") || TEST_ONLY_PACKAGES.has(packageOf(spec)))) return null;
  const lower = spec.toLowerCase();
  if (lower.includes("sentropic")) {
    return `${file.rel}: bare sentropic runtime specifier "${spec}"`;
  }
  const hit = FORBIDDEN_SUBSTRINGS.find((f) => lower.includes(f.toLowerCase()));
  if (hit) {
    return `${file.rel}: forbidden specifier "${spec}" (contains "${hit}")`;
  }
  return `${file.rel}: specifier "${spec}" is not on the allowlist`;
}

function specifierViolations(files: ScannedFile[] = scanned): string[] {
  const violations: string[] = [];
  for (const file of files) {
    const ext = file.abs.slice(file.abs.lastIndexOf("."));
    const specs: string[] = [];
    if (SOURCE_EXTENSIONS.has(ext)) specs.push(...extractSpecifiers(file.source));
    // .css files and the <style> blocks of .svelte files carry @import specifiers.
    if (ext === ".css" || ext === ".svelte") specs.push(...extractCssImports(file.source));
    for (const spec of specs) {
      const violation = classifySpecifier(file, spec);
      if (violation) violations.push(violation);
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
    // The exemption is anchored: the token table must exist and is the only
    // exempted file.
    expect(scanned.some((f) => f.rel === TOKEN_TABLE_REL), "src/lib/tokens.css (token table) must exist").toBe(true);
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
          'import { foundation } from "@sentropic/design-system-tokens";\nimport { IconButton } from "@sentropic/design-system-svelte";\nimport type { BlockDisplay } from "./types.js";\nimport "./tokens.css";'
        )
      ])
    ).toEqual([]);
  });

  it("allows node:* and puppeteer-core in test files only (*.test.* incl. *.browser.test.mjs)", () => {
    expect(
      specifierViolations([
        plant(
          "zz-ok.test.ts",
          'import { readFileSync } from "node:fs";\nimport { launch } from "puppeteer-core";\nimport { describe } from "vitest";',
          true
        ),
        plant("zz-ok.browser.test.mjs", 'import puppeteer from "puppeteer-core";\nimport { join } from "node:path";', true)
      ])
    ).toEqual([]);
    // the same specifiers in a non-test source file are violations
    const v = specifierViolations([
      plant("zz-node.ts", 'import { readFileSync } from "node:fs";'),
      plant("zz-pup.mjs", 'import puppeteer from "puppeteer-core";')
    ]);
    expect(v.some((m) => m.includes('"node:fs"') && m.includes("not on the allowlist"))).toBe(true);
    expect(v.some((m) => m.includes('"puppeteer-core"') && m.includes("not on the allowlist"))).toBe(true);
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

  it("catches a template-literal import() of a forbidden specifier", () => {
    const v = specifierViolations([plant("zz-tmpl.mjs", "export const load = () => import(`@sentropic/artifacts`);")]);
    expect(v.some((m) => m.includes('"@sentropic/artifacts"'))).toBe(true);
  });

  it("catches a template-literal specifier with ${…} interpolation as unverifiable", () => {
    const v = specifierViolations([plant("zz-tmpl-dyn.mjs", "export const load = (p) => import(`./mod-${p}`);")]);
    expect(v.some((m) => m.includes("cannot be statically verified"))).toBe(true);
  });

  it("catches block comments between the keyword and the specifier (import( with /* c */ and from with /* c */)", () => {
    const v = specifierViolations([
      plant("zz-comment.ts", 'const m = import(/* bundler hint */ "@sentropic/transport");'),
      plant("zz-comment2.ts", 'export { x } from /* c */ "diagram-core";')
    ]);
    expect(v.some((m) => m.includes('"@sentropic/transport"'))).toBe(true);
    expect(v.some((m) => m.includes('"diagram-core"'))).toBe(true);
  });

  it("catches @import in a .css file under src (quoted and unquoted url forms)", () => {
    const v = specifierViolations([
      plant("zz-style.css", '@import "@sentropic/artifacts/theme.css";\n@import url(mcp/x.css);\n@import url("./local.css");')
    ]);
    expect(v.filter((m) => m.includes("zz-style.css")).length).toBe(2);
    expect(v.some((m) => m.includes('"@sentropic/artifacts/theme.css"'))).toBe(true);
    expect(v.some((m) => m.includes("mcp/x.css"))).toBe(true);
  });

  it("catches @import in the <style> block of a .svelte file", () => {
    const v = specifierViolations([
      plant("zz-comp.svelte", '<script>export let x = 1;</script>\n<style>@import url("diagram-core/x.css");</style>')
    ]);
    expect(v.some((m) => m.includes("diagram-core/x.css"))).toBe(true);
  });

  it("catches a subpath of an allowed @sentropic/ package that is not in the documented set", () => {
    const v = specifierViolations([
      plant("zz-sub.ts", 'import { PresenceBadge } from "@sentropic/design-system-svelte/presence-badge";')
    ]);
    expect(v.some((m) => m.includes("not in the documented specifier set"))).toBe(true);
  });

  it("catches raw colour literals outside the token table, and exempts the token table", () => {
    expect(colourLiteralViolations([plant("zz-hex.ts", 'const c = "#ff0000";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-fn.ts", 'const c = "rgb(15 23 42 / 0.08)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-mix.css", ":root { --x: color-mix(in srgb, red, blue); }")]).length).toBeGreaterThanOrEqual(1);
    expect(colourLiteralViolations([plant("zz-hwb.ts", 'const c = "hwb(0 0% 0%)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-lab.ts", 'const c = "lab(50% 40 59)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-lch.ts", 'const c = "lch(50% 40 30)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-color.ts", 'const c = "color(display-p3 1 0 0)";')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-ld.ts", 'const c = "light-dark(black, white)";')]).length).toBeGreaterThanOrEqual(1);
    expect(colourLiteralViolations([plant("zz-named.svelte", '<div style="color: white">x</div>')]).length).toBe(1);
    expect(colourLiteralViolations([plant("zz-ok.ts", 'const c = foundation.color.slate[10];')])).toEqual([]);
    expect(colourLiteralViolations([plant("zz-ok2.ts", 'const c = "var(--st-semantic-border-interactive)";')])).toEqual([]);
    expect(colourLiteralViolations([plant("tokens.css", ":root { --x: #fff; color: white; }")])).toEqual([]);
  });
});
