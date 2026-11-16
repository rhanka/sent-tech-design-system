import ts from 'typescript';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Check actual published entrypoints, including slots, exposed APIs and companion types.
const program = ts.createProgram(['tests/types/consumer.ts', 'tests/types/review-contracts.ts', 'dist/index.d.ts', 'dist/vapor/index.d.ts'], {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true,
  skipLibCheck: false, noEmit: true, types: [],
});
const checker = program.getTypeChecker();
function exportedTypes(file) {
  const module = checker.getSymbolAtLocation(program.getSourceFile(file));
  return new Map(checker.getExportsOfModule(module).flatMap(symbol => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return target.flags & ts.SymbolFlags.Type ? [[symbol.name, target]] : [];
  }));
}
const classicTypes = exportedTypes('dist/index.d.ts');
const vaporTypes = exportedTypes('dist/vapor/index.d.ts');
assert.deepEqual([...vaporTypes.keys()].sort(), [...classicTypes.keys()].sort(),
  'Vapor must export every public Classic type, including inline mixed type exports');
for (const [name, symbol] of classicTypes) assert.equal(vaporTypes.get(name), symbol,
  `Vapor type ${name} must preserve the Classic declaration`);
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
