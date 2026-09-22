import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import DivergingBarChart from './DivergingBarChart.svelte';

const model: DataModel = {
  dimensions: [{ id: 'region', label: 'Region', type: 'discrete' }],
  measures: [{ id: 'delta', label: 'Delta', aggregation: 'sum' }],
};

const data: Row[] = [
  { region: 'North', delta: 12 },
  { region: 'South', delta: -8 },
  { region: 'West', delta: 0 },
  { region: 'North', delta: 3 },
];

const newStore = () => createDashboardStore({ model, data });
const bars = (container: HTMLElement) =>
  container.querySelectorAll('.st-divergentBarChart__bar');
const base = { viewId: 'delta', category: 'region', measure: 'delta', label: 'Delta par region' };

describe('DivergingBarChart', () => {
  it('renders a design-system divergent bar chart from cross-filtered rows', () => {
    const { container, getByRole, getByText } = render(DivergingBarChart, {
      props: { store: newStore(), ...base },
    });

    expect(getByRole('img', { name: 'Delta par region' })).toBeTruthy();
    expect(bars(container)).toHaveLength(3);
    expect(container.querySelector('.st-divergentBarChart__bar--positive')).toBeTruthy();
    expect(container.querySelector('.st-divergentBarChart__bar--negative')).toBeTruthy();
    expect(container.querySelector('.st-divergentBarChart__bar--neutral')).toBeTruthy();
    expect(getByText(/North: 15/)).toBeTruthy();
  });

  it('rebuilds from this view cross-filter scope when filters change', async () => {
    const store = newStore();
    const { container, getByText, queryByText } = render(DivergingBarChart, {
      props: { store, ...base },
    });

    expect(bars(container)).toHaveLength(3);
    store.setFilter('region', { kind: 'include', values: ['South'] });
    await tick();

    expect(bars(container)).toHaveLength(1);
    expect(container.querySelector('.st-divergentBarChart__bar--negative')).toBeTruthy();
    expect(getByText(/South: -8/)).toBeTruthy();
    expect(queryByText(/North: 15/)).toBeNull();
  });

  it('renders no bars when fields are unknown', () => {
    const { container, getByRole } = render(DivergingBarChart, {
      props: { store: newStore(), viewId: 'delta', category: 'missing', measure: 'delta', label: 'Vide' },
    });

    expect(getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(bars(container)).toHaveLength(0);
  });
});
