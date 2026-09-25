// Mechanised defect classes from the theme programme's adversarial reviews.
//
// Eleven defect classes came out of the first two construction lots' reviews.
// They split on one criterion: is there a ground truth inside this repository?
// The ones that have it are mechanised here. The ones that do not — whether a hex
// comes from a brand rule or a vendor block, whether a rule is scoped to one
// component, whether "the brand publishes no X" is true, whether a cited selector
// declares the property it is cited for — need the live upstream source and a
// judgement, and stay with adversarial review.
//
// Like `verify-theme-shape.test.mjs`, these guards read the TypeScript SOURCE
// rather than a built `dist/`: the root `npm test` runs `node --test scripts/*`
// before any workspace build, so a guard that imported `dist/` would either be
// skipped or assert a stale artefact.
//
// Each guard here was verified by MUTATION, not by passing: the defect it
// describes was reintroduced, the guard was confirmed red, and the file was
// restored byte-identical. A guard nobody has seen fail is a guard nobody should
// trust.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const packagesDir = new URL("../packages/", import.meta.url).pathname;

function themeDirs() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("theme-"))
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(packagesDir, name, "src/index.ts")))
    .sort();
}

// A system fallback stack carries no brand meaning, and neither reference package
// pins one, so demanding it would flag the whole tree.
// Arial and Roboto are deliberately NOT here. They look like fallbacks, but they
// are the brand faces of real themes in this tree, and the two findings that
// motivated this guard were exactly an unpinned Arial and an unpinned Roboto.
// Listing them would have neutered the guard against its own reason to exist —
// which is what the first version did, and what mutation testing caught.
const SYSTEM_FACES = new Set([
  "inherit", "sans-serif", "serif", "monospace", "system-ui", "-apple-system",
  "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue",
  "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono",
  "Courier New", "ui-monospace", "ui-sans-serif"
]);

// The guards below split in two. Some encode invariants of the repository: a
// missing token leaf breaks any theme, old or new. Others encode prescriptions of
// THIS programme, which its method states plainly are "a prescription of this
// programme, not a description of the repository" — 15 pre-existing packages carry
// no MAPPING.md at all, and the whole tree adopted the reference geometry long
// before the labelling rule existed. Enforcing those retroactively would produce
// some 300 findings on packages never held to them, and a guard that cries wolf
// 300 times is a guard someone disables.
//
// So the prescriptive guards read their scope from the method target list itself,
// which makes them self-maintaining: a theme enters scope when the method claims
// it, not when someone remembers to edit this file.
function programmeThemes() {
  const method = readFileSync(
    new URL("../.ds-scrap/METHOD-fr-top50.md", import.meta.url),
    "utf8"
  );
  const ids = [...method.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1]);
  return new Set([...ids, "latex"].map((id) => `theme-${id}`));
}

const read = (...parts) => readFileSync(join(packagesDir, ...parts), "utf8");
const entryOf = (dir) => read(dir, "src/index.ts");
const mappingOf = (dir) =>
  existsSync(join(packagesDir, dir, "MAPPING.md")) ? read(dir, "MAPPING.md") : "";
const testOf = (dir) =>
  existsSync(join(packagesDir, dir, "src/index.test.ts")) ? read(dir, "src/index.test.ts") : "";
const manifestOf = (dir) => JSON.parse(read(dir, "package.json"));

