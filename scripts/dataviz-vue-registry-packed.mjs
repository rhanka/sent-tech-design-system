// The candidate tarball is local; every dependency must come from public npm.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'dataviz-vue-registry-'));
function npm(args, cwd = temp) {
  return execFileSync('npx', ['-y', 'npm@10.9.9', ...args], { cwd, encoding: 'utf8', env: process.env });
}
try {
  const [packed] = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', temp], join(root, 'packages/dataviz-vue')));
  writeFileSync(join(temp, 'package.json'), JSON.stringify({ private: true, type: 'module',
    dependencies: { '@sentropic/dataviz-vue': `file:./${packed.filename}`, vue: '3.6.0-rc.15' },
    overrides: { vue: '$vue' },
  }, null, 2));
  npm(['install', '--registry=https://registry.npmjs.org', '--ignore-scripts', '--no-audit', '--no-fund']);
  const lock = JSON.parse(readFileSync(join(temp, 'package-lock.json'), 'utf8'));
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path || path === 'node_modules/@sentropic/dataviz-vue') continue;
    assert(!entry.link && entry.resolved?.startsWith('https://registry.npmjs.org/'), `${path} did not resolve from public npm`);
  }
  const ds = JSON.parse(readFileSync(join(root, 'packages/components-vue/package.json'), 'utf8'));
  for (const [name, version] of [['@sentropic/design-system-vue', ds.version], ['@sentropic/graph', '0.3.1'], ['@sentropic/design-system-rich-text', '0.1.1']]) {
    assert.equal(lock.packages[`node_modules/${name}`]?.version, version, name);
    console.log(`Registry closure: ${name}@${version}`);
  }
  writeFileSync(join(temp, 'verify.mjs'), `
    import assert from 'node:assert/strict';
    import { readFileSync } from 'node:fs';
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
  process.stdout.write(execFileSync(process.execPath, ['verify.mjs'], { cwd: temp, encoding: 'utf8' }));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
