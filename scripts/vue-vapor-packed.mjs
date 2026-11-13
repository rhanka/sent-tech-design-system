// Real installations outside the workspace; Vite builds and Vitest/jsdom only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'ds-vue-packed-'));
function run(command, args, cwd = temp) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: process.env, maxBuffer: 16 * 1024 * 1024 });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const manifests = new Map(readdirSync(join(root, 'packages')).flatMap(dir => {
  try { const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'))); return [[manifest.name, { dir, manifest }]]; }
  catch { return []; }
}));
const tarballs = {};
function pack(name) {
  if (tarballs[name]) return;
  const { dir, manifest } = manifests.get(name);
  const output = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], join(root, 'packages', dir)));
  tarballs[name] = join(temp, output[0].filename);
  for (const dependency of Object.keys(manifest.dependencies ?? {})) if (manifests.has(dependency)) pack(dependency);
}
try {
  pack('@sentropic/design-system-vue'); pack('@sentropic/dataviz-vue');
  const fixture = join(root, 'scripts/fixtures/vue-packed');
  for (const [mode, version] of [['classic', '3.5.45'], ['vapor', '3.6.0-rc.15']]) {
    const cwd = join(temp, mode); cpSync(fixture, cwd, { recursive: true });
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module',
      dependencies: { ...tarballs, vue: version, '@vue/server-renderer': version, '@vue/compiler-sfc': version },
      devDependencies: { vite: '8.0.16', vitest: '4.1.11', typescript: '5.9.3', jsdom: '27.2.0' },
      overrides: { vue: version },
    }, null, 2));
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], cwd);
    const env = { ...process.env, VUE_PACKED_MODE: mode };
    for (const args of [['node', ['verify.mjs']], ['npx', ['--no-install', 'vitest', 'run']]]) {
      const result = spawnSync(args[0], args[1], { cwd, encoding: 'utf8', env, maxBuffer: 16 * 1024 * 1024 });
      assert.equal(result.status, 0, `${mode}: ${args[0]}\n${result.stdout}\n${result.stderr}`);
      process.stdout.write(result.stdout);
    }
    // Exercise the separately built 3.5 compiler output from the installed pack.
    if (mode === 'classic') {
      for (const name of ['@sentropic/design-system-vue', '@sentropic/dataviz-vue']) {
        const dist = join(cwd, 'node_modules', name, 'dist');
        cpSync(join(dist, 'classic-3.5'), dist, { recursive: true });
      }
      console.log('Classic 3.5 compiler output:');
      const result = spawnSync('npx', ['--no-install', 'vitest', 'run'], { cwd, encoding: 'utf8', env });
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`); process.stdout.write(result.stdout);
    }
  }
} finally { rmSync(temp, { recursive: true, force: true }); }
