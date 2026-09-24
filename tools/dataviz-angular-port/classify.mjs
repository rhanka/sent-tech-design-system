// Run the extractor over every adapter this package has not ported yet and
// report what it can read. The number of generatable adapters must come from the
// tool that will generate them, not from a looser heuristic.
//
//   node tools/dataviz-angular-port/classify.mjs
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract } from './extract.mjs';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

function components(barrel) {
  const src = readFileSync(ROOT + barrel, 'utf8');
  const out = new Map();
  // Any `./lib/...` path, not just `./lib/X.js`: `UrlSync` is exported as
  // `export { default as UrlSync } from './lib/UrlSync.svelte'` and is a component.
  // ALL_CAPS names are the two exported constants, not components.
  for (const m of src.matchAll(/^export (?:\{([^}]+)\}|type \{[^}]+\}) from '\.\/lib\/([\w.-]+)';$/gm)) {
    if (!m[1]) continue;
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/).pop().trim();
      if (!name || !/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) continue;
      out.set(name, m[2].replace(/\.(js|svelte|ts)$/, ''));
    }
  }
  return out;
}

const svelte = components('/packages/dataviz-svelte/src/index.ts');
const react = components('/packages/dataviz-react/src/index.ts');
const vue = components('/packages/dataviz-vue/src/index.ts');
const ported = new Set(components('/packages/dataviz-angular/src/index.ts').keys());

const union = new Map([...svelte, ...react, ...vue]);
const pending = [...union.keys()].filter((name) => !ported.has(name)).sort();

const ok = [];
const skipped = [];
for (const name of pending) {
  try {
    const d = extract(union.get(name));
    ok.push({ name, kind: d.derive.kind, ds: d.ds.name });
  } catch (error) {
    const reason = error.message.startsWith('ENOENT')
      ? 'no dataviz-vue source (this component exists in one framework only)'
      : error.message.replace(name + ': ', '').replace(union.get(name) + ': ', '');
    skipped.push({ name, reason });
  }
}

console.log(`union of the three reference barrels: ${union.size}`);
console.log(`already ported in dataviz-angular:    ${ported.size}`);
console.log(`pending:                              ${pending.length}`);
console.log(`  the extractor reads:                ${ok.length}`);
console.log(`  it refuses (hand-write these):      ${skipped.length}`);

const byReason = new Map();
for (const s of skipped) byReason.set(s.reason, (byReason.get(s.reason) ?? 0) + 1);
console.log('\nrefusal reasons:');
for (const [reason, n] of [...byReason].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${reason}`);

if (process.argv.includes('--names')) {
  console.log('\nreadable:\n  ' + ok.map((o) => o.name).join(', '));
  console.log('\nrefused:\n  ' + skipped.map((s) => s.name).join(', '));
}
