import { afterEach, expect, it, vi } from 'vitest';
import * as Vue from 'vue';

const vapor = process.env.VUE_PACKED_MODE === 'vapor';
const ds = await import(vapor ? '@sentropic/design-system-vue/vapor' : '@sentropic/design-system-vue');
const dataviz = await import(vapor ? '@sentropic/dataviz-vue/vapor' : '@sentropic/dataviz-vue');
const editors = await import(vapor ? '@sentropic/design-system-vue/vapor/rich-text-editor' : '@sentropic/design-system-vue/rich-text-editor');
const presence = await import(vapor ? '@sentropic/design-system-vue/vapor/presence-badge' : '@sentropic/design-system-vue/presence-badge');
const { parseFullMarkdown } = await import('@sentropic/design-system-rich-text');
const apps = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });

it('should mount the installed diagram SFC with the consumer runtime', () => {
  expect(Vue.version).toBe(vapor ? '3.6.0-rc.15' : '3.5.45');
  const root = document.createElement('div'); document.body.append(root);
  const app = (vapor ? Vue.createVaporApp : Vue.createApp)(ds.GraphLegend, { title: 'Installed legend', entries: [{ label: 'Nodes', shape: 'star' }] });
  apps.push(app); app.mount(root);
  expect(root.textContent).toContain('Installed legend'); expect(root.textContent).toContain('Nodes');
});

it('should expose the installed dataviz adapter and converted charts', () => {
  expect(dataviz.useDashboard).toBeTypeOf('function');
  expect(dataviz.provideDashboard).toBeTypeOf('function');
  for (const name of ['DashboardGrid', 'SelectionLegend', 'WebFrame', 'DataImage', 'ObjectLayerPanel', 'AreaChart', 'DrillChart']) expect(dataviz[name]).toBeDefined();
});

const messages = { editorLabel: 'Installed editor', placeholder: 'Write', preservedBlockLabel: 'Preserved {kind}', externalConflictLabel: 'Conflict' };
for (const name of ['RichTextEditor', 'ComposerEditor']) for (const profile of ['p0', 'full']) {
  it(`should mount and capture the installed ${name} ${profile} through its public subpath`, async () => {
    const root = document.createElement('div'); document.body.append(root);
    const value = name === 'RichTextEditor'
      ? profile === 'full' ? parseFullMarkdown('Packed text', () => 'p:1').document : { format: 'focus.markdown.p0@1', blocks: [{ paragraphId: 'p:1', kind: 'paragraph', text: 'Packed text' }] }
      : 'Packed text';
    const app = (vapor ? Vue.createVaporApp : Vue.createApp)(editors[name], { value, messages, profile });
    apps.push(app); const handle = app.mount(root);
    const capture = name === 'RichTextEditor' ? await handle.captureDocument() : await handle.captureComposer();
    expect(root.querySelector('[role="textbox"]').getAttribute('aria-label')).toBe('Installed editor');
    expect(root.textContent).toContain('Packed text');
    expect(name === 'RichTextEditor' ? capture.document.blocks[0].text ?? capture.document.blocks[0].segments.map(segment => segment.text ?? '').join('') : capture.text).toBe('Packed text');
  });
}

it('should mount the installed badge, labelled icon button and WebFrame', async () => {
  for (const [component, props, selector] of [
    [presence.LockPresenceBadge, { lock: null, presence: null, capabilities: { currentActorId: 'self', canAcquire: false, canRequestUnlock: false, canForceUnlock: false }, messages: {}, nowIso: '2026-11-13T12:00:00Z' }, '.st-presence-badge'],
    [ds.LabelledIconButton, { label: 'Comments', icon: 'comment' }, 'button[aria-label="Comments"]'],
    [ds.WebFrame, { frame: { src: 'https://example.com', title: 'Preview' } }, 'iframe[title="Preview"]'],
  ]) {
    const root = document.createElement('div'); document.body.append(root);
    const app = (vapor ? Vue.createVaporApp : Vue.createApp)(component, props);
    apps.push(app); app.mount(root); await Vue.nextTick();
    expect(root.querySelector(selector)).not.toBeNull();
  }
});

it('should preserve the DS WebFrame behavior through the dataviz SFC', async () => {
  const frames = [];
  for (const component of [ds.WebFrame, dataviz.WebFrame]) {
    const root = document.createElement('div'); document.body.append(root);
    const click = vi.fn();
    const app = (vapor ? Vue.createVaporApp : Vue.createApp)(component, {
      frame: { src: 'https://example.com', title: 'Preview', sandbox: ['allow-scripts'], allow: 'fullscreen' },
      id: 'consumer-frame', class: 'consumer', style: 'color: red', onClick: click,
    });
    apps.push(app); app.mount(root); await Vue.nextTick();
    const frame = root.querySelector('iframe');
    expect(frame).not.toBeNull(); frame.click(); expect(click).toHaveBeenCalledTimes(1);
    frames.push(frame.outerHTML);
  }
  expect(frames[1]).toBe(frames[0]);
});

it('should intercept idiomatic keydown once in capture phase through the packed composer subpath', async () => {
  const seen = vi.fn(() => true), root = document.createElement('div'); document.body.append(root);
  const app = (vapor ? Vue.createVaporApp : Vue.createApp)(editors.ComposerEditor,
    { value: 'Draft', messages, ...(vapor ? { onKeydown: () => seen } : { onKeydown: seen }) });
  apps.push(app); const handle = app.mount(root); await handle.captureComposer();
  const native = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); root.querySelector('.ProseMirror').dispatchEvent(native);
  expect(seen).toHaveBeenCalledTimes(1); expect(seen.mock.calls[0][0]).not.toBeInstanceOf(KeyboardEvent); expect(native.defaultPrevented).toBe(true); expect((await handle.captureComposer()).text).toBe('Draft');
});

it('should expose every Classic runtime export from the installed Vapor barrel', async () => {
  if (!vapor) return;
  const classic = await import('@sentropic/design-system-vue');
  expect(Object.keys(ds).sort()).toEqual(Object.keys(classic).sort());
  for (const name of ['Menu', 'MenuPopover', 'OverflowMenu', 'DumbbellChart', 'ErrorBarChart', 'DependencyWheelChart', 'ArcDiagramChart', 'CellDecorationIcon']) expect(ds[name]).toBeDefined();
});

it('should preserve every dataviz runtime export in the installed Vapor barrel', async () => {
  if (!vapor) return;
  const classic = await import('@sentropic/dataviz-vue');
  expect(Object.keys(dataviz).sort()).toEqual(Object.keys(classic).sort());
});

it('should mount the installed dataviz chart with the consumer runtime', async () => {
  const { createDashboardStore } = await import('@sentropic/dataviz-core');
  const store = createDashboardStore({ model: { dimensions: [{ id: 'name', label: 'Name', type: 'discrete' }], measures: [{ id: 'value', label: 'Value', aggregation: 'sum' }] }, data: [{ name: 'Alpha', value: 12 }] });
  const root = document.createElement('div'); document.body.append(root);
  const app = (vapor ? Vue.createVaporApp : Vue.createApp)(dataviz.CrossfilteredBarChart, { store, viewId: 'packed', dimension: 'name', measure: 'value', label: 'Installed chart' });
  apps.push(app); app.mount(root); await Vue.nextTick();
  expect(root.querySelector('svg')).toBeTruthy();
  expect(root.textContent).toContain('Alpha');
});
