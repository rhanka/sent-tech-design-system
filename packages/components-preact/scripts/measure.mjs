// Bundle-size measurement of spike S1 (`npm run build && npm run measure`).
//
// Bundles the compiled outputs of the single JSX source with Vite, minified,
// and reports raw and gzip bytes for:
//   - the six components of the spike, Preact build vs emitted React build,
//     as component code only (runtime external) and as a full island payload
//     (runtime, signals and icons included, one render call);
//   - the compat-shim decision: the same Preact entries with `forwardRef`
//     taken from `preact/compat` instead of the core-only adapter.
//
// Reads `dist/` and `.react-emit/dist/`; writes entries and the report under
// `.react-emit/measure/` (generated, git-ignored). No browser involved.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const preactDist = join(packageDir, "dist");
const reactDist = join(packageDir, ".react-emit", "dist");
const workDir = join(packageDir, ".react-emit", "measure");

/** The six components of the spike. Portal and ThemeProvider are witnesses, measured apart. */
const SIX = ["Button", "Input", "Modal", "Tabs", "SelectableRow", "ChatComposer"];

const PROPS = {
  Button: "null",
  Input: '{ label: "Label" }',
  Modal: '{ open: true, title: "Title" }',
  Tabs: '{ items: [{ value: "a", label: "A", content: "A" }] }',
  SelectableRow: "null",
  ChatComposer: "null",
  Portal: "null",
};

function entry(runtime, components) {
  const dist = runtime === "preact" ? preactDist : reactDist;
  const imports = components.map((name) => `import { ${name} } from ${JSON.stringify(join(dist, `${name}.js`))};`);
  const tree = components.map((name) => `h(${name}, ${PROPS[name]})`).join(", ");
  const mount =
    runtime === "preact"
      ? [`import { createElement as h, render } from "preact";`, `render(h("div", null, ${tree}), document.body);`]
      : [
          `import { createElement as h } from "react";`,
          `import { createRoot } from "react-dom/client";`,
          `createRoot(document.body).render(h("div", null, ${tree}));`,
        ];
  return [mount[0], ...(mount.length === 3 ? [mount[1]] : []), ...imports, mount.at(-1)].join("\n") + "\n";
}

const EXTERNAL_RUNTIME = /^(?:preact|react|react-dom|@preact\/signals|@preact\/signals-core|lucide-preact|lucide-react)(?:\/|$)/;

/**
 * Alternative for the compat-shim decision: `forwardRef` and the two React 18
 * hooks from `preact/compat`. The two event helpers are restated here rather
 * than imported from the core adapter, whose module-level `options` hook would
 * otherwise stay in the bundle and be counted against the compat variant.
 */
function compatRuntimeVariant() {
  const variant = join(workDir, "runtime.compat.js");
  writeFileSync(
    variant,
    [
      `export { forwardRef, useInsertionEffect, useSyncExternalStore } from "preact/compat";`,
      `export function textInput(handler) { return { onInput: (event) => handler(event.currentTarget.value) }; }`,
      `export function textChange(handler, onInput) { return { onInput: onInput ? (e) => { onInput(e); handler(e); } : handler }; }`,
      `export function focusWithin(handler) { return { onFocusIn: handler }; }`,
      "",
    ].join("\n"),
  );
  return {
    name: "st-measure-compat-runtime",
    enforce: "pre",
    resolveId(source, importer) {
      if (source === "./runtime.js" && importer && dirname(importer) === preactDist) return variant;
      return null;
    },
  };
}

