import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { drillLevel, onDrillSelect } from './drill.js';
import { DrillChart } from './DrillChart.js';

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
const hierarchy = ['region', 'city'];
const base = { viewId: 'd', hierarchy, measure: 'sales', label: 'Ventes' };

const keys = (w: ReturnType<typeof mount>) =>
  w.findAll('button').map((b) => b.text().split(':')[0].trim());

describe('drill engine (vue)', () => {
  it('resolves the top level: first dimension, can drill, aggregated rows', () => {
    const store = newStore();
    const lvl = drillLevel(store, 'd', hierarchy, 'sales');
    expect(lvl.level).toBe(0);
    expect(lvl.dimension).toBe('region');
    expect(lvl.canDrill).toBe(true);
    expect(lvl.data).toEqual([
      { key: 'Nord', value: 22 },
      { key: 'Sud', value: 20 },
    ]);
  });

  it('resolves the leaf level after drilling: last dimension, cannot drill', () => {
    const store = newStore();
    onDrillSelect(store, 'd', hierarchy, 'Nord');
    const lvl = drillLevel(store, 'd', hierarchy, 'sales');
    expect(lvl.level).toBe(1);
    expect(lvl.dimension).toBe('city');
    expect(lvl.canDrill).toBe(false);
    expect(lvl.data).toEqual([
      { key: 'Lille', value: 15 },
      { key: 'Rouen', value: 7 },
    ]);
  });

  it('onDrillSelect advances the drill: pushes next dim + sets include filter', () => {
    const store = newStore();
    onDrillSelect(store, 'd', hierarchy, 'Nord');
    expect(store.getState().drill.d).toEqual(['city']);
    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['Nord'] });
  });

  it('onDrillSelect at the leaf toggles selection instead of drilling', () => {
    const store = newStore();
    onDrillSelect(store, 'd', hierarchy, 'Nord');
    onDrillSelect(store, 'd', hierarchy, 'Lille');
    expect(store.getState().selections.d).toEqual(['Lille']);
    expect(store.getState().drill.d).toEqual(['city']);
  });
});

describe('DrillChart (vue)', () => {
  it('renders the top level (bar) with the first hierarchy level', () => {
    const w = mount(DrillChart, { props: { store: newStore(), kind: 'bar', ...base } });
    expect(keys(w)).toContain('Nord');
    expect(keys(w)).toContain('Sud');
  });

  it('renders the top level (donut) with a drill-control per top-level key', () => {
    const w = mount(DrillChart, { props: { store: newStore(), kind: 'donut', ...base } });
    expect(keys(w)).toContain('Nord');
    expect(keys(w)).toContain('Sud');
  });

  it('renders the top level (treemap) with a drill-control per top-level key', () => {
    const w = mount(DrillChart, { props: { store: newStore(), kind: 'treemap', ...base } });
    expect(keys(w)).toContain('Nord');
    expect(keys(w)).toContain('Sud');
  });
});
