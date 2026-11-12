import assert from 'node:assert/strict';
import { realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import ts from 'typescript';

const program = ts.createProgram(['consumer.ts'], {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext, strict: true,
  skipLibCheck: false, noEmit: true, types: [],
});
// The temporary consumer lives in the worktree. Reject accidental ancestor
// workspace resolution, including symlinks, so only installed tarballs count.
const consumerRoot = realpathSync(resolve('.')) + sep;
for (const file of program.getSourceFiles()) {
  assert(realpathSync(file.fileName).startsWith(consumerRoot), `Consumer escaped its installed dependencies: ${file.fileName}`);
}
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
}
