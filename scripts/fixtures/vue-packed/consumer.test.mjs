import { afterEach, expect, it } from 'vitest';
import * as Vue from 'vue';

const vapor = process.env.VUE_PACKED_MODE === 'vapor';
const ds = await import(vapor ? '@sentropic/design-system-vue/vapor' : '@sentropic/design-system-vue');
const dataviz = await import(vapor ? '@sentropic/dataviz-vue/vapor' : '@sentropic/dataviz-vue');
const editors = await import(vapor ? '@sentropic/design-system-vue/vapor/rich-text-editor' : '@sentropic/design-system-vue/rich-text-editor');
const presence = await import(vapor ? '@sentropic/design-system-vue/vapor/presence-badge' : '@sentropic/design-system-vue/presence-badge');
const apps = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); });

it('should mount the installed diagram SFC with the consumer runtime', () => {
  expect(Vue.version).toBe(vapor ? '3.6.0-rc.15' : '3.5.45');
  const root = document.createElement('div'); document.body.append(root);
  const app = (vapor ? Vue.createVaporApp : Vue.createApp)(ds.GraphLegend, { title: 'Installed legend', entries: [{ label: 'Nodes', shape: 'star' }] });
  apps.push(app); app.mount(root);
  expect(root.textContent).toContain('Installed legend'); expect(root.textContent).toContain('Nodes');
});

it('should expose the installed dataviz adapter without claiming unconverted charts', () => {
  expect(dataviz.useDashboard).toBeTypeOf('function');
  expect(dataviz.provideDashboard).toBeTypeOf('function');
  if (vapor) expect(dataviz).not.toHaveProperty('DashboardGrid');
  else expect(dataviz.DashboardGrid).toBeDefined();
});

const messages = { editorLabel: 'Installed editor', placeholder: 'Write', preservedBlockLabel: 'Preserved {kind}', externalConflictLabel: 'Conflict' };
for (const name of ['RichTextEditor', 'ComposerEditor']) {
  it(`should mount and capture the installed ${name} through its public subpath`, async () => {
    const root = document.createElement('div'); document.body.append(root);
    const value = name === 'RichTextEditor'
      ? { format: 'focus.markdown.p0@1', blocks: [{ paragraphId: 'p:1', kind: 'paragraph', text: 'Packed text' }] }
      : 'Packed text';
    const app = (vapor ? Vue.createVaporApp : Vue.createApp)(editors[name], { value, messages });
    apps.push(app); const handle = app.mount(root);
    await Vue.nextTick();
    expect(root.querySelector('[role="textbox"]').getAttribute('aria-label')).toBe('Installed editor');
    expect(root.textContent).toContain('Packed text');
    const capture = name === 'RichTextEditor' ? await handle.captureDocument() : await handle.captureComposer();
    expect(name === 'RichTextEditor' ? capture.document.blocks[0].text : capture.text).toBe('Packed text');
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

it('should expose every Classic runtime export from the installed Vapor barrel', async () => {
  if (!vapor) return;
  const classic = await import('@sentropic/design-system-vue');
  expect(Object.keys(ds).sort()).toEqual(Object.keys(classic).sort());
  for (const name of ['Menu', 'MenuPopover', 'OverflowMenu', 'DumbbellChart', 'ErrorBarChart', 'DependencyWheelChart', 'ArcDiagramChart', 'CellDecorationIcon']) expect(ds[name]).toBeDefined();
});
