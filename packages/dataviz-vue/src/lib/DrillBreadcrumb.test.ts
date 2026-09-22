import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import { DrillBreadcrumb } from './DrillBreadcrumb.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });
const base = { viewId: 'd', hierarchy: ['region', 'city'] };
const backButton = (w: ReturnType<typeof mount>) =>
  w.findAll('button').find((b) => b.text().trim() === 'Remonter');

describe('DrillBreadcrumb (vue)', () => {
  it('shows only the root level and no back button initially', () => {
    const w = mount(DrillBreadcrumb, { props: { store: newStore(), ...base } });
    expect(w.text()).toContain('Région');
    expect(backButton(w)).toBeUndefined();
  });

  it('shows the drilled trail and a back button after drilling', () => {
    const store = newStore();
    store.drillDown('d', 'city');
    const w = mount(DrillBreadcrumb, { props: { store, ...base } });
    expect(w.text()).toContain('Région');
    expect(w.text()).toContain('Ville');
    expect(backButton(w)?.exists()).toBe(true);
  });

  it('back pops the drill path and clears the level filter', async () => {
    const store = newStore();
    store.setFilter('region', { kind: 'include', values: ['Nord'] });
    store.drillDown('d', 'city');
    const w = mount(DrillBreadcrumb, { props: { store, ...base } });
    await backButton(w)!.trigger('click');
    expect(store.getState().drill.d ?? []).toEqual([]);
    expect(store.getState().filters.region).toBeUndefined();
  });
});
