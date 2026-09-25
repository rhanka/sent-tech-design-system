/**
 * Source-level parity gate for the direction and separator glyphs a chart puts in
 * front of a reader.
 *
 * WHY THIS EXISTS, AND WHY THE RENDER HARNESS CANNOT REPLACE IT.
 * `npm run parity:dataviz-angular` compares rendered markup, so it is blind to
 * two things at once, and a divergence that hides in both is invisible to it:
 *
 *  1. a tooltip that Angular always renders but leaves EMPTY without a hover.
 *     There is no text node in the static render, so the content signature has
 *     nothing to compare. `RenkoChart`'s tooltip kept `UP`/`DOWN` and `->` for a
 *     full review round after its data list had been fixed, and the harness
 *     reported that adapter as clean on content signature.
 *  2. a component outside the adapters the harness mounts. `PointAndFigureChart`
 *     was not one of them, and its data list read `X 104.8 -> 105` against
 *     React's `X 104.8 → 105`.
 *
 * This gate reads the two sources instead of the two renders, so it sees every
 * component that has a counterpart, hovered or not.
 *
 * HOW IT DISCRIMINATES. It compares PRESENCE of each token per component, both
 * ways, so a token that both frameworks use is not a finding: `SankeyChart` uses
 * ASCII `->` on both sides and is silent here. Four normalisations run first,
 * each of which was added because it produced a false finding, not defensively:
 *
 *  - JS and TS comments are stripped. Prose uses arrows and dashes far more than
 *    rendered strings do; comparing raw files reported 58 files of noise.
 *  - HTML comments INSIDE a template literal are stripped too. Angular removes
 *    them at compile time, so they reach no reader; `PanelSection`'s
 *    `<!-- Mounted once, always — … -->` was otherwise reported as an
 *    angular-only em dash.
 *  - `\xNN` / `\uNNNN` escapes and the HTML entities for these glyphs are
 *    decoded. `WaffleChart` writes `\xB7` and `Notification` writes `&#xD7;`
 *    where React writes the character itself: same render, and both were
 *    reported as react-only before decoding.
 *  - `console.*(…)` arguments are dropped. A console message is developer-facing,
 *    which is outside this gate's remit; `NavActionStack`'s French warning about
 *    several primary actions was otherwise reported as a react-only em dash.
 *    (That warning genuinely has no Angular counterpart — a behavioural gap
 *    recorded in packages/dataviz-angular/PATTERN.md, not a glyph one.)
 *
 * THE REACT SIDE IS NOT ALWAYS IN THE FILE NAMED AFTER THE COMPONENT. 80 of the
 * 223 pairs have a React file that only re-exports from `./catalog.js`; comparing
 * against that shim compares nothing at all, and `ForceGraph` — a chart — is one
 * of them. A shim is resolved to the component's implementation inside
 * `catalog.tsx`, and a shim that cannot be resolved fails the gate rather than
 * passing silently.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NG = join(repoRoot, "packages/components-angular/src");
const RE = join(repoRoot, "packages/components-react/src");

/** Strip comments without eating `//` inside a string or template literal. */
export function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

/** Drop `console.<method>(…)` with its arguments, parens and quotes respected. */
export function dropConsoleArgs(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const match = /^console\.\w+\(/.exec(src.slice(i));
    if (!match) {
      out += src[i];
      i += 1;
      continue;
    }
    i += match[0].length;
    let depth = 1;
    let quote = null;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (quote) {
        if (c === "\\") {
          i += 2;
          continue;
        }
        if (c === quote) quote = null;
        i += 1;
        continue;
      }
      if (c === "'" || c === '"' || c === "`") {
        quote = c;
        i += 1;
        continue;
      }
      if (c === "(") depth += 1;
      if (c === ")") depth -= 1;
      i += 1;
    }
  }
  return out;
}

const ENTITIES = {
  "&#xD7;": "×", "&#215;": "×", "&times;": "×",
  "&#xB7;": "·", "&#183;": "·", "&middot;": "·",
  "&#x2014;": "—", "&#8212;": "—", "&mdash;": "—",
  "&#xB0;": "°", "&#176;": "°", "&deg;": "°",
  "&#x2192;": "→", "&#8594;": "→", "&rarr;": "→",
};

/** Decode the escapes and entities that spell these glyphs indirectly. */
export function decodeGlyphs(src) {
  let out = src.replace(/\\x([0-9a-fA-F]{2})|\\u\{?([0-9a-fA-F]{4,6})\}?/g, (_, hex2, hex4) =>
    String.fromCodePoint(parseInt(hex2 ?? hex4, 16)),
  );
  for (const [entity, char] of Object.entries(ENTITIES)) out = out.split(entity).join(char);
  return out;
}

