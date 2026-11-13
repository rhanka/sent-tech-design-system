import ts from 'typescript';
import assert from 'node:assert/strict';

// Check actual published entrypoints, including slots, exposed APIs and companion types.
const program = ts.createProgram(['tests/types/consumer.ts', 'dist/index.d.ts', 'dist/vapor/index.d.ts'], {
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
assert.equal(diagnostics.length, 0, 'Classic and Vapor helpers must be callable by TypeScript consumers');
console.log('Published Classic/Vapor type parity and helper calls: pass');
