import { checkTemplateSource } from './template-source.mjs';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';
export function runCheck({ bench, pkg, src, packageSrc, names, modulePath, buildFiles, require, compilers, compileSfc, normalizeHtml, reviewCorrections }) {

const args = process.argv.slice(2);
const name = args[0];
const json = args.includes('--json');
if (!names.includes(name) || args.slice(1).some(arg => arg !== '--json') || args.length > 2) {
  console.error(`Usage: node bench/check.mjs <${names.join('|')}> [--json]`);
  process.exit(2);
}
const file = resolve(src, `${modulePath(name)}.vue`);
const gates = [];
let temporary;
const fail = message => { throw new Error(message); };
function gate(id, title, action) {
  try { gates.push({ gate: id, title, status: 'PASS', detail: action() ?? '' }); }
  catch (error) { gates.push({ gate: id, title, status: 'FAIL', detail: error.message ?? String(error) }); }
}
function source() {
  if (!existsSync(file)) fail(`Missing src/${name}.vue`);
  return readFileSync(file, 'utf8');
}
function worker(operation) {
  const child = spawnSync(process.execPath, [resolve(bench, 'worker.mjs'), operation, name], {
    cwd: pkg, encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  let result;
  try { result = JSON.parse(child.stdout.trim()); }
  catch { fail(`Worker output invalid: ${child.stdout}\n${child.stderr}`); }
  if (child.status !== 0 || !result.ok) fail(result.error ?? child.stderr ?? `Worker exit ${child.status}`);
  return result;
}
function typecheck(files) {
  temporary ??= mkdtempSync(resolve(bench, '.tmp-check-'));
  const config = resolve(temporary, 'tsconfig.json');
  writeFileSync(config, JSON.stringify({
    extends: resolve(pkg, 'tsconfig.json'),
    compilerOptions: { noEmit: true, emitDeclarationOnly: false, declaration: false, declarationMap: false, rootDir: pkg },
    files, include: [], exclude: [],
  }));
  const child = spawnSync(process.execPath, [require.resolve('vue-tsc/bin/vue-tsc.js'), '-p', config, '--pretty', 'false'], {
    cwd: pkg, encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) fail((child.stdout + child.stderr).trim() || `vue-tsc exited ${child.status}`);
}

try {
  gate('G1', 'Template source', () => {
    if (existsSync(resolve(src, `${modulePath(name)}.ts`))) fail(`Old src/${name}.ts still exists`);
    checkTemplateSource(source(), file, compilers);
    return 'Old .ts absent; typed script setup + template; forbidden syntax absent';
  });
  gate('G2', 'Classic + Vapor compile', () => {
    const build = Buffer.concat(buildFiles.map(file => readFileSync(file)));
    const pin = readFileSync(resolve(bench, 'build-sfc.sha256'), 'utf8').trim();
    if (createHash('sha256').update(build).digest('hex') !== pin) fail('build-sfc.mjs changed: reconcile bench/lib.mjs compiler logic and update build-sfc.sha256');
    for (const mode of ['classic', 'vapor']) compileSfc(source(), file, mode);
    return `Build-script compiler options; classic ${compilers.classic.version}, Vapor ${compilers.vapor.version}`;
  });
  gate('G3', 'Scoped vue-tsc', () => {
    source();
    typecheck([file]);
    return 'Target SFC and its transitive imports; inherited strict package settings';
  });
  gate('G4', 'SSR golden parity', () => {
    const golden = JSON.parse(readFileSync(resolve(bench, 'goldens', `${name}.json`), 'utf8'));
    if (golden.schema !== 1 || golden.component !== name || golden.fixtures.length < 4) fail('Invalid golden metadata');
    const fixtureHash = createHash('sha256').update(readFileSync(resolve(bench, 'fixtures', `${name}.fixtures.ts`))).digest('hex');
    if (fixtureHash !== golden.fixtureSha256) fail('Fixture changed since golden capture; restore the frozen measurement input');
    const { JSDOM } = require('jsdom');
    const normalizeFixture = f => ({ ...f, html: normalizeHtml(f.html, JSDOM),
      ...(f.teleports ? { teleports: Object.fromEntries(Object.entries(f.teleports).map(([k, v]) => [k, normalizeHtml(v, JSDOM)])) } : {}) });
    // Frozen measurements remain untouched; normalize both sides at comparison time.
    golden.fixtures = golden.fixtures.map(f => reviewCorrections ? reviewCorrections(name, f, JSDOM) : f).map(normalizeFixture);
    const actual = worker('ssr');
    actual.fixtures = actual.fixtures.map(normalizeFixture);
    const differences = [];
    if (JSON.stringify(actual.fixtures.map(f => f.id)) !== JSON.stringify(golden.fixtures.map(f => f.id))) fail('Fixture IDs/order differ from golden');
    for (let i = 0; i < golden.fixtures.length; i++) {
      if (JSON.stringify(actual.fixtures[i]) !== JSON.stringify(golden.fixtures[i])) {
        const expected = JSON.stringify(golden.fixtures[i]);
        const received = JSON.stringify(actual.fixtures[i]);
        let at = 0;
        while (at < Math.min(expected.length, received.length) && expected[at] === received[at]) at++;
        differences.push(`${golden.fixtures[i].id} at ${at}: expected ${expected.slice(Math.max(0, at - 50), at + 160)}; received ${received.slice(Math.max(0, at - 50), at + 160)}`);
      }
    }
    if (differences.length) fail(differences.join('\n'));
    return `${actual.fixtures.length}/${golden.fixtures.length} fixtures (${actual.implementation} implementation)`;
  });
  gate('G5', 'Vapor jsdom mount', () => {
    const result = worker('vapor');
    return `createVaporApp; fixture=${result.fixture}; interop=${result.interop}; mounted, flushed, unmounted`;
  });
  gate('G6', 'Public exports + Props', () => {
    const indexFile = resolve(packageSrc, 'index.ts');
    const index = readFileSync(indexFile, 'utf8');
    const ast = ts.createSourceFile(indexFile, index, ts.ScriptTarget.Latest, true);
    const target = `${name}Props`;
    const expectedExports = JSON.parse(readFileSync(resolve(bench, 'goldens', `${name}.json`), 'utf8')).publicExports;
    if (!Array.isArray(expectedExports) || ![name, target].every(n => expectedExports.some(e => e.name === n))) fail('Missing frozen public export manifest');
    const expectedNames = expectedExports.map(e => e.name);
    const exports = ast.statements.filter(node => ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)
      && node.exportClause.elements.some(e => expectedNames.includes(e.name.text)));
    const entries = exports.flatMap(node => node.exportClause.elements.map(e => ({
      exported: e.name.text, imported: (e.propertyName ?? e.name).text, type: node.isTypeOnly || e.isTypeOnly,
      specifier: node.moduleSpecifier?.text,
    })));
    for (const { name: exported, typeOnly } of expectedExports) {
      const entry = entries.find(e => e.exported === exported);
      if (!entry || typeof entry.specifier !== 'string') fail(`${exported} must be explicitly re-exported from src/index.ts`);
      const expected = './' + relative(packageSrc, resolve(src, modulePath(name))) + (existsSync(file) ? '.vue' : '.js');
      if (entry.specifier !== expected) fail(`${exported} routes to ${entry.specifier}, expected ${expected}`);
      if (entry.type !== typeOnly) fail(`${exported} changed value/type export kind`);
    }
    temporary ??= mkdtempSync(resolve(bench, '.tmp-check-'));
    const barrel = resolve(temporary, 'public.ts');
    // Preserve every export in the selected declarations, including auxiliary
    // types, but exclude unrelated components from this file-scoped gate.
    writeFileSync(barrel, exports.map(node => node.getText(ast).replace(/(["'])\.\//g, '$1' + relative(temporary, dirname(indexFile)) + '/')).join('\n'));
    const probe = resolve(temporary, 'probe.ts');
    const typeNames = expectedExports.filter(e => e.typeOnly).map(e => e.name);
    writeFileSync(probe, `import { ${name} } from './public.js';\nimport type { ${typeNames.join(', ')} } from './public.js';\nconst component: object | Function = ${name};\ntype PublicTypes = [${typeNames.join(', ')}];\nvoid component;\n`);
    typecheck([probe]);
    return `${expectedNames.join(', ')} resolve through selected index.ts exports; value/type kinds preserved`;
  });
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
const ok = gates.every(gate => gate.status === 'PASS');
if (json) console.log(JSON.stringify({ component: name, ok, gates }, null, 2));
else {
  console.log(`${name}\nGate  Result  Check`);
  for (const gate of gates) console.log(`${gate.gate}    ${gate.status.padEnd(6)}  ${gate.title}\n      ${gate.detail}`);
}
process.exitCode = ok ? 0 : 1;

}