export function normalise(src) {
  return decodeGlyphs(dropConsoleArgs(stripComments(src).replace(/<!--[\s\S]*?-->/g, "")));
}

/** True when the React file is nothing but `export { … } from "…"` statements. */
export function isReExportShim(src) {
  return src.replace(/export\s+(?:type\s+)?\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, "").trim() === "";
}

/** The implementation of `base` inside catalog.tsx, or null when absent. */
export function sliceFromCatalog(catalog, base) {
  const start = catalog.search(new RegExp(`^(?:export )?(?:const|function|class) ${base}\\b`, "m"));
  if (start < 0) return null;
  const rest = catalog.slice(start + 1);
  const next = rest.search(/^(?:export )?(?:const|function|class) [A-Z]\w*\b/m);
  return next < 0 ? catalog.slice(start) : catalog.slice(start, start + 1 + next);
}

/**
 * Substring tokens compare PRESENCE of a glyph. A regex token exists for the
 * cases presence cannot see: a component that spells the glyph correctly
 * SOMEWHERE and wrongly elsewhere. Reintroducing `deg` in VectorFieldChart's data
 * list left the substring set unchanged, because its tooltip still had the
 * degree sign — the gate passed on a real regression. The two regexes below
 * catch the ASCII stand-in itself, scoped so that identifiers and CSS do not
 * match: a unit right after an interpolation or a digit (`${x}deg`, `90deg`),
 * and a hyphen used as a separator BETWEEN two rendered values
 * (`${x} - ${y}`). Measured across all 223 pairs, both are silent on the
 * aligned tree: `deg` as a bare word is not, since `(deg: number) => …` in
 * GaugeChart and SolidGaugeChart would match.
 *
 * WHAT THE SEPARATOR-DASH CLASS HAD TO GROW. Its first form only accepted an
 * interpolation or an alphanumeric after the hyphen, so it did not see
 * `VectorFieldChart`'s data list, which reads `y ${datum.y} · |v| ${…}`: turning
 * that `·` into `-` puts a `|` after the hyphen, outside the class. Presence of
 * `·` did not change either, because the same component's tooltip still spells
 * it, so the whole gate passed 6/6 on that regression. `|` is therefore part of
 * the class. The addition is measured, not assumed: across the 223 pairs, both
 * sides each, the widened form matches the same four places as the narrow one
 * (`DatePicker` and `Transcription`, symmetric on both frameworks, hence silent)
 * and one more only when the regression is present. Widening further to any
 * non-space character measured identically today, and was not taken: a wider
 * class buys no caught defect and costs a larger false-positive surface, and a
 * false finding sends a reader to correct code.
 */
