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

it('should expose the installed dataviz adapter without claiming unconverted charts', () => {
  expect(dataviz.useDashboard).toBeTypeOf('function');
  expect(dataviz.provideDashboard).toBeTypeOf('function');
  if (vapor) expect(dataviz).not.toHaveProperty('DashboardGrid');
  else expect(dataviz.DashboardGrid).toBeDefined();
});
