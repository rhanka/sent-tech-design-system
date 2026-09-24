/**
 * The framework-free dataviz derivation helpers are duplicated once per adapter
 * package (dataviz-angular, dataviz-react, dataviz-svelte, dataviz-vue) instead
 * of living in dataviz-core. That is a deliberate, recorded debt
 * (packages/dataviz-angular/PATTERN.md); this gate pins the copies so they cannot
 * drift apart silently while the debt is outstanding.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(repoRoot, "packages");

/** Every adapter package that could hold a copy, in a stable order. */
const adapterPackages = readdirSync(packagesDir)
  .filter((name) => /^dataviz-(?!core$)/.test(name))
  .sort();

/** The helper modules that are copied rather than shared. */
const helpers = ["categoricalData.ts", "distributionData.ts", "drill.ts", "partOfWholeData.ts"];

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("there is more than one adapter package to compare", () => {
  assert.ok(adapterPackages.length >= 2, `expected several dataviz-* packages, found ${adapterPackages.join(", ")}`);
});

for (const helper of helpers) {
  test(`${helper} is byte-identical in every package that ships it`, () => {
    const copies = adapterPackages
      .map((pkg) => ({ pkg, path: join(packagesDir, pkg, "src", "lib", helper) }))
      .filter((copy) => existsSync(copy.path))
      .map((copy) => ({ ...copy, hash: sha256(copy.path) }));

    assert.ok(copies.length >= 2, `${helper}: expected at least two copies, found ${copies.length}`);

    const digests = new Map();
    for (const copy of copies) {
      if (!digests.has(copy.hash)) digests.set(copy.hash, []);
      digests.get(copy.hash).push(copy.pkg);
    }

    assert.equal(
      digests.size,
      1,
      `${helper} has drifted:\n` +
        [...digests.entries()].map(([hash, pkgs]) => `  ${hash.slice(0, 12)} ${pkgs.join(", ")}`).join("\n") +
        "\n  copy the reference file across instead of editing one package's copy",
    );
  });
}
