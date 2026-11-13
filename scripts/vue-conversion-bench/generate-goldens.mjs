import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';

export function generateGoldens({ bench, pkg, src, packageSrc, names, modulePath }) {
  const selected = process.argv.slice(2);
  if (!selected.length) selected.push(...names);
  if (new Set(selected).size !== selected.length || selected.some(name => !names.includes(name))) throw new Error('Select unique component names with fixture files');
  for (const name of selected) {
    if (!existsSync(resolve(src, modulePath(name) + '.ts')) || existsSync(resolve(src, modulePath(name) + '.vue'))) throw new Error(name + ': original .ts required before capturing goldens');
    if (existsSync(resolve(bench, 'goldens', name + '.json'))) throw new Error(name + ': golden already exists; frozen captures cannot be overwritten');
  }
  const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: bench, encoding: 'utf8' });
  if (revision.status !== 0) throw new Error(revision.stderr);
  const indexFile = resolve(packageSrc, 'index.ts');
  const index = ts.createSourceFile(indexFile, readFileSync(indexFile, 'utf8'), ts.ScriptTarget.Latest, true);
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  const captures = [];
  for (const name of selected) {
    const file = resolve(src, modulePath(name) + '.ts');
    const route = './' + relative(packageSrc, file).replace(/\.ts$/, '.js');
    const fixture = resolve(bench, 'fixtures', name + '.fixtures.ts');
    const sourceSha256 = hash(file);
    const fixtureSha256 = hash(fixture);
    const child = spawnSync(process.execPath, [resolve(bench, 'worker.mjs'), 'ssr', name], { cwd: pkg, encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
    if (child.error) throw child.error;
    if (child.status !== 0) throw new Error(name + ': ' + child.stdout + '\n' + child.stderr);
    const result = JSON.parse(child.stdout.trim());
    if (!result.ok || result.implementation !== 'ts') throw new Error(name + ': invalid capture');
    if (hash(file) !== sourceSha256 || hash(fixture) !== fixtureSha256) throw new Error(name + ': source or fixture changed during capture');
    const publicExports = index.statements.filter(node => ts.isExportDeclaration(node) && node.moduleSpecifier?.text === route && node.exportClause && ts.isNamedExports(node.exportClause))
      .flatMap(node => node.exportClause.elements.map(entry => ({ name: entry.name.text, typeOnly: node.isTypeOnly || entry.isTypeOnly })));
    if (!publicExports.some(entry => entry.name === name) || !publicExports.some(entry => entry.name === name + 'Props')) throw new Error(name + ': missing public component/Props exports');
    captures.push([name, { schema: 1, component: name, sourceRevision: revision.stdout.trim(), source: relative(pkg, file), fixtures: result.fixtures, sourceSha256, fixtureSha256, publicExports }]);
  }
  mkdirSync(resolve(bench, 'goldens'), { recursive: true });
  for (const [name, capture] of captures) {
    writeFileSync(resolve(bench, 'goldens', name + '.json'), JSON.stringify(capture, null, 2) + '\n', { flag: 'wx' });
    console.log(name + ': ' + capture.fixtures.length + ' fixtures');
  }
}
