// Extract an Angular-adapter descriptor from a dataviz-vue adapter source.
// It handles only the shapes the lot 2 families actually use and throws on
// anything else, so a component it cannot read gets written by hand instead of
// emitted wrongly.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const VUE = ROOT + '/packages/dataviz-vue/src/lib';
const NGDS = ROOT + '/packages/components-angular/src';

const kebab = (n) =>
  n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

function dsSelector(component) {
  const src = readFileSync(NGDS + '/' + component + '.ts', 'utf8');
  const m = /selector:\s*"([^"]+)"/.exec(src);
  if (!m) throw new Error(component + ': no selector in components-angular');
  return m[1];
}

function propTypes(src, name) {
  const start = src.indexOf('export type ' + name + 'Props = {');
  if (start < 0) throw new Error(name + ': no Props type alias');
  const block = src.slice(start, src.indexOf('\n};', start));
  const out = new Map();
  for (const m of block.matchAll(/^\s{2}(?:\/\*\*[\s\S]*?\*\/\s*)?([A-Za-z_$][\w$]*)(\?)?:\s*([^;]+);/gm)) {
    out.set(m[1], { optional: Boolean(m[2]), tsType: m[3].trim() });
  }
  return out;
}

function propRuntime(src) {
  const start = src.indexOf('  props: {');
  const block = src.slice(start, src.indexOf('  setup(props)', start));
  const out = new Map();
  for (const m of block.matchAll(/^\s{4}([A-Za-z_$][\w$]*)\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gm)) {
    const required = /required:\s*true/.test(m[2]);
    const def = /default:\s*([^,}]+)/.exec(m[2]);
    let dflt = def ? def[1].trim() : undefined;
    if (dflt === 'undefined') dflt = undefined;
    out.set(m[1], { required, default: dflt });
  }
  return out;
}

function setupBody(src) {
  const marker = '      void state.value;';
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('no `void state.value` marker');
  return src.slice(i + marker.length, src.lastIndexOf('return h('));
}

