import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { bench, src, require, installSourceLoader } from './lib.mjs';

const mode = process.env.DATAVIZ_MODE ?? 'vapor';
assert.ok(['classic', 'vapor'].includes(mode));
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'SVGElement', 'Text', 'Comment', 'Document', 'DocumentFragment', 'MutationObserver', 'Event', 'CustomEvent']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
installSourceLoader(mode);
const { createApp, createVaporApp, shallowReactive, nextTick } = await import('vue');
const { newStore, model } = await import('./fixtures/store.ts');
const { createFormatPanelState } = await import('@sentropic/dataviz-core');
const temporary = mkdtempSync(resolve(bench, '.tmp-interactions-'));
let sequence = 0;
const flush = async () => { await nextTick(); await new Promise(done => setTimeout(done, 0)); await nextTick(); };
after(() => { dom.window.close(); rmSync(temporary, { recursive: true, force: true }); });

async function mount(name, props, slots = '', copies = 1) {
  const element = document.createElement('div'); document.body.append(element);
  const state = shallowReactive(props);
  globalThis.__datavizInteractionProps = state;
  const file = resolve(temporary, `host-${sequence++}.vue`);
  writeFileSync(file, `<script setup lang="ts">
import Target from '${pathToFileURL(resolve(src, name + '.vue')).href}';
const props = (globalThis as any).__datavizInteractionProps;
</script><template>${Array.from({ length: copies }, () => `<Target v-bind="props">${slots}</Target>`).join('')}</template>`);
  const { default: Host } = await import(pathToFileURL(file).href);
  assert.equal(Host.__vapor === true, mode === 'vapor');
  const app = (mode === 'vapor' ? createVaporApp : createApp)(Host);
  const errors = [];
  app.config.errorHandler = error => errors.push(String(error));
  app.config.warnHandler = warning => errors.push(warning);
  app.mount(element); await flush();
  return { element, props: state, async close() {
    app.unmount(); await flush();
    assert.equal(element.textContent, ''); assert.equal(element.querySelector('*'), null);
    element.remove(); assert.deepEqual(errors, []);
  } };
}
const click = element => { assert.ok(element); element.click(); };
async function edit(element, value, event = 'input') {
  assert.ok(element);
  if (element.type === 'checkbox') element.checked = value; else element.value = value;
  element.dispatchEvent(new Event(event, { bubbles: true })); await flush();
}

test(`${mode}: layout edits notify once and preserve scoped slots`, async () => {
  const calls = [];
  const host = await mount('DashboardGrid', {
    layout: { columns: 12, panels: [{ id: 'a', x: 0, y: 0, w: 3, h: 2 }] },
    panels: [{ id: 'a', title: 'Alpha' }], editable: true,
    onLayoutChange: value => calls.push(value),
  }, '<template #default="{ meta, panel }"><strong>{{ meta.title }}:{{ panel.x }}</strong></template>');
  try {
    click(host.element.querySelector('[aria-label="Move Alpha right"]')); await flush();
    assert.equal(calls.length, 1); assert.equal(calls[0].panels[0].x, 1);
    assert.equal(host.element.querySelector('strong').textContent, 'Alpha:1');
    assert.equal(host.element.querySelector('section').style.gridColumn, '2 / span 3');
  } finally { await host.close(); }
});

test(`${mode}: slicer changes the store and reflects external filters`, async () => {
  const store = newStore();
  const host = await mount('ValueSlicer', { store, dimension: 'region' });
  try {
    await edit(host.element.querySelector('input[value="North"]'), true, 'change');
    assert.deepEqual(store.getState().filters.region, { kind: 'include', values: ['North'] });
    store.clearFilter('region'); await flush();
    assert.equal(host.element.querySelector('input[value="North"]').checked, false);
  } finally { await host.close(); }
});

test(`${mode}: chart selection and filtering stay reactive with SVG namespaces`, async () => {
  const store = newStore();
  const host = await mount('CrossfilteredBarChart', { store, viewId: 'bars', dimension: 'region', measure: 'sales', label: 'Sales' });
  try {
    click([...host.element.querySelectorAll('.st-barChart__filterChip')].find(node => node.textContent.startsWith('North'))); await flush();
    assert.deepEqual(store.getState().selections.bars, ['North']);
    store.setFilter('region', { kind: 'include', values: ['South'] }); await flush();
    assert.equal(host.element.querySelectorAll('.st-barChart__bar').length, 1);
    for (const node of host.element.querySelectorAll('svg,svg *')) assert.equal(node.namespaceURI, 'http://www.w3.org/2000/svg');
  } finally { await host.close(); }
});

