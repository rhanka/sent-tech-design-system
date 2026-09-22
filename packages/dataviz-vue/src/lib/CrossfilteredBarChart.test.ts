import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { CrossfilteredBarChart } from './CrossfilteredBarChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', product: 'A', sales: 10 },
  { country: 'FR', product: 'B', sales: 5 },
  { country: 'US', product: 'A', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' };
const chip = (w: ReturnType<typeof mount>, key: string) =>
  w.findAll('button.st-barChart__filterChip').find((b) => b.text().split(':')[0].trim() === key);

describe('CrossfilteredBarChart (vue)', () => {
  it('exposes the chart with its accessible label', () => {
    const w = mount(CrossfilteredBarChart, { props: { store: newStore(), ...base } });
    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Ventes par pays');
  });

  it('aggregates rows into one bar (and one selection chip) per distinct value', () => {
    const w = mount(CrossfilteredBarChart, { props: { store: newStore(), ...base } });
    expect(w.findAll('.st-barChart__bar')).toHaveLength(2);
    expect(chip(w, 'FR')?.exists()).toBe(true);
    expect(chip(w, 'US')?.exists()).toBe(true);
  });

  it('toggles this view selection when a bar chip is clicked (brushing input)', async () => {
    const store = newStore();
    const w = mount(CrossfilteredBarChart, { props: { store, ...base } });
    await chip(w, 'FR')!.trigger('click');
    expect(store.getState().selections.byCountry).toEqual(['FR']);
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', async () => {
    const store = newStore();
    const w = mount(CrossfilteredBarChart, { props: { store, ...base } });
    expect(w.findAll('.st-barChart__bar')).toHaveLength(2);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();
    expect(w.findAll('.st-barChart__bar')).toHaveLength(1);
    expect(chip(w, 'US')).toBeUndefined();
  });

  it('is output-only when selectable is false (no selection chips)', () => {
    const w = mount(CrossfilteredBarChart, { props: { store: newStore(), ...base, selectable: false } });
    expect(w.findAll('button.st-barChart__filterChip')).toHaveLength(0);
  });

  it('renders no bars when the measure or dimension is unknown', () => {
    const w1 = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'country', measure: 'nope', label: 'Vide' },
    });
    expect(w1.findAll('.st-barChart__bar')).toHaveLength(0);
    const w2 = mount(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'nope', measure: 'sales', label: 'Vide' },
    });
    expect(w2.findAll('.st-barChart__bar')).toHaveLength(0);
  });
});
