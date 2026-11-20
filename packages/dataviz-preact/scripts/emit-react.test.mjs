// The emission is also the lint of the single-source rule: these cases pin
// what it rewrites, what it leaves alone and what it refuses.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { ADAPTERS, SPECIFIER_REWRITE, emitReact, rewriteSpecifiers } from "./emit-react.mjs";

test("rewrites every mapped specifier and nothing else", () => {
  const source = [
    `import { Fragment } from "preact";`,
    `import type { CSSProperties } from 'preact';`,
    `import { useState } from "preact/hooks";`,
    `import { BarChart } from "@sentropic/design-system-preact";`,
    `import { createDashboardStore } from "@sentropic/dataviz-core";`,
    `import { useSyncExternalStore } from "./runtime.js";`,
    `import { compileTheme } from "@sentropic/design-system-themes";`,
    `export { useDashboard } from "./adapter.js";`,
    `// a comment naming "preact/hooks" and "@sentropic/design-system-preact"`,
    `const label = "preact";`,
    `const lazy = () => import("preact/hooks");`,
    "",
  ].join("\n");
  const { text, rewrites } = rewriteSpecifiers(source, "src/lib/Sample.tsx");
  assert.equal(
    text,
    [
      `import { Fragment } from "react";`,
      `import type { CSSProperties } from 'react';`,
      `import { useState } from "react";`,
      `import { BarChart } from "@sentropic/design-system-react";`,
      `import { createDashboardStore } from "@sentropic/dataviz-core";`,
      `import { useSyncExternalStore } from "./runtime.js";`,
      `import { compileTheme } from "@sentropic/design-system-themes";`,
      `export { useDashboard } from "./adapter.js";`,
      `// a comment naming "preact/hooks" and "@sentropic/design-system-preact"`,
      `const label = "preact";`,
      `const lazy = () => import("react");`,
      "",
    ].join("\n"),
  );
  assert.deepEqual(
    rewrites.map(({ from }) => from),
    ["preact", "preact", "preact/hooks", "@sentropic/design-system-preact", "preact/hooks"],
  );
});

for (const specifier of [
  "preact/compat",
  "@preact/signals",
  "@preact/signals-core",
  "preact/debug",
  "react",
  "react-dom",
  "lucide-preact",
  "lucide-react",
  "@sentropic/design-system-react",
]) {
  test(`refuses the runtime-specific specifier ${specifier} in a module`, () => {
    assert.throws(
      () => rewriteSpecifiers(`import { anything } from "${specifier}";\n`, "src/lib/Sample.tsx"),
      new RegExp(`src/lib/Sample\\.tsx: runtime-specific specifier "${specifier.replace("/", "\\/")}"`),
    );
  });
}

test("the map and the adapter list are the documented ones", () => {
  assert.deepEqual(
    { ...SPECIFIER_REWRITE },
    {
      preact: "react",
      "preact/hooks": "react",
      "@sentropic/design-system-preact": "@sentropic/design-system-react",
    },
  );
  assert.deepEqual(Object.keys(ADAPTERS), ["compat.ts", "runtime.ts", "signals.ts"]);
});

function fixture(files, twins) {
  const dir = mkdtempSync(join(tmpdir(), "st-dv-emit-react-"));
  for (const [root, entries] of [
    ["src", files],
    ["react", twins],
  ]) {
    for (const [name, content] of Object.entries(entries)) {
      const target = join(dir, root, name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
  return { dir, options: { srcDir: join(dir, "src"), twinsDir: join(dir, "react"), outDir: join(dir, "out") } };
}

const adapters = {
  "compat.ts": `export { createPortal } from "preact/compat";\n`,
  "runtime.ts": `export { options } from "preact";\n`,
  "signals.ts": `export { Signal } from "@preact/signals";\n`,
};
const twins = {
  "compat.ts": `export { createPortal } from "react-dom";\n`,
  "runtime.ts": `export { useSyncExternalStore } from "react";\n`,
  "signals.ts": `export type MaybeSignal<T> = T;\n`,
};

test("emits nested lib/ modules rewritten, swaps the adapters and skips tests", () => {
  const { dir, options } = fixture(
    {
      ...adapters,
      "lib/Chart.tsx": `import { BarChart } from "@sentropic/design-system-preact";\nexport const Chart = () => <BarChart data={[]} label="x" />;\n`,
      "lib/Chart.test.tsx": `import "preact/compat";\n`,
    },
    twins,
  );
  try {
    const report = emitReact(options);
    assert.deepEqual(report.adapters, ["compat.ts", "runtime.ts", "signals.ts"]);
    assert.deepEqual(report.modules, [{ file: "lib/Chart.tsx", lines: 2, rewrites: 1, changedLines: 1 }]);
    assert.equal(
      readFileSync(join(options.outDir, "src/lib/Chart.tsx"), "utf8"),
      `import { BarChart } from "@sentropic/design-system-react";\nexport const Chart = () => <BarChart data={[]} label="x" />;\n`,
    );
    assert.equal(readFileSync(join(options.outDir, "src/compat.ts"), "utf8"), twins["compat.ts"]);
    assert.throws(() => readFileSync(join(options.outDir, "src/lib/Chart.test.tsx"), "utf8"), /ENOENT/);
    assert.equal(
      JSON.parse(readFileSync(join(options.outDir, "tsconfig.json"), "utf8")).compilerOptions.jsxImportSource,
      undefined,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses an adapter that imports beyond its allowance, and a missing twin", () => {
  const leaking = fixture({ ...adapters, "runtime.ts": `export { forwardRef } from "preact/compat";\n` }, twins);
  const { "signals.ts": _dropped, ...incompleteTwins } = twins;
  const untwinned = fixture(adapters, incompleteTwins);
  try {
    assert.throws(() => emitReact(leaking.options), /src\/runtime\.ts: adapter imports "preact\/compat"/);
    assert.throws(() => emitReact(untwinned.options), /src\/signals\.ts: no React twin/);
  } finally {
    rmSync(leaking.dir, { recursive: true, force: true });
    rmSync(untwinned.dir, { recursive: true, force: true });
  }
});