// ── A brace scanner, not a regex ────────────────────────────────────────────
// Nested token trees cannot be read reliably with a regex, and the reviews were
// spending real effort comparing keys by hand. This walks the source of one
// object literal and returns its dotted leaf paths, skipping comments and strings
// so a brace inside either cannot desynchronise the depth.
function leafPaths(source, rootName) {
  const start = source.indexOf(`const ${rootName} = {`);
  if (start === -1) return null;
  let i = source.indexOf("{", start);
  const stack = [];
  const paths = new Set();
  let pendingKey = null;

  while (i < source.length) {
    const ch = source[i];

    if (ch === "/" && source[i + 1] === "/") {
      i = source.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      i = source.indexOf("*/", i) + 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i += 1;
      while (i < source.length && source[i] !== quote) i += source[i] === "\\" ? 2 : 1;
      i += 1;
      continue;
    }
    if (ch === "{") {
      if (pendingKey !== null) stack.push(pendingKey);
      pendingKey = null;
      i += 1;
      continue;
    }
    if (ch === "}") {
      if (stack.length === 0) break;
      stack.pop();
      i += 1;
      continue;
    }

    const key = /^([A-Za-z_$][\w$]*|\d+)\s*:/.exec(source.slice(i));
    if (key) {
      const name = key[1];
      i += key[0].length;
      // Look ahead past whitespace and comments for the value's first character.
      let j = i;
      for (;;) {
        while (j < source.length && /\s/.test(source[j])) j += 1;
        if (source[j] === "/" && source[j + 1] === "/") {
          j = source.indexOf("\n", j);
          continue;
        }
        if (source[j] === "/" && source[j + 1] === "*") {
          j = source.indexOf("*/", j) + 2;
          continue;
        }
        break;
      }
      if (source[j] === "{") {
        pendingKey = name;
      } else {
        paths.add([...stack, name].join("."));
      }
      continue;
    }
    i += 1;
  }
  return paths;
}

function baseLeafPaths(file, rootName) {
  const source = readFileSync(
    new URL(`../packages/tokens/src/${file}`, import.meta.url),
    "utf8"
  );
  return leafPaths(source, rootName);
}

