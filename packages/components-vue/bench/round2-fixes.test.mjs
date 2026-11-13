import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { bench, src, installSourceLoader } from './lib.mjs';
import { files, excluded, sfcSafety } from '../../../scripts/vue-vapor-source.mjs';

const mode = process.env.REVIEW_MODE ?? 'vapor';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Text', 'Comment', 'Document', 'DocumentFragment', 'MutationObserver', 'Event', 'CustomEvent'])
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
installSourceLoader(mode);
const vue = await import('vue');
const temporary = mkdtempSync(resolve(bench, '.tmp-round2-'));
let sequence = 0;
after(() => { dom.window.close(); rmSync(temporary, { recursive: true, force: true }); });
const flush = async () => { await vue.nextTick(); await new Promise(done => setTimeout(done, 0)); await vue.nextTick(); };
async function mount(name, props = {}, slots = '', copies = 1) {
  const element = document.createElement('div'); document.body.append(element);
  const state = vue.reactive({ props, show: true }); globalThis.__round2State = state;
  const file = resolve(temporary, `host-${sequence++}.vue`);
  writeFileSync(file, `<script setup lang="ts">import Target from '${pathToFileURL(resolve(src, name + '.vue')).href}';const state=(globalThis as any).__round2State;</script><template>${Array.from({ length: copies }, () => `<Target v-bind="state.props">${slots}</Target>`).join('')}</template>`);
  const { default: Host } = await import(pathToFileURL(file).href);
  const app = (mode === 'vapor' ? vue.createVaporApp : vue.createApp)(Host);
  const errors = []; app.config.warnHandler = e => errors.push(String(e)); app.config.errorHandler = e => errors.push(String(e));
  app.mount(element); await flush();
  return { element, state, props: state.props, async close() { app.unmount(); await flush(); element.remove(); assert.deepEqual(errors, []); } };
}

test('N1: Breadcrumb should render scoped linked and current rich labels without placeholder props', async () => {
  const h = await mount('Breadcrumb', { items: [{ href: '/' }, { current: true }] }, '<template #item-label="{item,index}"><strong>{{index}} {{item.current ? "Current" : "Home"}}</strong></template>');
  try { assert.equal(h.element.querySelector('a strong')?.textContent, '0 Home'); assert.equal(h.element.querySelector('[aria-current="page"] strong')?.textContent, '1 Current'); }
  finally { await h.close(); }
});
test('N2/B3: EmptyState should render slot-only title, message and actionable content and react to slot removal', async () => {
  const h = await mount('EmptyState', {}, '<template #title><strong>Empty</strong></template><template v-if="state.show" #message><em>Try again</em></template><template v-if="state.show" #action><button @click="state.show=false">Retry</button></template>');
  try {
    assert.equal(h.element.querySelector('h2 strong')?.textContent, 'Empty'); assert.ok(h.element.querySelector('p em'));
    const button = h.element.querySelector('.st-empty-state__action button'); assert.ok(button); button.click(); await flush();
    assert.equal(h.element.querySelector('.st-empty-state__action'), null); assert.equal(h.element.querySelector('p'), null);
  } finally { await h.close(); }
});
for (const [name, props] of [['Breadcrumb', { items: [{ label: vue.h('b', 'Legacy'), current: true }] }], ['Combobox', { options: [{ value: 'a', label: vue.h('b', 'Legacy') }], open: true, value: 'a' }], ['MultiSelect', { options: [{ value: 'a', label: vue.h('b', 'Legacy') }], open: true, value: ['a'] }], ['ChatComposer', { value: 'Draft', submitLabel: vue.h('b', 'Legacy') }], ['MessageStatusBadge', { status: 'sent', labels: { sent: vue.h('b', 'Legacy') } }]])
  test(`R2-M2: ${name} should keep non-scalar legacy content out of text, values and accessible names`, async () => {
    const h = await mount(name, props);
    try { assert.doesNotMatch(h.element.innerHTML, /\[object Object\]|__v_isVNode/); for (const input of h.element.querySelectorAll('input')) assert.doesNotMatch(input.value, /\[object Object\]/); }
    finally { await h.close(); }
  });
