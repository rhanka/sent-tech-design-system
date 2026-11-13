import { createRequire, registerHooks } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export const bench = dirname(fileURLToPath(import.meta.url));
export const pkg = resolve(bench, '..');
export const src = resolve(pkg, 'src');
export const names = readdirSync(resolve(bench, 'fixtures')).filter(f => f.endsWith('.fixtures.ts')).map(f => f.replace('.fixtures.ts', '')).sort();
export const require = createRequire(resolve(pkg, 'package.json'));
export const compilers = { classic: require('vue/compiler-sfc'), vapor: require('@vue/compiler-sfc') };
for (const compiler of Object.values(compilers)) compiler.registerTS(() => ts);

// The parse, Vapor injection, compileScript and transpile options below mirror
// scripts/build-sfc.mjs. In-memory modules avoid dist writes or stale artifacts.
export function compileSfc(source, filename, mode) {
  const compiler = compilers[mode];
  const { descriptor, errors } = compiler.parse(mode === 'vapor'
    ? source.replace(/^(<script\b[^>]*\bsetup\b)(?![^>]*\bvapor\b)/m, '$1 vapor') : source,
  { filename: resolve(filename) });
  if (errors.length) throw errors[0];
  const script = compiler.compileScript(descriptor, {
    id: relative(src, filename), inlineTemplate: true,
    fs: { fileExists: existsSync, readFile: path => existsSync(path) ? readFileSync(path, 'utf8') : undefined },
  });
  const output = ts.transpileModule(script.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  });
  const errorsTs = output.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) ?? [];
  if (errorsTs.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errorsTs, {
    getCanonicalFileName: f => f, getCurrentDirectory: () => pkg, getNewLine: () => '\n',
  }));
  return output.outputText;
}

export function installSourceLoader(mode) {
  // Node's default Vue CJS entry omits createVaporApp. Use the official complete
  // ESM runtime for G5; no VDOM interop plugin is installed. All imports share it.
  const vaporRuntime = pathToFileURL(require.resolve('vue/dist/vue.runtime-with-vapor.esm-browser.js')).href;
  return registerHooks({
    resolve(specifier, context, next) {
      if (mode === 'vapor' && specifier === 'vue') return { url: vaporRuntime, shortCircuit: true };
      if (context.parentURL && (specifier.startsWith('.') || specifier.startsWith('file:'))) {
        const url = new URL(specifier, context.parentURL);
        if (url.protocol === 'file:' && url.pathname.endsWith('.js')) {
          const file = fileURLToPath(url);
          if (!existsSync(file) && existsSync(file.slice(0, -3) + '.ts')) {
            return { url: pathToFileURL(file.slice(0, -3) + '.ts').href, shortCircuit: true };
          }
        }
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (url.startsWith('file:')) {
        const file = fileURLToPath(url);
        const extension = extname(file);
        if (extension === '.vue' || extension === '.ts') {
          const source = readFileSync(file, 'utf8');
          return { format: 'module', shortCircuit: true, source: extension === '.vue'
            ? compileSfc(source, file, mode)
            : ts.transpileModule(source, { compilerOptions: {
              target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
            } }).outputText };
        }
      }
      return next(url, context);
    },
  });
}

export function wrapperSource(name, fixture, legacy = false) {
  const componentFile = name === 'cellDecoration'
    ? legacy ? resolve(bench, 'cellDecoration-reference.ts') : resolve(src, 'CellDecorationIcon.vue')
    : resolve(src, name + (legacy ? '.ts' : '.vue'));
  const slots = Object.entries(fixture.slots ?? {}).map(([name, value]) => {
    const { html, scope } = typeof value === 'string' ? { html: value, scope: '' } : value;
    return `<template #${name}${scope ? `="${scope}"` : ''}>${html}</template>`;
  }).join('');
  return `<script setup lang="ts">\n`
    + (legacy ? `import { ${name} as Target }` : 'import Target') + ` from '${pathToFileURL(componentFile).href}';\n`
    + `import fixtures from '${pathToFileURL(resolve(bench, 'fixtures', `${name}.fixtures.ts`)).href}';\n`
    + `const fixture = fixtures.find(f => f.id === ${JSON.stringify(fixture.id)})!;\n`
    + `const props = ${legacy ? '{ ...fixture.props, ...fixture.legacyProps }' : 'fixture.props'};\n`
    + `</script>\n<template><Target v-bind="props">${slots}</Target></template>`;
}

export function normalizeHtml(html, JSDOM) {
  const fragment = JSDOM.fragment(html);
  const idMap = new Map();
  const generated = /\bst-(?:input|select|checkbox|tabs|tooltip|navSection|appChrome-drawer|appHeader-drawer|tileGroup|collapsible)-(?:\d+|v-\d+(?:-\d+)*)\b/g;
  const mask = value => value.replace(generated, id => {
    if (!idMap.has(id)) idMap.set(id, `generated-${idMap.size + 1}`);
    return idMap.get(id);
  });
  const escapeText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const visit = node => {
    if (node.nodeType === 3) return escapeText(node.data.replace(/\s+/g, ' '));
    if (node.nodeType === 8) return ['', '[', ']', 'v-if'].includes(node.data.trim()) ? '' : `<!--${node.data}-->`;
    if (node.nodeType !== 1) return children(node);
    const attrs = [...node.attributes].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
      .map(a => ` ${a.name}="${escapeText(a.name === 'id' || a.name === 'for' || a.name.startsWith('aria-')
        || (a.name === 'name' && /^st-tileGroup-(?:\d+|v-\d+(?:-\d+)*)$/.test(a.value))
        ? mask(a.value) : a.value).replace(/"/g, '&quot;')}"`).join('');
    const tag = node.localName;
    return `<${tag}${attrs}>` + (voidTags.has(tag) ? '' : `${children(node.content ?? node)}</${tag}>`);
  };
  // Ignore indentation-only text nodes; retain spaces inside meaningful text.
  const children = node => [...node.childNodes].filter(n => n.nodeType !== 3 || n.data.trim()).map(visit).join('');
  return children(fragment);
}
