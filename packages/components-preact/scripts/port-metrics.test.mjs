// Unit tests of the pure helpers behind `npm run measure:port`
// (`node --test scripts/port-metrics.test.mjs`). The measurement itself reads
// the base commit through git and is checked by `npm run measure:port:check`,
// which `npm run test:emit` (hence `npm test` and CI) runs after these tests.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attributeCatalog,
  catalogReexports,
  declarations,
  hours,
  lcsLength,
  lineCount,
  portRate,
  projectLot,
  reach,
  testCases,
  tokens,
  tokensTouched,
} from "./port-metrics.mjs";

test("lineCount counts like wc -l on a newline-terminated file", () => {
  assert.equal(lineCount(""), 0);
  assert.equal(lineCount("a\n"), 1);
  assert.equal(lineCount("a\nb\n"), 2);
  assert.equal(lineCount("a\nb"), 2);
});

test("tokens ignores comments and whitespace, and keeps JSX text as one token", () => {
  assert.deepEqual(tokens("// note\nconst a = 1; /* x */\n", "m.ts"), ["const", "a", "=", "1", ";"]);
  assert.deepEqual(tokens("const n = <p>\n  two words\n</p>;\n", "m.tsx"), ["const", "n", "=", "<", "p", ">", "two words", "<", "/", "p", ">", ";"]);
});

test("tokensTouched counts the React tokens a port replaced, not the ones it kept or added", () => {
  const react = 'import React from "react";\nexport const useOpen = () => React.useState(false);\n';
  const preact = 'import { useState } from "preact/hooks";\nexport const useOpen = () => useState(false);\n';
  assert.equal(lcsLength(["a", "b", "c", "d"], ["b", "x", "d"]), 2);
  const { total, touched } = tokensTouched(react, preact, "m.ts");
  assert.equal(total, 19);
  // `React` (import), `"react"`, `React`, `.` are gone; everything else survives.
  assert.equal(touched, 4);
  assert.deepEqual(tokensTouched(react, react, "m.ts"), { total: 19, touched: 0 });
});

const catalog = [
  'import React from "react";', // 1  residual
  "", // 2  residual
  "function helper() {", // 3  residual (private)
  "  return 1;", // 4
  "}", // 5
  "", // 6
  "// A comment above the type.", // 7  residual (leading comment)
  "export type AlphaProps = {", // 8  Alpha.tsx
  "  label: string;", // 9
  "};", // 10
  "export function Alpha(props: AlphaProps) {", // 11 Alpha.tsx
  "  return <b>{props.label}{helper()}</b>;", // 12
  "}", // 13
  "", // 14 residual
  "export const Beta = () => <i />;", // 15 Beta.tsx
  "export function Orphan() {", // 16 residual: exported, re-exported by no module
  "  return null;", // 17
  "}", // 18
  "",
].join("\n");

test("catalogReexports recognises a pure re-export module of catalog.tsx only", () => {
  assert.deepEqual(catalogReexports('export { Alpha } from "./catalog.js";\nexport type { AlphaProps } from "./catalog.js";\n', "Alpha.tsx"), ["Alpha", "AlphaProps"]);
  assert.deepEqual(catalogReexports('export { Alpha as A } from "./catalog.js";\n', "A.tsx"), ["Alpha"]);
  assert.equal(catalogReexports('export { Alpha } from "./catalog.js";\nexport const own = 1;\n', "Mixed.tsx"), null);
  assert.equal(catalogReexports('export { x } from "./other.js";\n', "Other.tsx"), null);
  assert.equal(catalogReexports('export * from "./catalog.js";\n', "index.ts"), null);
  assert.equal(catalogReexports("", "Empty.ts"), null);
});

test("declarations gives the names and line spans of top-level declarations", () => {
  assert.deepEqual(declarations(catalog, "catalog.tsx"), [
    { names: ["helper"], start: 3, end: 5 },
    { names: ["AlphaProps"], start: 8, end: 10 },
    { names: ["Alpha"], start: 11, end: 13 },
    { names: ["Beta"], start: 15, end: 15 },
    { names: ["Orphan"], start: 16, end: 18 },
  ]);
});

