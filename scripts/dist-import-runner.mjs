import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const { name, lane, angular } = JSON.parse(readFileSync('target.json', 'utf8'));
const directory = join('node_modules', name);
const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
if (angular) await import('@angular/compiler');
if (lane === 'vapor') {
  Object.assign(globalThis, { __VUE_OPTIONS_API__: true, __VUE_PROD_DEVTOOLS__: false, __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false });
  const vue = await import('vue');
  if (typeof vue.defineVaporComponent !== 'function') throw new Error(`Vue ${vue.version} lacks the Vapor runtime`);
}

function target(value) {
  if (typeof value === 'string' || value === null) return value;
  if (Array.isArray(value)) return target(value[0]);
  for (const [condition, child] of Object.entries(value)) {
    if (['node', 'import', 'default'].includes(condition)) return target(child);
  }
  return null;
}
function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(directory, entry.name), prefix + entry.name + '/') : [prefix + entry.name]);
}
const exportsMap = typeof manifest.exports === 'object' && Object.keys(manifest.exports).some(key => key.startsWith('.'))
  ? manifest.exports : { '.': manifest.exports ?? manifest.main };
let imports = 0, assets = 0;
for (const [key, value] of Object.entries(exportsMap)) {
  const path = target(value);
  if (!path) continue;
  const entries = key.includes('*') ? files(directory).filter(file => {
    const [start, end] = path.slice(2).split('*');
    return file.startsWith(start) && file.endsWith(end);
  }).map(file => {
    const [start, end] = path.slice(2).split('*');
    return key.replace('*', file.slice(start.length, end.length ? -end.length : undefined));
  }) : [key];
  if (!entries.length) throw new Error(`Empty public export pattern: ${name}${key}`);
  for (const entry of entries) {
    if (lane === 'node' && entry.startsWith('./vapor')) continue; // exercised in the Vapor lane
    const specifier = name + (entry === '.' ? '' : entry.slice(1));
    const resolved = import.meta.resolve(specifier);
    if (/\.(?:js|mjs|cjs|svelte)$/.test(resolved)) {
      await import(specifier);
      imports++;
    } else if (resolved.endsWith('.json')) {
      await import(specifier, { with: { type: 'json' } });
      assets++;
    } else {
      readFileSync(new URL(resolved));
      assets++;
    }
    console.log(`OK ${lane} ${specifier}`);
  }
}
if (!imports) throw new Error(`No runtime entry points tested for ${name}`);
console.log(`OK ${name}: ${imports} imports, ${assets} public assets (${lane}; Svelte SSR/CSS adapters when needed)`);
