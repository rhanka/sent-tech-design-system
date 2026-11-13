#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { bench, pkg, src, names, require, compilers, compileSfc, normalizeHtml, componentPath } from './lib.mjs';

const args = process.argv.slice(2);
const name = args[0];
const json = args.includes('--json');
if (!names.includes(name) || args.slice(1).some(arg => arg !== '--json') || args.length > 2) {
  console.error(`Usage: node bench/check.mjs <${names.join('|')}> [--json]`);
  process.exit(2);
}
const file = name === 'cellDecoration' ? resolve(src, 'CellDecorationIcon.vue') : componentPath(name);
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
    env: { ...process.env, LANG: 'fr_FR.UTF-8', LC_ALL: 'fr_FR.UTF-8' },
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
    const problems = [];
    if (name === 'cellDecoration') {
      if (/\b(?:h|defineComponent)\s*\(/.test(readFileSync(resolve(src, 'cellDecoration.ts'), 'utf8'))) problems.push('Decoration helper still renders VNodes');
    } else if (existsSync(resolve(src, `${name}.ts`))) problems.push(`Old src/${name}.ts still exists`);
    const { descriptor, errors } = compilers.classic.parse(source(), { filename: file });
    if (errors.length) fail(errors.map(String).join('; '));
    if (!descriptor.scriptSetup || descriptor.scriptSetup.lang !== 'ts') problems.push('Requires <script setup lang="ts">');
    if (!descriptor.template || descriptor.template.src) problems.push('Requires an inline template');
    if (descriptor.script || descriptor.scriptSetup?.src) problems.push('Only inline script setup is permitted');
    if (descriptor.scriptSetup?.attrs.vapor !== undefined) problems.push('Build injects vapor; do not author it');
    const script = descriptor.scriptSetup?.content ?? '';
    const ast = ts.createSourceFile(file + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const banned = new Set(['h', 'defineComponent', 'render']);
    for (const node of ast.statements) {
      if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        for (const item of node.importClause.namedBindings.elements) {
          if (!node.importClause.isTypeOnly && !item.isTypeOnly && banned.has((item.propertyName ?? item.name).text)) {
            banned.add(item.name.text);
            problems.push(`Forbidden runtime import: ${(item.propertyName ?? item.name).text}`);
          }
        }
      }
    }
    const walk = node => {
      if (ts.isCallExpression(node)) {
        const called = ts.isIdentifier(node.expression) ? node.expression.text
          : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : '';
        if (banned.has(called)) problems.push(`Forbidden call: ${called}()`);
        if (called === 'defineOptions' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
          for (const property of node.arguments[0].properties) {
            if (!property.name || !['name', 'inheritAttrs'].includes(property.name.getText().replace(/['"]/g, ''))) {
              problems.push('defineOptions is limited to name and inheritAttrs; Options API behavior is forbidden');
            }
          }
        }
      }
      if (ts.isExportAssignment(node)) problems.push('Runtime default/Options API export is forbidden');
      if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isPropertyAssignment(node) || ts.isVariableDeclaration(node))
        && node.name?.getText() === 'render') problems.push('Render function is forbidden');
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) problems.push('JSX is forbidden');
      ts.forEachChild(node, walk);
    };
    walk(ast);
    // Also inspect template expressions: a forbidden render call must not hide
    // in interpolation, v-bind, v-on or a directive expression.
    const templateWalk = node => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 4 && !node.isStatic && typeof node.content === 'string') {
        walk(ts.createSourceFile('template.ts', node.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue;
        if (Array.isArray(value)) value.forEach(templateWalk);
        else if (value && typeof value === 'object') templateWalk(value);
      }
    };
    templateWalk(descriptor.template?.ast);
    // TSX parse is separate so JSX cannot hide in malformed TS input.
    const jsxAst = ts.createSourceFile(file + '.tsx', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const jsxWalk = node => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) problems.push('JSX is forbidden');
      ts.forEachChild(node, jsxWalk);
    };
    jsxWalk(jsxAst);
    if (problems.length) fail([...new Set(problems)].join('; '));
    return name === 'cellDecoration'
      ? 'Pure TypeScript data helper; typed template SVG consumer; forbidden rendering syntax absent'
      : 'Old .ts absent; typed script setup + template; forbidden syntax absent';
  });
  gate('G2', 'Classic + Vapor compile', () => {
    const build = readFileSync(resolve(pkg, 'scripts/build-sfc.mjs'));
    const pin = readFileSync(resolve(bench, 'build-sfc.sha256'), 'utf8').trim();
    if (createHash('sha256').update(build).digest('hex') !== pin) fail('build-sfc.mjs changed: reconcile bench/lib.mjs compiler logic and update build-sfc.sha256');
    const shared = readFileSync(resolve(pkg, '../../scripts/vue-sfc-build.mjs'));
    if (createHash('sha256').update(shared).digest('hex') !== readFileSync(resolve(bench, 'shared-build.sha256'), 'utf8').trim()) fail('Shared SFC compiler changed; reconcile the bench compiler');
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
    // Apply the current identity-only normalizer symmetrically to frozen references.
    const { JSDOM } = require('jsdom');
    golden.fixtures = golden.fixtures.map(f => ({ ...f, html: normalizeHtml(f.html, JSDOM),
      ...(f.teleports ? { teleports: Object.fromEntries(Object.entries(f.teleports).map(([k, v]) => [k, normalizeHtml(v, JSDOM)])) } : {}) }));
    if (golden.schema !== 1 || golden.component !== name || golden.fixtures.length < 4) fail('Invalid golden metadata');
    const fixtureHash = createHash('sha256').update(readFileSync(resolve(bench, 'fixtures', `${name}.fixtures.ts`))).digest('hex');
    if (fixtureHash !== golden.fixtureSha256) fail('Fixture changed since golden capture; restore the frozen measurement input');
    const actual = worker('ssr');
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
    const indexFile = ['RichTextEditor', 'ComposerEditor', 'LockPresenceBadge'].includes(name)
      ? resolve(file, '../index.ts') : resolve(src, 'index.ts');
    const index = readFileSync(indexFile, 'utf8');
    const ast = ts.createSourceFile(indexFile, index, ts.ScriptTarget.Latest, true);
    const target = `${name}Props`;
    const expectedExports = JSON.parse(readFileSync(resolve(bench, 'goldens', `${name}.json`), 'utf8')).publicExports;
    if (!Array.isArray(expectedExports)) fail('Missing frozen public export manifest');
    if (name === 'cellDecoration') {
      for (const entry of expectedExports) {
        if (!entry.typeOnly || !ast.statements.some(node => ts.isExportDeclaration(node) && node.isTypeOnly && node.moduleSpecifier?.text === './cellDecoration.js' && node.exportClause?.elements?.some(e => e.name.text === entry.name))) fail(`Helper export changed: ${entry.name}`);
      }
      typecheck([file, resolve(src, 'cellDecoration.ts')]);
      return 'Decoration types retain their pure-helper barrel path; data resolver and template consumer type-check';
    }
    if (!expectedExports.length) {
      temporary ??= mkdtempSync(resolve(bench, '.tmp-check-'));
      const probe = resolve(temporary, 'private.ts');
      writeFileSync(probe, `import Component, { type ${target} } from '../../src/${name === 'cellDecoration' ? 'CellDecorationIcon' : name}.vue';\nconst component: object | Function = Component;\ntype Props = ${target};\nvoid component;\n`);
      typecheck([probe]);
      return 'Internal component; direct default export and Props resolve (no public barrel exports in reference)';
    }
    if (![name, target].every(n => expectedExports.some(e => e.name === n))) fail('Missing frozen public export manifest');
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
      const relocations = {
        Flex: { spacingToken: './spacing.js', alignValue: './flex-layout.js', justifyValue: './flex-layout.js' },
        Grid: { gridTemplateColumns: './grid-layout.js' },
        Col: { spanBasis: './col-layout.js', offsetMargin: './col-layout.js' },
        PanelStack: { PANEL_STACK_MAX_SECTIONS: './panel-stack-context.js' },
        IdentityMenu: { identityInitial: './identity-initial.js' },
        Header: { deriveInitials: './header-initials.js' },
        Icon: { ICONS: './icon-data.js', ICON_NAMES: './icon-data.js' },
        Popper: { computePosition: './popper-position.js', splitPlacement: './popper-position.js', joinPlacement: './popper-position.js' },
        SelectableRow: { SELECTABLE_LIST_KEY: './selectable-list-context.js' },
      };
      const expected = relocations[name]?.[exported] ?? (existsSync(file) ? `./${name}.vue` : `./${name}.js`);
      if (entry.specifier !== expected) fail(`${exported} routes to ${entry.specifier}, expected ${expected}`);
      if (entry.type !== typeOnly) fail(`${exported} changed value/type export kind`);
    }
    temporary ??= mkdtempSync(resolve(bench, '.tmp-check-'));
    const barrel = resolve(temporary, 'public.ts');
    // Preserve every export in the selected declarations, including auxiliary
    // types, but exclude unrelated components from this file-scoped gate.
    writeFileSync(barrel, exports.map(node => node.getText(ast).replace(/(["'])\.\//g, '$1../../src/' + (['RichTextEditor', 'ComposerEditor'].includes(name) ? 'rich-text-editor/' : name === 'LockPresenceBadge' ? 'presence-badge/' : ''))).join('\n'));
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
