// The candidate tarball is local; every dependency must come from public npm.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exec = promisify(execFile);

// Explicit injection is for the registry-like integration test; the CLI always uses public npm.
export async function verifyRegistryPacked({ registry = 'https://registry.npmjs.org' } = {}) {
  const temp = mkdtempSync(join(tmpdir(), 'dataviz-vue-registry-'));
  async function npm(args, cwd = temp) {
    const { stdout } = await exec('npx', ['-y', 'npm@10.9.9', ...args], { cwd, encoding: 'utf8', env: process.env });
    return stdout;
  }
  try {
    const [packed] = JSON.parse(await npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temp], join(root, 'packages/dataviz-vue')));
    writeFileSync(join(temp, 'package.json'), JSON.stringify({ private: true, type: 'module',
      dependencies: { '@sentropic/dataviz-vue': `file:./${packed.filename}`, vue: '3.6.0-rc.15' },
      overrides: { vue: '$vue' },
    }, null, 2));
    await npm(['install', '--registry=' + registry, '--ignore-scripts', '--no-audit', '--no-fund']);
    const lock = JSON.parse(readFileSync(join(temp, 'package-lock.json'), 'utf8'));
    for (const [path, entry] of Object.entries(lock.packages)) {
      if (!path || path === 'node_modules/@sentropic/dataviz-vue') continue;
      assert(!entry.link && (entry.resolved?.startsWith('https://registry.npmjs.org/') || entry.resolved?.startsWith(registry + '/')), `${path} did not resolve from public npm`);
    }
    const ds = JSON.parse(readFileSync(join(root, 'packages/components-vue/package.json'), 'utf8'));
    for (const [name, version] of [['@sentropic/design-system-vue', ds.version], ['@sentropic/graph', '0.3.1'], ['@sentropic/design-system-rich-text', '0.1.1']]) {
      assert.equal(lock.packages[`node_modules/${name}`]?.version, version, name);
      console.log(`Registry closure: ${name}@${version}`);
    }
    writeFileSync(join(temp, 'verify.mjs'), `
      import assert from 'node:assert/strict';
      import { readFileSync } from 'node:fs';
      import { createRequire, registerHooks } from 'node:module';
      import { pathToFileURL } from 'node:url';
      // Same official ESM runtime used by the packed harness, resolved inside this install.
      const require = createRequire(import.meta.url);
      const runtime = pathToFileURL(require.resolve('vue/dist/vue.runtime-with-vapor.esm-browser.js')).href;
      registerHooks({ resolve(specifier, context, next) {
        return specifier === 'vue' ? { url: runtime, shortCircuit: true } : next(specifier, context);
      } });
      const classic = await import('@sentropic/dataviz-vue');
      const vapor = await import('@sentropic/dataviz-vue/vapor');
      assert.deepEqual(Object.keys(vapor).sort(), Object.keys(classic).sort());
      for (const entry of [classic, vapor]) {
        assert.equal(typeof entry.useDashboard, 'function');
        assert(entry.CrossfilteredBarChart && entry.WebFrame);
      }
      for (const suffix of ['', '/processing', '/presentation', '/engine', '/layout-client', '/worker']) {
        const specifier = '@sentropic/graph' + suffix;
        const module = await import(specifier);
        assert(Object.keys(module).length > 0, specifier);
        if (suffix === '/layout-client') {
          const source = readFileSync(new URL(import.meta.resolve(specifier)), 'utf8');
          assert(/new URL\\(["']\\.\\/worker\\.js["'], import\\.meta\\.url\\)/.test(source));
          assert(readFileSync(new URL('./worker.js', import.meta.resolve(specifier))).length > 0);
        }
        console.log('Registry import: ' + specifier);
      }
      console.log('Registry-only packed dataviz root + Vapor: pass (' + Object.keys(vapor).length + ' exports)');
    `);
    const { stdout } = await exec(process.execPath, ['verify.mjs'], { cwd: temp, encoding: 'utf8' });
    process.stdout.write(stdout);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await verifyRegistryPacked();
}
