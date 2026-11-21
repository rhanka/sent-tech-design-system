import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { join, sep } from "node:path";
import ts from "typescript";

const host = realpathSync(import.meta.dirname);
const entry = join(host, "review-exports.ts");
const program = ts.createProgram([entry], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noEmit: true,
  types: [],
});
for (const file of program.getSourceFiles()) {
  assert.ok(realpathSync(file.fileName).startsWith(host + sep), `Review type check escaped the isolated host: ${file.fileName}`);
}
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: () => host,
  getNewLine: () => "\n",
}));
console.log("OK installed Svelte review props for all eight public components");

if (process.argv.includes("--bundle")) {
  const { build } = await import("vite");
  const { svelte, vitePreprocess } = await import("@sveltejs/vite-plugin-svelte");
  await build({
    root: host,
    configFile: false,
    envDir: false,
    plugins: [svelte({ configFile: false, preprocess: vitePreprocess({ script: true }) })],
    build: { write: false, lib: { entry, formats: ["es"], fileName: "review-exports" } },
  });
  console.log("OK bundled all eight public review components from the installed candidate");
}