test(`${mode}: selection legend appears, clears and unsubscribes`, async () => {
  const store = newStore();
  const subscribe = store.subscribe; let active = 0;
  store.subscribe = listener => { active++; const stop = subscribe(listener); return () => { active--; stop(); }; };
  const host = await mount('SelectionLegend', { store, labels: { bars: 'Bars' } });
  try {
    assert.equal(host.element.querySelector('[role="group"]'), null);
    store.toggleSelection('bars', 'North'); await flush();
    assert.ok(host.element.textContent.includes('Bars'));
    click(host.element.querySelector('button')); await flush();
    assert.equal(store.getState().selections.bars, undefined);
    assert.equal(host.element.querySelector('[role="group"]'), null);
  } finally { await host.close(); }
  assert.equal(active, 0);
});

test(`${mode}: calculation input and select each notify once`, async () => {
  const calls = [];
  const host = await mount('CalculationEditor', { model, value: { id: 'calc', label: 'Calc', expression: '[sales]', kind: 'measure', aggregation: 'sum' }, onChange: value => calls.push(value) });
  try {
    await edit(host.element.querySelector('input[aria-label="Nom du calcul"]'), 'New');
    assert.equal(calls.length, 1); assert.equal(calls[0].label, 'New');
    await edit(host.element.querySelector('select[aria-label="Type"]'), 'dimension', 'change');
    assert.equal(calls.length, 2); assert.equal(calls[1].kind, 'dimension');
    assert.equal(host.element.querySelector('.st-field').hasAttribute('aria-label'), false);
  } finally { await host.close(); }
});

test(`${mode}: format controls notify once and IDs remain unique across instances`, async () => {
  const calls = [];
  const host = await mount('FormatPanel', { value: createFormatPanelState({ axes: [{ id: 'sales', label: 'Sales' }], legends: [], markers: [] }), onChange: value => calls.push(value) }, '', 2);
  try {
    await edit(host.element.querySelector('input[aria-label="Minimum Sales"]'), '10');
    assert.equal(calls.length, 1); assert.equal(calls[0].axes[0].min, 10);
    await edit(host.element.querySelector('input[aria-label="Inverser Sales"]'), true, 'change');
    assert.equal(calls.length, 2); assert.equal(calls[1].axes[0].inverted, true);
    const ids = [...host.element.querySelectorAll('[id]')].map(node => node.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const label of host.element.querySelectorAll('label[for]')) assert.ok(ids.includes(label.htmlFor));
  } finally { await host.close(); }
});

test(`${mode}: object layer actions notify once and retain locked visibility`, async () => {
  const layers = [{ id: 'a', label: 'Alpha', kind: 'image' }, { id: 'b', label: 'Beta', kind: 'image', locked: true }];
  const selected = [], visible = [];
  const host = await mount('ObjectLayerPanel', { layers, onSelect: layer => selected.push(layer.id), onVisibilityChange: (layer, value) => visible.push([layer.id, value]) });
  try {
    click(host.element.querySelector('[aria-label="Select Alpha"]'));
    click(host.element.querySelector('[aria-label="Hide Alpha"]'));
    click(host.element.querySelector('[aria-label="Hide Beta"]')); await flush();
    assert.deepEqual(selected, ['a']); assert.deepEqual(visible, [['a', false]]);
  } finally { await host.close(); }
});

test(mode + ': populated feed fixtures retain articles, severity, names, order and filter updates', async () => {
  const { default: fixtures } = await import('./fixtures/EventFeedPanel.fixtures.ts');
  const fixture = fixtures.find(f => f.id === 'populated');
  assert.ok(fixture, 'EventFeedPanel must have a populated fixture');
  const host = await mount('EventFeedPanel', fixture.props);
  const articles = () => [...host.element.querySelectorAll('[role="article"]')];
  try {
    assert.deepEqual(articles().map(node => node.getAttribute('aria-label')), [
      'alert — Failed deploy', 'deploy — Deployed', 'notice — Scheduled', 'audit — Reviewed',
    ]);
    assert.deepEqual(articles().map(node => node.className), ['error', 'success', 'warning', 'neutral'].map(tone => 'st-eventFeedPanel__item st-eventFeedPanel__item--' + tone));
    assert.deepEqual([...host.element.querySelectorAll('.st-eventFeedPanel__message')].map(node => node.textContent), ['Failed deploy', 'Deployed', 'Scheduled', 'Reviewed']);
    fixture.props.store.setFilter('type', { kind: 'include', values: ['deploy'] }); await flush();
    assert.equal(articles().length, 1);
    assert.equal(articles()[0].getAttribute('aria-label'), 'deploy — Deployed');
    fixture.props.store.clearFilter('type'); await flush();
    assert.equal(articles().length, 4);
  } finally { await host.close(); }
});
