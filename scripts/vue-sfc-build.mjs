// Run from either Vue workspace after vue-tsc emits JS and declarations.
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, basename } from 'node:path';
import ts from 'typescript';
import { files, renderCalls, excluded } from './vue-vapor-source.mjs';

const require = createRequire(resolve('package.json'));
const stable = process.argv.includes('--stable');
const compiler = require('@vue/compiler-sfc');
const classic = stable ? require('vue-compiler-sfc-classic') : compiler;
for (const item of [compiler, classic]) item.registerTS(() => ts);
const out = stable ? 'dist/classic-3.5' : 'dist';
if (stable) {
  rmSync(out, { recursive: true, force: true });
  for (const file of files('dist').filter(file => !file.startsWith('dist/vapor/'))) {
    const target = join(out, relative('dist', file));
    mkdirSync(dirname(target), { recursive: true }); cpSync(file, target);
  }
} else {
  rmSync('dist/vapor', { recursive: true, force: true });
  rmSync('dist/classic-3.5', { recursive: true, force: true });
}

const specifier = path => path.startsWith('.') ? path : './' + path;
const sfcs = files('src').filter(file => file.endsWith('.vue') && !excluded.test(file));
for (const file of sfcs) {
  const source = readFileSync(file, 'utf8');
  for (const [engine, mode] of stable ? [[classic, 'classic']] : [[classic, 'classic'], [compiler, 'vapor']]) {
    const { descriptor, errors } = engine.parse(mode === 'vapor'
      ? source.replace(/^(<script\b[^>]*\bsetup\b)(?![^>]*\bvapor\b)/m, '$1 vapor') : source,
    { filename: resolve(file) });
    if (errors.length) throw errors[0];
    const script = engine.compileScript(descriptor, {
      id: relative('src', file), inlineTemplate: true,
      fs: { fileExists: existsSync, readFile: path => existsSync(path) ? readFileSync(path, 'utf8') : undefined },
    });
    const target = join(mode === 'vapor' ? 'dist/vapor' : out, relative('src', file) + '.js');
    mkdirSync(dirname(target), { recursive: true });
    let output = ts.transpileModule(script.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    if (mode === 'vapor') output = output.replace(/(from\s+)(["'])(\.[^"']+)(\2)/g,
      (match, prefix, quote, path) => path.endsWith('.vue') ? match :
        `${prefix}${quote}${specifier(relative(dirname(target), join('dist', relative('src', dirname(file)), path)))}${quote}`);
    writeFileSync(target, output);
    if (mode === 'vapor') {
      const classicPath = specifier(relative(dirname(target), join('dist', relative('src', file) + '.js')));
      const adapterPath = specifier(relative(dirname(target), 'dist/vapor/sfc.js'));
      writeFileSync(target.replace(/\.js$/, '.d.ts'),
        `import type Classic from '${classicPath}';\nimport type { VaporSfc } from '${adapterPath}';\n`
        + `declare const component: VaporSfc<typeof Classic>;\nexport default component;\nexport type * from '${classicPath}';\n`);
    }
  }
}

if (!stable) {
  mkdirSync('dist/vapor', { recursive: true });
  writeFileSync('dist/vapor/sfc.d.ts', readFileSync(new URL('../packages/components-vue/scripts/vapor-sfc.d.ts', import.meta.url), 'utf8'));
  // SFCs with legacy children (currently the menu cascade) are not native.
  function native(file, seen = new Set()) {
    if (seen.has(file)) return true;
    seen.add(file);
    if (!existsSync(file)) throw new Error(`Missing source dependency: ${file}`);
    const source = readFileSync(file, 'utf8');
    const code = file.endsWith('.vue') ? (() => {
      const { descriptor } = compiler.parse(source);
      return [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n');
    })() : source;
    if (renderCalls(code, file).length) return false;
    const ast = ts.createSourceFile(file + '.ts', code, ts.ScriptTarget.Latest, true);
    for (const node of ast.statements) {
      if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) || !node.moduleSpecifier) continue;
      if (node.isTypeOnly || node.importClause?.isTypeOnly) continue;
      const bindings = node.importClause?.namedBindings ?? node.exportClause;
      if (bindings?.elements?.length && bindings.elements.every(item => item.isTypeOnly)) continue;
      const path = node.moduleSpecifier.text;
      if (path === 'lucide-vue-next' || path === '@sentropic/design-system-vue') return false;
      if (path.startsWith('.')) {
        const dependency = resolve(dirname(file), path.replace(/\.js$/, '.ts'));
        if (!native(dependency, seen)) return false;
        if (!file.endsWith('.vue') && dependency.endsWith('.vue')) return false;
      }
    }
    return true;
  }
  const index = ts.createSourceFile('index.ts', readFileSync('src/index.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  const entries = [];
  for (const node of index.statements.filter(ts.isExportDeclaration)) {
    if (!node.moduleSpecifier) continue;
    const path = node.moduleSpecifier.text;
    const shared = path.startsWith('.') ? '../' + path.slice(2) : path;
    if (node.isTypeOnly) { entries.push(node.getText(index).replace(path, shared)); continue; }
    const component = resolve('src', path.replace(/\.(?:js|vue)$/, '.vue'));
    if (path.startsWith('.') && existsSync(component)) {
      if (!native(component)) {
        if (basename(resolve('.')) === 'components-vue') throw new Error(`Native Vapor export is blocked by a legacy dependency: ${component}`);
        continue;
      }
      const name = basename(component, '.vue');
      for (const item of node.exportClause?.elements ?? []) {
        if (item.isTypeOnly) continue;
        if ((item.propertyName ?? item.name).text === 'default' || (item.propertyName ?? item.name).text === name)
          entries.push(`export { default as ${item.name.text} } from '${specifier(relative(resolve('src'), component))}.js';`);
      }
    } else if (!path.startsWith('.') || native(resolve('src', path.replace(/\.js$/, '.ts')))) {
      entries.push(node.getText(index).replace(path, shared));
    }
  }
  // These pure helpers share a compatibility wrapper with ForceGraph.
  if (sfcs.some(file => file.endsWith('/ForceGraph.vue')))
    entries.push("export { nodeShapePath, edgeDashArray } from '@sentropic/graph/presentation';");
  const entry = entries.join('\n') + '\n';
  writeFileSync('dist/vapor/index.d.ts', entry);
  writeFileSync('dist/vapor/index.js', ts.transpileModule(entry, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText);
  if (existsSync('src/diagram-icons/DiagramIcon.vue')) {
    writeFileSync('dist/vapor/diagram-icons/index.js', "export { default, default as DiagramIcon } from './DiagramIcon.vue.js';\nexport * from '../../diagram-icons/registry.js';\n");
    writeFileSync('dist/vapor/diagram-icons/index.d.ts', "export { default, default as DiagramIcon, type DiagramIconProps } from './DiagramIcon.vue.js';\nexport * from '../../diagram-icons/registry.js';\n");
  }
  if (existsSync('src/BpmnCanvas.vue')) {
    mkdirSync('dist/vapor/bpmn', { recursive: true });
    writeFileSync('dist/vapor/bpmn/index.js', "export { default, default as BpmnCanvas } from '../BpmnCanvas.vue.js';\n");
    writeFileSync('dist/vapor/bpmn/index.d.ts', "export { default, default as BpmnCanvas, type BpmnCanvasProps } from '../BpmnCanvas.vue.js';\n");
  }
}
for (const file of files(stable ? out : 'dist').filter(file => /\.(?:js|ts)$/.test(file))) {
  const source = readFileSync(file, 'utf8');
  writeFileSync(file, source.replace(/(from\s+["'][^"']+\.vue)(["'])/g, '$1.js$2'));
}
console.log(`${basename(resolve('.'))}: ${sfcs.length} SFCs compiled (${stable ? 'classic compiler ' + classic.version : 'classic + Vapor ' + compiler.version})`);
