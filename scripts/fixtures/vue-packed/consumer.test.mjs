import { afterEach, expect, it } from 'vitest';
import * as Vue from 'vue';

const vapor = process.env.VUE_PACKED_MODE === 'vapor';
const ds = await import(vapor ? '@sentropic/design-system-vue/vapor' : '@sentropic/design-system-vue');
const dataviz = await import(vapor ? '@sentropic/dataviz-vue/vapor' : '@sentropic/dataviz-vue');
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
