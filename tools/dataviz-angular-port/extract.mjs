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
  // The local holding the dashboard signal is named by each adapter (`state`,
  // `storeState`, …), so anchor on the shape of the read, not on one name.
  const marker = /^\s*void \w+\.value;$/m.exec(src);
  if (!marker) throw new Error('no `void <state>.value` marker');
  return src.slice(src.indexOf(marker[0]) + marker[0].length, src.lastIndexOf('return h('));
}

function hBindings(src) {
  const i = src.lastIndexOf('return h(');
  const m = /return h\(\s*([A-Za-z_$][\w$]*)\s*,\s*\{([\s\S]*)$/.exec(src.slice(i));
  if (!m) throw new Error('no trailing h() call');
  const bindings = [];
  for (const line of m[2].split('\n')) {
    const kv = /^\s{8}([A-Za-z_$][\w$]*):\s*(.+?),?\s*$/.exec(line);
    if (kv) {
      // Vue casts at the h() call to satisfy its own overloads; Angular types the
      // input instead. The cast may be a named type or an object type literal.
      const stripped = kv[2].replace(/\s+as\s+(?:\{[^}]*\}|[\w[\]<>.| ]+)$/, '').replace(/,$/, '').trim();
      bindings.push([kv[1], stripped]);
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

export function extract(name) {
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
  // The inline call may be written on one line or spread over several.
  const inlineBinding = /^\s{8}(\w+): (\w+)\(\s*props\.store\.model,\s*props\.store\.applyCrossfilter\(props\.viewId\),\s*\{([\s\S]*?)\},?\s*\),$/m.exec(
    src.slice(src.lastIndexOf('return h(')),
  );

  let derive;
  if (wrapped) {
    derive = { kind: 'model-rows', field: wrapped[1], wrap: wrapped[2], builder: wrapped[3], config: configMap(wrapped[4]) };
  } else if (modelRows) {
    derive = { kind: 'model-rows', field: modelRows[1], wrap: null, builder: modelRows[2], config: configMap(modelRows[3]) };
  } else if (storeLayer) {
    derive = { kind: 'store-layer', field: storeLayer[1], wrap: null, builder: storeLayer[2], config: configMap(storeLayer[3]) };
  } else if (inlineBinding) {
    // The derivation can live inside an h() binding, with no `const` at all.
    derive = {
      kind: 'model-rows',
      field: inlineBinding[1],
      wrap: null,
      builder: inlineBinding[2],
      config: configMap(inlineBinding[3]),
      inlineBinding: true,
    };
  } else {
    throw new Error(name + ': setup body matches no supported shape');
  }

  // A second statement may map a member of the first: `const data = wrap(model.items)`.
  const memberStep = /const (\w+)(?::\s*[^=]+)? = (\w+)\((\w+)\.(\w+)\);/.exec(body);
  if (memberStep && memberStep[3] === derive.field && !derive.inlineBinding) {
    derive.intermediate = derive.field;
    derive.field = memberStep[1];
    derive.wrap = memberStep[2];
    derive.member = memberStep[4];
  }

  const ident = '[A-Za-z_$][\\w$]*';
  // A binding consumes the derived value as itself, as a member of it, or wrapped
  // in one call around either. Anything else is refused rather than guessed.
  const wrapPattern = new RegExp('^(' + ident + ')\\(' + derive.field + '(?:\\.(' + ident + '))?\\)$');
  const memberPattern = new RegExp('^' + derive.field + '\\.(' + ident + ')$');
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
    // With the inline shape the binding IS the builder call; it names the field.
    if (derive.inlineBinding && key === derive.field && expr.startsWith(derive.builder + '(')) {
      folded.push([key, derive.field]);
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
      if (hit[2]) {
        derive.intermediate = derive.field;
        derive.member = hit[2];
      }
      folded.push([key, derive.field]);
      continue;
    }
    const member = memberPattern.exec(expr);
    if (member) {
      if (derive.member && derive.member !== member[1]) {
        // Several inputs read different members of one derived model. Keep the
        // model itself and let each binding read its member.
        derive.multiMember = true;
      }
      derive.intermediate = derive.field;
      derive.member = member[1];
      folded.push([key, derive.field + '.' + member[1]]);
      continue;
    }
    folded.push([key, expr]);
  }
  if (derive.multiMember) {
    delete derive.member;
    if (derive.wrap) throw new Error(name + ': a wrapped model with several members consumed');
  } else {
    // A single member was folded into the descriptor, so the binding names the field.
    for (const pair of folded) {
      if (derive.member && pair[1] === derive.field + '.' + derive.member) pair[1] = derive.field;
    }
  }
  const consumes = derive.multiMember
    ? folded.some((pair) => pair[1].startsWith(derive.field + '.'))
    : folded.some((pair) => pair[1] === derive.field);
  if (!consumes) {
    throw new Error(name + ": no binding consumes the derived '" + derive.field + "'");
  }

  const helperPairs = [...src.matchAll(/import \{([^}]+)\} from '\.\/(\w+)\.js';/g)];
  const helpers = Object.fromEntries(
    helperPairs.map((m) => ['./' + m[2] + '.js', m[1].split(',').map((s) => s.trim()).filter(Boolean)]),
  );
  // `import type { A, B }` marks the whole clause as types; `import { type A, b }`
  // marks them one by one. Both spellings occur in the Vue sources.
  const coreFns = [];
  const coreTypes = [];
  for (const m of src.matchAll(/import (type )?\{([^}]+)\} from '@sentropic\/dataviz-core';/g)) {
    const clauseIsType = Boolean(m[1]);
    for (const raw of m[2].split(',')) {
      const item = raw.trim();
      if (!item) continue;
      if (clauseIsType || item.startsWith('type ')) coreTypes.push(item.replace(/^type\s+/, ''));
      else coreFns.push(item);
    }
  }
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const names = process.argv.slice(2);
  if (names.length === 0) {
    console.error(
      'usage: node tools/dataviz-angular-port/extract.mjs <ComponentName> [...]\n' +
        'Refusing to run with no names: it would overwrite descriptors.json with an\n' +
        'empty list, and that file is the artefact a review reads.',
    );
    process.exit(2);
  }
  const out = [];
  for (const n of names) {
    try {
      out.push(extract(n));
    } catch (e) {
      console.error('SKIP ' + n + ': ' + e.message);
    }
  }
  // Merge by name into the existing ledger: a lot extracts its own components
  // without discarding the descriptors of the lots already shipped.
  const target = ROOT + '/tools/dataviz-angular-port/descriptors.json';
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(target, 'utf8'));
  } catch {
    existing = [];
  }
  const merged = existing.map((d) => out.find((n) => n.name === d.name) ?? d);
  for (const fresh of out) {
    if (!merged.some((d) => d.name === fresh.name)) merged.push(fresh);
  }
  writeFileSync(target, JSON.stringify(merged, null, 1) + '\n');
  console.log('extracted ' + out.length + '/' + names.length + ', descriptors.json now holds ' + merged.length);
  for (const d of out) {
    const b = d.derive.wrap ? d.derive.wrap + '(' + d.derive.builder + ')' : d.derive.builder;
    console.log(
      d.name.padEnd(24) + ' ' + d.ds.selector.padEnd(30) + ' ' + d.derive.kind.padEnd(11) + ' ' +
      b.padEnd(42) + ' props=' + String(d.props.length).padStart(2) +
      ' cfg=' + Object.keys(d.derive.config).length + ' binds=' + d.bindings.length +
      (d.classExpr ? ' class=' + d.classExpr.base : '') + (d.derive.asArray ? ' [array]' : ''),
    );
  }

}