// ── WCAG 2.x relative luminance and contrast ratio ──────────────────────────
function luminance(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = Number.parseInt(full, 16);
  const channel = (shift) => {
    const s = ((value >> shift) & 255) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function contrast(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Reads one dotted path out of a source's object literal, when the value is a
// plain hex string. Returns null when it is a reference or a computed value.
// Reads the RAW value text at a dotted path, without interpreting it.
function rawAt(source, rootName, path) {
  const segments = path.split(".");
  const leaf = segments[segments.length - 1];
  const group = segments.length > 1 ? segments[segments.length - 2] : null;
  const body = source.slice(source.indexOf(`const ${rootName} = {`));
  const scope = group
    ? new RegExp(`\\b${group}\\s*:\\s*\\{([\\s\\S]*?)\\n\\s{2,4}\\}`, "m").exec(body)?.[1]
    : body;
  if (!scope) return null;
  return new RegExp(`\\b${leaf}\\s*:\\s*([^,\\n]+)`).exec(scope)?.[1].trim() ?? null;
}

// Not one theme of the 130 writes `semantic.text.link` as a literal hex: every one
// of them points at its own raw palette (`legrandColor.brand.primary`). A guard
// that only understood literals was green because it evaluated nothing — the
// vacuous-guard failure this file warns about, committed by this file. So palette
// references are resolved: each top-level `const <name> = {…}` in the theme is
// scanned once, and a dotted reference is looked up in it.
function paletteIndex(source) {
  const index = new Map();
  for (const match of source.matchAll(/^const (\w+) = \{/gm)) {
    const name = match[1];
    if (name === "foundation" || name === "semantic") continue;
    const values = leafValues(source, name);
    if (values) index.set(name, values);
  }
  return index;
}

function leafValues(source, rootName) {
  const paths = leafPaths(source, rootName);
  if (paths === null) return null;
  const values = new Map();
  for (const path of paths) {
    const raw = rawAt(source, rootName, path);
    if (raw !== null) values.set(path, raw);
  }
  return values;
}

function hexOf(source, rootName, path, palettes) {
  let raw = rawAt(source, rootName, path);
  if (raw === null) return null;
  for (let hop = 0; hop < 4 && raw !== null; hop += 1) {
    const literal = /^"(#[0-9a-fA-F]{3,8})"/.exec(raw);
    if (literal) return literal[1];
    const reference = /^(\w+)\.([\w.[\]"']+)/.exec(raw);
    if (!reference) return null;
    const palette = palettes.get(reference[1]);
    if (!palette) return null;
    const key = reference[2].replace(/\[["']?([^\]"']+)["']?\]/g, ".$1");
    raw = palette.get(key) ?? null;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

test("no theme is missing a foundation or semantic leaf the base declares", () => {
  const baseFoundation = baseLeafPaths("foundation.ts", "foundation");
  const baseSemantic = baseLeafPaths("semantic.ts", "semantic");
  assert.ok(baseFoundation && baseFoundation.size > 50, "base foundation leaves not read");
  assert.ok(baseSemantic && baseSemantic.size > 20, "base semantic leaves not read");

  const offenders = [];
  for (const dir of themeDirs()) {
    const source = entryOf(dir);
    for (const [root, expected] of [
      ["foundation", baseFoundation],
      ["semantic", baseSemantic]
    ]) {
      const actual = leafPaths(source, root);
      if (actual === null) {
        offenders.push(`${dir}: no \`const ${root} = {\` found`);
        continue;
      }
      const missing = [...expected].filter((path) => !actual.has(path));
      if (missing.length > 0) offenders.push(`${dir}: ${root} misses ${missing.join(", ")}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "Neither `tsc --noEmit` nor a theme's three tests detect a missing token key — " +
      "`TenantTheme.tokens` is a plain index signature — so a forgotten leaf passes " +
      "every gate and lands as an unset CSS variable. This comparison is the only " +
      `net for it:\n  ${offenders.join("\n  ")}`
  );
});

test("every colour a theme ships has a row in its MAPPING.md", () => {
  const scope = programmeThemes();
  const offenders = [];
  for (const dir of themeDirs()) {
    if (!scope.has(dir)) continue;
    const mapping = mappingOf(dir);
    if (mapping === "") continue;
    const shipped = new Set(
      [...entryOf(dir).matchAll(/"(#[0-9a-fA-F]{6})"|"(rgba?\([^"]*\))"/g)].map(
        (match) => (match[1] ?? match[2]).toLowerCase()
      )
    );
    const documented = new Set(
      [...mapping.matchAll(/#[0-9a-fA-F]{6}|rgba?\([^)]*\)/g)].map((match) =>
        match[0].toLowerCase()
      )
    );
    const undocumented = [...shipped].filter((value) => !documented.has(value));
    if (undocumented.length > 0) offenders.push(`${dir}: ${undocumented.join(", ")}`);
  }

  assert.deepEqual(
    offenders,
    [],
    "A value with no mapping row has no provenance, and `surface.overlay` is the " +
      "one that escapes — all four packages of the first reviewed lot shipped it " +
      `undocumented:\n  ${offenders.join("\n  ")}`
  );
});

test("every font family a theme declares is pinned by its own test", () => {
  const scope = programmeThemes();
  const offenders = [];
  for (const dir of themeDirs()) {
    if (!scope.has(dir)) continue;
    const lock = testOf(dir);
    if (lock === "") continue;
    const families = new Set();
    for (const match of entryOf(dir).matchAll(
      /\b(?:sans|display|mono|family)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g
    )) {
      const stack = match[2] ?? match[3] ?? "";
      const first = stack.split(",")[0].replace(/['"]/g, "").trim();
      if (first !== "" && !SYSTEM_FACES.has(first)) {
        families.add(first);
      }
    }
    // Only what the test ASSERTS counts. Searching the whole file would let a
    // family named in a comment pass for pinned — which it did, and which mutation
    // testing caught: removing the assertion left the word in an explanatory
    // comment and the guard stayed green.
    const asserted = [...lock.matchAll(/toContain\(\s*["'`]([^"'`]+)["'`]\s*\)/g)].map(
      (match) => match[1]
    );
    const unpinned = [...families].filter(
      (family) => !asserted.some((value) => value.includes(family))
    );
    if (unpinned.length > 0) offenders.push(`${dir}: ${unpinned.join(", ")}`);
  }

  assert.deepEqual(
    offenders,
    [],
    "The hardcoded hexes and font names in a theme's test are its regression lock. " +
      "A family present in the output but absent from the test can be swapped " +
      `silently, which two reviewed packages did:\n  ${offenders.join("\n  ")}`
  );
});

test("a theme that borrows the reference package's geometry says so", () => {
  const scope = programmeThemes();
  const referenceDir = "theme-schneider-electric";
  if (!existsSync(join(packagesDir, referenceDir, "src/index.ts"))) return;
  const reference = entryOf(referenceDir);
  const base = readFileSync(
    new URL("../packages/tokens/src/foundation.ts", import.meta.url),
    "utf8"
  );
  const watched = ["easing", "disabledOpacity"];

  const valueOf = (source, key) =>
    new RegExp(`\\b${key}\\s*:\\s*"([^"]+)"`).exec(source)?.[1] ?? null;

  const offenders = [];
  for (const dir of themeDirs()) {
    if (dir === referenceDir) continue;
    const source = entryOf(dir);
    if (!scope.has(dir)) continue;
    const mapping = mappingOf(dir);
    if (mapping === "") continue;
    const borrowed = watched.filter((key) => {
      const mine = valueOf(source, key);
      return mine !== null && mine === valueOf(reference, key) && mine !== valueOf(base, key);
    });
    if (borrowed.length === 0) continue;
    // The label is prose, so it wraps — in an 80-column comment it lands across
    // two lines with a `//` in the middle. Collapse whitespace and comment markers
    // before matching, or the guard fails on a theme that carries it correctly.
    const flatten = (text) => text.replace(/\n\s*(?:\/\/|\*)?\s*/g, " ");
    const label = /aligned with the reference theme package/i;
    const declares = label.test(flatten(mapping)) || label.test(flatten(source));
    if (!declares) offenders.push(`${dir}: borrows ${borrowed.join(", ")} without the label`);
  }

  assert.deepEqual(
    offenders,
    [],
    "Only `controlHeight` and `iconSize` match the Sentropic base; the rest of the " +
      "anatomy in both reference packages is another brand's measured geometry. " +
      "Copying it is allowed, calling it the base is a false provenance statement, " +
      `and three packages made it:\n  ${offenders.join("\n  ")}`
  );
});

test("interactive colours clear their WCAG floor on the theme's own surface", () => {
  // Measured on the whole tree at the time this guard was written: 147 violations
  // across 37 of the pre-existing themes, and ZERO across the nine built under this
  // programme's method — so the accessibility floor demonstrably works, and the debt
  // predates it. Enforcing it retroactively on 37 brands is an owner's decision
  // about existing packages, not a guard's; the finding is recorded in the pull
  // request instead. The scope is therefore the programme's themes, as for the other
  // prescriptive guards.
  const scope = programmeThemes();
  const offenders = [];
  let evaluated = 0;
  for (const dir of themeDirs()) {
    if (!scope.has(dir)) continue;
    const source = entryOf(dir);
    const palettes = paletteIndex(source);
    const surface = hexOf(source, "semantic", "surface.default", palettes);
    if (surface === null) continue;
    for (const [path, floor] of [
      ["text.link", 4.5],
      ["border.interactive", 3],
      ["focus.color", 3]
    ]) {
      const root = path.startsWith("focus.") ? "foundation" : "semantic";
      const value = hexOf(source, root, path, palettes);
      if (value === null) continue;
      evaluated += 1;
      const ratio = contrast(value, surface);
      if (ratio + 1e-9 < floor) {
        offenders.push(`${dir}: ${path} ${value} on ${surface} = ${ratio.toFixed(2)}:1 < ${floor}`);
      }
    }
  }

  // Without this the guard can go green by evaluating nothing, which is how it
  // first shipped: not one of the 130 themes writes these roles as a literal hex,
  // every one points at its own palette. The vacuous-guard failure this file warns
  // about, committed by this file.
  // Relative to the scope actually on disk, not a magic number: a lot lands four
  // themes at a time, so an absolute floor would either be vacuous today or fail
  // the day a lot merges. Each theme should yield three pairs; two is the safe floor.
  const present = [...scope].filter((dir) => existsSync(join(packagesDir, dir, "src/index.ts")));
  assert.ok(
    evaluated >= present.length * 2,
    `the contrast guard evaluated ${evaluated} pairs for ${present.length} in-scope ` +
      `themes; palette resolution has broken`
  );

  assert.deepEqual(
    offenders,
    [],
    "4.5:1 for running text including `text.link`, 3:1 for non-text roles including " +
      "the focus indicator (WCAG 1.4.11). Reviews recalculated these by hand on " +
      `every theme:\n  ${offenders.join("\n  ")}`
  );
});

test("brand theme packages stay private and unlicensed, on the exact pins", () => {
  const publicIds = new Set(["theme-canada", "theme-dsfr", "theme-quebec", "theme-latex"]);
  const offenders = [];
  let referenceTsconfig = null;

  for (const dir of themeDirs()) {
    const manifest = manifestOf(dir);
    const tsconfig = read(dir, "tsconfig.json");
    referenceTsconfig ??= tsconfig;
    if (tsconfig !== referenceTsconfig) offenders.push(`${dir}: tsconfig.json diverges`);

    if (publicIds.has(dir)) {
      if (manifest.private === true) offenders.push(`${dir}: publishable theme marked private`);
      if (!manifest.license) offenders.push(`${dir}: publishable theme declares no license`);
      continue;
    }
    if (manifest.private !== true) offenders.push(`${dir}: brand clone is not private`);
    if (manifest.license) offenders.push(`${dir}: brand clone declares a license`);
    if (existsSync(join(packagesDir, dir, "LICENSE"))) offenders.push(`${dir}: has a LICENSE file`);

    const themes = manifest.dependencies?.["@sentropic/design-system-themes"];
    const tokens = manifest.dependencies?.["@sentropic/design-system-tokens"];
    if (themes !== tokens) offenders.push(`${dir}: themes ${themes} vs tokens ${tokens}`);
    if (!/^\d+\.\d+\.\d+$/.test(themes ?? "")) offenders.push(`${dir}: pin not exact (${themes})`);
  }

  assert.deepEqual(
    offenders,
    [],
    "A brand clone carries no licence because the tree holds measured clones of " +
      "brands that are not ours to relicense, and the licensing gate only inspects " +
      `workspaces that are not private:\n  ${offenders.join("\n  ")}`
  );
});

// A guard that silently inspects nothing reports success while what it protects
// rots. This asserts the fixtures, so a drift in discovery or in the scanner
// fails here rather than turning every guard above into a no-op.
test("the guards actually see the themes and the base", () => {
  const dirs = themeDirs();
  assert.ok(dirs.length > 100, `expected the theme packages to be discovered, found ${dirs.length}`);

  const base = baseLeafPaths("foundation.ts", "foundation");
  assert.ok(base.has("color.slate.0"), "the brace scanner no longer reads nested leaves");
  assert.ok(base.has("focus.strategy"), "the brace scanner no longer reads anatomy leaves");

  const sample = entryOf(dirs[0]);
  assert.ok(
    leafPaths(sample, "semantic")?.has("surface.default"),
    "the brace scanner no longer reads a theme's semantic leaves"
  );
  assert.equal(contrast("#1e7e34", "#ffffff").toFixed(2), "5.14", "contrast math has drifted");

  // Without this, a drift in the method table would empty the prescriptive guards
  // and they would report success while inspecting nothing.
  const scope = programmeThemes();
  assert.ok(
    scope.size > 20,
    `the method target list no longer parses: ${scope.size} themes in programme scope`
  );
  assert.ok(scope.has("theme-latex"), "the LaTeX theme fell out of programme scope");
});
