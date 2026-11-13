// Real installations outside the workspace; Vite builds and Vitest/jsdom only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'ds-vue-packed-'));
const npmVersion = '10.9.9';
function run(command, args, cwd = temp) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: process.env, maxBuffer: 16 * 1024 * 1024 });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function npm(args, cwd = temp) {
  return run('npx', ['--yes', `npm@${npmVersion}`, ...args], cwd);
}
const manifests = new Map(readdirSync(join(root, 'packages')).flatMap(dir => {
  try { const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'))); return [[manifest.name, { dir, manifest }]]; }
  catch { return []; }
}));
const tarballs = {};
function pack(name) {
  if (tarballs[name]) return;
  const { dir, manifest } = manifests.get(name);
  const output = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temp], join(root, 'packages', dir)));
  tarballs[name] = pathToFileURL(join(temp, output[0].filename)).href;
  for (const dependency of Object.keys(manifest.dependencies ?? {})) if (manifests.has(dependency)) pack(dependency);
}
try {
  const realTemp = realpathSync(temp), realRoot = realpathSync(root);
  assert(realTemp !== realRoot && !realTemp.startsWith(realRoot + sep), 'TMPDIR must be outside the workspace');
  assert.equal(npm(['--version']).trim(), npmVersion);
  console.log(`Packed consumers: npm ${npmVersion}`);
  pack('@sentropic/design-system-vue'); pack('@sentropic/dataviz-vue');
  const fixture = join(root, 'scripts/fixtures/vue-packed');
  for (const [mode, version] of [['classic', '3.5.45'], ['vapor', '3.6.0-rc.15']]) {
    const cwd = join(temp, mode); mkdirSync(cwd);
    // Copy sources only: never inherit a fixture lockfile or node_modules.
    for (const file of ['verify.mjs', 'consumer.test.mjs', 'vitest.config.mjs']) cpSync(join(fixture, file), join(cwd, file));
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module',
      packageManager: `npm@${npmVersion}`,
      dependencies: { ...tarballs, vue: version, '@vue/server-renderer': version, '@vue/compiler-sfc': version },
      devDependencies: { vite: '8.0.16', vitest: '4.1.11', typescript: '5.9.3', jsdom: '27.2.0' },
      // npm 10 otherwise explores a newer Vite/devtools peer graph from Vitest
      // and crashes in Arborist's loadPeerSet (null edgesOut).
      overrides: { vue: version, vite: '$vite' },
    }, null, 2));
    npm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], cwd);
    for (const name of ['@tiptap/core', '@tiptap/markdown', 'yjs', 'y-protocols']) {
      assert(!existsSync(join(cwd, 'node_modules', name)), `Basic ${mode} consumer unexpectedly installed ${name}`);
    }
    // The root barrel must load before any editor peer is installed.
    run(process.execPath, ['--input-type=module', '-e', "const ds = await import('@sentropic/design-system-vue'); if (!ds.Button) throw new Error('Missing Button');"], cwd);
    console.log(`${mode}: root import without editor peers passed`);
    const richText = manifests.get('@sentropic/design-system-rich-text').manifest;
    npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', ...Object.keys(richText.peerDependencies).map(name => `${name}@${richText.devDependencies[name]}`)], cwd);
    const env = { ...process.env, VUE_PACKED_MODE: mode };
    const vitest = join(cwd, 'node_modules/vitest/vitest.mjs');
    for (const args of [[process.execPath, ['verify.mjs']], [process.execPath, [vitest, 'run']]]) {
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
      const result = spawnSync(process.execPath, [vitest, 'run'], { cwd, encoding: 'utf8', env });
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`); process.stdout.write(result.stdout);
    }
  }
} finally { rmSync(temp, { recursive: true, force: true }); }
