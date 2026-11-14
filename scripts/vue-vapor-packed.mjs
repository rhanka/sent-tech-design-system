// Real installations outside the workspace; Vite builds and Vitest/jsdom only.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { packedRegistry } from './fixtures/vue-packed/registry.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'ds-vue-packed-'));
const npmVersion = '10.9.9';
async function run(command, args, cwd = temp, env = process.env) {
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  const status = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
  assert.equal(status, 0, `${command} ${args.join(' ')}\n${stdout}\n${stderr}`);
  return stdout;
}
function npm(args, cwd = temp) {
  return run('npx', ['--yes', `npm@${npmVersion}`, ...args], cwd);
}
const manifests = new Map(readdirSync(join(root, 'packages')).flatMap(dir => {
  try { const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'))); return [[manifest.name, { dir, manifest }]]; }
  catch { return []; }
}));
const tarballs = {};
const packed = new Map();
const editorPeer = name => name.startsWith('@tiptap/') || ['yjs', 'y-protocols'].includes(name);
async function pack(name) {
  if (tarballs[name]) return;
  const { dir, manifest } = manifests.get(name);
  const output = JSON.parse(await npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temp], join(root, 'packages', dir)));
  tarballs[name] = pathToFileURL(join(temp, output[0].filename)).href;
  const published = JSON.parse(await run('tar', ['-xOf', join(temp, output[0].filename), 'package/package.json']));
  for (const peer of Object.keys(published.peerDependencies ?? {}).filter(editorPeer)) {
    assert.equal(published.peerDependenciesMeta?.[peer]?.optional, true, `${name}: published ${peer} must be optional`);
  }
  assert.deepEqual(Object.keys(published.dependencies ?? {}).filter(editorPeer), [], `${name}: hard editor dependency`);
  packed.set(name, { manifest: published, url: tarballs[name] });
  for (const dependency of Object.keys(manifest.dependencies ?? {})) if (manifests.has(dependency)) await pack(dependency);
}
let registry;
try {
  const realTemp = realpathSync(temp), realRoot = realpathSync(root);
  assert(realTemp !== realRoot && !realTemp.startsWith(realRoot + sep), 'TMPDIR must be outside the workspace');
  assert.equal((await npm(['--version'])).trim(), npmVersion);
  console.log(`Packed consumers: npm ${npmVersion}`);
  await pack('@sentropic/design-system-vue'); await pack('@sentropic/dataviz-vue');
  registry = await packedRegistry(packed);
  const fixture = join(root, 'scripts/fixtures/vue-packed');
  for (const [mode, version] of [['classic', '3.5.45'], ['vapor', '3.6.0-rc.15']]) {
    const cwd = join(temp, mode); mkdirSync(cwd);
    // Copy sources only: never inherit a fixture lockfile or node_modules.
    for (const file of ['verify.mjs', 'consumer.test.mjs', 'without-editor-peers.test.mjs', 'vitest.config.mjs']) cpSync(join(fixture, file), join(cwd, file));
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module',
      packageManager: `npm@${npmVersion}`,
      dependencies: { '@sentropic/design-system-vue': tarballs['@sentropic/design-system-vue'], '@sentropic/dataviz-vue': tarballs['@sentropic/dataviz-vue'], vue: version, '@vue/server-renderer': version, '@vue/compiler-sfc': version },
      devDependencies: { vite: '8.0.16', vitest: '4.1.11', typescript: '5.9.3', jsdom: '27.2.0' },
      // npm 10 otherwise explores a newer Vite/devtools peer graph from Vitest
      // and crashes in Arborist's loadPeerSet (null edgesOut).
      overrides: { vue: version, vite: '$vite' },
    }, null, 2));
    await npm(['install', '--registry', registry.address, '--ignore-scripts', '--no-audit', '--no-fund'], cwd);
    const lock = JSON.parse(readFileSync(join(cwd, 'package-lock.json'), 'utf8'));
    for (const path of Object.keys(lock.packages)) {
      assert(!/(?:^|\/)node_modules\/(?:@tiptap\/|yjs(?:\/|$)|y-protocols(?:\/|$))/.test(path), `Basic ${mode} consumer installed editor dependency ${path}`);
    }
    const richText = manifests.get('@sentropic/design-system-rich-text').manifest;
    const richLock = lock.packages['node_modules/@sentropic/design-system-rich-text'];
    assert.equal(richLock.version, richText.version);
    assert(richLock.resolved.startsWith(registry.address + '/tarballs/'), 'rich-text must resolve by its registry pin');
    for (const name of Object.keys(richText.peerDependencies)) assert(!existsSync(join(cwd, 'node_modules', name)), `Unexpected ${name}`);
    // The root barrel must load before any editor peer is installed.
    await run(process.execPath, ['--input-type=module', '-e', "const ds = await import('@sentropic/design-system-vue'); if (!ds.Button) throw new Error('Missing Button');"], cwd);
    const env = { ...process.env, VUE_PACKED_MODE: mode };
    const vitest = join(cwd, 'node_modules/vitest/vitest.mjs');
    process.stdout.write(await run(process.execPath, [vitest, 'run', 'without-editor-peers.test.mjs'], cwd, env));
    rmSync(join(cwd, 'without-editor-peers.test.mjs'));
    console.log(`${mode}: registry-resolved closure has no editor peers; root${mode === 'vapor' ? ' and Vapor' : ''} imports passed; editor imports rejected`);
    await npm(['install', '--registry', registry.address, '--ignore-scripts', '--no-audit', '--no-fund', ...Object.keys(richText.peerDependencies).map(name => `${name}@${richText.devDependencies[name]}`)], cwd);
    for (const args of [[process.execPath, ['verify.mjs']], [process.execPath, [vitest, 'run']]]) {
      process.stdout.write(await run(args[0], args[1], cwd, env));
    }
    // Exercise the separately built 3.5 compiler output from the installed pack.
    if (mode === 'classic') {
      for (const name of ['@sentropic/design-system-vue', '@sentropic/dataviz-vue']) {
        const dist = join(cwd, 'node_modules', name, 'dist');
        cpSync(join(dist, 'classic-3.5'), dist, { recursive: true });
      }
      console.log('Classic 3.5 compiler output:');
      process.stdout.write(await run(process.execPath, [vitest, 'run'], cwd, env));
    }
  }
  assert(registry.requests.has('@sentropic/design-system-rich-text'), 'npm must request rich-text metadata');
} finally { if (registry) await registry.close(); rmSync(temp, { recursive: true, force: true }); }
