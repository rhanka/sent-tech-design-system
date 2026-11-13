import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { bench, src, installSourceLoader } from './lib.mjs';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Text', 'Comment', 'Document', 'DocumentFragment', 'MutationObserver', 'Event', 'CustomEvent']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
installSourceLoader('vapor');
const { createVaporApp, reactive, shallowReactive, ref, nextTick } = await import('vue');
const temporary = mkdtempSync(resolve(bench, '.tmp-hard-'));
let sequence = 0;
const flush = async () => { await nextTick(); await new Promise(done => setTimeout(done, 0)); await nextTick(); };
after(() => { dom.window.close(); rmSync(temporary, { recursive: true, force: true }); });

async function mount(name, props = {}, { slots = '', context, panelContext, copies = 1 } = {}) {
  const element = document.createElement('div');
  document.body.append(element);
  const state = shallowReactive({ props: reactive(props), context, panelContext });
  globalThis.__hardState = state;
  const file = resolve(temporary, `host-${sequence++}.vue`);
  writeFileSync(file, `<script setup lang="ts">
import { provide } from 'vue';
import Target from '${pathToFileURL(resolve(src, name + '.vue')).href}';
import { SELECTABLE_LIST_KEY } from '${pathToFileURL(resolve(src, 'selectable-list-context.ts')).href}';
import { PANEL_STACK_KEY } from '${pathToFileURL(resolve(src, 'panel-stack-context.ts')).href}';
const state = (globalThis as any).__hardState;
if (state.context) provide(SELECTABLE_LIST_KEY, state.context);
if (state.panelContext) provide(PANEL_STACK_KEY, state.panelContext);
</script><template>${Array.from({ length: copies }, () => `<Target v-bind="state.props">${slots}</Target>`).join('')}</template>`);
  const { default: Host } = await import(pathToFileURL(file).href);
  assert.equal(Host.__vapor, true);
  const app = createVaporApp(Host);
  const errors = [];
  app.config.errorHandler = error => errors.push(String(error));
  app.config.warnHandler = error => errors.push(String(error));
  app.mount(element);
  await flush();
  return { element, props: state.props, async close() { app.unmount(); await flush(); element.remove(); assert.deepEqual(errors, []); } };
}
const click = element => { assert.ok(element); element.click(); };
const key = (element, value) => element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));

test('Dropdown should teleport, select once, close on Escape and remove its list', async () => {
  const selections = [], opens = [];
  const host = await mount('Dropdown', { options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }], onSelect: value => selections.push(value), 'onUpdate:open': value => opens.push(value) });
  try {
    click(host.element.querySelector('button')); await flush();
    assert.ok(document.body.querySelector('.st-dropdown__list'));
    assert.equal(host.element.querySelector('.st-dropdown__list'), null);
    click(document.querySelector('[role="option"][disabled]')); await flush();
    assert.deepEqual(selections, []);
    click(document.querySelector('[role="option"]')); await flush();
    assert.deepEqual(selections, ['a']); assert.deepEqual(opens, [true, false]);
    assert.equal(host.element.querySelector('.st-dropdown__value').textContent, 'Alpha');
    click(host.element.querySelector('button')); await flush(); key(window, 'Escape'); await flush();
    assert.equal(document.querySelector('.st-dropdown__list'), null);
  } finally { await host.close(); }
});

test('Portal should reactively move between targets and inline without leaving content', async () => {
  const one = document.createElement('div'), two = document.createElement('div'); one.id = 'portal-one'; two.id = 'portal-two'; document.body.append(one, two);
  const host = await mount('Portal', { target: '#portal-one' }, { slots: '<p>Moved</p>' });
  try {
    assert.equal(one.textContent, 'Moved'); host.props.target = '#portal-two'; await flush();
    assert.equal(one.textContent, ''); assert.equal(two.textContent, 'Moved');
    host.props.disabled = true; await flush(); assert.equal(two.textContent, ''); assert.equal(host.element.textContent, 'Moved');
  } finally { await host.close(); one.remove(); two.remove(); }
});

test('Popper should position against its anchor, request close once and remove its panel', async () => {
  const anchor = document.createElement('button'); document.body.append(anchor);
  anchor.getBoundingClientRect = () => ({ top: 10, left: 20, bottom: 30, right: 60, width: 40, height: 20 });
  let closes = 0;
  const host = await mount('Popper', { anchor, open: true, onClose: () => closes++ }, { slots: '<button>Panel</button>' });
  try {
    assert.equal(document.querySelector('.st-popper').style.top, '38px');
    assert.equal(host.element.querySelector('.st-popper'), null);
    key(document, 'Escape'); assert.equal(closes, 1);
    host.props.open = false; await flush(); assert.equal(document.querySelector('.st-popper'), null);
  } finally { await host.close(); anchor.remove(); }
});

