import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { bench, src, names } from './lib.mjs';

// Explicit maintenance command, never called by check.mjs. Refuse conversions.
for (const name of names) {
  if (!existsSync(resolve(src, `${name}.ts`)) || existsSync(resolve(src, `${name}.vue`))) throw new Error(`${name}: restore original .ts before capturing goldens`);
}
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: bench, encoding: 'utf8' });
if (revision.status !== 0) throw new Error(revision.stderr);
const captures = [];
const indexFile = resolve(src, 'index.ts');
const index = ts.createSourceFile(indexFile, readFileSync(indexFile, 'utf8'), ts.ScriptTarget.Latest, true);
for (const name of names) {
  const child = spawnSync(process.execPath, [resolve(bench, 'worker.mjs'), 'ssr', name], { encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  if (child.status !== 0) throw new Error(`${name}: ${child.stdout}\n${child.stderr}`);
  const result = JSON.parse(child.stdout.trim());
  if (!result.ok || result.implementation !== 'ts') throw new Error(`${name}: invalid capture`);
  captures.push([name, result.fixtures]);
}
mkdirSync(resolve(bench, 'goldens'), { recursive: true });
for (const [name, fixtures] of captures) {
  writeFileSync(resolve(bench, 'goldens', `${name}.json`), JSON.stringify({
    schema: 1, component: name, sourceRevision: revision.stdout.trim(),
    source: `src/${name}.ts`, fixtures,
    sourceSha256: createHash('sha256').update(readFileSync(resolve(src, `${name}.ts`))).digest('hex'),
    fixtureSha256: createHash('sha256').update(readFileSync(resolve(bench, 'fixtures', `${name}.fixtures.ts`))).digest('hex'),
    publicExports: index.statements.filter(node => ts.isExportDeclaration(node) && node.moduleSpecifier?.text === `./${name}.js`
      && node.exportClause && ts.isNamedExports(node.exportClause)).flatMap(node => node.exportClause.elements.map(entry => ({
      name: entry.name.text, typeOnly: node.isTypeOnly || entry.isTypeOnly,
    }))),
  }, null, 2) + '\n');
  console.log(`${name}: ${fixtures.length} fixtures`);
}
