import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { bench, installSourceLoader } from './lib.mjs';

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Text', 'Comment', 'Document', 'DocumentFragment', 'MutationObserver', 'Event', 'CustomEvent']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
installSourceLoader('vapor');
const { createVaporApp, nextTick } = await import('vue');
const { newStore } = await import('./fixtures/store.ts');
const entry = await import('@sentropic/dataviz-vue/vapor');
const names = ['CrossfilteredBarChart', 'DrillBarChart', 'SmallMultiples'];
const temporary = mkdtempSync(resolve(bench, '.tmp-package-'));
try {
  for (const name of names) {
    assert.equal(entry[name]?.__vapor, true, `${name} must ship through the native package entry`);
    const store = newStore();
    const props = { store, viewId: 'proof', dimension: 'region', facetBy: 'region', hierarchy: ['region', 'city'], measure: 'sales', label: 'Proof' };
    globalThis.__datavizPackageProps = props;
    const file = resolve(temporary, name + '.vue');
    writeFileSync(file, `<script setup lang="ts">import { ${name} as Target } from '@sentropic/dataviz-vue/vapor'; const props = (globalThis as any).__datavizPackageProps;</script><template><Target v-bind="props" /></template>`);
    const { default: Wrapper } = await import(pathToFileURL(file).href);
    const app = createVaporApp(Wrapper);
    const errors = [];
    app.config.errorHandler = error => errors.push(String(error));
    app.config.warnHandler = warning => errors.push(warning);
    let subscriptions = 0;
    const subscribe = store.subscribe.bind(store);
    store.subscribe = listener => { subscriptions++; const off = subscribe(listener); return () => { subscriptions--; off(); }; };
    try {
      app.mount(document.querySelector('#app'));
      await nextTick();
      assert.equal(subscriptions, 1);
      assert.equal(document.querySelectorAll('.st-barChart').length, name === 'SmallMultiples' ? 2 : 1);
      if (name === 'SmallMultiples') {
        store.setFilter('region', { kind: 'include', values: ['North'] });
        await nextTick();
        assert.equal(document.querySelectorAll('.st-barChart').length, 1);
      } else if (name === 'DrillBarChart') {
        document.querySelector('.st-barChart__filterChip').click();
        await nextTick();
        assert.equal(store.getState().drill.proof.length, 1);
        assert.equal(document.querySelectorAll('.st-barChart__bar').length, 2);
        document.querySelector('.st-barChart__filterChip').click();
        await nextTick();
        assert.deepEqual(store.getState().selections.proof, ['A']);
      } else {
        document.querySelector('.st-barChart__filterChip').click();
        await nextTick();
        assert.deepEqual(store.getState().selections.proof, ['North']);
        store.setFilter('region', { kind: 'include', values: ['North'] });
        await nextTick();
        assert.equal(document.querySelectorAll('.st-barChart__bar').length, 1);
      }
    } finally {
      app.unmount();
      await nextTick();
    }
    assert.equal(subscriptions, 0, 'store subscription must be disposed');
    assert.deepEqual(errors, []);
    console.log(`${name}: published Vapor export, interaction/update and subscription cleanup PASS`);
  }
} finally {
  delete globalThis.__datavizPackageProps;
  rmSync(temporary, { recursive: true, force: true });
  dom.window.close();
}
