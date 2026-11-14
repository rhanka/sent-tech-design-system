import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { releasePlan } from './dataviz-release.mjs';

const adapters = ['core', 'svelte', 'react', 'vue', 'angular'];
const current = Object.fromEntries(adapters.map(adapter => [adapter,
  JSON.parse(readFileSync(new URL(`../packages/dataviz-${adapter}/package.json`, import.meta.url), 'utf8'))]));
const family = version => Object.fromEntries(adapters.map(adapter => [adapter, {
  name: `@sentropic/dataviz-${adapter}`, version,
  dependencies: adapter === 'core' ? {} : { '@sentropic/dataviz-core': version },
}]));

test('the real Vue prerelease can release independently with the stable core pin', () => {
  const plan = releasePlan('dataviz-vue-v0.6.0-next.0', current);
  assert.deepEqual(plan, { version: '0.6.0-next.0', packages: '@sentropic/dataviz-vue', workspaces: '@sentropic/dataviz-vue' });
});

test('0.5.x family releases skip the ahead Vue prerelease in publish and propagation selection', () => {
  for (const version of ['0.5.0', '0.5.1']) {
    const manifests = family(version);
    manifests.vue = current.vue;
    const plan = releasePlan(`dataviz-v${version}`, manifests);
    assert.equal(plan.packages, '@sentropic/dataviz-core @sentropic/dataviz-svelte @sentropic/dataviz-react @sentropic/dataviz-angular');
    assert.equal(plan.workspaces, plan.packages.replaceAll(' ', ','));
  }
});

test('matching stable and prerelease families still publish all five packages', () => {
  for (const version of ['0.6.0', '0.6.0-rc.1']) {
    assert.equal(releasePlan(`dataviz-v${version}`, family(version)).packages.split(' ').length, 5);
  }
});

test('mismatches, stable Vue divergence, behind Vue prereleases and internal pin drift fail closed', () => {
  for (const mutate of [
    m => { m.react.version = '0.5.1'; },
    m => { m.react.dependencies['@sentropic/dataviz-core'] = '^0.5.0'; },
    m => { m.vue.version = '0.6.0'; },
    m => { m.vue.version = '0.4.0-next.0'; },
    m => { m.vue.version = '0.5.0-next.0'; },
  ]) {
    const manifests = family('0.5.0'); mutate(manifests);
    assert.throws(() => releasePlan('dataviz-v0.5.0', manifests));
  }
  const drift = structuredClone(current);
  drift.vue.dependencies['@sentropic/dataviz-core'] = '0.6.0-next.0';
  assert.throws(() => releasePlan('dataviz-vue-v0.6.0-next.0', drift));
});

test('malformed tags, mismatching Vue tags and latest prereleases cannot publish', () => {
  for (const tag of ['other-v0.5.0', 'dataviz-v0.5', 'dataviz-v0.5.0-next.01',
    'dataviz-v0.5.0-latest.0', 'dataviz-vue-v0.6.0-latest.0',
    'dataviz-vue-v0.6.0', 'dataviz-vue-v0.6.0-next.1', 'dataviz-v0.6.0-next.0']) {
    assert.throws(() => releasePlan(tag, current), tag);
  }
});
