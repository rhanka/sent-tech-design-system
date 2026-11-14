import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const manifest = path => JSON.parse(read(`${path}/package.json`));
test('all editor peers are optional and have local build dependencies', () => {
  for (const path of ['packages/components-vue', 'packages/rich-text']) {
    const pkg = manifest(path);
    for (const name of Object.keys(pkg.peerDependencies).filter(name => name.startsWith('@tiptap/') || ['yjs', 'y-protocols'].includes(name))) {
      assert.equal(pkg.peerDependenciesMeta?.[name]?.optional, true, `${path}: ${name}`);
      assert.ok(pkg.devDependencies[name], `${path}: local ${name}`);
    }
  }
  assert.equal(manifest('packages/rich-text').dependencies?.['@tiptap/markdown'], undefined, 'markdown must not pull editor dependencies into root consumers');
});
test('Vue pins a fresh rich-text release carrying optional peer metadata', () => {
  const richText = manifest('packages/rich-text');
  assert.notEqual(richText.version, '0.1.0', 'published 0.1.0 has mandatory editor dependencies and cannot be overwritten');
  for (const path of ['packages/components-vue', 'packages/components-svelte']) {
    assert.equal(manifest(path).dependencies[richText.name], richText.version);
  }
});
test('every control glyph uses Icon instead of a raw Lucide svg', () => {
  const walk = dir => readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : entry.name.endsWith('.vue') ? [`${dir}/${entry.name}`] : []);
  const offenders = walk('packages/components-vue/src').filter(file => /<svg\b[^>]*class="[^"]*lucide/.test(read(file)));
  assert.deepEqual(offenders, []);
  for (const name of ['Combobox', 'MultiSelect']) assert.doesNotMatch(read(`packages/components-vue/src/${name}.vue`), /<svg\b/, `${name} must compose Icon for its caret too`);
});
test('Vue pack closure includes rich-text and asserts every V8 subpath and CSS alias', () => {
  const smoke = read('scripts/smoke-pack.mjs'), closure = smoke.slice(smoke.indexOf('"@sentropic/design-system-vue": {'));
  assert.match(closure.slice(0, closure.indexOf('\n  },')), /@sentropic\/design-system-rich-text/);
  const files = smoke.slice(smoke.indexOf('name: "@sentropic/design-system-vue"'), smoke.indexOf('name: "@sentropic/design-system-angular"'));
  for (const subpath of ['rich-text-editor', 'vapor/rich-text-editor', 'presence-badge', 'vapor/presence-badge']) assert.ok(files.includes(`"${subpath}"`), subpath);
  assert.ok(files.includes('dist/rich-text-editor/rich-text-editor.css'));
  assert.equal(manifest('packages/components-vue').exports['./rich-text-editor/styles.css'], './dist/rich-text-editor/rich-text-editor.css');
});
test('dataviz reuses WebFrame from the DS and the DS exports its configuration', () => {
  assert.match(read('packages/dataviz-vue/src/lib/WebFrame.vue'), /import \{ WebFrame as DsWebFrame \} from '@sentropic\/design-system-vue'/);
  assert.match(read('packages/dataviz-vue/src/lib/WebFrame.vue'), /<DsWebFrame v-bind="\$attrs"/);
  assert.match(read('packages/components-vue/src/index.ts'), /type[^;]*WebFrameConfig/);
});
