import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const roots = ["packages", "apps/docs/src"];
const extensions = new Set([".css", ".svelte", ".ts", ".tsx", ".js", ".jsx"]);
const skipParts = new Set(["dist", "node_modules", ".svelte-kit"]);

const componentSelector = /\.(?:st-|docs-)/;
const sideOrBottomBorder = /border-(left|right|top|bottom|inline-start|inline-end|block-start|block-end)(?:-width)?\s*:\s*([^;]+)/gi;
const fullBorder = /(?:^|[;\s])border\s*:\s*([^;]+)/i;
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
  const v = value.trim().toLowerCase();
  if (/^0(?:\s|$)/.test(v)) return true;
  return /var\([^,]+,\s*0\s*\)/.test(v);
}

function isZeroOrTransparentBorder(value) {
  const v = value.trim().toLowerCase();
  if (v.includes("transparent")) return true;
  if (/^0(?:\s|;|$)|^0px\b|^0rem\b/.test(v)) return true;
  return false;
}

function classNames(selector) {
  return [...selector.matchAll(/\.([_a-zA-Z][_a-zA-Z0-9-]*)/g)].map((m) => m[1]);
}

function baseClass(name) {
  return name.includes("--") ? name.slice(0, name.indexOf("--")) : name;
}

function compoundClassNames(selector) {
  return selector
    .split(/\s*,\s*/)
    .flatMap((part) => part.trim().split(/\s+/).map(classNames));
}

function hasCompleteSideSet(matches) {
  const sides = new Set(matches.map((m) => m[1]));
  const physical = ["top", "right", "bottom", "left"].every((side) => sides.has(side));
  const logical = ["block-start", "inline-end", "block-end", "inline-start"].every((side) => sides.has(side));
  return physical || logical;
}

function sameElementRoundedClass(accentBlock, roundedBlock) {
  // Reject descendant element targets such as `.st-sidenav a`: the radius is on the link,
  // not on the `.st-sidenav` host that owns the structural separator.
  if (/\s[a-z][a-z0-9-]*(?:[\s:{.#[]|$)/i.test(roundedBlock.selector)) return false;
  const accentCompounds = compoundClassNames(accentBlock.selector);
  const roundedCompounds = compoundClassNames(roundedBlock.selector);
  return accentCompounds.some((accentClasses) =>
    roundedCompounds.some((roundedClasses) => {
      if (roundedClasses.length === 0 || accentClasses.length === 0) return false;
      // Every class used by the rounded rule must be present on the same selector compound.
      // This avoids false positives like `.card--bordered .card__header` inheriting `.card` radius
      // through an ancestor: the seam is on the header element, not on the rounded host.
      return roundedClasses.every((name) => accentClasses.includes(name));
    }),
  );
}

function violationsIn(path) {
  const text = readFileSync(path, "utf8");
  const out = [];
  const blocks = [];
  const blockRe = /([^{}]+)\{([^{}]*)\}/gs;

  for (const match of text.matchAll(blockRe)) {
    const selector = match[1].trim();
    const body = match[2];
    if (!componentSelector.test(selector)) continue;

    const sideBorderMatches = [...body.matchAll(sideOrBottomBorder)];
    const borders = sideBorderMatches.map((m) => m[2]);
    const nonZeroSideBorders = borders.filter((value) => !isZeroOrTransparentBorder(value));
    const hasFullBorder = fullBorder.test(body) && !isZeroOrTransparentBorder(body.match(fullBorder)?.[1] ?? "0");
    const hasCompleteNonZeroSideSet = hasCompleteSideSet(sideBorderMatches.filter((m) => !isZeroOrTransparentBorder(m[2])));
    const hasEffectiveOneSidedBorder = nonZeroSideBorders.length > 0 && !hasFullBorder && !hasCompleteNonZeroSideSet;
    const radii = [...body.matchAll(radiusDecl)].map((m) => m[1] ?? m[2]);
    const roundedRadii = radii.filter((value) => !isZeroRadius(value));
    const classes = classNames(selector);

    blocks.push({
      index: match.index,
      selector,
      body,
      classes,
      bases: classes.map(baseClass),
      borders,
      nonZeroSideBorders,
      hasFullBorder,
      hasCompleteNonZeroSideSet,
      radii,
      roundedRadii,
      hasEffectiveOneSidedBorder,
      hasRoundedRadius: roundedRadii.length > 0,
      hasZeroRadius: radii.some(isZeroRadius),
    });

    if (hasEffectiveOneSidedBorder && roundedRadii.length > 0) {
      out.push({
        path: relative(process.cwd(), path),
        line: text.slice(0, match.index).split("\n").length,
        selector: selector.replace(/\s+/g, " "),
        borders,
        radii,
      });
    }
  }

  for (const accentBlock of blocks.filter((block) => block.hasEffectiveOneSidedBorder && !block.hasZeroRadius)) {
    const inheritedRoundedBase = blocks.find(
      (block) =>
        block !== accentBlock &&
        block.hasRoundedRadius &&
        sameElementRoundedClass(accentBlock, block),
    );
    if (!inheritedRoundedBase) continue;
    if (inheritedRoundedBase.hasFullBorder) continue;
    out.push({
      path: relative(process.cwd(), path),
      line: text.slice(0, accentBlock.index).split("\n").length,
      selector: accentBlock.selector.replace(/\s+/g, " "),
      inheritedRadiusFrom: inheritedRoundedBase.selector.replace(/\s+/g, " "),
      borders: accentBlock.borders,
      radii: inheritedRoundedBase.radii,
    });
  }

  return out;
}

test("no rounded component/docs surface with a one-sided border seam", () => {
  const violations = roots.flatMap((root) => [...walk(root)].flatMap(violationsIn));
  assert.deepEqual(
    violations,
    [],
    "Any component/docs surface with a one-sided border seam must have square corners (border-radius: 0); 1px seams on rounded corners are forbidden.",
  );
});
