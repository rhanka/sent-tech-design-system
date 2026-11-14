import { spawn } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { names, bench } from './lib.mjs';
import { resolve } from 'node:path';
const selected = process.argv.slice(2);
if (selected.some(name => !names.includes(name))) throw new Error('Unknown component');
const queue = selected.length ? [...new Set(selected)] : [...names];
const results = [];
const previous = selected.length && existsSync(resolve(bench, 'results/integration.json')) ? JSON.parse(readFileSync(resolve(bench, 'results/integration.json'), 'utf8')).filter(row => !selected.includes(row.component)) : [];

async function worker() {
  while (queue.length) {
    const name = queue.shift();
    const result = await new Promise((done, reject) => {
      const child = spawn(process.execPath, [resolve(bench, 'check.mjs'), name, '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '', stderr = '';
      child.stdout.on('data', data => stdout += data);
      child.stderr.on('data', data => stderr += data);
      child.on('error', reject);
      child.on('close', code => {
        try { done(JSON.parse(stdout)); }
        catch { reject(new Error(name + ': exit ' + code + '\n' + stdout + stderr)); }
      });
    });
    results.push(result);
    writeFileSync(resolve(bench, 'results/integration.json'), JSON.stringify([...previous, ...results].toSorted((a,b) => a.component.localeCompare(b.component)), null, 2) + '\n');
    console.log(name + ': ' + (result.ok ? 'PASS' : result.gates.filter(g => g.status !== 'PASS').map(g => g.gate).join(', ')));
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(results.filter(r => r.ok).length + '/' + results.length + ' passed');
process.exitCode = results.some(r => !r.ok) ? 1 : 0;