const DEG_STANDIN = /[}\d]\s?deg\b/;
const SEPARATOR_DASH = /\}\s-\s(\$\{|[A-Za-z0-9]|\|)/;
const TOKENS = [
  " -> ", "→", "▲", "▼", "↑", "↓", '"UP"', '"DOWN"',
  "°", "·", "—", "×",
  DEG_STANDIN,
  SEPARATOR_DASH,
];
const has = (src, token) => (typeof token === "string" ? src.includes(token) : token.test(src));
const tokenLabel = (token) => (token === " -> " ? "ASCII ->" : String(token));

function pairs() {
  const catalog = readFileSync(join(RE, "catalog.tsx"), "utf8");
  const out = [];
  const unresolved = [];
  for (const file of readdirSync(NG)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts") || file === "index.ts") continue;
    const base = file.replace(/\.ts$/, "");
    const react = [join(RE, `${base}.tsx`), join(RE, `${base}.ts`)].find((p) => existsSync(p));
    if (!react) continue;
    const raw = readFileSync(react, "utf8");
    if (!isReExportShim(raw)) {
      out.push({ base, angular: join(NG, file), reactSource: raw, via: "file" });
      continue;
    }
    const sliced = sliceFromCatalog(catalog, base);
    if (sliced === null) {
      unresolved.push(base);
      continue;
    }
    out.push({ base, angular: join(NG, file), reactSource: sliced, via: "catalog" });
  }
  return { out, unresolved };
}

test("every React counterpart is a real implementation, not a re-export shim", () => {
  const { out, unresolved } = pairs();
  assert.deepEqual(
    unresolved,
    [],
    "these React files only re-export from catalog.js and their implementation was not found there, " +
      "so the comparison below would compare nothing: " + unresolved.join(", "),
  );
  const viaCatalog = out.filter((pair) => pair.via === "catalog").length;
  assert.ok(viaCatalog > 50, `expected the catalog shims to be resolved, found ${viaCatalog}`);
});

test("every Angular component uses the same glyphs as its React counterpart", () => {
  const { out: compared } = pairs();
  assert.ok(compared.length > 100, `expected the whole component set, found ${compared.length}`);

  const findings = [];
  for (const { base, angular, reactSource } of compared) {
    const a = normalise(readFileSync(angular, "utf8"));
    const r = normalise(reactSource);
    for (const token of TOKENS) {
      if (has(a, token) === has(r, token)) continue;
      findings.push(`${base}: ${tokenLabel(token)} is ${has(a, token) ? "angular" : "react"}-only`);
    }
  }

  assert.deepEqual(
    findings,
    [],
    `glyphs diverge between the two frameworks:\n  ${findings.join("\n  ")}\n` +
      "Align the Angular source on the React spelling; both the data list AND the tooltip.",
  );
});

test("the comparison discriminates: a token both frameworks use is not a finding", () => {
  // SankeyChart writes `source -> target` in both, which must stay silent.
  const a = stripComments(readFileSync(join(NG, "SankeyChart.ts"), "utf8"));
  const r = stripComments(readFileSync(join(RE, "SankeyChart.tsx"), "utf8"));
  assert.ok(a.includes(" -> "), "the Angular SankeyChart should still use ASCII ->");
  assert.ok(r.includes(" -> "), "the React SankeyChart should still use ASCII ->");
});

test("stripComments leaves string contents alone", () => {
  assert.equal(stripComments('const a = "http://x"; // gone'), 'const a = "http://x"; ');
  assert.equal(stripComments("const a = `a -> b`; /* gone */"), "const a = `a -> b`; ");
});

test("each normalisation is load-bearing: removing it re-creates a false finding", () => {
  // HTML comment inside a template literal (PanelSection).
  assert.ok(normalise("const t = `<!-- always — here -->`;").includes("—") === false);
  // \xNN escape (WaffleChart) and HTML entity (Notification).
  assert.ok(normalise('const t = "a \\xB7 b";').includes("·"));
  assert.ok(normalise('const t = "&#xD7;";').includes("×"));
  // console argument (NavActionStack).
  assert.equal(normalise('console.warn(`a — b`); const t = "x";').includes("—"), false);
  // and it does not eat the statement that follows the call.
  assert.ok(normalise('console.warn(`a — b`); const t = "x";').includes('const t = "x"'));
});

test("the ASCII stand-in regexes fire on the shapes they claim, and stay off the rest", () => {
  // The separator dash, in each shape a data list or tooltip actually writes.
  assert.ok(SEPARATOR_DASH.test("`${a} - ${b}`"), "between two interpolations");
  assert.ok(SEPARATOR_DASH.test("`X ${p.from} - 105`"), "interpolation then a literal value");
  assert.ok(SEPARATOR_DASH.test("`y ${d.y} - label`"), "interpolation then a word");
  // VectorFieldChart:262. Missed until `|` joined the class, and missed silently:
  // the component's tooltip still spelled `·`, so presence of `·` was unchanged.
  assert.ok(SEPARATOR_DASH.test("`x ${d.x}, y ${d.y} - |v| ${fmt(d.length)}`"), "interpolation then |v|");
  // And off the shapes that are not a separator between two rendered values.
  assert.equal(SEPARATOR_DASH.test("const gap = a.length - b.length;"), false, "plain subtraction");
  assert.equal(SEPARATOR_DASH.test("`--st-gap: calc(100% - 2px)`"), false, "CSS calc on a literal");
  assert.equal(SEPARATOR_DASH.test("`${x}-${y}`"), false, "a hyphen with no spaces is a joiner, not a separator");
  assert.equal(SEPARATOR_DASH.test("`${x} -${y}`"), false, "a unary minus is not a separator");
  // Known and unchanged by the `|` addition: arithmetic whose left operand ends an
  // interpolation does match. It is silent in practice because both frameworks
  // spell the same arithmetic, so presence compares equal on the pair.
  assert.ok(SEPARATOR_DASH.test("`calc(${w} - 2px)`"), "recorded limit, not a claim of precision");

  // The degree stand-in stays scoped to a rendered unit, off the identifier.
  assert.ok(DEG_STANDIN.test("`${d.direction}deg`"), "unit right after an interpolation");
  assert.ok(DEG_STANDIN.test("`rotate(90deg)`"), "unit right after a digit");
  assert.equal(DEG_STANDIN.test("(deg: number) => deg * 2"), false, "GaugeChart's parameter name");
});

test("a re-export shim is told apart from a real implementation", () => {
  assert.equal(isReExportShim('export { ForceGraph } from "./catalog.js";\nexport type { P } from "./catalog.js";\n'), true);
  assert.equal(isReExportShim('import { AppHeader } from "./catalog.js";\nexport function AppChrome() { return null; }\n'), false);
});