test("attributeCatalog gives each line to the re-exporting module and leaves the rest as residual", () => {
  const owners = attributeCatalog(catalog, { "Alpha.tsx": ["Alpha", "AlphaProps"], "Beta.tsx": ["Beta"] });
  assert.equal(owners.length, 18);
  const linesOf = (file) => owners.flatMap((owner, index) => (owner === file ? [index + 1] : []));
  assert.deepEqual(linesOf("Alpha.tsx"), [8, 9, 10, 11, 12, 13]);
  assert.deepEqual(linesOf("Beta.tsx"), [15]);
  assert.deepEqual(linesOf(null), [1, 2, 3, 4, 5, 6, 7, 14, 16, 17, 18]);
  // A name claimed by two modules is owned once, by the first in file order.
  const twice = attributeCatalog(catalog, { "Z.tsx": ["Beta"], "B.tsx": ["Beta"] });
  assert.equal(twice[14], "B.tsx");
});

test("reach separates what Preact core treats differently from what it does not", () => {
  const source = [
    'import React, { forwardRef } from "react";',
    'import ReactDOM from "react-dom";',
    "export const Chart = forwardRef((props: { onFocus?: React.FocusEventHandler }, ref: React.Ref<SVGSVGElement>) => (",
    '  <svg ref={ref} viewBox="0 0 1 1" onFocus={props.onFocus}>',
    '    <line strokeWidth={2} textLength={3} style={{ width: 1 }} />',
    "    <Icon strokeWidth={2} onBlur={() => {}} style={props.style} />",
    '    <input onChange={() => {}} /><select onChange={() => {}} /><Field onChange={() => {}} />',
    "  </svg>",
    "));",
    'export const row = React.createElement("div", { onFocus: () => {}, onClick: () => {} });',
    "export const portal = ReactDOM.createPortal(null, document.body);",
    "",
  ].join("\n");
  const kinds = {};
  for (const { kind } of reach(source, "Chart.tsx")) kinds[kind] = (kinds[kind] ?? 0) + 1;
  assert.deepEqual(kinds, {
    "svgCasing.element": 1, // strokeWidth on <line>; viewBox and textLength are genuine camelCase
    "svgCasing.componentProp": 1, // strokeWidth on <Icon>
    "focus.element": 1,
    "focus.componentProp": 1,
    "focus.objectKey": 1,
    "onChange.textControl": 1,
    "onChange.otherElement": 1,
    "onChange.componentProp": 1,
    "inlineStyle.elementLiteral": 1,
    "inlineStyle.other": 1,
    reactNamespace: 3,
    "react.FocusEventHandler": 1,
    "react.Ref": 1,
    "react.createElement": 1,
    "react.forwardRef": 1, // the call, not the import specifier
    "react.createPortal": 1,
  });
});

test("testCases counts it() and test() calls", () => {
  assert.equal(testCases('describe("x", () => { it("a", () => {}); it("b", () => {}); test("c", () => {}); });\n', "x.test.ts"), 3);
});

