import ts from 'typescript';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Check actual published entrypoints, including slots, exposed APIs and companion types.
const program = ts.createProgram(['tests/types/consumer.ts'], {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true,
  skipLibCheck: false, noEmit: true, types: [],
});
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
}
assert.doesNotMatch(readFileSync('dist/DiagramSceneFigure.vue.d.ts', 'utf8'), /@sentropic\/diagram-core/,
  'Vue declarations must use the diagram-canvas boundary');
assert.doesNotMatch(readFileSync('dist/ForceGraph.d.ts', 'utf8'), /@vue\/runtime-core/,
  'The compatibility export must preserve the SFC type without naming a transitive Vue dependency');
