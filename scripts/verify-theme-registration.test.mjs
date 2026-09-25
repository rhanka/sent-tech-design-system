// Every theme workspace must be registered, or CI breaks where no local gate looks.
//
// This guard exists because the same mistake was made on two consecutive lots, by
// the conductor rather than by a builder, and neither time did anything catch it:
// a theme package landed on a branch without its `package-lock.json` entry. The
// seven local gates all stayed green — `npm ci` is not one of them — and the
// failure only surfaces in CI, where every workflow installs with `npm ci` and npm
// refuses a manifest that is out of sync with the lockfile.
//
// It is deliberately separate from `verify-theme-shape.test.mjs`: that one guards
// what is inside a theme, this one guards that the repository knows the theme
// exists. Both run under `node --test scripts/*.test.mjs`, so they reach CI
// through the root `npm test` without any workflow edit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

function themeFolders() {
  return readdirSync(join(root, "packages"))
    .filter((name) => name.startsWith("theme-"))
    .sort();
}

function readJson(relative) {
  return JSON.parse(readFileSync(join(root, relative), "utf8"));
}

test("every theme workspace has its lockfile entry", () => {
  const lock = readJson("package-lock.json");
  const missing = themeFolders().filter((folder) => !(`packages/${folder}` in lock.packages));

  assert.deepEqual(
    missing,
    [],
    `${missing.length} theme workspace(s) are absent from package-lock.json, so ` +
      `\`npm ci\` will refuse to install and every workflow will fail: ` +
      `${missing.join(", ")}. Run \`npm install\` and commit the lockfile.`
  );
});

test("every theme workspace is a docs dependency", () => {
  const docs = readJson("apps/docs/package.json");
  const declared = new Set(Object.keys(docs.dependencies ?? {}));
  const missing = themeFolders()
    .map((folder) => folder.slice("theme-".length))
    .filter((id) => !declared.has(`@sentropic/design-system-theme-${id}`));

  assert.deepEqual(
    missing,
    [],
    `${missing.length} theme(s) are not declared in apps/docs/package.json: ` +
      `${missing.join(", ")}. The catalogue discovers themes by glob, but the ` +
      `manifest is the repository's own record that the workspace exists.`
  );
});

test("no lockfile entry points at a theme folder that is gone", () => {
  const lock = readJson("package-lock.json");
  const onDisk = new Set(themeFolders().map((folder) => `packages/${folder}`));
  const stale = Object.keys(lock.packages)
    .filter((path) => /^packages\/theme-[a-z0-9-]+$/.test(path))
    .filter((path) => !onDisk.has(path));

  assert.deepEqual(
    stale,
    [],
    `package-lock.json still records ${stale.length} theme workspace(s) that no ` +
      `longer exist: ${stale.join(", ")}.`
  );
});

// A guard that silently inspects nothing is worse than no guard: it reports
// success while the thing it protects rots. This asserts the fixture itself.
test("the guards actually see the themes", () => {
  const folders = themeFolders();
  assert.ok(
    folders.length > 100,
    `expected the repository's theme packages to be discovered, found ${folders.length}`
  );
  assert.ok(
    folders.includes("theme-sent-tech") === false,
    "sent-tech is not a theme-* workspace; the discovery filter has drifted"
  );
});
