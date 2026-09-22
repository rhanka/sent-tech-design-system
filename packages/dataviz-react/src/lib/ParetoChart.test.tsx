import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ParetoChart } from './ParetoChart.js';

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

describe('ParetoChart (react)', () => {
  it('renders a design-system Pareto chart from cross-filtered rows', () => {
    const { container } = render(
      <ParetoChart
        store={newStore()}
        viewId="pareto"
        category="country"
        measure="sales"
        label="Pareto ventes"
      />,
    );

    expect(screen.getByRole('img', { name: 'Pareto ventes' })).toBeTruthy();
    expect(bars(container)).toBe(3);
    expect(container.querySelectorAll('.st-paretoChart__cumDot')).toHaveLength(3);
    expect(screen.getByText(/US: 20/)).toBeTruthy();
  });

  it('rebuilds from this view cross-filter scope when filters change', () => {
    const store = newStore();
    const { container } = render(
      <ParetoChart
        store={store}
        viewId="pareto"
        category="country"
        measure="sales"
        label="Pareto ventes"
      />,
    );

    expect(bars(container)).toBe(3);
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });

    expect(bars(container)).toBe(1);
    expect(screen.getByText(/FR: 15/)).toBeTruthy();
    expect(screen.queryByText(/US: 20/)).toBeNull();
  });

  it('renders no Pareto marks when fields are unknown', () => {
    const { container } = render(
      <ParetoChart
        store={newStore()}
        viewId="pareto"
        category="country"
        measure="missing"
        label="Vide"
      />,
    );

    expect(screen.getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(bars(container)).toBe(0);
  });
});