test("portRate derives step durations from file births and keeps the reported figures apart", () => {
  const timing = {
    steps: [
      { step: "setup", modules: [], files: ["adapter.ts"], reportedSeconds: 30 },
      { step: "first", modules: ["A"], files: ["A.tsx", "A.test.tsx"], reportedSeconds: 100 },
      { step: "second", modules: ["B", "C"], files: ["B.tsx", "C.tsx", "C.test.tsx"], reportedSeconds: 50 },
    ],
    fileTimes: [
      { file: "adapter.ts", birth: 1000, modified: 1500 },
      { file: "A.tsx", birth: 1040, modified: 1040 },
      { file: "A.test.tsx", birth: 1050, modified: 1090 },
      { file: "B.tsx", birth: 1160, modified: 1160 },
      { file: "C.tsx", birth: 1200, modified: 1200 },
      { file: "C.test.tsx", birth: 1220, modified: 1300 },
    ],
  };
  const lines = { A: 20, B: 30, C: 50 };
  const rate = portRate(timing, (name) => lines[name]);
  assert.deepEqual(rate.steps.map((step) => [step.fileTimeSeconds, step.lowerBound, step.lines]), [
    [40, false, 0],
    [120, false, 20],
    [60, true, 80], // last step: first write to last write, a lower bound
  ]);
  assert.equal(rate.modules, 3);
  assert.equal(rate.lines, 100);
  assert.deepEqual(rate.fileTimes, { seconds: 180, secondsPerModule: 60, secondsPerLine: 1.8 });
  assert.deepEqual(rate.reported, { seconds: 150, secondsPerModule: 50, secondsPerLine: 1.5 });
  assert.deepEqual(rate.afterFirstPort, { modules: 2, fileTimeSecondsPerModule: 30, reportedSecondsPerModule: 25 });
  assert.equal(rate.setupFileTimeSeconds, 40);
  assert.throws(() => portRate({ steps: [{ step: "x", modules: [], files: ["missing.ts"], reportedSeconds: 1 }], fileTimes: [] }, () => 0), /no file time for missing\.ts/);
});

test("hours converts lines at a rate and a factor", () => {
  assert.equal(hours(3600, 1), 1);
  assert.equal(hours(3600, 1, 2), 2);
  assert.equal(hours(1980, 0.968, 2), 1.1);
});

test("projectLot revises the sampled categories only and keeps the plan share of the others", () => {
  const rates = { secondsPerLine: 1, reportedSecondsPerLine: 0.5, factors: { low: 1, central: 2, high: 3 } };
  const lot = {
    lot: "PX",
    label: "x",
    modules: 3,
    lines: 7200,
    planHours: 10,
    byCategory: {
      action: { modules: 1, lines: 1800, sampled: ["Button"] },
      layout: { modules: 2, lines: 5400, sampled: [] },
    },
  };
  const partly = projectLot(lot, [{ module: "Button", reactLines: 36 }], rates);
  assert.equal(partly.status, "partly measured");
  assert.deepEqual(partly.revisedCategories, ["action"]);
  assert.deepEqual(partly.keptCategories, ["layout"]);
  assert.equal(partly.keptPlanHours, 7.5);
  assert.equal(partly.revisedPlanHours, 2.5);
  assert.deepEqual(partly.revisedCategoryHours, { low: 0.5, central: 1, high: 1.5 });
  // 7.5 h of plan kept for layout + the action lines at the rate.
  assert.deepEqual(partly.revisedHours, { low: 8, central: 8.5, high: 9 });
  assert.equal(partly.sampledShare, 0.5);

  // The uncatalogued bucket is never revised, even with a ported module.
  const bucket = projectLot(
    { ...lot, byCategory: { chat: { modules: 1, lines: 1800, sampled: ["ChatComposer"] }, "(uncatalogued)": { modules: 2, lines: 5400, sampled: ["ThemeProvider"] } } },
    [{ module: "ChatComposer", reactLines: 30 }, { module: "ThemeProvider", reactLines: 6 }],
    rates,
  );
  assert.deepEqual(bucket.keptCategories, ["(uncatalogued)"]);
  assert.deepEqual(bucket.revisedHours, { low: 8, central: 8.5, high: 9 });

  const full = projectLot({ ...lot, byCategory: { action: { modules: 3, lines: 7200, sampled: ["Button"] } } }, [{ module: "Button", reactLines: 36 }], rates);
  assert.equal(full.status, "measured");
  assert.equal(full.keptPlanHours, 0);
  assert.deepEqual(full.revisedHours, { low: 2, central: 4, high: 6 });

  const none = projectLot({ ...lot, byCategory: { data: { modules: 3, lines: 7200, sampled: [] } } }, [], rates);
  assert.equal(none.status, "not measured");
  assert.equal(none.keptPlanHours, 10);
  assert.equal(none.revisedHours, null);
  assert.equal(none.revisedCategoryHours, null);
});