test('Toast should react to listener presence and invoke close and dismiss once', async () => {
  let closes = 0; const dismissed = [];
  const host = await mount('Toast', { title: 'Saved' });
  try {
    assert.equal(host.element.querySelector('button'), null);
    host.props.onClose = () => closes++; await flush(); click(host.element.querySelector('button')); assert.equal(closes, 1);
    host.props.items = [{ id: 'a', title: 'Queued' }]; host.props.onDismiss = id => dismissed.push(id); await flush();
    click(host.element.querySelector('button')); assert.deepEqual(dismissed, ['a']);
    delete host.props.onDismiss; await flush(); assert.equal(host.element.querySelector('button'), null);
  } finally { await host.close(); }
});

test('TreeView should enable interaction when listeners appear and preserve expansion and selection', async () => {
  const selected = [], updated = [];
  const host = await mount('TreeView', { nodes: [{ id: 'a', label: 'Parent', children: [{ id: 'b', label: 'Leaf' }] }] });
  try {
    assert.equal(host.element.querySelector('[role="treeitem"]').hasAttribute('tabindex'), false);
    host.props.onSelect = id => selected.push(id); host.props['onUpdate:selectedId'] = id => updated.push(id); await flush();
    click(host.element.querySelector('[data-tree-id="a"]')); await flush();
    assert.equal(host.element.querySelectorAll('[role="treeitem"]').length, 2);
    key(host.element.querySelector('[data-tree-id="a"]'), 'ArrowDown'); await flush();
    assert.equal(document.activeElement.dataset.treeId, 'b');
    click(host.element.querySelector('[data-tree-id="b"]')); assert.deepEqual(selected, ['b']); assert.deepEqual(updated, ['b']);
    host.props.selected = 'b'; await flush(); assert.equal(host.element.querySelector('[data-tree-id="b"]').getAttribute('aria-selected'), 'true');
  } finally { await host.close(); }
});

test('TileGroup should use unique group names and emit the model value before change', async () => {
  const events = [];
  const host = await mount('TileGroup', { items: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }], 'onUpdate:modelValue': value => events.push(value), onChange: () => events.push('change') }, { copies: 2 });
  try {
    const inputs = host.element.querySelectorAll('input');
    assert.equal(inputs[0].name, inputs[1].name); assert.notEqual(inputs[0].name, inputs[2].name);
    inputs[1].dispatchEvent(new Event('change', { bubbles: true })); assert.deepEqual(events, ['b', 'change']);
  } finally { await host.close(); }
});

test('SelectableRow should register, read reactive provider state and unregister', async () => {
  const version = reactive({ value: 0 }); let current = false, registered = 0, removed = 0, activated = 0;
  const context = { version, managed: true, itemRole: 'option', register: () => { registered++; return () => removed++; }, isSelected: () => current, isTabStop: () => true, activate: () => activated++, focusRow() {}, navigate() {} };
  const host = await mount('SelectableRow', { value: 'a' }, { context, slots: 'Row' });
  try {
    assert.equal(registered, 1); current = true; version.value++; await flush();
    assert.equal(host.element.querySelector('[role="option"]').getAttribute('aria-selected'), 'true');
    click(host.element.querySelector('[role="option"]')); assert.equal(activated, 1);
    host.props.disabled = true; await flush(); assert.equal(registered, 2); assert.equal(removed, 1);
  } finally { await host.close(); }
  assert.equal(removed, 2);
});

test('PanelSection should keep content mounted across provider collapse and primary changes', async () => {
  const expanded = ref(true), primary = ref(false); let registered = 0, removed = 0;
  const panelContext = { isPrimary: () => primary.value, isExpanded: () => expanded.value, isScrollOwner: () => expanded.value, toggle: () => { expanded.value = !expanded.value; }, register: () => { registered++; return () => removed++; } };
  const host = await mount('PanelSection', { id: 'panel', label: 'Panel' }, { panelContext, slots: '<input value="Keep" />' });
  try {
    const input = host.element.querySelector('input'); click(host.element.querySelector('button')); await flush();
    assert.equal(host.element.querySelector('input'), input); assert.ok(host.element.querySelector('.st-panelSection__body--collapsed'));
    primary.value = true; await flush(); assert.equal(host.element.querySelector('button'), null); assert.equal(host.element.querySelector('input'), input);
    assert.equal(registered, 1);
  } finally { await host.close(); }
  assert.equal(removed, 1);
});

