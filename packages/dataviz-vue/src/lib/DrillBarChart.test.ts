import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DrillBarChart } from './DrillBarChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { region: 'Nord', city: 'Lille', sales: 10 },
  { region: 'Nord', city: 'Lille', sales: 5 },
  { region: 'Nord', city: 'Rouen', sales: 7 },
  { region: 'Sud', city: 'Nice', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'd', hierarchy: ['region', 'city'], measure: 'sales', label: 'Ventes' };
const chip = (w: ReturnType<typeof mount>, key: string) =>
  w.findAll('button.st-barChart__filterChip').find((b) => b.text().split(':')[0].trim() === key);

describe('DrillBarChart (vue)', () => {
  it('groups by the first hierarchy level initially', () => {
    const w = mount(DrillBarChart, { props: { store: newStore(), ...base } });
    expect(chip(w, 'Nord')?.exists()).toBe(true);
    expect(chip(w, 'Sud')?.exists()).toBe(true);
  });

  it('drills down on bar click: filters the clicked value and pushes the next level', async () => {
    const store = newStore();
    const w = mount(DrillBarChart, { props: { store, ...base } });
    await chip(w, 'Nord')!.trigger('click');
    expect(store.getState().drill.d).toEqual(['city']);
    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['Nord'] });
  });

  it('shows the cities of the drilled value after drilling', async () => {
    const store = newStore();
    const w = mount(DrillBarChart, { props: { store, ...base } });
    await chip(w, 'Nord')!.trigger('click');
    await nextTick();
    expect(chip(w, 'Lille')?.exists()).toBe(true);
    expect(chip(w, 'Nice')).toBeUndefined();
  });

  it('toggles selection at the deepest level instead of drilling', async () => {
    const store = newStore();
    const w = mount(DrillBarChart, { props: { store, ...base } });
    await chip(w, 'Nord')!.trigger('click');
    await nextTick();
    await chip(w, 'Lille')!.trigger('click');
    expect(store.getState().selections.d).toEqual(['Lille']);
    expect(store.getState().drill.d).toEqual(['city']);
  });
});
