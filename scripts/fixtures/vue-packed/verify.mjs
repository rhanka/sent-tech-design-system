import assert from 'node:assert/strict';
import { realpathSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { build } from 'vite';
import ts from 'typescript';

const vapor = process.env.VUE_PACKED_MODE === 'vapor';
const suffix = vapor ? '/vapor' : '';
writeFileSync('consumer.ts', `import { GraphLegend } from '@sentropic/design-system-vue${suffix}';
import { useDashboard } from '@sentropic/dataviz-vue${suffix}';
export { GraphLegend, useDashboard };\n`);
const program = ts.createProgram(['consumer.ts'], { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true, skipLibCheck: false, noEmit: true, types: [] });
const consumerRoot = realpathSync(resolve('.')) + sep;
for (const file of program.getSourceFiles()) assert(realpathSync(file.fileName).startsWith(consumerRoot), `Workspace leak: ${file.fileName}`);
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: file => file, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n',
}));
let count = 0;
await build({ configFile: false, logLevel: 'error', plugins: [{ name: 'classic-dependency-graph',
  transform(code, id) {
    count++;
    if (!vapor) {
      assert(!/\/dist\/vapor\/|@vue\/runtime-vapor/.test(id), `Classic graph pulled Vapor module: ${id}`);
      assert(!/\b(?:createVaporApp|defineVaporComponent|VaporTeleport|vaporInteropPlugin)\b/.test(code), `Classic graph pulled Vapor-only API: ${id}`);
    }
  },
}], build: { write: false, lib: { entry: resolve('consumer.ts'), formats: ['es'] } } });
assert(count > 10, 'Consumer graph did not traverse package dependencies');
console.log(`${vapor ? 'Vapor' : 'Classic'} packed declarations + dependency graph: pass (${count} modules)`);