test('AppShell should preserve panel content during disclosure and resize by keyboard', async () => {
  const resized = [];
  const host = await mount('AppShell', { panelCollapse: 'accordion', panelResize: true, onPanelResize: (...args) => resized.push(args) }, { slots: '<template #navigationPanel><input value="Keep" /></template><template #main>Main</template>' });
  try {
    const input = host.element.querySelector('input'); click(host.element.querySelector('.st-appShell__panelDisclosure')); await flush();
    assert.equal(host.element.querySelector('input'), input);
    key(host.element.querySelector('[role="separator"]'), 'ArrowRight'); await flush();
    assert.deepEqual(resized, [['navigationPanel', 336]]); assert.equal(host.element.querySelector('.st-appShell').style.getPropertyValue('--st-appShell-navigation-width'), '336px');
  } finally { await host.close(); }
});

test('AppChrome should render utility menus and invoke theme and locale callbacks', async () => {
  const themes = [], locales = [];
  const host = await mount('AppChrome', { themes: [{ id: 'day', label: 'Day' }, { id: 'night', label: 'Night' }], theme: 'day', locale: 'fr', onThemeChange: id => themes.push(id), onLocaleChange: id => locales.push(id) });
  try {
    click(host.element.querySelector('.st-appChrome__themeWrap button')); await flush();
    const menu = host.element.querySelectorAll('.st-appChrome__themeWrap [role="menuitem"]'); assert.equal(menu.length, 2); click(menu[1]); await flush(); assert.deepEqual(themes, ['night']);
    click(host.element.querySelector('.st-appChrome__localeWrap button')); await flush(); click(host.element.querySelectorAll('.st-appChrome__localeWrap [role="menuitem"]')[1]); await flush(); assert.deepEqual(locales, ['en']);
  } finally { await host.close(); }
});

test('DataTable should sort, select and page while keeping scoped cells native', async () => {
  const selected = [], pages = [];
  const host = await mount('DataTable', { columns: [{ key: 'name', label: 'Name' }], rows: [{ id: 'b', name: 'Beta' }, { id: 'a', name: 'Alpha' }, { id: 'c', name: 'Gamma' }], selectable: 'multiple', pageSize: 2, onSelectionChange: ids => selected.push(ids), onPageChange: page => pages.push(page) }, { slots: '<template #cell="{ value }"><strong>{{ value }}</strong></template>' });
  try {
    click(host.element.querySelector('.st-dataTable__sortBtn')); await flush(); assert.equal(host.element.querySelector('tbody strong').textContent, 'Alpha');
    const input = host.element.querySelector('tbody input'); input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); await flush(); assert.deepEqual(selected, [['a']]);
    click(host.element.querySelectorAll('.st-dataTable__pagerBtn')[1]); await flush(); assert.deepEqual(pages, [2]); assert.equal(host.element.querySelector('tbody strong').textContent, 'Gamma');
  } finally { await host.close(); }
});

test('NavItem should notify its selection listener once per activation', async () => {
  const selected = [];
  const host = await mount('NavItem', { title: 'Item', onSelect: value => selected.push(value) });
  try { click(host.element.querySelector('.st-selectableRow')); await flush(); assert.deepEqual(selected, [true]); }
  finally { await host.close(); }
});

test('NavSection should notify its toggle listener once through Collapsible', async () => {
  const toggled = [];
  const host = await mount('NavSection', { label: 'Section', collapsible: true, onToggle: value => toggled.push(value) }, { slots: 'Body' });
  try { click(host.element.querySelector('.st-collapsible__trigger')); await flush(); assert.deepEqual(toggled, [false]); }
  finally { await host.close(); }
});

test('Popper should notify a placement listener once when it flips', async () => {
  const anchor = document.createElement('button'); document.body.append(anchor);
  anchor.getBoundingClientRect = () => ({ top: 750, left: 20, bottom: 770, right: 60, width: 40, height: 20 });
  const placements = [];
  const host = await mount('Popper', { anchor, open: true, onPlacementChange: value => placements.push(value) }, { slots: 'Panel' });
  try { assert.deepEqual(placements, ['top']); }
  finally { await host.close(); anchor.remove(); }
});

test('Icon and decoration glyphs should retain SVG namespaces in native Vapor', async () => {
  for (const [name, props] of [['Icon', { name: 'settings' }], ['CellDecorationIcon', { icon: 'circle-alert' }]]) {
    const host = await mount(name, props);
    try {
      const glyphs = host.element.querySelectorAll('svg path,svg circle,svg line');
      assert.ok(glyphs.length);
      for (const glyph of glyphs) assert.equal(glyph.namespaceURI, 'http://www.w3.org/2000/svg');
    } finally { await host.close(); }
  }
});
