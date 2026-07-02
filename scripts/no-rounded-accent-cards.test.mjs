import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const roots = ["packages", "apps/docs/src"];
const extensions = new Set([".css", ".svelte", ".ts", ".tsx", ".js", ".jsx"]);
const skipParts = new Set(["dist", "node_modules", ".svelte-kit"]);

const cardLikeSelector = /card|highlight|callout|panel|tile|kpi|metric|stat|notice|guideline|feature|promo|surface|summary|eventFeedPanel__item/i;
const sideOrBottomBorder = /border-(left|right|bottom|inline-start|inline-end|block-end)(?:-width)?\s*:\s*([^;]+)/gi;
const radiusDecl = /border-radius\s*:\s*([^;]+)|border-(?:top|bottom)-(?:left|right)-radius\s*:\s*([^;]+)/gi;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const rel = relative(process.cwd(), path);
    if (rel.split(/[\\/]/).some((part) => skipParts.has(part))) continue;
    const st = statSync(path);
    if (st.isDirectory()) yield* walk(path);
    else if (extensions.has(path.slice(path.lastIndexOf(".")))) yield path;
  }
}

function isZeroRadius(value) {
  return /^\s*0(?:\s|$)/.test(value.trim());
}

function isThinOrTransparent(value) {
  const v = value.trim().toLowerCase();
  if (v.includes("transparent")) return true;
  if (v.includes("var(") && !/(2px|3px|4px|5px|6px|0\.125rem|0\.1875rem|0\.25rem)/.test(v)) return true;
  if (/^1px\b|^0\.0625rem\b/.test(v)) return true;
  return false;
}

function violationsIn(path) {
  const text = readFileSync(path, "utf8");
  const out = [];
  const blockRe = /([^{}]+)\{([^{}]*)\}/gs;
  for (const match of text.matchAll(blockRe)) {
    const selector = match[1].trim();
    const body = match[2];
    if (!cardLikeSelector.test(selector)) continue;

    const borders = [...body.matchAll(sideOrBottomBorder)].map((m) => m[2]);
    if (!borders.some((value) => !isThinOrTransparent(value))) continue;

    const radii = [...body.matchAll(radiusDecl)].map((m) => m[1] ?? m[2]);
    if (!radii.some((value) => !isZeroRadius(value))) continue;

    out.push({
      path: relative(process.cwd(), path),
      line: text.slice(0, match.index).split("\n").length,
      selector: selector.replace(/\s+/g, " "),
      borders,
      radii,
    });
  }
  return out;
}

test("no rounded card/exergue with a thick one-sided accent border", () => {
  const violations = roots.flatMap((root) => [...walk(root)].flatMap(violationsIn));
  assert.deepEqual(
    violations,
    [],
    "A card/highlight/panel with a thick left/right/bottom accent border must have square corners (border-radius: 0).",
  );
});