function hBindings(src) {
  const i = src.lastIndexOf('return h(');
  const m = /return h\(\s*([A-Za-z_$][\w$]*)\s*,\s*\{([\s\S]*)$/.exec(src.slice(i));
  if (!m) throw new Error('no trailing h() call');
  const bindings = [];
  for (const line of m[2].split('\n')) {
    const kv = /^\s{8}([A-Za-z_$][\w$]*):\s*(.+?),?\s*$/.exec(line);
    if (kv) {
      bindings.push([kv[1], kv[2].replace(/\s+as\s+[\w[\]<>.| ]+$/, '').replace(/,$/, '').trim()]);
      continue;
    }
    const shorthand = /^\s{8}([A-Za-z_$][\w$]*),\s*$/.exec(line);
    if (shorthand) bindings.push([shorthand[1], shorthand[1]]);
  }
  return bindings;
}

function configMap(text) {
  const pairs = [...text.matchAll(/([A-Za-z_$][\w$]*):\s*props\.([A-Za-z_$][\w$]*)/g)];
  return Object.fromEntries(pairs.map((m) => [m[1], m[2]]));
}

function extract(name) {
  const src = readFileSync(VUE + '/' + name + '.ts', 'utf8');
  const types = propTypes(src, name);
  const runtime = propRuntime(src);

  const dsImport = /import \{\s*([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?[^}]*\} from '@sentropic\/design-system-vue';/.exec(src);
  if (!dsImport) throw new Error(name + ': no design-system-vue import');
  const dsName = dsImport[1];

  const body = setupBody(src);
  const bindings = hBindings(src);

  const wrapped = /const (\w+) = (\w+)\(\s*\n?\s*(\w+)\(props\.store\.model, props\.store\.applyCrossfilter\(props\.viewId\), \{([\s\S]*?)\}\),?\s*\)/.exec(body);
  const modelRows = /const (\w+) = (\w+)\(\s*props\.store\.model,\s*props\.store\.applyCrossfilter\(props\.viewId\),\s*\{([\s\S]*?)\},?\s*\)/.exec(body);
  const storeLayer = /const (\w+) = (\w+)\(props\.store, props\.viewId, \{([\s\S]*?)\}\)/.exec(body);

  let derive;
  if (wrapped) {
    derive = { kind: 'model-rows', field: wrapped[1], wrap: wrapped[2], builder: wrapped[3], config: configMap(wrapped[4]) };
  } else if (modelRows) {
    derive = { kind: 'model-rows', field: modelRows[1], wrap: null, builder: modelRows[2], config: configMap(modelRows[3]) };
  } else if (storeLayer) {
    derive = { kind: 'store-layer', field: storeLayer[1], wrap: null, builder: storeLayer[2], config: configMap(storeLayer[3]) };
  } else {
    throw new Error(name + ': setup body matches no supported shape');
  }

  const wrapPattern = new RegExp('^([A-Za-z_$][\\w$]*)\\(' + derive.field + '\\)$');
  const arrayPattern = new RegExp('^\\[' + derive.field + '\\]$');
  let classExpr = null;
  const folded = [];
  for (const pair of bindings) {
    const key = pair[0];
    const expr = pair[1];
    const mapped = /^mapClass\('([^']+)', props\.class\)$/.exec(expr);
    if (key === 'class' && mapped) {
      classExpr = { helper: 'mapClass', base: mapped[1] };
      folded.push([key, 'classInput']);
      continue;
    }
    if (arrayPattern.test(expr)) {
      derive.asArray = true;
      folded.push([key, derive.field]);
      continue;
    }
    const hit = wrapPattern.exec(expr);
    if (hit) {
      if (derive.wrap) throw new Error(name + ': two wrapping calls');
      derive.wrap = hit[1];
      folded.push([key, derive.field]);
      continue;
    }
    folded.push([key, expr]);
  }
  if (!folded.some((pair) => pair[1] === derive.field)) {
    throw new Error(name + ": no binding consumes the derived '" + derive.field + "'");
  }

  const helperPairs = [...src.matchAll(/import \{([^}]+)\} from '\.\/(\w+)\.js';/g)];
  const helpers = Object.fromEntries(
    helperPairs.map((m) => ['./' + m[2] + '.js', m[1].split(',').map((s) => s.trim()).filter(Boolean)]),
  );
  const coreImports = [...src.matchAll(/import (?:type )?\{([^}]+)\} from '@sentropic\/dataviz-core';/g)]
    .flatMap((m) => m[1].split(','))
    .map((s) => s.trim())
    .filter(Boolean);
  const coreFns = coreImports.filter((s) => !s.startsWith('type ') && /^[a-z]/.test(s));
  const coreTypes = coreImports.filter((s) => s.startsWith('type ')).map((s) => s.slice(5).trim());
  const dsTypeImports = [...src.matchAll(/import \{([^}]+)\} from '@sentropic\/design-system-vue';/g)]
    .flatMap((m) => m[1].split(','))
    .map((s) => s.trim())
    .filter((s) => s.startsWith('type '))
    .map((s) => s.slice(5).split(/\s+as\s+/)[0].trim());

  return {
    name,
    selector: 'st-dataviz-' + kebab(name),
    ds: { name: dsName, alias: 'Ds' + dsName, selector: dsSelector(dsName), typeImports: dsTypeImports },
    props: [...types].map((pair) => ({
      name: pair[0],
      tsType: pair[1].tsType,
      optional: pair[1].optional,
      required: runtime.get(pair[0]) ? runtime.get(pair[0]).required : false,
      default: runtime.get(pair[0]) ? runtime.get(pair[0]).default : undefined,
    })),
    derive,
    classExpr,
    bindings: folded.map((pair) => ({ input: pair[0], expr: pair[1] })),
    helpers,
    coreFns,
    coreTypes,
  };
}

const names = process.argv.slice(2);
const out = [];
for (const n of names) {
  try {
    out.push(extract(n));
  } catch (e) {
    console.error('SKIP ' + n + ': ' + e.message);
  }
}
writeFileSync(ROOT + '/tools/dataviz-angular-port/descriptors.json', JSON.stringify(out, null, 1) + '\n');
console.log('extracted ' + out.length + '/' + names.length);
for (const d of out) {
  const b = d.derive.wrap ? d.derive.wrap + '(' + d.derive.builder + ')' : d.derive.builder;
  console.log(
    d.name.padEnd(24) + ' ' + d.ds.selector.padEnd(30) + ' ' + d.derive.kind.padEnd(11) + ' ' +
    b.padEnd(42) + ' props=' + String(d.props.length).padStart(2) +
    ' cfg=' + Object.keys(d.derive.config).length + ' binds=' + d.bindings.length +
    (d.classExpr ? ' class=' + d.classExpr.base : '') + (d.derive.asArray ? ' [array]' : ''),
  );
}