test('audit: MessageStatusBadge should expose a scoped rich label', async () => {
  const h = await mount('MessageStatusBadge', { status: 'sent' }, '<template #label="{status}"><strong>{{status}}</strong></template>');
  try { assert.equal(h.element.querySelector('strong')?.textContent, 'sent'); } finally { await h.close(); }
});
test('audit: Accordion should expose optional scoped item content for rich render callbacks', async () => {
  const h = await mount('Accordion', { items: [{ id: 'one', title: 'Panel' }], openIds: ['one'] }, '<template #item-content="{item,index}"><strong>{{item.title}} {{index}}</strong></template>');
  try { assert.equal(h.element.querySelector('[role="region"] strong')?.textContent, 'Panel 0'); } finally { await h.close(); }
});
test('audit: DatePicker should use its dialog-name fallback for a non-scalar legacy label', async () => {
  const h = await mount('DatePicker', { label: vue.h('b', 'Date'), openLabel: 'Choose date' });
  try { h.element.querySelector('.st-datepicker__trigger').click(); await flush(); assert.equal(h.element.querySelector('[role="dialog"]').getAttribute('aria-label'), 'Choose date'); }
  finally { await h.close(); }
});
test('audit: Toast should give slot-only queue items a scalar dismiss name', async () => {
  const h = await mount('Toast', { items: [{ id: 'one' }], onDismiss: () => {} }, '<template #title><strong>Rich</strong></template>');
  try { assert.equal(h.element.querySelector('button').getAttribute('aria-label'), 'Fermer'); } finally { await h.close(); }
});
for (const name of ['ChatMessage', 'MenuLabel']) test(`audit: ${name} should expose a named rich-content slot`, async () => {
  const slot = name === 'ChatMessage' ? 'content' : 'label';
  const h = await mount(name, {}, `<template #${slot}><strong>Rich</strong></template>`);
  try { assert.equal(h.element.querySelector('strong')?.textContent, 'Rich'); } finally { await h.close(); }
});
for (const variant of ['select', 'accordion']) test(`R2-M3: LanguageToggle ${variant} should forward late attrs, styles and listeners exactly once`, async () => {
  let calls = 0; const h = await mount('LanguageToggle', { variant, class: 'caller' });
  try {
    Object.assign(h.props, { 'data-late': 'one', style: 'color:red', onFocus: () => calls++ }); await flush();
    const target = h.element.querySelector(variant === 'select' ? 'select' : '.st-languageToggle');
    assert.equal(target.getAttribute('data-late'), 'one'); assert.equal(target.style.color, 'red'); assert.ok(target.classList.contains('caller'));
    target.dispatchEvent(new dom.window.FocusEvent('focus', { bubbles: true })); assert.equal(calls, 1);
    delete h.props['data-late']; await flush(); assert.equal(target.hasAttribute('data-late'), false);
  } finally { await h.close(); }
});
test('R2-M3: AppHeader should retain attrs while the compact drawer is open', async () => {
  let calls = 0; const h = await mount('AppHeader', { compact: true, menuOpen: true, id: 'header', style: 'color:red', onClick: () => calls++ }, '<template #drawer>Drawer</template>');
  try { const header = h.element.querySelector('header'); assert.equal(header.id, 'header'); assert.equal(header.style.color, 'red'); header.click(); assert.equal(calls, 1); }
  finally { await h.close(); }
});
test('R2-M3: MenuPopover should retain caller styles while positioning wins conflicting properties', async () => {
  const h = await mount('MenuPopover', { open: true, style: 'color:red;top:999px', items: [] }, 'Panel');
  try { const panel = h.element.querySelector('.st-menuPopover'); assert.equal(panel.style.color, 'red'); assert.equal(panel.style.top, '0px'); }
  finally { await h.close(); }
});
for (const name of ['Combobox', 'MultiSelect']) test(`R2-M4: ${name} should name its controls and listbox from a slot-only label`, async () => {
  const h = await mount(name, { options: [], open: true }, '<template #label><strong>Pick entries</strong></template>');
  try {
    for (const control of h.element.querySelectorAll('[role="combobox"], [role="group"], .st-multiSelect__trigger, [role="listbox"]')) {
      const id = control.getAttribute('aria-labelledby');
      const explicitLabel = name === 'Combobox' && control.getAttribute('role') === 'combobox' ? h.element.querySelector(`label[for="${control.id}"]`) : null;
      const label = id ? h.element.querySelector(`[id="${id}"]`) : explicitLabel;
      assert.ok(label?.textContent.includes('Pick entries'), control.outerHTML);
    }
  } finally { await h.close(); }
});
for (const [name, prop, selector, reference] of [['LanguageToggle', 'selectId', 'select', 'label'], ['AppHeader', 'drawerId', '.st-appHeader__drawer', '.st-appHeader__burgerButton']])
  test(`R2-m2: ${name} should update explicit ID relationships and restore its stable generated ID`, async () => {
    const h = await mount(name, { compact: true, menuOpen: true }, '<template #drawer>Drawer</template>');
    try { const auto = h.element.querySelector(selector).id; for (const id of ['caller-one', 'caller-two', undefined]) { h.props[prop] = id; await flush(); const expected = id ?? auto; assert.equal(h.element.querySelector(selector).id, expected); assert.equal(h.element.querySelector(reference).getAttribute(name === 'LanguageToggle' ? 'for' : 'aria-controls'), expected); } }
    finally { await h.close(); }
  });