async function bundle(name, source, { external = false, plugins = [], includeCode = false } = {}) {
  const input = join(workDir, `${name}.js`);
  writeFileSync(input, source);
  const result = await build({
    configFile: false,
    root: packageDir,
    logLevel: "silent",
    plugins,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      write: false,
      minify: true,
      target: "es2022",
      modulePreload: false,
      rollupOptions: {
        input,
        external: external ? (id) => EXTERNAL_RUNTIME.test(id) : undefined,
        output: { format: "es" },
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
  const code = outputs
    .filter((chunk) => chunk.type === "chunk")
    .map((chunk) => chunk.code)
    .join("\n");
  const row = { name, bytes: Buffer.byteLength(code), gzip: gzipSync(code, { level: 9 }).length };
  if (includeCode) row.code = code;
  return row;
}

/**
 * Barrel entry: imports from the single public entrypoint instead of a deep
 * module, so the `sideEffects` barrel optimisation applies. Used by the
 * barrel contract check below (a non-signal component must not pull signals,
 * an intrinsic-SVG component must retain the runtime normaliser).
 */
function barrelEntry(components) {
  const specs = components
    .map((name) => `import { ${name} } from ${JSON.stringify(join(preactDist, "index.js"))};`)
    .join("\n");
  const tree = components.map((name) => `h(${name}, null)`).join(", ");
  return [`import { createElement as h, render } from "preact";`, specs, `render(h("div", null, ${tree}), document.body);`].join("\n") + "\n";
}

function lines(file) {
  const text = readFileSync(file, "utf8");
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir, { recursive: true });

const rows = [];
rows.push(await bundle("six.preact.components", entry("preact", SIX), { external: true }));
rows.push(await bundle("six.react.components", entry("react", SIX), { external: true }));
rows.push(await bundle("six.preact.island", entry("preact", SIX)));
rows.push(await bundle("six.react.island", entry("react", SIX)));
// Compat-shim decision.
rows.push(await bundle("button.preact.island.core-shim", entry("preact", ["Button"])));
rows.push(await bundle("button.preact.island.compat-shim", entry("preact", ["Button"]), { plugins: [compatRuntimeVariant()] }));
rows.push(await bundle("six.preact.island.compat-shim", entry("preact", SIX), { plugins: [compatRuntimeVariant()] }));
rows.push(await bundle("six+portal.preact.island", entry("preact", [...SIX, "Portal"])));
rows.push(await bundle("button.react.island", entry("react", ["Button"])));
// Per component, component code only.
for (const name of [...SIX, "Portal"]) {
  rows.push(await bundle(`${name}.preact.components`, entry("preact", [name]), { external: true }));
  rows.push(await bundle(`${name}.react.components`, entry("react", [name]), { external: true }));
}
// Barrel contract (package.json sideEffects breadth): a non-signal component
// imported from the public entrypoint must not pull `@preact/signals` (or an
// unrelated signal component), while an intrinsic-SVG component must retain
// the runtime `options.vnode` normaliser through its own side-effect import.
const barrelFlex = await bundle("barrel.flex.components", barrelEntry(["Flex"]), { external: true, includeCode: true });
const barrelFieldCard = await bundle("barrel.fieldcard.components", barrelEntry(["FieldCard"]), { external: true, includeCode: true });
rows.push(
  { name: barrelFlex.name, bytes: barrelFlex.bytes, gzip: barrelFlex.gzip },
  { name: barrelFieldCard.name, bytes: barrelFieldCard.bytes, gzip: barrelFieldCard.gzip },
);
const barrelFailures = [];
if (/@preact\/signals/.test(barrelFlex.code)) barrelFailures.push("barrel { Flex } pulls @preact/signals");
if (/st-rating/.test(barrelFlex.code)) barrelFailures.push("barrel { Flex } retains Rating");
if (/st-fieldCard/.test(barrelFlex.code)) barrelFailures.push("barrel { Flex } retains FieldCard");
if (!/st-fieldCard/.test(barrelFieldCard.code)) barrelFailures.push("barrel { FieldCard } drops FieldCard");
if (!/vnode/.test(barrelFieldCard.code)) barrelFailures.push("barrel { FieldCard } drops the runtime vnode normaliser");
if (barrelFailures.length > 0) {
  for (const failure of barrelFailures) console.error(`[measure] ${failure}`);
  process.exit(1);
}

const emitReport = JSON.parse(readFileSync(join(packageDir, ".react-emit", "emit-report.json"), "utf8"));
const sourceLines = Object.fromEntries(
  emitReport.modules.map((module) => [module.file, { lines: module.lines, rewrittenLines: module.changedLines }]),
);
const adapterLines = Object.fromEntries(
  emitReport.adapters.map((file) => [
    file,
    { preact: lines(join(packageDir, "src", file)), react: lines(join(packageDir, "react", file)) },
  ]),
);

const report = { bundles: rows, sourceLines, adapterLines };
writeFileSync(join(workDir, "measure-report.json"), JSON.stringify(report, null, 2) + "\n");

const width = Math.max(...rows.map((row) => row.name.length));
console.log(`${"bundle".padEnd(width)}  ${"min bytes".padStart(9)}  ${"gzip".padStart(7)}`);
for (const row of rows) {
  console.log(`${row.name.padEnd(width)}  ${String(row.bytes).padStart(9)}  ${String(row.gzip).padStart(7)}`);
}
