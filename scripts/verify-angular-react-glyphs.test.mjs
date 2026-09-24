/**
 * Source-level parity gate for the direction and arrow glyphs a chart puts in
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
 *  2. a component outside the adapters the harness mounts. `PARITY.md` covers 30
 *     adapters; `PointAndFigureChart` is not one of them, and its data list read
 *     `X 104.8 -> 105` against React's `X 104.8 → 105`.
 *
 * This gate reads the two sources instead of the two renders, so it sees every
 * component that has a counterpart, hovered or not.
 *
 * HOW IT DISCRIMINATES. It compares PRESENCE of each token per component, both
 * ways, so a token that both frameworks use is not a finding: `SankeyChart` uses
 * ASCII `->` on both sides and is silent here. Comments are stripped first —
 * prose uses arrows and dashes far more than rendered strings do, and comparing
 * raw files reports 58 files of noise instead of the real divergences.
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

const TOKENS = [" -> ", "→", "▲", "▼", "↑", "↓", '"UP"', '"DOWN"'];
const tokenLabel = (token) => (token === " -> " ? "ASCII ->" : token);

function pairs() {
  const out = [];
  for (const file of readdirSync(NG)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    const base = file.replace(/\.ts$/, "");
    const react = [join(RE, `${base}.tsx`), join(RE, `${base}.ts`)].find((p) => existsSync(p));
    if (react) out.push({ base, angular: join(NG, file), react });
  }
  return out;
}

test("every Angular component uses the same direction glyphs as its React counterpart", () => {
  const compared = pairs();
  assert.ok(compared.length > 100, `expected the whole component set, found ${compared.length}`);

  const findings = [];
  for (const { base, angular, react } of compared) {
    const a = stripComments(readFileSync(angular, "utf8"));
    const r = stripComments(readFileSync(react, "utf8"));
    for (const token of TOKENS) {
      if (a.includes(token) === r.includes(token)) continue;
      findings.push(`${base}: ${tokenLabel(token)} is ${a.includes(token) ? "angular" : "react"}-only`);
    }
  }

  assert.deepEqual(
    findings,
    [],
    `direction glyphs diverge between the two frameworks:\n  ${findings.join("\n  ")}\n` +
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