test('R2-m2: LanguageToggle should emit each SVG class token once', async () => {
  const h = await mount('LanguageToggle', { variant: 'accordion' });
  try { for (const svg of h.element.querySelectorAll('svg')) { const tokens = svg.getAttribute('class').split(/\s+/); assert.equal(tokens.length, new Set(tokens).size); } }
  finally { await h.close(); }
});
test('R2-m3: EventFeedPanel siblings should have unique label IDs', async () => {
  const h = await mount('EventFeedPanel', { data: [], label: 'Events' }, '', 2);
  try { const labels = h.element.querySelectorAll('p'); assert.notEqual(labels[0].id, labels[1].id); } finally { await h.close(); }
});
test('R2-M1: Menu should omit empty component-icon wrappers without a replacement slot', async () => {
  const h = await mount('Menu', { items: [{ id: 'a', label: 'Action', icon: { render() {} } }] });
  try { assert.equal(h.element.querySelector('.st-menu__itemIcon'), null); } finally { await h.close(); }
});
test('R2-M1: Menu should preserve the absence of empty string icons', async () => {
  const h = await mount('Menu', { items: [{ id: 'a', label: 'Action', icon: '' }] });
  try { assert.equal(h.element.querySelector('.st-menu__itemIcon'), null); } finally { await h.close(); }
});
test('R2-M2: ChatComposer should preserve nullish defaults and explicit empty scalar labels', async () => {
  const h = await mount('ChatComposer', { value: 'Draft', submitLabel: null });
  try { assert.equal(h.element.querySelector('button').textContent, 'Send'); h.props.submitLabel = ''; await flush(); assert.equal(h.element.querySelector('button').textContent, ''); }
  finally { await h.close(); }
});
test('m5: Header and FileUploader should render reactive lists without singleton loops', async () => {
  for (const name of ['Header', 'FileUploader']) assert.doesNotMatch(readFileSync(resolve(src, name + '.vue'), 'utf8'), /v-for="\w+ in \[/);
  const h = await mount('FileUploader', { items: [{ id: 'a', name: 'First', size: 1024 }] });
  try { assert.match(h.element.textContent, /First/); h.props.items = [{ id: 'b', name: 'Second', size: 2048 }]; await flush(); assert.match(h.element.textContent, /Second/); assert.doesNotMatch(h.element.textContent, /First/); }
  finally { await h.close(); }
});
test('audit: all production SFCs should satisfy rich-content, attrs and unused Vue binding checks', () => {
  const errors = files(src).filter(f => f.endsWith('.vue') && !excluded.test(f)).flatMap(f => sfcSafety(readFileSync(f, 'utf8'), f).map(e => f + ': ' + e));
  assert.deepEqual(errors, []);
});

for (const [name, props, property, value] of [
  ['AppShell', { variant: 'workspace', panelResize: true, panelWidths: { navigationPanel: 200 } }, '--st-appShell-navigation-width', '111px'],
  ['AvatarGroup', { max: 3 }, '--st-avatar-group-max', '7'],
  ['ButtonGroup', { gap: 4 }, 'gap', '31px'],
  ['DashboardGrid', { tiles: [], columns: 4 }, '--st-dashboardGrid-columns', '7'],
  ['PanelStack', {}, '--st-component-panelStack-primaryMinBlockSize', '111px'],
  ['AspectRatio', {}, 'aspect-ratio', '2'],
  ['Divider', {}, 'margin-block', '31px'],
  ['Flex', {}, 'display', 'grid'],
  ['Stack', {}, 'display', 'grid'],
  ['Grid', {}, 'grid-template-columns', '1fr'],
  ['Col', {}, '--st-col-span', '7'],
  ['Row', {}, 'gap', '31px'],
  ['DataImage', { src: '/image.png', alt: '', width: 20 }, 'width', '111px'],
  ['NavItem', { title: 'Item' }, '--st-navItem-indent', '111px'],
]) for (const style of [`color:red;${property}:${value}`, { color: 'red', [property]: value }, [{ color: 'red' }, `${property}:${value}`]])
  test(`attrs audit: ${name} should preserve caller style precedence (${typeof style === 'string' ? 'string' : Array.isArray(style) ? 'array' : 'object'}) and late updates`, async () => {
    const h = await mount(name, { ...props, class: 'caller', style });
    try {
      const root = h.element.firstElementChild;
      assert.equal(root.style.color, 'red'); assert.equal(root.style.getPropertyValue(property), value); assert.ok(root.classList.contains('caller'));
      h.props.style = `color:blue;${property}:${value}`; await flush(); assert.equal(root.style.color, 'blue'); assert.equal(root.style.getPropertyValue(property), value);
    } finally { await h.close(); }
  });
test('attrs audit: Stack should accept styles added after its initial render', async () => {
  const h = await mount('Stack');
  try { h.props.style = 'color:red;display:grid'; await flush(); assert.equal(h.element.firstElementChild.style.color, 'red'); assert.equal(h.element.firstElementChild.style.display, 'grid'); }
  finally { await h.close(); }
});

// R3 baseline: origin/main Popper.vue binds attrs after class/style/keydown;
// OrderedList.ts/UnorderedList.ts render content and children recursively;
// Combobox.ts displays/searches scalar labels and emits option values.
// Slot-only inputs must retain those operations without placeholder rich props.
for (const style of ['position:fixed;top:999px;color:red', { position: 'fixed', top: '999px', color: 'red' }, [{ position: 'fixed' }, 'top:999px;color:red']])
  test(`R3: inline Popper should preserve caller precedence and late updates (${typeof style === 'string' ? 'string' : Array.isArray(style) ? 'array' : 'object'})`, async () => {
    const calls = [];
    const anchor = document.createElement('button'); document.body.append(anchor);
    const h = await mount('Popper', { anchor, open: true, portal: false, trapFocus: true, strategy: 'absolute', class: 'caller', style, onKeydown: event => calls.push(['first', event.defaultPrevented]) });
    try {
      const panel = h.element.querySelector('.st-popper');
      assert.equal(panel.className, 'st-popper caller');
      assert.equal(panel.style.position, 'fixed'); assert.equal(panel.style.top, '999px'); assert.equal(panel.style.color, 'red');
      panel.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
      assert.deepEqual(calls, [['first', true]]);
      h.props.style = 'position:relative;top:777px;color:blue'; h.props.class = 'updated';
      h.props.onKeydown = event => calls.push(['updated', event.defaultPrevented]);
      await flush();
      assert.equal(panel.className, 'st-popper updated'); assert.equal(panel.style.position, 'relative'); assert.equal(panel.style.top, '777px'); assert.equal(panel.style.color, 'blue');
      panel.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
      assert.deepEqual(calls, [['first', true], ['updated', true]]);
    } finally { await h.close(); anchor.remove(); }
  });

for (const name of ['OrderedList', 'UnorderedList']) test(`R3: ${name} should operate recursively with slot-only items and paths`, async () => {
  const paths = [];
  const h = await mount(name, { items: [{ children: [{ children: ['Leaf'] }] }], onPick: path => paths.push(path) }, '<template #item="{item,index,path}"><button @click="state.props.onPick(path)">{{path.join(".")}}:{{index}}:{{typeof item === "string" ? item : "Branch"}}</button></template>');
  try {
    const buttons = [...h.element.querySelectorAll('button')];
    assert.deepEqual(buttons.map(button => button.textContent), ['0:0:Branch', '0.0:0:Branch', '0.0.0:0:Leaf']);
    assert.equal(h.element.querySelectorAll('[class$="--nested"]').length, 2);
    buttons[2].click(); await flush(); assert.deepEqual(paths, [[0, 0, 0]]);
    h.props.items = [{ children: ['Replacement', 'Sibling'] }]; await flush();
    assert.deepEqual([...h.element.querySelectorAll('button')].map(button => button.textContent), ['0:0:Branch', '0.0:0:Replacement', '0.1:1:Sibling']);
  } finally { await h.close(); }
});

for (const controlled of [true, false]) test(`R3: Combobox should display, search, select and clear slot-only options (${controlled ? 'controlled' : 'local'})`, async () => {
  const changes = [], selections = [], models = [];
  const props = { options: [{ value: 'a' }, { value: 'b' }, { value: 'blocked', disabled: true }], allowCustomValue: false,
    onChange: value => changes.push(value), onSelect: value => selections.push(value), 'onUpdate:modelValue': value => models.push(value) };
  if (controlled) props.value = 'a';
  const h = await mount('Combobox', props, '<template #option-label="{option}"><strong>Rich {{option.value}}</strong></template>');
  try {
    const input = h.element.querySelector('input');
    input.dispatchEvent(new window.FocusEvent('focus')); await flush();
    const selected = () => [...h.element.querySelectorAll('[aria-selected="true"]')].map(option => option.textContent);
    assert.equal(input.value, controlled ? 'a' : ''); assert.deepEqual(selected(), controlled ? ['Rich a'] : []);
    input.value = 'b'; input.dispatchEvent(new window.Event('input', { bubbles: true })); await flush();
    assert.deepEqual([...h.element.querySelectorAll('[role="option"] strong')].map(option => option.textContent), ['Rich b', 'Rich blocked']);
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); await flush();
    assert.equal(document.getElementById(input.getAttribute('aria-activedescendant'))?.textContent, 'Rich b');
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await flush();
    assert.deepEqual(changes, ['b']); assert.deepEqual(selections, ['b']); assert.deepEqual(models, ['b']);
    if (controlled) { h.props.value = 'b'; await flush(); }
    assert.equal(input.value, 'b');
    h.element.querySelector('.st-combobox__toggle').click(); await flush(); assert.deepEqual(selected(), ['Rich b']);
    h.element.querySelector('[aria-disabled="true"]').dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true })); await flush();
    assert.deepEqual(selections, ['b']);
    h.element.querySelector('.st-combobox__clear').click();
    if (controlled) h.props.value = '';
    await flush(); assert.equal(input.value, ''); assert.deepEqual(selected(), []); assert.deepEqual(changes, ['b', '']); assert.deepEqual(models, ['b', '']);
  } finally { await h.close(); }
});

test('R3: EmptyState should omit absent titles and react to title props and slots', async () => {
  const h = await mount('EmptyState', { message: 'No entries' }, '<template v-if="state.show" #title><strong>Slot title</strong></template>');
  try {
    assert.equal(h.element.querySelector('h2 strong')?.textContent, 'Slot title');
    h.state.show = false; await flush(); assert.equal(h.element.querySelector('h2'), null);
    h.props.title = 'Prop title'; await flush(); assert.equal(h.element.querySelector('h2')?.textContent, 'Prop title');
    h.props.title = undefined; await flush(); assert.equal(h.element.querySelector('h2'), null);
    assert.equal(h.element.querySelector('p')?.textContent, 'No entries');
  } finally { await h.close(); }
});
