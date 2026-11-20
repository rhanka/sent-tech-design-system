import assert from "node:assert/strict";
import { test } from "node:test";
import { lcsLength, lineCount, reach, tokens, tokensTouched } from "./port-metrics.mjs";

test("lineCount counts like wc -l on a newline-terminated file", () => {
  assert.equal(lineCount(""), 0);
  assert.equal(lineCount("a\n"), 1);
  assert.equal(lineCount("a\nb\n"), 2);
  assert.equal(lineCount("a\nb"), 2);
});

test("tokens ignores comments and whitespace", () => {
  assert.deepEqual(tokens("// note\nconst a = 1; /* x */\n", "m.ts"), ["const", "a", "=", "1", ";"]);
});

test("tokensTouched counts the React tokens replaced by a port", () => {
  const react = 'import { useSyncExternalStore } from "react";\nexport const useX = () => useSyncExternalStore;\n';
  const preact = 'import { useSyncExternalStore } from "./runtime.js";\nexport const useX = () => useSyncExternalStore;\n';
  assert.equal(lcsLength(["a", "b", "c"], ["b", "x", "c"]), 2);
  const { total, touched } = tokensTouched(react, preact, "m.ts");
  assert.equal(touched, 1);
  assert.ok(total > touched);
});

test("reach detects SVG presentation attributes on intrinsic elements and tracked APIs", () => {
  const source = [
    'import React, { useSyncExternalStore } from "react";',
    "export const Chart = () => (",
    '  <svg viewBox="0 0 10 10">',
    '    <line strokeWidth={2} textLength={4} />',
    '    <text textAnchor="end" dominantBaseline="middle">x</text>',
    "  </svg>",
    ");",
    "export const s = useSyncExternalStore;",
    "",
  ].join("\n");
  const kinds = {};
  for (const { kind } of reach(source, "Chart.tsx")) kinds[kind] = (kinds[kind] ?? 0) + 1;
  assert.deepEqual(kinds, {
    "svgCasing.element": 3,
    "react.useSyncExternalStore": 1,
  });
});
