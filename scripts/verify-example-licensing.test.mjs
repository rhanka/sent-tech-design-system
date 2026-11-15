// Guards the example licensing gate itself: the real tree passes, and each
// planted defect fails with the violation that names it. A gate that has never
// been shown red proves nothing.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { collectViolations, EXAMPLES, parseInventory } from "./verify-example-licensing.mjs";

const repoRoot = new URL("../", import.meta.url).pathname;
// Read through `new URL("../…")` on purpose: verify-workflow-invariants.test.mjs
// derives from this form which paths must be able to trigger verify.yml.
const examplesDir = new URL("../examples/", import.meta.url).pathname;
const FILES = ["package.json", "package-lock.json", "LICENSE", "gas/demo.html", "gas/THIRD-PARTY-NOTICES.md"];

function withCopy(mutate, run) {
  const root = mkdtempSync(join(tmpdir(), "example-licensing-"));
  try {
    for (const example of EXAMPLES) {
      for (const file of FILES) {
        cpSync(join(examplesDir, example.dir.replace(/^examples\//, ""), file), join(root, example.dir, file), { recursive: true });
      }
    }
    mutate(root);
    return run(collectViolations(root).violations);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const demo = (root, file) => join(root, "examples/apps-script-demo", file);
const rewrite = (path, change) => writeFileSync(path, change(readFileSync(path, "utf8")));
const expectViolation = (mutate, pattern) =>
  withCopy(mutate, (violations) => {
    assert.ok(violations.some((v) => pattern.test(v)), `expected a violation matching ${pattern}, got:\n  ${violations.join("\n  ") || "(none)"}`);
  });

test("the repository's examples pass the licensing gate", () => {
  assert.deepEqual(collectViolations(repoRoot).violations, []);
});

test("the inventory is not vacuous: font, runtime and icons are listed", () => {
  const rows = parseInventory(readFileSync(join(examplesDir, "apps-script-demo/gas/THIRD-PARTY-NOTICES.md"), "utf8"));
  const licences = Object.fromEntries(rows.map((row) => [row.name, row.license]));
  assert.ok(rows.length >= 6, `expected at least 6 embedded packages, found ${rows.length}`);
  assert.equal(licences["@fontsource-variable/inter"], "OFL-1.1");
  assert.equal(licences["svelte"], "MIT");
  assert.equal(licences["@lucide/svelte"], "ISC");
});

test("an untouched copy of the examples passes (fixture baseline)", () => {
  withCopy(() => {}, (violations) => assert.deepEqual(violations, []));
});

test("fails without a LICENSE file", () => {
  expectViolation((root) => rmSync(demo(root, "LICENSE")), /no LICENSE file/);
});

test("fails with a stub LICENSE", () => {
  expectViolation((root) => writeFileSync(demo(root, "LICENSE"), "MIT\n"), /placeholder, not a licence text/);
});

test("fails without a usable license field", () => {
  expectViolation((root) => rewrite(demo(root, "package.json"), (s) => s.replace('"license": "MIT"', '"license": "UNLICENSED"')), /no usable "license" field/);
});

test("fails without the notices file", () => {
  expectViolation((root) => rmSync(demo(root, "gas/THIRD-PARTY-NOTICES.md")), /no gas\/THIRD-PARTY-NOTICES\.md/);
});

test("fails when the page does not embed the notices", () => {
  expectViolation(
    (root) => rewrite(demo(root, "gas/demo.html"), (s) => `<!doctype html>\n${s.slice(s.indexOf("-->") + 4)}`),
    /does not start with the third-party notices comment/,
  );
});

test("fails when the embedded notices differ from the notices file", () => {
  expectViolation(
    (root) => rewrite(demo(root, "gas/THIRD-PARTY-NOTICES.md"), (s) => s.replace("The Inter Project Authors", "Someone Else")),
    /is not the content of gas\/THIRD-PARTY-NOTICES\.md/,
  );
});

test("fails when the OFL text is dropped from both the file and the page", () => {
  const drop = (s) => s.replace("SIL OPEN FONT LICENSE Version 1.1", "FONT LICENCE");
  expectViolation(
    (root) => {
      rewrite(demo(root, "gas/THIRD-PARTY-NOTICES.md"), drop);
      rewrite(demo(root, "gas/demo.html"), drop);
    },
    /lacks the SIL Open Font License 1\.1 text/,
  );
});

test("fails when an inventory row has no licence text section", () => {
  expectViolation(
    (root) => rewrite(demo(root, "gas/THIRD-PARTY-NOTICES.md"), (s) => s.replace(/\n### svelte /, "\n### svelte-runtime ")),
    /lists svelte \S+ but has no licence text section/,
  );
});

test("fails when the lockfile pins another version than the inventory", () => {
  expectViolation(
    (root) => rewrite(demo(root, "package-lock.json"), (s) => {
      const lock = JSON.parse(s);
      lock.packages["node_modules/svelte"].version = "0.0.1";
      return JSON.stringify(lock);
    }),
    /lists svelte \S+, but package-lock\.json pins 0\.0\.1/,
  );
});

test("fails when a package the page embeds is missing from the inventory", () => {
  expectViolation(
    (root) => rewrite(demo(root, "gas/THIRD-PARTY-NOTICES.md"), (s) => s.replace(/^\| `@fontsource-variable\/inter` .*\n/m, "")),
    /does not list @fontsource-variable\/inter/,
  );
});

test("fails on an example nobody declared", () => {
  expectViolation(
    (root) => cpSync(demo(root, "package.json"), join(root, "examples/another-demo/package.json"), { recursive: true }),
    /examples\/another-demo: not declared/,
  );
});
