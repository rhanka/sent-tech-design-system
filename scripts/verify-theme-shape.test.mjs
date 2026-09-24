import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// The theme programme's adversarial reviews found defect classes that every
// existing gate lets through, among them an id that diverges from its folder and
// a token group silently absent. `assertTenantTheme` only checks that id, label,
// mode and tokens EXIST; TokenTree is permissive about what is inside. These
// guards close the two shape classes that can be asserted from the tree itself.
const packagesDir = new URL("../packages/", import.meta.url).pathname;

function themeDirs() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("theme-"))
    .map((e) => e.name)
    .filter((name) => existsSync(join(packagesDir, name, "src/index.ts")));
}

const entryOf = (name) => readFileSync(join(packagesDir, name, "src/index.ts"), "utf8");
const manifestOf = (name) => JSON.parse(readFileSync(join(packagesDir, name, "package.json"), "utf8"));

test("every theme declares the id its folder name promises", () => {
  const offenders = [];
  for (const dir of themeDirs()) {
    const expected = dir.replace(/^theme-/, "");
    const match = /\bid:\s*"([^"]+)"/.exec(entryOf(dir));
    if (!match) offenders.push(`${dir}: no id field`);
    else if (match[1] !== expected) offenders.push(`${dir}: id="${match[1]}", expected "${expected}"`);
  }
  assert.deepEqual(
    offenders,
    [],
    `a theme id is how the docs whitelist, the URL and storage address it, so it must match the folder:\n  ${offenders.join("\n  ")}`,
  );
});

test("every theme package is named after its folder", () => {
  const offenders = [];
  for (const dir of themeDirs()) {
    const expected = `@sentropic/design-system-${dir}`;
    const actual = manifestOf(dir).name;
    if (actual !== expected) offenders.push(`${dir}: ${actual}, expected ${expected}`);
  }
  assert.deepEqual(offenders, [], `package names must follow the folder:\n  ${offenders.join("\n  ")}`);
});

test("no theme silently drops a token group the others all declare", () => {
  const dirs = themeDirs();
  const groupsOf = (dir) =>
    new Set([...entryOf(dir).matchAll(/^\s{4}(\w+):\s*\{/gm)].map((m) => m[1]));
  const perTheme = new Map(dirs.map((dir) => [dir, groupsOf(dir)]));
  const counts = new Map();
  for (const groups of perTheme.values()) {
    for (const group of groups) counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  // A MAJORITY threshold, not universality: requiring only the groups that every
  // theme declares would forgive the very defect this guard exists for, since a
  // group dropped by one theme stops being universal and disappears from the
  // reference set. Measured distribution today: eleven groups at 130/130 and
  // `button` at 1/130 (theme-groq's deliberate override), so the two populations
  // are far apart and any majority threshold separates them.
  const required = [...counts.entries()]
    .filter(([, n]) => n > dirs.length / 2)
    .map(([k]) => k);
  assert.ok(required.length >= 8, `expected a shared group set, found ${required.length}`);
  const offenders = [];
  for (const [dir, groups] of perTheme) {
    const missing = required.filter((group) => !groups.has(group));
    if (missing.length) offenders.push(`${dir}: missing ${missing.join(", ")}`);
  }
  assert.deepEqual(offenders, [], `token groups every other theme declares:\n  ${offenders.join("\n  ")}`);
});

test("the guards actually see the themes", () => {
  assert.ok(themeDirs().length >= 100, `expected the theme packages, found ${themeDirs().length}`);
});
