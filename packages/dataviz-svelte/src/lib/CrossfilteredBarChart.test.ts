import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import CrossfilteredBarChart from './CrossfilteredBarChart.svelte';

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
const bars = (c: HTMLElement) => c.querySelectorAll('.st-barChart__bar').length;
const baseProps = { viewId: 'byCountry', dimension: 'country', measure: 'sales', label: 'Ventes par pays' };

describe('CrossfilteredBarChart', () => {
  it('exposes the chart with its accessible label', () => {
    const { getByRole } = render(CrossfilteredBarChart, { props: { store: newStore(), ...baseProps } });
    expect(getByRole('img', { name: 'Ventes par pays' })).toBeTruthy();
  });

  it('aggregates rows into one bar (and one selection chip) per distinct value', () => {
    const { container, getByRole } = render(CrossfilteredBarChart, { props: { store: newStore(), ...baseProps } });
    expect(bars(container)).toBe(2);
    expect(getByRole('button', { name: /^FR:/ })).toBeTruthy();
    expect(getByRole('button', { name: /^US:/ })).toBeTruthy();
  });

  it('toggles this view selection when a bar chip is clicked (brushing input)', () => {
    const store = newStore();
    const { getByRole } = render(CrossfilteredBarChart, { props: { store, ...baseProps } });
    getByRole('button', { name: /^FR:/ }).click();
    expect(store.getState().selections.byCountry).toEqual(['FR']);
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', async () => {
    const store = newStore();
    const { container, queryByRole } = render(CrossfilteredBarChart, { props: { store, ...baseProps } });
    expect(bars(container)).toBe(2);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await tick();
    expect(bars(container)).toBe(1);
    expect(queryByRole('button', { name: /^US:/ })).toBeNull();
  });

  it('is output-only when selectable=false (no selection chips)', () => {
    const { queryByRole } = render(CrossfilteredBarChart, {
      props: { store: newStore(), ...baseProps, selectable: false },
    });
    expect(queryByRole('button', { name: /^FR:/ })).toBeNull();
  });

  it('renders no bars when the measure or dimension is unknown', () => {
    const { container: c1 } = render(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'country', measure: 'nope', label: 'Vide' },
    });
    expect(bars(c1)).toBe(0);
    const { container: c2 } = render(CrossfilteredBarChart, {
      props: { store: newStore(), viewId: 'v', dimension: 'nope', measure: 'sales', label: 'Vide' },
    });
    expect(bars(c2)).toBe(0);
  });
});
