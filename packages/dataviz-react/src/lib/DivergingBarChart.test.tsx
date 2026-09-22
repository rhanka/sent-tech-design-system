import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DivergingBarChart } from './DivergingBarChart.js';

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

describe('DivergingBarChart (react)', () => {
  it('renders a design-system divergent bar chart from cross-filtered rows', () => {
    const { container } = render(
      <DivergingBarChart
        store={newStore()}
        viewId="delta"
        category="region"
        measure="delta"
        label="Delta par region"
      />,
    );

    expect(screen.getByRole('img', { name: 'Delta par region' })).toBeTruthy();
    expect(bars(container)).toHaveLength(3);
    expect(container.querySelector('.st-divergentBarChart__bar--positive')).toBeTruthy();
    expect(container.querySelector('.st-divergentBarChart__bar--negative')).toBeTruthy();
    expect(container.querySelector('.st-divergentBarChart__bar--neutral')).toBeTruthy();
    expect(screen.getByText(/North: 15/)).toBeTruthy();
  });

  it('rebuilds from this view cross-filter scope when filters change', () => {
    const store = newStore();
    const { container } = render(
      <DivergingBarChart
        store={store}
        viewId="delta"
        category="region"
        measure="delta"
        label="Delta par region"
      />,
    );

    expect(bars(container)).toHaveLength(3);
    act(() => {
      store.setFilter('region', { kind: 'include', values: ['South'] });
    });

    expect(bars(container)).toHaveLength(1);
    expect(container.querySelector('.st-divergentBarChart__bar--negative')).toBeTruthy();
    expect(screen.getByText(/South: -8/)).toBeTruthy();
    expect(screen.queryByText(/North: 15/)).toBeNull();
  });

  it('renders no bars when fields are unknown', () => {
    const { container } = render(
      <DivergingBarChart
        store={newStore()}
        viewId="delta"
        category="missing"
        measure="delta"
        label="Vide"
      />,
    );

    expect(screen.getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(bars(container)).toHaveLength(0);
  });
});
