import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { inventory, renderCalls, files, sfcSafety, moduleCounters } from './vue-vapor-source.mjs';
import { checkTextFiles } from './dataviz-vue-text.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = 'scripts/vue-vapor-legacy.json';
const allowed = JSON.parse(readFileSync(resolve(root, baselinePath), 'utf8'));
const current = inventory(root).flatMap(pkg => pkg.legacy.map(file => relative(root, file))).sort();
const errors = current.filter(file => !allowed.includes(file)).map(file => `K25: new render-function module: ${file}`);
errors.push(...checkTextFiles([resolve(root, 'packages/dataviz-vue/src')]));
errors.push(...allowed.filter(file => !current.includes(file)).map(file => `K25: remove converted/deleted file from allow-list: ${file}`));
// SFCs are never grandfathered. Inspect script blocks, not template text.
for (const pkg of ['components-vue', 'dataviz-vue']) for (const file of files(resolve(root, 'packages', pkg, 'src')).filter(file => file.endsWith('.vue'))) {
  errors.push(...sfcSafety(readFileSync(file, 'utf8'), file).map(error => `K25: ${relative(root, file)}: ${error}`));
  for (const match of readFileSync(file, 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (renderCalls(match[1]).length) errors.push(`K25: render functions inside SFC: ${relative(root, file)}`);
  }
}
for (const pkg of ['components-vue', 'dataviz-vue']) for (const file of files(resolve(root, 'packages', pkg, 'src')).filter(file => file.endsWith('.ts') && !/\.test\.|\.d\.ts$|test-support|fixtures/.test(file) && !allowed.includes(relative(root, file)))) {
  errors.push(...moduleCounters(readFileSync(file, 'utf8'), file).map(error => `K25: ${relative(root, file)}: ${error}`));
}
const base = process.argv.find(arg => arg.startsWith('--base='))?.slice(7);
if (base) {
  const previous = JSON.parse(execFileSync('git', ['show', `${base}:${baselinePath}`], { cwd: root, encoding: 'utf8' }));
  errors.push(...allowed.filter(file => !previous.includes(file)).map(file => `K25: allow-list may only shrink: ${file}`));
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`K25: pass (${current.length} existing modules; allow-list must shrink on conversion)`);
