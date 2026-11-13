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
const { createVaporApp, nextTick, shallowRef } = await import('vue');
const entry = await import('@sentropic/dataviz-vue/vapor');
const temporary = mkdtempSync(resolve(bench, '.tmp-rich-'));
try {
  for (const name of ['FieldPane', 'PalettePicker']) {
    assert.equal(entry[name]?.__vapor, true);
    const { default: fixtures } = await import(`./fixtures/${name}.fixtures.ts`);
    for (const fixture of fixtures) {
      const state = shallowRef(fixture.props);
      globalThis.__datavizRichState = state;
      const file = resolve(temporary, `${name}-${fixture.id}.vue`);
      writeFileSync(file, `<script setup lang="ts">import { ${name} as Target } from '@sentropic/dataviz-vue/vapor'; const state = (globalThis as any).__datavizRichState;</script><template><Target v-bind="state" /></template>`);
      const { default: Wrapper } = await import(pathToFileURL(file).href);
      const app = createVaporApp(Wrapper);
      const errors = [];
      app.config.errorHandler = error => errors.push(String(error));
      app.config.warnHandler = warning => errors.push(warning);
      try {
        app.mount(document.querySelector('#app'));
        await nextTick();
        assert.ok(document.querySelector('#app > div'));
        if (name === 'FieldPane' && fixture.id === 'default') {
          const selected = [];
          const dimension = fixture.props.model.dimensions[0];
          const dimensionId = 'dimension:' + dimension.id;
          state.value = { ...fixture.props, onSelect: id => selected.push(id) };
          await nextTick();
          assert.equal(document.querySelectorAll('button').length, 3);
          [...document.querySelectorAll('button')].find(button => button.textContent.includes(dimension.label)).click();
          await nextTick();
          assert.deepEqual(selected, [dimensionId]);
          state.value = { ...state.value, expandedIds: [] };
          await nextTick();
          assert.equal(document.querySelectorAll('button').length, 0);
          state.value = { ...fixture.props, 'onUpdate:selectedId': id => selected.push(id) };
          await nextTick();
          const country = document.querySelector(`[data-tree-id="${dimensionId}"]`);
          assert.ok(country);
          country.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          await nextTick();
          // Original FieldPane filters this model listener during fallthrough.
          assert.equal(country.getAttribute('tabindex'), null);
          assert.deepEqual(selected, [dimensionId]);
        }
        if (name === 'PalettePicker' && fixture.id === 'all') {
          assert.equal(document.querySelectorAll('.st-colorScaleBar').length, 2);
          state.value = { ...fixture.props, sequential: undefined, diverging: undefined, categorical: ['#123456'], swatchSize: 7 };
          await nextTick();
          assert.equal(document.querySelectorAll('.st-colorScaleBar').length, 0);
          assert.equal(document.querySelectorAll('.st-colorSwatch').length, 1);
          const chip = document.querySelector('.st-colorSwatch__chip');
          assert.equal(chip.getAttribute('aria-label'), '#123456');
          assert.equal(chip.style.width, '7px');
        }
      } finally {
        app.unmount();
        await nextTick();
      }
      assert.deepEqual(errors, [], `${name}/${fixture.id}`);
    }
    console.log(`${name}: all ${fixtures.length} published Vapor fixtures and reactive behavior PASS`);
  }
} finally {
  delete globalThis.__datavizRichState;
  rmSync(temporary, { recursive: true, force: true });
  dom.window.close();
}
