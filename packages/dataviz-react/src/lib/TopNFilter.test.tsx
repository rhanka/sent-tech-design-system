import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type FilterSpec, type Row } from '@sentropic/dataviz-core';
import { TopNFilter } from './TopNFilter.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 30 },
  { country: 'US', sales: 50 },
  { country: 'DE', sales: 10 },
];

const newStore = () => createDashboardStore({ model, data });
const values = (spec: FilterSpec | undefined) =>
  spec && spec.kind === 'include' ? new Set(spec.values) : new Set<string>();

describe('TopNFilter (react)', () => {
  it('applies an include filter of the top-N values by measure on mount', () => {
    const store = newStore();
    render(<TopNFilter store={store} dimension="country" measure="sales" defaultN={2} />);
    expect(values(store.getState().filters.country)).toEqual(new Set(['US', 'FR']));
  });

  it('honours a different N', () => {
    const store = newStore();
    render(<TopNFilter store={store} dimension="country" measure="sales" defaultN={1} />);
    expect(values(store.getState().filters.country)).toEqual(new Set(['US']));
  });

  it('renders a labelled number input', () => {
    render(<TopNFilter store={newStore()} dimension="country" measure="sales" label="Top N pays" />);
    expect(screen.getByLabelText('Top N pays')).toBeTruthy();
  });
});
