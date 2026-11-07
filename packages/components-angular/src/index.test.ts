import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import "@angular/compiler";

import * as angular from "../dist/index.js";

const svelteIndex = readFileSync(resolve("../components-svelte/src/lib/index.ts"), "utf8");
// Svelte-only catalogue rows are declared by the component-index parity
// (parity-baseline gaps, e.g. diagram-card/diagram-zone in lot DC-1): the
// generated index records their angular cell as missing/no-counterpart, so
// they are excluded from the expected Angular surface via that recorded
// parity, not via a name list in this test.
const componentIndex = JSON.parse(
  readFileSync(resolve("../component-index/generated/component-index.json"), "utf8"),
);
const absentFromAngular = new Set(
  componentIndex.entries
    .filter(
      (entry: { parity?: Record<string, string> }) =>
        entry.parity?.angular === "missing" || entry.parity?.angular === "no-counterpart",
    )
    .map(
      (entry: { path: string }) =>
        JSON.parse(readFileSync(resolve("../component-index/generated", entry.path), "utf8")).displayName,
    ),
);
// Anchored to line start (with `m`) so a commented-out export line is not read
// as a real one — an unanchored pattern matched inside `// export { default as
// Foo }` and demanded an Angular component for a Svelte export that does not
// exist.
const componentNames = [
  ...svelteIndex.matchAll(/^export \{ default as (\w+)(?:,| \})/gm),
]
  .map((match) => match[1])
  // AppShell + IdentityButton = chrome applicatif svelte-only (ex-paquet app-shell,
  // replié dans design-system-svelte) ; pas de port Angular (parité différée tant
  // qu'aucun consommateur non-svelte ne le demande).
  .filter((name) => name !== "AppShell" && name !== "IdentityButton")
  .filter((name) => !absentFromAngular.has(name));

describe("Angular public surface", () => {
  it.each(componentNames)("exports standalone %s component", (name) => {
    const value = angular[name];
    expect(typeof value).toBe("function");
    expect((value as { stComponentName?: string }).stComponentName).toBe(name);
  });

  it("exports Svelte-canonical runtime helpers", () => {
    expect(angular.identityInitial({ displayName: "Ada Lovelace" })).toBe("A");
    expect(angular.deriveInitials("Ada Lovelace")).toBe("AL");
    expect(angular.edgeDashArray("dotted")).toBe("1 4");
    expect(angular.nodeShapePath("diamond", 4)).toContain("L");
  });
});
