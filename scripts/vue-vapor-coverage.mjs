import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packages, excluded, files } from './vue-vapor-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trimEnd();
// Keep the original indicator's counting rule, including its integer percentage.
// This is source conversion progress, NOT §2.9 behavioural/contract coverage.
const rows = packages.map(name => {
  const prefix = `packages/${name}/src`;
  const sources = (ref ? git(['ls-tree', '-r', '--name-only', ref, prefix]).split('\n') :
    files(resolve(root, prefix)).map(file => relative(root, file))).filter(file => !excluded.test(file));
  const sfc = sources.filter(file => file.endsWith('.vue')).length;
  const legacy = sources.filter(file => file.endsWith('.ts') && /defineComponent\(|[^a-zA-Z_.]h\(/.test(
    ref ? git(['show', `${ref}:${file}`]) : readFileSync(resolve(root, file), 'utf8'))).length;
  return { package: name, sfc, legacy, total: sfc + legacy, percent: Math.floor(100 * sfc / (sfc + legacy) || 0) };
});
const sfc = rows.reduce((sum, row) => sum + row.sfc, 0), legacy = rows.reduce((sum, row) => sum + row.legacy, 0);
const total = { package: 'TOTAL', sfc, legacy, total: sfc + legacy, percent: Math.floor(100 * sfc / (sfc + legacy) || 0) };
const report = { schemaVersion: 1, metric: 'source-conversion', ref: ref ?? 'working-tree', commit: git(['rev-parse', ref ?? 'HEAD']), packages: rows, total };
const json = JSON.stringify(report, null, 2) + '\n';
const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9);
if (output) writeFileSync(output, json);
if (process.argv.includes('--json')) process.stdout.write(json);
else for (const row of [...rows, total]) console.log(`${row.package.padEnd(15)} Vapor-ready ${String(row.sfc).padStart(4)} / ${String(row.total).padStart(4)}  (${String(row.percent).padStart(3)} %)   still h(): ${row.legacy}`);
