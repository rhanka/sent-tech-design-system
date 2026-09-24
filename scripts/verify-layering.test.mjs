import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The design system is the base layer: dataviz adapters and the diagram stack wrap DS
// components, never the reverse. A dependency the other way couples the DS release train
// to the dataviz one — PR #65 briefly shipped `@sentropic/dataviz-core` in the four
// component manifests, which turned `pack:smoke` red (the version is not on the registry)
// and would have blocked publishing the four public DS packages.
const FORBIDDEN = [/^@sentropic\/dataviz(-|$)/, /^@sentropic\/graph$/, /^@sentropic\/diagram-/];
const DEPENDENCY_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies"];

const packagesDir = new URL("../packages/", import.meta.url).pathname;

function dsPackageDirs() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      if (name.startsWith("dataviz-") || name === "graph" || name.startsWith("diagram-")) return false;
      try {
        const manifest = JSON.parse(readFileSync(join(packagesDir, name, "package.json"), "utf8"));
        return typeof manifest.name === "string" && manifest.name.startsWith("@sentropic/design-system");
      } catch {
        return false;
      }
    });
}

test("no design system package depends on the dataviz, graph or diagram layers", () => {
  const offenders = [];
  for (const dir of dsPackageDirs()) {
    const manifest = JSON.parse(readFileSync(join(packagesDir, dir, "package.json"), "utf8"));
    for (const field of DEPENDENCY_FIELDS) {
      for (const dependency of Object.keys(manifest[field] ?? {})) {
        if (FORBIDDEN.some((pattern) => pattern.test(dependency))) {
          offenders.push(`${manifest.name} → ${dependency} (${field})`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `design system packages must not depend on the dataviz/graph/diagram layers:\n  ${offenders.join("\n  ")}`,
  );
});

test("the guard actually sees the design system packages", () => {
  const dirs = dsPackageDirs();
  for (const expected of ["components-react", "components-svelte", "components-vue", "components-angular"]) {
    assert.ok(dirs.includes(expected), `expected ${expected} among the inspected packages`);
  }
});
