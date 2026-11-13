// Keep the package's per-module TypeScript output and add template SFC modules.
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

// Both modes use the pinned latest-line runtime/compiler. Vapor is the primary diagram entry.
const require = createRequire(import.meta.url);
const classic = require('vue/compiler-sfc');
const vapor = require('@vue/compiler-sfc');
for (const compiler of [classic, vapor]) compiler.registerTS(() => ts);
const compiled = [];
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
for (const file of files('src').filter(file => file.endsWith('.vue'))) {
  const source = readFileSync(file, 'utf8');
  for (const [compiler, mode] of [[classic, 'classic'], [vapor, 'vapor']]) {
    const { descriptor, errors } = compiler.parse(mode === 'vapor'
      ? source.replace(/^(<script\b[^>]*\bsetup\b)(?![^>]*\bvapor\b)/m, '$1 vapor') : source, { filename: resolve(file) });
    if (errors.length) throw errors[0];
    const script = compiler.compileScript(descriptor, { id: relative('src', file), inlineTemplate: true,
      fs: { fileExists: existsSync, readFile: path => existsSync(path) ? readFileSync(path, 'utf8') : undefined },
    });
    const target = join(mode === 'vapor' ? 'dist/vapor' : 'dist', relative('src', file) + '.js');
    mkdirSync(dirname(target), { recursive: true });
    let output = ts.transpileModule(script.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    // SFC children are compiled in this mode; composables and pure TS stay shared.
    if (mode === 'vapor') output = output.replace(/(from\s+)(["'])(\.[^"']+)(\2)/g,
      (match, prefix, quote, specifier) => {
        if (specifier.endsWith('.vue')) return match;
        const shared = join('dist', relative('src', dirname(file)), specifier);
        const path = relative(dirname(target), shared);
        return `${prefix}${quote}${path.startsWith('.') ? path : './' + path}${quote}`;
      });
    writeFileSync(target, output);
    if (mode === 'vapor') {
      const classicPath = relative(dirname(target), join('dist', relative('src', file) + '.js'));
      const adapterPath = relative(dirname(target), 'dist/vapor/sfc.js');
      const specifier = path => path.startsWith('.') ? path : './' + path;
      writeFileSync(target.replace(/\.js$/, '.d.ts'),
        `import type Classic from '${specifier(classicPath)}';\n`
        + `import type { VaporSfc } from '${specifier(adapterPath)}';\n`
        + `declare const component: VaporSfc<typeof Classic>;\nexport default component;\n`
        + `export type * from '${specifier(classicPath)}';\n`);
    }
    compiled.push(target);
  }
}
const components = ['DiagramCard', 'DiagramZone', 'DiagramSceneFigure', 'ForceGraph', 'GraphLegend', 'GraphCanvas'];
writeFileSync('dist/vapor/sfc.d.ts', readFileSync(new URL('./vapor-sfc.d.ts', import.meta.url), 'utf8'));
writeFileSync('dist/vapor/index.js', components.map(name => `export { default as ${name} } from './${name}.vue.js';`).join('\n')
  + "\nexport { useGraphEngine } from '../useGraphEngine.js';\nexport { nodeShapePath, edgeDashArray } from '@sentropic/graph/presentation';\n");
writeFileSync('dist/vapor/index.d.ts', components.map(name =>
  `export { default as ${name} } from './${name}.vue.js';`).join('\n')
  + "\nexport { useGraphEngine } from '../useGraphEngine.js';\n"
  + "export { nodeShapePath, edgeDashArray } from '../index.js';\n"
  + "export type { DiagramIconProps } from '../diagram-icons/index.js';\n"
  + "export type { DiagramCardProps, DiagramZoneProps, DiagramSceneFigureProps, DiagramSceneFigureLabels, DiagramSceneCamera, ForceGraphProps, ForceGraphNode, ForceGraphEdge, ForceGraphNodeShape, ForceGraphLegendEntry, ForceGraphTone, ForceGraphEdgeDash, GraphLegendProps, GraphCanvasProps, CardDiagnostic, CardLineMeasure, DiagramCardToggle, DiagramGlyphPaths, DiagramZoneToggle, ZoneDiagnostic, ZoneChildSpec, SceneDocument, SceneOccurrenceRef, ScenePresentation, SceneView } from '../index.js';\n");
writeFileSync('dist/vapor/diagram-icons/index.js', "export { default, default as DiagramIcon } from './DiagramIcon.vue.js';\nexport * from '../../diagram-icons/registry.js';\n");
writeFileSync('dist/vapor/diagram-icons/index.d.ts', "export { default, default as DiagramIcon, type DiagramIconProps } from './DiagramIcon.vue.js';\nexport * from '../../diagram-icons/registry.js';\n");
mkdirSync('dist/vapor/bpmn', { recursive: true });
writeFileSync('dist/vapor/bpmn/index.js', "export { default, default as BpmnCanvas } from '../BpmnCanvas.vue.js';\n");
writeFileSync('dist/vapor/bpmn/index.d.ts', "export { default, default as BpmnCanvas, type BpmnCanvasProps } from '../BpmnCanvas.vue.js';\n");
// Node ESM and bundlers both resolve these published modules without an SFC loader.
for (const file of files('dist').filter(file => /\.(?:js|ts)$/.test(file))) {
  const source = readFileSync(file, 'utf8');
  writeFileSync(file, source.replace(/(from\s+["'][^"']+\.vue)(["'])/g, '$1.js$2'));
}
for (const file of compiled) {
  for (const [, specifier] of readFileSync(file, 'utf8').matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    if (!existsSync(resolve(dirname(file), specifier))) throw new Error(`${file}: missing emitted import ${specifier}`);
  }
}
