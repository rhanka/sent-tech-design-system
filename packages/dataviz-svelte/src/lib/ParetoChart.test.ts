import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import ParetoChart from './ParetoChart.svelte';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'US', sales: 20 },
  { country: 'CA', sales: 5 },
  { country: 'FR', sales: 5 },
];

const newStore = () => createDashboardStore({ model, data });
const bars = (container: HTMLElement) => container.querySelectorAll('.st-paretoChart__bar').length;
const base = { viewId: 'pareto', category: 'country', measure: 'sales', label: 'Pareto ventes' };

describe('ParetoChart', () => {
  it('renders a design-system Pareto chart from cross-filtered rows', () => {
    const { container, getByRole, getByText } = render(ParetoChart, {
      props: { store: newStore(), ...base },
    });

    expect(getByRole('img', { name: 'Pareto ventes' })).toBeTruthy();
    expect(bars(container)).toBe(3);
    expect(container.querySelectorAll('.st-paretoChart__cumDot')).toHaveLength(3);
    expect(getByText(/US: 20/)).toBeTruthy();
  });

  it('rebuilds from this view cross-filter scope when filters change', async () => {
    const store = newStore();
    const { container, getByText, queryByText } = render(ParetoChart, {
      props: { store, ...base },
    });

    expect(bars(container)).toBe(3);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await tick();

    expect(bars(container)).toBe(1);
    expect(getByText(/FR: 15/)).toBeTruthy();
    expect(queryByText(/US: 20/)).toBeNull();
  });

  it('renders no Pareto marks when fields are unknown', () => {
    const { container, getByRole } = render(ParetoChart, {
      props: { store: newStore(), viewId: 'pareto', category: 'country', measure: 'missing', label: 'Vide' },
    });

    expect(getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(bars(container)).toBe(0);
  });
});
