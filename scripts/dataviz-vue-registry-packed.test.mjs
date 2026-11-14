import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { verifyRegistryPacked } from './dataviz-vue-registry-packed.mjs';
import { packedRegistry } from './fixtures/vue-packed/registry.mjs';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));

test('registry gate imports installed Classic and Vapor tarballs and fails closed for a missing version', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'dataviz-registry-test-'));
  const manifests = new Map(readdirSync(join(root, 'packages')).flatMap(dir => {
    const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
    return [[manifest.name, { dir, manifest }]];
  }));
  const packages = new Map();
  async function pack(name) {
    if (packages.has(name)) return;
    const { dir, manifest } = manifests.get(name);
    const { stdout } = await exec('npx', ['-y', 'npm@10.9.9', 'pack', '--json', '--ignore-scripts', '--pack-destination', temp], {
      cwd: join(root, 'packages', dir), env: process.env,
    });
    const [{ filename }] = JSON.parse(stdout);
    packages.set(name, { manifest, url: pathToFileURL(join(temp, filename)).href });
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      if (manifests.has(dependency)) await pack(dependency);
    }
  }
  let registry;
  try {
    await pack('@sentropic/dataviz-vue');
    registry = await packedRegistry(packages);
    await verifyRegistryPacked({ registry: registry.address });
    for (const name of ['@sentropic/design-system-vue', '@sentropic/design-system-themes', '@sentropic/graph', '@sentropic/design-system-rich-text']) {
      assert(registry.requests.has(name), `npm must request ${name} by its registry pin`);
    }
    // Keep metadata available, but remove the exact required themes version.
    // This cannot fall back to a published upstream version or a local override.
    const themes = packages.get('@sentropic/design-system-themes');
    packages.set(themes.manifest.name, { ...themes, manifest: { ...themes.manifest, version: '0.0.0-unavailable' } });
    await assert.rejects(() => verifyRegistryPacked({ registry: registry.address }), error => {
      assert.match(error.stderr, /ETARGET/);
      assert.match(error.stderr, /@sentropic\/design-system-themes@0\.14\.0/);
      return true;
    });
  } finally {
    if (registry) await registry.close();
    rmSync(temp, { recursive: true, force: true });
  }
});
